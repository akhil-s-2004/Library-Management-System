package com.library.service;

import com.library.dto.request.BorrowRequest;
import com.library.entity.*;
import com.library.enums.CopyStatus;
import com.library.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KioskService {

        private final UserRepository userRepository;
        private final PhysicalCopyRepository copyRepository;
        private final IssueRepository issueRepository;
        private final FineRepository fineRepository;
        private final ReservationRepository reservationRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthorRepository authorRepository;
        private final BookAuthorRepository bookAuthorRepository;

        private static final int MAX_BOOKS_NORMAL = 2;
        private static final int BORROW_DAYS = 14;
        private static final int RESERVATION_HOURS = 24;
        private static final BigDecimal FINE_PER_DAY = BigDecimal.valueOf(10);

        // 🔵 BORROW LOGIC
        @Transactional
        public String borrowBook(BorrowRequest request) {
                expireReservations();

                User user = validateUser(request.getEmail(), request.getPassword());

                // 4️⃣ Check borrow limit
                long activeCount = issueRepository.countByUserIdAndStatus(
                                user.getUserId(), "active");

                if (activeCount >= MAX_BOOKS_NORMAL) {
                        throw new RuntimeException("Borrow limit reached");
                }

                // 5️⃣ Find copy
                PhysicalCopy copy = copyRepository.findById(request.getCopyId())
                                .orElseThrow(() -> new RuntimeException("Copy not found"));
                Optional<Reservation> firstReservation =
                        reservationRepository
                                .findFirstByBookIdAndStatusAndExpiresAtAfterOrderByReservationDateAsc(
                                        copy.getBook().getBookId(),
                                        "active",
                                        LocalDateTime.now());

                if (firstReservation.isPresent() &&
                        !firstReservation.get().getUserId().equals(user.getUserId())) {

                throw new RuntimeException("Book reserved by another member");
                }
                if (copy.getStatus() == CopyStatus.RESERVED) {
                        Reservation reservation = reservationRepository
                                        .findFirstByUserIdAndBookIdAndStatusAndExpiresAtAfterOrderByReservationDateAsc(
                                                        user.getUserId(),
                                                        copy.getBook().getBookId(),
                                                        "active",
                                                        LocalDateTime.now())
                                        .orElseThrow(() -> new RuntimeException("Copy is reserved for another member"));

                        reservation.setStatus("fulfilled");
                        reservationRepository.save(reservation);
                } else if (copy.getStatus() != CopyStatus.AVAILABLE) {
                        throw new RuntimeException("Copy not available");
                }

                // 7️⃣ Create issue record
                LocalDate today = LocalDate.now();

                IssueRecord issue = IssueRecord.builder()
                                .userId(user.getUserId())
                                .copyId(copy.getCopyId())
                                .borrowDate(today)
                                .dueDate(today.plusDays(BORROW_DAYS))
                                .status("active")
                                .createdAt(LocalDateTime.now())
                                .build();

                issueRepository.save(issue);

                // 8️⃣ Update copy status
                copy.setStatus(CopyStatus.ISSUED);
                copyRepository.save(copy);

                return "Book borrowed successfully. Due date: " + issue.getDueDate();
        }

        // 🔵 RETURN LOGIC (No login required)
        @Transactional
        public String returnBook(Long copyId) {
                expireReservations();

                IssueRecord issue = issueRepository.findByCopyIdAndStatus(copyId, "active")
                                .orElseThrow(() -> new RuntimeException("No active issue found"));

                LocalDate today = LocalDate.now();

                issue.setReturnDate(today);
                issue.setStatus("returned");

                PhysicalCopy copy = copyRepository.findById(copyId)
                                .orElseThrow(() -> new RuntimeException("Copy not found"));

                Long bookId = copy.getBook().getBookId();
                copy.setStatus(CopyStatus.AVAILABLE);
                copyRepository.save(copy);

                promoteNextReservationForBook(bookId);

                PhysicalCopy updatedCopy = copyRepository.findById(copyId)
                                .orElseThrow(() -> new RuntimeException("Copy not found"));

                // If returned after due date, create/update fine based on actual return date.
                // The scheduler handles daily accrual for still-active issues;
                // this handles the moment of return so no overdue day is ever missed.
                if (today.isAfter(issue.getDueDate())) {
                        long overdueDays = ChronoUnit.DAYS.between(issue.getDueDate(), today);
                        BigDecimal fineAmount = FINE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));
                        Optional<Fine> existingFine = fineRepository.findByIssueId(issue.getIssueId());
                        if (existingFine.isPresent()) {
                                Fine fine = existingFine.get();
                                if ("unpaid".equalsIgnoreCase(fine.getPaidStatus())) {
                                        fine.setAmount(fineAmount);
                                        fineRepository.save(fine);
                                }
                        } else {
                                fineRepository.save(Fine.builder()
                                                .issueId(issue.getIssueId())
                                                .amount(fineAmount)
                                                .paidStatus("unpaid")
                                                .build());
                        }
                }

                issueRepository.save(issue);

                if (updatedCopy.getStatus() == CopyStatus.RESERVED) {
                        return "Book returned successfully and reserved for the next member for 24 hours";
                }

                return "Book returned successfully";
        }

        private User validateUser(String email, String password) {
                User user = userRepository
                                .findByEmail(email.trim())
                                .orElseThrow(() -> new RuntimeException("Invalid email"));

                if (user.getPasswordHash() == null ||
                                !passwordEncoder.matches(password.trim(), user.getPasswordHash())) {
                        throw new RuntimeException("Invalid password");
                }

                if (!user.getStatus().equalsIgnoreCase("active")) {
                        throw new RuntimeException("User not active");
                }

                return user;
        }

        private void expireReservations() {
                List<Reservation> expiredReservations = reservationRepository.findByStatusAndExpiresAtBefore("active",
                                LocalDateTime.now());

                for (Reservation reservation : expiredReservations) {
                        reservation.setStatus("expired");
                        reservationRepository.save(reservation);

                        Optional<PhysicalCopy> reservedCopy = copyRepository
                                        .findFirstByBookBookIdAndStatus(reservation.getBookId(), CopyStatus.RESERVED);

                        reservedCopy.ifPresent(copy -> {
                                copy.setStatus(CopyStatus.AVAILABLE);
                                copyRepository.save(copy);
                        });

                        promoteNextReservationForBook(reservation.getBookId());
                }
        }

        private void promoteNextReservationForBook(Long bookId) {
                Optional<PhysicalCopy> availableCopy = copyRepository.findFirstByBookBookIdAndStatus(bookId,
                                CopyStatus.AVAILABLE);

                if (availableCopy.isEmpty()) {
                        return;
                }

                Optional<Reservation> nextReservation = reservationRepository
                                .findFirstByBookIdAndStatusAndExpiresAtAfterOrderByReservationDateAsc(
                                                bookId,
                                                "active",
                                                LocalDateTime.now());

                if (nextReservation.isEmpty()) {
                        return;
                }

                Reservation reservation = nextReservation.get();
                reservation.setExpiresAt(LocalDateTime.now().plusHours(RESERVATION_HOURS));
                reservationRepository.save(reservation);

                PhysicalCopy copy = availableCopy.get();
                copy.setStatus(CopyStatus.RESERVED);
                copyRepository.save(copy);
        }

        // --- NEW INFORMATION ENDPOINTS FOR CONFIRMATION MODALS ---

        public Map<String, Object> getCopyDetails(Long copyId) {
                PhysicalCopy copy = copyRepository.findById(copyId)
                                .orElseThrow(() -> new RuntimeException("Copy not found"));

                // We only allow borrowing if it's available
                if (copy.getStatus() != CopyStatus.AVAILABLE) {
                        throw new RuntimeException("Copy is not available for borrowing currently.");
                }

                List<Long> authorIds = bookAuthorRepository.findByIdBookId(copy.getBook().getBookId())
                                .stream().map(ba -> ba.getId().getAuthorId()).collect(Collectors.toList());
                String authorList = authorRepository.findAllById(authorIds)
                                .stream().map(Author::getAuthorName).collect(Collectors.joining(", "));

                Map<String, Object> response = new HashMap<>();
                response.put("copyId", copy.getCopyId());
                response.put("title", copy.getBook().getTitle());
                response.put("author", authorList);
                response.put("publisher", copy.getBook().getPublisher());
                response.put("isbn", copy.getBook().getIsbn());

                return response;
        }

        public Map<String, Object> getIssueDetails(Long copyId) {
                // To return, the book must have an active issue
                IssueRecord issue = issueRepository.findByCopyIdAndStatus(copyId, "active")
                                .orElseThrow(() -> new RuntimeException(
                                                "This copy is not currently issued to anyone."));

                PhysicalCopy copy = copyRepository.findById(copyId)
                                .orElseThrow(() -> new RuntimeException("Copy not found"));

                User user = userRepository.findById(issue.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Long> authorIds = bookAuthorRepository.findByIdBookId(copy.getBook().getBookId())
                                .stream().map(ba -> ba.getId().getAuthorId()).collect(Collectors.toList());
                String authorList = authorRepository.findAllById(authorIds)
                                .stream().map(Author::getAuthorName).collect(Collectors.joining(", "));

                Map<String, Object> response = new HashMap<>();
                response.put("copyId", copy.getCopyId());
                response.put("title", copy.getBook().getTitle());
                response.put("author", authorList);
                response.put("memberId", user.getMembershipNumber());
                response.put("borrowedBy", user.getName());
                response.put("borrowedDate", issue.getBorrowDate());
                response.put("dueDate", issue.getDueDate());

                return response;
        }
}
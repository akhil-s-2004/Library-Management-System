package com.library.service;

import com.library.dto.request.MemberReserveRequest;
import com.library.dto.request.SetPinRequest;
import com.library.dto.request.UpdatePinRequest;
import com.library.dto.request.UpdateProfileRequest;
import com.library.dto.request.ContactRequest;
import com.library.entity.Author;
import com.library.entity.Fine;
import com.library.entity.IssueRecord;
import com.library.entity.PhysicalCopy;
import com.library.entity.Reservation;
import com.library.entity.User;
import com.library.enums.CopyStatus;
import com.library.repository.AuthorRepository;
import com.library.repository.BookAuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.IssueRepository;
import com.library.repository.PhysicalCopyRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

        private final UserRepository userRepository;
        private final BookRepository bookRepository;
        private final PhysicalCopyRepository copyRepository;
        private final ReservationRepository reservationRepository;
        private final IssueRepository issueRepository;
        private final FineRepository fineRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthorRepository authorRepository;
        private final BookAuthorRepository bookAuthorRepository;
        private final MailService mailService;

        private static final int RESERVATION_HOURS = 24;
        private static final int WAITLIST_YEARS = 10;

        public String setPin(SetPinRequest request) {
                User user = getAuthenticatedUser();

                String encodedPin = passwordEncoder.encode(request.getPin().trim());

                user.setPinHash(encodedPin);

                userRepository.save(user);

                return "PIN set successfully";
        }

        public String updatePin(UpdatePinRequest request) {
                User user = getAuthenticatedUser();

                if (user.getPinHash() == null) {
                        throw new RuntimeException("PIN is not set yet. Use set-pin first");
                }

                if (!passwordEncoder.matches(request.getCurrentPin().trim(), user.getPinHash())) {
                        throw new RuntimeException("Current PIN is incorrect");
                }

                if (request.getCurrentPin().trim().equals(request.getNewPin().trim())) {
                        throw new RuntimeException("New PIN must be different from current PIN");
                }

                user.setPinHash(passwordEncoder.encode(request.getNewPin().trim()));
                userRepository.save(user);

                return "PIN updated successfully";
        }

        public Map<String, Object> getProfile() {
                User user = getAuthenticatedUser();

                Map<String, Object> response = new HashMap<>();
                response.put("user_id", user.getUserId());
                response.put("membership_number", user.getMembershipNumber());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                response.put("phone", user.getPhone());
                response.put("role", user.getRole());
                response.put("status", user.getStatus());
                response.put("hasPin", user.getPinHash() != null);
                return response;
        }

        public Map<String, Object> getDashboard() {
                User user = getAuthenticatedUser();

                long activeReads = issueRepository.countByUserIdAndStatus(user.getUserId(), "active");
                long totalReads = issueRepository.countByUserId(user.getUserId());
                long activeReservations = reservationRepository
                                .findByUserIdAndStatusOrderByReservationDateDesc(user.getUserId(), "active")
                                .size();

                List<IssueRecord> issues = issueRepository.findByUserIdOrderByBorrowDateDesc(user.getUserId());
                List<Long> issueIds = issues.stream().map(IssueRecord::getIssueId).toList();
                List<Fine> fines = fineRepository.findByIssueIdIn(issueIds);
                Set<Long> issueIdsWithFine = fines.stream().map(Fine::getIssueId).collect(Collectors.toSet());

                BigDecimal unpaidFines = fines.stream()
                                .filter(f -> "unpaid".equalsIgnoreCase(f.getPaidStatus()))
                                .map(Fine::getAmount)
                                .filter(amount -> amount != null)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Add real-time pending fines for overdue active issues not yet in DB
                LocalDate today = LocalDate.now();
                for (IssueRecord issue : issues) {
                        if ("active".equals(issue.getStatus())
                                        && issue.getDueDate() != null
                                        && today.isAfter(issue.getDueDate())
                                        && !issueIdsWithFine.contains(issue.getIssueId())) {
                                long overdueDays = ChronoUnit.DAYS.between(issue.getDueDate(), today);
                                unpaidFines = unpaidFines.add(BigDecimal.valueOf(10).multiply(BigDecimal.valueOf(overdueDays)));
                        }
                }

                Map<String, Object> response = new HashMap<>();
                response.put("active_reads", activeReads);
                response.put("total_reads", totalReads);
                response.put("active_reservations", activeReservations);
                response.put("unpaid_fines", unpaidFines);

                return response;
        }

        public Map<String, Object> getMembershipStatus() {
                User user = getAuthenticatedUser();
                Map<String, Object> response = new HashMap<>();
                response.put("membership_number", user.getMembershipNumber());
                response.put("status", user.getStatus());
                response.put("membership_type", "STANDARD");
                return response;
        }

        public List<Map<String, Object>> getIssues(String status) {
                User user = getAuthenticatedUser();
                List<IssueRecord> records;
                if (status == null || status.isBlank()) {
                        records = issueRepository.findByUserIdOrderByBorrowDateDesc(user.getUserId());
                } else {
                        records = issueRepository.findByUserIdAndStatusOrderByBorrowDateDesc(user.getUserId(),
                                        status.trim().toLowerCase());
                }

                return records.stream().map(record -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("issueId", record.getIssueId());
                        map.put("borrowDate", record.getBorrowDate());
                        map.put("dueDate", record.getDueDate());
                        map.put("returnDate", record.getReturnDate());
                        map.put("status", record.getStatus());
                        map.put("renewed", Boolean.TRUE.equals(record.getRenewed()));

                        PhysicalCopy copy = copyRepository.findById(record.getCopyId()).orElse(null);
                        if (copy != null) {
                                Map<String, Object> bookMap = new HashMap<>();
                                bookMap.put("bookId", copy.getBook().getBookId());
                                bookMap.put("title", copy.getBook().getTitle());
                                // Get Authors
                                List<Long> authorIds = (List<Long>) bookAuthorRepository
                                                .findByIdBookId(copy.getBook().getBookId())
                                                .stream().map(ba -> ba.getId().getAuthorId()).toList();
                                String authors = authorRepository.findAllById(authorIds)
                                                .stream().map(a -> a.getAuthorName()).collect(Collectors.joining(", "));
                                bookMap.put("author", authors);
                                bookMap.put("coverImageUrl", copy.getBook().getCoverImageUrl());
                                map.put("book", bookMap);
                        }
                        return map;
                }).collect(Collectors.toList());
        }

        public List<Map<String, Object>> getReservations() {
                User user = getAuthenticatedUser();
                List<Reservation> reservations = reservationRepository
                                .findByUserIdAndStatusOrderByReservationDateDesc(user.getUserId(), "active");

                return reservations.stream().map(res -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("reservationId", res.getReservationId());
                        map.put("reservationDate", res.getReservationDate());
                        map.put("status", res.getStatus());
                        map.put("expiresAt", res.getExpiresAt());

                        bookRepository.findById(res.getBookId()).ifPresent(book -> {
                                Map<String, Object> bookMap = new HashMap<>();
                                bookMap.put("bookId", book.getBookId());
                                bookMap.put("title", book.getTitle());
                                // Get Authors
                                List<Long> authorIds = (List<Long>) bookAuthorRepository
                                                .findByIdBookId(book.getBookId())
                                                .stream().map(ba -> ba.getId().getAuthorId()).toList();
                                String authors = authorRepository.findAllById(authorIds)
                                                .stream().map(a -> a.getAuthorName()).collect(Collectors.joining(", "));
                                bookMap.put("author", authors);
                                bookMap.put("coverImageUrl", book.getCoverImageUrl());
                                map.put("book", bookMap);
                        });
                        return map;
                }).collect(Collectors.toList());
        }

        @Transactional
        public String cancelReservation(Long reservationId) {
                User user = getAuthenticatedUser();
                Reservation reservation = reservationRepository.findById(reservationId)
                                .orElseThrow(() -> new RuntimeException("Reservation not found"));

                if (!reservation.getUserId().equals(user.getUserId())) {
                        throw new RuntimeException("Cannot cancel another user's reservation");
                }

                if (!"active".equalsIgnoreCase(reservation.getStatus())) {
                        throw new RuntimeException("Only active reservations can be cancelled");
                }

                reservation.setStatus("cancelled");
                reservationRepository.save(reservation);

                Optional<PhysicalCopy> reservedCopy = copyRepository
                                .findFirstByBookBookIdAndStatus(reservation.getBookId(), CopyStatus.RESERVED);

                reservedCopy.ifPresent(copy -> {
                        copy.setStatus(CopyStatus.AVAILABLE);
                        copyRepository.save(copy);
                });

                promoteNextReservationForBook(reservation.getBookId());

                return "Reservation cancelled";
        }

        public List<Map<String, Object>> getFines() {
                User user = getAuthenticatedUser();
                List<IssueRecord> issues = issueRepository.findByUserIdOrderByBorrowDateDesc(user.getUserId());
                List<Long> issueIds = issues.stream().map(IssueRecord::getIssueId).toList();
                List<Fine> fines = fineRepository.findByIssueIdIn(issueIds);
                Set<Long> issueIdsWithFine = fines.stream().map(Fine::getIssueId).collect(Collectors.toSet());

                List<Map<String, Object>> result = new ArrayList<>();

                // 1. Enrich existing fine DB records
                for (Fine fine : fines) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("fineId", fine.getFineId());
                        map.put("amount", fine.getAmount());
                        map.put("paidStatus", fine.getPaidStatus());
                        map.put("paidDate", fine.getPaymentDate());

                        IssueRecord issue = issueRepository.findById(fine.getIssueId()).orElse(null);
                        if (issue != null) {
                                // Use returnDate for returned books, today for still-active ones
                                LocalDate compareDate = (issue.getReturnDate() != null)
                                                ? issue.getReturnDate() : LocalDate.now();
                                long overdueDays = 0;
                                if (issue.getDueDate() != null && compareDate.isAfter(issue.getDueDate())) {
                                        overdueDays = ChronoUnit.DAYS.between(issue.getDueDate(), compareDate);
                                }
                                map.put("dueDate", issue.getDueDate());
                                map.put("overdueDays", overdueDays);
                                map.put("issueDate", issue.getBorrowDate());

                                PhysicalCopy copy = copyRepository.findById(issue.getCopyId()).orElse(null);
                                if (copy != null) {
                                        map.put("book", buildBookMap(copy));
                                }
                        }
                        result.add(map);
                }

                // 2. Real-time pending entries for overdue active issues not yet in DB
                //    (edge case: overdue started today before midnight scheduler runs)
                LocalDate today = LocalDate.now();
                for (IssueRecord issue : issues) {
                        if ("active".equals(issue.getStatus())
                                        && issue.getDueDate() != null
                                        && today.isAfter(issue.getDueDate())
                                        && !issueIdsWithFine.contains(issue.getIssueId())) {
                                long overdueDays = ChronoUnit.DAYS.between(issue.getDueDate(), today);
                                Map<String, Object> map = new HashMap<>();
                                map.put("fineId", null);
                                map.put("amount", BigDecimal.valueOf(10).multiply(BigDecimal.valueOf(overdueDays)));
                                map.put("paidStatus", "unpaid");
                                map.put("paidDate", null);
                                map.put("dueDate", issue.getDueDate());
                                map.put("overdueDays", overdueDays);
                                map.put("issueDate", issue.getBorrowDate());

                                PhysicalCopy copy = copyRepository.findById(issue.getCopyId()).orElse(null);
                                if (copy != null) {
                                        map.put("book", buildBookMap(copy));
                                }
                                result.add(map);
                        }
                }

                return result;
        }

        private Map<String, Object> buildBookMap(PhysicalCopy copy) {
                List<Long> authorIds = bookAuthorRepository.findByIdBookId(copy.getBook().getBookId())
                                .stream().map(ba -> ba.getId().getAuthorId()).toList();
                String authors = authorRepository.findAllById(authorIds)
                                .stream().map(Author::getAuthorName)
                                .collect(Collectors.joining(", "));
                Map<String, Object> bookMap = new HashMap<>();
                bookMap.put("title", copy.getBook().getTitle());
                bookMap.put("author", authors);
                bookMap.put("coverImageUrl", copy.getBook().getCoverImageUrl());
                return bookMap;
        }

        @Transactional
        public String reserveBook(MemberReserveRequest request) {
                expireReservations();

                User user = getAuthenticatedUser();

                if (!"active".equalsIgnoreCase(user.getStatus())) {
                        throw new RuntimeException("Your account is not active. Reservations are not allowed.");
                }
                if (reservationRepository.existsActiveReservation(
                                user.getUserId())) {
                        throw new RuntimeException("Only one active reservation is allowed per user");
                }

                Long bookId = request.getBookId();
                if (!bookRepository.existsById(bookId)) {
                        throw new RuntimeException("Book not found");
                }

                promoteNextReservationForBook(bookId);

                if (reservationRepository.existsByUserIdAndBookIdAndStatusAndExpiresAtAfter(
                                user.getUserId(),
                                bookId,
                                "active",
                                LocalDateTime.now())) {
                        throw new RuntimeException("You already have an active reservation for this book");
                }

                Optional<PhysicalCopy> availableCopy = copyRepository.findFirstByBookBookIdAndStatus(bookId,
                                CopyStatus.AVAILABLE);

                if (availableCopy.isPresent()) {
                        Reservation reservation = Reservation.builder()
                                        .userId(user.getUserId())
                                        .bookId(bookId)
                                        .reservationDate(LocalDateTime.now())
                                        .status("active")
                                        .expiresAt(LocalDateTime.now().plusHours(RESERVATION_HOURS))
                                        .build();

                        reservationRepository.save(reservation);

                        PhysicalCopy copy = availableCopy.get();
                        copy.setStatus(CopyStatus.RESERVED);
                        copyRepository.save(copy);

                        return "Book reserved successfully for 24 hours";
                }

                Reservation reservation = Reservation.builder()
                                .userId(user.getUserId())
                                .bookId(bookId)
                                .reservationDate(LocalDateTime.now())
                                .status("active")
                                .expiresAt(LocalDateTime.now().plusYears(WAITLIST_YEARS))
                                .build();

                reservationRepository.save(reservation);

                return "Book is currently unavailable. Added to queue, and you will get 24 hours once a copy is available";
        }

        private User getAuthenticatedUser() {
                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                if (authentication == null ||
                                !authentication.isAuthenticated() ||
                                authentication instanceof AnonymousAuthenticationToken) {
                        throw new RuntimeException("User not authenticated");
                }

                String email = authentication.getName();

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
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

        @Transactional
        public String renewIssue(Long issueId) {
                User user = getAuthenticatedUser();
                IssueRecord issue = issueRepository.findById(issueId)
                                .orElseThrow(() -> new RuntimeException("Issue not found"));

                if (!issue.getUserId().equals(user.getUserId())) {
                        throw new RuntimeException("Cannot renew another user's book");
                }
                if (!"active".equalsIgnoreCase(issue.getStatus())) {
                        throw new RuntimeException("Only active borrows can be renewed");
                }
                if (Boolean.TRUE.equals(issue.getRenewed())) {
                        throw new RuntimeException("Book can only be renewed once");
                }

                issue.setDueDate(issue.getDueDate().plusDays(14));
                issue.setRenewed(true);
                issueRepository.save(issue);

                return "Book renewed successfully. New due date: " + issue.getDueDate();
        }

        public List<Map<String, Object>> getNotifications() {
                User user = getAuthenticatedUser();
                List<IssueRecord> activeIssues = issueRepository
                                .findByUserIdAndStatusOrderByBorrowDateDesc(user.getUserId(), "active");

                LocalDate today = LocalDate.now();
                LocalDate tomorrow = today.plusDays(1);

                List<Map<String, Object>> result = new ArrayList<>();

                for (IssueRecord issue : activeIssues) {
                        PhysicalCopy copy = copyRepository.findById(issue.getCopyId()).orElse(null);
                        String title = (copy != null) ? copy.getBook().getTitle() : "Unknown Book";

                        Map<String, Object> notif = new HashMap<>();
                        notif.put("issueId", issue.getIssueId());

                        if (issue.getDueDate() != null && issue.getDueDate().isBefore(today)) {
                                notif.put("type", "danger");
                                notif.put("title", "Book Overdue");
                                notif.put("body", "\"" + title + "\" was due on " + issue.getDueDate() + ". Please return immediately to avoid further fines.");
                                result.add(notif);
                        } else if (issue.getDueDate() != null &&
                                        (issue.getDueDate().equals(today) || issue.getDueDate().equals(tomorrow))) {
                                notif.put("type", "warning");
                                notif.put("title", "Book Due Soon");
                                notif.put("body", "\"" + title + "\" is due on " + issue.getDueDate() + ". Please return or renew.");
                                result.add(notif);
                        }
                }

                return result;
        }

        public Map<String, Object> updateProfile(UpdateProfileRequest request) {
                User user = getAuthenticatedUser();

                if (request.getName() != null && !request.getName().isBlank()) {
                        user.setName(request.getName().trim());
                }

                if (request.getEmail() != null && !request.getEmail().isBlank()) {
                        if (!request.getEmail().equalsIgnoreCase(user.getEmail()) &&
                                        userRepository.findByEmail(request.getEmail()).isPresent()) {
                                throw new RuntimeException("Email is already in use");
                        }
                        user.setEmail(request.getEmail().trim());
                }

                if (request.getPhone() != null && !request.getPhone().isBlank()) {
                        user.setPhone(request.getPhone().trim());
                }

                if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                                throw new RuntimeException("Current password is required to set a new password");
                        }
                        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                                throw new RuntimeException("Current password is incorrect");
                        }
                        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                }

                userRepository.save(user);

                Map<String, Object> response = new HashMap<>();
                response.put("user_id", user.getUserId());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                response.put("phone", user.getPhone());
                response.put("membership_number", user.getMembershipNumber());
                response.put("role", user.getRole());
                response.put("status", user.getStatus());
                response.put("hasPin", user.getPinHash() != null);
                return response;
        }

        public String sendContactMessage(ContactRequest request) {
                User user = getAuthenticatedUser();
                if (request.getSubject() == null || request.getSubject().isBlank()
                                || request.getMessage() == null || request.getMessage().isBlank()) {
                        throw new RuntimeException("Subject and message are required");
                }
                mailService.sendContactMessage(
                                request.getSubject().trim(),
                                request.getMessage().trim(),
                                user.getEmail(),
                                user.getName());
                return "Message sent successfully";
        }
}
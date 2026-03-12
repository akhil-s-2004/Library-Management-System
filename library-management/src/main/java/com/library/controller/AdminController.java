package com.library.controller;

import com.library.dto.request.CreateUserRequest;
import com.library.dto.request.UpdateProfileRequest;
import com.library.dto.request.UpdateUserRequest;
import com.library.entity.Fine;
import com.library.entity.Reservation;
import com.library.entity.User;
import com.library.entity.IssueRecord;
import com.library.entity.PhysicalCopy;
import com.library.repository.PhysicalCopyRepository;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.IssueRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final IssueRepository issueRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;
    private final PasswordEncoder passwordEncoder;
    private final PhysicalCopyRepository copyRepository;

    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "Welcome Admin";
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public String createUser(@Valid @RequestBody CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        String role = request.getRole().trim().toLowerCase();
        user.setRole(role);

        // Admins added by admin start as pending (require approval before login)
        // Members added by admin are immediately active
        user.setStatus("admin".equals(role) ? "pending" : "active");
        user.setPhone(request.getPhone());
        user.setMembershipNumber("MEM" + String.format("%03d", userRepository.count() + 2));

        userRepository.save(user);
        return "User created successfully";

    }

    @PutMapping("/users/{userId}")
    public String updateUser(@PathVariable UUID userId,
            @RequestBody UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole().trim().toLowerCase());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus().trim().toLowerCase());
        }

        userRepository.save(user);
        return "User updated successfully";
    }

    @GetMapping("/users/pending")
    public List<User> pendingUsers() {
        return userRepository.findByStatusIgnoreCase("pending");
    }

    @PutMapping("/users/{userId}/approve")
    public String approveUserV2(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("active");
        userRepository.save(user);
        return "User approved successfully";
    }

    @PutMapping("/users/{userId}/reject")
    public String rejectUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("suspended");
        userRepository.save(user);
        return "User suspended successfully";
    }

    @GetMapping("/reservations")
    public List<Reservation> reservations() {
        return reservationRepository.findAll();
    }

    @GetMapping("/fines")
    public List<Map<String, Object>> fines() {
        List<Fine> fines = fineRepository.findAll();
        List<Map<String, Object>> enrichedFines = new ArrayList<>();

        Set<Long> issueIdsWithFine = fines.stream()
                .map(Fine::getIssueId)
                .collect(Collectors.toSet());

        for (Fine fine : fines) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", fine.getFineId());
            map.put("amount", fine.getAmount());
            map.put("paidStatus", fine.getPaidStatus());
            map.put("paymentDate", fine.getPaymentDate());

            IssueRecord issue = issueRepository.findById(fine.getIssueId()).orElse(null);
            if (issue != null) {
                map.put("dueDate", issue.getDueDate());
                map.put("returnDate", issue.getReturnDate());
                map.put("issueStatus", issue.getStatus());
                long daysOverdue = 0;
                if (issue.getDueDate() != null) {
                    // For returned books use the actual return date; for still-active use today
                    LocalDate compareDate = (issue.getReturnDate() != null)
                            ? issue.getReturnDate()
                            : LocalDate.now();
                    if (compareDate.isAfter(issue.getDueDate())) {
                        daysOverdue = ChronoUnit.DAYS.between(issue.getDueDate(), compareDate);
                    }
                }
                map.put("daysOverdue", daysOverdue);

                User user = userRepository.findById(issue.getUserId()).orElse(null);
                if (user != null) {
                    map.put("member", user.getName());
                    map.put("email", user.getEmail());
                }

                PhysicalCopy copy = copyRepository.findById(issue.getCopyId()).orElse(null);
                if (copy != null) {
                    map.put("copyId", copy.getCopyId());
                    map.put("bookTitle", copy.getBook().getTitle());
                }
            }
            enrichedFines.add(map);
        }

        // Add real-time pending fines for overdue active issues not yet in DB
        LocalDate today = LocalDate.now();
        List<IssueRecord> overdueActive = issueRepository.findAll().stream()
                .filter(issue -> "active".equals(issue.getStatus())
                        && issue.getDueDate() != null
                        && today.isAfter(issue.getDueDate())
                        && !issueIdsWithFine.contains(issue.getIssueId()))
                .collect(Collectors.toList());

        for (IssueRecord issue : overdueActive) {
            long daysOverdue = ChronoUnit.DAYS.between(issue.getDueDate(), today);
            Map<String, Object> map = new HashMap<>();
            map.put("id", null);
            map.put("amount", BigDecimal.valueOf(10).multiply(BigDecimal.valueOf(daysOverdue)));
            map.put("paidStatus", "unpaid");
            map.put("paymentDate", null);
            map.put("dueDate", issue.getDueDate());
            map.put("returnDate", null);
            map.put("issueStatus", "active");
            map.put("daysOverdue", daysOverdue);

            User user = userRepository.findById(issue.getUserId()).orElse(null);
            if (user != null) {
                map.put("member", user.getName());
                map.put("email", user.getEmail());
            }

            PhysicalCopy copy = copyRepository.findById(issue.getCopyId()).orElse(null);
            if (copy != null) {
                map.put("copyId", copy.getCopyId());
                map.put("bookTitle", copy.getBook().getTitle());
            }
            enrichedFines.add(map);
        }

        return enrichedFines;
    }

    @GetMapping("/fines/{fineId}")
    public Fine fineById(@PathVariable Long fineId) {
        return fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
    }

    @PutMapping("/fines/{fineId}/pay")
    public String payFine(@PathVariable Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        fine.setPaidStatus("paid");
        fine.setPaymentDate(LocalDate.now());
        fineRepository.save(fine);
        return "Fine marked as paid";
    }

    @PutMapping("/fines/{fineId}/waive")
    public String waiveFine(@PathVariable Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        fine.setPaidStatus("waived");
        fine.setAmount(BigDecimal.ZERO);
        fineRepository.save(fine);
        return "Fine waived";
    }

    @GetMapping("/memberships")
    public List<User> memberships() {
        return userRepository.findByRoleIgnoreCase("member");
    }

    @GetMapping("/analytics/overview")
    public Map<String, Object> analyticsOverview() {
        Map<String, Object> response = new HashMap<>();
        response.put("total_books", bookRepository.count());
        response.put("total_members", userRepository.findByRoleIgnoreCase("member").size());
        response.put("active_issues", issueRepository.countByStatus("active"));
        response.put("total_reservations", reservationRepository.countByStatus("active"));

        // DB unpaid fines
        List<Fine> unpaidDbFines = fineRepository.findByPaidStatusIgnoreCase("unpaid");
        Set<Long> issueIdsWithFine = unpaidDbFines.stream()
                .map(Fine::getIssueId)
                .collect(Collectors.toSet());

        BigDecimal outstandingFines = unpaidDbFines.stream()
                .map(Fine::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Add real-time accruing fines for overdue active issues with no DB record yet
        LocalDate today = LocalDate.now();
        for (IssueRecord issue : issueRepository.findAll()) {
            if ("active".equals(issue.getStatus())
                    && issue.getDueDate() != null
                    && today.isAfter(issue.getDueDate())
                    && !issueIdsWithFine.contains(issue.getIssueId())) {
                long days = ChronoUnit.DAYS.between(issue.getDueDate(), today);
                outstandingFines = outstandingFines.add(BigDecimal.valueOf(10).multiply(BigDecimal.valueOf(days)));
            }
        }

        response.put("outstanding_fines", outstandingFines);
        return response;
    }

    @GetMapping("/logs")
    public Map<String, Object> logs() {
        Map<String, Object> response = new HashMap<>();
        response.put("total", 0);
        response.put("data", List.of());
        response.put("message", "Transaction log entity not yet modeled in this codebase");
        return response;
    }

    @PutMapping("/approve/{id}")
    public String approveUser(@PathVariable UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus("active");
        userRepository.save(user);

        return "User approved successfully";
    }

    @GetMapping("/profile")
    public Map<String, Object> getAdminProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> map = new HashMap<>();
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole());
        map.put("status", user.getStatus());
        map.put("membershipNumber", user.getMembershipNumber());
        return map;
    }

    @PutMapping("/profile")
    public Map<String, Object> updateAdminProfile(@RequestBody UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.equals(user.getEmail())) {
                Optional<User> existing = userRepository.findByEmail(newEmail);
                if (existing.isPresent() && !existing.get().getUserId().equals(user.getUserId())) {
                    throw new RuntimeException("Email already in use");
                }
                user.setEmail(newEmail);
            }
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null ||
                    !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Current password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);

        Map<String, Object> map = new HashMap<>();
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole());
        map.put("status", user.getStatus());
        map.put("membershipNumber", user.getMembershipNumber());
        return map;
    }
}
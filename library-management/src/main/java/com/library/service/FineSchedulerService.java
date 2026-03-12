package com.library.service;

import com.library.entity.Fine;
import com.library.entity.IssueRecord;
import com.library.repository.FineRepository;
import com.library.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FineSchedulerService {

    private final IssueRepository issueRepository;
    private final FineRepository fineRepository;

    private static final BigDecimal FINE_PER_DAY = BigDecimal.valueOf(10);

    /**
     * Runs every day at midnight.
     * For every active issue that is past its due date, creates or updates
     * the fine record so the amount always reflects current overdue days × ₹10.
     * Paid or waived fines are never modified.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void accrueOverdueFines() {
        LocalDate today = LocalDate.now();
        List<IssueRecord> overdueIssues = issueRepository.findByStatusAndDueDateBefore("active", today);

        log.info("Fine accrual job: {} overdue active issues found", overdueIssues.size());

        for (IssueRecord issue : overdueIssues) {
            long overdueDays = ChronoUnit.DAYS.between(issue.getDueDate(), today);
            BigDecimal fineAmount = FINE_PER_DAY.multiply(BigDecimal.valueOf(overdueDays));

            Optional<Fine> existing = fineRepository.findByIssueId(issue.getIssueId());
            if (existing.isPresent()) {
                Fine fine = existing.get();
                // Only update if still unpaid — don't touch paid or waived fines
                if ("unpaid".equalsIgnoreCase(fine.getPaidStatus())) {
                    fine.setAmount(fineAmount);
                    fineRepository.save(fine);
                }
            } else {
                Fine fine = Fine.builder()
                        .issueId(issue.getIssueId())
                        .amount(fineAmount)
                        .paidStatus("unpaid")
                        .build();
                fineRepository.save(fine);
                log.info("Created new fine for issueId={} amount=₹{}", issue.getIssueId(), fineAmount);
            }
        }
    }
}

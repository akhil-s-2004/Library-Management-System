package com.library.repository;

import com.library.entity.IssueRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;

public interface IssueRepository extends JpaRepository<IssueRecord, Long> {

    long countByUserIdAndStatus(UUID userId, String status);

    long countByStatus(String status);

    long countByUserId(UUID userId);

    List<IssueRecord> findByUserIdOrderByBorrowDateDesc(UUID userId);

    List<IssueRecord> findByUserIdAndStatusOrderByBorrowDateDesc(UUID userId, String status);

    Optional<IssueRecord> findByCopyIdAndStatus(Long copyId, String status);

    List<IssueRecord> findByStatusAndDueDateBefore(String status, LocalDate date);
}

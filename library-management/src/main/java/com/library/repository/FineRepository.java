package com.library.repository;

import com.library.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {

	List<Fine> findByIssueIdIn(List<Long> issueIds);

	List<Fine> findByPaidStatusIgnoreCase(String paidStatus);

	Optional<Fine> findByIssueId(Long issueId);

}
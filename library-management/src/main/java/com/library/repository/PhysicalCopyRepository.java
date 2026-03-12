package com.library.repository;

import com.library.entity.Book;
import com.library.entity.PhysicalCopy;
import com.library.enums.CopyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PhysicalCopyRepository
        extends JpaRepository<PhysicalCopy, Long> {
    long countByBook(Book book);
    long countByBookAndStatus(Book book, CopyStatus status);
    List<PhysicalCopy> findByBookBookId(Long bookId);
    Optional<PhysicalCopy> findFirstByBookBookIdAndStatus(Long bookId, CopyStatus status);
}
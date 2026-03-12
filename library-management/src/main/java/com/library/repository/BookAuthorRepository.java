package com.library.repository;

import com.library.entity.BookAuthor;
import com.library.entity.BookAuthorId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookAuthorRepository
        extends JpaRepository<BookAuthor, BookAuthorId> {
    List<BookAuthor> findByIdBookId(Long bookId);
    List<BookAuthor> findByIdAuthorId(Long authorId);
}
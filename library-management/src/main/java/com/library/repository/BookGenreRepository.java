package com.library.repository;

import com.library.entity.BookGenre;
import com.library.entity.BookGenreId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookGenreRepository
        extends JpaRepository<BookGenre, BookGenreId> {
    List<BookGenre> findByIdBookId(Long bookId);
    List<BookGenre> findByIdGenreId(Long genreId);
}
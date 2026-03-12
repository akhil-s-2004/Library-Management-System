package com.library.repository;

import com.library.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    Optional<Genre> findByGenreName(String genreName);

    Optional<Genre> findByGenreNameIgnoreCase(String genreName);
}
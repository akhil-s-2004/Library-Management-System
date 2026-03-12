package com.library.service;

import com.library.dto.request.CreateBookRequest;
import com.library.dto.request.UpdateCopyRequest;
import com.library.entity.*;
import com.library.enums.CopyStatus;
import com.library.repository.*;
//import jakarta.transaction.Transactional;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final PhysicalCopyRepository copyRepository;
    private final BookAuthorRepository bookAuthorRepository;
    private final BookGenreRepository bookGenreRepository;

    @Transactional
    public Map<String, Object> createBook(CreateBookRequest request) {

        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new RuntimeException("Bookalready exists");
        }

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setPublishedYear(request.getPublishedYear());
        book.setEdition(request.getEdition());
        book.setLanguage(request.getLanguage());
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());

        Book savedBook = bookRepository.save(book);

        // Authors
        if (request.getAuthors() != null) {
            for (String name : request.getAuthors()) {
                if (name == null || name.isBlank())
                    continue;
                Author author = authorRepository
                        .findByAuthorName(name)
                        .orElseGet(() -> authorRepository.save(new Author(null, name)));

                BookAuthorId id = new BookAuthorId(savedBook.getBookId(), author.getAuthorId());
                bookAuthorRepository.save(new BookAuthor(id));
            }
        }

        // Genres
        if (request.getGenres() != null) {
            for (String name : request.getGenres()) {
                if (name == null || name.isBlank())
                    continue;
                Genre genre = genreRepository
                        .findByGenreName(name)
                        .orElseGet(() -> genreRepository.save(new Genre(null, name)));

                BookGenreId id = new BookGenreId(savedBook.getBookId(), genre.getGenreId());
                bookGenreRepository.save(new BookGenre(id));
            }
        }

        // Copies
        List<Long> generatedCopyIds = new ArrayList<>();
        int numCopies = request.getCopies() != null ? request.getCopies() : 0;
        for (int i = 0; i < numCopies; i++) {
            PhysicalCopy copy = new PhysicalCopy();
            copy.setBook(savedBook);
            copy.setStatus(CopyStatus.AVAILABLE);
            copy.setShelfLocation(null);
            PhysicalCopy savedCopy = copyRepository.save(copy);
            generatedCopyIds.add(savedCopy.getCopyId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Book created successfully");
        response.put("bookId", savedBook.getBookId());
        response.put("copyIds", generatedCopyIds);
        return response;
    }

    @Transactional(readOnly = true)
    public Page<Map<String, Object>> getAllBooks(String search, String author, String genre, String sort, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        List<Book> books;

        // If no filters → return all books
        if ((search == null || search.isBlank()) &&
                (author == null || author.isBlank()) &&
                (genre == null || genre.isBlank())) {

            books = bookRepository.findAll();

        } else {

            Set<Long> filteredBookIds = null;

            // Filter by author
            if (author != null && !author.isBlank()) {
                Author authorEntity = authorRepository
                        .findByAuthorNameIgnoreCase(author.trim())
                        .orElseThrow(() -> new RuntimeException("Author not found"));

                Set<Long> authorBookIds = bookAuthorRepository
                        .findByIdAuthorId(authorEntity.getAuthorId())
                        .stream()
                        .map(ba -> ba.getId().getBookId())
                        .collect(Collectors.toSet());
                filteredBookIds = authorBookIds;
            }

            // Filter by genre
            if (genre != null && !genre.isBlank()) {
                Genre genreEntity = genreRepository
                        .findByGenreNameIgnoreCase(genre.trim())
                        .orElseThrow(() -> new RuntimeException("Genre not found"));

                Set<Long> genreBookIds = bookGenreRepository
                        .findByIdGenreId(genreEntity.getGenreId())
                        .stream()
                        .map(bg -> bg.getId().getBookId())
                        .collect(Collectors.toSet());

                if (filteredBookIds == null) {
                    filteredBookIds = genreBookIds;
                } else {
                    filteredBookIds.retainAll(genreBookIds);
                }
            }

            if (filteredBookIds == null) {
                books = bookRepository.findAll();
            } else if (filteredBookIds.isEmpty()) {
                books = List.of();
            } else {
                books = bookRepository.findAllById(filteredBookIds);
            }

            // Apply search filter
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                books = books.stream()
                        .filter(b -> (b.getTitle() != null && b.getTitle().toLowerCase().contains(q))
                                || (b.getIsbn() != null && b.getIsbn().contains(q)))
                        .collect(Collectors.toList());
            }
        }

        // Apply sort
        if ("desc".equalsIgnoreCase(sort)) {
            books = new ArrayList<>(books);
            books.sort(Comparator.comparing(Book::getBookId).reversed());
        }

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), books.size());
        List<Book> pageContent = (start > books.size()) ? List.of() : books.subList(start, end);

        // Build response maps with copy count
        List<Map<String, Object>> result = pageContent.stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("bookId", b.getBookId());
            m.put("title", b.getTitle());
            m.put("isbn", b.getIsbn());
            m.put("publisher", b.getPublisher());
            m.put("publishedYear", b.getPublishedYear());
            m.put("edition", b.getEdition());
            m.put("language", b.getLanguage());
            m.put("description", b.getDescription());
            m.put("coverImageUrl", b.getCoverImageUrl());
            m.put("copies", copyRepository.countByBook(b));

            List<Long> aIds = bookAuthorRepository.findByIdBookId(b.getBookId())
                    .stream().map(ba -> ba.getId().getAuthorId()).toList();
            String authorNames = authorRepository.findAllById(aIds)
                    .stream().map(Author::getAuthorName).collect(Collectors.joining(", "));
            m.put("author", authorNames);

            return m;
        }).collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(result, pageable, books.size());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBookById(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        List<BookAuthor> bookAuthors = bookAuthorRepository.findByIdBookId(id);

        List<Long> authorIds = bookAuthors.stream()
                .map(ba -> ba.getId().getAuthorId())
                .toList();

        List<Author> authors = authorRepository.findAllById(authorIds);

        List<BookGenre> bookGenres = bookGenreRepository.findByIdBookId(id);

        List<Long> genreIds = bookGenres.stream()
                .map(bg -> bg.getId().getGenreId())
                .toList();

        List<Genre> genres = genreRepository.findAllById(genreIds);

        long copyCount = copyRepository.countByBook(book);
        long availableCopies = copyRepository.countByBookAndStatus(book, CopyStatus.AVAILABLE);

        String authorNames = authors.stream()
                .map(Author::getAuthorName)
                .collect(Collectors.joining(", "));

        List<String> genreNames = genres.stream()
                .map(Genre::getGenreName)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("bookId", book.getBookId());
        response.put("title", book.getTitle());
        response.put("isbn", book.getIsbn());
        response.put("publisher", book.getPublisher());
        response.put("publishedYear", book.getPublishedYear());
        response.put("edition", book.getEdition());
        response.put("language", book.getLanguage());
        response.put("description", book.getDescription());
        response.put("coverImageUrl", book.getCoverImageUrl());
        response.put("author", authorNames);
        response.put("genres", genreNames);
        response.put("totalCopies", copyCount);
        response.put("availableCopies", availableCopies);

        return response;
    }

    @Transactional
    public String updateBook(Long id, CreateBookRequest request) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        book.setTitle(request.getTitle());
        book.setPublisher(request.getPublisher());
        book.setPublishedYear(request.getPublishedYear());
        book.setEdition(request.getEdition());
        book.setLanguage(request.getLanguage());
        book.setDescription(request.getDescription());
        if (request.getCoverImageUrl() != null) {
            book.setCoverImageUrl(request.getCoverImageUrl());
        }

        bookRepository.save(book);

        return "Book updated successfully";
    }

    @Transactional
    public String deleteBook(Long id) {

        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Book not found");
        }

        bookRepository.deleteById(id);

        return "Book deleted successfully";
    }

    @Transactional(readOnly = true)
    public List<PhysicalCopy> getCopiesByBookId(Long bookId) {

        if (!bookRepository.existsById(bookId)) {
            throw new RuntimeException("Book not found");
        }

        return copyRepository.findByBookBookId(bookId);
    }

    @Transactional
    public Map<String, Object> addCopy(Long bookId, String shelfLocation) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        PhysicalCopy copy = new PhysicalCopy();
        copy.setBook(book);
        copy.setStatus(CopyStatus.AVAILABLE);
        copy.setShelfLocation(shelfLocation);

        PhysicalCopy savedCopy = copyRepository.save(copy);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Copy added successfully");
        response.put("bookId", bookId);
        response.put("copyId", savedCopy.getCopyId());
        return response;
    }

    @Transactional
    public String updateCopy(Long copyId, UpdateCopyRequest request) {

        PhysicalCopy copy = copyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found"));

        if (request.getStatus() != null) {
            try {
                copy.setStatus(CopyStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new RuntimeException("Invalid copy status: " + request.getStatus());
            }
        }

        if (request.getShelfLocation() != null) {
            copy.setShelfLocation(request.getShelfLocation());
        }

        copyRepository.save(copy);

        return "Copy updated successfully";
    }

    @Transactional
    public String deleteCopy(Long copyId) {

        PhysicalCopy copy = copyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found"));

        copyRepository.delete(copy);

        return "Copy deleted successfully";
    }

    @Transactional(readOnly = true)
    public PhysicalCopy getCopyById(Long copyId) {

        return copyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found"));
    }

    @Transactional(readOnly = true)
    public List<Book> filterBooks(Long id, String author, String genre) {
        if (id != null) {
            Book book = bookRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found"));
            return List.of(book);
        }

        Set<Long> filteredBookIds = null;

        if (author != null && !author.isBlank()) {
            Author authorEntity = authorRepository.findByAuthorNameIgnoreCase(author.trim())
                    .orElseThrow(() -> new RuntimeException("Author not found"));

            Set<Long> authorBookIds = bookAuthorRepository.findByIdAuthorId(authorEntity.getAuthorId())
                    .stream()
                    .map(bookAuthor -> bookAuthor.getId().getBookId())
                    .collect(Collectors.toSet());

            filteredBookIds = authorBookIds;
        }

        if (genre != null && !genre.isBlank()) {
            Genre genreEntity = genreRepository.findByGenreNameIgnoreCase(genre.trim())
                    .orElseThrow(() -> new RuntimeException("Genre not found"));

            Set<Long> genreBookIds = bookGenreRepository.findByIdGenreId(genreEntity.getGenreId())
                    .stream()
                    .map(bookGenre -> bookGenre.getId().getBookId())
                    .collect(Collectors.toSet());

            if (filteredBookIds == null) {
                filteredBookIds = genreBookIds;
            } else {
                filteredBookIds.retainAll(genreBookIds);
            }
        }

        if (filteredBookIds == null) {
            return bookRepository.findAll();
        }

        if (filteredBookIds.isEmpty()) {
            return List.of();
        }

        return bookRepository.findAllById(filteredBookIds);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getGenres() {
        return genreRepository.findAll().stream().map(g -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", g.getGenreId());
            m.put("name", g.getGenreName());
            return m;
        }).collect(Collectors.toList());
    }
}
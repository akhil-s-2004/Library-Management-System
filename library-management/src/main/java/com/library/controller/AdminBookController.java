package com.library.controller;

import com.library.dto.request.CreateBookRequest;
import com.library.dto.request.UpdateCopyRequest;
import com.library.entity.Book;
import com.library.entity.PhysicalCopy;
import com.library.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin/books")
@RequiredArgsConstructor
public class AdminBookController {

    private final BookService bookService;

    @PostMapping
    public Map<String, Object> createBook(@RequestBody CreateBookRequest request) {
        return bookService.createBook(request);
    }
    @GetMapping
    public Object getBooks(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {

        // If ID is provided → return single book
        if (id != null) {
            return bookService.getBookById(id);
        }

        // Otherwise apply search/filter
        return bookService.getAllBooks(search, author, genre, "asc", page, limit);
    }
//    @GetMapping("/{id}")
//    public Map<String, Object> getBookById(@PathVariable Long id) {
//        return bookService.getBookById(id);
//    }
//
//    @GetMapping("/filter")
//    public List<Book> filterBooks(
//            @RequestParam(required = false) Long id,
//            @RequestParam(required = false) String author,
//            @RequestParam(required = false) String genre
//    ) {
//        return bookService.filterBooks(id, author, genre);
//    }
    @PutMapping("/{id}")
    public String updateBook(
            @PathVariable Long id,
            @RequestBody CreateBookRequest request) {

        return bookService.updateBook(id, request);
    }
    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Long id) {
        return bookService.deleteBook(id);
    }
    @GetMapping("/{bookId}/copies")
    public List<PhysicalCopy> getCopies(@PathVariable Long bookId) {
        return bookService.getCopiesByBookId(bookId);
    }
    @PostMapping("/{bookId}/copies")
    public Map<String, Object> addCopy(
            @PathVariable Long bookId,
            @RequestParam(required = false) String location) {

        return bookService.addCopy(bookId, location);
    }

    @GetMapping("/test")
    public String test() {
        return "Test Successful";
    }
}
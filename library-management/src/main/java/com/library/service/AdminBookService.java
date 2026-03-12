package com.library.service;

import com.library.entity.Book;
import com.library.repository.*;
import lombok.RequiredArgsConstructor;
import com.library.dto.request.CreateBookRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminBookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final BookAuthorRepository bookAuthorRepository;
    private final BookGenreRepository bookGenreRepository;
    private final PhysicalCopyRepository physicalCopyRepository;

    public void createBook(CreateBookRequest request){
        if(bookRepository.existsByIsbn((request.getIsbn()))){
            throw new RuntimeException("Isbn already exixts;");
        }
        Book book = new Book();

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setPublishedYear(request.getPublishedYear());
        book.setEdition(request.getEdition());
        book.setLanguage(request.getLanguage());
        book.setDescription(request.getDescription());

        Book savedBook = bookRepository.save(book);
    }
}

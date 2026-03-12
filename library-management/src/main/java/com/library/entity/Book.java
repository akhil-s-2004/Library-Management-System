package com.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "book")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_id")
    private Long bookId;

    private String title;

    @Column(unique = true)
    private String isbn;

    private String publisher;

    @Column(name = "published_year")
    private Integer publishedYear;

    private String edition;

    private String language;

    private String description;

    @Column(name = "cover_image_url", columnDefinition = "text")
    private String coverImageUrl;
}
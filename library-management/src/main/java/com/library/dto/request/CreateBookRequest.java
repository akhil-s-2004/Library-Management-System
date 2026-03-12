package com.library.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateBookRequest {

    private String title;
    private String isbn;
    private String publisher;
    private Integer publishedYear;
    private String edition;
    private String language;
    private String description;
    private String coverImageUrl;

    private List<String> authors;
    private List<String> genres;

    private Integer copies;
}
package com.library.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "book_genre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookGenre {

    @EmbeddedId
    private BookGenreId id;
}


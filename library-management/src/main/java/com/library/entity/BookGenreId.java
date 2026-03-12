package com.library.entity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BookGenreId implements Serializable {

    private Long bookId;
    private Long genreId;
}
package com.library.entity;

import com.library.enums.CopyStatus;
import com.library.enums.CopyStatusConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "physical_copy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhysicalCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "copy_id")
    private Long copyId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Convert(converter = CopyStatusConverter.class)
    private CopyStatus status;

    @Column(name = "shelf_location")
    private String shelfLocation;

}
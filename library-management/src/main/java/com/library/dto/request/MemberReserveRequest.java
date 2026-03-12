package com.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MemberReserveRequest {

    @NotNull(message = "Book id is required")
    private Long bookId;
}

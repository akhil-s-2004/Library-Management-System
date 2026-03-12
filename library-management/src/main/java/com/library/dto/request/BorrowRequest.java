package com.library.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class BorrowRequest {
    private String email;
    private String password;
    private Long copyId;
}

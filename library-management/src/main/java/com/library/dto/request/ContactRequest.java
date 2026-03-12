package com.library.dto.request;

import lombok.Data;

@Data
public class ContactRequest {
    private String subject;
    private String message;
}

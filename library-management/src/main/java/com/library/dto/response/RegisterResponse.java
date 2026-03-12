package com.library.dto.response;

import java.util.UUID;

public class RegisterResponse {

    private UUID userId;
    private String message;

    public RegisterResponse(UUID userId, String message) {
        this.userId = userId;
        this.message = message;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getMessage() {
        return message;
    }
}
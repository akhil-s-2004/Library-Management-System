package com.library.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

public class AuthResponse {

    private boolean success;
    private String token;
    private String role;
    private UUID userId;
    private String status;

    public AuthResponse(boolean success,
            String token,
            String role,
            UUID userId,
            String status) {
        this.success = success;
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    // @JsonIgnore prevents the token from being included in the HTTP response body.
    // It is accessed internally by AuthController to set the HttpOnly cookie.
    @JsonIgnore
    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getStatus() {
        return status;
    }
}
package com.library.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUserRequest {

    private String name;

    @Email(message = "Email is invalid")
    private String email;

    @Pattern(regexp = "(?i)ADMIN|MEMBER", message = "Role must be ADMIN or MEMBER")
    private String role;

    @Pattern(regexp = "(?i)ACTIVE|PENDING|REJECTED|SUSPENDED", message = "Invalid status")
    private String status;
}

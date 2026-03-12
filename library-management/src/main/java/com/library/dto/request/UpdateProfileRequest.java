package com.library.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String phone;
    private String currentPassword;
    private String newPassword;
}

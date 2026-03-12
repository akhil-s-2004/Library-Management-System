package com.library.controller;

import com.library.dto.request.RegisterRequest;
import com.library.dto.response.RegisterResponse;
import com.library.dto.response.AuthResponse;
import com.library.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.library.dto.request.LoginRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final int COOKIE_MAX_AGE = 10 * 60 * 60; // 10 hours, matches JWT expiry

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request,
                              HttpServletResponse response) {
        AuthResponse auth = userService.login(request);

        // HttpOnly — the JWT, invisible to JavaScript
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("auth_token", auth.getToken(), COOKIE_MAX_AGE, true).toString());

        // Readable by JavaScript — non-sensitive UI values only
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("user_role", auth.getRole(), COOKIE_MAX_AGE, false).toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("user_id", auth.getUserId().toString(), COOKIE_MAX_AGE, false).toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie("user_status", auth.getStatus(), COOKIE_MAX_AGE, false).toString());

        return auth;
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        for (String name : new String[]{"auth_token", "user_role", "user_id", "user_status"}) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(name, "", 0, "auth_token".equals(name)).toString());
        }
        return ResponseEntity.ok("Logged out");
    }

    private ResponseCookie buildCookie(String name, String value, int maxAge, boolean httpOnly) {
        return ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(false) // set to true in production with HTTPS
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }
}

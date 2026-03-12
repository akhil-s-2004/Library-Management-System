package com.library.service;

import com.library.dto.request.RegisterRequest;
import com.library.dto.response.RegisterResponse;
import com.library.entity.User;
import com.library.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.library.security.JwtService;
import com.library.dto.request.LoginRequest;
import com.library.dto.response.AuthResponse;
import org.springframework.security.authentication.BadCredentialsException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private String generateMembershipNumber() {
        long count = userRepository.count() + 2;
        return "MEM" + String.format("%03d", count);
    }

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        // AUTO GENERATE MEMBERSHIP NUMBER
        user.setMembershipNumber(generateMembershipNumber());

        // Use role from request (defaulting to member if not provided, though it's
        // marked @NotBlank)
        String role = request.getRole() != null ? request.getRole().toLowerCase() : "member";
        user.setRole(role);

        user.setStatus("pending"); // Admin must approve before user can borrow/reserve
        user.setPinHash(null); // set later

        User saved = userRepository.save(user);

        return new RegisterResponse(
                saved.getUserId(),
                "Registration submitted. Your account is pending admin approval.");
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Suspended users cannot log in
        if (user.getStatus().equalsIgnoreCase("suspended")) {
            throw new BadCredentialsException("Your account has been suspended. Please contact admin.");
        }

        // Admins MUST be active to log in. Pending admins are rejected.
        if (user.getRole().equalsIgnoreCase("admin") && user.getStatus().equalsIgnoreCase("pending")) {
            throw new BadCredentialsException("Admin account is pending approval.");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole());

        return new AuthResponse(
                true,
                token,
                user.getRole(),
                user.getUserId(),
                user.getStatus()); // Include status so frontend can gate actions
    }
}

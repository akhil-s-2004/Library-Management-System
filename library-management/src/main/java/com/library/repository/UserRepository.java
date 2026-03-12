package com.library.repository;

import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMembershipNumber(String membershipNumber);
    List<User> findByStatusIgnoreCase(String status);
    List<User> findByRoleIgnoreCase(String role);
}
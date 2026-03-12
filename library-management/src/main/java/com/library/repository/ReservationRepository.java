package com.library.repository;

import com.library.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

                @Query("""
                                                select case when count(r) > 0 then true else false end
                                                from Reservation r
                                                where r.userId = :userId
                                                        and lower(trim(r.status)) = 'active'
                                                """)
                boolean existsActiveReservation(@Param("userId") UUID userId);

                long countByStatus(String status);

                List<Reservation> findByUserIdAndStatusOrderByReservationDateDesc(UUID userId, String status);

                List<Reservation> findByStatusOrderByReservationDateDesc(String status);

    boolean existsByUserIdAndBookIdAndStatusAndExpiresAtAfter(
            UUID userId,
            Long bookId,
            String status,
            LocalDateTime now
    );

    Optional<Reservation> findFirstByUserIdAndBookIdAndStatusAndExpiresAtAfterOrderByReservationDateAsc(
            UUID userId,
            Long bookId,
            String status,
            LocalDateTime now
    );

    Optional<Reservation> findFirstByBookIdAndStatusAndExpiresAtAfterOrderByReservationDateAsc(
            Long bookId,
            String status,
            LocalDateTime now
    );

    List<Reservation> findByStatusAndExpiresAtBefore(String status, LocalDateTime now);
}

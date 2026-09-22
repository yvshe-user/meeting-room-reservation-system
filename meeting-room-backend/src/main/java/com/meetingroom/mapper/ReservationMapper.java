package com.meetingroom.mapper;

import com.meetingroom.entity.Reservation;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReservationMapper {
    Optional<Reservation> findById(Integer reservationId);

    Optional<Reservation> findWithDetailsById(Integer reservationId);

    List<Reservation> findConflictingReservations(@Param("roomId") Integer roomId,
                                                   @Param("date") LocalDate date,
                                                   @Param("startTime") LocalTime startTime,
                                                   @Param("endTime") LocalTime endTime,
                                                   @Param("excludeReservationId") Integer excludeReservationId);

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Reservation> findAllWithDetails();

    List<Reservation> findWeeklyReservationsWithDetails(@Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    List<Reservation> findByStatusOrderByCreatedAtDesc(Reservation.ReservationStatus status);

    long countByMeetingRoomId(Integer roomId);

    int insert(Reservation reservation);

    int updateStatus(@Param("reservationId") Integer reservationId,
                     @Param("status") Reservation.ReservationStatus status);
}

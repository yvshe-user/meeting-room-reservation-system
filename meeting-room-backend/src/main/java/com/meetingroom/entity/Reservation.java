package com.meetingroom.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class Reservation {
    private Integer reservationId;

    private User user;

    private MeetingRoom meetingRoom;

    private LocalDate reservationDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String meetingTopic;

    private Integer attendance;

    private ReservationStatus status = ReservationStatus.PENDING;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum ReservationStatus {
        PENDING,    // 0-待审批
        APPROVED,   // 1-已通过
        REJECTED,   // 2-已驳回
        CANCELLED,  // 3-已取消
        COMPLETED   // 4-已完成
    }
}

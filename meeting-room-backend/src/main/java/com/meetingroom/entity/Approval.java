package com.meetingroom.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Approval {
    private Long approvalId;

    private Reservation reservation;

    private Boolean approvalResult;

    private String rejectReason;

    private LocalDateTime createdAt;
}

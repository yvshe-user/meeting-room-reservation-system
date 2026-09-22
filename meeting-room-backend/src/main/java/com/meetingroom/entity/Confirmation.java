package com.meetingroom.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Confirmation {
    private Integer confirmId;

    private Reservation reservation;

    private ConfirmType confirmType;

    private LocalDateTime confirmedAt;

    public enum ConfirmType {
        LOGIN, SCAN
    }
}

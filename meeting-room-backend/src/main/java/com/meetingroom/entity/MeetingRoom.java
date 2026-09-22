package com.meetingroom.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeetingRoom {
    private Integer roomId;

    private String roomName;

    private String roomNumber;

    private String building;

    private Integer capacity;

    private Double area;

    private String description;

    private String photoUrl;

    private String qrCodeUrl;

    private Boolean isAvailable = true;

    private User createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

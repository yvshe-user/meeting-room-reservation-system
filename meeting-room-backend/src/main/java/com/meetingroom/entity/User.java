package com.meetingroom.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {
    private Integer userId;

    private String username;

    private String password;

    private String phone;

    private UserRole role = UserRole.USER;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum UserRole {
        ADMIN, USER
    }
}

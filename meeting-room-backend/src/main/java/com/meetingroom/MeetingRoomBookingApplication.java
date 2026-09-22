package com.meetingroom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan("com.meetingroom.mapper")
public class MeetingRoomBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingRoomBookingApplication.class, args);
    }
}

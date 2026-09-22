package com.meetingroom.mapper;

import com.meetingroom.entity.MeetingRoom;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

public interface MeetingRoomMapper {
    List<MeetingRoom> findAll();

    List<MeetingRoom> findAvailable();

    Optional<MeetingRoom> findById(Integer roomId);

    boolean existsByRoomNumber(String roomNumber);

    boolean existsByRoomNumberAndRoomIdNot(@Param("roomNumber") String roomNumber,
                                           @Param("roomId") Integer roomId);

    List<MeetingRoom> findAvailableByBuildingAndCapacity(@Param("building") String building,
                                                         @Param("capacity") Integer capacity);

    List<MeetingRoom> findAvailableByCapacity(Integer capacity);

    int insert(MeetingRoom meetingRoom);

    int update(MeetingRoom meetingRoom);

    int deleteById(Integer roomId);
}

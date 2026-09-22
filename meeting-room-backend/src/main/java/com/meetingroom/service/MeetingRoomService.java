package com.meetingroom.service;

import com.meetingroom.entity.MeetingRoom;
import com.meetingroom.entity.User;
import com.meetingroom.mapper.MeetingRoomMapper;
import com.meetingroom.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingRoomService {
    private final MeetingRoomMapper meetingRoomMapper;
    private final ReservationMapper reservationMapper;

    public List<MeetingRoom> getAllRooms() {
        return meetingRoomMapper.findAll();
    }

    public List<MeetingRoom> getAvailableRooms() {
        return meetingRoomMapper.findAvailable();
    }

    @Transactional
    public MeetingRoom createRoom(User creator, MeetingRoom room) {
        if (meetingRoomMapper.existsByRoomNumber(room.getRoomNumber())) {
            throw new RuntimeException("会议室编号已存在");
        }

        room.setCreatedBy(creator);
        meetingRoomMapper.insert(room);
        return room;
    }

    @Transactional
    public MeetingRoom updateRoom(Integer roomId, MeetingRoom roomDetails) {
        MeetingRoom room = meetingRoomMapper.findById(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        String oldNumber = room.getRoomNumber();
        String newNumber = roomDetails.getRoomNumber();

        if (oldNumber == null) oldNumber = "";
        if (newNumber == null) newNumber = "";

        if (!oldNumber.trim().equals(newNumber.trim())) {
            if (meetingRoomMapper.existsByRoomNumberAndRoomIdNot(newNumber.trim(), roomId)) {
                throw new RuntimeException("会议室编号已存在");
            }
        }

        room.setRoomName(roomDetails.getRoomName());
        room.setRoomNumber(newNumber.trim());
        room.setBuilding(roomDetails.getBuilding());
        room.setCapacity(roomDetails.getCapacity());
        room.setArea(roomDetails.getArea());
        room.setDescription(roomDetails.getDescription());
        room.setPhotoUrl(roomDetails.getPhotoUrl());
        room.setQrCodeUrl(roomDetails.getQrCodeUrl());
        room.setIsAvailable(roomDetails.getIsAvailable());

        meetingRoomMapper.update(room);
        return room;
    }

    @Transactional
    public void deleteRoom(Integer roomId) {
        MeetingRoom room = meetingRoomMapper.findById(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        long reservationCount = reservationMapper.countByMeetingRoomId(roomId);
        if (reservationCount > 0) {
            throw new RuntimeException("该会议室存在 " + reservationCount + " 条预约记录，无法删除！");
        }

        meetingRoomMapper.deleteById(room.getRoomId());
    }

    @Transactional
    public MeetingRoom setRoomAvailability(Integer roomId, Boolean isAvailable) {
        MeetingRoom room = meetingRoomMapper.findById(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        room.setIsAvailable(isAvailable);
        meetingRoomMapper.update(room);
        return room;
    }

    public MeetingRoom getRoomById(Integer roomId) {
        return meetingRoomMapper.findById(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));
    }

    public boolean existsByRoomNumber(String roomNumber) {
        return meetingRoomMapper.existsByRoomNumber(roomNumber);
    }

    public List<MeetingRoom> findByBuildingAndCapacityGreaterThanEqualAndIsAvailableTrue(String building, Integer capacity) {
        return meetingRoomMapper.findAvailableByBuildingAndCapacity(building, capacity);
    }

    public List<MeetingRoom> findByCapacityGreaterThanEqualAndIsAvailableTrue(Integer capacity) {
        return meetingRoomMapper.findAvailableByCapacity(capacity);
    }
}

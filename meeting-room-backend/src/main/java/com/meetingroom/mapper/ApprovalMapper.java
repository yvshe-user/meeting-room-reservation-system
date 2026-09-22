package com.meetingroom.mapper;

import com.meetingroom.entity.Approval;

import java.util.Optional;

public interface ApprovalMapper {
    int insert(Approval approval);

    Optional<Approval> findByReservationId(Integer reservationId);
}

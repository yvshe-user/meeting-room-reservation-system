package com.meetingroom.mapper;

import com.meetingroom.entity.Confirmation;

public interface ConfirmationMapper {
    boolean existsByReservationId(Integer reservationId);

    int insert(Confirmation confirmation);
}

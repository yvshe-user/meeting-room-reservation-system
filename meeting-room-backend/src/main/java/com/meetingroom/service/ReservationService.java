package com.meetingroom.service;

import com.meetingroom.entity.*;
import com.meetingroom.mapper.ApprovalMapper;
import com.meetingroom.mapper.ConfirmationMapper;
import com.meetingroom.mapper.MeetingRoomMapper;
import com.meetingroom.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {
    private final ReservationMapper reservationMapper;
    private final MeetingRoomMapper meetingRoomMapper;
    private final ApprovalMapper approvalMapper;
    private final ConfirmationMapper confirmationMapper;

    /**
     * 验证时间段是否符合要求（以1小时为单位的连续时间段）
     */
    private void validateTimeSlot(LocalTime startTime, LocalTime endTime) {
        // 验证是否为整点小时（分钟和秒必须为0）
        if (startTime.getMinute() != 0 || startTime.getSecond() != 0 ||
                endTime.getMinute() != 0 || endTime.getSecond() != 0) {
            throw new RuntimeException("时间段必须以整点小时为单位（例如：09:00, 10:00）");
        }

        // 验证开始时间必须早于结束时间
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("开始时间必须早于结束时间");
        }

        // 验证时间段必须连续（以小时为单位）
        long durationHours = java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
        if (durationHours <= 0) {
            throw new RuntimeException("时间段必须连续且至少1小时");
        }

        // 验证时间段是否在合理范围内（如8:00-18:00）
        LocalTime earliestTime = LocalTime.of(8, 0);
        LocalTime latestTime = LocalTime.of(22, 0);
        if (startTime.isBefore(earliestTime) || endTime.isAfter(latestTime)) {
            throw new RuntimeException("预约时间必须在08:00至22:00之间");
        }
    }

    public List<MeetingRoom> getAvailableRooms(LocalDate date, LocalTime startTime, LocalTime endTime,
                                               Integer attendees, String building) {
        // 验证时间段格式
        validateTimeSlot(startTime, endTime);

        // 验证时间合理性
        if (startTime.isAfter(endTime)) {
            throw new RuntimeException("开始时间不能晚于结束时间");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new RuntimeException("不能预约过去的日期");
        }

        // 获取所有可用会议室
        List<MeetingRoom> allRooms;
        if (building != null && !building.trim().isEmpty()) {
            allRooms = meetingRoomMapper.findAvailableByBuildingAndCapacity(building, attendees);
        } else {
            allRooms = meetingRoomMapper.findAvailableByCapacity(attendees);
        }

        // 过滤掉有冲突的会议室
        return allRooms.stream()
                .filter(room -> {
                    List<Reservation> conflicts = reservationMapper.findConflictingReservations(
                            room.getRoomId(), date, startTime, endTime, null);
                    return conflicts.isEmpty();
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public Reservation createReservation(User user, Integer roomId, String meetingTopic, Integer attendance,
                                         LocalDate reservationDate, LocalTime startTime, LocalTime endTime) {
        // 验证时间段格式
        validateTimeSlot(startTime, endTime);

        // 验证基本参数
        if (startTime.isAfter(endTime)) {
            throw new RuntimeException("开始时间不能晚于结束时间");
        }
        if (reservationDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("不能预约过去的日期");
        }
        if (attendance <= 0) {
            throw new RuntimeException("参会人数必须大于0");
        }

        // 检查时间冲突
        List<Reservation> conflicts = reservationMapper.findConflictingReservations(
                roomId, reservationDate, startTime, endTime, null);

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("该时间段会议室已被预约");
        }

        MeetingRoom room = meetingRoomMapper.findById(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        if (room.getCapacity() < attendance) {
            throw new RuntimeException("会议室容量不足");
        }

        if (!room.getIsAvailable()) {
            throw new RuntimeException("该会议室暂不可用");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setMeetingRoom(room);
        reservation.setMeetingTopic(meetingTopic);
        reservation.setReservationDate(reservationDate);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setAttendance(attendance);
        reservation.setStatus(Reservation.ReservationStatus.PENDING);

        reservationMapper.insert(reservation);
        return reservation;
    }

    @Transactional
    public Approval approveReservation(Integer reservationId) {
        Reservation reservation = reservationMapper.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("预约记录不存在"));

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING) {
            throw new RuntimeException("只能审批待处理的预约");
        }

        // 创建审批记录
        Approval approval = new Approval();
        approval.setReservation(reservation);
        approval.setApprovalResult(true);
        approval.setRejectReason(null);
        approvalMapper.insert(approval);

        reservation.setStatus(Reservation.ReservationStatus.APPROVED);
        reservationMapper.updateStatus(reservation.getReservationId(), reservation.getStatus());

        return approval;
    }

    @Transactional
    public Approval rejectReservation(Integer reservationId, String reason) {
        Reservation reservation = reservationMapper.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("预约记录不存在"));

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING) {
            throw new RuntimeException("只能驳回待处理的预约");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("驳回理由不能为空");
        }

        // 创建审批记录
        Approval approval = new Approval();
        approval.setReservation(reservation);
        approval.setApprovalResult(false);
        approval.setRejectReason(reason.trim());
        approvalMapper.insert(approval);

        reservation.setStatus(Reservation.ReservationStatus.REJECTED);
        reservationMapper.updateStatus(reservation.getReservationId(), reservation.getStatus());

        return approval;
    }

    public Reservation cancelReservation(Integer reservationId, User user) {
        Reservation reservation = reservationMapper.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("预约记录不存在"));

        if (!reservation.getUser().getUserId().equals(user.getUserId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("无权取消此预约");
        }

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING &&
                reservation.getStatus() != Reservation.ReservationStatus.APPROVED) {
            throw new RuntimeException("只能取消待处理或已批准的预约");
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationMapper.updateStatus(reservation.getReservationId(), reservation.getStatus());
        return reservation;
    }

    @Transactional
    public Confirmation confirmUsage(Integer reservationId, Confirmation.ConfirmType confirmType, User user) {
        Reservation reservation = reservationMapper.findWithDetailsById(reservationId)
                .orElseThrow(() -> new RuntimeException("预约记录不存在"));

        if (!reservation.getUser().getUserId().equals(user.getUserId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new RuntimeException("无权确认此预约");
        }

        if (reservation.getStatus() != Reservation.ReservationStatus.APPROVED) {
            throw new RuntimeException("只能确认已通过的预约");
        }

        if (confirmationMapper.existsByReservationId(reservation.getReservationId())) {
            throw new RuntimeException("该预约已确认使用");
        }

        Confirmation confirmation = new Confirmation();
        confirmation.setReservation(reservation);
        confirmation.setConfirmType(confirmType);
        confirmation.setConfirmedAt(LocalDateTime.now());
        confirmationMapper.insert(confirmation);

        reservation.setStatus(Reservation.ReservationStatus.COMPLETED);
        reservationMapper.updateStatus(reservation.getReservationId(), reservation.getStatus());

        return confirmation;
    }

    @Transactional
    public Confirmation confirmUsageByScan(Integer reservationId) {
        Reservation reservation = reservationMapper.findWithDetailsById(reservationId)
                .orElseThrow(() -> new RuntimeException("预约记录不存在"));

        if (reservation.getStatus() != Reservation.ReservationStatus.APPROVED) {
            throw new RuntimeException("只能确认已通过的预约");
        }

        if (confirmationMapper.existsByReservationId(reservation.getReservationId())) {
            throw new RuntimeException("该预约已确认使用");
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (reservation.getReservationDate().isBefore(today)) {
            throw new RuntimeException("该预约已过期，无法确认");
        }

        if (reservation.getReservationDate().equals(today)) {
            LocalTime startTime = reservation.getStartTime();
            LocalTime endTime = reservation.getEndTime();

            if (now.isAfter(endTime.plusHours(1))) {
                throw new RuntimeException("会议已结束超过1小时，无法确认");
            }

            if (now.isBefore(startTime.minusHours(2))) {
                throw new RuntimeException("距离会议开始时间超过2小时，无法确认");
            }
        } else if (reservation.getReservationDate().isAfter(today.plusDays(1))) {
            throw new RuntimeException("只能确认今天或明天的预约");
        }

        Confirmation confirmation = new Confirmation();
        confirmation.setReservation(reservation);
        confirmation.setConfirmType(Confirmation.ConfirmType.SCAN);
        confirmation.setConfirmedAt(LocalDateTime.now());
        confirmationMapper.insert(confirmation);

        reservation.setStatus(Reservation.ReservationStatus.COMPLETED);
        reservationMapper.updateStatus(reservation.getReservationId(), reservation.getStatus());

        return confirmation;
    }

    public List<Reservation> getUserReservations(User user) {
        return reservationMapper.findByUserIdOrderByCreatedAtDesc(user.getUserId());
    }

    public List<Reservation> getAllReservations() {
        return reservationMapper.findAllWithDetails();
    }

    public List<Reservation> getWeeklyReservations(LocalDate startDate, LocalDate endDate) {
        return reservationMapper.findWeeklyReservationsWithDetails(startDate, endDate);
    }

    public List<Reservation> getReservationsByStatus(Reservation.ReservationStatus status) {
        return reservationMapper.findByStatusOrderByCreatedAtDesc(status);
    }


    public Optional<Reservation> getReservationById(Integer reservationId) {
        return reservationMapper.findById(reservationId);
    }

    public Optional<Reservation> getReservationWithDetailsById(Integer reservationId) {
        return reservationMapper.findWithDetailsById(reservationId);
    }
}

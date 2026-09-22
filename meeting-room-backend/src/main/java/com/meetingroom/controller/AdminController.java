package com.meetingroom.controller;

import com.meetingroom.entity.Approval;
import com.meetingroom.entity.MeetingRoom;
import com.meetingroom.entity.Reservation;
import com.meetingroom.entity.User;
import com.meetingroom.mapper.ApprovalMapper;
import com.meetingroom.service.AuthService;
import com.meetingroom.service.FileUploadService;
import com.meetingroom.service.MeetingRoomService;
import com.meetingroom.service.ReservationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final ReservationService reservationService;
    private final MeetingRoomService meetingRoomService;
    private final AuthService authService;
    private final ApprovalMapper approvalMapper;
    private final FileUploadService fileUploadService;

    /**
     * 4.1 添加会议室
     */
    @PostMapping(value = "/meeting-room/add", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> createRoom(Authentication authentication,
                                                          @ModelAttribute CreateRoomRequest request) {
        try {
            User admin = authService.getUserByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("当前管理员不存在"));

            // 参数验证
            if (request.getRoomName() == null || request.getRoomName().trim().isEmpty()) {
                return createErrorResponse(400, "房间名称不能为空");
            }
            if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
                return createErrorResponse(400, "房间号不能为空");
            }
            if (request.getBuilding() == null || request.getBuilding().trim().isEmpty()) {
                return createErrorResponse(400, "楼栋不能为空");
            }
            if (request.getCapacity() == null || request.getCapacity() <= 0) {
                return createErrorResponse(400, "容纳人数必须大于0");
            }

            String photoUrl = null;
            if (request.getPhotoFile() != null && !request.getPhotoFile().isEmpty()) {
                photoUrl = fileUploadService.uploadPhoto(request.getPhotoFile());
            } else if (request.getPhotoUrl() != null && !request.getPhotoUrl().trim().isEmpty()) {
                photoUrl = request.getPhotoUrl().trim();
            }

            String qrCodeUrl = null;
            if (request.getQrCodeFile() != null && !request.getQrCodeFile().isEmpty()) {
                qrCodeUrl = fileUploadService.uploadQrCode(request.getQrCodeFile());
            } else if (request.getQrCodeUrl() != null && !request.getQrCodeUrl().trim().isEmpty()) {
                qrCodeUrl = request.getQrCodeUrl().trim();
            }

            MeetingRoom room = new MeetingRoom();
            room.setRoomName(request.getRoomName().trim());
            room.setRoomNumber(request.getRoomNumber().trim());
            room.setBuilding(request.getBuilding().trim());
            room.setCapacity(request.getCapacity());
            if (request.getArea() != null) {
                room.setArea(request.getArea().doubleValue());
            }
            room.setDescription(request.getDescription());
            room.setPhotoUrl(photoUrl);
            room.setQrCodeUrl(qrCodeUrl);
            room.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() == 1 : true);

            MeetingRoom savedRoom = meetingRoomService.createRoom(admin, room);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "添加会议室成功");

            Map<String, Object> data = new HashMap<>();
            data.put("roomId", savedRoom.getRoomId());
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(400, e.getMessage());
        }
    }

    /**
     * 4.2 修改会议室
     */
    @PutMapping(value = "/meeting-room/{roomId}", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> updateRoom(@PathVariable Integer roomId, @ModelAttribute UpdateRoomRequest request) {
        try {
            // 参数验证
            if (roomId == null || roomId <= 0) {
                return createErrorResponse(400, "无效的会议室ID");
            }
            if (request.getRoomName() == null || request.getRoomName().trim().isEmpty()) {
                return createErrorResponse(400, "房间名称不能为空");
            }
            if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
                return createErrorResponse(400, "房间号不能为空");
            }
            if (request.getBuilding() == null || request.getBuilding().trim().isEmpty()) {
                return createErrorResponse(400, "楼栋不能为空");
            }
            if (request.getCapacity() == null || request.getCapacity() <= 0) {
                return createErrorResponse(400, "容纳人数必须大于0");
            }

            // 处理图片上传
            String photoUrl = request.getPhotoUrl();
            if (request.getPhotoFile() != null && !request.getPhotoFile().isEmpty()) {
                photoUrl = fileUploadService.uploadPhoto(request.getPhotoFile());
            }

            // 处理二维码上传
            String qrCodeUrl = request.getQrCodeUrl();
            if (request.getQrCodeFile() != null && !request.getQrCodeFile().isEmpty()) {
                qrCodeUrl = fileUploadService.uploadQrCode(request.getQrCodeFile());
            }

            MeetingRoom room = new MeetingRoom();
            room.setRoomId(roomId);
            room.setRoomName(request.getRoomName().trim());
            room.setRoomNumber(request.getRoomNumber().trim());
            room.setBuilding(request.getBuilding().trim());
            room.setCapacity(request.getCapacity());
            room.setArea(request.getArea());
            room.setDescription(request.getDescription());
            room.setPhotoUrl(photoUrl);
            room.setQrCodeUrl(qrCodeUrl);
            room.setIsAvailable(request.getIsAvailable() == 1);

            MeetingRoom updatedRoom = meetingRoomService.updateRoom(roomId, room);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "修改会议室成功");
            response.put("data", Collections.singletonMap("roomId", updatedRoom.getRoomId()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(400, e.getMessage());
        }
    }

    /**
     * 4.3 删除会议室
     */
    @DeleteMapping("/meeting-room/delete/{roomId}")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable Integer roomId) {
        try {
            if (roomId == null) {
                return createErrorResponse(400, "会议室ID不能为空");
            }

            meetingRoomService.deleteRoom(roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "删除会议室成功");
            response.put("data", null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(400, e.getMessage());
        }
    }

    /**
     * 4.4 审批预约
     */
    @PostMapping("/reservation/approve")
    public ResponseEntity<Map<String, Object>> approveReservation(@RequestBody ApproveRequest request) {
        try {
            // 参数验证
            if (request.getReservationId() == null) {
                return createErrorResponse(400, "预约ID不能为空");
            }
            if (request.getApprovalResult() == null) {
                return createErrorResponse(400, "审批结果不能为空");
            }
            if (request.getApprovalResult() != 0 && request.getApprovalResult() != 1) {
                return createErrorResponse(400, "审批结果参数错误");
            }
            if (request.getApprovalResult() == 0 && (request.getRejectReason() == null || request.getRejectReason().trim().isEmpty())) {
                return createErrorResponse(400, "驳回时必须填写驳回理由");
            }

            Approval approval;
            if (request.getApprovalResult() == 1) {
                approval = reservationService.approveReservation(request.getReservationId());
            } else {
                approval = reservationService.rejectReservation(request.getReservationId(), request.getRejectReason());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "审批成功");
            Map<String, Object> data = new HashMap<>();
            data.put("approvalId", approval.getApprovalId()); // 自增主键
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(500, "审批失败: " + e.getMessage());
        }
    }

    /**
     * 4.5 查看预约记录
     * 默认展示所有预约，可通过status参数筛选某一状态的预约
     * status: 0-待审批, 1-已通过, 2-已驳回, 3-已取消, 4-已完成
     */
    @GetMapping("/reservation/list")
    public ResponseEntity<Map<String, Object>> getAllReservations(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status) {
        try {
            // 参数验证
            if (page == null || page <= 0) {
                page = 1;
            }
            if (size == null || size <= 0) {
                size = 10;
            }
            if (status != null && (status < 0 || status > 4)) {
                return createErrorResponse(400, "预约状态参数错误，状态值应为0-4");
            }

            // 默认获取所有预约
            List<Reservation> reservations = reservationService.getAllReservations();

            // 根据状态筛选
            if (status != null) {
                final Integer finalStatus = status;
                reservations = reservations.stream()
                        .filter(r -> r.getStatus().ordinal() == finalStatus)
                        .collect(Collectors.toList());
            }

            // 分页处理
            int total = reservations.size();
            int fromIndex = Math.min((page - 1) * size, total);
            int toIndex = Math.min(fromIndex + size, total);
            List<Reservation> pagedList = reservations.subList(fromIndex, toIndex);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");

            Map<String, Object> data = new HashMap<>();
            data.put("total", total);
            data.put("page", page);
            data.put("size", size);

            // 修复类型推断问题
            List<Map<String, Object>> reservationList = new ArrayList<>();
            for (Reservation reservation : pagedList) {
                reservationList.add(convertToReservationDTO(reservation));
            }
            data.put("list", reservationList);

            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 4.6 获取预约详情（包含完整的审批信息）
     */
    @GetMapping("/reservation/{reservationId}/details")
    public ResponseEntity<Map<String, Object>> getReservationDetails(@PathVariable Integer reservationId) {
        try {
            if (reservationId == null) {
                return createErrorResponse(400, "预约ID不能为空");
            }

            // 使用带详情的方法
            Reservation reservation = reservationService.getReservationWithDetailsById(reservationId)
                    .orElseThrow(() -> new RuntimeException("预约记录不存在"));

            // 获取审批信息
            Approval approval = approvalMapper.findByReservationId(reservation.getReservationId()).orElse(null);

            // 构建详细响应
            Map<String, Object> reservationDetails = convertToReservationDetailDTO(reservation);

            // 添加审批详情
            if (approval != null) {
                reservationDetails.put("approvalTime", approval.getCreatedAt());
                reservationDetails.put("approvalResult", approval.getApprovalResult());
                reservationDetails.put("rejectReason", approval.getRejectReason());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");
            response.put("data", reservationDetails);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(404, e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 4.7 每视图-按时间查看
     */
    @GetMapping("/schedule/week")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate weekStartDate) {
        try {
            if (weekStartDate == null) {
                return createErrorResponse(400, "周开始日期不能为空");
            }

            LocalDate endDate = weekStartDate.plusDays(6);
            List<Reservation> reservations = reservationService.getWeeklyReservations(weekStartDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");

            Map<String, Object> data = new HashMap<>();
            data.put("weekStartDate", weekStartDate.toString());
            data.put("schedule", convertToWeeklySchedule(reservations, weekStartDate));
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(400, "响应错误");
        }
    }

    /**
     * 4.8 周视图-按会议室查看
     */
    @GetMapping("/schedule/room")
    public ResponseEntity<Map<String, Object>> getRoomWeeklySchedule(
            @RequestParam String weekStartDate,
            @RequestParam Integer roomId) {
        try {
            if (weekStartDate == null || weekStartDate.trim().isEmpty()) {
                return createErrorResponse(400, "周开始日期不能为空");
            }
            if (roomId == null || roomId <= 0) {
                return createErrorResponse(400, "会议室ID不能为空");
            }

            LocalDate startDate;
            try {
                startDate = LocalDate.parse(weekStartDate);
            } catch (Exception e) {
                return createErrorResponse(400, "日期格式错误");
            }

            MeetingRoom room = meetingRoomService.getRoomById(roomId);
            LocalDate endDate = startDate.plusDays(6);
            List<Reservation> allReservations = reservationService.getWeeklyReservations(startDate, endDate);

            List<Reservation> reservations = allReservations.stream()
                    .filter(r -> r.getMeetingRoom().getRoomId().equals(roomId))
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("roomId", room.getRoomId());
            data.put("roomName", room.getRoomName());
            data.put("roomNumber", room.getRoomNumber());
            data.put("building", room.getBuilding());
            data.put("weekStartDate", startDate.toString());
            data.put("schedule", convertToRoomWeeklySchedule(reservations, startDate));
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("不存在")) {
                return createErrorResponse(400, e.getMessage());
            }
            return createErrorResponse(400, "查询失败: " + e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(400, "查询失败");
        }
    }

    // 数据转换方法
    private Map<String, Object> convertToReservationDTO(Reservation reservation) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("reservationId", reservation.getReservationId());
        dto.put("userId", reservation.getUser().getUserId());
        dto.put("userName", reservation.getUser().getUsername());
        dto.put("roomId", reservation.getMeetingRoom().getRoomId());
        dto.put("roomName", reservation.getMeetingRoom().getRoomName());
        dto.put("roomNumber", reservation.getMeetingRoom().getRoomNumber());
        dto.put("building", reservation.getMeetingRoom().getBuilding());
        dto.put("reservationDate", reservation.getReservationDate().toString());
        dto.put("startTime", reservation.getStartTime().toString());
        dto.put("endTime", reservation.getEndTime().toString());
        dto.put("meetingTopic", reservation.getMeetingTopic());
        dto.put("attendance", reservation.getAttendance());
        dto.put("reservationStatus", reservation.getStatus().ordinal());
        dto.put("createdAt", reservation.getCreatedAt());
        return dto;
    }

    private Map<String, Object> convertToReservationDetailDTO(Reservation reservation) {
        Map<String, Object> dto = convertToReservationDTO(reservation);

        // 添加详细信息
        dto.put("userPhone", reservation.getUser().getPhone());
        dto.put("userRole", reservation.getUser().getRole().name());

        // 添加会议室详细信息
        MeetingRoom room = reservation.getMeetingRoom();
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("capacity", room.getCapacity());
        roomInfo.put("area", room.getArea());
        roomInfo.put("description", room.getDescription());
        dto.put("roomDetails", roomInfo);

        return dto;
    }

    private Map<String, Object> convertToRoomDTO(MeetingRoom room) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("roomId", room.getRoomId());
        dto.put("roomName", room.getRoomName());
        dto.put("roomNumber", room.getRoomNumber());
        dto.put("building", room.getBuilding());
        dto.put("capacity", room.getCapacity());
        dto.put("area", room.getArea());
        dto.put("description", room.getDescription());
        dto.put("photoUrl", room.getPhotoUrl());
        dto.put("qrCodeUrl", room.getQrCodeUrl());
        dto.put("isAvailable", room.getIsAvailable() ? 1 : 0);
        return dto;
    }

    private List<Map<String, Object>> convertToWeeklySchedule(List<Reservation> reservations, LocalDate weekStartDate) {
        Map<String, List<Map<String, Object>>> dayReservations = new LinkedHashMap<>();
        dayReservations.put("monday", new ArrayList<>());
        dayReservations.put("tuesday", new ArrayList<>());
        dayReservations.put("wednesday", new ArrayList<>());
        dayReservations.put("thursday", new ArrayList<>());
        dayReservations.put("friday", new ArrayList<>());
        dayReservations.put("saturday", new ArrayList<>());
        dayReservations.put("sunday", new ArrayList<>());

        for (Reservation reservation : reservations) {
            MeetingRoom room = reservation.getMeetingRoom();
            int dayOfWeek = reservation.getReservationDate().getDayOfWeek().getValue() - 1;
            String dayName = getDayName(dayOfWeek);

            Map<String, Object> reservationItem = new LinkedHashMap<>();
            reservationItem.put("roomId", room.getRoomId());
            reservationItem.put("roomName", room.getRoomName());
            reservationItem.put("roomNumber", room.getRoomNumber());
            reservationItem.put("building", room.getBuilding());
            reservationItem.put("timeSlot", reservation.getStartTime() + "-" + reservation.getEndTime());
            reservationItem.put("reservationId", reservation.getReservationId());
            reservationItem.put("meetingTopic", reservation.getMeetingTopic());
            reservationItem.put("status", reservation.getStatus().ordinal());

            dayReservations.get(dayName.toLowerCase()).add(reservationItem);
        }

        for (List<Map<String, Object>> dayList : dayReservations.values()) {
            dayList.sort((r1, r2) -> {
                Integer roomId1 = (Integer) r1.get("roomId");
                Integer roomId2 = (Integer) r2.get("roomId");
                int roomCompare = roomId1.compareTo(roomId2);
                if (roomCompare != 0) {
                    return roomCompare;
                }
                String timeSlot1 = (String) r1.get("timeSlot");
                String timeSlot2 = (String) r2.get("timeSlot");
                return timeSlot1.compareTo(timeSlot2);
            });
        }

        Map<String, Object> weekSchedule = new LinkedHashMap<>();
        weekSchedule.put("monday", dayReservations.get("monday"));
        weekSchedule.put("tuesday", dayReservations.get("tuesday"));
        weekSchedule.put("wednesday", dayReservations.get("wednesday"));
        weekSchedule.put("thursday", dayReservations.get("thursday"));
        weekSchedule.put("friday", dayReservations.get("friday"));
        weekSchedule.put("saturday", dayReservations.get("saturday"));
        weekSchedule.put("sunday", dayReservations.get("sunday"));

        return Collections.singletonList(weekSchedule);
    }

    private List<Map<String, Object>> convertToDailySchedule(List<Reservation> reservations, LocalDate date) {
        List<Map<String, Object>> timeSlots = new ArrayList<>();

        for (int hour = 8; hour <= 17; hour++) {
            Map<String, Object> timeSlot = new HashMap<>();
            String timeSlotStr = String.format("%02d:00-%02d:00", hour, hour + 1);
            timeSlot.put("timeSlot", timeSlotStr);

            List<Map<String, Object>> roomsStatus = new ArrayList<>();

            for (Reservation reservation : reservations) {
                if (reservation.getReservationDate().equals(date)) {
                    LocalTime start = reservation.getStartTime();
                    LocalTime end = reservation.getEndTime();
                    LocalTime slotStart = LocalTime.of(hour, 0);
                    LocalTime slotEnd = LocalTime.of(hour + 1, 0);

                    if ((start.isBefore(slotEnd) && end.isAfter(slotStart))) {
                        Map<String, Object> roomStatus = new HashMap<>();
                        roomStatus.put("roomId", reservation.getMeetingRoom().getRoomId());
                        roomStatus.put("roomName", reservation.getMeetingRoom().getRoomName());
                        roomStatus.put("roomNumber", reservation.getMeetingRoom().getRoomNumber());
                        roomStatus.put("building", reservation.getMeetingRoom().getBuilding());
                        roomStatus.put("isOccupied", true);
                        roomStatus.put("reservationId", reservation.getReservationId());
                        roomStatus.put("meetingTopic", reservation.getMeetingTopic());
                        roomsStatus.add(roomStatus);
                    }
                }
            }

            timeSlot.put("rooms", roomsStatus);
            timeSlots.add(timeSlot);
        }
        return timeSlots;
    }

    private Map<String, List<Map<String, Object>>> convertToRoomWeeklySchedule(List<Reservation> reservations, LocalDate weekStartDate) {
        Map<String, List<Map<String, Object>>> schedule = new LinkedHashMap<>();
        schedule.put("monday", new ArrayList<>());
        schedule.put("tuesday", new ArrayList<>());
        schedule.put("wednesday", new ArrayList<>());
        schedule.put("thursday", new ArrayList<>());
        schedule.put("friday", new ArrayList<>());
        schedule.put("saturday", new ArrayList<>());
        schedule.put("sunday", new ArrayList<>());

        for (Reservation reservation : reservations) {
            int dayOfWeek = reservation.getReservationDate().getDayOfWeek().getValue() - 1;
            String dayName = getDayName(dayOfWeek);

            Map<String, Object> reservationItem = new LinkedHashMap<>();
            reservationItem.put("timeSlot", reservation.getStartTime() + "-" + reservation.getEndTime());
            reservationItem.put("reservationId", reservation.getReservationId());
            reservationItem.put("meetingTopic", reservation.getMeetingTopic());
            reservationItem.put("status", reservation.getStatus().ordinal());

            schedule.get(dayName.toLowerCase()).add(reservationItem);
        }

        for (List<Map<String, Object>> dayList : schedule.values()) {
            dayList.sort((r1, r2) -> {
                String timeSlot1 = (String) r1.get("timeSlot");
                String timeSlot2 = (String) r2.get("timeSlot");
                return timeSlot1.compareTo(timeSlot2);
            });
        }

        return schedule;
    }

    private String getDayName(int dayIndex) {
        String[] days = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"};
        return days[dayIndex];
    }

    // 统一错误响应构建方法
    private ResponseEntity<Map<String, Object>> createErrorResponse(int code, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("message", message);
        response.put("data", null);

        switch (code) {
            case 400:
                return ResponseEntity.badRequest().body(response);
            case 401:
                return ResponseEntity.status(401).body(response);
            case 403:
                return ResponseEntity.status(403).body(response);
            case 404:
                return ResponseEntity.status(404).body(response);
            default:
                return ResponseEntity.status(500).body(response);
        }
    }

    // DTO 类
    @Data
    public static class ApproveRequest {
        private Integer reservationId;
        private Integer approvalResult;
        private String rejectReason;
    }

    @Data
    public static class CreateRoomRequest {
        private String roomName;
        private String roomNumber;
        private String building;
        private Integer capacity;
        private BigDecimal area;
        private String description;
        private MultipartFile photoFile;
        private String photoUrl;
        private MultipartFile qrCodeFile;
        private String qrCodeUrl;
        private Integer isAvailable = 1;
    }

    @Data
    public static class UpdateRoomRequest {
        private Integer roomId;
        private String roomName;
        private String roomNumber;
        private String building;
        private Integer capacity;
        private Double area;
        private String description;
        private String photoUrl;
        private String qrCodeUrl;
        private Integer isAvailable;
        private MultipartFile photoFile;
        private MultipartFile qrCodeFile;
    }

    @Data
    public static class AvailabilityRequest {
        private Integer roomId;
        private Integer isAvailable;
    }
}

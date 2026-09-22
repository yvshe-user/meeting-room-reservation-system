package com.meetingroom.controller;

import com.meetingroom.entity.MeetingRoom;
import com.meetingroom.service.MeetingRoomService;
import com.meetingroom.service.ReservationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.format.DateTimeParseException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meeting-room")
@Slf4j
@RequiredArgsConstructor
public class MeetingRoomController {
    private final MeetingRoomService meetingRoomService;
    private final ReservationService reservationService;

    /**
     * 2.1 查看所有会议室
     * 接口功能：获取所有可用的会议室列表，支持分页查询。可通过容纳人数、楼栋、状态进行筛选
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllRooms(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) Integer isAvailable) {
        try {
            // 参数验证
            if (page == null || page <= 0) {
                page = 1;
            }
            if (size == null || size <= 0) {
                size = 10;
            }

            List<MeetingRoom> rooms = meetingRoomService.getAllRooms();

            // 根据条件过滤
            if (capacity != null) {
                final Integer finalCapacity = capacity;
                rooms = rooms.stream()
                        .filter(room -> room.getCapacity() >= finalCapacity)
                        .collect(Collectors.toList());
            }
            if (building != null && !building.trim().isEmpty()) {
                final String finalBuilding = building;
                rooms = rooms.stream()
                        .filter(room -> room.getBuilding().equals(finalBuilding))
                        .collect(Collectors.toList());
            }
            if (isAvailable != null) {
                final boolean available = isAvailable == 1;
                rooms = rooms.stream()
                        .filter(room -> room.getIsAvailable().equals(available))
                        .collect(Collectors.toList());
            }

            // 分页处理
            int total = rooms.size();
            int fromIndex = Math.min((page - 1) * size, total);
            int toIndex = Math.min(fromIndex + size, total);
            List<MeetingRoom> pagedList = rooms.subList(fromIndex, toIndex);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");

            Map<String, Object> data = new HashMap<>();
            data.put("total", total);
            data.put("page", page);
            data.put("size", size);

            List<Map<String, Object>> roomList = new ArrayList<>();
            for (MeetingRoom room : pagedList) {
                roomList.add(convertToRoomDTO(room));
            }
            data.put("list", roomList);

            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 2.2 根据条件筛选会议室（快速预约）
     * 接口功能：根据预约日期、开始时间、结束时间、参会人数、楼栋等条件筛选合适的可用会议室
     */
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAvailableRooms(@RequestBody Map<String, Object> params) {
        try {
            LocalDate reservationDate = params.get("reservationDate") != null
                    ? LocalDate.parse((String) params.get("reservationDate")) : null;
            LocalTime startTime = params.get("startTime") != null
                    ? LocalTime.parse((String) params.get("startTime")) : null;
            LocalTime endTime = params.get("endTime") != null
                    ? LocalTime.parse((String) params.get("endTime")) : null;
            Integer attendance = params.get("attendance") != null
                    ? Integer.valueOf(params.get("attendance").toString()) : null;
            String building = (String) params.get("building");

            if (reservationDate == null) {
                return createErrorResponse(400, "预约日期不能为空");
            }
            if (startTime == null) {
                return createErrorResponse(400, "开始时间不能为空");
            }
            if (endTime == null) {
                return createErrorResponse(400, "结束时间不能为空");
            }
            if (attendance == null || attendance <= 0) {
                return createErrorResponse(400, "参会人数必须大于0");
            }

            validateTimeSlot(startTime, endTime);

            if (startTime.isAfter(endTime)) {
                return createErrorResponse(400, "开始时间不能晚于结束时间");
            }
            if (reservationDate.isBefore(LocalDate.now())) {
                return createErrorResponse(400, "不能预约过去的日期");
            }

            List<MeetingRoom> availableRoomsList = reservationService.getAvailableRooms(
                    reservationDate, startTime, endTime, attendance, building);

            List<Map<String, Object>> availableRooms = new ArrayList<>();
            for (MeetingRoom room : availableRoomsList) {
                availableRooms.add(convertToRoomDTO(room));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");
            response.put("data", availableRooms);

            return ResponseEntity.ok(response);
        } catch (DateTimeParseException e) {
            return createErrorResponse(400, "日期或时间格式错误，请使用 yyyy-MM-dd 或 HH:mm:ss 格式");
        } catch (NumberFormatException e) {
            return createErrorResponse(400, "参会人数必须是数字");
        } catch (IllegalArgumentException e) {
            return createErrorResponse(400, e.getMessage());
        } catch (Exception e) {
            log.error("系统异常:", e);
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 获取会议室详情
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoomDetail(@PathVariable Integer roomId) {
        try {
            if (roomId == null) {
                return createErrorResponse(400, "会议室ID不能为空");
            }

            MeetingRoom room = meetingRoomService.getRoomById(roomId);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");
            response.put("data", convertToRoomDetailDTO(room));

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(404, e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 获取所有楼栋列表
     */
    @GetMapping("/buildings")
    public ResponseEntity<Map<String, Object>> getAllBuildings() {
        try {
            List<MeetingRoom> rooms = meetingRoomService.getAllRooms();

            // 提取不重复的楼栋列表
            List<String> buildings = rooms.stream()
                    .map(MeetingRoom::getBuilding)
                    .distinct()
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "查询成功");
            response.put("data", buildings);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 验证时间段是否符合要求（以1小时为单位的连续时间段）
     */
    private void validateTimeSlot(LocalTime startTime, LocalTime endTime) {
        // 验证是否为整点小时
        if (startTime.getMinute() != 0 || startTime.getSecond() != 0 ||
                endTime.getMinute() != 0 || endTime.getSecond() != 0) {
            throw new IllegalArgumentException("时间段必须以整点小时为单位（例如：09:00, 10:00）");
        }

        // 验证开始时间必须早于结束时间
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("开始时间必须早于结束时间");
        }

        // 验证时间段必须连续（以小时为单位）
        long durationHours = java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
        if (durationHours <= 0) {
            throw new IllegalArgumentException("时间段必须连续且至少1小时");
        }

        // 验证时间段是否在合理范围内
        LocalTime earliestTime = LocalTime.of(8, 0);
        LocalTime latestTime = LocalTime.of(22, 0);
        if (startTime.isBefore(earliestTime) || endTime.isAfter(latestTime)) {
            throw new IllegalArgumentException("预约时间必须在08:00至22:00之间");
        }
    }

    // 数据转换方法
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

    private Map<String, Object> convertToRoomDetailDTO(MeetingRoom room) {
        Map<String, Object> dto = convertToRoomDTO(room);

        // 添加创建者信息
        if (room.getCreatedBy() != null) {
            Map<String, Object> creatorInfo = new HashMap<>();
            creatorInfo.put("userId", room.getCreatedBy().getUserId());
            creatorInfo.put("userName", room.getCreatedBy().getUsername());
            dto.put("createdBy", creatorInfo);
        }

        dto.put("createdAt", room.getCreatedAt());
        dto.put("updatedAt", room.getUpdatedAt());

        return dto;
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
    public static class SearchRequest {
        private LocalDate reservationDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer attendance;
        private String building;
    }
}

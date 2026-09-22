package com.meetingroom.controller;

import com.meetingroom.entity.Approval;
import com.meetingroom.entity.Confirmation;
import com.meetingroom.entity.Reservation;
import com.meetingroom.entity.User;
import com.meetingroom.mapper.UserMapper;
import com.meetingroom.service.ReservationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    private final UserMapper userMapper;

    /**
     * 3.1 创建预约
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createReservation(Authentication authentication,
                                                                 @RequestBody CreateReservationRequest request) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return createErrorResponse(401, "请先登录");
            }

            String username = authentication.getName(); // 默认是用户名
            User currentUser = userMapper.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("当前用户不存在"));
            // 参数验证
            if (request.getRoomId() == null) {
                return createErrorResponse(400, "会议室ID不能为空");
            }
            if (request.getReservationDate() == null) {
                return createErrorResponse(400, "预约日期不能为空");
            }
            if (request.getStartTime() == null) {
                return createErrorResponse(400, "开始时间不能为空");
            }
            if (request.getEndTime() == null) {
                return createErrorResponse(400, "结束时间不能为空");
            }
            if (request.getMeetingTopic() == null || request.getMeetingTopic().trim().isEmpty()) {
                return createErrorResponse(400, "会议主题不能为空");
            }
            if (request.getAttendance() == null || request.getAttendance() <= 0) {
                return createErrorResponse(400, "参会人数必须大于0");
            }

            Reservation reservation = reservationService.createReservation(
                    currentUser, request.getRoomId(), request.getMeetingTopic().trim(), request.getAttendance(),
                    request.getReservationDate(), request.getStartTime(), request.getEndTime());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "预约创建成功，等待审批");

            Map<String, Object> data = new HashMap<>();
            data.put("reservationId", reservation.getReservationId());
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(400, e.getMessage());
        }
    }

    /**
     * 3.2 查询我的预约记录
     */
    @GetMapping("/my-list")
    public ResponseEntity<Map<String, Object>> getMyReservations(Authentication authentication,
                                                                 @RequestParam(defaultValue = "1") Integer page,
                                                                 @RequestParam(defaultValue = "10") Integer size,
                                                                 @RequestParam(required = false) Integer status) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return createErrorResponse(401, "请先登录");
            }
            String username = authentication.getName();
            User currentUser = userMapper.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("当前用户不存在"));

            // 参数验证
            if (page == null || page <= 0) {
                page = 1;
            }
            if (size == null || size <= 0) {
                size = 10;
            }

            List<Reservation> reservations;
            if (status != null) {
                if (status < 0 || status > 4) {
                    return createErrorResponse(400, "预约状态参数错误");
                }
                reservations = reservationService.getReservationsByStatus(
                        Reservation.ReservationStatus.values()[status]);

                // 过滤当前用户的预约
                reservations = reservations.stream()
                        .filter(r -> r.getUser().getUserId().equals(currentUser.getUserId()))
                        .collect(Collectors.toList());
            } else {
                reservations = reservationService.getUserReservations(currentUser);
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
            return createErrorResponse(500, "服务器内部错误" + e.getMessage());
        }
    }

    /**
     * 3.3 取消预约
     */
    @PutMapping("/cancel/{reservationId}")
    public ResponseEntity<Map<String, Object>> cancelReservation(Authentication authentication,
                                                                 @PathVariable Integer reservationId) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return createErrorResponse(401, "请先登录");
            }
            String username = authentication.getName();
            User currentUser = userMapper.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("当前用户不存在"));

            if (reservationId == null) {
                return createErrorResponse(400, "预约ID不能为空");
            }

            Reservation reservation = reservationService.cancelReservation(reservationId, currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "取消预约成功");
            response.put("data", null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return createErrorResponse(400, e.getMessage());
        }
    }

    /**
     * 3.4 确认使用会议室
     */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmUsage(Authentication authentication,
                                                            @RequestBody ConfirmRequest request) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return createErrorResponse(401, "请先登录");
            }
            String username = authentication.getName();
            User currentUser = userMapper.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("当前用户不存在"));

            // 参数验证
            if (request.getReservationId() == null) {
                return createErrorResponse(400, "预约ID不能为空");
            }
            if (request.getConfirmType() == null || request.getConfirmType().trim().isEmpty()) {
                return createErrorResponse(400, "确认方式不能为空");
            }

            Confirmation.ConfirmType confirmType;
            String confirmTypeStr = request.getConfirmType().trim().toLowerCase();
            if ("login".equals(confirmTypeStr)) {
                confirmType = Confirmation.ConfirmType.LOGIN;
            } else if ("scan".equals(confirmTypeStr)) {
                confirmType = Confirmation.ConfirmType.SCAN;
            } else {
                return createErrorResponse(400, "确认方式参数错误，应为login或scan");
            }

            Confirmation confirmation = reservationService.confirmUsage(request.getReservationId(), confirmType, currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "确认使用成功");

            Map<String, Object> data = new HashMap<>();
            data.put("confirmId", confirmation.getConfirmId());
            data.put("confirmedAt", confirmation.getConfirmedAt());
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(400, e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    /**
     * 3.5 扫码确认使用会议室（免登录）
     */
    @GetMapping("/confirm-by-scan")
    public ResponseEntity<Map<String, Object>> confirmUsageByScan(@RequestParam Integer reservationId) {
        try {
            if (reservationId == null) {
                return createErrorResponse(400, "预约ID不能为空");
            }

            Confirmation confirmation = reservationService.confirmUsageByScan(reservationId);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "确认使用成功");

            Map<String, Object> data = new HashMap<>();
            data.put("confirmId", confirmation.getConfirmId());
            data.put("confirmedAt", confirmation.getConfirmedAt());
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return createErrorResponse(400, e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

    // 数据转换方法
    private Map<String, Object> convertToReservationDTO(Reservation reservation) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("reservationId", reservation.getReservationId());
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

        // 添加状态描述
        String statusDescription = getStatusDescription(reservation.getStatus());
        dto.put("statusDescription", statusDescription);

        // 添加用户信息
        dto.put("userName", reservation.getUser().getUsername());
        dto.put("userPhone", reservation.getUser().getPhone());

        // 添加会议室详细信息
        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("capacity", reservation.getMeetingRoom().getCapacity());
        roomInfo.put("area", reservation.getMeetingRoom().getArea());
        roomInfo.put("description", reservation.getMeetingRoom().getDescription());
        dto.put("roomInfo", roomInfo);

        return dto;
    }

    private String getStatusDescription(Reservation.ReservationStatus status) {
        switch (status) {
            case PENDING:
                return "待审批";
            case APPROVED:
                return "已批准";
            case REJECTED:
                return "已驳回";
            case CANCELLED:
                return "已取消";
            case COMPLETED:
                return "已完成";
            default:
                return "未知状态";
        }
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
    public static class CreateReservationRequest {
        private Integer roomId;
        private LocalDate reservationDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String meetingTopic;
        private Integer attendance;
    }

    @Data
    public static class ConfirmRequest {
        private Integer reservationId;
        private String confirmType;
    }
}

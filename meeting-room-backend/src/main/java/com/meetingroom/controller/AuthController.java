package com.meetingroom.controller;

import com.meetingroom.entity.User;
import com.meetingroom.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    /**
     * 1.1 用户登录
     * 接口功能：用户登录系统，根据角色返回不同的登录结果
     * 请求URL：/api/auth/login
     * 请求方法：POST
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            // 参数验证
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return createErrorResponse(400, "用户名不能为空");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return createErrorResponse(400, "密码不能为空");
            }

            // 认证逻辑
            String token = authService.authenticate(request.getUsername().trim(), request.getPassword().trim());

            // 获取用户信息
            User user = authService.getUserByUsername(request.getUsername().trim())
                    .orElseThrow(() -> new RuntimeException("用户信息获取失败"));

            // 构建成功响应
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "登录成功");

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("userId", user.getUserId());
            data.put("userName", user.getUsername());
            data.put("role", user.getRole().name().toLowerCase());
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // 业务异常：用户名或密码错误
            return createErrorResponse(401, e.getMessage());
        } catch (Exception e) {
            // 系统异常
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 用户注册接口
     * 请求URL：/api/auth/register
     * 请求方法：POST
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        try {
            // 参数验证
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return createErrorResponse(400, "用户名不能为空");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return createErrorResponse(400, "密码不能为空");
            }
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return createErrorResponse(400, "手机号不能为空");
            }
            if (request.getPassword().length() < 6) {
                return createErrorResponse(400, "密码长度不能少于6位");
            }

            // 创建用户对象
            User user = new User();
            user.setUsername(request.getUsername().trim());
            user.setPassword(request.getPassword().trim());
            user.setPhone(request.getPhone().trim());
            user.setRole(User.UserRole.USER); // 默认注册为普通用户

            // 注册用户
            User registeredUser = authService.register(user);

            // 构建成功响应
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "注册成功");

            Map<String, Object> data = new HashMap<>();
            data.put("userId", registeredUser.getUserId());
            data.put("userName", registeredUser.getUsername());
            data.put("role", registeredUser.getRole().name().toLowerCase());
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // 业务异常：用户名已存在等
            return createErrorResponse(400, e.getMessage());
        } catch (Exception e) {
            // 系统异常
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 获取当前用户信息
     * 请求URL：/api/auth/user-info
     * 请求方法：GET
     */
    @GetMapping("/user-info")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // 从token中提取用户名
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return createErrorResponse(401, "未提供有效的认证信息");
            }

            String token = authorizationHeader.substring(7);
            String username = authService.getUsernameFromToken(token);

            // 获取用户信息
            User user = authService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));

            // 构建成功响应
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "获取用户信息成功");

            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getUserId());
            data.put("userName", user.getUsername());
            data.put("phone", user.getPhone());
            data.put("role", user.getRole().name().toLowerCase());
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return createErrorResponse(401, "认证信息无效");
        } catch (Exception e) {
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 修改密码接口
     * 请求URL：/api/auth/change-password
     * 请求方法：PUT
     */
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestHeader("Authorization") String authorizationHeader,
                                                              @RequestBody ChangePasswordRequest request) {
        try {
            // 验证认证信息
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return createErrorResponse(401, "未提供有效的认证信息");
            }

            // 参数验证
            if (request.getOldPassword() == null || request.getOldPassword().trim().isEmpty()) {
                return createErrorResponse(400, "原密码不能为空");
            }
            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                return createErrorResponse(400, "新密码不能为空");
            }
            if (request.getNewPassword().length() < 6) {
                return createErrorResponse(400, "新密码长度不能少于6位");
            }

            String token = authorizationHeader.substring(7);
            String username = authService.getUsernameFromToken(token);

            // 修改密码
            authService.changePassword(username, request.getOldPassword().trim(), request.getNewPassword().trim());

            // 构建成功响应
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "密码修改成功");
            response.put("data", null);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return createErrorResponse(400, e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 刷新token接口
     * 请求URL：/api/auth/refresh-token
     * 请求方法：POST
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return createErrorResponse(401, "未提供有效的认证信息");
            }

            String oldToken = authorizationHeader.substring(7);
            String username = authService.getUsernameFromToken(oldToken);

            // 生成新token
            String newToken = authService.refreshToken(username);

            // 构建成功响应
            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "token刷新成功");

            Map<String, Object> data = new HashMap<>();
            data.put("token", newToken);
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return createErrorResponse(401, "认证信息无效");
        } catch (Exception e) {
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 登出接口（客户端需要清除本地存储的token）
     * 请求URL：/api/auth/logout
     * 请求方法：POST
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return createErrorResponse(401, "未提供有效的认证信息");
            }

            String token = authorizationHeader.substring(7);
            String username = authService.getUsernameFromToken(token);

            authService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "登出成功");
            response.put("data", null);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return createErrorResponse(401, "认证信息无效");
        } catch (Exception e) {
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 修改个人信息接口
     * 请求URL：/api/auth/update-profile
     * 请求方法：PATCH
     */
    @PatchMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestHeader("Authorization") String authorizationHeader,
                                                             @RequestBody UpdateProfileRequest request) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return createErrorResponse(401, "未提供有效的认证信息");
            }

            String token = authorizationHeader.substring(7);
            String username = authService.getUsernameFromToken(token);

            if ((request.getUsername() == null || request.getUsername().trim().isEmpty()) &&
                    (request.getPhone() == null || request.getPhone().trim().isEmpty())) {
                return createErrorResponse(400, "至少需要提供一个要更新的字段");
            }

            User updatedUser = authService.updateProfile(username, request.getUsername(), request.getPhone());

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "个人信息更新成功");

            Map<String, Object> data = new HashMap<>();
            data.put("userId", updatedUser.getUserId());
            data.put("userName", updatedUser.getUsername());
            data.put("phone", updatedUser.getPhone());
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return createErrorResponse(400, e.getMessage());
        } catch (Exception e) {
            return createErrorResponse(500, "系统内部错误");
        }
    }

    /**
     * 统一错误响应构建方法
     */
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
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String phone;
    }

    @Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    public static class UpdateProfileRequest {
        private String username;
        private String phone;
    }

    @Data
    public static class AuthResponse {
        private final String token;
        private final Long userId;
        private final String userName;
        private final String role;

        public AuthResponse(String token, Long userId, String userName, String role) {
            this.token = token;
            this.userId = userId;
            this.userName = userName;
            this.role = role;
        }
    }
}

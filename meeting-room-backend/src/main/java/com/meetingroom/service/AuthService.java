package com.meetingroom.service;

import com.meetingroom.entity.User;
import com.meetingroom.mapper.UserMapper;
import com.meetingroom.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    public String authenticate(String username, String password) {
        UserDetails userDetails = loadUserByUsername(username);

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        return jwtUtil.generateToken(username);
    }

    public User register(User user) {
        if (userMapper.existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (userMapper.existsByPhone(user.getPhone())) {
            throw new RuntimeException("手机号已存在");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userMapper.insert(user);
        return user;
    }

    public Optional<User> getUserByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.getUsernameFromToken(token);
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.update(user);
    }

    public String refreshToken(String username) {
        userMapper.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return jwtUtil.generateToken(username);
    }

    public User updateProfile(String username, String newUsername, String newPhone) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        boolean updated = false;

        if (newUsername != null && !newUsername.trim().isEmpty()) {
            String trimmedUsername = newUsername.trim();
            if (!trimmedUsername.equals(user.getUsername())) {
                if (userMapper.existsByUsernameAndUserIdNot(trimmedUsername, user.getUserId())) {
                    throw new RuntimeException("用户名已存在");
                }
                user.setUsername(trimmedUsername);
                updated = true;
            }
        }

        if (newPhone != null && !newPhone.trim().isEmpty()) {
            String trimmedPhone = newPhone.trim();
            if (!trimmedPhone.equals(user.getPhone())) {
                if (!isValidChinesePhoneNumber(trimmedPhone)) {
                    throw new RuntimeException("手机号格式不正确，必须是以13~19开头的11位数字");
                }
                if (userMapper.existsByPhoneAndUserIdNot(trimmedPhone, user.getUserId())) {
                    throw new RuntimeException("手机号已被使用");
                }
                user.setPhone(trimmedPhone);
                updated = true;
            }
        }

        if (!updated) {
            throw new RuntimeException("没有需要更新的信息");
        }

        userMapper.update(user);
        return user;
    }

    private boolean isValidChinesePhoneNumber(String phone) {
        if (phone == null || phone.length() != 11) {
            return false;
        }
        if (!phone.matches("^\\d{11}$")) {
            return false;
        }
        return phone.startsWith("13") || phone.startsWith("14") ||
                phone.startsWith("15") || phone.startsWith("16") ||
                phone.startsWith("17") || phone.startsWith("18") ||
                phone.startsWith("19");
    }
}

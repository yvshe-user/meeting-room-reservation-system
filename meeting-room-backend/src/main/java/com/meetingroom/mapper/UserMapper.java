package com.meetingroom.mapper;

import com.meetingroom.entity.User;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

public interface UserMapper {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    boolean existsByUsernameAndUserIdNot(@Param("username") String username, @Param("userId") Integer userId);

    boolean existsByPhoneAndUserIdNot(@Param("phone") String phone, @Param("userId") Integer userId);

    int insert(User user);

    int update(User user);
}

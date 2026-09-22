-- 会议室预约系统数据库建表脚本
CREATE DATABASE IF NOT EXISTS `meeting_room_booking`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `meeting_room_booking`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `confirmation`;
DROP TABLE IF EXISTS `approval`;
DROP TABLE IF EXISTS `reservation`;
DROP TABLE IF EXISTS `meeting_room`;
DROP TABLE IF EXISTS `user`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `user` (
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `user_name` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码（PasswordEncoder 格式）',
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER' COMMENT '用户角色',
    `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_user_name` (`user_name`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';


CREATE TABLE `meeting_room` (
    `room_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会议室ID',
    `room_name` VARCHAR(100) NOT NULL COMMENT '房间名称',
    `room_number` VARCHAR(50) NOT NULL COMMENT '房间号',
    `building` VARCHAR(50) NOT NULL COMMENT '楼栋',
    `capacity` SMALLINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '容纳人数',
    `area` DECIMAL(10, 2) NULL COMMENT '面积(㎡)',
    `description` VARCHAR(500) NULL COMMENT '用途说明',
    `photo_url` VARCHAR(500) NULL COMMENT '会议室照片URL',
    `qr_code_url` VARCHAR(500) NULL COMMENT '二维码URL (扫码确认使用)',
    `is_available` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '可否预约: 0-否 1-可',
    `created_by` INT UNSIGNED NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`room_id`),
    UNIQUE KEY `uk_room_number` (`room_number`),
    CONSTRAINT `fk_room_creator`
        FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议室表';


CREATE TABLE `reservation` (
    `reservation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '预约ID',
    `user_id` INT UNSIGNED NOT NULL COMMENT '预约用户ID',
    `room_id` INT UNSIGNED NOT NULL COMMENT '会议室ID',
    `reservation_date` DATE NOT NULL COMMENT '预约日期: YYYY-MM-DD',
    `start_time` TIME NOT NULL COMMENT '开始时间: HH:mm:ss',
    `end_time` TIME NOT NULL COMMENT '结束时间: HH:mm:ss',
    `meeting_topic` VARCHAR(500) NOT NULL COMMENT '会议主题',
    `attendance` SMALLINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '预计参会人数',
    `reservation_status` TINYINT NOT NULL DEFAULT 0 COMMENT '预约状态: 0-待审批 1-已通过 2-已驳回 3-已取消 4-已完成',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (`reservation_id`),
    
    -- 外键约束（确保引用的用户和会议室存在）
    CONSTRAINT `fk_reservation_user` 
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) 
        ON DELETE CASCADE 
        ON UPDATE RESTRICT,
        
    CONSTRAINT `fk_reservation_room` 
        FOREIGN KEY (`room_id`) REFERENCES `meeting_room` (`room_id`) 
        ON DELETE CASCADE 
        ON UPDATE RESTRICT,

    -- 时间逻辑校验：结束时间必须晚于开始时间
    CONSTRAINT `chk_end_after_start` 
        CHECK (`end_time` > `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约记录表';


CREATE TABLE `approval` (
    `approval_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '审批记录ID',
    `reservation_id` INT UNSIGNED NOT NULL COMMENT '预约ID',
    `approval_result` TINYINT NOT NULL COMMENT '审批结果: 0-驳回 1-通过',
    `reject_reason` VARCHAR(500) NULL COMMENT '驳回理由',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审批时间',

    PRIMARY KEY (`approval_id`),

    -- 外键：关联预约记录
    CONSTRAINT `fk_approval_reservation`
        FOREIGN KEY (`reservation_id`)
        REFERENCES `reservation` (`reservation_id`)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    UNIQUE KEY `uk_reservation_once` (`reservation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批记录表';


CREATE TABLE `confirmation` (
    `confirm_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '确认ID',
    `reservation_id` INT UNSIGNED NOT NULL COMMENT '预约ID',
    `confirm_type` ENUM('login', 'scan') NULL COMMENT '确认方式: login-登录 scan-扫码',
    `confirmed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '确认使用时间',

    PRIMARY KEY (`confirm_id`),

    -- 外键：确保 reservation_id 必须存在于 reservation 表中
    CONSTRAINT `fk_confirmation_reservation`
        FOREIGN KEY (`reservation_id`)
        REFERENCES `reservation` (`reservation_id`)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,

    -- 可选：确保一个预约最多只有一条确认记录（业务逻辑需要时启用）
    UNIQUE KEY `uk_reservation_once` (`reservation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用确认表';

-- 显示表结构确认
SHOW TABLES;

-- 显示各表结构
DESC `user`;
DESC `meeting_room`;
DESC `reservation`;
DESC `approval`;
DESC `confirmation`;

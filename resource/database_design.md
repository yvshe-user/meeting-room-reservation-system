**① 用户表 (user)**

该表用于存储系统所有用户的基本信息，包括普通用户和管理员。

| **字段名** | **字段类型**          | **是否可为空** | **默认值** | **完整性约束** | **注释** |
| ---------- | --------------------- | -------------- | ---------- | -------------- | -------- |
| user_id    | INT UNSIGNED          | NOT NULL       |            | 主键，自增     | 用户 ID  |
| user_name  | VARCHAR(50)           | NOT NULL       |            | 唯一索引       | 用户名   |
| password   | CHAR(60)              | NOT NULL       |            |                | 密码     |
| role       | ENUM(‘user’, ‘admin’) | NOT NULL       | ‘user’     |                | 用户角色 |
| phone      | VARCHAR(20)           | NOT NULL       |            | 唯一索引       | 联系电话 |

**② 会议室表 (meeting_room)**

该表用于存储会议室的基本信息，包括房间名称、容纳人数等。

| **字段名**   | **字段类型**      | **是否可为空** | **默认值** | **完整性约束**       | **注释**                  |
| ------------ | ----------------- | -------------- | ---------- | -------------------- | ------------------------- |
| room_id      | INT UNSIGNED      | NOT NULL       |            | 主键，自增           | 会议室 ID                 |
| room_name    | VARCHAR(100)      | NOT NULL       |            |                      | 房间名称                  |
| room_number  | VARCHAR(50)       | NOT NULL       |            | 唯一索引             | 房间号                    |
| building     | VARCHAR(50)       | NOT NULL       |            |                      | 楼栋                      |
| capacity     | SMALLINT UNSIGNED | NOT NULL       | 1          | CHECK (capacity > 0) | 容纳人数                  |
| area         | DECIMAL(10, 2)    | NULL           |            |                      | 面积(㎡)                  |
| description  | VARCHAR(500)      | NULL           |            |                      | 用途说明                  |
| photo_url    | VARCHAR(500)      | NULL           |            |                      | 会议室照片 URL            |
| qr_code_url  | VARCHAR(500)      | NULL           |            |                      | 二维码 URL (扫码确认使用) |
| is_available | TINYINT(1)        | NOT NULL       | 1          |                      | 可否预约: 0-否 1-可       |

**③ 预约记录表 (reservation)**

该表用于存储用户的会议室预约记录，包括预约时间、审批状态等核心信息。

| **字段名**         | **字段类型**      | **是否可为空** | **默认值** | **完整性约束**                  | **注释**                                               |
| ------------------ | ----------------- | -------------- | ---------- | ------------------------------- | ------------------------------------------------------ |
| reservation_id     | INT UNSIGNED      | NOT NULL       |            | 主键，自增                      | 预约 ID                                                |
| user_id            | INT UNSIGNED      | NOT NULL       |            | 外键，关联 user.user_id         | 预约用户 ID                                            |
| room_id            | INT UNSIGNED      | NOT NULL       |            | 外键，关联 meeting_room.room_id | 会议室 ID                                              |
| reservation_date   | DATE              | NOT NULL       |            |                                 | 预约日期: YYYY-MM-DD                                   |
| start_time         | TIME              | NOT NULL       |            |                                 | 开始时间: HH:mm:ss                                     |
| end_time           | TIME              | NOT NULL       |            | CHECK (end_time > start_time)   | 结束时间: HH:mm:ss                                     |
| meeting_topic      | VARCHAR(500)      | NOT NULL       |            |                                 | 会议主题                                               |
| attendance         | SMALLINT UNSIGNED | NOT NULL       | 1          |                                 | 预计参会人数                                           |
| reservation_status | TINYINT           | NOT NULL       | 0          |                                 | 预约状态: 0-待审批 1-已通过 2-已驳回 3-已取消 4-已完成 |

**④ 审批记录表 (approval)**

该表用于存储管理员的审批记录，包括审批结果、驳回理由等核心信息。

| **字段名**      | **字段类型** | **是否可为空** | **默认值** | **完整性约束**                        | **注释**                |
| --------------- | ------------ | -------------- | ---------- | ------------------------------------- | ----------------------- |
| approval_id     | INT UNSIGNED | NOT NULL       |            | 主键，自增                            | 审批记录 ID             |
| reservation_id  | INT UNSIGNED | NOT NULL       |            | 外键，关联 reservation.reservation_id | 预约 ID                 |
| approval_result | TINYINT      | NOT NULL       |            |                                       | 审批结果: 0-驳回 1-通过 |
| reject_reason   | VARCHAR(500) | NULL           |            | approval_result = 0 时不可为空        | 驳回理由                |

**⑤ 使用确认表 (confirmation)**

该表用于记录用户确认使用会议室的信息，支持登录确认和扫码确认两种方式。

| **字段名**     | **字段类型**          | **是否可为空** | **默认值**        | **完整性约束**                        | **注释**                       |
| -------------- | --------------------- | -------------- | ----------------- | ------------------------------------- | ------------------------------ |
| confirm_id     | INT UNSIGNED          | NOT NULL       |                   | 主键，自增                            | 确认 ID                        |
| reservation_id | INT UNSIGNED          | NOT NULL       |                   | 外键，关联 reservation.reservation_id | 预约 ID                        |
| confirm_type   | ENUM(‘login’, ‘scan’) | NULL           |                   |                                       | 确认方式: login-登录 scan-扫码 |
| confirmed_at   | DATETIME              | NOT NULL       | CURRENT-TIMESTAMP |                                       | 确认使用时间                   |

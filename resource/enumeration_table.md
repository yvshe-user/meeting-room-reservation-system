# 枚举值对照表

本文档列出了会议室预约系统中所有枚举类型及其对应的值，供前端开发参考。

## 1. 预约状态 (ReservationStatus)

预约状态使用 **ORDINAL** 方式存储，在 API 响应中返回**数字**。

| 枚举值    | 数字值 | 中文说明 | 说明                       |
| --------- | ------ | -------- | -------------------------- |
| PENDING   | 0      | 待审批   | 预约已提交，等待管理员审批 |
| APPROVED  | 1      | 已通过   | 管理员已批准该预约         |
| REJECTED  | 2      | 已驳回   | 管理员已驳回该预约         |
| CANCELLED | 3      | 已取消   | 用户或管理员取消了预约     |
| COMPLETED | 4      | 已完成   | 预约已使用完成             |

### 使用场景

- **查看预约记录接口** (`GET /api/admin/reservation/list`)

  - 可通过 `status` 参数筛选：`status=0` 表示待审批，`status=1` 表示已通过，以此类推
  - 不传 `status` 参数则返回所有状态的预约

- **预约详情接口** (`GET /api/admin/reservation/{reservationId}/details`)

  - 响应中的 `reservationStatus` 字段返回数字值

- **周视图接口**
  - 响应中的 `status` 字段返回数字值

## 2. 用户角色 (UserRole)

用户角色使用 **STRING** 方式存储，在 API 响应中返回**字符串**。

| 枚举值 | 字符串值 | 中文说明 | 说明                                   |
| ------ | -------- | -------- | -------------------------------------- |
| ADMIN  | "ADMIN"  | 管理员   | 拥有所有权限，可审批预约、管理会议室等 |
| USER   | "USER"   | 普通用户 | 可创建预约、查看自己的预约等           |

### 使用场景

- **用户信息接口**
  - 响应中的 `userRole` 字段返回字符串 "ADMIN" 或 "USER"

## 3. 确认类型 (ConfirmType)

确认类型使用 **STRING** 方式存储，在 API 响应中返回**字符串**。

| 枚举值 | 字符串值 | 中文说明 | 说明                         |
| ------ | -------- | -------- | ---------------------------- |
| LOGIN  | "LOGIN"  | 登录确认 | 通过登录系统确认使用会议室   |
| SCAN   | "SCAN"   | 扫码确认 | 通过扫描二维码确认使用会议室 |

### 使用场景

- **确认使用接口** (`POST /api/reservation/confirm`)
  - 请求参数中的 `confirmType` 字段使用字符串值

## 4. 审批结果 (ApprovalResult)

审批结果使用 **Boolean** 类型存储，在 API 中可能以**数字**形式传递。

| 布尔值 | 数字值 | 中文说明 | 说明             |
| ------ | ------ | -------- | ---------------- |
| true   | 1      | 通过     | 管理员批准了预约 |
| false  | 0      | 驳回     | 管理员驳回了预约 |

### 使用场景

- **审批预约接口** (`POST /api/admin/reservation/approve`)
  - 请求参数中的 `approvalResult` 字段：`1` 表示通过，`0` 表示驳回
  - 响应中的 `approvalResult` 字段返回布尔值

## 5. 会议室可用状态 (IsAvailable)

会议室可用状态使用 **Boolean** 类型存储，在 API 中以**数字**形式传递和返回。

| 布尔值 | 数字值 | 中文说明 | 说明               |
| ------ | ------ | -------- | ------------------ |
| true   | 1      | 可用     | 会议室可以预约     |
| false  | 0      | 不可用   | 会议室暂时不可预约 |

### 使用场景

- **添加会议室接口** (`POST /api/admin/meeting-room/add`)

  - 请求参数中的 `isAvailable` 字段：`1` 表示可用，`0` 表示不可用（默认为 `1`）

- **修改会议室接口** (`PATCH /api/admin/meeting-room/{roomId}`)

  - 请求参数中的 `isAvailable` 字段：`1` 表示可用，`0` 表示不可用

- **会议室列表接口** (`GET /api/meeting-room/list`)
  - 请求参数中的 `isAvailable` 字段用于筛选：`1` 表示可用，`0` 表示不可用
  - 响应中的 `isAvailable` 字段返回数字值

## 6. HTTP 状态码

API 响应中的 `code` 字段对应 HTTP 状态码：

| code | HTTP 状态码               | 说明             |
| ---- | ------------------------- | ---------------- |
| 200  | 200 OK                    | 请求成功         |
| 400  | 400 Bad Request           | 请求参数错误     |
| 401  | 401 Unauthorized          | 未授权，需要登录 |
| 403  | 403 Forbidden             | 无权限访问       |
| 404  | 404 Not Found             | 资源不存在       |
| 500  | 500 Internal Server Error | 服务器内部错误   |

## 注意事项

1. **预约状态 (ReservationStatus)** 在数据库中存储为数字（0-4），API 响应中也返回数字，前端需要根据数字值进行判断和显示。

2. **用户角色 (UserRole)** 和 **确认类型 (ConfirmType)** 在数据库中存储为字符串，API 响应中也返回字符串，前端可以直接使用字符串进行比较。

3. **审批结果 (ApprovalResult)** 和 **会议室可用状态 (IsAvailable)** 在请求参数中使用数字（0/1），但在响应中可能返回布尔值或数字，前端需要兼容处理。

4. 所有枚举值都是**大小写敏感**的，前端在使用字符串枚举值时需要注意大小写。

## 示例代码

### JavaScript/TypeScript 示例

```typescript
// 预约状态枚举
enum ReservationStatus {
  PENDING = 0, // 待审批
  APPROVED = 1, // 已通过
  REJECTED = 2, // 已驳回
  CANCELLED = 3, // 已取消
  COMPLETED = 4, // 已完成
}

// 用户角色枚举
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

// 确认类型枚举
enum ConfirmType {
  LOGIN = "LOGIN",
  SCAN = "SCAN",
}

// 状态文本映射
const statusTextMap = {
  0: "待审批",
  1: "已通过",
  2: "已驳回",
  3: "已取消",
  4: "已完成",
};

// 使用示例
function getStatusText(status: number): string {
  return statusTextMap[status] || "未知状态";
}
```

### 状态筛选示例

```typescript
// 查看所有预约（不筛选）
GET /api/admin/reservation/list?page=1&size=10

// 查看待审批的预约
GET /api/admin/reservation/list?page=1&size=10&status=0

// 查看已通过的预约
GET /api/admin/reservation/list?page=1&size=10&status=1
```

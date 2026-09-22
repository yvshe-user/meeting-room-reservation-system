# 接口设计文档

## 1. 登录模块

### 1.1 用户登录

**接口功能**：用户登录系统，根据角色返回不同的登录结果

**请求 URL**：`/api/login`

**请求方法**：`POST`

**请求参数**：

```json
{
  "userName": "string",
  "password": "string"
}
```

| 参数名   | 类型   | 是否必填 | 说明   |
| -------- | ------ | -------- | ------ |
| userName | String | 是       | 用户名 |
| password | String | 是       | 密码   |

**响应格式**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "string",
    "userId": 1,
    "userName": "string",
    "role": "user"
  }
}
```

**错误响应示例**：

```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

**主要错误码**：

- 200: 登录成功
- 401: 用户名或密码错误
- 400: 参数错误

---

## 2. 会议室模块

### 2.1 查看所有会议室

**接口功能**：获取所有可用的会议室列表，支持分页查询。可通过容纳人数、楼栋、状态进行筛选，每个字段都可以单独筛选，也可以同时结合多个字段综合筛选

**请求 URL**：`/api/meeting-room/list`

**请求方法**：`GET`

**请求参数**：
| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| page | Integer | 否 | 页码，默认 1 |
| size | Integer | 否 | 每页数量，默认 10 |
| capacity | Integer | 否 | 容纳人数，筛选容纳人数大于等于该值的会议室 |
| building | String | 否 | 楼栋，筛选指定楼栋的会议室 |
| isAvailable | Integer | 否 | 是否可预约，0-否，1-是，不传则查询全部 |

**响应格式**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 10,
    "page": 1,
    "size": 10,
    "list": [
      {
        "roomId": 1,
        "roomName": "图书馆A区101会议室",
        "roomNumber": "LIB-A101",
        "building": "图书馆",
        "capacity": 20,
        "area": 50.0,
        "description": "用于日常会议",
        "photoUrl": "http://example.com/photo.jpg",
        "qrCodeUrl": "http://example.com/qrcode.jpg",
        "isAvailable": 1
      }
    ]
  }
}
```

**错误响应示例**：

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 500: 服务器内部错误

### 2.2 根据条件筛选会议室（快速预约）

**接口功能**：在快速预约页面，根据预约日期、开始时间、结束时间、参会人数、楼栋等条件筛选合适的可用会议室

**请求 URL**：`/api/meeting-room/search`

**请求方法**：`POST`

**请求参数**：

```json
{
  "reservationDate": "2024-01-15",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "attendance": 10,
  "building": "图书馆"
}
```

| 参数名          | 类型    | 是否必填 | 说明                       |
| --------------- | ------- | -------- | -------------------------- |
| reservationDate | String  | 是       | 预约日期，格式：YYYY-MM-DD |
| startTime       | String  | 是       | 开始时间，格式：HH:mm:ss   |
| endTime         | String  | 是       | 结束时间，格式：HH:mm:ss   |
| attendance      | Integer | 是       | 预计参会人数               |
| building        | String  | 否       | 楼栋，筛选指定楼栋的会议室 |

**响应格式**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "roomId": 1,
      "roomName": "图书馆A区101会议室",
      "roomNumber": "LIB-A101",
      "building": "图书馆",
      "capacity": 20,
      "area": 50.0,
      "description": "用于日常会议",
      "photoUrl": "http://example.com/photo.jpg",
      "qrCodeUrl": "http://example.com/qrcode.jpg",
      "isAvailable": 1
    }
  ]
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "结束时间必须大于开始时间",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 400: 参数错误（时间格式错误、结束时间小于等于开始时间等）
- 500: 服务器内部错误

---

## 3. 预约模块

### 3.1 创建预约

**接口功能**：用户创建会议室预约，提交后等待审批

**请求 URL**：`/api/reservation/create`

**请求方法**：`POST`

**请求参数**：

```json
{
  "roomId": 1,
  "reservationDate": "2024-01-15",
  "startTime": "09:00:00",
  "endTime": "11:00:00",
  "meetingTopic": "项目讨论会",
  "attendance": 10
}
```

| 参数名          | 类型    | 是否必填 | 说明                       |
| --------------- | ------- | -------- | -------------------------- |
| roomId          | Integer | 是       | 会议室 ID                  |
| reservationDate | String  | 是       | 预约日期，格式：YYYY-MM-DD |
| startTime       | String  | 是       | 开始时间，格式：HH:mm:ss   |
| endTime         | String  | 是       | 结束时间，格式：HH:mm:ss   |
| meetingTopic    | String  | 是       | 会议主题                   |
| attendance      | Integer | 是       | 预计参会人数               |

**响应格式**：

```json
{
  "code": 200,
  "message": "预约创建成功，等待审批",
  "data": {
    "reservationId": 1
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "该时间段会议室已被预约",
  "data": null
}
```

**主要错误码**：

- 200: 预约创建成功
- 400: 参数错误或业务逻辑错误（时间冲突、人数不足、会议室不可预约等）
- 401: 未登录
- 500: 服务器内部错误

### 3.2 查询我的预约记录

**接口功能**：用户查询自己的预约历史记录，包括待审批、已通过、已驳回、已取消、已完成的记录

**请求 URL**：`/api/reservation/my-list`

**请求方法**：`GET`

**请求参数**：
| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| page | Integer | 否 | 页码，默认 1 |
| size | Integer | 否 | 每页数量，默认 10 |
| status | Integer | 否 | 预约状态，0-待审批，1-已通过，2-已驳回，3-已取消，4-已完成，不传则查询全部 |

**响应格式**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 5,
    "page": 1,
    "size": 10,
    "list": [
      {
        "reservationId": 1,
        "roomId": 1,
        "roomName": "图书馆A区101会议室",
        "roomNumber": "LIB-A101",
        "building": "图书馆",
        "reservationDate": "2024-01-15",
        "startTime": "09:00:00",
        "endTime": "11:00:00",
        "meetingTopic": "项目讨论会",
        "attendance": 10,
        "reservationStatus": 0,
        "approvalTime": null,
        "rejectReason": null
      }
    ]
  }
}
```

**错误响应示例**：

```json
{
  "code": 401,
  "message": "未登录",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 401: 未登录
- 500: 服务器内部错误

### 3.3 取消预约

**接口功能**：用户取消已创建的预约，取消不需要经过审批

**请求 URL**：`/api/reservation/cancel/{reservationId}`

**请求方法**：`PUT`

**请求参数**：
| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| reservationId | Integer | 是 | 预约 ID（路径参数） |

**响应格式**：

```json
{
  "code": 200,
  "message": "取消预约成功",
  "data": null
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "只能取消待处理或已批准的预约",
  "data": null
}
```

**主要错误码**：

- 200: 取消成功
- 400: 业务逻辑错误（预约状态不允许取消、不是自己的预约等）
- 401: 未登录
- 404: 预约不存在
- 500: 服务器内部错误

### 3.4 确认使用会议室

**接口功能**：用户在召开会议时间前后，登录系统或扫描会议室二维码确认使用该会议室

**请求 URL**：`/api/reservation/confirm`

**请求方法**：`POST`

**请求参数**：

```json
{
  "reservationId": 1,
  "confirmType": "login"
}
```

| 参数名        | 类型    | 是否必填 | 说明                                    |
| ------------- | ------- | -------- | --------------------------------------- |
| reservationId | Integer | 是       | 预约 ID                                 |
| confirmType   | String  | 是       | 确认方式：login-登录确认，scan-扫码确认 |

**响应格式**：

```json
{
  "code": 200,
  "message": "确认使用成功",
  "data": {
    "confirmId": 1,
    "confirmedAt": "2024-01-15 09:00:00"
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "该预约尚未通过审批或已过期",
  "data": null
}
```

**主要错误码**：

- 200: 确认成功
- 400: 业务逻辑错误（预约未通过、已过期、不是自己的预约等）
- 401: 未登录
- 404: 预约不存在
- 500: 服务器内部错误

---

## 4. 管理员模块

### 4.1 添加会议室

**接口功能**：管理员添加新的会议室

**请求 URL**：`/api/admin/meeting-room/add`

**请求方法**：`POST`

**请求参数**：

```json
{
  "roomName": "网安大楼B区102会议室",
  "roomNumber": "WA-B102",
  "building": "网安大楼",
  "capacity": 30,
  "area": 80.0,
  "description": "大型会议室",
  "photoUrl": "http://example.com/photo.jpg",
  "qrCodeUrl": "http://example.com/qrcode.jpg",
  "isAvailable": 1
}
```

| 参数名      | 类型    | 是否必填 | 说明                         |
| ----------- | ------- | -------- | ---------------------------- |
| roomName    | String  | 是       | 房间名称                     |
| roomNumber  | String  | 是       | 房间号                       |
| building    | String  | 是       | 楼栋                         |
| capacity    | Integer | 是       | 容纳人数，最小值为 1         |
| area        | Decimal | 否       | 面积（㎡）                   |
| description | String  | 否       | 用途说明                     |
| photoUrl    | String  | 否       | 会议室照片 URL               |
| qrCodeUrl   | String  | 否       | 二维码 URL                   |
| isAvailable | Integer | 否       | 可否预约，0-否，1-是，默认 1 |

**响应格式**：

```json
{
  "code": 200,
  "message": "添加会议室成功",
  "data": {
    "roomId": 2
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "房间号已存在",
  "data": null
}
```

**主要错误码**：

- 200: 添加成功
- 400: 参数错误或业务逻辑错误（房间号重复、容纳人数小于 1 等）
- 401: 未登录
- 403: 无权限（非管理员）
- 500: 服务器内部错误

### 4.2 修改会议室

**接口功能**：管理员修改会议室信息

**请求 URL**：`/api/admin/meeting-room/{roomId}`

**请求方法**：`PATCH`

**请求参数**：

```json
{
  "capacity": 50
}
```

| 参数名      | 类型    | 是否必填 | 说明                 |
| ----------- | ------- | -------- | -------------------- |
| roomName    | String  | 否       | 房间名称             |
| roomNumber  | String  | 否       | 房间号               |
| building    | String  | 否       | 楼栋                 |
| capacity    | Integer | 否       | 容纳人数，最小值为 1 |
| area        | Decimal | 否       | 面积（㎡）           |
| description | String  | 否       | 用途说明             |
| photoUrl    | String  | 否       | 会议室照片 URL       |
| qrCodeUrl   | String  | 否       | 二维码 URL           |
| isAvailable | Integer | 否       | 可否预约，0-否，1-是 |

**响应格式**：

```json
{
  "code": 200,
  "data": {
    "roomId": 4
  },
  "message": "修改会议室成功"
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "data": null,
  "message": "会议室不存在"
}
```

**主要错误码**：

- 200: 修改成功
- 400: 参数错误或业务逻辑错误（房间号重复、容纳人数小于 1 等）
- 401: 未登录
- 403: 无权限（非管理员）
- 404: 会议室不存在
- 500: 服务器内部错误

### 4.3 删除会议室

**接口功能**：管理员删除会议室

**请求 URL**：`/api/admin/meeting-room/delete/{roomId}`

**请求方法**：`DELETE`

**请求参数**：
| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| roomId | Integer | 是 | 会议室 ID（路径参数） |

**响应格式**：

```json
{
  "code": 200,
  "message": "删除会议室成功",
  "data": null
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "该会议室存在未完成的预约，无法删除",
  "data": null
}
```

**主要错误码**：

- 200: 删除成功
- 400: 业务逻辑错误（会议室存在未完成的预约等）
- 401: 未登录
- 403: 无权限（非管理员）
- 404: 会议室不存在
- 500: 服务器内部错误

### 4.4 审批预约

**接口功能**：管理员对用户的预约请求进行审批，通过或驳回

**请求 URL**：`/api/admin/reservation/approve`

**请求方法**：`POST`

**请求参数**：

```json
{
  "reservationId": 1,
  "approvalResult": 1,
  "rejectReason": null
}
```

| 参数名         | 类型    | 是否必填 | 说明                                    |
| -------------- | ------- | -------- | --------------------------------------- |
| reservationId  | Integer | 是       | 预约 ID                                 |
| approvalResult | Integer | 是       | 审批结果，0-驳回，1-通过                |
| rejectReason   | String  | 条件必填 | 驳回理由，当 approvalResult 为 0 时必填 |

**响应格式**：

```json
{
  "code": 200,
  "message": "审批成功",
  "data": {
    "approvalId": 1
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "驳回时必须填写驳回理由",
  "data": null
}
```

**主要错误码**：

- 200: 审批成功
- 400: 参数错误或业务逻辑错误（驳回时未填写理由、预约状态不允许审批等）
- 401: 未登录
- 403: 无权限（非管理员）
- 404: 预约不存在
- 500: 服务器内部错误

### 4.5 查看预约记录

**接口功能**：管理员查看所有用户的预约记录，默认展示所有预约，但用户可手动筛选展示某一特定状态的预约记录（如：0-待审批 1-已通过 2-已驳回 3-已取消 4-已完成）

**请求 URL**：`/api/admin/reservation`

**请求方法**：`GET`

**请求参数**：

| 参数名 | 类型    | 是否必填 | 说明                                                                       |
| ------ | ------- | -------- | -------------------------------------------------------------------------- |
| page   | Integer | 否       | 页码，默认 1                                                               |
| size   | Integer | 否       | 每页数量，默认 10                                                          |
| status | Integer | 否       | 预约状态，0-待审批，1-已通过，2-已驳回，3-已取消，4-已完成，不传则查询全部 |

**响应格式**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 20,
    "page": 1,
    "size": 10,
    "list": [
      {
        "reservationId": 1,
        "userId": 2,
        "userName": "user1",
        "roomId": 1,
        "roomName": "网安大楼B区105会议室",
        "roomNumber": "101",
        "building": "网安大楼",
        "reservationDate": "2024-01-15",
        "startTime": "09:00:00",
        "endTime": "11:00:00",
        "meetingTopic": "项目讨论会",
        "attendance": 10,
        "reservationStatus": 1
      }
    ]
  }
}
```

**错误响应示例**：

```json
{
  "code": 401,
  "message": "未登录",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 401: 未登录
- 403: 无权限（非管理员）
- 500: 服务器内部错误

### 4.6 查看预约详情

**接口功能**：管理员查看某一条预约记录的详情信息。

**请求 URL**：`/api/admin/reservation/{reservationId}/details`

**请求方法**：`GET`

**响应格式**：

```json
{
  "code": 200,
  "data": {
    "roomNumber": "WA-B105",
    "userPhone": "11111111111",
    "roomDetails": {
      "area": 75.0,
      "description": "大型会议室",
      "capacity": 40
    },
    "approvalTime": "2025-12-01T20:37:06.530785",
    "userName": "user1",
    "reservationDate": "2026-03-16",
    "userId": 1,
    "meetingTopic": "小组作业讨论会",
    "roomId": 5,
    "roomName": "网安大楼B区105会议室",
    "building": "网安大楼",
    "createdAt": "2025-12-01T19:48:40.227857",
    "rejectReason": "当天会议室进行维修，无法预约。",
    "reservationId": 6,
    "approvalResult": false,
    "startTime": "15:00",
    "endTime": "18:00",
    "userRole": "USER",
    "attendance": 5,
    "reservationStatus": 2
  },
  "message": "查询成功"
}
```

**错误响应示例**：

```json
{
  "code": 401,
  "message": "未登录",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 401: 未登录
- 403: 无权限（非管理员）
- 500: 服务器内部错误

### 4.7 周视图-按时间查看

**接口功能**：管理员查看某一周的每天各时段预约情况，以表格形式展示

**请求 URL**：`/api/admin/schedule/week`

**请求方法**：`GET`

**请求参数**：
| 参数名 | 类型 | 是否必填 | 说明 |
|--------|------|----------|------|
| weekStartDate | String | 是 | 周开始日期，格式：YYYY-MM-DD |

**响应格式**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "weekStartDate": "2024-01-15",
    "schedule": [
      {
        "monday": [
          {
            "roomId": 1,
            "roomName": "会议室A",
            "roomNumber": "101",
            "building": "1号楼",
            "timeSlot": "09:00-10:00",
            "reservationId": 1,
            "meetingTopic": "项目讨论会",
            "status": 1
          }
        ],
        "tuesday": [],
        "wednesday": [],
        "thursday": [],
        "friday": [],
        "saturday": [],
        "sunday": []
      }
    ]
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "日期格式错误",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 400: 参数错误（日期格式错误等）
- 401: 未登录
- 403: 无权限（非管理员）
- 500: 服务器内部错误

### 4.8 周视图-按会议室查看

**接口功能**：管理员选定某一具体会议室及某一周，查看该会议室在这一周七天内每天各时段的预约情况，以日粒度表格形式展示。

**请求 URL**：`/api/admin/schedule/room`

**请求方法**：`GET`

**请求参数**：

| 参数名        | 类型    | 是否必填 | 说明                         |
| ------------- | ------- | -------- | ---------------------------- |
| weekStartDate | String  | 是       | 周开始日期，格式：YYYY-MM-DD |
| roomId        | Integer | 是       | 会议室 ID                    |

**响应格式**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "roomId": 3,
    "roomName": "网安大楼A区203会议室",
    "roomNumber": "WA-A203",
    "building": "网安大楼",
    "weekStartDate": "2026-03-16",
    "schedule": {
      "monday": [],
      "tuesday": [],
      "wednesday": [],
      "thursday": [
        {
          "timeSlot": "15:00-18:00",
          "reservationId": 4,
          "meetingTopic": "小组作业讨论会",
          "status": 3
        }
      ],
      "friday": [],
      "saturday": [],
      "sunday": []
    }
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "message": "日期格式错误",
  "data": null
}
```

**主要错误码**：

- 200: 查询成功
- 400: 参数错误（日期格式错误等）
- 401: 未登录
- 403: 无权限（非管理员）
- 500: 服务器内部错误

---

## 5. 通用说明

### 5.1 统一响应格式

所有接口统一使用以下响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 5.2 统一错误码

- 200: 操作成功
- 400: 请求参数错误或业务逻辑错误
- 401: 未登录或 token 过期
- 403: 无权限（如非管理员访问管理员接口）
- 404: 资源不存在
- 500: 服务器内部错误

### 5.3 认证方式

所有需要登录的接口（除登录接口外）需要在请求头中携带 JWT token：

```
Authorization: Bearer {token}
```

### 5.4 时间格式

- 日期格式：`YYYY-MM-DD`
- 时间格式：`HH:mm:ss`
- 日期时间格式：`YYYY-MM-DD HH:mm:ss`

### 5.5 分页说明

分页查询接口统一使用以下参数：

- `page`: 页码，从 1 开始
- `size`: 每页数量

分页响应格式：

```json
{
  "total": 100,
  "page": 1,
  "size": 10,
  "list": []
}
```

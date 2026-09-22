# 会议室预约系统

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://adoptium.net/) [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.16-brightgreen.svg)](https://spring.io/projects/spring-boot) [![MyBatis](https://img.shields.io/badge/MyBatis-3.0.5-red.svg)](https://mybatis.org/spring-boot-starter/) [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/) [![License](https://img.shields.io/badge/license-Unlicense-blue.svg)](LICENSE)

一个适合学习和面试展示的前后端分离项目。系统包含会议室查询、预约、审批、使用确认和后台统计等基本功能，后端采用 Spring Boot + MyBatis，前端采用 React + Ant Design。

<img src="./resource/demo.gif" alt="系统演示" />

## 功能

### 普通用户

- 注册、登录和修改个人信息
- 按日期、时间、人数和楼栋筛选会议室
- 创建、查看和取消预约
- 查看审批结果，通过登录或扫码确认使用

### 管理员

- 维护会议室信息和图片
- 审批或驳回预约
- 查看预约详情及周日程
- 查看会议室和预约统计数据

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 后端 | Java 17、Spring Boot 3.5.16、Spring Security、MyBatis Spring Boot Starter 3.0.5 |
| 认证 | JWT 0.12.6 |
| 数据库 | MySQL 8.0+ |
| 前端 | React 19、React Router 7、Ant Design 6、Axios、Vite 7 |
| 构建 | Maven 3.6+、Node.js 20+ |

## 项目结构

```text
meeting-room-reservation-system/
├── meeting-room-backend/
│   ├── src/main/java/com/meetingroom/
│   │   ├── config/          # 安全与跨域配置
│   │   ├── controller/      # REST 接口
│   │   ├── entity/          # 数据模型
│   │   ├── mapper/          # MyBatis Mapper 接口
│   │   ├── service/         # 业务逻辑
│   │   ├── typehandler/     # 枚举类型转换
│   │   └── util/            # JWT 等工具
│   └── src/main/resources/
│       ├── mapper/          # MyBatis XML 映射
│       └── application.yml
├── meeting-room-frontend/   # React 前端
├── resource/                # SQL、接口和数据库文档
└── .github/workflows/       # GitHub Actions 持续集成
```

## 本地运行

### 1. 准备环境

- JDK 17
- Maven 3.6 或更高版本
- Node.js 20 或更高版本
- MySQL 8.0 或更高版本

### 2. 初始化数据库

以下脚本会重建 `meeting_room_booking` 数据库中的业务表，请勿在已有生产数据的数据库中执行。

```bash
mysql -u root -p < resource/database_schema.sql
mysql -u root -p < resource/sample_data.sql
```

示例账号仅用于本地演示：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 普通用户 | `user1` | `123456` |
| 管理员 | `admin1` | `admin123` |

### 3. 配置并启动后端

`application.yml` 不保存真实密码，配置项可以通过环境变量覆盖：

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/meeting_room_booking...` | JDBC 地址 |
| `DB_USERNAME` | `root` | 数据库用户名 |
| `DB_PASSWORD` | 空 | 数据库密码 |
| `JWT_SECRET` | 本地开发密钥 | JWT 签名密钥，部署时必须修改 |
| `UPLOAD_DIR` | `./uploads` | 上传目录 |
| `SERVER_PORT` | `8080` | 后端端口 |

PowerShell 示例：

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-password"
$env:JWT_SECRET = "replace-with-a-random-secret-at-least-32-bytes"
cd meeting-room-backend
mvn spring-boot:run
```

### 4. 启动前端

```bash
cd meeting-room-frontend
npm ci
npm run dev
```

浏览器访问 `http://localhost:5173`。Vite 开发服务器会将 `/api` 请求代理到 `http://localhost:8080`。

## 构建检查

```bash
# 后端
mvn -f meeting-room-backend/pom.xml clean package

# 前端
cd meeting-room-frontend
npm ci
npm run lint
npm run build
```

仓库包含 GitHub Actions，推送到 `main` 或 `master` 分支、或创建 Pull Request 时会自动执行上述检查。

## 相关文档

- [数据库设计](./resource/database_design.md)
- [接口设计](./resource/interface_design.md)
- [枚举值对照表](./resource/enumeration_table.md)
- [数据库 ER 图](./resource/ER_diagram.png)

## 安全说明

- `sample_data.sql` 中的 `{noop}` 密码只用于本地演示；通过注册接口创建的新用户使用 BCrypt 加密。
- 部署时必须设置独立的 `JWT_SECRET` 和数据库密码，不要将真实密钥提交到 GitHub。

## License

[The Unlicense](LICENSE) — 已放弃版权，任何人可自由使用。

# Set up

## meeting-room-frontend

1. 初始化架构已完成, 如下:

```bash
npm create vite@latest meeting-room-frontend -- --template react
cd meeting-room-frontend
npm install antd axios react-router-dom dayjs @ant-design/icons
```

2. 第一次构建需要`npm install` (统一使用的 node 版本: 20.19.5)
3. 后续测试直接`npm run dev`, 浏览器打开 http://localhost:5173/

## meeting-room-backend

1. MySQL 新建数据库`meeting_room_booking`, `source`命令导入`resource/`文件夹下的`database_schema.sql`和`sample_data.sql`
2. 修改后端配置(记得设置 sdk): 找到文件`src/main/resources/application.yml`, 修改 username 和 password, 确保能成功连接数据库
3. 运行 `src/main/java/MeetingRoomBookingApplication.java`, 确保后端在 localhost:8080 正常启动

- 后端 2.0/3.0 的图片和二维码上传功能需要修改: 如果直接把数据(uploads/)放在 JAR 包里, IDEA **不会实时**把新文件复制到在运行的 target/目录中, 导致管理员每传一张图片都要重新 build 一遍后端才能在前端看到图片; 为了模拟生产环境的标准做法, 配置一个本地磁盘的绝对路径(<upload-dir>)来存储文件 → **!故修改了后端 3.0 的`application.yml`和`WebConifg.java`文件, 以支持实时响应**
- 后端 2.0/3.0 的原"4.2 修改会议室接口"只接收 JSON 数据, 不支持文件上传 → **!故修改了后端 3.0 的`AdminController.java`文件, 以支持上传新的图片**
- 后端 3.0 的原 `deleteRoom` 方法没有检查会议室关联的预约记录 → **!故修改了`MeetingRoomService.java`文件, 以支持拒绝删除** → 并更新版本为 4.0

---

# Workflow

1. **Clone the Repository**  
   确保你已经克隆了项目的 Git 仓库到本地:

   ```bash
   git clone <your-repository-url>
   cd meeting-room-reservation-system/meeting-room-frontend
   ```

2. **Create a New Branch**  
   在开始开发之前, 从 `main` 分支拉取最新代码并创建自己的功能分支:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<your-feature-name>
   ```

3. **Commit Changes**  
   开发完成后, 提交代码到本地仓库:

   ```bash
   git add .
   git commit -m "feat: <brief description of your feature>"
   ```

4. **Push Your Branch**  
   将本地分支推送到远程仓库:

   ```bash
   git push origin feature/<your-feature-name>
   ```

5. **Create a Pull Request**  
   在远程仓库中创建一个 PR, 目标分支为 `main`, 并在 PR 描述中说明你的更改内容, 等待其他组员对你的代码进行审查; 审查通过后, 你的 PR 会被合并到 `main` 分支

6. **Sync with Main**  
    在开始下一个任务前, 确保本地代码与 `main` 分支保持同步:
   ```bash
   git checkout main
   git pull origin main
   ```

---

# TODO!!!

## > 已完成模块

### 1. 基础架构(utils/)

- [x] 项目初始化(Vite + React + Ant Design)
- [x] 路由配置(react-router-dom)
- [x] 权限保护路由(ProtectedRoute 组件)
- [x] 请求封装(axios + JWT 认证)
- [x] 枚举值配置(用户角色、预约状态等)

### 2. 登录注册模块(login/) + 通用模块(common/)

- [x] 欢迎页面(WelcomePage)
- [x] 登录页面(LoginPage)
- [x] 注册页面(RegisterPage)
- [x] 个人资料(ProfilePage) → 可修改用户名和电话
- [x] 安全中心 (SecurityPage) → 可修改密码

#### API 接口封装(auth.js)

- [x] 1.1 登录
- [x] 1.2 注册
- [x] 1.3 获取用户信息
- [x] 1.4 修改密码
- [x] 1.5 刷新 Token
- [x] 1.6 用户登出
- [x] 1.7 修改用户和电话

### 3. 用户端功能(user/)

- [x] 用户布局框架(UserLayout)
- [x] 用户主页-会议室查看和快速预约(UserHomePage)
- [x] 用户预约记录页面(UserReservationPage)
- [x] 确认使用会议室页面(UserConfirmPage)
- [x] 用户帮助中心页面(UserHelpPage)
- [x] 二维码功能: 测试成功 ⭐

### 4. 管理员端功能(admin/)

- [x] 管理员布局框架(AdminLayout)
- [x] 仪表盘/数据概览(AdminDashboardPage)
- [x] 预约审批页面(AdminReservationPage) → 新增"确认使用"后能显示已完成的预约
- [x] 周视图页面(AdminSchedulePage) → 新增"确认使用"后能显示已完成的预约
- [x] 会议室管理页面(AdminRoomManagePage)
- [x] 管理员帮助中心页面(AdminHelpPage)
- [x] 涵盖了所有普通用户功能: "会议室预约"栏目下

### 5. API 接口封装(room.js)

- [x] 2.1 会议室列表查询
- [x] 2.2 会议室搜索筛选
- [x] 3.1 创建预约
- [x] 3.2 查询用户预约列表
- [x] 3.3 取消预约
- [x] 3.4 确认使用会议室
- [x] 4.1-4.3 管理员: CUD 会议室
- [x] 4.4 管理员: 审批预约
- [x] 4.5 管理员: 查询所有预约
- [x] 4.6 管理员: 获取预约详情
- [x] 4.7-4.8 管理员: 周视图查看
- [x] 5.1 获取所有楼栋列表

## > 待修改模块

- [x] 用户主页的会议室搜索/重置功能 (UserHomePage) → 现无条件筛选能显示所有可用会议室, 重置能显示所有会议室
- [x] 用户确认使用页面扫码 icon (UserConfirmPage) → 点击后提示可通过手机扫码确认使用
- [x] 管理员会议室管理页面删除提示 (AdminRoomManagePage) → 如果存在预约记录会被阻止

## > 待完成模块

---

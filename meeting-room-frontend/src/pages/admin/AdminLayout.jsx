/**
 * @file src/pages/admin/AdminLayout.jsx
 * @brief 管理员页面侧边导航栏
 * @date 2025-12-9
 */

import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Breadcrumb,
  Typography,
  Divider,
  Modal,
} from "antd";
import {
  HomeOutlined,
  DashboardOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ScanOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logoutAPI } from "../../api/auth";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("Admin");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    Modal.confirm({
      title: "确认退出",
      icon: <ExclamationCircleOutlined />,
      content: "您确定要退出登录吗?",
      okText: "确定",
      cancelText: "取消",
      centered: true,
      onOk: async () => {
        try {
          await logoutAPI();
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
          navigate("/login", { replace: true });
        }
      },
    });
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const selectedKey = location.pathname;

  const breadcrumbMap = {
    "/admin/dashboard": ["仪表盘"],
    "/admin/room-manage": ["会议室管理"],
    "/admin/reservations": ["审批预约"],
    "/admin/schedule": ["周视图"],
    "/admin/help": ["帮助中心"],
    "/admin/book/home": ["会议室预约", "快速预约"],
    "/admin/book/mine": ["会议室预约", "预约记录"],
    "/admin/book/confirm": ["会议室预约", "确认使用"],
    "/admin/profile": ["个人资料"],
    "/admin/secure": ["安全中心"],
  };

  const items = [
    {
      label: "仪表盘",
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: "会议室管理",
      key: "/admin/room-manage",
      icon: <AppstoreAddOutlined />,
    },
    {
      label: "会议室预约",
      key: "booking",
      icon: <TeamOutlined />,
      children: [
        {
          label: "快速预约",
          key: "/admin/book/home",
          icon: <AppstoreOutlined />,
        },
        {
          label: "预约记录",
          key: "/admin/book/mine",
          icon: <HistoryOutlined />,
        },
        {
          label: "确认使用",
          key: "/admin/book/confirm",
          icon: <ScanOutlined />,
        },
      ],
    },
    {
      label: "审批预约",
      key: "/admin/reservations",
      icon: <CheckSquareOutlined />,
    },
    {
      label: "周视图",
      key: "/admin/schedule",
      icon: <CalendarOutlined />,
    },
    {
      type: "divider",
    },
    {
      label: "帮助中心",
      key: "/admin/help",
      icon: <QuestionCircleOutlined />,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
      onClick: () => navigate("/admin/profile"),
    },
    {
      key: "secure",
      icon: <SettingOutlined />,
      label: "安全中心",
      onClick: () => navigate("/admin/secure"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          zIndex: 10,
        }}
        theme="light"
      >
        {/* Logo 区域 */}
        <div
          style={{
            height: 64,
            margin: "16px 16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => navigate("/admin/dashboard")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(74, 144, 226, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(74, 144, 226, 0.3)";
          }}
        >
          {collapsed ? (
            <HomeOutlined style={{ fontSize: 24, color: "#fff" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HomeOutlined style={{ fontSize: 24, color: "#fff" }} />
              <Text
                strong
                style={{
                  color: "#fff",
                  fontSize: 16,
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                会议室预约系统
              </Text>
            </div>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          defaultSelectedKeys={["/admin/dashboard"]}
          selectedKeys={[selectedKey]}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
          style={{
            border: "none",
            fontSize: "14px",
          }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 9,
          }}
        >
          {/* 面包屑 */}
          <Breadcrumb
            items={[
              { title: <HomeOutlined /> },
              ...(breadcrumbMap[selectedKey] || []).map((item) => ({
                title: item,
              })),
            ]}
            style={{ fontSize: "14px" }}
          />

          {/* 右侧操作区 */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* 通知 */}
            <Badge count={0} showZero={false}>
              <BellOutlined
                style={{
                  fontSize: 20,
                  color: "#666",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4A90E2")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              />
            </Badge>

            <Divider type="vertical" style={{ height: 24, margin: 0 }} />

            {/* 用户信息 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Avatar
                  style={{
                    background:
                      "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
                    boxShadow: "0 2px 8px rgba(74, 144, 226, 0.3)",
                  }}
                  icon={<UserOutlined />}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Text strong style={{ fontSize: 14 }}>
                    {username}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    管理员
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content style={{ margin: "24px 24px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              minHeight: "calc(100vh - 112px)",
              background: "#fff",
              borderRadius: "12px",
              boxShadow:
                "0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

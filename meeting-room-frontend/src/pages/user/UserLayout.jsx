/**
 * @file src/pages/user/UserLayout.jsx
 * @brief 用户页面侧边导航栏
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
  AppstoreOutlined,
  HistoryOutlined,
  ScanOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logoutAPI } from "../../api/auth";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const UserLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("User");
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
    "/user/home": ["快速预约"],
    "/user/reservations": ["预约记录"],
    "/user/confirm": ["确认使用"],
    "/user/help": ["帮助中心"],
    "/user/profile": ["个人资料"],
    "/user/secure": ["安全中心"],
  };

  const items = [
    {
      label: "快速预约",
      key: "/user/home",
      icon: <AppstoreOutlined />,
    },
    {
      label: "预约记录",
      key: "/user/reservations",
      icon: <HistoryOutlined />,
    },
    {
      label: "确认使用",
      key: "/user/confirm",
      icon: <ScanOutlined />,
    },
    {
      type: "divider",
    },
    {
      label: "帮助中心",
      key: "/user/help",
      icon: <QuestionCircleOutlined />,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
      onClick: () => navigate("/user/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "安全中心",
      onClick: () => navigate("/user/secure"),
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
          onClick={() => navigate("/user/home")}
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

        <Menu
          defaultSelectedKeys={["/user/home"]}
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
          <Breadcrumb
            items={[
              { title: <HomeOutlined /> },
              ...(breadcrumbMap[selectedKey] || []).map((item) => ({
                title: item,
              })),
            ]}
            style={{ fontSize: "14px" }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
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
                    普通用户
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

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

export default UserLayout;

/**
 * @file src/pages/login/LoginPage.jsx
 * @brief 登录页面
 * @date 2025-12-8
 */

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Checkbox,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { loginAPI } from "../../api/auth";
import { UserRole } from "../../utils/enums";
import welcome_pic from "../../assets/welcome_pic.png";
import login_pic from "../../assets/login_pic.png";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const responseData = await loginAPI(values);
      localStorage.setItem("token", responseData.token);
      localStorage.setItem("role", responseData.role);
      localStorage.setItem("userId", responseData.userId);
      localStorage.setItem("username", responseData.userName);
      message.success("登录成功! 欢迎回来!");
      setTimeout(() => {
        if (responseData.role === UserRole.ADMIN) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/user/home", { replace: true });
        }
      }, 500);
    } catch (error) {
      console.error("登录流程失败: ", error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `url(${welcome_pic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        padding: "20px",
      }}
    >
      {/* 黑色半透明背景遮罩 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* 浮动装饰圆 */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "10%",
          width: "250px",
          height: "250px",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite reverse",
          pointerEvents: "none",
        }}
      />

      {/* 返回首页按钮 */}
      <Button
        type="text"
        icon={<HomeOutlined />}
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: 30,
          left: 30,
          color: "#fff",
          fontSize: "16px",
          zIndex: 1001,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: "8px 20px",
          height: "auto",
          borderRadius: "20px",
          fontWeight: 500,
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "translateX(-5px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
        }}
      >
        <ArrowLeftOutlined style={{ marginRight: "8px" }} />
        返回首页
      </Button>

      {/* 登录卡片 */}
      <Card
        style={{
          width: "900px",
          minHeight: "550px",
          padding: 0,
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          zIndex: 1,
          boxShadow:
            "0 25px 70px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          animation: "slideInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(10px)",
          background: "transparent",
        }}
        bodyStyle={{ padding: 0, height: "100%", background: "transparent" }}
      >
        <div style={{ display: "flex", height: "100%", minHeight: "550px" }}>
          {/* 左侧图片区域 */}
          <div
            style={{
              flex: 1,
              position: "relative",
              backgroundImage: `url(${login_pic})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderTopLeftRadius: "24px",
              borderBottomLeftRadius: "24px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)",
              }}
            />
          </div>

          {/* 右侧表单区域 */}
          <div
            style={{
              flex: 1,
              padding: "60px 50px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              borderTopRightRadius: "24px",
              borderBottomRightRadius: "24px",
            }}
          >
            <div style={{ marginBottom: "40px" }}>
              <Title
                level={2}
                style={{ margin: 0, color: "#333", fontSize: "32px" }}
              >
                登录
              </Title>
              <Text style={{ color: "#666", fontSize: "15px" }}>
                请输入您的账户信息
              </Text>
            </div>

            <Form
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: "请输入用户名!" }]}
              >
                <Input
                  prefix={
                    <UserOutlined
                      style={{
                        color: focusedField === "username" ? "#4A90E2" : "#999",
                        transition: "color 0.3s ease",
                      }}
                    />
                  }
                  placeholder="请输入用户名"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 15px",
                    border:
                      focusedField === "username"
                        ? "2px solid #4A90E2"
                        : "1px solid #d9d9d9",
                    transition: "all 0.3s ease",
                    boxShadow:
                      focusedField === "username"
                        ? "0 0 0 3px rgba(74, 144, 226, 0.1)"
                        : "none",
                  }}
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: "请输入密码!" }]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      style={{
                        color: focusedField === "password" ? "#4A90E2" : "#999",
                        transition: "color 0.3s ease",
                      }}
                    />
                  }
                  placeholder="请输入密码"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 15px",
                    border:
                      focusedField === "password"
                        ? "2px solid #4A90E2"
                        : "1px solid #d9d9d9",
                    transition: "all 0.3s ease",
                    boxShadow:
                      focusedField === "password"
                        ? "0 0 0 3px rgba(74, 144, 226, 0.1)"
                        : "none",
                  }}
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "30px",
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: "14px" }}>记住我</Checkbox>
                </Form.Item>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    message.info("请联系管理员重置密码");
                  }}
                  style={{
                    color: "#4A90E2",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  忘记密码?
                </a>
              </div>

              <Form.Item style={{ marginBottom: "20px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: 500,
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 25px rgba(74, 144, 226, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(74, 144, 226, 0.4)";
                  }}
                >
                  登 录
                </Button>
              </Form.Item>

              <Divider
                plain
                style={{ margin: "20px 0", color: "#999", fontSize: "14px" }}
              >
                或
              </Divider>

              <div style={{ textAlign: "center", fontSize: "15px" }}>
                <Text style={{ color: "#666" }}>还没有账号？</Text>
                <a
                  onClick={() => navigate("/register")}
                  style={{
                    color: "#4A90E2",
                    fontWeight: 500,
                    marginLeft: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  立即注册
                </a>
              </div>
            </Form>
          </div>
        </div>
      </Card>

      {/* CSS 动画 */}
      <style>{`
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .ant-message {
          z-index: 10000 !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

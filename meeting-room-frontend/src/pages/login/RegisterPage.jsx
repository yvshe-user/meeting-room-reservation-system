/**
 * @file src/pages/login/RegisterPage.jsx
 * @brief 注册页面
 * @date 2025-12-8
 */

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Divider,
  Progress,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { registerAPI } from "../../api/auth";
import welcome_pic from "../../assets/welcome_pic.png";
import login_pic from "../../assets/login_pic.png";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  // 密码强度检测
  const checkPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return "#ff4d4f";
    if (strength < 60) return "#faad14";
    return "#52c41a";
  };

  const getStrengthText = (strength) => {
    if (strength < 30) return "弱";
    if (strength < 60) return "中";
    return "强";
  };

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("两次输入的密码不一致!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username: values.username,
        password: values.password,
        phone: values.phone,
      };
      await registerAPI(payload);
      message.success("注册成功! 请登录");
      navigate("/login");
    } catch (error) {
      console.error("注册失败: ", error);
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
          top: "15%",
          right: "10%",
          width: "350px",
          height: "350px",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 7s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "8%",
          width: "280px",
          height: "280px",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float 9s ease-in-out infinite reverse",
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

      {/* 注册卡片 */}
      <Card
        style={{
          width: "900px",
          minHeight: "580px",
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
        <div style={{ display: "flex", height: "100%", minHeight: "580px" }}>
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
              padding: "45px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              overflowY: "auto",
              borderTopRightRadius: "24px",
              borderBottomRightRadius: "24px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <Title
                level={2}
                style={{
                  margin: 0,
                  marginBottom: "6px",
                  color: "#333",
                  fontSize: "30px",
                  lineHeight: 1.2,
                }}
              >
                注册账号
              </Title>
              <Text
                style={{ color: "#666", fontSize: "14px", lineHeight: 1.4 }}
              >
                填写以下信息创建您的账户
              </Text>
            </div>

            <Form
              name="register_form"
              onFinish={onFinish}
              size="large"
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item
                label={<span style={{ fontSize: "14px" }}>用户名</span>}
                name="username"
                rules={[
                  { required: true, message: "请输入用户名!" },
                  { min: 3, message: "用户名至少3个字符" },
                  { max: 20, message: "用户名最多20个字符" },
                ]}
                style={{ marginBottom: "16px" }}
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
                  placeholder="请输入用户名 (3-20个字符)"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 12px",
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
                label={<span style={{ fontSize: "14px" }}>手机号</span>}
                name="phone"
                rules={[
                  { required: true, message: "请输入手机号!" },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: "请输入正确的手机号格式",
                  },
                ]}
                style={{ marginBottom: "16px" }}
              >
                <Input
                  prefix={
                    <PhoneOutlined
                      style={{
                        color: focusedField === "phone" ? "#4A90E2" : "#999",
                        transition: "color 0.3s ease",
                      }}
                    />
                  }
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 12px",
                    border:
                      focusedField === "phone"
                        ? "2px solid #4A90E2"
                        : "1px solid #d9d9d9",
                    transition: "all 0.3s ease",
                    boxShadow:
                      focusedField === "phone"
                        ? "0 0 0 3px rgba(74, 144, 226, 0.1)"
                        : "none",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: "14px" }}>密码</span>}
                name="password"
                rules={[
                  { required: true, message: "请输入密码!" },
                  { min: 6, message: "密码长度不能少于6位" },
                ]}
                style={{ marginBottom: "16px" }}
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
                  placeholder="请输入密码 (至少6位)"
                  onChange={(e) =>
                    setPasswordStrength(checkPasswordStrength(e.target.value))
                  }
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 12px",
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

              {/* 密码强度指示器 */}
              {passwordStrength > 0 && (
                <div style={{ marginTop: "-12px", marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <Text style={{ fontSize: "12px", color: "#999" }}>
                      密码强度
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: getStrengthColor(passwordStrength),
                        fontWeight: 500,
                      }}
                    >
                      {getStrengthText(passwordStrength)}
                    </Text>
                  </div>
                  <Progress
                    percent={passwordStrength}
                    strokeColor={getStrengthColor(passwordStrength)}
                    showInfo={false}
                    size="small"
                    style={{ transition: "all 0.3s ease" }}
                  />
                </div>
              )}

              <Form.Item
                label={<span style={{ fontSize: "14px" }}>确认密码</span>}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "请确认密码!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致!"));
                    },
                  }),
                ]}
                style={{ marginBottom: "16px" }}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      style={{
                        color:
                          focusedField === "confirmPassword"
                            ? "#4A90E2"
                            : "#999",
                        transition: "color 0.3s ease",
                      }}
                    />
                  }
                  placeholder="请再次输入密码"
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 12px",
                    border:
                      focusedField === "confirmPassword"
                        ? "2px solid #4A90E2"
                        : "1px solid #d9d9d9",
                    transition: "all 0.3s ease",
                    boxShadow:
                      focusedField === "confirmPassword"
                        ? "0 0 0 3px rgba(74, 144, 226, 0.1)"
                        : "none",
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "16px", marginTop: "20px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: "46px",
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
                  注 册
                </Button>
              </Form.Item>

              <Divider
                plain
                style={{ margin: "16px 0", color: "#999", fontSize: "13px" }}
              >
                或
              </Divider>

              <div style={{ textAlign: "center", fontSize: "14px" }}>
                <Text style={{ color: "#666" }}>已有账号？</Text>
                <a
                  onClick={() => navigate("/login")}
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
                  立即登录
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;

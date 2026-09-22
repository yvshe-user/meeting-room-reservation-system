/**
 * @file src/pages/common/SecurityPage.jsx
 * @brief 安全中心页面
 * @date 2025-12-13
 */

import React, { useState } from "react";
import { Form, Input, Button, message, Avatar } from "antd";
import { LockOutlined, SettingOutlined } from "@ant-design/icons";
import { changePasswordAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const SecurityPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const primaryGradient = "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePasswordAPI({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功，请重新登录");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("修改密码失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const primaryButtonStyle = {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    border: "none",
    boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
    color: "white",
    height: "48px",
    fontSize: "16px",
    borderRadius: "8px",
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Avatar
          size={100}
          icon={<SettingOutlined />}
          style={{
            background: primaryGradient,
            marginBottom: "16px",
            boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
          }}
        />
      </div>

      <Form
        form={form}
        name="change_password"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          label="当前密码"
          name="oldPassword"
          rules={[{ required: true, message: "请输入当前密码" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="请输入当前密码"
          />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码长度不能少于6位" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="请输入新密码 (至少6位)"
          />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "请再次输入新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="请再次输入新密码"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: "40px" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={primaryButtonStyle}
          >
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SecurityPage;

/**
 * @file src/pages/common/ProfilePage.jsx
 * @brief 个人资料页面
 * @date 2025-12-13
 */

import React, { useEffect, useState } from "react";
import { Avatar, Tag, Spin, Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getUserInfoAPI, updateProfileAPI } from "../../api/auth";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const primaryGradient = "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)";

  const fetchUserInfo = async () => {
    try {
      const data = await getUserInfoAPI();
      setUserInfo(data);
    } catch (error) {
      console.error("获取用户信息失败:", error);
      message.error("获取用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      username: userInfo.userName,
      phone: userInfo.phone,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 检查用户名是否修改
      const isUsernameChanged = values.username !== userInfo.userName;

      await updateProfileAPI(values);

      if (isUsernameChanged) {
        message.success("用户名修改成功，请重新登录");
        // 清除本地存储的认证信息
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");
        navigate("/login");
      } else {
        message.success("个人信息修改成功");
        setIsEditing(false);
        fetchUserInfo();
      }
    } catch (error) {
      console.error("修改失败:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <Spin size="large" tip="加载用户信息..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <Avatar
          size={100}
          icon={<UserOutlined />}
          style={{
            background: primaryGradient,
            marginBottom: "24px",
            boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
          }}
        />
        <h2 style={{ margin: "0 0 12px 0", fontSize: "28px", fontWeight: 600 }}>
          {userInfo?.userName || "用户"}
        </h2>
        <div>
          <Tag
            color={userInfo?.role === "admin" ? "red" : "blue"}
            style={{
              fontSize: "14px",
              padding: "4px 16px",
              borderRadius: "12px",
            }}
          >
            {userInfo?.role === "admin" ? "管理员" : "普通用户"}
          </Tag>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <InfoItem
          icon={<IdcardOutlined />}
          label="用户ID"
          value={userInfo?.userId}
        />

        {isEditing ? (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[{ required: true, message: "请输入手机号" }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
            </Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginTop: "24px",
                marginBottom: "24px",
              }}
            >
              <Button onClick={handleCancel} icon={<CloseOutlined />}>
                取消
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                icon={<SaveOutlined />}
                style={{ background: primaryGradient, border: "none" }}
              >
                保存
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <InfoItem
              icon={<UserOutlined />}
              label="用户名"
              value={userInfo?.userName}
            />
            <InfoItem
              icon={<PhoneOutlined />}
              label="手机号"
              value={userInfo?.phone || "未绑定"}
            />
          </>
        )}

        <InfoItem
          icon={<SafetyCertificateOutlined />}
          label="角色权限"
          value={userInfo?.role === "admin" ? "系统管理员" : "普通用户"}
        />

        {!isEditing && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              type="primary"
              onClick={handleEdit}
              icon={<EditOutlined />}
              style={{ background: primaryGradient, border: "none" }}
            >
              修改信息
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "24px",
      fontSize: "16px",
      color: "#333",
      padding: "12px 0",
      borderBottom: "1px solid #f5f5f5",
    }}
  >
    <div
      style={{
        fontSize: "20px",
        color: "#4A90E2",
        marginRight: "16px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
    </div>
    <div style={{ width: "100px", color: "#666", fontSize: "15px" }}>
      {label}
    </div>
    <div
      style={{ flex: 1, textAlign: "right", fontWeight: 500, fontSize: "16px" }}
    >
      {value}
    </div>
  </div>
);

export default ProfilePage;

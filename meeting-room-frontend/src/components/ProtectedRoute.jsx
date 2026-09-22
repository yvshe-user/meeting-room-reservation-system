/**
 * @file src/components/ProtectedRoute.jsx
 * @brief 权限路由守卫组件
 * @date 2025-12-8
 */

import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { UserRole } from "../utils/enums";
import { getUserInfoAPI } from "../api/auth";

const ProtectedRoute = ({ requiredRole }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsLoading(false);
        setIsAuthorized(false);
        return;
      }
      try {
        const userInfo = await getUserInfoAPI();
        if (userInfo.role === requiredRole) {
          localStorage.setItem("role", userInfo.role);
          localStorage.setItem("userId", userInfo.userId);
          localStorage.setItem("userName", userInfo.userName);
          if (userInfo.phone) {
            localStorage.setItem("phone", userInfo.phone);
          }
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          localStorage.setItem("role", userInfo.role);
        }
      } catch (error) {
        console.error("Token验证失败:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, [token, requiredRole]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" tip="正在验证权限..." />
      </div>
    );
  }

  if (!isAuthorized) {
    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    const currentRole = localStorage.getItem("role");
    if (currentRole === UserRole.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentRole === UserRole.USER) {
      return <Navigate to="/user/home" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

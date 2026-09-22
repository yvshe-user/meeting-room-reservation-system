/**
 * @file src/utils/auth.js
 * @brief 封装认证相关接口
 * @date 2025-12-8
 */

import request from "../utils/request";

// 1.1 用户登录
export const loginAPI = (data) => {
  return request({
    url: "/auth/login",
    method: "POST",
    data: data,
  });
};

// 1.2 用户注册
export const registerAPI = (data) => {
  return request({
    url: "/auth/register",
    method: "POST",
    data: data,
  });
};

// 1.3 获取用户信息
export const getUserInfoAPI = () => {
  return request({
    url: "/auth/user-info",
    method: "GET",
  });
};

// 1.4 修改密码
export const changePasswordAPI = (data) => {
  return request({
    url: "/auth/change-password",
    method: "PUT",
    data: data,
  });
};

// 1.5 刷新Token
export const refreshTokenAPI = () => {
  return request({
    url: "/auth/refresh-token",
    method: "POST",
  });
};

// 1.6 用户登出
export const logoutAPI = () => {
  return request({
    url: "/auth/logout",
    method: "POST",
  });
};

// 1.7 修改用户名和电话
export const updateProfileAPI = (data) => {
  return request({
    url: "/auth/update-profile",
    method: "PATCH",
    data: data,
  });
};

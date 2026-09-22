/**
 * @file src/utils/request.js
 * @brief 封装 axios 请求模块
 * @date 2025-12-8
 */

import axios from "axios";
import { message } from "antd";

const getTokenExpiration = (token) => {
  try {
    if (!token) return 0;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
};

let isRefreshing = false;
let requestsQueue = [];

// 1. 创建 axios 实例
const request = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

// 2. 请求拦截器: 每次发请求前自动带上Token
request.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");
    if (config.url.includes("/auth/refresh-token")) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
    if (token) {
      const exp = getTokenExpiration(token);
      const now = Date.now();
      const timeUntilExpire = exp - now;
      if (timeUntilExpire > 0 && timeUntilExpire < 5 * 60 * 1000) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const response = await axios.post(
              "/api/auth/refresh-token",
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (response.data.code === 200) {
              const newToken = response.data.data.token;
              localStorage.setItem("token", newToken);
              token = newToken;
              requestsQueue.forEach((cb) => cb(newToken));
              requestsQueue = [];
            }
          } catch (error) {
            console.error("Token 自动刷新失败", error);
          } finally {
            isRefreshing = false;
          }
        } else {
          return new Promise((resolve) => {
            requestsQueue.push((newToken) => {
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(config);
            });
          });
        }
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器: 收到响应后统一处理错误
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      message.error(res.message || "系统异常");
      if (res.code === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(new Error(res.message || "Error"));
    }
    return res.data || [];
  },
  (error) => {
    const resData = error.response?.data;
    const errorMessage = resData?.message || error.message || "网络请求失败";
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response && error.response.status === 401) {
      if (isLoginRequest) {
        return Promise.reject(new Error("用户名或密码错误"));
      }
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    message.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default request;

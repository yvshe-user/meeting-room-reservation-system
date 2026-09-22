/**
 * @file src/utils/room.js
 * @brief 封装会议室相关接口
 * @date 2025-12-8
 */

import request from "../utils/request";

// 2.1 查看所有会议室列表 (无筛选)
export const fetchRoomListAPI = (params) => {
  return request({
    url: "/meeting-room/list",
    method: "GET",
    params: params,
  });
};

// 2.2 搜索会议室 (根据条件筛选可用会议室)
export const searchRoomsAPI = (body) => {
  return request({
    url: "/meeting-room/search",
    method: "POST",
    data: body,
  });
};

// 3.1 创建会议室预约
export const createReservationAPI = (body) => {
  return request({
    url: "/reservation/create",
    method: "POST",
    data: body,
  });
};

// 3.2 获取当前用户的预约列表
export const fetchUserReservationsAPI = (params) => {
  return request({
    url: "/reservation/my-list",
    method: "GET",
    params: params,
  });
};

// 3.3 取消预约
export const cancelReservationAPI = (reservationId) => {
  return request({
    url: `/reservation/cancel/${reservationId}`,
    method: "PUT",
  });
};

// 3.4 确认使用操作
export const confirmReservationAPI = (reservationId, confirmType = 'login') => {
  return request({
    url: "/reservation/confirm",
    method: "POST",
    data: {
      reservationId: reservationId,
      confirmType: confirmType,
    },
  });
};

// 4.1 管理员: 创建会议室
export const createRoomAPI = (data) => {
  return request({
    url: "/admin/meeting-room/add",
    method: "POST",
    data: data,
  });
};

// 4.2 管理员: 更新会议室信息
export const updateRoomAPI = (roomId, data) => {
  return request({
    url: `/admin/meeting-room/${roomId}`,
    method: "PUT",
    data: data,
  });
};

// 4.3 管理员: 删除会议室
export const deleteRoomAPI = (roomId) => {
  return request({
    url: `/admin/meeting-room/delete/${roomId}`,
    method: "DELETE",
  });
};

// 4.4 管理员：审批预约
export const approveReservationAPI = (body) => {
  return request({
    url: "/admin/reservation/approve",
    method: "POST",
    data: body,
  });
};

// 4.5 管理员: 获取所有预约列表
export const fetchAllReservationsAPI = (params) => {
  return request({
    url: "/admin/reservation/list",
    method: "GET",
    params: params,
  });
};

// 4.6 管理员: 获取预约详情
export const fetchReservationDetailsAPI = (reservationId) => {
  return request({
    url: `/admin/reservation/${reservationId}/details`,
    method: "GET",
  });
};

// 4.7 管理员: 周视图-按时间查看
export const fetchWeeklyScheduleAPI = (params) => {
  return request({
    url: "/admin/schedule/week",
    method: "GET",
    params: params,
  });
};

// 4.8 管理员: 周视图-按会议室查看
export const fetchRoomWeeklyScheduleAPI = (params) => {
  return request({
    url: "/admin/schedule/room",
    method: "GET",
    params: params,
  });
};

// 5.1 获取所有楼栋列表
export const fetchBuildingsAPI = () => {
  return request({
    url: "/meeting-room/buildings",
    method: "GET",
  });
};

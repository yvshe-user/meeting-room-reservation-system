/**
 * @file src/utils/enum.js
 * @brief 枚举值对照
 * @date 2025-12-8
 */

// 1. 预约状态 (ReservationStatus)
export const ReservationStatusMap = {
  0: { text: "待审批", color: "processing" }, // PENDING
  1: { text: "已通过", color: "success" }, // APPROVED
  2: { text: "已驳回", color: "error" }, // REJECTED
  3: { text: "已取消", color: "default" }, // CANCELLED
  4: { text: "已完成", color: "success" }, // COMPLETED
};

// 2. 用户角色 (UserRole)
export const UserRole = {
  USER: "user",
  ADMIN: "admin",
};

// 3. 审批结果 (ApprovalResult)
export const ApprovalResultMap = {
  0: { text: "已驳回", color: "error" },
  1: { text: "已通过", color: "success" },
};

/**
 * 根据状态数字获取预约状态的中文和颜色
 * @param {number} statusNum - 0, 1, 2, 3, 4
 * @returns {{text: string, color: string}}
 */
export const getReservationStatus = (statusNum) => {
  return ReservationStatusMap[statusNum] || { text: "未知", color: "warning" };
};

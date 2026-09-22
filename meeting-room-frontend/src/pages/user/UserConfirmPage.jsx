/**
 * @file src/pages/user/UserConfirmPage.jsx
 * @brief 我的待完成预约记录页面
 * @date 2025-12-14
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  message,
  Popconfirm,
  Spin,
  DatePicker,
  Space,
  Modal,
} from "antd";
import { ReloadOutlined, QrcodeOutlined } from "@ant-design/icons";
import {
  fetchUserReservationsAPI,
  confirmReservationAPI,
} from "../../api/room";

const STATUS_MAP = {
  0: { text: "待审批", color: "processing", canConfirm: false },
  1: { text: "已批准", color: "success", canConfirm: true },
};

const UserConfirmPage = () => {
  const [allReservations, setAllReservations] = useState([]);
  const [displayReservations, setDisplayReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterDate, setFilterDate] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const processAndPaginate = (sourceList, date, currentPage, pageSize) => {
    let filteredList = sourceList;
    // 1. 前端排序
    filteredList.sort((a, b) => b.reservationId - a.reservationId);
    // 2. 前端日期筛选
    if (date) {
      const targetDate = date.format("YYYY-MM-DD");
      filteredList = filteredList.filter(
        (item) => item.reservationDate === targetDate
      );
    }
    let total = filteredList.length;
    let finalCurrentPage = currentPage;
    // 3. 前端分页
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedList = filteredList.slice(startIndex, startIndex + pageSize);
    // 4. 修正页码
    if (paginatedList.length === 0 && currentPage > 1 && total > 0) {
      finalCurrentPage = Math.max(1, Math.ceil(total / pageSize));
      const newStartIndex = (finalCurrentPage - 1) * pageSize;
      paginatedList = filteredList.slice(
        newStartIndex,
        newStartIndex + pageSize
      );
    } else if (total === 0) {
      finalCurrentPage = 1;
    }
    setDisplayReservations(paginatedList);
    setPagination((prev) => ({
      ...prev,
      current: finalCurrentPage,
      pageSize: pageSize,
      total: total,
    }));
  };

  /**
   * 拉取待确认的预约数据
   */
  const loadConfirmableReservations = async () => {
    setLoading(true);
    try {
      const response = await fetchUserReservationsAPI({ page: 1, size: 1000 });
      const list = response.list || [];
      let confirmableList = list.filter((item) => item.reservationStatus === 1);
      setAllReservations(confirmableList);
      processAndPaginate(
        confirmableList,
        filterDate,
        pagination.current,
        pagination.pageSize
      );
    } catch (error) {
      console.error("加载待完成预约列表出错:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "服务器内部错误";
      message.error("加载列表失败：" + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfirmableReservations();
  }, []);

  /**
   * 日期筛选变化处理函数
   */
  const handleDateChange = (date) => {
    setFilterDate(date);
    processAndPaginate(allReservations, date, 1, pagination.pageSize);
  };

  const handleConfirmUsage = async (reservationId) => {
    try {
      await confirmReservationAPI(reservationId, "login");
      message.success(`预约 ID ${reservationId} 已成功完成！`);
      loadConfirmableReservations();
    } catch (error) {
      console.error("确认失败:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "服务器或网络错误";
      message.error(`完成操作失败：${errorMessage}`);
    }
  };

  const handleTableChange = (current, pageSize) => {
    processAndPaginate(allReservations, filterDate, current, pageSize);
  };

  const handleRefresh = () => {
    loadConfirmableReservations();
  };

  const handleScanClick = () => {
    Modal.info({
      title: "扫码确认",
      content: "您可以使用手机扫描会议室的二维码进行确认使用",
      okText: "知道了",
    });
  };

  const columns = [
    {
      title: "会议室名称",
      dataIndex: "roomName",
      key: "roomName",
      render: (_, record) =>
        `${record.roomName} (${record.building} ${record.roomNumber})`,
    },
    {
      title: "预约时间",
      dataIndex: "reservationDate",
      key: "timeRange",
      render: (_, record) =>
        `${record.reservationDate} ${
          record.startTime?.substring(0, 5) || ""
        } - ${record.endTime?.substring(0, 5) || ""}`,
    },
    {
      title: "参会人数",
      dataIndex: "attendance",
      key: "attendance",
      width: 100,
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_, record) => {
        const currentStatus = STATUS_MAP[record.reservationStatus];
        const canConfirm = currentStatus && currentStatus.canConfirm;

        return (
          <Space>
            <Popconfirm
              title="确认使用该会议室吗?"
              description="确认后预约状态将变更为【已完成】"
              onConfirm={() => handleConfirmUsage(record.reservationId)}
              disabled={!canConfirm}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" disabled={!canConfirm} style={{ padding: 0 }}>
                确认使用
              </Button>
            </Popconfirm>
            <Button
              type="text"
              icon={<QrcodeOutlined />}
              onClick={handleScanClick}
              disabled={!canConfirm}
              title="扫码确认"
            />
          </Space>
        );
      },
    },
  ];

  const BLUE_BUTTON_STYLE = {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    border: "none",
    boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
    color: "white",
  };

  return (
    <Card title="我的待完成预约记录" style={{ marginBottom: 24 }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* 日期筛选区域 */}
        <Space size="middle">
          <Space>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#666" }}>
              日期:
            </span>
            <DatePicker
              onChange={handleDateChange}
              placeholder="选择日期"
              style={{ width: 150 }}
              value={filterDate}
            />
          </Space>
        </Space>

        {/* 刷新按钮 */}
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          style={BLUE_BUTTON_STYLE}
        >
          刷新
        </Button>
      </div>

      <Spin spinning={loading} tip="加载中...">
        <Table
          columns={columns}
          dataSource={displayReservations}
          rowKey="reservationId"
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handleTableChange,
            position: ["bottomRight"],
            showQuickJumper: pagination.total > 10,
            showSizeChanger: false,
          }}
          scroll={{ y: 500 }}
          style={{ minHeight: "580px" }}
          locale={{ emptyText: "当前没有需要您完成的预约记录" }}
        />
      </Spin>
    </Card>
  );
};

export default UserConfirmPage;

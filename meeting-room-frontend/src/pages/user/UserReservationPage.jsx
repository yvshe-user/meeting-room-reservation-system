/**
 * @file src/pages/user/UserReservationPage.jsx
 * @brief 用户预约记录页面
 * @date 2025-12-8
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  message,
  Popconfirm,
  Spin,
  Select,
  DatePicker,
  Space,
  Modal,
  Descriptions,
  Tooltip,
} from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { fetchUserReservationsAPI, cancelReservationAPI } from "../../api/room";
import dayjs from "dayjs";

const { Option } = Select;

const STATUS_MAP = {
  0: { text: "待审批", color: "gold", canCancel: true },
  1: { text: "已批准", color: "success", canCancel: true },
  2: { text: "已驳回", color: "error", canCancel: false },
  3: { text: "已取消", color: "default", canCancel: false },
  4: { text: "已完成", color: "blue", canCancel: false },
};

const UserReservationPage = () => {
  const [allReservations, setAllReservations] = useState([]);
  const [displayReservations, setDisplayReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const processAndPaginate = (
    sourceList,
    status,
    date,
    currentPage,
    pageSize
  ) => {
    let filteredList = sourceList;
    filteredList.sort((a, b) => b.reservationId - a.reservationId);
    if (status !== null && status !== "all") {
      const targetStatus = parseInt(status);
      filteredList = filteredList.filter(
        (item) => item.reservationStatus === targetStatus
      );
    }
    if (date) {
      const targetDate = date.format("YYYY-MM-DD");
      filteredList = filteredList.filter(
        (item) => item.reservationDate === targetDate
      );
    }
    let total = filteredList.length;
    let finalCurrentPage = currentPage;
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedList = filteredList.slice(startIndex, startIndex + pageSize);
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

  const loadAllReservations = async () => {
    setLoading(true);
    try {
      const response = await fetchUserReservationsAPI({ page: 1, size: 1000 });
      const list = response.list || [];
      setAllReservations(list);
      processAndPaginate(
        list,
        filterStatus,
        filterDate,
        pagination.current,
        pagination.pageSize
      );
    } catch (error) {
      console.error("加载预约列表出错:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "服务器内部错误";
      message.error("加载预约列表失败：" + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReservations();
  }, []);

  const handleTableChange = (page, pageSize) => {
    processAndPaginate(
      allReservations,
      filterStatus,
      filterDate,
      page,
      pageSize
    );
  };

  const handleFilterChange = (value) => {
    const newStatus = value === undefined ? null : value;
    setFilterStatus(newStatus);
    processAndPaginate(
      allReservations,
      newStatus,
      filterDate,
      1,
      pagination.pageSize
    );
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
    processAndPaginate(
      allReservations,
      filterStatus,
      date,
      1,
      pagination.pageSize
    );
  };

  const handleRefresh = () => {
    loadAllReservations();
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await cancelReservationAPI(reservationId);
      message.success("预约已成功取消!");
      loadAllReservations();
    } catch (error) {
      message.error(error.response?.data?.message || "取消预约失败");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedReservation(record);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      title: "预约ID",
      dataIndex: "reservationId",
      key: "reservationId",
      width: 60,
      align: "center",
    },
    {
      title: "会议室",
      key: "roomInfo",
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500, fontSize: "13px" }}>
            {record.roomName}
          </span>
          <span style={{ fontSize: "12px", color: "#888" }}>
            {record.building} {record.roomNumber || ""}
          </span>
        </Space>
      ),
    },
    {
      title: "预约时间",
      key: "time",
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div>{record.reservationDate}</div>
          <div style={{ color: "#666" }}>
            {record.startTime?.slice(0, 5)} - {record.endTime?.slice(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "reservationStatus",
      key: "status",
      width: 80,
      render: (status) => (
        <Tag
          color={STATUS_MAP[status]?.color}
          style={{
            fontWeight: 600,
            fontSize: "12px",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "none",
          }}
        >
          {STATUS_MAP[status]?.text || "未知"}
        </Tag>
      ),
    },
    {
      title: "提交时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {/* 会议室详情按钮 */}
          <Tooltip title="查看预约详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: "#4A90E2" }}
            >
              详情
            </Button>
          </Tooltip>

          {/* 取消预约按钮 */}
          <Popconfirm
            title="确认取消此预约吗?"
            onConfirm={() => handleCancelReservation(record.reservationId)}
            disabled={!STATUS_MAP[record.reservationStatus]?.canCancel}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              disabled={!STATUS_MAP[record.reservationStatus]?.canCancel}
            >
              取消
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="我的会议室预约记录" style={{ marginBottom: 24 }}>
      {/* 筛选区域 */}
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
        <Space size="middle">
          {/* 状态筛选 */}
          <Space>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#666" }}>
              状态:
            </span>
            <Select
              placeholder="全部状态"
              style={{ width: 120 }}
              allowClear
              onChange={handleFilterChange}
              size="middle"
              value={filterStatus}
            >
              <Option value="all">全部</Option>
              {Object.entries(STATUS_MAP).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Space>

          {/* 日期筛选 */}
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
          style={{
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            border: "none",
            boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
            color: "white",
          }}
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
          locale={{ emptyText: "您当前没有预约记录" }}
        />
      </Spin>

      {/* 预约详情弹窗 */}
      <Modal
        title="预约详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedReservation && (
          <Descriptions
            bordered
            column={1}
            labelStyle={{
              width: "120px",
              fontWeight: 500,
              backgroundColor: "#fafafa",
            }}
            contentStyle={{ backgroundColor: "#fff" }}
          >
            <Descriptions.Item label="预约ID">
              {selectedReservation.reservationId}
            </Descriptions.Item>
            <Descriptions.Item label="会议室名称">
              {selectedReservation.roomName}
            </Descriptions.Item>
            <Descriptions.Item label="所属楼栋">
              {selectedReservation.building || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="房间号">
              {selectedReservation.roomNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="参会人数">
              {selectedReservation.attendance || "-"} 人{" "}
            </Descriptions.Item>
            <Descriptions.Item label="会议主题">
              {selectedReservation.meetingTopic || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="预约日期">
              {selectedReservation.reservationDate}
            </Descriptions.Item>
            <Descriptions.Item label="预约时间段">
              {selectedReservation.startTime?.slice(0, 5)} -{" "}
              {selectedReservation.endTime?.slice(0, 5)}
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {selectedReservation.createdAt
                ? dayjs(selectedReservation.createdAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag
                color={STATUS_MAP[selectedReservation.reservationStatus]?.color}
              >
                {STATUS_MAP[selectedReservation.reservationStatus]?.text}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default UserReservationPage;

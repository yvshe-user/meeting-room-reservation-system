/**
 * @file src/pages/admin/AdminReservationPage.jsx
 * @brief 管理员预约管理页面
 * @date 2025-12-9
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Card,
  Descriptions,
  Tooltip,
  DatePicker,
  Spin,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  fetchAllReservationsAPI,
  approveReservationAPI,
  fetchReservationDetailsAPI,
} from "../../api/room";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const STATUS_MAP = {
  0: { text: "待审批", color: "gold", badge: "gold" },
  1: { text: "已批准", color: "success", badge: "green" },
  2: { text: "已驳回", color: "error", badge: "red" },
  3: { text: "已取消", color: "default", badge: "grey" },
  4: { text: "已完成", color: "blue", badge: "geekblue" },
};

const AdminReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [rejectForm] = Form.useForm();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadReservations = async (
    currentPage = 1,
    pageSize = 10,
    status = filterStatus,
    date = filterDate
  ) => {
    setLoading(true);
    try {
      const isDateFilterActive = !!date;
      const params = {
        page: isDateFilterActive ? 1 : currentPage,
        size: isDateFilterActive ? 1000 : pageSize,
      };
      if (status !== null && status !== "all") {
        params.status = status;
      }
      const response = await fetchAllReservationsAPI(params);
      let list = response.list || [];
      let total = response.total || list.length;
      if (isDateFilterActive) {
        const targetDate = date.format("YYYY-MM-DD");
        list = list.filter((item) => {
          return item.reservationDate === targetDate;
        });
        total = list.length;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        list = list.slice(startIndex, endIndex);
      }
      setReservations(list);
      setPagination((prev) => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: total,
      }));
    } catch (error) {
      console.error(error);
      message.error("加载预约列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations(1, 10, null, null);
  }, []);

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    loadReservations(1, 10, value, filterDate);
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
    loadReservations(1, 10, filterStatus, date);
  };

  const handleRefresh = () => {
    setFilterStatus(null);
    setFilterDate(null);
    loadReservations(1, 10, null, null);
  };

  const handleApprove = async (reservationId) => {
    try {
      await approveReservationAPI({
        reservationId: reservationId,
        approvalResult: 1,
      });
      message.success(`预约ID ${reservationId} 已批准`);
      loadReservations(
        pagination.current,
        pagination.pageSize,
        filterStatus,
        filterDate
      );
    } catch (error) {
      message.error(error.response?.data?.message || "批准操作失败");
    }
  };

  const openRejectModal = (reservationId) => {
    setCurrentReservationId(reservationId);
    rejectForm.resetFields();
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (values) => {
    try {
      await approveReservationAPI({
        reservationId: currentReservationId,
        approvalResult: 0,
        rejectReason: values.rejectReason,
      });
      message.success(`预约ID ${currentReservationId} 已驳回`);
      setIsRejectModalOpen(false);
      loadReservations(
        pagination.current,
        pagination.pageSize,
        filterStatus,
        filterDate
      );
    } catch (error) {
      message.error(error.response?.data?.message || "驳回操作失败");
    }
  };

  const handleViewDetails = async (record) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const data = await fetchReservationDetailsAPI(record.reservationId);
      setSelectedReservation(data);
    } catch (error) {
      console.error("Failed to fetch reservation details", error);
      message.error("获取预约详情失败");
      setSelectedReservation(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const primaryButtonStyle = {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    border: "none",
    boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
    color: "white",
  };

  const columns = [
    {
      title: "预约ID",
      dataIndex: "reservationId",
      key: "reservationId",
      width: 80,
      align: "center",
    },
    {
      title: "申请人",
      dataIndex: "userName",
      key: "userName",
      width: 100,
    },
    {
      title: "会议室",
      key: "roomInfo",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.roomName}</span>
          <span style={{ fontSize: "12px", color: "#888" }}>
            {record.building}
          </span>
        </Space>
      ),
    },
    {
      title: "预约时间",
      key: "time",
      width: 180,
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          <div style={{ fontWeight: 500 }}>{record.reservationDate}</div>
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
      width: 100,
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
      width: 180,
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: "#4A90E2" }}
            >
              详情
            </Button>
          </Tooltip>

          {record.reservationStatus === 0 && (
            <>
              <Tooltip title="批准">
                <Popconfirm
                  title="确认批准该预约?"
                  onConfirm={() => handleApprove(record.reservationId)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    style={{ color: "#52c41a" }}
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="驳回">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => openRejectModal(record.reservationId)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 12px" }}>
      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        }}
      >
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
                  <Option key={key} value={parseInt(key)}>
                    {value.text}
                  </Option>
                ))}
              </Select>
            </Space>

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

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={primaryButtonStyle}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={reservations}
          rowKey="reservationId"
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) =>
              loadReservations(page, pageSize, filterStatus, filterDate),
            position: ["bottomRight"],
          }}
          scroll={{ y: 500 }}
          style={{ minHeight: "580px" }}
        />
      </Card>

      <Modal
        title="驳回预约"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={rejectForm} onFinish={handleRejectSubmit} layout="vertical">
          <Form.Item
            name="rejectReason"
            label="驳回理由"
            rules={[{ required: true, message: "请输入驳回理由" }]}
          >
            <TextArea rows={4} placeholder="请输入具体的驳回原因..." />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsRejectModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit" danger>
                确认驳回
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="加载详情中..." />
          </div>
        ) : (
          selectedReservation && (
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
              <Descriptions.Item label="申请人">
                {selectedReservation.userName}
                {selectedReservation.userRole && (
                  <Tag style={{ marginLeft: 8 }}>
                    {selectedReservation.userRole}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {selectedReservation.userPhone || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="会议室">
                {selectedReservation.roomName} ({selectedReservation.roomNumber}
                )
              </Descriptions.Item>
              <Descriptions.Item label="所属楼栋">
                {selectedReservation.building}
              </Descriptions.Item>
              <Descriptions.Item label="会议室详情">
                {selectedReservation.roomDetails ? (
                  <Space direction="vertical" size={0}>
                    <span>
                      容量: {selectedReservation.roomDetails.capacity}人
                    </span>
                    <span>面积: {selectedReservation.roomDetails.area}㎡</span>
                    <span>
                      描述: {selectedReservation.roomDetails.description}
                    </span>
                  </Space>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="会议主题">
                {selectedReservation.meetingTopic}
              </Descriptions.Item>
              <Descriptions.Item label="参会人数">
                {selectedReservation.attendance} 人
              </Descriptions.Item>
              <Descriptions.Item label="预约日期">
                {selectedReservation.reservationDate}
              </Descriptions.Item>
              <Descriptions.Item label="时间段">
                {selectedReservation.startTime} - {selectedReservation.endTime}
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
                  color={
                    STATUS_MAP[selectedReservation.reservationStatus]?.color
                  }
                  style={{
                    fontWeight: 600,
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "none",
                  }}
                >
                  {STATUS_MAP[selectedReservation.reservationStatus]?.text}
                </Tag>
              </Descriptions.Item>
              {selectedReservation.approvalTime && (
                <Descriptions.Item label="审批时间">
                  {dayjs(selectedReservation.approvalTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </Descriptions.Item>
              )}
              {selectedReservation.rejectReason && (
                <Descriptions.Item label="驳回原因">
                  <span style={{ color: "#ff4d4f" }}>
                    {selectedReservation.rejectReason}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          )
        )}
      </Modal>
    </div>
  );
};

export default AdminReservationPage;

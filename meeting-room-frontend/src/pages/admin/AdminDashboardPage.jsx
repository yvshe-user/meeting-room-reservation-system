/**
 * @file src/pages/admin/AdminDashboardPage.jsx
 * @brief 管理员主页
 * @date 2025-12-12
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Avatar,
  Button,
  Tag,
  Space,
  message,
  Skeleton,
  Empty,
  Popconfirm,
} from "antd";
import {
  DesktopOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  fetchRoomListAPI,
  fetchAllReservationsAPI,
  fetchWeeklyScheduleAPI,
  approveReservationAPI,
} from "../../api/room";

dayjs.extend(isoWeek);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    roomCount: 0,
    pendingCount: 0,
    todayCount: 0,
  });
  const [pendingList, setPendingList] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const roomRes = await fetchRoomListAPI({ page: 1, size: 1 });
      const roomTotal = roomRes?.total || 0;
      const pendingRes = await fetchAllReservationsAPI({
        status: 0,
        page: 1,
        size: 5,
      });
      const pendingTotal = pendingRes?.total || 0;
      setPendingList(pendingRes?.list || []);
      const today = dayjs();
      const weekStart = today.startOf("isoWeek").format("YYYY-MM-DD");
      const scheduleRes = await fetchWeeklyScheduleAPI({
        weekStartDate: weekStart,
      });
      let todayTotal = 0;
      let weekTrend = [];
      if (scheduleRes && scheduleRes.schedule && scheduleRes.schedule[0]) {
        const schedule = scheduleRes.schedule[0];
        const days = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        const dayLabels = [
          "周一",
          "周二",
          "周三",
          "周四",
          "周五",
          "周六",
          "周日",
        ];
        const currentDayIndex = today.day() === 0 ? 6 : today.day() - 1;
        weekTrend = days.map((key, index) => {
          const count = schedule[key] ? schedule[key].length : 0;
          if (index === currentDayIndex) {
            todayTotal = count;
          }
          return {
            day: dayLabels[index],
            count: count,
            isToday: index === currentDayIndex,
          };
        });
      }
      setStats({
        roomCount: roomTotal,
        pendingCount: pendingTotal,
        todayCount: todayTotal,
      });
      setWeeklyData(weekTrend);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      message.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, result) => {
    try {
      await approveReservationAPI({
        reservationId: id,
        approvalResult: result,
        rejectReason: result === 0 ? "管理员快捷驳回" : null,
      });
      message.success(result === 1 ? "已通过" : "已驳回");
      loadDashboardData();
    } catch (error) {
      console.error("Operation failed", error);
      message.error("操作失败");
    }
  };

  const SimpleBarChart = ({ data }) => {
    const maxCount = Math.max(...data.map((d) => d.count), 5);
    return (
      <div
        style={{
          height: "200px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "20px 10px 0",
        }}
      >
        {data.map((item, index) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "12%",
              }}
            >
              <div
                style={{
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: item.isToday ? "#1890ff" : "#bfbfbf",
                  fontSize: item.isToday ? "16px" : "14px",
                }}
              >
                {item.count}
              </div>
              <div
                style={{
                  width: "16px",
                  height: "120px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${heightPercent}%`,
                    background: item.isToday
                      ? "linear-gradient(180deg, #69c0ff 0%, #1890ff 100%)"
                      : "#bae7ff",
                    transition: "height 0.5s ease",
                    borderRadius: "10px",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: item.isToday ? "#1890ff" : "#8c8c8c",
                }}
              >
                {item.day}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card
      bordered={false}
      hoverable
      style={{ borderRadius: "12px", height: "100%", overflow: "hidden" }}
      bodyStyle={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{ color: "#8c8c8c", fontSize: "14px", marginBottom: "8px" }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: color,
              lineHeight: 1,
            }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            backgroundColor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            fontSize: "32px",
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="admin-dashboard">
      {/* 顶部统计卡片 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="会议室总数"
            value={stats.roomCount}
            icon={<DesktopOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="待审批预约数"
            value={stats.pendingCount}
            icon={<ClockCircleOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="今日预约数"
            value={stats.todayCount}
            icon={<CalendarOutlined />}
            color="#52c41a"
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        {/* 左侧: 待审批列表 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <span
                style={{
                  fontSize: "15px",
                  color: "#8c8c8c",
                  fontWeight: "normal",
                }}
              >
                待审批预约
              </span>
            }
            bordered={false}
            hoverable
            style={{ borderRadius: "12px", minHeight: "400px" }}
            extra={
              <Button
                type="link"
                onClick={() => navigate("/admin/reservations")}
              >
                查看全部 <RightOutlined />
              </Button>
            }
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              {pendingList.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={pendingList}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          title="快速通过该预约?"
                          onConfirm={() => handleApprove(item.reservationId, 1)}
                          okText="确认"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            icon={<CheckOutlined />}
                            style={{ color: "#52c41a" }}
                          >
                            通过
                          </Button>
                        </Popconfirm>,
                        <Popconfirm
                          title="快速驳回该预约?"
                          onConfirm={() => handleApprove(item.reservationId, 0)}
                          okText="确认"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            icon={<CloseOutlined />}
                            style={{ color: "#ff4d4f" }}
                          >
                            驳回
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: "#e6f7ff",
                              color: "#1890ff",
                            }}
                            icon={<UserOutlined />}
                          />
                        }
                        title={
                          <Space>
                            <span style={{ fontWeight: 500 }}>
                              {item.userName}
                            </span>
                            <Tag color="blue" style={{ borderRadius: "4px" }}>
                              {item.roomName}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space
                            direction="vertical"
                            size={2}
                            style={{ fontSize: "13px", color: "#8c8c8c" }}
                          >
                            <span>{item.meetingTopic}</span>
                            <span>
                              {item.reservationDate}{" "}
                              {item.startTime.slice(0, 5)}-
                              {item.endTime.slice(0, 5)}
                            </span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="暂无待审批预约"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* 右侧：本周趋势 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span
                style={{
                  fontSize: "15px",
                  color: "#8c8c8c",
                  fontWeight: "normal",
                }}
              >
                本周预约趋势
              </span>
            }
            bordered={false}
            hoverable
            style={{ borderRadius: "12px", minHeight: "400px" }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <div style={{ marginTop: "20px" }}>
                <SimpleBarChart data={weeklyData} />
                <div
                  style={{
                    marginTop: "40px",
                    textAlign: "center",
                    color: "#8c8c8c",
                    fontSize: "13px",
                  }}
                >
                  <Space size="large">
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#1890ff",
                          marginRight: 4,
                        }}
                      ></span>
                      今日
                    </span>
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#bae7ff",
                          marginRight: 4,
                        }}
                      ></span>
                      其他日期
                    </span>
                  </Space>
                </div>
              </div>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;

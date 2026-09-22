/**
 * @file src/pages/admin/AdminSchedulePage.jsx
 * @brief 管理员周视图页面
 * @date 2025-12-12
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, DatePicker, Select, Button, message, Spin, Tooltip } from "antd";
import { LeftOutlined, RightOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  fetchWeeklyScheduleAPI,
  fetchRoomWeeklyScheduleAPI,
  fetchRoomListAPI,
  fetchReservationDetailsAPI,
  fetchAllReservationsAPI,
} from "../../api/room";

dayjs.extend(isoWeek);

const WEEK_DAYS = [
  { key: "monday", label: "周一", dateOffset: 0 },
  { key: "tuesday", label: "周二", dateOffset: 1 },
  { key: "wednesday", label: "周三", dateOffset: 2 },
  { key: "thursday", label: "周四", dateOffset: 3 },
  { key: "friday", label: "周五", dateOffset: 4 },
  { key: "saturday", label: "周六", dateOffset: 5 },
  { key: "sunday", label: "周日", dateOffset: 6 },
];

const START_HOUR = 8;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const CELL_HEIGHT = 60;

const ReservationTooltipContent = ({ reservationId, initialData }) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      try {
        const res = await fetchReservationDetailsAPI(reservationId);
        if (mounted) {
          setDetails(res);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load details", error);
        if (mounted) setLoading(false);
      }
    };
    loadDetails();
    return () => {
      mounted = false;
    };
  }, [reservationId]);

  const data = details || initialData || {};
  const statusText = ["待审批", "已通过", "已驳回", "已取消", "已完成"][
    data.reservationStatus !== undefined ? data.reservationStatus : data.status
  ];

  return (
    <div
      style={{ minWidth: "240px", minHeight: "130px", position: "relative" }}
    >
      {loading && (
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <Spin size="small" />
        </div>
      )}
      <p
        style={{
          marginBottom: "8px",
          fontSize: "14px",
          fontWeight: "bold",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          paddingBottom: "4px",
          paddingRight: "20px",
        }}
      >
        {data.meetingTopic || "加载中..."}
      </p>
      <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
        <p style={{ margin: 0 }}>
          <strong>申请人:</strong>{" "}
          {details ? details.userName || "未知" : "加载中..."}
          {details?.userPhone && ` (${details.userPhone})`}
        </p>
        <p style={{ margin: 0 }}>
          <strong>会议室:</strong>{" "}
          {details?.roomName || data.roomName || "加载中..."}
        </p>
        <p style={{ margin: 0 }}>
          <strong>时间段:</strong>{" "}
          {details?.startTime
            ? `${details.startTime.slice(0, 5)}-${details.endTime.slice(0, 5)}`
            : data.timeSlot || "-"}
        </p>
        <p style={{ margin: 0 }}>
          <strong>参会人数:</strong>{" "}
          {details?.attendance ? `${details.attendance} 人` : "-"}
        </p>
        <p style={{ margin: 0 }}>
          <strong>状态:</strong> {statusText || "-"}
        </p>
        {details?.description && (
          <p style={{ margin: 0 }}>
            <strong>备注:</strong> {details.description}
          </p>
        )}
      </div>
    </div>
  );
};

const AdminSchedulePage = () => {
  const [viewType, setViewType] = useState("time");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState({});

  const weekStartDate = useMemo(() => {
    return currentDate.startOf("isoWeek");
  }, [currentDate]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (viewType === "room" && !selectedRoomId) {
      if (roomList.length > 0) {
        setSelectedRoomId(roomList[0].roomId);
      }
      return;
    }
    fetchSchedule();
  }, [viewType, weekStartDate, selectedRoomId, roomList]);

  const fetchRooms = async () => {
    try {
      const res = await fetchRoomListAPI();
      if (res && res.list) {
        setRoomList(res.list);
        if (res.list.length > 0) {
          setSelectedRoomId(res.list[0].roomId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const dateStr = weekStartDate.format("YYYY-MM-DD");
      let data = {};

      const promises = [];

      if (viewType === "time") {
        promises.push(fetchWeeklyScheduleAPI({ weekStartDate: dateStr }));
      } else {
        if (!selectedRoomId) return;
        promises.push(
          fetchRoomWeeklyScheduleAPI({
            weekStartDate: dateStr,
            roomId: selectedRoomId,
          })
        );
        promises.push(fetchAllReservationsAPI({ page: 1, size: 1000 }));
      }

      const results = await Promise.all(promises);
      const res = results[0];

      if (viewType === "time") {
        if (res && res.schedule && res.schedule.length > 0) {
          data = res.schedule[0];
        }
      } else {
        if (res && res.schedule) {
          data = res.schedule;
        }
        if (results[1] && results[1].list) {
          const map = {};
          results[1].list.forEach((r) => {
            map[r.reservationId] = r.userName;
          });
          setUserMap(map);
        }
      }
      setScheduleData(data);
    } catch (error) {
      console.error("Failed to fetch schedule", error);
      message.error("获取日程失败");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    setCurrentDate(currentDate.subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentDate(currentDate.add(1, "week"));
  };

  const handleDateChange = (date) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleRefresh = () => {
    const today = dayjs();
    const currentWeekStart = today.startOf("isoWeek");
    if (weekStartDate.isSame(currentWeekStart, "day")) {
      fetchSchedule();
    } else {
      setCurrentDate(today);
    }
  };

  const primaryButtonStyle = {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    border: "none",
    boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
    color: "white",
  };

  const defaultButtonStyle = {
    background: "#fff",
    border: "1px solid #d9d9d9",
    color: "rgba(0, 0, 0, 0.88)",
  };

  const parseTimeSlot = (timeSlot) => {
    if (!timeSlot) return { start: 0, end: 0, duration: 0 };
    const [startStr, endStr] = timeSlot.split("-");
    const parseToMinutes = (str) => {
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    };
    const startMinutes = parseToMinutes(startStr);
    const endMinutes = parseToMinutes(endStr);
    return {
      start: startMinutes,
      end: endMinutes,
      duration: endMinutes - startMinutes,
    };
  };

  const getEventStyle = (timeSlot) => {
    const { start, duration } = parseTimeSlot(timeSlot);
    const startOffset = start - START_HOUR * 60;
    const top = (startOffset / 60) * CELL_HEIGHT;
    const height = (duration / 60) * CELL_HEIGHT;
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const renderTimeAxis = () => {
    const hours = [];
    for (let i = START_HOUR; i <= END_HOUR; i++) {
      hours.push(
        <div
          key={i}
          style={{ height: `${CELL_HEIGHT}px`, position: "relative" }}
        >
          <span
            style={{
              position: "absolute",
              top: "-10px",
              right: "8px",
              color: "#999",
              fontSize: "12px",
            }}
          >
            {i}:00
          </span>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "40px",
              right: 0,
              borderTop: "1px solid #f0f0f0",
            }}
          />
        </div>
      );
    }
    return (
      <div
        style={{
          width: "50px",
          flexShrink: 0,
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {hours}
      </div>
    );
  };

  const renderDayColumn = (dayKey, date) => {
    const events = (scheduleData[dayKey] || []).filter(
      (e) => e.status === 0 || e.status === 1 || e.status === 4
    );
    return (
      <div
        style={{
          flex: 1,
          borderRight: "1px solid #f0f0f0",
          position: "relative",
          minWidth: "120px",
        }}
      >
        {/* 头部日期 */}
        <div
          style={{
            height: "50px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: date.isSame(dayjs(), "day")
              ? "#e6f7ff"
              : "transparent",
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            {WEEK_DAYS.find((d) => d.key === dayKey).label}
          </span>
          <span style={{ fontSize: "12px", color: "#666" }}>
            {date.format("MM-DD")}
          </span>
        </div>

        {/* 事件区域 */}
        <div
          style={{
            position: "relative",
            height: `${TOTAL_HOURS * CELL_HEIGHT}px`,
          }}
        >
          {/* 背景网格线 */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${i * CELL_HEIGHT}px`,
                left: 0,
                right: 0,
                borderTop: "1px solid #f5f5f5",
              }}
            />
          ))}

          {/* 事件卡片 */}
          {events.map((event) => {
            const style = getEventStyle(event.timeSlot);
            let bgColor = "#e6f7ff";
            let borderColor = "#91d5ff";
            let textColor = "#096dd9";
            switch (event.status) {
              case 0: // 待审批 - 浅黄色
                bgColor = "#fffbe6";
                borderColor = "#ffe58f";
                textColor = "#d48806";
                break;
              case 1: // 已通过 - 浅绿色
                bgColor = "#f6ffed";
                borderColor = "#b7eb8f";
                textColor = "#389e0d";
                break;
              case 4: // 已完成 - 浅蓝色
                bgColor = "#e6f7ff";
                borderColor = "#91d5ff";
                textColor = "#096dd9";
                break;
              default:
                break;
            }

            let cardTitle = "";
            if (viewType === "time") {
              cardTitle = event.roomName;
            } else {
              cardTitle = userMap[event.reservationId] || "加载中...";
            }

            return (
              <Tooltip
                key={event.reservationId}
                title={
                  <ReservationTooltipContent
                    reservationId={event.reservationId}
                    initialData={event}
                  />
                }
                destroyTooltipOnHide={{ keepParent: false }}
                mouseEnterDelay={0.2}
              >
                <div
                  style={{
                    position: "absolute",
                    ...style,
                    left: "2px",
                    right: "2px",
                    backgroundColor: bgColor,
                    borderLeft: `4px solid ${borderColor}`,
                    borderRadius: "4px",
                    padding: "4px",
                    color: textColor,
                    fontSize: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    opacity: 0.9,
                    zIndex: 1,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cardTitle}
                  </div>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {event.timeSlot}
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-schedule-page">
      <Card bordered={false}>
        {/* 顶部工具栏 */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "0" }}>
              <Button
                style={{
                  ...(viewType === "time"
                    ? primaryButtonStyle
                    : defaultButtonStyle),
                  borderRadius: "6px 0 0 6px",
                  borderRight:
                    viewType === "time" ? "none" : "1px solid #d9d9d9",
                }}
                onClick={() => setViewType("time")}
              >
                按时间查看
              </Button>
              <Button
                style={{
                  ...(viewType === "room"
                    ? primaryButtonStyle
                    : defaultButtonStyle),
                  borderRadius: "0 6px 6px 0",
                  borderLeft: "none",
                }}
                onClick={() => setViewType("room")}
              >
                按会议室查看
              </Button>
            </div>

            {viewType === "room" && (
              <Select
                style={{ width: 200 }}
                placeholder="选择会议室"
                value={selectedRoomId}
                onChange={setSelectedRoomId}
                options={roomList.map((room) => ({
                  label: room.roomName,
                  value: room.roomId,
                }))}
              />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
            <DatePicker
              picker="week"
              value={currentDate}
              onChange={handleDateChange}
              allowClear={false}
              format="YYYY-MM-DD"
            />
            <Button icon={<RightOutlined />} onClick={handleNextWeek} />
            <Button
              icon={<ReloadOutlined />}
              style={primaryButtonStyle}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </div>
        </div>

        {/* 日程表格 */}
        <Spin spinning={loading}>
          <div
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: "4px",
              overflowX: "auto",
            }}
          >
            <div style={{ display: "flex", minWidth: "800px" }}>
              {/* 左侧时间轴 */}
              <div style={{ paddingTop: "50px" }}>{renderTimeAxis()}</div>

              {/* 右侧日程列 */}
              <div style={{ flex: 1, display: "flex" }}>
                {WEEK_DAYS.map((day) =>
                  renderDayColumn(
                    day.key,
                    weekStartDate.add(day.dateOffset, "day")
                  )
                )}
              </div>
            </div>
          </div>
        </Spin>

        {/* 图例 */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: "4px",
              }}
            ></div>
            <span>待审批</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "4px",
              }}
            ></div>
            <span>已通过</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#e6f7ff",
                border: "1px solid #91d5ff",
                borderRadius: "4px",
              }}
            ></div>
            <span>已完成</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSchedulePage;

/**
 * @file src/pages/user/UserHomePage.jsx
 * @brief 用户主页 (会议室查看+快速预约)
 * @date 2025-12-8
 */

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import {
  Row,
  Col,
  Card,
  Form,
  Spin,
  Select,
  Button,
  message,
  DatePicker,
  TimePicker,
  InputNumber,
  Tag,
  Modal,
  Input,
  Pagination,
  Image,
  Descriptions,
  Space,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ExpandOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  fetchRoomListAPI,
  searchRoomsAPI,
  createReservationAPI,
  fetchBuildingsAPI,
} from "../../api/room";

const { Option } = Select;
const { RangePicker } = TimePicker;

const UserHomePage = () => {
  const [allRooms, setAllRooms] = useState([]);
  const [displayRooms, setDisplayRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [buildings, setBuildings] = useState([]);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentRoomDetail, setCurrentRoomDetail] = useState(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [reserveForm] = Form.useForm();
  const [reserveLoading, setReserveLoading] = useState(false);

  const primaryGradient = "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)";

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  const loadBuildings = async () => {
    setBuildingLoading(true);
    try {
      const response = await fetchBuildingsAPI();
      const buildingList = response.data || response || [];
      setBuildings(buildingList);
    } catch (error) {
      console.error("加载楼栋列表失败", error);
      message.error("加载楼栋列表失败，请稍后重试");
      setBuildings([]);
    } finally {
      setBuildingLoading(false);
    }
  };

  // 核心修复：1. 不删除page/size参数 2. 修正数据解析路径
  const loadAllRooms = async (params = {}) => {
    setLoading(true);
    try {
      // 修复1：传入page=1&size=1000，且不删除这些参数
      const requestParams = {
        ...params,
        page: 1,
        size: 1000, // 一次性加载所有会议室，突破后端默认10条限制
      };
      // 删掉这两行：不再删除page/size参数，确保传给后端
      // delete requestParams.page;
      // delete requestParams.size;

      const response = await fetchRoomListAPI(requestParams);
      // 修复2：正确解析后端返回的列表（response.data.list）
      const list =
        response.data?.list || response.list || response.data || response || [];
      setAllRooms(list);
      // 修复3：正确获取总数量（response.data.total）
      const total = response.data?.total || list.length;
      setPagination((prev) => ({
        ...prev,
        total: total,
        current: 1,
      }));
      renderPageData(list, 1, pagination.pageSize);
    } catch (error) {
      const specificMessage =
        error.response?.data?.message || "加载会议室列表失败";
      if (Object.keys(params).length > 0) {
        message.error(specificMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchRooms = async (params = {}) => {
    setLoading(true);
    try {
      const requestParams = { ...params };
      delete requestParams.page;
      delete requestParams.size;
      const response = await searchRoomsAPI(requestParams);
      // 同步修复搜索的解析路径
      const list =
        response.data?.list || response.list || response.data || response || [];
      setAllRooms(list);
      const total = response.data?.total || list.length;
      setPagination((prev) => ({
        ...prev,
        total: total,
        current: 1,
      }));
      renderPageData(list, 1, pagination.pageSize);
    } catch (error) {
      const specificMessage = error.response?.data?.message || "搜索会议室失败";
      message.error(specificMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPageData = (data, currentPage, pageSize) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = data.slice(startIndex, endIndex);
    setDisplayRooms(pageData);
  };

  const handlePaginationChange = (currentPage) => {
    setPagination((prev) => ({ ...prev, current: currentPage }));
    renderPageData(allRooms, currentPage, pagination.pageSize);
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    if (buildings.length > 0) {
      loadAllRooms();
    }
  }, [buildings.length]);

  const onSearch = (values) => {
    const defaultDate = dayjs().add(1, "day").format("YYYY-MM-DD");
    const defaultStartTime = "08:00";
    const defaultEndTime = "22:00";
    const timeRange =
      Array.isArray(values.timeRange) && values.timeRange.length === 2
        ? values.timeRange
        : [dayjs(defaultStartTime, "HH:mm"), dayjs(defaultEndTime, "HH:mm")];
    const [startTimeObj, endTimeObj] = timeRange;
    const params = {
      reservationDate: values.date
        ? values.date.format("YYYY-MM-DD")
        : defaultDate,
      startTime: startTimeObj ? startTimeObj.format("HH:mm") : defaultStartTime,
      endTime: endTimeObj ? endTimeObj.format("HH:mm") : defaultEndTime,
      attendance: values.capacity || 1,
      building: values.building,
    };
    if (!params.building) {
      delete params.building;
    }
    searchRooms(params);
  };

  const onReset = () => {
    form.resetFields();
    loadAllRooms();
  };

  const handleRoomCardClick = (room) => {
    setCurrentRoomDetail(room);
    setIsDetailModalOpen(true);
  };

  const handleDetailReserveClick = () => {
    setCurrentRoom(currentRoomDetail);
    setIsDetailModalOpen(false);
    setIsReserveModalOpen(true);
    const searchValues = form.getFieldsValue();
    const reserveDate = searchValues.date || dayjs().add(1, "day");
    const defaultTimeRange = [dayjs("08:00", "HH:mm"), dayjs("22:00", "HH:mm")];
    const reserveTimeRange =
      Array.isArray(searchValues.timeRange) &&
      searchValues.timeRange.length === 2
        ? searchValues.timeRange
        : defaultTimeRange;
    reserveForm.setFieldsValue({
      roomId: currentRoomDetail.roomId,
      roomName: currentRoomDetail.roomName,
      reservationDate: reserveDate,
      timeRange: reserveTimeRange,
      attendance: currentRoomDetail.capacity,
      meetingTopic: "",
      description: "",
    });
  };

  const handleReserveSubmit = async (values) => {
    if (
      !values.reservationDate ||
      !values.timeRange ||
      values.timeRange.length < 2
    ) {
      message.error("请完整填写预约信息(日期 + 时间段)");
      return;
    }
    if (!values.meetingTopic) {
      message.error("请输入会议主题");
      return;
    }
    if (!values.attendance || values.attendance < 1) {
      message.error("请输入有效的参会人数");
      return;
    }

    setReserveLoading(true);
    try {
      const [startTimeObj, endTimeObj] = values.timeRange;
      const payload = {
        roomId: values.roomId,
        reservationDate: values.reservationDate.format("YYYY-MM-DD"),
        startTime: startTimeObj.format("HH:mm:00"),
        endTime: endTimeObj.format("HH:mm:00"),
        meetingTopic: values.meetingTopic,
        attendance: values.attendance,
        description: values.description || "",
      };
      const response = await createReservationAPI(payload);
      const successMessage =
        response.message ||
        `会议室 ${values.roomName} 预约成功，等待管理员审批!`;
      message.success(successMessage);
      setIsReserveModalOpen(false);
      await loadAllRooms();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "预约提交失败，请稍后重试";
      message.error(errorMessage);
    } finally {
      setReserveLoading(false);
    }
  };

  const roomImageContainerStyle = {
    width: "100%",
    height: 120,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    color: "#999",
    fontSize: 14,
  };

  return (
    <>
      {/* 搜索筛选区 */}
      <Card title="快速查找会议室" style={{ margin: "16px 16px 24px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSearch}
          initialValues={{
            date: dayjs().add(1, "day"),
            timeRange: [dayjs("08:00", "HH:mm"), dayjs("22:00", "HH:mm")],
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="预约日期" name="date">
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current < dayjs().endOf("day")
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item label="预约时间段" name="timeRange">
                <RangePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  minuteStep={60} // 只能选择整点
                  disabledHours={() => [0, 1, 2, 3, 4, 5, 6, 7, 23]} // 禁用非工作时间
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item label="容纳人数" name="capacity">
                <InputNumber
                  min={1}
                  placeholder="最少人数"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item label="所属楼栋" name="building">
                <Select
                  placeholder="选择楼栋"
                  allowClear
                  loading={buildingLoading}
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {/* 动态渲染楼栋列表 */}
                  {buildings.map((b) => (
                    <Option key={b} value={b}>
                      {b}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col
              xs={24}
              sm={12}
              md={4}
              style={{ display: "flex", alignItems: "flex-end" }}
            >
              <Form.Item>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={loading}
                    style={{
                      flex: 1,
                      background: primaryGradient,
                      border: "none",
                    }}
                  >
                    搜索
                  </Button>
                  <Button onClick={onReset} style={{ flex: 1 }}>
                    重置
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 会议室列表区 */}
      <div style={{ padding: "0 16px" }}>
        <Spin spinning={loading} tip="正在加载会议室...">
          <Row gutter={[16, 16]}>
            {displayRooms.length > 0 ? (
              displayRooms.map((room) => (
                <Col xs={24} sm={12} md={8} lg={6} key={room.roomId}>
                  <Card
                    hoverable
                    title={room.roomName}
                    extra={
                      <Tag color={room.isAvailable === 1 ? "success" : "error"}>
                        {room.isAvailable === 1 ? "可用" : "维护中"}
                      </Tag>
                    }
                    onClick={() => handleRoomCardClick(room)}
                    style={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                    className="room-card"
                  >
                    {/* 会议室图片/占位展示 */}
                    <div style={{ marginBottom: 12 }}>
                      {room.photoUrl ? (
                        <Image
                          src={room.photoUrl}
                          alt={`${room.roomName}图片`}
                          style={{
                            width: "100%",
                            height: 120,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                          preview={{
                            title: room.roomName,
                            mask: <ClockCircleOutlined />,
                          }}
                          lazyLoad
                        />
                      ) : (
                        <div style={roomImageContainerStyle}>图片未上传</div>
                      )}
                    </div>

                    <div
                      style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}
                    >
                      <p>
                        <UserOutlined style={{ marginRight: 4 }} />
                        容纳人数：{room.capacity} 人
                      </p>
                      <p>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        所属楼栋：{room.building || "未设置"}
                      </p>
                      <p>房间号：{room.roomNumber || "未设置"}</p>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24} style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ color: "#999", fontSize: 16 }}>
                  暂无符合条件的会议室
                </div>
              </Col>
            )}
          </Row>

          {/* 分页组件 */}
          {pagination.total > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
                marginBottom: 24,
              }}
            >
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePaginationChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total) => `共 ${total} 个会议室`}
              />
            </div>
          )}
        </Spin>
      </div>

      {/* 会议室详情弹窗 */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <InfoCircleOutlined style={{ color: "#4A90E2" }} />
            <span>{currentRoomDetail?.roomName || "会议室详情"}</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
          <Button
            key="reserve"
            type="primary"
            onClick={handleDetailReserveClick}
            disabled={currentRoomDetail?.isAvailable !== 1}
            style={{ background: primaryGradient, border: "none" }}
          >
            预约此会议室
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        {currentRoomDetail && (
          <div style={{ padding: "10px 0" }}>
            <Row gutter={[24, 24]}>
              <Col span={24} style={{ textAlign: "center" }}>
                {/* 详情弹窗图片/占位展示 */}
                {currentRoomDetail.photoUrl ? (
                  <Image
                    src={currentRoomDetail.photoUrl}
                    alt={`${currentRoomDetail.roomName}图片`}
                    style={{
                      borderRadius: 12,
                      maxHeight: "300px",
                      objectFit: "cover",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    preview={{
                      title: currentRoomDetail.roomName,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 240,
                      borderRadius: 12,
                      backgroundColor: "#f5f7fa",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      border: "1px dashed #d9d9d9",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}
                    />
                    <span>暂无图片</span>
                  </div>
                )}
              </Col>

              <Col span={24}>
                <Descriptions
                  bordered
                  column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                  labelStyle={{
                    width: "120px",
                    background: "#fafafa",
                    fontWeight: 500,
                  }}
                >
                  <Descriptions.Item label="会议室ID">
                    {currentRoomDetail.roomId}
                  </Descriptions.Item>
                  <Descriptions.Item label="房间号">
                    {currentRoomDetail.roomNumber || "未设置"}
                  </Descriptions.Item>
                  <Descriptions.Item label="所属楼栋">
                    <Space>
                      <EnvironmentOutlined style={{ color: "#4A90E2" }} />
                      {currentRoomDetail.building || "未设置"}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="容纳人数">
                    <Space>
                      <TeamOutlined style={{ color: "#52c41a" }} />
                      {currentRoomDetail.capacity} 人
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="面积">
                    <Space>
                      <ExpandOutlined style={{ color: "#faad14" }} />
                      {currentRoomDetail.area || "0"} ㎡
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="当前状态">
                    <Tag
                      color={
                        currentRoomDetail.isAvailable === 1
                          ? "success"
                          : "error"
                      }
                    >
                      {currentRoomDetail.isAvailable === 1 ? "可用" : "维护中"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="描述说明" span={2}>
                    {currentRoomDetail.description || "暂无描述"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 预约弹窗 */}
      <Modal
        title={`预约 ${currentRoom?.roomName || ""}`}
        open={isReserveModalOpen}
        onCancel={() => setIsReserveModalOpen(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={reserveForm}
          layout="vertical"
          onFinish={handleReserveSubmit}
        >
          <Form.Item name="roomId" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="会议室名称" name="roomName">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="预约日期"
            name="reservationDate"
            rules={[{ required: true, message: "请选择预约日期" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current < dayjs().endOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            label="预约时间段"
            name="timeRange"
            rules={[{ required: true, message: "请选择预约时间段" }]}
          >
            <RangePicker
              format="HH:mm"
              style={{ width: "100%" }}
              minuteStep={60}
              disabledHours={() => [0, 1, 2, 3, 4, 5, 6, 7, 23]}
            />
          </Form.Item>

          <Form.Item
            label="参会人数"
            name="attendance"
            rules={[{ required: true, message: "请输入参会人数" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="会议主题"
            name="meetingTopic"
            rules={[{ required: true, message: "请输入会议主题" }]}
          >
            <Input placeholder="请输入会议主题" />
          </Form.Item>

          <Form.Item label="备注说明" name="description">
            <Input.TextArea rows={2} placeholder="选填：补充会议相关说明" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Button
              onClick={() => setIsReserveModalOpen(false)}
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={reserveLoading}
              style={{ background: primaryGradient, border: "none" }}
            >
              提交预约
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserHomePage;

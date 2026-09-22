/**
 * @file src/pages/admin/AdminRoomManager.jsx
 * @brief 管理员会议室管理页面
 * @date 2025-12-9
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Upload,
  Card,
  Descriptions,
  Tooltip,
  Image,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  InboxOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  fetchRoomListAPI,
  createRoomAPI,
  updateRoomAPI,
  deleteRoomAPI,
  fetchBuildingsAPI,
} from "../../api/room";

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

const AdminRoomManagePage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [form] = Form.useForm();

  const [photoFileList, setPhotoFileList] = useState([]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const loadRooms = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const params = { page, size };
      if (selectedBuilding) {
        params.building = selectedBuilding;
      }
      const response = await fetchRoomListAPI(params);
      const list = response.list || [];
      const total = response.total || 0;
      setRooms(list);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: total,
      }));
    } catch (error) {
      message.error(error.response?.data?.message || "加载会议室列表失败");
    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const response = await fetchBuildingsAPI();
      setBuildings(response || []);
    } catch (error) {
      console.error("加载楼栋列表失败", error);
    }
  };

  useEffect(() => {
    loadBuildings();
    loadRooms(1, 10);
  }, []);

  useEffect(() => {
    loadRooms(1, 10);
  }, [selectedBuilding]);

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentRoomId(null);
    form.resetFields();
    setPhotoFileList([]);
  };

  const handleFormSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("roomName", values.roomName || "");
      formData.append("roomNumber", values.roomNumber || "");
      formData.append("building", values.building || "");
      formData.append("description", values.description || "");
      const capacity =
        values.capacity !== undefined &&
        values.capacity !== null &&
        values.capacity !== ""
          ? String(values.capacity)
          : "0";
      const area =
        values.area !== undefined && values.area !== null && values.area !== ""
          ? String(values.area)
          : "0";
      formData.append("capacity", capacity);
      formData.append("area", area);
      if (photoFileList && photoFileList.length > 0) {
        const file = photoFileList[0];
        const fileObj = file.originFileObj || file;
        if (fileObj instanceof File) {
          formData.append("photoFile", fileObj);
        }
      }
      if (isEditing) {
        formData.append("roomId", currentRoomId);
        formData.append("isAvailable", values.isAvailable);
        if (!photoFileList.length && values.photoUrl) {
          formData.append("photoUrl", values.photoUrl);
        }
        await updateRoomAPI(currentRoomId, formData);
        message.success(`会议室 ${values.roomName} 更新成功!`);
      } else {
        const isAvailable =
          values.isAvailable !== undefined ? values.isAvailable : 1;
        formData.append("isAvailable", isAvailable);
        await createRoomAPI(formData);
        message.success(`会议室 ${values.roomName} 创建成功!`);
      }
      handleModalCancel();
      loadRooms(pagination.current, pagination.pageSize);
      loadBuildings();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(
        error.response?.data?.message ||
          `操作失败: ${isEditing ? "更新" : "新增"}会议室失败`
      );
    }
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setCurrentRoomId(record.roomId);
    form.setFieldsValue(record);
    setPhotoFileList([]);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setIsEditing(false);
    form.resetFields();
    setPhotoFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId) => {
    try {
      await deleteRoomAPI(roomId);
      message.success(`会议室 ID ${roomId} 删除成功!`);
      loadRooms(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || "删除操作失败");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRoom(record);
    setIsDetailModalOpen(true);
  };

  const primaryButtonStyle = {
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    border: "none",
    boxShadow: "0 2px 4px rgba(74, 144, 226, 0.3)",
    color: "white",
  };

  const columns = [
    {
      title: "会议室ID",
      dataIndex: "roomId",
      key: "id",
      width: 80,
      align: "center",
    },
    { title: "房间名", dataIndex: "roomName", key: "name", width: 150 },
    { title: "房间号", dataIndex: "roomNumber", key: "number", width: 100 },
    { title: "所属楼栋", dataIndex: "building", key: "building", width: 120 },
    {
      title: "容纳人数",
      dataIndex: "capacity",
      key: "capacity",
      width: 100,
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "isAvailable",
      key: "isAvailable",
      width: 100,
      align: "center",
      render: (available) => (
        <Tag
          color={available === 1 ? "green" : "volcano"}
          style={{ borderRadius: "4px" }}
        >
          {available === 1 ? "可用" : "维护中"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      align: "center",
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
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#faad14" }}
            >
              编辑
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定删除该会议室吗?"
              description="注意：如果有相关预约记录，删除操作将被拒绝"
              onConfirm={() => handleDelete(record.roomId)}
              okText="确认"
              cancelText="取消"
              placement="topRight"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getUploadProps = (fileList, setFileList) => ({
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
    listType: "picture",
  });

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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}
            >
              所属楼栋:
            </span>
            <Select
              placeholder="全部楼栋"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setSelectedBuilding(value)}
              value={selectedBuilding}
            >
              {buildings.map((b) => (
                <Option key={b} value={b}>
                  {b}
                </Option>
              ))}
            </Select>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadBuildings();
                if (selectedBuilding) {
                  setSelectedBuilding(null);
                } else {
                  loadRooms(1, 10);
                }
              }}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={primaryButtonStyle}
            >
              新增会议室
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="roomId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 个会议室`,
            position: ["bottomRight"],
            showSizeChanger: false,
            onChange: (page, pageSize) => loadRooms(page, pageSize),
          }}
          scroll={{ y: 500 }}
          style={{ minHeight: "580px" }}
        />
      </Card>

      {/* 编辑/新增 Modal */}
      <Modal
        title={isEditing ? "编辑会议室" : "新增会议室"}
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ isAvailable: 1 }}
        >
          <Form.Item
            label="房间名"
            name="roomName"
            rules={[{ required: true, message: "请输入会议室名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="房间号"
            name="roomNumber"
            rules={[{ required: true, message: "请输入房间号" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="所属楼栋"
            name="building"
            rules={[{ required: true, message: "请输入所属楼栋" }]}
          >
            <Input />
          </Form.Item>
          <Space style={{ display: "flex", width: "100%" }} align="start">
            <Form.Item
              label="容纳人数"
              name="capacity"
              rules={[{ required: true, message: "请输入容纳人数" }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="面积 (㎡)"
              name="area"
              rules={[{ required: true, message: "请输入面积" }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} step={0.1} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item
            label="状态 (1-可用 0-维护中)"
            name="isAvailable"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={1}
              placeholder="1: 可用, 0: 维护中"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="描述说明" name="description">
            <TextArea rows={2} />
          </Form.Item>

          {isEditing && (
            <>
              <Form.Item label="会议室图片" name="photoUrl">
                <div style={{ marginBottom: 8 }}>
                  {form.getFieldValue("photoUrl") && (
                    <Image src={form.getFieldValue("photoUrl")} width={100} />
                  )}
                </div>
                <Dragger
                  {...getUploadProps(photoFileList, setPhotoFileList)}
                  style={{
                    background: "#fafafa",
                    border: "1px dashed #d9d9d9",
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: "#4096ff" }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: "#666" }}>
                    点击或拖拽上传新图片以替换
                  </p>
                </Dragger>
              </Form.Item>
            </>
          )}

          {!isEditing && (
            <>
              <Form.Item label="会议室图片">
                <Dragger
                  {...getUploadProps(photoFileList, setPhotoFileList)}
                  style={{
                    background: "#fafafa",
                    border: "1px dashed #d9d9d9",
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: "#4096ff" }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: "#666" }}>
                    点击上传会议室图片
                  </p>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    上传图片
                  </Button>
                </Dragger>
              </Form.Item>
            </>
          )}

          <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={handleModalCancel}>取消</Button>
              <Button type="primary" htmlType="submit">
                {isEditing ? "保存修改" : "立即创建"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情 Modal */}
      <Modal
        title="会议室详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedRoom && (
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
            <Descriptions.Item label="会议室ID">
              {selectedRoom.roomId}
            </Descriptions.Item>
            <Descriptions.Item label="房间名">
              {selectedRoom.roomName}
            </Descriptions.Item>
            <Descriptions.Item label="房间号">
              {selectedRoom.roomNumber}
            </Descriptions.Item>
            <Descriptions.Item label="所属楼栋">
              {selectedRoom.building}
            </Descriptions.Item>
            <Descriptions.Item label="容纳人数">
              {selectedRoom.capacity} 人
            </Descriptions.Item>
            <Descriptions.Item label="面积">
              {selectedRoom.area} ㎡
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={selectedRoom.isAvailable === 1 ? "green" : "volcano"}>
                {selectedRoom.isAvailable === 1 ? "可用" : "维护中"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述说明">
              {selectedRoom.description || "暂无描述"}
            </Descriptions.Item>
            <Descriptions.Item label="会议室图片">
              {selectedRoom.photoUrl ? (
                <Image
                  width={200}
                  src={selectedRoom.photoUrl}
                  alt="会议室图片"
                  fallback="https://via.placeholder.com/200x150?text=No+Image"
                />
              ) : (
                <span style={{ color: "#999" }}>暂无图片</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminRoomManagePage;

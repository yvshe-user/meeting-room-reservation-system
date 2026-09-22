/**
 * @file src/pages/admin/AdminHelpPage.jsx
 * @brief 管理员帮助中心页面
 * @date 2025-12-12
 */

import React from "react";
import { Card, Collapse, Typography } from "antd";
import {
  DashboardOutlined,
  AppstoreAddOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const AdminHelpPage = () => {
  const paragraphStyle = {
    lineHeight: "1.8",
    marginBottom: 0,
    fontSize: "16px",
  };
  const listStyle = {
    marginTop: "12px",
    paddingLeft: "20px",
    fontSize: "16px",
  };
  const listItemStyle = { marginBottom: "8px" };

  const items = [
    {
      key: "1",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <DashboardOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          系统概览与仪表盘
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          登录系统后，您将直接进入【仪表盘】页面，这里汇集了系统的核心数据指标，包括：
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Text strong>会议室总数</Text>：系统中已注册的会议室总量
            </li>
            <li style={listItemStyle}>
              <Text strong>待审批预约数</Text>：当前需要您处理的预约申请数量
            </li>
            <li style={listItemStyle}>
              <Text strong>今日预约数</Text>：当天的预约申请总数
            </li>
          </ul>
          此外，您还可以快速通过和驳回最近的预约申请；查看最近一周的预约趋势图表，帮助您了解系统的使用高峰期！
        </Paragraph>
      ),
    },
    {
      key: "2",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <AppstoreAddOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          会议室资源管理
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          在【会议室管理】页面，您可以对会议室资源进行全生命周期管理：
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Text strong>新增会议室</Text>
              ：点击“新增会议室”按钮，填写房间名、房间号、所属楼栋、容纳人数、面积等信息，并上传会议室图片
            </li>
            <li style={listItemStyle}>
              <Text strong>编辑信息</Text>
              ：点击列表中的“编辑”按钮，可随时更新会议室的描述、状态（可用/维护中）和图片等信息
            </li>
            <li style={listItemStyle}>
              <Text strong>删除会议室</Text>
              ：对于不再使用的会议室，可进行删除操作（请注意：删除前请确保该会议室无未完成的预约）
            </li>
            <li style={listItemStyle}>
              <Text strong>筛选与查询</Text>
              ：支持按楼栋筛选会议室，刷新列表可获取最新数据
            </li>
          </ul>
        </Paragraph>
      ),
    },
    {
      key: "3",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <CheckSquareOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          预约审批与管理
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          这是管理员的核心工作之一，在【审批预约】页面进行：
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Text strong>状态筛选</Text>
              ：通过顶部的筛选栏，您可以快速查看“待审批”、“已批准”、“已驳回”、“已取消”、“已完成”五种状态的记录
            </li>
            <li style={listItemStyle}>
              <Text strong>日期查询</Text>
              ：选择特定日期，查看当天的所有预约记录，便于安排调度
            </li>
            <li style={listItemStyle}>
              <Text strong>查看详情</Text>
              ：点击“详情”可查看完整的预约信息，包括申请人联系方式、会议主题等
            </li>
            <li style={listItemStyle}>
              <Text strong>审批流程</Text>
              ：用户的预约申请默认为“待审批”状态；您可以点击“批准”或“驳回”；驳回时必须填写驳回理由
            </li>
          </ul>
        </Paragraph>
      ),
    },
    {
      key: "4",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <CalendarOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          周视图日程监控
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          在【周视图】页面，您可以直观地查看会议室的周程安排：
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Text strong>视图切换</Text>
              ：支持“按时间查看”和“按会议室查看”两种模式
            </li>
            <li style={listItemStyle}>
              <Text strong>状态标识</Text>
              ：不同颜色的色块代表不同的预约状态（黄色-待审批，绿色-已通过，蓝色-已完成），一目了然
            </li>
            <li style={listItemStyle}>
              <Text strong>快速详情</Text>
              ：鼠标悬停在日程色块上，即可浮层显示该预约的详细信息（申请人、主题、人数等）
            </li>
            <li style={listItemStyle}>
              <Text strong>日期导航</Text>
              ：支持按周切换日期，方便查看历史记录或未来安排
            </li>
          </ul>
        </Paragraph>
      ),
    },
    {
      key: "5",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <SafetyCertificateOutlined
            style={{ marginRight: 8, color: "#4A90E2" }}
          />
          账号安全与维护
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          为了保障系统安全，建议您：
          <ul style={listStyle}>
            <li style={listItemStyle}>
              点击【右上角头像】，定期在“安全中心”修改登录密码
            </li>
            <li style={listItemStyle}>
              妥善保管管理员账号，不要将账号借予他人使用
            </li>
            <li style={listItemStyle}>如发现异常预约数据，及时进行核查处理</li>
          </ul>
        </Paragraph>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <Title level={2} style={{ marginBottom: "12px", color: "#333" }}>
          管理员帮助中心
        </Title>
        <Paragraph
          style={{ fontSize: "16px", color: "#666", maxWidth: "800px" }}
        >
          欢迎使用会议室预约管理系统！本指南将帮助您快速掌握后台管理功能，高效处理预约申请与资源配置：
        </Paragraph>
      </div>

      <Card
        title={
          <span>
            <QuestionCircleOutlined
              style={{ marginRight: 8, color: "#4A90E2" }}
            />
            操作指南
          </span>
        }
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        }}
      >
        <Collapse
          defaultActiveKey={["1"]}
          ghost
          items={items}
          expandIconPosition="end"
        />
      </Card>
    </div>
  );
};

export default AdminHelpPage;

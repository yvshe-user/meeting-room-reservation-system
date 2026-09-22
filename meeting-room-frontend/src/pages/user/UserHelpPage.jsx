/**
 * @file src/pages/user/UserHelpPage.jsx
 * @brief 用户帮助中心页面
 * @date 2025-12-12
 */

import React from "react";
import { Card, Collapse, Typography, Steps } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const UserHelpPage = () => {
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
          <UserOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          账号注册与登录
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Text strong>注册账号</Text>
              ：首次使用需点击【登录页面】的“注册”链接，填写用户名、密码及手机号完成注册
            </li>
            <li style={listItemStyle}>
              <Text strong>登录系统</Text>：使用注册时的用户名和密码登录
            </li>
            <li style={listItemStyle}>
              <Text strong>个人信息</Text>
              ：登录后点击【右上角头像】，在“个人资料”中可修改用户名和手机号，在“安全中心”中可修改密码
            </li>
          </ul>
        </Paragraph>
      ),
    },
    {
      key: "2",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <SearchOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          查询与预约会议室
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          <Steps
            direction="vertical"
            size="small"
            current={-1}
            items={[
              {
                title: (
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    查找会议室
                  </span>
                ),
                description: (
                  <span style={{ fontSize: "15px", color: "#000" }}>
                    在【快速预约】页面通过选择日期、时间段、容纳人数或楼栋进行筛选，系统将为您推荐可用的会议室
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    查看详情
                  </span>
                ),
                description: (
                  <span style={{ fontSize: "15px", color: "#000" }}>
                    点击会议室卡片，可查看会议室的详细设施、图片及具体位置信息
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    提交申请
                  </span>
                ),
                description: (
                  <div style={{ fontSize: "15px", color: "#000" }}>
                    <p style={{ marginBottom: "8px" }}>
                      点击“预约此会议室”，填写预约时间段、会议主题、参会人数等信息，确认时间无误后提交
                    </p>
                    <p
                      style={{
                        marginBottom: 0,
                        padding: "8px 12px",
                        background: "#e6f7ff",
                        border: "1px solid #91d5ff",
                        borderRadius: "4px",
                        color: "#000",
                        fontSize: "14px",
                      }}
                    >
                      注意：会议室的时间段以一个小时为基本单位，用户可以选择同一天的若干连续小时进行预约，预约时间范围是
                      8:00 ~ 22:00
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </Paragraph>
      ),
    },
    {
      key: "3",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <HistoryOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          预约状态与管理
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          提交预约后，您可以在【预约记录】页面追踪申请进度：
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Text strong>待审批</Text>
              ：您的申请已提交，正在等待管理员审核
            </li>
            <li style={listItemStyle}>
              <Text strong>已批准</Text>
              ：管理员已同意您的申请，请按时使用会议室
            </li>
            <li style={listItemStyle}>
              <Text strong>已驳回</Text>
              ：申请未通过，您可以查看驳回理由并重新调整计划
            </li>
            <li style={listItemStyle}>
              <Text strong>已取消</Text>：您主动取消了该次预约
            </li>
            <li style={listItemStyle}>
              <Text strong>已完成</Text>
              ：您已确认使用预约申请的会议室
            </li>
          </ul>
          您可以在召开会议时间前后，登录系统进入【确认使用】页面或直接【扫描会议室二维码】进行确认使用！
        </Paragraph>
      ),
    },
    {
      key: "4",
      label: (
        <span style={{ fontSize: "16px", fontWeight: 500 }}>
          <SolutionOutlined style={{ marginRight: 8, color: "#4A90E2" }} />
          使用规范
        </span>
      ),
      children: (
        <Paragraph style={paragraphStyle}>
          为了维护良好的办公环境，请遵守以下规则：
          <ul style={listStyle}>
            <li style={listItemStyle}>请务必填写真实的会议主题和参会人数</li>
            <li style={listItemStyle}>
              如行程变更，请尽早取消预约，以免浪费资源
            </li>
            <li style={listItemStyle}>
              使用结束后请整理桌椅，带走垃圾，保持环境整洁
            </li>
          </ul>
        </Paragraph>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <Title level={2} style={{ marginBottom: "12px", color: "#333" }}>
          用户帮助中心
        </Title>
        <Paragraph
          style={{ fontSize: "16px", color: "#666", maxWidth: "800px" }}
        >
          欢迎使用会议室预约管理系统！本指南将助您快速完成会议室的查找与预定：
        </Paragraph>
      </div>

      <Card
        title={
          <span>
            <QuestionCircleOutlined
              style={{ marginRight: 8, color: "#4A90E2" }}
            />
            使用指南
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

export default UserHelpPage;

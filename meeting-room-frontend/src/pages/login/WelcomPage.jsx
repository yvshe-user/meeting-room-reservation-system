/**
 * @file src/pages/login/WelcomePage.jsx
 * @brief 欢迎页面
 * @date 2025-12-8
 */

import React, { useEffect, useState } from "react";
import { Button, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import welcome_pic from "../../assets/welcome_pic.png";

const { Title, Paragraph } = Typography;

const WelcomePage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const features = [
    {
      icon: <CalendarOutlined style={{ fontSize: 32, color: "#4A90E2" }} />,
      title: "智能预约",
      desc: "可视化选择，快速预约",
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
      title: "安全审批",
      desc: "多级审批，透明管理",
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: "#faad14" }} />,
      title: "高效调度",
      desc: "实时监控，智能分配",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: "#357ABD" }} />,
      title: "团队协作",
      desc: "多人共享，协同办公",
    },
  ];

  // 鼠标移动视差效果
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: `url(${welcome_pic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 黑色半透明遮罩层 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s ease",
        }}
      />

      {/* 浮动装饰元素 */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: "transform 0.3s ease-out",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          transform: `translate(${-mousePosition.x * 0.5}px, ${
            -mousePosition.y * 0.5
          }px)`,
          transition: "transform 0.3s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* 顶部导航栏 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          padding: "20px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(20px) saturate(180%)",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: "24px",
            fontWeight: "600",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => navigate("/")}
        >
          <CalendarOutlined style={{ fontSize: 28 }} />
          <span>meeting_room_booking.com</span>
        </div>
        <Space size="middle">
          <Button
            size="large"
            onClick={() => navigate("/login")}
            style={{
              borderColor: "rgba(255, 255, 255, 0.6)",
              color: "#fff",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              fontWeight: 500,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            ghost
          >
            登录
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/register")}
            style={{
              fontWeight: 500,
              background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
              border: "none",
              boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(74, 144, 226, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(74, 144, 226, 0.4)";
            }}
          >
            立即注册
          </Button>
        </Space>
      </div>

      {/* 主要内容区 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "60px",
          transform: "translateY(-50%)",
          color: "#fff",
          zIndex: 10,
          maxWidth: "700px",
        }}
      >
        <div
          style={{
            animation: "fadeInUp 1s ease-out",
          }}
        >
          <Title
            level={1}
            style={{
              fontSize: "68px",
              margin: 0,
              fontWeight: "700",
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "20px",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              animation: "fadeInUp 1s ease-out",
            }}
          >
            会议室预约管理平台
          </Title>

          <Paragraph
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.95)",
              marginBottom: "40px",
              lineHeight: 1.8,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              animation: "fadeInUp 1.2s ease-out",
            }}
          >
            为企业提供高效、透明、便捷的会议资源调度服务
            <br />
            让会议管理更简单，让办公效率更高效
          </Paragraph>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/register")}
            style={{
              height: "50px",
              fontSize: "18px",
              padding: "0 40px",
              background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
              border: "none",
              borderRadius: "25px",
              fontWeight: 500,
              boxShadow: "0 4px 15px rgba(74, 144, 226, 0.5)",
              animation: "fadeInUp 1.4s ease-out",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(74, 144, 226, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(74, 144, 226, 0.5)";
            }}
          >
            开始使用
          </Button>
        </div>
      </div>

      {/* 底部特性卡片 */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "60px",
          zIndex: 10,
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          maxWidth: "600px",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px) saturate(180%)",
              padding: "24px",
              borderRadius: "16px",
              width: "280px",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              animation: `fadeInUp ${1 + index * 0.2}s ease-out`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                transition: "transform 0.3s ease",
              }}
            >
              {feature.icon}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              {feature.title}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
                lineHeight: 1.6,
              }}
            >
              {feature.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 返回顶部按钮 */}
      {showScrollTop && (
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          size="large"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "40px",
            left: "40px",
            zIndex: 1000,
            width: "50px",
            height: "50px",
            background: "rgba(74, 144, 226, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)",
            animation: "fadeIn 0.3s ease-out",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(74, 144, 226, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 15px rgba(74, 144, 226, 0.4)";
          }}
        />
      )}

      {/* CSS 动画 */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;

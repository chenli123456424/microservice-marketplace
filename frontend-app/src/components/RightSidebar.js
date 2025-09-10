import React, { useState, useEffect } from 'react';

const RightSidebar = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // 当页面滚动超过一半时显示回顶部按钮
      if (scrollTop > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回到顶部的点击处理
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="right-sidebar-container">
      <style>
        {`
          /* 右侧边栏容器样式 */
          .right-sidebar-container {
            position: fixed; /* 固定定位 */
            right: 20px; /* 距离右侧20px */
            top: 200px; /* 距离顶部200px */
            z-index: 1000; /* 层级为1000 */
            display: flex; /* 弹性布局 */
            flex-direction: column; /* 垂直排列 */
            gap: 8px; /* 子元素间距8px */
            transition: all 0.3s ease; /* 所有属性0.3秒缓动过渡 */
          }
          
          /* 侧边栏按钮通用样式 */
          .sidebar-button {
            width: 90px; /* 宽度90px */
            height: 90px; /* 高度90px */
            background-color: #fff; /* 背景白色 */
            border: 1px solid #e5e5e5; /* 1px浅灰边框 */
            border-radius: 4px; /* 4px圆角 */
            display: flex; /* 弹性布局 */
            flex-direction: column; /* 垂直排列 */
            align-items: center; /* 水平居中 */
            justify-content: center; /* 垂直居中 */
            cursor: pointer; /* 鼠标指针样式 */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 阴影效果 */
            transition: all 0.3s ease; /* 所有属性0.3秒缓动过渡 */
            padding: 4px; /* 内边距4px */
          }
          
          /* 按钮悬停效果 */
          .sidebar-button:hover {
            transform: translateY(-3px); /* 向上移动3px */
            box-shadow: 0 4px 8px rgba(0,0,0,0.15); /* 阴影加深 */
          }
          
          /* 按钮图标样式 */
          .button-icon {
            font-size: 40px; /* 图标字体大小40px */
            color: #666; /* 图标颜色 */
          }
          
          /* 按钮文字样式 */
          .button-text {
            font-size: 18px; /* 文字大小18px */
            color: #666; /* 文字颜色 */
            margin-top: 2px; /* 上边距2px */
          }
          
          /* 回顶部按钮容器样式 */
          .back-to-top-container {
            width: 90px; /* 宽度90px */
            height: 90px; /* 高度90px */
            background-color: #fff; /* 背景白色 */
            border: 1px solid #e5e5e5; /* 1px浅灰边框 */
            border-radius: 4px; /* 4px圆角 */
            display: flex; /* 弹性布局 */
            flex-direction: column; /* 垂直排列 */
            align-items: center; /* 水平居中 */
            justify-content: center; /* 垂直居中 */
            cursor: pointer; /* 鼠标指针样式 */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 阴影效果 */
            transition: all 0.3s ease; /* 所有属性0.3秒缓动过渡 */
            opacity: 1; /* 不透明度1 */
            transform: translateY(0); /* Y轴不偏移 */
            padding: 4px; /* 内边距4px */
          }
          
          /* 回顶部按钮悬停效果 */
          .back-to-top-container:hover {
            transform: translateY(-3px); /* 向上移动3px */
            box-shadow: 0 4px 8px rgba(0,0,0,0.15); /* 阴影加深 */
          }
        `}
      </style>
      
      {/* 手机APP */}
      <button
        className="sidebar-button"
        onClick={() => alert('打开手机APP')}
      >
        <div className="button-icon">
          📱
        </div>
        <div className="button-text">
          手机APP
        </div>
      </button>

      {/* 个人中心 */}
      <button
        className="sidebar-button"
        onClick={() => alert('跳转到个人中心')}
      >
        <div className="button-icon">
          👤
        </div>
        <div className="button-text">
          个人中心
        </div>
      </button>

      {/* 售后服务 */}
      <button
        className="sidebar-button"
        onClick={() => alert('联系售后服务')}
      >
        <div className="button-icon">
          🔍
        </div>
        <div className="button-text">
          售后服务
        </div>
      </button>

      {/* 人工客服 */}
      <button
        className="sidebar-button"
        onClick={() => alert('联系人工客服')}
      >
        <div className="button-icon">
          📞
        </div>
        <div className="button-text">
          人工客服
        </div>
      </button>

      {/* 购物车 */}
      <button
        className="sidebar-button"
        onClick={() => alert('查看购物车')}
      >
        <div className="button-icon">
          🛒
        </div>
        <div className="button-text">
          购物车
        </div>
      </button>

      {/* 回顶部按钮 - 只在页面滚动超过一半时显示 */}
      {showBackToTop && (
        <button
          className="back-to-top-container"
          onClick={scrollToTop}
        >
          <div className="button-icon">
            ↑
          </div>
          <div className="button-text">
            回顶部
          </div>
        </button>
      )}
    </div>
  );
};

export default RightSidebar;

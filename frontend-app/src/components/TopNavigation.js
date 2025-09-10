import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TopNavigation() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
    
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="top-navigation-header">
            <style>
                {`
                /* 顶部导航栏容器样式 */
                .top-navigation-header {
                    background-color: #c57237; /* 背景颜色 */
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* 阴影效果 */
                    position: sticky; /* 粘性定位 */
                    top: 0; /* 距离顶部距离 */
                    z-index: 1000; /* 层级 */
                    border-bottom: 1px solid #e5e5e5; /* 底部边框 */
                }
                
                /* 顶部导航栏内容容器 */
                .top-navigation-container {
                    display: flex; /* 弹性布局 */
                    align-items: center; /* 垂直居中对齐 */
                    padding: 0 250px; /* 左右内边距 */
                    height: 60px; /* 高度 */
                    justify-content: space-between; /* 两端对齐 */
                }
                
                /* Logo链接样式 */
                .logo-link {
                    text-decoration: none; /* 去除下划线 */
                }
                
                /* Logo图片样式 */
                .logo-image {
                    height: 45px; /* 高度 */
                    width: auto; /* 自动宽度 */
                }
                
                /* 主导航菜单容器 */
                .main-nav {
                    display: flex; /* 弹性布局 */
                    align-items: center; /* 垂直居中对齐 */
                    flex-grow: 1; /* 占据剩余空间 */
                }
                
                /* 品牌名称样式 */
                .brand-name {
                    font-weight: bold; /* 粗体 */
                    color: #ffffff; /* 文字颜色 */
                    font-size: 20px; /* 字体大小 */
                    margin-right: 30px; /* 右外边距 */
                    font-family: Arial, sans-serif; /* 字体族 */
                }
                
                /* 导航链接样式 */
                .dh-nav-link {
                    text-decoration: none; /* 去除下划线 */
                    color: #ffffff; /* 文字颜色 */
                    margin: 0 15px; /* 左右外边距 */
                    font-weight: normal; /* 正常字重 */
                    font-size: 16px; /* 字体大小 */
                    line-height: 1.5; /* 行高 */
                    transition: color 0.3s ease; /* 颜色过渡效果 */
                }
                
                /* 导航链接悬停效果 */
                .dh-nav-link:hover {
                    color: #e68b40; /* 悬停时文字颜色改为橙色 */
                }
                
                /* 右侧功能区域容器 */
                .right-section {
                    display: flex; /* 弹性布局 */
                    align-items: center; /* 垂直居中对齐 */
                }
                
                /* 搜索框容器 */
                .search-container {
                    position: relative; /* 相对定位 */
                    margin-right: 20px; /* 右外边距 */
                }
                
                /* 搜索输入框样式 */
                .search-input {
                    padding: 8px 15px; /* 内边距 */
                    width: 250px; /* 宽度 */
                    border: 1px solid #ddd; /* 边框 */
                    border-radius: 20px; /* 圆角 */
                    font-size: 14px; /* 字体大小 */
                    outline: none; /* 去除焦点轮廓 */
                    transition: border-color 0.3s ease; /* 边框颜色过渡效果 */
                }
                
                /* 搜索按钮样式 */
                .search-button {
                    position: absolute; /* 绝对定位 */
                    right: 5px; /* 距离右侧距离 */
                    top: 50%; /* 距离顶部距离 */
                    transform: translateY(-50%); /* 垂直居中 */
                    background: none; /* 无背景 */
                    border: none; /* 无边框 */
                    cursor: pointer; /* 鼠标指针样式 */
                    font-size: 16px; /* 字体大小 */
                    color: #999; /* 文字颜色 */
                }
                
                /* 用户菜单容器 */
                .user-menu-container {
                    position: relative; /* 相对定位 */
                    margin-right: 20px; /* 右外边距 */
                }
                
                /* 菜单按钮样式 */
                .menu-button {
                    background: none; /* 无背景 */
                    border: none; /* 无边框 */
                    cursor: pointer; /* 鼠标指针样式 */
                    font-size: 20px; /* 字体大小 */
                    color: #333; /* 文字颜色 */
                    position: relative; /* 相对定位 */
                }
                
                /* 下拉菜单样式 */
                .dropdown-menu {
                    position: absolute; /* 绝对定位 */
                    top: 100%; /* 距离顶部距离 */
                    right: 0; /* 距离右侧距离 */
                    background-color: #fff; /* 背景颜色 */
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* 阴影效果 */
                    min-width: 150px; /* 最小宽度 */
                    z-index: 1001; /* 层级 */
                    border: 1px solid #e5e5e5; /* 边框 */
                }
                
                /* 下拉菜单链接样式 */
                .dropdown-link {
                    display: block; /* 块级元素 */
                    padding: 10px 20px; /* 内边距 */
                    text-decoration: none; /* 去除下划线 */
                    color: #333; /* 文字颜色 */
                    border-bottom: 1px solid #eee; /* 底部边框 */
                }
                
                /* 最后一个下拉菜单链接 */
                .dropdown-link:last-child {
                    border-bottom: none; /* 无底部边框 */
                }
                
                /* 登录链接样式 */
                .auth-link {
                    text-decoration: none; /* 去除下划线 */
                    color: #ffffff; /* 文字颜色 */
                    font-weight: normal; /* 正常字重 */
                    font-size: 14px; /* 字体大小 */
                    margin-right: 20px; /* 右外边距 */
                }
                
                /* 购物车容器 */
                .cart-container {
                    position: relative; /* 相对定位 */
                    margin-right: 20px; /* 右外边距 */
                }
                
                /* 通知徽章样式 */
                .notification-badge {
                    position: absolute; /* 绝对定位 */
                    top: -5px; /* 距离顶部距离 */
                    right: -5px; /* 距离右侧距离 */
                    background-color: red; /* 背景颜色 */
                    color: white; /* 文字颜色 */
                    border-radius: 50%; /* 圆角（圆形） */
                    font-size: 12px; /* 字体大小 */
                    width: 18px; /* 宽度 */
                    height: 18px; /* 高度 */
                    display: flex; /* 弹性布局 */
                    align-items: center; /* 垂直居中对齐 */
                    justify-content: center; /* 水平居中对齐 */
                    font-weight: bold; /* 粗体 */
                }
                
                /* 购物车下拉菜单样式 */
                .cart-dropdown {
                    position: absolute; /* 绝对定位 */
                    top: 100%; /* 距离顶部距离 */
                    right: 0; /* 距离右侧距离 */
                    background-color: #fff; /* 背景颜色 */
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* 阴影效果 */
                    min-width: 250px; /* 最小宽度 */
                    z-index: 1001; /* 层级 */
                    border: 1px solid #e5e5e5; /* 边框 */
                    padding: 15px; /* 内边距 */
                }
                
                /* 购物车头部样式 */
                .cart-header {
                    font-weight: bold; /* 粗体 */
                    margin-bottom: 10px; /* 下外边距 */
                }
                
                /* 购物车商品容器 */
                .cart-items {
                    max-height: 200px; /* 最大高度 */
                    overflow-y: auto; /* 垂直滚动条 */
                }
                
                /* 购物车商品项样式 */
                .cart-item {
                    display: flex; /* 弹性布局 */
                    margin-bottom: 10px; /* 下外边距 */
                    padding-bottom: 10px; /* 下内边距 */
                    border-bottom: 1px solid #eee; /* 底部边框 */
                }
                
                /* 购物车商品图片样式 */
                .cart-item-image {
                    width: 50px; /* 宽度 */
                    height: 50px; /* 高度 */
                    background-color: #f0f0f0; /* 背景颜色 */
                    margin-right: 10px; /* 右外边距 */
                }
                
                /* 购物车商品详情样式 */
                .cart-item-details {
                    font-size: 14px; /* 字体大小 */
                    color: #666; /* 文字颜色 */
                }
                
                /* 购物车按钮样式 */
                .cart-button {
                    display: block; /* 块级元素 */
                    text-align: center; /* 文本居中 */
                    padding: 8px; /* 内边距 */
                    background-color: #007bff; /* 背景颜色 */
                    color: white; /* 文字颜色 */
                    text-decoration: none; /* 去除下划线 */
                    border-radius: 4px; /* 圆角 */
                    margin-top: 10px; /* 上外边距 */
                }
                
                /* 通知容器样式 */
                .notification-container {
                    position: relative; /* 相对定位 */
                }
                
                /* 热门搜索容器样式 */
                .hot-search-container {
                    padding: 10px 250px; /* 内边距 */
                    height: 40px; /* 高度 */
                    background-color: #f8f9fa; /* 背景颜色 */
                    border-top: 1px solid #eee; /* 顶部边框 */
                    font-size: 15px; /* 字体大小 */
                }
                
                /* 热门搜索标签样式 */
                .hot-search-label {
                    color: #666; /* 文字颜色 */
                    margin-right: 10px; /* 右外边距 */
                }
                
                /* 热门搜索词样式 */
                .hot-search-term {
                    color: #007bff; /* 文字颜色 */
                    margin-right: 15px; /* 右外边距 */
                    cursor: pointer; /* 鼠标指针样式 */
                }
                `}
            </style>
            
            {/* 顶部导航栏 */}
            <div className="top-navigation-container">
                {/* Logo区域 */}
                <div>
                    <Link to="/" className="logo-link">
                        <img 
                            src="/images/logo.png"
                            alt="电商平台Logo" 
                            className="logo-image"
                        />
                    </Link>
                </div>

                {/* 主要导航菜单 */}
                <nav className="main-nav">
                    {/* 品牌名称 */}
                    <div className="brand-name">
                        筑家智选
                    </div>

                    {/* 其他导航项 */}
                    <Link to="/custom" className="dh-nav-link">
                        全屋定制
                    </Link>
                    <Link to="/designers" className="dh-nav-link">
                        设计师
                    </Link>
                    <Link to="/stores" className="dh-nav-link">
                        线下门店
                    </Link>
                    <Link to="/service" className="dh-nav-link">
                        服务中心
                    </Link>
                    <Link to="/community" className="dh-nav-link">
                        社区/灵感
                    </Link>
                </nav>

                {/* 右侧功能区域 */}
                <div className="right-section">
                    {/* 搜索框 */}
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="搜索商品、品牌、型号..."
                            className="search-input"
                        />
                        <button className="search-button">
                            🔍
                        </button>
                    </div>

                    {/* 个人中心或登录/注册 */}
                    {isAuthenticated ? (
                        <div 
                            className="user-menu-container"
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <button className="menu-button">
                                👤
                            </button>
                            
                            {isUserMenuOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/orders" className="dropdown-link">
                                        我的订单
                                    </Link>
                                    <Link to="/coupons" className="dropdown-link">
                                        我的优惠券
                                    </Link>
                                    <Link to="/profile" className="dropdown-link">
                                        个人信息
                                    </Link>
                                    <Link
                                        onClick={handleLogout}
                                        className="dropdown-link">
                                        登出
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth" className="auth-link">
                            登录 | 注册
                        </Link>
                    )}

                    {/* 购物车 */}
                    <div 
                        className="cart-container"
                        onMouseEnter={() => setIsCartMenuOpen(true)}
                        onMouseLeave={() => setIsCartMenuOpen(false)}
                    >
                        <button className="menu-button">
                            🛒
                            <span className="notification-badge">
                                3
                            </span>
                        </button>
                        
                        {isCartMenuOpen && (
                            <div className="cart-dropdown">
                                <div className="cart-header">
                                    购物车 (3)
                                </div>
                                <div className="cart-items">
                                    {/* 购物车商品示例 */}
                                    <div className="cart-item">
                                        <div className="cart-item-image"></div>
                                        <div>
                                            <div>商品名称</div>
                                            <div className="cart-item-details">
                                                数量: 1
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/cart" className="cart-button">
                                    查看购物车
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 消息通知 */}
                    <div className="notification-container">
                        <button className="menu-button">
                            🔔
                            <span className="notification-badge">
                                2
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 热门搜索词 */}
            <div className="hot-search-container">
                <span className="hot-search-label">
                    热门搜索:
                </span>
                <span className="hot-search-term">
                    沙发
                </span>
                <span className="hot-search-term">
                    床
                </span>
                <span className="hot-search-term">
                    瓷砖
                </span>
                <span className="hot-search-term">
                    灯具
                </span>
            </div>
        </header>
    );
}

export default TopNavigation;

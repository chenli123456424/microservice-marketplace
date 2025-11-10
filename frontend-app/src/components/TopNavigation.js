import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { calculateUnreadCount, markAnnouncementAsRead } from '../utils/notificationHelper';

function TopNavigation() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [categories, setCategories] = useState([]);
    const [hotSearchKeywords, setHotSearchKeywords] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [avatarVersion, setAvatarVersion] = useState(0); // 头像版本号，仅在URL变化时更新
    const [announcementCount, setAnnouncementCount] = useState(0); // 公告数量
    const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    
    const { isAuthenticated, logout, token, user, updateUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    // 获取分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/categories');
                const data = await response.json();
                if (data.code === 200 && data.data) {
                    setCategories(data.data);
                }
            } catch (error) {
                console.error('获取分类数据失败:', error);
            }
        };
        fetchCategories();
    }, []);

    // 获取热门搜索关键词的函数
    const fetchHotSearchKeywords = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/hot-search-keywords');
            if (response.data.code === 200 && response.data.data) {
                setHotSearchKeywords(response.data.data);
            }
        } catch (error) {
            console.error('获取热门搜索关键词失败:', error);
        }
    };

    // 获取热门搜索关键词
    useEffect(() => {
        fetchHotSearchKeywords();
    }, []);

    // 获取购物车数据
    const fetchCartItems = async () => {
        console.log('TopNavigation: 开始获取购物车数据，认证状态:', isAuthenticated, 'Token:', !!token);
        if (!isAuthenticated || !token) {
            console.log('TopNavigation: 用户未认证或token无效，清空购物车数据');
            setCartItems([]);
            return;
        }

        try {
            setCartLoading(true);
            console.log('TopNavigation: 调用购物车API');
            const response = await axios.get('http://localhost:8081/api/cart/items', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('TopNavigation: 购物车API响应:', response.data);
            if (response.data.code === 200) {
                setCartItems(response.data.data || []);
                console.log('TopNavigation: 购物车数据更新成功，商品数量:', (response.data.data || []).length);
            }
        } catch (error) {
            console.error('TopNavigation: 获取购物车数据失败:', error);
            setCartItems([]);
        } finally {
            setCartLoading(false);
        }
    };

    // 当用户登录状态或token变化时，重新获取购物车数据
    useEffect(() => {
        fetchCartItems();
    }, [isAuthenticated, token]);

    // 监听购物车数据变化事件
    useEffect(() => {
        const handleCartUpdate = () => {
            console.log('TopNavigation: 收到cartUpdated事件，开始刷新购物车数据');
            fetchCartItems();
        };

        // 监听自定义事件
        window.addEventListener('cartUpdated', handleCartUpdate);
        console.log('TopNavigation: 已注册cartUpdated事件监听器');
        
        // 清理事件监听器
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            console.log('TopNavigation: 已移除cartUpdated事件监听器');
        };
    }, []);

    // 检查公告是否在有效时间范围内（用于导航栏显示）
    // 导航栏应该显示所有已发布的公告（包括未开始的），但不包括已过期的
    const isAnnouncementValid = (announcement) => {
        if (!announcement) return false;
        
        // 必须已发布
        if (announcement.status !== 1) {
            return false;
        }
        
        // 检查结束时间（未过期或未设置）
        const now = new Date();
        if (announcement.endTime) {
            const endTime = new Date(announcement.endTime);
            if (now > endTime) {
                return false; // 已过期
            }
        }
        
        // 导航栏显示所有未过期的已发布公告（包括未开始的）
        // 这样用户可以在导航栏看到未来要推送的通知
        return true;
    };
    
    // 检查公告是否已开始（用于计算未读数量）
    // 只有已开始且未过期的通知才计入未读数量
    const isAnnouncementStarted = (announcement) => {
        if (!announcement) return false;
        if (announcement.status !== 1) return false;
        
        const now = new Date();
        
        // 检查开始时间（已开始或未设置）
        if (announcement.startTime) {
            const startTime = new Date(announcement.startTime);
            if (now < startTime) {
                return false; // 还未开始
            }
        }
        
        // 检查结束时间（未过期或未设置）
        if (announcement.endTime) {
            const endTime = new Date(announcement.endTime);
            if (now > endTime) {
                return false; // 已过期
            }
        }
        
        return true;
    };

    // 获取公告数据
    const fetchAnnouncements = async () => {
        try {
            console.log('[TopNavigation] 开始获取公告数据');
            const response = await axios.get('http://localhost:8081/api/announcement/active');
            if (response.data && response.data.code === 200 && response.data.data) {
                const activeAnnouncements = response.data.data || [];
                console.log('[TopNavigation] 后端返回公告数量:', activeAnnouncements.length);
                
                // 过滤掉已过期的公告（但保留未开始的）
                const validAnnouncements = activeAnnouncements.filter(isAnnouncementValid);
                console.log('[TopNavigation] 过滤后有效公告数量:', validAnnouncements.length);
                
                setAnnouncements(validAnnouncements);
                
                // 计算未读通知数量（只计算已开始且有效的未读通知）
                const startedAnnouncements = validAnnouncements.filter(isAnnouncementStarted);
                const unreadCount = calculateUnreadCount(startedAnnouncements);
                console.log('[TopNavigation] 已开始的通知数量:', startedAnnouncements.length);
                console.log('[TopNavigation] 未读通知数量:', unreadCount);
                setAnnouncementCount(unreadCount);
            } else {
                console.log('[TopNavigation] API返回数据格式错误');
                setAnnouncements([]);
                setAnnouncementCount(0);
            }
        } catch (error) {
            console.error('[TopNavigation] 获取公告失败:', error);
            setAnnouncements([]);
            setAnnouncementCount(0);
        }
    };

    // 初始加载公告
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // 监听公告更新事件（包括跨窗口通信）
    useEffect(() => {
        console.log('[TopNavigation] 注册公告更新事件监听器');
        
        // 监听当前窗口的 dataUpdated 事件
        const handleDataUpdated = (e) => {
            console.log('[TopNavigation] 收到dataUpdated事件:', e.detail);
            if (e.detail?.dataType === 'announcements') {
                console.log('[TopNavigation] 触发公告刷新');
                fetchAnnouncements();
            }
        };
        
        // 监听 localStorage 变化（用于跨窗口/标签页通信）
        const handleStorageChange = (e) => {
            if (e.key && e.key.startsWith('announcementUpdated_')) {
                try {
                    const data = JSON.parse(e.newValue || e.oldValue || '{}');
                    console.log('[TopNavigation] 收到localStorage通知:', data);
                    if (data.dataType === 'announcements') {
                        console.log('[TopNavigation] 从localStorage触发公告刷新');
                        fetchAnnouncements();
                    }
                } catch (err) {
                    console.error('[TopNavigation] 解析localStorage数据失败:', err);
                }
            }
        };

        // 监听通知已读事件
        const handleNotificationRead = (e) => {
            if (e.detail?.announcementId) {
                // 通知被标记为已读，重新计算未读数量
                fetchAnnouncements();
            }
        };

        window.addEventListener('dataUpdated', handleDataUpdated);
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('notificationRead', handleNotificationRead);

        return () => {
            window.removeEventListener('dataUpdated', handleDataUpdated);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('notificationRead', handleNotificationRead);
        };
    }, []);
    
    // 监听页面可见性变化，当用户切换回标签页时刷新公告
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('[TopNavigation] 页面变为可见，刷新公告');
                fetchAnnouncements();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
    
    // 定期刷新公告（每30秒，与通知弹窗同步）
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAnnouncements();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // 如果用户已登录，确保从后端获取最新的用户信息（包括avatar）
    useEffect(() => {
        if (isAuthenticated && token) {
            // 如果用户信息不存在，或者avatar字段缺失/为空，从后端获取最新信息
            const hasValidAvatar = user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '';
            const shouldRefresh = !user || !user.id || !hasValidAvatar;
            
            if (shouldRefresh) {
                console.log('TopNavigation: 刷新用户信息，当前avatar:', user?.avatar);
                axios.get('http://localhost:8081/api/user/current', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(response => {
                    if (response.data.code === 200 && response.data.data) {
                        const latestUser = response.data.data;
                        console.log('TopNavigation: 获取到最新用户信息，头像URL:', latestUser.avatar);
                        // 更新用户信息（无论头像是否存在，都更新以保持数据同步）
                        updateUser(latestUser);
                    }
                }).catch(error => {
                    console.error('TopNavigation: 获取用户信息失败:', error);
                });
            }
        }
    }, [isAuthenticated, token]); // 只在认证状态和token变化时检查，避免无限循环

    // 监听user.avatar变化，仅在URL真正变化时更新版本号
    useEffect(() => {
        // 检查头像是否存在且不为空字符串
        const hasAvatar = user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '';
        if (hasAvatar) {
            // 只在avatar URL变化时更新版本号，避免不必要的刷新
            setAvatarVersion(prev => {
                // 使用URL作为版本标识，只有URL变化时才增加版本号
                const currentAvatar = user.avatar;
                const storedAvatar = sessionStorage.getItem('lastAvatar');
                if (storedAvatar !== currentAvatar) {
                    sessionStorage.setItem('lastAvatar', currentAvatar);
                    return prev + 1;
                }
                return prev;
            });
        } else {
            // 如果头像被清空，也更新版本号以显示占位符
            const storedAvatar = sessionStorage.getItem('lastAvatar');
            if (storedAvatar) {
                sessionStorage.removeItem('lastAvatar');
                setAvatarVersion(prev => prev + 1);
            }
        }
    }, [user?.avatar]);

    // 处理搜索框点击
    const handleSearchClick = () => {
        setIsSearchDropdownOpen(true);
    };

    // 处理搜索框失焦
    const handleSearchBlur = () => {
        // 延迟关闭，让用户有时间点击下拉选项
        setTimeout(() => {
            setIsSearchDropdownOpen(false);
        }, 200);
    };

    // 处理搜索关键词点击
    const handleSearchKeywordClick = (categoryName, categoryId) => {
        setSearchValue(categoryName);
        setIsSearchDropdownOpen(false);
        // 跳转到对应的筛选分类页
        navigate(`/products?category=${encodeURIComponent(categoryName)}&mainId=${categoryId}`);
    };

    // 处理搜索提交
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            // 记录搜索关键词到Redis
            try {
                await axios.post('http://localhost:8081/api/search/record', null, {
                    params: { keyword: searchValue.trim() }
                });
                // 重新获取热门搜索关键词列表
                await fetchHotSearchKeywords();
            } catch (error) {
                console.error('记录搜索关键词失败:', error);
            }
            
            // 跳转到搜索结果页
            navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
        } else {
            // 如果搜索框为空，跳转到全部商品页面
            navigate('/products');
        }
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

                /* 搜索下拉框样式 */
                .search-dropdown {
                    position: absolute; /* 绝对定位 */
                    top: 100%; /* 距离顶部距离 */
                    left: 0; /* 距离左侧距离 */
                    right: 0; /* 距离右侧距离 */
                    background-color: #fff; /* 背景颜色 */
                    border: 1px solid #ddd; /* 边框 */
                    border-top: none; /* 无顶部边框 */
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* 阴影效果 */
                    z-index: 1001; /* 层级 */
                    max-height: 300px; /* 最大高度 */
                    overflow-y: auto; /* 垂直滚动条 */
                }

                /* 搜索建议项样式 */
                .search-suggestion {
                    padding: 12px 15px; /* 内边距 */
                    cursor: pointer; /* 鼠标指针样式 */
                    border-bottom: 1px solid #f0f0f0; /* 底部边框 */
                    transition: background-color 0.2s ease; /* 背景色过渡效果 */
                    font-size: 14px; /* 字体大小 */
                    color: #333; /* 文字颜色 */
                }

                /* 搜索建议项悬停效果 */
                .search-suggestion:hover {
                    background-color: #f8f9fa; /* 悬停时背景色 */
                }

                /* 最后一个搜索建议项 */
                .search-suggestion:last-child {
                    border-bottom: none; /* 无底部边框 */
                }

                /* 搜索建议项高亮 */
                .search-suggestion.highlighted {
                    background-color: #e3f2fd; /* 高亮背景色 */
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
                    display: flex; /* 弹性布局 */
                    align-items: center; /* 垂直居中 */
                    gap: 8px; /* 间距 */
                }

                /* 用户头像样式 */
                .user-avatar {
                    width: 32px; /* 宽度 */
                    height: 32px; /* 高度 */
                    border-radius: 50%; /* 圆形 */
                    object-fit: cover; /* 覆盖模式 */
                    border: 2px solid #fff; /* 白色边框 */
                }

                /* 用户名样式 */
                .username-text {
                    color: #ffffff; /* 白色文字 */
                    font-size: 14px; /* 字体大小 */
                    font-weight: normal; /* 正常字重 */
                    max-width: 100px; /* 最大宽度 */
                    overflow: hidden; /* 溢出隐藏 */
                    text-overflow: ellipsis; /* 省略号 */
                    white-space: nowrap; /* 不换行 */
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
                    display: inline-block; /* 内联块，与其他按钮在同一行 */
                    vertical-align: middle; /* 垂直居中对齐 */
                }
                
                /* 通知徽章样式 */
                .notification-badge {
                    position: absolute; /* 绝对定位 */
                    top: -2px; /* 距离顶部距离 */
                    right: -2px; /* 距离右侧距离 */
                    background-color: #ff4d4f; /* 背景颜色 */
                    color: white; /* 文字颜色 */
                    border-radius: 50%; /* 圆角（圆形） */
                    font-size: 10px; /* 字体大小 */
                    min-width: 14px; /* 最小宽度 */
                    height: 14px; /* 高度 */
                    display: flex; /* 弹性布局 */
                    align-items: center; /* 垂直居中对齐 */
                    justify-content: center; /* 水平居中对齐 */
                    font-weight: bold; /* 粗体 */
                    padding: 0 3px; /* 内边距，支持多位数 */
                    line-height: 1; /* 行高 */
                    box-sizing: border-box; /* 盒模型 */
                    border: 1.5px solid #ffffff; /* 白色边框 */
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
                
                /* 通知按钮样式 - 直接使用button，无外层div */
                .notification-button {
                    position: relative; /* 相对定位，用于下拉菜单定位 */
                }
                
                /* 通知下拉菜单样式 - 与购物车下拉菜单完全一致 */
                .notification-button .notification-dropdown {
                    position: absolute; /* 绝对定位 */
                    top: 100%; /* 距离顶部距离 */
                    right: 0; /* 距离右侧距离 */
                    background-color: #fff; /* 背景颜色 */
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* 阴影效果 */
                    min-width: 250px; /* 最小宽度 */
                    z-index: 1001; /* 层级 */
                    border: 1px solid #e5e5e5; /* 边框 */
                    padding: 15px; /* 内边距 */
                    margin-top: 5px; /* 与按钮的间距 */
                }
                
                /* 通知头部样式 - 与购物车头部完全一致 */
                .notification-header {
                    font-weight: bold; /* 粗体 */
                    margin-bottom: 10px; /* 下外边距 */
                }
                
                /* 通知项容器样式 - 与购物车商品容器完全一致 */
                .notification-items {
                    max-height: 200px; /* 最大高度 */
                    overflow-y: auto; /* 垂直滚动条 */
                }
                
                /* 通知项样式 - 与购物车商品项完全一致 */
                .notification-item {
                    display: flex; /* 弹性布局 */
                    margin-bottom: 10px; /* 下外边距 */
                    padding-bottom: 10px; /* 下内边距 */
                    border-bottom: 1px solid #eee; /* 底部边框 */
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
                    display: inline-block; /* 行内块元素 */
                    margin-bottom: 5px; /* 下外边距，支持换行 */
                    transition: color 0.2s ease; /* 颜色过渡效果 */
                }
                
                /* 热门搜索词悬停效果 */
                .hot-search-term:hover {
                    color: #0056b3; /* 悬停时颜色 */
                    text-decoration: underline; /* 下划线 */
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
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="搜索商品、品牌、型号..."
                                className="search-input"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onClick={handleSearchClick}
                                onBlur={handleSearchBlur}
                            />
                            <button type="submit" className="search-button">
                                🔍
                            </button>
                        </form>
                        
                        {/* 搜索建议下拉框 */}
                        {isSearchDropdownOpen && (
                            <div className="search-dropdown">
                                {categories.map((category) => (
                                    <div
                                        key={category.mainId}
                                        className="search-suggestion"
                                        onClick={() => handleSearchKeywordClick(category.name, category.mainId)}
                                    >
                                        {category.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 个人中心或登录/注册 */}
                    {isAuthenticated ? (
                        <div 
                            className="user-menu-container"
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <button className="menu-button">
                                {(() => {
                                    // 检查头像是否存在且不为空字符串
                                    const hasAvatar = user?.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '';
                                    
                                    if (hasAvatar) {
                                        // 构建头像URL
                                        let avatarUrl = user.avatar.trim();
                                        // 如果已经是完整URL，直接使用；否则添加前缀
                                        if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
                                            avatarUrl = `http://localhost:8081${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
                                        }
                                        // 添加版本号防止缓存
                                        avatarUrl = `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${avatarVersion}`;
                                        
                                        return (
                                            <img 
                                                key={`avatar-${user.avatar}-${avatarVersion}`}
                                                src={avatarUrl}
                                                alt="用户头像"
                                                className="user-avatar"
                                                onError={(e) => {
                                                    console.error('头像加载失败，URL:', avatarUrl, '原始值:', user.avatar);
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) {
                                                        e.target.nextSibling.style.display = 'block';
                                                    }
                                                }}
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                                {(!user?.avatar || typeof user?.avatar !== 'string' || user.avatar.trim() === '') && <span>👤</span>}
                                {user?.username && (
                                    <span className="username-text">{user.username}</span>
                                )}
                            </button>
                            
                            {isUserMenuOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/publish-post" className="dropdown-link">
                                        发布帖子
                                    </Link>
                                    <Link to="/orders" className="dropdown-link">
                                        我的订单
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
                        <button 
                            className="menu-button"
                            onClick={() => navigate('/cart')}
                        >
                            🛒
                            {cartItems.length > 0 && (
                                <span className="notification-badge">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                        
                        {isCartMenuOpen && (
                            <div className="cart-dropdown">
                                <div className="cart-header">
                                    购物车 ({cartItems.length})
                                </div>
                                <div className="cart-items">
                                    {cartLoading ? (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                                            加载中...
                                        </div>
                                    ) : cartItems.length > 0 ? (
                                        cartItems.slice(0, 3).map((item) => (
                                            <div key={item.id} className="cart-item">
                                                <div className="cart-item-image">
                                                    {item.thumbnailUrl && (
                                                        <img 
                                                            src={`http://localhost:8081${item.thumbnailUrl}`}
                                                            alt={item.productName}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ 
                                                        fontSize: '12px', 
                                                        fontWeight: 'bold',
                                                        marginBottom: '2px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '120px'
                                                    }}>
                                                        {item.productName}
                                                    </div>
                                                    <div className="cart-item-details" style={{ fontSize: '11px', color: '#666' }}>
                                                        数量: {item.quantity} | ¥{item.price}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                                            购物车是空的
                                        </div>
                                    )}
                                    {cartItems.length > 3 && (
                                        <div style={{ 
                                            padding: '5px 10px', 
                                            textAlign: 'center', 
                                            color: '#666', 
                                            fontSize: '12px',
                                            borderTop: '1px solid #eee'
                                        }}>
                                            还有 {cartItems.length - 3} 件商品...
                                        </div>
                                    )}
                                </div>
                                <Link to="/cart" className="cart-button">
                                    查看购物车
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 消息通知 - 直接使用button，无外层div */}
                    <button 
                        className="menu-button notification-button"
                        style={{
                            background: 'none',
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            marginLeft: '10px',
                            boxShadow: 'none',
                            outline: 'none',
                            position: 'relative',
                            display: 'inline-block',
                            verticalAlign: 'middle'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/notifications');
                        }}
                        onMouseEnter={() => setIsNotificationMenuOpen(true)}
                        onMouseLeave={() => setIsNotificationMenuOpen(false)}
                    >
                        🔔
                        {announcementCount > 0 && (
                            <span className="notification-badge">
                                {announcementCount > 99 ? '99+' : announcementCount}
                            </span>
                        )}
                        {isNotificationMenuOpen && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    通知中心 ({announcementCount})
                                </div>
                                <div className="notification-items">
                                    {announcements.length > 0 ? (
                                        announcements.slice(0, 5).map((announcement) => (
                                            <div 
                                                key={announcement.id} 
                                                className="notification-item"
                                                onClick={() => {
                                                    // 标记为已读
                                                    markAnnouncementAsRead(announcement.id);
                                                    // 直接跳转到通知详情页
                                                    navigate(`/notification/${announcement.id}`, {
                                                        state: { announcement }
                                                    });
                                                    setIsNotificationMenuOpen(false);
                                                }}
                                            >
                                                <div>
                                                    <div style={{ 
                                                        fontSize: '12px', 
                                                        fontWeight: 'bold',
                                                        marginBottom: '2px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '200px'
                                                    }}>
                                                        📢 {announcement.title}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                                        {announcement.createTime ? 
                                                            new Date(announcement.createTime).toLocaleDateString('zh-CN') 
                                                            : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                                            暂无公告
                                        </div>
                                    )}
                                    {announcements.length > 5 && (
                                        <div style={{ 
                                            padding: '5px 10px', 
                                            textAlign: 'center', 
                                            color: '#666', 
                                            fontSize: '12px',
                                            borderTop: '1px solid #eee'
                                        }}>
                                            还有 {announcements.length - 5} 条公告...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* 热门搜索词 */}
            {hotSearchKeywords.length > 0 && (
                <div className="hot-search-container">
                    <span className="hot-search-label">
                        热门搜索:
                    </span>
                    {hotSearchKeywords.map((keyword, index) => (
                        <span 
                            key={index}
                            className="hot-search-term"
                            onClick={async () => {
                                // 记录搜索关键词到Redis
                                try {
                                    await axios.post('http://localhost:8081/api/search/record', null, {
                                        params: { keyword: keyword }
                                    });
                                    // 重新获取热门搜索关键词列表
                                    await fetchHotSearchKeywords();
                                } catch (error) {
                                    console.error('记录搜索关键词失败:', error);
                                }
                                
                                // 跳转到搜索结果页
                                navigate(`/products?search=${encodeURIComponent(keyword)}`);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
            )}
        </header>
    );
}

export default TopNavigation;

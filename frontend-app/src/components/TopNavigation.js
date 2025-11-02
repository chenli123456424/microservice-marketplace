import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
    
    const { isAuthenticated, logout, token, user } = useAuth();
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

    // 监听user.avatar变化，仅在URL真正变化时更新版本号
    useEffect(() => {
        if (user?.avatar) {
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
                                {user?.avatar ? (
                                    <img 
                                        key={`avatar-${user.avatar}-${avatarVersion}`} // 使用avatar版本确保头像更新时重新渲染
                                        src={`http://localhost:8081${user.avatar}${user.avatar.includes('?') ? '&' : '?'}v=${avatarVersion}`}
                                        alt="用户头像"
                                        className="user-avatar"
                                        onError={(e) => {
                                            console.error('头像加载失败:', user.avatar);
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) {
                                                e.target.nextSibling.style.display = 'block';
                                            }
                                        }}
                                    />
                                ) : null}
                                {!user?.avatar && <span>👤</span>}
                                {user?.username && (
                                    <span className="username-text">{user.username}</span>
                                )}
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

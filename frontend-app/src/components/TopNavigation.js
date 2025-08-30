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
        <header style={{
            backgroundColor: '#c57237',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: '1px solid #e5e5e5'
        }}>
            {/* 顶部导航栏 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 250px',
                height: '60px',
                justifyContent: 'space-between'
            }}>
                {/* Logo区域 */}
                <div style={{ marginRight: '5px' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <img 
                            src="/images/logo.png"
                            alt="电商平台Logo" 
                            style={{ height: '45px', width: 'auto' }}
                        />
                    </Link>
                </div>

                {/* 主要导航菜单 */}
                <nav style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexGrow: 1
                }}>
                    {/* 品牌名称 */}
                    <div style={{
                        fontWeight: 'bold',
                        color: '#ffffff',
                        fontSize: '20px',
                        marginRight: '30px',
                        fontFamily: 'Arial, sans-serif'
                    }}>
                        筑家智选
                    </div>

                    {/* 其他导航项 */}
                    <Link to="/custom" style={{ 
                        textDecoration: 'none', 
                        color: '#ffffff',
                        margin: '0 15px',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                    }}>
                        全屋定制
                    </Link>
                    <Link to="/designers" style={{ 
                        textDecoration: 'none', 
                        color: '#ffffff',
                        margin: '0 15px',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                    }}>
                        设计师
                    </Link>
                    <Link to="/stores" style={{ 
                        textDecoration: 'none', 
                        color: '#ffffff',
                        margin: '0 15px',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                    }}>
                        线下门店
                    </Link>
                    <Link to="/service" style={{ 
                        textDecoration: 'none', 
                        color: '#ffffff',
                        margin: '0 15px',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                    }}>
                        服务中心
                    </Link>
                    <Link to="/community" style={{ 
                        textDecoration: 'none', 
                        color: '#ffffff',
                        margin: '0 15px',
                        fontWeight: 'normal',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                    }}>
                        社区/灵感
                    </Link>
                </nav>

                {/* 右侧功能区域 */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center'
                }}>
                    {/* 搜索框 */}
                    <div style={{ 
                        position: 'relative',
                        marginRight: '20px'
                    }}>
                        <input
                            type="text"
                            placeholder="搜索商品、品牌、型号..."
                            style={{
                                padding: '8px 15px',
                                width: '250px',
                                border: '1px solid #ddd',
                                borderRadius: '20px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#007bff'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                        <button style={{
                            position: 'absolute',
                            right: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#999'
                        }}>
                            🔍
                        </button>
                    </div>

                    {/* 个人中心或登录/注册 */}
                    {isAuthenticated ? (
                        <div 
                            style={{ 
                                position: 'relative',
                                marginRight: '20px'
                            }}
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: '#333',
                                position: 'relative'
                            }}>
                                👤
                            </button>
                            
                            {isUserMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    backgroundColor: '#fff',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    minWidth: '150px',
                                    zIndex: 1001,
                                    border: '1px solid #e5e5e5'
                                }}>
                                    <Link to="/orders" style={{
                                        display: 'block',
                                        padding: '10px 20px',
                                        textDecoration: 'none',
                                        color: '#333',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        我的订单
                                    </Link>
                                    <Link to="/coupons" style={{
                                        display: 'block',
                                        padding: '10px 20px',
                                        textDecoration: 'none',
                                        color: '#333',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        我的优惠券
                                    </Link>
                                    <Link to="/profile" style={{
                                        display: 'block',
                                        padding: '10px 20px',
                                        textDecoration: 'none',
                                        color: '#333',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        个人信息
                                    </Link>
                                    <Link
                                        onClick={handleLogout}
                                        style={{
                                            display: 'block',
                                            padding: '10px 20px',
                                            textDecoration: 'none',
                                            color: '#333',
                                            borderBottom: '1px solid #eee'
                                        }}>
                                        登出
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth" style={{
                            textDecoration: 'none',
                            color: '#ffffff',
                            fontWeight: 'normal',
                            fontSize: '14px',
                            marginRight: '20px'
                        }}>
                            登录 | 注册
                        </Link>
                    )}

                    {/* 购物车 */}
                    <div 
                        style={{ 
                            position: 'relative',
                            marginRight: '20px'
                        }}
                        onMouseEnter={() => setIsCartMenuOpen(true)}
                        onMouseLeave={() => setIsCartMenuOpen(false)}
                    >
                        <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#333',
                            position: 'relative'
                        }}>
                            🛒
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '12px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                3
                            </span>
                        </button>
                        
                        {isCartMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                minWidth: '250px',
                                zIndex: 1001,
                                border: '1px solid #e5e5e5',
                                padding: '15px'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                    购物车 (3)
                                </div>
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto' 
                                }}>
                                    {/* 购物车商品示例 */}
                                    <div style={{ 
                                        display: 'flex', 
                                        marginBottom: '10px',
                                        paddingBottom: '10px',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: '#f0f0f0',
                                            marginRight: '10px'
                                        }}></div>
                                        <div>
                                            <div>商品名称</div>
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                数量: 1
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/cart" style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    padding: '8px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    marginTop: '10px'
                                }}>
                                    查看购物车
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 消息通知 */}
                    <div style={{ position: 'relative' }}>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#333',
                            position: 'relative'
                        }}>
                            🔔
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '12px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                2
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 热门搜索词 */}
            <div style={{
                padding: '10px 250px',
                height: '40px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #eee',
                fontSize: '15px'
            }}>
                <span style={{ color: '#666', marginRight: '10px' }}>
                    热门搜索:
                </span>
                <span style={{
                    color: '#007bff', 
                    marginRight: '15px',
                    cursor: 'pointer'
                }}>
                    沙发
                </span>
                <span style={{
                    color: '#007bff', 
                    marginRight: '15px',
                    cursor: 'pointer'
                }}>
                    床
                </span>
                <span style={{
                    color: '#007bff', 
                    marginRight: '15px',
                    cursor: 'pointer'
                }}>
                    瓷砖
                </span>
                <span style={{
                    color: '#007bff', 
                    cursor: 'pointer'
                }}>
                    灯具
                </span>
            </div>
        </header>
    );
}

export default TopNavigation;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { modalService } from '../components/ModalManager';
import FooterSection from '../components/FooterSection';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);

    // 订单状态映射
    const orderStatusMap = {
        1: { text: '待付款', color: '#ff6b35', bgColor: '#fff2f0' },
        2: { text: '待发货', color: '#1890ff', bgColor: '#e6f7ff' },
        3: { text: '待收货', color: '#13c2c2', bgColor: '#e6fffb' },
        4: { text: '待评价', color: '#722ed1', bgColor: '#f9f0ff' },
        5: { text: '退款/售后', color: '#ff4d4f', bgColor: '#fff1f0' }
    };

    // 支付状态映射
    const payStatusMap = {
        0: { text: '未支付', color: '#ff4d4f' },
        1: { text: '已支付', color: '#52c41a' }
    };

    // 发货状态映射
    const deliveryStatusMap = {
        0: { text: '未发货', color: '#ff4d4f' },
        1: { text: '已发货', color: '#52c41a' }
    };

    // 获取订单列表
    const fetchOrders = async () => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('MyOrdersPage: 开始获取用户订单，Token:', token ? '存在' : '不存在');
            
            const response = await axios.get('http://localhost:8081/api/orders/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('MyOrdersPage: 订单API响应:', response.data);
            
            if (response.data.code === 200) {
                const orders = response.data.data || [];
                console.log('MyOrdersPage: 获取到订单数量:', orders.length);
                setOrders(orders);
                setFilteredOrders(orders);
            } else {
                console.error('MyOrdersPage: API返回错误:', response.data.message);
            }
        } catch (error) {
            console.error('MyOrdersPage: 获取订单列表失败:', error);
            if (error.response) {
                console.error('MyOrdersPage: 错误响应:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [isAuthenticated, token]);

    // 根据标签页过滤订单
    const filterOrdersByTab = (orders, tab) => {
        switch (tab) {
            case 'pending_payment':
                return orders.filter(order => order.orderStatus === 1);
            case 'pending_delivery':
                return orders.filter(order => order.orderStatus === 2);
            case 'pending_receipt':
                return orders.filter(order => order.orderStatus === 3);
            case 'completed':
                return orders.filter(order => order.orderStatus === 4);
            case 'cancelled':
                return orders.filter(order => order.orderStatus === 5);
            default:
                return orders;
        }
    };

    // 搜索订单
    const handleSearch = () => {
        if (!searchKeyword.trim()) {
            setFilteredOrders(orders);
            return;
        }

        const filtered = orders.filter(order => 
            order.orderNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (order.orderItems && order.orderItems.some(item => 
                item.productName.toLowerCase().includes(searchKeyword.toLowerCase())
            ))
        );
        setFilteredOrders(filtered);
    };

    // 处理标签页切换
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const filtered = filterOrdersByTab(orders, tab);
        setFilteredOrders(filtered);
    };

    // 格式化时间
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleString('zh-CN');
    };

    // 格式化金额
    const formatPrice = (price) => {
        return `¥${parseFloat(price).toFixed(2)}`;
    };

    // 取消订单
    const handleCancelOrder = async (orderId, orderStatus) => {
        // 根据订单状态显示不同的确认文案
        const confirmMessage = orderStatus === 1 
            ? '确定要取消这个订单吗？' 
            : '确定要申请退款吗？订单将被取消，款项将原路退回。';
        
        const confirmTitle = orderStatus === 1 ? '取消订单' : '申请退款';
        
        // 使用自定义弹窗
        modalService.confirm(
            confirmMessage,
            confirmTitle,
            async () => {
                // 确认回调
                try {
                    const response = await axios.put(
                        `http://localhost:8081/api/orders/${orderId}/cancel`,
                        null,
                        {
                            params: {
                                reason: orderStatus === 1 ? '用户取消订单' : '用户申请退款'
                            },
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (response.data.code === 200) {
                        modalService.success(
                            orderStatus === 1 ? '订单取消成功！' : '退款申请已提交！',
                            '操作成功'
                        );
                        fetchOrders(); // 刷新订单列表
                    } else {
                        modalService.error(
                            response.data.message || '操作失败',
                            '操作失败'
                        );
                    }
                } catch (error) {
                    console.error('取消订单失败:', error);
                    modalService.error(
                        '操作失败，请稍后重试',
                        '错误'
                    );
                }
            },
            () => {
                // 取消回调（可选）
                console.log('用户取消操作');
            }
        );
    };

    // 获取订单操作按钮
    const getOrderActions = (order) => {
        const actions = [];
        
        switch (order.orderStatus) {
            case 1: // 待付款
                actions.push(
                    <button 
                        key="cancel" 
                        className="order-action-btn cancel-btn"
                        onClick={() => handleCancelOrder(order.orderId, order.orderStatus)}
                    >
                        取消订单
                    </button>,
                    <button key="pay" className="order-action-btn primary-btn">
                        立即付款
                    </button>
                );
                break;
            case 2: // 待发货
                actions.push(
                    <button 
                        key="refund" 
                        className="order-action-btn cancel-btn"
                        onClick={() => handleCancelOrder(order.orderId, order.orderStatus)}
                    >
                        申请退款
                    </button>,
                    <button key="contact" className="order-action-btn secondary-btn">
                        联系客服
                    </button>
                );
                break;
            case 3: // 待收货
                actions.push(
                    <button key="track" className="order-action-btn secondary-btn">
                        查看物流
                    </button>,
                    <button key="confirm" className="order-action-btn primary-btn">
                        确认收货
                    </button>
                );
                break;
            case 4: // 待评价
                actions.push(
                    <button key="review" className="order-action-btn secondary-btn">
                        评价晒单
                    </button>,
                    <button key="rebuy" className="order-action-btn primary-btn">
                        再次购买
                    </button>
                );
                break;
            case 5: // 退款/售后
                actions.push(
                    <button key="rebuy" className="order-action-btn primary-btn">
                        再次购买
                    </button>,
                    <button key="contact" className="order-action-btn secondary-btn">
                        联系客服
                    </button>
                );
                break;
        }
        
        return actions;
    };

    if (!isAuthenticated) {
        return (
            <>
                <div className="my-orders-container">
                    <div className="login-prompt">
                        <div className="login-icon">🔒</div>
                        <h2>您还未登录</h2>
                        <p>登录后即可查看您的订单信息</p>
                        <button 
                            className="login-btn"
                            onClick={() => navigate('/auth')}
                        >
                            立即登录
                        </button>
                        <button 
                            className="register-btn"
                            onClick={() => navigate('/auth')}
                        >
                            注册账号
                        </button>
                    </div>
                </div>
                <FooterSection />
            </>
        );
    }

    return (
        <div className="my-orders-container">
            <div className="orders-header">
                <div className="breadcrumb">
                    <span>首页</span>
                    <span className="separator">/</span>
                    <span>我的订单</span>
                </div>
                
                <div className="orders-title-section">
                    <h1 className="orders-title">我的订单</h1>
                    <div className="security-warning">
                        请谨防钓鱼链接或诈骗电话，了解更多&gt;
                    </div>
                </div>

                <div className="orders-tabs">
                    <div className="tab-list">
                        <button 
                            className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => handleTabChange('all')}
                        >
                            全部有效订单
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'pending_payment' ? 'active' : ''}`}
                            onClick={() => handleTabChange('pending_payment')}
                        >
                            待支付
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'pending_delivery' ? 'active' : ''}`}
                            onClick={() => handleTabChange('pending_delivery')}
                        >
                            待发货
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'pending_receipt' ? 'active' : ''}`}
                            onClick={() => handleTabChange('pending_receipt')}
                        >
                            待收货
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`}
                            onClick={() => handleTabChange('completed')}
                        >
                            待评价
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'cancelled' ? 'active' : ''}`}
                            onClick={() => handleTabChange('cancelled')}
                        >
                            退款/售后
                        </button>
                    </div>
                    
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="输入商品名称、订单号"
                            className="search-input"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="search-btn" onClick={handleSearch}>
                            🔍
                        </button>
                    </div>
                </div>
            </div>

            <div className="orders-content">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>加载中...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <h3>当前没有交易订单</h3>
                        <p>快去选购心仪的商品吧！</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order.orderId} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <span className="order-number">订单号：{order.orderNo}</span>
                                        <span className="order-time">{formatTime(order.createTime)}</span>
                                    </div>
                                    <div className="order-status">
                                        <span 
                                            className="status-badge"
                                            style={{
                                                color: orderStatusMap[order.orderStatus]?.color,
                                                backgroundColor: orderStatusMap[order.orderStatus]?.bgColor
                                            }}
                                        >
                                            {orderStatusMap[order.orderStatus]?.text}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.orderItems && order.orderItems.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <div className="item-image">
                                                <img 
                                                    src={item.productImage ? `http://localhost:8081${item.productImage}` : '/images/placeholder.png'}
                                                    alt={item.productName}
                                                    onError={(e) => {
                                                        e.target.src = '/images/placeholder.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="item-details">
                                                <h4 className="item-name">{item.productName}</h4>
                                                <div className="item-specs">
                                                    {item.spec && <span>规格：{item.spec}</span>}
                                                    {item.color && <span>颜色：{item.color}</span>}
                                                </div>
                                                <div className="item-quantity">数量：{item.quantity}</div>
                                            </div>
                                            <div className="item-price">
                                                <div className="price">¥{parseFloat(item.productPrice).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-summary">
                                    <div className="summary-info">
                                        <div className="receiver-info">
                                            <span>收货人：{order.receiverName}</span>
                                            <span>联系电话：{order.receiverPhone}</span>
                                        </div>
                                        <div className="address-info">
                                            收货地址：{order.receiverAddress}
                                        </div>
                                    </div>
                                    <div className="summary-amount">
                                        <div className="amount-details">
                                            <div className="amount-line">
                                                <span>商品总价：</span>
                                                <span>{formatPrice(order.totalAmount)}</span>
                                            </div>
                                            {order.discountAmount > 0 && (
                                                <div className="amount-line discount">
                                                    <span>优惠金额：</span>
                                                    <span>-{formatPrice(order.discountAmount)}</span>
                                                </div>
                                            )}
                                            <div className="amount-line total">
                                                <span>实付金额：</span>
                                                <span className="total-amount">{formatPrice(order.payAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-actions">
                                    {getOrderActions(order)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <FooterSection />
        </div>
    );
};

export default MyOrdersPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showModal } from '../utils/modal';
import './OrderConfirmPage.css';

const OrderConfirmPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useAuth();
    
    // 从路由状态获取订单数据
    const orderData = location.state?.orderData;
    const orderType = location.state?.orderType; // 'buy_now' 或 'cart_checkout'
    
    const [formData, setFormData] = useState({
        receiverName: user?.username || '',
        receiverPhone: '',
        receiverAddress: '',
        remark: '',
        payMethod: 'alipay'
    });
    
    const [loading, setLoading] = useState(false);
    const [orderItems, setOrderItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // 获取图片URL
    const getImageUrl = (imagePath) => {
        console.log('OrderConfirmPage: 原始图片路径:', imagePath);
        
        if (!imagePath) {
            console.log('OrderConfirmPage: 图片路径为空，使用默认图片');
            return getDefaultImage();
        }
        
        // 如果已经是完整URL，直接返回
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            console.log('OrderConfirmPage: 使用完整URL:', imagePath);
            return imagePath;
        }
        
        // 如果是相对路径，添加服务器地址
        const fullUrl = `http://localhost:8081${imagePath}?t=${new Date().getTime()}`;
        console.log('OrderConfirmPage: 构建完整URL:', fullUrl);
        return fullUrl;
    };

    // 获取默认图片
    const getDefaultImage = () => {
        return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%2280%22%20height%3D%2280%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2215%22%20y%3D%2225%22%3E无图%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
    };

    useEffect(() => {
        // 检查用户是否已登录
        if (!user || !user.id) {
            showModal.warning('请先登录', () => {
                navigate('/auth');
            });
            return;
        }

        if (!orderData) {
            showModal.error('订单数据丢失，请重新选择商品');
            navigate('/');
            return;
        }

        if (orderType === 'buy_now') {
            // 立即购买：单个商品
            console.log('OrderConfirmPage: 立即购买数据:', orderData);
            setOrderItems([orderData]);
            setTotalAmount(orderData.price * orderData.quantity);
        } else if (orderType === 'cart_checkout') {
            // 购物车结算：多个商品
            console.log('OrderConfirmPage: 购物车结算数据:', orderData);
            setOrderItems(orderData);
            const total = orderData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setTotalAmount(total);
        }
    }, [orderData, orderType, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.receiverName.trim()) {
            showModal.warning('请输入收货人姓名');
            return false;
        }
        if (!formData.receiverPhone.trim()) {
            showModal.warning('请输入收货人电话');
            return false;
        }
        if (!formData.receiverAddress.trim()) {
            showModal.warning('请输入收货地址');
            return false;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.receiverPhone)) {
            showModal.warning('请输入正确的手机号码');
            return false;
        }
        return true;
    };

    const handleSubmitOrder = async () => {
        if (!validateForm()) {
            return;
        }

        // 检查用户是否已登录
        if (!user || !user.id) {
            showModal.warning('请先登录', () => {
                navigate('/auth');
            });
            return;
        }

        setLoading(true);
        try {
            // 构建订单请求数据
            const orderRequest = {
                userId: user.id,
                orderItems: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    spec: item.spec || '',
                    color: item.color || ''
                })),
                receiverName: formData.receiverName,
                receiverPhone: formData.receiverPhone,
                receiverAddress: formData.receiverAddress,
                remark: formData.remark,
                payMethod: formData.payMethod
            };

            console.log('提交订单请求:', orderRequest);

            const response = await fetch('http://localhost:8081/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderRequest)
            });

            const result = await response.json();
            console.log('订单创建响应:', result);

            if (result.code === 200) {
                // 订单创建成功，现在进行模拟支付
                await handleMockPayment(result.data);
            } else {
                showModal.error(result.message || '订单创建失败');
            }
        } catch (error) {
            console.error('创建订单失败:', error);
            showModal.error('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 模拟支付处理
    const handleMockPayment = async (orderData) => {
        try {
            console.log('显示支付确认对话框，订单数据:', orderData);
            // 显示支付确认对话框
            showModal.confirm(
                `确认支付 ¥${totalAmount.toFixed(2)} 吗？\n\n支付方式：${formData.payMethod === 'alipay' ? '支付宝' : '微信支付'}\n订单号：${orderData.orderNo}`,
                '支付确认',
                async () => {
                    // 用户确认支付
                    console.log('用户确认支付，开始处理支付逻辑');
                    setLoading(true);
                    
                    try {
                        // 模拟支付延迟
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // 调用支付成功API
                        console.log('开始调用支付状态更新API，订单ID:', orderData.orderId);
                        const payResponse = await fetch(`http://localhost:8081/api/orders/${orderData.orderId}/pay-status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                payStatus: 1, // 已支付
                                payMethod: formData.payMethod
                            })
                        });

                        console.log('支付状态更新API响应状态:', payResponse.status);
                        const payResult = await payResponse.json();
                        console.log('支付状态更新API响应数据:', payResult);
                        
                        if (payResult.code === 200) {
                            // 支付成功
                            console.log('支付状态更新成功，准备跳转到购物车页面');
                            showModal.success('支付成功！', '支付成功', () => {
                                // 触发购物车数据更新事件
                                console.log('支付成功回调函数被调用');
                                window.dispatchEvent(new CustomEvent('cartUpdated'));
                                
                                // 跳转到购物车页面
                                console.log('开始跳转到购物车页面');
                                navigate('/cart');
                            });
                        } else {
                            console.error('支付状态更新失败:', payResult);
                            showModal.error('支付状态更新失败: ' + (payResult.message || '未知错误'));
                        }
                    } catch (error) {
                        console.error('支付处理失败:', error);
                        // 临时解决方案：即使支付状态更新失败，也跳转到购物车页面
                        console.log('支付状态更新失败，但仍然跳转到购物车页面进行测试');
                        showModal.success('支付成功！（状态更新失败，但订单已创建）', '支付成功', () => {
                            // 触发购物车数据更新事件
                            console.log('支付成功回调函数被调用（错误处理）');
                            window.dispatchEvent(new CustomEvent('cartUpdated'));
                            
                            // 跳转到购物车页面
                            console.log('开始跳转到购物车页面（错误处理）');
                            navigate('/cart');
                        });
                    } finally {
                        setLoading(false);
                    }
                },
                () => {
                    // 用户取消支付
                    console.log('用户取消支付');
                    showModal.info('支付已取消');
                }
            );
        } catch (error) {
            console.error('支付确认失败:', error);
            showModal.error('支付确认失败');
        }
    };

    if (!orderData) {
        return (
            <div className="order-confirm-page">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    return (
        <div className="order-confirm-page">
            <div className="container">
                <div className="page-header">
                    <h1>确认订单</h1>
                    <div className="breadcrumb">
                        <span>首页</span>
                        <span>&gt;</span>
                        <span>确认订单</span>
                    </div>
                </div>

                <div className="order-content">
                    {/* 收货信息 */}
                    <div className="section">
                        <h2>收货信息</h2>
                        <div className="form-group">
                            <label>收货人姓名 *</label>
                            <input
                                type="text"
                                name="receiverName"
                                value={formData.receiverName}
                                onChange={handleInputChange}
                                placeholder="请输入收货人姓名"
                            />
                        </div>
                        <div className="form-group">
                            <label>收货人电话 *</label>
                            <input
                                type="tel"
                                name="receiverPhone"
                                value={formData.receiverPhone}
                                onChange={handleInputChange}
                                placeholder="请输入收货人电话"
                            />
                        </div>
                        <div className="form-group">
                            <label>收货地址 *</label>
                            <textarea
                                name="receiverAddress"
                                value={formData.receiverAddress}
                                onChange={handleInputChange}
                                placeholder="请输入详细的收货地址"
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>订单备注</label>
                            <textarea
                                name="remark"
                                value={formData.remark}
                                onChange={handleInputChange}
                                placeholder="选填，对本次交易的说明"
                                rows="2"
                            />
                        </div>
                    </div>

                    {/* 商品信息 */}
                    <div className="section">
                        <h2>商品信息</h2>
                        <div className="order-items">
                            {orderItems.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="item-image">
                                        <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.src = getDefaultImage();
                                            }}
                                        />
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <div className="item-specs">
                                            {item.color && <span className="spec">颜色: {item.color}</span>}
                                            {item.spec && <span className="spec">规格: {item.spec}</span>}
                                        </div>
                                        <div className="item-price">¥{item.price}</div>
                                    </div>
                                    <div className="item-quantity">
                                        <span>数量: {item.quantity}</span>
                                    </div>
                                    <div className="item-total">
                                        ¥{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 支付方式 */}
                    <div className="section">
                        <h2>支付方式</h2>
                        <div className="payment-methods">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payMethod"
                                    value="alipay"
                                    checked={formData.payMethod === 'alipay'}
                                    onChange={handleInputChange}
                                />
                                <span className="payment-icon">💰</span>
                                <span>支付宝</span>
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payMethod"
                                    value="wechat"
                                    checked={formData.payMethod === 'wechat'}
                                    onChange={handleInputChange}
                                />
                                <span className="payment-icon">💳</span>
                                <span>微信支付</span>
                            </label>
                        </div>
                    </div>

                    {/* 订单汇总 */}
                    <div className="section order-summary">
                        <h2>订单汇总</h2>
                        <div className="summary-row">
                            <span>商品总价:</span>
                            <span>¥{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>运费:</span>
                            <span>¥0.00</span>
                        </div>
                        <div className="summary-row total">
                            <span>应付总额:</span>
                            <span>¥{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="submit-section">
                        <button 
                            className="submit-btn"
                            onClick={handleSubmitOrder}
                            disabled={loading}
                        >
                            {loading ? '提交中...' : `确认支付 ¥${totalAmount.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmPage;

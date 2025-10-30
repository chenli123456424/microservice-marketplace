import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const orderData = location.state?.orderData;
    const payAmount = location.state?.payAmount;

    useEffect(() => {
        if (!orderData) {
            navigate('/');
            return;
        }
    }, [orderData, navigate]);

    const handleContinueShopping = () => {
        navigate('/products');
    };

    const handleViewOrders = () => {
        // 这里可以跳转到订单列表页面
        navigate('/');
    };

    if (!orderData) {
        return (
            <div className="payment-success-page">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    return (
        <div className="payment-success-page">
            <div className="container">
                <div className="success-content">
                    {/* 成功图标和标题 */}
                    <div className="success-header">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#52c41a"/>
                                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1>支付成功！</h1>
                        <p className="success-message">您的订单已成功支付，我们将尽快为您安排发货</p>
                    </div>

                    {/* 订单信息 */}
                    <div className="order-info">
                        <h2>订单信息</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">订单号：</span>
                                <span className="value">{orderData.orderNo}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">支付金额：</span>
                                <span className="value amount">¥{payAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">支付方式：</span>
                                <span className="value">{orderData.payMethod === 'alipay' ? '支付宝' : '微信支付'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">支付时间：</span>
                                <span className="value">{new Date().toLocaleString('zh-CN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* 收货信息 */}
                    <div className="delivery-info">
                        <h2>收货信息</h2>
                        <div className="delivery-details">
                            <div className="delivery-item">
                                <span className="label">收货人：</span>
                                <span className="value">{orderData.receiverName}</span>
                            </div>
                            <div className="delivery-item">
                                <span className="label">联系电话：</span>
                                <span className="value">{orderData.receiverPhone}</span>
                            </div>
                            <div className="delivery-item">
                                <span className="label">收货地址：</span>
                                <span className="value">{orderData.receiverAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* 温馨提示 */}
                    <div className="tips">
                        <h3>温馨提示</h3>
                        <ul>
                            <li>订单已提交，我们将在1-3个工作日内为您安排发货</li>
                            <li>您可以通过订单号查询物流信息</li>
                            <li>如有任何问题，请联系客服：400-123-4567</li>
                            <li>感谢您的购买，祝您购物愉快！</li>
                        </ul>
                    </div>

                    {/* 操作按钮 */}
                    <div className="action-buttons">
                        <button 
                            className="btn-secondary"
                            onClick={handleContinueShopping}
                        >
                            继续购物
                        </button>
                        <button 
                            className="btn-primary"
                            onClick={handleViewOrders}
                        >
                            查看订单
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;

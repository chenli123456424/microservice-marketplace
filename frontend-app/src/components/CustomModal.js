import React from 'react';
import ReactDOM from 'react-dom';

const CustomModal = ({ isOpen, onClose, title, message, type = 'info', showCancel = false, onConfirm, onCancel, onSuccess }) => {
    if (!isOpen) return null;
    
    console.log('CustomModal 渲染:', { isOpen, title, message, type, showCancel });

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        // 如果是支付成功类型，直接跳转到购物车页面
        if (type === 'success' && title === '支付成功') {
            console.log('支付成功，直接跳转到购物车页面');
            // 触发购物车数据更新事件
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            // 跳转到购物车页面并刷新
            window.location.href = '/cart';
            return;
        }
        
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return '#52c41a';
            case 'error':
                return '#ff4d4f';
            case 'warning':
                return '#faad14';
            case 'info':
            default:
                return '#1890ff';
        }
    };

    return ReactDOM.createPortal(
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={handleBackdropClick}
        >
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideIn {
                        from { 
                            opacity: 0;
                            transform: scale(0.8);
                        }
                        to { 
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}
            </style>
            <div 
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    animation: 'slideIn 0.3s ease-out',
                    transformOrigin: 'center center'
                }}
            >
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#999',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f5f5f5';
                        e.target.style.color = '#666';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#999';
                    }}
                >
                    ×
                </button>

                {/* 图标和标题 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        fontSize: '24px',
                        marginRight: '12px'
                    }}>
                        {getIcon()}
                    </div>
                    {title && (
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            {title}
                        </h3>
                    )}
                </div>

                {/* 消息内容 */}
                <div style={{
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.5'
                }}>
                    {message}
                </div>

                {/* 按钮组 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    {showCancel && (
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                                backgroundColor: '#fff',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#40a9ff';
                                e.target.style.color = '#40a9ff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#d9d9d9';
                                e.target.style.color = '#666';
                            }}
                        >
                            取消
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: getButtonColor(),
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.opacity = '0.8';
                            e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {showCancel ? '确定' : '好的'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CustomModal;

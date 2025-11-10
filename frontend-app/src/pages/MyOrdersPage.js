import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { modalService } from '../components/ModalManager';
import { showModal } from '../utils/modal';
import FooterSection from '../components/FooterSection';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    const ordersContentRef = useRef(null);
    const isInitialMount = useRef(true);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    
    // 分页相关状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    
    // 评价相关状态
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState(null);
    const [reviewFormData, setReviewFormData] = useState({
        orderItemId: null,
        productId: null,
        rating: 5,
        content: '',
        images: []
    });
    const [reviewImageFiles, setReviewImageFiles] = useState([]);
    const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);

    // 订单状态映射
    const orderStatusMap = {
        1: { text: '待付款', color: '#ff6b35', bgColor: '#fff2f0' },
        2: { text: '待发货', color: '#1890ff', bgColor: '#e6f7ff' },
        3: { text: '待收货', color: '#13c2c2', bgColor: '#e6fffb' },
        4: { text: '待评价', color: '#722ed1', bgColor: '#f9f0ff' },
        5: { text: '已完成', color: '#52c41a', bgColor: '#f6ffed' },
        6: { text: '退款/售后', color: '#ff4d4f', bgColor: '#fff1f0' }
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

    // 获取订单列表（可指定过滤标签）
    const fetchOrders = async (tabForFilter) => {
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
                const newOrders = response.data.data || [];
                console.log('MyOrdersPage: 获取到订单数量:', newOrders.length);
                setOrders(newOrders);
                // 按当前活动标签或外部传入的标签进行过滤，保证刷新后仍停留在当前分栏
                const tabToUse = tabForFilter || activeTab;
                const filtered = filterOrdersByTab(newOrders, tabToUse);
                setFilteredOrders(filtered);
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

    // 计算总页数
    useEffect(() => {
        const total = Math.ceil(filteredOrders.length / pageSize);
        setTotalPages(total);
        // 如果当前页超过总页数，重置到第一页
        if (currentPage > total && total > 0) {
            setCurrentPage(1);
        }
    }, [filteredOrders, pageSize, currentPage]);

    // 页码变化时滚动到顶部
    useEffect(() => {
        // 跳过初次加载
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        // 使用 setTimeout 确保在 DOM 更新后执行滚动
        const timer = setTimeout(() => {
            scrollToTop();
        }, 50);
        
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

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
                return orders.filter(order => order.orderStatus === 4); // 待评价
            case 'cancelled':
                return orders.filter(order => order.orderStatus === 6); // 退款/售后
            default:
                // 全部有效订单：排除退款/售后（状态6）
                return orders.filter(order => order.orderStatus !== 6);
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
        setCurrentPage(1); // 切换标签页时重置到第一页
        // 点击分栏时立即刷新并应用对应过滤
        fetchOrders(tab);
    };

    // 获取当前页的订单数据
    const getCurrentPageOrders = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredOrders.slice(startIndex, endIndex);
    };

    // 滚动到顶部的函数
    const scrollToTop = () => {
        // 滚动到订单内容区域顶部
        if (ordersContentRef.current) {
            const headerOffset = 100; // 预留顶部导航栏的高度
            const elementPosition = ordersContentRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            // 如果引用不存在，回退到滚动到页面顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 切换页码
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 切换每页显示数量
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1); // 重置到第一页
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
                        // 刷新并保持当前分栏
                        fetchOrders(activeTab);
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

    // 立即付款
    const handlePayNow = async (order) => {
        const amountText = typeof order.payAmount !== 'undefined' ? `¥${parseFloat(order.payAmount).toFixed(2)}` : '';
        modalService.confirm(
            `确认支付 ${amountText} 吗？`,
            '支付确认',
            async () => {
                try {
                    const response = await axios.put(
                        `http://localhost:8081/api/orders/${order.orderId}/pay-status`,
                        {
                            payStatus: 1,
                            payMethod: 'alipay'
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    if (response.data.code === 200) {
                        modalService.success('支付成功！', '成功');
                        // 支付成功后刷新并保持当前分栏
                        fetchOrders(activeTab);
                    } else {
                        modalService.error(response.data.message || '支付失败', '错误');
                    }
                } catch (error) {
                    console.error('支付失败:', error);
                    modalService.error('支付失败，请稍后重试', '错误');
                }
            },
            () => {}
        );
    };

    // 处理确认收货
    const handleConfirmReceipt = async (orderId) => {
        modalService.confirm(
            '确认已收到商品吗？确认后订单将进入待评价状态。',
            '确认收货',
            async () => {
                try {
                    const response = await axios.put(
                        `http://localhost:8081/api/orders/${orderId}/confirm-receipt`,
                        null,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (response.data.code === 200) {
                        modalService.success(
                            '收货确认成功！',
                            '操作成功'
                        );
                        // 刷新并保持当前分栏
                        fetchOrders(activeTab);
                    } else {
                        modalService.error(
                            response.data.message || '操作失败',
                            '操作失败'
                        );
                    }
                } catch (error) {
                    console.error('确认收货失败:', error);
                    modalService.error(
                        '操作失败，请稍后重试',
                        '错误'
                    );
                }
            },
            () => {
                console.log('用户取消确认收货');
            }
        );
    };

    // 打开评价弹窗
    const handleOpenReviewModal = (order) => {
        setReviewingOrder(order);
        // 如果订单只有一个商品，默认选择该商品
        if (order.orderItems && order.orderItems.length === 1) {
            const item = order.orderItems[0];
            setReviewFormData({
                orderItemId: item.itemId,
                productId: item.productId,
                rating: 5,
                content: '',
                images: []
            });
        } else {
            setReviewFormData({
                orderItemId: null,
                productId: null,
                rating: 5,
                content: '',
                images: []
            });
        }
        setReviewImageFiles([]);
        setReviewImagePreviews([]);
        setReviewModalVisible(true);
    };

    // 关闭评价弹窗
    const handleCloseReviewModal = () => {
        setReviewModalVisible(false);
        setReviewingOrder(null);
        setReviewFormData({
            orderItemId: null,
            productId: null,
            rating: 5,
            content: '',
            images: []
        });
        setReviewImageFiles([]);
        setReviewImagePreviews([]);
    };

    // 选择评价图片
    const handleReviewImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (reviewImageFiles.length + files.length > 9) {
            showModal.error('最多只能上传9张图片');
            return;
        }
        
        const newFiles = [...reviewImageFiles, ...files];
        setReviewImageFiles(newFiles);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setReviewImagePreviews([...reviewImagePreviews, ...newPreviews]);
    };

    // 删除评价图片
    const handleReviewRemoveImage = (index) => {
        const newFiles = reviewImageFiles.filter((_, i) => i !== index);
        const newPreviews = reviewImagePreviews.filter((_, i) => i !== index);
        
        // 释放URL对象
        URL.revokeObjectURL(reviewImagePreviews[index]);
        
        setReviewImageFiles(newFiles);
        setReviewImagePreviews(newPreviews);
    };

    // 上传评价图片
    const uploadReviewImages = async () => {
        if (reviewImageFiles.length === 0) {
            return [];
        }

        const uploadedUrls = [];
        for (const file of reviewImageFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post(
                    'http://localhost:8081/api/home/upload-image',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': token ? `Bearer ${token}` : '' // 添加token
                        }
                    }
                );

                if (response.data.code === 200 && response.data.data) {
                    uploadedUrls.push(response.data.data);
                } else {
                    console.error('上传图片失败:', response.data.message);
                }
            } catch (error) {
                console.error('上传图片失败:', error);
                throw error; // 抛出错误，让上层处理
            }
        }
        return uploadedUrls;
    };

    // 提交评价
    const handleSubmitReview = async () => {
        if (!reviewFormData.productId) {
            showModal.error('请选择要评价的商品');
            return;
        }
        
        if (!reviewFormData.content || reviewFormData.content.trim() === '') {
            showModal.error('请输入评价内容');
            return;
        }

        try {
            setReviewLoading(true);
            
            // 上传图片（如果上传失败，继续提交评价，但不包含图片）
            let imageUrls = [];
            try {
                imageUrls = await uploadReviewImages();
            } catch (error) {
                console.error('上传图片失败，继续提交评价:', error);
                // 如果图片上传失败，可以选择继续提交评价或取消
                const shouldContinue = window.confirm('图片上传失败，是否继续提交评价（不包含图片）？');
                if (!shouldContinue) {
                    setReviewLoading(false);
                    return;
                }
            }
            
            // 构建评价数据
            const reviewData = {
                orderId: reviewingOrder.orderId,
                productId: reviewFormData.productId,
                rating: reviewFormData.rating || 5,
                content: reviewFormData.content.trim()
            };
            
            // 只有当orderItemId存在时才添加
            if (reviewFormData.orderItemId) {
                reviewData.orderItemId = reviewFormData.orderItemId;
            }
            
            // 只有当有图片时才添加images字段
            if (imageUrls.length > 0) {
                reviewData.images = imageUrls.join(',');
            }

            const response = await axios.post(
                'http://localhost:8081/api/order-reviews',
                reviewData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.code === 200) {
                showModal.success('评价成功！');
                handleCloseReviewModal();
                // 评价成功后，订单状态会变为"已完成"（状态5），从"待评价"列表消失
                // 如果当前在"待评价"标签页，自动切换到"全部有效订单"
                if (activeTab === 'completed') {
                    setActiveTab('all');
                    fetchOrders('all');
                } else {
                    // 刷新订单列表
                    fetchOrders(activeTab);
                }
            } else {
                showModal.error(response.data.message || '评价失败');
            }
        } catch (error) {
            console.error('提交评价失败:', error);
            const errorMessage = error.response?.data?.message || error.message || '评价失败，请稍后重试';
            showModal.error(errorMessage);
        } finally {
            setReviewLoading(false);
        }
    };

    // 再次购买 - 将订单商品添加到购物车
    const handleBuyAgain = async (order) => {
        if (!order.orderItems || order.orderItems.length === 0) {
            showModal.error('订单中没有商品');
            return;
        }

        try {
            let successCount = 0;
            let failCount = 0;

            // 遍历订单中的所有商品，添加到购物车
            for (const item of order.orderItems) {
                try {
                    const response = await axios.post(
                        'http://localhost:8081/api/cart/items',
                        {
                            productId: item.productId,
                            quantity: item.quantity,
                            spec: item.spec || null,
                            color: item.color || null
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data.code === 200) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    console.error('添加商品到购物车失败:', item.productName, error);
                    failCount++;
                }
            }

            if (successCount > 0) {
                showModal.success(`已成功添加 ${successCount} 个商品到购物车${failCount > 0 ? `，${failCount} 个商品添加失败` : ''}`);
                // 触发购物车更新事件
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                showModal.error('添加失败，请稍后重试');
            }
        } catch (error) {
            console.error('再次购买失败:', error);
            showModal.error('操作失败，请稍后重试');
        }
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
                    <button key="pay" className="order-action-btn primary-btn" onClick={() => handlePayNow(order)}>
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
                    <button 
                        key="confirm" 
                        className="order-action-btn primary-btn"
                        onClick={() => handleConfirmReceipt(order.orderId)}
                    >
                        确认收货
                    </button>
                );
                break;
            case 4: // 待评价
                actions.push(
                    <button 
                        key="review" 
                        className="order-action-btn secondary-btn"
                        onClick={() => handleOpenReviewModal(order)}
                    >
                        评价晒单
                    </button>,
                    <button 
                        key="rebuy" 
                        className="order-action-btn primary-btn"
                        onClick={() => handleBuyAgain(order)}
                    >
                        再次购买
                    </button>
                );
                break;
            case 5: // 已完成
                actions.push(
                    <button 
                        key="rebuy" 
                        className="order-action-btn primary-btn"
                        onClick={() => handleBuyAgain(order)}
                    >
                        再次购买
                    </button>
                );
                break;
            case 6: // 退款/售后
                actions.push(
                    <button 
                        key="rebuy" 
                        className="order-action-btn primary-btn"
                        onClick={() => handleBuyAgain(order)}
                    >
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

            <div className="orders-content" ref={ordersContentRef}>
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
                    <>
                        <div className="orders-list">
                            {getCurrentPageOrders().map((order) => (
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
                                                color: orderStatusMap[order.orderStatus]?.color || '#666',
                                                backgroundColor: orderStatusMap[order.orderStatus]?.bgColor || '#f5f5f5'
                                            }}
                                        >
                                            {orderStatusMap[order.orderStatus]?.text || `状态${order.orderStatus}`}
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

                        {/* 分页控制 */}
                        {filteredOrders.length > 0 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    <span>共 {filteredOrders.length} 条订单</span>
                                    <div className="page-size-selector">
                                        <span>每页显示：</span>
                                        <select 
                                            value={pageSize} 
                                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                            className="page-size-select"
                                        >
                                            <option value={10}>10条</option>
                                            <option value={20}>20条</option>
                                            <option value={50}>50条</option>
                                            <option value={100}>100条</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                    >
                                        首页
                                    </button>
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        上一页
                                    </button>

                                    <div className="pagination-pages">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // 只显示当前页附近的页码
                                                return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                                            })
                                            .map((page, index, array) => {
                                                // 如果页码不连续，添加省略号
                                                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                                return (
                                                    <React.Fragment key={page}>
                                                        {showEllipsis && <span className="pagination-ellipsis">...</span>}
                                                        <button
                                                            className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                );
                                            })}
                                    </div>

                                    <button 
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        下一页
                                    </button>
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        末页
                                    </button>
                                </div>

                                <div className="pagination-jump">
                                    <span>跳转到</span>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={totalPages}
                                        className="page-jump-input"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                const page = parseInt(e.target.value);
                                                if (page >= 1 && page <= totalPages) {
                                                    handlePageChange(page);
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <span>页</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* 评价晒单弹窗 */}
            {reviewModalVisible && reviewingOrder && (
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
                        zIndex: 1000
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseReviewModal();
                        }
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            padding: 24,
                            width: '90%',
                            maxWidth: 600,
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>评价晒单</h2>
                            <button
                                onClick={handleCloseReviewModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 24,
                                    cursor: 'pointer',
                                    color: '#999'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* 选择商品（如果订单有多个商品） */}
                        {reviewingOrder.orderItems && reviewingOrder.orderItems.length > 1 && (
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                                    选择要评价的商品：
                                </label>
                                <select
                                    value={reviewFormData.orderItemId || ''}
                                    onChange={(e) => {
                                        const itemId = e.target.value ? Number(e.target.value) : null;
                                        const selectedItem = reviewingOrder.orderItems.find(item => item.itemId === itemId);
                                        setReviewFormData({
                                            ...reviewFormData,
                                            orderItemId: itemId,
                                            productId: selectedItem ? selectedItem.productId : null
                                        });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 4,
                                        fontSize: 14
                                    }}
                                >
                                    <option value="">请选择商品</option>
                                    {reviewingOrder.orderItems.map(item => (
                                        <option key={item.itemId} value={item.itemId}>
                                            {item.productName} {item.spec ? `- ${item.spec}` : ''} {item.color ? `- ${item.color}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 评分 */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                                评分：
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <button
                                        key={rating}
                                        onClick={() => setReviewFormData({ ...reviewFormData, rating })}
                                        style={{
                                            fontSize: 32,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            color: rating <= reviewFormData.rating ? '#ff6b35' : '#ddd',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        {rating <= reviewFormData.rating ? '★' : '☆'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 评价内容 */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                                评价内容 <span style={{ color: '#ff4d4f' }}>*</span>：
                            </label>
                            <textarea
                                value={reviewFormData.content}
                                onChange={(e) => setReviewFormData({ ...reviewFormData, content: e.target.value })}
                                placeholder="请输入您的评价..."
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* 上传图片 */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                                晒单图片（最多9张）：
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                {reviewImagePreviews.map((preview, index) => (
                                    <div key={index} style={{ position: 'relative', width: 100, height: 100 }}>
                                        <img
                                            src={preview}
                                            alt={`预览 ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 4,
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleReviewRemoveImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: '#ff4d4f',
                                                color: '#fff',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: 16,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {reviewImagePreviews.length < 9 && (
                                    <label
                                        style={{
                                            width: 100,
                                            height: 100,
                                            border: '2px dashed #ddd',
                                            borderRadius: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: '#fafafa',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#ff6b35';
                                            e.currentTarget.style.backgroundColor = '#fff5f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#ddd';
                                            e.currentTarget.style.backgroundColor = '#fafafa';
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleReviewImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: 24, color: '#999' }}>+</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                onClick={handleCloseReviewModal}
                                disabled={reviewLoading}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    background: '#fff',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: 14
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewLoading}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: 4,
                                    background: reviewLoading ? '#ccc' : '#ff6b35',
                                    color: '#fff',
                                    cursor: reviewLoading ? 'not-allowed' : 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}
                            >
                                {reviewLoading ? '提交中...' : '提交评价'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <FooterSection />
        </div>
    );
};

export default MyOrdersPage;

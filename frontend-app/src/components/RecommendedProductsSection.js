import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDataRefresh } from '../hooks/useDataRefresh';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8081/api';

const RecommendedProductsSection = () => {
    const navigate = useNavigate();
    const [recommendedProducts, setRecommendedProducts] = useState({
        hotRecommended: [],
        newArrival: [],
        limitedOffer: [],
        bestSeller: []
    });
    const [loading, setLoading] = useState(false);
    
    // 推荐类型映射
    const recommendationTypes = [
        { key: 'hotRecommended', title: '热门推荐' },
        { key: 'newArrival', title: '新品上市' },
        { key: 'limitedOffer', title: '限时特惠' },
        { key: 'bestSeller', title: '爆款热销' }
    ];
    
    // 获取推荐商品数据
    const fetchRecommendedProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/recommended-products-with-images`);
            
            if (response.data.code === 200 && response.data.data) {
                setRecommendedProducts(response.data.data);
            } else {
                console.error('获取推荐商品失败:', response.data.message);
            }
        } catch (error) {
            console.error('获取推荐商品失败:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        fetchRecommendedProducts();
    }, [fetchRecommendedProducts]);

    // 使用数据刷新Hook，监听商品数据更新
    useDataRefresh(fetchRecommendedProducts, 'products', {
        pollingInterval: 60000, // 1分钟轮询一次
        enableVisibilityRefresh: true
    });

    return (
        <div className="recommended-products-grid">
            <style>
                {`
                    /* 推荐商品网格容器 */
                    .recommended-products-grid {
                        display: grid; /* 网格布局 */
                        grid-template-columns: repeat(4, 1fr); /* 4列等宽布局 */
                        gap: 20px; /* 网格项间距20px */
                        margin-top: 20px; /* 上边距20px */
                    }
                    
                    /* 推荐商品卡片容器 */
                    .product-card {
                        background-color: #fff; /* 白色背景 */
                        border-radius: 8px; /* 8px圆角 */
                        padding: 20px; /* 内边距20px */
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 阴影效果 */
                    }
                    
                    /* 卡片标题样式 */
                    .product-card-title {
                        font-size: 16px; /* 字体大小16px */
                        font-weight: bold; /* 粗体 */
                        margin-bottom: 15px; /* 下边距15px */
                        color: #333; /* 深灰色文字 */
                    }
                    
                    /* 商品图片容器 */
                    .product-image-container {
                        width: 100%; /* 宽度100% */
                        height: 150px; /* 高度150px */
                        background-color: #f9f9f9; /* 浅灰色背景 */
                        border-radius: 8px; /* 8px圆角 */
                        display: flex; /* 弹性布局 */
                        align-items: center; /* 垂直居中 */
                        justify-content: center; /* 水平居中 */
                        position: relative; /* 相对定位 */
                        overflow: hidden; /* 溢出隐藏 */
                    }
                    
                    /* 商品图片背景样式 */
                    .product-image-background {
                        width: 100%; /* 宽度100% */
                        height: 100%; /* 高度100% */
                        background-size: cover; /* 背景覆盖 */
                        background-position: center; /* 背景居中 */
                        background-repeat: no-repeat; /* 背景不重复 */
                    }
                    
                    /* 商品标签样式 */
                    .product-label {
                        position: absolute; /* 绝对定位 */
                        top: 10px; /* 距离顶部10px */
                        left: 10px; /* 距离左侧10px */
                        background-color: rgba(0,0,0,0.7); /* 半透明黑色背景 */
                        color: white; /* 白色文字 */
                        padding: 4px 8px; /* 内边距 */
                        border-radius: 4px; /* 4px圆角 */
                        font-size: 12px; /* 字体大小12px */
                    }
                    
                    /* 价格和按钮容器 */
                    .price-button-container {
                        margin-top: 15px; /* 上边距15px */
                        display: flex; /* 弹性布局 */
                        justify-content: space-between; /* 两端对齐 */
                        align-items: center; /* 垂直居中 */
                    }
                    
                    /* 价格样式 */
                    .product-price {
                        color: #e64340; /* 红色文字 */
                        font-weight: bold; /* 粗体 */
                    }
                    
                    /* 购买按钮样式 */
                    .buy-button {
                        background-color: #e64340; /* 红色背景 */
                        color: white; /* 白色文字 */
                        border: none; /* 无边框 */
                        padding: 6px 12px; /* 内边距 */
                        border-radius: 4px; /* 4px圆角 */
                        cursor: pointer; /* 鼠标指针样式 */
                        font-size: 12px; /* 字体大小12px */
                    }
                    
                    /* 购买按钮悬停效果 */
                    .buy-button:hover {
                        background-color: #d43030; /* 深红色背景 */
                        transform: translateY(-2px); /* 向上移动2px */
                    }
                `}
            </style>
            
            {loading ? (
                // 加载状态
                recommendationTypes.map((type, index) => (
                    <div key={index} className="product-card">
                        <h4 className="product-card-title">
                            {type.title}
                        </h4>
                        <div className="product-image-container">
                            <div 
                                className="product-image-background"
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999'
                                }}
                            >
                                加载中...
                            </div>
                        </div>
                        <div className="price-button-container">
                            <span className="product-price">
                                加载中...
                            </span>
                            <button className="buy-button" disabled>
                                立即购买
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                // 真实数据渲染
                recommendationTypes.map((type, index) => {
                    const products = recommendedProducts[type.key] || [];
                    const product = products.length > 0 ? products[0] : null;
                    
                    return (
                        <div 
                            key={index} 
                            className="product-card"
                            onClick={() => product && navigate(`/product/${product.productId}`)}
                            style={{ cursor: product ? 'pointer' : 'default' }}
                        >
                            <h4 className="product-card-title">
                                {type.title}
                            </h4>
                            <div className="product-image-container">
                                {product ? (
                                    <>
                                        {/* 使用商品真实图片 */}
                                        {product.thumbnailUrl ? (
                                            <img 
                                                src={`http://localhost:8081${product.thumbnailUrl}?t=${new Date().getTime()}`}
                                                alt={product.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20150%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23f5f5f5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2250%22%20y%3D%2280%22%3E无图片%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                                }}
                                            />
                                        ) : (
                                            <div 
                                                className="product-image-background"
                                                style={{
                                                    backgroundColor: '#f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#999'
                                                }}
                                            >
                                                暂无图片
                                            </div>
                                        )}
                                        {/* 添加推荐类型标签 */}
                                        <div className="product-label">
                                            {type.title}
                                        </div>
                                    </>
                                ) : (
                                    <div 
                                        className="product-image-background"
                                        style={{
                                            backgroundColor: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#999'
                                        }}
                                    >
                                        暂无商品
                                    </div>
                                )}
                            </div>
                            
                            {/* 商品名称显示 */}
                            {product && (
                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '14px',
                                    color: '#333',
                                    textAlign: 'center',
                                    height: '40px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {product.name}
                                </div>
                            )}
                            <div className="price-button-container">
                                {product ? (
                                    <>
                                        <span className="product-price">
                                            ¥{product.price}
                                        </span>
                                        <button className="buy-button">
                                            立即购买
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="product-price">
                                            暂无价格
                                        </span>
                                        <button className="buy-button" disabled>
                                            立即购买
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default RecommendedProductsSection;

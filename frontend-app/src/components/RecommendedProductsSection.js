import React from 'react';

const RecommendedProductsSection = () => {
    // 价格生成函数
    const generatePrice = (itemName) => {
        const hash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash % 1000) + 100; // 价格范围 100-1100
    };

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
            
            {['热门推荐', '新品上市', '限时特惠', '爆款热销'].map((title, index) => (
                <div key={index} className="product-card">
                    <h4 className="product-card-title">
                        {title}
                    </h4>
                    <div className="product-image-container">
                        {/* 使用背景图方式展示占位图片 */}
                        <div 
                            className="product-image-background"
                            style={{
                                backgroundImage: `url(https://via.placeholder.com/300x200?text=${encodeURIComponent(title)})`
                            }}
                        />
                        {/* 添加文字标签 */}
                        <div className="product-label">
                            {title}
                        </div>
                    </div>
                    <div className="price-button-container">
                        <span className="product-price">
                            ¥{generatePrice(title)}
                        </span>
                        <button className="buy-button">
                            立即购买
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecommendedProductsSection;

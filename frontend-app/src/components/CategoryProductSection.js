import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8081/api';

const CategoryProductSection = ({ category }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取分类下的商品数据
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!category || !category.mainId) {
        return;
      }

      setLoading(true);
      try {
        // 调用后端API获取该分类下的商品
        const response = await axios.get(`${API_BASE_URL}/products`, {
          params: {
            mainId: category.mainId,
            page: 1,
            size: 4 // 每个主分类只显示4个商品
          }
        });
        
        if (response.data.code === 200 && response.data.data) {
          const productList = response.data.data.records || [];
          setProducts(productList);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('获取分类商品失败:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  return (
    <div className="category-product-section">
      <style>
        {`
          /* 重置可能影响商品卡片的全局样式 */
          .category-product-section * {
            box-sizing: border-box;
          }
          
          /* 确保网格项目不受外部CSS影响 */
          .category-product-section .product-grid > * {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .category-product-section .product-grid > .product-item {
            padding: 12px !important;
          }
          
          /* 分类商品区域容器 */
          .category-product-section {
            margin-bottom: 30px; /* 底部外边距 */
            width: 100%; /* 宽度100% */
            max-width: 100%; /* 最大宽度限制 */
            overflow: hidden; /* 防止内容溢出 */
            box-sizing: border-box; /* 包含padding和border */
            padding: 0; /* 确保无内边距 */
          }
          
          /* 标题和更多按钮容器 */
          .section-header {
            display: flex; /* 弹性布局 */
            justify-content: space-between; /* 两端对齐 */
            align-items: center; /* 垂直居中 */
            margin-bottom: 20px; /* 底部外边距 */
            width: 100%; /* 确保宽度100% */
            padding: 0; /* 无内边距 */
          }
          
          /* 分类标题样式 */
          .category-title {
            font-size: 25px; /* 字体大小 */
            font-weight: bold; /* 粗体 */
            color: #333; /* 文字颜色 */
            margin: 0; /* 无外边距 */
          }
          
          /* 更多按钮样式 */
          .more-button {
            background: none; /* 无背景 */
            border: none; /* 无边框 */
            color: #505050; /* 文字颜色 */
            font-size: 20px; /* 字体大小 */
            cursor: pointer; /* 鼠标指针样式 */
            text-decoration: none; /* 无下划线 */
            display: flex; /* 弹性布局 */
            align-items: center; /* 垂直居中 */
            gap: 4px; /* 子元素间距 */
            padding: 4px; /* 内边距 */
            transition: color 0.3s ease, background-color 0.3s ease; /* 过渡动画 */
          }
          
          /* 更多按钮悬停效果 */
          .more-button:hover {
            color: #e68b40; /* 悬停时文字颜色 */
          }
          
          /* 更多按钮图标容器 */
          .more-button-icon {
            width: 20px; /* 宽度 */
            height: 20px; /* 高度 */
            border-radius: 50%; /* 圆形 */
            background-color: rgb(161,160,160); /* 背景颜色 */
            display: flex; /* 弹性布局 */
            align-items: center; /* 垂直居中 */
            justify-content: center; /* 水平居中 */
            color: white; /* 文字颜色 */
            font-size: 12px; /* 字体大小 */
            font-weight: bold; /* 粗体 */
            transition: background-color 0.3s ease; /* 背景颜色过渡动画 */
          }
          
          /* 商品网格容器 */
          .product-grid {
            display: grid !important; /* 网格布局 */
            grid-template-columns: repeat(4, 1fr) !important; /* 4列等宽布局 */
            grid-template-rows: 300px !important; /* 固定行高300px */
            gap: 20px !important; /* 网格间距调整为20px */
            margin: 0 !important; /* 移除负边距，避免超出容器 */
            width: 100% !important; /* 确保不超出父容器 */
            box-sizing: border-box !important; /* 包含padding和border */
            padding: 0 !important; /* 确保无内边距 */
          }
          
          /* 商品项容器 */
          .product-item {
            padding: 12px !important; /* 内边距 */
            border: none !important; /* 无边框 */
            border-radius: 8px !important; /* 8px圆角 */
            transition: transform 0.2s ease, box-shadow 0.2s ease; /* 变换和阴影过渡效果 */
            cursor: pointer; /* 鼠标指针样式 */
            background: white !important; /* 白色背景 */
            box-shadow: 0 1px 4px rgba(0,0,0,0.1) !important; /* 阴影效果 */
            width: 100% !important; /* 固定宽度 */
            height: 300px !important; /* 固定高度 */
            min-height: 300px !important; /* 最小高度 */
            max-height: 300px !important; /* 最大高度 */
            box-sizing: border-box !important; /* 包含padding和border */
            display: flex !important; /* 弹性布局 */
            flex-direction: column !important; /* 垂直排列 */
            justify-content: space-between !important; /* 均匀分布空间 */
            overflow: hidden !important; /* 防止内容溢出 */
          }
          
          /* 商品项悬停效果 */
          .product-item:hover {
            transform: translateY(-2px); /* 向上移动2px */
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); /* 阴影加深 */
          }
          
          /* 商品图片容器 */
          .product-image-container {
            width: 100% !important; /* 宽度100% */
            height: 160px !important; /* 固定高度160px */
            min-height: 160px !important; /* 最小高度 */
            max-height: 160px !important; /* 最大高度 */
            background-color: #f9f9f9 !important; /* 背景颜色 */
            border-radius: 8px !important; /* 8px圆角 */
            display: flex !important; /* 弹性布局 */
            align-items: center !important; /* 垂直居中 */
            justify-content: center !important; /* 水平居中 */
            margin-bottom: 12px !important; /* 底部外边距 */
            overflow: hidden !important; /* 溢出隐藏 */
            flex-shrink: 0 !important; /* 不缩小 */
          }
          
          /* 商品图片背景 */
          .product-image {
            width: 100%; /* 宽度100% */
            height: 100%; /* 高度100% */
            background-size: cover; /* 背景覆盖 */
            background-position: center; /* 背景居中 */
            background-repeat: no-repeat; /* 背景不重复 */
          }
          
          /* 商品名称样式 */
          .product-name {
            font-size: 14px !important; /* 字体大小 */
            color: #333 !important; /* 文字颜色 */
            font-weight: 500 !important; /* 字重 */
            margin: 0 !important; /* 外边距 */
            height: 50px !important; /* 固定高度 */
            min-height: 50px !important; /* 最小高度 */
            max-height: 50px !important; /* 最大高度 */
            display: flex !important; /* 弹性布局 */
            align-items: center !important; /* 垂直居中 */
            justify-content: center !important; /* 水平居中 */
            overflow: hidden !important; /* 溢出隐藏 */
            position: relative !important; /* 相对定位 */
            flex-shrink: 0 !important; /* 不缩小 */
          }
          
          /* 商品名称内容容器 */
          .product-name-content {
            white-space: normal; /* 允许换行 */
            padding: 0 10px; /* 左右内边距 */
            width: 100%; /* 宽度100% */
            text-align: center; /* 文本居中 */
            word-wrap: break-word; /* 长单词换行 */
            overflow-wrap: break-word; /* 溢出换行 */
            line-height: 1.2; /* 行高 */
          }
          
          /* 商品价格容器样式 */
          .product-price-container {
            text-align: center !important; /* 文本居中 */
            height: 60px !important; /* 固定高度 */
            min-height: 60px !important; /* 最小高度 */
            max-height: 60px !important; /* 最大高度 */
            display: flex !important; /* 弹性布局 */
            flex-direction: column !important; /* 垂直方向 */
            align-items: center !important; /* 水平居中 */
            justify-content: center !important; /* 垂直居中 */
            flex-shrink: 0 !important; /* 不缩小 */
            margin-top: 0 !important; /* 顶部边距 */
          }
          
          /* 商品价格样式 */
          .product-price {
            font-size: 17px; /* 字体大小 */
            color: #e64340; /* 红色文字 */
            margin: 0; /* 无外边距 */
            font-weight: bold; /* 粗体 */
            display: block; /* 块级元素 */
          }
          
          /* 市场价样式 */
          .market-price {
            font-size: 13px; /* 字体大小 */
            color: #999; /* 灰色文字 */
            text-decoration: line-through; /* 删除线 */
            margin-left: 8px; /* 左边距 */
          }
          
          /* 加载状态样式 */
          .loading-item {
            opacity: 0.7 !important; /* 半透明效果 */
            pointer-events: none !important; /* 禁用鼠标事件 */
            height: 300px !important; /* 与正常项目相同的高度 */
            min-height: 300px !important;
            max-height: 300px !important;
          }
          
          .loading-placeholder {
            background-color: #f0f0f0; /* 占位背景 */
            position: relative; /* 相对定位 */
            overflow: hidden; /* 溢出隐藏 */
          }
          
          .loading-placeholder::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: loading 1.5s infinite;
          }
          
          .loading-text {
            color: #999;
            font-size: 12px;
            text-align: center;
            line-height: 120px;
          }
          
          .loading-placeholder-text {
            height: 16px;
            background-color: #f0f0f0;
            border-radius: 4px;
            margin: 4px 0;
            position: relative;
            overflow: hidden;
          }
          
          .loading-placeholder-text::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: loading 1.5s infinite;
          }
          
          @keyframes loading {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          /* 无商品消息样式 */
          .no-products-message {
            grid-column: 1 / -1; /* 占满整行 */
            text-align: center; /* 文本居中 */
            padding: 40px 20px; /* 内边距 */
            color: #999; /* 文字颜色 */
            font-size: 16px; /* 字体大小 */
          }
        `}
      </style>
      
      {/* 标题 + 查看更多 */}
      <div className="section-header">
        <h3 className="category-title">
          {category.name}
        </h3>
        <button
          className="more-button"
          onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
        >
          查看更多
          {/* 使用圆形背景 + > 图标 */}
          <span className="more-button-icon">&gt;</span>
        </button>
      </div>

      {/* 商品网格 - 显示真实商品数据 */}
      <div className="product-grid">
        {loading ? (
          /* 加载状态 */
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="product-item loading-item">
              <div className="product-image-container loading-placeholder">
                <div className="loading-text">加载中...</div>
              </div>
              <div className="product-name loading-placeholder-text"></div>
              <div className="product-price loading-placeholder-text"></div>
            </div>
          ))
        ) : products.length > 0 ? (
          /* 真实商品数据 */
          products.map((product) => (
            <div 
              key={product.productId} 
              className="product-item"
              onClick={() => navigate(`/product/${product.productId}`)}
            >
              {/* 商品图片 */}
              <div className="product-image-container">
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
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22160%22%20height%3D%22160%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20160%20160%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22160%22%20height%3D%22160%22%20fill%3D%22%23f5f5f5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2250%22%20y%3D%2280%22%3E无图片%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
                  />
                ) : (
                  <div 
                    className="product-image"
                    style={{
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '14px'
                    }}
                  >
                    暂无图片
                  </div>
                )}
              </div>

              {/* 商品名称 - 正常显示 */}
              <div className="product-name">
                <div 
                  className="product-name-content"
                  title={product.name}
                >
                  {product.name}
                </div>
              </div>

              {/* 商品价格 - 居中显示 */}
              <div className="product-price-container">
                <span className="product-price">¥{product.price}</span>
                {product.marketPrice && product.marketPrice > product.price && (
                  <span className="market-price">¥{product.marketPrice}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          /* 无商品状态 */
          <div className="no-products-message">
            <p>该分类暂无商品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductSection;

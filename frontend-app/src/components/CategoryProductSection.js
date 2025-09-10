import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryProductSection = ({ category }) => {
  const navigate = useNavigate();

  // 获取该分类下的所有三级商品
  const allItems = category.subcategories.flatMap(sub =>
    sub.items.flatMap(item => 
      item.children.map(child => ({
        name: child,
        parentId: item.id,
        parentName: item.name,
        category: category.name
      }))
    )
  );

  // 为每个商品生成模拟价格
  const generatePrice = (itemName) => {
    const hash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 1000) + 100; // 价格范围 100-1100
  };

  return (
    <div className="category-product-section">
      <style>
        {`
          /* 分类商品区域容器 */
          .category-product-section {
            margin-bottom: 30px; /* 底部外边距 */
          }
          
          /* 标题和更多按钮容器 */
          .section-header {
            display: flex; /* 弹性布局 */
            justify-content: space-between; /* 两端对齐 */
            align-items: center; /* 垂直居中 */
            margin-bottom: 15px; /* 底部外边距 */
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
            display: grid; /* 网格布局 */
            grid-template-columns: repeat(5, 1fr); /* 5列等宽布局 */
            gap: 16px; /* 网格间距 */
            margin: 0 -8px; /* 左右外边距 */
          }
          
          /* 商品项容器 */
          .product-item {
            padding: 8px; /* 内边距 */
            border: none; /* 无边框 */
            border-radius: 8px; /* 8px圆角 */
            transition: transform 0.2s ease, box-shadow 0.2s ease; /* 变换和阴影过渡效果 */
            cursor: pointer; /* 鼠标指针样式 */
            background: white; /* 白色背景 */
            box-shadow: 0 1px 4px rgba(0,0,0,0.1); /* 阴影效果 */
          }
          
          /* 商品项悬停效果 */
          .product-item:hover {
            transform: translateY(-2px); /* 向上移动2px */
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); /* 阴影加深 */
          }
          
          /* 商品图片容器 */
          .product-image-container {
            width: 100%; /* 宽度100% */
            height: 120px; /* 高度120px */
            background-color: #f9f9f9; /* 背景颜色 */
            border-radius: 8px; /* 8px圆角 */
            display: flex; /* 弹性布局 */
            align-items: center; /* 垂直居中 */
            justify-content: center; /* 水平居中 */
            margin-bottom: 8px; /* 底部外边距 */
            overflow: hidden; /* 溢出隐藏 */
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
            font-size: 16px; /* 字体大小 */
            color: #333; /* 文字颜色 */
            font-weight: 500; /* 字重 */
            margin: 0 0 4px 0; /* 外边距 */
            white-space: nowrap; /* 不换行 */
            overflow: hidden; /* 溢出隐藏 */
            text-overflow: ellipsis; /* 省略号 */
            text-align: center; /* 文本居中 */
          }
          
          /* 商品价格样式 */
          .product-price {
            font-size: 17px; /* 字体大小 */
            color: #e64340; /* 红色文字 */
            margin: 0; /* 无外边距 */
            font-weight: bold; /* 粗体 */
            text-align: center; /* 文本居中 */
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
          onClick={() => navigate(`/category/${category.id}/products`)}
        >
          查看更多
          {/* 使用圆形背景 + > 图标 */}
          <span className="more-button-icon">></span>
        </button>
      </div>

      {/* 商品网格 - 每行最多5个，只显示前10个 */}
      <div className="product-grid">
        {allItems.slice(0, 10).map((item, index) => (
          <div 
            key={index} 
            className="product-item"
            onClick={() => navigate(`/product/${item.parentId}-${index}`)}
          >
            {/* 商品图片 */}
            <div className="product-image-container">
              {/* 在实际应用中，这里会是真实的图片 */}
              <div 
                className="product-image"
                style={{
                  backgroundImage: `url(https://via.placeholder.com/120x120?text=${encodeURIComponent(item.name)})`
                }}
              />
            </div>

            {/* 商品名称 - 居中显示 */}
            <p className="product-name">
              {item.name}
            </p>

            {/* 商品价格 - 居中显示 */}
            <p className="product-price">
              ¥{generatePrice(item.name)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProductSection;

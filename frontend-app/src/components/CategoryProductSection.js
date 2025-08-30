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
    <div style={{
      marginBottom: '30px'
    }}>
      {/* 标题 + 查看更多 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          fontSize: '25px',
          fontWeight: 'bold',
          color: '#333',
          margin: 0
        }}>
          {category.name}
        </h3>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#505050',
            fontSize: '20px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            transition: 'color 0.3s ease, background-color 0.3s ease' // 添加过渡动画
          }}
          onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e68b40';
              e.currentTarget.querySelector('span').style.backgroundColor = '#e68b40';
          }}
          onMouseLeave={(e) => {
              e.currentTarget.style.color = '#505050';
              e.currentTarget.querySelector('span').style.backgroundColor = '#a1a0a0';
          }}
          onClick={() => navigate(`/category/${category.id}/products`)}
        >
          查看更多
            {/* 使用圆形背景 + > 图标 */}
            <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgb(161,160,160)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease' // 圆形图标也加过渡
            }}>></span>
        </button>
      </div>

      {/* 商品网格 - 每行最多5个，只显示前10个 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        margin: '0 -8px'
      }}>
        {allItems.slice(0, 10).map((item, index) => (
          <div 
            key={index} 
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              background: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              '@media (maxWidth: 768px)': {
                padding: '4px'
              }
            }} 
            onClick={() => navigate(`/product/${item.parentId}-${index}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
            }}
          >
            {/* 商品图片 */}
            <div style={{
              width: '100%',
              height: '120px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              overflow: 'hidden'
            }}>
              {/* 在实际应用中，这里会是真实的图片 */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(https://via.placeholder.com/120x120?text=${encodeURIComponent(item.name)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }} />
            </div>

            {/* 商品名称 */}
            <p style={{
              fontSize: '14px',
              color: '#333',
              fontWeight: '500',
              margin: '0 0 4px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item.name}
            </p>

            {/* 商品价格 */}
            <p style={{
              fontSize: '12px',
              color: '#e64340',
              margin: '0',
              fontWeight: 'bold'
            }}>
              ¥{generatePrice(item.name)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProductSection;

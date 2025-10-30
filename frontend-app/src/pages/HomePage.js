import React, {useEffect, useState} from 'react';
import CategoryProductSection from '../components/CategoryProductSection';
import RightSidebar from '../components/RightSidebar';
import MainContentSection from '../components/MainContentSection';
import RecommendedProductsSection from '../components/RecommendedProductsSection';
import FooterSection from '../components/FooterSection';
import axios from 'axios';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8081/api';

function HomePage() {
    // 响应式处理
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    // 分类数据
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 获取分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/categories`);
                
                if (response.data.code === 200 && response.data.data) {
                    setCategories(response.data.data);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error('获取分类数据失败:', error);
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const getGridColumns = () => {
        if (windowWidth < 576) return 'repeat(2, 1fr)';  // 超小屏显示2列
        if (windowWidth < 768) return 'repeat(3, 1fr)';  // 小屏显示3列
        if (windowWidth < 992) return 'repeat(4, 1fr)';  // 中屏显示4列
        return 'repeat(5, 1fr)';                         // 大屏显示5列
    };

    return (
        <div className="content">
            <div style={{
                backgroundColor: '#fafafa',
                padding: '40px 250px',
            }}>
                {/* 右侧边功能信息栏 */}
                <RightSidebar />
                {/* 主要内容区域 */}
                <MainContentSection />
                {/* 推荐商品区域 - 使用占位图片和价格生成函数 */}
                <RecommendedProductsSection />
            </div>

            <div style={{
                backgroundColor: 'rgb(239,239,239)',
                padding: '30px 0',
            }}>
                {/* 商品系列展示 - 从数据库获取真实数据 */}
                <div style={{
                    padding: '0 250px'
                }}>
                    <style>
                        {`
                            /* 响应式布局调整 */
                            @media (max-width: 576px) {
                                .product-grid {
                                    grid-template-columns: repeat(2, 1fr) !important;
                                }
                            }
                            @media (min-width: 576px) and (max-width: 768px) {
                                .product-grid {
                                    grid-template-columns: repeat(3, 1fr) !important;
                                }
                            }
                            @media (min-width: 768px) and (max-width: 992px) {
                                .product-grid {
                                    grid-template-columns: repeat(4, 1fr) !important;
                                }
                            }
                            @media (min-width: 992px) {
                                .product-grid {
                                    grid-template-columns: repeat(5, 1fr) !important;
                                }
                            }
                            
                            .loading-categories {
                                text-align: center;
                                padding: 40px 0;
                                color: #666;
                                font-size: 16px;
                            }
                        `}
                    </style>
                    
                    <div className="homepage-categories">
                        {categoriesLoading ? (
                            <div className="loading-categories">
                                正在加载分类数据...
                            </div>
                        ) : categories.length > 0 ? (
                            categories.map(category => (
                                <CategoryProductSection 
                                    key={category.mainId} 
                                    category={category} 
                                />
                            ))
                        ) : (
                            <div className="loading-categories">
                                暂无分类数据
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* 底部导航栏 */}
            <FooterSection />
        </div>
    );
}

export default HomePage;

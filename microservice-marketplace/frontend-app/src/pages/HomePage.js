function HomePage() {
    // 产品分类数据状态
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 定义API基础URL
    const API_BASE_URL = 'http://localhost:8081/api';

    // 获取分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // 获取主分类
                const categoryResponse = await axios.get(`${API_BASE_URL}/products/categories`);
                const categoryData = categoryResponse.data.data || [];
                
                // 为每个主分类获取子分类
                const categoriesWithSubcategories = await Promise.all(
                    categoryData.map(async (categoryName, index) => {
                        // 获取子分类
                        const subcategoryResponse = await axios.get(`${API_BASE_URL}/products/subcategories?category=${categoryName}`);
                        const subcategories = subcategoryResponse.data.data || [];
                        
                        // 构造符合前端结构的数据
                        return {
                            id: index + 1,
                            name: categoryName,
                            image: `/images/${categoryName}.jpg`,
                            subcategories: [
                                {
                                    id: (index + 1) * 10 + 1,
                                    name: '商品分类',
                                    items: subcategories.map((sub, subIndex) => ({
                                        id: (index + 1) * 100 + subIndex + 1,
                                        name: sub,
                                        children: [] // 这里可以进一步扩展获取具体商品
                                    }))
                                }
                            ]
                        };
                    })
                );
                
                setCategories(categoriesWithSubcategories);
                setLoading(false);
            } catch (error) {
                console.error('获取分类数据失败:', error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 响应式处理
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // eslint-disable-next-line no-unused-vars
    const getGridColumns = () => {
        if (windowWidth < 576) return 'repeat(2, 1fr)';  // 超小屏显示2列
        if (windowWidth < 768) return 'repeat(3, 1fr)';  // 小屏显示3列
        if (windowWidth < 992) return 'repeat(4, 1fr)';  // 中屏显示4列
        return 'repeat(5, 1fr)';                         // 大屏显示5列
    };

    if (loading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="content">
            <div style={{
                backgroundColor: '#fafafa',
                padding: '40px 250px',
            }}>
                {/* 右侧边功能信息栏 */}
                <RightSidebar />
                {/* 主要内容区域 */}
                <MainContentSection categories={categories} />
                {/* 推荐商品区域 - 使用占位图片和价格生成函数 */}
                <RecommendedProductsSection />
            </div>

            <div style={{
                backgroundColor: 'rgb(239,239,239)',
                padding: '30px 0',
                marginBottom: '20px'
            }}>
                {/* 商品系列展示 - 小米商城风格 */}
                <div style={{
                    padding: '0 250px'
                }}>
                    <style>
                        {`
                            @media (max-width: 576px) {
                                .category-grid {
                                    grid-template-columns: repeat(2, 1fr) !important;
                                }
                            }
                            @media (min-width: 576px) and (max-width: 768px) {
                                .category-grid {
                                    grid-template-columns: repeat(3, 1fr) !important;
                                }
                            }
                            @media (min-width: 768px) and (max-width: 992px) {
                                .category-grid {
                                    grid-template-columns: repeat(4, 1fr) !important;
                                }
                            }
                            @media (min-width: 992px) {
                                .category-grid {
                                    grid-template-columns: repeat(5, 1fr) !important;
                                }
                            }
                        `}
                    </style>
                    {categories.map(category => (
                        <CategoryProductSection key={category.id} category={category}/>
                    ))}
                </div>
            </div>
            {/* 底部导航栏 */}
            <FooterSection />
        </div>
    );
}
function HomePage() {

    if (loading || categories.length === 0) {
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
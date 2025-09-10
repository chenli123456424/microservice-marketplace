return (
    <div style={{ display: 'block', visibility: 'visible' }}>
        {/* 标题 + 查看更多 */}
        <div className="sp-section-header">
            <h3 className="sp-category-title">
                {category.name}
            </h3>
            <button
                className="sp-more-button"
                onClick={() => navigate(`/category/${category.id}/products`)}
            >
                查看更多
                {/* 使用圆形背景 + > 图标 */}
                <span className="sp-more-button-icon">></span>
            </button>
        </div>

        {/* 商品网格 - 每行最多5个，只显示前10个 */}
        <div className="sp-product-grid">
            {allItems.slice(0, 10).map((item, index) => (
                <div
                    key={index}
                    className="sp-product-item"
                    onClick={() => navigate(`/product/${item.parentId}-${index}`)}
                >
                    {/* 商品图片 */}
                    <div className="sp-product-image-container">
                        {/* 在实际应用中，这里会是真实的图片 */}
                        <div
                            className="sp-product-image"
                            style={{
                                backgroundImage: `url(https://via.placeholder.com/120x120?text=${encodeURIComponent(item.name)})`
                            }}
                        />
                    </div>

                    {/* 商品名称 - 居中显示 */}
                    <p className="sp-product-name">
                        {item.name}
                    </p>

                    {/* 商品价格 - 居中显示 */}
                    <p className="sp-product-price">
                        ¥{generatePrice(item.name)}
                    </p>
                </div>
            ))}
        </div>
    </div>
);
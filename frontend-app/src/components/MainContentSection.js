import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const MainContentSection = ({categories}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [activeItem, setActiveItem] = useState(null);
    const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0].name : '');

    const intervalRef = useRef(null);
    const navigate = useNavigate();

    // 轮播图图片列表（后续可扩展）
    const slides = [
        '/images/全屋家具.jpg',
        '/images/家装建材.png', // 示例
        '/images/厨卫用品.png', // 示例
        '/images/门窗五金.png', // 示例
        '/images/灯具照明.png'  // 示例
    ];

    // 自动轮播：每5秒切换一张
    useEffect(() => {
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, slides.length]);

    useEffect(() => {
        if (hoveredSubcategory && hoveredSubcategory.items.length > 0) {
            setActiveItem(hoveredSubcategory.items[0].name); // 默认选中第一个二级分类
        }
    }, [hoveredSubcategory]);

    // 获取当前激活的子分类
    const getCurrentSubcategory = () => {
        if (!hoveredSubcategory || !activeItem) return null;
        return hoveredSubcategory.items.find(item => item.name === activeItem);
    };

    const currentSubcategory = getCurrentSubcategory();

    // 处理商品点击跳转到筛选页面 - 修改此函数以正确传递筛选参数
    const handleProductClick = (categoryName, subCategoryName) => {
        // 跳转到商品筛选页面，并传递分类参数
        navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subCategoryName)}`);
    };

    // 当分类改变时更新hoveredSubcategory
    useEffect(() => {
        if (categories.length > 0 && activeCategory) {
            const category = categories.find(cat => cat.name === activeCategory);
            if (category && category.subcategories && category.subcategories.length > 0) {
                // 不再默认设置hoveredSubcategory，只在用户悬停时设置
                // setHoveredSubcategory(category.subcategories[0]);
            }
        }
    }, [activeCategory, categories]);

    return (
        <div className="main-content-container"
             onMouseEnter={() => setIsPaused(true)} // 鼠标悬停时暂停
             onMouseLeave={() => setIsPaused(false)} // 鼠标离开时恢复
        >
            <style>
                {`
                    /* 主内容容器样式 */
                    .main-content-container {
                        position: relative;
                        width: 100%;
                        height: 600px;
                        overflow: hidden;
                    }
                    
                    /* 轮播图容器 */
                    .carousel-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 110%;
                        z-index: 1;
                        background: #f0f0f0;
                    }
                    
                    /* 轮播图图片 */
                    .carousel-image {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        opacity: 0;
                        transition: opacity 1s ease-in-out;
                    }
                    
                    /* 当前活动图片 */
                    .carousel-image.active {
                        opacity: 1;
                    }
                    
                    /* 轮播图导航按钮 */
                    .carousel-nav-button {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(0, 0, 0, 0.3);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                        cursor: pointer;
                        z-index: 11;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    /* 左侧导航按钮 */
                    .carousel-nav-button.prev {
                        left: 280px;
                    }
                    
                    /* 右侧导航按钮 */
                    .carousel-nav-button.next {
                        right: 20px;
                    }
                    
                    /* 轮播图指示器容器 */
                    .carousel-indicators {
                        position: absolute;
                        bottom: 20px;
                        right: 20px;
                        display: flex;
                        gap: 8px;
                        z-index: 10;
                    }
                    
                    /* 轮播图指示器按钮 */
                    .indicator-button {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background-color: #ccc;
                        border: none;
                        cursor: pointer;
                        transition: background-color 0.3s;
                    }
                    
                    /* 活动指示器按钮 */
                    .indicator-button.active {
                        background-color: #e64340;
                    }
                    
                    /* 左侧导航区域 */
                    .left-navigation {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 20%;
                        height: 100%;
                        padding: 15px;
                        transition: all 0.3s ease;
                        z-index: 2;
                        overflow: hidden;
                    }
                    
                    /* 左侧导航区域背景 */
                    .left-navigation-bg {
                        background-color: rgba(76,76,76,0.22);
                    }
                    
                    /* 左侧导航区域悬停背景 */
                    .left-navigation-bg.hovered {
                        background-color: rgba(76,76,76,0.44);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        border-right: 1px solid #ccc;
                    }
                    
                    /* 分类标题 */
                    .cbl-category-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 15px;
                        color: #fff;
                        transition: opacity 0.3s;
                    }
                    
                    /* 分类标题悬停效果 */
                    .category-title.hovered {
                        opacity: 1;
                    }
                    
                    /* 分类标题默认效果 */
                    .category-title:not(.hovered) {
                        opacity: 0.8;
                    }
                    
                    /* 分类列表容器 */
                    .category-list {
                        max-height: calc(100% - 50px);
                        overflow-y: auto;
                        scrollbar-width: thin;
                        scrollbar-color: #ccc transparent;
                    }
                    
                    /* 分类项容器 */
                    .category-item {
                        margin-bottom: 15px;
                    }
                    
                    /* 分类按钮 */
                    .category-button {
                        width: 100%;
                        padding: 12px 15px;
                        text-align: left;
                        cursor: pointer;
                        font-size: 14px;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 5px;
                        box-sizing: border-box;
                        min-height: 40px;
                    }
                    
                    /* 分类按钮默认样式 */
                    .category-button.default {
                        background: transparent;
                        color: #fff;
                        font-weight: normal;
                        border: 1px solid transparent;
                    }
                    
                    /* 分类按钮激活样式 */
                    .category-button.active {
                        background: #e68b40;
                        color: white;
                        font-weight: bold;
                        border: 1px solid #e68b40;
                    }
                    
                    /* 分类按钮箭头 */
                    .category-arrow {
                        font-size: 12px;
                        margin-left: 8px;
                    }
                    
                    /* 商品展示窗口 */
                    .cbl-product-window {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 60%;
                        height: 100%;
                        background-color: white;
                        padding: 20px;
                        z-index: 100;
                        overflow: auto;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-left: 1px solid #ddd;
                    }
                    
                    /* 商品窗口标题 */
                    .cbl-product-window-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 15px;
                        color: #333;
                    }
                    
                    /* 商品网格容器 */
                    .cbl-product-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        width: 100%;
                    }
                    
                    /* 商品项 */
                    .cbl-product-item {
                        text-align: center;
                        padding: 10px;
                        border: 1px solid #eee;
                        border-radius: 8px;
                        transition: all 0.3s ease;
                        cursor: pointer;
                        background-color: #fff;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        flex: 1;
                        min-width: 150px;
                    }
                    
                    /* 商品项悬停效果 */
                    .cbl-product-item:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    }
                    
                    /* 商品图片容器 */
                    .cbl-product-image {
                        width: 100%;
                        height: 100px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        border-radius: 4px;
                        margin: 0 auto 8px;
                    }
                    
                    /* 商品名称 */
                    .cbl-product-name {
                        font-size: 14px;
                        color: #333;
                        display: block;
                        font-weight: 500;
                    }
                `}
            </style>

            {/* 轮播图区域（全屏覆盖） - 叠化版本 */}
            <div className="carousel-container">
                {slides.map((slide, index) => (
                    <img
                        key={index}
                        src={slide}
                        alt={`轮播图 ${index + 1}`}
                        loading="lazy"
                        className={`carousel-image ${index === currentSlide ? 'active' : ''}`}
                    />
                ))}
            </div>

            {/* 左右箭头按钮 */}
            <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="carousel-nav-button prev"
            >
                &#8249;
            </button>
            <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="carousel-nav-button next"
            >
                &#8250;
            </button>

            {/* 轮播指示器（右下角） */}
            <div className="carousel-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`indicator-button ${currentSlide === index ? 'active' : ''}`}
                    />
                ))}
            </div>

            {/* 左侧导航区域 */}
            <div
                className={`left-navigation ${isHovered ? 'left-navigation-bg hovered' : 'left-navigation-bg'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    // 延迟隐藏商品窗口，给用户时间移动到窗口上
                    setTimeout(() => {
                        if (!hoveredSubcategory) {
                            setIsHovered(false);
                        }
                    }, 100);
                }}
            >
                <h3 className={`cbl-category-title ${isHovered ? 'hovered' : ''}`}>
                    产品分类
                </h3>

                <div className="category-list">
                    {categories.map(category => (
                        <div key={category.id} className="category-item">
                            <button
                                className={`category-button ${activeCategory === category.name ? 'active' : 'default'}`}
                                onClick={() => {
                                    setActiveCategory(category.name);
                                }}
                                onMouseEnter={() => {
                                    if (activeCategory !== category.name) {
                                        setActiveCategory(category.name);
                                    }
                                    // 当鼠标悬停在分类上时显示商品窗口
                                    if (category.subcategories && category.subcategories.length > 0) {
                                        setHoveredSubcategory(category.subcategories[0]);
                                    }
                                }}
                            >
                                {category.name}
                                <span className="category-arrow">></span>
                            </button>

                        </div>
                    ))}
                </div>
            </div>

            {/* 商品展示窗口（悬停时显示） */}
            {hoveredSubcategory && (
                <div
                    className="cbl-product-window"
                    onMouseEnter={() => {
                        // 鼠标进入窗口时保持窗口显示
                        setHoveredSubcategory(hoveredSubcategory);
                    }}
                    onMouseLeave={() => {
                        // 鼠标离开窗口时隐藏窗口
                        setHoveredSubcategory(null);
                        setIsHovered(false);
                    }}
                >
                    {/* 一级标题 */}
                    <h4 className="cbl-product-window-title">
                        {hoveredSubcategory.name}
                    </h4>

                    {/* 三级商品 - 图片 + 名称，一行两个 */}
                    <div className="cbl-product-grid">
                        {hoveredSubcategory.items.map((item) => {
                            // 构造图片 URL（示例：https://via.placeholder.com/100x100?text=沙发）
                            const imageUrl = `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`;
                            return (
                                <div
                                    key={item.id}
                                    className="cbl-product-item"
                                    onClick={() => handleProductClick(activeCategory, item.name)}
                                >
                                    {/* 图片 */}
                                    <div
                                        className="cbl-product-image"
                                        style={{
                                            backgroundImage: `url(${imageUrl})`
                                        }}
                                    />
                                    {/* 标题 */}
                                    <span className="cbl-product-name">
                                        {item.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainContentSection;

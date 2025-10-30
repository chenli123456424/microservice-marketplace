import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const MainContentSection = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [activeCategory, setActiveCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [isMouseInValidArea, setIsMouseInValidArea] = useState(false);
    
    // 引用DOM元素
    const leftNavigationRef = useRef(null);
    const productWindowRef = useRef(null);

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

    // 获取后端分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log('开始请求分类数据...');
                const response = await fetch('http://localhost:8081/api/categories');
                console.log('收到响应:', response);

                // 检查响应状态
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 检查内容类型
                const contentType = response.headers.get('content-type');
                console.log('Content-Type:', contentType);
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.log('响应内容（非JSON）:', text);
                    throw new Error('Response is not JSON');
                }

                const result = await response.json();
                console.log('解析后的JSON数据:', result);

                if (result.code === 200 && result.data && Array.isArray(result.data)) {
                    // 转换后端数据结构为前端所需格式
                    const transformedCategories = result.data.map(mainCategory => {
                        // 打印原始数据结构以调试
                        console.log('主分类原始数据:', mainCategory);
                        
                        return {
                            id: mainCategory.mainId,
                            name: mainCategory.name,
                            subcategories: mainCategory.subCategories ? mainCategory.subCategories.map(subCategory => {
                                // 打印子分类原始数据以调试
                                console.log('子分类原始数据:', subCategory);
                            
                                return {
                                    id: subCategory.subId,
                                    name: subCategory.name,
                                    imageUrl: subCategory.imageUrl, // 添加图片URL
                                    items: []  // 保持空数组，因为不需要具体商品
                                };
                            }) : []
                        };
                    });

                    console.log('转换后的分类数据:', transformedCategories);
                    setCategories(transformedCategories);

                    // 设置默认激活的分类
                    if (transformedCategories.length > 0) {
                        setActiveCategory(transformedCategories[0].name);
                    }
                } else {
                    console.error('API返回错误:', result.message);
                }
            } catch (error) {
                console.error('获取分类数据失败:', error);
            }
        };

        fetchCategories();
    }, []);

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

    // 修改 handleProductClick 函数
    const handleProductClick = (categoryName, subCategoryName) => {
        // 跳转到商品筛选页面，并传递分类参数
        navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subCategoryName)}`);
    };
    
    // 检查鼠标是否在有效区域内
    const checkMousePosition = (e) => {
        // 获取左侧导航和商品窗口的DOM元素
        const leftNavigation = leftNavigationRef.current;
        const productWindow = productWindowRef.current;
        
        if (!leftNavigation && !productWindow) {
            setIsMouseInValidArea(false);
            return;
        }
        
        // 检查鼠标是否在左侧导航或商品窗口内
        const isInLeftNav = leftNavigation && 
            e.clientX >= leftNavigation.getBoundingClientRect().left &&
            e.clientX <= leftNavigation.getBoundingClientRect().right &&
            e.clientY >= leftNavigation.getBoundingClientRect().top &&
            e.clientY <= leftNavigation.getBoundingClientRect().bottom;
            
        const isInProductWindow = productWindow && 
            e.clientX >= productWindow.getBoundingClientRect().left &&
            e.clientX <= productWindow.getBoundingClientRect().right &&
            e.clientY >= productWindow.getBoundingClientRect().top &&
            e.clientY <= productWindow.getBoundingClientRect().bottom;
            
        // 更新鼠标位置状态
        setIsMouseInValidArea(isInLeftNav || isInProductWindow);
        
        // 如果鼠标不在有效区域内，隐藏商品窗口
        if (!(isInLeftNav || isInProductWindow)) {
            setHoveredSubcategory(null);
            setIsHovered(false);
        }
    };
    
    // 添加全局鼠标移动事件监听
    useEffect(() => {
        document.addEventListener('mousemove', checkMousePosition);
        
        return () => {
            document.removeEventListener('mousemove', checkMousePosition);
        };
    }, []);

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
                        left: 290px;
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
                        height: 250px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        border-radius: 4px;
                        margin: 0 auto 8px;
                    }
                    
                    /* 商品名称 */
                    .cbl-product-name {
                        font-size: 15px;
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
                ref={leftNavigationRef}
                className={`left-navigation ${isHovered ? 'left-navigation-bg hovered' : 'left-navigation-bg'}`}
                onMouseEnter={() => {
                    setIsHovered(true);
                    setIsMouseInValidArea(true);
                }}
                onMouseLeave={() => {
                    // 不立即隐藏，让鼠标跟踪逻辑处理
                    setTimeout(() => {
                        if (!isMouseInValidArea) {
                            setIsHovered(false);
                            setHoveredSubcategory(null);
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
                                    // 当鼠标悬停在分类上时显示所有子分类
                                    if (category.subcategories && category.subcategories.length > 0) {
                                        setHoveredSubcategory(category.subcategories);
                                        setIsMouseInValidArea(true);
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
            {hoveredSubcategory && isMouseInValidArea && (
                <div
                    ref={productWindowRef}
                    className="cbl-product-window"
                    onMouseEnter={() => {
                        // 鼠标进入窗口时保持窗口显示
                        setHoveredSubcategory(hoveredSubcategory);
                        setIsMouseInValidArea(true);
                    }}
                    onMouseLeave={() => {
                        // 不立即隐藏，让鼠标跟踪逻辑处理
                        setTimeout(() => {
                            if (!isMouseInValidArea) {
                                setHoveredSubcategory(null);
                                setIsHovered(false);
                            }
                        }, 100);
                    }}
                >
                    {/* 一级标题 */}
                    <h4 className="cbl-product-window-title">
                        {activeCategory}
                    </h4>

                    {/* 显示所有子分类 */}
                    <div className="cbl-product-grid">
                        {hoveredSubcategory.map((subItem) => {
                            // 使用数据库中的图片URL，如果没有则使用占位图
                            const imageUrl = subItem.imageUrl 
                                ? `http://localhost:8081${subItem.imageUrl}`
                                : `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23f5f5f5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2220%22%20y%3D%2250%22%3E${encodeURIComponent(subItem.name)}%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E`;
                            
                            return (
                                <div
                                    key={subItem.id}
                                    className="cbl-product-item"
                                    onClick={() => handleProductClick(activeCategory, subItem.name)}
                                >
                                    {/* 图片 */}
                                    <div
                                        className="cbl-product-image"
                                        style={{
                                            backgroundImage: `url(${imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                        onError={(e) => {
                                            // 如果图片加载失败，使用占位图
                                            const placeholderUrl = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23f5f5f5%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2220%22%20y%3D%2250%22%3E${encodeURIComponent(subItem.name)}%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E`;
                                            e.target.style.backgroundImage = `url(${placeholderUrl})`;
                                        }}
                                    />
                                    {/* 标题 */}
                                    <span className="cbl-product-name">
                                        {subItem.name}
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

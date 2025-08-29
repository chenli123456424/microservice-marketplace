import React, { useState, useEffect, useRef } from 'react';

function HomePage() {
    const [activeCategory, setActiveCategory] = useState('全屋家具');
    const [isHovered, setIsHovered] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [activeItem, setActiveItem] = useState(null);

    const intervalRef = useRef(null);

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

    // 产品分类数据
    const categories = [
        {
            id: 1,
            name: '全屋家具',
            image: '/images/全屋家具.jpg',
            subcategories: [
                {
                    id: 11,
                    name: '空间家具',
                    items: [
                        { id: 111, name: '客厅家具', children: ['沙发', '茶几', '电视柜', '边几', '鞋柜', '玄关柜'] },
                        { id: 112, name: '卧室家具', children: ['床', '床垫', '衣柜', '床头柜', '梳妆台', '休闲椅'] },
                        { id: 113, name: '餐厅家具', children: ['餐桌', '餐椅', '餐边柜', '吧台', '吧椅'] },
                        { id: 114, name: '书房家具', children: ['书桌', '书柜', '电脑椅', '书架'] },
                        { id: 115, name: '儿童房家具', children: ['儿童床', '儿童衣柜', '学习桌椅', '玩具收纳'] }
                    ]
                },
                {
                    id: 12,
                    name: '功能家具',
                    items: [
                        { id: 121, name: '储物家具', children: ['斗柜', '收纳柜', '置物架', '壁架'] },
                        { id: 122, name: '户外家具', children: ['庭院桌椅', '遮阳伞', '躺椅', '户外沙发'] },
                        { id: 123, name: '办公家具', children: ['办公桌', '会议桌', '文件柜', '办公椅'] }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: '家装建材',
            image: '/images/家装建材.jpg',
            subcategories: [
                {
                    id: 21,
                    name: '地面材料',
                    items: [
                        { id: 211, name: '地板', children: ['实木地板', '强化复合地板', '实木复合地板', '竹地板'] },
                        { id: 212, name: '瓷砖/石材', children: ['地砖', '墙砖', '腰线', '花砖', '大理石', '花岗岩'] },
                        { id: 213, name: '地毯', children: ['羊毛地毯', '化纤地毯', '混纺地毯', '塑料地毯'] }
                    ]
                }
            ]
        },
        {
            id: 3,
            name: '厨卫用品',
            image: '/images/厨卫用品.jpg',
            subcategories: [
                {
                    id: 31,
                    name: '厨房设备',
                    items: [
                        { id: 311, name: '橱柜', children: ['整体橱柜', '吊柜', '地柜', '台面'] },
                        { id: 312, name: '厨房电器', children: ['油烟机', '燃气灶', '消毒柜', '洗碗机', '烤箱', '微波炉'] }
                    ]
                }
            ]
        },
        {
            id: 4,
            name: '五金/工具',
            image: '/images/五金工具.jpg',
            subcategories: [
                {
                    id: 41,
                    name: '门窗五金',
                    items: [
                        { id: 411, name: '门锁', children: ['智能门锁', '室内门锁', '防盗门锁'] },
                        { id: 412, name: '合页/滑轨', children: ['门合页', '抽屉滑轨', '移门滑轨'] }
                    ]
                }
            ]
        },
        {
            id: 5,
            name: '灯具照明',
            image: '/images/灯具照明.jpg',
            subcategories: [
                {
                    id: 51,
                    name: '室内灯具',
                    items: [
                        { id: 511, name: '客厅灯', children: ['吊灯', '吸顶灯', '筒灯', '射灯'] },
                        { id: 512, name: '卧室灯', children: ['吸顶灯', '台灯', '壁灯', '夜灯'] }
                    ]
                }
            ]
        },
        {
            id: 6,
            name: '软装配饰',
            image: '/images/软装配饰.jpg',
            subcategories: [
                {
                    id: 61,
                    name: '布艺软装',
                    items: [
                        { id: 611, name: '窗帘/窗纱', children: ['布艺窗帘', '百叶窗', '卷帘', '罗马帘'] },
                        { id: 612, name: '地毯/地垫', children: ['客厅地毯', '卧室地毯', '门垫'] }
                    ]
                }
            ]
        }
    ];

    useEffect(() => {
        if (hoveredSubcategory) {
            setActiveItem(hoveredSubcategory.items[0].name); // 默认选中第一个二级分类
        }
    }, [hoveredSubcategory]);

    return (
        <div className="content">
            {/* 主要内容区域 */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '600px',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setIsPaused(true)} // 鼠标悬停时暂停
            onMouseLeave={() => setIsPaused(false)} // 鼠标离开时恢复
            >
                {/* 轮播图区域（全屏覆盖） - 叠化版本 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '110%',
                    zIndex: 1,
                    background: '#f0f0f0'
                }}>
                    {slides.map((slide, index) => (
                        <img
                            key={index}
                            src={slide}
                            alt={`轮播图 ${index + 1}`}
                            loading="lazy" // 图片懒加载
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: index === currentSlide ? 1 : 0,
                                transition: 'opacity 1s ease-in-out'
                            }}
                        />
                    ))}
                </div>

                {/* 左右箭头按钮 */}
                <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    style={{
                        position: 'absolute',
                        left: '300px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        zIndex: 11,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    &#8249;
                </button>
                <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        zIndex: 11,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    &#8250;
                </button>

                {/* 轮播指示器（右下角） */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10 // 提高 z-index 确保可见
                }}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: currentSlide === index ? '#e64340' : '#ccc',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                            }}
                        />
                    ))}
                </div>

                {/* 左侧导航区域 */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '20%',
                        height: '100%',
                        backgroundColor: isHovered ? 'rgba(76,76,76,0.44)' : 'rgba(76,76,76,0.22)',// 背景颜色
                        padding: '15px',
                        transition: 'all 0.3s ease',
                        zIndex: 2,
                        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                        overflow: 'hidden',
                        borderRight: isHovered ? '1px solid #ccc' : 'none'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: '#fff',
                        opacity: isHovered ? 1 : 0.8,
                        transition: 'opacity 0.3s'
                    }}>
                        产品分类
                    </h3>

                    <div style={{
                        maxHeight: 'calc(100% - 50px)',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#ccc transparent'
                    }}>
                        {categories.map(category => (
                            <div key={category.id} style={{
                                marginBottom: '15px'
                            }}>
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        background: activeCategory === category.name ? '#e68b40' : 'transparent',
                                        color: activeCategory === category.name ? 'white' : '#fff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: activeCategory === category.name ? 'bold' : 'normal',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '5px',
                                        boxSizing: 'border-box',
                                        minHeight: '40px',
                                        border: activeCategory === category.name ? '1px solid #e68b40' : '1px solid transparent'
                                    }}
                                    onClick={() => {
                                        setActiveCategory(category.name);
                                        setHoveredSubcategory(category.subcategories[0]);
                                    }}
                                    onMouseEnter={() => {
                                        if (activeCategory !== category.name) {
                                            setActiveCategory(category.name);
                                        }
                                    }}
                                >
                                    {category.name}
                                    <span style={{fontSize: '12px', marginLeft: '8px'}}>></span>
                                </button>

                            </div>
                        ))}
                    </div>
                </div>

                {/* 商品展示窗口（悬停时显示） */}
                {hoveredSubcategory && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '100%',
                            backgroundColor: 'white',
                            padding: '20px',
                            zIndex: 100,
                            overflow: 'auto',
                            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                            borderLeft: '1px solid #ddd'
                        }}
                        onMouseLeave={() => setHoveredSubcategory(null)}
                    >
                        {/* 一级标题 */}
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            color: '#333'
                        }}>
                            {hoveredSubcategory.name}
                        </h4>

                        {/* 二级分类 - 横向排列 */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            marginBottom: '20px'
                        }}>
                            {hoveredSubcategory.items.map(item => (
                                <button
                                    key={item.id}
                                    style={{
                                        padding: '8px 12px',
                                        background: activeItem === item.name ? '#f5f5f5' : 'transparent',
                                        border: '1px solid #eee',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => setActiveItem(item.name)}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        {/* 三级商品 - 图片 + 名称 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '15px'
                        }}>
                            {activeItem && hoveredSubcategory.items.find(i => i.name === activeItem)?.children?.map(child => (
                                <div key={child} style={{
                                    textAlign: 'center'
                                }}>
                                    {/* 图片占位符 */}
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #eee',
                                        margin: '0 auto 8px'
                                    }}>
                                        <span style={{ fontSize: '12px', color: '#999' }}>图</span>
                                    </div>
                                    <span style={{ 
                                        fontSize: '12px', 
                                        color: '#333',
                                        display: 'block'
                                    }}>
                                        {child}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            {/* 推荐商品区域（保持原样） */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                marginTop: '20px'
            }}>
                {['热门推荐', '新品上市', '限时特惠', '爆款热销'].map((title, index) => (
                    <div key={index} style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            color: '#333'
                        }}>
                            {title}
                        </h4>
                        <img
                            src={`https://via.placeholder.com/300x200?text=${title}`}
                            alt={title}
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                            onClick={() => alert(`跳转到 ${title} 商品页`)}
                        />
                        <div style={{
                            marginTop: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                color: '#e64340',
                                fontWeight: 'bold'
                            }}>
                                ¥999
                            </span>
                            <button style={{
                                backgroundColor: '#e64340',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}>
                                立即购买
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 推荐商品区域（保持原样） */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '20px',
                padding: '0 20px'
            }}>
                {categories.slice(0, 3).map(category => (
                    <div key={category.id} style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            color: '#333'
                        }}>
                            {category.name}
                        </h4>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            {category.subcategories.slice(0, 3).map(subcategory => (
                                <span key={subcategory.id} style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#666'
                                }}>
                                    {subcategory.name}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;

import React, {useEffect, useRef, useState} from 'react';
import CategoryProductSection from '../components/CategoryProductSection';

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
                        {id: 111, name: '客厅家具', children: ['沙发', '茶几', '电视柜', '边几', '鞋柜', '玄关柜']},
                        {id: 112, name: '卧室家具', children: ['床', '床垫', '衣柜', '床头柜', '梳妆台', '休闲椅']},
                        {id: 113, name: '餐厅家具', children: ['餐桌', '餐椅', '餐边柜', '吧台', '吧椅']},
                        {id: 114, name: '书房家具', children: ['书桌', '书柜', '电脑椅', '书架']},
                        {id: 115, name: '儿童房家具', children: ['儿童床', '儿童衣柜', '学习桌椅', '玩具收纳']}
                    ]
                },
                {
                    id: 12,
                    name: '功能家具',
                    items: [
                        {id: 121, name: '储物家具', children: ['斗柜', '收纳柜', '置物架', '壁架']},
                        {id: 122, name: '户外家具', children: ['庭院桌椅', '遮阳伞', '躺椅', '户外沙发']},
                        {id: 123, name: '办公家具', children: ['办公桌', '会议桌', '文件柜', '办公椅']}
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
                        {id: 211, name: '地板', children: ['实木地板', '强化复合地板', '实木复合地板', '竹地板']},
                        {id: 212, name: '瓷砖/石材', children: ['地砖', '墙砖', '腰线', '花砖', '大理石', '花岗岩']},
                        {id: 213, name: '地毯', children: ['羊毛地毯', '化纤地毯', '混纺地毯', '塑料地毯']},
                        {id: 214, name: '涂料', children: ['乳胶漆', '艺术漆', '防水涂料', '防火涂料']},
                        {id: 215, name: '吊顶', children: ['铝扣板', '石膏板', 'PVC吊顶', '集成吊顶']}
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
                        {id: 311, name: '橱柜', children: ['整体橱柜', '吊柜', '地柜', '台面']},
                        {
                            id: 312,
                            name: '厨房电器',
                            children: ['油烟机', '燃气灶', '消毒柜', '洗碗机', '烤箱', '微波炉']
                        },
                        {id: 313, name: '厨房配件', children: ['水槽', '龙头', '挂件', '置物架']}
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
                        {id: 411, name: '门锁', children: ['智能门锁', '室内门锁', '防盗门锁']},
                        {id: 412, name: '合页/滑轨', children: ['门合页', '抽屉滑轨', '移门滑轨']},
                        {id: 413, name: '门窗配件', children: ['门吸', '地弹簧', '闭门器']}
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
                        {id: 511, name: '客厅灯', children: ['吊灯', '吸顶灯', '筒灯', '射灯']},
                        {id: 512, name: '卧室灯', children: ['吸顶灯', '台灯', '壁灯', '夜灯']},
                        {id: 513, name: '餐厅灯', children: ['吊灯', '壁灯', '筒灯']},
                        {id: 514, name: '厨卫灯', children: ['吸顶灯', '镜前灯', '筒灯']}
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
                        {id: 611, name: '窗帘/窗纱', children: ['布艺窗帘', '百叶窗', '卷帘', '罗马帘']},
                        {id: 612, name: '地毯/地垫', children: ['客厅地毯', '卧室地毯', '门垫']},
                        {id: 613, name: '床上用品', children: ['床单', '被套', '枕套', '毯子']},
                        {id: 614, name: '装饰画', children: ['油画', '国画', '照片墙', '挂钟']}
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

    // 响应式处理
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getGridColumns = () => {
        if (windowWidth < 576) return 'repeat(2, 1fr)';  // 超小屏显示2列
        if (windowWidth < 768) return 'repeat(3, 1fr)';  // 小屏显示3列
        if (windowWidth < 992) return 'repeat(4, 1fr)';  // 中屏显示4列
        return 'repeat(5, 1fr)';                         // 大屏显示5列
    };

    // 价格生成函数
    const generatePrice = (itemName) => {
        const hash = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash % 1000) + 100; // 价格范围 100-1100
    };

    // 获取当前激活的子分类
    const getCurrentSubcategory = () => {
        if (!hoveredSubcategory || !activeItem) return null;
        return hoveredSubcategory.items.find(item => item.name === activeItem);
    };

    const currentSubcategory = getCurrentSubcategory();

    return (
        <div className="content">
            <div style={{
                backgroundColor: '#fafafa',
                padding: '30px 250px',
                borderBottom: '2px solid #e0e0e0'// 页面内容区域
            }}>
                {/* 主要内容区域 */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '800px',
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
                            fontSize: '22px',
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
                                            fontSize: '18px',
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
                                gridTemplateColumns: 'repeat(2, 1fr)', // 每行两个
                                gap: '15px',
                                width: '100%'
                            }}>
                                {currentSubcategory?.children?.map((child, index) => (
                                    <div
                                        key={child}
                                        style={{
                                            textAlign: 'center',
                                            padding: '10px',
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            backgroundColor: '#fff',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                            flex: '1',
                                            minWidth: '150px' // 防止过窄
                                        }}
                                        onClick={() => alert(`跳转到 /product/${currentSubcategory.id}-${index}`)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        {/* 使用 https://via.placeholder.com 生成占位图片 */}
                                        <div style={{
                                            width: '100%',
                                            height: '100px',
                                            backgroundImage: `url(https://via.placeholder.com/100x100?text=${encodeURIComponent(child)})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            borderRadius: '4px',
                                            margin: '0 auto 8px'
                                        }}/>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#333',
                                            display: 'block',
                                            fontWeight: '500'
                                        }}>
                                            {child}
                                        </span>
                                        {/* 移除价格显示 */}
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}
                </div>
                {/* 推荐商品区域 - 使用占位图片和价格生成函数 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    marginTop: '20px',
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
                            <div style={{
                                width: '100%',
                                height: '150px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* 使用背景图方式展示占位图片 */}
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(https://via.placeholder.com/300x200?text=${encodeURIComponent(title)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}/>
                                {/* 添加文字标签 */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    {title}
                                </div>
                            </div>
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
                                        ¥{generatePrice(title)}
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
            </div>

            <div style={{
                backgroundColor: 'rgb(244,244,244)',
                padding: '15px 0',
                borderBottom: '2px solid #e0e0e0',
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
        </div>
    );
}

export default HomePage;

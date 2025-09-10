import React, {useEffect, useRef, useState} from 'react';
import CategoryProductSection from '../components/CategoryProductSection';
import RightSidebar from '../components/RightSidebar';
import MainContentSection from '../components/MainContentSection';
import RecommendedProductsSection from '../components/RecommendedProductsSection';
import FooterSection from '../components/FooterSection';

function HomePage() {
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

export default HomePage;

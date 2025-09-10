import React, {useEffect, useState, useCallback} from 'react';
import {Link, useLocation} from 'react-router-dom';
import axios from 'axios';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8081/api'; // 根据你的后端服务地址修改

// 商品分类体系 - 重新组织为更详细的筛选维度
const productCategories = {
    "全屋家具": {
        "子分类": [
            "沙发",
            "床",
            "餐桌",
            "书柜",
            "衣柜"
        ],
        "通用筛选维度": [
            "空间", "风格", "主材", "品牌", "价格", "颜色"
        ],
        "特定筛选维度": {
            "沙发": ["座位数", "面料", "功能"],
            "床": ["尺寸", "功能"],
            "餐桌": ["适用人数", "形状"],
            "书柜": ["宽度", "组合形式",],
            "衣柜": ["门数", "类型",]
        }
    },
    "家装建材": {
        "子分类": [
            "地板",
            "瓷砖/石材",
            "地毯",
            "涂料",
            "吊顶"
        ],
        "通用筛选维度": [
            "适用空间", "品牌", "价格", "环保等级"
        ],
        "特定筛选维度": {
            "地板": ["地板类型", "耐磨等级", "厚度(mm)", "功能"],
            "瓷砖/石材": ["规格", "材质", "防滑等级", "功能"],
            "地毯": [
                "材质",
                "厚度",
                "功能"
            ],
            "涂料": ["类型", "功能"],
            "吊顶": ["材质", "规格", "功能"]
        }
    },
    "厨卫用品": {
        "子分类": [
            "橱柜",
            "厨房电器",
            "厨房配件",
            "卫浴洁具"
        ],
        "通用筛选维度": [
            "材质", "品牌", "价格"
        ],
        "特定筛选维度": {
            "马桶": ["类型", "冲水方式", "坑距(mm)", "排水方式", "水效等级"],
            "淋浴房": ["类型", "玻璃厚度", "功能"],
            "花洒": ["类型", "出水模式", "功能"],
            "浴室柜": ["材质", "尺寸", "功能"]
        }
    },
    "五金/工具": {
        "子分类": [
            "门锁",
            "合页/滑轨",
            "门窗配件"
        ],
        "通用筛选维度": [
            "材质", "开启方式", "安全等级", "品牌", "价格"
        ],
        "特定筛选维度": {
            "门锁": ["类型", "开锁方式", "适用门型"]
        }
    },
    "灯具照明": {
        "子分类": [
            "吊灯",
            "吸顶灯",
            "筒灯",
            "灯带"
        ],
        "通用筛选维度": [
            "分类", "空间", "风格", "品牌", "价格"
        ],
        "特定筛选维度": {
            "吸顶灯": ["光源类型", "功率", "色温", "控制方式", "灯罩材质"]
        }
    },
    "软装配饰": {
        "子分类": [
            "窗帘/窗纱",
            "地毯/地垫",
            "床上用品",
            "装饰画"
        ],
        "通用筛选维度": [
            "材质", "图案", "颜色", "尺寸", "风格", "价格"
        ],
        "特定筛选维度": {
            "窗帘/窗纱": ["类型", "功能"],
            "地毯/地垫": ["类型", "功能"],
            "床上用品": ["类型", "功能"],
            "装饰画": ["类型", "功能"]
        }
    }
};

// 预定义筛选维度值
const filterOptions = {
    "空间": ["客厅", "卧室", "餐厅", "厨房", "卫生间", "书房", "阳台", "儿童房", "老人房"],
    "风格": ["现代简约", "北欧", "新中式", "轻奢", "美式", "日式", "工业风", "地中海"],
    "主材": ["实木", "板材", "金属", "玻璃", "石材", "塑料", "布艺", "皮革"],
    "品牌": ["宜家", "红星美凯龙", "居然之家", "林氏木业", "全友", "顾家", "曲美", "红苹果"],
    "价格": ["0-100", "100-500", "500-1000", "1000-2000", "2000-5000", "5000以上"],
    "颜色": ["原木色", "白色", "黑色", "灰色", "胡桃色", "彩色系"],
    "座位数": ["1人", "2人", "3人", "4人", "L型"],
    "面料": ["布艺", "真皮", "仿皮", "实木"],
    "功能": ["储物", "折叠", "可拆洗", "电动"],
    "尺寸": ["1.2m", "1.5m", "1.8m", "2.0m"],
    "适用人数": ["2人", "4人", "6人", "8人以上"],
    "形状": ["圆形", "方形", "长方形", "椭圆形"],
    "宽度": ["60cm以下", "60-80cm", "80-100cm", "100cm以上"],
    "组合形式": ["单门", "双门", "三门", "转角"],
    "门数": ["2门", "3门", "4门", "推拉门"],
    "类型": ["平开门", "推拉门", "折叠门"],
    "地板类型": ["实木地板", "复合地板", "强化地板", "竹地板"],
    "耐磨等级": ["AC1", "AC2", "AC3", "AC4", "AC5"],
    "厚度(mm)": ["8mm以下", "8-12mm", "12-15mm", "15mm以上"],
    "规格": ["300x300mm", "600x600mm", "800x800mm", "其他"],
    "材质": ["棉", "麻", "丝", "毛", "化纤"],
    "防滑等级": ["R9", "R10", "R11", "R12", "R13"],
    "环保等级": ["E1级", "E0级", "F4星级"],
    "涂料类型": ["乳胶漆", "水性漆", "油性漆", "艺术漆"],
    "吊顶材质": ["铝扣板", "PVC", "石膏板", "集成吊顶"],
    "光源类型": ["LED", "节能灯", "白炽灯"],
    "功率": ["10W以下", "10-30W", "30-50W", "50W以上"],
    "色温": ["暖光(3000K以下)", "中性光(3000-5000K)", "冷光(5000K以上)"],
    "控制方式": ["触摸", "遥控", "声控", "智能"],
    "灯罩材质": ["布艺", "纸质", "金属", "玻璃", "塑料"],
    "图案": ["纯色", "条纹", "格子", "花卉", "几何"],
    "尺寸": ["小号", "中号", "大号", "特大号"],
    "价格": ["价格区间..."]
};

const ProductFilter = () => {
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(true); // 默认展开
    const [products, setProducts] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [categories, setCategories] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [subcategories, setSubcategories] = useState([]);
    const location = useLocation();

    //添加排序状态
    const [sortType, setSortType] = useState('综合'); // 默认排序方式

    // 在 useEffect 中添加获取分类的逻辑
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/products/categories`);
                setCategories(response.data.data || []);
            } catch (error) {
                console.error('获取分类失败:', error.response ? error.response.data : error.message);
            }
        };

        fetchCategories();
    }, []);

    // 处理URL参数
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');

        if (category) {
            setSelectedCategory(category);
        } else {
            setSelectedCategory('全部');
        }

        if (subcategory) {
            setSelectedSubcategory(subcategory);
        } else {
            setSelectedSubcategory('');
        }
    }, [location]);


    // 在fetchProducts函数中添加更多调试信息
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        console.log('开始获取商品数据...');

        try {
            const params = {};

            // 仅传递 category 和 subcategory 给后端
            if (selectedCategory && selectedCategory !== '全部') {
                params.category = selectedCategory;
            }

            // 只有当有选中的子分类时才添加subcategory参数
            if (selectedSubcategory) {
                params.subcategory = selectedSubcategory;
            }

            // 排序方式
            if (sortType) {
                params.sortType = sortType;
            }

            // 添加高级筛选参数
            Object.keys(selectedFilters).forEach(key => {
                if (selectedFilters[key]) {
                    // 确保 key 名称与后端 ProductFilterRequest 类中的字段名一致
                    // 特殊处理一些字段名
                    let paramName = key;
                    switch (key) {
                        case '适用空间':
                            paramName = 'space';
                            break;
                        case '主材':
                            paramName = 'material';
                            break;
                        case '座位数':
                            paramName = 'seatingCapacity';
                            break;
                        case '面料':
                            paramName = 'fabric';
                            break;
                        case '适用人数':
                            paramName = 'capacity';
                            break;
                        case '形状':
                            paramName = 'shape';
                            break;
                        case '组合形式':
                            paramName = 'combinationForm';
                            break;
                        case '门数':
                            paramName = 'doorCount';
                            break;
                        case '地板类型':
                            paramName = 'floorType';
                            break;
                        case '耐磨等级':
                            paramName = 'abrasionResistanceLevel';
                            break;
                        case '厚度(mm)':
                            paramName = 'thickness';
                            break;
                        case '防滑等级':
                            paramName = 'antiSlipLevel';
                            break;
                        case '环保等级':
                            paramName = 'environmentalLevel';
                            break;
                        case '涂料类型':
                            paramName = 'paintType';
                            break;
                        case '吊顶材质':
                            paramName = 'ceilingMaterial';
                            break;
                        case '光源类型':
                            paramName = 'lightType';
                            break;
                        case '色温':
                            paramName = 'colorTemperature';
                            break;
                        case '控制方式':
                            paramName = 'controlMethod';
                            break;
                        case '灯罩材质':
                            paramName = 'lampshadeMaterial';
                            break;
                        case '水效等级':
                            paramName = 'waterEfficiencyLevel';
                            break;
                        case '坑距(mm)':
                            paramName = 'pitDistance';
                            break;
                        case '排水方式':
                            paramName = 'drainageMethod';
                            break;
                        case '出水模式':
                            paramName = 'waterOutletMode';
                            break;
                        case '玻璃厚度':
                            paramName = 'glassThickness';
                            break;
                        case '冲水方式':
                            paramName = 'flushMethod';
                            break;
                        default:
                            paramName = key;
                    }

                    // 将筛选条件添加到请求参数中
                    params[paramName] = selectedFilters[key];
                }
            });

            console.log('请求参数:', params);
            const response = await axios.get(`${API_BASE_URL}/products/search`, {params});

            console.log('商品数据:', response.data);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('获取商品数据失败:', error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedSubcategory, selectedFilters, sortType]);

    // 获取商品数据
    useEffect(() => {
        console.log('组件挂载，开始获取商品数据');
        fetchProducts();
    }, [fetchProducts]);

    // 获取当前分类的筛选维度 - 修改此函数以正确处理材质维度
    const getFilterDimensions = () => {
        if (selectedCategory === '全部') return [];

        const categoryData = productCategories[selectedCategory];
        const dimensions = [...categoryData['通用筛选维度']];

        // 添加特定筛选维度
        if (selectedSubcategory && categoryData['特定筛选维度'] && categoryData['特定筛选维度'][selectedSubcategory]) {
            dimensions.push(...categoryData['特定筛选维度'][selectedSubcategory]);
        }

        return dimensions;
    };

    // 获取筛选选项 - 修改此函数以正确处理材质维度
    const getFilterOptions = (dimension) => {
        if (!filterOptions[selectedCategory] || !filterOptions[selectedCategory][dimension]) {
            return [];
        }

        const options = filterOptions[selectedCategory][dimension];

        // 如果是对象且当前有子分类，则返回对应子分类的选项
        if (typeof options === 'object' && !Array.isArray(options) && selectedSubcategory) {
            return options[selectedSubcategory] || [];
        }

        // 如果是普通数组或对象，直接返回
        if (typeof options === 'object' && !Array.isArray(options)) {
            // 如果是对象，提取其所有值
            return Object.values(options);
        }

        return options;
    };

    // 确保 handleFilterChange 正确映射文本到数值
    const handleFilterChange = (filter, value) => {
        setSelectedFilters(prev => {
            let newFilters;
            if (prev[filter] === value) {
                // 如果当前值等于点击的值，取消选择
                newFilters = { ...prev };
                delete newFilters[filter];
            } else {
                // 否则设置为新值
                newFilters = {
                    ...prev,
                    [filter]: value
                };
            }
            
            // 更新筛选条件后立即重新获取商品数据
            // 使用setTimeout确保状态更新完成后再获取数据
            setTimeout(() => {
                fetchProducts();
            }, 0);
            
            return newFilters;
        });
    };

    // 切换高级筛选的展开/收起状态
    const toggleAdvancedFilters = () => {
        setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen);
    };

    // 修改获取子分类的方法
    /*
    const getSubcategories = async (category) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/subcategories`, {
                params: {category}
            });

            // 映射数据库中的子分类名称到前端显示名称
            const subcategoryMap = {
                '沙发': '客厅家具',
                '床': '卧室家具',
                '餐桌': '餐厅家具',
                '书柜': '书房家具',
                '衣柜': '衣帽间家具'
            };

            return response.data.data.map(subcategory => ({
                value: subcategory,
                label: subcategoryMap[subcategory] || subcategory
            }));
        } catch (error) {
            console.error('获取子分类失败:', error);
            return [];
        }
    };
    */

    // 修改筛选条件处理
    /*
    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        // 当选择"全部"分类时，清除子分类选择
        if (value === '全部') {
            setSelectedSubcategory('');
        } else {
            // 当选择具体分类时，可以选择子分类
            setSelectedSubcategory('');
        }
    };
    */

    return (
        <div className="fl-product-filter-container">
            <style>
                {`
                    /* 主容器样式 */
                    .fl-product-filter-container {
                        padding: 20px 250px;
                    }
                    
                    /* 面包屑导航样式 */
                    .fl-breadcrumb {
                        margin-bottom: 20px;
                        font-size: 25px;
                        color: #666;
                    }
                    
                    .fl-breadcrumb-link {
                        color: #666;
                        text-decoration: none;
                    }
                    
                    .fl-breadcrumb-current {
                        color: #e64340;
                    }
                    
                    /* 分类筛选区域样式 */
                    .fl-category-filter-section {
                        background-color: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    
                    /* 分类列表样式 */
                    .fl-category-list {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    
                    /* 分类项容器样式 */
                    .fl-category-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    /* 分类标题样式 */
                    .fl-category-title {
                        font-weight: bold;
                        color: #333;
                        font-size: 16px;
                    }
                    
                    /* 分类按钮容器样式 */
                    .fl-category-buttons {
                        flex: 1;
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    
                    /* 分类按钮样式 */
                    .fl-category-button {
                        padding: 5px 10px;
                        border: none;
                        background-color: transparent;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 16px;
                        outline: none;
                    }
                    
                    .fl-category-button.selected {
                        border-bottom: 2px solid #e64340;
                    }
                    
                    .fl-category-button:not(.selected) {
                        border-bottom: 1px solid transparent;
                    }
                    
                    /* 高级筛选切换按钮样式 */
                    .fl-advanced-filter-toggle {
                        font-weight: bold;
                        color: #333;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        padding-bottom: 5px;
                        font-size: 16px;
                    }
                    
                    .fl-advanced-filter-toggle.selected {
                        border-bottom: 2px solid #e64340;
                    }
                    
                    .fl-advanced-filter-toggle:not(.selected) {
                        border-bottom: 1px solid #ddd;
                    }
                    
                    /* 箭头图标样式 */
                    .fl-toggle-arrow {
                        transition: transform 0.3s ease;
                    }
                    
                    .fl-toggle-arrow.open {
                        transform: rotate(180deg);
                    }
                    
                    /* 筛选维度展示区域样式 */
                    .fl-filter-dimensions-section {
                        background-color: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        font-size: 16px;
                    }
                    
                    /* 筛选维度容器样式 */
                    .fl-filter-dimensions-container {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    
                    /* 筛选维度项样式 */
                    .fl-filter-dimension-item {
                        margin-bottom: 10px;
                    }
                    
                    /* 筛选维度标题样式 */
                    .fl-filter-dimension-title {
                        font-weight: bold;
                        margin-right: 8px;
                    }
                    
                    /* 筛选选项样式 */
                    .fl-filter-option {
                        margin: 0 8px 4px 0;
                        padding: 4px 8px;
                        cursor: pointer;
                        border-radius: 4px;
                        background-color: transparent;
                        text-decoration: none;
                        color: #666;
                    }
                    
                    .fl-filter-option.selected {
                        border: 1px solid #e64340;
                        background-color: #f8f9fa;
                        text-decoration: underline;
                        color: #e64340;
                    }
                    
                    /* 排序与筛选选项区域样式 */
                    .fl-sort-filter-section {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                    }
                    
                    /* 排序按钮样式 */
                    .fl-sort-button {
                        padding: 8px 16px;
                        border: none;
                        background-color: transparent;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 22px;
                        outline: none;
                    }
                    
                    .fl-sort-button.selected {
                        border-bottom: 2px solid #e64340;
                    }
                    
                    .fl-sort-button:not(.selected) {
                        border-bottom: 1px solid transparent;
                    }
                    
                    /* 筛选选项容器样式 */
                    .fl-filter-options-container {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                        font-size: 20px;
                    }
                    
                    /* 选择框样式 */
                    .fl-filter-select {
                        padding: 5px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 20px;
                    }
                    
                    /* 标签样式 */
                    .fl-filter-label {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    
                    /* 商品展示区域样式 */
                    .fl-products-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                    }
                    
                    /* 商品卡片样式 */
                    .fl-product-card {
                        border: 1px solid #ddd;
                        padding: 10px;
                        border-radius: 8px;
                    }
                    
                    /* 商品图片样式 */
                    .fl-product-image {
                        width: 100%;
                        height: 200px;
                        object-fit: cover;
                    }
                    
                    /* 商品名称样式 */
                    .fl-product-name {
                        margin-top: 10px;
                        font-size: 18px;
                    }
                    
                    /* 商品信息样式 */
                    .fl-product-info {
                        margin-top: 5px;
                        font-size: 14px;
                        color: #666;
                    }
                `}
            </style>
            
            {/* 面包屑导航 */}
            <div className="fl-breadcrumb">
                <Link to="/" className="fl-breadcrumb-link">首页</Link>
                >
                <span className="fl-breadcrumb-current">全部结果</span>
            </div>

            {/* 分类筛选区域 */}
            <div className="fl-category-filter-section">
                <dl className="fl-category-list">
                    {/* 一级分类 */}
                    <div className="fl-category-item">
                        <dt className="fl-category-title">分类：</dt>
                        <dd className="fl-category-buttons">
                            <button
                                onClick={() => {
                                    setSelectedCategory('全部');
                                    setSelectedSubcategory(''); // 选择"全部"时清除子分类
                                }}
                                className={`fl-category-button ${selectedCategory === '全部' ? 'selected' : ''}`}
                            >
                                全部
                            </button>
                            {Object.keys(productCategories).map(category => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setSelectedSubcategory(''); // 选择具体分类时清除子分类
                                    }}
                                    className={`fl-category-button ${selectedCategory === category ? 'selected' : ''}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </dd>
                    </div>

                    {/* 子分类 */}
                    {selectedCategory !== '全部' && productCategories[selectedCategory] && (
                        <div className="fl-category-item">
                            <dt className="fl-category-title">子分类：</dt>
                            <dd className="fl-category-buttons">
                                {productCategories[selectedCategory]['子分类'].map(subcategory => (
                                    <button
                                        key={subcategory}
                                        onClick={() => setSelectedSubcategory(subcategory)}
                                        className={`fl-category-button ${selectedSubcategory === subcategory ? 'selected' : ''}`}
                                    >
                                        {subcategory}
                                    </button>
                                ))}
                            </dd>
                        </div>
                    )}

                    {/* 高级筛选 - 可点击下拉 */}
                    {selectedCategory !== '全部' && productCategories[selectedCategory] && (
                        <div className="fl-category-item">
                            <dt className="fl-category-title">高级筛选：</dt>
                            <dd>
                                <div
                                    className={`fl-advanced-filter-toggle ${isAdvancedFiltersOpen ? 'selected' : ''}`}
                                    onClick={toggleAdvancedFilters}
                                >
                                    <span className={`fl-toggle-arrow ${isAdvancedFiltersOpen ? 'open' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* 筛选维度展示 */}
            {selectedCategory !== '全部' && isAdvancedFiltersOpen && (
                <div className="fl-filter-dimensions-section">
                    <div className="fl-filter-dimensions-container">
                        {getFilterDimensions().map((dimension) => (
                            <div key={dimension} className="fl-filter-dimension-item">
                                <span className="fl-filter-dimension-title">{dimension}：</span>
                                {getFilterOptions(dimension).map((option) => (
                                    <span
                                        key={option}
                                        onClick={() => handleFilterChange(dimension, option)}
                                        className={`fl-filter-option ${selectedFilters[dimension] === option ? 'selected' : ''}`}
                                    >
                                        {option}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 排序与筛选选项 */}
            <div className="fl-sort-filter-section">
                {['综合', '新品', '销量', '价格 ↑'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setSortType(type)}
                        className={`fl-sort-button ${sortType === type ? 'selected' : ''}`}
                    >
                        {type}
                    </button>
                ))}
                <div className="fl-filter-options-container">
                    <select className="fl-filter-select">
                        <option>收货地：北京市</option>
                        <option>上海市</option>
                        <option>广州市</option>
                    </select>
                    <label className="fl-filter-label">
                        <input type="checkbox"/>
                        促销
                    </label>
                    <label className="fl-filter-label">
                        <input type="checkbox"/>
                        分期
                    </label>
                    <label className="fl-filter-label">
                        <input type="checkbox"/>
                        仅看有货
                    </label>
                </div>
            </div>

            {/* 商品展示区 */}
            <div className="fl-products-grid">
                {products.map(product => (
                    <div key={product.id} className="fl-product-card">
                        <img src={product.mainImageUrl} alt={product.name} className="fl-product-image" />
                        <div className="fl-product-name">
                            {product.name}
                        </div>
                        <div className="fl-product-info">
                            <div>{product.category} · {product.subcategory}</div>
                            <div>价格: ¥{product.price}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductFilter;
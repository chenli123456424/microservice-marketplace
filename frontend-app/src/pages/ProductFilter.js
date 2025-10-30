import React, {useCallback, useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import FooterSection from '../components/FooterSection';
import RightSidebar from '../components/RightSidebar';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8081/api'; // 根据你的后端服务地址修改

const ProductFilter = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false); // 默认收起
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]); // 主分类数据
    const [subcategories, setSubcategories] = useState([]); // 子分类数据
    const [brands, setBrands] = useState([]); // 品牌数据
    const [filterDimensions, setFilterDimensions] = useState([]); // 筛选维度数据
    const [isFilterDimensionsLoading, setIsFilterDimensionsLoading] = useState(false); // 筛选维度加载状态
    const location = useLocation();
    const navigate = useNavigate();

    // 页面挂载时滚动到顶部
    useEffect(() => {
        // 确保页面滚动到顶部
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);
    
    //添加排序状态
    const [sortType, setSortType] = useState('综合'); // 默认排序方式
    const [sortOrder, setSortOrder] = useState('desc'); // 排序方向
    const [deliveryLocation, setDeliveryLocation] = useState('北京市'); // 收货地
    
    // 新增筛选条件状态
    const [isPromotion, setIsPromotion] = useState(false); // 促销
    const [supportInstallment, setSupportInstallment] = useState(false); // 分期
    const [onlyInStock, setOnlyInStock] = useState(false); // 仅看有货
    const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键字
    
    // 分页相关状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // 获取主分类数据
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/categories`);
                console.log('主分类数据:', response.data);
                // 修复语法错误
                if (response.data.code === 200 && response.data.data) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('获取主分类失败:', error.response ? error.response.data : error.message);
            }
        };

        fetchCategories();
    }, []);

    // 处理URL参数
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const search = searchParams.get('search');
        const mainId = searchParams.get('mainId');

        if (category) {
            setSelectedCategory(category);
        } else if (!search) {
            // 如果没有分类参数且没有搜索参数，默认选择"全部"
            setSelectedCategory('全部');
        } else {
            setSelectedCategory('');
        }

        if (subcategory) {
            setSelectedSubcategory(subcategory);
            // 从URL参数设置子分类时，自动展开高级筛选
            // 因为用户通过URL明确指定了子分类，说明他们想要看到筛选选项
            setIsAdvancedFiltersOpen(true);
        } else {
            setSelectedSubcategory('');
        }

        // 处理搜索参数
        if (search) {
            // 如果有搜索关键词，设置搜索关键字状态并选择"全部"分类
            setSearchKeyword(search);
            setSelectedCategory('全部');
            setSelectedSubcategory(''); // 清空子分类选择
            console.log('搜索关键词:', search);
        } else {
            setSearchKeyword('');
        }

        // 处理mainId参数（从搜索跳转过来）
        if (mainId && !category) {
            // 根据mainId找到对应的分类名称
            const foundCategory = categories.find(cat => cat.mainId === parseInt(mainId));
            if (foundCategory) {
                setSelectedCategory(foundCategory.name);
            }
        }
    }, [location, categories]);

    // 当选中的主分类改变时，获取对应的子分类
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!selectedCategory) {
                setSubcategories([]);
                return;
            }

            try {
                // 根据选中的主分类获取对应的子分类
                const activeCategory = categories.find(cat => cat.name === selectedCategory);
                console.log('当前选中的主分类:', activeCategory);
                if (activeCategory && activeCategory.subCategories) {
                    console.log('子分类数据:', activeCategory.subCategories);
                    setSubcategories(activeCategory.subCategories);
                } else {
                    setSubcategories([]);
                }
            } catch (error) {
                console.error('获取子分类失败:', error);
                setSubcategories([]);
            }
        };

        fetchSubcategories();
    }, [selectedCategory, categories]);

    // 修改后的 fetchFilterDimensions 函数 - 只在选择子分类时获取筛选维度
    useEffect(() => {
        const fetchFilterDimensions = async () => {
            // 只有在选择了主分类和子分类时才获取筛选维度
            if (!selectedCategory || !selectedSubcategory) {
                setFilterDimensions([]);
                setIsFilterDimensionsLoading(false);
                return;
            }

            setIsFilterDimensionsLoading(true);
            try {
                const activeCategory = categories.find(cat => cat.name === selectedCategory);
                if (!activeCategory) return;

                const params = new URLSearchParams();
                params.append('mainId', activeCategory.mainId);

                // 正确处理 subId 参数
                if (selectedSubcategory) {
                    const activeSubcategory = subcategories.find(sub => sub.name === selectedSubcategory);
                    if (activeSubcategory && activeSubcategory.subId) {
                        params.append('subId', activeSubcategory.subId);
                    }
                }

                console.log('筛选维度请求参数:', params.toString());
                console.log('筛选维度请求URL:', `${API_BASE_URL}/filters?${params.toString()}`);
                
                const response = await axios.get(`${API_BASE_URL}/filters?${params.toString()}`);
                console.log('筛选维度完整响应:', response);
                console.log('筛选维度响应数据:', response.data);

                // 增强调试：检查响应结构
                if (response.data) {
                    console.log('响应码:', response.data.code);
                    console.log('响应数据类型:', typeof response.data.data);
                    console.log('响应数据是否为数组:', Array.isArray(response.data.data));
                    console.log('响应数据内容:', response.data.data);
                }

                // 修复：确保数据正确处理并触发重新渲染
                if (response.data.code === 200 && Array.isArray(response.data.data)) {
                    console.log('开始处理筛选维度数据，原始数据长度:', response.data.data.length);
                    
                    // 创建新的数组，确保React能检测到变化
                    const processedData = response.data.data.map((dimension, index) => {
                        console.log(`处理第${index}个维度:`, dimension.name, dimension);
                        
                        // 确保children属性存在
                        if (dimension.children === null || dimension.children === undefined) {
                            dimension.children = [];
                            console.log(`为维度 ${dimension.name} 初始化空children数组`);
                        } else {
                            console.log(`维度 ${dimension.name} 已有children:`, dimension.children);
                        }

                        // 递归处理所有子节点
                        if (dimension.children && Array.isArray(dimension.children)) {
                            console.log(`处理维度 ${dimension.name} 的 ${dimension.children.length} 个子项`);
                            dimension.children = dimension.children.map(child => {
                                if (child.children === null || child.children === undefined) {
                                    child.children = [];
                                }
                                console.log(`  - 子项: ${child.name}`);
                                return child;
                            });
                        }

                        return {...dimension}; // 创建新对象，确保React能检测到变化
                    });

                    console.log('数据处理完成，最终数据:', processedData);
                    
                    // 详细检查数据结构
                    console.log('=== 详细数据结构检查 ===');
                    processedData.forEach((dim, index) => {
                        console.log(`根维度 ${index}: ${dim.name} (ID: ${dim.dimensionId}, Level: ${dim.level}, ParentID: ${dim.parentId})`);
                        if (dim.children && dim.children.length > 0) {
                            dim.children.forEach((child, childIndex) => {
                                console.log(`  子维度 ${childIndex}: ${child.name} (ID: ${child.dimensionId}, Level: ${child.level}, ParentID: ${child.parentId})`);
                                if (child.children && child.children.length > 0) {
                                    child.children.forEach((grandChild, grandIndex) => {
                                        console.log(`    孙维度 ${grandIndex}: ${grandChild.name} (ID: ${grandChild.dimensionId}, Level: ${grandChild.level}, ParentID: ${grandChild.parentId})`);
                                    });
                                }
                            });
                        } else {
                            console.log(`  ${dim.name} 没有子项`);
                        }
                    });
                    console.log('=== 数据结构检查结束 ===');
                    
                    // 使用setFilterDimensions强制重新渲染
                    setFilterDimensions(processedData);

                    // 详细调试信息
                    processedData.forEach((dimension, index) => {
                        console.log(`维度${index}: ${dimension.name}, 子项数量: ${dimension.children ? dimension.children.length : 0}`);
                        if (dimension.children && dimension.children.length > 0) {
                            dimension.children.forEach((child, childIndex) => {
                                console.log(`  子项${childIndex}: ${child.name}`);
                            });
                        }
                    });
                } else {
                    console.log('响应数据格式不正确或为空，设置空数组');
                    setFilterDimensions([]);
                }
            } catch (error) {
                console.error('获取筛选维度失败:', error);
                setFilterDimensions([]);
            } finally {
                setIsFilterDimensionsLoading(false);
            }
        };

        fetchFilterDimensions();
    }, [selectedCategory, selectedSubcategory, categories, subcategories]);


    // 获取品牌数据
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/brands`);
                console.log('品牌数据:', response.data);
                if (response.data.code === 200 && response.data.data) {
                    setBrands(response.data.data);
                }
            } catch (error) {
                console.error('获取品牌数据失败:', error.response ? error.response.data : error.message);
            }
        };

        fetchBrands();
    }, []);
    

    // 获取商品数据
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        console.log('开始获取商品数据...');

        try {
            const params = {
                page: currentPage,
                size: pageSize
            };

            // 添加分类筛选参数（排除"全部"分类）
            if (selectedCategory && selectedCategory !== '全部') {
                const activeCategory = categories.find(cat => cat.name === selectedCategory);
                if (activeCategory) {
                    params.mainId = activeCategory.mainId;
                }
            }

            // 添加子分类筛选参数
            if (selectedSubcategory && subcategories.length > 0) {
                const activeSubcategory = subcategories.find(sub => sub.name === selectedSubcategory);
                if (activeSubcategory) {
                    params.subId = activeSubcategory.subId;
                }
            }

            // 处理筛选条件：无论是否有筛选条件，都使用统一的API
            const attrs = Object.entries(selectedFilters).map(([key, value]) => ({
                attrKey: key,
                attrValue: value
            }));

            console.log('当前筛选条件:', selectedFilters);
            console.log('构造的attrs参数:', attrs);
            console.log('当前主分类ID:', params.mainId, '子分类ID:', params.subId);

            // 构建筛选请求参数
            const filterDTO = {
                mainId: params.mainId,
                subId: params.subId,
                attrs: attrs.length > 0 ? attrs : null,
                isPromotion: isPromotion,
                supportInstallment: supportInstallment,
                onlyInStock: onlyInStock,
                sortType: sortType,
                sortOrder: sortOrder,
                location: deliveryLocation,
                searchKeyword: searchKeyword
            };

            console.log('发送筛选请求:', filterDTO);
            console.log('筛选请求详情 - attrs:', filterDTO.attrs);

            // 使用 POST 方式发送筛选请求（包括无筛选条件的情况）
            const response = await axios.post(`${API_BASE_URL}/products/filter?page=${params.page}&size=${params.size}`, filterDTO);

            console.log('筛选商品响应:', response.data);
            if (response.data.code === 200 && response.data.data) {
                const products = response.data.data.records || [];
                const total = response.data.data.total || 0;
                const pages = response.data.data.pages || 1;
                
                setProducts(products);
                setTotalProducts(total);
                setTotalPages(pages);
                console.log('设置商品列表，数量:', products.length, '总数:', total, '总页数:', pages);
            } else {
                setProducts([]);
                setTotalProducts(0);
                setTotalPages(1);
                console.log('未获取到商品数据，设置空列表');
            }
            // 已完成筛选查询，直接返回
        } catch (error) {
            console.error('获取商品数据失败:', error.response ? error.response.data : error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, selectedSubcategory, categories, subcategories, selectedFilters, isPromotion, supportInstallment, onlyInStock, sortType, sortOrder, deliveryLocation, searchKeyword, currentPage, pageSize]);

    // 获取商品数据
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 分页处理函数
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // 重置到第一页
    };

    // 获取筛选选项值
    const getFilterOptions = async (dimension) => {
        try {
            // 根据筛选维度类型获取选项值
            if (dimension.type === 'common') {
                // 通用属性：从 product_common_attr 表获取
                const response = await axios.get(`${API_BASE_URL}/common-attrs/${dimension.attrId}`);
                if (response.data.code === 200 && response.data.data) {
                    return response.data.data.map(attr => attr.value);
                }
            } else if (dimension.type === 'extend') {
                // 扩展属性：从 product_extend_attr 表获取
                const response = await axios.get(`${API_BASE_URL}/extend-attrs/${dimension.attrId}`);
                if (response.data.code === 200 && response.data.data) {
                    return response.data.data.map(attr => attr.value);
                }
            }
        } catch (error) {
            console.error('获取筛选选项值失败:', error);
        }
        return [];
    };

    // 处理筛选条件变化
    const handleFilterChange = (filter, value) => {
        setSelectedFilters(prev => {
            let newFilters;
            if (prev[filter] === value) {
                // 如果当前值等于点击的值，取消选择
                newFilters = {...prev};
                delete newFilters[filter];
                console.log('取消筛选条件:', filter, '=', value, '剩余筛选条件:', newFilters);
            } else {
                // 否则设置为新值
                newFilters = {
                    ...prev,
                    [filter]: value
                };
                console.log('添加筛选条件:', filter, '=', value, '当前筛选条件:', newFilters);
            }

            return newFilters;
        });
    };

    // 切换高级筛选的展开/收起状态
    const toggleAdvancedFilters = () => {
        setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen);
    };

    // 处理分类选择变化
    const handleCategoryChange = (categoryName) => {
        setSelectedCategory(categoryName);
        setSelectedSubcategory(''); // 重置子分类选择
        setSelectedFilters({}); // 清空筛选条件
        setIsAdvancedFiltersOpen(true); // 重置高级筛选展开状态

        // 如果选择"全部"分类，清空搜索关键字
        if (categoryName === '全部') {
            setSearchKeyword('');
        }

        // 更新URL参数
        const searchParams = new URLSearchParams(location.search);
        if (categoryName && categoryName !== '全部') {
            searchParams.set('category', categoryName);
            searchParams.delete('subcategory'); // 清除子分类参数
        } else {
            searchParams.delete('category');
            searchParams.delete('subcategory');
        }

        // 如果选择"全部"分类，也清除搜索参数
        if (categoryName === '全部') {
            searchParams.delete('search');
        }

        navigate({
            pathname: location.pathname,
            search: searchParams.toString()
        });
    };

    // 处理子分类选择变化
    const handleSubcategoryChange = (subcategoryName) => {
        console.log('选择子分类:', subcategoryName);
        setSelectedSubcategory(subcategoryName);
        setSelectedFilters({}); // 清空之前的筛选条件
        setIsAdvancedFiltersOpen(true); // 默认展开高级筛选

        // 更新URL参数
        const searchParams = new URLSearchParams(location.search);
        if (subcategoryName) {
            searchParams.set('subcategory', subcategoryName);
        } else {
            searchParams.delete('subcategory');
        }

        navigate({
            pathname: location.pathname,
            search: searchParams.toString()
        });
    };


    return (
        <div className="fl-product-filter-container">
            <div className="fl-content-wrapper">
            <style>
                {`
                    /* 主容器样式 */
                    .fl-product-filter-container {
                        background-color: #f5f5f5; /* 整个页面背景改为灰色 */
                        min-height: 100vh;
                    }
                    
                    /* 内容区域容器 */
                    .fl-content-wrapper {
                        /* 移除左右padding，让白色区域也顶到页面边缘 */
                    }
                    
                    /* 面包屑导航样式 */
                    .fl-breadcrumb {
                        font-size: 25px;
                        color: #666;
                        background-color:rgb(255, 255, 255); /* 改为白色背景 */
                        padding: 20px 250px; /* 内容左右padding */
                        border-radius: 0; /* 移除圆角，让区域顶到边缘 */
                    }
                    
                    .fl-breadcrumb-link {
                        color: #666;
                        text-decoration: none;
                    }
                    
                    .fl-breadcrumb-current {
                        color: #e64340;
                    }
                    
                    
                    /* 加载动画样式 */
                    .fl-loading-spinner {
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        border: 2px solid #f3f3f3;
                        border-top: 2px solid #e64340;
                        border-radius: 50%;
                        animation: fl-spin 1s linear infinite;
                        margin-right: 8px;
                    }
                    
                    @keyframes fl-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    .fl-filter-loading-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 40px 20px;
                        color: #666;
                        font-size: 16px;
                    }
                    
                    /* 分类筛选区域样式 */
                    .fl-category-filter-section {
                        background-color: white; /* 改为白色背景 */
                        padding: 20px 250px; /* 内容左右padding */
                        border-radius: 0; /* 移除圆角，让白色区域顶到边缘 */
                        margin: 0 0 20px 0; /* 移除左右margin */
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 添加阴影效果 */
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
                        background-color: white; /* 改为白色背景 */
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        font-size: 16px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 添加阴影效果 */
                    }
                    
                    /* 筛选维度容器样式 - 使用与分类筛选相同的布局 */
                    .fl-filter-dimensions-container {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    
                    /* 排序与筛选选项区域样式 */
                    .fl-sort-filter-section {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin: 0 0 20px 0; /* 移除左右margin */
                        border-bottom: 1px solid #eee;
                        padding: 15px 250px; /* 内容左右padding */
                        background-color: #f5f5f5; /* 改为灰色背景 */
                        border-radius: 0; /* 移除圆角，让区域顶到边缘 */
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
                    .fl-products-section {
                        background-color: #f5f5f5; /* 改为灰色背景 */
                        padding: 20px 250px; /* 内容左右padding */
                        border-radius: 0; /* 移除圆角，让区域顶到边缘 */
                    }
                    
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
                        height: 300px;
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
                    
                    /* 加载状态样式 */
                    .fl-loading {
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-size: 16px;
                    }
                    
                    /* 筛选结果提示样式 */
                    .fl-filter-summary {
                        background-color: #f5f5f5;
                        padding: 12px 16px;
                        border-radius: 4px;
                        margin-bottom: 16px;
                        font-size: 14px;
                        color: #333;
                    }
                    
                    .fl-active-filters {
                        margin-left: 16px;
                    }
                    
                    .fl-filter-tag {
                        display: inline-block;
                        background-color: #e6f7ff;
                        border: 1px solid #91d5ff;
                        border-radius: 4px;
                        padding: 4px 8px;
                        margin: 0 4px;
                        font-size: 12px;
                        color: #1890ff;
                    }
                    
                    .fl-remove-filter {
                        background: none;
                        border: none;
                        color: #1890ff;
                        margin-left: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    }
                    
                    .fl-remove-filter:hover {
                        color: #ff4d4f;
                    }
                    
                    /* 商品区域头部样式 */
                    .fl-products-header {
                        margin-bottom: 16px;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .fl-products-count {
                        font-size: 14px;
                        color: #666;
                    }
                    
                    /* 商品价格样式 */
                    .fl-product-price {
                        margin-bottom: 8px;
                    }
                    
                    .fl-current-price {
                        color: #e64340;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    
                    .fl-market-price {
                        color: #999;
                        font-size: 12px;
                        text-decoration: line-through;
                        margin-left: 8px;
                    }
                    
                    .fl-product-stock {
                        font-size: 12px;
                        color: #666;
                    }
                    
                    /* 无商品状态样式 */
                    .fl-no-products {
                        grid-column: 1 / -1;
                        text-align: center;
                        padding: 60px 20px;
                        color: #999;
                    }
                    
                    .fl-no-products-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                    
                    .fl-no-products-text h3 {
                        margin: 0 0 8px 0;
                        font-size: 18px;
                        color: #666;
                    }
                    
                    .fl-no-products-text p {
                        margin: 0;
                        font-size: 14px;
                        color: #999;
                    }
                    
                    /* 分页组件样式 */
                    .fl-pagination-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 30px;
                        padding: 20px 0;
                        border-top: 1px solid #eee;
                    }
                    
                    .fl-pagination-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                        color: #666;
                    }
                    
                    .fl-page-size-select {
                        padding: 4px 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                        background: white;
                        cursor: pointer;
                    }
                    
                    .fl-page-size-select:focus {
                        outline: none;
                        border-color: #ff6900;
                    }
                    
                    .fl-pagination {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .fl-pagination-btn {
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        background: white;
                        color: #333;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    }
                    
                    .fl-pagination-btn:hover:not(:disabled) {
                        border-color: #ff6900;
                        color: #ff6900;
                    }
                    
                    .fl-pagination-btn:disabled {
                        background: #f5f5f5;
                        color: #ccc;
                        cursor: not-allowed;
                        border-color: #eee;
                    }
                    
                    .fl-pagination-btn.active {
                        background: #ff6900;
                        color: white;
                        border-color: #ff6900;
                    }
                    
                    .fl-pagination-btn.active:hover {
                        background: #e55a00;
                        border-color: #e55a00;
                    }
                `}
            </style>

            {/* 面包屑导航 */}
            <div className="fl-breadcrumb">
                <Link to="/" className="fl-breadcrumb-link">首页</Link>
                &gt;
                <span className="fl-breadcrumb-current">
                    {searchKeyword ? `搜索结果: "${searchKeyword}"` : '全部结果'}
                </span>
            </div>
            

            {/* 合并的分类筛选区域 */}
            <div className="fl-category-filter-section">
                <dl className="fl-category-list">
                    {/* 一级分类 */}
                    <div className="fl-category-item">
                        <dt className="fl-category-title">分类：</dt>
                        <dd className="fl-category-buttons">
                            {/* 全部选项 */}
                            <button
                                onClick={() => handleCategoryChange('全部')}
                                className={`fl-category-button ${selectedCategory === '全部' ? 'selected' : ''}`}
                            >
                                全部
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.mainId}
                                    onClick={() => handleCategoryChange(category.name)}
                                    className={`fl-category-button ${selectedCategory === category.name ? 'selected' : ''}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </dd>
                    </div>

                    {/* 子分类 */}
                    {selectedCategory && subcategories.length > 0 && (
                        <div className="fl-category-item">
                            <dt className="fl-category-title">子分类：</dt>
                            <dd className="fl-category-buttons">
                                {subcategories.map(subcategory => (
                                    <button
                                        key={subcategory.subId}
                                        onClick={() => handleSubcategoryChange(subcategory.name)}
                                        className={`fl-category-button ${selectedSubcategory === subcategory.name ? 'selected' : ''}`}
                                    >
                                        {subcategory.name}
                                    </button>
                                ))}
                            </dd>
                        </div>
                    )}

                    {/* 高级筛选 - 只在选择子分类后显示 */}
                    {selectedCategory && selectedSubcategory && (
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

                    {/* 筛选维度展示 - 合并到同一个区域中 */}
                    {selectedCategory && selectedSubcategory && isAdvancedFiltersOpen && (
                        <>
                            {isFilterDimensionsLoading ? (
                                <div className="fl-filter-loading-container">
                                    <div className="fl-loading-spinner"></div>
                                    正在加载筛选选项...
                                </div>
                            ) : filterDimensions.length > 0 ? (
                                filterDimensions.map((dimension) => {
                                    console.log('渲染筛选维度:', dimension.name, '子项数量:', dimension.children ? dimension.children.length : 0);
                                    console.log('维度详情:', dimension);
                                    
                                    // 特殊处理"专有属性"：不显示"专有属性"标题，直接显示其子项作为独立维度
                                    if (dimension.name === '专有属性') {
                                        return dimension.children && dimension.children.length > 0 ? (
                                            dimension.children.map((child) => {
                                                console.log('  渲染专有属性子项:', child.name);
                                                return (
                                                    <div key={child.dimensionId} className="fl-category-item">
                                                        <dt className="fl-category-title">{child.name}：</dt>
                                                        <dd className="fl-category-buttons">
                                                            {child.children && child.children.length > 0 ? (
                                                                child.children.map((grandChild) => {
                                                                    console.log('    渲染专有属性值:', grandChild.name);
                                                                    return (
                                                                        <button
                                                                            key={grandChild.dimensionId}
                                                                            onClick={() => handleFilterChange(child.name, grandChild.name)}
                                                                            className={`fl-category-button ${selectedFilters[child.name] === grandChild.name ? 'selected' : ''}`}
                                                                        >
                                                                            {grandChild.name}
                                                                        </button>
                                                                    );
                                                                })
                                                            ) : (
                                                                <span style={{color: '#999', fontSize: '14px'}}>无选项</span>
                                                            )}
                                                        </dd>
                                                    </div>
                                                );
                                            })
                                        ) : null;
                                    }
                                    
                                    // 其他维度正常渲染（level=1, parentId=0），其子项会在同一行显示
                                    return (
                                        <div key={dimension.dimensionId} className="fl-category-item">
                                            <dt className="fl-category-title">{dimension.name}：</dt>
                                            <dd className="fl-category-buttons">
                                                {dimension.children && dimension.children.length > 0 ? (
                                                    dimension.children.map((child) => {
                                                        console.log('  渲染子项:', child.name);
                                                        return (
                                                            <button
                                                                key={child.dimensionId}
                                                                onClick={() => handleFilterChange(dimension.name, child.name)}
                                                                className={`fl-category-button ${selectedFilters[dimension.name] === child.name ? 'selected' : ''}`}
                                                            >
                                                                {child.name}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <span style={{color: '#999', fontSize: '14px'}}>无选项</span>
                                                )}
                                            </dd>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{color: '#999', fontStyle: 'italic', padding: '20px', textAlign: 'center'}}>
                                    暂无筛选维度数据
                                    <br/>
                                    <small>调试信息: filterDimensions长度: {filterDimensions.length}</small>
                                </div>
                            )}
                        </>
                    )}

                    {/* 当前筛选信息显示 - 移动到分类筛选区域内 */}
                    {selectedCategory && (
                        <div className="fl-category-item">
                            <dt className="fl-category-title">当前筛选：</dt>
                            <dd className="fl-category-buttons">
                                <span style={{
                                    display: 'inline-block',
                                    background: '#fff2f0',
                                    border: '1px solid #ffccc7',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '14px',
                                    color: '#e64340'
                                }}>
                                    {selectedCategory}
                                    {selectedSubcategory && ` > ${selectedSubcategory}`}
                                    {Object.keys(selectedFilters).length > 0 && (
                                        <span style={{marginLeft: '8px'}}>
                                            {Object.entries(selectedFilters).map(([key, value]) => (
                                                <span key={key} style={{marginRight: '8px'}}>
                                                    {key}: {value}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </span>
                            </dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* 排序与筛选选项 */}
            <div className="fl-sort-filter-section">
                {['综合', '新品', '销量'].map((type) => (
                    <button
                        key={type}
                        onClick={() => {
                            setSortType(type);
                            setSortOrder('desc');
                        }}
                        className={`fl-sort-button ${sortType === type ? 'selected' : ''}`}
                    >
                        {type}
                    </button>
                ))}
                <button
                    onClick={() => {
                        setSortType('价格');
                        setSortOrder(sortType === '价格' && sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                    className={`fl-sort-button ${sortType === '价格' ? 'selected' : ''}`}
                >
                    价格 {sortType === '价格' ? (sortOrder === 'asc' ? '↑' : '↓') : '↑'}
                </button>
                <div className="fl-filter-options-container">
                    <select 
                        className="fl-filter-select"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                    >
                        <option value="北京市">收货地：北京市</option>
                        <option value="上海市">收货地：上海市</option>
                        <option value="广州市">收货地：广州市</option>
                        <option value="深圳市">收货地：深圳市</option>
                        <option value="杭州市">收货地：杭州市</option>
                    </select>
                    <label className="fl-filter-label">
                        <input 
                            type="checkbox" 
                            checked={isPromotion}
                            onChange={(e) => setIsPromotion(e.target.checked)}
                        />
                        促销
                    </label>
                    <label className="fl-filter-label">
                        <input 
                            type="checkbox" 
                            checked={supportInstallment}
                            onChange={(e) => setSupportInstallment(e.target.checked)}
                        />
                        分期
                    </label>
                    <label className="fl-filter-label">
                        <input 
                            type="checkbox" 
                            checked={onlyInStock}
                            onChange={(e) => setOnlyInStock(e.target.checked)}
                        />
                        仅看有货
                    </label>
                </div>
            </div>

            {/* 商品展示区 */}
            <div className="fl-products-section" style={{ marginBottom: '60px' }}>

                {/* 商品数量和加载状态 */}
                <div className="fl-products-header">
                    {loading ? (
                        <div className="fl-loading">正在加载商品...</div>
                    ) : (
                        <div className="fl-products-count">
                            共找到 {totalProducts} 件商品
                        </div>
                    )}
                </div>

                {/* 商品列表 */}
                {!loading && (
                    <div className="fl-products-grid">
                        {products.length > 0 ? (
                            products.map(product => (
                                <div 
                                    key={product.productId} 
                                    className="fl-product-card"
                                    onClick={() => navigate(`/product/${product.productId}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="fl-product-image" style={{backgroundColor: '#f0f0f0'}}>
                                        {product.thumbnailUrl ? (
                                            <img 
                                                src={`http://localhost:8081${product.thumbnailUrl}`}
                                                alt={product.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                                onError={(e) => {
                                                    // 图片加载失败时显示占位图
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            display: product.thumbnailUrl ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            color: '#999',
                                            fontSize: '14px'
                                        }}>
                                            商品图片
                                        </div>
                                    </div>
                                    <div className="fl-product-name" title={product.name}>
                                        {product.name}
                                    </div>
                                    <div className="fl-product-info">
                                        <div className="fl-product-price">
                                            <span className="fl-current-price">¥{product.price}</span>
                                            {product.marketPrice && product.marketPrice > product.price && (
                                                <span className="fl-market-price">¥{product.marketPrice}</span>
                                            )}
                                        </div>
                                        <div className="fl-product-stock">
                                            库存: {product.stock > 0 ? product.stock : '暂无库存'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="fl-no-products">
                                <div className="fl-no-products-icon">📦</div>
                                <div className="fl-no-products-text">
                                    <h3>暂无商品</h3>
                                    <p>请尝试调整筛选条件或选择其他分类</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 分页组件 */}
                {!loading && products.length > 0 && (
                    <div className="fl-pagination-container">
                        <div className="fl-pagination-info">
                            <span>共 {totalProducts} 件商品</span>
                            <span>每页显示</span>
                            <select 
                                value={pageSize} 
                                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                className="fl-page-size-select"
                            >
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={36}>36</option>
                                <option value={48}>48</option>
                                <option value={60}>60</option>
                            </select>
                            <span>件</span>
                        </div>
                        
                        <div className="fl-pagination">
                            <button 
                                className="fl-pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                上一页
                            </button>
                            
                            {/* 页码按钮 */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        className={`fl-pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button 
                                className="fl-pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* 底部导航信息 */}
            <FooterSection />
            
            {/* 右侧边栏按钮 */}
            <RightSidebar />
            </div>
        </div>
    );
};

export default ProductFilter;
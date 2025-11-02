import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RightSidebar from '../components/RightSidebar';
import FooterSection from '../components/FooterSection';
import { useAuth } from '../context/AuthContext';
import { showModal } from '../utils/modal';
import { useDataRefresh } from '../hooks/useDataRefresh';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8081/api';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    const [product, setProduct] = useState(null);
    const [productAttrs, setProductAttrs] = useState({});
    const [extendAttrs, setExtendAttrs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSpec, setSelectedSpec] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [options, setOptions] = useState({ specs: [], colors: [], services: [] });
    const [activeTab, setActiveTab] = useState('detail');
    const [quantity, setQuantity] = useState(1);

    // 商品图片数据
    const [productImages, setProductImages] = useState([]);

    // 建材产品规格选项
    const specOptions = [
        { value: '800x800mm', label: '800×800mm', price: 0 },
        { value: '600x600mm', label: '600×600mm', price: -20 },
        { value: '300x600mm', label: '300×600mm', price: -30 }
    ];

    // 建材产品颜色选项
    const colorOptions = [
        { value: 'white', label: '白色', color: '#ffffff' },
        { value: 'beige', label: '米色', color: '#f5f5dc' },
        { value: 'gray', label: '灰色', color: '#808080' },
        { value: 'brown', label: '棕色', color: '#8b4513' }
    ];

    // 页面挂载时滚动到顶部
    useEffect(() => {
        // 确保页面滚动到顶部
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);
    
    // 获取商品详情
    const fetchProductDetail = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        try {
            // 获取商品基本信息
            const productResponse = await axios.get(`${API_BASE_URL}/products/${productId}`);
            if (productResponse.data.code === 200) {
                const productData = productResponse.data.data;
                setProduct(productData);
                
                // 处理商品图片
                if (productData.images && productData.images.length > 0) {
                    // 如果有图片数组，使用图片数组
                    const imageUrls = productData.images.map(img => 
                        `http://localhost:8081${img.imageUrl}?t=${new Date().getTime()}`
                    );
                    setProductImages(imageUrls);
                } else if (productData.thumbnailUrl) {
                    // 如果只有缩略图，使用缩略图
                    setProductImages([`http://localhost:8081${productData.thumbnailUrl}?t=${new Date().getTime()}`]);
                } else {
                    // 设置默认图片
                    setProductImages(['data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23f8f8f8%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285%22%20y%3D%22220%22%3E暂无图片%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E']);
                }
            }

            // 获取商品通用属性
            const attrsResponse = await axios.get(`${API_BASE_URL}/products/${productId}/attributes`);
            if (attrsResponse.data.code === 200) {
                setProductAttrs(attrsResponse.data.data);
            }

            // 获取商品扩展属性
            const extendResponse = await axios.get(`${API_BASE_URL}/products/${productId}/extend-attributes`);
            if (extendResponse.data.code === 200) {
                setExtendAttrs(extendResponse.data.data);
            }

            // 获取动态可选项（规格/颜色/服务）
            const optionsResponse = await axios.get(`${API_BASE_URL}/products/${productId}/options`);
            if (optionsResponse.data.code === 200) {
                const o = optionsResponse.data.data || {};
                setOptions({
                    specs: Array.isArray(o.specs) ? o.specs : [],
                    colors: Array.isArray(o.colors) ? o.colors : [],
                    services: Array.isArray(o.services) ? o.services : []
                });
            }

        } catch (error) {
            console.error('获取商品详情失败:', error);
            // 如果API返回错误，设置product为null以显示"商品不存在"
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    // 初始加载
    useEffect(() => {
        fetchProductDetail();
    }, [fetchProductDetail]);

    // 使用数据刷新Hook，监听商品数据更新（当管理端修改商品后自动刷新）
    useDataRefresh(fetchProductDetail, 'products', {
        pollingInterval: 30000, // 30秒轮询一次，确保商品信息实时更新
        enableVisibilityRefresh: true
    });

    // 计算当前价格
    const getCurrentPrice = () => {
        if (!product) return 0;
        let basePrice = product.promotionPrice || product.price;
        
        // demo: 如果规格中包含 600x600/300x600 进行价格微调（后端可返回更具体定价规则）
        if (selectedSpec.includes('600')) basePrice = Number(basePrice) - 20;
        if (selectedSpec.includes('300x600')) basePrice = Number(basePrice) - 30;
        
        return basePrice;
    };

    // 处理立即购买
    const handleBuyNow = () => {
        if (!isAuthenticated) {
            showModal.warning('请先登录', () => {
                navigate('/auth');
            });
            return;
        }

        // 检查是否选择了规格和颜色
        if (!selectedSpec) {
            showModal.warning('请选择商品规格');
            return;
        }
        if (!selectedColor) {
            showModal.warning('请选择商品颜色');
            return;
        }

        // 构建订单数据
        const orderData = {
            productId: parseInt(productId),
            name: product.name,
            price: getCurrentPrice(),
            quantity: quantity,
            spec: selectedSpec,
            color: selectedColor,
            image: productImages[selectedImageIndex] || productImages[0] || ''
        };

        console.log('立即购买数据:', orderData);

        // 跳转到订单确认页面
        navigate('/order-confirm', {
            state: {
                orderData: orderData,
                orderType: 'buy_now'
            }
        });
    };

    // 处理加入购物车
    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        if (!selectedSpec) {
            showModal.warning('请选择规格');
            return;
        }

        if (!selectedColor) {
            showModal.warning('请选择颜色');
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/cart/items`,
                {
                    productId,
                    spec: selectedSpec,
                    color: selectedColor,
                    quantity
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.code === 200) {
                console.log('加入购物车成功，显示成功弹窗');
                showModal.success('成功加入购物车');
                // 触发购物车更新事件
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                console.log('加入购物车失败:', response.data.message);
                showModal.error(response.data.message || '加入购物车失败');
            }
        } catch (error) {
            console.error('加入购物车失败:', error);
            showModal.error('加入购物车失败，请稍后重试');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                加载中...
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                商品不存在
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            paddingTop: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* 面包屑导航 */}
                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>首页</span>
                    <span style={{ margin: '0 8px' }}>&gt;</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>商品列表</span>
                    <span style={{ margin: '0 8px' }}>&gt;</span>
                    <span style={{ color: '#333' }}>{product.name}</span>
                </div>

                {/* 主要内容区域 */}
                <div style={{
                    display: 'flex',
                    padding: '30px'
                }}>
                    {/* 左侧商品图片区域 */}
                    <div style={{
                        width: '50%',
                        paddingRight: '30px'
                    }}>
                        {/* 主图 */}
                        <div style={{
                            width: '100%',
                            height: '400px',
                            backgroundColor: '#f8f8f8',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '15px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={productImages[selectedImageIndex] || ''}
                                alt={product.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23f8f8f8%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285%22%20y%3D%22220%22%3E暂无图片%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                }}
                            />
                            {/* 左右切换按钮 */}
                            <button
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                            >
                                ‹
                            </button>
                            <button
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => setSelectedImageIndex(Math.min(productImages.length - 1, selectedImageIndex + 1))}
                            >
                                ›
                            </button>
                        </div>

                        {/* 缩略图 */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center'
                        }}>
                            {productImages.length > 0 ? productImages.map((image, index) => (
                                <div
                                    key={`thumb-${index}-${new Date().getTime()}`}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#f8f8f8',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: selectedImageIndex === index ? '2px solid #ff6900' : '2px solid transparent',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2060%2060%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%2260%22%20height%3D%2260%22%20fill%3D%22%23f8f8f8%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2210%22%20y%3D%2235%22%3E无图%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                        }}
                                    />
                                </div>
                            )) : (
                                <div style={{ color: '#999', fontSize: '14px', textAlign: 'center', width: '100%' }}>暂无更多图片</div>
                            )}
                        </div>
                    </div>

                    {/* 右侧商品信息区域 */}
                    <div style={{
                        width: '50%',
                        paddingLeft: '30px'
                    }}>
                        {/* 商品标题 */}
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            color: '#333',
                            lineHeight: '1.4'
                        }}>
                            {product.name}
                        </h1>

                        {/* 商品特色 */}
                        <div style={{
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                lineHeight: '1.6'
                            }}>
                                {productAttrs.material && `材质: ${productAttrs.material} | `}
                                {productAttrs.spec && `规格: ${productAttrs.spec} | `}
                                {productAttrs.env_grade && `环保等级: ${productAttrs.env_grade} | `}
                                {productAttrs.style && `风格: ${productAttrs.style}`}
                            </div>
                        </div>

                        {/* 商家信息 */}
                        <div style={{
                            marginBottom: '20px',
                            padding: '10px 0',
                            borderBottom: '1px solid #f0f0f0'
                        }}>
                            <span style={{
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                商家: <span style={{ color: '#ff6900', fontWeight: 'bold' }}>官方自营</span>
                            </span>
                        </div>

                        {/* 价格区域 */}
                        <div style={{
                            marginBottom: '25px',
                            padding: '20px',
                            backgroundColor: '#fff7f0',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '10px',
                                marginBottom: '10px'
                            }}>
                                <span style={{
                                    fontSize: '32px',
                                    color: '#ff6900',
                                    fontWeight: 'bold'
                                }}>
                                    ¥{getCurrentPrice()}
                                </span>
                                {product.marketPrice && product.marketPrice > getCurrentPrice() && (
                                    <span style={{
                                        fontSize: '16px',
                                        color: '#999',
                                        textDecoration: 'line-through'
                                    }}>
                                        ¥{product.marketPrice}
                                    </span>
                                )}
                            </div>
                            {product.isPromotion && (
                                <div style={{
                                    fontSize: '14px',
                                    color: '#ff6900'
                                }}>
                                    限时促销，优惠价 ¥{product.promotionPrice}
                                </div>
                            )}
                        </div>

                        {/* 配送信息 */}
                        <div style={{
                            marginBottom: '25px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                marginBottom: '5px'
                            }}>
                                配送至: <span style={{ color: '#333' }}>北京市 海淀区</span>
                                <span style={{
                                    color: '#ff6900',
                                    marginLeft: '10px',
                                    cursor: 'pointer'
                                }}>
                                    修改
                                </span>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#52c41a'
                            }}>
                                {product.stockStatus ? '有现货' : '暂时缺货'}
                            </div>
                        </div>

                        {/* 规格选择（动态） */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                color: '#333'
                            }}>
                                选择规格
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {options.specs && options.specs.length > 0 ? (
                                    options.specs.map((spec) => (
                                        <button
                                            key={spec}
                                            style={{
                                                padding: '8px 16px',
                                                border: selectedSpec === spec ? '2px solid #ff6900' : '1px solid #ddd',
                                                borderRadius: '4px',
                                                backgroundColor: selectedSpec === spec ? '#fff7f0' : 'white',
                                                color: selectedSpec === spec ? '#ff6900' : '#333',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            onClick={() => setSelectedSpec(spec)}
                                        >
                                            {spec}
                                        </button>
                                    ))
                                ) : (
                                    <span style={{ color: '#999' }}>暂无规格</span>
                                )}
                            </div>
                        </div>

                        {/* 颜色选择（动态） */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                color: '#333'
                            }}>
                                选择颜色
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {options.colors && options.colors.length > 0 ? (
                                    options.colors.map((color) => (
                                        <button
                                            key={color}
                                            style={{
                                                padding: '8px 16px',
                                                border: selectedColor === color ? '2px solid #ff6900' : '1px solid #ddd',
                                                borderRadius: '4px',
                                                backgroundColor: selectedColor === color ? '#fff7f0' : 'white',
                                                color: selectedColor === color ? '#ff6900' : '#333',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color}
                                        </button>
                                    ))
                                ) : (
                                    <span style={{ color: '#999' }}>暂无颜色选项</span>
                                )}
                            </div>
                        </div>

                        {/* 数量选择 */}
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                color: '#333'
                            }}>
                                数量
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <button
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{
                                        width: '60px',
                                        height: '32px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        fontSize: '14px'
                                    }}
                                />
                                <button
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* 服务选择（动态） */}
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                color: '#333'
                            }}>
                                选择服务
                            </div>
                            <div style={{ padding: '15px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                                {options.services && options.services.length > 0 ? (
                                    options.services.map((srv) => (
                                        <label key={srv} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '8px' }}>
                                            <input type="checkbox" />
                                            <span style={{ fontSize: '14px', color: '#333' }}>{srv}</span>
                                        </label>
                                    ))
                                ) : (
                                    <span style={{ color: '#999' }}>暂无服务可选</span>
                                )}
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div style={{
                            display: 'flex',
                            gap: '15px'
                        }}>
                            <button
                                style={{
                                    flex: 1,
                                    height: '50px',
                                    backgroundColor: '#ff6900',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#e55a00'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ff6900'}
                                onClick={handleBuyNow}
                            >
                                立即购买
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    height: '50px',
                                    backgroundColor: '#52c41a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#389e0d'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#52c41a'}
                                onClick={handleAddToCart}
                            >
                                加入购物车
                            </button>
                        </div>
                    </div>
                </div>

                {/* 商品详情标签页（动态） */}
                <div style={{
                    borderTop: '1px solid #f0f0f0',
                    padding: '0 30px'
                }}>
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        {[
                            { key: 'detail', label: '商品详情' },
                            { key: 'specs', label: '规格参数' },
                            { key: 'reviews', label: '用户评价' },
                            { key: 'after', label: '售后服务' }
                        ].map((tab) => (
                            <div
                                key={tab.key}
                                style={{
                                    padding: '15px 20px',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === tab.key ? '2px solid #ff6900' : '2px solid transparent',
                                    color: activeTab === tab.key ? '#ff6900' : '#666',
                                    fontWeight: activeTab === tab.key ? 'bold' : 'normal'
                                }}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                    <div style={{
                        padding: '30px 0',
                        minHeight: '300px'
                    }}>
                        {activeTab === 'detail' && (
                            <div style={{ fontSize: '16px', color: '#333', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {product.detailDescription || '暂无商品详情'}
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.8' }}>
                                <h4 style={{ color: '#666', marginBottom: '10px' }}>通用参数</h4>
                                <ul style={{ paddingLeft: '20px', color: '#666' }}>
                                    {productAttrs.material && <li>材质: {productAttrs.material}</li>}
                                    {productAttrs.env_grade && <li>环保等级: {productAttrs.env_grade}</li>}
                                    {productAttrs.style && <li>风格: {productAttrs.style}</li>}
                                    {productAttrs.warranty && <li>保修期: {productAttrs.warranty}</li>}
                                    {productAttrs.power && <li>功率: {productAttrs.power}</li>}
                                </ul>
                                {extendAttrs && extendAttrs.length > 0 && (
                                    <>
                                        <h4 style={{ color: '#666', margin: '16px 0 10px' }}>扩展参数</h4>
                                        <ul style={{ paddingLeft: '20px', color: '#666' }}>
                                            {extendAttrs.map((a, idx) => (
                                                <li key={idx}>{a.attrKey}: {a.attrValue}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div style={{ color: '#666' }}>用户评价功能待实现（建议后端新增评价表，提供分页接口）</div>
                        )}
                        {activeTab === 'after' && (
                            <div style={{ color: '#666' }}>售后服务内容待接入（可在扩展属性或商品详情中维护）</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 右侧固定边栏 */}
            <RightSidebar />

            {/* 底部导航栏 */}
            <div style={{ marginTop: '60px' }}>
                <FooterSection />
            </div>
        </div>
    );
};

export default ProductDetailPage;

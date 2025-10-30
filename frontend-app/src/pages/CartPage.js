import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FooterSection from '../components/FooterSection';
import { useAuth } from '../context/AuthContext';
import { showModal } from '../utils/modal';

const API_BASE_URL = 'http://localhost:8081/api';

const CartPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);

    // 页面挂载时滚动到顶部
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);

    // 获取购物车数据
    useEffect(() => {
        if (isAuthenticated) {
            fetchCartItems();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/cart/items`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.code === 200) {
                setCartItems(response.data.data);
                console.log('购物车数据:', response.data.data);
            } else {
                console.error('获取购物车数据失败:', response.data.message);
            }
        } catch (error) {
            console.error('获取购物车数据失败:', error);
            if (error.response) {
                console.error('错误响应:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    // 删除单个商品
    const handleRemoveItem = async (itemId) => {
        showModal.confirm('确定要删除这个商品吗？', '确认删除', async () => {
            await performRemoveItem(itemId);
        });
    };

    const performRemoveItem = async (itemId) => {

        try {
            const response = await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.code === 200) {
                showModal.success('删除成功');
                // 重新获取购物车数据
                await fetchCartItems();
                // 清除选中状态
                const newSelected = new Set(selectedItems);
                newSelected.delete(itemId);
                setSelectedItems(newSelected);
                // 触发购物车更新事件
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                showModal.error(response.data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除商品失败:', error);
            showModal.error('删除失败，请稍后重试');
        }
    };

    // 批量删除商品
    const handleBatchRemove = async () => {
        if (selectedItems.size === 0) {
            showModal.warning('请选择要删除的商品');
            return;
        }

        showModal.confirm(`确定要删除选中的 ${selectedItems.size} 个商品吗？`, '确认批量删除', async () => {
            await performBatchRemove();
        });
    };

    const performBatchRemove = async () => {

        try {
            const response = await axios.delete(`${API_BASE_URL}/cart/items/batch`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: {
                    itemIds: Array.from(selectedItems)
                }
            });
            
            if (response.data.code === 200) {
                showModal.success('批量删除成功');
                // 重新获取购物车数据
                await fetchCartItems();
                // 清除选中状态
                setSelectedItems(new Set());
                setIsAllSelected(false);
                // 触发购物车更新事件
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                showModal.error(response.data.message || '批量删除失败');
            }
        } catch (error) {
            console.error('批量删除失败:', error);
            showModal.error('批量删除失败，请稍后重试');
        }
    };

    // 更新商品数量
    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            showModal.warning('数量不能小于1');
            return;
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/cart/items/${itemId}`, {
                quantity: newQuantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.code === 200) {
                // 重新获取购物车数据
                await fetchCartItems();
                // 触发购物车更新事件
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                showModal.error(response.data.message || '更新数量失败');
            }
        } catch (error) {
            console.error('更新数量失败:', error);
            showModal.error('更新数量失败，请稍后重试');
        }
    };

    // 处理商品选择
    const handleItemSelect = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
        setIsAllSelected(newSelected.size === cartItems.length);
    };

    // 处理全选
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cartItems.map(item => item.id)));
        }
        setIsAllSelected(!isAllSelected);
    };

    // 计算选中商品总价
    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.has(item.id))
            .reduce((total, item) => total + (item.price * item.quantity), 0)
            .toFixed(2);
    };

    // 处理去结算
    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            showModal.warning('请选择要结算的商品');
            return;
        }

        // 获取选中的商品
        const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
        
        // 构建订单数据
        const orderData = selectedCartItems.map(item => ({
            productId: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            spec: item.spec || '',
            color: item.color || '',
            image: item.thumbnailUrl || ''
        }));

        console.log('购物车结算数据:', orderData);

        // 跳转到订单确认页面
        navigate('/order-confirm', {
            state: {
                orderData: orderData,
                orderType: 'cart_checkout'
            }
        });
    };

    // 未登录状态的购物车界面
    const UnauthorizedCart = () => (
        <div style={{
            backgroundColor: '#f5f5f5',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0'
        }}>
            <div style={{
                width: '1200px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <img 
                    src="/images/empty-cart.png" 
                    alt="空购物车" 
                    style={{
                        width: '180px',
                        marginBottom: '20px'
                    }}
                />
                <h2 style={{
                    fontSize: '24px',
                    color: '#333',
                    marginBottom: '20px'
                }}>
                    您的购物车还是空的！
                </h2>
                <p style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '30px'
                }}>
                    登录后将显示您之前加入的商品
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/auth')}
                        style={{
                            padding: '12px 40px',
                            fontSize: '16px',
                            backgroundColor: '#ff6900',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        立即登录
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '12px 40px',
                            fontSize: '16px',
                            backgroundColor: '#fff',
                            color: '#ff6900',
                            border: '1px solid #ff6900',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        马上去购物
                    </button>
                </div>
            </div>
        </div>
    );

    // 已登录状态的购物车界面
    const AuthorizedCart = () => (
        <div style={{
            backgroundColor: '#f5f5f5',
            minHeight: '400px',
            padding: '20px 0'
        }}>
            <div style={{
                width: '1200px',
                margin: '0 auto'
            }}>
                {/* 购物车头部 */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    padding: '15px 20px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div style={{ flex: '1' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                style={{ marginRight: '10px' }}
                            />
                            全选
                        </label>
                    </div>
                    <div style={{ width: '120px', textAlign: 'center' }}>单价</div>
                    <div style={{ width: '120px', textAlign: 'center' }}>数量</div>
                    <div style={{ width: '120px', textAlign: 'center' }}>小计</div>
                    <div style={{ width: '80px', textAlign: 'center' }}>操作</div>
                </div>

                {/* 购物车商品列表 */}
                {cartItems.length > 0 ? (
                    <div style={{ marginBottom: '20px' }}>
                        {cartItems.map(item => (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{
                                    flex: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => handleItemSelect(item.id)}
                                    />
                                    <img
                                        src={`http://localhost:8081${item.thumbnailUrl}`}
                                        alt={item.productName}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <div>
                                        <div style={{
                                            fontSize: '16px',
                                            marginBottom: '5px'
                                        }}>
                                            {item.productName}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#666'
                                        }}>
                                            {item.spec}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    width: '120px',
                                    textAlign: 'center',
                                    color: '#ff6900'
                                }}>
                                    ¥{item.price}
                                </div>
                                <div style={{
                                    width: '120px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px'
                                    }}>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                border: '1px solid #ddd',
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                borderRadius: '2px'
                                            }}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const newQuantity = parseInt(e.target.value) || 1;
                                                if (newQuantity !== item.quantity) {
                                                    handleUpdateQuantity(item.id, newQuantity);
                                                }
                                            }}
                                            style={{
                                                width: '40px',
                                                height: '24px',
                                                textAlign: 'center',
                                                border: '1px solid #ddd',
                                                borderRadius: '2px'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                border: '1px solid #ddd',
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                borderRadius: '2px'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div style={{
                                    width: '120px',
                                    textAlign: 'center',
                                    color: '#ff6900',
                                    fontWeight: 'bold'
                                }}>
                                    ¥{(item.price * item.quantity).toFixed(2)}
                                </div>
                                <div style={{
                                    width: '80px',
                                    textAlign: 'center'
                                }}>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            color: '#666',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = '#ff6900'}
                                        onMouseLeave={(e) => e.target.style.color = '#666'}
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <p>购物车是空的，去添加商品吧~</p>
                    </div>
                )}

                {/* 购物车底部结算栏 */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                style={{ marginRight: '10px' }}
                            />
                            全选
                        </label>
                        <button
                            onClick={handleBatchRemove}
                            style={{
                                border: 'none',
                                background: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#ff6900'}
                            onMouseLeave={(e) => e.target.style.color = '#666'}
                        >
                            删除选中商品
                        </button>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div>
                            已选择 <span style={{ color: '#ff6900' }}>{selectedItems.size}</span> 件商品
                        </div>
                        <div>
                            合计：<span style={{
                                color: '#ff6900',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>¥{calculateTotal()}</span>
                        </div>
                        <button
                            style={{
                                padding: '12px 40px',
                                fontSize: '16px',
                                backgroundColor: '#ff6900',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            disabled={selectedItems.size === 0}
                            onClick={handleCheckout}
                        >
                            去结算
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                加载中...
            </div>
        );
    }

    return (
        <div>
            {/* 页面标题 */}
            <div style={{
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#fff'
            }}>
                <div style={{
                    width: '1200px',
                    margin: '0 auto',
                    padding: '20px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        我的购物车
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ff6900',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#e55a00';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#ff6900';
                        }}
                    >
                        返回商品列表
                    </button>
                </div>
            </div>

            {/* 购物车主体内容 */}
            {isAuthenticated ? <AuthorizedCart /> : <UnauthorizedCart />}

            {/* 底部导航栏 */}
            <FooterSection />
        </div>
    );
};

export default CartPage;

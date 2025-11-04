import React, { useState, useEffect } from 'react';
import FooterSection from '../components/FooterSection';
import RightSidebar from '../components/RightSidebar';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const StorePage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('全部');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 示例门店数据（如果后端没有API，可以使用这些数据）
    const mockStores = [
        {
            id: 1,
            name: '筑家智选旗舰店（北京朝阳店）',
            city: '北京',
            address: '北京市朝阳区建国路88号SOHO现代城A座1层',
            phone: '010-88888888',
            businessHours: '09:00-21:00',
            image: '/images/store1.jpg',
            description: '旗舰店面积1000平方米，展示全系列产品，提供专业咨询服务',
            latitude: 39.9042,
            longitude: 116.4074,
            status: 1
        },
        {
            id: 2,
            name: '筑家智选体验店（上海浦东店）',
            city: '上海',
            address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦1层',
            phone: '021-66666666',
            businessHours: '10:00-22:00',
            image: '/images/store2.jpg',
            description: '体验店提供VR全景看房服务，让您身临其境感受装修效果',
            latitude: 31.2304,
            longitude: 121.4737,
            status: 1
        },
        {
            id: 3,
            name: '筑家智选精品店（广州天河店）',
            city: '广州',
            address: '广州市天河区天河路208号粤海天河城1层',
            phone: '020-77777777',
            businessHours: '09:30-21:30',
            image: '/images/store3.jpg',
            description: '精品店主打高端定制服务，一对一专属设计师为您服务',
            latitude: 23.1291,
            longitude: 113.2644,
            status: 1
        },
        {
            id: 4,
            name: '筑家智选标准店（深圳南山店）',
            city: '深圳',
            address: '深圳市南山区深南大道9678号大冲商务中心A座1层',
            phone: '0755-99999999',
            businessHours: '09:00-20:00',
            image: '/images/store4.jpg',
            description: '标准店提供基础产品和安装服务，满足日常家装需求',
            latitude: 22.5431,
            longitude: 114.0579,
            status: 1
        }
    ];

    // 获取门店列表
    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                // 尝试从后端API获取数据
                const response = await axios.get(`${API_BASE_URL}/stores/list`);
                if (response.data.code === 200 && response.data.data) {
                    setStores(response.data.data);
                } else {
                    // 如果API不存在，使用模拟数据
                    setStores(mockStores);
                }
            } catch (error) {
                console.error('获取门店列表失败:', error);
                // API不存在时使用模拟数据
                setStores(mockStores);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    // 获取所有城市列表
    const cities = ['全部', ...new Set(stores.map(store => store.city).filter(Boolean))];

    // 筛选门店
    const filteredStores = stores.filter(store => {
        const matchCity = selectedCity === '全部' || store.city === selectedCity;
        const matchKeyword = !searchKeyword || 
            store.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            store.address.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchCity && matchKeyword && store.status === 1;
    });

    // 获取门店图片URL
    const getStoreImageUrl = (image) => {
        if (!image) {
            return '/images/default-store.jpg';
        }
        if (image.startsWith('http') || image.startsWith('data:')) {
            return image;
        }
        return `http://localhost:8081${image}`;
    };

    // 打开地图导航
    const openMap = (store) => {
        if (store.latitude && store.longitude) {
            // 将BigDecimal转换为数字字符串
            const lat = typeof store.latitude === 'object' ? store.latitude.toString() : store.latitude;
            const lng = typeof store.longitude === 'object' ? store.longitude.toString() : store.longitude;
            // 使用百度地图或高德地图
            const mapUrl = `https://api.map.baidu.com/marker?location=${lat},${lng}&title=${encodeURIComponent(store.name)}&content=${encodeURIComponent(store.address)}&output=html&src=筑家智选`;
            window.open(mapUrl, '_blank');
        }
    };

    // 拨打电话
    const callPhone = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
                fontSize: '18px',
                color: '#666'
            }}>
                加载中...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <style>
                {`
                    .store-page-container {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 40px 20px;
                    }

                    .store-page-header {
                        text-align: center;
                        margin-bottom: 50px;
                    }

                    .store-page-title {
                        font-size: 42px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 15px;
                    }

                    .store-page-subtitle {
                        font-size: 18px;
                        color: #666;
                        margin-bottom: 30px;
                    }

                    .store-filters {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-bottom: 40px;
                        flex-wrap: wrap;
                    }

                    .filter-group {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .filter-label {
                        font-size: 16px;
                        color: #666;
                    }

                    .city-select {
                        padding: 10px 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .city-select:hover {
                        border-color: #c57237;
                    }

                    .city-select:focus {
                        outline: none;
                        border-color: #c57237;
                        box-shadow: 0 0 0 2px rgba(197, 114, 55, 0.2);
                    }

                    .search-input {
                        padding: 10px 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        min-width: 300px;
                        transition: all 0.3s ease;
                    }

                    .search-input:focus {
                        outline: none;
                        border-color: #c57237;
                        box-shadow: 0 0 0 2px rgba(197, 114, 55, 0.2);
                    }

                    .store-stats {
                        display: flex;
                        justify-content: center;
                        gap: 40px;
                        margin-top: 30px;
                        flex-wrap: wrap;
                    }

                    .stat-item {
                        text-align: center;
                    }

                    .stat-number {
                        font-size: 32px;
                        font-weight: bold;
                        color: #c57237;
                    }

                    .stat-label {
                        font-size: 16px;
                        color: #999;
                        margin-top: 5px;
                    }

                    .store-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                        gap: 30px;
                        margin-bottom: 50px;
                    }

                    .store-card {
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        transition: all 0.3s ease;
                    }

                    .store-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    }

                    .store-card-header {
                        position: relative;
                        height: 240px;
                        overflow: hidden;
                    }

                    .store-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }

                    .store-card:hover .store-image {
                        transform: scale(1.1);
                    }

                    .store-status-badge {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(82, 196, 26, 0.95);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: bold;
                    }

                    .store-card-body {
                        padding: 25px;
                    }

                    .store-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 15px;
                    }

                    .store-info-item {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 12px;
                        font-size: 14px;
                        color: #666;
                    }

                    .store-info-icon {
                        width: 20px;
                        margin-right: 10px;
                        margin-top: 2px;
                        flex-shrink: 0;
                    }

                    .store-info-text {
                        flex: 1;
                        line-height: 1.6;
                    }

                    .store-description {
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px solid #f0f0f0;
                        font-size: 14px;
                        color: #999;
                        line-height: 1.6;
                    }

                    .store-actions {
                        display: flex;
                        gap: 10px;
                        margin-top: 20px;
                    }

                    .btn-action {
                        flex: 1;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }

                    .btn-map {
                        background: linear-gradient(135deg, #c57237 0%, #e68b40 100%);
                        color: white;
                    }

                    .btn-map:hover {
                        background: linear-gradient(135deg, #b36227 0%, #d67b30 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(197, 114, 55, 0.3);
                    }

                    .btn-phone {
                        background: white;
                        color: #c57237;
                        border: 2px solid #c57237;
                    }

                    .btn-phone:hover {
                        background: #c57237;
                        color: white;
                    }

                    .empty-state {
                        text-align: center;
                        padding: 80px 20px;
                        color: #999;
                        font-size: 18px;
                    }

                    @media (max-width: 768px) {
                        .store-grid {
                            grid-template-columns: 1fr;
                        }

                        .store-page-title {
                            font-size: 32px;
                        }

                        .store-filters {
                            flex-direction: column;
                            align-items: stretch;
                        }

                        .search-input {
                            min-width: auto;
                            width: 100%;
                        }

                        .store-stats {
                            gap: 20px;
                        }
                    }
                `}
            </style>

            <div className="store-page-container">
                {/* 页面标题区域 */}
                <div className="store-page-header">
                    <h1 className="store-page-title">线下门店</h1>
                    <p className="store-page-subtitle">
                        全国多地设有线下体验店，欢迎到店咨询体验
                    </p>
                    {stores.length > 0 && (
                        <div className="store-stats">
                            <div className="stat-item">
                                <div className="stat-number">{stores.filter(s => s.status === 1).length}</div>
                                <div className="stat-label">营业门店</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{cities.length - 1}</div>
                                <div className="stat-label">覆盖城市</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 筛选区域 */}
                <div className="store-filters">
                    <div className="filter-group">
                        <span className="filter-label">城市：</span>
                        <select
                            className="city-select"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <span className="filter-label">搜索：</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="请输入门店名称或地址"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </div>
                </div>

                {/* 门店列表 */}
                {filteredStores.length === 0 ? (
                    <div className="empty-state">
                        <p>暂无门店数据</p>
                    </div>
                ) : (
                    <div className="store-grid">
                        {filteredStores.map((store) => (
                            <div key={store.id} className="store-card">
                                <div className="store-card-header">
                                    <img
                                        src={getStoreImageUrl(store.image)}
                                        alt={store.name}
                                        className="store-image"
                                        onError={(e) => {
                                            e.target.src = '/images/default-store.jpg';
                                        }}
                                    />
                                    {store.status === 1 && (
                                        <div className="store-status-badge">营业中</div>
                                    )}
                                </div>
                                <div className="store-card-body">
                                    <h3 className="store-name">{store.name}</h3>
                                    
                                    <div className="store-info-item">
                                        <span className="store-info-icon">📍</span>
                                        <span className="store-info-text">{store.address}</span>
                                    </div>
                                    
                                    <div className="store-info-item">
                                        <span className="store-info-icon">📞</span>
                                        <span className="store-info-text">{store.phone}</span>
                                    </div>
                                    
                                    <div className="store-info-item">
                                        <span className="store-info-icon">🕐</span>
                                        <span className="store-info-text">营业时间：{store.businessHours}</span>
                                    </div>

                                    {store.description && (
                                        <div className="store-description">
                                            {store.description}
                                        </div>
                                    )}

                                    <div className="store-actions">
                                        <button
                                            className="btn-action btn-map"
                                            onClick={() => openMap(store)}
                                        >
                                            <span>🗺️</span>
                                            <span>查看地图</span>
                                        </button>
                                        <button
                                            className="btn-action btn-phone"
                                            onClick={() => callPhone(store.phone)}
                                        >
                                            <span>📞</span>
                                            <span>拨打电话</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RightSidebar />
            <FooterSection />
        </div>
    );
};

export default StorePage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FooterSection from '../components/FooterSection';
import RightSidebar from '../components/RightSidebar';

const API_BASE_URL = 'http://localhost:8081/api';

const DesignerPage = () => {
    const navigate = useNavigate();
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(true);

    // 获取设计师列表
    useEffect(() => {
        const fetchDesigners = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/designers/list`);
                if (response.data.code === 200 && response.data.data) {
                    setDesigners(response.data.data);
                } else {
                    setDesigners([]);
                }
            } catch (error) {
                console.error('获取设计师列表失败:', error);
                setDesigners([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDesigners();
    }, []);

    // 处理预约设计师
    const handleAppointment = (designerId) => {
        navigate('/custom', { state: { scrollToAppointment: true, selectedDesignerId: designerId } });
    };

    // 获取头像URL
    const getAvatarUrl = (avatar) => {
        if (!avatar) {
            return '/images/default-avatar.jpg';
        }
        if (avatar.startsWith('http') || avatar.startsWith('data:')) {
            return avatar;
        }
        return `http://localhost:8081${avatar}`;
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
                    .designer-page-container {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 40px 20px;
                    }

                    .designer-page-header {
                        text-align: center;
                        margin-bottom: 50px;
                    }

                    .designer-page-title {
                        font-size: 42px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 15px;
                    }

                    .designer-page-subtitle {
                        font-size: 18px;
                        color: #666;
                        margin-bottom: 30px;
                    }

                    .designer-stats {
                        display: flex;
                        justify-content: center;
                        gap: 40px;
                        margin-top: 30px;
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

                    .designer-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 30px;
                        margin-bottom: 50px;
                    }

                    .designer-card {
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }

                    .designer-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    }

                    .designer-card-header {
                        position: relative;
                        height: 280px;
                        overflow: hidden;
                    }

                    .designer-avatar {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }

                    .designer-card:hover .designer-avatar {
                        transform: scale(1.1);
                    }

                    .designer-status-badge {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: rgba(255,255,255,0.95);
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: bold;
                        color: #52c41a;
                    }

                    .designer-card-body {
                        padding: 25px;
                    }

                    .designer-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 8px;
                    }

                    .designer-title {
                        font-size: 16px;
                        color: #c57237;
                        margin-bottom: 15px;
                    }

                    .designer-description {
                        font-size: 14px;
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 20px;
                        height: 60px;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                    }

                    .designer-specialties {
                        margin-bottom: 20px;
                    }

                    .specialty-label {
                        font-size: 13px;
                        color: #999;
                        margin-bottom: 8px;
                    }

                    .specialty-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .specialty-tag {
                        background: #f0f0f0;
                        color: #666;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                    }

                    .designer-stats-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 15px 0;
                        border-top: 1px solid #f0f0f0;
                        border-bottom: 1px solid #f0f0f0;
                        margin-bottom: 20px;
                    }

                    .designer-stat {
                        text-align: center;
                        flex: 1;
                    }

                    .designer-stat-number {
                        font-size: 20px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 5px;
                    }

                    .designer-stat-label {
                        font-size: 12px;
                        color: #999;
                    }

                    .designer-actions {
                        display: flex;
                        gap: 10px;
                    }

                    .btn-appointment {
                        flex: 1;
                        background: linear-gradient(135deg, #c57237 0%, #e68b40 100%);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .btn-appointment:hover {
                        background: linear-gradient(135deg, #b36227 0%, #d67b30 100%);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(197, 114, 55, 0.3);
                    }

                    .btn-view-detail {
                        flex: 1;
                        background: white;
                        color: #c57237;
                        border: 2px solid #c57237;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .btn-view-detail:hover {
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
                        .designer-grid {
                            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                            gap: 20px;
                        }

                        .designer-page-title {
                            font-size: 32px;
                        }

                        .designer-stats {
                            flex-wrap: wrap;
                            gap: 20px;
                        }
                    }
                `}
            </style>

            <div className="designer-page-container">
                {/* 页面标题区域 */}
                <div className="designer-page-header">
                    <h1 className="designer-page-title">专业设计师团队</h1>
                    <p className="designer-page-subtitle">
                        汇聚行业资深设计师，为您提供专业的全屋定制设计服务
                    </p>
                    {designers.length > 0 && (
                        <div className="designer-stats">
                            <div className="stat-item">
                                <div className="stat-number">{designers.length}</div>
                                <div className="stat-label">专业设计师</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{designers.reduce((sum, d) => sum + (d.caseCount || 0), 0)}</div>
                                <div className="stat-label">设计案例</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{Math.round(designers.reduce((sum, d) => {
                                    const exp = parseInt(d.experience) || 0;
                                    return sum + exp;
                                }, 0) / designers.length) || 0}</div>
                                <div className="stat-label">平均从业年限</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 设计师列表 */}
                {designers.length === 0 ? (
                    <div className="empty-state">
                        <p>暂无设计师数据</p>
                    </div>
                ) : (
                    <div className="designer-grid">
                        {designers.map((designer) => (
                            <div key={designer.id} className="designer-card">
                                <div className="designer-card-header">
                                    <img
                                        src={getAvatarUrl(designer.avatar)}
                                        alt={designer.name}
                                        className="designer-avatar"
                                        onError={(e) => {
                                            e.target.src = '/images/default-avatar.jpg';
                                        }}
                                    />
                                    {designer.status === 1 && (
                                        <div className="designer-status-badge">在线</div>
                                    )}
                                </div>
                                <div className="designer-card-body">
                                    <h3 className="designer-name">{designer.name}</h3>
                                    <div className="designer-title">{designer.title || '高级设计师'}</div>
                                    <p className="designer-description">
                                        {designer.description || '资深室内设计师，专注于全屋定制设计，为您的家打造理想空间。'}
                                    </p>
                                    
                                    {designer.specialties && (
                                        <div className="designer-specialties">
                                            <div className="specialty-label">擅长风格</div>
                                            <div className="specialty-tags">
                                                {(() => {
                                                    try {
                                                        // 尝试解析为JSON数组
                                                        const specialties = JSON.parse(designer.specialties);
                                                        if (Array.isArray(specialties)) {
                                                            return specialties.slice(0, 3).map((style, index) => (
                                                                <span key={index} className="specialty-tag">{style}</span>
                                                            ));
                                                        }
                                                    } catch (e) {
                                                        // 如果不是JSON，按逗号分隔
                                                        return designer.specialties.split(',').slice(0, 3).map((style, index) => (
                                                            <span key={index} className="specialty-tag">{style.trim()}</span>
                                                        ));
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="designer-stats-row">
                                        <div className="designer-stat">
                                            <div className="designer-stat-number">{designer.experience || '0'}</div>
                                            <div className="designer-stat-label">年经验</div>
                                        </div>
                                        <div className="designer-stat">
                                            <div className="designer-stat-number">{designer.caseCount || 0}</div>
                                            <div className="designer-stat-label">案例数</div>
                                        </div>
                                        <div className="designer-stat">
                                            <div className="designer-stat-number">{designer.rating ? parseFloat(designer.rating).toFixed(1) : '5.0'}</div>
                                            <div className="designer-stat-label">评分</div>
                                        </div>
                                    </div>

                                    <div className="designer-actions">
                                        <button
                                            className="btn-appointment"
                                            onClick={() => handleAppointment(designer.id)}
                                        >
                                            立即预约
                                        </button>
                                        <button
                                            className="btn-view-detail"
                                            onClick={() => navigate(`/custom`, { state: { scrollToDesigner: true, designerId: designer.id } })}
                                        >
                                            查看详情
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

export default DesignerPage;

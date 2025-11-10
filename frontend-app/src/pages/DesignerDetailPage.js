import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const DesignerDetailPage = () => {
    const navigate = useNavigate();
    const { designerId } = useParams();

    const [loading, setLoading] = useState(true);
    const [designer, setDesigner] = useState(null);
    const [cases, setCases] = useState([]);
    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(6);
    const totalPages = useMemo(() => Math.max(1, Math.ceil(cases.length / pageSize)), [cases.length, pageSize]);
    const pagedCases = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return cases.slice(start, start + pageSize);
    }, [cases, currentPage, pageSize]);

    // 获取头像URL
    const getAvatarUrl = (avatar) => {
        console.log('DesignerDetailPage - getAvatarUrl 输入:', avatar);
        if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
            console.log('DesignerDetailPage - 头像为空，返回默认头像');
            return '/images/default-avatar.jpg';
        }
        const trimmedAvatar = avatar.trim();
        if (trimmedAvatar.startsWith('http://') || trimmedAvatar.startsWith('https://') || trimmedAvatar.startsWith('data:')) {
            return trimmedAvatar;
        }
        // 确保路径以 / 开头
        const avatarPath = trimmedAvatar.startsWith('/') ? trimmedAvatar : `/${trimmedAvatar}`;
        const fullUrl = `http://localhost:8081${avatarPath}`;
        console.log('DesignerDetailPage - 构建的完整URL:', fullUrl);
        return fullUrl;
    };

    // 解析擅长风格
    const specialtiesList = useMemo(() => {
        if (!designer?.specialties) return [];
        try {
            const parsed = JSON.parse(designer.specialties);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return String(designer.specialties).split(',').map((s) => s.trim()).filter(Boolean);
    }, [designer]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [designerRes, casesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/designers/${designerId}`),
                    axios.get(`${API_BASE_URL}/custom-cases/list`)
                ]);

                if (designerRes.data?.code === 200) {
                    setDesigner(designerRes.data.data);
                }

                if (casesRes.data?.code === 200) {
                    const all = casesRes.data.data || [];
                    const filtered = all.filter((c) => String(c.designerId) === String(designerId));
                    setCases(filtered);
                    setCurrentPage(1);
                }
            } catch (err) {
                console.error('获取设计师详情失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // 页面滚动到顶
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [designerId]);

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

    if (!designer) {
        return (
            <div style={{ padding: 40 }}>
                未找到该设计师
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 16px 60px' }}>
                <style>
                    {`
                        .case-card {
                            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                            transition: box-shadow 0.25s ease, transform 0.25s ease;
                            border-radius: 12px;
                            overflow: hidden;
                            background: #fff;
                        }
                        .case-card:hover {
                            box-shadow: 0 12px 28px rgba(0,0,0,0.18);
                            transform: translateY(-4px);
                        }
                    `}
                </style>
                {/* 顶部返回与标题 */}
                <div style={{ marginBottom: 16 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            background: '#fff',
                            cursor: 'pointer'
                        }}
                    >返回</button>
                </div>

                {/* 基本信息 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr',
                    gap: 24,
                    background: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                    <img
                        src={getAvatarUrl(designer.avatar)}
                        alt={designer.name}
                        style={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 12 }}
                        onError={(e) => {
                            console.error('DesignerDetailPage - 头像加载失败:', {
                                designerId: designer.id,
                                designerName: designer.name,
                                avatar: designer.avatar,
                                attemptedUrl: e.target.src
                            });
                            e.target.src = '/images/default-avatar.jpg';
                        }}
                        onLoad={() => {
                            console.log('DesignerDetailPage - 头像加载成功:', designer.name, getAvatarUrl(designer.avatar));
                        }}
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h1 style={{ margin: 0, fontSize: 28 }}>{designer.name}</h1>
                            <span style={{ color: '#c57237' }}>{designer.title || '高级设计师'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 24, marginTop: 12, color: '#666' }}>
                            <div>从业年限：{designer.experience || '0'}年</div>
                            <div>案例数：{designer.caseCount || 0}</div>
                            <div>评分：{designer.rating ? parseFloat(designer.rating).toFixed(1) : '5.0'}</div>
                        </div>
                        {specialtiesList.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>擅长风格</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {specialtiesList.map((s, idx) => (
                                        <span key={idx} style={{ background: '#f3f3f3', padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {designer.description && (
                            <p style={{ color: '#555', lineHeight: 1.7, marginTop: 16 }}>{designer.description}</p>
                        )}
                        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => navigate(`/custom?tab=appointment&designerId=${designer.id}`)}
                                style={{
                                    padding: '10px 18px', background: '#c57237', color: '#fff', border: 'none',
                                    borderRadius: 8, cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >预约该设计师</button>
                        </div>
                    </div>
                </div>

                {/* 案例列表 */}
                <div style={{ marginTop: 28 }}>
                    <h2 style={{ fontSize: 22, margin: '8px 0 16px' }}>设计案例</h2>
                    {cases.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: 12, padding: 32, color: '#999' }}>该设计师暂时没有案例</div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 16
                        }}>
                            {pagedCases.map((c) => {
                                const cover = (c.images || '').split(',')[0] || '';
                                const coverUrl = cover.startsWith('http') ? cover : (`http://localhost:8081${cover.startsWith('/') ? '' : '/'}${cover}`);
                                return (
                                    <div key={c.id} className="case-card">
                                        <div style={{ height: 160, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/case/${c.id}`)}>
                                            <img src={coverUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: 14 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{c.title}</div>
                                            <div style={{ color: '#666', fontSize: 13 }}>
                                                <span>风格：{c.style || '-'}</span>
                                                <span style={{ marginLeft: 12 }}>面积：{c.area ? `${c.area}㎡` : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* 分页器：即使只有一页也显示，避免用户误解 */}
                    {cases.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 12px', border: '1px solid #ddd', background: '#fff', borderRadius: 8,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#bbb' : '#333'
                                }}
                            >上一页</button>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        style={{
                                            minWidth: 36, height: 36, borderRadius: 8, border: '1px solid #ddd', background: idx + 1 === currentPage ? '#c57237' : '#fff',
                                            color: idx + 1 === currentPage ? '#fff' : '#333', cursor: 'pointer', fontWeight: idx + 1 === currentPage ? 'bold' : 'normal'
                                        }}
                                    >{idx + 1}</button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 12px', border: '1px solid #ddd', background: '#fff', borderRadius: 8,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#bbb' : '#333'
                                }}
                            >下一页</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignerDetailPage;



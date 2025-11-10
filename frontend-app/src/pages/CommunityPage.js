import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { showModal } from '../utils/modal';
import FooterSection from '../components/FooterSection';

const API_BASE_URL = 'http://localhost:8081/api';

const CommunityPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, token, user } = useAuth();
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedType, setSelectedType] = useState(''); // 空字符串表示全部
    
    // 帖子类型选项
    const postTypes = [
        { value: '', label: '全部' },
        { value: 'INSPIRATION', label: '灵感分享' },
        { value: 'QUESTION', label: '问答' },
        { value: 'SHOWCASE', label: '作品展示' }
    ];
    
    // 获取帖子列表
    const fetchPosts = async (page = 1, type = '') => {
        setLoading(true);
        try {
            const params = {
                pageNum: page,
                pageSize: 10
            };
            if (type) {
                params.type = type;
            }
            const response = await axios.get(`${API_BASE_URL}/community-posts/page`, { params });
            if (response.data.code === 200) {
                const postsData = response.data.data.records || [];
                setPosts(postsData);
                setCurrentPage(response.data.data.current || 1);
                setTotalPages(response.data.data.pages || 1);
                
                // 点赞状态检查已移除，点击帖子跳转到详情页
            }
        } catch (error) {
            console.error('获取帖子列表失败:', error);
            showModal.error('获取帖子列表失败');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPosts(1, selectedType);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [selectedType]);
    
    // 点赞、评论、转发功能已移至详情页
    
    // 格式化时间
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const date = new Date(timeStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return date.toLocaleDateString('zh-CN');
    };
    
    // 获取帖子图片列表
    const getPostImages = (post) => {
        if (!post || !post.images) return { images: [], totalCount: 0 };
        const imageList = post.images.split(',').filter(img => img && img.trim()).map(img => {
            const trimmedImg = img.trim();
            if (trimmedImg.startsWith('http')) {
                return trimmedImg;
            }
            return `http://localhost:8081${trimmedImg.startsWith('/') ? '' : '/'}${trimmedImg}`;
        });
        // 返回前3张作为预览，以及总数量
        return {
            images: imageList.slice(0, 3),
            totalCount: imageList.length
        };
    };
    
    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 16px 60px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ margin: 0 }}>社区/灵感</h1>
                </div>
                
                {/* 发布表单已移除，跳转到独立页面 /publish-post */}
                
                {/* 筛选栏 */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap'
                }}>
                    {postTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => {
                                setSelectedType(type.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '8px 16px',
                                background: selectedType === type.value ? '#c57237' : '#f0f0f0',
                                color: selectedType === type.value ? '#fff' : '#333',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: selectedType === type.value ? 'bold' : 'normal'
                            }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                
                {/* 帖子列表 */}
                {loading && posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        加载中...
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        暂无内容，快来发布第一条吧！
                    </div>
                ) : (
                    <div>
                        {posts.map((post, index) => {
                            const postIdNum = Number(post.id);
                            return (
                                <div
                                    key={`post-${post.id}-${index}`}
                                    onClick={() => navigate(`/post/${post.id}`)}
                                    style={{
                                        background: '#fff',
                                        borderRadius: 12,
                                        padding: 24,
                                        marginBottom: 20,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* 用户信息 */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                        {(() => {
                                            const hasAvatar = post.userAvatar && post.userAvatar.trim() !== '';
                                            if (!hasAvatar) {
                                                return (
                                                    <div style={{ display: 'flex', width: 40, height: 40, borderRadius: '50%', background: '#c57237', color: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontSize: 18, fontWeight: 'bold' }}>
                                                        {post.username ? post.username.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                );
                                            }
                                            const avatarUrl = post.userAvatar.startsWith('http') 
                                                ? post.userAvatar 
                                                : `http://localhost:8081${post.userAvatar.startsWith('/') ? '' : '/'}${post.userAvatar}`;
                                            return (
                                                <img
                                                    src={avatarUrl}
                                                    alt={post.username}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        marginRight: 12
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const placeholder = e.target.nextElementSibling;
                                                        if (placeholder) {
                                                            placeholder.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}
                                        <div style={{ display: 'none', width: 40, height: 40, borderRadius: '50%', background: '#c57237', color: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontSize: 18, fontWeight: 'bold' }}>
                                            {post.username ? post.username.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{post.username || '匿名用户'}</div>
                                            <div style={{ fontSize: 12, color: '#999' }}>
                                                {formatTime(post.createTime)}
                                                <span style={{ margin: '0 8px' }}>·</span>
                                                {postTypes.find(t => t.value === post.type)?.label || post.type}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 标题 */}
                                    <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 20, color: '#333' }}>{post.title}</h3>
                                    
                                    {/* 内容预览（最多显示100字） */}
                                    <div style={{ marginBottom: 16, lineHeight: 1.6, color: '#666', fontSize: 14 }}>
                                        {post.content && post.content.length > 100 
                                            ? post.content.substring(0, 100) + '...' 
                                            : post.content}
                                    </div>
                                    
                                    {/* 图片预览 */}
                                    {(() => {
                                        const { images: postImages, totalCount } = getPostImages(post);
                                        if (postImages.length > 0) {
                                            return (
                                                <div style={{ 
                                                    marginBottom: 16,
                                                    position: 'relative'
                                                }}>
                                                    {postImages.length === 1 ? (
                                                        // 单张图片：显示较大尺寸
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: '500px',
                                                                aspectRatio: '4/3',
                                                                overflow: 'hidden',
                                                                borderRadius: 8,
                                                                border: '1px solid #e0e0e0',
                                                                cursor: 'pointer',
                                                                backgroundColor: '#f0f0f0'
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/post/${post.id}`);
                                                            }}
                                                        >
                                                            <img
                                                                src={postImages[0]}
                                                                alt={post.title}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        // 多张图片：网格布局
                                                        <div style={{ 
                                                            display: 'grid',
                                                            gridTemplateColumns: postImages.length === 2 
                                                                ? 'repeat(2, 1fr)' 
                                                                : 'repeat(3, 1fr)',
                                                            gap: 8
                                                        }}>
                                                            {postImages.map((imageUrl, imgIndex) => (
                                                                <div
                                                                    key={imgIndex}
                                                                    style={{
                                                                        position: 'relative',
                                                                        width: '100%',
                                                                        aspectRatio: '1',
                                                                        overflow: 'hidden',
                                                                        borderRadius: 8,
                                                                        border: '1px solid #e0e0e0',
                                                                        cursor: 'pointer',
                                                                        backgroundColor: '#f0f0f0'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/post/${post.id}`);
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={`${post.title} ${imgIndex + 1}`}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                    {imgIndex === 2 && totalCount > 3 && (
                                                                        <div
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                bottom: 0,
                                                                                background: 'rgba(0, 0, 0, 0.5)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                color: '#fff',
                                                                                fontSize: 16,
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        >
                                                                            +{totalCount - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                    
                                    {/* 视频预览 */}
                                    {post.videoUrl && (
                                        <div style={{ marginBottom: 16 }}>
                                            <video
                                                src={post.videoUrl.startsWith('http') 
                                                    ? post.videoUrl 
                                                    : `http://localhost:8081${post.videoUrl.startsWith('/') ? '' : '/'}${post.videoUrl}`}
                                                controls
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '400px',
                                                    width: 'auto',
                                                    borderRadius: 8,
                                                    border: '1px solid #e0e0e0'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* 统计信息 */}
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 24, 
                                            paddingTop: 16, 
                                            borderTop: '1px solid #f0f0f0',
                                            color: '#666',
                                            fontSize: 14
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>❤️</span>
                                            <span>{post.likeCount || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>💬</span>
                                            <span>{post.commentCount || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                                            <span>👁️</span>
                                            <span>{post.viewCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* 分页 */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 30 }}>
                                <button
                                    onClick={() => fetchPosts(currentPage - 1, selectedType)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '8px 16px',
                                        background: currentPage === 1 ? '#f0f0f0' : '#c57237',
                                        color: currentPage === 1 ? '#999' : '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: 14
                                    }}
                                >
                                    上一页
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => fetchPosts(page, selectedType)}
                                        style={{
                                            padding: '8px 16px',
                                            background: currentPage === page ? '#c57237' : '#fff',
                                            color: currentPage === page ? '#fff' : '#333',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 14
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fetchPosts(currentPage + 1, selectedType)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '8px 16px',
                                        background: currentPage === totalPages ? '#f0f0f0' : '#c57237',
                                        color: currentPage === totalPages ? '#999' : '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: 14
                                    }}
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <FooterSection />
        </div>
    );
};

export default CommunityPage;


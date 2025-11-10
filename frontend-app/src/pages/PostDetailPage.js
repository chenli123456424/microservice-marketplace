import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RightSidebar from '../components/RightSidebar';
import FooterSection from '../components/FooterSection';
import { useAuth } from '../context/AuthContext';
import { showModal } from '../utils/modal';

const API_BASE_URL = 'http://localhost:8081/api';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, token, user } = useAuth();
    
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentContent, setCommentContent] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [avatarErrors, setAvatarErrors] = useState(new Set());
    
    // 获取帖子详情
    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/community-posts/${postId}`);
                if (response.data.code === 200) {
                    setPostData(response.data.data);
                    // 如果用户已登录，检查点赞状态
                    if (isAuthenticated && token) {
                        try {
                            const likeStatusResponse = await axios.get(
                                `${API_BASE_URL}/community-posts/${postId}/like-status`,
                                {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                }
                            );
                            if (likeStatusResponse.data.code === 200) {
                                const liked = likeStatusResponse.data.data.liked || likeStatusResponse.data.data.Liked;
                                setIsLiked(liked === true || liked === 'true' || liked === 1);
                            }
                        } catch (error) {
                            console.error('获取点赞状态失败:', error);
                            // 获取点赞状态失败不影响页面显示，默认为未点赞
                            setIsLiked(false);
                        }
                    } else {
                        setIsLiked(false);
                    }
                } else {
                    showModal.error('帖子不存在');
                    navigate('/community');
                }
            } catch (error) {
                console.error('获取帖子详情失败:', error);
                showModal.error('获取帖子详情失败');
                navigate('/community');
            } finally {
                setLoading(false);
            }
        };
        
        if (postId) {
            fetchPostDetail();
        }
    }, [postId, navigate, isAuthenticated, token]);
    
    // 获取评论列表
    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId, commentPage]);
    
    const fetchComments = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/community-comments/page`, {
                params: {
                    postId: postId,
                    pageNum: commentPage,
                    pageSize: 10
                }
            });
            if (response.data.code === 200) {
                const newComments = response.data.data.records || [];
                if (commentPage === 1) {
                    setComments(newComments);
                } else {
                    setComments(prev => [...prev, ...newComments]);
                }
                setHasMoreComments(newComments.length === 10);
            }
        } catch (error) {
            console.error('获取评论失败:', error);
        }
    };
    
    // 处理点赞/取消点赞
    const handleLike = async () => {
        if (!isAuthenticated) {
            showModal.warning('请先登录');
            navigate('/auth');
            return;
        }
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}/community-posts/${postId}/like`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.data.code === 200) {
                const data = response.data.data || {};
                const liked = data.liked !== undefined ? data.liked : data.Liked;
                const likeCount = data.likeCount !== undefined ? data.likeCount : data.LikeCount;
                const message = data.message || (liked ? '点赞成功' : '取消点赞成功');
                
                // 更新点赞状态和点赞数
                setIsLiked(liked === true || liked === 'true' || liked === 1);
                setPostData(prev => ({
                    ...prev,
                    likeCount: likeCount !== undefined ? Number(likeCount) : (prev.likeCount || 0)
                }));
                
                showModal.success(message);
            }
        } catch (error) {
            console.error('点赞操作失败:', error);
            showModal.error('操作失败，请稍后重试');
        }
    };
    
    // 处理评论提交
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            showModal.warning('请先登录');
            navigate('/auth');
            return;
        }
        
        if (!commentContent.trim()) {
            showModal.warning('请输入评论内容');
            return;
        }
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}/community-comments`,
                {
                    postId: parseInt(postId),
                    content: commentContent,
                    parentId: 0
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.code === 200) {
                showModal.success('评论成功');
                setCommentContent('');
                // 重新加载评论
                setCommentPage(1);
                fetchComments();
                // 更新评论数
                setPostData(prev => ({
                    ...prev,
                    commentCount: (prev.commentCount || 0) + 1
                }));
            } else {
                showModal.error(response.data.message || '评论失败');
            }
        } catch (error) {
            console.error('评论失败:', error);
            showModal.error('评论失败，请稍后重试');
        }
    };
    
    // 处理复制链接
    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showModal.success('链接已复制到剪贴板');
        }).catch(() => {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showModal.success('链接已复制到剪贴板');
            } catch (err) {
                showModal.error('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
        });
    };
    
    // 获取图片列表
    const getImageList = () => {
        if (!postData || !postData.images) return [];
        return postData.images.split(',').filter(img => img && img.trim()).map(img => {
            const trimmedImg = img.trim();
            if (trimmedImg.startsWith('http')) {
                return trimmedImg;
            }
            return `http://localhost:8081${trimmedImg.startsWith('/') ? '' : '/'}${trimmedImg}`;
        });
    };
    
    const images = getImageList();
    
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div>加载中...</div>
            </div>
        );
    }
    
    if (!postData) {
        return null;
    }
    
    // 帖子类型标签
    const postTypeLabels = {
        'INSPIRATION': '灵感分享',
        'QUESTION': '问答',
        'SHOWCASE': '作品展示'
    };
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <RightSidebar />
            
            {/* 主要内容区域 */}
            <div style={{ padding: '40px 250px' }}>
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/community')}
                    style={{
                        marginBottom: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ← 返回社区
                </button>
                
                {/* 帖子信息卡片 */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    {/* 用户信息和标题 */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            {(() => {
                                const hasAvatar = postData.userAvatar && postData.userAvatar.trim() !== '';
                                const avatarError = avatarErrors.has('user');
                                
                                if (!hasAvatar || avatarError) {
                                    const firstChar = postData.username ? postData.username.charAt(0).toUpperCase() : '?';
                                    return (
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            marginRight: '15px'
                                        }}>
                                            {firstChar}
                                        </div>
                                    );
                                }
                                
                                const avatarUrl = postData.userAvatar.startsWith('http') 
                                    ? postData.userAvatar 
                                    : `http://localhost:8081${postData.userAvatar.startsWith('/') ? '' : '/'}${postData.userAvatar}`;
                                
                                return (
                                    <img
                                        src={avatarUrl}
                                        alt={postData.username}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            marginRight: '15px'
                                        }}
                                        onError={() => {
                                            setAvatarErrors(prev => new Set(prev).add('user'));
                                        }}
                                    />
                                );
                            })()}
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                                    {postData.username || '匿名用户'}
                                </div>
                                <div style={{ color: '#999', fontSize: '14px' }}>
                                    {new Date(postData.createTime).toLocaleString('zh-CN')}
                                    <span style={{ margin: '0 8px' }}>·</span>
                                    {postTypeLabels[postData.type] || postData.type}
                                </div>
                            </div>
                        </div>
                        
                        <h1 style={{ fontSize: '32px', marginBottom: '20px', fontWeight: 'bold' }}>
                            {postData.title}
                        </h1>
                        <div style={{
                            display: 'flex',
                            gap: '30px',
                            color: '#666',
                            fontSize: '16px',
                            marginBottom: '20px'
                        }}>
                            <span>👁️ {postData.viewCount || 0} 次浏览</span>
                            <span>❤️ {postData.likeCount || 0} 个赞</span>
                            <span>💬 {postData.commentCount || 0} 条评论</span>
                        </div>
                    </div>
                    
                    {/* 内容 */}
                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ color: '#333', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                            {postData.content}
                        </p>
                    </div>
                    
                    {/* 图片展示 */}
                    {images.length > 0 && (
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{
                                width: '100%',
                                height: '500px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginBottom: '20px',
                                position: 'relative',
                                backgroundColor: '#f0f0f0'
                            }}>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={postData.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                        e.target.src = '/images/default.jpg';
                                    }}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => 
                                                prev > 0 ? prev - 1 : images.length - 1
                                            )}
                                            style={{
                                                position: 'absolute',
                                                left: '20px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                fontSize: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => 
                                                prev < images.length - 1 ? prev + 1 : 0
                                            )}
                                            style={{
                                                position: 'absolute',
                                                right: '20px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                fontSize: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ›
                                        </button>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex',
                                            gap: '10px'
                                        }}>
                                            {images.map((_, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        backgroundColor: index === currentImageIndex ? '#667eea' : 'rgba(255,255,255,0.5)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* 缩略图 */}
                            {images.length > 1 && (
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    overflowX: 'auto',
                                    paddingBottom: '10px'
                                }}>
                                    {images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${postData.title} ${index + 1}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: index === currentImageIndex ? '3px solid #667eea' : '3px solid transparent',
                                                transition: 'all 0.3s'
                                            }}
                                            onError={(e) => {
                                                e.target.src = '/images/default.jpg';
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* 视频展示 */}
                    {postData.videoUrl && (
                        <div style={{ marginBottom: '30px' }}>
                            <video
                                src={postData.videoUrl.startsWith('http') ? postData.videoUrl : `http://localhost:8081${postData.videoUrl.startsWith('/') ? '' : '/'}${postData.videoUrl}`}
                                controls
                                style={{
                                    width: '100%',
                                    maxHeight: '600px',
                                    borderRadius: '12px'
                                }}
                            />
                        </div>
                    )}
                    
                    {/* 操作按钮 */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        paddingTop: '20px',
                        borderTop: '1px solid #eee'
                    }}>
                        <button
                            onClick={handleLike}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: isLiked ? '#ccc' : '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            {isLiked ? '❤️ 已点赞' : '🤍 点赞'} ({postData.likeCount || 0})
                        </button>
                        <button
                            onClick={handleCopyLink}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#52c41a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔗 转发
                        </button>
                    </div>
                </div>
                
                {/* 评论区域 */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '30px', fontWeight: 'bold' }}>
                        用户评论 ({comments.length})
                    </h2>
                    
                    {/* 评论输入框 */}
                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: '30px' }}>
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder={isAuthenticated ? '写下你的评论...' : '请先登录后评论'}
                            rows="4"
                            disabled={!isAuthenticated}
                            style={{
                                width: '100%',
                                padding: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '16px',
                                resize: 'vertical',
                                marginBottom: '15px',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!isAuthenticated || !commentContent.trim()}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: isAuthenticated && commentContent.trim() ? '#667eea' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: isAuthenticated && commentContent.trim() ? 'pointer' : 'not-allowed'
                            }}
                        >
                            发表评论
                        </button>
                    </form>
                    
                    {/* 评论列表 */}
                    <div>
                        {comments.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px',
                                color: '#999'
                            }}>
                                暂无评论，快来发表第一条评论吧！
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div
                                    key={comment.id}
                                    style={{
                                        padding: '20px',
                                        borderBottom: '1px solid #eee',
                                        marginBottom: '15px'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        gap: '15px',
                                        marginBottom: '10px'
                                    }}>
                                        {(() => {
                                            let avatarUrl = comment.userAvatar;
                                            const hasAvatar = avatarUrl && avatarUrl.trim() !== '';
                                            const avatarError = avatarErrors.has(comment.id);
                                            
                                            if (!hasAvatar || avatarError) {
                                                const firstChar = comment.username ? comment.username.charAt(0).toUpperCase() : '?';
                                                return (
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#667eea',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px',
                                                        fontWeight: 'bold',
                                                        flexShrink: 0
                                                    }}>
                                                        {firstChar}
                                                    </div>
                                                );
                                            }
                                            
                                            if (!avatarUrl.startsWith('http')) {
                                                avatarUrl = `http://localhost:8081${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
                                            }
                                            
                                            return (
                                                <img
                                                    src={avatarUrl}
                                                    alt={comment.username}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        flexShrink: 0
                                                    }}
                                                    onError={() => {
                                                        setAvatarErrors(prev => new Set(prev).add(comment.id));
                                                    }}
                                                />
                                            );
                                        })()}
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <div>
                                                    <div style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {comment.username}
                                                    </div>
                                                    <div style={{
                                                        color: '#999',
                                                        fontSize: '14px'
                                                    }}>
                                                        {new Date(comment.createTime).toLocaleString('zh-CN')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                color: '#333',
                                                lineHeight: '1.6',
                                                fontSize: '15px'
                                            }}>
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* 加载更多 */}
                        {hasMoreComments && comments.length > 0 && (
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button
                                    onClick={() => setCommentPage(prev => prev + 1)}
                                    style={{
                                        padding: '10px 30px',
                                        backgroundColor: '#f0f0f0',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    加载更多评论
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <FooterSection />
        </div>
    );
};

export default PostDetailPage;


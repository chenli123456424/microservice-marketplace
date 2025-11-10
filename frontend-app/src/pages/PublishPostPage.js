import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { showModal } from '../utils/modal';
import FooterSection from '../components/FooterSection';

const API_BASE_URL = 'http://localhost:8081/api';

const PublishPostPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, token, user: authUser } = useAuth();
    
    // 页面状态：'publish' | 'manage' | 'data'
    const [activeTab, setActiveTab] = useState('publish');
    
    // 用户信息
    const [userInfo, setUserInfo] = useState(null);
    
    // 发布表单
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'INSPIRATION'
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [publishLoading, setPublishLoading] = useState(false);
    
    // 帖子管理
    const [myPosts, setMyPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPostType, setSelectedPostType] = useState('');
    
    // 编辑弹窗
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        content: '',
        type: 'INSPIRATION'
    });
    const [editImageFiles, setEditImageFiles] = useState([]);
    const [editImagePreviews, setEditImagePreviews] = useState([]);
    const [editExistingImages, setEditExistingImages] = useState([]); // 已存在的图片URL
    const [editVideoFile, setEditVideoFile] = useState(null);
    const [editVideoPreview, setEditVideoPreview] = useState(null);
    const [editExistingVideo, setEditExistingVideo] = useState(null); // 已存在的视频URL
    const [editLoading, setEditLoading] = useState(false);
    
    // 数据中心
    const [dataStats, setDataStats] = useState({
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
    });
    
    // 检查登录状态
    useEffect(() => {
        if (!isAuthenticated) {
            showModal.warning('请先登录', () => {
                navigate('/auth');
            });
        } else {
            fetchUserInfo();
            fetchMyPosts(1, '');
            fetchDataStats();
        }
    }, [isAuthenticated, navigate]);
    
    // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/current`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.code === 200) {
                setUserInfo(response.data.data);
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
    };
    
    // 获取我的帖子列表
    const fetchMyPosts = async (page = 1, type = '') => {
        setPostsLoading(true);
        try {
            const params = {
                pageNum: page,
                pageSize: 10
            };
            if (type) {
                params.type = type;
            }
            const response = await axios.get(`${API_BASE_URL}/community-posts/my-posts`, {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.code === 200) {
                const postsData = response.data.data.records || [];
                setMyPosts(postsData);
                setCurrentPage(response.data.data.current || 1);
                setTotalPages(response.data.data.pages || 1);
            }
        } catch (error) {
            console.error('获取帖子列表失败:', error);
            showModal.error('获取帖子列表失败');
        } finally {
            setPostsLoading(false);
        }
    };
    
    // 获取数据统计
    const fetchDataStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/community-posts/my-posts`, {
                params: {
                    pageNum: 1,
                    pageSize: 1000 // 获取所有帖子用于统计
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.code === 200) {
                const allPosts = response.data.data.records || [];
                const stats = {
                    totalPosts: allPosts.length,
                    totalViews: allPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0),
                    totalLikes: allPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0),
                    totalComments: allPosts.reduce((sum, post) => sum + (post.commentCount || 0), 0)
                };
                setDataStats(stats);
            }
        } catch (error) {
            console.error('获取数据统计失败:', error);
        }
    };
    
    // 处理图片选择
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imageFiles.length > 9) {
            showModal.error('最多只能上传9张图片');
            return;
        }
        
        if (videoFile) {
            showModal.warning('已选择视频，选择图片将清除视频');
            removeVideo();
        }
        
        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };
    
    // 删除图片
    const removeImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };
    
    // 处理视频选择
    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('video/')) {
            showModal.error('请选择视频文件');
            return;
        }
        
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            showModal.error('视频文件大小不能超过100MB');
            return;
        }
        
        if (imageFiles.length > 0) {
            showModal.warning('已选择图片，选择视频将清除所有图片');
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            setImageFiles([]);
            setImagePreviews([]);
        }
        
        setVideoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setVideoPreview(previewUrl);
    };
    
    // 删除视频
    const removeVideo = () => {
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }
        setVideoFile(null);
        setVideoPreview(null);
    };
    
    // 上传图片
    const uploadImages = async () => {
        const uploadedUrls = [];
        for (const file of imageFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await axios.post(
                    `${API_BASE_URL}/community-posts/upload`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                if (response.data.code === 200) {
                    uploadedUrls.push(response.data.data);
                } else {
                    throw new Error(response.data.message || '上传失败');
                }
            } catch (error) {
                console.error('图片上传失败:', error);
                throw new Error(`图片上传失败: ${error.response?.data?.message || error.message}`);
            }
        }
        return uploadedUrls;
    };
    
    // 上传视频
    const uploadVideo = async () => {
        if (!videoFile) return null;
        
        try {
            const formData = new FormData();
            formData.append('file', videoFile);
            
            const response = await axios.post(
                `${API_BASE_URL}/community-posts/upload`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.data.code === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || '上传失败');
            }
        } catch (error) {
            console.error('视频上传失败:', error);
            throw new Error(`视频上传失败: ${error.response?.data?.message || error.message}`);
        }
    };
    
    // 发布帖子
    const handlePublish = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            showModal.warning('请先登录');
            return;
        }
        
        if (!formData.title.trim() || !formData.content.trim()) {
            showModal.error('请填写标题和内容');
            return;
        }
        
        if (imageFiles.length > 0 && videoFile) {
            showModal.error('请选择图片或视频，不能同时选择两者');
            return;
        }
        
        try {
            setPublishLoading(true);
            
            let imageUrls = [];
            if (imageFiles.length > 0) {
                try {
                    imageUrls = await uploadImages();
                } catch (error) {
                    showModal.error(error.message || '图片上传失败');
                    setPublishLoading(false);
                    return;
                }
            }
            
            let videoUrl = null;
            if (videoFile) {
                try {
                    videoUrl = await uploadVideo();
                } catch (error) {
                    showModal.error(error.message || '视频上传失败');
                    setPublishLoading(false);
                    return;
                }
            }
            
            const payload = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                type: formData.type,
                images: imageUrls.length > 0 ? imageUrls.join(',') : null,
                videoUrl: videoUrl
            };
            
            const response = await axios.post(
                `${API_BASE_URL}/community-posts`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.code === 200) {
                showModal.success('发布成功！', () => {
                    // 清空表单
                    setFormData({ title: '', content: '', type: 'INSPIRATION' });
                    setImageFiles([]);
                    setImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                    setImagePreviews([]);
                    removeVideo();
                    // 刷新帖子列表和数据统计
                    fetchMyPosts(currentPage, selectedPostType);
                    fetchDataStats();
                });
            } else {
                showModal.error(response.data.message || '发布失败');
            }
        } catch (error) {
            console.error('发布失败:', error);
            showModal.error(error.response?.data?.message || '发布失败，请稍后重试');
        } finally {
            setPublishLoading(false);
        }
    };
    
    // 打开编辑弹窗
    const handleOpenEditModal = (post) => {
        setEditingPost(post);
        setEditFormData({
            title: post.title || '',
            content: post.content || '',
            type: post.type || 'INSPIRATION'
        });
        
        // 处理已存在的图片
        if (post.images) {
            const existingImages = post.images.split(',').filter(img => img && img.trim()).map(img => {
                const trimmedImg = img.trim();
                if (trimmedImg.startsWith('http')) {
                    return trimmedImg;
                }
                return `http://localhost:8081${trimmedImg.startsWith('/') ? '' : '/'}${trimmedImg}`;
            });
            setEditExistingImages(existingImages);
        } else {
            setEditExistingImages([]);
        }
        
        // 处理已存在的视频
        if (post.videoUrl) {
            const videoUrl = post.videoUrl.startsWith('http') 
                ? post.videoUrl 
                : `http://localhost:8081${post.videoUrl.startsWith('/') ? '' : '/'}${post.videoUrl}`;
            setEditExistingVideo(videoUrl);
        } else {
            setEditExistingVideo(null);
        }
        
        // 清空新上传的文件
        setEditImageFiles([]);
        setEditImagePreviews([]);
        setEditVideoFile(null);
        setEditVideoPreview(null);
        
        setEditModalVisible(true);
    };
    
    // 关闭编辑弹窗
    const handleCloseEditModal = () => {
        // 清理预览URL
        editImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        if (editVideoPreview) {
            URL.revokeObjectURL(editVideoPreview);
        }
        
        setEditModalVisible(false);
        setEditingPost(null);
        setEditFormData({ title: '', content: '', type: 'INSPIRATION' });
        setEditImageFiles([]);
        setEditImagePreviews([]);
        setEditExistingImages([]);
        setEditVideoFile(null);
        setEditVideoPreview(null);
        setEditExistingVideo(null);
    };
    
    // 编辑表单 - 处理图片选择
    const handleEditImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + editImageFiles.length + editExistingImages.length > 9) {
            showModal.error('最多只能上传9张图片');
            return;
        }
        
        if (editVideoFile || editExistingVideo) {
            showModal.warning('已选择视频，选择图片将清除视频');
            setEditVideoFile(null);
            if (editVideoPreview) {
                URL.revokeObjectURL(editVideoPreview);
            }
            setEditVideoPreview(null);
            setEditExistingVideo(null);
        }
        
        const newFiles = [...editImageFiles, ...files];
        setEditImageFiles(newFiles);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setEditImagePreviews([...editImagePreviews, ...newPreviews]);
    };
    
    // 编辑表单 - 删除图片
    const handleEditRemoveImage = (index, isExisting = false) => {
        if (isExisting) {
            const newImages = editExistingImages.filter((_, i) => i !== index);
            setEditExistingImages(newImages);
        } else {
            const newFiles = editImageFiles.filter((_, i) => i !== index);
            const newPreviews = editImagePreviews.filter((_, i) => i !== index);
            URL.revokeObjectURL(editImagePreviews[index]);
            setEditImageFiles(newFiles);
            setEditImagePreviews(newPreviews);
        }
    };
    
    // 编辑表单 - 处理视频选择
    const handleEditVideoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('video/')) {
            showModal.error('请选择视频文件');
            return;
        }
        
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            showModal.error('视频文件大小不能超过100MB');
            return;
        }
        
        if (editImageFiles.length > 0 || editExistingImages.length > 0) {
            showModal.warning('已选择图片，选择视频将清除所有图片');
            editImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            setEditImageFiles([]);
            setEditImagePreviews([]);
            setEditExistingImages([]);
        }
        
        setEditVideoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setEditVideoPreview(previewUrl);
        setEditExistingVideo(null);
    };
    
    // 编辑表单 - 删除视频
    const handleEditRemoveVideo = () => {
        if (editVideoPreview) {
            URL.revokeObjectURL(editVideoPreview);
        }
        setEditVideoFile(null);
        setEditVideoPreview(null);
        setEditExistingVideo(null);
    };
    
    // 更新帖子
    const handleUpdatePost = async (e) => {
        e.preventDefault();
        
        if (!editFormData.title.trim() || !editFormData.content.trim()) {
            showModal.error('请填写标题和内容');
            return;
        }
        
        if ((editImageFiles.length > 0 || editExistingImages.length > 0) && (editVideoFile || editExistingVideo)) {
            showModal.error('请选择图片或视频，不能同时选择两者');
            return;
        }
        
        try {
            setEditLoading(true);
            
            // 上传新图片
            let newImageUrls = [];
            if (editImageFiles.length > 0) {
                for (const file of editImageFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await axios.post(
                        `${API_BASE_URL}/community-posts/upload`,
                        formData,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                    
                    if (response.data.code === 200) {
                        newImageUrls.push(response.data.data);
                    }
                }
            }
            
            // 合并已存在的图片和新上传的图片
            const allImageUrls = [...editExistingImages, ...newImageUrls].map(url => {
                // 如果URL包含完整路径，提取相对路径
                if (url && url.includes('http://localhost:8081')) {
                    return url.replace('http://localhost:8081', '');
                }
                // 如果已经是相对路径，直接返回
                return url;
            }).filter(url => url); // 过滤空值
            
            // 上传新视频
            let videoUrl = editExistingVideo;
            if (editVideoFile) {
                const formData = new FormData();
                formData.append('file', editVideoFile);
                
                const response = await axios.post(
                    `${API_BASE_URL}/community-posts/upload`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                if (response.data.code === 200) {
                    videoUrl = response.data.data;
                    // 提取相对路径
                    if (videoUrl.includes('http://localhost:8081')) {
                        videoUrl = videoUrl.replace('http://localhost:8081', '');
                    }
                }
            } else if (editExistingVideo && editExistingVideo.includes('http://localhost:8081')) {
                videoUrl = editExistingVideo.replace('http://localhost:8081', '');
            }
            
            const payload = {
                id: editingPost.id,
                title: editFormData.title.trim(),
                content: editFormData.content.trim(),
                type: editFormData.type,
                images: allImageUrls.length > 0 ? allImageUrls.join(',') : null,
                videoUrl: videoUrl || null
            };
            
            console.log('准备更新帖子，payload:', payload);
            
            const response = await axios.put(
                `${API_BASE_URL}/community-posts`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('更新帖子响应:', response.data);
            
            if (response.data.code === 200) {
                showModal.success('更新成功！');
                // 先关闭弹窗
                handleCloseEditModal();
                // 然后刷新数据
                setTimeout(async () => {
                    await fetchMyPosts(currentPage, selectedPostType);
                    await fetchDataStats();
                }, 100);
            } else {
                showModal.error(response.data.message || '更新失败');
            }
        } catch (error) {
            console.error('更新失败:', error);
            console.error('错误响应:', error.response);
            showModal.error(error.response?.data?.message || '更新失败，请稍后重试');
        } finally {
            setEditLoading(false);
        }
    };
    
    // 删除帖子
    const handleDeletePost = async (postId) => {
        if (!window.confirm('确定要删除这条帖子吗？')) {
            return;
        }
        
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/community-posts/${postId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.code === 200) {
                showModal.success('删除成功');
                fetchMyPosts(currentPage, selectedPostType);
                fetchDataStats();
            } else {
                showModal.error(response.data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            showModal.error('删除失败，请稍后重试');
        }
    };
    
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
    
    // 获取类型标签
    const getTypeLabel = (type) => {
        const typeMap = {
            'INSPIRATION': '灵感分享',
            'QUESTION': '问答',
            'SHOWCASE': '作品展示'
        };
        return typeMap[type] || type;
    };
    
    // 清理预览URL
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
            }
        };
    }, [imagePreviews, videoPreview]);
    
    // 切换类型时重新获取帖子
    useEffect(() => {
        if (activeTab === 'manage') {
            fetchMyPosts(1, selectedPostType);
        }
    }, [selectedPostType]);
    
    if (!isAuthenticated) {
        return null;
    }
    
    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 16px 60px' }}>
                {/* 用户信息卡片 */}
                {userInfo && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        marginBottom: 24,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                            {(() => {
                                const hasAvatar = userInfo.avatar && userInfo.avatar.trim() !== '';
                                if (hasAvatar) {
                                    let avatarUrl = userInfo.avatar;
                                    if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
                                        avatarUrl = `http://localhost:8081${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
                                    }
                                    return (
                                        <img
                                            src={avatarUrl}
                                            alt={userInfo.username}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #e0e0e0'
                                            }}
                                            onError={(e) => {
                                                console.error('头像加载失败:', userInfo.avatar);
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                    e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <div
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            background: '#c57237',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 32,
                                            fontWeight: 'bold',
                                            border: '2px solid #e0e0e0'
                                        }}
                                    >
                                        {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : '?'}
                                    </div>
                                );
                            })()}
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: '0 0 8px 0', fontSize: 24 }}>{userInfo.username}</h2>
                                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>ID: {userInfo.id}</p>
                                {userInfo.email && (
                                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>{userInfo.email}</p>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 40, borderTop: '1px solid #e0e0e0', paddingTop: 20 }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                                    {userInfo.followCount || 0}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>关注</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                                    {userInfo.followerCount || 0}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>粉丝</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                                    {userInfo.likeReceivedCount || 0}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>获赞</div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 标签页导航 */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '0 24px',
                    marginBottom: 24,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    display: 'flex',
                    gap: 40,
                    borderBottom: '2px solid #f0f0f0'
                }}>
                    <button
                        onClick={() => setActiveTab('publish')}
                        style={{
                            padding: '16px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'publish' ? '2px solid #c57237' : '2px solid transparent',
                            color: activeTab === 'publish' ? '#c57237' : '#666',
                            fontSize: 16,
                            fontWeight: activeTab === 'publish' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            marginBottom: '-2px'
                        }}
                    >
                        发布帖子
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('manage');
                            fetchMyPosts(1, selectedPostType);
                        }}
                        style={{
                            padding: '16px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'manage' ? '2px solid #c57237' : '2px solid transparent',
                            color: activeTab === 'manage' ? '#c57237' : '#666',
                            fontSize: 16,
                            fontWeight: activeTab === 'manage' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            marginBottom: '-2px'
                        }}
                    >
                        帖子管理
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('data');
                            fetchDataStats();
                        }}
                        style={{
                            padding: '16px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'data' ? '2px solid #c57237' : '2px solid transparent',
                            color: activeTab === 'data' ? '#c57237' : '#666',
                            fontSize: 16,
                            fontWeight: activeTab === 'data' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            marginBottom: '-2px'
                        }}
                    >
                        数据中心
                    </button>
                </div>
                
                {/* 发布帖子内容 */}
                {activeTab === 'publish' && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                    }}>
                        <form onSubmit={handlePublish}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    类型
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                >
                                    <option value="INSPIRATION">灵感分享</option>
                                    <option value="QUESTION">问答</option>
                                    <option value="SHOWCASE">作品展示</option>
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    标题 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="请输入标题"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    内容 *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="分享你的想法..."
                                    rows={8}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    图片（最多9张）
                                </label>
                                <label
                                    htmlFor="image-upload"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 20px',
                                        background: '#c57237',
                                        color: '#fff',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        marginBottom: 12
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#b36227';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 114, 55, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#c57237';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span>📷</span>
                                    <span>选择图片</span>
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />
                                {imagePreviews.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <img
                                                    src={preview}
                                                    alt={`预览${index + 1}`}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 6,
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        background: '#ff4d4f',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    视频（可选，最大100MB）
                                </label>
                                <label
                                    htmlFor="video-upload"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 20px',
                                        background: '#c57237',
                                        color: '#fff',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        marginBottom: 12
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#b36227';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 114, 55, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#c57237';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span>🎥</span>
                                    <span>选择视频</span>
                                </label>
                                <input
                                    id="video-upload"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    style={{ display: 'none' }}
                                />
                                {videoPreview && (
                                    <div style={{ position: 'relative', marginTop: 12 }}>
                                        <video
                                            src={videoPreview}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxWidth: 500,
                                                maxHeight: 300,
                                                borderRadius: 8,
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={removeVideo}
                                            style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                background: '#ff4d4f',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 24,
                                                height: 24,
                                                cursor: 'pointer',
                                                fontSize: 14
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="submit"
                                    disabled={publishLoading}
                                    style={{
                                        padding: '12px 30px',
                                        background: '#c57237',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: publishLoading ? 'not-allowed' : 'pointer',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        opacity: publishLoading ? 0.6 : 1
                                    }}
                                >
                                    {publishLoading ? '发布中...' : '发布'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ title: '', content: '', type: 'INSPIRATION' });
                                        setImageFiles([]);
                                        setImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                                        setImagePreviews([]);
                                        removeVideo();
                                    }}
                                    style={{
                                        padding: '12px 30px',
                                        background: '#f0f0f0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 16
                                    }}
                                >
                                    清空
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* 帖子管理内容 */}
                {activeTab === 'manage' && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0 }}>我的帖子</h3>
                            <select
                                value={selectedPostType}
                                onChange={(e) => setSelectedPostType(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 14
                                }}
                            >
                                <option value="">全部类型</option>
                                <option value="INSPIRATION">灵感分享</option>
                                <option value="QUESTION">问答</option>
                                <option value="SHOWCASE">作品展示</option>
                            </select>
                        </div>
                        
                        {postsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
                        ) : myPosts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无帖子</div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {myPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            style={{
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 8,
                                                padding: 16,
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#c57237';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(197, 114, 55, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#e0e0e0';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            background: '#f0f0f0',
                                                            borderRadius: 4,
                                                            fontSize: 12,
                                                            color: '#666'
                                                        }}>
                                                            {getTypeLabel(post.type)}
                                                        </span>
                                                        <span style={{ fontSize: 12, color: '#999' }}>
                                                            {formatTime(post.createTime)}
                                                        </span>
                                                    </div>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 'bold' }}>
                                                        {post.title}
                                                    </h4>
                                                    <p style={{
                                                        margin: '0 0 12px 0',
                                                        color: '#666',
                                                        fontSize: 14,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {post.content}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#999' }}>
                                                        <span>❤️ {post.likeCount || 0}</span>
                                                        <span>💬 {post.commentCount || 0}</span>
                                                        <span>👁️ {post.viewCount || 0}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button
                                                        onClick={() => handleOpenEditModal(post)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#c57237',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        修改
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#ff4d4f',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            fontSize: 12
                                                        }}
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* 分页 */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                                        <button
                                            onClick={() => {
                                                if (currentPage > 1) {
                                                    fetchMyPosts(currentPage - 1, selectedPostType);
                                                }
                                            }}
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
                                        <span style={{ padding: '8px 16px', lineHeight: '32px' }}>
                                            第 {currentPage} / {totalPages} 页
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (currentPage < totalPages) {
                                                    fetchMyPosts(currentPage + 1, selectedPostType);
                                                }
                                            }}
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
                            </>
                        )}
                    </div>
                )}
                
                {/* 数据中心内容 */}
                {activeTab === 'data' && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                    }}>
                        <h3 style={{ margin: '0 0 24px 0' }}>数据总览</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <div style={{
                                padding: 20,
                                background: '#f8f9fa',
                                borderRadius: 8,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#c57237', marginBottom: 8 }}>
                                    {dataStats.totalPosts}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>总帖子数</div>
                            </div>
                            <div style={{
                                padding: 20,
                                background: '#f8f9fa',
                                borderRadius: 8,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#c57237', marginBottom: 8 }}>
                                    {dataStats.totalViews}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>总浏览量</div>
                            </div>
                            <div style={{
                                padding: 20,
                                background: '#f8f9fa',
                                borderRadius: 8,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#c57237', marginBottom: 8 }}>
                                    {dataStats.totalLikes}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>总点赞数</div>
                            </div>
                            <div style={{
                                padding: 20,
                                background: '#f8f9fa',
                                borderRadius: 8,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#c57237', marginBottom: 8 }}>
                                    {dataStats.totalComments}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>总评论数</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* 编辑帖子弹窗 */}
            {editModalVisible && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={(e) => {
                        // 只有当点击的是遮罩层本身时才关闭弹窗
                        if (e.target === e.currentTarget) {
                            handleCloseEditModal();
                        }
                    }}
                    onMouseDown={(e) => {
                        // 防止文本选择时意外触发关闭
                        if (e.target === e.currentTarget) {
                            e.preventDefault();
                        }
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 24,
                            maxWidth: 800,
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            userSelect: 'text' // 允许文本选择
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ margin: 0, fontSize: 20 }}>编辑帖子</h2>
                            <button
                                onClick={handleCloseEditModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 24,
                                    cursor: 'pointer',
                                    color: '#999',
                                    padding: 0,
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdatePost}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    类型
                                </label>
                                <select
                                    value={editFormData.type}
                                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                >
                                    <option value="INSPIRATION">灵感分享</option>
                                    <option value="QUESTION">问答</option>
                                    <option value="SHOWCASE">作品展示</option>
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    标题 *
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                    placeholder="请输入标题"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    内容 *
                                </label>
                                <textarea
                                    value={editFormData.content}
                                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                                    placeholder="分享你的想法..."
                                    rows={8}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    图片（最多9张）
                                </label>
                                <label
                                    htmlFor="edit-image-upload"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 20px',
                                        background: '#c57237',
                                        color: '#fff',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        marginBottom: 12
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#b36227';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 114, 55, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#c57237';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span>📷</span>
                                    <span>添加图片</span>
                                </label>
                                <input
                                    id="edit-image-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleEditImageSelect}
                                    style={{ display: 'none' }}
                                />
                                
                                {/* 显示已存在的图片 */}
                                {editExistingImages.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                                        {editExistingImages.map((imageUrl, index) => (
                                            <div key={`existing-${index}`} style={{ position: 'relative' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={`已有图片${index + 1}`}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 6,
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditRemoveImage(index, true)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        background: '#ff4d4f',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* 显示新上传的图片预览 */}
                                {editImagePreviews.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                                        {editImagePreviews.map((preview, index) => (
                                            <div key={`new-${index}`} style={{ position: 'relative' }}>
                                                <img
                                                    src={preview}
                                                    alt={`新图片${index + 1}`}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 6,
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditRemoveImage(index, false)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        background: '#ff4d4f',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                                    视频（可选，最大100MB）
                                </label>
                                <label
                                    htmlFor="edit-video-upload"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 20px',
                                        background: '#c57237',
                                        color: '#fff',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        marginBottom: 12
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#b36227';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 114, 55, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#c57237';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span>🎥</span>
                                    <span>选择视频</span>
                                </label>
                                <input
                                    id="edit-video-upload"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleEditVideoSelect}
                                    style={{ display: 'none' }}
                                />
                                
                                {/* 显示已存在的视频 */}
                                {editExistingVideo && !editVideoPreview && (
                                    <div style={{ position: 'relative', marginTop: 12 }}>
                                        <video
                                            src={editExistingVideo}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxWidth: 500,
                                                maxHeight: 300,
                                                borderRadius: 8,
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleEditRemoveVideo}
                                            style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                background: '#ff4d4f',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 24,
                                                height: 24,
                                                cursor: 'pointer',
                                                fontSize: 14
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                
                                {/* 显示新上传的视频预览 */}
                                {editVideoPreview && (
                                    <div style={{ position: 'relative', marginTop: 12 }}>
                                        <video
                                            src={editVideoPreview}
                                            controls
                                            style={{
                                                width: '100%',
                                                maxWidth: 500,
                                                maxHeight: 300,
                                                borderRadius: 8,
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleEditRemoveVideo}
                                            style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                background: '#ff4d4f',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 24,
                                                height: 24,
                                                cursor: 'pointer',
                                                fontSize: 14
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    style={{
                                        padding: '12px 30px',
                                        background: '#f0f0f0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 16
                                    }}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    style={{
                                        padding: '12px 30px',
                                        background: '#c57237',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: editLoading ? 'not-allowed' : 'pointer',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        opacity: editLoading ? 0.6 : 1
                                    }}
                                >
                                    {editLoading ? '更新中...' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <FooterSection />
        </div>
    );
};

export default PublishPostPage;

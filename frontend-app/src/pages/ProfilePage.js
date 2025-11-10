import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showModal } from '../utils/modal';
import './ProfilePage.css';

function ProfilePage() {
    const { token, isAuthenticated, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        avatar: ''
    });
    const [avatarPreview, setAvatarPreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        fetchUserInfo();
    }, [isAuthenticated, navigate]);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8081/api/user/current', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data.code === 200 && response.data.data) {
                const user = response.data.data;
                console.log('ProfilePage - 获取到的用户信息:', user);
                console.log('ProfilePage - 用户头像字段:', user.avatar);
                console.log('ProfilePage - 头像类型:', typeof user.avatar);
                
                setUserInfo(user);
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    avatar: user.avatar || ''
                });
                // 构建头像预览URL
                if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') {
                    let avatarUrl = user.avatar.trim();
                    if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
                        avatarUrl = `http://localhost:8081${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
                    }
                    console.log('ProfilePage - 构建的头像URL:', avatarUrl);
                    setAvatarPreview(avatarUrl);
                } else {
                    console.log('ProfilePage - 头像为空或无效，设置为空字符串');
                    setAvatarPreview('');
                }
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            showModal.error('获取用户信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showModal.error('请选择图片文件');
            return;
        }

        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            showModal.error('图片大小不能超过5MB');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                'http://localhost:8081/api/user/current/avatar',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.code === 200) {
                const avatarUrl = response.data.data;
                setFormData(prev => ({ ...prev, avatar: avatarUrl }));
                // 构建头像预览URL
                if (avatarUrl && avatarUrl.trim() !== '') {
                    let previewUrl = avatarUrl;
                    if (!previewUrl.startsWith('http://') && !previewUrl.startsWith('https://')) {
                        previewUrl = `http://localhost:8081${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`;
                    }
                    setAvatarPreview(`${previewUrl}?t=${Date.now()}`); // 添加时间戳防止缓存
                } else {
                    setAvatarPreview('');
                }
                showModal.success('头像上传成功');
                
                // 立即更新Context，使用最新的avatarUrl
                // 先获取完整的用户信息，确保数据完整
                try {
                    const currentUserResponse = await axios.get('http://localhost:8081/api/user/current', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (currentUserResponse.data.code === 200 && currentUserResponse.data.data) {
                        // 更新Context，这会触发TopNavigation等组件重新渲染
                        updateUser(currentUserResponse.data.data);
                        console.log('用户信息已更新到Context，头像URL:', currentUserResponse.data.data.avatar);
                    }
                } catch (error) {
                    console.error('获取最新用户信息失败:', error);
                }
                
                // 更新本地用户信息用于页面显示
                await fetchUserInfo();
            } else {
                showModal.error(response.data.message || '头像上传失败');
            }
        } catch (error) {
            console.error('头像上传失败:', error);
            showModal.error('头像上传失败: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                'http://localhost:8081/api/user/current',
                {
                    email: formData.email,
                    avatar: formData.avatar
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.code === 200) {
                showModal.success('个人信息更新成功');
                setEditing(false);
                // 更新用户信息到Context，实现全局实时刷新
                if (response.data.data) {
                    updateUser(response.data.data);
                }
                await fetchUserInfo();
            } else {
                showModal.error(response.data.message || '更新失败');
            }
        } catch (error) {
            console.error('更新用户信息失败:', error);
            showModal.error('更新失败: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancel = () => {
        if (userInfo) {
            setFormData({
                username: userInfo.username || '',
                email: userInfo.email || '',
                avatar: userInfo.avatar || ''
            });
            // 构建头像预览URL
            if (userInfo.avatar && userInfo.avatar.trim() !== '') {
                let avatarUrl = userInfo.avatar;
                if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
                    avatarUrl = `http://localhost:8081${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
                }
                setAvatarPreview(avatarUrl);
            } else {
                setAvatarPreview('');
            }
        }
        setEditing(false);
    };

    const handleCancelAccount = () => {
        showModal.confirm(
            '确定要注销账号吗？注销后账号将被删除，所有数据将无法恢复。',
            '账号注销',
            async () => {
                try {
                    const response = await axios.post(
                        'http://localhost:8081/api/user/current/cancel',
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data.code === 200) {
                        showModal.success('账号注销成功');
                        // 注销成功后退出登录并跳转到首页
                        logout(); // 清除本地存储的token和user
                        setTimeout(() => {
                            navigate('/');
                        }, 2000);
                    } else {
                        showModal.error(response.data.message || '注销失败');
                    }
                } catch (error) {
                    console.error('注销账号失败:', error);
                    showModal.error('注销失败: ' + (error.response?.data?.message || error.message));
                }
            },
            () => {
                // 取消操作
            }
        );
    };

    const handleRevokeCancellation = () => {
        showModal.confirm(
            '确定要撤销注销吗？撤销后账号将恢复正常状态。',
            '撤销注销',
            async () => {
                try {
                    const response = await axios.post(
                        'http://localhost:8081/api/user/current/revoke-cancellation',
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data.code === 200) {
                        showModal.success('撤销注销成功');
                        // 刷新用户信息
                        await fetchUserInfo();
                    } else {
                        showModal.error(response.data.message || '撤销注销失败');
                    }
                } catch (error) {
                    console.error('撤销注销失败:', error);
                    showModal.error('撤销注销失败: ' + (error.response?.data?.message || error.message));
                }
            },
            () => {
                // 取消操作
            }
        );
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="loading">加载中...</div>
                </div>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="error">获取用户信息失败</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1 className="profile-title">个人信息</h1>

                <div className="profile-content">
                    {/* 头像部分 */}
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            {(() => {
                                console.log('ProfilePage - 渲染头像，avatarPreview:', avatarPreview);
                                console.log('ProfilePage - userInfo.avatar:', userInfo?.avatar);
                                
                                const hasAvatar = avatarPreview && typeof avatarPreview === 'string' && avatarPreview.trim() !== '';
                                
                                if (hasAvatar) {
                                    return (
                                        <img 
                                            src={avatarPreview} 
                                            alt="头像" 
                                            className="avatar-image"
                                            onError={(e) => {
                                                console.error('头像加载失败:', {
                                                    avatarPreview: avatarPreview,
                                                    userAvatar: userInfo?.avatar,
                                                    error: e
                                                });
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) {
                                                    e.target.nextSibling.style.display = 'flex';
                                                }
                                            }}
                                            onLoad={() => {
                                                console.log('头像加载成功:', avatarPreview);
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <div className="avatar-placeholder">
                                        {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : '👤'}
                                    </div>
                                );
                            })()}
                        </div>
                        {editing && (
                            <div className="avatar-upload">
                                <label className="upload-button">
                                    {uploading ? '上传中...' : '更换头像'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* 用户信息部分 */}
                    <div className="info-section">
                        <div className="info-item">
                            <label className="info-label">用户名</label>
                            <div className="info-value">
                                {userInfo.username}
                            </div>
                        </div>

                        <div className="info-item">
                            <label className="info-label">邮箱</label>
                            {editing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="info-input"
                                />
                            ) : (
                                <div className="info-value">
                                    {userInfo.email || '未设置'}
                                </div>
                            )}
                        </div>

                        <div className="info-item">
                            <label className="info-label">角色</label>
                            <div className="info-value">
                                {userInfo.role || 'USER'}
                            </div>
                        </div>

                        <div className="info-item">
                            <label className="info-label">注册时间</label>
                            <div className="info-value">
                                {userInfo.createAt ? new Date(userInfo.createAt).toLocaleString('zh-CN') : '未知'}
                            </div>
                        </div>

                        <div className="action-buttons">
                            {editing ? (
                                <>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleSave}
                                        disabled={uploading}
                                    >
                                        保存
                                    </button>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={handleCancel}
                                        disabled={uploading}
                                    >
                                        取消
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => setEditing(true)}
                                    >
                                        编辑信息
                                    </button>
                                    {userInfo.cancellationStatus === 1 ? (
                                        <button 
                                            className="btn btn-warning" 
                                            onClick={handleRevokeCancellation}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            撤销注销
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-danger" 
                                            onClick={handleCancelAccount}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            账号注销
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;


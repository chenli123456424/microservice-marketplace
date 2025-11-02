import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

function ProfilePage() {
    const { token, isAuthenticated, updateUser } = useAuth();
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
    const [message, setMessage] = useState({ type: '', text: '' });

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
                setUserInfo(user);
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    avatar: user.avatar || ''
                });
                setAvatarPreview(user.avatar ? `http://localhost:8081${user.avatar}` : '');
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            setMessage({ type: 'error', text: '获取用户信息失败' });
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
            setMessage({ type: 'error', text: '请选择图片文件' });
            return;
        }

        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: '图片大小不能超过5MB' });
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
                setAvatarPreview(`http://localhost:8081${avatarUrl}?t=${Date.now()}`); // 添加时间戳防止缓存
                setMessage({ type: 'success', text: '头像上传成功' });
                
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
                setMessage({ type: 'error', text: response.data.message || '头像上传失败' });
            }
        } catch (error) {
            console.error('头像上传失败:', error);
            setMessage({ type: 'error', text: '头像上传失败: ' + (error.response?.data?.message || error.message) });
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
                setMessage({ type: 'success', text: '个人信息更新成功' });
                setEditing(false);
                // 更新用户信息到Context，实现全局实时刷新
                if (response.data.data) {
                    updateUser(response.data.data);
                }
                await fetchUserInfo();
            } else {
                setMessage({ type: 'error', text: response.data.message || '更新失败' });
            }
        } catch (error) {
            console.error('更新用户信息失败:', error);
            setMessage({ type: 'error', text: '更新失败: ' + (error.response?.data?.message || error.message) });
        }
    };

    const handleCancel = () => {
        if (userInfo) {
            setFormData({
                username: userInfo.username || '',
                email: userInfo.email || '',
                avatar: userInfo.avatar || ''
            });
            setAvatarPreview(userInfo.avatar ? `http://localhost:8081${userInfo.avatar}` : '');
        }
        setEditing(false);
        setMessage({ type: '', text: '' });
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
                
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content">
                    {/* 头像部分 */}
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            {avatarPreview ? (
                                <img 
                                    src={avatarPreview} 
                                    alt="头像" 
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    👤
                                </div>
                            )}
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
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => setEditing(true)}
                                >
                                    编辑信息
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { markAnnouncementAsRead } from '../utils/notificationHelper';
import './NotificationPage.css';

const API_BASE_URL = 'http://localhost:8081/api';

function NotificationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  // 从路由状态或API获取公告详情
  useEffect(() => {
    // 优先使用路由传递的数据
    if (location.state?.announcement) {
      const ann = location.state.announcement;
      setAnnouncement(ann);
      setLoading(false);
      // 标记为已读
      if (ann.id) {
        markAnnouncementAsRead(ann.id);
      }
      return;
    }

    // 如果没有传递数据，则从API获取
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/announcement/${id}`);
        if (response.data && response.data.code === 200 && response.data.data) {
          const ann = response.data.data;
          setAnnouncement(ann);
          // 标记为已读
          if (ann.id) {
            markAnnouncementAsRead(ann.id);
          }
        } else {
          // 如果获取失败，尝试从活跃公告列表中获取
          const activeResponse = await axios.get(`${API_BASE_URL}/announcement/active`);
          if (activeResponse.data && activeResponse.data.code === 200 && activeResponse.data.data) {
            const found = activeResponse.data.data.find(a => a.id === parseInt(id));
            if (found) {
              setAnnouncement(found);
              // 标记为已读
              markAnnouncementAsRead(found.id);
            }
          }
        }
      } catch (error) {
        console.error('获取公告详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnnouncement();
    } else {
      setLoading(false);
    }
  }, [id, location.state]);

  // 处理链接点击（在新窗口打开外部链接）
  const handleLinkClick = (e) => {
    const target = e.target;
    if (target.tagName === 'A' && target.href) {
      e.preventDefault();
      // 如果是外部链接，在新窗口打开
      if (target.href.startsWith('http') && !target.href.includes('localhost')) {
        window.open(target.href, '_blank');
      } else {
        // 内部链接可以正常处理
        window.open(target.href, '_self');
      }
    }
  };

  if (loading) {
    return (
      <div className="notification-page">
        <div className="notification-container">
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            加载中...
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="notification-page">
        <div className="notification-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>公告不存在</h2>
            <button 
              onClick={() => navigate(-1)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              返回上一页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="notification-container">
        <div className="notification-header">
          <button 
            className="notification-back-button"
            onClick={() => navigate(-1)}
          >
            ← 返回
          </button>
          <h1 className="notification-title">{announcement.title}</h1>
          {announcement.createTime && (
            <div className="notification-time">
              {new Date(announcement.createTime).toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
        
        <div 
          className="notification-content"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
          onClick={handleLinkClick}
        />
      </div>
    </div>
  );
}

export default NotificationPage;


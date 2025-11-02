import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDataRefresh } from '../hooks/useDataRefresh';
import './AnnouncementBanner.css';

const API_BASE_URL = 'http://localhost:8081/api';

function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // 获取公告数据
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/announcement/active`);
      if (response.data && response.data.code === 200 && response.data.data) {
        setAnnouncements(response.data.data);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('获取公告失败:', error);
      setAnnouncements([]);
    }
  }, []);

  // 使用实时刷新hook，支持轮询和事件通知
  // useDataRefresh会自动监听 'dataUpdated' 事件，数据类型为 'announcements'
  useDataRefresh(fetchAnnouncements, 'announcements', {
    pollingInterval: 30000, // 30秒轮询一次
    enableVisibilityRefresh: true,
  });

  // 切换展开/收起
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 处理链接点击（防止事件冒泡）
  const handleLinkClick = (e) => {
    e.stopPropagation();
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="announcement-banner-container">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className={`announcement-item ${expandedId === announcement.id ? 'expanded' : ''}`}
          onClick={() => toggleExpand(announcement.id)}
        >
          <div className="announcement-header">
            <span className="announcement-icon">📢</span>
            <span className="announcement-title">{announcement.title}</span>
            <span className="announcement-toggle">
              {expandedId === announcement.id ? '收起 ▲' : '展开 ▼'}
            </span>
          </div>
          {expandedId === announcement.id && (
            <div
              className="announcement-content"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
              onClick={handleLinkClick}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default AnnouncementBanner;


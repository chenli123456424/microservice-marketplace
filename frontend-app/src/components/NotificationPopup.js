/**
 * 独立通知窗口组件
 * 功能：
 * 1. 监听数据库公告表的变化
 * 2. 根据公告的发布时间准时推送（发布时间在当前时间之后）
 * 3. 过期公告不推送
 * 4. 每个公告显示15秒后自动关闭
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { markAnnouncementAsRead, isAnnouncementRead } from '../utils/notificationHelper';
import './NotificationPopup.css';

const API_BASE_URL = 'http://localhost:8081/api';

/**
 * 单个通知弹窗组件
 */
function NotificationPopupItem({ announcement, onClose }) {
  const navigate = useNavigate();

  // 提取富文本中的第一张图片
  const extractFirstImage = (html) => {
    if (!html) return null;
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const imgElement = tempDiv.querySelector('img');
      if (imgElement && imgElement.src) {
        let url = imgElement.src.trim().replace(/^["']|["']$/g, '');
        if (url.startsWith('data:')) {
          return url;
        }
        if (url.startsWith('/')) {
          return `http://localhost:8081${url}`;
        }
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        return `http://localhost:8081/${url}`;
      }
    } catch (error) {
      console.error('提取图片失败:', error);
    }
    return null;
  };

  // 提取文本内容（去除HTML标签，保留表情和文字）
  const extractTextWithEmojis = (html, maxLength = 60) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = div.textContent || div.innerText || '';
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex) || [];
    let cleanText = text.replace(emojiRegex, '').trim();
    if (cleanText.length > maxLength) {
      cleanText = cleanText.substring(0, maxLength) + '...';
    }
    return (cleanText + (emojis.length > 0 ? ' ' + emojis.join('') : '')).trim();
  };

  const handleClick = () => {
    if (announcement.id) {
      // 先标记为已读，避免跳转后再次显示
      markAnnouncementAsRead(announcement.id);
      // 先关闭弹窗
      onClose();
      // 延迟跳转，确保状态已更新
      setTimeout(() => {
        navigate(`/notification/${announcement.id}`, {
          state: { announcement }
        });
      }, 100);
    }
  };

  const imageUrl = extractFirstImage(announcement.content);
  const textContent = extractTextWithEmojis(announcement.content, 60);

  return (
    <div className="notification-popup-overlay" onClick={onClose}>
      <div
        className="notification-popup"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <button
          className="notification-popup-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
        <div className="notification-popup-content">
          <div className="notification-popup-image">
            {imageUrl ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={announcement.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement.querySelector('.notification-popup-placeholder');
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="notification-popup-placeholder"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              📢
            </div>
          </div>
          <div className="notification-popup-text">
            <h3 className="notification-popup-title">{announcement.title}</h3>
            <div className="notification-popup-description">
              {textContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 通知管理器组件
 * 负责：
 * 1. 定期检查数据库中的公告
 * 2. 根据发布时间准时推送
 * 3. 管理多个通知的显示队列
 */
function NotificationPopupManager() {
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const autoCloseTimerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const scheduledNotificationsRef = useRef(new Map()); // 存储已调度的通知 (key: announcementId, value: true)
  const timeoutTimersRef = useRef(new Map()); // 存储定时器ID (key: 'timeout_' + announcementId, value: timeoutId)

  /**
   * 检查公告是否有效（未过期且已发布）
   */
  const isAnnouncementValid = useCallback((announcement) => {
    if (!announcement) return false;
    const now = new Date();
    
    // 必须已发布
    if (announcement.status !== 1) {
      return false;
    }
    
    // 检查开始时间
    if (announcement.startTime) {
      const startTime = new Date(announcement.startTime);
      if (now < startTime) {
        // 还未开始，但可以调度
        return 'scheduled';
      }
    }
    
    // 检查结束时间
    if (announcement.endTime) {
      const endTime = new Date(announcement.endTime);
      if (now > endTime) {
        return false; // 已过期
      }
    }
    
    return true; // 有效且应该立即显示
  }, []);

  /**
   * 从API获取所有公告
   */
  const fetchAllAnnouncements = useCallback(async () => {
    try {
      console.log('[NotificationPopup] 获取所有公告...');
      const response = await axios.get(`${API_BASE_URL}/announcement/active`);
      
      if (response.data && response.data.code === 200 && response.data.data) {
        const allAnnouncements = response.data.data || [];
        console.log('[NotificationPopup] 获取到公告数量:', allAnnouncements.length);
        setAnnouncements(allAnnouncements);
        return allAnnouncements;
      }
      return [];
    } catch (error) {
      console.error('[NotificationPopup] 获取公告失败:', error);
      return [];
    }
  }, []);

  /**
   * 处理通知显示队列
   */
  const processNotificationQueue = useCallback(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setNotificationQueue(prev => prev.slice(1));
      // 注意：不在这里标记为已读，只有在用户点击或15秒后自动关闭时才标记为已读
    }
  }, [notificationQueue, currentNotification]);

  /**
   * 检查并调度通知
   */
  const checkAndScheduleNotifications = useCallback((allAnnouncements) => {
    const now = new Date();
    const scheduledNotifications = scheduledNotificationsRef.current;
    
    allAnnouncements.forEach(announcement => {
      // 跳过已读的通知
      if (isAnnouncementRead(announcement.id)) {
        // 如果已读，清理相关的调度信息
        scheduledNotifications.delete(announcement.id);
        timeoutTimersRef.current.delete(announcement.id);
        return;
      }
      
      const validity = isAnnouncementValid(announcement);
      
      if (validity === true) {
        // 立即可以显示的通知
        // 检查是否已经调度过
        if (!scheduledNotifications.has(announcement.id)) {
          scheduledNotifications.set(announcement.id, true);
          console.log('[NotificationPopup] 发现可立即显示的通知:', announcement.id, announcement.title);
          
          // 如果当前没有显示通知，直接显示；否则加入队列
          if (!currentNotification) {
            setCurrentNotification(announcement);
            // 注意：不要在这里标记为已读，只有在用户点击或15秒后自动关闭时才标记为已读
          } else {
            setNotificationQueue(prev => {
              // 避免重复加入队列
              if (!prev.some(n => n.id === announcement.id)) {
                return [...prev, announcement];
              }
              return prev;
            });
          }
        }
      } else if (validity === 'scheduled') {
        // 需要按时间调度的通知（发布时间在未来）
        if (!scheduledNotifications.has(announcement.id)) {
          const startTime = new Date(announcement.startTime);
          const delay = startTime.getTime() - now.getTime();
          
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // 最多调度24小时内的通知
            console.log(`[NotificationPopup] 调度通知 ${announcement.id}，将在 ${Math.round(delay / 1000)}秒 后显示`);
            scheduledNotifications.set(announcement.id, true);
            
            const timeoutId = setTimeout(() => {
              // 再次检查是否已读和是否有效
              if (!isAnnouncementRead(announcement.id) && isAnnouncementValid(announcement) === true) {
                console.log(`[NotificationPopup] 准时推送通知: ${announcement.id}`, announcement.title);
                
                // 使用函数式更新，确保获取最新的 currentNotification
                setCurrentNotification(prev => {
                  if (!prev) {
                    return announcement;
                  } else {
                    setNotificationQueue(prevQueue => {
                      if (!prevQueue.some(n => n.id === announcement.id)) {
                        return [...prevQueue, announcement];
                      }
                      return prevQueue;
                    });
                    return prev;
                  }
                });
              } else {
                console.log(`[NotificationPopup] 通知 ${announcement.id} 已失效或已读，取消显示`);
                scheduledNotificationsRef.current.delete(announcement.id);
                timeoutTimersRef.current.delete(announcement.id);
              }
            }, delay);
            
            // 存储 timeout ID，以便可以清理（使用单独的 Map）
            timeoutTimersRef.current.set(announcement.id, timeoutId);
          } else if (delay >= 24 * 60 * 60 * 1000) {
            console.log(`[NotificationPopup] 通知 ${announcement.id} 发布时间超过24小时，暂不调度`);
          }
        }
      }
    });
  }, [currentNotification, isAnnouncementValid]);

  /**
   * 定期检查公告变化
   */
  useEffect(() => {
    // 初始加载
    console.log('[NotificationPopup] 组件初始化，开始加载公告');
    fetchAllAnnouncements().then(announcements => {
      console.log('[NotificationPopup] 初始加载完成，公告数量:', announcements.length);
      if (announcements.length > 0) {
        checkAndScheduleNotifications(announcements);
      }
    });

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[NotificationPopup] 页面变为可见，刷新公告');
        fetchAllAnnouncements().then(announcements => {
          if (announcements.length > 0) {
            checkAndScheduleNotifications(announcements);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 监听 localStorage 变化（跨窗口通信）
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('announcementUpdated_')) {
        console.log('[NotificationPopup] 收到localStorage通知，刷新公告');
        // 清除所有已调度的通知，重新检查
        scheduledNotificationsRef.current.clear();
        fetchAllAnnouncements().then(announcements => {
          if (announcements.length > 0) {
            checkAndScheduleNotifications(announcements);
          }
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 每30秒检查一次新公告（轻量级检查，用于检测新发布的公告）
    checkIntervalRef.current = setInterval(() => {
      console.log('[NotificationPopup] 定期检查新公告');
      fetchAllAnnouncements().then(announcements => {
        if (announcements.length > 0) {
          checkAndScheduleNotifications(announcements);
        }
      });
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      // 清理所有已调度的定时器
      timeoutTimersRef.current.forEach((timeoutId) => {
        if (typeof timeoutId === 'number') {
          clearTimeout(timeoutId);
        }
      });
      scheduledNotificationsRef.current.clear();
      timeoutTimersRef.current.clear();
    };
  }, [checkAndScheduleNotifications, fetchAllAnnouncements]);

  // 当当前通知关闭后，处理队列中的下一个
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      // 延迟处理，确保上一个通知的状态已完全清理
      const timer = setTimeout(() => {
        processNotificationQueue();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentNotification, notificationQueue, processNotificationQueue]);

  // 处理关闭通知
  const handleClose = useCallback((announcementId) => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    
    if (announcementId) {
      // 清理调度信息
      scheduledNotificationsRef.current.delete(announcementId);
      const timeoutId = timeoutTimersRef.current.get(announcementId);
      if (timeoutId && typeof timeoutId === 'number') {
        clearTimeout(timeoutId);
        timeoutTimersRef.current.delete(announcementId);
      }
      
      // 标记为已读
      markAnnouncementAsRead(announcementId);
    }
    
    setCurrentNotification(null);
  }, []);
  
  // 监听路由变化，如果跳转到通知详情页，清除当前显示的通知
  useEffect(() => {
    if (location.pathname.startsWith('/notification/') && currentNotification) {
      console.log('[NotificationPopup] 检测到跳转到通知详情页，清除当前通知');
      // 延迟清除，确保页面已跳转
      setTimeout(() => {
        handleClose(currentNotification.id);
      }, 200);
    }
  }, [location.pathname, currentNotification, handleClose]);
  
  // 监听通知已读事件，当通知被标记为已读时，清除当前显示
  useEffect(() => {
    const handleNotificationRead = (e) => {
      if (e.detail?.announcementId) {
        console.log('[NotificationPopup] 收到通知已读事件:', e.detail.announcementId);
        // 如果当前显示的通知被标记为已读，立即清除
        if (currentNotification?.id === e.detail.announcementId) {
          console.log('[NotificationPopup] 当前显示的通知被标记为已读，清除通知');
          handleClose(e.detail.announcementId);
        }
        // 从队列中移除已读的通知
        setNotificationQueue(prev => prev.filter(n => n.id !== e.detail.announcementId));
        // 清理调度信息
        scheduledNotificationsRef.current.delete(e.detail.announcementId);
        timeoutTimersRef.current.delete(e.detail.announcementId);
      }
    };
    
    window.addEventListener('notificationRead', handleNotificationRead);
    
    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, [currentNotification, handleClose]);
  
  // 当有通知显示时，通知导航栏刷新（触发导航栏更新通知数量）
  useEffect(() => {
    if (currentNotification) {
      console.log('[NotificationPopup] 有通知显示，通知导航栏刷新');
      // 触发导航栏刷新事件
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: { dataType: 'announcements' }
      }));
    }
  }, [currentNotification]);

  // 15秒自动关闭
  useEffect(() => {
    if (currentNotification) {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      
      autoCloseTimerRef.current = setTimeout(() => {
        handleClose(currentNotification.id);
      }, 15000);
      
      return () => {
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
      };
    }
  }, [currentNotification, handleClose]);

  if (!currentNotification) {
    return null;
  }

  return (
    <NotificationPopupItem
      announcement={currentNotification}
      onClose={() => handleClose(currentNotification.id)}
    />
  );
}

export default NotificationPopupManager;


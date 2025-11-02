import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import FooterSection from '../components/FooterSection';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { markAnnouncementAsRead, isAnnouncementRead } from '../utils/notificationHelper';
import './NotificationManagementPage.css';

const API_BASE_URL = 'http://localhost:8081/api';

const NotificationManagementPage = () => {
  const navigate = useNavigate();
  const notificationsContentRef = useRef(null);
  const isInitialMount = useRef(true);
  const [activeTab, setActiveTab] = useState('all'); // all, activity, system, message
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize, setPageSize] = useState(10); // 每页数量，默认10

  // 获取公告数据
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/announcement/active`);
      console.log('API响应:', response);
      console.log('响应数据:', response.data);
      
      if (response.data) {
        if (response.data.code === 200) {
          const announcementsData = response.data.data || [];
          console.log('获取到的公告数据:', announcementsData);
          console.log('公告数量:', announcementsData.length);
          
          announcementsData.forEach((ann, index) => {
            console.log(`公告${index + 1}:`, {
              id: ann.id,
              title: ann.title,
              type: ann.type,
              status: ann.status,
              typeUpper: ann.type ? ann.type.toUpperCase() : 'null'
            });
          });
          
          setAnnouncements(announcementsData);
        } else {
          console.error('API返回错误:', response.data.message || response.data.errorMessage);
          setAnnouncements([]);
        }
      } else {
        console.error('响应数据为空');
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('获取公告失败:', error);
      console.error('错误详情:', error.response?.data || error.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // 使用实时刷新hook（禁用轮询，只使用事件机制）
  useDataRefresh(fetchAnnouncements, 'announcements', {
    pollingInterval: 0, // 禁用轮询，只通过事件手动刷新
    enableVisibilityRefresh: false, // 禁用页面可见性刷新
  });

  // 根据类型筛选公告
  const getFilteredAnnouncements = () => {
    let filtered = [];
    if (activeTab === 'all') {
      filtered = announcements;
    } else {
      const typeMap = {
        activity: 'ACTIVITY',
        system: 'SYSTEM',
        message: 'MESSAGE',
      };
      // 确保类型匹配，处理大小写和空值情况
      filtered = announcements.filter(ann => {
        const annType = ann.type ? ann.type.toUpperCase() : null;
        const targetType = typeMap[activeTab];
        return annType === targetType;
      });
    }
    return filtered;
  };

  // 获取分页后的公告列表
  const getPaginatedAnnouncements = () => {
    const filtered = getFilteredAnnouncements();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  // 计算总页数
  const getTotalPages = () => {
    const filtered = getFilteredAnnouncements();
    return Math.ceil(filtered.length / pageSize) || 1;
  };

  // 切换标签页时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // 切换每页数量时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // 滚动到顶部的函数
  const scrollToTop = useCallback(() => {
    // 滚动到通知内容区域顶部
    if (notificationsContentRef.current) {
      const headerOffset = 100; // 预留顶部导航栏的高度
      const elementPosition = notificationsContentRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // 如果引用不存在，回退到滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // 页码变化时滚动到顶部
  useEffect(() => {
    // 跳过初次加载
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // 使用 setTimeout 确保在 DOM 更新后执行滚动
    const timer = setTimeout(() => {
      scrollToTop();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [currentPage, scrollToTop]);

  // 切换页码的处理函数（确保调用滚动）
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // 获取类型显示文本
  const getTypeText = (type) => {
    if (!type) return '系统通知';
    const typeUpper = type.toUpperCase();
    const typeMap = {
      ACTIVITY: '活动通知',
      SYSTEM: '系统通知',
      MESSAGE: '私信',
    };
    return typeMap[typeUpper] || '系统通知';
  };

  // 获取类型样式
  const getTypeStyle = (type) => {
    if (!type) return { backgroundColor: '#e6f7ff', color: '#0958d9', borderColor: '#91d5ff' };
    const typeUpper = type.toUpperCase();
    const styleMap = {
      ACTIVITY: { backgroundColor: '#fff7e6', color: '#d46b08', borderColor: '#ffd591' },
      SYSTEM: { backgroundColor: '#e6f7ff', color: '#0958d9', borderColor: '#91d5ff' },
      MESSAGE: { backgroundColor: '#f6ffed', color: '#389e0d', borderColor: '#b7eb8f' },
    };
    return styleMap[typeUpper] || styleMap.SYSTEM;
  };

  // 统计各类型数量
  const getTypeCount = (type) => {
    if (type === 'all') return announcements.length;
    const typeMap = {
      activity: 'ACTIVITY',
      system: 'SYSTEM',
      message: 'MESSAGE',
    };
    // 确保类型匹配，处理大小写和空值情况
    return announcements.filter(ann => {
      const annType = ann.type ? ann.type.toUpperCase() : null;
      const targetType = typeMap[type];
      return annType === targetType;
    }).length;
  };

  const paginatedAnnouncements = getPaginatedAnnouncements();
  const totalPages = getTotalPages();
  const totalItems = getFilteredAnnouncements().length;

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;
    
    // 如果总页数小于等于7，显示所有页码
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);
      
      if (current <= 3) {
        // 当前页在前面
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 2) {
        // 当前页在后面
        pages.push('...');
        for (let i = total - 3; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  };

  return (
    <div>
      <div className="notification-management-page">
        <div className="notification-management-container" ref={notificationsContentRef}>
          <h1 className="notification-management-title">通知中心</h1>
          
          {/* 标签页 */}
          <div className="notification-tabs">
            <button
              className={`notification-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              全部 <span className="tab-count">({getTypeCount('all')})</span>
            </button>
            <button
              className={`notification-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              活动通知 <span className="tab-count">({getTypeCount('activity')})</span>
            </button>
            <button
              className={`notification-tab ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              系统通知 <span className="tab-count">({getTypeCount('system')})</span>
            </button>
            <button
              className={`notification-tab ${activeTab === 'message' ? 'active' : ''}`}
              onClick={() => setActiveTab('message')}
            >
              私信 <span className="tab-count">({getTypeCount('message')})</span>
            </button>
          </div>

          {/* 分页控制栏 */}
          <div className="notification-pagination-controls">
            <div className="pagination-info">
              共 <span className="total-count">{totalItems}</span> 条通知
            </div>
            <div className="pagination-settings">
              <label htmlFor="page-size-select">每页显示：</label>
              <select
                id="page-size-select"
                className="page-size-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* 公告列表 */}
          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">加载中...</div>
            ) : paginatedAnnouncements.length > 0 ? (
              paginatedAnnouncements.map((announcement) => {
                const cleanHtml = DOMPurify.sanitize(announcement.content, {
                  ADD_ATTR: ['target'],
                });
                const typeStyle = getTypeStyle(announcement.type);

                return (
                  <div
                    key={announcement.id}
                    className="notification-item-card"
                    onClick={() => {
                      // 标记为已读
                      markAnnouncementAsRead(announcement.id);
                      // 跳转到详情页
                      navigate(`/notification/${announcement.id}`, { state: { announcement } });
                    }}
                  >
                    <div className="notification-item-header">
                      <span
                        className="notification-type-tag"
                        style={typeStyle}
                      >
                        {getTypeText(announcement.type)}
                      </span>
                      <h3 className="notification-item-title">{announcement.title}</h3>
                    </div>
                    <div
                      className="notification-item-preview"
                      dangerouslySetInnerHTML={{ __html: cleanHtml.substring(0, 200) + (cleanHtml.length > 200 ? '...' : '') }}
                    />
                    <div className="notification-item-footer">
                      <span className="notification-item-time">
                        {announcement.createTime
                          ? new Date(announcement.createTime).toLocaleString('zh-CN')
                          : ''}
                      </span>
                      <span className="notification-item-more">查看详情 →</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="notification-empty">
                <div className="notification-empty-icon">📭</div>
                <div className="notification-empty-text">暂无通知</div>
              </div>
            )}
          </div>

          {/* 分页导航 */}
          {totalPages > 1 && (
            <div className="notification-pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              
              <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button
                className="pagination-button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
              
              <div className="pagination-jump">
                <span>跳转到</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Number(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="pagination-jump-input"
                />
                <span>页</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 底部导航栏 - 放在页面padding之外，确保撑满宽度 */}
      <FooterSection />
    </div>
  );
};

export default NotificationManagementPage;


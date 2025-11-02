/**
 * 通知帮助工具
 * 管理用户已读通知的状态
 */

/**
 * 获取已读通知ID列表（从localStorage）
 * @returns {Array<number>} 已读通知ID数组
 */
export function getReadAnnouncementIds() {
    try {
        const readIds = localStorage.getItem('readAnnouncementIds');
        return readIds ? JSON.parse(readIds) : [];
    } catch (error) {
        console.error('读取已读通知列表失败:', error);
        return [];
    }
}

/**
 * 标记通知为已读
 * @param {number} announcementId 通知ID
 */
export function markAnnouncementAsRead(announcementId) {
    if (!announcementId) return;
    
    try {
        const readIds = getReadAnnouncementIds();
        if (!readIds.includes(announcementId)) {
            readIds.push(announcementId);
            localStorage.setItem('readAnnouncementIds', JSON.stringify(readIds));
            
            // 触发通知已读事件，让其他组件更新
            window.dispatchEvent(new CustomEvent('notificationRead', {
                detail: { announcementId }
            }));
        }
    } catch (error) {
        console.error('标记通知为已读失败:', error);
    }
}

/**
 * 检查通知是否已读
 * @param {number} announcementId 通知ID
 * @returns {boolean} 是否已读
 */
export function isAnnouncementRead(announcementId) {
    const readIds = getReadAnnouncementIds();
    return readIds.includes(announcementId);
}

/**
 * 计算未读通知数量
 * @param {Array} announcements 通知列表
 * @returns {number} 未读通知数量
 */
export function calculateUnreadCount(announcements) {
    if (!announcements || !Array.isArray(announcements)) {
        return 0;
    }
    const readIds = getReadAnnouncementIds();
    return announcements.filter(ann => !readIds.includes(ann.id)).length;
}

/**
 * 清除所有已读记录（用于测试或重置）
 */
export function clearReadAnnouncements() {
    localStorage.removeItem('readAnnouncementIds');
    window.dispatchEvent(new CustomEvent('notificationRead', {
        detail: { announcementId: null, clearAll: true }
    }));
}


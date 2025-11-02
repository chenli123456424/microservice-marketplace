/**
 * 用户信息更新辅助工具
 * 提供通用的用户信息更新方法，确保所有使用用户信息的组件都能实时刷新
 */

import axios from 'axios';

/**
 * 更新用户信息并同步到全局Context
 * @param {Function} updateUser - AuthContext中的updateUser方法
 * @param {string} token - 用户token
 * @returns {Promise<Object|null>} 更新后的用户信息，失败返回null
 */
export async function refreshUserInfo(updateUser, token) {
    try {
        const response = await axios.get('http://localhost:8081/api/user/current', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.code === 200 && response.data.data) {
            const userData = response.data.data;
            // 更新到Context，这会触发所有使用user的组件自动刷新
            updateUser(userData);
            return userData;
        }
        return null;
    } catch (error) {
        console.error('刷新用户信息失败:', error);
        return null;
    }
}

/**
 * 在任意位置更新用户信息后的通用处理方法
 * 调用此方法可确保所有组件都能获得最新的用户信息
 * 
 * @param {Function} updateUser - AuthContext中的updateUser方法
 * @param {string} token - 用户token
 * @param {Object} updatedUserData - 可选，如果已经获得更新后的用户数据，直接传入，避免重复请求
 */
export async function handleUserInfoUpdate(updateUser, token, updatedUserData = null) {
    if (updatedUserData) {
        // 如果已经提供了更新后的数据，直接更新
        updateUser(updatedUserData);
    } else {
        // 否则重新获取最新数据
        await refreshUserInfo(updateUser, token);
    }
}


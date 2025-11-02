import React, { createContext, useState, useContext } from 'react';

//创建Context对象
const AuthContext = createContext(null);
//创建Provider组件
export function AuthProvider({ children }) {
    //创建状态，并从localStorage中初始化token和user
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const userData = localStorage.getItem('user');
            return userData && userData !== 'undefined' && userData !== 'null' 
                ? JSON.parse(userData) 
                : null;
        } catch (error) {
            console.error('解析用户数据失败:', error);
            return null;
        }
    });

    //登录函数：更新state并存入localStorage
    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };
    //登出函数：更新state并删除localStorage中的token和user
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 清理可能存在的无效数据
        localStorage.removeItem('undefined');
    };

    //更新用户信息函数：更新state和localStorage中的user
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // 触发全局用户信息更新事件，让所有使用用户信息的组件自动刷新
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: userData }));
    };

    //定义要通过Context传递的数据
    const value = {
        token,
        user,
        isAuthenticated: !!token,//!!token将token字符串转为布尔值
        login,
        logout,
        updateUser
    };

    //返回Provider，并将value传递给子组件
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
//创建一个自定义的Hook，用于在组件中获取AuthContext的值
export function useAuth() {
    return useContext(AuthContext);
}
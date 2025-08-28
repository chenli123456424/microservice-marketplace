import React, { createContext, useState, useContext } from 'react';
//创建Context对象
const AuthContext = createContext(null);
//创建Provider组件
export function AuthProvider({ children }) {
    //创建状态，并从localStorage中初始化token
    const [token, setToken] = useState(localStorage.getItem('token'));

    //登录函数：更新state并存入localStorage
    const login = (newtoken) => {
        setToken(newtoken);
        localStorage.setItem('token', newtoken);
    };
    //登出函数：更新state并删除localStorage中的token
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    //定义要通过Context传递的数据
    const value = {
        token,
        isAuthenticated: !!token,//!!token将token字符串转为布尔值
        login,
        logout
    };

    //返回Provider，并将value传递给子组件
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
//创建一个自定义的Hook，用于在组件中获取AuthContext的值
export function useAuth() {
    return useContext(AuthContext);
}
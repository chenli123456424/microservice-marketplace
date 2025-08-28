import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AuthPage() {
    // 控制当前显示的是登录还是注册面板
    const [activeTab, setActiveTab] = useState('login'); // 'login' 或 'register'
    // 登录表单数据
    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
        email: '',
        verificationCode: ''
    });
    // 注册表单数据
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: ''
    });
    // 控制验证码倒计时
    const [countdown, setCountdown] = useState(0);
    // 控制是否使用邮箱登录
    const [isEmailLogin, setIsEmailLogin] = useState(false);
    // 语言选择
    const [language, setLanguage] = useState('zh');

    const { login } = useAuth();
    const navigate = useNavigate();

    // 多语言文本
    const translations = {
        zh: {
            pageTitle: '电商平台项目',
            login: '登录',
            register: '注册',
            username: '用户名',
            email: '邮箱',
            password: '密码',
            verificationCode: '验证码',
            sendCode: '发送验证码',
            codeSent: '已发送',
            loginButton: '登录',
            registerButton: '注册',
            forgotPassword: '忘记密码？',
            emailLogin: '邮箱登录',
            usernamePasswordLogin: '用户名密码登录',
            loginRegister: '登录/注册',
            usernamePlaceholder: '用户名',
            emailPlaceholder: '邮箱',
            passwordPlaceholder: '密码',
            verificationCodePlaceholder: '验证码',
            helpCenter: '帮助中心',
            copyright: '该项目归开发者「小陈学编程」所有，项目详情可访问Gitee：',
            giteeLink: 'https://gitee.com/xiao-chen-learns-programming/microservice-marketplace',
            sendCodeAlert: '验证码已发送，请查收邮箱',
            registerSuccess: '注册成功',
            loginSuccess: '登录成功',
            usernameExists: '用户名已存在',
            emailExists: '邮箱已存在',
            invalidCredentials: '用户名或密码错误',
            codeExpired: '验证码已过期',
            wrongCode: '验证码错误',
            userNotFound: '用户不存在',
            resendCode: (seconds) => `${seconds}秒后重新发送`
        },
        en: {
            pageTitle: 'E-commerce Platform',
            login: 'Login',
            register: 'Register',
            username: 'Username',
            email: 'Email',
            password: 'Password',
            verificationCode: 'Verification Code',
            sendCode: 'Send Code',
            codeSent: 'Sent',
            loginButton: 'Login',
            registerButton: 'Register',
            forgotPassword: 'Forgot Password?',
            emailLogin: 'Email Login',
            usernamePasswordLogin: 'Username/Password Login',
            loginRegister: 'Login/Register',
            usernamePlaceholder: 'Username',
            emailPlaceholder: 'Email',
            passwordPlaceholder: 'Password',
            verificationCodePlaceholder: 'Verification Code',
            helpCenter: 'Help Center',
            copyright: 'This project is owned by developer "Xiao Chen Learns Programming". For details, visit Gitee:',
            giteeLink: 'https://gitee.com/xiao-chen-learns-programming/microservice-marketplace',
            sendCodeAlert: 'Verification code sent, please check your email',
            registerSuccess: 'Registration successful',
            loginSuccess: 'Login successful',
            usernameExists: 'Username already exists',
            emailExists: 'Email already exists',
            invalidCredentials: 'Invalid username or password',
            codeExpired: 'Verification code expired',
            wrongCode: 'Incorrect verification code',
            userNotFound: 'User not found',
            resendCode: (seconds) => `Resend in ${seconds}s`
        }
    };

    // 获取当前语言的文本
    const t = (key, params) => {
        const text = translations[language][key] || key;
        if (typeof text === 'function') {
            return text(params);
        }
        return text;
    };

    // 倒计时效果
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    // 处理登录表单输入变化
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 处理注册表单输入变化
    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 切换到登录面板
    const switchToLogin = () => {
        setActiveTab('login');
        setIsEmailLogin(false);
        setCountdown(0);
    };

    // 切换到注册面板
    const switchToRegister = () => {
        setActiveTab('register');
        setIsEmailLogin(false);
        setCountdown(0);
    };

    // 切换邮箱登录模式
    const toggleEmailLogin = () => {
        setIsEmailLogin(!isEmailLogin);
        // 重置验证码状态
        if (!isEmailLogin) {
            setCountdown(0);
        }
    };

    // 发送验证码
    const sendVerificationCode = async () => {
        if (!loginData.email) {
            alert(language === 'zh' ? '请输入邮箱地址' : 'Please enter your email address');
            return;
        }

        try {
            await axios.post('http://localhost:8081/api/user/send-code', {
                email: loginData.email
            });
            setCountdown(60); // 开始60秒倒计时
        } catch (error) {
            console.error('发送验证码失败', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : language === 'zh' ? '发送验证码失败' : 'Failed to send verification code';
            alert(errorMessage);
        }
    };

    // 处理登录提交
    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEmailLogin) {
                // 邮箱验证码登录
                const response = await axios.post('http://localhost:8081/api/user/verify-code', {
                    email: loginData.email,
                    code: loginData.verificationCode
                });
                const { token } = response.data;
                login(token);
                navigate('/');
            } else {
                // 普通用户名密码登录
                const response = await axios.post('http://localhost:8081/api/user/login', {
                    username: loginData.username,
                    password: loginData.password
                });
                const { token } = response.data;
                login(token);
                navigate('/');
            }
        } catch (error) {
            console.error('登录失败', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : t('invalidCredentials');
            alert(errorMessage);
        }
    };

    // 处理注册提交
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8081/api/user/register', registerData);
            console.log(t('registerSuccess'), response.data);
            alert(t('registerSuccess'));

            // 注册成功后切换到登录面板
            switchToLogin();

            // 可以自动填充用户名字段
            setLoginData(prev => ({
                ...prev,
                username: registerData.username
            }));
        } catch (error) {
            console.error(t('registerSuccess'), error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : language === 'zh' ? '注册失败，请稍后再试。' : 'Registration failed, please try again.';
            alert(errorMessage);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* 左侧背景图片区域 */}
            <div style={{
                width: '30%',
                height: '100%',
                background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                        {language === 'zh' ? '电商平台' : 'E-commerce Platform'}
                    </h1>
                    <p style={{ fontSize: '1.2rem' }}>
                        {language === 'zh' ? '连接你我，共享美好' : 'Connecting you and me, sharing the wonderfulness'}
                    </p>
                </div>
            </div>

            {/* 右侧内容区域 */}
            <div style={{
                width: '70%',
                height: '100%',
                backgroundColor: '#f8f9fa',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* 顶部导航栏 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px 40px',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#333' }}>{t('pageTitle')}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); alert(language === 'zh' ? '帮助中心功能待实现' : 'Help center feature to be implemented'); }}
                            style={{ textDecoration: 'none', color: '#007bff' }}
                        >
                            {t('helpCenter')}
                        </a>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{
                                    padding: '5px 10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="zh">中文</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 登录/注册面板容器 */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '35%', // 减小宽度
                        minHeight: '550px', // 设置最小高度
                        maxHeight: '800px', // 设置最大高度
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                        padding: '30px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        {/* 标题切换栏 */}
                        <div style={{
                            display: 'flex',
                            marginBottom: '55px',
                            borderBottom: '1px solid #ddd'
                        }}>
                            <div
                                onClick={switchToLogin}
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'login' ? 'bold' : 'normal',
                                    color: activeTab === 'login' ? '#000' : '#666',
                                    borderBottom: activeTab === 'login' ? '2px solid #007bff' : 'none',
                                    fontSize: '25px' // 放大标题文字
                                }}
                            >
                                {t('login')}
                            </div>
                            <div
                                onClick={switchToRegister}
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'register' ? 'bold' : 'normal',
                                    color: activeTab === 'register' ? '#000' : '#666',
                                    borderBottom: activeTab === 'register' ? '2px solid #007bff' : 'none',
                                    fontSize: '25px' // 放大标题文字
                                }}
                            >
                                {t('register')}
                            </div>
                        </div>

                        {/* 登录面板 */}
                        {activeTab === 'login' && (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                width: '100%'
                            }}>
                                <form onSubmit={handleLoginSubmit} style={{ flex: 1 }}>
                                    {!isEmailLogin ? (
                                        <>
                                            <div style={{ marginBottom: '20px', width: '100%' }}>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    placeholder={t('usernamePlaceholder')}
                                                    value={loginData.username}
                                                    onChange={handleLoginChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '15px', // 加大内边距
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        boxSizing: 'border-box',
                                                        fontSize: '20px', // 放大字体
                                                        height: '65px' // 加高输入框
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div style={{ marginBottom: '20px', width: '100%' }}>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    placeholder={t('passwordPlaceholder')}
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '15px', // 加大内边距
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        boxSizing: 'border-box',
                                                        fontSize: '20px', // 放大字体
                                                        height: '65px' // 加高输入框
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ marginBottom: '20px', width: '100%' }}>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder={t('emailPlaceholder')}
                                                    value={loginData.email}
                                                    onChange={handleLoginChange}
                                                    style={{
                                                        width: '100%',
                                                        padding: '15px', // 加大内边距
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        boxSizing: 'border-box',
                                                        fontSize: '20px', // 放大字体
                                                        height: '65px' // 加高输入框
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', width: '100%' }}>
                                                <input
                                                    type="text"
                                                    name="verificationCode"
                                                    placeholder={t('verificationCodePlaceholder')}
                                                    value={loginData.verificationCode}
                                                    onChange={handleLoginChange}
                                                    style={{
                                                        flex: 1,
                                                        padding: '15px', // 加大内边距
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        boxSizing: 'border-box',
                                                        fontSize: '20px', // 放大字体
                                                        height: '65px', // 加高输入框
                                                        width: '50%'
                                                    }}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={sendVerificationCode}
                                                    disabled={countdown > 0}
                                                    style={{
                                                        padding: '15px 20px', // 加大内边距
                                                        backgroundColor: countdown > 0 ? '#cccccc' : '#007bff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                                        fontSize: '15px',
                                                        height: '65px' // 加高按钮
                                                    }}
                                                >
                                                    {countdown > 0 ? t('resendCode', countdown) : t('sendCode')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* 登录按钮 */}
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '15px', // 加大内边距
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginBottom: '20px',
                                            fontSize: '20px', // 放大字体
                                            height: '65px' // 加高按钮
                                        }}
                                    >
                                        {isEmailLogin ? t('loginRegister') : t('loginButton')}
                                    </button>
                                    
                                    {/* 忘记密码和邮箱登录链接 - 放在按钮下方 */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        marginBottom: '20px',
                                        fontSize: '17px',
                                        color: '#007bff',
                                        cursor: 'pointer'
                                    }}>
                                        <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>
                                            {t('forgotPassword')}
                                        </Link>
                                        <span onClick={toggleEmailLogin}>
                                            {isEmailLogin ? t('usernamePasswordLogin') : t('emailLogin')}
                                        </span>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 注册面板 */}
                        {activeTab === 'register' && (
                            <div style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                width: '100%'
                            }}>
                                <form onSubmit={handleRegisterSubmit} style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '20px', width: '100%' }}>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder={t('usernamePlaceholder')}
                                            value={registerData.username}
                                            onChange={handleRegisterChange}
                                            style={{
                                                width: '100%',
                                                padding: '15px', // 加大内边距
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                fontSize: '20px', // 放大字体
                                                height: '65px' // 加高输入框
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px', width: '100%' }}>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder={t('emailPlaceholder')}
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            style={{
                                                width: '100%',
                                                padding: '15px', // 加大内边距
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                fontSize: '20px', // 放大字体
                                                height: '65px' // 加高输入框
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px', width: '100%' }}>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder={t('passwordPlaceholder')}
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            style={{
                                                width: '100%',
                                                padding: '15px', // 加大内边距
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                fontSize: '20px', // 放大字体
                                                height: '65px' // 加高输入框
                                            }}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '15px', // 加大内边距
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '20px', // 放大字体
                                            height: '65px' // 加高按钮
                                        }}
                                    >
                                        {t('registerButton')}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部版权信息 */}
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#6c757d',
                    fontSize: '14px'
                }}>
                    {t('copyright')}
                    <a 
                        href={t('giteeLink')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                        {t('giteeLink')}
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;

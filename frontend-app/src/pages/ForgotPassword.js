import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: 输入邮箱并发送验证码, 2: 输入验证码和新密码
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [countdown, setCountdown] = useState(0); // 倒计时状态
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('zh');

    const navigate = useNavigate();

    // 多语言文本
    const translations = {
        zh: {
            title: '忘记密码',
            emailPlaceholder: '请输入您的邮箱地址',
            sendCode: '发送验证码',
            codeSent: '已发送',
            next: '下一步',
            codePlaceholder: '验证码',
            newPasswordPlaceholder: '新密码',
            confirmPasswordPlaceholder: '确认新密码',
            resetPassword: '重置密码',
            backToLogin: '返回登录',
            emailRequired: '请输入邮箱地址',
            passwordMismatch: '两次输入的密码不一致',
            passwordLength: '密码长度至少为6位',
            codeRequired: '请输入验证码',
            passwordsRequired: '请输入新密码和确认密码',
            successMessage: '密码重置成功，请使用新密码登录',
            errorMessage: '操作失败，请稍后重试',
            invalidCode: '验证码错误',
            resendCode: (seconds) => `${seconds}秒后重新发送`
        },
        en: {
            title: 'Forgot Password',
            emailPlaceholder: 'Please enter your email address',
            sendCode: 'Send Code',
            codeSent: 'Sent',
            next: 'Next',
            codePlaceholder: 'Verification Code',
            newPasswordPlaceholder: 'New Password',
            confirmPasswordPlaceholder: 'Confirm New Password',
            resetPassword: 'Reset Password',
            backToLogin: 'Back to Login',
            emailRequired: 'Please enter your email address',
            passwordMismatch: 'The two passwords you entered do not match',
            passwordLength: 'Password must be at least 6 characters',
            codeRequired: 'Please enter the verification code',
            passwordsRequired: 'Please enter new password and confirm password',
            successMessage: 'Password reset successfully, please login with your new password',
            errorMessage: 'Operation failed, please try again later',
            invalidCode: 'Invalid verification code',
            resendCode: (seconds) => `Resend in ${seconds}s`
        }
    };

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

    const handleSendCode = async () => {
        if (!email) {
            setError(t('emailRequired'));
            return;
        }

        try {
            await axios.post('http://localhost:8081/api/user/forgot-password', { email });
            setCountdown(60); // 开始60秒倒计时
            setError(''); // 清除错误信息
        } catch (err) {
            setError(err.response?.data?.message || t('errorMessage'));
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!email) {
            setError(t('emailRequired'));
            return;
        }
        
        if (!code) {
            setError(t('codeRequired'));
            return;
        }
        
        // 验证验证码是否正确
        try {
            const response = await axios.post('http://localhost:8081/api/user/verify-reset-code', {
                email,
                code
            });
            
            if (response.data.valid) {
                // 验证码正确，进入下一步
                setStep(2);
                setError('');
                setMessage('');
            } else {
                setError(response.data.error || t('invalidCode'));
                setMessage('');
            }
        } catch (err) {
            setError(err.response?.data?.error || t('errorMessage'));
            setMessage('');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!code) {
            setError(t('codeRequired'));
            return;
        }
        
        if (!newPassword || !confirmPassword) {
            setError(t('passwordsRequired'));
            return;
        }
        
        if (newPassword.length < 6) {
            setError(t('passwordLength'));
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/api/user/reset-password', {
                email,
                code,
                newPassword
            });
            
            if (response.data.message) {
                setMessage(t('successMessage'));
                setError('');
                
                // 3秒后跳转到登录页面
                setTimeout(() => {
                    navigate('/auth');
                }, 3000);
            } else {
                setError(response.data.error || t('errorMessage'));
                setMessage('');
            }
        } catch (err) {
            setError(err.response?.data?.error || t('errorMessage'));
            setMessage('');
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
                    <h2 style={{ margin: 0, color: '#333' }}>
                        {language === 'zh' ? '电商平台项目' : 'E-commerce Platform'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

                {/* 忘记密码面板容器 */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '35%',
                        minHeight: '500px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                        padding: '30px',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ marginBottom: '30px', color: '#333' }}>{t('title')}</h2>

                        {message && (
                            <div style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#d4edda',
                                color: '#155724',
                                borderRadius: '4px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                borderRadius: '4px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleVerifyCode} style={{ width: '100%' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <input
                                        type="email"
                                        placeholder={t('emailPlaceholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                            fontSize: '20px',
                                            height: '65px'
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    marginBottom: '20px',
                                    width: '100%'
                                }}>
                                    <input
                                        type="text"
                                        placeholder={t('codePlaceholder')}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '15px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                            fontSize: '20px',
                                            height: '65px',
                                            width: '50%'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={countdown > 0}
                                        style={{
                                            padding: '15px 20px',
                                            backgroundColor: countdown > 0 ? '#cccccc' : '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                            fontSize: '20px',
                                            height: '65px'
                                        }}
                                    >
                                        {countdown > 0 ? t('resendCode', countdown) : t('sendCode')}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '20px',
                                        height: '65px',
                                        marginBottom: '20px'
                                    }}
                                >
                                    {t('next')}
                                </button>

                                <div style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/auth')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#007bff',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        {t('backToLogin')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <input
                                        type="password"
                                        placeholder={t('newPasswordPlaceholder')}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                            fontSize: '16px',
                                            height: '50px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <input
                                        type="password"
                                        placeholder={t('confirmPasswordPlaceholder')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '15px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                            fontSize: '16px',
                                            height: '50px'
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        height: '50px',
                                        marginBottom: '20px'
                                    }}
                                >
                                    {t('resetPassword')}
                                </button>

                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#007bff',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        {t('backToLogin')}
                                    </button>
                                </div>
                            </form>
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
                    {language === 'zh' ? '该项目归开发者「小陈学编程」所有，项目详情可访问Gitee：' : 'This project is owned by developer "Xiao Chen Learns Programming". For details, visit Gitee:'}
                    <a
                        href="https://gitee.com/xiao-chen-learns-programming/microservice-marketplace"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                        https://gitee.com/xiao-chen-learns-programming/microservice-marketplace
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [isEmailLogin, setIsEmailLogin] = useState(false); // 控制登录方式切换
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false); // 控制验证码是否已发送
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (isEmailLogin) {
                // 邮箱验证码登录
                const response = await axios.post('http://localhost:8081/api/user/verify-code', {
                    email: email,
                    code: verificationCode
                });
                const { token } = response.data;
                login(token);
                navigate('/');
            } else {
                // 普通用户名密码登录
                const response = await axios.post('http://localhost:8081/api/user/login', {
                    username: username,
                    password: password
                });
                const { token } = response.data;
                login(token);
                navigate('/');
            }
        } catch (error) {
            console.error('登录失败', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : '登录失败，请检查信息。';
            alert(errorMessage);
        }
    };

    // 发送验证码
    const sendVerificationCode = async () => {
        if (!email) {
            alert('请输入邮箱地址');
            return;
        }

        try {
            await axios.post('http://localhost:8081/api/user/send-code', {
                email: email
            });
            setIsCodeSent(true);
            alert('验证码已发送，请查收邮箱');
        } catch (error) {
            console.error('发送验证码失败', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : '发送验证码失败';
            alert(errorMessage);
        }
    };

    // 切换登录方式
    const toggleLoginMethod = () => {
        setIsEmailLogin(!isEmailLogin);
        // 重置表单
        setUsername('');
        setPassword('');
        setEmail('');
        setVerificationCode('');
        setIsCodeSent(false);
    };

    return (
        <div>
            <h2>{isEmailLogin ? '邮箱登录/注册' : '用户登录'}</h2>
            <form onSubmit={handleSubmit}>
                {isEmailLogin ? (
                    <>
                        <div>
                            <label>邮箱:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>验证码:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                    placeholder="请输入验证码"
                                />
                                <button 
                                    type="button" 
                                    onClick={sendVerificationCode}
                                    disabled={isCodeSent}
                                >
                                    {isCodeSent ? '已发送' : '发送验证码'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label>用户名:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>密码:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}
                <button type="submit">登录</button>
            </form>
            <div style={{ marginTop: '10px' }}>
                <button onClick={toggleLoginMethod}>
                    {isEmailLogin ? '使用用户名密码登录' : '使用邮箱验证码登录/注册'}
                </button>
            </div>
        </div>
    );
}

export default Login;

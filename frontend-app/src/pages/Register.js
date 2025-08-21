import React, { useState } from 'react';
import axios from "axios";

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const userToRegister = {
            username: username,
            email: email,
            password: password,
        };

        try {
            // 修正后的URL路径
            const response = await axios.post('http://localhost:8081/api/user/register', userToRegister);
            console.log('注册成功，后端返回', response.data);
            alert('注册成功')

            //清空表单数据
            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('注册失败', error.response ? error.response.data : error.message);
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : '注册失败，请稍后再试。';
            alert(errorMessage);
        }
    };

    return (
        <div>
            <h2>用户注册</h2>
            <form onSubmit={handleSubmit}>
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
                    <label>邮箱:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit">注册</button>
            </form>
        </div>
    );
}

export default Register;
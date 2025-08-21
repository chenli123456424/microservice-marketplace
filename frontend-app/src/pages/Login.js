import React, {useState} from "react";
import axios from "axios";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const credentials = {
            username: username,
            password: password
        };

        try {
            // 调用后端登录接口
            const response = await axios.post("http://localhost:8081/api/user/login", credentials);
            //从响应中获取token
            const token = response.data.token;
            // 将token保存到localStorage中
            localStorage.setItem("token", token);
            //提示用户登录成功
            alert("登录成功");

            //清空表单
            setUsername("");
            setPassword("");
        }catch ( error){
            console.error("登录失败", error.response ? error.response.data : error);
            alert("登录失败");
        }
    };

    return (
        <div>
            <h2>登录</h2>
            <form onSubmit={handleSubmit}>
                <div>
                <label>
                    用户名:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                </div>
                <div>
                <label>
                    密码:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                </div>
                <button type="submit">登录</button>
            </form>
        </div>
    );
}

export default Login;

import './App.css';
import {Routes,Route,Link} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";

function Navbar() {
    return (
        <nav>
            <Link to="/">首页</Link>
            <Link to="/register">注册</Link>
            <Link to="/login">登录</Link>
        </nav>
    );
}

function App() {
  return (
    <div className="App">
        <Navbar />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    </div>
  );
}

export default App;

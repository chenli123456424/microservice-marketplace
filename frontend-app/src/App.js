import './App.css';
import {Routes, Route, Link, Outlet} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import {AuthProvider, useAuth} from "./context/AuthContext";

function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    return (
        <nav>
            <Link to="/">首页</Link> |{' '}
            {isAuthenticated ? (
                //如果已登录，显示登出按钮
                <>
                    <button onClick={logout}>登出</button>
                </>
            ): (
                    //否则显示登录和注册按钮
                    <>
                        <Link to="/login">登录</Link> |{' '}
                        <Link to="/register">注册</Link>
                    </>
            )}
        </nav>
    );
}

function App() {
  return (
      <div className="App">
          <AuthProvider>
              <Routes>
                  <Route path="/" element={<Layout/>}>
                      <Route index element={<HomePage/>}/>
                      <Route path="login" element={<Login/>}/>
                      <Route path="register" element={<Register/>}/>
                  </Route>
              </Routes>
          </AuthProvider>
      </div>
  );
}
function Layout() {
    return (
        <div className="container">
            <Navbar/>
            <Outlet/>
        </div>
    );
}
export default App;

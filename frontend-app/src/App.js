import './App.css';
import {Routes, Route, Link, Outlet} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
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
                        <Link to="/auth">登录/注册</Link>
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
                  {/*首页*/}
                  <Route path="/" element={<Layout/>}>
                      <Route index element={<HomePage/>}/>
                  </Route>
                  {/*登录和注册*/}
                  <Route path="/auth" element={<AuthPage/>}/>
                  {/*忘记密码*/}
                  <Route path="/forgot-password" element={<ForgotPassword/>}/>
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

import './App.css';
import {Routes, Route, Outlet} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/HomePage";
import {AuthProvider, useAuth} from "./context/AuthContext";
import TopNavigation from "./components/TopNavigation";

function App() {
  return (
      <div className="App">
          <AuthProvider>
              <Routes>
                  {/*首页和相关页面显示导航栏*/}
                  <Route path="/" element={<LayoutWithNav/>}>
                      <Route index element={<HomePage/>}/>
                      {/* 全屋定制 */}
                      <Route path="/custom" element={<div>全屋定制页面</div>} />
                      {/* 设计师 */}
                      <Route path="/designers" element={<div>设计师页面</div>} />
                      {/* 线下门店 */}
                      <Route path="/stores" element={<div>线下门店页面</div>} />
                      {/* 服务中心 */}
                      <Route path="/service" element={<div>服务中心页面</div>} />
                      {/* 社区/灵感 */}
                      <Route path="/community" element={<div>社区/灵感页面</div>} />
                      {/* 我的订单 */}
                      <Route path="/orders" element={<div>我的订单页面</div>} />
                      {/* 我的优惠券 */}
                      <Route path="/coupons" element={<div>我的优惠券页面</div>} />
                      {/* 个人信息 */}
                      <Route path="/profile" element={<div>个人信息页面</div>} />
                      {/* 购物车 */}
                      <Route path="/cart" element={<div>购物车页面</div>} />
                  </Route>
                  
                  {/*登录和注册相关页面不显示导航栏*/}
                  <Route path="/auth" element={<AuthPage/>}/>
                  <Route path="/forgot-password" element={<ForgotPassword/>}/>
              </Routes>
          </AuthProvider>
      </div>
  );
}

function LayoutWithNav() {
    return (
        <>
            <TopNavigation />
            <div className="container">
                <Outlet/>
            </div>
        </>
    );
}

export default App;

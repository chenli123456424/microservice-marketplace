import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ModalManager from './components/ModalManager';
import './App.css';
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/HomePage";
import ProductFilter from "./pages/ProductFilter"; // 添加这一行导入
import ProductDetailPage from "./pages/ProductDetailPage"; // 添加商品详情页导入
import CartPage from "./pages/CartPage"; // 添加购物车页面导入
import OrderConfirmPage from "./pages/OrderConfirmPage"; // 添加订单确认页面导入
import PaymentSuccessPage from "./pages/PaymentSuccessPage"; // 添加支付成功页面导入
import MyOrdersPage from "./pages/MyOrdersPage"; // 添加我的订单页面导入
import ProfilePage from "./pages/ProfilePage"; // 添加个人信息页面导入
import { AuthProvider } from './context/AuthContext';
import TopNavigation from './components/TopNavigation';

function AppContent() {
  const location = useLocation();
  
  // 不需要显示顶部导航栏的页面
  const noTopNavPages = ['/auth', '/forgot-password'];
  const shouldShowTopNav = !noTopNavPages.includes(location.pathname);

  return (
    <div className="App">
      <ScrollToTop />
      {shouldShowTopNav && <TopNavigation />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/products" element={<ProductFilter />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-confirm" element={<OrderConfirmPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <ModalManager />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/HomePage";
import ProductFilter from "./pages/ProductFilter"; // 添加这一行导入
import { AuthProvider } from './context/AuthContext';
import TopNavigation from './components/TopNavigation';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <TopNavigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/products" element={<ProductFilter />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

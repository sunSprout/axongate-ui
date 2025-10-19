import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './stores/authStore';
import AuthGuard from './components/AuthGuard';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProvidersPage from './pages/ProvidersPage';
import ModelsPage from './pages/ModelsPage';
import ProviderTokensPage from './pages/ProviderTokensPage';
import UserTokensPage from './pages/UserTokensPage';
import UsagePage from './pages/UsagePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            {/* 登录页面 */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 受保护的路由 */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <MainLayout />
                </AuthGuard>
              }
            >
              {/* 默认重定向到仪表盘 */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* 仪表盘 */}
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* 供应商管理 */}
              <Route path="providers" element={<ProvidersPage />} />
              
              {/* 模型管理 */}
              <Route path="models" element={<ModelsPage />} />
              
              {/* 供应商Token */}
              <Route path="provider-tokens" element={<ProviderTokensPage />} />
              
              {/* 用户Token */}
              <Route path="user-tokens" element={<UserTokensPage />} />
              
              {/* 用量记录 */}
              <Route path="usage" element={<UsagePage />} />
              
              {/* API测试台 - 移除 */}
              
              {/* 设置 */}
              <Route path="settings" element={<SettingsPage />} />
              
              {/* 个人信息 */}
              <Route path="profile" element={<SettingsPage />} />
            </Route>
            
            {/* 404 页面 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;

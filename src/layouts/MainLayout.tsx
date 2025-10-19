import React, { useState } from 'react';
import { Layout, Menu, Badge, Dropdown, Avatar, Space, Input, Button } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  RobotOutlined,
  KeyOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  SearchOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/providers',
      icon: <ShopOutlined />,
      label: '供应商',
    },
    {
      key: '/models',
      icon: <RobotOutlined />,
      label: '模型',
    },
    {
      key: '/provider-tokens',
      icon: <KeyOutlined />,
      label: '供应商 Token',
    },
    {
      key: '/user-tokens',
      icon: <UserOutlined />,
      label: '用户 Token',
    },
    {
      key: '/usage',
      icon: <BarChartOutlined />,
      label: '用量记录',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ 
          background: '#ffffff',
          boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.04), 1px 0 3px rgba(0,0,0,0.02)' 
        }}
        width={240}
      >
        <div className="h-20 flex items-center justify-center"
             style={{
               borderRadius: collapsed ? '12px' : '16px',
               margin: '8px',
               marginBottom: '4px',
               background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
               boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)'
             }}>
          <h1 className={`font-semibold transition-all duration-300 ${collapsed ? 'text-lg' : 'text-2xl'}`}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
            {collapsed ? 'AG' : 'AI Gateway'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0 px-2"
          theme="light"
          style={{
            fontSize: '14px',
            background: 'transparent',
          }}
        />
      </Sider>
      
      <Layout>
        <Header 
          className="h-16 px-6 flex items-center justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
          }}>
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg hover:bg-gray-100 rounded-lg transition-colors"
            />
            <Badge 
              count="生产环境" 
              className="ml-4"
              style={{ 
                backgroundColor: 'rgba(255, 234, 167, 0.5)',
                color: '#d63031',
                fontWeight: 500,
                borderRadius: '6px',
                padding: '2px 8px'
              }}
            />
          </div>
          
          <Space size="large">
            <Input
              placeholder="搜索 Token/请求ID..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-80"
              style={{
                borderRadius: '8px',
                backgroundColor: '#f5f5f7',
                border: 'none',
              }}
            />
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Space className="cursor-pointer hover:opacity-70 transition-opacity">
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: '#1a73e8',
                    cursor: 'pointer' 
                  }}
                />
                <span className="text-gray-700 font-medium">管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content 
          className="p-6"
          style={{
            background: `
              radial-gradient(800px circle at 20% -10%, rgba(93, 135, 255, 0.06), transparent 60%),
              radial-gradient(700px circle at 85% 110%, rgba(135, 206, 250, 0.08), transparent 60%),
              linear-gradient(180deg, #fafbfc 0%, #f3f4f7 100%)
            `,
            minHeight: 'calc(100vh - 64px)'
          }}>
          <div 
            className="bg-white min-h-full"
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
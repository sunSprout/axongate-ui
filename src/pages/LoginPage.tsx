import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error?.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `
          radial-gradient(800px circle at 20% -10%, rgba(93, 135, 255, 0.10), transparent 60%),
          radial-gradient(700px circle at 85% 110%, rgba(135, 206, 250, 0.12), transparent 60%),
          linear-gradient(180deg, #ffffff 0%, #f3f7ff 100%)
        `
      }}
    >
      <Card 
        className="w-[400px]"
        style={{
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '20px'
        }}
      >
        <div className="text-center mb-8">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a73e8', marginBottom: '8px' }}>
            AI Gateway
          </div>
          <div style={{ color: '#666' }}>管理系统登录</div>
        </div>

        <Spin spinning={loading}>
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '500',
                  background: '#1a73e8',
                  borderColor: '#1a73e8'
                }}
                className="hover:!bg-[#1557b0]"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Spin>

        <div className="text-center text-gray-400 text-sm mt-4">
          © 2025 AI Gateway. All rights reserved.
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
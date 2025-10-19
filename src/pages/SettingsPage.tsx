import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Typography,
  Space,
  Divider,
  message,
  Avatar,
  Upload,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [personalForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  
  const user = useAuthStore(state => state.user);

  // 处理个人信息保存
  const handlePersonalSave = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('个人信息已更新');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理密码修改
  const handlePasswordChange = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('密码已修改');
      securityForm.resetFields();
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理系统设置保存
  const handleSystemSave = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('系统设置已保存');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card bordered={false}>
        <div className="mb-6">
          <Title level={2} className="!mb-1">设置</Title>
          <Paragraph className="text-gray-500">
            管理个人信息和系统配置
          </Paragraph>
        </div>

        <Tabs defaultActiveKey="personal" type="card">
          {/* 个人信息 */}
          <TabPane
            tab={
              <span>
                <UserOutlined />
                个人信息
              </span>
            }
            key="personal"
          >
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4">
                <Avatar size={80} icon={<UserOutlined />} />
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>

              <Form
                form={personalForm}
                layout="vertical"
                onFinish={handlePersonalSave}
                initialValues={{
                  username: user?.username || 'admin',
                  email: 'admin@example.com',
                  phone: '13800138000',
                  department: '技术部',
                }}
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input disabled />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item name="department" label="部门">
                  <Input />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    保存修改
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          {/* 安全设置 */}
          <TabPane
            tab={
              <span>
                <LockOutlined />
                安全设置
              </span>
            }
            key="security"
          >
            <div className="max-w-2xl">
              <Title level={4}>修改密码</Title>
              <Paragraph className="text-gray-500">
                定期修改密码可以提高账户安全性
              </Paragraph>

              <Form
                form={securityForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  name="currentPassword"
                  label="当前密码"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 8, message: '密码至少8个字符' },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    修改密码
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              <Title level={4}>两步验证</Title>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Text>启用两步验证</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    增加额外的安全层，保护您的账户
                  </Text>
                </div>
                <Switch />
              </div>

              <Divider />

              <Title level={4}>登录历史</Title>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <Text>2024-01-15 14:23:45</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      IP: 192.168.1.100 | 设备: Chrome on Windows
                    </Text>
                  </div>
                  <Text type="success">成功</Text>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <Text>2024-01-14 10:15:32</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      IP: 192.168.1.101 | 设备: Safari on macOS
                    </Text>
                  </div>
                  <Text type="success">成功</Text>
                </div>
              </div>
            </div>
          </TabPane>

          {/* 系统设置 */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                系统设置
              </span>
            }
            key="system"
          >
            <div className="max-w-2xl">
              <Form
                form={systemForm}
                layout="vertical"
                onFinish={handleSystemSave}
                initialValues={{
                  language: 'zh-CN',
                  timezone: 'Asia/Shanghai',
                  theme: 'light',
                  notifications: true,
                  emailAlerts: true,
                }}
              >
                <Form.Item name="language" label="语言">
                  <Select>
                    <Select.Option value="zh-CN">简体中文</Select.Option>
                    <Select.Option value="en-US">English</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="timezone" label="时区">
                  <Select>
                    <Select.Option value="Asia/Shanghai">Asia/Shanghai</Select.Option>
                    <Select.Option value="America/New_York">America/New_York</Select.Option>
                    <Select.Option value="Europe/London">Europe/London</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="theme" label="主题">
                  <Select>
                    <Select.Option value="light">浅色</Select.Option>
                    <Select.Option value="dark">深色</Select.Option>
                    <Select.Option value="auto">跟随系统</Select.Option>
                  </Select>
                </Form.Item>

                <Divider />

                <Title level={4}>通知设置</Title>

                <Form.Item name="notifications" valuePropName="checked">
                  <Space>
                    <Switch />
                    <Text>启用系统通知</Text>
                  </Space>
                </Form.Item>

                <Form.Item name="emailAlerts" valuePropName="checked">
                  <Space>
                    <Switch />
                    <Text>邮件提醒</Text>
                  </Space>
                </Form.Item>

                <Divider />

                <Title level={4}>API 配置</Title>

                <Form.Item label="请求超时时间（秒）">
                  <Input type="number" defaultValue="30" />
                </Form.Item>

                <Form.Item label="最大重试次数">
                  <Input type="number" defaultValue="3" />
                </Form.Item>

                <Form.Item label="速率限制（请求/分钟）">
                  <Input type="number" defaultValue="100" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;
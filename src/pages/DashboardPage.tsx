import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Button, Typography, Space, Spin, Tag } from 'antd';
import {
  ShopOutlined,
  RobotOutlined,
  UserOutlined,
  ArrowUpOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { providerApi, modelApi, usageApi, providerTokenApi } from '../api';

const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [providerCount, setProviderCount] = useState(0);
  const [modelCount, setModelCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [hasProviderWithoutToken, setHasProviderWithoutToken] = useState(false);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取供应商数量
        const providers = await providerApi.getAll();
        setProviderCount(providers?.length || 0);

        // 获取模型数量
        const modelsResponse = await modelApi.getAll();
        setModelCount(modelsResponse?.models?.length || 0);

        // 获取请求量统计
        const stats = await usageApi.getStats();
        setRequestCount(stats?.total_requests || 0);

        // 检查供应商Token配置
        if (providers && providers.length > 0) {
          const tokensResponse = await providerTokenApi.getAll();
          const tokens = tokensResponse?.tokens || [];

          // 检查是否有供应商没有有效的Token
          const hasUnConfigured = providers.some(provider => {
            const providerTokens = tokens.filter(token => token.provider_id === provider.id);
            // 如果没有Token或者没有激活的Token
            return providerTokens.length === 0 || !providerTokens.some(token => token.active);
          });
          setHasProviderWithoutToken(hasUnConfigured);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 快捷操作卡片
  const quickActions = [
    {
      icon: <ShopOutlined className="text-3xl" />,
      title: '创建供应商',
      description: '配置新的AI服务供应商',
      action: () => navigate('/providers'),
      buttonText: '立即创建',
    },
    {
      icon: <RobotOutlined className="text-3xl" />,
      title: '创建模型',
      description: '添加新的AI模型配置',
      action: () => navigate('/models'),
      buttonText: '立即创建',
    },
    {
      icon: <UserOutlined className="text-3xl" />,
      title: '创建用户 Token',
      description: '生成新的用户访问令牌',
      action: () => navigate('/user-tokens'),
      buttonText: '立即创建',
    },
  ];

  return (
    <div className="p-6">
      {/* 警告信息 */}
      {hasProviderWithoutToken && (
        <Alert
          message="警告：检测到部分供应商缺少有效Token配置"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button
              size="small"
              type="link"
              onClick={() => navigate('/provider-tokens')}
            >
              立即配置
            </Button>
          }
          className="mb-6"
        />
      )}

      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2}>欢迎使用 AI Gateway 管理系统</Title>
        <Paragraph className="text-gray-500">
          统一管理和监控您的AI服务，提供高可用、高性能的API网关服务
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="活跃供应商"
                value={providerCount}
                suffix="个"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="可用模型"
                value={modelCount}
                suffix="个"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="总请求量"
                value={requestCount}
                prefix={<ArrowUpOutlined />}
                suffix="次"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <div>
                <Statistic
                  title="错误率"
                  value={0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Tag color="blue" style={{ marginTop: 8 }}>规划中</Tag>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 快捷操作 */}
      <div>
        <Title level={3} className="mb-4">快捷操作</Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                hoverable
                className="text-center h-full"
                bodyStyle={{ padding: '24px' }}
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="text-blue-500">{action.icon}</div>
                  <Title level={4} className="!mb-0">{action.title}</Title>
                  <Paragraph className="text-gray-500 text-sm">
                    {action.description}
                  </Paragraph>
                  <Button type="primary" onClick={action.action}>
                    {action.buttonText}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default DashboardPage;
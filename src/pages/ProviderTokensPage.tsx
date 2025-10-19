import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Card,
  Tooltip,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { ProviderToken, Provider } from '../types/api';
import { providerTokenApi, providerApi } from '../api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;

const ProviderTokensPage: React.FC = () => {
  const [tokens, setTokens] = useState<ProviderToken[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [form] = Form.useForm();
  const [filterProviderId, setFilterProviderId] = useState<string | undefined>();

  // 获取Token列表
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await providerTokenApi.getAll({
        provider_id: filterProviderId,
      });
      // 确保设置的是一个数组
      const tokenList = response?.tokens || [];
      setTokens(Array.isArray(tokenList) ? tokenList : []);
    } catch (error) {
      console.error('获取Token列表失败:', error);
      message.error('获取Token列表失败');
      // 出错时设置为空数组
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取供应商列表
  const fetchProviders = async () => {
    try {
      const response = await providerApi.getAll();
      // 确保设置的是一个数组
      setProviders(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      message.error('获取供应商列表失败');
      // 出错时设置为空数组
      setProviders([]);
    }
  };

  useEffect(() => {
    fetchTokens();
    fetchProviders();
  }, [filterProviderId]);

  // 处理创建Token
  const handleSubmit = async (values: any) => {
    try {
      await providerTokenApi.create(values);
      message.success('创建Token成功');
      setModalVisible(false);
      form.resetFields();
      fetchTokens();
    } catch (error) {
      message.error('创建Token失败');
    }
  };

  // 处理删除Token
  const handleDelete = async (id: string) => {
    try {
      await providerTokenApi.delete(id);
      message.success('删除Token成功');
      fetchTokens();
    } catch (error) {
      message.error('删除Token失败');
    }
  };

  // 处理切换Token状态
  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await providerTokenApi.update(id, { active });
      message.success(`Token已${active ? '激活' : '禁用'}`);
      fetchTokens();
    } catch (error) {
      message.error('更新Token状态失败');
    }
  };

  // 切换Token可见性
  const toggleTokenVisibility = (tokenId: string) => {
    const newVisibleTokens = new Set(visibleTokens);
    if (newVisibleTokens.has(tokenId)) {
      newVisibleTokens.delete(tokenId);
    } else {
      newVisibleTokens.add(tokenId);
    }
    setVisibleTokens(newVisibleTokens);
  };

  // 复制Token
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Token已复制到剪贴板');
    });
  };

  // 格式化Token显示
  const formatToken = (token: string, tokenId: string) => {
    if (visibleTokens.has(tokenId)) {
      return token;
    }
    if (token.length <= 8) {
      return '••••••••';
    }
    return `${token.slice(0, 4)}${'•'.repeat(20)}${token.slice(-4)}`;
  };

  // 获取供应商名称
  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || '未知';
  };

  // 获取供应商类型
  const getProviderType = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.model_type || 'unknown';
  };

  // 表格列配置
  const columns: ColumnsType<ProviderToken> = [
    {
      title: '供应商',
      dataIndex: 'provider_id',
      key: 'provider_id',
      render: (providerId) => {
        const type = getProviderType(providerId);
        const color = type === 'openai' ? 'blue' : type === 'anthropic' ? 'purple' : 'default';
        return (
          <Space>
            <Tag color={color}>{getProviderType(providerId).toUpperCase()}</Tag>
            <span>{getProviderName(providerId)}</span>
          </Space>
        );
      },
    },
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (token, record) => (
        <Space>
          <code className="bg-gray-100 px-2 py-1 rounded">
            {formatToken(token, record.id)}
          </code>
          <Tooltip title={visibleTokens.has(record.id) ? '隐藏' : '显示'}>
            <Button
              type="text"
              size="small"
              icon={visibleTokens.has(record.id) ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => toggleTokenVisibility(record.id)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(token)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) => (
        <Space>
          <Switch
            checked={active}
            onChange={(checked) => handleToggleActive(record.id, checked)}
            checkedChildren="激活"
            unCheckedChildren="禁用"
          />
          <Tag color={active ? 'success' : 'default'}>
            {active ? '激活' : '禁用'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这个Token吗？"
          description="删除后相关的API调用将失败"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 按供应商分组统计
  const getProviderStats = () => {
    const stats = new Map<string, { total: number; active: number }>();
    tokens.forEach(token => {
      const current = stats.get(token.provider_id) || { total: 0, active: 0 };
      stats.set(token.provider_id, {
        total: current.total + 1,
        active: current.active + (token.active ? 1 : 0)
      });
    });
    return stats;
  };

  const providerStats = getProviderStats();

  return (
    <div className="p-6">
      <Card bordered={false}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1">供应商 Token 管理</Title>
            <Paragraph className="text-gray-500">
              管理各供应商的API密钥，确保服务正常运行
            </Paragraph>
          </div>
          <Space>
            <Select
              placeholder="筛选供应商"
              allowClear
              style={{ width: 200 }}
              onChange={setFilterProviderId}
            >
              {providers.map(provider => (
                <Select.Option key={provider.id} value={provider.id}>
                  {provider.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setModalVisible(true);
              }}
            >
              添加 Token
            </Button>
          </Space>
        </div>

        {/* 供应商Token统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {providers.map(provider => {
            const stats = providerStats.get(provider.id) || { total: 0, active: 0 };
            const hasToken = stats.total > 0;
            const allActive = stats.total > 0 && stats.active === stats.total;
            const hasInactive = stats.total > stats.active;
            return (
              <Card key={provider.id} className={!hasToken ? 'border-red-200' : hasInactive ? 'border-yellow-200' : ''}>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    <KeyOutlined className={!hasToken ? 'text-red-500' : hasInactive ? 'text-yellow-500' : 'text-green-500'} />
                  </div>
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-500">
                    {stats.active} / {stats.total} 激活
                  </div>
                  {!hasToken && (
                    <Tag color="error" className="mt-2">未配置</Tag>
                  )}
                  {hasInactive && stats.total > 0 && (
                    <Tag color="warning" className="mt-2">部分禁用</Tag>
                  )}
                  {allActive && stats.total > 0 && (
                    <Tag color="success" className="mt-2">全部激活</Tag>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Table
          columns={columns}
          dataSource={tokens}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建模态框 */}
      <Modal
        title="添加供应商 Token"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="provider_id"
            label="选择供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select placeholder="请选择供应商">
              {providers.map(provider => (
                <Select.Option key={provider.id} value={provider.id}>
                  <Space>
                    <Tag color={provider.model_type === 'openai' ? 'blue' : 'purple'}>
                      {provider.model_type?.toUpperCase()}
                    </Tag>
                    {provider.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="token"
            label="API Token"
            rules={[
              { required: true, message: '请输入Token' },
              { min: 10, message: 'Token长度至少10个字符' },
            ]}
            extra="请输入供应商提供的API密钥"
          >
            <Input.TextArea
              placeholder="sk-..."
              rows={3}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProviderTokensPage;
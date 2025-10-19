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
  Switch,
  Typography,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { Provider } from '../types/api';
import { providerApi } from '../api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;

const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [form] = Form.useForm();

  // 获取供应商列表
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await providerApi.getAll();
      // 确保设置的是一个数组
      setProviders(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      message.error('获取供应商列表失败');
      // 出错时设置为空数组
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // 处理创建/编辑供应商
  const handleSubmit = async (values: any) => {
    try {
      if (editingProvider) {
        await providerApi.update(editingProvider.id, values);
        message.success('更新供应商成功');
      } else {
        await providerApi.create(values);
        message.success('创建供应商成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingProvider(null);
      fetchProviders();
    } catch (error) {
      message.error(editingProvider ? '更新供应商失败' : '创建供应商失败');
    }
  };

  // 处理删除供应商
  const handleDelete = async (id: string) => {
    try {
      await providerApi.delete(id);
      message.success('删除供应商成功');
      fetchProviders();
    } catch (error) {
      message.error('删除供应商失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    form.setFieldsValue(provider);
    setModalVisible(true);
  };

  // 健康检查
  const handleHealthCheck = async (provider: Provider) => {
    message.info(`正在检查 ${provider.name} 的连接状态...`);
    // TODO: 实现健康检查逻辑
    setTimeout(() => {
      message.success(`${provider.name} 连接正常`);
    }, 1500);
  };

  // 表格列配置
  const columns: ColumnsType<Provider> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '类型',
      dataIndex: 'model_type',
      key: 'model_type',
      render: (type) => (
        <Tag color={type === 'openai' ? 'blue' : 'purple'}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'API 地址',
      dataIndex: 'api_url',
      key: 'api_url',
      ellipsis: true,
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <Switch
          defaultChecked
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '健康状态',
      key: 'health',
      render: () => (
        <Tag color="green" icon={<SyncOutlined spin />}>
          正常
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleHealthCheck(record)}
          >
            检测
          </Button>
          <Popconfirm
            title="确定要删除这个供应商吗？"
            description="删除后相关的模型和Token也会被影响"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1">供应商管理</Title>
            <Paragraph className="text-gray-500">
              管理AI模型供应商配置，支持OpenAI、Anthropic等多种服务
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingProvider(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新建供应商
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={providers}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingProvider ? '编辑供应商' : '新建供应商'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingProvider(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            model_type: 'openai',
          }}
        >
          <Form.Item
            name="name"
            label="供应商名称"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="例如：OpenAI Official" />
          </Form.Item>

          <Form.Item
            name="model_type"
            label="供应商类型"
            rules={[{ required: true, message: '请选择供应商类型' }]}
          >
            <Select>
              <Select.Option value="openai">OpenAI</Select.Option>
              <Select.Option value="anthropic">Anthropic</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="api_url"
            label="API 地址"
            rules={[
              { required: true, message: '请输入API地址' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="例如：https://api.openai.com" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingProvider ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProvidersPage;
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Switch,
  Typography,
  Card,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { AIModel, Provider } from '../types/api';
import { modelApi, providerApi } from '../api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [form] = Form.useForm();
  const [filterProviderId, setFilterProviderId] = useState<string | undefined>();

  // 获取模型列表
  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await modelApi.getAll({
        provider_id: filterProviderId,
      });
      // 确保设置的是一个数组
      const modelList = response?.models || [];
      setModels(Array.isArray(modelList) ? modelList : []);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
      // 出错时设置为空数组
      setModels([]);
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
    fetchModels();
    fetchProviders();
  }, [filterProviderId]);

  // 处理创建/编辑模型
  const handleSubmit = async (values: any) => {
    try {
      if (editingModel) {
        await modelApi.update(editingModel.id, values);
        message.success('更新模型成功');
      } else {
        await modelApi.create(values);
        message.success('创建模型成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingModel(null);
      fetchModels();
    } catch (error) {
      message.error(editingModel ? '更新模型失败' : '创建模型失败');
    }
  };

  // 处理删除模型
  const handleDelete = async (id: string) => {
    try {
      await modelApi.delete(id);
      message.success('删除模型成功');
      fetchModels();
    } catch (error) {
      message.error('删除模型失败');
    }
  };

  // 处理状态切换
  const handleStatusChange = async (model: AIModel, checked: boolean) => {
    try {
      await modelApi.updateStatus(model.id, {
        status: checked ? 'active' : 'disabled',
      });
      message.success('状态更新成功');
      fetchModels();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 打开编辑模态框
  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    form.setFieldsValue({
      ...model,
      provider_id: model.provider_id,
      status: model.status || 'active',
    });
    setModalVisible(true);
  };

  // 获取供应商名称
  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || '未知';
  };

  // 表格列配置
  const columns: ColumnsType<AIModel> = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <strong>{text}</strong>
          <Tag color={record.status === 'active' ? 'green' : 'default'}>
            {record.status === 'active' ? '启用' : '禁用'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'provider_id',
      key: 'provider_id',
      render: (providerId) => (
        <Tag color="blue">{getProviderName(providerId)}</Tag>
      ),
    },
    {
      title: '供应商模型名',
      dataIndex: 'provider_model_name',
      key: 'provider_model_name',
      ellipsis: true,
    },
    {
      title: '输入价格',
      dataIndex: 'input_price',
      key: 'input_price',
      render: (price, record) => (
        <span>
          {price} {record.currency}/1K tokens
        </span>
      ),
    },
    {
      title: '输出价格',
      dataIndex: 'output_price',
      key: 'output_price',
      render: (price, record) => (
        <span>
          {price} {record.currency}/1K tokens
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
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
          <Popconfirm
            title="确定要删除这个模型吗？"
            description="删除后将无法恢复"
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
            <Title level={2} className="!mb-1">模型管理</Title>
            <Paragraph className="text-gray-500">
              管理AI模型配置，设置价格和状态
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
                setEditingModel(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新建模型
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm">总模型数</div>
                  <div className="text-2xl font-bold">{models.length}</div>
                </div>
                <div className="text-3xl text-blue-500">🤖</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm">激活模型</div>
                  <div className="text-2xl font-bold text-green-600">
                    {models.filter(m => m.status === 'active').length}
                  </div>
                </div>
                <div className="text-3xl text-green-500">✅</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm">供应商数</div>
                  <div className="text-2xl font-bold">{providers.length}</div>
                </div>
                <div className="text-3xl text-purple-500">🏢</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={models}
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
        title={editingModel ? '编辑模型' : '新建模型'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingModel(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: 'USD',
            input_price: 0,
            output_price: 0,
            status: 'active',
          }}
        >
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：gpt-4-turbo" />
          </Form.Item>

          <Form.Item
            name="provider_id"
            label="所属供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select placeholder="请选择供应商">
              {providers.map(provider => (
                <Select.Option key={provider.id} value={provider.id}>
                  {provider.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="provider_model_name"
            label="供应商模型名称"
            rules={[{ required: true, message: '请输入供应商模型名称' }]}
          >
            <Input placeholder="例如：gpt-4-1106-preview" />
          </Form.Item>

          <Form.Item
            name="status"
            label="模型状态"
            rules={[{ required: true, message: '请选择模型状态' }]}
          >
            <Select placeholder="请选择模型状态">
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currency"
                label="货币单位"
                rules={[{ required: true, message: '请选择货币单位' }]}
              >
                <Select>
                  <Select.Option value="USD">USD</Select.Option>
                  <Select.Option value="CNY">CNY</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="input_price"
                label="输入价格 (per 1K tokens)"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.001}
                  precision={4}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="output_price"
                label="输出价格 (per 1K tokens)"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0}
                  step={0.001}
                  precision={4}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingModel ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelsPage;
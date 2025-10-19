import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Tooltip,
  Empty,
  Input,
  notification,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
  KeyOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UserToken } from '../types/api';
import { userTokenApi } from '../api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;

const UserTokensPage: React.FC = () => {
  const [tokens, setTokens] = useState<UserToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newTokenModal, setNewTokenModal] = useState(false);
  const [newToken, setNewToken] = useState<string>('');
  const [copyingTokenId, setCopyingTokenId] = useState<string | null>(null);

  // 获取Token列表
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await userTokenApi.getAll();
      setTokens(response.tokens || []);
    } catch (error) {
      message.error('获取Token列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // 生成新Token
  const handleGenerateToken = async () => {
    setGenerating(true);
    try {
      const response = await userTokenApi.create();
      setNewToken(response.token);
      setNewTokenModal(true);
      fetchTokens();
      message.success('Token生成成功');
    } catch (error) {
      message.error('Token生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 删除Token
  const handleDelete = async (id: string) => {
    try {
      await userTokenApi.delete(id);
      message.success('Token删除成功');
      fetchTokens();
    } catch (error) {
      message.error('Token删除失败');
    }
  };

  // 改进的复制函数（支持fallback）
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // 尝试使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback方法：使用临时textarea
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          textArea.remove();
          return successful;
        } catch (err) {
          textArea.remove();
          return false;
        }
      }
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  };

  // 处理Token复制（用于列表中的部分token）
  const handleCopyToken = async (tokenId: string) => {
    setCopyingTokenId(tokenId);
    try {
      // 先获取完整的token
      const response = await userTokenApi.getById(tokenId);
      const success = await copyToClipboard(response.token);
      
      if (success) {
        notification.success({
          message: '复制成功',
          description: 'Token已复制到剪贴板',
          placement: 'topRight',
          duration: 2,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        });
      } else {
        message.error('复制失败，请手动选择并复制');
      }
    } catch (error) {
      message.error('获取完整Token失败，请稍后重试');
    } finally {
      setCopyingTokenId(null);
    }
  };

  // 直接复制完整Token（用于新建token模态框）
  const handleCopyFullToken = async (token: string) => {
    const success = await copyToClipboard(token);
    if (success) {
      notification.success({
        message: '复制成功',
        description: 'Token已复制到剪贴板',
        placement: 'topRight',
        duration: 2,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
    } else {
      // 如果复制失败，提供手动复制提示
      Modal.info({
        title: '请手动复制Token',
        content: (
          <div>
            <p>自动复制失败，请手动选择并复制以下Token：</p>
            <Input.TextArea 
              value={token} 
              readOnly 
              autoSize={{ minRows: 2, maxRows: 6 }} 
              onFocus={(e) => e.target.select()}
            />
          </div>
        ),
        width: 600,
      });
    }
  };

  // 格式化Token显示
  const formatToken = (token: string) => {
    if (token.length <= 16) {
      return token;
    }
    return `${token.slice(0, 8)}...${token.slice(-8)}`;
  };

  // 表格列配置
  const columns: ColumnsType<UserToken> = [
    {
      title: 'Token ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id) => (
        <Text code className="text-xs">
          {id}
        </Text>
      ),
    },
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (token, record) => (
        <Space>
          <Text code>{formatToken(token)}</Text>
          <Tooltip title="复制完整Token">
            <Button
              type="text"
              size="small"
              icon={copyingTokenId === record.id ? <LoadingOutlined /> : <CopyOutlined />}
              onClick={() => handleCopyToken(record.id)}
              disabled={copyingTokenId === record.id}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <Tag color="success">有效</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '最后使用',
      key: 'last_used',
      render: () => (
        <span className="text-gray-500">暂无记录</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定要撤销这个Token吗？"
          description="撤销后使用该Token的请求将失败"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            撤销
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1">用户 Token 管理</Title>
            <Paragraph className="text-gray-500">
              管理API访问令牌，控制系统访问权限
            </Paragraph>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTokens}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleGenerateToken}
              loading={generating}
            >
              生成新 Token
            </Button>
          </Space>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">总Token数</div>
                <div className="text-2xl font-bold">{tokens.length}</div>
              </div>
              <KeyOutlined className="text-3xl text-blue-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">活跃Token</div>
                <div className="text-2xl font-bold text-green-600">{tokens.length}</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">今日请求</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </Card>
        </div>

        {/* Token列表 */}
        {tokens.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无Token"
            className="py-12"
          >
            <Button type="primary" onClick={handleGenerateToken}>
              生成第一个Token
            </Button>
          </Empty>
        ) : (
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
        )}
      </Card>

      {/* 新Token展示模态框 */}
      <Modal
        title="Token 生成成功"
        open={newTokenModal}
        onCancel={() => setNewTokenModal(false)}
        footer={[
          <Button key="close" onClick={() => setNewTokenModal(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <div className="py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <span className="text-yellow-600 text-xl mr-2">⚠️</span>
              <div>
                <div className="font-medium text-yellow-900">重要提示</div>
                <div className="text-sm text-yellow-800 mt-1">
                  请立即复制并妥善保存此Token，关闭对话框后将无法再次查看完整Token。
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">您的新Token：</label>
              <div className="mt-2 p-3 bg-gray-100 rounded-lg font-mono text-sm break-all select-all">
                {newToken}
              </div>
            </div>

            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => handleCopyFullToken(newToken)}
              block
            >
              复制 Token
            </Button>

            <div className="text-sm text-gray-500">
              <div className="font-medium mb-2">使用方法：</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>在请求头中添加: Authorization: Bearer {'{your_token}'}</li>
                <li>或在URL参数中添加: ?token={'{your_token}'}</li>
              </ol>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserTokensPage;
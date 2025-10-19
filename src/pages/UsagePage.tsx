import React, { useEffect } from 'react';
import {
  Card,
  DatePicker,
  Select,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useUsageStore } from '../stores/usageStore';
import type { Usage } from '../types/api';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const UsagePage: React.FC = () => {
  const {
    usageList,
    usageStats,
    usageTrend,
    modelDistribution,
    loading,
    error,
    filters,
    totalCount,
    setFilters,
    fetchUsageList,
    refreshData,
  } = useUsageStore();

  // 自定义饼图标签渲染函数 - 实现动态文本缩放
  const renderCustomizedLabel = ({
    cx, cy, midAngle, outerRadius,
    percent, name, startAngle, endAngle
  }: any) => {
    // 计算扇形角度大小
    const angleSize = endAngle - startAngle;

    // 太小的扇形不显示标签
    if (angleSize < 5) return null;

    // 根据扇形大小动态计算字体大小
    const baseSize = 12;
    const textLength = name.length;
    // 根据角度大小和文本长度计算缩放因子
    const scaleFactor = Math.min(1, (angleSize * 3) / textLength);
    const fontSize = Math.max(8, Math.min(14, baseSize * scaleFactor));

    // 根据空间大小决定显示内容
    let displayText;
    if (angleSize > 30) {
      // 大扇形：显示简化名称 + 百分比
      const shortName = name.split('/').pop()?.split('-')[0] || name;
      displayText = `${shortName} ${(percent * 100).toFixed(1)}%`;
    } else if (angleSize > 15) {
      // 中扇形：显示更短的名称 + 百分比
      const shortName = name.split('/').pop()?.split('-')[0] || name;
      displayText = `${shortName.substring(0, 8)} ${(percent * 100).toFixed(0)}%`;
    } else {
      // 小扇形：只显示百分比
      displayText = `${(percent * 100).toFixed(0)}%`;
    }

    // 计算标签位置
    const RADIAN = Math.PI / 180;
    const labelRadius = outerRadius + 20;
    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        fontSize={fontSize}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {displayText}
      </text>
    );
  };

  // 自定义Tooltip组件 - 显示完整信息
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '12px' }}>
            {data.fullName || data.name}
          </p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>
            请求数: {data.requests?.toLocaleString() || 0}
          </p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>
            Token数: {data.tokens?.toLocaleString() || 0}
          </p>
          <p style={{ margin: '2px 0', fontSize: '11px' }}>
            费用: ${data.cost?.toFixed(4) || '0.0000'}
          </p>
          <p style={{ margin: '2px 0', fontSize: '11px', color: '#1890ff' }}>
            占比: {data.value?.toFixed(1) || 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  // 组件挂载时获取数据
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 当筛选条件改变时重新获取数据
  useEffect(() => {
    fetchUsageList();
  }, [filters, fetchUsageList]);

  // 处理错误显示
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // 表格列配置
  const columns: ColumnsType<Usage> = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '请求ID',
      dataIndex: 'request_id',
      key: 'request_id',
      ellipsis: true,
    },
    {
      title: '用户Token',
      dataIndex: 'user_token_id',
      key: 'user_token_id',
      ellipsis: true,
    },
    {
      title: '模型ID',
      dataIndex: 'model_id',
      key: 'model_id',
      ellipsis: true,
    },
    {
      title: '输入Token',
      dataIndex: 'input_tokens',
      key: 'input_tokens',
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '输出Token',
      dataIndex: 'output_tokens',
      key: 'output_tokens',
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '总Token',
      key: 'total_tokens',
      align: 'right',
      render: (record: Usage) => (record.input_tokens + record.output_tokens).toLocaleString(),
      sorter: (a, b) => (a.input_tokens + a.output_tokens) - (b.input_tokens + b.output_tokens),
    },
    {
      title: '费用($)',
      dataIndex: 'total_cost',
      key: 'total_cost',
      align: 'right',
      render: (cost) => `$${cost?.toFixed(6) || '0.000000'}`,
      sorter: (a, b) => a.total_cost - b.total_cost,
    },
  ];

  // 处理日期范围变化
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        dateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
      });
    } else {
      setFilters({ dateRange: null });
    }
  };

  // 处理模型选择变化
  const handleModelChange = (value: string) => {
    setFilters({ selectedModel: value, page: 1 });
  };

  // 处理用户选择变化
  const handleUserChange = (value: string) => {
    setFilters({ selectedUser: value, page: 1 });
  };

  // 应用筛选
  const handleApplyFilter = () => {
    setFilters({ page: 1 });
    refreshData();
  };

  // 导出数据
  const handleExport = () => {
    if (!usageList.length) {
      message.warning('没有可导出的数据');
      return;
    }

    const csvContent = usageList.map(record =>
      `${record.created_at},${record.request_id},${record.model_id},${record.input_tokens + record.output_tokens},${record.total_cost}`
    ).join('\n');

    const blob = new Blob([`时间,请求ID,模型ID,总Token,费用\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage_${dayjs().format('YYYYMMDD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    setFilters({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // 刷新数据
  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div className="p-6">
      <Card bordered={false}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1">用量记录</Title>
            <Paragraph className="text-gray-500">
              查看和分析API使用情况，跟踪成本消耗
            </Paragraph>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={!usageList.length}>
              导出
            </Button>
          </Space>
        </div>

        {/* 筛选器 */}
        <Card className="mb-6">
          <Space size="middle" wrap>
            <RangePicker
              value={filters.dateRange ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])] : null}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
            <Select
              placeholder="选择模型"
              style={{ width: 200 }}
              value={filters.selectedModel}
              onChange={handleModelChange}
            >
              <Select.Option value="all">所有模型</Select.Option>
              <Select.Option value="gpt-4-turbo">GPT-4 Turbo</Select.Option>
              <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
              <Select.Option value="claude-3-opus">Claude 3 Opus</Select.Option>
              <Select.Option value="claude-3-sonnet">Claude 3 Sonnet</Select.Option>
            </Select>
            <Select
              placeholder="选择用户"
              style={{ width: 200 }}
              value={filters.selectedUser}
              onChange={handleUserChange}
            >
              <Select.Option value="all">所有用户</Select.Option>
            </Select>
            <Button type="primary" icon={<FilterOutlined />} onClick={handleApplyFilter} loading={loading}>
              应用筛选
            </Button>
          </Space>
        </Card>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总请求数"
                value={usageStats?.total_requests || 0}
                suffix="次"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总Token消耗"
                value={usageStats ? usageStats.total_input_tokens + usageStats.total_output_tokens : 0}
                suffix="tokens"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总费用"
                value={usageStats?.total_cost || 0}
                prefix="$"
                precision={4}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均费用"
                value={usageStats && usageStats.total_requests > 0
                  ? usageStats.total_cost / usageStats.total_requests
                  : 0}
                prefix="$"
                suffix="per request"
                precision={6}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card title="使用趋势">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    stroke="#8884d8"
                    name="请求数"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    stroke="#82ca9d"
                    name="费用($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="模型使用分布">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelDistribution.map(item => ({
                      name: item.model_name,
                      fullName: item.model_name,
                      value: item.percent,
                      requests: item.requests,
                      tokens: item.tokens,
                      cost: item.cost,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 详细记录表格 */}
        <Card title="详细记录">
          <Table
            columns={columns}
            dataSource={usageList}
            rowKey="id"
            loading={loading}
            pagination={{
              current: filters.page,
              pageSize: filters.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total, range) => `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
          />
        </Card>
      </Card>
    </div>
  );
};

export default UsagePage;
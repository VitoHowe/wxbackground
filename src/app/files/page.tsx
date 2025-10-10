'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MainLayout, PageHeader } from '@/components';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Select,
  Pagination,
  Row,
  Col,
  App,
  Statistic,
  Button,
  Divider,
  Empty,
  DatePicker,
  Modal,
  Form,
} from 'antd';
import { CalendarOutlined, CloudOutlined, DeleteOutlined, EyeOutlined, RedoOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { FilesService, type FileItem, type FileStatus } from '@/services/files';
import { SystemService } from '@/services/system';
import type { ModelConfig, ProviderModel } from '@/types';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLORS: Record<FileStatus, string> = {
  pending: 'default',
  parsing: 'processing',
  completed: 'success',
  failed: 'error',
};

const STATUS_LABEL: Record<FileStatus, string> = {
  pending: '待解析',
  parsing: '解析中',
  completed: '已完成',
  failed: '解析失败',
};

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return '-';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }
  return `${mb.toFixed(2)} MB`;
};

const FilesListPage: React.FC = () => {
  const [status, setStatus] = useState<FileStatus | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const { message } = App.useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [parsingId, setParsingId] = useState<number | null>(null);
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);
  const [providers, setProviders] = useState<ModelConfig[]>([]);
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm<{ providerId: number; modelName: string }>();
  const { modal } = App.useApp();

  const startTime = dateRange?.[0]?.startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const endTime = dateRange?.[1]?.endOf('day').format('YYYY-MM-DD HH:mm:ss');

  const getStatusTag = useCallback((s?: FileStatus) => {
    if (!s) return '-';
    return (
      <Tag color={STATUS_COLORS[s]} bordered={false} style={{ paddingInline: 12 }}>
        {STATUS_LABEL[s]}
      </Tag>
    );
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FilesService.listFiles({ page, limit, status, startTime, endTime });
      if (res.code === 200 && res.data) {
        setData(res.data.files || []);
        setTotal(res.data.total || 0);
        return true;
      }
      message.error(res.message || '获取列表失败');
      return false;
    } catch (e: any) {
      message.error(e?.message || '获取列表失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [endTime, limit, message, page, startTime, status]);

  const refreshList = useCallback(async () => {
    setRefreshing(true);
    try {
      const success = await fetchData();
      if (success) {
        message.success('列表已刷新');
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, message]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await SystemService.fetchProviderConfigs();
      if (res.code === 200 && Array.isArray(res.data)) {
        const activeProviders = res.data.filter(p => p.status === 1);
        setProviders(activeProviders);
        return activeProviders;
      } else {
        message.error(res.message || '获取供应商列表失败');
        return [];
      }
    } catch (e: any) {
      message.error(e?.message || '获取供应商列表失败');
      return [];
    }
  }, [message]);

  const fetchModels = useCallback(async (providerId: number) => {
    setLoadingModels(true);
    try {
      const res = await SystemService.fetchProviderModels(providerId);
      if (res.code === 200 && Array.isArray(res.data)) {
        setModels(res.data);
      } else {
        message.error(res.message || '获取模型列表失败');
        setModels([]);
      }
    } catch (e: any) {
      message.error(e?.message || '获取模型列表失败');
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [message]);

  const handleOpenParseModal = useCallback(async (record: FileItem) => {
    if (!record?.id) return;
    setCurrentFile(record);
    setParseModalOpen(true);
    form.resetFields();
    setModels([]);
    await fetchProviders();
  }, [fetchProviders, form]);

  const handleDeleteFile = useCallback(async (record: FileItem) => {
    if (!record?.id) return;
    modal.confirm({
      title: '确认删除',
      content: `确定要删除文件「${record.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = await FilesService.deleteFile(record.id);
          if (res.code === 200) {
            message.success('删除成功');
            await fetchData();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (error: unknown) {
          message.error((error as Error)?.message || '删除失败');
        }
      },
    });
  }, [fetchData, message, modal]);

  const handleProviderChange = useCallback((providerId: number) => {
    form.setFieldValue('modelName', undefined);
    setModels([]);
    if (providerId) {
      fetchModels(providerId);
    }
  }, [fetchModels, form]);

  const handleConfirmParse = useCallback(async () => {
    if (!currentFile?.id) return;
    try {
      const values = await form.validateFields();
      const key = `parse-${currentFile.id}`;
      setConfirmLoading(true);
      message.open({ type: 'loading', content: '正在发起解析...', key, duration: 0 });

      const res = await FilesService.parseFile(currentFile.id, {
        providerId: values.providerId,
        modelName: values.modelName,
      });

      if (res.code === 200) {
        message.open({ type: 'success', content: res.data?.message || '解析任务已启动', key, duration: 2 });
        setParseModalOpen(false);
        setCurrentFile(null);
        await fetchData();
      } else {
        message.open({ type: 'error', content: res.message || '解析任务启动失败', key, duration: 3 });
      }
    } catch (e: any) {
      if (!(e as { errorFields?: unknown }).errorFields) {
        message.error(e?.message || '解析任务启动失败');
      }
    } finally {
      setConfirmLoading(false);
    }
  }, [currentFile, fetchData, form, message]);

  const handleCancelParse = useCallback(() => {
    setParseModalOpen(false);
    setCurrentFile(null);
    form.resetFields();
    setModels([]);
  }, [form]);

  const columns: ColumnsType<FileItem> = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: 50,
        align: 'center' as const,
        render: (_: unknown, __: FileItem, index) => (page - 1) * limit + index + 1,
      },
      {
        title: '文件名称',
        dataIndex: 'name',
        width: 200,
        render: (value: FileItem['name'], record: FileItem) => (
          <Space direction="vertical" size={4}>
            <Text strong>{value || '-'}</Text>
            {/* <Text type="secondary" style={{ fontSize: 12 }}>{record.file_original_name || '—'}</Text> */}
          </Space>
        ),
      },
      {
        title: '上传人',
        dataIndex: 'creator_name',
        width: 80,
        align: 'center' as const,
        render: (value: FileItem['creator_name']) => value || '-',
      },
      {
        title: '题目数量',
        dataIndex: 'total_questions',
        width: 80,
        align: 'center' as const,
        render: (value: FileItem['total_questions']) => (typeof value === 'number' ? value : '—'),
      },
      {
        title: '文件大小',
        dataIndex: 'file_size',
        width: 80,
        align: 'center' as const,
        render: (value: FileItem['file_size']) => formatFileSize(value),
      },
      {
        title: '解析状态',
        dataIndex: 'parse_status',
        width: 80,
        align: 'center' as const,
        render: (value: FileItem['parse_status']) => getStatusTag(value),
      },
      {
        title: '上传时间',
        dataIndex: 'created_at',
        width: 100,
        align: 'center' as const,
        render: (value: FileItem['created_at']) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        fixed: 'right' as const,
        render: (_: unknown, record: FileItem) => {
          const isCompleted = record.parse_status === 'completed';
          return (
            <Space>
              {isCompleted ? (
                <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => message.info('查看解析数据功能待接入')}>
                  查看解析数据
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleOpenParseModal(record)}
                >
                  解析
                </Button>
              )}
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteFile(record)}
              >
                删除
              </Button>
            </Space>
          );
        },
      },
    ],
    [getStatusTag, handleDeleteFile, handleOpenParseModal, limit, message, page]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parseSummary = useMemo(() => {
    if (!data.length) {
      return { total: 0, completed: 0, pending: 0 };
    }

    return data.reduce<{ total: number; completed: number; pending: number }>((acc, item) => {
      acc.total += 1;
      if (item.parse_status === 'completed') acc.completed += 1;
      if (item.parse_status === 'pending' || item.parse_status === 'parsing') acc.pending += 1;
      return acc;
    }, { total: 0, completed: 0, pending: 0 });
  }, [data]);

  return (
    <MainLayout>
      <PageHeader title="文件解析中心" subtitle="洞察最新上传的资料，实时掌握解析进度" />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ background: '#f7f9fc' }}>
          <Row gutter={24} justify="space-between">
            <Col xs={24} sm={12} md={8}>
              <Statistic title="当前结果" value={parseSummary.total} prefix={<CloudOutlined />} valueStyle={{ fontSize: 28 }} />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic title="已完成解析" value={parseSummary.completed} prefix={<EyeOutlined />} valueStyle={{ color: '#52c41a', fontSize: 28 }} />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic title="等待/进行中" value={parseSummary.pending} prefix={<CalendarOutlined />} valueStyle={{ color: '#faad14', fontSize: 28 }} />
            </Col>
          </Row>
        </Card>

        <Card
          bordered={false}
          bodyStyle={{ padding: 24 }}
          extra={
            <Button icon={<RedoOutlined />} onClick={refreshList} loading={loading || refreshing}>
              刷新
            </Button>
          }
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Text type="secondary">解析状态</Text>
                <Select
                  allowClear
                  placeholder="全部"
                  value={status}
                  onChange={(v) => {
                    setPage(1);
                    setStatus(v as FileStatus | undefined);
                  }}
                  options={[
                    { label: '待解析', value: 'pending' },
                    { label: '解析中', value: 'parsing' },
                    { label: '已完成', value: 'completed' },
                    { label: '解析失败', value: 'failed' },
                  ]}
                  style={{ width: '100%', marginTop: 8 }}
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text type="secondary">上传时间</Text>
                <RangePicker
                  allowEmpty={[true, true]}
                  value={dateRange as any}
                  onChange={(values) => {
                    setPage(1);
                    setDateRange(values as [Dayjs, Dayjs] | null);
                  }}
                  style={{ width: '100%', marginTop: 8 }}
                  size="large"
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text type="secondary">每页数量</Text>
                <Select
                  value={limit}
                  onChange={(v) => {
                    setPage(1);
                    setLimit(v);
                  }}
                  options={[10, 20, 50, 100].map((n) => ({ label: `${n} 条/页`, value: n }))}
                  style={{ width: '100%', marginTop: 8 }}
                  size="large"
                />
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0 16px' }} />

            <Table
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: 960 }}
              locale={{ emptyText: <Empty description="暂无文件，请先上传文档" /> }}
            />

            <div style={{ textAlign: 'right' }}>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger={false}
                onChange={(p) => setPage(p)}
                showTotal={(t) => `共 ${t} 条记录`}
              />
            </div>
          </Space>
        </Card>
      </Space>

      <Modal
        title="配置解析参数"
        open={parseModalOpen}
        onOk={handleConfirmParse}
        onCancel={handleCancelParse}
        confirmLoading={confirmLoading}
        okText="开始解析"
        cancelText="取消"
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="选择供应商"
            name="providerId"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select
              placeholder="请选择供应商"
              onChange={handleProviderChange}
              options={providers.map(p => ({
                label: `${p.name} (${p.type})`,
                value: p.id,
              }))}
              size="large"
            />
          </Form.Item>
          <Form.Item
            label="选择模型"
            name="modelName"
            rules={[{ required: true, message: '请选择模型' }]}
          >
            <Select
              placeholder="请先选择供应商"
              loading={loadingModels}
              disabled={models.length === 0}
              options={models.map(m => ({
                label: m.name,
                value: m.id,
                description: m.description,
              }))}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default FilesListPage;

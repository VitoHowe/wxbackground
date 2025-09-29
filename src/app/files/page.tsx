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
} from 'antd';
import { CalendarOutlined, CloudOutlined, EyeOutlined, RedoOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { FilesService, type FileItem, type FileStatus } from '@/services/files';

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

  const handleParse = useCallback(async (record: FileItem) => {
    if (!record?.id) return;
    const key = `parse-${record.id}`;
    setParsingId(record.id);
    message.open({ type: 'loading', content: '正在发起解析...', key, duration: 0 });
    try {
      const res = await FilesService.parseFile(record.id);
      if (res.code === 200) {
        message.open({ type: 'success', content: res.data?.message || '解析任务已启动', key, duration: 2 });
        await fetchData();
      } else {
        message.open({ type: 'error', content: res.message || '解析任务启动失败', key, duration: 3 });
      }
    } catch (e: any) {
      message.open({ type: 'error', content: e?.message || '解析任务启动失败', key, duration: 3 });
    } finally {
      setParsingId(null);
    }
  }, [fetchData, message]);

  const columns: ColumnsType<FileItem> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 80, align: 'center' as const },
      {
        title: '文件名称',
        dataIndex: 'name',
        render: (value: FileItem['name'], record: FileItem) => (
          <Space direction="vertical" size={4}>
            <Text strong>{value || '-'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.file_original_name || '—'}</Text>
          </Space>
        ),
      },
      {
        title: '上传人',
        dataIndex: 'creator_name',
        width: 140,
        render: (value: FileItem['creator_name']) => value || '-',
      },
      {
        title: '题目数量',
        dataIndex: 'total_questions',
        width: 120,
        align: 'center' as const,
        render: (value: FileItem['total_questions']) => (typeof value === 'number' ? value : '—'),
      },
      {
        title: '文件大小',
        dataIndex: 'file_size',
        width: 140,
        render: (value: FileItem['file_size']) => formatFileSize(value),
      },
      {
        title: '解析状态',
        dataIndex: 'parse_status',
        width: 140,
        render: (value: FileItem['parse_status']) => getStatusTag(value),
      },
      {
        title: '上传时间',
        dataIndex: 'created_at',
        width: 200,
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
                  onClick={() => handleParse(record)}
                  loading={parsingId === record.id}
                  disabled={parsingId !== null && parsingId !== record.id}
                >
                  解析
                </Button>
              )}
            </Space>
          );
        },
      },
    ],
    [getStatusTag, handleParse, message, parsingId]
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
    </MainLayout>
  );
};

export default FilesListPage;

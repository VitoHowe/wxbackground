'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppCard, KpiTiles, MainLayout, PageHeader } from '@/components';
import {
  Table,
  Tag,
  Space,
  Typography,
  Select,
  Pagination,
  App,
  Button,
  Divider,
  Empty,
  Drawer,
  Modal,
} from 'antd';
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { FilesService, type FileItem, type FileStatus, type ChapterItem } from '@/services/files';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const { Text } = Typography;

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
  const [refreshing, setRefreshing] = useState(false);
  const { message, modal } = App.useApp();

  const [chapterOpen, setChapterOpen] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FilesService.listFiles({ page, limit, status });
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
  }, [limit, message, page, status]);

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
    try {
      const res = await FilesService.parseFile(record.id);
      if (res.code === 200) {
        message.success('解析完成');
        await fetchData();
      } else {
        message.error(res.message || '解析失败');
      }
    } catch (e: any) {
      message.error(e?.message || '解析失败');
    }
  }, [fetchData, message]);

  const handleDeleteFile = useCallback((record: FileItem) => {
    if (!record?.id) return;
    modal.confirm({
      title: '确认删除',
      content: `确认删除文档 “${record.name}” 吗？`,
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

  const handleOpenChapters = useCallback(async (record: FileItem) => {
    if (!record?.id) return;
    setCurrentFile(record);
    setChapterOpen(true);
    setChapterLoading(true);
    try {
      const res = await FilesService.listChapters(record.id);
      if (res.code === 200 && Array.isArray(res.data)) {
        setChapters(res.data);
      } else {
        setChapters([]);
        message.error(res.message || '获取章节失败');
      }
    } catch (e: any) {
      message.error(e?.message || '获取章节失败');
      setChapters([]);
    } finally {
      setChapterLoading(false);
    }
  }, [message]);

  const handlePreview = useCallback(async (chapter: ChapterItem) => {
    setPreviewOpen(true);
    setPreviewTitle(chapter.chapter_title);
    setPreviewContent('');
    setPreviewLoading(true);
    try {
      const url = FilesService.buildPublicUrl(chapter.download_url);
      const res = await fetch(url);
      const text = await res.text();
      setPreviewContent(text);
    } catch (e: any) {
      message.error(e?.message || '预览失败');
    } finally {
      setPreviewLoading(false);
    }
  }, [message]);

  const columns: ColumnsType<FileItem> = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: 60,
        align: 'center',
        render: (_: unknown, __: FileItem, index) => (page - 1) * limit + index + 1,
      },
      {
        title: '文档名称',
        dataIndex: 'name',
        width: 220,
        render: (value: FileItem['name'], record: FileItem) => (
          <Space direction="vertical" size={2}>
            <Text strong>{value || '-'}</Text>
            {record.description ? <Text type="secondary">{record.description}</Text> : null}
          </Space>
        ),
      },
      {
        title: '章节数',
        dataIndex: 'chapter_count',
        width: 80,
        align: 'center',
        render: (value: FileItem['chapter_count']) => (typeof value === 'number' ? value : '-'),
      },
      {
        title: '文件大小',
        dataIndex: 'file_size',
        width: 100,
        align: 'center',
        render: (value: FileItem['file_size']) => formatFileSize(value),
      },
      {
        title: '状态',
        dataIndex: 'parse_status',
        width: 100,
        align: 'center',
        render: (value: FileItem['parse_status']) => (
          <Tag color={STATUS_COLORS[value || 'pending']} bordered={false}>
            {STATUS_LABEL[value || 'pending']}
          </Tag>
        ),
      },
      {
        title: '上传人',
        dataIndex: 'creator_name',
        width: 100,
        align: 'center',
        render: (value: FileItem['creator_name']) => value || '-',
      },
      {
        title: '上传时间',
        dataIndex: 'created_at',
        width: 140,
        align: 'center',
        render: (value: FileItem['created_at']) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        title: '操作',
        key: 'action',
        width: 220,
        fixed: 'right',
        render: (_: unknown, record: FileItem) => (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleParse(record)}
              disabled={record.parse_status === 'parsing'}
            >
              解析
            </Button>
            <Button
              size="small"
              icon={<FileSearchOutlined />}
              onClick={() => handleOpenChapters(record)}
              disabled={!record.chapter_count}
            >
              章节
            </Button>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteFile(record)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [handleDeleteFile, handleOpenChapters, handleParse, limit, page]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        if (item.parse_status === 'completed') acc.completed += 1;
        if (item.parse_status === 'pending' || item.parse_status === 'parsing') acc.pending += 1;
        acc.chapters += item.chapter_count || 0;
        return acc;
      },
      { completed: 0, pending: 0, chapters: 0 }
    );
  }, [data]);

  return (
    <MainLayout>
      <PageHeader
        title="Markdown 解析中心"
        subtitle="上传 Markdown 文档并自动拆分章节"
        extra={
          <Space>
            <Button onClick={() => router.push('/files/upload')}>
              上传文档
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={refreshList}
              loading={loading || refreshing}
            >
              刷新
            </Button>
          </Space>
        }
      />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <KpiTiles
          items={[
            {
              key: 'total',
              title: '文档总数',
              value: total,
              prefix: <FileTextOutlined />,
              tone: 'primary',
            },
            {
              key: 'completed',
              title: '本页已完成',
              value: stats.completed,
              prefix: <CheckCircleOutlined />,
              tone: 'success',
            },
            {
              key: 'pending',
              title: '本页待处理',
              value: stats.pending,
              prefix: <SyncOutlined />,
              tone: 'warning',
            },
            {
              key: 'chapters',
              title: '本页章节',
              value: stats.chapters,
              prefix: <CloudUploadOutlined />,
              tone: 'accent',
            },
          ]}
        />

        <AppCard title="文档列表">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className={styles.filters}>
              <div className={styles.filterItem}>
                <div className={styles.filterLabel}>解析状态</div>
                <Select
                  allowClear
                  placeholder="全部"
                  value={status}
                  onChange={value => {
                    setPage(1);
                    setStatus(value as FileStatus | undefined);
                  }}
                  options={[
                    { label: '待解析', value: 'pending' },
                    { label: '解析中', value: 'parsing' },
                    { label: '已完成', value: 'completed' },
                    { label: '解析失败', value: 'failed' },
                  ]}
                  style={{ width: '100%' }}
                />
              </div>
              <div className={styles.filterItem}>
                <div className={styles.filterLabel}>每页数量</div>
                <Select
                  value={limit}
                  onChange={value => {
                    setPage(1);
                    setLimit(value);
                  }}
                  options={[10, 20, 50, 100].map(n => ({ label: `${n} 条/页`, value: n }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <Divider style={{ margin: '2px 0 12px' }} />

            <Table
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
              size="middle"
              scroll={{ x: 980 }}
              locale={{ emptyText: <Empty description="暂无 Markdown 文档" /> }}
            />

            <div className={styles.pagination}>
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
        </AppCard>
      </Space>

      <Drawer
        title={currentFile ? `章节列表 · ${currentFile.name}` : '章节列表'}
        open={chapterOpen}
        onClose={() => setChapterOpen(false)}
        width={520}
        destroyOnClose
      >
        <Table
          rowKey="id"
          dataSource={chapters}
          loading={chapterLoading}
          pagination={false}
          size="small"
          columns={[
            {
              title: '章节',
              dataIndex: 'chapter_title',
              render: (value: string) => value || '-',
            },
            {
              title: '大小',
              dataIndex: 'file_size',
              width: 90,
              render: (value: number) => formatFileSize(value),
            },
            {
              title: '操作',
              width: 160,
              render: (_: unknown, record: ChapterItem) => (
                <Space>
                  <Button size="small" onClick={() => handlePreview(record)}>
                    预览
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    href={FilesService.buildPublicUrl(record.download_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    下载
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Drawer>

      <Modal
        title={previewTitle || '章节预览'}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
        maskClosable={false}
      >
        {previewLoading ? (
          <Text type="secondary">加载中...</Text>
        ) : (
          <MarkdownPreview source={previewContent} />
        )}
      </Modal>
    </MainLayout>
  );
};

export default FilesListPage;

'use client';

import React, { useState } from 'react';
import { AppCard, MainLayout, PageHeader } from '@/components';
import {
  App,
  Button,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
  Upload,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FilesService } from '@/services/files';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const { Dragger } = Upload;
const { Text } = Typography;

const ACCEPTED_TYPES = ['.md'];

const UploadPage: React.FC = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();

  const draggerProps: UploadProps = {
    name: 'file',
    maxCount: 1,
    multiple: false,
    accept: ACCEPTED_TYPES.join(','),
    beforeUpload: selectedFile => {
      setFile(selectedFile);
      return false;
    },
    onRemove: () => {
      setFile(null);
    },
  };

  const onFinish = async (values: { name: string; description?: string }) => {
    if (!file) {
      message.error('请先选择需要上传的 Markdown 文件');
      return;
    }
    setSubmitting(true);
    try {
      const res = await FilesService.uploadFile(file, {
        name: values.name,
        description: values.description,
      });
      if (res.code === 200) {
        message.success('上传成功');
        form.resetFields();
        setFile(null);
      } else {
        message.error(res.message || '上传失败');
      }
    } catch (e: any) {
      message.error(e?.message || '上传失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Markdown 文档上传"
        subtitle="仅支持 .md 文件，用于章节解析"
        extra={<Button onClick={() => router.push('/files')}>返回解析中心</Button>}
      />

      <AppCard
        title="上传信息"
        extra={<Text type="secondary">支持类型：{ACCEPTED_TYPES.join(', ')}</Text>}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="文档名称"
                name="name"
                rules={[{ required: true, message: '请输入文档名称' }]}
              >
                <Input placeholder="请输入 Markdown 文档名称" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="文档描述" name="description">
                <Input placeholder="可选，用于备注文档用途" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="选择 Markdown 文件" required>
            <Dragger {...draggerProps} className={styles.dragger}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 .md 文件到此处上传</p>
              <p className="ant-upload-hint">支持文件类型：{ACCEPTED_TYPES.join(', ')}</p>
            </Dragger>
            {file ? (
              <Text type="secondary" className={styles.selected}>
                已选择：{file.name}
              </Text>
            ) : null}
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              上传
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setFile(null);
              }}
            >
              重置
            </Button>
          </Space>
        </Form>
      </AppCard>
    </MainLayout>
  );
};

export default UploadPage;

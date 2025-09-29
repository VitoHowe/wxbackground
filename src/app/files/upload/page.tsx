'use client';

import React, { useState } from 'react';
import { MainLayout, PageHeader } from '@/components';
import { Card, Form, Input, Button, Upload, Typography, Space, Select, App, Row, Col } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FilesService } from '@/services/files';

const { Dragger } = Upload;
const { Text } = Typography;

const ACCEPTED_TYPES = [
  '.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.xls', '.csv', '.json',
];

const UploadPage: React.FC = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const draggerProps: UploadProps = {
    name: 'file',
    maxCount: 1,
    multiple: false,
    accept: ACCEPTED_TYPES.join(','),
    beforeUpload: (file) => {
      setFile(file);
      return false; // prevent auto upload
    },
    onRemove: () => {
      setFile(null);
    },
  };

  const onFinish = async (values: any) => {
    if (!file) {
      message.error('请先选择需要上传的文件');
      return;
    }
    setSubmitting(true);
    try {
      const res = await FilesService.uploadFile(file, {
        name: values.name,
        description: values.description,
        type: file.type,
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
      <PageHeader title="文件上传" subtitle="支持 PDF, DOC, DOCX, TXT, MD, XLSX, XLS, CSV, JSON" />
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="题库名称"
                name="name"
                rules={[{ required: true, message: '请输入题库名称' }]}
              >
                <Input placeholder="请输入文件/题库名称" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="文件类型(可选)" name="type">
                <Select
                  allowClear
                  placeholder="自动识别，如需可手动选择"
                  options={[
                    { label: 'PDF', value: 'application/pdf' },
                    { label: 'Word (DOC/DOCX)', value: 'application/msword' },
                    { label: 'Excel (XLS/XLSX)', value: 'application/vnd.ms-excel' },
                    { label: 'CSV', value: 'text/csv' },
                    { label: '纯文本', value: 'text/plain' },
                    { label: 'Markdown', value: 'text/markdown' },
                    { label: 'JSON', value: 'application/json' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="题库描述" name="description">
            <Input.TextArea rows={4} placeholder="请输入该文件/题库的描述" allowClear />
          </Form.Item>

          <Form.Item label="选择文件" required>
            <Dragger {...draggerProps} style={{ padding: 16 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
              <p className="ant-upload-hint">
                支持的文件类型: {ACCEPTED_TYPES.join(', ')}
              </p>
            </Dragger>
            {file && (
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                已选择: {file.name}
              </Text>
            )}
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
      </Card>
    </MainLayout>
  );
};

export default UploadPage;

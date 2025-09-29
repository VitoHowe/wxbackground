'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  MainLayout,
  MarkdownModal,
  PageHeader,
} from '@/components';
import { SystemService } from '@/services/system';
import type {
  JsonValue,
  ModelConfig,
  ModelConfigPayload,
} from '@/types';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const { Paragraph, Text } = Typography;

type EditableModel = ModelConfig | null;

type SettingModalType = 'knowledge' | 'question';

const statusLabels: Record<number, string> = {
  0: '停用',
  1: '启用',
};

const SettingsPage: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modelSubmitting, setModelSubmitting] = useState(false);
  const [editingModel, setEditingModel] = useState<EditableModel>(null);
  const [settingsModalType, setSettingsModalType] = useState<SettingModalType | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsContent, setSettingsContent] = useState('');
  const [form] = Form.useForm<ModelConfigPayload & { statusSwitch: boolean }>();
  const { message, modal } = App.useApp();

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SystemService.fetchModelConfigs();
      if (res.code === 200 && Array.isArray(res.data)) {
        setModels(res.data);
      } else {
        message.error(res.message || '获取模型配置失败');
      }
    } catch (error: unknown) {
      message.error((error as Error)?.message || '获取模型配置失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  const handleOpenModelModal = (model: EditableModel = null) => {
    setEditingModel(model);
    setModelModalOpen(true);
    if (model) {
      form.setFieldsValue({
        name: model.name,
        endpoint: model.endpoint,
        api_key: model.api_key,
        description: model.description ?? '',
        statusSwitch: model.status === 1,
      });
    } else {
      form.resetFields();
      form.setFieldValue('statusSwitch', true);
    }
  };

  const handleSubmitModel = async () => {
    try {
      const values = await form.validateFields();
      const payload: ModelConfigPayload = {
        name: values.name,
        endpoint: values.endpoint,
        api_key: values.api_key,
        description: values.description ?? '',
        status: values.statusSwitch ? 1 : 0,
      };

      setModelSubmitting(true);
      const request = editingModel
        ? SystemService.updateModelConfig(editingModel.id, payload)
        : SystemService.createModelConfig(payload);
      const res = await request;
      if (res.code === 200 || res.code === 201) {
        message.success(editingModel ? '修改模型配置成功' : '新增模型配置成功');
        setModelModalOpen(false);
        setEditingModel(null);
        await fetchModels();
      } else {
        message.error(res.message || '保存模型配置失败');
      }
    } catch (error: unknown) {
      if (!(error as { errorFields?: unknown }).errorFields) {
        message.error((error as Error)?.message || '保存模型配置失败');
      }
    } finally {
      setModelSubmitting(false);
    }
  };

  const handleDeleteModel = (model: ModelConfig) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除模型「${model.name}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = await SystemService.deleteModelConfig(model.id);
          if (res.code === 200) {
            message.success('删除成功');
            await fetchModels();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch (error: unknown) {
          message.error((error as Error)?.message || '删除失败');
        }
      },
    });
  };

  const handleSwitchChange = async (checked: boolean, model: ModelConfig) => {
    try {
      const res = await SystemService.updateModelConfig(model.id, {
        status: checked ? 1 : 0,
      });
      if (res.code === 200) {
        message.success(`模型已${checked ? '启用' : '停用'}`);
        setModels(prev =>
          prev.map(item =>
            item.id === model.id
              ? {
                  ...item,
                  status: checked ? 1 : 0,
                }
              : item
          )
        );
      } else {
        message.error(res.message || '更新模型状态失败');
      }
    } catch (error: unknown) {
      message.error((error as Error)?.message || '更新模型状态失败');
    }
  };

  const obfuscateApiKey = useCallback((key: string) => {
    if (!key) return '-';
    if (key.length <= 8) return key.replace(/.(?=.{4})/g, '*');
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
  }, []);

  const columns: ColumnsType<ModelConfig> = useMemo(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: 80,
        align: 'center',
        render: (_: unknown, __: ModelConfig, index) => index + 1,
      },
      {
        title: '模型名称',
        dataIndex: 'name',
        width: 200,
        render: value => value || '-',
      },
      {
        title: '模型地址',
        dataIndex: 'endpoint',
        render: value => (
          <Paragraph
            copyable={{ text: value }}
            ellipsis={{ tooltip: value, rows: 2 }}
            style={{ marginBottom: 0 }}
          >
            {value || '-'}
          </Paragraph>
        ),
      },
      {
        title: '模型密钥',
        dataIndex: 'api_key',
        width: 240,
        render: value => (
          <Space size={8}>
            <Text code style={{ marginBottom: 0 }}>
              {obfuscateApiKey(value)}
            </Text>
            <Button
              type="link"
              size="small"
              onClick={() => navigator.clipboard.writeText(value)}
            >
              复制
            </Button>
          </Space>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 160,
        render: (value, record) => (
          <Space size={12}>
            <Switch
              checked={value === 1}
              onChange={checked => handleSwitchChange(checked, record)}
              checkedChildren="启用"
              unCheckedChildren="停用"
            />
            <Tag color={value === 1 ? 'success' : 'default'}>{statusLabels[value]}</Tag>
          </Space>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        render: (_: unknown, record) => (
          <Space size={12}>
            <Button type="link" onClick={() => handleOpenModelModal(record)}>
              修改
            </Button>
            <Button type="link" danger onClick={() => handleDeleteModel(record)}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [handleSwitchChange, obfuscateApiKey]
  );

  const openSettingsModal = async (type: SettingModalType) => {
    setSettingsModalType(type);
    setSettingsLoading(true);
    try {
      const fetcher =
        type === 'knowledge'
          ? SystemService.fetchKnowledgeFormat<JsonValue>
          : SystemService.fetchQuestionFormat<JsonValue>;
      const res = await fetcher();
      if (res.code === 200) {
        const payload = res.data?.payload;
        const text =
          typeof payload === 'string'
            ? payload
            : JSON.stringify(payload ?? {}, null, 2);
        setSettingsContent(text);
      } else {
        message.error(res.message || '获取配置失败');
        setSettingsModalType(null);
      }
    } catch (error: unknown) {
      message.error((error as Error)?.message || '获取配置失败');
      setSettingsModalType(null);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async (content: string) => {
    if (!settingsModalType) return;
    let payload: JsonValue;
    try {
      payload = JSON.parse(content);
    } catch (error) {
      message.error('请填写合法的 JSON 内容');
      return;
    }
    setSettingsSaving(true);
    try {
      const saver =
        settingsModalType === 'knowledge'
          ? SystemService.saveKnowledgeFormat<JsonValue>
          : SystemService.saveQuestionFormat<JsonValue>;
      const res = await saver(payload);
      if (res.code === 200) {
        message.success('配置保存成功');
        setSettingsModalType(null);
      } else {
        message.error(res.message || '配置保存失败');
      }
    } catch (error: unknown) {
      message.error((error as Error)?.message || '配置保存失败');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCancelSettings = () => {
    setSettingsModalType(null);
    setSettingsContent('');
  };

  return (
    <MainLayout>
      <PageHeader
        title="系统设置"
        subtitle="管理模型配置与解析模板"
        extra={
          <Space>
            <Button type="primary" onClick={() => handleOpenModelModal()}>
              新增模型
            </Button>
            <Button onClick={() => openSettingsModal('knowledge')}>知识库解析格式</Button>
            <Button onClick={() => openSettingsModal('question')}>题库解析格式</Button>
          </Space>
        }
      />

      <Card title="模型配置" bordered={false}>
        <Table<ModelConfig>
          rowKey="id"
          loading={loading}
          dataSource={models}
          columns={columns}
          pagination={false}
        />
      </Card>

      <Modal
        open={modelModalOpen}
        title={editingModel ? '修改模型配置' : '新增模型配置'}
        destroyOnClose
        onCancel={() => {
          setModelModalOpen(false);
          setEditingModel(null);
        }}
        onOk={() => void handleSubmitModel()}
        okText="保存"
        confirmLoading={modelSubmitting}
        width={520}
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="模型名称"
            name="name"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" allowClear />
          </Form.Item>
          <Form.Item
            label="模型地址"
            name="endpoint"
            rules={[{ required: true, message: '请输入模型服务地址' }]}
          >
            <Input placeholder="https://example.com/v1/chat/completions" allowClear />
          </Form.Item>
          <Form.Item
            label="模型密钥"
            name="api_key"
            rules={[{ required: true, message: '请输入模型密钥' }]}
          >
            <Input.Password placeholder="请输入模型密钥" allowClear />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="请输入描述信息" rows={3} allowClear />
          </Form.Item>
          <Form.Item
            label="是否启用"
            name="statusSwitch"
            valuePropName="checked"
            initialValue
          >
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>

      <MarkdownModal
        open={!!settingsModalType}
        title={settingsModalType === 'knowledge' ? '知识库解析格式' : '题库解析格式'}
        value={settingsContent}
        loading={settingsLoading}
        saving={settingsSaving}
        onCancel={handleCancelSettings}
        onSave={handleSaveSettings}
      />
    </MainLayout>
  );
};

export default SettingsPage;

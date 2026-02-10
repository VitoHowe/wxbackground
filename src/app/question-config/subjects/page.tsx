"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppCard, KpiTiles, MainLayout, PageHeader } from "@/components";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  App,
  Switch,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, EditOutlined, PoweroffOutlined } from "@ant-design/icons";
import { SubjectsService, type SubjectItem } from "@/services/subjects";

const { Text } = Typography;

const StatusTag: React.FC<{ status: number }> = ({ status }) => (
  <Tag color={status === 1 ? "success" : "default"} bordered={false} style={{ marginInlineEnd: 0 }}>
    {status === 1 ? "启用" : "停用"}
  </Tag>
);

const SubjectsPage: React.FC = () => {
  const [data, setData] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<SubjectItem | null>(null);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SubjectsService.listSubjects(true);
      if (res.code === 200) {
        setData(res.data?.subjects || []);
      } else {
        message.error(res.message || "获取科目失败");
      }
    } catch (error: any) {
      message.error(error?.message || "获取科目失败");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const summary = useMemo(() => {
    const total = data.length;
    const enabled = data.filter((item) => item.status === 1).length;
    const disabled = total - enabled;
    return { total, enabled, disabled };
  }, [data]);

  const openCreateModal = useCallback(() => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: true, sort_order: 0 });
    setModalOpen(true);
  }, [form]);

  const openEditModal = useCallback((record: SubjectItem) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code || "",
      sort_order: record.sort_order,
      status: record.status === 1,
    });
    setModalOpen(true);
  }, [form]);

  const handleToggleStatus = useCallback((record: SubjectItem) => {
    const nextStatus = record.status === 1 ? 0 : 1;
    modal.confirm({
      title: nextStatus === 1 ? "确认启用" : "确认停用",
      content: `确定要${nextStatus === 1 ? "启用" : "停用"}科目「${record.name}」吗？`,
      okText: "确认",
      cancelText: "取消",
      async onOk() {
        try {
          const res = await SubjectsService.updateSubject(record.id, { status: nextStatus });
          if (res.code === 200) {
            message.success("状态已更新");
            await fetchSubjects();
          } else {
            message.error(res.message || "更新失败");
          }
        } catch (error: any) {
          message.error(error?.message || "更新失败");
        }
      },
    });
  }, [fetchSubjects, message, modal]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        name: values.name,
        code: values.code || null,
        sort_order: Number(values.sort_order) || 0,
        status: values.status ? 1 : 0,
      };
      const res = editing
        ? await SubjectsService.updateSubject(editing.id, payload)
        : await SubjectsService.createSubject(payload);

      if (res.code === 200 || res.code === 201) {
        message.success(editing ? "更新成功" : "创建成功");
        setModalOpen(false);
        await fetchSubjects();
      } else {
        message.error(res.message || "保存失败");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<SubjectItem> = useMemo(
    () => [
      {
        title: "科目名称",
        dataIndex: "name",
        render: (value: string) => <Text strong>{value}</Text>,
      },
      {
        title: "编码",
        dataIndex: "code",
        render: (value?: string) => value || "-",
      },
      {
        title: "排序",
        dataIndex: "sort_order",
        width: 80,
      },
      {
        title: "状态",
        dataIndex: "status",
        render: (value: number) => <StatusTag status={value} />,
        width: 100,
      },
      {
        title: "更新时间",
        dataIndex: "updated_at",
        width: 180,
      },
      {
        title: "操作",
        key: "actions",
        width: 120,
        align: "center",
        render: (_: unknown, record) => (
          <Space size={4}>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
            <Tooltip title={record.status === 1 ? "停用" : "启用"}>
              <Button
                type="text"
                size="small"
                icon={record.status === 1 ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                onClick={() => handleToggleStatus(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleToggleStatus, openEditModal]
  );

  return (
    <MainLayout>
      <PageHeader
        title="科目管理"
        subtitle="维护题库科目与状态，仅支持停用不删除。"
        extra={
          <Space>
            <Button onClick={() => fetchSubjects()}>刷新</Button>
            <Button type="primary" onClick={openCreateModal}>
              新增科目
            </Button>
          </Space>
        }
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <KpiTiles
          items={[
            {
              key: "total",
              title: "科目总数",
              value: summary.total,
              tone: "primary",
            },
            {
              key: "enabled",
              title: "启用",
              value: summary.enabled,
              tone: "success",
            },
            {
              key: "disabled",
              title: "停用",
              value: summary.disabled,
              tone: "neutral",
            },
          ]}
        />

        <AppCard title="科目列表">
          <Table
            rowKey="id"
            dataSource={data}
            columns={columns}
            loading={loading}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: 720 }}
            pagination={false}
          />
        </AppCard>
      </Space>

      <Modal
        open={modalOpen}
        title={editing ? "编辑科目" : "新增科目"}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={submitting}
        destroyOnClose
        okText="保存"
        cancelText="取消"
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="科目名称"
            name="name"
            rules={[{ required: true, message: "请输入科目名称" }]}
          >
            <Input placeholder="例如：高级项目管理" />
          </Form.Item>
          <Form.Item label="科目编码" name="code">
            <Input placeholder="可选，用于内部识别" />
          </Form.Item>
          <Form.Item label="排序" name="sort_order">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="启用状态" name="status" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default SubjectsPage;

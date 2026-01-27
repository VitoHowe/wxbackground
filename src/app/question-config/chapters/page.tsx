"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MainLayout, PageHeader } from "@/components";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  App,
  Switch,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, EditOutlined, PoweroffOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  SubjectsService,
  type SubjectItem,
  type SubjectChapterAliasItem,
  type SubjectChapterItem,
} from "@/services/subjects";

const { Text } = Typography;

const ChaptersPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<SubjectChapterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState<SubjectChapterItem | null>(null);
  const [form] = Form.useForm();
  const [aliasDrawerOpen, setAliasDrawerOpen] = useState(false);
  const [aliasLoading, setAliasLoading] = useState(false);
  const [aliasSubmitting, setAliasSubmitting] = useState(false);
  const [aliases, setAliases] = useState<SubjectChapterAliasItem[]>([]);
  const [aliasForm] = Form.useForm();
  const { message, modal } = App.useApp();

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await SubjectsService.listSubjects(true);
      if (res.code === 200) {
        setSubjects(res.data?.subjects || []);
      } else {
        message.error(res.message || "获取科目失败");
      }
    } catch (error: any) {
      message.error(error?.message || "获取科目失败");
    }
  }, [message]);

  const fetchChapters = useCallback(
    async (nextSubjectId?: number | null) => {
      const targetId = nextSubjectId ?? subjectId;
      if (!targetId) {
        setChapters([]);
        return;
      }
      setLoading(true);
      try {
        const res = await SubjectsService.listSubjectChapters(targetId, true);
        if (res.code === 200) {
          setChapters(res.data?.chapters || []);
        } else {
          message.error(res.message || "获取章节失败");
        }
      } catch (error: any) {
        message.error(error?.message || "获取章节失败");
      } finally {
        setLoading(false);
      }
    },
    [message, subjectId]
  );

  const fetchAliases = useCallback(
    async (nextSubjectId?: number | null) => {
      const targetId = nextSubjectId ?? subjectId;
      if (!targetId) {
        setAliases([]);
        return;
      }
      setAliasLoading(true);
      try {
        const res = await SubjectsService.listSubjectChapterAliases(targetId);
        if (res.code === 200) {
          setAliases(res.data?.aliases || []);
        } else {
          message.error(res.message || "获取章节别名失败");
        }
      } catch (error: any) {
        message.error(error?.message || "获取章节别名失败");
      } finally {
        setAliasLoading(false);
      }
    },
    [message, subjectId]
  );

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchChapters(subjectId);
  }, [fetchChapters, subjectId]);

  useEffect(() => {
    if (!aliasDrawerOpen) return;
    fetchAliases(subjectId);
  }, [aliasDrawerOpen, fetchAliases, subjectId]);

  const summary = useMemo(() => {
    const total = chapters.length;
    const enabled = chapters.filter((item) => item.status === 1).length;
    const disabled = total - enabled;
    const questions = chapters.reduce((acc, item) => acc + Number(item.question_count || 0), 0);
    return { total, enabled, disabled, questions };
  }, [chapters]);

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: true, chapter_order: 0 });
    setModalOpen(true);
  };

  const openEditModal = (record: SubjectChapterItem) => {
    setEditing(record);
    form.setFieldsValue({
      chapter_name: record.chapter_name,
      display_name: record.display_name || "",
      chapter_order: record.chapter_order,
      status: record.status === 1,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = (record: SubjectChapterItem) => {
    if (!subjectId) return;
    const nextStatus = record.status === 1 ? 0 : 1;
    modal.confirm({
      title: nextStatus === 1 ? "确认启用" : "确认停用",
      content: `确定要${nextStatus === 1 ? "启用" : "停用"}章节「${record.display_name || record.chapter_name}」吗？`,
      okText: "确认",
      cancelText: "取消",
      async onOk() {
        try {
          const res = await SubjectsService.updateSubjectChapter(subjectId, record.id, { status: nextStatus });
          if (res.code === 200) {
            message.success("状态已更新");
            await fetchChapters(subjectId);
          } else {
            message.error(res.message || "更新失败");
          }
        } catch (error: any) {
          message.error(error?.message || "更新失败");
        }
      },
    });
  };

  const handleSyncChapters = () => {
    if (!subjectId) {
      message.warning("请先选择科目");
      return;
    }
    modal.confirm({
      title: "同步章节",
      content: "将按题库章节名补齐科目章节并回填绑定关系，建议在导入异常时使用。",
      okText: "开始同步",
      cancelText: "取消",
      async onOk() {
        setSyncing(true);
        try {
          const res = await SubjectsService.syncSubjectChapters(subjectId);
          if (res.code === 200) {
            const summary = res.data;
            message.success(
              `同步完成：新增${summary?.createdChapters ?? 0}章，绑定${summary?.boundChapters ?? 0}章`
            );
            await fetchChapters(subjectId);
          } else {
            message.error(res.message || "同步失败");
          }
        } catch (error: any) {
          message.error(error?.message || "同步失败");
        } finally {
          setSyncing(false);
        }
      },
    });
  };

  const openAliasDrawer = async () => {
    if (!subjectId) {
      message.warning("请先选择科目");
      return;
    }
    aliasForm.resetFields();
    setAliasDrawerOpen(true);
    await fetchAliases(subjectId);
  };

  const handleCreateAlias = async () => {
    if (!subjectId) {
      message.warning("请先选择科目");
      return;
    }
    try {
      const values = await aliasForm.validateFields();
      setAliasSubmitting(true);
      const res = await SubjectsService.createSubjectChapterAlias(subjectId, {
        alias_name: values.alias_name,
        subject_chapter_id: Number(values.subject_chapter_id),
      });
      if (res.code === 200 || res.code === 201) {
        message.success("别名已添加");
        aliasForm.resetFields();
        await fetchAliases(subjectId);
      } else {
        message.error(res.message || "添加别名失败");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || "添加别名失败");
    } finally {
      setAliasSubmitting(false);
    }
  };

  const handleDeleteAlias = (record: SubjectChapterAliasItem) => {
    if (!subjectId) return;
    modal.confirm({
      title: "删除别名",
      content: `确认删除别名「${record.alias_name}」吗？`,
      okText: "删除",
      cancelText: "取消",
      async onOk() {
        try {
          const res = await SubjectsService.deleteSubjectChapterAlias(subjectId, record.id);
          if (res.code === 200) {
            message.success("别名已删除");
            await fetchAliases(subjectId);
          } else {
            message.error(res.message || "删除失败");
          }
        } catch (error: any) {
          message.error(error?.message || "删除失败");
        }
      },
    });
  };

  const onSubmit = async () => {
    if (!subjectId) {
      message.warning("请先选择科目");
      return;
    }
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        chapter_name: values.chapter_name,
        display_name: values.display_name || null,
        chapter_order: Number(values.chapter_order) || 0,
        status: values.status ? 1 : 0,
      };
      const res = editing
        ? await SubjectsService.updateSubjectChapter(subjectId, editing.id, payload)
        : await SubjectsService.createSubjectChapter(subjectId, payload);

      if (res.code === 200 || res.code === 201) {
        message.success(editing ? "更新成功" : "创建成功");
        setModalOpen(false);
        await fetchChapters(subjectId);
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

  const columns: ColumnsType<SubjectChapterItem> = useMemo(
    () => [
      {
        title: "章节基准名",
        dataIndex: "chapter_name",
        render: (value: string) => <Text>{value}</Text>,
      },
      {
        title: "展示名称",
        dataIndex: "display_name",
        render: (value: string, record) => value || record.chapter_name,
      },
      {
        title: "排序",
        dataIndex: "chapter_order",
        width: 80,
      },
      {
        title: "题量",
        dataIndex: "question_count",
        width: 100,
        render: (value: number) => value ?? 0,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 100,
        render: (value: number) => (
          <Tag color={value === 1 ? "green" : "default"}>
            {value === 1 ? "启用" : "停用"}
          </Tag>
        ),
      },
      {
        title: "操作",
        key: "actions",
        width: 140,
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
    [handleToggleStatus]
  );

  const aliasColumns: ColumnsType<SubjectChapterAliasItem> = useMemo(
    () => [
      {
        title: "别名",
        dataIndex: "alias_name",
      },
      {
        title: "归属章节",
        dataIndex: "chapter_name",
        render: (_: string, record) => record.display_name || record.chapter_name,
      },
      {
        title: "排序",
        dataIndex: "chapter_order",
        width: 80,
      },
      {
        title: "操作",
        key: "actions",
        width: 100,
        align: "center",
        render: (_: unknown, record) => (
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAlias(record)}
            />
          </Tooltip>
        ),
      },
    ],
    [handleDeleteAlias]
  );

  return (
    <MainLayout>
      <PageHeader title="章节管理" subtitle="以科目为维度维护章节基准名与展示名。" />
      <Card>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space wrap>
              <Select
                style={{ minWidth: 240 }}
                placeholder="选择科目"
                value={subjectId ?? undefined}
                onChange={(value) => setSubjectId(value)}
                options={subjects.map((s) => ({
                  label: `${s.name}${s.status === 1 ? "" : "（已停用）"}`,
                  value: s.id,
                }))}
              />
              <Button type="primary" onClick={openCreateModal} disabled={!subjectId}>
                新增章节
              </Button>
              <Button onClick={handleSyncChapters} loading={syncing} disabled={!subjectId}>
                同步章节
              </Button>
              <Button onClick={openAliasDrawer} disabled={!subjectId}>
                别名映射
              </Button>
            </Space>
          </Col>
          <Col>
            <Space size="large" wrap>
              <Statistic title="章节总数" value={summary.total} />
              <Statistic title="启用" value={summary.enabled} />
              <Statistic title="停用" value={summary.disabled} />
              <Statistic title="题目总数" value={summary.questions} />
            </Space>
          </Col>
        </Row>

        <Table
          rowKey="id"
          dataSource={chapters}
          columns={columns}
          loading={loading}
          pagination={false}
          size="middle"
          tableLayout="fixed"
          scroll={{ x: 960 }}
          locale={{ emptyText: subjectId ? "暂无章节" : "请先选择科目" }}
        />
      </Card>

      <Drawer
        title="章节别名映射"
        open={aliasDrawerOpen}
        onClose={() => setAliasDrawerOpen(false)}
        width={520}
        destroyOnClose
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Form form={aliasForm} layout="vertical">
            <Form.Item
              label="章节别名"
              name="alias_name"
              rules={[{ required: true, message: "请输入章节别名" }]}
            >
              <Input placeholder="例如：第一章 信息化发展" />
            </Form.Item>
            <Form.Item
              label="归属章节"
              name="subject_chapter_id"
              rules={[{ required: true, message: "请选择归属章节" }]}
            >
              <Select
                placeholder="选择科目章节"
                options={chapters.map((item) => ({
                  label: `${item.display_name || item.chapter_name}${item.status === 1 ? "" : "（已停用）"}`,
                  value: item.id,
                }))}
              />
            </Form.Item>
            <Space>
              <Button type="primary" onClick={handleCreateAlias} loading={aliasSubmitting}>
                添加映射
              </Button>
              <Button onClick={() => aliasForm.resetFields()}>重置</Button>
            </Space>
          </Form>

          <Table
            rowKey="id"
            dataSource={aliases}
            columns={aliasColumns}
            loading={aliasLoading}
            pagination={false}
            size="small"
            tableLayout="fixed"
            locale={{ emptyText: "暂无别名映射" }}
          />
        </Space>
      </Drawer>

      <Modal
        open={modalOpen}
        title={editing ? "编辑章节" : "新增章节"}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="章节基准名"
            name="chapter_name"
            rules={[{ required: true, message: "请输入章节基准名" }]}
          >
            <Input placeholder="例如：第一章 项目启动" />
          </Form.Item>
          <Form.Item label="展示名称" name="display_name">
            <Input placeholder="可选，给前端展示的名称" />
          </Form.Item>
          <Form.Item label="排序" name="chapter_order">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item label="启用状态" name="status" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default ChaptersPage;

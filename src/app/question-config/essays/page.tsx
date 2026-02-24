"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppCard, KpiTiles, MainLayout, PageHeader } from "@/components";
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PoweroffOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { SubjectsService, type SubjectChapterItem, type SubjectItem } from "@/services/subjects";
import {
  EssayAdminService,
  type AdminEssayItem,
  type EssayOrgItem,
} from "@/services/essayAdmin";

const { Search } = Input;
const { Text } = Typography;

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const statusTag = (status: number) => (
  <Tag color={status === 1 ? "success" : "default"} bordered={false} style={{ marginInlineEnd: 0 }}>
    {status === 1 ? "启用" : "停用"}
  </Tag>
);

const EssaysPage: React.FC = () => {
  const { message, modal } = App.useApp();

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [orgs, setOrgs] = useState<EssayOrgItem[]>([]);
  const [chapters, setChapters] = useState<SubjectChapterItem[]>([]);

  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");

  const [essays, setEssays] = useState<AdminEssayItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgSubmitting, setOrgSubmitting] = useState(false);
  const [editingOrg, setEditingOrg] = useState<EssayOrgItem | null>(null);
  const [orgForm] = Form.useForm();

  const [essayModalOpen, setEssayModalOpen] = useState(false);
  const [essaySubmitting, setEssaySubmitting] = useState(false);
  const [editingEssay, setEditingEssay] = useState<AdminEssayItem | null>(null);
  const [essayFileList, setEssayFileList] = useState<UploadFile[]>([]);
  const [essayForm] = Form.useForm();
  const [essayModalSubjectId, setEssayModalSubjectId] = useState<number | null>(null);
  const [essayModalChapters, setEssayModalChapters] = useState<SubjectChapterItem[]>([]);

  const summary = useMemo(() => {
    const enabled = essays.filter((item) => item.status === 1).length;
    const disabled = essays.length - enabled;
    return {
      total,
      enabled,
      disabled,
      orgCount: orgs.length,
    };
  }, [essays, orgs.length, total]);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await SubjectsService.listSubjects(true);
      if (res.code === 200) {
        setSubjects(res.data?.subjects || []);
      } else {
        message.error(res.message || "获取科目失败");
      }
    } catch (error) {
      message.error(parseError(error, "获取科目失败"));
    }
  }, [message]);

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await EssayAdminService.listEssayOrgs(true);
      if (res.code === 200) {
        setOrgs(res.data?.orgs || []);
      } else {
        message.error(res.message || "获取机构失败");
      }
    } catch (error) {
      message.error(parseError(error, "获取机构失败"));
    }
  }, [message]);

  const fetchChapters = useCallback(
    async (targetSubjectId: number | null, forModal = false) => {
      if (!targetSubjectId) {
        if (forModal) {
          setEssayModalChapters([]);
        } else {
          setChapters([]);
        }
        return;
      }
      try {
        const res = await SubjectsService.listSubjectChapters(targetSubjectId, true);
        if (res.code === 200) {
          const list = res.data?.chapters || [];
          if (forModal) {
            setEssayModalChapters(list);
          } else {
            setChapters(list);
          }
        } else {
          message.error(res.message || "获取章节失败");
        }
      } catch (error) {
        message.error(parseError(error, "获取章节失败"));
      }
    },
    [message]
  );

  const fetchEssays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await EssayAdminService.listEssays({
        page,
        limit: pageSize,
        subjectId: subjectId ?? undefined,
        orgId: orgId ?? undefined,
        subjectChapterId: chapterId ?? undefined,
        status: status ?? undefined,
        keyword: keyword || undefined,
      });
      if (res.code === 200) {
        setEssays(res.data?.list || []);
        setTotal(Number(res.data?.total || 0));
      } else {
        message.error(res.message || "获取论文失败");
      }
    } catch (error) {
      message.error(parseError(error, "获取论文失败"));
    } finally {
      setLoading(false);
    }
  }, [chapterId, keyword, message, orgId, page, pageSize, status, subjectId]);

  useEffect(() => {
    fetchSubjects();
    fetchOrgs();
  }, [fetchOrgs, fetchSubjects]);

  useEffect(() => {
    fetchChapters(subjectId);
  }, [fetchChapters, subjectId]);

  useEffect(() => {
    fetchEssays();
  }, [fetchEssays]);

  const openCreateOrgModal = () => {
    setEditingOrg(null);
    orgForm.resetFields();
    orgForm.setFieldsValue({ status: true, sort_order: 0 });
    setOrgModalOpen(true);
  };

  const openEditOrgModal = (record: EssayOrgItem) => {
    setEditingOrg(record);
    orgForm.setFieldsValue({
      name: record.name,
      description: record.description || "",
      status: record.status === 1,
      sort_order: record.sort_order,
    });
    setOrgModalOpen(true);
  };

  const onSubmitOrg = async () => {
    try {
      const values = await orgForm.validateFields();
      setOrgSubmitting(true);
      const payload = {
        name: values.name,
        description: values.description || null,
        status: values.status ? 1 : 0,
        sort_order: Number(values.sort_order) || 0,
      };

      const res = editingOrg
        ? await EssayAdminService.updateEssayOrg(editingOrg.id, payload)
        : await EssayAdminService.createEssayOrg(payload);

      if (res.code === 200 || res.code === 201) {
        message.success(editingOrg ? "机构更新成功" : "机构创建成功");
        setOrgModalOpen(false);
        await fetchOrgs();
      } else {
        message.error(res.message || "保存机构失败");
      }
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) return;
      message.error(parseError(error, "保存机构失败"));
    } finally {
      setOrgSubmitting(false);
    }
  };

  const handleDeleteOrg = (record: EssayOrgItem) => {
    modal.confirm({
      title: "删除机构",
      content: `确定删除机构「${record.name}」吗？`,
      okText: "删除",
      cancelText: "取消",
      async onOk() {
        try {
          const res = await EssayAdminService.deleteEssayOrg(record.id);
          if (res.code === 200) {
            message.success("机构已删除");
            await fetchOrgs();
            await fetchEssays();
          } else {
            message.error(res.message || "删除机构失败");
          }
        } catch (error) {
          message.error(parseError(error, "删除机构失败"));
        }
      },
    });
  };

  const openCreateEssayModal = () => {
    setEditingEssay(null);
    setEssayFileList([]);
    essayForm.resetFields();
    const nextSubjectId = subjectId ?? null;
    setEssayModalSubjectId(nextSubjectId);
    if (nextSubjectId) {
      fetchChapters(nextSubjectId, true);
    } else {
      setEssayModalChapters([]);
    }
    essayForm.setFieldsValue({
      status: true,
      subjectId: nextSubjectId ?? undefined,
      orgId: orgId ?? undefined,
      subjectChapterId: chapterId ?? undefined,
    });
    setEssayModalOpen(true);
  };

  const openEditEssayModal = (record: AdminEssayItem) => {
    setEditingEssay(record);
    setEssayFileList([]);
    setEssayModalSubjectId(record.subject_id);
    fetchChapters(record.subject_id, true);
    essayForm.resetFields();
    essayForm.setFieldsValue({
      title: record.title,
      orgId: record.org_id,
      subjectId: record.subject_id,
      subjectChapterId: record.subject_chapter_id,
      status: record.status === 1,
    });
    setEssayModalOpen(true);
  };

  const onEssaySubjectChange = (value: number) => {
    setEssayModalSubjectId(value);
    essayForm.setFieldValue("subjectChapterId", undefined);
    fetchChapters(value, true);
  };

  const onSubmitEssay = async () => {
    try {
      const values = await essayForm.validateFields();
      const file = (essayFileList[0] as UploadFile & { originFileObj?: File })?.originFileObj;
      if (!editingEssay && !file) {
        message.warning("请上传 Markdown 文件");
        return;
      }

      setEssaySubmitting(true);
      const payload = {
        title: values.title,
        orgId: Number(values.orgId),
        subjectId: Number(values.subjectId),
        subjectChapterId: Number(values.subjectChapterId),
        status: values.status ? 1 : 0,
      };

      const res = editingEssay
        ? await EssayAdminService.updateEssay(editingEssay.id, {
            ...payload,
            file,
          })
        : await EssayAdminService.createEssay(file as File, payload);

      if (res.code === 200 || res.code === 201) {
        message.success(editingEssay ? "论文更新成功" : "论文创建成功");
        setEssayModalOpen(false);
        setEssayFileList([]);
        await fetchEssays();
      } else {
        message.error(res.message || "保存论文失败");
      }
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) return;
      message.error(parseError(error, "保存论文失败"));
    } finally {
      setEssaySubmitting(false);
    }
  };

  const handleDeleteEssay = (record: AdminEssayItem) => {
    modal.confirm({
      title: "删除论文",
      content: `确定删除论文「${record.title}」吗？该操作不可恢复。`,
      okText: "删除",
      cancelText: "取消",
      async onOk() {
        try {
          const res = await EssayAdminService.deleteEssay(record.id);
          if (res.code === 200) {
            message.success("论文已删除");
            await fetchEssays();
          } else {
            message.error(res.message || "删除论文失败");
          }
        } catch (error) {
          message.error(parseError(error, "删除论文失败"));
        }
      },
    });
  };

  const resetFilters = () => {
    setSubjectId(null);
    setOrgId(null);
    setChapterId(null);
    setStatus(null);
    setKeyword("");
    setPage(1);
  };

  const orgColumns: ColumnsType<EssayOrgItem> = useMemo(
    () => [
      {
        title: "机构名称",
        dataIndex: "name",
        render: (value: string) => <Text strong>{value}</Text>,
      },
      {
        title: "描述",
        dataIndex: "description",
        render: (value?: string | null) => value || "-",
      },
      {
        title: "论文数",
        dataIndex: "essay_count",
        width: 90,
        align: "center",
        render: (value: number) => Number(value || 0),
      },
      {
        title: "排序",
        dataIndex: "sort_order",
        width: 80,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 90,
        render: (value: number) => statusTag(value),
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
                onClick={() => openEditOrgModal(record)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteOrg(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    []
  );

  const essayColumns: ColumnsType<AdminEssayItem> = useMemo(
    () => [
      {
        title: "标题",
        dataIndex: "title",
        render: (value: string) => <Text strong>{value}</Text>,
      },
      {
        title: "机构",
        dataIndex: "org_name",
        width: 140,
        render: (value?: string) => value || "-",
      },
      {
        title: "科目/章节",
        key: "subject",
        width: 220,
        render: (_: unknown, record) => (
          <Space direction="vertical" size={0}>
            <Text>{record.subject_name || `科目#${record.subject_id}`}</Text>
            <Text type="secondary">{record.subject_chapter_name || `章节#${record.subject_chapter_id}`}</Text>
          </Space>
        ),
      },
      {
        title: "文件大小",
        dataIndex: "file_size",
        width: 100,
        align: "right",
        render: (value?: number | null) => {
          if (!value) return "-";
          if (value < 1024) return `${value} B`;
          if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
          return `${(value / (1024 * 1024)).toFixed(2)} MB`;
        },
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 90,
        render: (value: number) => statusTag(value),
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
                onClick={() => openEditEssayModal(record)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteEssay(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <MainLayout>
      <PageHeader
        title="论文管理"
        subtitle="按机构、科目、章节维护论文，并上传 Markdown 原文。"
        extra={
          <Space>
            <Button onClick={() => fetchEssays()}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateEssayModal}>
              新增论文
            </Button>
          </Space>
        }
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <KpiTiles
          items={[
            { key: "total", title: "论文总数", value: summary.total, tone: "primary" },
            { key: "enabled", title: "当前页启用", value: summary.enabled, tone: "success" },
            { key: "disabled", title: "当前页停用", value: summary.disabled, tone: "neutral" },
            { key: "org", title: "机构数", value: summary.orgCount, tone: "accent" },
          ]}
        />

        <AppCard title="机构管理" extra={<Button onClick={openCreateOrgModal}>新增机构</Button>}>
          <Table
            rowKey="id"
            dataSource={orgs}
            columns={orgColumns}
            size="middle"
            tableLayout="fixed"
            pagination={false}
            scroll={{ x: 820 }}
            locale={{ emptyText: "暂无机构" }}
          />
        </AppCard>

        <AppCard title="论文筛选">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space wrap>
              <Select
                allowClear
                style={{ minWidth: 220 }}
                placeholder="按科目筛选"
                value={subjectId ?? undefined}
                onChange={(value) => {
                  setSubjectId(value ?? null);
                  setChapterId(null);
                  setPage(1);
                }}
                options={subjects.map((item) => ({
                  label: `${item.name}${item.status === 1 ? "" : "（已停用）"}`,
                  value: item.id,
                }))}
              />
              <Select
                allowClear
                style={{ minWidth: 220 }}
                placeholder="按章节筛选"
                value={chapterId ?? undefined}
                onChange={(value) => {
                  setChapterId(value ?? null);
                  setPage(1);
                }}
                options={chapters.map((item) => ({
                  label: item.display_name || item.chapter_name,
                  value: item.id,
                }))}
              />
              <Select
                allowClear
                style={{ minWidth: 200 }}
                placeholder="按机构筛选"
                value={orgId ?? undefined}
                onChange={(value) => {
                  setOrgId(value ?? null);
                  setPage(1);
                }}
                options={orgs.map((item) => ({
                  label: `${item.name}${item.status === 1 ? "" : "（已停用）"}`,
                  value: item.id,
                }))}
              />
              <Select
                allowClear
                style={{ width: 140 }}
                placeholder="状态"
                value={status ?? undefined}
                onChange={(value) => {
                  setStatus(value ?? null);
                  setPage(1);
                }}
                options={[
                  { label: "启用", value: 1 },
                  { label: "停用", value: 0 },
                ]}
              />
              <Search
                allowClear
                placeholder="按论文标题搜索"
                style={{ width: 260 }}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onSearch={() => {
                  setPage(1);
                  fetchEssays();
                }}
              />
            </Space>

            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setPage(1);
                  fetchEssays();
                }}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  resetFilters();
                  setTimeout(() => fetchEssays(), 0);
                }}
              >
                重置
              </Button>
            </Space>
          </Space>
        </AppCard>

        <AppCard title="论文列表">
          <Table
            rowKey="id"
            dataSource={essays}
            columns={essayColumns}
            loading={loading}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: 1200 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (nextPage, nextPageSize) => {
                if (nextPageSize !== pageSize) {
                  setPageSize(nextPageSize);
                  setPage(1);
                } else {
                  setPage(nextPage);
                }
              },
            }}
            locale={{ emptyText: "暂无论文" }}
          />
        </AppCard>
      </Space>

      <Modal
        open={orgModalOpen}
        title={editingOrg ? "编辑机构" : "新增机构"}
        onCancel={() => setOrgModalOpen(false)}
        onOk={onSubmitOrg}
        confirmLoading={orgSubmitting}
        destroyOnClose
        okText="保存"
        cancelText="取消"
        maskClosable={false}
      >
        <Form form={orgForm} layout="vertical">
          <Form.Item label="机构名称" name="name" rules={[{ required: true, message: "请输入机构名称" }]}>
            <Input placeholder="例如：XX 培训机构" maxLength={120} />
          </Form.Item>
          <Form.Item label="机构描述" name="description">
            <Input.TextArea rows={3} placeholder="可选" maxLength={1000} showCount />
          </Form.Item>
          <Form.Item label="排序" name="sort_order">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="启用状态" name="status" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={essayModalOpen}
        title={editingEssay ? "编辑论文" : "新增论文"}
        onCancel={() => setEssayModalOpen(false)}
        onOk={onSubmitEssay}
        confirmLoading={essaySubmitting}
        destroyOnClose
        okText="保存"
        cancelText="取消"
        maskClosable={false}
      >
        <Form form={essayForm} layout="vertical">
          <Form.Item label="论文标题" name="title" rules={[{ required: true, message: "请输入论文标题" }]}>
            <Input placeholder="例如：项目干系人管理论文" maxLength={255} />
          </Form.Item>
          <Form.Item label="所属机构" name="orgId" rules={[{ required: true, message: "请选择机构" }]}>
            <Select
              placeholder="请选择机构"
              options={orgs.map((item) => ({
                label: `${item.name}${item.status === 1 ? "" : "（已停用）"}`,
                value: item.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="所属科目" name="subjectId" rules={[{ required: true, message: "请选择科目" }]}>
            <Select
              placeholder="请选择科目"
              onChange={onEssaySubjectChange}
              options={subjects.map((item) => ({
                label: `${item.name}${item.status === 1 ? "" : "（已停用）"}`,
                value: item.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="绑定章节"
            name="subjectChapterId"
            rules={[{ required: true, message: "请选择章节" }]}
          >
            <Select
              placeholder={essayModalSubjectId ? "请选择章节" : "请先选择科目"}
              disabled={!essayModalSubjectId}
              options={essayModalChapters.map((item) => ({
                label: item.display_name || item.chapter_name,
                value: item.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="Markdown 文件" required={!editingEssay}>
            <Upload
              accept=".md,text/markdown,text/plain"
              beforeUpload={() => false}
              fileList={essayFileList}
              maxCount={1}
              onChange={({ fileList }) => setEssayFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>选择 .md 文件</Button>
            </Upload>
            <Text type="secondary">
              {editingEssay
                ? "不上传新文件则保留原文"
                : "仅支持 Markdown 文件，大小不超过 20MB"}
            </Text>
          </Form.Item>
          <Form.Item label="启用状态" name="status" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default EssaysPage;

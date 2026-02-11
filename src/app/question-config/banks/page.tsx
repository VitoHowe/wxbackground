"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppCard, KpiTiles, MainLayout, PageHeader } from "@/components";
import {
  App,
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Tooltip,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BarsOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import {
  QuestionBanksAdminService,
  type AdminQuestionBankItem,
  type BankChapterItem,
} from "@/services/questionBanksAdmin";
import { SubjectsService, type SubjectItem, type SubjectChapterItem } from "@/services/subjects";
import styles from "./page.module.css";

const { Text } = Typography;
const { Dragger } = Upload;

type ImportMode = "full" | "chapter";

const resolvePopupContainer = (triggerNode: HTMLElement): HTMLElement => {
  return (
    (triggerNode.closest(".ant-drawer-body") as HTMLElement | null) ||
    (triggerNode.closest(".ant-modal-body") as HTMLElement | null) ||
    triggerNode.parentElement ||
    document.body
  );
};

const BanksPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<SubjectChapterItem[]>([]);
  const [banks, setBanks] = useState<AdminQuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [importMode, setImportMode] = useState<ImportMode>("full");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chapterStats, setChapterStats] = useState<BankChapterItem[]>([]);
  const [currentBank, setCurrentBank] = useState<AdminQuestionBankItem | null>(null);
  const [deletingChapterId, setDeletingChapterId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await SubjectsService.listSubjects(true);
      if (res.code === 200) {
        setSubjects(res.data?.subjects || []);
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
      try {
        const res = await SubjectsService.listSubjectChapters(targetId, true);
        if (res.code === 200) {
          setChapters(res.data?.chapters || []);
        }
      } catch (error: any) {
        message.error(error?.message || "获取章节失败");
      }
    },
    [message, subjectId]
  );

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await QuestionBanksAdminService.listQuestionBanks({
        page,
        limit,
        subjectId: subjectId ?? undefined,
      });
      if (res.code === 200) {
        setBanks(res.data?.list || []);
        setTotal(res.data?.total || 0);
      } else {
        message.error(res.message || "获取题库失败");
      }
    } catch (error: any) {
      message.error(error?.message || "获取题库失败");
    } finally {
      setLoading(false);
    }
  }, [limit, message, page, subjectId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchChapters(subjectId);
    fetchBanks();
  }, [fetchChapters, fetchBanks, subjectId]);

  const summary = useMemo(() => {
    const totalBanks = total || banks.length;
    const pageQuestions = banks.reduce((acc, item) => acc + (item.total_questions || 0), 0);
    const pageChapters = banks.reduce((acc, item) => acc + (item.chapter_count || 0), 0);
    const completed = banks.filter((item) => item.parse_status === "completed").length;
    const failed = banks.filter((item) => item.parse_status === "failed").length;
    return { totalBanks, pageQuestions, pageChapters, completed, failed };
  }, [banks, total]);

  const draggerProps: UploadProps = {
    name: "file",
    maxCount: 1,
    multiple: false,
    accept: ".json",
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    onRemove: () => {
      setFile(null);
    },
  };

  const handleImport = async () => {
    try {
      const values = await form.validateFields();
      if (!file) {
        message.error("请先选择JSON文件");
        return;
      }
      setImporting(true);

      if (importMode === "full") {
        const res = await QuestionBanksAdminService.importBankJson(file, {
          subjectId: Number(values.subjectId),
          name: values.name,
          description: values.description,
        });
        if (res.code === 200) {
          message.success("题库导入成功");
          form.resetFields();
          setFile(null);
          await fetchBanks();
          return;
        }
        message.error(res.message || "题库导入失败");
      } else {
        const res = await QuestionBanksAdminService.importChapterJson(file, {
          bankId: Number(values.bankId),
          subjectChapterId: Number(values.subjectChapterId),
        });
        if (res.code === 200) {
          message.success("章节导入成功");
          form.resetFields(["subjectChapterId"]);
          setFile(null);
          await fetchBanks();
          return;
        }
        message.error(res.message || "章节导入失败");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || "导入失败");
    } finally {
      setImporting(false);
    }
  };

  const openChapterStats = async (record: AdminQuestionBankItem) => {
    setCurrentBank(record);
    try {
      const res = await QuestionBanksAdminService.getBankChapters(record.id);
      if (res.code === 200) {
        setChapterStats(res.data?.chapters || []);
        setDrawerOpen(true);
      } else {
        message.error(res.message || "获取章节题量失败");
      }
    } catch (error: any) {
      message.error(error?.message || "获取章节题量失败");
    }
  };

  const handleDeleteChapter = async (chapter: BankChapterItem) => {
    if (!currentBank) return;
    setDeletingChapterId(chapter.id);
    try {
      const res = await QuestionBanksAdminService.deleteBankChapter(currentBank.id, chapter.id);
      if (res.code === 200) {
        message.success("章节已删除");
        await fetchBanks();
        const refreshed = await QuestionBanksAdminService.getBankChapters(currentBank.id);
        if (refreshed.code === 200) {
          setChapterStats(refreshed.data?.chapters || []);
        }
        return;
      }
      message.error(res.message || "删除章节失败");
    } catch (error: any) {
      message.error(error?.message || "删除章节失败");
    } finally {
      setDeletingChapterId(null);
    }
  };

  const columns: ColumnsType<AdminQuestionBankItem> = useMemo(
    () => [
      {
        title: "题库名称",
        dataIndex: "name",
        render: (value: string) => <Text strong>{value}</Text>,
      },
      {
        title: "绑定科目",
        dataIndex: "subject_name",
        render: (value: string) => value || "-",
      },
      {
        title: "题量",
        dataIndex: "total_questions",
        width: 90,
        align: "right",
        render: (value: number) => <Tag color="blue">{value ?? 0}</Tag>,
      },
      {
        title: "章节数",
        dataIndex: "chapter_count",
        width: 90,
        align: "right",
        render: (value: number) => <Tag color="purple">{value ?? 0}</Tag>,
      },
      {
        title: "状态",
        dataIndex: "parse_status",
        width: 100,
        render: (value: string) => (
          <Tag color={value === "completed" ? "green" : value === "failed" ? "red" : "default"}>
            {value === "completed" ? "已完成" : value === "failed" ? "失败" : value}
          </Tag>
        ),
      },
      {
        title: "操作",
        key: "actions",
        width: 120,
        align: "center",
        render: (_, record) => (
          <Tooltip title="章节题量">
            <Button
              type="text"
              size="small"
              icon={<BarsOutlined />}
              onClick={() => openChapterStats(record)}
            />
          </Tooltip>
        ),
      },
    ],
    []
  );

  const filteredBanks = useMemo(() => {
    if (!subjectId) return banks;
    return banks.filter((bank) => bank.subject_id === subjectId);
  }, [banks, subjectId]);

  return (
    <MainLayout>
      <PageHeader title="题库管理" subtitle="新建题库并绑定科目，支持整库或章节级 JSON 导入。" />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <KpiTiles
          items={[
            {
              key: "banks",
              title: "题库总数",
              value: summary.totalBanks,
              tone: "primary",
            },
            {
              key: "questions",
              title: "本页题量",
              value: summary.pageQuestions,
              tone: "accent",
            },
            {
              key: "chapters",
              title: "本页章节",
              value: summary.pageChapters,
              tone: "success",
            },
            {
              key: "status",
              title: "完成/失败（本页）",
              value: `${summary.completed}/${summary.failed}`,
              tone: "neutral",
            },
          ]}
        />

        <Row gutter={[12, 12]}>
          <Col xs={24} xl={14}>
            <AppCard
              title="题库列表"
              extra={<Button onClick={() => fetchBanks()}>刷新</Button>}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Space wrap>
                  <Select
                    placeholder="筛选科目"
                    style={{ minWidth: 240 }}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    getPopupContainer={resolvePopupContainer}
                    value={subjectId ?? undefined}
                    onChange={(value) => {
                      setSubjectId(value ?? null);
                      setPage(1);
                      form.setFieldsValue({
                        subjectId: value ?? undefined,
                        bankId: undefined,
                        subjectChapterId: undefined,
                      });
                    }}
                    options={subjects.map((s) => ({
                      label: `${s.name}${s.status === 1 ? "" : "（已停用）"}`,
                      value: s.id,
                    }))}
                  />
                </Space>

                <Divider style={{ margin: 0 }} />

                <Table
                  rowKey="id"
                  dataSource={banks}
                  columns={columns}
                  loading={loading}
                  size="middle"
                  tableLayout="fixed"
                  scroll={{ x: 960 }}
                  pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    onChange: (nextPage, nextSize) => {
                      setPage(nextPage);
                      setLimit(nextSize || limit);
                    },
                  }}
                />
              </Space>
            </AppCard>
          </Col>

          <Col xs={24} xl={10}>
            <AppCard title="JSON 导入" extra={<Tag bordered={false}>.json</Tag>}>
              <Form form={form} layout="vertical">
                <Form.Item label="导入方式" name="importMode" initialValue="full">
                  <Radio.Group
                    onChange={(e) => {
                      setImportMode(e.target.value);
                      setFile(null);
                      form.resetFields(["bankId", "subjectChapterId"]);
                    }}
                  >
                    <Radio.Button value="full">整库导入</Radio.Button>
                    <Radio.Button value="chapter">章节导入</Radio.Button>
                  </Radio.Group>
                </Form.Item>

              <Form.Item
                label="绑定科目"
                name="subjectId"
                rules={[{ required: true, message: "请选择科目" }]}
              >
                <Select
                  placeholder="选择科目"
                  showSearch
                  optionFilterProp="label"
                  getPopupContainer={resolvePopupContainer}
                  options={subjects.map((s) => ({
                    label: `${s.name}${s.status === 1 ? "" : "（已停用）"}`,
                    value: s.id,
                  }))}
                  onChange={(value) => {
                    setSubjectId(value);
                    fetchChapters(value);
                  }}
                />
              </Form.Item>

              {importMode === "full" && (
                <>
                  <Form.Item label="题库名称" name="name">
                    <Input placeholder="可选，留空将使用文件名" />
                  </Form.Item>
                  <Form.Item label="题库描述" name="description">
                    <Input.TextArea rows={3} placeholder="可选" />
                  </Form.Item>
                </>
              )}

              {importMode === "chapter" && (
                <>
                  <Form.Item
                    label="选择题库"
                    name="bankId"
                    rules={[{ required: true, message: "请选择题库" }]}
                  >
                    <Select
                      placeholder="选择已绑定科目的题库"
                      showSearch
                      optionFilterProp="label"
                      getPopupContainer={resolvePopupContainer}
                      options={filteredBanks.map((bank) => ({
                        label: bank.name,
                        value: bank.id,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    label="选择章节"
                    name="subjectChapterId"
                    rules={[{ required: true, message: "请选择章节" }]}
                  >
                    <Select
                      placeholder="选择科目章节"
                      showSearch
                      optionFilterProp="label"
                      getPopupContainer={resolvePopupContainer}
                      options={chapters.map((chapter) => ({
                        label: chapter.display_name || chapter.chapter_name,
                        value: chapter.id,
                      }))}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item label="上传 JSON 文件" required>
                <Dragger {...draggerProps} className={styles.dragger}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽 JSON 文件到此处</p>
                  <p className={styles.hint}>请使用与 Gemini 题库一致的 JSON 结构</p>
                </Dragger>
                {file && (
                  <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
                    已选择: {file.name}
                  </Text>
                )}
              </Form.Item>

              <Space>
                <Button type="primary" loading={importing} onClick={handleImport}>
                  开始导入
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
          </Col>
        </Row>
      </Space>

      <Drawer
        title={currentBank ? `章节题量 · ${currentBank.name}` : "章节题量"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        <Table
          rowKey="id"
          dataSource={chapterStats}
          pagination={false}
          size="small"
          tableLayout="fixed"
          columns={[
            {
              title: "章节",
              dataIndex: "chapter_name",
              render: (_: string, record: BankChapterItem) => record.chapter_name,
            },
            {
              title: "题量",
              dataIndex: "question_count",
              width: 90,
            },
            {
              title: "对应科目章节",
              dataIndex: "subject_display_name",
              width: 140,
              render: (_: string, record: BankChapterItem) =>
                record.subject_display_name || record.subject_chapter_name || "-",
            },
            {
              title: "操作",
              key: "actions",
              width: 80,
              align: "center",
              render: (_: unknown, record: BankChapterItem) => (
                <Popconfirm
                  title="确定删除该章节吗？"
                  description="该章节下的题目会一起删除"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={() => handleDeleteChapter(record)}
                >
                  <Button
                    danger
                    size="small"
                    type="text"
                    icon={<DeleteOutlined />}
                    loading={deletingChapterId === record.id}
                  />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Drawer>
    </MainLayout>
  );
};

export default BanksPage;

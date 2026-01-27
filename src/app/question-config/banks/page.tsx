"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MainLayout, PageHeader } from "@/components";
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Tooltip,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BarsOutlined, InboxOutlined } from "@ant-design/icons";
import {
  QuestionBanksAdminService,
  type AdminQuestionBankItem,
  type BankChapterItem,
} from "@/services/questionBanksAdmin";
import { SubjectsService, type SubjectItem, type SubjectChapterItem } from "@/services/subjects";

const { Text } = Typography;
const { Dragger } = Upload;

type ImportMode = "full" | "chapter";

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
    const totalBanks = banks.length;
    const totalQuestions = banks.reduce((acc, item) => acc + (item.total_questions || 0), 0);
    const totalChapters = banks.reduce((acc, item) => acc + (item.chapter_count || 0), 0);
    const completed = banks.filter((item) => item.parse_status === "completed").length;
    const failed = banks.filter((item) => item.parse_status === "failed").length;
    return { totalBanks, totalQuestions, totalChapters, completed, failed };
  }, [banks]);

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
      <Row gutter={16}>
        <Col xs={24} xl={14}>
          <Card title="题库列表">
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space wrap>
                  <Select
                    placeholder="筛选科目"
                    style={{ minWidth: 220 }}
                    allowClear
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
                  <Button onClick={() => fetchBanks()}>刷新</Button>
                </Space>
              </Col>
              <Col>
                <Space size="large" wrap>
                  <Statistic title="题库数" value={summary.totalBanks} />
                  <Statistic title="题目总量" value={summary.totalQuestions} />
                  <Statistic title="章节总量" value={summary.totalChapters} />
                  <Statistic title="完成/失败" value={`${summary.completed}/${summary.failed}`} />
                </Space>
              </Col>
            </Row>
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
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="题库导入">
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
                      options={chapters.map((chapter) => ({
                        label: chapter.display_name || chapter.chapter_name,
                        value: chapter.id,
                      }))}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item label="上传 JSON 文件" required>
                <Dragger {...draggerProps} style={{ padding: 12 }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽 JSON 文件到此处</p>
                  <p className="ant-upload-hint">请使用与 Gemini 题库一致的 JSON 结构</p>
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
          </Card>
        </Col>
      </Row>

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
          ]}
        />
      </Drawer>
    </MainLayout>
  );
};

export default BanksPage;

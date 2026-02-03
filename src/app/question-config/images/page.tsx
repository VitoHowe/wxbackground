"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Upload,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { DeleteOutlined, EditOutlined, InboxOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { MainLayout, PageHeader } from "@/components";
import { SubjectsService, type SubjectItem } from "@/services/subjects";
import {
  QuestionBanksAdminService,
  type AdminQuestionBankItem,
  type BankImageItem,
} from "@/services/questionBanksAdmin";
import { API_CONFIG } from "@/constants/api";

const { Paragraph, Text } = Typography;

const ImagesPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [banks, setBanks] = useState<AdminQuestionBankItem[]>([]);
  const [bankId, setBankId] = useState<number | null>(null);
  const [images, setImages] = useState<BankImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameSubmitting, setRenameSubmitting] = useState(false);
  const [renameTarget, setRenameTarget] = useState<BankImageItem | null>(null);
  const [renameForm] = Form.useForm();
  const summary = useMemo(() => {
    let referencedImages = 0;
    let references = 0;
    let totalSize = 0;

    images.forEach((image) => {
      const usedCount = image.used_in_questions?.length || 0;
      if (usedCount > 0) referencedImages += 1;
      references += usedCount;
      totalSize += image.size || 0;
    });

    return {
      total: images.length,
      referencedImages,
      references,
      totalSize,
    };
  }, [images]);

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

  const fetchBanks = useCallback(
    async (nextSubjectId?: number | null) => {
      const targetId = nextSubjectId ?? subjectId;
      if (!targetId) {
        setBanks([]);
        setBankId(null);
        return;
      }
      try {
        const res = await QuestionBanksAdminService.listQuestionBanks({
          page: 1,
          limit: 100,
          subjectId: targetId,
        });
        if (res.code === 200) {
          setBanks(res.data?.list || []);
          if (res.data?.list?.length) {
            setBankId(res.data.list[0].id);
          } else {
            setBankId(null);
          }
        } else {
          message.error(res.message || "获取题库失败");
        }
      } catch (error: any) {
        message.error(error?.message || "获取题库失败");
      }
    },
    [message, subjectId]
  );

  const fetchImages = useCallback(
    async (nextBankId?: number | null) => {
      const targetId = nextBankId ?? bankId;
      if (!targetId) {
        setImages([]);
        return;
      }
      setLoading(true);
      try {
        const res = await QuestionBanksAdminService.listBankImages(targetId);
        if (res.code === 200) {
          setImages(res.data?.images || []);
          setPage(1);
        } else {
          message.error(res.message || "获取图片失败");
        }
      } catch (error: any) {
        message.error(error?.message || "获取图片失败");
      } finally {
        setLoading(false);
      }
    },
    [message, bankId]
  );

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchBanks(subjectId);
  }, [fetchBanks, subjectId]);

  useEffect(() => {
    fetchImages(bankId);
  }, [fetchImages, bankId]);

  const resolvedImages = useMemo(() => {
    const start = (page - 1) * pageSize;
    return images.slice(start, start + pageSize);
  }, [images, page, pageSize]);

  const handleUpload = async () => {
    if (!bankId) {
      message.warning("请先选择题库");
      return;
    }
    if (fileList.length === 0) {
      message.warning("请先选择图片");
      return;
    }
    try {
      setUploading(true);
      const files = fileList
        .map((item) => (item as any).originFileObj ?? (item as any))
        .filter((file) => file instanceof File) as File[];
      const res = await QuestionBanksAdminService.uploadBankImages(bankId, files, { overwrite });
      if (res.code === 200) {
        const skipped = res.data?.skipped || [];
        if (skipped.length > 0) {
          message.warning(`上传完成，跳过 ${skipped.length} 张同名图片`);
        } else {
          message.success("图片上传成功");
        }
        setFileList([]);
        await fetchImages(bankId);
      } else {
        message.error(res.message || "上传失败");
      }
    } catch (error: any) {
      message.error(error?.message || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const openRenameModal = (record: BankImageItem) => {
    setRenameTarget(record);
    renameForm.setFieldsValue({ newFilename: record.filename, overwrite: false });
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (!bankId || !renameTarget) return;
    try {
      const values = await renameForm.validateFields();
      setRenameSubmitting(true);
      const res = await QuestionBanksAdminService.renameBankImage(
        bankId,
        renameTarget.filename,
        values.newFilename,
        { overwrite: values.overwrite }
      );
      if (res.code === 200) {
        message.success(`重命名成功，已更新 ${res.data?.updatedQuestions ?? 0} 道题`);
        setRenameOpen(false);
        await fetchImages(bankId);
      } else {
        message.error(res.message || "重命名失败");
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || "重命名失败");
    } finally {
      setRenameSubmitting(false);
    }
  };

  const handleDelete = (record: BankImageItem, force = false) => {
    if (!bankId) return;
    const usedCount = record.used_in_questions?.length || 0;
    modal.confirm({
      title: force ? "确认强制删除" : "确认删除",
      content: usedCount
        ? `该图片被 ${usedCount} 道题引用，${force ? "将强制删除" : "建议先替换引用"}。`
        : "删除后不可恢复，确定继续？",
      okText: force ? "强制删除" : "删除",
      cancelText: "取消",
      async onOk() {
        try {
          const res = await QuestionBanksAdminService.deleteBankImage(bankId, record.filename, {
            force,
          });
          if (res.code === 200) {
            message.success("删除成功");
            await fetchImages(bankId);
          } else {
            message.error(res.message || "删除失败");
          }
        } catch (error: any) {
          message.error(error?.message || "删除失败");
        }
      },
    });
  };

  const formatBytes = (size: number) => {
    if (!size && size !== 0) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const columns: ColumnsType<BankImageItem> = useMemo(
    () => [
      {
        title: "预览",
        dataIndex: "url",
        width: 120,
        render: (value: string, record) => {
          if (!value) return "-";
          const resolvedUrl = value.startsWith("http") ? value : `${API_CONFIG.BASE_URL}${value}`;
          return (
            <Image
              src={resolvedUrl}
              alt={record.filename || "image"}
              width={72}
              height={48}
              style={{ objectFit: "cover", borderRadius: 6, cursor: "pointer" }}
              preview={{ mask: "查看" }}
              fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            />
          );
        },
      },
      {
        title: "文件名",
        dataIndex: "filename",
        ellipsis: true,
        render: (value: string) => (
          <Tooltip title={value}>
            <Text>{value}</Text>
          </Tooltip>
        ),
      },
      {
        title: "大小",
        dataIndex: "size",
        width: 110,
        align: "right",
        render: (value: number) => formatBytes(value),
      },
      {
        title: (
          <Space size={6} style={{ whiteSpace: "nowrap" }}>
            <span>引用题目数</span>
            <Tooltip title="表示当前图片在题干/解析/答案/选项中的占位符被多少道题使用。">
              <Text type="secondary">(?)</Text>
            </Tooltip>
          </Space>
        ),
        dataIndex: "used_in_questions",
        width: 140,
        align: "center",
        render: (value: number[]) => {
          const usedCount = value?.length || 0;
          return (
            <Tag color={usedCount ? "geekblue" : "default"} style={{ marginInlineEnd: 0 }}>
              {usedCount} 题
            </Tag>
          );
        },
      },
      {
        title: "操作",
        key: "actions",
        width: 140,
        align: "center",
        render: (_: unknown, record) => (
          <Space size={4}>
            <Tooltip title="重命名">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openRenameModal(record)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
            {record.used_in_questions?.length ? (
              <Tooltip title="强制删除">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleDelete(record, true)}
                />
              </Tooltip>
            ) : null}
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <MainLayout>
      <PageHeader title="题库图片管理" subtitle="支持批量上传、重命名与引用统计。" />
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space wrap>
            <Select
              style={{ minWidth: 220 }}
              placeholder="选择科目"
              value={subjectId ?? undefined}
              onChange={(value) => setSubjectId(value)}
              options={subjects.map((s) => ({
                label: `${s.name}${s.status === 1 ? "" : "（已停用）"}`,
                value: s.id,
              }))}
            />
            <Select
              style={{ minWidth: 260 }}
              placeholder="选择题库"
              value={bankId ?? undefined}
              onChange={(value) => setBankId(value)}
              options={banks.map((b) => ({
                label: b.name,
                value: b.id,
              }))}
            />
            <Button onClick={() => fetchImages(bankId)} disabled={!bankId}>
              刷新
            </Button>
          </Space>
        </Col>
        <Col>
          <Space size="large" wrap>
            <Statistic title="图片总数" value={summary.total} />
            <Statistic title="被引用图片" value={summary.referencedImages} />
            <Statistic title="引用次数" value={summary.references} />
            <Statistic title="总大小" value={formatBytes(summary.totalSize)} />
          </Space>
        </Col>
      </Row>
    </Card>

        <Card title="批量上传">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Paragraph>
              图片文件将保存到 <Text code>public/question-banks/&lt;bankId&gt;/images</Text>，题干中使用{" "}
              <Text code>${"{images/xxx.jpg}"}</Text> 进行引用。
            </Paragraph>
            <Upload.Dragger
              multiple
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.zip"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: nextList }) => setFileList(nextList)}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此处</p>
              <p className="ant-upload-hint">?? JPG / PNG / GIF / WEBP / ZIP?ZIP ?????????</p>
            </Upload.Dragger>
            <Space>
              <Switch checked={overwrite} onChange={setOverwrite} />
              <Text>允许覆盖同名图片</Text>
            </Space>
            <Button type="primary" loading={uploading} onClick={handleUpload} disabled={!bankId}>
              开始上传
            </Button>
          </Space>
        </Card>

        <Card title="图片列表">
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            引用题目数表示图片在题干/解析/答案/选项中的占位符被多少道题使用。
          </Paragraph>
          <Table
            rowKey="filename"
            dataSource={resolvedImages}
            columns={columns}
            loading={loading}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: 960 }}
            pagination={{
              current: page,
              pageSize,
              total: images.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (nextPage, nextSize) => {
                if (nextSize !== pageSize) {
                  setPageSize(nextSize);
                  setPage(1);
                } else {
                  setPage(nextPage);
                }
              },
            }}
            locale={{ emptyText: bankId ? "暂无图片" : "请先选择题库" }}
          />
        </Card>
      </Space>

      <Modal
        open={renameOpen}
        title="重命名图片"
        onOk={handleRename}
        onCancel={() => setRenameOpen(false)}
        confirmLoading={renameSubmitting}
        destroyOnClose
      >
        <Form form={renameForm} layout="vertical">
          <Form.Item label="当前文件名">
            <Input value={renameTarget?.filename} disabled />
          </Form.Item>
          <Form.Item
            label="新文件名"
            name="newFilename"
            rules={[{ required: true, message: "请输入新文件名" }]}
          >
            <Input placeholder="例如：chapter01-figure-01.jpg" />
          </Form.Item>
          <Form.Item label="允许覆盖同名文件" name="overwrite" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default ImagesPage;

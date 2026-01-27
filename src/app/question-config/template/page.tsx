"use client";

import React, { useEffect, useMemo, useState } from "react";
import { App, Button, Card, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MainLayout, PageHeader } from "@/components";
import { CopyOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;

type SampleQuestion = {
  question?: string;
  question_no?: string;
  type: "single" | "multiple" | "judge" | "fill" | "essay";
  content: string;
  options?: string[];
  answer: string;
  explanation?: string;
  difficulty?: number;
  tags?: string[];
};

type SamplePayload = {
  questions: SampleQuestion[];
};

const SAMPLE_URL = "/question-bank-sample-zh.json";
const IMAGE_PLACEHOLDER = "${images/xxx.jpg}";
const PROMPT_TEMPLATE = `你是一个专业的题库解析助手。请严格按以下 JSON 结构输出题库数据（只输出 JSON，不要额外说明）：
{
  "questions": [
    {
      "question": "题号(可选)",
      "type": "single|multiple|judge|fill|essay",
      "content": "题干",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "A 或 A,B 或 正确/错误 或 填空/问答文本（可包含图片占位符）",
      "explanation": "解析(可选)",
      "difficulty": 1,
      "tags": ["第01章-信息化发展"]
    }
  ]
}

生成规则：
1. type 必须是 single、multiple、judge、fill、essay 之一。
2. 单选/多选题必须有 options 数组；判断题 answer 使用“正确/错误”；多选题 answer 用英文逗号分隔。
3. tags[0] 作为章节名（用于后端按章节拆分）。
4. 题干/解析/答案如含图片，请使用占位符 ${IMAGE_PLACEHOLDER}（与 gemini 题库一致）或保留原图 URL。
5. 输出必须是合法 JSON。`;

const QuestionBankTemplatePage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [sample, setSample] = useState<SamplePayload | null>(null);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    const fetchSample = async () => {
      setLoading(true);
      try {
        const response = await fetch(SAMPLE_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("题库模板文件加载失败");
        }
        const text = await response.text();
        setRawText(text);
        const data = JSON.parse(text) as SamplePayload;
        setSample(data);
      } catch (error: any) {
        message.error(error?.message || "题库模板加载失败");
        setSample(null);
        setRawText("");
      } finally {
        setLoading(false);
      }
    };

    fetchSample();
  }, [message]);

  const handleCopyPrompt = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(PROMPT_TEMPLATE);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = PROMPT_TEMPLATE;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      message.success("提示词已复制到剪贴板");
    } catch (error: any) {
      message.error(error?.message || "复制失败，请手动复制");
    }
  };

  const columns: ColumnsType<SampleQuestion> = useMemo(
    () => [
      {
        title: "题号",
        dataIndex: "question",
        width: 80,
        render: (_: string, record) => record.question || record.question_no || "-",
      },
      {
        title: "题型",
        dataIndex: "type",
        width: 90,
        render: (value: SampleQuestion["type"]) => {
          const map: Record<SampleQuestion["type"], { label: string; color: string }> = {
            single: { label: "单选", color: "blue" },
            multiple: { label: "多选", color: "purple" },
            judge: { label: "判断", color: "green" },
            fill: { label: "填空", color: "orange" },
            essay: { label: "问答", color: "red" },
          };
          return <Tag color={map[value]?.color}>{map[value]?.label}</Tag>;
        },
      },
      {
        title: "题目内容",
        dataIndex: "content",
      },
      {
        title: "答案",
        dataIndex: "answer",
        width: 120,
      },
      {
        title: "章节标签",
        dataIndex: "tags",
        width: 160,
        render: (value?: string[]) => (value && value.length > 0 ? value[0] : "-"),
      },
    ],
    []
  );

  return (
    <MainLayout>
      <PageHeader
        title="题库结构模板"
        subtitle="用于提示模型生成题库 JSON，样例来自 gemini 题库。"
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Paragraph>
              模板文件已放在 <Text code>public/question-bank-sample-zh.json</Text>，导入时仅识别{" "}
              <Text code>questions</Text> 数组，章节归属取 <Text code>tags[0]</Text>。
            </Paragraph>
            <Space>
              <Button
                type="primary"
                href={SAMPLE_URL}
                target="_blank"
                rel="noreferrer"
                icon={<FileTextOutlined />}
              >
                打开模板
              </Button>
              <Button href={SAMPLE_URL} download icon={<DownloadOutlined />}>
                下载模板
              </Button>
            </Space>
          </Space>
        </Card>

        <Card title="一键生成提示词">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Paragraph>
              点击按钮会把提示词复制到剪贴板，可直接粘贴给 AI 模型生成结构化题库 JSON。
            </Paragraph>
            <Button type="primary" onClick={handleCopyPrompt} icon={<CopyOutlined />}>
              一键生成提示词
            </Button>
            <pre
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                padding: 16,
                borderRadius: 8,
                maxHeight: 360,
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {PROMPT_TEMPLATE}
            </pre>
          </Space>
        </Card>

        <Card title="题目预览">
          <Table
            rowKey={(record, index) => `${record.question || record.question_no || index}`}
            dataSource={sample?.questions || []}
            columns={columns}
            loading={loading}
            pagination={false}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: 960 }}
            locale={{ emptyText: "暂无模板数据" }}
          />
        </Card>

        <Card title="JSON 模板">
          <pre
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              padding: 16,
              borderRadius: 8,
              maxHeight: 360,
              overflow: "auto",
            }}
          >
            {rawText || "暂无模板数据"}
          </pre>
        </Card>
      </Space>
    </MainLayout>
  );
};

export default QuestionBankTemplatePage;

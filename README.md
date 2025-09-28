# 微信小程序后台管理系统

一个基于 Next.js + Ant Design 的现代化后台管理系统，专为微信小程序数据和文件管理而设计。

## 🚀 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 组件库**: Ant Design 5.x
- **开发语言**: TypeScript
- **包管理器**: pnpm
- **样式方案**: Tailwind CSS + Ant Design
- **代码规范**: ESLint + Prettier
- **Git 钩子**: Husky + lint-staged

## 📁 项目结构

```
wxbackground/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── layout.tsx         # 根布局文件
│   │   ├── page.tsx           # 首页
│   │   ├── login/             # 登录页面
│   │   └── globals.css        # 全局样式
│   ├── components/            # 组件目录
│   │   ├── layout/           # 布局组件
│   │   │   ├── MainLayout.tsx # 主布局组件
│   │   │   └── AuthGuard.tsx  # 路由保护组件
│   │   ├── ui/               # UI 组件
│   │   │   ├── PageHeader.tsx # 页面头部组件
│   │   │   ├── LoadingSpinner.tsx # 加载动画组件
│   │   │   └── EmptyState.tsx # 空状态组件
│   │   └── index.ts          # 组件统一导出
│   ├── services/             # API 服务层
│   │   └── auth.ts          # 认证服务
│   ├── hooks/                # 自定义 React Hooks
│   │   └── useAuth.ts       # 认证 Hook
│   ├── utils/                # 工具函数
│   │   ├── request.ts        # Axios 封装
│   │   └── index.ts          # 工具函数集合
│   ├── types/                # TypeScript 类型定义
│   │   ├── api.ts           # API 相关类型
│   │   ├── auth.ts          # 认证相关类型
│   │   ├── axios.d.ts       # Axios 类型扩展
│   │   └── index.ts         # 类型统一导出
│   ├── constants/           # 常量定义
│   │   ├── api.ts          # API 相关常量
│   │   └── index.ts        # 常量统一导出
│   └── styles/             # 样式文件
├── public/                 # 静态资源
├── .env.example           # 环境变量示例文件
├── .prettierrc            # Prettier 配置
├── .prettierignore        # Prettier 忽略文件
├── eslint.config.mjs      # ESLint 配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.ts     # Tailwind CSS 配置
├── next.config.ts         # Next.js 配置
└── package.json           # 项目依赖和脚本
```

## 🛠️ 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 📦 安装和启动

### 1. 克隆项目
```bash
git clone <repository-url>
cd wxbackground
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 环境变量配置
复制 `.env.example` 文件为 `.env.local` 并配置必要的环境变量：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```bash
# API 基础地址（确保后端服务运行在此地址）
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# 应用配置
NEXT_PUBLIC_APP_NAME=微信小程序后台管理系统
NEXT_PUBLIC_APP_VERSION=1.0.0

# 文件上传配置
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx

# 其他配置
NEXT_PUBLIC_DEBUG=false
```

### 4. 启动开发服务器
```bash
pnpm dev
```

项目将在 `http://localhost:3000` 启动。

## 🔐 认证系统

### 登录页面
- 访问地址：`/login`
- 支持用户名/密码登录
- 支持用户注册
- 表单验证和错误处理
- 自动跳转和状态管理

### 路由保护
- 自动检测用户认证状态
- 未登录用户访问受保护页面时自动跳转到登录页
- 已登录用户访问登录页时自动跳转到首页
- Token 过期自动处理

### 用户管理
- JWT Token 自动管理
- Refresh Token 支持
- 用户信息获取和更新
- 安全登出功能

## 📝 可用脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行 ESLint 检查并自动修复
- `pnpm lint:check` - 仅检查 ESLint 错误
- `pnpm format` - 格式化代码
- `pnpm format:check` - 检查代码格式
- `pnpm type-check` - TypeScript 类型检查

## 🏗️ 核心功能模块

### 1. 布局系统
- **MainLayout**: 主要布局组件，包含侧边栏、头部和内容区域
- **AuthGuard**: 路由保护组件，处理认证状态检查
- **响应式设计**: 支持桌面和移动端
- **主题配置**: 基于 Ant Design 的主题系统

### 2. 认证系统
```typescript
import { useAuth } from '@/hooks/useAuth';

// 使用认证 Hook
const { user, login, register, logout, isAuthenticated, loading } = useAuth();

// 登录
await login({ username: 'test', password: 'password' });

// 注册
await register({ 
  username: 'newuser', 
  password: 'password',
  nickname: '昵称',
  phone: '13800138000'
});

// 登出
await logout();
```

### 3. API 服务
```typescript
import { AuthService } from '@/services/auth';

// 直接使用服务
const response = await AuthService.login({ username, password });
const profile = await AuthService.getProfile();
await AuthService.logout();
```

### 4. 请求封装
```typescript
// 使用示例
import { get, post, put, del, upload } from '@/utils/request';

// GET 请求（自动添加认证头）
const userData = await get<UserInfo>('/user/info');

// POST 请求
const result = await post('/user/create', { name: 'test' });

// 文件上传
const uploadResult = await upload('/upload', file, {
  onUploadProgress: (progress) => console.log(progress)
});
```

### 5. 类型安全
项目采用 TypeScript 编写，提供完整的类型定义：
- API 响应类型
- 认证相关类型
- 组件 Props 类型
- 工具函数类型
- 自定义 Hook 类型

### 6. 代码规范
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git 提交钩子
- **lint-staged**: 暂存文件检查

## 🎨 UI 组件

### PageHeader
页面头部组件，支持面包屑、标题、副标题和操作按钮：
```typescript
<PageHeader
  title="页面标题"
  subtitle="页面描述"
  breadcrumb={[
    { title: '首页' },
    { title: '当前页面' }
  ]}
  extra={<Button type="primary">操作按钮</Button>}
/>
```

### LoadingSpinner
加载动画组件：
```typescript
<LoadingSpinner size="large" tip="加载中..." />
```

### EmptyState
空状态组件：
```typescript
<EmptyState
  title="暂无数据"
  description="点击下方按钮添加数据"
  action={{
    text: "添加数据",
    onClick: handleAdd
  }}
/>
```

## 🔧 工具函数

项目提供了丰富的工具函数：

- `formatFileSize(bytes)` - 格式化文件大小
- `formatDateTime(date, format)` - 格式化日期时间
- `debounce(func, wait)` - 防抖函数
- `throttle(func, limit)` - 节流函数
- `copyToClipboard(text)` - 复制到剪贴板
- `downloadFile(url, filename)` - 文件下载
- `getFileExtension(filename)` - 获取文件扩展名
- `isValidEmail(email)` - 邮箱格式验证
- `isValidPhone(phone)` - 手机号格式验证

## 🔐 API 集成

### 后端 API 接口
本系统对接的后端 API 接口文档详见：[API接口文档.md](../wxnode/API接口文档.md)

### 主要接口
- **认证接口**: `/api/auth/login`、`/api/auth/register`、`/api/auth/profile`
- **用户管理**: `/api/users`
- **题库管理**: `/api/questions`、`/api/questions/banks`
- **文件管理**: `/api/files`、`/api/files/upload`

### 请求拦截器
- 自动添加认证 token
- 显示加载状态
- 错误处理

### 响应拦截器
- 统一错误处理
- Token 过期自动跳转
- 业务状态码处理

## 🎯 开发规范

### 1. 文件命名
- 组件文件使用 PascalCase: `MyComponent.tsx`
- 工具文件使用 camelCase: `myUtils.ts`
- 页面文件使用 kebab-case: `user-management.tsx`

### 2. 组件开发
- 使用函数组件 + TypeScript
- Props 接口以组件名 + Props 命名
- 导出时使用 `export default`

### 3. 样式规范
- 优先使用 Ant Design 组件
- 自定义样式使用 Tailwind CSS
- 复杂样式使用 CSS-in-JS

### 4. Git 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 样式修改
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📱 移动端适配

项目采用响应式设计，支持各种屏幕尺寸：
- 使用 Ant Design 的栅格系统
- 侧边栏在小屏幕上自动折叠
- 表格组件支持横向滚动

## 🔄 状态管理

当前使用的状态管理方案：
- **本地状态**: React useState/useReducer
- **认证状态**: 自定义 useAuth Hook
- **全局状态**: 可扩展 Zustand 或 Context API

## 🚀 部署指南

### 1. 构建项目
```bash
pnpm build
```

### 2. 启动生产服务器
```bash
pnpm start
```

### 3. 使用 PM2 部署
```bash
pm2 start npm --name "wx-admin" -- start
```

### 4. Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔄 使用流程

### 首次使用
1. 确保后端服务运行在 `http://localhost:3000`
2. 复制并配置环境变量文件
3. 启动前端开发服务器
4. 访问 `http://localhost:3000` 会自动跳转到登录页
5. 使用注册功能创建账户或使用现有账户登录

### 日常使用
1. 系统会自动检查登录状态
2. Token 过期时会自动跳转到登录页面
3. 登录成功后可以访问所有受保护的页面
4. 使用头部的用户菜单可以查看个人信息或退出登录

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/my-feature`
3. 提交更改: `git commit -am 'Add some feature'`
4. 推送分支: `git push origin feature/my-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License

---

## 📞 支持

如果您在使用过程中遇到问题，请：
1. 查看文档和示例代码
2. 搜索已有的 Issues
3. 创建新的 Issue 并提供详细信息

**祝您使用愉快！** 🎉

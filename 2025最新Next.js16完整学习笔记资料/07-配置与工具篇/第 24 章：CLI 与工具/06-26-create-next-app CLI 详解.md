**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# create-next-app CLI 详解

## 概述

create-next-app 是 Next.js 官方提供的脚手架工具，用于快速创建 Next.js 项目。它提供了交互式命令行界面，支持多种模板和配置选项。

### create-next-app 的作用

1. **快速创建**：一键创建项目
2. **模板选择**：多种模板可选
3. **配置选项**：自定义配置
4. **最佳实践**：遵循官方规范
5. **依赖管理**：自动安装依赖

## 基础用法

### 基本创建

```bash
# 使用npx
npx create-next-app@latest

# 使用yarn
yarn create next-app

# 使用pnpm
pnpm create next-app

# 使用bun
bunx create-next-app
```

### 指定项目名

```bash
# 创建指定名称的项目
npx create-next-app@latest my-app

# 在当前目录创建
npx create-next-app@latest .
```

### 交互式创建

```bash
npx create-next-app@latest

# 会提示以下问题：
# What is your project named? my-app
# Would you like to use TypeScript? Yes
# Would you like to use ESLint? Yes
# Would you like to use Tailwind CSS? Yes
# Would you like to use `src/` directory? No
# Would you like to use App Router? Yes
# Would you like to customize the default import alias? No
```

### 非交互式创建

```bash
# 使用默认配置
npx create-next-app@latest my-app --use-npm --no-interactive

# 完整配置
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

## 高级配置

### TypeScript 配置

```bash
# 启用TypeScript
npx create-next-app@latest my-app --typescript

# 禁用TypeScript
npx create-next-app@latest my-app --no-typescript
```

### ESLint 配置

```bash
# 启用ESLint
npx create-next-app@latest my-app --eslint

# 禁用ESLint
npx create-next-app@latest my-app --no-eslint
```

### Tailwind CSS 配置

```bash
# 启用Tailwind CSS
npx create-next-app@latest my-app --tailwind

# 禁用Tailwind CSS
npx create-next-app@latest my-app --no-tailwind
```

### App Router 配置

```bash
# 使用App Router
npx create-next-app@latest my-app --app

# 使用Pages Router
npx create-next-app@latest my-app --no-app
```

### src 目录配置

```bash
# 使用src目录
npx create-next-app@latest my-app --src-dir

# 不使用src目录
npx create-next-app@latest my-app --no-src-dir
```

### 导入别名配置

```bash
# 自定义导入别名
npx create-next-app@latest my-app --import-alias "@/*"

# 使用默认别名
npx create-next-app@latest my-app --import-alias "~/*"
```

### 包管理器配置

```bash
# 使用npm
npx create-next-app@latest my-app --use-npm

# 使用yarn
npx create-next-app@latest my-app --use-yarn

# 使用pnpm
npx create-next-app@latest my-app --use-pnpm

# 使用bun
npx create-next-app@latest my-app --use-bun
```

### 模板配置

```bash
# 使用官方示例
npx create-next-app@latest my-app --example blog

# 使用GitHub仓库
npx create-next-app@latest my-app --example https://github.com/vercel/next.js/tree/canary/examples/blog

# 使用本地模板
npx create-next-app@latest my-app --example file:../my-template
```

### 实验性功能

```bash
# 启用Turbopack
npx create-next-app@latest my-app --turbo

# 启用实验性功能
npx create-next-app@latest my-app --experimental-app
```

### 环境配置

```bash
# 指定Node版本
NODE_VERSION=18 npx create-next-app@latest my-app

# 指定npm镜像
npm config set registry https://registry.npmmirror.com
npx create-next-app@latest my-app
```

### 自定义配置

```bash
# 完整自定义
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --no-interactive
```

### 调试模式

```bash
# 启用调试
DEBUG=* npx create-next-app@latest my-app

# 显示详细信息
npx create-next-app@latest my-app --verbose
```

## 实战案例

### 案例 1：标准 Web 应用

```bash
# 创建TypeScript + Tailwind项目
npx create-next-app@latest my-web-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

```bash
# 项目结构
my-web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
├── public/
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### 案例 2：博客项目

```bash
# 使用官方博客模板
npx create-next-app@latest my-blog --example blog

# 或使用自定义配置
npx create-next-app@latest my-blog \
  --typescript \
  --tailwind \
  --app \
  --use-pnpm
```

### 案例 3：电商项目

```bash
# 创建电商项目
npx create-next-app@latest my-ecommerce \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --use-pnpm

# 安装额外依赖
cd my-ecommerce
pnpm add zustand @tanstack/react-query stripe
```

### 案例 4：企业级项目

```bash
# 创建企业级项目
npx create-next-app@latest my-enterprise \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

# 添加企业级工具
cd my-enterprise
pnpm add -D husky lint-staged commitlint
```

### 案例 5: Monorepo 项目

```bash
# 创建主项目
npx create-next-app@latest my-monorepo \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --use-pnpm

# 项目结构
my-monorepo/
├── apps/
│   ├── web/          # 主应用
│   └── admin/        # 管理后台
├── packages/
│   ├── ui/           # 共享组件
│   ├── utils/        # 工具函数
│   └── config/       # 共享配置
└── package.json
```

### 案例 6: 多语言项目

```bash
# 创建多语言项目
npx create-next-app@latest my-i18n-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --use-pnpm

# 安装国际化依赖
cd my-i18n-app
pnpm add next-intl
```

### 案例 7: PWA 项目

```bash
# 创建PWA项目
npx create-next-app@latest my-pwa \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --use-pnpm

# 安装PWA依赖
cd my-pwa
pnpm add next-pwa
```

### 案例 8: 全栈项目

```bash
# 创建全栈项目
npx create-next-app@latest my-fullstack \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --use-pnpm

# 安装数据库和ORM
cd my-fullstack
pnpm add prisma @prisma/client
pnpm add -D prisma
```

### 案例 9: 移动端优先项目

```bash
# 创建移动端项目
npx create-next-app@latest my-mobile \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --use-pnpm

# 配置移动端优化
cd my-mobile
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

### 案例 10: 静态网站

```bash
# 创建静态网站
npx create-next-app@latest my-static \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --use-pnpm

# 配置静态导出
# next.config.js
# output: 'export'
```

## 命令行选项详解

### --typescript / --no-typescript

启用或禁用 TypeScript 支持。

```bash
# 启用TypeScript
npx create-next-app@latest my-app --typescript

# 生成的文件
my-app/
├── tsconfig.json          # TypeScript配置
├── next-env.d.ts          # Next.js类型定义
└── src/
    └── app/
        ├── layout.tsx     # .tsx扩展名
        └── page.tsx
```

**TypeScript 配置内容**:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### --eslint / --no-eslint

启用或禁用 ESLint 配置。

```bash
# 启用ESLint
npx create-next-app@latest my-app --eslint

# 生成的文件
my-app/
├── .eslintrc.json         # ESLint配置
└── package.json           # 包含eslint依赖
```

**ESLint 配置内容**:

```json
{
  "extends": "next/core-web-vitals"
}
```

### --tailwind / --no-tailwind

启用或禁用 Tailwind CSS。

```bash
# 启用Tailwind CSS
npx create-next-app@latest my-app --tailwind

# 生成的文件
my-app/
├── tailwind.config.ts     # Tailwind配置
├── postcss.config.js      # PostCSS配置
└── src/
    └── app/
        └── globals.css    # 包含Tailwind指令
```

**Tailwind 配置内容**:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
```

### --app / --no-app

选择使用 App Router 或 Pages Router。

```bash
# 使用App Router (推荐)
npx create-next-app@latest my-app --app

# 项目结构
my-app/
└── app/
    ├── layout.tsx
    ├── page.tsx
    └── globals.css

# 使用Pages Router
npx create-next-app@latest my-app --no-app

# 项目结构
my-app/
└── pages/
    ├── _app.tsx
    ├── _document.tsx
    └── index.tsx
```

### --src-dir / --no-src-dir

是否使用 src 目录。

```bash
# 使用src目录
npx create-next-app@latest my-app --src-dir

# 项目结构
my-app/
└── src/
    └── app/
        ├── layout.tsx
        └── page.tsx

# 不使用src目录
npx create-next-app@latest my-app --no-src-dir

# 项目结构
my-app/
└── app/
    ├── layout.tsx
    └── page.tsx
```

### --import-alias

自定义导入路径别名。

```bash
# 使用@作为别名
npx create-next-app@latest my-app --import-alias "@/*"

# 使用~作为别名
npx create-next-app@latest my-app --import-alias "~/*"

# 生成的tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**使用示例**:

```typescript
// 不使用别名
import { Button } from "../../../components/ui/button";

// 使用别名
import { Button } from "@/components/ui/button";
```

### --use-npm / --use-yarn / --use-pnpm / --use-bun

选择包管理器。

```bash
# 使用npm
npx create-next-app@latest my-app --use-npm

# 使用yarn
npx create-next-app@latest my-app --use-yarn

# 使用pnpm
npx create-next-app@latest my-app --use-pnpm

# 使用bun
npx create-next-app@latest my-app --use-bun
```

**包管理器对比**:

| 特性          | npm               | yarn      | pnpm           | bun       |
| ------------- | ----------------- | --------- | -------------- | --------- |
| 安装速度      | 慢                | 中等      | 快             | 最快      |
| 磁盘空间      | 大                | 大        | 小             | 小        |
| 锁文件        | package-lock.json | yarn.lock | pnpm-lock.yaml | bun.lockb |
| Monorepo 支持 | 基础              | 好        | 最好           | 好        |
| 兼容性        | 最好              | 好        | 好             | 一般      |
| 推荐场景      | 传统项目          | 团队协作  | 大型项目       | 新项目    |

### --example

使用官方示例模板。

```bash
# 使用博客模板
npx create-next-app@latest my-blog --example blog

# 使用电商模板
npx create-next-app@latest my-shop --example commerce

# 使用CMS模板
npx create-next-app@latest my-cms --example cms-wordpress

# 查看所有示例
# https://github.com/vercel/next.js/tree/canary/examples
```

**常用官方示例**:

| 示例名称         | 说明            | 适用场景        |
| ---------------- | --------------- | --------------- |
| blog             | 博客系统        | 内容网站        |
| commerce         | 电商系统        | 在线商城        |
| cms-wordpress    | WordPress 集成  | CMS 项目        |
| with-tailwindcss | Tailwind 示例   | 学习 Tailwind   |
| with-typescript  | TypeScript 示例 | 学习 TypeScript |
| api-routes       | API 路由示例    | 后端 API        |
| auth             | 认证示例        | 用户系统        |
| i18n-routing     | 国际化示例      | 多语言网站      |

### --no-interactive

跳过交互式提示。

```bash
# 使用默认配置
npx create-next-app@latest my-app --no-interactive

# 结合其他选项
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --no-interactive
```

## 项目结构详解

### App Router 结构

```bash
my-app/
├── app/                    # App Router目录
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式
│   ├── favicon.ico         # 网站图标
│   ├── api/                # API路由
│   │   └── hello/
│   │       └── route.ts
│   └── about/              # 关于页面
│       └── page.tsx
├── public/                 # 静态资源
│   ├── next.svg
│   └── vercel.svg
├── node_modules/           # 依赖包
├── .gitignore              # Git忽略文件
├── next.config.js          # Next.js配置
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.ts      # Tailwind配置
├── postcss.config.js       # PostCSS配置
└── README.md               # 项目说明
```

### Pages Router 结构

```bash
my-app/
├── pages/                  # Pages Router目录
│   ├── _app.tsx            # 应用入口
│   ├── _document.tsx       # 文档结构
│   ├── index.tsx           # 首页
│   ├── api/                # API路由
│   │   └── hello.ts
│   └── about.tsx           # 关于页面
├── public/                 # 静态资源
├── styles/                 # 样式文件
│   └── globals.css
├── node_modules/
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

### 使用 src 目录结构

```bash
my-app/
├── src/                    # 源代码目录
│   ├── app/                # App Router
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # 组件目录
│   │   ├── ui/
│   │   └── layout/
│   ├── lib/                # 工具函数
│   │   ├── utils.ts
│   │   └── api.ts
│   └── styles/             # 样式文件
│       └── globals.css
├── public/
├── node_modules/
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

## 配置文件详解

### package.json

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "15.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "autoprefixer": "^10.0.1"
  }
}
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 实验性功能
  experimental: {
    // 启用Turbopack
    turbo: {
      // Turbopack配置
    },
  },

  // 图片配置
  images: {
    domains: ["example.com"],
  },

  // 环境变量
  env: {
    CUSTOM_KEY: "value",
  },

  // 重定向
  async redirects() {
    return [
      {
        source: "/old-path",
        destination: "/new-path",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### .gitignore

```bash
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

## 适用场景

### 个人项目

| 配置项     | 推荐值  | 说明     |
| ---------- | ------- | -------- |
| TypeScript | ✅ 启用 | 类型安全 |
| ESLint     | ✅ 启用 | 代码质量 |
| Tailwind   | ✅ 启用 | 快速开发 |
| App Router | ✅ 启用 | 新特性   |
| src 目录   | ❌ 禁用 | 简化结构 |
| 包管理器   | pnpm    | 速度快   |

**推荐命令**:

```bash
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --use-pnpm
```

### 团队项目

| 配置项     | 推荐值  | 说明     |
| ---------- | ------- | -------- |
| TypeScript | ✅ 启用 | 团队协作 |
| ESLint     | ✅ 启用 | 统一规范 |
| Tailwind   | ✅ 启用 | 统一样式 |
| App Router | ✅ 启用 | 最佳实践 |
| src 目录   | ✅ 启用 | 清晰结构 |
| 包管理器   | pnpm    | 节省空间 |

**推荐命令**:

```bash
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

### 企业项目

| 配置项     | 推荐值  | 说明 |
| ---------- | ------- | ---- |
| TypeScript | ✅ 启用 | 必须 |
| ESLint     | ✅ 启用 | 必须 |
| Tailwind   | ✅ 启用 | 推荐 |
| App Router | ✅ 启用 | 必须 |
| src 目录   | ✅ 启用 | 必须 |
| 包管理器   | pnpm    | 推荐 |

**推荐命令**:

```bash
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --no-interactive
```

### 学习项目

| 配置项     | 推荐值  | 说明       |
| ---------- | ------- | ---------- |
| TypeScript | ✅ 启用 | 学习类型   |
| ESLint     | ✅ 启用 | 学习规范   |
| Tailwind   | ❌ 禁用 | 先学 CSS   |
| App Router | ✅ 启用 | 学习新特性 |
| src 目录   | ❌ 禁用 | 简化学习   |
| 包管理器   | npm     | 最常用     |

**推荐命令**:

```bash
npx create-next-app@latest my-app \
  --typescript \
  --eslint \
  --app \
  --use-npm
```

## 注意事项

### 1. Node 版本

```bash
# 检查Node版本
node -v

# 需要Node 18.17或更高版本
nvm install 18
nvm use 18
```

### 2. 包管理器

```bash
# 确保使用正确的包管理器
npx create-next-app@latest my-app --use-pnpm

# 避免混用包管理器
```

### 3. 网络问题

```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 或使用代理
npm config set proxy http://proxy.example.com:8080
```

### 4. 权限问题

```bash
# Linux/Mac可能需要sudo
sudo npx create-next-app@latest my-app

# 或修复npm权限
npm config set prefix ~/.npm-global
```

### 5. 缓存问题

```bash
# 清除npm缓存
npm cache clean --force

# 清除npx缓存
rm -rf ~/.npm/_npx
```

## 常见问题

### 1. 如何选择包管理器？

**问题**：不知道用哪个包管理器

**解决方案**：

```bash
# npm：默认选择
npx create-next-app@latest my-app --use-npm

# pnpm：推荐使用（更快、更省空间）
npx create-next-app@latest my-app --use-pnpm

# yarn：团队使用
npx create-next-app@latest my-app --use-yarn
```

### 2. 如何使用 TypeScript？

**问题**：需要 TypeScript 支持

**解决方案**：

```bash
npx create-next-app@latest my-app --typescript
```

### 3. 如何使用 Tailwind CSS？

**问题**：需要 Tailwind CSS

**解决方案**：

```bash
npx create-next-app@latest my-app --tailwind
```

### 4. 如何使用 App Router？

**问题**：需要使用新的 App Router

**解决方案**：

```bash
npx create-next-app@latest my-app --app
```

### 5. 如何使用 src 目录？

**问题**：需要 src 目录结构

**解决方案**：

```bash
npx create-next-app@latest my-app --src-dir
```

### 6. 如何自定义导入别名？

**问题**：需要自定义路径别名

**解决方案**：

```bash
npx create-next-app@latest my-app --import-alias "@/*"
```

### 7. 如何使用官方示例？

**问题**：需要使用官方模板

**解决方案**：

```bash
npx create-next-app@latest my-app --example blog
```

### 8. 如何跳过交互？

**问题**：需要自动化创建

**解决方案**：

```bash
npx create-next-app@latest my-app --no-interactive
```

### 9. 如何在当前目录创建？

**问题**：需要在当前目录创建

**解决方案**：

```bash
npx create-next-app@latest .
```

### 10. 如何解决网络问题？

**问题**：下载速度慢

**解决方案**：

```bash
npm config set registry https://registry.npmmirror.com
npx create-next-app@latest my-app
```

### 11. 如何解决权限问题？

**问题**：没有权限创建

**解决方案**：

```bash
sudo npx create-next-app@latest my-app
```

### 12. 如何清除缓存？

**问题**：缓存导致问题

**解决方案**：

```bash
npm cache clean --force
rm -rf ~/.npm/_npx
```

### 13. 如何查看版本？

**问题**：需要查看版本

**解决方案**：

```bash
npx create-next-app@latest --version
```

### 14. 如何启用调试？

**问题**：需要调试信息

**解决方案**：

```bash
DEBUG=* npx create-next-app@latest my-app
```

### 15. 如何使用特定版本？

**问题**：需要使用特定版本

**解决方案**：

```bash
npx create-next-app@14.0.0 my-app
```

### 16. 如何创建 Monorepo 项目？

**问题**：需要创建 Monorepo 结构

**解决方案**：

```bash
# 1. 创建根目录
mkdir my-monorepo && cd my-monorepo

# 2. 初始化pnpm workspace
pnpm init
echo "packages:\n  - 'apps/*'\n  - 'packages/*'" > pnpm-workspace.yaml

# 3. 创建应用
mkdir -p apps packages
cd apps
npx create-next-app@latest web --use-pnpm
npx create-next-app@latest admin --use-pnpm
```

### 17. 如何添加环境变量？

**问题**：需要配置环境变量

**解决方案**：

```bash
# 创建项目后
cd my-app

# 创建环境变量文件
echo "NEXT_PUBLIC_API_URL=https://api.example.com" > .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local

# 在代码中使用
# process.env.NEXT_PUBLIC_API_URL
```

### 18. 如何配置绝对导入？

**问题**：需要使用绝对路径导入

**解决方案**：

```bash
# 创建时指定别名
npx create-next-app@latest my-app --import-alias "@/*"

# 或手动修改tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"]
    }
  }
}
```

### 19. 如何集成数据库？

**问题**：需要连接数据库

**解决方案**：

```bash
# 创建项目
npx create-next-app@latest my-app --typescript --use-pnpm

# 安装Prisma
cd my-app
pnpm add prisma @prisma/client
pnpm add -D prisma

# 初始化Prisma
npx prisma init

# 配置数据库
# .env
# DATABASE_URL="postgresql://..."
```

### 20. 如何添加认证功能？

**问题**：需要用户认证

**解决方案**：

```bash
# 使用NextAuth示例
npx create-next-app@latest my-app --example with-nextauth

# 或手动安装
npx create-next-app@latest my-app --typescript --use-pnpm
cd my-app
pnpm add next-auth
```

### 21. 如何配置国际化？

**问题**：需要多语言支持

**解决方案**：

```bash
# 创建项目
npx create-next-app@latest my-app --typescript --use-pnpm

# 安装i18n库
cd my-app
pnpm add next-intl

# 或使用示例
npx create-next-app@latest my-app --example i18n-routing
```

### 22. 如何优化构建速度？

**问题**：构建速度慢

**解决方案**：

```bash
# 使用pnpm (更快的包管理器)
npx create-next-app@latest my-app --use-pnpm

# 启用Turbopack (实验性)
# package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

### 23. 如何配置代码格式化？

**问题**：需要统一代码风格

**解决方案**：

```bash
# 创建项目
npx create-next-app@latest my-app --eslint --use-pnpm

# 安装Prettier
cd my-app
pnpm add -D prettier eslint-config-prettier

# 创建.prettierrc
echo '{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2
}' > .prettierrc
```

### 24. 如何配置 Git Hooks？

**问题**：需要提交前检查

**解决方案**：

```bash
# 创建项目
npx create-next-app@latest my-app --eslint --use-pnpm

# 安装Husky和lint-staged
cd my-app
pnpm add -D husky lint-staged

# 初始化Husky
npx husky init

# 配置lint-staged
echo '{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
}' > .lintstagedrc
```

### 25. 如何部署到 Vercel？

**问题**：需要部署项目

**解决方案**：

```bash
# 创建项目
npx create-next-app@latest my-app --use-pnpm

# 推送到GitHub
cd my-app
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# 在Vercel导入项目
# https://vercel.com/new
```

## 最佳实践

### 项目命名规范

```bash
# 使用小写和连字符
npx create-next-app@latest my-awesome-app

# 避免使用
npx create-next-app@latest MyAwesomeApp  # ❌ 大写
npx create-next-app@latest my_awesome_app  # ❌ 下划线
```

### 依赖管理

```bash
# 使用pnpm节省磁盘空间
npx create-next-app@latest my-app --use-pnpm

# 定期更新依赖
pnpm update

# 检查过时的包
pnpm outdated
```

### 代码组织

```bash
# 使用src目录
npx create-next-app@latest my-app --src-dir

# 推荐的目录结构
src/
├── app/              # 页面和路由
├── components/       # 可复用组件
│   ├── ui/           # UI组件
│   └── layout/       # 布局组件
├── lib/              # 工具函数
│   ├── utils.ts
│   └── api.ts
├── hooks/            # 自定义Hooks
├── types/            # TypeScript类型
└── styles/           # 样式文件
```

### 性能优化

```typescript
// 启用TypeScript严格模式
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}

// 使用动态导入
// app/page.tsx
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'))

// 优化图片
// 使用Next.js Image组件
import Image from 'next/image'
```

### 安全配置

```bash
# 不要提交敏感信息
# .gitignore
.env*.local
.env.production

# 使用环境变量
# .env.local
DATABASE_URL=postgresql://...
API_KEY=secret-key

# 在代码中使用
process.env.DATABASE_URL
```

### 团队协作

```bash
# 提交配置文件到Git
git add .vscode/
git add .editorconfig
git add .prettierrc
git add .eslintrc.json

# 使用统一的Node版本
# .nvmrc
20.10.0

# 使用统一的包管理器
# package.json
{
  "packageManager": "pnpm@8.0.0"
}
```

## 故障排查

### 创建失败

```bash
# 问题：创建项目失败
# 解决：清除缓存
npm cache clean --force
rm -rf ~/.npm/_npx

# 重新创建
npx create-next-app@latest my-app
```

### 依赖安装失败

```bash
# 问题：依赖安装失败
# 解决：切换镜像源
npm config set registry https://registry.npmmirror.com

# 或使用代理
npm config set proxy http://proxy.example.com:8080
```

### TypeScript 错误

```bash
# 问题：TypeScript类型错误
# 解决：重新生成类型
rm -rf .next
npm run dev

# 或更新TypeScript
pnpm update typescript
```

### ESLint 错误

```json
// 问题：ESLint报错
// 解决：修复ESLint配置
// .eslintrc.json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-html-link-for-pages": "off"
  }
}
```

### 端口占用

```bash
# 问题：3000端口被占用
# 解决：使用其他端口
npm run dev -- -p 3001

# 或杀死占用进程
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 高级技巧

### 自定义模板

创建自己的项目模板：

```bash
# 1. 创建模板项目
npx create-next-app@latest my-template --typescript --tailwind --app

# 2. 自定义配置
cd my-template
# 添加常用依赖、配置文件等

# 3. 推送到GitHub
git init
git add .
git commit -m "Initial template"
git remote add origin <your-template-repo>
git push -u origin main

# 4. 使用模板
npx create-next-app@latest my-new-app --example https://github.com/username/my-template
```

### 批量创建项目

```bash
# 创建脚本 create-projects.sh
#!/bin/bash

projects=("web" "admin" "mobile")

for project in "${projects[@]}"
do
  npx create-next-app@latest "$project" \
    --typescript \
    --eslint \
    --tailwind \
    --app \
    --src-dir \
    --use-pnpm \
    --no-interactive
done
```

### 预设配置文件

```bash
# 创建配置预设
# .create-next-app-config.json
{
  "typescript": true,
  "eslint": true,
  "tailwind": true,
  "app": true,
  "srcDir": true,
  "importAlias": "@/*",
  "packageManager": "pnpm"
}

# 使用配置文件
npx create-next-app@latest my-app --config .create-next-app-config.json
```

### CI/CD 集成

```yaml
# .github/workflows/create-app.yml
name: Create Next.js App

on:
  workflow_dispatch:
    inputs:
      app_name:
        description: "Application name"
        required: true

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - name: Create Next.js app
        run: |
          npx create-next-app@latest ${{ github.event.inputs.app_name }} \
            --typescript \
            --eslint \
            --tailwind \
            --app \
            --src-dir \
            --use-pnpm \
            --no-interactive
```

## 总结

create-next-app 是 Next.js 官方提供的脚手架工具，用于快速创建项目。通过掌握 create-next-app 可以：

1. **快速创建**：一键创建项目
2. **模板选择**：多种模板可选
3. **配置选项**：自定义配置
4. **最佳实践**：遵循官方规范
5. **依赖管理**：自动安装依赖

关键要点：

- 使用 npx create-next-app 创建项目
- 选择合适的包管理器
- 启用 TypeScript 支持
- 配置 ESLint 和 Tailwind
- 选择 App Router 或 Pages Router
- 使用 src 目录结构
- 自定义导入别名
- 使用官方示例
- 跳过交互式创建
- 解决网络和权限问题

记住：create-next-app 提供了最佳实践的项目结构。根据项目需求选择合适的配置选项，快速启动开发。

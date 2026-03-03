**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# App Router 与 Pages Router 对比

## 1. 概述 (Overview)

> **核心定义**: App Router 和 Pages Router 是 Next.js 提供的两种不同的路由架构系统,代表了框架演进的两个重要阶段。Pages Router 是 Next.js 从 1.0 到 12.x 版本的传统路由系统,而 App Router 是从 13.0 版本开始引入的基于 React Server Components 的现代化路由系统。

在 Next.js 16 中,虽然 App Router 已成为官方推荐的主流方案,但框架依然完整支持 Pages Router,允许在同一项目中混用两种路由系统。理解两者的差异对于选择合适的架构、进行系统迁移以及充分利用 Next.js 的能力至关重要。

### 1.1 概念定义

**Pages Router (传统路由系统)**:

Pages Router 是 Next.js 最初设计的路由系统,基于 `pages/` 目录下的文件结构自动生成路由。每个文件代表一个路由,通过特殊的数据获取方法(`getServerSideProps`、`getStaticProps`、`getInitialProps`)来处理服务端渲染和静态生成。

**核心特征**:

- 基于 `pages/` 目录的文件系统路由
- 组件默认在客户端渲染
- 使用数据获取函数在页面级别获取数据
- 单一的 `_app.js` 和 `_document.js` 进行全局配置
- 成熟稳定,有大量生产实践

**App Router (现代路由系统)**:

App Router 是 Next.js 13 引入的全新路由系统,基于 `app/` 目录和 React Server Components 架构。它采用了文件夹和特殊文件约定的方式定义路由,组件默认在服务端渲染,提供了更细粒度的控制和更强大的功能。

**核心特征**:

- 基于 `app/` 目录的文件夹路由
- 组件默认为 Server Components(服务端组件)
- 支持嵌套布局和流式渲染
- 内置 Loading、Error、Not Found 等特殊 UI 状态
- 原生支持 Suspense 和并行路由
- 更好的性能和更小的客户端 bundle

> **技术洞察**: App Router 的设计哲学是"服务端优先",与 Pages Router 的"客户端默认"形成鲜明对比。这一转变不仅改变了路由的实现方式,更重构了整个应用的架构思维。

### 1.2 背景与演进

**Pages Router 的诞生背景**:

2016 年,React 应用主要采用客户端渲染(CSR)方式,面临以下问题:

1. **SEO 困境**: 搜索引擎爬虫无法有效抓取 JavaScript 渲染的内容
2. **首屏性能**: 大量 JavaScript 下载和执行导致首屏加载慢
3. **路由配置复杂**: React Router 等方案需要手动配置路由规则
4. **数据获取碎片化**: 各种数据获取方案缺乏统一标准

Next.js 通过 Pages Router 提供了解决方案:

```javascript
// pages/index.js - 简单直观的文件路由
export default function Home({ data }) {
  return <div>{data.title}</div>;
}

// 服务端数据获取
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

这种方式在 2016-2022 年间取得了巨大成功,成为 React 服务端渲染的事实标准。

**App Router 的诞生背景**:

到了 2022 年,前端技术发展带来了新的需求和可能性:

1. **React Server Components**: React 18 引入的革命性特性
2. **流式渲染**: Suspense 和 Streaming 技术成熟
3. **更细粒度的控制**: 需要在路由、布局、页面等不同层级控制渲染
4. **性能极致优化**: 减少客户端 JavaScript,提升性能
5. **开发体验提升**: 更直观的文件组织和错误处理

2022 年 10 月,Next.js 13.0 发布,引入了实验性的 App Router:

```typescript
// app/page.tsx - Server Component 默认
export default async function Page() {
  // 直接在组件中获取数据
  const data = await fetchData();
  return <div>{data.title}</div>;
}
```

**演进时间线**:

- **2016-2020**: Pages Router 稳步发展

  - Next.js 1.0 - 9.x: 基础功能完善
  - 引入静态生成(SSG)和增量静态再生(ISR)
  - 成为生产环境首选

- **2021-2022**: Pages Router 成熟期

  - Next.js 10.0 - 12.x: 优化和完善
  - Image、Script 等优化组件
  - Middleware 引入

- **2022.10**: App Router 实验性发布

  - Next.js 13.0: app 目录(alpha)
  - React Server Components 集成
  - Turbopack(alpha)首次亮相

- **2023**: App Router 快速迭代

  - Next.js 13.x: 逐步稳定
  - Server Actions 引入
  - 开发者反馈和改进

- **2024**: App Router 稳定

  - Next.js 14.0 - 15.0: 稳定版本
  - Turbopack 进入 beta/stable
  - 生产环境大规模采用

- **2025**: App Router 成为主流
  - Next.js 16.0: 完全成熟
  - Turbopack 默认启用
  - 官方推荐新项目使用 App Router
  - Pages Router 进入维护模式(仍完全支持)

> **里程碑**: Next.js 13.0 的 App Router 发布是框架历史上最大的架构变革,标志着从"客户端优先"向"服务端优先"的范式转移。这不仅是技术实现的改变,更是 React 应用架构思维的革命。

### 1.3 核心价值

**为什么需要两种路由系统?**

Next.js 同时支持两种路由系统,体现了框架的设计智慧:

**Pages Router 的持续价值**:

1. **稳定性**: 7+ 年的生产验证,极其稳定可靠
2. **生态成熟**: 大量第三方库和工具支持
3. **学习曲线平缓**: 概念简单,易于上手
4. **迁移成本低**: 适合从传统 React 应用迁移
5. **向后兼容**: 保护现有投资,无需强制升级

**App Router 的创新价值**:

1. **性能优势**:

   - 更小的客户端 bundle(减少 20-40%)
   - 更快的首屏渲染(提升 30-50%)
   - 流式渲染减少 TTFB(首字节时间)

2. **开发体验**:

   - 内置 Loading/Error 状态,减少样板代码
   - 嵌套布局避免重复渲染
   - 类型安全的路由参数

3. **架构优势**:

   - Server Components 减少客户端复杂度
   - 更细粒度的渲染控制
   - 原生支持并行路由和拦截路由

4. **未来方向**:
   - React 团队的官方推荐架构
   - 持续获得新特性支持
   - 代表现代 React 应用的最佳实践

**性能对比数据**:

| 指标                   | Pages Router | App Router | 改进幅度 |
| :--------------------- | :----------- | :--------- | :------- |
| 初始 JavaScript Bundle | 200-300 KB   | 120-180 KB | 减少 40% |
| 首屏 TTFB              | 600-800 ms   | 300-500 ms | 提升 50% |
| 页面切换速度           | 200-400 ms   | 100-200 ms | 提升 50% |
| 内存使用               | 100%         | 70-80%     | 减少 25% |

> **选择建议**: 新项目优先选择 App Router,已有 Pages Router 项目可以渐进式迁移或混用两种路由。Next.js 16 对两者都提供完整支持,不必担心 Pages Router 被废弃。

---

## 2. 核心架构对比

### 2.1 目录结构

**Pages Router 目录结构**:

```
my-app/
├── pages/
│   ├── _app.js                 # 应用入口
│   ├── _document.js            # HTML 文档
│   ├── index.js                # 首页 (/)
│   ├── about.js                # 关于页 (/about)
│   ├── blog/
│   │   ├── index.js            # 博客列表 (/blog)
│   │   └── [slug].js           # 博客文章 (/blog/:slug)
│   ├── api/
│   │   └── hello.js            # API 路由
│   ├── 404.js                  # 自定义 404
│   └── 500.js                  # 自定义 500
├── public/                     # 静态资源
├── styles/                     # 样式文件
└── next.config.js              # Next.js 配置
```

**App Router 目录结构**:

```
my-app/
├── app/
│   ├── layout.tsx              # 根布局(必需)
│   ├── page.tsx                # 首页 (/)
│   ├── loading.tsx             # 加载状态
│   ├── error.tsx               # 错误边界
│   ├── not-found.tsx           # 404 页面
│   ├── global-error.tsx        # 全局错误
│   ├── about/
│   │   └── page.tsx            # 关于页 (/about)
│   ├── blog/
│   │   ├── layout.tsx          # 博客布局
│   │   ├── page.tsx            # 博客列表 (/blog)
│   │   ├── loading.tsx         # 博客加载
│   │   ├── [slug]/
│   │   │   ├── page.tsx        # 博客文章 (/blog/:slug)
│   │   │   ├── loading.tsx     # 文章加载
│   │   │   └── error.tsx       # 文章错误
│   │   └── @sidebar/           # 并行路由
│   │       └── default.tsx
│   └── api/
│       └── hello/
│           └── route.ts        # API 路由
├── public/
├── styles/
└── next.config.ts
```

**目录结构对比**:

| 维度     | Pages Router                   | App Router                         |
| :------- | :----------------------------- | :--------------------------------- |
| 路由单位 | 文件(file)                     | 文件夹(folder)                     |
| 页面文件 | 任意命名.js                    | page.tsx                           |
| 布局     | \_app.js(全局)                 | layout.tsx(嵌套)                   |
| 加载状态 | 手动实现                       | loading.tsx                        |
| 错误处理 | \_error.js(全局)               | error.tsx(路由级)                  |
| 404 页面 | 404.js                         | not-found.tsx                      |
| API 路由 | api/\*.js                      | api/\*/route.ts                    |
| 特殊文件 | 3 个(\_app,\_document,\_error) | 7 个(layout,page,loading,error 等) |

### 2.2 路由定义

**Pages Router 路由定义**:

```javascript
// pages/index.js → /
export default function Home() {
  return <h1>首页</h1>;
}

// pages/about.js → /about
export default function About() {
  return <h1>关于</h1>;
}

// pages/blog/[slug].js → /blog/:slug
import { useRouter } from 'next/router';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  return <h1>文章: {slug}</h1>;
}

// pages/blog/[...slug].js → /blog/*
export default function CatchAll() {
  const router = useRouter();
  const { slug } = router.query; // slug 是数组
  return <h1>路径: {slug?.join('/')}</h1>;
}

// pages/shop/[[...slug]].js → /shop 或 /shop/*
export default function OptionalCatchAll() {
  const router = useRouter();
  const { slug = [] } = router.query;
  return <h1>路径: {slug.join('/') || '商店首页'}</h1>;
}
```

**App Router 路由定义**:

```typescript
// app/page.tsx → /
export default function Home() {
  return <h1>首页</h1>;
}

// app/about/page.tsx → /about
export default function About() {
  return <h1>关于</h1>;
}

// app/blog/[slug]/page.tsx → /blog/:slug
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  return <h1>文章: {slug}</h1>;
}

// app/blog/[...slug]/page.tsx → /blog/*
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAll({ params }: PageProps) {
  const { slug } = await params;
  return <h1>路径: {slug.join("/")}</h1>;
}

// app/shop/[[...slug]]/page.tsx → /shop 或 /shop/*
export default async function OptionalCatchAll({ params }: PageProps) {
  const { slug = [] } = await params;
  return <h1>路径: {slug.join("/") || "商店首页"}</h1>;
}
```

**关键差异**:

1. **文件 vs 文件夹**: Pages Router 用文件名定义路由,App Router 用文件夹名
2. **参数获取**: Pages Router 用 useRouter() hook,App Router 用 params prop(Promise)
3. **类型安全**: App Router 提供完整的 TypeScript 类型推断
4. **异步组件**: App Router 支持 async 组件直接获取数据

### 2.3 数据获取

**Pages Router 数据获取**:

```javascript
// 1. 服务端渲染(SSR)
export async function getServerSideProps(context) {
  const { params, query, req, res } = context;
  const data = await fetchData();

  return {
    props: { data },
  };
}

// 2. 静态生成(SSG)
export async function getStaticProps() {
  const data = await fetchData();

  return {
    props: { data },
    revalidate: 60, // ISR: 60秒后重新生成
  };
}

export async function getStaticPaths() {
  const paths = await getAllPaths();

  return {
    paths,
    fallback: "blocking",
  };
}

// 3. 客户端获取(CSR)
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data?.title}</div>;
}
```

**App Router 数据获取**:

```typescript
// 1. Server Component 直接获取(默认)
export default async function Page() {
  // 静态数据(构建时获取,默认缓存)
  const staticData = await fetch("https://api.example.com/static");

  // 动态数据(每次请求获取)
  const dynamicData = await fetch("https://api.example.com/dynamic", {
    cache: "no-store",
  });

  // ISR 数据(定时重新验证)
  const isrData = await fetch("https://api.example.com/isr", {
    next: { revalidate: 60 },
  });

  return <div>{(await staticData.json()).title}</div>;
}

// 2. 生成静态参数
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 3. 流式渲染
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>标题</h1>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </div>
  );
}

async function AsyncComponent() {
  const data = await fetchSlowData();
  return <div>{data}</div>;
}

// 4. Client Component 获取
("use client");

import { useEffect, useState } from "react";

export default function ClientPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data?.title}</div>;
}
```

**数据获取对比**:

| 维度       | Pages Router       | App Router              |
| :--------- | :----------------- | :---------------------- |
| 服务端获取 | getServerSideProps | async component         |
| 静态生成   | getStaticProps     | async component + cache |
| ISR        | revalidate 选项    | next.revalidate         |
| 路径生成   | getStaticPaths     | generateStaticParams    |
| 客户端获取 | useEffect + fetch  | 'use client' + hooks    |
| 并行获取   | 手动 Promise.all   | 自动或 Promise.all      |
| 流式渲染   | 不支持             | Suspense                |
| 缓存控制   | 有限               | 精细(fetch 配置)        |

### 2.4 布局系统

**Pages Router 布局**:

```javascript
// pages/_app.js - 全局布局
import Layout from '../components/Layout';

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

// pages/blog/[slug].js - 页面级布局
import BlogLayout from '../../components/BlogLayout';

export default function BlogPost({ post }) {
  return <article>{post.content}</article>;
}

BlogPost.getLayout = function getLayout(page) {
  return (
    <BlogLayout>
      {page}
    </BlogLayout>
  );
};

// pages/_app.js - 支持嵌套布局
export default function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(<Component {...pageProps} />);
}
```

**限制**:

- 路由切换时布局重新渲染
- 布局状态不保留
- 需要手动管理嵌套关系
- TypeScript 支持有限

**App Router 布局**:

```typescript
// app/layout.tsx - 根布局(必需)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/blog/layout.tsx - 博客布局
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-container">
      <BlogSidebar />
      <main>{children}</main>
    </div>
  );
}

// app/blog/[slug]/page.tsx - 页面
export default function BlogPost() {
  return <article>文章内容</article>;
}

// 渲染结构(自动嵌套):
// RootLayout
//   └─ BlogLayout
//      └─ BlogPost
```

**优势**:

- 布局自动嵌套,无需手动管理
- 路由切换时布局状态保留
- 性能优化(只重渲染变化部分)
- 完整的 TypeScript 支持
- 支持并行路由和路由组

### 2.5 错误处理

**Pages Router 错误处理**:

```javascript
// pages/_error.js - 全局错误页
function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `服务器错误 ${statusCode}`
        : '客户端错误'}
    </p>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

// pages/404.js - 404 页面
export default function Custom404() {
  return <h1>404 - 页面未找到</h1>;
}

// pages/500.js - 500 页面
export default function Custom500() {
  return <h1>500 - 服务器错误</h1>;
}

// 组件内错误处理(手动)
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了</h1>;
    }
    return this.props.children;
  }
}
```

**App Router 错误处理**:

```typescript
// app/error.tsx - 路由级错误边界
"use client"; // Error 组件必须是 Client Component

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>出错了!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>重试</button>
    </div>
  );
}

// app/global-error.tsx - 全局错误
("use client");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>应用出错!</h2>
        <button onClick={() => reset()}>重试</button>
      </body>
    </html>
  );
}

// app/not-found.tsx - 404 页面
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>页面未找到</h2>
      <Link href="/">返回首页</Link>
    </div>
  );
}

// 在页面中触发 404
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  const data = await fetchData(id);

  if (!data) {
    notFound(); // 触发 not-found.tsx
  }

  return <div>{data.title}</div>;
}
```

**错误处理对比**:

| 维度        | Pages Router        | App Router            |
| :---------- | :------------------ | :-------------------- |
| 错误边界    | 手动 Error Boundary | error.tsx(自动)       |
| 错误粒度    | 全局(\_error.js)    | 路由段级(每个目录)    |
| 404 处理    | 404.js(全局)        | not-found.tsx(路由级) |
| 重试功能    | 手动实现            | 内置 reset()          |
| 错误信息    | statusCode          | Error 对象 + digest   |
| Client 要求 | 任意                | 必须 'use client'     |

---

## 3. 高级特性对比

### 3.1 并行路由

**Pages Router**: 不支持原生并行路由,需要手动实现

```javascript
// pages/dashboard.js - 手动实现并行渲染
export default function Dashboard({ analytics, team }) {
  return (
    <div className="grid grid-cols-3">
      <div className="col-span-2">
        <DashboardMain />
      </div>
      <div>
        <Analytics data={analytics} />
        <Team data={team} />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  // 手动并行获取
  const [analytics, team] = await Promise.all([fetchAnalytics(), fetchTeam()]);

  return {
    props: { analytics, team },
  };
}
```

**App Router**: 原生支持并行路由

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3">
      <div className="col-span-2">{children}</div>
      <div>
        {analytics}
        {team}
      </div>
    </div>
  );
}

// app/dashboard/page.tsx
export default function Dashboard() {
  return <h1>仪表板</h1>;
}

// app/dashboard/@analytics/page.tsx
export default async function Analytics() {
  const data = await fetchAnalytics();
  return <AnalyticsChart data={data} />;
}

// app/dashboard/@team/page.tsx
export default async function Team() {
  const members = await fetchTeam();
  return <TeamList members={members} />;
}

// app/dashboard/@analytics/loading.tsx
export default function AnalyticsLoading() {
  return <Skeleton />;
}

// app/dashboard/@team/error.tsx
("use client");

export default function TeamError({ error, reset }) {
  return <div>团队数据加载失败</div>;
}
```

**优势**:

- 每个插槽可以独立加载和错误处理
- 自动并行渲染
- 独立的 loading 和 error 状态
- 类型安全

### 3.2 拦截路由

**Pages Router**: 不支持,需要复杂的手动实现

**App Router**: 原生支持拦截路由

```typescript
// app/photos/page.tsx - 照片网格
import Link from "next/link";

export default function PhotosPage({ photos }) {
  return (
    <div className="grid grid-cols-4">
      {photos.map((photo) => (
        <Link key={photo.id} href={`/photos/${photo.id}`}>
          <img src={photo.url} alt={photo.title} />
        </Link>
      ))}
    </div>
  );
}

// app/photos/(..)photos/[id]/page.tsx - 模态框拦截
export default async function PhotoModal({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="modal">
      <img src={photo.url} alt={photo.title} />
    </div>
  );
}

// app/photos/[id]/page.tsx - 完整页面
export default async function PhotoPage({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="full-page">
      <img src={photo.url} alt={photo.title} />
      <h1>{photo.title}</h1>
      <p>{photo.description}</p>
    </div>
  );
}
```

**拦截规则**:

- `(.)` - 匹配同一级别
- `(..)` - 匹配上一级
- `(..)(..)` - 匹配上两级
- `(...)` - 匹配根 app 目录

**用例**:

- 照片画廊模态框
- 登录对话框
- 购物车侧边栏
- 任何需要保持上下文的 UI

### 3.3 路由组

**Pages Router**: 不支持,所有路由影响 URL

**App Router**: 支持路由组

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing">
      <MarketingNav />
      {children}
    </div>
  );
}

// app/(marketing)/about/page.tsx → /about
export default function About() {
  return <h1>关于我们</h1>;
}

// app/(marketing)/pricing/page.tsx → /pricing
export default function Pricing() {
  return <h1>价格方案</h1>;
}

// app/(shop)/layout.tsx
export default function ShopLayout({ children }) {
  return (
    <div className="shop">
      <ShopNav />
      {children}
    </div>
  );
}

// app/(shop)/products/page.tsx → /products
export default function Products() {
  return <h1>产品</h1>;
}

// app/(shop)/cart/page.tsx → /cart
export default function Cart() {
  return <h1>购物车</h1>;
}
```

**优势**:

- 组织代码而不影响 URL
- 不同区域使用不同布局
- 更清晰的项目结构
- 便于团队协作

### 3.4 Server Actions

**Pages Router**: 需要 API Routes

```javascript
// pages/api/create-post.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const post = await createPost(req.body);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// pages/create-post.js
import { useState } from 'react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error('Failed');

      const post = await res.json();
      // 成功处理
    } catch (error) {
      // 错误处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button disabled={loading}>
        {loading ? '创建中...' : '创建'}
      </button>
    </form>
  );
}
```

**App Router**: Server Actions

```typescript
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;

  // 直接访问数据库
  const post = await db.post.create({
    data: { title },
  });

  // 重新验证缓存
  revalidatePath("/posts");

  // 重定向
  redirect(`/posts/${post.id}`);
}

// app/create-post/page.tsx - 无 JavaScript 也能工作!
import { createPost } from "../actions";

export default function CreatePost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">创建</button>
    </form>
  );
}

// 或带状态管理
("use client");

import { useActionState } from "react";
import { createPost } from "../actions";

export default function CreatePostWithState() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "创建中..." : "创建"}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**优势**:

- 无需 API 端点
- 类型安全(end-to-end)
- 渐进增强(无 JS 也能用)
- 自动处理缓存失效
- 内置 loading 和 error 状态

### 3.5 流式渲染

**Pages Router**: 不支持

**App Router**: 原生支持

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      {/* 立即渲染 */}
      <h1>仪表板</h1>

      {/* 流式渲染各部分 */}
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
    </div>
  );
}

async function UserInfo() {
  const user = await fetchUser(); // 快速 API
  return <div>{user.name}</div>;
}

async function Stats() {
  const stats = await fetchStats(); // 中速 API
  return <div>{stats.total}</div>;
}

async function Chart() {
  const data = await fetchChartData(); // 慢速 API
  return <ChartComponent data={data} />;
}
```

**优势**:

- 更快的首字节时间(TTFB)
- 渐进式页面加载
- 更好的用户感知性能
- 自动优化关键渲染路径

---

## 4. 迁移指南

### 4.1 渐进式迁移策略

Next.js 支持在同一项目中混用 Pages Router 和 App Router:

```
my-app/
├── app/                    # App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── new-feature/
│       └── page.tsx
├── pages/                  # Pages Router
│   ├── _app.js
│   ├── index.js
│   ├── about.js
│   └── blog/
│       └── [slug].js
└── next.config.ts
```

**迁移步骤**:

**步骤 1: 创建根布局**

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
```

**步骤 2: 迁移简单页面**

```javascript
// 之前: pages/about.js
export default function About() {
  return <h1>关于我们</h1>;
}

// 之后: app/about/page.tsx
export default function About() {
  return <h1>关于我们</h1>;
}
```

**步骤 3: 迁移数据获取**

```javascript
// 之前: pages/blog/[slug].js
export default function BlogPost({ post }) {
  return <article>{post.content}</article>;
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  };
}

// 之后: app/blog/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(p => ({ slug: p.slug }));
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}
```

**步骤 4: 迁移布局**

```javascript
// 之前: pages/_app.js
import Layout from '../components/Layout';

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

// 之后: app/layout.tsx
import Layout from '../components/Layout';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
```

**步骤 5: 迁移 API Routes**

```javascript
// 之前: pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: "Hello" });
}

// 之后: app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

### 4.2 常见迁移场景

**场景 1: 认证保护的页面**

```javascript
// Pages Router
// pages/dashboard.js
import { getSession } from "next-auth/react";

export default function Dashboard({ user }) {
  return <div>Welcome {user.name}</div>;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
```

```typescript
// App Router
// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome {session.user.name}</div>;
}
```

**场景 2: 动态路由 with ISR**

```javascript
// Pages Router
// pages/products/[id].js
export default function Product({ product }) {
  return <div>{product.name}</div>;
}

export async function getStaticProps({ params }) {
  const product = await getProduct(params.id);

  return {
    props: { product },
    revalidate: 3600, // 1小时
  };
}

export async function getStaticPaths() {
  const products = await getProducts();

  return {
    paths: products.map((p) => ({ params: { id: p.id } })),
    fallback: "blocking",
  };
}
```

```typescript
// App Router
// app/products/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600; // 1小时

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export default async function Product({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  return <div>{product.name}</div>;
}
```

**场景 3: 国际化**

```javascript
// Pages Router
// next.config.js
module.exports = {
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
  },
};

// pages/index.js
import { useRouter } from "next/router";

export default function Home() {
  const { locale } = useRouter();
  return <div>{locale === "zh" ? "首页" : "Home"}</div>;
}
```

```typescript
// App Router (需要第三方库或手动实现)
// app/[locale]/layout.tsx
export async function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <div>{children}</div>;
}

// app/[locale]/page.tsx
interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  return <div>{locale === "zh" ? "首页" : "Home"}</div>;
}
```

### 4.3 迁移注意事项

**1. 组件类型**:

- App Router 默认 Server Components
- 使用 React hooks 需要添加 'use client'
- Context、事件处理器需要 Client Components

**2. 数据获取**:

- 移除 getServerSideProps、getStaticProps
- 改用 async components 或 fetch
- 注意缓存配置

**3. 路由 API**:

- useRouter 来自 'next/navigation' 而非 'next/router'
- Link 组件无需 <a> 子元素
- router.push() 改为从 'next/navigation' 导入

**4. 元数据**:

- 移除 <Head> 组件
- 使用 generateMetadata 或 metadata export

**5. 错误处理**:

- 创建 error.tsx 文件
- 必须是 Client Component('use client')

---

## 5. 适用场景

### 5.1 Pages Router 适用场景

**1. 现有项目维护**

如果你有一个成熟的 Pages Router 项目:

```
优势:
✅ 无需重构,风险低
✅ 团队熟悉现有架构
✅ 第三方库完全兼容
✅ 稳定可靠

继续使用 Pages Router 的理由:
- 项目运行良好
- 没有明显的性能瓶颈
- 团队资源有限
- 业务优先级高
```

**2. 简单的静态网站**

博客、文档站、营销页面等:

```javascript
// pages/index.js
export default function Home({ posts }) {
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export async function getStaticProps() {
  const posts = await getPosts();
  return { props: { posts } };
}
```

**3. 快速原型开发**

对于需要快速验证想法的项目:

```
优势:
✅ 学习曲线平缓
✅ 概念简单直观
✅ 快速上手
✅ 丰富的教程资源
```

**4. 客户端为主的应用**

大部分逻辑在客户端的应用:

```javascript
// pages/dashboard.js
export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 客户端数据获取
    fetchData().then(setData);
  }, []);

  return <div>{data && <DashboardUI data={data} />}</div>;
}
```

### 5.2 App Router 适用场景

**1. 新项目**

所有新项目都应优先考虑 App Router:

```
优势:
✅ 最新技术栈
✅ 更好的性能
✅ 官方推荐
✅ 持续获得新特性
```

**2. 需要 Server Components 的项目**

大量服务端逻辑的应用:

```typescript
// app/products/page.tsx
export default async function Products() {
  // 直接在服务端获取数据
  const products = await db.product.findMany();
  const categories = await db.category.findMany();

  return (
    <div>
      <CategoryFilter categories={categories} />
      <ProductList products={products} />
    </div>
  );
}
```

**3. 需要流式渲染的项目**

复杂的仪表板、数据密集型应用:

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      <Header />

      <Suspense fallback={<Skeleton />}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <Analytics />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
```

**4. 需要细粒度控制的项目**

不同部分有不同渲染需求:

```typescript
// app/blog/layout.tsx
export default function BlogLayout({ children }) {
  return (
    <div>
      <BlogSidebar /> {/* Server Component */}
      {children}
    </div>
  );
}

// app/blog/[slug]/page.tsx
export const revalidate = 3600; // ISR

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}
```

**5. SEO 要求高的项目**

电商、内容网站等:

```typescript
// app/products/[id]/page.tsx
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function Product({ params }) {
  const product = await getProduct(params.id);
  return <ProductDetail product={product} />;
}
```

### 5.3 混合使用场景

在同一项目中混用两种路由:

```
my-app/
├── app/                    # App Router (新功能)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/          # 新的仪表板
│   │   └── page.tsx
│   └── products/           # 新的产品页
│       └── [id]/
│           └── page.tsx
├── pages/                  # Pages Router (遗留代码)
│   ├── _app.js
│   ├── about.js            # 保留旧页面
│   └── blog/               # 保留博客
│       └── [slug].js
└── next.config.ts
```

**混合使用策略**:

1. **新功能用 App Router**: 所有新开发的功能使用 App Router
2. **旧代码保持不变**: 已有的 Pages Router 代码继续维护
3. **逐步迁移**: 根据优先级逐步迁移旧代码
4. **团队培训**: 确保团队熟悉两种路由系统

---

## 6. 注意事项

### 6.1 Pages Router 注意事项

**1. 性能限制**

```javascript
// ⚠️ 问题: 整个页面一次性渲染
export async function getServerSideProps() {
  // 必须等待所有数据
  const data1 = await fetchSlowData1(); // 1秒
  const data2 = await fetchSlowData2(); // 2秒
  const data3 = await fetchSlowData3(); // 1秒
  // 总计 4秒,用户看到白屏

  return { props: { data1, data2, data3 } };
}

// ✅ 解决方案: 分离关键和非关键数据
export async function getServerSideProps() {
  // 只获取关键数据
  const critical = await fetchCriticalData();

  return { props: { critical } };
}

export default function Page({ critical }) {
  // 客户端获取非关键数据
  const { data: nonCritical } = useSWR("/api/non-critical");

  return (
    <div>
      <CriticalContent data={critical} />
      {nonCritical && <NonCriticalContent data={nonCritical} />}
    </div>
  );
}
```

**2. 布局重复渲染**

```javascript
// ⚠️ 问题: 路由切换时布局重新渲染
export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

// 每次路由切换,Layout 都会重新挂载,丢失状态

// ✅ 解决方案: 使用 getLayout 模式
export default function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(<Component {...pageProps} />);
}

// 页面定义
Page.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
```

**3. 类型安全限制**

```typescript
// ⚠️ 问题: params 类型推断困难
export async function getStaticProps({ params }) {
  // params 类型不明确
  const post = await getPost(params.slug); // params.slug 可能是 undefined
  return { props: { post } };
}

// ✅ 解决方案: 手动类型定义
import { GetStaticProps } from "next";

interface Params {
  slug: string;
}

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  const post = await getPost(params!.slug);
  return { props: { post } };
};
```

### 6.2 App Router 注意事项

**1. Server/Client 组件边界**

```typescript
// ⚠️ 错误: 在 Server Component 中使用 useState
export default async function Page() {
  const [count, setCount] = useState(0); // 错误!
  return <div>{count}</div>;
}

// ✅ 正确: 分离 Server 和 Client Component
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();
  return (
    <div>
      <ServerContent data={data} />
      <ClientCounter initialCount={0} />
    </div>
  );
}

// app/ClientCounter.tsx (Client Component)
("use client");

import { useState } from "react";

export default function ClientCounter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**2. 数据序列化**

```typescript
// ⚠️ 错误: 传递不可序列化的数据
// app/page.tsx
export default async function Page() {
  const user = await getUser();
  // user 包含 Date 对象
  return <ClientComponent user={user} />; // 错误!
}

// ✅ 正确: 序列化数据
export default async function Page() {
  const user = await getUser();
  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(), // 转换为字符串
  };
  return <ClientComponent user={serializedUser} />;
}
```

**3. 缓存配置**

```typescript
// ⚠️ 问题: 意外的缓存行为
export default async function Page() {
  // 默认缓存,可能获取到旧数据
  const data = await fetch("https://api.example.com/data");
  return <div>{(await data.json()).value}</div>;
}

// ✅ 明确缓存策略
export default async function Page() {
  // 动态数据
  const dynamic = await fetch("https://api.example.com/dynamic", {
    cache: "no-store",
  });

  // 静态数据
  const static = await fetch("https://api.example.com/static", {
    cache: "force-cache",
  });

  // ISR 数据
  const isr = await fetch("https://api.example.com/isr", {
    next: { revalidate: 60 },
  });

  return <div>...</div>;
}
```

**4. 错误处理**

```typescript
// ⚠️ 错误: error.tsx 不是 Client Component
// app/error.tsx
export default function Error({ error, reset }) {
  // 错误: 不能使用 useEffect 等 hooks
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <div>Error</div>;
}

// ✅ 正确: 添加 'use client'
// app/error.tsx
("use client");

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>出错了</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  );
}
```

**5. 并行路由的 default.tsx**

```typescript
// ⚠️ 问题: 缺少 default.tsx 导致 404
// app/dashboard/layout.tsx
export default function DashboardLayout({ analytics }) {
  return <div>{analytics}</div>;
}

// app/dashboard/@analytics/stats/page.tsx
export default function Stats() {
  return <div>Stats</div>;
}

// 访问 /dashboard 时,@analytics 插槽找不到匹配,导致错误

// ✅ 解决方案: 添加 default.tsx
// app/dashboard/@analytics/default.tsx
export default function AnalyticsDefault() {
  return <div>默认分析面板</div>;
}
```

### 6.3 迁移注意事项

**1. 路由 API 差异**

```typescript
// Pages Router
import { useRouter } from "next/router";

const router = useRouter();
router.push("/path");
router.query.id;

// App Router
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const router = useRouter();
router.push("/path"); // 相同
const pathname = usePathname(); // 新 API
const searchParams = useSearchParams(); // 新 API
const id = searchParams.get("id");
```

**2. Link 组件差异**

```tsx
// Pages Router
<Link href="/about">
  <a>About</a>
</Link>

// App Router (无需 <a>)
<Link href="/about">
  About
</Link>
```

**3. 元数据差异**

```javascript
// Pages Router
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>我的页面</title>
        <meta name="description" content="描述" />
      </Head>
      <div>内容</div>
    </>
  );
}

// App Router
export const metadata = {
  title: '我的页面',
  description: '描述',
};

export default function Page() {
  return <div>内容</div>;
}
```

---

## 7. 常见问题

### Q1: 应该选择哪种路由系统?

**答案**:

- **新项目**: 优先选择 App Router,它代表了 Next.js 的未来方向,提供更好的性能和开发体验
- **现有项目**: Pages Router 仍然完全支持,无需强制迁移。可以渐进式迁移或继续使用
- **混合使用**: 可以在同一项目中同时使用两种路由,新功能用 App Router,旧代码保持不变

### Q2: App Router 和 Pages Router 可以混用吗?

**答案**: 可以!Next.js 完全支持在同一项目中混用两种路由:

```
my-app/
├── app/              # App Router
│   └── new-feature/
├── pages/            # Pages Router
│   └── old-feature/
└── next.config.ts
```

**优先级**: 当路由冲突时,App Router 优先级更高

### Q3: Pages Router 会被废弃吗?

**答案**: 不会。Vercel 官方明确表示:

- Pages Router 会持续维护和支持
- 不会有强制迁移
- 现有项目可以继续使用
- 新功能可能优先在 App Router 实现

### Q4: 迁移到 App Router 需要多长时间?

**答案**: 取决于项目规模:

- **小型项目** (< 20 页面): 1-2 周
- **中型项目** (20-100 页面): 1-2 月
- **大型项目** (> 100 页面): 2-6 月

**建议**: 不要一次性全部迁移,采用渐进式策略

### Q5: App Router 的性能真的更好吗?

**答案**: 是的,实测数据显示:

- JavaScript bundle 减少 20-40%
- 首屏 TTFB 减少 30-50%
- 页面切换速度提升 40-60%
- 内存使用减少 20-30%

但具体效果取决于应用特性

### Q6: Server Components 有什么限制?

**答案**: Server Components 不能使用:

- React hooks (useState, useEffect 等)
- 浏览器 API (window, localStorage 等)
- 事件处理器 (onClick, onChange 等)
- Context API

**解决方案**: 需要这些功能时使用 Client Components ('use client')

### Q7: 如何在 App Router 中实现国际化?

**答案**: App Router 不再提供内置 i18n 支持,需要:

- 使用第三方库(如 next-intl)
- 或手动实现

```typescript
// app/[locale]/layout.tsx
export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default function LocaleLayout({ children, params }) {
  return <IntlProvider locale={params.locale}>{children}</IntlProvider>;
}
```

### Q8: App Router 的 loading.tsx 和 Suspense 有什么区别?

**答案**:

- **loading.tsx**: 路由级别的加载状态,自动应用于整个路由段
- **Suspense**: 组件级别的加载状态,可以精确控制哪些部分显示加载状态

```typescript
// loading.tsx - 整个页面加载
export default function Loading() {
  return <Skeleton />;
}

// Suspense - 部分加载
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>;
```

### Q9: Server Actions 安全吗?

**答案**: 是的,但需要注意:

- Server Actions 默认受 CSRF 保护
- 永远不要信任客户端输入,要做验证
- 敏感操作要做权限检查
- 不要在 Server Actions 中返回敏感数据

```typescript
"use server";

import { getServerSession } from "next-auth";

export async function deletePost(id: string) {
  // 1. 验证用户身份
  const session = await getServerSession();
  if (!session) throw new Error("未授权");

  // 2. 验证权限
  const post = await db.post.findUnique({ where: { id } });
  if (post.authorId !== session.user.id) {
    throw new Error("无权删除");
  }

  // 3. 执行操作
  await db.post.delete({ where: { id } });
}
```

### Q10: 如何调试 Server Components?

**答案**:

1. **服务端日志**: console.log 会在服务端显示
2. **React DevTools**: 支持 Server Components
3. **Next.js DevTools MCP** (Next.js 16): AI 辅助调试
4. **错误边界**: 使用 error.tsx 捕获错误

```typescript
// 服务端日志
export default async function Page() {
  const data = await fetchData();
  console.log("Data:", data); // 显示在服务端终端
  return <div>{data}</div>;
}
```

---

## 8. 总结

### 8.1 核心对比总结

**Pages Router**:

- ✅ 成熟稳定,7+ 年生产验证
- ✅ 学习曲线平缓,概念简单
- ✅ 生态完善,大量第三方库支持
- ✅ 适合简单应用和快速原型
- ⚠️ 性能优化有限
- ⚠️ 缺少现代特性(Streaming、PPR 等)
- ⚠️ 布局系统较弱

**App Router**:

- ✅ 更好的性能(bundle 减少 20-40%)
- ✅ Server Components,减少客户端 JavaScript
- ✅ 流式渲染,更快的首屏
- ✅ 细粒度控制(loading、error、layout)
- ✅ 官方推荐,持续获得新特性
- ⚠️ 学习曲线稍陡
- ⚠️ 生态还在成熟中
- ⚠️ 需要理解 Server/Client 组件边界

### 8.2 选择建议

**选择 Pages Router 如果**:

1. 维护现有项目
2. 快速原型开发
3. 团队不熟悉 Server Components
4. 简单的静态网站
5. 客户端为主的应用

**选择 App Router 如果**:

1. 新项目
2. 需要最佳性能
3. SEO 要求高
4. 需要流式渲染
5. 复杂的数据获取需求
6. 需要细粒度控制

**混合使用**:

- 新功能用 App Router
- 旧代码保持 Pages Router
- 渐进式迁移


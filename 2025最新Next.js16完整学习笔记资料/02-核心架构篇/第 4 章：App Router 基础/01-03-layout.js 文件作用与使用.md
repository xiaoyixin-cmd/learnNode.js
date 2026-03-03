**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 01-03-layout.js 文件作用与使用

## 概述

### 什么是 layout.js

`layout.js` (或 `layout.tsx`) 是 Next.js App Router 中的核心特殊文件之一,用于定义在多个页面之间共享的用户界面布局。它允许开发者创建可重用的布局组件,这些组件在路由切换时保持状态,不会重新渲染,从而提升应用性能和用户体验。

在 Next.js 16 中,布局文件遵循严格的嵌套规则,支持服务端组件和并行路由等高级特性,是构建复杂应用架构的基石。

### layout.js 的核心价值

**1. 性能优化**

- 布局组件在导航时不重新渲染
- 保持组件状态和实例
- 减少不必要的重新计算和网络请求

**2. 代码复用**

- 统一的 UI 结构跨多个页面共享
- 减少重复代码
- 提高开发效率

**3. 架构清晰**

- 清晰的视觉层次结构
- 便于团队协作
- 易于维护和扩展

**4. 用户体验**

- 平滑的导航过渡
- 一致的界面风格
- 快速的页面切换

### 版本演进历史

| 版本         | 布局实现方式               | 特点                  | 限制                    |
| ------------ | -------------------------- | --------------------- | ----------------------- |
| Next.js 1-8  | `_document.js` + `_app.js` | 全局包装器            | 无嵌套布局,状态丢失     |
| Next.js 9-12 | `getLayout` 模式           | 自定义布局函数        | 需要手动管理,类型不安全 |
| Next.js 13   | App Router `layout.tsx`    | 文件系统布局,嵌套支持 | 初期稳定性问题          |
| Next.js 14   | 优化 layout                | Turbopack 加速        | 部分边缘情况            |
| Next.js 15   | Promise-based params       | 异步参数支持          | 破坏性变更              |
| Next.js 16   | 稳定的 layout API          | 完整类型推断,性能优化 | 当前最佳实践            |

---

## 第一部分:layout.js 基础概念

### 1.1 layout.js 文件结构

#### 基础语法

```typescript
// app/layout.tsx
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header>全局导航栏</header>
        <main>{children}</main>
        <footer>全局页脚</footer>
      </body>
    </html>
  );
}
```

#### 完整类型定义

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

// Metadata API
export const metadata: Metadata = {
  title: "我的应用",
  description: "Next.js 16 应用",
};

// Viewport API
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{}>; // 根布局通常无 params
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

### 1.2 根布局 (Root Layout)

根布局位于 `app/layout.tsx`,是唯一必需的布局文件,必须包含 `<html>` 和 `<body>` 标签。

#### 根布局要求

```typescript
// app/layout.tsx - 必需的根布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 全局提供者 */}
        <Providers>
          {/* 全局导航 */}
          <Navigation />

          {/* 主内容区域 */}
          <main className="min-h-screen">{children}</main>

          {/* 全局页脚 */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

#### 根布局的特殊规则

**1. 必需性规则**

```typescript
// ❌ 错误:缺少根布局会导致构建失败
// 必须有 app/layout.tsx

// ✅ 正确:始终提供根布局
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

**2. HTML 标签规则**

```typescript
// ❌ 错误:根布局必须包含 <html> 和 <body>
export default function RootLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

// ✅ 正确:完整的 HTML 结构
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

**3. Head 管理规则**

```typescript
// ❌ 错误:不要手动添加 <head> 标签
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <title>我的应用</title> {/* 错误! */}
      </head>
      <body>{children}</body>
    </html>
  );
}

// ✅ 正确:使用 Metadata API
export const metadata: Metadata = {
  title: "我的应用",
  description: "应用描述",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

### 1.3 嵌套布局 (Nested Layouts)

嵌套布局允许在应用的不同部分创建独立的布局层次。

#### 基础嵌套示例

```typescript
// app/layout.tsx - 根布局
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <GlobalHeader />
        {children}
        <GlobalFooter />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx - 仪表板布局
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}

// app/dashboard/settings/layout.tsx - 设置布局
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="settings-container">
      <SettingsSidebar />
      <div className="settings-content">{children}</div>
    </div>
  );
}
```

#### 嵌套层次示意

```
访问 /dashboard/settings/profile 时的渲染层次:

app/layout.tsx (根布局)
  └─ <html><body>
       └─ GlobalHeader
       └─ app/dashboard/layout.tsx (仪表板布局)
            └─ Sidebar
            └─ DashboardHeader
            └─ app/dashboard/settings/layout.tsx (设置布局)
                 └─ SettingsSidebar
                 └─ app/dashboard/settings/profile/page.tsx (页面)
                      └─ ProfileForm 组件
       └─ GlobalFooter
     </body></html>
```

### 1.4 布局的 Props

#### children 属性

`children` 是布局组件必需的 prop,代表嵌套的页面或子布局。

```typescript
// 基础 children 用法
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav>导航栏</nav>
      {children} {/* 渲染嵌套内容 */}
    </div>
  );
}
```

#### params 属性 (Next.js 15+)

从 Next.js 15 开始,`params` 成为 Promise 类型,必须使用 `await` 访问。

```typescript
// app/blog/[category]/layout.tsx
interface LayoutProps {
  children: ReactNode;
  params: Promise<{ category: string }>;
}

export default async function BlogCategoryLayout({
  children,
  params,
}: LayoutProps) {
  // Next.js 15+ 必须 await params
  const { category } = await params;

  return (
    <div>
      <h1>分类: {category}</h1>
      {children}
    </div>
  );
}
```

#### 完整示例:带类型的布局

```typescript
// app/shop/[category]/[product]/layout.tsx
import { ReactNode } from "react";

interface ProductLayoutProps {
  children: ReactNode;
  params: Promise<{
    category: string;
    product: string;
  }>;
}

export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { category, product } = await params;

  // 可以在布局中获取数据
  const productData = await fetchProduct(product);

  return (
    <div className="product-layout">
      <nav>
        <a href={`/shop/${category}`}>返回 {category}</a>
      </nav>

      <aside className="product-sidebar">
        <ProductInfo data={productData} />
      </aside>

      <main className="product-main">{children}</main>
    </div>
  );
}
```

### 1.5 布局的数据获取

布局可以是异步的服务端组件,支持直接获取数据。

#### 异步布局示例

```typescript
// app/dashboard/layout.tsx
async function getUser() {
  const res = await fetch("https://api.example.com/user", {
    cache: "force-cache", // 缓存用户数据
  });
  return res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="dashboard">
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  );
}
```

#### 数据缓存策略

```typescript
// 1. 强制缓存 (默认)
async function getData() {
  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache", // 等同于 getStaticProps
  });
  return res.json();
}

// 2. 不缓存 (每次请求都获取新数据)
async function getData() {
  const res = await fetch("https://api.example.com/data", {
    cache: "no-store", // 等同于 getServerSideProps
  });
  return res.json();
}

// 3. 定时重新验证
async function getData() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 }, // 每小时重新验证
  });
  return res.json();
}

// 4. 标签重新验证
async function getData() {
  const res = await fetch("https://api.example.com/data", {
    next: { tags: ["user-data"] }, // 使用标签控制重新验证
  });
  return res.json();
}
```

---

## 第二部分:layout.js 高级特性

### 2.1 并行路由插槽 (Parallel Route Slots)

并行路由允许在同一布局中同时渲染多个页面,非常适合复杂的仪表板界面。

#### 插槽基础概念

插槽是以 `@` 符号开头的特殊文件夹,例如 `@analytics`、`@team`。它们不影响 URL 结构,仅用于布局的组织。

```
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   └── page.tsx
└── @team/
    └── page.tsx
```

#### 插槽布局实现

```typescript
// app/layout.tsx
interface DashboardLayoutProps {
  children: ReactNode;
  analytics: ReactNode; // @analytics 插槽
  team: ReactNode; // @team 插槽
}

export default function DashboardLayout({
  children,
  analytics,
  team,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard-grid">
      {/* 主内容 */}
      <div className="main-content">{children}</div>

      {/* 分析数据插槽 */}
      <div className="analytics-panel">{analytics}</div>

      {/* 团队信息插槽 */}
      <div className="team-panel">{team}</div>
    </div>
  );
}
```

#### 插槽页面定义

```typescript
// app/@analytics/page.tsx
export default function AnalyticsSlot() {
  return (
    <div className="analytics">
      <h2>实时分析</h2>
      <AnalyticsChart />
    </div>
  );
}

// app/@team/page.tsx
export default function TeamSlot() {
  return (
    <div className="team">
      <h2>团队成员</h2>
      <TeamList />
    </div>
  );
}

// app/page.tsx - 主页面
export default function DashboardPage() {
  return (
    <div>
      <h1>仪表板概览</h1>
      <DashboardStats />
    </div>
  );
}
```

#### 条件渲染插槽

```typescript
// app/layout.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ConditionalLayout({
  children,
  analytics,
  team,
}: {
  children: ReactNode;
  analytics: ReactNode;
  team: ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="main">{children}</div>

      {/* 仅管理员可见 */}
      {user.role === "admin" && <div className="analytics">{analytics}</div>}

      {/* 所有用户可见 */}
      <div className="team">{team}</div>
    </div>
  );
}
```

#### default.js 后备页面

当插槽没有匹配的页面时,Next.js 会使用 `default.js` 作为后备。

```typescript
// app/@analytics/default.tsx
export default function AnalyticsDefault() {
  return <div>暂无分析数据</div>;
}

// app/@team/default.tsx
export default function TeamDefault() {
  return <div>暂无团队信息</div>;
}
```

#### 完整并行路由示例

```
app/
├── layout.tsx
├── page.tsx                    # /
├── @analytics/
│   ├── default.tsx
│   ├── page.tsx               # / (analytics slot)
│   └── settings/
│       └── page.tsx           # /settings (analytics slot)
└── @team/
    ├── default.tsx
    ├── page.tsx               # / (team slot)
    └── settings/
        └── page.tsx           # /settings (team slot)
```

```typescript
// app/layout.tsx - 并行布局
export default function RootLayout({
  children,
  analytics,
  team,
}: {
  children: ReactNode;
  analytics: ReactNode;
  team: ReactNode;
}) {
  return (
    <html>
      <body>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">{children}</div>
          <div>{analytics}</div>
          <div className="col-span-3">{team}</div>
        </div>
      </body>
    </html>
  );
}
```

### 2.2 路由组 (Route Groups)

路由组使用 `(folder)` 语法,允许组织路由而不影响 URL 路径。

#### 路由组基础

```
app/
├── (marketing)/
│   ├── layout.tsx          # 营销布局
│   ├── about/
│   │   └── page.tsx       # /about
│   └── blog/
│       └── page.tsx       # /blog
└── (shop)/
    ├── layout.tsx          # 商店布局
    ├── products/
    │   └── page.tsx       # /products
    └── cart/
        └── page.tsx       # /cart
```

#### 路由组布局实现

```typescript
// app/(marketing)/layout.tsx - 营销布局
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-layout">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}

// app/(shop)/layout.tsx - 商店布局
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shop-layout">
      <ShopHeader />
      <ShopSidebar />
      {children}
      <ShopFooter />
    </div>
  );
}
```

#### 多个根布局

路由组可以创建多个根布局,实现完全不同的 HTML 结构。

```
app/
├── (main)/
│   ├── layout.tsx          # 主应用根布局
│   ├── dashboard/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
└── (auth)/
    ├── layout.tsx          # 认证根布局
    ├── login/
    │   └── page.tsx
    └── register/
        └── page.tsx
```

```typescript
// app/(main)/layout.tsx - 主应用根布局
export default function MainRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="main-app">
        <Navigation />
        {children}
      </body>
    </html>
  );
}

// app/(auth)/layout.tsx - 认证根布局
export default function AuthRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="auth-app">
        <div className="auth-container">
          <Logo />
          {children}
        </div>
      </body>
    </html>
  );
}
```

**注意**: 在不同根布局之间导航会导致完整页面加载 (非客户端导航),因为浏览器需要完全重新加载 HTML 结构。

### 2.3 布局与 Metadata

布局可以导出 `metadata` 对象或 `generateMetadata` 函数来定义页面元数据。

#### 静态 Metadata

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "我的应用",
    template: "%s | 我的应用", // 子页面会使用此模板
  },
  description: "应用描述",
  keywords: ["Next.js", "React", "TypeScript"],
  authors: [{ name: "作者名" }],
  openGraph: {
    title: "我的应用",
    description: "应用描述",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

#### 动态 Metadata

```typescript
// app/blog/[slug]/layout.tsx
import type { Metadata } from "next";

interface BlogLayoutProps {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogLayout({
  children,
  params,
}: BlogLayoutProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <time>{post.publishedAt}</time>
      </header>
      {children}
    </article>
  );
}
```

#### Metadata 继承规则

```typescript
// app/layout.tsx - 根 Metadata
export const metadata: Metadata = {
  title: {
    default: "我的应用",
    template: "%s | 我的应用",
  },
  description: "默认描述",
};

// app/blog/layout.tsx - 继承并覆盖
export const metadata: Metadata = {
  title: "博客", // 使用模板: "博客 | 我的应用"
  description: "博客文章列表", // 覆盖默认描述
};

// app/blog/[slug]/page.tsx - 页面级 Metadata
export const metadata: Metadata = {
  title: "具体文章标题", // 使用模板: "具体文章标题 | 我的应用"
};
```

### 2.4 布局的客户端化

默认情况下,布局是服务端组件。如需客户端交互,可使用 `'use client'` 指令。

#### 客户端布局示例

```typescript
// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>切换侧边栏</button>

      {sidebarOpen && (
        <aside className="sidebar">
          <nav>
            <a
              href="/dashboard"
              className={pathname === "/dashboard" ? "active" : ""}
            >
              概览
            </a>
            <a
              href="/dashboard/analytics"
              className={pathname === "/dashboard/analytics" ? "active" : ""}
            >
              分析
            </a>
          </nav>
        </aside>
      )}

      <main>{children}</main>
    </div>
  );
}
```

#### 混合模式:服务端布局 + 客户端组件

```typescript
// app/layout.tsx - 服务端布局
import ClientSidebar from "@/components/ClientSidebar";

async function getUser() {
  const res = await fetch("https://api.example.com/user");
  return res.json();
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser(); // 服务端数据获取

  return (
    <html>
      <body>
        {/* 客户端侧边栏组件 */}
        <ClientSidebar user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

```typescript
// components/ClientSidebar.tsx - 客户端组件
"use client";

import { useState } from "react";

export default function ClientSidebar({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={isOpen ? "open" : "closed"}>
      <button onClick={() => setIsOpen(!isOpen)}>切换</button>
      <p>欢迎, {user.name}</p>
    </aside>
  );
}
```

### 2.5 布局性能优化

#### 懒加载组件

```typescript
// app/layout.tsx
import dynamic from "next/dynamic";

// 懒加载非关键组件
const ChatWidget = dynamic(() => import("@/components/ChatWidget"), {
  ssr: false,
  loading: () => <p>加载中...</p>,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget /> {/* 仅在客户端加载 */}
      </body>
    </html>
  );
}
```

#### Suspense 边界

```typescript
// app/dashboard/layout.tsx
import { Suspense } from "react";

async function UserInfo() {
  const user = await fetchUser();
  return <div>欢迎, {user.name}</div>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <aside>
        <Suspense fallback={<div>加载用户信息...</div>}>
          <UserInfo />
        </Suspense>
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

#### 条件渲染优化

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html>
      <body>
        {children}

        {/* 仅开发环境显示 */}
        {!isProduction && <DevTools />}

        {/* 仅生产环境显示 */}
        {isProduction && <Analytics />}
      </body>
    </html>
  );
}
```

---

## 第三部分:layout.js 实战应用

### 3.1 构建企业级应用布局

#### 多层级布局架构

```
app/
├── layout.tsx                    # 根布局
├── (public)/
│   ├── layout.tsx               # 公开页面布局
│   ├── page.tsx                 # 首页
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx               # 仪表板根布局
│   ├── overview/
│   │   └── page.tsx
│   ├── analytics/
│   │   ├── layout.tsx          # 分析布局
│   │   ├── page.tsx
│   │   └── reports/
│   │       └── page.tsx
│   └── settings/
│       ├── layout.tsx          # 设置布局
│       ├── page.tsx
│       ├── profile/
│       │   └── page.tsx
│       └── billing/
│           └── page.tsx
└── (auth)/
    ├── layout.tsx               # 认证布局
    ├── login/
    │   └── page.tsx
    └── register/
        └── page.tsx
```

#### 根布局实现

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "企业管理系统",
    template: "%s | 企业管理系统",
  },
  description: "全功能企业管理平台",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### 公开页面布局

```typescript
// app/(public)/layout.tsx
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main className="min-h-screen">{children}</main>
      <PublicFooter />
    </div>
  );
}
```

#### 仪表板布局

```typescript
// app/(dashboard)/layout.tsx
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 服务端认证检查
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar user={session.user} />

      <div className="dashboard-main">
        <DashboardHeader user={session.user} />

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
```

#### 设置布局

```typescript
// app/(dashboard)/settings/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const settingsNav = [
  { name: "个人资料", href: "/settings/profile" },
  { name: "账户安全", href: "/settings/security" },
  { name: "账单信息", href: "/settings/billing" },
  { name: "通知设置", href: "/settings/notifications" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <h2>设置</h2>
        <nav>
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="settings-content">{children}</div>
    </div>
  );
}
```

### 3.2 电商应用布局

#### 电商目录结构

```
app/
├── layout.tsx
├── (storefront)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   └── cart/
│       └── page.tsx
└── (account)/
    ├── layout.tsx
    ├── orders/
    │   └── page.tsx
    └── wishlist/
        └── page.tsx
```

#### 店面布局

```typescript
// app/(storefront)/layout.tsx
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import CartProvider from "@/providers/CartProvider";

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CartProvider>
      <div className="storefront-layout">
        <StoreHeader />
        <main className="min-h-screen">{children}</main>
        <StoreFooter />
      </div>
    </CartProvider>
  );
}
```

#### 产品详情布局

```typescript
// app/(storefront)/products/[id]/layout.tsx
interface ProductLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`);
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <div className="product-layout">
      <nav className="breadcrumb">
        <a href="/">首页</a> /<a href="/products">产品</a> /
        <span>{product.name}</span>
      </nav>

      <div className="product-container">{children}</div>

      <aside className="product-recommendations">
        <h3>相关产品</h3>
        <RelatedProducts productId={id} />
      </aside>
    </div>
  );
}
```

### 3.3 多语言应用布局

#### 国际化目录结构

```
app/
├── [lang]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
```

#### 多语言布局实现

```typescript
// app/[lang]/layout.tsx
import { i18n } from "@/i18n-config";

interface LangLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: {
      default: lang === "zh" ? "我的应用" : "My App",
      template: lang === "zh" ? "%s | 我的应用" : "%s | My App",
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { lang } = await params;

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body>
        <LanguageSwitcher currentLang={lang} />
        {children}
      </body>
    </html>
  );
}
```

#### 语言切换组件

```typescript
// components/LanguageSwitcher.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";

const languages = [
  { code: "zh", name: "中文" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
];

export default function LanguageSwitcher({
  currentLang,
}: {
  currentLang: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLang: string) => {
    const newPathname = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPathname);
  };

  return (
    <select
      value={currentLang}
      onChange={(e) => switchLanguage(e.target.value)}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### 3.4 博客应用布局

#### 博客目录结构

```
app/
├── layout.tsx
├── blog/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [slug]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── category/
│       └── [name]/
│           └── page.tsx
```

#### 博客列表布局

```typescript
// app/blog/layout.tsx
import BlogSidebar from "@/components/BlogSidebar";

export const metadata: Metadata = {
  title: "博客",
  description: "最新文章和技术分享",
};

async function getCategories() {
  const res = await fetch("https://api.example.com/categories");
  return res.json();
}

export default async function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="blog-layout">
      <div className="blog-main">{children}</div>

      <aside className="blog-sidebar">
        <BlogSidebar categories={categories} />
      </aside>
    </div>
  );
}
```

#### 文章详情布局

```typescript
// app/blog/[slug]/layout.tsx
interface PostLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

export default async function PostLayout({
  children,
  params,
}: PostLayoutProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article className="post-layout">
      <header className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <img src={post.author.avatar} alt={post.author.name} />
          <div>
            <p>{post.author.name}</p>
            <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
          </div>
        </div>
      </header>

      <div className="post-content">{children}</div>

      <footer className="post-footer">
        <ShareButtons url={`/blog/${slug}`} title={post.title} />
        <CommentSection postId={post.id} />
      </footer>
    </article>
  );
}
```

### 3.5 SaaS 应用布局

#### SaaS 目录结构

```
app/
├── layout.tsx
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   └── features/
│       └── page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── @notifications/
│   │   └── page.tsx
│   ├── @quickActions/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── projects/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── team/
│       └── page.tsx
└── (onboarding)/
    ├── layout.tsx
    ├── step-1/
    │   └── page.tsx
    ├── step-2/
    │   └── page.tsx
    └── step-3/
        └── page.tsx
```

#### SaaS 应用布局

```typescript
// app/(app)/layout.tsx
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

interface AppLayoutProps {
  children: ReactNode;
  notifications: ReactNode;
  quickActions: ReactNode;
}

export default async function AppLayout({
  children,
  notifications,
  quickActions,
}: AppLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // 检查用户是否完成入职流程
  if (!session.user.onboardingCompleted) {
    redirect("/onboarding/step-1");
  }

  return (
    <div className="app-layout">
      <AppSidebar user={session.user} />

      <div className="app-main">
        <AppHeader>
          <div className="header-actions">
            {notifications}
            {quickActions}
          </div>
        </AppHeader>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
```

#### 入职流程布局

```typescript
// app/(onboarding)/layout.tsx
"use client";

import { usePathname } from "next/navigation";

const steps = [
  { id: 1, name: "基本信息", path: "/onboarding/step-1" },
  { id: 2, name: "团队设置", path: "/onboarding/step-2" },
  { id: 3, name: "完成", path: "/onboarding/step-3" },
];

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = steps.find((step) => step.path === pathname);

  return (
    <div className="onboarding-layout">
      <div className="onboarding-progress">
        <h1>欢迎使用我们的平台</h1>

        <ol className="steps">
          {steps.map((step) => (
            <li
              key={step.id}
              className={step.id <= (currentStep?.id || 1) ? "active" : ""}
            >
              <span className="step-number">{step.id}</span>
              <span className="step-name">{step.name}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="onboarding-content">{children}</div>
    </div>
  );
}
```

---

## 第四部分:layout.js 与其他特殊文件

### 4.1 layout.js vs template.js

`layout.js` 和 `template.js` 的主要区别在于状态保持和重新渲染行为。

#### 对比表格

| 特性     | layout.js         | template.js        |
| -------- | ----------------- | ------------------ |
| 状态保持 | 导航时保持状态    | 每次导航创建新实例 |
| DOM 复用 | 复用 DOM 元素     | 重新创建 DOM       |
| 适用场景 | 共享 UI、状态保持 | 需要重置状态、动画 |
| 性能     | 更优              | 略低               |

#### layout.js 示例

```typescript
// app/dashboard/layout.tsx
"use client";

import { useState } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  // 导航时,count 值保持
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>点击次数: {count}</button>
      {children}
    </div>
  );
}
```

#### template.js 示例

```typescript
// app/dashboard/template.tsx
"use client";

import { useState } from "react";

export default function DashboardTemplate({
  children,
}: {
  children: ReactNode;
}) {
  const [count, setCount] = useState(0);

  // 导航时,count 值重置为 0
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>点击次数: {count}</button>
      {children}
    </div>
  );
}
```

#### 何时使用 template.js

```typescript
// 场景1: 页面进入动画
// app/template.tsx
"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// 场景2: 重置表单状态
// app/settings/template.tsx
("use client");

import { useEffect } from "react";

export default function SettingsTemplate({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // 每次导航都重置
    console.log("Settings template mounted");

    return () => {
      console.log("Settings template unmounted");
    };
  }, []);

  return <div>{children}</div>;
}
```

### 4.2 layout.js 与 loading.js

`loading.js` 与布局配合使用,提供加载状态。

#### 基础组合

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
    </div>
  );
}

// app/dashboard/page.tsx
async function getData() {
  const res = await fetch("https://api.example.com/dashboard");
  return res.json();
}

export default async function DashboardPage() {
  const data = await getData(); // loading.tsx 显示期间

  return (
    <div>
      <h1>仪表板</h1>
      <DashboardCards data={data} />
    </div>
  );
}
```

#### Suspense 边界

```typescript
// app/dashboard/layout.tsx
import { Suspense } from "react";

async function Sidebar() {
  const nav = await fetchNavigation();
  return <nav>{/* ... */}</nav>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      {/* 侧边栏独立加载 */}
      <Suspense fallback={<div>加载侧边栏...</div>}>
        <Sidebar />
      </Suspense>

      {/* 主内容区使用 loading.tsx */}
      <main>{children}</main>
    </div>
  );
}
```

### 4.3 layout.js 与 error.js

`error.js` 提供错误边界,与布局配合使用。

#### 错误边界示例

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/error.tsx
("use client");

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>仪表板加载失败</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

#### 嵌套错误边界

```typescript
// app/dashboard/analytics/layout.tsx
export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="analytics-layout">
      <AnalyticsHeader />
      {children}
    </div>
  );
}

// app/dashboard/analytics/error.tsx
("use client");

export default function AnalyticsError({ error, reset }: ErrorProps) {
  return (
    <div>
      <h3>分析数据加载失败</h3>
      <button onClick={reset}>重新加载</button>
    </div>
  );
}
```

---

## 适用场景

### 何时使用 layout.js

**1. 共享导航和页脚**

- 应用全局导航
- 统一页脚
- 面包屑导航

**2. 认证保护**

- 需要登录的页面组
- 权限检查
- 重定向逻辑

**3. 主题和样式**

- 一致的视觉风格
- 全局样式注入
- 字体加载

**4. 数据提供者**

- Context Providers
- 全局状态管理
- 用户信息共享

**5. 复杂布局结构**

- 多栏布局
- 固定侧边栏
- 响应式布局

### 何时使用嵌套布局

**1. 功能模块分组**

- 仪表板模块
- 设置模块
- 内容管理模块

**2. 不同的导航需求**

- 主导航 + 子导航
- 侧边栏 + 顶部栏
- 标签页导航

**3. 独立的数据获取**

- 模块级用户权限
- 特定的配置数据
- 区域性设置

### 何时使用并行路由

**1. 仪表板应用**

- 多个数据面板
- 实时更新组件
- 条件渲染区域

**2. 复杂的 UI 布局**

- 分屏视图
- 模态框与主内容
- 多个独立区域

**3. 独立加载状态**

- 不同组件的加载状态
- 独立的错误处理
- 分步数据加载

---

## 注意事项

### 1. 性能考虑

**布局数据获取**

```typescript
// ❌ 避免:在布局中获取页面级数据
export default async function Layout({ children }: { children: ReactNode }) {
  const posts = await fetchAllPosts(); // 过度获取
  return <div>{children}</div>;
}

// ✅ 推荐:仅获取布局所需数据
export default async function Layout({ children }: { children: ReactNode }) {
  const categories = await fetchCategories(); // 仅获取导航所需
  return (
    <div>
      <Nav categories={categories} />
      {children}
    </div>
  );
}
```

**避免过度嵌套**

```typescript
// ❌ 避免:过多的布局层级
app/
├── layout.tsx           # 第1层
├── dashboard/
│   ├── layout.tsx       # 第2层
│   ├── analytics/
│   │   ├── layout.tsx   # 第3层
│   │   ├── reports/
│   │   │   ├── layout.tsx   # 第4层 - 过深!
│   │   │   └── page.tsx

// ✅ 推荐:合理的布局层次
app/
├── layout.tsx           # 根布局
├── dashboard/
│   ├── layout.tsx       # 仪表板布局
│   └── analytics/
│       └── page.tsx     # 直接页面
```

### 2. 状态管理

**客户端状态**

```typescript
// ❌ 避免:在服务端布局中使用客户端状态
// app/layout.tsx
import { useState } from "react"; // 错误!

export default function RootLayout({ children }: { children: ReactNode }) {
  const [state, setState] = useState(0); // 服务端组件不能使用
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// ✅ 推荐:客户端布局或提取客户端组件
// app/layout.tsx
import ClientWrapper from "@/components/ClientWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}

// components/ClientWrapper.tsx
("use client");
export default function ClientWrapper({ children }: { children: ReactNode }) {
  const [state, setState] = useState(0);
  return <div>{children}</div>;
}
```

### 3. Metadata 管理

**避免冲突**

```typescript
// ❌ 避免:在根布局中使用 <title> 标签
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <title>我的应用</title> {/* 错误! */}
      </head>
      <body>{children}</body>
    </html>
  );
}

// ✅ 推荐:使用 Metadata API
export const metadata: Metadata = {
  title: "我的应用",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 4. 路由组使用

**多根布局导航**

```typescript
// 注意:不同根布局之间导航会触发完整页面加载

// app/(main)/layout.tsx
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className="main">{children}</body>
    </html>
  );
}

// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className="auth">{children}</body>
    </html>
  );
}

// 从 /dashboard 导航到 /login 会触发完整页面重新加载
// 因为两者使用不同的根布局
```

### 5. TypeScript 类型

**正确的类型定义**

```typescript
// ✅ 完整的类型定义
interface LayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { slug } = await params;
  return <div>{children}</div>;
}

// ❌ 避免:缺少 Promise 类型
interface LayoutProps {
  children: ReactNode;
  params: { slug: string }; // Next.js 15+ 中错误!
}
```

### 6. 并行路由注意事项

**默认后备**

```typescript
// 务必提供 default.tsx,避免 404
// app/@analytics/default.tsx
export default function AnalyticsDefault() {
  return null; // 或提供默认 UI
}
```

**导航行为**

```typescript
// 软导航:保持活动插槽状态
// 硬导航:如果没有匹配,渲染 default.tsx 或 404
```

---

## 常见问题

### Q1: 布局在导航时会重新渲染吗?

**答**: 不会。布局组件在路由切换时保持挂载状态,不会重新渲染。这是 `layout.js` 的核心优势之一。

```typescript
// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Dashboard layout mounted");
    // 仅在首次加载时执行,导航时不会重复执行
  }, []);

  return (
    <div>
      <p>布局计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      {children} {/* 导航时仅此部分更新 */}
    </div>
  );
}
```

### Q2: 如何在布局中访问当前路由信息?

**答**: 使用客户端钩子 `usePathname`, `useSearchParams` 等。

```typescript
// app/layout.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <html>
      <body>
        <nav>
          <a href="/" className={pathname === "/" ? "active" : ""}>
            首页
          </a>
          <a href="/about" className={pathname === "/about" ? "active" : ""}>
            关于
          </a>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

### Q3: 可以在布局中使用 Cookies 和 Headers 吗?

**答**: 可以,通过 `cookies()` 和 `headers()` 函数(仅服务端组件)。

```typescript
// app/layout.tsx
import { cookies, headers } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  return (
    <html data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

### Q4: 布局可以有自己的 Loading 和 Error 状态吗?

**答**: 可以使用 Suspense 和错误边界。

```typescript
// app/dashboard/layout.tsx
import { Suspense } from "react";

async function Sidebar() {
  const data = await fetchSidebarData();
  return <nav>{/* ... */}</nav>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <main>{children}</main>
    </div>
  );
}
```

### Q5: 如何在布局之间共享数据?

**答**: 使用 React Context 或直接传递 props(对于并行路由)。

```typescript
// app/layout.tsx
import { UserProvider } from "@/contexts/UserContext";

async function getUser() {
  const res = await fetch("https://api.example.com/user");
  return res.json();
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();

  return (
    <html>
      <body>
        <UserProvider initialUser={user}>{children}</UserProvider>
      </body>
    </html>
  );
}

// contexts/UserContext.tsx
("use client");

import { createContext, useContext, ReactNode } from "react";

const UserContext = createContext(null);

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User;
}) {
  return (
    <UserContext.Provider value={initialUser}>{children}</UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
```

### Q6: 布局能否重定向用户?

**答**: 可以,使用 `redirect()` 函数。

```typescript
// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login"); // 未登录重定向
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized"); // 权限不足重定向
  }

  return <div>{children}</div>;
}
```

### Q7: 如何优化布局的性能?

**答**: 使用以下策略:

1. **懒加载非关键组件**

```typescript
import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), {
  ssr: false,
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <ChatWidget />
    </div>
  );
}
```

2. **数据缓存**

```typescript
async function getNavigation() {
  const res = await fetch("https://api.example.com/nav", {
    next: { revalidate: 3600 }, // 缓存1小时
  });
  return res.json();
}
```

3. **Suspense 流式渲染**

```typescript
import { Suspense } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Suspense fallback={<NavSkeleton />}>
        <Navigation />
      </Suspense>
      {children}
    </div>
  );
}
```

### Q8: 布局和 Page 的 Metadata 如何合并?

**答**: 子路由的 metadata 会覆盖父路由的 metadata,但使用 `template` 可以继承。

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "我的应用",
    template: "%s | 我的应用", // 定义模板
  },
};

// app/blog/layout.tsx
export const metadata: Metadata = {
  title: "博客", // 最终为 "博客 | 我的应用"
};

// app/blog/[slug]/page.tsx
export const metadata: Metadata = {
  title: "具体文章", // 最终为 "具体文章 | 我的应用"
};
```

### Q9: 可以在一个路由段同时使用 layout.js 和 template.js 吗?

**答**: 可以,渲染顺序为 `Layout > Template > Page`。

```typescript
// 渲染层次:
// app/layout.tsx
//   └─ app/dashboard/layout.tsx
//        └─ app/dashboard/template.tsx
//             └─ app/dashboard/page.tsx

// template.tsx 会在每次导航时重新创建
// layout.tsx 保持挂载状态
```

### Q10: 如何在布局中处理错误?

**答**: 使用 `error.tsx` 文件或内嵌错误边界。

```typescript
// app/dashboard/layout.tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

async function Sidebar() {
  const data = await fetchSidebarData();
  return <nav>{/* ... */}</nav>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <ErrorBoundary fallback={<div>侧边栏加载失败</div>}>
        <Sidebar />
      </ErrorBoundary>

      <main>{children}</main>
    </div>
  );
}

// app/dashboard/error.tsx (整个布局的错误边界)
("use client");

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

---

## 总结

### 核心要点回顾

1. **布局的本质**

   - `layout.js` 是 App Router 中定义共享 UI 的特殊文件
   - 在导航时保持挂载,不重新渲染
   - 支持嵌套和数据获取

2. **必需的根布局**

   - 每个应用必须有 `app/layout.tsx`
   - 必须包含 `<html>` 和 `<body>` 标签
   - 不要手动添加 `<head>`,使用 Metadata API

3. **嵌套布局**

   - 支持任意深度的嵌套
   - 每层布局接收 `children` prop
   - 从外到内渲染

4. **并行路由**

   - 使用 `@folder` 语法定义插槽
   - 不影响 URL 结构
   - 适合复杂的仪表板布局

5. **路由组**

   - 使用 `(folder)` 语法组织路由
   - 不影响 URL 路径
   - 可创建多个根布局

6. **数据获取**

   - 布局可以是异步服务端组件
   - 支持 `fetch` 和数据库查询
   - 可配置缓存策略

7. **Metadata 管理**

   - 使用 `metadata` 对象或 `generateMetadata` 函数
   - 子路由继承并覆盖父路由的 metadata
   - 支持动态 metadata 生成

8. **性能优化**
   - 仅在布局中获取布局所需数据
   - 使用 Suspense 流式渲染
   - 懒加载非关键组件

### 最佳实践建议

1. **合理组织布局层次**

   - 避免过度嵌套(建议不超过 3-4 层)
   - 根据功能模块划分布局
   - 使用路由组进行逻辑分组

2. **优化数据获取**

   - 在布局中仅获取共享数据
   - 使用适当的缓存策略
   - 避免在布局中获取页面级数据

3. **类型安全**

   - 始终为 props 定义 TypeScript 类型
   - 记住 Next.js 15+ 中 `params` 是 Promise
   - 使用 `Metadata` 类型确保类型安全

4. **状态管理**

   - 服务端组件用于数据获取
   - 客户端组件用于交互状态
   - 使用 Context 共享全局状态

5. **错误处理**
   - 提供 `error.tsx` 边界
   - 使用 Suspense 处理加载状态
   - 为并行路由提供 `default.tsx`

---

**下一篇**: [01-04-page.js 文件作用与使用](./01-04-page.js文件作用与使用.md)将深入讲解页面文件的定义和使用方法。

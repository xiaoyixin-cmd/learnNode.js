**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 路由组 Route Groups 详解

## 1. 概述

路由组（Route Groups）是 Next.js App Router 中一个强大的组织工具，允许开发者在不影响 URL 结构的情况下对路由进行逻辑分组。通过使用括号命名的文件夹（如 `(marketing)` 或 `(shop)`），可以将相关路由组织在一起，共享布局、加载状态和错误处理，同时保持 URL 的简洁性。

### 1.1 核心价值

路由组解决了大型应用中路由组织的核心痛点：

- **逻辑分组**：将相关路由组织在一起，提高代码可维护性
- **URL 透明**：分组不会影响最终的 URL 路径
- **布局共享**：同组路由可以共享特定的布局和逻辑
- **团队协作**：不同团队可以独立管理各自的路由组
- **代码隔离**：实现更好的关注点分离

### 1.2 设计理念

路由组的设计遵循以下原则：

1. **约定优于配置**：通过文件夹命名约定实现功能
2. **零运行时开销**：纯粹的构建时特性
3. **灵活性**：支持嵌套和多层级组织
4. **向后兼容**：不影响现有路由系统

## 2. 核心概念与原理

### 2.1 工作机制

路由组通过特殊的文件夹命名约定工作：

**基本语法**：

```
app/
├── (marketing)/          # 路由组：营销相关页面
│   ├── layout.tsx        # 营销页面共享布局
│   ├── about/
│   │   └── page.tsx      # URL: /about
│   └── blog/
│       └── page.tsx      # URL: /blog
├── (shop)/               # 路由组：商店相关页面
│   ├── layout.tsx        # 商店页面共享布局
│   ├── products/
│   │   └── page.tsx      # URL: /products
│   └── cart/
│       └── page.tsx      # URL: /cart
└── page.tsx              # URL: /
```

**关键特性**：

1. **括号命名**：文件夹名使用括号包裹，如 `(group-name)`
2. **URL 忽略**：路由组名称不会出现在 URL 中
3. **布局隔离**：每个路由组可以有独立的 `layout.tsx`
4. **嵌套支持**：路由组可以嵌套使用

### 2.2 路由解析流程

Next.js 在构建时处理路由组的流程：

```
1. 扫描 app 目录
   ↓
2. 识别括号命名的文件夹
   ↓
3. 从 URL 路径中移除路由组名称
   ↓
4. 保留路由组内的布局和配置
   ↓
5. 生成最终的路由映射表
```

**示例解析**：

```typescript
// 文件路径: app/(marketing)/about/page.tsx
// 最终 URL: /about (不包含 (marketing))

// 文件路径: app/(shop)/products/[id]/page.tsx
// 最终 URL: /products/[id] (不包含 (shop))
```

### 2.3 布局继承规则

路由组的布局继承遵循以下规则：

```
app/
├── layout.tsx                    # 根布局（所有页面）
├── (marketing)/
│   ├── layout.tsx                # 营销布局（仅营销页面）
│   └── about/
│       ├── layout.tsx            # About 布局（仅 about 页面）
│       └── page.tsx
└── (shop)/
    ├── layout.tsx                # 商店布局（仅商店页面）
    └── products/
        └── page.tsx
```

**继承链**：

- `/about` 页面：根布局 → 营销布局 → About 布局 → 页面
- `/products` 页面：根布局 → 商店布局 → 页面

## 3. 适用场景

### 3.1 典型应用案例

#### 场景一：多布局应用

当应用需要完全不同的布局风格时：

```typescript
// app/(auth)/layout.tsx
// 认证页面的简洁布局
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">{children}</div>
    </div>
  );
}

// app/(dashboard)/layout.tsx
// 仪表板的复杂布局
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        {children}
      </main>
    </div>
  );
}
```

**目录结构**:

```
app/
├── (auth)/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx          # URL: /login
│   └── register/
│       └── page.tsx          # URL: /register
└── (dashboard)/
    ├── layout.tsx
    ├── overview/
    │   └── page.tsx          # URL: /overview
    └── settings/
        └── page.tsx          # URL: /settings
```

#### 场景二:团队协作

大型团队可以按功能模块分组:

```
app/
├── (team-marketing)/
│   ├── layout.tsx
│   ├── blog/
│   │   └── page.tsx
│   └── landing/
│       └── page.tsx
├── (team-product)/
│   ├── layout.tsx
│   ├── features/
│   │   └── page.tsx
│   └── pricing/
│       └── page.tsx
└── (team-support)/
    ├── layout.tsx
    ├── docs/
    │   └── page.tsx
    └── contact/
        └── page.tsx
```

**优势**:

- 每个团队独立管理自己的路由组
- 避免文件冲突
- 清晰的代码所有权
- 独立的布局和样式

#### 场景三:多语言网站

按语言分组路由:

```tsx
// app/(en)/layout.tsx
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en">
      <nav>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      {children}
    </div>
  );
}

// app/(zh)/layout.tsx
export default function ChineseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="zh">
      <nav>
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
      </nav>
      {children}
    </div>
  );
}
```

**目录结构**:

```
app/
├── (en)/
│   ├── layout.tsx
│   ├── about/
│   │   └── page.tsx          # URL: /about (English)
│   └── contact/
│       └── page.tsx          # URL: /contact (English)
└── (zh)/
    ├── layout.tsx
    ├── about/
    │   └── page.tsx          # URL: /about (Chinese)
    └── contact/
        └── page.tsx          # URL: /contact (Chinese)
```

#### 场景四:A/B 测试

为不同版本创建路由组:

```
app/
├── (variant-a)/
│   ├── layout.tsx            # 版本 A 布局
│   └── landing/
│       └── page.tsx          # URL: /landing (版本 A)
└── (variant-b)/
    ├── layout.tsx            # 版本 B 布局
    └── landing/
        └── page.tsx          # URL: /landing (版本 B)
```

**实现示例**:

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 根据 cookie 或随机分配决定版本
  const variant =
    request.cookies.get("ab-test")?.value || (Math.random() > 0.5 ? "a" : "b");

  if (request.nextUrl.pathname === "/landing") {
    const url = request.nextUrl.clone();
    url.pathname =
      variant === "a" ? "/(variant-a)/landing" : "/(variant-b)/landing";
    return NextResponse.rewrite(url);
  }
}
```

#### 场景五:移动端和桌面端

根据设备类型分组:

```
app/
├── (mobile)/
│   ├── layout.tsx            # 移动端布局
│   ├── home/
│   │   └── page.tsx          # URL: /home (移动端)
│   └── products/
│       └── page.tsx          # URL: /products (移动端)
└── (desktop)/
    ├── layout.tsx            # 桌面端布局
    ├── home/
    │   └── page.tsx          # URL: /home (桌面端)
    └── products/
        └── page.tsx          # URL: /products (桌面端)
```

#### 场景六:权限分组

按用户权限分组路由:

```
app/
├── (public)/
│   ├── layout.tsx
│   ├── home/
│   │   └── page.tsx
│   └── about/
│       └── page.tsx
├── (authenticated)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
└── (admin)/
    ├── layout.tsx
    ├── users/
    │   └── page.tsx
    └── settings/
        └── page.tsx
```

**权限检查示例**:

```tsx
// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.isAdmin) {
    redirect("/login");
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      {children}
    </div>
  );
}
```

---

## 4. API 签名与配置

### 4.1 路由组命名规则

路由组的命名必须遵循以下规则:

| 规则       | 说明             | 示例                  |
| :--------- | :--------------- | :-------------------- |
| 括号包裹   | 必须使用圆括号   | `(marketing)` ✅      |
| 小写字母   | 推荐使用小写     | `(auth)` ✅           |
| 连字符     | 可以使用连字符   | `(team-marketing)` ✅ |
| 下划线     | 可以使用下划线   | `(user_dashboard)` ✅ |
| 不能为空   | 括号内必须有内容 | `()` ❌               |
| 不能有空格 | 不能包含空格     | `(my group)` ❌       |

### 4.2 Layout 组件配置

路由组中的 Layout 组件签名:

```tsx
// app/(group)/layout.tsx
export default function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ [key: string]: string | string[] }>;
}) {
  return <>{children}</>;
}
```

**参数说明**:

- `children`: 子路由的内容
- `params`: 动态路由参数(可选)

### 4.3 元数据配置

为路由组配置元数据:

```tsx
// app/(marketing)/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Marketing",
    default: "Marketing",
  },
  description: "Marketing pages",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### 4.4 路由段配置

路由组可以配置路由段选项:

```tsx
// app/(api)/layout.tsx
export const dynamic = "force-dynamic";
export const runtime = "edge";
export const preferredRegion = "auto";

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**可用配置**:

| 配置项            | 类型                                                                                                                      | 说明             |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------ | :--------------- |
| `dynamic`         | `'auto' \| 'force-dynamic' \| 'force-static'`                                                                             | 渲染模式         |
| `dynamicParams`   | `boolean`                                                                                                                 | 是否允许动态参数 |
| `revalidate`      | `number \| false`                                                                                                         | 重新验证时间     |
| `fetchCache`      | `'auto' \| 'default-cache' \| 'only-cache' \| 'force-cache' \| 'force-no-store' \| 'default-no-store' \| 'only-no-store'` | 缓存策略         |
| `runtime`         | `'nodejs' \| 'edge'`                                                                                                      | 运行时环境       |
| `preferredRegion` | `string \| string[]`                                                                                                      | 首选区域         |

---

## 5. 基础与进阶使用

### 5.1 基础:简单路由分组

最基本的路由组使用:

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── about/
│   │   └── page.tsx
│   └── blog/
│       └── page.tsx
└── (shop)/
    ├── layout.tsx
    ├── products/
    │   └── page.tsx
    └── cart/
        └── page.tsx
```

**实现**:

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      <header>营销页面头部</header>
      {children}
      <footer>营销页面底部</footer>
    </div>
  );
}

// app/(shop)/layout.tsx
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-layout">
      <nav>商店导航</nav>
      {children}
    </div>
  );
}
```

### 5.2 进阶:嵌套路由组

路由组可以嵌套使用:

```
app/
├── (main)/
│   ├── layout.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── about/
│   │   │   └── page.tsx      # URL: /about
│   │   └── blog/
│   │       └── page.tsx      # URL: /blog
│   └── (shop)/
│       ├── layout.tsx
│       ├── products/
│       │   └── page.tsx      # URL: /products
│       └── cart/
│           └── page.tsx      # URL: /cart
└── (admin)/
    ├── layout.tsx
    ├── dashboard/
    │   └── page.tsx          # URL: /dashboard
    └── users/
        └── page.tsx          # URL: /users
```

**实现**:

```tsx
// app/(main)/layout.tsx
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="main-layout">
      <MainHeader />
      {children}
      <MainFooter />
    </div>
  );
}

// app/(main)/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-section">
      <MarketingNav />
      {children}
    </div>
  );
}

// app/(admin)/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
}
```

### 5.3 进阶:多根布局

使用路由组创建多个根布局:

```
app/
├── (website)/
│   ├── layout.tsx            # 网站根布局
│   ├── page.tsx              # URL: /
│   └── about/
│       └── page.tsx          # URL: /about
└── (app)/
    ├── layout.tsx            # 应用根布局
    ├── dashboard/
    │   └── page.tsx          # URL: /dashboard
    └── settings/
        └── page.tsx          # URL: /settings
```

**实现**:

```tsx
// app/(website)/layout.tsx
export default function WebsiteRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="website-theme">
        <WebsiteHeader />
        {children}
        <WebsiteFooter />
      </body>
    </html>
  );
}

// app/(app)/layout.tsx
export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="app-theme">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

### 5.4 进阶:条件路由组

根据条件动态选择路由组:

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  // 根据设备类型重写到不同的路由组
  if (request.nextUrl.pathname === "/home") {
    const url = request.nextUrl.clone();
    url.pathname = isMobile ? "/(mobile)/home" : "/(desktop)/home";
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/home"],
};
```

### 5.5 进阶:路由组与动态路由结合

路由组可以包含动态路由:

```
app/
├── (blog)/
│   ├── layout.tsx
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx      # URL: /posts/[slug]
│   └── categories/
│       └── [category]/
│           └── page.tsx      # URL: /categories/[category]
└── (shop)/
    ├── layout.tsx
    └── products/
        └── [id]/
            └── page.tsx      # URL: /products/[id]
```

**实现**:

```tsx
// app/(blog)/posts/[slug]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <article>
      <h1>文章: {slug}</h1>
    </article>
  );
}

// app/(shop)/products/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>产品: {id}</h1>
    </div>
  );
}
```

### 5.6 进阶:路由组与并行路由结合

路由组可以与并行路由一起使用:

```
app/
├── (dashboard)/
│   ├── layout.tsx
│   └── analytics/
│       ├── @charts/
│       │   └── page.tsx
│       ├── @stats/
│       │   └── page.tsx
│       ├── layout.tsx
│       └── page.tsx          # URL: /analytics
```

**实现**:

```tsx
// app/(dashboard)/analytics/layout.tsx
export default function AnalyticsLayout({
  children,
  charts,
  stats,
}: {
  children: React.ReactNode;
  charts: React.ReactNode;
  stats: React.ReactNode;
}) {
  return (
    <div className="analytics-layout">
      <div className="stats-section">{stats}</div>
      <div className="charts-section">{charts}</div>
      <div className="main-content">{children}</div>
    </div>
  );
}
```

### 5.7 进阶:路由组与拦截路由结合

路由组可以包含拦截路由:

```
app/
├── (gallery)/
│   ├── layout.tsx
│   ├── photos/
│   │   ├── [id]/
│   │   │   └── page.tsx      # URL: /photos/[id]
│   │   └── page.tsx          # URL: /photos
│   └── @modal/
│       └── (.)photos/
│           └── [id]/
│               └── page.tsx  # 拦截 /photos/[id]
```

### 5.8 进阶:共享组件和工具

在路由组内共享组件和工具:

```
app/
├── (dashboard)/
│   ├── _components/          # 下划线前缀,不会成为路由
│   │   ├── DashboardCard.tsx
│   │   └── DashboardChart.tsx
│   ├── _lib/
│   │   └── utils.ts
│   ├── layout.tsx
│   ├── overview/
│   │   └── page.tsx
│   └── analytics/
│       └── page.tsx
```

**使用共享组件**:

```tsx
// app/(dashboard)/overview/page.tsx
import { DashboardCard } from "../_components/DashboardCard";
import { formatData } from "../_lib/utils";

export default function OverviewPage() {
  return (
    <div>
      <DashboardCard title="总览" />
    </div>
  );
}
```

---

## 6. 注意事项

### 6.1 路由组不影响 URL

路由组名称不会出现在 URL 中:

```tsx
// 文件路径: app/(marketing)/about/page.tsx
// URL: /about (不是 /(marketing)/about)

// 文件路径: app/(shop)/products/page.tsx
// URL: /products (不是 /(shop)/products)
```

### 6.2 同一路由不能在多个路由组中

同一个 URL 路径不能在多个路由组中定义:

```
// 错误 - 冲突的路由
app/
├── (group-a)/
│   └── about/
│       └── page.tsx          # URL: /about
└── (group-b)/
    └── about/
        └── page.tsx          # URL: /about (冲突!)
```

这会导致构建错误,因为 Next.js 无法确定使用哪个页面。

### 6.3 路由组的布局不会自动合并

每个路由组的布局是独立的:

```tsx
// app/(group-a)/layout.tsx
export default function GroupALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="group-a">{children}</div>;
}

// app/(group-b)/layout.tsx
export default function GroupBLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="group-b">{children}</div>;
}

// 这两个布局不会合并,每个路由组使用自己的布局
```

### 6.4 根布局的特殊性

如果使用路由组创建多个根布局,每个根布局必须包含 `<html>` 和 `<body>` 标签:

```tsx
// app/(website)/layout.tsx
export default function WebsiteLayout({
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

// app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
```

### 6.5 路由组命名限制

路由组名称有一些限制:

```
✅ 正确:
(marketing)
(team-a)
(user_dashboard)
(v2)

❌ 错误:
()                    # 空名称
(my group)            # 包含空格
(group/name)          # 包含斜杠
```

### 6.6 路由组与 SEO

路由组不影响 SEO,因为它们不出现在 URL 中:

```tsx
// app/(marketing)/blog/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "博客",
  description: "我们的博客文章",
};

// URL 仍然是 /blog,搜索引擎看到的也是 /blog
```

### 6.7 路由组的性能影响

路由组是纯粹的构建时特性,没有运行时开销:

```tsx
// 路由组在构建时被处理
// 不会增加客户端 JavaScript 包大小
// 不会影响页面加载性能
```

### 6.8 路由组与中间件

在中间件中处理路由组时要注意:

```tsx
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // pathname 不包含路由组名称
  console.log(request.nextUrl.pathname); // /about (不是 /(marketing)/about)

  // 重写时需要包含路由组
  if (request.nextUrl.pathname === "/about") {
    const url = request.nextUrl.clone();
    url.pathname = "/(marketing)/about"; // 需要完整路径
    return NextResponse.rewrite(url);
  }
}
```

---

## 7. 常见问题

### 7.1 如何在路由组之间共享布局?

**问题**: 多个路由组需要共享相同的布局。

**解决方案**: 使用根布局或创建共享的父路由组:

```
app/
├── layout.tsx                # 根布局(所有路由组共享)
├── (group-a)/
│   ├── layout.tsx            # Group A 特定布局
│   └── page-a/
│       └── page.tsx
└── (group-b)/
    ├── layout.tsx            # Group B 特定布局
    └── page-b/
        └── page.tsx
```

或者使用嵌套路由组:

```
app/
└── (shared)/
    ├── layout.tsx            # 共享布局
    ├── (group-a)/
    │   └── page-a/
    │       └── page.tsx
    └── (group-b)/
        └── page-b/
            └── page.tsx
```

### 7.2 路由组可以有自己的 loading.tsx 吗?

**问题**: 想为路由组设置统一的加载状态。

**回答**: 可以,路由组可以有自己的 `loading.tsx`:

```
app/
└── (dashboard)/
    ├── layout.tsx
    ├── loading.tsx           # Dashboard 路由组的加载状态
    ├── overview/
    │   └── page.tsx
    └── analytics/
        └── page.tsx
```

```tsx
// app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="dashboard-loading">
      <Spinner />
      <p>加载仪表板...</p>
    </div>
  );
}
```

### 7.3 路由组可以有自己的 error.tsx 吗?

**问题**: 想为路由组设置统一的错误处理。

**回答**: 可以,路由组可以有自己的 `error.tsx`:

```
app/
└── (api)/
    ├── layout.tsx
    ├── error.tsx             # API 路由组的错误处理
    ├── users/
    │   └── page.tsx
    └── posts/
        └── page.tsx
```

```tsx
// app/(api)/error.tsx
"use client";

export default function ApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="api-error">
      <h2>API 错误</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 7.4 如何在路由组之间导航?

**问题**: 如何在不同路由组的页面之间导航?

**回答**: 使用正常的 URL 路径,不需要包含路由组名称:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  return (
    <nav>
      {/* 使用 Link */}
      <Link href="/about">关于</Link>
      <Link href="/products">产品</Link>

      {/* 使用 router */}
      <button onClick={() => router.push("/about")}>前往关于页面</button>
    </nav>
  );
}
```

### 7.5 路由组可以嵌套多少层?

**问题**: 路由组的嵌套层级有限制吗?

**回答**: 理论上没有限制,但建议不超过 2-3 层:

```
// 可以,但不推荐
app/
└── (level-1)/
    └── (level-2)/
        └── (level-3)/
            └── (level-4)/
                └── page/
                    └── page.tsx

// 推荐
app/
└── (main)/
    └── (dashboard)/
        └── analytics/
            └── page.tsx
```

### 7.6 路由组与国际化如何配合?

**问题**: 如何在路由组中实现国际化?

**解决方案**: 结合路由组和动态路由:

```
app/
├── [lang]/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── about/
│   │   │   └── page.tsx      # URL: /en/about, /zh/about
│   │   └── blog/
│   │       └── page.tsx      # URL: /en/blog, /zh/blog
│   └── (shop)/
│       ├── layout.tsx
│       └── products/
│           └── page.tsx      # URL: /en/products, /zh/products
```

```tsx
// app/[lang]/(marketing)/layout.tsx
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return <div lang={lang}>{children}</div>;
}
```

### 7.7 路由组会影响静态生成吗?

**问题**: 路由组是否影响 `generateStaticParams`?

**回答**: 不影响,路由组在构建时被移除:

```tsx
// app/(blog)/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 生成的路径: /posts/post-1, /posts/post-2
// 不是: /(blog)/posts/post-1
```

### 7.8 如何调试路由组?

**问题**: 如何查看路由组的实际路由结构?

**解决方案**: 使用 Next.js 的构建输出:

```bash
npm run build
```

构建输出会显示所有路由:

```
Route (app)                                Size
┌ ○ /                                      1.2 kB
├ ○ /about                                 1.5 kB
├ ○ /blog                                  2.1 kB
├ ○ /products                              1.8 kB
└ ○ /dashboard                             2.3 kB
```

或者在开发模式下检查 `.next` 目录:

```
.next/
└── server/
    └── app/
        ├── about/
        ├── blog/
        └── products/
```

---

## 8. 总结

路由组是 Next.js App Router 中一个强大的组织工具,通过本章学习,你应该掌握了:

**核心概念**:

1. **括号命名**: 使用 `(group-name)` 创建路由组
2. **URL 透明**: 路由组名称不出现在 URL 中
3. **布局隔离**: 每个路由组可以有独立的布局
4. **灵活嵌套**: 支持多层嵌套和组合

**实际应用**:

- 多布局应用(认证页面 vs 仪表板)
- 团队协作(按功能模块分组)
- 多语言网站(按语言分组)
- A/B 测试(不同版本)
- 权限分组(公开 vs 认证 vs 管理员)

**最佳实践**:

- 使用语义化的路由组名称
- 避免过深的嵌套层级
- 合理规划路由组的布局继承
- 利用路由组实现代码隔离
- 结合中间件实现动态路由选择

**注意事项**:

- 路由组不影响 URL 结构
- 同一路由不能在多个路由组中
- 根布局必须包含 html 和 body 标签
- 路由组是构建时特性,无运行时开销
- 在中间件中处理时需要完整路径

通过合理使用路由组,可以构建结构清晰、易于维护的大型 Next.js 应用。路由组让代码组织变得更加灵活,同时保持了 URL 的简洁性。

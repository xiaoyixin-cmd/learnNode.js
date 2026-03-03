**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 布局去重 Layout Deduplication

## 1. 概述

布局去重(Layout Deduplication)是 Next.js 16 引入的一项重要性能优化特性。在路由导航时,Next.js 会智能地识别哪些布局组件在新旧路由之间是共享的,只重新渲染发生变化的部分,而保持共享布局的状态和 DOM 结构不变。

### 1.1 概念定义

布局去重指的是在客户端导航过程中,Next.js 自动检测并复用未发生变化的布局组件,避免不必要的重新渲染和状态重置。

**关键特征**:

- **自动检测**: Next.js 自动识别共享布局,无需手动配置
- **状态保持**: 共享布局的组件状态在导航时保持不变
- **DOM 复用**: 不重新创建 DOM 节点,只更新变化的部分
- **性能优化**: 减少渲染开销,提升导航速度

**工作原理**:

```
导航前: /dashboard/analytics
布局树: RootLayout > DashboardLayout > AnalyticsPage

导航后: /dashboard/settings
布局树: RootLayout > DashboardLayout > SettingsPage

去重结果:
- RootLayout: 复用 ✓
- DashboardLayout: 复用 ✓
- Page: 重新渲染 (AnalyticsPage → SettingsPage)
```

### 1.2 核心价值

**提升导航性能**:

传统的页面导航会重新渲染整个组件树,即使大部分布局没有变化。布局去重只渲染变化的部分,大幅提升导航速度,用户体验更流畅。

**保持组件状态**:

在导航时,共享布局中的组件状态(如侧边栏的展开/折叠状态、表单输入等)会被保留,用户不会因为导航而丢失这些状态。

**减少闪烁**:

由于 DOM 节点被复用,导航时不会出现布局闪烁或重新加载的视觉效果,页面过渡更加平滑。

**降低资源消耗**:

减少不必要的组件创建和销毁,降低内存占用和 CPU 使用率,特别是在复杂布局中效果明显。

### 1.3 布局层级示例

```
app/
├── layout.tsx                    # Level 0: Root Layout
├── page.tsx
├── dashboard/
│   ├── layout.tsx                # Level 1: Dashboard Layout
│   ├── page.tsx
│   ├── analytics/
│   │   └── page.tsx              # Level 2: Analytics Page
│   └── settings/
│       └── page.tsx              # Level 2: Settings Page
└── blog/
    ├── layout.tsx                # Level 1: Blog Layout
    └── [slug]/
        └── page.tsx              # Level 2: Blog Post Page
```

**导航场景分析**:

| 导航路径                                       | 复用的布局                    | 重新渲染的部分              |
| :--------------------------------------------- | :---------------------------- | :-------------------------- |
| `/dashboard/analytics` → `/dashboard/settings` | Root Layout, Dashboard Layout | Page 组件                   |
| `/dashboard` → `/blog/post-1`                  | Root Layout                   | Blog Layout, Page 组件      |
| `/blog/post-1` → `/blog/post-2`                | Root Layout, Blog Layout      | Page 组件                   |
| `/` → `/dashboard`                             | Root Layout                   | Dashboard Layout, Page 组件 |

---

## 2. 核心概念与原理

### 2.1 布局树的构建

Next.js 在渲染时会构建一个布局树,每个路由对应一个布局树路径:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/analytics/page.tsx
export default function AnalyticsPage() {
  return <div>Analytics</div>;
}
```

**布局树结构**:

```
RootLayout
  ├─ Header
  ├─ DashboardLayout
  │   ├─ Sidebar
  │   └─ AnalyticsPage
  └─ Footer
```

### 2.2 去重算法

Next.js 使用以下算法进行布局去重:

1. **比较路由段**: 比较新旧路由的每个段
2. **识别共同前缀**: 找出共同的路由段
3. **复用共享布局**: 保持共同前缀对应的布局组件
4. **重新渲染差异**: 只渲染不同的部分

**示例**:

```tsx
// 从 /dashboard/analytics 导航到 /dashboard/settings

旧路由: ['dashboard', 'analytics']
新路由: ['dashboard', 'settings']

共同前缀: ['dashboard']
差异部分: 'analytics' → 'settings'

复用: RootLayout, DashboardLayout
重新渲染: Page (analytics → settings)
```

### 2.3 状态保持机制

共享布局中的 React 状态会在导航时保持:

```tsx
// app/dashboard/layout.tsx
"use client";

import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main>{children}</main>
    </div>
  );
}
```

**导航行为**:

- 从 `/dashboard/analytics` 到 `/dashboard/settings`
- `sidebarOpen` 状态保持不变
- 用户打开的侧边栏不会因导航而关闭

### 2.4 DOM 复用

Next.js 复用 DOM 节点而不是重新创建:

```tsx
// 导航前
<div class="dashboard">
  <aside class="sidebar">...</aside>
  <main>
    <div>Analytics Content</div>  <!-- 旧内容 -->
  </main>
</div>

// 导航后
<div class="dashboard">              <!-- 复用 -->
  <aside class="sidebar">...</aside>  <!-- 复用 -->
  <main>                              <!-- 复用 -->
    <div>Settings Content</div>       <!-- 新内容 -->
  </main>
</div>
```

**优势**:

- 不触发布局重排(reflow)
- 不重新计算样式
- 动画和过渡效果更流畅
- 减少内存分配

---

## 3. 适用场景

### 3.1 多页面仪表板

**场景**: 仪表板应用有多个子页面,共享相同的侧边栏和顶部导航。

```tsx
// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <aside className={sidebarCollapsed ? "collapsed" : ""}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          切换侧边栏
        </button>
        <nav>
          <Link href="/dashboard">概览</Link>
          <Link href="/dashboard/analytics">分析</Link>
          <Link href="/dashboard/reports">报告</Link>
          <Link href="/dashboard/settings">设置</Link>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

**去重效果**:

- 在仪表板子页面之间导航时,侧边栏状态保持
- 用户折叠侧边栏后,切换页面时侧边栏仍然是折叠状态
- 不会出现侧边栏闪烁或重新渲染

### 3.2 电商网站分类浏览

**场景**: 电商网站的商品分类页面,共享筛选器和排序组件。

```tsx
// app/products/layout.tsx
"use client";

import { useState } from "react";

export default function ProductsLayout({ children }) {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [],
    rating: 0,
  });

  return (
    <div className="products-page">
      <aside className="filters">
        <h3>筛选</h3>
        <PriceRangeFilter
          value={filters.priceRange}
          onChange={(range) => setFilters({ ...filters, priceRange: range })}
        />
        <BrandFilter
          value={filters.brands}
          onChange={(brands) => setFilters({ ...filters, brands })}
        />
        <RatingFilter
          value={filters.rating}
          onChange={(rating) => setFilters({ ...filters, rating })}
        />
      </aside>
      <main>{children}</main>
    </div>
  );
}

// app/products/[category]/page.tsx
export default function CategoryPage({ params }) {
  return <ProductList category={params.category} />;
}
```

**去重效果**:

- 在不同分类之间切换时,筛选器状态保持
- 用户设置的价格范围、品牌选择等不会丢失
- 提升用户体验,避免重复设置筛选条件

### 3.3 文档网站导航

**场景**: 文档网站有多级目录,共享侧边栏导航。

```tsx
// app/docs/layout.tsx
"use client";

import { useState } from "react";

export default function DocsLayout({ children }) {
  const [expandedSections, setExpandedSections] = useState(["getting-started"]);

  function toggleSection(section: string) {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }

  return (
    <div className="docs-container">
      <aside className="sidebar">
        <nav>
          <Section
            title="快速开始"
            id="getting-started"
            expanded={expandedSections.includes("getting-started")}
            onToggle={() => toggleSection("getting-started")}
          >
            <Link href="/docs/installation">安装</Link>
            <Link href="/docs/setup">配置</Link>
          </Section>
          <Section
            title="核心概念"
            id="core-concepts"
            expanded={expandedSections.includes("core-concepts")}
            onToggle={() => toggleSection("core-concepts")}
          >
            <Link href="/docs/routing">路由</Link>
            <Link href="/docs/rendering">渲染</Link>
          </Section>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

**去重效果**:

- 在文档页面之间导航时,侧边栏的展开/折叠状态保持
- 用户不需要重复展开已经打开的章节
- 阅读体验更流畅

### 3.4 多步骤表单

**场景**: 多步骤表单,每一步是一个独立的页面,但共享进度指示器。

```tsx
// app/checkout/layout.tsx
"use client";

import { usePathname } from "next/navigation";

const steps = [
  { path: "/checkout/cart", label: "购物车" },
  { path: "/checkout/shipping", label: "配送信息" },
  { path: "/checkout/payment", label: "支付方式" },
  { path: "/checkout/confirm", label: "确认订单" },
];

export default function CheckoutLayout({ children }) {
  const pathname = usePathname();
  const currentStep = steps.findIndex((s) => s.path === pathname);

  return (
    <div className="checkout-container">
      <div className="progress-bar">
        {steps.map((step, index) => (
          <div key={step.path} className={index <= currentStep ? "active" : ""}>
            {step.label}
          </div>
        ))}
      </div>
      <main>{children}</main>
    </div>
  );
}
```

**去重效果**:

- 在结账步骤之间导航时,进度条组件不会重新渲染
- 动画效果更流畅
- 减少不必要的计算

### 3.5 博客网站

**场景**: 博客网站的文章页面,共享评论组件和相关文章推荐。

```tsx
// app/blog/layout.tsx
"use client";

import { useState } from "react";

export default function BlogLayout({ children }) {
  const [showComments, setShowComments] = useState(true);

  return (
    <div className="blog-container">
      <main>{children}</main>
      <aside className="sidebar">
        <div className="comments-toggle">
          <button onClick={() => setShowComments(!showComments)}>
            {showComments ? "隐藏" : "显示"}评论
          </button>
        </div>
        {showComments && <CommentsSection />}
        <RelatedPosts />
      </aside>
    </div>
  );
}
```

**去重效果**:

- 在不同文章之间导航时,评论显示/隐藏状态保持
- 相关文章组件不会闪烁
- 用户体验更连贯

---

## 4. API 签名与配置

### 4.1 自动去重

布局去重是自动的,不需要额外配置:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />
      {children}
    </div>
  );
}
```

**Next.js 会自动**:

1. 检测路由变化
2. 比较布局树
3. 复用共享布局
4. 只渲染变化的部分

### 4.2 强制重新渲染

如果需要强制重新渲染布局,可以使用 `key` 属性:

```tsx
// app/dashboard/layout.tsx
"use client";

import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // 每次路由变化都重新渲染
  return (
    <div key={pathname} className="dashboard">
      <Sidebar />
      {children}
    </div>
  );
}
```

**注意**: 这会禁用布局去重,失去性能优势,通常不推荐。

### 4.3 条件布局

可以根据路由条件渲染不同的布局:

```tsx
// app/dashboard/layout.tsx
"use client";

import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isFullWidth = pathname.includes("/reports");

  return (
    <div className="dashboard">
      {!isFullWidth && <Sidebar />}
      <main className={isFullWidth ? "full-width" : ""}>{children}</main>
    </div>
  );
}
```

**去重行为**:

- 布局组件本身会被复用
- 但内部的条件渲染会根据路由变化
- 状态仍然保持

---

## 5. 基础与进阶使用

### 5.1 基础用法:简单布局复用

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        <header>
          <nav>
            <Link href="/">首页</Link>
            <Link href="/about">关于</Link>
            <Link href="/contact">联系</Link>
          </nav>
        </header>
        {children}
        <footer>© 2025 My Website</footer>
      </body>
    </html>
  );
}

// app/page.tsx
export default function HomePage() {
  return <div>首页内容</div>;
}

// app/about/page.tsx
export default function AboutPage() {
  return <div>关于页面</div>;
}
```

**去重效果**:

- 从首页导航到关于页面时,`header` 和 `footer` 不会重新渲染
- 只有 `children` 部分(页面内容)会更新
- 导航栏和页脚保持不变

### 5.2 中级用法:嵌套布局状态管理

```tsx
// app/dashboard/layout.tsx
"use client";

import { useState, createContext, useContext } from "react";

const DashboardContext = createContext(null);

export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  return (
    <DashboardContext.Provider
      value={{ user, setUser, notifications, setNotifications }}
    >
      <div className="dashboard">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          {children}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

// app/dashboard/analytics/page.tsx
("use client");

import { useDashboard } from "../layout";

export default function AnalyticsPage() {
  const { user, notifications } = useDashboard();

  return (
    <div>
      <h1>分析页面</h1>
      <p>用户: {user?.name}</p>
      <p>通知数: {notifications.length}</p>
    </div>
  );
}
```

**去重效果**:

- Context 状态在页面导航时保持
- 用户信息和通知数据不会丢失
- 子页面可以访问共享状态

### 5.3 高级用法:动画过渡

```tsx
// app/dashboard/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="dashboard">
      <Sidebar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
```

**去重效果**:

- 侧边栏不参与动画,保持静止
- 只有主内容区域有过渡动画
- 性能更好,动画更流畅

### 5.4 高级用法:条件布局切换

```tsx
// app/app/layout.tsx
"use client";

import { usePathname } from "next/navigation";

export default function AppLayout({ children }) {
  const pathname = usePathname();

  // 某些页面使用全屏布局
  const isFullScreen = ["/app/presentation", "/app/video"].some((path) =>
    pathname.startsWith(path)
  );

  if (isFullScreen) {
    return <div className="fullscreen">{children}</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <Header />
      <main>{children}</main>
    </div>
  );
}
```

**去重效果**:

- 布局组件本身被复用
- 根据路由动态调整布局结构
- 状态在布局切换时保持

### 5.5 高级用法:性能监控

```tsx
// app/dashboard/layout.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const renderCount = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    renderCount.current += 1;
    console.log(`DashboardLayout 渲染次数: ${renderCount.current}`);
    console.log(`当前路径: ${pathname}`);
  });

  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
      <div className="debug-info">渲染次数: {renderCount.current}</div>
    </div>
  );
}
```

**观察结果**:

- 在仪表板子页面之间导航时,渲染次数不会增加
- 证明布局组件被复用
- 可以用于性能调试

---

## 6. 注意事项

### 6.1 客户端状态管理

布局去重只保持 React 组件状态,不保持其他类型的状态:

```tsx
// ❌ 错误:全局变量不会保持
let globalCounter = 0;

export default function Layout({ children }) {
  globalCounter++;
  return <div>Counter: {globalCounter}</div>;
}

// ✅ 正确:使用 React 状态
("use client");

import { useState } from "react";

export default function Layout({ children }) {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <button onClick={() => setCounter((c) => c + 1)}>
        Counter: {counter}
      </button>
      {children}
    </div>
  );
}
```

### 6.2 副作用处理

`useEffect` 在布局复用时不会重新执行:

```tsx
"use client";

import { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    console.log("Layout mounted");

    return () => {
      console.log("Layout unmounted");
    };
  }, []);

  return <div>{children}</div>;
}
```

**行为**:

- 首次访问时执行 `useEffect`
- 在子页面之间导航时不会重新执行
- 只有离开整个布局时才会执行清理函数

### 6.3 服务端组件限制

布局去重主要针对客户端组件,服务端组件有不同的行为:

```tsx
// app/dashboard/layout.tsx (服务端组件)
export default function DashboardLayout({ children }) {
  // 每次导航都会在服务端重新执行
  const data = await fetchData();

  return (
    <div>
      <Sidebar data={data} />
      {children}
    </div>
  );
}
```

**注意**:

- 服务端组件在每次导航时都会重新执行
- 但客户端渲染时仍然会复用 DOM
- 如果需要保持状态,使用客户端组件

### 6.4 key 属性的影响

使用 `key` 属性会破坏布局去重:

```tsx
// ❌ 不推荐:每次导航都重新渲染
"use client";

import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();

  return (
    <div key={pathname}>
      <Sidebar />
      {children}
    </div>
  );
}

// ✅ 推荐:让 Next.js 自动处理
export default function Layout({ children }) {
  return (
    <div>
      <Sidebar />
      {children}
    </div>
  );
}
```

### 6.5 内存泄漏风险

长期保持的状态可能导致内存泄漏:

```tsx
// ❌ 潜在问题:无限增长的数组
"use client";

import { useState } from "react";

export default function Layout({ children }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 每次导航都添加记录,永不清理
    setHistory((prev) => [...prev, window.location.pathname]);
  }, []);

  return <div>{children}</div>;
}

// ✅ 改进:限制历史记录数量
("use client");

import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory((prev) => {
      const newHistory = [...prev, window.location.pathname];
      // 只保留最近 10 条记录
      return newHistory.slice(-10);
    });
  }, []);

  return <div>{children}</div>;
}
```

---

## 7. 常见问题

### 7.1 为什么我的布局状态丢失了?

**可能原因**:

1. 使用了服务端组件而不是客户端组件
2. 使用了 `key` 属性导致强制重新渲染
3. 状态存储在组件外部(全局变量)

**解决方案**:

```tsx
// 确保使用客户端组件
"use client";

import { useState } from "react";

export default function Layout({ children }) {
  const [state, setState] = useState(initialValue);

  return <div>{children}</div>;
}
```

### 7.2 如何在布局中访问当前路由?

使用 `usePathname` Hook:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();

  return (
    <div>
      <nav>
        <Link
          href="/dashboard"
          className={pathname === "/dashboard" ? "active" : ""}
        >
          仪表板
        </Link>
      </nav>
      {children}
    </div>
  );
}
```

### 7.3 布局去重会影响 SEO 吗?

不会。布局去重是客户端行为,不影响服务端渲染和 SEO:

- 首次加载时完整渲染 HTML
- 搜索引擎爬虫看到的是完整页面
- 布局去重只在客户端导航时生效

### 7.4 如何强制重新渲染布局?

使用 `router.refresh()`:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function MyComponent() {
  const router = useRouter();

  function handleRefresh() {
    router.refresh(); // 刷新当前路由
  }

  return <button onClick={handleRefresh}>刷新</button>;
}
```

### 7.5 布局去重对性能提升有多大?

根据布局复杂度不同,性能提升从 20% 到 80% 不等:

| 布局复杂度 | 性能提升 | 说明                     |
| :--------- | :------- | :----------------------- |
| 简单布局   | 20-30%   | 只有基本的 header/footer |
| 中等布局   | 40-60%   | 包含侧边栏、导航等       |
| 复杂布局   | 60-80%   | 包含大量组件、状态、动画 |

---

## 8. 总结

布局去重是 Next.js 16 的重要性能优化特性,通过智能复用共享布局,大幅提升导航性能和用户体验。

**核心要点**:

1. 自动检测和复用共享布局,无需手动配置
2. 保持组件状态,避免状态丢失
3. 复用 DOM 节点,减少渲染开销
4. 提升导航速度,改善用户体验

**最佳实践**:

- 使用客户端组件管理需要保持的状态
- 避免使用 `key` 属性破坏去重机制
- 合理设计布局层级,最大化复用效果
- 注意内存管理,避免状态无限增长
- 使用 `usePathname` 等 Hook 访问路由信息

**适用场景**:

- 多页面仪表板应用
- 电商网站分类浏览
- 文档网站导航
- 多步骤表单流程
- 博客和内容网站

掌握布局去重机制,可以构建性能更好、体验更流畅的 Next.js 应用。

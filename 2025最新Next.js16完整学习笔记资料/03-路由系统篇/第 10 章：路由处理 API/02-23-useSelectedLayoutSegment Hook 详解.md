**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useSelectedLayoutSegment Hook 详解

## 1. 概述

`useSelectedLayoutSegment` 是 Next.js 16 提供的客户端 Hook,用于读取当前活动的路由段。它返回调用该 Hook 的布局下一级的活动路由段。

### 1.1 概念定义

`useSelectedLayoutSegment` Hook 返回当前布局下一级的活动路由段名称,用于实现活动导航链接等功能。

**关键特征**:

- **客户端专用**: 只能在 `'use client'` 组件中使用
- **布局感知**: 返回相对于当前布局的路由段
- **动态更新**: 路由变化时自动更新
- **类型安全**: TypeScript 支持

**基本用法**:

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function Layout({ children }) {
  const segment = useSelectedLayoutSegment();

  console.log(segment); // 'about' 或 'blog' 等

  return <div>{children}</div>;
}
```

### 1.2 核心价值

**活动导航**:

实现活动导航链接,高亮显示当前页面。

**条件渲染**:

根据当前路由段渲染不同的内容。

**布局定制**:

根据子路由调整布局样式或行为。

**用户体验**:

提供清晰的导航反馈。

### 1.3 路由段概念

路由段是 URL 路径中的一部分:

```
URL: /dashboard/settings/profile

路由段:
- dashboard
- settings
- profile
```

**文件结构**:

```
app/
├── layout.tsx              # 根布局
├── dashboard/
│   ├── layout.tsx          # dashboard 布局
│   ├── page.tsx            # /dashboard
│   ├── settings/
│   │   ├── layout.tsx      # settings 布局
│   │   ├── page.tsx        # /dashboard/settings
│   │   └── profile/
│   │       └── page.tsx    # /dashboard/settings/profile
```

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { useSelectedLayoutSegment } from "next/navigation";

function useSelectedLayoutSegment(parallelRouteKey?: string): string | null;
```

**参数**:

- `parallelRouteKey`: 并行路由的 key(可选)

**返回值**:

- 返回活动路由段的字符串
- 如果没有活动段,返回 `null`

**示例**:

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  // URL: /dashboard/settings
  // segment: 'settings'

  return <div>{children}</div>;
}
```

### 2.2 基本使用

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div>
      <nav>
        <Link href="/dashboard" className={segment === null ? "active" : ""}>
          概览
        </Link>
        <Link
          href="/dashboard/analytics"
          className={segment === "analytics" ? "active" : ""}
        >
          分析
        </Link>
        <Link
          href="/dashboard/settings"
          className={segment === "settings" ? "active" : ""}
        >
          设置
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

### 2.3 返回值示例

| URL                           | 布局位置                            | useSelectedLayoutSegment 返回值 |
| :---------------------------- | :---------------------------------- | :------------------------------ |
| `/dashboard`                  | `app/layout.tsx`                    | `'dashboard'`                   |
| `/dashboard`                  | `app/dashboard/layout.tsx`          | `null`                          |
| `/dashboard/settings`         | `app/layout.tsx`                    | `'dashboard'`                   |
| `/dashboard/settings`         | `app/dashboard/layout.tsx`          | `'settings'`                    |
| `/dashboard/settings/profile` | `app/dashboard/layout.tsx`          | `'settings'`                    |
| `/dashboard/settings/profile` | `app/dashboard/settings/layout.tsx` | `'profile'`                     |

### 2.4 与动态路由一起使用

**文件结构**:

```
app/
└── blog/
    ├── layout.tsx
    ├── page.tsx
    └── [slug]/
        └── page.tsx
```

**布局代码**:

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function BlogLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  // URL: /blog → segment: null
  // URL: /blog/hello-world → segment: 'hello-world'

  return (
    <div>
      {segment && <Breadcrumb slug={segment} />}
      {children}
    </div>
  );
}
```

### 2.5 并行路由中使用

在并行路由中,可以指定要查询的路由 key:

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  const teamSegment = useSelectedLayoutSegment("team");
  const analyticsSegment = useSelectedLayoutSegment("analytics");

  return (
    <div>
      <div>{children}</div>
      <div>{team}</div>
      <div>{analytics}</div>
    </div>
  );
}
```

---

## 3. 适用场景

### 3.1 活动导航链接

**场景**: 高亮显示当前活动的导航项。

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "概览", segment: null },
  { href: "/dashboard/analytics", label: "分析", segment: "analytics" },
  { href: "/dashboard/reports", label: "报告", segment: "reports" },
  { href: "/dashboard/settings", label: "设置", segment: "settings" },
];

export default function DashboardNav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav>
      {navItems.map((item) => {
        const isActive = segment === item.segment;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "nav-link active" : "nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

**CSS 样式**:

```css
.nav-link {
  padding: 8px 16px;
  color: #666;
  text-decoration: none;
}

.nav-link.active {
  color: #000;
  font-weight: bold;
  border-bottom: 2px solid #000;
}
```

### 3.2 条件渲染侧边栏

**场景**: 某些页面显示不同的侧边栏。

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="dashboard">
      {segment === "analytics" && <AnalyticsSidebar />}
      {segment === "reports" && <ReportsSidebar />}
      {segment === "settings" && <SettingsSidebar />}

      <main>{children}</main>
    </div>
  );
}
```

### 3.3 面包屑导航

**场景**: 根据当前路由段生成面包屑。

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

const segmentLabels: Record<string, string> = {
  analytics: "分析",
  reports: "报告",
  settings: "设置",
};

export default function Breadcrumbs() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav aria-label="面包屑">
      <Link href="/dashboard">仪表板</Link>
      {segment && (
        <>
          {" / "}
          <span>{segmentLabels[segment] || segment}</span>
        </>
      )}
    </nav>
  );
}
```

### 3.4 动态标题

**场景**: 根据当前路由段显示不同的标题。

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

const titles: Record<string, string> = {
  analytics: "数据分析",
  reports: "报告中心",
  settings: "系统设置",
};

export default function DashboardHeader() {
  const segment = useSelectedLayoutSegment();
  const title = segment ? titles[segment] : "仪表板概览";

  return (
    <header>
      <h1>{title}</h1>
    </header>
  );
}
```

### 3.5 布局样式切换

**场景**: 根据路由段应用不同的布局样式。

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  const layoutClass = segment === "analytics" ? "layout-wide" : "layout-normal";

  return <div className={layoutClass}>{children}</div>;
}
```

---

## 4. 常见问题

### 1. useSelectedLayoutSegment 和 usePathname 有什么区别?

| 特性   | useSelectedLayoutSegment | usePathname            |
| ------ | ------------------------ | ---------------------- |
| 返回值 | 当前激活的子路由段       | 完整路径名             |
| 作用域 | 当前布局的子路由         | 整个 URL 路径          |
| 用途   | 布局内导航状态           | 完整路径信息           |
| 示例   | 'analytics'              | '/dashboard/analytics' |

```tsx
// URL: /dashboard/analytics

// useSelectedLayoutSegment (在 dashboard/layout.tsx 中)
const segment = useSelectedLayoutSegment(); // 'analytics'

// usePathname
const pathname = usePathname(); // '/dashboard/analytics'
```

### 2. 在根布局中使用会返回什么?

在根布局中,返回第一级路由段:

```tsx
// app/layout.tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function RootLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  // URL: /dashboard/analytics
  // segment: 'dashboard'

  // URL: /blog/post-1
  // segment: 'blog'

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 3. 如何处理并行路由?

使用 `parallelRoutesKey` 参数:

```tsx
// app/dashboard/layout.tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function Layout({ children, team, analytics }) {
  // 默认插槽
  const defaultSegment = useSelectedLayoutSegment();

  // team 插槽
  const teamSegment = useSelectedLayoutSegment("team");

  // analytics 插槽
  const analyticsSegment = useSelectedLayoutSegment("analytics");

  return (
    <div>
      <div>默认: {defaultSegment}</div>
      <div>团队: {teamSegment}</div>
      <div>分析: {analyticsSegment}</div>

      {children}
      {team}
      {analytics}
    </div>
  );
}
```

### 4. 动态路由段会返回什么?

返回动态路由的实际值:

```tsx
// app/blog/layout.tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function BlogLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  // URL: /blog/my-first-post
  // segment: 'my-first-post'

  // URL: /blog/123
  // segment: '123'

  return <div>{children}</div>;
}
```

### 5. 如何在服务端组件中使用?

不能。这个 Hook 只能在客户端组件中使用:

```tsx
// ❌ 错误:服务端组件
export default function Layout({ children }) {
  const segment = useSelectedLayoutSegment(); // 错误!
  return <div>{children}</div>;
}

// ✅ 正确:客户端组件
("use client");

export default function Layout({ children }) {
  const segment = useSelectedLayoutSegment(); // 正确
  return <div>{children}</div>;
}
```

---

## 5. 最佳实践

### 5.1 封装导航组件

```tsx
// components/NavItem.tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

interface NavItemProps {
  href: string;
  segment: string;
  children: React.ReactNode;
}

export function NavItem({ href, segment, children }: NavItemProps) {
  const activeSegment = useSelectedLayoutSegment();
  const isActive = activeSegment === segment;

  return (
    <Link
      href={href}
      className={isActive ? "active" : ""}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

// 使用
export default function Nav() {
  return (
    <nav>
      <NavItem href="/dashboard/analytics" segment="analytics">
        分析
      </NavItem>
      <NavItem href="/dashboard/reports" segment="reports">
        报告
      </NavItem>
    </nav>
  );
}
```

### 5.2 使用类型安全

```tsx
// types/routes.ts
export type DashboardSegment = "analytics" | "reports" | "settings";

// components/DashboardNav.tsx
("use client");

import { useSelectedLayoutSegment } from "next/navigation";
import type { DashboardSegment } from "@/types/routes";

export default function DashboardNav() {
  const segment = useSelectedLayoutSegment() as DashboardSegment | null;

  return (
    <nav>
      <a className={segment === "analytics" ? "active" : ""}>分析</a>
      <a className={segment === "reports" ? "active" : ""}>报告</a>
      <a className={segment === "settings" ? "active" : ""}>设置</a>
    </nav>
  );
}
```

### 5.3 结合 useMemo 优化性能

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useMemo } from "react";

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  const config = useMemo(() => {
    switch (segment) {
      case "analytics":
        return { title: "分析", showSidebar: true };
      case "reports":
        return { title: "报告", showSidebar: true };
      case "settings":
        return { title: "设置", showSidebar: false };
      default:
        return { title: "仪表板", showSidebar: true };
    }
  }, [segment]);

  return (
    <div>
      <h1>{config.title}</h1>
      {config.showSidebar && <Sidebar />}
      {children}
    </div>
  );
}
```

### 5.4 处理空值

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function Nav() {
  const segment = useSelectedLayoutSegment();

  // segment 可能是 null(在索引路由时)
  const activeSegment = segment ?? "home";

  return (
    <nav>
      <a className={activeSegment === "home" ? "active" : ""}>首页</a>
      <a className={activeSegment === "analytics" ? "active" : ""}>分析</a>
    </nav>
  );
}
```

### 5.5 配合动画使用

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { motion } from "framer-motion";

export default function AnimatedLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  return (
    <motion.div
      key={segment}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 6. 注意事项

### 6.1 只能在客户端组件中使用

```tsx
// ❌ 错误
export default function Layout({ children }) {
  const segment = useSelectedLayoutSegment();
  return <div>{children}</div>;
}

// ✅ 正确
("use client");

export default function Layout({ children }) {
  const segment = useSelectedLayoutSegment();
  return <div>{children}</div>;
}
```

### 6.2 返回值可能是 null

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export default function Nav() {
  const segment = useSelectedLayoutSegment();

  // ❌ 不好:没有处理 null
  const title = segment.toUpperCase(); // 可能报错

  // ✅ 好:处理 null
  const title = segment?.toUpperCase() ?? "首页";

  return <h1>{title}</h1>;
}
```

### 6.3 不要用于数据获取

```tsx
// ❌ 不好:用于数据获取
"use client";

export default function Page() {
  const segment = useSelectedLayoutSegment();
  const data = await fetchData(segment); // 错误!
  return <div>{data}</div>;
}

// ✅ 好:用于UI状态
("use client");

export default function Nav() {
  const segment = useSelectedLayoutSegment();
  return <nav className={`nav-${segment}`}>...</nav>;
}
```

### 6.4 注意路由组

路由组不会影响返回值:

```tsx
// 文件结构:
// app/dashboard/(analytics)/reports/page.tsx

// app/dashboard/layout.tsx
"use client";

export default function Layout({ children }) {
  const segment = useSelectedLayoutSegment();

  // URL: /dashboard/reports
  // segment: 'reports' (不是 '(analytics)')

  return <div>{children}</div>;
}
```

### 6.5 避免过度使用

```tsx
// ❌ 不好:每个组件都使用
function Component1() {
  const segment = useSelectedLayoutSegment();
  return <div>{segment}</div>;
}

function Component2() {
  const segment = useSelectedLayoutSegment();
  return <div>{segment}</div>;
}

// ✅ 好:在顶层获取,通过 props 传递
function Layout({ children }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div>
      <Component1 segment={segment} />
      <Component2 segment={segment} />
      {children}
    </div>
  );
}
```

---

## 8. 性能优化与调试

### 8.1 性能优化技巧

#### 避免不必要的重渲染

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { memo } from "react";

// 使用 memo 避免不必要的重渲染
const NavItem = memo(function NavItem({
  href,
  segment,
  children,
}: {
  href: string;
  segment: string | null;
  children: React.ReactNode;
}) {
  const activeSegment = useSelectedLayoutSegment();
  const isActive = activeSegment === segment;

  return (
    <Link href={href} className={isActive ? "active" : ""}>
      {children}
    </Link>
  );
});

export default function Nav() {
  return (
    <nav>
      <NavItem href="/dashboard" segment={null}>
        首页
      </NavItem>
      <NavItem href="/dashboard/analytics" segment="analytics">
        分析
      </NavItem>
    </nav>
  );
}
```

#### 使用 useMemo 缓存计算结果

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useMemo } from "react";

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  // 缓存复杂的计算结果
  const navConfig = useMemo(() => {
    return {
      showSidebar: segment !== "fullscreen",
      theme: segment === "analytics" ? "dark" : "light",
      layout: segment === "reports" ? "wide" : "normal",
    };
  }, [segment]);

  return (
    <div className={`layout-${navConfig.layout} theme-${navConfig.theme}`}>
      {navConfig.showSidebar && <Sidebar />}
      <main>{children}</main>
    </div>
  );
}
```

#### 减少 Hook 调用次数

```tsx
// ❌ 不好:多个组件都调用 Hook
function Header() {
  const segment = useSelectedLayoutSegment();
  return <h1>{segment}</h1>;
}

function Sidebar() {
  const segment = useSelectedLayoutSegment();
  return <aside>{segment}</aside>;
}

// ✅ 好:在父组件调用一次,通过 props 传递
function Layout({ children }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div>
      <Header segment={segment} />
      <Sidebar segment={segment} />
      {children}
    </div>
  );
}
```

### 8.2 调试技巧

#### 使用 useEffect 监听变化

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";

export default function DebugLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  useEffect(() => {
    console.log("当前路由段:", segment);
    console.log("路由段类型:", typeof segment);
    console.log("是否为 null:", segment === null);
  }, [segment]);

  return <div>{children}</div>;
}
```

#### 创建调试组件

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export function SegmentDebugger() {
  const segment = useSelectedLayoutSegment();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "black",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      <div>当前段: {segment ?? "null"}</div>
      <div>类型: {typeof segment}</div>
    </div>
  );
}
```

#### 路由段历史记录

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useState } from "react";

export function SegmentHistory() {
  const segment = useSelectedLayoutSegment();
  const [history, setHistory] = useState<(string | null)[]>([]);

  useEffect(() => {
    setHistory((prev) => [...prev, segment].slice(-10)); // 保留最近10条
  }, [segment]);

  return (
    <div>
      <h3>路由段历史</h3>
      <ul>
        {history.map((seg, index) => (
          <li key={index}>{seg ?? "null"}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 8.3 常见性能陷阱

#### 陷阱 1:在循环中使用

```tsx
// ❌ 错误:在循环中调用 Hook
function NavItems({ items }) {
  return items.map((item) => {
    const segment = useSelectedLayoutSegment(); // 错误!
    return <NavItem key={item.id} item={item} />;
  });
}

// ✅ 正确:在组件顶层调用
function NavItems({ items }) {
  const segment = useSelectedLayoutSegment();

  return items.map((item) => (
    <NavItem key={item.id} item={item} segment={segment} />
  ));
}
```

#### 陷阱 2:过度依赖

```tsx
// ❌ 不好:每次渲染都重新计算
function Nav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav>
      {navItems.map((item) => {
        // 每次渲染都会执行
        const isActive = segment === item.segment;
        const className = isActive ? "active" : "";
        const style = isActive ? { fontWeight: "bold" } : {};

        return (
          <Link
            key={item.id}
            href={item.href}
            className={className}
            style={style}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ✅ 好:使用 useMemo 缓存
function Nav() {
  const segment = useSelectedLayoutSegment();

  const navItemsWithState = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        isActive: segment === item.segment,
      })),
    [segment]
  );

  return (
    <nav>
      {navItemsWithState.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={item.isActive ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

---

## 9. 高级应用场景

### 9.1 多级导航系统

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  segment: string | null;
  children?: NavItem[];
}

const navStructure: NavItem[] = [
  {
    label: "仪表板",
    href: "/dashboard",
    segment: null,
  },
  {
    label: "分析",
    href: "/dashboard/analytics",
    segment: "analytics",
    children: [
      {
        label: "实时",
        href: "/dashboard/analytics/realtime",
        segment: "realtime",
      },
      {
        label: "历史",
        href: "/dashboard/analytics/history",
        segment: "history",
      },
    ],
  },
  {
    label: "报告",
    href: "/dashboard/reports",
    segment: "reports",
  },
];

export default function MultiLevelNav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav>
      {navStructure.map((item) => (
        <div key={item.href}>
          <Link
            href={item.href}
            className={segment === item.segment ? "active" : ""}
          >
            {item.label}
          </Link>

          {item.children && segment === item.segment && (
            <SubNav items={item.children} />
          )}
        </div>
      ))}
    </nav>
  );
}

function SubNav({ items }: { items: NavItem[] }) {
  return (
    <div className="sub-nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
```

### 9.2 路由段分析与追踪

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";

export function RouteAnalytics() {
  const segment = useSelectedLayoutSegment();

  useEffect(() => {
    if (segment) {
      // 发送分析数据
      analytics.track("Page View", {
        segment: segment,
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
      });
    }
  }, [segment]);

  return null;
}
```

### 9.3 条件加载资源

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";

// 根据路由段动态加载组件
const AnalyticsWidget = dynamic(() => import("@/components/AnalyticsWidget"));
const ReportsWidget = dynamic(() => import("@/components/ReportsWidget"));

export default function DashboardLayout({ children }) {
  const segment = useSelectedLayoutSegment();

  // 根据路由段预加载资源
  useEffect(() => {
    if (segment === "analytics") {
      // 预加载分析相关的资源
      import("@/lib/analytics-utils");
    } else if (segment === "reports") {
      // 预加载报告相关的资源
      import("@/lib/reports-utils");
    }
  }, [segment]);

  return (
    <div>
      {segment === "analytics" && <AnalyticsWidget />}
      {segment === "reports" && <ReportsWidget />}
      <main>{children}</main>
    </div>
  );
}
```

### 9.4 路由段权限控制

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { redirect } from "next/navigation";
import { useEffect } from "react";

const segmentPermissions: Record<string, string[]> = {
  analytics: ["admin", "analyst"],
  reports: ["admin", "analyst", "viewer"],
  settings: ["admin"],
};

export default function ProtectedLayout({ children }) {
  const segment = useSelectedLayoutSegment();
  const { user } = useUser();

  useEffect(() => {
    if (segment && segmentPermissions[segment]) {
      const requiredRoles = segmentPermissions[segment];

      if (!requiredRoles.includes(user.role)) {
        redirect("/dashboard/unauthorized");
      }
    }
  }, [segment, user]);

  return <div>{children}</div>;
}
```

---

## 10. 与其他 Hook 的配合使用

### 10.1 与 usePathname 配合

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { usePathname } from "next/navigation";

export default function BreadcrumbNav() {
  const segment = useSelectedLayoutSegment();
  const pathname = usePathname();

  return (
    <nav aria-label="面包屑">
      <Link href="/dashboard">仪表板</Link>
      {segment && (
        <>
          {" / "}
          <span>{segment}</span>
        </>
      )}
      <div className="full-path">完整路径: {pathname}</div>
    </nav>
  );
}
```

### 10.2 与 useParams 配合

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useParams } from "next/navigation";

export default function ProductLayout({ children }) {
  const segment = useSelectedLayoutSegment();
  const params = useParams();

  return (
    <div>
      <h1>
        产品 {params.id} - {segment === "reviews" ? "评论" : "详情"}
      </h1>
      {children}
    </div>
  );
}
```

### 10.3 与 useRouter 配合

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useRouter } from "next/navigation";

export default function DashboardNav() {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  const handleNavigation = (newSegment: string) => {
    if (segment !== newSegment) {
      router.push(`/dashboard/${newSegment}`);
    }
  };

  return (
    <nav>
      <button onClick={() => handleNavigation("analytics")}>分析</button>
      <button onClick={() => handleNavigation("reports")}>报告</button>
    </nav>
  );
}
```

---

## 11. 测试策略

### 11.1 单元测试

```tsx
// __tests__/NavItem.test.tsx
import { render, screen } from "@testing-library/react";
import { useSelectedLayoutSegment } from "next/navigation";
import NavItem from "@/components/NavItem";

// Mock Next.js navigation hook
jest.mock("next/navigation", () => ({
  useSelectedLayoutSegment: jest.fn(),
}));

describe("NavItem", () => {
  it("应该在激活时显示正确的样式", () => {
    (useSelectedLayoutSegment as jest.Mock).mockReturnValue("analytics");

    render(<NavItem segment="analytics">分析</NavItem>);

    const link = screen.getByText("分析");
    expect(link).toHaveClass("active");
  });

  it("应该在未激活时不显示激活样式", () => {
    (useSelectedLayoutSegment as jest.Mock).mockReturnValue("reports");

    render(<NavItem segment="analytics">分析</NavItem>);

    const link = screen.getByText("分析");
    expect(link).not.toHaveClass("active");
  });

  it("应该正确处理 null 值", () => {
    (useSelectedLayoutSegment as jest.Mock).mockReturnValue(null);

    render(<NavItem segment={null}>首页</NavItem>);

    const link = screen.getByText("首页");
    expect(link).toHaveClass("active");
  });
});
```

### 11.2 集成测试

```tsx
// __tests__/DashboardLayout.test.tsx
import { render, screen } from "@testing-library/react";
import { useSelectedLayoutSegment } from "next/navigation";
import DashboardLayout from "@/app/dashboard/layout";

jest.mock("next/navigation", () => ({
  useSelectedLayoutSegment: jest.fn(),
}));

describe("DashboardLayout", () => {
  it("应该根据路由段显示不同的侧边栏", () => {
    (useSelectedLayoutSegment as jest.Mock).mockReturnValue("analytics");

    render(
      <DashboardLayout>
        <div>内容</div>
      </DashboardLayout>
    );

    expect(screen.getByText("分析侧边栏")).toBeInTheDocument();
  });

  it("应该在根路由时显示默认侧边栏", () => {
    (useSelectedLayoutSegment as jest.Mock).mockReturnValue(null);

    render(
      <DashboardLayout>
        <div>内容</div>
      </DashboardLayout>
    );

    expect(screen.getByText("默认侧边栏")).toBeInTheDocument();
  });
});
```

### 11.3 E2E 测试

```typescript
// e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("导航高亮", () => {
  test("应该在点击导航后高亮正确的项目", async ({ page }) => {
    await page.goto("/dashboard");

    // 点击分析导航
    await page.click('a[href="/dashboard/analytics"]');

    // 等待导航完成
    await page.waitForURL("/dashboard/analytics");

    // 检查激活状态
    const analyticsLink = page.locator('a[href="/dashboard/analytics"]');
    await expect(analyticsLink).toHaveClass(/active/);
  });

  test("应该在嵌套路由中正确显示激活状态", async ({ page }) => {
    await page.goto("/dashboard/analytics/realtime");

    const analyticsLink = page.locator('a[href="/dashboard/analytics"]');
    await expect(analyticsLink).toHaveClass(/active/);
  });
});
```

---

## 12. 从 Pages Router 迁移

### 12.1 Pages Router 中的等价实现

在 Pages Router 中,通常使用 `useRouter` 来实现类似功能:

```tsx
// Pages Router 方式
import { useRouter } from "next/router";

export default function Nav() {
  const router = useRouter();
  const segment = router.pathname.split("/")[2]; // 手动解析

  return (
    <nav>
      <Link href="/dashboard/analytics">
        <a className={segment === "analytics" ? "active" : ""}>分析</a>
      </Link>
    </nav>
  );
}
```

### 12.2 迁移到 App Router

```tsx
// App Router 方式
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

export default function Nav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav>
      <Link
        href="/dashboard/analytics"
        className={segment === "analytics" ? "active" : ""}
      >
        分析
      </Link>
    </nav>
  );
}
```

### 12.3 迁移对比表

| 特性       | Pages Router               | App Router                   |
| ---------- | -------------------------- | ---------------------------- |
| 获取路由段 | 手动解析 `router.pathname` | `useSelectedLayoutSegment()` |
| 组件类型   | 客户端组件                 | 客户端组件                   |
| 性能       | 需要解析完整路径           | 直接返回当前段               |
| 类型安全   | 需要手动类型断言           | 内置类型支持                 |
| 并行路由   | 不支持                     | 支持 `parallelRoutesKey`     |
| 代码复杂度 | 较高                       | 较低                         |

---

## 13. 实际项目案例

### 13.1 电商后台管理系统

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

interface AdminNavItem {
  label: string;
  segment: string | null;
  href: string;
  icon: string;
  badge?: number;
}

const adminNavItems: AdminNavItem[] = [
  { label: "概览", segment: null, href: "/admin", icon: "📊" },
  {
    label: "订单",
    segment: "orders",
    href: "/admin/orders",
    icon: "📦",
    badge: 5,
  },
  { label: "产品", segment: "products", href: "/admin/products", icon: "🛍️" },
  { label: "用户", segment: "users", href: "/admin/users", icon: "👥" },
  { label: "设置", segment: "settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminNav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav className="admin-nav">
      {adminNavItems.map((item) => {
        const isActive = segment === item.segment;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
```

### 13.2 多租户 SaaS 平台

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useParams } from "next/navigation";

export default function TenantLayout({ children }) {
  const segment = useSelectedLayoutSegment();
  const params = useParams();
  const tenantId = params.tenantId as string;

  // 根据租户和路由段加载不同的配置
  const layoutConfig = {
    showBranding: segment !== "settings",
    theme: getTenantTheme(tenantId),
    features: getTenantFeatures(tenantId, segment),
  };

  return (
    <div className={`tenant-layout theme-${layoutConfig.theme}`}>
      {layoutConfig.showBranding && <TenantBranding tenantId={tenantId} />}

      <nav>
        <NavItem segment={null} href={`/${tenantId}`}>
          仪表板
        </NavItem>
        <NavItem segment="analytics" href={`/${tenantId}/analytics`}>
          分析
        </NavItem>
        {layoutConfig.features.includes("reports") && (
          <NavItem segment="reports" href={`/${tenantId}/reports`}>
            报告
          </NavItem>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
}

function NavItem({ segment, href, children }) {
  const activeSegment = useSelectedLayoutSegment();
  const isActive = activeSegment === segment;

  return (
    <Link href={href} className={isActive ? "active" : ""}>
      {children}
    </Link>
  );
}
```

### 13.3 内容管理系统

```tsx
"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useState, useEffect } from "react";

export default function CMSLayout({ children }) {
  const segment = useSelectedLayoutSegment();
  const [sidebarWidth, setSidebarWidth] = useState(250);

  // 根据不同的路由段调整侧边栏宽度
  useEffect(() => {
    switch (segment) {
      case "editor":
        setSidebarWidth(300); // 编辑器需要更宽的侧边栏
        break;
      case "media":
        setSidebarWidth(200); // 媒体库使用较窄的侧边栏
        break;
      default:
        setSidebarWidth(250);
    }
  }, [segment]);

  return (
    <div className="cms-layout">
      <aside style={{ width: sidebarWidth }}>
        <CMSNav currentSegment={segment} />
      </aside>

      <main className={`content-${segment || "dashboard"}`}>{children}</main>
    </div>
  );
}

function CMSNav({ currentSegment }) {
  const navItems = [
    { label: "仪表板", segment: null, icon: "📊" },
    { label: "文章", segment: "posts", icon: "📝" },
    { label: "编辑器", segment: "editor", icon: "✏️" },
    { label: "媒体库", segment: "media", icon: "🖼️" },
    { label: "评论", segment: "comments", icon: "💬" },
  ];

  return (
    <nav>
      {navItems.map((item) => (
        <Link
          key={item.segment || "home"}
          href={`/cms${item.segment ? `/${item.segment}` : ""}`}
          className={currentSegment === item.segment ? "active" : ""}
        >
          {item.icon} {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

---

## 14. 总结

`useSelectedLayoutSegment` 是用于获取当前激活路由段的客户端 Hook。本文介绍了:

1. **核心概念**: API 签名、工作原理、与其他 Hook 的对比
2. **实战场景**: 导航高亮、条件渲染、面包屑、动态标题、布局切换
3. **常见问题**: 与 usePathname 的区别、根布局使用、并行路由、动态路由、服务端限制
4. **最佳实践**: 封装组件、类型安全、性能优化、空值处理、动画集成
5. **注意事项**: 客户端专用、null 处理、不用于数据获取、路由组、避免过度使用
6. **性能优化**: 避免重渲染、缓存计算、减少 Hook 调用、调试技巧
7. **高级应用**: 多级导航、路由分析、条件加载、权限控制
8. **Hook 配合**: 与 usePathname、useParams、useRouter 的组合使用
9. **测试策略**: 单元测试、集成测试、E2E 测试
10. **迁移指南**: 从 Pages Router 迁移到 App Router
11. **实际案例**: 电商后台、多租户平台、内容管理系统

关键要点:

- 只能在客户端组件中使用
- 返回当前布局的激活子路由段
- 返回值可能是 null
- 适合用于导航状态和 UI 控制
- 不适合用于数据获取
- 路由组不影响返回值
- 注意性能优化,避免不必要的重渲染
- 可以与其他导航 Hook 配合使用实现复杂功能
- 需要编写完善的测试确保功能正确
- 从 Pages Router 迁移时可以简化代码

通过正确使用 `useSelectedLayoutSegment`,可以轻松实现基于路由的 UI 状态管理,构建灵活的导航系统和动态布局。这个 Hook 在实际项目中非常实用,特别是在需要根据路由状态动态调整 UI 的场景下。

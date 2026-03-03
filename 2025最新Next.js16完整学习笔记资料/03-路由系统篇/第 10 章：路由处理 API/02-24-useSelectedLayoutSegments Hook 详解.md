**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useSelectedLayoutSegments Hook 详解

## 1. 概述

`useSelectedLayoutSegments` 是 Next.js 16 提供的客户端 Hook,用于读取当前活动的所有路由段。它返回调用该 Hook 的布局下所有活动路由段的数组。

### 1.1 概念定义

`useSelectedLayoutSegments` Hook 返回当前布局下所有活动路由段的数组,是 `useSelectedLayoutSegment` 的复数版本。

**关键特征**:

- **客户端专用**: 只能在 `'use client'` 组件中使用
- **返回数组**: 返回所有路由段的数组
- **布局感知**: 相对于当前布局
- **动态更新**: 路由变化时自动更新

**基本用法**:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Layout({ children }) {
  const segments = useSelectedLayoutSegments();

  console.log(segments); // ['dashboard', 'settings', 'profile']

  return <div>{children}</div>;
}
```

### 1.2 核心价值

**完整路径信息**:

获取从当前布局到当前页面的完整路径信息。

**面包屑导航**:

轻松实现多级面包屑导航。

**深层路由感知**:

了解整个路由层级,而不仅仅是下一级。

**灵活的导航**:

基于完整路径实现复杂的导航逻辑。

### 1.3 与 useSelectedLayoutSegment 的对比

| Hook                        | 返回值     | 使用场景                |
| :-------------------------- | :--------- | :---------------------- |
| `useSelectedLayoutSegment`  | 单个字符串 | 简单导航,只需知道下一级 |
| `useSelectedLayoutSegments` | 字符串数组 | 面包屑,需要完整路径     |

**示例对比**:

```tsx
// URL: /dashboard/settings/profile

// useSelectedLayoutSegment (在 app/layout.tsx)
const segment = useSelectedLayoutSegment(); // 'dashboard'

// useSelectedLayoutSegments (在 app/layout.tsx)
const segments = useSelectedLayoutSegments(); // ['dashboard', 'settings', 'profile']
```

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { useSelectedLayoutSegments } from "next/navigation";

function useSelectedLayoutSegments(parallelRouteKey?: string): string[];
```

**参数**:

- `parallelRouteKey`: 并行路由的 key(可选)

**返回值**:

- 返回活动路由段的字符串数组
- 如果没有活动段,返回空数组 `[]`

**示例**:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function RootLayout({ children }) {
  const segments = useSelectedLayoutSegments();

  // URL: /dashboard/settings/profile
  // segments: ['dashboard', 'settings', 'profile']

  return <div>{children}</div>;
}
```

### 2.2 基本使用

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Layout({ children }) {
  const segments = useSelectedLayoutSegments();

  return (
    <div>
      <p>当前路径: /{segments.join("/")}</p>
      {children}
    </div>
  );
}
```

### 2.3 返回值示例

| URL                           | 布局位置                            | useSelectedLayoutSegments 返回值       |
| :---------------------------- | :---------------------------------- | :------------------------------------- |
| `/`                           | `app/layout.tsx`                    | `[]`                                   |
| `/dashboard`                  | `app/layout.tsx`                    | `['dashboard']`                        |
| `/dashboard/settings`         | `app/layout.tsx`                    | `['dashboard', 'settings']`            |
| `/dashboard/settings/profile` | `app/layout.tsx`                    | `['dashboard', 'settings', 'profile']` |
| `/dashboard/settings/profile` | `app/dashboard/layout.tsx`          | `['settings', 'profile']`              |
| `/dashboard/settings/profile` | `app/dashboard/settings/layout.tsx` | `['profile']`                          |

### 2.4 与动态路由一起使用

**文件结构**:

```
app/
└── blog/
    ├── layout.tsx
    ├── page.tsx
    └── [category]/
        └── [slug]/
            └── page.tsx
```

**布局代码**:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function BlogLayout({ children }) {
  const segments = useSelectedLayoutSegments();

  // URL: /blog/tech/nextjs-guide
  // segments: ['tech', 'nextjs-guide']

  const [category, slug] = segments;

  return (
    <div>
      {category && <p>分类: {category}</p>}
      {slug && <p>文章: {slug}</p>}
      {children}
    </div>
  );
}
```

### 2.5 Catch-all 路由

**文件结构**:

```
app/
└── docs/
    ├── layout.tsx
    └── [...slug]/
        └── page.tsx
```

**布局代码**:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function DocsLayout({ children }) {
  const segments = useSelectedLayoutSegments();

  // URL: /docs/getting-started/installation
  // segments: ['getting-started', 'installation']

  const path = segments.join("/");

  return (
    <div>
      <p>文档路径: {path}</p>
      {children}
    </div>
  );
}
```

---

## 3. 适用场景

### 3.1 多级面包屑导航

**场景**: 实现完整的面包屑导航。

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Link from "next/link";

const segmentLabels: Record<string, string> = {
  dashboard: "仪表板",
  analytics: "分析",
  reports: "报告",
  settings: "设置",
  profile: "个人资料",
  security: "安全",
};

export default function Breadcrumbs() {
  const segments = useSelectedLayoutSegments();

  return (
    <nav aria-label="面包屑">
      <Link href="/">首页</Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segmentLabels[segment] || segment;
        const isLast = index === segments.length - 1;

        return (
          <span key={href}>
            {" / "}
            {isLast ? <span>{label}</span> : <Link href={href}>{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
```

### 3.2 动态页面标题

**场景**: 根据完整路径生成页面标题。

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

const titles: Record<string, string> = {
  dashboard: "仪表板",
  analytics: "数据分析",
  reports: "报告中心",
  settings: "设置",
  profile: "个人资料",
};

export default function PageTitle() {
  const segments = useSelectedLayoutSegments();

  const titleParts = segments.map((seg) => titles[seg] || seg);
  const title = titleParts.join(" - ") || "首页";

  return <h1>{title}</h1>;
}
```

### 3.3 侧边栏导航状态

**场景**: 根据当前路径展开侧边栏菜单。

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const segments = useSelectedLayoutSegments();

  const isDashboard = segments[0] === "dashboard";
  const isAnalytics = segments[1] === "analytics";

  return (
    <aside>
      <nav>
        <div>
          <Link href="/dashboard">仪表板</Link>

          {isDashboard && (
            <ul>
              <li>
                <Link href="/dashboard/analytics">分析</Link>

                {isAnalytics && (
                  <ul>
                    <li>
                      <Link href="/dashboard/analytics/overview">概览</Link>
                    </li>
                    <li>
                      <Link href="/dashboard/analytics/reports">报告</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <Link href="/dashboard/settings">设置</Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
}
```

### 3.4 路径分析

**场景**: 发送完整路径到分析工具。

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect } from "react";

export default function Analytics() {
  const segments = useSelectedLayoutSegments();

  useEffect(() => {
    const path = "/" + segments.join("/");

    // 发送到 Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: path,
      });
    }
  }, [segments]);

  return null;
}
```

### 3.5 条件布局

**场景**: 根据路径深度应用不同的布局。

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Layout({ children }) {
  const segments = useSelectedLayoutSegments();
  const depth = segments.length;

  return (
    <div className={`layout-depth-${depth}`}>
      {depth > 2 && <BackButton />}
      {children}
    </div>
  );
}
```

### 3.6 文档导航

**场景**: 文档网站的导航系统。

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Link from "next/link";

export default function DocsNav() {
  const segments = useSelectedLayoutSegments();

  // URL: /docs/api/components/button
  // segments: ['api', 'components', 'button']

  const [section, category, page] = segments;

  return (
    <nav>
      <h2>文档导航</h2>

      {section && (
        <div>
          <h3>{section}</h3>
          {category && (
            <div>
              <h4>{category}</h4>
              {page && <p>当前页: {page}</p>}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
```

---

## 4. 常见问题

### 1. useSelectedLayoutSegments 和 usePathname 有什么区别?

| 特性   | useSelectedLayoutSegments  | usePathname            |
| ------ | -------------------------- | ---------------------- |
| 返回值 | 路由段数组                 | 完整路径字符串         |
| 用途   | 多级导航、面包屑           | 完整路径匹配           |
| 示例   | ['dashboard', 'analytics'] | '/dashboard/analytics' |

```tsx
// URL: /dashboard/analytics/reports

// useSelectedLayoutSegments
const segments = useSelectedLayoutSegments();
// ['dashboard', 'analytics', 'reports']

// usePathname
const pathname = usePathname();
// '/dashboard/analytics/reports'
```

### 2. 如何获取特定层级的路由段?

使用数组索引:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  // URL: /dashboard/analytics/reports
  const [section, subsection, page] = segments;

  console.log(section); // 'dashboard'
  console.log(subsection); // 'analytics'
  console.log(page); // 'reports'

  return (
    <div>
      {section} / {subsection} / {page}
    </div>
  );
}
```

### 3. 如何处理并行路由?

使用 `parallelRoutesKey` 参数:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Layout({ children, team, analytics }) {
  // 默认插槽
  const defaultSegments = useSelectedLayoutSegments();

  // team 插槽
  const teamSegments = useSelectedLayoutSegments("team");

  // analytics 插槽
  const analyticsSegments = useSelectedLayoutSegments("analytics");

  return (
    <div>
      <div>默认: {defaultSegments.join("/")}</div>
      <div>团队: {teamSegments.join("/")}</div>
      <div>分析: {analyticsSegments.join("/")}</div>

      {children}
      {team}
      {analytics}
    </div>
  );
}
```

### 4. 动态路由段会包含在数组中吗?

会,返回实际的参数值:

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  // URL: /blog/2024/my-post
  // segments: ['blog', '2024', 'my-post']

  // URL: /products/electronics/123
  // segments: ['products', 'electronics', '123']

  return <div>{segments.join(" > ")}</div>;
}
```

### 5. 如何在服务端组件中使用?

不能。这个 Hook 只能在客户端组件中使用:

```tsx
// ❌ 错误:服务端组件
export default function Component() {
  const segments = useSelectedLayoutSegments(); // 错误!
  return <div>{segments.join("/")}</div>;
}

// ✅ 正确:客户端组件
("use client");

export default function Component() {
  const segments = useSelectedLayoutSegments(); // 正确
  return <div>{segments.join("/")}</div>;
}
```

---

## 5. 最佳实践

### 5.1 封装面包屑组件

```tsx
// components/Breadcrumbs.tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Link from "next/link";

const segmentLabels: Record<string, string> = {
  dashboard: "仪表板",
  analytics: "分析",
  reports: "报告",
  settings: "设置",
};

export function Breadcrumbs() {
  const segments = useSelectedLayoutSegments();

  return (
    <nav aria-label="面包屑">
      <ol>
        <li>
          <Link href="/">首页</Link>
        </li>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const label = segmentLabels[segment] || segment;
          const isLast = index === segments.length - 1;

          return (
            <li key={href}>
              {isLast ? <span>{label}</span> : <Link href={href}>{label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### 5.2 使用类型安全

```tsx
// types/routes.ts
export type RouteSegment = "dashboard" | "analytics" | "reports" | "settings";

// components/Nav.tsx
("use client");

import { useSelectedLayoutSegments } from "next/navigation";
import type { RouteSegment } from "@/types/routes";

export default function Nav() {
  const segments = useSelectedLayoutSegments() as RouteSegment[];

  const isActive = (segment: RouteSegment) => {
    return segments.includes(segment);
  };

  return (
    <nav>
      <a className={isActive("dashboard") ? "active" : ""}>仪表板</a>
      <a className={isActive("analytics") ? "active" : ""}>分析</a>
    </nav>
  );
}
```

### 5.3 结合 useMemo 优化

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  const breadcrumbPath = useMemo(() => {
    return segments.map((segment, index) => ({
      label: segment,
      href: "/" + segments.slice(0, index + 1).join("/"),
    }));
  }, [segments]);

  return (
    <nav>
      {breadcrumbPath.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
```

### 5.4 处理空数组

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  // 在根路由时,segments 是空数组
  if (segments.length === 0) {
    return <div>首页</div>;
  }

  return <div>{segments.join(" / ")}</div>;
}
```

### 5.5 构建完整路径

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  // 构建完整路径
  const fullPath = "/" + segments.join("/");

  // 构建父路径
  const parentPath =
    segments.length > 1 ? "/" + segments.slice(0, -1).join("/") : "/";

  return (
    <div>
      <div>当前路径: {fullPath}</div>
      <div>父路径: {parentPath}</div>
    </div>
  );
}
```

---

## 6. 注意事项

### 6.1 只能在客户端组件中使用

```tsx
// ❌ 错误
export default function Component() {
  const segments = useSelectedLayoutSegments();
  return <div>{segments.join("/")}</div>;
}

// ✅ 正确
("use client");

export default function Component() {
  const segments = useSelectedLayoutSegments();
  return <div>{segments.join("/")}</div>;
}
```

### 6.2 返回值是数组

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  // ❌ 不好:直接渲染数组
  return <div>{segments}</div>; // 会显示逗号分隔

  // ✅ 好:使用 join
  return <div>{segments.join(" / ")}</div>;
}
```

### 6.3 不要用于数据获取

```tsx
// ❌ 不好:用于数据获取
"use client";

export default function Component() {
  const segments = useSelectedLayoutSegments();
  const data = await fetchData(segments); // 错误!
  return <div>{data}</div>;
}

// ✅ 好:用于UI状态
("use client");

export default function Component() {
  const segments = useSelectedLayoutSegments();
  return <nav className={`depth-${segments.length}`}>...</nav>;
}
```

### 6.4 注意路由组

路由组不会包含在数组中:

```tsx
// 文件结构:
// app/(marketing)/blog/[slug]/page.tsx

"use client";

export default function Component() {
  const segments = useSelectedLayoutSegments();

  // URL: /blog/my-post
  // segments: ['blog', 'my-post'] (不包含 '(marketing)')

  return <div>{segments.join("/")}</div>;
}
```

### 6.5 避免过度计算

```tsx
// ❌ 不好:每次渲染都计算
function Component() {
  const segments = useSelectedLayoutSegments();
  const path = segments.join("/"); // 每次都计算
  const depth = segments.length; // 每次都计算

  return <div>{path}</div>;
}

// ✅ 好:使用 useMemo
function Component() {
  const segments = useSelectedLayoutSegments();

  const { path, depth } = useMemo(
    () => ({
      path: segments.join("/"),
      depth: segments.length,
    }),
    [segments]
  );

  return <div>{path}</div>;
}
```

---

## 8. 性能优化与调试

### 8.1 性能优化技巧

#### 缓存路径计算

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";

export default function OptimizedBreadcrumb() {
  const segments = useSelectedLayoutSegments();

  // 缓存路径计算
  const breadcrumbData = useMemo(() => {
    return segments.map((segment, index) => ({
      label: formatSegmentLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
      isLast: index === segments.length - 1,
    }));
  }, [segments]);

  return (
    <nav>
      {breadcrumbData.map((item, index) => (
        <span key={index}>
          {item.isLast ? (
            <span>{item.label}</span>
          ) : (
            <Link href={item.href}>{item.label}</Link>
          )}
          {!item.isLast && " / "}
        </span>
      ))}
    </nav>
  );
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
```

#### 避免不必要的数组操作

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";

export default function PathDisplay() {
  const segments = useSelectedLayoutSegments();

  // ❌ 不好:每次渲染都创建新对象
  const badPath = {
    full: segments.join("/"),
    depth: segments.length,
    last: segments[segments.length - 1],
  };

  // ✅ 好:使用 useMemo 缓存
  const goodPath = useMemo(
    () => ({
      full: segments.join("/"),
      depth: segments.length,
      last: segments[segments.length - 1],
    }),
    [segments]
  );

  return <div>{goodPath.full}</div>;
}
```

#### 条件渲染优化

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";

export default function ConditionalNav() {
  const segments = useSelectedLayoutSegments();

  // 缓存条件判断结果
  const navState = useMemo(() => {
    const depth = segments.length;
    return {
      showBackButton: depth > 1,
      showBreadcrumb: depth > 2,
      showSidebar: depth <= 3,
      currentSection: segments[0],
    };
  }, [segments]);

  return (
    <div>
      {navState.showBackButton && <BackButton />}
      {navState.showBreadcrumb && <Breadcrumb segments={segments} />}
      {navState.showSidebar && <Sidebar section={navState.currentSection} />}
    </div>
  );
}
```

### 8.2 调试技巧

#### 路由段可视化工具

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect } from "react";

export function SegmentsDebugger() {
  const segments = useSelectedLayoutSegments();

  useEffect(() => {
    console.group("路由段信息");
    console.log("完整段数组:", segments);
    console.log("段数量:", segments.length);
    console.log("完整路径:", "/" + segments.join("/"));
    console.log("当前段:", segments[segments.length - 1]);
    console.groupEnd();
  }, [segments]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "12px",
        maxWidth: "300px",
        zIndex: 9999,
      }}
    >
      <h4 style={{ margin: "0 0 10px 0" }}>路由段调试</h4>
      <div>
        <strong>段数组:</strong>
        <pre style={{ margin: "5px 0", fontSize: "11px" }}>
          {JSON.stringify(segments, null, 2)}
        </pre>
      </div>
      <div>
        <strong>完整路径:</strong> /{segments.join("/")}
      </div>
      <div>
        <strong>深度:</strong> {segments.length}
      </div>
    </div>
  );
}
```

#### 路由段历史追踪

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useState } from "react";

interface SegmentHistory {
  segments: string[];
  timestamp: string;
  path: string;
}

export function SegmentHistoryTracker() {
  const segments = useSelectedLayoutSegments();
  const [history, setHistory] = useState<SegmentHistory[]>([]);

  useEffect(() => {
    const entry: SegmentHistory = {
      segments: [...segments],
      timestamp: new Date().toISOString(),
      path: "/" + segments.join("/"),
    };

    setHistory((prev) => [...prev, entry].slice(-20)); // 保留最近20条
  }, [segments]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div style={{ padding: "20px", background: "#f5f5f5" }}>
      <h3>路由段历史记录</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>时间</th>
            <th>路径</th>
            <th>深度</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={index}>
              <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
              <td>{entry.path}</td>
              <td>{entry.segments.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 8.3 常见性能陷阱

#### 陷阱 1:频繁的数组操作

```tsx
// ❌ 不好:每次渲染都执行多次数组操作
function BadBreadcrumb() {
  const segments = useSelectedLayoutSegments();

  return (
    <nav>
      {segments.map((segment, index) => {
        const path = segments.slice(0, index + 1).join("/"); // 每次都计算
        const label = segment.split("-").join(" "); // 每次都处理
        const isLast = index === segments.length - 1; // 每次都判断

        return (
          <Link key={index} href={path}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ✅ 好:使用 useMemo 缓存计算结果
function GoodBreadcrumb() {
  const segments = useSelectedLayoutSegments();

  const breadcrumbs = useMemo(
    () =>
      segments.map((segment, index) => ({
        path: "/" + segments.slice(0, index + 1).join("/"),
        label: segment.split("-").join(" "),
        isLast: index === segments.length - 1,
      })),
    [segments]
  );

  return (
    <nav>
      {breadcrumbs.map((item, index) => (
        <Link key={index} href={item.path}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

#### 陷阱 2:不必要的深度比较

```tsx
// ❌ 不好:每次都深度比较数组
function BadComponent() {
  const segments = useSelectedLayoutSegments();
  const [prevSegments, setPrevSegments] = useState(segments);

  useEffect(() => {
    if (JSON.stringify(segments) !== JSON.stringify(prevSegments)) {
      // 性能差
      setPrevSegments(segments);
    }
  }, [segments, prevSegments]);
}

// ✅ 好:使用路径字符串比较
function GoodComponent() {
  const segments = useSelectedLayoutSegments();
  const currentPath = segments.join("/");
  const [prevPath, setPrevPath] = useState(currentPath);

  useEffect(() => {
    if (currentPath !== prevPath) {
      setPrevPath(currentPath);
    }
  }, [currentPath, prevPath]);
}
```

---

## 9. 高级应用场景

### 9.1 智能面包屑系统

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    icon?: string;
    hidden?: boolean;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  dashboard: { label: "仪表板", icon: "📊" },
  analytics: { label: "数据分析", icon: "📈" },
  reports: { label: "报告", icon: "📄" },
  settings: { label: "设置", icon: "⚙️" },
  profile: { label: "个人资料", icon: "👤" },
  admin: { label: "管理", icon: "🔐", hidden: true },
};

export default function SmartBreadcrumb() {
  const segments = useSelectedLayoutSegments();

  const breadcrumbs = useMemo(() => {
    return segments
      .map((segment, index) => {
        const config = breadcrumbConfig[segment] || {
          label: formatLabel(segment),
        };

        if (config.hidden) return null;

        return {
          segment,
          label: config.label,
          icon: config.icon,
          href: "/" + segments.slice(0, index + 1).join("/"),
          isLast: index === segments.length - 1,
        };
      })
      .filter(Boolean);
  }, [segments]);

  return (
    <nav aria-label="面包屑导航" className="breadcrumb">
      <Link href="/">首页</Link>
      {breadcrumbs.map((item, index) => (
        <span key={index}>
          <span className="separator">/</span>
          {item.isLast ? (
            <span className="current">
              {item.icon && <span className="icon">{item.icon}</span>}
              {item.label}
            </span>
          ) : (
            <Link href={item.href}>
              {item.icon && <span className="icon">{item.icon}</span>}
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function formatLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
```

### 9.2 路由深度分析

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";

export default function RouteAnalytics() {
  const segments = useSelectedLayoutSegments();

  const analytics = useMemo(() => {
    const depth = segments.length;

    return {
      depth,
      category: depth > 0 ? segments[0] : "home",
      subcategory: depth > 1 ? segments[1] : null,
      page: depth > 2 ? segments[2] : null,
      fullPath: "/" + segments.join("/"),
      isDeepRoute: depth > 3,
      breadcrumbCount: depth + 1, // 包含首页
    };
  }, [segments]);

  // 发送分析数据
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: analytics.fullPath,
        page_depth: analytics.depth,
        page_category: analytics.category,
      });
    }
  }, [analytics]);

  return null; // 这是一个分析组件,不渲染UI
}
```

### 9.3 动态侧边栏导航

```tsx
"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  segment: string;
}

const navigationStructure: Record<string, NavSection[]> = {
  dashboard: [
    {
      title: "概览",
      items: [
        { label: "首页", href: "/dashboard", segment: "" },
        { label: "统计", href: "/dashboard/stats", segment: "stats" },
      ],
    },
  ],
  analytics: [
    {
      title: "分析工具",
      items: [
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
  ],
};

export default function DynamicSidebar() {
  const segments = useSelectedLayoutSegments();

  const sidebarContent = useMemo(() => {
    const mainSection = segments[0] || "dashboard";
    return navigationStructure[mainSection] || [];
  }, [segments]);

  const currentPath = "/" + segments.join("/");

  return (
    <aside className="sidebar">
      {sidebarContent.map((section, index) => (
        <div key={index} className="nav-section">
          <h3>{section.title}</h3>
          <ul>
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={currentPath === item.href ? "active" : ""}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
```

---

## 10. 总结

`useSelectedLayoutSegments` 是用于获取当前路由段数组的客户端 Hook。本文介绍了:

1. **核心概念**: API 签名、工作原理、与其他 Hook 的对比
2. **实战场景**: 面包屑导航、多级导航、路径分析、条件布局、文档导航
3. **常见问题**: 与 usePathname 的区别、特定层级获取、并行路由、动态路由、服务端限制
4. **最佳实践**: 封装面包屑、类型安全、性能优化、空数组处理、路径构建
5. **注意事项**: 客户端专用、数组处理、不用于数据获取、路由组、避免过度计算
6. **性能优化**: 缓存路径计算、避免数组操作、条件渲染优化、调试技巧
7. **高级应用**: 智能面包屑、路由分析、动态侧边栏

关键要点:

- 只能在客户端组件中使用
- 返回当前路由的所有段组成的数组
- 适合用于面包屑和多级导航
- 不包含路由组
- 使用 useMemo 优化性能
- 不适合用于数据获取
- 注意避免频繁的数组操作
- 可以实现复杂的导航系统

通过正确使用 `useSelectedLayoutSegments`,可以轻松实现复杂的多级导航和面包屑功能。这个 Hook 特别适合需要展示完整路径层级的场景,如文档网站、后台管理系统等。

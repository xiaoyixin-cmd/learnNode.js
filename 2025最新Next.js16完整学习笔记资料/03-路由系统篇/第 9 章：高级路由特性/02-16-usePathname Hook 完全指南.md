**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# usePathname Hook 完全指南

## 1. 概述

`usePathname` 是 Next.js 16 App Router 提供的客户端 Hook,用于获取当前页面的路径名。它返回当前 URL 的路径部分,不包含域名、查询参数和哈希值。

### 1.1 概念定义

`usePathname` Hook 返回当前页面的路径字符串,如 `/blog/post-1`。

**关键特征**:

- **客户端专用**: 只能在 `'use client'` 组件中使用
- **路径字符串**: 返回纯路径,不含查询参数
- **实时更新**: 路由变化时自动更新
- **类型安全**: TypeScript 支持

**基本用法**:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();

  console.log(pathname); // '/blog/post-1'

  return <div>当前路径: {pathname}</div>;
}
```

### 1.2 核心价值

**路径感知组件**:

创建能够感知当前路径的组件,如导航菜单、面包屑等。

**条件渲染**:

根据当前路径渲染不同的内容或样式。

**路由监听**:

监听路由变化,执行相应的逻辑,如发送分析事件。

**简化代码**:

相比 Pages Router,获取路径更简单直接。

### 1.3 返回值示例

| URL                                 | usePathname 返回值 |
| :---------------------------------- | :----------------- |
| `https://example.com/`              | `/`                |
| `https://example.com/blog`          | `/blog`            |
| `https://example.com/blog/post-1`   | `/blog/post-1`     |
| `https://example.com/blog?page=2`   | `/blog`            |
| `https://example.com/blog#comments` | `/blog`            |

**注意**: 查询参数和哈希值不包含在返回值中。

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { usePathname } from "next/navigation";

function usePathname(): string | null;
```

**返回值**:

- 返回当前路径字符串,如 `/blog/post-1`
- 在服务端渲染时返回 `null`

**示例**:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();

  // pathname: '/blog/post-1'

  return <div>{pathname}</div>;
}
```

### 2.2 基本使用

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function CurrentPath() {
  const pathname = usePathname();

  return (
    <div>
      <h1>当前页面</h1>
      <p>路径: {pathname}</p>
    </div>
  );
}
```

### 2.3 与其他 Hook 组合

**与 useSearchParams 组合**:

```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function FullURL() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullURL = `${pathname}?${searchParams}`;

  return <div>完整 URL: {fullURL}</div>;
}
```

**与 useParams 组合**:

```tsx
"use client";

import { usePathname, useParams } from "next/navigation";

export default function RouteInfo() {
  const pathname = usePathname();
  const params = useParams();

  return (
    <div>
      <p>路径: {pathname}</p>
      <p>参数: {JSON.stringify(params)}</p>
    </div>
  );
}
```

### 2.4 监听路径变化

使用 `useEffect` 监听路径变化:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PathListener() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("路径变化:", pathname);

    // 发送分析事件
    analytics.pageView(pathname);
  }, [pathname]);

  return null;
}
```

### 2.5 服务端渲染注意事项

`usePathname` 在服务端渲染时返回 `null`:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();

  // 服务端渲染时 pathname 为 null
  if (!pathname) {
    return <div>加载中...</div>;
  }

  return <div>路径: {pathname}</div>;
}
```

---

## 3. 适用场景

### 3.1 活动导航链接

**场景**: 高亮显示当前页面的导航链接。

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于" },
  { href: "/blog", label: "博客" },
  { href: "/contact", label: "联系" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav>
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "active" : ""}
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
nav a {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
}

nav a.active {
  color: #000;
  font-weight: bold;
  border-bottom: 2px solid #000;
}
```

### 3.2 面包屑导航

**场景**: 根据当前路径生成面包屑导航。

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // 分割路径
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="面包屑">
      <Link href="/">首页</Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <span key={href}>
            {" / "}
            {isLast ? (
              <span>{segment}</span>
            ) : (
              <Link href={href}>{segment}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

### 3.3 条件渲染侧边栏

**场景**: 某些页面显示侧边栏,某些页面不显示。

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();

  // 这些页面不显示侧边栏
  const hideSidebar = ["/login", "/register", "/checkout"].includes(pathname);

  return (
    <div className="layout">
      {!hideSidebar && <Sidebar />}
      <main>{children}</main>
    </div>
  );
}
```

### 3.4 页面分析

**场景**: 每次路径变化时发送分析事件。

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // 发送页面浏览事件
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
```

### 3.5 路径匹配

**场景**: 检查当前路径是否匹配特定模式。

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();

  // 检查是否在博客页面
  const isBlogPage = pathname.startsWith("/blog");

  // 检查是否在用户资料页
  const isProfilePage = pathname.startsWith("/users/");

  // 检查是否在管理后台
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div>
      {isBlogPage && <BlogSidebar />}
      {isProfilePage && <ProfileActions />}
      {isAdminPage && <AdminTools />}
    </div>
  );
}
```

### 3.6 多级导航高亮

**场景**: 多级导航菜单,高亮当前路径及其父级。

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  {
    label: "产品",
    href: "/products",
    children: [
      { label: "所有产品", href: "/products/all" },
      { label: "新品", href: "/products/new" },
      { label: "促销", href: "/products/sale" },
    ],
  },
  {
    label: "文档",
    href: "/docs",
    children: [
      { label: "快速开始", href: "/docs/getting-started" },
      { label: "API 参考", href: "/docs/api" },
      { label: "示例", href: "/docs/examples" },
    ],
  },
];

export default function MultiLevelNav() {
  const pathname = usePathname();

  return (
    <nav>
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <div key={item.href}>
            <Link href={item.href} className={isActive ? "active" : ""}>
              {item.label}
            </Link>

            {isActive && item.children && (
              <ul>
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={pathname === child.href ? "active" : ""}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

### 3.7 路径变化动画

**场景**: 路径变化时触发动画。

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <div className={isAnimating ? "page-transition" : ""}>{children}</div>;
}
```

**CSS**:

```css
.page-transition {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3.8 路径历史记录

**场景**: 记录用户访问的路径历史。

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PathHistory() {
  const pathname = usePathname();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory((prev) => [...prev, pathname].slice(-10)); // 保留最近 10 条
  }, [pathname]);

  return (
    <div>
      <h3>访问历史</h3>
      <ul>
        {history.map((path, index) => (
          <li key={index}>{path}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. 基础与进阶使用

### 4.1 基础用法:获取当前路径

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function CurrentPath() {
  const pathname = usePathname();

  return <div>当前路径: {pathname}</div>;
}
```

### 4.2 中级用法:路径匹配

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function PathMatcher() {
  const pathname = usePathname();

  // 精确匹配
  const isHome = pathname === "/";

  // 前缀匹配
  const isBlog = pathname.startsWith("/blog");

  // 正则匹配
  const isUserProfile = /^\/users\/[^/]+$/.test(pathname);

  return (
    <div>
      <p>首页: {isHome ? "是" : "否"}</p>
      <p>博客: {isBlog ? "是" : "否"}</p>
      <p>用户资料: {isUserProfile ? "是" : "否"}</p>
    </div>
  );
}
```

### 4.3 高级用法:自定义 Hook

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

function usePathSegments() {
  const pathname = usePathname();

  return useMemo(() => {
    return pathname.split("/").filter(Boolean);
  }, [pathname]);
}

function useIsActivePath(path: string) {
  const pathname = usePathname();

  return useMemo(() => {
    return pathname === path || pathname.startsWith(path + "/");
  }, [pathname, path]);
}

export default function Component() {
  const segments = usePathSegments();
  const isActive = useIsActivePath("/blog");

  return (
    <div>
      <p>路径段: {segments.join(" > ")}</p>
      <p>博客激活: {isActive ? "是" : "否"}</p>
    </div>
  );
}
```

### 4.4 高级用法:路径国际化

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const locales = ["en", "zh", "ja"];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // 提取当前语言
  const currentLocale = pathname.split("/")[1];

  function switchLanguage(locale: string) {
    // 移除当前语言前缀
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");

    // 添加新语言前缀
    const newPath = `/${locale}${pathWithoutLocale}`;

    router.push(newPath);
  }

  return (
    <div>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          disabled={locale === currentLocale}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

### 4.5 高级用法:路径权限检查

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const protectedPaths = ["/admin", "/dashboard", "/settings"];

export default function ProtectedRoute({ children, isAuthenticated }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isProtected = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isProtected && !isAuthenticated) {
      router.push("/login");
    }
  }, [pathname, isAuthenticated, router]);

  return <>{children}</>;
}
```

### 4.6 高级用法:路径分析

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PathAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // 发送多个分析事件
    const events = [
      { name: "page_view", path: pathname },
      { name: "section_view", section: pathname.split("/")[1] },
    ];

    events.forEach((event) => {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", event.name, event);
      }
    });

    // 记录到本地存储
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");
    visits.push({ path: pathname, timestamp: Date.now() });
    localStorage.setItem("visits", JSON.stringify(visits.slice(-50)));
  }, [pathname]);

  return null;
}
```

---

## 5. 注意事项

### 5.1 只能在客户端组件中使用

`usePathname` 只能在客户端组件中使用:

```tsx
// ❌ 错误:服务端组件不能使用 usePathname
export default function ServerComponent() {
  const pathname = usePathname(); // 错误!
  return <div>...</div>;
}

// ✅ 正确:客户端组件
("use client");

export default function ClientComponent() {
  const pathname = usePathname(); // 正确
  return <div>...</div>;
}
```

### 5.2 服务端渲染返回 null

在服务端渲染时,`usePathname` 返回 `null`:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();

  // ❌ 可能出错:pathname 可能是 null
  const segments = pathname.split("/"); // 如果 pathname 是 null,会报错!

  // ✅ 正确:检查 null
  if (!pathname) {
    return <div>加载中...</div>;
  }

  const segments = pathname.split("/");
  return <div>{segments.join(" > ")}</div>;
}
```

### 5.3 不包含查询参数

`usePathname` 只返回路径,不包含查询参数:

```tsx
// URL: /blog?page=2&sort=date
const pathname = usePathname();
console.log(pathname); // '/blog' (不包含 ?page=2&sort=date)

// 如果需要查询参数,使用 useSearchParams
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
console.log(searchParams.get("page")); // '2'
```

### 5.4 不包含哈希值

`usePathname` 也不包含 URL 哈希值:

```tsx
// URL: /blog#comments
const pathname = usePathname();
console.log(pathname); // '/blog' (不包含 #comments)

// 如果需要哈希值,使用 window.location.hash
if (typeof window !== "undefined") {
  console.log(window.location.hash); // '#comments'
}
```

### 5.5 路径始终以 / 开头

返回的路径始终以 `/` 开头:

```tsx
const pathname = usePathname();
console.log(pathname); // '/blog' 或 '/' 或 '/blog/post-1'

// ❌ 错误:假设路径不以 / 开头
const segments = pathname.substring(1).split("/"); // 可能出错

// ✅ 正确:使用 split 和 filter
const segments = pathname.split("/").filter(Boolean);
```

### 5.6 性能考虑

避免在渲染期间执行昂贵的操作:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function Component() {
  const pathname = usePathname();

  // ✅ 使用 useMemo 缓存计算结果
  const segments = useMemo(() => {
    return pathname.split("/").filter(Boolean);
  }, [pathname]);

  const isActive = useMemo(() => {
    return pathname.startsWith("/blog");
  }, [pathname]);

  return (
    <div>
      <p>路径段: {segments.join(" > ")}</p>
      <p>博客激活: {isActive ? "是" : "否"}</p>
    </div>
  );
}
```

### 5.7 Suspense 边界

使用 `usePathname` 的组件应该包裹在 Suspense 中:

```tsx
import { Suspense } from "react";

function PathComponent() {
  const pathname = usePathname();
  return <div>{pathname}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <PathComponent />
    </Suspense>
  );
}
```

### 5.8 路径编码

路径会自动解码:

```tsx
// URL: /blog/hello%20world
const pathname = usePathname();
console.log(pathname); // '/blog/hello world' (已解码)
```

---

## 6. 常见问题

### 6.1 如何获取完整 URL?

组合 `usePathname` 和 `useSearchParams`:

```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function Component() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullURL = `${pathname}?${searchParams.toString()}`;

  return <div>完整 URL: {fullURL}</div>;
}
```

### 6.2 如何检查是否在特定页面?

使用精确匹配或前缀匹配:

```tsx
const pathname = usePathname();

// 精确匹配
const isHome = pathname === "/";
const isBlog = pathname === "/blog";

// 前缀匹配
const isBlogSection = pathname.startsWith("/blog");
const isAdminSection = pathname.startsWith("/admin");
```

### 6.3 如何提取路径段?

使用 `split` 方法:

```tsx
const pathname = usePathname(); // '/blog/2024/post-1'

const segments = pathname.split("/").filter(Boolean);
// ['blog', '2024', 'post-1']

const section = segments[0]; // 'blog'
const year = segments[1]; // '2024'
const slug = segments[2]; // 'post-1'
```

### 6.4 如何处理国际化路径?

提取语言前缀:

```tsx
const pathname = usePathname(); // '/zh/blog/post-1'

const segments = pathname.split("/").filter(Boolean);
const locale = segments[0]; // 'zh'
const pathWithoutLocale = "/" + segments.slice(1).join("/"); // '/blog/post-1'
```

### 6.5 如何监听路径变化?

使用 `useEffect`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Component() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("路径变化:", pathname);

    // 执行副作用
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
```

### 6.6 如何实现面包屑导航?

分割路径并生成链接:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav>
      <Link href="/">首页</Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <span key={href}>
            {" / "}
            {isLast ? (
              <span>{segment}</span>
            ) : (
              <Link href={href}>{segment}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

### 6.7 如何实现活动导航链接?

比较当前路径和链接路径:

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "active" : ""}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### 6.8 如何处理路径权限?

检查路径是否需要权限:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const protectedPaths = ["/admin", "/dashboard"];

export default function Component({ isAuthenticated }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isProtected = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isProtected && !isAuthenticated) {
      router.push("/login");
    }
  }, [pathname, isAuthenticated, router]);

  return null;
}
```

### 6.9 如何实现路径分析?

发送分析事件:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
```

### 6.10 如何创建自定义 Hook?

封装常用逻辑:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

function usePathSegments() {
  const pathname = usePathname();

  return useMemo(() => {
    return pathname.split("/").filter(Boolean);
  }, [pathname]);
}

function useIsActivePath(path: string) {
  const pathname = usePathname();

  return useMemo(() => {
    return pathname === path || pathname.startsWith(path + "/");
  }, [pathname, path]);
}

// 使用
export default function Component() {
  const segments = usePathSegments();
  const isActive = useIsActivePath("/blog");

  return (
    <div>
      <p>路径段: {segments.join(" > ")}</p>
      <p>博客激活: {isActive ? "是" : "否"}</p>
    </div>
  );
}
```

---

## 7. 总结

`usePathname` 是 Next.js App Router 中获取当前路径的核心 Hook。

**核心要点**:

1. **客户端专用**: 只能在 `'use client'` 组件中使用
2. **路径字符串**: 返回纯路径,不含查询参数和哈希值
3. **实时更新**: 路由变化时自动更新
4. **服务端渲染**: 在服务端渲染时返回 `null`
5. **自动解码**: URL 编码的路径会自动解码

**最佳实践**:

- 检查 `null` 值,处理服务端渲染
- 使用 `useMemo` 缓存计算结果
- 包裹在 Suspense 边界中
- 配合 `useSearchParams` 获取完整 URL
- 使用 `useEffect` 监听路径变化
- 创建自定义 Hook 封装常用逻辑

**适用场景**:

- 活动导航链接高亮
- 面包屑导航
- 条件渲染侧边栏
- 页面分析和跟踪
- 路径匹配和权限检查
- 多级导航菜单
- 路径变化动画
- 路径历史记录

**与其他 Hook 组合**:

| Hook            | 用途           | 返回值               |
| :-------------- | :------------- | :------------------- |
| usePathname     | 获取路径       | `/blog/post-1`       |
| useSearchParams | 获取查询参数   | `page=2&sort=date`   |
| useParams       | 获取动态参数   | `{ slug: 'post-1' }` |
| useRouter       | 导航和路由操作 | Router 对象          |

**注意事项**:

- 只返回路径,不包含查询参数和哈希值
- 服务端渲染时返回 `null`
- 路径始终以 `/` 开头
- 路径会自动解码
- 需要包裹在 Suspense 中

掌握 `usePathname`,可以创建路径感知的组件,实现导航高亮、面包屑等功能。

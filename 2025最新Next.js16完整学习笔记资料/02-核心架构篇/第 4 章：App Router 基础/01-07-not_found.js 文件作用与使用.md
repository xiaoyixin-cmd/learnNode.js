**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# not_found.js 文件作用与使用

## 概述

在 Next.js 16 的 App Router 中,`not-found.js` 是一个特殊的文件约定,用于处理 404 错误页面。它为开发者提供了统一、优雅的方式来处理找不到资源的情况,无论是页面不存在、数据未找到还是权限不足导致的访问拒绝。本文将全面深入地介绍 `not-found.js` 的工作原理、使用方法、最佳实践和各种实战场景,帮助开发者构建友好的错误处理体验。

### 什么是 not-found.js

`not-found.js` 是 Next.js App Router 的文件系统约定之一,用于定义 404 错误页面的 UI。当路由匹配失败或主动调用 `notFound()` 函数时,Next.js 会自动渲染最近的 `not-found.js` 组件。

**关键特性**:

- 文件系统级别的错误处理
- 支持嵌套和层级结构
- 可以是服务端组件或客户端组件
- 自动处理 404 状态码
- 支持自定义样式和交互

### 404 处理机制

Next.js 16 的 404 处理遵循以下流程:

```
请求路由 -> 路由匹配
    ↓ 未找到
调用 notFound() 函数
    ↓
查找最近的 not-found.js
    ↓
渲染 404 页面
    ↓
返回 404 状态码
```

### 与 Pages Router 的区别

**Pages Router (旧)**:

```typescript
// pages/404.js
export default function Custom404() {
  return <h1>404 - Page Not Found</h1>;
}
```

**App Router (新)**:

```typescript
// app/not-found.tsx
export default function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

// 可以嵌套在任何路由段
// app/blog/not-found.tsx
// app/products/not-found.tsx
```

## 第一部分:基础用法

### 1.1 创建根级 404 页面

在应用根目录创建全局 404 页面。

```typescript
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">页面未找到</h2>
        <p className="error-message">抱歉,您访问的页面不存在或已被删除。</p>

        <div className="error-actions">
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
          <Link href="/search" className="btn-secondary">
            搜索内容
          </Link>
        </div>

        <div className="helpful-links">
          <h3>您可能感兴趣的页面:</h3>
          <ul>
            <li>
              <Link href="/products">产品列表</Link>
            </li>
            <li>
              <Link href="/blog">博客文章</Link>
            </li>
            <li>
              <Link href="/about">关于我们</Link>
            </li>
            <li>
              <Link href="/contact">联系方式</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// app/not-found.module.css
/*
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  text-align: center;
  color: white;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 2.5rem;
  margin: 1rem 0;
}

.error-message {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-2px);
}

.helpful-links {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.helpful-links h3 {
  margin-bottom: 1rem;
}

.helpful-links ul {
  list-style: none;
  padding: 0;
}

.helpful-links li {
  margin: 0.5rem 0;
}

.helpful-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.helpful-links a:hover {
  opacity: 0.8;
  text-decoration: underline;
}
*/
```

### 1.2 嵌套的 404 页面

为不同路由段创建专属的 404 页面。

```typescript
// app/blog/not-found.tsx
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="blog-not-found">
      <h1>博客文章未找到</h1>
      <p>抱歉,您访问的文章不存在或已被删除。</p>

      <div className="suggestions">
        <h2>推荐阅读:</h2>
        <ul>
          <li>
            <Link href="/blog/latest">最新文章</Link>
          </li>
          <li>
            <Link href="/blog/popular">热门文章</Link>
          </li>
          <li>
            <Link href="/blog/categories">文章分类</Link>
          </li>
        </ul>
      </div>

      <Link href="/blog">返回博客首页</Link>
    </div>
  );
}

// app/products/not-found.tsx
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="product-not-found">
      <h1>产品未找到</h1>
      <p>该产品可能已下架或不存在。</p>

      <div className="alternatives">
        <h2>您可能感兴趣:</h2>
        <ul>
          <li>
            <Link href="/products/featured">精选产品</Link>
          </li>
          <li>
            <Link href="/products/new">新品上市</Link>
          </li>
          <li>
            <Link href="/products/sale">促销商品</Link>
          </li>
        </ul>
      </div>

      <Link href="/products">浏览所有产品</Link>
    </div>
  );
}

// app/docs/not-found.tsx
import Link from "next/link";

export default function DocsNotFound() {
  return (
    <div className="docs-not-found">
      <h1>文档页面未找到</h1>
      <p>您访问的文档不存在或URL可能有误。</p>

      <div className="search-suggestion">
        <h2>查找文档:</h2>
        <input
          type="search"
          placeholder="搜索文档..."
          className="search-input"
        />
      </div>

      <div className="common-docs">
        <h2>常用文档:</h2>
        <ul>
          <li>
            <Link href="/docs/getting-started">快速开始</Link>
          </li>
          <li>
            <Link href="/docs/api-reference">API 参考</Link>
          </li>
          <li>
            <Link href="/docs/guides">使用指南</Link>
          </li>
        </ul>
      </div>

      <Link href="/docs">返回文档首页</Link>
    </div>
  );
}

// 优先级顺序:
// 访问 /blog/unknown -> 使用 app/blog/not-found.tsx
// 访问 /products/999 -> 使用 app/products/not-found.tsx
// 访问 /unknown -> 使用 app/not-found.tsx
```

### 1.3 使用 notFound() 函数

主动触发 404 页面。

```typescript
// app/posts/[id]/page.tsx
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  // 获取文章数据
  const post = await fetch(`https://api.example.com/posts/${id}`)
    .then((res) => {
      if (!res.ok) {
        // API 返回404,触发 not-found 页面
        notFound();
      }
      return res.json();
    })
    .catch(() => {
      // 网络错误,也可以触发 404
      notFound();
    });

  // 数据验证
  if (!post || !post.published) {
    // 文章未发布,返回404
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// app/users/[username]/page.tsx
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  // 用户名验证
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    console.log("无效的用户名格式");
    notFound();
  }

  // 获取用户数据
  const user = await fetch(`https://api.example.com/users/${username}`)
    .then((res) => res.json())
    .catch(() => null);

  if (!user) {
    console.log("用户不存在:", username);
    notFound();
  }

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>@{user.username}</p>
      <p>{user.bio}</p>
    </div>
  );
}
```

### 1.4 客户端组件中使用 404

在客户端组件中触发 404。

```typescript
// app/search/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      // 没有搜索查询,重定向到首页
      router.push("/");
      return;
    }

    // 搜索
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results);
        setLoading(false);
      })
      .catch((error) => {
        console.error("搜索失败:", error);
        setLoading(false);
      });
  }, [query, router]);

  if (loading) {
    return <div>搜索中...</div>;
  }

  if (results.length === 0) {
    return (
      <div className="no-results">
        <h1>未找到结果</h1>
        <p>没有找到与 "{query}" 相关的内容</p>
        <button onClick={() => router.push("/")}>返回首页</button>
      </div>
    );
  }

  return (
    <div className="search-results">
      <h1>搜索结果: {query}</h1>
      <p>找到 {results.length} 条结果</p>
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}

// 注意:客户端组件不能直接调用 notFound()
// 需要使用 router.push() 导航到不存在的路由
// 或者重定向到一个返回 notFound() 的服务端组件
```

## 第二部分:高级用法

### 2.1 动态生成 404 页面

根据上下文生成不同的 404 内容。

```typescript
// app/products/[category]/[id]/not-found.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductNotFound() {
  const params = useParams();
  const category = params.category as string;
  const id = params.id as string;

  // 根据分类提供不同的建议
  const getCategorySuggestions = (cat: string) => {
    const suggestions: Record<
      string,
      Array<{ href: string; label: string }>
    > = {
      electronics: [
        { href: "/products/electronics/featured", label: "精选电子产品" },
        { href: "/products/electronics/new", label: "新品上市" },
        { href: "/products/electronics/sale", label: "促销商品" },
      ],
      clothing: [
        { href: "/products/clothing/featured", label: "精选服饰" },
        { href: "/products/clothing/new", label: "新款上市" },
        { href: "/products/clothing/sale", label: "折扣专区" },
      ],
      books: [
        { href: "/products/books/bestsellers", label: "畅销书籍" },
        { href: "/products/books/new", label: "新书推荐" },
        { href: "/products/books/sale", label: "特价书籍" },
      ],
    };

    return (
      suggestions[cat] || [
        { href: "/products", label: "所有产品" },
        { href: "/products/featured", label: "精选商品" },
        { href: "/products/new", label: "新品上市" },
      ]
    );
  };

  const suggestions = getCategorySuggestions(category);

  return (
    <div className="product-not-found">
      <h1>产品未找到</h1>
      <p className="error-details">
        分类: <strong>{category}</strong> | 产品ID: <strong>{id}</strong>
      </p>
      <p>该产品可能已下架、售罄或不存在。</p>

      <div className="suggestions">
        <h2>在 {category} 分类中浏览其他产品:</h2>
        <ul>
          {suggestions.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="search-section">
        <h2>或者搜索您想要的产品:</h2>
        <form action="/search" method="get">
          <input
            type="search"
            name="q"
            placeholder="搜索产品..."
            defaultValue={id}
          />
          <button type="submit">搜索</button>
        </form>
      </div>

      <Link href={`/products/${category}`}>返回 {category} 分类</Link>
    </div>
  );
}
```

### 2.2 404 页面 with 分析追踪

记录 404 错误供分析。

```typescript
// app/not-found.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 记录404错误
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    console.error("404 Error:", {
      url,
      pathname,
      search: searchParams.toString(),
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // 发送到分析服务
    fetch("/api/analytics/404", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        pathname,
        search: searchParams.toString(),
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      }),
    }).catch((error) => {
      console.error("Failed to log 404:", error);
    });

    // 发送到 Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_not_found", {
        page_path: url,
        page_referrer: document.referrer,
      });
    }
  }, [pathname, searchParams]);

  return (
    <div className="not-found-page">
      <h1>404 - 页面未找到</h1>
      <p>
        请求的页面不存在: <code>{pathname}</code>
      </p>
      <Link href="/">返回首页</Link>
    </div>
  );
}

// app/api/analytics/404/route.ts
import { NextRequest, NextResponse } from "next/server";

interface NotFoundLog {
  url: string;
  pathname: string;
  search: string;
  referrer: string;
  timestamp: string;
}

// 存储404日志(生产环境应该使用数据库)
const logs: NotFoundLog[] = [];

export async function POST(request: NextRequest) {
  try {
    const data: NotFoundLog = await request.json();

    // 保存日志
    logs.push(data);

    // 只保留最近1000条记录
    if (logs.length > 1000) {
      logs.shift();
    }

    console.log("404 日志记录:", data);

    // 在生产环境中,这里应该:
    // 1. 保存到数据库
    // 2. 发送到日志服务(如Sentry, LogRocket)
    // 3. 触发告警(如果404率过高)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("记录404错误失败:", error);
    return NextResponse.json({ error: "Failed to log 404" }, { status: 500 });
  }
}

// 获取404统计
export async function GET(request: NextRequest) {
  // 计算404统计
  const stats = {
    total: logs.length,
    lastHour: logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      const hourAgo = Date.now() - 60 * 60 * 1000;
      return logTime > hourAgo;
    }).length,
    topPaths: getTopPaths(logs, 10),
  };

  return NextResponse.json(stats);
}

function getTopPaths(logs: NotFoundLog[], limit: number) {
  const pathCounts = new Map<string, number>();

  logs.forEach((log) => {
    const count = pathCounts.get(log.pathname) || 0;
    pathCounts.set(log.pathname, count + 1);
  });

  return Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, count]) => ({ path, count }));
}
```

### 2.3 国际化的 404 页面

支持多语言的 404 页面。

```typescript
// app/[lang]/not-found.tsx
import { getDictionary } from "@/lib/dictionaries";
import Link from "next/link";

interface NotFoundProps {
  params: Promise<{ lang: string }>;
}

export default async function NotFound({ params }: NotFoundProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="not-found-page">
      <h1>{dict.notFound.title}</h1>
      <p>{dict.notFound.message}</p>

      <div className="actions">
        <Link href={`/${lang}`}>{dict.notFound.backHome}</Link>
        <Link href={`/${lang}/search`}>{dict.notFound.search}</Link>
      </div>

      <div className="helpful-links">
        <h2>{dict.notFound.helpfulLinks}</h2>
        <ul>
          <li>
            <Link href={`/${lang}/products`}>{dict.nav.products}</Link>
          </li>
          <li>
            <Link href={`/${lang}/blog`}>{dict.nav.blog}</Link>
          </li>
          <li>
            <Link href={`/${lang}/about`}>{dict.nav.about}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

// lib/dictionaries.ts
const dictionaries = {
  zh: {
    notFound: {
      title: "404 - 页面未找到",
      message: "抱歉,您访问的页面不存在或已被删除。",
      backHome: "返回首页",
      search: "搜索内容",
      helpfulLinks: "您可能感兴趣的页面",
    },
    nav: {
      products: "产品列表",
      blog: "博客文章",
      about: "关于我们",
    },
  },
  en: {
    notFound: {
      title: "404 - Page Not Found",
      message:
        "Sorry, the page you are looking for does not exist or has been removed.",
      backHome: "Back to Home",
      search: "Search",
      helpfulLinks: "You might be interested in",
    },
    nav: {
      products: "Products",
      blog: "Blog",
      about: "About Us",
    },
  },
};

export async function getDictionary(lang: string) {
  return dictionaries[lang as keyof typeof dictionaries] || dictionaries.zh;
}
```

### 2.4 交互式 404 页面

创建有趣的交互式 404 体验。

```typescript
// app/not-found.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, autoRedirect, router]);

  return (
    <div className="interactive-404">
      <div className="error-animation">
        <div className="floating-404">
          <span className="digit">4</span>
          <span className="digit rotating">0</span>
          <span className="digit">4</span>
        </div>
      </div>

      <h1>哎呀!页面走丢了</h1>
      <p>我们正在派遣搜救队寻找...</p>

      {autoRedirect && countdown > 0 && (
        <div className="countdown">
          <p>
            {countdown} 秒后自动返回首页
            <button onClick={() => setAutoRedirect(false)}>取消</button>
          </p>
        </div>
      )}

      <div className="actions">
        <Link href="/" className="btn-primary">
          立即返回首页
        </Link>
        <button onClick={() => router.back()} className="btn-secondary">
          返回上一页
        </button>
      </div>

      <div className="mini-game">
        <h3>等待的时候玩个小游戏?</h3>
        <MiniGame />
      </div>
    </div>
  );
}

function MiniGame() {
  const [score, setScore] = useState(0);
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    setClicks((prev) => prev + 1);
    setScore((prev) => prev + Math.floor(Math.random() * 10) + 1);
  };

  return (
    <div className="mini-game-content">
      <button onClick={handleClick} className="game-button">
        点击我!
      </button>
      <div className="game-stats">
        <p>点击次数: {clicks}</p>
        <p>得分: {score}</p>
      </div>
    </div>
  );
}

// globals.css
/*
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.floating-404 {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.digit {
  font-size: 6rem;
  font-weight: bold;
  animation: float 3s ease-in-out infinite;
}

.digit:nth-child(1) {
  animation-delay: 0s;
}

.digit:nth-child(2) {
  animation-delay: 0.2s;
}

.digit:nth-child(3) {
  animation-delay: 0.4s;
}

.rotating {
  animation: rotate 4s linear infinite;
}

.interactive-404 {
  text-align: center;
  padding: 4rem 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.countdown {
  margin: 2rem 0;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.countdown button {
  margin-left: 1rem;
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.mini-game {
  margin-top: 3rem;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 1rem;
}

.game-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.1s;
}

.game-button:active {
  transform: scale(0.95);
}

.game-stats {
  margin-top: 1rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
}
*/
```

## 第三部分:实战场景

### 3.1 电商产品页 404

优化电商产品不存在的用户体验。

```typescript
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import db from "@/lib/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // 获取产品
  const product = await db.products.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // 检查产品状态
  if (product.status === "deleted" || product.status === "discontinued") {
    notFound();
  }

  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      <p>价格: ¥{product.price}</p>
      <p>{product.description}</p>
    </div>
  );
}

// app/products/[id]/not-found.tsx
("use client");

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductNotFound() {
  const params = useParams();
  const productId = params.id as string;
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    // 获取相似产品推荐
    fetch(`/api/products/similar?id=${productId}`)
      .then((res) => res.json())
      .then((data) => setSimilarProducts(data.products))
      .catch(() => {});

    // 获取最近浏览的产品
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentlyViewed(viewed);
  }, [productId]);

  return (
    <div className="product-not-found">
      <div className="error-message">
        <h1>产品未找到</h1>
        <p>
          产品 ID: <code>{productId}</code>
        </p>
        <p className="reason">该产品可能:</p>
        <ul>
          <li>已售罄或下架</li>
          <li>链接已过期</li>
          <li>URL输入错误</li>
        </ul>
      </div>

      {similarProducts.length > 0 && (
        <section className="similar-products">
          <h2>您可能感兴趣的产品</h2>
          <div className="product-grid">
            {similarProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="product-card"
              >
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="price">¥{product.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="recently-viewed">
          <h2>您最近浏览过</h2>
          <div className="product-grid">
            {recentlyViewed.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="product-card"
              >
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="actions">
        <Link href="/products" className="btn-primary">
          浏览所有产品
        </Link>
        <Link href="/products/featured" className="btn-secondary">
          查看精选产品
        </Link>
        <Link href="/products/new" className="btn-secondary">
          查看新品
        </Link>
      </div>
    </div>
  );
}
```

### 3.2 博客文章 404

处理博客文章不存在的情况。

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // 获取文章
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(
    (res) => (res.ok ? res.json() : null)
  );

  if (!post || post.status !== "published") {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// app/blog/[slug]/not-found.tsx
("use client");

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BlogPostNotFound() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    // 基于slug搜索相关文章
    const keywords = slug.split("-").filter((word) => word.length > 2);

    if (keywords.length > 0) {
      fetch(`/api/blog/search?q=${keywords.join(" ")}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data.posts.slice(0, 5)))
        .catch(() => {});
    }
  }, [slug]);

  return (
    <div className="blog-not-found">
      <div className="error-hero">
        <h1>文章未找到</h1>
        <p className="slug-info">
          请求的文章: <code>{slug}</code>
        </p>
        <p>该文章可能已被删除、移动或从未存在过。</p>
      </div>

      {suggestions.length > 0 && (
        <section className="suggestions">
          <h2>您可能在找这些文章?</h2>
          <ul className="post-list">
            {suggestions.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`}>
                  <h3>{post.title}</h3>
                  <p className="excerpt">{post.excerpt}</p>
                  <div className="meta">
                    <span>{post.category}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="browse-options">
        <h2>浏览博客内容</h2>
        <div className="options-grid">
          <Link href="/blog" className="option-card">
            <h3>所有文章</h3>
            <p>浏览全部博客文章</p>
          </Link>

          <Link href="/blog/categories" className="option-card">
            <h3>文章分类</h3>
            <p>按主题浏览文章</p>
          </Link>

          <Link href="/blog/popular" className="option-card">
            <h3>热门文章</h3>
            <p>查看最受欢迎的文章</p>
          </Link>

          <Link href="/blog/latest" className="option-card">
            <h3>最新文章</h3>
            <p>阅读最新发布的内容</p>
          </Link>
        </div>
      </section>

      <section className="search-section">
        <h2>搜索文章</h2>
        <form action="/blog/search" method="get">
          <input
            type="search"
            name="q"
            placeholder="搜索文章..."
            defaultValue={slug.replace(/-/g, " ")}
          />
          <button type="submit">搜索</button>
        </form>
      </section>
    </div>
  );
}
```

### 3.3 用户资料 404

处理用户不存在的情况。

```typescript
// app/users/[username]/page.tsx
import { notFound } from "next/navigation";
import db from "@/lib/database";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  // 验证用户名格式
  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    notFound();
  }

  // 获取用户
  const user = await db.users.findUnique({
    where: { username },
  });

  if (
    !user ||
    user.accountStatus === "deleted" ||
    user.accountStatus === "suspended"
  ) {
    notFound();
  }

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>@{user.username}</p>
      <p>{user.bio}</p>
    </div>
  );
}

// app/users/[username]/not-found.tsx
("use client");

import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserNotFound() {
  const params = useParams();
  const username = params.username as string;

  return (
    <div className="user-not-found">
      <div className="error-content">
        <div className="avatar-placeholder">
          <span className="icon">👤</span>
        </div>

        <h1>用户未找到</h1>
        <p className="username">@{username}</p>

        <div className="reasons">
          <p>可能的原因:</p>
          <ul>
            <li>用户名拼写错误</li>
            <li>该用户不存在</li>
            <li>账号已被删除或暂停</li>
            <li>账号设置为私密</li>
          </ul>
        </div>

        <div className="suggestions">
          <h2>尝试以下操作:</h2>
          <ul>
            <li>检查用户名拼写是否正确</li>
            <li>搜索相似的用户名</li>
            <li>浏览推荐用户</li>
          </ul>
        </div>

        <div className="actions">
          <Link href="/users/explore" className="btn-primary">
            发现用户
          </Link>
          <Link href="/search?type=users" className="btn-secondary">
            搜索用户
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## 常见问题

### Q1: not-found.js 和 error.js 有什么区别?

**A**: 不同的错误类型:

- **not-found.js**: 处理 404 错误(资源未找到)
- **error.js**: 处理运行时错误(500 等)

```typescript
// not-found.js - 资源未找到
export default function NotFound() {
  return <h1>404 - 页面未找到</h1>;
}

// error.tsx - 运行时错误
("use client");
export default function Error({ error, reset }) {
  return (
    <div>
      <h1>出错了!</h1>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### Q2: 如何为不同路由段使用不同的 404 页面?

**A**: 在对应路由目录创建 not-found.js:

```
app/
  not-found.tsx          # 全局404
  blog/
    not-found.tsx        # 博客404
    [slug]/
      page.tsx
  products/
    not-found.tsx        # 产品404
    [id]/
      page.tsx
```

Next.js 会使用最近的 not-found.js 文件。

### Q3: notFound() 函数可以在客户端组件中使用吗?

**A**: 不能直接使用:

```typescript
// ❌ 错误:客户端组件不能调用 notFound()
"use client";
import { notFound } from "next/navigation";

export default function ClientComponent() {
  if (condition) {
    notFound(); // 报错
  }
}

// ✓ 正确:在服务端组件中调用
export default async function ServerComponent() {
  if (condition) {
    notFound(); // 正确
  }
}

// ✓ 替代方案:客户端重定向
("use client");
import { useRouter } from "next/navigation";

export default function ClientComponent() {
  const router = useRouter();

  if (condition) {
    router.push("/not-found-page");
  }
}
```

### Q4: 如何设置自定义的 404 状态码?

**A**: Next.js 自动处理:

使用 `notFound()` 函数或渲染 `not-found.js` 时,Next.js 会自动设置 404 状态码。无需手动配置。

```typescript
// 服务端组件
export default async function Page() {
  notFound(); // 自动返回 404 状态码
}
```

### Q5: 如何测试 404 页面?

**A**: 多种测试方法:

```typescript
// 1. 直接访问不存在的路由
// http://localhost:3000/nonexistent

// 2. 在页面中调用 notFound()
export default function Page() {
  notFound();
}

// 3. 使用测试工具
import { render } from "@testing-library/react";
import NotFound from "./not-found";

test("renders 404 page", () => {
  const { getByText } = render(<NotFound />);
  expect(getByText("404")).toBeInTheDocument();
});
```

## 适用场景

### 1. 电商平台

- 产品不存在或下架
- 分类页面不存在
- 用户资料不存在

### 2. 内容网站

- 文章已删除或移动
- 分类或标签不存在
- 搜索无结果

### 3. SaaS 应用

- 项目或资源不存在
- 权限不足(伪装成 404)
- 功能未启用

### 4. 社交平台

- 用户不存在或已删除
- 帖子已删除
- 私密内容访问

## 注意事项

### 1. SEO 考虑

- 确保返回正确的 404 状态码
- 提供有用的替代链接
- 不要阻止搜索引擎索引

### 2. 用户体验

- 提供清晰的错误信息
- 给出解决方案和替代选项
- 保持品牌一致性
- 添加搜索功能

### 3. 性能优化

- 避免在 404 页面加载大量资源
- 使用适当的缓存策略
- 优化图片和动画

### 4. 错误追踪

- 记录 404 错误
- 分析常见的 404 路径
- 设置告警阈值
- 定期审查和修复

## 总结

`not-found.js` 是 Next.js 16 App Router 中处理 404 错误的标准方式。通过合理使用这个特性,可以为用户提供友好的错误处理体验,同时帮助开发者更好地管理和追踪应用中的错误。

### 核心要点回顾

1. **文件约定**: 在任何路由段创建 not-found.js
2. **notFound() 函数**: 主动触发 404 页面
3. **嵌套支持**: 不同路由段可以有专属的 404 页面
4. **状态码处理**: 自动返回 404 HTTP 状态码
5. **灵活定制**: 支持服务端和客户端组件

### 最佳实践总结

- 为不同路由段创建专属的 404 页面
- 提供有用的导航和搜索选项
- 记录 404 错误用于分析
- 添加相关内容推荐
- 保持品牌一致性
- 优化页面性能
- 支持国际化
- 添加适当的交互元素

掌握 `not-found.js` 的使用,能够帮助开发者构建更专业、更友好的错误处理体验,提升应用的整体质量和用户满意度。

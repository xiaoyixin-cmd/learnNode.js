**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 01-06-error.js 文件作用与使用

## 概述

### 什么是 error.js

`error.js` (或 `error.tsx`) 是 Next.js App Router 中用于定义错误边界 (Error Boundary) 的特殊文件。它基于 React 的错误边界机制,在路由段发生运行时错误时自动显示错误 UI,并提供错误恢复功能,显著提升应用的健壮性和用户体验。

在 Next.js 16 中,`error.js` 能够捕获服务端组件和客户端组件的错误,自动将路由段包装在 React Error Boundary 中,实现细粒度的错误隔离和处理。

### error.js 的核心价值

**1. 自动错误隔离**

- 错误被限制在特定路由段
- 其他部分保持正常运行
- 避免整个应用崩溃

**2. 用户友好的错误 UI**

- 显示有意义的错误消息
- 提供错误恢复选项
- 保持应用交互性

**3. 错误恢复能力**

- `reset()` 函数重试渲染
- 无需刷新页面
- 提升用户体验

**4. 开发调试支持**

- 开发模式显示详细错误信息
- 生产模式隐藏敏感信息
- 错误哈希用于日志追踪

### 错误处理的重要性

**问题场景**:

```
应用运行 → 发生错误 → 整个应用崩溃 → 用户看到空白屏幕
```

**使用 error.js 后**:

```
应用运行 → 发生错误 → 错误边界捕获 → 显示错误 UI + 恢复按钮 → 用户可重试
```

### 版本演进

| 版本         | 错误处理方式        | 特点           | 限制         |
| ------------ | ------------------- | -------------- | ------------ |
| Next.js 1-12 | 手动 Error Boundary | 需要手动实现   | 繁琐,易遗漏  |
| Next.js 13   | `error.js` 引入     | 自动错误边界   | 仅客户端组件 |
| Next.js 14   | 增强错误边界        | 支持服务端错误 | 部分边缘情况 |
| Next.js 15   | 优化错误处理        | 更好的错误信息 | 学习曲线     |
| Next.js 16   | 完整错误管理        | 稳定,全面支持  | 当前最佳实践 |

---

## 第一部分:error.js 基础

### 1.1 error.js 文件结构

#### 基础语法

```typescript
// app/dashboard/error.tsx
"use client"; // Error组件必须是客户端组件

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>出错了!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

#### 完整类型定义

```typescript
// app/posts/error.tsx
"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PostsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录错误到日志服务
    console.error("Posts error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>文章加载失败</h2>
      <p className="error-message">{error.message}</p>
      {error.digest && <p className="error-digest">错误ID: {error.digest}</p>}
      <button onClick={reset} className="retry-button">
        重新加载
      </button>
    </div>
  );
}
```

### 1.2 error.js Props

#### error 属性

`error` 包含错误实例和可选的 digest。

```typescript
// error 对象结构
{
  name: string;        // 错误名称,如 "Error"
  message: string;     // 错误消息
  digest?: string;     // 服务端错误的哈希,用于日志匹配
  stack?: string;      // 堆栈跟踪 (仅开发模式)
}
```

**开发模式 vs 生产模式**:

```typescript
// 开发模式
error.message = "Failed to fetch posts: Network error";
error.stack = "Error: Failed to fetch...\n at fetchPosts...";

// 生产模式
error.message = "An error occurred in the Server Components render";
error.digest = "2584257794"; // 用于日志查找
```

#### reset 函数

`reset` 尝试重新渲染错误边界内的内容。

```typescript
// app/products/error.tsx
"use client";

export default function ProductsError({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>产品加载失败</h2>
      <button
        onClick={() => {
          console.log("Attempting to reset...");
          reset(); // 重新渲染 products/page.tsx
        }}
      >
        重试
      </button>
    </div>
  );
}
```

**reset 的工作原理**:

1. 清除错误边界状态
2. 重新渲染被包装的组件
3. 如果仍然出错,再次显示错误 UI

### 1.3 error.js 的作用域

#### 路由段级别

```
app/
├── blog/
│   ├── error.tsx        # 捕获 /blog 及其子路由的错误
│   ├── page.tsx         # /blog
│   └── [id]/
│       └── page.tsx     # /blog/:id - 错误被父级 error.tsx 捕获
```

```typescript
// app/blog/error.tsx
"use client";

export default function BlogError({ error, reset }: ErrorProps) {
  return <div>博客错误: {error.message}</div>;
}

// 访问 /blog 或 /blog/123 发生的错误都会被此组件捕获
```

#### 嵌套错误边界

```
app/
├── error.tsx            # 全局错误边界 (除根布局外)
├── dashboard/
│   ├── error.tsx        # 仪表板错误边界
│   ├── page.tsx
│   └── analytics/
│       ├── error.tsx    # 分析错误边界 (覆盖父级)
│       └── page.tsx
```

```typescript
// app/error.tsx - 全局错误边界
"use client";

export default function GlobalError({ error, reset }: ErrorProps) {
  return <div>应用错误: {error.message}</div>;
}

// app/dashboard/analytics/error.tsx - 优先级更高
("use client");

export default function AnalyticsError({ error, reset }: ErrorProps) {
  return <div>分析错误: {error.message}</div>;
}

// 访问 /dashboard/analytics 时,错误被 analytics/error.tsx 捕获
```

### 1.4 错误边界层次

#### 错误冒泡

错误会向上冒泡到最近的父级错误边界。

```
app/
├── error.tsx            # Level 1: 全局错误边界
├── layout.tsx
├── page.tsx
└── dashboard/
    ├── error.tsx        # Level 2: 仪表板错误边界
    ├── layout.tsx
    ├── page.tsx
    └── settings/
        └── page.tsx     # 错误 → dashboard/error.tsx
```

```typescript
// app/dashboard/settings/page.tsx
export default async function SettingsPage() {
  throw new Error("Settings error!");
  // 错误被 app/dashboard/error.tsx 捕获,而非 app/error.tsx
}
```

#### 错误边界不捕获的错误

`error.js` **不会**捕获以下错误:

1. 同级 `layout.js` 中的错误
2. 根 `app/layout.js` 中的错误 (需要使用 `global-error.js`)

```
app/
├── layout.tsx           # 错误不被 error.tsx 捕获
├── error.tsx            # 不捕获同级 layout.tsx 的错误
└── page.tsx             # 错误被 error.tsx 捕获
```

---

## 第二部分:错误处理模式

### 2.1 基础错误 UI

#### 简单错误提示

```typescript
// app/error.tsx
"use client";

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="error-simple">
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

```css
/* styles/error.css */
.error-simple {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 32px;
  text-align: center;
}

.error-simple h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #dc2626;
}

.error-simple p {
  margin-bottom: 24px;
  color: #6b7280;
}

.error-simple button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

#### 详细错误卡片

```typescript
// app/products/error.tsx
"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="error-card">
      <div className="error-icon">
        <AlertCircle size={48} color="#dc2626" />
      </div>

      <h2 className="error-title">产品加载失败</h2>

      <p className="error-message">{error.message}</p>

      {error.digest && (
        <div className="error-digest">
          <span>错误代码:</span>
          <code>{error.digest}</code>
        </div>
      )}

      <div className="error-actions">
        <button onClick={reset} className="btn-primary">
          <RefreshCw size={16} />
          <span>重试</span>
        </button>

        <button onClick={() => router.push("/")} className="btn-secondary">
          <Home size={16} />
          <span>返回首页</span>
        </button>
      </div>
    </div>
  );
}
```

### 2.2 错误日志记录

#### 集成日志服务

```typescript
// app/error.tsx
"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 发送错误到 Sentry
    Sentry.captureException(error, {
      tags: {
        source: "error-boundary",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="error-container">
      <h2>出错了</h2>
      <p>我们已记录此错误,稍后会修复</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

#### 自定义日志函数

```typescript
// lib/logger.ts
export function logError(error: Error, context?: Record<string, any>) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    digest: (error as any).digest,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // 发送到日志服务
  if (process.env.NODE_ENV === "production") {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorLog),
    });
  } else {
    console.error("Error:", errorLog);
  }
}

// app/dashboard/error.tsx
("use client");

import { useEffect } from "react";
import { logError } from "@/lib/logger";

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logError(error, {
      page: "dashboard",
      userAgent: navigator.userAgent,
    });
  }, [error]);

  return (
    <div>
      <h2>仪表板错误</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 2.3 条件错误渲染

#### 根据错误类型显示不同 UI

```typescript
// app/api-data/error.tsx
"use client";

export default function ApiDataError({ error, reset }: ErrorProps) {
  // 网络错误
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return (
      <div className="error-network">
        <h2>网络连接失败</h2>
        <p>请检查您的网络连接</p>
        <button onClick={reset}>重试</button>
      </div>
    );
  }

  // 认证错误
  if (error.message.includes("401") || error.message.includes("Unauthorized")) {
    return (
      <div className="error-auth">
        <h2>认证失败</h2>
        <p>请重新登录</p>
        <a href="/login">前往登录</a>
      </div>
    );
  }

  // 权限错误
  if (error.message.includes("403") || error.message.includes("Forbidden")) {
    return (
      <div className="error-permission">
        <h2>权限不足</h2>
        <p>您没有访问此资源的权限</p>
        <a href="/">返回首页</a>
      </div>
    );
  }

  // 默认错误
  return (
    <div className="error-generic">
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

#### 开发 vs 生产环境

```typescript
// app/error.tsx
"use client";

export default function Error({ error, reset }: ErrorProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="error-container">
      <h2>应用错误</h2>

      {isDev ? (
        // 开发模式:显示详细错误
        <div className="error-dev">
          <p>
            <strong>消息:</strong> {error.message}
          </p>
          {error.digest && (
            <p>
              <strong>Digest:</strong> {error.digest}
            </p>
          )}
          {error.stack && <pre className="error-stack">{error.stack}</pre>}
        </div>
      ) : (
        // 生产模式:简化错误消息
        <div className="error-prod">
          <p>很抱歉,发生了意外错误</p>
          <p className="error-id">错误ID: {error.digest || "未知"}</p>
        </div>
      )}

      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 2.4 错误恢复策略

#### 基础重试

```typescript
// app/posts/error.tsx
"use client";

export default function PostsError({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>文章加载失败</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

#### 服务端恢复

```typescript
// app/data/error.tsx
"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function DataError({ error, reset }: ErrorProps) {
  const router = useRouter();

  const handleReset = () => {
    // 结合路由刷新实现服务端恢复
    startTransition(() => {
      router.refresh(); // 刷新服务端数据
      reset(); // 重置错误边界
    });
  };

  return (
    <div>
      <h2>数据加载失败</h2>
      <button onClick={handleReset}>刷新数据</button>
    </div>
  );
}
```

#### 限制重试次数

```typescript
// app/api-call/error.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApiCallError({ error, reset }: ErrorProps) {
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const maxRetries = 3;

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(retryCount + 1);
      reset();
    }
  };

  if (retryCount >= maxRetries) {
    return (
      <div className="error-max-retries">
        <h2>多次重试失败</h2>
        <p>请稍后再试或联系支持团队</p>
        <button onClick={() => router.push("/")}>返回首页</button>
      </div>
    );
  }

  return (
    <div>
      <h2>请求失败</h2>
      <p>
        重试次数: {retryCount}/{maxRetries}
      </p>
      <button onClick={handleRetry}>重试</button>
    </div>
  );
}
```

---

## 第三部分:全局错误处理

### 3.1 global-error.js

`global-error.js` 用于捕获根布局中的错误。

#### 基础用法

```typescript
// app/global-error.tsx
"use client";

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
        <div className="global-error">
          <h2>应用出错了</h2>
          <p>{error.message}</p>
          <button onClick={reset}>重试</button>
        </div>
      </body>
    </html>
  );
}
```

**注意**: `global-error.js` 必须定义自己的 `<html>` 和 `<body>` 标签。

#### 完整全局错误 UI

```typescript
// app/global-error.tsx
"use client";

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="global-error-container">
          <div className="global-error-content">
            <svg
              className="error-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            <h1>糟糕!出错了</h1>

            <p className="error-message">
              {error.message || "应用发生了意外错误"}
            </p>

            <div className="error-actions">
              <button onClick={reset} className="btn-primary">
                重新加载应用
              </button>

              <a href="/" className="btn-secondary">
                返回首页
              </a>
            </div>

            {error.digest && (
              <p className="error-digest">
                错误代码: <code>{error.digest}</code>
              </p>
            )}
          </div>
        </div>

        <style jsx>{`
          .global-error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            background: #f3f4f6;
          }

          .global-error-content {
            max-width: 500px;
            text-align: center;
          }

          .error-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            color: #dc2626;
          }

          h1 {
            font-size: 32px;
            margin-bottom: 16px;
            color: #111827;
          }

          .error-message {
            font-size: 16px;
            margin-bottom: 32px;
            color: #6b7280;
          }

          .error-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 24px;
          }

          .btn-primary {
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          .btn-secondary {
            padding: 12px 24px;
            background: white;
            color: #3b82f6;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            text-decoration: none;
          }

          .error-digest {
            font-size: 14px;
            color: #9ca3af;
          }

          code {
            padding: 2px 6px;
            background: #e5e7eb;
            border-radius: 4px;
            font-family: monospace;
          }
        `}</style>
      </body>
    </html>
  );
}
```

### 3.2 错误边界嵌套

```
app/
├── global-error.tsx     # 全局错误 (最后防线)
├── layout.tsx           # 根布局
├── error.tsx            # 应用级错误
├── page.tsx
└── dashboard/
    ├── layout.tsx
    ├── error.tsx        # 仪表板错误
    ├── page.tsx
    └── analytics/
        ├── error.tsx    # 分析错误 (最优先)
        └── page.tsx
```

**错误捕获优先级**:

1. `dashboard/analytics/error.tsx` (最高)
2. `dashboard/error.tsx`
3. `app/error.tsx`
4. `app/global-error.tsx` (最低,兜底)

---

## 第四部分:实战应用

### 4.1 API 调用错误处理

```typescript
// app/api-users/error.tsx
"use client";

import { useEffect } from "react";

export default function ApiUsersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 记录 API 错误
    console.error("API Error:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isNetworkError =
    error.message.includes("fetch") || error.message.includes("network");

  const isServerError =
    error.message.includes("500") ||
    error.message.includes("Internal Server Error");

  return (
    <div className="api-error-container">
      {isNetworkError && (
        <div className="error-network">
          <h2>网络连接失败</h2>
          <p>无法连接到服务器,请检查您的网络连接</p>
        </div>
      )}

      {isServerError && (
        <div className="error-server">
          <h2>服务器错误</h2>
          <p>服务器遇到了问题,请稍后再试</p>
        </div>
      )}

      {!isNetworkError && !isServerError && (
        <div className="error-generic">
          <h2>数据加载失败</h2>
          <p>{error.message}</p>
        </div>
      )}

      <button onClick={reset} className="retry-button">
        重试
      </button>
    </div>
  );
}
```

### 4.2 数据库错误处理

```typescript
// app/users/error.tsx
"use client";

import { useRouter } from "next/navigation";

export default function UsersError({ error, reset }: ErrorProps) {
  const router = useRouter();

  const isDatabaseError =
    error.message.includes("database") ||
    error.message.includes("query") ||
    error.message.includes("connection");

  if (isDatabaseError) {
    return (
      <div className="database-error">
        <h2>数据库连接失败</h2>
        <p>无法连接到数据库,请稍后再试</p>

        <div className="error-actions">
          <button onClick={reset}>重试</button>
          <button onClick={() => router.push("/")}>返回首页</button>
        </div>

        {error.digest && <p className="error-id">错误ID: {error.digest}</p>}
      </div>
    );
  }

  return (
    <div className="generic-error">
      <h2>用户数据加载失败</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 4.3 认证错误处理

```typescript
// app/protected/error.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedError({ error, reset }: ErrorProps) {
  const router = useRouter();

  const isAuthError =
    error.message.includes("401") ||
    error.message.includes("Unauthorized") ||
    error.message.includes("authenticated");

  useEffect(() => {
    if (isAuthError) {
      // 认证错误:清除本地存储并重定向到登录
      localStorage.removeItem("auth-token");

      const timer = setTimeout(() => {
        router.push("/login?redirect=/protected");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthError, router]);

  if (isAuthError) {
    return (
      <div className="auth-error">
        <h2>认证失败</h2>
        <p>您的登录已过期,正在跳转到登录页...</p>
      </div>
    );
  }

  return (
    <div className="error">
      <h2>页面加载失败</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 4.4 表单提交错误

```typescript
// app/contact/error.tsx
"use client";

import { useState } from "react";

export default function ContactError({ error, reset }: ErrorProps) {
  const [supportTicket, setSupportTicket] = useState<string | null>(null);

  const handleCreateTicket = async () => {
    try {
      const res = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          digest: error.digest,
          page: "/contact",
        }),
      });

      const data = await res.json();
      setSupportTicket(data.ticketId);
    } catch (err) {
      console.error("Failed to create support ticket:", err);
    }
  };

  return (
    <div className="form-error">
      <h2>表单提交失败</h2>
      <p>{error.message}</p>

      <div className="error-actions">
        <button onClick={reset} className="btn-primary">
          重试
        </button>

        {!supportTicket && (
          <button onClick={handleCreateTicket} className="btn-secondary">
            联系支持
          </button>
        )}
      </div>

      {supportTicket && (
        <div className="support-ticket">
          <p>支持工单已创建</p>
          <p>工单号: {supportTicket}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 适用场景

### 何时使用 error.js

**1. 数据获取错误**

- API 调用失败
- 数据库查询错误
- 网络连接问题

**2. 运行时错误**

- JavaScript 执行错误
- 组件渲染错误
- 状态管理错误

**3. 第三方服务错误**

- 支付网关失败
- 外部 API 错误
- 认证服务问题

**4. 用户输入错误**

- 表单验证失败
- 文件上传错误
- 数据格式错误

### 何时使用 global-error.js

**1. 根布局错误**

- 全局 providers 错误
- 根布局渲染失败
- 应用级配置错误

**2. 兜底错误处理**

- 所有其他错误边界未捕获的错误
- 最后的防线
- 确保应用不会完全崩溃

---

## 注意事项

### 1. 必须是客户端组件

```typescript
// ❌ 错误:error.js 必须是客户端组件
export default function Error({ error, reset }: ErrorProps) {
  return <div>...</div>;
}

// ✅ 正确:添加 'use client' 指令
("use client");

export default function Error({ error, reset }: ErrorProps) {
  return <div>...</div>;
}
```

### 2. 不捕获同级 layout 错误

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  throw new Error("Layout error!");
  // 不会被 app/dashboard/error.tsx 捕获
  // 需要在父级 (app/error.tsx) 捕获
}
```

### 3. 生产环境隐藏敏感信息

```typescript
// ✅ 推荐:根据环境显示错误信息
"use client";

export default function Error({ error }: ErrorProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div>
      <h2>出错了</h2>
      {isDev ? (
        <p>{error.message}</p> // 开发:显示详细信息
      ) : (
        <p>发生了意外错误</p> // 生产:隐藏细节
      )}
    </div>
  );
}
```

### 4. reset 仅重新渲染

```typescript
// reset() 不会:
// - 清除服务端缓存
// - 重新获取服务端数据
// - 刷新路由

// 如需服务端刷新:
import { useRouter } from "next/navigation";
import { startTransition } from "react";

const router = useRouter();

const handleReset = () => {
  startTransition(() => {
    router.refresh(); // 刷新服务端
    reset(); // 重置错误边界
  });
};
```

---

## 常见问题

### Q1: error.js 和 try-catch 有什么区别?

**答**:

- `error.js` 捕获组件渲染错误和异步错误
- `try-catch` 仅捕获同步代码错误

```typescript
// try-catch 示例
async function getData() {
  try {
    const res = await fetch("...");
    return res.json();
  } catch (error) {
    console.error(error);
    return null; // 需要手动处理
  }
}

// error.js 自动捕获组件错误
export default async function Page() {
  const data = await getData(); // 错误被 error.js 捕获
  return <div>{data.title}</div>;
}
```

### Q2: 如何捕获根布局的错误?

**答**: 使用 `global-error.js`。

```typescript
// app/global-error.tsx
"use client";

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html>
      <body>
        <h2>全局错误: {error.message}</h2>
        <button onClick={reset}>重试</button>
      </body>
    </html>
  );
}
```

### Q3: reset() 函数何时有效?

**答**: reset() 有效的情况:

- 暂时性错误 (网络波动)
- 用户操作导致的错误
- 状态相关的错误

```typescript
// 有效:网络错误可能恢复
async function fetchData() {
  const res = await fetch("..."); // 网络错误,reset 可能成功
  return res.json();
}

// 无效:代码错误,reset 无济于事
function Component() {
  const x = undefined;
  return <div>{x.property}</div>; // TypeError,reset 无用
}
```

### Q4: 如何区分客户端和服务端错误?

**答**: 通过错误消息和 digest。

```typescript
"use client";

export default function Error({ error }: ErrorProps) {
  const isServerError = !!error.digest; // 服务端错误有 digest

  return (
    <div>
      {isServerError ? (
        <p>服务端错误: {error.digest}</p>
      ) : (
        <p>客户端错误: {error.message}</p>
      )}
    </div>
  );
}
```

### Q5: 可以在 error.js 中导航吗?

**答**: 可以。

```typescript
"use client";

import { useRouter } from "next/navigation";

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div>
      <h2>错误</h2>
      <button onClick={reset}>重试</button>
      <button onClick={() => router.push("/")}>返回首页</button>
    </div>
  );
}
```

### Q6: 如何测试 error.js?

**答**: 人为抛出错误。

```typescript
// app/test/page.tsx
export default function TestPage() {
  throw new Error("Test error!");
  return <div>This will not render</div>;
}

// app/test/error.tsx
("use client");

export default function TestError({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>捕获到测试错误</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### Q7: error.js 影响 SEO 吗?

**答**: 不影响,因为:

- 错误边界仅在运行时激活
- 搜索引擎爬虫看到的是成功渲染的内容
- 错误页面不会被索引

### Q8: 如何优雅地降级?

**答**: 使用条件渲染和后备内容。

```typescript
// app/optional-data/page.tsx
async function getData() {
  try {
    const res = await fetch("...");
    return res.json();
  } catch {
    return null; // 降级为 null
  }
}

export default async function Page() {
  const data = await getData();

  if (!data) {
    return <div>暂无数据</div>; // 优雅降级
  }

  return <div>{data.content}</div>;
}
```

### Q9: 可以自定义错误类型吗?

**答**: 可以。

```typescript
// lib/errors.ts
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// app/error.tsx
("use client");

export default function Error({ error, reset }: ErrorProps) {
  if (error.name === "AuthError") {
    return <div>认证错误: {error.message}</div>;
  }

  if (error.name === "NetworkError") {
    return <div>网络错误: {error.message}</div>;
  }

  return <div>未知错误: {error.message}</div>;
}
```

### Q10: 如何防止错误循环?

**答**: 限制重试次数。

```typescript
"use client";

import { useState } from "react";

export default function Error({ error, reset }: ErrorProps) {
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handleReset = () => {
    if (attempts < maxAttempts) {
      setAttempts(attempts + 1);
      reset();
    }
  };

  if (attempts >= maxAttempts) {
    return (
      <div>
        <h2>多次重试失败</h2>
        <p>请联系支持团队</p>
      </div>
    );
  }

  return (
    <div>
      <h2>错误</h2>
      <p>
        尝试次数: {attempts}/{maxAttempts}
      </p>
      <button onClick={handleReset}>重试</button>
    </div>
  );
}
```

---

## 总结

### 核心要点

1. **error.js 的作用**

   - 捕获路由段的运行时错误
   - 提供错误 UI 和恢复功能
   - 基于 React Error Boundary

2. **Props**

   - `error`: 错误实例 + digest
   - `reset`: 重新渲染函数

3. **作用域**

   - 路由段级别
   - 支持嵌套覆盖
   - 错误向上冒泡

4. **global-error.js**

   - 捕获根布局错误
   - 最后的错误防线
   - 必须定义 `<html>` 和 `<body>`

5. **错误恢复**

   - `reset()` 重新渲染
   - 结合 `router.refresh()` 刷新服务端
   - 限制重试次数

6. **最佳实践**
   - 必须是客户端组件
   - 记录错误到日志服务
   - 根据环境显示错误信息
   - 提供用户友好的 UI

---

**下一篇**: [01-07-not_found.js 文件作用与使用](./01-07-not_found.js文件作用与使用.md)将详细介绍 404 页面的实现和自定义。

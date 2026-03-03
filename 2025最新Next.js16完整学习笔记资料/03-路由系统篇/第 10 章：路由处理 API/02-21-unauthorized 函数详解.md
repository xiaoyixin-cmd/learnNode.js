**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# unauthorized 函数详解

## 1. 概述

`unauthorized` 是 Next.js 16 新增的函数,用于在服务端触发 401 Unauthorized 响应,表示用户未认证。它会渲染最近的 `unauthorized.tsx` 文件。

### 1.1 概念定义

`unauthorized` 函数用于表示用户未登录或认证失败,触发 401 错误处理流程。

**关键特征**:

- **服务端专用**: 只能在服务端环境使用
- **认证检查**: 表示未认证
- **自定义 UI**: 渲染 `unauthorized.tsx` 组件
- **HTTP 401**: 返回 401 状态码

**基本用法**:

```tsx
import { unauthorized } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    unauthorized(); // 触发 401
  }

  return <div>受保护的内容</div>;
}
```

### 1.2 核心价值

**明确的认证语义**:

401 明确表示"未认证",与 403(禁止访问)和 404(未找到)区分开来。

**安全性**:

在服务端检查认证状态,客户端无法绕过。

**用户体验**:

提供清晰的提示,引导用户登录。

**标准化**:

符合 HTTP 标准,与其他系统集成更容易。

### 1.3 认证流程对比

| 状态             | HTTP 状态码 | Next.js 函数     | 用户操作   |
| :--------------- | :---------- | :--------------- | :--------- |
| 未登录           | 401         | `unauthorized()` | 需要登录   |
| 已登录但权限不足 | 403         | `forbidden()`    | 联系管理员 |
| 资源不存在       | 404         | `notFound()`     | 检查 URL   |

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { unauthorized } from "next/navigation";

function unauthorized(): never;
```

**参数**:

无参数

**返回值**:

`never` - 函数永远不会正常返回

**示例**:

```tsx
import { unauthorized } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  return <div>受保护的内容</div>;
}
```

### 2.2 工作原理

`unauthorized` 函数通过抛出特殊错误来触发 401 处理:

```tsx
// Next.js 内部实现(简化版)
export function unauthorized(): never {
  const error = new Error("NEXT_UNAUTHORIZED");
  error.digest = "NEXT_UNAUTHORIZED";
  throw error;
}
```

**执行流程**:

1. 调用 `unauthorized()`
2. 抛出 `NEXT_UNAUTHORIZED` 错误
3. Next.js 捕获该错误
4. 查找最近的 `unauthorized.tsx` 文件
5. 渲染 401 页面
6. 返回 HTTP 401 状态码

### 2.3 unauthorized.tsx 文件

创建 `unauthorized.tsx` 文件来自定义 401 页面:

```tsx
// app/unauthorized.tsx
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div>
      <h1>401 - 未授权</h1>
      <p>您需要登录才能访问此页面。</p>
      <Link href="/login">前往登录</Link>
    </div>
  );
}
```

**文件位置**:

- `app/unauthorized.tsx`: 全局 401 页面
- `app/dashboard/unauthorized.tsx`: 仪表板路由的 401 页面
- `app/profile/unauthorized.tsx`: 个人资料路由的 401 页面

### 2.4 在不同环境中使用

**服务端组件**:

```tsx
// app/dashboard/page.tsx
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  return (
    <div>
      <h1>欢迎, {session.user.name}</h1>
      <DashboardContent />
    </div>
  );
}
```

**Server Actions**:

```tsx
"use server";

import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  await updateUserProfile(session.user.id, formData);
}
```

**Route Handlers**:

```tsx
// app/api/user/route.ts
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  return Response.json({ user: session.user });
}
```

### 2.5 与 redirect 结合使用

有时需要在检查认证后重定向到登录页:

```tsx
import { unauthorized } from "next/navigation";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    // 方案 1: 显示 401 页面
    unauthorized();

    // 方案 2: 重定向到登录页
    // redirect('/login');
  }

  return <div>内容</div>;
}
```

**选择建议**:

- 使用 `unauthorized()`: 想显示自定义的 401 页面
- 使用 `redirect('/login')`: 直接跳转到登录页

---

## 3. 适用场景

### 3.1 受保护的页面

**场景**: 用户必须登录才能访问的页面。

```tsx
// app/profile/page.tsx
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  return (
    <div>
      <h1>个人资料</h1>
      <UserProfile user={session.user} />
    </div>
  );
}

// app/profile/unauthorized.tsx
import Link from "next/link";

export default function ProfileUnauthorized() {
  return (
    <div>
      <h1>请先登录</h1>
      <p>您需要登录才能查看个人资料。</p>
      <Link href="/login?redirect=/profile">登录</Link>
      <Link href="/register">注册新账号</Link>
    </div>
  );
}
```

### 3.2 API 认证

**场景**: API 端点需要认证。

```tsx
// app/api/posts/route.ts
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const data = await request.json();
  const post = await createPost({
    ...data,
    authorId: session.user.id,
  });

  return Response.json(post);
}
```

### 3.3 Server Actions 认证

**场景**: 表单提交需要认证。

```tsx
// app/posts/new/page.tsx
import { createPost } from "./actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">发布</button>
    </form>
  );
}

// app/posts/new/actions.ts
("use server");

import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function createPost(formData: FormData) {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const post = await savePost({
    title: formData.get("title"),
    content: formData.get("content"),
    authorId: session.user.id,
  });

  redirect(`/posts/${post.id}`);
}
```

### 3.4 会话过期处理

**场景**: 检查会话是否过期。

```tsx
// app/dashboard/page.tsx
import { unauthorized } from "next/navigation";
import { getSession, isSessionExpired } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || isSessionExpired(session)) {
    unauthorized();
  }

  return <div>仪表板内容</div>;
}

// app/dashboard/unauthorized.tsx
export default function DashboardUnauthorized() {
  return (
    <div>
      <h1>会话已过期</h1>
      <p>您的登录会话已过期,请重新登录。</p>
      <a href="/login?redirect=/dashboard">重新登录</a>
    </div>
  );
}
```

## 4. 高级用法

### 4.1 Token 验证

```tsx
// app/api/protected/route.ts
import { unauthorized } from "next/navigation";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    unauthorized();
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyToken(token);
    // 处理请求
    return Response.json({ data: "Protected data" });
  } catch (error) {
    unauthorized();
  }
}
```

### 4.2 多因素认证检查

```tsx
// app/admin/page.tsx
import { unauthorized } from "next/navigation";
import { getSession, hasMFAEnabled, isMFAVerified } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  // 检查是否需要 MFA
  if (hasMFAEnabled(session.user) && !isMFAVerified(session)) {
    redirect("/mfa/verify?redirect=/admin");
  }

  return <div>管理员面板</div>;
}
```

### 4.3 API Key 认证

```tsx
// app/api/webhook/route.ts
import { unauthorized } from "next/navigation";

const VALID_API_KEYS = process.env.API_KEYS?.split(",") || [];

export async function POST(request: Request) {
  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    unauthorized();
  }

  // 处理 webhook
  return Response.json({ success: true });
}
```

### 4.4 OAuth 认证检查

```tsx
// app/api/github/repos/route.ts
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || !session.user.githubAccessToken) {
    unauthorized();
  }

  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${session.user.githubAccessToken}`,
    },
  });

  const repos = await response.json();
  return Response.json(repos);
}
```

### 4.5 自定义认证逻辑

```tsx
// lib/auth.ts
export async function requireAuth(
  options: {
    requireEmailVerified?: boolean;
    requireMFA?: boolean;
    minRole?: "user" | "editor" | "admin";
  } = {}
) {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  if (options.requireEmailVerified && !session.user.emailVerified) {
    redirect("/verify-email");
  }

  if (options.requireMFA && !isMFAVerified(session)) {
    redirect("/mfa/verify");
  }

  if (options.minRole) {
    const roleHierarchy = { user: 0, editor: 1, admin: 2 };
    if (roleHierarchy[session.user.role] < roleHierarchy[options.minRole]) {
      forbidden();
    }
  }

  return session;
}

// 使用
export default async function Page() {
  const session = await requireAuth({
    requireEmailVerified: true,
    requireMFA: true,
    minRole: "editor",
  });

  return <div>受保护的内容</div>;
}
```

## 5. 与其他错误处理的对比

### 5.1 unauthorized vs forbidden

| 特性        | unauthorized (401) | forbidden (403)  |
| ----------- | ------------------ | ---------------- |
| 含义        | 未认证             | 已认证但无权限   |
| 使用场景    | 需要登录           | 权限不足         |
| 用户操作    | 登录               | 联系管理员或升级 |
| HTTP 状态码 | 401                | 403              |

```tsx
// 正确使用
export default async function Page() {
  const session = await getSession();

  // 场景 1: 未登录 -> unauthorized
  if (!session) {
    unauthorized();
  }

  // 场景 2: 已登录但权限不足 -> forbidden
  if (session.user.role !== "admin") {
    forbidden();
  }

  return <div>管理员内容</div>;
}
```

### 5.2 unauthorized vs redirect

| 特性     | unauthorized          | redirect       |
| -------- | --------------------- | -------------- |
| 用途     | 触发错误处理          | 导航到其他页面 |
| UI       | 显示 unauthorized.tsx | 跳转到目标页面 |
| 状态码   | 401                   | 307/308        |
| 适用场景 | 需要显示错误信息      | 直接跳转登录页 |

```tsx
// 方案 1: 使用 unauthorized (显示错误页面)
export default async function Page() {
  const session = await getSession();

  if (!session) {
    unauthorized(); // 显示 unauthorized.tsx
  }

  return <div>内容</div>;
}

// 方案 2: 使用 redirect (直接跳转)
export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/protected"); // 跳转到登录页
  }

  return <div>内容</div>;
}
```

### 5.3 错误处理决策树

```typescript
// lib/auth-check.ts
import { unauthorized, forbidden, redirect } from "next/navigation";

export async function checkAuth(
  options: {
    requireAuth?: boolean;
    requireRole?: "user" | "editor" | "admin";
    redirectToLogin?: boolean;
    loginUrl?: string;
  } = {}
) {
  const session = await getSession();

  // 1. 检查是否需要认证
  if (options.requireAuth && !session) {
    if (options.redirectToLogin) {
      redirect(options.loginUrl || "/login");
    } else {
      unauthorized();
    }
  }

  // 2. 检查角色权限
  if (options.requireRole && session) {
    const roleHierarchy = { user: 0, editor: 1, admin: 2 };
    if (roleHierarchy[session.user.role] < roleHierarchy[options.requireRole]) {
      forbidden();
    }
  }

  return session;
}

// 使用
export default async function Page() {
  const session = await checkAuth({
    requireAuth: true,
    requireRole: "editor",
    redirectToLogin: false, // 显示错误页面而非重定向
  });

  return <div>内容</div>;
}
```

## 常见问题

### 1. unauthorized 和 redirect 有什么区别?

**区别**:

| 方面       | unauthorized      | redirect             |
| ---------- | ----------------- | -------------------- |
| 用途       | 显示错误页面      | 跳转到其他页面       |
| 用户体验   | 看到错误信息      | 直接到登录页         |
| 返回原页面 | 需要手动实现      | 可通过 redirect 参数 |
| 适用场景   | API、需要错误提示 | 页面、直接登录       |

```tsx
// 场景 1: API 端点 - 使用 unauthorized
export async function GET() {
  const session = await getSession();

  if (!session) {
    unauthorized(); // 返回 401 状态码
  }

  return Response.json({ data: "Protected" });
}

// 场景 2: 页面 - 使用 redirect
export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/protected"); // 跳转到登录页
  }

  return <div>内容</div>;
}
```

### 2. 如何自定义 unauthorized 页面?

创建 `unauthorized.tsx` 文件:

```tsx
// app/unauthorized.tsx (全局)
export default function GlobalUnauthorized() {
  return (
    <div className="error-page">
      <h1>401 - 未授权</h1>
      <p>您需要登录才能访问此资源。</p>
      <a href="/login">登录</a>
      <a href="/register">注册</a>
    </div>
  );
}

// app/dashboard/unauthorized.tsx (仪表板区域)
export default function DashboardUnauthorized() {
  return (
    <div className="error-page">
      <h1>会话已过期</h1>
      <p>您的登录会话已过期,请重新登录。</p>
      <a href="/login?redirect=/dashboard">重新登录</a>
    </div>
  );
}
```

### 3. 可以在客户端组件中使用 unauthorized 吗?

不可以。`unauthorized` 只能在服务端使用:

```tsx
// ❌ 错误 - 客户端组件
"use client";

import { unauthorized } from "next/navigation";

export default function ClientComponent() {
  const user = useUser();

  if (!user) {
    unauthorized(); // 错误!
  }

  return <div>内容</div>;
}

// ✅ 正确 - 服务端组件
import { unauthorized } from "next/navigation";

export default async function ServerComponent() {
  const session = await getSession();

  if (!session) {
    unauthorized(); // 正确
  }

  return <div>内容</div>;
}

// ✅ 正确 - 客户端重定向
("use client");

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientComponent() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (!user) {
      router.push("/login"); // 重定向到登录页
    }
  }, [user, router]);

  return <div>内容</div>;
}
```

### 4. 如何处理会话过期?

```tsx
// lib/session.ts
export async function getValidSession() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  // 检查会话是否过期
  const now = Date.now();
  const expiresAt = new Date(session.expiresAt).getTime();

  if (now > expiresAt) {
    // 清除过期会话
    await clearSession();
    unauthorized();
  }

  // 检查是否需要刷新
  const refreshThreshold = expiresAt - 5 * 60 * 1000; // 5分钟前
  if (now > refreshThreshold) {
    await refreshSession(session);
  }

  return session;
}

// 使用
export default async function Page() {
  const session = await getValidSession();

  return <div>内容</div>;
}
```

### 5. 如何记录未授权访问?

```tsx
// lib/logger.ts
export async function logUnauthorizedAccess(
  ip: string,
  resource: string,
  userAgent: string
) {
  await db.securityLog.create({
    data: {
      ip,
      resource,
      userAgent,
      type: "UNAUTHORIZED",
      timestamp: new Date(),
    },
  });
}

// app/protected/page.tsx
import { unauthorized } from "next/navigation";
import { headers } from "next/headers";
import { logUnauthorizedAccess } from "@/lib/logger";

export default async function ProtectedPage() {
  const session = await getSession();

  if (!session) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await logUnauthorizedAccess(ip, "/protected", userAgent);
    unauthorized();
  }

  return <div>受保护的内容</div>;
}
```

## 适用场景

### 1. 用户仪表板

```tsx
// app/dashboard/page.tsx
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  return (
    <div>
      <h1>欢迎, {session.user.name}</h1>
      <UserStats userId={session.user.id} />
    </div>
  );
}

// app/dashboard/unauthorized.tsx
export default function DashboardUnauthorized() {
  return (
    <div>
      <h1>需要登录</h1>
      <p>请登录以访问您的仪表板。</p>
      <a href="/login?redirect=/dashboard">登录</a>
    </div>
  );
}
```

### 2. API 端点保护

```tsx
// app/api/user/profile/route.ts
import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const profile = await getUserProfile(session.user.id);
  return Response.json(profile);
}

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const data = await request.json();
  await updateUserProfile(session.user.id, data);

  return Response.json({ success: true });
}
```

### 3. Server Actions 保护

```tsx
// app/actions.ts
"use server";

import { unauthorized } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: formData.get("name"),
      bio: formData.get("bio"),
    },
  });

  revalidatePath("/profile");
}
```

### 4. 订阅内容访问

```tsx
// app/premium/content/page.tsx
import { unauthorized } from "next/navigation";
import { getSession, hasActiveSubscription } from "@/lib/auth";

export default async function PremiumContentPage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const hasSubscription = await hasActiveSubscription(session.user.id);

  if (!hasSubscription) {
    redirect("/subscribe");
  }

  return <div>高级内容</div>;
}
```

## 注意事项

### 1. 服务端专用

`unauthorized` 只能在服务端使用,不能在客户端组件中调用。

### 2. 与 redirect 的选择

- 使用 `unauthorized`: 需要显示错误信息时
- 使用 `redirect`: 直接跳转到登录页时

### 3. 会话管理

定期检查会话有效性,及时清除过期会话。

### 4. 安全日志

记录未授权访问尝试,用于安全审计。

### 5. 用户体验

提供清晰的登录链接和返回原页面的机制。

## 总结

`unauthorized` 函数是 Next.js 16 中用于认证检查的重要工具。本文介绍了:

1. **基础用法**: 在服务端组件、API 路由、Server Actions 中使用
2. **实战场景**: 页面保护、API 保护、会话过期处理
3. **高级用法**: Token 验证、MFA 检查、API Key 认证、OAuth
4. **错误对比**: unauthorized vs forbidden vs redirect
5. **最佳实践**: 会话管理、安全日志、用户体验

关键要点:

- 仅在服务端使用
- 明确区分 401 和 403
- 提供自定义 unauthorized.tsx
- 记录安全事件
- 合理选择 unauthorized 或 redirect
- 实现会话刷新机制

通过正确使用 `unauthorized` 函数,可以实现安全、用户友好的认证系统。

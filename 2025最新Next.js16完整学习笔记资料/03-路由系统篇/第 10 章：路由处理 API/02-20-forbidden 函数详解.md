**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# forbidden 函数详解

## 1. 概述

`forbidden` 是 Next.js 16 新增的函数,用于在服务端触发 403 Forbidden 响应,表示用户无权访问请求的资源。它会渲染最近的 `forbidden.tsx` 文件。

### 1.1 概念定义

`forbidden` 函数用于表示用户已认证但无权访问资源,触发 403 错误处理流程。

**关键特征**:

- **服务端专用**: 只能在服务端环境使用
- **权限控制**: 表示权限不足
- **自定义 UI**: 渲染 `forbidden.tsx` 组件
- **HTTP 403**: 返回 403 状态码

**基本用法**:

```tsx
import { forbidden } from "next/navigation";

export default async function Page() {
  const user = await getUser();

  if (user.role !== "admin") {
    forbidden(); // 触发 403
  }

  return <div>管理员内容</div>;
}
```

### 1.2 核心价值

**明确的权限语义**:

403 明确表示"禁止访问",与 404(未找到)和 401(未认证)区分开来。

**安全性**:

在服务端检查权限,客户端无法绕过。

**用户体验**:

提供清晰的错误提示,告诉用户为什么无法访问。

**SEO 友好**:

正确的 HTTP 状态码,搜索引擎能正确处理。

### 1.3 HTTP 状态码对比

| 状态码 | 含义         | Next.js 函数     | 使用场景         |
| :----- | :----------- | :--------------- | :--------------- |
| 401    | Unauthorized | `unauthorized()` | 未登录           |
| 403    | Forbidden    | `forbidden()`    | 已登录但权限不足 |
| 404    | Not Found    | `notFound()`     | 资源不存在       |

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { forbidden } from "next/navigation";

function forbidden(): never;
```

**参数**:

无参数

**返回值**:

`never` - 函数永远不会正常返回

**示例**:

```tsx
import { forbidden } from "next/navigation";

export default async function AdminPage() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    forbidden();
  }

  return <div>管理员面板</div>;
}
```

### 2.2 工作原理

`forbidden` 函数通过抛出特殊错误来触发 403 处理:

```tsx
// Next.js 内部实现(简化版)
export function forbidden(): never {
  const error = new Error("NEXT_FORBIDDEN");
  error.digest = "NEXT_FORBIDDEN";
  throw error;
}
```

**执行流程**:

1. 调用 `forbidden()`
2. 抛出 `NEXT_FORBIDDEN` 错误
3. Next.js 捕获该错误
4. 查找最近的 `forbidden.tsx` 文件
5. 渲染 403 页面
6. 返回 HTTP 403 状态码

### 2.3 forbidden.tsx 文件

创建 `forbidden.tsx` 文件来自定义 403 页面:

```tsx
// app/forbidden.tsx
export default function Forbidden() {
  return (
    <div>
      <h1>403 - 禁止访问</h1>
      <p>抱歉,您没有权限访问此页面。</p>
      <a href="/">返回首页</a>
    </div>
  );
}
```

**文件位置**:

- `app/forbidden.tsx`: 全局 403 页面
- `app/admin/forbidden.tsx`: 管理员路由的 403 页面
- `app/dashboard/forbidden.tsx`: 仪表板路由的 403 页面

### 2.4 在不同环境中使用

**服务端组件**:

```tsx
// app/admin/page.tsx
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    forbidden();
  }

  return <div>管理员面板</div>;
}
```

**Server Actions**:

```tsx
"use server";

import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function deletePost(postId: string) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    forbidden();
  }

  await deletePostById(postId);
}
```

**Route Handlers**:

```tsx
// app/api/admin/route.ts
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    forbidden();
  }

  const data = await getAdminData();
  return Response.json(data);
}
```

### 2.5 与 unauthorized 的区别

| 函数             | 状态码 | 含义     | 使用场景             |
| :--------------- | :----- | :------- | :------------------- |
| `unauthorized()` | 401    | 未认证   | 用户未登录           |
| `forbidden()`    | 403    | 禁止访问 | 用户已登录但权限不足 |

**示例**:

```tsx
import { unauthorized, forbidden } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  // 未登录
  if (!session) {
    unauthorized();
  }

  // 已登录但不是管理员
  if (session.user.role !== "admin") {
    forbidden();
  }

  return <div>管理员内容</div>;
}
```

---

## 3. 适用场景

### 3.1 角色权限控制

**场景**: 只有管理员可以访问管理面板。

```tsx
// app/admin/page.tsx
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    forbidden();
  }

  return (
    <div>
      <h1>管理员仪表板</h1>
      <AdminStats />
      <UserManagement />
    </div>
  );
}

// app/admin/forbidden.tsx
export default function AdminForbidden() {
  return (
    <div>
      <h1>访问被拒绝</h1>
      <p>只有管理员可以访问此页面。</p>
      <p>如果您认为这是错误,请联系管理员。</p>
      <a href="/dashboard">返回仪表板</a>
    </div>
  );
}
```

### 3.2 资源所有权检查

**场景**: 用户只能编辑自己的文章。

```tsx
// app/posts/[id]/edit/page.tsx
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;
  const post = await getPost(id);

  // 检查是否是文章作者
  if (post.authorId !== session.user.id) {
    forbidden();
  }

  return <PostEditor post={post} />;
}
```

### 3.3 订阅功能限制

**场景**: 只有付费用户可以访问高级功能。

```tsx
// app/premium/page.tsx
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PremiumPage() {
  const session = await getSession();

  if (!session || !session.user.isPremium) {
    forbidden();
  }

  return (
    <div>
      <h1>高级功能</h1>
      <PremiumFeatures />
    </div>
  );
}

// app/premium/forbidden.tsx
export default function PremiumForbidden() {
  return (
    <div>
      <h1>需要高级会员</h1>
      <p>此功能仅对高级会员开放。</p>
      <a href="/pricing">查看定价</a>
      <a href="/">返回首页</a>
    </div>
  );
}
```

### 3.4 API 权限控制

**场景**: API 端点需要特定权限。

```tsx
// app/api/users/route.ts
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    forbidden();
  }

  const users = await getAllUsers();
  return Response.json(users);
}

export async function DELETE(request: Request) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    forbidden();
  }

  const { userId } = await request.json();
  await deleteUser(userId);

  return Response.json({ success: true });
}
```

## 4. 高级用法

### 4.1 条件权限检查

```tsx
// app/posts/[id]/edit/page.tsx
import { forbidden } from "next/navigation";
import { getPost } from "@/lib/posts";
import { getSession } from "@/lib/auth";

export default async function EditPostPage({ params }) {
  const session = await getSession();
  const post = await getPost(params.id);

  // 检查是否是作者或管理员
  const canEdit =
    session &&
    (post.authorId === session.user.id || session.user.role === "admin");

  if (!canEdit) {
    forbidden();
  }

  return <EditPostForm post={post} />;
}
```

### 4.2 基于时间的权限

```tsx
// app/early-access/page.tsx
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function EarlyAccessPage() {
  const session = await getSession();
  const now = new Date();
  const releaseDate = new Date("2024-12-01");

  // 检查是否是早期访问用户或已到发布日期
  const hasAccess = session?.user.earlyAccess || now >= releaseDate;

  if (!hasAccess) {
    forbidden();
  }

  return <div>早期访问内容</div>;
}

// app/early-access/forbidden.tsx
export default function EarlyAccessForbidden() {
  return (
    <div>
      <h1>早期访问</h1>
      <p>此功能将于 2024 年 12 月 1 日向所有用户开放。</p>
      <a href="/waitlist">加入等待列表</a>
    </div>
  );
}
```

### 4.3 资源所有权检查

```tsx
// app/projects/[id]/settings/page.tsx
import { forbidden } from "next/navigation";
import { getProject } from "@/lib/projects";
import { getSession } from "@/lib/auth";

export default async function ProjectSettingsPage({ params }) {
  const session = await getSession();
  const project = await getProject(params.id);

  // 检查是否是项目所有者
  if (project.ownerId !== session?.user.id) {
    forbidden();
  }

  return <ProjectSettings project={project} />;
}
```

### 4.4 组合权限检查

```tsx
// lib/permissions.ts
export function checkPermission(
  user: User | null,
  resource: Resource,
  action: "read" | "write" | "delete"
): boolean {
  if (!user) return false;

  // 管理员拥有所有权限
  if (user.role === "admin") return true;

  // 资源所有者拥有所有权限
  if (resource.ownerId === user.id) return true;

  // 检查协作者权限
  const collaborator = resource.collaborators.find((c) => c.userId === user.id);
  if (!collaborator) return false;

  switch (action) {
    case "read":
      return true; // 所有协作者都可以读
    case "write":
      return collaborator.role === "editor" || collaborator.role === "owner";
    case "delete":
      return collaborator.role === "owner";
    default:
      return false;
  }
}

// app/documents/[id]/page.tsx
import { forbidden } from "next/navigation";
import { getDocument } from "@/lib/documents";
import { getSession } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

export default async function DocumentPage({ params }) {
  const session = await getSession();
  const document = await getDocument(params.id);

  if (!checkPermission(session?.user, document, "read")) {
    forbidden();
  }

  return <DocumentViewer document={document} />;
}
```

### 4.5 IP 白名单检查

```tsx
// app/internal/page.tsx
import { forbidden } from "next/navigation";
import { headers } from "next/headers";

const ALLOWED_IPS = ["192.168.1.1", "10.0.0.1"];

export default async function InternalPage() {
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    forbidden();
  }

  return <div>内部工具</div>;
}

// app/internal/forbidden.tsx
export default function InternalForbidden() {
  return (
    <div>
      <h1>访问受限</h1>
      <p>此页面仅限内部网络访问。</p>
    </div>
  );
}
```

## 5. 与其他错误处理的对比

### 5.1 forbidden vs unauthorized

| 特性        | forbidden (403)  | unauthorized (401) |
| ----------- | ---------------- | ------------------ |
| 含义        | 已认证但无权限   | 未认证             |
| 使用场景    | 权限不足         | 需要登录           |
| 用户操作    | 联系管理员或升级 | 登录               |
| HTTP 状态码 | 403              | 401                |

```tsx
// 使用 unauthorized
import { unauthorized } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    unauthorized(); // 未登录 -> 401
  }

  if (session.user.role !== "admin") {
    forbidden(); // 已登录但无权限 -> 403
  }

  return <div>管理员内容</div>;
}
```

### 5.2 forbidden vs notFound

| 特性        | forbidden (403)    | notFound (404) |
| ----------- | ------------------ | -------------- |
| 含义        | 资源存在但无权访问 | 资源不存在     |
| 使用场景    | 权限控制           | 资源未找到     |
| 安全性      | 不泄露资源存在性   | 明确资源不存在 |
| HTTP 状态码 | 403                | 404            |

```tsx
// 安全考虑: 对于敏感资源,可能返回 404 而非 403
import { notFound, forbidden } from "next/navigation";

export default async function SecretPage({ params }) {
  const session = await getSession();
  const secret = await getSecret(params.id);

  if (!secret) {
    notFound(); // 资源不存在
  }

  // 方案 1: 返回 403 (明确告知无权限)
  if (secret.ownerId !== session?.user.id) {
    forbidden();
  }

  // 方案 2: 返回 404 (隐藏资源存在性,更安全)
  if (secret.ownerId !== session?.user.id) {
    notFound();
  }

  return <div>{secret.content}</div>;
}
```

### 5.3 错误处理决策树

```typescript
// lib/error-handling.ts
import { forbidden, unauthorized, notFound } from "next/navigation";

export function handleResourceAccess(
  resource: Resource | null,
  user: User | null,
  options: { hideExistence?: boolean } = {}
) {
  // 1. 资源不存在
  if (!resource) {
    notFound();
  }

  // 2. 用户未登录
  if (!user) {
    unauthorized();
  }

  // 3. 用户无权限
  if (resource.ownerId !== user.id) {
    if (options.hideExistence) {
      notFound(); // 隐藏资源存在性
    } else {
      forbidden(); // 明确告知无权限
    }
  }
}

// 使用
export default async function Page({ params }) {
  const session = await getSession();
  const resource = await getResource(params.id);

  handleResourceAccess(resource, session?.user, { hideExistence: true });

  return <div>{resource.content}</div>;
}
```

## 常见问题

### 1. forbidden 和 unauthorized 有什么区别?

**区别**:

| 方面     | forbidden (403)        | unauthorized (401) |
| -------- | ---------------------- | ------------------ |
| 认证状态 | 已认证                 | 未认证             |
| 问题原因 | 权限不足               | 需要登录           |
| 解决方案 | 升级权限或联系管理员   | 登录               |
| 典型场景 | 普通用户访问管理员页面 | 访问需要登录的页面 |

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

  return <div>内容</div>;
}
```

### 2. 如何自定义 forbidden 页面?

创建 `forbidden.tsx` 文件:

```tsx
// app/forbidden.tsx (全局)
export default function GlobalForbidden() {
  return (
    <div className="error-page">
      <h1>403 - 禁止访问</h1>
      <p>您没有权限访问此资源。</p>
      <a href="/">返回首页</a>
    </div>
  );
}

// app/admin/forbidden.tsx (管理员区域)
export default function AdminForbidden() {
  return (
    <div className="error-page">
      <h1>需要管理员权限</h1>
      <p>此区域仅限管理员访问。</p>
      <a href="/contact">联系管理员</a>
      <a href="/">返回首页</a>
    </div>
  );
}
```

### 3. 可以在客户端组件中使用 forbidden 吗?

不可以。`forbidden` 只能在服务端使用:

```tsx
// ❌ 错误 - 客户端组件
"use client";

import { forbidden } from "next/navigation";

export default function ClientComponent() {
  const user = useUser();

  if (user.role !== "admin") {
    forbidden(); // 错误!
  }

  return <div>内容</div>;
}

// ✅ 正确 - 服务端组件
import { forbidden } from "next/navigation";

export default async function ServerComponent() {
  const user = await getUser();

  if (user.role !== "admin") {
    forbidden(); // 正确
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
    if (user.role !== "admin") {
      router.push("/forbidden"); // 重定向到错误页面
    }
  }, [user, router]);

  return <div>内容</div>;
}
```

### 4. 如何记录 forbidden 事件?

```tsx
// lib/logger.ts
export async function logForbiddenAccess(
  userId: string | null,
  resource: string,
  reason: string
) {
  await db.securityLog.create({
    data: {
      userId,
      resource,
      reason,
      type: "FORBIDDEN",
      timestamp: new Date(),
    },
  });
}

// app/admin/page.tsx
import { forbidden } from "next/navigation";
import { logForbiddenAccess } from "@/lib/logger";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    await logForbiddenAccess(
      session?.user.id || null,
      "/admin",
      "Not an admin"
    );
    forbidden();
  }

  return <div>管理员内容</div>;
}
```

### 5. 如何处理 API 路由中的 forbidden?

```tsx
// app/api/admin/users/route.ts
import { forbidden } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    // 方案 1: 使用 forbidden
    forbidden();

    // 方案 2: 返回 JSON 响应
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await getAllUsers();
  return Response.json(users);
}
```

## 适用场景

### 1. 基于角色的访问控制 (RBAC)

```tsx
// lib/rbac.ts
type Role = "user" | "editor" | "admin";
type Permission = "read" | "write" | "delete" | "manage";

const rolePermissions: Record<Role, Permission[]> = {
  user: ["read"],
  editor: ["read", "write"],
  admin: ["read", "write", "delete", "manage"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

// app/posts/[id]/edit/page.tsx
import { forbidden } from "next/navigation";
import { hasPermission } from "@/lib/rbac";

export default async function EditPostPage() {
  const session = await getSession();

  if (!session || !hasPermission(session.user.role, "write")) {
    forbidden();
  }

  return <EditPostForm />;
}
```

### 2. 订阅功能限制

```tsx
// app/premium/page.tsx
import { forbidden } from "next/navigation";
import { getSubscription } from "@/lib/subscription";

export default async function PremiumPage() {
  const session = await getSession();
  const subscription = await getSubscription(session?.user.id);

  if (!subscription || subscription.plan !== "premium") {
    forbidden();
  }

  return <div>高级功能</div>;
}

// app/premium/forbidden.tsx
export default function PremiumForbidden() {
  return (
    <div>
      <h1>需要高级订阅</h1>
      <p>此功能仅对高级订阅用户开放。</p>
      <a href="/pricing">查看定价</a>
      <a href="/upgrade">立即升级</a>
    </div>
  );
}
```

### 3. 地理位置限制

```tsx
// app/region-locked/page.tsx
import { forbidden } from "next/navigation";
import { headers } from "next/headers";

const ALLOWED_COUNTRIES = ["CN", "US", "JP"];

export default async function RegionLockedPage() {
  const headersList = headers();
  const country = headersList.get("cf-ipcountry"); // Cloudflare

  if (!country || !ALLOWED_COUNTRIES.includes(country)) {
    forbidden();
  }

  return <div>区域内容</div>;
}

// app/region-locked/forbidden.tsx
export default function RegionLockedForbidden() {
  return (
    <div>
      <h1>区域限制</h1>
      <p>此内容在您所在的地区不可用。</p>
    </div>
  );
}
```

## 注意事项

### 1. 服务端专用

`forbidden` 只能在服务端使用,不能在客户端组件中调用。

### 2. 安全性考虑

对于敏感资源,考虑返回 404 而非 403,避免泄露资源存在性。

### 3. 日志记录

记录 forbidden 事件,用于安全审计和分析。

### 4. 用户体验

提供清晰的错误信息和解决方案,如升级链接或联系方式。

### 5. 性能优化

在路由层面进行权限检查,避免不必要的数据获取。

## 总结

`forbidden` 函数是 Next.js 16 中用于权限控制的重要工具。本文介绍了:

1. **基础用法**: 在服务端组件和 API 路由中使用 forbidden
2. **实战场景**: 角色权限、会员功能、资源所有权、API 权限
3. **高级用法**: 条件权限、时间权限、组合权限、IP 白名单
4. **错误对比**: forbidden vs unauthorized vs notFound
5. **最佳实践**: 安全性、日志记录、用户体验

关键要点:

- 仅在服务端使用
- 明确区分 403、401、404
- 提供自定义 forbidden.tsx
- 记录安全事件
- 考虑安全性和用户体验
- 使用正确的 HTTP 状态码

通过正确使用 `forbidden` 函数,可以实现安全、清晰的权限控制系统。

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# draftMode 草稿模式详解

## 1. 概述与背景

### 1.1 什么是草稿模式

草稿模式(Draft Mode)是 Next.js 提供的一个功能,允许在静态生成的页面中预览未发布的内容。这对于使用无头 CMS(Headless CMS)的网站特别有用,可以在内容发布前预览效果。

草稿模式的主要特点:

- **绕过静态生成**: 在草稿模式下,页面会动态渲染而不是使用缓存的静态版本
- **预览未发布内容**: 可以查看尚未发布的草稿内容
- **基于 Cookie**: 使用 Cookie 来标识草稿模式状态
- **安全性**: 需要验证才能进入草稿模式
- **临时性**: 草稿模式是临时的,不会影响正常用户

### 1.2 为什么需要草稿模式

在使用静态生成(SSG)的网站中,内容在构建时就已经生成。但是内容创作者需要在发布前预览内容,这就需要草稿模式:

- **内容预览**: 在发布前查看内容效果
- **编辑验证**: 验证内容格式和样式
- **协作审核**: 团队成员可以审核草稿内容
- **快速迭代**: 无需重新构建即可预览更改

### 1.3 草稿模式的工作原理

草稿模式通过以下方式工作:

1. **启用草稿模式**: 通过 API 路由设置草稿模式 Cookie
2. **检测草稿模式**: 页面检查是否处于草稿模式
3. **获取草稿内容**: 从 CMS 获取草稿而不是已发布的内容
4. **动态渲染**: 绕过静态缓存,动态渲染页面
5. **退出草稿模式**: 清除草稿模式 Cookie

## 2. 核心概念

### 2.1 启用草稿模式

#### 基本用法

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  // 验证请求
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // 启用草稿模式
  const draft = await draftMode();
  draft.enable();

  // 重定向到预览页面
  const slug = searchParams.get("slug") || "/";
  return Response.redirect(new URL(slug, request.url));
}
```

#### 带参数的草稿模式

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 验证密钥
  const secret = searchParams.get("secret");
  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // 获取要预览的内容
  const slug = searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  // 验证内容是否存在
  const post = await getPostBySlug(slug, true);
  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  // 启用草稿模式
  const draft = await draftMode();
  draft.enable();

  // 重定向到文章页面
  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}

async function getPostBySlug(slug: string, isDraft: boolean) {
  // 从 CMS 获取文章
  return {
    slug,
    title: "Draft Post",
    content: "This is a draft post",
  };
}
```

### 2.2 检测草稿模式

#### 在服务端组件中检测

```typescript
// app/posts/[slug]/page.tsx
import { draftMode } from "next/headers";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const draft = await draftMode();
  const isDraft = draft.isEnabled;

  // 根据草稿模式获取不同的内容
  const post = await getPost(params.slug, isDraft);

  return (
    <article>
      {isDraft && <div className="draft-banner">You are viewing a draft</div>}
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

async function getPost(slug: string, isDraft: boolean) {
  // 从 CMS 获取文章
  // isDraft 为 true 时获取草稿版本
  return {
    title: isDraft ? "Draft: Post Title" : "Post Title",
    content: "Post content",
  };
}
```

#### 在 Route Handler 中检测

```typescript
// app/api/posts/[slug]/route.ts
import { draftMode } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const draft = await draftMode();
  const isDraft = draft.isEnabled;

  const post = await getPost(params.slug, isDraft);

  return Response.json({
    post,
    isDraft,
  });
}

async function getPost(slug: string, isDraft: boolean) {
  return {
    slug,
    title: "Post Title",
    status: isDraft ? "draft" : "published",
  };
}
```

### 2.3 退出草稿模式

```typescript
// app/api/disable-draft/route.ts
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  return Response.redirect(new URL("/", request.url));
}
```

## 3. 适用场景

### 3.1 与 Headless CMS 集成

#### Contentful 集成

```typescript
// lib/contentful.ts
import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
  host: "preview.contentful.com",
});

export async function getPost(slug: string, isDraft: boolean) {
  const selectedClient = isDraft ? previewClient : client;

  const entries = await selectedClient.getEntries({
    content_type: "post",
    "fields.slug": slug,
    limit: 1,
  });

  if (entries.items.length === 0) {
    return null;
  }

  const post = entries.items[0];

  return {
    slug: post.fields.slug,
    title: post.fields.title,
    content: post.fields.content,
    publishedAt: post.fields.publishedAt,
    status: isDraft ? "draft" : "published",
  };
}

// app/posts/[slug]/page.tsx
import { draftMode } from "next/headers";
import { getPost } from "@/lib/contentful";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const draft = await draftMode();
  const post = await getPost(params.slug, draft.isEnabled);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article>
      {draft.isEnabled && (
        <div className="bg-yellow-100 p-4 mb-4">
          <p className="font-bold">Draft Mode</p>
          <p>You are viewing unpublished content</p>
          <a href="/api/disable-draft" className="text-blue-600">
            Exit Draft Mode
          </a>
        </div>
      )}
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { getPost } from "@/lib/contentful";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  // 验证文章是否存在
  const post = await getPost(slug, true);

  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}
```

#### Sanity 集成

```typescript
// lib/sanity.ts
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

export async function getPost(slug: string, isDraft: boolean) {
  const query = `
    *[_type == "post" && slug.current == $slug ${
      isDraft ? "" : '&& !(_id in path("drafts.**"))'
    }][0] {
      _id,
      title,
      slug,
      content,
      publishedAt
    }
  `;

  const post = await client.fetch(query, { slug });

  return post;
}

// app/posts/[slug]/page.tsx
import { draftMode } from "next/headers";
import { getPost } from "@/lib/sanity";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const draft = await draftMode();
  const post = await getPost(params.slug, draft.isEnabled);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <article>
      {draft.isEnabled && (
        <div className="draft-banner">
          Viewing draft content
          <a href="/api/disable-draft">Exit</a>
        </div>
      )}
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### 3.2 内容预览工作流

#### 预览按钮集成

```typescript
// CMS 中的预览按钮配置
// 例如在 Contentful 中配置预览 URL:
// https://your-site.com/api/draft?secret=YOUR_SECRET&slug={entry.fields.slug}

// app/api/draft/route.ts
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  const contentType = searchParams.get("type") || "post";

  // 验证密钥
  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  // 启用草稿模式
  const draft = await draftMode();
  draft.enable();

  // 根据内容类型重定向
  const redirectPath = getRedirectPath(contentType, slug);

  return Response.redirect(new URL(redirectPath, request.url));
}

function getRedirectPath(contentType: string, slug: string): string {
  switch (contentType) {
    case "post":
      return `/posts/${slug}`;
    case "page":
      return `/${slug}`;
    case "product":
      return `/products/${slug}`;
    default:
      return "/";
  }
}
```

#### 草稿模式工具栏

```typescript
// components/DraftModeToolbar.tsx
"use client";

export function DraftModeToolbar({ isDraft }: { isDraft: boolean }) {
  if (!isDraft) return null;

  const exitDraftMode = async () => {
    await fetch("/api/disable-draft");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black p-4 flex justify-between items-center">
      <div>
        <strong>Draft Mode Active</strong>
        <p className="text-sm">You are viewing unpublished content</p>
      </div>
      <button
        onClick={exitDraftMode}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Exit Draft Mode
      </button>
    </div>
  );
}

// app/layout.tsx
import { draftMode } from "next/headers";
import { DraftModeToolbar } from "@/components/DraftModeToolbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const draft = await draftMode();

  return (
    <html>
      <body>
        {children}
        <DraftModeToolbar isDraft={draft.isEnabled} />
      </body>
    </html>
  );
}
```

### 3.3 多环境草稿预览

#### 开发环境和生产环境

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // 不同环境使用不同的密钥
  const expectedSecret =
    process.env.NODE_ENV === "production"
      ? process.env.DRAFT_SECRET_PROD
      : process.env.DRAFT_SECRET_DEV;

  if (secret !== expectedSecret) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}
```

#### 基于用户角色的预览

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const token = searchParams.get("token");
  const slug = searchParams.get("slug");

  if (!token || !slug) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  // 验证用户令牌
  const user = await verifyToken(token);

  if (!user) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // 检查用户权限
  if (!user.roles.includes("editor") && !user.roles.includes("admin")) {
    return Response.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  const draft = await draftMode();
  draft.enable();

  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}

async function verifyToken(token: string) {
  // 实现令牌验证逻辑
  return {
    id: "1",
    roles: ["editor"],
  };
}
```

### 3.4 实时预览

#### 实时更新预览

```typescript
// app/posts/[slug]/page.tsx
import { draftMode } from "next/headers";
import { getPost } from "@/lib/cms";
import { LivePreview } from "@/components/LivePreview";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const draft = await draftMode();
  const post = await getPost(params.slug, draft.isEnabled);

  if (!post) {
    return <div>Post not found</div>;
  }

  // 在草稿模式下使用实时预览
  if (draft.isEnabled) {
    return <LivePreview initialPost={post} slug={params.slug} />;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// components/LivePreview.tsx
("use client");

import { useEffect, useState } from "react";

export function LivePreview({
  initialPost,
  slug,
}: {
  initialPost: any;
  slug: string;
}) {
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    // 轮询获取最新内容
    const interval = setInterval(async () => {
      const res = await fetch(`/api/posts/${slug}?draft=true`);
      const data = await res.json();
      setPost(data.post);
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [slug]);

  return (
    <article>
      <div className="bg-blue-100 p-4 mb-4">
        <p>Live Preview - Updates every 5 seconds</p>
      </div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

## 4. API 签名与配置

### 4.1 draftMode() 函数

```typescript
import { draftMode } from "next/headers";

// 签名
function draftMode(): Promise<DraftMode>;

// 使用示例
const draft = await draftMode();
```

### 4.2 DraftMode 接口

```typescript
interface DraftMode {
  isEnabled: boolean;
  enable(): void;
  disable(): void;
}
```

### 4.3 常用方法

#### isEnabled 属性

```typescript
const draft = await draftMode();

if (draft.isEnabled) {
  console.log("Draft mode is active");
}
```

#### enable() 方法

```typescript
const draft = await draftMode();
draft.enable();
```

#### disable() 方法

```typescript
const draft = await draftMode();
draft.disable();
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单的草稿预览

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "my-secret") {
    return Response.json({ error: "Invalid" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  return Response.redirect(new URL("/", request.url));
}

// app/page.tsx
import { draftMode } from "next/headers";

export default async function Page() {
  const draft = await draftMode();

  return (
    <div>
      <p>Draft mode: {draft.isEnabled ? "ON" : "OFF"}</p>
    </div>
  );
}
```

#### 退出草稿模式

```typescript
// app/api/disable-draft/route.ts
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  return Response.redirect(new URL("/", request.url));
}
```

### 5.2 进阶用法

#### 带时间限制的草稿模式

```typescript
// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // 启用草稿模式
  const draft = await draftMode();
  draft.enable();

  // 设置过期时间(1小时)
  const cookieStore = await cookies();
  const draftCookie = cookieStore.get("__prerender_bypass");

  if (draftCookie) {
    cookieStore.set("__prerender_bypass", draftCookie.value, {
      maxAge: 60 * 60, // 1小时
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}
```

#### 草稿模式日志记录

```typescript
// lib/draft-logger.ts
export async function logDraftAccess(data: {
  slug: string;
  user?: string;
  timestamp: Date;
}) {
  console.log("[Draft Mode]", data);
  // 可以保存到数据库
}

// app/api/draft/route.ts
import { draftMode } from "next/headers";
import { logDraftAccess } from "@/lib/draft-logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  // 记录草稿访问
  await logDraftAccess({
    slug: slug || "/",
    timestamp: new Date(),
  });

  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}
```

## 6. 注意事项

### 6.1 安全问题

#### 密钥保护

```typescript
// ❌ 错误: 硬编码密钥
if (secret !== "my-secret-key") {
  return Response.json({ error: "Invalid" }, { status: 401 });
}

// ✅ 正确: 使用环境变量
if (secret !== process.env.DRAFT_SECRET) {
  return Response.json({ error: "Invalid" }, { status: 401 });
}
```

#### 验证内容存在

```typescript
// ❌ 错误: 不验证内容
const draft = await draftMode();
draft.enable();
return Response.redirect(new URL(`/posts/${slug}`, request.url));

// ✅ 正确: 验证内容存在
const post = await getPost(slug, true);
if (!post) {
  return Response.json({ error: "Not found" }, { status: 404 });
}

const draft = await draftMode();
draft.enable();
return Response.redirect(new URL(`/posts/${slug}`, request.url));
```

### 6.2 性能影响

#### 缓存绕过

草稿模式会绕过静态缓存,每次请求都会重新渲染:

```typescript
// 在草稿模式下,页面会动态渲染
export default async function Page() {
  const draft = await draftMode();

  // 这个数据每次都会重新获取
  const data = await fetchData(draft.isEnabled);

  return <div>{data.content}</div>;
}
```

### 6.3 Cookie 管理

#### Cookie 名称

Next.js 使用 `__prerender_bypass` Cookie 来标识草稿模式:

```typescript
// 不要手动修改这个 Cookie
// Next.js 会自动管理
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: 草稿模式如何工作?

**问题**: 草稿模式的工作原理是什么?

**简短回答**: 通过 Cookie 标识草稿模式,绕过静态缓存动态渲染页面。

**详细解释**:

草稿模式通过设置一个特殊的 Cookie (`__prerender_bypass`) 来标识用户处于草稿模式。当检测到这个 Cookie 时,Next.js 会绕过静态缓存,动态渲染页面并获取草稿内容。

**代码示例**:

```typescript
// 启用草稿模式
const draft = await draftMode();
draft.enable(); // 设置 Cookie

// 检测草稿模式
if (draft.isEnabled) {
  // 检查 Cookie
  // 获取草稿内容
}
```

#### 问题二: 如何退出草稿模式?

**问题**: 用户如何退出草稿模式?

**简短回答**: 调用 `draft.disable()` 或清除浏览器 Cookie。

**详细解释**:

可以通过 API 路由调用 `draft.disable()` 来退出草稿模式,或者用户可以手动清除浏览器 Cookie。

**代码示例**:

```typescript
// app/api/disable-draft/route.ts
export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();
  return Response.redirect(new URL("/", request.url));
}
```

#### 问题三: 草稿模式会影响其他用户吗?

**问题**: 一个用户启用草稿模式会影响其他用户吗?

**简短回答**: 不会,草稿模式是基于 Cookie 的,只影响当前用户。

**详细解释**:

草稿模式使用 Cookie 来标识状态,Cookie 是存储在用户浏览器中的,不会影响其他用户。每个用户都有自己独立的草稿模式状态。

### 7.2 进阶问题

#### 问题四: 如何与 CMS 的预览功能集成?

**问题**: 如何将草稿模式与 CMS 的预览按钮集成?

**简短回答**: 在 CMS 中配置预览 URL 指向草稿模式 API 路由。

**详细解释**:

大多数 CMS 都支持配置预览 URL。将预览 URL 设置为你的草稿模式 API 路由,并传递必要的参数(如密钥和内容 slug)。

**代码示例**:

```typescript
// CMS 预览 URL 配置:
// https://your-site.com/api/draft?secret=YOUR_SECRET&slug={entry.slug}

// app/api/draft/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (secret !== process.env.DRAFT_SECRET) {
    return Response.json({ error: "Invalid" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  return Response.redirect(new URL(`/posts/${slug}`, request.url));
}
```

#### 问题五: 如何实现实时预览?

**问题**: 如何在草稿模式下实现实时预览?

**简短回答**: 使用轮询或 WebSocket 定期获取最新内容。

**详细解释**:

可以在客户端组件中使用轮询(定期发送请求)或 WebSocket 来获取最新的草稿内容,实现实时预览效果。

**代码示例**:

```typescript
"use client";

import { useEffect, useState } from "react";

export function LivePreview({ slug }: { slug: string }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/posts/${slug}?draft=true`);
      const data = await res.json();
      setPost(data);
    };

    fetchPost();
    const interval = setInterval(fetchPost, 5000);

    return () => clearInterval(interval);
  }, [slug]);

  if (!post) return <div>Loading...</div>;

  return <article>{post.content}</article>;
}
```

## 8. 总结

### 8.1 核心要点回顾

**草稿模式操作**:

| 操作         | 方法              | 说明                 |
| :----------- | :---------------- | :------------------- |
| 启用草稿模式 | `draft.enable()`  | 设置草稿模式 Cookie  |
| 检测草稿模式 | `draft.isEnabled` | 检查是否处于草稿模式 |
| 退出草稿模式 | `draft.disable()` | 清除草稿模式 Cookie  |

**使用场景**:

- 内容预览
- CMS 集成
- 编辑审核
- 协作工作流

### 8.2 关键收获

1. **安全性**: 使用密钥保护草稿模式入口
2. **验证**: 验证内容存在再启用草稿模式
3. **用户体验**: 提供明显的草稿模式指示
4. **性能**: 了解草稿模式会绕过缓存
5. **集成**: 与 CMS 预览功能无缝集成

### 8.3 最佳实践

1. **使用环境变量**: 不要硬编码密钥
2. **验证内容**: 启用草稿模式前验证内容存在
3. **提供退出方式**: 让用户能轻松退出草稿模式
4. **记录访问**: 记录草稿模式的使用情况
5. **限制权限**: 只允许授权用户访问草稿

### 8.4 下一步学习

- **CMS 集成**: 学习与不同 CMS 的集成方法
- **实时预览**: 实现更复杂的实时预览功能
- **权限管理**: 学习更细粒度的权限控制
- **性能优化**: 了解如何优化草稿模式性能

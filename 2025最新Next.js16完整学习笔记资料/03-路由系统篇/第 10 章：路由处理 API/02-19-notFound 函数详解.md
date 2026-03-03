**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# notFound 函数详解

## 1. 概述

`notFound` 是 Next.js 16 提供的函数,用于在服务端组件、Server Actions 或 Route Handlers 中触发 404 Not Found 响应。它会渲染最近的 `not-found.tsx` 文件。

### 1.1 概念定义

`notFound` 函数用于表示请求的资源不存在,触发 404 错误处理流程。

**关键特征**:

- **服务端专用**: 只能在服务端环境使用
- **抛出错误**: 通过抛出特殊错误实现
- **自定义 UI**: 渲染 `not-found.tsx` 组件
- **SEO 友好**: 返回 404 状态码

**基本用法**:

```tsx
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound(); // 触发 404
  }

  return <div>{post.title}</div>;
}
```

### 1.2 核心价值

**优雅的错误处理**:

提供统一的 404 错误处理机制,用户体验更好。

**SEO 优化**:

正确返回 404 状态码,搜索引擎能正确处理不存在的页面。

**自定义 UI**:

可以自定义 404 页面的样式和内容,保持品牌一致性。

**开发体验**:

简单的 API,易于使用和理解。

### 1.3 not-found.tsx 文件

创建 `not-found.tsx` 文件来自定义 404 页面:

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>404 - 页面未找到</h1>
      <p>抱歉,您访问的页面不存在。</p>
      <a href="/">返回首页</a>
    </div>
  );
}
```

**文件位置**:

- `app/not-found.tsx`: 全局 404 页面
- `app/blog/not-found.tsx`: 博客路由的 404 页面
- `app/products/not-found.tsx`: 产品路由的 404 页面

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { notFound } from "next/navigation";

function notFound(): never;
```

**参数**:

无参数

**返回值**:

`never` - 函数永远不会正常返回,因为它会抛出错误

**示例**:

```tsx
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchData(id);

  if (!data) {
    notFound();
  }

  return <div>{data.title}</div>;
}
```

### 2.2 工作原理

`notFound` 函数通过抛出特殊错误来触发 404 处理:

```tsx
// Next.js 内部实现(简化版)
export function notFound(): never {
  const error = new Error("NEXT_NOT_FOUND");
  error.digest = "NEXT_NOT_FOUND";
  throw error;
}
```

**执行流程**:

1. 调用 `notFound()`
2. 抛出 `NEXT_NOT_FOUND` 错误
3. Next.js 捕获该错误
4. 查找最近的 `not-found.tsx` 文件
5. 渲染 404 页面
6. 返回 HTTP 404 状态码

### 2.3 not-found.tsx 层级

Next.js 会查找最近的 `not-found.tsx` 文件:

```
app/
├── not-found.tsx              # 全局 404
├── blog/
│   ├── not-found.tsx          # 博客 404
│   └── [slug]/
│       └── page.tsx
└── products/
    ├── not-found.tsx          # 产品 404
    └── [id]/
        └── page.tsx
```

**查找规则**:

- 从当前路由段开始向上查找
- 使用最近的 `not-found.tsx`
- 如果没有找到,使用根级别的 `not-found.tsx`

### 2.4 在不同环境中使用

**服务端组件**:

```tsx
// app/posts/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <article>{post.content}</article>;
}
```

**Server Actions**:

```tsx
"use server";

import { notFound } from "next/navigation";

export async function getUser(id: string) {
  const user = await fetchUser(id);

  if (!user) {
    notFound();
  }

  return user;
}
```

**Route Handlers**:

```tsx
// app/api/posts/[id]/route.ts
import { notFound } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return Response.json(post);
}
```

### 2.5 generateMetadata 中使用

在 `generateMetadata` 中也可以使用 `notFound`:

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

---

## 3. 适用场景

### 3.1 动态路由资源不存在

**场景**: 博客文章不存在时显示 404。

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// app/blog/not-found.tsx
export default function BlogNotFound() {
  return (
    <div>
      <h1>文章未找到</h1>
      <p>抱歉,您访问的文章不存在或已被删除。</p>
      <a href="/blog">返回博客列表</a>
    </div>
  );
}
```

### 3.2 权限不足

**场景**: 用户无权访问资源时显示 404(而不是 403)。

```tsx
// app/admin/posts/[id]/page.tsx
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  // 非管理员看不到这个页面
  if (!session || session.user.role !== "admin") {
    notFound();
  }

  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <div>管理员编辑: {post.title}</div>;
}
```

### 3.3 API 路由

**场景**: API 端点返回 404。

```tsx
// app/api/users/[id]/route.ts
import { notFound } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return Response.json(user);
}
```

### 3.4 动态路由验证

**场景**: 验证动态路由参数的有效性。

```tsx
// app/products/[category]/[id]/page.tsx
import { notFound } from "next/navigation";

const validCategories = ["electronics", "clothing", "books"];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;

  // 验证分类
  if (!validCategories.includes(category)) {
    notFound();
  }

  // 验证 ID 格式
  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const product = await getProduct(category, id);

  if (!product) {
    notFound();
  }

  return <div>{product.name}</div>;
}
```

### 3.5 条件渲染

**场景**: 根据多个条件决定是否显示 404。

```tsx
// app/events/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  // 活动已结束且不是管理员
  const user = await getUser();
  if (event.isEnded && user?.role !== "admin") {
    notFound();
  }

  // 活动未发布
  if (!event.isPublished) {
    notFound();
  }

  return <div>{event.title}</div>;
}
```

---

## 4. 常见问题

### 1. notFound 和 redirect 有什么区别?

| 特性     | notFound()             | redirect()             |
| -------- | ---------------------- | ---------------------- |
| 状态码   | 404                    | 307                    |
| 用途     | 资源不存在             | 跳转到其他页面         |
| SEO 影响 | 告诉搜索引擎页面不存在 | 告诉搜索引擎页面已移动 |
| 用户体验 | 显示错误页面           | 跳转到新页面           |

```tsx
// 资源不存在:使用 notFound
if (!post) {
  notFound(); // 返回 404
}

// 资源已移动:使用 redirect
if (post.newUrl) {
  redirect(post.newUrl); // 返回 307
}
```

### 2. notFound 会返回吗?

不会。`notFound` 会抛出一个特殊的错误来中断执行:

```tsx
export default async function Page() {
  const data = await getData();

  if (!data) {
    notFound();
    console.log("这行代码不会执行"); // 永远不会执行
  }

  return <div>内容</div>;
}
```

### 3. 如何自定义 404 页面样式?

创建 `not-found.tsx` 文件:

```tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉,您访问的页面不存在。</p>
      <Link href="/">返回首页</Link>
    </div>
  );
}
```

### 4. 如何在不同路由段使用不同的 404 页面?

在不同的路由段创建 `not-found.tsx`:

```tsx
// app/not-found.tsx - 全局 404
export default function GlobalNotFound() {
  return <div>全局 404</div>;
}

// app/blog/not-found.tsx - 博客 404
export default function BlogNotFound() {
  return <div>博客文章未找到</div>;
}

// app/products/not-found.tsx - 产品 404
export default function ProductNotFound() {
  return <div>产品未找到</div>;
}
```

### 5. notFound 可以在客户端组件中使用吗?

可以,但通常在服务端组件中使用更合适:

```tsx
// ✅ 服务端组件(推荐)
export default async function ServerPage() {
  const data = await getData();
  if (!data) {
    notFound();
  }
  return <div>{data.content}</div>;
}

// ✅ 客户端组件(可以但不推荐)
("use client");

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then((result) => {
      if (!result) {
        notFound();
      }
      setData(result);
    });
  }, []);

  return <div>{data?.content}</div>;
}
```

---

## 5. 最佳实践

### 5.1 早期返回模式

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ 好:早期返回
  if (!id) {
    notFound();
  }

  const data = await getData(id);

  if (!data) {
    notFound();
  }

  return <div>{data.content}</div>;
}
```

### 5.2 提供有用的错误信息

```tsx
// app/blog/not-found.tsx
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div>
      <h1>文章未找到</h1>
      <p>您访问的文章可能已被删除或不存在。</p>
      <div>
        <Link href="/blog">浏览所有文章</Link>
        <Link href="/search">搜索文章</Link>
      </div>
    </div>
  );
}
```

### 5.3 记录 404 日志

```tsx
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);

  if (!data) {
    // 记录 404 日志
    console.log(`404: Resource not found - ID: ${id}`);
    await logNotFound({ resource: "page", id });
    notFound();
  }

  return <div>{data.content}</div>;
}
```

### 5.4 使用类型安全

```tsx
// lib/errors.ts
export function assertExists<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    notFound();
  }
}

// 使用
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);

  assertExists(data, `Data not found for ID: ${id}`);

  // TypeScript 知道 data 不是 null
  return <div>{data.content}</div>;
}
```

### 5.5 提供搜索功能

```tsx
// app/not-found.tsx
import SearchForm from "@/components/SearchForm";
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>404 - 页面未找到</h1>
      <p>试试搜索您要找的内容:</p>
      <SearchForm />
      <div>
        <h3>热门页面:</h3>
        <ul>
          <li>
            <Link href="/blog">博客</Link>
          </li>
          <li>
            <Link href="/products">产品</Link>
          </li>
          <li>
            <Link href="/about">关于我们</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 6. 注意事项

### 6.1 不要捕获 notFound 错误

```tsx
// ❌ 不要这样做
try {
  notFound();
} catch (error) {
  console.error(error); // 这会阻止 404 页面显示
}

// ✅ 正确做法
notFound(); // 让错误自然传播
```

### 6.2 notFound 后的代码不会执行

```tsx
export default async function Page() {
  notFound();

  console.log("不会执行");
  const data = await getData(); // 不会执行

  return <div>不会渲染</div>; // 不会执行
}
```

### 6.3 区分 404 和权限错误

```tsx
// ❌ 不好:权限问题也返回 404
if (!user.canAccess) {
  notFound(); // 误导用户
}

// ✅ 好:使用 unauthorized
import { unauthorized } from "next/navigation";

if (!user.canAccess) {
  unauthorized(); // 返回 401
}
```

### 6.4 避免过度使用

```tsx
// ❌ 不好:正常的空状态也返回 404
const posts = await getPosts();
if (posts.length === 0) {
  notFound(); // 不应该
}

// ✅ 好:显示空状态
if (posts.length === 0) {
  return <div>暂无文章</div>;
}
```

### 6.5 SEO 考虑

确保 404 页面返回正确的状态码:

```tsx
// Next.js 自动处理,无需手动设置
// notFound() 会自动返回 404 状态码
```

---

## 7. 补充常见问题

### 16. 如何在中间件中使用 notFound?

**问题**: 中间件中需要返回 404

**解决方案**:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 中间件中不能直接使用notFound
  // 需要重定向到404页面
  if (shouldReturn404(path)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}
```

### 17. 如何处理多语言 404 页面?

**问题**: 不同语言显示不同的 404 页面

**解决方案**:

```tsx
// app/[locale]/not-found.tsx
import { useParams } from "next/navigation";

const messages = {
  zh: {
    title: "页面未找到",
    description: "抱歉,您访问的页面不存在",
    home: "返回首页",
  },
  en: {
    title: "Page Not Found",
    description: "Sorry, the page you are looking for does not exist",
    home: "Go Home",
  },
};

export default function NotFound() {
  const params = useParams();
  const locale = (params?.locale as string) || "zh";
  const t = messages[locale] || messages.zh;

  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.description}</p>
      <a href={`/${locale}`}>{t.home}</a>
    </div>
  );
}
```

### 18. 如何实现 404 页面的 A/B 测试?

**问题**: 测试不同的 404 页面设计

**解决方案**:

```tsx
// app/not-found.tsx
import { cookies } from "next/headers";

export default function NotFound() {
  const cookieStore = cookies();
  const variant = cookieStore.get("ab_test_404")?.value || "A";

  if (variant === "B") {
    return <NotFoundVariantB />;
  }

  return <NotFoundVariantA />;
}

function NotFoundVariantA() {
  return (
    <div className="variant-a">
      <h1>404 - 页面未找到</h1>
      <p>传统设计</p>
    </div>
  );
}

function NotFoundVariantB() {
  return (
    <div className="variant-b">
      <h1>哎呀,迷路了!</h1>
      <p>创新设计</p>
    </div>
  );
}
```

### 19. 如何在 404 页面显示相关推荐?

**问题**: 404 页面显示可能感兴趣的内容

**解决方案**:

```tsx
// app/not-found.tsx
import { getRecommendations } from "@/lib/recommendations";

export default async function NotFound() {
  const recommendations = await getRecommendations();

  return (
    <div>
      <h1>页面未找到</h1>
      <p>您可能对以下内容感兴趣:</p>
      <ul>
        {recommendations.map((item) => (
          <li key={item.id}>
            <a href={item.url}>{item.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 20. 如何处理 404 页面的性能优化?

**问题**: 404 页面加载慢

**解决方案**:

```tsx
// app/not-found.tsx
import dynamic from "next/dynamic";

// 动态导入非关键组件
const SearchBox = dynamic(() => import("@/components/SearchBox"), {
  loading: () => <div>加载中...</div>,
});

const Recommendations = dynamic(() => import("@/components/Recommendations"), {
  ssr: false, // 客户端渲染
});

export default function NotFound() {
  return (
    <div>
      <h1>404 - 页面未找到</h1>
      <SearchBox />
      <Recommendations />
    </div>
  );
}
```

### 21. 如何实现 404 页面的错误追踪?

**问题**: 追踪哪些 URL 返回 404

**解决方案**:

```tsx
// app/not-found.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // 发送404错误到分析服务
    if (typeof window !== "undefined") {
      fetch("/api/analytics/404", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        }),
      });
    }
  }, [pathname]);

  return (
    <div>
      <h1>404 - 页面未找到</h1>
    </div>
  );
}
```

### 22. 如何实现智能 404 重定向?

**问题**: 自动重定向到相似页面

**解决方案**:

```typescript
// app/api/smart-redirect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findSimilarPage } from "@/lib/similarity";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path) {
    return NextResponse.json({ redirect: null });
  }

  const similarPage = await findSimilarPage(path);

  if (similarPage && similarPage.similarity > 0.8) {
    return NextResponse.json({ redirect: similarPage.url });
  }

  return NextResponse.json({ redirect: null });
}
```

```tsx
// app/not-found.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const [suggestedUrl, setSuggestedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/smart-redirect?path=${pathname}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.redirect) {
          setSuggestedUrl(data.redirect);
        }
      });
  }, [pathname]);

  return (
    <div>
      <h1>404 - 页面未找到</h1>
      {suggestedUrl && (
        <div>
          <p>您是否要访问:</p>
          <button onClick={() => router.push(suggestedUrl)}>
            {suggestedUrl}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 23. 如何处理 API 路由的 404?

**问题**: API 路由返回 404 的最佳实践

**解决方案**:

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    // API路由中返回404 JSON响应
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

### 24. 如何实现 404 页面的渐进式增强?

**问题**: 在 JavaScript 未加载时也能正常显示

**解决方案**:

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>404 - 页面未找到</h1>

      {/* 无JavaScript时也能使用的导航 */}
      <nav>
        <a href="/">首页</a>
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
      </nav>

      {/* 基础搜索表单 */}
      <form action="/search" method="get">
        <input type="text" name="q" placeholder="搜索..." />
        <button type="submit">搜索</button>
      </form>
    </div>
  );
}
```

### 25. 如何测试 notFound 函数?

**问题**: 编写 notFound 的单元测试

**解决方案**:

```typescript
// __tests__/notFound.test.ts
import { notFound } from "next/navigation";

// Mock notFound
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

describe("Product Page", () => {
  it("should call notFound when product does not exist", async () => {
    const mockNotFound = notFound as jest.Mock;

    // 测试逻辑
    const product = null;

    if (!product) {
      notFound();
    }

    expect(mockNotFound).toHaveBeenCalled();
  });
});
```

## 8. 总结

`notFound` 函数是 Next.js 16 处理 404 错误的标准方式。本文介绍了:

1. **核心概念**: API 签名、工作原理、not-found.tsx 文件
2. **实战场景**: 资源不存在、权限不足、API 路由、动态路由验证、条件渲染
3. **常见问题**: 与 redirect 的区别、是否返回、自定义样式、不同路由段、客户端使用
4. **最佳实践**: 早期返回、有用的错误信息、日志记录、类型安全、搜索功能
5. **注意事项**: 不要捕获错误、代码不执行、区分权限错误、避免过度使用、SEO 考虑

关键要点:

- `notFound` 通过抛出错误来中断执行
- 自动返回 404 状态码
- 使用 `not-found.tsx` 自定义 404 页面
- 不同路由段可以有不同的 404 页面
- 不要捕获 notFound 抛出的错误
- 区分 404 和其他错误(如 401、403)
- 提供有用的错误信息和导航选项

通过正确使用 `notFound` 函数,可以提供更好的用户体验和 SEO 优化。

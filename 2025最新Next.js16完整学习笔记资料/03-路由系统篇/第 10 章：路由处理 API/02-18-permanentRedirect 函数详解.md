**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# permanentRedirect 函数详解

## 1. 概述

`permanentRedirect` 是 Next.js 16 提供的永久重定向函数,用于在服务端执行 308 永久重定向。与 `redirect` 不同,它告诉浏览器和搜索引擎该重定向是永久性的,应该更新书签和索引。

### 1.1 概念定义

`permanentRedirect` 函数用于执行永久性的 HTTP 重定向,返回 308 状态码,表示资源已永久移动到新位置。

**关键特征**:

- **永久重定向**: 返回 308 状态码
- **SEO 友好**: 搜索引擎会更新索引
- **浏览器缓存**: 浏览器会缓存重定向
- **服务端专用**: 只能在服务端使用

**基本用法**:

```tsx
import { permanentRedirect } from "next/navigation";

export default async function OldPage() {
  // 页面已永久移动
  permanentRedirect("/new-page");
}
```

### 1.2 核心价值

**SEO 优化**:

告诉搜索引擎页面已永久移动,搜索引擎会更新索引,将权重转移到新 URL。

**浏览器缓存**:

浏览器会缓存永久重定向,下次访问旧 URL 时直接跳转,无需再次请求服务器。

**清晰的语义**:

明确表示这是永久性变更,而不是临时重定向。

**性能优化**:

由于浏览器缓存,后续访问速度更快。

### 1.3 redirect vs permanentRedirect

| 特性        | redirect           | permanentRedirect  |
| :---------- | :----------------- | :----------------- |
| HTTP 状态码 | 307                | 308                |
| 重定向类型  | 临时               | 永久               |
| 浏览器缓存  | 不缓存             | 缓存               |
| SEO 影响    | 不转移权重         | 转移权重到新 URL   |
| 适用场景    | 权限检查、临时跳转 | URL 变更、页面迁移 |

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { permanentRedirect } from "next/navigation";

function permanentRedirect(path: string, type?: "replace" | "push"): never;
```

**参数**:

- `path`: 重定向的目标路径
- `type`: 重定向类型(可选)
  - `'replace'`: 替换当前历史记录(默认)
  - `'push'`: 添加新的历史记录

**返回值**:

`never` - 函数永远不会正常返回

**示例**:

```tsx
import { permanentRedirect } from "next/navigation";

export default async function OldBlogPost() {
  permanentRedirect("/blog/new-post");
}
```

### 2.2 HTTP 308 状态码

`permanentRedirect` 返回 308 Permanent Redirect:

**308 特点**:

- 永久重定向
- 保持原始请求方法(POST 仍是 POST)
- 浏览器和搜索引擎会缓存
- SEO 友好,权重转移

**HTTP 响应示例**:

```
HTTP/1.1 308 Permanent Redirect
Location: /new-page
Cache-Control: public, max-age=31536000
```

### 2.3 与 301 的区别

| 状态码 | 名称               | 请求方法           | Next.js 函数        |
| :----- | :----------------- | :----------------- | :------------------ |
| 301    | Moved Permanently  | 可能改变(POST→GET) | 配置文件 redirects  |
| 308    | Permanent Redirect | 保持不变           | permanentRedirect() |

**为什么使用 308 而不是 301**:

- 308 保持原始请求方法,更符合 HTTP 规范
- 避免 POST 请求被转换为 GET 请求
- 更现代的标准

### 2.4 使用场景

**服务端组件**:

```tsx
// app/old-page/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldPage() {
  permanentRedirect("/new-page");
}
```

**Server Actions**:

```tsx
"use server";

import { permanentRedirect } from "next/navigation";

export async function migrateUser(userId: string) {
  await updateUserData(userId);
  permanentRedirect(`/users/${userId}/profile`);
}
```

**Route Handlers**:

```tsx
// app/api/old-endpoint/route.ts
import { permanentRedirect } from "next/navigation";

export async function GET() {
  permanentRedirect("/api/new-endpoint");
}
```

### 2.5 浏览器缓存行为

浏览器会缓存永久重定向:

```tsx
// 首次访问 /old-page
// 服务器返回: 308 Permanent Redirect → /new-page
// 浏览器缓存这个重定向

// 后续访问 /old-page
// 浏览器直接跳转到 /new-page,不请求服务器
```

**清除缓存**:

用户需要手动清除浏览器缓存才能看到变更。

---

## 3. 适用场景

### 3.1 URL 结构变更

**场景**: 网站重构,URL 结构发生变化。

```tsx
// app/blog/posts/[id]/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldBlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 旧 URL: /blog/posts/123
  // 新 URL: /articles/123
  permanentRedirect(`/articles/${id}`);
}
```

### 3.2 域名迁移

**场景**: 从旧域名迁移到新域名。

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host");

  if (hostname === "old-domain.com") {
    const url = request.nextUrl.clone();
    url.host = "new-domain.com";

    return NextResponse.redirect(url, { status: 308 });
  }
}
```

### 3.3 内容合并

**场景**: 多个旧页面合并到一个新页面。

```tsx
// app/products/category-a/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function CategoryA() {
  // 分类 A 和 B 已合并到分类 C
  permanentRedirect("/products/category-c");
}

// app/products/category-b/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function CategoryB() {
  permanentRedirect("/products/category-c");
}
```

### 3.4 语言/地区重定向

**场景**: 根据用户地区永久重定向到对应站点。

```tsx
// app/page.tsx
import { permanentRedirect } from "next/navigation";
import { headers } from "next/headers";

export default async function HomePage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country");

  // 中国用户重定向到中文站点
  if (country === "CN") {
    permanentRedirect("https://cn.example.com");
  }

  return <div>Welcome</div>;
}
```

### 3.5 废弃功能重定向

**场景**: 某个功能已废弃,重定向到新功能。

```tsx
// app/old-feature/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldFeature() {
  // 旧功能已废弃,使用新功能
  permanentRedirect("/new-feature");
}
```

### 3.6 规范化 URL

**场景**: 将多种 URL 格式规范化到统一格式。

```tsx
// app/product/[id]/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;

  // 规范化 ID 格式(小写)
  if (id !== id.toLowerCase()) {
    permanentRedirect(`/product/${id.toLowerCase()}`);
  }

  // 移除不必要的查询参数
  if (search.ref === "old") {
    permanentRedirect(`/product/${id}`);
  }

  return <div>产品 {id}</div>;
}
```

---

## 4. 基础与进阶使用

### 4.1 基础:简单页面重定向

最基本的永久重定向:

```tsx
// app/old-about/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldAboutPage() {
  permanentRedirect("/about");
}
```

### 4.2 基础:带参数的重定向

重定向时保留参数:

```tsx
// app/blog/[slug]/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldBlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 旧路径: /blog/my-post
  // 新路径: /articles/my-post
  permanentRedirect(`/articles/${slug}`);
}
```

### 4.3 基础:条件重定向

根据条件决定是否重定向:

```tsx
// app/product/[id]/page.tsx
import { permanentRedirect } from "next/navigation";

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`);
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  // 如果产品已迁移到新 ID
  if (product.newId) {
    permanentRedirect(`/product/${product.newId}`);
  }

  return <div>{product.name}</div>;
}
```

### 4.4 进阶:Server Action 中使用

在表单提交后永久重定向:

```tsx
// app/migrate/page.tsx
"use client";

import { migrateAccount } from "./actions";

export default function MigratePage() {
  return (
    <form action={migrateAccount}>
      <button type="submit">迁移账户</button>
    </form>
  );
}

// app/migrate/actions.ts
("use server");

import { permanentRedirect } from "next/navigation";

export async function migrateAccount() {
  // 执行账户迁移
  await performMigration();

  // 迁移完成,永久重定向到新账户页面
  permanentRedirect("/account/new");
}
```

### 4.5 进阶:Route Handler 中使用

在 API 路由中永久重定向:

```tsx
// app/api/v1/users/route.ts
import { permanentRedirect } from "next/navigation";

export async function GET() {
  // API v1 已废弃,重定向到 v2
  permanentRedirect("/api/v2/users");
}

// app/api/old-webhook/route.ts
import { permanentRedirect } from "next/navigation";

export async function POST() {
  // Webhook 端点已迁移
  permanentRedirect("/api/webhooks/new");
}
```

### 4.6 进阶:多语言重定向

根据语言永久重定向:

```tsx
// app/[lang]/old-page/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // 保持语言参数
  permanentRedirect(`/${lang}/new-page`);
}
```

### 4.7 进阶:带查询参数的重定向

重定向时保留或修改查询参数:

```tsx
// app/search/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const params = await searchParams;

  // 构建新的查询字符串
  const query = new URLSearchParams();

  if (params.q) {
    query.set("query", params.q); // 重命名参数
  }

  if (params.category) {
    query.set("cat", params.category); // 重命名参数
  }

  const queryString = query.toString();
  const newPath = queryString ? `/find?${queryString}` : "/find";

  permanentRedirect(newPath);
}
```

### 4.8 进阶:外部 URL 重定向

重定向到外部网站:

```tsx
// app/external/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function ExternalRedirect() {
  // 重定向到外部 URL
  permanentRedirect("https://new-site.com");
}
```

### 4.9 进阶:批量重定向映射

使用映射表处理多个重定向:

```tsx
// app/legacy/[...path]/page.tsx
import { permanentRedirect } from "next/navigation";

const redirectMap: Record<string, string> = {
  "old-about": "/about",
  "old-contact": "/contact",
  "old-blog": "/articles",
  "old-products": "/shop",
};

export default async function LegacyPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const oldPath = path.join("/");

  const newPath = redirectMap[oldPath];

  if (newPath) {
    permanentRedirect(newPath);
  }

  // 如果没有映射,重定向到首页
  permanentRedirect("/");
}
```

### 4.10 进阶:基于数据库的重定向

从数据库读取重定向规则:

```tsx
// app/r/[code]/page.tsx
import { permanentRedirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // 从数据库查询重定向目标
  const redirect = await db.redirects.findUnique({
    where: { code },
  });

  if (redirect) {
    permanentRedirect(redirect.targetUrl);
  }

  // 如果找不到,返回 404
  permanentRedirect("/404");
}
```

---

## 5. 注意事项

### 5.1 不能在客户端组件中使用

`permanentRedirect` 只能在服务端使用:

```tsx
// ❌ 错误 - 客户端组件
"use client";

import { permanentRedirect } from "next/navigation";

export default function ClientComponent() {
  // 运行时错误!
  permanentRedirect("/new-page");
}

// ✅ 正确 - 服务端组件
import { permanentRedirect } from "next/navigation";

export default async function ServerComponent() {
  permanentRedirect("/new-page");
}
```

### 5.2 浏览器会缓存重定向

永久重定向会被浏览器缓存:

```tsx
// 首次访问后,浏览器会缓存这个重定向
permanentRedirect("/new-page");

// 如果后来想改变重定向目标,用户需要清除浏览器缓存
// 或者等待缓存过期
```

**解决方案**: 如果不确定重定向是否永久,使用 `redirect` 代替。

### 5.3 SEO 影响

永久重定向会影响 SEO:

```tsx
// 搜索引擎会:
// 1. 更新索引,使用新 URL
// 2. 将旧 URL 的权重转移到新 URL
// 3. 停止索引旧 URL

permanentRedirect("/new-page");
```

**注意**: 确保这是真正的永久变更,否则会影响 SEO。

### 5.4 不会执行后续代码

`permanentRedirect` 会立即中断执行:

```tsx
export default async function Page() {
  console.log("Before redirect"); // 会执行

  permanentRedirect("/new-page");

  console.log("After redirect"); // 不会执行
  return <div>Content</div>; // 不会执行
}
```

### 5.5 与 try-catch 的交互

`permanentRedirect` 会抛出特殊错误:

```tsx
export default async function Page() {
  try {
    permanentRedirect("/new-page");
  } catch (error) {
    // 不要捕获重定向错误
    // 这会阻止重定向工作
    console.error(error);
  }
}

// ✅ 正确做法
export default async function Page() {
  // 让重定向错误自然传播
  if (shouldRedirect) {
    permanentRedirect("/new-page");
  }

  try {
    // 只捕获业务逻辑错误
    await someOperation();
  } catch (error) {
    console.error(error);
  }
}
```

### 5.6 相对路径 vs 绝对路径

使用绝对路径更安全:

```tsx
// ✅ 推荐 - 绝对路径
permanentRedirect("/new-page");
permanentRedirect("https://example.com/page");

// ⚠️ 相对路径可能导致意外结果
permanentRedirect("../new-page"); // 取决于当前路径
```

### 5.7 重定向循环

避免创建重定向循环:

```tsx
// ❌ 错误 - 重定向循环
// app/page-a/page.tsx
permanentRedirect("/page-b");

// app/page-b/page.tsx
permanentRedirect("/page-a"); // 循环!

// ✅ 正确 - 确保重定向链有终点
// app/old-page/page.tsx
permanentRedirect("/new-page");

// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>; // 终点
}
```

### 5.8 中间件中的使用

在中间件中使用 `NextResponse.redirect`:

```tsx
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // ✅ 正确 - 使用 NextResponse
  return NextResponse.redirect(
    new URL("/new-page", request.url),
    { status: 308 } // 308 = 永久重定向
  );

  // ❌ 错误 - 不能使用 permanentRedirect
  // permanentRedirect('/new-page');
}
```

---

## 6. 常见问题

### 6.1 如何清除浏览器缓存的重定向?

**问题**: 修改了重定向目标,但浏览器仍跳转到旧目标。

**解决方案**:

1. **用户端**: 清除浏览器缓存
2. **开发时**: 使用无痕模式或硬刷新(Ctrl+Shift+R)
3. **代码**: 如果不确定是否永久,使用 `redirect` 代替

```tsx
// 如果可能会改变,使用临时重定向
import { redirect } from "next/navigation";

export default async function Page() {
  redirect("/new-page"); // 307,不会被缓存
}
```

### 6.2 如何在重定向前执行清理操作?

**问题**: 需要在重定向前保存数据或执行清理。

**解决方案**: 在调用 `permanentRedirect` 前完成所有操作:

```tsx
export default async function Page() {
  // 先执行所有操作
  await saveData();
  await logActivity();
  await cleanup();

  // 最后重定向
  permanentRedirect("/new-page");
}
```

### 6.3 如何处理重定向错误?

**问题**: 重定向失败时如何处理?

**回答**: `permanentRedirect` 通过抛出错误来工作,不应该捕获:

```tsx
export default async function Page() {
  // ❌ 错误 - 不要捕获重定向
  try {
    permanentRedirect("/new-page");
  } catch (error) {
    // 这会阻止重定向
  }

  // ✅ 正确 - 让重定向自然发生
  if (shouldRedirect) {
    permanentRedirect("/new-page");
  }
}
```

### 6.4 如何在 Server Action 中重定向?

**问题**: 表单提交后如何永久重定向?

**解决方案**:

```tsx
// app/form/page.tsx
"use client";

import { submitForm } from "./actions";

export default function FormPage() {
  return (
    <form action={submitForm}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}

// app/form/actions.ts
("use server");

import { permanentRedirect } from "next/navigation";

export async function submitForm(formData: FormData) {
  const data = formData.get("data");

  // 处理数据
  await processData(data);

  // 重定向到结果页面
  permanentRedirect("/success");
}
```

### 6.5 如何重定向到带锚点的 URL?

**问题**: 需要重定向到页面的特定部分。

**解决方案**: 在 URL 中包含锚点:

```tsx
export default async function Page() {
  // 重定向到页面的特定部分
  permanentRedirect("/new-page#section-2");
}
```

### 6.6 如何在重定向时保留查询参数?

**问题**: 重定向时需要保留原有的查询参数。

**解决方案**: 手动构建查询字符串:

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const params = await searchParams;

  // 保留所有查询参数
  const queryString = new URLSearchParams(params).toString();
  const newPath = queryString ? `/new-page?${queryString}` : "/new-page";

  permanentRedirect(newPath);
}
```

### 6.7 如何测试永久重定向?

**问题**: 如何在开发环境测试永久重定向?

**解决方案**:

```tsx
// 1. 使用无痕模式避免缓存
// 2. 检查网络面板的状态码
// 3. 使用 curl 测试

// 命令行测试:
// curl -I http://localhost:3000/old-page
// 应该看到: HTTP/1.1 308 Permanent Redirect
```

### 6.8 permanentRedirect vs next.config.js redirects?

**问题**: 什么时候使用 `permanentRedirect`,什么时候使用配置文件?

**对比**:

| 特性       | permanentRedirect  | next.config.js |
| :--------- | :----------------- | :------------- |
| 使用位置   | 组件/Server Action | 配置文件       |
| 动态逻辑   | 支持               | 不支持         |
| 数据库查询 | 支持               | 不支持         |
| 性能       | 需要执行代码       | 构建时生成     |
| 适用场景   | 复杂逻辑           | 简单静态重定向 |

**示例**:

```tsx
// 使用 permanentRedirect - 需要动态逻辑
export default async function Page({ params }) {
  const { id } = await params;
  const data = await fetchData(id);

  if (data.moved) {
    permanentRedirect(data.newUrl);
  }
}

// 使用 next.config.js - 简单静态重定向
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true, // 308
      },
    ];
  },
};
```

### 6.9 如何处理重定向的性能问题?

**问题**: 大量重定向会影响性能吗?

**解决方案**:

```tsx
// ❌ 不好:每次都查询数据库
export default async function Page({ params }) {
  const { slug } = await params;
  const redirect = await db.redirects.findOne({ oldSlug: slug });

  if (redirect) {
    permanentRedirect(redirect.newSlug);
  }
}

// ✅ 更好:使用缓存
import { cache } from "react";

const getRedirect = cache(async (slug: string) => {
  return await db.redirects.findOne({ oldSlug: slug });
});

export default async function Page({ params }) {
  const { slug } = await params;
  const redirect = await getRedirect(slug);

  if (redirect) {
    permanentRedirect(redirect.newSlug);
  }
}

// ✅ 最好:使用 next.config.js 或中间件
// 对于已知的静态重定向,使用配置文件
```

### 6.10 如何记录重定向日志?

**问题**: 如何跟踪重定向的使用情况?

**解决方案**:

```tsx
import { permanentRedirect } from "next/navigation";

async function logRedirect(from: string, to: string) {
  // 记录到数据库或分析服务
  await fetch("/api/analytics/redirect", {
    method: "POST",
    body: JSON.stringify({ from, to, timestamp: Date.now() }),
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const newSlug = await getNewSlug(slug);

  if (newSlug) {
    // 记录重定向
    await logRedirect(`/old/${slug}`, `/new/${newSlug}`);

    // 执行重定向
    permanentRedirect(`/new/${newSlug}`);
  }

  return <div>内容</div>;
}
```

---

## 7. 总结

`permanentRedirect` 是 Next.js 16 中处理永久重定向的专用函数,通过本章学习,你应该掌握了:

**核心概念**:

1. **永久重定向**: 返回 308 状态码
2. **SEO 友好**: 搜索引擎会更新索引并转移权重
3. **浏览器缓存**: 提高后续访问性能
4. **服务端专用**: 只能在服务端组件、Server Action 和 Route Handler 中使用

**实际应用**:

- URL 结构变更和网站重构
- 域名迁移和内容合并
- 废弃功能的重定向
- URL 规范化

**最佳实践**:

- 确保重定向是真正永久的
- 使用绝对路径避免歧义
- 避免重定向循环
- 不要捕获重定向错误
- 在重定向前完成所有必要操作

**注意事项**:

- 不能在客户端组件中使用
- 浏览器会缓存重定向
- 会影响 SEO 和搜索引擎索引
- 不会执行后续代码
- 与 `redirect` 的区别在于永久性

通过合理使用 `permanentRedirect`,可以优化网站的 SEO 表现,提供更好的用户体验,并确保旧 URL 的流量正确转移到新 URL。

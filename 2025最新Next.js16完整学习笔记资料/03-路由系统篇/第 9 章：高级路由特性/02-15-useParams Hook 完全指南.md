**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useParams Hook 完全指南

## 1. 概述

`useParams` 是 Next.js 16 App Router 提供的客户端 Hook,用于在客户端组件中访问动态路由参数。它返回当前路由的所有动态段参数。

### 1.1 概念定义

`useParams` Hook 允许客户端组件读取 URL 中的动态参数,如 `/blog/[slug]` 中的 `slug` 值。

**关键特征**:

- **客户端专用**: 只能在 `'use client'` 组件中使用
- **动态参数**: 访问 `[param]` 格式的路由参数
- **类型安全**: 完整的 TypeScript 支持
- **实时更新**: 参数变化时自动更新

**基本用法**:

```tsx
"use client";

import { useParams } from "next/navigation";

export default function BlogPost() {
  const params = useParams();

  return <div>文章 ID: {params.slug}</div>;
}
```

### 1.2 核心价值

**客户端参数访问**:

在客户端组件中方便地访问路由参数,无需通过 props 传递。

**动态交互**:

基于路由参数实现动态交互,如根据 ID 加载不同的内容、切换视图等。

**类型安全**:

TypeScript 支持确保参数类型正确,减少运行时错误。

**简化代码**:

相比 Pages Router,代码更简洁,不需要从 `router.query` 中提取参数。

### 1.3 与服务端组件的对比

| 特性     | 服务端组件         | 客户端组件 (useParams)  |
| :------- | :----------------- | :---------------------- |
| 参数获取 | 通过 `params` prop | 通过 `useParams()` Hook |
| 类型     | `Promise<Params>`  | `Params` 对象           |
| 使用方式 | `await params`     | 直接访问                |
| 适用场景 | 数据获取、SEO      | 交互、状态管理          |

**示例对比**:

```tsx
// 服务端组件
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>{slug}</div>;
}

// 客户端组件
("use client");

import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ slug: string }>();
  return <div>{params.slug}</div>;
}
```

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { useParams } from "next/navigation";

function useParams<T = Params>(): T;

type Params = {
  [key: string]: string | string[];
};
```

**返回值**:

返回一个包含所有动态路由参数的对象。

**类型参数**:

可以传入泛型参数指定参数类型:

```tsx
const params = useParams<{ slug: string }>();
// params.slug 的类型是 string
```

### 2.2 单个动态参数

**路由**: `app/blog/[slug]/page.tsx`

```tsx
"use client";

import { useParams } from "next/navigation";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();

  console.log(params); // { slug: 'hello-world' }
  console.log(params.slug); // 'hello-world'

  return <div>文章: {params.slug}</div>;
}
```

**URL 示例**:

- `/blog/hello-world` → `{ slug: 'hello-world' }`
- `/blog/nextjs-guide` → `{ slug: 'nextjs-guide' }`

### 2.3 多个动态参数

**路由**: `app/[category]/[slug]/page.tsx`

```tsx
"use client";

import { useParams } from "next/navigation";

export default function Post() {
  const params = useParams<{
    category: string;
    slug: string;
  }>();

  console.log(params);
  // { category: 'tech', slug: 'nextjs-16' }

  return (
    <div>
      <p>分类: {params.category}</p>
      <p>文章: {params.slug}</p>
    </div>
  );
}
```

**URL 示例**:

- `/tech/nextjs-16` → `{ category: 'tech', slug: 'nextjs-16' }`
- `/life/travel-tips` → `{ category: 'life', slug: 'travel-tips' }`

### 2.4 Catch-all 路由

**路由**: `app/docs/[...slug]/page.tsx`

```tsx
"use client";

import { useParams } from "next/navigation";

export default function Docs() {
  const params = useParams<{ slug: string[] }>();

  console.log(params);
  // { slug: ['getting-started', 'installation'] }

  const path = params.slug.join("/");

  return <div>文档路径: {path}</div>;
}
```

**URL 示例**:

- `/docs/getting-started` → `{ slug: ['getting-started'] }`
- `/docs/getting-started/installation` → `{ slug: ['getting-started', 'installation'] }`
- `/docs/api/reference/hooks` → `{ slug: ['api', 'reference', 'hooks'] }`

### 2.5 可选 Catch-all 路由

**路由**: `app/shop/[[...slug]]/page.tsx`

```tsx
"use client";

import { useParams } from "next/navigation";

export default function Shop() {
  const params = useParams<{ slug?: string[] }>();

  if (!params.slug) {
    return <div>商店首页</div>;
  }

  const category = params.slug[0];
  const subcategory = params.slug[1];

  return (
    <div>
      <p>分类: {category}</p>
      {subcategory && <p>子分类: {subcategory}</p>}
    </div>
  );
}
```

**URL 示例**:

- `/shop` → `{ slug: undefined }`
- `/shop/electronics` → `{ slug: ['electronics'] }`
- `/shop/electronics/phones` → `{ slug: ['electronics', 'phones'] }`

---

## 3. 适用场景

### 3.1 动态内容加载

**场景**: 根据路由参数加载不同的内容。

```tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      setProduct(data);
    }

    loadProduct();
  }, [params.id]);

  if (!product) return <div>加载中...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>价格: ¥{product.price}</p>
    </div>
  );
}
```

### 3.2 条件渲染

**场景**: 根据参数值渲染不同的组件。

```tsx
"use client";

import { useParams } from "next/navigation";

export default function DashboardPage() {
  const params = useParams<{ view: string }>();

  switch (params.view) {
    case "analytics":
      return <AnalyticsView />;
    case "reports":
      return <ReportsView />;
    case "settings":
      return <SettingsView />;
    default:
      return <OverviewView />;
  }
}
```

### 3.3 面包屑导航

**场景**: 根据路由参数生成面包屑导航。

```tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const params = useParams<{ slug: string[] }>();

  if (!params.slug) return null;

  const breadcrumbs = params.slug.map((segment, index) => {
    const href = "/" + params.slug.slice(0, index + 1).join("/");
    return { label: segment, href };
  });

  return (
    <nav>
      <Link href="/">首页</Link>
      {breadcrumbs.map((crumb, index) => (
        <span key={index}>
          {" / "}
          <Link href={crumb.href}>{crumb.label}</Link>
        </span>
      ))}
    </nav>
  );
}
```

### 3.4 标签页切换

**场景**: 根据路由参数切换标签页。

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";

export default function ProfileTabs() {
  const params = useParams<{ username: string; tab?: string }>();
  const router = useRouter();
  const activeTab = params.tab || "posts";

  function switchTab(tab: string) {
    router.push(`/users/${params.username}/${tab}`);
  }

  return (
    <div>
      <div className="tabs">
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => switchTab("posts")}
        >
          帖子
        </button>
        <button
          className={activeTab === "followers" ? "active" : ""}
          onClick={() => switchTab("followers")}
        >
          粉丝
        </button>
        <button
          className={activeTab === "following" ? "active" : ""}
          onClick={() => switchTab("following")}
        >
          关注
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "posts" && <PostsList username={params.username} />}
        {activeTab === "followers" && (
          <FollowersList username={params.username} />
        )}
        {activeTab === "following" && (
          <FollowingList username={params.username} />
        )}
      </div>
    </div>
  );
}
```

### 3.5 多语言路由

**场景**: 根据语言参数显示不同语言的内容。

```tsx
"use client";

import { useParams } from "next/navigation";

export default function LocalizedPage() {
  const params = useParams<{ lang: string }>();

  const translations = {
    en: {
      title: "Welcome",
      description: "This is the English version",
    },
    zh: {
      title: "欢迎",
      description: "这是中文版本",
    },
    ja: {
      title: "ようこそ",
      description: "これは日本語版です",
    },
  };

  const content = translations[params.lang] || translations.en;

  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
    </div>
  );
}
```

### 3.6 嵌套路由参数

**场景**: 处理多层嵌套的路由参数。

```tsx
"use client";

import { useParams } from "next/navigation";

// 路由: app/[org]/[repo]/issues/[id]/page.tsx
export default function IssuePage() {
  const params = useParams<{
    org: string;
    repo: string;
    id: string;
  }>();

  return (
    <div>
      <h1>Issue #{params.id}</h1>
      <p>组织: {params.org}</p>
      <p>仓库: {params.repo}</p>
    </div>
  );
}
```

---

## 4. 基础与进阶使用

### 4.1 基础用法:读取单个参数

```tsx
"use client";

import { useParams } from "next/navigation";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();

  return <h1>文章: {params.slug}</h1>;
}
```

### 4.2 中级用法:参数验证

```tsx
"use client";

import { useParams } from "next/navigation";
import { z } from "zod";
import { notFound } from "next/navigation";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/, "无效的 ID"),
});

export default function ProductPage() {
  const params = useParams<{ id: string }>();

  // 验证参数
  const result = paramsSchema.safeParse(params);

  if (!result.success) {
    notFound();
  }

  const productId = Number(result.data.id);

  return <div>产品 ID: {productId}</div>;
}
```

### 4.3 高级用法:自定义 Hook

```tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

function useTypedParams<T extends Record<string, any>>() {
  const params = useParams();

  return useMemo(() => {
    return params as T;
  }, [params]);
}

// 使用
export default function Page() {
  const params = useTypedParams<{ slug: string; id: string }>();

  return (
    <div>
      <p>Slug: {params.slug}</p>
      <p>ID: {params.id}</p>
    </div>
  );
}
```

### 4.4 高级用法:参数转换

```tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

function useNumericParam(key: string): number | null {
  const params = useParams();

  return useMemo(() => {
    const value = params[key];
    if (typeof value === "string") {
      const num = Number(value);
      return isNaN(num) ? null : num;
    }
    return null;
  }, [params, key]);
}

export default function Page() {
  const id = useNumericParam("id");

  if (id === null) {
    return <div>无效的 ID</div>;
  }

  return <div>产品 ID: {id}</div>;
}
```

### 4.5 高级用法:并行路由参数

```tsx
"use client";

import { useParams } from "next/navigation";

// 路由: app/@modal/[id]/page.tsx
export default function Modal() {
  const params = useParams<{ id: string }>();

  return (
    <div className="modal">
      <h2>模态框 #{params.id}</h2>
      <p>这是一个并行路由</p>
    </div>
  );
}
```

### 4.6 高级用法:参数监听

```tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const params = useParams<{ id: string }>();

  useEffect(() => {
    console.log("参数变化:", params.id);

    // 执行副作用,如数据加载、分析跟踪等
    trackPageView(params.id);
  }, [params.id]);

  return <div>当前 ID: {params.id}</div>;
}
```

---

## 5. 注意事项

### 5.1 只能在客户端组件中使用

`useParams` 只能在客户端组件中使用:

```tsx
// ❌ 错误:服务端组件不能使用 useParams
export default function ServerComponent() {
  const params = useParams(); // 错误!
  return <div>...</div>;
}

// ✅ 正确:客户端组件
("use client");

export default function ClientComponent() {
  const params = useParams(); // 正确
  return <div>...</div>;
}

// ✅ 正确:服务端组件使用 params prop
export default async function ServerComponent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>{slug}</div>;
}
```

### 5.2 参数类型

所有参数都是字符串或字符串数组:

```tsx
const params = useParams<{ id: string }>();

// ❌ 错误:直接当数字使用
const nextId = params.id + 1; // 字符串拼接!

// ✅ 正确:转换为数字
const nextId = Number(params.id) + 1;
```

### 5.3 Catch-all 路由参数

Catch-all 路由的参数是数组:

```tsx
// 路由: app/docs/[...slug]/page.tsx
const params = useParams<{ slug: string[] }>();

// ❌ 错误:当字符串使用
console.log(params.slug.toUpperCase()); // 错误!

// ✅ 正确:当数组使用
console.log(params.slug.join("/")); // 正确
```

### 5.4 可选参数处理

可选 Catch-all 路由的参数可能是 undefined:

```tsx
// 路由: app/shop/[[...slug]]/page.tsx
const params = useParams<{ slug?: string[] }>();

// ❌ 错误:直接使用可能报错
const path = params.slug.join("/"); // 如果 slug 是 undefined,会报错!

// ✅ 正确:检查是否存在
const path = params.slug?.join("/") || "";
```

### 5.5 URL 编码

参数值会自动解码:

```tsx
// URL: /blog/hello%20world
const params = useParams<{ slug: string }>();
console.log(params.slug); // 'hello world' (已解码)
```

### 5.6 参数不可变

`useParams` 返回的对象是只读的:

```tsx
const params = useParams<{ id: string }>();

// ❌ 错误:不能修改参数
params.id = "123"; // 可能会报错或无效

// ✅ 正确:使用 useRouter 导航到新 URL
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/products/123");
```

### 5.7 性能考虑

避免在渲染期间执行昂贵的操作:

```tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Page() {
  const params = useParams<{ slug: string }>();

  // ✅ 使用 useMemo 缓存计算结果
  const processedSlug = useMemo(() => {
    return expensiveOperation(params.slug);
  }, [params.slug]);

  return <div>{processedSlug}</div>;
}
```

### 5.8 TypeScript 类型安全

始终为 `useParams` 提供类型参数:

```tsx
// ❌ 不推荐:没有类型
const params = useParams();
console.log(params.slug); // 类型是 any

// ✅ 推荐:提供类型
const params = useParams<{ slug: string }>();
console.log(params.slug); // 类型是 string
```

---

## 6. 常见问题

### 6.1 如何在服务端组件中使用?

服务端组件使用 `params` prop:

```tsx
// 服务端组件
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>{slug}</div>;
}

// 客户端组件
("use client");

import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ slug: string }>();
  return <div>{params.slug}</div>;
}
```

### 6.2 如何处理多个参数?

直接在类型中定义所有参数:

```tsx
const params = useParams<{
  category: string;
  subcategory: string;
  id: string;
}>();

console.log(params.category);
console.log(params.subcategory);
console.log(params.id);
```

### 6.3 如何验证参数?

使用 Zod 等验证库:

```tsx
"use client";

import { useParams } from "next/navigation";
import { z } from "zod";
import { notFound } from "next/navigation";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/),
  slug: z.string().min(1),
});

export default function Page() {
  const params = useParams();

  const result = paramsSchema.safeParse(params);

  if (!result.success) {
    notFound();
  }

  const { id, slug } = result.data;

  return (
    <div>
      <p>ID: {id}</p>
      <p>Slug: {slug}</p>
    </div>
  );
}
```

### 6.4 如何处理 Catch-all 路由?

Catch-all 路由返回数组:

```tsx
// 路由: app/docs/[...slug]/page.tsx
const params = useParams<{ slug: string[] }>();

// 访问数组元素
const section = params.slug[0];
const page = params.slug[1];

// 转换为路径
const path = params.slug.join("/");
```

### 6.5 如何处理可选 Catch-all 路由?

使用可选类型:

```tsx
// 路由: app/shop/[[...slug]]/page.tsx
const params = useParams<{ slug?: string[] }>();

if (!params.slug) {
  // 首页
  return <div>商店首页</div>;
}

// 有参数
const category = params.slug[0];
return <div>分类: {category}</div>;
```

### 6.6 参数变化时如何重新加载数据?

使用 `useEffect` 监听参数变化:

```tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/items/${params.id}`);
      const json = await res.json();
      setData(json);
    }

    loadData();
  }, [params.id]); // 参数变化时重新加载

  if (!data) return <div>加载中...</div>;

  return <div>{data.name}</div>;
}
```

### 6.7 如何转换参数类型?

手动转换或使用自定义 Hook:

```tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Page() {
  const params = useParams<{ id: string; page: string }>();

  const numericParams = useMemo(
    () => ({
      id: Number(params.id),
      page: Number(params.page),
    }),
    [params.id, params.page]
  );

  return (
    <div>
      <p>ID: {numericParams.id}</p>
      <p>页码: {numericParams.page}</p>
    </div>
  );
}
```

### 6.8 如何处理 URL 编码的参数?

参数会自动解码:

```tsx
// URL: /blog/hello%20world
const params = useParams<{ slug: string }>();
console.log(params.slug); // 'hello world'

// 如果需要编码
const encoded = encodeURIComponent(params.slug);
console.log(encoded); // 'hello%20world'
```

### 6.9 如何在嵌套组件中使用?

`useParams` 可以在任何客户端组件中使用:

```tsx
"use client";

import { useParams } from "next/navigation";

function NestedComponent() {
  const params = useParams<{ id: string }>();
  return <div>ID: {params.id}</div>;
}

export default function Page() {
  return (
    <div>
      <h1>页面</h1>
      <NestedComponent />
    </div>
  );
}
```

### 6.10 如何处理参数不存在的情况?

检查参数是否存在:

```tsx
"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function Page() {
  const params = useParams<{ id?: string }>();

  if (!params.id) {
    notFound();
  }

  return <div>ID: {params.id}</div>;
}
```

---

## 7. 总结

`useParams` 是 Next.js App Router 中在客户端组件访问路由参数的核心 Hook。

**核心要点**:

1. **客户端专用**: 只能在 `'use client'` 组件中使用
2. **动态参数**: 访问 URL 中的动态段参数
3. **类型安全**: 支持 TypeScript 泛型
4. **实时更新**: 参数变化时自动更新
5. **自动解码**: URL 编码的参数会自动解码

**最佳实践**:

- 始终提供 TypeScript 类型参数
- 验证参数有效性
- 处理可选参数和边界情况
- 使用 useMemo 缓存计算结果
- 在 useEffect 中监听参数变化
- 正确处理 Catch-all 路由参数

**适用场景**:

- 动态内容加载
- 条件渲染
- 面包屑导航
- 标签页切换
- 多语言路由
- 嵌套路由参数

**与服务端组件对比**:

| 特性     | 服务端组件          | 客户端组件 (useParams) |
| :------- | :------------------ | :--------------------- |
| 参数获取 | `params` prop       | `useParams()` Hook     |
| 类型     | `Promise<Params>`   | `Params` 对象          |
| 使用方式 | `await params`      | 直接访问               |
| 适用场景 | 数据获取、SEO       | 交互、状态管理         |
| 性能     | 服务端渲染,更快 SEO | 客户端交互,更灵活      |

**注意事项**:

- 参数都是字符串或字符串数组
- Catch-all 路由返回数组
- 可选 Catch-all 路由参数可能是 undefined
- 参数对象是只读的
- 使用 useRouter 更新 URL

掌握 `useParams`,可以在客户端组件中灵活访问和使用路由参数。

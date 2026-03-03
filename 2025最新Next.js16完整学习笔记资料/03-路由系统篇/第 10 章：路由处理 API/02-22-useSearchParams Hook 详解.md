**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useSearchParams Hook 详解

## 1. 概述

`useSearchParams` 是 Next.js 16 App Router 提供的客户端 Hook,用于读取和操作 URL 查询参数。它返回一个只读的 `URLSearchParams` 对象。

### 1.1 概念定义

`useSearchParams` Hook 允许客户端组件访问 URL 中的查询参数,如 `?page=2&sort=desc` 中的参数。

**关键特征**:

- **客户端专用**: 只能在 `'use client'` 组件中使用
- **只读对象**: 返回 `ReadonlyURLSearchParams`
- **实时更新**: 参数变化时自动更新
- **类型安全**: TypeScript 支持

**基本用法**:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  return <div>搜索: {query}</div>;
}
```

### 1.2 核心价值

**查询参数访问**:

方便地读取 URL 查询参数,无需手动解析。

**动态过滤和排序**:

基于查询参数实现列表过滤、排序、分页等功能。

**状态同步**:

将 UI 状态同步到 URL,支持书签和分享。

**SEO 友好**:

查询参数可以被搜索引擎索引。

### 1.3 与服务端组件的对比

| 特性     | 服务端组件               | 客户端组件 (useSearchParams)  |
| :------- | :----------------------- | :---------------------------- |
| 参数获取 | 通过 `searchParams` prop | 通过 `useSearchParams()` Hook |
| 类型     | `Promise<SearchParams>`  | `ReadonlyURLSearchParams`     |
| 使用方式 | `await searchParams`     | 直接访问                      |
| 适用场景 | 数据获取、SEO            | 交互、状态管理                |

**示例对比**:

```tsx
// 服务端组件
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <div>{q}</div>;
}

// 客户端组件
("use client");

import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  return <div>{q}</div>;
}
```

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { useSearchParams } from "next/navigation";

function useSearchParams(): ReadonlyURLSearchParams;

interface ReadonlyURLSearchParams extends URLSearchParams {
  // 只读,不能修改
}
```

**返回值**:

返回一个只读的 `URLSearchParams` 对象。

**常用方法**:

- `get(name)`: 获取单个参数值
- `getAll(name)`: 获取所有同名参数值
- `has(name)`: 检查参数是否存在
- `toString()`: 转换为字符串
- `entries()`: 获取所有参数的迭代器

### 2.2 读取单个参数

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();

  // URL: /search?q=nextjs
  const query = searchParams.get("q"); // 'nextjs'

  // URL: /search (没有 q 参数)
  const query2 = searchParams.get("q"); // null

  return <div>搜索: {query || "无"}</div>;
}
```

### 2.3 读取多个参数

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  // URL: /products?category=electronics&sort=price&order=asc
  const category = searchParams.get("category"); // 'electronics'
  const sort = searchParams.get("sort"); // 'price'
  const order = searchParams.get("order"); // 'asc'

  return (
    <div>
      <p>分类: {category}</p>
      <p>排序: {sort}</p>
      <p>顺序: {order}</p>
    </div>
  );
}
```

### 2.4 读取数组参数

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function FilterPage() {
  const searchParams = useSearchParams();

  // URL: /filter?tags=react&tags=nextjs&tags=typescript
  const tags = searchParams.getAll("tags");
  // ['react', 'nextjs', 'typescript']

  return (
    <div>
      <h2>标签:</h2>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2.5 检查参数是否存在

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  // URL: /page?debug=true
  const hasDebug = searchParams.has("debug"); // true
  const hasAdmin = searchParams.has("admin"); // false

  return <div>{hasDebug && <DebugPanel />}</div>;
}
```

### 2.6 遍历所有参数

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function DebugPage() {
  const searchParams = useSearchParams();

  // 转换为对象
  const params = Object.fromEntries(searchParams.entries());

  return (
    <div>
      <h2>所有参数:</h2>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}
```

### 2.7 更新查询参数

`useSearchParams` 返回的是只读对象,要更新参数需要使用 `useRouter`:

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function updateSearch(newQuery: string) {
    const params = new URLSearchParams(searchParams);
    params.set("q", newQuery);

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      type="text"
      defaultValue={searchParams.get("q") || ""}
      onChange={(e) => updateSearch(e.target.value)}
    />
  );
}
```

---

## 3. 适用场景

### 3.1 搜索功能

**场景**: 实现搜索框,将搜索词同步到 URL。

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [query, pathname, router, searchParams]);

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

### 3.2 分页

**场景**: 实现分页功能。

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get("page")) || 1;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        上一页
      </button>

      <span>
        第 {currentPage} / {totalPages} 页
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
    </div>
  );
}
```

### 3.3 过滤和排序

**场景**: 产品列表的过滤和排序。

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function ProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <select
        value={category}
        onChange={(e) => updateFilter("category", e.target.value)}
      >
        <option value="all">所有分类</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
      </select>

      <select
        value={sort}
        onChange={(e) => updateFilter("sort", e.target.value)}
      >
        <option value="name">名称</option>
        <option value="price">价格</option>
        <option value="date">日期</option>
      </select>

      <select
        value={order}
        onChange={(e) => updateFilter("order", e.target.value)}
      >
        <option value="asc">升序</option>
        <option value="desc">降序</option>
      </select>
    </div>
  );
}
```

### 3.4 标签页切换

**场景**: 使用 URL 参数控制标签页。

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Tabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "overview";

  function switchTab(tab: string) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <div className="tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => switchTab("overview")}
        >
          概览
        </button>
        <button
          className={activeTab === "details" ? "active" : ""}
          onClick={() => switchTab("details")}
        >
          详情
        </button>
        <button
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => switchTab("reviews")}
        >
          评论
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && <div>概览内容</div>}
        {activeTab === "details" && <div>详情内容</div>}
        {activeTab === "reviews" && <div>评论内容</div>}
      </div>
    </div>
  );
}
```

### 3.5 多选过滤

**场景**: 实现多选过滤功能。

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function MultiSelectFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 获取当前选中的标签
  const selectedTags = searchParams.getAll("tag");

  function toggleTag(tag: string) {
    const params = new URLSearchParams(searchParams);

    if (selectedTags.includes(tag)) {
      // 移除标签
      params.delete("tag");
      selectedTags
        .filter((t) => t !== tag)
        .forEach((t) => params.append("tag", t));
    } else {
      // 添加标签
      params.append("tag", tag);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  const availableTags = ["react", "nextjs", "typescript", "javascript"];

  return (
    <div>
      <h3>选择标签:</h3>
      {availableTags.map((tag) => (
        <label key={tag}>
          <input
            type="checkbox"
            checked={selectedTags.includes(tag)}
            onChange={() => toggleTag(tag)}
          />
          {tag}
        </label>
      ))}

      <p>已选择: {selectedTags.join(", ") || "无"}</p>
    </div>
  );
}
```

### 3.6 URL 状态同步

**场景**: 将组件状态同步到 URL。

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SyncedInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = useState(searchParams.get("q") || "");

  // 同步 URL 参数到状态
  useEffect(() => {
    const urlValue = searchParams.get("q") || "";
    if (urlValue !== value) {
      setValue(urlValue);
    }
  }, [searchParams]);

  // 防抖更新 URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

---

## 4. API 签名与配置

### 4.1 完整类型定义

```tsx
import { useSearchParams } from "next/navigation";

// useSearchParams 返回 ReadonlyURLSearchParams
const searchParams: ReadonlyURLSearchParams = useSearchParams();

interface ReadonlyURLSearchParams extends URLSearchParams {
  // 继承 URLSearchParams 的所有方法,但是只读的
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  entries(): IterableIterator<[string, string]>;
  forEach(callback: (value: string, key: string) => void): void;
  toString(): string;
}
```

### 4.2 常用方法

**get(name)**: 获取单个参数值

```tsx
const query = searchParams.get("q"); // 'nextjs' 或 null
```

**getAll(name)**: 获取所有同名参数值

```tsx
const tags = searchParams.getAll("tag"); // ['react', 'nextjs']
```

**has(name)**: 检查参数是否存在

```tsx
const hasQuery = searchParams.has("q"); // true 或 false
```

**toString()**: 转换为字符串

```tsx
const queryString = searchParams.toString(); // 'q=nextjs&page=1'
```

**entries()**: 遍历所有参数

```tsx
for (const [key, value] of searchParams.entries()) {
  console.log(key, value);
}
```

### 4.3 与 URLSearchParams 的区别

| 特性     | useSearchParams         | URLSearchParams |
| :------- | :---------------------- | :-------------- |
| 可变性   | 只读                    | 可变            |
| 使用场景 | 读取 URL 参数           | 构建 URL 参数   |
| 方法     | 只有读取方法            | 读取和修改方法  |
| 更新 URL | 需要配合 useRouter      | 不会更新 URL    |
| 类型     | ReadonlyURLSearchParams | URLSearchParams |

---

## 5. 基础与进阶使用

### 5.1 基础用法:读取单个参数

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  return (
    <div>
      <h1>搜索结果</h1>
      <p>搜索关键词: {query || "无"}</p>
    </div>
  );
}
```

### 5.2 中级用法:读取多个参数

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ProductList() {
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "all";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || Infinity;
  const sort = searchParams.get("sort") || "name";

  return (
    <div>
      <h1>产品列表</h1>
      <p>分类: {category}</p>
      <p>
        价格范围: ${minPrice} - ${maxPrice}
      </p>
      <p>排序: {sort}</p>
    </div>
  );
}
```

### 5.3 高级用法:参数验证

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(["name", "price", "date"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export default function ValidatedList() {
  const searchParams = useSearchParams();

  // 验证和解析参数
  const params = searchParamsSchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sort: searchParams.get("sort"),
    order: searchParams.get("order"),
  });

  return (
    <div>
      <p>页码: {params.page}</p>
      <p>每页数量: {params.limit}</p>
      <p>
        排序: {params.sort} ({params.order})
      </p>
    </div>
  );
}
```

### 5.4 高级用法:自定义 Hook

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setQueryParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const deleteQueryParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams);
      params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const setMultipleParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        params.set(key, value);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return {
    searchParams,
    setQueryParam,
    deleteQueryParam,
    setMultipleParams,
  };
}

export default function Component() {
  const { searchParams, setQueryParam, setMultipleParams } = useQueryParams();

  return (
    <div>
      <button onClick={() => setQueryParam("tab", "overview")}>概览</button>
      <button onClick={() => setMultipleParams({ tab: "details", page: "1" })}>
        详情
      </button>
    </div>
  );
}
```

### 5.5 高级用法:服务端组件中使用

在服务端组件中,使用 `searchParams` prop 而不是 Hook:

```tsx
// app/search/page.tsx (服务端组件)
interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Number(params.page) || 1;

  const results = await searchData(query, page);

  return (
    <div>
      <h1>搜索结果: {query}</h1>
      <ResultsList results={results} />
      <ClientPagination currentPage={page} />
    </div>
  );
}

// 客户端组件处理分页
("use client");

import { useSearchParams, useRouter, usePathname } from "next/navigation";

function ClientPagination({ currentPage }: { currentPage: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <button onClick={() => goToPage(currentPage - 1)}>上一页</button>
      <span>第 {currentPage} 页</span>
      <button onClick={() => goToPage(currentPage + 1)}>下一页</button>
    </div>
  );
}
```

---

## 6. 注意事项

### 6.1 只能在客户端组件中使用

`useSearchParams` 只能在客户端组件中使用:

```tsx
// ❌ 错误:服务端组件不能使用 useSearchParams
export default function ServerComponent() {
  const searchParams = useSearchParams(); // 错误!
  return <div>...</div>;
}

// ✅ 正确:客户端组件
("use client");

export default function ClientComponent() {
  const searchParams = useSearchParams(); // 正确
  return <div>...</div>;
}

// ✅ 正确:服务端组件使用 searchParams prop
export default async function ServerComponent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <div>{params.q}</div>;
}
```

### 6.2 返回值是只读的

`useSearchParams` 返回的对象是只读的,不能直接修改:

```tsx
const searchParams = useSearchParams();

// ❌ 错误:不能直接修改
searchParams.set("page", "2"); // 类型错误!

// ✅ 正确:创建新的 URLSearchParams
const params = new URLSearchParams(searchParams);
params.set("page", "2");
router.push(`${pathname}?${params.toString()}`);
```

### 6.3 参数类型都是字符串

所有 URL 参数都是字符串类型,需要手动转换:

```tsx
const searchParams = useSearchParams();

// ❌ 错误:直接使用可能导致类型错误
const page = searchParams.get("page"); // string | null
const total = page + 1; // 字符串拼接,不是数字加法!

// ✅ 正确:转换为数字
const page = Number(searchParams.get("page")) || 1;
const total = page + 1; // 正确的数字加法
```

### 6.4 处理缺失参数

参数可能不存在,需要提供默认值:

```tsx
const searchParams = useSearchParams();

// ❌ 可能出错:参数不存在时为 null
const query = searchParams.get("q");
console.log(query.toUpperCase()); // 如果 query 是 null,会报错!

// ✅ 正确:提供默认值
const query = searchParams.get("q") || "";
console.log(query.toUpperCase()); // 安全
```

### 6.5 URL 编码问题

特殊字符需要正确编码和解码:

```tsx
const searchParams = useSearchParams();

// 获取参数时自动解码
const query = searchParams.get("q"); // 'hello world' (已解码)

// 设置参数时需要编码
const params = new URLSearchParams();
params.set("q", "hello world"); // 自动编码为 'hello%20world'
```

### 6.6 多个同名参数

使用 `getAll()` 获取所有同名参数:

```tsx
// URL: /page?tag=react&tag=nextjs&tag=typescript
const searchParams = useSearchParams();

// ❌ 只获取第一个
const tag = searchParams.get("tag"); // 'react'

// ✅ 获取所有
const tags = searchParams.getAll("tag"); // ['react', 'nextjs', 'typescript']
```

### 6.7 性能考虑

频繁更新 URL 可能影响性能,使用防抖:

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // 防抖更新 URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 500); // 500ms 防抖

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

### 6.8 Suspense 边界

使用 `useSearchParams` 的组件应该包裹在 Suspense 中:

```tsx
import { Suspense } from "react";

function SearchComponent() {
  const searchParams = useSearchParams();
  return <div>{searchParams.get("q")}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SearchComponent />
    </Suspense>
  );
}
```

---

## 7. 常见问题

### 7.1 如何更新 URL 参数?

使用 `useRouter` 配合 `URLSearchParams`:

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Component() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return <button onClick={() => updateParam("page", "2")}>第 2 页</button>;
}
```

### 7.2 如何删除 URL 参数?

使用 `URLSearchParams.delete()`:

```tsx
function removeParam(key: string) {
  const params = new URLSearchParams(searchParams);
  params.delete(key);
  router.push(`${pathname}?${params.toString()}`);
}
```

### 7.3 如何同时更新多个参数?

批量更新参数:

```tsx
function updateMultipleParams(updates: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    params.set(key, value);
  });
  router.push(`${pathname}?${params.toString()}`);
}

// 使用
updateMultipleParams({ page: "1", sort: "name", order: "asc" });
```

### 7.4 如何保留现有参数?

使用现有的 `searchParams` 创建新的 `URLSearchParams`:

```tsx
// 保留现有参数,只更新 page
const params = new URLSearchParams(searchParams);
params.set("page", "2");
router.push(`${pathname}?${params.toString()}`);
```

### 7.5 如何清空所有参数?

直接导航到不带参数的 URL:

```tsx
function clearAllParams() {
  router.push(pathname);
}
```

### 7.6 如何处理数组参数?

使用 `getAll()` 和 `append()`:

```tsx
// 读取数组参数
const tags = searchParams.getAll("tag"); // ['react', 'nextjs']

// 设置数组参数
const params = new URLSearchParams();
["react", "nextjs", "typescript"].forEach((tag) => {
  params.append("tag", tag);
});
router.push(`${pathname}?${params.toString()}`);
// 结果: /page?tag=react&tag=nextjs&tag=typescript
```

### 7.7 如何在服务端组件中使用?

使用 `searchParams` prop:

```tsx
// app/page.tsx
interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";

  return <div>搜索: {query}</div>;
}
```

### 7.8 如何实现搜索历史?

结合 localStorage 保存搜索历史:

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      // 保存到搜索历史
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      const newHistory = [query, ...history.filter((q) => q !== query)].slice(
        0,
        10
      );
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  }, [query]);

  return <div>搜索: {query}</div>;
}
```

### 7.9 如何实现参数持久化?

使用 URL 参数本身就是一种持久化,刷新页面参数仍然存在:

```tsx
// URL: /page?tab=details
// 刷新页面后,tab 参数仍然是 'details'
const tab = searchParams.get("tab"); // 'details'
```

### 7.10 如何处理参数冲突?

使用参数验证和默认值:

```tsx
const searchParams = useSearchParams();

// 验证参数值
const sort = searchParams.get("sort");
const validSort = ["name", "price", "date"].includes(sort || "")
  ? sort
  : "name";

// 或使用 Zod 验证
import { z } from "zod";

const sortSchema = z.enum(["name", "price", "date"]).catch("name");
const validatedSort = sortSchema.parse(searchParams.get("sort"));
```

---

## 8. 总结

`useSearchParams` 是 Next.js App Router 中读取 URL 查询参数的核心 Hook。

**核心要点**:

1. **客户端专用**: 只能在客户端组件中使用
2. **只读对象**: 返回 ReadonlyURLSearchParams,不能直接修改
3. **字符串类型**: 所有参数都是字符串,需要手动转换
4. **配合 useRouter**: 更新参数需要配合 useRouter 和 usePathname
5. **Suspense 边界**: 应该包裹在 Suspense 中

**最佳实践**:

- 为参数提供默认值
- 使用 Zod 等库验证参数
- 使用防抖避免频繁更新 URL
- 创建自定义 Hook 封装常用操作
- 在服务端组件中使用 searchParams prop
- 正确处理数组参数和特殊字符

**适用场景**:

- 搜索功能
- 分页
- 过滤和排序
- 标签页切换
- 多选过滤
- URL 状态同步

掌握 `useSearchParams`,可以轻松实现基于 URL 的状态管理。

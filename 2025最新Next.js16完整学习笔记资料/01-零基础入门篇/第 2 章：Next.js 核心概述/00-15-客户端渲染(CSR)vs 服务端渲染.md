**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 客户端渲染(CSR) vs 服务端渲染(SSR)

## 1. 概述 (Overview)

### 1.1 核心定义

#### 1.1.1 客户端渲染 (CSR)

**定义**:HTML 在浏览器中通过 JavaScript 生成。

**流程**:

```
用户请求
  ↓
服务器返回空 HTML + JavaScript
  ↓
浏览器下载 JavaScript
  ↓
JavaScript 执行
  ↓
调用 API 获取数据
  ↓
React 渲染组件
  ↓
生成 DOM
  ↓
页面可见

总耗时: 较长
```

**示例 HTML**:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/bundle.js"></script>
  </body>
</html>
```

初始 HTML 几乎为空,所有内容由 JavaScript 生成。

#### 1.1.2 服务端渲染 (SSR)

**定义**:HTML 在服务器上生成,发送给浏览器。

**流程**:

```
用户请求
  ↓
服务器获取数据
  ↓
服务器渲染 React 组件
  ↓
生成 HTML
  ↓
返回完整 HTML
  ↓
浏览器显示内容
  ↓
下载 JavaScript
  ↓
水合 (Hydration)
  ↓
页面可交互

总耗时: 较短
```

**示例 HTML**:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Product Page</title>
  </head>
  <body>
    <div id="root">
      <h1>Product Name</h1>
      <p>Product description...</p>
      <button>Add to Cart</button>
    </div>
    <script src="/bundle.js"></script>
  </body>
</html>
```

初始 HTML 包含完整内容,用户立即看到页面。

### 1.2 核心差异

| 维度            | CSR      | SSR         |
| --------------- | -------- | ----------- |
| HTML 生成位置   | 浏览器   | 服务器      |
| 首屏速度        | 慢       | 快          |
| SEO             | 差       | 优秀        |
| 服务器负载      | 低       | 高          |
| 后续导航        | 快       | 中等        |
| 开发复杂度      | 简单     | 复杂        |
| 部署            | 静态部署 | 需要服务器  |
| JavaScript 依赖 | 必需     | 可选 (增强) |

---

## 2. 客户端渲染 (CSR) 详解

### 2.1 CSR 工作原理

#### 2.1.1 渲染流程

```
1. 浏览器请求页面
   ↓
2. 服务器返回空 HTML
   ↓
3. 浏览器解析 HTML
   ↓
4. 发现 script 标签
   ↓
5. 下载 JavaScript (bundle.js)
   ↓
6. JavaScript 执行
   ↓
7. React 初始化
   ↓
8. 调用 API 获取数据
   ↓
9. React 渲染组件
   ↓
10. 生成 DOM 并插入页面
   ↓
11. 页面可见且可交互
```

时间线:

```
0ms: 请求发送
100ms: HTML 返回
200ms: JavaScript 下载开始
800ms: JavaScript 下载完成
1000ms: JavaScript 执行完成
1200ms: API 请求发送
1800ms: API 响应返回
2000ms: 页面渲染完成

总耗时: 2000ms
用户白屏时间: 2000ms
```

#### 2.1.2 React CSR 实现

```tsx
// index.html
<!DOCTYPE html>
<html>
<head>
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>

// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// App.tsx
import { useEffect, useState } from 'react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.example.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2.2 CSR 优势

#### 2.2.1 前后端完全分离

```
前端:
  - 静态部署 (CDN)
  - 独立开发
  - 独立测试
  - 独立发布

后端:
  - RESTful API
  - GraphQL
  - 专注业务逻辑
  - 易于扩展

优势:
  - 团队分工明确
  - 开发效率高
  - 部署简单
  - 维护成本低
```

#### 2.2.2 丰富的用户交互

```tsx
"use client"; // Next.js 中的客户端组件

import { useState } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  function handleAdd() {
    setTodos([...todos, { id: Date.now(), text: input }]);
    setInput("");
  }

  function handleDelete(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleAdd()}
      />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2.3 CSR 劣势

#### 2.3.1 首屏加载慢

问题:

```
用户访问页面
  ↓
白屏 (等待 JavaScript 下载)
  ↓ 500ms
白屏 (等待 JavaScript 执行)
  ↓ 300ms
显示 Loading... (等待 API)
  ↓ 800ms
显示实际内容

用户等待: 1600ms
```

优化策略:

```tsx
// 1. 代码分割
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}

// 2. 预加载关键资源
<link rel="preload" href="/critical.js" as="script">
<link rel="preload" href="/critical.css" as="style">

// 3. 骨架屏
export default function ProductListSkeleton() {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
```

#### 2.3.2 SEO 问题

问题:

```
搜索引擎爬虫请求页面
  ↓
收到空 HTML
  ↓
<div id="root"></div>
  ↓
无法索引内容
  ↓
SEO 差
```

解决方案:

```
1. 使用 SSR 或 SSG
2. 预渲染 (Prerendering)
3. 动态渲染 (Dynamic Rendering)
```

---

## 3. 服务端渲染 (SSR) 详解

### 3.1 SSR 工作原理

#### 3.1.1 渲染流程

```
1. 浏览器请求页面
   ↓
2. 服务器接收请求
   ↓
3. 服务器获取数据
   ↓
4. 服务器渲染 React 组件
   ↓
5. 生成 HTML 字符串
   ↓
6. 返回完整 HTML
   ↓
7. 浏览器显示 HTML (可见但不可交互)
   ↓
8. 下载 JavaScript
   ↓
9. JavaScript 执行
   ↓
10. React 水合 (Hydration)
   ↓
11. 页面可交互
```

时间线:

```
0ms: 请求发送
500ms: HTML 返回 (包含完整内容)
600ms: 用户看到页面 (可见但不可交互)
800ms: JavaScript 下载完成
1000ms: 水合完成 (可交互)

总耗时: 1000ms
用户可见时间: 600ms (比 CSR 快!)
可交互时间: 1000ms
```

#### 3.1.2 Next.js SSR 实现

```tsx
// app/products/page.tsx

// 强制动态渲染
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  // 服务器端执行
  const products = await fetch("https://api.example.com/products", {
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ProductCard.tsx - Server Component
export default function ProductCard({ product }) {
  return (
    <div className="card">
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p className="price">¥{product.price}</p>
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// AddToCartButton.tsx - Client Component
("use client");

export default function AddToCartButton({ productId }) {
  const [isAdding, setIsAdding] = useState(false);

  async function handleClick() {
    setIsAdding(true);
    await addToCart(productId);
    setIsAdding(false);
  }

  return (
    <button onClick={handleClick} disabled={isAdding}>
      {isAdding ? "添加中..." : "加入购物车"}
    </button>
  );
}
```

### 3.2 水合 (Hydration)

#### 3.2.1 水合概念

**定义**:将服务端生成的静态 HTML 转换为可交互的 React 应用的过程。

**过程**:

```
1. 服务器生成 HTML
   <button>Click Me</button>

2. 浏览器显示 HTML
   用户看到按钮,但点击无效

3. JavaScript 加载并执行
   React.hydrateRoot(document.getElementById('root'), <App />)

4. React 遍历 DOM 树
   对比虚拟 DOM 和实际 DOM

5. 附加事件监听器
   button.addEventListener('click', handleClick)

6. 水合完成
   按钮变为可点击
```

#### 3.2.2 水合示例

```tsx
// Server Component
export default async function Page() {
  const data = await getData();

  return (
    <div>
      <h1>Title</h1>
      <Counter initialCount={data.count} />
    </div>
  );
}

// Client Component
("use client");

import { useState } from "react";

export default function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}

// 流程:
// 1. 服务器渲染: <button>Count: 5</button>
// 2. 浏览器显示: 按钮可见但点击无效
// 3. JavaScript 水合: 附加 onClick 事件
// 4. 按钮可点击: 每次点击 count 增加
```

#### 3.2.3 水合不匹配

常见错误:

```tsx
// ❌ 错误: 服务端和客户端渲染不一致
export default function Page() {
  return (
    <div>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

// 问题:
// 服务器: Current time: 2025-11-27 10:00:00
// 客户端: Current time: 2025-11-27 10:00:05
// 水合失败!

// ✅ 正确: 使用 useEffect
("use client");

import { useState, useEffect } from "react";

export default function CurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleString());
  }, []);

  return <p>Current time: {time}</p>;
}
```

### 3.3 SSR 优势

#### 3.3.1 快速首屏

性能对比:

```
CSR:
  TTFB: 100ms
  FCP: 2000ms (等待 JS + API)
  LCP: 2500ms

SSR:
  TTFB: 500ms (包含数据获取)
  FCP: 600ms (立即显示内容)
  LCP: 800ms

SSR 首屏快 70%!
```

#### 3.3.2 SEO 友好

```
搜索引擎爬虫请求页面
  ↓
收到完整 HTML
  ↓
<h1>Product Name</h1>
<p>Product description...</p>
<img src="product.jpg" alt="Product">
  ↓
完整索引内容
  ↓
SEO 优秀!
```

### 3.4 SSR 劣势

#### 3.4.1 服务器负载高

```
每次请求:
  数据获取 → 组件渲染 → HTML 生成 → 返回

1000 并发请求:
  服务器需要执行 1000 次完整渲染
  CPU/内存占用高
  响应时间延长
```

优化策略:

```tsx
// 1. 使用缓存
export const revalidate = 60; // ISR

// 2. 使用 CDN 缓存
export const dynamic = "force-static";

// 3. 部分预渲染 (PPR)
export const experimental_ppr = true;
```

#### 3.4.2 TTFB 较慢

```
请求 → 数据获取 (300ms) → 渲染 (200ms) → 返回
TTFB = 500ms

vs

静态文件:
TTFB = 10ms

差距明显!
```

---

## 4. Next.js 混合渲染策略

### 4.1 页面级别选择

```tsx
// CSR - 客户端渲染
"use client";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return <div>{data?.title}</div>;
}

// SSR - 服务端渲染
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// SSG - 静态生成
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

### 4.2 组件级别混合

```tsx
// Server Component (默认)
export default async function Page() {
  const data = await fetchData();

  return (
    <div>
      <h1>{data.title}</h1>

      {/* Server Component */}
      <StaticContent data={data} />

      {/* Client Component */}
      <InteractiveWidget />
    </div>
  );
}

// StaticContent.tsx - Server Component
export default function StaticContent({ data }) {
  return <div>{data.content}</div>;
}

// InteractiveWidget.tsx - Client Component
("use client");

export default function InteractiveWidget() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>;
}
```

### 4.3 部分预渲染 (PPR)

```tsx
// 最佳实践: PPR
export const experimental_ppr = true;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <div>
      {/* 静态部分 - 构建时渲染 */}
      <ProductInfo product={product} />

      {/* 动态部分 - 请求时渲染 */}
      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPrice productId={product.id} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <UserReviews productId={product.id} />
      </Suspense>
    </div>
  );
}
```

---

## 5. 性能优化策略

### 5.1 CSR 优化

```tsx
// 1. 代码分割
const Dashboard = lazy(() => import('./Dashboard'));

// 2. 预加载
<link rel="preload" href="/critical.js" as="script">

// 3. 骨架屏
export default function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  );
}

// 4. 缓存
import useSWR from 'swr';

export default function Profile() {
  const { data } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: false
  });
}
```

### 5.2 SSR 优化

```tsx
// 1. 并行数据获取
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);

// 2. Streaming SSR
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>;

// 3. 缓存
export const revalidate = 60;

// 4. Edge Runtime
export const runtime = "edge";
```

---

## 6. 选择指南

### 6.1 决策树

```
需要 SEO?
  ├─ 是 → SSR 或 SSG
  └─ 否 → CSR

实时数据?
  ├─ 是 → SSR
  └─ 否 → SSG 或 ISR

用户交互多?
  ├─ 是 → CSR 或 混合
  └─ 否 → SSG

服务器资源?
  ├─ 充足 → SSR
  └─ 有限 → SSG 或 CSR

最佳实践: PPR (混合静态和动态)
```

### 6.2 适用场景

**CSR 适用于**:

- 后台管理系统
- 数据可视化
- 复杂交互应用
- 不需要 SEO 的应用

**SSR 适用于**:

- 新闻网站
- 电商产品页
- 社交媒体
- 需要实时数据的页面

**混合渲染 (PPR)**:

- 电商首页
- 产品详情页
- 新闻首页
- 大多数现代 Web 应用

---

## 7. 常见问题 (FAQ)

**Q1: CSR 和 SSR 如何选择?**

A: 决策标准:

```
SEO 重要 → SSR
性能要求高 → SSG 或 PPR
交互密集 → CSR
混合场景 → PPR
```

**Q2: 水合是什么?**

A: 将静态 HTML 转换为可交互 React 应用的过程。

**Q3: 如何优化 CSR 首屏?**

A: 代码分割、预加载、骨架屏、缓存。

**Q4: 如何优化 SSR 性能?**

A: 并行数据获取、Streaming、缓存、Edge Runtime。

**Q5: 什么是 PPR?**

A: 部分预渲染,结合静态和动态渲染的优势。

---

## 8. 总结

### 8.1 核心要点

**CSR**:

- 前后端分离
- 静态部署
- SEO 差
- 首屏慢

**SSR**:

- SEO 友好
- 首屏快
- 服务器负载高
- TTFB 较慢

**最佳实践**:

- 使用 Next.js PPR
- 混合渲染策略
- 性能优化
- 监控指标

祝你在 Next.js 的学习和开发中取得成功!

---

**闲鱼号**: xy769003723321
**店铺名称**: 高质量 IT 资源铺
**个人整理 禁止倒卖**

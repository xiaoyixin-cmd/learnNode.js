**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 01-09-服务端组件(Server Components)详解

## 概述

### 什么是服务端组件

服务端组件 (Server Components) 是 React 18 引入、Next.js 13+ 深度集成的革命性特性。它允许组件在服务器上渲染,生成 HTML 和一种特殊的数据格式 (RSC Payload),然后流式传输到客户端。这种架构从根本上改变了 React 应用的构建方式,将数据获取、计算密集型任务和敏感逻辑移到服务器,大幅减少客户端 JavaScript 体积。

在 Next.js 16 中,**所有组件默认都是服务端组件**,除非显式标记为客户端组件 (`'use client'`)。这是一个重大的架构转变,体现了"服务端优先"的设计理念。

### 服务端组件的核心价值

**1. 性能提升**

- 减少客户端 JavaScript 包大小 (40-60%)
- 更快的首屏渲染 (TTFB 提升 50%)
- 更好的 Core Web Vitals 指标
- 流式渲染提升感知性能

**2. 数据获取优化**

- 直接访问后端资源 (数据库、文件系统)
- 减少客户端-服务器往返次数
- 并行数据获取
- 更接近数据源

**3. 安全性增强**

- API 密钥和敏感数据留在服务器
- 减少客户端攻击面
- 安全的数据库查询
- 服务器端认证和授权

**4. 代码组织优化**

- 服务端和客户端代码自然分离
- 更清晰的架构边界
- 更好的代码复用
- 简化的依赖管理

### 服务端组件 vs 传统 SSR

| 特性       | 传统 SSR (Pages Router) | 服务端组件 (App Router) |
| ---------- | ----------------------- | ----------------------- |
| 渲染位置   | 服务器 → 客户端水合     | 服务器 (无需水合)       |
| JavaScript | 全部发送到客户端        | 仅客户端组件发送        |
| 数据获取   | `getServerSideProps`    | 组件内 `async/await`    |
| 组件树     | 完整树水合              | 选择性水合              |
| 性能       | 较重的客户端包          | 轻量级客户端            |
| 交互性     | 需等待完整水合          | 渐进式增强              |

---

## 第一部分:服务端组件基础

### 1.1 服务端组件语法

#### 基础服务端组件

```typescript
// app/page.tsx - 默认是服务端组件
export default function HomePage() {
  return (
    <div>
      <h1>欢迎</h1>
      <p>这是一个服务端组件</p>
    </div>
  );
}
```

**关键点**:

- 无需任何特殊标记
- 默认在服务器渲染
- 不能使用客户端 API (useState, useEffect 等)

#### 异步服务端组件

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 3600 }, // ISR: 每小时重新验证
  });

  if (!res.ok) {
    throw new Error("获取文章失败");
  }

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts(); // 直接 await

  return (
    <div>
      <h1>文章列表</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

**优势**:

- 组件本身可以是异步的
- 无需 `useEffect` 获取数据
- 自动处理加载和错误状态 (配合 loading.tsx 和 error.tsx)

#### 数据库访问

```typescript
// app/users/page.tsx
import { db } from "@/lib/db";

async function getUsers() {
  return await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**安全性**:

- 数据库凭证不暴露给客户端
- SQL 注入防护在服务端处理
- 敏感数据不发送到客户端

### 1.2 服务端组件的限制

服务端组件**不能**使用以下功能:

#### 禁止使用客户端 Hooks

```typescript
// ❌ 错误:服务端组件不能使用 useState
import { useState } from "react";

export default function ServerComponent() {
  const [count, setCount] = useState(0); // 错误!

  return <div>{count}</div>;
}

// ✅ 正确:提取为客户端组件
// components/Counter.tsx
("use client");

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

// app/page.tsx
import Counter from "@/components/Counter";

export default function Page() {
  return (
    <div>
      <h1>服务端页面</h1>
      <Counter /> {/* 客户端组件 */}
    </div>
  );
}
```

#### 禁止使用浏览器 API

```typescript
// ❌ 错误:服务端组件不能访问 window
export default function ServerComponent() {
  const width = window.innerWidth; // 错误! window 不存在

  return <div>宽度: {width}</div>;
}

// ✅ 正确:使用客户端组件
("use client");

import { useState, useEffect } from "react";

export default function WindowSize() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div>窗口宽度: {width}px</div>;
}
```

#### 禁止使用事件处理器

```typescript
// ❌ 错误:服务端组件不能有事件处理器
export default function ServerComponent() {
  const handleClick = () => {
    console.log("点击"); // 错误!
  };

  return <button onClick={handleClick}>点击我</button>;
}

// ✅ 正确:使用客户端组件
("use client");

export default function ClickableButton() {
  const handleClick = () => {
    console.log("点击");
  };

  return <button onClick={handleClick}>点击我</button>;
}
```

### 1.3 服务端组件的优势

#### 减少 JavaScript 包大小

```typescript
// app/page.tsx - 服务端组件
import { marked } from "marked"; // 大型库 (50KB)
import hljs from "highlight.js"; // 大型库 (100KB)

async function getPost() {
  const res = await fetch("https://api.example.com/post/1");
  return res.json();
}

export default async function PostPage() {
  const post = await getPost();

  // marked 和 hljs 仅在服务器执行,不发送到客户端
  const html = marked(post.content);
  const highlighted = hljs.highlightAuto(post.code).value;

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
    </article>
  );
}
```

**性能提升**:

- `marked` + `hljs` 共 150KB 不发送到客户端
- 客户端 JavaScript 减少 ~150KB
- 更快的首屏渲染

#### 直接访问后端资源

```typescript
// app/dashboard/page.tsx
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

async function getDashboardData(userId: string) {
  // 1. 数据库查询
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { posts: true, comments: true },
  });

  // 2. 文件系统访问
  const configPath = path.join(process.cwd(), "config", `user-${userId}.json`);
  const config = await fs.readFile(configPath, "utf-8");

  // 3. 第三方 API 调用
  const analytics = await fetch(
    `https://analytics.example.com/user/${userId}`,
    {
      headers: { Authorization: `Bearer ${process.env.ANALYTICS_API_KEY}` },
    }
  ).then((res) => res.json());

  return { user, config: JSON.parse(config), analytics };
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div>
      <h1>欢迎, {data.user.name}</h1>
      <UserStats analytics={data.analytics} />
      <PostsList posts={data.user.posts} />
    </div>
  );
}
```

**安全性**:

- 数据库凭证不暴露
- API 密钥保密
- 文件系统访问受限

#### 并行数据获取

```typescript
// app/profile/[id]/page.tsx
interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

async function getUserPosts(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}/posts`);
  return res.json();
}

async function getUserFollowers(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}/followers`);
  return res.json();
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  // 并行获取数据
  const [user, posts, followers] = await Promise.all([
    getUser(id),
    getUserPosts(id),
    getUserFollowers(id),
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <FollowersList followers={followers} />
    </div>
  );
}
```

**性能优化**:

- 3 个请求并行执行
- 总时间 = 最慢请求的时间
- 避免瀑布式请求

---

## 第二部分:数据获取模式

### 2.1 Fetch API 扩展

Next.js 扩展了原生 `fetch` API,增加了缓存和重新验证功能。

#### 默认缓存 (force-cache)

```typescript
// app/static/page.tsx
async function getStaticData() {
  const res = await fetch("https://api.example.com/data"); // 默认缓存
  return res.json();
}

export default async function StaticPage() {
  const data = await getStaticData();

  return <div>{JSON.stringify(data)}</div>;
}
```

**行为**:

- 数据在构建时获取
- 结果永久缓存
- 类似 Pages Router 的 `getStaticProps`

#### 不缓存 (no-store)

```typescript
// app/dynamic/page.tsx
async function getDynamicData() {
  const res = await fetch("https://api.example.com/data", {
    cache: "no-store", // 禁用缓存
  });
  return res.json();
}

export default async function DynamicPage() {
  const data = await getDynamicData();

  return <div>实时数据: {JSON.stringify(data)}</div>;
}
```

**行为**:

- 每次请求都重新获取
- 类似 Pages Router 的 `getServerSideProps`

#### 定时重新验证 (ISR)

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 }, // 每60秒重新验证
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return <PostsList posts={posts} />;
}
```

**行为**:

- 初始请求缓存结果
- 60 秒后首次访问触发重新验证
- 后台更新缓存

#### 标签重新验证

```typescript
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { tags: ['products'] }, // 标记缓存
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductGrid products={products} />;
}

// app/actions.ts - Server Action
'use server';

import { revalidateTag } from 'next/cache';

export async function updateProduct() {
  // 更新产品逻辑
  await db.product.update(...);

  // 重新验证缓存
  revalidateTag('products');
}
```

**优势**:

- 按需重新验证
- 精确控制缓存失效
- 支持多个标签

### 2.2 数据库直接访问

```typescript
// app/users/page.tsx
import { db } from "@/lib/db";

// 使用 Prisma
async function getUsers() {
  return await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1>用户列表</h1>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>邮箱</th>
            <th>文章数</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user._count.posts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**优势**:

- 类型安全的查询
- 自动生成的类型定义
- 优化的 SQL 查询

### 2.3 流式渲染

使用 Suspense 实现渐进式渲染。

#### 基础流式渲染

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

async function SlowData() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return <div>慢速数据已加载</div>;
}

async function FastData() {
  return <div>快速数据</div>;
}

export default function DashboardPage() {
  return (
    <div>
      <h1>仪表板</h1>

      {/* 快速数据立即显示 */}
      <FastData />

      {/* 慢速数据流式加载 */}
      <Suspense fallback={<div>加载慢速数据...</div>}>
        <SlowData />
      </Suspense>
    </div>
  );
}
```

**优势**:

- 快速内容立即可见
- 慢速内容不阻塞页面
- 更好的用户体验

#### 并行流式渲染

```typescript
// app/profile/page.tsx
import { Suspense } from "react";

async function UserInfo() {
  const user = await fetchUser();
  return <div>用户: {user.name}</div>;
}

async function UserPosts() {
  const posts = await fetchPosts();
  return <div>文章: {posts.length}</div>;
}

async function UserFollowers() {
  const followers = await fetchFollowers();
  return <div>粉丝: {followers.length}</div>;
}

export default function ProfilePage() {
  return (
    <div>
      {/* 三个组件并行加载,独立显示 */}
      <Suspense fallback={<div>加载用户...</div>}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<div>加载文章...</div>}>
        <UserPosts />
      </Suspense>

      <Suspense fallback={<div>加载粉丝...</div>}>
        <UserFollowers />
      </Suspense>
    </div>
  );
}
```

---

## 第三部分:高级模式

### 3.1 组件组合模式

#### 服务端组件包含客户端组件

```typescript
// app/page.tsx - 服务端组件
import ClientCounter from "@/components/ClientCounter";

async function getInitialCount() {
  const res = await fetch("https://api.example.com/count");
  return res.json();
}

export default async function Page() {
  const { count } = await getInitialCount();

  return (
    <div>
      <h1>服务端页面</h1>
      {/* 服务端数据传递给客户端组件 */}
      <ClientCounter initialCount={count} />
    </div>
  );
}

// components/ClientCounter.tsx - 客户端组件
("use client");

import { useState } from "react";

export default function ClientCounter({
  initialCount,
}: {
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

**模式**:

- 服务端组件获取数据
- 通过 props 传递给客户端组件
- 客户端组件处理交互

#### Children 作为插槽

```typescript
// app/layout.tsx - 服务端布局
import ClientSidebar from "@/components/ClientSidebar";

async function getNavigation() {
  const res = await fetch("https://api.example.com/navigation");
  return res.json();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = await getNavigation();

  return (
    <html>
      <body>
        {/* 客户端组件接收服务端组件作为 children */}
        <ClientSidebar navigation={navigation}>{children}</ClientSidebar>
      </body>
    </html>
  );
}

// components/ClientSidebar.tsx
("use client");

export default function ClientSidebar({
  children,
  navigation,
}: {
  children: React.ReactNode;
  navigation: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <aside className={isOpen ? "open" : "closed"}>
        {navigation.map((item) => (
          <a key={item.id} href={item.url}>
            {item.title}
          </a>
        ))}
      </aside>

      <main>{children}</main>
    </div>
  );
}
```

**优势**:

- children 保持为服务端组件
- 避免不必要的客户端化
- 更好的性能

### 3.2 缓存策略

#### 组件级缓存

```typescript
// lib/cache.ts
import { unstable_cache } from "next/cache";

export const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.user.findUnique({ where: { id } });
  },
  ["user"], // 缓存键
  {
    revalidate: 3600, // 1小时
    tags: ["users"],
  }
);

// app/users/[id]/page.tsx
import { getCachedUser } from "@/lib/cache";

export default async function UserPage({ params }) {
  const { id } = await params;
  const user = await getCachedUser(id);

  return <UserProfile user={user} />;
}
```

#### 请求级去重

```typescript
// lib/data.ts
async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`);
  return res.json();
}

// app/posts/[id]/page.tsx
export default async function PostPage({ params }) {
  const { id } = await params;

  // 多次调用只会发起一次请求
  const post1 = await getPost(id);
  const post2 = await getPost(id); // 使用缓存结果

  return <article>{post1.title}</article>;
}
```

### 3.3 错误处理

#### Try-Catch 处理

```typescript
// app/posts/page.tsx
async function getPosts() {
  try {
    const res = await fetch("https://api.example.com/posts");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("获取文章失败:", error);
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return <div>暂无文章</div>;
  }

  return <PostsList posts={posts} />;
}
```

#### 错误边界

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts");

  if (!res.ok) {
    throw new Error("获取文章失败");
  }

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts(); // 错误会被 error.tsx 捕获

  return <PostsList posts={posts} />;
}

// app/posts/error.tsx
("use client");

export default function PostsError({ error, reset }) {
  return (
    <div>
      <h2>文章加载失败</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

---

## 第四部分:实战应用

### 4.1 博客系统

```typescript
// app/blog/page.tsx
import { db } from "@/lib/db";

async function getPosts() {
  return await db.post.findMany({
    where: { published: true },
    include: {
      author: { select: { name: true, avatar: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="blog-page">
      <h1>博客文章</h1>

      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <h2>
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h2>

            <div className="post-meta">
              <img src={post.author.avatar} alt={post.author.name} />
              <span>{post.author.name}</span>
              <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
            </div>

            <p>{post.excerpt}</p>

            <div className="post-footer">
              <span>{post._count.comments} 条评论</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { marked } from "marked";

async function getPost(slug: string) {
  return await db.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const html = marked(post.content);

  return (
    <article>
      <h1>{post.title}</h1>

      <div className="author-info">
        <img src={post.author.avatar} alt={post.author.name} />
        <div>
          <p>{post.author.name}</p>
          <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
        </div>
      </div>

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <section className="comments">
        <h2>评论 ({post.comments.length})</h2>
        {post.comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p>
              <strong>{comment.author.name}</strong>
            </p>
            <p>{comment.content}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
```

### 4.2 电商产品页

```typescript
// app/products/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

async function getProduct(id: string) {
  return await db.product.findUnique({
    where: { id },
    include: {
      variants: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });
}

async function getRelatedProducts(categoryId: string) {
  return await db.product.findMany({
    where: { categoryId },
    take: 4,
  });
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  const [product, relatedProducts] = await Promise.all([
    getProduct(id),
    getRelatedProducts(product.categoryId),
  ]);

  if (!product) {
    notFound();
  }

  const averageRating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) /
    product.reviews.length;

  return (
    <div className="product-page">
      <div className="product-main">
        <div className="product-images">
          {product.images.map((image, i) => (
            <img key={i} src={image} alt={product.name} />
          ))}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>

          <div className="rating">
            ⭐ {averageRating.toFixed(1)} ({product._count.reviews} 评价)
          </div>

          <p className="price">¥{product.price}</p>

          <p className="description">{product.description}</p>

          <div className="variants">
            <h3>选择规格</h3>
            {product.variants.map((variant) => (
              <button key={variant.id} className="variant-option">
                {variant.name}
              </button>
            ))}
          </div>

          <AddToCartButton productId={id} />
        </div>
      </div>

      <section className="reviews">
        <h2>用户评价</h2>
        {product.reviews.map((review) => (
          <div key={review.id} className="review">
            <div className="review-header">
              <span>{review.user.name}</span>
              <span>{"⭐".repeat(review.rating)}</span>
            </div>
            <p>{review.content}</p>
          </div>
        ))}
      </section>

      <section className="related-products">
        <h2>相关产品</h2>
        <div className="products-grid">
          {relatedProducts.map((p) => (
            <a key={p.id} href={`/products/${p.id}`} className="product-card">
              <img src={p.images[0]} alt={p.name} />
              <h3>{p.name}</h3>
              <p>¥{p.price}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### 4.3 仪表板应用

```typescript
// app/dashboard/page.tsx
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Suspense } from "react";

async function getStats(userId: string) {
  const [posts, views, comments] = await Promise.all([
    db.post.count({ where: { authorId: userId } }),
    db.view.count({ where: { post: { authorId: userId } } }),
    db.comment.count({ where: { post: { authorId: userId } } }),
  ]);

  return { posts, views, comments };
}

async function getRecentPosts(userId: string) {
  return await db.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: { select: { comments: true, views: true } },
    },
  });
}

async function DashboardStats({ userId }: { userId: string }) {
  const stats = await getStats(userId);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>总文章</h3>
        <p className="stat-value">{stats.posts}</p>
      </div>

      <div className="stat-card">
        <h3>总浏览</h3>
        <p className="stat-value">{stats.views}</p>
      </div>

      <div className="stat-card">
        <h3>总评论</h3>
        <p className="stat-value">{stats.comments}</p>
      </div>
    </div>
  );
}

async function RecentPosts({ userId }: { userId: string }) {
  const posts = await getRecentPosts(userId);

  return (
    <div className="recent-posts">
      <h2>最近文章</h2>
      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <h3>{post.title}</h3>
          <div className="post-stats">
            <span>{post._count.views} 浏览</span>
            <span>{post._count.comments} 评论</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard">
      <h1>欢迎, {session.user.name}</h1>

      <Suspense fallback={<div>加载统计...</div>}>
        <DashboardStats userId={session.user.id} />
      </Suspense>

      <Suspense fallback={<div>加载文章...</div>}>
        <RecentPosts userId={session.user.id} />
      </Suspense>
    </div>
  );
}
```

---

## 适用场景

### 何时使用服务端组件

**1. 数据获取密集**

- 博客文章列表
- 产品目录
- 用户档案

**2. SEO 优先**

- 营销页面
- 产品展示
- 新闻文章

**3. 安全敏感**

- API 密钥使用
- 数据库查询
- 认证检查

**4. 大型依赖**

- Markdown 解析
- 代码高亮
- 图像处理

### 何时避免服务端组件

**1. 需要交互**

- 表单输入
- 按钮点击
- 状态管理

**2. 浏览器 API**

- localStorage
- window 对象
- 地理位置

**3. 实时更新**

- WebSocket
- 轮询
- SSE

---

## 注意事项

### 1. 不能使用客户端 API

```typescript
// ❌ 错误
export default function ServerComponent() {
  const [state, setState] = useState(0); // 错误!
  useEffect(() => {}, []); // 错误!

  return <div onClick={() => {}}></div>; // 错误!
}
```

### 2. Props 必须可序列化

```typescript
// ❌ 错误:不能传递函数
<ClientComponent onClick={() => {}} /> // 错误!

// ✅ 正确:客户端组件内部定义函数
```

### 3. 异步组件只能在服务端

```typescript
// ✅ 服务端组件可以异步
export default async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ❌ 客户端组件不能异步
("use client");

export default async function ClientComponent() {
  // 错误!
  return <div></div>;
}
```

---

## 常见问题

### Q1: 服务端组件在哪里执行?

**答**: 在构建时(静态渲染)或请求时(动态渲染)在 Node.js 服务器上执行。

### Q2: 服务端组件的 JavaScript 发送到客户端吗?

**答**: 不发送。只发送渲染结果(HTML)和 RSC Payload。

### Q3: 如何在服务端组件中使用 localStorage?

**答**: 不能直接使用。需要提取为客户端组件。

### Q4: 服务端组件可以导入客户端组件吗?

**答**: 可以。服务端组件可以导入并渲染客户端组件。

### Q5: 如何在服务端组件中获取用户输入?

**答**: 使用 Server Actions 或将表单提取为客户端组件。

---

## 总结

### 核心要点

1. **默认服务端**: Next.js 16 中所有组件默认是服务端组件
2. **异步支持**: 组件可以是 async 函数
3. **直接数据访问**: 可以直接访问数据库、文件系统
4. **性能优势**: 减少客户端 JavaScript,提升性能
5. **安全性**: API 密钥和敏感逻辑留在服务器
6. **流式渲染**: 配合 Suspense 实现渐进式渲染

### 最佳实践

1. **默认使用服务端组件**
2. **仅在需要交互时使用客户端组件**
3. **利用并行数据获取**
4. **合理使用缓存策略**
5. **配合 Suspense 优化加载体验**

服务端组件是 Next.js 16 的核心特性,掌握它是构建现代高性能 Web 应用的关键。

---

**下一篇**: [01-10-客户端组件详解](./01-10-客户端组件Client%20Components详解.md)将详细介绍客户端组件的使用和最佳实践。

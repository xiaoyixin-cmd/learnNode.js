**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 服务端渲染(SSR) vs 静态生成(SSG)

## 1. 概述 (Overview)

### 1.1 渲染模式对比

#### 1.1.1 核心定义

**服务端渲染 (SSR - Server-Side Rendering)**:

定义:每次请求时,在服务器上动态生成 HTML。

特点:

- 每次请求都执行渲染
- 总是返回最新数据
- 响应时间取决于数据获取速度
- 服务器负载较高

**静态生成 (SSG - Static Site Generation)**:

定义:在构建时预先生成 HTML,运行时直接返回静态文件。

特点:

- 构建时执行一次
- 运行时极快
- 数据在构建时确定
- 服务器负载极低

#### 1.1.2 工作流程对比

**SSR 流程**:

```
用户请求
  ↓
服务器接收请求
  ↓
执行数据获取
  ↓
渲染 React 组件
  ↓
生成 HTML
  ↓
返回给客户端
  ↓
客户端水合
  ↓
可交互

每次请求重复此过程
```

**SSG 流程**:

```
构建时:
  数据获取
    ↓
  渲染 React 组件
    ↓
  生成 HTML
    ↓
  保存到磁盘

运行时:
  用户请求
    ↓
  读取静态 HTML
    ↓
  返回给客户端
    ↓
  客户端水合
    ↓
  可交互

极快!
```

#### 1.1.3 性能对比

| 指标       | SSR                 | SSG                     |
| ---------- | ------------------- | ----------------------- |
| TTFB       | 慢 (取决于数据获取) | 极快 (直接返回静态文件) |
| FCP        | 中等                | 极快                    |
| LCP        | 中等                | 极快                    |
| TTI        | 快                  | 极快                    |
| 服务器负载 | 高                  | 极低                    |
| CDN 缓存   | 困难                | 容易                    |
| 数据新鲜度 | 总是最新            | 构建时确定              |
| 适用场景   | 动态内容            | 静态内容                |

实际测试数据:

```
SSR (动态内容):
  TTFB: 300-1000ms
  FCP: 500-1500ms
  LCP: 1000-3000ms

SSG (静态内容):
  TTFB: 10-50ms
  FCP: 100-300ms
  LCP: 300-800ms

性能差异: SSG 比 SSR 快 10-20 倍!
```

### 1.2 Next.js 中的实现

#### 1.2.1 SSR 实现

```tsx
// app/products/page.tsx

// 强制动态渲染
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  // 每次请求都执行
  const products = await fetch("https://api.example.com/products", {
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <div>
      <h1>产品列表</h1>
      <p>最后更新: {new Date().toLocaleString()}</p>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### 1.2.2 SSG 实现

```tsx
// app/blog/[slug]/page.tsx

// 静态生成
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json()
  );

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then((r) =>
    r.json()
  );

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 2. 服务端渲染 (SSR) 详解

### 2.1 SSR 工作原理

#### 2.1.1 渲染流程

```
1. 请求到达服务器
   ↓
2. 中间件执行 (如有)
   ↓
3. 路由匹配
   ↓
4. Server Component 执行
   ↓
5. 数据获取
   ↓
6. React 渲染组件树
   ↓
7. 生成 HTML 字符串
   ↓
8. 返回 HTML 给客户端
   ↓
9. 客户端接收 HTML
   ↓
10. 加载 JavaScript
   ↓
11. React 水合
   ↓
12. 应用可交互
```

#### 2.1.2 数据获取

```tsx
// Server Component 中直接获取数据
export default async function ProductPage({ params }) {
  const { id } = await params;

  // 服务器端执行
  const product = await fetch(`https://api.example.com/products/${id}`, {
    cache: "no-store", // 不缓存,总是获取最新数据
  }).then((r) => r.json());

  return (
    <div>
      <h1>{product.name}</h1>
      <p>价格: ¥{product.price}</p>
      <p>库存: {product.stock}</p>
      <p>更新时间: {new Date().toLocaleString()}</p>
    </div>
  );
}
```

#### 2.1.3 性能特征

**优势**:

- 总是最新数据
- SEO 友好
- 首屏内容完整

**劣势**:

- TTFB 较慢
- 服务器负载高
- 扩展性受限

性能瓶颈:

```tsx
export default async function Page() {
  // ❌ 串行: 总耗时 1500ms
  const user = await fetchUser(); // 500ms
  const posts = await fetchPosts(); // 600ms
  const comments = await fetchComments(); // 400ms

  return <Dashboard user={user} posts={posts} comments={comments} />;
}

// ✅ 并行: 总耗时 600ms
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(), // 500ms
    fetchPosts(), // 600ms (最慢)
    fetchComments(), // 400ms
  ]);

  return <Dashboard user={user} posts={posts} comments={comments} />;
}
```

### 2.2 SSR 配置

#### 2.2.1 强制动态渲染

```tsx
// app/dashboard/page.tsx

// 方法 1: 路由段配置
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getData();
  return <div>{data.title}</div>;
}

// 方法 2: fetch with no-store
export default async function DashboardPage() {
  const data = await fetch("https://api.example.com/data", {
    cache: "no-store",
  }).then((r) => r.json());

  return <div>{data.title}</div>;
}

// 方法 3: 使用动态函数
import { cookies, headers } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headersList = await headers();

  // 使用动态函数会自动切换到动态渲染
  const data = await getData();
  return <div>{data.title}</div>;
}
```

#### 2.2.2 运行时配置

```tsx
// app/api/route.ts

// 使用 Edge Runtime (更快)
export const runtime = "edge";

export async function GET(request: Request) {
  const data = await fetch("https://api.example.com/data").then((r) =>
    r.json()
  );
  return Response.json(data);
}

// 使用 Node.js Runtime (更多功能)
export const runtime = "nodejs";

export async function GET(request: Request) {
  const data = await heavyComputation();
  return Response.json(data);
}
```

### 2.3 Streaming SSR

#### 2.3.1 Suspense 启用流式渲染

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>仪表盘</h1>

      {/* 立即显示静态内容 */}
      <QuickStats />

      {/* 流式加载动态内容 */}
      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

async function Chart() {
  await delay(2000);
  const data = await getChartData();
  return <ChartComponent data={data} />;
}

async function RecentOrders() {
  await delay(1500);
  const orders = await getOrders();
  return <OrdersTable orders={orders} />;
}
```

HTML 流式传输:

```html
<!-- Chunk 1: 立即发送 -->
<!DOCTYPE html>
<html>
  <body>
    <h1>仪表盘</h1>
    <div>Quick Stats...</div>
    <div id="chart-suspense">Loading chart...</div>
    <div id="orders-suspense">Loading orders...</div>

    <!-- Chunk 2: 1.5秒后发送 -->
    <template id="orders-template">
      <table>
        ...
      </table>
    </template>
    <script>
      document
        .getElementById("orders-suspense")
        .replaceWith(document.getElementById("orders-template").content);
    </script>

    <!-- Chunk 3: 2秒后发送 -->
    <template id="chart-template">
      <svg>...</svg>
    </template>
    <script>
      document
        .getElementById("chart-suspense")
        .replaceWith(document.getElementById("chart-template").content);
    </script>
  </body>
</html>
```

性能提升:

```
传统 SSR:
  等待所有数据 (2秒) → 发送 HTML
  TTFB: 2000ms
  用户等待: 2秒白屏

Streaming SSR:
  立即发送 shell (100ms) → 逐步发送内容
  TTFB: 100ms
  用户等待: 几乎无白屏

性能提升: TTFB 降低 95%!
```

#### 2.3.2 loading.tsx 文件

Next.js 的 Suspense 语法糖:

```
app/dashboard/
├── layout.tsx
├── page.tsx
└── loading.tsx  ← 自动包裹 Suspense
```

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// 自动转换为:
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>;
```

---

## 3. 静态生成 (SSG) 详解

### 3.1 SSG 工作原理

#### 3.1.1 构建时生成

```
npm run build 执行时:

1. 扫描所有页面路由
   ↓
2. 调用 generateStaticParams (如有)
   ↓
3. 为每个路由执行数据获取
   ↓
4. 渲染 React 组件
   ↓
5. 生成 HTML + RSC Payload
   ↓
6. 保存到 .next/server/app/ 目录
   ↓
7. 生成元数据文件

运行时:
  请求 → 读取静态文件 → 返回
  极快!
```

#### 3.1.2 generateStaticParams

```tsx
// app/blog/[slug]/page.tsx

// 生成静态路径
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) =>
    r.json()
  );

  // 返回所有要预生成的路径
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then((r) =>
    r.json()
  );

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// 构建时生成:
// /blog/post-1
// /blog/post-2
// /blog/post-3
// ...
```

嵌套动态路由:

```tsx
// app/blog/[category]/[slug]/page.tsx

export async function generateStaticParams() {
  const categories = await getCategories();

  const paths = [];

  for (const category of categories) {
    const posts = await getPostsByCategory(category.id);

    posts.forEach((post) => {
      paths.push({
        category: category.slug,
        slug: post.slug,
      });
    });
  }

  return paths;
}

export default async function Post({ params }) {
  const { category, slug } = await params;
  const post = await getPost(category, slug);

  return <article>{post.title}</article>;
}
```

#### 3.1.3 性能特征

**优势**:

- 极快的响应速度
- 服务器负载极低
- 易于 CDN 缓存
- 无限扩展性

**劣势**:

- 数据不是最新
- 构建时间长 (大量页面)
- 更新需要重新构建

性能对比:

```
SSG:
  TTFB: 10-50ms
  FCP: 100-300ms
  LCP: 300-800ms
  服务器 CPU: 几乎为 0

SSR:
  TTFB: 300-1000ms
  FCP: 500-1500ms
  LCP: 1000-3000ms
  服务器 CPU: 高

SSG 比 SSR 快 10-20 倍!
```

### 3.2 增量静态再生 (ISR)

#### 3.2.1 ISR 概念

定义:结合 SSG 和 SSR 的混合策略,在后台增量更新静态页面。

工作原理:

```
首次请求:
  读取缓存的静态 HTML → 返回给用户
  ↓
后台:
  检查是否过期 → 重新生成 → 更新缓存

后续请求:
  读取更新后的 HTML → 返回给用户
```

#### 3.2.2 配置 ISR

```tsx
// app/products/[id]/page.tsx

// 60秒后重新验证
export const revalidate = 60;

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await fetch(`https://api.example.com/products/${id}`).then(
    (r) => r.json()
  );

  return (
    <div>
      <h1>{product.name}</h1>
      <p>价格: ¥{product.price}</p>
      <p>库存: {product.stock}</p>
    </div>
  );
}

// 流程:
// 1. 首次请求: 返回缓存 (构建时生成)
// 2. 60秒后: 下次请求触发后台重新生成
// 3. 用户仍然看到旧内容 (不影响响应速度)
// 4. 后台生成完成后,缓存更新
// 5. 再次请求: 返回新内容
```

按需重新验证:

```tsx
// app/actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

// 路径重新验证
export async function updateProduct(id: string, data: any) {
  await db.product.update({ where: { id }, data });

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
}

// 标签重新验证
export async function createPost(data: any) {
  await db.post.create({ data });

  revalidateTag("posts");
}
```

标签缓存:

```tsx
// app/blog/page.tsx

export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  }).then((r) => r.json());

  return <PostList posts={posts} />;
}

// 精确失效
("use server");

export async function publishPost(data: any) {
  await db.post.create({ data });
  revalidateTag("posts"); // 仅失效带有 'posts' 标签的缓存
}
```

### 3.3 部分预渲染 (PPR - Next.js 16)

#### 3.3.1 PPR 概念

定义:结合静态和动态渲染,静态部分在构建时生成,动态部分在请求时生成。

最佳用户体验!

#### 3.3.2 启用 PPR

```tsx
// next.config.js
module.exports = {
  experimental: {
    ppr: true,
  },
};

// app/products/page.tsx
export const experimental_ppr = true;

export default async function ProductsPage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* 静态部分 - 构建时渲染 */}
      <Header />
      <FeaturedProducts products={featuredProducts} />

      {/* 动态部分 - 请求时渲染 */}
      <Suspense fallback={<PersonalizedSkeleton />}>
        <PersonalizedRecommendations />
      </Suspense>
    </div>
  );
}

async function PersonalizedRecommendations() {
  const user = await getUser();
  const recommendations = await getRecommendations(user.id);

  return <RecommendationsList products={recommendations} />;
}
```

渲染流程:

```
构建时:
  Header → 静态 HTML
  FeaturedProducts → 静态 HTML
  PersonalizedRecommendations → 占位符

运行时:
  请求 → 立即返回静态 HTML + 占位符
  ↓
  后台生成个性化推荐
  ↓
  流式传输到客户端
  ↓
  替换占位符

用户体验: 瞬间看到内容 + 逐步显示个性化内容
```

性能提升:

```
传统 SSR:
  TTFB: 800ms
  用户等待: 800ms 白屏

PPR:
  TTFB: 50ms (静态部分)
  用户等待: 50ms (立即看到内容)
  个性化内容: 800ms 后逐步显示

性能提升: TTFB 降低 94%!
```

---

## 4. 选择指南 (Decision Guide)

### 4.1 决策树

```
内容更新频率?
  ├─ 很少变化 → SSG
  ├─ 定期变化 → ISR
  ├─ 实时变化 → SSR
  └─ 混合场景 → PPR

SEO 重要性?
  ├─ 非常重要 → SSG 或 ISR
  ├─ 一般重要 → SSR
  └─ 不重要 → CSR

性能要求?
  ├─ 极致性能 → SSG
  ├─ 高性能 → ISR 或 PPR
  └─ 一般性能 → SSR

用户个性化?
  ├─ 无个性化 → SSG
  ├─ 部分个性化 → PPR
  └─ 完全个性化 → SSR
```

### 4.2 适用场景

#### 4.2.1 SSG 适用场景

**理想场景**:

- 博客文章
- 营销页面
- 文档站点
- 产品详情页 (不常变)
- 帮助中心

**示例**:

```tsx
// 博客文章 - 完美的 SSG 用例
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.publishedAt}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

#### 4.2.2 ISR 适用场景

**理想场景**:

- 新闻网站
- 电商产品列表
- 用户资料页
- 社交媒体帖子
- 数据仪表盘

**示例**:

```tsx
// 产品列表 - ISR 每小时更新
export const revalidate = 3600;

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>产品列表</h1>
      <p>最后更新: {new Date().toLocaleString()}</p>
      <ProductGrid products={products} />
    </div>
  );
}
```

#### 4.2.3 SSR 适用场景

**理想场景**:

- 用户仪表盘
- 购物车
- 搜索结果
- 实时数据
- 个性化内容

**示例**:

```tsx
// 用户仪表盘 - SSR 每次最新数据
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getUser();
  const stats = await getUserStats(user.id);
  const activities = await getRecentActivities(user.id);

  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <Stats data={stats} />
      <Activities items={activities} />
    </div>
  );
}
```

#### 4.2.4 PPR 适用场景

**理想场景**:

- 电商首页 (静态 banner + 动态推荐)
- 新闻首页 (静态布局 + 动态内容)
- 产品页 (静态信息 + 动态库存/价格)

**示例**:

```tsx
// 电商首页 - PPR 最佳用户体验
export const experimental_ppr = true;

export default async function HomePage() {
  const featuredCategories = await getCategories();

  return (
    <div>
      {/* 静态部分 */}
      <Hero />
      <Categories categories={featuredCategories} />

      {/* 动态部分 */}
      <Suspense fallback={<ProductsSkeleton />}>
        <PersonalizedProducts />
      </Suspense>

      <Suspense fallback={<DealsSkeleton />}>
        <FlashDeals />
      </Suspense>
    </div>
  );
}
```

### 4.3 性能对比表

| 场景       | SSG        | ISR        | SSR        | PPR        |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| TTFB       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| 数据新鲜度 | ⭐         | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |
| 服务器负载 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐⭐   |
| SEO        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| CDN 缓存   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐         | ⭐⭐⭐⭐   |
| 构建时间   | ⭐⭐       | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     |
| 个性化     | ⭐         | ⭐         | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   |

---

## 5. 最佳实践 (Best Practices)

### 5.1 数据获取优化

#### 5.1.1 并行获取

```tsx
// ❌ 串行
export default async function Page() {
  const user = await fetchUser();
  const posts = await fetchPosts();
  const comments = await fetchComments();
}

// ✅ 并行
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments(),
  ]);
}
```

#### 5.1.2 预加载

```tsx
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});

export const preloadUser = (id: string) => {
  void getUser(id);
};

export default async function UserPage({ params }) {
  const { id } = await params;

  // 立即开始预加载
  preloadUser(id);
  preloadUserPosts(id);

  const user = await getUser(id);

  return <UserProfile user={user} />;
}
```

### 5.2 缓存策略

#### 5.2.1 合理使用缓存

```tsx
// 静态内容 - 永久缓存
const posts = await fetch("https://api.example.com/posts", {
  cache: "force-cache",
});

// 动态内容 - 不缓存
const user = await fetch("https://api.example.com/user", {
  cache: "no-store",
});

// 半动态内容 - 定时重新验证
const products = await fetch("https://api.example.com/products", {
  next: { revalidate: 3600 },
});
```

#### 5.2.2 标签化缓存

```tsx
// 数据获取
const posts = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts", "homepage"] },
});

// 精确失效
("use server");

export async function createPost(data: any) {
  await db.post.create({ data });
  revalidateTag("posts");
}
```

### 5.3 性能监控

#### 5.3.1 Web Vitals

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### 5.3.2 自定义监控

```tsx
export function reportWebVitals(metric) {
  const { name, value } = metric;

  switch (name) {
    case "TTFB":
      console.log(`TTFB: ${value}ms`);
      break;
    case "FCP":
      console.log(`FCP: ${value}ms`);
      break;
    case "LCP":
      console.log(`LCP: ${value}ms`);
      break;
  }

  analytics.track(name, value);
}
```

---

## 6. 常见问题 (FAQ)

**Q1: SSR 和 SSG 如何选择?**

A: 决策标准:

```
数据更新频率:
  - 很少变化 → SSG
  - 定期变化 → ISR
  - 实时变化 → SSR

性能要求:
  - 极致性能 → SSG
  - 高性能 → ISR
  - 一般性能 → SSR

个性化需求:
  - 无个性化 → SSG
  - 部分个性化 → PPR
  - 完全个性化 → SSR
```

**Q2: ISR 如何工作?**

A: ISR 流程:

```
首次请求:
  返回缓存的 HTML (构建时生成)

60秒后:
  下次请求触发后台重新生成
  用户仍然看到旧内容

后台生成完成:
  更新缓存

再次请求:
  返回新内容
```

**Q3: PPR 的优势是什么?**

A: PPR 结合了静态和动态的优势:

```
静态部分:
  - 极快的 TTFB
  - 立即显示内容
  - 易于 CDN 缓存

动态部分:
  - 实时数据
  - 个性化内容
  - 流式传输

用户体验: 最佳!
```

**Q4: 如何优化 SSR 性能?**

A: 优化策略:

1. 并行数据获取
2. 使用 Streaming SSR
3. 启用 PPR
4. 优化数据库查询
5. 使用缓存

**Q5: 何时使用动态渲染?**

A: 动态渲染适用于:

- 用户特定的内容
- 实时数据
- 搜索结果
- 购物车
- 用户仪表盘

---

## 7. 总结 (Summary)

### 7.1 核心要点

**渲染模式**:

- SSG - 构建时生成,极快
- ISR - SSG + 增量更新
- SSR - 请求时生成,最新
- PPR - 混合静态和动态

**选择标准**:

- 数据更新频率
- 性能要求
- 个性化需求
- SEO 重要性

**最佳实践**:

- 优先使用 SSG
- 需要更新用 ISR
- 必须实时用 SSR
- 混合场景用 PPR

祝你在 Next.js 的学习和开发中取得成功!

---


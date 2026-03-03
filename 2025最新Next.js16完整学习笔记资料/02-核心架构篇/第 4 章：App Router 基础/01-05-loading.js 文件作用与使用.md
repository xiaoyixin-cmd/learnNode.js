**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 01-05-loading.js 文件作用与使用

## 概述

### 什么是 loading.js

`loading.js` (或 `loading.tsx`) 是 Next.js App Router 中用于定义加载状态 UI 的特殊文件。它基于 React Suspense 机制,在页面或路由段加载时自动显示加载界面,提供即时反馈,显著提升用户体验。

在 Next.js 16 中,`loading.js` 与流式渲染 (Streaming) 深度集成,支持渐进式内容展示,让用户在等待数据时看到有意义的加载状态,而不是空白屏幕。

### loading.js 的核心价值

**1. 即时加载反馈**

- 导航时立即显示加载 UI
- 避免空白屏幕导致的困惑
- 提升感知性能

**2. 流式渲染支持**

- 配合 Suspense 边界工作
- 支持渐进式内容展示
- 优化首屏渲染时间 (TTFB)

**3. 自动化集成**

- 无需手动包装 Suspense
- Next.js 自动处理边界
- 简化开发流程

**4. 可中断导航**

- 用户可随时切换路由
- 不必等待当前加载完成
- 提升交互响应性

### 加载状态的重要性

**问题 1: 空白屏幕综合症**

```
用户访问页面 → 等待数据 → 看到空白屏幕 → 困惑/离开
```

**问题 2: 布局抖动**

```
部分内容加载 → 布局突然变化 → 影响 Core Web Vitals
```

**解决方案: loading.js**

```
用户访问页面 → 立即看到加载骨架 → 数据加载 → 平滑过渡到内容
```

### 版本演进

| 版本         | 加载状态实现      | 特点               | 限制         |
| ------------ | ----------------- | ------------------ | ------------ |
| Next.js 1-12 | 手动 Suspense     | 需要手动包装       | 繁琐,易出错  |
| Next.js 13   | `loading.js` 引入 | 自动 Suspense 边界 | 初期功能有限 |
| Next.js 14   | 优化流式渲染      | 更好的性能         | 部分边缘情况 |
| Next.js 15   | 增强 Suspense     | 更细粒度控制       | 学习曲线     |
| Next.js 16   | 完整流式支持      | 稳定,高性能        | 当前最佳实践 |

---

## 第一部分:loading.js 基础

### 1.1 loading.js 文件结构

#### 基础语法

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="loading-container">
      <p>加载中...</p>
    </div>
  );
}
```

#### 骨架屏实现

```typescript
// app/posts/loading.tsx
export default function PostsLoading() {
  return (
    <div className="skeleton-container">
      {/* 骨架卡片 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-title" />
          <div className="skeleton-text" />
          <div className="skeleton-text short" />
        </div>
      ))}
    </div>
  );
}
```

```css
/* styles/skeleton.css */
.skeleton-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.skeleton-image,
.skeleton-title,
.skeleton-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-image {
  height: 200px;
  margin-bottom: 12px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 80%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 1.2 loading.js 工作原理

#### 自动 Suspense 包装

Next.js 自动将 `page.js` 包装在 Suspense 边界中:

```typescript
// 实际发生的事情 (Next.js 内部)
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

#### 文件夹结构

```
app/
├── dashboard/
│   ├── layout.tsx
│   ├── loading.tsx       # 仪表板加载状态
│   ├── page.tsx
│   └── analytics/
│       ├── loading.tsx   # 分析页加载状态
│       └── page.tsx
```

#### 渲染流程

```
1. 用户导航到 /dashboard/analytics
2. Next.js 立即显示 dashboard/layout.tsx
3. 显示 dashboard/loading.tsx (如果 page 正在加载)
4. 如果 analytics/page.tsx 也在加载,显示 analytics/loading.tsx
5. 数据加载完成后,替换为实际页面内容
```

### 1.3 loading.js 的作用域

#### 路由段级别

```
app/
├── blog/
│   ├── loading.tsx       # 影响 /blog 及其子路由
│   ├── page.tsx          # /blog
│   └── [id]/
│       └── page.tsx      # /blog/:id - 使用父级 loading.tsx
```

```typescript
// app/blog/loading.tsx
export default function BlogLoading() {
  return <div>加载博客...</div>;
}

// 访问 /blog 或 /blog/123 都会显示此加载状态
```

#### 嵌套加载状态

```
app/
├── dashboard/
│   ├── loading.tsx       # 仪表板加载
│   ├── page.tsx
│   └── settings/
│       ├── loading.tsx   # 设置加载 (覆盖父级)
│       └── page.tsx
```

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <div>加载仪表板...</div>;
}

// app/dashboard/settings/loading.tsx
export default function SettingsLoading() {
  return <div>加载设置...</div>; // 访问 /dashboard/settings 时显示此加载
}
```

### 1.4 服务端 vs 客户端组件

#### 服务端组件 (默认)

```typescript
// app/posts/loading.tsx - 默认服务端组件
export default function PostsLoading() {
  return (
    <div>
      <h2>加载文章...</h2>
      <SkeletonList />
    </div>
  );
}
```

**优势**:

- 更少的 JavaScript 发送到客户端
- 更快的初始加载
- 适合静态骨架屏

#### 客户端组件

```typescript
// app/interactive/loading.tsx
"use client";

import { useEffect, useState } from "react";

export default function InteractiveLoading() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <div>加载中{dots}</div>;
}
```

**使用场景**:

- 需要客户端交互
- 动画效果
- 状态管理

---

## 第二部分:加载 UI 设计模式

### 2.1 骨架屏 (Skeleton Screens)

骨架屏是最推荐的加载模式,提供内容结构的低保真预览。

#### 卡片骨架

```typescript
// components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
      </div>
    </div>
  );
}

// app/products/loading.tsx
import SkeletonCard from "@/components/SkeletonCard";

export default function ProductsLoading() {
  return (
    <div className="products-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
```

#### 表格骨架

```typescript
// components/SkeletonTable.tsx
export default function SkeletonTable({ rows = 10 }) {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          <th>
            <div className="skeleton-header" />
          </th>
          <th>
            <div className="skeleton-header" />
          </th>
          <th>
            <div className="skeleton-header" />
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td>
              <div className="skeleton-cell" />
            </td>
            <td>
              <div className="skeleton-cell" />
            </td>
            <td>
              <div className="skeleton-cell" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// app/users/loading.tsx
import SkeletonTable from "@/components/SkeletonTable";

export default function UsersLoading() {
  return (
    <div>
      <h1>用户列表</h1>
      <SkeletonTable rows={15} />
    </div>
  );
}
```

#### 文章骨架

```typescript
// app/blog/[id]/loading.tsx
export default function BlogPostLoading() {
  return (
    <article className="blog-post-skeleton">
      {/* 封面图骨架 */}
      <div className="skeleton-cover-image" />

      {/* 标题骨架 */}
      <div className="skeleton-title-large" />

      {/* 元信息骨架 */}
      <div className="skeleton-meta">
        <div className="skeleton-avatar" />
        <div className="skeleton-author-info">
          <div className="skeleton-text short" />
          <div className="skeleton-text shorter" />
        </div>
      </div>

      {/* 内容骨架 */}
      <div className="skeleton-content">
        <div className="skeleton-paragraph" />
        <div className="skeleton-paragraph" />
        <div className="skeleton-paragraph short" />
      </div>
    </article>
  );
}
```

### 2.2 加载指示器 (Loading Indicators)

#### 旋转器 (Spinner)

```typescript
// components/Spinner.tsx
export default function Spinner({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`spinner ${sizeClasses[size]}`} />
    </div>
  );
}

// app/api-data/loading.tsx
import Spinner from "@/components/Spinner";

export default function ApiDataLoading() {
  return (
    <div className="loading-overlay">
      <Spinner size="large" />
      <p className="mt-4">正在获取数据...</p>
    </div>
  );
}
```

```css
/* styles/spinner.css */
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

#### 进度条

```typescript
// components/ProgressBar.tsx
"use client";

import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}

// app/heavy-page/loading.tsx
import ProgressBar from "@/components/ProgressBar";

export default function HeavyPageLoading() {
  return (
    <div className="loading-page">
      <h2>正在加载...</h2>
      <ProgressBar />
    </div>
  );
}
```

### 2.3 脉冲动画

#### Tailwind CSS 脉冲

```typescript
// app/posts/loading.tsx
export default function PostsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 自定义脉冲动画

```typescript
// components/PulseSkeleton.tsx
export default function PulseSkeleton() {
  return (
    <div className="pulse-skeleton">
      <div className="pulse-item" />
      <div className="pulse-item" />
      <div className="pulse-item short" />
    </div>
  );
}
```

```css
/* styles/pulse.css */
.pulse-skeleton {
  padding: 16px;
}

.pulse-item {
  height: 16px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-item.short {
  width: 60%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### 2.4 混合加载模式

```typescript
// app/dashboard/loading.tsx
import Spinner from "@/components/Spinner";
import SkeletonCard from "@/components/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="dashboard-loading">
      {/* 顶部使用 Spinner */}
      <div className="dashboard-header">
        <Spinner size="small" />
        <span className="ml-2">加载仪表板数据...</span>
      </div>

      {/* 内容区使用骨架屏 */}
      <div className="dashboard-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* 表格区使用骨架表格 */}
      <div className="dashboard-table">
        <SkeletonTable rows={8} />
      </div>
    </div>
  );
}
```

---

## 第三部分:流式渲染 (Streaming)

### 3.1 页面级流式渲染

#### 使用 loading.js

```typescript
// app/posts/page.tsx
async function getPosts() {
  // 模拟慢速数据获取
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>文章列表</h1>
      <PostsList posts={posts} />
    </div>
  );
}
```

```typescript
// app/posts/loading.tsx
export default function PostsLoading() {
  return (
    <div>
      <h1>文章列表</h1>
      <div className="skeleton-list">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton-item" />
        ))}
      </div>
    </div>
  );
}
```

**渲染流程**:

1. 用户访问 `/posts`
2. 立即显示 `PostsLoading` 组件
3. 服务端获取数据 (2 秒)
4. 流式传输 `PostsPage` 组件
5. 平滑替换加载状态

### 3.2 组件级流式渲染

使用 Suspense 实现更细粒度的流式控制。

#### 基础 Suspense 用法

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

async function AnalyticsData() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <div>分析数据</div>;
}

async function RecentActivity() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <div>最近活动</div>;
}

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <h1>仪表板</h1>

      {/* 快速加载的内容立即显示 */}
      <div className="quick-stats">
        <StatCard title="总用户" value="1,234" />
        <StatCard title="活跃用户" value="567" />
      </div>

      {/* 慢速数据独立流式加载 */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
```

**优势**:

- 快速内容立即显示
- 慢速数据不阻塞整个页面
- 更好的用户体验

#### 并行流式渲染

```typescript
// app/profile/page.tsx
import { Suspense } from "react";

async function UserInfo({ userId }: { userId: string }) {
  const user = await fetchUser(userId);
  return <div>用户: {user.name}</div>;
}

async function UserPosts({ userId }: { userId: string }) {
  const posts = await fetchPosts(userId);
  return <div>文章: {posts.length}</div>;
}

async function UserFollowers({ userId }: { userId: string }) {
  const followers = await fetchFollowers(userId);
  return <div>关注者: {followers.length}</div>;
}

export default function ProfilePage({ params }) {
  const userId = "123";

  return (
    <div className="profile">
      {/* 三个组件并行加载 */}
      <Suspense fallback={<UserInfoSkeleton />}>
        <UserInfo userId={userId} />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>

      <Suspense fallback={<FollowersSkeleton />}>
        <UserFollowers userId={userId} />
      </Suspense>
    </div>
  );
}
```

### 3.3 嵌套 Suspense

```typescript
// app/blog/[id]/page.tsx
import { Suspense } from "react";

async function PostContent({ postId }: { postId: string }) {
  const post = await fetchPost(postId);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>

      {/* 嵌套 Suspense: 评论独立加载 */}
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments postId={postId} />
      </Suspense>
    </article>
  );
}

async function Comments({ postId }: { postId: string }) {
  const comments = await fetchComments(postId);
  return <CommentList comments={comments} />;
}

export default function BlogPostPage({ params }) {
  return (
    <div>
      <Suspense fallback={<PostSkeleton />}>
        <PostContent postId={params.id} />
      </Suspense>
    </div>
  );
}
```

**渲染流程**:

1. 显示 `PostSkeleton`
2. 加载文章内容
3. 显示文章 + `CommentsSkeleton`
4. 加载评论
5. 显示完整内容

---

## 第四部分:高级技巧

### 4.1 条件加载状态

```typescript
// app/search/loading.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchLoading() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  if (!query) {
    return <div>请输入搜索关键词</div>;
  }

  return (
    <div>
      <h2>搜索中: {query}</h2>
      <SearchSkeleton />
    </div>
  );
}
```

### 4.2 加载状态过渡

```typescript
// components/FadeInSkeleton.tsx
"use client";

import { useEffect, useState } from "react";

export default function FadeInSkeleton({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延迟显示,避免闪烁
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

// app/data/loading.tsx
import FadeInSkeleton from "@/components/FadeInSkeleton";

export default function DataLoading() {
  return (
    <FadeInSkeleton>
      <SkeletonList />
    </FadeInSkeleton>
  );
}
```

### 4.3 响应式骨架屏

```typescript
// components/ResponsiveSkeleton.tsx
"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ResponsiveSkeleton() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="mobile-skeleton">
        {/* 移动端骨架 */}
        <MobileCardSkeleton />
      </div>
    );
  }

  return (
    <div className="desktop-skeleton">
      {/* 桌面端骨架 */}
      <DesktopGridSkeleton />
    </div>
  );
}
```

### 4.4 加载进度跟踪

```typescript
// components/LoadingProgress.tsx
"use client";

import { useEffect, useState } from "react";

export default function LoadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [0, 30, 60, 90];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-progress">
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-text">{progress}%</p>
    </div>
  );
}
```

---

## 第五部分:实战应用

### 5.1 电商产品列表

```typescript
// app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="products-page">
      {/* 筛选侧边栏骨架 */}
      <aside className="filters-skeleton">
        <div className="skeleton-filter-title" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-filter-option" />
        ))}
      </aside>

      {/* 产品网格骨架 */}
      <main className="products-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="product-card-skeleton">
            <div className="skeleton-product-image" />
            <div className="skeleton-product-title" />
            <div className="skeleton-product-price" />
            <div className="skeleton-product-rating" />
          </div>
        ))}
      </main>
    </div>
  );
}
```

```css
/* styles/products-skeleton.css */
.products-page {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
  padding: 24px;
}

.filters-skeleton {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.skeleton-filter-title {
  height: 24px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 16px;
  animation: pulse 1.5s infinite;
}

.skeleton-filter-option {
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: pulse 1.5s infinite;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.product-card-skeleton {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.skeleton-product-image {
  height: 250px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: pulse 1.5s infinite;
}

.skeleton-product-title {
  height: 20px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-product-price {
  height: 24px;
  width: 60%;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-product-rating {
  height: 16px;
  width: 40%;
  background: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}
```

### 5.2 博客文章详情

```typescript
// app/blog/[slug]/loading.tsx
export default function BlogPostLoading() {
  return (
    <article className="blog-post-skeleton">
      {/* 封面图 */}
      <div className="skeleton-cover" />

      {/* 文章头部 */}
      <header className="post-header-skeleton">
        <div className="skeleton-category" />
        <div className="skeleton-title-large" />

        {/* 作者信息 */}
        <div className="skeleton-author">
          <div className="skeleton-avatar" />
          <div className="skeleton-author-details">
            <div className="skeleton-name" />
            <div className="skeleton-date" />
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <div className="post-content-skeleton">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-paragraph">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>

      {/* 评论区 */}
      <div className="comments-skeleton">
        <div className="skeleton-comments-title" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-comment">
            <div className="skeleton-avatar small" />
            <div className="skeleton-comment-content">
              <div className="skeleton-comment-author" />
              <div className="skeleton-comment-text" />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
```

### 5.3 仪表板页面

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="dashboard-skeleton">
      {/* 顶部统计卡片 */}
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card-skeleton">
            <div className="skeleton-stat-icon" />
            <div className="skeleton-stat-value" />
            <div className="skeleton-stat-label" />
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="charts-grid">
        <div className="chart-skeleton large">
          <div className="skeleton-chart-title" />
          <div className="skeleton-chart-content" />
        </div>

        <div className="chart-skeleton small">
          <div className="skeleton-chart-title" />
          <div className="skeleton-chart-content" />
        </div>
      </div>

      {/* 数据表格 */}
      <div className="table-skeleton">
        <div className="skeleton-table-header" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton-table-row" />
        ))}
      </div>
    </div>
  );
}
```

### 5.4 搜索结果页

```typescript
// app/search/loading.tsx
export default function SearchLoading() {
  return (
    <div className="search-results-skeleton">
      {/* 搜索统计 */}
      <div className="search-stats-skeleton">
        <div className="skeleton-stats-text" />
      </div>

      {/* 筛选器 */}
      <div className="search-filters-skeleton">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-filter-chip" />
        ))}
      </div>

      {/* 搜索结果 */}
      <div className="results-list">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="result-item-skeleton">
            <div className="skeleton-result-image" />
            <div className="skeleton-result-content">
              <div className="skeleton-result-type" />
              <div className="skeleton-result-title" />
              <div className="skeleton-result-excerpt" />
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div className="pagination-skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-page-number" />
        ))}
      </div>
    </div>
  );
}
```

---

## 适用场景

### 何时使用 loading.js

**1. 数据获取密集的页面**

- 列表页面
- 仪表板
- 报告页面

**2. 慢速 API 调用**

- 第三方 API
- 复杂查询
- 大数据集

**3. 提升感知性能**

- 首屏渲染优化
- 改善用户体验
- 减少跳出率

### 何时使用骨架屏

**1. 内容结构已知**

- 卡片列表
- 表格数据
- 固定布局

**2. 长时间加载**

- 超过 1 秒的数据获取
- 复杂渲染
- 大量数据

**3. 重要页面**

- 首页
- 产品页
- 核心功能页

### 何时使用 Suspense

**1. 细粒度控制**

- 独立数据源
- 不同加载速度
- 并行获取

**2. 组件级加载**

- 评论区
- 推荐内容
- 侧边栏小部件

**3. 渐进式展示**

- 优先显示关键内容
- 非关键内容延迟
- 提升 TTFB

---

## 注意事项

### 1. 避免加载闪烁

```typescript
// ❌ 避免:快速加载时的闪烁
export default function Loading() {
  return <Spinner />; // 数据快速返回时会闪烁
}

// ✅ 推荐:延迟显示加载状态
("use client");

import { useEffect, useState } from "react";

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return <Spinner />;
}
```

### 2. 保持布局一致性

```typescript
// ✅ 骨架屏应匹配实际内容布局
export default function PostsLoading() {
  return (
    <div className="posts-grid">
      {" "}
      {/* 与实际布局相同 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="post-card-skeleton">
          {/* 骨架结构与实际卡片一致 */}
          <div className="skeleton-image" />
          <div className="skeleton-title" />
          <div className="skeleton-excerpt" />
        </div>
      ))}
    </div>
  );
}
```

### 3. 性能考虑

```typescript
// ❌ 避免:过多的 DOM 节点
export default function Loading() {
  return (
    <div>
      {Array.from({ length: 1000 }).map((_, i) => (
        <SkeletonItem key={i} /> // 太多!
      ))}
    </div>
  );
}

// ✅ 推荐:合理数量
export default function Loading() {
  return (
    <div>
      {Array.from({ length: 20 }).map((_, i) => (
        <SkeletonItem key={i} /> // 与实际显示数量接近
      ))}
    </div>
  );
}
```

### 4. 可访问性

```typescript
// ✅ 提供无障碍支持
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="加载中">
      <SkeletonContent />
      <span className="sr-only">正在加载内容,请稍候</span>
    </div>
  );
}
```

---

## 常见问题

### Q1: loading.js 何时显示?

**答**: 当路由段的 `page.js` 或其子组件正在加载时,Next.js 自动显示 `loading.js`。

```typescript
// app/posts/page.tsx
async function getPosts() {
  // 数据获取期间,显示 loading.js
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```

### Q2: loading.js 和 Suspense 有什么区别?

**答**:

- `loading.js` 是路由段级别的自动 Suspense 边界
- Suspense 是组件级别的手动边界

```typescript
// loading.js - 整个页面加载状态
// app/posts/loading.tsx
export default function Loading() {
  return <PageSkeleton />;
}

// Suspense - 组件级加载状态
// app/posts/page.tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>文章列表</h1>
      <Suspense fallback={<ListSkeleton />}>
        <PostsList />
      </Suspense>
    </div>
  );
}
```

### Q3: 如何避免加载状态闪烁?

**答**: 使用延迟显示或最小显示时间。

```typescript
// 方法1: 延迟显示
"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;
  return <Skeleton />;
}

// 方法2: 最小显示时间
("use client");

import { useEffect, useState } from "react";

export default function Loading() {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    // 至少显示500ms
    const timer = setTimeout(() => setIsHiding(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={isHiding ? "fade-out" : ""}>
      <Skeleton />
    </div>
  );
}
```

### Q4: 可以在 loading.js 中访问路由参数吗?

**答**: 可以,通过客户端钩子。

```typescript
// app/posts/[category]/loading.tsx
"use client";

import { useParams } from "next/navigation";

export default function CategoryLoading() {
  const params = useParams();
  const category = params.category as string;

  return (
    <div>
      <h2>加载 {category} 分类...</h2>
      <Skeleton />
    </div>
  );
}
```

### Q5: 如何测试 loading.js?

**答**: 使用人工延迟或开发工具。

```typescript
// 方法1: 人工延迟
// app/posts/page.tsx
async function getPosts() {
  // 开发时添加延迟
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

// 方法2: 使用 Chrome DevTools 节流
// Network tab -> Slow 3G
```

### Q6: loading.js 会影响 SEO 吗?

**答**: 不会,Next.js 确保搜索引擎爬虫看到完整渲染的内容。

- 爬虫等待完整 HTML
- 流式渲染仅影响浏览器
- Metadata 正确生成

### Q7: 可以动画化加载状态吗?

**答**: 可以,使用 CSS 动画或库。

```typescript
// app/posts/loading.tsx
"use client";

import { motion } from "framer-motion";

export default function AnimatedLoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Skeleton />
    </motion.div>
  );
}
```

### Q8: 如何为不同设备提供不同的骨架屏?

**答**: 使用响应式设计或客户端检测。

```typescript
// app/products/loading.tsx
"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ProductsLoading() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {isMobile ? <MobileSkeleton /> : <DesktopSkeleton />}
    </div>
  );
}
```

### Q9: loading.js 可以获取数据吗?

**答**: 技术上可以,但不推荐。loading.js 应该是简单的 UI 组件。

```typescript
// ❌ 避免:在 loading 中获取数据
export default async function Loading() {
  const config = await fetchConfig(); // 不推荐
  return <Skeleton config={config} />;
}

// ✅ 推荐:纯 UI 组件
export default function Loading() {
  return <Skeleton />;
}
```

### Q10: 如何优化骨架屏性能?

**答**: 使用以下策略:

```typescript
// 1. 使用 CSS 动画而非 JavaScript
/* CSS */
.skeleton {
  animation: pulse 1.5s infinite;
}

// 2. 减少 DOM 节点
export default function Loading() {
  return (
    <div className="skeleton-grid">
      {/* 仅显示可见区域的骨架 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// 3. 使用简单的骨架形状
export default function SimpleSkeleton() {
  return (
    <div className="skeleton">
      {/* 简单的灰色块,而非复杂的渐变 */}
      <div className="bg-gray-200 h-48 mb-4" />
      <div className="bg-gray-200 h-6 mb-2" />
      <div className="bg-gray-200 h-4" />
    </div>
  );
}
```

---

## 总结

### 核心要点

1. **loading.js 的作用**

   - 提供即时加载反馈
   - 基于 React Suspense
   - 自动集成,简化开发

2. **工作原理**

   - 自动包装 Suspense 边界
   - 路由段级别作用域
   - 支持嵌套覆盖

3. **加载 UI 模式**

   - 骨架屏 (推荐)
   - 加载指示器
   - 进度条
   - 混合模式

4. **流式渲染**

   - 页面级流式 (loading.js)
   - 组件级流式 (Suspense)
   - 并行和嵌套支持

5. **性能优化**

   - 避免闪烁
   - 保持布局一致
   - 合理的 DOM 节点数
   - CSS 动画优先

6. **可访问性**
   - 提供 ARIA 属性
   - 屏幕阅读器支持
   - 语义化 HTML

### 最佳实践

1. **优先使用骨架屏**

   - 匹配实际内容布局
   - 提供结构预览
   - 避免空白屏幕

2. **细粒度控制**

   - 使用 Suspense 分离快慢组件
   - 并行加载独立数据
   - 渐进式展示内容

3. **性能优先**

   - 延迟显示避免闪烁
   - 简化骨架结构
   - CSS 动画优于 JavaScript

4. **用户体验**
   - 提供有意义的加载提示
   - 保持布局稳定
   - 支持可访问性

---

**下一篇**: [01-06-error.js 文件作用与使用](./01-06-error.js文件作用与使用.md)将详细介绍错误处理和错误边界的实现。

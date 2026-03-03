**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# React Query 与 Next.js 集成

## 1. 概述与背景

### 1.1 什么是 React Query

React Query (现在叫 TanStack Query) 是一个强大的数据获取和状态管理库。它提供了缓存、后台更新、重试、分页等功能,让客户端数据获取变得简单。

React Query 的核心特点:

- **自动缓存**: 智能缓存请求结果
- **后台更新**: 自动在后台刷新数据
- **重试机制**: 请求失败自动重试
- **分页支持**: 内置分页和无限滚动
- **乐观更新**: 支持乐观更新模式

### 1.2 为什么在 Next.js 中使用 React Query

虽然 Next.js 有服务端数据获取,但客户端数据获取仍然需要。React Query 提供了完整的客户端数据管理方案:

- **简化代码**: 减少样板代码
- **自动管理**: 自动处理加载、错误、缓存
- **性能优化**: 智能缓存和重新验证
- **开发体验**: 提供 DevTools 调试工具

### 1.3 React Query vs 原生 fetch

**对比表格**:

| 特性     | React Query | 原生 fetch |
| :------- | :---------- | :--------- |
| 缓存管理 | 自动        | 手动       |
| 加载状态 | 自动        | 手动       |
| 错误处理 | 内置        | 手动       |
| 重试机制 | 内置        | 手动       |
| 后台更新 | 自动        | 手动       |
| 代码量   | 少          | 多         |

## 2. 核心概念

### 2.1 安装和配置

#### 安装依赖

```bash
npm install @tanstack/react-query
# 或
yarn add @tanstack/react-query
# 或
pnpm add @tanstack/react-query
```

#### 创建 Provider

```typescript
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分钟
            gcTime: 5 * 60 * 1000, // 5分钟
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 在 layout 中使用

```typescript
// app/layout.tsx
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 2.2 基本查询

#### 使用 useQuery

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  content: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export default function Posts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

#### 带参数的查询

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  content: string;
}

async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

export default function Post({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <article>
      <h1>{data?.title}</h1>
      <p>{data?.content}</p>
    </article>
  );
}
```

### 2.3 数据变更

#### 使用 useMutation

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreatePostData {
  title: string;
  content: string;
}

async function createPost(data: CreatePostData) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create post");
  }

  return res.json();
}

export default function CreatePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // 重新获取文章列表
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutation.mutate({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Post"}
      </button>

      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>Post created successfully!</div>}
    </form>
  );
}
```

## 3. 适用场景

### 3.1 列表数据管理

#### 文章列表

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  author: string;
  createdAt: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts");
  return res.json();
}

export default function PostList() {
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Failed to load posts</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>
              By {post.author} on {post.createdAt}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.2 详情页数据

#### 文章详情

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

interface PostDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
}

async function fetchPostDetail(id: string): Promise<PostDetail> {
  const res = await fetch(`/api/posts/${id}`);
  return res.json();
}

export default function PostDetail({ id }: { id: string }) {
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostDetail(id),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author}</p>
      <div>{post.content}</div>
      <div>
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
```

### 3.3 表单提交

#### 更新文章

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface UpdatePostData {
  title: string;
  content: string;
}

async function updatePost(id: string, data: UpdatePostData) {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function EditPost({
  id,
  initialData,
}: {
  id: string;
  initialData: UpdatePostData;
}) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdatePostData) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save"}
      </button>
      {mutation.isSuccess && <div>Saved!</div>}
    </form>
  );
}
```

### 3.4 分页数据

#### 分页列表

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface PaginatedResponse {
  posts: Array<{ id: string; title: string }>;
  total: number;
  page: number;
  pageSize: number;
}

async function fetchPaginatedPosts(page: number): Promise<PaginatedResponse> {
  const res = await fetch(`/api/posts?page=${page}&limit=10`);
  return res.json();
}

export default function PaginatedPosts() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPreviousData } = useQuery({
    queryKey: ["posts", page],
    queryFn: () => fetchPaginatedPosts(page),
    keepPreviousData: true,
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul>
            {data?.posts.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>

          <div>
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((old) => old + 1)}
              disabled={isPreviousData || !data || data.posts.length < 10}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

## 4. API 签名与配置

### 4.1 QueryClient 配置

#### 全局配置

```typescript
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 数据新鲜时间
      gcTime: 5 * 60 * 1000, // 缓存时间
      retry: 3, // 重试次数
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // 窗口聚焦时重新获取
      refetchOnReconnect: true, // 重新连接时重新获取
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 4.2 useQuery 选项

#### 常用选项

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["posts", id],
  queryFn: () => fetchPost(id),

  // 缓存配置
  staleTime: 5 * 60 * 1000, // 5分钟
  gcTime: 10 * 60 * 1000, // 10分钟

  // 重试配置
  retry: 3,
  retryDelay: 1000,

  // 重新获取配置
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: false,

  // 其他选项
  enabled: true, // 是否启用查询
  placeholderData: undefined, // 占位数据
  select: (data) => data, // 数据转换
});
```

### 4.3 useMutation 选项

#### 常用选项

```typescript
const mutation = useMutation({
  mutationFn: createPost,

  // 生命周期回调
  onMutate: async (variables) => {
    // 乐观更新前
    await queryClient.cancelQueries({ queryKey: ["posts"] });
    const previousPosts = queryClient.getQueryData(["posts"]);
    return { previousPosts };
  },

  onError: (error, variables, context) => {
    // 错误时回滚
    if (context?.previousPosts) {
      queryClient.setQueryData(["posts"], context.previousPosts);
    }
  },

  onSuccess: (data, variables, context) => {
    // 成功后
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },

  onSettled: (data, error, variables, context) => {
    // 完成后(无论成功失败)
  },
});
```

## 5. 基础与进阶使用

### 5.1 基础查询

#### 简单查询

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export default function SimpleQuery() {
  const { data } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      const res = await fetch("/api/data");
      return res.json();
    },
  });

  return <div>{JSON.stringify(data)}</div>;
}
```

#### 依赖查询

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export default function DependentQueries({ userId }: { userId: string }) {
  // 先获取用户
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
  });

  // 再获取用户的文章
  const { data: posts } = useQuery({
    queryKey: ["posts", user?.id],
    queryFn: () => fetch(`/api/users/${user.id}/posts`).then((r) => r.json()),
    enabled: !!user, // 只有用户数据存在时才执行
  });

  return (
    <div>
      <h1>{user?.name}</h1>
      <ul>
        {posts?.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.2 进阶使用

#### 无限滚动

```typescript
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface Post {
  id: string;
  title: string;
}

interface PageData {
  posts: Post[];
  nextCursor: string | null;
}

async function fetchPosts({ pageParam = 0 }): Promise<PageData> {
  const res = await fetch(`/api/posts?cursor=${pageParam}&limit=10`);
  return res.json();
}

export default function InfiniteScrollPosts() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: fetchPosts,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: 0,
    });

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      ))}

      {isFetchingNextPage && <div>Loading more...</div>}
      {hasNextPage && <div ref={observerRef} style={{ height: "20px" }} />}
    </div>
  );
}
```

#### 乐观更新

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  likes: number;
}

async function likePost(id: string) {
  const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
  return res.json();
}

export default function PostWithLike({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: likePost,

    onMutate: async (postId) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // 保存之前的数据
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);

      // 乐观更新
      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        return { ...old, likes: old.likes + 1 };
      });

      return { previousPost };
    },

    onError: (err, postId, context) => {
      // 错误时回滚
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    onSettled: (data, error, postId) => {
      // 完成后重新获取
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return (
    <div>
      <h2>{post.title}</h2>
      <button onClick={() => likeMutation.mutate(post.id)}>
        Like ({post.likes})
      </button>
    </div>
  );
}
```

#### 预取数据

```typescript
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
}

async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`);
  return res.json();
}

export default function PostList({ posts }: { posts: Post[] }) {
  const queryClient = useQueryClient();

  const prefetchPost = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["post", id],
      queryFn: () => fetchPost(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id} onMouseEnter={() => prefetchPost(post.id)}>
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

#### 并行查询

```typescript
"use client";

import { useQueries } from "@tanstack/react-query";

async function fetchPost(id: string) {
  const res = await fetch(`/api/posts/${id}`);
  return res.json();
}

export default function ParallelPosts({ ids }: { ids: string[] }) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["post", id],
      queryFn: () => fetchPost(id),
    })),
  });

  const isLoading = results.some((result) => result.isLoading);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {results.map((result, i) => (
        <div key={ids[i]}>{result.data?.title}</div>
      ))}
    </div>
  );
}
```

## 6. 注意事项

### 6.1 QueryKey 管理

#### 集中管理 QueryKey

```typescript
// lib/queryKeys.ts
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
};

// 使用
import { queryKeys } from "@/lib/queryKeys";

const { data } = useQuery({
  queryKey: queryKeys.posts.detail(id),
  queryFn: () => fetchPost(id),
});
```

### 6.2 错误处理

#### 全局错误处理

```typescript
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        console.error("Query error:", error);
        // 显示错误提示
      },
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
        // 显示错误提示
      },
    },
  },
});
```

#### 组件级错误处理

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export default function PostWithError({ id }: { id: string }) {
  const { data, error, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch post");
      }
      return res.json();
    },
    retry: (failureCount, error) => {
      // 404 不重试
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{data?.title}</div>;
}
```

### 6.3 性能优化

#### 选择性数据订阅

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  content: string;
  metadata: {
    views: number;
    likes: number;
  };
}

export default function PostTitle({ id }: { id: string }) {
  // 只订阅 title,其他字段变化不会触发重新渲染
  const { data: title } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`);
      return res.json() as Promise<Post>;
    },
    select: (data) => data.title,
  });

  return <h1>{title}</h1>;
}
```

#### 结构化共享

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export default function PostList() {
  const { data } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      return res.json();
    },
    // React Query 默认启用结构化共享
    // 只有实际变化的数据才会触发重新渲染
    structuralSharing: true,
  });

  return (
    <ul>
      {data?.map((post: any) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 6.4 服务端渲染

#### 预取数据

```typescript
// app/posts/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import PostList from "./PostList";

async function fetchPosts() {
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

export default async function PostsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}
```

```typescript
// app/posts/PostList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export default function PostList() {
  const { data } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      return res.json();
    },
  });

  return (
    <ul>
      {data?.map((post: any) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: React Query 和 SWR 有什么区别?

**问题**: 应该选择 React Query 还是 SWR?

**简短回答**: React Query 功能更强大,SWR 更轻量简单。

**详细解释**:

React Query 提供更多功能如无限滚动、乐观更新、DevTools 等。SWR 更轻量,API 更简单,适合简单场景。

**代码示例**:

```typescript
// React Query
import { useQuery } from "@tanstack/react-query";

const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});

// SWR
import useSWR from "swr";

const { data } = useSWR("/api/posts", fetcher);
```

#### 问题二: 如何设置缓存时间?

**问题**: staleTime 和 gcTime 有什么区别?

**简短回答**: staleTime 控制数据新鲜度,gcTime 控制缓存保留时间。

**详细解释**:

staleTime 决定数据多久后变为陈旧,陈旧数据会在后台重新获取。gcTime 决定未使用的数据多久后被垃圾回收。

**代码示例**:

```typescript
const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000, // 5分钟内数据是新鲜的
  gcTime: 10 * 60 * 1000, // 10分钟后未使用的数据被清除
});
```

#### 问题三: 如何禁用自动重新获取?

**问题**: 如何阻止 React Query 自动刷新数据?

**简短回答**: 设置 refetch 相关选项为 false。

**详细解释**:

React Query 默认在窗口聚焦、重新连接时刷新数据。可以通过配置禁用这些行为。

**代码示例**:

```typescript
const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
});
```

### 7.2 进阶问题

#### 问题四: 如何实现条件查询?

**问题**: 如何根据条件决定是否执行查询?

**简短回答**: 使用 enabled 选项。

**详细解释**:

enabled 选项可以控制查询是否执行,常用于依赖查询或条件查询。

**代码示例**:

```typescript
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // 只有 userId 存在时才执行
});
```

#### 问题五: 如何处理分页数据?

**问题**: 如何实现分页查询?

**简短回答**: 使用 queryKey 包含页码,或使用 useInfiniteQuery。

**详细解释**:

普通分页使用 queryKey 包含页码,每页独立缓存。无限滚动使用 useInfiniteQuery。

**代码示例**:

```typescript
// 普通分页
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ["posts", page],
  queryFn: () => fetchPosts(page),
  keepPreviousData: true,
});

// 无限滚动
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: 0,
});
```

## 8. 总结

### 8.1 核心要点回顾

**React Query 的主要优势**:

- 自动缓存和后台更新
- 简化的 API 和更少的代码
- 强大的 DevTools
- 内置重试和错误处理

**关键概念**:

- QueryClient: 管理所有查询
- useQuery: 获取数据
- useMutation: 修改数据
- QueryKey: 唯一标识查询

### 8.2 关键收获

1. **Provider 配置**: 在根组件配置 QueryClientProvider
2. **查询管理**: 使用 useQuery 获取数据
3. **数据变更**: 使用 useMutation 修改数据
4. **缓存策略**: 合理设置 staleTime 和 gcTime
5. **性能优化**: 使用 select、预取、乐观更新

### 8.3 最佳实践

1. **集中管理 QueryKey**: 使用常量或工厂函数
2. **合理设置缓存**: 根据数据特点设置缓存时间
3. **错误处理**: 全局和组件级错误处理结合
4. **乐观更新**: 提升用户体验
5. **预取数据**: 在用户操作前预加载

### 8.4 下一步学习

- **SWR**: 了解另一个数据获取库
- **状态管理**: 学习全局状态管理
- **服务端渲染**: 掌握 SSR 中的数据预取
- **性能优化**: 深入理解缓存和重新验证

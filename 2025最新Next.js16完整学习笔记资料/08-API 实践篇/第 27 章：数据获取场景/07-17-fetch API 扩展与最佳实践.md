**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# fetch API 扩展与最佳实践

Next.js 16 对原生 fetch API 进行了扩展,增加了缓存、重新验证等功能。本文将介绍如何在 Next.js 中使用 fetch API,以及相关的最佳实践。

## 基础概念

### Next.js fetch 扩展

Next.js 扩展了原生 fetch API,添加了以下功能:

1. **自动缓存**: 默认缓存 GET 请求
2. **重新验证**: 支持时间和标签重新验证
3. **请求去重**: 自动去除重复请求
4. **类型安全**: 支持 TypeScript 类型推断

### fetch 选项对比

| 选项            | 默认值        | 说明             |
| --------------- | ------------- | ---------------- |
| cache           | 'force-cache' | 缓存策略         |
| next.revalidate | false         | 重新验证时间(秒) |
| next.tags       | []            | 缓存标签         |
| signal          | undefined     | AbortSignal 对象 |

## 实战场景一: 基础数据获取

### 服务端数据获取

```typescript
// app/products/page.tsx
interface Product {
  id: number;
  name: string;
  price: number;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch("https://api.example.com/products", {
    cache: "force-cache", // 默认值,缓存数据
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 禁用缓存

```typescript
// app/api/latest/route.ts
export async function GET() {
  const res = await fetch("https://api.example.com/latest", {
    cache: "no-store", // 禁用缓存
  });

  const data = await res.json();

  return Response.json(data);
}
```

### 时间重新验证

```typescript
// app/news/page.tsx
async function getNews() {
  const res = await fetch("https://api.example.com/news", {
    next: { revalidate: 60 }, // 60秒后重新验证
  });

  return res.json();
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div>
      <h1>Latest News</h1>
      {news.map((item: any) => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### 标签重新验证

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] }, // 添加缓存标签
  });

  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}

// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag("posts"); // 重新验证带有 'posts' 标签的请求
  return Response.json({ revalidated: true });
}
```

## 实战场景二: 错误处理

### 基础错误处理

```typescript
// lib/fetch-with-error.ts
export async function fetchWithError<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// 使用示例
const data = await fetchWithError<Product[]>(
  "https://api.example.com/products"
);
```

### 重试机制

```typescript
// lib/fetch-with-retry.ts
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      lastError = error as Error;
      console.log(`Retry ${i + 1}/${maxRetries}`);

      // 等待一段时间后重试
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError!;
}
```

### 超时处理

```typescript
// lib/fetch-with-timeout.ts
export async function fetchWithTimeout<T>(
  url: string,
  options?: RequestInit,
  timeout: number = 5000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    throw error;
  }
}

// 使用示例
try {
  const data = await fetchWithTimeout<Product[]>(
    "https://api.example.com/products",
    {},
    3000 // 3秒超时
  );
} catch (error) {
  console.error("Fetch failed:", error);
}
```

### 自定义错误类型

```typescript
// lib/fetch-errors.ts
export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = "FetchError";
  }
}

export class NetworkError extends FetchError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends FetchError {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

// lib/fetch-with-custom-errors.ts
export async function fetchWithCustomErrors<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new FetchError(
        `HTTP error! status: ${res.status}`,
        res.status,
        res
      );
    }

    return await res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new NetworkError("Network error occurred");
    }

    throw error;
  }
}
```

## 实战场景三: 请求优化

### 请求去重

```typescript
// lib/dedupe-fetch.ts
const requestCache = new Map<string, Promise<any>>();

export async function dedupeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;

  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }

  const promise = fetch(url, options)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .finally(() => {
      // 请求完成后清除缓存
      requestCache.delete(cacheKey);
    });

  requestCache.set(cacheKey, promise);

  return promise;
}
```

### 并行请求

```typescript
// app/dashboard/page.tsx
async function getDashboardData() {
  const [users, products, orders] = await Promise.all([
    fetch("https://api.example.com/users").then((res) => res.json()),
    fetch("https://api.example.com/products").then((res) => res.json()),
    fetch("https://api.example.com/orders").then((res) => res.json()),
  ]);

  return { users, products, orders };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Users: {data.users.length}</div>
      <div>Products: {data.products.length}</div>
      <div>Orders: {data.orders.length}</div>
    </div>
  );
}
```

### 串行请求

```typescript
// app/user/[id]/page.tsx
async function getUserWithPosts(userId: string) {
  // 先获取用户信息
  const user = await fetch(`https://api.example.com/users/${userId}`).then(
    (res) => res.json()
  );

  // 再获取用户的文章
  const posts = await fetch(
    `https://api.example.com/users/${userId}/posts`
  ).then((res) => res.json());

  return { user, posts };
}

export default async function UserPage({ params }: { params: { id: string } }) {
  const { user, posts } = await getUserWithPosts(params.id);

  return (
    <div>
      <h1>{user.name}</h1>
      <h2>Posts</h2>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 条件请求

```typescript
// app/products/page.tsx
async function getProducts(category?: string) {
  const url = category
    ? `https://api.example.com/products?category=${category}`
    : "https://api.example.com/products";

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  return res.json();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const products = await getProducts(searchParams.category);

  return (
    <div>
      <h1>Products</h1>
      {searchParams.category && <p>Category: {searchParams.category}</p>}
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 实战场景四: 高级用法

### 请求拦截器

```typescript
// lib/fetch-interceptor.ts
type RequestInterceptor = (
  url: string,
  options?: RequestInit
) => Promise<{ url: string; options?: RequestInit }>;

type ResponseInterceptor = (response: Response) => Promise<Response>;

class FetchInterceptor {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    let finalUrl = url;
    let finalOptions = options;

    // 执行请求拦截器
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(finalUrl, finalOptions);
      finalUrl = result.url;
      finalOptions = result.options;
    }

    // 发送请求
    let response = await fetch(finalUrl, finalOptions);

    // 执行响应拦截器
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    return response;
  }
}

export const fetchInterceptor = new FetchInterceptor();

// 添加认证拦截器
fetchInterceptor.addRequestInterceptor(async (url, options) => {
  const token = await getAuthToken();

  return {
    url,
    options: {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    },
  };
});

// 添加日志拦截器
fetchInterceptor.addResponseInterceptor(async (response) => {
  console.log(`Response from ${response.url}:`, response.status);
  return response;
});
```

### 请求缓存管理

```typescript
// lib/fetch-cache.ts
class FetchCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 60000) {
    this.ttl = ttl;
  }

  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const res = await fetch(url, options);
    const data = await res.json();

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  clear() {
    this.cache.clear();
  }

  delete(url: string) {
    const keys = Array.from(this.cache.keys()).filter((key) =>
      key.startsWith(url)
    );
    keys.forEach((key) => this.cache.delete(key));
  }
}

export const fetchCache = new FetchCache(60000); // 60秒缓存
```

## 适用场景

### 缓存策略选择

| 场景     | 缓存策略        | 说明             |
| -------- | --------------- | ---------------- |
| 静态内容 | force-cache     | 长期缓存         |
| 动态内容 | no-store        | 不缓存           |
| 定时更新 | revalidate: 60  | 60 秒后重新验证  |
| 按需更新 | tags: ['posts'] | 使用标签重新验证 |

### 错误处理策略

| 错误类型 | 处理方式 | 说明          |
| -------- | -------- | ------------- |
| 网络错误 | 重试     | 自动重试 3 次 |
| 超时错误 | 提示用户 | 显示超时提示  |
| 4xx 错误 | 记录日志 | 客户端错误    |
| 5xx 错误 | 降级处理 | 服务器错误    |

## 注意事项

### 1. 避免在客户端组件中使用扩展选项

```typescript
// 错误:客户端组件中使用 next 选项
"use client";

export default function ClientComponent() {
  useEffect(() => {
    fetch("/api/data", {
      next: { revalidate: 60 }, // 不会生效
    });
  }, []);
}

// 正确:在服务端组件中使用
export default async function ServerComponent() {
  const data = await fetch("/api/data", {
    next: { revalidate: 60 },
  });
}
```

### 2. 合理设置重新验证时间

```typescript
// 不好的做法:过短的重新验证时间
const data = await fetch("/api/data", {
  next: { revalidate: 1 }, // 1秒,太频繁
});

// 好的做法:根据数据更新频率设置
const data = await fetch("/api/data", {
  next: { revalidate: 3600 }, // 1小时
});
```

### 3. 处理请求取消

```typescript
// 正确处理请求取消
"use client";

import { useEffect, useState } from "react";

export default function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/data", {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(setData)
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      });

    return () => controller.abort();
  }, []);

  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
}
```

### 4. 避免缓存敏感数据

```typescript
// 不好的做法:缓存用户敏感数据
const userData = await fetch("/api/user", {
  cache: "force-cache", // 不要缓存敏感数据
});

// 好的做法:不缓存敏感数据
const userData = await fetch("/api/user", {
  cache: "no-store",
});
```

### 5. 正确处理并发请求

```typescript
// 不好的做法:串行请求
const user = await fetch("/api/user").then((res) => res.json());
const posts = await fetch("/api/posts").then((res) => res.json());
const comments = await fetch("/api/comments").then((res) => res.json());

// 好的做法:并行请求
const [user, posts, comments] = await Promise.all([
  fetch("/api/user").then((res) => res.json()),
  fetch("/api/posts").then((res) => res.json()),
  fetch("/api/comments").then((res) => res.json()),
]);
```

## 常见问题

### 1. 为什么 fetch 缓存在开发环境不生效?

开发环境默认禁用缓存,生产环境才会生效:

```typescript
// 开发环境
const data = await fetch("/api/data", {
  cache: "force-cache", // 开发环境不会缓存
});

// 要在开发环境测试缓存,使用 production 模式
// npm run build && npm start
```

### 2. 如何清除特定的缓存?

使用 revalidateTag 或 revalidatePath:

```typescript
import { revalidateTag, revalidatePath } from "next/cache";

// 清除带有特定标签的缓存
revalidateTag("posts");

// 清除特定路径的缓存
revalidatePath("/posts");
```

### 3. 如何在客户端组件中获取数据?

使用 useEffect 或 SWR/React Query:

```typescript
"use client";

import { useEffect, useState } from "react";

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
}
```

### 4. 如何处理 CORS 错误?

在 API 路由中设置 CORS 头:

```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await fetch("https://external-api.com/data");
  const json = await data.json();

  return Response.json(json, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
```

### 5. 如何实现请求防抖?

使用防抖函数:

```typescript
"use client";

import { useState, useCallback } from "react";
import { debounce } from "lodash";

export default function SearchComponent() {
  const [results, setResults] = useState([]);

  const search = useCallback(
    debounce(async (query: string) => {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    }, 300),
    []
  );

  return (
    <input
      type="text"
      onChange={(e) => search(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 6. 如何实现分页加载?

使用游标或页码:

```typescript
async function getProducts(page: number = 1, limit: number = 10) {
  const res = await fetch(
    `https://api.example.com/products?page=${page}&limit=${limit}`,
    {
      next: { revalidate: 60 },
    }
  );

  return res.json();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const products = await getProducts(page);

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <div>
        <a href={`/products?page=${page - 1}`}>Previous</a>
        <a href={`/products?page=${page + 1}`}>Next</a>
      </div>
    </div>
  );
}
```

### 7. 如何处理文件上传?

使用 FormData:

```typescript
"use client";

export default function UploadForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### 8. 如何实现请求重试?

使用重试逻辑:

```typescript
async function fetchWithRetry(url: string, maxRetries: number = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 9. 如何实现请求队列?

使用队列管理器:

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 3;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const fn = this.queue.shift()!;

    try {
      await fn();
    } finally {
      this.running--;
      this.process();
    }
  }
}

export const requestQueue = new RequestQueue();
```

### 10. 如何监控请求性能?

使用 Performance API:

```typescript
async function fetchWithPerformance(url: string) {
  const startTime = performance.now();

  try {
    const res = await fetch(url);
    const data = await res.json();

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Request to ${url} took ${duration}ms`);

    return data;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.error(`Request to ${url} failed after ${duration}ms`);
    throw error;
  }
}
```

## 总结

Next.js 的 fetch API 扩展提供了强大的缓存和重新验证功能。通过本文的学习,我们掌握了:

### 核心功能

1. **自动缓存**: 默认缓存 GET 请求
2. **重新验证**: 时间和标签重新验证
3. **请求去重**: 自动去除重复请求
4. **类型安全**: TypeScript 类型支持

### 最佳实践

1. **合理使用缓存**: 根据数据特性选择缓存策略
2. **错误处理**: 实现重试和超时机制
3. **性能优化**: 并行请求和请求去重
4. **安全性**: 不缓存敏感数据

### 实战技巧

1. **请求拦截器**: 统一处理认证和日志
2. **缓存管理**: 实现自定义缓存策略
3. **并发控制**: 使用请求队列
4. **性能监控**: 追踪请求性能

通过合理使用 fetch API,可以构建高性能、可靠的数据获取层。

## 扩展内容

### 实战场景五: 认证与授权

#### JWT Token 管理

```typescript
// lib/auth-fetch.ts
let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function getAccessToken(): Promise<string> {
  if (accessToken) {
    return accessToken;
  }

  // 从存储中获取 token
  const stored = localStorage.getItem("accessToken");
  if (stored) {
    accessToken = stored;
    return stored;
  }

  throw new Error("No access token available");
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await res.json();
  accessToken = data.accessToken;
  localStorage.setItem("accessToken", data.accessToken);

  return data.accessToken;
}

export async function authFetch(url: string, options?: RequestInit) {
  try {
    const token = await getAccessToken();

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      // Token 过期,刷新后重试
      const newToken = await refreshAccessToken();

      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return res;
  } catch (error) {
    console.error("Auth fetch error:", error);
    throw error;
  }
}
```

#### OAuth 2.0 流程

```typescript
// lib/oauth-fetch.ts
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
}

class OAuthClient {
  constructor(private config: OAuthConfig) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      state,
    });

    return `${this.config.authorizationEndpoint}?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const res = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const data = await res.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }
}

export const oauthClient = new OAuthClient({
  clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI!,
  authorizationEndpoint: "https://oauth.example.com/authorize",
  tokenEndpoint: "https://oauth.example.com/token",
});
```

### 实战场景六: 数据转换与验证

#### 响应数据验证

```typescript
// lib/validated-fetch.ts
import { z } from "zod";

export async function validatedFetch<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();

  try {
    return schema.parse(data);
  } catch (error) {
    console.error("Validation error:", error);
    throw new Error("Invalid response data");
  }
}

// 使用示例
const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number().positive(),
  inStock: z.boolean(),
});

const product = await validatedFetch("/api/products/1", ProductSchema);
```

#### 数据转换

```typescript
// lib/transform-fetch.ts
type Transformer<T, R> = (data: T) => R;

export async function transformFetch<T, R>(
  url: string,
  transformer: Transformer<T, R>,
  options?: RequestInit
): Promise<R> {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data: T = await res.json();

  return transformer(data);
}

// 使用示例
interface ApiProduct {
  id: number;
  product_name: string;
  unit_price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

const product = await transformFetch<ApiProduct, Product>(
  "/api/products/1",
  (data) => ({
    id: data.id,
    name: data.product_name,
    price: data.unit_price,
  })
);
```

### 实战场景七: 批量请求处理

#### 批量请求合并

```typescript
// lib/batch-fetch.ts
class BatchFetcher {
  private queue: Array<{
    url: string;
    resolve: (data: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;

  async fetch(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.processBatch();
      }, 10);
    });
  }

  private async processBatch() {
    const batch = this.queue.splice(0);

    if (batch.length === 0) return;

    const urls = batch.map((item) => item.url);

    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      });

      const results = await res.json();

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((item) => {
        item.reject(error as Error);
      });
    }
  }
}

export const batchFetcher = new BatchFetcher();
```

#### GraphQL 批量查询

```typescript
// lib/graphql-fetch.ts
interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

export async function graphqlFetch<T>(
  endpoint: string,
  query: GraphQLQuery
): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const { data, errors } = await res.json();

  if (errors) {
    throw new Error(errors[0].message);
  }

  return data;
}

// 批量查询
export async function batchGraphQLFetch<T>(
  endpoint: string,
  queries: GraphQLQuery[]
): Promise<T[]> {
  const results = await Promise.all(
    queries.map((query) => graphqlFetch<T>(endpoint, query))
  );

  return results;
}
```

### 实战场景八: 流式数据处理

#### Server-Sent Events (SSE)

```typescript
// lib/sse-fetch.ts
export async function* fetchSSE(url: string): AsyncGenerator<string> {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        yield line.slice(6);
      }
    }
  }
}

// 使用示例
for await (const data of fetchSSE("/api/events")) {
  console.log("Received:", data);
}
```

#### 流式 JSON 解析

```typescript
// lib/stream-json-fetch.ts
export async function* fetchStreamJSON<T>(url: string): AsyncGenerator<T> {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          yield JSON.parse(line) as T;
        } catch (error) {
          console.error("Failed to parse JSON:", line);
        }
      }
    }
  }
}
```

通过合理使用 fetch API,可以构建高性能、可靠的数据获取层。

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# fetch API 在 Next.js 16 中的扩展

## 1. 概述

Next.js 16 对原生 fetch API 进行了深度扩展和优化,使其成为服务端数据获取的核心工具。这些扩展不仅保持了 Web 标准的兼容性,还引入了强大的缓存控制、请求去重和性能优化能力。

### 1.1 核心价值

fetch API 在 Next.js 16 中的扩展解决了以下核心问题:

- **自动请求去重**: 相同的请求在一次渲染周期内只会执行一次
- **灵活的缓存控制**: 支持多种缓存策略,从完全不缓存到永久缓存
- **服务端优化**: 针对服务端环境进行了特殊优化,提升数据获取性能
- **类型安全**: 与 TypeScript 深度集成,提供完整的类型推断

### 1.2 ⚠️ Next.js 16 重大变更

⚠️ **Next.js 16 变更**: fetch API 的默认缓存策略从 `force-cache` 改为 `no-store`,这是一个重要的破坏性变更。

| 版本       | 默认缓存策略  | 说明                  |
| :--------- | :------------ | :-------------------- |
| Next.js 14 | `force-cache` | 默认缓存所有请求      |
| Next.js 15 | `force-cache` | 保持缓存行为          |
| Next.js 16 | `no-store` ⚠️ | 默认不缓存,需显式指定 |

这个变更的原因:

1. **更符合直觉**: 默认不缓存避免了数据过期的问题
2. **更安全**: 防止敏感数据被意外缓存
3. **更灵活**: 开发者可以根据需要显式启用缓存

### 1.3 适用场景

fetch API 扩展适用于以下场景:

- 服务端组件中获取 API 数据
- 需要精细控制缓存策略的数据请求
- 需要请求去重优化的场景
- 需要与外部 API 集成的应用

## 2. 核心概念与原理

### 2.1 工作机制

Next.js 16 的 fetch 扩展在原生 fetch 基础上增加了以下层:

```
┌─────────────────────────────────────┐
│   应用代码调用 fetch()              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Next.js fetch 拦截层              │
│   - 请求去重检查                    │
│   - 缓存策略解析                    │
│   - 标签管理                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   缓存层                            │
│   - 检查缓存是否存在                │
│   - 应用缓存策略                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   原生 fetch 执行                   │
│   - 发起 HTTP 请求                  │
│   - 获取响应数据                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   响应处理                          │
│   - 存储到缓存                      │
│   - 返回给应用                      │
└─────────────────────────────────────┘
```

### 2.2 请求去重机制

在一次渲染周期内,Next.js 会自动对相同的 fetch 请求进行去重:

```typescript
// app/page.tsx
async function Page() {
  // 这两个请求会被自动去重,只执行一次
  const data1 = await fetch("https://api.example.com/users");
  const data2 = await fetch("https://api.example.com/users");

  // 实际上只发起了一次网络请求
  return <div>...</div>;
}
```

去重的判断标准:

1. **URL 完全相同**: 包括协议、域名、路径、查询参数
2. **请求方法相同**: GET、POST 等
3. **在同一渲染周期内**: 跨渲染周期不会去重

### 2.3 缓存层级

Next.js 16 的 fetch 缓存分为多个层级:

| 缓存层级     | 作用范围 | 生命周期       | 用途           |
| :----------- | :------- | :------------- | :------------- |
| 请求去重缓存 | 单次渲染 | 渲染结束后清除 | 避免重复请求   |
| 数据缓存     | 跨请求   | 根据策略决定   | 持久化数据存储 |
| 全路由缓存   | 整个路由 | 重新部署后清除 | 静态页面缓存   |

## 3. 适用场景

### 3.1 典型应用案例

#### 场景一: 获取静态内容

适合使用 `force-cache` 策略的场景:

```typescript
// app/blog/[slug]/page.tsx
async function BlogPost({ params }: { params: { slug: string } }) {
  // 博客文章内容很少变化,可以永久缓存
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    cache: "force-cache",
  });

  const data = await post.json();

  return (
    <article>
      <h1>{data.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
    </article>
  );
}
```

#### 场景二: 获取实时数据

适合使用 `no-store` 策略的场景:

```typescript
// app/dashboard/page.tsx
async function Dashboard() {
  // 仪表盘数据需要实时更新,不应该缓存
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store",
  });

  const data = await stats.json();

  return (
    <div>
      <h1>实时统计</h1>
      <p>在线用户: {data.onlineUsers}</p>
      <p>今日访问: {data.todayVisits}</p>
    </div>
  );
}
```

#### 场景三: 定时重新验证

适合使用 `revalidate` 选项的场景:

```typescript
// app/products/page.tsx
async function Products() {
  // 产品列表每小时更新一次
  const products = await fetch("https://api.example.com/products", {
    next: { revalidate: 3600 }, // 3600秒 = 1小时
  });

  const data = await products.json();

  return (
    <div>
      {data.map((product: any) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

#### 场景四: 标签化缓存

适合使用 `tags` 选项的场景:

```typescript
// app/users/page.tsx
async function Users() {
  // 使用标签管理缓存,方便按需重新验证
  const users = await fetch("https://api.example.com/users", {
    next: {
      tags: ["users", "user-list"],
      revalidate: 3600,
    },
  });

  const data = await users.json();

  return (
    <div>
      {data.map((user: any) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// 在其他地方可以通过标签重新验证
// app/api/users/route.ts
import { revalidateTag } from "next/cache";

export async function POST() {
  // 创建新用户后,重新验证用户列表缓存
  revalidateTag("users");
  return Response.json({ success: true });
}
```

### 3.2 场景限制

以下场景不适合使用 fetch 扩展:

1. **客户端组件**: fetch 扩展只在服务端组件中生效
2. **浏览器环境**: 客户端代码中的 fetch 是原生行为
3. **非 HTTP 请求**: 只支持 HTTP/HTTPS 协议
4. **流式响应**: 不支持 ReadableStream 的缓存

```typescript
// ❌ 错误: 在客户端组件中使用
"use client";

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 这里的 fetch 是原生的,不会有 Next.js 的扩展功能
    fetch("https://api.example.com/data", {
      next: { revalidate: 60 }, // 这个选项会被忽略
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}

// ✅ 正确: 在服务端组件中使用
async function ServerComponent() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 }, // 这个选项会生效
  });
  const data = await res.json();

  return <div>{JSON.stringify(data)}</div>;
}
```

## 4. API 签名与配置

### 4.1 核心函数签名

```typescript
// Next.js 16 扩展的 fetch 类型定义
function fetch(
  input: RequestInfo | URL,
  init?: RequestInit & {
    // Next.js 扩展选项
    next?: {
      // 重新验证时间(秒)
      revalidate?: number | false;
      // 缓存标签
      tags?: string[];
    };
    // 标准 fetch 缓存选项
    cache?: "force-cache" | "no-store" | "no-cache" | "reload" | "default";
  }
): Promise<Response>;
```

### 4.2 参数详解

#### input 参数

表示要获取的资源,可以是:

- **字符串 URL**: `'https://api.example.com/data'`
- **URL 对象**: `new URL('/api/data', 'https://example.com')`
- **Request 对象**: `new Request('https://api.example.com/data')`

```typescript
// 方式一: 字符串 URL
const res1 = await fetch("https://api.example.com/data");

// 方式二: URL 对象
const url = new URL("/api/data", "https://example.com");
const res2 = await fetch(url);

// 方式三: Request 对象
const request = new Request("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
const res3 = await fetch(request);
```

#### cache 参数

控制请求的缓存行为:

| 值            | 行为                          | 使用场景                |
| :------------ | :---------------------------- | :---------------------- |
| `force-cache` | 优先使用缓存,没有缓存时才请求 | 静态内容,很少变化的数据 |
| `no-store`    | 不使用缓存,每次都请求         | 实时数据,用户特定数据   |
| `no-cache`    | 使用缓存但先验证              | 需要确保数据新鲜度      |
| `reload`      | 忽略缓存,强制请求             | 强制刷新数据            |
| `default`     | 使用浏览器默认行为            | 一般不使用              |

⚠️ **Next.js 16 变更**: 如果不指定 `cache` 参数,默认值是 `no-store`。

```typescript
// Next.js 15 及之前
const res = await fetch("https://api.example.com/data");
// 等同于: cache: 'force-cache'

// Next.js 16
const res = await fetch("https://api.example.com/data");
// 等同于: cache: 'no-store'

// 如果需要缓存,必须显式指定
const res = await fetch("https://api.example.com/data", {
  cache: "force-cache",
});
```

#### next.revalidate 参数

控制缓存的重新验证时间(秒):

```typescript
// 每60秒重新验证一次
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: 60 },
});

// 永不重新验证(永久缓存)
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: false },
});

// 使用默认的重新验证时间(如果路由配置了的话)
const res = await fetch("https://api.example.com/data", {
  next: { revalidate: undefined },
});
```

`revalidate` 的值:

| 值          | 行为               | 使用场景       |
| :---------- | :----------------- | :------------- |
| `number`    | 指定秒数后重新验证 | 定期更新的内容 |
| `false`     | 永不重新验证       | 静态内容       |
| `0`         | 每次请求都重新验证 | 实时数据       |
| `undefined` | 使用路由默认值     | 继承路由配置   |

#### next.tags 参数

为缓存添加标签,方便按需重新验证:

```typescript
// 添加单个标签
const res = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});

// 添加多个标签
const res = await fetch("https://api.example.com/posts/1", {
  next: { tags: ["posts", "post-1"] },
});

// 结合 revalidate 使用
const res = await fetch("https://api.example.com/posts", {
  next: {
    tags: ["posts"],
    revalidate: 3600,
  },
});
```

标签的使用规则:

1. **标签名称**: 字符串,不超过 256 个字符,区分大小写
2. **多个标签**: 可以为一个请求添加多个标签
3. **重新验证**: 使用 `revalidateTag()` 函数按标签重新验证

### 4.3 配置选项组合

不同配置选项的组合效果:

| cache         | revalidate  | 行为                              |
| :------------ | :---------- | :-------------------------------- |
| `force-cache` | `undefined` | 永久缓存,不重新验证               |
| `force-cache` | `60`        | 缓存 60 秒后重新验证              |
| `force-cache` | `false`     | 永久缓存,不重新验证               |
| `no-store`    | `任意值`    | 不缓存,revalidate 被忽略          |
| `undefined`   | `60`        | Next.js 16: 不缓存(默认 no-store) |
| `undefined`   | `undefined` | Next.js 16: 不缓存(默认 no-store) |

```typescript
// 示例一: 永久缓存
const res1 = await fetch("https://api.example.com/static", {
  cache: "force-cache",
  // revalidate 默认为 false,永不重新验证
});

// 示例二: 定时重新验证
const res2 = await fetch("https://api.example.com/products", {
  cache: "force-cache",
  next: { revalidate: 3600 }, // 每小时重新验证
});

// 示例三: 不缓存
const res3 = await fetch("https://api.example.com/realtime", {
  cache: "no-store",
  // revalidate 会被忽略
});

// 示例四: 标签化缓存
const res4 = await fetch("https://api.example.com/users", {
  cache: "force-cache",
  next: {
    tags: ["users"],
    revalidate: 3600,
  },
});
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 最简单的 GET 请求

```typescript
// app/page.tsx
async function Page() {
  // ⚠️ Next.js 16: 默认不缓存
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();

  return <div>{JSON.stringify(data)}</div>;
}
```

#### 带缓存的 GET 请求

```typescript
// app/page.tsx
async function Page() {
  // 显式启用缓存
  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache",
  });
  const data = await res.json();

  return <div>{JSON.stringify(data)}</div>;
}
```

#### 带重新验证的请求

```typescript
// app/page.tsx
async function Page() {
  // 每5分钟重新验证一次
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 300 },
  });
  const data = await res.json();

  return <div>{JSON.stringify(data)}</div>;
}
```

#### POST 请求

```typescript
// app/actions.ts
"use server";

export async function createUser(formData: FormData) {
  const res = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.get("name"),
      email: formData.get("email"),
    }),
    // POST 请求通常不缓存
    cache: "no-store",
  });

  return await res.json();
}
```

### 5.2 进阶用法

#### 请求去重优化

利用 Next.js 的自动请求去重:

```typescript
// app/page.tsx
async function UserProfile({ userId }: { userId: string }) {
  // 这个请求会被去重
  const user = await fetch(`https://api.example.com/users/${userId}`);
  return await user.json();
}

async function UserPosts({ userId }: { userId: string }) {
  // 如果 userId 相同,这个请求会被去重
  const user = await fetch(`https://api.example.com/users/${userId}`);
  const userData = await user.json();

  const posts = await fetch(`https://api.example.com/users/${userId}/posts`);
  return await posts.json();
}

export default async function Page() {
  const userId = "123";

  return (
    <div>
      {/* 这两个组件中对同一用户的请求会被去重 */}
      <UserProfile userId={userId} />
      <UserPosts userId={userId} />
    </div>
  );
}
```

在这个例子中,虽然 `UserProfile` 和 `UserPosts` 都请求了同一个用户的数据,但实际上只会发起一次网络请求。

#### 错误处理

完善的错误处理机制:

```typescript
// app/page.tsx
async function Page() {
  try {
    const res = await fetch("https://api.example.com/data", {
      cache: "force-cache",
      next: { revalidate: 60 },
    });

    // 检查响应状态
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return <div>{JSON.stringify(data)}</div>;
  } catch (error) {
    console.error("获取数据失败:", error);

    // 返回错误状态
    return <div>数据加载失败</div>;
  }
}
```

更完善的错误处理:

```typescript
// lib/fetch-with-retry.ts
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);

      if (res.ok) {
        return res;
      }

      // 如果是 5xx 错误,重试
      if (res.status >= 500 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error("Max retries reached");
}

// 使用
async function Page() {
  const res = await fetchWithRetry("https://api.example.com/data", {
    cache: "force-cache",
  });
  const data = await res.json();

  return <div>{JSON.stringify(data)}</div>;
}
```

#### 请求超时控制

使用 AbortController 实现超时:

```typescript
// app/page.tsx
async function Page() {
  // 创建 AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

  try {
    const res = await fetch("https://api.example.com/data", {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    const data = await res.json();

    return <div>{JSON.stringify(data)}</div>;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return <div>请求超时</div>;
    }

    return <div>请求失败</div>;
  }
}
```

封装成可复用的函数:

```typescript
// lib/fetch-with-timeout.ts
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 使用
async function Page() {
  try {
    const res = await fetchWithTimeout(
      "https://api.example.com/data",
      { cache: "force-cache" },
      3000 // 3秒超时
    );

    const data = await res.json();
    return <div>{JSON.stringify(data)}</div>;
  } catch (error) {
    if (error.name === "AbortError") {
      return <div>请求超时</div>;
    }
    return <div>请求失败</div>;
  }
}
```

#### 条件请求

使用 ETag 实现条件请求:

```typescript
// app/page.tsx
async function Page() {
  // 第一次请求
  const res1 = await fetch("https://api.example.com/data", {
    cache: "force-cache",
  });

  const etag = res1.headers.get("ETag");
  const data1 = await res1.json();

  // 后续请求使用 ETag
  const res2 = await fetch("https://api.example.com/data", {
    headers: {
      "If-None-Match": etag || "",
    },
    cache: "no-store",
  });

  if (res2.status === 304) {
    // 数据未修改,使用缓存的数据
    return <div>{JSON.stringify(data1)}</div>;
  }

  const data2 = await res2.json();
  return <div>{JSON.stringify(data2)}</div>;
}
```

#### 并行请求

同时发起多个请求:

```typescript
// app/page.tsx
async function Page() {
  // 并行发起多个请求
  const [usersRes, postsRes, commentsRes] = await Promise.all([
    fetch("https://api.example.com/users", {
      cache: "force-cache",
      next: { revalidate: 3600 },
    }),
    fetch("https://api.example.com/posts", {
      cache: "force-cache",
      next: { revalidate: 1800 },
    }),
    fetch("https://api.example.com/comments", {
      cache: "force-cache",
      next: { revalidate: 900 },
    }),
  ]);

  const [users, posts, comments] = await Promise.all([
    usersRes.json(),
    postsRes.json(),
    commentsRes.json(),
  ]);

  return (
    <div>
      <div>用户数: {users.length}</div>
      <div>文章数: {posts.length}</div>
      <div>评论数: {comments.length}</div>
    </div>
  );
}
```

#### 依赖请求

一个请求依赖另一个请求的结果:

```typescript
// app/page.tsx
async function Page() {
  // 第一步: 获取用户信息
  const userRes = await fetch("https://api.example.com/user/me", {
    cache: "force-cache",
    next: { revalidate: 300 },
  });
  const user = await userRes.json();

  // 第二步: 根据用户ID获取文章
  const postsRes = await fetch(
    `https://api.example.com/users/${user.id}/posts`,
    {
      cache: "force-cache",
      next: { revalidate: 600 },
    }
  );
  const posts = await postsRes.json();

  // 第三步: 获取每篇文章的评论
  const commentsPromises = posts.map((post: any) =>
    fetch(`https://api.example.com/posts/${post.id}/comments`, {
      cache: "force-cache",
      next: { revalidate: 300 },
    }).then((res) => res.json())
  );

  const comments = await Promise.all(commentsPromises);

  return (
    <div>
      <h1>{user.name}的文章</h1>
      {posts.map((post: any, index: number) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>评论数: {comments[index].length}</p>
        </div>
      ))}
    </div>
  );
}
```

#### 流式响应处理

处理大文件或流式数据:

```typescript
// app/api/stream/route.ts
export async function GET() {
  const res = await fetch("https://api.example.com/large-file", {
    cache: "no-store",
  });

  // 直接返回流式响应
  return new Response(res.body, {
    headers: {
      "Content-Type":
        res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Length": res.headers.get("Content-Length") || "0",
    },
  });
}
```

手动处理流:

```typescript
// app/page.tsx
async function Page() {
  const res = await fetch("https://api.example.com/stream", {
    cache: "no-store",
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let result = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      result += decoder.decode(value, { stream: true });
    }
  }

  return <div>{result}</div>;
}
```

#### 自定义缓存键

通过请求头自定义缓存键:

```typescript
// app/page.tsx
async function Page({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = searchParams.lang || "en";

  // 通过请求头区分不同语言的缓存
  const res = await fetch("https://api.example.com/content", {
    headers: {
      "Accept-Language": lang,
    },
    cache: "force-cache",
    next: { revalidate: 3600 },
  });

  const data = await res.json();

  return <div>{data.content}</div>;
}
```

## 6. 注意事项

### 6.1 性能影响

#### 缓存策略选择不当

错误的缓存策略会严重影响性能:

```typescript
// ❌ 错误: 静态内容不缓存
async function Page() {
  // 每次都请求,浪费带宽和时间
  const res = await fetch("https://api.example.com/static-content", {
    cache: "no-store",
  });
  return <div>{await res.text()}</div>;
}

// ✅ 正确: 静态内容应该缓存
async function Page() {
  const res = await fetch("https://api.example.com/static-content", {
    cache: "force-cache",
  });
  return <div>{await res.text()}</div>;
}
```

```typescript
// ❌ 错误: 实时数据被缓存
async function Dashboard() {
  // 数据可能过期
  const res = await fetch("https://api.example.com/realtime-stats", {
    cache: "force-cache",
  });
  return <div>{await res.text()}</div>;
}

// ✅ 正确: 实时数据不应缓存
async function Dashboard() {
  const res = await fetch("https://api.example.com/realtime-stats", {
    cache: "no-store",
  });
  return <div>{await res.text()}</div>;
}
```

#### 过度使用请求

避免在循环中发起大量请求:

```typescript
// ❌ 错误: 循环中发起大量请求
async function Page() {
  const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const users = [];
  for (const id of userIds) {
    const res = await fetch(`https://api.example.com/users/${id}`);
    users.push(await res.json());
  }

  return <div>{JSON.stringify(users)}</div>;
}

// ✅ 正确: 批量请求或并行请求
async function Page() {
  const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 方案一: 批量请求
  const res = await fetch("https://api.example.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: userIds }),
    cache: "force-cache",
  });
  const users = await res.json();

  // 方案二: 并行请求
  const usersPromises = userIds.map((id) =>
    fetch(`https://api.example.com/users/${id}`, {
      cache: "force-cache",
    }).then((res) => res.json())
  );
  const users2 = await Promise.all(usersPromises);

  return <div>{JSON.stringify(users)}</div>;
}
```

#### 缓存过期时间设置

合理设置缓存过期时间:

| 数据类型 | 推荐过期时间   | 说明             |
| :------- | :------------- | :--------------- |
| 静态内容 | `false` (永久) | 博客文章、文档等 |
| 产品列表 | 3600-7200 秒   | 1-2 小时         |
| 用户信息 | 300-600 秒     | 5-10 分钟        |
| 实时数据 | `no-store`     | 不缓存           |
| 统计数据 | 60-300 秒      | 1-5 分钟         |

### 6.2 安全隐患

#### 敏感数据缓存

避免缓存敏感数据:

```typescript
// ❌ 错误: 缓存用户敏感信息
async function UserProfile() {
  const res = await fetch("https://api.example.com/user/profile", {
    cache: "force-cache", // 危险!
    next: { revalidate: 3600 },
  });

  const user = await res.json();
  return <div>{user.email}</div>;
}

// ✅ 正确: 不缓存敏感信息
async function UserProfile() {
  const res = await fetch("https://api.example.com/user/profile", {
    cache: "no-store", // 安全
  });

  const user = await res.json();
  return <div>{user.email}</div>;
}
```

#### CORS 问题

处理跨域请求:

```typescript
// app/api/proxy/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  // 验证 URL 是否在白名单中
  const allowedDomains = ["api.example.com", "data.example.com"];
  const urlObj = new URL(url);

  if (!allowedDomains.includes(urlObj.hostname)) {
    return Response.json({ error: "Domain not allowed" }, { status: 403 });
  }

  const res = await fetch(url, {
    cache: "no-store",
  });

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
```

#### 认证令牌处理

安全地处理认证令牌:

```typescript
// app/page.tsx
import { cookies } from "next/headers";

async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return <div>未登录</div>;
  }

  const res = await fetch("https://api.example.com/protected", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // 不缓存带认证的请求
  });

  const data = await res.json();
  return <div>{JSON.stringify(data)}</div>;
}
```

### 6.3 兼容性注意

#### Next.js 版本差异

不同版本的行为差异:

```typescript
// Next.js 15 及之前
const res = await fetch("https://api.example.com/data");
// 默认: cache: 'force-cache'

// Next.js 16
const res = await fetch("https://api.example.com/data");
// 默认: cache: 'no-store'
```

🔄 **Next.js 16 迁移**: 升级到 Next.js 16 时,需要检查所有 fetch 调用,显式添加 `cache: 'force-cache'` 以保持原有行为。

#### 浏览器环境限制

fetch 扩展只在服务端生效:

```typescript
// ❌ 错误: 在客户端组件中使用 Next.js 扩展
"use client";

export default function ClientComponent() {
  useEffect(() => {
    fetch("https://api.example.com/data", {
      next: { revalidate: 60 }, // 这个选项会被忽略
    });
  }, []);

  return <div>...</div>;
}

// ✅ 正确: 在服务端组件中使用
async function ServerComponent() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 }, // 这个选项会生效
  });

  return <div>...</div>;
}
```

### 6.4 调试技巧

#### 查看缓存状态

在开发环境中查看缓存状态:

```typescript
// app/page.tsx
async function Page() {
  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  // 查看响应头
  console.log("Cache-Control:", res.headers.get("Cache-Control"));
  console.log("Age:", res.headers.get("Age"));
  console.log("X-Next-Cache-Status:", res.headers.get("X-Next-Cache-Status"));

  const data = await res.json();
  return <div>{JSON.stringify(data)}</div>;
}
```

Next.js 添加的响应头:

| 响应头                | 值      | 说明       |
| :-------------------- | :------ | :--------- |
| `X-Next-Cache-Status` | `HIT`   | 命中缓存   |
| `X-Next-Cache-Status` | `MISS`  | 未命中缓存 |
| `X-Next-Cache-Status` | `STALE` | 缓存过期   |

#### 清除缓存

在开发环境中清除缓存:

```bash
# 删除 .next 目录
rm -rf .next

# 重新启动开发服务器
npm run dev
```

在生产环境中使用 revalidate API:

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const { path, tag } = await request.json();

  if (path) {
    revalidatePath(path);
  }

  if (tag) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true });
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: fetch 默认缓存策略是什么?

**问题**: Next.js 16 中 fetch 的默认缓存策略是什么?

**简短回答**: Next.js 16 中默认是 `no-store`,不缓存。

**详细解释**:

在 Next.js 16 之前,fetch 的默认缓存策略是 `force-cache`,会自动缓存所有请求。但在 Next.js 16 中,这个默认行为改为了 `no-store`,不再自动缓存。

这个变更的原因:

1. 更符合开发者的直觉,避免数据过期
2. 更安全,防止敏感数据被意外缓存
3. 更灵活,开发者可以根据需要显式启用缓存

**代码示例**:

```typescript
// Next.js 16
const res = await fetch("https://api.example.com/data");
// 等同于: cache: 'no-store'

// 如果需要缓存,必须显式指定
const res = await fetch("https://api.example.com/data", {
  cache: "force-cache",
});
```

#### 问题二: 如何在客户端组件中使用 fetch 缓存?

**问题**: 客户端组件中的 fetch 能使用 Next.js 的缓存扩展吗?

**简短回答**: 不能,Next.js 的 fetch 扩展只在服务端组件中生效。

**详细解释**:

Next.js 的 fetch 扩展(如 `next.revalidate`、`next.tags` 等)只在服务端环境中生效。在客户端组件中,fetch 是原生的浏览器 API,不会有 Next.js 的扩展功能。

如果需要在客户端缓存数据,可以使用:

1. React Query
2. SWR
3. 浏览器的 Cache API
4. localStorage/sessionStorage

**代码示例**:

```typescript
// ❌ 错误: 客户端组件中使用 Next.js 扩展
"use client";

export default function ClientComponent() {
  useEffect(() => {
    fetch("https://api.example.com/data", {
      next: { revalidate: 60 }, // 这个选项会被忽略
    });
  }, []);

  return <div>...</div>;
}

// ✅ 正确: 使用 SWR 在客户端缓存
("use client");
import useSWR from "swr";

export default function ClientComponent() {
  const { data } = useSWR(
    "https://api.example.com/data",
    fetcher,
    { refreshInterval: 60000 } // 60秒刷新一次
  );

  return <div>{JSON.stringify(data)}</div>;
}
```

#### 问题三: revalidate 和 cache 的关系是什么?

**问题**: `next.revalidate` 和 `cache` 参数有什么关系?

**简短回答**: `cache` 控制是否缓存,`revalidate` 控制缓存多久后重新验证。

**详细解释**:

- `cache: 'no-store'`: 不缓存,`revalidate` 会被忽略
- `cache: 'force-cache'` + `revalidate: undefined`: 永久缓存
- `cache: 'force-cache'` + `revalidate: 60`: 缓存 60 秒后重新验证
- `cache: 'force-cache'` + `revalidate: false`: 永久缓存

**代码示例**:

```typescript
// 不缓存
const res1 = await fetch("https://api.example.com/data", {
  cache: "no-store",
  // revalidate 会被忽略
});

// 永久缓存
const res2 = await fetch("https://api.example.com/data", {
  cache: "force-cache",
  // revalidate 默认为 false
});

// 定时重新验证
const res3 = await fetch("https://api.example.com/data", {
  cache: "force-cache",
  next: { revalidate: 60 },
});
```

### 7.2 进阶问题

#### 问题四: 如何实现请求去重?

**问题**: Next.js 如何实现请求去重?什么情况下会去重?

**简短回答**: 在同一渲染周期内,相同的 fetch 请求会自动去重。

**详细解释**:

Next.js 会在渲染周期内自动对相同的 fetch 请求进行去重。判断标准:

1. URL 完全相同
2. 请求方法相同
3. 在同一渲染周期内

这个去重是自动的,不需要额外配置。

**代码示例**:

```typescript
// app/page.tsx
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetch(`https://api.example.com/users/${userId}`);
  return await user.json();
}

async function UserPosts({ userId }: { userId: string }) {
  // 这个请求会被去重
  const user = await fetch(`https://api.example.com/users/${userId}`);
  const userData = await user.json();

  const posts = await fetch(`https://api.example.com/users/${userId}/posts`);
  return await posts.json();
}

export default async function Page() {
  const userId = "123";

  return (
    <div>
      {/* 对同一用户的请求只会发起一次 */}
      <UserProfile userId={userId} />
      <UserPosts userId={userId} />
    </div>
  );
}
```

#### 问题五: 如何处理大文件下载?

**问题**: 如何使用 fetch 下载大文件?

**简短回答**: 使用流式响应,避免一次性加载到内存。

**详细解释**:

对于大文件,应该使用流式响应,而不是一次性读取到内存。可以直接返回 Response 的 body,或者手动处理流。

**代码示例**:

```typescript
// app/api/download/route.ts
export async function GET() {
  const res = await fetch("https://api.example.com/large-file.zip", {
    cache: "no-store",
  });

  // 直接返回流式响应
  return new Response(res.body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="file.zip"',
      "Content-Length": res.headers.get("Content-Length") || "0",
    },
  });
}
```

#### 问题六: 如何实现请求重试?

**问题**: fetch 请求失败后如何自动重试?

**简短回答**: 封装一个带重试逻辑的 fetch 函数。

**详细解释**:

原生 fetch 不支持自动重试,需要自己实现。可以封装一个函数,在请求失败时自动重试。

**代码示例**:

```typescript
// lib/fetch-with-retry.ts
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  delay: number = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);

      if (res.ok) {
        return res;
      }

      // 5xx 错误重试
      if (res.status >= 500 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }

      throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw new Error("Max retries reached");
}
```

### 7.3 疑难杂症

#### 问题七: 为什么缓存没有生效?

**问题**: 设置了 `cache: 'force-cache'` 但缓存没有生效?

**可能原因**:

1. **在客户端组件中使用**: Next.js 扩展只在服务端生效
2. **使用了动态函数**: 如 `cookies()`、`headers()` 会使路由变为动态
3. **请求包含认证信息**: 带认证的请求可能不会被缓存
4. **开发环境**: 开发环境的缓存行为可能不同

**解决方案**:

```typescript
// 检查一: 确保在服务端组件中
async function ServerComponent() {
  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache",
  });
  return <div>...</div>;
}

// 检查二: 避免使用动态函数
async function Page() {
  // ❌ 使用了 cookies,路由变为动态
  const cookieStore = await cookies();

  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache", // 可能不会缓存
  });

  return <div>...</div>;
}

// 检查三: 查看响应头
async function Page() {
  const res = await fetch("https://api.example.com/data", {
    cache: "force-cache",
  });

  console.log("X-Next-Cache-Status:", res.headers.get("X-Next-Cache-Status"));

  return <div>...</div>;
}
```

#### 问题八: 如何在 Server Action 中使用 fetch?

**问题**: Server Action 中的 fetch 缓存行为是什么?

**简短回答**: Server Action 中的 fetch 默认不缓存,需要显式指定。

**详细解释**:

Server Action 通常用于处理表单提交等变更操作,所以 fetch 默认不缓存。如果需要缓存,必须显式指定。

**代码示例**:

```typescript
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  // 创建文章
  const res = await fetch("https://api.example.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: formData.get("title"),
      content: formData.get("content"),
    }),
    cache: "no-store", // 不缓存
  });

  const post = await res.json();

  // 重新验证文章列表缓存
  revalidateTag("posts");

  return post;
}

export async function getPosts() {
  // 获取文章列表,可以缓存
  const res = await fetch("https://api.example.com/posts", {
    cache: "force-cache",
    next: { tags: ["posts"], revalidate: 3600 },
  });

  return await res.json();
}
```

## 8. 总结

### 8.1 核心要点回顾

**fetch API 扩展的核心价值**:

1. **自动请求去重**: 同一渲染周期内相同请求只执行一次
2. **灵活的缓存控制**: 支持多种缓存策略和重新验证机制
3. **标签化缓存管理**: 通过标签实现精细化的缓存控制
4. **服务端优化**: 针对服务端环境的特殊优化

**Next.js 16 的重要变更**:

⚠️ **默认缓存策略改变**: 从 `force-cache` 改为 `no-store`

- 需要显式指定 `cache: 'force-cache'` 来启用缓存
- 更安全,避免敏感数据被意外缓存
- 更符合直觉,防止数据过期

**缓存策略选择**:

| 数据类型 | 推荐策略                     | 说明             |
| :------- | :--------------------------- | :--------------- |
| 静态内容 | `force-cache`                | 博客、文档等     |
| 定期更新 | `force-cache` + `revalidate` | 产品列表、新闻等 |
| 实时数据 | `no-store`                   | 仪表盘、统计等   |
| 用户数据 | `no-store`                   | 个人信息、订单等 |

### 8.2 关键收获

1. **理解默认行为**: Next.js 16 默认不缓存,需要显式启用
2. **掌握缓存策略**: 根据数据特性选择合适的缓存策略
3. **善用请求去重**: 利用自动去重优化性能
4. **注意安全问题**: 避免缓存敏感数据
5. **区分环境**: 服务端和客户端的 fetch 行为不同

### 8.3 最佳实践

1. **显式指定缓存策略**: 不要依赖默认行为
2. **使用标签管理缓存**: 方便按需重新验证
3. **合理设置过期时间**: 根据数据更新频率设置
4. **处理错误情况**: 实现重试和超时机制
5. **监控缓存状态**: 在开发环境中查看缓存命中率

### 8.4 下一步学习

- **服务端数据缓存策略**: 深入了解缓存机制
- **cacheLife 函数**: 更灵活的缓存生命周期管理
- **revalidateTag 函数**: 按需重新验证缓存
- **unstable_cache 函数**: 缓存任意数据

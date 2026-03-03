**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# unstable_cache 函数详解

## 1. 概述与背景

### 1.1 什么是 unstable_cache

`unstable_cache` 是 Next.js 16 提供的一个底层缓存函数,允许开发者手动控制函数的缓存行为。它可以将任何异步函数的结果缓存起来,并提供灵活的缓存配置选项。

`unstable_cache` 的核心特点:

- **函数级缓存**: 可以缓存任何异步函数的返回值
- **灵活配置**: 支持自定义缓存时间、标签等配置
- **跨请求共享**: 缓存在多个请求之间共享
- **手动控制**: 完全由开发者控制缓存的创建和失效

### 1.2 为什么需要 unstable_cache

在实际开发中,有些数据获取逻辑比较复杂,不适合直接使用 fetch API 的缓存。`unstable_cache` 提供了更底层的缓存控制能力:

- **复杂计算**: 缓存耗时的计算结果
- **数据库查询**: 缓存数据库查询结果
- **第三方 API**: 缓存第三方服务的响应
- **自定义逻辑**: 缓存任何自定义的异步操作

### 1.3 unstable_cache 的工作原理

`unstable_cache` 的工作流程:

1. **包装函数**: 使用 `unstable_cache` 包装需要缓存的异步函数
2. **生成缓存键**: 根据函数参数和配置生成唯一的缓存键
3. **检查缓存**: 调用时先检查是否有有效的缓存
4. **返回结果**: 如果有缓存则直接返回,否则执行函数并缓存结果
5. **失效机制**: 根据配置的时间或标签失效缓存

```typescript
import { unstable_cache } from "next/cache";

const getCachedData = unstable_cache(
  async (id: string) => {
    // 这个函数的结果会被缓存
    const data = await fetchData(id);
    return data;
  },
  ["data-cache"], // 缓存键前缀
  {
    revalidate: 3600, // 1小时后重新验证
    tags: ["data"], // 缓存标签
  }
);

async function fetchData(id: string) {
  return { id, content: "Data" };
}
```

## 2. 核心概念

### 2.1 基本用法

#### 简单缓存

```typescript
// app/lib/cache.ts
import { unstable_cache } from "next/cache";

// 缓存数据库查询
export const getCachedUser = unstable_cache(
  async (userId: string) => {
    console.log("Fetching user from database:", userId);
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    return user;
  },
  ["user"], // 缓存键前缀
  {
    revalidate: 60, // 60秒后重新验证
    tags: ["users"], // 缓存标签
  }
);

// 模拟数据库
const db = {
  user: {
    findUnique: async ({ where }: any) => {
      return { id: where.id, name: "User" };
    },
  },
};
```

#### 使用缓存函数

```typescript
// app/users/[id]/page.tsx
import { getCachedUser } from "@/lib/cache";

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getCachedUser(params.id);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>ID: {user.id}</p>
    </div>
  );
}
```

### 2.2 缓存键配置

#### 使用缓存键前缀

```typescript
import { unstable_cache } from "next/cache";

// 不同的缓存键前缀用于不同的数据
const getCachedPosts = unstable_cache(
  async () => {
    return await fetchPosts();
  },
  ["posts"], // 缓存键前缀
  { revalidate: 300 }
);

const getCachedComments = unstable_cache(
  async () => {
    return await fetchComments();
  },
  ["comments"], // 不同的缓存键前缀
  { revalidate: 300 }
);

async function fetchPosts() {
  return [];
}

async function fetchComments() {
  return [];
}
```

#### 动态缓存键

```typescript
import { unstable_cache } from "next/cache";

// 根据参数生成不同的缓存
const getCachedPost = unstable_cache(
  async (postId: string) => {
    return await fetchPost(postId);
  },
  ["post"], // 基础键
  { revalidate: 300 }
);

// 调用时会根据参数生成不同的缓存键
const post1 = await getCachedPost("1"); // 缓存键: post-1
const post2 = await getCachedPost("2"); // 缓存键: post-2

async function fetchPost(id: string) {
  return { id, title: "Post" };
}
```

### 2.3 缓存配置选项

#### revalidate 选项

```typescript
import { unstable_cache } from "next/cache";

// 设置重新验证时间
const getCachedData = unstable_cache(
  async () => {
    return await fetchData();
  },
  ["data"],
  {
    revalidate: 3600, // 3600秒(1小时)后重新验证
  }
);

// 不同的重新验证时间
const getShortCache = unstable_cache(
  async () => await fetchData(),
  ["short"],
  { revalidate: 60 } // 1分钟
);

const getLongCache = unstable_cache(
  async () => await fetchData(),
  ["long"],
  { revalidate: 86400 } // 24小时
);

async function fetchData() {
  return { timestamp: Date.now() };
}
```

#### tags 选项

```typescript
import { unstable_cache } from "next/cache";

// 使用标签管理缓存
const getCachedPosts = unstable_cache(
  async () => {
    return await fetchPosts();
  },
  ["posts"],
  {
    revalidate: 300,
    tags: ["posts", "content"], // 多个标签
  }
);

// 失效标签时,所有带该标签的缓存都会失效
import { revalidateTag } from "next/cache";

export async function createPost() {
  "use server";
  await savePost();
  revalidateTag("posts"); // 失效所有带 'posts' 标签的缓存
}

async function fetchPosts() {
  return [];
}

async function savePost() {
  console.log("Saving post");
}
```

## 3. 适用场景

### 3.1 数据库查询缓存

#### 用户数据缓存

```typescript
// lib/db-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedUser = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: true,
      },
    });
    return user;
  },
  ["user"],
  {
    revalidate: 300,
    tags: ["users"],
  }
);

export const getCachedUserPosts = unstable_cache(
  async (userId: string) => {
    const posts = await db.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
    });
    return posts;
  },
  ["user-posts"],
  {
    revalidate: 60,
    tags: ["posts", `user-${userId}-posts`],
  }
);

const db = {
  user: {
    findUnique: async ({ where, include }: any) => {
      return { id: where.id, name: "User", profile: {}, posts: [] };
    },
  },
  post: {
    findMany: async ({ where, orderBy }: any) => {
      return [];
    },
  },
};
```

#### 复杂查询缓存

```typescript
// lib/analytics-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedAnalytics = unstable_cache(
  async (startDate: string, endDate: string) => {
    // 复杂的分析查询
    const analytics = await db.query(
      `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount) as total
      FROM orders
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
    `,
      [startDate, endDate]
    );

    return analytics;
  },
  ["analytics"],
  {
    revalidate: 3600, // 1小时缓存
    tags: ["analytics", "orders"],
  }
);

const db = {
  query: async (sql: string, params: any[]) => {
    return [];
  },
};
```

### 3.2 第三方 API 缓存

#### 外部服务调用

```typescript
// lib/external-api-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedWeather = unstable_cache(
  async (city: string) => {
    const response = await fetch(
      `https://api.weather.com/v1/weather?city=${city}`,
      { cache: "no-store" }
    );
    const data = await response.json();
    return data;
  },
  ["weather"],
  {
    revalidate: 1800, // 30分钟
    tags: ["weather"],
  }
);

export const getCachedExchangeRate = unstable_cache(
  async (from: string, to: string) => {
    const response = await fetch(
      `https://api.exchange.com/rate?from=${from}&to=${to}`,
      { cache: "no-store" }
    );
    const data = await response.json();
    return data;
  },
  ["exchange-rate"],
  {
    revalidate: 300, // 5分钟
    tags: ["exchange"],
  }
);
```

#### CMS 内容缓存

```typescript
// lib/cms-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedCMSContent = unstable_cache(
  async (slug: string) => {
    const content = await cmsClient.getContent({
      contentType: "page",
      slug: slug,
    });
    return content;
  },
  ["cms-content"],
  {
    revalidate: 600, // 10分钟
    tags: ["cms", `page-${slug}`],
  }
);

export const getCachedBlogPosts = unstable_cache(
  async (limit: number = 10) => {
    const posts = await cmsClient.getPosts({
      limit: limit,
      orderBy: "publishedAt",
    });
    return posts;
  },
  ["cms-blog-posts"],
  {
    revalidate: 300,
    tags: ["cms", "blog"],
  }
);

const cmsClient = {
  getContent: async ({ contentType, slug }: any) => {
    return { slug, content: "Content" };
  },
  getPosts: async ({ limit, orderBy }: any) => {
    return [];
  },
};
```

### 3.3 计算密集型操作

#### 数据聚合

```typescript
// lib/aggregation-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedStatistics = unstable_cache(
  async () => {
    // 耗时的统计计算
    const users = await db.user.count();
    const posts = await db.post.count();
    const comments = await db.comment.count();

    const avgPostsPerUser = posts / users;
    const avgCommentsPerPost = comments / posts;

    return {
      totalUsers: users,
      totalPosts: posts,
      totalComments: comments,
      avgPostsPerUser,
      avgCommentsPerPost,
    };
  },
  ["statistics"],
  {
    revalidate: 3600, // 1小时更新一次
    tags: ["stats"],
  }
);

const db = {
  user: { count: async () => 100 },
  post: { count: async () => 500 },
  comment: { count: async () => 2000 },
};
```

#### 报表生成

```typescript
// lib/report-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedMonthlyReport = unstable_cache(
  async (year: number, month: number) => {
    // 生成月度报表
    const orders = await fetchMonthlyOrders(year, month);
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const avgOrderValue = revenue / orders.length;

    return {
      year,
      month,
      totalOrders: orders.length,
      totalRevenue: revenue,
      avgOrderValue,
    };
  },
  ["monthly-report"],
  {
    revalidate: 86400, // 24小时
    tags: ["reports"],
  }
);

async function fetchMonthlyOrders(year: number, month: number) {
  return [];
}
```

### 3.4 多数据源聚合

#### 组合多个数据源

```typescript
// lib/combined-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedDashboardData = unstable_cache(
  async (userId: string) => {
    // 从多个数据源获取数据
    const [user, posts, analytics, notifications] = await Promise.all([
      fetchUser(userId),
      fetchUserPosts(userId),
      fetchUserAnalytics(userId),
      fetchUserNotifications(userId),
    ]);

    return {
      user,
      posts,
      analytics,
      notifications,
    };
  },
  ["dashboard"],
  {
    revalidate: 300,
    tags: ["dashboard", `user-${userId}`],
  }
);

async function fetchUser(id: string) {
  return { id, name: "User" };
}

async function fetchUserPosts(id: string) {
  return [];
}

async function fetchUserAnalytics(id: string) {
  return { views: 0, likes: 0 };
}

async function fetchUserNotifications(id: string) {
  return [];
}
```

## 4. API 签名与配置

### 4.1 函数签名

```typescript
import { unstable_cache } from "next/cache";

function unstable_cache<T>(
  fn: (...args: any[]) => Promise<T>,
  keyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): (...args: any[]) => Promise<T>;
```

### 4.2 参数说明

#### fn 参数

```typescript
// fn: 需要缓存的异步函数
const cachedFn = unstable_cache(
  async (param1: string, param2: number) => {
    // 函数逻辑
    return { param1, param2 };
  },
  ["cache-key"]
);
```

#### keyParts 参数

```typescript
// keyParts: 缓存键的组成部分
const cachedFn = unstable_cache(
  async () => fetchData(),
  ["my", "cache", "key"], // 生成缓存键: my-cache-key
  { revalidate: 60 }
);

async function fetchData() {
  return { data: "value" };
}
```

#### options 参数

```typescript
// options: 缓存配置选项
const cachedFn = unstable_cache(async () => fetchData(), ["data"], {
  revalidate: 3600, // 重新验证时间(秒)
  tags: ["tag1", "tag2"], // 缓存标签
});
```

### 4.3 配置选项详解

#### revalidate 配置

```typescript
// revalidate: number - 设置重新验证时间(秒)
const cache1 = unstable_cache(
  async () => fetchData(),
  ["data"],
  { revalidate: 60 } // 60秒后重新验证
);

// revalidate: false - 永久缓存
const cache2 = unstable_cache(
  async () => fetchData(),
  ["data"],
  { revalidate: false } // 永不过期
);

// 不设置 revalidate - 使用默认值
const cache3 = unstable_cache(
  async () => fetchData(),
  ["data"]
  // 使用默认缓存策略
);
```

#### tags 配置

```typescript
// tags: string[] - 设置缓存标签
const cachedFn = unstable_cache(async (id: string) => fetchData(id), ["data"], {
  tags: ["data", `item-${id}`], // 多个标签
});

// 使用标签失效缓存
import { revalidateTag } from "next/cache";

export async function updateData() {
  "use server";
  await saveData();
  revalidateTag("data"); // 失效所有带 'data' 标签的缓存
}

async function saveData() {
  console.log("Saving");
}
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单数据缓存

```typescript
// lib/simple-cache.ts
import { unstable_cache } from "next/cache";

export const getConfig = unstable_cache(
  async () => {
    const config = await loadConfig();
    return config;
  },
  ["config"],
  { revalidate: 3600 }
);

async function loadConfig() {
  return {
    siteName: "My Site",
    theme: "dark",
  };
}
```

#### 带参数的缓存

```typescript
// lib/param-cache.ts
import { unstable_cache } from "next/cache";

export const getCachedProduct = unstable_cache(
  async (productId: string) => {
    const product = await fetchProduct(productId);
    return product;
  },
  ["product"],
  { revalidate: 600 }
);

async function fetchProduct(id: string) {
  return { id, name: "Product", price: 99.99 };
}

// 使用
const product1 = await getCachedProduct("1"); // 缓存键: product-1
const product2 = await getCachedProduct("2"); // 缓存键: product-2
```

### 5.2 进阶用法

#### 条件缓存

```typescript
// lib/conditional-cache.ts
import { unstable_cache } from "next/cache";

export function createConditionalCache<T>(
  fn: () => Promise<T>,
  shouldCache: boolean
) {
  if (shouldCache) {
    return unstable_cache(fn, ["conditional"], { revalidate: 300 });
  }
  return fn;
}

// 使用
const isDevelopment = process.env.NODE_ENV === "development";
const getData = createConditionalCache(
  async () => fetchData(),
  !isDevelopment // 只在生产环境缓存
);

async function fetchData() {
  return { data: "value" };
}
```

#### 动态配置缓存

```typescript
// lib/dynamic-cache.ts
import { unstable_cache } from "next/cache";

export function createDynamicCache<T>(
  fn: (...args: any[]) => Promise<T>,
  getCacheConfig: (...args: any[]) => {
    key: string[];
    revalidate: number;
    tags: string[];
  }
) {
  return async (...args: any[]) => {
    const config = getCacheConfig(...args);
    const cachedFn = unstable_cache(fn, config.key, {
      revalidate: config.revalidate,
      tags: config.tags,
    });
    return cachedFn(...args);
  };
}

// 使用
const getCachedData = createDynamicCache(
  async (type: string, id: string) => {
    return await fetchData(type, id);
  },
  (type: string, id: string) => ({
    key: [type, id],
    revalidate: type === "static" ? 3600 : 60,
    tags: [type, `${type}-${id}`],
  })
);

async function fetchData(type: string, id: string) {
  return { type, id, data: "value" };
}
```

#### 嵌套缓存

```typescript
// lib/nested-cache.ts
import { unstable_cache } from "next/cache";

// 第一层缓存: 用户数据
const getCachedUser = unstable_cache(
  async (userId: string) => {
    return await fetchUser(userId);
  },
  ["user"],
  { revalidate: 300, tags: ["users"] }
);

// 第二层缓存: 用户文章
const getCachedUserPosts = unstable_cache(
  async (userId: string) => {
    const user = await getCachedUser(userId); // 使用第一层缓存
    const posts = await fetchPosts(userId);
    return { user, posts };
  },
  ["user-posts"],
  { revalidate: 60, tags: ["posts"] }
);

async function fetchUser(id: string) {
  return { id, name: "User" };
}

async function fetchPosts(userId: string) {
  return [];
}
```

#### 缓存工厂函数

```typescript
// lib/cache-factory.ts
import { unstable_cache } from "next/cache";

export function createCacheFactory(baseKey: string, baseRevalidate: number) {
  return function createCache<T>(
    fn: (...args: any[]) => Promise<T>,
    subKey: string,
    options?: {
      revalidate?: number;
      tags?: string[];
    }
  ) {
    return unstable_cache(fn, [baseKey, subKey], {
      revalidate: options?.revalidate ?? baseRevalidate,
      tags: options?.tags ?? [baseKey],
    });
  };
}

// 使用
const createUserCache = createCacheFactory("user", 300);

const getCachedUserProfile = createUserCache(
  async (userId: string) => fetchUserProfile(userId),
  "profile",
  { tags: ["users", "profiles"] }
);

const getCachedUserSettings = createUserCache(
  async (userId: string) => fetchUserSettings(userId),
  "settings",
  { revalidate: 600 }
);

async function fetchUserProfile(id: string) {
  return { id, bio: "Bio" };
}

async function fetchUserSettings(id: string) {
  return { id, theme: "dark" };
}
```

## 6. 注意事项

### 6.1 缓存键管理

#### 避免缓存键冲突

```typescript
// ❌ 不好: 可能产生键冲突
const cache1 = unstable_cache(
  async (id: string) => fetchData(id),
  ["data"] // 所有调用共享同一个键
);

// ✅ 好: 使用唯一的键前缀
const cache1 = unstable_cache(
  async (id: string) => fetchData(id),
  ["user-data"] // 明确的键前缀
);

const cache2 = unstable_cache(
  async (id: string) => fetchData(id),
  ["product-data"] // 不同的键前缀
);

async function fetchData(id: string) {
  return { id };
}
```

#### 参数序列化

```typescript
// 注意: 函数参数会被序列化为缓存键的一部分
const cachedFn = unstable_cache(
  async (obj: { id: string; name: string }) => {
    return obj;
  },
  ["object-cache"]
);

// 相同的对象内容会产生相同的缓存键
await cachedFn({ id: "1", name: "A" }); // 缓存
await cachedFn({ id: "1", name: "A" }); // 使用缓存

// 不同的对象内容会产生不同的缓存键
await cachedFn({ id: "2", name: "B" }); // 新缓存
```

### 6.2 性能考虑

#### 避免过度缓存

```typescript
// ❌ 不好: 缓存频繁变化的数据
const getCachedRealTimeData = unstable_cache(
  async () => fetchRealTimeData(),
  ["realtime"],
  { revalidate: 1 } // 1秒就过期,缓存意义不大
);

// ✅ 好: 只缓存相对稳定的数据
const getCachedStaticData = unstable_cache(
  async () => fetchStaticData(),
  ["static"],
  { revalidate: 3600 } // 1小时,适合缓存
);

async function fetchRealTimeData() {
  return { timestamp: Date.now() };
}

async function fetchStaticData() {
  return { config: "value" };
}
```

#### 控制缓存大小

```typescript
// ❌ 不好: 缓存大量数据
const getCachedLargeData = unstable_cache(async () => {
  const data = await fetchAllRecords(); // 可能有数百万条记录
  return data;
}, ["large-data"]);

// ✅ 好: 分页缓存
const getCachedPageData = unstable_cache(
  async (page: number, limit: number) => {
    const data = await fetchRecords(page, limit);
    return data;
  },
  ["page-data"],
  { revalidate: 300 }
);

async function fetchAllRecords() {
  return [];
}

async function fetchRecords(page: number, limit: number) {
  return [];
}
```

### 6.3 错误处理

#### 缓存错误响应

```typescript
// ❌ 不好: 缓存错误结果
const getCachedData = unstable_cache(
  async (id: string) => {
    try {
      return await fetchData(id);
    } catch (error) {
      return null; // 错误也被缓存了
    }
  },
  ["data"]
);

// ✅ 好: 不缓存错误
const getCachedData2 = unstable_cache(
  async (id: string) => {
    const data = await fetchData(id); // 让错误抛出
    return data;
  },
  ["data"]
);

async function fetchData(id: string) {
  if (Math.random() > 0.5) {
    throw new Error("Failed");
  }
  return { id };
}
```

#### 处理缓存失败

```typescript
// 带降级策略的缓存
async function getDataWithFallback(id: string) {
  try {
    const cachedFn = unstable_cache(
      async (id: string) => fetchData(id),
      ["data"],
      { revalidate: 300 }
    );
    return await cachedFn(id);
  } catch (error) {
    console.error("Cache failed:", error);
    // 降级到直接获取
    return await fetchData(id);
  }
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: unstable_cache 和 fetch 缓存有什么区别?

**问题**: 什么时候用 `unstable_cache`,什么时候用 `fetch` 缓存?

**简短回答**: `fetch` 用于 HTTP 请求,`unstable_cache` 用于任何异步操作。

**详细解释**:

`fetch` 的缓存是专门为 HTTP 请求设计的,而 `unstable_cache` 可以缓存任何异步函数的结果,包括数据库查询、复杂计算等。

**对比表格**:

| 特性       | fetch 缓存 | unstable_cache |
| :--------- | :--------- | :------------- |
| 适用范围   | HTTP 请求  | 任何异步操作   |
| 配置方式   | fetch 选项 | 函数包装       |
| 灵活性     | 低         | 高             |
| 使用复杂度 | 简单       | 中等           |

**代码示例**:

```typescript
// 使用 fetch 缓存
async function getDataWithFetch() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 },
  });
  return res.json();
}

// 使用 unstable_cache
const getDataWithCache = unstable_cache(
  async () => {
    // 可以是任何异步操作
    const data = await db.query("SELECT * FROM data");
    return data;
  },
  ["data"],
  { revalidate: 3600 }
);

const db = {
  query: async (sql: string) => [],
};
```

#### 问题二: 缓存键是如何生成的?

**问题**: `unstable_cache` 如何根据参数生成缓存键?

**简短回答**: 缓存键由 keyParts 和函数参数组合生成。

**详细解释**:

Next.js 会将 keyParts 和函数参数序列化后组合成唯一的缓存键。相同的 keyParts 和参数会产生相同的缓存键。

**代码示例**:

```typescript
const cachedFn = unstable_cache(
  async (id: string, type: string) => {
    return { id, type };
  },
  ["my-cache"]
);

// 不同的参数产生不同的缓存键
await cachedFn("1", "A"); // 缓存键: my-cache-1-A
await cachedFn("1", "B"); // 缓存键: my-cache-1-B
await cachedFn("2", "A"); // 缓存键: my-cache-2-A
```

#### 问题三: revalidate 设置为 false 会怎样?

**问题**: 设置 `revalidate: false` 后缓存会永久存在吗?

**简短回答**: 缓存会一直存在,直到手动失效或重启服务器。

**详细解释**:

设置 `revalidate: false` 后,缓存不会自动过期,但可以通过 `revalidateTag` 或 `revalidatePath` 手动失效。

**代码示例**:

```typescript
// 永久缓存
const getCachedStaticData = unstable_cache(
  async () => fetchStaticData(),
  ["static"],
  { revalidate: false } // 永不自动过期
);

// 手动失效
import { revalidateTag } from "next/cache";

export async function updateStaticData() {
  "use server";
  await saveData();
  revalidateTag("static"); // 手动失效缓存
}

async function fetchStaticData() {
  return { data: "static" };
}

async function saveData() {
  console.log("Saving");
}
```

### 7.2 进阶问题

#### 问题四: 如何调试缓存行为?

**问题**: 怎样确认缓存是否正常工作?

**简短回答**: 在函数中添加日志,观察是否重复执行。

**详细解释**:

在被缓存的函数中添加 console.log,如果缓存工作正常,相同参数的调用不会重复执行函数。

**代码示例**:

```typescript
const getCachedData = unstable_cache(
  async (id: string) => {
    console.log("Fetching data for:", id, "at", new Date().toISOString());
    const data = await fetchData(id);
    return data;
  },
  ["debug-cache"],
  { revalidate: 60 }
);

// 第一次调用 - 会打印日志
await getCachedData("1");

// 60秒内再次调用 - 不会打印日志(使用缓存)
await getCachedData("1");

async function fetchData(id: string) {
  return { id, data: "value" };
}
```

#### 问题五: 可以在客户端组件中使用吗?

**问题**: `unstable_cache` 可以在客户端组件中使用吗?

**简短回答**: 不可以,只能在服务端使用。

**详细解释**:

`unstable_cache` 是服务端缓存机制,只能在服务端组件、Server Actions 或 API 路由中使用。客户端需要使用其他缓存方案如 SWR 或 React Query。

**代码示例**:

```typescript
// ✅ 正确: 在服务端组件中使用
export default async function ServerComponent() {
  const data = await getCachedData();
  return <div>{data}</div>;
}

// ✅ 正确: 在 Server Action 中使用
export async function serverAction() {
  "use server";
  const data = await getCachedData();
  return data;
}

// ❌ 错误: 在客户端组件中使用
("use client");
export default function ClientComponent() {
  // 不能在这里使用 unstable_cache
  return <div>Client</div>;
}

const getCachedData = unstable_cache(async () => ({ data: "value" }), ["data"]);
```

## 8. 总结

### 8.1 核心要点回顾

**unstable_cache 的主要特点**:

- 可以缓存任何异步函数的结果
- 提供灵活的缓存配置选项
- 支持标签化管理和失效
- 适合数据库查询、第三方 API 等场景

**使用流程**:

1. 使用 `unstable_cache` 包装异步函数
2. 配置缓存键、重新验证时间和标签
3. 调用缓存函数获取数据
4. 需要时使用 `revalidateTag` 失效缓存

### 8.2 关键收获

1. **灵活缓存**: 可以缓存任何异步操作,不限于 HTTP 请求
2. **精确控制**: 完全控制缓存的创建、配置和失效
3. **性能优化**: 减少重复计算和数据库查询
4. **标签管理**: 使用标签批量管理相关缓存
5. **类型安全**: 完整的 TypeScript 类型支持

### 8.3 最佳实践

1. **合理设置重新验证时间**: 根据数据更新频率设置合适的 revalidate 值
2. **使用描述性缓存键**: 缓存键应该清晰表达缓存的内容
3. **添加缓存标签**: 使用标签方便批量管理相关缓存
4. **避免缓存错误**: 让错误抛出而不是缓存错误结果
5. **控制缓存大小**: 避免缓存过大的数据集

### 8.4 下一步学习

- **unstable_noStore**: 学习如何禁用缓存
- **revalidateTag**: 深入了解标签失效机制
- **cacheLife**: 了解缓存生命周期配置
- **数据获取模式**: 掌握完整的数据获取策略

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# cacheLife 函数详解

## 1. 概述与背景

### 1.1 什么是 cacheLife

`cacheLife` 是 Next.js 16 引入的一个新的缓存配置函数,用于定义缓存的生命周期策略。它允许开发者为不同类型的数据设置不同的缓存时间和重新验证策略,提供了比传统 `revalidate` 选项更灵活和强大的缓存控制能力。

`cacheLife` 的核心特点:

- **预定义配置**: 提供多种预设的缓存策略(如 'default', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max')
- **自定义配置**: 支持完全自定义的缓存时间和重新验证策略
- **类型安全**: 完整的 TypeScript 类型支持
- **灵活控制**: 可以针对不同的数据源使用不同的缓存策略

### 1.2 为什么需要 cacheLife

在传统的 Next.js 缓存中,`revalidate` 选项只能设置一个简单的秒数。`cacheLife` 提供了更丰富的缓存控制:

- **语义化配置**: 使用 'hours', 'days' 等语义化的配置名称,代码更易读
- **统一管理**: 可以在一个地方定义多种缓存策略,然后在整个应用中复用
- **精细控制**: 支持设置 stale 时间、revalidate 时间等多个参数
- **性能优化**: 通过合理的缓存策略,减少不必要的数据获取

### 1.3 cacheLife 的工作原理

`cacheLife` 定义了数据在缓存中的生命周期:

1. **Fresh 阶段**: 数据是新鲜的,直接从缓存返回
2. **Stale 阶段**: 数据过期但仍可用,返回缓存数据同时在后台重新验证
3. **Expired 阶段**: 数据完全过期,必须重新获取

```typescript
cacheLife({
  stale: 60, // 60秒内数据是新鲜的
  revalidate: 300, // 300秒后数据过期,需要重新验证
  expire: 3600, // 3600秒后数据完全过期
});
```

## 2. 核心概念

### 2.1 基本用法

#### 使用预定义配置

```typescript
// app/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function Page() {
  "use cache";
  cacheLife("hours");

  const data = await fetchData();

  return (
    <div>
      <h1>Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

async function fetchData() {
  const res = await fetch("https://api.example.com/data");
  return res.json();
}
```

#### 使用自定义配置

```typescript
// app/custom-cache/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function CustomCachePage() {
  "use cache";
  cacheLife({
    stale: 60, // 60秒内是新鲜的
    revalidate: 300, // 300秒后重新验证
    expire: 3600, // 3600秒后过期
  });

  const data = await fetchData();

  return <div>{data.content}</div>;
}

async function fetchData() {
  return { content: "Cached content" };
}
```

### 2.2 预定义的缓存策略

#### 常用预设

```typescript
// 'default' - 默认缓存策略
cacheLife("default");
// 等同于: { stale: 300, revalidate: 900, expire: Infinity }

// 'seconds' - 秒级缓存
cacheLife("seconds");
// 等同于: { stale: 1, revalidate: 10, expire: 60 }

// 'minutes' - 分钟级缓存
cacheLife("minutes");
// 等同于: { stale: 60, revalidate: 300, expire: 3600 }

// 'hours' - 小时级缓存
cacheLife("hours");
// 等同于: { stale: 300, revalidate: 3600, expire: 86400 }

// 'days' - 天级缓存
cacheLife("days");
// 等同于: { stale: 3600, revalidate: 86400, expire: 604800 }

// 'weeks' - 周级缓存
cacheLife("weeks");
// 等同于: { stale: 86400, revalidate: 604800, expire: 2592000 }

// 'max' - 最大缓存
cacheLife("max");
// 等同于: { stale: Infinity, revalidate: Infinity, expire: Infinity }
```

#### 预设使用示例

```typescript
// app/news/page.tsx - 新闻页面,使用分钟级缓存
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function NewsPage() {
  "use cache";
  cacheLife("minutes");

  const news = await fetchNews();

  return (
    <div>
      <h1>Latest News</h1>
      {news.map((item) => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.content}</p>
        </article>
      ))}
    </div>
  );
}

async function fetchNews() {
  const res = await fetch("https://api.example.com/news");
  return res.json();
}

// app/static-content/page.tsx - 静态内容,使用天级缓存
export default async function StaticContentPage() {
  "use cache";
  cacheLife("days");

  const content = await fetchStaticContent();

  return <div>{content}</div>;
}

async function fetchStaticContent() {
  return "Static content that rarely changes";
}
```

### 2.3 自定义缓存配置

#### 完整配置选项

```typescript
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function Page() {
  "use cache";
  cacheLife({
    // stale: 数据保持新鲜的时间(秒)
    stale: 60,

    // revalidate: 数据需要重新验证的时间(秒)
    revalidate: 300,

    // expire: 数据完全过期的时间(秒)
    expire: 3600,
  });

  const data = await fetchData();
  return <div>{data}</div>;
}

async function fetchData() {
  return "Data";
}
```

#### 不同场景的配置

```typescript
// 实时数据 - 短缓存
cacheLife({
  stale: 5,
  revalidate: 30,
  expire: 60,
});

// 准实时数据 - 中等缓存
cacheLife({
  stale: 60,
  revalidate: 300,
  expire: 3600,
});

// 静态数据 - 长缓存
cacheLife({
  stale: 3600,
  revalidate: 86400,
  expire: 604800,
});

// 永久缓存 - 不过期
cacheLife({
  stale: Infinity,
  revalidate: Infinity,
  expire: Infinity,
});
```

## 3. 适用场景

### 3.1 不同类型数据的缓存策略

#### 新闻和动态内容

```typescript
// app/news/latest/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function LatestNewsPage() {
  "use cache";
  // 新闻内容使用分钟级缓存
  cacheLife("minutes");

  const news = await fetchLatestNews();

  return (
    <div>
      <h1>Breaking News</h1>
      {news.map((item) => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <time>{item.publishedAt}</time>
          <p>{item.summary}</p>
        </article>
      ))}
    </div>
  );
}

async function fetchLatestNews() {
  const res = await fetch("https://api.example.com/news/latest");
  return res.json();
}
```

#### 产品目录和价格

```typescript
// app/products/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function ProductsPage() {
  "use cache";
  // 产品目录使用小时级缓存
  cacheLife("hours");

  const products = await fetchProducts();

  return (
    <div>
      <h1>Products</h1>
      <div className="grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p className="price">${product.price}</p>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function fetchProducts() {
  const res = await fetch("https://api.example.com/products");
  return res.json();
}
```

#### 用户生成内容

```typescript
// app/comments/[postId]/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function CommentsPage({
  params,
}: {
  params: { postId: string };
}) {
  "use cache";
  // 评论使用秒级缓存,保持较新
  cacheLife("seconds");

  const comments = await fetchComments(params.postId);

  return (
    <div>
      <h1>Comments</h1>
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <p className="author">{comment.author}</p>
          <p className="content">{comment.content}</p>
          <time>{comment.createdAt}</time>
        </div>
      ))}
    </div>
  );
}

async function fetchComments(postId: string) {
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`);
  return res.json();
}
```

### 3.2 API 响应缓存

#### 公共 API 端点

```typescript
// app/api/public-data/route.ts
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function GET() {
  "use cache";
  cacheLife("hours");

  const data = await fetchPublicData();

  return Response.json(data);
}

async function fetchPublicData() {
  return {
    message: "Public data",
    timestamp: new Date().toISOString(),
  };
}
```

#### 用户特定数据

```typescript
// app/api/user/[id]/route.ts
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  "use cache";
  // 用户数据使用较短的缓存
  cacheLife({
    stale: 30,
    revalidate: 120,
    expire: 300,
  });

  const userData = await fetchUserData(params.id);

  return Response.json(userData);
}

async function fetchUserData(id: string) {
  return {
    id,
    name: "User Name",
    email: "user@example.com",
  };
}
```

### 3.3 组件级缓存

#### 可复用组件

```typescript
// components/PopularPosts.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function PopularPosts() {
  "use cache";
  cacheLife("hours");

  const posts = await fetchPopularPosts();

  return (
    <aside className="popular-posts">
      <h2>Popular Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

async function fetchPopularPosts() {
  const res = await fetch("https://api.example.com/posts/popular");
  return res.json();
}
```

#### 导航菜单

```typescript
// components/Navigation.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function Navigation() {
  "use cache";
  // 导航菜单很少变化,使用天级缓存
  cacheLife("days");

  const menuItems = await fetchMenuItems();

  return (
    <nav>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <a href={item.url}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

async function fetchMenuItems() {
  return [
    { id: "1", label: "Home", url: "/" },
    { id: "2", label: "About", url: "/about" },
    { id: "3", label: "Contact", url: "/contact" },
  ];
}
```

### 3.4 混合缓存策略

#### 页面不同部分使用不同策略

```typescript
// app/dashboard/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function DashboardPage() {
  return (
    <div>
      <RealtimeStats />
      <DailyReport />
      <StaticInfo />
    </div>
  );
}

// 实时统计 - 秒级缓存
async function RealtimeStats() {
  "use cache";
  cacheLife("seconds");

  const stats = await fetchRealtimeStats();

  return (
    <div className="realtime-stats">
      <h2>Realtime Statistics</h2>
      <p>Active Users: {stats.activeUsers}</p>
      <p>Requests/sec: {stats.requestsPerSecond}</p>
    </div>
  );
}

// 每日报告 - 小时级缓存
async function DailyReport() {
  "use cache";
  cacheLife("hours");

  const report = await fetchDailyReport();

  return (
    <div className="daily-report">
      <h2>Daily Report</h2>
      <p>Total Sales: ${report.totalSales}</p>
      <p>New Users: {report.newUsers}</p>
    </div>
  );
}

// 静态信息 - 天级缓存
async function StaticInfo() {
  "use cache";
  cacheLife("days");

  const info = await fetchStaticInfo();

  return (
    <div className="static-info">
      <h2>Company Info</h2>
      <p>{info.description}</p>
    </div>
  );
}

async function fetchRealtimeStats() {
  return { activeUsers: 1234, requestsPerSecond: 56 };
}

async function fetchDailyReport() {
  return { totalSales: 12345, newUsers: 234 };
}

async function fetchStaticInfo() {
  return { description: "Company description" };
}
```

## 4. API 签名与配置

### 4.1 函数签名

```typescript
import { unstable_cacheLife as cacheLife } from "next/cache";

// 使用预定义配置
function cacheLife(profile: CacheLifeProfile): void;

// 使用自定义配置
function cacheLife(config: CacheLifeConfig): void;

// 类型定义
type CacheLifeProfile =
  | "default"
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "max";

interface CacheLifeConfig {
  stale?: number; // 数据保持新鲜的时间(秒)
  revalidate?: number; // 数据需要重新验证的时间(秒)
  expire?: number; // 数据完全过期的时间(秒)
}
```

### 4.2 配置参数详解

#### stale 参数

```typescript
// stale: 数据保持新鲜的时间
cacheLife({
  stale: 60, // 60秒内,数据被认为是新鲜的,直接从缓存返回
});

// 在 stale 时间内:
// - 请求直接返回缓存数据
// - 不会触发重新验证
// - 性能最优
```

#### revalidate 参数

```typescript
// revalidate: 数据需要重新验证的时间
cacheLife({
  stale: 60,
  revalidate: 300, // 300秒后,数据需要重新验证
});

// 在 stale 到 revalidate 之间:
// - 返回缓存数据(stale-while-revalidate)
// - 同时在后台触发重新验证
// - 下次请求会得到新数据
```

#### expire 参数

```typescript
// expire: 数据完全过期的时间
cacheLife({
  stale: 60,
  revalidate: 300,
  expire: 3600, // 3600秒后,数据完全过期
});

// 超过 expire 时间:
// - 缓存数据被丢弃
// - 必须重新获取数据
// - 请求会等待新数据
```

### 4.3 预定义配置详情

```typescript
// 所有预定义配置的具体值

const profiles = {
  default: {
    stale: 300, // 5分钟
    revalidate: 900, // 15分钟
    expire: Infinity, // 永不过期
  },

  seconds: {
    stale: 1, // 1秒
    revalidate: 10, // 10秒
    expire: 60, // 1分钟
  },

  minutes: {
    stale: 60, // 1分钟
    revalidate: 300, // 5分钟
    expire: 3600, // 1小时
  },

  hours: {
    stale: 300, // 5分钟
    revalidate: 3600, // 1小时
    expire: 86400, // 1天
  },

  days: {
    stale: 3600, // 1小时
    revalidate: 86400, // 1天
    expire: 604800, // 1周
  },

  weeks: {
    stale: 86400, // 1天
    revalidate: 604800, // 1周
    expire: 2592000, // 30天
  },

  max: {
    stale: Infinity,
    revalidate: Infinity,
    expire: Infinity,
  },
};
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单页面缓存

```typescript
// app/simple/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function SimplePage() {
  "use cache";
  cacheLife("hours");

  const data = await fetchData();

  return (
    <div>
      <h1>Simple Page</h1>
      <p>{data.content}</p>
    </div>
  );
}

async function fetchData() {
  return { content: "Page content" };
}
```

#### 组件缓存

```typescript
// components/CachedComponent.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export async function CachedComponent() {
  "use cache";
  cacheLife("minutes");

  const data = await fetchComponentData();

  return (
    <div>
      <h2>Cached Component</h2>
      <p>{data}</p>
    </div>
  );
}

async function fetchComponentData() {
  return "Component data";
}
```

### 5.2 进阶用法

#### 动态缓存策略

```typescript
// app/dynamic-cache/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function DynamicCachePage({
  searchParams,
}: {
  searchParams: { priority?: string };
}) {
  "use cache";

  // 根据优先级选择不同的缓存策略
  const priority = searchParams.priority || "normal";

  if (priority === "high") {
    cacheLife("seconds");
  } else if (priority === "low") {
    cacheLife("days");
  } else {
    cacheLife("hours");
  }

  const data = await fetchData(priority);

  return (
    <div>
      <h1>Priority: {priority}</h1>
      <p>{data.content}</p>
    </div>
  );
}

async function fetchData(priority: string) {
  return { content: `Data with ${priority} priority` };
}
```

#### 条件缓存

```typescript
// app/conditional/page.tsx
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function ConditionalPage({
  searchParams,
}: {
  searchParams: { cache?: string };
}) {
  "use cache";

  // 根据查询参数决定是否使用缓存
  if (searchParams.cache !== "false") {
    cacheLife("hours");
  }

  const data = await fetchData();

  return <div>{data.content}</div>;
}

async function fetchData() {
  return { content: "Data" };
}
```

## 6. 注意事项

### 6.1 使用限制

#### 必须配合 'use cache' 使用

```typescript
// ❌ 错误: 没有 'use cache' 指令
export default async function Page() {
  cacheLife("hours"); // 不会生效
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ 正确: 使用 'use cache' 指令
export default async function Page() {
  "use cache";
  cacheLife("hours");
  const data = await fetchData();
  return <div>{data}</div>;
}

async function fetchData() {
  return "data";
}
```

#### 只能在服务端使用

```typescript
// ❌ 错误: 在客户端组件中使用
"use client";

import { unstable_cacheLife as cacheLife } from "next/cache";

export default function ClientComponent() {
  cacheLife("hours"); // 错误!
  return <div>Client Component</div>;
}

// ✅ 正确: 在服务端组件中使用
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function ServerComponent() {
  "use cache";
  cacheLife("hours");
  return <div>Server Component</div>;
}
```

### 6.2 性能考虑

#### 选择合适的缓存时间

```typescript
// ❌ 不好: 所有数据都使用相同的长缓存
cacheLife("days"); // 可能导致数据过时

// ✅ 好: 根据数据特性选择合适的缓存时间
// 实时数据
cacheLife("seconds");

// 准实时数据
cacheLife("minutes");

// 相对稳定的数据
cacheLife("hours");

// 很少变化的数据
cacheLife("days");
```

#### 避免过度缓存

```typescript
// ❌ 不好: 用户特定数据使用长缓存
export default async function UserProfile({ userId }: { userId: string }) {
  "use cache";
  cacheLife("days"); // 用户数据可能经常变化

  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
}

// ✅ 好: 用户数据使用较短的缓存
export default async function UserProfile({ userId }: { userId: string }) {
  "use cache";
  cacheLife("minutes"); // 或使用自定义配置

  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
}

async function fetchUser(id: string) {
  return { name: "User" };
}
```

### 6.3 缓存失效

#### 手动失效缓存

```typescript
// 使用 revalidatePath 或 revalidateTag 手动失效缓存
import { revalidatePath } from "next/cache";

export async function updateData() {
  // 更新数据
  await saveData();

  // 失效相关页面的缓存
  revalidatePath("/data");
}

async function saveData() {
  // 保存数据逻辑
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: cacheLife 和 revalidate 有什么区别?

**问题**: `cacheLife` 和传统的 `revalidate` 选项有什么不同?

**简短回答**: `cacheLife` 提供更细粒度的缓存控制,支持多个时间参数。

**详细解释**:

传统的 `revalidate` 只能设置一个重新验证时间。`cacheLife` 提供了 `stale`、`revalidate`、`expire` 三个参数,可以更精确地控制缓存行为。

**代码示例**:

```typescript
// 传统方式
export const revalidate = 3600; // 1小时后重新验证

// 使用 cacheLife
export default async function Page() {
  "use cache";
  cacheLife({
    stale: 300, // 5分钟内是新鲜的
    revalidate: 3600, // 1小时后重新验证
    expire: 86400, // 1天后过期
  });

  const data = await fetchData();
  return <div>{data}</div>;
}

async function fetchData() {
  return "data";
}
```

#### 问题二: 如何选择合适的缓存策略?

**问题**: 应该如何为不同类型的数据选择缓存策略?

**简短回答**: 根据数据的更新频率和重要性选择。

**详细解释**:

数据更新越频繁,缓存时间应该越短。关键数据应该使用较短的缓存,确保及时性。

**缓存策略选择指南**:

| 数据类型     | 推荐策略 | 说明               |
| :----------- | :------- | :----------------- |
| 实时数据     | seconds  | 股票价格、实时统计 |
| 用户生成内容 | minutes  | 评论、帖子         |
| 产品信息     | hours    | 商品列表、价格     |
| 静态内容     | days     | 关于页面、帮助文档 |
| 配置数据     | weeks    | 网站配置、菜单     |

#### 问题三: cacheLife 会影响所有请求吗?

**问题**: 设置 `cacheLife` 后,是否会影响页面中的所有数据请求?

**简短回答**: 只影响当前组件或页面的缓存。

**详细解释**:

`cacheLife` 的作用域是当前使用 `'use cache'` 指令的组件或页面。不同的组件可以使用不同的缓存策略。

**代码示例**:

```typescript
// 页面使用小时级缓存
export default async function Page() {
  "use cache";
  cacheLife("hours");

  return (
    <div>
      <PageContent />
      <Sidebar />
    </div>
  );
}

// 侧边栏使用天级缓存
async function Sidebar() {
  "use cache";
  cacheLife("days");

  const data = await fetchSidebarData();
  return <aside>{data}</aside>;
}

async function PageContent() {
  return <main>Content</main>;
}

async function fetchSidebarData() {
  return "Sidebar data";
}
```

### 7.2 进阶问题

#### 问题四: 如何调试缓存行为?

**问题**: 怎样确认缓存是否正常工作?

**简短回答**: 使用日志和时间戳检查缓存行为。

**详细解释**:

可以在数据获取函数中添加日志,记录每次实际获取数据的时间,从而判断缓存是否生效。

**代码示例**:

```typescript
export default async function Page() {
  "use cache";
  cacheLife("minutes");

  const data = await fetchDataWithLogging();

  return (
    <div>
      <p>Data: {data.content}</p>
      <p>Fetched at: {data.timestamp}</p>
    </div>
  );
}

async function fetchDataWithLogging() {
  const timestamp = new Date().toISOString();
  console.log("[Cache Debug] Fetching data at:", timestamp);

  return {
    content: "Data content",
    timestamp,
  };
}
```

#### 问题五: 可以动态改变缓存策略吗?

**问题**: 能否根据运行时条件动态选择缓存策略?

**简短回答**: 可以,但需要在组件内部根据条件调用不同的 `cacheLife`。

**详细解释**:

可以根据 props、searchParams 等运行时数据选择不同的缓存策略,但必须在同一个 `'use cache'` 作用域内。

**代码示例**:

```typescript
export default async function Page({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  "use cache";

  // 根据模式选择缓存策略
  if (searchParams.mode === "realtime") {
    cacheLife("seconds");
  } else if (searchParams.mode === "static") {
    cacheLife("days");
  } else {
    cacheLife("hours");
  }

  const data = await fetchData();

  return (
    <div>
      <p>Mode: {searchParams.mode || "default"}</p>
      <p>Data: {data}</p>
    </div>
  );
}

async function fetchData() {
  return "Data content";
}
```

## 8. 总结

### 8.1 核心要点回顾

**预定义缓存策略**:

| 策略    | Stale | Revalidate | Expire | 适用场景   |
| :------ | :---- | :--------- | :----- | :--------- |
| seconds | 1s    | 10s        | 60s    | 实时数据   |
| minutes | 60s   | 5m         | 1h     | 准实时数据 |
| hours   | 5m    | 1h         | 1d     | 一般数据   |
| days    | 1h    | 1d         | 1w     | 静态数据   |
| weeks   | 1d    | 1w         | 30d    | 配置数据   |
| max     | ∞     | ∞          | ∞      | 永久缓存   |

**使用要点**:

- 必须配合 `'use cache'` 指令使用
- 只能在服务端组件中使用
- 支持预定义和自定义配置
- 不同组件可以使用不同策略

### 8.2 关键收获

1. **语义化配置**: 使用 'hours', 'days' 等易读的配置名
2. **精细控制**: 通过 stale、revalidate、expire 三个参数精确控制
3. **灵活应用**: 可以为不同数据源使用不同策略
4. **性能优化**: 合理的缓存策略可以显著提升性能
5. **易于维护**: 统一的缓存配置便于管理和调整

### 8.3 最佳实践

1. **根据数据特性选择策略**: 更新频繁的数据使用短缓存
2. **使用预定义配置**: 优先使用语义化的预定义配置
3. **组件级缓存**: 为不同组件设置独立的缓存策略
4. **监控缓存效果**: 使用日志监控缓存命中率
5. **及时失效**: 数据更新后及时失效相关缓存

### 8.4 下一步学习

- **cacheTag**: 学习如何使用标签管理缓存
- **revalidatePath**: 了解如何手动失效路径缓存
- **unstable_cache**: 学习函数级缓存
- **缓存调试**: 掌握缓存调试技巧

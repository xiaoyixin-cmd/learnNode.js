**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# unstable_noStore 函数详解

## 1. 概述与背景

### 1.1 什么是 unstable_noStore

`unstable_noStore` 是 Next.js 16 提供的一个函数,用于明确告诉 Next.js 某个组件或函数不应该被缓存,必须在每次请求时重新执行。这是一种显式禁用缓存的方式。

`unstable_noStore` 的核心特点:

- **禁用缓存**: 明确标记不缓存当前作用域
- **动态渲染**: 强制组件或路由使用动态渲染
- **请求级别**: 每次请求都会重新执行
- **简单直接**: 只需调用一次函数即可

### 1.2 为什么需要 unstable_noStore

在 Next.js 16 中,默认情况下很多内容都会被缓存以提升性能。但有些场景下,我们需要确保数据是实时的,不能使用缓存:

- **实时数据**: 股票价格、实时聊天等
- **用户特定数据**: 个人信息、购物车等
- **动态内容**: 基于请求时间或随机内容
- **调试开发**: 开发时需要看到最新的数据

### 1.3 unstable_noStore 的工作原理

`unstable_noStore` 的工作流程:

1. **调用函数**: 在组件或函数开头调用 `unstable_noStore()`
2. **标记作用域**: Next.js 标记当前作用域为不可缓存
3. **动态渲染**: 该组件或路由会使用动态渲染
4. **每次执行**: 每个请求都会重新执行代码

```typescript
import { unstable_noStore as noStore } from "next/cache";

export default async function DynamicPage() {
  noStore(); // 禁用缓存

  const data = await fetchRealTimeData();

  return <div>{data.timestamp}</div>;
}

async function fetchRealTimeData() {
  return { timestamp: Date.now() };
}
```

## 2. 核心概念

### 2.1 基本用法

#### 在页面组件中使用

```typescript
// app/realtime/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function RealTimePage() {
  noStore(); // 禁用页面缓存

  const currentTime = new Date().toISOString();
  const randomNumber = Math.random();

  return (
    <div>
      <h1>Real-Time Data</h1>
      <p>Current Time: {currentTime}</p>
      <p>Random Number: {randomNumber}</p>
    </div>
  );
}
```

#### 在数据获取函数中使用

```typescript
// lib/data.ts
import { unstable_noStore as noStore } from "next/cache";

export async function getRealTimeData() {
  noStore(); // 禁用函数缓存

  const response = await fetch("https://api.example.com/realtime");
  const data = await response.json();

  return data;
}

// app/page.tsx
import { getRealTimeData } from "@/lib/data";

export default async function Page() {
  const data = await getRealTimeData();

  return <div>{JSON.stringify(data)}</div>;
}
```

### 2.2 与其他缓存控制的对比

#### noStore vs fetch cache: 'no-store'

```typescript
import { unstable_noStore as noStore } from "next/cache";

// 方式一: 使用 noStore
export async function getData1() {
  noStore();
  const res = await fetch("https://api.example.com/data");
  return res.json();
}

// 方式二: 使用 fetch 的 cache 选项
export async function getData2() {
  const res = await fetch("https://api.example.com/data", {
    cache: "no-store",
  });
  return res.json();
}

// 区别: noStore 影响整个函数作用域,fetch cache 只影响单个请求
```

#### noStore vs connection()

```typescript
import { unstable_noStore as noStore } from "next/cache";
import { connection } from "next/server";

// 方式一: 使用 noStore
export async function Page1() {
  noStore();
  const data = await fetchData();
  return <div>{data}</div>;
}

// 方式二: 使用 connection
export async function Page2() {
  await connection();
  const data = await fetchData();
  return <div>{data}</div>;
}

// 两者效果类似,都会禁用缓存并强制动态渲染

async function fetchData() {
  return "data";
}
```

### 2.3 作用域和影响范围

#### 函数级作用域

```typescript
import { unstable_noStore as noStore } from "next/cache";

// noStore 只影响调用它的函数
async function getDynamicData() {
  noStore(); // 只影响这个函数
  return { timestamp: Date.now() };
}

async function getStaticData() {
  // 这个函数仍然可以被缓存
  return { config: "static" };
}

export default async function Page() {
  const dynamic = await getDynamicData(); // 不缓存
  const static = await getStaticData(); // 可能被缓存

  return (
    <div>
      <p>Dynamic: {dynamic.timestamp}</p>
      <p>Static: {static.config}</p>
    </div>
  );
}
```

#### 组件级作用域

```typescript
import { unstable_noStore as noStore } from "next/cache";

// 在组件中调用 noStore
export default async function DynamicComponent() {
  noStore(); // 影响整个组件

  const data1 = await fetchData1();
  const data2 = await fetchData2();

  // 所有数据获取都不会被缓存
  return (
    <div>
      <p>{data1}</p>
      <p>{data2}</p>
    </div>
  );
}

async function fetchData1() {
  return "Data 1";
}

async function fetchData2() {
  return "Data 2";
}
```

## 3. 适用场景

### 3.1 实时数据展示

#### 股票价格

```typescript
// app/stocks/[symbol]/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function StockPage({
  params,
}: {
  params: { symbol: string };
}) {
  noStore(); // 股票价格需要实时数据

  const stockData = await fetchStockPrice(params.symbol);

  return (
    <div>
      <h1>{params.symbol}</h1>
      <p className="price">${stockData.price}</p>
      <p className="change">{stockData.change}%</p>
      <p className="time">Updated: {stockData.timestamp}</p>
    </div>
  );
}

async function fetchStockPrice(symbol: string) {
  const res = await fetch(`https://api.stocks.com/quote/${symbol}`);
  return res.json();
}
```

#### 实时聊天

```typescript
// app/chat/[roomId]/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function ChatRoom({
  params,
}: {
  params: { roomId: string };
}) {
  noStore(); // 聊天消息需要实时更新

  const messages = await fetchMessages(params.roomId);

  return (
    <div className="chat-room">
      <h1>Chat Room {params.roomId}</h1>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <span className="author">{msg.author}</span>
            <span className="content">{msg.content}</span>
            <span className="time">{msg.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function fetchMessages(roomId: string) {
  return [];
}
```

### 3.2 用户特定数据

#### 个人仪表板

```typescript
// app/dashboard/page.tsx
import { unstable_noStore as noStore } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export default async function Dashboard() {
  noStore(); // 用户数据不应该被缓存

  const user = await getCurrentUser();
  const stats = await getUserStats(user.id);
  const notifications = await getNotifications(user.id);

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <div className="stats">
        <div>Posts: {stats.posts}</div>
        <div>Followers: {stats.followers}</div>
      </div>
      <div className="notifications">
        {notifications.map((n) => (
          <div key={n.id}>{n.message}</div>
        ))}
      </div>
    </div>
  );
}

async function getCurrentUser() {
  return { id: "1", name: "User" };
}

async function getUserStats(userId: string) {
  return { posts: 10, followers: 100 };
}

async function getNotifications(userId: string) {
  return [];
}
```

#### 购物车

```typescript
// app/cart/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function CartPage() {
  noStore(); // 购物车数据是用户特定的

  const cart = await getCart();
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart">
      <h1>Shopping Cart</h1>
      {cart.items.map((item) => (
        <div key={item.id} className="cart-item">
          <span>{item.name}</span>
          <span>x{item.quantity}</span>
          <span>${item.price}</span>
        </div>
      ))}
      <div className="total">Total: ${total}</div>
    </div>
  );
}

async function getCart() {
  return { items: [] };
}
```

### 3.3 动态内容生成

#### 随机推荐

```typescript
// app/recommendations/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function RecommendationsPage() {
  noStore(); // 每次访问显示不同的推荐

  const recommendations = await getRandomRecommendations();

  return (
    <div>
      <h1>Recommended for You</h1>
      <div className="recommendations">
        {recommendations.map((item) => (
          <div key={item.id} className="recommendation">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getRandomRecommendations() {
  return [];
}
```

#### 时间敏感内容

```typescript
// app/flash-sale/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function FlashSalePage() {
  noStore(); // 限时促销需要实时倒计时

  const sale = await getCurrentSale();
  const timeLeft = sale.endTime - Date.now();

  return (
    <div className="flash-sale">
      <h1>Flash Sale</h1>
      <p>Time Left: {Math.floor(timeLeft / 1000)} seconds</p>
      <div className="products">
        {sale.products.map((product) => (
          <div key={product.id}>
            <h2>{product.name}</h2>
            <p className="original-price">${product.originalPrice}</p>
            <p className="sale-price">${product.salePrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getCurrentSale() {
  return {
    endTime: Date.now() + 3600000,
    products: [],
  };
}
```

### 3.4 开发调试

#### 开发环境禁用缓存

```typescript
// lib/dev-utils.ts
import { unstable_noStore as noStore } from "next/cache";

export function disableCacheInDev() {
  if (process.env.NODE_ENV === "development") {
    noStore();
  }
}

// app/page.tsx
import { disableCacheInDev } from "@/lib/dev-utils";

export default async function Page() {
  disableCacheInDev(); // 开发时禁用缓存

  const data = await fetchData();

  return <div>{data}</div>;
}

async function fetchData() {
  return "Data";
}
```

#### 调试数据流

```typescript
// app/debug/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function DebugPage() {
  noStore(); // 调试时需要看到最新数据

  const timestamp = new Date().toISOString();
  const requestCount = await getRequestCount();
  const cacheStatus = await getCacheStatus();

  return (
    <div className="debug-info">
      <h1>Debug Information</h1>
      <p>Timestamp: {timestamp}</p>
      <p>Request Count: {requestCount}</p>
      <p>Cache Status: {cacheStatus}</p>
    </div>
  );
}

async function getRequestCount() {
  return 0;
}

async function getCacheStatus() {
  return "disabled";
}
```

## 4. API 签名与配置

### 4.1 函数签名

```typescript
import { unstable_noStore as noStore } from "next/cache";

function unstable_noStore(): void;
```

### 4.2 使用规则

#### 调用位置

```typescript
import { unstable_noStore as noStore } from "next/cache";

// ✅ 正确: 在函数开头调用
export async function getData() {
  noStore(); // 第一行调用
  const data = await fetchData();
  return data;
}

// ✅ 正确: 在组件开头调用
export default async function Page() {
  noStore(); // 组件开头
  const data = await getData();
  return <div>{data}</div>;
}

// ⚠️ 注意: 调用位置不影响效果,但建议在开头
export async function getData2() {
  const data = await fetchData();
  noStore(); // 也有效,但不推荐
  return data;
}

async function fetchData() {
  return "data";
}
```

#### 作用域限制

```typescript
import { unstable_noStore as noStore } from "next/cache";

// noStore 只影响调用它的函数
async function dynamicFunction() {
  noStore(); // 只影响这个函数
  return { dynamic: true };
}

async function staticFunction() {
  // 这个函数可能被缓存
  return { static: true };
}

export default async function Page() {
  const dynamic = await dynamicFunction(); // 不缓存
  const static = await staticFunction(); // 可能缓存

  return (
    <div>
      <p>{JSON.stringify(dynamic)}</p>
      <p>{JSON.stringify(static)}</p>
    </div>
  );
}
```

### 4.3 与其他 API 的组合

#### 与 fetch 组合

```typescript
import { unstable_noStore as noStore } from "next/cache";

export async function getData() {
  noStore(); // 禁用整个函数的缓存

  // 即使 fetch 有缓存配置,也会被 noStore 覆盖
  const res1 = await fetch("https://api.example.com/data1", {
    next: { revalidate: 3600 },
  });

  const res2 = await fetch("https://api.example.com/data2", {
    cache: "force-cache",
  });

  // 两个请求都不会被缓存
  return {
    data1: await res1.json(),
    data2: await res2.json(),
  };
}
```

#### 与 unstable_cache 组合

```typescript
import { unstable_noStore as noStore } from "next/cache";
import { unstable_cache } from "next/cache";

// noStore 会覆盖 unstable_cache
export async function getData() {
  noStore(); // 禁用缓存

  const cachedFn = unstable_cache(async () => fetchData(), ["data"], {
    revalidate: 3600,
  });

  // 即使使用了 unstable_cache,也不会缓存
  return await cachedFn();
}

async function fetchData() {
  return { data: "value" };
}
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单禁用缓存

```typescript
// app/simple/page.tsx
import { unstable_noStore as noStore } from "next/cache";

export default async function SimplePage() {
  noStore();

  const timestamp = Date.now();

  return (
    <div>
      <h1>Current Timestamp</h1>
      <p>{timestamp}</p>
    </div>
  );
}
```

#### 禁用数据获取缓存

```typescript
// lib/api.ts
import { unstable_noStore as noStore } from "next/cache";

export async function getLatestData() {
  noStore();

  const response = await fetch("https://api.example.com/latest");
  return response.json();
}
```

### 5.2 进阶用法

#### 条件禁用缓存

```typescript
// lib/conditional-no-store.ts
import { unstable_noStore as noStore } from "next/cache";

export async function getData(options: { noCache?: boolean } = {}) {
  if (options.noCache) {
    noStore();
  }

  const data = await fetchData();
  return data;
}

// 使用
const data1 = await getData(); // 可能被缓存
const data2 = await getData({ noCache: true }); // 不缓存

async function fetchData() {
  return { data: "value" };
}
```

#### 基于环境禁用缓存

```typescript
// lib/env-no-store.ts
import { unstable_noStore as noStore } from "next/cache";

export async function getDataWithEnvControl() {
  // 开发环境禁用缓存
  if (process.env.NODE_ENV === "development") {
    noStore();
  }

  // 或者基于环境变量
  if (process.env.DISABLE_CACHE === "true") {
    noStore();
  }

  const data = await fetchData();
  return data;
}

async function fetchData() {
  return { data: "value" };
}
```

#### 选择性禁用缓存

```typescript
// lib/selective-no-store.ts
import { unstable_noStore as noStore } from "next/cache";

export async function getPageData(pageType: string) {
  // 只对特定页面类型禁用缓存
  const noCachePages = ["dashboard", "cart", "profile"];

  if (noCachePages.includes(pageType)) {
    noStore();
  }

  const data = await fetchPageData(pageType);
  return data;
}

async function fetchPageData(type: string) {
  return { type, data: "value" };
}
```

#### 工具函数封装

```typescript
// lib/cache-utils.ts
import { unstable_noStore as noStore } from "next/cache";

export function createNoStoreWrapper<
  T extends (...args: any[]) => Promise<any>
>(fn: T): T {
  return (async (...args: any[]) => {
    noStore();
    return fn(...args);
  }) as T;
}

// 使用
const getDynamicData = createNoStoreWrapper(async (id: string) => {
  return await fetchData(id);
});

async function fetchData(id: string) {
  return { id, data: "value" };
}
```

## 6. 注意事项

### 6.1 性能影响

#### 避免过度使用

```typescript
// ❌ 不好: 所有页面都禁用缓存
import { unstable_noStore as noStore } from "next/cache";

export default async function Page() {
  noStore(); // 不必要的性能损失

  const staticData = await fetchStaticData();
  return <div>{staticData}</div>;
}

// ✅ 好: 只在需要时禁用缓存
export default async function DynamicPage() {
  noStore(); // 确实需要实时数据

  const realTimeData = await fetchRealTimeData();
  return <div>{realTimeData}</div>;
}

async function fetchStaticData() {
  return "Static";
}

async function fetchRealTimeData() {
  return Date.now().toString();
}
```

#### 部分禁用缓存

```typescript
// 只对需要的部分禁用缓存
export default async function Page() {
  // 静态数据可以缓存
  const staticData = await fetchStaticData();

  // 动态数据禁用缓存
  const dynamicData = await getDynamicData();

  return (
    <div>
      <div>{staticData}</div>
      <div>{dynamicData}</div>
    </div>
  );
}

async function fetchStaticData() {
  return "Static";
}

async function getDynamicData() {
  noStore();
  return Date.now().toString();
}
```

### 6.2 使用场景判断

#### 何时使用 noStore

```typescript
// 适合使用 noStore 的场景
import { unstable_noStore as noStore } from "next/cache";

// 1. 用户特定数据
export async function getUserDashboard(userId: string) {
  noStore();
  return await fetchUserData(userId);
}

// 2. 实时数据
export async function getStockPrice(symbol: string) {
  noStore();
  return await fetchStockPrice(symbol);
}

// 3. 随机内容
export async function getRandomRecommendations() {
  noStore();
  return await fetchRandomItems();
}

async function fetchUserData(id: string) {
  return { id };
}

async function fetchStockPrice(symbol: string) {
  return { symbol, price: 100 };
}

async function fetchRandomItems() {
  return [];
}
```

#### 何时不使用 noStore

```typescript
// 不适合使用 noStore 的场景

// 1. 静态内容
export async function getStaticContent() {
  // 不需要 noStore
  return await fetchStaticContent();
}

// 2. 公共数据
export async function getPublicPosts() {
  // 不需要 noStore,可以缓存
  return await fetchPosts();
}

// 3. 配置数据
export async function getConfig() {
  // 不需要 noStore
  return await fetchConfig();
}

async function fetchStaticContent() {
  return "Static";
}

async function fetchPosts() {
  return [];
}

async function fetchConfig() {
  return {};
}
```

### 6.3 与其他缓存策略的配合

#### 混合使用

```typescript
import { unstable_noStore as noStore } from "next/cache";
import { unstable_cache } from "next/cache";

// 页面级别禁用缓存
export default async function Page() {
  noStore();

  // 但某些数据仍然可以使用其他缓存策略
  const config = await getCachedConfig();
  const userData = await getUserData();

  return (
    <div>
      <div>{config.siteName}</div>
      <div>{userData.name}</div>
    </div>
  );
}

// 配置数据使用 unstable_cache
const getCachedConfig = unstable_cache(async () => fetchConfig(), ["config"], {
  revalidate: 3600,
});

// 用户数据不缓存
async function getUserData() {
  return { name: "User" };
}

async function fetchConfig() {
  return { siteName: "Site" };
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: noStore 和 cache: 'no-store' 有什么区别?

**问题**: `unstable_noStore()` 和 `fetch` 的 `cache: 'no-store'` 有什么不同?

**简短回答**: `noStore()` 影响整个函数作用域,`cache: 'no-store'` 只影响单个 fetch 请求。

**详细解释**:

`unstable_noStore()` 会禁用调用它的函数或组件的所有缓存,而 `cache: 'no-store'` 只禁用特定 fetch 请求的缓存。

**对比表格**:

| 特性     | unstable_noStore | cache: 'no-store' |
| :------- | :--------------- | :---------------- |
| 影响范围 | 整个函数/组件    | 单个 fetch 请求   |
| 使用位置 | 函数开头         | fetch 选项        |
| 灵活性   | 低               | 高                |
| 适用场景 | 整体禁用缓存     | 选择性禁用        |

**代码示例**:

```typescript
import { unstable_noStore as noStore } from "next/cache";

// 使用 noStore - 影响所有请求
export async function getData1() {
  noStore();

  const res1 = await fetch("https://api.example.com/data1");
  const res2 = await fetch("https://api.example.com/data2");

  // 两个请求都不缓存
  return {
    data1: await res1.json(),
    data2: await res2.json(),
  };
}

// 使用 cache: 'no-store' - 只影响特定请求
export async function getData2() {
  const res1 = await fetch("https://api.example.com/data1", {
    cache: "no-store", // 只有这个不缓存
  });

  const res2 = await fetch("https://api.example.com/data2");
  // 这个可能被缓存

  return {
    data1: await res1.json(),
    data2: await res2.json(),
  };
}
```

#### 问题二: noStore 会影响子组件吗?

**问题**: 在父组件中调用 `noStore()`,子组件也会受影响吗?

**简短回答**: 不会,`noStore()` 只影响调用它的函数或组件。

**详细解释**:

`noStore()` 的作用域限制在调用它的函数内,不会传递到子组件或其他函数。

**代码示例**:

```typescript
import { unstable_noStore as noStore } from "next/cache";

// 父组件
export default async function ParentComponent() {
  noStore(); // 只影响这个组件

  const parentData = await fetchParentData();

  return (
    <div>
      <p>{parentData}</p>
      <ChildComponent /> {/* 子组件不受影响 */}
    </div>
  );
}

// 子组件
async function ChildComponent() {
  // 这个组件可能被缓存
  const childData = await fetchChildData();

  return <p>{childData}</p>;
}

async function fetchParentData() {
  return "Parent";
}

async function fetchChildData() {
  return "Child";
}
```

#### 问题三: 可以在客户端组件中使用吗?

**问题**: `unstable_noStore` 可以在客户端组件中使用吗?

**简短回答**: 不可以,只能在服务端使用。

**详细解释**:

`unstable_noStore` 是服务端缓存控制函数,只能在服务端组件、Server Actions 或 API 路由中使用。

**代码示例**:

```typescript
// ✅ 正确: 在服务端组件中使用
import { unstable_noStore as noStore } from "next/cache";

export default async function ServerComponent() {
  noStore();
  const data = await fetchData();
  return <div>{data}</div>;
}

// ❌ 错误: 在客户端组件中使用
("use client");

export default function ClientComponent() {
  // noStore(); // 不能在这里使用
  return <div>Client</div>;
}

async function fetchData() {
  return "Data";
}
```

### 7.2 进阶问题

#### 问题四: noStore 和 connection() 哪个更好?

**问题**: 应该使用 `noStore()` 还是 `connection()`?

**简短回答**: 两者效果类似,选择更符合语义的那个。

**详细解释**:

`noStore()` 和 `connection()` 都会禁用缓存并强制动态渲染。`noStore()` 更明确表达"不缓存"的意图,`connection()` 更强调"需要请求上下文"。

**对比表格**:

| 特性     | unstable_noStore | connection     |
| :------- | :--------------- | :------------- |
| 主要用途 | 禁用缓存         | 访问请求信息   |
| 语义     | 不缓存           | 需要连接信息   |
| 返回值   | void             | Promise<void>  |
| 使用场景 | 明确禁用缓存     | 需要请求上下文 |

**代码示例**:

```typescript
import { unstable_noStore as noStore } from "next/cache";
import { connection } from "next/server";

// 使用 noStore - 语义更清晰
export async function Page1() {
  noStore(); // 明确表示不缓存
  const data = await fetchData();
  return <div>{data}</div>;
}

// 使用 connection - 当需要请求信息时
export async function Page2() {
  await connection(); // 同时禁用缓存
  const data = await fetchData();
  return <div>{data}</div>;
}

async function fetchData() {
  return "Data";
}
```

#### 问题五: 如何验证 noStore 是否生效?

**问题**: 怎样确认 `noStore()` 确实禁用了缓存?

**简短回答**: 添加时间戳或随机数,刷新页面查看是否变化。

**详细解释**:

在组件中添加时间戳或随机数,如果每次刷新都变化,说明缓存已禁用。

**代码示例**:

```typescript
import { unstable_noStore as noStore } from "next/cache";

export default async function TestPage() {
  noStore();

  const timestamp = new Date().toISOString();
  const random = Math.random();

  console.log("Page rendered at:", timestamp);

  return (
    <div>
      <h1>Cache Test</h1>
      <p>Timestamp: {timestamp}</p>
      <p>Random: {random}</p>
      <p>刷新页面,如果这些值变化,说明缓存已禁用</p>
    </div>
  );
}
```

## 8. 总结

### 8.1 核心要点回顾

**unstable_noStore 的主要特点**:

- 明确禁用缓存
- 强制动态渲染
- 函数级作用域
- 简单易用

**使用流程**:

1. 在函数或组件开头调用 `noStore()`
2. Next.js 标记该作用域为不可缓存
3. 每次请求都会重新执行代码

### 8.2 关键收获

1. **明确意图**: `noStore()` 清晰表达不缓存的意图
2. **作用域限制**: 只影响调用它的函数或组件
3. **性能权衡**: 禁用缓存会增加服务器负载
4. **适用场景**: 实时数据、用户特定数据、动态内容
5. **简单直接**: 只需一行代码即可禁用缓存

### 8.3 最佳实践

1. **谨慎使用**: 只在确实需要实时数据时使用
2. **部分禁用**: 只对需要的部分禁用缓存
3. **性能考虑**: 评估禁用缓存对性能的影响
4. **语义清晰**: 在函数开头调用,表达清晰意图
5. **配合其他策略**: 可以与其他缓存策略混合使用

### 8.4 下一步学习

- **connection**: 了解请求上下文访问
- **unstable_cache**: 学习函数级缓存
- **revalidatePath**: 掌握路径重新验证
- **缓存策略**: 理解完整的缓存管理体系

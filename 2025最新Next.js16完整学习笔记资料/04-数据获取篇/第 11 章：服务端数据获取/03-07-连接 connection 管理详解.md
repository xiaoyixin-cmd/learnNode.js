**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 连接 connection 管理详解

## 1. 概述与背景

### 1.1 什么是 connection

在 Next.js 16 中,`connection()` 是一个新引入的 API,用于等待传入的请求数据完全可用。这个函数主要用于处理动态渲染场景,确保在访问请求相关数据之前,连接已经建立并且数据已经准备好。

`connection()` 的核心作用:

- **等待请求数据**: 确保请求数据完全可用后再继续执行
- **动态渲染标记**: 将页面或组件标记为动态渲染
- **避免预渲染错误**: 防止在静态生成时访问请求数据导致的错误
- **请求生命周期管理**: 更好地控制请求的处理流程

### 1.2 为什么需要 connection

在 Next.js 的渲染过程中,有些数据只在运行时才能获取,比如请求头、Cookie、URL 参数等。如果在静态生成阶段访问这些数据,会导致错误。`connection()` 提供了一种明确的方式来处理这种情况:

- **明确动态意图**: 清晰地表明代码需要在运行时执行
- **避免构建错误**: 防止在构建时访问运行时数据
- **优化渲染流程**: 确保数据准备就绪后再渲染
- **提升代码可读性**: 让代码意图更加明确

### 1.3 connection 的工作原理

`connection()` 是一个异步函数,它会等待传入的请求连接建立。当你调用这个函数时:

1. **检查渲染模式**: 判断当前是静态生成还是动态渲染
2. **等待连接**: 如果是动态渲染,等待请求连接建立
3. **标记动态**: 将当前页面/组件标记为需要动态渲染
4. **返回控制**: 连接建立后,继续执行后续代码

## 2. 核心概念

### 2.1 基本用法

#### 简单示例

```typescript
// app/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function Page() {
  // 等待连接建立
  await connection();

  // 现在可以安全地访问请求数据
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");

  return (
    <div>
      <h1>Current Theme: {theme?.value || "default"}</h1>
    </div>
  );
}
```

#### 在服务端组件中使用

```typescript
// app/dashboard/page.tsx
import { connection } from "next/server";
import { headers } from "next/headers";

export default async function DashboardPage() {
  // 等待连接
  await connection();

  // 访问请求头
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User Agent: {userAgent}</p>
    </div>
  );
}
```

### 2.2 与其他 API 配合使用

#### 与 cookies 配合

```typescript
// app/profile/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function ProfilePage() {
  await connection();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId");

  if (!userId) {
    return <div>Please login</div>;
  }

  // 获取用户数据
  const user = await fetchUser(userId.value);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}

async function fetchUser(id: string) {
  return {
    id,
    name: "John Doe",
    email: "john@example.com",
  };
}
```

#### 与 headers 配合

```typescript
// app/api/data/route.ts
import { connection } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  await connection();

  const headersList = await headers();
  const authorization = headersList.get("authorization");

  if (!authorization) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 验证令牌并返回数据
  const data = await fetchData(authorization);

  return Response.json(data);
}

async function fetchData(token: string) {
  return { message: "Data fetched successfully" };
}
```

### 2.3 动态渲染控制

#### 强制动态渲染

```typescript
// app/dynamic/page.tsx
import { connection } from "next/server";

export default async function DynamicPage() {
  // 即使不访问请求数据,也强制动态渲染
  await connection();

  const timestamp = new Date().toISOString();

  return (
    <div>
      <h1>Dynamic Page</h1>
      <p>Generated at: {timestamp}</p>
    </div>
  );
}
```

#### 条件性动态渲染

```typescript
// app/conditional/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function ConditionalPage({
  searchParams,
}: {
  searchParams: { preview?: string };
}) {
  // 只在预览模式下使用动态渲染
  if (searchParams.preview === "true") {
    await connection();

    const cookieStore = await cookies();
    const previewData = cookieStore.get("preview-data");

    return (
      <div>
        <h1>Preview Mode</h1>
        <p>Preview Data: {previewData?.value}</p>
      </div>
    );
  }

  // 静态渲染
  return (
    <div>
      <h1>Static Page</h1>
    </div>
  );
}
```

## 3. 适用场景

### 3.1 用户认证场景

#### 检查登录状态

```typescript
// app/protected/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  await connection();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session");

  if (!sessionToken) {
    redirect("/login");
  }

  // 验证会话
  const session = await validateSession(sessionToken.value);

  if (!session.valid) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
}

async function validateSession(token: string) {
  // 验证会话逻辑
  return {
    valid: true,
    user: {
      id: "1",
      name: "John Doe",
    },
  };
}
```

#### 基于角色的访问控制

```typescript
// app/admin/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  await connection();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session");

  if (!sessionToken) {
    redirect("/login");
  }

  const session = await validateSession(sessionToken.value);

  if (!session.user.roles.includes("admin")) {
    redirect("/unauthorized");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Admin-only content</p>
    </div>
  );
}

async function validateSession(token: string) {
  return {
    user: {
      id: "1",
      name: "Admin User",
      roles: ["admin", "user"],
    },
  };
}
```

### 3.2 个性化内容场景

#### 基于用户偏好的内容

```typescript
// app/personalized/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function PersonalizedPage() {
  await connection();

  const cookieStore = await cookies();
  const preferences = {
    theme: cookieStore.get("theme")?.value || "light",
    language: cookieStore.get("language")?.value || "en",
    fontSize: cookieStore.get("fontSize")?.value || "medium",
  };

  return (
    <div className={`theme-${preferences.theme} font-${preferences.fontSize}`}>
      <h1>Personalized Content</h1>
      <p>Theme: {preferences.theme}</p>
      <p>Language: {preferences.language}</p>
      <p>Font Size: {preferences.fontSize}</p>
    </div>
  );
}
```

#### 地理位置相关内容

```typescript
// app/location/page.tsx
import { connection } from "next/server";
import { headers } from "next/headers";

export default async function LocationPage() {
  await connection();

  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "US";
  const city = headersList.get("x-vercel-ip-city") || "Unknown";

  // 根据地理位置获取内容
  const content = await getLocalizedContent(country);

  return (
    <div>
      <h1>
        Welcome from {city}, {country}
      </h1>
      <div>{content}</div>
    </div>
  );
}

async function getLocalizedContent(country: string) {
  const contentMap: Record<string, string> = {
    US: "Welcome to our US site",
    CN: "欢迎访问我们的中国站点",
    JP: "日本サイトへようこそ",
  };

  return contentMap[country] || "Welcome to our site";
}
```

### 3.3 A/B 测试场景

#### 实验分组

```typescript
// app/experiment/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function ExperimentPage() {
  await connection();

  const cookieStore = await cookies();
  let variant = cookieStore.get("experiment-variant")?.value;

  // 如果没有分组,随机分配
  if (!variant) {
    variant = Math.random() > 0.5 ? "A" : "B";
    // 注意: 这里只是示例,实际设置 Cookie 需要在 middleware 或 API 路由中
  }

  return (
    <div>
      {variant === "A" ? (
        <div>
          <h1>Version A</h1>
          <button className="bg-blue-500">Click Me</button>
        </div>
      ) : (
        <div>
          <h1>Version B</h1>
          <button className="bg-green-500">Click Here</button>
        </div>
      )}
    </div>
  );
}
```

#### 特性开关

```typescript
// app/features/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function FeaturesPage() {
  await connection();

  const cookieStore = await cookies();
  const featureFlags = {
    newUI: cookieStore.get("feature-new-ui")?.value === "true",
    betaFeatures: cookieStore.get("feature-beta")?.value === "true",
    experimentalAPI: cookieStore.get("feature-experimental")?.value === "true",
  };

  return (
    <div>
      <h1>Features</h1>

      {featureFlags.newUI && (
        <div className="new-ui">
          <h2>New UI Enabled</h2>
        </div>
      )}

      {featureFlags.betaFeatures && (
        <div className="beta-features">
          <h2>Beta Features</h2>
        </div>
      )}

      {featureFlags.experimentalAPI && (
        <div className="experimental">
          <h2>Experimental API Access</h2>
        </div>
      )}
    </div>
  );
}
```

### 3.4 设备检测场景

#### 响应式内容

```typescript
// app/responsive/page.tsx
import { connection } from "next/server";
import { headers } from "next/headers";

export default async function ResponsivePage() {
  await connection();

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return (
    <div>
      {isMobile && (
        <div className="mobile-layout">
          <h1>Mobile View</h1>
          <p>Optimized for mobile devices</p>
        </div>
      )}

      {isTablet && (
        <div className="tablet-layout">
          <h1>Tablet View</h1>
          <p>Optimized for tablets</p>
        </div>
      )}

      {isDesktop && (
        <div className="desktop-layout">
          <h1>Desktop View</h1>
          <p>Full desktop experience</p>
        </div>
      )}
    </div>
  );
}
```

#### 浏览器特定功能

```typescript
// app/browser/page.tsx
import { connection } from "next/server";
import { headers } from "next/headers";

export default async function BrowserPage() {
  await connection();

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const browser = detectBrowser(userAgent);

  return (
    <div>
      <h1>Browser: {browser.name}</h1>
      <p>Version: {browser.version}</p>

      {browser.name === "Chrome" && <div>Chrome-specific features enabled</div>}

      {browser.name === "Safari" && (
        <div>Safari-specific optimizations applied</div>
      )}
    </div>
  );
}

function detectBrowser(userAgent: string) {
  if (/chrome/i.test(userAgent)) {
    return { name: "Chrome", version: "120" };
  } else if (/safari/i.test(userAgent)) {
    return { name: "Safari", version: "17" };
  } else if (/firefox/i.test(userAgent)) {
    return { name: "Firefox", version: "121" };
  }
  return { name: "Unknown", version: "Unknown" };
}
```

## 4. API 签名与配置

### 4.1 connection() 函数签名

```typescript
import { connection } from "next/server";

// 函数签名
function connection(): Promise<void>;

// 使用示例
await connection();
```

### 4.2 返回值

`connection()` 函数返回一个 Promise,该 Promise 在连接建立后 resolve。它不返回任何值,只是用于等待连接建立。

```typescript
// 正确用法
await connection();

// 不需要接收返回值
const result = await connection(); // result 是 undefined
```

### 4.3 错误处理

```typescript
// app/error-handling/page.tsx
import { connection } from "next/server";

export default async function ErrorHandlingPage() {
  try {
    await connection();

    // 访问请求数据
    const data = await getRequestData();

    return <div>{data}</div>;
  } catch (error) {
    console.error("Connection error:", error);
    return <div>Error loading page</div>;
  }
}

async function getRequestData() {
  return "Request data";
}
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单的动态页面

```typescript
// app/simple/page.tsx
import { connection } from "next/server";

export default async function SimplePage() {
  await connection();

  const now = new Date().toLocaleString();

  return (
    <div>
      <h1>Current Time</h1>
      <p>{now}</p>
    </div>
  );
}
```

#### 访问请求信息

```typescript
// app/request-info/page.tsx
import { connection } from "next/server";
import { headers } from "next/headers";

export default async function RequestInfoPage() {
  await connection();

  const headersList = await headers();

  return (
    <div>
      <h1>Request Information</h1>
      <ul>
        <li>Host: {headersList.get("host")}</li>
        <li>User-Agent: {headersList.get("user-agent")}</li>
        <li>Referer: {headersList.get("referer") || "None"}</li>
      </ul>
    </div>
  );
}
```

### 5.2 进阶用法

#### 组合多个请求数据源

```typescript
// app/combined/page.tsx
import { connection } from "next/server";
import { headers, cookies } from "next/headers";

export default async function CombinedPage() {
  await connection();

  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);

  const requestInfo = {
    userAgent: headersList.get("user-agent"),
    theme: cookieStore.get("theme")?.value,
    language: cookieStore.get("language")?.value,
    ip: headersList.get("x-forwarded-for"),
  };

  return (
    <div>
      <h1>Combined Request Data</h1>
      <pre>{JSON.stringify(requestInfo, null, 2)}</pre>
    </div>
  );
}
```

#### 条件性数据获取

```typescript
// app/conditional-data/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function ConditionalDataPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  // 只在特定模式下等待连接
  if (searchParams.mode === "dynamic") {
    await connection();

    const cookieStore = await cookies();
    const userData = cookieStore.get("user-data");

    return (
      <div>
        <h1>Dynamic Mode</h1>
        <p>User Data: {userData?.value}</p>
      </div>
    );
  }

  // 静态模式
  return (
    <div>
      <h1>Static Mode</h1>
      <p>This page is statically generated</p>
    </div>
  );
}
```

#### 嵌套组件中使用

```typescript
// app/nested/page.tsx
import { connection } from "next/server";
import { UserInfo } from "./UserInfo";

export default async function NestedPage() {
  await connection();

  return (
    <div>
      <h1>Nested Components</h1>
      <UserInfo />
    </div>
  );
}

// app/nested/UserInfo.tsx
import { cookies } from "next/headers";

export async function UserInfo() {
  // 不需要再次调用 connection(),父组件已经调用过了
  const cookieStore = await cookies();
  const username = cookieStore.get("username");

  return (
    <div>
      <p>Username: {username?.value || "Guest"}</p>
    </div>
  );
}
```

### 5.3 性能优化

#### 并行数据获取

```typescript
// app/parallel/page.tsx
import { connection } from "next/server";
import { headers, cookies } from "next/headers";

export default async function ParallelPage() {
  await connection();

  // 并行获取多个数据源
  const [headersList, cookieStore, userData, posts] = await Promise.all([
    headers(),
    cookies(),
    fetchUserData(),
    fetchPosts(),
  ]);

  return (
    <div>
      <h1>Parallel Data Fetching</h1>
      <div>Headers: {headersList.get("host")}</div>
      <div>Cookies: {cookieStore.getAll().length}</div>
      <div>User: {userData.name}</div>
      <div>Posts: {posts.length}</div>
    </div>
  );
}

async function fetchUserData() {
  return { id: "1", name: "John" };
}

async function fetchPosts() {
  return [{ id: "1", title: "Post 1" }];
}
```

#### 缓存策略配合

```typescript
// app/cached/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export default async function CachedPage() {
  await connection();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return <div>Please login</div>;
  }

  // 使用缓存获取用户数据
  const getCachedUserData = unstable_cache(
    async (id: string) => fetchUserData(id),
    ["user-data"],
    { revalidate: 3600 }
  );

  const userData = await getCachedUserData(userId);

  return (
    <div>
      <h1>User: {userData.name}</h1>
    </div>
  );
}

async function fetchUserData(id: string) {
  return { id, name: "John Doe", email: "john@example.com" };
}
```

## 6. 注意事项

### 6.1 性能考虑

#### 避免不必要的动态渲染

```typescript
// ❌ 错误: 不需要动态渲染却调用 connection()
export default async function StaticPage() {
  await connection(); // 不必要

  return (
    <div>
      <h1>Static Content</h1>
      <p>This doesn't need dynamic rendering</p>
    </div>
  );
}

// ✅ 正确: 只在需要时调用
export default async function DynamicPage() {
  // 不调用 connection(),保持静态生成
  return (
    <div>
      <h1>Static Content</h1>
    </div>
  );
}
```

#### 合理使用缓存

```typescript
// ✅ 正确: 结合缓存使用
import { connection } from "next/server";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export default async function Page() {
  await connection();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // 缓存数据获取
  const getData = unstable_cache(async () => fetchData(), ["data"], {
    revalidate: 60,
  });

  const data = await getData();

  return <div>{data.content}</div>;
}

async function fetchData() {
  return { content: "Cached data" };
}
```

### 6.2 错误处理

#### 处理连接失败

```typescript
// app/error-safe/page.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function ErrorSafePage() {
  try {
    await connection();

    const cookieStore = await cookies();
    const data = cookieStore.get("data");

    return (
      <div>
        <h1>Data: {data?.value}</h1>
      </div>
    );
  } catch (error) {
    console.error("Connection failed:", error);

    // 返回降级内容
    return (
      <div>
        <h1>Service Unavailable</h1>
        <p>Please try again later</p>
      </div>
    );
  }
}
```

### 6.3 使用限制

#### 只能在服务端使用

```typescript
// ❌ 错误: 在客户端组件中使用
"use client";

import { connection } from "next/server";

export default async function ClientComponent() {
  await connection(); // 错误!
  return <div>Client Component</div>;
}

// ✅ 正确: 在服务端组件中使用
import { connection } from "next/server";

export default async function ServerComponent() {
  await connection(); // 正确
  return <div>Server Component</div>;
}
```

#### 不能在中间件中使用

```typescript
// ❌ 错误: 在 middleware 中使用
import { connection } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  await connection(); // 不支持
  return NextResponse.next();
}

// ✅ 正确: 在 middleware 中直接访问请求数据
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const cookies = request.cookies;
  const headers = request.headers;

  return NextResponse.next();
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: connection() 的作用是什么?

**问题**: `connection()` 函数具体做了什么?

**简短回答**: 等待请求连接建立,并将页面标记为动态渲染。

**详细解释**:

`connection()` 函数主要有两个作用:一是等待传入的请求连接完全建立,确保请求数据可用;二是将当前页面或组件标记为需要动态渲染,防止在静态生成时访问请求数据导致错误。

**代码示例**:

```typescript
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function Page() {
  // 等待连接并标记为动态
  await connection();

  // 现在可以安全访问请求数据
  const cookieStore = await cookies();
  const data = cookieStore.get("data");

  return <div>{data?.value}</div>;
}
```

#### 问题二: 什么时候需要使用 connection()?

**问题**: 在什么情况下应该使用 `connection()`?

**简短回答**: 当需要访问请求相关数据(如 cookies、headers)时使用。

**详细解释**:

当你的页面或组件需要访问请求相关的数据时,应该先调用 `connection()` 来确保连接已建立。这包括访问 cookies、headers、或任何依赖于请求上下文的数据。

**代码示例**:

```typescript
// 需要使用 connection() 的场景
import { connection } from "next/server";
import { cookies, headers } from "next/headers";

export default async function Page() {
  await connection();

  const cookieStore = await cookies();
  const headersList = await headers();

  return <div>Request data accessed</div>;
}

// 不需要使用 connection() 的场景
export default async function StaticPage() {
  // 不访问请求数据,保持静态
  const data = await fetchStaticData();

  return <div>{data}</div>;
}

async function fetchStaticData() {
  return "Static data";
}
```

#### 问题三: connection() 会影响性能吗?

**问题**: 使用 `connection()` 会降低性能吗?

**简短回答**: 会将页面从静态变为动态,但对单个请求的性能影响很小。

**详细解释**:

`connection()` 本身的执行开销很小,但它会将页面标记为动态渲染,这意味着页面不能被静态生成和缓存。对于需要访问请求数据的页面,这是必要的权衡。

**性能对比**:

| 渲染方式 | 首次加载 | 后续请求 | 缓存       |
| :------- | :------- | :------- | :--------- |
| 静态生成 | 快       | 非常快   | CDN 缓存   |
| 动态渲染 | 中等     | 中等     | 无静态缓存 |

### 7.2 进阶问题

#### 问题四: connection() 和 headers()/cookies() 的关系?

**问题**: 为什么有时候需要先调用 `connection()` 再调用 `headers()` 或 `cookies()`?

**简短回答**: `connection()` 确保连接建立,`headers()`/`cookies()` 访问具体数据。

**详细解释**:

`connection()` 是一个更底层的 API,它确保请求连接已经建立。虽然直接调用 `headers()` 或 `cookies()` 也会隐式地等待连接,但显式调用 `connection()` 可以让代码意图更清晰,并且在某些复杂场景下提供更好的控制。

**代码示例**:

```typescript
// 方式一: 显式调用 connection()
import { connection } from "next/server";
import { cookies } from "next/headers";

export default async function Page1() {
  await connection(); // 显式等待连接
  const cookieStore = await cookies();
  return <div>{cookieStore.get("data")?.value}</div>;
}

// 方式二: 直接调用 cookies()
import { cookies } from "next/headers";

export default async function Page2() {
  const cookieStore = await cookies(); // 隐式等待连接
  return <div>{cookieStore.get("data")?.value}</div>;
}
```

#### 问题五: 如何在保持部分静态的同时使用动态数据?

**问题**: 能否让页面的一部分保持静态,另一部分使用动态数据?

**简短回答**: 可以,使用组件分离和 Suspense 边界。

**详细解释**:

可以将静态内容和动态内容分离到不同的组件中,静态组件不调用 `connection()`,动态组件调用 `connection()`。使用 Suspense 可以让静态部分先渲染,动态部分后加载。

**代码示例**:

```typescript
// app/mixed/page.tsx
import { Suspense } from "react";
import { StaticContent } from "./StaticContent";
import { DynamicContent } from "./DynamicContent";

export default function MixedPage() {
  return (
    <div>
      <StaticContent />
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}

// app/mixed/StaticContent.tsx
export async function StaticContent() {
  // 不调用 connection(),保持静态
  const data = await fetchStaticData();

  return (
    <div>
      <h1>Static Section</h1>
      <p>{data}</p>
    </div>
  );
}

async function fetchStaticData() {
  return "This is static";
}

// app/mixed/DynamicContent.tsx
import { connection } from "next/server";
import { cookies } from "next/headers";

export async function DynamicContent() {
  await connection();

  const cookieStore = await cookies();
  const userData = cookieStore.get("user");

  return (
    <div>
      <h2>Dynamic Section</h2>
      <p>User: {userData?.value}</p>
    </div>
  );
}
```

#### 问题六: connection() 在 API 路由中如何使用?

**问题**: API 路由中需要使用 `connection()` 吗?

**简短回答**: 通常不需要,API 路由默认就是动态的。

**详细解释**:

API 路由(Route Handlers)默认就是动态渲染的,可以直接访问请求对象。但如果你想明确表示需要等待连接,也可以使用 `connection()`。

**代码示例**:

```typescript
// app/api/data/route.ts
import { connection } from "next/server";
import { cookies } from "next/headers";

// 方式一: 使用 connection()
export async function GET() {
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  return Response.json({ token: token?.value });
}

// 方式二: 直接访问(更常见)
export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();

  return Response.json({ success: true });
}
```

## 8. 总结

### 8.1 核心要点回顾

**connection() 的主要特点**:

| 特点       | 说明                     |
| :--------- | :----------------------- |
| 等待连接   | 确保请求连接建立后再继续 |
| 标记动态   | 将页面标记为动态渲染     |
| 服务端专用 | 只能在服务端组件中使用   |
| 异步函数   | 返回 Promise,需要 await  |

**使用场景**:

- 访问请求数据(cookies、headers)
- 用户认证和授权
- 个性化内容
- A/B 测试
- 设备检测

### 8.2 关键收获

1. **明确意图**: 使用 `connection()` 明确表示需要动态渲染
2. **性能权衡**: 了解动态渲染对性能的影响
3. **正确使用**: 只在需要访问请求数据时使用
4. **错误处理**: 适当处理连接失败的情况
5. **组件分离**: 将静态和动态内容分离

### 8.3 最佳实践

1. **按需使用**: 只在真正需要时调用 `connection()`
2. **组件分离**: 将静态和动态内容分离到不同组件
3. **错误处理**: 添加适当的错误处理逻辑
4. **性能优化**: 结合缓存策略使用
5. **代码清晰**: 让动态渲染的意图明确

### 8.4 下一步学习

- **动态渲染**: 深入了解 Next.js 的渲染策略
- **缓存策略**: 学习如何优化动态页面的性能
- **中间件**: 了解如何在中间件中处理请求
- **认证系统**: 实现完整的用户认证流程

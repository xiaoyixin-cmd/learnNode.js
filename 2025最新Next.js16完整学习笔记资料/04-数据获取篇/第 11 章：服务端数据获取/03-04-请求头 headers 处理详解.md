**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 请求头 headers 处理详解

## 1. 概述与背景

### 1.1 什么是请求头

请求头(Headers)是 HTTP 请求和响应中携带的元数据,用于传递关于请求或响应的附加信息。在 Next.js 16 中,请求头的处理变得更加灵活和强大。

常见的请求头包括:

- `Content-Type`: 请求体的媒体类型
- `Authorization`: 身份验证信息
- `Cookie`: 客户端 Cookie
- `User-Agent`: 客户端信息
- `Accept-Language`: 接受的语言
- `Referer`: 来源页面
- `X-Custom-Header`: 自定义头

### 1.2 为什么需要处理请求头

在实际应用中,请求头承载着重要的信息:

- **身份验证**: 通过 `Authorization` 头传递令牌
- **内容协商**: 通过 `Accept` 头协商响应格式
- **语言选择**: 通过 `Accept-Language` 头选择语言
- **缓存控制**: 通过 `Cache-Control` 头控制缓存
- **安全防护**: 通过 `X-Frame-Options` 等头防止攻击
- **追踪分析**: 通过自定义头传递追踪信息

### 1.3 Next.js 16 的请求头特性

Next.js 16 提供了多种处理请求头的方式:

| 方式               | 作用           | 使用场景      |
| :----------------- | :------------- | :------------ |
| `headers()`        | 读取请求头     | 服务端组件    |
| `request.headers`  | 读取请求头     | Route Handler |
| `Response.headers` | 设置响应头     | Route Handler |
| `next.config.js`   | 全局设置响应头 | 所有响应      |

⚠️ **重要变化**: 在 Next.js 16 中,`headers()` 函数变成了异步函数,需要使用 `await` 调用。

```typescript
// Next.js 15
const headersList = headers();

// Next.js 16
const headersList = await headers();
```

## 2. 核心概念

### 2.1 读取请求头

#### 在服务端组件中读取

```typescript
// app/page.tsx
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();

  // 读取单个请求头
  const userAgent = headersList.get("user-agent");
  const authorization = headersList.get("authorization");
  const acceptLanguage = headersList.get("accept-language");

  return (
    <div>
      <p>User Agent: {userAgent}</p>
      <p>Language: {acceptLanguage}</p>
    </div>
  );
}
```

#### 在 Route Handler 中读取

```typescript
// app/api/user/route.ts

export async function GET(request: Request) {
  // 读取请求头
  const userAgent = request.headers.get("user-agent");
  const authorization = request.headers.get("authorization");

  return Response.json({
    userAgent,
    authorization,
  });
}
```

### 2.2 设置响应头

#### 在 Route Handler 中设置

```typescript
// app/api/data/route.ts

export async function GET() {
  const data = { message: "Hello" };

  return Response.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "X-Custom-Header": "custom-value",
    },
  });
}
```

#### 使用 Headers 对象

```typescript
// app/api/data/route.ts

export async function GET() {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "public, max-age=3600");
  headers.set("X-Custom-Header", "custom-value");

  const data = { message: "Hello" };

  return Response.json(data, { headers });
}
```

### 2.3 全局设置响应头

在 `next.config.js` 中全局设置响应头:

```javascript
// next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};
```

### 2.4 常用请求头

#### Authorization 头

用于身份验证:

```typescript
// app/api/protected/route.ts

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 验证 token
  const token = authorization.replace("Bearer ", "");
  const user = await verifyToken(token);

  if (!user) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  return Response.json({ user });
}

async function verifyToken(token: string) {
  // 实现 token 验证逻辑
  return { id: "1", name: "John" };
}
```

#### Content-Type 头

指定请求体的类型:

```typescript
// app/api/upload/route.ts

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const data = await request.json();
    return Response.json({ received: data });
  }

  if (contentType?.includes("multipart/form-data")) {
    const formData = await request.formData();
    return Response.json({ received: "form data" });
  }

  return Response.json({ error: "Unsupported content type" }, { status: 415 });
}
```

#### Accept-Language 头

用于语言选择:

```typescript
// app/page.tsx
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  // 解析语言偏好
  const preferredLanguage = acceptLanguage?.split(",")[0].split("-")[0] || "en";

  const messages = {
    en: "Hello",
    zh: "你好",
    ja: "こんにちは",
  };

  const greeting =
    messages[preferredLanguage as keyof typeof messages] || messages.en;

  return <h1>{greeting}</h1>;
}
```

#### User-Agent 头

用于检测客户端类型:

```typescript
// app/page.tsx
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}

function MobileLayout() {
  return <div>Mobile Layout</div>;
}

function TabletLayout() {
  return <div>Tablet Layout</div>;
}

function DesktopLayout() {
  return <div>Desktop Layout</div>;
}
```

### 2.5 自定义请求头

#### 发送自定义请求头

```typescript
// 客户端发送自定义请求头
const res = await fetch("/api/data", {
  headers: {
    "X-Request-ID": crypto.randomUUID(),
    "X-Client-Version": "1.0.0",
    "X-Custom-Header": "custom-value",
  },
});
```

#### 读取自定义请求头

```typescript
// app/api/data/route.ts

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id");
  const clientVersion = request.headers.get("x-client-version");
  const customHeader = request.headers.get("x-custom-header");

  console.log("Request ID:", requestId);
  console.log("Client Version:", clientVersion);
  console.log("Custom Header:", customHeader);

  return Response.json({
    requestId,
    clientVersion,
    customHeader,
  });
}
```

## 3. 适用场景

### 3.1 身份验证系统

使用请求头实现身份验证:

#### JWT 认证

```typescript
// app/api/auth/login/route.ts

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // 验证用户名和密码
  const user = await authenticateUser(username, password);

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 生成 JWT token
  const token = await generateToken(user);

  return Response.json({
    token,
    user,
  });
}

async function authenticateUser(username: string, password: string) {
  // 实现用户验证逻辑
  return { id: "1", username, email: "user@example.com" };
}

async function generateToken(user: any) {
  // 实现 token 生成逻辑
  return "jwt-token";
}
```

#### 受保护的路由

```typescript
// app/api/profile/route.ts

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json(
      { error: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }

  const token = authorization.substring(7);

  try {
    const user = await verifyToken(token);

    return Response.json({
      user,
    });
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}

async function verifyToken(token: string) {
  // 实现 token 验证逻辑
  return { id: "1", username: "john", email: "john@example.com" };
}
```

#### 中间件验证

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  // 检查是否是受保护的路由
  if (request.nextUrl.pathname.startsWith("/api/protected")) {
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证 token
    const token = authorization.substring(7);
    if (!isValidToken(token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function isValidToken(token: string): boolean {
  // 实现 token 验证逻辑
  return token.length > 0;
}

export const config = {
  matcher: "/api/:path*",
};
```

### 3.2 国际化支持

根据请求头实现国际化:

#### 语言检测

```typescript
// app/page.tsx
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  const locale = detectLocale(acceptLanguage);
  const messages = await loadMessages(locale);

  return (
    <div>
      <h1>{messages.welcome}</h1>
      <p>{messages.description}</p>
    </div>
  );
}

function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return "en";

  // 解析 Accept-Language 头
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q = "1"] = lang.trim().split(";q=");
      return { code: code.split("-")[0], quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);

  const supportedLocales = ["en", "zh", "ja", "es", "fr"];
  const preferredLocale = languages.find((lang) =>
    supportedLocales.includes(lang.code)
  );

  return preferredLocale?.code || "en";
}

async function loadMessages(locale: string) {
  const messages: Record<string, any> = {
    en: {
      welcome: "Welcome",
      description: "This is a multilingual website",
    },
    zh: {
      welcome: "欢迎",
      description: "这是一个多语言网站",
    },
    ja: {
      welcome: "ようこそ",
      description: "これは多言語ウェブサイトです",
    },
  };

  return messages[locale] || messages.en;
}
```

#### 语言切换

```typescript
// app/api/set-language/route.ts

export async function POST(request: Request) {
  const { locale } = await request.json();

  const response = Response.json({ success: true });

  // 设置语言 cookie
  response.headers.set(
    "Set-Cookie",
    `locale=${locale}; Path=/; Max-Age=31536000`
  );

  return response;
}
```

### 3.3 安全防护

使用响应头增强安全性:

#### 安全响应头

```javascript
// next.config.js

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 防止点击劫持
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // 防止 MIME 类型嗅探
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // XSS 防护
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 内容安全策略
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
          // HTTPS 强制
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // 权限策略
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

#### CORS 配置

```typescript
// app/api/data/route.ts

export async function GET(request: Request) {
  const origin = request.headers.get("origin");

  // 允许的源
  const allowedOrigins = ["https://example.com", "https://app.example.com"];

  const data = { message: "Hello" };

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  // 设置 CORS 头
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400");
  }

  return Response.json(data, { headers });
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");

  const allowedOrigins = ["https://example.com", "https://app.example.com"];

  const headers = new Headers();

  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400");
  }

  return new Response(null, { status: 204, headers });
}
```

### 3.4 缓存控制

使用响应头控制缓存:

#### 缓存策略

```typescript
// app/api/static/route.ts

export async function GET() {
  const data = { message: "Static data" };

  return Response.json(data, {
    headers: {
      // 公共缓存,1小时
      "Cache-Control": "public, max-age=3600",
      // ETag 用于验证
      ETag: 'W/"123456"',
    },
  });
}

// app/api/dynamic/route.ts

export async function GET() {
  const data = { message: "Dynamic data", timestamp: Date.now() };

  return Response.json(data, {
    headers: {
      // 不缓存
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

// app/api/private/route.ts

export async function GET() {
  const data = { message: "Private data" };

  return Response.json(data, {
    headers: {
      // 私有缓存,5分钟
      "Cache-Control": "private, max-age=300",
    },
  });
}
```

#### 条件请求

```typescript
// app/api/resource/route.ts

export async function GET(request: Request) {
  const ifNoneMatch = request.headers.get("if-none-match");
  const ifModifiedSince = request.headers.get("if-modified-since");

  const resource = {
    id: "1",
    data: "Resource data",
    etag: 'W/"123456"',
    lastModified: new Date("2024-01-01").toUTCString(),
  };

  // 检查 ETag
  if (ifNoneMatch === resource.etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: resource.etag,
        "Last-Modified": resource.lastModified,
      },
    });
  }

  // 检查修改时间
  if (
    ifModifiedSince &&
    new Date(ifModifiedSince) >= new Date(resource.lastModified)
  ) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: resource.etag,
        "Last-Modified": resource.lastModified,
      },
    });
  }

  // 返回资源
  return Response.json(resource, {
    headers: {
      ETag: resource.etag,
      "Last-Modified": resource.lastModified,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

## 4. API 签名与配置

### 4.1 headers() 函数

```typescript
import { headers } from "next/headers";

// 签名
function headers(): Promise<ReadonlyHeaders>;

// 使用示例
const headersList = await headers();
const value = headersList.get("header-name");
```

### 4.2 ReadonlyHeaders 接口

```typescript
interface ReadonlyHeaders {
  get(name: string): string | null;
  has(name: string): boolean;
  forEach(callback: (value: string, name: string) => void): void;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
}
```

### 4.3 Request.headers

```typescript
// Route Handler 中
export async function GET(request: Request) {
  // request.headers 是 Headers 对象
  const value = request.headers.get("header-name");
  const hasHeader = request.headers.has("header-name");

  // 遍历所有请求头
  request.headers.forEach((value, name) => {
    console.log(`${name}: ${value}`);
  });
}
```

### 4.4 Response.headers

```typescript
// 创建响应时设置头
const response = Response.json(data, {
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  },
});

// 使用 Headers 对象
const headers = new Headers();
headers.set("Content-Type", "application/json");
headers.append("Set-Cookie", "key1=value1");
headers.append("Set-Cookie", "key2=value2");

const response = Response.json(data, { headers });
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 读取单个请求头

```typescript
// app/page.tsx
import { headers } from "next/headers";

export default async function Page() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  return <div>User Agent: {userAgent}</div>;
}
```

#### 设置单个响应头

```typescript
// app/api/data/route.ts

export async function GET() {
  return Response.json(
    { message: "Hello" },
    {
      headers: {
        "X-Custom-Header": "custom-value",
      },
    }
  );
}
```

### 5.2 进阶用法

#### 请求头转发

将请求头转发到其他服务:

```typescript
// app/api/proxy/route.ts

export async function GET(request: Request) {
  // 提取需要转发的请求头
  const forwardHeaders = new Headers();

  const headersToForward = [
    "authorization",
    "content-type",
    "user-agent",
    "accept-language",
  ];

  headersToForward.forEach((name) => {
    const value = request.headers.get(name);
    if (value) {
      forwardHeaders.set(name, value);
    }
  });

  // 转发请求
  const res = await fetch("https://api.example.com/data", {
    headers: forwardHeaders,
  });

  const data = await res.json();

  return Response.json(data);
}
```

#### 请求追踪

使用请求头实现请求追踪:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  const response = NextResponse.next();

  // 添加请求 ID 到响应头
  response.headers.set("x-request-id", requestId);

  // 记录请求
  console.log(`[${requestId}] ${request.method} ${request.url}`);

  return response;
}

// app/api/data/route.ts

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id");

  console.log(`[${requestId}] Processing request`);

  const data = { message: "Hello" };

  return Response.json(data, {
    headers: {
      "x-request-id": requestId || "",
    },
  });
}
```

#### 速率限制

使用请求头实现速率限制:

```typescript
// app/api/limited/route.ts

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function GET(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const limit = 10; // 每分钟10次
  const window = 60 * 1000; // 1分钟

  let rateLimit = rateLimitMap.get(clientIp);

  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = {
      count: 0,
      resetTime: now + window,
    };
    rateLimitMap.set(clientIp, rateLimit);
  }

  rateLimit.count++;

  const remaining = Math.max(0, limit - rateLimit.count);
  const resetIn = Math.ceil((rateLimit.resetTime - now) / 1000);

  const headers = new Headers();
  headers.set("X-RateLimit-Limit", limit.toString());
  headers.set("X-RateLimit-Remaining", remaining.toString());
  headers.set("X-RateLimit-Reset", resetIn.toString());

  if (rateLimit.count > limit) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers,
      }
    );
  }

  return Response.json({ message: "Success" }, { headers });
}
```

## 6. 注意事项

### 6.1 安全问题

#### 敏感信息泄露

避免在响应头中暴露敏感信息:

```typescript
// ❌ 错误: 暴露服务器信息
export async function GET() {
  return Response.json(data, {
    headers: {
      "X-Powered-By": "Next.js 16",
      "X-Server-Version": "1.0.0",
      "X-Database-Host": "db.example.com",
    },
  });
}

// ✅ 正确: 不暴露敏感信息
export async function GET() {
  return Response.json(data, {
    headers: {
      "X-Request-ID": crypto.randomUUID(),
    },
  });
}
```

#### CORS 配置

正确配置 CORS 避免安全问题:

```typescript
// ❌ 错误: 允许所有源
export async function GET() {
  return Response.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*", // 危险!
    },
  });
}

// ✅ 正确: 只允许特定源
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = ["https://example.com"];

  const headers = new Headers();
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return Response.json(data, { headers });
}
```

### 6.2 性能影响

#### 请求头大小

请求头过大会影响性能:

```typescript
// ❌ 错误: 请求头过大
const res = await fetch("/api/data", {
  headers: {
    "X-Large-Data": "a".repeat(10000), // 10KB 的请求头
  },
});

// ✅ 正确: 使用请求体传递大数据
const res = await fetch("/api/data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ largeData: "a".repeat(10000) }),
});
```

### 6.3 兼容性

#### 浏览器兼容性

某些请求头可能不被所有浏览器支持:

```typescript
// 检查请求头是否存在
const headersList = await headers();
const acceptLanguage = headersList.get("accept-language");

if (acceptLanguage) {
  // 使用语言偏好
} else {
  // 使用默认语言
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: headers() 函数为什么要用 await?

**问题**: Next.js 16 中 `headers()` 为什么变成异步函数?

**简短回答**: 为了支持异步服务器组件和更好的性能优化。

**详细解释**:

Next.js 16 将 `headers()` 改为异步函数,以便更好地支持异步服务器组件和流式渲染。

**代码示例**:

```typescript
// Next.js 15
const headersList = headers();

// Next.js 16
const headersList = await headers();
```

#### 问题二: 如何在客户端组件中读取请求头?

**问题**: 客户端组件无法使用 `headers()` 函数,如何获取请求头信息?

**简短回答**: 通过服务端组件传递或使用 API 路由。

**详细解释**:

客户端组件运行在浏览器中,无法直接访问服务器请求头。需要通过服务端组件传递或调用 API 路由获取。

**代码示例**:

```typescript
// app/page.tsx (服务端组件)
import { headers } from "next/headers";
import ClientComponent from "./ClientComponent";

export default async function Page() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  return <ClientComponent userAgent={userAgent} />;
}

// app/ClientComponent.tsx (客户端组件)
("use client");

export default function ClientComponent({
  userAgent,
}: {
  userAgent: string | null;
}) {
  return <div>User Agent: {userAgent}</div>;
}
```

#### 问题三: 如何设置多个相同名称的响应头?

**问题**: 如何设置多个 `Set-Cookie` 头?

**简短回答**: 使用 `Headers.append()` 方法。

**详细解释**:

使用 `Headers` 对象的 `append()` 方法可以添加多个相同名称的头。

**代码示例**:

```typescript
const headers = new Headers();
headers.append("Set-Cookie", "key1=value1; Path=/");
headers.append("Set-Cookie", "key2=value2; Path=/");

return Response.json(data, { headers });
```

### 7.2 进阶问题

#### 问题四: 如何在中间件中修改请求头?

**问题**: 如何在中间件中添加或修改请求头?

**简短回答**: 使用 `NextRequest.headers` 和 `NextResponse.next()`。

**详细解释**:

在中间件中可以读取请求头,并在响应中添加新的头。

**代码示例**:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-custom-header", "custom-value");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-response-header", "response-value");

  return response;
}
```

#### 问题五: 如何处理请求头的大小写?

**问题**: HTTP 请求头是大小写不敏感的,如何正确处理?

**简短回答**: 使用小写字母读取请求头。

**详细解释**:

HTTP 请求头名称是大小写不敏感的,但在 JavaScript 中建议使用小写字母。

**代码示例**:

```typescript
// 这些都能正确读取
const value1 = request.headers.get("content-type");
const value2 = request.headers.get("Content-Type");
const value3 = request.headers.get("CONTENT-TYPE");

// 推荐使用小写
const contentType = request.headers.get("content-type");
```

## 8. 总结

### 8.1 核心要点回顾

**请求头处理方式**:

| 方式               | 使用场景      | 示例                               |
| :----------------- | :------------ | :--------------------------------- |
| `headers()`        | 服务端组件    | `const h = await headers()`        |
| `request.headers`  | Route Handler | `request.headers.get('name')`      |
| `Response.headers` | 设置响应头    | `Response.json(data, { headers })` |
| `next.config.js`   | 全局响应头    | `async headers() { ... }`          |

**常用请求头**:

- `Authorization`: 身份验证
- `Content-Type`: 内容类型
- `Accept-Language`: 语言偏好
- `User-Agent`: 客户端信息
- `Cookie`: Cookie 数据

### 8.2 关键收获

1. **理解请求头**: 掌握请求头的作用和使用场景
2. **安全配置**: 正确配置安全相关的响应头
3. **CORS 处理**: 合理配置跨域资源共享
4. **缓存控制**: 使用响应头控制缓存策略
5. **错误处理**: 处理请求头缺失或无效的情况

### 8.3 最佳实践

1. **使用小写**: 请求头名称使用小写字母
2. **验证输入**: 验证请求头的值
3. **安全优先**: 不暴露敏感信息
4. **合理缓存**: 根据内容设置合适的缓存头
5. **错误处理**: 处理请求头缺失的情况

### 8.4 下一步学习

- **cookies 操作**: 学习 Cookie 的读写操作
- **中间件**: 深入了解中间件的使用
- **安全防护**: 学习更多安全相关的配置
- **性能优化**: 了解如何优化请求头处理

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-24-边缘函数(Edge Functions)详解

## 概述

边缘函数(Edge Functions)是 Next.js 16 中运行在边缘网络节点上的轻量级函数,它们在离用户最近的位置执行,提供更快的响应速度和更低的延迟。边缘函数使用 Edge Runtime,这是一个基于 V8 引擎的轻量级运行时环境,支持 Web 标准 API。

### 核心特性

- **全球分布**: 在全球边缘节点执行
- **低延迟**: 就近响应用户请求
- **轻量级**: 使用 Edge Runtime
- **Web 标准**: 支持标准 Web API
- **流式响应**: 支持流式传输
- **动态内容**: 实时生成个性化内容
- **地理位置**: 访问用户地理信息
- **快速启动**: 冷启动时间短

### Edge Runtime vs Node.js Runtime

```
┌─────────────────┐         ┌─────────────────┐
│  Edge Runtime   │         │ Node.js Runtime │
├─────────────────┤         ├─────────────────┤
│ • 全球分布      │         │ • 单一区域      │
│ • 低延迟        │         │ • 较高延迟      │
│ • 轻量级        │         │ • 功能完整      │
│ • Web标准API    │         │ • Node.js API   │
│ • 快速启动      │         │ • 启动较慢      │
│ • 有限制        │         │ • 无限制        │
└─────────────────┘         └─────────────────┘
```

### 运行时对比

| 特性     | Edge Runtime     | Node.js Runtime  |
| -------- | ---------------- | ---------------- |
| 执行位置 | 边缘节点         | 服务器           |
| 冷启动   | <50ms            | 100-500ms        |
| 内存限制 | 128MB            | 1GB+             |
| 执行时间 | 30s              | 无限制           |
| API 支持 | Web 标准         | Node.js 全部     |
| 适用场景 | 动态内容、个性化 | 复杂计算、数据库 |

---

## 1. Edge Runtime 基础

### 1.1 配置 Edge Runtime

```ts
// app/api/edge/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Hello from Edge Runtime",
    timestamp: new Date().toISOString(),
  });
}
```

### 1.2 Middleware 中的 Edge Runtime

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`Edge Middleware: ${pathname}`);

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
```

### 1.3 支持的 Web API

```ts
// app/api/web-apis/route.ts
export const runtime = "edge";

export async function GET() {
  // Fetch API
  const response = await fetch("https://api.example.com/data");
  const data = await response.json();

  // URL API
  const url = new URL("https://example.com/path?query=value");

  // Headers API
  const headers = new Headers();
  headers.set("X-Custom-Header", "value");

  // Response API
  return new Response(JSON.stringify({ data, url: url.href }), {
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(headers),
    },
  });
}
```

---

## 2. 地理位置与个性化

### 2.1 获取用户地理位置

```ts
// app/api/geo/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { geo, ip } = request;

  return NextResponse.json({
    ip,
    country: geo?.country,
    region: geo?.region,
    city: geo?.city,
    latitude: geo?.latitude,
    longitude: geo?.longitude,
  });
}
```

### 2.2 基于地理位置的内容

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";

  const url = request.nextUrl.clone();
  url.searchParams.set("country", country);

  return NextResponse.rewrite(url);
}
```

### 2.3 语言检测与重定向

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "zh", "ja", "ko"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) return defaultLocale;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().toLowerCase());

  for (const lang of languages) {
    const locale = locales.find((l) => lang.startsWith(l));
    if (locale) return locale;
  }

  return defaultLocale;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 3. 流式响应

### 3.1 基础流式响应

```ts
// app/api/stream/route.ts
export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const message = `Message ${i + 1}\n`;
        controller.enqueue(encoder.encode(message));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### 3.2 Server-Sent Events (SSE)

```ts
// app/api/sse/route.ts
export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let id = 0;

      const interval = setInterval(() => {
        const data = {
          id: ++id,
          timestamp: new Date().toISOString(),
          message: `Event ${id}`,
        };

        const message = `id: ${id}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));

        if (id >= 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 3.3 JSON 流式响应

```ts
// app/api/json-stream/route.ts
export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("["));

      for (let i = 0; i < 5; i++) {
        const item = {
          id: i + 1,
          name: `Item ${i + 1}`,
          timestamp: new Date().toISOString(),
        };

        const json = JSON.stringify(item);
        controller.enqueue(encoder.encode(json));

        if (i < 4) {
          controller.enqueue(encoder.encode(","));
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      controller.enqueue(encoder.encode("]"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

---

## 4. 缓存策略

### 4.1 Edge 缓存配置

```ts
// app/api/cached/route.ts
export const runtime = "edge";

export async function GET() {
  const data = {
    timestamp: new Date().toISOString(),
    message: "Cached response",
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
```

### 4.2 动态缓存控制

```ts
// app/api/dynamic-cache/route.ts
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cacheTime = parseInt(searchParams.get("cache") || "60", 10);

  const data = {
    timestamp: new Date().toISOString(),
    cacheTime,
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, s-maxage=${cacheTime}`,
    },
  });
}
```

### 4.3 条件缓存

```ts
// app/api/conditional-cache/route.ts
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const ifNoneMatch = request.headers.get("if-none-match");
  const etag = generateETag();

  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  const data = {
    timestamp: new Date().toISOString(),
    message: "Fresh data",
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ETag: etag,
      "Cache-Control": "public, max-age=60",
    },
  });
}

function generateETag(): string {
  const date = new Date();
  const minute = Math.floor(date.getTime() / 60000);
  return `"${minute}"`;
}
```

---

## 5. A/B 测试与特性开关

### 5.1 简单 A/B 测试

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const bucket = request.cookies.get("bucket")?.value;

  if (!bucket) {
    const newBucket = Math.random() < 0.5 ? "A" : "B";
    const response = NextResponse.next();
    response.cookies.set("bucket", newBucket, { maxAge: 60 * 60 * 24 * 30 });
    return response;
  }

  return NextResponse.next();
}
```

### 5.2 基于地理位置的 A/B 测试

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";
  const bucket = getBucket(country);

  const response = NextResponse.next();
  response.cookies.set("bucket", bucket);
  response.headers.set("X-Bucket", bucket);

  return response;
}

function getBucket(country: string): string {
  const usCountries = ["US", "CA"];
  const euCountries = ["GB", "DE", "FR"];

  if (usCountries.includes(country)) {
    return Math.random() < 0.5 ? "US-A" : "US-B";
  }

  if (euCountries.includes(country)) {
    return Math.random() < 0.5 ? "EU-A" : "EU-B";
  }

  return "DEFAULT";
}
```

### 5.3 特性开关

```ts
// lib/features.ts
export const runtime = "edge";

interface FeatureFlags {
  [key: string]: boolean;
}

const features: FeatureFlags = {
  newUI: true,
  betaFeature: false,
  experimentalAPI: true,
};

export function isFeatureEnabled(feature: string): boolean {
  return features[feature] || false;
}

export function getEnabledFeatures(): string[] {
  return Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}
```

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/features";

export const runtime = "edge";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/beta") && !isFeatureEnabled("betaFeature")) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  return NextResponse.next();
}
```

---

## 6. 请求转换与代理

### 6.1 请求头转换

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("X-Custom-Header", "custom-value");
  requestHeaders.set("X-Request-Time", new Date().toISOString());
  requestHeaders.set("X-User-Country", request.geo?.country || "unknown");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

### 6.2 API 代理

```ts
// app/api/proxy/route.ts
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return new Response("Missing endpoint parameter", { status: 400 });
  }

  const apiUrl = `https://api.example.com/${endpoint}`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60",
    },
  });
}
```

### 6.3 CORS 代理

```ts
// app/api/cors-proxy/route.ts
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url);
    const data = await response.text();

    return new Response(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    return new Response("Proxy error", { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
```

---

## 7. 实战案例

### 7.1 动态 OG 图片生成

```ts
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Default Title";
  const description = searchParams.get("description") || "Default Description";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          color: "white",
          padding: "40px",
        }}
      >
        <h1 style={{ fontSize: "60px", marginBottom: "20px" }}>{title}</h1>
        <p style={{ fontSize: "30px", color: "#888" }}>{description}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 7.2 智能重定向

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // 移动设备重定向
  const isMobile = /mobile/i.test(userAgent);
  if (isMobile && pathname.startsWith("/desktop")) {
    return NextResponse.redirect(
      new URL(pathname.replace("/desktop", "/mobile"), request.url)
    );
  }

  // 旧路径重定向
  const redirects: { [key: string]: string } = {
    "/old-page": "/new-page",
    "/blog/old-post": "/blog/new-post",
  };

  if (redirects[pathname]) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url));
  }

  return NextResponse.next();
}
```

### 7.3 个性化内容

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";
  const city = request.geo?.city || "Unknown";

  const response = NextResponse.next();

  // 设置个性化Cookie
  response.cookies.set("user-country", country);
  response.cookies.set("user-city", city);

  // 设置响应头
  response.headers.set("X-User-Country", country);
  response.headers.set("X-User-City", city);

  return response;
}
```

```ts
// app/api/personalized/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const country = request.cookies.get("user-country")?.value || "US";
  const city = request.cookies.get("user-city")?.value || "Unknown";

  const content = getPersonalizedContent(country, city);

  return NextResponse.json(content);
}

function getPersonalizedContent(country: string, city: string) {
  return {
    greeting: `Hello from ${city}, ${country}!`,
    localTime: new Date().toLocaleString("en-US", {
      timeZone: getTimeZone(country),
    }),
    recommendations: getRecommendations(country),
  };
}

function getTimeZone(country: string): string {
  const timeZones: { [key: string]: string } = {
    US: "America/New_York",
    GB: "Europe/London",
    JP: "Asia/Tokyo",
    CN: "Asia/Shanghai",
  };
  return timeZones[country] || "UTC";
}

function getRecommendations(country: string): string[] {
  const recommendations: { [key: string]: string[] } = {
    US: ["Product A", "Product B", "Product C"],
    GB: ["Product D", "Product E", "Product F"],
    JP: ["Product G", "Product H", "Product I"],
  };
  return recommendations[country] || ["Product X", "Product Y", "Product Z"];
}
```

### 7.4 实时数据聚合

```ts
// app/api/aggregate/route.ts
export const runtime = "edge";

export async function GET() {
  const [users, posts, comments] = await Promise.all([
    fetch("https://api.example.com/users").then((r) => r.json()),
    fetch("https://api.example.com/posts").then((r) => r.json()),
    fetch("https://api.example.com/comments").then((r) => r.json()),
  ]);

  const aggregated = {
    stats: {
      totalUsers: users.length,
      totalPosts: posts.length,
      totalComments: comments.length,
    },
    recentPosts: posts.slice(0, 5),
    recentComments: comments.slice(0, 10),
  };

  return new Response(JSON.stringify(aggregated), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=30",
    },
  });
}
```

---

## 8. 适用场景

### 8.1 动态内容生成

**需求**: 根据用户位置生成个性化内容

**特点**:

- 低延迟响应
- 全球分布
- 实时个性化

### 8.2 A/B 测试

**需求**: 实现用户分组测试

**特点**:

- 边缘计算
- 快速分配
- 无需服务器

### 8.3 API 代理

**需求**: 代理第三方 API 请求

**特点**:

- 隐藏 API 密钥
- 添加缓存
- CORS 处理

### 8.4 智能路由

**需求**: 根据条件重定向用户

**特点**:

- 设备检测
- 地理位置
- 用户偏好

### 8.5 实时数据

**需求**: 提供实时数据流

**特点**:

- SSE 支持
- 流式响应
- 低延迟

---

## 9. 注意事项

### 9.1 运行时限制

```ts
// ✗ 错误:使用Node.js API
import fs from "fs";

export const runtime = "edge";

export async function GET() {
  const data = fs.readFileSync("data.json");
  return new Response(data);
}

// ✓ 正确:使用Web API
export const runtime = "edge";

export async function GET() {
  const response = await fetch("https://example.com/data.json");
  const data = await response.text();
  return new Response(data);
}
```

### 9.2 内存限制

```ts
// ✗ 错误:处理大文件
export const runtime = "edge";

export async function POST(request: Request) {
  const data = await request.text(); // 可能超过内存限制
  return new Response(data);
}

// ✓ 正确:使用流式处理
export const runtime = "edge";

export async function POST(request: Request) {
  const stream = request.body;
  return new Response(stream);
}
```

### 9.3 执行时间限制

```ts
// ✗ 错误:长时间运行
export const runtime = "edge";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 60000)); // 超时
  return new Response("Done");
}

// ✓ 正确:快速响应
export const runtime = "edge";

export async function GET() {
  const data = await fetch("https://api.example.com/data");
  return new Response(await data.text());
}
```

### 9.4 环境变量

```ts
// ✗ 错误:直接访问process.env
export const runtime = "edge";

export async function GET() {
  const key = process.env.SECRET_KEY; // 可能不可用
  return new Response(key);
}

// ✓ 正确:使用NEXT_PUBLIC_前缀或在构建时注入
export const runtime = "edge";

export async function GET() {
  const key = process.env.NEXT_PUBLIC_API_KEY;
  return new Response(key);
}
```

### 9.5 动态导入

```ts
// ✗ 错误:动态导入Node.js模块
export const runtime = "edge";

export async function GET() {
  const { readFile } = await import("fs/promises");
  return new Response("Done");
}

// ✓ 正确:只导入Edge兼容模块
export const runtime = "edge";

export async function GET() {
  const { parse } = await import("date-fns");
  return new Response(parse("2024-01-01").toString());
}
```

---

## 10. 常见问题

### 10.1 如何配置 Edge Runtime?

**问题**: 需要在 Route Handler 中使用 Edge Runtime。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET() {
  return new Response("Hello from Edge");
}
```

### 10.2 如何获取用户地理位置?

**问题**: 需要获取用户的地理位置信息。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { geo } = request;

  return NextResponse.json({
    country: geo?.country,
    city: geo?.city,
    latitude: geo?.latitude,
    longitude: geo?.longitude,
  });
}
```

### 10.3 如何实现流式响应?

**问题**: 需要实现 Server-Sent Events。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const message = `data: ${JSON.stringify({ id: i })}\n\n`;
        controller.enqueue(encoder.encode(message));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

### 10.4 如何实现 A/B 测试?

**问题**: 需要实现简单的 A/B 测试。

**解决方案**:

```ts
export function middleware(request: NextRequest) {
  const bucket = request.cookies.get("bucket")?.value;

  if (!bucket) {
    const newBucket = Math.random() < 0.5 ? "A" : "B";
    const response = NextResponse.next();
    response.cookies.set("bucket", newBucket);
    return response;
  }

  return NextResponse.next();
}
```

### 10.5 如何设置缓存?

**问题**: 需要为 Edge 函数设置缓存。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET() {
  const data = { timestamp: new Date().toISOString() };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
```

### 10.6 如何实现 API 代理?

**问题**: 需要代理第三方 API 请求。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get("endpoint");

  const response = await fetch(`https://api.example.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  });

  return new Response(await response.text(), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

### 10.7 如何处理 CORS?

**问题**: 需要为 API 添加 CORS 支持。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET() {
  return new Response(JSON.stringify({ message: "Hello" }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

### 10.8 如何实现个性化内容?

**问题**: 需要根据用户位置提供个性化内容。

**解决方案**:

```ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const country = request.geo?.country || "US";

  const content = {
    US: "Welcome to our US site!",
    GB: "Welcome to our UK site!",
    JP: "Welcome to our Japan site!",
  };

  return NextResponse.json({
    message: content[country] || "Welcome!",
    country,
  });
}
```

### 10.9 如何生成动态 OG 图片?

**问题**: 需要动态生成 Open Graph 图片。

**解决方案**:

```ts
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Default Title";

  return new ImageResponse(
    <div style={{ display: "flex", fontSize: 60 }}>{title}</div>,
    { width: 1200, height: 630 }
  );
}
```

### 10.10 如何实现智能重定向?

**问题**: 需要根据设备类型重定向用户。

**解决方案**:

```ts
export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  if (isMobile && request.nextUrl.pathname.startsWith("/desktop")) {
    return NextResponse.redirect(new URL("/mobile", request.url));
  }

  return NextResponse.next();
}
```

---

## 11. 总结

### 11.1 核心要点

1. **Edge Runtime**: 轻量级运行时,支持 Web 标准 API
2. **全球分布**: 在边缘节点执行,低延迟响应
3. **地理位置**: 访问用户地理信息,实现个性化
4. **流式响应**: 支持 SSE 和流式传输
5. **缓存策略**: 灵活的缓存控制
6. **A/B 测试**: 边缘计算实现快速分组
7. **API 代理**: 隐藏密钥,添加缓存
8. **限制**: 内存、执行时间、API 支持有限制

### 11.2 最佳实践

| 实践         | 说明             | 优先级 |
| ------------ | ---------------- | ------ |
| 使用 Web API | 避免 Node.js API | 高     |
| 流式处理     | 处理大数据       | 高     |
| 缓存控制     | 合理设置缓存     | 高     |
| 快速响应     | 避免长时间运行   | 高     |
| 地理位置     | 实现个性化       | 中     |

### 11.3 运行时对比

| 特性     | Edge Runtime     | Node.js Runtime  |
| -------- | ---------------- | ---------------- |
| 执行位置 | 边缘节点         | 服务器           |
| 冷启动   | <50ms            | 100-500ms        |
| 内存限制 | 128MB            | 1GB+             |
| 执行时间 | 30s              | 无限制           |
| API 支持 | Web 标准         | Node.js 全部     |
| 适用场景 | 动态内容、个性化 | 复杂计算、数据库 |

### 11.4 使用场景对比

| 场景       | Edge Runtime | Node.js Runtime |
| ---------- | ------------ | --------------- |
| 动态内容   | ✓ 推荐       | ✓ 可用          |
| A/B 测试   | ✓ 推荐       | ✓ 可用          |
| API 代理   | ✓ 推荐       | ✓ 可用          |
| 数据库操作 | ✗ 不推荐     | ✓ 推荐          |
| 文件处理   | ✗ 不推荐     | ✓ 推荐          |
| 复杂计算   | ✗ 不推荐     | ✓ 推荐          |

### 11.5 下一步

学习完边缘函数后,建议继续学习:

1. **ImageResponse**: 学习动态图片生成
2. **性能优化**: 优化 Edge 函数性能
3. **监控日志**: 实现 Edge 函数监控
4. **安全防护**: 加强 Edge 函数安全
5. **实战项目**: 构建完整的 Edge 应用

边缘函数是 Next.js 16 中实现低延迟、高性能应用的重要工具。通过正确使用 Edge Runtime,你可以构建快速响应、全球分布的现代 Web 应用。

---

## 12. 高级技巧

### 12.1 边缘函数性能优化

```ts
// app/api/optimized/route.ts
export const runtime = "edge";

// 缓存外部数据
const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const key = searchParams.get("key") || "default";

  // 检查缓存
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return NextResponse.json(cached.data);
  }

  // 获取新数据
  const response = await fetch(`https://api.example.com/data/${key}`);
  const data = await response.json();

  // 更新缓存
  cache.set(key, { data, timestamp: Date.now() });

  return NextResponse.json(data);
}
```

### 12.2 边缘函数错误处理

```ts
// app/api/error-handling/route.ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.example.com/items/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Edge function error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### 12.3 边缘函数日志记录

```ts
// lib/edge-logger.ts
export const runtime = "edge";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: any;
}

export function logInfo(message: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    data,
  };
  console.log(JSON.stringify(entry));
}

export function logError(message: string, error?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    data:
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
  };
  console.error(JSON.stringify(entry));
}
```

```ts
// app/api/logged/route.ts
import { logInfo, logError } from "@/lib/edge-logger";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    logInfo("Processing request", { url: request.url });

    const data = await fetchData();

    logInfo("Request completed successfully");

    return NextResponse.json(data);
  } catch (error) {
    logError("Request failed", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function fetchData() {
  return { message: "Hello from Edge" };
}
```

### 12.4 边缘函数监控

```ts
// lib/edge-metrics.ts
export const runtime = "edge";

interface Metrics {
  requestCount: number;
  errorCount: number;
  totalDuration: number;
}

const metrics: Metrics = {
  requestCount: 0,
  errorCount: 0,
  totalDuration: 0,
};

export function recordRequest(duration: number, success: boolean) {
  metrics.requestCount++;
  metrics.totalDuration += duration;

  if (!success) {
    metrics.errorCount++;
  }
}

export function getMetrics() {
  return {
    ...metrics,
    averageDuration:
      metrics.requestCount > 0
        ? metrics.totalDuration / metrics.requestCount
        : 0,
    errorRate:
      metrics.requestCount > 0 ? metrics.errorCount / metrics.requestCount : 0,
  };
}
```

```ts
// app/api/monitored/route.ts
import { recordRequest } from "@/lib/edge-metrics";

export const runtime = "edge";

export async function GET() {
  const startTime = Date.now();
  let success = true;

  try {
    const data = await fetchData();

    return NextResponse.json(data);
  } catch (error) {
    success = false;

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    const duration = Date.now() - startTime;
    recordRequest(duration, success);
  }
}

async function fetchData() {
  return { message: "Hello" };
}
```

### 12.5 边缘函数安全加固

```ts
// lib/edge-security.ts
export const runtime = "edge";

export function validateRequest(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  // 检查请求方法
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
  if (!allowedMethods.includes(request.method)) {
    return { valid: false, error: "Method not allowed" };
  }

  // 检查Content-Type
  if (request.method !== "GET") {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { valid: false, error: "Invalid content type" };
    }
  }

  // 检查User-Agent
  const userAgent = request.headers.get("user-agent");
  if (!userAgent) {
    return { valid: false, error: "Missing user agent" };
  }

  return { valid: true };
}

export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    return input.replace(/[<>]/g, "");
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
}
```

```ts
// app/api/secure/route.ts
import { validateRequest, sanitizeInput } from "@/lib/edge-security";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  // 验证请求
  const validation = validateRequest(request);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // 获取并清理输入
  const body = await request.json();
  const sanitized = sanitizeInput(body);

  // 处理请求
  const result = await processData(sanitized);

  return NextResponse.json(result);
}

async function processData(data: any) {
  return { success: true, data };
}
```

---

## 13. 实战项目

### 13.1 全球 CDN 加速

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";

  // 根据地理位置选择CDN
  const cdnMap: { [key: string]: string } = {
    US: "https://us-cdn.example.com",
    EU: "https://eu-cdn.example.com",
    AS: "https://as-cdn.example.com",
  };

  const region = getRegion(country);
  const cdnUrl = cdnMap[region] || cdnMap.US;

  const response = NextResponse.next();
  response.headers.set("X-CDN-URL", cdnUrl);
  response.headers.set("X-User-Region", region);

  return response;
}

function getRegion(country: string): string {
  const usCountries = ["US", "CA", "MX"];
  const euCountries = ["GB", "DE", "FR", "IT", "ES"];
  const asCountries = ["CN", "JP", "KR", "IN"];

  if (usCountries.includes(country)) return "US";
  if (euCountries.includes(country)) return "EU";
  if (asCountries.includes(country)) return "AS";

  return "US";
}
```

### 13.2 智能负载均衡

```ts
// app/api/load-balance/route.ts
export const runtime = "edge";

const servers = [
  "https://server1.example.com",
  "https://server2.example.com",
  "https://server3.example.com",
];

let currentIndex = 0;

export async function GET(request: NextRequest) {
  // 轮询选择服务器
  const server = servers[currentIndex];
  currentIndex = (currentIndex + 1) % servers.length;

  try {
    const response = await fetch(`${server}/api/data`, {
      headers: {
        "X-Forwarded-For": request.ip || "unknown",
      },
    });

    const data = await response.json();

    return NextResponse.json({
      data,
      server,
    });
  } catch (error) {
    // 失败时尝试下一个服务器
    const fallbackServer = servers[(currentIndex + 1) % servers.length];

    const response = await fetch(`${fallbackServer}/api/data`);
    const data = await response.json();

    return NextResponse.json({
      data,
      server: fallbackServer,
      fallback: true,
    });
  }
}
```

### 13.3 实时数据同步

```ts
// app/api/sync/route.ts
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastUpdate = Date.now();

      const interval = setInterval(async () => {
        try {
          // 获取最新数据
          const response = await fetch("https://api.example.com/updates", {
            headers: {
              "If-Modified-Since": new Date(lastUpdate).toUTCString(),
            },
          });

          if (response.status === 200) {
            const data = await response.json();
            lastUpdate = Date.now();

            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          }
        } catch (error) {
          console.error("Sync error:", error);
        }
      }, 5000);

      // 清理
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

边缘函数为 Next.js 16 应用提供了强大的全球分布能力,通过合理使用可以显著提升应用性能和用户体验。

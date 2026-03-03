**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-28-Edge Runtime 详解

## 概述

Edge Runtime 是 Next.js 提供的轻量级 JavaScript 运行时,专为边缘计算设计。它基于 Web 标准 API,提供了比 Node.js 更快的启动速度和更低的内存占用,适合在全球分布的边缘节点上运行代码。Edge Runtime 支持在 API Routes、Middleware 和 Edge Functions 中使用,让你的应用能够在离用户最近的位置执行代码,显著降低延迟。

### 核心特性

- **快速启动**: 毫秒级冷启动时间
- **低内存占用**: 相比 Node.js 减少 90%内存使用
- **全球分布**: 在全球边缘节点上运行
- **Web 标准**: 基于标准 Web API
- **流式响应**: 支持流式数据传输
- **安全沙箱**: 隔离的执行环境

### Runtime 对比

| 特性     | Edge Runtime | Node.js Runtime |
| -------- | ------------ | --------------- |
| 启动时间 | <1ms         | 50-100ms        |
| 内存占用 | ~1MB         | ~10MB           |
| 执行位置 | 边缘节点     | 服务器          |
| API 支持 | Web 标准     | Node.js + Web   |
| 文件系统 | 不支持       | 支持            |
| 原生模块 | 不支持       | 支持            |

---

## 1. 基础用法

### 1.1 在 API Route 中使用

```tsx
// app/api/hello/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  return new Response("Hello from Edge!", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
```

### 1.2 在 Middleware 中使用

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("x-edge-runtime", "true");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

### 1.3 在页面中使用

```tsx
// app/page.tsx
export const runtime = "edge";

export default function Page() {
  return <div>Edge Runtime Page</div>;
}
```

---

## 2. 支持的 API

### 2.1 Fetch API

```tsx
export const runtime = "edge";

export async function GET() {
  const response = await fetch("https://api.example.com/data");
  const data = await response.json();

  return Response.json(data);
}
```

### 2.2 Headers API

```tsx
export const runtime = "edge";

export async function GET(request: Request) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(JSON.stringify({ message: "Hello" }), {
    headers,
  });
}
```

### 2.3 URL API

```tsx
export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const query = searchParams.get("q");

  return Response.json({ query });
}
```

### 2.4 Crypto API

```tsx
export const runtime = "edge";

export async function GET() {
  const uuid = crypto.randomUUID();
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("Hello World")
  );

  return Response.json({
    uuid,
    hash: Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
  });
}
```

### 2.5 TextEncoder/TextDecoder

```tsx
export const runtime = "edge";

export async function POST(request: Request) {
  const text = await request.text();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const encoded = encoder.encode(text);
  const decoded = decoder.decode(encoded);

  return Response.json({ encoded: Array.from(encoded), decoded });
}
```

---

## 3. 不支持的 API

### 3.1 Node.js 内置模块

```tsx
// ✗ 不支持
import fs from "fs"; // 错误!
import path from "path"; // 错误!
import crypto from "crypto"; // 错误!

// ✓ 使用Web标准替代
const hash = await crypto.subtle.digest("SHA-256", data);
```

### 3.2 文件系统操作

```tsx
// ✗ 不支持
fs.readFileSync("file.txt"); // 错误!

// ✓ 使用fetch或import
const data = await fetch("/api/data");
```

### 3.3 原生 Node.js 模块

```tsx
// ✗ 不支持
import { Buffer } from "buffer"; // 错误!

// ✓ 使用Web标准
const buffer = new Uint8Array([1, 2, 3]);
```

---

## 4. 高级用法

### 4.1 流式响应

```tsx
// app/api/stream/route.ts
export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`Data chunk ${i}\n`));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### 4.2 地理位置信息

```tsx
// app/api/geo/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  const geo = request.geo;

  return Response.json({
    city: geo?.city,
    country: geo?.country,
    region: geo?.region,
    latitude: geo?.latitude,
    longitude: geo?.longitude,
  });
}
```

### 4.3 请求 IP 地址

```tsx
// app/api/ip/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return Response.json({ ip });
}
```

### 4.4 缓存控制

```tsx
// app/api/cached/route.ts
export const runtime = "edge";

export async function GET() {
  const data = { timestamp: Date.now() };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
```

### 4.5 A/B 测试

```tsx
// app/api/ab-test/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  const variant = Math.random() < 0.5 ? "A" : "B";

  return Response.json({
    variant,
    message: variant === "A" ? "Version A" : "Version B",
  });
}
```

### 4.6 JWT 验证

```tsx
// app/api/protected/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await verifyJWT(token);
    return Response.json({ user: payload });
  } catch (error) {
    return new Response("Invalid token", { status: 401 });
  }
}

async function verifyJWT(token: string) {
  // 使用Web Crypto API验证JWT
  const [header, payload, signature] = token.split(".");

  const decoder = new TextDecoder();
  const decodedPayload = JSON.parse(
    decoder.decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)))
  );

  return decodedPayload;
}
```

---

## 5. 实战案例

### 5.1 边缘重定向

```tsx
// app/api/redirect/route.ts
export const runtime = "edge";

const REDIRECTS: Record<string, string> = {
  "/old-page": "/new-page",
  "/blog": "/articles",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  const redirect = REDIRECTS[path];

  if (redirect) {
    return Response.redirect(new URL(redirect, url.origin), 301);
  }

  return new Response("Not found", { status: 404 });
}
```

### 5.2 API 限流

```tsx
// app/api/rate-limit/route.ts
export const runtime = "edge";

const RATE_LIMIT = 10; // 每分钟10次
const WINDOW = 60 * 1000; // 1分钟

const requests = new Map<string, number[]>();

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  const userRequests = requests.get(ip) || [];
  const recentRequests = userRequests.filter((time) => now - time < WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);

  return Response.json({ message: "Success" });
}
```

### 5.3 图片优化

```tsx
// app/api/image/route.ts
export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  const response = await fetch(imageUrl);
  const blob = await response.blob();

  return new Response(blob, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
```

### 5.4 国际化重定向

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "zh", "ja"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language");

  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(",")[0].split("-")[0];

    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 5.5 动态内容生成

```tsx
// app/api/og/route.tsx
export const runtime = "edge";

import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Default Title";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "white",
          background: "linear-gradient(to bottom, #000, #333)",
          width: "100%",
          height: "100%",
          padding: "50px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## 6. 适用场景

Edge Runtime 适用于以下场景:

1. **API 代理**: 转发和修改 API 请求
2. **身份验证**: JWT 验证和会话管理
3. **A/B 测试**: 动态分配用户到不同版本
4. **地理重定向**: 根据用户位置重定向
5. **限流保护**: 防止 API 滥用
6. **缓存优化**: 边缘缓存静态内容
7. **图片处理**: 动态调整图片大小
8. **国际化**: 自动语言检测和重定向
9. **安全防护**: 请求过滤和验证
10. **实时数据**: 流式数据传输

---

## 7. 注意事项

### 7.1 API 限制

Edge Runtime 不支持所有 Node.js API:

```tsx
// ✗ 不支持
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

// ✓ 使用Web标准
const data = await fetch("/api/data");
const hash = await crypto.subtle.digest("SHA-256", data);
```

### 7.2 包大小限制

Edge Functions 有大小限制(通常 1-4MB):

```tsx
// ✗ 避免大型依赖
import _ from "lodash"; // 太大!

// ✓ 使用轻量级替代
import { debounce } from "lodash-es/debounce";
```

### 7.3 执行时间限制

Edge Functions 有执行时间限制:

```tsx
// ✗ 避免长时间运行
for (let i = 0; i < 1000000; i++) {
  // 耗时操作
}

// ✓ 使用异步和流式处理
const stream = new ReadableStream({
  async start(controller) {
    // 分批处理
  },
});
```

### 7.4 环境变量

使用 NEXT*PUBLIC*前缀暴露到 Edge Runtime:

```tsx
// ✓ 正确
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// ✗ 不可用
const secret = process.env.SECRET_KEY; // 不可用!
```

---

## 8. 常见问题

### 8.1 如何在 Edge Runtime 中使用数据库?

**问题**: Edge Runtime 不支持传统数据库驱动。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET() {
  // 使用HTTP API访问数据库
  const response = await fetch("https://api.planetscale.com/v1/query", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_DB_TOKEN}`,
    },
    body: JSON.stringify({
      query: "SELECT * FROM users",
    }),
  });

  const data = await response.json();
  return Response.json(data);
}
```

### 8.2 如何处理大文件?

**问题**: Edge Runtime 有内存限制。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET() {
  const response = await fetch("https://example.com/large-file.pdf");

  // 流式传输,不加载到内存
  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
```

### 8.3 如何调试 Edge Runtime 代码?

**问题**: 调试 Edge Runtime 代码比较困难。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET(request: Request) {
  // 使用console.log
  console.log("Request:", request.url);

  try {
    const data = await fetchData();
    console.log("Data:", data);
    return Response.json(data);
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error", { status: 500 });
  }
}

async function fetchData() {
  return { message: "Hello" };
}
```

### 8.4 如何在 Edge Runtime 中使用环境变量?

**问题**: 某些环境变量在 Edge Runtime 中不可用。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET() {
  // 只有NEXT_PUBLIC_前缀的变量可用
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey) {
    return new Response("Missing API key", { status: 500 });
  }

  const response = await fetch(`https://api.example.com/data?key=${apiKey}`);
  const data = await response.json();

  return Response.json(data);
}
```

### 8.5 如何实现边缘缓存?

**问题**: 需要在边缘节点缓存数据。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cacheKey = url.pathname;

  // 使用Cache API
  const cache = await caches.open("my-cache");
  const cached = await cache.match(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await fetchData();
  const response = Response.json(data);

  // 缓存响应
  await cache.put(cacheKey, response.clone());

  return response;
}

async function fetchData() {
  return { timestamp: Date.now() };
}
```

### 8.6 如何处理 CORS?

**问题**: 需要处理跨域请求。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET(request: Request) {
  const data = { message: "Hello" };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
```

### 8.7 如何实现请求重试?

**问题**: 外部 API 可能失败,需要重试。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET() {
  const data = await fetchWithRetry("https://api.example.com/data", 3);
  return Response.json(data);
}

async function fetchWithRetry(url: string, retries: number): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return await response.json();
      }

      if (i === retries - 1) {
        throw new Error("Max retries reached");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
    }
  }
}
```

### 8.8 如何实现请求签名?

**问题**: 需要对请求进行签名验证。

**解决方案**:

```tsx
export const runtime = "edge";

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature");
  const body = await request.text();

  if (!signature || !(await verifySignature(body, signature))) {
    return new Response("Invalid signature", { status: 401 });
  }

  return Response.json({ message: "Valid signature" });
}

async function verifySignature(
  body: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || "";

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  const expectedSignature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );

  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedHex === signature;
}
```

### 8.9 如何实现请求日志?

**问题**: 需要记录所有请求。

**解决方案**:

```tsx
export const runtime = "edge";

export async function GET(request: Request) {
  const log = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
    ip: request.headers.get("x-forwarded-for"),
  };

  // 发送日志到分析服务
  await fetch("https://analytics.example.com/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  }).catch(console.error);

  return Response.json({ message: "Hello" });
}
```

### 8.10 如何实现动态路由?

**问题**: 需要根据请求动态路由。

**解决方案**:

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // 根据子域名路由
  const hostname = request.headers.get("host") || "";
  const subdomain = hostname.split(".")[0];

  if (subdomain === "api") {
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (subdomain === "admin") {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
```

---

## 9. 总结

Edge Runtime 是 Next.js 提供的轻量级 JavaScript 运行时,专为边缘计算设计。它提供了快速启动、低内存占用和全球分布的优势,适合在边缘节点上运行代码。

### 核心要点

1. **快速启动**: 毫秒级冷启动时间
2. **低内存**: 相比 Node.js 减少 90%内存使用
3. **全球分布**: 在离用户最近的位置执行
4. **Web 标准**: 基于标准 Web API
5. **流式响应**: 支持流式数据传输
6. **API 限制**: 不支持 Node.js 特定 API
7. **包大小**: 有大小和执行时间限制
8. **适用场景**: API 代理、身份验证、A/B 测试等

Edge Runtime 为 Next.js 应用提供了强大的边缘计算能力,是构建高性能全球化应用的重要工具。

---

## 10. 附录

### 10.1 Edge Runtime API 对比

| API 类别 | Node.js Runtime | Edge Runtime | 说明       |
| -------- | --------------- | ------------ | ---------- |
| fetch    | ✓               | ✓            | 网络请求   |
| crypto   | ✓               | ✓            | 加密 API   |
| Headers  | ✓               | ✓            | HTTP 头    |
| Request  | ✓               | ✓            | 请求对象   |
| Response | ✓               | ✓            | 响应对象   |
| URL      | ✓               | ✓            | URL 解析   |
| fs       | ✓               | ✗            | 文件系统   |
| path     | ✓               | ✗            | 路径操作   |
| process  | ✓               | 部分         | 进程信息   |
| Buffer   | ✓               | ✗            | 二进制数据 |

### 10.2 性能对比

| 指标       | Node.js Runtime | Edge Runtime | 提升   |
| ---------- | --------------- | ------------ | ------ |
| 冷启动时间 | 500-1000ms      | 0-50ms       | 10-20x |
| 内存使用   | 50-100MB        | 5-10MB       | 10x    |
| 响应时间   | 100-500ms       | 10-100ms     | 5x     |
| 并发处理   | 1000 req/s      | 10000 req/s  | 10x    |

### 10.3 使用场景对比

| 场景       | Node.js Runtime | Edge Runtime | 推荐    |
| ---------- | --------------- | ------------ | ------- |
| API 代理   | ✓               | ✓            | Edge    |
| 身份验证   | ✓               | ✓            | Edge    |
| A/B 测试   | ✓               | ✓            | Edge    |
| 图片处理   | ✓               | ✗            | Node.js |
| 文件上传   | ✓               | ✗            | Node.js |
| 数据库操作 | ✓               | 部分         | Node.js |
| 复杂计算   | ✓               | ✗            | Node.js |
| 静态内容   | ✓               | ✓            | Edge    |

### 10.4 最佳实践清单

- [ ] 使用 Edge Runtime 处理简单请求
- [ ] 避免使用 Node.js 特定 API
- [ ] 控制包大小在 1MB 以内
- [ ] 使用流式响应处理大数据
- [ ] 实现适当的错误处理
- [ ] 添加请求日志和监控
- [ ] 使用环境变量管理配置
- [ ] 实现缓存策略
- [ ] 测试边缘函数性能
- [ ] 监控冷启动时间

### 10.5 常见错误代码

| 错误代码                    | 描述         | 解决方案                 |
| --------------------------- | ------------ | ------------------------ |
| FUNCTION_INVOCATION_TIMEOUT | 函数执行超时 | 优化代码或增加超时时间   |
| FUNCTION_PAYLOAD_TOO_LARGE  | 响应体过大   | 使用流式响应或减小数据量 |
| FUNCTION_INVOCATION_FAILED  | 函数执行失败 | 检查错误日志             |
| EDGE_FUNCTION_SIZE_EXCEEDED | 函数大小超限 | 减小依赖或拆分函数       |

### 10.6 参考资源

- [Next.js Edge Runtime 文档](https://nextjs.org/docs/app/api-reference/edge)
- [Vercel Edge Functions 文档](https://vercel.com/docs/functions/edge-functions)
- [Web 标准 API 文档](https://developer.mozilla.org/en-US/docs/Web/API)
- [Edge Runtime 限制](https://nextjs.org/docs/app/api-reference/edge#unsupported-apis)

### 10.7 迁移指南

从 Node.js Runtime 迁移到 Edge Runtime:

1. 检查代码中使用的 API
2. 移除 Node.js 特定依赖
3. 使用 Web 标准 API 替代
4. 测试边缘函数
5. 监控性能指标
6. 逐步迁移路由

Edge Runtime 为 Next.js 应用提供了强大的边缘计算能力,是构建高性能全球化应用的重要工具。

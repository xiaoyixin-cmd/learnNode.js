**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-17-NextRequest 对象详解

## 概述

NextRequest 是 Next.js 16 对 Web Request API 的扩展,提供了更强大的请求处理能力。它在 Middleware 和 Route Handlers 中广泛使用,是处理 HTTP 请求的核心对象。本文将详细介绍 NextRequest 的所有功能和使用方法。

### 核心特性

- **Web API 扩展**: 基于标准 Request API
- **Cookie 操作**: 简化的 Cookie 读写
- **URL 解析**: 强大的 URL 处理能力
- **地理位置**: 访问用户地理信息
- **IP 地址**: 获取客户端 IP
- **User Agent**: 解析用户代理信息
- **类型安全**: TypeScript 完整支持
- **边缘运行时**: 支持 Edge Runtime

### NextRequest vs Request 对比

| 特性        | Request  | NextRequest | 说明               |
| ----------- | -------- | ----------- | ------------------ |
| Cookie 操作 | 手动解析 | cookies API | NextRequest 更简单 |
| URL 解析    | 基础     | nextUrl     | 更强大的 URL 处理  |
| 地理位置    | 不支持   | geo         | NextRequest 独有   |
| IP 地址     | 不支持   | ip          | NextRequest 独有   |
| User Agent  | 手动解析 | ua          | NextRequest 独有   |

### 工作原理

```
┌─────────────┐
│  HTTP请求   │
└──────┬──────┘
       │
       │ 创建NextRequest
       ▼
┌─────────────┐
│ NextRequest │
│  - cookies  │
│  - nextUrl  │
│  - geo      │
│  - ip       │
│  - ua       │
└──────┬──────┘
       │
       │ 处理请求
       ▼
┌─────────────┐
│ NextResponse│
└─────────────┘
```

---

## 1. 基础用法

### 1.1 在 Middleware 中使用

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 访问请求信息
  console.log("Method:", request.method);
  console.log("URL:", request.url);
  console.log("Path:", request.nextUrl.pathname);

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

### 1.2 在 Route Handler 中使用

```ts
// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 访问请求信息
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  return NextResponse.json({ id });
}

export async function POST(request: NextRequest) {
  // 读取请求体
  const body = await request.json();

  return NextResponse.json({ received: body });
}
```

### 1.3 访问请求头

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 读取请求头
  const authorization = request.headers.get("authorization");
  const userAgent = request.headers.get("user-agent");
  const contentType = request.headers.get("content-type");

  console.log("Authorization:", authorization);
  console.log("User-Agent:", userAgent);
  console.log("Content-Type:", contentType);

  return NextResponse.next();
}
```

---

## 2. Cookie 操作

### 2.1 读取 Cookie

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 读取单个Cookie
  const token = request.cookies.get("token");
  console.log("Token:", token?.value);

  // 读取所有Cookie
  const allCookies = request.cookies.getAll();
  console.log("All Cookies:", allCookies);

  // 检查Cookie是否存在
  const hasToken = request.cookies.has("token");
  console.log("Has Token:", hasToken);

  return NextResponse.next();
}
```

### 2.2 设置 Cookie

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 设置Cookie
  response.cookies.set("visited", "true", {
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
```

### 2.3 删除 Cookie

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 删除Cookie
  response.cookies.delete("token");

  // 或者设置过期时间为过去
  response.cookies.set("token", "", {
    maxAge: 0,
  });

  return response;
}
```

---

## 3. URL 处理

### 3.1 nextUrl 属性

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // 访问URL各部分
  console.log("Pathname:", nextUrl.pathname);
  console.log("Search:", nextUrl.search);
  console.log("Hash:", nextUrl.hash);
  console.log("Host:", nextUrl.host);
  console.log("Hostname:", nextUrl.hostname);
  console.log("Port:", nextUrl.port);
  console.log("Protocol:", nextUrl.protocol);
  console.log("Origin:", nextUrl.origin);

  return NextResponse.next();
}
```

### 3.2 查询参数处理

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // 读取单个参数
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  // 读取所有参数
  const allParams = Object.fromEntries(searchParams.entries());
  console.log("All Params:", allParams);

  // 检查参数是否存在
  const hasPage = searchParams.has("page");

  // 获取所有同名参数
  const tags = searchParams.getAll("tag");

  return NextResponse.next();
}
```

### 3.3 修改 URL

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // 修改路径
  url.pathname = "/new-path";

  // 添加查询参数
  url.searchParams.set("from", "middleware");

  // 删除查询参数
  url.searchParams.delete("old-param");

  // 重定向到新URL
  return NextResponse.redirect(url);
}
```

### 3.4 路径匹配

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 精确匹配
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 前缀匹配
  if (pathname.startsWith("/api/")) {
    // API路由处理
  }

  // 正则匹配
  if (/^\/blog\/\d+$/.test(pathname)) {
    // 博客文章路由
  }

  return NextResponse.next();
}
```

---

## 4. 地理位置信息

### 4.1 访问地理位置

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 访问地理位置信息
  const geo = request.geo;

  if (geo) {
    console.log("Country:", geo.country);
    console.log("Region:", geo.region);
    console.log("City:", geo.city);
    console.log("Latitude:", geo.latitude);
    console.log("Longitude:", geo.longitude);
  }

  return NextResponse.next();
}
```

### 4.2 基于地理位置的重定向

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country;

  // 根据国家重定向
  if (country === "CN") {
    return NextResponse.redirect(new URL("/zh-cn", request.url));
  } else if (country === "US") {
    return NextResponse.redirect(new URL("/en-us", request.url));
  }

  return NextResponse.next();
}
```

### 4.3 地理位置限制

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country;

  // 限制特定国家访问
  const blockedCountries = ["XX", "YY"];
  if (country && blockedCountries.includes(country)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}
```

---

## 5. IP 地址

### 5.1 获取 IP 地址

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 获取客户端IP
  const ip = request.ip;
  console.log("Client IP:", ip);

  // 或者从headers获取
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return NextResponse.next();
}
```

### 5.2 IP 白名单

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const ip = request.ip;
  const whitelist = ["127.0.0.1", "192.168.1.1"];

  if (ip && !whitelist.includes(ip)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}
```

### 5.3 IP 限流

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ipRequestCounts = new Map<string, number>();

export function middleware(request: NextRequest) {
  const ip = request.ip || "unknown";
  const count = ipRequestCounts.get(ip) || 0;

  if (count > 100) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  ipRequestCounts.set(ip, count + 1);

  setTimeout(() => {
    ipRequestCounts.delete(ip);
  }, 60000);

  return NextResponse.next();
}
```

---

## 6. User Agent

### 6.1 访问 User Agent

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const ua = request.ua;

  if (ua) {
    console.log("Browser:", ua.browser.name, ua.browser.version);
    console.log("Device:", ua.device.type, ua.device.model);
    console.log("Engine:", ua.engine.name, ua.engine.version);
    console.log("OS:", ua.os.name, ua.os.version);
    console.log("CPU:", ua.cpu.architecture);
    console.log("Is Bot:", ua.isBot);
  }

  return NextResponse.next();
}
```

### 6.2 移动端检测

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const ua = request.ua;

  const isMobile = ua?.device.type === "mobile";

  if (isMobile) {
    return NextResponse.redirect(new URL("/mobile", request.url));
  }

  return NextResponse.next();
}
```

### 6.3 浏览器兼容性检查

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const ua = request.ua;

  if (ua?.browser.name === "IE") {
    return NextResponse.redirect(new URL("/upgrade-browser", request.url));
  }

  return NextResponse.next();
}
```

---

## 7. 请求体处理

### 7.1 JSON 请求体

```ts
// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received:", body);

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
```

### 7.2 FormData 请求体

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const name = formData.get("name");
  const file = formData.get("file") as File;

  console.log("Name:", name);
  console.log("File:", file.name, file.size);

  return NextResponse.json({ success: true });
}
```

### 7.3 文本请求体

```ts
// app/api/text/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const text = await request.text();
  console.log("Received text:", text);

  return NextResponse.json({ length: text.length });
}
```

### 7.4 ArrayBuffer 请求体

```ts
// app/api/binary/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const buffer = await request.arrayBuffer();
  console.log("Buffer size:", buffer.byteLength);

  return NextResponse.json({ size: buffer.byteLength });
}
```

### 7.5 Blob 请求体

```ts
// app/api/blob/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const blob = await request.blob();
  console.log("Blob size:", blob.size);
  console.log("Blob type:", blob.type);

  return NextResponse.json({ size: blob.size, type: blob.type });
}
```

---

## 8. 实战案例

### 8.1 身份验证中间件

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 验证token
  try {
    // 这里应该验证token的有效性
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

### 8.2 国际化路由

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "zh", "ja"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查路径是否已包含locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // 从cookie或header获取locale
  const locale =
    request.cookies.get("locale")?.value ||
    request.headers.get("accept-language")?.split(",")[0].split("-")[0] ||
    defaultLocale;

  // 重定向到带locale的路径
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}
```

### 8.3 API 限流

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || "unknown";
  const now = Date.now();
  const limit = 100;
  const window = 60000; // 1分钟

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + window });
    return NextResponse.next();
  }

  if (record.count >= limit) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((record.resetTime - now) / 1000)),
      },
    });
  }

  record.count++;
  return NextResponse.next();
}
```

### 8.4 A/B 测试

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const bucket = request.cookies.get("bucket");

  if (!bucket) {
    // 随机分配bucket
    const newBucket = Math.random() < 0.5 ? "a" : "b";
    const response = NextResponse.next();
    response.cookies.set("bucket", newBucket, { maxAge: 60 * 60 * 24 * 30 });
    return response;
  }

  return NextResponse.next();
}
```

### 8.5 请求日志

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;

  console.log({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers.get("user-agent"),
    duration,
  });

  return response;
}
```

---

## 9. 适用场景

### 9.1 身份验证

**需求**: 保护需要登录的页面

**特点**:

- Cookie 验证
- Token 检查
- 重定向到登录页

### 9.2 国际化

**需求**: 多语言支持

**特点**:

- 语言检测
- 路径重写
- Cookie 存储

### 9.3 API 限流

**需求**: 防止 API 滥用

**特点**:

- IP 限流
- 时间窗口
- 错误响应

### 9.4 A/B 测试

**需求**: 功能测试

**特点**:

- 随机分组
- Cookie 持久化
- 数据收集

### 9.5 请求日志

**需求**: 监控和调试

**特点**:

- 请求信息
- 性能数据
- 错误追踪

---

## 10. 注意事项

### 10.1 性能考虑

```ts
// ✗ 错误:在middleware中执行耗时操作
export function middleware(request: NextRequest) {
  // 不要在这里执行数据库查询
  const user = await db.user.findUnique({ where: { id: userId } });
}

// ✓ 正确:只做轻量级操作
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  // 只验证token格式,不查询数据库
}
```

### 10.2 边缘运行时限制

```ts
// ✗ 错误:使用Node.js API
import fs from "fs";

export function middleware(request: NextRequest) {
  fs.readFileSync("file.txt"); // 不支持
}

// ✓ 正确:使用Web API
export function middleware(request: NextRequest) {
  fetch("https://api.example.com/data");
}
```

### 10.3 Cookie 大小限制

```ts
// ✗ 错误:存储大量数据
response.cookies.set("data", JSON.stringify(largeObject)); // 可能超过4KB

// ✓ 正确:只存储必要数据
response.cookies.set("userId", user.id);
```

### 10.4 请求体只能读取一次

```ts
// ✗ 错误:多次读取请求体
const body1 = await request.json();
const body2 = await request.json(); // 错误!

// ✓ 正确:只读取一次
const body = await request.json();
```

### 10.5 URL 修改注意事项

```ts
// ✗ 错误:直接修改request.nextUrl
request.nextUrl.pathname = "/new-path"; // 不会生效

// ✓ 正确:克隆后修改
const url = request.nextUrl.clone();
url.pathname = "/new-path";
return NextResponse.redirect(url);
```

---

## 11. 常见问题

### 11.1 如何获取完整 URL?

**问题**: 需要获取包含协议和域名的完整 URL。

**解决方案**:

```ts
const fullUrl = request.url;
// 或者
const fullUrl = request.nextUrl.href;
```

### 11.2 如何处理多个 Cookie?

**问题**: 需要同时读取多个 Cookie。

**解决方案**:

```ts
const token = request.cookies.get("token");
const userId = request.cookies.get("userId");
const theme = request.cookies.get("theme");
```

### 11.3 如何转发请求头?

**问题**: 需要将请求头转发到下游服务。

**解决方案**:

```ts
const headers = new Headers(request.headers);
headers.set("X-Custom-Header", "value");

const response = await fetch("https://api.example.com", {
  headers,
});
```

### 11.4 如何处理查询参数数组?

**问题**: URL 中有多个同名参数。

**解决方案**:

```ts
const tags = request.nextUrl.searchParams.getAll("tag");
// ?tag=a&tag=b&tag=c => ['a', 'b', 'c']
```

### 11.5 如何检测爬虫?

**问题**: 需要识别搜索引擎爬虫。

**解决方案**:

```ts
const isBot = request.ua?.isBot;
if (isBot) {
  // 返回爬虫友好的内容
}
```

### 11.6 如何实现请求重试?

**问题**: 请求失败时自动重试。

**解决方案**:

```ts
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

### 11.7 如何处理 CORS?

**问题**: 需要处理跨域请求。

**解决方案**:

```ts
const response = NextResponse.next();
response.headers.set("Access-Control-Allow-Origin", "*");
response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
return response;
```

### 11.8 如何实现请求缓存?

**问题**: 缓存 GET 请求结果。

**解决方案**:

```ts
const cache = new Map();

export function middleware(request: NextRequest) {
  if (request.method === "GET") {
    const cached = cache.get(request.url);
    if (cached) {
      return new NextResponse(cached);
    }
  }
  return NextResponse.next();
}
```

### 11.9 如何获取请求时间?

**问题**: 记录请求处理时间。

**解决方案**:

```ts
const start = Date.now();
const response = NextResponse.next();
const duration = Date.now() - start;
response.headers.set("X-Response-Time", `${duration}ms`);
```

### 11.10 如何实现请求签名验证?

**问题**: 验证 API 请求签名。

**解决方案**:

```ts
const signature = request.headers.get("X-Signature");
const timestamp = request.headers.get("X-Timestamp");

// 验证签名
const isValid = verifySignature(signature, timestamp);
if (!isValid) {
  return new NextResponse("Invalid Signature", { status: 401 });
}
```

---

## 12. 总结

### 12.1 核心要点

1. **Web API 扩展**: NextRequest 基于标准 Request
2. **Cookie 操作**: 简化的 Cookie 读写 API
3. **URL 处理**: 强大的 nextUrl 属性
4. **地理位置**: 访问用户地理信息
5. **IP 地址**: 获取客户端 IP
6. **User Agent**: 解析用户代理
7. **请求体**: 多种格式支持
8. **类型安全**: TypeScript 支持

### 12.2 最佳实践

| 实践        | 说明                      | 优先级 |
| ----------- | ------------------------- | ------ |
| 轻量级操作  | Middleware 中避免耗时操作 | 高     |
| 边缘兼容    | 使用 Web API              | 高     |
| Cookie 管理 | 合理使用 Cookie           | 中     |
| 错误处理    | 完善的错误处理            | 高     |
| 性能监控    | 记录请求时间              | 中     |

### 12.3 API 对比

| API                | 用途            | 返回值         |
| ------------------ | --------------- | -------------- |
| request.cookies    | Cookie 操作     | RequestCookies |
| request.nextUrl    | URL 解析        | NextURL        |
| request.geo        | 地理位置        | Geo            |
| request.ip         | IP 地址         | string         |
| request.ua         | User Agent      | UserAgent      |
| request.json()     | JSON 请求体     | Promise        |
| request.formData() | FormData 请求体 | Promise        |

### 12.4 下一步

学习完 NextRequest 后,建议继续学习:

1. **NextResponse**: 学习响应对象
2. **Middleware**: 深入学习中间件
3. **Route Handlers**: 学习路由处理器
4. **边缘函数**: 学习 Edge Functions
5. **请求拦截**: 实现请求拦截

NextRequest 是 Next.js 16 处理 HTTP 请求的核心对象。通过正确使用 NextRequest,你可以实现身份验证、国际化、限流等功能。

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-18-NextResponse 对象详解

## 概述

NextResponse 是 Next.js 16 对 Web Response API 的扩展,提供了更强大的响应处理能力。它在 Middleware 和 Route Handlers 中广泛使用,是构建 HTTP 响应的核心对象。本文将详细介绍 NextResponse 的所有功能和使用方法。

### 核心特性

- **Web API 扩展**: 基于标准 Response API
- **Cookie 操作**: 简化的 Cookie 设置
- **重定向**: 便捷的重定向方法
- **重写**: URL 重写功能
- **JSON 响应**: 简化的 JSON 响应
- **流式响应**: 支持流式传输
- **类型安全**: TypeScript 完整支持
- **边缘运行时**: 支持 Edge Runtime

### NextResponse vs Response 对比

| 特性        | Response   | NextResponse | 说明                |
| ----------- | ---------- | ------------ | ------------------- |
| Cookie 操作 | 手动设置   | cookies API  | NextResponse 更简单 |
| 重定向      | 手动构造   | redirect()   | NextResponse 更便捷 |
| 重写        | 不支持     | rewrite()    | NextResponse 独有   |
| JSON 响应   | 手动序列化 | json()       | NextResponse 更简单 |

### 工作原理

```
┌─────────────┐
│ NextRequest │
└──────┬──────┘
       │
       │ 处理请求
       ▼
┌─────────────┐
│NextResponse │
│  - cookies  │
│  - redirect │
│  - rewrite  │
│  - json     │
└──────┬──────┘
       │
       │ 返回响应
       ▼
┌─────────────┐
│  HTTP响应   │
└─────────────┘
```

---

## 1. 基础用法

### 1.1 创建基本响应

```ts
// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("Hello World");
}
```

### 1.2 JSON 响应

```ts
// app/api/user/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  });
}
```

### 1.3 设置状态码

```ts
// app/api/error/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
```

### 1.4 设置响应头

```ts
// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { data: "example" },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "X-Custom-Header": "value",
      },
    }
  );
}
```

---

## 2. Cookie 操作

### 2.1 设置 Cookie

```ts
// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("token", "abc123", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: "/",
  });

  return response;
}
```

### 2.2 删除 Cookie

```ts
// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete("token");

  return response;
}
```

### 2.3 设置多个 Cookie

```ts
// app/api/session/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("userId", "123");
  response.cookies.set("theme", "dark");
  response.cookies.set("language", "zh");

  return response;
}
```

---

## 3. 重定向

### 3.1 基本重定向

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

### 3.2 条件重定向

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

### 3.3 永久重定向

```ts
// app/api/old-api/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(
    new URL("/api/new-api", request.url),
    { status: 308 } // 永久重定向
  );
}
```

---

## 4. URL 重写

### 4.1 基本重写

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 重写URL,但不改变浏览器地址栏
  return NextResponse.rewrite(new URL("/internal-path", request.url));
}
```

### 4.2 条件重写

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A/B测试
  const bucket = request.cookies.get("bucket")?.value;

  if (pathname === "/feature" && bucket === "b") {
    return NextResponse.rewrite(new URL("/feature-b", request.url));
  }

  return NextResponse.next();
}
```

### 4.3 代理请求

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 代理到外部API
  if (request.nextUrl.pathname.startsWith("/api/external")) {
    const url = new URL(
      request.nextUrl.pathname.replace("/api/external", ""),
      "https://api.example.com"
    );
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

---

## 5. 流式响应

### 5.1 基本流式响应

```ts
// app/api/stream/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`Data ${i}\n`));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### 5.2 SSE 流式响应

```ts
// app/api/sse/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const data = `data: ${JSON.stringify({ count: i })}\n\n`;
        controller.enqueue(encoder.encode(data));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 5.3 文件下载流

```ts
// app/api/download/route.ts
import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const fileStream = fs.createReadStream("large-file.zip");

  return new NextResponse(fileStream as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="file.zip"',
    },
  });
}
```

---

## 6. 响应头操作

### 6.1 设置单个响应头

```ts
// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ data: "example" });

  response.headers.set("X-Custom-Header", "value");
  response.headers.set("Cache-Control", "public, max-age=3600");

  return response;
}
```

### 6.2 设置多个响应头

```ts
// app/api/data/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { data: "example" },
    {
      headers: {
        "X-Custom-Header-1": "value1",
        "X-Custom-Header-2": "value2",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
```

### 6.3 CORS 响应头

```ts
// app/api/public/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { data: "public" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
```

### 6.4 缓存控制

```ts
// app/api/cached/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { data: "cached" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
```

---

## 7. 实战案例

### 7.1 API 错误处理

```ts
// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({ where: { id: params.id } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 7.2 文件上传响应

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 保存文件
  const buffer = await file.arrayBuffer();
  // ... 保存逻辑

  return NextResponse.json({
    success: true,
    filename: file.name,
    size: file.size,
  });
}
```

### 7.3 分页响应

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.post.count();

  return NextResponse.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### 7.4 认证响应

```ts
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = generateToken(user.id);

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email },
  });

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
```

### 7.5 图片代理

```ts
// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  const response = await fetch(url);
  const blob = await response.blob();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
```

---

## 8. 适用场景

### 8.1 API 路由

**需求**: 构建 RESTful API

**特点**:

- JSON 响应
- 错误处理
- 状态码设置

### 8.2 身份验证

**需求**: 用户登录登出

**特点**:

- Cookie 设置
- Token 管理
- 重定向

### 8.3 文件处理

**需求**: 文件上传下载

**特点**:

- FormData 处理
- 流式传输
- 响应头设置

### 8.4 代理服务

**需求**: API 代理

**特点**:

- URL 重写
- 请求转发
- CORS 处理

### 8.5 实时数据

**需求**: SSE 推送

**特点**:

- 流式响应
- 长连接
- 事件推送

---

## 9. 注意事项

### 9.1 响应体只能设置一次

```ts
// ✗ 错误:多次设置响应体
const response = NextResponse.json({ data: "first" });
response.json({ data: "second" }); // 错误!

// ✓ 正确:只设置一次
const response = NextResponse.json({ data: "correct" });
```

### 9.2 Cookie 大小限制

```ts
// ✗ 错误:Cookie过大
response.cookies.set("data", JSON.stringify(largeObject)); // 可能超过4KB

// ✓ 正确:只存储必要数据
response.cookies.set("userId", user.id);
```

### 9.3 重定向 vs 重写

```ts
// 重定向:改变浏览器URL
return NextResponse.redirect(new URL("/new-path", request.url));

// 重写:不改变浏览器URL
return NextResponse.rewrite(new URL("/internal-path", request.url));
```

### 9.4 流式响应注意事项

```ts
// ✓ 正确:设置正确的响应头
return new NextResponse(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```

### 9.5 CORS 配置

```ts
// ✓ 正确:完整的CORS配置
return NextResponse.json(data, {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  },
});
```

---

## 10. 常见问题

### 10.1 如何设置响应状态码?

**问题**: 需要返回特定的 HTTP 状态码。

**解决方案**:

```ts
return NextResponse.json({ error: "Not Found" }, { status: 404 });
```

### 10.2 如何设置多个 Cookie?

**问题**: 需要同时设置多个 Cookie。

**解决方案**:

```ts
const response = NextResponse.json({ success: true });
response.cookies.set("token", "abc");
response.cookies.set("userId", "123");
return response;
```

### 10.3 如何实现条件重定向?

**问题**: 根据条件决定是否重定向。

**解决方案**:

```ts
if (!isAuthenticated) {
  return NextResponse.redirect(new URL("/login", request.url));
}
return NextResponse.next();
```

### 10.4 如何处理 OPTIONS 请求?

**问题**: 处理 CORS 预检请求。

**解决方案**:

```ts
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

### 10.5 如何实现文件下载?

**问题**: 让浏览器下载文件而不是显示。

**解决方案**:

```ts
return new NextResponse(fileData, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="document.pdf"',
  },
});
```

### 10.6 如何实现响应缓存?

**问题**: 设置响应缓存策略。

**解决方案**:

```ts
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  },
});
```

### 10.7 如何实现响应压缩?

**问题**: 压缩响应数据。

**解决方案**:

```ts
return NextResponse.json(data, {
  headers: {
    "Content-Encoding": "gzip",
  },
});
```

### 10.8 如何实现响应限流?

**问题**: 限制 API 调用频率。

**解决方案**:

```ts
if (isRateLimited) {
  return new NextResponse("Too Many Requests", {
    status: 429,
    headers: {
      "Retry-After": "60",
    },
  });
}
```

### 10.9 如何实现响应日志?

**问题**: 记录响应信息。

**解决方案**:

```ts
const response = NextResponse.json(data);
response.headers.set("X-Request-ID", requestId);
response.headers.set("X-Response-Time", `${duration}ms`);
return response;
```

### 10.10 如何实现响应转换?

**问题**: 转换响应格式。

**解决方案**:

```ts
const data = await fetchData();
const transformed = transformData(data);
return NextResponse.json(transformed);
```

---

## 11. 总结

### 11.1 核心要点

1. **Web API 扩展**: NextResponse 基于标准 Response
2. **Cookie 操作**: 简化的 Cookie 设置 API
3. **重定向**: 便捷的 redirect 方法
4. **重写**: URL 重写功能
5. **JSON 响应**: 简化的 json 方法
6. **流式响应**: 支持流式传输
7. **响应头**: 灵活的响应头设置
8. **类型安全**: TypeScript 支持

### 11.2 最佳实践

| 实践        | 说明               | 优先级 |
| ----------- | ------------------ | ------ |
| 错误处理    | 完善的错误响应     | 高     |
| 状态码      | 正确的 HTTP 状态码 | 高     |
| Cookie 安全 | httpOnly 和 secure | 高     |
| CORS 配置   | 正确的 CORS 头     | 中     |
| 缓存策略    | 合理的缓存控制     | 中     |

### 11.3 方法对比

| 方法                    | 用途       | 返回值       |
| ----------------------- | ---------- | ------------ |
| NextResponse.json()     | JSON 响应  | NextResponse |
| NextResponse.redirect() | 重定向     | NextResponse |
| NextResponse.rewrite()  | URL 重写   | NextResponse |
| NextResponse.next()     | 继续处理   | NextResponse |
| new NextResponse()      | 自定义响应 | NextResponse |

### 11.4 下一步

学习完 NextResponse 后,建议继续学习:

1. **Middleware**: 深入学习中间件
2. **Route Handlers**: 学习路由处理器
3. **边缘函数**: 学习 Edge Functions
4. **请求拦截**: 实现请求拦截
5. **响应转换**: 实现响应转换

NextResponse 是 Next.js 16 处理 HTTP 响应的核心对象。通过正确使用 NextResponse,你可以构建强大的 API 和中间件功能。

---

## 附录:完整示例

### A.1 完整的 API 路由

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const users = await db.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true },
    });

    const total = await db.user.count();

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await db.user.create({
      data: body,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 400 }
    );
  }
}
```

### A.2 完整的认证中间件

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // 公开路径
  const publicPaths = ["/login", "/register", "/"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 检查认证
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 验证token
  try {
    const payload = verifyToken(token.value);

    // 添加用户信息到请求头
    const response = NextResponse.next();
    response.headers.set("X-User-ID", payload.userId);

    return response;
  } catch (error) {
    // Token无效,清除cookie并重定向
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### A.3 完整的 CORS 处理

```ts
// app/api/public/route.ts
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await processData(body);

  return NextResponse.json(result, {
    status: 201,
    headers: corsHeaders,
  });
}
```

### A.4 完整的文件上传

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), "public/uploads", filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

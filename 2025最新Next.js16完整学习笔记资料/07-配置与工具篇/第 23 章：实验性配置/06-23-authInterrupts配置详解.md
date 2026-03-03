**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# authInterrupts 配置详解

## 概述

authInterrupts 是 Next.js 16 中用于配置认证中断处理的配置选项。当用户访问需要认证的页面时，可以通过此配置控制认证流程的中断和重定向行为。

### authInterrupts 的作用

1. **认证流程**：控制认证中断行为
2. **用户体验**：优化登录流程
3. **安全控制**：保护受限资源
4. **灵活配置**：自定义重定向
5. **状态保持**：记住原始请求

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  authInterrupts: {
    enabled: true,
    loginPath: "/login",
    callbackPath: "/auth/callback",
  },
};
```

### 简单认证中断

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

### 登录页面

```tsx
// app/login/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 登录逻辑
    await login();
    // 重定向回原始页面
    router.push(from);
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

## 高级配置

### 多级认证

```javascript
// next.config.js
module.exports = {
  authInterrupts: {
    enabled: true,
    levels: {
      basic: {
        loginPath: "/login",
        matcher: ["/dashboard/:path*"],
      },
      admin: {
        loginPath: "/admin/login",
        matcher: ["/admin/:path*"],
      },
    },
  },
};
```

### 角色权限

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const role = request.cookies.get("role");

  // 检查认证
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 检查权限
  if (request.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}
```

### 会话超时

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const lastActivity = request.cookies.get("lastActivity");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 检查会话超时（30分钟）
  const now = Date.now();
  const last = parseInt(lastActivity?.value || "0");
  const timeout = 30 * 60 * 1000;

  if (now - last > timeout) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // 更新最后活动时间
  const response = NextResponse.next();
  response.cookies.set("lastActivity", now.toString());
  return response;
}
```

### 自定义重定向

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    const url = new URL("/login", request.url);
    // 保存原始URL
    url.searchParams.set("redirect", request.nextUrl.pathname);
    url.searchParams.set("query", request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
```

### OAuth 回调

```tsx
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // 验证state
  const savedState = request.cookies.get("oauth_state");
  if (state !== savedState?.value) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url)
    );
  }

  // 交换token
  const token = await exchangeCodeForToken(code);

  // 设置cookie
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return response;
}
```

### 刷新 token

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const refreshToken = request.cookies.get("refreshToken");

  if (!token && refreshToken) {
    // 尝试刷新token
    try {
      const newToken = await refreshAccessToken(refreshToken.value);
      const response = NextResponse.next();
      response.cookies.set("token", newToken);
      return response;
    } catch (error) {
      // 刷新失败，重定向到登录
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

## 实战案例

### 案例 1：基础认证系统

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const path = request.nextUrl.pathname;

  // 公开路径
  const publicPaths = ["/login", "/register", "/forgot-password"];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // 需要认证的路径
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 案例 2：多角色权限系统

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 验证token并获取用户信息
  const user = await verifyToken(token.value);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 检查权限
  if (path.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (
    path.startsWith("/moderator") &&
    !["admin", "moderator"].includes(user.role)
  ) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}
```

### 案例 3：会话管理系统

```tsx
// lib/session.ts
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session_token");

  if (!token) {
    return null;
  }

  // 验证并解析token
  const session = await verifySessionToken(token.value);

  // 检查过期
  if (session.expiresAt < Date.now()) {
    return null;
  }

  return session;
}

export async function createSession(userId: string) {
  const session = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天
  };

  const token = await createSessionToken(session);

  cookies().set("session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  });

  return session;
}
```

### 案例 4：OAuth 集成

```tsx
// app/auth/google/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: generateState(),
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );

  // 保存state用于验证
  response.cookies.set("oauth_state", params.get("state")!, {
    httpOnly: true,
    secure: true,
    maxAge: 600, // 10分钟
  });

  return response;
}
```

## 适用场景

| 场景       | 是否使用 | 原因       |
| ---------- | -------- | ---------- |
| 用户认证   | 是       | 保护资源   |
| 权限控制   | 是       | 角色管理   |
| 会话管理   | 是       | 状态保持   |
| OAuth 集成 | 是       | 第三方登录 |
| 公开网站   | 否       | 不需要     |

## 注意事项

### 1. 安全性

```tsx
// 使用httpOnly cookie
response.cookies.set("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
});
```

### 2. 会话超时

```tsx
// 设置合理的过期时间
const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24小时
```

### 3. CSRF 保护

```tsx
// 验证CSRF token
const csrfToken = request.headers.get("x-csrf-token");
if (!csrfToken || csrfToken !== savedToken) {
  return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
}
```

### 4. 刷新 token

```tsx
// 实现token刷新机制
if (isTokenExpiringSoon(token)) {
  const newToken = await refreshToken(token);
  response.cookies.set("token", newToken);
}
```

### 5. 错误处理

```tsx
// 处理认证错误
try {
  const user = await verifyToken(token);
} catch (error) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

## 常见问题

### 1. 认证不工作？

**问题**：用户无法登录

**解决方案**：

```tsx
// 检查cookie设置
response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
```

### 2. 如何保存原始 URL？

**问题**：登录后需要返回原始页面

**解决方案**：

```tsx
const url = new URL("/login", request.url);
url.searchParams.set("from", request.nextUrl.pathname);
return NextResponse.redirect(url);
```

### 3. 如何处理会话超时？

**问题**：会话过期后的处理

**解决方案**：

```tsx
if (Date.now() > session.expiresAt) {
  response.cookies.delete("token");
  return NextResponse.redirect(new URL("/login", request.url));
}
```

### 4. 如何实现记住我？

**问题**：需要长期登录

**解决方案**：

```tsx
const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
response.cookies.set("token", token, { maxAge });
```

### 5. 如何处理多设备登录？

**问题**：同一用户多设备登录

**解决方案**：

```tsx
// 为每个设备生成唯一token
const deviceId = generateDeviceId();
const token = await createToken(userId, deviceId);
```

### 6. 如何实现单点登录？

**问题**：多个应用共享登录状态

**解决方案**：

```tsx
// 使用共享的认证服务
const ssoToken = await validateSSOToken(request);
```

### 7. 如何处理 OAuth 回调？

**问题**：OAuth 登录回调处理

**解决方案**：

```tsx
const code = searchParams.get("code");
const token = await exchangeCodeForToken(code);
```

### 8. 如何验证 token？

**问题**：需要验证 token 有效性

**解决方案**：

```tsx
import jwt from "jsonwebtoken";

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 9. 如何刷新 token？

**问题**：token 即将过期

**解决方案**：

```tsx
if (isExpiringSoon(token)) {
  const newToken = await refreshAccessToken(refreshToken);
}
```

### 10. 如何处理权限？

**问题**：不同角色不同权限

**解决方案**：

```tsx
const hasPermission = user.permissions.includes(requiredPermission);
if (!hasPermission) {
  return NextResponse.redirect(new URL("/403", request.url));
}
```

### 11. 如何处理登出？

**问题**：用户登出处理

**解决方案**：

```tsx
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("token");
  return response;
}
```

### 12. 如何处理并发请求？

**问题**：多个请求同时刷新 token

**解决方案**：

```tsx
// 使用锁机制
const lock = await acquireLock(`refresh:${userId}`);
try {
  const newToken = await refreshToken(oldToken);
} finally {
  await releaseLock(lock);
}
```

### 13. 如何处理跨域？

**问题**：跨域认证问题

**解决方案**：

```tsx
response.headers.set("Access-Control-Allow-Credentials", "true");
response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
```

### 14. 如何测试认证？

**问题**：需要测试认证流程

**解决方案**：

```tsx
// 使用测试token
if (process.env.NODE_ENV === "test") {
  return NextResponse.next();
}
```

### 15. 如何监控认证？

**问题**：需要监控认证状态

**解决方案**：

```tsx
// 记录认证事件
await logAuthEvent({
  type: "login",
  userId,
  timestamp: Date.now(),
});
```

## 总结

authInterrupts 配置为 Next.js 提供了灵活的认证中断处理机制。通过配置认证中断可以：

1. **认证流程**：控制认证中断行为
2. **用户体验**：优化登录流程
3. **安全控制**：保护受限资源
4. **灵活配置**：自定义重定向
5. **状态保持**：记住原始请求

关键要点：

- 配置认证路径
- 保存原始 URL
- 验证 token
- 处理会话超时
- 实现权限控制
- OAuth 集成
- 刷新 token
- CSRF 保护
- 错误处理
- 监控日志

记住：认证是应用安全的关键。务必使用 httpOnly cookie，启用 HTTPS，实现 CSRF 保护，设置合理的会话超时，并记录所有认证事件。

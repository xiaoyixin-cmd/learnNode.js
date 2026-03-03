**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# redirect 函数详解

## 1. 概述

`redirect` 是 Next.js 16 提供的服务端重定向函数,用于在服务端组件、Server Actions、Route Handlers 中执行页面跳转。它会抛出一个特殊的错误来中断当前执行流程并触发重定向。

### 1.1 概念定义

`redirect` 函数用于在服务端执行 HTTP 重定向,将用户导航到另一个 URL。

**关键特征**:

- **服务端专用**: 只能在服务端环境使用
- **抛出错误**: 通过抛出 NEXT_REDIRECT 错误实现
- **中断执行**: 调用后立即中断当前代码执行
- **临时重定向**: 默认返回 307 状态码

**基本用法**:

```tsx
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login"); // 未登录,重定向到登录页
  }

  return <div>受保护的内容</div>;
}
```

### 1.2 核心价值

**服务端权限控制**:

在服务端组件中检查权限,未授权用户直接重定向,避免渲染受保护的内容。

**SEO 友好**:

服务端重定向对搜索引擎友好,搜索引擎会正确处理 HTTP 重定向状态码。

**安全性**:

敏感的重定向逻辑在服务端执行,客户端无法绕过或篡改。

**性能优化**:

避免不必要的客户端渲染,直接在服务端完成重定向,减少网络往返。

### 1.3 与其他重定向方式的对比

| 方式                       | 使用环境           | 状态码  | 适用场景            |
| :------------------------- | :----------------- | :------ | :------------------ |
| `redirect()`               | 服务端组件/Actions | 307     | 临时重定向,权限检查 |
| `permanentRedirect()`      | 服务端组件/Actions | 308     | 永久重定向,URL 变更 |
| `router.push()`            | 客户端组件         | N/A     | 客户端导航          |
| `next.config.js redirects` | 配置文件           | 307/308 | 静态路由重定向      |
| `middleware redirect`      | 中间件             | 307/308 | 请求级别重定向      |

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { redirect } from "next/navigation";

function redirect(path: string, type?: "replace" | "push"): never;
```

**参数**:

- `path`: 重定向的目标路径,可以是相对路径或绝对路径
- `type`: 重定向类型(可选)
  - `'replace'`: 替换当前历史记录(默认)
  - `'push'`: 添加新的历史记录

**返回值**:

`never` - 函数永远不会正常返回,因为它会抛出错误

**示例**:

```tsx
import { redirect } from "next/navigation";

export default async function Page() {
  redirect("/dashboard"); // 重定向到仪表板
}
```

### 2.2 工作原理

`redirect` 函数通过抛出一个特殊的错误来实现重定向:

```tsx
// Next.js 内部实现(简化版)
export function redirect(url: string, type: RedirectType = "replace"): never {
  const error = new Error("NEXT_REDIRECT");
  error.digest = `NEXT_REDIRECT;${type};${url}`;
  throw error;
}
```

**执行流程**:

1. 调用 `redirect('/path')`
2. 抛出 `NEXT_REDIRECT` 错误
3. Next.js 捕获该错误
4. 返回 HTTP 307 重定向响应
5. 浏览器执行重定向

### 2.3 HTTP 状态码

`redirect` 使用 307 Temporary Redirect 状态码:

**307 特点**:

- 临时重定向
- 保持原始请求方法(POST 请求重定向后仍是 POST)
- 浏览器不会缓存重定向

**示例**:

```tsx
// 服务端组件
export default async function Page() {
  redirect("/new-path");
}

// HTTP 响应
// HTTP/1.1 307 Temporary Redirect
// Location: /new-path
```

### 2.4 在不同环境中使用

**服务端组件**:

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <div>欢迎, {user.name}</div>;
}
```

**Server Actions**:

```tsx
// app/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  const post = await savePost({ title, content });

  // 创建成功后重定向
  redirect(`/posts/${post.id}`);
}
```

**Route Handlers**:

```tsx
// app/api/auth/route.ts
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return Response.json({ user: session.user });
}
```

### 2.5 错误处理

`redirect` 抛出的错误不应该被 try-catch 捕获:

```tsx
// ❌ 错误:捕获 redirect 错误
export default async function Page() {
  try {
    const user = await getUser();
    if (!user) {
      redirect("/login");
    }
  } catch (error) {
    // 这会阻止重定向
    console.error(error);
  }

  return <div>内容</div>;
}

// ✅ 正确:让 redirect 错误传播
export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login"); // 直接调用,不捕获
  }

  return <div>内容</div>;
}
```

---

## 3. 适用场景

### 3.1 权限验证

**场景**: 检查用户是否登录,未登录则重定向到登录页。

```tsx
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>仪表板</h1>
      <p>欢迎, {session.user.name}</p>
    </div>
  );
}
```

### 3.2 角色权限检查

**场景**: 检查用户角色,非管理员重定向到首页。

```tsx
// app/admin/page.tsx
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <div>管理员面板</div>;
}
```

### 3.3 表单提交后重定向

**场景**: Server Action 处理表单提交后重定向。

```tsx
// app/posts/new/page.tsx
import { createPost } from "./actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">发布</button>
    </form>
  );
}

// app/posts/new/actions.ts
("use server");

import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const post = await savePost({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  redirect(`/posts/${post.id}`);
}
```

### 场景五:条件重定向

**场景**: 根据多个条件决定重定向目标。

```tsx
// app/checkout/page.tsx
import { redirect } from "next/navigation";
import { getCart, getUser } from "@/lib/data";

export default async function CheckoutPage() {
  const user = await getUser();
  const cart = await getCart();

  // 未登录:重定向到登录页
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  // 购物车为空:重定向到商品页
  if (cart.items.length === 0) {
    redirect("/products");
  }

  // 未完成个人信息:重定向到设置页
  if (!user.profile.isComplete) {
    redirect("/settings/profile");
  }

  return <div>结算页面</div>;
}
```

### 场景六:API 路由重定向

**场景**: 在 Route Handler 中重定向。

```tsx
// app/api/auth/callback/route.ts
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    redirect("/login?error=missing_code");
  }

  try {
    // 处理认证
    await handleAuth(code);
    redirect("/dashboard");
  } catch (error) {
    redirect("/login?error=auth_failed");
  }
}
```

---

## 4. 常见问题

### 1. redirect 和 router.push 有什么区别?

| 特性     | redirect() | router.push() |
| -------- | ---------- | ------------- |
| 使用环境 | 服务端     | 客户端        |
| 状态码   | 307        | N/A           |
| 执行方式 | 抛出错误   | 返回 Promise  |
| 中断执行 | 是         | 否            |
| SEO 友好 | 是         | 否            |

```tsx
// 服务端组件
export default async function ServerPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login"); // ✅ 正确
  }
  return <div>内容</div>;
}

// 客户端组件
("use client");

export default function ClientPage() {
  const router = useRouter();

  function handleClick() {
    router.push("/dashboard"); // ✅ 正确
  }

  return <button onClick={handleClick}>跳转</button>;
}
```

### 2. redirect 会返回吗?

不会。`redirect` 会抛出一个特殊的错误来中断执行:

```tsx
export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
    console.log("这行代码不会执行"); // 永远不会执行
  }

  return <div>内容</div>;
}
```

### 3. 如何在 redirect 后传递数据?

使用查询参数或 cookies:

```tsx
// 方法1:查询参数
redirect("/login?redirect=/dashboard&message=请先登录");

// 方法2:cookies
import { cookies } from "next/headers";

export default async function Page() {
  cookies().set("redirect_message", "请先登录");
  redirect("/login");
}
```

### 4. redirect 可以重定向到外部 URL 吗?

可以,但需要使用完整的 URL:

```tsx
// ✅ 正确:外部 URL
redirect("https://example.com");

// ✅ 正确:相对路径
redirect("/dashboard");

// ❌ 错误:不完整的外部 URL
redirect("example.com");
```

### 5. 如何处理 redirect 错误?

`redirect` 抛出的是特殊错误,不应该被捕获:

```tsx
// ❌ 不要这样做
try {
  redirect("/login");
} catch (error) {
  // 这会阻止重定向
  console.error(error);
}

// ✅ 正确做法
export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login"); // 让错误自然传播
  }

  return <div>内容</div>;
}
```

---

## 5. 最佳实践

### 5.1 早期返回模式

```tsx
export default async function Page() {
  const user = await getUser();

  // ✅ 好:早期返回
  if (!user) {
    redirect("/login");
  }

  const data = await getData();

  if (!data) {
    redirect("/404");
  }

  return <div>{data.content}</div>;
}
```

### 5.2 使用查询参数传递上下文

```tsx
export default async function Page() {
  const user = await getUser();

  if (!user) {
    // 传递重定向目标
    redirect("/login?redirect=/dashboard");
  }

  return <div>仪表板</div>;
}

// 登录页面
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  async function handleLogin(formData: FormData) {
    "use server";

    await login(formData);

    // 登录后重定向回原页面
    const redirectTo = searchParams.redirect || "/";
    redirect(redirectTo);
  }

  return <form action={handleLogin}>...</form>;
}
```

### 5.3 避免重定向循环

```tsx
// ❌ 不好:可能导致循环
export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isVerified) {
    redirect("/verify");
  }
}

// ✅ 好:明确的重定向逻辑
export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isVerified) {
    redirect("/verify?from=dashboard");
  }

  return <div>仪表板</div>;
}
```

### 5.4 使用类型安全的路由

```tsx
// lib/routes.ts
export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  profile: "/profile",
} as const;

// 使用
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect(routes.login); // 类型安全
  }

  return <div>内容</div>;
}
```

### 5.5 记录重定向日志

```tsx
import { redirect } from "next/navigation";

function logRedirect(from: string, to: string, reason: string) {
  console.log(`重定向: ${from} -> ${to} (原因: ${reason})`);
}

export default async function Page() {
  const user = await getUser();

  if (!user) {
    logRedirect("/dashboard", "/login", "未登录");
    redirect("/login");
  }

  return <div>仪表板</div>;
}
```

---

## 6. 注意事项

### 6.1 只能在服务端使用

```tsx
// ❌ 错误:客户端组件
"use client";

import { redirect } from "next/navigation";

export default function ClientComponent() {
  redirect("/login"); // 错误!
  return <div>内容</div>;
}

// ✅ 正确:服务端组件
import { redirect } from "next/navigation";

export default async function ServerComponent() {
  redirect("/login"); // 正确
}
```

### 6.2 不要捕获 redirect 错误

```tsx
// ❌ 不要这样做
try {
  redirect("/login");
} catch (error) {
  console.error(error); // 这会阻止重定向
}

// ✅ 正确做法
redirect("/login"); // 让错误自然传播
```

### 6.3 redirect 后的代码不会执行

```tsx
export default async function Page() {
  redirect("/login");

  console.log("不会执行");
  const data = await getData(); // 不会执行

  return <div>不会渲染</div>; // 不会执行
}
```

### 6.4 注意重定向循环

```tsx
// ❌ 可能导致循环
// /login 页面
export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }
  return <div>登录</div>;
}

// /dashboard 页面
export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return <div>仪表板</div>;
}
```

### 6.5 使用绝对路径

```tsx
// ✅ 好:绝对路径
redirect("/dashboard");

// ❌ 不好:相对路径(可能导致问题)
redirect("../dashboard");
```

---

## 7. 常见问题补充

### 7.1 如何在中间件中使用 redirect?

**问题**: 中间件中不能直接使用 redirect 函数

**解决方案**: 使用 NextResponse.redirect

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    // 中间件中使用NextResponse.redirect
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

**对比表格**:

| 环境             | 使用方法                              | 返回值        |
| ---------------- | ------------------------------------- | ------------- |
| Server Component | redirect()                            | 抛出错误      |
| Server Action    | redirect()                            | 抛出错误      |
| Middleware       | NextResponse.redirect()               | Response 对象 |
| Route Handler    | redirect() 或 NextResponse.redirect() | 都可以        |

### 7.2 如何实现条件重定向链?

**问题**: 需要根据多个条件进行不同的重定向

**解决方案**:

```tsx
export default async function Page() {
  const user = await getUser();
  const subscription = await getSubscription();
  const onboarding = await getOnboardingStatus();

  // 条件重定向链
  if (!user) {
    redirect("/login");
  }

  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  if (!subscription) {
    redirect("/pricing");
  }

  if (!onboarding.completed) {
    redirect("/onboarding");
  }

  return <div>主页内容</div>;
}
```

### 7.3 如何处理重定向后的数据刷新?

**问题**: 重定向后需要刷新数据

**解决方案**: 使用 revalidatePath

```tsx
// app/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  await updateUserProfile(formData);

  // 重新验证路径
  revalidatePath("/profile");

  // 重定向
  redirect("/profile");
}
```

### 7.4 如何实现重定向倒计时?

**问题**: 需要显示倒计时后再重定向

**解决方案**: 结合客户端组件

```tsx
// app/success/page.tsx
import RedirectCountdown from "./RedirectCountdown";

export default function SuccessPage() {
  return (
    <div>
      <h1>操作成功!</h1>
      <RedirectCountdown seconds={3} redirectTo="/dashboard" />
    </div>
  );
}
```

```tsx
// app/success/RedirectCountdown.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RedirectCountdown({
  seconds,
  redirectTo,
}: {
  seconds: number;
  redirectTo: string;
}) {
  const [count, setCount] = useState(seconds);
  const router = useRouter();

  useEffect(() => {
    if (count === 0) {
      router.push(redirectTo);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, redirectTo, router]);

  return <p>{count}秒后自动跳转...</p>;
}
```

### 7.5 如何处理重定向的国际化?

**问题**: 需要根据语言进行重定向

**解决方案**:

```tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function Page() {
  const headersList = headers();
  const locale = headersList.get("accept-language")?.split(",")[0] || "en";

  const user = await getUser();

  if (!user) {
    // 根据语言重定向到不同的登录页
    redirect(`/${locale}/login`);
  }

  return <div>内容</div>;
}
```

### 7.6 如何实现重定向日志记录?

**问题**: 需要记录所有重定向操作

**解决方案**:

```tsx
// lib/redirect-logger.ts
import { redirect as nextRedirect } from "next/navigation";

export function redirect(url: string, type?: "replace" | "push") {
  // 记录重定向日志
  console.log("[Redirect]", {
    url,
    type,
    timestamp: new Date().toISOString(),
    userAgent: headers().get("user-agent"),
  });

  // 发送到分析服务
  trackRedirect(url);

  // 执行重定向
  return nextRedirect(url, type);
}
```

### 7.7 如何处理重定向的 A/B 测试?

**问题**: 需要根据 A/B 测试分组进行不同的重定向

**解决方案**:

```tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = cookies();
  const variant = cookieStore.get("ab-test-variant")?.value || "A";

  const user = await getUser();

  if (!user) {
    // 根据A/B测试分组重定向
    if (variant === "A") {
      redirect("/login");
    } else {
      redirect("/signup-first");
    }
  }

  return <div>内容</div>;
}
```

### 7.8 如何实现重定向的性能监控?

**问题**: 需要监控重定向的性能影响

**解决方案**:

```tsx
// lib/monitored-redirect.ts
import { redirect as nextRedirect } from "next/navigation";

export function redirect(url: string, type?: "replace" | "push") {
  const start = performance.now();

  try {
    return nextRedirect(url, type);
  } finally {
    const duration = performance.now() - start;

    // 记录性能指标
    console.log("[Redirect Performance]", {
      url,
      duration: `${duration.toFixed(2)}ms`,
    });
  }
}
```

### 7.9 如何处理重定向的错误边界?

**问题**: 需要在错误边界中处理重定向

**解决方案**:

```tsx
// app/error.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // 特定错误自动重定向
    if (error.message.includes("UNAUTHORIZED")) {
      router.push("/login");
    }
  }, [error, router]);

  return (
    <div>
      <h2>出错了!</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 7.10 如何实现重定向的回退机制?

**问题**: 重定向失败时需要回退

**解决方案**:

```tsx
// app/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function processPayment(formData: FormData) {
  try {
    const result = await chargePayment(formData);

    if (result.success) {
      redirect("/success");
    } else {
      redirect("/payment-failed");
    }
  } catch (error) {
    // 重定向失败,返回错误信息
    return {
      error: "支付处理失败",
      fallbackUrl: "/checkout",
    };
  }
}
```

## 8. 高级用法

### 8.1 重定向工厂函数

```typescript
// lib/redirect-factory.ts
import { redirect } from "next/navigation";

export function createRedirect(baseUrl: string) {
  return {
    toLogin: (returnUrl?: string) => {
      const url = returnUrl
        ? `${baseUrl}/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : `${baseUrl}/login`;
      redirect(url);
    },

    toDashboard: (tab?: string) => {
      const url = tab
        ? `${baseUrl}/dashboard?tab=${tab}`
        : `${baseUrl}/dashboard`;
      redirect(url);
    },

    toError: (code: number, message?: string) => {
      const url = message
        ? `${baseUrl}/error/${code}?message=${encodeURIComponent(message)}`
        : `${baseUrl}/error/${code}`;
      redirect(url);
    },
  };
}

// 使用
const redirects = createRedirect("");
redirects.toLogin("/protected-page");
```

### 8.2 重定向中间件模式

```typescript
// lib/redirect-middleware.ts
type RedirectMiddleware = (url: string) => string | null;

const middlewares: RedirectMiddleware[] = [
  // 添加语言前缀
  (url) => {
    const locale = getLocale();
    return url.startsWith("/") ? `/${locale}${url}` : null;
  },

  // 添加追踪参数
  (url) => {
    const trackingId = getTrackingId();
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}utm_source=redirect&tracking_id=${trackingId}`;
  },
];

export function redirectWithMiddleware(url: string) {
  let finalUrl = url;

  for (const middleware of middlewares) {
    const result = middleware(finalUrl);
    if (result) {
      finalUrl = result;
    }
  }

  redirect(finalUrl);
}
```

### 8.3 类型安全的重定向

```typescript
// lib/typed-redirect.ts
import { redirect } from "next/navigation";

// 定义所有可能的路由
type AppRoutes =
  | "/login"
  | "/dashboard"
  | "/profile"
  | "/settings"
  | `/posts/${string}`
  | `/users/${string}`;

export function typedRedirect(url: AppRoutes) {
  redirect(url);
}

// 使用
typedRedirect("/dashboard"); // ✅ 正确
typedRedirect("/invalid"); // ❌ 类型错误
```

## 9. 总结

`redirect` 函数是 Next.js 16 服务端重定向的核心 API。本文介绍了:

1. **核心概念**: API 签名、工作原理、与其他重定向方式的对比
2. **实战场景**: 权限检查、表单提交、多语言、错误处理、条件重定向、API 路由
3. **常见问题**: 与 router.push 的区别、是否返回、传递数据、外部 URL、错误处理
4. **最佳实践**: 早期返回、查询参数、避免循环、类型安全、日志记录
5. **注意事项**: 服务端专用、不要捕获错误、代码不执行、重定向循环、绝对路径

关键要点:

- `redirect` 只能在服务端环境使用
- 通过抛出错误来中断执行
- 默认返回 307 临时重定向
- 不要捕获 redirect 抛出的错误
- 使用查询参数传递上下文信息
- 注意避免重定向循环

通过正确使用 `redirect` 函数,可以实现安全、高效的服务端重定向,提升应用的安全性和用户体验。

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# unstable_rethrow 函数详解

## 1. 概述与背景

### 1.1 什么是 unstable_rethrow

`unstable_rethrow` 是 Next.js 16 提供的一个错误处理函数,用于在捕获错误后重新抛出 Next.js 内部错误,同时允许开发者处理应用层面的错误。这个函数主要用于区分 Next.js 框架错误和应用错误。

`unstable_rethrow` 的核心特点:

- **错误分类**: 区分框架错误和应用错误
- **选择性重抛**: 只重抛 Next.js 内部错误
- **错误处理**: 允许自定义处理应用错误
- **导航控制**: 保持 Next.js 导航机制正常工作

### 1.2 为什么需要 unstable_rethrow

在 Next.js 中,某些错误是框架内部使用的,比如 `redirect()` 和 `notFound()` 实际上是通过抛出特殊错误来实现的。如果在 try-catch 中捕获这些错误而不重新抛出,会导致导航功能失效。

`unstable_rethrow` 解决了这个问题:

- **保持导航**: 确保 redirect 和 notFound 正常工作
- **错误处理**: 可以安全地捕获和处理应用错误
- **框架兼容**: 与 Next.js 错误处理机制兼容
- **代码清晰**: 明确区分不同类型的错误

### 1.3 unstable_rethrow 的工作原理

`unstable_rethrow` 的工作流程:

1. **检查错误**: 判断错误是否是 Next.js 内部错误
2. **重抛框架错误**: 如果是框架错误,立即重新抛出
3. **返回控制**: 如果不是框架错误,返回控制权给调用者
4. **继续处理**: 调用者可以继续处理应用错误

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

async function handleRequest() {
  try {
    const data = await fetchData();

    if (!data) {
      redirect("/login"); // 抛出特殊错误
    }

    return data;
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理其他错误
    console.error("Application error:", error);
    return null;
  }
}

async function fetchData() {
  return null;
}
```

## 2. 核心概念

### 2.1 基本用法

#### 与 redirect 配合使用

```typescript
// app/actions.ts
"use server";

import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await authenticate(email, password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // 登录成功,重定向
    redirect("/dashboard");
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理认证错误
    console.error("Login failed:", error);
    return { error: "Login failed" };
  }
}

async function authenticate(email: string, password: string) {
  return null;
}
```

#### 与 notFound 配合使用

```typescript
// app/posts/[id]/page.tsx
import { unstable_rethrow as rethrow } from "next/server";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: { id: string } }) {
  try {
    const post = await fetchPost(params.id);

    if (!post) {
      notFound(); // 抛出 notFound 错误
    }

    return (
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    );
  } catch (error) {
    rethrow(error); // 重抛 notFound 错误

    // 处理其他错误
    console.error("Failed to load post:", error);
    return <div>Error loading post</div>;
  }
}

async function fetchPost(id: string) {
  return null;
}
```

### 2.2 错误类型识别

#### Next.js 内部错误

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect, notFound } from "next/navigation";

async function handleNavigation(type: string) {
  try {
    if (type === "redirect") {
      redirect("/home"); // Next.js 内部错误
    }

    if (type === "notfound") {
      notFound(); // Next.js 内部错误
    }

    return "success";
  } catch (error) {
    rethrow(error); // 这些错误会被重抛

    // 这里的代码不会执行
    console.log("This will not run");
  }
}
```

#### 应用错误

```typescript
import { unstable_rethrow as rethrow } from "next/server";

async function handleData() {
  try {
    const data = await fetchData();

    if (!data) {
      throw new Error("Data not found"); // 应用错误
    }

    return data;
  } catch (error) {
    rethrow(error); // 应用错误不会被重抛

    // 可以继续处理应用错误
    console.error("Application error:", error);
    return { error: "Failed to fetch data" };
  }
}

async function fetchData() {
  throw new Error("Network error");
}
```

### 2.3 使用场景

#### Server Actions 中的错误处理

```typescript
// app/actions/user.ts
"use server";

import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    // 验证数据
    if (!name || !email) {
      throw new Error("Name and email are required");
    }

    // 更新用户信息
    await saveProfile({ name, email });

    // 重新验证缓存
    revalidatePath("/profile");

    // 重定向到个人资料页
    redirect("/profile");
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理验证或保存错误
    console.error("Profile update failed:", error);
    return { error: (error as Error).message };
  }
}

async function saveProfile(data: { name: string; email: string }) {
  console.log("Saving profile:", data);
}
```

#### API 路由中的错误处理

```typescript
// app/api/posts/route.ts
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证请求
    if (!body.title || !body.content) {
      throw new Error("Title and content are required");
    }

    // 创建文章
    const post = await createPost(body);

    // 某些情况下可能需要重定向
    if (body.redirectAfterCreate) {
      redirect(`/posts/${post.id}`);
    }

    return Response.json(post);
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理应用错误
    console.error("Post creation failed:", error);
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}

async function createPost(data: any) {
  return { id: "1", ...data };
}
```

## 3. 适用场景

### 3.1 表单提交处理

#### 登录表单

```typescript
// app/actions/auth.ts
"use server";

import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 验证输入
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // 认证用户
    const user = await authenticateUser(email, password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // 设置会话
    const cookieStore = await cookies();
    cookieStore.set("session", user.sessionToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7天
    });

    // 登录成功,重定向到仪表板
    redirect("/dashboard");
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理认证错误
    console.error("Login error:", error);
    return {
      error: (error as Error).message,
    };
  }
}

async function authenticateUser(email: string, password: string) {
  return null;
}
```

#### 注册表单

```typescript
// app/actions/register.ts
"use server";

import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // 验证输入
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    // 检查邮箱是否已存在
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // 创建用户
    await createUser({ email, password, name });

    // 注册成功,重定向到登录页
    redirect("/login?registered=true");
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理注册错误
    console.error("Registration error:", error);
    return {
      error: (error as Error).message,
    };
  }
}

async function findUserByEmail(email: string) {
  return null;
}

async function createUser(data: any) {
  console.log("Creating user:", data);
}
```

### 3.2 数据获取与验证

#### 资源访问控制

```typescript
// app/posts/[id]/edit/page.tsx
import { unstable_rethrow as rethrow } from "next/server";
import { redirect, notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // 获取文章
    const post = await fetchPost(params.id);

    if (!post) {
      notFound(); // 文章不存在
    }

    // 检查权限
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login"); // 未登录
    }

    if (post.authorId !== user.id) {
      redirect("/posts"); // 无权限
    }

    return (
      <div>
        <h1>Edit Post</h1>
        <form>
          <input defaultValue={post.title} />
          <textarea defaultValue={post.content} />
        </form>
      </div>
    );
  } catch (error) {
    rethrow(error); // 重抛导航错误

    // 处理其他错误
    console.error("Failed to load edit page:", error);
    return <div>Error loading page</div>;
  }
}

async function fetchPost(id: string) {
  return null;
}

async function getCurrentUser() {
  return null;
}
```

#### 数据验证

```typescript
// lib/data-validation.ts
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

export async function validateAndFetchData(id: string) {
  try {
    // 验证 ID 格式
    if (!/^[0-9]+$/.test(id)) {
      throw new Error("Invalid ID format");
    }

    // 获取数据
    const data = await fetchData(id);

    if (!data) {
      // 数据不存在,重定向到列表页
      redirect("/list");
    }

    // 验证数据完整性
    if (!data.title || !data.content) {
      throw new Error("Incomplete data");
    }

    return data;
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误

    // 处理验证错误
    console.error("Validation error:", error);
    throw error; // 重新抛出应用错误
  }
}

async function fetchData(id: string) {
  return null;
}
```

### 3.3 条件导航

#### 基于状态的导航

```typescript
// app/checkout/page.tsx
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  try {
    // 获取购物车
    const cart = await getCart();

    if (!cart || cart.items.length === 0) {
      // 购物车为空,重定向到商品页
      redirect("/products");
    }

    // 检查用户登录状态
    const user = await getCurrentUser();

    if (!user) {
      // 未登录,重定向到登录页
      redirect("/login?redirect=/checkout");
    }

    // 检查配送地址
    const address = await getUserAddress(user.id);

    if (!address) {
      // 没有配送地址,重定向到地址设置页
      redirect("/account/address?redirect=/checkout");
    }

    return (
      <div>
        <h1>Checkout</h1>
        <div>Items: {cart.items.length}</div>
        <div>Total: ${cart.total}</div>
      </div>
    );
  } catch (error) {
    rethrow(error); // 重抛所有 redirect 错误

    // 处理其他错误
    console.error("Checkout error:", error);
    return <div>Error loading checkout</div>;
  }
}

async function getCart() {
  return null;
}

async function getCurrentUser() {
  return null;
}

async function getUserAddress(userId: string) {
  return null;
}
```

### 3.4 错误恢复

#### 带降级的错误处理

```typescript
// lib/resilient-fetch.ts
import { unstable_rethrow as rethrow } from "next/server";

export async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    rethrow(error); // 重抛框架错误

    // 尝试降级方案
    console.warn("Primary fetch failed, trying fallback");
    try {
      return await fallback();
    } catch (fallbackError) {
      rethrow(fallbackError);

      // 两次都失败
      console.error("Both primary and fallback failed");
      throw fallbackError;
    }
  }
}

// 使用
async function getData() {
  return fetchWithFallback(
    async () => {
      const res = await fetch("https://api.primary.com/data");
      return res.json();
    },
    async () => {
      const res = await fetch("https://api.backup.com/data");
      return res.json();
    }
  );
}
```

## 4. API 签名与配置

### 4.1 函数签名

```typescript
import { unstable_rethrow as rethrow } from "next/server";

function unstable_rethrow(error: unknown): void;
```

### 4.2 使用规则

#### 在 try-catch 中使用

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

// ✅ 正确: 在 catch 块中使用
async function handleRequest() {
  try {
    redirect("/home");
  } catch (error) {
    rethrow(error); // 正确位置
    console.log("Handle error");
  }
}

// ❌ 错误: 在 try 块中使用
async function wrongUsage() {
  try {
    rethrow(new Error("test")); // 错误位置
  } catch (error) {
    console.log(error);
  }
}
```

#### 调用顺序

```typescript
import { unstable_rethrow as rethrow } from "next/server";

async function handleError() {
  try {
    await someOperation();
  } catch (error) {
    // ✅ 正确: rethrow 应该在第一行
    rethrow(error);

    // 后续的错误处理
    console.error("Application error:", error);
    return { error: "Failed" };
  }
}

async function someOperation() {
  throw new Error("test");
}
```

### 4.3 错误类型

#### Next.js 内部错误

```typescript
// 这些错误会被 rethrow 重新抛出:
// - redirect() 抛出的错误
// - notFound() 抛出的错误
// - permanentRedirect() 抛出的错误

import { unstable_rethrow as rethrow } from "next/server";
import { redirect, notFound } from "next/navigation";

async function example() {
  try {
    redirect("/home"); // 会被重抛
  } catch (error) {
    rethrow(error); // 重抛后,下面的代码不会执行
    console.log("This will not run");
  }
}
```

#### 应用错误

```typescript
// 这些错误不会被 rethrow 重新抛出:
// - 普通的 Error 对象
// - 自定义错误类
// - 其他异常

import { unstable_rethrow as rethrow } from "next/server";

async function example() {
  try {
    throw new Error("Application error"); // 不会被重抛
  } catch (error) {
    rethrow(error); // 不会重抛,继续执行
    console.log("This will run"); // 会执行
    return { error: "Failed" };
  }
}
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单的错误重抛

```typescript
// app/simple/page.tsx
import { unstable_rethrow as rethrow } from "next/server";
import { notFound } from "next/navigation";

export default async function SimplePage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const data = await fetchData(params.id);

    if (!data) {
      notFound();
    }

    return <div>{data.title}</div>;
  } catch (error) {
    rethrow(error);

    console.error("Error:", error);
    return <div>Error</div>;
  }
}

async function fetchData(id: string) {
  return null;
}
```

#### Server Action 中的使用

```typescript
// app/actions/data.ts
"use server";

import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateData(id: string, data: any) {
  try {
    await saveData(id, data);
    revalidatePath("/data");
    redirect("/data");
  } catch (error) {
    rethrow(error);
    console.error("Update failed:", error);
    return { error: "Failed to update" };
  }
}

async function saveData(id: string, data: any) {
  console.log("Saving:", id, data);
}
```

### 5.2 进阶用法

#### 多层错误处理

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

async function complexOperation() {
  try {
    await step1();
    await step2();
    await step3();
  } catch (error) {
    rethrow(error);

    console.error("Operation failed:", error);
    await rollback();
    throw error;
  }
}

async function step1() {
  try {
    const result = await fetchData();
    if (!result) {
      redirect("/error");
    }
    return result;
  } catch (error) {
    rethrow(error);
    throw new Error("Step 1 failed");
  }
}

async function step2() {
  console.log("Step 2");
}

async function step3() {
  console.log("Step 3");
}

async function fetchData() {
  return null;
}

async function rollback() {
  console.log("Rolling back");
}
```

#### 自定义错误处理器

```typescript
import { unstable_rethrow as rethrow } from "next/server";

type ErrorHandler = (error: unknown) => void | Promise<void>;

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  handler?: ErrorHandler
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      rethrow(error);

      if (handler) {
        await handler(error);
      } else {
        console.error("Unhandled error:", error);
      }

      throw error;
    }
  }) as T;
}

// 使用
const safeOperation = withErrorHandling(
  async (id: string) => {
    const data = await fetchData(id);
    return data;
  },
  async (error) => {
    console.error("Custom handler:", error);
    await logError(error);
  }
);

async function fetchData(id: string) {
  return { id };
}

async function logError(error: unknown) {
  console.log("Logging error:", error);
}
```

#### 条件重抛

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

async function conditionalRethrow() {
  try {
    const shouldRedirect = await checkCondition();

    if (shouldRedirect) {
      redirect("/target");
    }

    return "success";
  } catch (error) {
    rethrow(error);

    // 根据错误类型决定处理方式
    if (error instanceof TypeError) {
      console.error("Type error:", error);
      return "type-error";
    }

    if (error instanceof RangeError) {
      console.error("Range error:", error);
      return "range-error";
    }

    console.error("Unknown error:", error);
    return "unknown-error";
  }
}

async function checkCondition() {
  return false;
}
```

#### 错误日志记录

```typescript
import { unstable_rethrow as rethrow } from "next/server";

async function withLogging<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    console.log(`[${context}] Success in ${duration}ms`);
    return result;
  } catch (error) {
    rethrow(error);

    const duration = Date.now() - startTime;
    console.error(`[${context}] Failed after ${duration}ms:`, error);

    await logToService({
      context,
      error: error instanceof Error ? error.message : String(error),
      duration,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

async function logToService(data: any) {
  console.log("Logging to service:", data);
}
```

## 6. 注意事项

### 6.1 调用位置

#### 必须在 catch 块的开头

```typescript
import { unstable_rethrow as rethrow } from "next/server";

// ✅ 正确
async function correct() {
  try {
    await operation();
  } catch (error) {
    rethrow(error); // 第一行调用
    console.log("Handle error");
  }
}

// ❌ 错误
async function wrong() {
  try {
    await operation();
  } catch (error) {
    console.log("Log first"); // 不应该在 rethrow 之前
    rethrow(error);
  }
}

async function operation() {
  throw new Error("test");
}
```

### 6.2 错误类型判断

#### 不要假设错误类型

```typescript
import { unstable_rethrow as rethrow } from "next/server";

// ✅ 正确: 先 rethrow,再处理
async function correct() {
  try {
    await operation();
  } catch (error) {
    rethrow(error);

    // 安全地处理错误
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
  }
}

// ❌ 错误: 先判断类型,可能遗漏框架错误
async function wrong() {
  try {
    await operation();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    rethrow(error); // 太晚了
  }
}

async function operation() {
  throw new Error("test");
}
```

### 6.3 与其他错误处理的配合

#### 错误边界

```typescript
// app/error.tsx
"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 全局错误处理

```typescript
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Application Error</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Reset</button>
      </body>
    </html>
  );
}
```

### 6.4 性能考虑

#### 避免过度捕获

```typescript
import { unstable_rethrow as rethrow } from "next/server";

// ❌ 不好: 过度使用 try-catch
async function overuse() {
  try {
    const a = await fetchA();
  } catch (error) {
    rethrow(error);
    console.error(error);
  }

  try {
    const b = await fetchB();
  } catch (error) {
    rethrow(error);
    console.error(error);
  }
}

// ✅ 好: 合理使用
async function better() {
  try {
    const a = await fetchA();
    const b = await fetchB();
    return { a, b };
  } catch (error) {
    rethrow(error);
    console.error("Fetch failed:", error);
    return null;
  }
}

async function fetchA() {
  return "A";
}

async function fetchB() {
  return "B";
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: 为什么需要 unstable_rethrow?

**问题**: 为什么不能直接在 catch 中处理所有错误?

**简短回答**: Next.js 的 redirect 和 notFound 是通过抛出特殊错误实现的,必须重抛才能正常工作。

**详细解释**:

Next.js 使用错误机制来实现导航功能。如果在 try-catch 中捕获这些错误而不重抛,会导致导航失效。

**对比表格**:

| 场景       | 不使用 rethrow  | 使用 rethrow |
| :--------- | :-------------- | :----------- |
| redirect() | 导航失效        | 正常导航     |
| notFound() | 不显示 404 页面 | 正常显示 404 |
| 应用错误   | 正常捕获        | 正常捕获     |

**代码示例**:

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

// ❌ 不使用 rethrow - 导航失效
async function withoutRethrow() {
  try {
    redirect("/home");
  } catch (error) {
    console.error(error); // 捕获了 redirect 错误
    // redirect 不会执行
  }
}

// ✅ 使用 rethrow - 导航正常
async function withRethrow() {
  try {
    redirect("/home");
  } catch (error) {
    rethrow(error); // 重抛 redirect 错误
    console.error(error); // 这行不会执行
  }
}
```

#### 问题二: rethrow 会重抛所有错误吗?

**问题**: `unstable_rethrow` 会重抛所有类型的错误吗?

**简短回答**: 不会,只重抛 Next.js 内部错误。

**详细解释**:

`unstable_rethrow` 只会重抛 Next.js 框架的特殊错误(如 redirect、notFound),普通应用错误不会被重抛。

**代码示例**:

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

async function example1() {
  try {
    redirect("/home"); // Next.js 内部错误
  } catch (error) {
    rethrow(error); // 会重抛
    console.log("不会执行");
  }
}

async function example2() {
  try {
    throw new Error("App error"); // 应用错误
  } catch (error) {
    rethrow(error); // 不会重抛
    console.log("会执行"); // 继续执行
    return "handled";
  }
}
```

#### 问题三: 可以在客户端组件中使用吗?

**问题**: `unstable_rethrow` 可以在客户端组件中使用吗?

**简短回答**: 可以导入,但主要用于服务端。

**详细解释**:

虽然可以在客户端导入,但 `unstable_rethrow` 主要设计用于服务端组件和 Server Actions,因为 redirect 和 notFound 主要在服务端使用。

**代码示例**:

```typescript
// ✅ 服务端组件 - 推荐
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

export default async function ServerPage() {
  try {
    redirect("/home");
  } catch (error) {
    rethrow(error);
  }
}

// ⚠️ 客户端组件 - 不常用
("use client");

import { unstable_rethrow as rethrow } from "next/server";

export default function ClientComponent() {
  const handleClick = async () => {
    try {
      await someOperation();
    } catch (error) {
      rethrow(error);
      console.error(error);
    }
  };

  return <button onClick={handleClick}>Click</button>;
}

async function someOperation() {
  throw new Error("test");
}
```

### 7.2 进阶问题

#### 问题四: 如何处理异步错误?

**问题**: 在异步操作中如何正确使用 `unstable_rethrow`?

**简短回答**: 在 async 函数的 catch 块中使用,与同步错误处理相同。

**详细解释**:

`unstable_rethrow` 在异步函数中的使用方式与同步函数相同,都是在 catch 块的开头调用。

**代码示例**:

```typescript
import { unstable_rethrow as rethrow } from "next/server";
import { redirect } from "next/navigation";

async function handleAsync() {
  try {
    const data = await fetchData();

    if (!data) {
      redirect("/error");
    }

    const processed = await processData(data);
    return processed;
  } catch (error) {
    rethrow(error);

    console.error("Async operation failed:", error);
    return null;
  }
}

async function fetchData() {
  return null;
}

async function processData(data: any) {
  return data;
}
```

#### 问题五: 如何与错误边界配合?

**问题**: `unstable_rethrow` 如何与 React 错误边界配合使用?

**简短回答**: rethrow 处理服务端错误,错误边界处理客户端错误。

**详细解释**:

`unstable_rethrow` 主要用于服务端错误处理,而错误边界用于捕获客户端渲染错误。两者可以配合使用,形成完整的错误处理体系。

**代码示例**:

```typescript
// app/posts/[id]/page.tsx - 服务端
import { unstable_rethrow as rethrow } from "next/server";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: { id: string } }) {
  try {
    const post = await fetchPost(params.id);

    if (!post) {
      notFound();
    }

    return <PostContent post={post} />;
  } catch (error) {
    rethrow(error);

    console.error("Server error:", error);
    throw error; // 传递给错误边界
  }
}

// app/posts/[id]/error.tsx - 客户端错误边界
("use client");

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Post Error</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}

async function fetchPost(id: string) {
  return null;
}

function PostContent({ post }: { post: any }) {
  return <div>{post?.title}</div>;
}
```

## 8. 总结

### 8.1 核心要点回顾

**unstable_rethrow 的主要特点**:

- 区分框架错误和应用错误
- 保持 Next.js 导航机制正常工作
- 允许自定义处理应用错误
- 简单易用的 API

**使用流程**:

1. 在 try-catch 的 catch 块开头调用 `rethrow(error)`
2. 如果是框架错误,立即重新抛出
3. 如果是应用错误,继续执行后续代码
4. 处理应用错误并返回结果

### 8.2 关键收获

1. **必要性**: redirect 和 notFound 依赖错误机制,必须重抛
2. **位置**: 必须在 catch 块的第一行调用
3. **选择性**: 只重抛框架错误,不重抛应用错误
4. **兼容性**: 与错误边界和全局错误处理配合使用
5. **简洁性**: 一行代码解决框架错误处理问题

### 8.3 最佳实践

1. **始终在第一行**: 在 catch 块的第一行调用 rethrow
2. **不要条件调用**: 不要根据错误类型决定是否调用 rethrow
3. **配合日志**: rethrow 后可以记录应用错误日志
4. **错误传播**: 必要时在 rethrow 后重新抛出应用错误
5. **类型安全**: 使用类型守卫安全地处理错误对象

### 8.4 下一步学习

- **after**: 了解响应后的异步操作处理
- **错误边界**: 学习客户端错误处理
- **revalidatePath**: 掌握缓存重新验证
- **Server Actions**: 深入理解服务端操作

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# cookies 操作完全指南

## 1. 概述与背景

### 1.1 什么是 Cookies

Cookies 是存储在用户浏览器中的小型文本文件,用于在客户端和服务器之间传递数据。在 Next.js 16 中,Cookie 的处理变得更加灵活和安全。

Cookie 的主要特性:

- **持久化**: 可以设置过期时间,在浏览器关闭后仍然保留
- **域限制**: 只能被设置它的域访问
- **路径限制**: 可以限制 Cookie 的访问路径
- **安全性**: 支持 HttpOnly、Secure 等安全选项
- **大小限制**: 单个 Cookie 最大 4KB

### 1.2 为什么需要 Cookies

Cookies 在 Web 应用中有多种用途:

- **会话管理**: 保持用户登录状态
- **个性化**: 记住用户偏好设置
- **追踪**: 分析用户行为
- **购物车**: 存储购物车信息
- **语言选择**: 记住用户选择的语言

### 1.3 Next.js 16 的 Cookie 特性

Next.js 16 提供了强大的 Cookie 处理能力:

| 功能               | 说明              | 使用场景      |
| :----------------- | :---------------- | :------------ |
| `cookies()`        | 读取和设置 Cookie | 服务端组件    |
| `request.cookies`  | 读取 Cookie       | Route Handler |
| `response.cookies` | 设置 Cookie       | Route Handler |
| `Set-Cookie` 头    | 手动设置 Cookie   | 自定义响应    |

⚠️ **重要变化**: 在 Next.js 16 中,`cookies()` 函数变成了异步函数,需要使用 `await` 调用。

```typescript
// Next.js 15
const cookieStore = cookies();

// Next.js 16
const cookieStore = await cookies();
```

## 2. 核心概念

### 2.1 读取 Cookies

#### 在服务端组件中读取

```typescript
// app/page.tsx
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();

  // 读取单个 Cookie
  const token = cookieStore.get("token");
  const userId = cookieStore.get("user-id");

  return (
    <div>
      <p>Token: {token?.value}</p>
      <p>User ID: {userId?.value}</p>
    </div>
  );
}
```

#### 在 Route Handler 中读取

```typescript
// app/api/user/route.ts
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token");

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    token: token.value,
  });
}
```

### 2.2 设置 Cookies

#### 在 Route Handler 中设置

```typescript
// app/api/login/route.ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // 验证用户
  const user = await authenticateUser(username, password);

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 设置 Cookie
  const cookieStore = await cookies();
  cookieStore.set("token", user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7天
  });

  return Response.json({ success: true });
}

async function authenticateUser(username: string, password: string) {
  // 实现用户验证逻辑
  return { id: "1", username, token: "jwt-token" };
}
```

#### 使用 Set-Cookie 头

```typescript
// app/api/set-cookie/route.ts

export async function GET() {
  const response = Response.json({ success: true });

  response.headers.set(
    "Set-Cookie",
    "token=value; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800"
  );

  return response;
}
```

### 2.3 删除 Cookies

```typescript
// app/api/logout/route.ts
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // 删除 Cookie
  cookieStore.delete("token");
  cookieStore.delete("user-id");

  return Response.json({ success: true });
}
```

### 2.4 Cookie 选项

Cookie 支持多种选项来控制其行为:

| 选项       | 类型                        | 说明                 |
| :--------- | :-------------------------- | :------------------- |
| `maxAge`   | number                      | 过期时间(秒)         |
| `expires`  | Date                        | 过期日期             |
| `path`     | string                      | Cookie 路径          |
| `domain`   | string                      | Cookie 域            |
| `secure`   | boolean                     | 只在 HTTPS 下传输    |
| `httpOnly` | boolean                     | 禁止 JavaScript 访问 |
| `sameSite` | 'strict' \| 'lax' \| 'none' | 跨站请求策略         |

```typescript
cookieStore.set("name", "value", {
  maxAge: 60 * 60 * 24, // 1天
  path: "/",
  domain: "example.com",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
});
```

## 3. 适用场景

### 3.1 用户认证

使用 Cookie 实现用户认证和会话管理:

#### 登录流程

```typescript
// app/api/auth/login/route.ts
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 验证用户凭证
  const user = await verifyCredentials(email, password);

  if (!user) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // 生成 JWT token
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // 设置 Cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: "/",
  });

  return Response.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

async function verifyCredentials(email: string, password: string) {
  // 实现凭证验证逻辑
  return {
    id: "1",
    email,
    name: "John Doe",
  };
}
```

#### 验证认证状态

```typescript
// app/api/auth/verify/route.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);

    return Response.json({
      authenticated: true,
      user: payload,
    });
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
```

#### 登出流程

```typescript
// app/api/auth/logout/route.ts
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // 删除认证 Cookie
  cookieStore.delete("auth-token");

  return Response.json({ success: true });
}
```

#### 受保护的页面

```typescript
// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) {
    redirect("/login");
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);

    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {payload.email as string}</p>
      </div>
    );
  } catch (error) {
    redirect("/login");
  }
}
```

### 3.2 用户偏好设置

使用 Cookie 保存用户偏好:

#### 主题切换

```typescript
// app/api/preferences/theme/route.ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { theme } = await request.json();

  if (!["light", "dark"].includes(theme)) {
    return Response.json({ error: "Invalid theme" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    maxAge: 60 * 60 * 24 * 365, // 1年
    path: "/",
  });

  return Response.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");

  return Response.json({
    theme: theme?.value || "light",
  });
}
```

#### 应用主题

```typescript
// app/layout.tsx
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

#### 语言偏好

```typescript
// app/api/preferences/language/route.ts
import { cookies } from "next/headers";

const SUPPORTED_LANGUAGES = ["en", "zh", "ja", "es", "fr"];

export async function POST(request: Request) {
  const { language } = await request.json();

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return Response.json({ error: "Unsupported language" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("language", language, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return Response.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language");

  return Response.json({
    language: language?.value || "en",
  });
}
```

### 3.3 购物车管理

使用 Cookie 存储购物车信息:

#### 添加商品到购物车

```typescript
// app/api/cart/add/route.ts
import { cookies } from "next/headers";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(request: Request) {
  const item: CartItem = await request.json();

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");

  let cart: CartItem[] = [];

  if (cartCookie) {
    try {
      cart = JSON.parse(cartCookie.value);
    } catch (error) {
      cart = [];
    }
  }

  // 检查商品是否已存在
  const existingItemIndex = cart.findIndex((i) => i.id === item.id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  // 保存购物车
  cookieStore.set("cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 30, // 30天
    path: "/",
  });

  return Response.json({
    success: true,
    cart,
  });
}
```

#### 获取购物车

```typescript
// app/api/cart/route.ts
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");

  let cart = [];

  if (cartCookie) {
    try {
      cart = JSON.parse(cartCookie.value);
    } catch (error) {
      cart = [];
    }
  }

  return Response.json({ cart });
}
```

#### 清空购物车

```typescript
// app/api/cart/clear/route.ts
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("cart");

  return Response.json({ success: true });
}
```

### 3.4 分析和追踪

使用 Cookie 进行用户行为分析:

#### 访问追踪

```typescript
// app/api/analytics/track/route.ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { event, data } = await request.json();

  const cookieStore = await cookies();
  let sessionId = cookieStore.get("session-id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("session-id", sessionId, {
      maxAge: 60 * 30, // 30分钟
      path: "/",
    });
  }

  // 记录事件
  await logEvent({
    sessionId,
    event,
    data,
    timestamp: new Date(),
  });

  return Response.json({ success: true });
}

async function logEvent(eventData: any) {
  // 实现事件记录逻辑
  console.log("Event logged:", eventData);
}
```

#### 用户标识

```typescript
// app/api/analytics/identify/route.ts
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  let userId = cookieStore.get("user-id")?.value;

  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set("user-id", userId, {
      maxAge: 60 * 60 * 24 * 365 * 2, // 2年
      path: "/",
    });
  }

  return Response.json({ userId });
}
```

## 4. API 签名与配置

### 4.1 cookies() 函数

```typescript
import { cookies } from "next/headers";

// 签名
function cookies(): Promise<ReadonlyRequestCookies>;

// 使用示例
const cookieStore = await cookies();
```

### 4.2 ReadonlyRequestCookies 接口

```typescript
interface ReadonlyRequestCookies {
  get(name: string): RequestCookie | undefined;
  getAll(name?: string): RequestCookie[];
  has(name: string): boolean;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
}

interface RequestCookie {
  name: string;
  value: string;
}

interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}
```

### 4.3 常用方法

#### get() 方法

```typescript
const cookieStore = await cookies();
const token = cookieStore.get("token");

if (token) {
  console.log("Token:", token.value);
}
```

#### getAll() 方法

```typescript
const cookieStore = await cookies();

// 获取所有 Cookie
const allCookies = cookieStore.getAll();

// 获取特定名称的所有 Cookie
const tokens = cookieStore.getAll("token");
```

#### has() 方法

```typescript
const cookieStore = await cookies();

if (cookieStore.has("token")) {
  console.log("Token exists");
}
```

#### set() 方法

```typescript
const cookieStore = await cookies();

cookieStore.set("token", "value", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
});
```

#### delete() 方法

```typescript
const cookieStore = await cookies();

cookieStore.delete("token");
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 读取单个 Cookie

```typescript
// app/page.tsx
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");

  return <div>Theme: {theme?.value || "default"}</div>;
}
```

#### 设置单个 Cookie

```typescript
// app/api/set-theme/route.ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { theme } = await request.json();

  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    maxAge: 60 * 60 * 24 * 365,
  });

  return Response.json({ success: true });
}
```

### 5.2 进阶用法

#### Cookie 加密

使用加密保护敏感 Cookie 数据:

```typescript
// lib/cookie-encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.COOKIE_ENCRYPTION_KEY!, "hex");

export function encryptCookie(value: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptCookie(encrypted: string): string {
  const [ivHex, authTagHex, encryptedData] = encrypted.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// 使用示例
// app/api/secure-cookie/route.ts
import { cookies } from "next/headers";
import { encryptCookie, decryptCookie } from "@/lib/cookie-encryption";

export async function POST(request: Request) {
  const { data } = await request.json();

  const encrypted = encryptCookie(JSON.stringify(data));

  const cookieStore = await cookies();
  cookieStore.set("secure-data", encrypted, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
  });

  return Response.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get("secure-data");

  if (!encrypted) {
    return Response.json({ error: "No data" }, { status: 404 });
  }

  try {
    const decrypted = decryptCookie(encrypted.value);
    const data = JSON.parse(decrypted);

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }
}
```

#### Cookie 签名

使用签名验证 Cookie 完整性:

```typescript
// lib/cookie-signing.ts
import { createHmac } from "crypto";

const SECRET = process.env.COOKIE_SECRET!;

export function signCookie(value: string): string {
  const signature = createHmac("sha256", SECRET).update(value).digest("hex");

  return `${value}.${signature}`;
}

export function verifyCookie(signedValue: string): string | null {
  const [value, signature] = signedValue.split(".");

  if (!value || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", SECRET)
    .update(value)
    .digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  return value;
}

// 使用示例
// app/api/signed-cookie/route.ts
import { cookies } from "next/headers";
import { signCookie, verifyCookie } from "@/lib/cookie-signing";

export async function POST(request: Request) {
  const { data } = await request.json();

  const signed = signCookie(JSON.stringify(data));

  const cookieStore = await cookies();
  cookieStore.set("signed-data", signed, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return Response.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const signed = cookieStore.get("signed-data");

  if (!signed) {
    return Response.json({ error: "No data" }, { status: 404 });
  }

  const value = verifyCookie(signed.value);

  if (!value) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const data = JSON.parse(value);
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }
}
```

#### 多值 Cookie

处理包含多个值的 Cookie:

```typescript
// lib/multi-value-cookie.ts

export function encodeMultiValueCookie(values: Record<string, string>): string {
  return Object.entries(values)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

export function decodeMultiValueCookie(
  encoded: string
): Record<string, string> {
  const values: Record<string, string> = {};

  encoded.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) {
      values[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return values;
}

// 使用示例
// app/api/multi-value/route.ts
import { cookies } from "next/headers";
import {
  encodeMultiValueCookie,
  decodeMultiValueCookie,
} from "@/lib/multi-value-cookie";

export async function POST(request: Request) {
  const values = await request.json();

  const encoded = encodeMultiValueCookie(values);

  const cookieStore = await cookies();
  cookieStore.set("preferences", encoded, {
    maxAge: 60 * 60 * 24 * 365,
  });

  return Response.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const encoded = cookieStore.get("preferences");

  if (!encoded) {
    return Response.json({ preferences: {} });
  }

  const values = decodeMultiValueCookie(encoded.value);

  return Response.json({ preferences: values });
}
```

#### Cookie 版本控制

实现 Cookie 版本控制:

```typescript
// lib/versioned-cookie.ts

interface VersionedCookie<T> {
  version: number;
  data: T;
}

export function createVersionedCookie<T>(data: T, version: number = 1): string {
  const cookie: VersionedCookie<T> = { version, data };
  return JSON.stringify(cookie);
}

export function parseVersionedCookie<T>(value: string): T | null {
  try {
    const cookie: VersionedCookie<T> = JSON.parse(value);

    // 检查版本
    if (cookie.version !== 1) {
      // 处理版本迁移
      return migrateVersion(cookie);
    }

    return cookie.data;
  } catch (error) {
    return null;
  }
}

function migrateVersion<T>(cookie: VersionedCookie<any>): T | null {
  // 实现版本迁移逻辑
  return null;
}

// 使用示例
// app/api/versioned/route.ts
import { cookies } from "next/headers";
import {
  createVersionedCookie,
  parseVersionedCookie,
} from "@/lib/versioned-cookie";

interface UserPreferences {
  theme: string;
  language: string;
}

export async function POST(request: Request) {
  const preferences: UserPreferences = await request.json();

  const versioned = createVersionedCookie(preferences);

  const cookieStore = await cookies();
  cookieStore.set("user-prefs", versioned, {
    maxAge: 60 * 60 * 24 * 365,
  });

  return Response.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const versioned = cookieStore.get("user-prefs");

  if (!versioned) {
    return Response.json({ preferences: null });
  }

  const preferences = parseVersionedCookie<UserPreferences>(versioned.value);

  return Response.json({ preferences });
}
```

## 6. 注意事项

### 6.1 安全问题

#### HttpOnly 标志

始终为敏感 Cookie 设置 HttpOnly:

```typescript
// ❌ 错误: 敏感数据未设置 HttpOnly
cookieStore.set("auth-token", token, {
  secure: true,
  sameSite: "lax",
});

// ✅ 正确: 设置 HttpOnly
cookieStore.set("auth-token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});
```

#### Secure 标志

生产环境必须使用 Secure:

```typescript
// ❌ 错误: 生产环境未使用 Secure
cookieStore.set("token", value, {
  httpOnly: true,
});

// ✅ 正确: 根据环境设置 Secure
cookieStore.set("token", value, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
});
```

#### SameSite 属性

正确设置 SameSite 防止 CSRF:

```typescript
// ❌ 错误: 未设置 SameSite
cookieStore.set("token", value, {
  httpOnly: true,
  secure: true,
});

// ✅ 正确: 设置 SameSite
cookieStore.set("token", value, {
  httpOnly: true,
  secure: true,
  sameSite: "lax", // 或 'strict'
});
```

### 6.2 大小限制

#### Cookie 大小

单个 Cookie 不应超过 4KB:

```typescript
// ❌ 错误: Cookie 过大
const largeData = "a".repeat(5000);
cookieStore.set("data", largeData);

// ✅ 正确: 使用服务端存储
const sessionId = crypto.randomUUID();
await saveToDatabase(sessionId, largeData);
cookieStore.set("session-id", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});
```

#### Cookie 数量

浏览器对每个域的 Cookie 数量有限制:

```typescript
// ❌ 错误: 创建过多 Cookie
for (let i = 0; i < 100; i++) {
  cookieStore.set(`cookie-${i}`, `value-${i}`);
}

// ✅ 正确: 合并到单个 Cookie
const data = {};
for (let i = 0; i < 100; i++) {
  data[`key-${i}`] = `value-${i}`;
}
cookieStore.set("data", JSON.stringify(data));
```

### 6.3 过期时间

#### 合理设置过期时间

根据用途设置合适的过期时间:

```typescript
// 会话 Cookie (浏览器关闭时删除)
cookieStore.set("session", value);

// 短期 Cookie (1小时)
cookieStore.set("temp", value, {
  maxAge: 60 * 60,
});

// 长期 Cookie (1年)
cookieStore.set("remember", value, {
  maxAge: 60 * 60 * 24 * 365,
});
```

### 6.4 域和路径

#### 正确设置域

```typescript
// ❌ 错误: 设置错误的域
cookieStore.set("token", value, {
  domain: "example.com", // 在 subdomain.example.com 上设置
});

// ✅ 正确: 设置正确的域
cookieStore.set("token", value, {
  domain: ".example.com", // 允许所有子域访问
});
```

#### 正确设置路径

```typescript
// ❌ 错误: 路径过于宽泛
cookieStore.set("admin-token", value, {
  path: "/", // 所有路径都能访问
});

// ✅ 正确: 限制路径
cookieStore.set("admin-token", value, {
  path: "/admin", // 只有 /admin 路径能访问
});
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: cookies() 函数为什么要用 await?

**问题**: Next.js 16 中 `cookies()` 为什么变成异步函数?

**简短回答**: 为了支持异步服务器组件和更好的性能优化。

**详细解释**:

Next.js 16 将 `cookies()` 改为异步函数,以便更好地支持异步服务器组件和流式渲染。这允许 Next.js 在需要时延迟读取 Cookie,提高性能。

**代码示例**:

```typescript
// Next.js 15
const cookieStore = cookies();

// Next.js 16
const cookieStore = await cookies();
```

#### 问题二: 如何在客户端组件中读取 Cookie?

**问题**: 客户端组件无法使用 `cookies()` 函数,如何读取 Cookie?

**简短回答**: 使用 `document.cookie` 或通过服务端组件传递。

**详细解释**:

客户端组件运行在浏览器中,可以使用 `document.cookie` 读取非 HttpOnly 的 Cookie。对于 HttpOnly Cookie,需要通过服务端组件传递或调用 API 路由。

**代码示例**:

```typescript
// 客户端读取 Cookie
"use client";

export function ClientComponent() {
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return null;
  };

  const theme = getCookie("theme");

  return <div>Theme: {theme}</div>;
}

// 通过服务端组件传递
// app/page.tsx
import { cookies } from "next/headers";
import ClientComponent from "./ClientComponent";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  return <ClientComponent hasAuth={!!token} />;
}
```

#### 问题三: 如何删除 Cookie?

**问题**: 如何正确删除 Cookie?

**简短回答**: 使用 `cookieStore.delete()` 方法。

**详细解释**:

使用 `delete()` 方法可以删除 Cookie。也可以通过设置过期时间为过去的时间来删除。

**代码示例**:

```typescript
// 方法一: 使用 delete()
const cookieStore = await cookies();
cookieStore.delete("token");

// 方法二: 设置过期时间
cookieStore.set("token", "", {
  maxAge: 0,
});
```

### 7.2 进阶问题

#### 问题四: 如何实现跨子域的 Cookie 共享?

**问题**: 如何让多个子域共享同一个 Cookie?

**简短回答**: 设置 `domain` 为顶级域名。

**详细解释**:

通过设置 `domain` 为 `.example.com`,可以让所有子域(如 `app.example.com`、`api.example.com`)共享 Cookie。

**代码示例**:

```typescript
const cookieStore = await cookies();
cookieStore.set("shared-token", token, {
  domain: ".example.com",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
});
```

#### 问题五: 如何处理 Cookie 大小限制?

**问题**: 当数据超过 4KB 时如何处理?

**简短回答**: 使用服务端会话存储。

**详细解释**:

当数据超过 Cookie 大小限制时,应该将数据存储在服务端(数据库、Redis 等),Cookie 中只存储会话 ID。

**代码示例**:

```typescript
// app/api/session/create/route.ts
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

export async function POST(request: Request) {
  const data = await request.json();

  // 生成会话 ID
  const sessionId = crypto.randomUUID();

  // 存储到 Redis
  await redis.set(
    `session:${sessionId}`,
    JSON.stringify(data),
    "EX",
    60 * 60 * 24 * 7 // 7天
  );

  // Cookie 中只存储会话 ID
  const cookieStore = await cookies();
  cookieStore.set("session-id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ success: true });
}

// app/api/session/get/route.ts
export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id");

  if (!sessionId) {
    return Response.json({ error: "No session" }, { status: 404 });
  }

  const data = await redis.get(`session:${sessionId.value}`);

  if (!data) {
    return Response.json({ error: "Session expired" }, { status: 404 });
  }

  return Response.json({ data: JSON.parse(data) });
}
```

#### 问题六: 如何实现 Remember Me 功能?

**问题**: 如何实现"记住我"功能?

**简短回答**: 使用长期 Cookie 存储刷新令牌。

**详细解释**:

实现"记住我"功能需要使用两个 Cookie:一个短期的访问令牌和一个长期的刷新令牌。

**代码示例**:

```typescript
// app/api/auth/login/route.ts
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, password, rememberMe } = await request.json();

  const user = await verifyCredentials(email, password);

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const cookieStore = await cookies();

  // 访问令牌 (短期)
  cookieStore.set("access-token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 15, // 15分钟
  });

  // 刷新令牌 (长期,仅在勾选"记住我"时)
  if (rememberMe) {
    cookieStore.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30天
    });
  }

  return Response.json({ success: true });
}

async function verifyCredentials(email: string, password: string) {
  return { id: "1", email };
}

async function generateAccessToken(user: any) {
  return "access-token";
}

async function generateRefreshToken(user: any) {
  return "refresh-token";
}
```

## 8. 总结

### 8.1 核心要点回顾

**Cookie 操作方法**:

| 方法       | 说明                 | 示例                               |
| :--------- | :------------------- | :--------------------------------- |
| `get()`    | 读取单个 Cookie      | `cookieStore.get('name')`          |
| `getAll()` | 读取所有 Cookie      | `cookieStore.getAll()`             |
| `has()`    | 检查 Cookie 是否存在 | `cookieStore.has('name')`          |
| `set()`    | 设置 Cookie          | `cookieStore.set('name', 'value')` |
| `delete()` | 删除 Cookie          | `cookieStore.delete('name')`       |

**Cookie 选项**:

| 选项       | 说明                 | 推荐值                  |
| :--------- | :------------------- | :---------------------- |
| `httpOnly` | 禁止 JavaScript 访问 | `true` (敏感数据)       |
| `secure`   | 只在 HTTPS 下传输    | `true` (生产环境)       |
| `sameSite` | 跨站请求策略         | `'lax'` 或 `'strict'`   |
| `maxAge`   | 过期时间(秒)         | 根据用途设置            |
| `path`     | Cookie 路径          | `'/'`                   |
| `domain`   | Cookie 域            | `.example.com` (跨子域) |

### 8.2 关键收获

1. **安全优先**: 始终为敏感 Cookie 设置 HttpOnly、Secure 和 SameSite
2. **大小限制**: 单个 Cookie 不超过 4KB,大数据使用服务端存储
3. **合理过期**: 根据用途设置合适的过期时间
4. **域和路径**: 正确设置域和路径限制 Cookie 访问范围
5. **加密签名**: 对敏感数据进行加密或签名

### 8.3 最佳实践

1. **使用 HttpOnly**: 防止 XSS 攻击
2. **使用 Secure**: 防止中间人攻击
3. **使用 SameSite**: 防止 CSRF 攻击
4. **限制大小**: 避免 Cookie 过大影响性能
5. **合理命名**: 使用有意义的 Cookie 名称

### 8.4 下一步学习

- **会话管理**: 学习更复杂的会话管理方案
- **JWT**: 深入了解 JWT 的使用
- **OAuth**: 学习第三方认证
- **安全防护**: 了解更多 Web 安全知识

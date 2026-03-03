**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# experimental.taint 配置

## 概述

experimental.taint 是 Next.js 16 中用于标记和追踪敏感数据的实验性配置选项。通过 taint API，可以防止敏感数据意外泄露到客户端，提升应用安全性。

### taint 的作用

1. **数据保护**：防止敏感数据泄露
2. **安全追踪**：追踪数据流向
3. **开发警告**：开发时提示风险
4. **类型安全**：TypeScript 支持
5. **零运行时**：生产环境无性能影响

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    taint: true,
  },
};
```

### 标记敏感数据

```typescript
// lib/taint.ts
import { experimental_taintObjectReference } from "react";

export function taintSensitiveData(data: any, message: string) {
  experimental_taintObjectReference(message, data);
}
```

### 使用示例

```typescript
// app/api/user/route.ts
import { taintSensitiveData } from "@/lib/taint";

export async function GET() {
  const user = await db.user.findFirst();

  // 标记敏感数据
  taintSensitiveData(user, "Do not pass user object to client");

  return Response.json({
    id: user.id,
    name: user.name,
    // email: user.email, // 不应该返回
  });
}
```

### 标记字符串

```typescript
import { experimental_taintUniqueValue } from "react";

const apiKey = process.env.API_KEY;
experimental_taintUniqueValue("Do not pass API key to client", apiKey, apiKey);
```

## 高级配置

### 保护数据库查询结果

```typescript
// lib/db.ts
import { experimental_taintObjectReference } from "react";

export async function getUserWithPassword(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: { password: true },
  });

  // 标记包含密码的用户对象
  experimental_taintObjectReference("User object contains password", user);

  return user;
}
```

### 保护环境变量

```typescript
// lib/env.ts
import { experimental_taintUniqueValue } from "react";

const secrets = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
};

// 标记所有密钥
Object.entries(secrets).forEach(([key, value]) => {
  experimental_taintUniqueValue(`Do not pass ${key} to client`, secrets, value);
});

export { secrets };
```

### 保护用户会话

```typescript
// lib/session.ts
import { experimental_taintObjectReference } from "react";

export async function getSession(token: string) {
  const session = await verifyToken(token);

  // 标记会话对象
  experimental_taintObjectReference("Session contains sensitive data", session);

  return session;
}
```

### 保护支付信息

```typescript
// lib/payment.ts
import { experimental_taintObjectReference } from "react";

export async function getPaymentMethod(id: string) {
  const payment = await db.paymentMethod.findUnique({
    where: { id },
  });

  // 标记支付信息
  experimental_taintObjectReference(
    "Payment method contains card details",
    payment
  );

  return payment;
}
```

### 自定义 taint 工具

```typescript
// lib/taint-utils.ts
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";

export function taintObject(obj: any, message?: string) {
  experimental_taintObjectReference(message || "Sensitive object", obj);
}

export function taintValue(value: string, message?: string) {
  experimental_taintUniqueValue(message || "Sensitive value", {}, value);
}

export function taintArray(arr: any[], message?: string) {
  arr.forEach((item) => {
    experimental_taintObjectReference(message || "Sensitive array item", item);
  });
}
```

### 条件性 taint

```typescript
// lib/conditional-taint.ts
import { experimental_taintObjectReference } from "react";

export function taintIfProduction(data: any, message: string) {
  if (process.env.NODE_ENV === "production") {
    experimental_taintObjectReference(message, data);
  }
}
```

## 配置选项详解

### 完整配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    // 启用taint功能
    taint: true,

    // 配合其他安全选项
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};
```

### 配置对比

| 配置项     | 默认值   | 推荐值   | 说明             |
| ---------- | -------- | -------- | ---------------- |
| taint      | false    | true     | 启用数据污染追踪 |
| 开发环境   | 抛出错误 | 保持默认 | 帮助发现问题     |
| 生产环境   | 静默失败 | 保持默认 | 避免影响用户     |
| TypeScript | 自动支持 | 启用     | 获得类型检查     |

### 环境变量配置

```bash
# .env.local
# 开发环境启用详细日志
NEXT_PUBLIC_TAINT_DEBUG=true

# 生产环境记录违规
TAINT_LOG_VIOLATIONS=true
```

## 实战案例

### 案例 1：用户认证系统

**场景**: 保护用户密码和敏感信息

```typescript
// app/api/auth/login/route.ts
import { experimental_taintObjectReference } from "react";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 查询用户(包含密码哈希)
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 标记包含密码的用户对象
  experimental_taintObjectReference(
    "User object contains hashed password - do not send to client",
    user
  );

  // 验证密码
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 创建会话
  const session = await createSession(user.id);

  // 标记会话对象
  experimental_taintObjectReference(
    "Session contains sensitive tokens",
    session
  );

  // 只返回安全数据
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    sessionId: session.id, // 只返回ID,不返回完整session
  });
}
```

**安全检查清单**:

| 检查项       | 是否完成 | 说明           |
| ------------ | -------- | -------------- |
| 标记用户对象 | ✅       | 包含密码哈希   |
| 标记会话对象 | ✅       | 包含敏感令牌   |
| 过滤返回数据 | ✅       | 只返回必要字段 |
| 验证输入     | ✅       | 防止注入攻击   |
| 错误处理     | ✅       | 不泄露敏感信息 |

### 案例 2：API 密钥管理

**场景**: 管理多个第三方服务的 API 密钥

```typescript
// lib/api-keys.ts
import { experimental_taintUniqueValue } from "react";

interface APIKey {
  name: string;
  key: string;
  service: string;
  createdAt: Date;
}

class APIKeyManager {
  private keys: Map<string, APIKey> = new Map();

  addKey(name: string, key: string, service: string) {
    const apiKey: APIKey = {
      name,
      key,
      service,
      createdAt: new Date(),
    };

    // 标记API密钥值
    experimental_taintUniqueValue(
      `API key ${name} for ${service} should not be exposed to client`,
      apiKey,
      key
    );

    this.keys.set(name, apiKey);
  }

  getKey(name: string): string | undefined {
    return this.keys.get(name)?.key;
  }

  hasKey(name: string): boolean {
    return this.keys.has(name);
  }

  listServices(): string[] {
    return Array.from(this.keys.values()).map((k) => k.service);
  }
}

// 创建全局实例
export const apiKeys = new APIKeyManager();

// 初始化所有API密钥
apiKeys.addKey("stripe_secret", process.env.STRIPE_SECRET_KEY!, "Stripe");
apiKeys.addKey(
  "stripe_public",
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
  "Stripe"
);
apiKeys.addKey("openai", process.env.OPENAI_API_KEY!, "OpenAI");
apiKeys.addKey("sendgrid", process.env.SENDGRID_API_KEY!, "SendGrid");
apiKeys.addKey("aws_access", process.env.AWS_ACCESS_KEY_ID!, "AWS");
apiKeys.addKey("aws_secret", process.env.AWS_SECRET_ACCESS_KEY!, "AWS");
```

**使用示例**:

```typescript
// app/api/payment/route.ts
import { apiKeys } from "@/lib/api-keys";
import Stripe from "stripe";

export async function POST(request: Request) {
  // 安全地获取API密钥
  const stripeKey = apiKeys.getKey("stripe_secret");

  if (!stripeKey) {
    return Response.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });

  // 处理支付...
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd",
  });

  // 只返回必要信息
  return Response.json({
    clientSecret: paymentIntent.client_secret,
  });
}
```

### 案例 3：数据库连接信息

**场景**: 保护数据库连接配置

```typescript
// lib/database.ts
import { experimental_taintObjectReference } from "react";
import { Pool } from "pg";

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  max?: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  ssl: process.env.NODE_ENV === "production",
  max: 20,
};

// 标记数据库配置对象
experimental_taintObjectReference(
  "Database config contains sensitive credentials - never expose to client",
  dbConfig
);

// 创建连接池
let pool: Pool | null = null;

export function getConnection(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
  }
  return pool;
}

// 安全的配置信息(用于日志)
export function getSafeConfig() {
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    // 不包含密码和用户名
  };
}
```

**使用示例**:

```typescript
// app/api/users/route.ts
import { getConnection } from "@/lib/database";

export async function GET() {
  const db = getConnection();

  const result = await db.query("SELECT id, name, email FROM users");

  return Response.json({
    users: result.rows,
  });
}
```

### 案例 4：第三方服务凭证

**场景**: 集中管理多个第三方服务的凭证

```typescript
// lib/services.ts
import { experimental_taintObjectReference } from "react";

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

interface SendGridCredentials {
  apiKey: string;
  fromEmail: string;
}

interface StripeCredentials {
  secretKey: string;
  webhookSecret: string;
}

interface ServiceCredentials {
  aws: AWSCredentials;
  sendgrid: SendGridCredentials;
  stripe: StripeCredentials;
}

const serviceCredentials: ServiceCredentials = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION || "us-east-1",
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY!,
    fromEmail: process.env.SENDGRID_FROM_EMAIL!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
};

// 标记所有服务凭证
Object.entries(serviceCredentials).forEach(([service, cred]) => {
  experimental_taintObjectReference(
    `${service} credentials should not be exposed to client`,
    cred
  );
});

// 导出类型安全的访问器
export function getAWSCredentials(): AWSCredentials {
  return serviceCredentials.aws;
}

export function getSendGridCredentials(): SendGridCredentials {
  return serviceCredentials.sendgrid;
}

export function getStripeCredentials(): StripeCredentials {
  return serviceCredentials.stripe;
}
```

**使用示例**:

```typescript
// app/api/email/send/route.ts
import { getSendGridCredentials } from "@/lib/services";
import sgMail from "@sendgrid/mail";

export async function POST(request: Request) {
  const { to, subject, text } = await request.json();

  const { apiKey, fromEmail } = getSendGridCredentials();

  sgMail.setApiKey(apiKey);

  await sgMail.send({
    to,
    from: fromEmail,
    subject,
    text,
  });

  return Response.json({ success: true });
}
```

### 案例 5：JWT 令牌保护

**场景**: 保护 JWT 密钥和令牌

```typescript
// lib/jwt.ts
import {
  experimental_taintUniqueValue,
  experimental_taintObjectReference,
} from "react";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// 标记JWT密钥
experimental_taintUniqueValue(
  "JWT secret should never be exposed",
  { type: "jwt_secret" },
  JWT_SECRET
);

experimental_taintUniqueValue(
  "JWT refresh secret should never be exposed",
  { type: "jwt_refresh_secret" },
  JWT_REFRESH_SECRET
);

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function generateTokens(payload: TokenPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const tokens: TokenPair = {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15分钟
  };

  // 标记令牌对象
  experimental_taintObjectReference(
    "Token pair contains sensitive authentication data",
    tokens
  );

  return tokens;
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // 标记解码后的payload
    experimental_taintObjectReference(
      "Decoded token payload contains user data",
      payload
    );

    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
```

**使用示例**:

```typescript
// app/api/auth/refresh/route.ts
import { verifyRefreshToken, generateTokens } from "@/lib/jwt";

export async function POST(request: Request) {
  const { refreshToken } = await request.json();

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return Response.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  // 生成新的令牌对
  const tokens = generateTokens({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  // 只返回新令牌,不返回完整的tokens对象
  return Response.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  });
}
```

## Taint API 对比

### 两种 Taint 方法对比

| 特性            | taintObjectReference | taintUniqueValue | 使用场景           |
| --------------- | -------------------- | ---------------- | ------------------ |
| 标记对象        | ✅                   | ❌               | 用户对象、配置对象 |
| 标记字符串      | ❌                   | ✅               | API 密钥、密码     |
| 标记数组        | ✅                   | ❌               | 用户列表           |
| 嵌套保护        | 自动                 | 需手动           | 复杂对象           |
| 性能影响        | 极小                 | 极小             | 都可用             |
| TypeScript 支持 | ✅                   | ✅               | 都支持             |

### 与其他安全措施对比

| 安全措施  | 作用时机 | 保护范围 | 性能影响 | 适用场景     |
| --------- | -------- | -------- | -------- | ------------ |
| Taint API | 开发时   | 数据流   | 无       | 防止意外泄露 |
| 环境变量  | 运行时   | 配置     | 无       | 存储密钥     |
| HTTPS     | 传输时   | 网络     | 小       | 加密传输     |
| 加密存储  | 存储时   | 数据库   | 中       | 持久化保护   |
| 权限控制  | 访问时   | API      | 小       | 访问控制     |

## 适用场景

### 必须使用 Taint 的场景

| 场景         | 是否使用 taint | 优先级  | 原因                  |
| ------------ | -------------- | ------- | --------------------- |
| 用户密码哈希 | 是             | 🔴 极高 | 高度敏感,绝不能泄露   |
| API 密钥     | 是             | 🔴 极高 | 安全关键,系统访问凭证 |
| 数据库凭证   | 是             | 🔴 极高 | 系统安全,数据访问权限 |
| JWT 密钥     | 是             | 🔴 极高 | 认证基础,不能暴露     |
| 会话令牌     | 是             | 🟠 高   | 用户隐私,会话劫持风险 |
| 支付信息     | 是             | 🟠 高   | 财务安全,法律要求     |
| 个人身份信息 | 是             | 🟠 高   | 隐私保护,合规要求     |
| OAuth 令牌   | 是             | 🟠 高   | 第三方访问权限        |

### 可选使用 Taint 的场景

| 场景          | 是否使用 taint | 优先级 | 说明         |
| ------------- | -------------- | ------ | ------------ |
| 用户邮箱      | 可选           | 🟡 中  | 根据业务需求 |
| 用户手机号    | 可选           | 🟡 中  | 根据隐私政策 |
| 内部 API 端点 | 可选           | 🟡 中  | 防止信息泄露 |
| 调试信息      | 可选           | 🟢 低  | 开发环境使用 |

### 不需要使用 Taint 的场景

| 场景          | 是否使用 taint | 原因              |
| ------------- | -------------- | ----------------- |
| 公开数据      | 否             | 本就公开,无需保护 |
| 静态内容      | 否             | 可以公开访问      |
| 公开 API 响应 | 否             | 设计为公开        |
| 前端配置      | 否             | 需要在客户端使用  |
| 公开用户资料  | 否             | 用户主动公开      |

## 注意事项

### 1. 开发环境警告

```typescript
// taint在开发环境会抛出错误
if (process.env.NODE_ENV === "development") {
  // 会看到警告信息
}
```

### 2. 生产环境行为

```typescript
// 生产环境不会抛出错误，但会记录日志
if (process.env.NODE_ENV === "production") {
  // 静默失败，记录到日志
}
```

### 3. 性能影响

```typescript
// taint API在生产环境几乎无性能影响
// 主要用于开发时发现问题
```

### 4. TypeScript 支持

```typescript
// 使用TypeScript获得更好的类型检查
import type { TaintedData } from "react";
```

### 5. 测试环境

```typescript
// 测试时可能需要禁用taint
if (process.env.NODE_ENV === "test") {
  // 跳过taint检查
}
```

## 常见问题

### 1. taint 不工作？

**问题**：标记后仍然可以传递数据

**解决方案**：

```javascript
// 确保启用了taint配置
module.exports = {
  experimental: {
    taint: true,
  },
};
```

### 2. 如何标记对象？

**问题**：需要标记整个对象

**解决方案**：

```typescript
import { experimental_taintObjectReference } from "react";

experimental_taintObjectReference("message", object);
```

### 3. 如何标记字符串？

**问题**：需要标记字符串值

**解决方案**：

```typescript
import { experimental_taintUniqueValue } from "react";

experimental_taintUniqueValue("message", parent, value);
```

### 4. 如何处理数组？

**问题**：需要标记数组中的项

**解决方案**：

```typescript
array.forEach((item) => {
  experimental_taintObjectReference("message", item);
});
```

### 5. 如何在生产环境使用？

**问题**：生产环境的行为

**解决方案**：

```typescript
// 生产环境会静默失败
// 建议配合日志系统使用
```

### 6. 如何测试 taint？

**问题**：如何验证 taint 工作

**解决方案**：

```typescript
// 在开发环境测试
// 尝试传递被标记的数据到客户端组件
```

### 7. 如何移除 taint？

**问题**：需要取消标记

**解决方案**：

```typescript
// taint是永久的，无法移除
// 需要创建新对象
const safe = { ...tainted };
```

### 8. 如何处理嵌套对象？

**问题**：对象包含嵌套数据

**解决方案**：

```typescript
// 标记父对象会影响所有嵌套数据
experimental_taintObjectReference("message", parent);
```

### 9. 如何与 TypeScript 集成？

**问题**：需要类型支持

**解决方案**：

```typescript
import type { TaintedData } from "react";

function process(data: TaintedData<User>) {
  // TypeScript会检查
}
```

### 10. 如何调试 taint 问题？

**问题**：不确定哪里出错

**解决方案**：

```typescript
// 查看控制台错误信息
// 错误会指出数据流向
```

### 11. 如何处理第三方库？

**问题**：第三方库传递数据

**解决方案**：

```typescript
// 在传递给第三方库前清理数据
const clean = sanitize(tainted);
```

### 12. 如何批量标记？

**问题**：需要标记多个对象

**解决方案**：

```typescript
objects.forEach((obj) => {
  experimental_taintObjectReference("message", obj);
});
```

### 13. 如何处理异步数据？

**问题**：异步获取的数据

**解决方案**：

```typescript
const data = await fetchData();
experimental_taintObjectReference("message", data);
```

### 14. 如何与缓存配合？

**问题**：缓存的数据需要标记

**解决方案**：

```typescript
const cached = await cache.get(key);
if (cached) {
  experimental_taintObjectReference("message", cached);
}
```

### 15. 如何监控 taint 违规?

**问题**: 需要追踪违规情况

**解决方案**:

```typescript
// lib/taint-monitor.ts
import { experimental_taintObjectReference } from "react";

class TaintMonitor {
  private violations: Array<{
    message: string;
    timestamp: Date;
    stack?: string;
  }> = [];

  logViolation(message: string, stack?: string) {
    this.violations.push({
      message,
      timestamp: new Date(),
      stack,
    });

    // 发送到监控系统
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring({ message, stack });
    }
  }

  private async sendToMonitoring(data: any) {
    // 发送到Sentry、DataDog等
    await fetch("/api/monitoring/taint-violation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getViolations() {
    return this.violations;
  }
}

export const taintMonitor = new TaintMonitor();
```

### 16. 如何在 Server Actions 中使用?

**问题**: Server Actions 需要保护敏感数据

**解决方案**:

```typescript
// app/actions/user.ts
"use server";

import { experimental_taintObjectReference } from "react";
import { db } from "@/lib/db";

export async function updateUserPassword(userId: string, newPassword: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { password: true },
  });

  // 标记用户对象
  experimental_taintObjectReference(
    "User object in server action contains password",
    user
  );

  // 更新密码...
  await db.user.update({
    where: { id: userId },
    data: { password: await hashPassword(newPassword) },
  });

  return { success: true };
}
```

### 17. 如何处理文件上传中的敏感信息?

**问题**: 上传的文件可能包含敏感信息

**解决方案**:

```typescript
// app/api/upload/route.ts
import { experimental_taintObjectReference } from "react";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // 读取文件内容
  const content = await file.text();
  const parsed = JSON.parse(content);

  // 如果包含敏感信息,标记整个对象
  if (parsed.credentials || parsed.apiKeys) {
    experimental_taintObjectReference(
      "Uploaded file contains sensitive credentials",
      parsed
    );
  }

  // 处理文件...
  return Response.json({ success: true });
}
```

### 18. 如何与 React Query 配合使用?

**问题**: React Query 缓存可能包含敏感数据

**解决方案**:

```typescript
// lib/queries.ts
import { experimental_taintObjectReference } from "react";
import { useQuery } from "@tanstack/react-query";

export function useUserWithSensitiveData(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();

      // 标记包含敏感数据的用户对象
      experimental_taintObjectReference(
        "User data from API contains sensitive information",
        user
      );

      return user;
    },
    // 不缓存敏感数据
    cacheTime: 0,
    staleTime: 0,
  });
}
```

### 19. 如何在中间件中使用?

**问题**: 中间件处理敏感数据

**解决方案**:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { experimental_taintObjectReference } from "react";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");

  if (token) {
    // 标记令牌
    experimental_taintObjectReference(
      "Auth token from cookie should not be exposed",
      token
    );
  }

  return NextResponse.next();
}
```

### 20. 如何处理 GraphQL 响应?

**问题**: GraphQL 响应可能包含敏感字段

**解决方案**:

```typescript
// lib/graphql.ts
import { experimental_taintObjectReference } from "react";

export async function executeGraphQL(query: string, variables: any) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();

  // 检查并标记敏感字段
  if (data.user?.password || data.user?.apiKey) {
    experimental_taintObjectReference(
      "GraphQL response contains sensitive fields",
      data
    );
  }

  return data;
}
```

### 21. 如何在测试中模拟 taint?

**问题**: 测试环境需要验证 taint 行为

**解决方案**:

```typescript
// __tests__/taint.test.ts
import { experimental_taintObjectReference } from "react";

describe("Taint protection", () => {
  it("should prevent sensitive data from being passed to client", () => {
    const sensitiveData = { password: "secret" };

    experimental_taintObjectReference("Test sensitive data", sensitiveData);

    // 尝试传递到客户端组件应该失败
    expect(() => {
      // 模拟传递到客户端
      JSON.stringify(sensitiveData);
    }).toThrow();
  });
});
```

### 22. 如何与 Prisma 配合使用?

**问题**: Prisma 查询结果需要保护

**解决方案**:

```typescript
// lib/prisma-taint.ts
import { experimental_taintObjectReference } from "react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserWithPassword(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      password: true,
      sessions: true,
    },
  });

  if (user) {
    // 标记包含敏感信息的Prisma结果
    experimental_taintObjectReference(
      "Prisma user object contains password and sessions",
      user
    );
  }

  return user;
}
```

### 23. 如何处理 WebSocket 消息?

**问题**: WebSocket 可能传输敏感数据

**解决方案**:

```typescript
// lib/websocket.ts
import { experimental_taintObjectReference } from "react";

export function handleWebSocketMessage(message: any) {
  const data = JSON.parse(message);

  // 如果消息包含敏感信息
  if (data.type === "auth" || data.type === "credentials") {
    experimental_taintObjectReference(
      "WebSocket message contains sensitive authentication data",
      data
    );
  }

  // 处理消息...
}
```

### 24. 如何与 Redis 缓存配合?

**问题**: Redis 缓存的数据可能敏感

**解决方案**:

```typescript
// lib/redis-taint.ts
import { experimental_taintObjectReference } from "react";
import { redis } from "@/lib/redis";

export async function getCachedSession(sessionId: string) {
  const session = await redis.get(`session:${sessionId}`);

  if (session) {
    const parsed = JSON.parse(session);

    // 标记会话数据
    experimental_taintObjectReference(
      "Cached session data contains sensitive user information",
      parsed
    );

    return parsed;
  }

  return null;
}
```

### 25. 如何创建自动化 taint 工具?

**问题**: 需要自动标记所有敏感数据

**解决方案**:

```typescript
// lib/auto-taint.ts
import { experimental_taintObjectReference } from "react";

const SENSITIVE_KEYS = [
  "password",
  "apiKey",
  "secret",
  "token",
  "credential",
  "privateKey",
];

export function autoTaint(obj: any, path: string = "root"): void {
  if (typeof obj !== "object" || obj === null) return;

  // 检查对象的所有键
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = `${path}.${key}`;

    // 如果键名包含敏感词
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      experimental_taintObjectReference(
        `Auto-tainted: ${currentPath} contains sensitive data`,
        value
      );
    }

    // 递归检查嵌套对象
    if (typeof value === "object" && value !== null) {
      autoTaint(value, currentPath);
    }
  }
}

// 使用示例
const config = {
  database: {
    password: "secret",
    host: "localhost",
  },
  api: {
    apiKey: "key123",
  },
};

autoTaint(config);
```

## 最佳实践

### 1. 分层保护策略

```typescript
// lib/security-layers.ts
import { experimental_taintObjectReference } from "react";

// 第一层:数据获取时标记
export async function fetchUserData(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  experimental_taintObjectReference("Raw user data", user);
  return user;
}

// 第二层:处理时过滤
export function sanitizeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // 不包含password等敏感字段
  };
}

// 第三层:返回前验证
export function validateResponse(data: any) {
  const sensitiveKeys = ["password", "apiKey", "secret"];
  const keys = Object.keys(data);

  for (const key of keys) {
    if (sensitiveKeys.includes(key)) {
      throw new Error(`Response contains sensitive key: ${key}`);
    }
  }

  return data;
}
```

### 2. 统一的 Taint 管理

```typescript
// lib/taint-manager.ts
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";

class TaintManager {
  private taintedObjects = new WeakSet();
  private taintedValues = new Set<string>();

  taintObject(obj: any, message: string) {
    if (this.taintedObjects.has(obj)) return;

    experimental_taintObjectReference(message, obj);
    this.taintedObjects.add(obj);
  }

  taintValue(value: string, message: string) {
    if (this.taintedValues.has(value)) return;

    experimental_taintUniqueValue(message, {}, value);
    this.taintedValues.add(value);
  }

  isTainted(obj: any): boolean {
    return this.taintedObjects.has(obj);
  }
}

export const taintManager = new TaintManager();
```

## 总结

experimental.taint 配置为 Next.js 提供了强大的数据安全保护机制。通过标记敏感数据可以：

### 核心优势

1. **防止泄露**：在开发阶段就能发现敏感数据泄露风险
2. **开发警告**：开发时及时发现问题,避免上线后出现安全事故
3. **类型安全**：完整的 TypeScript 支持,编译时检查
4. **零成本**：生产环境无性能影响,只在开发时生效
5. **易于使用**：简单直观的 API,学习成本低

### 关键要点

**配置层面**:

- 在 next.config.js 中启用 taint 配置
- 配合其他安全选项使用
- 根据环境调整行为

**使用层面**:

- 标记所有敏感数据(密码、API 密钥、令牌等)
- 使用正确的 API(taintObjectReference vs taintUniqueValue)
- 处理嵌套对象和数组
- 实现批量标记机制

**测试层面**:

- 开发环境充分测试
- 验证 taint 行为
- 模拟客户端传递场景

**监控层面**:

- 生产环境监控违规情况
- 集成错误追踪系统
- 记录和分析 taint 日志

**集成层面**:

- 与 TypeScript 集成
- 与 ORM(Prisma 等)配合
- 与状态管理库配合
- 与缓存系统配合

### 注意事项

1. **实验性功能**: taint 是实验性 API,未来可能变化
2. **配合使用**: 不能单独依赖 taint,需配合其他安全措施
3. **性能考虑**: 虽然影响极小,但大量使用仍需注意
4. **测试覆盖**: 确保测试环境能验证 taint 行为
5. **文档记录**: 记录哪些数据被标记及原因

### 安全建议

- 建立敏感数据清单
- 制定 taint 使用规范
- 定期审查 taint 覆盖范围
- 培训团队成员正确使用
- 监控和响应违规情况

记住:taint 是防御性编程的一部分,主要用于开发时发现问题。在生产环境,应该配合其他安全措施使用,如数据验证、权限检查、加密传输、安全存储等,构建多层防御体系。

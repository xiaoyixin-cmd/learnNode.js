**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-19-proxy.ts 架构与实现

## 概述

在 Next.js 16 中,proxy.ts 是一个用于实现 API 代理的架构模式。通过代理模式,我们可以将客户端请求转发到外部 API,同时隐藏 API 密钥、处理 CORS 问题、实现请求转换等功能。本文将详细介绍如何在 Next.js 16 中设计和实现一个完整的代理架构。

### 核心特性

- **请求转发**: 将请求转发到外部 API
- **密钥隐藏**: 在服务端处理 API 密钥
- **CORS 处理**: 解决跨域问题
- **请求转换**: 修改请求参数和响应数据
- **缓存控制**: 实现响应缓存
- **错误处理**: 统一的错误处理机制
- **限流保护**: 防止 API 滥用
- **日志记录**: 记录请求日志

### 代理模式的优势

| 优势   | 说明              | 重要性 |
| ------ | ----------------- | ------ |
| 安全性 | 隐藏 API 密钥     | 高     |
| CORS   | 解决跨域问题      | 高     |
| 缓存   | 减少外部 API 调用 | 中     |
| 转换   | 统一数据格式      | 中     |
| 监控   | 记录和分析请求    | 中     |

### 架构图

```
┌─────────────┐
│   客户端    │
└──────┬──────┘
       │ HTTP请求
       ▼
┌─────────────┐
│  Next.js    │
│  Proxy API  │
│  - 验证     │
│  - 转换     │
│  - 缓存     │
└──────┬──────┘
       │ 转发请求
       ▼
┌─────────────┐
│  外部API    │
└─────────────┘
```

---

## 1. 基础代理实现

### 1.1 简单代理

```ts
// app/api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

### 1.2 带认证的代理

```ts
// app/api/proxy/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }

  const apiKey = process.env.EXTERNAL_API_KEY;
  const apiUrl = `https://api.example.com/${endpoint}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

### 1.3 POST 请求代理

```ts
// app/api/proxy/post/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const apiKey = process.env.EXTERNAL_API_KEY;

  try {
    const response = await fetch("https://api.example.com/data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

---

## 2. 高级代理架构

### 2.1 代理配置类

```ts
// lib/proxy/config.ts
export interface ProxyConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export const proxyConfigs: Record<string, ProxyConfig> = {
  github: {
    baseUrl: "https://api.github.com",
    apiKey: process.env.GITHUB_TOKEN,
    timeout: 5000,
    retries: 3,
    cache: true,
    cacheTTL: 300,
  },
  weather: {
    baseUrl: "https://api.openweathermap.org/data/2.5",
    apiKey: process.env.WEATHER_API_KEY,
    timeout: 3000,
    cache: true,
    cacheTTL: 600,
  },
};
```

### 2.2 代理客户端类

```ts
// lib/proxy/client.ts
import { ProxyConfig } from "./config";

export class ProxyClient {
  private config: ProxyConfig;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor(config: ProxyConfig) {
    this.config = config;
    this.cache = new Map();
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // 检查缓存
    if (this.config.cache) {
      const cached = this.cache.get(cacheKey);
      if (
        cached &&
        Date.now() - cached.timestamp < (this.config.cacheTTL || 0) * 1000
      ) {
        return cached.data;
      }
    }

    // 设置请求头
    const headers = new Headers(options.headers);
    if (this.config.apiKey) {
      headers.set("Authorization", `Bearer ${this.config.apiKey}`);
    }
    headers.set("Content-Type", "application/json");

    // 发送请求
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeout || 5000
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 缓存响应
      if (this.config.cache) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }

  clearCache() {
    this.cache.clear();
  }
}
```

### 2.3 代理工厂

```ts
// lib/proxy/factory.ts
import { ProxyClient } from "./client";
import { proxyConfigs } from "./config";

export class ProxyFactory {
  private static clients: Map<string, ProxyClient> = new Map();

  static getClient(name: string): ProxyClient {
    if (!this.clients.has(name)) {
      const config = proxyConfigs[name];
      if (!config) {
        throw new Error(`Proxy config not found: ${name}`);
      }
      this.clients.set(name, new ProxyClient(config));
    }
    return this.clients.get(name)!;
  }

  static clearCache(name?: string) {
    if (name) {
      this.clients.get(name)?.clearCache();
    } else {
      this.clients.forEach((client) => client.clearCache());
    }
  }
}
```

---

## 3. 请求转换

### 3.1 请求拦截器

```ts
// lib/proxy/interceptors.ts
export interface RequestInterceptor {
  (url: string, options: RequestInit): Promise<{
    url: string;
    options: RequestInit;
  }>;
}

export interface ResponseInterceptor {
  (response: Response): Promise<Response>;
}

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async processRequest(url: string, options: RequestInit) {
    let processedUrl = url;
    let processedOptions = options;

    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(processedUrl, processedOptions);
      processedUrl = result.url;
      processedOptions = result.options;
    }

    return { url: processedUrl, options: processedOptions };
  }

  async processResponse(response: Response) {
    let processedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }
}
```

### 3.2 常用拦截器

```ts
// lib/proxy/common-interceptors.ts
import { RequestInterceptor, ResponseInterceptor } from "./interceptors";

// 添加时间戳
export const timestampInterceptor: RequestInterceptor = async (
  url,
  options
) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("_t", Date.now().toString());
  return { url: urlObj.toString(), options };
};

// 添加用户代理
export const userAgentInterceptor: RequestInterceptor = async (
  url,
  options
) => {
  const headers = new Headers(options.headers);
  headers.set("User-Agent", "Next.js Proxy/1.0");
  return { url, options: { ...options, headers } };
};

// 日志拦截器
export const loggingInterceptor: RequestInterceptor = async (url, options) => {
  console.log(`[Proxy] ${options.method || "GET"} ${url}`);
  return { url, options };
};

// 错误处理拦截器
export const errorHandlingInterceptor: ResponseInterceptor = async (
  response
) => {
  if (!response.ok) {
    const error = await response.text();
    console.error(`[Proxy Error] ${response.status}: ${error}`);
  }
  return response;
};
```

---

## 4. 缓存策略

### 4.1 内存缓存

```ts
// lib/proxy/cache/memory-cache.ts
export class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.cache = new Map();
  }

  set(key: string, data: any, ttl: number = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
```

### 4.2 Redis 缓存

```ts
// lib/proxy/cache/redis-cache.ts
import { Redis } from "ioredis";

export class RedisCache {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url);
  }

  async set(key: string, data: any, ttl: number = 300) {
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async get(key: string): Promise<any | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async delete(key: string) {
    await this.client.del(key);
  }

  async clear() {
    await this.client.flushdb();
  }

  async disconnect() {
    await this.client.quit();
  }
}
```

### 4.3 缓存管理器

```ts
// lib/proxy/cache/cache-manager.ts
export interface CacheAdapter {
  set(key: string, data: any, ttl?: number): Promise<void> | void;
  get(key: string): Promise<any | null> | any | null;
  has(key: string): Promise<boolean> | boolean;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

export class CacheManager {
  private adapter: CacheAdapter;

  constructor(adapter: CacheAdapter) {
    this.adapter = adapter;
  }

  async set(key: string, data: any, ttl?: number) {
    await this.adapter.set(key, data, ttl);
  }

  async get(key: string) {
    return await this.adapter.get(key);
  }

  async has(key: string) {
    return await this.adapter.has(key);
  }

  async delete(key: string) {
    await this.adapter.delete(key);
  }

  async clear() {
    await this.adapter.clear();
  }

  async getOrSet(key: string, factory: () => Promise<any>, ttl?: number) {
    const cached = await this.get(key);

    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    await this.set(key, data, ttl);

    return data;
  }
}
```

---

## 5. 错误处理

### 5.1 自定义错误类

```ts
// lib/proxy/errors.ts
export class ProxyError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public originalError?: Error
  ) {
    super(message);
    this.name = "ProxyError";
  }
}

export class TimeoutError extends ProxyError {
  constructor(message: string = "Request timeout") {
    super(message, 408);
    this.name = "TimeoutError";
  }
}

export class NetworkError extends ProxyError {
  constructor(message: string = "Network error") {
    super(message, 503);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends ProxyError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends ProxyError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}
```

### 5.2 错误处理器

```ts
// lib/proxy/error-handler.ts
import { ProxyError } from "./errors";
import { NextResponse } from "next/server";

export function handleProxyError(error: unknown): NextResponse {
  if (error instanceof ProxyError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.name,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: "An unknown error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}
```

---

## 6. 限流保护

### 6.1 简单限流

```ts
// lib/proxy/rate-limiter.ts
export class RateLimiter {
  private requests: Map<string, number[]>;
  private limit: number;
  private window: number;

  constructor(limit: number = 100, window: number = 60000) {
    this.requests = new Map();
    this.limit = limit;
    this.window = window;
  }

  check(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // 清理过期的时间戳
    const validTimestamps = timestamps.filter((t) => now - t < this.window);

    if (validTimestamps.length >= this.limit) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return true;
  }

  reset(key: string) {
    this.requests.delete(key);
  }

  clear() {
    this.requests.clear();
  }
}
```

### 6.2 令牌桶算法

```ts
// lib/proxy/token-bucket.ts
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRate: number;

  constructor(capacity: number = 100, refillRate: number = 10) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / 1000) * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  getTokens(): number {
    this.refill();
    return this.tokens;
  }
}
```

---

## 7. 实战案例

### 7.1 GitHub API 代理

```ts
// app/api/proxy/github/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProxyFactory } from "@/lib/proxy/factory";
import { handleProxyError } from "@/lib/proxy/error-handler";

export async function GET(request: NextRequest) {
  try {
    const endpoint = request.nextUrl.searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    const client = ProxyFactory.getClient("github");
    const data = await client.get(endpoint);

    return NextResponse.json(data);
  } catch (error) {
    return handleProxyError(error);
  }
}
```

### 7.2 天气 API 代理

```ts
// app/api/proxy/weather/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProxyFactory } from "@/lib/proxy/factory";
import { handleProxyError } from "@/lib/proxy/error-handler";

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city");

    if (!city) {
      return NextResponse.json({ error: "City required" }, { status: 400 });
    }

    const client = ProxyFactory.getClient("weather");
    const data = await client.get(`/weather?q=${city}`);

    return NextResponse.json(data);
  } catch (error) {
    return handleProxyError(error);
  }
}
```

### 7.3 图片代理

```ts
// app/api/proxy/image/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

### 7.4 带限流的代理

```ts
// app/api/proxy/limited/route.ts
import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "@/lib/proxy/rate-limiter";

const limiter = new RateLimiter(10, 60000); // 10请求/分钟

export async function GET(request: NextRequest) {
  const ip = request.ip || "unknown";

  if (!limiter.check(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

### 7.5 带缓存的代理

```ts
// app/api/proxy/cached/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CacheManager } from "@/lib/proxy/cache/cache-manager";
import { MemoryCache } from "@/lib/proxy/cache/memory-cache";

const cache = new CacheManager(new MemoryCache());

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const data = await cache.getOrSet(
      url,
      async () => {
        const response = await fetch(url);
        return await response.json();
      },
      300 // 5分钟缓存
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

---

## 8. 适用场景

### 8.1 API 密钥隐藏

**需求**: 调用第三方 API 但不想暴露 API 密钥

**特点**:

- 密钥存储在服务端
- 客户端无法访问密钥
- 提高安全性

### 8.2 CORS 问题解决

**需求**: 解决跨域访问问题

**特点**:

- 服务端转发请求
- 避免浏览器 CORS 限制
- 统一处理响应头

### 8.3 请求聚合

**需求**: 将多个 API 请求聚合为一个

**特点**:

- 减少客户端请求数
- 提高性能
- 简化客户端逻辑

### 8.4 数据转换

**需求**: 转换外部 API 的数据格式

**特点**:

- 统一数据格式
- 简化客户端处理
- 隐藏实现细节

### 8.5 缓存优化

**需求**: 缓存外部 API 响应

**特点**:

- 减少外部 API 调用
- 提高响应速度
- 降低成本

---

## 9. 注意事项

### 9.1 安全性

```ts
// ✗ 错误:暴露API密钥
export async function GET(request: NextRequest) {
  const apiKey = request.nextUrl.searchParams.get("apiKey"); // 危险!
  // ...
}

// ✓ 正确:使用环境变量
export async function GET(request: NextRequest) {
  const apiKey = process.env.API_KEY;
  // ...
}
```

### 9.2 错误处理

```ts
// ✗ 错误:暴露内部错误
export async function GET() {
  try {
    // ...
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 }); // 暴露错误详情
  }
}

// ✓ 正确:返回通用错误
export async function GET() {
  try {
    // ...
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
```

### 9.3 超时设置

```ts
// ✓ 正确:设置超时
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  // ...
} catch (error) {
  clearTimeout(timeout);
  // ...
}
```

### 9.4 缓存策略

```ts
// ✓ 正确:合理的缓存时间
const cache = new CacheManager(new MemoryCache());

// 静态数据:长时间缓存
await cache.set("static-data", data, 3600);

// 动态数据:短时间缓存
await cache.set("dynamic-data", data, 60);
```

### 9.5 限流保护

```ts
// ✓ 正确:实现限流
const limiter = new RateLimiter(100, 60000); // 100请求/分钟

export async function GET(request: NextRequest) {
  const ip = request.ip || "unknown";

  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // ...
}
```

---

## 10. 常见问题

### 10.1 如何隐藏 API 密钥?

**问题**: 需要调用第三方 API 但不想暴露密钥。

**解决方案**:

```ts
// .env.local
EXTERNAL_API_KEY = your - secret - key;

// app/api/proxy/route.ts
export async function GET() {
  const apiKey = process.env.EXTERNAL_API_KEY;
  const response = await fetch("https://api.example.com/data", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return NextResponse.json(await response.json());
}
```

### 10.2 如何处理 CORS 问题?

**问题**: 浏览器阻止跨域请求。

**解决方案**:

```ts
// 通过服务端代理
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const response = await fetch(url!);
  const data = await response.json();

  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
```

### 10.3 如何实现请求缓存?

**问题**: 减少对外部 API 的调用次数。

**解决方案**:

```ts
const cache = new Map();

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")!;

  if (cache.has(url)) {
    return NextResponse.json(cache.get(url));
  }

  const response = await fetch(url);
  const data = await response.json();

  cache.set(url, data);

  return NextResponse.json(data);
}
```

### 10.4 如何实现请求限流?

**问题**: 防止 API 被滥用。

**解决方案**:

```ts
const limiter = new RateLimiter(10, 60000);

export async function GET(request: NextRequest) {
  const ip = request.ip || "unknown";

  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 处理请求
}
```

### 10.5 如何处理超时?

**问题**: 外部 API 响应慢导致超时。

**解决方案**:

```ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  return NextResponse.json(await response.json());
} catch (error) {
  clearTimeout(timeout);
  if (error.name === "AbortError") {
    return NextResponse.json({ error: "Timeout" }, { status: 408 });
  }
  throw error;
}
```

### 10.6 如何转换响应数据?

**问题**: 外部 API 返回的数据格式不符合需求。

**解决方案**:

```ts
export async function GET() {
  const response = await fetch("https://api.example.com/data");
  const data = await response.json();

  // 转换数据格式
  const transformed = {
    id: data.userId,
    name: data.userName,
    email: data.userEmail,
  };

  return NextResponse.json(transformed);
}
```

### 10.7 如何处理认证?

**问题**: 外部 API 需要认证。

**解决方案**:

```ts
export async function GET() {
  const token = process.env.API_TOKEN;

  const response = await fetch("https://api.example.com/data", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return NextResponse.json(await response.json());
}
```

### 10.8 如何实现重试机制?

**问题**: 请求失败时自动重试。

**解决方案**:

```ts
async function fetchWithRetry(url: string, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}
```

### 10.9 如何记录日志?

**问题**: 需要记录代理请求的日志。

**解决方案**:

```ts
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")!;
  const startTime = Date.now();

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log({
      url,
      status: response.status,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error({ url, error, duration: Date.now() - startTime });
    throw error;
  }
}
```

### 10.10 如何实现请求聚合?

**问题**: 将多个 API 请求聚合为一个。

**解决方案**:

```ts
export async function GET() {
  const [users, posts, comments] = await Promise.all([
    fetch("https://api.example.com/users").then((r) => r.json()),
    fetch("https://api.example.com/posts").then((r) => r.json()),
    fetch("https://api.example.com/comments").then((r) => r.json()),
  ]);

  return NextResponse.json({ users, posts, comments });
}
```

---

## 11. 总结

### 11.1 核心要点

1. **架构设计**: 使用配置类、客户端类、工厂模式构建代理架构
2. **请求转换**: 使用拦截器模式处理请求和响应
3. **缓存策略**: 实现内存缓存和 Redis 缓存
4. **错误处理**: 自定义错误类和统一错误处理
5. **限流保护**: 实现简单限流和令牌桶算法
6. **安全性**: 隐藏 API 密钥,防止信息泄露
7. **性能优化**: 缓存、超时、重试机制
8. **日志记录**: 记录请求日志便于调试

### 11.2 最佳实践

| 实践     | 说明                 | 优先级 |
| -------- | -------------------- | ------ |
| 环境变量 | 使用环境变量存储密钥 | 高     |
| 错误处理 | 不暴露内部错误详情   | 高     |
| 超时设置 | 设置合理的超时时间   | 高     |
| 限流保护 | 防止 API 被滥用      | 中     |
| 缓存策略 | 合理使用缓存         | 中     |
| 日志记录 | 记录关键信息         | 中     |
| 重试机制 | 处理临时性失败       | 低     |

### 11.3 架构对比

| 架构       | 优点       | 缺点     | 适用场景    |
| ---------- | ---------- | -------- | ----------- |
| 简单代理   | 实现简单   | 功能有限 | 小型项目    |
| 类架构     | 可复用性强 | 复杂度高 | 中大型项目  |
| 工厂模式   | 统一管理   | 需要配置 | 多 API 代理 |
| 拦截器模式 | 灵活扩展   | 学习成本 | 复杂需求    |

### 11.4 性能对比

| 策略       | 响应时间 | 成本 | 复杂度 |
| ---------- | -------- | ---- | ------ |
| 无缓存     | 慢       | 高   | 低     |
| 内存缓存   | 快       | 低   | 中     |
| Redis 缓存 | 快       | 中   | 高     |
| CDN 缓存   | 最快     | 高   | 高     |

### 11.5 下一步

学习完 proxy.ts 架构后,建议继续学习:

1. **请求拦截**: 深入学习请求拦截与修改
2. **响应处理**: 学习响应处理与修改
3. **身份验证**: 实现身份验证与授权
4. **限流防护**: 学习请求限流与防护
5. **边缘函数**: 学习 Edge Functions

proxy.ts 架构是 Next.js 16 中实现 API 代理的核心模式。通过合理的架构设计,你可以构建安全、高效、可维护的代理服务。

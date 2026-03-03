**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# logging 配置详解

## 概述

logging 是 Next.js 16 中新增的配置选项，用于控制应用的日志输出行为。通过合理配置日志系统，可以更好地监控应用运行状态、调试问题和分析性能。

### logging 配置的作用

1. **日志级别控制**：控制输出的日志详细程度
2. **请求日志**：记录 HTTP 请求信息
3. **性能监控**：记录页面渲染时间
4. **错误追踪**：捕获和记录错误信息
5. **自定义输出**：配置日志输出格式和目标

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

### 配置选项详解

| 选项                   | 类型    | 说明              | 默认值 |
| ---------------------- | ------- | ----------------- | ------ |
| `fetches.fullUrl`      | boolean | 是否显示完整 URL  | false  |
| `fetches.hmrRefreshes` | boolean | 是否记录 HMR 刷新 | false  |
| `level`                | string  | 日志级别          | 'info' |

### 启用完整 URL 日志

```javascript
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

**效果**：

```bash
# 开发环境输出
GET /api/users 200 in 45ms
Full URL: http://localhost:3000/api/users?page=1&limit=10
```

### 启用 HMR 刷新日志

```javascript
// next.config.js
module.exports = {
  logging: {
    fetches: {
      hmrRefreshes: true,
    },
  },
};
```

### 日志级别配置

```javascript
// next.config.js
module.exports = {
  logging: {
    level: "verbose", // 'silent' | 'error' | 'warn' | 'info' | 'verbose'
  },
};
```

## 高级配置

### 自定义日志处理器

```javascript
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap("CustomLogger", (stats) => {
            console.log("Build completed:", new Date().toISOString());
          });
        },
      });
    }
    return config;
  },
};
```

### 结构化日志

```typescript
// lib/logger.ts
interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  context?: Record<string, any>;
}

export class Logger {
  private log(entry: LogEntry) {
    console.log(JSON.stringify(entry));
  }

  info(message: string, context?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      context,
    });
  }

  warn(message: string, context?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      context,
    });
  }

  error(message: string, context?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      context,
    });
  }
}

export const logger = new Logger();
```

### 请求日志中间件

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;
  console.log(
    `${request.method} ${request.url} ${response.status} ${duration}ms`
  );

  return response;
}
```

### 性能日志

```typescript
// lib/performance-logger.ts
export function logPerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
}

// 使用
logPerformance("Data fetch", () => {
  // 执行操作
});
```

### 错误日志

```typescript
// lib/error-logger.ts
export function logError(error: Error, context?: Record<string, any>) {
  console.error({
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  });
}
```

### 日志文件输出

```typescript
// lib/file-logger.ts
import fs from "fs";
import path from "path";

export class FileLogger {
  private logDir: string;

  constructor(logDir: string = "logs") {
    this.logDir = logDir;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message: string, level: string = "info") {
    const timestamp = new Date().toISOString();
    const logFile = path.join(this.logDir, `${level}.log`);
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;

    fs.appendFileSync(logFile, logEntry);
  }

  info(message: string) {
    this.log(message, "info");
  }

  error(message: string) {
    this.log(message, "error");
  }

  warn(message: string) {
    this.log(message, "warn");
  }
}

export const fileLogger = new FileLogger();
```

### 日志轮转

```typescript
// lib/rotating-logger.ts
import fs from "fs";
import path from "path";

export class RotatingLogger {
  private logDir: string;
  private maxSize: number;
  private maxFiles: number;

  constructor(
    logDir: string = "logs",
    maxSize: number = 10 * 1024 * 1024,
    maxFiles: number = 5
  ) {
    this.logDir = logDir;
    this.maxSize = maxSize;
    this.maxFiles = maxFiles;

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message: string, level: string = "info") {
    const logFile = path.join(this.logDir, `${level}.log`);

    // 检查文件大小
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > this.maxSize) {
        this.rotate(logFile);
      }
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
  }

  private rotate(logFile: string) {
    // 删除最旧的日志
    const oldestLog = `${logFile}.${this.maxFiles}`;
    if (fs.existsSync(oldestLog)) {
      fs.unlinkSync(oldestLog);
    }

    // 重命名现有日志
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldLog = `${logFile}.${i}`;
      const newLog = `${logFile}.${i + 1}`;
      if (fs.existsSync(oldLog)) {
        fs.renameSync(oldLog, newLog);
      }
    }

    // 重命名当前日志
    fs.renameSync(logFile, `${logFile}.1`);
  }
}
```

### 远程日志服务

```typescript
// lib/remote-logger.ts
export class RemoteLogger {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async log(message: string, level: string, context?: Record<string, any>) {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          message,
          context,
        }),
      });
    } catch (error) {
      console.error("Failed to send log to remote service:", error);
    }
  }

  info(message: string, context?: Record<string, any>) {
    return this.log(message, "info", context);
  }

  error(message: string, context?: Record<string, any>) {
    return this.log(message, "error", context);
  }

  warn(message: string, context?: Record<string, any>) {
    return this.log(message, "warn", context);
  }
}
```

## 实战案例

### 案例 1：API 请求日志

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    logger.info("Fetching users", {
      url: request.url,
      method: request.method,
    });

    const users = await fetchUsers();

    const duration = Date.now() - start;
    logger.info("Users fetched successfully", {
      count: users.length,
      duration,
    });

    return NextResponse.json(users);
  } catch (error) {
    const duration = Date.now() - start;
    logger.error("Failed to fetch users", {
      error: error.message,
      duration,
    });

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
```

### 案例 2：页面性能监控

```tsx
// app/page.tsx
"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function Page() {
  useEffect(() => {
    // 记录页面加载时间
    if (typeof window !== "undefined") {
      const perfData = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      logger.info("Page loaded", {
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded:
          perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime,
      });
    }
  }, []);

  return <div>Content</div>;
}
```

### 案例 3：错误边界日志

```tsx
// components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error("React error boundary caught error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### 案例 4：数据库查询日志

```typescript
// lib/db-logger.ts
import { logger } from "./logger";

export function logQuery(query: string, params: any[], duration: number) {
  logger.info("Database query executed", {
    query,
    params,
    duration,
  });
}

// 使用
export async function getUser(id: string) {
  const start = Date.now();
  const query = "SELECT * FROM users WHERE id = $1";

  try {
    const result = await db.query(query, [id]);
    const duration = Date.now() - start;

    logQuery(query, [id], duration);

    return result.rows[0];
  } catch (error) {
    logger.error("Database query failed", {
      query,
      params: [id],
      error: error.message,
    });
    throw error;
  }
}
```

## 适用场景

| 场景     | 配置建议               | 原因       |
| -------- | ---------------------- | ---------- |
| 开发环境 | verbose 级别，完整 URL | 便于调试   |
| 生产环境 | info 级别，结构化日志  | 性能和安全 |
| 性能分析 | 启用性能日志           | 监控性能   |
| 错误追踪 | 启用错误日志           | 问题排查   |
| API 监控 | 启用请求日志           | 监控 API   |
| 审计日志 | 文件日志+远程日志      | 合规要求   |

## 注意事项

### 1. 日志级别选择

```javascript
// 开发环境使用verbose
// 生产环境使用info或warn
module.exports = {
  logging: {
    level: process.env.NODE_ENV === "production" ? "info" : "verbose",
  },
};
```

### 2. 敏感信息保护

```typescript
// 过滤敏感信息
function sanitizeLog(data: any) {
  const sensitive = ["password", "token", "apiKey", "secret"];
  const sanitized = { ...data };

  sensitive.forEach((key) => {
    if (sanitized[key]) {
      sanitized[key] = "***";
    }
  });

  return sanitized;
}

logger.info("User login", sanitizeLog(userData));
```

### 3. 性能影响

```typescript
// 避免在循环中记录日志
// 不好的做法
items.forEach((item) => {
  logger.info("Processing item", { item });
});

// 好的做法
logger.info("Processing items", { count: items.length });
```

### 4. 日志存储

```typescript
// 定期清理旧日志
import fs from "fs";
import path from "path";

function cleanOldLogs(logDir: string, daysToKeep: number = 7) {
  const files = fs.readdirSync(logDir);
  const now = Date.now();
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(logDir, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
    }
  });
}
```

### 5. 结构化日志格式

```typescript
// 使用一致的日志格式
interface LogFormat {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
  traceId?: string;
}

function formatLog(log: LogFormat): string {
  return JSON.stringify(log);
}
```

## 常见问题

### 1. 日志不显示？

**问题**：配置后日志未输出

**解决方案**：

```javascript
// 检查日志级别
module.exports = {
  logging: {
    level: "verbose",
  },
};
```

### 2. 日志过多？

**问题**：日志输出过多影响性能

**解决方案**：

```javascript
// 降低日志级别
module.exports = {
  logging: {
    level: "warn",
  },
};
```

### 3. 如何记录请求 ID？

**问题**：需要追踪请求链路

**解决方案**：

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
  const requestId = uuidv4();
  const response = NextResponse.next();

  response.headers.set("X-Request-ID", requestId);

  console.log({
    requestId,
    method: request.method,
    url: request.url,
  });

  return response;
}
```

### 4. 如何集成 Sentry？

**问题**：需要错误监控

**解决方案**：

```typescript
// lib/sentry-logger.ts
import * as Sentry from "@sentry/nextjs";

export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}
```

### 5. 如何实现日志采样？

**问题**：生产环境日志太多

**解决方案**：

```typescript
// lib/sampled-logger.ts
export class SampledLogger {
  private sampleRate: number;

  constructor(sampleRate: number = 0.1) {
    this.sampleRate = sampleRate;
  }

  log(message: string, level: string = "info") {
    if (Math.random() < this.sampleRate) {
      console.log(`[${level}] ${message}`);
    }
  }
}
```

### 6. 如何记录慢查询？

**问题**：需要监控慢查询

**解决方案**：

```typescript
// lib/slow-query-logger.ts
export function logSlowQuery(
  query: string,
  duration: number,
  threshold: number = 1000
) {
  if (duration > threshold) {
    logger.warn("Slow query detected", {
      query,
      duration,
      threshold,
    });
  }
}
```

### 7. 如何实现日志聚合？

**问题**：多个服务的日志需要聚合

**解决方案**：

```typescript
// lib/aggregated-logger.ts
export class AggregatedLogger {
  private buffer: any[] = [];
  private flushInterval: number = 5000;

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  log(message: string, level: string, context?: Record<string, any>) {
    this.buffer.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    });
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await fetch("/api/logs", {
        method: "POST",
        body: JSON.stringify(logs),
      });
    } catch (error) {
      console.error("Failed to flush logs:", error);
    }
  }
}
```

### 8. 如何记录用户操作？

**问题**：需要审计用户操作

**解决方案**：

```typescript
// lib/audit-logger.ts
export function logUserAction(
  userId: string,
  action: string,
  details?: Record<string, any>
) {
  logger.info("User action", {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
}
```

### 9. 如何实现日志搜索？

**问题**：需要搜索历史日志

**解决方案**：

```typescript
// lib/log-search.ts
import fs from "fs";
import readline from "readline";

export async function searchLogs(
  logFile: string,
  keyword: string
): Promise<string[]> {
  const results: string[] = [];
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.includes(keyword)) {
      results.push(line);
    }
  }

  return results;
}
```

### 10. 如何实现日志告警？

**问题**：错误日志需要告警

**解决方案**：

```typescript
// lib/alert-logger.ts
export class AlertLogger {
  private alertThreshold: number = 10;
  private errorCount: number = 0;
  private resetInterval: number = 60000;

  constructor() {
    setInterval(() => {
      this.errorCount = 0;
    }, this.resetInterval);
  }

  error(message: string, context?: Record<string, any>) {
    logger.error(message, context);

    this.errorCount++;

    if (this.errorCount >= this.alertThreshold) {
      this.sendAlert(`Error threshold reached: ${this.errorCount} errors`);
    }
  }

  private async sendAlert(message: string) {
    // 发送告警通知
    await fetch("/api/alerts", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}
```

### 11. 如何记录 API 响应时间？

**问题**：需要监控 API 性能

**解决方案**：

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  response.headers.set("X-Response-Time", `${Date.now() - start}ms`);

  return response;
}
```

### 12. 如何实现日志压缩？

**问题**：日志文件太大

**解决方案**：

```typescript
// lib/compressed-logger.ts
import zlib from "zlib";
import fs from "fs";

export function compressLog(logFile: string) {
  const gzip = zlib.createGzip();
  const source = fs.createReadStream(logFile);
  const destination = fs.createWriteStream(`${logFile}.gz`);

  source.pipe(gzip).pipe(destination);
}
```

### 13. 如何记录环境信息？

**问题**：需要记录运行环境

**解决方案**：

```typescript
// lib/env-logger.ts
export function logEnvironment() {
  logger.info("Environment info", {
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV,
    memory: process.memoryUsage(),
  });
}
```

### 14. 如何实现日志分级存储？

**问题**：不同级别日志需要分开存储

**解决方案**：

```typescript
// lib/tiered-logger.ts
export class TieredLogger {
  log(message: string, level: string) {
    const logFile = `logs/${level}.log`;
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;

    fs.appendFileSync(logFile, logEntry);
  }
}
```

### 15. 如何实现日志可视化？

**问题**：需要可视化日志数据

**解决方案**：

```typescript
// app/api/logs/stats/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const stats = {
    total: 1000,
    byLevel: {
      info: 800,
      warn: 150,
      error: 50,
    },
    byHour: [
      /* 24小时数据 */
    ],
  };

  return NextResponse.json(stats);
}
```

## 总结

logging 配置是监控和调试 Next.js 应用的重要工具。合理配置可以：

1. **问题排查**：快速定位和解决问题
2. **性能监控**：监控应用性能指标
3. **安全审计**：记录用户操作和系统事件
4. **数据分析**：分析用户行为和系统状态
5. **告警通知**：及时发现和响应异常

关键要点：

- 根据环境选择合适的日志级别
- 保护敏感信息不被记录
- 使用结构化日志格式
- 实现日志轮转和清理
- 集成远程日志服务
- 监控日志性能影响
- 实现日志采样和聚合
- 配置日志告警机制

记住：日志是应用的眼睛，但过多的日志会影响性能。需要在详细程度和性能之间找到平衡点，根据实际需求选择合适的日志策略。

```

```

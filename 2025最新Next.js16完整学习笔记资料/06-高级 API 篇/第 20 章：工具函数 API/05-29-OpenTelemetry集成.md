**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-29-OpenTelemetry 集成

## 概述

OpenTelemetry 是一个开源的可观测性框架,用于生成、收集和导出遥测数据(traces、metrics、logs)。Next.js 16 内置了对 OpenTelemetry 的支持,让你可以轻松监控应用的性能、追踪请求链路、收集指标数据。通过 OpenTelemetry,你可以深入了解应用的运行状况,快速定位性能瓶颈和错误。

### 核心概念

- **Traces**: 请求的完整生命周期追踪
- **Spans**: Trace 中的单个操作单元
- **Metrics**: 应用的性能指标
- **Logs**: 应用的日志记录
- **Context Propagation**: 跨服务传递追踪上下文

### 支持的导出器

| 导出器     | 用途       | 适用场景   |
| ---------- | ---------- | ---------- |
| Jaeger     | 分布式追踪 | 微服务架构 |
| Zipkin     | 分布式追踪 | 性能分析   |
| Prometheus | 指标收集   | 监控告警   |
| OTLP       | 通用协议   | 多种后端   |
| Console    | 控制台输出 | 开发调试   |

---

## 1. 基础配置

### 1.1 安装依赖

```bash
npm install @vercel/otel @opentelemetry/sdk-node
```

### 1.2 配置文件

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}
```

```ts
// instrumentation.node.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "next-app",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
});

sdk.start();
```

### 1.3 启用配置

```js
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
};
```

---

## 2. 基础用法

### 2.1 自动追踪

Next.js 自动追踪以下操作:

```tsx
// app/page.tsx
export default async function Page() {
  // 自动追踪fetch请求
  const data = await fetch("https://api.example.com/data");

  // 自动追踪数据库查询
  const users = await db.user.findMany();

  return <div>{/* ... */}</div>;
}
```

### 2.2 手动追踪

```tsx
// app/api/route.ts
import { trace } from "@opentelemetry/api";

export async function GET() {
  const tracer = trace.getTracer("my-app");

  return tracer.startActiveSpan("process-data", async (span) => {
    try {
      const data = await processData();

      span.setAttribute("data.count", data.length);
      span.setStatus({ code: 0 });

      return Response.json(data);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function processData() {
  return [{ id: 1 }, { id: 2 }];
}
```

### 2.3 添加属性

```tsx
import { trace } from "@opentelemetry/api";

export async function GET(request: Request) {
  const span = trace.getActiveSpan();

  if (span) {
    span.setAttribute("http.method", request.method);
    span.setAttribute("http.url", request.url);
    span.setAttribute("user.id", "123");
  }

  return Response.json({ message: "Hello" });
}
```

---

## 3. 高级配置

### 3.1 Jaeger 导出器

```ts
// instrumentation.node.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "next-app",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  }),
  traceExporter: new JaegerExporter({
    endpoint: "http://localhost:14268/api/traces",
  }),
});

sdk.start();
```

### 3.2 多导出器

```ts
// instrumentation.node.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

const sdk = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: "http://localhost:4318/v1/traces",
    })
  ),
});

// 添加控制台导出器(开发环境)
if (process.env.NODE_ENV === "development") {
  sdk.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
}

sdk.start();
```

### 3.3 采样配置

```ts
// instrumentation.node.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";

const sdk = new NodeSDK({
  sampler: new TraceIdRatioBasedSampler(0.1), // 采样10%
});

sdk.start();
```

---

## 4. 实战案例

### 4.1 数据库查询追踪

```tsx
// lib/db.ts
import { trace } from "@opentelemetry/api";

export async function queryUsers() {
  const tracer = trace.getTracer("database");

  return tracer.startActiveSpan("db.query.users", async (span) => {
    try {
      span.setAttribute("db.system", "postgresql");
      span.setAttribute("db.operation", "SELECT");
      span.setAttribute("db.table", "users");

      const users = await db.user.findMany();

      span.setAttribute("db.rows_returned", users.length);
      span.setStatus({ code: 0 });

      return users;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2 });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 4.2 外部 API 调用追踪

```tsx
// lib/api.ts
import { trace, context } from "@opentelemetry/api";

export async function fetchExternalData(url: string) {
  const tracer = trace.getTracer("http-client");

  return tracer.startActiveSpan("http.request", async (span) => {
    try {
      span.setAttribute("http.method", "GET");
      span.setAttribute("http.url", url);

      const startTime = Date.now();
      const response = await fetch(url);
      const duration = Date.now() - startTime;

      span.setAttribute("http.status_code", response.status);
      span.setAttribute("http.duration_ms", duration);

      if (!response.ok) {
        span.setStatus({ code: 2, message: "HTTP error" });
      } else {
        span.setStatus({ code: 0 });
      }

      return await response.json();
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2 });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 4.3 自定义指标

```tsx
// lib/metrics.ts
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("my-app");

const requestCounter = meter.createCounter("http.requests", {
  description: "Total HTTP requests",
});

const requestDuration = meter.createHistogram("http.request.duration", {
  description: "HTTP request duration",
  unit: "ms",
});

export function recordRequest(method: string, path: string, duration: number) {
  requestCounter.add(1, {
    method,
    path,
  });

  requestDuration.record(duration, {
    method,
    path,
  });
}
```

### 4.4 错误追踪

```tsx
// app/api/error/route.ts
import { trace } from "@opentelemetry/api";

export async function GET() {
  const span = trace.getActiveSpan();

  try {
    throw new Error("Something went wrong");
  } catch (error) {
    if (span) {
      span.recordException(error as Error);
      span.setStatus({
        code: 2,
        message: (error as Error).message,
      });
    }

    return new Response("Error", { status: 500 });
  }
}
```

### 4.5 分布式追踪

```tsx
// app/api/distributed/route.ts
import { trace, context, propagation } from "@opentelemetry/api";

export async function GET(request: Request) {
  const tracer = trace.getTracer("my-app");

  return tracer.startActiveSpan("api.distributed", async (span) => {
    try {
      // 提取上游追踪上下文
      const ctx = propagation.extract(context.active(), request.headers);

      // 调用下游服务
      const headers = new Headers();
      propagation.inject(ctx, headers);

      const response = await fetch("https://downstream-service.com/api", {
        headers,
      });

      const data = await response.json();

      span.setStatus({ code: 0 });
      return Response.json(data);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2 });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## 5. 适用场景

OpenTelemetry 集成适用于以下场景:

1. **性能监控**: 监控应用性能和响应时间
2. **分布式追踪**: 追踪跨服务的请求链路
3. **错误追踪**: 快速定位和诊断错误
4. **依赖分析**: 了解服务间的依赖关系
5. **容量规划**: 基于指标数据进行容量规划
6. **SLA 监控**: 确保服务水平协议
7. **调试优化**: 识别性能瓶颈
8. **用户体验**: 监控真实用户体验

---

## 6. 注意事项

### 6.1 性能影响

追踪会增加少量性能开销:

```ts
// 使用采样减少开销
const sdk = new NodeSDK({
  sampler: new TraceIdRatioBasedSampler(0.1), // 只采样10%
});
```

### 6.2 数据隐私

避免记录敏感信息:

```tsx
const span = trace.getActiveSpan();

if (span) {
  // ✗ 不要记录敏感信息
  span.setAttribute("user.password", password);

  // ✓ 只记录必要信息
  span.setAttribute("user.id", userId);
}
```

### 6.3 Span 生命周期

确保 Span 正确结束:

```tsx
const span = tracer.startSpan("operation");

try {
  // 操作
} finally {
  span.end(); // 必须调用
}
```

### 6.4 上下文传播

在异步操作中保持上下文:

```tsx
import { context } from "@opentelemetry/api";

const ctx = context.active();

setTimeout(() => {
  context.with(ctx, () => {
    // 在正确的上下文中执行
  });
}, 1000);
```

---

## 7. 常见问题

### 7.1 如何查看追踪数据?

**问题**: 配置完成后如何查看数据。

**解决方案**:

使用 Jaeger UI:

```bash
# 启动Jaeger
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# 访问 http://localhost:16686
```

### 7.2 如何在开发环境中调试?

**问题**: 开发环境中看不到追踪数据。

**解决方案**:

```ts
// instrumentation.node.ts
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

if (process.env.NODE_ENV === "development") {
  sdk.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
}
```

### 7.3 如何追踪特定用户?

**问题**: 需要追踪特定用户的请求。

**解决方案**:

```tsx
const span = trace.getActiveSpan();

if (span) {
  span.setAttribute("user.id", userId);
  span.setAttribute("user.email", userEmail);
}
```

### 7.4 如何设置 Span 名称?

**问题**: Span 名称不够描述性。

**解决方案**:

```tsx
tracer.startActiveSpan("user.create", async (span) => {
  span.updateName(`user.create.${userId}`);
  // ...
  span.end();
});
```

### 7.5 如何处理长时间运行的操作?

**问题**: 长时间操作可能导致 Span 超时。

**解决方案**:

```tsx
tracer.startActiveSpan("long-operation", async (span) => {
  try {
    for (let i = 0; i < 100; i++) {
      // 添加事件标记进度
      span.addEvent(`Processing item ${i}`);
      await processItem(i);
    }
  } finally {
    span.end();
  }
});

async function processItem(i: number) {
  await new Promise((resolve) => setTimeout(resolve, 100));
}
```

### 7.6 如何集成现有日志系统?

**问题**: 已有日志系统,如何集成。

**解决方案**:

```tsx
import { trace } from "@opentelemetry/api";

function log(message: string, level: string = "info") {
  const span = trace.getActiveSpan();

  if (span) {
    span.addEvent(message, {
      "log.level": level,
      "log.timestamp": Date.now(),
    });
  }

  console.log(`[${level}] ${message}`);
}
```

### 7.7 如何实现自定义采样?

**问题**: 需要基于条件采样。

**解决方案**:

```ts
import { Sampler, SamplingDecision } from "@opentelemetry/sdk-trace-base";

class CustomSampler implements Sampler {
  shouldSample(context: any, traceId: string, spanName: string) {
    // 总是采样错误
    if (spanName.includes("error")) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }

    // 10%采样其他请求
    if (Math.random() < 0.1) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }

    return { decision: SamplingDecision.NOT_RECORD };
  }

  toString() {
    return "CustomSampler";
  }
}

const sdk = new NodeSDK({
  sampler: new CustomSampler(),
});
```

### 7.8 如何导出到多个后端?

**问题**: 需要同时发送到多个监控系统。

**解决方案**:

```ts
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const sdk = new NodeSDK({});

sdk.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })
  )
);

sdk.addSpanProcessor(
  new BatchSpanProcessor(
    new JaegerExporter({ endpoint: "http://localhost:14268/api/traces" })
  )
);

sdk.start();
```

### 7.9 如何追踪数据库连接池?

**问题**: 需要监控数据库连接池状态。

**解决方案**:

```tsx
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("database");

const poolSize = meter.createObservableGauge("db.pool.size", {
  description: "Database connection pool size",
});

poolSize.addCallback((result) => {
  result.observe(db.pool.size, {
    "db.system": "postgresql",
    "db.name": "mydb",
  });
});
```

### 7.10 如何实现告警?

**问题**: 需要在特定条件下发送告警。

**解决方案**:

```tsx
import { trace } from "@opentelemetry/api";

export async function GET() {
  const span = trace.getActiveSpan();

  try {
    const startTime = Date.now();
    const data = await fetchData();
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      span?.addEvent("slow_request", {
        "alert.type": "performance",
        "alert.severity": "warning",
        "request.duration_ms": duration,
      });

      // 发送告警
      await sendAlert({
        type: "slow_request",
        duration,
      });
    }

    return Response.json(data);
  } catch (error) {
    span?.recordException(error as Error);
    throw error;
  }
}

async function fetchData() {
  return { message: "Hello" };
}

async function sendAlert(alert: any) {
  console.log("Alert:", alert);
}
```

---

## 8. 总结

OpenTelemetry 为 Next.js 应用提供了强大的可观测性能力,帮助你监控性能、追踪请求、收集指标。通过 OpenTelemetry,你可以深入了解应用的运行状况,快速定位问题。

### 核心要点

1. **分布式追踪**: 追踪跨服务的请求链路
2. **性能监控**: 监控应用性能和响应时间
3. **指标收集**: 收集自定义指标数据
4. **错误追踪**: 快速定位和诊断错误
5. **上下文传播**: 跨服务传递追踪上下文
6. **多导出器**: 支持多种监控后端
7. **采样策略**: 灵活的采样配置
8. **标准化**: 基于开放标准

OpenTelemetry 为 Next.js 应用提供了完整的可观测性解决方案,是构建可靠生产应用的重要工具。

---

## 9. 高级追踪技术

### 9.1 自定义 Span 处理器

```ts
// instrumentation.ts
import {
  SpanProcessor,
  Span,
  ReadableSpan,
} from "@opentelemetry/sdk-trace-base";

class CustomSpanProcessor implements SpanProcessor {
  onStart(span: Span): void {
    console.log(`Span started: ${span.name}`);
  }

  onEnd(span: ReadableSpan): void {
    const duration = span.duration[0] * 1000 + span.duration[1] / 1000000;
    console.log(`Span ended: ${span.name}, duration: ${duration}ms`);

    // 记录慢请求
    if (duration > 1000) {
      console.warn(`Slow span detected: ${span.name}`);
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

const sdk = new NodeSDK({});
sdk.addSpanProcessor(new CustomSpanProcessor());
```

### 9.2 上下文传播

```tsx
// app/api/parent/route.ts
import { trace, context } from "@opentelemetry/api";

export async function GET() {
  const tracer = trace.getTracer("parent-api");

  return await tracer.startActiveSpan("parent-operation", async (span) => {
    try {
      // 调用子服务
      const response = await fetch("http://localhost:3000/api/child", {
        headers: {
          // 自动传播追踪上下文
          traceparent: span.spanContext().traceId,
        },
      });

      const data = await response.json();
      span.setAttribute("child.response", JSON.stringify(data));

      return Response.json(data);
    } finally {
      span.end();
    }
  });
}
```

```tsx
// app/api/child/route.ts
import { trace } from "@opentelemetry/api";

export async function GET(request: Request) {
  const tracer = trace.getTracer("child-api");

  return await tracer.startActiveSpan("child-operation", async (span) => {
    try {
      // 这个span会自动关联到父span
      await new Promise((resolve) => setTimeout(resolve, 100));

      return Response.json({ message: "Child response" });
    } finally {
      span.end();
    }
  });
}
```

### 9.3 Baggage 传播

```tsx
import { trace, propagation, context, baggageUtils } from "@opentelemetry/api";

export async function GET() {
  const tracer = trace.getTracer("baggage-example");

  return await tracer.startActiveSpan("operation", async (span) => {
    try {
      // 设置baggage
      const ctx = baggageUtils.setBaggage(context.active(), "user.id", "12345");

      // 在子操作中访问baggage
      await context.with(ctx, async () => {
        const userId = baggageUtils.getBaggage(context.active(), "user.id");
        span.setAttribute("user.id", userId || "");
      });

      return Response.json({ success: true });
    } finally {
      span.end();
    }
  });
}
```

---

## 10. 性能优化

### 10.1 批量导出

```ts
// instrumentation.ts
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

const processor = new BatchSpanProcessor(exporter, {
  maxQueueSize: 2048,
  maxExportBatchSize: 512,
  scheduledDelayMillis: 5000,
  exportTimeoutMillis: 30000,
});

const sdk = new NodeSDK({});
sdk.addSpanProcessor(processor);
```

### 10.2 采样优化

```ts
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-base";

const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1), // 10%采样率
});

const sdk = new NodeSDK({
  sampler,
});
```

### 10.3 资源优化

```ts
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: "my-nextjs-app",
  [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  "service.instance.id": process.env.HOSTNAME || "unknown",
});

const sdk = new NodeSDK({
  resource,
});
```

---

## 11. 监控仪表板

### 11.1 Jaeger 集成

```ts
// instrumentation.ts
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const exporter = new JaegerExporter({
  endpoint: "http://localhost:14268/api/traces",
  tags: [{ key: "service.name", value: "my-nextjs-app" }],
});

const sdk = new NodeSDK({});
sdk.addSpanProcessor(new BatchSpanProcessor(exporter));
```

### 11.2 Zipkin 集成

```ts
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

const exporter = new ZipkinExporter({
  url: "http://localhost:9411/api/v2/spans",
  serviceName: "my-nextjs-app",
});

const sdk = new NodeSDK({});
sdk.addSpanProcessor(new BatchSpanProcessor(exporter));
```

### 11.3 Prometheus 集成

```ts
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";

const exporter = new PrometheusExporter({
  port: 9464,
  endpoint: "/metrics",
});

const sdk = new NodeSDK({
  metricReader: exporter,
});
```

---

## 12. 实战案例

### 12.1 电商应用追踪

```tsx
// app/api/orders/route.ts
import { trace } from "@opentelemetry/api";

export async function POST(request: Request) {
  const tracer = trace.getTracer("orders-api");

  return await tracer.startActiveSpan("create-order", async (span) => {
    try {
      const body = await request.json();
      span.setAttribute("order.items_count", body.items.length);
      span.setAttribute("order.total", body.total);

      // 验证库存
      await tracer.startActiveSpan("check-inventory", async (inventorySpan) => {
        try {
          await checkInventory(body.items);
        } finally {
          inventorySpan.end();
        }
      });

      // 处理支付
      await tracer.startActiveSpan("process-payment", async (paymentSpan) => {
        try {
          await processPayment(body.payment);
          paymentSpan.setAttribute("payment.method", body.payment.method);
        } finally {
          paymentSpan.end();
        }
      });

      // 创建订单
      const order = await tracer.startActiveSpan(
        "save-order",
        async (saveSpan) => {
          try {
            const result = await saveOrder(body);
            saveSpan.setAttribute("order.id", result.id);
            return result;
          } finally {
            saveSpan.end();
          }
        }
      );

      return Response.json(order);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function checkInventory(items: any[]) {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

async function processPayment(payment: any) {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

async function saveOrder(data: any) {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return { id: "12345", ...data };
}
```

### 12.2 用户认证追踪

```tsx
// app/api/auth/login/route.ts
import { trace } from "@opentelemetry/api";

export async function POST(request: Request) {
  const tracer = trace.getTracer("auth-api");

  return await tracer.startActiveSpan("user-login", async (span) => {
    try {
      const { email, password } = await request.json();
      span.setAttribute("user.email", email);

      // 查找用户
      const user = await tracer.startActiveSpan(
        "find-user",
        async (findSpan) => {
          try {
            const result = await findUser(email);
            findSpan.setAttribute("user.found", !!result);
            return result;
          } finally {
            findSpan.end();
          }
        }
      );

      if (!user) {
        span.addEvent("user_not_found");
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      // 验证密码
      const valid = await tracer.startActiveSpan(
        "verify-password",
        async (verifySpan) => {
          try {
            const result = await verifyPassword(password, user.passwordHash);
            verifySpan.setAttribute("password.valid", result);
            return result;
          } finally {
            verifySpan.end();
          }
        }
      );

      if (!valid) {
        span.addEvent("invalid_password");
        return Response.json({ error: "Invalid password" }, { status: 401 });
      }

      // 生成token
      const token = await tracer.startActiveSpan(
        "generate-token",
        async (tokenSpan) => {
          try {
            return await generateToken(user.id);
          } finally {
            tokenSpan.end();
          }
        }
      );

      span.addEvent("login_success");
      return Response.json({ token });
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

async function findUser(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { id: "123", email, passwordHash: "hash" };
}

async function verifyPassword(password: string, hash: string) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return true;
}

async function generateToken(userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return "token-" + userId;
}
```

---

## 13. 总结与最佳实践

OpenTelemetry 为 Next.js 应用提供了完整的可观测性解决方案,通过分布式追踪、指标收集和日志关联,帮助你全面了解应用的运行状况。

### 核心要点

1. **分布式追踪**: 追踪跨服务的请求链路
2. **性能监控**: 监控应用性能和响应时间
3. **指标收集**: 收集自定义指标数据
4. **错误追踪**: 快速定位和诊断错误
5. **上下文传播**: 跨服务传递追踪上下文
6. **多导出器**: 支持多种监控后端
7. **采样策略**: 灵活的采样配置
8. **标准化**: 基于开放标准

### 最佳实践

1. 合理设置采样率
2. 使用批量导出
3. 添加有意义的属性
4. 记录关键事件
5. 处理异常情况
6. 优化性能开销
7. 定期审查追踪数据
8. 集成告警系统

OpenTelemetry 为 Next.js 应用提供了完整的可观测性解决方案,是构建可靠生产应用的重要工具。

---

## 14. 附录

### 14.1 常用配置模板

```ts
// instrumentation.ts - 完整配置模板
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-base";

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: "my-nextjs-app",
  [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
});

const exporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces",
});

const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1),
});

const sdk = new NodeSDK({
  resource,
  sampler,
});

sdk.addSpanProcessor(
  new BatchSpanProcessor(exporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
  })
);

sdk.start();

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});
```

### 14.2 环境变量配置

```bash
# .env.local
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_SERVICE_NAME=my-nextjs-app
OTEL_SERVICE_VERSION=1.0.0
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

### 14.3 Docker Compose 配置

```yaml
# docker-compose.yml
version: "3.8"
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # Jaeger UI
      - "14268:14268" # Jaeger collector
      - "4318:4318" # OTLP HTTP receiver
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces
      - OTEL_SERVICE_NAME=my-nextjs-app
    depends_on:
      - jaeger
```

### 14.4 性能优化清单

- [ ] 配置合理的采样率
- [ ] 使用批量导出
- [ ] 设置适当的队列大小
- [ ] 优化 Span 属性数量
- [ ] 避免在热路径中创建 Span
- [ ] 使用异步导出
- [ ] 定期清理旧数据
- [ ] 监控导出器性能

### 14.5 故障排查清单

- [ ] 检查导出器配置
- [ ] 验证网络连接
- [ ] 查看 SDK 日志
- [ ] 检查采样配置
- [ ] 验证资源属性
- [ ] 检查 Span 处理器
- [ ] 查看后端状态
- [ ] 验证环境变量

### 14.6 参考资源

- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/)
- [Next.js OpenTelemetry 文档](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)
- [Jaeger 文档](https://www.jaegertracing.io/docs/)
- [Zipkin 文档](https://zipkin.io/pages/documentation.html)
- [Prometheus 文档](https://prometheus.io/docs/)

### 14.7 常见导出器配置

| 导出器     | 端口  | 协议 | 用途           |
| ---------- | ----- | ---- | -------------- |
| OTLP HTTP  | 4318  | HTTP | 通用追踪导出   |
| OTLP gRPC  | 4317  | gRPC | 高性能追踪导出 |
| Jaeger     | 14268 | HTTP | Jaeger 追踪    |
| Zipkin     | 9411  | HTTP | Zipkin 追踪    |
| Prometheus | 9464  | HTTP | 指标导出       |

### 14.8 采样策略对比

| 策略         | 采样率   | 适用场景   | 性能影响 |
| ------------ | -------- | ---------- | -------- |
| AlwaysOn     | 100%     | 开发环境   | 高       |
| AlwaysOff    | 0%       | 禁用追踪   | 无       |
| TraceIdRatio | 可配置   | 生产环境   | 中       |
| ParentBased  | 继承父级 | 分布式系统 | 中       |

OpenTelemetry 为 Next.js 应用提供了完整的可观测性解决方案,是构建可靠生产应用的重要工具。

### 14.9 Span 状态码

| 状态码 | 名称  | 描述       |
| ------ | ----- | ---------- |
| 0      | UNSET | 未设置状态 |
| 1      | OK    | 操作成功   |
| 2      | ERROR | 操作失败   |

### 14.10 常见属性命名

| 属性名           | 类型   | 描述        |
| ---------------- | ------ | ----------- |
| http.method      | string | HTTP 方法   |
| http.url         | string | 请求 URL    |
| http.status_code | number | HTTP 状态码 |
| db.system        | string | 数据库系统  |
| db.statement     | string | SQL 语句    |
| user.id          | string | 用户 ID     |
| error.type       | string | 错误类型    |
| error.message    | string | 错误消息    |

### 14.11 最佳实践总结

1. **Span 命名**: 使用描述性名称,如`user.create`而非`create`
2. **属性添加**: 添加有意义的属性,帮助调试
3. **错误处理**: 始终记录异常和错误状态
4. **资源清理**: 确保 Span 正确结束
5. **采样配置**: 根据流量调整采样率
6. **性能监控**: 定期检查追踪系统性能
7. **数据保留**: 配置合理的数据保留策略
8. **告警设置**: 为关键指标设置告警

OpenTelemetry 为 Next.js 应用提供了完整的可观测性解决方案,是构建可靠生产应用的重要工具。

通过合理配置和使用 OpenTelemetry,你可以全面了解应用的运行状况,快速定位和解决问题,为用户提供更可靠的服务。

建议在生产环境中持续监控追踪数据,定期审查性能指标,并根据数据进行针对性优化,确保应用始终保持良好的可观测性。

OpenTelemetry 的标准化特性使得你可以轻松切换不同的监控后端,避免供应商锁定,为应用的长期发展提供了灵活性。

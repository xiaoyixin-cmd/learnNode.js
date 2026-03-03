**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-27-useReportWebVitals 详解

## 概述

useReportWebVitals 是 Next.js 提供的性能监控 Hook,用于收集和报告 Web Vitals 性能指标。Web Vitals 是 Google 提出的一组核心性能指标,包括 LCP(最大内容绘制)、FID(首次输入延迟)、CLS(累积布局偏移)等。通过 useReportWebVitals,你可以将这些性能数据发送到分析服务,监控应用的真实用户体验。

### 核心指标

**Core Web Vitals**:

- **LCP (Largest Contentful Paint)**: 最大内容绘制时间,衡量加载性能
- **FID (First Input Delay)**: 首次输入延迟,衡量交互性
- **CLS (Cumulative Layout Shift)**: 累积布局偏移,衡量视觉稳定性

**其他指标**:

- **FCP (First Contentful Paint)**: 首次内容绘制
- **TTFB (Time to First Byte)**: 首字节时间
- **INP (Interaction to Next Paint)**: 交互到下次绘制

### 性能标准

| 指标 | 良好   | 需要改进     | 差      |
| ---- | ------ | ------------ | ------- |
| LCP  | ≤2.5s  | 2.5s-4s      | >4s     |
| FID  | ≤100ms | 100ms-300ms  | >300ms  |
| CLS  | ≤0.1   | 0.1-0.25     | >0.25   |
| FCP  | ≤1.8s  | 1.8s-3s      | >3s     |
| TTFB | ≤800ms | 800ms-1800ms | >1800ms |

---

## 1. 基础用法

### 1.1 在 app 目录中使用

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
  });

  return null;
}
```

```tsx
// app/layout.tsx
import { WebVitals } from "./_components/WebVitals";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
```

### 1.2 发送到 Google Analytics

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 发送到Google Analytics
    window.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
```

### 1.3 发送到自定义分析服务

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 发送到自定义API
    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        label: metric.label,
        navigationType: metric.navigationType,
      }),
    });
  });

  return null;
}
```

---

## 2. 指标详解

### 2.1 LCP (Largest Contentful Paint)

LCP 衡量页面主要内容的加载速度:

```tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (metric.name === "LCP") {
      console.log("LCP:", metric.value);

      if (metric.value > 2500) {
        console.warn("LCP is slow!");
      }
    }
  });

  return null;
}
```

---

## 3. 高级用法

### 3.1 完整的分析集成

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

interface AnalyticsEvent {
  name: string;
  value: number;
  id: string;
  label?: string;
  navigationType?: string;
  rating?: string;
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    const event: AnalyticsEvent = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
      navigationType: metric.navigationType,
      rating: metric.rating,
    };

    // 发送到多个分析服务
    sendToGoogleAnalytics(event);
    sendToCustomAnalytics(event);
    logToConsole(event);
  });

  return null;
}

function sendToGoogleAnalytics(event: AnalyticsEvent) {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", event.name, {
      value: Math.round(
        event.name === "CLS" ? event.value * 1000 : event.value
      ),
      event_label: event.id,
      non_interaction: true,
    });
  }
}

function sendToCustomAnalytics(event: AnalyticsEvent) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(console.error);
}

function logToConsole(event: AnalyticsEvent) {
  console.log(`[${event.name}]`, {
    value: event.value,
    rating: event.rating,
    id: event.id,
  });
}
```

### 3.2 性能预警系统

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useState, useEffect } from "react";

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

export function WebVitals() {
  const [alerts, setAlerts] = useState<string[]>([]);

  useReportWebVitals((metric) => {
    const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];

    if (threshold && metric.value > threshold.poor) {
      const alert = `${metric.name} is poor: ${metric.value}`;
      setAlerts((prev) => [...prev, alert]);

      // 发送警报
      sendAlert(alert);
    }
  });

  return alerts.length > 0 ? (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        background: "red",
        color: "white",
        padding: "10px",
      }}
    >
      {alerts.map((alert, i) => (
        <div key={i}>{alert}</div>
      ))}
    </div>
  ) : null;
}

function sendAlert(message: string) {
  fetch("/api/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}
```

### 3.3 性能数据聚合

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useState } from "react";

interface MetricData {
  name: string;
  value: number;
  timestamp: number;
}

export function WebVitals() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);

  useReportWebVitals((metric) => {
    const data: MetricData = {
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
    };

    setMetrics((prev) => [...prev, data]);

    // 每收集10个指标就发送一次
    if (metrics.length >= 9) {
      sendBatch([...metrics, data]);
      setMetrics([]);
    }
  });

  return null;
}

function sendBatch(metrics: MetricData[]) {
  fetch("/api/analytics/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metrics }),
  });
}
```

### 3.4 用户会话跟踪

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useState } from "react";

export function WebVitals() {
  const [sessionId] = useState(() => generateSessionId());

  useReportWebVitals((metric) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        metric: {
          name: metric.name,
          value: metric.value,
          id: metric.id,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    });
  });

  return null;
}

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 4. 实战案例

### 4.1 Vercel Analytics 集成

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    const url = "https://vitals.vercel-analytics.com/v1/vitals";

    const body = {
      dsn: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
      id: metric.id,
      page: window.location.pathname,
      href: window.location.href,
      event_name: metric.name,
      value: metric.value.toString(),
      speed: getConnectionSpeed(),
    };

    const blob = new Blob([new URLSearchParams(body).toString()], {
      type: "application/x-www-form-urlencoded",
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        body: blob,
        method: "POST",
        credentials: "omit",
        keepalive: true,
      });
    }
  });

  return null;
}

function getConnectionSpeed() {
  return "connection" in navigator &&
    navigator.connection &&
    "effectiveType" in navigator.connection
    ? navigator.connection.effectiveType
    : "";
}
```

### 4.2 自定义仪表板

```tsx
// app/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Metric {
  name: string;
  value: number;
  timestamp: number;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const response = await fetch("/api/analytics/metrics");
    const data = await response.json();
    setMetrics(data);
  };

  const averages = calculateAverages(metrics);

  return (
    <div>
      <h1>Performance Dashboard</h1>

      <div>
        {Object.entries(averages).map(([name, value]) => (
          <div key={name}>
            <h3>{name}</h3>
            <p>{value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div>
        <h2>Recent Metrics</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, i) => (
              <tr key={i}>
                <td>{metric.name}</td>
                <td>{metric.value}</td>
                <td>{new Date(metric.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function calculateAverages(metrics: Metric[]) {
  const grouped = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) acc[metric.name] = [];
    acc[metric.name].push(metric.value);
    return acc;
  }, {} as Record<string, number[]>);

  return Object.entries(grouped).reduce((acc, [name, values]) => {
    acc[name] = values.reduce((sum, v) => sum + v, 0) / values.length;
    return acc;
  }, {} as Record<string, number>);
}
```

### 4.3 API 端点实现

```tsx
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";

interface MetricPayload {
  name: string;
  value: number;
  id: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: MetricPayload = await request.json();

    // 存储到数据库
    await saveMetric(data);

    // 检查是否需要发送警报
    if (shouldAlert(data)) {
      await sendAlert(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to save metric" },
      { status: 500 }
    );
  }
}

async function saveMetric(data: MetricPayload) {
  // 实现数据库存储逻辑
  console.log("Saving metric:", data);
}

function shouldAlert(data: MetricPayload) {
  const thresholds: Record<string, number> = {
    LCP: 4000,
    FID: 300,
    CLS: 0.25,
  };

  return data.value > (thresholds[data.name] || Infinity);
}

async function sendAlert(data: MetricPayload) {
  // 发送警报通知
  console.log("Alert:", data);
}
```

---

## 5. 适用场景

useReportWebVitals 适用于以下场景:

1. **性能监控**: 实时监控应用性能指标
2. **用户体验分析**: 了解真实用户的体验质量
3. **性能优化**: 识别性能瓶颈并优化
4. **A/B 测试**: 比较不同版本的性能表现
5. **回归检测**: 发现性能退化问题
6. **SLA 监控**: 确保性能符合服务水平协议
7. **地域分析**: 分析不同地区的性能差异
8. **设备分析**: 了解不同设备的性能表现

---

## 6. 注意事项

### 6.1 客户端组件限制

useReportWebVitals 只能在客户端组件中使用:

```tsx
// ✓ 正确
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
  });
  return null;
}

// ✗ 错误 - 服务端组件
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {}); // 错误!
  return null;
}
```

### 6.2 性能影响

避免在回调中执行耗时操作:

```tsx
// ✗ 不推荐
useReportWebVitals((metric) => {
  // 同步的耗时操作
  for (let i = 0; i < 1000000; i++) {}
});

// ✓ 推荐
useReportWebVitals((metric) => {
  // 异步发送
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(metric),
  });
});
```

### 6.3 数据采样

对于高流量应用,考虑采样:

```tsx
useReportWebVitals((metric) => {
  // 只采样10%的用户
  if (Math.random() < 0.1) {
    sendToAnalytics(metric);
  }
});
```

### 6.4 隐私考虑

不要发送敏感信息:

```tsx
useReportWebVitals((metric) => {
  // 移除敏感信息
  const sanitized = {
    name: metric.name,
    value: metric.value,
    // 不发送完整URL
    page: window.location.pathname,
  };

  sendToAnalytics(sanitized);
});
```

---

## 7. 常见问题

### 7.1 如何在开发环境中测试?

**问题**: 开发环境中看不到指标。

**解决方案**:

```tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Dev]", metric.name, metric.value);
    } else {
      sendToAnalytics(metric);
    }
  });

  return null;
}

function sendToAnalytics(metric: any) {
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(metric),
  });
}
```

### 7.2 如何过滤异常值?

**问题**: 有些指标值异常高。

**解决方案**:

```tsx
useReportWebVitals((metric) => {
  // 过滤异常值
  const MAX_VALUES: Record<string, number> = {
    LCP: 10000,
    FID: 1000,
    CLS: 1,
  };

  const maxValue = MAX_VALUES[metric.name];
  if (maxValue && metric.value > maxValue) {
    console.warn("Outlier detected:", metric);
    return;
  }

  sendToAnalytics(metric);
});
```

### 7.3 如何聚合多个页面的数据?

**问题**: 需要查看整个应用的性能。

**解决方案**:

```tsx
useReportWebVitals((metric) => {
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify({
      ...metric,
      page: window.location.pathname,
      referrer: document.referrer,
    }),
  });
});
```

### 7.4 如何实现实时监控?

**问题**: 需要实时查看性能数据。

**解决方案**:

```tsx
// app/_components/WebVitals.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useState } from "react";

export function WebVitals() {
  const [metrics, setMetrics] = useState<any[]>([]);

  useReportWebVitals((metric) => {
    setMetrics((prev) => [...prev, metric]);

    // 发送到服务器
    sendToAnalytics(metric);
  });

  // 开发环境显示实时数据
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          background: "white",
          padding: "10px",
        }}
      >
        {metrics.map((m, i) => (
          <div key={i}>
            {m.name}: {m.value.toFixed(2)}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function sendToAnalytics(metric: any) {
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify(metric),
  });
}
```

### 7.5 如何与现有分析工具集成?

**问题**: 已有 Google Analytics 或其他工具。

**解决方案**:

```tsx
useReportWebVitals((metric) => {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }

  // Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track("Web Vitals", {
      metric_name: metric.name,
      metric_value: metric.value,
    });
  }

  // Custom Analytics
  sendToCustomAnalytics(metric);
});
```

### 7.6 如何按用户分组分析?

**问题**: 需要按用户类型分析性能。

**解决方案**:

```tsx
useReportWebVitals((metric) => {
  const userType = getUserType(); // 'free', 'premium', etc.

  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify({
      ...metric,
      userType,
      userId: getUserId(),
    }),
  });
});

function getUserType() {
  return localStorage.getItem("userType") || "anonymous";
}

function getUserId() {
  return localStorage.getItem("userId") || "anonymous";
}
```

### 7.7 如何处理单页应用的路由变化?

**问题**: SPA 中路由变化时需要重新测量。

**解决方案**:

```tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function WebVitals() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        ...metric,
        page: pathname,
      }),
    });
  });

  useEffect(() => {
    // 路由变化时记录
    console.log("Route changed:", pathname);
  }, [pathname]);

  return null;
}
```

### 7.8 如何设置性能预算?

**问题**: 需要确保性能不低于某个标准。

**解决方案**:

```tsx
const PERFORMANCE_BUDGET = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
};

useReportWebVitals((metric) => {
  const budget =
    PERFORMANCE_BUDGET[metric.name as keyof typeof PERFORMANCE_BUDGET];

  if (budget && metric.value > budget) {
    console.error(`Performance budget exceeded for ${metric.name}`);

    // 发送警报
    fetch("/api/alerts", {
      method: "POST",
      body: JSON.stringify({
        type: "performance_budget_exceeded",
        metric: metric.name,
        value: metric.value,
        budget,
      }),
    });
  }

  sendToAnalytics(metric);
});
```

### 7.9 如何导出数据?

**问题**: 需要导出性能数据进行分析。

**解决方案**:

```tsx
// app/api/analytics/export/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const metrics = await fetchMetricsFromDatabase();

  const csv = convertToCSV(metrics);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=metrics.csv",
    },
  });
}

async function fetchMetricsFromDatabase() {
  return [];
}

function convertToCSV(metrics: any[]) {
  const headers = ["name", "value", "timestamp"];
  const rows = metrics.map((m) => [m.name, m.value, m.timestamp]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
```

### 7.10 如何实现性能对比?

**问题**: 需要对比不同版本的性能。

**解决方案**:

```tsx
useReportWebVitals((metric) => {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify({
      ...metric,
      version,
      timestamp: Date.now(),
    }),
  });
});
```

---

## 8. 总结

useReportWebVitals 是 Next.js 提供的强大性能监控工具,帮助你收集和分析 Web Vitals 指标,了解真实用户的体验质量。

### 核心要点

1. **Web Vitals**: 监控 LCP、FID、CLS 等核心性能指标
2. **实时监控**: 收集真实用户的性能数据
3. **分析集成**: 轻松集成 Google Analytics 等分析工具
4. **性能优化**: 识别性能瓶颈并优化
5. **用户体验**: 了解真实用户的体验质量
6. **数据驱动**: 基于数据做出优化决策
7. **持续监控**: 持续跟踪性能变化
8. **警报系统**: 及时发现性能问题

useReportWebVitals 为 Next.js 应用提供了完整的性能监控能力,是提升用户体验的重要工具。

通过合理使用 useReportWebVitals,你可以深入了解应用的性能表现,及时发现并解决性能问题,为用户提供更好的体验。

建议在生产环境中持续监控 Web Vitals 指标,并根据数据进行针对性优化,确保应用始终保持良好的性能水平。

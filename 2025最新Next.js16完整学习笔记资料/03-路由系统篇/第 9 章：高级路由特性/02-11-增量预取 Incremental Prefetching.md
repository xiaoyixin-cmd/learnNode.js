**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 增量预取 Incremental Prefetching

## 1. 概述

增量预取(Incremental Prefetching)是 Next.js 16 引入的智能预取策略,它会根据用户的浏览行为和网络状况,动态地预取可能访问的页面资源,而不是一次性预取所有链接。

### 1.1 概念定义

增量预取是一种渐进式的资源加载策略,Next.js 会智能地判断哪些页面最有可能被访问,然后优先预取这些页面的资源。

**关键特征**:

- **智能预测**: 根据用户行为预测可能访问的页面
- **按需加载**: 只预取可见区域和即将可见的链接
- **网络感知**: 根据网络状况调整预取策略
- **性能优化**: 避免浪费带宽,提升实际导航速度

**工作原理**:

```
用户滚动页面
  ↓
检测可见链接
  ↓
判断网络状况
  ↓
优先级排序
  ↓
增量预取资源
```

### 1.2 核心价值

**提升导航速度**:

通过提前加载用户可能访问的页面,导航时几乎可以瞬间完成,用户体验更流畅。

**节省带宽**:

相比传统的全量预取,增量预取只加载必要的资源,避免浪费用户的流量,特别是在移动网络环境下。

**智能优化**:

Next.js 会根据多种因素(可见性、网络状况、用户行为等)智能调整预取策略,在性能和资源消耗之间找到最佳平衡。

**自动化**:

开发者无需手动配置,Next.js 会自动处理预取逻辑,大大降低了优化成本。

### 1.3 预取策略对比

| 策略     | 预取时机   | 预取范围 | 适用场景            |
| :------- | :--------- | :------- | :------------------ |
| 全量预取 | 页面加载时 | 所有链接 | 链接数量少,网络良好 |
| 增量预取 | 链接可见时 | 可见链接 | 链接数量多,移动网络 |
| 手动预取 | 开发者控制 | 指定链接 | 特殊优化需求        |
| 禁用预取 | 不预取     | 无       | 极端带宽限制        |

---

## 2. 核心概念与原理

### 2.1 预取触发条件

Next.js 16 的增量预取会在以下情况触发:

**1. 链接进入视口**:

当 `<Link>` 组件进入用户的可见区域时,Next.js 会开始预取该链接指向的页面。

```tsx
import Link from "next/link";

export default function Page() {
  return (
    <div>
      {/* 用户滚动到这里时才预取 */}
      <Link href="/about">关于我们</Link>
    </div>
  );
}
```

**2. 鼠标悬停**:

当用户将鼠标悬停在链接上时,会立即触发预取(桌面端)。

**3. 触摸开始**:

在移动设备上,用户触摸链接时会触发预取。

**4. 手动触发**:

开发者可以使用 `router.prefetch()` 手动触发预取。

### 2.2 预取优先级

Next.js 会根据以下因素确定预取优先级:

| 因素     | 高优先级      | 低优先级    |
| :------- | :------------ | :---------- |
| 可见性   | 当前可见      | 不可见      |
| 用户交互 | 鼠标悬停/触摸 | 无交互      |
| 网络状况 | WiFi/4G       | 2G/慢速网络 |
| 设备性能 | 高性能设备    | 低性能设备  |
| 数据模式 | 非省流量模式  | 省流量模式  |

### 2.3 预取内容

Next.js 预取的内容包括:

**1. 页面组件代码**:

```tsx
// app/about/page.tsx 的 JavaScript 代码
export default function AboutPage() {
  return <div>关于页面</div>;
}
```

**2. 布局组件代码**:

```tsx
// app/about/layout.tsx 的代码(如果存在)
export default function AboutLayout({ children }) {
  return <div>{children}</div>;
}
```

**3. 服务端组件数据**:

如果页面是服务端组件,会预取 RSC Payload(React Server Component 数据)。

**4. 静态资源**:

CSS、图片等静态资源也会被预取。

### 2.4 网络感知

Next.js 会根据网络状况调整预取行为:

```tsx
// Next.js 内部逻辑(简化版)
function shouldPrefetch(link) {
  const connection = navigator.connection;

  // 慢速网络或省流量模式,不预取
  if (connection?.saveData || connection?.effectiveType === "2g") {
    return false;
  }

  // 快速网络,积极预取
  if (connection?.effectiveType === "4g" || connection?.type === "wifi") {
    return true;
  }

  // 默认策略
  return true;
}
```

### 2.5 Intersection Observer

Next.js 使用 Intersection Observer API 检测链接可见性:

```tsx
// Next.js 内部实现(简化版)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 链接可见,开始预取
      prefetchLink(entry.target.href);
    }
  });
});

// 观察所有链接
document.querySelectorAll("a[href]").forEach((link) => {
  observer.observe(link);
});
```

---

## 3. 适用场景

### 3.1 长列表页面

**场景**: 博客文章列表,有数百篇文章。

```tsx
// app/blog/page.tsx
import Link from "next/link";

export default async function BlogPage() {
  const posts = await getPosts(); // 获取所有文章

  return (
    <div>
      <h1>博客文章</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>
            {/* 只有滚动到可见区域才预取 */}
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

**增量预取效果**:

- 页面加载时不会预取所有文章
- 用户滚动时,可见的文章链接才会被预取
- 节省初始加载时间和带宽

### 3.2 电商产品列表

**场景**: 电商网站的产品列表,每页显示 50 个产品。

```tsx
// app/products/page.tsx
import Link from "next/link";
import Image from "next/image";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
            />
            <h3>{product.name}</h3>
            <p>¥{product.price}</p>
          </Link>
        </div>
      ))}
    </div>
  );
}
```

**增量预取效果**:

- 首屏可见的产品会被预取
- 用户滚动时,新出现的产品才预取
- 鼠标悬停时立即预取,点击时几乎瞬间加载

### 3.3 分步表单

**场景**: 多步骤注册流程,预取下一步页面。

```tsx
// app/register/step1/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Step1() {
  const router = useRouter();

  useEffect(() => {
    // 预取下一步
    router.prefetch("/register/step2");
  }, [router]);

  return (
    <div>
      <h1>注册 - 步骤 1</h1>
      <form>
        <input name="email" type="email" placeholder="邮箱" />
        <input name="password" type="password" placeholder="密码" />
        <Link href="/register/step2">下一步</Link>
      </form>
    </div>
  );
}
```

**增量预取效果**:

- 用户在步骤 1 时,步骤 2 已经预取
- 点击"下一步"时瞬间显示
- 提升表单填写体验

### 3.4 文档导航

**场景**: 技术文档网站,侧边栏有大量链接。

```tsx
// app/docs/layout.tsx
import Link from "next/link";

const docLinks = [
  { href: "/docs/getting-started", label: "快速开始" },
  { href: "/docs/installation", label: "安装" },
  { href: "/docs/configuration", label: "配置" },
  // ... 更多链接
];

export default function DocsLayout({ children }) {
  return (
    <div className="docs-layout">
      <aside>
        <nav>
          {docLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

**增量预取效果**:

- 侧边栏可见的链接会被预取
- 滚动侧边栏时,新出现的链接才预取
- 避免一次性预取所有文档

### 3.5 搜索结果

**场景**: 搜索结果页面,显示大量结果。

```tsx
// app/search/page.tsx
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = await searchContent(q);

  return (
    <div>
      <h1>搜索结果: {q}</h1>
      <div className="results">
        {results.map((result) => (
          <div key={result.id} className="result-item">
            <Link href={result.url}>
              <h2>{result.title}</h2>
              <p>{result.excerpt}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**增量预取效果**:

- 首屏结果会被预取
- 滚动查看更多结果时才预取
- 节省带宽,提升性能

### 3.6 社交媒体信息流

**场景**: 类似 Twitter 的无限滚动信息流。

```tsx
// app/feed/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadMorePosts();
  }, []);

  async function loadMorePosts() {
    const newPosts = await fetchPosts();
    setPosts((prev) => [...prev, ...newPosts]);
  }

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <Link href={`/posts/${post.id}`}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </Link>
        </article>
      ))}
      <button onClick={loadMorePosts}>加载更多</button>
    </div>
  );
}
```

**增量预取效果**:

- 可见的帖子链接会被预取
- 加载更多时,新帖子的链接才预取
- 优化无限滚动性能

---

## 4. API 签名与配置

### 4.1 Link 组件预取配置

```tsx
import Link from "next/link";

<Link href="/path" prefetch={true | false | null}>
  链接文本
</Link>;
```

**prefetch 属性值**:

| 值              | 行为               | 使用场景                |
| :-------------- | :----------------- | :---------------------- |
| `true`          | 强制预取           | 重要页面,确保快速加载   |
| `false`         | 禁用预取           | 不常访问的页面,节省带宽 |
| `null` 或未设置 | 默认行为(增量预取) | 大多数场景              |

### 4.2 router.prefetch() 方法

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

router.prefetch(
  href: string,
  options?: {
    kind?: 'auto' | 'full' | 'temporary'
  }
): void
```

**参数说明**:

- `href`: 要预取的路径
- `options.kind`: 预取类型
  - `'auto'`: 自动选择(默认)
  - `'full'`: 完整预取(包括数据)
  - `'temporary'`: 临时预取(仅组件代码)

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  function handlePrefetch() {
    router.prefetch("/dashboard", { kind: "full" });
  }

  return <button onClick={handlePrefetch}>预取仪表板</button>;
}
```

### 4.3 Intersection Observer 配置

Next.js 内部使用 Intersection Observer,可以通过自定义实现调整:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CustomPrefetch({ href, children }) {
  const router = useRouter();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            router.prefetch(href);
          }
        });
      },
      {
        // 自定义配置
        rootMargin: "50px", // 提前50px预取
        threshold: 0.1, // 10%可见时触发
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [href, router]);

  return <div ref={ref}>{children}</div>;
}
```

### 4.4 网络感知配置

根据网络状况调整预取策略:

```tsx
"use client";

import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    effectiveType: "4g",
    saveData: false,
  });

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      setNetworkStatus({
        effectiveType: connection.effectiveType,
        saveData: connection.saveData,
      });

      const handleChange = () => {
        setNetworkStatus({
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
        });
      };

      connection.addEventListener("change", handleChange);

      return () => {
        connection.removeEventListener("change", handleChange);
      };
    }
  }, []);

  return networkStatus;
}

// 使用示例
export default function SmartLink({ href, children }) {
  const { effectiveType, saveData } = useNetworkStatus();

  // 慢速网络或省流量模式禁用预取
  const shouldPrefetch =
    !saveData && effectiveType !== "slow-2g" && effectiveType !== "2g";

  return (
    <Link href={href} prefetch={shouldPrefetch}>
      {children}
    </Link>
  );
}
```

---

## 5. 基础与进阶使用

### 5.1 基础:默认增量预取

最简单的方式是使用默认行为:

```tsx
import Link from "next/link";

export default function Page() {
  return (
    <div>
      {/* 自动增量预取 */}
      <Link href="/about">关于我们</Link>
      <Link href="/contact">联系我们</Link>
    </div>
  );
}
```

**工作原理**:

1. 链接进入视口
2. Next.js 检测到可见性
3. 自动预取页面资源
4. 用户点击时瞬间显示

### 5.2 基础:禁用预取

某些情况下需要禁用预取:

```tsx
import Link from "next/link";

export default function Page() {
  return (
    <div>
      {/* 禁用预取 */}
      <Link href="/large-page" prefetch={false}>
        大型页面(不预取)
      </Link>
    </div>
  );
}
```

**使用场景**:

- 页面很大,预取浪费带宽
- 用户不太可能访问的页面
- 移动端或慢速网络

### 5.3 进阶:手动控制预取时机

精确控制何时预取:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DelayedPrefetch() {
  const router = useRouter();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // 页面加载3秒后预取
    const timer = setTimeout(() => {
      if (!hasPrefetched.current) {
        router.prefetch("/dashboard");
        hasPrefetched.current = true;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return <div>首页内容</div>;
}
```

### 5.4 进阶:悬停预取

鼠标悬停时触发预取:

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HoverPrefetch({ href, children }) {
  const router = useRouter();

  function handleMouseEnter() {
    router.prefetch(href);
  }

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      prefetch={false} // 禁用自动预取
    >
      {children}
    </Link>
  );
}
```

### 5.5 进阶:批量预取

预取多个相关页面:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const criticalPages = ["/dashboard", "/profile", "/settings", "/notifications"];

export default function BatchPrefetch() {
  const router = useRouter();

  useEffect(() => {
    // 批量预取关键页面
    criticalPages.forEach((page, index) => {
      // 错开预取时间,避免同时请求
      setTimeout(() => {
        router.prefetch(page);
      }, index * 500);
    });
  }, [router]);

  return null;
}
```

### 5.6 进阶:条件预取

根据用户状态决定是否预取:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConditionalPrefetch({ user }) {
  const router = useRouter();

  useEffect(() => {
    // 只为付费用户预取高级功能
    if (user.isPremium) {
      router.prefetch("/premium/features");
      router.prefetch("/premium/analytics");
    }

    // 管理员预取管理页面
    if (user.isAdmin) {
      router.prefetch("/admin/dashboard");
    }
  }, [user, router]);

  return null;
}
```

### 5.7 进阶:智能预取策略

根据用户行为智能预取:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SmartPrefetch() {
  const router = useRouter();
  const [userActivity, setUserActivity] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let activityCount = 0;

    const handleActivity = () => {
      activityCount++;
      setUserActivity(activityCount);
    };

    const handleScroll = () => {
      setHasScrolled(true);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // 用户活跃且滚动过页面,预取相关内容
    if (userActivity > 5 && hasScrolled) {
      router.prefetch("/related-content");
    }
  }, [userActivity, hasScrolled, router]);

  return null;
}
```

### 5.8 进阶:优先级预取

根据重要性设置预取优先级:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PriorityPrefetch() {
  const router = useRouter();

  useEffect(() => {
    // 高优先级:立即预取
    router.prefetch("/dashboard", { kind: "full" });

    // 中优先级:延迟1秒
    setTimeout(() => {
      router.prefetch("/profile");
    }, 1000);

    // 低优先级:延迟3秒
    setTimeout(() => {
      router.prefetch("/settings");
    }, 3000);

    // 最低优先级:延迟5秒
    setTimeout(() => {
      router.prefetch("/help");
    }, 5000);
  }, [router]);

  return null;
}
```

---

## 6. 注意事项

### 6.1 开发环境不预取

在开发环境中,Next.js 不会预取页面。

**原因**:

- 避免影响开发体验
- 减少不必要的编译
- 加快热更新速度

**验证预取**:

要测试预取功能,必须在生产环境中:

```bash
npm run build
npm run start
```

然后打开浏览器开发者工具的 Network 标签,观察预取请求。

### 6.2 预取缓存时长

Next.js 会缓存预取的资源:

| 页面类型 | 缓存时长 | 说明                               |
| :------- | :------- | :--------------------------------- |
| 静态页面 | 5 分钟   | 使用 `generateStaticParams` 的页面 |
| 动态页面 | 30 秒    | 普通动态页面                       |

**缓存失效**:

- 超过缓存时长
- 调用 `router.refresh()`
- 页面重新部署

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  function handleRefresh() {
    // 清除缓存并刷新
    router.refresh();
  }

  return <button onClick={handleRefresh}>刷新数据</button>;
}
```

### 6.3 带宽消耗

预取会消耗额外的带宽,需要权衡:

**优点**:

- 极速导航体验
- 用户感知性能提升
- 减少等待时间

**缺点**:

- 增加带宽消耗
- 可能预取用户不会访问的页面
- 移动端流量消耗

**优化建议**:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BandwidthAwarePrefetch() {
  const router = useRouter();
  const [shouldPrefetch, setShouldPrefetch] = useState(true);

  useEffect(() => {
    // 检查网络状况
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;

      // 慢速网络不预取
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        setShouldPrefetch(false);
      }

      // 省流量模式不预取
      if (connection.saveData) {
        setShouldPrefetch(false);
      }
    }
  }, []);

  useEffect(() => {
    if (shouldPrefetch) {
      router.prefetch("/dashboard");
    }
  }, [shouldPrefetch, router]);

  return null;
}
```

### 6.4 预取不保证成功

预取可能失败:

**失败原因**:

- 网络错误
- 服务器错误
- 资源不存在
- 超时

**处理方式**:

Next.js 会在用户实际访问时重新加载,无需特殊处理。预取失败不会影响正常导航。

### 6.5 Intersection Observer 兼容性

Intersection Observer API 在旧浏览器中可能不支持:

**兼容性**:

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

**Polyfill**:

Next.js 会自动处理兼容性,旧浏览器会降级到传统方式。

### 6.6 预取与 Suspense

预取与 Suspense 边界配合使用:

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content />
    </Suspense>
  );
}
```

**行为**:

- 预取会加载 Suspense 边界内的内容
- 不会触发 fallback 显示
- 用户点击时直接显示内容

### 6.7 动态导入的影响

使用 `dynamic` 导入的组件不会被预取:

```tsx
import dynamic from "next/dynamic";

const DynamicComponent = dynamic(() => import("./Component"), {
  ssr: false,
});
```

**解决方案**:

如果需要预取,避免使用 `dynamic` 导入,或者手动预加载:

```tsx
"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // 手动预加载动态组件
    import("./Component");
  }, []);

  return <div>内容</div>;
}
```

### 6.8 预取优先级

浏览器会给预取请求分配低优先级:

**优先级顺序**:

1. 关键资源(HTML、CSS、JS)
2. 图片、字体
3. 预取资源

**影响**:

- 预取不会阻塞关键资源加载
- 在网络繁忙时可能延迟
- 不影响首屏性能

---

## 7. 常见问题

### 7.1 为什么开发环境看不到预取?

**问题**: 在开发环境中,链接不会被预取。

**原因**: Next.js 在开发环境中禁用预取,避免影响开发体验和热更新速度。

**解决方案**: 在生产环境中测试:

```bash
npm run build
npm run start
```

然后打开浏览器开发者工具,查看 Network 标签中的预取请求。

### 7.2 如何验证预取是否工作?

**解决方案**: 使用浏览器开发者工具:

1. 打开 Chrome DevTools
2. 切换到 Network 标签
3. 观察链接进入视口时的网络请求
4. 查找类型为 `prefetch` 的请求

**示例**:

```
Name: page.js
Type: prefetch
Status: 200
Size: 15.2 KB
```

### 7.3 预取会影响首屏加载吗?

**回答**: 不会。预取使用低优先级的网络请求,不会阻塞首屏加载。

**原理**:

- Next.js 使用 `<link rel="prefetch">` 标签
- 浏览器会在空闲时加载
- 不影响关键资源的加载

### 7.4 如何禁用全局预取?

**解决方案**: 创建自定义 Link 组件:

```tsx
// components/Link.tsx
import NextLink from "next/link";

export default function Link({ prefetch = false, ...props }) {
  return <NextLink prefetch={prefetch} {...props} />;
}

// 使用
import Link from "@/components/Link";

<Link href="/page">链接</Link>;
```

### 7.5 预取的数据会过期吗?

**回答**: 会。预取的数据有缓存时长:

- 静态页面: 5 分钟
- 动态页面: 30 秒

**解决方案**: 使用 `router.refresh()` 刷新数据:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  function handleRefresh() {
    router.refresh();
  }

  return <button onClick={handleRefresh}>刷新</button>;
}
```

### 7.6 移动端应该禁用预取吗?

**建议**: 根据情况决定。

**禁用的理由**:

- 节省流量
- 延长电池寿命
- 避免浪费带宽

**不禁用的理由**:

- 提升用户体验
- 现代移动网络速度快
- 用户期望快速导航

**折中方案**: 只预取关键页面:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SmartLink({ href, children, important = false }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent));
  }, []);

  // 移动端只预取重要页面
  const prefetch = !isMobile || important;

  return (
    <Link href={href} prefetch={prefetch}>
      {children}
    </Link>
  );
}
```

### 7.7 预取会预取 API 数据吗?

**回答**: 会。Next.js 会预取页面的 RSC Payload,包括服务端组件获取的数据。

**示例**:

```tsx
// app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id); // 这个数据会被预取

  return <div>{post.title}</div>;
}
```

**注意**: 只有服务端组件的数据会被预取,客户端组件的数据请求不会被预取。

### 7.8 如何预取外部链接?

**回答**: `router.prefetch()` 只能预取内部链接,外部链接需要使用浏览器原生方法:

```tsx
"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // 预取外部资源
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = "https://example.com/resource.js";
    document.head.appendChild(link);
  }, []);

  return <div>页面内容</div>;
}
```

### 7.9 预取会影响 SEO 吗?

**回答**: 不会。预取是客户端行为,不影响 SEO。

**原因**:

- 搜索引擎爬虫不执行预取
- 页面内容正常渲染
- 不影响页面索引

### 7.10 如何监控预取性能?

**解决方案**: 使用 Performance API:

```tsx
"use client";

import { useEffect } from "react";

export default function PrefetchMonitor() {
  useEffect(() => {
    // 监听资源加载
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes("prefetch")) {
          console.log("预取资源:", entry.name);
          console.log("加载时间:", entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });

    return () => observer.disconnect();
  }, []);

  return null;
}
```

---

## 8. 总结

增量预取是 Next.js 16 的核心性能优化特性,通过智能的预取策略,在性能和资源消耗之间找到最佳平衡。

**核心要点**:

1. **自动化**: `<Link>` 组件默认启用增量预取,无需额外配置
2. **智能策略**: 根据可见性、网络状况、用户行为智能调整
3. **性能优化**: 只预取可见的链接,避免浪费带宽
4. **灵活控制**: 可以通过 `prefetch` 属性和 `router.prefetch()` 手动控制
5. **缓存机制**: 预取的资源会被缓存,静态页面 5 分钟,动态页面 30 秒

**工作原理**:

- 使用 Intersection Observer API 检测链接可见性
- 链接进入视口时自动预取
- 根据网络状况调整预取行为
- 使用低优先级请求,不影响首屏加载

**最佳实践**:

- 大多数情况使用默认增量预取
- 重要页面使用手动预取确保加载
- 不常访问的页面禁用预取节省带宽
- 移动端根据网络状况条件预取
- 使用悬停预取提升桌面端体验
- 批量预取时错开时间,避免同时请求

**性能影响**:

- 显著提升导航速度
- 轻微增加带宽消耗
- 不影响首屏加载
- 改善用户体验

**注意事项**:

- 开发环境不预取,需要在生产环境测试
- 预取有缓存时长,可能需要刷新
- 慢速网络或省流量模式会禁用预取
- 预取失败不影响正常导航

**适用场景**:

- 长列表页面(博客、产品列表)
- 分步表单(注册、结账流程)
- 文档导航(技术文档、帮助中心)
- 搜索结果(搜索引擎、站内搜索)
- 社交媒体信息流(无限滚动)

通过合理使用增量预取策略,可以让 Next.js 应用的导航体验接近原生应用,同时保持良好的性能和资源利用率。增量预取是 Next.js 性能优化的关键特性之一,值得深入理解和应用。

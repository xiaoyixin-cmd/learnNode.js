**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# staleTimes 配置详解

## 概述

staleTimes 是 Next.js 16 中用于配置客户端路由缓存过期时间的选项。通过配置不同类型路由的缓存时间，可以控制页面数据的新鲜度，平衡性能和数据实时性。

### staleTimes 的作用

1. **控制缓存时间**：设置路由缓存过期时间
2. **优化性能**：减少不必要的数据请求
3. **平衡实时性**：在性能和数据新鲜度间取舍
4. **灵活配置**：针对不同路由类型设置不同时间
5. **改善体验**：快速导航和数据更新

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};
```

### 配置选项详解

| 选项      | 类型   | 默认值 | 说明                   |
| --------- | ------ | ------ | ---------------------- |
| `dynamic` | number | 30     | 动态路由缓存时间（秒） |
| `static`  | number | 300    | 静态路由缓存时间（秒） |

### 动态路由配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 动态路由30秒后过期
      dynamic: 30,
    },
  },
};
```

### 静态路由配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 静态路由5分钟后过期
      static: 300,
    },
  },
};
```

## 高级配置

### 不同场景的配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 实时数据场景
      dynamic: 0, // 立即过期
      static: 60, // 1分钟
    },
  },
};
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 性能优先场景
      dynamic: 300, // 5分钟
      static: 3600, // 1小时
    },
  },
};
```

### 根据环境配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: process.env.NODE_ENV === "production" ? 60 : 0,
      static: process.env.NODE_ENV === "production" ? 300 : 0,
    },
  },
};
```

### 配合 revalidate 使用

```typescript
// app/posts/page.tsx
export const revalidate = 60; // 60秒重新验证

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### 配合 revalidatePath 使用

```typescript
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    },
  });

  // 立即重新验证
  revalidatePath("/posts");

  return { success: true, post };
}
```

### 配合 revalidateTag 使用

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetch("https://api.example.com/posts", {
    next: {
      tags: ["posts"],
      revalidate: 60,
    },
  }).then((res) => res.json());

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

```typescript
// app/actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function updatePost(id: string, data: any) {
  await db.post.update({
    where: { id },
    data,
  });

  // 重新验证标签
  revalidateTag("posts");
}
```

### 禁用缓存

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 0, // 禁用动态路由缓存
      static: 0, // 禁用静态路由缓存
    },
  },
};
```

## 实战案例

### 案例 1：新闻网站配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 新闻需要实时更新
      dynamic: 60, // 1分钟
      static: 300, // 5分钟
    },
  },
};
```

```typescript
// app/news/page.tsx
export const revalidate = 60;

export default async function NewsPage() {
  const news = await fetch("https://api.example.com/news", {
    next: { revalidate: 60 },
  }).then((res) => res.json());

  return (
    <div>
      <h1>Latest News</h1>
      {news.map((item) => (
        <article key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.summary}</p>
        </article>
      ))}
    </div>
  );
}
```

### 案例 2：电商网站配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 商品信息需要较新
      dynamic: 120, // 2分钟
      static: 600, // 10分钟
    },
  },
};
```

```typescript
// app/products/[id]/page.tsx
export const revalidate = 120;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
    </div>
  );
}
```

### 案例 3：博客网站配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 博客内容更新不频繁
      dynamic: 600, // 10分钟
      static: 3600, // 1小时
    },
  },
};
```

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600;

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### 案例 4：实时数据看板

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 实时数据不缓存
      dynamic: 0,
      static: 0,
    },
  },
};
```

```typescript
// app/dashboard/page.tsx
export const revalidate = 0;

export default async function Dashboard() {
  const data = await fetch("https://api.example.com/stats", {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <div>
      <h1>Real-time Dashboard</h1>
      <div>Active Users: {data.activeUsers}</div>
      <div>Revenue: ${data.revenue}</div>
    </div>
  );
}
```

## 适用场景

| 场景     | dynamic | static | 原因         |
| -------- | ------- | ------ | ------------ |
| 实时数据 | 0       | 0      | 需要最新数据 |
| 新闻网站 | 60      | 300    | 频繁更新     |
| 电商网站 | 120     | 600    | 库存价格变化 |
| 博客网站 | 600     | 3600   | 更新不频繁   |
| 文档网站 | 3600    | 86400  | 很少更新     |
| 营销页面 | 300     | 1800   | 定期更新     |

## 注意事项

### 1. 缓存时间选择

```javascript
// 根据数据更新频率选择
module.exports = {
  experimental: {
    staleTimes: {
      // 频繁更新：短时间
      dynamic: 30,
      // 稳定内容：长时间
      static: 3600,
    },
  },
};
```

### 2. 与 revalidate 配合

```typescript
// 页面级别的revalidate优先级更高
export const revalidate = 60; // 覆盖staleTimes配置

export default async function Page() {
  // 页面内容
}
```

### 3. 开发环境配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 开发环境禁用缓存
      dynamic: process.env.NODE_ENV === "development" ? 0 : 60,
      static: process.env.NODE_ENV === "development" ? 0 : 300,
    },
  },
};
```

### 4. 性能影响

```javascript
// 过短的缓存时间会增加服务器负载
module.exports = {
  experimental: {
    staleTimes: {
      // 避免设置过短
      dynamic: 30, // 最少30秒
      static: 60, // 最少1分钟
    },
  },
};
```

### 5. 用户体验

```javascript
// 平衡性能和实时性
module.exports = {
  experimental: {
    staleTimes: {
      // 根据用户期望设置
      dynamic: 60, // 可接受的延迟
      static: 300, // 合理的缓存时间
    },
  },
};
```

## 常见问题

### 1. 缓存不生效？

**问题**：配置后页面仍然实时更新

**解决方案**：

```typescript
// 检查页面是否设置了revalidate
// 页面级别的revalidate会覆盖staleTimes
export const revalidate = 60; // 移除或调整
```

### 2. 如何立即更新缓存？

**问题**：需要手动刷新缓存

**解决方案**：

```typescript
"use server";

import { revalidatePath } from "next/cache";

export async function refreshData() {
  revalidatePath("/data");
}
```

### 3. 不同页面不同缓存时间？

**问题**：需要针对不同页面设置

**解决方案**：

```typescript
// app/posts/page.tsx
export const revalidate = 60;

// app/about/page.tsx
export const revalidate = 3600;
```

### 4. 如何禁用特定页面缓存？

**问题**：某些页面不需要缓存

**解决方案**：

```typescript
export const revalidate = 0;

export default async function Page() {
  const data = await fetch(url, { cache: "no-store" });
  return <div>{data}</div>;
}
```

### 5. 如何验证缓存是否工作？

**问题**：如何确认缓存生效

**解决方案**：

```typescript
export default async function Page() {
  const timestamp = new Date().toISOString();
  console.log("Page rendered at:", timestamp);

  return <div>Rendered at: {timestamp}</div>;
}
```

### 6. 缓存时间太长？

**问题**：数据更新不及时

**解决方案**：

```javascript
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30, // 减少缓存时间
      static: 60,
    },
  },
};
```

### 7. 缓存时间太短？

**问题**：服务器负载过高

**解决方案**：

```javascript
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 120, // 增加缓存时间
      static: 600,
    },
  },
};
```

### 8. 如何按需重新验证？

**问题**：数据更新后立即刷新

**解决方案**：

```typescript
'use server'

import { revalidateTag } from 'next/cache'

export async function updateData() {
  await db.update({...})
  revalidateTag('data')
}
```

### 9. 如何处理用户特定数据？

**问题**：不同用户看到不同数据

**解决方案**：

```typescript
import { cookies } from "next/headers";

export default async function Page() {
  const userId = cookies().get("userId");
  const data = await getUserData(userId);

  return <div>{data}</div>;
}
```

### 10. 如何监控缓存效果？

**问题**：需要了解缓存命中率

**解决方案**：

```typescript
export default async function Page() {
  const start = Date.now();
  const data = await getData();
  const duration = Date.now() - start;

  console.log("Data fetch duration:", duration);

  return <div>{data}</div>;
}
```

### 11. 如何处理 API 路由缓存？

**问题**：API 路由也需要缓存

**解决方案**：

```typescript
// app/api/data/route.ts
export async function GET() {
  const data = await getData();

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
```

### 12. 如何处理错误时的缓存？

**问题**：错误响应被缓存

**解决方案**：

```typescript
export default async function Page() {
  try {
    const data = await getData();
    return <div>{data}</div>;
  } catch (error) {
    // 错误不缓存
    return <div>Error loading data</div>;
  }
}
```

### 13. 如何实现渐进式缓存？

**问题**：需要分层缓存策略

**解决方案**：

```typescript
// 首页短缓存
export const revalidate = 60;

// 详情页长缓存
export const revalidate = 3600;
```

### 14. 如何处理动态参数？

**问题**：动态路由缓存策略

**解决方案**：

```typescript
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}

export const revalidate = 300;
```

### 15. 如何测试缓存配置？

**问题**：如何验证配置正确

**解决方案**：

```bash
# 构建并启动
npm run build
npm run start

# 多次访问同一页面，观察响应时间
```

### 16. 如何处理缓存预热?

**问题**: 应用启动时预热缓存

**解决方案**:

```typescript
// lib/cache-warmup.ts
export async function warmupCache() {
  const criticalPaths = ["/", "/products", "/about"];

  for (const path of criticalPaths) {
    try {
      await fetch(`http://localhost:3000${path}`);
      console.log(`预热缓存: ${path}`);
    } catch (error) {
      console.error(`预热失败: ${path}`, error);
    }
  }
}
```

```typescript
// app/api/warmup/route.ts
import { warmupCache } from "@/lib/cache-warmup";

export async function GET() {
  await warmupCache();
  return Response.json({ success: true });
}
```

### 17. 如何实现缓存降级?

**问题**: 缓存失效时的降级策略

**解决方案**:

```typescript
// lib/cache-fallback.ts
export async function fetchWithFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  cacheTime: number
): Promise<T> {
  try {
    const data = await fetcher();
    return data;
  } catch (error) {
    console.error("获取数据失败,使用降级数据", error);
    return fallback;
  }
}
```

```tsx
// app/products/page.tsx
import { fetchWithFallback } from "@/lib/cache-fallback";

export default async function ProductsPage() {
  const products = await fetchWithFallback(
    () => fetch("/api/products").then((r) => r.json()),
    [], // 降级数据
    60
  );

  return <div>{products.length} 个产品</div>;
}
```

### 18. 如何监控缓存命中率?

**问题**: 实时监控缓存效果

**解决方案**:

```typescript
// lib/cache-monitor.ts
class CacheMonitor {
  private hits = 0;
  private misses = 0;

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getHitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : (this.hits / total) * 100;
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: `${this.getHitRate().toFixed(2)}%`,
    };
  }
}

export const cacheMonitor = new CacheMonitor();
```

```typescript
// middleware.ts
import { cacheMonitor } from "@/lib/cache-monitor";

export function middleware(request: Request) {
  const cached = checkCache(request);

  if (cached) {
    cacheMonitor.recordHit();
  } else {
    cacheMonitor.recordMiss();
  }

  return NextResponse.next();
}
```

### 19. 如何实现分层缓存?

**问题**: 多层缓存策略

**解决方案**:

```typescript
// lib/layered-cache.ts
interface CacheLayer {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl: number): Promise<void>;
}

class LayeredCache {
  constructor(private layers: CacheLayer[]) {}

  async get(key: string) {
    for (const layer of this.layers) {
      const value = await layer.get(key);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }

  async set(key: string, value: any, ttl: number) {
    await Promise.all(this.layers.map((layer) => layer.set(key, value, ttl)));
  }
}

// 使用
const cache = new LayeredCache([
  memoryCache, // L1: 内存缓存
  redisCache, // L2: Redis缓存
  dbCache, // L3: 数据库缓存
]);
```

### 20. 如何处理缓存一致性?

**问题**: 多实例间的缓存同步

**解决方案**:

```typescript
// lib/cache-sync.ts
import { Redis } from "ioredis";

const redis = new Redis();
const CHANNEL = "cache-invalidation";

export async function invalidateCache(key: string) {
  // 本地清除
  localCache.delete(key);

  // 通知其他实例
  await redis.publish(CHANNEL, JSON.stringify({ key }));
}

// 监听其他实例的清除通知
redis.subscribe(CHANNEL);
redis.on("message", (channel, message) => {
  if (channel === CHANNEL) {
    const { key } = JSON.parse(message);
    localCache.delete(key);
  }
});
```

### 21. 如何实现缓存版本控制?

**问题**: 缓存数据结构变更时的处理

**解决方案**:

```typescript
// lib/versioned-cache.ts
interface CachedData<T> {
  version: number;
  data: T;
  timestamp: number;
}

const CURRENT_VERSION = 2;

export function setCache<T>(key: string, data: T) {
  const cached: CachedData<T> = {
    version: CURRENT_VERSION,
    data,
    timestamp: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(cached));
}

export function getCache<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const cached: CachedData<T> = JSON.parse(raw);

  // 版本不匹配,清除缓存
  if (cached.version !== CURRENT_VERSION) {
    localStorage.removeItem(key);
    return null;
  }

  return cached.data;
}
```

### 22. 如何实现智能缓存?

**问题**: 根据访问频率动态调整缓存时间

**解决方案**:

```typescript
// lib/smart-cache.ts
class SmartCache {
  private accessCount = new Map<string, number>();

  getCacheDuration(key: string): number {
    const count = this.accessCount.get(key) || 0;

    // 访问越频繁,缓存时间越长
    if (count > 100) return 3600; // 1小时
    if (count > 50) return 1800; // 30分钟
    if (count > 10) return 600; // 10分钟
    return 60; // 1分钟
  }

  recordAccess(key: string) {
    const count = this.accessCount.get(key) || 0;
    this.accessCount.set(key, count + 1);
  }
}

export const smartCache = new SmartCache();
```

### 23. 如何处理缓存雪崩?

**问题**: 大量缓存同时失效

**解决方案**:

```typescript
// lib/cache-avalanche.ts
export function getStaggeredTTL(baseTTL: number): number {
  // 添加随机偏移,避免同时失效
  const offset = Math.random() * baseTTL * 0.1;
  return Math.floor(baseTTL + offset);
}

// 使用
export const revalidate = getStaggeredTTL(300); // 300±30秒
```

### 24. 如何实现缓存预测?

**问题**: 预测用户行为,提前加载数据

**解决方案**:

```typescript
// lib/cache-prediction.ts
export function predictNextPages(currentPath: string): string[] {
  const predictions: Record<string, string[]> = {
    "/": ["/products", "/about"],
    "/products": ["/products/[id]", "/cart"],
    "/products/[id]": ["/cart", "/products"],
  };

  return predictions[currentPath] || [];
}

export async function prefetchPredicted(currentPath: string) {
  const nextPages = predictNextPages(currentPath);

  await Promise.all(
    nextPages.map((path) =>
      fetch(path).catch((err) => console.error("预取失败", err))
    )
  );
}
```

### 25. 如何实现缓存分析?

**问题**: 分析缓存使用情况

**解决方案**:

```typescript
// lib/cache-analytics.ts
interface CacheStats {
  key: string;
  hits: number;
  misses: number;
  size: number;
  lastAccess: number;
}

class CacheAnalytics {
  private stats = new Map<string, CacheStats>();

  record(key: string, hit: boolean, size: number) {
    const stat = this.stats.get(key) || {
      key,
      hits: 0,
      misses: 0,
      size: 0,
      lastAccess: 0,
    };

    if (hit) {
      stat.hits++;
    } else {
      stat.misses++;
    }

    stat.size = size;
    stat.lastAccess = Date.now();

    this.stats.set(key, stat);
  }

  getReport() {
    const entries = Array.from(this.stats.values());

    return {
      totalKeys: entries.length,
      totalSize: entries.reduce((sum, s) => sum + s.size, 0),
      hitRate: this.calculateHitRate(entries),
      topKeys: entries.sort((a, b) => b.hits - a.hits).slice(0, 10),
    };
  }

  private calculateHitRate(entries: CacheStats[]) {
    const total = entries.reduce((sum, s) => sum + s.hits + s.misses, 0);
    const hits = entries.reduce((sum, s) => sum + s.hits, 0);
    return total === 0 ? 0 : (hits / total) * 100;
  }
}

export const analytics = new CacheAnalytics();
```

## 最佳实践

### 1. 根据数据特性选择缓存时间

```javascript
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      // 用户数据 - 短缓存
      dynamic: 30,
      // 静态内容 - 长缓存
      static: 3600,
    },
  },
};
```

### 2. 结合多种缓存策略

```tsx
// 页面级缓存
export const revalidate = 300;

// 数据级缓存
const data = await fetch("/api/data", {
  next: { revalidate: 60 },
});

// 标签缓存
const tagged = await fetch("/api/tagged", {
  next: { tags: ["products"] },
});
```

### 3. 监控和优化

```typescript
// 定期输出缓存统计
setInterval(() => {
  console.log("缓存统计:", cacheMonitor.getStats());
}, 60000);
```

## 总结

staleTimes 配置是控制 Next.js 应用缓存策略的重要工具。合理配置可以：

1. **提升性能**：减少不必要的数据请求
2. **降低负载**：减轻服务器压力
3. **改善体验**：快速页面导航
4. **平衡实时性**：在性能和数据新鲜度间取舍
5. **灵活控制**：针对不同场景优化

关键要点：

- 根据数据更新频率选择缓存时间
- 动态内容使用较短缓存时间
- 静态内容使用较长缓存时间
- 配合 revalidate 使用
- 使用 revalidatePath 按需更新
- 使用 revalidateTag 批量更新
- 开发环境禁用缓存
- 监控缓存效果
- 测试不同配置
- 平衡性能和实时性

记住：缓存是性能优化的重要手段，但过度缓存会导致数据不新鲜。需要根据实际业务需求，在性能和实时性之间找到最佳平衡点。

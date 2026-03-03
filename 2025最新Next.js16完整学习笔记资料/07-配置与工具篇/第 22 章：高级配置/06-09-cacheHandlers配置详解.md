**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# cacheHandlers 配置详解

## 概述

cacheHandlers 是 Next.js 16 中用于自定义缓存处理逻辑的配置选项。通过自定义缓存处理器，可以将 Next.js 的缓存存储到不同的后端，如 Redis、Memcached、数据库等，实现分布式缓存和更灵活的缓存策略。

### cacheHandlers 的作用

1. **自定义存储**：将缓存存储到自定义后端
2. **分布式缓存**：支持多实例共享缓存
3. **灵活控制**：完全控制缓存的读写逻辑
4. **性能优化**：使用专业缓存系统提升性能
5. **持久化**：缓存可以持久化存储

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  cacheHandler: require.resolve("./cache-handler.js"),
  cacheMaxMemorySize: 0, // 禁用默认内存缓存
};
```

### 自定义缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");

class CustomCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    // 从缓存中获取数据
    return null;
  }

  async set(key, data, ctx) {
    // 将数据存储到缓存
  }

  async revalidateTag(tag) {
    // 重新验证标签
  }
}

module.exports = CustomCacheHandler;
```

### Redis 缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
});

class RedisCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    try {
      const data = await redis.get(key);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl = ctx?.revalidate || 60;
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async revalidateTag(tag) {
    try {
      const keys = await redis.keys(`*:${tag}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis revalidateTag error:", error);
    }
  }
}

module.exports = RedisCacheHandler;
```

## 高级配置

### Memcached 缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Memcached = require("memcached");

const memcached = new Memcached(
  process.env.MEMCACHED_SERVERS || "localhost:11211"
);

class MemcachedCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    return new Promise((resolve) => {
      memcached.get(key, (err, data) => {
        if (err || !data) {
          resolve(null);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  async set(key, data, ctx) {
    return new Promise((resolve) => {
      const ttl = ctx?.revalidate || 60;
      memcached.set(key, JSON.stringify(data), ttl, (err) => {
        resolve();
      });
    });
  }

  async revalidateTag(tag) {
    // Memcached不支持模式匹配，需要维护标签映射
  }
}

module.exports = MemcachedCacheHandler;
```

### 数据库缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class DatabaseCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    try {
      const cache = await prisma.cache.findUnique({
        where: { key },
      });

      if (!cache) return null;

      // 检查是否过期
      if (cache.expiresAt && cache.expiresAt < new Date()) {
        await prisma.cache.delete({ where: { key } });
        return null;
      }

      return JSON.parse(cache.value);
    } catch (error) {
      console.error("Database get error:", error);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl = ctx?.revalidate || 60;
      const expiresAt = new Date(Date.now() + ttl * 1000);

      await prisma.cache.upsert({
        where: { key },
        update: {
          value: JSON.stringify(data),
          expiresAt,
        },
        create: {
          key,
          value: JSON.stringify(data),
          expiresAt,
        },
      });
    } catch (error) {
      console.error("Database set error:", error);
    }
  }

  async revalidateTag(tag) {
    try {
      await prisma.cache.deleteMany({
        where: {
          tags: {
            has: tag,
          },
        },
      });
    } catch (error) {
      console.error("Database revalidateTag error:", error);
    }
  }
}

module.exports = DatabaseCacheHandler;
```

### 多层缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require("ioredis");
const NodeCache = require("node-cache");

const redis = new Redis(process.env.REDIS_URL);
const memoryCache = new NodeCache({ stdTTL: 60 });

class MultiLayerCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    // 先从内存缓存获取
    let data = memoryCache.get(key);
    if (data) {
      return data;
    }

    // 再从Redis获取
    try {
      const redisData = await redis.get(key);
      if (redisData) {
        data = JSON.parse(redisData);
        memoryCache.set(key, data);
        return data;
      }
    } catch (error) {
      console.error("Redis get error:", error);
    }

    return null;
  }

  async set(key, data, ctx) {
    const ttl = ctx?.revalidate || 60;

    // 存储到内存缓存
    memoryCache.set(key, data, ttl);

    // 存储到Redis
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async revalidateTag(tag) {
    // 清除内存缓存
    memoryCache.flushAll();

    // 清除Redis缓存
    try {
      const keys = await redis.keys(`*:${tag}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis revalidateTag error:", error);
    }
  }
}

module.exports = MultiLayerCacheHandler;
```

### 带压缩的缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require("ioredis");
const zlib = require("zlib");
const { promisify } = require("util");

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const redis = new Redis(process.env.REDIS_URL);

class CompressedCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    try {
      const compressed = await redis.getBuffer(key);
      if (!compressed) return null;

      const decompressed = await gunzip(compressed);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.error("Get error:", error);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const json = JSON.stringify(data);
      const compressed = await gzip(json);
      const ttl = ctx?.revalidate || 60;
      await redis.setex(key, ttl, compressed);
    } catch (error) {
      console.error("Set error:", error);
    }
  }

  async revalidateTag(tag) {
    try {
      const keys = await redis.keys(`*:${tag}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("RevalidateTag error:", error);
    }
  }
}

module.exports = CompressedCacheHandler;
```

## 实战案例

### 案例 1：Redis 集群缓存

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require("ioredis");

const cluster = new Redis.Cluster([
  { host: "redis-1", port: 6379 },
  { host: "redis-2", port: 6379 },
  { host: "redis-3", port: 6379 },
]);

class RedisClusterCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    try {
      const data = await cluster.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cluster get error:", error);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const ttl = ctx?.revalidate || 60;
      await cluster.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Cluster set error:", error);
    }
  }

  async revalidateTag(tag) {
    try {
      const nodes = cluster.nodes("master");
      for (const node of nodes) {
        const keys = await node.keys(`*:${tag}:*`);
        if (keys.length > 0) {
          await node.del(...keys);
        }
      }
    } catch (error) {
      console.error("Cluster revalidateTag error:", error);
    }
  }
}

module.exports = RedisClusterCacheHandler;
```

### 案例 2：带监控的缓存处理器

```javascript
// cache-handler.js
const { CacheHandler } = require("next/dist/server/lib/incremental-cache");
const Redis = require("ioredis");
const { Counter, Histogram } = require("prom-client");

const redis = new Redis(process.env.REDIS_URL);

const cacheHits = new Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
});

const cacheMisses = new Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
});

const cacheLatency = new Histogram({
  name: "cache_operation_duration_seconds",
  help: "Cache operation duration",
  labelNames: ["operation"],
});

class MonitoredCacheHandler extends CacheHandler {
  constructor(options) {
    super(options);
  }

  async get(key) {
    const end = cacheLatency.startTimer({ operation: "get" });
    try {
      const data = await redis.get(key);
      if (data) {
        cacheHits.inc();
        return JSON.parse(data);
      } else {
        cacheMisses.inc();
        return null;
      }
    } catch (error) {
      console.error("Get error:", error);
      return null;
    } finally {
      end();
    }
  }

  async set(key, data, ctx) {
    const end = cacheLatency.startTimer({ operation: "set" });
    try {
      const ttl = ctx?.revalidate || 60;
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Set error:", error);
    } finally {
      end();
    }
  }

  async revalidateTag(tag) {
    const end = cacheLatency.startTimer({ operation: "revalidate" });
    try {
      const keys = await redis.keys(`*:${tag}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("RevalidateTag error:", error);
    } finally {
      end();
    }
  }
}

module.exports = MonitoredCacheHandler;
```

## 适用场景

| 场景       | 推荐方案         | 原因     |
| ---------- | ---------------- | -------- |
| 单实例应用 | 默认文件系统缓存 | 简单高效 |
| 多实例应用 | Redis 缓存       | 共享缓存 |
| 高并发应用 | Redis 集群       | 高可用   |
| 大数据缓存 | 带压缩的 Redis   | 节省内存 |
| 需要持久化 | 数据库缓存       | 数据持久 |
| 性能要求高 | 多层缓存         | 快速响应 |

## 注意事项

### 1. 缓存键设计

```javascript
// 使用有意义的键名
const key = `page:${pathname}:${searchParams}`;

// 避免键名冲突
const key = `${process.env.APP_NAME}:${pathname}`;
```

### 2. TTL 设置

```javascript
// 根据数据特性设置合理的TTL
async set(key, data, ctx) {
  const ttl = ctx?.revalidate || 3600 // 默认1小时
  await redis.setex(key, ttl, JSON.stringify(data))
}
```

### 3. 错误处理

```javascript
// 缓存失败不应影响应用运行
async get(key) {
  try {
    return await redis.get(key)
  } catch (error) {
    console.error('Cache error:', error)
    return null // 返回null让应用继续运行
  }
}
```

### 4. 连接管理

```javascript
// 复用连接，避免频繁创建
const redis = new Redis({
  host: process.env.REDIS_HOST,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
```

### 5. 内存管理

```javascript
// 设置最大内存限制
const redis = new Redis({
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});
```

## 常见问题

### 1. 缓存不生效？

**问题**：配置了 cacheHandler 但缓存不工作

**解决方案**：

```javascript
// 确保禁用了默认内存缓存
module.exports = {
  cacheHandler: require.resolve("./cache-handler.js"),
  cacheMaxMemorySize: 0,
};
```

### 2. Redis 连接失败？

**问题**：无法连接到 Redis

**解决方案**：

```javascript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retryStrategy: (times) => {
    if (times > 3) {
      return null; // 停止重试
    }
    return Math.min(times * 50, 2000);
  },
});
```

### 3. 缓存数据过大？

**问题**：缓存的数据太大导致性能问题

**解决方案**：

```javascript
// 使用压缩
const zlib = require("zlib");
const compressed = await zlib.gzipSync(JSON.stringify(data));
await redis.set(key, compressed);
```

### 4. 如何清除所有缓存？

**问题**：需要清除所有缓存

**解决方案**：

```javascript
async clearAll() {
  const keys = await redis.keys('*')
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
```

### 5. 如何实现缓存预热？

**问题**：应用启动时预加载缓存

**解决方案**：

```javascript
async warmup() {
  const pages = ['/home', '/about', '/products']
  for (const page of pages) {
    const data = await fetchPageData(page)
    await this.set(page, data, { revalidate: 3600 })
  }
}
```

### 6. 如何监控缓存性能？

**问题**：需要监控缓存命中率

**解决方案**：

```javascript
const metrics = {
  hits: 0,
  misses: 0,
  getHitRate() {
    return this.hits / (this.hits + this.misses)
  }
}

async get(key) {
  const data = await redis.get(key)
  if (data) {
    metrics.hits++
  } else {
    metrics.misses++
  }
  return data
}
```

### 7. 如何处理缓存雪崩？

**问题**：大量缓存同时过期

**解决方案**：

```javascript
// 添加随机过期时间
async set(key, data, ctx) {
  const ttl = ctx?.revalidate || 3600
  const randomTTL = ttl + Math.floor(Math.random() * 300)
  await redis.setex(key, randomTTL, JSON.stringify(data))
}
```

### 8. 如何实现缓存降级？

**问题**：Redis 故障时的降级方案

**解决方案**：

```javascript
const fallbackCache = new Map()

async get(key) {
  try {
    return await redis.get(key)
  } catch (error) {
    console.error('Redis error, using fallback')
    return fallbackCache.get(key)
  }
}
```

### 9. 如何处理并发写入？

**问题**：多个请求同时写入同一个键

**解决方案**：

```javascript
const locks = new Map()

async set(key, data, ctx) {
  if (locks.has(key)) {
    await locks.get(key)
  }

  const promise = redis.setex(key, ctx?.revalidate || 60, JSON.stringify(data))
  locks.set(key, promise)

  try {
    await promise
  } finally {
    locks.delete(key)
  }
}
```

### 10. 如何实现分布式锁？

**问题**：防止缓存击穿

**解决方案**：

```javascript
async getWithLock(key, fetchFn) {
  const lockKey = `lock:${key}`
  const lockValue = Date.now().toString()

  const locked = await redis.set(lockKey, lockValue, 'EX', 10, 'NX')

  if (locked) {
    try {
      const data = await fetchFn()
      await this.set(key, data)
      return data
    } finally {
      await redis.del(lockKey)
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 100))
    return await this.get(key)
  }
}
```

### 11. 如何实现缓存版本控制？

**问题**：需要管理缓存版本

**解决方案**：

```javascript
const CACHE_VERSION = '1.0.0'

async set(key, data, ctx) {
  const versionedData = {
    version: CACHE_VERSION,
    data,
  }
  await redis.setex(key, ctx?.revalidate || 60, JSON.stringify(versionedData))
}

async get(key) {
  const cached = await redis.get(key)
  if (!cached) return null

  const { version, data } = JSON.parse(cached)
  if (version !== CACHE_VERSION) {
    await redis.del(key)
    return null
  }

  return data
}
```

### 12. 如何实现缓存统计？

**问题**：需要统计缓存使用情况

**解决方案**：

```javascript
const stats = {
  gets: 0,
  sets: 0,
  hits: 0,
  misses: 0,
  errors: 0,
}

async get(key) {
  stats.gets++
  try {
    const data = await redis.get(key)
    if (data) {
      stats.hits++
    } else {
      stats.misses++
    }
    return data
  } catch (error) {
    stats.errors++
    throw error
  }
}
```

### 13. 如何实现缓存分片？

**问题**：单个 Redis 实例容量不足

**解决方案**：

```javascript
const shards = [
  new Redis({ host: 'redis-1' }),
  new Redis({ host: 'redis-2' }),
  new Redis({ host: 'redis-3' }),
]

function getShard(key) {
  const hash = key.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return shards[Math.abs(hash) % shards.length]
}

async get(key) {
  const shard = getShard(key)
  return await shard.get(key)
}
```

### 14. 如何实现缓存预加载？

**问题**：页面首次访问慢

**解决方案**：

```javascript
async preload(keys) {
  const pipeline = redis.pipeline()
  keys.forEach(key => pipeline.get(key))
  const results = await pipeline.exec()
  return results.map(([err, data]) => data ? JSON.parse(data) : null)
}
```

### 15. 如何实现缓存淘汰策略？

**问题**：需要自定义淘汰策略

**解决方案**：

```javascript
// 使用Redis的LRU策略
const redis = new Redis({
  maxmemory: "256mb",
  maxmemoryPolicy: "allkeys-lru",
});
```

## 总结

cacheHandlers 配置让 Next.js 的缓存系统更加灵活和强大。通过自定义缓存处理器，可以：

1. **分布式缓存**：多实例共享缓存数据
2. **灵活存储**：选择最适合的存储后端
3. **性能优化**：使用专业缓存系统
4. **监控管理**：完整的缓存监控和管理
5. **高可用性**：实现缓存的高可用方案

## 补充缓存策略

### 1. 缓存预热策略

```typescript
// lib/cache-warmup.ts
export async function warmupCache() {
  const popularPages = ["/", "/products", "/about"];

  for (const page of popularPages) {
    await fetch(`http://localhost:3000${page}`);
  }
}
```

### 2. 缓存失效策略

```typescript
// lib/cache-invalidation.ts
export async function invalidateCache(pattern: string) {
  const keys = await cacheHandler.keys(pattern);

  for (const key of keys) {
    await cacheHandler.delete(key);
  }
}
```

### 3. 缓存分层策略

```typescript
// lib/tiered-cache.ts
export class TieredCache {
  private l1Cache: Map<string, any>;
  private l2Cache: RedisCache;

  async get(key: string) {
    // 先查 L1 缓存
    let value = this.l1Cache.get(key);
    if (value) return value;

    // 再查 L2 缓存
    value = await this.l2Cache.get(key);
    if (value) {
      this.l1Cache.set(key, value);
      return value;
    }

    return null;
  }
}
```

### 4. 缓存压缩策略

```typescript
// lib/cache-compression.ts
import { gzip, gunzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export async function compressCache(data: any) {
  const json = JSON.stringify(data);
  const compressed = await gzipAsync(json);
  return compressed.toString("base64");
}

export async function decompressCache(compressed: string) {
  const buffer = Buffer.from(compressed, "base64");
  const decompressed = await gunzipAsync(buffer);
  return JSON.parse(decompressed.toString());
}
```

### 5. 缓存监控仪表板

```typescript
// lib/cache-dashboard.ts
export async function getCacheStats() {
  return {
    hits: await cacheHandler.getHits(),
    misses: await cacheHandler.getMisses(),
    hitRate: await cacheHandler.getHitRate(),
    size: await cacheHandler.getSize(),
    keys: await cacheHandler.getKeyCount(),
  };
}
```

### 6. 缓存一致性保证

```typescript
// lib/cache-consistency.ts
export class CacheConsistency {
  async updateWithLock(key: string, updater: () => Promise<any>) {
    const lock = await this.acquireLock(key);

    try {
      const value = await updater();
      await cacheHandler.set(key, value);
      return value;
    } finally {
      await this.releaseLock(lock);
    }
  }
}
```

### 7. 缓存降级策略

```typescript
// lib/cache-fallback.ts
export async function getWithFallback(
  key: string,
  fallback: () => Promise<any>
) {
  try {
    const cached = await cacheHandler.get(key);
    if (cached) return cached;
  } catch (error) {
    console.error("Cache error:", error);
  }

  return await fallback();
}
```

### 8. 缓存批量操作

```typescript
// lib/cache-batch.ts
export async function batchGet(keys: string[]) {
  const results = await Promise.all(keys.map((key) => cacheHandler.get(key)));

  return keys.reduce((acc, key, index) => {
    acc[key] = results[index];
    return acc;
  }, {} as Record<string, any>);
}
```

### 9. 缓存版本控制

```typescript
// lib/cache-versioning.ts
const CACHE_VERSION = "v1";

export function versionedKey(key: string) {
  return `${CACHE_VERSION}:${key}`;
}

export async function migrateCache(oldVersion: string, newVersion: string) {
  const keys = await cacheHandler.keys(`${oldVersion}:*`);

  for (const key of keys) {
    const value = await cacheHandler.get(key);
    const newKey = key.replace(oldVersion, newVersion);
    await cacheHandler.set(newKey, value);
    await cacheHandler.delete(key);
  }
}
```

### 10. 缓存性能测试

```typescript
// tests/cache-performance.test.ts
import { performance } from "perf_hooks";

test("cache performance", async () => {
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await cacheHandler.get(`key-${i}`);
  }

  const duration = performance.now() - start;
  const avgTime = duration / iterations;

  expect(avgTime).toBeLessThan(1); // 平均每次操作小于1ms
});
```

关键要点：

- 根据应用规模选择合适的缓存方案
- 实现完善的错误处理和降级机制
- 合理设置 TTL 和缓存键
- 监控缓存性能和命中率
- 处理好并发和一致性问题
- 实现缓存预热和淘汰策略
- 使用缓存分层提升性能
- 实现缓存压缩节省空间
- 保证缓存一致性
- 进行性能测试

记住：缓存是性能优化的重要手段，但也要注意缓存一致性和数据新鲜度的平衡。

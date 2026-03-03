**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# unstable_cache 高级缓存策略

## 概述

unstable_cache 是 Next.js 16 提供的函数级缓存 API,可以对任何异步函数的返回值进行缓存。与 fetch 的缓存不同,unstable_cache 可以缓存数据库查询、文件系统操作、复杂计算等任何异步操作的结果。

### unstable_cache 核心特性

1. **函数级缓存**: 缓存任何异步函数的返回值
2. **灵活的缓存键**: 支持自定义缓存键和参数
3. **标签管理**: 支持缓存标签,方便批量失效
4. **生命周期控制**: 可配置缓存时间和重新验证策略
5. **类型安全**: 完整的 TypeScript 类型支持

### 基本语法

```typescript
import { unstable_cache } from "next/cache";

const getCachedData = unstable_cache(
  async (param1, param2) => {
    // 异步操作
    return data;
  },
  ["cache-key"], // 缓存键数组
  {
    tags: ["tag1", "tag2"], // 缓存标签
    revalidate: 3600, // 重新验证时间(秒)
  }
);
```

## 基础用法

### 缓存数据库查询

```typescript
// lib/data.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

// 缓存用户查询
export const getUser = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
    return user;
  },
  ["user"],
  {
    tags: ["users"],
    revalidate: 3600, // 1小时后重新验证
  }
);

// 使用
const user = await getUser("user-123");
```

### 缓存 API 请求

```typescript
// lib/api.ts
import { unstable_cache } from "next/cache";

export const getWeather = unstable_cache(
  async (city: string) => {
    const response = await fetch(
      `https://api.weather.com/v1/current?city=${city}`,
      { cache: "no-store" }
    );
    return response.json();
  },
  ["weather"],
  {
    tags: ["weather-data"],
    revalidate: 1800, // 30分钟
  }
);
```

### 缓存文件系统操作

```typescript
// lib/content.ts
import { unstable_cache } from "next/cache";
import fs from "fs/promises";
import path from "path";

export const getMarkdownContent = unstable_cache(
  async (slug: string) => {
    const filePath = path.join(process.cwd(), "content", `${slug}.md`);
    const content = await fs.readFile(filePath, "utf8");
    return content;
  },
  ["markdown"],
  {
    tags: ["content"],
    revalidate: false, // 永不自动重新验证
  }
);
```

### 缓存复杂计算

```typescript
// lib/analytics.ts
import { unstable_cache } from "next/cache";

export const calculateUserEngagement = unstable_cache(
  async (userId: string, startDate: Date, endDate: Date) => {
    const activities = await db.activity.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 复杂的计算逻辑
    const engagement = {
      totalActions: activities.length,
      uniqueDays: new Set(activities.map((a) => a.createdAt.toDateString()))
        .size,
      avgActionsPerDay: activities.length / 30,
      topActions: calculateTopActions(activities),
    };

    return engagement;
  },
  ["user-engagement"],
  {
    tags: ["analytics"],
    revalidate: 86400, // 24小时
  }
);
```

## 实战场景一: 电商产品数据缓存

### 产品列表缓存

```typescript
// lib/products.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getProducts = unstable_cache(
  async (categoryId?: string) => {
    const products = await db.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  },
  ["products"],
  {
    tags: ["products", "product-list"],
    revalidate: 3600,
  }
);
```

### 产品详情缓存

```typescript
export const getProduct = unstable_cache(
  async (productId: string) => {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return product;
  },
  ["product-detail"],
  {
    tags: (productId: string) => ["products", `product-${productId}`],
    revalidate: 1800,
  }
);
```

### 相关产品推荐缓存

```typescript
export const getRelatedProducts = unstable_cache(
  async (productId: string, limit: number = 4) => {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) return [];

    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
      },
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        images: {
          take: 1,
        },
      },
    });

    return relatedProducts;
  },
  ["related-products"],
  {
    tags: (productId: string) => ["products", `product-${productId}-related`],
    revalidate: 7200, // 2小时
  }
);
```

### 产品搜索结果缓存

```typescript
export const searchProducts = unstable_cache(
  async (
    query: string,
    filters?: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ) => {
    const products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          filters?.categoryId ? { categoryId: filters.categoryId } : {},
          filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
          filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
        ],
      },
      include: {
        category: true,
        images: { take: 1 },
      },
      take: 20,
    });

    return products;
  },
  ["product-search"],
  {
    tags: ["products", "search"],
    revalidate: 1800,
  }
);
```

### 在页面中使用

```typescript
// app/products/[id]/page.tsx
import { getProduct, getRelatedProducts } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, relatedProducts] = await Promise.all([
    getProduct(params.id),
    getRelatedProducts(params.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>价格: ¥{product.price}</p>

      <h2>相关产品</h2>
      <div className="grid grid-cols-4 gap-4">
        {relatedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
```

### 缓存失效处理

```typescript
// app/actions/product.ts
"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

export async function updateProduct(productId: string, data: any) {
  await db.product.update({
    where: { id: productId },
    data,
  });

  // 失效相关缓存
  revalidateTag("products");
  revalidateTag(`product-${productId}`);
  revalidateTag(`product-${productId}-related`);

  return { success: true };
}

export async function deleteProduct(productId: string) {
  await db.product.delete({
    where: { id: productId },
  });

  // 失效所有产品相关缓存
  revalidateTag("products");
  revalidateTag(`product-${productId}`);

  return { success: true };
}
```

## 实战场景二: 博客内容管理系统

### 文章列表缓存

```typescript
// lib/posts.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getPosts = unstable_cache(
  async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        skip,
        take: limit,
        where: { published: true },
        include: {
          author: {
            select: {
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
      }),
      db.post.count({ where: { published: true } }),
    ]);

    return {
      posts,
      total,
      pages: Math.ceil(total / limit),
    };
  },
  ["posts-list"],
  {
    tags: ["posts"],
    revalidate: 600, // 10分钟
  }
);
```

### 文章详情缓存

```typescript
export const getPost = unstable_cache(
  async (slug: string) => {
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            bio: true,
          },
        },
        tags: true,
        comments: {
          where: { approved: true },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return post;
  },
  ["post-detail"],
  {
    tags: (slug: string) => ["posts", `post-${slug}`],
    revalidate: 1800,
  }
);
```

### 分类文章缓存

```typescript
export const getPostsByCategory = unstable_cache(
  async (categorySlug: string, page: number = 1, limit: number = 10) => {
    const category = await db.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return null;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: {
          published: true,
          categories: {
            some: {
              id: category.id,
            },
          },
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
      }),
      db.post.count({
        where: {
          published: true,
          categories: {
            some: {
              id: category.id,
            },
          },
        },
      }),
    ]);

    return {
      category,
      posts,
      total,
      pages: Math.ceil(total / limit),
    };
  },
  ["posts-by-category"],
  {
    tags: (categorySlug: string) => ["posts", `category-${categorySlug}`],
    revalidate: 900, // 15分钟
  }
);
```

### 标签文章缓存

```typescript
export const getPostsByTag = unstable_cache(
  async (tagSlug: string) => {
    const tag = await db.tag.findUnique({
      where: { slug: tagSlug },
      include: {
        posts: {
          where: { published: true },
          include: {
            author: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
          take: 20,
        },
      },
    });

    return tag;
  },
  ["posts-by-tag"],
  {
    tags: (tagSlug: string) => ["posts", `tag-${tagSlug}`],
    revalidate: 1200, // 20分钟
  }
);
```

### 热门文章缓存

```typescript
export const getPopularPosts = unstable_cache(
  async (limit: number = 5) => {
    const posts = await db.post.findMany({
      where: { published: true },
      take: limit,
      orderBy: {
        views: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
      },
    });

    return posts;
  },
  ["popular-posts"],
  {
    tags: ["posts", "popular"],
    revalidate: 3600, // 1小时
  }
);
```

## 实战场景三: 用户数据缓存

### 用户资料缓存

```typescript
// lib/users.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getUserProfile = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return user;
  },
  ["user-profile"],
  {
    tags: (userId: string) => ["users", `user-${userId}`],
    revalidate: 1800,
  }
);
```

### 用户设置缓存

```typescript
export const getUserSettings = unstable_cache(
  async (userId: string) => {
    const settings = await db.userSettings.findUnique({
      where: { userId },
    });

    return settings;
  },
  ["user-settings"],
  {
    tags: (userId: string) => ["users", `user-${userId}-settings`],
    revalidate: 3600,
  }
);
```

### 用户活动历史缓存

```typescript
export const getUserActivity = unstable_cache(
  async (userId: string, limit: number = 20) => {
    const activities = await db.activity.findMany({
      where: { userId },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return activities;
  },
  ["user-activity"],
  {
    tags: (userId: string) => ["users", `user-${userId}-activity`],
    revalidate: 600, // 10分钟
  }
);
```

### 用户通知缓存

```typescript
export const getUserNotifications = unstable_cache(
  async (userId: string, unreadOnly: boolean = false) => {
    const notifications = await db.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  },
  ["user-notifications"],
  {
    tags: (userId: string) => ["users", `user-${userId}-notifications`],
    revalidate: 300, // 5分钟
  }
);
```

## 实战场景四: 第三方 API 集成缓存

### 天气数据缓存

```typescript
// lib/weather.ts
import { unstable_cache } from "next/cache";

export const getWeatherData = unstable_cache(
  async (city: string) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  },
  ["weather"],
  {
    tags: (city: string) => ["weather", `weather-${city}`],
    revalidate: 1800, // 30分钟
  }
);
```

### 汇率数据缓存

```typescript
export const getExchangeRates = unstable_cache(
  async (baseCurrency: string = "USD") => {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    return {
      base: data.base,
      rates: data.rates,
      lastUpdate: data.time_last_updated,
    };
  },
  ["exchange-rates"],
  {
    tags: ["exchange-rates"],
    revalidate: 3600, // 1小时
  }
);
```

### 新闻数据缓存

```typescript
export const getNews = unstable_cache(
  async (category: string = "general", limit: number = 10) => {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=${limit}&apiKey=${process.env.NEWS_API_KEY}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));
  },
  ["news"],
  {
    tags: (category: string) => ["news", `news-${category}`],
    revalidate: 900, // 15分钟
  }
);
```

### 股票数据缓存

```typescript
export const getStockPrice = unstable_cache(
  async (symbol: string) => {
    const response = await fetch(`https://api.example.com/stock/${symbol}`, {
      cache: "no-store",
    });

    const data = await response.json();

    return {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
      timestamp: new Date().toISOString(),
    };
  },
  ["stock"],
  {
    tags: (symbol: string) => ["stocks", `stock-${symbol}`],
    revalidate: 60, // 1分钟
  }
);
```

## 高级缓存策略

### 动态缓存键生成

根据参数动态生成缓存键:

```typescript
function generateCacheKey(params: Record<string, any>): string[] {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map((key) => `${key}-${params[key]}`);
}

export const getFilteredProducts = unstable_cache(
  async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => {
    const products = await db.product.findMany({
      where: {
        ...(filters.category && { categoryId: filters.category }),
        ...(filters.minPrice && { price: { gte: filters.minPrice } }),
        ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
      },
      orderBy: filters.sortBy ? { [filters.sortBy]: "desc" } : undefined,
    });

    return products;
  },
  (filters) => ["filtered-products", ...generateCacheKey(filters)],
  {
    tags: ["products"],
    revalidate: 1800,
  }
);
```

### 条件缓存

根据条件决定是否缓存:

```typescript
export function createConditionalCache<
  T extends (...args: any[]) => Promise<any>
>(
  fn: T,
  shouldCache: (...args: Parameters<T>) => boolean,
  cacheKey: string[],
  options: any
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (shouldCache(...args)) {
      const cached = unstable_cache(fn, cacheKey, options);
      return cached(...args);
    }
    return fn(...args);
  };
}

// 使用
export const getData = createConditionalCache(
  async (userId: string, includePrivate: boolean) => {
    return await db.data.findMany({
      where: {
        userId,
        ...(includePrivate ? {} : { private: false }),
      },
    });
  },
  (userId, includePrivate) => !includePrivate, // 只缓存公开数据
  ["user-data"],
  { revalidate: 3600 }
);
```

### 分层缓存策略

不同数据使用不同的缓存时间:

```typescript
// 静态数据 - 长时间缓存
export const getStaticConfig = unstable_cache(
  async () => {
    return await db.config.findMany();
  },
  ["static-config"],
  {
    tags: ["config"],
    revalidate: 86400, // 24小时
  }
);

// 半静态数据 - 中等时间缓存
export const getCategories = unstable_cache(
  async () => {
    return await db.category.findMany();
  },
  ["categories"],
  {
    tags: ["categories"],
    revalidate: 3600, // 1小时
  }
);

// 动态数据 - 短时间缓存
export const getTrendingProducts = unstable_cache(
  async () => {
    return await db.product.findMany({
      orderBy: { views: "desc" },
      take: 10,
    });
  },
  ["trending"],
  {
    tags: ["products", "trending"],
    revalidate: 300, // 5分钟
  }
);
```

### 缓存预热

在应用启动时预热缓存:

```typescript
// lib/cache-warmup.ts
import { getStaticConfig, getCategories, getPopularPosts } from "@/lib/data";

export async function warmupCache() {
  console.log("Starting cache warmup...");

  try {
    await Promise.all([getStaticConfig(), getCategories(), getPopularPosts()]);

    console.log("Cache warmup completed");
  } catch (error) {
    console.error("Cache warmup failed:", error);
  }
}

// 在应用启动时调用
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await warmupCache();
  }
}
```

### 缓存降级策略

当缓存失败时的降级处理:

```typescript
export async function getDataWithFallback<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const cached = unstable_cache(fetcher, [cacheKey], { revalidate: 3600 });
    return await cached();
  } catch (error) {
    console.error(`Cache failed for ${cacheKey}:`, error);
    return fallback;
  }
}

// 使用
const products = await getDataWithFallback(
  "products",
  () => db.product.findMany(),
  [] // 失败时返回空数组
);
```

## 缓存键设计最佳实践

### 缓存键命名规范

| 规范         | 说明                   | 示例              |
| ------------ | ---------------------- | ----------------- |
| 使用小写     | 所有缓存键使用小写字母 | `user-profile`    |
| 使用连字符   | 单词之间使用连字符分隔 | `product-list`    |
| 包含资源类型 | 键名包含资源类型       | `post-detail`     |
| 包含参数     | 动态参数包含在键中     | `user-${userId}`  |
| 避免特殊字符 | 不使用特殊字符         | ❌ `user@profile` |

### 缓存键层次结构

```typescript
// 顶层键 - 资源类型
["products"][
  // 中层键 - 资源分类
  ("products", "category-electronics")
][
  // 底层键 - 具体资源
  ("products", "product-123")
];

// 完整示例
export const getProduct = unstable_cache(
  async (id: string) => {
    return await db.product.findUnique({ where: { id } });
  },
  (id: string) => ["products", `product-${id}`],
  {
    tags: (id: string) => ["products", `product-${id}`],
    revalidate: 1800,
  }
);
```

## 适用场景

### 数据库查询缓存场景

| 场景     | 缓存时间  | 说明               |
| -------- | --------- | ------------------ |
| 用户资料 | 30 分钟   | 用户信息变化不频繁 |
| 产品列表 | 1 小时    | 产品数据相对稳定   |
| 文章内容 | 30 分钟   | 文章发布后很少修改 |
| 配置数据 | 24 小时   | 配置很少变化       |
| 统计数据 | 5-15 分钟 | 需要相对实时的数据 |

### 第三方 API 缓存场景

| 场景     | 缓存时间 | 说明               |
| -------- | -------- | ------------------ |
| 天气数据 | 30 分钟  | 天气变化不太快     |
| 汇率数据 | 1 小时   | 汇率每小时更新     |
| 新闻数据 | 15 分钟  | 新闻更新较频繁     |
| 股票价格 | 1 分钟   | 需要接近实时的数据 |
| 地图数据 | 24 小时  | 地图数据很少变化   |

### 计算结果缓存场景

| 场景     | 缓存时间 | 说明                 |
| -------- | -------- | -------------------- |
| 用户画像 | 24 小时  | 用户画像计算复杂     |
| 推荐算法 | 1 小时   | 推荐结果需要定期更新 |
| 数据分析 | 30 分钟  | 分析结果计算耗时     |
| 报表生成 | 1 小时   | 报表生成消耗资源     |
| 搜索索引 | 15 分钟  | 搜索索引需要定期更新 |

## 注意事项

### 1. unstable 前缀的含义

unstable_cache API 带有 `unstable` 前缀,表示这个 API 可能在未来版本中发生变化:

```typescript
// 建议封装使用
// lib/cache.ts
export { unstable_cache as cache } from "next/cache";

// 使用时
import { cache } from "@/lib/cache";

export const getData = cache(
  async () => {
    return await db.query();
  },
  ["data"],
  { revalidate: 3600 }
);
```

这样做的好处:

- 如果 API 名称变化,只需修改一处
- 可以添加自定义逻辑
- 更容易迁移到稳定版本

### 2. 缓存键的唯一性

确保缓存键在整个应用中是唯一的:

```typescript
// ❌ 可能冲突的缓存键
export const getUser = unstable_cache(
  async (id: string) => await db.user.findUnique({ where: { id } }),
  ["data"], // 太通用
  { revalidate: 3600 }
);

export const getPost = unstable_cache(
  async (id: string) => await db.post.findUnique({ where: { id } }),
  ["data"], // 与上面冲突!
  { revalidate: 3600 }
);

// ✅ 唯一的缓存键
export const getUser = unstable_cache(
  async (id: string) => await db.user.findUnique({ where: { id } }),
  (id: string) => ["user", id],
  { revalidate: 3600 }
);

export const getPost = unstable_cache(
  async (id: string) => await db.post.findUnique({ where: { id } }),
  (id: string) => ["post", id],
  { revalidate: 3600 }
);
```

### 3. 参数序列化

传递给缓存函数的参数必须可序列化:

```typescript
// ❌ 不可序列化的参数
export const getData = unstable_cache(
  async (options: { filter: (item: any) => boolean }) => {
    // filter 函数无法序列化
    return data.filter(options.filter);
  },
  ["data"],
  { revalidate: 3600 }
);

// ✅ 可序列化的参数
export const getData = unstable_cache(
  async (filterType: "active" | "inactive") => {
    return data.filter((item) => {
      if (filterType === "active") return item.active;
      return !item.active;
    });
  },
  (filterType) => ["data", filterType],
  { revalidate: 3600 }
);
```

### 4. 缓存大小限制

注意缓存的数据大小,避免缓存过大的数据:

```typescript
// ❌ 缓存大量数据
export const getAllUsers = unstable_cache(
  async () => {
    // 可能返回数万条记录
    return await db.user.findMany();
  },
  ["all-users"],
  { revalidate: 3600 }
);

// ✅ 限制返回数据量
export const getUsers = unstable_cache(
  async (page: number = 1, limit: number = 100) => {
    return await db.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
  },
  (page, limit) => ["users", `page-${page}`, `limit-${limit}`],
  { revalidate: 3600 }
);
```

### 5. 标签管理

合理使用标签进行缓存管理:

```typescript
// 使用层次化的标签
export const getProduct = unstable_cache(
  async (id: string) => {
    return await db.product.findUnique({ where: { id } });
  },
  (id) => ["product", id],
  {
    tags: (id) => [
      "products", // 顶层标签 - 所有产品
      `product-${id}`, // 具体产品标签
    ],
    revalidate: 1800,
  }
);

// 失效时可以选择性失效
revalidateTag(`product-${id}`); // 只失效特定产品
revalidateTag("products"); // 失效所有产品
```

## 常见问题

### 1. unstable_cache 和 React cache 有什么区别?

**问题**: 这两个缓存 API 有什么不同?

**解答**:

| 特性     | unstable_cache       | React cache      |
| -------- | -------------------- | ---------------- |
| 作用范围 | 跨请求缓存           | 单次请求内缓存   |
| 持久化   | 持久化到磁盘         | 仅内存缓存       |
| 失效控制 | 支持标签失效         | 请求结束自动清除 |
| 使用场景 | 数据库查询、API 请求 | 组件内重复调用   |

```typescript
// React cache - 单次请求内去重
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});

// unstable_cache - 跨请求缓存
import { unstable_cache } from "next/cache";

export const getUser = unstable_cache(
  async (id: string) => {
    return await db.user.findUnique({ where: { id } });
  },
  ["user"],
  { revalidate: 3600 }
);
```

### 2. 如何调试缓存是否生效?

**问题**: 如何确认数据是从缓存返回的?

**解答**:

添加日志和时间戳:

```typescript
export const getData = unstable_cache(
  async () => {
    console.log("[Cache Miss] Fetching data from database");
    const startTime = Date.now();

    const data = await db.query();

    console.log(`[Cache Miss] Query took ${Date.now() - startTime}ms`);
    return data;
  },
  ["data"],
  { revalidate: 3600 }
);

// 第一次调用 - 输出日志
await getData(); // [Cache Miss] Fetching data from database

// 第二次调用 - 无日志(从缓存返回)
await getData(); // 无输出
```

### 3. 如何处理缓存的错误?

**问题**: 如果缓存的函数抛出错误怎么办?

**解答**:

添加错误处理和降级逻辑:

```typescript
export const getDataWithErrorHandling = unstable_cache(
  async () => {
    try {
      const data = await db.query();
      return { success: true, data };
    } catch (error) {
      console.error("Database query failed:", error);
      return { success: false, data: null };
    }
  },
  ["data"],
  { revalidate: 3600 }
);

// 使用时
const result = await getDataWithErrorHandling();
if (result.success) {
  // 使用数据
} else {
  // 显示错误或使用默认数据
}
```

### 4. 可以缓存用户特定的数据吗?

**问题**: 如何缓存每个用户不同的数据?

**解答**:

将用户 ID 包含在缓存键中:

```typescript
export const getUserData = unstable_cache(
  async (userId: string) => {
    return await db.user.findUnique({
      where: { id: userId },
      include: { posts: true },
    });
  },
  (userId) => ["user-data", userId], // 每个用户独立的缓存键
  {
    tags: (userId) => ["users", `user-${userId}`],
    revalidate: 1800,
  }
);
```

### 5. 如何在 Server Action 中使用 unstable_cache?

**问题**: Server Action 中可以使用缓存吗?

**解答**:

可以,但要注意 Server Action 通常用于修改数据:

```typescript
// app/actions.ts
"use server";

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// 读取数据 - 可以缓存
export const getData = unstable_cache(
  async () => {
    return await db.data.findMany();
  },
  ["data"],
  { revalidate: 3600 }
);

// 修改数据 - 不应该缓存
export async function updateData(id: string, newData: any) {
  await db.data.update({
    where: { id },
    data: newData,
  });

  // 失效相关缓存
  revalidateTag("data");

  return { success: true };
}
```

### 6. 缓存会占用多少磁盘空间?

**问题**: 缓存数据存储在哪里?会占用多少空间?

**解答**:

Next.js 将缓存存储在 `.next/cache` 目录:

```bash
# 查看缓存大小
du -sh .next/cache

# 清除缓存
rm -rf .next/cache
```

建议:

- 定期监控缓存大小
- 设置合理的 revalidate 时间
- 避免缓存大量数据
- 在 CI/CD 中清除缓存

### 7. 如何实现缓存预热?

**问题**: 如何在应用启动时预先加载缓存?

**解答**:

使用 instrumentation.ts:

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmupCache } = await import("./lib/cache-warmup");
    await warmupCache();
  }
}

// lib/cache-warmup.ts
import { getStaticConfig, getCategories } from "./data";

export async function warmupCache() {
  console.log("Warming up cache...");

  try {
    await Promise.all([getStaticConfig(), getCategories()]);

    console.log("Cache warmup completed");
  } catch (error) {
    console.error("Cache warmup failed:", error);
  }
}
```

### 8. 如何处理缓存雪崩?

**问题**: 大量缓存同时失效怎么办?

**解答**:

使用随机化的 revalidate 时间:

```typescript
function getRandomRevalidate(base: number, variance: number = 0.1) {
  const min = base * (1 - variance);
  const max = base * (1 + variance);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getData = unstable_cache(
  async () => {
    return await db.query();
  },
  ["data"],
  {
    revalidate: getRandomRevalidate(3600), // 3600 ± 10%
  }
);
```

### 9. 可以在客户端组件中使用 unstable_cache 吗?

**问题**: 客户端组件能使用这个 API 吗?

**解答**:

不可以。unstable_cache 只能在服务端使用:

```typescript
// ❌ 客户端组件
"use client";

import { unstable_cache } from "next/cache"; // 错误!

export default function ClientComponent() {
  // 无法使用
}

// ✅ 服务端组件
import { unstable_cache } from "next/cache";

export const getData = unstable_cache(async () => await db.query(), ["data"], {
  revalidate: 3600,
});

export default async function ServerComponent() {
  const data = await getData();
  return <div>{/* ... */}</div>;
}
```

### 10. 如何监控缓存命中率?

**问题**: 如何知道缓存的效果如何?

**解答**:

添加监控逻辑:

```typescript
// lib/cache-monitor.ts
let cacheHits = 0;
let cacheMisses = 0;

export function recordCacheHit() {
  cacheHits++;
}

export function recordCacheMiss() {
  cacheMisses++;
}

export function getCacheStats() {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? ((cacheHits / total) * 100).toFixed(2) : 0;

  return {
    hits: cacheHits,
    misses: cacheMisses,
    total,
    hitRate: `${hitRate}%`,
  };
}

// 使用
export const getData = unstable_cache(
  async () => {
    recordCacheMiss();
    return await db.query();
  },
  ["data"],
  { revalidate: 3600 }
);
```

## 总结

unstable_cache 是 Next.js 16 中强大的函数级缓存 API,通过本文的学习,我们掌握了:

### 核心概念

1. **函数级缓存**: 可以缓存任何异步函数的返回值
2. **灵活配置**: 支持自定义缓存键、标签和重新验证时间
3. **标签管理**: 通过标签实现精确的缓存失效控制
4. **持久化**: 缓存数据持久化到磁盘,跨请求共享
5. **类型安全**: 完整的 TypeScript 类型支持

### 实战应用

我们通过四个实战场景学习了 unstable_cache 的应用:

1. **电商产品数据缓存**: 产品列表、详情、推荐、搜索
2. **博客内容管理**: 文章列表、详情、分类、标签、热门文章
3. **用户数据缓存**: 用户资料、设置、活动历史、通知
4. **第三方 API 集成**: 天气、汇率、新闻、股票数据

### 高级策略

1. **动态缓存键生成**: 根据参数动态生成唯一的缓存键
2. **条件缓存**: 根据条件决定是否缓存数据
3. **分层缓存**: 不同类型数据使用不同的缓存时间
4. **缓存预热**: 应用启动时预先加载常用数据
5. **缓存降级**: 缓存失败时的降级处理策略

### 缓存键设计

| 规范         | 说明                   | 示例                          |
| ------------ | ---------------------- | ----------------------------- |
| 使用小写     | 所有缓存键使用小写字母 | `user-profile`                |
| 使用连字符   | 单词之间使用连字符分隔 | `product-list`                |
| 包含资源类型 | 键名包含资源类型       | `post-detail`                 |
| 包含参数     | 动态参数包含在键中     | `user-${userId}`              |
| 层次结构     | 使用层次化的键结构     | `['products', 'product-123']` |

### 适用场景

unstable_cache 特别适合以下场景:

- **数据库查询**: 用户资料、产品列表、文章内容等
- **第三方 API**: 天气数据、汇率、新闻、股票价格等
- **复杂计算**: 用户画像、推荐算法、数据分析、报表生成等
- **文件系统**: Markdown 文件、配置文件、静态资源等

### 注意事项

1. **unstable 前缀**: API 可能变化,建议封装使用
2. **缓存键唯一性**: 确保缓存键在整个应用中唯一
3. **参数序列化**: 参数必须可序列化
4. **缓存大小**: 避免缓存过大的数据
5. **标签管理**: 使用层次化的标签结构

### 常见问题解答

我们回答了 10 个常见问题,涵盖:

- 与 React cache 的区别
- 调试缓存是否生效
- 错误处理
- 用户特定数据缓存
- Server Action 中的使用
- 磁盘空间占用
- 缓存预热
- 缓存雪崩处理
- 客户端组件限制
- 缓存命中率监控

### 最佳实践

1. **合理设置缓存时间**: 根据数据变化频率设置 revalidate
2. **使用标签管理**: 通过标签实现精确的缓存失效
3. **限制数据量**: 避免缓存大量数据
4. **添加监控**: 监控缓存命中率和性能
5. **错误处理**: 添加降级逻辑处理缓存失败
6. **缓存预热**: 预先加载常用数据
7. **避免雪崩**: 使用随机化的重新验证时间

### 性能优化

使用 unstable_cache 可以显著提升应用性能:

- **减少数据库查询**: 缓存查询结果,减少数据库负载
- **降低 API 调用**: 缓存第三方 API 响应,节省成本
- **加快页面渲染**: 从缓存快速获取数据
- **提升用户体验**: 更快的响应时间

### 与其他缓存方案对比

| 方案           | 作用范围  | 持久化 | 失效控制  | 适用场景             |
| -------------- | --------- | ------ | --------- | -------------------- |
| unstable_cache | 跨请求    | 是     | 标签/时间 | 数据库查询、API 请求 |
| React cache    | 单次请求  | 否     | 自动      | 组件内去重           |
| fetch cache    | HTTP 请求 | 是     | 时间      | HTTP 请求            |
| revalidateTag  | 失效控制  | -      | 标签      | 缓存失效             |

通过合理使用 unstable_cache,可以构建高性能的 Next.js 应用。关键是要理解应用的数据特点,为不同类型的数据选择合适的缓存策略,并通过标签实现精确的缓存管理。

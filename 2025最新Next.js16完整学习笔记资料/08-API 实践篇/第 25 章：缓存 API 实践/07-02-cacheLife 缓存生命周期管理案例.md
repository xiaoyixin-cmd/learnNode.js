**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# cacheLife 缓存生命周期管理案例

## 概述

cacheLife 是 Next.js 16 引入的新 API,用于更精细地控制缓存的生命周期。与传统的 revalidate 选项相比,cacheLife 提供了更灵活的缓存策略配置,可以针对不同类型的数据设置不同的缓存时间和重新验证策略。

### cacheLife 的核心特点

1. **预定义缓存配置**: 可以定义多个命名的缓存配置,在应用中复用
2. **灵活的时间控制**: 支持 stale、revalidate、expire 三个时间参数
3. **类型安全**: 完全支持 TypeScript 类型推导
4. **与 fetch 集成**: 可以在 fetch 请求中直接使用
5. **与 unstable_cache 集成**: 可以在缓存函数中使用

### cacheLife 的三个时间参数

| 参数       | 说明                   | 默认值          | 作用                       |
| ---------- | ---------------------- | --------------- | -------------------------- |
| stale      | 数据被认为是新鲜的时间 | 0               | 在此时间内直接返回缓存     |
| revalidate | 后台重新验证的时间     | 900 (15 分钟)   | 在此时间后后台重新获取数据 |
| expire     | 缓存完全过期的时间     | 2592000 (30 天) | 超过此时间缓存被删除       |

## 基本使用

### 定义缓存配置

```typescript
// next.config.js
module.exports = {
  experimental: {
    dynamicIO: true,
  },
  cacheLife: {
    // 频繁更新的数据
    frequent: {
      stale: 60, // 1分钟内认为是新鲜的
      revalidate: 300, // 5分钟后后台重新验证
      expire: 3600, // 1小时后完全过期
    },

    // 中等更新频率的数据
    moderate: {
      stale: 300, // 5分钟内认为是新鲜的
      revalidate: 900, // 15分钟后后台重新验证
      expire: 86400, // 1天后完全过期
    },

    // 很少更新的数据
    rare: {
      stale: 3600, // 1小时内认为是新鲜的
      revalidate: 86400, // 1天后后台重新验证
      expire: 604800, // 7天后完全过期
    },

    // 静态数据
    static: {
      stale: 86400, // 1天内认为是新鲜的
      revalidate: 604800, // 7天后后台重新验证
      expire: 2592000, // 30天后完全过期
    },
  },
};
```

### 在 fetch 中使用

```typescript
// app/products/page.tsx
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: {
      cacheLife: "moderate",
    },
  });

  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

### 在 unstable_cache 中使用

```typescript
// lib/cache.ts
import { unstable_cache } from "next/cache";

export const getCachedUser = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    return user;
  },
  ["user"],
  {
    cacheLife: "moderate",
    tags: ["users"],
  }
);
```

## 实战场景一:电商产品数据分层缓存

### 场景描述

电商网站中,不同类型的数据更新频率不同。产品基本信息很少变化,价格和库存经常变化,促销信息实时变化。使用 cacheLife 可以为不同数据设置不同的缓存策略。

### 缓存配置设计

```typescript
// next.config.js
module.exports = {
  experimental: {
    dynamicIO: true,
  },
  cacheLife: {
    // 产品基本信息 - 很少变化
    productInfo: {
      stale: 3600, // 1小时
      revalidate: 86400, // 1天
      expire: 604800, // 7天
    },

    // 价格信息 - 经常变化
    pricing: {
      stale: 60, // 1分钟
      revalidate: 300, // 5分钟
      expire: 3600, // 1小时
    },

    // 库存信息 - 频繁变化
    inventory: {
      stale: 30, // 30秒
      revalidate: 60, // 1分钟
      expire: 300, // 5分钟
    },

    // 促销信息 - 实时变化
    promotion: {
      stale: 0, // 立即过期
      revalidate: 30, // 30秒
      expire: 60, // 1分钟
    },

    // 产品评论 - 中等频率
    reviews: {
      stale: 600, // 10分钟
      revalidate: 1800, // 30分钟
      expire: 86400, // 1天
    },
  },
};
```

### 数据获取实现

```typescript
// lib/product-data.ts
import { unstable_cache } from "next/cache";

// 产品基本信息
export const getProductInfo = unstable_cache(
  async (productId: string) => {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        category: true,
        brand: true,
        specifications: true,
      },
    });
    return product;
  },
  ["product-info"],
  {
    cacheLife: "productInfo",
    tags: ["products", `product-${productId}`],
  }
);

// 价格信息
export const getProductPrice = unstable_cache(
  async (productId: string) => {
    const price = await db.product.findUnique({
      where: { id: productId },
      select: {
        price: true,
        originalPrice: true,
        discount: true,
      },
    });
    return price;
  },
  ["product-price"],
  {
    cacheLife: "pricing",
    tags: ["prices", `price-${productId}`],
  }
);

// 库存信息
export const getProductInventory = unstable_cache(
  async (productId: string) => {
    const inventory = await db.product.findUnique({
      where: { id: productId },
      select: {
        stock: true,
        available: true,
        reserved: true,
      },
    });
    return inventory;
  },
  ["product-inventory"],
  {
    cacheLife: "inventory",
    tags: ["inventory", `inventory-${productId}`],
  }
);

// 促销信息
export const getProductPromotion = unstable_cache(
  async (productId: string) => {
    const promotion = await db.promotion.findFirst({
      where: {
        productId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        active: true,
      },
    });
    return promotion;
  },
  ["product-promotion"],
  {
    cacheLife: "promotion",
    tags: ["promotions", `promotion-${productId}`],
  }
);

// 产品评论
export const getProductReviews = unstable_cache(
  async (productId: string, page: number = 1) => {
    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      skip: (page - 1) * 10,
    });
    return reviews;
  },
  ["product-reviews"],
  {
    cacheLife: "reviews",
    tags: ["reviews", `reviews-${productId}`],
  }
);
```

### 页面组合使用

```typescript
// app/products/[id]/page.tsx
import {
  getProductInfo,
  getProductPrice,
  getProductInventory,
  getProductPromotion,
  getProductReviews,
} from "@/lib/product-data";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // 并行获取所有数据,每个都有自己的缓存策略
  const [info, price, inventory, promotion, reviews] = await Promise.all([
    getProductInfo(params.id),
    getProductPrice(params.id),
    getProductInventory(params.id),
    getProductPromotion(params.id),
    getProductReviews(params.id),
  ]);

  return (
    <div>
      <ProductHeader info={info} />
      <ProductPrice price={price} promotion={promotion} />
      <ProductInventory inventory={inventory} />
      <ProductReviews reviews={reviews} />
    </div>
  );
}
```

### 缓存更新策略

```typescript
// app/actions/product-actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function updateProductInfo(
  productId: string,
  data: ProductInfoData
) {
  await db.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      description: data.description,
      images: data.images,
    },
  });

  // 只重新验证产品信息缓存
  revalidateTag("products");
  revalidateTag(`product-${productId}`);
}

export async function updateProductPrice(productId: string, price: number) {
  await db.product.update({
    where: { id: productId },
    data: { price },
  });

  // 只重新验证价格缓存
  revalidateTag("prices");
  revalidateTag(`price-${productId}`);
}

export async function updateProductInventory(productId: string, stock: number) {
  await db.product.update({
    where: { id: productId },
    data: { stock },
  });

  // 只重新验证库存缓存
  revalidateTag("inventory");
  revalidateTag(`inventory-${productId}`);
}

export async function createPromotion(productId: string, data: PromotionData) {
  await db.promotion.create({
    data: {
      productId,
      ...data,
    },
  });

  // 只重新验证促销缓存
  revalidateTag("promotions");
  revalidateTag(`promotion-${productId}`);
}
```

## 实战场景二:内容管理系统的缓存策略

### 场景描述

内容管理系统中,文章内容、评论、统计数据的更新频率不同。使用 cacheLife 可以为每种数据类型设置合适的缓存时间。

### 缓存配置

```typescript
// next.config.js
module.exports = {
  experimental: {
    dynamicIO: true,
  },
  cacheLife: {
    // 文章内容 - 很少修改
    article: {
      stale: 1800, // 30分钟
      revalidate: 3600, // 1小时
      expire: 86400, // 1天
    },

    // 文章列表 - 经常更新
    articleList: {
      stale: 300, // 5分钟
      revalidate: 600, // 10分钟
      expire: 3600, // 1小时
    },

    // 评论 - 频繁更新
    comments: {
      stale: 60, // 1分钟
      revalidate: 300, // 5分钟
      expire: 1800, // 30分钟
    },

    // 统计数据 - 实时性要求不高
    statistics: {
      stale: 600, // 10分钟
      revalidate: 1800, // 30分钟
      expire: 86400, // 1天
    },

    // 作者信息 - 很少变化
    author: {
      stale: 3600, // 1小时
      revalidate: 86400, // 1天
      expire: 604800, // 7天
    },
  },
};
```

### 数据获取实现

```typescript
// lib/blog-data.ts
import { unstable_cache } from "next/cache";

// 文章内容
export const getArticle = unstable_cache(
  async (slug: string) => {
    const article = await db.article.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        tags: true,
      },
    });
    return article;
  },
  ["article"],
  {
    cacheLife: "article",
    tags: ["articles", `article-${slug}`],
  }
);

// 文章列表
export const getArticleList = unstable_cache(
  async (page: number = 1, limit: number = 10) => {
    const articles = await db.article.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    });
    return articles;
  },
  ["article-list"],
  {
    cacheLife: "articleList",
    tags: ["articles"],
  }
);

// 文章评论
export const getArticleComments = unstable_cache(
  async (articleId: string) => {
    const comments = await db.comment.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return comments;
  },
  ["article-comments"],
  {
    cacheLife: "comments",
    tags: ["comments", `comments-${articleId}`],
  }
);

// 文章统计
export const getArticleStatistics = unstable_cache(
  async (articleId: string) => {
    const stats = await db.article.findUnique({
      where: { id: articleId },
      select: {
        viewCount: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
      },
    });
    return stats;
  },
  ["article-statistics"],
  {
    cacheLife: "statistics",
    tags: ["statistics", `statistics-${articleId}`],
  }
);

// 作者信息
export const getAuthor = unstable_cache(
  async (authorId: string) => {
    const author = await db.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        socialLinks: true,
      },
    });
    return author;
  },
  ["author"],
  {
    cacheLife: "author",
    tags: ["authors", `author-${authorId}`],
  }
);
```

### 页面实现

```typescript
// app/blog/[slug]/page.tsx
import {
  getArticle,
  getArticleComments,
  getArticleStatistics,
  getAuthor,
} from "@/lib/blog-data";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  // 并行获取其他数据
  const [comments, statistics, author] = await Promise.all([
    getArticleComments(article.id),
    getArticleStatistics(article.id),
    getAuthor(article.authorId),
  ]);

  return (
    <article>
      <ArticleHeader article={article} author={author} />
      <ArticleContent content={article.content} />
      <ArticleStatistics stats={statistics} />
      <ArticleComments comments={comments} articleId={article.id} />
    </article>
  );
}
```

## 实战场景三:API 数据缓存策略

### 场景描述

调用外部 API 时,不同接口的数据更新频率不同,使用 cacheLife 可以为每个 API 设置合适的缓存时间,减少 API 调用次数。

### 缓存配置

```typescript
// next.config.js
module.exports = {
  experimental: {
    dynamicIO: true,
  },
  cacheLife: {
    // 天气数据 - 每小时更新
    weather: {
      stale: 1800, // 30分钟
      revalidate: 3600, // 1小时
      expire: 7200, // 2小时
    },

    // 汇率数据 - 每天更新
    exchangeRate: {
      stale: 21600, // 6小时
      revalidate: 43200, // 12小时
      expire: 86400, // 1天
    },

    // 新闻数据 - 频繁更新
    news: {
      stale: 300, // 5分钟
      revalidate: 600, // 10分钟
      expire: 1800, // 30分钟
    },

    // 股票数据 - 实时更新
    stock: {
      stale: 0, // 立即过期
      revalidate: 60, // 1分钟
      expire: 300, // 5分钟
    },

    // 配置数据 - 很少变化
    config: {
      stale: 86400, // 1天
      revalidate: 604800, // 7天
      expire: 2592000, // 30天
    },
  },
};
```

### API 调用实现

```typescript
// lib/api-client.ts

// 天气数据
export async function getWeather(city: string) {
  const res = await fetch(`https://api.weather.com/v1/current?city=${city}`, {
    next: {
      cacheLife: "weather",
      tags: ["weather", `weather-${city}`],
    },
  });

  return res.json();
}

// 汇率数据
export async function getExchangeRate(from: string, to: string) {
  const res = await fetch(
    `https://api.exchange.com/v1/rate?from=${from}&to=${to}`,
    {
      next: {
        cacheLife: "exchangeRate",
        tags: ["exchange-rate", `rate-${from}-${to}`],
      },
    }
  );

  return res.json();
}

// 新闻数据
export async function getNews(category: string, page: number = 1) {
  const res = await fetch(
    `https://api.news.com/v1/articles?category=${category}&page=${page}`,
    {
      next: {
        cacheLife: "news",
        tags: ["news", `news-${category}`],
      },
    }
  );

  return res.json();
}

// 股票数据
export async function getStockPrice(symbol: string) {
  const res = await fetch(`https://api.stock.com/v1/quote?symbol=${symbol}`, {
    next: {
      cacheLife: "stock",
      tags: ["stock", `stock-${symbol}`],
    },
  });

  return res.json();
}

// 配置数据
export async function getAppConfig() {
  const res = await fetch("https://api.example.com/v1/config", {
    next: {
      cacheLife: "config",
      tags: ["config"],
    },
  });

  return res.json();
}
```

### 使用示例

```typescript
// app/dashboard/page.tsx
import {
  getWeather,
  getExchangeRate,
  getNews,
  getStockPrice,
} from "@/lib/api-client";

export default async function DashboardPage() {
  // 并行获取所有数据,每个都有自己的缓存策略
  const [weather, exchangeRate, news, stocks] = await Promise.all([
    getWeather("Beijing"),
    getExchangeRate("USD", "CNY"),
    getNews("technology"),
    Promise.all([
      getStockPrice("AAPL"),
      getStockPrice("GOOGL"),
      getStockPrice("MSFT"),
    ]),
  ]);

  return (
    <div>
      <WeatherWidget data={weather} />
      <ExchangeRateWidget rate={exchangeRate} />
      <NewsWidget articles={news} />
      <StockWidget stocks={stocks} />
    </div>
  );
}
```

## 实战场景四:用户数据缓存策略

### 场景描述

用户相关的数据有不同的访问频率和更新频率。个人资料很少变化,用户设置偶尔变化,用户活动频繁变化。

### 缓存配置

```typescript
// next.config.js
module.exports = {
  experimental: {
    dynamicIO: true,
  },
  cacheLife: {
    // 用户资料 - 很少变化
    userProfile: {
      stale: 3600, // 1小时
      revalidate: 86400, // 1天
      expire: 604800, // 7天
    },

    // 用户设置 - 偶尔变化
    userSettings: {
      stale: 1800, // 30分钟
      revalidate: 3600, // 1小时
      expire: 86400, // 1天
    },

    // 用户活动 - 频繁变化
    userActivity: {
      stale: 60, // 1分钟
      revalidate: 300, // 5分钟
      expire: 1800, // 30分钟
    },

    // 用户通知 - 实时性要求高
    userNotifications: {
      stale: 0, // 立即过期
      revalidate: 30, // 30秒
      expire: 300, // 5分钟
    },

    // 用户权限 - 中等频率
    userPermissions: {
      stale: 600, // 10分钟
      revalidate: 1800, // 30分钟
      expire: 86400, // 1天
    },
  },
};
```

### 数据获取实现

```typescript
// lib/user-data.ts
import { unstable_cache } from "next/cache";

// 用户资料
export const getUserProfile = unstable_cache(
  async (userId: string) => {
    const profile = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        socialLinks: true,
      },
    });
    return profile;
  },
  ["user-profile"],
  {
    cacheLife: "userProfile",
    tags: ["users", `user-${userId}`],
  }
);

// 用户设置
export const getUserSettings = unstable_cache(
  async (userId: string) => {
    const settings = await db.userSettings.findUnique({
      where: { userId },
    });
    return settings;
  },
  ["user-settings"],
  {
    cacheLife: "userSettings",
    tags: ["user-settings", `settings-${userId}`],
  }
);

// 用户活动
export const getUserActivity = unstable_cache(
  async (userId: string, limit: number = 20) => {
    const activities = await db.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return activities;
  },
  ["user-activity"],
  {
    cacheLife: "userActivity",
    tags: ["user-activity", `activity-${userId}`],
  }
);

// 用户通知
export const getUserNotifications = unstable_cache(
  async (userId: string) => {
    const notifications = await db.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: { createdAt: "desc" },
    });
    return notifications;
  },
  ["user-notifications"],
  {
    cacheLife: "userNotifications",
    tags: ["notifications", `notifications-${userId}`],
  }
);

// 用户权限
export const getUserPermissions = unstable_cache(
  async (userId: string) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
    return user?.role?.permissions || [];
  },
  ["user-permissions"],
  {
    cacheLife: "userPermissions",
    tags: ["permissions", `permissions-${userId}`],
  }
);
```

## 缓存策略对比

### 不同场景的缓存时间建议

| 数据类型 | stale   | revalidate | expire  | 适用场景       |
| -------- | ------- | ---------- | ------- | -------------- |
| 静态内容 | 1 天    | 7 天       | 30 天   | 文档、帮助页面 |
| 产品信息 | 1 小时  | 1 天       | 7 天    | 电商产品详情   |
| 价格库存 | 1 分钟  | 5 分钟     | 1 小时  | 电商价格、库存 |
| 用户资料 | 1 小时  | 1 天       | 7 天    | 用户个人信息   |
| 文章内容 | 30 分钟 | 1 小时     | 1 天    | 博客文章       |
| 评论数据 | 1 分钟  | 5 分钟     | 30 分钟 | 用户评论       |
| 实时数据 | 0 秒    | 30 秒      | 5 分钟  | 股票、体育比分 |
| API 数据 | 30 分钟 | 1 小时     | 2 小时  | 第三方 API     |
| 配置数据 | 1 天    | 7 天       | 30 天   | 应用配置       |

### cacheLife vs revalidate 对比

| 特性     | cacheLife                         | revalidate            |
| -------- | --------------------------------- | --------------------- |
| 配置方式 | 预定义配置,可复用                 | 每次单独指定          |
| 时间控制 | 三个参数(stale/revalidate/expire) | 单个参数              |
| 灵活性   | 更灵活,可针对不同数据类型         | 较简单                |
| 类型安全 | 完全类型安全                      | 基本类型安全          |
| 使用场景 | 复杂应用,多种数据类型             | 简单应用,统一缓存策略 |

```typescript
// 使用 cacheLife
const res = await fetch(url, {
  next: {
    cacheLife: "moderate", // 使用预定义配置
  },
});

// 使用 revalidate
const res = await fetch(url, {
  next: {
    revalidate: 900, // 直接指定秒数
  },
});
```

## 适用场景

### 电商平台

| 场景     | 推荐配置    | 说明                                |
| -------- | ----------- | ----------------------------------- |
| 产品详情 | productInfo | 产品基本信息很少变化,可以长时间缓存 |
| 价格显示 | pricing     | 价格经常调整,需要较短的缓存时间     |
| 库存状态 | inventory   | 库存频繁变化,需要很短的缓存时间     |
| 促销活动 | promotion   | 促销实时性要求高,几乎不缓存         |
| 用户评论 | reviews     | 评论中等频率更新,适中的缓存时间     |

### 内容管理系统

| 场景     | 推荐配置    | 说明                                |
| -------- | ----------- | ----------------------------------- |
| 文章内容 | article     | 文章发布后很少修改,可以较长时间缓存 |
| 文章列表 | articleList | 列表经常更新,需要较短的缓存时间     |
| 评论区   | comments    | 评论频繁更新,需要短缓存时间         |
| 作者信息 | author      | 作者信息很少变化,可以长时间缓存     |
| 统计数据 | statistics  | 统计数据实时性要求不高,适中缓存     |

### API 集成应用

| 场景     | 推荐配置     | 说明                       |
| -------- | ------------ | -------------------------- |
| 天气数据 | weather      | 每小时更新,缓存 1 小时合适 |
| 汇率数据 | exchangeRate | 每天更新,可以缓存较长时间  |
| 新闻数据 | news         | 频繁更新,需要短缓存时间    |
| 股票数据 | stock        | 实时数据,几乎不缓存        |
| 配置数据 | config       | 很少变化,可以长时间缓存    |

### 用户系统

| 场景     | 推荐配置          | 说明                            |
| -------- | ----------------- | ------------------------------- |
| 用户资料 | userProfile       | 个人资料很少变化,可以长时间缓存 |
| 用户设置 | userSettings      | 设置偶尔变化,适中缓存时间       |
| 用户活动 | userActivity      | 活动频繁,需要短缓存时间         |
| 用户通知 | userNotifications | 实时性要求高,几乎不缓存         |
| 用户权限 | userPermissions   | 权限中等频率变化,适中缓存       |

## 注意事项

### 1. 启用 dynamicIO 实验性功能

cacheLife 需要启用 dynamicIO 实验性功能:

```typescript
// next.config.js
module.exports = {
  experimental: {
    dynamicIO: true, // 必须启用
  },
  cacheLife: {
    // 配置...
  },
};
```

### 2. 合理设置三个时间参数

三个时间参数的关系应该是: stale < revalidate < expire

```typescript
// ✅ 正确的配置
{
  stale: 300,       // 5分钟
  revalidate: 900,  // 15分钟
  expire: 3600      // 1小时
}

// ❌ 错误的配置
{
  stale: 900,       // 15分钟
  revalidate: 300,  // 5分钟 - 小于 stale
  expire: 3600      // 1小时
}
```

### 3. 配置名称要有意义

使用描述性的配置名称,便于理解和维护:

```typescript
// ✅ 好的命名
cacheLife: {
  productInfo: { ... },
  pricing: { ... },
  inventory: { ... }
}

// ❌ 不好的命名
cacheLife: {
  config1: { ... },
  config2: { ... },
  config3: { ... }
}
```

### 4. 结合 tags 使用

cacheLife 应该与 tags 结合使用,以便精确控制缓存重新验证:

```typescript
export const getProduct = unstable_cache(
  async (id: string) => {
    return await db.product.findUnique({ where: { id } });
  },
  ["product"],
  {
    cacheLife: "productInfo",
    tags: ["products", `product-${id}`], // 添加标签
  }
);

// 更新产品时重新验证
export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`); // 立即重新验证
}
```

### 5. 注意缓存大小

长时间缓存大量数据可能占用过多内存:

```typescript
// ⚠️ 注意:缓存大量数据
export const getAllProducts = unstable_cache(
  async () => {
    // 可能返回数千个产品
    return await db.product.findMany();
  },
  ["all-products"],
  {
    cacheLife: "static", // 30天缓存
    tags: ["products"],
  }
);

// ✅ 更好的方式:分页缓存
export const getProducts = unstable_cache(
  async (page: number, limit: number) => {
    return await db.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
  },
  ["products-page"],
  {
    cacheLife: "moderate",
    tags: ["products"],
  }
);
```

## 常见问题

### 1. cacheLife 和 revalidate 可以同时使用吗?

**问题**: 可以在同一个请求中同时使用 cacheLife 和 revalidate 吗?

**解答**:

不建议同时使用。如果同时指定,cacheLife 会优先:

```typescript
// ❌ 不推荐
const res = await fetch(url, {
  next: {
    cacheLife: "moderate",
    revalidate: 600, // 会被忽略
  },
});

// ✅ 推荐:只使用一个
const res = await fetch(url, {
  next: {
    cacheLife: "moderate",
  },
});
```

### 2. 如何为不同环境设置不同的缓存时间?

**问题**: 开发环境和生产环境需要不同的缓存时间怎么办?

**解答**:

可以根据环境变量动态配置:

```typescript
// next.config.js
const isDev = process.env.NODE_ENV === "development";

module.exports = {
  experimental: {
    dynamicIO: true,
  },
  cacheLife: {
    moderate: {
      stale: isDev ? 0 : 300,
      revalidate: isDev ? 0 : 900,
      expire: isDev ? 60 : 3600,
    },
  },
};
```

### 3. cacheLife 配置可以动态修改吗?

**问题**: 运行时可以修改 cacheLife 配置吗?

**解答**:

不可以。cacheLife 配置在构建时确定,运行时无法修改。如果需要动态控制,使用 revalidateTag:

```typescript
// ❌ 不能动态修改配置
export async function getData(id: string, urgent: boolean) {
  return unstable_cache(
    async () => await db.data.findUnique({ where: { id } }),
    ["data"],
    {
      cacheLife: urgent ? "frequent" : "moderate", // 可以根据参数选择
    }
  )();
}

// ✅ 使用 revalidateTag 动态控制
export async function getData(id: string) {
  return unstable_cache(
    async () => await db.data.findUnique({ where: { id } }),
    ["data"],
    {
      cacheLife: "moderate",
      tags: [`data-${id}`],
    }
  )();
}

// 需要时立即重新验证
export async function refreshData(id: string) {
  revalidateTag(`data-${id}`);
}
```

### 4. stale 时间设置为 0 有什么影响?

**问题**: 将 stale 设置为 0 会怎样?

**解答**:

stale 为 0 表示数据立即被认为是过期的,但仍会使用缓存并在后台重新验证:

```typescript
{
  stale: 0,         // 立即过期
  revalidate: 60,   // 1分钟后后台重新验证
  expire: 300       // 5分钟后完全删除
}

// 行为:
// 1. 第一次请求:获取新数据并缓存
// 2. 后续请求:返回缓存数据(即使stale=0),同时后台重新验证
// 3. 重新验证完成后,下次请求返回新数据
```

### 5. 如何调试 cacheLife 是否生效?

**问题**: 怎么知道 cacheLife 配置是否正确应用?

**解答**:

可以通过以下方式调试:

```typescript
// 1. 添加日志
export const getData = unstable_cache(
  async (id: string) => {
    console.log(`Fetching data for ${id} at ${new Date().toISOString()}`);
    return await db.data.findUnique({ where: { id } });
  },
  ["data"],
  {
    cacheLife: "moderate",
    tags: [`data-${id}`],
  }
);

// 2. 启用 Next.js 缓存日志
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// 3. 检查响应头
// 在浏览器开发者工具中查看 Cache-Control 头
```

### 6. 如何处理缓存预热?

**问题**: 应用启动时如何预热缓存?

**解答**:

可以在应用启动时主动调用缓存函数:

```typescript
// lib/cache-warmup.ts
import { getProductInfo, getArticleList, getAppConfig } from "@/lib/data";

export async function warmupCache() {
  try {
    // 预热常用数据
    await Promise.all([
      getAppConfig(),
      getArticleList(1, 10),
      // 预热热门产品
      ...["product-1", "product-2", "product-3"].map((id) =>
        getProductInfo(id)
      ),
    ]);

    console.log("Cache warmed up successfully");
  } catch (error) {
    console.error("Cache warmup failed:", error);
  }
}

// app/layout.tsx
export default async function RootLayout({
  children,
}: {
  children: React.Node;
}) {
  // 在服务端预热缓存
  if (typeof window === "undefined") {
    await warmupCache();
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 7. cacheLife 对 ISR 有什么影响?

**问题**: cacheLife 和 ISR (Incremental Static Regeneration) 如何配合?

**解答**:

cacheLife 主要用于数据缓存,ISR 用于页面缓存,两者可以配合使用:

```typescript
// app/products/[id]/page.tsx
import { getProductInfo } from "@/lib/product-data";

// ISR 配置
export const revalidate = 3600; // 页面每小时重新生成

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // 数据使用 cacheLife 配置
  const product = await getProductInfo(params.id);

  return <ProductDetail product={product} />;
}

// lib/product-data.ts
export const getProductInfo = unstable_cache(
  async (id: string) => {
    return await db.product.findUnique({ where: { id } });
  },
  ["product-info"],
  {
    cacheLife: "productInfo", // 数据缓存配置
    tags: [`product-${id}`],
  }
);
```

### 8. 如何监控缓存命中率?

**问题**: 如何知道缓存的效果如何?

**解答**:

可以通过包装函数来监控缓存命中情况:

```typescript
// lib/cache-monitor.ts
import { unstable_cache } from "next/cache";

const cacheStats = new Map<string, { hits: number; misses: number }>();

export function monitoredCache<T>(
  fn: () => Promise<T>,
  keys: string[],
  options: any
) {
  const cacheKey = keys.join("-");

  return unstable_cache(
    async () => {
      // 记录缓存未命中
      const stats = cacheStats.get(cacheKey) || { hits: 0, misses: 0 };
      stats.misses++;
      cacheStats.set(cacheKey, stats);

      console.log(`Cache miss for ${cacheKey}`, stats);

      return await fn();
    },
    keys,
    options
  );
}

// 使用
export const getProduct = monitoredCache(
  async (id: string) => {
    return await db.product.findUnique({ where: { id } });
  },
  ["product"],
  {
    cacheLife: "productInfo",
    tags: [`product-${id}`],
  }
);

// 查看统计
export function getCacheStats() {
  return Object.fromEntries(cacheStats);
}
```

### 9. 如何处理缓存失效后的降级?

**问题**: 缓存过期且数据获取失败时如何处理?

**解答**:

可以实现降级策略:

```typescript
export const getProductWithFallback = unstable_cache(
  async (id: string) => {
    try {
      const product = await db.product.findUnique({ where: { id } });

      if (!product) {
        // 返回默认数据
        return {
          id,
          name: "Product Not Found",
          price: 0,
          available: false,
        };
      }

      return product;
    } catch (error) {
      console.error("Failed to fetch product:", error);

      // 返回降级数据
      return {
        id,
        name: "Temporarily Unavailable",
        price: 0,
        available: false,
        error: true,
      };
    }
  },
  ["product"],
  {
    cacheLife: "productInfo",
    tags: [`product-${id}`],
  }
);
```

### 10. 如何测试 cacheLife 配置?

**问题**: 如何测试不同的 cacheLife 配置效果?

**解答**:

可以编写测试来验证缓存行为:

```typescript
// __tests__/cache.test.ts
import { getProduct } from "@/lib/product-data";

describe("Product cache", () => {
  it("should cache product data", async () => {
    const startTime = Date.now();

    // 第一次调用 - 应该从数据库获取
    const product1 = await getProduct("123");
    const firstCallTime = Date.now() - startTime;

    // 第二次调用 - 应该从缓存获取
    const startTime2 = Date.now();
    const product2 = await getProduct("123");
    const secondCallTime = Date.now() - startTime2;

    // 缓存调用应该更快
    expect(secondCallTime).toBeLessThan(firstCallTime);

    // 数据应该相同
    expect(product1).toEqual(product2);
  });

  it("should revalidate after stale time", async () => {
    // 等待 stale 时间过去
    await new Promise((resolve) => setTimeout(resolve, 6000));

    // 应该触发后台重新验证
    const product = await getProduct("123");

    expect(product).toBeDefined();
  });
});
```

## 总结

cacheLife 是 Next.js 16 中用于精细控制缓存生命周期的强大工具。通过本文的学习,我们了解了:

### 核心概念

1. **三个时间参数**: stale、revalidate、expire 提供了灵活的缓存控制
2. **预定义配置**: 可以定义多个命名配置,在应用中复用
3. **类型安全**: 完全支持 TypeScript,提供良好的开发体验

### 实战应用

我们通过四个实战场景学习了 cacheLife 的应用:

1. **电商产品数据分层缓存**: 为产品信息、价格、库存、促销设置不同的缓存策略
2. **内容管理系统**: 为文章、评论、统计、作者信息设置合适的缓存时间
3. **API 数据缓存**: 为天气、汇率、新闻、股票等外部 API 设置缓存策略
4. **用户数据缓存**: 为用户资料、设置、活动、通知设置不同的缓存时间

### 最佳实践

1. **合理设置时间参数**: stale < revalidate < expire
2. **使用描述性名称**: 配置名称要有意义,便于理解
3. **结合 tags 使用**: 配合 revalidateTag 实现精确控制
4. **注意缓存大小**: 避免缓存过多数据占用内存
5. **环境区分**: 开发和生产环境使用不同的缓存时间

### 注意事项

1. 必须启用 dynamicIO 实验性功能
2. 三个时间参数要合理设置
3. 配置名称要有意义
4. 应该与 tags 结合使用
5. 注意缓存大小和内存占用

### 常见问题解答

我们回答了 10 个常见问题,涵盖:

- cacheLife 和 revalidate 的区别
- 不同环境的配置
- 动态修改配置
- stale 时间的影响
- 调试和监控
- 缓存预热
- 与 ISR 的配合
- 缓存命中率监控
- 降级策略
- 测试方法

### 适用场景

cacheLife 特别适合以下场景:

- 电商平台的多层数据缓存
- 内容管理系统的差异化缓存
- API 集成应用的缓存优化
- 用户系统的个性化缓存
- 需要精细控制缓存时间的应用

### 与其他缓存 API 的配合

cacheLife 可以与其他缓存 API 配合使用:

- **revalidateTag**: 精确控制缓存重新验证
- **revalidatePath**: 页面级别的缓存控制
- **unstable_cache**: 函数级别的缓存
- **fetch**: HTTP 请求的缓存

### 性能考虑

使用 cacheLife 时要注意:

- 根据数据更新频率设置合适的时间
- 避免缓存过多数据
- 监控缓存命中率
- 实现降级策略

### 未来展望

随着 Next.js 的发展,cacheLife 可能会:

- 从实验性功能变为稳定功能
- 提供更多的配置选项
- 更好的调试工具
- 更智能的缓存策略

通过合理使用 cacheLife,可以构建高性能的 Next.js 应用,在保持数据新鲜度的同时,最大化缓存的性能优势。关键是要理解应用的数据特点,为不同类型的数据设置合适的缓存策略,并结合 revalidateTag 实现精确的缓存控制。

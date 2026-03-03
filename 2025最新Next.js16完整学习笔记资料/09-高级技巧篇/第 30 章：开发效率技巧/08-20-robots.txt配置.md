**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# robots.txt 配置

robots.txt 文件告诉搜索引擎爬虫哪些页面可以抓取,哪些不可以。正确配置 robots.txt 可以优化爬虫效率,保护敏感页面。

## 核心概念

### robots.txt

放在网站根目录的文本文件,控制爬虫行为。

### User-agent

指定规则适用的爬虫,如 Googlebot、Bingbot 等。

### Disallow

禁止爬虫访问的路径。

### Allow

允许爬虫访问的路径,优先级高于 Disallow。

## 实战场景一: 基础 robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 实战场景二: 多规则配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/admin/", "/api/", "/draft/"],
      },
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin/", "/api/", "/draft/", "/private/"],
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 实战场景三: 环境区分配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    // 开发/测试环境禁止所有爬虫
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  // 生产环境正常配置
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin/", "/api/"],
        crawlDelay: 0,
      },
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin/", "/api/", "/private/"],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

### 实战场景四: 详细路径控制

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog/", "/products/", "/about"],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/dashboard/",
          "/*.json$",
          "/*?*", // 禁止带查询参数的URL
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/"],
        disallow: ["/images/private/"],
      },
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/dashboard/",
          "/private/",
          "/temp/",
          "/*.pdf$",
        ],
      },
    ],
    sitemap: [
      "https://example.com/sitemap.xml",
      "https://example.com/sitemap-posts.xml",
      "https://example.com/sitemap-products.xml",
    ],
  };
}
```

### 实战场景五: 动态 robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 从配置中获取禁止路径
  const disallowedPaths = await getDisallowedPaths();

  // 从配置中获取爬虫延迟设置
  const crawlDelays = await getCrawlDelays();

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: disallowedPaths.google,
        crawlDelay: crawlDelays.google,
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: disallowedPaths.bing,
        crawlDelay: crawlDelays.bing,
      },
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowedPaths.default,
        crawlDelay: crawlDelays.default,
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}

async function getDisallowedPaths() {
  // 从数据库或配置文件获取
  return {
    google: ["/admin/", "/api/"],
    bing: ["/admin/", "/api/", "/draft/"],
    default: ["/admin/", "/api/", "/draft/", "/private/"],
  };
}

async function getCrawlDelays() {
  return {
    google: 0,
    bing: 1,
    default: 2,
  };
}
```

## 2. 高级配置

### 2.1 环境特定配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    // 开发/测试环境: 禁止所有爬虫
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  // 生产环境: 正常配置
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### 2.2 特定爬虫配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google 爬虫
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Google 图片爬虫
      {
        userAgent: "Googlebot-Image",
        allow: "/images/",
        disallow: ["/images/private/"],
      },
      // Bing 爬虫
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
        crawlDelay: 1,
      },
      // 禁止特定爬虫
      {
        userAgent: "BadBot",
        disallow: "/",
      },
      // 其他爬虫
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/private/"],
        crawlDelay: 2,
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 2.3 路径模式匹配

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog/", "/products/"],
      disallow: [
        "/admin/", // 禁止整个目录
        "/api/", // 禁止 API 路由
        "/private/", // 禁止私有内容
        "/*?*", // 禁止带查询参数的 URL
        "/*.json$", // 禁止 JSON 文件
        "/search", // 禁止搜索页面
        "/cart", // 禁止购物车
        "/checkout", // 禁止结账页面
      ],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 2.4 多站点地图

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/blog-sitemap.xml`,
      `${baseUrl}/products-sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
    ],
  };
}
```

### 2.5 条件规则

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 从数据库获取配置
  const config = await getRobotsConfig();

  const rules: MetadataRoute.Robots["rules"] = [];

  // 根据配置动态生成规则
  if (config.allowGooglebot) {
    rules.push({
      userAgent: "Googlebot",
      allow: "/",
      disallow: config.googleDisallow || [],
    });
  }

  if (config.allowBingbot) {
    rules.push({
      userAgent: "Bingbot",
      allow: "/",
      disallow: config.bingDisallow || [],
      crawlDelay: config.bingCrawlDelay || 1,
    });
  }

  // 默认规则
  rules.push({
    userAgent: "*",
    allow: config.defaultAllow || "/",
    disallow: config.defaultDisallow || ["/admin/", "/api/"],
  });

  return {
    rules,
    sitemap: config.sitemapUrl || "https://example.com/sitemap.xml",
  };
}

async function getRobotsConfig() {
  // 从数据库或配置文件获取
  return {
    allowGooglebot: true,
    googleDisallow: ["/admin/", "/api/"],
    allowBingbot: true,
    bingDisallow: ["/admin/", "/api/", "/draft/"],
    bingCrawlDelay: 1,
    defaultAllow: "/",
    defaultDisallow: ["/admin/", "/api/", "/private/"],
    sitemapUrl: "https://example.com/sitemap.xml",
  };
}
```

## 3. 最佳实践

### 3.1 常见路径配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog/", "/products/", "/about", "/contact"],
      disallow: [
        // 管理和后台
        "/admin/",
        "/dashboard/",
        "/settings/",

        // API 和数据
        "/api/",
        "/*.json$",
        "/*.xml$",

        // 用户相关
        "/login",
        "/register",
        "/profile/",
        "/account/",

        // 购物流程
        "/cart",
        "/checkout",
        "/order/",

        // 搜索和过滤
        "/search",
        "/*?*", // 带查询参数的 URL

        // 临时和草稿
        "/draft/",
        "/preview/",
        "/temp/",
      ],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 3.2 电商网站配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/products/", "/categories/", "/blog/"],
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/account/",
          "/search",
          "/*?sort=*", // 禁止排序参数
          "/*?filter=*", // 禁止过滤参数
          "/*?page=*", // 禁止分页参数
        ],
      },
      {
        userAgent: "*",
        allow: ["/", "/products/", "/categories/"],
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/account/",
          "/search",
          "/*?*",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 3.3 博客网站配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog/", "/posts/", "/categories/", "/tags/", "/authors/"],
      disallow: [
        "/admin/",
        "/api/",
        "/draft/",
        "/preview/",
        "/wp-admin/", // 如果从 WordPress 迁移
        "/wp-content/",
        "/search",
        "/*?s=*", // 搜索查询
      ],
    },
    sitemap: [
      "https://example.com/sitemap.xml",
      "https://example.com/blog-sitemap.xml",
      "https://example.com/post-sitemap.xml",
    ],
  };
}
```

### 3.4 多语言网站配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const languages = ["en", "zh", "ja", "es"];
  const baseUrl = "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: languages.map((lang) => `/${lang}/`),
      disallow: ["/admin/", "/api/", "/private/"],
    },
    sitemap: languages.map((lang) => `${baseUrl}/${lang}/sitemap.xml`),
  };
}
```

## 常见问题

### 1. robots.txt 和 meta robots 有什么区别?

**区别**:

| 特性     | robots.txt | meta robots    |
| -------- | ---------- | -------------- |
| 位置     | 网站根目录 | HTML head 标签 |
| 作用范围 | 整个网站   | 单个页面       |
| 控制粒度 | 路径级别   | 页面级别       |
| 优先级   | 较低       | 较高           |

```typescript
// robots.txt (app/robots.ts)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/admin/",
    },
  };
}

// meta robots (app/admin/page.tsx)
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

### 2. 如何测试 robots.txt?

**测试工具**:

1. **Google Search Console**

   - URL: https://search.google.com/search-console
   - 工具 → robots.txt 测试工具

2. **在线验证器**

   - https://www.google.com/webmasters/tools/robots-testing-tool

3. **本地测试**

```bash
# 访问 robots.txt
curl https://example.com/robots.txt

# 或在浏览器中访问
https://example.com/robots.txt
```

### 3. robots.txt 能完全阻止爬虫吗?

不能。robots.txt 只是建议,恶意爬虫可能会忽略。

**更安全的方法**:

```typescript
// 1. 使用 meta robots
export const metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

// 2. 使用身份验证
export default async function Page() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  return <div>受保护的内容</div>;
}

// 3. 使用 IP 白名单
const ALLOWED_IPS = ["1.2.3.4"];

export default async function Page() {
  const ip = headers().get("x-forwarded-for");

  if (!ip || !ALLOWED_IPS.includes(ip)) {
    forbidden();
  }

  return <div>内部内容</div>;
}
```

### 4. 如何处理动态内容?

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 从数据库获取需要禁止的路径
  const disallowedPaths = await getDisallowedPaths();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowedPaths,
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}

async function getDisallowedPaths(): Promise<string[]> {
  const paths = await db.robotsConfig.findMany({
    where: { disallow: true },
    select: { path: true },
  });

  return paths.map((p) => p.path);
}
```

### 5. 如何处理子域名?

每个子域名需要自己的 robots.txt:

```typescript
// blog.example.com/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/draft/"],
    },
    sitemap: "https://blog.example.com/sitemap.xml",
  };
}

// shop.example.com/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/cart", "/checkout"],
    },
    sitemap: "https://shop.example.com/sitemap.xml",
  };
}
```

## 适用场景

### 1. 保护敏感页面

```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/settings/",
        "/api/",
        "/private/",
        "/internal/",
      ],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 2. 优化爬虫效率

```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/search", // 避免爬取搜索结果
        "/*?*", // 避免爬取带参数的 URL
        "/filter/", // 避免爬取过滤页面
        "/sort/", // 避免爬取排序页面
        "/*.pdf$", // 避免爬取 PDF
        "/*.doc$", // 避免爬取文档
      ],
      crawlDelay: 1, // 设置爬取延迟
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 3. 防止重复内容

```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*?page=*", // 禁止分页
        "/*?sort=*", // 禁止排序
        "/*?filter=*", // 禁止过滤
        "/print/", // 禁止打印版本
        "/amp/", // 如果有 canonical
      ],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

## 注意事项

### 1. 路径格式

- 使用 `/` 开头
- 使用 `*` 作为通配符
- 使用 `$` 表示结尾

### 2. 优先级

- `Allow` 优先于 `Disallow`
- 更具体的规则优先于通用规则

### 3. 大小写敏感

robots.txt 是大小写敏感的,确保路径大小写正确。

### 4. 不要依赖 robots.txt 保护敏感信息

使用身份验证和授权机制保护敏感内容。

### 5. 定期检查

定期检查 robots.txt 是否正确,使用 Google Search Console 测试。

## 总结

robots.txt 是控制搜索引擎爬虫的重要工具。本文介绍了:

1. **基础配置**: User-agent、Allow、Disallow、Sitemap
2. **高级配置**: 环境特定、特定爬虫、路径模式、多站点地图
3. **最佳实践**: 常见路径、电商、博客、多语言配置
4. **测试验证**: Google Search Console、在线工具、本地测试

关键要点:

- 使用 Next.js 的 robots.ts 文件
- 正确配置 Allow 和 Disallow
- 包含 Sitemap 链接
- 针对不同爬虫设置不同规则
- 定期测试和验证
- 不要依赖 robots.txt 保护敏感信息
- 使用 crawlDelay 控制爬取速度

通过正确配置 robots.txt,可以优化搜索引擎爬取效率,保护敏感页面,提升 SEO 效果。

## 6. 高级应用场景

### 6.1 动态 robots.txt 生成

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 从数据库获取配置
  const config = await getRobotsConfig();

  // 从环境变量获取域名
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

  return {
    rules: config.rules,
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

async function getRobotsConfig() {
  // 从数据库或配置文件获取
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
  };
}
```

### 6.2 A/B 测试配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isTestEnvironment = process.env.AB_TEST === "true";

  if (isTestEnvironment) {
    // 测试环境:阻止所有爬虫
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  // 生产环境:正常配置
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/test/"],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 6.3 地理位置特定配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const country = headersList.get("cf-ipcountry") || "US";

  // 根据地理位置返回不同配置
  if (country === "CN") {
    return {
      rules: [
        {
          userAgent: "Baiduspider",
          allow: "/",
          crawlDelay: 1,
        },
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/"],
        },
      ],
      sitemap: "https://example.cn/sitemap.xml",
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/"],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 6.4 时间敏感配置

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const now = new Date();
  const hour = now.getHours();

  // 在高峰时段限制爬虫
  const crawlDelay = hour >= 9 && hour <= 17 ? 10 : 1;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/"],
      crawlDelay,
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

## 7. 错误排查

### 7.1 常见错误

```typescript
// ❌ 错误:路径没有以 / 开头
{
  userAgent: '*',
  disallow: 'admin/', // 错误
}

// ✅ 正确
{
  userAgent: '*',
  disallow: '/admin/', // 正确
}

// ❌ 错误:使用了不支持的指令
{
  userAgent: '*',
  noindex: '/private/', // robots.txt 不支持 noindex
}

// ✅ 正确:使用 meta 标签
// app/private/page.tsx
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

### 7.2 调试工具

```typescript
// lib/robots-validator.ts
export function validateRobots(robots: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const lines = robots.split("\n");

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    // 检查格式
    if (!trimmed.includes(":")) {
      errors.push(`Line ${index + 1}: Invalid format`);
      return;
    }

    const [directive, value] = trimmed.split(":").map((s) => s.trim());

    // 检查指令
    const validDirectives = [
      "User-agent",
      "Disallow",
      "Allow",
      "Sitemap",
      "Crawl-delay",
      "Host",
    ];

    if (!validDirectives.includes(directive)) {
      errors.push(`Line ${index + 1}: Unknown directive "${directive}"`);
    }

    // 检查路径
    if ((directive === "Disallow" || directive === "Allow") && value) {
      if (!value.startsWith("/")) {
        errors.push(`Line ${index + 1}: Path must start with /`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 使用示例
const robotsContent = `
User-agent: *
Disallow: /admin/
Allow: /
Sitemap: https://example.com/sitemap.xml
`;

const result = validateRobots(robotsContent);
if (!result.valid) {
  console.error("Robots.txt errors:", result.errors);
}
```

### 7.3 性能监控

```typescript
// lib/robots-analytics.ts
export async function trackRobotsAccess(userAgent: string, path: string) {
  // 记录爬虫访问
  await fetch("/api/analytics/robots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAgent,
      path,
      timestamp: new Date().toISOString(),
    }),
  });
}

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";

  // 检测爬虫
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

  if (isBot) {
    // 记录爬虫访问
    trackRobotsAccess(userAgent, request.nextUrl.pathname);
  }

  return NextResponse.next();
}
```

## 8. 与其他 SEO 工具集成

### 8.1 与 Sitemap 集成

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-products.xml`,
      `${baseUrl}/sitemap-blog.xml`,
    ],
  };
}
```

### 8.2 与 Meta 标签配合

```typescript
// app/admin/page.tsx
export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminPage() {
  return <div>Admin Page</div>;
}

// 生成的 HTML:
// <meta name="robots" content="noindex, nofollow, nocache">
// <meta name="googlebot" content="noindex, nofollow">
```

### 8.3 与 Canonical 标签配合

```typescript
// app/products/[id]/page.tsx
interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  return {
    alternates: {
      canonical: `https://example.com/products/${params.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
```

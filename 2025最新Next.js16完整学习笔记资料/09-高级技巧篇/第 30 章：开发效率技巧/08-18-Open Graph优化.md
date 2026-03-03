**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Open Graph 优化

Open Graph 协议是 Facebook 提出的元数据标准,用于优化社交媒体分享效果。正确配置 Open Graph 可以显著提升内容在社交平台上的展示效果和点击率。

## 核心概念

### Open Graph 协议

定义网页在社交媒体分享时的展示方式。

### og:标签

Open Graph 使用的元数据标签,以 og:为前缀。

### 社交分享

用户在社交平台分享链接时的展示效果。

### 预览卡片

社交平台根据 Open Graph 数据生成的链接预览。

## 实战场景一: 基础 Open Graph 配置

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://example.com",
    siteName: "我的网站",
    title: "网站标题",
    description: "网站描述",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "网站图片",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 实战场景二: 文章 Open Graph

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      url: `https://example.com/blog/${params.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

async function getPost(slug: string) {
  return {
    title: "文章标题",
    excerpt: "文章摘要",
    coverImage: "https://example.com/article.jpg",
    publishedAt: "2024-01-01",
    updatedAt: "2024-01-02",
    author: { name: "作者名称" },
    category: "技术",
    tags: ["Next.js", "React"],
  };
}

export default function BlogPost({ params }: Props) {
  return <article>文章内容</article>;
}
```

### 实战场景三: 产品 Open Graph

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: "product",
      url: `https://example.com/products/${params.id}`,
      title: product.name,
      description: product.description,
      images: product.images.map((img) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
      // 产品特定属性
      productPrice: {
        amount: product.price,
        currency: "CNY",
      },
      productAvailability: "in stock",
      productCondition: "new",
    },
  };
}

async function getProduct(id: string) {
  return {
    name: "产品名称",
    description: "产品描述",
    price: 999,
    images: [
      "https://example.com/product1.jpg",
      "https://example.com/product2.jpg",
    ],
  };
}

export default function ProductPage({ params }: Props) {
  return <div>产品页面</div>;
}
```

### 实战场景四: 视频 Open Graph

```typescript
// app/videos/[id]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideo(params.id);

  return {
    title: video.title,
    description: video.description,
    openGraph: {
      type: "video.other",
      url: `https://example.com/videos/${params.id}`,
      title: video.title,
      description: video.description,
      videos: [
        {
          url: video.url,
          secureUrl: video.secureUrl,
          type: "video/mp4",
          width: 1920,
          height: 1080,
        },
      ],
      images: [
        {
          url: video.thumbnail,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
  };
}

async function getVideo(id: string) {
  return {
    title: "视频标题",
    description: "视频描述",
    url: "https://example.com/video.mp4",
    secureUrl: "https://example.com/video.mp4",
    thumbnail: "https://example.com/thumbnail.jpg",
  };
}

export default function VideoPage({ params }: Props) {
  return <div>视频页面</div>;
}
```

## 2. Twitter Cards 集成

### 2.1 Twitter Card 类型

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@yoursite",
      creator: "@author",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

async function getPost(slug: string) {
  return {
    title: "Post Title",
    excerpt: "Post Excerpt",
    coverImage: "https://example.com/cover.jpg",
  };
}
```

**Twitter Card 类型对比**:

| 类型                | 用途            | 图片尺寸           |
| ------------------- | --------------- | ------------------ |
| summary             | 小图摘要卡片    | 1:1 (最小 144x144) |
| summary_large_image | 大图摘要卡片    | 2:1 (最小 300x157) |
| app                 | 应用卡片        | 800x418            |
| player              | 视频/音频播放器 | 1:1 或 16:9        |

### 2.2 动态 Open Graph 图片

```typescript
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Default Title";
  const description = searchParams.get("description") || "Default Description";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          padding: "60px",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "32px",
            color: "#888",
          }}
        >
          {description}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            post.title
          )}&description=${encodeURIComponent(post.excerpt)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

async function getPost(slug: string) {
  return {
    title: "Post Title",
    excerpt: "Post Excerpt",
  };
}
```

## 3. 多语言 Open Graph

### 3.1 国际化配置

```typescript
// app/[lang]/layout.tsx
import type { Metadata } from "next";

interface Props {
  params: { lang: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const translations = {
    en: {
      title: "My Website",
      description: "Website Description",
      locale: "en_US",
    },
    zh: {
      title: "我的网站",
      description: "网站描述",
      locale: "zh_CN",
    },
    ja: {
      title: "私のウェブサイト",
      description: "ウェブサイトの説明",
      locale: "ja_JP",
    },
  };

  const t = translations[params.lang] || translations.en;

  return {
    title: t.title,
    description: t.description,
    openGraph: {
      locale: t.locale,
      alternateLocale: ["en_US", "zh_CN", "ja_JP"].filter(
        (l) => l !== t.locale
      ),
      title: t.title,
      description: t.description,
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: Props & { children: React.ReactNode }) {
  return children;
}
```

### 3.2 多语言文章

```typescript
// app/[lang]/blog/[slug]/page.tsx
import type { Metadata } from "next";

interface Props {
  params: { lang: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug, params.lang);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      locale: post.locale,
      alternateLocale: post.alternateLocales,
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/${params.lang}/blog/${params.slug}`,
      images: [{ url: post.coverImage }],
    },
    alternates: {
      languages: {
        "en-US": `/en/blog/${params.slug}`,
        "zh-CN": `/zh/blog/${params.slug}`,
        "ja-JP": `/ja/blog/${params.slug}`,
      },
    },
  };
}

async function getPost(slug: string, lang: string) {
  return {
    title: "Post Title",
    excerpt: "Post Excerpt",
    coverImage: "https://example.com/cover.jpg",
    locale: lang === "zh" ? "zh_CN" : "en_US",
    alternateLocales: ["en_US", "zh_CN", "ja_JP"],
  };
}

export default function BlogPost({ params }: Props) {
  return <article>文章内容</article>;
}
```

## 4. Open Graph 图片优化

### 4.1 图片尺寸规范

**推荐尺寸**:

| 平台      | 推荐尺寸  | 最小尺寸 | 比例        |
| --------- | --------- | -------- | ----------- |
| Facebook  | 1200x630  | 600x315  | 1.91:1      |
| Twitter   | 1200x675  | 300x157  | 16:9 或 2:1 |
| LinkedIn  | 1200x627  | 1200x627 | 1.91:1      |
| Pinterest | 1000x1500 | 600x900  | 2:3         |

### 4.2 响应式 OG 图片

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    openGraph: {
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: "image/jpeg",
        },
        {
          url: post.squareImage,
          width: 1200,
          height: 1200,
          alt: post.title,
          type: "image/jpeg",
        },
      ],
    },
  };
}

async function getPost(slug: string) {
  return {
    title: "Post Title",
    coverImage: "https://example.com/cover-16-9.jpg",
    squareImage: "https://example.com/cover-1-1.jpg",
  };
}
```

### 4.3 自动生成 OG 图片

```typescript
// app/api/og/blog/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const author = searchParams.get("author");
  const date = searchParams.get("date");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "80px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.2,
              marginBottom: "20px",
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "32px",
            }}
          >
            <span>{author}</span>
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "28px",
            }}
          >
            {date}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

## 5. 测试和验证

### 5.1 Facebook 调试工具

```typescript
// 使用 Facebook Sharing Debugger
// https://developers.facebook.com/tools/debug/

// 刷新缓存的元数据
async function refreshFacebookCache(url: string) {
  const response = await fetch(
    `https://graph.facebook.com/?id=${encodeURIComponent(url)}&scrape=true`,
    {
      method: "POST",
    }
  );

  return response.json();
}
```

### 5.2 Twitter Card 验证

```typescript
// 使用 Twitter Card Validator
// https://cards-dev.twitter.com/validator

// 验证 Twitter Card 配置
export const metadata = {
  twitter: {
    card: "summary_large_image",
    site: "@yoursite",
    creator: "@author",
  },
};
```

### 5.3 自动化测试

```typescript
// tests/og.test.ts
import { expect, test } from "@playwright/test";

test("Open Graph 元数据正确", async ({ page }) => {
  await page.goto("https://example.com/blog/test-post");

  // 检查 og:title
  const ogTitle = await page
    .locator('meta[property="og:title"]')
    .getAttribute("content");
  expect(ogTitle).toBe("测试文章标题");

  // 检查 og:description
  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute("content");
  expect(ogDescription).toBeTruthy();

  // 检查 og:image
  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(ogImage).toContain("https://");

  // 检查图片尺寸
  const ogImageWidth = await page
    .locator('meta[property="og:image:width"]')
    .getAttribute("content");
  expect(ogImageWidth).toBe("1200");

  const ogImageHeight = await page
    .locator('meta[property="og:image:height"]')
    .getAttribute("content");
  expect(ogImageHeight).toBe("630");
});
```

## 常见问题

### 1. 为什么社交平台不显示最新的 Open Graph 数据?

**原因和解决方案**:

| 原因            | 解决方案             |
| --------------- | -------------------- |
| 平台缓存        | 使用调试工具刷新缓存 |
| 元数据错误      | 验证 HTML 输出       |
| 图片无法访问    | 检查图片 URL 和权限  |
| robots.txt 阻止 | 允许爬虫访问         |

```typescript
// 确保图片可访问
export const metadata = {
  openGraph: {
    images: [
      {
        url: "https://example.com/og-image.jpg", // 使用完整 URL
        width: 1200,
        height: 630,
        alt: "图片描述",
      },
    ],
  },
};

// robots.txt 允许访问
// User-agent: *
// Allow: /
```

### 2. 如何为不同平台优化 Open Graph?

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    // 通用 Open Graph
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630, // Facebook 推荐
        },
      ],
    },
    // Twitter 特定配置
    twitter: {
      card: "summary_large_image",
      title: post.twitterTitle || post.title,
      description: post.twitterDescription || post.excerpt,
      images: [post.twitterImage || post.coverImage],
    },
  };
}

async function getPost(slug: string) {
  return {
    title: "Post Title",
    excerpt: "Post Excerpt",
    coverImage: "https://example.com/cover.jpg",
    twitterTitle: "Twitter Title",
    twitterDescription: "Twitter Description",
    twitterImage: "https://example.com/twitter-cover.jpg",
  };
}
```

### 3. 动态生成的 OG 图片性能如何优化?

```typescript
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

// 添加缓存
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  const response = new ImageResponse(
    (
      <div
        style={
          {
            /* ... */
          }
        }
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  // 设置缓存头
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return response;
}
```

**性能优化清单**:

| 优化项       | 方法               | 效果           |
| ------------ | ------------------ | -------------- |
| Edge Runtime | 使用 edge runtime  | 减少延迟       |
| 缓存         | 设置 Cache-Control | 减少重复生成   |
| CDN          | 使用 CDN 分发      | 加快访问速度   |
| 预生成       | 构建时生成         | 消除运行时开销 |

### 4. 如何处理多个 Open Graph 图片?

```typescript
// app/products/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    openGraph: {
      images: product.images.map((image, index) => ({
        url: image.url,
        width: 1200,
        height: 630,
        alt: `${product.name} - 图片 ${index + 1}`,
      })),
    },
  };
}

async function getProduct(id: string) {
  return {
    name: "Product Name",
    images: [
      { url: "https://example.com/image1.jpg" },
      { url: "https://example.com/image2.jpg" },
      { url: "https://example.com/image3.jpg" },
    ],
  };
}
```

### 5. Open Graph 对 SEO 有影响吗?

**影响分析**:

| 方面     | 影响程度 | 说明           |
| -------- | -------- | -------------- |
| 直接排名 | 低       | 不是排名因素   |
| 社交信号 | 中       | 提升分享和点击 |
| 用户体验 | 高       | 改善分享展示   |
| 品牌曝光 | 高       | 增加品牌认知   |

虽然 Open Graph 不直接影响搜索排名,但通过提升社交分享效果,可以间接带来更多流量和外链,从而对 SEO 产生积极影响。

## 适用场景

### 1. 博客文章

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: `/api/og/blog?title=${encodeURIComponent(
            post.title
          )}&author=${encodeURIComponent(post.author.name)}&date=${
            post.publishedAt
          }`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

async function getPost(slug: string) {
  return {
    title: "Post Title",
    excerpt: "Post Excerpt",
    publishedAt: "2024-01-01",
    updatedAt: "2024-01-02",
    author: { name: "Author Name" },
    category: "Technology",
    tags: ["Next.js", "React"],
  };
}
```

### 2. 电商产品

```typescript
// app/products/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: "product",
      title: product.name,
      description: product.description,
      url: `https://example.com/products/${params.id}`,
      images: [
        {
          url: `/api/og/product?name=${encodeURIComponent(
            product.name
          )}&price=${product.price}&image=${encodeURIComponent(
            product.mainImage
          )}`,
          width: 1200,
          height: 630,
        },
      ],
      productPrice: {
        amount: product.price,
        currency: "CNY",
      },
      productAvailability: product.inStock ? "in stock" : "out of stock",
      productCondition: "new",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: `${product.description} - ¥${product.price}`,
    },
  };
}

async function getProduct(id: string) {
  return {
    name: "Product Name",
    description: "Product Description",
    price: 999,
    mainImage: "https://example.com/product.jpg",
    inStock: true,
  };
}
```

### 3. 视频内容

```typescript
// app/videos/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const video = await getVideo(params.id);

  return {
    title: video.title,
    description: video.description,
    openGraph: {
      type: "video.other",
      title: video.title,
      description: video.description,
      url: `https://example.com/videos/${params.id}`,
      videos: [
        {
          url: video.url,
          secureUrl: video.secureUrl,
          type: "video/mp4",
          width: 1920,
          height: 1080,
        },
      ],
      images: [
        {
          url: video.thumbnail,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: "player",
      title: video.title,
      description: video.description,
      players: {
        playerUrl: `https://example.com/embed/${params.id}`,
        streamUrl: video.url,
        width: 1920,
        height: 1080,
      },
    },
  };
}

async function getVideo(id: string) {
  return {
    title: "Video Title",
    description: "Video Description",
    url: "https://example.com/video.mp4",
    secureUrl: "https://example.com/video.mp4",
    thumbnail: "https://example.com/thumbnail.jpg",
  };
}
```

### 4. 活动页面

```typescript
// app/events/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await getEvent(params.id);

  return {
    title: event.name,
    description: event.description,
    openGraph: {
      type: "website",
      title: event.name,
      description: event.description,
      url: `https://example.com/events/${params.id}`,
      images: [
        {
          url: event.coverImage,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      // 活动特定信息
      siteName: "活动平台",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description: `${event.description} - ${event.date} ${event.location}`,
    },
  };
}

async function getEvent(id: string) {
  return {
    name: "Event Name",
    description: "Event Description",
    date: "2024-12-31",
    location: "Event Location",
    coverImage: "https://example.com/event.jpg",
  };
}
```

## 注意事项

### 1. 图片要求

- 使用绝对 URL,不要使用相对路径
- 图片尺寸至少 1200x630 像素
- 文件大小控制在 8MB 以内
- 使用 JPEG 或 PNG 格式
- 确保图片可公开访问

### 2. 文本内容

- title 长度控制在 60-90 字符
- description 长度控制在 155-200 字符
- 避免使用特殊字符和 HTML 标签
- 确保内容准确描述页面

### 3. 类型选择

**Open Graph 类型对照**:

| 类型        | 适用场景 | 必需属性                          |
| ----------- | -------- | --------------------------------- |
| website     | 普通网站 | title, url, image                 |
| article     | 博客文章 | title, url, image, published_time |
| product     | 电商产品 | title, url, image, price          |
| video.other | 视频内容 | title, url, image, video          |
| music.song  | 音乐歌曲 | title, url, image, duration       |
| book        | 图书     | title, url, image, author         |

### 4. 缓存处理

- 使用调试工具刷新缓存
- 更新内容后验证展示效果
- 注意不同平台缓存时间不同

### 5. 测试验证

- 使用 Facebook Sharing Debugger
- 使用 Twitter Card Validator
- 使用 LinkedIn Post Inspector
- 检查实际分享效果

### 6. 性能优化

- 动态 OG 图片使用 Edge Runtime
- 设置合适的缓存策略
- 使用 CDN 分发图片
- 优化图片大小和质量

### 7. 多平台兼容

- 同时配置 Open Graph 和 Twitter Cards
- 为不同平台提供不同尺寸图片
- 测试在各平台的展示效果

## 总结

Open Graph 优化对提升社交媒体分享效果至关重要。本文介绍了:

1. **基础配置**: 网站、文章、产品、视频的 Open Graph 设置
2. **Twitter Cards**: 集成 Twitter 特定的元数据
3. **多语言支持**: 国际化 Open Graph 配置
4. **图片优化**: 尺寸规范、响应式图片、动态生成
5. **测试验证**: 使用调试工具和自动化测试

关键要点:

- 为每种内容类型选择合适的 og:type
- 使用标准的图片尺寸 (1200x630)
- 同时配置 Open Graph 和 Twitter Cards
- 使用动态 OG 图片提升视觉效果
- 定期测试和验证分享效果
- 优化图片性能和加载速度
- 支持多语言和国际化

通过正确配置 Open Graph,可以显著提升内容在社交平台的展示效果,增加点击率和分享率,间接提升 SEO 效果和品牌曝光度。

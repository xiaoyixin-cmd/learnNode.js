**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-01-generateMetadata 函数详解

## 概述

在现代 Web 应用中,元数据(Metadata)对于 SEO、社交分享和用户体验至关重要。Next.js 16 提供了强大的`generateMetadata`函数,允许开发者在服务端动态生成页面元数据。这个函数是 Next.js 元数据 API 的核心,支持静态和动态元数据生成,并且与 App Router 深度集成。

### 什么是 generateMetadata

`generateMetadata`是一个异步函数,在页面或布局组件中导出,用于生成页面的元数据。它在服务端执行,可以访问路由参数、搜索参数等信息,并返回一个包含元数据的对象。

### 为什么需要 generateMetadata

传统的静态元数据无法满足动态内容的需求。例如:

- 博客文章的标题和描述需要根据文章内容动态生成
- 产品页面的元数据需要从数据库获取
- 用户个人页面的元数据需要根据用户信息生成

`generateMetadata`解决了这些问题,提供了一种类型安全、性能优化的方式来生成动态元数据。

### Next.js 16 的改进

🆕 **Next.js 16 新增**: 改进了元数据缓存机制,支持更细粒度的缓存控制。

⚡ **Next.js 16 增强**: 提升了元数据生成的性能,减少了不必要的重复计算。

---

## 1. 基础用法

### 1.1 静态元数据

最简单的方式是导出一个静态的`metadata`对象:

```tsx
// app/about/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我们",
  description: "了解我们的团队和使命",
};

export default function AboutPage() {
  return <div>关于我们页面</div>;
}
```

### 1.2 动态元数据

使用`generateMetadata`函数生成动态元数据:

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from "next";

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 获取文章数据
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }: Props) {
  return <div>博客文章: {params.slug}</div>;
}
```

### 1.3 函数签名

```typescript
type GenerateMetadata = (
  props: {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
  },
  parent: ResolvingMetadata
) => Promise<Metadata> | Metadata;
```

**参数说明**:

- `params`: 动态路由参数
- `searchParams`: URL 查询参数
- `parent`: 父级元数据,用于继承和扩展

---

## 2. 元数据字段详解

### 2.1 基础字段

#### title

页面标题,支持字符串或对象形式:

```tsx
// 字符串形式
export const metadata: Metadata = {
  title: "我的网站",
};

// 对象形式
export const metadata: Metadata = {
  title: {
    default: "我的网站",
    template: "%s | 我的网站",
    absolute: "完整标题(忽略template)",
  },
};
```

**title.template 的使用**:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | 我的网站",
    default: "我的网站",
  },
};

// app/blog/page.tsx
export const metadata: Metadata = {
  title: "博客", // 最终显示: "博客 | 我的网站"
};
```

#### description

页面描述,用于 SEO 和社交分享:

```tsx
export const metadata: Metadata = {
  description: "这是一个关于Next.js 16的完整学习指南",
};
```

#### keywords

关键词数组,用于 SEO:

```tsx
export const metadata: Metadata = {
  keywords: ["Next.js", "React", "TypeScript", "Web开发"],
};
```

### 2.2 Open Graph

Open Graph 协议用于社交媒体分享:

```tsx
export const metadata: Metadata = {
  openGraph: {
    title: "我的网站",
    description: "网站描述",
    url: "https://example.com",
    siteName: "网站名称",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "图片描述",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
};
```

**Open Graph 类型**:

| 类型        | 说明     | 适用场景       |
| ----------- | -------- | -------------- |
| website     | 普通网站 | 首页、关于页   |
| article     | 文章     | 博客文章、新闻 |
| book        | 书籍     | 电子书、出版物 |
| profile     | 个人资料 | 用户主页       |
| video.movie | 电影     | 视频网站       |
| music.song  | 音乐     | 音乐平台       |

### 2.3 Twitter Card

Twitter 卡片元数据:

```tsx
export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    title: "我的网站",
    description: "网站描述",
    creator: "@username",
    images: ["https://example.com/twitter-image.jpg"],
  },
};
```

**Twitter 卡片类型**:

| 类型                | 说明       | 图片尺寸           |
| ------------------- | ---------- | ------------------ |
| summary             | 小图摘要   | 1:1 (最小 144x144) |
| summary_large_image | 大图摘要   | 2:1 (最小 300x157) |
| app                 | 应用卡片   | -                  |
| player              | 播放器卡片 | -                  |

### 2.4 robots

控制搜索引擎爬虫行为:

```tsx
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### 2.5 icons

网站图标配置:

```tsx
export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/shortcut-icon.png",
    apple: "/apple-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
};
```

### 2.6 viewport

视口配置:

```tsx
export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};
```

🆕 **Next.js 16 新增**: `viewport`现在可以通过`generateViewport`函数单独导出,提高性能。

### 2.7 verification

网站验证标签:

```tsx
export const metadata: Metadata = {
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
    other: {
      me: ["my-email@example.com", "my-link"],
    },
  },
};
```

### 2.8 alternates

备用 URL 和语言版本:

```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: "https://example.com",
    languages: {
      "en-US": "https://example.com/en-US",
      "zh-CN": "https://example.com/zh-CN",
    },
    media: {
      "only screen and (max-width: 600px)": "https://m.example.com",
    },
    types: {
      "application/rss+xml": "https://example.com/rss",
    },
  },
};
```

---

## 3. 高级用法

### 3.1 继承父级元数据

使用`parent`参数继承和扩展父级元数据:

```tsx
// app/blog/[slug]/page.tsx
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.slug);

  // 获取父级元数据
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    openGraph: {
      images: ["/new-image.jpg", ...previousImages],
    },
  };
}
```

### 3.2 动态生成 Open Graph 图片

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
```

### 3.3 基于用户代理的元数据

```tsx
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";

  const isMobile = /mobile/i.test(userAgent);

  return {
    title: isMobile ? "移动版标题" : "桌面版标题",
    viewport: isMobile ? "width=device-width, initial-scale=1" : "width=1024",
  };
}
```

### 3.4 条件元数据

根据不同条件生成不同的元数据:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  // 草稿文章不被索引
  if (post.status === "draft") {
    return {
      title: post.title,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // 已发布文章
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}
```

### 3.5 多语言元数据

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const translations = await getTranslations(locale);

  return {
    title: translations.title,
    description: translations.description,
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: {
        "en-US": "https://example.com/en-US",
        "zh-CN": "https://example.com/zh-CN",
        "ja-JP": "https://example.com/ja-JP",
      },
    },
    openGraph: {
      locale: locale,
      alternateLocale: ["en-US", "zh-CN", "ja-JP"].filter((l) => l !== locale),
    },
  };
}
```

---

## 4. 元数据合并策略

### 4.1 合并规则

Next.js 按照以下顺序合并元数据:

1. 根布局(`app/layout.tsx`)
2. 嵌套布局(从外到内)
3. 页面(`page.tsx`)

**合并行为**:

| 字段类型 | 合并方式 | 示例               |
| -------- | -------- | ------------------ |
| 简单字段 | 覆盖     | title, description |
| 数组字段 | 替换     | keywords           |
| 对象字段 | 浅合并   | openGraph, twitter |

### 4.2 合并示例

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | 我的网站",
    default: "我的网站",
  },
  description: "默认描述",
  openGraph: {
    siteName: "我的网站",
    locale: "zh_CN",
  },
};

// app/blog/layout.tsx
export const metadata: Metadata = {
  title: "博客",
  openGraph: {
    type: "website",
  },
};

// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "文章标题", // 最终: "文章标题 | 我的网站"
    description: "文章描述", // 覆盖默认描述
    openGraph: {
      type: "article", // 覆盖blog layout的type
      // siteName和locale继承自根layout
    },
  };
}
```

### 4.3 完全覆盖

使用`title.absolute`完全覆盖父级标题模板:

```tsx
export const metadata: Metadata = {
  title: {
    absolute: "完整标题", // 忽略父级的template
  },
};
```

---

## 5. 性能优化

### 5.1 元数据缓存

🆕 **Next.js 16 增强**: 改进了元数据的缓存机制。

```tsx
// 元数据会被自动缓存
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 这个请求会被缓存
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { revalidate: 3600 }, // 1小时后重新验证
  }).then((res) => res.json());

  return {
    title: post.title,
  };
}
```

### 5.2 避免重复请求

使用 React 的`cache`函数避免重复请求:

```tsx
import { cache } from "react";

const getPost = cache(async (slug: string) => {
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  return res.json();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return { title: post.title };
}

export default async function Page({ params }: Props) {
  const post = await getPost(params.slug); // 使用缓存的结果
  return <div>{post.content}</div>;
}
```

### 5.3 静态生成优化

对于静态页面,元数据在构建时生成:

```tsx
// 生成静态路径
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// 元数据在构建时生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return { title: post.title };
}
```

---

## 6. 实战案例

### 6.1 博客文章元数据

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name, url: post.author.url }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: post.author.twitter,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### 6.2 电商产品页面

```tsx
// app/products/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: `${product.name} - ${product.price}元`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "product",
      images: product.images.map((img) => ({
        url: img.url,
        width: 800,
        height: 600,
        alt: img.alt,
      })),
      // 产品特定字段
      productPrice: {
        amount: product.price,
        currency: "CNY",
      },
      productAvailability: product.inStock ? "in stock" : "out of stock",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.images[0].url],
    },
  };
}
```

### 6.3 用户个人主页

```tsx
// app/users/[username]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.username);

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio,
    openGraph: {
      type: "profile",
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      images: [
        {
          url: user.avatar,
          width: 400,
          height: 400,
          alt: user.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: user.name,
      description: user.bio,
      images: [user.avatar],
      creator: `@${user.username}`,
    },
  };
}
```

### 6.4 多语言网站

```tsx
// app/[locale]/page.tsx
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations(locale);

  return {
    title: t("home.title"),
    description: t("home.description"),
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: {
        "en-US": "https://example.com/en-US",
        "zh-CN": "https://example.com/zh-CN",
        "ja-JP": "https://example.com/ja-JP",
        "ko-KR": "https://example.com/ko-KR",
      },
    },
    openGraph: {
      title: t("home.title"),
      description: t("home.description"),
      locale: locale,
      alternateLocale: ["en-US", "zh-CN", "ja-JP", "ko-KR"].filter(
        (l) => l !== locale
      ),
    },
  };
}
```

---

## 7. 适用场景

### 7.1 SEO 优化

**场景**: 提升网站在搜索引擎中的排名。

**实现**:

```tsx
export const metadata: Metadata = {
  title: "关键词丰富的标题",
  description: "包含目标关键词的描述,长度在150-160字符",
  keywords: ["主要关键词", "次要关键词", "长尾关键词"],
  robots: {
    index: true,
    follow: true,
  },
};
```

### 7.2 社交媒体分享

**场景**: 在社交平台分享时显示精美的卡片。

**实现**:

```tsx
export const metadata: Metadata = {
  openGraph: {
    title: "吸引人的标题",
    description: "简短有力的描述",
    images: [
      {
        url: "https://example.com/share-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "吸引人的标题",
    description: "简短有力的描述",
  },
};
```

### 7.3 动态内容页面

**场景**: 博客文章、产品详情等动态内容。

**实现**:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchData(params.id);

  return {
    title: data.title,
    description: data.description,
  };
}
```

### 7.4 多语言网站

**场景**: 支持多种语言的国际化网站。

**实现**:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;

  return {
    alternates: {
      languages: {
        en: "/en",
        zh: "/zh",
        ja: "/ja",
      },
    },
  };
}
```

### 7.5 移动应用推广

**场景**: 推广 iOS 或 Android 应用。

**实现**:

```tsx
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    title: "应用名称",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-itunes-app": "app-id=123456789",
    "google-play-app": "app-id=com.example.app",
  },
};
```

---

## 8. 注意事项

### 8.1 元数据限制

**字符长度限制**:

| 字段        | 推荐长度     | 最大长度 | 说明                   |
| ----------- | ------------ | -------- | ---------------------- |
| title       | 50-60 字符   | 70 字符  | 超出部分会被截断       |
| description | 150-160 字符 | 320 字符 | Google 显示约 155 字符 |
| keywords    | 10-15 个     | -        | 过多可能被视为垃圾     |

### 8.2 性能考虑

**避免在 generateMetadata 中执行耗时操作**:

```tsx
// ❌ 不推荐
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 避免复杂计算
  const heavyComputation = await performHeavyTask();

  // 避免多个串行请求
  const data1 = await fetch("/api/1");
  const data2 = await fetch("/api/2");
  const data3 = await fetch("/api/3");

  return { title: data1.title };
}

// ✅ 推荐
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 使用缓存
  const data = await getCachedData(params.id);

  return { title: data.title };
}
```

### 8.3 类型安全

始终使用 TypeScript 类型:

```tsx
import { Metadata } from "next";

// ✅ 类型安全
export const metadata: Metadata = {
  title: "My Site",
  // TypeScript会检查字段是否正确
};

// ❌ 缺少类型检查
export const metadata = {
  title: "My Site",
  invalidField: "value", // 不会报错
};
```

### 8.4 SEO 最佳实践

1. **唯一的标题和描述**: 每个页面应该有独特的元数据
2. **包含关键词**: 但不要过度堆砌
3. **准确描述内容**: 元数据应该真实反映页面内容
4. **适当的长度**: 遵循推荐的字符长度
5. **结构化数据**: 配合 JSON-LD 使用

### 8.5 图片要求

**Open Graph 图片规范**:

| 平台     | 推荐尺寸 | 最小尺寸 | 格式          |
| -------- | -------- | -------- | ------------- |
| Facebook | 1200x630 | 600x315  | JPG, PNG      |
| Twitter  | 1200x675 | 300x157  | JPG, PNG, GIF |
| LinkedIn | 1200x627 | 1200x627 | JPG, PNG      |

```tsx
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "图片描述",
        type: "image/jpeg",
      },
    ],
  },
};
```

### 8.6 动态路由注意事项

确保处理不存在的路由:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getData(params.id);

  // 处理数据不存在的情况
  if (!data) {
    return {
      title: "页面未找到",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: data.title,
  };
}
```

---

## 9. 常见问题

### 9.1 元数据不生效怎么办?

**问题**: 设置了元数据但在页面源码中看不到。

**解决方案**:

1. 检查是否在正确的位置导出:

```tsx
// ✅ 正确 - 在page.tsx或layout.tsx中
export const metadata: Metadata = { ... };

// ❌ 错误 - 在组件内部
function MyComponent() {
  export const metadata = { ... }; // 无效
}
```

2. 检查是否使用了客户端组件:

```tsx
// ❌ 错误 - 客户端组件不支持metadata
'use client';
export const metadata: Metadata = { ... };

// ✅ 正确 - 在服务端组件中
export const metadata: Metadata = { ... };
```

### 9.2 如何调试元数据?

**方法 1**: 查看页面源码

```bash
# 在浏览器中右键 -> 查看页面源代码
# 搜索 <meta> 标签
```

**方法 2**: 使用开发者工具

```tsx
// 在generateMetadata中添加日志
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const metadata = {
    title: "My Title",
  };

  console.log("Generated metadata:", metadata);
  return metadata;
}
```

**方法 3**: 使用在线工具

- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### 9.3 如何处理动态图片?

**问题**: 需要根据内容动态生成 Open Graph 图片。

**解决方案**: 使用 ImageResponse API

```tsx
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: 60,
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

// 在generateMetadata中使用
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(params.title)}`],
    },
  };
}
```

### 9.4 元数据会被缓存吗?

**回答**: 是的,元数据会被缓存。

- **静态页面**: 元数据在构建时生成,永久缓存
- **动态页面**: 元数据在首次请求时生成,然后缓存
- **ISR 页面**: 元数据会在重新验证时更新

**控制缓存**:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetch(`/api/data/${params.id}`, {
    next: { revalidate: 3600 }, // 1小时后重新验证
  }).then((res) => res.json());

  return { title: data.title };
}
```

### 9.5 如何在客户端获取元数据?

**问题**: 需要在客户端组件中访问元数据。

**解决方案**: 元数据只在服务端生成,但可以通过 props 传递:

```tsx
// app/page.tsx (服务端组件)
export const metadata: Metadata = {
  title: "My Page",
};

export default function Page() {
  return <ClientComponent title="My Page" />;
}

// components/ClientComponent.tsx
("use client");

export default function ClientComponent({ title }: { title: string }) {
  // 使用传递的title
  return <h1>{title}</h1>;
}
```

### 9.6 如何处理多个语言版本?

**问题**: 网站支持多种语言,如何设置元数据?

**解决方案**:

```tsx
// app/[locale]/page.tsx
const translations = {
  en: {
    title: "My Site",
    description: "Welcome to my site",
  },
  zh: {
    title: "我的网站",
    description: "欢迎来到我的网站",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = translations[locale] || translations["en"];

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: {
        en: "https://example.com/en",
        zh: "https://example.com/zh",
      },
    },
  };
}
```

### 9.7 如何设置条件性的 robots 标签?

**问题**: 某些页面需要阻止搜索引擎索引。

**解决方案**:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  // 草稿或私密内容不被索引
  const shouldIndex = post.status === "published" && !post.isPrivate;

  return {
    title: post.title,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      nocache: !shouldIndex,
    },
  };
}
```

### 9.8 如何处理 404 页面的元数据?

**问题**: 404 页面需要特殊的元数据设置。

**解决方案**:

```tsx
// app/not-found.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "页面未找到 - 404",
  description: "抱歉,您访问的页面不存在",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <div>404 - 页面未找到</div>;
}
```

### 9.9 元数据和 SEO 的关系?

**回答**: 元数据是 SEO 的重要组成部分,但不是全部。

**SEO 因素**:

| 因素       | 重要性 | 说明               |
| ---------- | ------ | ------------------ |
| 标题标签   | 高     | 直接影响搜索排名   |
| 描述标签   | 中     | 影响点击率         |
| 关键词标签 | 低     | Google 已不再使用  |
| 内容质量   | 高     | 最重要的因素       |
| 页面速度   | 高     | 影响用户体验和排名 |
| 移动友好   | 高     | 移动优先索引       |

### 9.10 如何测试元数据?

**测试清单**:

1. **查看源代码**: 确认 meta 标签存在
2. **社交媒体测试**: 使用各平台的调试工具
3. **SEO 工具**: 使用 Google Search Console
4. **移动端测试**: 确认移动设备上的显示
5. **多语言测试**: 测试不同语言版本

**自动化测试**:

```tsx
// __tests__/metadata.test.tsx
import { generateMetadata } from "@/app/blog/[slug]/page";

describe("Metadata", () => {
  it("should generate correct metadata", async () => {
    const metadata = await generateMetadata({
      params: { slug: "test-post" },
      searchParams: {},
    });

    expect(metadata.title).toBe("Test Post");
    expect(metadata.description).toBeDefined();
    expect(metadata.openGraph?.images).toHaveLength(1);
  });
});
```

---

## 10. 总结

### 10.1 核心要点

1. **generateMetadata 是服务端函数**: 只能在服务端组件中使用
2. **支持静态和动态元数据**: 根据需求选择合适的方式
3. **元数据会被合并**: 理解合并规则很重要
4. **性能优化**: 使用缓存避免重复请求
5. **类型安全**: 始终使用 TypeScript 类型

### 10.2 最佳实践总结

| 实践               | 说明                   | 示例                              |
| ------------------ | ---------------------- | --------------------------------- |
| 使用 TypeScript    | 获得类型检查和自动补全 | `export const metadata: Metadata` |
| 缓存数据请求       | 避免重复请求           | 使用`cache()`函数                 |
| 设置合理的标题长度 | 50-60 字符最佳         | 避免被截断                        |
| 提供高质量图片     | 1200x630 最佳          | 用于社交分享                      |
| 处理错误情况       | 404 页面也需要元数据   | 返回默认元数据                    |

### 10.3 元数据字段优先级

**必须设置**:

- title
- description

**强烈推荐**:

- openGraph (社交分享)
- twitter (Twitter 分享)
- robots (SEO 控制)

**可选设置**:

- keywords (已不重要)
- authors (文章类内容)
- alternates (多语言网站)

### 10.4 Next.js 16 的改进

🆕 **Next.js 16 新增**:

- 改进的元数据缓存机制
- 更好的类型推导
- 性能优化

⚡ **Next.js 16 增强**:

- 更快的元数据生成速度
- 更好的错误提示
- 改进的开发体验

### 10.5 实用技巧

1. **使用模板**: 在根布局中设置 title.template
2. **继承元数据**: 使用 parent 参数扩展父级元数据
3. **条件元数据**: 根据内容状态设置不同的元数据
4. **动态图片**: 使用 ImageResponse 生成动态 OG 图片
5. **多语言支持**: 使用 alternates 字段设置语言版本

### 10.6 常见错误

| 错误         | 原因                | 解决方案         |
| ------------ | ------------------- | ---------------- |
| 元数据不显示 | 在客户端组件中使用  | 移到服务端组件   |
| 标题被截断   | 标题过长            | 控制在 60 字符内 |
| 图片不显示   | 图片 URL 错误       | 使用绝对 URL     |
| 缓存问题     | 没有设置 revalidate | 添加缓存控制     |

### 10.7 进阶学习

想要深入学习元数据 API,建议:

1. 阅读 Next.js 官方文档的 Metadata 部分
2. 学习 SEO 最佳实践
3. 了解 Open Graph 协议
4. 掌握 Twitter Card 规范
5. 学习结构化数据(JSON-LD)

### 10.8 相关资源

- Next.js Metadata API 文档
- Open Graph Protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards
- Google SEO 指南
- Schema.org 结构化数据

`generateMetadata`是 Next.js 中最重要的 SEO 工具之一。掌握它的使用方法,可以显著提升网站的搜索引擎排名和社交媒体分享效果。记住,好的元数据不仅要技术正确,更要内容准确、吸引人。始终以用户为中心,提供真实、有价值的信息。

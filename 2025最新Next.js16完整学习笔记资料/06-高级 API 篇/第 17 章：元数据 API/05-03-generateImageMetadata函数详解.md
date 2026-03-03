**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# generateImageMetadata 函数详解

## 1. 概述

`generateImageMetadata`是 Next.js 16 中用于动态生成 Open Graph 图像和 Twitter 卡片图像的函数。它允许你为动态路由生成多个图像变体,特别适用于需要为不同尺寸、语言或主题生成不同图像的场景。

### 1.1 核心特性

- **动态图像生成**: 为每个路由生成多个图像变体
- **类型安全**: 完整的 TypeScript 支持
- **SEO 优化**: 自动生成正确的 meta 标签
- **性能优化**: 图像在构建时生成并缓存
- **灵活配置**: 支持多种图像格式和尺寸

### 1.2 与其他元数据 API 的关系

| API                   | 用途           | 返回值             |
| --------------------- | -------------- | ------------------ |
| generateMetadata      | 生成页面元数据 | Metadata 对象      |
| generateViewport      | 生成视口配置   | Viewport 对象      |
| generateImageMetadata | 生成图像元数据 | ImageMetadata 数组 |
| generateSitemaps      | 生成站点地图   | Sitemap 数组       |

### 1.3 适用场景

- 多语言网站的本地化图像
- 不同主题(亮色/暗色)的图像
- 不同尺寸的社交分享图像
- 动态生成的 OG 图像
- 产品图像的多个变体

---

## 2. 基础用法

### 2.1 简单示例

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return [
    {
      id: "default",
      size: { width: 1200, height: 630 },
      alt: post.title,
      contentType: "image/png",
    },
  ];
}

export default async function Image({
  params,
  id,
}: {
  params: { slug: string };
  id: string;
}) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 60,
          background: "linear-gradient(to bottom, #0070f3, #00d4ff)",
          color: "white",
        }}
      >
        {post.title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 2.2 多个图像变体

```tsx
// app/product/[id]/opengraph-image.tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  return [
    {
      id: "small",
      size: { width: 600, height: 315 },
      alt: "Small product image",
      contentType: "image/png",
    },
    {
      id: "large",
      size: { width: 1200, height: 630 },
      alt: "Large product image",
      contentType: "image/png",
    },
  ];
}

export default async function Image({
  params,
  id,
}: {
  params: { id: string };
  id: string;
}) {
  const product = await getProduct(params.id);
  const size =
    id === "small" ? { width: 600, height: 315 } : { width: 1200, height: 630 };

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img src={product.image} alt={product.name} />
      </div>
    ),
    size
  );
}
```

### 2.3 类型定义

```tsx
type ImageMetadata = {
  id: string;
  size?: { width: number; height: number };
  alt?: string;
  contentType?: "image/png" | "image/jpeg" | "image/webp";
};

type GenerateImageMetadataParams = {
  params: Record<string, string | string[]>;
};

function generateImageMetadata(
  props: GenerateImageMetadataParams
): Promise<ImageMetadata[]> | ImageMetadata[];
```

---

## 3. 高级用法

### 3.1 多语言图像

```tsx
// app/[locale]/blog/[slug]/opengraph-image.tsx
const locales = ["en", "zh", "ja", "ko"];

export async function generateImageMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  return locales.map((locale) => ({
    id: locale,
    size: { width: 1200, height: 630 },
    alt: `Blog post in ${locale}`,
    contentType: "image/png" as const,
  }));
}

export default async function Image({
  params,
  id,
}: {
  params: { locale: string; slug: string };
  id: string;
}) {
  const post = await getLocalizedPost(id, params.slug);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## 4. ImageResponse 详解

### 4.1 基本结构

```tsx
import { ImageResponse } from "next/og";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex" }}>
        <h1>Hello World</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 4.2 支持的 CSS 属性

ImageResponse 使用 Satori 库,支持以下 CSS 属性:

| 属性类别 | 支持的属性                                         |
| -------- | -------------------------------------------------- |
| 布局     | display, flexDirection, alignItems, justifyContent |
| 尺寸     | width, height, maxWidth, maxHeight                 |
| 间距     | margin, padding, gap                               |
| 文本     | fontSize, fontWeight, color, textAlign, lineHeight |
| 背景     | background, backgroundColor, backgroundImage       |
| 边框     | border, borderRadius, borderColor, borderWidth     |
| 定位     | position, top, left, right, bottom                 |
| 其他     | opacity, transform, overflow                       |

```tsx
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          padding: "40px",
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
          Blog Title
        </h1>
        <p
          style={{
            fontSize: "32px",
            color: "#888",
            textAlign: "center",
          }}
        >
          A short description
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 4.3 自定义字体

```tsx
import { ImageResponse } from "next/og";

export default async function Image() {
  const fontData = await fetch(
    new URL("./fonts/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{ display: "flex", fontFamily: "Inter" }}>
        <h1>Custom Font</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
```

### 4.4 使用图像

```tsx
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <img
          src="https://example.com/background.jpg"
          alt="Background"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <h1 style={{ color: "white", fontSize: "60px" }}>Overlay Text</h1>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 4.5 渐变背景

```tsx
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ color: "white", fontSize: "80px" }}>
          Gradient Background
        </h1>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## 5. 实战案例

### 5.1 博客文章 OG 图像

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [
    {
      id: "og",
      size: { width: 1200, height: 630 },
      alt: "Blog post Open Graph image",
      contentType: "image/png",
    },
    {
      id: "twitter",
      size: { width: 1200, height: 600 },
      alt: "Blog post Twitter card",
      contentType: "image/png",
    },
  ];
}

export default async function Image({
  params,
  id,
}: {
  params: { slug: string };
  id: string;
}) {
  const post = await getPost(params.slug);
  const size =
    id === "twitter"
      ? { width: 1200, height: 600 }
      : { width: 1200, height: 630 };

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "white",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            width={80}
            height={80}
            style={{ borderRadius: "50%", marginRight: "20px" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>
              {post.author.name}
            </span>
            <span style={{ fontSize: "18px", color: "#666" }}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            marginBottom: "20px",
            lineHeight: 1.2,
          }}
        >
          {post.title}
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "#666",
            lineHeight: 1.4,
          }}
        >
          {post.excerpt}
        </p>
      </div>
    ),
    size
  );
}
```

### 5.2 电商产品图像

```tsx
// app/product/[id]/opengraph-image.tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return product.images.map((image, index) => ({
    id: `variant-${index}`,
    size: { width: 1200, height: 630 },
    alt: `${product.name} - Variant ${index + 1}`,
    contentType: "image/png",
  }));
}

export default async function Image({
  params,
  id,
}: {
  params: { id: string };
  id: string;
}) {
  const product = await getProduct(params.id);
  const variantIndex = parseInt(id.split("-")[1]);
  const image = product.images[variantIndex];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "60%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={image.url}
            alt={product.name}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "40%",
            padding: "60px",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {product.name}
          </h1>
          <p
            style={{
              fontSize: "36px",
              color: "#0070f3",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            ${product.price}
          </p>
          <p
            style={{
              fontSize: "24px",
              color: "#666",
              lineHeight: 1.4,
            }}
          >
            {product.description}
          </p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 5.3 多语言图像

```tsx
// app/[locale]/news/[id]/opengraph-image.tsx
const locales = ["en", "zh", "ja", "ko", "es", "fr"];

export async function generateImageMetadata({
  params,
}: {
  params: { locale: string; id: string };
}) {
  return locales.map((locale) => ({
    id: locale,
    size: { width: 1200, height: 630 },
    alt: `News article in ${locale}`,
    contentType: "image/png",
  }));
}

export default async function Image({
  params,
  id,
}: {
  params: { locale: string; id: string };
  id: string;
}) {
  const news = await getLocalizedNews(id, id);
  const fontData = await getLocalizedFont(id);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom right, #1e3a8a, #3b82f6)",
          padding: "60px",
          fontFamily: "CustomFont",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              color: "white",
              opacity: 0.8,
            }}
          >
            {news.category}
          </span>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "30px",
            lineHeight: 1.2,
          }}
        >
          {news.title}
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "white",
            opacity: 0.9,
            lineHeight: 1.4,
          }}
        >
          {news.summary}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "CustomFont",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
```

### 5.4 暗色/亮色主题

```tsx
// app/docs/[slug]/opengraph-image.tsx
export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [
    {
      id: "light",
      size: { width: 1200, height: 630 },
      alt: "Documentation - Light theme",
      contentType: "image/png",
    },
    {
      id: "dark",
      size: { width: 1200, height: 630 },
      alt: "Documentation - Dark theme",
      contentType: "image/png",
    },
  ];
}

export default async function Image({
  params,
  id,
}: {
  params: { slug: string };
  id: string;
}) {
  const doc = await getDoc(params.slug);
  const isDark = id === "dark";

  const theme = {
    background: isDark ? "#1a1a1a" : "#ffffff",
    text: isDark ? "#ffffff" : "#1a1a1a",
    accent: isDark ? "#60a5fa" : "#3b82f6",
    secondary: isDark ? "#9ca3af" : "#6b7280",
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: theme.background,
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              color: theme.accent,
              fontWeight: "bold",
            }}
          >
            Documentation
          </span>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: theme.text,
            marginBottom: "20px",
            lineHeight: 1.2,
          }}
        >
          {doc.title}
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: theme.secondary,
            lineHeight: 1.4,
          }}
        >
          {doc.description}
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## 6. 性能优化

### 6.1 缓存策略

```tsx
// app/blog/[slug]/opengraph-image.tsx
export const runtime = "edge";
export const revalidate = 3600; // 缓存1小时

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [
    {
      id: "default",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
  ];
}
```

### 6.2 限制图像数量

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  // 最多生成3个图像变体
  const images = product.images.slice(0, 3);

  return images.map((image, index) => ({
    id: `variant-${index}`,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}
```

### 6.3 使用 CDN

```tsx
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  // 使用CDN上的图像
  const cdnImage = `https://cdn.example.com/images/${post.coverImage}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex" }}>
        <img src={cdnImage} alt={post.title} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## 7. 类型安全

### 7.1 完整类型定义

```tsx
import { ImageResponse } from "next/og";

type ImageMetadata = {
  id: string;
  size?: {
    width: number;
    height: number;
  };
  alt?: string;
  contentType?: "image/png" | "image/jpeg" | "image/webp";
};

type ImageProps = {
  params: Record<string, string | string[]>;
  id: string;
};

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<ImageMetadata[]> {
  return [
    {
      id: "default",
      size: { width: 1200, height: 630 },
      alt: "Default image",
      contentType: "image/png",
    },
  ];
}

export default async function Image({
  params,
  id,
}: ImageProps): Promise<ImageResponse> {
  return new ImageResponse(<div>Content</div>, { width: 1200, height: 630 });
}
```

### 7.2 Zod 验证

```tsx
import { z } from "zod";

const ImageMetadataSchema = z.object({
  id: z.string(),
  size: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  alt: z.string().optional(),
  contentType: z.enum(["image/png", "image/jpeg", "image/webp"]).optional(),
});

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const metadata = [
    {
      id: "default",
      size: { width: 1200, height: 630 },
      alt: "Default image",
      contentType: "image/png" as const,
    },
  ];

  // 验证元数据
  metadata.forEach((item) => {
    ImageMetadataSchema.parse(item);
  });

  return metadata;
}
```

---

## 8. 适用场景

### 8.1 博客和内容网站

生成每篇文章的社交分享图像,提升分享时的视觉效果。

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [
    { id: "og", size: { width: 1200, height: 630 }, contentType: "image/png" },
    {
      id: "twitter",
      size: { width: 1200, height: 600 },
      contentType: "image/png",
    },
  ];
}
```

### 8.2 电商平台

为每个产品生成多个图像变体,适配不同的社交平台。

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  return product.images.map((_, i) => ({
    id: `variant-${i}`,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}
```

### 8.3 多语言网站

为不同语言生成本地化的图像。

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const locales = ["en", "zh", "ja"];
  return locales.map((locale) => ({
    id: locale,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}
```

### 8.4 文档网站

为文档页面生成统一风格的 OG 图像。

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { slug: string[] };
}) {
  return [
    {
      id: "default",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
  ];
}
```

### 8.5 新闻和媒体网站

为新闻文章生成吸引眼球的分享图像。

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  return [
    {
      id: "facebook",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
    {
      id: "twitter",
      size: { width: 1200, height: 600 },
      contentType: "image/png",
    },
    {
      id: "linkedin",
      size: { width: 1200, height: 627 },
      contentType: "image/png",
    },
  ];
}
```

---

## 9. 注意事项

### 9.1 图像尺寸

不同平台推荐的图像尺寸:

| 平台      | 推荐尺寸  | 比例   |
| --------- | --------- | ------ |
| Facebook  | 1200x630  | 1.91:1 |
| Twitter   | 1200x600  | 2:1    |
| LinkedIn  | 1200x627  | 1.91:1 |
| Instagram | 1080x1080 | 1:1    |

```tsx
export async function generateImageMetadata() {
  return [
    { id: "facebook", size: { width: 1200, height: 630 } },
    { id: "twitter", size: { width: 1200, height: 600 } },
    { id: "linkedin", size: { width: 1200, height: 627 } },
  ];
}
```

### 9.2 文件大小

保持图像文件大小在合理范围内:

- Facebook: 最大 8MB
- Twitter: 最大 5MB
- LinkedIn: 最大 5MB

```tsx
export default async function Image() {
  return new ImageResponse(<div>Content</div>, {
    width: 1200,
    height: 630,
    // 使用JPEG格式减小文件大小
  });
}
```

### 9.3 字体加载

确保字体文件正确加载:

```tsx
export default async function Image() {
  try {
    const fontData = await fetch(
      new URL("./fonts/Inter-Bold.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      <div style={{ fontFamily: "Inter" }}>Content</div>,
      {
        width: 1200,
        height: 630,
        fonts: [{ name: "Inter", data: fontData, style: "normal" }],
      }
    );
  } catch (error) {
    console.error("Failed to load font:", error);
    // 返回默认字体的图像
    return new ImageResponse(<div>Content</div>, { width: 1200, height: 630 });
  }
}
```

### 9.4 性能考虑

限制生成的图像数量:

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  // 最多生成5个图像
  const images = product.images.slice(0, 5);

  return images.map((_, i) => ({
    id: `variant-${i}`,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}
```

### 9.5 错误处理

处理图像生成失败的情况:

```tsx
export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const post = await getPost(params.slug);

    return new ImageResponse(<div>{post.title}</div>, {
      width: 1200,
      height: 630,
    });
  } catch (error) {
    console.error("Failed to generate image:", error);

    // 返回默认图像
    return new ImageResponse(<div>Default Image</div>, {
      width: 1200,
      height: 630,
    });
  }
}
```

### 9.6 缓存配置

合理配置缓存时间:

```tsx
export const revalidate = 3600; // 1小时
export const runtime = "edge"; // 使用Edge Runtime

export async function generateImageMetadata() {
  return [
    {
      id: "default",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
  ];
}
```

---

## 10. 常见问题

### 10.1 图像不显示?

**问题**: 生成的图像在社交平台上不显示。

**原因**:

1. 图像 URL 不正确
2. 图像尺寸不符合要求
3. 缓存问题

**解决方案**:

```tsx
// 确保正确的文件命名
// app/blog/[slug]/opengraph-image.tsx (正确)
// app/blog/[slug]/og-image.tsx (错误)

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [
    {
      id: "default",
      size: { width: 1200, height: 630 }, // 确保尺寸正确
      contentType: "image/png",
    },
  ];
}
```

### 10.2 如何调试图像生成?

**方法**: 在本地访问图像 URL

```bash
# 启动开发服务器
npm run dev

# 访问图像URL
http://localhost:3000/blog/my-post/opengraph-image
```

**添加日志**:

```tsx
export default async function Image({
  params,
  id,
}: {
  params: { slug: string };
  id: string;
}) {
  console.log("Generating image for:", params.slug, "id:", id);

  const post = await getPost(params.slug);
  console.log("Post data:", post);

  return new ImageResponse(<div>{post.title}</div>, {
    width: 1200,
    height: 630,
  });
}
```

### 10.3 如何使用自定义字体?

**问题**: 自定义字体不生效。

**解决方案**:

```tsx
export default async function Image() {
  // 确保字体文件路径正确
  const fontData = await fetch(
    new URL("../../fonts/Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div style={{ fontFamily: "Inter" }}>Custom Font Text</div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter", // 与style中的fontFamily匹配
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
```

### 10.4 如何处理动态内容?

**问题**: 需要根据参数生成不同的图像。

**解决方案**:

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { category: string };
}) {
  const categories = await getCategories();

  return categories.map((cat) => ({
    id: cat.slug,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}

export default async function Image({
  params,
  id,
}: {
  params: { category: string };
  id: string;
}) {
  const category = await getCategoryBySlug(id);

  return new ImageResponse(<div>{category.name}</div>, {
    width: 1200,
    height: 630,
  });
}
```

### 10.5 如何优化图像生成性能?

**问题**: 图像生成速度慢。

**解决方案**:

```tsx
// 使用Edge Runtime
export const runtime = "edge";

// 启用缓存
export const revalidate = 3600;

// 限制图像数量
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  const images = product.images.slice(0, 3); // 最多3个

  return images.map((_, i) => ({
    id: `variant-${i}`,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}
```

### 10.6 如何处理图像加载失败?

**问题**: 外部图像加载失败。

**解决方案**:

```tsx
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  // 使用默认图像作为后备
  const imageUrl = post.coverImage || "https://example.com/default.jpg";

  return new ImageResponse(
    (
      <div style={{ display: "flex" }}>
        <img src={imageUrl} alt={post.title} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 10.7 如何测试不同平台的显示效果?

**工具**:

- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

```bash
# 部署后测试
https://your-domain.com/blog/my-post/opengraph-image
```

### 10.8 如何处理中文字体?

**问题**: 中文字符显示为方块。

**解决方案**:

```tsx
export default async function Image() {
  const fontData = await fetch(
    new URL("./fonts/NotoSansSC-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div style={{ fontFamily: "Noto Sans SC" }}>中文标题</div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans SC",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
```

### 10.9 如何生成动态二维码?

**问题**: 需要在图像中包含二维码。

**解决方案**:

```tsx
import QRCode from "qrcode";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  const url = `https://example.com/blog/${params.slug}`;

  // 生成二维码
  const qrCodeDataUrl = await QRCode.toDataURL(url);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>{post.title}</h1>
        <img src={qrCodeDataUrl} alt="QR Code" width={200} height={200} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 10.10 如何处理 emoji?

**问题**: Emoji 显示不正确。

**解决方案**:

```tsx
export default async function Image() {
  // 使用Twemoji或其他emoji字体
  const emojiFont = await fetch(
    new URL("./fonts/TwitterColorEmoji.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div style={{ fontFamily: "Twitter Color Emoji" }}>🎉 Celebration 🎊</div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Twitter Color Emoji",
          data: emojiFont,
          style: "normal",
        },
      ],
    }
  );
}
```

---

## 11. 总结

### 11.1 核心要点

1. **动态生成**: `generateImageMetadata`允许为每个路由生成多个图像变体
2. **ImageResponse**: 使用 JSX 语法生成图像,支持部分 CSS 属性
3. **类型安全**: 完整的 TypeScript 支持
4. **性能优化**: 使用缓存和 Edge Runtime 提升性能
5. **灵活配置**: 支持多种图像格式、尺寸和自定义字体

### 11.2 最佳实践

| 实践       | 说明               | 示例                 |
| ---------- | ------------------ | -------------------- |
| 合适的尺寸 | 使用平台推荐的尺寸 | 1200x630 (Facebook)  |
| 限制数量   | 避免生成过多图像   | 最多 3-5 个变体      |
| 使用缓存   | 配置合理的缓存时间 | revalidate: 3600     |
| 错误处理   | 处理图像生成失败   | try-catch + 默认图像 |
| 字体优化   | 只加载必要的字体   | 单个字体文件         |

### 11.3 配置模板

**标准博客**:

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [
    { id: "og", size: { width: 1200, height: 630 }, contentType: "image/png" },
  ];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**电商产品**:

```tsx
export async function generateImageMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  return product.images.slice(0, 3).map((_, i) => ({
    id: `variant-${i}`,
    size: { width: 1200, height: 630 },
    contentType: "image/png",
  }));
}
```

### 11.4 Next.js 16 的改进

🆕 **Next.js 16 新增**:

- 更好的图像生成性能
- 改进的字体加载机制
- 更清晰的错误提示

⚡ **Next.js 16 增强**:

- 更快的构建速度
- 更好的缓存策略
- 改进的 TypeScript 支持

### 11.5 常见错误

| 错误       | 原因         | 解决方案                 |
| ---------- | ------------ | ------------------------ |
| 图像不显示 | 文件命名错误 | 使用 opengraph-image.tsx |
| 字体不生效 | 字体路径错误 | 检查 import.meta.url     |
| 尺寸不对   | 未指定 size  | 明确指定 width 和 height |
| 性能问题   | 生成图像过多 | 限制数量 + 缓存          |

### 11.6 进阶学习

想要深入学习`generateImageMetadata`,建议:

1. 了解 Open Graph 协议
2. 学习 Satori 库的 CSS 支持
3. 掌握 ImageResponse 的高级用法
4. 了解不同社交平台的图像要求
5. 学习图像优化技巧

### 11.7 相关资源

- [Next.js 官方文档 - generateImageMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata)
- [Satori 文档](https://github.com/vercel/satori)
- [Open Graph 协议](https://ogp.me/)
- [Twitter Card 文档](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

`generateImageMetadata`是 Next.js 16 中生成动态社交分享图像的核心函数。正确使用它可以显著提升网站在社交平台上的分享效果,改善用户体验。记住,好的分享图像可以大幅提升点击率和转化率。

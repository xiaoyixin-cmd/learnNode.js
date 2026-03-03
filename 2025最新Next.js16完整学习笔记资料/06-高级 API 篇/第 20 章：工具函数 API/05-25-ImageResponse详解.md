**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-25-ImageResponse 详解

## 概述

ImageResponse 是 Next.js 16 提供的一个强大 API,用于动态生成图片,特别适合生成 Open Graph 图片、社交分享图片和动态图表。它基于 Vercel 的@vercel/og 库,使用 Satori 将 JSX 转换为 SVG,然后转换为 PNG 图片。ImageResponse 在 Edge Runtime 中运行,提供快速的图片生成能力。

### 核心特性

- **JSX 语法**: 使用熟悉的 JSX 编写图片内容
- **Edge Runtime**: 在边缘节点快速生成
- **动态内容**: 根据参数生成不同图片
- **自定义字体**: 支持自定义字体
- **Flexbox 布局**: 使用 Flexbox 进行布局
- **CSS 样式**: 支持部分 CSS 属性
- **高性能**: 快速生成高质量图片
- **SEO 优化**: 提升社交分享效果

### 图片生成流程

```
┌─────────────┐
│  接收请求   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  解析参数   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  渲染JSX    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  转换为SVG  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  转换为PNG  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  返回图片   │
└─────────────┘
```

### 使用场景对比

| 场景     | ImageResponse | 静态图片 | Canvas API |
| -------- | ------------- | -------- | ---------- |
| OG 图片  | ✓ 推荐        | ✗ 不灵活 | ✓ 可用     |
| 动态图表 | ✓ 推荐        | ✗ 不适用 | ✓ 推荐     |
| 用户头像 | ✓ 可用        | ✗ 不适用 | ✓ 推荐     |
| 社交分享 | ✓ 推荐        | ✗ 不灵活 | ✓ 可用     |
| 实时数据 | ✓ 推荐        | ✗ 不适用 | ✓ 推荐     |

---

## 1. 基础用法

### 1.1 简单的 OG 图片

```tsx
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "white",
          background: "linear-gradient(to bottom, #1e3a8a, #3b82f6)",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Hello World
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 1.2 带参数的动态图片

```tsx
// app/api/og/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Default Title";
  const description = searchParams.get("description") || "Default Description";

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
          color: "white",
          padding: "40px",
        }}
      >
        <h1 style={{ fontSize: "60px", marginBottom: "20px" }}>{title}</h1>
        <p style={{ fontSize: "30px", color: "#888" }}>{description}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 1.3 使用自定义字体

```tsx
// app/api/og/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const fontData = await fetch(
    new URL("./Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 60,
          fontFamily: "Inter",
          color: "white",
          background: "#000",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Custom Font
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

---

## 2. 高级布局

### 2.1 Flexbox 布局

```tsx
// app/api/og/layout/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
        }}
      >
        {/* 左侧 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "40px",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>Title</h1>
          <p style={{ fontSize: "24px" }}>Description goes here</p>
        </div>

        {/* 右侧 */}
        <div
          style={{
            display: "flex",
            flex: 1,
            backgroundColor: "#1e3a8a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              color: "white",
            }}
          >
            📊
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

### 2.2 网格布局

```tsx
// app/api/og/grid/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const items = ["Item 1", "Item 2", "Item 3", "Item 4"];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          height: "100%",
          backgroundColor: "#f3f4f6",
          padding: "40px",
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              width: "50%",
              height: "50%",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "32px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
              }}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 2.3 卡片布局

```tsx
// app/api/og/card/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Blog Post Title";
  const author = searchParams.get("author") || "John Doe";
  const date = searchParams.get("date") || "2024-01-01";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            padding: "60px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              marginBottom: "30px",
              color: "#111",
            }}
          >
            {title}
          </h1>

          <div
            style={{
              width: "100px",
              height: "4px",
              backgroundColor: "#3b82f6",
              marginBottom: "30px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "24px",
              color: "#666",
            }}
          >
            <span style={{ marginRight: "20px" }}>By {author}</span>
            <span>•</span>
            <span style={{ marginLeft: "20px" }}>{date}</span>
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

---

## 3. 样式与主题

### 3.1 渐变背景

```tsx
// app/api/og/gradient/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "60px",
          justifyContent: "center",
        }}
      >
        <h1
          style={{ fontSize: "72px", fontWeight: "bold", marginBottom: "20px" }}
        >
          Gradient Background
        </h1>
        <p style={{ fontSize: "32px", opacity: 0.9 }}>
          Beautiful gradient backgrounds for your images
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

### 3.2 暗色主题

```tsx
// app/api/og/dark/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Dark Theme";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#fff",
          padding: "60px",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#1a1a1a",
            borderRadius: "20px",
            padding: "60px",
            border: "2px solid #333",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              marginBottom: "20px",
              background: "linear-gradient(to right, #60a5fa, #a78bfa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: "28px", color: "#999" }}>
            Modern dark theme design
          </p>
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

### 3.3 品牌主题

```tsx
// app/api/og/brand/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const brandColors = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Brand Title";
  const subtitle = searchParams.get("subtitle") || "Brand Subtitle";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: brandColors.primary,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "300px",
            backgroundColor: brandColors.secondary,
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
          }}
        >
          🚀
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {title}
          </h1>
          <div
            style={{
              width: "100px",
              height: "4px",
              backgroundColor: brandColors.accent,
              marginBottom: "20px",
            }}
          />
          <p style={{ fontSize: "32px", opacity: 0.9 }}>{subtitle}</p>
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

---

## 4. 动态内容

### 4.1 博客文章图片

```tsx
// app/api/og/blog/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Blog Post";
  const category = searchParams.get("category") || "Technology";
  const readTime = searchParams.get("readTime") || "5 min read";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "20px",
              marginRight: "15px",
            }}
          >
            {category}
          </div>
          <span style={{ fontSize: "20px", color: "#666" }}>{readTime}</span>
        </div>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#111",
            marginBottom: "30px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              marginRight: "20px",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ fontSize: "24px", fontWeight: "bold", color: "#111" }}
            >
              Your Blog
            </span>
            <span style={{ fontSize: "18px", color: "#666" }}>
              blog.example.com
            </span>
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

### 4.2 产品展示图片

```tsx
// app/api/og/product/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") || "Product Name";
  const price = searchParams.get("price") || "$99.99";
  const rating = searchParams.get("rating") || "4.5";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#f9fafb",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            backgroundColor: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "50%",
              backgroundColor: "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "120px",
            }}
          >
            📦
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "60px",
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: "#111",
              }}
            >
              {name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#3b82f6",
                  marginRight: "15px",
                }}
              >
                {price}
              </span>
              <span style={{ fontSize: "24px", color: "#666" }}>
                ⭐ {rating}
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "15px 30px",
                borderRadius: "10px",
                fontSize: "24px",
                textAlign: "center",
                width: "200px",
              }}
            >
              Buy Now
            </div>
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

### 4.3 统计数据图片

```tsx
// app/api/og/stats/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const users = searchParams.get("users") || "10,000";
  const posts = searchParams.get("posts") || "50,000";
  const likes = searchParams.get("likes") || "100,000";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "60px",
        }}
      >
        <h1
          style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "40px" }}
        >
          Platform Statistics
        </h1>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {users}
            </div>
            <div style={{ fontSize: "24px", opacity: 0.9 }}>Users</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {posts}
            </div>
            <div style={{ fontSize: "24px", opacity: 0.9 }}>Posts</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {likes}
            </div>
            <div style={{ fontSize: "24px", opacity: 0.9 }}>Likes</div>
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

---

## 5. 实战案例

### 5.1 多语言 OG 图片

```tsx
// app/api/og/i18n/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const translations = {
  en: { title: "Welcome", subtitle: "to our platform" },
  zh: { title: "欢迎", subtitle: "来到我们的平台" },
  ja: { title: "ようこそ", subtitle: "私たちのプラットフォームへ" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations;
  const t = translations[lang] || translations.en;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1a1a",
          color: "white",
          padding: "60px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          style={{ fontSize: "80px", fontWeight: "bold", marginBottom: "20px" }}
        >
          {t.title}
        </h1>
        <p style={{ fontSize: "40px", opacity: 0.8 }}>{t.subtitle}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 5.2 用户个人资料卡片

```tsx
// app/api/og/profile/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") || "John Doe";
  const bio = searchParams.get("bio") || "Software Developer";
  const followers = searchParams.get("followers") || "1,234";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            padding: "60px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              marginBottom: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "64px",
              color: "white",
            }}
          >
            {name.charAt(0)}
          </div>

          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#111",
            }}
          >
            {name}
          </h1>

          <p style={{ fontSize: "28px", color: "#666", marginBottom: "30px" }}>
            {bio}
          </p>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#3b82f6",
                marginRight: "10px",
              }}
            >
              {followers}
            </span>
            <span style={{ fontSize: "24px", color: "#666" }}>Followers</span>
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

---

## 6. 适用场景

ImageResponse 适用于以下场景:

1. **社交分享**: 生成 Open Graph 图片,提升社交媒体分享效果
2. **动态内容**: 根据 URL 参数生成不同的图片
3. **博客文章**: 为每篇文章生成独特的封面图
4. **产品展示**: 动态生成产品图片
5. **用户资料**: 生成用户个人资料卡片
6. **统计数据**: 可视化展示统计数据
7. **多语言**: 支持多语言内容
8. **品牌推广**: 生成品牌宣传图片

---

## 7. 注意事项

### 7.1 性能限制

- **内存限制**: Edge Runtime 有 128MB 内存限制
- **执行时间**: 最长 30 秒执行时间
- **图片大小**: 建议不超过 2MB
- **字体文件**: 字体文件大小会影响性能

### 7.2 CSS 支持

ImageResponse 只支持部分 CSS 属性:

**支持的属性**:

- display (flex only)
- flexDirection
- alignItems
- justifyContent
- fontSize
- fontWeight
- color
- backgroundColor
- padding
- margin
- borderRadius
- width
- height

**不支持的属性**:

- position
- float
- grid
- transform
- animation
- transition

### 7.3 字体处理

```tsx
// 正确的字体加载方式
const fontData = await fetch(new URL("./font.ttf", import.meta.url)).then(
  (res) => res.arrayBuffer()
);

// 错误的方式 - 不要使用fs
// const fontData = fs.readFileSync('./font.ttf');
```

### 7.4 图片尺寸

推荐的图片尺寸:

| 平台         | 尺寸     | 比例   |
| ------------ | -------- | ------ |
| Open Graph   | 1200x630 | 1.91:1 |
| Twitter Card | 1200x600 | 2:1    |
| LinkedIn     | 1200x627 | 1.91:1 |
| Facebook     | 1200x630 | 1.91:1 |

---

## 8. 常见问题

### 8.1 如何使用自定义字体?

**问题**: 需要使用自定义字体。

**解决方案**:

```tsx
export async function GET() {
  const fontData = await fetch(
    new URL("./Inter-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(<div style={{ fontFamily: "Inter" }}>Hello</div>, {
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
  });
}
```

### 8.2 如何设置缓存?

**问题**: 需要缓存生成的图片。

**解决方案**:

```tsx
export async function GET() {
  const imageResponse = new ImageResponse(<div>Hello</div>, {
    width: 1200,
    height: 630,
  });

  imageResponse.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  return imageResponse;
}
```

### 8.3 如何处理中文字体?

**问题**: 中文字符显示为方块。

**解决方案**:

```tsx
export async function GET() {
  const fontData = await fetch(
    new URL("./NotoSansSC-Regular.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    <div style={{ fontFamily: "Noto Sans SC" }}>你好世界</div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans SC",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
```

### 8.4 如何添加图片?

**问题**: 需要在生成的图片中包含其他图片。

**解决方案**:

```tsx
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ display: "flex" }}>
        <img src="https://example.com/image.png" width="200" height="200" />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 8.5 如何设置图片格式?

**问题**: 需要生成 JPEG 而不是 PNG。

**解决方案**:

```tsx
export async function GET() {
  return new ImageResponse(<div>Hello</div>, {
    width: 1200,
    height: 630,
    format: "jpeg",
  });
}
```

### 8.6 如何处理长文本?

**问题**: 文本太长导致溢出。

**解决方案**:

```tsx
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Default Title";

  const truncatedTitle =
    title.length > 50 ? title.substring(0, 50) + "..." : title;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 60,
          width: "100%",
          height: "100%",
          padding: "50px",
        }}
      >
        {truncatedTitle}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 8.7 如何添加渐变文字?

**问题**: 需要渐变色文字效果。

**解决方案**:

```tsx
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 80,
          fontWeight: "bold",
          background: "linear-gradient(to right, #60a5fa, #a78bfa)",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Gradient Text
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### 8.8 如何处理 emoji?

**问题**: emoji 显示不正常。

**解决方案**:

```tsx
export async function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", fontSize: 100 }}>🚀 Hello World</div>,
    { width: 1200, height: 630 }
  );
}
```

### 8.9 如何设置响应头?

**问题**: 需要设置自定义响应头。

**解决方案**:

```tsx
export async function GET() {
  const response = new ImageResponse(<div>Hello</div>, {
    width: 1200,
    height: 630,
  });

  response.headers.set("X-Custom-Header", "value");
  response.headers.set("Cache-Control", "public, max-age=3600");

  return response;
}
```

### 8.10 如何调试生成的图片?

**问题**: 需要调试图片生成过程。

**解决方案**:

```tsx
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const debug = searchParams.get("debug") === "true";

  if (debug) {
    return NextResponse.json({
      params: Object.fromEntries(searchParams),
      url: request.url,
    });
  }

  return new ImageResponse(<div>Hello</div>, { width: 1200, height: 630 });
}
```

---

## 9. 总结

ImageResponse 是 Next.js 16 中生成动态图片的强大工具。通过使用 JSX 语法和 Flexbox 布局,你可以轻松创建各种类型的图片,特别适合生成 Open Graph 图片和社交分享图片。

### 核心要点

1. **JSX 语法**: 使用熟悉的 JSX 编写图片内容
2. **Edge Runtime**: 在边缘节点快速生成图片
3. **Flexbox 布局**: 使用 Flexbox 进行灵活布局
4. **自定义字体**: 支持加载自定义字体文件
5. **动态内容**: 根据 URL 参数生成不同图片
6. **性能优化**: 注意内存和执行时间限制
7. **缓存策略**: 合理设置缓存提升性能
8. **多语言支持**: 支持多语言内容生成

ImageResponse 为 Next.js 应用提供了强大的动态图片生成能力,是提升社交分享效果和 SEO 的重要工具。

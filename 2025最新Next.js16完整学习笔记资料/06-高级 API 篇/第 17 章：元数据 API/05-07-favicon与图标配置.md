**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# favicon 与图标配置

## 1. 概述

favicon 和应用图标是网站品牌识别的重要组成部分。Next.js 16 提供了简单而强大的图标配置方式,支持多种格式和尺寸。

### 1.1 图标类型

- **favicon.ico**: 传统浏览器图标
- **icon.png/icon.svg**: 现代浏览器图标
- **apple-icon.png**: iOS 设备图标
- **manifest 图标**: PWA 应用图标

### 1.2 文件位置

| 文件                | 位置                    | 用途             |
| ------------------- | ----------------------- | ---------------- |
| favicon.ico         | app/favicon.ico         | 浏览器标签页图标 |
| icon.png            | app/icon.png            | 通用图标         |
| icon.svg            | app/icon.svg            | 矢量图标         |
| apple-icon.png      | app/apple-icon.png      | iOS 设备图标     |
| opengraph-image.png | app/opengraph-image.png | 社交分享图片     |

### 1.3 推荐尺寸

| 图标类型       | 尺寸                | 格式 |
| -------------- | ------------------- | ---- |
| favicon.ico    | 16x16, 32x32, 48x48 | ICO  |
| icon.png       | 32x32               | PNG  |
| apple-icon.png | 180x180             | PNG  |
| PWA 图标       | 192x192, 512x512    | PNG  |

---

## 2. 基础配置

### 2.1 静态图标

最简单的方式是直接在`app`目录下放置图标文件:

```
app/
├── favicon.ico
├── icon.png
├── apple-icon.png
└── page.tsx
```

Next.js 会自动识别这些文件并生成相应的 HTML 标签。

### 2.2 动态图标生成

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#0070f3",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "50%",
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 2.3 Apple 图标

```tsx
// app/apple-icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "linear-gradient(to bottom right, #0070f3, #00dfd8)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        App
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 2.4 SVG 图标

```tsx
// app/icon.svg
export default function Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#0070f3" />
      <text
        x="16"
        y="16"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="20"
        fontWeight="bold"
      >
        A
      </text>
    </svg>
  );
}
```

---

## 3. 元数据配置

### 3.1 基础图标配置

```tsx
// app/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/icon.png",
    shortcut: "/shortcut-icon.png",
    apple: "/apple-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
};
```

### 3.2 多尺寸图标

```tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};
```

---

## 4. 高级配置

### 4.1 favicon.ico 多尺寸合并

创建包含多个尺寸的 favicon.ico 文件:

```bash
# 使用ImageMagick合并多个PNG为ICO
convert icon-16x16.png icon-32x32.png icon-48x48.png favicon.ico
```

或使用在线工具:

- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

### 4.2 SVG 图标优化

```xml
<!-- app/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0070f3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00dfd8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="16" fill="url(#grad)"/>
  <text x="16" y="22" text-anchor="middle" fill="white" font-size="20" font-weight="bold">N</text>
</svg>
```

### 4.3 暗黑模式图标

根据系统主题显示不同的图标:

```tsx
// app/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: "/icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};
```

### 4.4 动态生成带文字的图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default async function Icon() {
  // 从数据库或配置获取文字
  const text = await getBrandInitial();

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {text}
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 4.5 带 Logo 的图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";
import fs from "fs/promises";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default async function Icon() {
  // 读取logo图片
  const logoData = await fs.readFile("./public/logo.png");
  const logoBase64 = logoData.toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
        }}
      >
        <img
          src={`data:image/png;base64,${logoBase64}`}
          width={28}
          height={28}
          alt="Logo"
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 4.6 渐变背景图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #ff6b6b, #4ecdc4)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "white",
            fontWeight: "bold",
          }}
        >
          N
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## 5. PWA 图标配置

### 5.1 manifest.json 配置

```json
{
  "name": "My Next.js App",
  "short_name": "Next App",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "theme_color": "#0070f3",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### 5.2 Maskable 图标

Maskable 图标可以适应不同形状的图标遮罩:

```tsx
// app/icon-maskable.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function MaskableIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0070f3",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 300,
            color: "white",
            fontWeight: "bold",
          }}
        >
          N
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 5.3 完整 PWA 图标集

```
public/
├── icon-192x192.png
├── icon-512x512.png
├── icon-maskable-192x192.png
├── icon-maskable-512x512.png
└── manifest.json
```

manifest.json 配置:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 5.4 动态生成 PWA 图标

```tsx
// app/icon-192.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";

export default function PWAIcon192() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            fontSize: 120,
            color: "white",
            fontWeight: "bold",
          }}
        >
          N
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 5.5 iOS 启动画面

```tsx
// app/apple-touch-startup-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1125,
  height: 2436,
};

export const contentType = "image/png";

export default function AppleStartupImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom, #0070f3, #00dfd8)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 200,
            color: "white",
            fontWeight: "bold",
            marginBottom: "40px",
          }}
        >
          N
        </div>
        <div
          style={{
            fontSize: 60,
            color: "white",
          }}
        >
          Next.js App
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## 6. 实战案例

### 6.1 博客网站图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function BlogIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#ffd700",
            fontWeight: "bold",
          }}
        >
          B
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 6.2 电商网站图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function ShopIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "white",
            fontWeight: "bold",
          }}
        >
          🛒
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 6.3 企业官网图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function CorporateIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2c3e50",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#ecf0f1",
            fontWeight: "bold",
            fontFamily: "serif",
          }}
        >
          C
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 6.4 SaaS 产品图标

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function SaaSIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: "white",
            fontWeight: "bold",
          }}
        >
          S
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

### 6.5 多租户应用图标

```tsx
// app/[tenant]/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default async function TenantIcon({
  params,
}: {
  params: { tenant: string };
}) {
  // 从数据库获取租户配置
  const tenantConfig = await getTenantConfig(params.tenant);

  return new ImageResponse(
    (
      <div
        style={{
          background: tenantConfig.brandColor,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "white",
            fontWeight: "bold",
          }}
        >
          {tenantConfig.initial}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## 7. 适用场景

### 7.1 品牌识别

**需求**: 提升品牌在浏览器标签页的识别度

**策略**:

- 使用品牌主色调
- 包含品牌首字母或 logo
- 保持简洁清晰
- 多尺寸适配

### 7.2 PWA 应用

**需求**: 提供完整的 PWA 图标集

**策略**:

- 提供 192x192 和 512x512 两种尺寸
- 创建 maskable 图标
- 配置 manifest.json
- 添加 iOS 启动画面

### 7.3 多品牌网站

**需求**: 不同子域名或路由使用不同图标

**策略**:

- 路由级别图标配置
- 动态生成图标
- 根据租户配置生成

### 7.4 暗黑模式适配

**需求**: 根据系统主题显示不同图标

**策略**:

- 使用 media 查询
- 提供亮色和暗色两版图标
- SVG 图标使用 currentColor

### 7.5 国际化

**需求**: 不同语言版本使用不同图标

**策略**:

- 根据语言参数生成图标
- 包含语言特定的文字或符号
- 保持品牌一致性

---

## 8. 注意事项

### 8.1 图标尺寸

**favicon.ico**: 必须包含 16x16, 32x32, 48x48 三种尺寸

**icon.png**: 推荐 32x32 像素

**apple-icon.png**: 必须是 180x180 像素

**PWA 图标**: 必须提供 192x192 和 512x512 两种尺寸

### 8.2 文件格式

**ICO**: 用于 favicon.ico,兼容性最好

**PNG**: 用于现代浏览器图标,支持透明背景

**SVG**: 矢量格式,可无限缩放,但部分浏览器不支持

### 8.3 性能优化

```tsx
// 使用Edge Runtime提升性能
export const runtime = "edge";

// 设置缓存时间
export const revalidate = 3600; // 1小时
```

### 8.4 透明背景

PNG 图标应使用透明背景,避免白色或其他颜色背景:

```tsx
<div
  style={{
    background: 'transparent', // 透明背景
    // 或使用渐变
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}
>
```

### 8.5 文件命名

Next.js 对图标文件名有严格要求:

- `favicon.ico` - 不能改名
- `icon.png` / `icon.svg` - 不能改名
- `apple-icon.png` - 不能改名
- `icon.tsx` - 动态生成图标

### 8.6 缓存问题

浏览器会缓存 favicon,更新后可能不会立即生效:

```tsx
// 添加版本号
export const metadata: Metadata = {
  icons: {
    icon: `/icon.png?v=${Date.now()}`,
  },
};
```

或清除浏览器缓存。

---

## 9. 常见问题

### 9.1 favicon 不显示?

**问题**: 设置了 favicon 但浏览器不显示。

**原因**:

1. 文件名不正确
2. 文件位置不对
3. 浏览器缓存
4. 文件格式不支持

**解决方案**:

```tsx
// 1. 确保文件名正确
app / favicon.ico; // ✓ 正确
app / favicon.png; // ✗ 错误

// 2. 清除浏览器缓存
// Chrome: Ctrl+Shift+Delete

// 3. 使用元数据API强制刷新
export const metadata: Metadata = {
  icons: {
    icon: `/favicon.ico?v=${Date.now()}`,
  },
};
```

### 9.2 如何创建多尺寸 favicon.ico?

**问题**: 需要创建包含多个尺寸的 favicon.ico 文件。

**解决方案**:

```bash
# 使用ImageMagick
convert icon-16x16.png icon-32x32.png icon-48x48.png favicon.ico

# 或使用在线工具
# https://www.favicon-generator.org/
# https://realfavicongenerator.net/
```

### 9.3 动态生成的图标不显示?

**问题**: 使用 icon.tsx 生成的图标不显示。

**原因**:

1. 文件名不正确
2. 没有导出必要的配置
3. ImageResponse 配置错误
4. 没有使用 Edge Runtime

**解决方案**:

```tsx
// app/icon.tsx (文件名必须正确)
import { ImageResponse } from "next/og";

export const runtime = "edge"; // 必须使用edge runtime

export const size = { width: 32, height: 32 }; // 导出size
export const contentType = "image/png"; // 导出contentType

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={
          {
            /* 样式 */
          }
        }
      >
        内容
      </div>
    ),
    { ...size }
  );
}
```

### 9.4 如何为不同路由设置不同图标?

**问题**: 希望不同页面显示不同的图标。

**解决方案**:

```
app/
├── icon.png (全局图标)
├── blog/
│   ├── icon.png (博客图标)
│   └── page.tsx
└── shop/
    ├── icon.png (商城图标)
    └── page.tsx
```

或使用动态生成:

```tsx
// app/blog/icon.tsx
export default function BlogIcon() {
  return new ImageResponse(
    <div style={{ background: "#1a1a1a" /* ... */ }}>B</div>,
    { width: 32, height: 32 }
  );
}
```

### 9.5 Apple Touch Icon 不显示?

**问题**: iOS 设备添加到主屏幕时图标不正确。

**原因**:

1. 文件名不正确
2. 尺寸不是 180x180
3. 文件格式不是 PNG

**解决方案**:

```
app/apple-icon.png  // 文件名必须是apple-icon.png
尺寸: 180x180像素
格式: PNG
```

### 9.6 如何优化图标文件大小?

**问题**: 图标文件太大,影响加载速度。

**解决方案**:

```bash
# 使用ImageOptim压缩PNG
# https://imageoptim.com/

# 使用TinyPNG在线压缩
# https://tinypng.com/

# 使用SVGO优化SVG
npx svgo icon.svg
```

### 9.7 如何支持暗黑模式图标?

**问题**: 希望在暗黑模式下显示不同的图标。

**解决方案**:

```tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: "/icon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};
```

### 9.8 如何测试 PWA 图标?

**问题**: 不知道 PWA 图标是否正确配置。

**解决方案**:

```bash
# 1. 使用Chrome DevTools
# Application > Manifest

# 2. 使用Lighthouse
npx lighthouse https://example.com --view

# 3. 使用PWA Builder
# https://www.pwabuilder.com/

# 4. 在真实设备上测试
# Android: 添加到主屏幕
# iOS: 添加到主屏幕
```

### 9.9 如何生成 Maskable 图标?

**问题**: 需要创建适配不同形状的 maskable 图标。

**解决方案**:

```tsx
// 确保重要内容在安全区域内(中心80%)
export default function MaskableIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0070f3",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20%", // 留出安全边距
        }}
      >
        <div style={{ fontSize: 300, color: "white" }}>N</div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
```

### 9.10 如何处理图标缓存?

**问题**: 更新图标后浏览器仍显示旧图标。

**解决方案**:

```tsx
// 1. 添加版本号
export const metadata: Metadata = {
  icons: {
    icon: `/icon.png?v=2`,
  },
};

// 2. 使用动态时间戳
export const metadata: Metadata = {
  icons: {
    icon: `/icon.png?v=${process.env.BUILD_ID}`,
  },
};

// 3. 清除浏览器缓存
// Chrome: chrome://settings/clearBrowserData
```

---

## 10. 总结

### 10.1 核心要点

1. **文件位置**: 图标文件必须放在 app 目录下
2. **文件命名**: 必须使用 Next.js 规定的文件名
3. **推荐尺寸**: favicon.ico(16/32/48), icon.png(32), apple-icon.png(180)
4. **动态生成**: 使用 icon.tsx 动态生成图标
5. **PWA 支持**: 提供 192x192 和 512x512 两种尺寸
6. **性能优化**: 使用 Edge Runtime 和缓存

### 10.2 最佳实践

| 实践             | 说明             | 优先级 |
| ---------------- | ---------------- | ------ |
| 提供 favicon.ico | 兼容性最好       | 高     |
| 使用 PNG 格式    | 支持透明背景     | 高     |
| 多尺寸支持       | 适配不同设备     | 中     |
| 动态生成         | 灵活配置         | 中     |
| PWA 图标         | 支持添加到主屏幕 | 中     |
| Maskable 图标    | 适配不同形状     | 低     |
| 暗黑模式         | 提升用户体验     | 低     |

### 10.3 配置清单

```
app/
├── favicon.ico          # ✓ 必需
├── icon.png             # ✓ 推荐
├── icon.svg             # ○ 可选
├── apple-icon.png       # ✓ 推荐
├── icon-192x192.png     # ✓ PWA必需
├── icon-512x512.png     # ✓ PWA必需
└── manifest.json        # ✓ PWA必需
```

### 10.4 下一步

学习完 favicon 和图标配置后,建议继续学习:

1. **manifest.json 配置**: 完整的 PWA 配置
2. **Open Graph 图片**: 社交分享优化
3. **性能优化**: 图片优化和缓存策略
4. **品牌设计**: 统一的视觉识别系统

favicon 和应用图标虽然看起来很小,但对品牌识别和用户体验有重要影响。通过 Next.js 16 的强大功能,我们可以轻松配置和优化各种图标,为用户提供专业的视觉体验。

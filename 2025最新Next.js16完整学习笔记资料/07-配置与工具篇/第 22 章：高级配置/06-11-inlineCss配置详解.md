**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# inlineCss 配置详解

## 概述

inlineCss 是 Next.js 16 中的实验性配置选项，用于控制是否将 CSS 内联到 HTML 中。内联 CSS 可以减少 HTTP 请求，加快首屏渲染速度，但也会增加 HTML 文件大小。

### inlineCss 的作用

1. **减少请求**：减少 CSS 文件的 HTTP 请求
2. **加快渲染**：CSS 直接在 HTML 中，无需等待加载
3. **优化首屏**：提升首屏渲染速度
4. **灵活控制**：可以选择性内联 CSS
5. **性能优化**：适合小型 CSS 文件

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
  },
};
```

### 配置选项

| 选项    | 类型    | 说明                  |
| ------- | ------- | --------------------- |
| `true`  | boolean | 启用 CSS 内联         |
| `false` | boolean | 禁用 CSS 内联（默认） |

### 启用内联 CSS

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
  },
};
```

**效果**：

```html
<!-- 生成的HTML -->
<html>
  <head>
    <style>
      .button {
        padding: 10px 20px;
      }
      .container {
        max-width: 1200px;
      }
    </style>
  </head>
  <body>
    ...
  </body>
</html>
```

### 禁用内联 CSS

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: false, // 默认值
  },
};
```

**效果**：

```html
<!-- 生成的HTML -->
<html>
  <head>
    <link rel="stylesheet" href="/_next/static/css/app.css" />
  </head>
  <body>
    ...
  </body>
</html>
```

## 高级配置

### 条件内联 CSS

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: process.env.NODE_ENV === "production",
  },
};
```

### 结合 Critical CSS

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Critical CSS */
            body { margin: 0; font-family: sans-serif; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { height: 60px; background: #fff; }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 自定义内联策略

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          criticalStyles: {
            name: "critical",
            test: /critical\.css$/,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};
```

### 性能优化配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
    cssChunking: "loose",
  },
  compress: true,
};
```

### 结合 CSS Modules

```tsx
// components/Button.tsx
import styles from "./Button.module.css";

export default function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
```

```css
/* Button.module.css */
.button {
  padding: 10px 20px;
  border-radius: 4px;
  background: blue;
  color: white;
}
```

### 动态 CSS 加载

```tsx
// app/page.tsx
"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // 动态加载非关键CSS
    import("./non-critical.css");
  }, []);

  return <div>Content</div>;
}
```

## 实战案例

### 案例 1：博客网站优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
  },
};
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { margin: 0; font-family: 'Georgia', serif; line-height: 1.6; }
            .article { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #333; color: white; padding: 20px; }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 案例 2：电商首页优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
    cssChunking: "loose",
  },
};
```

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <>
      <style jsx>{`
        .hero {
          height: 500px;
          background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .products {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          padding: 40px;
        }
      `}</style>
      <div className="hero">
        <h1>Welcome to Our Store</h1>
      </div>
      <div className="products">{/* Products */}</div>
    </>
  );
}
```

### 案例 3：移动端优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: true,
  },
};
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * { box-sizing: border-box; }
            body { margin: 0; font-family: -apple-system, sans-serif; }
            .container { padding: 16px; }
            @media (min-width: 768px) {
              .container { padding: 24px; }
            }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 适用场景

| 场景          | 是否启用 | 原因           |
| ------------- | -------- | -------------- |
| 小型 CSS 文件 | 是       | 减少 HTTP 请求 |
| 大型 CSS 文件 | 否       | 增加 HTML 大小 |
| 首屏关键 CSS  | 是       | 加快首屏渲染   |
| 非关键 CSS    | 否       | 延迟加载       |
| 移动端应用    | 是       | 减少请求延迟   |
| 桌面端应用    | 否       | 利用缓存       |

## 注意事项

### 1. HTML 大小控制

```javascript
// 避免内联过大的CSS
// 建议内联CSS < 14KB
module.exports = {
  experimental: {
    inlineCss: process.env.CSS_SIZE < 14000,
  },
};
```

### 2. 缓存策略

```javascript
// 内联CSS无法利用浏览器缓存
// 适合频繁变化的页面
module.exports = {
  experimental: {
    inlineCss: true,
  },
};
```

### 3. 性能监控

```tsx
// 监控HTML大小
if (typeof window !== "undefined") {
  const htmlSize = document.documentElement.outerHTML.length;
  console.log("HTML size:", htmlSize, "bytes");
}
```

### 4. Critical CSS 提取

```bash
# 使用工具提取关键CSS
npm install critical
```

```javascript
// scripts/extract-critical.js
const critical = require("critical");

critical.generate({
  inline: true,
  base: ".next/",
  src: "index.html",
  target: "index-critical.html",
  width: 1300,
  height: 900,
});
```

### 5. 生产环境配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: process.env.NODE_ENV === "production",
  },
};
```

## 常见问题

### 1. 内联 CSS 不生效？

**问题**：配置后 CSS 未内联

**解决方案**：

```bash
# 清理缓存重新构建
rm -rf .next
npm run build
```

### 2. HTML 文件过大？

**问题**：内联 CSS 导致 HTML 过大

**解决方案**：

```javascript
// 只内联关键CSS
module.exports = {
  experimental: {
    inlineCss: false,
  },
};
```

### 3. 如何选择性内联？

**问题**：只想内联部分 CSS

**解决方案**：

```tsx
// 使用styled-jsx内联关键样式
<style jsx>{`
  .critical {
    /* 关键样式 */
  }
`}</style>
```

### 4. 与 CSS Modules 冲突？

**问题**：CSS Modules 样式未内联

**解决方案**：

```javascript
// CSS Modules会自动处理
import styles from "./page.module.css";
```

### 5. 如何测试内联效果？

**问题**：如何验证 CSS 已内联

**解决方案**：

```bash
# 构建并查看HTML
npm run build
npm start
# 查看页面源代码
```

### 6. 内联 CSS 与 CDN？

**问题**：使用 CDN 时内联 CSS

**解决方案**：

```javascript
// 内联CSS不受CDN影响
module.exports = {
  assetPrefix: "https://cdn.example.com",
  experimental: {
    inlineCss: true,
  },
};
```

### 7. 动态样式内联？

**问题**：动态生成的样式如何内联

**解决方案**：

```tsx
// 使用styled-jsx
<style jsx>{`
  .dynamic {
    color: ${props.color};
  }
`}</style>
```

### 8. 内联 CSS 与 SSR？

**问题**：SSR 时 CSS 内联

**解决方案**：

```tsx
// SSR自动处理内联CSS
export default function Page() {
  return <div>Content</div>;
}
```

### 9. 如何优化内联 CSS 大小？

**问题**：内联 CSS 太大

**解决方案**：

```javascript
// 使用CSS压缩
module.exports = {
  experimental: {
    inlineCss: true,
  },
  compress: true,
};
```

### 10. 内联 CSS 与 Tailwind？

**问题**：Tailwind CSS 内联

**解决方案**：

```javascript
// Tailwind会自动优化
module.exports = {
  experimental: {
    inlineCss: true,
  },
};
```

### 11. 如何分离关键 CSS？

**问题**：只内联关键 CSS

**解决方案**：

```tsx
// app/layout.tsx
<head>
  <style
    dangerouslySetInnerHTML={{
      __html: criticalCss,
    }}
  />
  <link rel="stylesheet" href="/non-critical.css" />
</head>
```

### 12. 内联 CSS 与性能？

**问题**：内联 CSS 对性能的影响

**解决方案**：

```javascript
// 监控性能指标
if (typeof window !== "undefined") {
  const perfData = performance.getEntriesByType("navigation")[0];
  console.log("DOM Content Loaded:", perfData.domContentLoadedEventEnd);
}
```

### 13. 如何处理字体？

**问题**：字体文件是否内联

**解决方案**：

```css
/* 字体不建议内联，使用外部链接 */
@font-face {
  font-family: "MyFont";
  src: url("/fonts/myfont.woff2") format("woff2");
}
```

### 14. 内联 CSS 与缓存？

**问题**：内联 CSS 无法缓存

**解决方案**：

```javascript
// 对于不常变化的页面，不建议内联
module.exports = {
  experimental: {
    inlineCss: false,
  },
};
```

### 15. 如何调试内联 CSS？

**问题**：调试内联 CSS

**解决方案**：

```bash
# 使用Chrome DevTools
# Elements -> Styles 查看内联样式
```

### 16. 如何处理 CSS 优先级?

**问题**: 内联 CSS 与外部 CSS 的优先级冲突

**解决方案**:

```css
/* 外部CSS使用!important */
.button {
  background: blue !important;
}
```

```tsx
// 或者调整内联CSS
<style
  dangerouslySetInnerHTML={{
    __html: `
    .button {
      background: red;
    }
  `,
  }}
/>
```

**优先级对比**:

| CSS 类型        | 优先级 | 适用场景 |
| --------------- | ------ | -------- |
| 内联 style 属性 | 最高   | 动态样式 |
| 内联<style>标签 | 高     | 关键 CSS |
| 外部 CSS 文件   | 中     | 通用样式 |
| !important      | 覆盖   | 强制样式 |

### 17. 如何实现条件内联?

**问题**: 根据条件决定是否内联 CSS

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    inlineCss: process.env.NODE_ENV === "production",
  },
};
```

```tsx
// 或者在组件中条件渲染
export default function Page() {
  const shouldInline = process.env.NODE_ENV === "production";

  return (
    <>
      {shouldInline ? (
        <style>{criticalCSS}</style>
      ) : (
        <link rel="stylesheet" href="/styles.css" />
      )}
    </>
  );
}
```

### 18. 如何处理 CSS 变量?

**问题**: 内联 CSS 中使用 CSS 变量

**解决方案**:

```tsx
export default function Page() {
  return (
    <>
      <style>{`
        :root {
          --primary-color: #007bff;
          --secondary-color: #6c757d;
          --spacing: 16px;
        }

        .container {
          padding: var(--spacing);
          color: var(--primary-color);
        }
      `}</style>

      <div className="container">内容</div>
    </>
  );
}
```

### 19. 如何优化内联 CSS 性能?

**问题**: 内联 CSS 导致 HTML 过大

**解决方案**:

```typescript
// lib/css-optimizer.ts
export function optimizeInlineCSS(css: string): string {
  return css
    .replace(/\s+/g, " ") // 移除多余空格
    .replace(/\/\*.*?\*\//g, "") // 移除注释
    .replace(/;\s*}/g, "}") // 移除最后的分号
    .trim();
}
```

```tsx
import { optimizeInlineCSS } from "@/lib/css-optimizer";

export default function Page() {
  const css = `
    .button {
      padding: 10px 20px;
      background: blue;
      color: white;
    }
  `;

  return <style>{optimizeInlineCSS(css)}</style>;
}
```

### 20. 如何处理媒体查询?

**问题**: 内联 CSS 中的响应式设计

**解决方案**:

```tsx
export default function Page() {
  return (
    <style>{`
      .container {
        width: 100%;
        padding: 16px;
      }

      @media (min-width: 768px) {
        .container {
          max-width: 720px;
          margin: 0 auto;
        }
      }

      @media (min-width: 1024px) {
        .container {
          max-width: 960px;
        }
      }
    `}</style>
  );
}
```

### 21. 如何实现 CSS 模块化?

**问题**: 内联 CSS 的模块化管理

**解决方案**:

```typescript
// styles/critical.ts
export const buttonStyles = `
  .btn {
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }
`;

export const layoutStyles = `
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
`;
```

```tsx
import { buttonStyles, layoutStyles } from "@/styles/critical";

export default function Page() {
  return (
    <>
      <style>{buttonStyles}</style>
      <style>{layoutStyles}</style>
    </>
  );
}
```

### 22. 如何处理字体内联?

**问题**: 内联字体 CSS 以优化加载

**解决方案**:

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style>{`
          @font-face {
            font-family: 'CustomFont';
            src: url('/fonts/custom.woff2') format('woff2');
            font-display: swap;
          }

          body {
            font-family: 'CustomFont', system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 23. 如何实现主题切换?

**问题**: 内联 CSS 支持主题切换

**解决方案**:

```tsx
"use client";

import { useState } from "react";

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const themeStyles =
    theme === "light"
      ? `
    :root {
      --bg-color: white;
      --text-color: black;
    }
  `
      : `
    :root {
      --bg-color: #1a1a1a;
      --text-color: white;
    }
  `;

  return (
    <>
      <style>{themeStyles}</style>
      <style>{`
        body {
          background: var(--bg-color);
          color: var(--text-color);
        }
      `}</style>

      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        切换主题
      </button>
    </>
  );
}
```

### 24. 如何处理 CSS 动画?

**问题**: 内联 CSS 动画的性能优化

**解决方案**:

```tsx
export default function Page() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="animate-in">内容</div>
    </>
  );
}
```

### 25. 如何监控内联 CSS 大小?

**问题**: 监控内联 CSS 对 HTML 大小的影响

**解决方案**:

```typescript
// lib/css-monitor.ts
export function monitorInlineCSS() {
  if (typeof window === "undefined") return;

  const styleTags = document.querySelectorAll("style");
  let totalSize = 0;

  styleTags.forEach((tag) => {
    const size = new Blob([tag.textContent || ""]).size;
    totalSize += size;
    console.log("Style标签大小:", {
      content: tag.textContent?.substring(0, 50),
      size: `${(size / 1024).toFixed(2)}KB`,
    });
  });

  console.log("总内联CSS大小:", `${(totalSize / 1024).toFixed(2)}KB`);

  // 警告阈值
  if (totalSize > 14 * 1024) {
    console.warn("内联CSS超过14KB,建议使用外部文件");
  }
}
```

```tsx
"use client";

import { useEffect } from "react";
import { monitorInlineCSS } from "@/lib/css-monitor";

export default function Page() {
  useEffect(() => {
    monitorInlineCSS();
  }, []);

  return <div>内容</div>;
}
```

## 最佳实践

### 1. 只内联关键 CSS

```tsx
// 关键CSS - 内联
const criticalCSS = `
  body { margin: 0; font-family: system-ui; }
  .header { height: 60px; background: white; }
  .container { max-width: 1200px; margin: 0 auto; }
`;

// 非关键CSS - 外部文件
import "./styles.css";

export default function Page() {
  return (
    <>
      <style>{criticalCSS}</style>
      <div className="container">内容</div>
    </>
  );
}
```

### 2. 使用 CSS 压缩

```typescript
// lib/minify-css.ts
import CleanCSS from "clean-css";

export function minifyCSS(css: string): string {
  const minifier = new CleanCSS({
    level: 2,
  });

  return minifier.minify(css).styles;
}
```

### 3. 合理设置缓存

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

## 总结

inlineCss 配置是优化首屏渲染的有效手段。合理使用可以：

1. **减少请求**：减少 CSS 文件的 HTTP 请求
2. **加快渲染**：CSS 直接在 HTML 中，无需等待
3. **优化首屏**：提升首屏渲染速度
4. **灵活控制**：可以选择性内联 CSS
5. **提升体验**：改善用户体验

关键要点：

- 只内联关键 CSS（< 14KB）
- 非关键 CSS 延迟加载
- 注意 HTML 文件大小
- 监控性能指标
- 结合其他优化策略
- 根据场景选择是否启用

记住：内联 CSS 是一把双刃剑，需要根据实际情况权衡利弊。对于小型 CSS 文件和首屏关键样式，内联是很好的选择；对于大型 CSS 文件，建议使用外部文件并利用浏览器缓存。

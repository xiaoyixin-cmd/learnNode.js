**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# cssChunking 配置详解

## 概述

cssChunking 是 Next.js 16 中的实验性配置选项，用于控制 CSS 的分块策略。通过合理配置 CSS 分块，可以优化 CSS 加载性能，减少首屏加载时间，提升用户体验。

### cssChunking 的作用

1. **优化加载**：减少 CSS 文件大小
2. **按需加载**：只加载当前页面需要的 CSS
3. **缓存优化**：提高 CSS 缓存命中率
4. **性能提升**：减少首屏渲染时间
5. **灵活控制**：自定义 CSS 分块策略

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose", // 'strict' | 'loose'
  },
};
```

### 配置选项

| 选项     | 说明                       | 适用场景       |
| -------- | -------------------------- | -------------- |
| `strict` | 严格模式，每个页面独立 CSS | 页面样式差异大 |
| `loose`  | 宽松模式，共享公共 CSS     | 页面样式相似   |

### strict 模式

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "strict",
  },
};
```

**特点**：

- 每个页面生成独立的 CSS 文件
- CSS 文件更小，加载更快
- 适合页面样式差异大的应用
- 可能增加总体 CSS 文件数量

### loose 模式

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
};
```

**特点**：

- 多个页面共享公共 CSS
- 减少 CSS 文件数量
- 提高缓存命中率
- 适合页面样式相似的应用

## 高级配置

### 结合 CSS Modules

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
};
```

```css
/* components/Button.module.css */
.button {
  padding: 10px 20px;
  border-radius: 4px;
}

.primary {
  background: blue;
  color: white;
}

.secondary {
  background: gray;
  color: white;
}
```

```tsx
// components/Button.tsx
import styles from "./Button.module.css";

export default function Button({ variant = "primary", children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

### 结合 Tailwind CSS

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
};
```

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 自定义 CSS 优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          styles: {
            name: "styles",
            test: /\.css$/,
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

### CSS 压缩配置

```javascript
// next.config.js
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimizer.push(
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        })
      );
    }
    return config;
  },
};
```

### Critical CSS 提取

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "strict",
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
            body { margin: 0; font-family: sans-serif; }
            .container { max-width: 1200px; margin: 0 auto; }
          `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 实战案例

### 案例 1：电商网站 CSS 优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        commonStyles: {
          name: "common-styles",
          test: /\.(css|scss)$/,
          chunks: "all",
          minChunks: 2,
          priority: 10,
        },
        vendorStyles: {
          name: "vendor-styles",
          test: /[\\/]node_modules[\\/].*\.(css|scss)$/,
          chunks: "all",
          priority: 20,
        },
      };
    }
    return config;
  },
};
```

### 案例 2：多主题应用

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "strict",
  },
};
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html data-theme="light">
      <body>{children}</body>
    </html>
  );
}
```

```css
/* styles/themes.css */
[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #000000;
}

[data-theme="dark"] {
  --bg-color: #000000;
  --text-color: #ffffff;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

### 案例 3：组件库 CSS 优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  transpilePackages: ["@my-ui/components"],
};
```

```tsx
// components/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Modal } from "./Modal";
```

## 适用场景

| 场景           | 推荐配置 | 原因                 |
| -------------- | -------- | -------------------- |
| 页面样式相似   | loose    | 共享 CSS，减少文件数 |
| 页面样式差异大 | strict   | 独立 CSS，按需加载   |
| 大型应用       | loose    | 提高缓存命中率       |
| 小型应用       | strict   | 简化配置             |
| 多主题应用     | strict   | 独立主题 CSS         |
| 组件库         | loose    | 共享组件样式         |

## 注意事项

### 1. CSS 加载顺序

```tsx
// 确保CSS按正确顺序加载
import "./global.css";
import "./theme.css";
import styles from "./page.module.css";
```

### 2. CSS Modules 命名

```css
/* 使用有意义的类名 */
.button-primary {
}
.button-secondary {
}

/* 避免过于通用的类名 */
.btn {
} /* 可能冲突 */
```

### 3. 避免 CSS 冲突

```css
/* 使用CSS Modules */
.container {
}

/* 或使用BEM命名 */
.page__container {
}
```

### 4. 性能监控

```javascript
// 监控CSS加载性能
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    const cssResources = performance
      .getEntriesByType("resource")
      .filter((r) => r.name.endsWith(".css"));
    console.log("CSS files:", cssResources.length);
    console.log(
      "Total CSS size:",
      cssResources.reduce((sum, r) => sum + r.transferSize, 0)
    );
  });
}
```

### 5. 生产环境优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: process.env.NODE_ENV === "production" ? "loose" : "strict",
  },
};
```

## 常见问题

### 1. CSS 未生效？

**问题**：配置后 CSS 样式未生效

**解决方案**：

```bash
# 清理缓存
rm -rf .next
npm run build
```

### 2. CSS 文件过多？

**问题**：strict 模式生成太多 CSS 文件

**解决方案**：

```javascript
// 改用loose模式
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
};
```

### 3. CSS 加载慢？

**问题**：CSS 加载速度慢

**解决方案**：

```javascript
// 启用CSS压缩
module.exports = {
  compress: true,
  experimental: {
    cssChunking: "loose",
  },
};
```

### 4. CSS 冲突？

**问题**：不同页面 CSS 样式冲突

**解决方案**：

```tsx
// 使用CSS Modules
import styles from "./page.module.css";

export default function Page() {
  return <div className={styles.container}>Content</div>;
}
```

### 5. 如何调试 CSS 分块？

**问题**：不知道 CSS 如何分块

**解决方案**：

```bash
# 构建并分析
npm run build
# 查看.next/static/css目录
```

### 6. Tailwind CSS 配置？

**问题**：Tailwind CSS 与 cssChunking 配合

**解决方案**：

```javascript
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
};
// Tailwind会自动优化
```

### 7. CSS Modules 不工作？

**问题**：CSS Modules 样式未应用

**解决方案**：

```tsx
// 确保文件名包含.module.css
import styles from "./Component.module.css";
```

### 8. 全局 CSS 位置？

**问题**：全局 CSS 应该放在哪里

**解决方案**：

```tsx
// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 9. CSS 变量支持？

**问题**：CSS 变量是否支持

**解决方案**：

```css
/* 完全支持CSS变量 */
:root {
  --primary-color: #0070f3;
}

.button {
  background: var(--primary-color);
}
```

### 10. 如何优化 CSS 大小？

**问题**：CSS 文件太大

**解决方案**：

```javascript
// 使用PurgeCSS
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  webpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.plugins.push(
        new PurgeCSSPlugin({
          paths: glob.sync("./app/**/*", { nodir: true }),
        })
      );
    }
    return config;
  },
};
```

### 11. 动态导入 CSS？

**问题**：如何动态导入 CSS

**解决方案**：

```tsx
// 使用动态导入
const loadStyles = async () => {
  await import("./dynamic-styles.css");
};
```

### 12. CSS 预处理器？

**问题**：如何使用 Sass/Less

**解决方案**：

```bash
npm install sass
```

```tsx
import styles from "./page.module.scss";
```

### 13. CSS-in-JS 配合？

**问题**：styled-components 与 cssChunking

**解决方案**：

```javascript
// CSS-in-JS不受cssChunking影响
// 它们有自己的优化策略
```

### 14. 如何分析 CSS 性能？

**问题**：分析 CSS 加载性能

**解决方案**：

```bash
# 使用Lighthouse
npm run build
npm start
# 在Chrome DevTools中运行Lighthouse
```

### 15. 生产环境 CSS 优化？

**问题**：生产环境 CSS 优化建议

**解决方案**：

```javascript
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  compress: true,
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.NODE_ENV === "production") {
      config.optimization.minimize = true;
    }
    return config;
  },
};
```

### 16. 如何处理 CSS 变量?

**问题**: CSS 变量在分块时的处理

**解决方案**:

```css
/* styles/variables.css */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-size-base: 16px;
}

/* 在全局导入 */
@import "./variables.css";
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose", // 确保变量在所有chunk中可用
  },
};
```

### 17. 如何处理第三方 CSS 库?

**问题**: 第三方 CSS 库的分块策略

**解决方案**:

```javascript
// app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css"; // 全局导入
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

**第三方库处理对比**:

| 导入方式 | cssChunking 影响 | 推荐度     |
| -------- | ---------------- | ---------- |
| 全局导入 | 包含在主 chunk   | ⭐⭐⭐⭐⭐ |
| 页面导入 | 独立 chunk       | ⭐⭐⭐     |
| 按需导入 | 多个小 chunk     | ⭐⭐       |

### 18. 如何优化关键 CSS?

**问题**: 提取关键 CSS 到内联

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "strict",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 提取关键CSS
      config.optimization.splitChunks = {
        cacheGroups: {
          critical: {
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

### 19. 如何处理 CSS 加载失败?

**问题**: CSS 文件加载失败的处理

**解决方案**:

```tsx
// app/layout.tsx
"use client";

import { useEffect } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    // 监听CSS加载错误
    const handleError = (event: ErrorEvent) => {
      if (event.target instanceof HTMLLinkElement) {
        console.error("CSS加载失败:", event.target.href);
        // 重试加载
        const link = event.target.cloneNode() as HTMLLinkElement;
        event.target.parentNode?.replaceChild(link, event.target);
      }
    };

    window.addEventListener("error", handleError, true);
    return () => window.removeEventListener("error", handleError, true);
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 20. 如何实现 CSS 预加载?

**问题**: 预加载关键 CSS 文件

**解决方案**:

```tsx
// app/layout.tsx
import { headers } from "next/headers";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* 预加载关键CSS */}
        <link rel="preload" href="/_next/static/css/critical.css" as="style" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 21. 如何处理 CSS 模块化?

**问题**: CSS Modules 与 cssChunking 的配合

**解决方案**:

```css
/* components/Button.module.css */
.button {
  padding: 10px 20px;
  border-radius: 4px;
}

.primary {
  background: var(--primary-color);
  color: white;
}

.secondary {
  background: var(--secondary-color);
  color: white;
}
```

```tsx
// components/Button.tsx
import styles from "./Button.module.css";

export default function Button({ variant = "primary", children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

### 22. 如何监控 CSS 性能?

**问题**: 实时监控 CSS 加载性能

**解决方案**:

```typescript
// lib/css-performance.ts
export function monitorCSSPerformance() {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.endsWith(".css")) {
        console.log("CSS加载:", {
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        });
      }
    }
  });

  observer.observe({ entryTypes: ["resource"] });
}
```

### 23. 如何处理 CSS 顺序?

**问题**: 确保 CSS 加载顺序正确

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },
  webpack: (config) => {
    // 确保CSS顺序
    config.module.rules.push({
      test: /\.css$/,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            importLoaders: 1,
          },
        },
      ],
    });
    return config;
  },
};
```

### 24. 如何实现 CSS 懒加载?

**问题**: 非关键 CSS 的懒加载

**解决方案**:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function LazyCSS({ href }: { href: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [href]);

  return null;
}
```

### 25. 如何优化 CSS 缓存?

**问题**: 提高 CSS 文件的缓存效率

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    cssChunking: "loose",
  },

  // 配置缓存头
  async headers() {
    return [
      {
        source: "/_next/static/css/:path*",
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

**缓存策略对比**:

| 策略     | max-age  | 适用场景 | 缓存命中率 |
| -------- | -------- | -------- | ---------- |
| 短期缓存 | 3600     | 开发环境 | 低         |
| 中期缓存 | 86400    | 测试环境 | 中         |
| 长期缓存 | 31536000 | 生产环境 | 高         |

## 最佳实践

### 1. 选择合适的分块策略

```javascript
// 根据应用类型选择
const config = {
  // 电商网站 - 页面差异大
  ecommerce: {
    experimental: {
      cssChunking: "strict",
    },
  },

  // 企业官网 - 页面相似
  corporate: {
    experimental: {
      cssChunking: "loose",
    },
  },

  // 博客 - 中等差异
  blog: {
    experimental: {
      cssChunking: "loose",
    },
  },
};
```

### 2. 结合 CSS Modules

```css
/* 使用CSS Modules实现样式隔离 */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  color: var(--primary-color);
}
```

### 3. 优化全局样式

```css
/* styles/globals.css */
/* 只包含真正全局的样式 */
:root {
  --primary-color: #007bff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui;
}
```

## 总结

cssChunking 配置是 Next.js 16 中优化 CSS 加载的重要工具。合理配置可以：

1. **提升性能**：减少 CSS 文件大小和数量
2. **优化加载**：按需加载 CSS，提高首屏速度
3. **改善缓存**：提高 CSS 缓存命中率
4. **灵活控制**：根据应用特点选择策略
5. **简化维护**：自动化 CSS 分块管理

关键要点：

- 根据应用特点选择 strict 或 loose 模式
- 结合 CSS Modules 使用效果更好
- 注意 CSS 加载顺序和命名规范
- 监控 CSS 性能指标
- 生产环境启用压缩和优化
- 定期分析和优化 CSS 大小

记住：CSS 优化是持续的过程，需要根据实际情况不断调整和优化配置。

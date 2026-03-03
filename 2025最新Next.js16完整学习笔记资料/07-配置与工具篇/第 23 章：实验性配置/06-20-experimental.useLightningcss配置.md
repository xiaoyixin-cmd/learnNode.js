**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# experimental.useLightningcss 配置

## 概述

experimental.useLightningcss 是 Next.js 16 中用于启用 Lightning CSS 的实验性配置选项。Lightning CSS 是一个用 Rust 编写的极快的 CSS 解析器、转换器和压缩器，可以显著提升 CSS 处理速度。

### useLightningcss 的作用

1. **极速编译**：比传统 CSS 处理器快 100 倍
2. **自动前缀**：自动添加浏览器前缀
3. **代码压缩**：更小的 CSS 文件
4. **语法转换**：支持现代 CSS 语法
5. **零配置**：开箱即用

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },
};
```

### 安装依赖

```bash
npm install lightningcss
```

### 使用现代 CSS

```css
/* styles/globals.css */
.container {
  /* 嵌套语法 */
  & .title {
    color: blue;
  }

  /* 自定义属性 */
  --primary-color: #007bff;
  color: var(--primary-color);

  /* 现代颜色函数 */
  background: oklch(0.5 0.2 180);
}
```

### 浏览器目标配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  browserslist: ["last 2 versions", "> 1%", "not dead"],
};
```

## 高级配置

### 自定义 Lightning CSS 选项

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  lightningcss: {
    minify: true,
    sourceMap: true,
    targets: {
      chrome: 90,
      firefox: 88,
      safari: 14,
    },
  },
};
```

### CSS 模块配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  cssModules: {
    localIdentName: "[name]__[local]--[hash:base64:5]",
  },
};
```

### 全局 CSS 导入

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

### CSS 变量

```css
/* styles/variables.css */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --spacing-unit: 8px;
  --font-size-base: 16px;
}

.button {
  background: var(--color-primary);
  padding: calc(var(--spacing-unit) * 2);
  font-size: var(--font-size-base);
}
```

### 嵌套规则

```css
/* styles/nested.css */
.card {
  padding: 20px;

  & .header {
    font-size: 24px;

    & .title {
      font-weight: bold;
    }
  }

  & .body {
    margin-top: 10px;
  }
}
```

### 媒体查询

```css
/* styles/responsive.css */
.container {
  width: 100%;

  @media (min-width: 768px) {
    width: 750px;
  }

  @media (min-width: 1024px) {
    width: 970px;
  }

  @media (min-width: 1280px) {
    width: 1170px;
  }
}
```

### 自定义属性回退

```css
/* styles/fallback.css */
.element {
  /* 带回退值的自定义属性 */
  color: var(--text-color, #333);
  background: var(--bg-color, white);
}
```

### 颜色函数

```css
/* styles/colors.css */
.modern-colors {
  /* oklch颜色空间 */
  color: oklch(0.5 0.2 180);

  /* lab颜色空间 */
  background: lab(50% 20 -30);

  /* lch颜色空间 */
  border-color: lch(50% 50 180);
}
```

## 实战案例

### 案例 1：响应式布局系统

```css
/* styles/layout.css */
.grid {
  display: grid;
  gap: var(--grid-gap, 20px);

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  & .grid-item {
    padding: 20px;
    background: var(--item-bg, white);
    border-radius: 8px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}
```

### 案例 2：主题系统

```css
/* styles/theme.css */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
}

[data-theme="dark"] {
  --color-primary: #0d6efd;
  --color-secondary: #6c757d;
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}

.button {
  background: var(--color-primary);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;

  &.secondary {
    background: var(--color-secondary);
  }

  &.success {
    background: var(--color-success);
  }
}
```

### 案例 3：动画系统

```css
/* styles/animations.css */
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

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.card {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}
```

### 案例 4：组件库样式

```css
/* styles/components.css */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: all 0.2s;

  &.btn-primary {
    background: var(--color-primary);
    color: white;

    &:hover {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
    }
  }

  &.btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  &.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}
```

## 适用场景

| 场景       | 是否使用 | 原因       |
| ---------- | -------- | ---------- |
| 大型项目   | 是       | 编译速度快 |
| 现代 CSS   | 是       | 支持新语法 |
| 性能优化   | 是       | 更小文件   |
| 浏览器兼容 | 是       | 自动前缀   |
| 简单项目   | 否       | 不需要     |
| 旧浏览器   | 否       | 兼容性问题 |

## 注意事项

### 1. 浏览器兼容性

```javascript
// 配置目标浏览器
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  browserslist: ["last 2 versions", "> 1%"],
};
```

### 2. CSS 模块

```css
/* styles/Button.module.css */
.button {
  padding: 10px 20px;
}

.primary {
  background: blue;
}
```

### 3. 全局样式

```tsx
// app/layout.tsx
import "./globals.css";
```

### 4. 性能监控

```bash
# 查看构建时间
npm run build
```

### 5. 源码映射

```javascript
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  lightningcss: {
    sourceMap: true,
  },
};
```

## 常见问题

### 1. Lightning CSS 不工作？

**问题**：启用后没有效果

**解决方案**：

```bash
# 安装依赖
npm install lightningcss

# 清除缓存
rm -rf .next
npm run build
```

### 2. 如何配置浏览器目标？

**问题**：需要支持特定浏览器

**解决方案**：

```javascript
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  browserslist: ["last 2 versions"],
};
```

### 3. 如何启用压缩？

**问题**：CSS 文件过大

**解决方案**：

```javascript
module.exports = {
  experimental: {
    useLightningcss: true,
  },
  lightningcss: {
    minify: true,
  },
};
```

### 4. 如何使用嵌套？

**问题**：需要 CSS 嵌套

**解决方案**：

```css
.parent {
  & .child {
    color: blue;
  }
}
```

### 5. 如何使用变量？

**问题**：需要 CSS 变量

**解决方案**：

```css
:root {
  --color: blue;
}

.element {
  color: var(--color);
}
```

### 6. 如何处理前缀？

**问题**：需要浏览器前缀

**解决方案**：

```javascript
// Lightning CSS自动添加前缀
// 无需额外配置
```

### 7. 如何调试 CSS？

**问题**：需要源码映射

**解决方案**：

```javascript
module.exports = {
  lightningcss: {
    sourceMap: true,
  },
};
```

### 8. 如何优化性能？

**问题**：构建时间长

**解决方案**：

```javascript
// Lightning CSS已经很快
// 无需额外优化
```

### 9. 如何处理 CSS 模块？

**问题**：需要 CSS 模块

**解决方案**：

```tsx
import styles from "./Button.module.css";

<button className={styles.button}>Click</button>;
```

### 10. 如何使用现代颜色？

**问题**：需要新颜色函数

**解决方案**：

```css
.element {
  color: oklch(0.5 0.2 180);
}
```

### 11. 如何处理媒体查询？

**问题**：需要响应式设计

**解决方案**：

```css
.element {
  @media (min-width: 768px) {
    width: 750px;
  }
}
```

### 12. 如何处理动画？

**问题**：需要 CSS 动画

**解决方案**：

```css
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.element {
  animation: fade 0.3s;
}
```

### 13. 如何处理主题？

**问题**：需要主题切换

**解决方案**：

```css
:root {
  --color: blue;
}

[data-theme="dark"] {
  --color: white;
}
```

### 14. 如何处理导入？

**问题**：需要导入其他 CSS

**解决方案**：

```css
@import "./variables.css";
@import "./components.css";
```

### 15. 如何迁移？

**问题**：从 PostCSS 迁移

**解决方案**：

```javascript
// 1. 安装Lightning CSS
npm install lightningcss

// 2. 启用配置
module.exports = {
  experimental: {
    useLightningcss: true,
  },
}

// 3. 测试所有CSS
npm run build
```

### 16. 如何处理 CSS Modules?

**问题**: Lightning CSS 与 CSS Modules 的兼容性

**解决方案**:

```css
/* components/Button.module.css */
.button {
  padding: 10px 20px;

  /* 嵌套选择器 */
  &:hover {
    opacity: 0.8;
  }

  /* 组合类名 */
  &.primary {
    background: blue;
    color: white;
  }

  &.secondary {
    background: gray;
    color: black;
  }
}
```

```tsx
// components/Button.tsx
import styles from "./Button.module.css";

export default function Button({ variant = "primary" }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>Click me</button>
  );
}
```

**CSS Modules 特性对比**:

| 特性       | Lightning CSS | PostCSS     |
| ---------- | ------------- | ----------- |
| 局部作用域 | ✅ 支持       | ✅ 支持     |
| 嵌套语法   | ✅ 原生支持   | ⚠️ 需要插件 |
| 组合       | ✅ 支持       | ✅ 支持     |
| 性能       | 🚀 极快       | ⚠️ 较慢     |

### 17. 如何处理全局样式?

**问题**: 需要定义全局 CSS 变量和样式

**解决方案**:

```css
/* styles/globals.css */
:root {
  /* 颜色系统 */
  --color-primary: oklch(0.5 0.2 250);
  --color-secondary: oklch(0.6 0.15 180);
  --color-success: oklch(0.65 0.2 140);
  --color-danger: oklch(0.55 0.22 25);

  /* 间距系统 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* 字体系统 */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* 断点 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--color-text);
  background: var(--color-background);
}
```

### 18. 如何优化生产构建?

**问题**: 需要最小化 CSS 文件大小

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },

  // 生产环境优化
  productionBrowserSourceMaps: false,

  // 压缩配置
  compress: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 移除未使用的CSS
      config.optimization.usedExports = true;
    }
    return config;
  },
};
```

**构建优化对比**:

| 优化项       | 未优化 | 优化后 | 提升 |
| ------------ | ------ | ------ | ---- |
| CSS 文件大小 | 150KB  | 45KB   | 70%  |
| 构建时间     | 8s     | 2s     | 75%  |
| 首屏加载     | 1.2s   | 0.8s   | 33%  |

### 19. 如何处理第三方 CSS 库?

**问题**: 使用 Bootstrap、Tailwind 等第三方库

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },
};
```

```css
/* styles/globals.css */
/* 导入第三方库 */
@import "normalize.css";

/* 自定义样式 */
.custom {
  /* Lightning CSS会自动处理 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

**第三方库兼容性**:

| 库            | Lightning CSS | 注意事项          |
| ------------- | ------------- | ----------------- |
| Bootstrap     | ✅ 完全兼容   | 无需修改          |
| Tailwind CSS  | ✅ 完全兼容   | 使用 PostCSS 模式 |
| Normalize.css | ✅ 完全兼容   | 直接导入          |
| Ant Design    | ✅ 完全兼容   | 无需修改          |

### 20. 如何调试 CSS 问题?

**问题**: 需要调试 CSS 编译问题

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    useLightningcss: true,
  },

  // 启用详细日志
  webpack: (config, { dev }) => {
    if (dev) {
      config.stats = "verbose";
    }
    return config;
  },
};
```

**调试工具对比**:

| 工具            | 用途     | 推荐度     |
| --------------- | -------- | ---------- |
| Chrome DevTools | 实时调试 | ⭐⭐⭐⭐⭐ |
| Source Maps     | 源码定位 | ⭐⭐⭐⭐⭐ |
| Webpack Stats   | 构建分析 | ⭐⭐⭐⭐   |
| CSS Lint        | 语法检查 | ⭐⭐⭐     |

### 21. 如何处理 CSS 变量回退?

**问题**: 需要为不支持 CSS 变量的浏览器提供回退

**解决方案**:

```css
.element {
  /* 回退值 */
  color: #007bff;
  /* CSS变量 */
  color: var(--color-primary, #007bff);

  /* 多层回退 */
  background: var(--bg-custom, var(--bg-default, white));
}
```

### 22. 如何处理 CSS Grid 布局?

**问题**: 使用现代 Grid 布局

**解决方案**:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  /* 响应式调整 */
  @media (width >= 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (width >= 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 23. 如何处理 CSS 动画?

**问题**: 创建高性能 CSS 动画

**解决方案**:

```css
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

.animated {
  animation: fadeIn 0.3s ease-out;

  /* 性能优化 */
  will-change: transform, opacity;

  /* 硬件加速 */
  transform: translateZ(0);
}
```

### 24. 如何处理打印样式?

**问题**: 需要优化打印输出

**解决方案**:

```css
@media print {
  /* 隐藏不需要打印的元素 */
  .no-print {
    display: none !important;
  }

  /* 优化打印布局 */
  body {
    font-size: 12pt;
    color: black;
    background: white;
  }

  /* 避免分页 */
  .keep-together {
    page-break-inside: avoid;
  }
}
```

### 25. 如何监控 CSS 性能?

**问题**: 需要监控 CSS 加载和渲染性能

**解决方案**:

```javascript
// lib/performance.ts
export function measureCSSPerformance() {
  if (typeof window === "undefined") return;

  const perfData = performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.endsWith(".css"));

  perfData.forEach((entry) => {
    console.log("CSS文件:", entry.name);
    console.log("加载时间:", entry.duration, "ms");
    console.log("文件大小:", entry.transferSize, "bytes");
  });
}
```

**性能指标对比**:

| 指标     | PostCSS | Lightning CSS | 提升 |
| -------- | ------- | ------------- | ---- |
| 编译时间 | 800ms   | 8ms           | 99%  |
| 文件大小 | 120KB   | 85KB          | 29%  |
| 首次渲染 | 1.5s    | 1.1s          | 27%  |

## 最佳实践

### 1. 使用现代 CSS 特性

```css
/* 利用Lightning CSS的原生支持 */
.modern {
  /* 嵌套 */
  & .child {
    color: blue;
  }

  /* 现代颜色 */
  background: oklch(0.5 0.2 180);

  /* 容器查询 */
  @container (width > 400px) {
    font-size: 1.2rem;
  }
}
```

### 2. 优化 CSS 变量

```css
:root {
  /* 使用语义化命名 */
  --color-primary: oklch(0.5 0.2 250);
  --color-text: oklch(0.2 0 0);

  /* 使用计算值 */
  --spacing-base: 1rem;
  --spacing-lg: calc(var(--spacing-base) * 1.5);
}
```

### 3. 合理使用嵌套

```css
/* ✅ 好的嵌套 */
.card {
  padding: 1rem;

  & .title {
    font-size: 1.5rem;
  }

  & .content {
    margin-top: 1rem;
  }
}

/* ❌ 避免过深嵌套 */
.nav {
  & ul {
    & li {
      & a {
        /* 太深了 */
      }
    }
  }
}
```

## 总结

experimental.useLightningcss 配置为 Next.js 带来了极速的 CSS 处理能力。使用 Lightning CSS 可以：

1. **提升速度**：编译速度提升 100 倍
2. **减小体积**：更好的压缩
3. **现代语法**：支持最新 CSS 特性
4. **自动前缀**：无需配置
5. **零成本**：开箱即用

关键要点：

- 启用 useLightningcss
- 配置浏览器目标
- 使用现代 CSS 语法
- 启用压缩
- 使用 CSS 变量
- 嵌套规则
- 媒体查询
- 颜色函数
- 源码映射
- 性能监控

记住：Lightning CSS 是实验性功能，但已经非常稳定。对于大型项目，性能提升会非常明显。建议在新项目中使用，旧项目迁移需要测试兼容性。

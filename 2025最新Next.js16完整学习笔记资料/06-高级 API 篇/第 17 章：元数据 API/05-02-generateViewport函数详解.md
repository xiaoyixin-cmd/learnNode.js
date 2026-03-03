**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-02-generateViewport 函数详解

## 概述

视口(Viewport)配置对于响应式 Web 应用至关重要,它控制着页面在不同设备上的显示方式。Next.js 16 引入了`generateViewport`函数,将视口配置从元数据中分离出来,提供了更好的性能和灵活性。

### 什么是 generateViewport

`generateViewport`是一个服务端函数,用于生成页面的视口配置。它与`generateMetadata`类似,但专门用于视口相关的设置,包括宽度、缩放、主题颜色等。

### 为什么需要单独的 viewport 函数

🆕 **Next.js 16 新增**: 在 Next.js 15 及之前的版本中,viewport 配置是 metadata 的一部分。Next.js 16 将其分离出来,原因如下:

1. **性能优化**: viewport 需要在 HTML 的`<head>`最前面,分离后可以更早渲染
2. **更好的类型支持**: 独立的类型定义更清晰
3. **避免冲突**: viewport 和 metadata 的更新频率不同,分离后减少不必要的重渲染

### 基本概念

视口配置主要包括:

- **width**: 视口宽度
- **initialScale**: 初始缩放比例
- **maximumScale**: 最大缩放比例
- **minimumScale**: 最小缩放比例
- **userScalable**: 是否允许用户缩放
- **viewportFit**: 视口适配模式
- **themeColor**: 主题颜色(浏览器 UI 颜色)
- **colorScheme**: 颜色方案(light/dark)

---

## 1. 基础用法

### 1.1 静态 viewport 配置

最简单的方式是导出一个静态的`viewport`对象:

```tsx
// app/layout.tsx
import { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

生成的 HTML:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1"
/>
```

### 1.2 动态 viewport 配置

使用`generateViewport`函数生成动态配置:

```tsx
// app/layout.tsx
import { Viewport } from "next";

interface Props {
  params: { locale: string };
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  // 根据语言设置不同的主题颜色
  const themeColors = {
    en: "#0070f3",
    zh: "#ff0000",
    ja: "#ff6b6b",
  };

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: themeColors[params.locale] || "#0070f3",
  };
}
```

### 1.3 函数签名

```typescript
type GenerateViewport = (props: {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => Promise<Viewport> | Viewport;
```

---

## 2. Viewport 字段详解

### 2.1 width

控制视口宽度:

```tsx
export const viewport: Viewport = {
  // 使用设备宽度(推荐)
  width: "device-width",

  // 或指定固定宽度
  // width: 1024,
};
```

**常用值**:

| 值           | 说明     | 适用场景         |
| ------------ | -------- | ---------------- |
| device-width | 设备宽度 | 响应式设计(推荐) |
| 固定数值     | 如 1024  | 桌面优先设计     |

### 2.2 initialScale

初始缩放比例:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1, // 1表示100%,不缩放
};
```

**推荐值**: 1(不缩放)

### 2.3 maximumScale 和 minimumScale

控制缩放范围:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // 最大放大到500%
  minimumScale: 0.5, // 最小缩小到50%
};
```

**注意**: 限制缩放可能影响可访问性,谨慎使用。

### 2.4 userScalable

是否允许用户缩放:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false, // 禁止用户缩放
};
```

⚠️ **警告**: 禁用用户缩放会影响可访问性,不推荐使用。

### 2.5 viewportFit

视口适配模式,用于处理刘海屏等特殊屏幕:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // 覆盖整个屏幕,包括安全区域
};
```

**可选值**:

| 值      | 说明             | 适用场景       |
| ------- | ---------------- | -------------- |
| auto    | 自动(默认)       | 大多数情况     |
| contain | 包含在安全区域内 | 避免被刘海遮挡 |
| cover   | 覆盖整个屏幕     | 沉浸式体验     |

### 2.6 themeColor

浏览器 UI 的主题颜色:

```tsx
export const viewport: Viewport = {
  themeColor: "#0070f3",
};
```

**支持多种颜色方案**:

```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};
```

### 2.7 colorScheme

指定页面支持的颜色方案:

```tsx
export const viewport: Viewport = {
  colorScheme: "dark light", // 支持暗色和亮色
};
```

**可选值**:

| 值         | 说明           |
| ---------- | -------------- |
| light      | 仅支持亮色模式 |
| dark       | 仅支持暗色模式 |
| light dark | 支持两种模式   |
| dark light | 优先暗色模式   |
| normal     | 不指定         |

---

## 3. 高级用法

### 3.1 响应式主题颜色

根据用户偏好设置不同的主题颜色:

```tsx
// app/layout.tsx
import { Viewport } from "next";
import { cookies } from "next/headers";

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: theme === "dark" ? "#000000" : "#ffffff",
    colorScheme: theme === "dark" ? "dark" : "light",
  };
}
```

### 3.2 基于路由的 viewport 配置

不同页面使用不同的 viewport 配置:

```tsx
// app/mobile/layout.tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 移动端禁止缩放
};

// app/desktop/layout.tsx
export const viewport: Viewport = {
  width: 1024,
  initialScale: 1,
  userScalable: true, // 桌面端允许缩放
};
```

### 3.3 PWA 应用配置

Progressive Web App 的 viewport 配置:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0070f3",
};
```

### 3.4 动态主题颜色

根据页面内容动态设置主题颜色:

```tsx
// app/products/[id]/layout.tsx
export async function generateViewport({ params }: Props): Promise<Viewport> {
  const product = await getProduct(params.id);

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: product.brandColor, // 使用产品品牌色
  };
}
```

### 3.5 多主题支持

支持多种主题颜色:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
    { media: "(prefers-contrast: high)", color: "#000000" },
  ],
};
```

---

## 4. 实战案例

### 4.1 标准响应式网站

```tsx
// app/layout.tsx
import { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};
```

### 4.2 移动优先应用

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0070f3",
};
```

### 4.3 桌面优先网站

```tsx
export const viewport: Viewport = {
  width: 1200,
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 2,
};
```

### 4.4 电商网站

```tsx
// app/layout.tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff6b6b", // 品牌色
  colorScheme: "light",
};

// app/products/[id]/layout.tsx
export async function generateViewport({ params }: Props): Promise<Viewport> {
  const product = await getProduct(params.id);

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: product.category.color, // 根据分类设置颜色
  };
}
```

### 4.5 新闻网站

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 3, // 允许放大阅读
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  colorScheme: "light dark",
};
```

### 4.6 游戏网站

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // 全屏体验
  themeColor: "#000000",
  colorScheme: "dark",
};
```

---

## 5. 与 metadata 的区别

### 5.1 分离的原因

🆕 **Next.js 16 变更**: viewport 从 metadata 中分离。

**对比表**:

| 特性          | Next.js 15       | Next.js 16           |
| ------------- | ---------------- | -------------------- |
| viewport 位置 | metadata 对象中  | 独立的 viewport 对象 |
| 函数名        | generateMetadata | generateViewport     |
| 渲染时机      | 与 metadata 一起 | 更早渲染             |
| 性能          | 一般             | 更好                 |

### 5.2 迁移指南

**Next.js 15 写法**:

```tsx
export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: "#0070f3",
};
```

**Next.js 16 写法**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0070f3",
};
```

### 5.3 兼容性

Next.js 16 仍然支持在 metadata 中设置 viewport,但会显示警告:

```tsx
// ⚠️ 会显示警告,但仍然有效
export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1",
};

// ✅ 推荐写法
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
```

---

## 6. 适用场景

### 6.1 响应式 Web 应用

**场景**: 需要在不同设备上良好显示的网站。

**配置**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
```

### 6.2 PWA 应用

**场景**: Progressive Web App,需要类似原生应用的体验。

**配置**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0070f3",
};
```

### 6.3 移动游戏

**场景**: 移动端游戏,需要全屏沉浸式体验。

**配置**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark",
};
```

### 6.4 阅读类应用

**场景**: 新闻、博客等阅读类网站,需要支持用户放大文字。

**配置**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  minimumScale: 1,
};
```

### 6.5 品牌网站

**场景**: 企业官网,需要统一的品牌色。

**配置**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff6b6b", // 品牌色
};
```

---

## 7. 注意事项

### 7.1 可访问性

**禁用缩放影响可访问性**:

```tsx
// ❌ 不推荐 - 影响视力障碍用户
export const viewport: Viewport = {
  userScalable: false,
  maximumScale: 1,
};

// ✅ 推荐 - 允许用户缩放
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
```

### 7.2 iOS 安全区域

处理 iPhone 刘海屏:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

配合 CSS 使用:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 7.3 主题颜色限制

**浏览器支持**:

| 浏览器           | 支持情况 | 说明       |
| ---------------- | -------- | ---------- |
| Chrome (Android) | 完全支持 | 地址栏颜色 |
| Safari (iOS)     | 部分支持 | 状态栏颜色 |
| Firefox          | 不支持   | -          |
| Edge             | 支持     | 地址栏颜色 |

### 7.4 性能考虑

**避免频繁更改 viewport**:

```tsx
// ❌ 不推荐 - 每次请求都计算
export async function generateViewport(): Promise<Viewport> {
  const heavyComputation = await performHeavyTask();
  return { themeColor: heavyComputation.color };
}

// ✅ 推荐 - 使用静态配置或缓存
export const viewport: Viewport = {
  themeColor: "#0070f3",
};
```

### 7.5 类型安全

始终使用 TypeScript 类型:

```tsx
import { Viewport } from "next";

// ✅ 类型安全
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ❌ 缺少类型检查
export const viewport = {
  width: "device-width",
  invalidField: "value", // 不会报错
};
```

---

## 8. 常见问题

### 8.1 viewport 不生效怎么办?

**问题**: 设置了 viewport 但没有效果。

**解决方案**:

1. 检查是否在正确的位置导出:

```tsx
// ✅ 正确 - 在layout.tsx中
export const viewport: Viewport = { ... };

// ❌ 错误 - 在page.tsx中
export const viewport: Viewport = { ... }; // 无效
```

2. 检查是否使用了客户端组件:

```tsx
// ❌ 错误 - 客户端组件不支持
'use client';
export const viewport: Viewport = { ... };

// ✅ 正确 - 在服务端组件中
export const viewport: Viewport = { ... };
```

### 8.2 如何调试 viewport?

**方法**: 查看页面源码

```bash
# 在浏览器中右键 -> 查看页面源代码
# 搜索 <meta name="viewport">
```

**预期输出**:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#0070f3" />
```

### 8.3 主题颜色不显示?

**问题**: 设置了 themeColor 但浏览器没有显示。

**原因**:

1. 浏览器不支持
2. 颜色格式错误
3. 在桌面浏览器上(大多数桌面浏览器不显示)

**解决方案**:

```tsx
// ✅ 使用正确的颜色格式
export const viewport: Viewport = {
  themeColor: "#0070f3", // 十六进制
  // 或
  themeColor: "rgb(0, 112, 243)", // RGB
};

// ❌ 错误的格式
export const viewport: Viewport = {
  themeColor: "blue", // 命名颜色可能不支持
};
```

### 8.4 如何支持暗黑模式?

**问题**: 如何根据系统主题设置不同的颜色?

**解决方案**:

```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};
```

### 8.5 viewport 和 metadata 的优先级?

**问题**: 同时设置了 viewport 和 metadata 中的 viewport,哪个生效?

**回答**: viewport 对象优先级更高。

```tsx
// viewport对象会覆盖metadata中的设置
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  viewport: "width=1024", // 会被忽略
};
```

### 8.6 如何处理不同页面的 viewport?

**问题**: 不同页面需要不同的 viewport 配置。

**解决方案**: 在各自的 layout.tsx 中设置

```tsx
// app/layout.tsx (根布局)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// app/mobile/layout.tsx (移动端布局)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

### 8.7 viewportFit 的作用?

**问题**: viewportFit 是什么,什么时候使用?

**回答**: viewportFit 用于处理刘海屏等特殊屏幕。

**使用场景**:

| 值      | 使用场景           |
| ------- | ------------------ |
| auto    | 默认,大多数情况    |
| contain | 避免内容被刘海遮挡 |
| cover   | 全屏应用,如游戏    |

```tsx
// 全屏游戏
export const viewport: Viewport = {
  viewportFit: "cover",
};
```

### 8.8 如何测试 viewport?

**测试方法**:

1. **移动设备测试**: 在真实设备上测试
2. **浏览器 DevTools**: 使用设备模拟器
3. **不同浏览器**: 测试 Chrome、Safari、Firefox
4. **不同屏幕**: 测试刘海屏、折叠屏等

**测试清单**:

- [ ] 页面在移动设备上正常显示
- [ ] 缩放功能正常工作
- [ ] 主题颜色正确显示
- [ ] 刘海屏适配正常
- [ ] 横竖屏切换正常

---

## 9. 总结

### 9.1 核心要点

1. **viewport 独立于 metadata**: Next.js 16 将 viewport 分离,提高性能
2. **类型安全**: 使用 TypeScript 的 Viewport 类型
3. **响应式优先**: 使用 device-width 而非固定宽度
4. **可访问性**: 避免禁用用户缩放
5. **主题颜色**: 支持多种颜色方案

### 9.2 最佳实践

| 实践              | 说明       | 示例                    |
| ----------------- | ---------- | ----------------------- |
| 使用 device-width | 响应式设计 | `width: 'device-width'` |
| 允许缩放          | 可访问性   | `maximumScale: 5`       |
| 设置主题颜色      | 品牌一致性 | `themeColor: '#0070f3'` |
| 支持暗黑模式      | 用户体验   | 使用 media 查询         |
| 处理安全区域      | iOS 适配   | `viewportFit: 'cover'`  |

### 9.3 配置模板

**标准响应式网站**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};
```

**PWA 应用**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0070f3",
};
```

### 9.4 Next.js 16 的改进

🆕 **Next.js 16 新增**:

- 独立的 viewport 配置
- 更好的类型支持
- 更早的渲染时机

⚡ **Next.js 16 增强**:

- 性能优化
- 更清晰的 API
- 更好的开发体验

### 9.5 常见错误

| 错误            | 原因               | 解决方案           |
| --------------- | ------------------ | ------------------ |
| viewport 不生效 | 在 page.tsx 中设置 | 移到 layout.tsx    |
| 主题颜色不显示  | 浏览器不支持       | 在移动设备上测试   |
| 禁用缩放        | 影响可访问性       | 允许用户缩放       |
| 颜色格式错误    | 使用了不支持的格式 | 使用十六进制或 RGB |

### 9.6 进阶学习

想要深入学习 viewport 配置,建议:

1. 了解 CSS 像素和设备像素的区别
2. 学习响应式设计原理
3. 掌握 PWA 开发
4. 了解 iOS 安全区域
5. 学习可访问性标准

`generateViewport`是 Next.js 16 中重要的新特性,它将 viewport 配置从 metadata 中分离出来,提供了更好的性能和开发体验。正确配置 viewport 对于响应式设计和用户体验至关重要。记住,始终以用户为中心,确保在所有设备上都能提供良好的体验。

---

## 10. 深入理解 viewport

### 10.1 viewport 的工作原理

**视口类型**:

| 类型     | 说明           | 宽度         |
| -------- | -------------- | ------------ |
| 布局视口 | 页面布局的基准 | 通常 980px   |
| 视觉视口 | 用户可见区域   | 设备屏幕宽度 |
| 理想视口 | 最佳显示宽度   | device-width |

**设置 device-width 的作用**:

```tsx
export const viewport: Viewport = {
  width: "device-width", // 将布局视口设置为设备宽度
  initialScale: 1, // 视觉视口 = 布局视口
};
```

### 10.2 缩放的数学原理

**缩放比例计算**:

```
视觉视口宽度 = 布局视口宽度 / 缩放比例
```

**示例**:

```tsx
// iPhone 12: 设备宽度 390px
export const viewport: Viewport = {
  width: "device-width", // 布局视口 = 390px
  initialScale: 1, // 缩放比例 = 1
  // 视觉视口 = 390px / 1 = 390px
};

// 如果 initialScale: 2
// 视觉视口 = 390px / 2 = 195px (放大显示)
```

### 10.3 设备像素比(DPR)

**概念**: 物理像素与 CSS 像素的比例。

```tsx
// iPhone 12: DPR = 3
// 屏幕分辨率: 1170 x 2532 (物理像素)
// CSS像素: 390 x 844
// DPR = 1170 / 390 = 3

export const viewport: Viewport = {
  width: "device-width", // 390px (CSS像素)
  initialScale: 1,
};
```

### 10.4 安全区域详解

**iOS 刘海屏适配**:

```tsx
export const viewport: Viewport = {
  viewportFit: "cover",
};
```

**CSS 环境变量**:

```css
/* 使用安全区域 */
.header {
  padding-top: max(20px, env(safe-area-inset-top));
}

.footer {
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}

/* 横屏时的左右安全区域 */
.sidebar {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**完整示例**:

```tsx
// app/layout.tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

```css
/* app/globals.css */
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}

body {
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
}
```

### 10.5 主题颜色的高级用法

**渐变主题颜色**:

虽然不直接支持渐变,但可以使用单色:

```tsx
export const viewport: Viewport = {
  themeColor: "#0070f3", // 使用品牌主色
};
```

**动态主题颜色**:

```tsx
// app/layout.tsx
import { cookies } from "next/headers";

export async function generateViewport(): Promise<Viewport> {
  const theme = cookies().get("theme")?.value;

  const colors = {
    light: "#ffffff",
    dark: "#000000",
    blue: "#0070f3",
    green: "#00c853",
  };

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: colors[theme] || colors.light,
  };
}
```

**基于时间的主题颜色**:

```tsx
export async function generateViewport(): Promise<Viewport> {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 18;

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: isDaytime ? "#ffffff" : "#000000",
    colorScheme: isDaytime ? "light" : "dark",
  };
}
```

### 10.6 colorScheme 详解

**作用**: 告诉浏览器页面支持的颜色方案。

```tsx
export const viewport: Viewport = {
  colorScheme: "light dark", // 支持亮色和暗色
};
```

**与 CSS 的配合**:

```css
/* 浏览器会根据colorScheme应用默认样式 */
:root {
  color-scheme: light dark;
}

/* 暗色模式下的默认样式 */
@media (prefers-color-scheme: dark) {
  :root {
    background: #000;
    color: #fff;
  }
}
```

**优先级**:

```tsx
// 优先暗色模式
export const viewport: Viewport = {
  colorScheme: "dark light",
};

// 仅支持亮色模式
export const viewport: Viewport = {
  colorScheme: "light",
};
```

---

## 11. 性能优化

### 11.1 静态 vs 动态 viewport

**性能对比**:

| 方式          | 性能 | 灵活性 | 适用场景       |
| ------------- | ---- | ------ | -------------- |
| 静态 viewport | 最好 | 低     | 大多数网站     |
| 动态 viewport | 一般 | 高     | 需要个性化配置 |

**静态配置(推荐)**:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0070f3",
};
```

**动态配置**:

```tsx
export async function generateViewport({ params }: Props): Promise<Viewport> {
  const data = await getData(params.id);
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: data.color,
  };
}
```

### 11.2 缓存策略

**使用 React cache**:

```tsx
import { cache } from "react";

const getThemeColor = cache(async () => {
  const res = await fetch("/api/theme");
  return res.json();
});

export async function generateViewport(): Promise<Viewport> {
  const { color } = await getThemeColor();

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: color,
  };
}
```

### 11.3 避免不必要的计算

```tsx
// ❌ 不推荐 - 每次都计算
export async function generateViewport(): Promise<Viewport> {
  const complexCalculation = await performHeavyTask();
  return {
    themeColor: complexCalculation.color,
  };
}

// ✅ 推荐 - 使用环境变量
export const viewport: Viewport = {
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR || "#0070f3",
};
```

---

## 12. 实际应用案例

### 12.1 多品牌网站

```tsx
// app/[brand]/layout.tsx
const brandColors = {
  nike: "#000000",
  adidas: "#ffffff",
  puma: "#ff6b6b",
};

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const brand = params.brand;

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: brandColors[brand] || "#000000",
  };
}
```

### 12.2 A/B 测试

```tsx
import { cookies } from "next/headers";

export async function generateViewport(): Promise<Viewport> {
  const variant = cookies().get("ab_test")?.value;

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: variant === "B" ? "#ff0000" : "#0070f3",
  };
}
```

### 12.3 地区化配置

```tsx
export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { locale } = params;

  const localeConfig = {
    "en-US": { color: "#0070f3", scheme: "light" },
    "zh-CN": { color: "#ff0000", scheme: "light" },
    "ja-JP": { color: "#ff6b6b", scheme: "light" },
  };

  const config = localeConfig[locale] || localeConfig["en-US"];

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: config.color,
    colorScheme: config.scheme,
  };
}
```

### 12.4 季节性主题

```tsx
export async function generateViewport(): Promise<Viewport> {
  const month = new Date().getMonth();

  // 春季: 绿色, 夏季: 蓝色, 秋季: 橙色, 冬季: 白色
  const seasonColors = [
    "#ffffff",
    "#ffffff",
    "#00c853", // 冬、冬、春
    "#00c853",
    "#00c853",
    "#0070f3", // 春、春、夏
    "#0070f3",
    "#0070f3",
    "#ff6b00", // 夏、夏、秋
    "#ff6b00",
    "#ff6b00",
    "#ffffff", // 秋、秋、冬
  ];

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: seasonColors[month],
  };
}
```

### 12.5 用户偏好

```tsx
import { cookies } from "next/headers";

export async function generateViewport(): Promise<Viewport> {
  const preferences = cookies().get("user_preferences")?.value;
  const prefs = preferences ? JSON.parse(preferences) : {};

  return {
    width: "device-width",
    initialScale: prefs.initialScale || 1,
    maximumScale: prefs.allowZoom ? 5 : 1,
    themeColor: prefs.themeColor || "#0070f3",
  };
}
```

---

## 13. 调试技巧

### 13.1 浏览器 DevTools

**Chrome DevTools**:

1. 打开 DevTools (F12)
2. 切换到移动设备模拟器
3. 查看 viewport 设置
4. 测试不同设备

**查看实际 viewport**:

```javascript
// 在浏览器控制台执行
console.log({
  layoutViewport: document.documentElement.clientWidth,
  visualViewport: window.innerWidth,
  devicePixelRatio: window.devicePixelRatio,
});
```

### 13.2 viewport 验证工具

**创建验证组件**:

```tsx
// components/ViewportDebug.tsx
"use client";

import { useEffect, useState } from "react";

export default function ViewportDebug() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    const updateInfo = () => {
      setInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio,
        orientation: screen.orientation?.type,
      });
    };

    updateInfo();
    window.addEventListener("resize", updateInfo);
    return () => window.removeEventListener("resize", updateInfo);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        background: "#000",
        color: "#fff",
        padding: "10px",
      }}
    >
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}
```

### 13.3 测试不同设备

**常见设备 viewport**:

| 设备               | 宽度   | 高度   | DPR  |
| ------------------ | ------ | ------ | ---- |
| iPhone 12          | 390px  | 844px  | 3    |
| iPhone 12 Pro Max  | 428px  | 926px  | 3    |
| iPad Pro 12.9"     | 1024px | 1366px | 2    |
| Samsung Galaxy S21 | 360px  | 800px  | 3    |
| Pixel 5            | 393px  | 851px  | 2.75 |

---

## 14. 相关资源

### 14.1 官方文档

- Next.js Viewport API: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
- MDN Viewport: https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
- Web.dev Responsive Design: https://web.dev/responsive-web-design-basics/

### 14.2 工具推荐

- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack (真机测试)
- Responsively App (多设备预览)

### 14.3 学习资源

- CSS Pixels vs Device Pixels
- Viewport Units (vw, vh, vmin, vmax)
- Safe Area Insets
- Color Scheme API

通过深入理解`generateViewport`,你可以为用户提供更好的跨设备体验。记住,viewport 配置虽然看似简单,但对用户体验有着深远的影响。始终在真实设备上测试,确保在各种场景下都能正常工作。

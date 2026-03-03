**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# experimental.viewTransition 配置

## 概述

experimental.viewTransition 是 Next.js 16 中用于启用 View Transitions API 的实验性配置选项。View Transitions API 允许在页面导航时创建流畅的动画过渡效果，提升用户体验。

### viewTransition 的作用

1. **流畅过渡**：页面切换时的动画效果
2. **提升体验**：更自然的导航感受
3. **简化实现**：无需复杂的动画代码
4. **性能优化**：浏览器原生支持
5. **渐进增强**：不支持的浏览器降级

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    viewTransition: true,
  },
};
```

### 启用页面过渡

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ViewTransitions>{children}</ViewTransitions>
      </body>
    </html>
  );
}
```

### 简单过渡效果

```css
/* styles/transitions.css */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
```

### 自定义过渡

```css
/* styles/custom-transition.css */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

## 高级配置

### 命名过渡

```css
/* styles/named-transitions.css */
.hero {
  view-transition-name: hero;
}

::view-transition-old(hero),
::view-transition-new(hero) {
  animation-duration: 0.5s;
}
```

### 多元素过渡

```css
/* styles/multi-element.css */
.title {
  view-transition-name: title;
}

.image {
  view-transition-name: image;
}

.content {
  view-transition-name: content;
}
```

### 条件过渡

```tsx
// components/ConditionalTransition.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ConditionalTransition({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        // 页面更新
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
```

### 自定义动画时长

```css
/* styles/duration.css */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
```

### 滑动过渡

```css
/* styles/slide.css */
::view-transition-old(root) {
  animation: slide-out-left 0.3s ease-out;
}

::view-transition-new(root) {
  animation: slide-in-right 0.3s ease-in;
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

### 缩放过渡

```css
/* styles/scale.css */
::view-transition-old(root) {
  animation: scale-down 0.3s ease-out;
}

::view-transition-new(root) {
  animation: scale-up 0.3s ease-in;
}

@keyframes scale-down {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
}

@keyframes scale-up {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

### 旋转过渡

```css
/* styles/rotate.css */
::view-transition-old(root) {
  animation: rotate-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: rotate-in 0.3s ease-in;
}

@keyframes rotate-out {
  from {
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(90deg);
    opacity: 0;
  }
}

@keyframes rotate-in {
  from {
    transform: rotate(-90deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}
```

## 实战案例

### 案例 1：博客文章过渡

```tsx
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }) {
  return (
    <article>
      <h1 style={{ viewTransitionName: "title" }}>{post.title}</h1>
      <img src={post.image} style={{ viewTransitionName: "hero-image" }} />
      <div style={{ viewTransitionName: "content" }}>{post.content}</div>
    </article>
  );
}
```

```css
/* styles/blog-transition.css */
::view-transition-old(title),
::view-transition-new(title) {
  animation-duration: 0.4s;
}

::view-transition-old(hero-image),
::view-transition-new(hero-image) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 案例 2：产品列表到详情

```tsx
// app/products/page.tsx
export default function Products() {
  return (
    <div className="grid">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <img
            src={product.image}
            style={{ viewTransitionName: `product-${product.id}` }}
          />
          <h3 style={{ viewTransitionName: `title-${product.id}` }}>
            {product.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}
```

```css
/* styles/product-transition.css */
[style*="view-transition-name"] {
  animation-duration: 0.4s;
}
```

### 案例 3：导航菜单过渡

```tsx
// components/Navigation.tsx
"use client";

import { useRouter } from "next/navigation";

export function Navigation() {
  const router = useRouter();

  const navigate = (href: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }
  };

  return (
    <nav>
      <button onClick={() => navigate("/")}>Home</button>
      <button onClick={() => navigate("/about")}>About</button>
      <button onClick={() => navigate("/contact")}>Contact</button>
    </nav>
  );
}
```

### 案例 4：图片画廊

```tsx
// app/gallery/page.tsx
export default function Gallery() {
  return (
    <div className="gallery">
      {images.map((image, index) => (
        <Link key={index} href={`/gallery/${index}`}>
          <img
            src={image.thumbnail}
            style={{ viewTransitionName: `gallery-${index}` }}
          />
        </Link>
      ))}
    </div>
  );
}
```

```css
/* styles/gallery-transition.css */
[style*="gallery-"] {
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}

::view-transition-old(root) {
  animation: fade-out 0.2s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.2s ease-in;
}
```

## 适用场景

| 场景     | 是否使用 | 原因       |
| -------- | -------- | ---------- |
| 页面导航 | 是       | 提升体验   |
| 图片画廊 | 是       | 流畅过渡   |
| 列表详情 | 是       | 视觉连续性 |
| 单页应用 | 是       | 类原生体验 |
| 简单网站 | 否       | 不需要     |
| 旧浏览器 | 否       | 不支持     |

## 注意事项

### 1. 浏览器兼容性

```javascript
// 检测浏览器支持
if (document.startViewTransition) {
  // 支持View Transitions
} else {
  // 降级处理
}
```

### 2. 性能考虑

```css
/* 避免过长的动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s; /* 不要超过0.5s */
}
```

### 3. 命名冲突

```css
/* 确保view-transition-name唯一 */
.item-1 {
  view-transition-name: item-1;
}
.item-2 {
  view-transition-name: item-2;
}
```

### 4. 渐进增强

```tsx
// 提供降级方案
function navigate(href: string) {
  if (document.startViewTransition) {
    document.startViewTransition(() => router.push(href));
  } else {
    router.push(href);
  }
}
```

### 5. 调试技巧

```css
/* 开发时可以放慢动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 2s; /* 方便调试 */
}
```

## 常见问题

### 1. View Transition 不工作？

**问题**：启用后没有效果

**解决方案**：

```javascript
// 检查浏览器支持
if (!document.startViewTransition) {
  console.log("Browser does not support View Transitions");
}
```

### 2. 如何自定义动画？

**问题**：需要自定义过渡效果

**解决方案**：

```css
::view-transition-old(root) {
  animation: custom-out 0.3s;
}

::view-transition-new(root) {
  animation: custom-in 0.3s;
}
```

### 3. 如何命名元素？

**问题**：需要特定元素过渡

**解决方案**：

```tsx
<div style={{ viewTransitionName: "my-element" }}>Content</div>
```

### 4. 如何处理多个元素？

**问题**：多个元素需要过渡

**解决方案**：

```css
.element-1 {
  view-transition-name: element-1;
}
.element-2 {
  view-transition-name: element-2;
}
```

### 5. 如何控制时长？

**问题**：需要调整动画时长

**解决方案**：

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}
```

### 6. 如何处理降级？

**问题**：旧浏览器不支持

**解决方案**：

```tsx
if (document.startViewTransition) {
  // 使用View Transitions
} else {
  // 直接导航
}
```

### 7. 如何调试动画？

**问题**：动画效果不符合预期

**解决方案**：

```css
/* 放慢动画速度 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 2s;
}
```

### 8. 如何处理异步导航？

**问题**：导航是异步的

**解决方案**：

```tsx
document.startViewTransition(async () => {
  await router.push(href);
});
```

### 9. 如何取消过渡？

**问题**：需要取消正在进行的过渡

**解决方案**：

```tsx
const transition = document.startViewTransition(() => {
  // ...
});

// 取消过渡
transition.skipTransition();
```

### 10. 如何监听过渡事件？

**问题**：需要知道过渡何时完成

**解决方案**：

```tsx
const transition = document.startViewTransition(() => {
  // ...
});

transition.finished.then(() => {
  console.log("Transition finished");
});
```

### 11. 如何处理错误？

**问题**：过渡可能失败

**解决方案**：

```tsx
try {
  await document.startViewTransition(() => {
    // ...
  }).finished;
} catch (error) {
  console.error("Transition failed:", error);
}
```

### 12. 如何优化性能？

**问题**：动画卡顿

**解决方案**：

```css
/* 使用transform和opacity */
::view-transition-old(root) {
  animation: fade-out 0.3s;
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}
```

### 13. 如何处理复杂布局？

**问题**：布局变化大

**解决方案**：

```css
/* 为不同元素设置不同的过渡 */
.header {
  view-transition-name: header;
}
.content {
  view-transition-name: content;
}
.footer {
  view-transition-name: footer;
}
```

### 14. 如何与路由集成？

**问题**：需要与 Next.js 路由集成

**解决方案**：

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

document.startViewTransition(() => {
  router.push("/new-page");
});
```

### 15. 如何测试？

**问题**：需要测试过渡效果

**解决方案**：

```tsx
// 在支持的浏览器中测试
// Chrome 111+, Edge 111+
if (document.startViewTransition) {
  // 测试代码
}
```

### 16. 如何实现共享元素动画?

**问题**: 实现类似原生应用的共享元素过渡

**解决方案**:

```css
/* app/globals.css */
/* 为共享元素设置相同的view-transition-name */
.product-image {
  view-transition-name: product-image;
}

.product-detail-image {
  view-transition-name: product-image;
}

::view-transition-old(product-image),
::view-transition-new(product-image) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

```tsx
// app/products/page.tsx
export default function ProductsPage() {
  return (
    <div>
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <img
            src={product.image}
            className="product-image"
            alt={product.name}
          />
        </Link>
      ))}
    </div>
  );
}
```

```tsx
// app/products/[id]/page.tsx
export default function ProductDetail({ params }) {
  return (
    <div>
      <img
        src={product.image}
        className="product-detail-image"
        alt={product.name}
      />
    </div>
  );
}
```

### 17. 如何处理动画性能?

**问题**: 过渡动画导致性能问题

**解决方案**:

```css
/* 使用transform和opacity,避免触发重排 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  /* 使用GPU加速 */
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 避免复杂的动画 */
@keyframes simple-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 18. 如何实现方向感知动画?

**问题**: 根据导航方向显示不同动画

**解决方案**:

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function DirectionalTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const isForward = pathname > previousPath.current;

    document.documentElement.setAttribute(
      "data-direction",
      isForward ? "forward" : "backward"
    );

    previousPath.current = pathname;
  }, [pathname]);

  return null;
}
```

```css
/* 前进动画 */
[data-direction="forward"] ::view-transition-old(root) {
  animation: slide-out-left 0.3s ease-out;
}

[data-direction="forward"] ::view-transition-new(root) {
  animation: slide-in-right 0.3s ease-out;
}

/* 后退动画 */
[data-direction="backward"] ::view-transition-old(root) {
  animation: slide-out-right 0.3s ease-out;
}

[data-direction="backward"] ::view-transition-new(root) {
  animation: slide-in-left 0.3s ease-out;
}

@keyframes slide-out-left {
  to {
    transform: translateX(-100%);
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
}

@keyframes slide-out-right {
  to {
    transform: translateX(100%);
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
  }
}
```

### 19. 如何处理过渡中断?

**问题**: 用户在过渡中再次导航

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export function useViewTransition() {
  const router = useRouter();
  const transitionRef = useRef<ViewTransition | null>(null);

  const navigate = (url: string) => {
    // 中断当前过渡
    if (transitionRef.current) {
      transitionRef.current.skipTransition();
    }

    if (document.startViewTransition) {
      transitionRef.current = document.startViewTransition(() => {
        router.push(url);
      });
    } else {
      router.push(url);
    }
  };

  return { navigate };
}
```

### 20. 如何实现加载状态过渡?

**问题**: 在数据加载时显示过渡动画

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoadingTransition() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = async (url: string) => {
    setIsLoading(true);

    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        router.push(url);
        // 等待数据加载
        await new Promise((resolve) => setTimeout(resolve, 500));
      });

      await transition.finished;
    } else {
      router.push(url);
    }

    setIsLoading(false);
  };

  return (
    <div>{isLoading && <div className="loading-indicator">加载中...</div>}</div>
  );
}
```

### 21. 如何实现多元素协调动画?

**问题**: 多个元素需要协调过渡

**解决方案**:

```css
/* 为不同元素设置不同的过渡名称 */
.header {
  view-transition-name: header;
}

.sidebar {
  view-transition-name: sidebar;
}

.content {
  view-transition-name: content;
}

/* 设置不同的延迟,创建协调效果 */
::view-transition-old(header),
::view-transition-new(header) {
  animation-delay: 0s;
}

::view-transition-old(sidebar),
::view-transition-new(sidebar) {
  animation-delay: 0.1s;
}

::view-transition-old(content),
::view-transition-new(content) {
  animation-delay: 0.2s;
}
```

### 22. 如何实现条件过渡?

**问题**: 某些导航不需要过渡

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export function ConditionalTransition() {
  const router = useRouter();

  const navigate = (url: string, withTransition = true) => {
    if (withTransition && document.startViewTransition) {
      document.startViewTransition(() => {
        router.push(url);
      });
    } else {
      router.push(url);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/page1", true)}>带过渡导航</button>
      <button onClick={() => navigate("/page2", false)}>无过渡导航</button>
    </div>
  );
}
```

### 23. 如何调试过渡动画?

**问题**: 调试复杂的过渡效果

**解决方案**:

```tsx
"use client";

import { useEffect } from "react";

export function TransitionDebugger() {
  useEffect(() => {
    if (document.startViewTransition) {
      const originalTransition = document.startViewTransition;

      document.startViewTransition = function (callback) {
        console.log("[View Transition] 开始");

        const transition = originalTransition.call(this, callback);

        transition.ready.then(() => {
          console.log("[View Transition] 准备完成");
        });

        transition.finished.then(() => {
          console.log("[View Transition] 完成");
        });

        return transition;
      };
    }
  }, []);

  return null;
}
```

### 24. 如何实现自定义过渡类型?

**问题**: 不同页面使用不同过渡效果

**解决方案**:

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const transitionTypes = {
  "/": "fade",
  "/products": "slide",
  "/about": "zoom",
};

export function CustomTransitionType() {
  const pathname = usePathname();

  useEffect(() => {
    const type = transitionTypes[pathname] || "fade";
    document.documentElement.setAttribute("data-transition-type", type);
  }, [pathname]);

  return null;
}
```

```css
/* 淡入淡出 */
[data-transition-type="fade"] ::view-transition-old(root),
[data-transition-type="fade"] ::view-transition-new(root) {
  animation: fade 0.3s;
}

/* 滑动 */
[data-transition-type="slide"] ::view-transition-old(root) {
  animation: slide-out 0.3s;
}

[data-transition-type="slide"] ::view-transition-new(root) {
  animation: slide-in 0.3s;
}

/* 缩放 */
[data-transition-type="zoom"] ::view-transition-old(root) {
  animation: zoom-out 0.3s;
}

[data-transition-type="zoom"] ::view-transition-new(root) {
  animation: zoom-in 0.3s;
}
```

### 25. 如何处理无障碍访问?

**问题**: 确保过渡动画不影响无障碍访问

**解决方案**:

```css
/* 尊重用户的动画偏好 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01s !important;
    animation-delay: 0s !important;
  }
}
```

```tsx
"use client";

import { useEffect, useState } from "react";

export function AccessibleTransition() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div aria-live="polite">{prefersReducedMotion && "已禁用动画效果"}</div>
  );
}
```

## 最佳实践

### 1. 渐进增强

```tsx
// 始终提供降级方案
function navigate(url: string) {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      router.push(url);
    });
  } else {
    router.push(url);
  }
}
```

### 2. 性能优先

```css
/* 使用高性能属性 */
::view-transition-old(root),
::view-transition-new(root) {
  /* 只使用transform和opacity */
  animation: fade-slide 0.3s;
}

@keyframes fade-slide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3. 用户体验

```css
/* 保持动画简短 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s; /* 不超过0.5s */
}
```

## 总结

experimental.viewTransition 配置为 Next.js 带来了流畅的页面过渡效果。使用 View Transitions 可以：

1. **提升体验**：更自然的导航感受
2. **简化实现**：无需复杂的动画代码
3. **性能优化**：浏览器原生支持
4. **渐进增强**：不支持的浏览器降级
5. **灵活定制**：自定义动画效果

关键要点：

- 启用 viewTransition 配置
- 使用 view-transition-name 命名元素
- 自定义 CSS 动画
- 检查浏览器支持
- 提供降级方案
- 控制动画时长
- 优化性能
- 处理异步导航
- 监听过渡事件
- 测试兼容性

记住：View Transitions 是实验性功能，目前只有 Chrome 111+和 Edge 111+支持。在生产环境使用时，务必提供降级方案，确保在不支持的浏览器中也能正常导航。

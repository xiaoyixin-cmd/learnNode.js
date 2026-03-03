**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 01-08-template.js 文件作用与使用

## 概述

### 什么是 template.js

`template.js` (或 `template.tsx`) 是 Next.js App Router 中的特殊文件,与 `layout.js` 类似用于包装子内容,但关键区别在于:模板在每次导航时都会创建新实例,而布局会保持状态。这使得模板非常适合需要在导航时重置状态、触发动画或重新初始化的场景。

在 Next.js 16 中,`template.js` 为开发者提供了更细粒度的控制,在需要每次导航都"刷新"UI 时提供了完美的解决方案。

### template.js 的核心价值

**1. 状态重置**

- 每次导航创建新实例
- 组件状态自动清空
- 副作用(useEffect)重新执行

**2. 页面过渡动画**

- 每次导航触发进入动画
- 支持退出动画
- 与动画库无缝集成

**3. 框架行为控制**

- 改变默认的状态保持行为
- 强制组件重新挂载
- 重新同步副作用

**4. 用户体验优化**

- 确保每次访问都是"新鲜"的
- 避免状态污染
- 提供一致的初始体验

### template.js vs layout.js

| 特性      | layout.js        | template.js   |
| --------- | ---------------- | ------------- |
| 状态保持  | ✅ 保持状态      | ❌ 重置状态   |
| DOM 复用  | ✅ 复用          | ❌ 重新创建   |
| 导航行为  | 不重新挂载       | 每次重新挂载  |
| useEffect | 仅首次执行       | 每次导航执行  |
| 适用场景  | 共享 UI,持久状态 | 动画,状态重置 |
| 性能      | 更优             | 略低          |

---

## 第一部分:template.js 基础

### 1.1 template.js 文件结构

#### 基础语法

```typescript
// app/template.tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

#### 完整实现

```typescript
// app/dashboard/template.tsx
"use client";

import { useEffect } from "react";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log("Dashboard template mounted");

    return () => {
      console.log("Dashboard template unmounted");
    };
  }, []);

  return <div className="dashboard-template">{children}</div>;
}
```

### 1.2 template.js 工作原理

#### 渲染层次

```
app/
├── layout.tsx           # 保持挂载
└── dashboard/
    ├── layout.tsx       # 保持挂载
    ├── template.tsx     # 每次导航重新挂载
    ├── page.tsx         # 每次导航重新渲染
    └── settings/
        └── page.tsx
```

**渲染流程**:

1. 访问 `/dashboard`: 挂载 template.tsx
2. 导航到 `/dashboard/settings`: 卸载并重新挂载 template.tsx
3. 返回 `/dashboard`: 再次卸载并重新挂载 template.tsx

#### 与 layout 的组合

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar /> {/* 导航时保持挂载 */}
      {children}
    </div>
  );
}

// app/dashboard/template.tsx
("use client");

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-template">
      {children} {/* 导航时重新挂载 */}
    </div>
  );
}
```

**实际渲染**:

```jsx
<DashboardLayout>
  <Sidebar /> {/* 保持状态 */}
  <DashboardTemplate key={route}>
    {" "}
    {/* 每次导航新建 */}
    <Page />
  </DashboardTemplate>
</DashboardLayout>
```

### 1.3 状态重置演示

#### layout 状态保持

```typescript
// app/with-layout/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function WithLayoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数器: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>

      <nav>
        <Link href="/with-layout/page1">Page 1</Link>
        <Link href="/with-layout/page2">Page 2</Link>
      </nav>

      {children}
    </div>
  );
}
// 导航时,count 值保持不变
```

#### template 状态重置

```typescript
// app/with-template/template.tsx
"use client";

import { useState } from "react";

export default function WithTemplateTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数器: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      {children}
    </div>
  );
}
// 导航时,count 重置为 0
```

---

## 第二部分:template.js 应用场景

### 2.1 页面过渡动画

#### 使用 Framer Motion

```typescript
// app/template.tsx
"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

#### 滑动过渡

```typescript
// app/blog/template.tsx
"use client";

import { motion } from "framer-motion";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

#### 淡入淡出动画

```typescript
// app/products/template.tsx
"use client";

import { motion } from "framer-motion";

export default function ProductsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 2.2 表单状态重置

```typescript
// app/forms/template.tsx
"use client";

import { useEffect } from "react";

export default function FormsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 每次导航时重置表单相关的全局状态
    localStorage.removeItem("draft-form-data");

    return () => {
      console.log("Form template unmounting");
    };
  }, []);

  return <div className="forms-template">{children}</div>;
}
```

### 2.3 页面访问追踪

```typescript
// app/template.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // 每次导航都记录页面访问
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: pathname,
      });
    }

    console.log("Page view:", pathname);
  }, [pathname]);

  return <div>{children}</div>;
}
```

### 2.4 滚动位置重置

```typescript
// app/template.tsx
"use client";

import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 每次导航滚动到顶部
    window.scrollTo(0, 0);
  }, []);

  return <div>{children}</div>;
}
```

---

## 第三部分:高级用法

### 3.1 条件动画

```typescript
// app/template.tsx
"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 根据路径选择不同动画
  const getAnimation = () => {
    if (pathname.startsWith("/blog")) {
      return {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
      };
    }

    if (pathname.startsWith("/products")) {
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    };
  };

  const animation = getAnimation();

  return (
    <motion.div {...animation} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}
```

### 3.2 加载进度指示

```typescript
// app/template.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LoadingBar from "@/components/LoadingBar";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div>
      {isLoading && <LoadingBar />}
      {children}
    </div>
  );
}
```

### 3.3 面包屑导航

```typescript
// app/dashboard/template.tsx
"use client";

import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      <Breadcrumbs pathname={pathname} />
      {children}
    </div>
  );
}

// components/Breadcrumbs.tsx
("use client");

import Link from "next/link";

export default function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="breadcrumbs">
      <Link href="/">首页</Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <span key={href}>
            <span className="separator">/</span>
            {isLast ? (
              <span>{segment}</span>
            ) : (
              <Link href={href}>{segment}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

### 3.4 主题切换

```typescript
// app/template.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // 根据路径应用不同主题
    if (pathname.startsWith("/admin")) {
      document.documentElement.classList.add("theme-admin");
    } else {
      document.documentElement.classList.remove("theme-admin");
    }
  }, [pathname]);

  return <div>{children}</div>;
}
```

---

## 第四部分:实战应用

### 4.1 博客系统过渡

```typescript
// app/blog/template.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 4.2 表单向导

```typescript
// app/signup/template.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SignupTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // 记录用户在注册流程中的步骤
    const step = pathname.split("/").pop();
    console.log("Signup step:", step);

    // 发送分析事件
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "signup_step", {
        step: step,
      });
    }
  }, [pathname]);

  return (
    <div className="signup-template">
      <div className="signup-container">{children}</div>
    </div>
  );
}
```

### 4.3 游戏应用

```typescript
// app/game/template.tsx
"use client";

import { useEffect } from "react";

export default function GameTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 每次导航时初始化游戏状态
    const gameState = {
      score: 0,
      level: 1,
      lives: 3,
    };

    sessionStorage.setItem("gameState", JSON.stringify(gameState));

    return () => {
      // 清理游戏资源
      sessionStorage.removeItem("gameState");
    };
  }, []);

  return <div className="game-template">{children}</div>;
}
```

### 4.4 仪表板刷新

```typescript
// app/dashboard/template.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // 每次导航时刷新数据
    router.refresh();

    // 清除缓存的仪表板数据
    localStorage.removeItem("dashboard-cache");
  }, [router]);

  return <div className="dashboard-template">{children}</div>;
}
```

---

## 适用场景

### 何时使用 template.js

**1. 页面过渡动画**

- 每次导航需要动画
- 进入/退出效果
- 视觉反馈

**2. 状态重置**

- 表单清空
- 游戏重置
- 临时数据清理

**3. 副作用重新执行**

- 页面访问追踪
- 数据刷新
- 初始化逻辑

**4. 框架行为控制**

- 强制重新挂载
- 改变默认缓存行为
- 重新同步

### 何时使用 layout.js

**1. 共享 UI**

- 导航栏
- 侧边栏
- 页脚

**2. 状态保持**

- 用户输入
- 滚动位置
- 组件状态

**3. 性能优化**

- 避免不必要的重新渲染
- 复用 DOM 元素
- 减少 JavaScript 执行

---

## 注意事项

### 1. 性能考虑

```typescript
// ❌ 避免:过度使用template导致性能问题
// 每个template都会重新挂载,增加开销

// app/template.tsx
// app/section1/template.tsx
// app/section1/subsection/template.tsx  // 过多嵌套

// ✅ 推荐:仅在必要时使用template
// 大部分场景使用layout即可
```

### 2. 与 layout 的配合

```typescript
// app/dashboard/layout.tsx
export default function Layout({ children }) {
  return (
    <div>
      <Sidebar /> {/* 保持挂载 */}
      {children}
    </div>
  );
}

// app/dashboard/template.tsx
export default function Template({ children }) {
  return <div>{children}</div>; // 每次重新挂载
}

// 渲染顺序: Layout > Template > Page
```

### 3. 客户端组件限制

```typescript
// template.js 通常需要是客户端组件
"use client";

import { useEffect } from "react";

export default function Template({ children }) {
  useEffect(() => {
    // 副作用逻辑
  }, []);

  return <div>{children}</div>;
}
```

---

## 常见问题

### Q1: template.js 和 layout.js 可以同时使用吗?

**答**: 可以,渲染顺序为 `Layout > Template > Page`。

```typescript
// 实际渲染
<Layout>
  <Template key={route}>
    <Page />
  </Template>
</Layout>
```

### Q2: template.js 影响性能吗?

**答**: 是的,因为每次导航都重新挂载,会增加性能开销。仅在必要时使用。

### Q3: 如何在 template 中访问路由信息?

**答**: 使用客户端钩子。

```typescript
"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function Template({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return <div data-path={pathname}>{children}</div>;
}
```

### Q4: template.js 可以是服务端组件吗?

**答**: 可以,但大多数场景需要客户端功能(如 useEffect),所以通常是客户端组件。

### Q5: 如何避免动画闪烁?

**答**: 使用 AnimatePresence 的 `mode="wait"`。

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 总结

### 核心要点

1. **template.js 的作用**

   - 每次导航重新挂载
   - 状态自动重置
   - 副作用重新执行

2. **与 layout.js 的区别**

   - Layout: 状态保持
   - Template: 状态重置

3. **主要应用**

   - 页面过渡动画
   - 表单状态重置
   - 页面访问追踪

4. **性能权衡**

   - Template 性能略低
   - 仅在必要时使用
   - 大多数场景用 Layout

5. **渲染层次**
   - Layout > Template > Page
   - 可同时使用
   - Template 优先级更高

## 第六部分:高级技巧

### 6.1 多层 Template 嵌套

**分层动画管理**

```typescript
// app/template.tsx - 全局模板
export default function RootTemplate({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// app/dashboard/template.tsx - Dashboard 模板
export default function DashboardTemplate({ children }) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
```

### 6.2 条件渲染

**基于路由的条件逻辑**

```typescript
"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ConditionalTemplate({ children }) {
  const pathname = usePathname();

  // 仅在特定路由启用动画
  const shouldAnimate = pathname.startsWith("/products");

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 6.3 性能优化策略

**懒加载动画库**

```typescript
"use client";

import { Suspense, lazy } from "react";
import { usePathname } from "next/navigation";

// 懒加载动画组件
const AnimatedTemplate = lazy(() => import("./AnimatedTemplate"));

export default function OptimizedTemplate({ children }) {
  const pathname = usePathname();
  const needsAnimation = pathname.includes("/animated");

  if (!needsAnimation) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<div>{children}</div>}>
      <AnimatedTemplate>{children}</AnimatedTemplate>
    </Suspense>
  );
}
```

### 6.4 与状态管理集成

**Redux 状态重置**

```typescript
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetFormState } from "@/store/formSlice";

export default function FormTemplate({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // 每次进入新页面重置表单
    dispatch(resetFormState());

    return () => {
      // 清理工作
    };
  }, [dispatch]);

  return <div className="form-container">{children}</div>;
}
```

**Zustand 状态管理**

```typescript
"use client";

import { useEffect } from "react";
import { useStore } from "@/store";

export default function StoreTemplate({ children }) {
  const resetStore = useStore((state) => state.reset);

  useEffect(() => {
    // 重置特定 store 分片
    resetStore();
  }, [resetStore]);

  return <>{children}</>;
}
```

## 第七部分:错误处理与调试

### 7.1 常见错误

**水化错误**

```typescript
// ❌ 错误:服务端和客户端不一致
export default function BadTemplate({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 服务端和客户端渲染不同
  return <div className={mounted ? "client" : "server"}>{children}</div>;
}

// ✅ 正确:保持一致
export default function GoodTemplate({ children }) {
  return <div className="consistent">{children}</div>;
}
```

**动画闪烁**

```typescript
// 问题:动画初始状态闪现

// 解决方案 1: 使用 CSS
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

// 解决方案 2: 预加载动画
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SmoothTemplate({ children }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### 7.2 调试技巧

**生命周期追踪**

```typescript
"use client";

import { useEffect } from "react";

export default function DebugTemplate({ children }) {
  useEffect(() => {
    console.log("Template mounted");

    return () => {
      console.log("Template unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("Template updated");
  });

  return <div data-template="debug">{children}</div>;
}
```

**性能监控**

```typescript
"use client";

import { useEffect, useRef } from "react";

export default function PerformanceTemplate({ children }) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - startTime.current;

    console.log(`Template render #${renderCount.current}: ${renderTime}ms`);

    // 性能告警
    if (renderTime > 100) {
      console.warn("⚠️ Template render 过慢!");
    }
  });

  return <>{children}</>;
}
```

### 最佳实践

1. **明确需求**: 确定是否真的需要状态重置
2. **性能优先**: 大部分场景使用 layout.js
3. **动画优化**: 使用专业动画库(Framer Motion)
4. **类型安全**: 使用 TypeScript 定义 props
5. **测试验证**: 确保动画和状态重置符合预期

`template.js` 是 Next.js 提供的强大工具,在需要每次导航都"刷新"UI 的场景下非常有用。

---

**下一篇**: 继续学习第 5 章:组件模型基础,深入理解服务端组件和客户端组件。

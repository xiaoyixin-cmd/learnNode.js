**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 内联样式与 CSS-in-JS

## 1. 概述 (Overview)

内联样式和 CSS-in-JS 是在 React 和 Next.js 中编写样式的两种动态方式。它们允许在 JavaScript 中直接编写和管理样式，提供了更强的动态性和组件封装性。

### 1.1 什么是内联样式

内联样式是直接在 JSX 元素上使用 `style` 属性定义样式的方式：

```tsx
<div style={{ color: "red", fontSize: "16px" }}>内联样式示例</div>
```

**特点**：

- 样式直接写在组件中
- 使用 JavaScript 对象定义
- 动态性强
- 作用域局限于元素

### 1.2 什么是 CSS-in-JS

CSS-in-JS 是使用 JavaScript 编写 CSS 的方法论，通过库（如 styled-components、Emotion）实现：

```tsx
import styled from "styled-components";

const Button = styled.button`
  color: white;
  background-color: blue;
  padding: 10px 20px;
`;
```

**特点**：

- 样式与组件紧密结合
- 支持主题和动态样式
- 自动生成唯一类名
- 运行时或构建时处理

### 1.3 Next.js 16 中的支持

🆕 **Next.js 16 新特性**：

- 改进的 CSS-in-JS 支持
- 更好的服务端渲染集成
- 支持零运行时 CSS-in-JS（如 Vanilla Extract）
- Turbopack 加速编译

⚠️ **重要变化**：

- App Router 中 CSS-in-JS 需要特殊配置
- 推荐使用零运行时方案
- 运行时 CSS-in-JS 需要客户端组件

---

## 2. 内联样式 (Inline Styles)

### 2.1 基础用法

```tsx
export function InlineStyleExample() {
  return (
    <div
      style={{
        color: "white",
        backgroundColor: "#3b82f6",
        padding: "1rem",
        borderRadius: "0.5rem",
      }}
    >
      这是内联样式
    </div>
  );
}
```

### 2.2 动态内联样式

```tsx
interface ButtonProps {
  variant: "primary" | "secondary";
  size: "small" | "large";
}

export function DynamicButton({ variant, size }: ButtonProps) {
  const baseStyles = {
    padding: size === "small" ? "0.5rem 1rem" : "1rem 2rem",
    fontSize: size === "small" ? "0.875rem" : "1rem",
    borderRadius: "0.25rem",
    border: "none",
    cursor: "pointer",
  };

  const variantStyles = {
    primary: {
      backgroundColor: "#3b82f6",
      color: "white",
    },
    secondary: {
      backgroundColor: "#e5e7eb",
      color: "#1f2937",
    },
  };

  return (
    <button style={{ ...baseStyles, ...variantStyles[variant] }}>按钮</button>
  );
}
```

### 2.3 使用 CSS 变量

```tsx
export function CSSVariableExample() {
  return (
    <div
      style={{
        color: "var(--color-primary)",
        backgroundColor: "var(--bg-primary)",
        padding: "var(--spacing-md)",
      }}
    >
      使用 CSS 变量
    </div>
  );
}
```

### 2.4 条件样式

```tsx
interface AlertProps {
  type: "success" | "warning" | "error";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const colorMap = {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: "0.5rem",
        backgroundColor: `${colorMap[type]}20`,
        borderLeft: `4px solid ${colorMap[type]}`,
        color: colorMap[type],
      }}
    >
      {message}
    </div>
  );
}
```

### 2.5 内联样式的优缺点

**优点**：

| 优点         | 说明                             |
| :----------- | :------------------------------- |
| 动态性强     | 可以基于 props 和 state 动态计算 |
| 无需额外工具 | React 原生支持                   |
| 作用域隔离   | 样式只作用于当前元素             |
| 易于理解     | 直观，容易上手                   |

**缺点**：

| 缺点     | 说明                     |
| :------- | :----------------------- |
| 性能问题 | 每次渲染都创建新对象     |
| 功能受限 | 不支持伪类、媒体查询等   |
| 代码冗长 | 复杂样式会使代码臃肿     |
| 无法复用 | 难以在多个组件间共享样式 |

---

## 3. styled-components

### 3.1 安装和配置

```bash
npm install styled-components
npm install -D @types/styled-components
```

**在 Next.js 16 App Router 中配置**：

```tsx
// app/lib/registry.tsx
"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
```

```tsx
// app/layout.tsx
import StyledComponentsRegistry from "./lib/registry";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
```

### 3.2 基础用法

```tsx
// components/Button.tsx
"use client";

import styled from "styled-components";

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <StyledButton {...props}>{children}</StyledButton>;
}
```

### 3.3 Props 驱动的样式

```tsx
"use client";

import styled from "styled-components";

interface ButtonProps {
  $variant?: "primary" | "secondary" | "danger";
  $size?: "small" | "medium" | "large";
}

const StyledButton = styled.button<ButtonProps>`
  padding: ${(props) => {
    switch (props.$size) {
      case "small":
        return "0.375rem 0.75rem";
      case "large":
        return "0.75rem 1.5rem";
      default:
        return "0.5rem 1rem";
    }
  }};

  font-size: ${(props) => {
    switch (props.$size) {
      case "small":
        return "0.875rem";
      case "large":
        return "1.125rem";
      default:
        return "1rem";
    }
  }};

  background-color: ${(props) => {
    switch (props.$variant) {
      case "secondary":
        return "#e5e7eb";
      case "danger":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  }};

  color: ${(props) => (props.$variant === "secondary" ? "#1f2937" : "white")};

  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export function Button({
  variant = "primary",
  size = "medium",
  children,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledButton $variant={variant} $size={size} {...props}>
      {children}
    </StyledButton>
  );
}
```

### 3.4 样式继承

```tsx
"use client";

import styled from "styled-components";

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
`;

const PrimaryButton = styled(Button)`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #e5e7eb;
  color: #1f2937;

  &:hover {
    background-color: #d1d5db;
  }
`;

const DangerButton = styled(Button)`
  background-color: #ef4444;
  color: white;

  &:hover {
    background-color: #dc2626;
  }
`;
```

### 3.5 主题支持

```tsx
// app/lib/theme.ts
export const lightTheme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    background: "#ffffff",
    text: "#111827",
    border: "#e5e7eb",
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
  },
};

export const darkTheme = {
  colors: {
    primary: "#60a5fa",
    secondary: "#a78bfa",
    background: "#1f2937",
    text: "#f9fafb",
    border: "#374151",
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
};

export type Theme = typeof lightTheme;
```

```tsx
// components/ThemedButton.tsx
"use client";

import styled from "styled-components";

const ThemedButton = styled.button`
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export default ThemedButton;
```

```tsx
// app/layout.tsx
"use client";

import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./lib/theme";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  return (
    <html>
      <body>
        <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3.6 全局样式

```tsx
// app/lib/globalStyles.ts
"use client";

import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    line-height: 1.6;
  }

  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default GlobalStyles;
```

```tsx
// app/layout.tsx
import GlobalStyles from "./lib/globalStyles";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <GlobalStyles />
        {children}
      </body>
    </html>
  );
}
```

---

## 4. Emotion

### 4.1 安装和配置

```bash
npm install @emotion/react @emotion/styled
```

**在 Next.js 16 中配置**：

```javascript
// next.config.js
module.exports = {
  compiler: {
    emotion: true,
  },
};
```

### 4.2 使用 styled API

```tsx
"use client";

import styled from "@emotion/styled";

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

export default function EmotionButton() {
  return <Button>Emotion 按钮</Button>;
}
```

### 4.3 使用 css prop

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { css } from "@emotion/react";

export default function CssPropExample() {
  return (
    <div
      css={css`
        padding: 1rem;
        background-color: #f3f4f6;
        border-radius: 0.5rem;

        &:hover {
          background-color: #e5e7eb;
        }
      `}
    >
      使用 css prop
    </div>
  );
}
```

### 4.4 对象样式

```tsx
/** @jsxImportSource @emotion/react */
"use client";

export default function ObjectStyleExample() {
  return (
    <div
      css={{
        padding: "1rem",
        backgroundColor: "#3b82f6",
        color: "white",
        borderRadius: "0.5rem",
        "&:hover": {
          backgroundColor: "#2563eb",
        },
      }}
    >
      对象样式
    </div>
  );
}
```

### 4.5 组合样式

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { css } from "@emotion/react";

const baseStyles = css`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
`;

const primaryStyles = css`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

const secondaryStyles = css`
  background-color: #e5e7eb;
  color: #1f2937;

  &:hover {
    background-color: #d1d5db;
  }
`;

export default function ComposedStyles() {
  return (
    <div>
      <button css={[baseStyles, primaryStyles]}>主要按钮</button>
      <button css={[baseStyles, secondaryStyles]}>次要按钮</button>
    </div>
  );
}
```

### 4.6 主题支持

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { ThemeProvider, useTheme } from "@emotion/react";

const theme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  },
};

function ThemedButton() {
  const theme = useTheme();

  return (
    <button
      css={{
        padding: theme.spacing.md,
        backgroundColor: theme.colors.primary,
        color: "white",
        border: "none",
        borderRadius: "0.25rem",
        cursor: "pointer",
      }}
    >
      主题按钮
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <ThemedButton />
    </ThemeProvider>
  );
}
```

---

## 5. 零运行时 CSS-in-JS

### 5.1 Vanilla Extract

**安装**：

```bash
npm install @vanilla-extract/css @vanilla-extract/next-plugin
```

**配置**：

```javascript
// next.config.js
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

module.exports = withVanillaExtract({
  // Next.js 配置
});
```

**使用**：

```typescript
// Button.css.ts
import { style } from "@vanilla-extract/css";

export const button = style({
  padding: "0.5rem 1rem",
  borderRadius: "0.25rem",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#3b82f6",
  color: "white",
  transition: "background-color 0.2s",

  ":hover": {
    backgroundColor: "#2563eb",
  },
});

export const primary = style({
  backgroundColor: "#3b82f6",
});

export const secondary = style({
  backgroundColor: "#e5e7eb",
  color: "#1f2937",
});
```

```tsx
// Button.tsx
import * as styles from "./Button.css";

export function Button({ variant = "primary", children }: ButtonProps) {
  return (
    <button
      className={variant === "primary" ? styles.primary : styles.secondary}
    >
      {children}
    </button>
  );
}
```

### 5.2 主题支持

```typescript
// theme.css.ts
import { createTheme } from "@vanilla-extract/css";

export const [themeClass, vars] = createTheme({
  color: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    background: "#ffffff",
    text: "#111827",
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  },
});
```

```typescript
// Button.css.ts
import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const button = style({
  padding: vars.spacing.md,
  backgroundColor: vars.color.primary,
  color: "white",
  borderRadius: "0.25rem",
});
```

### 5.3 响应式样式

```typescript
// styles.css.ts
import { style } from "@vanilla-extract/css";

export const container = style({
  padding: "1rem",
  "@media": {
    "screen and (min-width: 768px)": {
      padding: "2rem",
    },
    "screen and (min-width: 1024px)": {
      padding: "3rem",
    },
  },
});
```

---

## 6. 方案对比 (Comparison)

### 6.1 功能对比

| 特性       | 内联样式 | styled-components | Emotion | Vanilla Extract |
| :--------- | :------- | :---------------- | :------ | :-------------- |
| 运行时开销 | 无       | 有                | 有      | 无              |
| 类型安全   | 部分     | 是                | 是      | 是              |
| 主题支持   | 需手动   | 内置              | 内置    | 支持            |
| 伪类支持   | 否       | 是                | 是      | 是              |
| 媒体查询   | 否       | 是                | 是      | 是              |
| SSR 支持   | 是       | 需配置            | 需配置  | 是              |
| 学习成本   | 低       | 中                | 中      | 中              |
| 性能       | 好       | 中                | 中      | 优秀            |

### 6.2 性能对比

| 方案              | 首次渲染 | 重新渲染 | 包大小 | 推荐度     |
| :---------------- | :------- | :------- | :----- | :--------- |
| 内联样式          | 快       | 慢       | 0 KB   | ⭐⭐       |
| CSS Modules       | 快       | 快       | 0 KB   | ⭐⭐⭐⭐⭐ |
| styled-components | 中       | 中       | ~16 KB | ⭐⭐⭐     |
| Emotion           | 中       | 中       | ~11 KB | ⭐⭐⭐     |
| Vanilla Extract   | 快       | 快       | ~5 KB  | ⭐⭐⭐⭐⭐ |

### 6.3 使用场景对比

| 场景               | 推荐方案                      | 原因            |
| :----------------- | :---------------------------- | :-------------- |
| 简单动态样式       | 内联样式                      | 简单直接        |
| 组件库开发         | styled-components / Emotion   | 功能完整        |
| 高性能应用         | Vanilla Extract / CSS Modules | 零运行时        |
| 需要主题系统       | styled-components / Emotion   | 内置主题支持    |
| Next.js App Router | Vanilla Extract / CSS Modules | 更好的 SSR 支持 |

---

## 7. 适用场景 (Applicable Scenarios)

### 7.1 内联样式适用场景

- 简单的动态样式
- 基于 props 的样式变化
- 原型开发和快速迭代
- 不需要伪类和媒体查询的场景

### 7.2 styled-components 适用场景

- 需要完整的 CSS 功能
- 组件库开发
- 需要主题系统
- 团队熟悉 CSS-in-JS

### 7.3 Emotion 适用场景

- 需要灵活的样式方案
- 性能要求较高（比 styled-components 轻量）
- 需要 css prop 的便利性
- 混合使用多种样式方式

### 7.4 Vanilla Extract 适用场景

- 高性能要求
- Next.js App Router 项目
- 需要类型安全
- 不想要运行时开销

---

## 8. 注意事项 (Precautions)

### 8.1 内联样式注意事项

```tsx
// ❌ 不好：每次渲染都创建新对象
export function BadExample() {
  return (
    <div style={{ padding: "1rem", backgroundColor: "#f3f4f6" }}>内容</div>
  );
}

// ✅ 好：提取到组件外部
const containerStyle = {
  padding: "1rem",
  backgroundColor: "#f3f4f6",
};

export function GoodExample() {
  return <div style={containerStyle}>内容</div>;
}

// ✅ 更好：使用 useMemo
export function BetterExample({ color }: { color: string }) {
  const style = useMemo(
    () => ({
      padding: "1rem",
      backgroundColor: color,
    }),
    [color]
  );

  return <div style={style}>内容</div>;
}
```

### 8.2 CSS-in-JS 在 App Router 中的注意事项

```tsx
// ❌ 不好：在服务端组件中使用 styled-components
import styled from "styled-components";

const Button = styled.button`
  padding: 1rem;
`;

export default function Page() {
  return <Button>按钮</Button>; // 会报错
}

// ✅ 好：标记为客户端组件
("use client");

import styled from "styled-components";

const Button = styled.button`
  padding: 1rem;
`;

export default function Page() {
  return <Button>按钮</Button>;
}
```

### 8.3 避免样式闪烁

```tsx
// 使用 styled-components 时需要配置 SSR
// app/lib/registry.tsx
"use client";

import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // ...
}
```

### 8.4 性能优化

```tsx
// ❌ 不好：在渲染函数中定义样式组件
export function BadComponent() {
  const Button = styled.button`
    padding: 1rem;
  `;

  return <Button>按钮</Button>;
}

// ✅ 好：在组件外部定义
const Button = styled.button`
  padding: 1rem;
`;

export function GoodComponent() {
  return <Button>按钮</Button>;
}
```

---

## 9. 常见问题 (FAQ)

### 9.1 内联样式和 CSS-in-JS 哪个更好？

**问题**：应该选择内联样式还是 CSS-in-JS？

**回答**：

取决于项目需求：

**选择内联样式**：

- 简单的动态样式
- 不需要伪类和媒体查询
- 追求最小的包大小

**选择 CSS-in-JS**：

- 需要完整的 CSS 功能
- 需要主题系统
- 组件库开发

**推荐**：

- 对于 Next.js 16 App Router，推荐使用 **Vanilla Extract** 或 **CSS Modules**
- 如果必须使用运行时 CSS-in-JS，选择 **Emotion**（比 styled-components 轻量）

### 9.2 CSS-in-JS 在 Next.js 16 中有什么变化？

**问题**：Next.js 16 对 CSS-in-JS 的支持有什么变化？

**回答**：

**主要变化**：

1. **App Router 中需要客户端组件**：

```tsx
"use client"; // 必须添加

import styled from "styled-components";
```

2. **需要特殊的 SSR 配置**：

```tsx
// 需要配置 registry
import StyledComponentsRegistry from "./lib/registry";
```

3. **推荐零运行时方案**：

- Vanilla Extract
- CSS Modules
- Tailwind CSS

### 9.3 如何在 CSS-in-JS 中使用媒体查询？

**问题**：如何在 styled-components 中实现响应式设计？

**回答**：

```tsx
import styled from "styled-components";

const Container = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem;
  }
`;

// 或者使用辅助函数
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
};

const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
};

const ResponsiveContainer = styled.div`
  padding: 1rem;

  ${media.md} {
    padding: 2rem;
  }

  ${media.lg} {
    padding: 3rem;
  }
`;
```

### 9.4 CSS-in-JS 的性能如何？

**问题**：CSS-in-JS 会影响性能吗？

**回答**：

**运行时 CSS-in-JS（styled-components、Emotion）**：

- 有一定的运行时开销
- 首次渲染较慢
- 包大小增加 10-16 KB

**零运行时 CSS-in-JS（Vanilla Extract）**：

- 无运行时开销
- 性能与 CSS Modules 相当
- 包大小增加约 5 KB

**性能对比**：

| 方案              | 首屏时间 | 运行时开销 | 包大小 |
| :---------------- | :------- | :--------- | :----- |
| CSS Modules       | 快       | 无         | 0 KB   |
| Vanilla Extract   | 快       | 无         | ~5 KB  |
| Emotion           | 中       | 有         | ~11 KB |
| styled-components | 中       | 有         | ~16 KB |

**建议**：

- 高性能要求：使用 Vanilla Extract 或 CSS Modules
- 功能需求优先：使用 Emotion 或 styled-components

### 9.5 如何迁移现有的 CSS-in-JS 代码？

**问题**：如何从 styled-components 迁移到 Vanilla Extract？

**回答**：

**迁移步骤**：

1. **安装 Vanilla Extract**：

```bash
npm install @vanilla-extract/css @vanilla-extract/next-plugin
```

2. **配置 Next.js**：

```javascript
// next.config.js
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

module.exports = withVanillaExtract({});
```

3. **转换样式**：

**之前（styled-components）**：

```tsx
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;

  &:hover {
    background-color: #2563eb;
  }
`;
```

**之后（Vanilla Extract）**：

```typescript
// Button.css.ts
import { style } from "@vanilla-extract/css";

export const button = style({
  padding: "0.5rem 1rem",
  backgroundColor: "#3b82f6",
  ":hover": {
    backgroundColor: "#2563eb",
  },
});
```

```tsx
// Button.tsx
import * as styles from "./Button.css";

export function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.button}>{children}</button>;
}
```

---

## 10. 总结 (Summary)

### 10.1 核心要点

**内联样式**：

1. 简单直接，适合简单动态样式
2. 无运行时开销，但功能受限
3. 不支持伪类和媒体查询
4. 每次渲染可能创建新对象，影响性能

**CSS-in-JS**：

1. 功能完整，支持所有 CSS 特性
2. 运行时方案有性能开销
3. 零运行时方案性能优秀
4. 在 Next.js 16 App Router 中需要特殊配置

### 10.2 最佳实践总结

| 场景              | 推荐方案                      | 原因             |
| :---------------- | :---------------------------- | :--------------- |
| Next.js 16 新项目 | Vanilla Extract / CSS Modules | 零运行时，性能好 |
| 需要主题系统      | Emotion / styled-components   | 内置主题支持     |
| 简单动态样式      | 内联样式                      | 简单直接         |
| 组件库开发        | styled-components             | 功能完整         |
| 高性能要求        | Vanilla Extract               | 零运行时         |

### 10.3 关键收获

1. **Next.js 16 推荐零运行时方案**：Vanilla Extract 或 CSS Modules
2. **运行时 CSS-in-JS 需要客户端组件**：必须添加 'use client'
3. **内联样式适合简单场景**：复杂样式应使用其他方案
4. **性能很重要**：选择合适的方案可以显著提升性能
5. **类型安全很有价值**：TypeScript + CSS-in-JS 提供更好的开发体验

### 10.4 下一步建议

1. **评估项目需求**：根据功能和性能要求选择方案
2. **尝试 Vanilla Extract**：体验零运行时 CSS-in-JS
3. **优化现有代码**：减少运行时开销
4. **建立样式规范**：统一团队的样式编写方式
5. **性能监控**：持续监控样式对性能的影响

内联样式和 CSS-in-JS 各有优劣。在 Next.js 16 中，推荐使用零运行时方案（Vanilla Extract 或 CSS Modules）以获得最佳性能。如果需要运行时 CSS-in-JS 的灵活性，Emotion 是一个不错的选择。

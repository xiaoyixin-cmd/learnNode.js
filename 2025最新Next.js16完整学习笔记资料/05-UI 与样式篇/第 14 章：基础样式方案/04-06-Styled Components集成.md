**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Styled Components 集成

## 1. 概述 (Overview)

Styled Components 是最流行的 CSS-in-JS 库之一,它允许在 JavaScript 中编写实际的 CSS 代码。在 Next.js 16 中,Styled Components 需要特殊的配置才能与 App Router 完美配合。

### 1.1 Styled Components 的核心特性

**组件化样式**:

- 样式与组件紧密结合
- 自动生成唯一类名
- 支持动态样式
- 完整的 CSS 功能

**主题系统**:

- 内置主题支持
- 轻松切换主题
- 类型安全的主题
- 全局主题访问

**开发体验**:

- 语法高亮支持
- 自动补全
- 源码映射
- 热模块替换

### 1.2 Next.js 16 中的变化

🆕 **Next.js 16 新特性**:

- 需要特殊的 SSR 配置
- 必须使用客户端组件
- 改进的 Turbopack 支持
- 更好的类型推导

⚠️ **重要注意事项**:

- App Router 中需要配置 Registry
- 服务端组件不能直接使用
- 需要 'use client' 指令
- 可能影响首屏性能

### 1.3 为什么选择 Styled Components

**优势**:

| 优势     | 说明              |
| :------- | :---------------- |
| 功能完整 | 支持所有 CSS 特性 |
| 动态样式 | 基于 props 的样式 |
| 主题系统 | 内置主题支持      |
| 社区支持 | 庞大的社区和生态  |
| 开发体验 | 优秀的 DX         |

**劣势**:

| 劣势       | 说明                    |
| :--------- | :---------------------- |
| 运行时开销 | 有性能影响              |
| 包大小     | 约 16 KB                |
| 配置复杂   | Next.js 16 需要特殊配置 |
| SSR 复杂   | 需要额外配置            |

---

## 2. 安装和配置 (Installation and Configuration)

### 2.1 安装依赖

```bash
npm install styled-components
npm install -D @types/styled-components
```

### 2.2 配置 Next.js

```javascript
// next.config.js
module.exports = {
  compiler: {
    styledComponents: true,
  },
};
```

### 2.3 配置 SSR Registry

创建 Registry 组件以支持服务端渲染:

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

### 2.4 在根布局中使用

```tsx
// app/layout.tsx
import StyledComponentsRegistry from "./lib/registry";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
```

### 2.5 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["styled-components"]
  }
}
```

---

## 3. 基础用法 (Basic Usage)

### 3.1 创建样式组件

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
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
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

### 3.2 Props 驱动的样式

```tsx
"use client";

import styled from "styled-components";

interface ButtonProps {
  $variant?: "primary" | "secondary" | "danger";
  $size?: "small" | "medium" | "large";
  $fullWidth?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  /* 基础样式 */
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 尺寸 */
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

  /* 变体 */
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

  /* 全宽 */
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export function Button({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  children,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  );
}
```

### 3.3 样式继承

```tsx
"use client";

import styled from "styled-components";

// 基础按钮
const BaseButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

// 主要按钮
const PrimaryButton = styled(BaseButton)`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

// 次要按钮
const SecondaryButton = styled(BaseButton)`
  background-color: #e5e7eb;
  color: #1f2937;

  &:hover {
    background-color: #d1d5db;
  }
`;

// 危险按钮
const DangerButton = styled(BaseButton)`
  background-color: #ef4444;
  color: white;

  &:hover {
    background-color: #dc2626;
  }
`;

// 大按钮
const LargeButton = styled(PrimaryButton)`
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
`;
```

### 3.4 样式化现有组件

```tsx
"use client";

import styled from "styled-components";
import Link from "next/link";

// 样式化 Next.js Link
const StyledLink = styled(Link)`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

// 使用
export function Navigation() {
  return (
    <nav>
      <StyledLink href="/">首页</StyledLink>
      <StyledLink href="/about">关于</StyledLink>
      <StyledLink href="/contact">联系</StyledLink>
    </nav>
  );
}
```

### 3.5 伪类和伪元素

```tsx
"use client";

import styled from "styled-components";

const Card = styled.div`
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  position: relative;

  /* 伪类 */
  &:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  /* 伪元素 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: #3b82f6;
    border-radius: 0.5rem 0 0 0.5rem;
  }

  &::after {
    content: "→";
    position: absolute;
    top: 1rem;
    right: 1rem;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
  }
`;
```

### 3.6 嵌套选择器

```tsx
"use client";

import styled from "styled-components";

const Navigation = styled.nav`
  background-color: white;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 1rem;
  }

  li {
    margin: 0;
  }

  a {
    color: #1f2937;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    transition: all 0.2s;

    &:hover {
      background-color: #f3f4f6;
      color: #3b82f6;
    }

    &.active {
      background-color: #3b82f6;
      color: white;
    }
  }
`;
```

---

## 4. 主题系统 (Theme System)

### 4.1 定义主题

```typescript
// lib/theme.ts
export const lightTheme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1)",
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

export const darkTheme: typeof lightTheme = {
  colors: {
    primary: "#60a5fa",
    secondary: "#a78bfa",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    background: "#111827",
    surface: "#1f2937",
    text: "#f9fafb",
    textSecondary: "#9ca3af",
    border: "#374151",
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.3)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.3)",
  },
  typography: lightTheme.typography,
  breakpoints: lightTheme.breakpoints,
};

export type Theme = typeof lightTheme;
```

### 4.2 TypeScript 类型定义

```typescript
// styled.d.ts
import "styled-components";
import { Theme } from "./lib/theme";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
```

### 4.3 使用 ThemeProvider

```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./lib/theme";
import { useState, createContext, useContext } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
```

```tsx
// app/layout.tsx
import StyledComponentsRegistry from "./lib/registry";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
```

### 4.4 在组件中使用主题

```tsx
"use client";

import styled from "styled-components";

const ThemedButton = styled.button`
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: opacity 0.2s;
  box-shadow: ${(props) => props.theme.shadows.sm};

  &:hover {
    opacity: 0.9;
    box-shadow: ${(props) => props.theme.shadows.md};
  }
`;

const Card = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.md};
`;
```

### 4.5 主题切换按钮

```tsx
"use client";

import styled from "styled-components";
import { useThemeContext } from "../app/providers";

const ToggleButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) =>
      props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.full};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: white;
  }
`;

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <ToggleButton onClick={toggleTheme}>
      {isDark ? "☀️ 亮色" : "🌙 暗色"}
    </ToggleButton>
  );
}
```

---

## 5. 全局样式 (Global Styles)

### 5.1 创建全局样式

```tsx
// lib/globalStyles.ts
"use client";

import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${(props) => props.theme.typography.fontFamily.sans};
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    line-height: ${(props) => props.theme.typography.lineHeight.normal};
    transition: background-color 0.3s, color 0.3s;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${(props) => props.theme.typography.fontWeight.bold};
    line-height: ${(props) => props.theme.typography.lineHeight.tight};
    margin-bottom: ${(props) => props.theme.spacing.md};
  }

  h1 {
    font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
  }

  h2 {
    font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  }

  h3 {
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }

  p {
    margin-bottom: ${(props) => props.theme.spacing.md};
  }

  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.theme.colors.secondary};
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
  }

  code {
    font-family: ${(props) => props.theme.typography.fontFamily.mono};
    background-color: ${(props) => props.theme.colors.surface};
    padding: 0.125rem 0.25rem;
    border-radius: ${(props) => props.theme.borderRadius.sm};
    font-size: 0.875em;
  }

  pre {
    font-family: ${(props) => props.theme.typography.fontFamily.mono};
    background-color: ${(props) => props.theme.colors.surface};
    padding: ${(props) => props.theme.spacing.md};
    border-radius: ${(props) => props.theme.borderRadius.md};
    overflow-x: auto;
    margin-bottom: ${(props) => props.theme.spacing.md};

    code {
      background-color: transparent;
      padding: 0;
    }
  }
`;

export default GlobalStyles;
```

### 5.2 在应用中使用

```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "styled-components";
import GlobalStyles from "../lib/globalStyles";
import { lightTheme, darkTheme } from "../lib/theme";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
```

---

## 6. 响应式设计 (Responsive Design)

### 6.1 媒体查询

```tsx
"use client";

import styled from "styled-components";

const Container = styled.div`
  padding: 1rem;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 2rem;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    padding: 3rem;
  }
`;
```

### 6.2 媒体查询辅助函数

```typescript
// lib/mediaQueries.ts
import { css } from "styled-components";

export const media = {
  sm: (styles: TemplateStringsArray | string) => css`
    @media (min-width: 640px) {
      ${styles}
    }
  `,
  md: (styles: TemplateStringsArray | string) => css`
    @media (min-width: 768px) {
      ${styles}
    }
  `,
  lg: (styles: TemplateStringsArray | string) => css`
    @media (min-width: 1024px) {
      ${styles}
    }
  `,
  xl: (styles: TemplateStringsArray | string) => css`
    @media (min-width: 1280px) {
      ${styles}
    }
  `,
};
```

```tsx
"use client";

import styled from "styled-components";
import { media } from "../lib/mediaQueries";

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  ${media.md`
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  `}

  ${media.lg`
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  `}
`;
```

---

## 7. 动画 (Animations)

### 7.1 CSS 动画

```tsx
"use client";

import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const AnimatedCard = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${(props) => props.theme.colors.border};
  border-top-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
```

### 7.2 过渡效果

```tsx
"use client";

import styled from "styled-components";

const HoverCard = styled.div`
  padding: 1.5rem;
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${(props) => props.theme.shadows.xl};
  }
`;
```

---

## 8. 适用场景 (Applicable Scenarios)

### 8.1 适合使用 Styled Components 的场景

- 需要完整的 CSS 功能
- 组件库开发
- 需要强大的主题系统
- 团队熟悉 CSS-in-JS
- 需要动态样式
- 中小型项目

### 8.2 不适合使用的场景

- 高性能要求的大型应用
- 需要零运行时开销
- 服务端组件为主的项目
- 团队不熟悉 CSS-in-JS
- 追求最小包大小

---

## 9. 注意事项 (Precautions)

### 9.1 避免在渲染函数中定义样式组件

```tsx
// ❌ 不好
export function BadComponent() {
  const Button = styled.button`
    padding: 1rem;
  `;
  return <Button>按钮</Button>;
}

// ✅ 好
const Button = styled.button`
  padding: 1rem;
`;

export function GoodComponent() {
  return <Button>按钮</Button>;
}
```

### 9.2 使用 $ 前缀避免 props 传递到 DOM

```tsx
// ❌ 不好：variant 会传递到 DOM
const Button = styled.button<{ variant: string }>`
  background-color: ${(props) =>
    props.variant === "primary" ? "blue" : "gray"};
`;

// ✅ 好：使用 $ 前缀
const Button = styled.button<{ $variant: string }>`
  background-color: ${(props) =>
    props.$variant === "primary" ? "blue" : "gray"};
`;
```

### 9.3 App Router 中必须使用客户端组件

```tsx
// ❌ 不好：在服务端组件中使用
import styled from "styled-components";

const Button = styled.button``;

export default function Page() {
  return <Button>按钮</Button>; // 会报错
}

// ✅ 好：标记为客户端组件
("use client");

import styled from "styled-components";

const Button = styled.button``;

export default function Page() {
  return <Button>按钮</Button>;
}
```

### 9.4 配置 SSR Registry 避免样式闪烁

确保正确配置 Registry 组件,否则会出现样式闪烁问题。

---

## 10. 常见问题 (FAQ)

### 10.1 为什么在 Next.js 16 中需要配置 Registry?

**问题**:为什么 Styled Components 在 Next.js 16 中需要特殊配置?

**回答**:

Next.js 16 的 App Router 使用 React Server Components,而 Styled Components 是运行时 CSS-in-JS 库,需要在客户端运行。Registry 的作用是:

1. **收集服务端渲染的样式**:在服务端渲染时收集所有样式
2. **注入到 HTML**:将样式注入到 HTML 中
3. **避免样式闪烁**:确保首次渲染时样式已经存在
4. **清理样式**:避免样式重复

没有 Registry,会出现:

- 样式闪烁(FOUC)
- 样式丢失
- 水合错误

### 10.2 如何在 Styled Components 中使用 TypeScript?

**问题**:如何为主题添加 TypeScript 类型?

**回答**:

1. **定义主题类型**:

```typescript
// lib/theme.ts
export const lightTheme = {
  colors: {
    primary: "#3b82f6",
    // ...
  },
};

export type Theme = typeof lightTheme;
```

2. **扩展 DefaultTheme**:

```typescript
// styled.d.ts
import "styled-components";
import { Theme } from "./lib/theme";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
```

3. **使用**:

```tsx
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary}; // 有类型提示
`;
```

### 10.3 Styled Components 的性能如何?

**问题**:Styled Components 会影响性能吗?

**回答**:

**性能影响**:

| 指标       | 影响      | 说明               |
| :--------- | :-------- | :----------------- |
| 包大小     | +16 KB    | 增加约 16 KB       |
| 首屏时间   | +50-100ms | 运行时处理样式     |
| 运行时开销 | 中等      | 每次渲染都需要处理 |
| 内存占用   | 中等      | 需要维护样式表     |

**优化建议**:

1. **避免在渲染函数中定义样式组件**
2. **使用 CSS 属性而不是内联样式**
3. **合理使用 shouldForwardProp**
4. **考虑使用零运行时方案**(Vanilla Extract)

### 10.4 如何从 Styled Components 迁移到其他方案?

**问题**:如何迁移到 CSS Modules 或 Tailwind CSS?

**回答**:

**迁移到 CSS Modules**:

之前:

```tsx
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
`;
```

之后:

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
}
```

```tsx
import styles from "./Button.module.css";

export function Button() {
  return <button className={styles.button}>按钮</button>;
}
```

**迁移到 Tailwind CSS**:

之前:

```tsx
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.25rem;
`;
```

之后:

```tsx
export function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded">按钮</button>
  );
}
```

### 10.5 如何处理样式优先级问题?

**问题**:Styled Components 的样式优先级如何控制?

**回答**:

**样式优先级规则**:

1. **后定义的样式优先级更高**
2. **使用 && 增加优先级**
3. **使用 !important(不推荐)**

```tsx
const Button = styled.button`
  background-color: blue;
`;

const PrimaryButton = styled(Button)`
  background-color: red; // 优先级更高
`;

// 使用 && 增加优先级
const ImportantButton = styled(Button)`
  && {
    background-color: green; // 优先级最高
  }
`;
```

---

## 11. 总结 (Summary)

### 11.1 核心要点

1. **Styled Components 是功能完整的 CSS-in-JS 库**
2. **Next.js 16 需要特殊的 SSR 配置**
3. **必须在客户端组件中使用**
4. **内置强大的主题系统**
5. **有一定的性能开销**

### 11.2 最佳实践

| 实践            | 说明                  |
| :-------------- | :-------------------- |
| 配置 Registry   | 避免样式闪烁          |
| 使用 $ 前缀     | 避免 props 传递到 DOM |
| 组件外定义样式  | 避免重复创建          |
| 使用主题系统    | 统一管理样式          |
| TypeScript 类型 | 提供类型安全          |

### 11.3 关键收获

1. **正确配置 SSR Registry 很重要**
2. **使用 TypeScript 提供更好的开发体验**
3. **主题系统非常强大**
4. **注意性能影响**
5. **适合中小型项目**

### 11.4 下一步建议

1. **评估项目需求**:确定是否适合使用 Styled Components
2. **配置开发环境**:安装插件,配置语法高亮
3. **建立主题系统**:统一管理设计 tokens
4. **性能监控**:关注性能影响
5. **考虑替代方案**:如果性能要求高,考虑 Vanilla Extract

Styled Components 是一个成熟的 CSS-in-JS 解决方案,适合需要完整 CSS 功能和强大主题系统的项目。在 Next.js 16 中使用时,需要正确配置 SSR Registry 以避免样式闪烁问题。### 4.2 TypeScript 类型定义

```typescript
// styled.d.ts
import "styled-components";
import { Theme } from "./lib/theme";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
```

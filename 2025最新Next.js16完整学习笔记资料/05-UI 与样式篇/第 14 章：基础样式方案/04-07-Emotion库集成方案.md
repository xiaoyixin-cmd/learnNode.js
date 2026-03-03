**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Emotion 库集成方案

## 1. 概述 (Overview)

Emotion 是一个高性能的 CSS-in-JS 库,相比 styled-components 更轻量,提供了更灵活的 API。在 Next.js 16 中,Emotion 可以通过编译器优化获得更好的性能。

### 1.1 Emotion 的核心特性

**灵活的 API**:

- styled API(类似 styled-components)
- css prop(更灵活的样式方式)
- 对象样式和字符串样式
- 组合样式

**性能优势**:

- 比 styled-components 轻量(约 11 KB)
- 更快的运行时性能
- 支持零运行时(使用 @emotion/css)
- 更好的缓存机制

**开发体验**:

- 优秀的 TypeScript 支持
- 源码映射
- 开发工具支持
- 灵活的配置

### 1.2 Next.js 16 中的支持

🆕 **Next.js 16 新特性**:

- 内置编译器支持
- 自动优化
- 更好的 SSR 集成
- Turbopack 加速

⚠️ **重要注意事项**:

- 需要配置编译器
- 使用 css prop 需要特殊配置
- 客户端组件中使用
- 注意样式注入顺序

### 1.3 Emotion vs Styled Components

| 特性            | Emotion | Styled Components |
| :-------------- | :------ | :---------------- |
| 包大小          | ~11 KB  | ~16 KB            |
| API 灵活性      | 高      | 中                |
| 性能            | 更好    | 好                |
| 学习曲线        | 中      | 低                |
| 社区规模        | 大      | 更大              |
| TypeScript 支持 | 优秀    | 优秀              |

---

## 2. 安装和配置 (Installation and Configuration)

### 2.1 安装依赖

```bash
npm install @emotion/react @emotion/styled
```

### 2.2 配置 Next.js

```javascript
// next.config.js
module.exports = {
  compiler: {
    emotion: true,
  },
};
```

### 2.3 配置 TypeScript(可选)

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsxImportSource": "@emotion/react"
  }
}
```

### 2.4 使用 css prop

如果要使用 css prop,需要在文件顶部添加:

```tsx
/** @jsxImportSource @emotion/react */
```

或者在 tsconfig.json 中全局配置:

```json
{
  "compilerOptions": {
    "jsxImportSource": "@emotion/react"
  }
}
```

---

## 3. styled API (Styled API)

### 3.1 基础用法

```tsx
"use client";

import styled from "@emotion/styled";

const Button = styled.button`
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
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function StyledButton() {
  return <Button>Emotion 按钮</Button>;
}
```

### 3.2 Props 驱动的样式

```tsx
"use client";

import styled from "@emotion/styled";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const Button = styled.button<ButtonProps>`
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
    switch (props.size) {
      case "small":
        return "0.375rem 0.75rem";
      case "large":
        return "0.75rem 1.5rem";
      default:
        return "0.5rem 1rem";
    }
  }};

  font-size: ${(props) => {
    switch (props.size) {
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
    switch (props.variant) {
      case "secondary":
        return "#e5e7eb";
      case "danger":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  }};

  color: ${(props) => (props.variant === "secondary" ? "#1f2937" : "white")};

  /* 全宽 */
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};

  &:hover {
    opacity: 0.9;
  }
`;

export function DynamicButton({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  children,
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant={variant} size={size} fullWidth={fullWidth} {...props}>
      {children}
    </Button>
  );
}
```

### 3.3 对象样式

```tsx
"use client";

import styled from "@emotion/styled";

interface CardProps {
  elevated?: boolean;
}

const Card = styled.div<CardProps>((props) => ({
  padding: "1.5rem",
  borderRadius: "0.5rem",
  backgroundColor: "white",
  boxShadow: props.elevated
    ? "0 10px 15px rgba(0, 0, 0, 0.1)"
    : "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },
}));
```

### 3.4 样式继承

```tsx
"use client";

import styled from "@emotion/styled";

const BaseButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

const SecondaryButton = styled(BaseButton)`
  background-color: #e5e7eb;
  color: #1f2937;

  &:hover {
    background-color: #d1d5db;
  }
`;
```

---

## 4. css prop (CSS Prop)

### 4.1 基础用法

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { css } from "@emotion/react";

export function CssPropExample() {
  return (
    <div
      css={css`
        padding: 1rem;
        background-color: #f3f4f6;
        border-radius: 0.5rem;
        transition: background-color 0.2s;

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

### 4.2 对象样式

```tsx
/** @jsxImportSource @emotion/react */
"use client";

export function ObjectStyleExample() {
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

### 4.3 组合样式

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { css } from "@emotion/react";

const baseStyles = css`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
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

export function ComposedStyles() {
  return (
    <div>
      <button css={[baseStyles, primaryStyles]}>主要按钮</button>
      <button css={[baseStyles, secondaryStyles]}>次要按钮</button>
    </div>
  );
}
```

### 4.4 动态样式

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { css } from "@emotion/react";

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

  const color = colorMap[type];

  return (
    <div
      css={css`
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: ${color}20;
        border-left: 4px solid ${color};
        color: ${color};
      `}
    >
      {message}
    </div>
  );
}
```

---

## 5. 主题系统 (Theme System)

### 5.1 定义主题

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
  },
};

export type Theme = typeof lightTheme;
```

### 5.2 TypeScript 类型定义

```typescript
// emotion.d.ts
import "@emotion/react";
import { Theme as CustomTheme } from "./lib/theme";

declare module "@emotion/react" {
  export interface Theme extends CustomTheme {}
}
```

### 5.3 使用 ThemeProvider

```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "@emotion/react";
import { lightTheme, darkTheme } from "../lib/theme";
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

### 5.4 在组件中使用主题

```tsx
"use client";

import styled from "@emotion/styled";

const ThemedButton = styled.button`
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: ${(props) => props.theme.shadows.sm};
  transition: all 0.2s;

  &:hover {
    box-shadow: ${(props) => props.theme.shadows.md};
    opacity: 0.9;
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

### 5.5 使用 useTheme Hook

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { useTheme } from "@emotion/react";
import { css } from "@emotion/react";

export function ThemedComponent() {
  const theme = useTheme();

  return (
    <div
      css={css`
        padding: ${theme.spacing.lg};
        background-color: ${theme.colors.surface};
        color: ${theme.colors.text};
        border-radius: ${theme.borderRadius.lg};
      `}
    >
      使用主题
    </div>
  );
}
```

---

## 6. 全局样式 (Global Styles)

### 6.1 创建全局样式

```tsx
// lib/globalStyles.tsx
"use client";

import { Global, css } from "@emotion/react";
import { Theme } from "./theme";

export function GlobalStyles() {
  return (
    <Global
      styles={(theme: Theme) => css`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          background-color: ${theme.colors.background};
          color: ${theme.colors.text};
          line-height: 1.6;
          transition: background-color 0.3s, color 0.3s;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: ${theme.spacing.md};
        }

        p {
          margin-bottom: ${theme.spacing.md};
        }

        a {
          color: ${theme.colors.primary};
          text-decoration: none;
          transition: color 0.2s;

          &:hover {
            color: ${theme.colors.secondary};
            text-decoration: underline;
          }
        }
      `}
    />
  );
}
```

### 6.2 在应用中使用

```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "@emotion/react";
import { GlobalStyles } from "../lib/globalStyles";
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

## 7. 响应式设计 (Responsive Design)

### 7.1 媒体查询

```tsx
"use client";

import styled from "@emotion/styled";

const Container = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem;
  }
`;
```

### 7.2 媒体查询辅助函数

```typescript
// lib/mediaQueries.ts
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const mq = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
};
```

```tsx
"use client";

import styled from "@emotion/styled";
import { mq } from "../lib/mediaQueries";

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  ${mq.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  ${mq.lg} {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`;
```

---

## 8. 动画 (Animations)

### 8.1 CSS 动画

```tsx
"use client";

import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

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
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
```

---

## 9. 性能优化 (Performance Optimization)

### 9.1 使用 css 函数缓存样式

```tsx
/** @jsxImportSource @emotion/react */
"use client";

import { css } from "@emotion/react";
import { useMemo } from "react";

export function OptimizedComponent({ color }: { color: string }) {
  const styles = useMemo(
    () => css`
      padding: 1rem;
      background-color: ${color};
      border-radius: 0.5rem;
    `,
    [color]
  );

  return <div css={styles}>优化的组件</div>;
}
```

### 9.2 避免在渲染函数中定义样式

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

---

## 10. 适用场景 (Applicable Scenarios)

### 10.1 适合使用 Emotion 的场景

- 需要灵活的样式方案
- 性能要求较高
- 需要 css prop 的便利性
- TypeScript 项目
- 中小型到大型项目
- 需要主题系统

### 10.2 不适合使用的场景

- 追求零运行时开销
- 团队不熟悉 CSS-in-JS
- 简单的静态网站
- 服务端组件为主的项目

---

## 11. 注意事项 (Precautions)

### 11.1 配置 jsxImportSource

使用 css prop 时需要配置:

```tsx
/** @jsxImportSource @emotion/react */
```

或在 tsconfig.json 中全局配置。

### 11.2 客户端组件

在 Next.js 16 App Router 中,Emotion 必须在客户端组件中使用:

```tsx
"use client";

import styled from "@emotion/styled";
```

### 11.3 避免样式闪烁

确保正确配置编译器:

```javascript
// next.config.js
module.exports = {
  compiler: {
    emotion: true,
  },
};
```

---

## 12. 常见问题 (FAQ)

### 12.1 Emotion 和 Styled Components 哪个更好?

**问题**:应该选择 Emotion 还是 Styled Components?

**回答**:

**选择 Emotion**:

- 需要更好的性能
- 需要 css prop 的灵活性
- 包大小敏感
- 需要更灵活的 API

**选择 Styled Components**:

- 团队更熟悉
- 社区资源更丰富
- 不在意额外的 5 KB

**性能对比**:

| 指标       | Emotion | Styled Components |
| :--------- | :------ | :---------------- |
| 包大小     | ~11 KB  | ~16 KB            |
| 运行时性能 | 更快    | 快                |
| API 灵活性 | 更高    | 高                |

### 12.2 如何在 Emotion 中使用 TypeScript?

**问题**:如何为主题添加 TypeScript 类型?

**回答**:

1. **定义主题类型**:

```typescript
// lib/theme.ts
export const lightTheme = {
  colors: {
    primary: "#3b82f6",
  },
};

export type Theme = typeof lightTheme;
```

2. **扩展 Emotion 类型**:

```typescript
// emotion.d.ts
import "@emotion/react";
import { Theme as CustomTheme } from "./lib/theme";

declare module "@emotion/react" {
  export interface Theme extends CustomTheme {}
}
```

3. **使用**:

```tsx
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary}; // 有类型提示
`;
```

### 12.3 css prop 和 styled API 哪个更好?

**问题**:应该使用 css prop 还是 styled API?

**回答**:

**css prop 优势**:

- 更灵活
- 可以直接在 JSX 中写样式
- 适合一次性样式
- 更容易组合

**styled API 优势**:

- 更好的语义化
- 更容易复用
- 更好的性能(样式被缓存)
- 更容易测试

**建议**:

- 复用的组件样式:使用 styled API
- 一次性样式:使用 css prop
- 动态样式:两者都可以,根据喜好选择

### 12.4 如何处理服务端渲染?

**问题**:Emotion 在 Next.js 16 中如何处理 SSR?

**回答**:

Next.js 16 内置了 Emotion 编译器支持,只需配置:

```javascript
// next.config.js
module.exports = {
  compiler: {
    emotion: true,
  },
};
```

这会自动处理:

- 样式提取
- 样式注入
- 避免样式闪烁
- 优化性能

不需要像 styled-components 那样配置 Registry。

### 12.5 如何迁移现有代码?

**问题**:如何从 styled-components 迁移到 Emotion?

**回答**:

**迁移步骤**:

1. **安装 Emotion**:

```bash
npm install @emotion/react @emotion/styled
npm uninstall styled-components
```

2. **更新导入**:

之前:

```tsx
import styled from "styled-components";
```

之后:

```tsx
import styled from "@emotion/styled";
```

3. **更新主题类型**:

之前:

```typescript
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
```

之后:

```typescript
import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme extends CustomTheme {}
}
```

4. **更新配置**:

```javascript
// next.config.js
module.exports = {
  compiler: {
    emotion: true, // 之前是 styledComponents: true
  },
};
```

大部分代码可以直接使用,只需要更新导入和配置。

---

## 13. 总结 (Summary)

### 13.1 核心要点

1. **Emotion 是高性能的 CSS-in-JS 库**
2. **比 styled-components 更轻量(约 11 KB)**
3. **提供 styled API 和 css prop 两种方式**
4. **Next.js 16 内置编译器支持**
5. **优秀的 TypeScript 支持**

### 13.2 最佳实践

| 实践            | 说明                    |
| :-------------- | :---------------------- |
| 配置编译器      | 启用 Next.js 编译器优化 |
| 使用 TypeScript | 提供类型安全            |
| 缓存样式        | 避免重复创建            |
| 组件外定义      | 避免在渲染函数中定义    |
| 合理选择 API    | styled API vs css prop  |

### 13.3 关键收获

1. **Emotion 性能优于 styled-components**
2. **css prop 提供更大的灵活性**
3. **Next.js 16 配置简单**
4. **TypeScript 支持优秀**
5. **适合各种规模的项目**

### 13.4 下一步建议

1. **评估项目需求**:确定是否适合使用 Emotion
2. **配置开发环境**:安装插件,配置编译器
3. **建立主题系统**:统一管理设计 tokens
4. **性能监控**:关注性能影响
5. **团队培训**:确保团队熟悉 Emotion

Emotion 是一个优秀的 CSS-in-JS 解决方案,相比 styled-components 更轻量、性能更好,同时提供了更灵活的 API。在 Next.js 16 中使用 Emotion 非常简单,只需配置编译器即可获得最佳性能。

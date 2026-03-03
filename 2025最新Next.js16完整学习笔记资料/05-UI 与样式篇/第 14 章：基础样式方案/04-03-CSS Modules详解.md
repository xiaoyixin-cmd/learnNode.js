**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# CSS Modules 详解

## 1. 概述 (Overview)

CSS Modules 是一种 CSS 文件的模块化方案，通过自动生成唯一的类名来实现样式的局部作用域。在 Next.js 16 中，CSS Modules 是内置支持的样式方案，无需额外配置即可使用。

### 1.1 CSS Modules 的核心特性

**局部作用域**：

- 每个 CSS 文件都是独立的模块
- 类名自动转换为唯一标识符
- 避免全局命名冲突
- 样式隔离，互不影响

**编译时处理**：

- 构建时生成唯一类名
- 零运行时开销
- 性能优秀
- 支持代码分割

**与 Next.js 的集成**：

- 开箱即用，无需配置
- 支持 TypeScript 类型定义
- 与服务端渲染完美配合
- 支持热模块替换

### 1.2 Next.js 16 中的 CSS Modules

🆕 **Next.js 16 新增特性**：

- 更快的编译速度（Turbopack 加速）
- 改进的类型推导
- 更好的错误提示
- 支持嵌套导入

⚡ **性能提升**：

- Turbopack 处理 CSS Modules 速度提升 10 倍
- 增量编译，只重新编译修改的文件
- 优化的 CSS 提取和压缩

### 1.3 为什么选择 CSS Modules

**适用场景**：

- 中小型项目
- 需要样式隔离的组件
- 传统 CSS 开发习惯的团队
- 需要精确控制样式的场景

**优势**：

- 学习成本低，就是普通 CSS
- 类型安全（配合 TypeScript）
- 性能优秀，零运行时
- 与现有 CSS 工具链兼容

---

## 2. 基础使用 (Basic Usage)

### 2.1 创建 CSS Module 文件

CSS Modules 文件使用 `.module.css` 或 `.module.scss` 扩展名：

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: all 0.2s;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #2563eb;
}

.secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}

.secondary:hover {
  background-color: #d1d5db;
}

.large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
```

### 2.2 在组件中使用

```tsx
// Button.tsx
import styles from "./Button.module.css";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "small" | "large";
  children: React.ReactNode;
}

export function Button({ variant = "primary", size, children }: ButtonProps) {
  // 组合多个类名
  const className = [styles.button, styles[variant], size && styles[size]]
    .filter(Boolean)
    .join(" ");

  return <button className={className}>{children}</button>;
}
```

### 2.3 类名组合

**使用数组和 filter**：

```tsx
import styles from "./Component.module.css";

export function Component({ active, disabled }: Props) {
  const className = [
    styles.base,
    active && styles.active,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>内容</div>;
}
```

**使用 clsx 库**：

```tsx
import clsx from "clsx";
import styles from "./Component.module.css";

export function Component({ active, disabled }: Props) {
  return (
    <div
      className={clsx(styles.base, {
        [styles.active]: active,
        [styles.disabled]: disabled,
      })}
    >
      内容
    </div>
  );
}
```

### 2.4 全局类名

在 CSS Modules 中使用全局类名：

```css
/* Component.module.css */
.container {
  padding: 1rem;
}

/* 使用 :global 声明全局类名 */
:global(.global-class) {
  color: red;
}

/* 在局部类名中使用全局类名 */
.container :global(.child) {
  margin: 0.5rem;
}
```

```tsx
import styles from "./Component.module.css";

export function Component() {
  return (
    <div className={styles.container}>
      <div className="global-class">全局样式</div>
      <div className="child">子元素</div>
    </div>
  );
}
```

---

## 3. 高级特性 (Advanced Features)

### 3.1 组合样式 (Composition)

CSS Modules 支持使用 `composes` 关键字组合样式：

```css
/* Button.module.css */
.base {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.primary {
  composes: base;
  background-color: #3b82f6;
  color: white;
}

.secondary {
  composes: base;
  background-color: #e5e7eb;
  color: #1f2937;
}

.large {
  composes: base;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}
```

```tsx
import styles from "./Button.module.css";

// 使用组合后的类名
export function Button({ variant }: { variant: "primary" | "secondary" }) {
  return <button className={styles[variant]}>按钮</button>;
}
```

### 3.2 从其他文件组合

```css
/* colors.module.css */
.blue {
  color: #3b82f6;
}

.red {
  color: #ef4444;
}
```

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.primary {
  composes: button;
  composes: blue from "./colors.module.css";
  background-color: #3b82f6;
}

.danger {
  composes: button;
  composes: red from "./colors.module.css";
  background-color: #ef4444;
}
```

### 3.3 使用 Sass/SCSS

Next.js 16 原生支持 Sass，可以在 CSS Modules 中使用 Sass 特性：

**安装 Sass**：

```bash
npm install -D sass
```

**使用 Sass 特性**：

```scss
// Button.module.scss
$primary-color: #3b82f6;
$secondary-color: #e5e7eb;
$border-radius: 0.25rem;

.button {
  padding: 0.5rem 1rem;
  border-radius: $border-radius;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.primary {
  @extend .button;
  background-color: $primary-color;
  color: white;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.secondary {
  @extend .button;
  background-color: $secondary-color;
  color: #1f2937;

  &:hover {
    background-color: darken($secondary-color, 5%);
  }
}

// 嵌套选择器
.card {
  padding: 1rem;
  border-radius: $border-radius;

  .header {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .body {
    color: #6b7280;
  }

  .footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
}
```

### 3.4 CSS 变量

在 CSS Modules 中使用 CSS 变量：

```css
/* theme.module.css */
.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

.dark {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}

.container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

```tsx
"use client";

import { useState } from "react";
import styles from "./theme.module.css";

export function ThemedComponent() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? styles.dark : styles.light}>
      <div className={styles.container}>
        <p>主题化内容</p>
        <button onClick={() => setIsDark(!isDark)}>切换主题</button>
      </div>
    </div>
  );
}
```

### 3.5 媒体查询

```css
/* Responsive.module.css */
.container {
  padding: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

### 3.6 动画和过渡

```css
/* Animation.module.css */
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.spinner {
  animation: spin 1s linear infinite;
}

.transition {
  transition: all 0.3s ease;
}

.transition:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

---

## 4. TypeScript 集成 (TypeScript Integration)

### 4.1 类型定义

为 CSS Modules 添加类型定义：

```typescript
// global.d.ts
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}
```

### 4.2 生成类型文件

使用 `typescript-plugin-css-modules` 插件自动生成类型：

```bash
npm install -D typescript-plugin-css-modules
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "typescript-plugin-css-modules"
      }
    ]
  }
}
```

这样会自动生成 `.d.ts` 文件：

```typescript
// Button.module.css.d.ts
declare const styles: {
  readonly button: string;
  readonly primary: string;
  readonly secondary: string;
  readonly large: string;
  readonly small: string;
};
export default styles;
```

### 4.3 类型安全的使用

```tsx
import styles from "./Button.module.css";

// TypeScript 会提供自动补全和类型检查
export function Button() {
  return (
    <button className={styles.button}>
      {/* styles.button 有类型提示 */}
      {/* styles.nonExistent 会报错 */}
      按钮
    </button>
  );
}
```

---

## 5. 性能优化 (Performance Optimization)

### 5.1 代码分割

CSS Modules 会自动进行代码分割，每个页面只加载需要的 CSS：

```tsx
// app/page.tsx
import styles from "./page.module.css";

export default function Page() {
  return <div className={styles.container}>首页</div>;
}

// app/about/page.tsx
import styles from "./page.module.css";

export default function AboutPage() {
  return <div className={styles.container}>关于页面</div>;
}
```

每个页面的 CSS 会被单独提取和加载。

### 5.2 CSS 压缩

Next.js 16 自动压缩 CSS：

```javascript
// next.config.js
module.exports = {
  // 启用 CSS 优化
  experimental: {
    optimizeCss: true, // 使用 Lightning CSS
  },
};
```

### 5.3 关键 CSS 提取

Next.js 自动提取关键 CSS 并内联到 HTML 中：

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>{/* Next.js 自动内联关键 CSS */}</head>
      <body>{children}</body>
    </html>
  );
}
```

### 5.4 避免样式重复

使用 `composes` 而不是复制粘贴样式：

```css
/* ❌ 不好：重复的样式 */
.button1 {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  background-color: blue;
}

.button2 {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  background-color: red;
}

/* ✅ 好：使用 composes */
.baseButton {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.blueButton {
  composes: baseButton;
  background-color: blue;
}

.redButton {
  composes: baseButton;
  background-color: red;
}
```

---

## 6. 实战案例 (Practical Examples)

### 6.1 构建卡片组件

```css
/* Card.module.css */
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.body {
  padding: 1.5rem;
}

.footer {
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.primaryButton {
  composes: button;
  background-color: #3b82f6;
  color: white;
}

.primaryButton:hover {
  background-color: #2563eb;
}

.secondaryButton {
  composes: button;
  background-color: #e5e7eb;
  color: #1f2937;
}

.secondaryButton:hover {
  background-color: #d1d5db;
}
```

```tsx
// Card.tsx
import styles from "./Card.module.css";

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
}

export function Card({
  title,
  subtitle,
  children,
  onSave,
  onCancel,
}: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.body}>{children}</div>

      {(onSave || onCancel) && (
        <div className={styles.footer}>
          {onCancel && (
            <button className={styles.secondaryButton} onClick={onCancel}>
              取消
            </button>
          )}
          {onSave && (
            <button className={styles.primaryButton} onClick={onSave}>
              保存
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 6.2 构建表单组件

```css
/* Form.module.css */
.form {
  max-width: 32rem;
  margin: 0 auto;
}

.formGroup {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required::after {
  content: " *";
  color: #ef4444;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.error {
  composes: input;
  border-color: #ef4444;
}

.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.errorMessage {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.textarea {
  composes: input;
  min-height: 6rem;
  resize: vertical;
}

.select {
  composes: input;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.submitButton {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submitButton:hover {
  background-color: #2563eb;
}

.submitButton:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
```

```tsx
// Form.tsx
"use client";

import { useState } from "react";
import styles from "./Form.module.css";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    subscribe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入姓名";
    }

    if (!formData.email.trim()) {
      newErrors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!formData.message.trim()) {
      newErrors.message = "请输入消息内容";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 提交表单逻辑
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("表单提交:", formData);

      // 重置表单
      setFormData({ name: "", email: "", message: "", subscribe: false });
      setErrors({});
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={`${styles.label} ${styles.required}`}>
          姓名
        </label>
        <input
          type="text"
          id="name"
          className={errors.name ? styles.error : styles.input}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={`${styles.label} ${styles.required}`}>
          邮箱
        </label>
        <input
          type="email"
          id="email"
          className={errors.email ? styles.error : styles.input}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
      </div>

      <div className={styles.formGroup}>
        <label
          htmlFor="message"
          className={`${styles.label} ${styles.required}`}
        >
          消息
        </label>
        <textarea
          id="message"
          className={errors.message ? styles.error : styles.textarea}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
        {errors.message && (
          <p className={styles.errorMessage}>{errors.message}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={formData.subscribe}
            onChange={(e) =>
              setFormData({ ...formData, subscribe: e.target.checked })
            }
          />
          订阅新闻通讯
        </label>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

### 6.3 构建导航栏

```css
/* Navbar.module.css */
.navbar {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}

.nav {
  display: none;
}

@media (min-width: 768px) {
  .nav {
    display: flex;
    gap: 2rem;
  }
}

.navLink {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.navLink:hover {
  color: #3b82f6;
}

.navLinkActive {
  composes: navLink;
  color: #3b82f6;
}

.mobileMenuButton {
  display: block;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

@media (min-width: 768px) {
  .mobileMenuButton {
    display: none;
  }
}

.mobileMenu {
  display: block;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

@media (min-width: 768px) {
  .mobileMenu {
    display: none;
  }
}

.mobileNavLink {
  display: block;
  padding: 0.75rem 1rem;
  color: #4b5563;
  text-decoration: none;
  transition: background-color 0.2s;
}

.mobileNavLink:hover {
  background-color: #f3f4f6;
}
```

```tsx
// Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            Logo
          </Link>

          <div className={styles.nav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href ? styles.navLinkActive : styles.navLink
                }
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

## 7. 适用场景 (Applicable Scenarios)

### 7.1 中小型项目

CSS Modules 非常适合中小型项目，因为：

- 学习成本低，团队容易上手
- 无需额外配置，开箱即用
- 性能优秀，零运行时开销
- 与传统 CSS 工作流程一致

### 7.2 组件库开发

开发可复用的组件库时，CSS Modules 提供：

- 样式隔离，避免冲突
- 类型安全（配合 TypeScript）
- 易于维护和测试
- 支持样式组合

### 7.3 传统团队迁移

对于习惯传统 CSS 的团队：

- 无需学习新的 CSS 语法
- 可以继续使用 Sass/SCSS
- 渐进式采用，风险低
- 与现有工具链兼容

### 7.4 需要精确控制样式的场景

当需要精确控制每个像素时：

- 完全的 CSS 控制权
- 支持所有 CSS 特性
- 易于调试和优化
- 可以使用 CSS 预处理器

---

## 8. 注意事项 (Precautions)

### 8.1 类名命名规范

虽然 CSS Modules 会自动生成唯一类名，但仍需要良好的命名：

```css
/* ❌ 不好：类名不清晰 */
.a {
}
.b {
}
.c {
}

/* ✅ 好：语义化的类名 */
.container {
}
.header {
}
.title {
}
.button {
}
```

### 8.2 避免过度嵌套

```css
/* ❌ 不好：过度嵌套 */
.container .header .title .text .span {
  color: red;
}

/* ✅ 好：扁平化结构 */
.headerTitle {
  color: red;
}
```

### 8.3 全局样式的使用

谨慎使用 `:global`：

```css
/* ❌ 不好：滥用全局样式 */
:global(.everything) {
  /* 大量全局样式 */
}

/* ✅ 好：只在必要时使用 */
.container :global(.third-party-class) {
  /* 针对第三方库的样式 */
}
```

### 8.4 性能考虑

避免在运行时动态生成类名：

```tsx
// ❌ 不好：运行时字符串拼接
<div className={styles['button-' + variant]}>

// ✅ 好：使用对象映射
const variantClasses = {
  primary: styles.primary,
  secondary: styles.secondary,
};
<div className={variantClasses[variant]}>
```

---

## 9. 常见问题 (FAQ)

### 9.1 如何在 CSS Modules 中使用全局样式？

**问题**：需要定义全局样式怎么办？

**回答**：

使用 `:global` 语法：

```css
/* styles.module.css */
:global(.global-class) {
  color: red;
}

/* 或者在局部类中使用全局类 */
.container :global(.child) {
  margin: 0.5rem;
}
```

或者使用单独的全局 CSS 文件：

```css
/* globals.css */
.global-class {
  color: red;
}
```

```tsx
// app/layout.tsx
import "./globals.css";
```

### 9.2 CSS Modules 和 Tailwind CSS 可以一起使用吗？

**问题**：能否混用 CSS Modules 和 Tailwind CSS？

**回答**：

可以，它们可以很好地配合：

```tsx
import styles from "./Component.module.css";

export function Component() {
  return (
    <div className={`${styles.container} p-4 rounded-lg`}>
      {/* CSS Modules + Tailwind */}
    </div>
  );
}
```

**建议**：

- 主要使用一种方案
- 复杂样式用 CSS Modules
- 简单样式用 Tailwind

### 9.3 如何调试 CSS Modules 生成的类名？

**问题**：生成的类名很难调试。

**回答**：

开发环境下，Next.js 会生成可读的类名：

```html
<!-- 开发环境 -->
<div class="Button_button__abc123">
  <!-- 生产环境 -->
  <div class="Button_a1b2c3"></div>
</div>
```

使用浏览器开发工具查看实际类名，或者在代码中打印：

```tsx
console.log(styles.button); // "Button_button__abc123"
```

### 9.4 如何在 CSS Modules 中使用 CSS 变量？

**问题**：如何实现主题切换？

**回答**：

使用 CSS 变量：

```css
/* theme.module.css */
.light {
  --bg: white;
  --text: black;
}

.dark {
  --bg: black;
  --text: white;
}

.container {
  background-color: var(--bg);
  color: var(--text);
}
```

```tsx
"use client";

import { useState } from "react";
import styles from "./theme.module.css";

export function ThemedComponent() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? styles.dark : styles.light}>
      <div className={styles.container}>内容</div>
    </div>
  );
}
```

### 9.5 CSS Modules 的性能如何？

**问题**：CSS Modules 会影响性能吗？

**回答**：

CSS Modules 性能非常好：

| 特性       | 说明                               |
| :--------- | :--------------------------------- |
| 运行时开销 | 零运行时，所有处理在构建时完成     |
| 文件大小   | 自动代码分割，只加载需要的 CSS     |
| 加载速度   | 关键 CSS 内联，非关键 CSS 延迟加载 |
| 缓存       | CSS 文件带哈希，可以长期缓存       |

**性能对比**：

| 方案         | 运行时开销 | 构建时间 | 文件大小 |
| :----------- | :--------- | :------- | :------- |
| CSS Modules  | 无         | 快       | 小       |
| CSS-in-JS    | 有         | 中等     | 中等     |
| Tailwind CSS | 无         | 快       | 小       |

---

## 10. 总结 (Summary)

### 10.1 核心要点

**CSS Modules 的优势**：

1. **局部作用域**：自动生成唯一类名，避免冲突
2. **零运行时**：所有处理在构建时完成，性能优秀
3. **类型安全**：配合 TypeScript 提供类型检查
4. **易于学习**：就是普通 CSS，学习成本低
5. **工具链兼容**：支持 Sass、PostCSS 等工具

**Next.js 16 的增强**：

1. **Turbopack 加速**：编译速度提升 10 倍
2. **自动优化**：CSS 压缩、代码分割、关键 CSS 提取
3. **开箱即用**：无需配置即可使用
4. **完美集成**：与 SSR、RSC 无缝配合

### 10.2 最佳实践总结

| 场景     | 推荐做法             | 避免做法       |
| :------- | :------------------- | :------------- |
| 样式复用 | 使用 composes        | 复制粘贴样式   |
| 类名组合 | 使用 clsx 库         | 手动字符串拼接 |
| 全局样式 | 单独的全局 CSS 文件  | 滥用 :global   |
| 主题切换 | 使用 CSS 变量        | 动态生成样式   |
| 类型安全 | 配置 TypeScript 插件 | 忽略类型检查   |

### 10.3 关键收获

1. **CSS Modules 是 Next.js 的默认样式方案**，适合大多数项目
2. **学习成本低**，团队容易上手
3. **性能优秀**，零运行时开销
4. **类型安全**，配合 TypeScript 更强大
5. **灵活性高**，可以与其他方案混用

### 10.4 下一步建议

1. **实践项目**：用 CSS Modules 构建一个完整组件
2. **学习 Sass**：掌握 Sass 的高级特性
3. **配置 TypeScript**：启用类型检查和自动补全
4. **性能优化**：学习如何优化 CSS 加载
5. **混合使用**：尝试与 Tailwind CSS 配合使用

CSS Modules 在 Next.js 16 中是一个成熟、稳定的样式方案。它提供了样式隔离、类型安全和优秀的性能，同时保持了传统 CSS 的简单性。对于大多数项目来说，CSS Modules 是一个可靠的选择。

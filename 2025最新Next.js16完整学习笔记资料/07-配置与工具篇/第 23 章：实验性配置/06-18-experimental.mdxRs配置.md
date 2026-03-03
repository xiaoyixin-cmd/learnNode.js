**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# experimental.mdxRs 配置

## 概述

experimental.mdxRs 是 Next.js 16 中用于启用基于 Rust 的 MDX 编译器的实验性配置选项。通过使用 Rust 实现的 MDX 编译器，可以显著提升 MDX 文件的编译速度和性能。

### mdxRs 的作用

1. **提升性能**：Rust 编译器比 JavaScript 快 10-20 倍
2. **降低内存**：更少的内存占用
3. **快速构建**：加速开发和生产构建
4. **兼容性好**：完全兼容 MDX 语法
5. **未来趋势**：Next.js 未来的默认选项

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    mdxRs: true,
  },
};
```

### 安装依赖

```bash
npm install @next/mdx
```

### 配置 MDX

```javascript
// next.config.js
const withMDX = require("@next/mdx")();

module.exports = withMDX({
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
```

### 创建 MDX 文件

```mdx
// app/blog/post.mdx

# Hello World

This is my first MDX post!

export const metadata = {
  title: "My First Post",
  date: "2024-01-01",
};

<CustomComponent />
```

### 使用 MDX 组件

```tsx
// app/blog/page.tsx
import Post from "./post.mdx";

export default function BlogPage() {
  return (
    <div>
      <Post />
    </div>
  );
}
```

## 高级配置

### 自定义 MDX 组件

```tsx
// components/mdx-components.tsx
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-4xl font-bold">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold">{children}</h2>,
    p: ({ children }) => <p className="my-4">{children}</p>,
    code: ({ children }) => (
      <code className="bg-gray-100 px-2 py-1 rounded">{children}</code>
    ),
    ...components,
  };
}
```

### 配置 MDX 选项

```javascript
// next.config.js
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: "@mdx-js/react",
  },
});

module.exports = withMDX({
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
```

### 使用 remark 插件

```javascript
// next.config.js
const remarkGfm = require("remark-gfm");
const remarkMath = require("remark-math");

const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
  },
});

module.exports = withMDX({
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
```

### 使用 rehype 插件

```javascript
// next.config.js
const rehypeHighlight = require("rehype-highlight");
const rehypeSlug = require("rehype-slug");

const withMDX = require("@next/mdx")({
  options: {
    rehypePlugins: [rehypeHighlight, rehypeSlug],
  },
});

module.exports = withMDX({
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
```

### 动态导入 MDX

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPost({ params }) {
  let MDXContent;

  try {
    MDXContent = (await import(`../${params.slug}.mdx`)).default;
  } catch {
    notFound();
  }

  return (
    <article>
      <MDXContent />
    </article>
  );
}
```

### MDX 布局

```tsx
// app/blog/layout.tsx
export default function BlogLayout({ children }) {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <header>
        <h1>My Blog</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>© 2024</p>
      </footer>
    </div>
  );
}
```

### 自定义 MDX 提供者

```tsx
// app/mdx-provider.tsx
"use client";

import { MDXProvider } from "@mdx-js/react";

const components = {
  h1: (props) => <h1 className="text-4xl" {...props} />,
  h2: (props) => <h2 className="text-3xl" {...props} />,
};

export function CustomMDXProvider({ children }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
```

## 实战案例

### 案例 1：博客系统

````mdx
## // app/blog/first-post.mdx

title: 'My First Blog Post'
date: '2024-01-01'
author: 'John Doe'
tags: ['nextjs', 'mdx']

---

# {frontmatter.title}

Published on {frontmatter.date} by {frontmatter.author}

This is my first blog post using MDX!

## Features

- **Fast**: Built with Next.js
- **Flexible**: Write JSX in Markdown
- **Powerful**: Use React components

<BlogImage src="/images/hero.jpg" alt="Hero" />

## Code Example

```javascript
function hello() {
  console.log("Hello, MDX!");
}
```
````

<Newsletter />
```

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

export default async function BlogPost({ params }) {
  let content;

  try {
    content = await import(`../${params.slug}.mdx`);
  } catch {
    notFound();
  }

  return (
    <article className="prose lg:prose-xl">
      <content.default />
    </article>
  );
}
```

### 案例 2：文档网站

````mdx
// app/docs/getting-started.mdx

# Getting Started

Welcome to our documentation!

<Callout type="info">This is an important note.</Callout>

## Installation

```bash
npm install my-package
```
````

## Quick Start

<Steps>
  <Step>Install the package</Step>
  <Step>Configure your app</Step>
  <Step>Start building</Step>
</Steps>

<CodeTabs>
  <Tab label="JavaScript">
    ```javascript
    const app = require('my-package')
    ```
  </Tab>
  <Tab label="TypeScript">
    ```typescript
    import app from 'my-package'
    ```
  </Tab>
</CodeTabs>
```

```tsx
// components/Callout.tsx
export function Callout({ type, children }) {
  const styles = {
    info: "bg-blue-100 border-blue-500",
    warning: "bg-yellow-100 border-yellow-500",
    error: "bg-red-100 border-red-500",
  };

  return <div className={`border-l-4 p-4 ${styles[type]}`}>{children}</div>;
}
```

### 案例 3：产品页面

```mdx
// app/products/product-a.mdx
import { ProductCard } from '@/components/ProductCard'
import { PriceTag } from '@/components/PriceTag'

# Product A

<ProductCard
  image="/products/a.jpg"
  title="Product A"
  description="Amazing product"
/>

## Features

- Feature 1
- Feature 2
- Feature 3

<PriceTag price={99.99} currency="USD" />

## Specifications

| Spec   | Value   |
| ------ | ------- |
| Weight | 1kg     |
| Size   | 10x10cm |
| Color  | Blue    |

<BuyButton productId="product-a" />
```

### 案例 4：交互式教程

````mdx
// app/tutorials/react-basics.mdx

# React Basics Tutorial

Learn React step by step!

## Step 1: Components

<InteractiveCode>
  ```jsx
  function Welcome() {
    return <h1>Hello, World!</h1>
  }
````

</InteractiveCode>

<Quiz>
  <Question>What is a component?</Question>
  <Answer correct>A reusable piece of UI</Answer>
  <Answer>A CSS class</Answer>
  <Answer>A database table</Answer>
</Quiz>

## Step 2: Props

<LiveEditor>
  ```jsx
  function Greeting({ name }) {
    return <h1>Hello, {name}!</h1>
  }
  ```
</LiveEditor>

<Progress current={2} total={5} />
```

## 适用场景

| 场景     | 是否使用 mdxRs | 原因          |
| -------- | -------------- | ------------- |
| 博客网站 | 是             | 提升编译速度  |
| 文档网站 | 是             | 大量 MDX 文件 |
| 产品页面 | 是             | 混合内容      |
| 营销页面 | 是             | 动态组件      |
| 简单网站 | 否             | 不需要 MDX    |
| 纯静态   | 否             | 使用 Markdown |

## 注意事项

### 1. 兼容性检查

```javascript
// next.config.js
module.exports = {
  experimental: {
    mdxRs: true, // 确保Next.js版本支持
  },
};
```

### 2. 插件兼容性

```javascript
// 某些插件可能不兼容mdxRs
const withMDX = require("@next/mdx")({
  options: {
    // 测试插件是否工作
    remarkPlugins: [remarkGfm],
  },
});

module.exports = withMDX({
  experimental: {
    mdxRs: true,
  },
});
```

### 3. 性能监控

```javascript
// 监控编译时间
console.time("MDX Compilation");
// 编译MDX
console.timeEnd("MDX Compilation");
```

### 4. 错误处理

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  try {
    const MDXContent = (await import(`../${params.slug}.mdx`)).default;
    return <MDXContent />;
  } catch (error) {
    console.error("Failed to load MDX:", error);
    return <div>Post not found</div>;
  }
}
```

### 5. 类型安全

```typescript
// types/mdx.d.ts
declare module "*.mdx" {
  import { MDXProps } from "mdx/types";

  export default function MDXContent(props: MDXProps): JSX.Element;
  export const frontmatter: {
    title: string;
    date: string;
    author: string;
  };
}
```

## 常见问题

### 1. mdxRs 不生效？

**问题**：启用后没有性能提升

**解决方案**：

```bash
# 清除缓存重新构建
rm -rf .next
npm run build
```

### 2. 插件不兼容？

**问题**：某些 remark/rehype 插件报错

**解决方案**：

```javascript
// 暂时禁用mdxRs
module.exports = {
  experimental: {
    mdxRs: false,
  },
};
```

### 3. 如何导入 MDX？

**问题**：不知道如何正确导入

**解决方案**：

```tsx
// 静态导入
import Post from "./post.mdx";

// 动态导入
const Post = (await import("./post.mdx")).default;
```

### 4. 如何传递 props？

**问题**：需要向 MDX 传递数据

**解决方案**：

```tsx
import Post from "./post.mdx";

export default function Page() {
  return <Post name="John" age={30} />;
}
```

### 5. 如何使用 frontmatter？

**问题**：需要访问元数据

**解决方案**：

```mdx
---
title: "My Post"
date: "2024-01-01"
---

# {frontmatter.title}
```

### 6. 如何自定义组件？

**问题**：需要覆盖默认组件

**解决方案**：

```tsx
// mdx-components.tsx
export function useMDXComponents(components) {
  return {
    h1: (props) => <h1 className="custom" {...props} />,
    ...components,
  };
}
```

### 7. 如何添加语法高亮？

**问题**：代码块需要高亮

**解决方案**：

```javascript
const rehypeHighlight = require("rehype-highlight");

const withMDX = require("@next/mdx")({
  options: {
    rehypePlugins: [rehypeHighlight],
  },
});
```

### 8. 如何生成目录？

**问题**：需要自动生成 TOC

**解决方案**：

```javascript
const rehypeSlug = require("rehype-slug");
const rehypeToc = require("rehype-toc");

const withMDX = require("@next/mdx")({
  options: {
    rehypePlugins: [rehypeSlug, rehypeToc],
  },
});
```

### 9. 如何处理图片？

**问题**：MDX 中的图片路径

**解决方案**：

```mdx
import Image from "next/image";

<Image src="/images/hero.jpg" alt="Hero" width={800} height={600} />
```

### 10. 如何添加数学公式？

**问题**：需要渲染 LaTeX

**解决方案**：

```javascript
const remarkMath = require("remark-math");
const rehypeKatex = require("rehype-katex");

const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```

### 11. 如何优化性能？

**问题**：MDX 编译慢

**解决方案**：

```javascript
// 启用mdxRs
module.exports = {
  experimental: {
    mdxRs: true, // 使用Rust编译器
  },
};
```

### 12. 如何处理大文件？

**问题**：MDX 文件过大

**解决方案**：

```tsx
// 使用动态导入
const Post = dynamic(() => import("./large-post.mdx"));
```

### 13. 如何添加元数据？

**问题**：需要 SEO 优化

**解决方案**：

```tsx
export const metadata = {
  title: "My Post",
  description: "Post description",
};

export default function Page() {
  return <Post />;
}
```

### 14. 如何测试 MDX？

**问题**：需要测试 MDX 组件

**解决方案**：

```tsx
import { render } from "@testing-library/react";
import Post from "./post.mdx";

test("renders post", () => {
  const { getByText } = render(<Post />);
  expect(getByText("Hello")).toBeInTheDocument();
});
```

### 15. 如何迁移到 mdxRs？

**问题**：从旧版本迁移

**解决方案**：

```javascript
// 1. 更新依赖
npm install @next/mdx@latest

// 2. 启用mdxRs
module.exports = {
  experimental: {
    mdxRs: true,
  },
}

// 3. 测试所有MDX文件
npm run build
```

### 16. 如何处理 MDX 中的图片?

**问题**: MDX 文件中的图片优化

**解决方案**:

```mdx
import Image from "next/image";
import myImage from "./my-image.jpg";

# 我的文章

<Image src={myImage} alt="描述" width={800} height={600} />

或者使用 URL:

<Image src="/images/photo.jpg" alt="描述" width={800} height={600} />
```

### 17. 如何实现 MDX 代码高亮?

**问题**: 在 MDX 中实现语法高亮

**解决方案**:

```javascript
// next.config.js
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      require("rehype-highlight"), // 代码高亮
      require("rehype-slug"), // 标题ID
      require("rehype-autolink-headings"), // 标题链接
    ],
  },
  experimental: {
    mdxRs: true,
  },
});
```

```bash
# 安装依赖
npm install rehype-highlight rehype-slug rehype-autolink-headings
```

### 18. 如何在 MDX 中使用布局?

**问题**: 为 MDX 页面添加统一布局

**解决方案**:

```tsx
// components/MDXLayout.tsx
export default function MDXLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mdx-layout">
      <aside className="toc">目录</aside>
      <main className="content">{children}</main>
    </div>
  );
}
```

```mdx
// app/blog/post.mdx
import MDXLayout from '@/components/MDXLayout';

export default function Layout({ children }) {
  return <MDXLayout>{children}</MDXLayout>;
}

# 文章标题

内容...
```

### 19. 如何处理 MDX 中的元数据?

**问题**: 提取和使用 MDX 文件的元数据

**解决方案**:

```javascript
// lib/mdx.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function getMDXData(slug: string) {
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data,
    content,
  };
}
```

```mdx
---
title: "我的文章"
date: "2024-01-01"
author: "张三"
tags: ["Next.js", "MDX"]
---

# {frontmatter.title}

作者: {frontmatter.author}
```

### 20. 如何实现 MDX 搜索功能?

**问题**: 在 MDX 内容中实现搜索

**解决方案**:

```typescript
// lib/search.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function searchMDX(query: string) {
  const contentDir = path.join(process.cwd(), "content");
  const files = fs.readdirSync(contentDir);

  const results = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);

      if (content.toLowerCase().includes(query.toLowerCase())) {
        return {
          slug: file.replace(".mdx", ""),
          title: data.title,
          excerpt: content.substring(0, 200),
        };
      }
      return null;
    })
    .filter(Boolean);

  return results;
}
```

### 21. 如何优化大型 MDX 文件?

**问题**: 大型 MDX 文件加载慢

**解决方案**:

```tsx
// 使用动态导入和Suspense
import { Suspense } from "react";
import dynamic from "next/dynamic";

const LargeMDX = dynamic(() => import("./large-content.mdx"), {
  loading: () => <div>加载中...</div>,
});

export default function Page() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LargeMDX />
    </Suspense>
  );
}
```

### 22. 如何在 MDX 中使用交互组件?

**问题**: 在 MDX 中嵌入交互式组件

**解决方案**:

```tsx
// components/InteractiveDemo.tsx
"use client";

import { useState } from "react";

export function InteractiveDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="demo">
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

```mdx
import { InteractiveDemo } from "@/components/InteractiveDemo";

# 交互式教程

这是一个计数器示例:

<InteractiveDemo />
```

### 23. 如何处理 MDX 编译错误?

**问题**: MDX 编译时出错

**解决方案**:

```javascript
// next.config.js
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    // 启用详细错误信息
    development: process.env.NODE_ENV === "development",
  },
  experimental: {
    mdxRs: true,
  },
});

module.exports = withMDX({
  // 其他配置
  webpack: (config, { dev }) => {
    if (dev) {
      // 开发环境显示详细错误
      config.stats = "verbose";
    }
    return config;
  },
});
```

### 24. 如何实现 MDX 内容的版本控制?

**问题**: 管理 MDX 内容的不同版本

**解决方案**:

```typescript
// lib/versions.ts
export function getMDXVersion(slug: string, version: string = "latest") {
  const versionPath =
    version === "latest"
      ? `content/${slug}.mdx`
      : `content/versions/${version}/${slug}.mdx`;

  return fs.readFileSync(versionPath, "utf8");
}
```

### 25. 如何实现 MDX 的国际化?

**问题**: 多语言 MDX 内容

**解决方案**:

```typescript
// lib/i18n-mdx.ts
export function getMDXByLocale(slug: string, locale: string = "zh") {
  const filePath = `content/${locale}/${slug}.mdx`;

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }

  // 降级到默认语言
  return fs.readFileSync(`content/zh/${slug}.mdx`, "utf8");
}
```

```
content/
  zh/
    post.mdx
  en/
    post.mdx
```

## 最佳实践

### 1. 性能优化

```javascript
// 使用mdxRs提升性能
module.exports = {
  experimental: {
    mdxRs: true,
  },
};
```

### 2. 类型安全

```typescript
// 为MDX组件添加类型
declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
```

### 3. 代码组织

```
app/
  blog/
    [slug]/
      page.tsx
content/
  blog/
    post-1.mdx
    post-2.mdx
components/
  mdx/
    CustomComponents.tsx
```

## 总结

experimental.mdxRs 配置为 Next.js 带来了显著的性能提升。使用 Rust 编译器可以：

1. **提升速度**：编译速度提升 10-20 倍
2. **降低内存**：更少的内存占用
3. **改善体验**：更快的开发反馈
4. **保持兼容**：完全兼容 MDX 语法
5. **面向未来**：Next.js 的发展方向

关键要点：

- 启用 mdxRs 提升性能
- 配置 MDX 选项
- 使用 remark/rehype 插件
- 自定义 MDX 组件
- 处理 frontmatter
- 动态导入 MDX
- 添加类型定义
- 优化大文件
- 测试兼容性
- 监控性能

记住：mdxRs 是实验性功能，可能存在兼容性问题。在生产环境使用前，需要充分测试所有 MDX 文件和插件。对于大型项目，性能提升会非常明显。

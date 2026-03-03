**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# generateStaticParams 函数详解

## 1. 概述

`generateStaticParams` 是 Next.js 16 App Router 中用于静态生成动态路由的关键函数。它替代了 Pages Router 中的 `getStaticPaths`,提供了更简洁、更强大的 API 来预生成动态路由页面。

### 1.1 概念定义

`generateStaticParams` 是一个异步函数,在构建时执行,用于生成动态路由段的参数列表。Next.js 会根据返回的参数列表,在构建时预渲染对应的页面。

**关键特征**:

- **构建时执行**: 只在 `next build` 时运行,不在运行时执行
- **返回参数数组**: 返回包含路由参数的对象数组
- **支持嵌套路由**: 可以在多层动态路由中使用
- **自动类型推断**: TypeScript 会自动推断参数类型
- **增量静态再生成**: 配合 `dynamicParams` 实现 ISR

**基本语法**:

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  return [
    { slug: "first-post" },
    { slug: "second-post" },
    { slug: "third-post" },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>Post: {slug}</div>;
}
```

### 1.2 核心价值

**提升性能**:

预生成的静态页面可以直接从 CDN 提供,无需服务端渲染,响应速度极快。对于博客、文档、产品目录等内容,这是最佳的性能优化方案。

**改善 SEO**:

静态生成的页面包含完整的 HTML 内容,搜索引擎爬虫可以直接索引,无需执行 JavaScript。这对 SEO 至关重要。

**降低服务器负载**:

静态页面不需要服务器实时渲染,大大降低了服务器的计算负担和成本。即使流量激增,静态页面也能轻松应对。

**简化 API**:

相比 Pages Router 的 `getStaticPaths`,`generateStaticParams` 的 API 更简洁,不需要返回 `fallback` 等配置,这些通过路由段配置来控制。

### 1.3 与 Pages Router 的对比

| 特性          | Pages Router           | App Router                |
| :------------ | :--------------------- | :------------------------ |
| 函数名        | `getStaticPaths`       | `generateStaticParams`    |
| 返回格式      | `{ paths, fallback }`  | 参数对象数组              |
| fallback 控制 | 在函数中返回           | 通过 `dynamicParams` 配置 |
| 嵌套路由      | 需要手动组合           | 自动组合                  |
| 类型安全      | 需要手动定义           | 自动推断                  |
| 数据获取      | 在 `getStaticProps` 中 | 直接在组件中              |

**迁移示例**:

```tsx
// Pages Router (pages/blog/[slug].tsx)
export async function getStaticPaths() {
  const posts = await getPosts();
  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}

export default function Post({ post }) {
  return <div>{post.title}</div>;
}
```

```tsx
// App Router (app/blog/[slug]/page.tsx)
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <div>{post.title}</div>;
}
```

---

## 2. 核心概念与原理

### 2.1 函数签名

```tsx
export async function generateStaticParams(): Promise<Params[]>;
```

**返回值**:

返回一个对象数组,每个对象包含该路由段的参数:

```tsx
// 单个动态段
export async function generateStaticParams() {
  return [{ slug: "post-1" }, { slug: "post-2" }];
}

// 多个动态段
export async function generateStaticParams() {
  return [
    { category: "tech", slug: "post-1" },
    { category: "tech", slug: "post-2" },
    { category: "life", slug: "post-3" },
  ];
}
```

**参数类型**:

TypeScript 会根据路由段自动推断参数类型:

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // 返回类型自动推断为 { slug: string }[]
  return [{ slug: "post-1" }];
}

// app/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  // 返回类型自动推断为 { category: string; slug: string }[]
  return [{ category: "tech", slug: "post-1" }];
}
```

### 2.2 执行时机

`generateStaticParams` 在以下时机执行:

1. **构建时**: `next build` 时执行,生成静态页面
2. **重新验证时**: 如果配置了 `revalidate`,在重新验证时执行
3. **按需生成时**: 如果 `dynamicParams = true`,访问未预生成的页面时执行

**构建流程**:

```
next build
  ↓
执行 generateStaticParams()
  ↓
获取参数列表 [{ slug: 'a' }, { slug: 'b' }]
  ↓
为每个参数渲染页面
  ├─ 渲染 /blog/a
  └─ 渲染 /blog/b
  ↓
生成静态 HTML 文件
```

### 2.3 嵌套路由

在嵌套动态路由中,子路由的 `generateStaticParams` 可以接收父路由的参数:

```tsx
// app/[category]/[slug]/page.tsx

// 父路由生成 category 参数
export async function generateStaticParams() {
  return [{ category: "tech" }, { category: "life" }];
}

// 子路由可以接收父路由参数
// app/[category]/[slug]/page.tsx
export async function generateStaticParams({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const posts = await getPostsByCategory(category);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

**完整示例**:

```
app/
└── [category]/
    ├── page.tsx
    ├── layout.tsx (可选)
    └── [slug]/
        └── page.tsx
```

```tsx
// app/[category]/page.tsx
export async function generateStaticParams() {
  return [{ category: "tech" }, { category: "life" }, { category: "travel" }];
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return <div>Category</div>;
}

// app/[category]/[slug]/page.tsx
export async function generateStaticParams({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const posts = await getPostsByCategory(category);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = await getPost(category, slug);
  return <div>{post.title}</div>;
}
```

**生成的路由**:

```
/tech
/tech/post-1
/tech/post-2
/life
/life/post-3
/travel
/travel/post-4
```

### 2.4 dynamicParams 配置

`dynamicParams` 控制是否允许访问未在 `generateStaticParams` 中生成的参数:

```tsx
// app/blog/[slug]/page.tsx
export const dynamicParams = true; // 默认值

export async function generateStaticParams() {
  // 只预生成前 10 篇文章
  const posts = await getTopPosts(10);
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // 即使 slug 不在预生成列表中,也能访问(按需生成)
  const post = await getPost(slug);
  return <div>{post.title}</div>;
}
```

**配置对比**:

| dynamicParams | 行为                                | 适用场景                      |
| :------------ | :---------------------------------- | :---------------------------- |
| `true` (默认) | 允许访问未预生成的参数,按需生成     | 内容数量庞大,只预生成热门内容 |
| `false`       | 只允许访问预生成的参数,其他返回 404 | 内容数量有限且已知,如文档站点 |

---

## 3. 适用场景

### 3.1 博客网站

**场景**: 预生成所有博客文章页面。

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(
    (res) => res.json()
  );

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### 3.2 电商产品页面

**场景**: 预生成热门产品,其他产品按需生成。

```tsx
// app/products/[id]/page.tsx
export const dynamicParams = true;

export async function generateStaticParams() {
  // 只预生成前 100 个热门产品
  const hotProducts = await getHotProducts(100);

  return hotProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <div>价格: ¥{product.price}</div>
    </div>
  );
}
```

### 3.3 文档网站

**场景**: 预生成所有文档页面,不允许访问未定义的路由。

```tsx
// app/docs/[slug]/page.tsx
export const dynamicParams = false;

export async function generateStaticParams() {
  const docs = await getAllDocs();

  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getDoc(slug);

  return (
    <article>
      <h1>{doc.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: doc.content }} />
    </article>
  );
}
```

### 3.4 多语言网站

**场景**: 为每种语言预生成页面。

```tsx
// app/[lang]/[slug]/page.tsx
export async function generateStaticParams() {
  const languages = ["en", "zh", "ja"];
  const posts = await getAllPosts();

  const params = [];
  for (const lang of languages) {
    for (const post of posts) {
      params.push({
        lang,
        slug: post.slug,
      });
    }
  }

  return params;
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = await getPost(slug, lang);

  return <article>{post.title}</article>;
}
```

### 3.5 分类+详情页面

**场景**: 嵌套动态路由,分类和文章都是动态的。

```tsx
// app/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  const categories = await getCategories();
  const params = [];

  for (const category of categories) {
    const posts = await getPostsByCategory(category.slug);
    for (const post of posts) {
      params.push({
        category: category.slug,
        slug: post.slug,
      });
    }
  }

  return params;
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = await getPost(category, slug);

  return <article>{post.title}</article>;
}
```

---

## 4. API 签名与配置

### 4.1 基本签名

```tsx
export async function generateStaticParams(): Promise<Params[]>;
```

**Params 类型**:

```tsx
type Params = {
  [key: string]: string;
};
```

**示例**:

```tsx
// 单个参数
export async function generateStaticParams() {
  return [{ slug: "post-1" }, { slug: "post-2" }];
}

// 多个参数
export async function generateStaticParams() {
  return [
    { category: "tech", slug: "post-1" },
    { category: "life", slug: "post-2" },
  ];
}
```

### 4.2 嵌套路由签名

```tsx
export async function generateStaticParams({
  params,
}: {
  params: Promise<ParentParams>;
}): Promise<Params[]>;
```

**示例**:

```tsx
// app/[category]/[slug]/page.tsx
export async function generateStaticParams({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const posts = await getPostsByCategory(category);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### 4.3 配合路由段配置

```tsx
// app/blog/[slug]/page.tsx

// 控制是否允许动态参数
export const dynamicParams = true | false;

// 控制重新验证时间
export const revalidate = 3600; // 1 小时

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <div>{post.title}</div>;
}
```

---

## 5. 基础与进阶使用

### 5.1 基础用法:简单列表

```tsx
// app/posts/[id]/page.tsx
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>Post {id}</div>;
}
```

### 5.2 中级用法:从 API 获取数据

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 5.3 高级用法:嵌套动态路由

```tsx
// app/[category]/page.tsx
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ category: cat.slug }));
}

// app/[category]/[slug]/page.tsx
export async function generateStaticParams({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const posts = await getPostsByCategory(category);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = await getPost(category, slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>分类: {category}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

### 5.4 高级用法:多语言支持

```tsx
// app/[lang]/blog/[slug]/page.tsx
const languages = ["en", "zh", "ja", "ko"];

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const params = [];

  for (const lang of languages) {
    for (const post of posts) {
      params.push({
        lang,
        slug: post.slug,
      });
    }
  }

  return params;
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = await getPost(slug, lang);

  return (
    <article lang={lang}>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

### 5.5 高级用法:分页支持

```tsx
// app/blog/page/[page]/page.tsx
export async function generateStaticParams() {
  const totalPosts = await getTotalPosts();
  const postsPerPage = 10;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = parseInt(page);
  const posts = await getPosts(pageNum, 10);

  return (
    <div>
      <h1>博客 - 第 {pageNum} 页</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

---

## 6. 注意事项

### 6.1 性能考虑

生成大量静态页面会增加构建时间:

```tsx
// ❌ 不推荐:生成 10000 个页面
export async function generateStaticParams() {
  const products = await getAllProducts(); // 10000 个产品
  return products.map((p) => ({ id: p.id }));
}

// ✅ 推荐:只预生成热门内容
export const dynamicParams = true;

export async function generateStaticParams() {
  const hotProducts = await getHotProducts(100); // 只生成 100 个
  return hotProducts.map((p) => ({ id: p.id }));
}
```

### 6.2 数据一致性

确保 `generateStaticParams` 和页面组件使用相同的数据源:

```tsx
// ❌ 错误:数据源不一致
export async function generateStaticParams() {
  const posts = await fetch("https://api-v1.example.com/posts");
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  // 使用了不同的 API
  const post = await fetch(`https://api-v2.example.com/posts/${slug}`);
  return <div>{post.title}</div>;
}

// ✅ 正确:使用相同的数据源
const API_BASE = "https://api.example.com";

export async function generateStaticParams() {
  const posts = await fetch(`${API_BASE}/posts`);
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await fetch(`${API_BASE}/posts/${slug}`);
  return <div>{post.title}</div>;
}
```

### 6.3 错误处理

处理数据获取失败的情况:

```tsx
export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    // 返回空数组,避免构建失败
    return [];
  }
}
```

### 6.4 类型安全

使用 TypeScript 确保类型安全:

```tsx
type Post = {
  slug: string;
  title: string;
  content: string;
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts: Post[] = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post: Post = await getPost(slug);
  return <div>{post.title}</div>;
}
```

---

## 7. 常见问题

### 7.1 generateStaticParams 什么时候执行?

**构建时**: `next build` 时执行,生成静态页面。

**不在运行时执行**: 生产环境访问页面时不会执行。

**重新验证时**: 如果配置了 `revalidate`,在重新验证时可能执行。

### 7.2 如何处理大量动态路由?

使用 `dynamicParams = true` 只预生成部分内容:

```tsx
export const dynamicParams = true;

export async function generateStaticParams() {
  // 只预生成前 100 个
  const hotPosts = await getHotPosts(100);
  return hotPosts.map((post) => ({ slug: post.slug }));
}
```

### 7.3 嵌套路由如何组合参数?

Next.js 会自动组合父子路由的参数:

```tsx
// app/[category]/page.tsx
export async function generateStaticParams() {
  return [{ category: "tech" }, { category: "life" }];
}

// app/[category]/[slug]/page.tsx
export async function generateStaticParams({ params }) {
  const { category } = await params;
  const posts = await getPostsByCategory(category);
  return posts.map((post) => ({ slug: post.slug }));
}

// 生成的路由:
// /tech/post-1
// /tech/post-2
// /life/post-3
```

### 7.4 如何调试 generateStaticParams?

在函数中添加日志:

```tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  console.log("Generating params for posts:", posts.length);

  const params = posts.map((post) => ({ slug: post.slug }));
  console.log("Generated params:", params);

  return params;
}
```

查看构建输出:

```bash
npm run build

# 输出会显示生成的路由
Route (app)                              Size
├ ○ /blog/post-1                         1 kB
├ ○ /blog/post-2                         1 kB
└ ○ /blog/post-3                         1 kB
```

### 7.5 可以在 generateStaticParams 中使用环境变量吗?

可以,但要注意环境变量在构建时的值:

```tsx
export async function generateStaticParams() {
  const apiUrl = process.env.API_URL;
  const posts = await fetch(`${apiUrl}/posts`).then((res) => res.json());

  return posts.map((post) => ({ slug: post.slug }));
}
```

### 7.6 如何处理参数验证?

在页面组件中验证参数:

```tsx
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 验证参数格式
  if (!/^[a-z0-9-]+$/.test(slug)) {
    notFound();
  }

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <article>{post.title}</article>;
}
```

### 7.7 generateStaticParams 会影响开发环境吗?

不会。在开发环境(`npm run dev`)中,`generateStaticParams` 不会执行,所有路由都是按需生成的。

只有在生产构建(`npm run build`)时才会执行。

### 7.8 如何处理分页路由?

为分页路由生成静态参数:

```tsx
// app/blog/page/[page]/page.tsx
export async function generateStaticParams() {
  const totalPosts = await getTotalPosts();
  const postsPerPage = 10;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = parseInt(page);

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const posts = await getPosts(pageNum, 10);

  return (
    <div>
      <h1>第 {pageNum} 页</h1>
      {posts.map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}
```

### 7.9 如何优化构建时间?

**策略 1: 限制预生成数量**:

```tsx
export const dynamicParams = true;

export async function generateStaticParams() {
  // 只预生成最近的 50 篇文章
  const recentPosts = await getRecentPosts(50);
  return recentPosts.map((post) => ({ slug: post.slug }));
}
```

**策略 2: 使用并行请求**:

```tsx
export async function generateStaticParams() {
  // 并行获取多个分类的数据
  const [techPosts, lifePosts, newsPosts] = await Promise.all([
    getPostsByCategory("tech"),
    getPostsByCategory("life"),
    getPostsByCategory("news"),
  ]);

  return [
    ...techPosts.map((p) => ({ category: "tech", slug: p.slug })),
    ...lifePosts.map((p) => ({ category: "life", slug: p.slug })),
    ...newsPosts.map((p) => ({ category: "news", slug: p.slug })),
  ];
}
```

**策略 3: 缓存数据**:

```tsx
import { cache } from "react";

const getPosts = cache(async () => {
  const res = await fetch("https://api.example.com/posts");
  return res.json();
});

export async function generateStaticParams() {
  const posts = await getPosts(); // 会被缓存
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const posts = await getPosts(); // 使用缓存的数据
  const post = posts.find((p) => p.slug === slug);

  return <article>{post.title}</article>;
}
```

### 7.10 如何处理国际化路由?

为多语言路由生成参数:

```tsx
// app/[lang]/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const languages = ["en", "zh", "ja"];
  const posts = await getPosts();

  // 为每种语言生成所有文章的路由
  return languages.flatMap((lang) =>
    posts.map((post) => ({
      lang,
      slug: post.slug,
    }))
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = await getPost(slug, lang);

  return (
    <article lang={lang}>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

---

## 8. 总结

`generateStaticParams` 是 Next.js 16 中实现静态生成的核心函数,它提供了简洁、强大的 API 来预生成动态路由页面。

**核心要点**:

1. 在构建时执行,返回参数数组
2. 配合 `dynamicParams` 控制未预生成的路由
3. 支持嵌套路由,自动组合参数
4. 使用 TypeScript 确保类型安全
5. 合理控制预生成数量,避免构建时间过长

**最佳实践**:

- 只预生成热门或重要的内容
- 使用 `dynamicParams = true` 支持按需生成
- 确保数据源一致性
- 添加错误处理
- 使用类型定义提升代码质量

掌握 `generateStaticParams`,可以充分发挥 Next.js 静态生成的优势,构建高性能的 Web 应用。

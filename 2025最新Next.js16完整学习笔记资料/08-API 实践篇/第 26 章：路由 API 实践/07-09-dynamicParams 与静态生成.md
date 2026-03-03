**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# dynamicParams 与静态生成

dynamicParams 是 Next.js 16 中控制动态路由行为的重要配置选项。它决定了当访问未在构建时生成的动态路由时,应用应该如何响应。本文将详细介绍 dynamicParams 的工作原理和实际应用场景。

## dynamicParams 基础

### 什么是 dynamicParams

dynamicParams 是一个路由段配置选项,用于控制访问未预渲染的动态路由时的行为:

- `dynamicParams = true` (默认): 允许访问未预渲染的动态路由,会按需生成
- `dynamicParams = false`: 只允许访问预渲染的动态路由,其他返回 404

### 基本用法

```typescript
// app/blog/[slug]/page.tsx

// 控制动态参数行为
export const dynamicParams = true; // 或 false

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

## 工作原理

### dynamicParams = true

当设置为 true 时:

1. 构建时生成 generateStaticParams 返回的所有路由
2. 运行时访问其他路由时,按需生成并缓存
3. 适合内容频繁更新的场景

```typescript
// app/products/[id]/page.tsx
export const dynamicParams = true;

export async function generateStaticParams() {
  // 只预渲染热门产品
  const popularProducts = await getPopularProducts(100);

  return popularProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // 访问未预渲染的产品时,会按需生成
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
```

### dynamicParams = false

当设置为 false 时:

1. 只允许访问预渲染的路由
2. 访问其他路由返回 404
3. 适合内容固定的场景

```typescript
// app/docs/[slug]/page.tsx
export const dynamicParams = false;

export async function generateStaticParams() {
  // 预渲染所有文档
  const docs = await getAllDocs();

  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({
  params,
}: {
  params: { slug: string };
}) {
  // 只能访问预渲染的文档
  const doc = await getDoc(params.slug);

  return <DocContent doc={doc} />;
}
```

## 实战场景一: 电商产品页面

### 混合静态生成策略

```typescript
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { getProduct, getPopularProducts } from "@/lib/products";

// 允许动态参数
export const dynamicParams = true;

// 预渲染热门产品
export async function generateStaticParams() {
  const popularProducts = await getPopularProducts(1000);

  return popularProducts.map((product) => ({
    id: product.id.toString(),
  }));
}

// 生成元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="product-page">
      <ProductImages images={product.images} />
      <ProductInfo product={product} />
      <ProductReviews productId={product.id} />
      <RelatedProducts category={product.category} />
    </div>
  );
}
```

### 产品数据获取

```typescript
// lib/products.ts
import { unstable_cache } from "next/cache";

export const getProduct = unstable_cache(
  async (id: string) => {
    const product = await db.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return product;
  },
  ["product"],
  {
    tags: (id: string) => ["products", `product-${id}`],
    revalidate: 3600, // 1小时
  }
);

export async function getPopularProducts(limit: number) {
  return await db.product.findMany({
    where: {
      status: "published",
    },
    orderBy: {
      views: "desc",
    },
    take: limit,
  });
}
```

## 实战场景二: 博客文章系统

### 完全静态生成

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPost, getAllPosts } from "@/lib/blog";

// 禁用动态参数
export const dynamicParams = false;

// 预渲染所有文章
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    publishedTime: post.publishedAt.toISOString(),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <article className="blog-post">
      <header>
        <h1>{post.title}</h1>
        <div className="meta">
          <time>{post.publishedAt.toLocaleDateString()}</time>
          <span>{post.author.name}</span>
        </div>
      </header>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <footer>
        <Tags tags={post.tags} />
        <ShareButtons url={`/blog/${post.slug}`} />
      </footer>
    </article>
  );
}
```

### 博客数据管理

```typescript
// lib/blog.ts
import { unstable_cache } from "next/cache";

export const getAllPosts = unstable_cache(
  async () => {
    return await db.post.findMany({
      where: {
        status: "published",
      },
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        author: true,
        tags: true,
      },
    });
  },
  ["all-posts"],
  {
    tags: ["posts"],
    revalidate: 3600,
  }
);

export const getPost = unstable_cache(
  async (slug: string) => {
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: true,
        tags: true,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  },
  ["post"],
  {
    tags: (slug: string) => ["posts", `post-${slug}`],
    revalidate: 3600,
  }
);
```

## 实战场景三: 多语言文档站点

### 嵌套动态路由

```typescript
// app/[lang]/docs/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { getDoc, getAllDocs, getSupportedLanguages } from "@/lib/docs";

export const dynamicParams = false;

export async function generateStaticParams() {
  const languages = await getSupportedLanguages();
  const docs = await getAllDocs();

  const params = [];

  for (const lang of languages) {
    for (const doc of docs) {
      params.push({
        lang: lang.code,
        slug: doc.slug.split("/"),
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string[] };
}) {
  const doc = await getDoc(params.lang, params.slug.join("/"));

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocPage({
  params,
}: {
  params: { lang: string; slug: string[] };
}) {
  const doc = await getDoc(params.lang, params.slug.join("/"));

  if (!doc) {
    notFound();
  }

  return (
    <div className="doc-page">
      <aside>
        <DocNav lang={params.lang} currentSlug={params.slug.join("/")} />
      </aside>

      <main>
        <h1>{doc.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: doc.content }} />
      </main>

      <aside>
        <TableOfContents headings={doc.headings} />
      </aside>
    </div>
  );
}
```

### 文档数据获取

```typescript
// lib/docs.ts
import { unstable_cache } from "next/cache";

export const getSupportedLanguages = unstable_cache(
  async () => {
    return [
      { code: "en", name: "English" },
      { code: "zh", name: "中文" },
      { code: "ja", name: "日本語" },
    ];
  },
  ["supported-languages"],
  {
    tags: ["languages"],
    revalidate: false, // 永不过期
  }
);

export const getAllDocs = unstable_cache(
  async () => {
    return await db.doc.findMany({
      where: {
        status: "published",
      },
      select: {
        slug: true,
      },
    });
  },
  ["all-docs"],
  {
    tags: ["docs"],
    revalidate: 3600,
  }
);

export const getDoc = unstable_cache(
  async (lang: string, slug: string) => {
    const doc = await db.doc.findFirst({
      where: {
        slug,
        language: lang,
        status: "published",
      },
      include: {
        headings: true,
      },
    });

    if (!doc) {
      throw new Error("Doc not found");
    }

    return doc;
  },
  ["doc"],
  {
    tags: (lang: string, slug: string) => ["docs", `doc-${lang}-${slug}`],
    revalidate: 3600,
  }
);
```

## 实战场景四: 用户个人主页

### 按需生成策略

```typescript
// app/users/[username]/page.tsx
import { notFound } from "next/navigation";
import { getUser, getPopularUsers } from "@/lib/users";

// 允许动态参数
export const dynamicParams = true;

// 只预渲染热门用户
export async function generateStaticParams() {
  const popularUsers = await getPopularUsers(500);

  return popularUsers.map((user) => ({
    username: user.username,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUser(params.username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio,
    openGraph: {
      images: [user.avatar],
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUser(params.username);

  if (!user) {
    notFound();
  }

  return (
    <div className="profile-page">
      <ProfileHeader user={user} />
      <ProfileStats user={user} />
      <ProfileContent userId={user.id} />
    </div>
  );
}
```

### 用户数据获取

```typescript
// lib/users.ts
import { unstable_cache } from "next/cache";

export const getUser = unstable_cache(
  async (username: string) => {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        profile: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  },
  ["user"],
  {
    tags: (username: string) => ["users", `user-${username}`],
    revalidate: 300, // 5分钟
  }
);

export async function getPopularUsers(limit: number) {
  return await db.user.findMany({
    where: {
      status: "active",
    },
    orderBy: {
      followerCount: "desc",
    },
    take: limit,
    select: {
      username: true,
    },
  });
}
```

## 性能对比

### dynamicParams 配置对比

| 配置                 | 构建时间 | 首次访问速度 | 后续访问速度 | 适用场景          |
| -------------------- | -------- | ------------ | ------------ | ----------------- |
| `true` + 少量预渲染  | 快       | 慢(未预渲染) | 快(已缓存)   | 内容多,更新频繁   |
| `true` + 大量预渲染  | 慢       | 快           | 快           | 热门内容多        |
| `false` + 全部预渲染 | 很慢     | 很快         | 很快         | 内容固定,数量有限 |

### 构建时间对比

```typescript
// 场景1: 1000个产品,预渲染100个
export const dynamicParams = true;
export async function generateStaticParams() {
  return getPopularProducts(100); // 构建时间: ~10秒
}

// 场景2: 1000个产品,预渲染全部
export const dynamicParams = false;
export async function generateStaticParams() {
  return getAllProducts(); // 构建时间: ~100秒
}

// 场景3: 10个文档,预渲染全部
export const dynamicParams = false;
export async function generateStaticParams() {
  return getAllDocs(); // 构建时间: ~1秒
}
```

## 适用场景

### 何时使用 dynamicParams = true

| 场景         | 说明                       | 示例             |
| ------------ | -------------------------- | ---------------- |
| 内容数量巨大 | 无法全部预渲染             | 电商产品(百万级) |
| 内容频繁更新 | 预渲染成本高               | 新闻文章         |
| 长尾内容     | 大部分访问量集中在少数页面 | 用户主页         |
| UGC 内容     | 用户生成内容,无法预知      | 社交媒体帖子     |

### 何时使用 dynamicParams = false

| 场景         | 说明               | 示例             |
| ------------ | ------------------ | ---------------- |
| 内容数量有限 | 可以全部预渲染     | 文档站点(几百页) |
| 内容固定     | 很少新增或修改     | 营销落地页       |
| SEO 要求高   | 需要完全静态化     | 博客文章         |
| 安全性要求   | 不允许访问未知路由 | 会员专区         |

### 混合策略

```typescript
// 根据内容类型使用不同策略

// 产品页面: 允许动态参数
// app/products/[id]/page.tsx
export const dynamicParams = true;

// 文档页面: 禁用动态参数
// app/docs/[slug]/page.tsx
export const dynamicParams = false;

// 博客页面: 禁用动态参数
// app/blog/[slug]/page.tsx
export const dynamicParams = false;

// 用户页面: 允许动态参数
// app/users/[username]/page.tsx
export const dynamicParams = true;
```

## 注意事项

### 1. 404 处理

使用 `dynamicParams = false` 时,需要正确处理 404:

```typescript
// app/blog/[slug]/page.tsx
export const dynamicParams = false;

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  // 即使 dynamicParams = false,仍需处理 notFound
  if (!post) {
    notFound();
  }

  return <PostContent post={post} />;
}

// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>文章不存在</h1>
      <p>您访问的文章可能已被删除或从未存在</p>
    </div>
  );
}
```

### 2. 构建时间优化

预渲染大量页面时,注意构建时间:

```typescript
// 分批预渲染
export async function generateStaticParams() {
  // 只预渲染最近的文章
  const recentPosts = await getRecentPosts(1000);

  return recentPosts.map((post) => ({
    slug: post.slug,
  }));
}

// 使用增量静态再生(ISR)
export const revalidate = 3600; // 1小时后重新生成
```

### 3. 缓存策略

动态生成的页面需要合理的缓存策略:

```typescript
// app/products/[id]/page.tsx
export const dynamicParams = true;

// 设置重新验证时间
export const revalidate = 3600; // 1小时

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return <ProductDetail product={product} />;
}
```

### 4. 元数据生成

确保元数据也能正确生成:

```typescript
// 错误示例: 元数据生成失败会导致页面无法访问
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  // 如果产品不存在,会抛出错误
  return {
    title: product.name, // product 可能为 null
  };
}

// 正确示例: 处理不存在的情况
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}
```

### 5. 类型安全

确保参数类型正确:

```typescript
// 使用 TypeScript 确保类型安全
interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const products = await getProducts();

  return products.map((product) => ({
    id: product.id.toString(), // 确保是字符串
  }));
}

export default async function Page({ params }: PageProps) {
  // params.id 的类型是 string
  const product = await getProduct(params.id);

  return <ProductDetail product={product} />;
}
```

## 常见问题

### 1. dynamicParams 和 revalidate 的关系?

**问题**: 两者如何配合使用?

**解答**:

```typescript
// dynamicParams 控制是否允许访问未预渲染的路由
// revalidate 控制页面的重新验证时间

// 场景1: 允许动态参数 + ISR
export const dynamicParams = true;
export const revalidate = 3600; // 1小时后重新生成

// 场景2: 禁用动态参数 + ISR
export const dynamicParams = false;
export const revalidate = 3600; // 预渲染的页面1小时后重新生成

// 场景3: 允许动态参数 + 完全静态
export const dynamicParams = true;
export const revalidate = false; // 永不重新生成

// 场景4: 禁用动态参数 + 完全静态
export const dynamicParams = false;
export const revalidate = false; // 完全静态,永不重新生成
```

### 2. 如何处理大量动态路由?

**问题**: 有 100 万个产品,如何处理?

**解答**:

```typescript
// 策略1: 只预渲染热门产品
export const dynamicParams = true;

export async function generateStaticParams() {
  // 只预渲染前1000个热门产品
  const popularProducts = await getPopularProducts(1000);

  return popularProducts.map((product) => ({
    id: product.id.toString(),
  }));
}

// 策略2: 使用 ISR 按需生成
export const revalidate = 3600; // 1小时

// 策略3: 使用 On-Demand Revalidation
// 产品更新时手动触发重新生成
export async function updateProduct(id: string) {
  await db.product.update({ where: { id } });

  // 触发重新生成
  revalidatePath(`/products/${id}`);
}
```

### 3. 嵌套动态路由如何处理?

**问题**: 多层动态路由如何配置?

**解答**:

```typescript
// app/[category]/[subcategory]/[product]/page.tsx

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  const params = [];

  for (const category of categories) {
    const subcategories = await getSubcategories(category.id);

    for (const subcategory of subcategories) {
      const products = await getProducts(subcategory.id);

      for (const product of products) {
        params.push({
          category: category.slug,
          subcategory: subcategory.slug,
          product: product.slug,
        });
      }
    }
  }

  return params;
}

// 注意: 这会生成大量页面,建议只预渲染部分
export async function generateStaticParams() {
  // 只预渲染热门分类的热门产品
  const popularCategories = await getPopularCategories(10);
  const params = [];

  for (const category of popularCategories) {
    const popularSubcategories = await getPopularSubcategories(category.id, 5);

    for (const subcategory of popularSubcategories) {
      const popularProducts = await getPopularProducts(subcategory.id, 20);

      for (const product of popularProducts) {
        params.push({
          category: category.slug,
          subcategory: subcategory.slug,
          product: product.slug,
        });
      }
    }
  }

  return params;
}
```

### 4. 如何测试 dynamicParams?

**问题**: 如何验证配置是否正确?

**解答**:

```typescript
// 开发环境测试
// 1. 访问预渲染的路由
// http://localhost:3000/products/1 (应该快速加载)

// 2. 访问未预渲染的路由
// http://localhost:3000/products/999999

// dynamicParams = true: 应该能访问(可能较慢)
// dynamicParams = false: 应该返回 404

// 生产环境测试
// 1. 构建应用
npm run build

// 2. 查看构建输出
// ○ (Static)  预渲染为静态内容
// ƒ (Dynamic) 服务器端渲染
// ● (SSG)     自动渲染为静态 HTML

// 3. 启动生产服务器
npm run start

// 4. 测试路由行为
```

### 5. 如何优化构建时间?

**问题**: 预渲染太多页面导致构建很慢?

**解答**:

```typescript
// 策略1: 减少预渲染数量
export async function generateStaticParams() {
  // 只预渲染最重要的页面
  const importantPages = await getImportantPages(100);

  return importantPages.map((page) => ({
    slug: page.slug,
  }));
}

// 策略2: 使用并行处理
export async function generateStaticParams() {
  const [products, posts, docs] = await Promise.all([
    getProducts(),
    getPosts(),
    getDocs(),
  ]);

  return [
    ...products.map((p) => ({ type: "product", id: p.id })),
    ...posts.map((p) => ({ type: "post", id: p.id })),
    ...docs.map((d) => ({ type: "doc", id: d.id })),
  ];
}

// 策略3: 使用增量构建
// next.config.js
module.exports = {
  experimental: {
    incrementalCacheHandlerPath: "./cache-handler.js",
  },
};
```

### 6. 如何处理查询参数?

**问题**: dynamicParams 对查询参数有影响吗?

**解答**:

```typescript
// dynamicParams 只影响路径参数,不影响查询参数

// app/products/[id]/page.tsx
export const dynamicParams = false;

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { variant?: string; color?: string };
}) {
  // params.id 受 dynamicParams 控制
  // searchParams 不受影响,始终可用

  const product = await getProduct(params.id);
  const variant = searchParams.variant;
  const color = searchParams.color;

  return <ProductDetail product={product} variant={variant} color={color} />;
}

// 访问 /products/1?variant=large&color=red
// params.id = "1" (受 dynamicParams 控制)
// searchParams.variant = "large" (不受影响)
// searchParams.color = "red" (不受影响)
```

### 7. 如何处理重定向?

**问题**: 未预渲染的路由如何重定向?

**解答**:

```typescript
// app/products/[id]/page.tsx
import { redirect } from "next/navigation";

export const dynamicParams = true;

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    // 重定向到产品列表
    redirect("/products");
  }

  // 如果产品已下架,重定向到替代产品
  if (product.status === "discontinued" && product.replacementId) {
    redirect(`/products/${product.replacementId}`);
  }

  return <ProductDetail product={product} />;
}
```

### 8. 如何处理权限控制?

**问题**: 动态路由如何实现权限控制?

**解答**:

```typescript
// app/admin/posts/[id]/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamicParams = true;

export default async function AdminPostPage({
  params,
}: {
  params: { id: string };
}) {
  // 检查权限
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return <AdminPostEditor post={post} />;
}
```

### 9. 如何处理多语言?

**问题**: 多语言站点如何配置?

**解答**:

```typescript
// app/[lang]/blog/[slug]/page.tsx

export const dynamicParams = false;

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

export default async function BlogPost({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const post = await getPost(params.lang, params.slug);

  return <PostContent post={post} lang={params.lang} />;
}
```

### 10. 如何监控动态路由性能?

**问题**: 如何知道哪些路由是动态生成的?

**解答**:

```typescript
// lib/monitoring.ts

export async function trackPageGeneration(
  path: string,
  isPrerendered: boolean
) {
  await analytics.track({
    event: "page_generation",
    properties: {
      path,
      isPrerendered,
      timestamp: new Date(),
    },
  });
}

// app/products/[id]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  // 记录页面生成
  await trackPageGeneration(
    `/products/${params.id}`,
    false // 动态生成
  );

  return <ProductDetail product={product} />;
}

// 分析数据
// 1. 哪些路由经常被动态生成?
// 2. 动态生成的平均响应时间?
// 3. 是否需要增加预渲染数量?
```

## 总结

dynamicParams 是控制 Next.js 动态路由行为的关键配置。通过本文的学习,我们掌握了:

### 核心概念

1. **dynamicParams = true**: 允许访问未预渲染的路由,按需生成
2. **dynamicParams = false**: 只允许访问预渲染的路由,其他返回 404
3. **generateStaticParams**: 指定要预渲染的路由参数

### 实战应用

我们通过四个实战场景学习了 dynamicParams 的应用:

1. **电商产品页面**: 预渲染热门产品,其他按需生成
2. **博客文章系统**: 完全静态生成,禁用动态参数
3. **多语言文档站点**: 预渲染所有语言的所有文档
4. **用户个人主页**: 预渲染热门用户,其他按需生成

### 最佳实践

1. **内容多**: 使用 `dynamicParams = true`,只预渲染热门内容
2. **内容少**: 使用 `dynamicParams = false`,全部预渲染
3. **混合策略**: 不同类型内容使用不同配置
4. **性能优化**: 合理设置 revalidate,使用 ISR
5. **监控分析**: 跟踪动态生成的路由,持续优化

### 注意事项

1. 正确处理 404 和 notFound
2. 注意构建时间,避免预渲染过多页面
3. 设置合理的缓存策略
4. 确保元数据生成正确
5. 使用 TypeScript 确保类型安全

通过合理配置 dynamicParams,可以在构建时间和运行时性能之间找到最佳平衡点。

## 决策树

### 如何选择 dynamicParams 配置

```
开始
  |
  ├─ 内容数量 < 1000?
  |    ├─ 是 → 内容固定不变?
  |    |    ├─ 是 → dynamicParams = false (完全静态)
  |    |    └─ 否 → dynamicParams = false + revalidate (ISR)
  |    |
  |    └─ 否 → 内容数量 > 100万?
  |         ├─ 是 → dynamicParams = true + 预渲染热门内容
  |         └─ 否 → 访问分布均匀?
  |              ├─ 是 → dynamicParams = true + 预渲染部分
  |              └─ 否 → dynamicParams = true + 预渲染热门内容
```

### 实际案例决策

```typescript
// 案例1: 博客(100篇文章,每月新增5篇)
// 决策: dynamicParams = false + revalidate
export const dynamicParams = false;
export const revalidate = 3600;

// 案例2: 电商(10万产品,80%流量集中在1000个产品)
// 决策: dynamicParams = true + 预渲染热门产品
export const dynamicParams = true;
export async function generateStaticParams() {
  return getPopularProducts(1000);
}

// 案例3: 文档站点(500页,很少更新)
// 决策: dynamicParams = false + 完全静态
export const dynamicParams = false;
export const revalidate = false;

// 案例4: 用户主页(100万用户,长尾分布)
// 决策: dynamicParams = true + 预渲染活跃用户
export const dynamicParams = true;
export async function generateStaticParams() {
  return getActiveUsers(5000);
}
```

## 性能测试

### 测试方法

```typescript
// lib/performance-test.ts

export async function testStaticGeneration() {
  const startTime = Date.now();

  // 测试预渲染的页面
  const prerenderedResponse = await fetch("http://localhost:3000/products/1");
  const prerenderedTime = Date.now() - startTime;

  console.log("预渲染页面响应时间:", prerenderedTime, "ms");

  // 测试动态生成的页面
  const dynamicStartTime = Date.now();
  const dynamicResponse = await fetch("http://localhost:3000/products/999999");
  const dynamicTime = Date.now() - dynamicStartTime;

  console.log("动态生成页面响应时间:", dynamicTime, "ms");

  // 对比
  console.log("性能差异:", dynamicTime / prerenderedTime, "倍");
}

// 批量测试
export async function batchTest(urls: string[]) {
  const results = [];

  for (const url of urls) {
    const startTime = Date.now();
    await fetch(url);
    const time = Date.now() - startTime;

    results.push({ url, time });
  }

  // 统计
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  const maxTime = Math.max(...results.map((r) => r.time));
  const minTime = Math.min(...results.map((r) => r.time));

  console.log("平均响应时间:", avgTime, "ms");
  console.log("最大响应时间:", maxTime, "ms");
  console.log("最小响应时间:", minTime, "ms");

  return results;
}
```

### 性能基准

| 页面类型         | 首次访问 | 缓存后访问 | 目标   |
| ---------------- | -------- | ---------- | ------ |
| 预渲染页面       | < 100ms  | < 50ms     | 极快   |
| 动态生成(简单)   | < 500ms  | < 100ms    | 快     |
| 动态生成(复杂)   | < 2000ms | < 200ms    | 可接受 |
| 动态生成(很复杂) | < 5000ms | < 500ms    | 需优化 |

## 最佳实践总结

### 1. 分析内容特征

```typescript
// 分析工具
export async function analyzeContent() {
  const stats = {
    totalCount: await db.product.count(),
    publishedCount: await db.product.count({ where: { status: "published" } }),
    avgViewsPerDay: await getAvgViews(),
    topProducts: await getTopProducts(100),
  };

  // 计算访问集中度
  const topViewsSum = stats.topProducts.reduce((sum, p) => sum + p.views, 0);
  const totalViews = await getTotalViews();
  const concentration = topViewsSum / totalViews;

  console.log("访问集中度:", (concentration * 100).toFixed(2), "%");

  // 建议
  if (stats.totalCount < 1000) {
    console.log("建议: dynamicParams = false (全部预渲染)");
  } else if (concentration > 0.8) {
    console.log("建议: dynamicParams = true + 预渲染热门内容");
  } else {
    console.log("建议: dynamicParams = true + 少量预渲染");
  }

  return stats;
}
```

### 2. 监控和优化

```typescript
// 监控工具
export class StaticGenerationMonitor {
  private stats = {
    prerendered: 0,
    dynamic: 0,
    errors: 0,
  };

  recordPrerendered() {
    this.stats.prerendered++;
  }

  recordDynamic() {
    this.stats.dynamic++;
  }

  recordError() {
    this.stats.errors++;
  }

  getReport() {
    const total = this.stats.prerendered + this.stats.dynamic;
    const prerenderRate = (this.stats.prerendered / total) * 100;

    return {
      total,
      prerendered: this.stats.prerendered,
      dynamic: this.stats.dynamic,
      errors: this.stats.errors,
      prerenderRate: prerenderRate.toFixed(2) + "%",
    };
  }

  // 优化建议
  getSuggestions() {
    const report = this.getReport();
    const suggestions = [];

    if (parseFloat(report.prerenderRate) < 50) {
      suggestions.push("考虑增加预渲染数量");
    }

    if (this.stats.errors > 10) {
      suggestions.push("检查错误处理逻辑");
    }

    if (this.stats.dynamic > 10000) {
      suggestions.push("考虑使用 ISR 减少动态生成");
    }

    return suggestions;
  }
}

export const monitor = new StaticGenerationMonitor();
```

### 3. 渐进式优化

```typescript
// 第一阶段: 基础配置
export const dynamicParams = true;
export async function generateStaticParams() {
  return []; // 不预渲染
}

// 第二阶段: 预渲染热门内容
export async function generateStaticParams() {
  return getPopularProducts(100); // 预渲染100个
}

// 第三阶段: 根据数据优化
export async function generateStaticParams() {
  const analytics = await getAnalytics();
  const threshold = analytics.avgViews * 2;

  const products = await db.product.findMany({
    where: {
      views: { gte: threshold },
    },
  });

  return products.map((p) => ({ id: p.id.toString() }));
}

// 第四阶段: 动态调整
export async function generateStaticParams() {
  const hour = new Date().getHours();

  // 工作时间预渲染更多
  const limit = hour >= 9 && hour <= 18 ? 1000 : 500;

  return getPopularProducts(limit);
}
```

### 4. 文档化配置

```typescript
// config/static-generation.ts

/**
 * 静态生成配置
 *
 * 决策依据:
 * - 产品总数: 100,000
 * - 日均访问: 50,000
 * - 访问集中度: 85% (前1000个产品)
 * - 更新频率: 每天100个产品更新
 *
 * 配置选择:
 * - dynamicParams = true (允许访问所有产品)
 * - 预渲染数量: 1000 (覆盖85%访问)
 * - revalidate = 3600 (1小时,平衡新鲜度和性能)
 */

export const STATIC_GENERATION_CONFIG = {
  dynamicParams: true,
  prerenderCount: 1000,
  revalidate: 3600,

  // 预渲染策略
  strategy: "popular", // 'popular' | 'recent' | 'random'

  // 性能目标
  targets: {
    prerenderTime: 100, // ms
    dynamicTime: 500, // ms
    cacheHitRate: 0.85, // 85%
  },
};
```

通过系统化的分析、监控和优化,可以找到最适合项目的 dynamicParams 配置,在构建时间、运行时性能和用户体验之间达到最佳平衡。

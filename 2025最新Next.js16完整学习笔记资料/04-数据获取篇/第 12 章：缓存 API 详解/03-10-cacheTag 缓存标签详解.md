**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# cacheTag 缓存标签详解

## 1. 概述与背景

### 1.1 什么是 cacheTag

`cacheTag` 是 Next.js 16 引入的缓存标签功能,允许开发者为缓存的数据打上标签,然后通过标签来批量失效相关的缓存。这是一种比基于路径的缓存失效更灵活和精确的方式。

`cacheTag` 的核心特点:

- **标签化管理**: 为不同的数据源打上语义化的标签
- **批量失效**: 通过一个标签可以失效所有相关的缓存
- **精确控制**: 可以精确控制哪些缓存需要失效
- **跨页面**: 标签可以跨越多个页面和组件使用

### 1.2 为什么需要 cacheTag

在传统的缓存管理中,失效缓存通常基于路径。但实际应用中,同一份数据可能被多个页面使用,基于路径的失效方式不够灵活。`cacheTag` 解决了这个问题:

- **数据关联**: 将相关的缓存数据关联到同一个标签
- **统一失效**: 数据更新时,通过标签一次性失效所有相关缓存
- **细粒度控制**: 可以为不同的数据类型设置不同的标签
- **易于维护**: 标签化的管理方式更直观,易于理解和维护

### 1.3 cacheTag 的工作原理

`cacheTag` 的工作流程:

1. **打标签**: 在缓存数据时,使用 `cacheTag()` 为数据打上一个或多个标签
2. **存储关联**: Next.js 会记录标签和缓存数据之间的关联关系
3. **失效缓存**: 使用 `revalidateTag()` 时,所有带有该标签的缓存都会被失效
4. **重新获取**: 下次访问时,会重新获取数据并缓存

```typescript
// 打标签
"use cache";
cacheTag("posts");

// 失效标签
revalidateTag("posts"); // 所有带 'posts' 标签的缓存都会失效
```

## 2. 核心概念

### 2.1 基本用法

#### 为缓存打标签

```typescript
// app/posts/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function PostsPage() {
  "use cache";
  cacheTag("posts");

  const posts = await fetchPosts();

  return (
    <div>
      <h1>All Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}

async function fetchPosts() {
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}
```

#### 使用多个标签

```typescript
// app/posts/[id]/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function PostPage({ params }: { params: { id: string } }) {
  "use cache";
  // 使用多个标签
  cacheTag("posts", `post-${params.id}`);

  const post = await fetchPost(params.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

async function fetchPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`);
  return res.json();
}
```

### 2.2 失效标签缓存

#### 在 Server Action 中失效

```typescript
// app/actions.ts
"use server";

import { revalidateTag } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // 创建文章
  await savePost({ title, content });

  // 失效所有带 'posts' 标签的缓存
  revalidateTag("posts");
}

async function savePost(data: { title: string; content: string }) {
  // 保存逻辑
  console.log("Saving post:", data);
}
```

#### 在 API 路由中失效

```typescript
// app/api/posts/route.ts
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const data = await request.json();

  // 创建文章
  await createPost(data);

  // 失效缓存
  revalidateTag("posts");

  return Response.json({ success: true });
}

async function createPost(data: any) {
  console.log("Creating post:", data);
}
```

### 2.3 标签命名策略

#### 按资源类型命名

```typescript
// 文章相关
cacheTag("posts");
cacheTag("post-list");
cacheTag("post-detail");

// 用户相关
cacheTag("users");
cacheTag("user-profile");

// 评论相关
cacheTag("comments");
```

#### 按资源 ID 命名

```typescript
// 特定文章
cacheTag(`post-${postId}`);

// 特定用户
cacheTag(`user-${userId}`);

// 特定分类
cacheTag(`category-${categoryId}`);
```

#### 组合命名

```typescript
// 组合使用多个标签
cacheTag("posts", `post-${postId}`, `author-${authorId}`);

// 这样可以通过不同的标签失效缓存:
// - revalidateTag('posts') - 失效所有文章
// - revalidateTag(`post-${postId}`) - 失效特定文章
// - revalidateTag(`author-${authorId}`) - 失效特定作者的所有内容
```

## 3. 适用场景

### 3.1 内容管理系统

#### 文章管理

```typescript
// app/blog/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function BlogPage() {
  "use cache";
  cacheTag("blog-posts");

  const posts = await fetchBlogPosts();

  return (
    <div>
      <h1>Blog</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

async function fetchBlogPosts() {
  const res = await fetch("https://api.example.com/blog/posts");
  return res.json();
}

// app/actions/blog.ts
("use server");

import { revalidateTag } from "next/cache";

export async function publishPost(postId: string) {
  await updatePostStatus(postId, "published");

  // 失效博客文章列表缓存
  revalidateTag("blog-posts");
  revalidateTag(`blog-post-${postId}`);
}

async function updatePostStatus(id: string, status: string) {
  console.log(`Updating post ${id} to ${status}`);
}
```

#### 分类管理

```typescript
// app/categories/[slug]/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  "use cache";
  cacheTag("categories", `category-${params.slug}`);

  const category = await fetchCategory(params.slug);
  const posts = await fetchPostsByCategory(params.slug);

  return (
    <div>
      <h1>{category.name}</h1>
      <p>{category.description}</p>
      <div className="posts">
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
          </article>
        ))}
      </div>
    </div>
  );
}

async function fetchCategory(slug: string) {
  return { name: "Category", description: "Description" };
}

async function fetchPostsByCategory(slug: string) {
  return [];
}
```

### 3.2 电商应用

#### 产品列表

```typescript
// app/products/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function ProductsPage() {
  "use cache";
  cacheTag("products");

  const products = await fetchProducts();

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h2>{product.name}</h2>
          <p className="price">${product.price}</p>
        </div>
      ))}
    </div>
  );
}

async function fetchProducts() {
  const res = await fetch("https://api.example.com/products");
  return res.json();
}

// app/actions/products.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateProductPrice(productId: string, newPrice: number) {
  await saveProductPrice(productId, newPrice);

  // 失效产品相关缓存
  revalidateTag("products");
  revalidateTag(`product-${productId}`);
}

async function saveProductPrice(id: string, price: number) {
  console.log(`Updating product ${id} price to ${price}`);
}
```

#### 购物车

```typescript
// components/Cart.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export async function Cart({ userId }: { userId: string }) {
  "use cache";
  cacheTag(`cart-${userId}`);

  const cart = await fetchCart(userId);

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      {cart.items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>${item.price}</span>
        </div>
      ))}
    </div>
  );
}

async function fetchCart(userId: string) {
  return { items: [] };
}

// app/actions/cart.ts
("use server");

import { revalidateTag } from "next/cache";

export async function addToCart(userId: string, productId: string) {
  await saveCartItem(userId, productId);

  // 失效用户购物车缓存
  revalidateTag(`cart-${userId}`);
}

async function saveCartItem(userId: string, productId: string) {
  console.log(`Adding product ${productId} to cart for user ${userId}`);
}
```

### 3.3 社交媒体应用

#### 用户动态

```typescript
// app/feed/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function FeedPage() {
  "use cache";
  cacheTag("feed", "posts");

  const posts = await fetchFeed();

  return (
    <div className="feed">
      {posts.map((post) => (
        <div key={post.id} className="post">
          <p className="author">{post.author}</p>
          <p className="content">{post.content}</p>
        </div>
      ))}
    </div>
  );
}

async function fetchFeed() {
  return [];
}

// app/actions/posts.ts
("use server");

import { revalidateTag } from "next/cache";

export async function createPost(content: string) {
  await savePost(content);

  // 失效动态流缓存
  revalidateTag("feed");
  revalidateTag("posts");
}

async function savePost(content: string) {
  console.log("Creating post:", content);
}
```

### 3.4 API 响应缓存

#### 公共 API

```typescript
// app/api/posts/route.ts
import { unstable_cacheTag as cacheTag } from "next/cache";

export async function GET() {
  "use cache";
  cacheTag("api-posts");

  const posts = await fetchPosts();

  return Response.json(posts);
}

async function fetchPosts() {
  return [];
}

// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  "use cache";
  cacheTag("api-posts", `api-post-${params.id}`);

  const post = await fetchPost(params.id);

  return Response.json(post);
}

async function fetchPost(id: string) {
  return { id, title: "Post" };
}
```

## 4. API 签名与配置

### 4.1 函数签名

```typescript
import { unstable_cacheTag as cacheTag } from "next/cache";
import { revalidateTag } from "next/cache";

// cacheTag: 为缓存打标签
function cacheTag(...tags: string[]): void;

// revalidateTag: 失效标签缓存
function revalidateTag(tag: string): void;
```

### 4.2 使用规则

#### cacheTag 使用规则

```typescript
// 1. 必须在 'use cache' 作用域内使用
"use cache";
cacheTag("my-tag");

// 2. 可以使用多个标签
cacheTag("tag1", "tag2", "tag3");

// 3. 标签名称是字符串
cacheTag("posts");
cacheTag(`post-${id}`);

// 4. 标签名称区分大小写
cacheTag("Posts"); // 不同于 'posts'
```

#### revalidateTag 使用规则

```typescript
// 1. 只能在 Server Action 或 API 路由中使用
"use server";
revalidateTag("my-tag");

// 2. 一次只能失效一个标签
revalidateTag("posts");

// 3. 失效多个标签需要多次调用
revalidateTag("posts");
revalidateTag("comments");

// 4. 标签名称必须完全匹配
revalidateTag("posts"); // 只失效 'posts' 标签
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单标签使用

```typescript
// app/simple/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function SimplePage() {
  "use cache";
  cacheTag("simple-data");

  const data = await fetchData();

  return <div>{data.content}</div>;
}

async function fetchData() {
  return { content: "Simple data" };
}

// app/actions/simple.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateData() {
  await saveData();
  revalidateTag("simple-data");
}

async function saveData() {
  console.log("Saving data");
}
```

#### 组件级标签

```typescript
// components/TaggedComponent.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export async function TaggedComponent() {
  "use cache";
  cacheTag("component-data");

  const data = await fetchComponentData();

  return <div>{data}</div>;
}

async function fetchComponentData() {
  return "Component data";
}
```

### 5.2 进阶用法

#### 层级标签系统

```typescript
// 建立层级标签系统
// app/posts/[id]/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function PostPage({ params }: { params: { id: string } }) {
  "use cache";
  // 使用层级标签
  cacheTag(
    "content", // 最顶层: 所有内容
    "posts", // 第二层: 所有文章
    `post-${params.id}` // 第三层: 特定文章
  );

  const post = await fetchPost(params.id);

  return <article>{post.title}</article>;
}

async function fetchPost(id: string) {
  return { title: "Post" };
}

// 失效策略:
// revalidateTag('content')  - 失效所有内容
// revalidateTag('posts')    - 失效所有文章
// revalidateTag(`post-${id}`) - 失效特定文章
```

#### 关联数据标签

```typescript
// 处理关联数据的标签
// app/posts/[id]/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function PostWithComments({
  params,
}: {
  params: { id: string };
}) {
  "use cache";
  // 文章和评论都打上相关标签
  cacheTag("posts", `post-${params.id}`, `post-${params.id}-comments`);

  const post = await fetchPost(params.id);
  const comments = await fetchComments(params.id);

  return (
    <div>
      <article>{post.title}</article>
      <div className="comments">
        {comments.map((comment) => (
          <div key={comment.id}>{comment.content}</div>
        ))}
      </div>
    </div>
  );
}

async function fetchPost(id: string) {
  return { title: "Post" };
}

async function fetchComments(id: string) {
  return [];
}

// app/actions/comments.ts
("use server");

import { revalidateTag } from "next/cache";

export async function addComment(postId: string, content: string) {
  await saveComment(postId, content);

  // 只失效评论相关的缓存
  revalidateTag(`post-${postId}-comments`);
}

async function saveComment(postId: string, content: string) {
  console.log(`Adding comment to post ${postId}`);
}
```

#### 动态标签生成

```typescript
// 根据数据动态生成标签
// app/users/[id]/posts/page.tsx
import { unstable_cacheTag as cacheTag } from "next/cache";

export default async function UserPostsPage({
  params,
}: {
  params: { id: string };
}) {
  "use cache";

  const user = await fetchUser(params.id);

  // 根据用户角色生成不同的标签
  const tags = ["posts", `user-${params.id}-posts`];
  if (user.role === "admin") {
    tags.push("admin-content");
  }

  cacheTag(...tags);

  const posts = await fetchUserPosts(params.id);

  return (
    <div>
      <h1>{user.name}'s Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}

async function fetchUser(id: string) {
  return { name: "User", role: "user" };
}

async function fetchUserPosts(id: string) {
  return [];
}
```

## 6. 注意事项

### 6.1 标签命名规范

#### 使用有意义的名称

```typescript
// ❌ 不好: 使用无意义的标签名
cacheTag("tag1", "tag2", "data");

// ✅ 好: 使用描述性的标签名
cacheTag("blog-posts", "user-profile", "product-list");
```

#### 保持一致性

```typescript
// ❌ 不好: 命名不一致
cacheTag("posts");
cacheTag("Posts");
cacheTag("post_list");
cacheTag("postList");

// ✅ 好: 统一的命名风格
cacheTag("posts");
cacheTag("post-list");
cacheTag("post-detail");
cacheTag(`post-${id}`);
```

### 6.2 性能考虑

#### 避免过度使用标签

```typescript
// ❌ 不好: 使用太多标签
cacheTag(
  "content",
  "posts",
  "blog",
  "articles",
  "published",
  "featured",
  `post-${id}`,
  `author-${authorId}`,
  `category-${categoryId}`,
  `tag-${tag1}`,
  `tag-${tag2}`
);

// ✅ 好: 使用必要的标签
cacheTag("posts", `post-${id}`, `author-${authorId}`);
```

#### 合理组织标签层级

```typescript
// 建立清晰的标签层级
// 第一层: 资源类型
cacheTag("posts");

// 第二层: 资源分类
cacheTag("posts", "blog-posts");

// 第三层: 具体资源
cacheTag("posts", "blog-posts", `post-${id}`);
```

### 6.3 失效策略

#### 精确失效

```typescript
// ❌ 不好: 失效过多缓存
export async function updatePost(postId: string) {
  await savePost(postId);
  revalidateTag("posts"); // 失效所有文章缓存
}

// ✅ 好: 只失效相关缓存
export async function updatePost(postId: string) {
  await savePost(postId);
  revalidateTag(`post-${postId}`); // 只失效特定文章
}

async function savePost(id: string) {
  console.log(`Saving post ${id}`);
}
```

#### 批量失效

```typescript
// 需要失效多个相关缓存时
export async function publishPost(postId: string) {
  await updatePostStatus(postId, "published");

  // 失效多个相关缓存
  revalidateTag(`post-${postId}`);
  revalidateTag("post-list");
  revalidateTag("recent-posts");
}

async function updatePostStatus(id: string, status: string) {
  console.log(`Updating post ${id} to ${status}`);
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: cacheTag 和 revalidateTag 必须配对使用吗?

**问题**: 是否每个 `cacheTag` 都需要对应的 `revalidateTag`?

**简短回答**: 不是必须的,但通常会配对使用。

**详细解释**:

`cacheTag` 用于标记缓存,`revalidateTag` 用于失效缓存。如果数据永远不需要更新,可以只使用 `cacheTag` 而不使用 `revalidateTag`。但大多数情况下,数据会更新,所以会配对使用。

**代码示例**:

```typescript
// 只使用 cacheTag (静态数据)
export default async function StaticPage() {
  "use cache";
  cacheTag("static-content");

  const data = await fetchStaticData();
  return <div>{data}</div>;
}

// 配对使用 (动态数据)
export default async function DynamicPage() {
  "use cache";
  cacheTag("dynamic-content");

  const data = await fetchDynamicData();
  return <div>{data}</div>;
}

// 更新时失效
export async function updateContent() {
  "use server";
  await saveContent();
  revalidateTag("dynamic-content");
}

async function fetchStaticData() {
  return "Static";
}

async function fetchDynamicData() {
  return "Dynamic";
}

async function saveContent() {
  console.log("Saving");
}
```

#### 问题二: 可以使用通配符失效标签吗?

**问题**: `revalidateTag` 支持通配符吗,比如 `revalidateTag('post-*')`?

**简短回答**: 不支持,标签名称必须完全匹配。

**详细解释**:

`revalidateTag` 不支持通配符或正则表达式。如果需要失效多个标签,必须多次调用 `revalidateTag`。

**代码示例**:

```typescript
// ❌ 不支持: 使用通配符
revalidateTag("post-*"); // 不会工作

// ✅ 正确: 使用通用标签
cacheTag("posts", `post-${id}`);
revalidateTag("posts"); // 失效所有文章

// ✅ 正确: 多次调用
revalidateTag(`post-${id1}`);
revalidateTag(`post-${id2}`);
revalidateTag(`post-${id3}`);
```

#### 问题三: 标签名称有长度限制吗?

**问题**: 标签名称可以有多长?

**简短回答**: 没有明确的长度限制,但建议保持简短。

**详细解释**:

虽然没有明确的长度限制,但标签名称应该保持简短和有意义。过长的标签名称会影响性能和可读性。

**代码示例**:

```typescript
// ❌ 不好: 标签名称过长
cacheTag("this-is-a-very-long-tag-name-that-describes-everything-in-detail");

// ✅ 好: 简短有意义的标签名
cacheTag("posts");
cacheTag(`post-${id}`);
cacheTag("user-profile");
```

### 7.2 进阶问题

#### 问题四: 如何调试标签缓存?

**问题**: 怎样确认标签缓存是否正常工作?

**简短回答**: 使用日志记录缓存失效和数据获取。

**详细解释**:

可以在数据获取函数和缓存失效函数中添加日志,跟踪缓存的使用情况。

**代码示例**:

```typescript
// 数据获取时记录日志
export default async function Page() {
  "use cache";
  cacheTag("debug-data");

  console.log("[Cache] Fetching data with tag: debug-data");
  const data = await fetchData();

  return <div>{data}</div>;
}

// 失效时记录日志
export async function updateData() {
  "use server";

  console.log("[Cache] Invalidating tag: debug-data");
  revalidateTag("debug-data");

  console.log("[Cache] Tag invalidated");
}

async function fetchData() {
  const timestamp = new Date().toISOString();
  console.log("[Cache] Data fetched at:", timestamp);
  return `Data at ${timestamp}`;
}
```

#### 问题五: 标签缓存和路径缓存哪个更好?

**问题**: 应该使用 `cacheTag` 还是 `revalidatePath`?

**简短回答**: 根据场景选择,标签更灵活,路径更简单。

**详细解释**:

`cacheTag` 适合数据被多个页面使用的场景,`revalidatePath` 适合单个页面的场景。

**对比表格**:

| 特性     | cacheTag   | revalidatePath |
| :------- | :--------- | :------------- |
| 灵活性   | 高         | 低             |
| 精确度   | 高         | 中             |
| 复杂度   | 中         | 低             |
| 适用场景 | 跨页面数据 | 单页面数据     |

**代码示例**:

```typescript
// 使用 cacheTag - 数据被多个页面使用
export default async function PostsPage() {
  "use cache";
  cacheTag("posts");
  const posts = await fetchPosts();
  return <div>{posts.length} posts</div>;
}

export default async function FeaturedPostsPage() {
  "use cache";
  cacheTag("posts");
  const posts = await fetchFeaturedPosts();
  return <div>{posts.length} featured</div>;
}

// 更新时一次失效所有
export async function createPost() {
  "use server";
  await savePost();
  revalidateTag("posts"); // 失效两个页面
}

// 使用 revalidatePath - 单个页面
export async function updatePage() {
  "use server";
  await saveData();
  revalidatePath("/posts"); // 只失效一个页面
}

async function fetchPosts() {
  return [];
}

async function fetchFeaturedPosts() {
  return [];
}

async function savePost() {
  console.log("Saving");
}

async function saveData() {
  console.log("Saving");
}
```

## 8. 总结

### 8.1 核心要点回顾

**cacheTag 的主要特点**:

- 为缓存数据打上语义化标签
- 支持多个标签
- 通过标签批量失效缓存
- 跨页面和组件使用

**使用流程**:

1. 使用 `cacheTag()` 为缓存打标签
2. 数据更新时使用 `revalidateTag()` 失效标签
3. Next.js 自动重新获取数据

### 8.2 关键收获

1. **标签化管理**: 使用标签组织和管理缓存
2. **批量失效**: 一个标签可以失效多个缓存
3. **精确控制**: 可以精确控制哪些缓存失效
4. **灵活应用**: 适合跨页面的数据缓存场景
5. **易于维护**: 标签化的方式更直观易懂

### 8.3 最佳实践

1. **使用描述性标签名**: 标签名称应该清晰表达含义
2. **建立标签层级**: 使用层级标签系统组织缓存
3. **精确失效**: 只失效需要更新的缓存
4. **保持一致性**: 统一的标签命名风格
5. **记录日志**: 在开发环境记录缓存操作日志

### 8.4 下一步学习

- **revalidateTag**: 深入学习标签失效机制
- **cacheLife**: 了解缓存生命周期配置
- **revalidatePath**: 学习路径缓存失效
- **缓存策略**: 掌握完整的缓存管理策略

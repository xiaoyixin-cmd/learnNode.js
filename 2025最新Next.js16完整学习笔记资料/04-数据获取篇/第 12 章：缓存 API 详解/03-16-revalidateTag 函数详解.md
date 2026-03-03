**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# revalidateTag 函数详解

## 1. 概述与背景

### 1.1 什么是 revalidateTag

`revalidateTag` 是 Next.js 提供的一个函数,用于按标签重新验证缓存数据。与 `revalidatePath` 按路径重新验证不同,`revalidateTag` 可以重新验证所有带有指定标签的缓存,无论这些缓存在哪个页面或组件中。

`revalidateTag` 的核心特点:

- **标签化管理**: 通过标签组织缓存
- **跨页面重新验证**: 一次调用影响多个页面
- **灵活控制**: 精确控制需要更新的数据
- **解耦设计**: 数据更新与页面路径解耦

### 1.2 为什么需要 revalidateTag

在实际应用中,同一份数据可能在多个页面中使用。如果使用 `revalidatePath`,需要逐个重新验证每个页面。而 `revalidateTag` 可以通过标签一次性重新验证所有相关缓存。

`revalidateTag` 的优势:

- **批量更新**: 一次调用更新多个页面
- **维护简单**: 不需要知道所有使用数据的页面
- **逻辑清晰**: 按数据类型而非页面路径组织
- **扩展性好**: 新页面使用相同标签自动生效

### 1.3 revalidateTag 的工作原理

`revalidateTag` 的执行流程:

1. **标记缓存**: 在获取数据时使用 `cacheTag` 或 `next.tags` 标记
2. **调用函数**: 数据变更后调用 `revalidateTag(tag)`
3. **清除缓存**: Next.js 清除所有带该标签的缓存
4. **重新获取**: 下次请求时重新获取数据

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  // 更新产品数据
  await saveProduct(id, data);

  // 重新验证所有带 'products' 标签的缓存
  revalidateTag("products");

  // 重新验证特定产品的缓存
  revalidateTag(`product-${id}`);

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

## 2. 核心概念

### 2.1 基本用法

#### 在 fetch 中使用标签

```typescript
// app/lib/data.ts
export async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: {
      tags: ["products"], // 标记缓存
    },
  });

  return res.json();
}

// app/actions/products.ts
("use server");

import { revalidateTag } from "next/cache";

export async function createProduct(data: any) {
  await saveProduct(data);

  // 重新验证所有带 'products' 标签的缓存
  revalidateTag("products");

  return { success: true };
}

async function saveProduct(data: any) {
  console.log("Product saved:", data);
}
```

#### 使用 cacheTag 函数

```typescript
// app/lib/data.ts
import { cacheTag } from "next/cache";

export async function getProduct(id: string) {
  "use cache";
  cacheTag(`product-${id}`, "products");

  const res = await fetch(`https://api.example.com/products/${id}`);
  return res.json();
}

// app/actions/products.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 重新验证特定产品
  revalidateTag(`product-${id}`);

  // 也重新验证所有产品
  revalidateTag("products");

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product updated:", id, data);
}
```

### 2.2 标签命名策略

#### 单一标签

```typescript
// app/lib/data.ts
export async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: {
      tags: ["posts"],
    },
  });

  return res.json();
}
```

#### 多个标签

```typescript
// app/lib/data.ts
export async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: {
      tags: ["posts", `post-${id}`, "content"],
    },
  });

  return res.json();
}
```

#### 层级标签

```typescript
// app/lib/data.ts
export async function getCategoryProducts(categoryId: string) {
  const res = await fetch(
    `https://api.example.com/categories/${categoryId}/products`,
    {
      next: {
        tags: [
          "products",
          `category-${categoryId}`,
          `category-${categoryId}-products`,
        ],
      },
    }
  );

  return res.json();
}
```

### 2.3 使用场景

#### 内容更新

```typescript
// app/actions/content.ts
"use server";

import { revalidateTag } from "next/cache";

export async function publishPost(id: string) {
  await updatePostStatus(id, "published");

  // 重新验证所有文章相关缓存
  revalidateTag("posts");
  revalidateTag(`post-${id}`);

  return { success: true };
}

async function updatePostStatus(id: string, status: string) {
  console.log("Post status updated:", id, status);
}
```

#### 用户数据更新

```typescript
// app/actions/user.ts
"use server";

import { revalidateTag } from "next/cache";

export async function updateUserProfile(userId: string, data: any) {
  await saveUserProfile(userId, data);

  // 重新验证用户相关缓存
  revalidateTag(`user-${userId}`);
  revalidateTag("users");

  return { success: true };
}

async function saveUserProfile(userId: string, data: any) {
  console.log("User profile saved:", userId, data);
}
```

## 3. 适用场景

### 3.1 电商应用

#### 产品管理

```typescript
// app/lib/products.ts
export async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: {
      tags: ["products", `product-${id}`],
    },
  });

  return res.json();
}

export async function getProductsByCategory(categoryId: string) {
  const res = await fetch(
    `https://api.example.com/categories/${categoryId}/products`,
    {
      next: {
        tags: ["products", `category-${categoryId}`],
      },
    }
  );

  return res.json();
}

// app/actions/products.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  const oldProduct = await getOldProduct(id);
  await saveProduct(id, data);

  // 重新验证产品缓存
  revalidateTag(`product-${id}`);
  revalidateTag("products");

  // 如果分类变化,重新验证旧分类和新分类
  if (oldProduct.categoryId !== data.categoryId) {
    revalidateTag(`category-${oldProduct.categoryId}`);
    revalidateTag(`category-${data.categoryId}`);
  }

  return { success: true };
}

async function getOldProduct(id: string) {
  return { id, categoryId: "1" };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

#### 库存管理

```typescript
// app/lib/inventory.ts
export async function getInventory(productId: string) {
  const res = await fetch(`https://api.example.com/inventory/${productId}`, {
    next: {
      tags: ["inventory", `inventory-${productId}`, `product-${productId}`],
    },
  });

  return res.json();
}

// app/actions/inventory.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateInventory(productId: string, quantity: number) {
  await saveInventory(productId, quantity);

  // 重新验证库存缓存
  revalidateTag(`inventory-${productId}`);

  // 也重新验证产品缓存(可能显示库存状态)
  revalidateTag(`product-${productId}`);

  return { success: true };
}

async function saveInventory(productId: string, quantity: number) {
  console.log("Inventory updated:", productId, quantity);
}
```

#### 订单处理

```typescript
// app/lib/orders.ts
export async function getOrder(orderId: string) {
  const res = await fetch(`https://api.example.com/orders/${orderId}`, {
    next: {
      tags: ["orders", `order-${orderId}`],
    },
  });

  return res.json();
}

export async function getUserOrders(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/orders`, {
    next: {
      tags: ["orders", `user-${userId}-orders`],
    },
  });

  return res.json();
}

// app/actions/orders.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const order = await getOrderData(orderId);
  await saveOrderStatus(orderId, status);

  // 重新验证订单缓存
  revalidateTag(`order-${orderId}`);

  // 重新验证用户订单列表
  revalidateTag(`user-${order.userId}-orders`);

  // 重新验证所有订单
  revalidateTag("orders");

  return { success: true };
}

async function getOrderData(orderId: string) {
  return { id: orderId, userId: "1" };
}

async function saveOrderStatus(orderId: string, status: string) {
  console.log("Order status updated:", orderId, status);
}
```

### 3.2 内容管理系统

#### 文章管理

```typescript
// app/lib/posts.ts
export async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: {
      tags: ["posts", `post-${id}`, "content"],
    },
  });

  return res.json();
}

export async function getPostsByAuthor(authorId: string) {
  const res = await fetch(`https://api.example.com/authors/${authorId}/posts`, {
    next: {
      tags: ["posts", `author-${authorId}-posts`],
    },
  });

  return res.json();
}

// app/actions/posts.ts
("use server");

import { revalidateTag } from "next/cache";

export async function publishPost(id: string) {
  const post = await getPostData(id);
  await updatePostStatus(id, "published");

  // 重新验证文章缓存
  revalidateTag(`post-${id}`);
  revalidateTag("posts");
  revalidateTag("content");

  // 重新验证作者文章列表
  revalidateTag(`author-${post.authorId}-posts`);

  return { success: true };
}

async function getPostData(id: string) {
  return { id, authorId: "1" };
}

async function updatePostStatus(id: string, status: string) {
  console.log("Post status updated:", id, status);
}
```

#### 评论管理

```typescript
// app/lib/comments.ts
export async function getComments(postId: string) {
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`, {
    next: {
      tags: ["comments", `post-${postId}-comments`],
    },
  });

  return res.json();
}

// app/actions/comments.ts
("use server");

import { revalidateTag } from "next/cache";

export async function addComment(
  postId: string,
  userId: string,
  content: string
) {
  await saveComment(postId, userId, content);

  // 重新验证评论缓存
  revalidateTag(`post-${postId}-comments`);
  revalidateTag("comments");

  // 也重新验证文章缓存(可能显示评论数)
  revalidateTag(`post-${postId}`);

  return { success: true };
}

async function saveComment(postId: string, userId: string, content: string) {
  console.log("Comment saved:", postId, userId, content);
}
```

### 3.3 社交应用

#### 用户动态

```typescript
// app/lib/feed.ts
export async function getUserFeed(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/feed`, {
    next: {
      tags: ["feed", `user-${userId}-feed`],
    },
  });

  return res.json();
}

export async function getPost(postId: string) {
  const res = await fetch(`https://api.example.com/posts/${postId}`, {
    next: {
      tags: ["posts", `post-${postId}`],
    },
  });

  return res.json();
}

// app/actions/social.ts
("use server");

import { revalidateTag } from "next/cache";

export async function createPost(userId: string, content: string) {
  const post = await savePost(userId, content);

  // 重新验证用户动态流
  revalidateTag(`user-${userId}-feed`);

  // 重新验证所有动态
  revalidateTag("feed");
  revalidateTag("posts");

  return { success: true, postId: post.id };
}

async function savePost(userId: string, content: string) {
  return { id: "1", userId, content };
}
```

#### 关注关系

```typescript
// app/lib/follow.ts
export async function getFollowers(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/followers`, {
    next: {
      tags: ["followers", `user-${userId}-followers`],
    },
  });

  return res.json();
}

export async function getFollowing(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/following`, {
    next: {
      tags: ["following", `user-${userId}-following`],
    },
  });

  return res.json();
}

// app/actions/follow.ts
("use server");

import { revalidateTag } from "next/cache";

export async function followUser(userId: string, targetUserId: string) {
  await saveFollow(userId, targetUserId);

  // 重新验证关注列表
  revalidateTag(`user-${userId}-following`);

  // 重新验证被关注者的粉丝列表
  revalidateTag(`user-${targetUserId}-followers`);

  return { success: true };
}

async function saveFollow(userId: string, targetUserId: string) {
  console.log("Follow saved:", userId, targetUserId);
}
```

### 3.4 数据分析

#### 统计数据

```typescript
// app/lib/analytics.ts
export async function getAnalytics(type: string) {
  const res = await fetch(`https://api.example.com/analytics/${type}`, {
    next: {
      tags: ["analytics", `analytics-${type}`],
      revalidate: 3600, // 1小时
    },
  });

  return res.json();
}

// app/actions/analytics.ts
("use server");

import { revalidateTag } from "next/cache";

export async function refreshAnalytics(type?: string) {
  if (type) {
    // 重新验证特定类型的统计
    revalidateTag(`analytics-${type}`);
  } else {
    // 重新验证所有统计
    revalidateTag("analytics");
  }

  return { success: true };
}
```

## 4. API 签名与配置

### 4.1 函数签名

```typescript
import { revalidateTag } from "next/cache";

function revalidateTag(tag: string): void;
```

### 4.2 参数说明

#### tag 参数

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function examples() {
  // 简单标签
  revalidateTag("posts");

  // 带 ID 的标签
  revalidateTag("post-123");

  // 层级标签
  revalidateTag("category-tech-products");

  // 用户相关标签
  revalidateTag("user-456-orders");
}
```

### 4.3 使用限制

#### 只能在服务端使用

```typescript
// ✅ 正确: 在 Server Action 中使用
"use server";

import { revalidateTag } from "next/cache";

export async function updateData() {
  await saveData();
  revalidateTag("data");
}

// ✅ 正确: 在 API 路由中使用
import { revalidateTag } from "next/cache";

export async function POST() {
  await saveData();
  revalidateTag("data");
  return Response.json({ success: true });
}

// ❌ 错误: 在客户端组件中使用
("use client");

import { revalidateTag } from "next/cache";

export default function ClientComponent() {
  const handleClick = () => {
    // revalidateTag('data'); // 不能在客户端使用
  };

  return <button onClick={handleClick}>Update</button>;
}

async function saveData() {
  console.log("Data saved");
}
```

## 5. 基础与进阶使用

### 5.1 基础用法

#### 简单的标签重新验证

```typescript
// app/lib/data.ts
export async function getData() {
  const res = await fetch("https://api.example.com/data", {
    next: {
      tags: ["data"],
    },
  });

  return res.json();
}

// app/actions/data.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateData() {
  await saveData();

  // 重新验证所有带 'data' 标签的缓存
  revalidateTag("data");

  return { success: true };
}

async function saveData() {
  console.log("Data saved");
}
```

#### 多个标签重新验证

```typescript
// app/actions/multi.ts
"use server";

import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 重新验证多个相关标签
  revalidateTag(`product-${id}`);
  revalidateTag("products");
  revalidateTag("catalog");

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

### 5.2 进阶用法

#### 条件标签重新验证

```typescript
// app/actions/conditional.ts
"use server";

import { revalidateTag } from "next/cache";

export async function updatePost(id: string, data: any) {
  const oldPost = await getPost(id);
  await savePost(id, data);

  // 总是重新验证文章标签
  revalidateTag(`post-${id}`);
  revalidateTag("posts");

  // 如果分类变化,重新验证分类标签
  if (oldPost.category !== data.category) {
    revalidateTag(`category-${oldPost.category}`);
    revalidateTag(`category-${data.category}`);
  }

  // 如果状态变为已发布,重新验证首页
  if (oldPost.status !== "published" && data.status === "published") {
    revalidateTag("homepage");
  }

  return { success: true };
}

async function getPost(id: string) {
  return { id, category: "tech", status: "draft" };
}

async function savePost(id: string, data: any) {
  console.log("Post saved:", id, data);
}
```

#### 批量标签重新验证

```typescript
// app/actions/batch.ts
"use server";

import { revalidateTag } from "next/cache";

export async function batchUpdateProducts(
  updates: Array<{ id: string; data: any }>
) {
  // 批量更新
  await Promise.all(updates.map((u) => updateProduct(u.id, u.data)));

  // 收集需要重新验证的标签
  const tagsToRevalidate = new Set<string>();

  updates.forEach((u) => {
    tagsToRevalidate.add(`product-${u.id}`);
    if (u.data.category) {
      tagsToRevalidate.add(`category-${u.data.category}`);
    }
  });

  // 批量重新验证
  tagsToRevalidate.forEach((tag) => {
    revalidateTag(tag);
  });

  // 重新验证通用标签
  revalidateTag("products");

  return { success: true };
}

async function updateProduct(id: string, data: any) {
  console.log("Product updated:", id, data);
}
```

#### 层级标签系统

```typescript
// app/lib/products.ts
export async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: {
      tags: [
        "products", // 所有产品
        `product-${id}`, // 特定产品
        `brand-${res.brandId}`, // 品牌
        `category-${res.categoryId}`, // 分类
      ],
    },
  });

  return res.json();
}

// app/actions/hierarchy.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateBrand(brandId: string, data: any) {
  await saveBrand(brandId, data);

  // 重新验证品牌相关的所有缓存
  revalidateTag(`brand-${brandId}`);

  // 也重新验证所有产品(品牌信息可能在产品中显示)
  revalidateTag("products");

  return { success: true };
}

export async function updateCategory(categoryId: string, data: any) {
  await saveCategory(categoryId, data);

  // 重新验证分类相关的所有缓存
  revalidateTag(`category-${categoryId}`);

  return { success: true };
}

async function saveBrand(brandId: string, data: any) {
  console.log("Brand saved:", brandId, data);
}

async function saveCategory(categoryId: string, data: any) {
  console.log("Category saved:", categoryId, data);
}
```

#### 与 unstable_cache 配合

```typescript
// app/lib/cache.ts
import { unstable_cache } from "next/cache";

export const getCachedProducts = unstable_cache(
  async () => {
    const res = await fetch("https://api.example.com/products");
    return res.json();
  },
  ["products-list"],
  {
    tags: ["products"],
  }
);

export const getCachedProduct = (id: string) =>
  unstable_cache(
    async () => {
      const res = await fetch(`https://api.example.com/products/${id}`);
      return res.json();
    },
    [`product-${id}`],
    {
      tags: ["products", `product-${id}`],
    }
  )();

// app/actions/cache.ts
("use server");

import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 重新验证 unstable_cache 缓存
  revalidateTag(`product-${id}`);
  revalidateTag("products");

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

#### 与 revalidatePath 配合

```typescript
// app/actions/combined.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 使用标签重新验证数据缓存
  revalidateTag(`product-${id}`);
  revalidateTag("products");

  // 使用路径重新验证页面缓存
  revalidatePath(`/products/${id}`);
  revalidatePath("/products");

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

## 6. 注意事项

### 6.1 标签命名规范

#### 使用一致的命名

```typescript
// ✅ 好: 一致的命名规范
"use server";

import { revalidateTag } from "next/cache";

export async function goodNaming() {
  // 使用统一的格式
  revalidateTag("products");
  revalidateTag("product-123");
  revalidateTag("category-tech");
  revalidateTag("user-456-orders");
}

// ❌ 不好: 不一致的命名
export async function badNaming() {
  // 格式混乱
  revalidateTag("products");
  revalidateTag("Product_123");
  revalidateTag("category:tech");
  revalidateTag("UserOrders-456");
}
```

#### 避免标签冲突

```typescript
// ✅ 好: 明确的标签名称
"use server";

import { revalidateTag } from "next/cache";

export async function goodTags() {
  revalidateTag("blog-posts");
  revalidateTag("forum-posts");
  revalidateTag("social-posts");
}

// ❌ 不好: 可能冲突的标签
export async function badTags() {
  revalidateTag("posts"); // 太宽泛,可能影响多个模块
}
```

### 6.2 性能考虑

#### 避免过度重新验证

```typescript
"use server";

import { revalidateTag } from "next/cache";

// ❌ 不好: 过度重新验证
export async function badExample() {
  await updateData();

  // 重新验证所有内容
  revalidateTag("content");
  revalidateTag("data");
  revalidateTag("cache");
}

// ✅ 好: 精确重新验证
export async function goodExample(id: string) {
  await updateData();

  // 只重新验证需要的标签
  revalidateTag(`item-${id}`);
  revalidateTag("items");
}

async function updateData() {
  console.log("Data updated");
}
```

#### 批量操作优化

```typescript
"use server";

import { revalidateTag } from "next/cache";

// ❌ 不好: 每次更新都重新验证
export async function badBatch(ids: string[]) {
  for (const id of ids) {
    await updateItem(id);
    revalidateTag(`item-${id}`);
    revalidateTag("items"); // 重复调用
  }
}

// ✅ 好: 批量更新后统一重新验证
export async function goodBatch(ids: string[]) {
  // 先完成所有更新
  await Promise.all(ids.map((id) => updateItem(id)));

  // 然后统一重新验证
  ids.forEach((id) => revalidateTag(`item-${id}`));
  revalidateTag("items"); // 只调用一次
}

async function updateItem(id: string) {
  console.log("Item updated:", id);
}
```

### 6.3 标签管理

#### 集中管理标签

```typescript
// app/lib/cache-tags.ts
export const CACHE_TAGS = {
  PRODUCTS: "products",
  PRODUCT: (id: string) => `product-${id}`,
  CATEGORY: (id: string) => `category-${id}`,
  USER: (id: string) => `user-${id}`,
  USER_ORDERS: (userId: string) => `user-${userId}-orders`,
} as const;

// app/actions/products.ts
("use server");

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 使用集中管理的标签
  revalidateTag(CACHE_TAGS.PRODUCT(id));
  revalidateTag(CACHE_TAGS.PRODUCTS);

  if (data.categoryId) {
    revalidateTag(CACHE_TAGS.CATEGORY(data.categoryId));
  }

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

### 6.4 错误处理

#### 捕获错误

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function safeUpdate(id: string, data: any) {
  try {
    await saveData(id, data);

    // 重新验证可能失败,但不应该影响主流程
    try {
      revalidateTag(`data-${id}`);
      revalidateTag("data");
    } catch (revalidateError) {
      console.error("Revalidation failed:", revalidateError);
      // 记录错误但不抛出
    }

    return { success: true };
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}

async function saveData(id: string, data: any) {
  console.log("Data saved:", id, data);
}
```

## 7. 常见问题

### 7.1 基础问题

#### 问题一: revalidateTag 和 revalidatePath 有什么区别?

**问题**: 什么时候用 `revalidateTag`,什么时候用 `revalidatePath`?

**简短回答**: `revalidateTag` 按数据标签重新验证,`revalidatePath` 按页面路径重新验证。

**详细解释**:

`revalidateTag` 适合重新验证跨多个页面的相同数据,`revalidatePath` 适合重新验证特定页面。

**对比表格**:

| 特性         | revalidateTag      | revalidatePath |
| :----------- | :----------------- | :------------- |
| 重新验证方式 | 按数据标签         | 按页面路径     |
| 适用场景     | 跨页面数据更新     | 特定页面更新   |
| 灵活性       | 高                 | 低             |
| 使用复杂度   | 需要预先标记       | 简单直接       |
| 影响范围     | 所有带该标签的缓存 | 指定路径的页面 |

**代码示例**:

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 使用 revalidateTag - 重新验证所有带该标签的缓存
  revalidateTag(`product-${id}`);
  revalidateTag("products");

  // 使用 revalidatePath - 重新验证特定页面
  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

#### 问题二: 如何给缓存添加标签?

**问题**: 怎么给数据缓存添加标签?

**简短回答**: 使用 `next.tags` 选项或 `cacheTag` 函数。

**详细解释**:

在 `fetch` 中使用 `next.tags` 选项,或在 `use cache` 中使用 `cacheTag` 函数。

**代码示例**:

```typescript
// 方法一: 在 fetch 中使用 next.tags
export async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: {
      tags: ["products", `product-${id}`],
    },
  });

  return res.json();
}

// 方法二: 使用 cacheTag 函数
import { cacheTag } from "next/cache";

export async function getProduct(id: string) {
  "use cache";
  cacheTag("products", `product-${id}`);

  const res = await fetch(`https://api.example.com/products/${id}`);
  return res.json();
}

// 方法三: 在 unstable_cache 中使用 tags
import { unstable_cache } from "next/cache";

export const getCachedProduct = (id: string) =>
  unstable_cache(
    async () => {
      const res = await fetch(`https://api.example.com/products/${id}`);
      return res.json();
    },
    [`product-${id}`],
    {
      tags: ["products", `product-${id}`],
    }
  )();
```

#### 问题三: revalidateTag 会立即生效吗?

**问题**: 调用 `revalidateTag` 后,缓存会立即清除吗?

**简短回答**: 是的,所有带该标签的缓存会立即清除。

**详细解释**:

`revalidateTag` 会立即清除所有带指定标签的缓存。下次请求这些数据时,会重新获取并缓存。

**代码示例**:

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function updateData() {
  console.log("1. 更新数据");
  await saveData();

  console.log("2. 重新验证标签");
  revalidateTag("data");
  // 所有带 'data' 标签的缓存立即清除

  console.log("3. 完成");
  // 下次请求时会重新获取数据

  return { success: true };
}

async function saveData() {
  console.log("Data saved");
}
```

### 7.2 进阶问题

#### 问题四: 如何设计标签系统?

**问题**: 怎么设计一个好的标签系统?

**简短回答**: 使用层级标签,从通用到具体。

**详细解释**:

设计标签系统时,应该考虑数据的层级关系,使用多个标签从通用到具体标记数据。

**代码示例**:

```typescript
// app/lib/cache-tags.ts
export const CACHE_TAGS = {
  // 通用标签
  ALL: "all",

  // 产品相关
  PRODUCTS: "products",
  PRODUCT: (id: string) => `product-${id}`,
  PRODUCT_CATEGORY: (categoryId: string) => `product-category-${categoryId}`,
  PRODUCT_BRAND: (brandId: string) => `product-brand-${brandId}`,

  // 用户相关
  USERS: "users",
  USER: (id: string) => `user-${id}`,
  USER_PROFILE: (id: string) => `user-${id}-profile`,
  USER_ORDERS: (id: string) => `user-${id}-orders`,

  // 订单相关
  ORDERS: "orders",
  ORDER: (id: string) => `order-${id}`,
} as const;

// app/lib/products.ts
import { CACHE_TAGS } from "./cache-tags";

export async function getProduct(
  id: string,
  categoryId: string,
  brandId: string
) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: {
      tags: [
        CACHE_TAGS.PRODUCTS, // 所有产品
        CACHE_TAGS.PRODUCT(id), // 特定产品
        CACHE_TAGS.PRODUCT_CATEGORY(categoryId), // 分类下的产品
        CACHE_TAGS.PRODUCT_BRAND(brandId), // 品牌下的产品
      ],
    },
  });

  return res.json();
}

// app/actions/products.ts
("use server");

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 重新验证特定产品
  revalidateTag(CACHE_TAGS.PRODUCT(id));

  // 重新验证所有产品
  revalidateTag(CACHE_TAGS.PRODUCTS);

  // 如果分类变化,重新验证相关分类
  if (data.categoryId) {
    revalidateTag(CACHE_TAGS.PRODUCT_CATEGORY(data.categoryId));
  }

  return { success: true };
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

#### 问题五: 可以一次重新验证多个标签吗?

**问题**: 如何一次性重新验证多个标签?

**简短回答**: 多次调用 `revalidateTag`,每次传入一个标签。

**详细解释**:

`revalidateTag` 每次只接受一个标签,需要重新验证多个标签时,多次调用即可。

**代码示例**:

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function updateProduct(id: string, data: any) {
  await saveProduct(id, data);

  // 方法一: 逐个调用
  revalidateTag(`product-${id}`);
  revalidateTag("products");
  revalidateTag("catalog");

  // 方法二: 使用数组和循环
  const tags = [`product-${id}`, "products", "catalog"];
  tags.forEach((tag) => revalidateTag(tag));

  // 方法三: 封装辅助函数
  revalidateTags([`product-${id}`, "products", "catalog"]);

  return { success: true };
}

function revalidateTags(tags: string[]) {
  tags.forEach((tag) => revalidateTag(tag));
}

async function saveProduct(id: string, data: any) {
  console.log("Product saved:", id, data);
}
```

## 8. 总结

### 8.1 核心要点回顾

**revalidateTag 的主要特点**:

- 按标签重新验证缓存
- 跨页面影响所有相关缓存
- 灵活的标签系统
- 解耦数据更新与页面路径

**使用流程**:

1. 在获取数据时添加标签
2. 数据更新后调用 `revalidateTag(tag)`
3. 所有带该标签的缓存立即清除
4. 下次请求重新获取数据

### 8.2 关键收获

1. **标签化管理**: 通过标签组织和管理缓存
2. **跨页面更新**: 一次调用影响多个页面
3. **灵活控制**: 精确控制需要更新的数据
4. **解耦设计**: 数据更新与页面路径解耦
5. **层级系统**: 使用层级标签实现精细控制

### 8.3 最佳实践

1. **统一命名**: 使用一致的标签命名规范
2. **层级标签**: 从通用到具体设计标签
3. **集中管理**: 集中定义和管理标签常量
4. **精确重新验证**: 只重新验证需要的标签
5. **配合使用**: 与 revalidatePath 配合使用

### 8.4 下一步学习

- **revalidatePath**: 学习基于路径的缓存重新验证
- **cacheTag**: 掌握缓存标签函数
- **unstable_cache**: 了解函数级缓存
- **cacheLife**: 理解缓存生命周期管理

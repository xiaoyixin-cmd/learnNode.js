**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Server Actions 基础与进阶

## 1. 概述

Server Actions 是 Next.js 16 中的核心特性,允许你在服务端直接处理表单提交和数据变更,无需创建 API 路由。这是 React Server Components 的重要组成部分。

### 1.1 核心特性

- **服务端执行**: 代码在服务器上运行
- **类型安全**: 完整的 TypeScript 支持
- **自动序列化**: 自动处理数据传输
- **渐进增强**: 无 JavaScript 也能工作
- **内置验证**: 集成表单验证

### 1.2 与 API 路由对比

| 特性     | Server Actions     | API Routes   |
| -------- | ------------------ | ------------ |
| 代码位置 | 组件内或独立文件   | app/api 目录 |
| 类型安全 | 自动推导           | 需手动定义   |
| 表单集成 | 原生支持           | 需手动处理   |
| 渐进增强 | 支持               | 不支持       |
| 使用场景 | 表单提交、数据变更 | RESTful API  |

### 1.3 适用场景

- 表单提交
- 数据库操作
- 文件上传
- 第三方 API 调用
- 数据验证
- 用户认证

---

## 2. 基础用法

### 2.1 简单示例

```tsx
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.post.create({
    data: {
      title,
      content,
    },
  });

  revalidatePath("/posts");
}
```

```tsx
// app/page.tsx
import { createPost } from "./actions";

export default function Page() {
  return (
    <form action={createPost}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <button type="submit">创建文章</button>
    </form>
  );
}
```

### 2.2 内联 Server Action

```tsx
// app/page.tsx
export default function Page() {
  async function createPost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    await db.post.create({
      data: { title, content },
    });

    revalidatePath("/posts");
  }

  return (
    <form action={createPost}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <button type="submit">创建文章</button>
    </form>
  );
}
```

### 2.3 返回值处理

```tsx
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const post = await db.post.create({
    data: { title, content },
  });

  revalidatePath("/posts");

  return {
    success: true,
    postId: post.id,
  };
}
```

```tsx
// app/page.tsx
"use client";

import { createPost } from "./actions";
import { useFormState } from "react-dom";

export default function Page() {
  const [state, formAction] = useFormState(createPost, null);

  return (
    <form action={formAction}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <button type="submit">创建文章</button>
      {state?.success && <p>文章创建成功!</p>}
    </form>
  );
}
```

---

## 3. 高级用法

### 3.1 数据验证

```tsx
// app/actions.ts
"use server";

import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10),
  tags: z.array(z.string()).optional(),
});

export async function createPost(formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    content: formData.get("content"),
    tags: formData.getAll("tags"),
  };

  const validatedData = PostSchema.parse(rawData);

  const post = await db.post.create({
    data: validatedData,
  });

  revalidatePath("/posts");

  return { success: true, postId: post.id };
}
```

### 3.2 错误处理

```tsx
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) {
      return {
        success: false,
        error: "标题和内容不能为空",
      };
    }

    const post = await db.post.create({
      data: { title, content },
    });

    revalidatePath("/posts");

    return {
      success: true,
      postId: post.id,
    };
  } catch (error) {
    console.error("创建文章失败:", error);
    return {
      success: false,
      error: "创建文章失败,请稍后重试",
    };
  }
}
```

---

## 4. 高级用法

### 4.1 乐观更新

使用 useOptimistic 实现即时 UI 反馈:

```tsx
"use client";

import { useOptimistic } from "react";
import { addTodo } from "./actions";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function formAction(formData: FormData) {
    const title = formData.get("title") as string;

    // 立即更新UI
    addOptimisticTodo({
      id: Math.random().toString(),
      title,
      completed: false,
    });

    // 实际提交到服务器
    await addTodo(formData);
  }

  return (
    <form action={formAction}>
      <input name="title" />
      <button type="submit">添加</button>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </form>
  );
}
```

### 4.2 文件上传

处理文件上传:

```tsx
// app/actions.ts
"use server";

import { writeFile } from "fs/promises";
import { join } from "path";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "请选择文件" };
  }

  // 验证文件类型
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "不支持的文件类型" };
  }

  // 验证文件大小(5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "文件大小不能超过5MB" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), "public/uploads", filename);

    await writeFile(path, buffer);

    return {
      success: true,
      url: `/uploads/${filename}`,
    };
  } catch (error) {
    console.error("文件上传失败:", error);
    return { success: false, error: "文件上传失败" };
  }
}
```

### 4.3 批量操作

处理批量数据操作:

```tsx
// app/actions.ts
"use server";

export async function batchDeletePosts(postIds: string[]) {
  try {
    await db.post.deleteMany({
      where: {
        id: {
          in: postIds,
        },
      },
    });

    revalidatePath("/posts");

    return {
      success: true,
      deletedCount: postIds.length,
    };
  } catch (error) {
    console.error("批量删除失败:", error);
    return {
      success: false,
      error: "批量删除失败",
    };
  }
}
```

使用:

```tsx
"use client";

import { batchDeletePosts } from "./actions";

export function PostList({ posts }: { posts: Post[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function handleBatchDelete() {
    const result = await batchDeletePosts(selectedIds);
    if (result.success) {
      alert(`成功删除${result.deletedCount}篇文章`);
      setSelectedIds([]);
    }
  }

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <input
            type="checkbox"
            checked={selectedIds.includes(post.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds([...selectedIds, post.id]);
              } else {
                setSelectedIds(selectedIds.filter((id) => id !== post.id));
              }
            }}
          />
          {post.title}
        </div>
      ))}
      <button onClick={handleBatchDelete} disabled={selectedIds.length === 0}>
        删除选中({selectedIds.length})
      </button>
    </div>
  );
}
```

### 4.4 事务处理

使用数据库事务确保数据一致性:

```tsx
// app/actions.ts
"use server";

export async function transferMoney(
  fromUserId: string,
  toUserId: string,
  amount: number
) {
  try {
    await db.$transaction(async (tx) => {
      // 扣除发送方余额
      await tx.user.update({
        where: { id: fromUserId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // 增加接收方余额
      await tx.user.update({
        where: { id: toUserId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // 创建转账记录
      await tx.transaction.create({
        data: {
          fromUserId,
          toUserId,
          amount,
          type: "transfer",
        },
      });
    });

    revalidatePath("/transactions");

    return { success: true };
  } catch (error) {
    console.error("转账失败:", error);
    return { success: false, error: "转账失败" };
  }
}
```

### 4.5 权限验证

在 Server Action 中验证用户权限:

```tsx
// app/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function deletePost(postId: string) {
  // 验证用户登录
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // 验证文章所有权
  const post = await db.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return { success: false, error: "文章不存在" };
  }

  if (post.authorId !== session.user.id) {
    return { success: false, error: "无权删除此文章" };
  }

  // 执行删除
  await db.post.delete({
    where: { id: postId },
  });

  revalidatePath("/posts");

  return { success: true };
}
```

### 4.6 速率限制

防止滥用:

```tsx
// lib/rate-limit.ts
import { LRUCache } from "lru-cache";

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1分钟
});

export function checkRateLimit(identifier: string, limit: number = 10) {
  const count = (rateLimit.get(identifier) as number) || 0;

  if (count >= limit) {
    return false;
  }

  rateLimit.set(identifier, count + 1);
  return true;
}
```

```tsx
// app/actions.ts
"use server";

import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function sendEmail(formData: FormData) {
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // 检查速率限制
  if (!checkRateLimit(ip, 5)) {
    return {
      success: false,
      error: "请求过于频繁,请稍后再试",
    };
  }

  // 发送邮件逻辑
  // ...

  return { success: true };
}
```

### 4.7 缓存策略

使用 Next.js 缓存优化性能:

```tsx
// app/actions.ts
"use server";

import { unstable_cache } from "next/cache";

// 缓存数据库查询
const getCachedPosts = unstable_cache(
  async () => {
    return await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  },
  ["posts-list"],
  {
    revalidate: 60, // 60秒后重新验证
    tags: ["posts"],
  }
);

export async function getPosts() {
  return await getCachedPosts();
}

// 创建文章后清除缓存
export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.post.create({
    data: { title, content },
  });

  // 清除缓存
  revalidateTag("posts");

  return { success: true };
}
```

### 4.8 错误边界

处理 Server Action 错误:

```tsx
// app/error-boundary.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Server Action错误:", error);
  }, [error]);

  return (
    <div>
      <h2>出错了!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

```tsx
// app/actions.ts
"use server";

export async function riskyAction() {
  try {
    // 可能失败的操作
    await someRiskyOperation();
    return { success: true };
  } catch (error) {
    // 记录错误
    console.error("操作失败:", error);

    // 返回友好的错误信息
    if (error instanceof DatabaseError) {
      return { success: false, error: "数据库错误,请稍后重试" };
    }

    if (error instanceof ValidationError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "操作失败,请稍后重试" };
  }
}
```

---

## 5. 实战案例

### 5.1 用户注册

完整的用户注册流程:

```tsx
// app/actions.ts
"use server";

import { hash } from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少8个字符"),
  name: z.string().min(2, "姓名至少2个字符"),
});

export async function register(formData: FormData) {
  // 验证数据
  const validatedFields = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, name } = validatedFields.data;

  // 检查邮箱是否已存在
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["该邮箱已被注册"] },
    };
  }

  // 加密密码
  const hashedPassword = await hash(password, 10);

  // 创建用户
  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { success: true };
}
```

使用:

```tsx
"use client";

import { register } from "./actions";
import { useState } from "react";

export function RegisterForm() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    const result = await register(formData);

    if (!result.success) {
      setErrors(result.errors || {});
    } else {
      // 注册成功,跳转到登录页
      window.location.href = "/login";
    }
  }

  return (
    <form action={handleSubmit}>
      <div>
        <input name="email" type="email" placeholder="邮箱" />
        {errors.email && <p>{errors.email[0]}</p>}
      </div>
      <div>
        <input name="password" type="password" placeholder="密码" />
        {errors.password && <p>{errors.password[0]}</p>}
      </div>
      <div>
        <input name="name" placeholder="姓名" />
        {errors.name && <p>{errors.name[0]}</p>}
      </div>
      <button type="submit">注册</button>
    </form>
  );
}
```

### 5.2 购物车管理

```tsx
// app/actions.ts
"use server";

import { cookies } from "next/headers";

export async function addToCart(productId: string, quantity: number = 1) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "请先登录" };
  }

  try {
    // 检查商品是否存在
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "商品不存在" };
    }

    // 检查库存
    if (product.stock < quantity) {
      return { success: false, error: "库存不足" };
    }

    // 添加到购物车
    const cartItem = await db.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        quantity,
      },
    });

    revalidatePath("/cart");

    return {
      success: true,
      cartItem,
    };
  } catch (error) {
    console.error("添加到购物车失败:", error);
    return { success: false, error: "添加失败" };
  }
}

export async function removeFromCart(cartItemId: string) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "请先登录" };
  }

  try {
    await db.cartItem.delete({
      where: {
        id: cartItemId,
        userId: session.user.id,
      },
    });

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("删除失败:", error);
    return { success: false, error: "删除失败" };
  }
}
```

### 5.3 评论系统

```tsx
// app/actions.ts
"use server";

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "请先登录" };
  }

  // 验证内容
  if (!content || content.trim().length === 0) {
    return { success: false, error: "评论内容不能为空" };
  }

  if (content.length > 500) {
    return { success: false, error: "评论内容不能超过500字" };
  }

  try {
    const comment = await db.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    revalidatePath(`/posts/${postId}`);

    return {
      success: true,
      comment,
    };
  } catch (error) {
    console.error("创建评论失败:", error);
    return { success: false, error: "创建评论失败" };
  }
}
```

### 5.4 点赞功能

```tsx
// app/actions.ts
"use server";

export async function toggleLike(postId: string) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "请先登录" };
  }

  try {
    // 检查是否已点赞
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // 取消点赞
      await db.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      return {
        success: true,
        liked: false,
      };
    } else {
      // 添加点赞
      await db.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });

      return {
        success: true,
        liked: true,
      };
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
    return { success: false, error: "操作失败" };
  }
}
```

### 5.5 搜索功能

```tsx
// app/actions.ts
"use server";

export async function searchPosts(query: string, page: number = 1) {
  if (!query || query.trim().length === 0) {
    return { success: false, error: "搜索关键词不能为空" };
  }

  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.post.count({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      success: true,
      posts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("搜索失败:", error);
    return { success: false, error: "搜索失败" };
  }
}
```

---

## 6. 适用场景

### 6.1 表单提交

**需求**: 处理用户表单提交

**优势**:

- 无需创建 API 路由
- 自动处理 FormData
- 支持渐进增强
- 类型安全

### 6.2 数据变更

**需求**: 创建、更新、删除数据

**优势**:

- 直接访问数据库
- 自动重新验证缓存
- 事务支持
- 错误处理

### 6.3 文件上传

**需求**: 处理文件上传

**优势**:

- 服务端验证
- 安全性高
- 支持大文件
- 进度跟踪

### 6.4 第三方 API 调用

**需求**: 调用外部 API

**优势**:

- 隐藏 API 密钥
- 服务端执行
- 错误处理
- 速率限制

### 6.5 用户认证

**需求**: 登录、注册、权限验证

**优势**:

- 安全性高
- Session 管理
- 权限控制
- 密码加密

---

## 7. 注意事项

### 7.1 安全性

**永远不要信任客户端输入**:

```tsx
// ✗ 错误:直接使用用户输入
export async function deleteUser(userId: string) {
  await db.user.delete({ where: { id: userId } });
}

// ✓ 正确:验证权限
export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session || session.user.id !== userId) {
    throw new Error("无权删除");
  }
  await db.user.delete({ where: { id: userId } });
}
```

### 7.2 数据验证

**始终验证输入数据**:

```tsx
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
});

export async function updateProfile(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get("email"),
    age: Number(formData.get("age")),
  });

  if (!result.success) {
    return { success: false, errors: result.error.errors };
  }

  // 使用验证后的数据
  const { email, age } = result.data;
}
```

### 7.3 错误处理

**提供友好的错误信息**:

```tsx
export async function createPost(formData: FormData) {
  try {
    await db.post.create({
      /* ... */
    });
    return { success: true };
  } catch (error) {
    // 记录详细错误
    console.error("创建文章失败:", error);

    // 返回友好的错误信息
    return {
      success: false,
      error: "创建失败,请稍后重试",
    };
  }
}
```

### 7.4 性能优化

**避免 N+1 查询**:

```tsx
// ✗ 错误:N+1查询
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✓ 正确:使用include
const posts = await db.post.findMany({
  include: {
    author: true,
  },
});
```

### 7.5 缓存管理

**正确使用 revalidatePath 和 revalidateTag**:

```tsx
export async function createPost(formData: FormData) {
  await db.post.create({
    /* ... */
  });

  // 重新验证相关路径
  revalidatePath("/posts");
  revalidatePath("/");

  // 或使用标签
  revalidateTag("posts");
}
```

### 7.6 文件大小限制

**限制上传文件大小**:

```tsx
export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  // 限制5MB
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "文件大小不能超过5MB" };
  }

  // 处理上传
}
```

---

## 8. 常见问题

### 8.1 Server Action 不执行?

**问题**: 调用 Server Action 但没有执行。

**原因**:

1. 缺少'use server'指令
2. 函数没有导出
3. 客户端组件中直接定义

**解决方案**:

```tsx
// ✓ 正确:独立文件
// app/actions.ts
"use server";

export async function myAction() {
  // ...
}

// ✓ 正确:服务端组件中
export default async function Page() {
  "use server";

  async function myAction() {
    // ...
  }

  return <form action={myAction}>...</form>;
}
```

### 8.2 如何在客户端组件中使用?

**问题**: 客户端组件无法直接定义 Server Action。

**解决方案**:

```tsx
// app/actions.ts
"use server";

export async function myAction(formData: FormData) {
  // ...
}

// app/page.tsx
("use client");

import { myAction } from "./actions";

export default function Page() {
  return <form action={myAction}>...</form>;
}
```

### 8.3 如何传递额外参数?

**问题**: 除了 FormData,还需要传递其他参数。

**解决方案**:

```tsx
// 使用bind
"use client";

import { deletePost } from "./actions";

export function PostItem({ postId }: { postId: string }) {
  const deletePostWithId = deletePost.bind(null, postId);

  return (
    <form action={deletePostWithId}>
      <button type="submit">删除</button>
    </form>
  );
}
```

### 8.4 如何获取返回值?

**问题**: 需要根据 Server Action 的返回值更新 UI。

**解决方案**:

```tsx
"use client";

import { createPost } from "./actions";
import { useState } from "react";

export function CreatePostForm() {
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await createPost(formData);

    if (result.success) {
      setMessage("创建成功!");
    } else {
      setMessage(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <button type="submit">提交</button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### 8.5 如何处理文件上传?

**问题**: 上传文件到服务器。

**解决方案**:

```tsx
// app/actions.ts
"use server";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 保存文件
  await writeFile(`./uploads/${file.name}`, buffer);

  return { success: true };
}

// app/page.tsx
("use client");

export function UploadForm() {
  return (
    <form action={uploadFile}>
      <input type="file" name="file" />
      <button type="submit">上传</button>
    </form>
  );
}
```

### 8.6 如何实现乐观更新?

**问题**: 希望在服务器响应前更新 UI。

**解决方案**:

```tsx
"use client";

import { useOptimistic } from "react";
import { addTodo } from "./actions";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function formAction(formData: FormData) {
    const title = formData.get("title") as string;

    addOptimisticTodo({ id: crypto.randomUUID(), title, completed: false });
    await addTodo(formData);
  }

  return (
    <form action={formAction}>
      <input name="title" />
      <button type="submit">添加</button>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </form>
  );
}
```

### 8.7 如何显示加载状态?

**问题**: 提交表单时显示加载指示器。

**解决方案**:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "提交中..." : "提交"}
    </button>
  );
}

export function MyForm() {
  return (
    <form action={myAction}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

### 8.8 如何处理重定向?

**问题**: 提交成功后跳转到其他页面。

**解决方案**:

```tsx
// app/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    /* ... */
  });

  redirect(`/posts/${post.id}`);
}
```

### 8.9 如何验证用户权限?

**问题**: 确保只有授权用户可以执行操作。

**解决方案**:

```tsx
// app/actions.ts
"use server";

import { auth } from "@/lib/auth";

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session) {
    throw new Error("未登录");
  }

  const post = await db.post.findUnique({ where: { id: postId } });

  if (post.authorId !== session.user.id) {
    throw new Error("无权删除");
  }

  await db.post.delete({ where: { id: postId } });
}
```

### 8.10 如何测试 Server Actions?

**问题**: 如何编写测试。

**解决方案**:

```tsx
// __tests__/actions.test.ts
import { createPost } from "@/app/actions";

describe("createPost", () => {
  it("should create a post", async () => {
    const formData = new FormData();
    formData.append("title", "Test Post");
    formData.append("content", "Test Content");

    const result = await createPost(formData);

    expect(result.success).toBe(true);
    expect(result.postId).toBeDefined();
  });

  it("should validate input", async () => {
    const formData = new FormData();
    formData.append("title", "");

    const result = await createPost(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

## 9. 总结

### 9.1 核心要点

1. **'use server'指令**: 必须在文件或函数顶部声明
2. **类型安全**: 完整的 TypeScript 支持
3. **自动序列化**: 自动处理数据传输
4. **渐进增强**: 无 JavaScript 也能工作
5. **安全性**: 始终验证输入和权限

### 9.2 最佳实践

| 实践     | 说明                    | 优先级 |
| -------- | ----------------------- | ------ |
| 数据验证 | 使用 Zod 等库验证输入   | 高     |
| 权限检查 | 验证用户权限            | 高     |
| 错误处理 | 提供友好的错误信息      | 高     |
| 缓存管理 | 正确使用 revalidatePath | 中     |
| 性能优化 | 避免 N+1 查询           | 中     |
| 速率限制 | 防止滥用                | 中     |
| 乐观更新 | 提升用户体验            | 低     |

### 9.3 与 API Routes 对比

| 特性     | Server Actions        | API Routes              |
| -------- | --------------------- | ----------------------- |
| 使用场景 | 表单提交、数据变更    | RESTful API、第三方集成 |
| 代码位置 | 组件内或 actions 文件 | app/api 目录            |
| 类型安全 | 自动推导              | 需手动定义              |
| 表单集成 | 原生支持              | 需手动处理              |
| 渐进增强 | 支持                  | 不支持                  |
| 学习曲线 | 低                    | 中                      |

### 9.4 下一步

学习完 Server Actions 后,建议继续学习:

1. **useFormStatus Hook**: 显示表单提交状态
2. **useOptimistic Hook**: 实现乐观更新
3. **useActionState Hook**: 管理 Action 状态
4. **表单验证**: 使用 Zod、Yup 等库
5. **文件上传**: 处理大文件上传

Server Actions 是 Next.js 16 中最重要的特性之一,它简化了服务端数据处理,提供了更好的开发体验和用户体验。通过正确使用 Server Actions,你可以构建更安全、更高效的 Web 应用。

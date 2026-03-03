**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# serverActions 配置详解

## 概述

serverActions 是 Next.js 16 中用于配置服务器操作（Server Actions）行为的选项。Server Actions 允许在服务器端执行代码，无需创建 API 路由，简化了客户端与服务器的交互。通过合理配置 serverActions，可以控制其大小限制、安全性和性能。

### serverActions 的作用

1. **简化数据操作**：无需创建 API 路由
2. **类型安全**：完整的 TypeScript 支持
3. **自动序列化**：自动处理数据传输
4. **安全控制**：配置请求大小限制
5. **性能优化**：减少网络请求

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["localhost:3000"],
    },
  },
};
```

### 配置选项详解

| 选项             | 类型     | 默认值    | 说明           |
| ---------------- | -------- | --------- | -------------- |
| `bodySizeLimit`  | string   | '1mb'     | 请求体大小限制 |
| `allowedOrigins` | string[] | undefined | 允许的来源列表 |

### 创建 Server Action

```typescript
// app/actions.ts
"use server";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // 数据库操作
  const user = await db.user.create({
    data: { name, email },
  });

  return { success: true, user };
}
```

### 在组件中使用

```tsx
// app/page.tsx
import { createUser } from "./actions";

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

## 高级配置

### 配置请求大小限制

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      // 允许上传大文件
      bodySizeLimit: "10mb",
    },
  },
};
```

### 配置允许的来源

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "example.com", "*.example.com"],
    },
  },
};
```

### 带验证的 Server Action

```typescript
// app/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

export async function createUser(formData: FormData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    age: Number(formData.get("age")),
  };

  // 验证数据
  const result = userSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // 创建用户
  const user = await db.user.create({
    data: result.data,
  });

  // 重新验证缓存
  revalidatePath("/users");

  return { success: true, user };
}
```

### 带认证的 Server Action

```typescript
// app/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const post = await db.post.findUnique({
    where: { id: postId },
  });

  if (post.authorId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.post.delete({
    where: { id: postId },
  });

  revalidatePath("/posts");

  return { success: true };
}
```

### 乐观更新

```tsx
// app/todos/page.tsx
"use client";

import { useOptimistic } from "react";
import { addTodo } from "./actions";

export default function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;

    // 乐观更新
    addOptimisticTodo({ id: Date.now(), title, completed: false });

    // 服务器操作
    await addTodo(formData);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input name="title" required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 文件上传

```typescript
// app/actions.ts
"use server";

import { writeFile } from "fs/promises";
import { join } from "path";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const path = join(process.cwd(), "public", "uploads", file.name);
  await writeFile(path, buffer);

  return { success: true, path: `/uploads/${file.name}` };
}
```

```tsx
// app/upload/page.tsx
import { uploadFile } from "../actions";

export default function UploadPage() {
  return (
    <form action={uploadFile}>
      <input type="file" name="file" required />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### 批量操作

```typescript
// app/actions.ts
"use server";

export async function bulkDeletePosts(postIds: string[]) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.post.deleteMany({
    where: {
      id: { in: postIds },
      authorId: session.user.id,
    },
  });

  revalidatePath("/posts");

  return { success: true, count: postIds.length };
}
```

### 错误处理

```typescript
// app/actions.ts
"use server";

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const name = formData.get("name") as string;

    await db.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
```

### 进度反馈

```tsx
// app/page.tsx
"use client";

import { useFormStatus } from "react-dom";
import { createUser } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create User"}
    </button>
  );
}

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <SubmitButton />
    </form>
  );
}
```

### 返回重定向

```typescript
// app/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const post = await db.post.create({
    data: { title, content },
  });

  redirect(`/posts/${post.id}`);
}
```

## 实战案例

### 案例 1：用户注册表单

```typescript
// app/register/actions.ts
"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // 检查用户是否存在
  const existingUser = await db.user.findUnique({
    where: { email: result.data.email },
  });

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["Email already exists"] },
    };
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(result.data.password, 10);

  // 创建用户
  await db.user.create({
    data: {
      username: result.data.username,
      email: result.data.email,
      password: hashedPassword,
    },
  });

  redirect("/login");
}
```

```tsx
// app/register/page.tsx
"use client";

import { useFormState } from "react-dom";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, null);

  return (
    <form action={formAction}>
      <div>
        <input name="username" placeholder="Username" required />
        {state?.errors?.username && (
          <p className="error">{state.errors.username[0]}</p>
        )}
      </div>

      <div>
        <input name="email" type="email" placeholder="Email" required />
        {state?.errors?.email && (
          <p className="error">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        {state?.errors?.password && (
          <p className="error">{state.errors.password[0]}</p>
        )}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
```

### 案例 2：待办事项管理

```typescript
// app/todos/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;

  await db.todo.create({
    data: { title, completed: false },
  });

  revalidatePath("/todos");
}

export async function toggleTodo(id: string) {
  const todo = await db.todo.findUnique({
    where: { id },
  });

  await db.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });

  revalidatePath("/todos");
}

export async function deleteTodo(id: string) {
  await db.todo.delete({
    where: { id },
  });

  revalidatePath("/todos");
}
```

```tsx
// app/todos/page.tsx
import { addTodo, toggleTodo, deleteTodo } from "./actions";

async function getTodos() {
  return await db.todo.findMany();
}

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div>
      <form action={addTodo}>
        <input name="title" placeholder="New todo" required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <form action={toggleTodo.bind(null, todo.id)}>
              <button type="submit">{todo.completed ? "✓" : "○"}</button>
            </form>

            <span>{todo.title}</span>

            <form action={deleteTodo.bind(null, todo.id)}>
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 案例 3：博客评论系统

```typescript
// app/posts/[id]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(500),
  author: z.string().min(2),
});

export async function addComment(postId: string, formData: FormData) {
  const data = {
    content: formData.get("content"),
    author: formData.get("author"),
  };

  const result = commentSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await db.comment.create({
    data: {
      ...result.data,
      postId,
    },
  });

  revalidatePath(`/posts/${postId}`);

  return { success: true };
}

export async function deleteComment(commentId: string, postId: string) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (comment.authorId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  await db.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/posts/${postId}`);

  return { success: true };
}
```

```tsx
// app/posts/[id]/page.tsx
import { addComment } from "./actions";

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  const comments = await getComments(params.id);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      <h2>Comments</h2>

      <form action={addComment.bind(null, params.id)}>
        <input name="author" placeholder="Your name" required />
        <textarea name="content" placeholder="Your comment" required />
        <button type="submit">Add Comment</button>
      </form>

      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>{comment.author}</strong>
            <p>{comment.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 案例 4：购物车管理

```typescript
// app/cart/actions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addToCart(productId: string, quantity: number = 1) {
  const session = await auth();

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const cartItem = await db.cartItem.findFirst({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  if (cartItem) {
    await db.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity,
      },
    });
  }

  revalidatePath("/cart");

  return { success: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await db.cartItem.delete({
      where: { id: itemId },
    });
  } else {
    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  revalidatePath("/cart");

  return { success: true };
}

export async function removeFromCart(itemId: string) {
  await db.cartItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/cart");

  return { success: true };
}
```

## 适用场景

| 场景       | 是否使用 | 原因          |
| ---------- | -------- | ------------- |
| 表单提交   | 是       | 简化代码      |
| 数据变更   | 是       | 类型安全      |
| 文件上传   | 是       | 方便处理      |
| 认证操作   | 是       | 安全可靠      |
| 公开 API   | 否       | 使用 API 路由 |
| 第三方调用 | 否       | 需要 REST API |

## 注意事项

### 1. 安全性

```typescript
// 始终验证用户权限
"use server";

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const post = await db.post.findUnique({
    where: { id: postId },
  });

  if (post.authorId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await db.post.delete({
    where: { id: postId },
  });
}
```

### 2. 数据验证

```typescript
// 使用zod验证输入
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

export async function updateUser(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get("email"),
    age: Number(formData.get("age")),
  });

  if (!result.success) {
    return { errors: result.error.flatten() };
  }

  // 处理数据
}
```

### 3. 错误处理

```typescript
// 妥善处理错误
export async function createPost(formData: FormData) {
  try {
    // 操作
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed to create post" };
  }
}
```

### 4. 缓存重新验证

```typescript
// 及时更新缓存
import { revalidatePath, revalidateTag } from "next/cache";

export async function updatePost(id: string, data: any) {
  await db.post.update({
    where: { id },
    data,
  });

  revalidatePath(`/posts/${id}`);
  revalidateTag("posts");
}
```

### 5. 文件大小限制

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // 根据需求调整
    },
  },
};
```

## 常见问题

### 1. Server Action 不执行？

**问题**：表单提交后没有反应

**解决方案**：

```typescript
// 确保添加'use server'指令
"use server";

export async function myAction(formData: FormData) {
  // 代码
}
```

### 2. 如何获取表单数据？

**问题**：如何正确获取 FormData

**解决方案**：

```typescript
export async function handleForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const age = Number(formData.get("age"));
}
```

### 3. 如何返回错误信息？

**问题**：如何向客户端返回错误

**解决方案**：

```tsx
"use client";

import { useFormState } from "react-dom";

export default function Form() {
  const [state, formAction] = useFormState(myAction, null);

  return (
    <form action={formAction}>
      {state?.error && <p>{state.error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 4. 如何处理文件上传？

**问题**：上传文件失败

**解决方案**：

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};
```

```typescript
export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  // 保存文件
}
```

### 5. 如何实现乐观更新？

**问题**：需要即时 UI 反馈

**解决方案**：

```tsx
"use client";

import { useOptimistic } from "react";

export default function List({ items }) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (state, newItem) => [...state, newItem]
  );

  async function handleAdd(formData: FormData) {
    addOptimistic({ id: Date.now(), title: formData.get("title") });
    await addItem(formData);
  }

  return <form action={handleAdd}>...</form>;
}
```

### 6. 如何显示加载状态？

**问题**：需要显示提交进度

**解决方案**：

```tsx
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
  );
}
```

### 7. 如何重定向？

**问题**：提交后需要跳转

**解决方案**：

```typescript
'use server'

import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const post = await db.post.create({...})
  redirect(`/posts/${post.id}`)
}
```

### 8. 如何验证用户权限？

**问题**：需要检查用户身份

**解决方案**：

```typescript
"use server";

import { auth } from "@/lib/auth";

export async function deletePost(id: string) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  // 继续操作
}
```

### 9. 如何处理大量数据？

**问题**：提交数据超过限制

**解决方案**：

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};
```

### 10. 如何调试 Server Action？

**问题**：如何查看执行日志

**解决方案**：

```typescript
"use server";

export async function myAction(formData: FormData) {
  console.log("Action called with:", Object.fromEntries(formData));

  try {
    // 操作
  } catch (error) {
    console.error("Action error:", error);
    throw error;
  }
}
```

### 11. 如何传递额外参数？

**问题**：需要传递非表单数据

**解决方案**：

```tsx
import { deletePost } from "./actions";

export default function Post({ id }) {
  return (
    <form action={deletePost.bind(null, id)}>
      <button type="submit">Delete</button>
    </form>
  );
}
```

### 12. 如何处理并发请求？

**问题**：多次快速提交

**解决方案**：

```tsx
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      Submit
    </button>
  );
}
```

### 13. 如何更新缓存？

**问题**：数据变更后页面未更新

**解决方案**：

```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function updateData() {
  await db.update({...})
  revalidatePath('/data')
}
```

### 14. 如何处理复杂表单？

**问题**：多步骤表单处理

**解决方案**：

```tsx
"use client";

import { useState } from "react";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);

  async function handleSubmit(formData: FormData) {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await submitForm(formData);
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

### 15. 如何测试 Server Action？

**问题**：如何编写测试

**解决方案**：

```typescript
// __tests__/actions.test.ts
import { createUser } from "@/app/actions";

describe("createUser", () => {
  it("should create user", async () => {
    const formData = new FormData();
    formData.append("name", "John");
    formData.append("email", "john@example.com");

    const result = await createUser(formData);

    expect(result.success).toBe(true);
  });
});
```

## 总结

serverActions 配置是 Next.js 16 中简化服务器交互的重要功能。合理使用可以：

1. **简化开发**：无需创建 API 路由
2. **类型安全**：完整的 TypeScript 支持
3. **提升性能**：减少网络请求
4. **增强安全**：服务器端执行
5. **改善体验**：乐观更新和进度反馈

关键要点：

- 始终添加'use server'指令
- 验证所有输入数据
- 检查用户权限
- 妥善处理错误
- 及时更新缓存
- 配置合适的大小限制
- 使用乐观更新提升体验
- 显示加载状态
- 测试所有操作
- 注意安全性

记住：Server Actions 是为了简化开发，但不能替代所有 API 路由。对于需要公开访问的 API，仍然应该使用传统的 API 路由。合理选择使用场景，才能发挥最大价值。

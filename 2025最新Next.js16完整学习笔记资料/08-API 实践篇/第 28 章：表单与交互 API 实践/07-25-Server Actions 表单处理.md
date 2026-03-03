**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Server Actions 表单处理

Server Actions 是 Next.js 提供的服务端函数,可以直接在组件中调用,简化表单处理流程。

## 核心概念

### Server Actions 特点

| 特点       | 说明             | 优势       |
| ---------- | ---------------- | ---------- |
| 服务端执行 | 代码在服务器运行 | 安全性高   |
| 自动序列化 | 自动处理数据传输 | 使用简单   |
| 类型安全   | TypeScript 支持  | 开发体验好 |
| 渐进增强   | 无 JS 也能工作   | 可访问性好 |

## 实战场景一: 基础表单提交

### 简单表单

```typescript
// app/actions.ts
"use server";

export async function submitForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // 处理数据
  console.log({ name, email });

  return { success: true, message: "提交成功" };
}
```

### 使用 Server Action

```typescript
// app/form/page.tsx
import { submitForm } from "../actions";

export default function FormPage() {
  return (
    <form action={submitForm}>
      <input name="name" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      <button type="submit">提交</button>
    </form>
  );
}
```

## 实战场景二: 客户端调用

### 使用 useFormState

```typescript
"use client";

import { useFormState } from "react-dom";
import { submitForm } from "../actions";

const initialState = {
  message: "",
};

export default function ClientForm() {
  const [state, formAction] = useFormState(submitForm, initialState);

  return (
    <form action={formAction}>
      <input name="name" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      <button type="submit">提交</button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

### 使用 useFormStatus

```typescript
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

export default function FormWithStatus() {
  return (
    <form action={submitForm}>
      <input name="name" placeholder="姓名" required />
      <SubmitButton />
    </form>
  );
}
```

## 实战场景三: 数据验证

### Zod 验证

```typescript
"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("邮箱格式不正确"),
  age: z.number().min(18, "年龄必须大于18岁"),
});

export async function validateForm(formData: FormData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    age: Number(formData.get("age")),
  };

  try {
    const validated = schema.parse(data);
    // 处理验证通过的数据
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      };
    }
    return { success: false, message: "验证失败" };
  }
}
```

### 显示验证错误

```typescript
"use client";

import { useFormState } from "react-dom";
import { validateForm } from "../actions";

export default function ValidatedForm() {
  const [state, formAction] = useFormState(validateForm, null);

  return (
    <form action={formAction}>
      <div>
        <input name="name" placeholder="姓名" />
        {state?.errors?.find((e) => e.field === "name") && (
          <p className="error">
            {state.errors.find((e) => e.field === "name")?.message}
          </p>
        )}
      </div>

      <div>
        <input name="email" type="email" placeholder="邮箱" />
        {state?.errors?.find((e) => e.field === "email") && (
          <p className="error">
            {state.errors.find((e) => e.field === "email")?.message}
          </p>
        )}
      </div>

      <div>
        <input name="age" type="number" placeholder="年龄" />
        {state?.errors?.find((e) => e.field === "age") && (
          <p className="error">
            {state.errors.find((e) => e.field === "age")?.message}
          </p>
        )}
      </div>

      <button type="submit">提交</button>
    </form>
  );
}
```

## 实战场景四: 文件上传

### 处理文件上传

```typescript
"use server";

import { writeFile } from "fs/promises";
import { join } from "path";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, message: "请选择文件" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const path = join(process.cwd(), "public", "uploads", file.name);
  await writeFile(path, buffer);

  return { success: true, message: "上传成功", filename: file.name };
}
```

### 文件上传表单

```typescript
"use client";

import { useFormState } from "react-dom";
import { uploadFile } from "../actions";

export default function FileUploadForm() {
  const [state, formAction] = useFormState(uploadFile, null);

  return (
    <form action={formAction}>
      <input type="file" name="file" required />
      <button type="submit">上传</button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

## 实战场景五: 数据库操作

### 创建记录

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  try {
    await prisma.post.create({
      data: { title, content },
    });

    revalidatePath("/posts");

    return { success: true, message: "创建成功" };
  } catch (error) {
    return { success: false, message: "创建失败" };
  }
}
```

## 适用场景

| 场景       | 使用方式               | 优势     |
| ---------- | ---------------------- | -------- |
| 简单表单   | 直接使用 action        | 代码简洁 |
| 复杂验证   | Zod + Server Action    | 类型安全 |
| 文件上传   | FormData 处理          | 原生支持 |
| 数据库操作 | Prisma + Server Action | 安全可靠 |

## 注意事项

### 1. 安全性

```typescript
"use server";

import { auth } from "@/lib/auth";

export async function secureAction(formData: FormData) {
  const session = await auth();
  if (!session) {
    throw new Error("未授权");
  }

  const data = formData.get("data");
  if (!data || typeof data !== "string") {
    throw new Error("无效数据");
  }
}
```

### 2. 错误处理

```typescript
"use server";

export async function handleError(formData: FormData) {
  try {
    await someOperation();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "未知错误",
    };
  }
}
```

### 3. 数据重新验证

```typescript
"use server";

import { revalidatePath } from "next/cache";

export async function updateData(formData: FormData) {
  await updateDatabase();
  revalidatePath("/data");
  return { success: true };
}
```

### 4. 性能优化

```typescript
"use server";

export async function optimizedAction(formData: FormData) {
  const [result1, result2] = await Promise.all([operation1(), operation2()]);

  return { success: true, data: { result1, result2 } };
}
```

### 5. 类型安全

```typescript
"use server";

interface FormResult {
  success: boolean;
  message?: string;
}

export async function typedAction(formData: FormData): Promise<FormResult> {
  return { success: true, message: "操作成功" };
}
```

## 常见问题

### 1. 如何处理大文件上传?

使用分片上传:

```typescript
"use server";

export async function uploadChunk(formData: FormData) {
  const chunk = formData.get("chunk") as File;
  const chunkIndex = Number(formData.get("chunkIndex"));

  await saveChunk(chunk, chunkIndex);
  return { success: true };
}
```

### 2. 如何实现表单重置?

```typescript
"use client";

import { useRef } from "react";

export default function ResetForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await submitForm(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <input name="name" />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 3. 如何处理多步骤表单?

```typescript
"use client";

import { useState } from "react";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);

  return (
    <form>
      {step === 1 && <input name="name" />}
      {step === 2 && <input name="email" />}
      <button onClick={() => setStep(step + 1)}>下一步</button>
    </form>
  );
}
```

### 4. 如何实现表单防抖?

```typescript
"use client";

import { useCallback } from "react";
import { debounce } from "lodash";

export default function DebouncedForm() {
  const debouncedSubmit = useCallback(
    debounce(async (formData: FormData) => {
      await submitForm(formData);
    }, 500),
    []
  );

  return (
    <form action={debouncedSubmit}>
      <input name="search" />
    </form>
  );
}
```

### 5. 如何处理并发提交?

```typescript
"use client";

import { useState } from "react";

export default function ConcurrentForm() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (submitting) return;

    setSubmitting(true);
    try {
      await submitForm(formData);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit}>
      <button type="submit" disabled={submitting}>
        {submitting ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

### 6. 如何实现表单自动保存?

```typescript
"use client";

import { useEffect } from "react";

export default function AutoSaveForm() {
  useEffect(() => {
    const interval = setInterval(() => {
      const form = document.querySelector("form");
      if (form) {
        autoSave(new FormData(form));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <form>
      <input name="content" />
    </form>
  );
}
```

### 7. 如何处理表单数组?

```typescript
"use server";

export async function handleArray(formData: FormData) {
  const items = formData.getAll("items") as string[];
  items.forEach((item) => console.log(item));
  return { success: true };
}
```

### 8. 如何实现条件验证?

```typescript
"use server";

export async function conditionalValidation(formData: FormData) {
  const type = formData.get("type") as string;

  if (type === "email") {
    const email = formData.get("contact") as string;
    if (!email.includes("@")) {
      return { success: false, message: "邮箱格式不正确" };
    }
  }

  return { success: true };
}
```

### 9. 如何处理嵌套对象?

```typescript
"use server";

export async function handleNested(formData: FormData) {
  const data = {
    user: {
      name: formData.get("user.name"),
      email: formData.get("user.email"),
    },
  };

  return { success: true, data };
}
```

### 10. 如何实现乐观更新?

```typescript
"use client";

import { useOptimistic } from "react";

export default function OptimisticForm({ initialData }: { initialData: any }) {
  const [optimisticData, addOptimistic] = useOptimistic(
    initialData,
    (state, newData) => ({ ...state, ...newData })
  );

  async function handleSubmit(formData: FormData) {
    addOptimistic(Object.fromEntries(formData));
    await submitForm(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="name" />
    </form>
  );
}
```

## 总结

Server Actions 简化了表单处理流程。通过本文的学习,我们掌握了:

### 核心技术

1. **基础使用**: Server Actions 定义和调用
2. **状态管理**: useFormState 和 useFormStatus
3. **数据验证**: Zod 集成
4. **文件上传**: FormData 处理

### 最佳实践

1. **安全第一**: 始终验证用户身份和输入
2. **错误处理**: 完善的错误处理机制
3. **性能优化**: 并行处理和缓存重新验证
4. **用户体验**: 乐观更新和加载状态

### 实战技巧

1. **类型安全**: TypeScript 类型定义
2. **数据库操作**: Prisma 集成
3. **认证授权**: 权限检查
4. **实时反馈**: useOptimistic 使用

通过合理使用 Server Actions,可以构建安全、高效的表单处理系统。

## 实战场景六: 认证与授权

### 检查权限

```typescript
"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function protectedAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const data = formData.get("data");
  return { success: true };
}
```

### 角色验证

```typescript
"use server";

export async function adminAction(formData: FormData) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return { success: false, message: "权限不足" };
  }

  return { success: true };
}
```

## 实战场景七: 乐观更新

### 使用 useOptimistic

```typescript
"use client";

import { useOptimistic } from "react";
import { updateLike } from "../actions";

export default function LikeButton({
  postId,
  initialLikes,
}: {
  postId: string;
  initialLikes: number;
}) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, amount: number) => state + amount
  );

  async function handleLike() {
    addOptimisticLike(1);
    await updateLike(postId);
  }

  return <button onClick={handleLike}>点赞 ({optimisticLikes})</button>;
}
```

## 实战场景八: 更新和删除操作

### 更新记录

```typescript
"use server";

export async function updatePost(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  try {
    await prisma.post.update({
      where: { id },
      data: { title, content },
    });

    revalidatePath(`/posts/${id}`);
    return { success: true, message: "更新成功" };
  } catch (error) {
    return { success: false, message: "更新失败" };
  }
}
```

### 删除记录

```typescript
"use server";

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id },
    });

    revalidatePath("/posts");
    return { success: true, message: "删除成功" };
  } catch (error) {
    return { success: false, message: "删除失败" };
  }
}
```

## 实战场景九: 批量操作

### 批量创建

```typescript
"use server";

export async function batchCreate(formData: FormData) {
  const items = JSON.parse(formData.get("items") as string);

  try {
    await prisma.item.createMany({
      data: items,
    });

    revalidatePath("/items");
    return { success: true, message: `成功创建${items.length}条记录` };
  } catch (error) {
    return { success: false, message: "批量创建失败" };
  }
}
```

### 批量更新

```typescript
"use server";

export async function batchUpdate(formData: FormData) {
  const updates = JSON.parse(formData.get("updates") as string);

  try {
    await Promise.all(
      updates.map((update: any) =>
        prisma.item.update({
          where: { id: update.id },
          data: update.data,
        })
      )
    );

    revalidatePath("/items");
    return { success: true, message: `成功更新${updates.length}条记录` };
  } catch (error) {
    return { success: false, message: "批量更新失败" };
  }
}
```

## 实战场景十: 事务处理

### 数据库事务

```typescript
"use server";

export async function createOrderWithItems(formData: FormData) {
  const orderData = JSON.parse(formData.get("order") as string);
  const items = JSON.parse(formData.get("items") as string);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: orderData,
      });

      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          ...item,
          orderId: order.id,
        })),
      });

      return order;
    });

    revalidatePath("/orders");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: "创建订单失败" };
  }
}
```

## 实战场景十一: 图片上传与处理

### 图片上传

```typescript
"use server";

import sharp from "sharp";

export async function uploadImage(formData: FormData) {
  const file = formData.get("image") as File;

  if (!file) {
    return { success: false, message: "请选择图片" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 压缩图片
  const compressed = await sharp(buffer)
    .resize(800, 600, { fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const filename = `${Date.now()}.jpg`;
  const path = join(process.cwd(), "public", "images", filename);

  await writeFile(path, compressed);

  return { success: true, filename };
}
```

## 实战场景十二: 完整表单处理方案

### 综合示例

```typescript
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().min(10, "内容至少10个字符"),
  category: z.string(),
  tags: z.array(z.string()),
});

export async function createArticle(formData: FormData) {
  // 1. 认证检查
  const session = await auth();
  if (!session) {
    return { success: false, message: "请先登录" };
  }

  // 2. 数据验证
  const data = {
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
  };

  try {
    const validated = schema.parse(data);

    // 3. 数据库操作
    const article = await prisma.article.create({
      data: {
        ...validated,
        authorId: session.user.id,
      },
    });

    // 4. 缓存重新验证
    revalidatePath("/articles");

    // 5. 返回结果
    return {
      success: true,
      message: "创建成功",
      data: article,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      };
    }

    return { success: false, message: "创建失败" };
  }
}
```

### 客户端使用

```typescript
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createArticle } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "提交中..." : "提交"}
    </button>
  );
}

export default function ArticleForm() {
  const [state, formAction] = useFormState(createArticle, null);

  return (
    <form action={formAction}>
      <div>
        <input name="title" placeholder="标题" />
        {state?.errors?.find((e) => e.field === "title") && (
          <p className="error">
            {state.errors.find((e) => e.field === "title")?.message}
          </p>
        )}
      </div>

      <div>
        <textarea name="content" placeholder="内容" />
        {state?.errors?.find((e) => e.field === "content") && (
          <p className="error">
            {state.errors.find((e) => e.field === "content")?.message}
          </p>
        )}
      </div>

      <div>
        <select name="category">
          <option value="tech">技术</option>
          <option value="life">生活</option>
        </select>
      </div>

      <div>
        <input name="tags" placeholder="标签(JSON数组)" />
      </div>

      <SubmitButton />

      {state?.success && <p className="success">{state.message}</p>}
      {state?.success === false && <p className="error">{state.message}</p>}
    </form>
  );
}
```

1. **类型安全**: TypeScript 类型定义
2. **数据库操作**: Prisma 集成
3. **认证授权**: 权限检查
4. **实时反馈**: useOptimistic 使用

通过合理使用 Server Actions,可以构建安全、高效的表单处理系统。

## 实战场景十三: 表单验证与错误处理

### 自定义验证规则

```typescript
"use server";

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
}

export async function customValidation(formData: FormData) {
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  const errors: Array<{ field: string; message: string }> = [];

  if (!validateEmail(email)) {
    errors.push({ field: "email", message: "邮箱格式不正确" });
  }

  if (!validatePhone(phone)) {
    errors.push({ field: "phone", message: "手机号格式不正确" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true };
}
```

### 异步验证

```typescript
"use server";

export async function asyncValidation(formData: FormData) {
  const username = formData.get("username") as string;

  // 检查用户名是否已存在
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return {
      success: false,
      errors: [{ field: "username", message: "用户名已存在" }],
    };
  }

  return { success: true };
}
```

## 实战场景十四: 表单状态管理

### 使用 useActionState

```typescript
"use client";

import { useActionState } from "react";
import { submitForm } from "../actions";

export default function FormWithActionState() {
  const [state, action, isPending] = useActionState(submitForm, null);

  return (
    <form action={action}>
      <input name="data" />
      <button type="submit" disabled={isPending}>
        {isPending ? "提交中..." : "提交"}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

### 表单状态持久化

```typescript
"use client";

import { useEffect, useState } from "react";

export default function PersistentForm() {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // 从 localStorage 恢复表单数据
    const saved = localStorage.getItem("formData");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    localStorage.setItem("formData", JSON.stringify(newData));
  }

  return (
    <form>
      <input
        name="name"
        value={(formData as any).name || ""}
        onChange={handleChange}
      />
    </form>
  );
}
```

## 实战场景十五: 表单性能优化

### 防抖提交

```typescript
"use client";

import { useCallback, useRef } from "react";

export default function DebouncedSubmit() {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = useCallback((formData: FormData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      await submitForm(formData);
    }, 500);
  }, []);

  return (
    <form action={handleSubmit}>
      <input name="search" />
    </form>
  );
}
```

### 节流提交

```typescript
"use client";

import { useRef } from "react";

export default function ThrottledSubmit() {
  const lastSubmitRef = useRef(0);

  async function handleSubmit(formData: FormData) {
    const now = Date.now();
    if (now - lastSubmitRef.current < 1000) {
      return;
    }

    lastSubmitRef.current = now;
    await submitForm(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}
```

## 实战场景十六: 表单安全

### CSRF 保护

```typescript
"use server";

import { cookies } from "next/headers";

export async function csrfProtection(formData: FormData) {
  const token = formData.get("csrf_token") as string;
  const cookieStore = cookies();
  const expectedToken = cookieStore.get("csrf_token")?.value;

  if (token !== expectedToken) {
    return { success: false, message: "CSRF token 无效" };
  }

  return { success: true };
}
```

### 输入清理

```typescript
"use server";

import DOMPurify from "isomorphic-dompurify";

export async function sanitizeInput(formData: FormData) {
  const content = formData.get("content") as string;

  // 清理 HTML 内容
  const clean = DOMPurify.sanitize(content);

  await prisma.post.create({
    data: { content: clean },
  });

  return { success: true };
}
```

## 实战场景十七: 表单国际化

### 多语言错误消息

```typescript
"use server";

const messages = {
  "zh-CN": {
    required: "此字段必填",
    invalid_email: "邮箱格式不正确",
  },
  "en-US": {
    required: "This field is required",
    invalid_email: "Invalid email format",
  },
};

export async function i18nValidation(
  formData: FormData,
  locale: string = "zh-CN"
) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      success: false,
      message: messages[locale as keyof typeof messages].required,
    };
  }

  if (!email.includes("@")) {
    return {
      success: false,
      message: messages[locale as keyof typeof messages].invalid_email,
    };
  }

  return { success: true };
}
```

## 实战场景十八: 表单测试

### 单元测试

```typescript
import { describe, it, expect } from "vitest";
import { submitForm } from "./actions";

describe("submitForm", () => {
  it("should validate required fields", async () => {
    const formData = new FormData();
    const result = await submitForm(formData);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("should create record with valid data", async () => {
    const formData = new FormData();
    formData.set("name", "Test");
    formData.set("email", "test@example.com");

    const result = await submitForm(formData);

    expect(result.success).toBe(true);
  });
});
```

### 集成测试

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import FormComponent from "./FormComponent";

describe("FormComponent", () => {
  it("should submit form successfully", async () => {
    render(<FormComponent />);

    const nameInput = screen.getByPlaceholderText("姓名");
    const submitButton = screen.getByText("提交");

    fireEvent.change(nameInput, { target: { value: "Test" } });
    fireEvent.click(submitButton);

    const successMessage = await screen.findByText("提交成功");
    expect(successMessage).toBeInTheDocument();
  });
});
```

## 实战场景十九: 表单分析

### 表单提交追踪

```typescript
"use server";

export async function trackFormSubmit(formData: FormData) {
  const formName = formData.get("_formName") as string;

  // 记录表单提交
  await prisma.formSubmission.create({
    data: {
      formName,
      timestamp: new Date(),
      data: Object.fromEntries(formData),
    },
  });

  return { success: true };
}
```

### 表单错误追踪

```typescript
"use server";

export async function trackFormError(formData: FormData) {
  try {
    await submitForm(formData);
  } catch (error) {
    // 记录错误
    await prisma.formError.create({
      data: {
        formName: formData.get("_formName") as string,
        error: error instanceof Error ? error.message : "未知错误",
        timestamp: new Date(),
      },
    });

    throw error;
  }
}
```

## 实战场景二十: 表单导出

### 导出为 JSON

```typescript
"use server";

export async function exportFormData(formId: string) {
  const submissions = await prisma.formSubmission.findMany({
    where: { formId },
  });

  return {
    success: true,
    data: JSON.stringify(submissions, null, 2),
  };
}
```

### 导出为 CSV

```typescript
"use server";

export async function exportFormDataCSV(formId: string) {
  const submissions = await prisma.formSubmission.findMany({
    where: { formId },
  });

  const headers = Object.keys(submissions[0] || {});
  const csv = [
    headers.join(","),
    ...submissions.map((row) =>
      headers.map((header) => row[header as keyof typeof row]).join(",")
    ),
  ].join("\n");

  return {
    success: true,
    data: csv,
  };
}
```

4. **实时反馈**: useOptimistic 使用

通过合理使用 Server Actions,可以构建安全、高效的表单处理系统。

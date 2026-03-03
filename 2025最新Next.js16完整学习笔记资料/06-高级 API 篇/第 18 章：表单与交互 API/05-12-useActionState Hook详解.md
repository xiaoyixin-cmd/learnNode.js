**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useActionState Hook 详解

## 1. 概述

`useActionState`(原名`useFormState`)是 React 19 引入的 Hook,用于管理 Server Action 的状态。它提供了一种简单的方式来处理表单提交的结果和错误。

### 1.1 核心特性

- **状态管理**: 管理 action 返回的状态
- **错误处理**: 统一处理错误
- **pending 状态**: 自动跟踪提交状态
- **类型安全**: 完整的 TypeScript 支持
- **渐进增强**: 支持无 JavaScript 环境

### 1.2 基本用法

```tsx
import { useActionState } from "react";

const [state, formAction, isPending] = useActionState(
  serverAction,
  initialState
);
```

### 1.3 返回值

| 值         | 类型     | 说明              |
| ---------- | -------- | ----------------- |
| state      | any      | action 返回的状态 |
| formAction | function | 包装后的 action   |
| isPending  | boolean  | 是否正在提交      |

---

## 2. 基础用法

### 2.1 简单表单

```tsx
// app/actions.ts
"use server";

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return {
      success: false,
      error: "标题和内容不能为空",
    };
  }

  try {
    await db.post.create({
      data: { title, content },
    });

    return {
      success: true,
      message: "文章创建成功",
    };
  } catch (error) {
    return {
      success: false,
      error: "创建失败,请稍后重试",
    };
  }
}
```

```tsx
// app/page.tsx
"use client";

import { useActionState } from "react";
import { createPost } from "./actions";

export default function Page() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "提交中..." : "提交"}
      </button>

      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">{state.message}</p>}
    </form>
  );
}
```

### 2.2 登录表单

```tsx
// app/actions.ts
"use server";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "邮箱和密码不能为空",
    };
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    return {
      success: false,
      error: "邮箱或密码错误",
    };
  }

  await createSession(user.id);

  return {
    success: true,
    message: "登录成功",
  };
}
```

```tsx
// app/login/page.tsx
"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "登录中..." : "登录"}
      </button>

      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```

### 2.3 注册表单

```tsx
// app/actions.ts
"use server";

import { z } from "zod";

const RegisterSchema = z
  .object({
    email: z.string().email("邮箱格式不正确"),
    password: z.string().min(8, "密码至少8个字符"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });

export async function register(prevState: any, formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = RegisterSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["该邮箱已被注册"] },
    };
  }

  await db.user.create({
    data: {
      email,
      password: await hashPassword(password),
    },
  });

  return {
    success: true,
    message: "注册成功",
  };
}
```

```tsx
// app/register/page.tsx
"use client";

import { useActionState } from "react";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <form action={formAction}>
      <div>
        <input type="email" name="email" required />
        {state?.errors?.email && (
          <p className="text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <input type="password" name="password" required />
        {state?.errors?.password && (
          <p className="text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <input type="password" name="confirmPassword" required />
        {state?.errors?.confirmPassword && (
          <p className="text-red-500">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "注册中..." : "注册"}
      </button>

      {state?.success && <p className="text-green-500">{state.message}</p>}
    </form>
  );
}
```

---

## 3. 高级用法

### 3.1 复杂表单状态管理

```tsx
"use client";

import { useActionState } from "react";

type FormState = {
  step: number;
  data: {
    personal?: { name: string; email: string };
    address?: { street: string; city: string };
    payment?: { cardNumber: string };
  };
  errors?: Record<string, string[]>;
  success?: boolean;
};

async function handleMultiStepForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const action = formData.get("action") as string;

  if (action === "next") {
    const currentStep = prevState.step;

    if (currentStep === 1) {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;

      if (!name || !email) {
        return {
          ...prevState,
          errors: { form: ["请填写所有字段"] },
        };
      }

      return {
        step: 2,
        data: {
          ...prevState.data,
          personal: { name, email },
        },
      };
    }

    if (currentStep === 2) {
      const street = formData.get("street") as string;
      const city = formData.get("city") as string;

      return {
        step: 3,
        data: {
          ...prevState.data,
          address: { street, city },
        },
      };
    }
  }

  if (action === "prev") {
    return {
      ...prevState,
      step: prevState.step - 1,
    };
  }

  if (action === "submit") {
    // 提交所有数据
    await submitOrder(prevState.data);

    return {
      ...prevState,
      success: true,
    };
  }

  return prevState;
}

export function MultiStepForm() {
  const [state, formAction, isPending] = useActionState(handleMultiStepForm, {
    step: 1,
    data: {},
  });

  if (state.success) {
    return <div>提交成功!</div>;
  }

  return (
    <form action={formAction}>
      {state.step === 1 && (
        <div>
          <h2>步骤 1: 个人信息</h2>
          <input name="name" defaultValue={state.data.personal?.name} />
          <input name="email" defaultValue={state.data.personal?.email} />
          <button type="submit" name="action" value="next">
            下一步
          </button>
        </div>
      )}

      {state.step === 2 && (
        <div>
          <h2>步骤 2: 地址信息</h2>
          <input name="street" defaultValue={state.data.address?.street} />
          <input name="city" defaultValue={state.data.address?.city} />
          <button type="submit" name="action" value="prev">
            上一步
          </button>
          <button type="submit" name="action" value="next">
            下一步
          </button>
        </div>
      )}

      {state.step === 3 && (
        <div>
          <h2>步骤 3: 确认信息</h2>
          <p>姓名: {state.data.personal?.name}</p>
          <p>邮箱: {state.data.personal?.email}</p>
          <p>
            地址: {state.data.address?.street}, {state.data.address?.city}
          </p>
          <button type="submit" name="action" value="prev">
            上一步
          </button>
          <button
            type="submit"
            name="action"
            value="submit"
            disabled={isPending}
          >
            {isPending ? "提交中..." : "提交"}
          </button>
        </div>
      )}

      {state.errors && (
        <div>
          {Object.values(state.errors).map((error, i) => (
            <p key={i} className="text-red-500">
              {error[0]}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
```

### 3.2 文件上传进度

```tsx
"use client";

import { useActionState } from "react";

type UploadState = {
  uploading: boolean;
  progress: number;
  fileUrl?: string;
  error?: string;
};

async function uploadFile(
  prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  const file = formData.get("file") as File;

  if (!file) {
    return {
      ...prevState,
      error: "请选择文件",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      ...prevState,
      error: "文件大小不能超过5MB",
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传文件
    const fileUrl = await saveFile(buffer, file.name);

    return {
      uploading: false,
      progress: 100,
      fileUrl,
    };
  } catch (error) {
    return {
      uploading: false,
      progress: 0,
      error: "上传失败",
    };
  }
}

export function FileUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadFile, {
    uploading: false,
    progress: 0,
  });

  return (
    <form action={formAction}>
      <input type="file" name="file" />

      {isPending && (
        <div>
          <div className="progress-bar">
            <div style={{ width: `${state.progress}%` }} />
          </div>
          <p>上传中... {state.progress}%</p>
        </div>
      )}

      {state.fileUrl && (
        <div>
          <p>上传成功!</p>
          <a href={state.fileUrl}>查看文件</a>
        </div>
      )}

      {state.error && <p className="text-red-500">{state.error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "上传中..." : "上传"}
      </button>
    </form>
  );
}
```

### 3.3 搜索与过滤

```tsx
"use client";

import { useActionState } from "react";

type SearchState = {
  query: string;
  results: Product[];
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  totalCount: number;
  page: number;
};

async function searchProducts(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const query = formData.get("query") as string;
  const category = formData.get("category") as string;
  const minPrice = Number(formData.get("minPrice"));
  const maxPrice = Number(formData.get("maxPrice"));
  const page = Number(formData.get("page")) || 1;

  const filters = {
    category: category || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
  };

  const { results, totalCount } = await fetchProducts({
    query,
    filters,
    page,
    pageSize: 20,
  });

  return {
    query,
    results,
    filters,
    totalCount,
    page,
  };
}

export function ProductSearch() {
  const [state, formAction, isPending] = useActionState(searchProducts, {
    query: "",
    results: [],
    filters: {},
    totalCount: 0,
    page: 1,
  });

  return (
    <div>
      <form action={formAction}>
        <input
          name="query"
          placeholder="搜索商品..."
          defaultValue={state.query}
        />

        <select name="category" defaultValue={state.filters.category}>
          <option value="">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="books">图书</option>
        </select>

        <input
          type="number"
          name="minPrice"
          placeholder="最低价格"
          defaultValue={state.filters.minPrice}
        />

        <input
          type="number"
          name="maxPrice"
          placeholder="最高价格"
          defaultValue={state.filters.maxPrice}
        />

        <button type="submit" disabled={isPending}>
          {isPending ? "搜索中..." : "搜索"}
        </button>
      </form>

      {isPending && <div>加载中...</div>}

      <div>
        <p>找到 {state.totalCount} 个结果</p>
        {state.results.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>¥{product.price}</p>
          </div>
        ))}
      </div>

      {state.totalCount > 20 && (
        <div>
          <button
            onClick={() => {
              const form = document.querySelector("form");
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = "page";
              input.value = String(state.page + 1);
              form?.appendChild(input);
              form?.requestSubmit();
            }}
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
```

### 3.4 实时验证

```tsx
"use client";

import { useActionState } from "react";
import { useEffect } from "react";

type ValidationState = {
  username: {
    value: string;
    available?: boolean;
    checking?: boolean;
    error?: string;
  };
  email: {
    value: string;
    valid?: boolean;
    error?: string;
  };
};

async function validateForm(
  prevState: ValidationState,
  formData: FormData
): Promise<ValidationState> {
  const field = formData.get("field") as string;
  const value = formData.get("value") as string;

  if (field === "username") {
    if (value.length < 3) {
      return {
        ...prevState,
        username: {
          value,
          error: "用户名至少3个字符",
        },
      };
    }

    const available = await checkUsernameAvailability(value);

    return {
      ...prevState,
      username: {
        value,
        available,
        error: available ? undefined : "用户名已被占用",
      },
    };
  }

  if (field === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(value);

    return {
      ...prevState,
      email: {
        value,
        valid,
        error: valid ? undefined : "邮箱格式不正确",
      },
    };
  }

  return prevState;
}

export function LiveValidationForm() {
  const [state, formAction, isPending] = useActionState(validateForm, {
    username: { value: "" },
    email: { value: "" },
  });

  return (
    <form>
      <div>
        <input
          name="username"
          defaultValue={state.username.value}
          onChange={(e) => {
            const form = e.currentTarget.form;
            const formData = new FormData();
            formData.set("field", "username");
            formData.set("value", e.target.value);
            form?.requestSubmit();
          }}
        />
        {state.username.checking && <span>检查中...</span>}
        {state.username.available && <span>✓ 可用</span>}
        {state.username.error && (
          <p className="text-red-500">{state.username.error}</p>
        )}
      </div>

      <div>
        <input
          name="email"
          type="email"
          defaultValue={state.email.value}
          onChange={(e) => {
            const form = e.currentTarget.form;
            const formData = new FormData();
            formData.set("field", "email");
            formData.set("value", e.target.value);
            form?.requestSubmit();
          }}
        />
        {state.email.valid && <span>✓ 有效</span>}
        {state.email.error && (
          <p className="text-red-500">{state.email.error}</p>
        )}
      </div>
    </form>
  );
}
```

---

## 4. 实战案例

### 4.1 购物车管理

```tsx
"use client";

import { useActionState } from "react";

type CartState = {
  items: CartItem[];
  total: number;
  discount: number;
  couponCode?: string;
  error?: string;
};

async function manageCart(
  prevState: CartState,
  formData: FormData
): Promise<CartState> {
  const action = formData.get("action") as string;

  if (action === "add") {
    const productId = formData.get("productId") as string;
    const quantity = Number(formData.get("quantity"));

    const product = await getProduct(productId);
    const existingItem = prevState.items.find((item) => item.id === productId);

    let newItems;
    if (existingItem) {
      newItems = prevState.items.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [
        ...prevState.items,
        {
          id: productId,
          name: product.name,
          price: product.price,
          quantity,
        },
      ];
    }

    const total = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      ...prevState,
      items: newItems,
      total,
    };
  }

  if (action === "remove") {
    const productId = formData.get("productId") as string;
    const newItems = prevState.items.filter((item) => item.id !== productId);
    const total = newItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      ...prevState,
      items: newItems,
      total,
    };
  }

  if (action === "applyCoupon") {
    const couponCode = formData.get("couponCode") as string;
    const coupon = await validateCoupon(couponCode);

    if (!coupon) {
      return {
        ...prevState,
        error: "优惠券无效",
      };
    }

    const discount = prevState.total * (coupon.percentage / 100);

    return {
      ...prevState,
      couponCode,
      discount,
      error: undefined,
    };
  }

  return prevState;
}

export function ShoppingCart() {
  const [state, formAction, isPending] = useActionState(manageCart, {
    items: [],
    total: 0,
    discount: 0,
  });

  return (
    <div>
      <h2>购物车</h2>

      {state.items.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>
            ¥{item.price} x {item.quantity}
          </p>
          <form action={formAction}>
            <input type="hidden" name="action" value="remove" />
            <input type="hidden" name="productId" value={item.id} />
            <button type="submit">删除</button>
          </form>
        </div>
      ))}

      <div>
        <p>小计: ¥{state.total}</p>
        {state.discount > 0 && <p>优惠: -¥{state.discount}</p>}
        <p>总计: ¥{state.total - state.discount}</p>
      </div>

      <form action={formAction}>
        <input type="hidden" name="action" value="applyCoupon" />
        <input name="couponCode" placeholder="优惠券代码" />
        <button type="submit" disabled={isPending}>
          应用优惠券
        </button>
        {state.error && <p className="text-red-500">{state.error}</p>}
      </form>
    </div>
  );
}
```

### 4.2 评论系统

```tsx
"use client";

import { useActionState } from "react";

type CommentState = {
  comments: Comment[];
  replyTo?: string;
  error?: string;
  success?: boolean;
};

async function manageComments(
  prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  const action = formData.get("action") as string;

  if (action === "add") {
    const text = formData.get("text") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!text || text.length < 5) {
      return {
        ...prevState,
        error: "评论至少5个字符",
      };
    }

    const newComment = await createComment({
      text,
      parentId: parentId || undefined,
    });

    return {
      comments: [...prevState.comments, newComment],
      replyTo: undefined,
      success: true,
      error: undefined,
    };
  }

  if (action === "reply") {
    const commentId = formData.get("commentId") as string;
    return {
      ...prevState,
      replyTo: commentId,
    };
  }

  if (action === "delete") {
    const commentId = formData.get("commentId") as string;
    await deleteComment(commentId);

    return {
      ...prevState,
      comments: prevState.comments.filter((c) => c.id !== commentId),
    };
  }

  return prevState;
}

export function CommentSection({ postId }: { postId: string }) {
  const [state, formAction, isPending] = useActionState(manageComments, {
    comments: [],
  });

  return (
    <div>
      <h3>评论</h3>

      <form action={formAction}>
        <input type="hidden" name="action" value="add" />
        {state.replyTo && (
          <input type="hidden" name="parentId" value={state.replyTo} />
        )}
        <textarea
          name="text"
          placeholder={state.replyTo ? "回复评论..." : "写下你的评论..."}
          required
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "发布中..." : "发布评论"}
        </button>
        {state.replyTo && (
          <button type="button" onClick={() => formAction(new FormData())}>
            取消回复
          </button>
        )}
      </form>

      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">评论成功!</p>}

      <div>
        {state.comments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.text}</p>
            <small>
              {comment.author} · {comment.createdAt}
            </small>
            <form action={formAction}>
              <input type="hidden" name="action" value="reply" />
              <input type="hidden" name="commentId" value={comment.id} />
              <button type="submit">回复</button>
            </form>
            <form action={formAction}>
              <input type="hidden" name="action" value="delete" />
              <input type="hidden" name="commentId" value={comment.id} />
              <button type="submit">删除</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. 适用场景

### 5.1 表单提交

**需求**: 处理表单提交和验证

**优势**:

- 自动管理表单状态
- 内置 pending 状态
- 简化错误处理
- 支持渐进增强

### 5.2 多步骤流程

**需求**: 向导式表单、注册流程

**优势**:

- 保持步骤状态
- 支持前进后退
- 数据持久化
- 流程控制

### 5.3 搜索和过滤

**需求**: 实时搜索、商品过滤

**优势**:

- 管理搜索状态
- 保存过滤条件
- 分页支持
- URL 同步

### 5.4 购物车

**需求**: 电商购物车功能

**优势**:

- 状态管理
- 优惠券处理
- 实时计算
- 错误处理

### 5.5 评论系统

**需求**: 文章评论、回复功能

**优势**:

- 嵌套评论
- 回复管理
- 实时更新
- 状态同步

---

## 6. 注意事项

### 6.1 只能在客户端组件中使用

```tsx
// ✓ 正确
"use client";

import { useActionState } from "react";

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, initialState);
  // ...
}
```

### 6.2 Action 函数必须是异步的

```tsx
// ✗ 错误:同步函数
function myAction(prevState: State, formData: FormData): State {
  return { ...prevState };
}

// ✓ 正确:异步函数
async function myAction(prevState: State, formData: FormData): Promise<State> {
  await someAsyncOperation();
  return { ...prevState };
}
```

### 6.3 状态更新是异步的

```tsx
"use client";

import { useActionState } from "react";

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, initialState);

  async function handleSubmit(formData: FormData) {
    formAction(formData);
    // ✗ 错误:state还没有更新
    console.log(state); // 仍然是旧值
  }

  // ✓ 正确:使用useEffect监听state变化
  useEffect(() => {
    console.log("State updated:", state);
  }, [state]);

  return <form action={formAction}>...</form>;
}
```

### 6.4 避免在 Action 中直接修改 prevState

```tsx
// ✗ 错误:直接修改
async function myAction(prevState: State, formData: FormData): Promise<State> {
  prevState.count++; // 直接修改
  return prevState;
}

// ✓ 正确:返回新对象
async function myAction(prevState: State, formData: FormData): Promise<State> {
  return {
    ...prevState,
    count: prevState.count + 1,
  };
}
```

### 6.5 处理并发提交

```tsx
"use client";

import { useActionState } from "react";

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, initialState);

  return (
    <form action={formAction}>
      <input name="text" />
      {/* 禁用按钮防止重复提交 */}
      <button type="submit" disabled={isPending}>
        {isPending ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

---

## 7. 常见问题

### 7.1 如何重置表单状态?

**问题**: 提交成功后如何重置表单。

**解决方案**:

```tsx
"use client";

import { useActionState, useRef } from "react";

export function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(myAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction}>
      <input name="text" />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 7.2 如何显示字段级错误?

**问题**: 需要为每个字段显示错误。

**解决方案**:

```tsx
type FormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
};

async function myAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: FormState["errors"] = {};

  if (!email) {
    errors.email = ["邮箱不能为空"];
  }

  if (!password || password.length < 6) {
    errors.password = ["密码至少6个字符"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // 处理成功
  return { success: true };
}

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, {});

  return (
    <form action={formAction}>
      <div>
        <input name="email" />
        {state.errors?.email && (
          <p className="text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <input name="password" type="password" />
        {state.errors?.password && (
          <p className="text-red-500">{state.errors.password[0]}</p>
        )}
      </div>

      <button type="submit">提交</button>
    </form>
  );
}
```

### 7.3 如何与 useOptimistic 配合?

**问题**: 同时使用 useActionState 和 useOptimistic。

**解决方案**:

```tsx
"use client";

import { useActionState, useOptimistic } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [state, formAction, isPending] = useActionState(addTodo, {
    todos,
    error: null,
  });

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    state.todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    addOptimisticTodo({ id: crypto.randomUUID(), title, completed: false });
    formAction(formData);
  }

  return (
    <form action={handleSubmit}>
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

### 7.4 如何处理文件上传?

**问题**: 上传文件并显示进度。

**解决方案**: 参考 3.2 节的文件上传进度示例。

### 7.5 如何实现防抖?

**问题**: 避免频繁提交。

**解决方案**:

```tsx
"use client";

import { useActionState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SearchForm() {
  const [state, formAction, isPending] = useActionState(search, {
    results: [],
  });

  const debouncedSearch = useDebouncedCallback((formData: FormData) => {
    formAction(formData);
  }, 500);

  return (
    <form>
      <input
        name="query"
        onChange={(e) => {
          const formData = new FormData(e.currentTarget.form!);
          debouncedSearch(formData);
        }}
      />
      {state.results.map((result) => (
        <div key={result.id}>{result.title}</div>
      ))}
    </form>
  );
}
```

### 7.6 如何测试使用 useActionState 的组件?

**问题**: 如何编写测试。

**解决方案**:

```tsx
// __tests__/MyForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyForm } from "./MyForm";

describe("MyForm", () => {
  it("should submit form and show success message", async () => {
    render(<MyForm />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /提交/i });

    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("提交成功")).toBeInTheDocument();
    });
  });
});
```

### 7.7 如何处理 URL 同步?

**问题**: 将表单状态同步到 URL。

**解决方案**:

```tsx
"use client";

import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, formAction, isPending] = useActionState(search, {
    query: searchParams.get("q") || "",
    results: [],
  });

  useEffect(() => {
    if (state.query) {
      router.push(`?q=${encodeURIComponent(state.query)}`);
    }
  }, [state.query, router]);

  return <form action={formAction}>...</form>;
}
```

### 7.8 如何处理复杂验证?

**问题**: 使用 Zod 等库进行验证。

**解决方案**: 参考 2.3 节的 Zod 验证示例。

### 7.9 如何显示全局错误?

**问题**: 显示非字段级错误。

**解决方案**:

```tsx
type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function myAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // 处理表单
    await submitForm(formData);
    return { success: true };
  } catch (error) {
    return {
      error: "提交失败,请稍后重试",
    };
  }
}

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, {});

  return (
    <form action={formAction}>
      {state.error && <div className="alert alert-error">{state.error}</div>}
      {/* 表单字段 */}
    </form>
  );
}
```

### 7.10 如何处理重定向?

**问题**: 提交成功后重定向。

**解决方案**:

```tsx
"use server";

import { redirect } from "next/navigation";

async function myAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await submitForm(formData);

  if (result.success) {
    redirect("/success");
  }

  return { error: "提交失败" };
}
```

---

## 8. 总结

### 8.1 核心要点

1. **状态管理**: 自动管理表单状态
2. **异步处理**: 内置 pending 状态
3. **错误处理**: 简化错误显示
4. **类型安全**: 完整的 TypeScript 支持
5. **渐进增强**: 支持无 JavaScript 环境

### 8.2 最佳实践

| 实践     | 说明                    | 优先级 |
| -------- | ----------------------- | ------ |
| 类型定义 | 定义清晰的 State 类型   | 高     |
| 错误处理 | 提供友好的错误信息      | 高     |
| 加载状态 | 使用 isPending 禁用按钮 | 高     |
| 表单重置 | 成功后重置表单          | 中     |
| 防抖处理 | 避免频繁提交            | 中     |

### 8.3 与其他 Hook 对比

| Hook           | 用途         | 使用场景             |
| -------------- | ------------ | -------------------- |
| useActionState | 表单状态管理 | 复杂表单、多步骤流程 |
| useFormStatus  | 表单提交状态 | 显示加载状态         |
| useOptimistic  | 乐观更新     | 即时 UI 反馈         |
| useState       | 本地状态     | 简单状态管理         |

### 8.4 下一步

学习完 useActionState 后,建议继续学习:

1. **表单验证与错误处理**: 深入学习表单验证
2. **文件上传与处理**: 处理文件上传
3. **实时表单反馈**: 实现实时验证
4. **复杂表单架构设计**: 设计大型表单系统
5. **Server Actions**: 深入理解服务端操作

useActionState 是 Next.js 16 中处理表单的核心 Hook,它简化了表单状态管理、错误处理和异步操作。通过正确使用 useActionState,你可以构建更健壮、更易维护的表单系统。

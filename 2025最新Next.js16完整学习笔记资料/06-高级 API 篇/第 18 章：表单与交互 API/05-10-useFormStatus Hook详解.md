**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useFormStatus Hook 详解

## 1. 概述

`useFormStatus`是 React 19 引入的 Hook,用于获取表单提交状态。在 Next.js 16 中,它与 Server Actions 完美配合,提供实时的表单状态反馈。

### 1.1 核心特性

- **实时状态**: 获取表单提交状态
- **pending 状态**: 判断是否正在提交
- **data 访问**: 访问表单数据
- **method 获取**: 获取提交方法
- **action 获取**: 获取 action URL

### 1.2 基本用法

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "提交中..." : "提交"}
    </button>
  );
}
```

### 1.3 返回值

| 属性    | 类型                                             | 说明         |
| ------- | ------------------------------------------------ | ------------ |
| pending | boolean                                          | 是否正在提交 |
| data    | FormData \| null                                 | 表单数据     |
| method  | string \| null                                   | 提交方法     |
| action  | string \| ((formData: FormData) => void) \| null | action       |

---

## 2. 基础用法

### 2.1 简单提交按钮

```tsx
// components/SubmitButton.tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={pending ? "opacity-50 cursor-not-allowed" : ""}
    >
      {pending ? "提交中..." : "提交"}
    </button>
  );
}
```

```tsx
// app/page.tsx
import { SubmitButton } from "@/components/SubmitButton";
import { createPost } from "./actions";

export default function Page() {
  return (
    <form action={createPost}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <SubmitButton />
    </form>
  );
}
```

### 2.2 加载指示器

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function LoadingIndicator() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      <span>正在处理...</span>
    </div>
  );
}
```

### 2.3 禁用表单字段

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function FormInput({
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { pending } = useFormStatus();

  return (
    <input
      name={name}
      disabled={pending}
      className={pending ? "opacity-50" : ""}
      {...props}
    />
  );
}
```

---

## 3. 高级用法

### 3.1 访问表单数据

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function FormPreview() {
  const { pending, data } = useFormStatus();

  if (!pending || !data) return null;

  const title = data.get("title");
  const content = data.get("content");

  return (
    <div className="bg-blue-50 p-4 rounded">
      <h3>正在提交:</h3>
      <p>标题: {title}</p>
      <p>内容: {content}</p>
    </div>
  );
}
```

### 3.2 条件渲染

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function FormActions() {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2">
      {pending ? (
        <>
          <button type="button" disabled className="opacity-50">
            取消
          </button>
          <button type="submit" disabled className="opacity-50">
            提交中...
          </button>
        </>
      ) : (
        <>
          <button type="button">取消</button>
          <button type="submit">提交</button>
        </>
      )}
    </div>
  );
}
```

### 3.3 进度条

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

export function ProgressBar() {
  const { pending } = useFormStatus();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pending) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [pending]);

  if (!pending) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### 3.4 多步骤表单

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function MultiStepForm() {
  const { pending, data } = useFormStatus();
  const [step, setStep] = useState(1);

  return (
    <form>
      {step === 1 && (
        <div>
          <input type="text" name="name" required />
          <button type="button" onClick={() => setStep(2)}>
            下一步
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <input type="email" name="email" required />
          <button type="button" onClick={() => setStep(1)}>
            上一步
          </button>
          <button type="submit" disabled={pending}>
            {pending ? "提交中..." : "提交"}
          </button>
        </div>
      )}
    </form>
  );
}
```

---

## 3. 高级用法

### 3.1 访问表单数据

```tsx
"use client";

import { useFormStatus } from "react-dom";

function FormDebug() {
  const { pending, data } = useFormStatus();

  if (!pending || !data) return null;

  return (
    <div>
      <h3>正在提交:</h3>
      <ul>
        {Array.from(data.entries()).map(([key, value]) => (
          <li key={key}>
            {key}: {value.toString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MyForm() {
  return (
    <form action={myAction}>
      <input name="username" />
      <input name="email" />
      <FormDebug />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 3.2 条件渲染

根据提交状态显示不同内容:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function FormContent() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <div>
        <div className="spinner" />
        <p>正在处理您的请求...</p>
      </div>
    );
  }

  return (
    <>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      <button type="submit">提交</button>
    </>
  );
}

export function MyForm() {
  return (
    <form action={myAction}>
      <FormContent />
    </form>
  );
}
```

### 3.3 禁用表单字段

提交时禁用所有输入:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function FormFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <input name="username" disabled={pending} placeholder="用户名" />
      <input name="email" type="email" disabled={pending} placeholder="邮箱" />
      <textarea name="bio" disabled={pending} placeholder="个人简介" />
      <button type="submit" disabled={pending}>
        {pending ? "提交中..." : "提交"}
      </button>
    </>
  );
}

export function MyForm() {
  return (
    <form action={myAction}>
      <FormFields />
    </form>
  );
}
```

### 3.4 进度指示器

显示详细的提交进度:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function ProgressIndicator() {
  const { pending, data } = useFormStatus();

  if (!pending) return null;

  const totalFields = data ? Array.from(data.keys()).length : 0;

  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: "50%" }} />
      <p>正在提交 {totalFields} 个字段...</p>
    </div>
  );
}

export function MyForm() {
  return (
    <form action={myAction}>
      <input name="field1" />
      <input name="field2" />
      <input name="field3" />
      <ProgressIndicator />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 3.5 错误处理

结合错误状态显示:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "提交中..." : "提交"}
    </button>
  );
}

export function MyForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await myAction(formData);

    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="username" />
      {error && <p className="error">{error}</p>}
      <SubmitButton />
    </form>
  );
}
```

### 3.6 多个提交按钮

不同按钮显示不同状态:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function SaveButton() {
  const { pending, data } = useFormStatus();
  const isSaving = pending && data?.get("action") === "save";

  return (
    <button type="submit" name="action" value="save" disabled={pending}>
      {isSaving ? "保存中..." : "保存"}
    </button>
  );
}

function PublishButton() {
  const { pending, data } = useFormStatus();
  const isPublishing = pending && data?.get("action") === "publish";

  return (
    <button type="submit" name="action" value="publish" disabled={pending}>
      {isPublishing ? "发布中..." : "发布"}
    </button>
  );
}

export function MyForm() {
  return (
    <form action={myAction}>
      <input name="title" />
      <textarea name="content" />
      <div className="button-group">
        <SaveButton />
        <PublishButton />
      </div>
    </form>
  );
}
```

---

## 4. 实战案例

### 4.1 登录表单

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { login } from "./actions";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400"
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          登录中...
        </span>
      ) : (
        "登录"
      )}
    </button>
  );
}

export function LoginForm() {
  return (
    <form action={login} className="space-y-4">
      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <LoginButton />
    </form>
  );
}
```

### 4.2 评论表单

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { createComment } from "./actions";
import { useRef } from "react";

function CommentButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
    >
      {pending ? "发送中..." : "发送评论"}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createComment(postId, formData);

    if (result.success) {
      formRef.current?.reset();
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <textarea
        name="content"
        placeholder="写下你的评论..."
        required
        className="w-full border rounded px-3 py-2 min-h-[100px]"
      />
      <CommentButton />
    </form>
  );
}
```

### 4.3 文件上传表单

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { uploadFile } from "./actions";

function UploadButton() {
  const { pending, data } = useFormStatus();
  const file = data?.get("file") as File | null;

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
    >
      {pending ? <span>上传中... {file && `(${file.name})`}</span> : "上传文件"}
    </button>
  );
}

export function UploadForm() {
  return (
    <form action={uploadFile} className="space-y-4">
      <input type="file" name="file" required className="w-full" />
      <UploadButton />
    </form>
  );
}
```

### 4.4 搜索表单

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { search } from "./actions";

function SearchButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
    >
      {pending ? "搜索中..." : "搜索"}
    </button>
  );
}

export function SearchForm() {
  return (
    <form action={search} className="flex gap-2">
      <input
        name="query"
        placeholder="搜索..."
        className="flex-1 border rounded px-3 py-2"
      />
      <SearchButton />
    </form>
  );
}
```

### 4.5 多步骤表单

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { submitForm } from "./actions";

function StepIndicator({ currentStep }: { currentStep: number }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex justify-between mb-4">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex-1 h-2 mx-1 rounded ${
            step < currentStep
              ? "bg-green-500"
              : step === currentStep
              ? pending
                ? "bg-blue-500 animate-pulse"
                : "bg-blue-500"
              : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function NavigationButtons({
  step,
  onPrev,
  isLastStep,
}: {
  step: number;
  onPrev: () => void;
  isLastStep: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2">
      {step > 1 && (
        <button
          type="button"
          onClick={onPrev}
          disabled={pending}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          上一步
        </button>
      )}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {pending ? "处理中..." : isLastStep ? "提交" : "下一步"}
      </button>
    </div>
  );
}

export function MultiStepForm() {
  const [step, setStep] = useState(1);

  async function handleSubmit(formData: FormData) {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await submitForm(formData);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <div>
          <h2>步骤 1: 个人信息</h2>
          <input name="name" placeholder="姓名" required />
          <input name="email" type="email" placeholder="邮箱" required />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>步骤 2: 地址信息</h2>
          <input name="address" placeholder="地址" required />
          <input name="city" placeholder="城市" required />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>步骤 3: 确认信息</h2>
          <p>请确认您的信息...</p>
        </div>
      )}

      <NavigationButtons
        step={step}
        onPrev={() => setStep(step - 1)}
        isLastStep={step === 3}
      />
    </form>
  );
}
```

---

## 5. 适用场景

### 5.1 表单提交反馈

**需求**: 用户提交表单时需要即时反馈

**优势**:

- 提升用户体验
- 防止重复提交
- 显示加载状态
- 禁用表单字段

### 5.2 文件上传进度

**需求**: 上传文件时显示进度

**优势**:

- 显示文件名
- 显示上传状态
- 禁用其他操作
- 提供取消选项

### 5.3 多步骤表单

**需求**: 复杂表单分步骤填写

**优势**:

- 显示当前步骤
- 禁用导航按钮
- 显示处理状态
- 防止误操作

### 5.4 搜索功能

**需求**: 实时搜索反馈

**优势**:

- 显示搜索状态
- 禁用重复搜索
- 提供加载指示
- 优化用户体验

### 5.5 表单验证

**需求**: 提交前验证数据

**优势**:

- 显示验证状态
- 禁用提交按钮
- 提供错误反馈
- 防止无效提交

---

## 6. 注意事项

### 6.1 必须在表单子组件中使用

**错误示例**:

```tsx
// ✗ 错误:在表单外使用
export function MyPage() {
  const { pending } = useFormStatus(); // 无法获取状态

  return (
    <form action={myAction}>
      <button type="submit">提交</button>
    </form>
  );
}
```

**正确示例**:

```tsx
// ✓ 正确:在表单子组件中使用
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      提交
    </button>
  );
}

export function MyPage() {
  return (
    <form action={myAction}>
      <SubmitButton />
    </form>
  );
}
```

### 6.2 只能在客户端组件中使用

```tsx
// ✓ 正确
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      提交
    </button>
  );
}
```

### 6.3 pending 状态的时机

pending 状态在以下情况下为 true:

- 表单开始提交
- Server Action 执行中
- 等待服务器响应

pending 状态在以下情况下为 false:

- 表单未提交
- Server Action 执行完成
- 发生错误

### 6.4 data 属性的限制

data 属性只在 pending 为 true 时可用:

```tsx
function FormDebug() {
  const { pending, data } = useFormStatus();

  // ✓ 正确:检查pending
  if (!pending || !data) return null;

  return <div>{/* 使用data */}</div>;
}
```

### 6.5 性能考虑

避免在大型表单中过度使用:

```tsx
// ✗ 避免:每个字段都使用
function Field({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return <input name={name} disabled={pending} />;
}

// ✓ 更好:统一管理
function FormFields() {
  const { pending } = useFormStatus();
  return (
    <>
      <input name="field1" disabled={pending} />
      <input name="field2" disabled={pending} />
      <input name="field3" disabled={pending} />
    </>
  );
}
```

---

## 7. 常见问题

### 7.1 useFormStatus 返回的 pending 始终为 false?

**问题**: Hook 无法获取表单状态。

**原因**: 没有在表单的子组件中使用。

**解决方案**:

```tsx
// ✓ 正确
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>提交</button>;
}

export function MyForm() {
  return (
    <form action={myAction}>
      <SubmitButton />
    </form>
  );
}
```

### 7.2 如何在表单外显示状态?

**问题**: 需要在表单外部显示提交状态。

**解决方案**: 使用状态提升:

```tsx
"use client";

import { useState } from "react";

export function MyPage() {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    await myAction(formData);
    setIsPending(false);
  }

  return (
    <>
      {isPending && <div>正在提交...</div>}
      <form action={handleSubmit}>
        <button type="submit">提交</button>
      </form>
    </>
  );
}
```

### 7.3 如何获取具体的提交进度?

**问题**: 需要显示详细的上传进度。

**解决方案**: useFormStatus 不支持进度,需要使用其他方案:

```tsx
"use client";

import { useState } from "react";

export function UploadForm() {
  const [progress, setProgress] = useState(0);

  async function handleSubmit(formData: FormData) {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress((e.loaded / e.total) * 100);
      }
    });

    // 上传文件
  }

  return (
    <form action={handleSubmit}>
      <input type="file" name="file" />
      <button type="submit">上传</button>
      {progress > 0 && <div>进度: {progress}%</div>}
    </form>
  );
}
```

### 7.4 如何处理多个表单?

**问题**: 页面中有多个表单,如何区分状态?

**解决方案**: 每个表单的 useFormStatus 是独立的:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function Form1SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>提交表单1</button>;
}

function Form2SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>提交表单2</button>;
}

export function MyPage() {
  return (
    <>
      <form action={action1}>
        <input name="field1" />
        <Form1SubmitButton />
      </form>

      <form action={action2}>
        <input name="field2" />
        <Form2SubmitButton />
      </form>
    </>
  );
}
```

### 7.5 如何与 useOptimistic 配合使用?

**问题**: 需要同时使用乐观更新和状态显示。

**解决方案**:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { useOptimistic } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>添加</button>;
}

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
    <>
      <form action={formAction}>
        <input name="title" />
        <SubmitButton />
      </form>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  );
}
```

### 7.6 如何自定义加载动画?

**问题**: 需要更复杂的加载动画。

**解决方案**:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative px-4 py-2 bg-blue-500 text-white rounded"
    >
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
      )}
      <span className={pending ? "invisible" : ""}>提交</span>
    </button>
  );
}
```

### 7.7 如何处理表单重置?

**问题**: 提交成功后需要重置表单。

**解决方案**:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { useRef, useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>提交</button>;
}

export function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [lastPending, setLastPending] = useState(false);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (lastPending && !pending) {
      formRef.current?.reset();
    }
    setLastPending(pending);
  }, [pending]);

  return (
    <form ref={formRef} action={myAction}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

### 7.8 如何显示错误信息?

**问题**: 提交失败时显示错误。

**解决方案**:

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>提交</button>;
}

export function MyForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await myAction(formData);

    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      {error && <p className="text-red-500">{error}</p>}
      <SubmitButton />
    </form>
  );
}
```

### 7.9 如何禁用特定字段?

**问题**: 只禁用部分字段,不是全部。

**解决方案**:

```tsx
"use client";

import { useFormStatus } from "react-dom";

function FormFields() {
  const { pending } = useFormStatus();

  return (
    <>
      {/* 始终可编辑 */}
      <input name="name" placeholder="姓名" />

      {/* 提交时禁用 */}
      <input name="email" type="email" disabled={pending} placeholder="邮箱" />

      {/* 提交时禁用 */}
      <textarea name="bio" disabled={pending} placeholder="个人简介" />

      <button type="submit" disabled={pending}>
        提交
      </button>
    </>
  );
}
```

### 7.10 如何测试使用 useFormStatus 的组件?

**问题**: 如何编写测试。

**解决方案**:

```tsx
// __tests__/SubmitButton.test.tsx
import { render, screen } from "@testing-library/react";
import { useFormStatus } from "react-dom";

// Mock useFormStatus
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: jest.fn(),
}));

describe("SubmitButton", () => {
  it("should show loading state when pending", () => {
    (useFormStatus as jest.Mock).mockReturnValue({ pending: true });

    render(<SubmitButton />);

    expect(screen.getByText("提交中...")).toBeInTheDocument();
  });

  it("should show normal state when not pending", () => {
    (useFormStatus as jest.Mock).mockReturnValue({ pending: false });

    render(<SubmitButton />);

    expect(screen.getByText("提交")).toBeInTheDocument();
  });
});
```

---

## 8. 总结

### 8.1 核心要点

1. **必须在表单子组件中使用**: useFormStatus 只能在 form 标签的子组件中工作
2. **客户端组件**: 必须在'use client'组件中使用
3. **实时状态**: 提供 pending、data、method、action 等状态
4. **用户体验**: 显著提升表单交互体验
5. **简单易用**: API 简洁,易于集成

### 8.2 最佳实践

| 实践           | 说明         | 优先级 |
| -------------- | ------------ | ------ |
| 禁用提交按钮   | 防止重复提交 | 高     |
| 显示加载状态   | 提供视觉反馈 | 高     |
| 禁用表单字段   | 防止数据修改 | 中     |
| 自定义加载动画 | 提升用户体验 | 中     |
| 显示提交数据   | 调试和确认   | 低     |

### 8.3 与其他 Hook 对比

| Hook           | 用途             | 使用场景               |
| -------------- | ---------------- | ---------------------- |
| useFormStatus  | 获取表单状态     | 显示加载状态、禁用按钮 |
| useOptimistic  | 乐观更新         | 即时 UI 反馈           |
| useActionState | 管理 Action 状态 | 复杂表单状态管理       |
| useState       | 本地状态         | 简单状态管理           |

### 8.4 下一步

学习完 useFormStatus 后,建议继续学习:

1. **useOptimistic Hook**: 实现乐观更新
2. **useActionState Hook**: 管理复杂的 Action 状态
3. **表单验证**: 使用 Zod、Yup 等库
4. **错误处理**: 优雅地处理表单错误
5. **性能优化**: 优化大型表单性能

useFormStatus 是 Next.js 16 中处理表单状态的重要工具,它与 Server Actions 完美配合,提供了简洁的 API 来获取表单提交状态。通过正确使用 useFormStatus,你可以构建更好的用户体验。

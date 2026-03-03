**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useRouter Hook 完全指南

## 1. 概述

`useRouter` 是 Next.js 16 App Router 中用于客户端导航的核心 Hook。它提供了编程式导航、路由信息访问和导航控制等功能,是构建动态交互应用的关键工具。

### 1.1 概念定义

`useRouter` 是一个 React Hook,只能在客户端组件中使用,提供了访问和操作路由的能力。

**关键特征**:

- **客户端专用**: 只能在 `'use client'` 组件中使用
- **编程式导航**: 通过代码控制页面跳转
- **路由操作**: 前进、后退、刷新等操作
- **类型安全**: 完整的 TypeScript 支持

**基本用法**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function MyComponent() {
  const router = useRouter();

  function handleClick() {
    router.push("/dashboard");
  }

  return <button onClick={handleClick}>前往仪表板</button>;
}
```

### 1.2 核心价值

**灵活的导航控制**:

相比 `<Link>` 组件,`useRouter` 提供了更灵活的导航控制,可以在任何时机、任何条件下触发导航,如表单提交后、API 调用成功后等。

**丰富的路由操作**:

除了基本的页面跳转,还支持前进、后退、刷新等操作,满足各种复杂的导航需求。

**与业务逻辑集成**:

可以将导航逻辑与业务逻辑紧密结合,如权限验证、数据保存、用户确认等。

**优化用户体验**:

通过编程式导航,可以实现更流畅的用户体验,如自动跳转、条件跳转、延迟跳转等。

### 1.3 与 Pages Router 的区别

| 特性      | Pages Router                      | App Router                                         |
| :-------- | :-------------------------------- | :------------------------------------------------- |
| 导入路径  | `next/router`                     | `next/navigation`                                  |
| Hook 名称 | `useRouter`                       | `useRouter`                                        |
| 路由信息  | `router.pathname`, `router.query` | 使用独立的 Hook (`usePathname`, `useSearchParams`) |
| 路由事件  | `router.events`                   | 不支持,使用其他方式                                |
| 预取控制  | `router.prefetch()`               | `router.prefetch()`                                |
| 导航方法  | `push`, `replace`, `back`         | `push`, `replace`, `back`, `forward`, `refresh`    |

**迁移示例**:

```tsx
// Pages Router
import { useRouter } from "next/router";

function Component() {
  const router = useRouter();
  const { pathname, query } = router;

  router.push("/dashboard");
}

// App Router
("use client");

import { useRouter, usePathname, useSearchParams } from "next/navigation";

function Component() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  router.push("/dashboard");
}
```

---

## 2. 核心概念与原理

### 2.1 API 签名

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();
```

**返回值**:

`useRouter` 返回一个包含以下方法的对象:

```tsx
interface Router {
  push(href: string, options?: NavigateOptions): void;
  replace(href: string, options?: NavigateOptions): void;
  refresh(): void;
  back(): void;
  forward(): void;
  prefetch(href: string): void;
}

interface NavigateOptions {
  scroll?: boolean;
}
```

### 2.2 push 方法

`push` 方法用于导航到新页面,会在浏览器历史记录中添加新条目。

**签名**:

```tsx
router.push(href: string, options?: { scroll?: boolean }): void
```

**参数**:

- `href`: 目标路径,可以是相对路径或绝对路径
- `options.scroll`: 是否滚动到页面顶部,默认 `true`

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function MyComponent() {
  const router = useRouter();

  // 基本导航
  function goToDashboard() {
    router.push("/dashboard");
  }

  // 带查询参数
  function goToSearch() {
    router.push("/search?q=nextjs");
  }

  // 禁用自动滚动
  function goToSection() {
    router.push("/page#section", { scroll: false });
  }

  return (
    <div>
      <button onClick={goToDashboard}>仪表板</button>
      <button onClick={goToSearch}>搜索</button>
      <button onClick={goToSection}>跳转到章节</button>
    </div>
  );
}
```

### 2.3 replace 方法

`replace` 方法用于导航到新页面,但会替换当前的历史记录条目,而不是添加新条目。

**签名**:

```tsx
router.replace(href: string, options?: { scroll?: boolean }): void
```

**使用场景**:

- 登录后跳转,不希望用户返回到登录页
- 表单提交后跳转,避免重复提交
- 重定向场景

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const success = await login();

    if (success) {
      // 使用 replace,用户无法返回到登录页
      router.replace("/dashboard");
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 2.4 refresh 方法

`refresh` 方法用于刷新当前路由,重新获取服务端数据。

**签名**:

```tsx
router.refresh(): void
```

**使用场景**:

- 数据更新后刷新页面
- 手动触发重新验证
- 强制重新获取服务端数据

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function DataManager() {
  const router = useRouter();

  async function handleUpdate() {
    await updateData();

    // 刷新页面以显示最新数据
    router.refresh();
  }

  return <button onClick={handleUpdate}>更新数据</button>;
}
```

### 2.5 back 和 forward 方法

`back` 和 `forward` 方法用于在浏览器历史记录中前进和后退。

**签名**:

```tsx
router.back(): void
router.forward(): void
```

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.back()}>后退</button>
      <button onClick={() => router.forward()}>前进</button>
    </div>
  );
}
```

### 2.6 prefetch 方法

`prefetch` 方法用于预取指定路由的数据,提升导航速度。

**签名**:

```tsx
router.prefetch(href: string): void
```

**示例**:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyComponent() {
  const router = useRouter();

  useEffect(() => {
    // 预取可能访问的页面
    router.prefetch("/dashboard");
    router.prefetch("/settings");
  }, [router]);

  return <div>...</div>;
}
```

---

## 3. 适用场景

### 3.1 表单提交后跳转

**场景**: 表单提交成功后跳转到结果页面。

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // 提交成功,跳转到感谢页面
      router.push("/thank-you");
    } else {
      setLoading(false);
      alert("提交失败,请重试");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={loading}>
        {loading ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

### 3.2 权限验证后跳转

**场景**: 检查用户权限,未登录则跳转到登录页。

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("/api/auth/check");

      if (!response.ok) {
        // 未登录,跳转到登录页
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  return <div>受保护的内容</div>;
}
```

### 3.3 搜索功能

**场景**: 搜索框输入后跳转到搜索结果页。

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (query.trim()) {
      // 跳转到搜索结果页,带查询参数
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form onSubmit={handleSearch}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      <button type="submit">搜索</button>
    </form>
  );
}
```

### 3.4 多步骤向导

**场景**: 多步骤表单,每一步完成后跳转到下一步。

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Step1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  function handleNext() {
    // 保存数据到 localStorage 或状态管理
    localStorage.setItem("step1", JSON.stringify(formData));

    // 跳转到下一步
    router.push("/wizard/step2");
  }

  return (
    <div>
      <h1>步骤 1: 基本信息</h1>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="姓名"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="邮箱"
      />
      <button onClick={handleNext}>下一步</button>
    </div>
  );
}
```

### 3.5 条件跳转

**场景**: 根据用户角色跳转到不同页面。

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    async function redirectByRole() {
      const response = await fetch("/api/user/role");
      const { role } = await response.json();

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "user") {
        router.push("/user/dashboard");
      } else {
        router.push("/guest/dashboard");
      }
    }

    redirectByRole();
  }, [router]);

  return <div>加载中...</div>;
}
```

---

## 4. API 签名与配置

### 4.1 完整类型定义

```tsx
import { useRouter } from "next/navigation";

interface AppRouterInstance {
  push(href: string, options?: NavigateOptions): void;
  replace(href: string, options?: NavigateOptions): void;
  refresh(): void;
  back(): void;
  forward(): void;
  prefetch(href: string): void;
}

interface NavigateOptions {
  scroll?: boolean;
}

const router: AppRouterInstance = useRouter();
```

### 4.2 导航选项

**scroll 选项**:

```tsx
// 跳转后滚动到顶部(默认)
router.push("/page", { scroll: true });

// 跳转后保持滚动位置
router.push("/page", { scroll: false });

// 跳转到锚点,不自动滚动
router.push("/page#section", { scroll: false });
```

### 4.3 路径格式

**绝对路径**:

```tsx
router.push("/dashboard");
router.push("/blog/post-1");
```

**带查询参数**:

```tsx
router.push("/search?q=nextjs");
router.push("/products?category=electronics&sort=price");
```

**带哈希**:

```tsx
router.push("/page#section");
router.push("/docs/api#methods");
```

**外部 URL**:

```tsx
// ❌ 不支持外部 URL
router.push("https://example.com");

// ✅ 使用 window.location
window.location.href = "https://example.com";
```

---

## 5. 基础与进阶使用

### 5.1 基础用法:简单导航

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push("/")}>首页</button>
      <button onClick={() => router.push("/about")}>关于</button>
      <button onClick={() => router.back()}>返回</button>
    </div>
  );
}
```

### 5.2 中级用法:带参数导航

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function ProductList() {
  const router = useRouter();

  function viewProduct(id: string) {
    router.push(`/products/${id}`);
  }

  function filterByCategory(category: string) {
    router.push(`/products?category=${category}`);
  }

  return (
    <div>
      <button onClick={() => viewProduct("123")}>查看产品</button>
      <button onClick={() => filterByCategory("electronics")}>电子产品</button>
    </div>
  );
}
```

### 5.3 高级用法:异步导航

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AsyncNavigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleNavigate() {
    setLoading(true);

    try {
      // 执行一些异步操作
      await saveData();
      await logEvent();

      // 操作完成后导航
      router.push("/success");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <button onClick={handleNavigate} disabled={loading}>
      {loading ? "处理中..." : "保存并继续"}
    </button>
  );
}
```

### 5.4 高级用法:条件导航

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function ConditionalNavigation() {
  const router = useRouter();

  function handleNavigate() {
    const hasUnsavedChanges = checkUnsavedChanges();

    if (hasUnsavedChanges) {
      const confirmed = confirm("有未保存的更改,确定离开吗?");
      if (!confirmed) return;
    }

    router.push("/next-page");
  }

  return <button onClick={handleNavigate}>离开页面</button>;
}
```

### 5.5 高级用法:预取优化

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OptimizedNavigation() {
  const router = useRouter();

  useEffect(() => {
    // 预取可能访问的页面
    const pagesToPrefetch = ["/dashboard", "/settings", "/profile"];

    pagesToPrefetch.forEach((page) => {
      router.prefetch(page);
    });
  }, [router]);

  return (
    <nav>
      <button onClick={() => router.push("/dashboard")}>仪表板</button>
      <button onClick={() => router.push("/settings")}>设置</button>
      <button onClick={() => router.push("/profile")}>个人资料</button>
    </nav>
  );
}
```

### 5.6 高级用法:与 useTransition 结合

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function TransitionNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleNavigate(path: string) {
    startTransition(() => {
      router.push(path);
    });
  }

  return (
    <div>
      <button onClick={() => handleNavigate("/page1")} disabled={isPending}>
        {isPending ? "跳转中..." : "页面 1"}
      </button>
      <button onClick={() => handleNavigate("/page2")} disabled={isPending}>
        {isPending ? "跳转中..." : "页面 2"}
      </button>
    </div>
  );
}
```

### 5.7 高级用法:表单提交后导航

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FormWithNavigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // 提交成功后导航
        router.push("/success");
      } else {
        alert("提交失败");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      <button type="submit" disabled={loading}>
        {loading ? "提交中..." : "提交"}
      </button>
    </form>
  );
}
```

### 5.8 高级用法:多步骤向导

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MultiStepWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  function handleNext(data: any) {
    setFormData({ ...formData, ...data });

    if (step < 3) {
      setStep(step + 1);
      router.push(`/wizard/step-${step + 1}`, { scroll: false });
    } else {
      // 最后一步,提交并导航到结果页
      submitForm({ ...formData, ...data });
      router.push("/wizard/complete");
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      router.back();
    }
  }

  return (
    <div>
      <h2>步骤 {step} / 3</h2>
      {/* 步骤内容 */}
      <div>
        <button onClick={handleBack} disabled={step === 1}>
          上一步
        </button>
        <button onClick={() => handleNext({})}>
          {step === 3 ? "完成" : "下一步"}
        </button>
      </div>
    </div>
  );
}
```

---

## 6. 注意事项

### 6.1 只能在客户端组件中使用

`useRouter` 只能在客户端组件中使用:

```tsx
// ❌ 错误:服务端组件不能使用 useRouter
export default function ServerComponent() {
  const router = useRouter(); // 错误!
  return <div>...</div>;
}

// ✅ 正确:客户端组件
("use client");

export default function ClientComponent() {
  const router = useRouter(); // 正确
  return <div>...</div>;
}
```

### 6.2 不支持外部 URL

`useRouter` 不支持导航到外部 URL:

```tsx
// ❌ 错误:不支持外部 URL
router.push("https://example.com");

// ✅ 正确:使用 window.location
window.location.href = "https://example.com";

// 或者使用 <a> 标签
<a href="https://example.com" target="_blank">
  外部链接
</a>;
```

### 6.3 导航是异步的

`router.push()` 是异步操作,不会立即完成:

```tsx
// ❌ 错误:导航后立即访问新页面的状态
router.push("/new-page");
console.log(window.location.pathname); // 可能还是旧路径

// ✅ 正确:使用 useEffect 监听路由变化
import { usePathname } from "next/navigation";

const pathname = usePathname();

useEffect(() => {
  console.log("当前路径:", pathname);
}, [pathname]);
```

### 6.4 避免在渲染期间调用

不要在组件渲染期间调用 `router.push()`:

```tsx
// ❌ 错误:在渲染期间导航
export default function Component() {
  const router = useRouter();

  if (condition) {
    router.push("/other-page"); // 错误!
  }

  return <div>...</div>;
}

// ✅ 正确:在 useEffect 中导航
export default function Component() {
  const router = useRouter();

  useEffect(() => {
    if (condition) {
      router.push("/other-page");
    }
  }, [condition, router]);

  return <div>...</div>;
}
```

### 6.5 refresh() 的行为

`router.refresh()` 会重新获取服务端数据,但不会重置客户端状态:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Component() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  function handleRefresh() {
    router.refresh(); // 重新获取服务端数据
    // count 状态不会重置
  }

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={handleRefresh}>刷新</button>
    </div>
  );
}
```

### 6.6 预取的限制

`router.prefetch()` 只在生产环境有效:

```tsx
useEffect(() => {
  // 开发环境不会预取
  // 生产环境会预取
  router.prefetch("/dashboard");
}, [router]);
```

### 6.7 back() 和 forward() 的边界情况

处理历史记录边界:

```tsx
function handleBack() {
  // 检查是否有历史记录
  if (window.history.length > 1) {
    router.back();
  } else {
    // 没有历史记录,导航到首页
    router.push("/");
  }
}
```

### 6.8 滚动行为

默认情况下,导航会滚动到顶部:

```tsx
// 默认:滚动到顶部
router.push("/page");

// 保持滚动位置
router.push("/page", { scroll: false });

// 滚动到特定元素
router.push("/page#section", { scroll: true });
```

---

## 7. 常见问题

### 7.1 如何在导航前确认?

使用浏览器的 `beforeunload` 事件或自定义确认:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Component() {
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function handleNavigate(path: string) {
    if (hasUnsavedChanges) {
      const confirmed = confirm("有未保存的更改,确定离开吗?");
      if (!confirmed) return;
    }

    router.push(path);
  }

  return <button onClick={() => handleNavigate("/other-page")}>离开</button>;
}
```

### 7.2 如何获取当前路由信息?

使用其他 Hook 获取路由信息:

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Component() {
  const router = useRouter();
  const pathname = usePathname(); // 当前路径
  const searchParams = useSearchParams(); // 查询参数

  console.log("当前路径:", pathname);
  console.log("查询参数:", searchParams.get("q"));

  return <div>...</div>;
}
```

### 7.3 如何实现编程式重定向?

在客户端组件中使用 `router.push()` 或 `router.replace()`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = checkAuth();

    if (!isAuthenticated) {
      router.replace("/login"); // 重定向到登录页
    }
  }, [router]);

  return <div>受保护的内容</div>;
}
```

### 7.4 如何处理导航错误?

使用 try-catch 包裹异步操作:

```tsx
async function handleNavigate() {
  try {
    await saveData();
    router.push("/success");
  } catch (error) {
    console.error("导航失败:", error);
    alert("操作失败,请重试");
  }
}
```

### 7.5 如何实现条件导航?

根据条件决定导航目标:

```tsx
function handleNavigate() {
  const user = getCurrentUser();

  if (user.role === "admin") {
    router.push("/admin/dashboard");
  } else if (user.role === "user") {
    router.push("/user/dashboard");
  } else {
    router.push("/");
  }
}
```

### 7.6 如何在导航时传递状态?

使用 URL 参数或全局状态管理:

```tsx
// 方法 1: URL 参数
router.push(`/page?data=${encodeURIComponent(JSON.stringify(data))}`);

// 方法 2: 全局状态(如 Zustand, Redux)
import { useStore } from "@/store";

function handleNavigate() {
  const { setData } = useStore();
  setData(data);
  router.push("/page");
}
```

### 7.7 useRouter 与 Link 组件的区别?

| 特性       | useRouter              | Link 组件          |
| :--------- | :--------------------- | :----------------- |
| 使用场景   | 编程式导航             | 声明式导航         |
| 预取       | 手动调用 prefetch()    | 自动预取           |
| SEO        | 不利于 SEO             | 有利于 SEO         |
| 可访问性   | 需要手动处理           | 自动处理           |
| 事件处理   | 完全控制               | 有限控制           |
| 条件导航   | 容易实现               | 需要额外逻辑       |
| 客户端组件 | 必须在客户端组件中使用 | 可以在任何组件使用 |
| 性能       | 需要手动优化           | 自动优化           |

**建议**:

- 优先使用 `<Link>` 组件
- 只在需要编程式导航时使用 `useRouter`

### 7.8 如何实现导航加载状态?

使用 `useTransition` 或自定义状态:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function Component() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleNavigate() {
    startTransition(() => {
      router.push("/page");
    });
  }

  return (
    <button onClick={handleNavigate} disabled={isPending}>
      {isPending ? "跳转中..." : "前往页面"}
    </button>
  );
}
```

### 7.9 如何实现返回上一页?

使用 `router.back()`:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();

  return <button onClick={() => router.back()}>返回</button>;
}
```

### 7.10 如何实现页面刷新?

使用 `router.refresh()`:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();

  return <button onClick={() => router.refresh()}>刷新数据</button>;
}
```

---

## 8. 总结

`useRouter` 是 Next.js App Router 中实现编程式导航的核心 Hook。

**核心要点**:

1. **客户端专用**: 只能在客户端组件中使用
2. **导航方法**: push, replace, back, forward, refresh
3. **预取优化**: 使用 prefetch() 提前加载页面
4. **滚动控制**: 通过 scroll 选项控制滚动行为
5. **异步操作**: 导航是异步的,需要正确处理

**最佳实践**:

- 优先使用 `<Link>` 组件,只在必要时使用 `useRouter`
- 在 useEffect 中执行导航,避免在渲染期间导航
- 使用 useTransition 提供导航加载状态
- 处理边界情况,如历史记录为空
- 为外部 URL 使用 window.location
- 合理使用预取优化性能

**适用场景**:

- 表单提交后导航
- 条件导航
- 异步操作后导航
- 多步骤向导
- 编程式重定向
- 页面刷新

掌握 `useRouter`,可以实现灵活的客户端导航逻辑。

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-26-usePathname 与 useRouter 详解

## 概述

usePathname 和 useRouter 是 Next.js 16 App Router 中最重要的客户端导航 Hook。usePathname 用于读取当前 URL 的路径名,useRouter 用于编程式导航和路由操作。这两个 Hook 只能在客户端组件中使用,为 React 应用提供了强大的路由控制能力。

### 核心特性

**usePathname**:

- **路径读取**: 读取当前 URL 的 pathname
- **客户端 Hook**: 只能在 Client Component 中使用
- **响应式**: 路由变化时自动更新
- **简单易用**: 返回字符串类型的路径
- **无参数**: 不需要传入任何参数

**useRouter**:

- **编程式导航**: push、replace、back、forward 等方法
- **预取控制**: prefetch 方法预加载路由
- **刷新页面**: refresh 方法重新获取数据
- **客户端 Hook**: 只能在 Client Component 中使用
- **类型安全**: 完整的 TypeScript 支持

### Hook 对比

| 特性     | usePathname | useRouter   | useSearchParams |
| -------- | ----------- | ----------- | --------------- |
| 用途     | 读取路径    | 导航控制    | 读取查询参数    |
| 返回值   | string      | Router 对象 | URLSearchParams |
| 导航能力 | ✗           | ✓           | ✗               |
| 路径读取 | ✓           | ✗           | ✗               |
| 参数读取 | ✗           | ✗           | ✓               |
| 预取控制 | ✗           | ✓           | ✗               |

---

## 1. usePathname 基础用法

### 1.1 读取当前路径

```tsx
// app/components/Breadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  return (
    <div>
      <p>Current Path: {pathname}</p>
    </div>
  );
}
```

### 1.2 路径匹配

```tsx
// app/components/Navigation.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav>
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={isActive ? "active" : ""}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### 1.3 动态路由路径

```tsx
// app/components/ProductNav.tsx
"use client";

import { usePathname } from "next/navigation";

export default function ProductNav() {
  const pathname = usePathname();

  // pathname: /products/123
  const segments = pathname.split("/").filter(Boolean);
  const productId = segments[1];

  return (
    <div>
      <p>Category: {segments[0]}</p>
      <p>Product ID: {productId}</p>
    </div>
  );
}
```

---

## 2. useRouter 基础用法

### 2.1 编程式导航

```tsx
// app/components/LoginButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    // 执行登录逻辑
    const success = await login();

    if (success) {
      // 导航到首页
      router.push("/dashboard");
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}

async function login() {
  return true;
}
```

### 2.2 替换历史记录

```tsx
// app/components/SearchForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    // 使用replace不会在历史记录中添加新条目
    router.replace(`/search?q=${query}`);
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
```

### 2.3 返回上一页

```tsx
// app/components/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return <button onClick={() => router.back()}>Go Back</button>;
}
```

---

## 3. 高级用法

### 3.1 路径分析与面包屑

```tsx
// app/components/Breadcrumbs.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { href, label };
  });

  return (
    <nav>
      <Link href="/">Home</Link>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href}>
          {" / "}
          {index === breadcrumbs.length - 1 ? (
            <span>{crumb.label}</span>
          ) : (
            <Link href={crumb.href}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
```

### 3.2 条件导航

```tsx
// app/components/ConditionalNav.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConditionalNav() {
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleNavigate = (href: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Continue?");
      if (!confirmed) return;
    }

    router.push(href);
  };

  return (
    <div>
      <button onClick={() => handleNavigate("/dashboard")}>
        Go to Dashboard
      </button>
    </div>
  );
}
```

### 3.3 路由预取

```tsx
// app/components/PrefetchLinks.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrefetchLinks() {
  const router = useRouter();

  useEffect(() => {
    // 预取重要页面
    router.prefetch("/dashboard");
    router.prefetch("/profile");
  }, [router]);

  return (
    <div>
      <button onClick={() => router.push("/dashboard")}>
        Dashboard (Prefetched)
      </button>
    </div>
  );
}
```

### 3.4 刷新数据

```tsx
// app/components/RefreshButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();

  const handleRefresh = () => {
    // 重新获取当前路由的数据
    router.refresh();
  };

  return <button onClick={handleRefresh}>Refresh Data</button>;
}
```

### 3.5 路径状态管理

```tsx
// app/components/PathTracker.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PathTracker() {
  const pathname = usePathname();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory((prev) => [...prev, pathname]);
  }, [pathname]);

  return (
    <div>
      <h3>Navigation History:</h3>
      <ul>
        {history.map((path, index) => (
          <li key={index}>{path}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.6 动态导航菜单

```tsx
// app/components/DynamicMenu.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  href: string;
  label: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    href: "/products",
    label: "Products",
    children: [
      { href: "/products/electronics", label: "Electronics" },
      { href: "/products/clothing", label: "Clothing" },
    ],
  },
  {
    href: "/about",
    label: "About",
  },
];

export default function DynamicMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav>
      {menuItems.map((item) => (
        <div key={item.href}>
          <Link
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
          >
            {item.label}
          </Link>

          {item.children && isActive(item.href) && (
            <ul>
              {item.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={isActive(child.href) ? "active" : ""}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
```

---

## 4. 实战案例

### 4.1 多步骤表单导航

```tsx
// app/components/MultiStepForm.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const steps = [
  { path: "/signup/step1", label: "Personal Info" },
  { path: "/signup/step2", label: "Address" },
  { path: "/signup/step3", label: "Payment" },
];

export default function MultiStepForm() {
  const router = useRouter();
  const pathname = usePathname();
  const [formData, setFormData] = useState({});

  const currentStepIndex = steps.findIndex((step) => step.path === pathname);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      router.push(steps[currentStepIndex + 1].path);
    } else {
      submitForm(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      router.push(steps[currentStepIndex - 1].path);
    }
  };

  return (
    <div>
      <div>
        {steps.map((step, index) => (
          <span
            key={step.path}
            className={index === currentStepIndex ? "active" : ""}
          >
            {step.label}
          </span>
        ))}
      </div>

      <div>
        {currentStepIndex > 0 && (
          <button onClick={handlePrevious}>Previous</button>
        )}
        <button onClick={handleNext}>
          {currentStepIndex === steps.length - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}

function submitForm(data: any) {
  console.log("Submitting:", data);
}
```

### 4.2 权限路由守卫

```tsx
// app/components/ProtectedRoute.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  role: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const userData = await response.json();

      if (!userData || userData.role !== requiredRole) {
        router.push("/login?redirect=" + pathname);
        return;
      }

      setUser(userData);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

### 4.3 搜索过滤器

```tsx
// app/components/SearchFilter.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState({
    category: "",
    priceRange: "",
    sortBy: "",
  });

  const applyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl);
  };

  return (
    <div>
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <button onClick={applyFilters}>Apply Filters</button>
    </div>
  );
}
```

### 4.4 Tab 导航

```tsx
// app/components/TabNavigation.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { id: "overview", label: "Overview", path: "/dashboard/overview" },
  { id: "analytics", label: "Analytics", path: "/dashboard/analytics" },
  { id: "settings", label: "Settings", path: "/dashboard/settings" },
];

export default function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => router.push(tab.path)}
          className={pathname === tab.path ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

### 4.5 语言切换

```tsx
// app/components/LanguageSwitcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const segments = pathname.split("/").filter(Boolean);
    const currentLocale = segments[0];

    if (["en", "zh", "ja"].includes(currentLocale)) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }

    router.push("/" + segments.join("/"));
  };

  return (
    <div>
      <button onClick={() => switchLanguage("en")}>English</button>
      <button onClick={() => switchLanguage("zh")}>中文</button>
      <button onClick={() => switchLanguage("ja")}>日本語</button>
    </div>
  );
}
```

---

## 5. 适用场景

usePathname 和 useRouter 适用于以下场景:

1. **导航菜单**: 高亮当前激活的菜单项
2. **面包屑**: 根据当前路径生成面包屑导航
3. **权限控制**: 根据路径判断用户权限
4. **多步骤表单**: 管理表单步骤导航
5. **Tab 切换**: 实现 Tab 导航
6. **搜索过滤**: 更新 URL 参数
7. **语言切换**: 切换多语言路径
8. **条件导航**: 根据状态决定是否导航
9. **路由预取**: 预加载重要页面
10. **数据刷新**: 重新获取当前页面数据

---

## 6. 注意事项

### 6.1 客户端组件限制

usePathname 和 useRouter 只能在客户端组件中使用:

```tsx
// ✓ 正确 - 客户端组件
"use client";

import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();
  return <div>{pathname}</div>;
}

// ✗ 错误 - 服务端组件
import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname(); // 错误!
  return <div>{pathname}</div>;
}
```

### 6.2 性能考虑

避免在 useEffect 中频繁调用 router 方法:

```tsx
// ✗ 不推荐
useEffect(() => {
  router.push("/new-path"); // 可能导致无限循环
}, [pathname]);

// ✓ 推荐
const handleClick = () => {
  router.push("/new-path");
};
```

### 6.3 路径匹配

使用 startsWith 进行路径前缀匹配:

```tsx
const isActive = pathname.startsWith("/products");
```

### 6.4 历史记录管理

使用 push 和 replace 的区别:

| 方法    | 历史记录     | 返回按钮 | 使用场景     |
| ------- | ------------ | -------- | ------------ |
| push    | 添加新条目   | 可返回   | 正常导航     |
| replace | 替换当前条目 | 不可返回 | 重定向、搜索 |

### 6.5 预取策略

合理使用 prefetch 避免过度预取:

```tsx
// 只预取重要页面
useEffect(() => {
  router.prefetch("/dashboard");
  router.prefetch("/profile");
}, []);
```

---

## 7. 常见问题

### 7.1 如何获取查询参数?

**问题**: usePathname 不包含查询参数。

**解决方案**:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function Component() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  return <div>Query: {query}</div>;
}
```

### 7.2 如何在服务端组件中获取路径?

**问题**: 服务端组件不能使用 usePathname。

**解决方案**:

```tsx
// app/page.tsx
import { headers } from "next/headers";

export default function Page() {
  const headersList = headers();
  const pathname = headersList.get("x-pathname");

  return <div>{pathname}</div>;
}
```

### 7.3 如何监听路由变化?

**问题**: 需要在路由变化时执行操作。

**解决方案**:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Component() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("Route changed:", pathname);
  }, [pathname]);

  return <div>{pathname}</div>;
}
```

### 7.4 如何实现路由守卫?

**问题**: 需要在导航前检查权限。

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkUserAuth();
      if (!isAuthenticated) {
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  return <div>Protected Content</div>;
}

async function checkUserAuth() {
  return true;
}
```

### 7.5 如何保留滚动位置?

**问题**: 导航后滚动位置重置。

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();

  const handleNavigate = () => {
    // 保存滚动位置
    sessionStorage.setItem("scrollPos", window.scrollY.toString());
    router.push("/new-page");
  };

  return <button onClick={handleNavigate}>Navigate</button>;
}
```

### 7.6 如何实现条件重定向?

**问题**: 根据条件重定向到不同页面。

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Component() {
  const router = useRouter();

  useEffect(() => {
    const userRole = getUserRole();

    if (userRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/user");
    }
  }, []);

  return <div>Redirecting...</div>;
}

function getUserRole() {
  return "admin";
}
```

### 7.7 如何处理 404 页面?

**问题**: 需要自定义 404 处理。

**解决方案**:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Path: {pathname}</p>
      <p>Redirecting to home...</p>
    </div>
  );
}
```

### 7.8 如何实现路由动画?

**问题**: 需要在路由切换时添加动画。

**解决方案**:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AnimatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return <div className={isAnimating ? "fade-in" : ""}>{children}</div>;
}
```

### 7.9 如何实现返回确认?

**问题**: 返回前需要用户确认。

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();

  const handleBack = () => {
    const confirmed = window.confirm("Are you sure you want to go back?");
    if (confirmed) {
      router.back();
    }
  };

  return <button onClick={handleBack}>Go Back</button>;
}
```

### 7.10 如何实现路由缓存?

**问题**: 需要缓存路由数据。

**解决方案**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function Component() {
  const router = useRouter();

  const handleNavigate = () => {
    // 预取并缓存
    router.prefetch("/dashboard");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return <button onClick={handleNavigate}>Go to Dashboard</button>;
}
```

---

## 8. 总结

usePathname 和 useRouter 是 Next.js 16 App Router 中最重要的客户端导航 Hook。usePathname 用于读取当前路径,useRouter 用于编程式导航。

### 核心要点

1. **客户端 Hook**: 只能在 Client Component 中使用
2. **路径读取**: usePathname 返回当前路径字符串
3. **编程式导航**: useRouter 提供 push、replace 等方法
4. **路由预取**: 使用 prefetch 预加载页面
5. **数据刷新**: 使用 refresh 重新获取数据
6. **历史管理**: push 添加历史,replace 替换历史
7. **性能优化**: 合理使用预取和缓存
8. **类型安全**: 完整的 TypeScript 支持

这两个 Hook 为 Next.js 应用提供了强大的客户端路由控制能力,是构建现代 Web 应用的重要工具。

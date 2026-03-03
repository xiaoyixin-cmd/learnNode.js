**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 01-10-客户端组件(Client Components)详解

## 概述

### 什么是客户端组件

客户端组件 (Client Components) 是在浏览器中执行的 React 组件,通过 `'use client'` 指令标记。它们支持所有传统 React 特性,包括状态管理 (useState)、副作用 (useEffect)、事件处理器和浏览器 API。在 Next.js 16 的架构中,客户端组件与服务端组件互补,共同构建高性能的混合应用。

虽然 Next.js 默认所有组件都是服务端组件,但客户端组件仍然是构建交互式用户界面不可或缺的部分。关键是理解何时使用客户端组件,以及如何高效地组织它们。

### 客户端组件的核心价值

**1. 交互性**

- 状态管理 (useState, useReducer)
- 事件处理 (onClick, onChange)
- 表单交互
- 动画和过渡

**2. 浏览器 API 访问**

- localStorage, sessionStorage
- window, document 对象
- 地理位置 API
- Web APIs (Canvas, WebGL)

**3. 生命周期钩子**

- useEffect
- useLayoutEffect
- 组件挂载/卸载逻辑

**4. 第三方客户端库**

- 图表库 (Chart.js, Recharts)
- 地图库 (Leaflet, Mapbox)
- 动画库 (Framer Motion, GSAP)
- 富文本编辑器

### 客户端组件 vs 传统 React 组件

| 特性     | 传统 React 组件 | Next.js 客户端组件                 |
| -------- | --------------- | ---------------------------------- |
| 标记方式 | 无需标记        | `'use client'`                     |
| 渲染位置 | 客户端          | 服务端预渲染 + 客户端水合          |
| SEO      | 需要 SSR 框架   | 自动 SSR                           |
| 数据获取 | useEffect       | useEffect 或 Server Component 传递 |
| 性能     | 依赖实现        | 自动优化                           |

---

## 第一部分:客户端组件基础

### 1.1 'use client' 指令

#### 基础用法

```typescript
// components/Counter.tsx
"use client"; // 必须在文件顶部,任何 import 之前

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

**规则**:

- `'use client'` 必须在文件最顶部
- 在任何 import 语句之前
- 只需在入口文件标记,子组件自动继承

#### 错误示例

```typescript
// ❌ 错误:import 在 'use client' 之前
import { useState } from "react";

("use client"); // 错误位置!

export default function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// ✅ 正确
("use client");

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

### 1.2 状态管理

#### useState Hook

```typescript
// components/TodoList.tsx
"use client";

import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: input,
          completed: false,
        },
      ]);
      setInput("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="添加待办事项"
      />
      <button onClick={addTodo}>添加</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### useReducer Hook

```typescript
// components/ComplexForm.tsx
"use client";

import { useReducer } from "react";

type State = {
  name: string;
  email: string;
  age: number;
  errors: Record<string, string>;
};

type Action =
  | {
      type: "SET_FIELD";
      field: keyof Omit<State, "errors">;
      value: string | number;
    }
  | { type: "SET_ERROR"; field: string; error: string }
  | { type: "RESET" };

const initialState: State = {
  name: "",
  email: "",
  age: 0,
  errors: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function ComplexForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!state.name) {
      dispatch({ type: "SET_ERROR", field: "name", error: "姓名必填" });
      return;
    }

    console.log("提交:", state);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.name}
        onChange={(e) =>
          dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })
        }
        placeholder="姓名"
      />
      {state.errors.name && <p className="error">{state.errors.name}</p>}

      <input
        type="email"
        value={state.email}
        onChange={(e) =>
          dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })
        }
        placeholder="邮箱"
      />

      <button type="submit">提交</button>
      <button type="button" onClick={() => dispatch({ type: "RESET" })}>
        重置
      </button>
    </form>
  );
}
```

### 1.3 副作用处理

#### useEffect Hook

```typescript
// components/UserProfile.tsx
"use client";

import { useState, useEffect } from "react";

export default function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);

      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();

        if (!cancelled) {
          setUser(data);
        }
      } catch (error) {
        console.error("获取用户失败:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户未找到</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

#### useLayoutEffect Hook

```typescript
// components/MeasureElement.tsx
"use client";

import { useLayoutEffect, useRef, useState } from "react";

export default function MeasureElement() {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  return (
    <div>
      <div ref={ref} style={{ padding: "20px", background: "#f0f0f0" }}>
        测量我的尺寸
      </div>
      <p>
        宽度: {dimensions.width}px, 高度: {dimensions.height}px
      </p>
    </div>
  );
}
```

### 1.4 事件处理

#### 基础事件处理

```typescript
// components/ClickCounter.tsx
"use client";

import { useState } from "react";

export default function ClickCounter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  const handleDoubleClick = () => {
    setCount(count * 2);
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div>
      <p>点击次数: {count}</p>
      <button onClick={handleClick}>单击</button>
      <button onDoubleClick={handleDoubleClick}>双击</button>
      <button onClick={handleReset}>重置</button>
    </div>
  );
}
```

#### 表单事件处理

```typescript
// components/SearchForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="搜索..."
      />
      <button type="submit">搜索</button>
    </form>
  );
}
```

---

## 第二部分:浏览器 API 访问

### 2.1 localStorage 和 sessionStorage

```typescript
// components/PersistentCounter.tsx
"use client";

import { useState, useEffect } from "react";

export default function PersistentCounter() {
  const [count, setCount] = useState(0);

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem("count");
    if (saved !== null) {
      setCount(parseInt(saved, 10));
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("count", count.toString());
  }, [count]);

  return (
    <div>
      <p>持久化计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
```

### 2.2 window 和 document 对象

```typescript
// components/WindowInfo.tsx
"use client";

import { useState, useEffect } from "react";

export default function WindowInfo() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 初始设置
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <p>窗口宽度: {windowSize.width}px</p>
      <p>窗口高度: {windowSize.height}px</p>
    </div>
  );
}
```

### 2.3 地理位置 API

```typescript
// components/Geolocation.tsx
"use client";

import { useState } from "react";

export default function Geolocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError("");
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("浏览器不支持地理位置");
    }
  };

  return (
    <div>
      <button onClick={getLocation}>获取位置</button>

      {location && (
        <p>
          纬度: {location.latitude}, 经度: {location.longitude}
        </p>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 第三部分:第三方库集成

### 3.1 图表库 (Recharts)

```typescript
// components/SalesChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SalesChartProps {
  data: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div>
      <h2>销售数据</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="sales" stroke="#8884d8" />
        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}
```

### 3.2 动画库 (Framer Motion)

```typescript
// components/AnimatedCard.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function AnimatedCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="card"
      layout
      onClick={() => setIsOpen(!isOpen)}
      style={{
        padding: "20px",
        background: "#fff",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      <motion.h2 layout="position">可展开卡片</motion.h2>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p>这是展开的内容</p>
          <p>点击卡片可以折叠</p>
        </motion.div>
      )}
    </motion.div>
  );
}
```

### 3.3 富文本编辑器

```typescript
// components/RichTextEditor.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// 动态导入,避免 SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function RichTextEditor() {
  const [content, setContent] = useState("");

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["image", "code-block"],
          ],
        }}
      />

      <div className="preview">
        <h3>预览</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
```

---

## 第四部分:高级模式

### 4.1 Context API

```typescript
// contexts/ThemeContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

// components/ThemeToggle.tsx
("use client");

import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      切换到 {theme === "light" ? "暗黑" : "明亮"} 模式
    </button>
  );
}
```

### 4.2 自定义 Hooks

```typescript
// hooks/useLocalStorage.ts
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 使用示例
// components/Settings.tsx
("use client");

import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Settings() {
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 16);

  return (
    <div>
      <label>
        字体大小:
        <input
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
        />
        {fontSize}px
      </label>

      <p style={{ fontSize: `${fontSize}px` }}>这是预览文本</p>
    </div>
  );
}
```

### 4.3 Portal

```typescript
// components/Modal.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

// 使用示例
("use client");

import { useState } from "react";
import Modal from "@/components/Modal";

export default function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开模态框</button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>模态框标题</h2>
        <p>这是模态框内容</p>
      </Modal>
    </div>
  );
}
```

---

## 第五部分:性能优化

### 5.1 React.memo

```typescript
// components/ExpensiveComponent.tsx
"use client";

import { memo } from "react";

interface ExpensiveComponentProps {
  data: string[];
}

const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: ExpensiveComponentProps) {
  console.log("ExpensiveComponent 渲染");

  return (
    <ul>
      {data.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
});

export default ExpensiveComponent;
```

### 5.2 useMemo 和 useCallback

```typescript
// components/OptimizedList.tsx
"use client";

import { useState, useMemo, useCallback } from "react";

export default function OptimizedList() {
  const [items, setItems] = useState<string[]>(["Apple", "Banana", "Cherry"]);
  const [filter, setFilter] = useState("");

  // 记忆化过滤结果
  const filteredItems = useMemo(() => {
    console.log("计算过滤结果");
    return items.filter((item) =>
      item.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // 记忆化回调函数
  const handleAddItem = useCallback(() => {
    const newItem = prompt("输入新项目:");
    if (newItem) {
      setItems([...items, newItem]);
    }
  }, [items]);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="过滤..."
      />

      <button onClick={handleAddItem}>添加项目</button>

      <ul>
        {filteredItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.3 动态导入

```typescript
// components/HeavyComponent.tsx
"use client";

import dynamic from "next/dynamic";

// 懒加载重型组件
const Chart = dynamic(() => import("@/components/Chart"), {
  loading: () => <p>加载图表...</p>,
  ssr: false, // 禁用 SSR
});

export default function Dashboard() {
  return (
    <div>
      <h1>仪表板</h1>
      <Chart />
    </div>
  );
}
```

---

## 适用场景

### 何时使用客户端组件

**1. 需要交互**

- 按钮点击
- 表单输入
- 拖放操作

**2. 状态管理**

- 用户输入
- UI 状态
- 临时数据

**3. 浏览器 API**

- localStorage
- 地理位置
- Canvas/WebGL

**4. 生命周期**

- 组件挂载后执行逻辑
- 订阅/取消订阅
- 定时器

**5. 第三方库**

- 需要 window 的库
- 客户端专属库
- 动画库

---

## 注意事项

### 1. 最小化客户端组件

```typescript
// ❌ 避免:整个页面客户端化
"use client";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Header /> {/* 不需要客户端 */}
      <Content /> {/* 不需要客户端 */}
      <Counter count={count} setCount={setCount} /> {/* 需要客户端 */}
      <Footer /> {/* 不需要客户端 */}
    </div>
  );
}

// ✅ 推荐:仅交互部分客户端化
export default function Page() {
  // 服务端组件
  return (
    <div>
      <Header />
      <Content />
      <ClientCounter /> {/* 仅此组件客户端化 */}
      <Footer />
    </div>
  );
}
```

### 2. Props 必须可序列化

```typescript
// ❌ 错误:不能传递函数
<ClientComponent onClick={() => {}} />;

// ✅ 正确:在客户端组件内定义函数
("use client");

export default function ClientComponent() {
  const handleClick = () => {};
  return <button onClick={handleClick}>点击</button>;
}
```

### 3. 避免不必要的重新渲染

使用 React.memo, useMemo, useCallback 优化性能。

---

## 常见问题

### Q1: 客户端组件在哪里渲染?

**答**: 服务端预渲染 HTML,客户端水合并接管交互。

### Q2: 'use client' 标记的组件会增加包大小吗?

**答**: 是的,客户端组件的代码会发送到客户端。

### Q3: 可以在客户端组件中导入服务端组件吗?

**答**: 可以,通过 children 或 props 传递。

### Q4: useEffect 在服务端执行吗?

**答**: 不执行,useEffect 仅在客户端执行。

### Q5: 如何在客户端组件中获取服务端数据?

**答**: 从父级服务端组件通过 props 传递,或使用客户端数据获取。

---

## 总结

### 核心要点

1. **'use client' 标记**: 文件顶部声明客户端组件
2. **交互性**: 支持状态、事件、浏览器 API
3. **性能权衡**: 增加客户端包大小,谨慎使用
4. **组合模式**: 与服务端组件配合使用
5. **优化策略**: memo, useMemo, useCallback, 动态导入

### 最佳实践

1. **最小化客户端组件**
2. **仅在需要交互时使用**
3. **利用服务端组件传递数据**
4. **性能优化不可忽视**
5. **合理组织组件边界**

客户端组件是构建交互式 UI 的核心,但应该与服务端组件平衡使用,以获得最佳性能和用户体验。

---

**下一篇**: [01-11-服务端与客户端组件边界](./01-11-服务端与客户端组件边界.md)将深入探讨两种组件类型的边界和交互规则。

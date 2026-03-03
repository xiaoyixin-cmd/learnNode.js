**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 05-30-Fast Refresh 机制详解

## 概述

Fast Refresh 是 Next.js 提供的热模块替换(HMR)功能,让你在开发过程中编辑 React 组件时,无需刷新页面即可看到更改。Fast Refresh 保留组件状态,只重新渲染修改的组件,大大提升了开发效率。它基于 React Fast Refresh,提供了可靠的热更新体验,支持函数组件、类组件、Hooks 等。

### 核心特性

- **保留状态**: 编辑组件时保留 React 状态
- **快速更新**: 毫秒级更新速度
- **错误恢复**: 语法错误修复后自动恢复
- **安全可靠**: 不会导致状态丢失
- **Hooks 支持**: 完整支持 React Hooks
- **自动重试**: 编译错误修复后自动重试

### 工作原理

| 阶段     | 操作               | 结果         |
| -------- | ------------------ | ------------ |
| 文件修改 | 检测文件变化       | 触发重新编译 |
| 编译     | 编译修改的模块     | 生成新代码   |
| 注入     | 注入新模块到浏览器 | 替换旧模块   |
| 更新     | 重新渲染组件       | 保留状态     |

---

## 1. 基础用法

### 1.1 自动启用

Fast Refresh 在开发模式下自动启用:

```bash
npm run dev
```

### 1.2 编辑组件

```tsx
// app/components/Counter.tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

修改组件后,状态会保留:

```tsx
// 修改后 - count状态保留
export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Current Count: {count}</p> {/* 修改了文本 */}
      <button onClick={() => setCount(count + 1)}>
        Add One {/* 修改了按钮文本 */}
      </button>
    </div>
  );
}
```

### 1.3 错误恢复

```tsx
// 语法错误
export default function Component() {
  return <div>Hello < /dv>; / / 错误!;
}
```

修复后自动恢复:

```tsx
// 修复后自动恢复
export default function Component() {
  return <div>Hello</div>; // 修复!
}
```

---

## 2. 状态保留规则

### 2.1 函数组件

函数组件的状态会保留:

```tsx
"use client";

import { useState } from "react";

export default function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
    </form>
  );
}
```

### 2.2 类组件

类组件的状态也会保留:

```tsx
"use client";

import { Component } from "react";

export default class Counter extends Component {
  state = { count: 0 };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

### 2.3 Hooks 状态

所有 Hooks 的状态都会保留:

```tsx
"use client";

import { useState, useEffect, useReducer } from "react";

export default function Component() {
  const [count, setCount] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("Count changed:", count);
  }, [count]);

  return <div>{count}</div>;
}

function reducer(state: any, action: any) {
  return state;
}

const initialState = {};
```

---

## 3. 状态重置规则

### 3.1 导出名称变化

修改导出名称会重置状态:

```tsx
// 之前
export default function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// 之后 - 状态重置!
export default function MyCounter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

### 3.2 添加/删除 Hooks

修改 Hooks 数量会重置状态:

```tsx
// 之前
export default function Component() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// 之后 - 状态重置!
export default function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState(""); // 新增Hook
  return <div>{count}</div>;
}
```

### 3.3 修改组件类型

从函数组件改为类组件会重置状态:

```tsx
// 之前 - 函数组件
export default function Component() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// 之后 - 类组件,状态重置!
export default class Component extends React.Component {
  state = { count: 0 };
  render() {
    return <div>{this.state.count}</div>;
  }
}
```

---

## 4. 高级用法

### 4.1 强制刷新

使用特殊注释强制刷新:

```tsx
// @refresh reset

export default function Component() {
  return <div>This will always reset</div>;
}
```

### 4.2 禁用 Fast Refresh

```tsx
// @refresh skip

export default function Component() {
  return <div>Fast Refresh disabled</div>;
}
```

### 4.3 自定义错误边界

```tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### 4.4 调试 Fast Refresh

```tsx
"use client";

import { useEffect } from "react";

export default function Component() {
  useEffect(() => {
    console.log("Component mounted/updated");

    return () => {
      console.log("Component will unmount");
    };
  });

  return <div>Debug Component</div>;
}
```

---

## 5. 实战案例

### 5.1 表单状态保留

```tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 5.2 计时器状态保留

```tsx
"use client";

import { useState, useEffect } from "react";

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div>
      <p>Time: {seconds}s</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Start"}
      </button>
      <button onClick={() => setSeconds(0)}>Reset</button>
    </div>
  );
}
```

### 5.3 动画状态保留

```tsx
"use client";

import { useState } from "react";

export default function AnimatedComponent() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState(0);

  const animate = () => {
    setIsAnimating(true);
    let pos = 0;

    const interval = setInterval(() => {
      pos += 10;
      setPosition(pos);

      if (pos >= 200) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);
  };

  return (
    <div>
      <div
        style={{
          width: "50px",
          height: "50px",
          background: "blue",
          transform: `translateX(${position}px)`,
          transition: "transform 0.05s",
        }}
      />
      <button onClick={animate} disabled={isAnimating}>
        Animate
      </button>
    </div>
  );
}
```

### 5.4 多步骤表单

```tsx
"use client";

import { useState } from "react";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: { name: "", email: "" },
    step2: { address: "", city: "" },
    step3: { cardNumber: "", cvv: "" },
  });

  const updateStep = (stepNum: number, data: any) => {
    setFormData({
      ...formData,
      [`step${stepNum}`]: data,
    });
  };

  return (
    <div>
      <h2>Step {step} of 3</h2>

      {step === 1 && (
        <div>
          <input
            value={formData.step1.name}
            onChange={(e) =>
              updateStep(1, { ...formData.step1, name: e.target.value })
            }
            placeholder="Name"
          />
          <input
            value={formData.step1.email}
            onChange={(e) =>
              updateStep(1, { ...formData.step1, email: e.target.value })
            }
            placeholder="Email"
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <input
            value={formData.step2.address}
            onChange={(e) =>
              updateStep(2, { ...formData.step2, address: e.target.value })
            }
            placeholder="Address"
          />
          <input
            value={formData.step2.city}
            onChange={(e) =>
              updateStep(2, { ...formData.step2, city: e.target.value })
            }
            placeholder="City"
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <input
            value={formData.step3.cardNumber}
            onChange={(e) =>
              updateStep(3, { ...formData.step3, cardNumber: e.target.value })
            }
            placeholder="Card Number"
          />
          <input
            value={formData.step3.cvv}
            onChange={(e) =>
              updateStep(3, { ...formData.step3, cvv: e.target.value })
            }
            placeholder="CVV"
          />
        </div>
      )}

      <div>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}>Previous</button>
        )}
        {step < 3 && <button onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && <button>Submit</button>}
      </div>
    </div>
  );
}
```

### 5.5 实时搜索

```tsx
"use client";

import { useState, useEffect } from "react";

export default function LiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      setResults(data.results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {isLoading && <p>Loading...</p>}

      <ul>
        {results.map((result, i) => (
          <li key={i}>{result}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 6. 适用场景

Fast Refresh 适用于以下场景:

1. **组件开发**: 快速迭代 UI 组件
2. **样式调整**: 实时预览样式变化
3. **逻辑调试**: 保留状态调试逻辑
4. **表单开发**: 保留表单输入状态
5. **动画调试**: 保留动画状态
6. **状态管理**: 调试复杂状态逻辑
7. **API 集成**: 保留请求状态
8. **性能优化**: 快速测试优化效果

---

## 7. 注意事项

### 7.1 避免副作用

避免在模块顶层执行副作用:

```tsx
// ✗ 不推荐
console.log("Module loaded"); // 每次刷新都会执行

export default function Component() {
  return <div>Component</div>;
}

// ✓ 推荐
export default function Component() {
  useEffect(() => {
    console.log("Component mounted");
  }, []);

  return <div>Component</div>;
}
```

### 7.2 保持导出稳定

不要频繁修改导出名称:

```tsx
// ✗ 避免
export default function MyComponent1() {} // 修改导出名称会重置状态

// ✓ 推荐
export default function MyComponent() {} // 保持导出名称稳定
```

### 7.3 Hooks 顺序

保持 Hooks 调用顺序一致:

```tsx
// ✗ 避免
export default function Component({ condition }: { condition: boolean }) {
  if (condition) {
    const [state, setState] = useState(0); // 条件Hook
  }
  return <div>Component</div>;
}

// ✓ 推荐
export default function Component({ condition }: { condition: boolean }) {
  const [state, setState] = useState(0); // 始终调用

  if (condition) {
    // 使用state
  }

  return <div>Component</div>;
}
```

### 7.4 类组件限制

类组件的某些更改会重置状态:

```tsx
// 修改构造函数会重置状态
class Component extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { count: 0 }; // 修改初始状态会重置
  }

  render() {
    return <div>{this.state.count}</div>;
  }
}
```

---

## 8. 常见问题

### 8.1 为什么状态被重置了?

**问题**: 编辑组件后状态被重置。

**原因**:

- 修改了导出名称
- 添加/删除了 Hooks
- 修改了组件类型(函数/类)

**解决方案**:

```tsx
// 保持导出名称和Hooks稳定
export default function Component() {
  const [count, setCount] = useState(0);
  // 不要添加/删除Hooks
  return <div>{count}</div>;
}
```

### 8.2 如何强制刷新?

**问题**: 需要强制刷新页面。

**解决方案**:

```tsx
// 添加注释强制刷新
// @refresh reset

export default function Component() {
  return <div>This will always reset</div>;
}
```

### 8.3 如何禁用 Fast Refresh?

**问题**: 某些组件不需要 Fast Refresh。

**解决方案**:

```tsx
// 禁用Fast Refresh
// @refresh skip

export default function Component() {
  return <div>Fast Refresh disabled</div>;
}
```

### 8.4 错误后如何恢复?

**问题**: 语法错误后无法恢复。

**解决方案**:

修复语法错误后,Fast Refresh 会自动恢复:

```tsx
// 错误
export default function Component() {
  return <div>Hello</dv>; // 语法错误
}

// 修复后自动恢复
export default function Component() {
  return <div>Hello</div>;
}
```

### 8.5 如何调试 Fast Refresh?

**问题**: 需要了解 Fast Refresh 的行为。

**解决方案**:

```tsx
"use client";

import { useEffect } from "react";

export default function Component() {
  useEffect(() => {
    console.log("Component updated");
  });

  return <div>Component</div>;
}
```

### 8.6 如何处理第三方库?

**问题**: 第三方库不支持 Fast Refresh。

**解决方案**:

```tsx
"use client";

import { useEffect, useState } from "react";

export default function Component() {
  const [lib, setLib] = useState<any>(null);

  useEffect(() => {
    import("third-party-lib").then((module) => {
      setLib(module.default);
    });
  }, []);

  if (!lib) return <div>Loading...</div>;

  return <div>Library loaded</div>;
}
```

### 8.7 如何保留全局状态?

**问题**: 全局状态在刷新后丢失。

**解决方案**:

```tsx
// lib/store.ts
let globalState = { count: 0 };

export function getGlobalState() {
  return globalState;
}

export function setGlobalState(state: any) {
  globalState = state;
}
```

### 8.8 如何处理 WebSocket 连接?

**问题**: WebSocket 连接在刷新后断开。

**解决方案**:

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function Component() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsRef.current) {
      wsRef.current = new WebSocket("ws://localhost:3000");
    }

    return () => {
      // 不要在这里关闭连接
    };
  }, []);

  return <div>WebSocket Component</div>;
}
```

### 8.9 如何处理定时器?

**问题**: 定时器在刷新后重复创建。

**解决方案**:

```tsx
"use client";

import { useEffect } from "react";

export default function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Tick");
    }, 1000);

    return () => clearInterval(interval); // 清理定时器
  }, []);

  return <div>Timer Component</div>;
}
```

### 8.10 如何测试 Fast Refresh?

**问题**: 需要测试 Fast Refresh 行为。

**解决方案**:

```tsx
"use client";

import { useState, useEffect } from "react";

export default function TestComponent() {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount((c) => c + 1);
  });

  return (
    <div>
      <p>Render count: {renderCount}</p>
      <p>Edit this component to test Fast Refresh</p>
    </div>
  );
}
```

---

## 9. 总结

Fast Refresh 是 Next.js 提供的强大热更新功能,让你在开发过程中无需刷新页面即可看到更改。它保留组件状态,提供快速的开发体验。

### 核心要点

1. **保留状态**: 编辑组件时保留 React 状态
2. **快速更新**: 毫秒级更新速度
3. **错误恢复**: 语法错误修复后自动恢复
4. **Hooks 支持**: 完整支持 React Hooks
5. **状态规则**: 了解状态保留和重置规则
6. **调试友好**: 提供调试和控制选项
7. **性能优化**: 只更新修改的组件
8. **开发效率**: 大幅提升开发效率

Fast Refresh 为 Next.js 开发提供了流畅的开发体验,是现代 Web 开发的重要工具。

---

## 10. 深入理解 Fast Refresh

### 10.1 工作机制

Fast Refresh 基于 React Fast Refresh,它通过以下步骤实现热更新:

1. **文件监听**: Webpack 监听文件变化
2. **增量编译**: 只编译修改的模块
3. **模块替换**: 替换浏览器中的旧模块
4. **组件重渲染**: 重新渲染受影响的组件
5. **状态保留**: 保留 React 组件状态

```tsx
// Fast Refresh工作流程示例
"use client";

import { useState, useEffect } from "react";

export default function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component mounted or updated");
  });

  // 修改这里的代码,状态会保留
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 10.2 状态保留原理

Fast Refresh 通过以下机制保留状态:

```tsx
// React内部维护组件树
// 每个组件有唯一的fiber节点
// Fast Refresh更新fiber节点的type,保留state

"use client";

import { useState } from "react";

export default function Counter() {
  // useState的状态存储在fiber节点中
  const [count, setCount] = useState(0);

  // 修改render逻辑,count状态保留
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

### 10.3 错误恢复机制

```tsx
"use client";

import { useState, useEffect } from "react";

export default function ErrorRecovery() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // 模拟错误恢复
    if (hasError) {
      console.log("Recovering from error...");
      setHasError(false);
    }
  }, [hasError]);

  return (
    <div>
      <p>Error Recovery Example</p>
      <button onClick={() => setHasError(true)}>Trigger Error</button>
    </div>
  );
}
```

---

## 11. 性能优化

### 11.1 减少重渲染

```tsx
"use client";

import { useState, memo } from "react";

// 使用memo避免不必要的重渲染
const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: {
  data: string;
}) {
  console.log("ExpensiveComponent rendered");
  return <div>{data}</div>;
});

export default function Parent() {
  const [count, setCount] = useState(0);
  const [data] = useState("Static data");

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveComponent data={data} />
    </div>
  );
}
```

### 11.2 优化 Hooks

```tsx
"use client";

import { useState, useCallback, useMemo } from "react";

export default function OptimizedComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([1, 2, 3]);

  // 使用useCallback缓存函数
  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  // 使用useMemo缓存计算结果
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item, 0);
  }, [items]);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Total: {total}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### 11.3 代码分割

```tsx
"use client";

import { useState, lazy, Suspense } from "react";

// 动态导入组件
const HeavyComponent = lazy(() => import("./HeavyComponent"));

export default function CodeSplitting() {
  const [showHeavy, setShowHeavy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowHeavy(!showHeavy)}>
        Toggle Heavy Component
      </button>

      {showHeavy && (
        <Suspense fallback={<div>Loading...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

---

## 12. 调试技巧

### 12.1 使用 React DevTools

```tsx
"use client";

import { useState, useEffect } from "react";

export default function DebugComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 在React DevTools中查看组件更新
    console.log("Component updated, count:", count);
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 12.2 性能分析

```tsx
"use client";

import { useState, useEffect, Profiler } from "react";

function onRenderCallback(
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

export default function PerformanceAnalysis() {
  const [count, setCount] = useState(0);

  return (
    <Profiler id="Counter" onRender={onRenderCallback}>
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </Profiler>
  );
}
```

### 12.3 错误边界调试

```tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class DebugErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught:", error);
    console.error("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.message}</pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 13. 最佳实践

### 13.1 组件设计

```tsx
"use client";

import { useState } from "react";

// ✓ 推荐: 小而专注的组件
export default function UserProfile() {
  const [user, setUser] = useState({ name: "", email: "" });

  return (
    <div>
      <UserInfo user={user} />
      <UserActions onUpdate={setUser} />
    </div>
  );
}

function UserInfo({ user }: { user: { name: string; email: string } }) {
  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

function UserActions({ onUpdate }: { onUpdate: (user: any) => void }) {
  return (
    <button
      onClick={() => onUpdate({ name: "John", email: "john@example.com" })}
    >
      Update User
    </button>
  );
}
```

### 13.2 状态管理

```tsx
"use client";

import { useState, useReducer } from "react";

// ✓ 推荐: 使用useReducer管理复杂状态
type State = {
  count: number;
  step: number;
};

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; step: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "decrement":
      return { ...state, count: state.count - state.step };
    case "setStep":
      return { ...state, step: action.step };
    default:
      return state;
  }
}

export default function ComplexState() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Step: {state.step}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) =>
          dispatch({ type: "setStep", step: Number(e.target.value) })
        }
      />
    </div>
  );
}
```

### 13.3 副作用处理

```tsx
"use client";

import { useState, useEffect } from "react";

export default function SideEffects() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/data");
        const result = await response.json();

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

---

## 14. 常见模式

### 14.1 受控组件

```tsx
"use client";

import { useState } from "react";

export default function ControlledForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 14.2 自定义 Hook

```tsx
"use client";

import { useState, useEffect } from "react";

// 自定义Hook
function useLocalStorage(key: string, initialValue: any) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default function CustomHookExample() {
  const [name, setName] = useLocalStorage("name", "");

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Stored name: {name}</p>
    </div>
  );
}
```

### 14.3 Context 使用

```tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeExample() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </div>
  );
}
```

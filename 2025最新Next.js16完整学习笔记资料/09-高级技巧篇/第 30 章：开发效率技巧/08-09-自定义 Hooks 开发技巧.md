**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 08-09-自定义 Hooks 开发技巧

自定义 Hooks 是 React 开发中复用逻辑的核心方式。本文介绍如何在 Next.js 中开发高质量的自定义 Hooks。

## 核心概念

### Hooks 开发原则

| 原则     | 说明                   | 重要性 |
| -------- | ---------------------- | ------ |
| 单一职责 | 每个 Hook 只做一件事   | 高     |
| 可组合性 | Hook 可以组合使用      | 高     |
| 可测试性 | 易于单元测试           | 高     |
| 类型安全 | 完整的 TypeScript 支持 | 高     |
| 性能优化 | 避免不必要的重渲染     | 中     |

### Hook 命名规范

| 类型     | 命名模式     | 示例             |
| -------- | ------------ | ---------------- |
| 状态管理 | use[State]   | useCounter       |
| 数据获取 | use[Data]    | useUser          |
| 副作用   | use[Effect]  | useDocumentTitle |
| 事件处理 | use[Event]   | useClickOutside  |
| 工具类   | use[Utility] | useDebounce      |

## 实战场景

### 实战场景一: useLocalStorage Hook

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### 实战场景二: useDebounce Hook

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 实战场景三: useAsync Hook

```typescript
// hooks/useAsync.ts
import { useState, useEffect, useCallback } from "react";

interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({
    loading: immediate,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, data: null });

    try {
      const data = await asyncFunction();
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      setState({ loading: false, error: error as Error, data: null });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
```

### 实战场景四: useClickOutside Hook

```typescript
// hooks/useClickOutside.ts
import { useEffect, RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
```

### 实战场景五: useMediaQuery Hook

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
```

### 实战场景六: useIntersectionObserver Hook

```typescript
// hooks/useIntersectionObserver.ts
import { useEffect, useState, RefObject } from "react";

export function useIntersectionObserver(
  ref: RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}
```

### 实战场景七: usePrevious Hook

```typescript
// hooks/usePrevious.ts
import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

### 实战场景八: useToggle Hook

```typescript
// hooks/useToggle.ts
import { useState, useCallback } from "react";

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return { value, toggle, setTrue, setFalse };
}
```

### 实战场景九: useWindowSize Hook

```typescript
// hooks/useWindowSize.ts
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
```

### 实战场景十: useInterval Hook

```typescript
// hooks/useInterval.ts
import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}
```

### 实战场景十一: useTimeout Hook

```typescript
// hooks/useTimeout.ts
import { useEffect, useRef } from "react";

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}
```

### 实战场景十二: useEventListener Hook

```typescript
// hooks/useEventListener.ts
import { useEffect, useRef } from "react";

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: HTMLElement | Window = window
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: Event) =>
      savedHandler.current(event as WindowEventMap[K]);

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
```

### 实战场景十三: useOnScreen Hook

```typescript
// hooks/useOnScreen.ts
import { useState, useEffect, RefObject } from "react";

export function useOnScreen(
  ref: RefObject<Element>,
  rootMargin = "0px"
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return isIntersecting;
}
```

### 实战场景十四: useFetch Hook

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

### 实战场景十五: useForm Hook

```typescript
// hooks/useForm.ts
import { useState, ChangeEvent } from "react";

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (callback: (values: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      callback(values);
    };
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, handleSubmit, reset, setErrors };
}
```

### 实战场景十六: useClipboard Hook

```typescript
// hooks/useClipboard.ts
import { useState } from "react";

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopied(false);
    }
  };

  return { copied, copy };
}
```

### 实战场景十七: useKeyPress Hook

```typescript
// hooks/useKeyPress.ts
import { useState, useEffect } from "react";

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}
```

### 实战场景十八: useHover Hook

```typescript
// hooks/useHover.ts
import { useState, useRef, useEffect, RefObject } from "react";

export function useHover<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    node.addEventListener("mouseenter", handleMouseEnter);
    node.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      node.removeEventListener("mouseenter", handleMouseEnter);
      node.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [ref, isHovering];
}
```

### 实战场景十九: useScrollPosition Hook

```typescript
// hooks/useScrollPosition.ts
import { useState, useEffect } from "react";

interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollPosition;
}
```

### 实战场景二十: useThrottle Hook

```typescript
// hooks/useThrottle.ts
import { useState, useEffect, useRef } from "react";

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}
```

## 适用场景

### Hook 类型对比

| Hook 类型 | 适用场景 | 复杂度 | 性能影响 |
| --------- | -------- | ------ | -------- |
| 状态管理  | 组件状态 | 低     | 低       |
| 数据获取  | API 调用 | 中     | 中       |
| 副作用    | DOM 操作 | 中     | 中       |
| 事件处理  | 用户交互 | 低     | 低       |
| 工具类    | 通用逻辑 | 低     | 低       |

## 注意事项

### 1. 遵循 Hooks 规则

只在函数组件顶层调用 Hooks,不在循环、条件或嵌套函数中调用。

### 2. 使用 useCallback 优化

对于传递给子组件的函数,使用 useCallback 避免不必要的重渲染。

### 3. 使用 useMemo 优化

对于计算密集型操作,使用 useMemo 缓存结果。

### 4. 处理清理逻辑

在 useEffect 中返回清理函数,避免内存泄漏。

### 5. TypeScript 类型安全

为自定义 Hooks 添加完整的 TypeScript 类型定义。

## 常见问题

### 1. 如何创建自定义 Hook?

使用 use 前缀命名,内部可以调用其他 Hooks。

### 2. 自定义 Hook 可以返回什么?

可以返回任何值,通常返回数组或对象。

### 3. 如何在 Hook 中处理异步操作?

使用 useEffect 配合 async 函数,注意清理逻辑。

### 4. 如何优化 Hook 性能?

使用 useCallback、useMemo,避免不必要的重渲染。

### 5. Hook 可以有参数吗?

可以,参数会影响 Hook 的行为。

### 6. 如何测试自定义 Hook?

使用@testing-library/react-hooks 进行单元测试。

### 7. Hook 可以调用其他 Hook 吗?

可以,这是组合 Hook 的常见模式。

### 8. 如何处理 Hook 依赖?

在 useEffect、useCallback、useMemo 中正确声明依赖数组。

### 9. Hook 可以在类组件中使用吗?

不可以,Hooks 只能在函数组件中使用。

### 10. 如何共享 Hook 逻辑?

将 Hook 提取到单独的文件,导出供多个组件使用。

### 11. useEffect 和 useLayoutEffect 的区别?

useEffect 异步执行,useLayoutEffect 同步执行。

### 12. 如何避免 Hook 闭包陷阱?

使用 useRef 存储最新值,或正确声明依赖。

### 13. Hook 可以有条件调用吗?

不可以,必须在组件顶层无条件调用。

### 14. 如何处理 Hook 错误?

使用 try-catch 捕获错误,或使用错误边界。

### 15. Hook 可以返回 JSX 吗?

可以,但通常返回数据和函数。

### 16. 如何优化 Hook 重渲染?

使用 React.memo、useCallback、useMemo。

### 17. Hook 可以访问 DOM 吗?

可以,使用 useRef 获取 DOM 引用。

### 18. 如何处理 Hook 副作用?

在 useEffect 中处理,返回清理函数。

### 19. Hook 可以嵌套吗?

不建议,保持 Hook 简单单一。

### 20. 如何调试 Hook?

使用 React DevTools,添加 console.log。

## 总结

自定义 Hooks 是 React 开发中复用逻辑的核心方式。

关键要点:

1. 遵循 Hooks 规则
2. 单一职责原则
3. 类型安全
4. 性能优化
5. 可测试性
6. 可组合性
7. 清理逻辑
8. 错误处理
9. 文档完善
10. 持续优化

记住,好的自定义 Hook 应该简单、可复用、易测试。

### 最佳实践

1. 使用 use 前缀命名
2. 保持 Hook 简单
3. 添加 TypeScript 类型
4. 编写单元测试
5. 文档化 Hook 用法
6. 处理边界情况
7. 优化性能
8. 避免过度抽象
9. 遵循 React 规则
10. 持续重构优化

### Hook 开发流程

1. 识别可复用逻辑
2. 提取为自定义 Hook
3. 添加类型定义
4. 编写单元测试
5. 优化性能
6. 文档化
7. 代码审查
8. 发布使用

### 性能优化技巧

1. 使用 useCallback 缓存函数
2. 使用 useMemo 缓存计算结果
3. 避免不必要的依赖
4. 使用 useRef 存储可变值
5. 合理使用 useEffect
6. 避免过度渲染
7. 使用 React.memo
8. 监控性能指标

### 测试策略

1. 单元测试 Hook 逻辑
2. 测试边界情况
3. 测试错误处理
4. 测试性能
5. 集成测试
6. E2E 测试
7. 覆盖率检查
8. 持续集成

### 常见模式

1. 状态管理 Hook
2. 数据获取 Hook
3. 副作用 Hook
4. 事件处理 Hook
5. 工具类 Hook
6. 组合 Hook
7. 条件 Hook
8. 异步 Hook

### 错误处理

1. try-catch 捕获错误
2. 错误边界
3. 错误状态管理
4. 错误日志
5. 用户提示
6. 降级方案
7. 重试机制
8. 监控告警

### 文档规范

1. Hook 用途说明
2. 参数说明
3. 返回值说明
4. 使用示例
5. 注意事项
6. 性能考虑
7. 兼容性说明
8. 更新日志

### 版本管理

1. 语义化版本
2. 变更日志
3. 向后兼容
4. 废弃警告
5. 迁移指南
6. 发布流程
7. 版本标签
8. 文档更新

### 社区贡献

1. 开源分享
2. 代码审查
3. 问题反馈
4. 功能建议
5. 文档改进
6. 示例补充
7. 测试用例
8. 性能优化

### 学习资源

1. React 官方文档
2. Hooks 最佳实践
3. 社区 Hook 库
4. 开源项目
5. 技术博客
6. 视频教程
7. 在线课程
8. 技术会议

### 工具推荐

1. @testing-library/react-hooks
2. React DevTools
3. TypeScript
4. ESLint
5. Prettier
6. Jest
7. Storybook
8. Husky

### 未来趋势

1. 更多内置 Hooks
2. 更好的性能优化
3. 更强的类型推导
4. 更简单的 API
5. 更好的开发体验
6. 更完善的工具链
7. 更丰富的生态
8. 更标准的规范

## 补充高级 Hooks 开发技巧

### 1. useDebounce Hook 实现

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

使用示例:

```tsx
// components/SearchInput.tsx
"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      fetch(`/api/search?q=${debouncedSearchTerm}`);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

### 2. useThrottle Hook 实现

```typescript
// hooks/useThrottle.ts
import { useEffect, useRef, useState } from "react";

export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}
```

### 3. useIntersectionObserver Hook

```typescript
// hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return { targetRef, isIntersecting };
}
```

使用示例:

```tsx
// components/LazyImage.tsx
"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <div ref={targetRef}>{isIntersecting && <img src={src} alt={alt} />}</div>
  );
}
```

### 4. useLocalStorage Hook

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### 5. useMediaQuery Hook

```typescript
// hooks/useMediaQuery.ts
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
```

使用示例:

```tsx
// components/ResponsiveLayout.tsx
"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export function ResponsiveLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### 6. usePrevious Hook

```typescript
// hooks/usePrevious.ts
import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

### 7. useAsync Hook

```typescript
// hooks/useAsync.ts
import { useCallback, useEffect, useState } from "react";

interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, data: null });

    try {
      const response = await asyncFunction();
      setState({ loading: false, error: null, data: response });
    } catch (error) {
      setState({ loading: false, error: error as Error, data: null });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
```

### 8. useClickOutside Hook

```typescript
// hooks/useClickOutside.ts
import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return ref;
}
```

使用示例:

```tsx
// components/Dropdown.tsx
"use client";

import { useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

export function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

### 9. useInterval Hook

```typescript
// hooks/useInterval.ts
import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}
```

### 10. useCopyToClipboard Hook

```typescript
// hooks/useCopyToClipboard.ts
import { useState } from "react";

export function useCopyToClipboard(): [
  string | null,
  (text: string) => Promise<void>
] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopiedText(null);
    }
  };

  return [copiedText, copy];
}
```

记住,自定义 Hooks 开发是一个持续学习和优化的过程,需要不断实践和总结经验。

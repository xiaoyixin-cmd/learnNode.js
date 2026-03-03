**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# React 基础概念精讲

## 1. 概述 (Overview)

### 1.1 概念定义

React 是由 Meta (Facebook) 开发并开源的，用于构建用户界面的 JavaScript 库。它专注于**视图层 (View Layer)**，采用**声明式 (Declarative)** 编程风格，通过**组件化 (Component-Based)** 的方式构建复杂的 UI。

随着 React 19 和 Next.js 16 的发布，React 已经不仅仅是一个客户端 UI 库，而是进化为一套完整的**全栈架构范式**，涵盖了服务端组件 (RSC)、流式渲染 (Streaming) 和 原生异步状态管理。

### 1.2 核心价值

- **声明式编程**: 开发者只需描述 UI 在不同状态下应该长什么样，React 负责高效地更新 DOM。
- **组件复用**: 将 UI 拆分为独立的、可复用的代码片段，提高开发效率和可维护性。
- **一次学习，随处编写**: React Native 将 React 的开发模式带到了移动端，React Three Fiber 带到了 3D 领域。
- **高性能**: 虚拟 DOM (Virtual DOM) 和 Fiber 架构确保了最小化的 DOM 操作。

### 1.3 发展简史

- **2013 年**: 开源，引入 JSX 和 Virtual DOM，颠覆了传统的 MVC 模式。
- **2015 年**: React Native 发布，React 0.13 支持 ES6 Class。
- **2016 年**: React 15 发布。
- **2017 年**: React 16 (Fiber) 重写核心架构，引入 Error Boundary, Portals。
- **2019 年**: React 16.8 引入 **Hooks**，彻底改变了组件编写方式，函数式组件成为主流。
- **2020 年**: React 17 "无新特性"更新，为未来铺路。
- **2022 年**: React 18 引入并发模式 (Concurrent Mode) 和自动批处理。
- **2024+**: React 19 正式支持 Server Components, Actions, Compiler。

---

## 2. 核心概念与原理 (Concepts & Principles)

### 2.1 JSX (JavaScript XML)

JSX 是 JavaScript 的语法扩展，允许在 JS 中直接写类似 HTML 的标签。

- **本质**: JSX 最终会被编译器 (Babel/SWC) 转换为 `React.createElement` 调用（在 React 17+ 是 `_jsx` 运行时调用）。
- **规则**:
  - 必须有一个根元素（或使用 `<>...</>` Fragment）。
  - 标签必须闭合。
  - 属性名使用驼峰命名 (camelCase)，如 `className`, `onClick`。
  - 使用 `{}` 嵌入 JavaScript 表达式。

```jsx
// JSX 代码
const element = <h1 className="title">Hello, {name}</h1>;

// 编译后 (近似)
const element = React.createElement(
  "h1",
  { className: "title" },
  "Hello, ",
  name
);
```

### 2.2 虚拟 DOM (Virtual DOM)

虚拟 DOM 是真实 DOM 的内存映射（轻量级 JS 对象）。

**Diffing 算法 (Reconciliation)**:
当组件状态改变时：

1.  React 创建新的虚拟 DOM 树。
2.  与旧的虚拟 DOM 树进行对比 (Diff)。
3.  计算出最小变更集。
4.  批量更新到真实 DOM (Commit 阶段)。

**Fiber 架构**:
React 16 引入的底层协调引擎。它将渲染任务拆分为小片 (Time Slicing)，允许中断和恢复渲染，从而避免长时间占用主线程导致页面卡顿。

### 2.3 组件 (Components)

组件是 React 的核心构建块。

#### 2.3.1 函数组件 (Functional Component)

现代 React 的标准写法。本质上是接收 Props 并返回 JSX 的纯函数。

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

#### 2.3.2 类组件 (Class Component) - _Legacy_

旧版写法，主要用于理解旧代码。使用 `this.state` 和生命周期方法 (`componentDidMount` 等)。

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### 2.4 Props 与 State

- **Props (Properties)**:
  - **只读**: 组件内部不可修改 props。
  - **数据流**: 父组件向子组件传递数据（单向数据流）。
- **State**:
  - **可变**: 组件内部管理的私有数据。
  - **驱动渲染**: State 改变会触发组件重新渲染。
  - **不可变性 (Immutability)**: 必须通过 setState (或 setter) 更新，不能直接修改对象。

---

## 3. Hooks 详解 (Hooks API)

Hooks 让函数组件拥有了状态和生命周期能力。

### 3.1 核心 Hooks

#### 3.1.1 `useState`

用于声明状态变量。

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // 0 是初始值

  return (
    <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
  );
}
```

#### 3.1.2 `useEffect`

处理副作用 (Side Effects)，如数据获取、订阅、手动修改 DOM。
相当于 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` 的组合。

```jsx
import { useEffect } from "react";

useEffect(() => {
  // 1. 执行副作用
  const timer = setInterval(() => console.log("Tick"), 1000);

  // 2. 清理副作用 (Cleanup function)
  return () => clearInterval(timer);
}, []); // 3. 依赖数组：[] 表示只在挂载/卸载时执行
```

#### 3.1.3 `useContext`

跨层级传递数据，避免 Props Drilling。

```jsx
const ThemeContext = createContext("light");
const theme = useContext(ThemeContext);
```

### 3.2 进阶 Hooks

- **`useRef`**: 引用 DOM 节点或保存不触发渲染的可变数据。
- **`useMemo`**: 缓存计算结果，性能优化。
- **`useCallback`**: 缓存函数引用，防止子组件不必要的重渲染。
- **`useReducer`**: 处理复杂的状态逻辑（Redux 风格）。

### 3.3 React 19 新特性 (Preview)

- **`use` API**: 在 render 中读取 Promise 或 Context。
- **`useOptimistic`**: 乐观 UI 更新。
- **Actions**: 简化表单提交和数据突变 (`<form action={fn}>`)。

---

## 4. 现代特性：Server Components (RSC)

Next.js 16 默认使用 RSC。

### 4.1 服务端组件 (Server Components)

- **运行环境**: 仅在服务端运行，不打包到客户端 bundle 中。
- **优势**:
  - 直接访问后端资源 (DB, File System)。
  - 零 Bundle Size 增加。
  - 自动代码分割。
- **限制**: 不能使用 Hooks (useState, useEffect)，不能绑定事件 (onClick)。

### 4.2 客户端组件 (Client Components)

- **声明**: 文件顶部添加 `'use client'` 指令。
- **运行环境**: 服务端预渲染 HTML + 客户端 Hydration。
- **适用**: 交互式 UI (按钮点击、表单输入、动画)。

---

## 5. React 核心原理深度解析 (Core Principles Deep Dive)

### 5.1 Fiber 架构详解

React 16 引入的 Fiber 架构是 React 历史上最重大的底层重构。它的核心目的是实现**可中断的异步渲染 (Interruptible Async Rendering)**，从而解决 React 15 在处理庞大组件树时的主线程阻塞问题。

#### 5.1.1 为什么需要 Fiber？

在 React 15 (Stack Reconciler) 中，更新过程是递归的、同步的。一旦开始，就无法中断，直到整个组件树 Diff 完成。如果组件树很深，超过 16ms（60fps 每一帧的时间），就会导致掉帧、卡顿，用户输入无法响应。

**Fiber 的解决方案**：

- **时间切片 (Time Slicing)**: 将渲染任务拆分成一个个微小的任务单元 (Fiber Node)。
- **任务优先级 (Prioritization)**: 区分任务的紧急程度（如用户点击 > 动画 > 数据加载）。
- **可中断与恢复**: 浏览器在空闲时执行 Fiber 任务，忙碌时暂停 React 渲染，先处理用户交互。

#### 5.1.2 Fiber 节点结构

Fiber 本质上是一个 JavaScript 对象，代表组件树中的一个工作单元。

```javascript
// Fiber 节点结构简化版
const fiber = {
  type: "div", // DOM 节点类型或组件函数
  key: null, // 唯一标识
  stateNode: divNode, // 对应的真实 DOM 节点或组件实例

  // 链表结构，构成 Fiber 树
  return: parentFiber, // 指向父节点
  child: childFiber, // 指向第一个子节点
  sibling: siblingFiber, // 指向下一个兄弟节点

  // 工作单元属性
  pendingProps: {}, // 新的 props
  memoizedProps: {}, // 旧的 props
  memoizedState: {}, // 旧的 state

  // 副作用标识
  flags: Placement | Update | Deletion,

  // 双缓存机制
  alternate: currentFiber, // 指向旧树中对应的节点
};
```

这种链表结构使得 React 可以随时暂停遍历，保存当前节点，处理其他事务，然后回来继续遍历。

#### 5.1.3 双缓存机制 (Double Buffering)

React 在内存中同时维护两棵 Fiber 树：

1.  **Current Tree**: 当前屏幕上显示的树。
2.  **WorkInProgress Tree**: 正在构建的新树。

Diff 过程发生在 WorkInProgress Tree 上。当新树构建完成并 Commit 到 DOM 后，React 仅仅是将根节点的指针从 Current 切换到 WorkInProgress，瞬间完成更新。

---

### 5.2 Diff 算法深度剖析

React 的 Diff 算法将 O(n^3) 的树比对复杂度降低到了 O(n)，主要基于三个启发式假设。

#### 5.2.1 三大策略

1.  **Tree Diff**: 只对比同一层级的节点，不跨层级对比。如果一个节点在不同层级间移动，React 会直接销毁并重建。
2.  **Component Diff**:
    - 如果是同一类型的组件，继续 Diff 其子节点。
    - 如果不是，直接销毁该组件及其所有子节点，替换为新组件。
3.  **Element Diff**: 同一层级的子节点，通过 `key` 属性进行唯一标识，以便复用。

#### 5.2.2 列表对比详解 (List Diff)

这是面试中最常考的点。假设旧列表为 `[A, B, C, D]`，新列表为 `[B, A, D, C]`。

**没有 key 时**：
React 会依次对比：

- index 0: A -> B (修改)
- index 1: B -> A (修改)
- ... 全部修改，性能极差。

**有 key 时**：
React 采用**单向遍历**策略（React 的 Diff 算法是简单的 O(n) 实现，不同于 Vue 2 的双端 Diff 或 Vue 3 的最长递增子序列）。

**核心逻辑 (Reconciliation)**:

1.  维护一个 `lastPlacedIndex` (上一个已放置好的节点在旧列表中的索引)，初始为 0。
2.  遍历新列表：
    - **B**: 在旧列表中找到 B (index=1)。`1 >= lastPlacedIndex (0)`，位置无需移动，更新 `lastPlacedIndex = 1`。
    - **A**: 在旧列表中找到 A (index=0)。`0 < lastPlacedIndex (1)`，**需要移动** A。
    - **D**: 在旧列表中找到 D (index=3)。`3 >= lastPlacedIndex (1)`，无需移动，更新 `lastPlacedIndex = 3`。
    - **C**: 在旧列表中找到 C (index=2)。`2 < lastPlacedIndex (3)`，**需要移动** C。

**结论**: Key 的存在极大地减少了 DOM 的创建和销毁，但 React 的 Diff 策略在处理“将最后一个元素移到最前”这种场景时，性能不如 Vue，因为 React 会把前面所有的元素都往后移。

---

### 5.3 合成事件系统 (Synthetic Event)

React 不直接将事件绑定到具体的 DOM 节点上（除了少数媒体事件），而是实现了一套自己的事件系统。

#### 5.3.1 事件委托 (Event Delegation)

- **React 16 及之前**: 绑定到 `document`。
- **React 17+**: 绑定到**应用挂载的根节点** (`root` 容器)。这解决了微前端架构下多版本 React 共存的事件冒泡冲突问题。

#### 5.3.2 跨浏览器兼容

`SyntheticEvent` 抹平了不同浏览器（IE vs Chrome）的事件对象差异。例如，它统一了 `e.target` 和 `e.currentTarget`，并提供了标准的 `e.stopPropagation()` 和 `e.preventDefault()`。

---

## 6. React Hooks 源码级原理解析 (Source Code Analysis)

Hooks 并非魔法，它本质上是**数组**（实际上是**链表**）。

### 6.1 Hooks 的内部结构

在 Fiber 节点中，有一个 `memoizedState` 属性，它存储了该组件所有 Hooks 的链表。

```javascript
// 伪代码：Hooks 链表结构
const hook = {
  memoizedState: null, // 当前 Hook 的状态值 (如 useState 的 value)
  baseState: null,
  queue: null, // 待更新队列 (setState 传入的 action)
  next: null, // 指向下一个 Hook
};
```

### 6.2 为什么 Hooks 不能写在条件语句中？

React 依赖 **调用顺序** 来对应 Hook 和 Fiber 中的状态。

**示例**：

```javascript
function Component() {
  const [name, setName] = useState("Alice"); // Hook 1
  if (condition) {
    const [age, setAge] = useState(20); // Hook 2 (可能跳过)
  }
  const [job, setJob] = useState("Dev"); // Hook 3
}
```

**第一次渲染 (condition=true)**:
链表: `Hook1(name) -> Hook2(age) -> Hook3(job)`

**第二次渲染 (condition=false)**:
React 依然按顺序读取链表：

1.  读取 Hook1 -> 对应 `name` (正确)
2.  读取 Hook2 -> 对应代码中的 `job` (错误！React 以为这是 Hook 2，但实际上代码执行到了 Hook 3)

这就导致状态错乱。因此，**必须保证每次渲染 Hooks 的调用顺序和数量完全一致**。

### 6.3 `useState` 与 `useReducer`

在 React 源码中，`useState` 实际上就是预置了 reducer 的 `useReducer`。

```javascript
// 源码简化
function useState(initialState) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

// 挂载阶段 (Mount)
function mountState(initialState) {
  const hook = mountWorkInProgressHook(); // 创建新 Hook 节点
  hook.memoizedState = initialState;
  const queue = (hook.queue = { pending: null, dispatch: null });
  const dispatch = (queue.dispatch = dispatchSetState.bind(null, fiber, queue));
  return [hook.memoizedState, dispatch];
}

// 更新阶段 (Update)
function updateState() {
  const hook = updateWorkInProgressHook(); // 获取对应的旧 Hook
  // 遍历 queue 计算新 state
  // ...
  return [hook.memoizedState, dispatch];
}
```

### 6.4 `useEffect` 的实现

`useEffect` 会创建一个 `Effect` 对象，并将其添加 updateQueue 中。

1.  **Render 阶段**: 收集 Effect，对比依赖数组 (`deps`)。如果依赖变化，标记该 Effect 需要执行。
2.  **Commit 阶段**:
    - **BeforeMutation**: 执行 `getSnapshotBeforeUpdate`。
    - **Mutation**: 更新 DOM。
    - **Layout**: 执行 `useLayoutEffect`。
    - **Passive (异步)**: 浏览器绘制完成后，执行 `useEffect` 的回调。

---

## 7. React 19 新特性深度剖析 (Deep Dive into React 19)

React 19 是继 React 16 (Fiber) 之后最大的版本更新，标志着 React 正式进入**全栈时代**。

### 7.1 React Compiler (React Forget)

这是 React 团队为了解决 "useMemo/useCallback 地狱" 而推出的自动优化编译器。

- **原理**: 在编译阶段分析数据流，自动识别哪些组件和计算需要缓存。
- **效果**: 开发者不再需要手动写 `memo`, `useMemo`, `useCallback`。编译器会自动插入细粒度的缓存逻辑。
- **现状**: 目前作为独立插件提供，未来将集成到 Next.js 默认配置中。

### 7.2 Actions (Server Actions 增强)

React 19 将 Server Actions 的概念提升为核心 API，并引入了 `useActionState` (原 `useFormState`)。

**`useActionState` 详解**:

```javascript
const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);
```

- **fn**: 绑定的 Server Action 函数。
- **state**: 当前状态（通常用于显示错误消息或成功结果）。
- **formAction**: 传递给 `<form action={...}>` 的处理函数。
- **isPending**: 自动管理的加载状态，不再需要手动维护 `isLoading`。

这彻底简化了表单处理逻辑，无需 `onSubmit` 事件处理器，无需手动 fetch，无需手动管理 loading。

### 7.3 `useOptimistic`

用于实现乐观 UI (Optimistic UI)。即在服务器响应之前，先立即更新界面，给用户“极快”的感觉。如果服务器失败，自动回滚。

```javascript
function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  );

  return (
    <form
      action={async (formData) => {
        const message = formData.get("message");
        addOptimisticMessage(message); // 立即显示
        await sendMessage(message); // 等待服务器
      }}
    >
      {optimisticMessages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </form>
  );
}
```

---

## 8. 高频面试题与实战技巧 (Interview & Best Practices)

### 8.1 为什么 `setState` 是异步的？

这其实是一个误解。在 React 18 之前，`setState` 在合成事件和生命周期中是异步（批处理）的，但在 `setTimeout` 或原生事件中是同步的。
**在 React 18+ (自动批处理)**: `setState` 几乎总是异步的（批处理），为了性能优化。

**原因**:

1.  **性能**: 如果每次 `setState` 都立即重绘，浏览器会卡死。React 收集一段时间内的所有更新，一次性 Flush。
2.  **一致性**: 如果 State 是同步更新的，但 Props 是父组件重新渲染后才更新的，会导致 State 和 Props 不一致。

### 8.2 性能优化实战指南

1.  **变动隔离**: 将 State 下沉到使用它的最小子组件。
    - _Bad_: 在 App 组件管理 Input 状态。
    - _Good_: 拆分出 InputComponent 管理自身状态。
2.  **列表优化**:
    - 使用 `React.memo` + `useCallback` 防止列表项不必要的重渲染。
    - 对于长列表（100+ 项），必须使用虚拟滚动 (Virtual Scrolling)，如 `react-window`。
3.  **懒加载**:
    - 路由懒加载: `const Home = lazy(() => import('./Home'))`。
    - 组件懒加载: 对低频出现的弹窗、Drawer 进行懒加载。

### 8.3 常见反模式 (Anti-Patterns)

1.  **Props Drilling**: 层层传递 props。
    - _Fix_: 使用 Context 或 Server Components (直接在需要的层级获取数据)。
2.  **滥用 `useEffect`**: 把所有逻辑都写在 effect 里。
    - _Fix_: 能在渲染期间计算的，直接计算；能用事件处理响应的，别用 effect 监听 state 变化。
    - _Bad_: `useEffect(() => setFiltered(items.filter(...)), [items])`
    - _Good_: `const filtered = items.filter(...)`
3.  **直接修改 State**: `state.value = 1`。
    - _后果_: 不会触发更新，且破坏了不可变性。

---

## 9. React 生态系统实战 (Ecosystem & Best Practices)

React 的强大不仅在于核心库，更在于其庞大且活跃的生态系统。

### 9.1 状态管理 (State Management)

虽然 React 提供了 Context API，但在复杂应用中，专用的状态管理库依然必不可少。

#### 9.1.1 Zustand (推荐)

Zustand 是目前最流行的轻量级状态管理库，它不仅支持 Hooks，还可以在组件外访问状态。

```javascript
import { create } from "zustand";

// 1. 创建 Store
const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

// 2. 在组件中使用
function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <h1>{bears} around here...</h1>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  return <button onClick={increasePopulation}>one up</button>;
}
```

#### 9.1.2 Redux Toolkit (RTK)

对于企业级大型应用，Redux 依然是标准。RTK 简化了 Redux 的样板代码。

```javascript
import { createSlice, configureStore } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    }, // 内部使用了 Immer，可以直接修改
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

const store = configureStore({ reducer: counterSlice.reducer });
```

### 9.2 数据请求 (Data Fetching)

**TanStack Query (React Query)** 是管理服务器状态（Server State）的事实标准。它处理了缓存、去重、后台更新、重试等复杂逻辑。

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Todos() {
  const queryClient = useQueryClient();

  // 查询
  const { isPending, error, data } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // 修改
  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      // 使得缓存失效，触发重新拉取
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <div>
      <ul>
        {data.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
      <button onClick={() => mutation.mutate({ title: "Do Laundry" })}>
        Add Todo
      </button>
    </div>
  );
}
```

### 9.3 样式方案 (Styling)

- **Tailwind CSS**: 实用优先 (Utility-first) 的 CSS 框架，Next.js 默认推荐。
  - _优点_: 开发速度快，打包体积小（PurgeCSS），原子化类名。
  - _缺点_: HTML 类名冗长。
- **Styled Components / Emotion**: CSS-in-JS。
  - _优点_: 样式与组件绑定，动态样式方便。
  - _缺点_: 运行时开销，RSC 兼容性问题（需要特殊配置）。

---

## 10. 调试与工具链 (Debugging & Tools)

### 10.1 React DevTools

浏览器扩展，开发 React 应用必备。

- **Components Tab**: 查看组件树、Props、State、Hooks 值，以及是由哪个组件触发的渲染。
- **Profiler Tab**: 性能分析器。可以录制一次交互，查看每个组件的渲染耗时。
  - **Flamegraph (火焰图)**: 宽度代表耗时，颜色代表是否重新渲染。
  - **Ranked Chart**: 按耗时排名。
  - **Why did this render?**: 开启设置后，会显示导致组件重渲染的 Props 变化。

### 10.2 Strict Mode (严格模式)

```jsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

在开发环境下，Strict Mode 会：

1.  **双重调用 (Double Invocation)**: 故意调用两次 Function Component body、useState initializer、reducer 等纯函数。
    - _目的_: 帮你发现副作用 (Side Effects) 是否纯净。如果两次调用结果不一致或产生额外副作用，说明代码有问题。
2.  **检测过时 API**: 如 findDOMNode。
3.  **检测意外的副作用**: 在 Commit 阶段之前。

### 10.3 错误边界 (Error Boundary)

React 组件树中的错误如果不被捕获，会导致整个应用崩溃（白屏）。Error Boundary 是一种 Class Component，用于捕获子组件树中的 JS 错误。

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 以便下一次渲染显示降级 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>;
```

_注意：目前 Error Boundary 只能用 Class Component 实现。_

---

## 11. 源码级进阶：从零手写 Mini-React (Build Mini-React)

为了彻底理解 Fiber 和 Hooks，我们来手写一个简易版的 React (Mini-React)。我们将实现 `createElement`, `render`, `useState` 和 Concurrent Mode。

### 11.1 Step 1: `createElement`

JSX 转换的核心。

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

### 11.2 Step 2: `render` (Basic)

将 Virtual DOM 转换为真实 DOM。

```javascript
function render(element, container) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}
```

### 11.3 Step 3: 并发模式 (Concurrent Mode)

使用 `requestIdleCallback` 来切分任务。

```javascript
let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // TODO: 1. 添加 dom 节点
  // TODO: 2. 创建子 fibers
  // TODO: 3. 返回下一个工作单元 (child -> sibling -> uncle)
}
```

### 11.4 Step 4: Fibers

我们需要将数据结构改为 Fiber 链表。

```javascript
function performUnitOfWork(fiber) {
  // 1. 如果没有 dom，创建 dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 2. 为所有 children 创建 fiber
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // 3. 寻找下一个任务
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
```

### 11.5 Step 5: Render 和 Commit 阶段

我们不能在遍历 Fiber 时直接修改 DOM，因为中断会导致 UI 渲染不完整。我们需要在所有 Fiber 处理完后，统一 Commit。

```javascript
function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

### 11.6 Step 6: Reconciliation (Diff)

核心 Diff 逻辑。

```javascript
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      // Update
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      // Add
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      // Delete
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

### 11.7 Step 7: Function Components

函数组件没有 DOM 节点，需要特殊处理。

```javascript
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)]; // 执行函数组件
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
```

### 11.8 Step 8: Hooks (`useState`)

实现最简版的 `useState`。

```javascript
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    requestIdleCallback(workLoop);
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

通过这 8 步，我们实现了一个包含 Fiber 架构、Diff 算法和 Hooks 支持的 Mini-React。这能帮助你深刻理解为什么 Hooks 必须按顺序调用（依赖 `hookIndex`），以及为什么渲染是可以中断的（依赖 `nextUnitOfWork` 和 `requestIdleCallback`）。

---

## 12. React 进阶模式与实战 (Advanced Patterns & Best Practices)

### 12.1 服务器组件深度剖析 (RSC Deep Dive)

Server Components 是 React 19 和 Next.js 的核心架构变革。

#### 12.1.1 客户端组件 vs 服务器组件

| 特性         | Client Component (`"use client"`) | Server Component (Default) |
| :----------- | :-------------------------------- | :------------------------- |
| **渲染位置** | 客户端 (浏览器)                   | 服务器                     |
| **访问后端** | 需通过 API 请求                   | 直接访问 DB/FS             |
| **交互性**   | 支持 (onClick, onChange)          | 不支持                     |
| **Hooks**    | 支持 (useState, useEffect)        | 不支持                     |
| **包体积**   | 计入客户端 Bundle                 | **零 Bundle 体积**         |

#### 12.1.2 组合模式 (Composition Patterns)

RSC 不能直接导入 Client Component，但可以通过 `children` 属性传递。

```jsx
// ServerComponent.js
import ClientComponent from "./ClientComponent";
import ServerContent from "./ServerContent";

export default function Page() {
  return (
    <ClientComponent>
      {/* ServerContent 会在服务器渲染，结果作为 children 传给 ClientComponent */}
      <ServerContent />
    </ClientComponent>
  );
}
```

### 12.2 乐观 UI 更新 (Optimistic UI)

React 19 引入 `useOptimistic` 处理异步操作时的即时反馈。

```jsx
import { useOptimistic, useState, useTransition } from "react";

function MessageList({ initialMessages, sendMessage }) {
  const [messages, setMessages] = useState(initialMessages);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  );

  async function formAction(formData) {
    const text = formData.get("message");
    // 1. 立即显示乐观状态
    addOptimisticMessage({ text, sending: true });

    // 2. 执行真实异步操作
    const sentMessage = await sendMessage(text);

    // 3. 更新真实状态 (乐观状态会自动丢弃)
    setMessages((msgs) => [...msgs, sentMessage]);
  }

  return (
    <div>
      {optimisticMessages.map((m, i) => (
        <div key={i} style={{ opacity: m.sending ? 0.5 : 1 }}>
          {m.text}
        </div>
      ))}
      <form action={formAction}>
        <input name="message" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### 12.3 高级表单处理 (React 19 Actions)

结合 `useActionState` 和 `useFormStatus` 处理表单提交状态与结果。

```jsx
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

// 提取提交按钮以使用 useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
  );
}

async function updateProfile(prevState, formData) {
  try {
    await saveToDb(formData);
    return { success: true, message: "Profile updated!" };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

export default function ProfileForm() {
  const [state, formAction] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="username" required />
      <SubmitButton />
      {state?.message && (
        <p className={state.success ? "success" : "error"}>{state.message}</p>
      )}
    </form>
  );
}
```

### 12.4 并发模式实战 (Concurrent Features)

React 18+ 引入了并发特性，允许 React 中断渲染以保持 UI 响应。

#### 12.4.1 useTransition

用于将某些状态更新标记为“非紧急” (Transition)，允许 React 优先处理用户输入等紧急更新。

```jsx
import { useState, useTransition } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 1. 紧急更新：输入框回显
    setQuery(e.target.value);

    // 2. 非紧急更新：过滤列表 (耗时操作)
    startTransition(() => {
      const filtered = filterList(e.target.value);
      setList(filtered);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending ? <p>Loading list...</p> : <List items={list} />}
    </div>
  );
}
```

#### 12.4.2 useDeferredValue

类似于防抖 (Debounce)，但不是基于时间，而是基于渲染优先级。

```jsx
import { useState, useDeferredValue } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  // 延迟版本的 query，当 UI 闲置时才会更新
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* List 使用延迟的 query，输入时不会阻塞 */}
      <SlowList query={deferredQuery} />
    </div>
  );
}
```

## 13. 测试与工程化 (Testing & Engineering)

### 13.1 单元测试 (Jest + React Testing Library)

测试组件行为而非实现细节。

```jsx
// Counter.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

test("increments counter", () => {
  render(<Counter />);

  const button = screen.getByText(/increment/i);
  const value = screen.getByTestId("count-value");

  expect(value).toHaveTextContent("0");

  fireEvent.click(button);

  expect(value).toHaveTextContent("1");
});
```

### 13.2 性能监控 (Performance Monitoring)

使用 `web-vitals` 库监控真实用户性能指标 (Core Web Vitals)。

```javascript
import { onCLS, onFID, onLCP } from "web-vitals";

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  // 发送给分析服务
  navigator.sendBeacon("/analytics", body);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

### 13.3 可访问性 (Accessibility / a11y)

确保应用对所有用户友好。

- **语义化 HTML**: 使用 `<button>`, `<nav>`, `<main>` 而非 `<div>`。
- **ARIA 属性**: 当语义化标签不足时，使用 `aria-label`, `aria-expanded` 等。
- **键盘导航**: 确保所有交互元素可通过 `Tab` 键访问，且有清晰的 `:focus` 样式。

```jsx
// ❌ Bad
<div onClick={submit}>Submit</div>

// ✅ Good
<button onClick={submit} aria-label="Submit Form">Submit</button>
```

---

## 14. 适用场景 (Applicable Scenarios)

### 14.1 推荐场景

- **中大型 Web 应用**: 数据状态复杂、交互频繁的系统（如 SaaS 平台、管理后台）。
- **内容型网站**: 结合 Next.js (SSR/SSG) 解决 SEO 问题（如新闻站、博客）。
- **跨平台应用**: 需要同时开发 Web 和 Mobile App (React Native)。
- **动态仪表盘**: 需要实时数据更新和复杂图表展示。

### 14.2 不推荐场景

- **极其简单的静态页**: 引入 React 运行时可能过于沉重（不如纯 HTML/CSS）。
- **对包体积极其敏感的嵌入式 Webview**: 尽管 Preact 是个替代品，但原生 JS 体积最小。

---

## 15. 注意事项 (Precautions)

### 15.1 Hooks 使用规则

1.  **只能在最顶层调用 Hooks**: 不要在循环、条件判断或嵌套函数中调用。确保 Hook 调用顺序在每次渲染中保持一致。
2.  **只能在 React 函数组件或自定义 Hook 中调用**。

### 15.2 闭包陷阱 (Stale Closures)

在 `useEffect` 或 `useCallback` 中，如果依赖项数组没写全，可能会引用到旧的 state 或 props 值。

- **解决**: 使用 ESLint 插件 `react-hooks/exhaustive-deps` 自动检查依赖。

### 15.3 渲染性能

- **避免不必要的重渲染**: 父组件更新会导致所有子组件更新。使用 `React.memo` 包裹纯展示子组件。
- **状态下沉**: 将状态尽量保持在需要它的最小组件层级，避免全局状态滥用。

---

## 16. 常见问题 (FAQ)

### 16.1 React 和 Vue 的主要区别是什么？

- **思想**: React 推崇 "All in JS" 和不可变数据；Vue 推崇模板语法和响应式可变数据。
- **写法**: React 更加灵活（JSX），Vue 更加规范（Template/Script/Style）。
- **生态**: React 社区更大，解决方案更多；Vue 上手更简单。

### 16.2 为什么列表渲染需要 `key`？

`key` 帮助 React 识别哪些元素改变了、添加了或删除了。

- **作用**: 在 Diff 算法中复用 DOM 节点。
- **忌讳**: 不要使用数组索引 (index) 作为 key，除非列表是静态的且不会重新排序。

### 16.3 `useEffect` 和 `useLayoutEffect` 的区别？

- **`useEffect`**: 异步执行，在浏览器绘制 (Paint) **之后** 运行。不阻塞视觉更新。
- **`useLayoutEffect`**: 同步执行，在 DOM 更新后、浏览器绘制 **之前** 运行。用于测量 DOM 尺寸等操作，会阻塞视觉更新。

### 16.4 什么是受控组件与非受控组件？

- **受控组件**: 表单数据由 React State 控制 (`value={state}`).
- **非受控组件**: 表单数据由 DOM 自身控制，通过 ref 获取 (`defaultValue`).

---

## 17. React 面试真题精讲 (Interview Questions)

### 17.1 Virtual DOM 真的比原生 DOM 快吗？

**不一定。**

- **理论上**: 任何封装层都比原生操作慢。
- **实际上**: Virtual DOM 的优势在于**开发效率**和**可维护性**，以及在**大量数据更新**场景下的**批处理**能力。
- **核心价值**: 它保证了在任何场景下，性能下限不会太差（因为它会通过 Diff 算法计算出最小修改量），而不是追求性能上限。
- **Svelte/Solid**: 这些无 Virtual DOM 的框架证明了直接操作 DOM（通过编译时优化）可以更快。

### 17.2 React Fiber 是什么？解决了什么问题？

- **问题**: 在 React 15 中，更新过程是同步且不可中断的 (Stack Reconciler)。如果组件树很大，主线程被占用超过 16ms，会导致页面掉帧（卡顿）。
- **Fiber (React 16+)**: 是一种新的协调引擎，将渲染任务拆分成一个个小的**工作单元 (Unit of Work)**。
- **特性**:
  - **时间切片 (Time Slicing)**: 将任务分散到多个帧中执行。
  - **可中断**: 优先处理高优先级任务（如用户输入），暂停低优先级任务。
  - **双缓存 (Double Buffering)**: 在内存中构建好 Fiber 树后再一次性切换，避免页面闪烁。

### 17.3 为什么 Hooks 必须在最顶层调用？

因为 React 内部是**通过链表**来维护 Hooks 的状态的。

- 每次渲染时，React 会按顺序遍历 Hooks 链表。
- 如果放入条件语句中，导致某次渲染少调用了一个 Hook，后面的 Hook 获取到的状态就会错位（例如 `useState` 获取到了 `useEffect` 的数据），导致程序崩溃。

### 17.4 React 18 自动批处理 (Automatic Batching) 是什么？

- **React 17 及之前**: 只有在 React 事件处理函数中，setState 才会合并重渲染。在 `setTimeout`、`Promise` 或原生事件中，每次 setState 都会触发重渲染。
- **React 18**: 所有更新（包括 Promise、setTimeout）都会自动合并。
  - 如果需要强制同步更新（极少见），可以使用 `flushSync`。

### 17.5 合成事件 (Synthetic Event) 机制

React 并不直接将事件绑定到 DOM 节点上，而是通过**事件代理**。

- **React 17+**: 将事件委托给 **Root Element** (`#root`)，而不是 Document（解决微前端兼容性问题）。
- **优势**: 抹平浏览器差异（跨浏览器兼容），减少内存消耗（对象池）。

---

## 18. 总结 (Summary)

### 18.1 核心要点回顾

React 的核心在于**组件化思维**和**状态驱动视图**。掌握 **JSX**、**Hooks**、**Props/State** 是基础，理解 **Virtual DOM** 和 **Diff 算法** 是进阶，而熟悉 **Server Components** 则是通向 Next.js 全栈开发的必经之路。

### 18.2 学习路径

1.  **基础**: 熟练使用 useState, useEffect 处理业务逻辑。
2.  **进阶**: 掌握 useContext, useReducer 管理复杂状态，学习性能优化 (useMemo/useCallback)。
3.  **架构**: 理解 RSC 架构，学会在 Next.js 中区分 Client/Server Component 边界。
4.  **生态**: 学习常用库 (TanStack Query, Zustand, React Hook Form, Tailwind CSS)。

---

## 19. 扩展阅读与资源 (Resources)

- **官方文档**: [react.dev](https://react.dev) (最新文档，不再是 reactjs.org)
- **React 源码解析**: [acdlite/react-fiber-architecture](https://github.com/acdlite/react-fiber-architecture)
- **Hooks 深度指南**: [Overreacted.io](https://overreacted.io/) (Dan Abramov 的博客)
- **状态管理对比**: [Zustand vs Redux vs Context](https://github.com/pmndrs/zustand)
- **性能优化**: [web.dev/react](https://web.dev/react)

> 关键版本记录：
>
> - v16.8: Hooks 发布 (里程碑)
> - v18.0: Concurrent Mode, Automatic Batching
> - v19.0: Server Components, Actions, Compiler (No memo needed)

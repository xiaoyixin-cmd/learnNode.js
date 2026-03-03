**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useOptimistic 实时反馈案例

useOptimistic 是 React 提供的 Hook,用于实现乐观更新,在等待服务器响应时立即更新 UI,提升用户体验。

## 核心概念

### useOptimistic 特点

| 特点     | 说明            | 优势       |
| -------- | --------------- | ---------- |
| 即时反馈 | 立即更新 UI     | 响应速度快 |
| 自动回滚 | 失败时恢复      | 数据一致性 |
| 简单易用 | API 简洁        | 开发效率高 |
| 类型安全 | TypeScript 支持 | 代码质量好 |

## 实战场景一: 点赞功能

### 基础点赞

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

### Server Action

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLike(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: {
      likes: { increment: 1 },
    },
  });

  revalidatePath(`/posts/${postId}`);
}
```

## 实战场景二: 评论功能

### 添加评论

```typescript
"use client";

import { useOptimistic, useRef } from "react";
import { addComment } from "../actions";

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export default function CommentList({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state, newComment: Comment) => [...state, newComment]
  );

  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const content = formData.get("content") as string;

    addOptimisticComment({
      id: crypto.randomUUID(),
      content,
      author: "当前用户",
      createdAt: new Date(),
    });

    formRef.current?.reset();

    await addComment(postId, content);
  }

  return (
    <div>
      <div>
        {optimisticComments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.content}</p>
            <small>
              {comment.author} - {comment.createdAt.toLocaleString()}
            </small>
          </div>
        ))}
      </div>

      <form ref={formRef} action={handleSubmit}>
        <textarea name="content" placeholder="写评论..." required />
        <button type="submit">发布</button>
      </form>
    </div>
  );
}
```

## 实战场景三: 待办事项

### 添加任务

```typescript
"use client";

import { useOptimistic } from "react";
import { addTodo, toggleTodo, deleteTodo } from "../actions";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    initialTodos,
    (state, action: { type: string; payload: any }) => {
      switch (action.type) {
        case "add":
          return [...state, action.payload];
        case "toggle":
          return state.map((todo) =>
            todo.id === action.payload
              ? { ...todo, completed: !todo.completed }
              : todo
          );
        case "delete":
          return state.filter((todo) => todo.id !== action.payload);
        default:
          return state;
      }
    }
  );

  async function handleAdd(formData: FormData) {
    const text = formData.get("text") as string;

    updateOptimisticTodos({
      type: "add",
      payload: { id: crypto.randomUUID(), text, completed: false },
    });

    await addTodo(text);
  }

  async function handleToggle(id: string) {
    updateOptimisticTodos({ type: "toggle", payload: id });
    await toggleTodo(id);
  }

  async function handleDelete(id: string) {
    updateOptimisticTodos({ type: "delete", payload: id });
    await deleteTodo(id);
  }

  return (
    <div>
      <form action={handleAdd}>
        <input name="text" placeholder="添加任务..." required />
        <button type="submit">添加</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => handleDelete(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 实战场景四: 购物车

### 购物车操作

```typescript
"use client";

import { useOptimistic } from "react";
import { updateCart } from "../actions";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function ShoppingCart({
  initialItems,
}: {
  initialItems: CartItem[];
}) {
  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    initialItems,
    (state, action: { type: string; payload: any }) => {
      switch (action.type) {
        case "increment":
          return state.map((item) =>
            item.id === action.payload
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        case "decrement":
          return state.map((item) =>
            item.id === action.payload && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        case "remove":
          return state.filter((item) => item.id !== action.payload);
        default:
          return state;
      }
    }
  );

  async function handleIncrement(id: string) {
    updateOptimisticItems({ type: "increment", payload: id });
    await updateCart(id, "increment");
  }

  async function handleDecrement(id: string) {
    updateOptimisticItems({ type: "decrement", payload: id });
    await updateCart(id, "decrement");
  }

  async function handleRemove(id: string) {
    updateOptimisticItems({ type: "remove", payload: id });
    await updateCart(id, "remove");
  }

  const total = optimisticItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      {optimisticItems.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>¥{item.price}</span>
          <button onClick={() => handleDecrement(item.id)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => handleIncrement(item.id)}>+</button>
          <button onClick={() => handleRemove(item.id)}>删除</button>
        </div>
      ))}
      <div>总计: ¥{total}</div>
    </div>
  );
}
```

## 实战场景五: 关注功能

### 关注/取消关注

```typescript
"use client";

import { useOptimistic } from "react";
import { toggleFollow } from "../actions";

export default function FollowButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    initialFollowing,
    (state, newState: boolean) => newState
  );

  async function handleToggle() {
    setOptimisticFollowing(!optimisticFollowing);
    await toggleFollow(userId);
  }

  return (
    <button onClick={handleToggle}>
      {optimisticFollowing ? "已关注" : "关注"}
    </button>
  );
}
```

## 实战场景六: 投票功能

### 投票系统

```typescript
"use client";

import { useOptimistic } from "react";
import { vote } from "../actions";

interface Poll {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
  userVote: string | null;
}

export default function PollComponent({ initialPoll }: { initialPoll: Poll }) {
  const [optimisticPoll, updateOptimisticPoll] = useOptimistic(
    initialPoll,
    (state, optionId: string) => ({
      ...state,
      options: state.options.map((option) => ({
        ...option,
        votes: option.id === optionId ? option.votes + 1 : option.votes,
      })),
      userVote: optionId,
    })
  );

  async function handleVote(optionId: string) {
    updateOptimisticPoll(optionId);
    await vote(optimisticPoll.id, optionId);
  }

  const totalVotes = optimisticPoll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  return (
    <div>
      <h3>{optimisticPoll.question}</h3>
      {optimisticPoll.options.map((option) => (
        <div key={option.id}>
          <button
            onClick={() => handleVote(option.id)}
            disabled={optimisticPoll.userVote !== null}
          >
            {option.text}
          </button>
          <span>
            {option.votes} 票 ({((option.votes / totalVotes) * 100).toFixed(1)}
            %)
          </span>
        </div>
      ))}
    </div>
  );
}
```

## 实战场景七: 书签功能

### 添加/删除书签

```typescript
"use client";

import { useOptimistic } from "react";
import { toggleBookmark } from "../actions";

export default function BookmarkButton({
  articleId,
  initialBookmarked,
}: {
  articleId: string;
  initialBookmarked: boolean;
}) {
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    initialBookmarked,
    (state, newState: boolean) => newState
  );

  async function handleToggle() {
    setOptimisticBookmarked(!optimisticBookmarked);
    await toggleBookmark(articleId);
  }

  return (
    <button onClick={handleToggle}>
      {optimisticBookmarked ? "已收藏" : "收藏"}
    </button>
  );
}
```

## 实战场景八: 消息已读

### 标记已读

```typescript
"use client";

import { useOptimistic } from "react";
import { markAsRead } from "../actions";

interface Message {
  id: string;
  content: string;
  read: boolean;
}

export default function MessageList({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [optimisticMessages, updateOptimisticMessages] = useOptimistic(
    initialMessages,
    (state, messageId: string) =>
      state.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
  );

  async function handleMarkAsRead(messageId: string) {
    updateOptimisticMessages(messageId);
    await markAsRead(messageId);
  }

  return (
    <div>
      {optimisticMessages.map((message) => (
        <div
          key={message.id}
          style={{ fontWeight: message.read ? "normal" : "bold" }}
          onClick={() => !message.read && handleMarkAsRead(message.id)}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
}
```

## 适用场景

| 场景      | 使用方式     | 优势       |
| --------- | ------------ | ---------- |
| 点赞/收藏 | 简单状态切换 | 即时反馈   |
| 评论/回复 | 列表添加     | 用户体验好 |
| 购物车    | 复杂状态更新 | 操作流畅   |
| 投票      | 数据统计     | 实时更新   |
| 待办事项  | CRUD 操作    | 响应快速   |

## 注意事项

### 1. 错误处理

```typescript
"use client";

import { useOptimistic, useState } from "react";

export default function WithErrorHandling({
  initialData,
}: {
  initialData: any;
}) {
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(newData: any) {
    setOptimisticData(newData);
    setError(null);

    try {
      await updateData(newData);
    } catch (err) {
      setError("更新失败,请重试");
      // 数据会自动回滚到 initialData
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <button onClick={() => handleUpdate("new data")}>更新</button>
    </div>
  );
}
```

### 2. 数据同步

```typescript
"use client";

import { useOptimistic, useEffect } from "react";

export default function WithSync({ initialData }: { initialData: any }) {
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  useEffect(() => {
    // 当 initialData 更新时,乐观数据会自动同步
  }, [initialData]);

  return <div>{JSON.stringify(optimisticData)}</div>;
}
```

### 3. 复杂状态

```typescript
"use client";

import { useOptimistic } from "react";

interface State {
  items: any[];
  total: number;
  loading: boolean;
}

export default function ComplexState({
  initialState,
}: {
  initialState: State;
}) {
  const [optimisticState, updateOptimisticState] = useOptimistic(
    initialState,
    (state, action: { type: string; payload: any }) => {
      switch (action.type) {
        case "add":
          return {
            ...state,
            items: [...state.items, action.payload],
            total: state.total + 1,
          };
        default:
          return state;
      }
    }
  );

  return <div>Items: {optimisticState.total}</div>;
}
```

### 4. 性能优化

```typescript
"use client";

import { useOptimistic, useMemo } from "react";

export default function OptimizedComponent({
  initialItems,
}: {
  initialItems: any[];
}) {
  const [optimisticItems, updateOptimisticItems] = useOptimistic(initialItems);

  const sortedItems = useMemo(
    () => optimisticItems.sort((a, b) => a.order - b.order),
    [optimisticItems]
  );

  return (
    <div>
      {sortedItems.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### 5. 类型安全

```typescript
"use client";

import { useOptimistic } from "react";

interface Item {
  id: string;
  name: string;
}

type Action =
  | { type: "add"; payload: Item }
  | { type: "remove"; payload: string };

export default function TypeSafeComponent({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [optimisticItems, updateOptimisticItems] = useOptimistic<
    Item[],
    Action
  >(initialItems, (state, action) => {
    switch (action.type) {
      case "add":
        return [...state, action.payload];
      case "remove":
        return state.filter((item) => item.id !== action.payload);
    }
  });

  return <div>Items: {optimisticItems.length}</div>;
}
```

## 常见问题

### 1. 如何处理失败回滚?

useOptimistic 会自动回滚:

```typescript
"use client";

import { useOptimistic } from "react";

export default function AutoRollback({ initialData }: { initialData: any }) {
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  async function handleUpdate(newData: any) {
    setOptimisticData(newData);

    try {
      await updateData(newData);
    } catch (error) {
      // 失败时自动回滚到 initialData
      console.error("更新失败,已回滚");
    }
  }

  return <div>{JSON.stringify(optimisticData)}</div>;
}
```

### 2. 如何显示加载状态?

结合 useFormStatus:

```typescript
"use client";

import { useOptimistic } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "提交中..." : "提交"}</button>;
}

export default function WithLoadingState({
  initialData,
}: {
  initialData: any;
}) {
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  return (
    <form
      action={async (formData) => {
        setOptimisticData(Object.fromEntries(formData));
        await submitForm(formData);
      }}
    >
      <input name="data" />
      <SubmitButton />
    </form>
  );
}
```

### 3. 如何处理多个乐观更新?

使用多个 useOptimistic:

```typescript
"use client";

import { useOptimistic } from "react";

export default function MultipleOptimistic({
  initialLikes,
  initialComments,
}: {
  initialLikes: number;
  initialComments: any[];
}) {
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(initialLikes);
  const [optimisticComments, setOptimisticComments] =
    useOptimistic(initialComments);

  return (
    <div>
      <div>Likes: {optimisticLikes}</div>
      <div>Comments: {optimisticComments.length}</div>
    </div>
  );
}
```

### 4. 如何实现撤销功能?

保存历史记录:

```typescript
"use client";

import { useOptimistic, useState } from "react";

export default function WithUndo({ initialData }: { initialData: any }) {
  const [history, setHistory] = useState<any[]>([initialData]);
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  function handleUpdate(newData: any) {
    setHistory([...history, newData]);
    setOptimisticData(newData);
  }

  function handleUndo() {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setOptimisticData(newHistory[newHistory.length - 1]);
    }
  }

  return (
    <div>
      <button onClick={handleUndo} disabled={history.length <= 1}>
        撤销
      </button>
    </div>
  );
}
```

### 5. 如何处理并发更新?

使用版本号:

```typescript
"use client";

import { useOptimistic, useRef } from "react";

export default function WithVersioning({ initialData }: { initialData: any }) {
  const versionRef = useRef(0);
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  async function handleUpdate(newData: any) {
    const currentVersion = ++versionRef.current;
    setOptimisticData(newData);

    const result = await updateData(newData);

    if (currentVersion !== versionRef.current) {
      // 有新的更新,忽略这个结果
      return;
    }
  }

  return <div>{JSON.stringify(optimisticData)}</div>;
}
```

### 6. 如何实现批量操作?

批量更新:

```typescript
"use client";

import { useOptimistic } from "react";

export default function BatchOperations({
  initialItems,
}: {
  initialItems: any[];
}) {
  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    initialItems,
    (state, ids: string[]) => state.filter((item) => !ids.includes(item.id))
  );

  async function handleBatchDelete(ids: string[]) {
    updateOptimisticItems(ids);
    await batchDelete(ids);
  }

  return (
    <div>
      <button onClick={() => handleBatchDelete(["1", "2", "3"])}>
        批量删除
      </button>
    </div>
  );
}
```

### 7. 如何处理嵌套数据?

深度更新:

```typescript
"use client";

import { useOptimistic } from "react";

interface NestedData {
  user: {
    profile: {
      name: string;
    };
  };
}

export default function NestedUpdate({
  initialData,
}: {
  initialData: NestedData;
}) {
  const [optimisticData, updateOptimisticData] = useOptimistic(
    initialData,
    (state, newName: string) => ({
      ...state,
      user: {
        ...state.user,
        profile: {
          ...state.user.profile,
          name: newName,
        },
      },
    })
  );

  return <div>{optimisticData.user.profile.name}</div>;
}
```

### 8. 如何实现条件更新?

添加条件判断:

```typescript
"use client";

import { useOptimistic } from "react";

export default function ConditionalUpdate({
  initialData,
  canUpdate,
}: {
  initialData: any;
  canUpdate: boolean;
}) {
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  async function handleUpdate(newData: any) {
    if (!canUpdate) {
      alert("没有权限");
      return;
    }

    setOptimisticData(newData);
    await updateData(newData);
  }

  return <button onClick={() => handleUpdate("new")}>更新</button>;
}
```

### 9. 如何实现实时同步?

使用 WebSocket:

```typescript
"use client";

import { useOptimistic, useEffect } from "react";

export default function RealtimeSync({ initialData }: { initialData: any }) {
  const [optimisticData, setOptimisticData] = useOptimistic(initialData);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOptimisticData(data);
    };

    return () => ws.close();
  }, []);

  return <div>{JSON.stringify(optimisticData)}</div>;
}
```

### 10. 如何测试乐观更新?

编写测试:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import LikeButton from "./LikeButton";

describe("LikeButton", () => {
  it("should update optimistically", async () => {
    render(<LikeButton postId="1" initialLikes={10} />);

    const button = screen.getByText(/点赞/);

    expect(button).toHaveTextContent("点赞 (10)");

    fireEvent.click(button);

    expect(button).toHaveTextContent("点赞 (11)");
  });
});
```

## 总结

useOptimistic 提供了简单而强大的乐观更新能力。通过本文的学习,我们掌握了:

### 核心技术

1. **基础使用**: useOptimistic Hook 的基本用法
2. **状态管理**: 复杂状态的乐观更新
3. **错误处理**: 自动回滚机制
4. **类型安全**: TypeScript 类型定义

### 最佳实践

1. **即时反馈**: 立即更新 UI 提升体验
2. **错误处理**: 完善的错误处理和回滚
3. **性能优化**: 使用 useMemo 优化渲染
4. **数据同步**: 自动同步服务器数据

### 实战技巧

1. **点赞收藏**: 简单状态切换
2. **评论回复**: 列表数据添加
3. **购物车**: 复杂状态更新
4. **投票系统**: 实时数据统计

通过合理使用 useOptimistic,可以构建响应迅速、用户体验优秀的交互界面。

## 实战场景九: 拖拽排序

### 拖拽列表

```typescript
"use client";

import { useOptimistic, useState } from "react";
import { updateOrder } from "../actions";

interface Item {
  id: string;
  name: string;
  order: number;
}

export default function DraggableList({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    initialItems,
    (state, { fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
      const newItems = [...state];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      return newItems.map((item, index) => ({ ...item, order: index }));
    }
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    updateOptimisticItems({ fromIndex: draggedIndex, toIndex: index });
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    if (draggedIndex !== null) {
      await updateOrder(optimisticItems.map((item) => item.id));
      setDraggedIndex(null);
    }
  }

  return (
    <div>
      {optimisticItems.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

## 实战场景十: 实时搜索

### 搜索过滤

```typescript
"use client";

import { useOptimistic, useState } from "react";
import { search } from "../actions";

interface SearchResult {
  id: string;
  title: string;
  description: string;
}

export default function SearchComponent({
  initialResults,
}: {
  initialResults: SearchResult[];
}) {
  const [optimisticResults, setOptimisticResults] =
    useOptimistic(initialResults);
  const [query, setQuery] = useState("");

  async function handleSearch(newQuery: string) {
    setQuery(newQuery);

    // 客户端过滤作为乐观更新
    const filtered = initialResults.filter((item) =>
      item.title.toLowerCase().includes(newQuery.toLowerCase())
    );
    setOptimisticResults(filtered);

    // 服务器搜索
    const serverResults = await search(newQuery);
    setOptimisticResults(serverResults);
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      <div>
        {optimisticResults.map((result) => (
          <div key={result.id}>
            <h3>{result.title}</h3>
            <p>{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 实战场景十一: 表单自动保存

### 自动保存草稿

```typescript
"use client";

import { useOptimistic, useEffect, useState } from "react";
import { saveDraft } from "../actions";

interface Draft {
  id: string;
  content: string;
  savedAt: Date;
}

export default function AutoSaveForm({
  initialDraft,
}: {
  initialDraft: Draft;
}) {
  const [optimisticDraft, setOptimisticDraft] = useOptimistic(initialDraft);
  const [content, setContent] = useState(initialDraft.content);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (content !== optimisticDraft.content) {
        const newDraft = {
          ...optimisticDraft,
          content,
          savedAt: new Date(),
        };
        setOptimisticDraft(newDraft);
        await saveDraft(newDraft);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="开始写作..."
      />
      <small>上次保存: {optimisticDraft.savedAt.toLocaleString()}</small>
    </div>
  );
}
```

## 实战场景十二: 通知系统

### 通知管理

```typescript
"use client";

import { useOptimistic } from "react";
import { dismissNotification, markAllAsRead } from "../actions";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  dismissed: boolean;
}

export default function NotificationCenter({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [optimisticNotifications, updateOptimisticNotifications] =
    useOptimistic(
      initialNotifications,
      (state, action: { type: string; payload: any }) => {
        switch (action.type) {
          case "dismiss":
            return state.map((n) =>
              n.id === action.payload ? { ...n, dismissed: true } : n
            );
          case "markAllRead":
            return state.map((n) => ({ ...n, read: true }));
          default:
            return state;
        }
      }
    );

  async function handleDismiss(id: string) {
    updateOptimisticNotifications({ type: "dismiss", payload: id });
    await dismissNotification(id);
  }

  async function handleMarkAllAsRead() {
    updateOptimisticNotifications({ type: "markAllRead", payload: null });
    await markAllAsRead();
  }

  const unreadCount = optimisticNotifications.filter(
    (n) => !n.read && !n.dismissed
  ).length;

  return (
    <div>
      <div>
        <span>未读通知: {unreadCount}</span>
        <button onClick={handleMarkAllAsRead}>全部标记为已读</button>
      </div>
      {optimisticNotifications
        .filter((n) => !n.dismissed)
        .map((notification) => (
          <div
            key={notification.id}
            style={{ fontWeight: notification.read ? "normal" : "bold" }}
          >
            <p>{notification.message}</p>
            <button onClick={() => handleDismiss(notification.id)}>关闭</button>
          </div>
        ))}
    </div>
  );
}
```

## 实战场景十三: 标签管理

### 添加/删除标签

```typescript
"use client";

import { useOptimistic, useState } from "react";
import { updateTags } from "../actions";

export default function TagManager({
  postId,
  initialTags,
}: {
  postId: string;
  initialTags: string[];
}) {
  const [optimisticTags, updateOptimisticTags] = useOptimistic(
    initialTags,
    (state, action: { type: string; payload: string }) => {
      switch (action.type) {
        case "add":
          return [...state, action.payload];
        case "remove":
          return state.filter((tag) => tag !== action.payload);
        default:
          return state;
      }
    }
  );

  const [inputValue, setInputValue] = useState("");

  async function handleAddTag() {
    if (!inputValue.trim()) return;

    updateOptimisticTags({ type: "add", payload: inputValue });
    setInputValue("");
    await updateTags(postId, [...optimisticTags, inputValue]);
  }

  async function handleRemoveTag(tag: string) {
    updateOptimisticTags({ type: "remove", payload: tag });
    await updateTags(
      postId,
      optimisticTags.filter((t) => t !== tag)
    );
  }

  return (
    <div>
      <div>
        {optimisticTags.map((tag) => (
          <span key={tag}>
            {tag}
            <button onClick={() => handleRemoveTag(tag)}>×</button>
          </span>
        ))}
      </div>
      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
          placeholder="添加标签..."
        />
        <button onClick={handleAddTag}>添加</button>
      </div>
    </div>
  );
}
```

## 实战场景十四: 评分系统

### 星级评分

```typescript
"use client";

import { useOptimistic, useState } from "react";
import { submitRating } from "../actions";

export default function StarRating({
  itemId,
  initialRating,
}: {
  itemId: string;
  initialRating: number;
}) {
  const [optimisticRating, setOptimisticRating] = useOptimistic(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  async function handleRate(rating: number) {
    setOptimisticRating(rating);
    await submitRating(itemId, rating);
  }

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          style={{
            cursor: "pointer",
            color: star <= (hoverRating || optimisticRating) ? "gold" : "gray",
          }}
        >
          ★
        </span>
      ))}
      <span>{optimisticRating} / 5</span>
    </div>
  );
}
```

## 实战场景十五: 文件夹树

### 文件夹展开/折叠

```typescript
"use client";

import { useOptimistic } from "react";
import { toggleFolder } from "../actions";

interface Folder {
  id: string;
  name: string;
  expanded: boolean;
  children: Folder[];
}

export default function FolderTree({
  initialFolder,
}: {
  initialFolder: Folder;
}) {
  const [optimisticFolder, updateOptimisticFolder] = useOptimistic(
    initialFolder,
    (state, folderId: string): Folder => {
      if (state.id === folderId) {
        return { ...state, expanded: !state.expanded };
      }
      return {
        ...state,
        children: state.children.map((child) =>
          updateOptimisticFolder(child, folderId)
        ),
      };
    }
  );

  async function handleToggle(folderId: string) {
    updateOptimisticFolder(folderId);
    await toggleFolder(folderId);
  }

  function renderFolder(folder: Folder): React.ReactNode {
    return (
      <div key={folder.id}>
        <div onClick={() => handleToggle(folder.id)}>
          {folder.expanded ? "▼" : "▶"} {folder.name}
        </div>
        {folder.expanded && (
          <div style={{ marginLeft: 20 }}>
            {folder.children.map((child) => renderFolder(child))}
          </div>
        )}
      </div>
    );
  }

  return <div>{renderFolder(optimisticFolder)}</div>;
}
```

1. **即时反馈**: 立即更新 UI 提升体验
2. **错误处理**: 完善的错误处理和回滚
3. **性能优化**: 使用 useMemo 优化渲染
4. **数据同步**: 自动同步服务器数据

### 实战技巧

1. **点赞收藏**: 简单状态切换
2. **评论回复**: 列表数据添加
3. **购物车**: 复杂状态更新
4. **投票系统**: 实时数据统计

通过合理使用 useOptimistic,可以构建响应迅速、用户体验优秀的交互界面。

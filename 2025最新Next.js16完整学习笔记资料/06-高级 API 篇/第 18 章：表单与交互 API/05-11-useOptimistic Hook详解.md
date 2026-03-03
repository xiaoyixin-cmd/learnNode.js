**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# useOptimistic Hook 详解

## 1. 概述

`useOptimistic`是 React 19 引入的 Hook,用于实现乐观更新(Optimistic Updates)。它允许你在服务器响应之前立即更新 UI,提供更流畅的用户体验。

### 1.1 核心特性

- **即时反馈**: 立即更新 UI
- **自动回滚**: 失败时自动恢复
- **类型安全**: 完整的 TypeScript 支持
- **简单 API**: 易于使用
- **与 Server Actions 集成**: 完美配合

### 1.2 使用场景

- 点赞/收藏功能
- 评论提交
- 待办事项切换
- 购物车操作
- 实时协作

### 1.3 基本用法

```tsx
import { useOptimistic } from "react";

const [optimisticState, addOptimistic] = useOptimistic(
  currentState,
  (state, newValue) => {
    // 返回新状态
    return [...state, newValue];
  }
);
```

---

## 2. 基础用法

### 2.1 简单示例

```tsx
"use client";

import { useOptimistic } from "react";
import { addTodo } from "./actions";

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    const newTodo = { id: Date.now(), title, completed: false };

    addOptimisticTodo(newTodo);
    await addTodo(formData);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <input type="text" name="title" required />
        <button type="submit">添加</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2.2 点赞功能

```tsx
"use client";

import { useOptimistic } from "react";
import { toggleLike } from "./actions";

export default function LikeButton({
  postId,
  initialLikes,
  isLiked,
}: {
  postId: string;
  initialLikes: number;
  isLiked: boolean;
}) {
  const [optimisticState, setOptimisticState] = useOptimistic(
    { likes: initialLikes, isLiked },
    (state) => ({
      likes: state.isLiked ? state.likes - 1 : state.likes + 1,
      isLiked: !state.isLiked,
    })
  );

  async function handleLike() {
    setOptimisticState(null);
    await toggleLike(postId);
  }

  return (
    <button onClick={handleLike}>
      {optimisticState.isLiked ? "❤️" : "🤍"} {optimisticState.likes}
    </button>
  );
}
```

### 2.3 评论提交

```tsx
"use client";

import { useOptimistic } from "react";
import { addComment } from "./actions";

export default function Comments({ comments }: { comments: Comment[] }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, newComment]
  );

  async function handleSubmit(formData: FormData) {
    const content = formData.get("content") as string;
    const newComment = {
      id: Date.now(),
      content,
      author: "当前用户",
      createdAt: new Date(),
      pending: true,
    };

    addOptimisticComment(newComment);
    await addComment(formData);
  }

  return (
    <div>
      <form action={handleSubmit}>
        <textarea name="content" required />
        <button type="submit">发表评论</button>
      </form>

      <div>
        {optimisticComments.map((comment) => (
          <div key={comment.id} className={comment.pending ? "opacity-50" : ""}>
            <p>{comment.content}</p>
            <small>{comment.author}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. 高级用法

### 3.1 复杂状态更新

```tsx
"use client";

import { useOptimistic } from "react";

type Action =
  | { type: "add"; todo: Todo }
  | { type: "toggle"; id: number }
  | { type: "delete"; id: number };

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, action: Action) => {
      switch (action.type) {
        case "add":
          return [...state, action.todo];
        case "toggle":
          return state.map((todo) =>
            todo.id === action.id
              ? { ...todo, completed: !todo.completed }
              : todo
          );
        case "delete":
          return state.filter((todo) => todo.id !== action.id);
        default:
          return state;
      }
    }
  );

  async function handleAdd(formData: FormData) {
    const title = formData.get("title") as string;
    const newTodo = { id: Date.now(), title, completed: false };

    updateOptimisticTodos({ type: "add", todo: newTodo });
    await addTodo(formData);
  }

  async function handleToggle(id: number) {
    updateOptimisticTodos({ type: "toggle", id });
    await toggleTodo(id);
  }

  async function handleDelete(id: number) {
    updateOptimisticTodos({ type: "delete", id });
    await deleteTodo(id);
  }

  return (
    <div>
      <form action={handleAdd}>
        <input type="text" name="title" required />
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
            <span>{todo.title}</span>
            <button onClick={() => handleDelete(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.2 嵌套数据更新

```tsx
"use client";

import { useOptimistic } from "react";

type Comment = {
  id: string;
  text: string;
  likes: number;
};

type Post = {
  id: string;
  title: string;
  comments: Comment[];
};

export function PostDetail({ post }: { post: Post }) {
  const [optimisticPost, updateOptimisticPost] = useOptimistic(
    post,
    (state, action: { type: "addComment" | "likeComment"; payload: any }) => {
      switch (action.type) {
        case "addComment":
          return {
            ...state,
            comments: [...state.comments, action.payload],
          };
        case "likeComment":
          return {
            ...state,
            comments: state.comments.map((comment) =>
              comment.id === action.payload.id
                ? { ...comment, likes: comment.likes + 1 }
                : comment
            ),
          };
        default:
          return state;
      }
    }
  );

  async function addComment(formData: FormData) {
    const text = formData.get("text") as string;
    const newComment = {
      id: crypto.randomUUID(),
      text,
      likes: 0,
    };

    updateOptimisticPost({ type: "addComment", payload: newComment });
    await createComment(post.id, text);
  }

  async function likeComment(commentId: string) {
    updateOptimisticPost({ type: "likeComment", payload: { id: commentId } });
    await incrementCommentLikes(commentId);
  }

  return (
    <div>
      <h1>{optimisticPost.title}</h1>

      <form action={addComment}>
        <textarea name="text" required />
        <button type="submit">添加评论</button>
      </form>

      <div>
        {optimisticPost.comments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.text}</p>
            <button onClick={() => likeComment(comment.id)}>
              点赞 ({comment.likes})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 批量操作

```tsx
"use client";

import { useOptimistic } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, action: { type: "deleteMany"; ids: string[] }) => {
      if (action.type === "deleteMany") {
        return state.filter((todo) => !action.ids.includes(todo.id));
      }
      return state;
    }
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function deleteSelected() {
    if (selectedIds.length === 0) return;

    // 乐观更新
    updateOptimisticTodos({ type: "deleteMany", ids: selectedIds });

    // 服务器操作
    await deleteTodos(selectedIds);
    setSelectedIds([]);
  }

  return (
    <div>
      <button onClick={deleteSelected} disabled={selectedIds.length === 0}>
        删除选中 ({selectedIds.length})
      </button>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(todo.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds([...selectedIds, todo.id]);
                } else {
                  setSelectedIds(selectedIds.filter((id) => id !== todo.id));
                }
              }}
            />
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.4 排序和过滤

```tsx
"use client";

import { useOptimistic } from "react";
import { useState } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [sortBy, setSortBy] = useState<"title" | "created">("created");

  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, newTodo: Todo) => {
      const newState = [...state, newTodo];

      // 根据当前排序方式排序
      return newState.sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }
  );

  async function addTodo(formData: FormData) {
    const title = formData.get("title") as string;
    const newTodo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    updateOptimisticTodos(newTodo);
    await createTodo(formData);
  }

  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="created">按创建时间</option>
        <option value="title">按标题</option>
      </select>

      <form action={addTodo}>
        <input name="title" />
        <button type="submit">添加</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. 实战案例

### 4.1 点赞功能

```tsx
"use client";

import { useOptimistic } from "react";
import { toggleLike } from "./actions";

type Post = {
  id: string;
  title: string;
  likes: number;
  isLiked: boolean;
};

export function PostCard({ post }: { post: Post }) {
  const [optimisticPost, updateOptimisticPost] = useOptimistic(
    post,
    (state) => ({
      ...state,
      likes: state.isLiked ? state.likes - 1 : state.likes + 1,
      isLiked: !state.isLiked,
    })
  );

  async function handleLike() {
    updateOptimisticPost(null);
    await toggleLike(post.id);
  }

  return (
    <div>
      <h2>{optimisticPost.title}</h2>
      <button onClick={handleLike}>
        {optimisticPost.isLiked ? "❤️" : "🤍"} {optimisticPost.likes}
      </button>
    </div>
  );
}
```

### 4.2 购物车

```tsx
"use client";

import { useOptimistic } from "react";
import { updateCartQuantity, removeFromCart } from "./actions";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export function ShoppingCart({ items }: { items: CartItem[] }) {
  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    items,
    (
      state,
      action: { type: "update" | "remove"; id: string; quantity?: number }
    ) => {
      switch (action.type) {
        case "update":
          return state.map((item) =>
            item.id === action.id
              ? { ...item, quantity: action.quantity! }
              : item
          );
        case "remove":
          return state.filter((item) => item.id !== action.id);
        default:
          return state;
      }
    }
  );

  async function handleUpdateQuantity(id: string, quantity: number) {
    updateOptimisticItems({ type: "update", id, quantity });
    await updateCartQuantity(id, quantity);
  }

  async function handleRemove(id: string) {
    updateOptimisticItems({ type: "remove", id });
    await removeFromCart(id);
  }

  const total = optimisticItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h2>购物车</h2>
      {optimisticItems.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>¥{item.price}</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              handleUpdateQuantity(item.id, Number(e.target.value))
            }
            min="1"
          />
          <button onClick={() => handleRemove(item.id)}>删除</button>
        </div>
      ))}
      <div>
        <strong>总计: ¥{total}</strong>
      </div>
    </div>
  );
}
```

### 4.3 评论系统

```tsx
"use client";

import { useOptimistic } from "react";
import { createComment, deleteComment } from "./actions";

type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

export function CommentSection({ comments }: { comments: Comment[] }) {
  const [optimisticComments, updateOptimisticComments] = useOptimistic(
    comments,
    (
      state,
      action: { type: "add" | "delete"; comment?: Comment; id?: string }
    ) => {
      switch (action.type) {
        case "add":
          return [...state, action.comment!];
        case "delete":
          return state.filter((comment) => comment.id !== action.id);
        default:
          return state;
      }
    }
  );

  async function handleSubmit(formData: FormData) {
    const text = formData.get("text") as string;
    const newComment = {
      id: crypto.randomUUID(),
      text,
      author: "当前用户",
      createdAt: new Date().toISOString(),
    };

    updateOptimisticComments({ type: "add", comment: newComment });
    await createComment(text);
  }

  async function handleDelete(id: string) {
    updateOptimisticComments({ type: "delete", id });
    await deleteComment(id);
  }

  return (
    <div>
      <h2>评论 ({optimisticComments.length})</h2>

      <form action={handleSubmit}>
        <textarea name="text" required placeholder="写下你的评论..." />
        <button type="submit">发表评论</button>
      </form>

      <div>
        {optimisticComments.map((comment) => (
          <div key={comment.id}>
            <p>{comment.text}</p>
            <small>
              {comment.author} · {new Date(comment.createdAt).toLocaleString()}
            </small>
            <button onClick={() => handleDelete(comment.id)}>删除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.4 关注功能

```tsx
"use client";

import { useOptimistic } from "react";
import { toggleFollow } from "./actions";

type User = {
  id: string;
  name: string;
  isFollowing: boolean;
  followerCount: number;
};

export function UserCard({ user }: { user: User }) {
  const [optimisticUser, updateOptimisticUser] = useOptimistic(
    user,
    (state) => ({
      ...state,
      isFollowing: !state.isFollowing,
      followerCount: state.isFollowing
        ? state.followerCount - 1
        : state.followerCount + 1,
    })
  );

  async function handleFollow() {
    updateOptimisticUser(null);
    await toggleFollow(user.id);
  }

  return (
    <div>
      <h3>{optimisticUser.name}</h3>
      <p>{optimisticUser.followerCount} 关注者</p>
      <button onClick={handleFollow}>
        {optimisticUser.isFollowing ? "取消关注" : "关注"}
      </button>
    </div>
  );
}
```

### 4.5 投票功能

```tsx
"use client";

import { useOptimistic } from "react";
import { vote } from "./actions";

type Poll = {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  userVote: string | null;
};

export function PollWidget({ poll }: { poll: Poll }) {
  const [optimisticPoll, updateOptimisticPoll] = useOptimistic(
    poll,
    (state, optionId: string) => ({
      ...state,
      options: state.options.map((option) => ({
        ...option,
        votes:
          option.id === optionId
            ? option.votes + 1
            : option.id === state.userVote
            ? option.votes - 1
            : option.votes,
      })),
      userVote: optionId,
    })
  );

  async function handleVote(optionId: string) {
    updateOptimisticPoll(optionId);
    await vote(poll.id, optionId);
  }

  const totalVotes = optimisticPoll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  return (
    <div>
      <h3>{optimisticPoll.question}</h3>
      {optimisticPoll.options.map((option) => {
        const percentage =
          totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

        return (
          <div key={option.id}>
            <button
              onClick={() => handleVote(option.id)}
              disabled={optimisticPoll.userVote === option.id}
            >
              {option.text}
            </button>
            <div>
              <div style={{ width: `${percentage}%` }} />
              <span>
                {option.votes} 票 ({percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        );
      })}
      <p>总投票数: {totalVotes}</p>
    </div>
  );
}
```

---

## 5. 适用场景

### 5.1 社交互动

**需求**: 点赞、关注、评论等社交功能

**优势**:

- 即时反馈
- 提升用户体验
- 减少等待时间
- 自然的交互流程

### 5.2 列表操作

**需求**: 添加、删除、更新列表项

**优势**:

- 立即显示变化
- 无需等待服务器
- 流畅的用户体验
- 自动回滚错误

### 5.3 表单提交

**需求**: 快速提交表单数据

**优势**:

- 即时 UI 更新
- 减少感知延迟
- 提升响应速度
- 更好的用户体验

### 5.4 购物车

**需求**: 添加、删除、更新商品

**优势**:

- 即时更新数量
- 实时计算总价
- 流畅的购物体验
- 减少等待时间

### 5.5 投票系统

**需求**: 实时投票反馈

**优势**:

- 即时显示结果
- 动态更新百分比
- 流畅的投票体验
- 自动处理重复投票

---

## 6. 注意事项

### 6.1 只能在客户端组件中使用

```tsx
// ✓ 正确
"use client";

import { useOptimistic } from "react";

export function MyComponent() {
  const [optimisticState, updateOptimisticState] = useOptimistic(/* ... */);
  // ...
}
```

### 6.2 需要配合 Server Actions

useOptimistic 设计用于与 Server Actions 配合:

```tsx
"use client";

import { useOptimistic } from "react";
import { myAction } from "./actions"; // Server Action

export function MyComponent({ data }: { data: Data[] }) {
  const [optimisticData, updateOptimisticData] = useOptimistic(
    data,
    (state, newItem) => [...state, newItem]
  );

  async function handleSubmit(formData: FormData) {
    // 乐观更新
    updateOptimisticData(newItem);

    // Server Action
    await myAction(formData);
  }

  return <form action={handleSubmit}>...</form>;
}
```

### 6.3 失败时自动回滚

当 Server Action 失败时,useOptimistic 会自动回滚到原始状态:

```tsx
"use client";

import { useOptimistic } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    const newTodo = { id: crypto.randomUUID(), title, completed: false };

    // 乐观更新
    addOptimisticTodo(newTodo);

    try {
      // 如果失败,会自动回滚
      await addTodo(formData);
    } catch (error) {
      // 已经自动回滚,只需显示错误
      console.error("添加失败:", error);
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

### 6.4 避免过度使用

不是所有操作都需要乐观更新:

```tsx
// ✗ 避免:不需要即时反馈的操作
async function handleExport() {
  updateOptimisticState({ exporting: true });
  await exportData();
}

// ✓ 更好:使用loading状态
const [isExporting, setIsExporting] = useState(false);

async function handleExport() {
  setIsExporting(true);
  await exportData();
  setIsExporting(false);
}
```

### 6.5 保持更新函数纯净

更新函数应该是纯函数:

```tsx
// ✗ 错误:有副作用
const [optimisticData, updateOptimisticData] = useOptimistic(
  data,
  (state, newItem) => {
    console.log("Adding item"); // 副作用
    localStorage.setItem("data", JSON.stringify(state)); // 副作用
    return [...state, newItem];
  }
);

// ✓ 正确:纯函数
const [optimisticData, updateOptimisticData] = useOptimistic(
  data,
  (state, newItem) => [...state, newItem]
);
```

### 6.6 处理 ID 生成

使用临时 ID,服务器返回真实 ID:

```tsx
"use client";

import { useOptimistic } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;

    // 使用临时ID
    const tempId = `temp-${Date.now()}`;
    const newTodo = { id: tempId, title, completed: false };

    addOptimisticTodo(newTodo);

    // 服务器返回真实ID
    const result = await addTodo(formData);

    // Next.js会自动用服务器数据替换乐观数据
  }

  return <form action={handleSubmit}>...</form>;
}
```

---

## 7. 常见问题

### 7.1 useOptimistic 不更新 UI?

**问题**: 调用更新函数但 UI 没有变化。

**原因**: 可能没有正确返回新状态。

**解决方案**:

```tsx
// ✗ 错误:没有返回新状态
const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
  todos,
  (state, newTodo) => {
    state.push(newTodo); // 直接修改state
  }
);

// ✓ 正确:返回新状态
const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
  todos,
  (state, newTodo) => [...state, newTodo]
);
```

### 7.2 如何处理错误?

**问题**: Server Action 失败时如何显示错误。

**解决方案**:

```tsx
"use client";

import { useOptimistic } from "react";
import { useState } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const title = formData.get("title") as string;
    const newTodo = { id: crypto.randomUUID(), title, completed: false };

    addOptimisticTodo(newTodo);

    try {
      await addTodo(formData);
    } catch (err) {
      setError("添加失败,请重试");
    }
  }

  return (
    <>
      {error && <p className="error">{error}</p>}
      <form action={handleSubmit}>...</form>
    </>
  );
}
```

### 7.3 如何与 useFormStatus 配合?

**问题**: 同时使用乐观更新和表单状态。

**解决方案**:

```tsx
"use client";

import { useOptimistic } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>添加</button>;
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    addOptimisticTodo({ id: crypto.randomUUID(), title, completed: false });
    await addTodo(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <SubmitButton />
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </form>
  );
}
```

### 7.4 如何处理复杂的状态更新?

**问题**: 需要根据不同操作更新状态。

**解决方案**: 使用 action 对象:

```tsx
"use client";

import { useOptimistic } from "react";

type Action =
  | { type: "add"; todo: Todo }
  | { type: "toggle"; id: string }
  | { type: "delete"; id: string };

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, dispatch] = useOptimistic(
    todos,
    (state, action: Action) => {
      switch (action.type) {
        case "add":
          return [...state, action.todo];
        case "toggle":
          return state.map((todo) =>
            todo.id === action.id
              ? { ...todo, completed: !todo.completed }
              : todo
          );
        case "delete":
          return state.filter((todo) => todo.id !== action.id);
        default:
          return state;
      }
    }
  );

  // 使用dispatch
  async function handleAdd(formData: FormData) {
    const title = formData.get("title") as string;
    dispatch({
      type: "add",
      todo: { id: crypto.randomUUID(), title, completed: false },
    });
    await addTodo(formData);
  }

  async function handleToggle(id: string) {
    dispatch({ type: "toggle", id });
    await toggleTodo(id);
  }

  async function handleDelete(id: string) {
    dispatch({ type: "delete", id });
    await deleteTodo(id);
  }

  return (
    <>
      <form action={handleAdd}>...</form>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            {todo.title}
            <button onClick={() => handleDelete(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

### 7.5 如何测试使用 useOptimistic 的组件?

**问题**: 如何编写测试。

**解决方案**:

```tsx
// __tests__/TodoList.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoList } from "./TodoList";

// Mock Server Action
jest.mock("./actions", () => ({
  addTodo: jest.fn(),
}));

describe("TodoList", () => {
  it("should show optimistic update", async () => {
    const todos = [{ id: "1", title: "Test", completed: false }];

    render(<TodoList todos={todos} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /添加/i });

    fireEvent.change(input, { target: { value: "New Todo" } });
    fireEvent.click(button);

    // 应该立即显示新项目
    expect(screen.getByText("New Todo")).toBeInTheDocument();
  });
});
```

### 7.6 如何显示加载指示器?

**问题**: 乐观更新后如何显示加载状态。

**解决方案**:

```tsx
"use client";

import { useOptimistic } from "react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  isPending?: boolean;
};

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;

    // 标记为pending
    addOptimisticTodo({
      id: crypto.randomUUID(),
      title,
      completed: false,
      isPending: true,
    });

    await addTodo(formData);
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id} className={todo.isPending ? "opacity-50" : ""}>
          {todo.title}
          {todo.isPending && <span>...</span>}
        </li>
      ))}
    </ul>
  );
}
```

### 7.7 如何处理并发更新?

**问题**: 多个操作同时进行。

**解决方案**: useOptimistic 自动处理:

```tsx
"use client";

import { useOptimistic } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, action: { type: string; id?: string; todo?: Todo }) => {
      // 每次更新都基于最新状态
      switch (action.type) {
        case "add":
          return [...state, action.todo!];
        case "delete":
          return state.filter((todo) => todo.id !== action.id);
        default:
          return state;
      }
    }
  );

  // 可以同时调用多次
  async function handleAdd(formData: FormData) {
    updateOptimisticTodos({ type: "add", todo: newTodo });
    await addTodo(formData);
  }

  async function handleDelete(id: string) {
    updateOptimisticTodos({ type: "delete", id });
    await deleteTodo(id);
  }

  return <>...</>;
}
```

### 7.8 如何处理嵌套数据?

**问题**: 更新嵌套对象。

**解决方案**:

```tsx
"use client";

import { useOptimistic } from "react";

type Post = {
  id: string;
  title: string;
  comments: Comment[];
};

export function PostDetail({ post }: { post: Post }) {
  const [optimisticPost, updateOptimisticPost] = useOptimistic(
    post,
    (state, newComment: Comment) => ({
      ...state,
      comments: [...state.comments, newComment],
    })
  );

  async function handleAddComment(formData: FormData) {
    const text = formData.get("text") as string;
    const newComment = { id: crypto.randomUUID(), text, likes: 0 };

    updateOptimisticPost(newComment);
    await addComment(post.id, text);
  }

  return <>...</>;
}
```

### 7.9 如何回滚特定操作?

**问题**: 需要手动回滚某个操作。

**解决方案**: useOptimistic 会在 Server Action 完成后自动同步:

```tsx
"use client";

import { useOptimistic } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    const newTodo = { id: crypto.randomUUID(), title, completed: false };

    addOptimisticTodo(newTodo);

    const result = await addTodo(formData);

    // 如果失败,useOptimistic会自动回滚
    // 如果成功,会使用服务器返回的数据
  }

  return <>...</>;
}
```

### 7.10 如何优化性能?

**问题**: 大量数据时性能问题。

**解决方案**:

```tsx
"use client";

import { useOptimistic, useMemo } from "react";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  // 使用useMemo缓存计算结果
  const completedCount = useMemo(
    () => optimisticTodos.filter((todo) => todo.completed).length,
    [optimisticTodos]
  );

  return (
    <div>
      <p>已完成: {completedCount}</p>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 8. 总结

### 8.1 核心要点

1. **即时反馈**: 无需等待服务器响应
2. **自动回滚**: 失败时自动恢复
3. **类型安全**: 完整的 TypeScript 支持
4. **简单易用**: API 简洁直观
5. **性能优化**: 减少感知延迟

### 8.2 最佳实践

| 实践     | 说明               | 优先级 |
| -------- | ------------------ | ------ |
| 社交互动 | 点赞、关注、评论   | 高     |
| 列表操作 | 添加、删除、更新   | 高     |
| 错误处理 | 显示友好的错误信息 | 高     |
| 加载指示 | 标记 pending 状态  | 中     |
| 性能优化 | 使用 useMemo 缓存  | 中     |

### 8.3 与其他 Hook 对比

| Hook           | 用途        | 使用场景     |
| -------------- | ----------- | ------------ |
| useOptimistic  | 乐观更新    | 即时 UI 反馈 |
| useFormStatus  | 表单状态    | 显示加载状态 |
| useActionState | Action 状态 | 复杂状态管理 |
| useState       | 本地状态    | 简单状态管理 |

### 8.4 下一步

学习完 useOptimistic 后,建议继续学习:

1. **useActionState Hook**: 管理复杂的 Action 状态
2. **useFormStatus Hook**: 显示表单提交状态
3. **Server Actions**: 深入理解服务端操作
4. **错误处理**: 优雅地处理错误
5. **性能优化**: 优化大型应用性能

useOptimistic 是 Next.js 16 中实现乐观更新的重要工具,它与 Server Actions 完美配合,提供了即时的用户反馈。通过正确使用 useOptimistic,你可以构建更流畅、更响应的 Web 应用。

**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 拦截路由 Intercepting Routes 详解

## 1. 概述

拦截路由是 Next.js App Router 提供的一种高级路由模式,允许你在当前布局中加载新路由的内容,同时保持浏览器 URL 的更新。这个特性特别适合实现模态框、图片预览、侧边抽屉等需要保持上下文的 UI 模式。

### 1.1 概念定义

拦截路由的核心思想是"拦截"用户的导航行为。当用户点击链接时,不是完全跳转到新页面,而是在当前页面的上下文中展示新内容,但 URL 会更新为目标路由。这样既保持了良好的用户体验,又确保了 URL 的可分享性和可收藏性。

**关键特性**:

- **软导航拦截**: 通过客户端导航(如点击 Link 组件)访问路由时,会被拦截并在当前布局中渲染
- **硬导航直达**: 直接访问 URL 或刷新页面时,会正常渲染目标页面,不会被拦截
- **URL 同步**: 拦截后的内容会更新浏览器 URL,支持前进/后退和分享
- **上下文保持**: 拦截渲染时,原页面的状态和布局得以保持

### 1.2 核心价值

拦截路由解决了传统模态框实现的几个关键痛点:

**URL 可分享性**:

传统的模态框通常不会改变 URL,这意味着用户无法分享或收藏模态框的内容。拦截路由通过更新 URL,让每个模态框状态都有独立的地址。

**深度链接支持**:

用户可以直接访问模态框对应的 URL,系统会智能判断:如果是软导航,显示模态框;如果是硬导航,显示完整页面。

**SEO 友好**:

每个拦截的路由都有对应的完整页面,搜索引擎可以正常索引这些内容,不会因为使用模态框而损失 SEO 价值。

**用户体验优化**:

在保持当前页面上下文的同时展示新内容,避免了完整页面跳转带来的视觉中断,提供更流畅的交互体验。

### 1.3 与传统模态框的区别

| 特性       | 传统模态框   | 拦截路由            |
| :--------- | :----------- | :------------------ |
| URL 更新   | 不更新       | 更新为目标路由      |
| 可分享性   | 不可分享     | 完全可分享          |
| 深度链接   | 不支持       | 完全支持            |
| SEO        | 内容不可索引 | 完全可索引          |
| 浏览器历史 | 不记录       | 正常记录            |
| 刷新行为   | 模态框消失   | 显示完整页面        |
| 实现复杂度 | 简单         | 中等                |
| 适用场景   | 简单弹窗     | 需要 URL 的复杂交互 |

---

## 2. 核心概念与原理

### 2.1 拦截约定

拦截路由使用特殊的文件夹命名约定来定义拦截规则。这些约定使用括号和点号来表示拦截的目标层级:

**拦截符号说明**:

| 符号       | 含义           | 示例            | 拦截目标                       |
| :--------- | :------------- | :-------------- | :----------------------------- |
| `(.)`      | 拦截同级路由   | `(..)photo`     | 同一层级的 photo 路由          |
| `(..)`     | 拦截上一级路由 | `(..)photo`     | 父级的 photo 路由              |
| `(..)(..)` | 拦截上两级路由 | `(..)(..)photo` | 祖父级的 photo 路由            |
| `(...)`    | 拦截根路由     | `(...)photo`    | 从 app 根目录开始的 photo 路由 |

**注意**: 这里的"层级"指的是路由段(route segments),而不是文件系统的文件夹层级。路由组 `(folder)` 不算作路由段。

### 2.2 工作机制

拦截路由的工作流程如下:

**软导航场景**(客户端导航):

1. 用户在页面 A 点击链接,目标是页面 B
2. Next.js 检测到存在拦截路由配置
3. 在当前布局中渲染拦截路由的内容
4. 更新浏览器 URL 为页面 B 的地址
5. 用户看到的是模态框或其他拦截 UI,但 URL 已更新

**硬导航场景**(直接访问或刷新):

1. 用户直接访问页面 B 的 URL 或刷新页面
2. Next.js 检测到这是硬导航
3. 渲染页面 B 的完整内容,不触发拦截
4. 用户看到的是完整的页面 B

**导航类型判断**:

Next.js 通过以下方式判断导航类型:

- 使用 `<Link>` 组件或 `router.push()` → 软导航
- 直接在地址栏输入 URL → 硬导航
- 刷新页面 → 硬导航
- 浏览器前进/后退 → 软导航(如果之前是软导航)

### 2.3 与并行路由的配合

拦截路由通常与并行路由配合使用,实现模态框等高级 UI 模式。典型的结构如下:

```
app/
├── layout.tsx
├── page.tsx
├── @modal/
│   ├── default.tsx
│   └── (..)photo/
│       └── [id]/
│           └── page.tsx    # 拦截路由(模态框)
└── photo/
    └── [id]/
        └── page.tsx        # 完整页面
```

在这个结构中:

- `@modal` 是并行路由插槽,用于渲染模态框
- `(..)photo` 是拦截路由,拦截 `photo/[id]` 的访问
- 软导航时,内容在 `@modal` 插槽中渲染
- 硬导航时,渲染 `photo/[id]/page.tsx` 的完整页面

### 2.4 路由匹配优先级

当存在拦截路由时,Next.js 的路由匹配遵循以下优先级:

1. **精确匹配**: 如果存在精确匹配的路由,优先使用
2. **拦截路由**: 在软导航时,检查是否有拦截配置
3. **默认路由**: 如果都不匹配,使用 default.tsx

**示例**:

```
app/
├── @modal/
│   ├── default.tsx
│   ├── (..)photo/
│   │   └── [id]/
│   │       └── page.tsx    # 优先级 2(软导航)
│   └── photo/
│       └── [id]/
│           └── page.tsx    # 优先级 1(精确匹配)
└── photo/
    └── [id]/
        └── page.tsx        # 优先级 3(硬导航)
```

访问 `/photo/123` 时:

- 软导航: 渲染 `@modal/(..)photo/[id]/page.tsx`
- 硬导航: 渲染 `photo/[id]/page.tsx`

---

## 3. 适用场景

### 3.1 典型应用案例

**图片画廊与预览**:

这是拦截路由最经典的应用场景。用户在画廊页面点击图片时,在模态框中预览大图,但 URL 更新为图片的详情页地址。如果用户分享这个 URL,接收者会直接看到图片详情页。

```
app/
├── gallery/
│   ├── layout.tsx
│   ├── page.tsx           # 画廊列表
│   ├── @modal/
│   │   ├── default.tsx
│   │   └── (..)photo/
│   │       └── [id]/
│   │           └── page.tsx  # 模态框预览
│   └── photo/
│       └── [id]/
│           └── page.tsx      # 完整详情页
```

**电商产品快速查看**:

在产品列表页,用户点击"快速查看"按钮时,在模态框中显示产品详情,但 URL 更新为产品详情页。用户可以分享这个链接,接收者会看到完整的产品详情页。

**社交媒体帖子详情**:

类似 Twitter/X 的交互模式,在时间线点击帖子时,在模态框中展开详情,但 URL 更新。用户可以分享帖子链接,接收者会看到完整的帖子页面。

**表单和编辑界面**:

在列表页点击"编辑"时,在侧边抽屉中打开编辑表单,但 URL 更新为编辑页面的地址。这样用户可以刷新页面继续编辑,或者分享编辑链接给其他人。

**多步骤流程**:

在向导式流程中,每一步都有独立的 URL,但在同一个布局中切换。用户可以直接跳转到某一步,或者分享当前步骤的链接。

### 3.2 场景限制

**不适合简单弹窗**:

如果你只需要一个简单的确认对话框或提示信息,使用传统的模态框组件会更简单。拦截路由适合需要 URL 支持的复杂交互。

**移动端体验需要特殊处理**:

在移动端,模态框可能不是最佳的交互方式。你可能需要根据设备类型来决定是否使用拦截路由:

```tsx
// app/layout.tsx
import { headers } from "next/headers";

export default async function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  return (
    <div>
      {children}
      {!isMobile && modal}
    </div>
  );
}
```

**状态管理复杂度**:

如果模态框中的内容需要与主页面频繁交互和同步状态,拦截路由可能会增加状态管理的复杂度。这种情况下,使用传统的组件状态管理可能更合适。

**浏览器兼容性**:

拦截路由依赖现代浏览器的 History API 和客户端路由。在不支持这些特性的旧浏览器中,会降级为普通的页面跳转。

### 3.3 性能考量

**代码分割优化**:

拦截路由和目标路由是两个独立的组件,Next.js 会为它们生成独立的代码块。这意味着:

- 首次加载时,只加载当前页面的代码
- 点击链接时,才加载模态框的代码
- 直接访问 URL 时,只加载完整页面的代码

**预加载策略**:

可以使用 `<Link prefetch>` 来预加载拦截路由的内容:

```tsx
<Link href="/photo/123" prefetch={true}>
  查看图片
</Link>
```

**内存占用**:

当模态框打开时,主页面和模态框的组件树都在内存中。如果模态框内容很重,可能会增加内存占用。可以通过以下方式优化:

- 使用虚拟滚动处理大列表
- 延迟加载模态框中的非关键内容
- 关闭模态框时清理不必要的状态

---

## 4. API 签名与配置

### 4.1 文件系统约定

**基本结构**:

```
app/
├── layout.tsx              # 根布局
├── page.tsx                # 主页面
├── @modal/                 # 并行路由插槽
│   ├── default.tsx         # 默认内容(通常返回 null)
│   └── (..)target/         # 拦截路由
│       └── page.tsx        # 拦截时渲染的内容
└── target/                 # 目标路由
    └── page.tsx            # 直接访问时渲染的内容
```

**拦截符号详解**:

**`(.)` - 拦截同级路由**:

```
app/
├── feed/
│   ├── page.tsx
│   ├── @modal/
│   │   └── (.)photo/       # 拦截 /feed/photo
│   │       └── page.tsx
│   └── photo/
│       └── page.tsx
```

访问 `/feed/photo` 时:

- 软导航: 在 `@modal` 插槽中渲染 `(.)photo/page.tsx`
- 硬导航: 渲染 `photo/page.tsx`

**`(..)` - 拦截上一级路由**:

```
app/
├── photo/
│   └── [id]/
│       └── page.tsx        # /photo/123
└── feed/
    ├── page.tsx            # /feed
    └── @modal/
        └── (..)photo/      # 拦截 /photo/[id]
            └── [id]/
                └── page.tsx
```

在 `/feed` 页面访问 `/photo/123` 时:

- 软导航: 在 `@modal` 插槽中渲染拦截路由
- 硬导航: 渲染 `photo/[id]/page.tsx`

**`(..)(..)` - 拦截上两级路由**:

```
app/
├── photo/
│   └── [id]/
│       └── page.tsx        # /photo/123
└── dashboard/
    └── feed/
        ├── page.tsx        # /dashboard/feed
        └── @modal/
            └── (..)(..)photo/  # 拦截 /photo/[id]
                └── [id]/
                    └── page.tsx
```

**`(...)` - 拦截根路由**:

```
app/
├── photo/
│   └── [id]/
│       └── page.tsx        # /photo/123
└── dashboard/
    └── feed/
        └── settings/
            ├── page.tsx    # /dashboard/feed/settings
            └── @modal/
                └── (...)photo/  # 拦截 /photo/[id]
                    └── [id]/
                        └── page.tsx
```

使用 `(...)` 可以从任意深度的路由拦截根级别的路由,不需要计算层级。

### 4.2 布局组件配置

**根布局接收模态框插槽**:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

**模态框默认内容**:

```tsx
// app/@modal/default.tsx
export default function Default() {
  // 当没有拦截路由激活时,返回 null
  return null;
}
```

### 4.3 拦截路由组件

**模态框组件示例**:

```tsx
// app/@modal/(..)photo/[id]/page.tsx
import { Modal } from "@/components/modal";
import { getPhoto } from "@/lib/data";

interface PhotoModalProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoModal({ params }: PhotoModalProps) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} className="w-full h-auto" />
      <h2 className="text-2xl font-bold mt-4">{photo.title}</h2>
      <p className="text-gray-600 mt-2">{photo.description}</p>
    </Modal>
  );
}
```

**完整页面组件示例**:

```tsx
// app/photo/[id]/page.tsx
import { getPhoto } from "@/lib/data";

interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <img
        src={photo.url}
        alt={photo.title}
        className="w-full max-w-4xl mx-auto"
      />
      <h1 className="text-4xl font-bold mt-8">{photo.title}</h1>
      <p className="text-lg text-gray-700 mt-4">{photo.description}</p>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">详细信息</h2>
        <dl className="mt-4 space-y-2">
          <div>
            <dt className="font-medium">拍摄时间:</dt>
            <dd>{photo.date}</dd>
          </div>
          <div>
            <dt className="font-medium">拍摄地点:</dt>
            <dd>{photo.location}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
```

---

## 5. 基础与进阶使用

### 5.1 基础用法

**最简单的拦截路由示例**:

创建一个图片画廊,点击图片在模态框中预览:

```
app/
├── layout.tsx
├── page.tsx
├── @modal/
│   ├── default.tsx
│   └── (..)photo/
│       └── [id]/
│           └── page.tsx
└── photo/
    └── [id]/
        └── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import Link from "next/link";

const photos = [
  { id: "1", title: "照片 1", thumbnail: "/images/1-thumb.jpg" },
  { id: "2", title: "照片 2", thumbnail: "/images/2-thumb.jpg" },
  { id: "3", title: "照片 3", thumbnail: "/images/3-thumb.jpg" },
];

export default function Gallery() {
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {photos.map((photo) => (
        <Link key={photo.id} href={`/photo/${photo.id}`}>
          <img src={photo.thumbnail} alt={photo.title} />
        </Link>
      ))}
    </div>
  );
}
```

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

```tsx
// app/@modal/(..)photo/[id]/page.tsx
import { Modal } from "@/components/modal";

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Modal>
      <img src={`/images/${id}.jpg`} alt={`照片 ${id}`} />
    </Modal>
  );
}
```

```tsx
// app/photo/[id]/page.tsx
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-8">
      <img src={`/images/${id}.jpg`} alt={`照片 ${id}`} />
      <h1>照片 {id} 详情页</h1>
    </div>
  );
}
```

**模态框组件实现**:

```tsx
// components/modal.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <div className="modal-content">
        <button onClick={handleClose} className="close-button">
          ✕
        </button>
        {children}
      </div>
    </dialog>
  );
}
```

### 5.2 进阶用法

**多层级拦截**:

在不同层级的页面拦截同一个路由:

```
app/
├── photo/
│   └── [id]/
│       └── page.tsx
├── feed/
│   ├── @modal/
│   │   └── (..)photo/
│   │       └── [id]/
│   │           └── page.tsx
└── dashboard/
    └── @modal/
        └── (...)photo/
            └── [id]/
                └── page.tsx
```

**条件拦截**:

根据用户权限或其他条件决定是否拦截:

```tsx
// app/layout.tsx
import { auth } from "@/lib/auth";

export default async function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();
  const canUseModal = session?.user?.preferences?.useModals ?? true;

  return (
    <html>
      <body>
        {children}
        {canUseModal && modal}
      </body>
    </html>
  );
}
```

**拦截路由与数据获取**:

在拦截路由中获取和缓存数据:

```tsx
// app/@modal/(..)product/[id]/page.tsx
import { getProduct } from "@/lib/data";
import { Modal } from "@/components/modal";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <Modal>
      <div className="product-quick-view">
        <img src={product.image} alt={product.name} />
        <h2>{product.name}</h2>
        <p className="price">${product.price}</p>
        <p>{product.description}</p>
        <button>加入购物车</button>
      </div>
    </Modal>
  );
}
```

**拦截路由与表单处理**:

在模态框中处理表单提交:

```tsx
// app/@modal/(..)edit/[id]/page.tsx
"use client";

import { Modal } from "@/components/modal";
import { updateItem } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function EditModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const { id } = await params;
    await updateItem(id, formData);
    router.back();
  }

  return (
    <Modal>
      <form action={handleSubmit}>
        <input name="title" placeholder="标题" />
        <textarea name="content" placeholder="内容" />
        <button type="submit">保存</button>
      </form>
    </Modal>
  );
}
```

---

## 6. 注意事项

### 6.1 路由组的影响

路由组 `(folder)` 不会影响拦截路由的层级计算:

```
app/
├── (marketing)/
│   └── blog/
│       └── [slug]/
│           └── page.tsx
└── (shop)/
    └── @modal/
        └── (..)blog/        # 正确:拦截 /blog/[slug]
            └── [slug]/
                └── page.tsx
```

即使 `blog` 在路由组 `(marketing)` 中,拦截时仍然使用 `(..)blog` 而不是 `(..)(marketing)/blog`。

### 6.2 动态路由参数传递

拦截路由和目标路由必须有相同的动态参数结构:

```tsx
// ✅ 正确:参数结构一致
// app/@modal/(..)post/[id]/page.tsx
// app/post/[id]/page.tsx

// ❌ 错误:参数结构不一致
// app/@modal/(..)post/[slug]/page.tsx
// app/post/[id]/page.tsx
```

### 6.3 模态框关闭处理

**使用 router.back()**:

```tsx
"use client";

import { useRouter } from "next/navigation";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return <div onClick={() => router.back()}>{children}</div>;
}
```

**注意事项**:

- `router.back()` 会返回到上一个历史记录
- 如果用户直接访问模态框 URL,`router.back()` 可能会离开你的网站
- 建议提供一个明确的关闭按钮,而不仅仅依赖背景点击

**更安全的关闭方式**:

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClose = () => {
    // 检查是否有历史记录
    if (window.history.length > 1) {
      router.back();
    } else {
      // 没有历史记录,导航到首页
      router.push("/");
    }
  };

  return <div onClick={handleClose}>{children}</div>;
}
```

### 6.4 SEO 优化

**为拦截路由和目标路由设置不同的元数据**:

```tsx
// app/@modal/(..)photo/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return {
    title: `${photo.title} - 快速预览`,
    description: photo.description,
  };
}
```

```tsx
// app/photo/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return {
    title: `${photo.title} - 完整详情`,
    description: photo.description,
    openGraph: {
      images: [photo.url],
    },
  };
}
```

### 6.5 性能优化

**延迟加载模态框内容**:

```tsx
// app/@modal/(..)photo/[id]/page.tsx
import dynamic from "next/dynamic";

const PhotoViewer = dynamic(() => import("@/components/photo-viewer"), {
  loading: () => <div>加载中...</div>,
});

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Modal>
      <PhotoViewer id={id} />
    </Modal>
  );
}
```

---

## 7. 常见问题

### 7.1 为什么刷新页面后模态框消失了?

这是拦截路由的设计行为。刷新页面属于硬导航,会渲染目标路由的完整页面而不是拦截路由。

### 7.2 如何在模态框中使用 Server Actions?

可以直接在拦截路由组件中使用 Server Actions:

```tsx
// app/@modal/(..)edit/[id]/page.tsx
import { updateData } from "@/app/actions";

export default async function EditModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Modal>
      <form action={updateData}>
        <input type="hidden" name="id" value={id} />
        <input name="title" />
        <button type="submit">保存</button>
      </form>
    </Modal>
  );
}
```

### 7.3 拦截路由可以嵌套吗?

可以,但要注意层级关系的正确性:

```
app/
├── @modal/
│   └── (..)category/
│       └── [id]/
│           └── @productModal/
│               └── (..)product/
│                   └── [productId]/
│                       └── page.tsx
```

### 7.4 如何处理多个并行路由的拦截?

可以在不同的并行路由槽中定义拦截路由:

```tsx
// app/@modal/(..)photo/[id]/page.tsx
export default function PhotoModal({ params }) {
  return (
    <Modal>
      <PhotoView id={params.id} />
    </Modal>
  );
}

// app/@drawer/(..)settings/page.tsx
export default function SettingsDrawer() {
  return (
    <Drawer>
      <SettingsPanel />
    </Drawer>
  );
}

// app/layout.tsx
export default function Layout({ children, modal, drawer }) {
  return (
    <div>
      {children}
      {modal}
      {drawer}
    </div>
  );
}
```

### 7.5 拦截路由的性能影响如何?

拦截路由对性能的影响很小,甚至可能提升性能:

| 方面       | 传统模态框 | 拦截路由   | 说明                       |
| :--------- | :--------- | :--------- | :------------------------- |
| 首次加载   | 快         | 快         | 都是客户端渲染             |
| SEO        | 差         | 好         | 拦截路由有独立 URL         |
| 代码分割   | 手动       | 自动       | Next.js 自动处理           |
| 状态管理   | 复杂       | 简单       | 利用路由状态               |
| 浏览器历史 | 需要手动   | 自动       | 自动集成浏览器历史         |
| 刷新行为   | 状态丢失   | 显示完整页 | 拦截路由有完整页面作为后备 |

### 7.6 如何调试拦截路由?

**方法 1: 查看路由匹配**:

```tsx
// app/@modal/(..)photo/[id]/page.tsx
export default function PhotoModal({ params }) {
  console.log("拦截路由被触发:", params);
  return <Modal>...</Modal>;
}

// app/photo/[id]/page.tsx
export default function PhotoPage({ params }) {
  console.log("目标路由被触发:", params);
  return <div>...</div>;
}
```

**方法 2: 使用 React DevTools**:

检查组件树,确认哪个路由被渲染。

**方法 3: 检查 URL 和导航方式**:

- 客户端导航 → 拦截路由
- 刷新/直接访问 → 目标路由

### 7.7 拦截路由与中间件的关系?

拦截路由在客户端工作,中间件在服务端工作,两者可以配合使用:

```tsx
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl;

  // 在服务端重定向或修改请求
  if (url.pathname.startsWith("/photo/")) {
    // 可以添加认证、日志等
    console.log("访问照片:", url.pathname);
  }

  return NextResponse.next();
}
```

拦截路由的匹配发生在中间件之后,在客户端路由层面。

### 7.8 如何处理拦截路由的错误?

使用 error.tsx 处理拦截路由中的错误:

```tsx
// app/@modal/(..)photo/[id]/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Modal>
      <div className="error">
        <h2>加载失败</h2>
        <p>{error.message}</p>
        <button onClick={reset}>重试</button>
      </div>
    </Modal>
  );
}
```

### 7.9 拦截路由支持哪些 Next.js 特性?

拦截路由支持大部分 Next.js 特性:

| 特性                 | 支持 | 说明                          |
| :------------------- | :--- | :---------------------------- |
| Server Components    | ✅   | 默认支持                      |
| Client Components    | ✅   | 使用 'use client'             |
| Server Actions       | ✅   | 可以在表单中使用              |
| generateMetadata     | ✅   | 可以设置独立的元数据          |
| generateStaticParams | ✅   | 可以预生成静态路由            |
| loading.tsx          | ✅   | 支持加载状态                  |
| error.tsx            | ✅   | 支持错误处理                  |
| not-found.tsx        | ✅   | 支持 404 页面                 |
| Middleware           | ⚠️   | 中间件在拦截路由之前执行      |
| Route Handlers       | ❌   | 拦截路由只用于页面,不用于 API |

### 7.10 如何测试拦截路由?

**单元测试**:

```tsx
import { render, screen } from "@testing-library/react";
import PhotoModal from "@/app/@modal/(..)photo/[id]/page";

test("renders photo modal", async () => {
  const params = Promise.resolve({ id: "123" });
  render(<PhotoModal params={params} />);

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
```

**E2E 测试**:

```tsx
// tests/e2e/intercepting-routes.spec.ts
import { test, expect } from "@playwright/test";

test("photo modal opens on click", async ({ page }) => {
  await page.goto("/gallery");

  // 点击照片
  await page.click('[data-photo-id="1"]');

  // 检查模态框是否打开
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // 检查 URL 是否改变
  expect(page.url()).toContain("/photo/1");

  // 刷新页面
  await page.reload();

  // 检查是否显示完整页面
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  await expect(page.locator("main")).toBeVisible();
});
```

---

## 8. 总结

拦截路由是 Next.js App Router 的强大特性,它完美结合了模态框的用户体验和独立页面的 SEO 优势。

**核心要点**:

1. **双重渲染**: 客户端导航显示拦截路由,刷新显示目标路由
2. **层级匹配**: 使用 (.), (..), (...), (...)(...) 匹配不同层级
3. **并行路由**: 必须配合并行路由槽使用
4. **URL 共享**: 拦截路由和目标路由共享相同的 URL
5. **SEO 友好**: 目标路由提供完整的 SEO 支持

**最佳实践**:

- 为模态框和完整页面提供一致的内容
- 使用 router.back() 关闭模态框,但要处理边界情况
- 为拦截路由和目标路由设置适当的元数据
- 使用动态导入优化模态框性能
- 提供清晰的关闭按钮,不仅依赖背景点击
- 处理错误和加载状态

**适用场景**:

- 图片/视频预览
- 登录/注册表单
- 快速编辑
- 产品快速查看
- 评论/回复
- 分享对话框

掌握拦截路由,可以构建更现代、更友好的 Web 应用。

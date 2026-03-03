**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 并行路由 Parallel Routes 详解

## 1. 概述

并行路由是 Next.js App Router 提供的一种高级路由模式,允许在同一个布局中同时渲染多个页面或组件。这种模式特别适合构建复杂的用户界面,比如仪表板、社交媒体应用或者需要同时展示多个独立内容区域的场景。

### 1.1 概念定义

并行路由通过命名插槽(Named Slots)的方式,让你能够在同一个路由层级下定义多个独立的子路由。每个插槽都可以有自己的加载状态、错误处理和内容,它们彼此独立但又能在同一个父布局中协同工作。

在文件系统中,并行路由使用 `@folder` 命名约定来定义插槽。例如:

```
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
└── @user/
    └── page.tsx
```

在这个结构中,`@analytics`、`@team` 和 `@user` 都是并行路由插槽,它们可以在父级 `layout.tsx` 中同时渲染。

### 1.2 核心价值

并行路由解决了传统路由系统中的几个关键痛点:

**独立加载状态**: 每个插槽可以有自己的 `loading.tsx`,实现细粒度的加载体验。当某个区域的数据还在加载时,其他区域可以正常显示,避免了整个页面的阻塞。

**独立错误处理**: 每个插槽可以有自己的 `error.tsx`,当某个区域出错时,不会影响其他区域的正常显示。这大大提升了应用的健壮性。

**条件渲染**: 可以根据路由状态、用户权限或其他条件来决定是否渲染某个插槽,实现灵活的界面组合。

**URL 独立性**: 每个插槽可以有自己的子路由,但它们共享同一个 URL。这意味着你可以在不改变 URL 的情况下,在不同插槽中导航到不同的内容。

### 1.3 与传统路由的区别

传统的嵌套路由是线性的,一个路由只能渲染一个页面组件。而并行路由是并行的,一个路由可以同时渲染多个独立的页面组件。

| 特性     | 传统嵌套路由 | 并行路由               |
| :------- | :----------- | :--------------------- |
| 渲染方式 | 单一组件树   | 多个独立组件树         |
| 加载状态 | 全局共享     | 每个插槽独立           |
| 错误处理 | 全局边界     | 每个插槽独立           |
| URL 结构 | 反映嵌套层级 | 插槽对 URL 不可见      |
| 导航控制 | 统一控制     | 每个插槽独立导航       |
| 适用场景 | 简单页面结构 | 复杂仪表板、多面板界面 |

---

## 2. 核心概念与原理

### 2.1 插槽(Slots)机制

插槽是并行路由的核心概念。在 Next.js 中,插槽通过 `@` 前缀的文件夹来定义。这些文件夹不会出现在 URL 中,它们只是用来组织代码和定义并行渲染的区域。

**插槽的命名规则**:

- 必须以 `@` 开头
- 后面跟着插槽的名称,使用小写字母和连字符
- 插槽名称应该具有语义化,能够清晰表达其用途

**插槽的作用域**:

插槽是相对于定义它们的布局而言的。一个布局可以访问其直接子级的所有插槽,但不能访问更深层级的插槽。

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
  analytics, // 对应 @analytics 插槽
  team, // 对应 @team 插槽
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div className="main-content">{children}</div>
        <aside className="analytics-panel">{analytics}</aside>
        <aside className="team-panel">{team}</aside>
      </body>
    </html>
  );
}
```

### 2.2 默认插槽(default.tsx)

当并行路由的某个插槽在当前路由下没有匹配的页面时,Next.js 会尝试渲染该插槽的 `default.tsx` 文件。如果 `default.tsx` 也不存在,则会渲染 404 页面。

这个机制在以下场景特别重要:

**软导航场景**: 当用户在客户端导航到一个新路由时,Next.js 会保持所有插槽的活动状态。但如果某个插槽在新路由下没有对应的页面,就需要 `default.tsx` 来填充。

**硬导航场景**: 当用户刷新页面或直接访问 URL 时,Next.js 无法确定未匹配插槽的状态,此时会渲染 `default.tsx`。

```tsx
// app/@analytics/default.tsx
export default function DefaultAnalytics() {
  return <div>默认分析面板</div>;
}
```

### 2.3 工作机制

并行路由的渲染流程如下:

1. **路由匹配**: Next.js 首先匹配当前 URL 对应的主路由(children)
2. **插槽解析**: 然后解析所有定义的插槽,查找每个插槽下是否有匹配当前路由的页面
3. **内容渲染**: 将匹配到的内容传递给父布局的对应 props
4. **默认回退**: 如果某个插槽没有匹配的内容,则使用 `default.tsx` 或渲染 null

**渲染优先级**:

1. 精确匹配的页面
2. default.tsx
3. null(如果都不存在)

### 2.4 状态保持机制

并行路由有一个重要特性:在客户端导航时,Next.js 会尽可能保持插槽的状态。

**软导航时的状态保持**:

当用户通过 `<Link>` 或 `router.push()` 进行客户端导航时,Next.js 会:

- 只更新 URL 变化影响到的插槽
- 保持其他插槽的当前状态和内容
- 维持插槽内部的 React 状态

这意味着如果用户在 `@team` 插槽中滚动到某个位置,然后导航到另一个路由,只要新路由下 `@team` 插槽的内容没有变化,滚动位置就会被保持。

**硬导航时的状态重置**:

当用户刷新页面或直接访问 URL 时,所有插槽都会重新渲染,状态会被重置。

---

## 3. 适用场景

### 3.1 典型应用案例

**仪表板应用**:

并行路由最经典的应用场景就是仪表板。一个典型的仪表板可能包含:

- 主内容区域:显示当前选中的数据详情
- 侧边栏:显示导航菜单或快捷操作
- 顶部通知栏:显示系统通知或警告
- 底部状态栏:显示实时统计数据

使用并行路由,每个区域都可以独立加载和更新,互不干扰。

```
app/dashboard/
├── layout.tsx
├── page.tsx
├── @sidebar/
│   ├── page.tsx
│   └── loading.tsx
├── @notifications/
│   ├── page.tsx
│   └── error.tsx
└── @stats/
    └── page.tsx
```

**社交媒体应用**:

在社交媒体应用中,你可能需要同时显示:

- 主时间线:用户的动态流
- 推荐用户:侧边栏的用户推荐
- 趋势话题:当前热门话题
- 在线好友:实时在线状态

每个区域都有自己的数据源和更新频率,使用并行路由可以让它们独立工作。

**电商平台**:

电商平台的商品详情页可以使用并行路由来组织:

- 商品详情:主要的商品信息
- 相关推荐:基于算法的商品推荐
- 用户评价:商品评价列表
- 购买记录:实时购买动态

### 3.2 场景限制

并行路由虽然强大,但并不适合所有场景:

**简单页面不适用**:

如果你的页面结构很简单,只有一个主内容区域,使用并行路由会增加不必要的复杂度。这种情况下,传统的组件组合就足够了。

**SEO 敏感页面需谨慎**:

并行路由的内容不会反映在 URL 中,这可能对 SEO 产生影响。如果你的应用需要每个内容区域都有独立的 URL 以便搜索引擎索引,那么应该使用传统的嵌套路由。

**移动端适配复杂**:

在移动端,屏幕空间有限,通常无法同时显示多个并行区域。如果你的应用需要良好的移动端体验,需要额外考虑响应式设计和条件渲染。

**状态同步需求高的场景**:

如果多个插槽之间需要频繁的状态同步和数据共享,使用并行路由可能会增加状态管理的复杂度。这种情况下,使用全局状态管理方案可能更合适。

### 3.3 性能考量

**并发渲染的优势**:

并行路由可以利用 React 18 的并发特性,多个插槽可以并发渲染,提升整体性能。

**数据获取的优化**:

每个插槽可以独立进行数据获取,不会相互阻塞。这意味着快速的数据可以先显示,慢速的数据可以后续加载。

**潜在的性能开销**:

- 每个插槽都是独立的组件树,会增加内存占用
- 多个插槽同时进行数据获取,可能增加服务器负载
- 需要合理使用 loading 和 Suspense 来优化用户体验

---

## 4. API 签名与配置

### 4.1 文件系统约定

**插槽定义**:

```
app/
├── layout.tsx          # 父布局,接收所有插槽作为 props
├── page.tsx            # 主页面内容(children prop)
├── @slot1/             # 插槽 1
│   ├── page.tsx        # 插槽 1 的页面
│   ├── loading.tsx     # 插槽 1 的加载状态
│   ├── error.tsx       # 插槽 1 的错误边界
│   └── default.tsx     # 插槽 1 的默认内容
└── @slot2/             # 插槽 2
    └── page.tsx
```

**布局组件签名**:

```tsx
// app/layout.tsx
interface LayoutProps {
  children: React.ReactNode; // 主页面内容
  slot1: React.ReactNode; // @slot1 插槽
  slot2: React.ReactNode; // @slot2 插槽
  params: Promise<{ [key: string]: string }>; // 路由参数
  searchParams: Promise<{ [key: string]: string | string[] }>; // 查询参数
}

export default async function Layout({
  children,
  slot1,
  slot2,
  params,
  searchParams,
}: LayoutProps) {
  // 布局实现
}
```

### 4.2 插槽路由配置

**子路由定义**:

每个插槽都可以有自己的子路由结构:

```
app/
├── layout.tsx
├── @dashboard/
│   ├── page.tsx              # /
│   ├── analytics/
│   │   └── page.tsx          # /analytics (仅在 @dashboard 插槽中)
│   └── reports/
│       └── page.tsx          # /reports (仅在 @dashboard 插槽中)
└── @sidebar/
    └── page.tsx
```

在这个例子中,当用户访问 `/analytics` 时:

- `@dashboard` 插槽会渲染 `analytics/page.tsx`
- `@sidebar` 插槽会渲染 `page.tsx` 或 `default.tsx`
- 主内容区域(children)会渲染根 `page.tsx` 或 `default.tsx`

**动态路由支持**:

插槽内部也支持动态路由:

```
app/
├── layout.tsx
└── @modal/
    ├── default.tsx
    └── photo/
        └── [id]/
            └── page.tsx      # /photo/123
```

### 4.3 条件渲染配置

**基于路由的条件渲染**:

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ showModal?: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <div>
      {children}
      {resolvedParams.showModal === "true" && modal}
    </div>
  );
}
```

**基于用户权限的条件渲染**:

```tsx
// app/dashboard/layout.tsx
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
  admin,
  user,
}: {
  children: React.ReactNode;
  admin: React.ReactNode;
  user: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      {children}
      {session?.user?.role === "admin" ? admin : user}
    </div>
  );
}
```

---

## 5. 基础与进阶使用

### 5.1 基础用法

**最简单的并行路由示例**:

让我们从一个最简单的例子开始,创建一个包含主内容和侧边栏的布局。

```
app/
├── layout.tsx
├── page.tsx
└── @sidebar/
    └── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex">
      <main className="flex-1">{children}</main>
      <aside className="w-64 bg-gray-100">{sidebar}</aside>
    </div>
  );
}
```

```tsx
// app/page.tsx
export default function Page() {
  return <h1>主内容区域</h1>;
}
```

```tsx
// app/@sidebar/page.tsx
export default function SidebarPage() {
  return (
    <div>
      <h2>侧边栏</h2>
      <nav>
        <ul>
          <li>导航项 1</li>
          <li>导航项 2</li>
        </ul>
      </nav>
    </div>
  );
}
```

**添加加载状态**:

为每个插槽添加独立的加载状态:

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>主内容加载中...</div>;
}
```

```tsx
// app/@sidebar/loading.tsx
export default function SidebarLoading() {
  return <div>侧边栏加载中...</div>;
}
```

**添加错误处理**:

```tsx
// app/@sidebar/error.tsx
"use client";

export default function SidebarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>侧边栏加载失败</h2>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

### 5.2 进阶用法

**多层级并行路由**:

并行路由可以嵌套使用,创建更复杂的布局结构:

```
app/
├── layout.tsx
├── @header/
│   └── page.tsx
├── @content/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── @main/
│   │   └── page.tsx
│   └── @sidebar/
│       └── page.tsx
└── @footer/
    └── page.tsx
```

```tsx
// app/layout.tsx
export default function RootLayout({
  header,
  content,
  footer,
}: {
  header: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <header>{header}</header>
        <div className="content-wrapper">{content}</div>
        <footer>{footer}</footer>
      </body>
    </html>
  );
}
```

```tsx
// app/@content/layout.tsx
export default function ContentLayout({
  children,
  main,
  sidebar,
}: {
  children: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="flex-1">{main}</div>
      <aside className="w-64">{sidebar}</aside>
    </div>
  );
}
```

**动态插槽内容**:

根据路由参数动态渲染不同的插槽内容:

```
app/
├── layout.tsx
├── [category]/
│   ├── page.tsx
│   └── @related/
│       └── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  related,
}: {
  children: React.ReactNode;
  related: React.ReactNode;
}) {
  return (
    <div>
      <main>{children}</main>
      <aside>{related}</aside>
    </div>
  );
}
```

```tsx
// app/[category]/@related/page.tsx
interface RelatedProps {
  params: Promise<{ category: string }>;
}

export default async function RelatedPage({ params }: RelatedProps) {
  const { category } = await params;

  // 根据分类获取相关内容
  const relatedItems = await fetchRelatedItems(category);

  return (
    <div>
      <h2>{category} 相关内容</h2>
      <ul>
        {relatedItems.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**模态框实现**:

并行路由的一个经典应用是实现模态框,同时保持 URL 的可分享性:

```
app/
├── layout.tsx
├── page.tsx
├── @modal/
│   ├── default.tsx
│   └── photo/
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
    <>
      {children}
      {modal}
    </>
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
// app/@modal/photo/[id]/page.tsx
import { Modal } from "@/components/modal";

interface PhotoModalProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoModal({ params }: PhotoModalProps) {
  const { id } = await params;
  const photo = await fetchPhoto(id);

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
      <h2>{photo.title}</h2>
      <p>{photo.description}</p>
    </Modal>
  );
}
```

```tsx
// app/photo/[id]/page.tsx
interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  const photo = await fetchPhoto(id);

  return (
    <div>
      <img src={photo.url} alt={photo.title} />
      <h1>{photo.title}</h1>
      <p>{photo.description}</p>
    </div>
  );
}
```

在这个例子中:

- 从主页点击照片链接,会在模态框中打开(`@modal` 插槽)
- 直接访问 `/photo/123` URL,会显示完整的照片页面
- 模态框关闭后,URL 保持不变,用户可以分享链接

**条件插槽渲染**:

根据不同条件渲染不同的插槽内容:

```tsx
// app/dashboard/layout.tsx
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
  analytics,
  simple,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  simple: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const viewMode = cookieStore.get("viewMode")?.value || "simple";

  return (
    <div>
      {children}
      {viewMode === "analytics" ? analytics : simple}
    </div>
  );
}
```

**插槽间的数据共享**:

虽然插槽是独立的,但它们可以通过共享的数据源来协调:

```tsx
// lib/data-cache.ts
import { cache } from "react";

export const getUserData = cache(async (userId: string) => {
  return await fetchUserData(userId);
});
```

```tsx
// app/@profile/page.tsx
import { getUserData } from "@/lib/data-cache";

export default async function ProfileSlot() {
  const user = await getUserData("current-user");

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

```tsx
// app/@activity/page.tsx
import { getUserData } from "@/lib/data-cache";

export default async function ActivitySlot() {
  const user = await getUserData("current-user");

  return (
    <div>
      <h2>{user.name} 的活动</h2>
      <ul>
        {user.activities.map((activity) => (
          <li key={activity.id}>{activity.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

使用 React 的 `cache` 函数,两个插槽可以共享同一个数据请求,避免重复获取。

---

## 6. 注意事项

### 6.1 路由匹配规则

**插槽的路由匹配是独立的**:

每个插槽都有自己的路由匹配逻辑,它们不会相互影响。这意味着:

- 主路由(children)匹配 `/about`,不代表 `@sidebar` 插槽也会匹配 `/about`
- 每个插槽需要有自己的路由文件或 `default.tsx`
- 如果插槽没有匹配的路由且没有 `default.tsx`,会导致 404 错误

```
app/
├── layout.tsx
├── page.tsx              # 匹配 /
├── about/
│   └── page.tsx          # 匹配 /about
└── @sidebar/
    ├── page.tsx          # 匹配 / (sidebar 内容)
    └── default.tsx       # 匹配所有其他路由
```

在这个例子中,当访问 `/about` 时:

- 主内容显示 `about/page.tsx`
- 侧边栏显示 `@sidebar/default.tsx`(因为 `@sidebar/about/page.tsx` 不存在)

**动态路由的匹配优先级**:

```
app/
├── layout.tsx
├── @modal/
│   ├── default.tsx
│   ├── [id]/
│   │   └── page.tsx      # 优先级 2
│   └── photo/
│       └── [id]/
│           └── page.tsx  # 优先级 1(更具体)
```

访问 `/photo/123` 时,会匹配 `photo/[id]/page.tsx` 而不是 `[id]/page.tsx`。

### 6.2 default.tsx 的重要性

**必须提供 default.tsx**:

在大多数情况下,你应该为每个插槽提供 `default.tsx`,否则可能会遇到意外的 404 错误。

```tsx
// app/@sidebar/default.tsx
export default function DefaultSidebar() {
  return null; // 或者返回一个默认的侧边栏内容
}
```

**default.tsx 的渲染时机**:

| 导航类型              | 插槽有匹配页面 | 插槽无匹配页面   |
| :-------------------- | :------------- | :--------------- |
| 软导航(客户端)        | 渲染匹配页面   | 保持当前状态     |
| 硬导航(刷新/直接访问) | 渲染匹配页面   | 渲染 default.tsx |

**default.tsx 与 not-found 的区别**:

- `default.tsx`: 插槽的默认内容,当没有匹配的路由时渲染
- `not-found.tsx`: 整个路由段的 404 页面,当路由完全不存在时渲染

### 6.3 性能优化建议

**避免过度使用并行路由**:

并行路由会增加组件树的复杂度,每个插槽都是独立的渲染单元。如果你的应用有太多插槽,可能会影响性能。

**建议的插槽数量**:

- 简单应用: 2-3 个插槽
- 中等复杂度: 3-5 个插槽
- 复杂应用: 不超过 7 个插槽

**使用 Suspense 优化加载体验**:

```tsx
// app/layout.tsx
import { Suspense } from "react";

export default function Layout({
  children,
  analytics,
  sidebar,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      <main>{children}</main>
      <Suspense fallback={<div>加载中...</div>}>{analytics}</Suspense>
      <Suspense fallback={<div>加载中...</div>}>{sidebar}</Suspense>
    </div>
  );
}
```

**数据预取策略**:

对于经常访问的插槽内容,可以使用预取来提升性能:

```tsx
// app/page.tsx
import Link from "next/link";

export default function Page() {
  return (
    <div>
      {/* prefetch 会预取目标路由的所有插槽内容 */}
      <Link href="/dashboard" prefetch={true}>
        前往仪表板
      </Link>
    </div>
  );
}
```

**避免插槽间的循环依赖**:

不要让插槽之间产生循环依赖,这会导致无限渲染循环:

```tsx
// ❌ 错误示例
// app/@slot1/page.tsx
import { useRouter } from "next/navigation";

export default function Slot1() {
  const router = useRouter();

  // 不要在插槽中触发导航到另一个插槽
  useEffect(() => {
    router.push("/slot2-route");
  }, []);

  return <div>Slot 1</div>;
}
```

### 6.4 TypeScript 类型安全

**定义插槽 Props 类型**:

```tsx
// types/layout.ts
export interface ParallelLayoutProps {
  children: React.ReactNode;
  analytics: React.ReactNode;
  sidebar: React.ReactNode;
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}
```

```tsx
// app/layout.tsx
import type { ParallelLayoutProps } from "@/types/layout";

export default async function Layout({
  children,
  analytics,
  sidebar,
  params,
  searchParams,
}: ParallelLayoutProps) {
  // 实现
}
```

**插槽组件的类型定义**:

```tsx
// app/@analytics/page.tsx
interface AnalyticsSlotProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}

export default async function AnalyticsSlot({
  params,
  searchParams,
}: AnalyticsSlotProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // 实现
}
```

### 6.5 调试技巧

**使用 React DevTools 查看插槽结构**:

在 React DevTools 中,并行路由的插槽会显示为独立的组件树,你可以清楚地看到每个插槽的渲染状态。

**添加调试日志**:

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  sidebar,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  console.log("Layout rendered with slots:", {
    hasChildren: !!children,
    hasAnalytics: !!analytics,
    hasSidebar: !!sidebar,
  });

  return (
    <div>
      {children}
      {analytics}
      {sidebar}
    </div>
  );
}
```

**检查路由匹配**:

如果插槽没有按预期渲染,检查以下几点:

1. 插槽文件夹名称是否以 `@` 开头
2. 是否提供了 `default.tsx`
3. 路由路径是否正确匹配
4. 布局组件是否正确接收了插槽 props

---

## 7. 常见问题

### 7.1 基础问题

**问题 1: 为什么我的插槽没有渲染?**

**原因分析**:

最常见的原因是缺少 `default.tsx` 文件。当你导航到一个新路由时,如果插槽在该路由下没有对应的页面,Next.js 会尝试渲染 `default.tsx`。如果 `default.tsx` 也不存在,插槽就不会渲染任何内容。

**解决方案**:

```tsx
// app/@sidebar/default.tsx
export default function DefaultSidebar() {
  return (
    <div>
      <h2>默认侧边栏</h2>
      <p>这是所有路由的默认侧边栏内容</p>
    </div>
  );
}
```

**问题 2: 插槽的 URL 为什么不变?**

**原因分析**:

这是并行路由的设计特性。插槽的内容变化不会反映在 URL 中,因为它们是在同一个路由层级下并行渲染的。

**适用场景**:

这个特性特别适合实现模态框、侧边栏等不需要独立 URL 的 UI 组件。

**如果需要 URL 变化**:

使用传统的嵌套路由而不是并行路由:

```
app/
├── layout.tsx
├── sidebar1/
│   └── page.tsx          # /sidebar1
└── sidebar2/
    └── page.tsx          # /sidebar2
```

**问题 3: 如何在插槽之间共享状态?**

**方案 1: 使用 URL 状态**:

```tsx
// app/layout.tsx
export default function Layout({
  children,
  sidebar,
  searchParams,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  return (
    <div>
      {children}
      {sidebar}
    </div>
  );
}
```

```tsx
// app/@sidebar/page.tsx
export default async function SidebarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const params = await searchParams;
  const filter = params.filter as string;

  return <div>当前过滤器: {filter}</div>;
}
```

**方案 2: 使用 React Context**:

```tsx
// app/layout.tsx
"use client";

import { createContext, useState } from "react";

export const SharedStateContext = createContext(null);

export default function Layout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const [sharedState, setSharedState] = useState({});

  return (
    <SharedStateContext.Provider value={{ sharedState, setSharedState }}>
      <div>
        {children}
        {sidebar}
      </div>
    </SharedStateContext.Provider>
  );
}
```

**方案 3: 使用全局状态管理**:

```tsx
// store/use-filter-store.ts
import { create } from "zustand";

export const useFilterStore = create((set) => ({
  filter: "",
  setFilter: (filter: string) => set({ filter }),
}));
```

```tsx
// app/@sidebar/page.tsx
"use client";

import { useFilterStore } from "@/store/use-filter-store";

export default function SidebarPage() {
  const filter = useFilterStore((state) => state.filter);

  return <div>当前过滤器: {filter}</div>;
}
```

### 7.2 进阶问题

**问题 4: 如何实现插槽的条件渲染?**

**场景描述**:

你可能希望根据用户权限、设备类型或其他条件来决定是否渲染某个插槽。

**解决方案**:

```tsx
// app/layout.tsx
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Layout({
  children,
  admin,
  user,
}: {
  children: React.ReactNode;
  admin: React.ReactNode;
  user: React.ReactNode;
}) {
  const session = await auth();
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  return (
    <div>
      {children}
      {!isMobile && (session?.user?.role === "admin" ? admin : user)}
    </div>
  );
}
```

**问题 5: 并行路由可以嵌套多少层?**

**技术限制**:

理论上没有嵌套层数的硬性限制,但实际应用中需要考虑:

- 性能影响: 每增加一层嵌套,组件树的复杂度就会增加
- 可维护性: 过深的嵌套会让代码难以理解和维护
- 用户体验: 过多的并行区域可能让用户感到困惑

**最佳实践**:

- 建议不超过 2-3 层嵌套
- 如果需要更复杂的布局,考虑使用组件组合而不是并行路由

```
app/
├── layout.tsx              # 第 1 层
├── @sidebar/
│   ├── layout.tsx          # 第 2 层
│   ├── @nav/
│   │   └── page.tsx        # 第 3 层(不建议更深)
│   └── @content/
│       └── page.tsx
```

**问题 6: 如何处理插槽的错误边界?**

**独立错误处理**:

每个插槽可以有自己的 `error.tsx`,实现细粒度的错误处理:

```tsx
// app/@analytics/error.tsx
"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>分析数据加载失败</h2>
      <p>错误信息: {error.message}</p>
      <button onClick={reset}>重新加载</button>
    </div>
  );
}
```

**全局错误处理**:

如果希望所有插槽共享同一个错误边界,可以在父布局中实现:

```tsx
// app/layout.tsx
import { ErrorBoundary } from "@/components/error-boundary";

export default function Layout({
  children,
  analytics,
  sidebar,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div>
        {children}
        {analytics}
        {sidebar}
      </div>
    </ErrorBoundary>
  );
}
```

**问题 7: 并行路由对 SEO 有什么影响?**

**SEO 考量**:

并行路由的内容不会反映在 URL 中,这对 SEO 有以下影响:

**不利影响**:

- 搜索引擎无法通过 URL 直接访问插槽内容
- 插槽内容的变化不会被搜索引擎索引为独立页面
- 无法为不同的插槽内容设置独立的元数据

**适用场景**:

- 辅助性内容(侧边栏、推荐等)
- 用户交互组件(模态框、通知等)
- 不需要被搜索引擎索引的内容

**SEO 优化建议**:

如果插槽内容对 SEO 很重要,考虑以下方案:

1. 使用传统的嵌套路由代替并行路由
2. 在主页面中包含插槽内容的关键信息
3. 使用结构化数据标记插槽内容

```tsx
// app/page.tsx
export async function generateMetadata() {
  return {
    title: "主页面标题",
    description: "包含侧边栏推荐内容的描述",
  };
}
```

**问题 8: 如何测试并行路由?**

**单元测试**:

测试单个插槽组件:

```tsx
// __tests__/sidebar.test.tsx
import { render, screen } from "@testing-library/react";
import SidebarPage from "@/app/@sidebar/page";

describe("Sidebar Slot", () => {
  it("renders sidebar content", async () => {
    render(<SidebarPage />);
    expect(screen.getByText("侧边栏")).toBeInTheDocument();
  });
});
```

**集成测试**:

测试布局和插槽的集成:

```tsx
// __tests__/layout.test.tsx
import { render, screen } from "@testing-library/react";
import Layout from "@/app/layout";
import SidebarPage from "@/app/@sidebar/page";

describe("Layout with Parallel Routes", () => {
  it("renders all slots", () => {
    render(
      <Layout sidebar={<SidebarPage />}>
        <div>Main Content</div>
      </Layout>
    );

    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.getByText("侧边栏")).toBeInTheDocument();
  });
});
```

**E2E 测试**:

使用 Playwright 或 Cypress 测试完整的用户流程:

```typescript
// e2e/parallel-routes.spec.ts
import { test, expect } from "@playwright/test";

test("parallel routes navigation", async ({ page }) => {
  await page.goto("/");

  // 验证主内容和侧边栏都已渲染
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("aside")).toBeVisible();

  // 导航到新路由
  await page.click('a[href="/about"]');

  // 验证主内容更新,侧边栏保持
  await expect(page.locator("main")).toContainText("About");
  await expect(page.locator("aside")).toBeVisible();
});
```

### 7.3 性能相关问题

**问题 9: 并行路由会增加首屏加载时间吗?**

**影响分析**:

并行路由本身不会显著增加首屏加载时间,但需要注意:

**可能的性能影响**:

- 多个插槽同时进行数据获取,可能增加服务器负载
- 每个插槽都是独立的组件树,会增加 JavaScript bundle 大小
- 如果插槽内容很重,可能影响 Time to Interactive (TTI)

**优化策略**:

```tsx
// app/layout.tsx
import { Suspense } from "react";

export default function Layout({
  children,
  analytics,
  sidebar,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      {/* 主内容优先渲染 */}
      {children}

      {/* 次要内容延迟加载 */}
      <Suspense fallback={<div>加载中...</div>}>{analytics}</Suspense>

      <Suspense fallback={<div>加载中...</div>}>{sidebar}</Suspense>
    </div>
  );
}
```

**使用动态导入**:

```tsx
// app/layout.tsx
import dynamic from "next/dynamic";

const Analytics = dynamic(() => import("@/app/@analytics/page"), {
  loading: () => <div>加载分析面板...</div>,
  ssr: false, // 如果不需要 SSR,可以禁用
});

export default function Layout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <Analytics />
      {sidebar}
    </div>
  );
}
```

**问题 10: 如何监控并行路由的性能?**

**使用 Next.js 内置的性能监控**:

```tsx
// app/layout.tsx
export function reportWebVitals(metric: any) {
  console.log(metric);

  // 发送到分析服务
  if (metric.label === "web-vital") {
    // 记录核心 Web 指标
    analytics.track("web-vital", {
      name: metric.name,
      value: metric.value,
      id: metric.id,
    });
  }
}
```

**自定义性能标记**:

```tsx
// app/@analytics/page.tsx
export default async function AnalyticsSlot() {
  const startTime = performance.now();

  const data = await fetchAnalyticsData();

  const endTime = performance.now();
  console.log(`Analytics slot loaded in ${endTime - startTime}ms`);

  return <div>{/* 渲染内容 */}</div>;
}
```

**使用 React Profiler**:

```tsx
// app/layout.tsx
import { Profiler } from "react";

function onRenderCallback(
  id: string,
  phase: "mount" | "update",
  actualDuration: number
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

export default function Layout({
  children,
  analytics,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <Profiler id="analytics-slot" onRender={onRenderCallback}>
        {analytics}
      </Profiler>
    </div>
  );
}
```

---

## 8. 总结

### 8.1 核心要点回顾

**并行路由的本质**:

并行路由是 Next.js App Router 提供的一种高级路由模式,通过命名插槽(Named Slots)实现在同一个路由层级下同时渲染多个独立的页面组件。

**关键特性**:

1. **独立性**: 每个插槽都是独立的组件树,有自己的加载状态、错误边界和数据获取逻辑
2. **并发性**: 多个插槽可以并发渲染,提升整体性能
3. **灵活性**: 支持条件渲染、动态路由和嵌套结构
4. **状态保持**: 在客户端导航时,未变化的插槽会保持其状态

**核心 API**:

- `@folder` 命名约定定义插槽
- `default.tsx` 提供默认内容
- 布局组件通过 props 接收插槽内容
- 每个插槽可以有独立的 `loading.tsx` 和 `error.tsx`

### 8.2 最佳实践总结

**何时使用并行路由**:

- 构建复杂的仪表板应用
- 实现模态框和弹出层
- 需要独立加载状态的多区域布局
- 需要条件渲染的界面组件

**何时不使用并行路由**:

- 简单的页面结构
- SEO 敏感的内容
- 需要独立 URL 的内容
- 移动端为主的应用

**性能优化要点**:

1. 合理控制插槽数量(建议不超过 5-7 个)
2. 使用 Suspense 优化加载体验
3. 利用 React cache 避免重复数据获取
4. 对非关键插槽使用动态导入

**开发建议**:

1. 始终为插槽提供 `default.tsx`
2. 使用 TypeScript 确保类型安全
3. 为每个插槽添加独立的错误处理
4. 使用 React DevTools 调试插槽结构
5. 编写充分的测试覆盖插槽逻辑

### 8.3 与其他路由模式的配合

**与拦截路由结合**:

并行路由常与拦截路由配合使用,实现模态框等高级 UI 模式:

```
app/
├── @modal/
│   ├── default.tsx
│   └── (..)photo/
│       └── [id]/
│           └── page.tsx
```

**与路由组结合**:

使用路由组组织并行路由的结构:

```
app/
├── (dashboard)/
│   ├── layout.tsx
│   ├── @sidebar/
│   └── @content/
```

**与动态路由结合**:

插槽内部支持动态路由,实现灵活的内容展示:

```
app/
├── @related/
│   └── [category]/
│       └── page.tsx
```

### 8.4 未来展望

并行路由是 Next.js App Router 的核心特性之一,随着 React 和 Next.js 的持续演进,我们可以期待:

- 更好的开发者工具支持
- 更优化的性能表现
- 更丰富的使用模式和最佳实践
- 与 React Server Components 更深度的集成

掌握并行路由,将帮助你构建更复杂、更高性能的 Next.js 应用。

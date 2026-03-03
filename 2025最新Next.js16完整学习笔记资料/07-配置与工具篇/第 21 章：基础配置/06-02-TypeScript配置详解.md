**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# TypeScript 配置详解

## 概述

TypeScript 已经成为现代 Web 开发的标准选择，Next.js 16 对 TypeScript 提供了开箱即用的支持。通过合理配置 TypeScript，你可以获得更好的类型安全、代码提示和开发体验。

Next.js 会自动检测项目中的 TypeScript 文件，并在首次运行 `next dev` 或 `next build` 时自动创建 `tsconfig.json` 文件。这个文件包含了 Next.js 推荐的 TypeScript 配置，你可以根据项目需求进行调整。

### TypeScript 在 Next.js 中的优势

1. **类型安全**：在编译时捕获错误，减少运行时问题
2. **智能提示**：IDE 可以提供更准确的代码补全
3. **重构支持**：安全地重命名变量、函数和类型
4. **文档化**：类型定义本身就是最好的文档
5. **团队协作**：统一的类型约束提高代码质量

## 基础配置

### 初始化 TypeScript 项目

创建新项目时选择 TypeScript：

```bash
npx create-next-app@latest my-app --typescript
```

或者在现有项目中添加 TypeScript：

```bash
# 安装依赖
npm install --save-dev typescript @types/react @types/node

# 创建 tsconfig.json
touch tsconfig.json

# 运行开发服务器，Next.js 会自动配置
npm run dev
```

### Next.js 默认的 tsconfig.json

Next.js 会生成以下默认配置：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 核心配置选项说明

#### target

指定编译后的 JavaScript 版本：

```json
{
  "compilerOptions": {
    "target": "ES2017"
  }
}
```

可选值：

- `ES5`: 兼容性最好，但不支持现代特性
- `ES2015` (ES6): 支持箭头函数、类等
- `ES2017`: 支持 async/await（Next.js 默认）
- `ES2020`: 支持可选链、空值合并等
- `ESNext`: 最新的 ECMAScript 特性

#### lib

指定要包含的库文件：

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"]
  }
}
```

- `dom`: DOM API 类型定义
- `dom.iterable`: 可迭代的 DOM 集合
- `esnext`: 最新的 ECMAScript 特性

#### strict

启用所有严格类型检查选项：

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

这会启用：

- `strictNullChecks`: 严格的 null 检查
- `strictFunctionTypes`: 严格的函数类型检查
- `strictBindCallApply`: 严格的 bind/call/apply 检查
- `strictPropertyInitialization`: 严格的属性初始化检查
- `noImplicitThis`: 禁止隐式的 this
- `alwaysStrict`: 始终以严格模式解析

建议在新项目中始终启用 `strict: true`。

#### jsx

指定 JSX 代码的处理方式：

```json
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```

可选值：

- `preserve`: 保留 JSX，由 Next.js 处理（推荐）
- `react`: 转换为 React.createElement
- `react-jsx`: 转换为 \_jsx 调用（React 17+）

#### moduleResolution

指定模块解析策略：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

Next.js 16 使用 `bundler` 模式，这是专为打包工具优化的解析策略。

#### paths

配置路径别名：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@utils/*": ["./utils/*"],
      "@lib/*": ["./lib/*"]
    }
  }
}
```

这样可以使用绝对路径导入：

```typescript
// 不需要相对路径
import Button from "@components/Button";
import { formatDate } from "@utils/date";

// 而不是
import Button from "../../../components/Button";
```

#### plugins

Next.js TypeScript 插件提供了额外的类型检查和智能提示：

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ]
  }
}
```

这个插件提供：

- 路由类型检查
- 服务端组件和客户端组件的类型区分
- 元数据 API 的类型提示
- 更好的错误信息

## 高级配置

### 严格模式配置

对于追求高质量代码的项目，可以启用更严格的检查：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

选项说明：

- `noUnusedLocals`: 禁止未使用的局部变量
- `noUnusedParameters`: 禁止未使用的参数
- `noFallthroughCasesInSwitch`: 禁止 switch 语句的 fallthrough
- `noImplicitReturns`: 函数必须有明确的返回值
- `noUncheckedIndexedAccess`: 索引访问时添加 undefined 检查
- `exactOptionalPropertyTypes`: 可选属性不能设置为 undefined
- `forceConsistentCasingInFileNames`: 强制文件名大小写一致

### 路径别名配置

完整的路径别名配置示例：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@ui/*": ["./src/components/ui/*"],
      "@utils/*": ["./src/utils/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@styles/*": ["./src/styles/*"],
      "@public/*": ["./public/*"],
      "@config/*": ["./config/*"]
    }
  }
}
```

使用示例：

```typescript
// app/page.tsx
import { Button } from "@ui/button";
import { formatDate } from "@utils/date";
import { useAuth } from "@hooks/useAuth";
import type { User } from "@types/user";
import Logo from "@public/logo.svg";
```

注意：在 `next.config.ts` 中也需要配置相应的 webpack 别名（如果使用自定义 webpack 配置）。

### App Router 配置

对于使用 App Router 的项目：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Monorepo 配置

在 Monorepo 项目中的配置：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/ui": ["../../packages/ui/src"],
      "@repo/utils": ["../../packages/utils/src"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

基础配置文件 `tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 类型声明文件

创建全局类型声明文件 `types/global.d.ts`：

```typescript
// types/global.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      DATABASE_URL: string;
      SECRET_KEY: string;
    }
  }

  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export {};
```

在 `tsconfig.json` 中包含：

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "types/**/*.d.ts"
  ]
}
```

### 模块声明

为没有类型定义的第三方库添加类型：

```typescript
// types/modules.d.ts
declare module "some-untyped-module" {
  export function someFunction(param: string): void;
  export const someValue: number;
}

declare module "*.svg" {
  import { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
```

## 实战案例

### 案例 1：完整的企业级配置

适合大型企业项目的 TypeScript 配置：

```json
{
  "compilerOptions": {
    // 编译目标
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],

    // 模块系统
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,

    // JSX
    "jsx": "preserve",

    // 类型检查
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,

    // 其他选项
    "allowJs": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "incremental": true,

    // 路径别名
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@ui/*": ["./src/components/ui/*"],
      "@utils/*": ["./src/utils/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@api/*": ["./src/app/api/*"],
      "@config/*": ["./src/config/*"]
    },

    // Next.js 插件
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/**/*.ts",
    "src/**/*.tsx"
  ],
  "exclude": ["node_modules", ".next", "out", "dist", "build"]
}
```

### 案例 2：渐进式迁移配置

从 JavaScript 迁移到 TypeScript 的配置：

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "checkJs": false,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

迁移步骤：

1. 设置 `allowJs: true` 允许 JS 和 TS 混用
2. 设置 `strict: false` 降低初始门槛
3. 逐步将 `.js` 文件重命名为 `.ts`
4. 添加类型注解
5. 逐步启用严格模式选项

### 案例 3：多项目 Monorepo 配置

根目录 `tsconfig.base.json`：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

应用项目 `apps/web/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/ui": ["../../packages/ui/src"],
      "@repo/utils": ["../../packages/utils/src"],
      "@repo/config": ["../../packages/config/src"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

共享包 `packages/ui/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### 案例 4：类型安全的环境变量

创建类型安全的环境变量配置：

```typescript
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // 公开环境变量
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_GA_ID: string;

      // 服务端环境变量
      DATABASE_URL: string;
      DATABASE_AUTH_TOKEN: string;
      REDIS_URL: string;
      SECRET_KEY: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;

      // 第三方服务
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;

      // 环境标识
      NODE_ENV: "development" | "production" | "test";
      VERCEL_ENV?: "production" | "preview" | "development";
    }
  }
}

export {};
```

使用环境变量：

```typescript
// lib/config.ts
export const config = {
  api: {
    url: process.env.NEXT_PUBLIC_API_URL, // 类型安全
  },
  database: {
    url: process.env.DATABASE_URL, // 类型安全
  },
} as const;

// 如果访问不存在的环境变量，TypeScript 会报错
// const invalid = process.env.INVALID_VAR // ❌ 类型错误
```

### 案例 5：API 路由类型定义

为 API 路由创建类型定义：

```typescript
// types/api.d.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// API 端点类型
export namespace API {
  export namespace Users {
    export type GetResponse = ApiResponse<User[]>;
    export type GetByIdResponse = ApiResponse<User>;
    export type CreateRequest = Omit<User, "id" | "createdAt" | "updatedAt">;
    export type CreateResponse = ApiResponse<User>;
  }

  export namespace Posts {
    export type GetResponse = ApiResponse<Post[]>;
    export type GetByIdResponse = ApiResponse<Post>;
    export type CreateRequest = Omit<Post, "id" | "createdAt" | "updatedAt">;
    export type CreateResponse = ApiResponse<Post>;
  }
}
```

使用 API 类型：

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { API } from "@types/api";

export async function GET(): Promise<NextResponse<API.Users.GetResponse>> {
  const users = await db.user.findMany();

  return NextResponse.json({
    success: true,
    data: users,
  });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<API.Users.CreateResponse>> {
  const body: API.Users.CreateRequest = await request.json();

  const user = await db.user.create({
    data: body,
  });

  return NextResponse.json({
    success: true,
    data: user,
  });
}
```

客户端使用：

```typescript
// lib/api/users.ts
import type { API } from "@types/api";

export async function getUsers(): Promise<API.Users.GetResponse> {
  const response = await fetch("/api/users");
  return response.json();
}

export async function createUser(
  data: API.Users.CreateRequest
): Promise<API.Users.CreateResponse> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## 适用场景

### TypeScript 配置选择指南

| 项目类型 | 推荐配置                      | 说明                   |
| -------- | ----------------------------- | ---------------------- |
| 新项目   | strict: true + 完整类型检查   | 从一开始就保证类型安全 |
| 迁移项目 | allowJs: true + strict: false | 逐步迁移，降低门槛     |
| 企业项目 | 严格模式 + 所有检查选项       | 最高的代码质量要求     |
| 原型项目 | 宽松配置                      | 快速开发，后期再加强   |
| Monorepo | 共享基础配置 + 项目特定配置   | 统一标准，灵活扩展     |
| 开源库   | declaration: true + 严格模式  | 提供类型定义文件       |

### 严格程度选择

| 严格程度 | 适用场景           | 配置建议                          |
| -------- | ------------------ | --------------------------------- |
| 宽松     | 快速原型、学习项目 | strict: false, allowJs: true      |
| 中等     | 一般业务项目       | strict: true, 部分额外检查        |
| 严格     | 企业级、金融、医疗 | strict: true + 所有检查选项       |
| 极严格   | 开源库、基础设施   | 严格 + exactOptionalPropertyTypes |

### 路径别名使用场景

| 场景     | 配置方式       | 优势           |
| -------- | -------------- | -------------- |
| 小型项目 | @/\* 单一别名  | 简单够用       |
| 中型项目 | 按功能分类别名 | 清晰的代码组织 |
| 大型项目 | 详细的别名映射 | 精确的模块定位 |
| Monorepo | 跨包别名       | 共享代码复用   |

## 注意事项

### 配置文件修改

1. **重启开发服务器**：修改 tsconfig.json 后必须重启
2. **IDE 重载**：某些 IDE 需要重新加载项目
3. **增量编译**：修改配置可能需要删除 `.next` 目录

### 常见陷阱

#### 陷阱 1：路径别名不生效

```json
// ❌ 错误：忘记设置 baseUrl
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// ✅ 正确：必须设置 baseUrl
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 陷阱 2：类型声明文件未包含

```json
// ❌ 错误：类型文件未包含
{
  "include": ["**/*.ts", "**/*.tsx"]
}

// ✅ 正确：包含所有必要文件
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "types/**/*.d.ts"
  ]
}
```

#### 陷阱 3：严格模式导致大量错误

```typescript
// 问题：突然启用 strict: true 导致大量错误

// 解决方案：逐步启用
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true,  // 先启用这个
    // 修复所有错误后再启用下一个
  }
}
```

### 性能优化

#### 优化 1：跳过库检查

```json
{
  "compilerOptions": {
    "skipLibCheck": true // 跳过 node_modules 的类型检查
  }
}
```

这可以显著提高编译速度，但可能会错过第三方库的类型错误。

#### 优化 2：增量编译

```json
{
  "compilerOptions": {
    "incremental": true // 启用增量编译
  }
}
```

TypeScript 会缓存编译信息，加快后续编译速度。

#### 优化 3：项目引用

对于 Monorepo 项目，使用项目引用：

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true
  },
  "references": [{ "path": "../shared" }, { "path": "../ui" }]
}
```

### 类型安全最佳实践

#### 实践 1：避免使用 any

```typescript
// ❌ 不好
function process(data: any) {
  return data.value;
}

// ✅ 好
function process<T extends { value: string }>(data: T) {
  return data.value;
}

// ✅ 更好：使用 unknown
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data");
}
```

#### 实践 2：使用类型守卫

```typescript
// types/guards.ts
export function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    typeof (value as any).id === "string" &&
    typeof (value as any).email === "string"
  );
}

// 使用
function processUser(data: unknown) {
  if (isUser(data)) {
    // data 现在是 User 类型
    console.log(data.email);
  }
}
```

#### 实践 3：使用 const assertions

```typescript
// ❌ 类型推断为 string
const status = "pending";

// ✅ 类型推断为 'pending'
const status = "pending" as const;

// ✅ 对象的 const assertion
const config = {
  api: "https://api.example.com",
  timeout: 5000,
} as const;

// config.api 的类型是 'https://api.example.com' 而不是 string
```

### 与 Next.js 集成注意事项

#### 注意 1：Server Components 和 Client Components

```typescript
// app/server-component.tsx
// 服务端组件，可以使用 async
export default async function ServerComponent() {
  const data = await fetch("https://api.example.com/data");
  return <div>{data}</div>;
}

// app/client-component.tsx
("use client");
// 客户端组件，不能使用 async
export default function ClientComponent() {
  const [data, setData] = useState(null);
  return <div>{data}</div>;
}
```

#### 注意 2：Metadata API 类型

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "My App Description",
};
```

#### 注意 3：Route Handlers 类型

```typescript
// app/api/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Hello" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### 团队协作

#### 协作 1：统一配置

在团队中使用统一的 tsconfig.json：

```json
{
  "extends": "@company/tsconfig-base",
  "compilerOptions": {
    // 项目特定配置
  }
}
```

#### 协作 2：代码审查检查点

- 是否有 any 类型
- 是否有类型断言（as）
- 是否有 @ts-ignore 注释
- 类型定义是否完整
- 是否使用了正确的泛型

#### 协作 3：CI/CD 集成

```yaml
# .github/workflows/typecheck.yml
name: Type Check

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run type-check
```

```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

## 常见问题

### 1. 为什么路径别名在 IDE 中有效但构建失败？

可能是 next.config.ts 中没有配置相应的 webpack 别名。虽然 Next.js 16 通常会自动处理，但某些情况下需要手动配置：

```typescript
// next.config.ts
import path from "path";

const config: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };
    return config;
  },
};
```

### 2. 如何处理第三方库没有类型定义？

三种方法：

```typescript
// 方法1：安装 @types 包
npm install --save-dev @types/library-name

// 方法2：创建声明文件
// types/library-name.d.ts
declare module 'library-name' {
  export function someFunction(): void
}

// 方法3：使用 any（不推荐）
const lib = require('library-name') as any
```

### 3. strict 模式下如何处理可能为 null 的值？

使用可选链和空值合并：

```typescript
// ❌ 错误：可能为 null
const name = user.profile.name;

// ✅ 正确：使用可选链
const name = user?.profile?.name;

// ✅ 提供默认值
const name = user?.profile?.name ?? "Anonymous";

// ✅ 类型守卫
if (user && user.profile && user.profile.name) {
  const name = user.profile.name; // 这里 name 不会是 null
}
```

### 4. 如何在 TypeScript 中使用动态导入？

```typescript
// 动态导入组件
const DynamicComponent = dynamic(() => import("@components/Heavy"), {
  loading: () => <p>Loading...</p>,
});

// 动态导入模块
async function loadModule() {
  const module = await import("@utils/helper");
  module.doSomething();
}

// 类型安全的动态导入
type HelperModule = typeof import("@utils/helper");
async function loadHelper(): Promise<HelperModule> {
  return import("@utils/helper");
}
```

### 5. 如何配置 TypeScript 以支持 CSS Modules？

```typescript
// types/css-modules.d.ts
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
```

使用：

```typescript
import styles from "./Button.module.css";

export function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

### 6. 如何处理 JSON 导入？

```json
// tsconfig.json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

```typescript
// 导入 JSON 文件
import data from "./data.json";

// data 会有正确的类型推断
console.log(data.users);
```

### 7. 如何在 TypeScript 中使用环境变量？

```typescript
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
}

export {};
```

使用：

```typescript
// 现在有类型提示和检查
const dbUrl = process.env.DATABASE_URL; // string 类型
const apiKey = process.env.API_KEY; // string 类型
```

### 8. 如何配置 TypeScript 以支持绝对导入？

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// 使用绝对导入
import { Button } from "@/components/Button";
import { formatDate } from "@/utils/date";

// 而不是相对导入
import { Button } from "../../../components/Button";
```

### 9. 如何在 TypeScript 中使用装饰器？

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

class Example {
  @log
  method(arg: string) {
    return `Hello ${arg}`;
  }
}
```

### 10. 如何处理 TypeScript 编译错误但仍然构建？

不建议这样做，但如果确实需要：

```json
// tsconfig.json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

```typescript
// next.config.ts
const config: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 不推荐
  },
};
```

更好的做法是修复错误，或者使用 `@ts-expect-error` 注释特定行。

### 11. 如何在 TypeScript 中使用 React Server Components？

```typescript
// app/page.tsx
// 服务端组件默认是异步的
export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  const json = await data.json();

  return <div>{json.title}</div>;
}

// 类型定义
interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params, searchParams }: PageProps) {
  return <div>ID: {params.id}</div>;
}
```

### 12. 如何配置 TypeScript 以支持 Monorepo？

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// apps/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@repo/shared": ["../../packages/shared/src"]
    }
  },
  "references": [
    { "path": "../../packages/shared" }
  ]
}
```

### 13. 如何处理 TypeScript 中的循环依赖？

```typescript
// ❌ 问题：循环依赖
// a.ts
import { B } from "./b";
export class A {
  b: B;
}

// b.ts
import { A } from "./a";
export class B {
  a: A;
}

// ✅ 解决方案1：使用类型导入
// a.ts
import type { B } from "./b";
export class A {
  b: B;
}

// ✅ 解决方案2：提取共享类型
// types.ts
export interface A {
  b: B;
}
export interface B {
  a: A;
}

// a.ts
import type { A, B } from "./types";
export class AImpl implements A {
  b: B;
}
```

### 14. 如何在 TypeScript 中使用泛型约束？

```typescript
// 基础泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "John", age: 30 };
const name = getProperty(user, "name"); // string
const age = getProperty(user, "age"); // number

// 多重约束
interface HasId {
  id: string;
}

interface HasName {
  name: string;
}

function process<T extends HasId & HasName>(item: T) {
  console.log(item.id, item.name);
}

// 条件类型
type IsString<T> = T extends string ? true : false;
type A = IsString<string>; // true
type B = IsString<number>; // false
```

### 15. 如何优化 TypeScript 编译性能？

```json
// tsconfig.json
{
  "compilerOptions": {
    // 跳过库检查
    "skipLibCheck": true,

    // 启用增量编译
    "incremental": true,

    // 使用项目引用（Monorepo）
    "composite": true,

    // 减少类型检查范围
    "skipDefaultLibCheck": true
  },

  // 排除不必要的文件
  "exclude": ["node_modules", "dist", "build", ".next", "coverage"]
}
```

其他优化建议：

- 使用 `tsc --diagnostics` 查看编译性能
- 减少全局类型声明
- 避免过度使用复杂的条件类型
- 使用 `tsc --watch` 而不是每次都完整编译

## 总结

TypeScript 配置是 Next.js 项目的基础，合理的配置可以显著提升开发体验和代码质量。

关键要点：

1. **基础配置**：使用 Next.js 推荐的默认配置作为起点
2. **严格模式**：新项目应该启用 `strict: true`
3. **路径别名**：使用 `paths` 配置简化导入路径
4. **类型声明**：为环境变量、第三方库创建类型声明
5. **渐进迁移**：从 JavaScript 迁移时使用宽松配置，逐步加严
6. **性能优化**：使用 `skipLibCheck`、`incremental` 等选项
7. **团队协作**：统一配置标准，集成 CI/CD 检查
8. **Monorepo**：使用项目引用和共享配置

TypeScript 的类型系统虽然有学习曲线，但带来的好处远大于成本。通过合理配置和使用，可以让你的 Next.js 项目更加健壮和可维护。

记住：配置不是一成不变的，应该根据项目需求和团队情况进行调整。从宽松开始，逐步加严，找到适合自己项目的平衡点。
}

```

```

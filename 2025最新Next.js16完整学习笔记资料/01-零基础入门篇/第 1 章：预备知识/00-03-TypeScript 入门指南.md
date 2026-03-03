**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# TypeScript 入门指南

## 1. 概述 (Overview)

### 1.1 概念定义

TypeScript (简称 TS) 是由微软开发并开源的编程语言。它是 JavaScript 的一个**超集 (Superset)**，意味着任何合法的 JavaScript 代码都是合法的 TypeScript 代码。TypeScript 在此基础上添加了**静态类型系统 (Static Typing)**。

TypeScript 代码最终会被**编译 (Transpile)** 成普通的 JavaScript 代码，以便在浏览器或 Node.js 环境中运行。

### 1.2 核心价值

- **类型安全**: 在编译阶段捕获错误（如拼写错误、类型不匹配、null/undefined 访问），大大减少了运行时 bug。
- **开发体验**: 强大的 IDE 支持（智能感知 IntelliSense、自动补全、重构工具），显著提升开发效率。
- **可维护性**: 类型定义充当了“活文档”，让代码更易于阅读和理解，特别适合大型团队协作。
- **现代化**: 支持最新的 ECMAScript 特性，并能编译到旧版本目标（如 ES5）。

### 1.3 发展历程

- **2012 年**: 微软发布 TypeScript 0.8，由 C# 之父 Anders Hejlsberg 主导设计。
- **2014 年**: 发布 1.0 版本，开始在 Angular 2 中被采用。
- **2016 年**: 发布 2.0，引入 `null` 和 `undefined` 控制流分析。
- **2018 年**: 发布 3.0，引入 `unknown` 类型和 Project References。
- **2020 年**: 发布 4.0，性能大幅提升。
- **2023 年**: 发布 5.0，重写了装饰器，体积更小，速度更快。

---

## 2. 核心概念与原理 (Concepts & Principles)

### 2.1 基础类型 (Basic Types)

TypeScript 提供了比 JavaScript 更丰富的类型系统。

- **Primitive Types**: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`。
- **Special Types**:
  - `any`: 任意类型，相当于关闭了类型检查（尽量少用）。
  - `unknown`: 未知类型，比 `any` 安全，必须先进行类型判断才能操作。
  - `void`: 无返回值（通常用于函数）。
  - `never`: 永远不存在的值（如抛出异常的函数、死循环）。
  - `object`: 非原始类型。

```typescript
let isDone: boolean = false;
let decimal: number = 6;
let color: string = "blue";
let notSure: unknown = 4;

function warnUser(): void {
  console.log("This is my warning message");
}
```

### 2.2 接口与类型别名 (Interface vs Type)

#### 2.2.1 Interface

主要用于定义对象的形状 (Shape) 和类的契约。支持声明合并 (Declaration Merging)。

```typescript
interface User {
  id: number;
  name: string;
  email?: string; // 可选属性
  readonly role: string; // 只读属性
}

const user: User = { id: 1, name: "Alice", role: "Admin" };
```

#### 2.2.2 Type Alias

更灵活，可以定义基本类型别名、联合类型、元组等。

```typescript
type ID = string | number; // 联合类型
type Point = { x: number; y: number };
type Callback = (data: string) => void;
```

**选择建议**:

- 定义对象或库的公开 API 时，优先使用 `interface`（可扩展）。
- 定义联合类型、工具类型或简单别名时，使用 `type`。

### 2.3 函数 (Functions)

可以为参数和返回值添加类型注解。

```typescript
function add(x: number, y: number): number {
  return x + y;
}

// 可选参数 (?) 和 默认参数 (=)
function buildName(firstName: string, lastName: string = "Smith"): string {
  return firstName + " " + lastName;
}
```

### 2.4 类 (Classes)

TypeScript 增强了 ES6 类，增加了访问修饰符。

- `public` (默认): 可以在任何地方访问。
- `private`: 只能在类内部访问。
- `protected`: 可以在类内部和子类中访问。
- `readonly`: 属性只读。

```typescript
class Animal {
  private name: string;
  constructor(theName: string) {
    this.name = theName;
  }
  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}
```

### 2.5 泛型 (Generics)

泛型是创建可复用组件的强大工具，允许组件处理多种类型，同时保持类型安全。

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("myString");

// 泛型接口
interface Box<T> {
  contents: T;
}
let box: Box<number> = { contents: 100 };
```

### 2.6 枚举 (Enums)

枚举是 TS 少数几个**不是** JavaScript 语法扩展的特性之一（它会生成运行时代码）。

#### 2.6.1 数字枚举 (Numeric Enums)

默认从 0 开始自增。支持反向映射 (Reverse Mapping)。

```typescript
enum Direction {
  Up = 1, // 指定起始值
  Down, // 2
  Left, // 3
  Right, // 4
}

let d = Direction.Up; // 1
let nameOfUp = Direction[1]; // "Up"
```

#### 2.6.2 字符串枚举 (String Enums)

必须为每个成员赋予字符串字面量。不支持反向映射。

```typescript
enum ResponseState {
  No = "No",
  Yes = "Yes",
}
```

#### 2.6.3 常量枚举 (Const Enums)

使用 `const enum` 定义。它在编译阶段会被**完全删除**，成员引用会被内联为字面量。推荐使用以优化代码体积。

```typescript
const enum LogLevel {
  ERROR,
  WARN,
  INFO,
}
const level = LogLevel.ERROR;
// 编译后: const level = 0;
```

### 2.7 抽象类 (Abstract Classes)

抽象类作为派生类的基类使用，不能被直接实例化。它可以包含成员的实现细节。

```typescript
abstract class Department {
  constructor(public name: string) {}

  printName(): void {
    console.log("Department name: " + this.name);
  }

  // 必须在派生类中实现
  abstract printMeeting(): void;
}

class AccountingDepartment extends Department {
  constructor() {
    super("Accounting and Auditing");
  }

  printMeeting(): void {
    console.log("The Accounting Department meets each Monday at 10am.");
  }
}

// let department = new Department(); // Error: 不能实例化抽象类
let department = new AccountingDepartment(); // OK
```

---

## 3. 进阶特性 (Advanced Features)

### 3.1 联合类型与交叉类型 (Union & Intersection)

#### 3.1.1 联合类型 (Union Types)

联合类型使用 `|` 符号，表示值可以是几种类型之一。这是 TypeScript 中最常用的特性之一，用于处理多态数据。

```typescript
// 基础用法
let value: string | number;
value = "hello"; // OK
value = 123; // OK
// value = true; // Error

// 函数参数中的应用
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${typeof padding}'.`);
}
```

#### 3.1.2 交叉类型 (Intersection Types)

交叉类型使用 `&` 符号，将多个类型合并为一个类型。新类型包含所有类型的特性。常用于混入 (Mixin) 或组合对象。

```typescript
interface ErrorHandling {
  success: boolean;
  error?: { message: string };
}

interface ArtworksData {
  artworks: { title: string }[];
}

interface ArtistsData {
  artists: { name: string }[];
}

// 组合响应类型
type ArtworksResponse = ArtworksData & ErrorHandling;
type ArtistsResponse = ArtistsData & ErrorHandling;

const handleArtistsResponse = (response: ArtistsResponse) => {
  if (response.error) {
    console.error(response.error.message);
    return;
  }
  console.log(response.artists);
};
```

### 3.2 索引访问类型 (Indexed Access Types)

我们可以通过 `Type[Key]` 的方式去获取一个类型中某个属性的类型，类似于 JavaScript 中访问对象属性。

```typescript
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"]; // type Age = number

// 结合联合类型
type I1 = Person["age" | "name"]; // type I1 = string | number

// 结合 typeof 和数组
const MyArray = [
  { name: "Alice", age: 15 },
  { name: "Bob", age: 23 },
  { name: "Eve", age: 38 },
];

type PersonType = (typeof MyArray)[number];
// type PersonType = { name: string; age: number; }
```

### 3.3 映射类型 (Mapped Types)

映射类型建立在索引签名的语法上，用于基于旧类型创建新类型。这在定义工具类型时非常有用。

语法结构：`{ [P in K]: T }`

```typescript
// 将所有属性变为 boolean
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};

type Features = {
  darkMode: () => void;
  newUserProfile: () => void;
};

type FeatureOptions = OptionsFlags<Features>;
// type FeatureOptions = {
//    darkMode: boolean;
//    newUserProfile: boolean;
// }
```

**修饰符**: 可以使用 `+` 或 `-` 来添加或移除 `readonly` 和 `?` 修饰符。

```typescript
// 移除 'readonly' 属性
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};

type LockedAccount = {
  readonly id: string;
  readonly name: string;
};

type UnlockedAccount = CreateMutable<LockedAccount>;
// type UnlockedAccount = {
//    id: string;
//    name: string;
// }
```

### 3.4 条件类型 (Conditional Types)

条件类型类似于 JavaScript 中的三元运算符 `condition ? trueExpression : falseExpression`。

语法：`T extends U ? X : Y`

如果 `T` 可以赋值给 `U`，那么类型是 `X`，否则是 `Y`。

```typescript
interface Animal {
  live(): void;
}
interface Dog extends Animal {
  woof(): void;
}

type Example1 = Dog extends Animal ? number : string;
// type Example1 = number

type Example2 = RegExp extends Animal ? number : string;
// type Example2 = string
```

#### 3.4.1 分布式条件类型 (Distributive Conditional Types)

当条件类型作用于泛型，并且传入的是联合类型时，它会自动分发。

```typescript
type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;
// type StrArrOrNumArr = string[] | number[]
```

如果想要避免分发，可以用元组包裹：

```typescript
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
type StrOrNumArr = ToArrayNonDist<string | number>;
// type StrOrNumArr = (string | number)[]
```

### 3.5 infer 关键字

`infer` 关键字只能在条件类型的 `extends` 子句中使用，用于声明一个类型变量，该变量可以推断出类型。

**案例：获取函数返回类型 (ReturnType 的实现原理)**

```typescript
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function getUser() {
  return { name: "Alice", age: 30 };
}

type User = MyReturnType<typeof getUser>;
// type User = { name: string; age: 30 }
```

**案例：获取 Promise 内部类型**

```typescript
type Unpacked<T> = T extends Promise<infer U> ? U : T;

type T0 = Unpacked<Promise<string>>; // string
type T1 = Unpacked<number>; // number
```

### 3.6 模板字面量类型 (Template Literal Types)

基于字符串字面量类型，通过模板语法构建新类型。

```typescript
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

type Color = "red" | "blue";
type Quantity = "one" | "two";
type Item = `${Color}-${Quantity}`;
// "red-one" | "red-two" | "blue-one" | "blue-two"
```

**实战：定义事件监听器类型**

```typescript
type PropEventSource<Type> = {
  on(
    eventName: `${string & keyof Type}Changed`,
    callback: (newValue: any) => void
  ): void;
};

declare function makeWatchedObject<Type>(
  obj: Type
): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

person.on("firstNameChanged", (newValue) => {
  console.log(`firstName was changed to ${newValue}!`);
});
```

### 3.7 工具类型 (Utility Types) 深度解析

TS 内置了许多方便的工具类型，理解其实现原理是进阶的关键。

#### 3.7.1 Partial<T>

将 T 所有属性变为可选。

```typescript
/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

#### 3.7.2 Required<T>

将 T 所有属性变为必选。

```typescript
/**
 * Make all properties in T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

#### 3.7.3 Readonly<T>

将 T 所有属性变为只读。

```typescript
/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

#### 3.7.4 Pick<T, K>

从 T 中选取一组属性 K。

```typescript
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

#### 3.7.5 Omit<T, K>

从 T 中剔除一组属性 K。注意这里利用了 `Pick` 和 `Exclude`。

```typescript
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

#### 3.7.6 Exclude<T, U>

从 T 中排除可以赋值给 U 的类型。

```typescript
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;
```

#### 3.7.7 Extract<T, U>

从 T 中提取可以赋值给 U 的类型。

```typescript
/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;
```

#### 3.7.8 NonNullable<T>

从 T 中排除 null 和 undefined。

```typescript
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 3.8 类型守卫 (Type Guards) 进阶

#### 3.8.1 用户自定义类型守卫 (User-Defined Type Guards)

返回 `arg is Type` 的函数，是类型收窄的利器。

```typescript
interface Fish {
  swim: () => void;
}
interface Bird {
  fly: () => void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // TS 知道这里是 Fish
  } else {
    pet.fly(); // TS 知道这里是 Bird
  }
}
```

#### 3.8.2 断言函数 (Assertion Functions)

使用 `asserts` 关键字，如果函数返回，则断言条件为真。

```typescript
function assertIsString(val: any): asserts val is string {
  if (typeof val !== "string") {
    throw new Error("Not a string!");
  }
}

function processValue(val: any) {
  assertIsString(val);
  // 这里 val 被收窄为 string
  console.log(val.toUpperCase());
}
```

#### 3.8.3 可辨识联合 (Discriminated Unions)

这是处理多态数据的最佳实践。给每个接口添加一个共同的字面量属性（通常叫 `type` 或 `kind`）。

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    // switch 的完整性检查
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

## 4. TypeScript 5.0+ 新特性 (New Features)

### 4.1 装饰器 (Decorators) 标准化

TS 5.0 全面支持 ECMAScript Stage 3 装饰器提案，无需 `experimentalDecorators` 配置。

```typescript
function loggedMethod(
  originalMethod: any,
  context: ClassMethodDecoratorContext
) {
  const methodName = String(context.name);
  function replacementMethod(this: any, ...args: any[]) {
    console.log(`LOG: Entering method '${methodName}'.`);
    const result = originalMethod.call(this, ...args);
    console.log(`LOG: Exiting method '${methodName}'.`);
    return result;
  }
  return replacementMethod;
}

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  @loggedMethod
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}
```

### 4.2 const 类型参数 (const Type Parameters)

允许推断出更精确的字面量类型，而不是宽泛的原始类型。

```typescript
// TS 5.0 之前
function getNamesExactly<T extends string[]>(names: T): T {
  return names;
}
const names1 = getNamesExactly(["Alice", "Bob"]);
// 类型是 string[]

// TS 5.0 使用 const 修饰符
function getNamesExactlyConst<const T extends string[]>(names: T): T {
  return names;
}
const names2 = getNamesExactlyConst(["Alice", "Bob"]);
// 类型是 readonly ["Alice", "Bob"]
```

### 4.3 satisfies 运算符 (TS 4.9+)

`satisfies` 允许我们验证表达式是否匹配某种类型，同时**保留表达式的特定类型**。这是相比类型注解 (`: Type`) 的一大改进。

```typescript
type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
} satisfies Record<Colors, string | RGB>;

// 使用 satisfies，TS 知道 palette.green 是 string，palette.red 是元组
const greenNormalized = palette.green.toUpperCase(); // OK
const redComponent = palette.red[0]; // OK

// 如果使用 : Record<Colors, string | RGB>，所有属性都会变成 string | RGB
// palette.green.toUpperCase() 会报错，因为 RGB 数组没有 toUpperCase 方法
```

## 5. 工程化配置 (Engineering Configuration)

### 5.1 tsconfig.json 核心配置深度解析

`tsconfig.json` 控制着编译器的行为。

```json
{
  "compilerOptions": {
    /* 基础选项 */
    "target": "ES2020", // 编译目标版本
    "module": "ESNext", // 模块系统 (CommonJS, ESNext, Node16)
    "lib": ["DOM", "DOM.Iterable", "ESNext"], // 包含的库声明
    "jsx": "preserve", // JSX 处理方式 (react-jsx, preserve)

    /* 严格类型检查 (重要) */
    "strict": true, // 开启所有严格检查
    "noImplicitAny": true, // 禁止隐式 any
    "strictNullChecks": true, // 严格的 null 检查
    "strictFunctionTypes": true, // 严格函数类型检查

    /* 模块解析 */
    "moduleResolution": "bundler", // 模块解析策略 (node, node16, bundler)
    "baseUrl": ".", // 解析非相对模块的基准目录
    "paths": {
      // 路径映射 (Alias)
      "@/*": ["src/*"]
    },
    "resolveJsonModule": true, // 允许导入 JSON 文件

    /* 发射 (Emit) */
    "outDir": "./dist", // 输出目录
    "declaration": true, // 生成 .d.ts 文件
    "sourceMap": true, // 生成 source map
    "removeComments": true, // 移除注释

    /* 互操作性 */
    "esModuleInterop": true, // 允许 default 导入 CommonJS 模块
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "skipLibCheck": true // 跳过 .d.ts 文件的类型检查 (加速编译)
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

### 5.2 声明文件 (.d.ts) 详解

`.d.ts` 文件是 TS 的心脏，它为 JS 代码提供类型描述。

#### 5.2.1 全局声明 (Ambient Declarations)

通常在 `global.d.ts` 中定义。

```typescript
// 声明全局变量
declare var __DEV__: boolean;

// 声明图片模块，防止 import png 报错
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}
```

#### 5.2.2 扩展模块 (Module Augmentation)

用于扩展第三方库的类型定义。

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 扩展 id 属性
      role: string;
    } & DefaultSession["user"];
  }
}
```

### 5.3 Monorepo 与 Project References

在大型 Monorepo (如 Turborepo, Nx) 中，Project References 允许我们将项目分割成多个独立的编译单元，极大提升构建速度和 IDE 响应速度。

**packages/shared/tsconfig.json**:

```json
{
  "compilerOptions": {
    "composite": true, // 开启复合项目
    "declaration": true
  }
}
```

**packages/app/tsconfig.json**:

```json
{
  "references": [{ "path": "../shared" }]
}
```

## 6. 实战技巧与最佳实践 (Best Practices)

### 6.1 显式优于隐式

虽然 TS 的类型推断很强大，但在公共 API (函数参数、返回值、组件 Props) 上，**显式声明类型**是最佳实践。这能防止意外的类型改变，并提供更好的文档。

### 6.2 活用 unknown 代替 any

`any` 是逃生舱，`unknown` 是安全的未知类型。

- 接收外部不信任数据（API 响应、用户输入）时，使用 `unknown`。
- 使用 Zod / Joi 等运行时校验库将 `unknown` 转换为具体类型。

### 6.3 标称类型 (Nominal Typing) 模拟

TS 是结构化类型系统，有时我们需要区分结构相同但逻辑不同的类型（如 `USD` 和 `EUR` 都是 number）。

```typescript
type Brand<K, T> = K & { __brand: T };

type USD = Brand<number, "USD">;
type EUR = Brand<number, "EUR">;

const usd = 10 as USD;
const eur = 10 as EUR;

// function pay(amount: USD) { ... }
// pay(eur); // Error: 类型不兼容
```

### 6.4 使用 Zod 进行运行时验证

TypeScript 只在编译时有效。在 Next.js API Routes 或 Server Actions 中，必须进行运行时验证。

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

type User = z.infer<typeof UserSchema>; // 自动推导 TS 类型

function createUser(input: unknown) {
  const result = UserSchema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data; // 类型安全的 User
}
```

### 6.5 避免类型爆炸

过度复杂的递归类型或过大的联合类型会导致 TS 编译器变慢甚至崩溃。

- 避免深层嵌套的条件类型。
- 使用 `interface` 替代 `type` 进行对象定义（interface 缓存性能更好）。

## 7. 高频面试题 (Interview Questions)

### 7.1 `any`, `unknown`, `never`, `void` 的区别？

- **any**: 关闭类型检查，可以说“它是任何东西”。
- **unknown**: 类型安全的 any，可以说“它可能是任何东西，但在检查前不能操作”。
- **never**: 永远不应该出现的值（抛错、死循环）。是所有类型的子类型（Bottom Type）。
- **void**: 没有返回值（通常是 `undefined`）。

### 7.2 `interface` 和 `type` 的核心区别？

- **Interface**: 只能描述对象/函数；支持声明合并（多次声明同名 interface 会合并）；报错信息更友好。
- **Type**: 可以描述任何类型（基本类型、联合、元组）；不支持声明合并；更灵活（映射类型、条件类型）。

### 7.3 什么是协变 (Covariance) 和逆变 (Contravariance)？

这是一个高阶概念，主要体现在函数参数和返回值上。

- **TS 表现**: 对象属性是协变的；函数参数是双向协变（strictFunctionTypes 下是逆变的）；函数返回值是协变的。
- **口诀**: "参数逆变，返回值协变"。
  - 需要一个处理 Animal 的函数，给我一个处理 Dog 的函数是不行的（因为我可能传 Cat 进去）。
  - 需要一个返回 Animal 的函数，给我一个返回 Dog 的函数是可以的（Dog 也是 Animal）。

### 7.4 解释一下 `keyof` 和 `typeof`？

- **keyof**: 获取对象类型的所有键的联合类型。`keyof {a:1, b:2}` -> `"a" | "b"`。
- **typeof**: 获取一个变量或对象的 TS 类型。

### 7.5 如何在运行时获取 TypeScript 的 Interface？

**做不到**。Interface 在编译后就被擦除了。如果需要运行时检查，必须手动写 JS 逻辑或使用 Zod/IO-TS 等库生成 schema。

## 8. 进阶挑战：类型体操 (Type Gymnastics)

"类型体操"是指利用 TypeScript 强大的类型系统，编写复杂的类型逻辑。这不仅是面试加分项，更是深入理解 TS 及其原理的最佳途径。

### 8.1 实现 `MyPick<T, K>`

内置 `Pick` 的实现原理。

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, "title" | "completed">;
// { title: string; completed: boolean; }
```

### 8.2 实现 `MyReadonly<T>`

将所有属性变为只读。

```typescript
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### 8.3 实现 `DeepReadonly<T>` (递归)

递归地将对象及其嵌套对象的属性都变为只读。

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

type X = {
  x: {
    a: 1;
    b: "hi";
  };
  y: "hey";
};

type Expected = DeepReadonly<X>;
// x.a 也是 readonly
```

### 8.4 实现 `TupleToUnion<T>`

将元组转换为联合类型。

```typescript
type TupleToUnion<T extends readonly any[]> = T[number];

type Arr = ["1", "2", "3"];
type Test = TupleToUnion<Arr>; // '1' | '2' | '3'
```

### 8.5 实现 `Chainable` (可链式调用)

这是比较经典的复杂类型推导。

```typescript
type Chainable<T = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<T & { [P in K]: V }>;
  get(): T;
};

declare const config: Chainable;

const result = config
  .option("foo", 123)
  .option("name", "type-challenges")
  .option("bar", { value: "Hello World" })
  .get();

// result 的类型自动推导为:
// {
//   foo: number;
//   name: string;
//   bar: { value: string };
// }
```

## 9. 专题：TypeScript 在 Next.js 中的深度应用

在 Next.js 16 中，TypeScript 的集成已经非常平滑，但仍有一些特定场景需要注意类型定义。

### 9.1 页面组件 Props (`page.tsx`)

Next.js 的页面组件接收 `params` (动态路由参数) 和 `searchParams` (查询参数)。

```typescript
// app/blog/[slug]/page.tsx

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params, searchParams }: PageProps) {
  return <div>My Post: {params.slug}</div>;
}
```

> **注意**: 在 Next.js 15+ 中，`params` 和 `searchParams` 可能是 Promise，需要 `await` (取决于具体配置和版本，Next.js 15 引入了异步请求参数)。在 Next.js 16 中，建议遵循官方最新的异步访问模式。

### 9.2 布局组件 Props (`layout.tsx`)

Layout 必须接收 `children`。

```typescript
// app/dashboard/layout.tsx
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: { id: string }; // 如果 layout 也在动态路由下
}

export default function DashboardLayout({ children }: LayoutProps) {
  return <section>{children}</section>;
}
```

### 9.3 API Route Handlers (`route.ts`)

```typescript
// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  return NextResponse.json({ query }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // 可以在这里结合 Zod 验证 body
  return NextResponse.json({ success: true });
}
```

### 9.4 Server Actions

Server Actions 是 Next.js 的核心特性之一，TS 能很好地推导参数和返回值。

```typescript
"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function createUser(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 数据库操作...
  return {
    message: "User created",
  };
}
```

## 10. 适用场景 (Applicable Scenarios)

### 10.1 推荐场景

- **中大型项目**: 代码量超过几千行，或多人协作。TS 的重构能力和文档属性至关重要。
- **库与框架开发**: 发布 npm 包时，提供类型定义 (`.d.ts`) 能极大地提升使用者体验。
- **长期维护项目**: 随着时间推移，开发者可能会忘记代码细节，TS 提供了安全网。
- **React/Next.js 开发**: 现代 React 生态（包括 Next.js）是 TypeScript First 的，结合紧密。

### 10.2 不推荐场景

- **极简脚本**: 几十行的临时脚本，配置 `tsconfig.json` 可能显得繁琐。
- **快速原型验证**: 如果需要极速验证想法且不在乎后续维护，纯 JS 可能更快（省去类型纠结）。
- **老旧项目迁移**: 如果是一个庞大的、没有测试覆盖的旧 JS 项目，全量迁移 TS 成本极高（但可渐进式迁移）。

---

## 11. 行业对比 (Industry Comparison)

### 11.1 TypeScript vs JavaScript (JSDoc)

JSDoc 也能提供一定的类型检查，但能力有限。

- **JSDoc**: 无需编译，利用注释写类型。适合小型项目或不想引入构建步骤的场景。
- **TypeScript**: 完整的类型系统，支持泛型、映射类型等高级特性，生态更强。

### 11.2 TypeScript vs Flow

Flow 是 Facebook 推出的静态类型检查器。

- **现状**: Flow 市场占有率已大幅下降，大多数新项目（包括 React 官方文档推荐）都选择 TypeScript。

---

## 12. 注意事项 (Precautions)

### 12.1 `any` 的滥用

不要把 TS 写成 "AnyScript"。滥用 `any` 会丧失 TS 的所有优势。如果暂时不知道类型，请使用 `unknown` 或 `TODO` 注释，后续补全。

### 12.2 编译配置

`tsconfig.json` 是 TS 的核心。

- **`strict: true`**: 强烈建议开启，包含 `noImplicitAny`, `strictNullChecks` 等严格检查。
- **`target`**: 根据运行环境设置（如 ES2020）。

### 12.3 第三方库类型

大多数流行库都自带类型定义或在 `@types/` 仓库中提供。如果没有，需要手动编写声明文件 (`.d.ts`)。

---

## 13. 常见问题 (FAQ)

### 13.1 Interface 和 Type 到底选哪个？

官方建议：**优先使用 Interface**，直到你需要用到 Type 的特定功能（如联合类型）。Interface 在报错信息上通常更友好，且支持合并。

### 13.2 什么是 `.d.ts` 文件？

这是**类型声明文件** (Declaration File)。它只包含类型信息，不包含实现代码。它允许 TS 理解非 TS 编写的库（如纯 JS 库）。

### 13.3 为什么我会遇到 `Object is possibly 'null'` 错误？

这是因为开启了 `strictNullChecks`。TS 强制你处理 null/undefined 情况。

- **解决**: 使用可选链 `?.`，或者类型守卫 `if (obj) { ... }`，或者非空断言 `!`（慎用）。

### 13.4 TypeScript 会影响运行时性能吗？

**不会**。TypeScript 的类型检查只发生在编译阶段。编译后的代码就是普通的 JavaScript，运行时没有类型检查的开销。

---

## 14. 总结 (Summary)

### 14.1 核心要点回顾

TypeScript 已经成为现代前端开发的**事实标准**。它通过**静态类型系统**解决了 JavaScript 动态弱类型带来的维护难题。掌握 **Interface**、**Generics** 和 **Utility Types** 是编写健壮 TS 代码的关键。

### 14.2 学习建议

- **从 Any 到 Strict**: 刚开始可以适当宽松，但应尽快开启严格模式。
- **学会看报错**: TS 的报错信息虽然长，但通常非常精准，学会阅读类型错误是必备技能。
- **理解结构化类型 (Structural Typing)**: TS 是基于形状（Duck Typing）兼容的，而不是基于名义（Nominal Typing）。
- **实践**: 在 Next.js 项目中，尝试把所有组件 Props、API 响应都加上类型定义。

---

> 关键版本记录：
>
> - v2.0: 引入 strictNullChecks (里程碑)
> - v3.0: 引入 unknown, Project References
> - v4.0: Variadic Tuple Types
> - v5.0: Decorators 标准化, 性能优化

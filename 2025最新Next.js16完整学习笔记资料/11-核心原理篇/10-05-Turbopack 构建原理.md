**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Turbopack 构建原理

## 1. 架构总览

### 1.1 Turbopack 简介

Turbopack 是 Next.js 16 的新一代构建工具,使用 Rust 编写,专为 JavaScript 和 TypeScript 应用设计。它的目标是取代 Webpack,提供更快的构建速度和更好的开发体验。

**核心特点**:

- 使用 Rust 编写,性能极高
- 增量计算架构,只重新构建变化的部分
- 原生支持 TypeScript 和 JSX
- 内置代码分割和懒加载
- 支持热模块替换(HMR)

### 1.2 架构设计

Turbopack 采用了全新的架构设计,与传统的打包工具有本质区别。

**架构层次**:

```
┌─────────────────────────────────────────┐
│         应用层 (Next.js)                │
├─────────────────────────────────────────┤
│         Turbopack API                   │
├─────────────────────────────────────────┤
│         任务图引擎                       │
│    (Incremental Computation)            │
├─────────────────────────────────────────┤
│         文件系统抽象层                   │
├─────────────────────────────────────────┤
│         底层 I/O (Rust)                 │
└─────────────────────────────────────────┘
```

**核心组件**:

1. **任务图引擎**: 管理所有构建任务的依赖关系
2. **增量计算**: 只重新计算变化的部分
3. **缓存系统**: 持久化构建结果
4. **模块解析器**: 解析模块依赖
5. **转换器**: 处理各种文件类型

### 1.3 与 Webpack 的对比

| 特性       | Turbopack    | Webpack        |
| :--------- | :----------- | :------------- |
| 编写语言   | Rust         | JavaScript     |
| 启动速度   | 极快(< 1 秒) | 慢(5-30 秒)    |
| HMR 速度   | 极快(< 10ms) | 慢(100-1000ms) |
| 内存占用   | 低           | 高             |
| 增量构建   | 原生支持     | 需要配置       |
| 缓存策略   | 自动持久化   | 需要配置       |
| 配置复杂度 | 低           | 高             |

## 2. 核心流程解析

### 2.1 增量计算引擎

Turbopack 的核心是增量计算引擎,它能够追踪所有任务的依赖关系,并只重新执行受影响的任务。

**任务图结构**:

```typescript
// 任务图的概念模型

interface Task<T> {
  id: string;
  execute: () => Promise<T>;
  dependencies: Task<any>[];
  cache?: T;
  dirty: boolean;
}

class TaskGraph {
  private tasks = new Map<string, Task<any>>();
  private executionOrder: string[] = [];

  addTask<T>(task: Task<T>): void {
    this.tasks.set(task.id, task);
    this.updateExecutionOrder();
  }

  async execute<T>(taskId: string): Promise<T> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // 检查缓存
    if (!task.dirty && task.cache !== undefined) {
      return task.cache;
    }

    // 先执行依赖
    for (const dep of task.dependencies) {
      await this.execute(dep.id);
    }

    // 执行任务
    const result = await task.execute();

    // 更新缓存
    task.cache = result;
    task.dirty = false;

    return result;
  }

  markDirty(taskId: string): void {
    const task = this.tasks.get(taskId);

    if (!task || task.dirty) {
      return;
    }

    task.dirty = true;

    // 标记所有依赖此任务的任务为脏
    for (const [id, t] of this.tasks) {
      if (t.dependencies.some((dep) => dep.id === taskId)) {
        this.markDirty(id);
      }
    }
  }

  private updateExecutionOrder(): void {
    // 拓扑排序
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (taskId: string) => {
      if (visited.has(taskId)) {
        return;
      }

      visited.add(taskId);

      const task = this.tasks.get(taskId);
      if (task) {
        for (const dep of task.dependencies) {
          visit(dep.id);
        }

        order.push(taskId);
      }
    };

    for (const taskId of this.tasks.keys()) {
      visit(taskId);
    }

    this.executionOrder = order;
  }
}
```

**实际应用示例**:

```typescript
// Turbopack 中的任务示例

// 任务 1: 读取文件
const readFileTask: Task<string> = {
  id: "read:app/page.tsx",
  execute: async () => {
    return await fs.readFile("app/page.tsx", "utf-8");
  },
  dependencies: [],
  dirty: true,
};

// 任务 2: 解析 TypeScript
const parseTask: Task<AST> = {
  id: "parse:app/page.tsx",
  execute: async () => {
    const content = await taskGraph.execute("read:app/page.tsx");
    return parseTypeScript(content);
  },
  dependencies: [readFileTask],
  dirty: true,
};

// 任务 3: 转换为 JavaScript
const transformTask: Task<string> = {
  id: "transform:app/page.tsx",
  execute: async () => {
    const ast = await taskGraph.execute("parse:app/page.tsx");
    return transformToJS(ast);
  },
  dependencies: [parseTask],
  dirty: true,
};

// 当文件变化时,只需要标记 readFileTask 为脏
// 其他依赖它的任务会自动被标记为脏并重新执行
taskGraph.markDirty("read:app/page.tsx");
```

### 2.2 模块解析

Turbopack 使用高效的模块解析算法,支持各种模块系统。

**解析器实现**:

```rust
// Rust 代码示例(简化版)

pub struct ModuleResolver {
    cache: HashMap<String, ResolvedModule>,
    aliases: HashMap<String, String>,
}

impl ModuleResolver {
    pub fn resolve(&mut self, specifier: &str, from: &Path) -> Result<ResolvedModule> {
        // 检查缓存
        let cache_key = format!("{}:{}", from.display(), specifier);
        if let Some(cached) = self.cache.get(&cache_key) {
            return Ok(cached.clone());
        }

        // 解析模块
        let resolved = self.resolve_internal(specifier, from)?;

        // 存入缓存
        self.cache.insert(cache_key, resolved.clone());

        Ok(resolved)
    }

    fn resolve_internal(&self, specifier: &str, from: &Path) -> Result<ResolvedModule> {
        // 1. 检查别名
        if let Some(aliased) = self.aliases.get(specifier) {
            return self.resolve_internal(aliased, from);
        }

        // 2. 相对路径
        if specifier.starts_with("./") || specifier.starts_with("../") {
            return self.resolve_relative(specifier, from);
        }

        // 3. 绝对路径
        if specifier.starts_with("/") {
            return self.resolve_absolute(specifier);
        }

        // 4. node_modules
        return self.resolve_node_modules(specifier, from);
    }

    fn resolve_relative(&self, specifier: &str, from: &Path) -> Result<ResolvedModule> {
        let base_dir = from.parent().unwrap();
        let target = base_dir.join(specifier);

        // 尝试不同的扩展名
        for ext in &[".ts", ".tsx", ".js", ".jsx", ".json"] {
            let with_ext = target.with_extension(ext);
            if with_ext.exists() {
                return Ok(ResolvedModule {
                    path: with_ext,
                    module_type: ModuleType::from_extension(ext),
                });
            }
        }

        // 尝试 index 文件
        for ext in &[".ts", ".tsx", ".js", ".jsx"] {
            let index = target.join(format!("index{}", ext));
            if index.exists() {
                return Ok(ResolvedModule {
                    path: index,
                    module_type: ModuleType::from_extension(ext),
                });
            }
        }

        Err(Error::ModuleNotFound(specifier.to_string()))
    }
}
```

**TypeScript 版本的解析逻辑**:

```typescript
// 模块解析器的 TypeScript 实现

interface ResolveOptions {
  extensions: string[];
  alias: Record<string, string>;
  baseUrl?: string;
  paths?: Record<string, string[]>;
}

class ModuleResolver {
  private cache = new Map<string, string>();
  private options: ResolveOptions;

  constructor(options: ResolveOptions) {
    this.options = options;
  }

  resolve(specifier: string, from: string): string {
    const cacheKey = `${from}:${specifier}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const resolved = this.resolveInternal(specifier, from);
    this.cache.set(cacheKey, resolved);

    return resolved;
  }

  private resolveInternal(specifier: string, from: string): string {
    // 1. 检查别名
    for (const [alias, target] of Object.entries(this.options.alias)) {
      if (specifier === alias || specifier.startsWith(alias + "/")) {
        const replaced = specifier.replace(alias, target);
        return this.resolveInternal(replaced, from);
      }
    }

    // 2. 检查 paths 配置
    if (this.options.paths) {
      for (const [pattern, targets] of Object.entries(this.options.paths)) {
        const regex = new RegExp("^" + pattern.replace("*", "(.*)") + "$");
        const match = specifier.match(regex);

        if (match) {
          for (const target of targets) {
            const replaced = target.replace("*", match[1]);
            const resolved = this.tryResolve(
              replaced,
              this.options.baseUrl || ""
            );

            if (resolved) {
              return resolved;
            }
          }
        }
      }
    }

    // 3. 相对路径
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const baseDir = path.dirname(from);
      return this.tryResolve(specifier, baseDir)!;
    }

    // 4. node_modules
    return this.resolveNodeModules(specifier, from);
  }

  private tryResolve(specifier: string, baseDir: string): string | null {
    const fullPath = path.join(baseDir, specifier);

    // 尝试直接路径
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }

    // 尝试添加扩展名
    for (const ext of this.options.extensions) {
      const withExt = fullPath + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }

    // 尝试 index 文件
    for (const ext of this.options.extensions) {
      const indexPath = path.join(fullPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  private resolveNodeModules(specifier: string, from: string): string {
    let currentDir = path.dirname(from);

    while (true) {
      const nodeModulesDir = path.join(currentDir, "node_modules");
      const resolved = this.tryResolve(specifier, nodeModulesDir);

      if (resolved) {
        return resolved;
      }

      const parentDir = path.dirname(currentDir);

      if (parentDir === currentDir) {
        throw new Error(`Cannot resolve module: ${specifier}`);
      }

      currentDir = parentDir;
    }
  }
}
```

### 2.3 文件转换

Turbopack 支持多种文件类型的转换,包括 TypeScript、JSX、CSS 等。

**转换器架构**:

```typescript
// 转换器接口

interface Transformer {
  name: string;
  test: (filename: string) => boolean;
  transform: (content: string, filename: string) => Promise<TransformResult>;
}

interface TransformResult {
  code: string;
  map?: SourceMap;
  dependencies?: string[];
}

class TransformPipeline {
  private transformers: Transformer[] = [];

  register(transformer: Transformer): void {
    this.transformers.push(transformer);
  }

  async transform(filename: string, content: string): Promise<TransformResult> {
    let result: TransformResult = { code: content };

    for (const transformer of this.transformers) {
      if (transformer.test(filename)) {
        result = await transformer.transform(result.code, filename);
      }
    }

    return result;
  }
}
```

**TypeScript 转换器**:

```typescript
// TypeScript 转换器实现

import * as ts from "typescript";

const typescriptTransformer: Transformer = {
  name: "typescript",
  test: (filename) => /\.(ts|tsx)$/.test(filename),

  async transform(content: string, filename: string): Promise<TransformResult> {
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      sourceMap: true,
    };

    const result = ts.transpileModule(content, {
      compilerOptions,
      fileName: filename,
    });

    // 提取依赖
    const dependencies: string[] = [];
    const sourceFile = ts.createSourceFile(
      filename,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          dependencies.push(moduleSpecifier.text);
        }
      }
    });

    return {
      code: result.outputText,
      map: result.sourceMapText ? JSON.parse(result.sourceMapText) : undefined,
      dependencies,
    };
  },
};
```

**JSX 转换器**:

```typescript
// JSX 转换器

import { transform } from "@babel/core";
import reactPreset from "@babel/preset-react";

const jsxTransformer: Transformer = {
  name: "jsx",
  test: (filename) => /\.(jsx|tsx)$/.test(filename),

  async transform(content: string, filename: string): Promise<TransformResult> {
    const result = await transform(content, {
      filename,
      presets: [
        [
          reactPreset,
          {
            runtime: "automatic", // 使用新的 JSX 转换
            development: process.env.NODE_ENV === "development",
          },
        ],
      ],
      sourceMaps: true,
    });

    if (!result || !result.code) {
      throw new Error(`Failed to transform ${filename}`);
    }

    return {
      code: result.code,
      map: result.map,
      dependencies: [], // Babel 不提供依赖信息
    };
  },
};
```

**CSS 转换器**:

```typescript
// CSS 转换器

import postcss from "postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const cssTransformer: Transformer = {
  name: "css",
  test: (filename) => /\.css$/.test(filename),

  async transform(content: string, filename: string): Promise<TransformResult> {
    const plugins = [autoprefixer()];

    if (process.env.NODE_ENV === "production") {
      plugins.push(cssnano());
    }

    const result = await postcss(plugins).process(content, {
      from: filename,
      map: { inline: false },
    });

    // 提取 @import 依赖
    const dependencies: string[] = [];
    const importRegex = /@import\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return {
      code: result.css,
      map: result.map?.toJSON(),
      dependencies,
    };
  },
};
```

### 2.4 热模块替换(HMR)

Turbopack 的 HMR 实现非常快,通常在 10ms 以内完成更新。

**HMR 架构**:

```typescript
// HMR 服务器实现

class HMRServer {
  private clients = new Set<WebSocket>();
  private moduleGraph = new ModuleGraph();

  constructor(private watcher: FileWatcher) {
    this.setupWatcher();
  }

  private setupWatcher(): void {
    this.watcher.on("change", async (filename) => {
      console.log(`[HMR] File changed: ${filename}`);

      const startTime = Date.now();

      // 1. 找到受影响的模块
      const affectedModules = this.moduleGraph.getAffectedModules(filename);

      // 2. 重新构建受影响的模块
      const updates = await this.rebuildModules(affectedModules);

      // 3. 发送更新到客户端
      this.broadcast({
        type: "update",
        updates,
      });

      const duration = Date.now() - startTime;
      console.log(`[HMR] Update sent in ${duration}ms`);
    });
  }

  private async rebuildModules(modules: Set<string>): Promise<Update[]> {
    const updates: Update[] = [];

    for (const modulePath of modules) {
      try {
        // 重新构建模块
        const result = await buildModule(modulePath);

        updates.push({
          type: "js-update",
          path: modulePath,
          code: result.code,
          timestamp: Date.now(),
        });
      } catch (error) {
        updates.push({
          type: "error",
          path: modulePath,
          error: error.message,
        });
      }
    }

    return updates;
  }

  addClient(ws: WebSocket): void {
    this.clients.add(ws);

    ws.on("close", () => {
      this.clients.delete(ws);
    });
  }

  private broadcast(message: any): void {
    const data = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }
}
```

**客户端 HMR 运行时**:

```typescript
// 客户端 HMR 运行时

class HMRClient {
  private ws: WebSocket;
  private modules = new Map<string, Module>();

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "update":
          this.handleUpdate(message.updates);
          break;

        case "error":
          this.handleError(message.error);
          break;
      }
    };

    this.ws.onclose = () => {
      console.log("[HMR] Connection closed, reloading...");
      setTimeout(() => location.reload(), 1000);
    };
  }

  private async handleUpdate(updates: Update[]): Promise<void> {
    for (const update of updates) {
      if (update.type === "js-update") {
        await this.applyJSUpdate(update);
      } else if (update.type === "css-update") {
        await this.applyCSSUpdate(update);
      }
    }
  }

  private async applyJSUpdate(update: JSUpdate): Promise<void> {
    const module = this.modules.get(update.path);

    if (!module) {
      console.log(`[HMR] New module: ${update.path}`);
      return;
    }

    // 检查模块是否可以热更新
    if (!module.hot) {
      console.log(`[HMR] Module not hot-reloadable: ${update.path}`);
      location.reload();
      return;
    }

    // 执行新代码
    const newModule = this.executeModule(update.code, update.path);

    // 调用 accept 回调
    if (module.hot.acceptCallbacks) {
      for (const callback of module.hot.acceptCallbacks) {
        try {
          callback(newModule);
        } catch (error) {
          console.error("[HMR] Error in accept callback:", error);
        }
      }
    }

    // 更新模块
    this.modules.set(update.path, newModule);
  }

  private executeModule(code: string, path: string): Module {
    const module: Module = {
      exports: {},
      hot: {
        accept: (callback) => {
          if (!module.hot!.acceptCallbacks) {
            module.hot!.acceptCallbacks = [];
          }
          module.hot!.acceptCallbacks.push(callback);
        },
        dispose: (callback) => {
          if (!module.hot!.disposeCallbacks) {
            module.hot!.disposeCallbacks = [];
          }
          module.hot!.disposeCallbacks.push(callback);
        },
      },
    };

    // 创建模块函数
    const moduleFunction = new Function("module", "exports", "require", code);

    // 执行模块
    moduleFunction(module, module.exports, (id: string) => {
      return this.modules.get(id)?.exports;
    });

    return module;
  }

  private applyCSSUpdate(update: CSSUpdate): void {
    const link = document.querySelector(`link[href="${update.path}"]`);

    if (link) {
      // 更新 href 以触发重新加载
      const newHref = `${update.path}?t=${update.timestamp}`;
      link.setAttribute("href", newHref);
    }
  }

  private handleError(error: string): void {
    console.error("[HMR] Error:", error);

    // 显示错误覆盖层
    this.showErrorOverlay(error);
  }

  private showErrorOverlay(error: string): void {
    const overlay = document.createElement("div");
    overlay.id = "hmr-error-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      color: #ff5555;
      padding: 20px;
      font-family: monospace;
      z-index: 999999;
      overflow: auto;
    `;
    overlay.innerHTML = `
      <h1>Build Error</h1>
      <pre>${error}</pre>
      <button onclick="this.parentElement.remove()">Close</button>
    `;

    document.body.appendChild(overlay);
  }
}

// 初始化 HMR 客户端
if (process.env.NODE_ENV === "development") {
  new HMRClient("ws://localhost:3000/__hmr");
}
```

## 3. 关键模块源码分析

### 3.1 缓存系统

Turbopack 使用持久化缓存来加速重复构建。

**缓存实现**:

```rust
// Rust 缓存实现

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct CacheEntry {
    pub content_hash: String,
    pub output: Vec<u8>,
    pub dependencies: Vec<String>,
    pub timestamp: u64,
}

pub struct PersistentCache {
    cache_dir: PathBuf,
    memory_cache: HashMap<String, CacheEntry>,
}

impl PersistentCache {
    pub fn new(cache_dir: PathBuf) -> Self {
        fs::create_dir_all(&cache_dir).ok();

        Self {
            cache_dir,
            memory_cache: HashMap::new(),
        }
    }

    pub fn get(&mut self, key: &str) -> Option<CacheEntry> {
        // 先检查内存缓存
        if let Some(entry) = self.memory_cache.get(key) {
            return Some(entry.clone());
        }

        // 检查磁盘缓存
        let cache_file = self.cache_dir.join(format!("{}.cache", key));

        if let Ok(data) = fs::read(&cache_file) {
            if let Ok(entry) = bincode::deserialize::<CacheEntry>(&data) {
                self.memory_cache.insert(key.to_string(), entry.clone());
                return Some(entry);
            }
        }

        None
    }

    pub fn set(&mut self, key: &str, entry: CacheEntry) {
        // 存入内存缓存
        self.memory_cache.insert(key.to_string(), entry.clone());

        // 存入磁盘缓存
        let cache_file = self.cache_dir.join(format!("{}.cache", key));

        if let Ok(data) = bincode::serialize(&entry) {
            fs::write(&cache_file, data).ok();
        }
    }

    pub fn invalidate(&mut self, key: &str) {
        self.memory_cache.remove(key);

        let cache_file = self.cache_dir.join(format!("{}.cache", key));
        fs::remove_file(&cache_file).ok();
    }
}
```

**内容哈希计算**:

```typescript
// 计算文件内容哈希

import crypto from "crypto";

function computeContentHash(content: string | Buffer): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function computeFileHash(filename: string): string {
  const content = fs.readFileSync(filename);
  return computeContentHash(content);
}

// 计算依赖树哈希
function computeDependencyHash(
  filename: string,
  visited = new Set<string>()
): string {
  if (visited.has(filename)) {
    return "";
  }

  visited.add(filename);

  const fileHash = computeFileHash(filename);
  const dependencies = getDependencies(filename);

  const depHashes = dependencies
    .map((dep) => computeDependencyHash(dep, visited))
    .filter((h) => h !== "")
    .sort()
    .join("");

  return computeContentHash(fileHash + depHashes);
}
```

### 3.2 代码分割

Turbopack 自动进行代码分割,优化加载性能。

**分割策略**:

```typescript
// 代码分割策略

interface ChunkGroup {
  id: string;
  modules: Set<string>;
  size: number;
  priority: number;
}

class CodeSplitter {
  private chunks = new Map<string, ChunkGroup>();
  private moduleGraph: ModuleGraph;

  constructor(moduleGraph: ModuleGraph) {
    this.moduleGraph = moduleGraph;
  }

  split(): Map<string, ChunkGroup> {
    // 1. 创建入口 chunk
    this.createEntryChunks();

    // 2. 提取共享模块
    this.extractSharedModules();

    // 3. 优化 chunk 大小
    this.optimizeChunkSizes();

    return this.chunks;
  }

  private createEntryChunks(): void {
    for (const entry of this.moduleGraph.getEntries()) {
      const chunk: ChunkGroup = {
        id: `entry-${entry}`,
        modules: new Set([entry]),
        size: 0,
        priority: 100,
      };

      // 添加所有依赖
      this.addDependencies(chunk, entry);

      this.chunks.set(chunk.id, chunk);
    }
  }

  private addDependencies(chunk: ChunkGroup, modulePath: string): void {
    const deps = this.moduleGraph.getDependencies(modulePath);

    for (const dep of deps) {
      if (!chunk.modules.has(dep)) {
        chunk.modules.add(dep);
        chunk.size += this.getModuleSize(dep);

        // 递归添加依赖
        this.addDependencies(chunk, dep);
      }
    }
  }

  private extractSharedModules(): void {
    // 找到被多个 chunk 使用的模块
    const moduleUsage = new Map<string, Set<string>>();

    for (const [chunkId, chunk] of this.chunks) {
      for (const modulePath of chunk.modules) {
        if (!moduleUsage.has(modulePath)) {
          moduleUsage.set(modulePath, new Set());
        }
        moduleUsage.get(modulePath)!.add(chunkId);
      }
    }

    // 创建共享 chunk
    const sharedModules = new Set<string>();

    for (const [modulePath, chunks] of moduleUsage) {
      if (chunks.size > 1) {
        sharedModules.add(modulePath);
      }
    }

    if (sharedModules.size > 0) {
      const sharedChunk: ChunkGroup = {
        id: "shared",
        modules: sharedModules,
        size: 0,
        priority: 50,
      };

      for (const modulePath of sharedModules) {
        sharedChunk.size += this.getModuleSize(modulePath);

        // 从其他 chunk 中移除
        for (const chunk of this.chunks.values()) {
          chunk.modules.delete(modulePath);
        }
      }

      this.chunks.set(sharedChunk.id, sharedChunk);
    }
  }

  private optimizeChunkSizes(): void {
    const maxChunkSize = 250 * 1024; // 250KB
    const minChunkSize = 20 * 1024; // 20KB

    for (const [chunkId, chunk] of this.chunks) {
      if (chunk.size > maxChunkSize) {
        // 分割大 chunk
        this.splitLargeChunk(chunkId, chunk);
      } else if (chunk.size < minChunkSize && chunk.priority < 100) {
        // 合并小 chunk
        this.mergeSmallChunk(chunkId, chunk);
      }
    }
  }

  private splitLargeChunk(chunkId: string, chunk: ChunkGroup): void {
    const modules = Array.from(chunk.modules);
    const midpoint = Math.floor(modules.length / 2);

    const chunk1Modules = new Set(modules.slice(0, midpoint));
    const chunk2Modules = new Set(modules.slice(midpoint));

    const chunk1: ChunkGroup = {
      id: `${chunkId}-1`,
      modules: chunk1Modules,
      size: 0,
      priority: chunk.priority,
    };

    const chunk2: ChunkGroup = {
      id: `${chunkId}-2`,
      modules: chunk2Modules,
      size: 0,
      priority: chunk.priority,
    };

    for (const modulePath of chunk1Modules) {
      chunk1.size += this.getModuleSize(modulePath);
    }

    for (const modulePath of chunk2Modules) {
      chunk2.size += this.getModuleSize(modulePath);
    }

    this.chunks.delete(chunkId);
    this.chunks.set(chunk1.id, chunk1);
    this.chunks.set(chunk2.id, chunk2);
  }

  private mergeSmallChunk(chunkId: string, chunk: ChunkGroup): void {
    // 找到最合适的 chunk 进行合并
    let bestChunk: ChunkGroup | null = null;
    let bestScore = -1;

    for (const [otherId, otherChunk] of this.chunks) {
      if (otherId === chunkId) continue;

      // 计算合并得分(共享模块越多得分越高)
      let sharedCount = 0;
      for (const modulePath of chunk.modules) {
        if (otherChunk.modules.has(modulePath)) {
          sharedCount++;
        }
      }

      if (sharedCount > bestScore) {
        bestScore = sharedCount;
        bestChunk = otherChunk;
      }
    }

    if (bestChunk) {
      // 合并到最佳 chunk
      for (const modulePath of chunk.modules) {
        bestChunk.modules.add(modulePath);
        bestChunk.size += this.getModuleSize(modulePath);
      }

      this.chunks.delete(chunkId);
    }
  }

  private getModuleSize(modulePath: string): number {
    const stats = fs.statSync(modulePath);
    return stats.size;
  }
}
```

### 3.3 Tree Shaking

Turbopack 实现了高效的 tree shaking,移除未使用的代码。

**Tree Shaking 实现**:

```typescript
// Tree Shaking 分析器

interface ExportInfo {
  name: string;
  used: boolean;
  usedBy: Set<string>;
}

class TreeShaker {
  private exports = new Map<string, Map<string, ExportInfo>>();
  private moduleGraph: ModuleGraph;

  constructor(moduleGraph: ModuleGraph) {
    this.moduleGraph = moduleGraph;
  }

  analyze(): void {
    // 1. 收集所有导出
    this.collectExports();

    // 2. 标记使用的导出
    this.markUsedExports();

    // 3. 移除未使用的导出
    this.removeUnusedExports();
  }

  private collectExports(): void {
    for (const modulePath of this.moduleGraph.getAllModules()) {
      const ast = parseModule(modulePath);
      const exports = new Map<string, ExportInfo>();

      // 遍历 AST 找到所有导出
      traverse(ast, {
        ExportNamedDeclaration(path) {
          if (path.node.declaration) {
            // export const foo = ...
            const declarations = path.node.declaration.declarations;
            for (const decl of declarations) {
              exports.set(decl.id.name, {
                name: decl.id.name,
                used: false,
                usedBy: new Set(),
              });
            }
          } else if (path.node.specifiers) {
            // export { foo, bar }
            for (const spec of path.node.specifiers) {
              exports.set(spec.exported.name, {
                name: spec.exported.name,
                used: false,
                usedBy: new Set(),
              });
            }
          }
        },

        ExportDefaultDeclaration(path) {
          exports.set("default", {
            name: "default",
            used: false,
            usedBy: new Set(),
          });
        },
      });

      this.exports.set(modulePath, exports);
    }
  }

  private markUsedExports(): void {
    // 从入口开始标记
    for (const entry of this.moduleGraph.getEntries()) {
      this.markModuleExports(entry, new Set());
    }
  }

  private markModuleExports(modulePath: string, visited: Set<string>): void {
    if (visited.has(modulePath)) {
      return;
    }

    visited.add(modulePath);

    const ast = parseModule(modulePath);

    // 遍历 AST 找到所有导入
    traverse(ast, {
      ImportDeclaration: (path) => {
        const source = path.node.source.value;
        const resolvedPath = this.moduleGraph.resolve(source, modulePath);

        const moduleExports = this.exports.get(resolvedPath);
        if (!moduleExports) return;

        for (const spec of path.node.specifiers) {
          let exportName: string;

          if (spec.type === "ImportDefaultSpecifier") {
            exportName = "default";
          } else if (spec.type === "ImportNamespaceSpecifier") {
            // import * as foo - 标记所有导出为已使用
            for (const exp of moduleExports.values()) {
              exp.used = true;
              exp.usedBy.add(modulePath);
            }
            continue;
          } else {
            exportName = spec.imported.name;
          }

          const exportInfo = moduleExports.get(exportName);
          if (exportInfo) {
            exportInfo.used = true;
            exportInfo.usedBy.add(modulePath);
          }
        }

        // 递归标记依赖
        this.markModuleExports(resolvedPath, visited);
      },
    });
  }

  private removeUnusedExports(): void {
    for (const [modulePath, exports] of this.exports) {
      const unusedExports = Array.from(exports.values()).filter(
        (exp) => !exp.used
      );

      if (unusedExports.length === 0) continue;

      console.log(
        `[Tree Shaking] Removing ${unusedExports.length} unused exports from ${modulePath}`
      );

      // 修改 AST 移除未使用的导出
      const ast = parseModule(modulePath);

      traverse(ast, {
        ExportNamedDeclaration(path) {
          if (path.node.declaration) {
            const declarations = path.node.declaration.declarations.filter(
              (decl) => {
                const exportInfo = exports.get(decl.id.name);
                return exportInfo && exportInfo.used;
              }
            );

            if (declarations.length === 0) {
              path.remove();
            } else {
              path.node.declaration.declarations = declarations;
            }
          }
        },
      });

      // 保存修改后的代码
      const code = generate(ast);
      fs.writeFileSync(modulePath, code);
    }
  }
}
```

## 4. 适用场景与局限

### 4.1 适用场景

Turbopack 特别适合以下场景:

1. **大型项目**: 模块数量超过 1000 个的项目
2. **开发环境**: 需要快速 HMR 的开发场景
3. **TypeScript 项目**: 原生支持 TypeScript
4. **Monorepo**: 多包项目的构建

### 4.2 性能对比

| 指标     | Turbopack | Webpack   | Vite      |
| :------- | :-------- | :-------- | :-------- |
| 冷启动   | 0.5-2 秒  | 10-30 秒  | 1-5 秒    |
| HMR      | 5-10ms    | 100-500ms | 20-100ms  |
| 生产构建 | 30-60 秒  | 2-10 分钟 | 1-3 分钟  |
| 内存占用 | 200-500MB | 1-3GB     | 300-800MB |

### 4.3 局限性

1. **生态系统**: 插件生态还不够完善
2. **稳定性**: 仍在快速迭代中
3. **配置**: 配置选项相对较少
4. **兼容性**: 某些 Webpack 插件无法直接迁移

## 5. 注意事项

### 5.1 迁移注意事项

从 Webpack 迁移到 Turbopack 需要注意:

```typescript
// Webpack 配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};

// Turbopack 不需要这些配置
// CSS 处理是内置的
```

### 5.2 性能优化建议

1. 使用持久化缓存
2. 合理配置代码分割
3. 启用 tree shaking
4. 优化依赖导入

## 6. 常见问题

**问题一: Turbopack 比 Webpack 快多少?**

根据官方测试,Turbopack 在大型项目中:

- 冷启动快 10-20 倍
- HMR 快 10-100 倍
- 内存占用减少 50-70%

**问题二: 如何启用 Turbopack?**

```bash
# Next.js 16 中启用
next dev --turbo

# 或在 package.json 中配置
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

**问题三: Turbopack 支持哪些文件类型?**

Turbopack 原生支持:

- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- CSS (.css)
- JSON (.json)
- 图片 (.png, .jpg, .svg)
- 字体文件

## 7. 总结

Turbopack 代表了构建工具的未来方向,通过 Rust 的性能优势和创新的增量计算架构,为大型 JavaScript 项目提供了前所未有的构建速度。虽然目前还在快速发展中,但已经展现出巨大的潜力。

核心优势:

1. 极快的构建速度
2. 低内存占用
3. 原生 TypeScript 支持
4. 自动优化

未来展望:

1. 更完善的插件系统
2. 更好的 Webpack 兼容性
3. 更多的优化选项
4. 更稳定的生产构建

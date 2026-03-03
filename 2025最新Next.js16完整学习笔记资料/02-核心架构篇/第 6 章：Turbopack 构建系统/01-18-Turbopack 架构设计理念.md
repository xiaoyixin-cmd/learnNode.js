**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Turbopack 架构设计理念

## 概述

Turbopack 的架构设计代表了现代构建工具的演进方向,它采用全新的理念来解决传统构建工具的性能瓶颈。作为 Webpack 创始人 Tobias Koppers 的新作,Turbopack 从底层重新思考了构建工具的架构,引入了增量计算、函数级缓存和统一图等创新概念。理解 Turbopack 的架构设计理念,对于充分发挥其性能优势至关重要。

### Turbopack 的设计目标

Turbopack 的架构围绕以下核心目标设计:

- **极致性能**:通过 Rust 和增量计算实现极快的构建速度
- **可扩展性**:支持大型应用的高效构建
- **简单易用**:开箱即用,减少配置复杂度
- **开发体验**:提供最快的热更新和启动时间
- **生产优化**:支持高效的代码分割和优化

### 核心价值

1. **增量计算**:只处理变化的部分,避免重复计算
2. **函数级缓存**:细粒度的缓存提高复用率
3. **并行处理**:充分利用多核 CPU 的能力
4. **统一架构**:单一依赖图管理所有环境
5. **懒加载**:只编译实际需要的代码

## 第一部分:核心架构组件

### 1.1 Turbo 引擎

**Turbo 引擎概述**

```rust
// Turbo 引擎: 增量计算框架的核心
// 基于 Rust 实现,提供函数级缓存和依赖追踪

pub struct TurboEngine {
    // 函数调用缓存
    cache: HashMap<FunctionId, CachedResult>,

    // 依赖关系图
    dependency_graph: DependencyGraph,

    // 文件系统监听
    file_watcher: FileWatcher,
}

impl TurboEngine {
    // 核心: 记忆化函数调用
    pub async fn memoize<F, T>(
        &mut self,
        func: F,
        inputs: &[Input],
    ) -> T
    where
        F: Fn() -> Future<Output = T>,
    {
        // 1. 计算缓存键
        let cache_key = self.compute_cache_key(inputs);

        // 2. 检查缓存
        if let Some(cached) = self.cache.get(&cache_key) {
            if !self.has_dependency_changed(cached) {
                return cached.result.clone();
            }
        }

        // 3. 执行函数并缓存结果
        let result = func().await;
        self.cache_result(cache_key, result.clone(), inputs);

        result
    }

    // 自动追踪依赖
    fn track_dependency(&mut self, from: NodeId, to: NodeId) {
        self.dependency_graph.add_edge(from, to);
    }

    // 失效缓存
    pub fn invalidate(&mut self, file: &Path) {
        // 找到所有依赖此文件的函数
        let affected = self.dependency_graph
            .find_dependents(file);

        // 递归失效所有受影响的缓存
        for node in affected {
            self.cache.remove(&node);
        }
    }
}
```

**Turbo 引擎工作流程**

```typescript
// TypeScript 伪代码展示工作流程

class TurboEngineWorkflow {
  // 1. 文件变更检测
  async onFileChange(file: string) {
    console.log(`文件变更: ${file}`);

    // 2. 失效相关缓存
    this.invalidateCache(file);

    // 3. 触发重新计算
    await this.recompute();
  }

  // 2. 缓存失效
  private invalidateCache(file: string) {
    // 自动追踪依赖关系
    const affectedFunctions = this.findDependentFunctions(file);

    console.log(`失效 ${affectedFunctions.length} 个函数缓存`);

    // 移除缓存
    affectedFunctions.forEach((fn) => {
      this.cache.delete(fn.id);
    });
  }

  // 3. 增量重新计算
  private async recompute() {
    // 只重新执行缓存已失效的函数
    // 其他函数直接使用缓存结果
    const result = await this.executeWithCache();

    return result;
  }
}
```

### 1.2 统一依赖图

**统一图架构**

```typescript
// Turbopack 统一依赖图设计

interface UnifiedGraph {
  // 所有模块节点
  modules: Map<string, ModuleNode>;

  // 所有依赖边
  edges: Map<string, Set<string>>;

  // 输出环境
  environments: {
    client: OutputEnvironment;
    server: OutputEnvironment;
    edge: OutputEnvironment;
  };
}

class DependencyGraph {
  private graph: UnifiedGraph;

  // 添加模块
  addModule(path: string, type: ModuleType) {
    const node: ModuleNode = {
      path,
      type,
      dependencies: new Set(),
      dependents: new Set(),
      hash: this.computeHash(path),
    };

    this.graph.modules.set(path, node);
  }

  // 添加依赖关系
  addDependency(from: string, to: string) {
    // 双向关系
    this.graph.modules.get(from)?.dependencies.add(to);
    this.graph.modules.get(to)?.dependents.add(from);

    // 添加边
    if (!this.graph.edges.has(from)) {
      this.graph.edges.set(from, new Set());
    }
    this.graph.edges.get(from)!.add(to);
  }

  // 查找所有依赖
  findAllDependencies(module: string): Set<string> {
    const visited = new Set<string>();
    const queue = [module];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      const deps = this.graph.modules.get(current)?.dependencies;
      if (deps) {
        queue.push(...deps);
      }
    }

    return visited;
  }

  // 查找所有依赖者
  findAllDependents(module: string): Set<string> {
    const visited = new Set<string>();
    const queue = [module];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      const dependents = this.graph.modules.get(current)?.dependents;
      if (dependents) {
        queue.push(...dependents);
      }
    }

    return visited;
  }
}
```

**统一图优势**

```typescript
// 对比: Webpack 多编译器 vs Turbopack 统一图

// Webpack: 为每个环境创建独立编译器
class WebpackMultiCompiler {
  async build() {
    // 客户端编译器
    const clientCompiler = new Compiler({
      target: "web",
      entry: "./src/client.ts",
    });

    // 服务端编译器
    const serverCompiler = new Compiler({
      target: "node",
      entry: "./src/server.ts",
    });

    // 分别编译(可能重复处理共享模块)
    const [clientResult, serverResult] = await Promise.all([
      clientCompiler.run(),
      serverCompiler.run(),
    ]);

    return { clientResult, serverResult };
  }
}

// Turbopack: 统一图,单次遍历
class TurbopackUnifiedGraph {
  async build() {
    // 1. 构建统一依赖图
    const graph = await this.buildGraph();

    // 2. 标记每个模块的目标环境
    this.markEnvironments(graph);

    // 3. 单次遍历,生成所有环境的输出
    const outputs = await this.generateOutputs(graph, {
      environments: ["client", "server", "edge"],
    });

    return outputs;
  }

  private markEnvironments(graph: DependencyGraph) {
    graph.modules.forEach((module, path) => {
      // 根据导入语句判断目标环境
      if (path.includes("use client")) {
        module.environments.add("client");
      }
      if (path.includes("use server")) {
        module.environments.add("server");
      }
      // Edge Runtime 模块
      if (module.config?.runtime === "edge") {
        module.environments.add("edge");
      }
    });
  }
}
```

### 1.3 增量计算模型

**增量计算原理**

```typescript
// 增量计算: 只计算变化的部分

class IncrementalComputation {
  private computationCache = new Map<string, ComputationResult>();
  private dependencyTracker = new DependencyTracker();

  // 核心: 自动记忆化的计算函数
  async compute<T>(computation: () => Promise<T>, inputs: Input[]): Promise<T> {
    // 1. 生成缓存键
    const cacheKey = this.generateCacheKey(computation, inputs);

    // 2. 检查缓存是否有效
    const cached = this.computationCache.get(cacheKey);
    if (cached && this.isCacheValid(cached, inputs)) {
      console.log(`使用缓存: ${cacheKey}`);
      return cached.result as T;
    }

    // 3. 执行计算
    console.log(`执行计算: ${cacheKey}`);
    const startTime = Date.now();

    // 追踪依赖
    this.dependencyTracker.startTracking(cacheKey);
    const result = await computation();
    const dependencies = this.dependencyTracker.stopTracking();

    // 4. 缓存结果
    this.computationCache.set(cacheKey, {
      result,
      inputs: this.snapshotInputs(inputs),
      dependencies,
      computedAt: Date.now(),
      duration: Date.now() - startTime,
    });

    return result;
  }

  // 检查缓存有效性
  private isCacheValid(
    cached: ComputationResult,
    currentInputs: Input[]
  ): boolean {
    // 1. 检查直接输入是否变化
    if (!this.areInputsEqual(cached.inputs, currentInputs)) {
      return false;
    }

    // 2. 检查依赖是否变化
    for (const dep of cached.dependencies) {
      if (this.hasDependencyChanged(dep)) {
        return false;
      }
    }

    return true;
  }

  // 失效缓存
  invalidate(file: string) {
    // 找到所有依赖此文件的计算
    const affectedComputations =
      this.dependencyTracker.findDependentComputations(file);

    // 移除缓存
    affectedComputations.forEach((key) => {
      this.computationCache.delete(key);
    });
  }
}
```

**增量计算示例**

```typescript
// 实际应用: 模块转换的增量计算

class ModuleTransformer {
  private incrementalEngine: IncrementalComputation;

  // 转换单个模块
  async transformModule(modulePath: string) {
    return this.incrementalEngine.compute(
      async () => {
        // 1. 读取文件(会自动追踪依赖)
        const content = await this.readFile(modulePath);

        // 2. 解析 AST(会自动追踪依赖)
        const ast = await this.parse(content);

        // 3. 转换代码(会自动追踪依赖)
        const transformed = await this.transform(ast);

        return transformed;
      },
      [modulePath] // 输入参数
    );
  }

  // 文件变更时
  onFileChange(file: string) {
    // 自动失效相关缓存
    this.incrementalEngine.invalidate(file);

    // 重新转换(只有变更的模块会重新计算)
    this.transformModule(file);
  }
}
```

### 1.4 懒加载编译

**懒加载原理**

```typescript
// Turbopack 懒加载策略

class LazyCompiler {
  private compiledModules = new Set<string>();
  private pendingCompilations = new Map<string, Promise<Module>>();

  // 只编译请求的模块
  async compileOnDemand(modulePath: string): Promise<Module> {
    // 1. 检查是否已编译
    if (this.compiledModules.has(modulePath)) {
      return this.getCompiledModule(modulePath);
    }

    // 2. 检查是否正在编译
    if (this.pendingCompilations.has(modulePath)) {
      return this.pendingCompilations.get(modulePath)!;
    }

    // 3. 开始编译
    const compilationPromise = this.doCompile(modulePath);
    this.pendingCompilations.set(modulePath, compilationPromise);

    const module = await compilationPromise;

    // 4. 标记为已编译
    this.compiledModules.add(modulePath);
    this.pendingCompilations.delete(modulePath);

    return module;
  }

  private async doCompile(modulePath: string): Promise<Module> {
    console.log(`懒编译: ${modulePath}`);

    // 1. 读取模块
    const content = await this.readModule(modulePath);

    // 2. 解析依赖(不编译依赖)
    const dependencies = await this.parseDependencies(content);

    // 3. 转换模块
    const transformed = await this.transform(content);

    return {
      path: modulePath,
      code: transformed,
      dependencies,
    };
  }

  // 编译模块树
  async compileModuleTree(entryPoint: string): Promise<void> {
    const visited = new Set<string>();
    const queue = [entryPoint];

    while (queue.length > 0) {
      const modulePath = queue.shift()!;
      if (visited.has(modulePath)) continue;

      visited.add(modulePath);

      // 编译当前模块
      const module = await this.compileOnDemand(modulePath);

      // 只将直接依赖加入队列
      // 间接依赖在实际需要时才编译
      queue.push(...module.dependencies);
    }
  }
}
```

## 第二部分:性能优化机制

### 2.1 并行处理

**并行编译策略**

```typescript
// Turbopack 并行处理架构

class ParallelCompiler {
  private workerPool: WorkerPool;
  private taskQueue: TaskQueue;

  constructor(maxWorkers: number = os.cpus().length) {
    this.workerPool = new WorkerPool(maxWorkers);
    this.taskQueue = new TaskQueue();
  }

  // 并行编译多个模块
  async compileModules(modules: string[]): Promise<Module[]> {
    // 1. 创建编译任务
    const tasks = modules.map((modulePath) => ({
      type: "compile",
      data: modulePath,
    }));

    // 2. 添加到任务队列
    this.taskQueue.addTasks(tasks);

    // 3. 并行执行
    const results = await Promise.all(
      tasks.map((task) => this.executeTask(task))
    );

    return results;
  }

  private async executeTask(task: Task): Promise<Module> {
    // 从工作池获取可用 worker
    const worker = await this.workerPool.acquire();

    try {
      // 在 worker 中执行任务
      const result = await worker.execute(task);
      return result;
    } finally {
      // 归还 worker
      this.workerPool.release(worker);
    }
  }
}

// Worker Pool 实现
class WorkerPool {
  private workers: Worker[] = [];
  private available: Worker[] = [];
  private waiting: Array<(worker: Worker) => void> = [];

  constructor(size: number) {
    // 创建 worker
    for (let i = 0; i < size; i++) {
      const worker = new Worker("./compiler-worker.js");
      this.workers.push(worker);
      this.available.push(worker);
    }
  }

  async acquire(): Promise<Worker> {
    // 如果有可用 worker,直接返回
    if (this.available.length > 0) {
      return this.available.pop()!;
    }

    // 否则等待
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(worker: Worker) {
    // 如果有等待的任务,直接分配
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      resolve(worker);
    } else {
      // 否则放回可用池
      this.available.push(worker);
    }
  }
}
```

### 2.2 智能缓存

**多层缓存架构**

```typescript
// Turbopack 多层缓存系统

class MultiLayerCache {
  // 1. 内存缓存(最快)
  private memoryCache = new Map<string, CachedResult>();

  // 2. 文件系统缓存(持久化)
  private fsCache: FileSystemCache;

  // 3. 分布式缓存(团队共享,未来功能)
  private remoteCache?: RemoteCache;

  async get(key: string): Promise<CachedResult | null> {
    // 1. 检查内存缓存
    if (this.memoryCache.has(key)) {
      console.log(`内存缓存命中: ${key}`);
      return this.memoryCache.get(key)!;
    }

    // 2. 检查文件系统缓存
    const fsResult = await this.fsCache.get(key);
    if (fsResult) {
      console.log(`文件系统缓存命中: ${key}`);
      // 预热内存缓存
      this.memoryCache.set(key, fsResult);
      return fsResult;
    }

    // 3. 检查远程缓存
    if (this.remoteCache) {
      const remoteResult = await this.remoteCache.get(key);
      if (remoteResult) {
        console.log(`远程缓存命中: ${key}`);
        // 预热本地缓存
        await this.fsCache.set(key, remoteResult);
        this.memoryCache.set(key, remoteResult);
        return remoteResult;
      }
    }

    console.log(`缓存未命中: ${key}`);
    return null;
  }

  async set(key: string, value: CachedResult): Promise<void> {
    // 同时写入所有层级
    this.memoryCache.set(key, value);
    await this.fsCache.set(key, value);

    if (this.remoteCache) {
      // 异步上传到远程缓存
      this.remoteCache.set(key, value).catch((err) => {
        console.error("远程缓存写入失败:", err);
      });
    }
  }
}

// 文件系统缓存实现
class FileSystemCache {
  private cacheDir: string;

  constructor(cacheDir: string = ".next/cache/turbopack") {
    this.cacheDir = cacheDir;
  }

  async get(key: string): Promise<CachedResult | null> {
    const cachePath = this.getCachePath(key);

    try {
      const content = await fs.readFile(cachePath, "utf-8");
      const cached = JSON.parse(content);

      // 验证缓存有效性
      if (this.isValid(cached)) {
        return cached;
      }
    } catch (err) {
      // 缓存不存在或损坏
    }

    return null;
  }

  async set(key: string, value: CachedResult): Promise<void> {
    const cachePath = this.getCachePath(key);
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify(value));
  }

  private getCachePath(key: string): string {
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    return path.join(this.cacheDir, hash.slice(0, 2), hash);
  }
}
```

### 2.3 依赖追踪

**自动依赖追踪**

```typescript
// Turbopack 依赖追踪系统

class DependencyTracker {
  private currentComputation: string | null = null;
  private dependencies = new Map<string, Set<string>>();

  // 开始追踪
  startTracking(computationId: string) {
    this.currentComputation = computationId;
  }

  // 停止追踪
  stopTracking(): Set<string> {
    const deps = this.dependencies.get(this.currentComputation!) || new Set();
    this.currentComputation = null;
    return deps;
  }

  // 记录依赖(在读取文件、访问变量时自动调用)
  recordDependency(resource: string) {
    if (!this.currentComputation) return;

    if (!this.dependencies.has(this.currentComputation)) {
      this.dependencies.set(this.currentComputation, new Set());
    }

    this.dependencies.get(this.currentComputation)!.add(resource);
  }

  // 查找依赖某个资源的所有计算
  findDependentComputations(resource: string): string[] {
    const dependents: string[] = [];

    this.dependencies.forEach((deps, computationId) => {
      if (deps.has(resource)) {
        dependents.push(computationId);
      }
    });

    return dependents;
  }
}

// 使用示例
class TrackedFileSystem {
  private tracker: DependencyTracker;

  async readFile(path: string): Promise<string> {
    // 自动记录依赖
    this.tracker.recordDependency(path);

    // 读取文件
    return fs.readFile(path, "utf-8");
  }
}
```

## 第三部分:设计模式

### 3.1 不可变数据结构

**不可变性原则**

```typescript
// Turbopack 使用不可变数据结构

class ImmutableModule {
  // 所有属性都是只读的
  readonly path: string;
  readonly code: string;
  readonly dependencies: readonly string[];
  readonly hash: string;

  constructor(data: ModuleData) {
    this.path = data.path;
    this.code = data.code;
    this.dependencies = Object.freeze([...data.dependencies]);
    this.hash = this.computeHash();
  }

  // 创建新版本而不是修改
  withCode(newCode: string): ImmutableModule {
    return new ImmutableModule({
      path: this.path,
      code: newCode,
      dependencies: [...this.dependencies],
    });
  }

  private computeHash(): string {
    return crypto.createHash("sha256").update(this.code).digest("hex");
  }
}

// 不可变依赖图
class ImmutableDependencyGraph {
  private modules: Map<string, ImmutableModule>;

  constructor(modules: Map<string, ImmutableModule> = new Map()) {
    this.modules = new Map(modules);
  }

  // 添加模块(返回新图)
  addModule(module: ImmutableModule): ImmutableDependencyGraph {
    const newModules = new Map(this.modules);
    newModules.set(module.path, module);
    return new ImmutableDependencyGraph(newModules);
  }

  // 更新模块(返回新图)
  updateModule(
    path: string,
    updater: (module: ImmutableModule) => ImmutableModule
  ): ImmutableDependencyGraph {
    const module = this.modules.get(path);
    if (!module) return this;

    const newModules = new Map(this.modules);
    newModules.set(path, updater(module));
    return new ImmutableDependencyGraph(newModules);
  }
}
```

### 3.2 函数式编程

**函数式设计**

```typescript
// Turbopack 采用函数式编程范式

// 纯函数: 相同输入总是产生相同输出
function transformModule(code: string, options: TransformOptions): string {
  // 无副作用
  const ast = parse(code);
  const transformed = transform(ast, options);
  return generate(transformed);
}

// 组合函数
const compileModule = pipe(
  readFile,
  parseModule,
  transformModule,
  generateCode,
  writeOutput
);

// 高阶函数
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 使用
const memoizedTransform = memoize(transformModule);
```

## 常见问题

### Q1: Turbopack 为什么选择 Rust?

**A**: Rust 提供了多个关键优势:

1. **性能**: 接近 C/C++ 的性能
2. **内存安全**: 无垃圾回收,无内存泄漏
3. **并发**: 优秀的并发支持
4. **生态**: 丰富的解析器和工具库

### Q2: 增量计算如何工作?

**A**: 核心机制:

1. **函数级缓存**: 缓存每个函数的执行结果
2. **依赖追踪**: 自动追踪函数依赖
3. **智能失效**: 只在依赖变化时重新计算
4. **并行执行**: 独立任务并行处理

### Q3: Turbopack 如何处理大型项目?

**A**: 多种优化策略:

1. **懒加载**: 只编译需要的模块
2. **增量编译**: 只重新编译变化的部分
3. **并行处理**: 利用多核 CPU
4. **智能缓存**: 多层缓存机制

### Q4: 统一图相比多编译器有什么优势?

**A**: 主要优势:

1. **避免重复**: 共享模块只处理一次
2. **一致性**: 确保所有环境使用相同的模块版本
3. **性能**: 单次遍历生成所有输出
4. **简化**: 更简单的架构和维护

## 适用场景

### 1. 大型应用

- 模块数量 > 1000
- 复杂的依赖关系
- 需要快速迭代

### 2. 团队协作

- 多人同时开发
- 频繁的代码变更
- 需要快速反馈

### 3. 性能敏感

- 对构建速度有严格要求
- 开发体验优先
- CI/CD 流程优化

## 注意事项

### 1. 架构理解

- ✅ 理解增量计算原理
- ✅ 掌握缓存机制
- ✅ 了解依赖追踪
- ❌ 不要过度优化

### 2. 性能调优

- ✅ 合理使用缓存
- ✅ 优化模块结构
- ✅ 减少不必要的依赖
- ❌ 避免循环依赖

### 3. 最佳实践

- ✅ 遵循官方指南
- ✅ 保持代码简洁
- ✅ 合理组织文件
- ✅ 定期清理缓存

## 第六部分:性能优化策略

### 6.1 编译策略优化

**智能编译策略**

```rust
// Turbopack 编译策略
pub struct CompilationStrategy {
    // 增量编译
    incremental: bool,
    // 并行度
    parallelism: usize,
    // 缓存策略
    cache_strategy: CacheStrategy,
}

impl CompilationStrategy {
    pub fn optimize(&self, module: &Module) -> CompiledModule {
        // 1. 检查缓存
        if let Some(cached) = self.check_cache(module) {
            return cached;
        }

        // 2. 增量编译
        if self.incremental && !module.changed() {
            return module.previous_output();
        }

        // 3. 并行处理
        if module.can_parallelize() {
            return self.parallel_compile(module);
        }

        // 4. 常规编译
        self.compile(module)
    }
}
```

### 6.2 内存管理优化

**高效内存使用**

```rust
// 内存池管理
pub struct MemoryPool {
    // 对象池
    object_pool: Vec<PooledObject>,
    // 内存限制
    memory_limit: usize,
}

impl MemoryPool {
    pub fn allocate<T>(&mut self) -> Option<Pooled<T>> {
        // 检查内存限制
        if self.current_usage() > self.memory_limit {
            self.gc();
        }

        // 从池中分配
        self.object_pool.pop()
            .map(|obj| Pooled::new(obj))
    }

    pub fn gc(&mut self) {
        // 垃圾回收
        self.object_pool.retain(|obj| obj.is_active());
    }
}
```

### 6.3 I/O 优化

**异步 I/O 处理**

```rust
use tokio::fs;
use futures::stream::{self, StreamExt};

pub async fn batch_read_files(paths: Vec<PathBuf>) -> Vec<FileContent> {
    // 并行读取文件
    let files = stream::iter(paths)
        .map(|path| async move {
            fs::read_to_string(path).await
        })
        .buffer_unordered(10) // 并发数
        .collect::<Vec<_>>()
        .await;

    files.into_iter()
        .filter_map(Result::ok)
        .collect()
}
```

## 第七部分:扩展性设计

### 7.1 插件系统

**插件接口**

```rust
pub trait TurbopackPlugin: Send + Sync {
    // 插件名称
    fn name(&self) -> &str;

    // 处理模块
    fn process_module(
        &self,
        module: &Module,
        context: &Context,
    ) -> Result<ProcessedModule>;

    // 生命周期钩子
    fn on_build_start(&self, context: &Context) {}
    fn on_build_end(&self, result: &BuildResult) {}
}

// 插件示例
pub struct CustomPlugin;

impl TurbopackPlugin for CustomPlugin {
    fn name(&self) -> &str {
        "custom-plugin"
    }

    fn process_module(
        &self,
        module: &Module,
        _context: &Context,
    ) -> Result<ProcessedModule> {
        // 自定义处理逻辑
        Ok(ProcessedModule::from(module))
    }
}
```

### 7.2 自定义 Loader

**Loader 定义**

```rust
pub trait Loader: Send + Sync {
    // 支持的文件类型
    fn test(&self, path: &Path) -> bool;

    // 加载文件
    fn load(
        &self,
        content: &str,
        options: &LoaderOptions,
    ) -> Result<LoadedModule>;
}

// CSS Loader 示例
pub struct CssLoader;

impl Loader for CssLoader {
    fn test(&self, path: &Path) -> bool {
        path.extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext == "css")
            .unwrap_or(false)
    }

    fn load(
        &self,
        content: &str,
        _options: &LoaderOptions,
    ) -> Result<LoadedModule> {
        // CSS 处理逻辑
        let processed = process_css(content)?;
        Ok(LoadedModule::new(processed))
    }
}
```

## 总结

Turbopack 的架构设计代表了构建工具的未来方向。

### 核心要点

1. **Turbo 引擎**: 增量计算的核心
2. **统一图**: 高效的依赖管理
3. **增量计算**: 只处理变化的部分
4. **懒加载**: 按需编译
5. **并行处理**: 充分利用硬件

### 设计理念

1. **性能优先**: 极致的构建速度
2. **开发体验**: 快速的热更新
3. **可扩展性**: 支持大型应用
4. **简单易用**: 开箱即用
5. **未来导向**: 持续演进

掌握 Turbopack 架构设计理念,能更好地利用其性能优势。

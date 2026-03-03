**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 减少 useMemo/useCallback 使用

## 概述

React Compiler 的一个重要目标是减少甚至消除手动使用 useMemo 和 useCallback 的需求。传统 React 开发中,开发者需要频繁使用这两个 Hook 来优化性能,但这不仅增加了代码复杂度,还容易出错。编译器通过自动分析和优化,让开发者可以编写更简洁、更易维护的代码,同时获得更好的性能。本文将深入探讨如何在 React Compiler 的帮助下减少这些手动优化,以及何时仍需使用它们。

### 手动优化的问题

**代码复杂度**:

```typescript
// 传统方式:充满 useMemo/useCallback
function Component({ data, filters, onItemClick }) {
  const filtered = useMemo(
    () => data.filter((item) => filters.includes(item.type)),
    [data, filters]
  );

  const sorted = useMemo(
    () => filtered.sort((a, b) => a.value - b.value),
    [filtered]
  );

  const handleClick = useCallback(
    (id) => {
      onItemClick(id);
    },
    [onItemClick]
  );

  return sorted.map((item) => (
    <Item key={item.id} data={item} onClick={handleClick} />
  ));
}

// React Compiler 方式:简洁直接
function Component({ data, filters, onItemClick }) {
  const filtered = data.filter((item) => filters.includes(item.type));
  const sorted = filtered.sort((a, b) => a.value - b.value);

  return sorted.map((item) => (
    <Item key={item.id} data={item} onClick={onItemClick} />
  ));
}
```

## 第一部分:消除 useMemo

### 1.1 值计算优化

**简单计算**

```typescript
// ❌ 不必要的 useMemo
function ProductCard({ price, quantity }) {
  const total = useMemo(() => price * quantity, [price, quantity]);
  const tax = useMemo(() => total * 0.1, [total]);

  return (
    <div>
      <p>小计: ${total}</p>
      <p>税费: ${tax}</p>
    </div>
  );
}

// ✅ 编译器自动优化
function ProductCard({ price, quantity }) {
  const total = price * quantity;
  const tax = total * 0.1;

  return (
    <div>
      <p>小计: ${total}</p>
      <p>税费: ${tax}</p>
    </div>
  );
}
```

**数组操作**

```typescript
// ❌ 手动 memo 所有数组操作
function UserList({ users, activeId }) {
  const activeUsers = useMemo(() => users.filter((u) => u.active), [users]);

  const sortedUsers = useMemo(
    () => activeUsers.sort((a, b) => a.name.localeCompare(b.name)),
    [activeUsers]
  );

  return sortedUsers.map((user) => (
    <User key={user.id} {...user} active={user.id === activeId} />
  ));
}

// ✅ 编译器处理
function UserList({ users, activeId }) {
  const activeUsers = users.filter((u) => u.active);
  const sortedUsers = activeUsers.sort((a, b) => a.name.localeCompare(b.name));

  return sortedUsers.map((user) => (
    <User key={user.id} {...user} active={user.id === activeId} />
  ));
}
```

### 1.2 对象创建

**配置对象**

```typescript
// ❌ 手动 memo 对象
function Chart({ data, width, height }) {
  const config = useMemo(
    () => ({
      width,
      height,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    }),
    [width, height]
  );

  return <ChartRenderer data={data} config={config} />;
}

// ✅ 编译器优化
function Chart({ data, width, height }) {
  const config = {
    width,
    height,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  };

  return <ChartRenderer data={data} config={config} />;
}
```

## 第二部分:消除 useCallback

### 2.1 事件处理器

**点击处理**

```typescript
// ❌ 到处都是 useCallback
function TodoItem({ todo, onToggle, onDelete }) {
  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [todo.id, onDelete]);

  return (
    <div>
      <input type="checkbox" onChange={handleToggle} />
      <span>{todo.text}</span>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

// ✅ 编译器自动优化
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div>
      <input type="checkbox" onChange={() => onToggle(todo.id)} />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
}
```

### 2.2 表单处理

**输入处理**

```typescript
// ❌ 手动 useCallback
function Form({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleNameChange = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit({ name, email });
    },
    [name, email, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={handleNameChange} />
      <input value={email} onChange={handleEmailChange} />
      <button>Submit</button>
    </form>
  );
}

// ✅ 编译器处理
function Form({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button>Submit</button>
    </form>
  );
}
```

## 第三部分:何时仍需手动优化

### 3.1 特殊场景

**极端性能要求**

```typescript
// 仍需 useMemo 的场景
function HeavyComputation({ largeDataset }) {
  // 非常昂贵的计算
  const result = useMemo(() => {
    return complexAlgorithm(largeDataset);
  }, [largeDataset]);

  return <Display value={result} />;
}

// 复杂算法示例
function DataAnalysis({ rawData }) {
  // 大数据集处理
  const processed = useMemo(() => {
    // 多步骤复杂计算
    const cleaned = cleanData(rawData);
    const normalized = normalizeData(cleaned);
    const aggregated = aggregateData(normalized);
    return statisticalAnalysis(aggregated);
  }, [rawData]);

  return <Analytics data={processed} />;
}
```

**第三方库集成**

```typescript
// 第三方库要求稳定引用
function Map({ markers }) {
  const mapConfig = useMemo(
    () => ({
      zoom: 10,
      center: [0, 0],
    }),
    []
  );

  return <ThirdPartyMap config={mapConfig} markers={markers} />;
}

// Chart.js 集成
function ChartComponent({ data }) {
  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
    }),
    []
  );

  return <Chart type="bar" data={data} options={options} />;
}
```

### 3.2 依赖外部状态

**全局状态**

```typescript
// 依赖全局状态的场景
let globalCache = new Map();

function Component({ id }) {
  // 需要稳定引用以避免全局状态泄漏
  const getCachedValue = useCallback(() => {
    if (!globalCache.has(id)) {
      globalCache.set(id, expensiveCalculation(id));
    }
    return globalCache.get(id);
  }, [id]);

  const value = getCachedValue();
  return <Display value={value} />;
}
```

**复杂闭包**

```typescript
function DataProcessor({ items }) {
  // 复杂闭包需要稳定化
  const processItems = useCallback(
    (filters) => {
      let result = items;

      for (const filter of filters) {
        result = result.filter((item) => {
          // 复杂逻辑
          return filter.predicate(item);
        });
      }

      return result;
    },
    [items]
  );

  return <FilterableList processor={processItems} />;
}
```

### 3.3 性能关键组件

**虚拟滚动**

```typescript
function VirtualList({ items, rowHeight }) {
  // 虚拟列表需要稳定的计算函数
  const getItemSize = useCallback(
    (index: number) => {
      return rowHeight;
    },
    [rowHeight]
  );

  const renderItem = useCallback(
    ({ index, style }) => <div style={style}>{items[index].content}</div>,
    [items]
  );

  return (
    <VirtualizedList
      itemCount={items.length}
      itemSize={getItemSize}
      renderItem={renderItem}
    />
  );
}
```

**实时搜索**

```typescript
function SearchComponent({ onSearch }) {
  // 防抖搜索需要稳定引用
  const debouncedSearch = useMemo(
    () => debounce((term: string) => onSearch(term), 300),
    [onSearch]
  );

  return <SearchInput onChange={debouncedSearch} />;
}
```

## 第四部分:迁移策略

### 4.1 评估现有代码

**代码审计**

```typescript
// 审计工具
class UseMemoAuditor {
  analyze(codebase: string[]) {
    const results = {
      total: 0,
      unnecessary: [],
      necessary: [],
      uncertain: [],
    };

    for (const file of codebase) {
      const usages = this.findUseMemoUsage(file);

      for (const usage of usages) {
        results.total++;

        if (this.isUnnecessary(usage)) {
          results.unnecessary.push(usage);
        } else if (this.isNecessary(usage)) {
          results.necessary.push(usage);
        } else {
          results.uncertain.push(usage);
        }
      }
    }

    return results;
  }

  private isUnnecessary(usage: UseMemoUsage): boolean {
    // 简单计算
    if (usage.complexity < 5) return true;
    // 原始类型
    if (usage.returnType === "primitive") return true;
    return false;
  }

  private isNecessary(usage: UseMemoUsage): boolean {
    // 第三方库
    if (usage.usedInThirdParty) return true;
    // 复杂计算
    if (usage.complexity > 20) return true;
    return false;
  }
}
```

### 4.2 逐步移除

**移除步骤**

```typescript
// 步骤1: 标记可移除的
/* eslint-disable react-compiler/unnecessary-useMemo */
function Step1_Marked({ items }) {
  // 标记为可移除
  const filtered = useMemo(() => items.filter((i) => i.active), [items]);

  return <List items={filtered} />;
}

// 步骤2: 移除并测试
function Step2_Removed({ items }) {
  // 移除 useMemo
  const filtered = items.filter((i) => i.active);

  return <List items={filtered} />;
}

// 步骤3: 性能验证
function Step3_Verified({ items }) {
  const filtered = items.filter((i) => i.active);

  // 验证性能没有下降
  return <List items={filtered} />;
}
```

### 4.3 性能对比

**对比测试**

```typescript
class PerformanceComparison {
  async compare(Component: React.FC, props: any) {
    // 测试手动优化版本
    const manualOptimized = await this.benchmark(ComponentWithUseMemo, props);

    // 测试编译器优化版本
    const compilerOptimized = await this.benchmark(
      ComponentWithoutUseMemo,
      props
    );

    return {
      manual: manualOptimized,
      compiler: compilerOptimized,
      improvement: this.calculateImprovement(
        manualOptimized,
        compilerOptimized
      ),
    };
  }

  private async benchmark(Component: React.FC, props: any) {
    const renders = 1000;
    const start = performance.now();

    for (let i = 0; i < renders; i++) {
      render(<Component {...props} />);
    }

    const end = performance.now();
    return {
      totalTime: end - start,
      avgTime: (end - start) / renders,
    };
  }
}
```

## 第五部分:最佳实践

### 5.1 代码风格指南

**新代码规范**

```typescript
// ✅ 推荐:依赖编译器
function ModernComponent({ data, filters }) {
  // 直接计算,无需 useMemo
  const filtered = data.filter((item) => filters.includes(item.category));

  const sorted = filtered.sort((a, b) => a.priority - b.priority);

  return <DataGrid items={sorted} />;
}

// ❌ 避免:过度优化
function OverOptimized({ data, filters }) {
  const filtered = useMemo(
    () => data.filter((item) => filters.includes(item.category)),
    [data, filters]
  );

  const sorted = useMemo(
    () => filtered.sort((a, b) => a.priority - b.priority),
    [filtered]
  );

  return <DataGrid items={sorted} />;
}
```

### 5.2 团队协作

**Code Review 检查清单**

```typescript
// Code Review 指南
const codeReviewChecklist = {
  // 检查项 1: useMemo 是否必要
  checkUseMemo: (usage) => {
    // 是否是简单计算?
    if (isSimpleCalculation(usage)) {
      return "❗ 建议移除 useMemo";
    }

    // 是否是第三方库要求?
    if (isThirdPartyRequirement(usage)) {
      return "✅ 保留 useMemo";
    }

    // 是否是性能关键?
    if (isPerformanceCritical(usage)) {
      return "✅ 保留 useMemo";
    }

    return "⚠️ 需要进一步评估";
  },

  // 检查项 2: useCallback 是否必要
  checkUseCallback: (usage) => {
    // 是否传递给子组件?
    if (!isPassedToChild(usage)) {
      return "❗ 建议移除 useCallback";
    }

    // 子组件是否使用 memo?
    if (!isChildMemoized(usage)) {
      return "❗ useCallback 无效";
    }

    return "✅ 合理使用";
  },
};
```

### 5.3 文档化

**决策记录**

```typescript
/**
 * 使用 useMemo 的决策记录
 *
 * @example
 * // 保留 useMemo 的原因:
 * function ExpensiveComponent({ largeDataset }) {
 *   // ✅ 保留原因: 复杂算法,需要 5s 计算时间
 *   const result = useMemo(() => {
 *     return complexMLAlgorithm(largeDataset);
 *   }, [largeDataset]);
 *
 *   return <Result data={result} />;
 * }
 *
 * @example
 * // 移除 useMemo 的原因:
 * function SimpleComponent({ a, b }) {
 *   // ✅ 移除原因: 简单计算,编译器自动优化
 *   const sum = a + b;
 *
 *   return <Display value={sum} />;
 * }
 */
```

### 5.4 监控和度量

**性能监控**

```typescript
class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();

  trackComponent(name: string, renderTime: number) {
    const existing = this.metrics.get(name) || {
      renders: 0,
      totalTime: 0,
      avgTime: 0,
    };

    existing.renders++;
    existing.totalTime += renderTime;
    existing.avgTime = existing.totalTime / existing.renders;

    this.metrics.set(name, existing);

    // 告警:渲染过慢
    if (existing.avgTime > 16) {
      console.warn(`⚠️ ${name} 渲染过慢: ${existing.avgTime}ms`);
    }
  }

  getReport() {
    const sorted = Array.from(this.metrics.entries()).sort(
      ([, a], [, b]) => b.avgTime - a.avgTime
    );

    console.log("📊 性能报告:");
    sorted.forEach(([name, metrics]) => {
      console.log(`  ${name}: ${metrics.avgTime.toFixed(2)}ms`);
    });
  }
}
```

## 第六部分:实战案例

### 6.1 大型表单优化

**迁移前**

```typescript
function LargeForm({ onSubmit }) {
  const [formData, setFormData] = useState({});

  // ❌ 过度使用 useCallback
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const validateField = useCallback((field, value) => {
    return validators[field]?.(value) ?? true;
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          {...field}
          onChange={handleChange}
          validate={validateField}
        />
      ))}
    </form>
  );
}
```

**迁移后**

```typescript
function LargeForm({ onSubmit }) {
  const [formData, setFormData] = useState({});

  // ✅ 编译器自动优化
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          {...field}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, [field.name]: value }));
          }}
          validate={(value) => validators[field.name]?.(value) ?? true}
        />
      ))}
    </form>
  );
}
```

### 6.2 数据表格优化

**迁移前**

```typescript
function DataTable({ data, columns, filters }) {
  // ❌ 多层 useMemo
  const filteredData = useMemo(
    () => applyFilters(data, filters),
    [data, filters]
  );

  const sortedData = useMemo(
    () => sortData(filteredData, sortConfig),
    [filteredData, sortConfig]
  );

  const paginatedData = useMemo(
    () => paginate(sortedData, page, pageSize),
    [sortedData, page, pageSize]
  );

  return <Table data={paginatedData} columns={columns} />;
}
```

**迁移后**

```typescript
function DataTable({ data, columns, filters }) {
  // ✅ 简洁直接
  const filteredData = applyFilters(data, filters);
  const sortedData = sortData(filteredData, sortConfig);
  const paginatedData = paginate(sortedData, page, pageSize);

  return <Table data={paginatedData} columns={columns} />;
}
```

## 常见问题

### Q1: 应该完全移除 useMemo/useCallback 吗?

**A**: 渐进式移除:

1. 新代码:不使用
2. 旧代码:逐步移除
3. 性能关键:保留
4. 第三方集成:按需保留

### Q2: 如何判断是否需要手动优化?

**A**: 判断标准:

1. React DevTools 分析
2. 性能 Profiling
3. 用户体验观察
4. 编译器建议

### Q3: 移除后性能会下降吗?

**A**: 编译器保证:

1. 自动优化更精确
2. 性能通常提升
3. 减少错误优化
4. 降低维护成本

### Q4: 如何迁移现有代码?

**A**: 迁移策略:

1. 启用编译器
2. 逐步移除手动优化
3. 性能对比测试
4. 保留必要优化

## 适用场景

### 1. 新项目

- 直接使用编译器
- 不使用手动优化
- 代码更简洁
- 性能自动优化

### 2. 重构项目

- 逐步移除优化
- 性能测试验证
- 简化代码逻辑
- 提升可维护性

### 3. 性能优化

- 依赖编译器
- 减少人工判断
- 统一优化策略
- 降低出错概率

### 4. 团队协作

- 降低学习成本
- 统一代码风格
- 减少 Code Review 负担
- 提升开发效率

## 注意事项

### 1. 迁移过程

- ✅ 渐进式移除
- ✅ 充分测试
- ✅ 性能监控
- ❌ 避免一次性全部移除

### 2. 性能验证

- ✅ 使用 React DevTools
- ✅ Performance Profiling
- ✅ 用户体验测试
- ✅ 对比优化前后

### 3. 代码审查

- ✅ 检查不必要的优化
- ✅ 验证编译器优化
- ✅ 保留必要的手动优化
- ✅ 文档记录决策

### 4. 团队沟通

- ✅ 培训团队成员
- ✅ 更新编码规范
- ✅ 分享最佳实践
- ✅ 建立反馈机制

## 总结

React Compiler 让开发者可以减少甚至消除 useMemo 和 useCallback 的使用,写出更简洁、更易维护的代码。通过理解编译器的自动优化机制,开发者可以专注于业务逻辑,而不是性能优化的细节。

### 核心要点

1. **自动优化**: 编译器自动处理大部分优化
2. **代码简化**: 移除大量样板代码,提高可读性
3. **性能提升**: 优化更精确和一致
4. **降低门槛**: 新手也能写出高性能代码
5. **渐进迁移**: 可逐步移除手动优化
6. **团队协作**: 降低 Code Review 负担
7. **持续改进**: 性能监控和优化

### 最佳实践

- **新代码**: 不使用手动优化,依赖编译器
- **旧代码**: 逐步移除,充分测试
- **特殊场景**: 按需保留,文档化原因
- **性能测试**: 验证优化效果,建立基准
- **团队培训**: 分享最佳实践,统一规范
- **持续监控**: 跟踪性能指标,及时调整

### 迁移建议

1. **阶段 1**: 启用编译器,保留现有优化
2. **阶段 2**: 审计现有 useMemo/useCallback
3. **阶段 3**: 移除明显不必要的优化
4. **阶段 4**: 性能测试验证
5. **阶段 5**: 逐步移除其余优化
6. **阶段 6**: 持续监控和优化

### 成功指标

- 代码行数减少 20-30%
- 性能提升或保持一致
- 开发效率提升 15-25%
- Code Review 时间减少 30%
- Bug 数量减少 (依赖错误相关)

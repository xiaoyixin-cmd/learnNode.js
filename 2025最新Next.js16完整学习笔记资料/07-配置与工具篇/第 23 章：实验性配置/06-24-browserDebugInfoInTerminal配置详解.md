**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# browserDebugInfoInTerminal 配置详解

## 概述

browserDebugInfoInTerminal 是 Next.js 16 中用于在终端显示浏览器调试信息的配置选项。启用后，可以在开发服务器的终端中看到浏览器的错误、警告和日志信息，方便调试。

### browserDebugInfoInTerminal 的作用

1. **终端调试**：在终端查看浏览器信息
2. **错误追踪**：快速定位问题
3. **日志聚合**：统一查看日志
4. **开发便利**：无需切换窗口
5. **团队协作**：共享调试信息

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: true,
  },
};
```

### 查看浏览器错误

```bash
# 启动开发服务器
npm run dev

# 终端会显示浏览器错误
[Browser] Error: Cannot read property 'foo' of undefined
  at Component (app/page.tsx:10:5)
```

### 查看控制台日志

```tsx
// app/page.tsx
"use client";

export default function Page() {
  console.log("Page loaded");
  console.error("This is an error");
  console.warn("This is a warning");

  return <div>Hello</div>;
}
```

```bash
# 终端输出
[Browser] Page loaded
[Browser] Error: This is an error
[Browser] Warning: This is a warning
```

## 高级配置

### 过滤日志级别

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      levels: ["error", "warn"], // 只显示错误和警告
    },
  },
};
```

### 自定义格式

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      format: (type, message, source) => {
        return `[${type.toUpperCase()}] ${source}: ${message}`;
      },
    },
  },
};
```

### 过滤来源

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      sources: ["app/**/*.tsx"], // 只显示app目录的日志
    },
  },
};
```

### 时间戳

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      timestamp: true,
    },
  },
};
```

```bash
# 输出带时间戳
[2024-01-01 10:30:45] [Browser] Error: Something went wrong
```

### 颜色输出

```javascript
// next.config.js
const chalk = require("chalk");

module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      format: (type, message) => {
        const colors = {
          error: chalk.red,
          warn: chalk.yellow,
          log: chalk.blue,
        };
        return colors[type](`[${type}] ${message}`);
      },
    },
  },
};
```

### 堆栈追踪

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      stackTrace: true,
    },
  },
};
```

```bash
# 输出堆栈信息
[Browser] Error: Cannot read property 'foo' of undefined
  at Component (app/page.tsx:10:5)
  at renderComponent (react-dom.js:1234:10)
  at updateComponent (react-dom.js:2345:15)
```

### 性能监控

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      performance: true,
    },
  },
};
```

```bash
# 输出性能信息
[Browser] Performance: Page load took 1.2s
[Browser] Performance: Component render took 50ms
```

### 网络请求

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      network: true,
    },
  },
};
```

```bash
# 输出网络请求
[Browser] Network: GET /api/users 200 OK (150ms)
[Browser] Network: POST /api/login 401 Unauthorized (80ms)
```

## 实战案例

### 案例 1：开发调试

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: process.env.NODE_ENV === "development",
      levels: ["error", "warn"],
      timestamp: true,
      stackTrace: true,
    },
  },
};
```

```tsx
// app/page.tsx
"use client";

export default function Page() {
  const handleClick = () => {
    try {
      // 可能出错的代码
      throw new Error("Something went wrong");
    } catch (error) {
      console.error("Error in handleClick:", error);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 案例 2：性能监控

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      performance: true,
      format: (type, message, data) => {
        if (type === "performance") {
          const duration = data.duration;
          const color = duration > 1000 ? "\x1b[31m" : "\x1b[32m";
          return `${color}[Performance] ${message} (${duration}ms)\x1b[0m`;
        }
        return `[${type}] ${message}`;
      },
    },
  },
};
```

### 案例 3：API 调试

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      network: {
        enabled: true,
        filter: (request) => {
          // 只显示API请求
          return request.url.startsWith("/api/");
        },
      },
    },
  },
};
```

### 案例 4：错误追踪

```javascript
// next.config.js
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      onError: (error, source) => {
        // 发送错误到监控服务
        sendToErrorTracking({
          message: error.message,
          stack: error.stack,
          source,
          timestamp: Date.now(),
        });
      },
    },
  },
};
```

## 适用场景

| 场景     | 是否使用 | 原因       |
| -------- | -------- | ---------- |
| 本地开发 | 是       | 方便调试   |
| 团队协作 | 是       | 共享日志   |
| CI/CD    | 是       | 自动化测试 |
| 生产环境 | 否       | 性能影响   |
| 简单项目 | 否       | 不需要     |

## 注意事项

### 1. 仅开发环境

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: process.env.NODE_ENV === "development",
    },
  },
};
```

### 2. 性能影响

```javascript
// 避免在生产环境启用
if (process.env.NODE_ENV === "production") {
  config.browserDebugInfoInTerminal = false;
}
```

### 3. 日志过滤

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      filter: (message) => {
        // 过滤掉不重要的日志
        return !message.includes("React DevTools");
      },
    },
  },
};
```

### 4. 敏感信息

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      sanitize: (message) => {
        // 移除敏感信息
        return message.replace(/password=\w+/g, "password=***");
      },
    },
  },
};
```

### 5. 日志限制

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      maxLogs: 100, // 最多显示100条日志
    },
  },
};
```

## 常见问题

### 1. 日志不显示？

**问题**：终端没有显示浏览器日志

**解决方案**：

```javascript
// 确保启用配置
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: true,
  },
};
```

### 2. 如何过滤日志？

**问题**：日志太多

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      levels: ["error", "warn"],
    },
  },
};
```

### 3. 如何添加时间戳？

**问题**：需要知道日志时间

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      timestamp: true,
    },
  },
};
```

### 4. 如何自定义格式？

**问题**：需要自定义输出格式

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      format: (type, message) => `[${type}] ${message}`,
    },
  },
};
```

### 5. 如何显示堆栈？

**问题**：需要查看错误堆栈

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      stackTrace: true,
    },
  },
};
```

### 6. 如何监控性能？

**问题**：需要性能信息

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      performance: true,
    },
  },
};
```

### 7. 如何查看网络请求？

**问题**：需要查看 API 调用

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      network: true,
    },
  },
};
```

### 8. 如何处理敏感信息？

**问题**：日志包含密码等敏感信息

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      sanitize: (message) => message.replace(/password=\w+/g, "password=***"),
    },
  },
};
```

### 9. 如何限制日志数量？

**问题**：日志太多影响性能

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      maxLogs: 100,
    },
  },
};
```

### 10. 如何添加颜色？

**问题**：需要彩色输出

**解决方案**：

```javascript
const chalk = require("chalk");

module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      format: (type, message) => {
        const colors = {
          error: chalk.red,
          warn: chalk.yellow,
          log: chalk.blue,
        };
        return colors[type](`[${type}] ${message}`);
      },
    },
  },
};
```

### 11. 如何过滤来源？

**问题**：只想看特定文件的日志

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      sources: ["app/**/*.tsx"],
    },
  },
};
```

### 12. 如何处理错误？

**问题**：需要自定义错误处理

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      onError: (error) => {
        // 自定义错误处理
        sendToErrorTracking(error);
      },
    },
  },
};
```

### 13. 如何在 CI 中使用？

**问题**：CI 环境需要日志

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: process.env.CI === "true",
    },
  },
};
```

### 14. 如何调试 React 错误？

**问题**：React 组件错误

**解决方案**：

```javascript
module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      stackTrace: true,
      filter: (message) => message.includes("React"),
    },
  },
};
```

### 15. 如何保存日志？

**问题**：需要保存日志到文件

**解决方案**：

```javascript
const fs = require("fs");

module.exports = {
  experimental: {
    browserDebugInfoInTerminal: {
      enabled: true,
      onLog: (type, message) => {
        fs.appendFileSync("browser.log", `[${type}] ${message}\n`);
      },
    },
  },
};
```

## 总结

browserDebugInfoInTerminal 配置为 Next.js 开发提供了便利的浏览器调试功能。通过在终端显示浏览器信息可以：

1. **终端调试**：在终端查看浏览器信息
2. **错误追踪**：快速定位问题
3. **日志聚合**：统一查看日志
4. **开发便利**：无需切换窗口
5. **团队协作**：共享调试信息

关键要点：

- 仅在开发环境启用
- 过滤日志级别
- 自定义输出格式
- 添加时间戳
- 显示堆栈追踪
- 监控性能
- 查看网络请求
- 处理敏感信息
- 限制日志数量
- 保存日志文件

记住：browserDebugInfoInTerminal 是开发工具，不应在生产环境启用。合理配置过滤规则，避免日志过多影响性能。注意处理敏感信息，防止泄露。

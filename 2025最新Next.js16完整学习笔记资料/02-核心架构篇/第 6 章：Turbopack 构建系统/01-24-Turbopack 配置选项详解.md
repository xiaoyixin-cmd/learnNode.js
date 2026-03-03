**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# Turbopack 配置选项详解

## 概述

Turbopack 的配置系统设计简洁但功能强大,旨在为开发者提供灵活的定制能力,同时保持零配置的开箱即用体验。在 Next.js 16 中,Turbopack 成为默认的构建工具,通过合理的配置可以进一步优化构建性能和开发体验。本文将全面解析 Turbopack 的所有配置选项,包括基础配置、高级选项、性能调优和最佳实践,帮助开发者充分发挥 Turbopack 的能力。

### 配置理念

1. **零配置优先**: 默认配置适用于大多数场景
2. **渐进式增强**: 按需添加配置
3. **类型安全**: 完整的 TypeScript 支持
4. **向后兼容**: 兼容 Webpack 配置

### 配置层级

- **next.config.js**: 主配置文件
- **turbopack**: Turbopack 专用配置
- **experimental**: 实验性功能
- **webpack**: Webpack 兼容配置

## 第一部分:基础配置

### 1.1 启用 Turbopack

**开发环境**

```bash
# package.json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build --turbo",
    "start": "next start"
  }
}

# 或使用环境变量
# .env.local
TURBOPACK=1

# 然后正常启动
npm run dev
```

**基础配置文件**

```typescript
// next.config.js - 最基本配置

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 配置块
  turbopack: {
    // 项目根目录(默认: process.cwd())
    root: process.cwd(),

    // 模块解析别名
    resolveAlias: {
      "@": "./src",
    },

    // 解析扩展名
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],

    // 调试 ID
    debugIds: false,
  },
};

export default nextConfig;
```

### 1.2 模块解析

**路径别名配置**

```typescript
// next.config.js - 路径别名

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // 基础别名
      '@': './src',

      // 模块别名
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/utils': './src/utils',
      '@/types': './src/types',
      '@/hooks': './src/hooks',
      '@/config': './src/config',

      // 包别名
      'lodash': 'lodash-es',

      // 条件别名
      'isomorphic-fetch': {
        browser: 'whatwg-fetch',
        node: 'node-fetch',
      },
    },
  },
};

// 同时需要在 tsconfig.json 中配置
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

**扩展名解析**

```typescript
// next.config.js - 自定义扩展名

const nextConfig: NextConfig = {
  turbopack: {
    // 解析扩展名顺序
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json", ".wasm"],
  },
};

// 使用示例
// 可以省略扩展名导入
import Component from "./Component"; // 自动解析 .tsx
import utils from "./utils"; // 自动解析 .ts
import data from "./data"; // 自动解析 .json
```

### 1.3 加载器规则

**自定义加载器**

```typescript
// next.config.js - 加载器配置

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // SASS/SCSS 加载器
      "*.scss": {
        loaders: ["sass-loader"],
        as: "*.css",
      },

      // Less 加载器
      "*.less": {
        loaders: [
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
        as: "*.css",
      },

      // SVG 加载器
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },

      // Markdown 加载器
      "*.md": {
        loaders: [
          {
            loader: "markdown-loader",
            options: {
              pedantic: false,
            },
          },
        ],
        as: "*.js",
      },

      // YAML 加载器
      "*.yaml": {
        loaders: ["yaml-loader"],
        as: "*.json",
      },

      // 图片优化
      "*.jpg": {
        loaders: [
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 85,
              },
            },
          },
        ],
        as: "*.jpg",
      },
    },
  },
};
```

**内置加载器**

```typescript
// Turbopack 内置支持的加载器

const supportedLoaders = [
  // Babel
  "babel-loader",

  // CSS
  "css-loader",
  "postcss-loader",
  "sass-loader",
  "less-loader",

  // 文件
  "file-loader",
  "url-loader",

  // 其他
  "raw-loader",
  "json-loader",
];

// 使用示例
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.module.css": {
        loaders: [
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
        as: "*.css",
      },
    },
  },
};
```

## 第二部分:高级配置

### 2.1 实验性功能

**持久化缓存**

```typescript
// next.config.js - 持久化缓存

const nextConfig: NextConfig = {
  experimental: {
    // 启用 Turbopack 持久化缓存
    turbopackPersistentCaching: true,

    // 缓存配置
    cache: {
      // 缓存目录
      cacheDirectory: ".next/cache",

      // 缓存策略
      type: "filesystem",

      // 缓存版本
      version: "1.0",
    },
  },
};

// 缓存位置
// .next/cache/turbopack/
// ├── build/
// ├── module/
// └── asset/
```

**包导入优化**

```typescript
// next.config.js - 包导入优化

const nextConfig: NextConfig = {
  experimental: {
    // 优化包导入
    optimizePackageImports: [
      // UI 库
      "@mui/material",
      "@mui/icons-material",
      "antd",
      "@ant-design/icons",

      // 工具库
      "lodash",
      "lodash-es",
      "date-fns",
      "ramda",

      // 图表库
      "recharts",
      "chart.js",
      "echarts",

      // 图标库
      "react-icons",
      "@heroicons/react",

      // 其他大型库
      "three",
      "rxjs",
    ],
  },
};

// 效果对比
// 优化前
import { Button, Input, Modal } from "antd";
// 打包整个 antd 库 (~500KB)

// 优化后(自动转换)
import Button from "antd/es/button";
import Input from "antd/es/input";
import Modal from "antd/es/modal";
// 只打包使用的组件 (~50KB)
```

**其他实验性选项**

```typescript
// next.config.js - 其他实验性功能

const nextConfig: NextConfig = {
  experimental: {
    // CSS 优化
    optimizeCss: true,

    // 字体优化
    optimizeFonts: true,

    // 并行服务端编译
    parallelServerCompiles: true,

    // 服务端组件 HMR
    serverComponentsHmrCache: true,

    // 增量 ISR
    incrementalCacheHandlerPath: "./cache-handler.js",

    // Webpack 构建 Worker
    webpackBuildWorker: true,
  },
};
```

### 2.2 性能调优

**构建性能配置**

```typescript
// next.config.js - 构建性能

const nextConfig: NextConfig = {
  // 生产 Source Maps
  productionBrowserSourceMaps: false,

  // 压缩
  compress: true,

  // 关闭 powered by header
  poweredByHeader: false,

  // 严格模式
  reactStrictMode: true,

  // SWC 压缩
  swcMinify: true,

  // 图片配置
  images: {
    // 图片格式
    formats: ["image/avif", "image/webp"],

    // 设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // 图片尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 最小缓存时间
    minimumCacheTTL: 60,
  },

  // 编译器选项
  compiler: {
    // 移除 console
    removeConsole: process.env.NODE_ENV === "production",

    // React 属性优化
    reactRemoveProperties: process.env.NODE_ENV === "production",

    // 样式化组件
    styledComponents: true,

    // Emotion
    emotion: true,
  },
};
```

**开发服务器配置**

```typescript
// next.config.js - 开发服务器

const nextConfig: NextConfig = {
  // 开发服务器选项(通过 CLI)
  // next dev --turbo --port 3001 --hostname 0.0.0.0

  // 或通过代码
  server: {
    // 端口
    port: 3000,

    // 主机名
    hostname: "localhost",
  },

  // 开发指示器
  devIndicators: {
    // 构建活动指示器
    buildActivity: true,

    // 位置
    buildActivityPosition: "bottom-right",
  },

  // HTTP 代理
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api.example.com/:path*",
      },
    ];
  },
};
```

### 2.3 环境变量

**环境变量配置**

```typescript
// next.config.js - 环境变量

const nextConfig: NextConfig = {
  // 公开环境变量
  env: {
    CUSTOM_KEY: 'custom_value',
    API_URL: process.env.API_URL,
  },

  // 运行时配置
  serverRuntimeConfig: {
    // 仅服务端可用
    secretKey: process.env.SECRET_KEY,
  },

  publicRuntimeConfig: {
    // 客户端和服务端都可用
    publicApiUrl: process.env.PUBLIC_API_URL,
  },
};

// 使用环境变量
// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
SECRET_KEY=secret123

// .env.production
NEXT_PUBLIC_API_URL=https://api.production.com

// app/page.tsx
export default function Page() {
  // 客户端可访问
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return <div>API: {apiUrl}</div>;
}

// app/api/route.ts
export async function GET() {
  // 服务端可访问所有环境变量
  const dbUrl = process.env.DATABASE_URL;
  const secretKey = process.env.SECRET_KEY;

  // ...
}
```

## 第三部分:兼容性配置

### 3.1 Webpack 兼容

**Webpack 配置桥接**

```typescript
// next.config.js - Webpack 兼容配置

const nextConfig: NextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 Webpack 配置

    // 1. 别名
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // 2. 插件
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.CUSTOM_VAR": JSON.stringify(process.env.CUSTOM_VAR),
      })
    );

    // 3. 加载器
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    // 4. 外部化
    if (isServer) {
      config.externals.push("canvas");
    }

    // 5. 优化
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
    };

    return config;
  },

  // 服务端外部包
  serverExternalPackages: ["sharp", "canvas", "@prisma/client"],
};
```

**从 Webpack 迁移**

```typescript
// Webpack 配置迁移指南

// Webpack 配置
module.exports = {
  resolve: {
    alias: {
      "@": "./src",
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};

// Turbopack 等效配置
const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
    resolveExtensions: [".tsx", ".ts", ".js"],
    rules: {
      "*.scss": {
        loaders: ["sass-loader"],
        as: "*.css",
      },
    },
  },
};
```

### 3.2 插件系统

**自定义插件**

```typescript
// 创建 Turbopack 插件

// turbopack-plugin.js
export default function myTurbopackPlugin(options = {}) {
  return {
    name: "my-turbopack-plugin",

    setup(build) {
      // 编译前
      build.onStart(() => {
        console.log("开始编译...");
      });

      // 编译后
      build.onEnd((result) => {
        console.log("编译完成:", result);
      });

      // 模块解析
      build.onResolve({ filter: /^custom:/ }, (args) => {
        return {
          path: args.path.replace("custom:", "./custom/"),
          external: false,
        };
      });

      // 模块加载
      build.onLoad({ filter: /\.custom$/ }, async (args) => {
        const contents = await fs.readFile(args.path, "utf8");

        return {
          contents: transformCustomFormat(contents),
          loader: "js",
        };
      });
    },
  };
}

// next.config.js - 使用插件
import myTurbopackPlugin from "./turbopack-plugin.js";

const nextConfig: NextConfig = {
  turbopack: {
    plugins: [
      myTurbopackPlugin({
        // 插件选项
      }),
    ],
  },
};
```

**常用插件集成**

```typescript
// next.config.js - 集成常用插件

import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";

// Bundle 分析器
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// PWA
const pwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

// 组合配置
const nextConfig: NextConfig = {
  // 基础配置
  turbopack: {
    // ...
  },
};

// 导出组合配置
export default bundleAnalyzer(pwa(nextConfig));
```

## 第四部分:调试与诊断

### 4.1 调试配置

**启用调试**

```typescript
// next.config.js - 调试配置

const nextConfig: NextConfig = {
  turbopack: {
    // 启用调试 ID
    debugIds: true,

    // 详细日志
    logLevel: 'trace', // 'error' | 'warn' | 'info' | 'debug' | 'trace'
  },

  // 开发环境 Source Maps
  productionBrowserSourceMaps: true,
};

// 环境变量调试
// .env.local
NEXT_TURBOPACK_TRACING=1
DEBUG=*
```

**生成追踪文件**

```bash
# 生成追踪文件
NEXT_TURBOPACK_TRACING=1 next dev --turbo

# 查看追踪文件
# .next/trace/
# ├── trace-*.json
# └── ...

# 使用 Chrome DevTools 查看
# chrome://tracing
# 加载 trace 文件分析性能
```

**日志配置**

```typescript
// 自定义日志

class TurbopackLogger {
  private logFile = ".next/turbopack.log";

  log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}\n`;

    // 控制台输出
    console.log(logLine);

    // 写入文件
    fs.appendFileSync(this.logFile, logLine);
  }

  info(message: string) {
    this.log("INFO", message);
  }

  warn(message: string) {
    this.log("WARN", message);
  }

  error(message: string) {
    this.log("ERROR", message);
  }
}

// 使用
const logger = new TurbopackLogger();
logger.info("Turbopack 启动");
```

### 4.2 性能分析

**构建分析**

```bash
# 安装分析工具
npm install --save-dev @next/bundle-analyzer

# next.config.js
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})({
  // Next.js 配置
});

# 运行分析
ANALYZE=true npm run build

# 查看报告
# 自动打开浏览器显示 bundle 分析
```

**性能监控**

```typescript
// 监控构建性能

class BuildMonitor {
  private metrics: BuildMetrics = {
    startTime: 0,
    endTime: 0,
    duration: 0,
    moduleCount: 0,
    chunkCount: 0,
    assetCount: 0,
  };

  start() {
    this.metrics.startTime = Date.now();
    console.log("🚀 构建开始...");
  }

  end() {
    this.metrics.endTime = Date.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;

    this.printReport();
    this.saveReport();
  }

  recordModule() {
    this.metrics.moduleCount++;
  }

  recordChunk() {
    this.metrics.chunkCount++;
  }

  recordAsset() {
    this.metrics.assetCount++;
  }

  private printReport() {
    console.log("\n📊 构建报告:");
    console.log(`  时长: ${this.metrics.duration}ms`);
    console.log(`  模块: ${this.metrics.moduleCount}`);
    console.log(`  Chunks: ${this.metrics.chunkCount}`);
    console.log(`  资源: ${this.metrics.assetCount}`);
  }

  private saveReport() {
    fs.writeFileSync(
      "build-report.json",
      JSON.stringify(this.metrics, null, 2)
    );
  }
}
```

## 第五部分:最佳实践

### 5.1 推荐配置

**生产环境配置**

```typescript
// next.config.js - 生产环境推荐配置

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 配置
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },

  // 实验性功能
  experimental: {
    turbopackPersistentCaching: true,
    optimizePackageImports: ["antd", "@mui/material", "lodash"],
    optimizeCss: true,
    optimizeFonts: true,
  },

  // 性能优化
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // 图片优化
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // 编译器优化
  compiler: {
    removeConsole: true,
    reactRemoveProperties: true,
  },

  // Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**开发环境配置**

```typescript
// next.config.js - 开发环境推荐配置

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
    debugIds: true,
  },

  experimental: {
    turbopackPersistentCaching: true,
  },

  // 开发优化
  productionBrowserSourceMaps: false,
  reactStrictMode: true,

  // 开发指示器
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: "bottom-right",
  },

  // 编译器
  compiler: {
    removeConsole: false,
  },
};
```

### 5.2 常见配置模式

**多环境配置**

```typescript
// next.config.js - 多环境配置

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  turbopack: {
    debugIds: isDev,
  },

  experimental: {
    turbopackPersistentCaching: true,
  },

  productionBrowserSourceMaps: false,
  compress: isProd,

  compiler: {
    removeConsole: isProd,
  },

  // 环境特定配置
  ...(isDev && {
    // 开发环境
    devIndicators: {
      buildActivity: true,
    },
  }),

  ...(isProd && {
    // 生产环境
    output: "standalone",
  }),
};

export default nextConfig;
```

**模块化配置**

```typescript
// config/turbopack.config.ts
export const turbopackConfig = {
  resolveAlias: {
    "@": "./src",
    "@/components": "./src/components",
    "@/lib": "./src/lib",
  },
  resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
};

// config/images.config.ts
export const imagesConfig = {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
};

// next.config.js
import { turbopackConfig } from "./config/turbopack.config";
import { imagesConfig } from "./config/images.config";

const nextConfig: NextConfig = {
  turbopack: turbopackConfig,
  images: imagesConfig,
};

export default nextConfig;
```

## 常见问题

### Q1: 如何从 Webpack 迁移到 Turbopack?

**A**: 迁移步骤:

1. **更新 package.json**: 添加 `--turbo` 标志
2. **迁移配置**: 使用 `turbopack` 配置块
3. **转换加载器**: 使用 Turbopack 支持的加载器
4. **测试功能**: 确保所有功能正常
5. **渐进式迁移**: 保留 webpack 配置作为备用

### Q2: Turbopack 支持哪些加载器?

**A**: 支持的加载器:

1. **CSS**: css-loader, postcss-loader, sass-loader
2. **文件**: file-loader, url-loader
3. **转换**: babel-loader
4. **其他**: raw-loader, json-loader

### Q3: 如何优化 Turbopack 构建性能?

**A**: 优化方法:

1. **启用缓存**: turbopackPersistentCaching
2. **包优化**: optimizePackageImports
3. **减少监听**: 排除不必要的目录
4. **并行编译**: 默认启用

### Q4: 如何调试 Turbopack 问题?

**A**: 调试方法:

1. **启用追踪**: NEXT_TURBOPACK_TRACING=1
2. **查看日志**: 检查 .next/trace
3. **调试 ID**: debugIds: true
4. **详细日志**: logLevel: 'trace'

## 适用场景

### 1. 新项目

- 使用默认配置
- 渐进式添加配置
- 充分利用新特性
- 优化开发体验

### 2. 迁移项目

- 保留 Webpack 配置
- 渐进式迁移
- 功能对比测试
- 性能基准测试

### 3. 大型项目

- 启用持久化缓存
- 优化包导入
- 自定义加载器
- 性能监控

### 4. 团队协作

- 统一配置规范
- 环境变量管理
- 调试工具配置
- 文档化配置

## 注意事项

### 1. 配置管理

- ✅ 使用 TypeScript 类型
- ✅ 模块化配置
- ✅ 环境区分
- ❌ 避免过度配置

### 2. 性能优化

- ✅ 启用持久化缓存
- ✅ 优化包导入
- ✅ 合理使用加载器
- ❌ 避免不必要的转换

### 3. 调试诊断

- ✅ 开发环境启用调试
- ✅ 使用追踪工具
- ✅ 记录性能指标
- ✅ 保存构建日志

### 4. 兼容性

- ✅ 保留 Webpack 配置
- ✅ 测试功能完整性
- ✅ 渐进式迁移
- ✅ 文档化差异

## 总结

Turbopack 的配置系统简洁但强大,为开发者提供了灵活的定制能力。

### 核心要点

1. **零配置优先**: 默认配置适用大多数场景
2. **渐进式增强**: 按需添加配置选项
3. **类型安全**: 完整的 TypeScript 支持
4. **向后兼容**: 兼容 Webpack 配置
5. **性能优化**: 丰富的优化选项

### 配置建议

- **新项目**: 使用默认配置 + 基础别名
- **迁移项目**: 保留 Webpack + 渐进迁移
- **大型项目**: 启用缓存 + 优化包导入
- **团队协作**: 统一配置 + 文档化

掌握 Turbopack 配置是充分发挥其性能优势的关键。

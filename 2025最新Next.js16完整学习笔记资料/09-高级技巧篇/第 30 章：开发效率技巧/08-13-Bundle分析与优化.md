**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# 08-13-Bundle 分析与优化

Bundle 分析是优化应用性能的重要手段。本文介绍如何分析和优化 Next.js 应用的 Bundle。

## 核心概念

### Bundle 分析维度

| 维度 | 指标     | 目标 | 工具              |
| ---- | -------- | ---- | ----------------- |
| 体积 | 文件大小 | 减小 | Bundle Analyzer   |
| 数量 | 文件数量 | 减少 | Webpack Stats     |
| 重复 | 重复代码 | 消除 | Duplicate Checker |
| 依赖 | 依赖关系 | 优化 | Dependency Graph  |

## 实战场景

### 实战场景一: 安装 Bundle Analyzer

```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

module.exports = withBundleAnalyzer({
  // 其他配置
});
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "ANALYZE=true BUNDLE_ANALYZE=server next build",
    "analyze:browser": "ANALYZE=true BUNDLE_ANALYZE=browser next build"
  }
}
```

### 实战场景二: 分析 Bundle 组成

```javascript
// scripts/analyze-bundle.js
const fs = require("fs");
const path = require("path");

function analyzeBundleSize(buildDir) {
  const statsFile = path.join(buildDir, "webpack-stats.json");
  const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));

  const modules = stats.modules.map((m) => ({
    name: m.name,
    size: m.size,
    chunks: m.chunks,
  }));

  modules.sort((a, b) => b.size - a.size);

  console.log("Top 10 largest modules:");
  modules.slice(0, 10).forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}: ${(m.size / 1024).toFixed(2)} KB`);
  });
}

analyzeBundleSize(".next");
```

### 实战场景三: 识别重复依赖

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: "commons",
            chunks: "all",
            minChunks: 2,
            priority: 20,
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules/.test(module.identifier())
              );
            },
            name(module) {
              const hash = crypto.createHash("sha1");
              hash.update(module.identifier());
              return hash.digest("hex").substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};
```

### 实战场景四: 优化第三方库

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      "lodash",
      "date-fns",
      "react-icons",
      "@mui/material",
      "@mui/icons-material",
      "antd",
    ],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      lodash: "lodash-es",
      moment: "dayjs",
    };

    return config;
  },
};
```

### 实战场景五: 动态导入优化

```typescript
// components/HeavyChart.tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("recharts").then((mod) => mod.LineChart), {
  loading: () => <div>加载图表中...</div>,
  ssr: false,
});

export function HeavyChart() {
  return <Chart data={data} />;
}
```

### 实战场景六: 按需加载组件

```typescript
// components/ConditionalComponent.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./Heavy"));

export function ConditionalComponent() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(true)}>加载组件</button>
      {show && <HeavyComponent />}
    </div>
  );
}
```

### 实战场景七: 分析依赖树

```javascript
// scripts/analyze-deps.js
const { execSync } = require("child_process");

function analyzeDependencies() {
  const output = execSync("npm ls --all --json").toString();
  const deps = JSON.parse(output);

  function findDuplicates(node, path = []) {
    const duplicates = [];

    if (node.dependencies) {
      Object.entries(node.dependencies).forEach(([name, info]) => {
        const currentPath = [...path, name];

        if (info.dependencies) {
          duplicates.push(...findDuplicates(info, currentPath));
        }
      });
    }

    return duplicates;
  }

  const duplicates = findDuplicates(deps);
  console.log("Duplicate dependencies:", duplicates);
}

analyzeDependencies();
```

### 实战场景八: 优化 Polyfill

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
};
```

### 实战场景九: 移除未使用代码

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.usedExports = true;
    config.optimization.sideEffects = true;

    return config;
  },
};
```

```json
// package.json
{
  "sideEffects": ["*.css", "*.scss", "*.sass"]
}
```

### 实战场景十: 压缩优化

```javascript
// next.config.js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info"],
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
              ascii_only: true,
            },
          },
          extractComments: false,
          parallel: true,
        }),
      ];
    }
    return config;
  },
};
```

### 实战场景十一: CSS 优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            modules: true,
            importLoaders: 1,
          },
        },
      ],
    });

    return config;
  },
};
```

### 实战场景十二: 图片优化

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### 实战场景十三: 字体优化

```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 实战场景十四: 外部依赖优化

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        sharp: "commonjs sharp",
        canvas: "commonjs canvas",
        bufferutil: "commonjs bufferutil",
        "utf-8-validate": "commonjs utf-8-validate",
      });
    }

    return config;
  },
};
```

### 实战场景十五: 监控 Bundle 大小

```javascript
// scripts/check-bundle-size.js
const fs = require("fs");
const path = require("path");

const MAX_SIZE = 500 * 1024; // 500KB

function checkBundleSize() {
  const buildDir = path.join(process.cwd(), ".next/static/chunks");
  const files = fs.readdirSync(buildDir);

  const oversized = [];

  files.forEach((file) => {
    const filePath = path.join(buildDir, file);
    const stats = fs.statSync(filePath);

    if (stats.size > MAX_SIZE) {
      oversized.push({
        file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
      });
    }
  });

  if (oversized.length > 0) {
    console.error("Oversized bundles detected:");
    oversized.forEach(({ file, sizeKB }) => {
      console.error(`  ${file}: ${sizeKB} KB`);
    });
    process.exit(1);
  }

  console.log("All bundles are within size limits");
}

checkBundleSize();
```

### 实战场景十六: 代码分割策略

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules/.test(module.identifier())
              );
            },
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace("@", "")}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              return chunks.map((chunk) => chunk.name).join("~");
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }

    return config;
  },
};
```

### 实战场景十七: 预加载关键资源

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.example.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 实战场景十八: 懒加载路由

```typescript
// app/dashboard/page.tsx
import dynamic from "next/dynamic";

const Analytics = dynamic(() => import("@/components/Analytics"), {
  loading: () => <div>加载分析组件...</div>,
  ssr: false,
});

const Reports = dynamic(() => import("@/components/Reports"), {
  loading: () => <div>加载报表组件...</div>,
});

export default function Dashboard() {
  return (
    <div>
      <Analytics />
      <Reports />
    </div>
  );
}
```

### 实战场景十九: 优化第三方脚本

```typescript
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.example.com/analytics.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

### 实战场景二十: 持续监控

```javascript
// scripts/monitor-bundle.js
const fs = require("fs");
const path = require("path");

function monitorBundle() {
  const statsFile = path.join(".next", "build-manifest.json");
  const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));

  const report = {
    timestamp: new Date().toISOString(),
    pages: Object.keys(stats.pages).length,
    totalSize: 0,
    largestPage: null,
  };

  Object.entries(stats.pages).forEach(([page, files]) => {
    const pageSize = files.reduce((sum, file) => {
      const filePath = path.join(".next", file);
      if (fs.existsSync(filePath)) {
        return sum + fs.statSync(filePath).size;
      }
      return sum;
    }, 0);

    report.totalSize += pageSize;

    if (!report.largestPage || pageSize > report.largestPage.size) {
      report.largestPage = { page, size: pageSize };
    }
  });

  console.log("Bundle Report:");
  console.log(`  Total Pages: ${report.pages}`);
  console.log(
    `  Total Size: ${(report.totalSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `  Largest Page: ${report.largestPage.page} (${(
      report.largestPage.size / 1024
    ).toFixed(2)} KB)`
  );

  // 保存报告
  const reportsDir = path.join("reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  fs.writeFileSync(
    path.join(reportsDir, `bundle-${Date.now()}.json`),
    JSON.stringify(report, null, 2)
  );
}

monitorBundle();
```

## 适用场景

### 分析工具对比

| 工具                | 功能       | 优点     | 缺点            |
| ------------------- | ---------- | -------- | --------------- |
| Bundle Analyzer     | 可视化分析 | 直观易用 | 需要额外配置    |
| Webpack Stats       | 详细统计   | 信息全面 | 数据复杂        |
| Source Map Explorer | 源码分析   | 精确定位 | 需要 Source Map |
| Lighthouse          | 性能评分   | 综合评估 | 不够详细        |

## 注意事项

### 1. 定期分析

建立定期分析 Bundle 的习惯,及时发现问题。

### 2. 设置阈值

为 Bundle 大小设置合理的阈值,超过时告警。

### 3. 关注趋势

监控 Bundle 大小的变化趋势,避免持续增长。

### 4. 平衡优化

不要过度优化导致代码复杂度增加。

### 5. 文档化决策

记录优化决策和效果,方便团队了解。

## 常见问题

### 1. 如何分析 Bundle 组成?

使用@next/bundle-analyzer 可视化分析。

### 2. 如何识别重复依赖?

使用 npm ls 或 yarn why 命令。

### 3. 如何优化第三方库?

使用动态导入、按需加载、替换轻量库。

### 4. 如何减小 Bundle 体积?

代码分割、Tree Shaking、压缩优化。

### 5. 如何监控 Bundle 大小?

编写脚本定期检查,设置 CI/CD 检查。

### 6. 动态导入何时使用?

大型组件、条件加载、路由级分割。

### 7. 如何优化 CSS?

使用 CSS Modules、移除未使用样式、压缩。

### 8. 如何优化图片?

使用 next/image、现代格式、CDN。

### 9. 如何优化字体?

使用 next/font、子集化、预加载。

### 10. 如何处理 Polyfill?

按需加载、使用 browserslist 配置。

### 11. 如何优化外部依赖?

使用 externals 配置、CDN 加载。

### 12. 如何设置 Bundle 大小限制?

编写检查脚本,在 CI/CD 中运行。

### 13. 如何分析依赖树?

使用 npm ls、webpack-bundle-analyzer。

### 14. 如何优化代码分割?

配置 splitChunks、使用动态导入。

### 15. 如何预加载关键资源?

使用 link 标签的 preload、prefetch。

### 16. 如何懒加载路由?

使用 dynamic 导入、Suspense。

### 17. 如何优化第三方脚本?

使用 Script 组件、合适的加载策略。

### 18. 如何持续监控 Bundle?

编写监控脚本、集成到 CI/CD。

### 19. 如何对比不同版本?

保存历史报告、对比分析。

### 20. 如何优化构建速度?

使用缓存、并行编译、减少优化级别。

### 21. 如何实现 Bundle 预算监控?

**问题**: 自动监控 Bundle 大小是否超标

**解决方案**:

```javascript
// scripts/check-bundle-size.js
const fs = require("fs");
const path = require("path");

const BUDGET = {
  "pages/index.js": 200 * 1024, // 200KB
  "pages/_app.js": 100 * 1024, // 100KB
};

function checkBundleSize() {
  const buildDir = path.join(process.cwd(), ".next/static/chunks/pages");
  let hasError = false;

  Object.entries(BUDGET).forEach(([file, maxSize]) => {
    const filePath = path.join(buildDir, file);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);

      if (stats.size > maxSize) {
        console.error(
          `❌ ${file}: ${stats.size} bytes (超出 ${maxSize} bytes)`
        );
        hasError = true;
      } else {
        console.log(`✅ ${file}: ${stats.size} bytes`);
      }
    }
  });

  if (hasError) {
    process.exit(1);
  }
}

checkBundleSize();
```

### 22. 如何分析重复依赖?

**问题**: 检测 Bundle 中的重复模块

**解决方案**:

```bash
# 安装工具
npm install --save-dev webpack-bundle-analyzer duplicate-package-checker-webpack-plugin
```

```javascript
// next.config.js
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new DuplicatePackageCheckerPlugin({
          verbose: true,
          emitError: true,
        })
      );
    }
    return config;
  },
};
```

### 23. 如何优化 Polyfill?

**问题**: 减少不必要的 Polyfill

**解决方案**:

```javascript
// next.config.js
module.exports = {
  // 禁用自动polyfill
  experimental: {
    modern: true,
  },

  // 自定义browserslist
  browserslist: [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
  ],
};
```

### 24. 如何实现按需加载 CSS?

**问题**: CSS 文件过大

**解决方案**:

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },

  webpack: (config) => {
    config.optimization.splitChunks.cacheGroups.styles = {
      name: "styles",
      test: /\.css$/,
      chunks: "all",
      enforce: true,
    };
    return config;
  },
};
```

### 25. 如何优化字体加载?

**问题**: 字体文件影响性能

**解决方案**:

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="zh" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## 高级优化技巧

### 1. 使用 Webpack Bundle Analyzer

```bash
# 安装
npm install --save-dev @next/bundle-analyzer

# 使用
ANALYZE=true npm run build
```

### 2. 实现代码分割策略

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        default: false,
        vendors: false,
        commons: {
          name: "commons",
          chunks: "all",
          minChunks: 2,
        },
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `npm.${packageName.replace("@", "")}`;
          },
        },
      },
    };
    return config;
  },
};
```

### 3. 监控 Bundle 大小趋势

```javascript
// scripts/track-bundle-size.js
const fs = require("fs");
const path = require("path");

function trackBundleSize() {
  const buildDir = path.join(process.cwd(), ".next");
  const historyFile = path.join(process.cwd(), "bundle-history.json");

  // 读取当前大小
  const currentSize = calculateTotalSize(buildDir);

  // 读取历史记录
  let history = [];
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
  }

  // 添加新记录
  history.push({
    date: new Date().toISOString(),
    size: currentSize,
    commit: process.env.GIT_COMMIT || "unknown",
  });

  // 保存历史
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  console.log(`Bundle大小: ${(currentSize / 1024).toFixed(2)}KB`);
}

function calculateTotalSize(dir) {
  let totalSize = 0;

  function walk(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith(".js")) {
        totalSize += stats.size;
      }
    });
  }

  walk(dir);
  return totalSize;
}

trackBundleSize();
```

## 总结

Bundle 分析与优化是持续的过程,需要定期进行。

## 额外优化工具

### 1. 使用 Bundle Analyzer

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // 其他配置
});
```

### 2. 使用 Webpack Bundle Size Analyzer

```bash
ANALYZE=true npm run build
```

### 3. 配置 Source Map Explorer

```bash
npm install --save-dev source-map-explorer
```

```json
// package.json
{
  "scripts": {
    "analyze": "source-map-explorer .next/static/**/*.js"
  }
}
```

### 4. 使用 Size Limit

```bash
npm install --save-dev size-limit @size-limit/preset-app
```

```json
// package.json
{
  "size-limit": [
    {
      "path": ".next/static/**/*.js",
      "limit": "200 KB"
    }
  ]
}
```

### 5. 监控 Bundle 大小趋势

```javascript
// scripts/track-bundle-size.js
const fs = require("fs");
const path = require("path");

const bundleStats = {
  timestamp: new Date().toISOString(),
  sizes: {},
};

// 读取 bundle 大小
const statsFile = path.join(__dirname, "../.next/build-manifest.json");
const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));

// 保存历史记录
fs.writeFileSync("bundle-history.json", JSON.stringify(bundleStats, null, 2));
```

关键要点:

1. 使用分析工具
2. 识别优化机会
3. 实施优化策略
4. 监控优化效果
5. 设置大小限制
6. 定期审查
7. 文档化决策
8. 团队协作
9. 持续改进
10. 平衡成本

记住,优化要基于数据,不要盲目优化。

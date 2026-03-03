**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# next CLI 命令详解

## 概述

Next.js CLI 是 Next.js 框架提供的命令行工具，用于开发、构建、启动和分析 Next.js 应用。掌握 CLI 命令可以提高开发效率，优化构建流程。

### Next.js CLI 的作用

1. **开发服务器**：启动开发环境
2. **生产构建**：构建生产版本
3. **生产服务器**：启动生产服务器
4. **代码分析**：分析打包结果
5. **类型检查**：TypeScript 类型检查

## 基础用法

### next dev

启动开发服务器。

```bash
# 默认端口3000
next dev

# 自定义端口
next dev -p 4000

# 自定义主机
next dev -H 0.0.0.0

# 启用Turbopack
next dev --turbo
```

### next build

构建生产版本。

```bash
# 标准构建
next build

# 显示详细信息
next build --debug

# 生成构建ID
next build --profile

# 实验性功能
next build --experimental-build-mode compile
```

### next start

启动生产服务器。

```bash
# 默认端口3000
next start

# 自定义端口
next start -p 8080

# 自定义主机
next start -H 0.0.0.0

# 保持活动
next start --keepAliveTimeout 70000
```

### next lint

运行 ESLint 检查。

```bash
# 检查所有文件
next lint

# 检查特定目录
next lint --dir app

# 修复问题
next lint --fix

# 显示详细信息
next lint --debug
```

### next info

显示系统信息。

```bash
# 显示环境信息
next info

# 输出到文件
next info > info.txt
```

## 高级配置

### 开发服务器配置

```bash
# 启用HTTPS
next dev --experimental-https

# 自定义证书
next dev --experimental-https-key ./certificates/localhost-key.pem --experimental-https-cert ./certificates/localhost.pem

# 禁用快速刷新
next dev --no-fast-refresh

# 启用实验性功能
next dev --experimental-debug-memory-usage
```

### 构建优化

```bash
# 并行构建
next build --experimental-parallel-build

# 增量构建
next build --experimental-incremental-build

# 分析打包
next build --profile

# 生成静态导出
next build && next export
```

### 生产服务器配置

```bash
# 自定义工作进程
next start --workers 4

# 启用压缩
next start --compression

# 自定义超时
next start --keepAliveTimeout 70000

# 启用实验性功能
next start --experimental-https
```

### 环境变量

```bash
# 指定环境
NODE_ENV=production next build

# 自定义变量
NEXT_PUBLIC_API_URL=https://api.example.com next dev

# 加载.env文件
next dev --env-file .env.local
```

### 调试模式

```bash
# 启用调试
NODE_OPTIONS='--inspect' next dev

# 调试构建
NODE_OPTIONS='--inspect-brk' next build

# 内存分析
NODE_OPTIONS='--max-old-space-size=4096' next build
```

### 性能分析

```bash
# 生成性能报告
next build --profile

# 分析打包大小
ANALYZE=true next build

# 生成统计文件
next build --experimental-build-stats
```

### 类型检查

```bash
# 构建时类型检查
next build --typescript

# 跳过类型检查
next build --no-typescript

# 严格模式
next build --typescript --strict
```

### 缓存管理

```bash
# 清除缓存
rm -rf .next

# 禁用缓存
next build --no-cache

# 清除SWC缓存
rm -rf .next/cache
```

### 实验性功能

```bash
# 启用Turbopack
next dev --turbo

# 启用React编译器
next dev --experimental-react-compiler

# 启用PPR
next dev --experimental-ppr

# 启用类型化路由
next dev --experimental-typedRoutes
```

## CLI 命令完整参数说明

### next dev 完整参数

| 参数                              | 类型    | 默认值    | 说明           |
| --------------------------------- | ------- | --------- | -------------- |
| -p, --port                        | number  | 3000      | 指定端口号     |
| -H, --hostname                    | string  | localhost | 指定主机名     |
| --turbo                           | boolean | false     | 启用 Turbopack |
| --experimental-https              | boolean | false     | 启用 HTTPS     |
| --experimental-https-key          | string  | -         | HTTPS 私钥路径 |
| --experimental-https-cert         | string  | -         | HTTPS 证书路径 |
| --experimental-debug-memory-usage | boolean | false     | 调试内存使用   |

```bash
# 完整示例
next dev \
  --port 3000 \
  --hostname 0.0.0.0 \
  --turbo \
  --experimental-https
```

### next build 完整参数

| 参数                      | 类型    | 默认值 | 说明              |
| ------------------------- | ------- | ------ | ----------------- |
| --debug                   | boolean | false  | 显示调试信息      |
| --profile                 | boolean | false  | 生成性能分析      |
| --no-lint                 | boolean | false  | 跳过 ESLint       |
| --no-mangling             | boolean | false  | 禁用代码混淆      |
| --experimental-build-mode | string  | -      | 实验性构建模式    |
| --experimental-app-only   | boolean | false  | 仅构建 App Router |

```bash
# 完整示例
next build \
  --debug \
  --profile \
  --no-lint
```

### next start 完整参数

| 参数               | 类型   | 默认值    | 说明            |
| ------------------ | ------ | --------- | --------------- |
| -p, --port         | number | 3000      | 指定端口号      |
| -H, --hostname     | string | localhost | 指定主机名      |
| --keepAliveTimeout | number | 5000      | Keep-Alive 超时 |

```bash
# 完整示例
next start \
  --port 8080 \
  --hostname 0.0.0.0 \
  --keepAliveTimeout 70000
```

### next lint 完整参数

| 参数           | 类型     | 默认值              | 说明         |
| -------------- | -------- | ------------------- | ------------ |
| --dir          | string[] | -                   | 指定检查目录 |
| --file         | string[] | -                   | 指定检查文件 |
| --ext          | string[] | [.js,.jsx,.ts,.tsx] | 文件扩展名   |
| --fix          | boolean  | false               | 自动修复问题 |
| --strict       | boolean  | false               | 严格模式     |
| --max-warnings | number   | -1                  | 最大警告数   |

```bash
# 完整示例
next lint \
  --dir app pages \
  --ext .ts,.tsx \
  --fix \
  --max-warnings 0
```

## 实战案例

### 案例 1：本地开发环境配置

**场景**: 配置一个完整的本地开发环境

```bash
# 基础开发
next dev -p 3000

# 启用Turbopack加速
next dev --turbo

# 启用HTTPS本地开发
next dev --experimental-https

# 局域网访问
next dev -H 0.0.0.0 -p 3000

# 组合使用
next dev --turbo -H 0.0.0.0 -p 3000
```

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "dev:https": "next dev --experimental-https",
    "dev:lan": "next dev -H 0.0.0.0",
    "dev:full": "next dev --turbo -H 0.0.0.0 --experimental-https"
  }
}
```

**自定义 HTTPS 证书**:

```bash
# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# 使用自定义证书
next dev \
  --experimental-https \
  --experimental-https-key ./key.pem \
  --experimental-https-cert ./cert.pem
```

### 案例 2：多环境构建配置

**场景**: 为不同环境配置不同的构建流程

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "build:dev": "NODE_ENV=development next build",
    "build:staging": "NODE_ENV=staging next build",
    "build:prod": "NODE_ENV=production next build",
    "build:analyze": "ANALYZE=true next build",
    "build:profile": "next build --profile",
    "build:debug": "next build --debug"
  }
}
```

**环境变量配置**:

```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENV=development

# .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.example.com
NEXT_PUBLIC_ENV=staging

# .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ENV=production
```

**构建脚本**:

```bash
#!/bin/bash
# build.sh

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: ./build.sh [dev|staging|prod]"
  exit 1
fi

echo "Building for $ENV environment..."

# 清除缓存
rm -rf .next

# 加载环境变量
export $(cat .env.$ENV | xargs)

# 构建
next build

echo "Build completed for $ENV"
```

### 案例 3：性能优化构建

**场景**: 优化构建性能和输出大小

```bash
# 分析打包大小
ANALYZE=true next build

# 生成性能报告
next build --profile

# 增加内存限制
NODE_OPTIONS='--max-old-space-size=4096' next build

# 禁用代码混淆(调试用)
next build --no-mangling
```

**安装分析工具**:

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

**性能分析脚本**:

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "BUNDLE_ANALYZE=server next build",
    "analyze:browser": "BUNDLE_ANALYZE=browser next build"
  }
}
```

### 案例 4：Docker 容器化部署

**场景**: 使用 Docker 部署 Next.js 应用

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 依赖安装阶段
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN next build

# 生产运行阶段
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker Compose 配置**:

```yaml
# docker-compose.yml
version: "3.8"

services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.example.com
    restart: unless-stopped
```

**构建和运行**:

```bash
# 构建镜像
docker build -t my-nextjs-app .

# 运行容器
docker run -p 3000:3000 my-nextjs-app

# 使用 Docker Compose
docker-compose up -d
```

### 案例 5：PM2 进程管理

**场景**: 使用 PM2 管理 Next.js 生产进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start "next start -p 8080" --name "my-app"

# 查看状态
pm2 status

# 查看日志
pm2 logs my-app

# 重启应用
pm2 restart my-app

# 停止应用
pm2 stop my-app

# 删除应用
pm2 delete my-app
```

**PM2 配置文件**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-nextjs-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 8080",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
```

**使用配置文件**:

```bash
# 启动
pm2 start ecosystem.config.js

# 重启
pm2 restart ecosystem.config.js

# 停止
pm2 stop ecosystem.config.js
```

### 案例 6：CI/CD 集成

**场景**: GitHub Actions 自动化构建和部署

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: next lint

      - name: Type check
        run: npm run type-check

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: next build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: .next

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**GitLab CI 配置**:

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

cache:
  paths:
    - node_modules/
    - .next/cache/

lint:
  stage: lint
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - next lint
    - npm run type-check

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - next build
  artifacts:
    paths:
      - .next/
    expire_in: 1 week

deploy:production:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - next build
    - echo "Deploying to production..."
  only:
    - main
  environment:
    name: production
    url: https://example.com
```

### 案例 7：自定义构建脚本

**场景**: 创建复杂的构建流程

```bash
#!/bin/bash
# scripts/build.sh

set -e

echo "🚀 Starting build process..."

# 1. 清理
echo "📦 Cleaning previous build..."
rm -rf .next
rm -rf out

# 2. 环境检查
echo "🔍 Checking environment..."
node --version
npm --version

# 3. 依赖安装
echo "📥 Installing dependencies..."
npm ci

# 4. 代码检查
echo "🔎 Running linters..."
next lint --max-warnings 0

# 5. 类型检查
echo "📝 Type checking..."
npm run type-check

# 6. 测试
echo "🧪 Running tests..."
npm test -- --coverage

# 7. 构建
echo "🏗️  Building application..."
NODE_ENV=production next build

# 8. 分析
if [ "$ANALYZE" = "true" ]; then
  echo "📊 Analyzing bundle..."
  ANALYZE=true next build
fi

# 9. 生成报告
echo "📄 Generating build report..."
next info > build-info.txt

echo "✅ Build completed successfully!"
```

**使用脚本**:

```json
// package.json
{
  "scripts": {
    "build": "./scripts/build.sh",
    "build:analyze": "ANALYZE=true ./scripts/build.sh"
  }
}
```

## 高级技巧

### 1. 自定义服务器

虽然不推荐,但有时需要自定义服务器:

```javascript
// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

```json
// package.json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

### 2. 预渲染调试

```bash
# 查看预渲染页面
next build && next export

# 检查生成的HTML
ls -la out/

# 本地预览
npx serve out
```

### 3. 性能监控

```bash
# 启用性能追踪
NODE_OPTIONS='--inspect' next dev

# 生成CPU profile
NODE_OPTIONS='--cpu-prof' next build

# 生成heap snapshot
NODE_OPTIONS='--heap-prof' next build
```

### 4. 环境变量调试

```bash
# 打印所有环境变量
next info

# 检查特定变量
echo $NEXT_PUBLIC_API_URL

# 临时设置变量
NEXT_PUBLIC_DEBUG=true next dev
```

### 5. 缓存策略

```bash
# 清除所有缓存
rm -rf .next node_modules/.cache

# 仅清除构建缓存
rm -rf .next

# 仅清除SWC缓存
rm -rf .next/cache

# 禁用缓存构建
next build --no-cache
```

## 适用场景

| 命令                 | 场景     | 用途                | 推荐场景       |
| -------------------- | -------- | ------------------- | -------------- |
| next dev             | 本地开发 | 启动开发服务器      | 日常开发、调试 |
| next dev --turbo     | 快速开发 | 使用 Turbopack 加速 | 大型项目开发   |
| next build           | 生产构建 | 构建生产版本        | CI/CD、部署前  |
| next build --profile | 性能分析 | 生成性能报告        | 性能优化       |
| next start           | 生产部署 | 启动生产服务器      | 自托管部署     |
| next lint            | 代码检查 | 运行 ESLint         | 代码提交前     |
| next lint --fix      | 自动修复 | 修复 ESLint 错误    | 批量修复       |
| next info            | 问题排查 | 查看环境信息        | 调试、报告 bug |

## 注意事项

### 1. 端口冲突

```bash
# 检查端口占用
lsof -i :3000

# 使用其他端口
next dev -p 4000
```

### 2. 内存限制

```bash
# 增加内存限制
NODE_OPTIONS='--max-old-space-size=4096' next build
```

### 3. 缓存问题

```bash
# 清除缓存
rm -rf .next

# 重新构建
next build
```

### 4. 环境变量

```bash
# 确保环境变量正确
echo $NODE_ENV

# 加载.env文件
next dev --env-file .env.local
```

### 5. 类型检查

```bash
# 启用类型检查
next build --typescript

# 跳过类型检查（不推荐）
next build --no-typescript
```

## 常见问题

### 1. 如何更改端口?

**问题**: 默认端口 3000 被占用

**解决方案**:

```bash
# 方法1: 命令行参数
next dev -p 4000

# 方法2: 环境变量
PORT=4000 next dev

# 方法3: package.json
{
  "scripts": {
    "dev": "next dev -p 4000"
  }
}
```

**检查端口占用**:

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 2. 如何启用 HTTPS?

**问题**: 需要 HTTPS 进行本地开发(如测试 PWA、WebRTC 等)

**解决方案**:

```bash
# 使用自签名证书
next dev --experimental-https

# 使用自定义证书
next dev \
  --experimental-https \
  --experimental-https-key ./localhost-key.pem \
  --experimental-https-cert ./localhost.pem
```

**生成证书**:

```bash
# 使用mkcert(推荐)
brew install mkcert
mkcert -install
mkcert localhost

# 使用openssl
openssl req -x509 -newkey rsa:4096 \
  -keyout localhost-key.pem \
  -out localhost.pem \
  -days 365 -nodes
```

### 3. 如何加速构建?

**问题**: 构建时间过长

**解决方案对比**:

| 方法           | 效果         | 适用场景 |
| -------------- | ------------ | -------- |
| 使用 Turbopack | 提速 5-10 倍 | 开发环境 |
| 增加内存       | 提速 20-30%  | 大型项目 |
| 并行构建       | 提速 30-50%  | 多核 CPU |
| 增量构建       | 提速 50-80%  | 重复构建 |

```bash
# 1. 使用Turbopack(开发环境)
next dev --turbo

# 2. 增加Node.js内存
NODE_OPTIONS='--max-old-space-size=4096' next build

# 3. 使用SWC(默认启用)
# next.config.js
module.exports = {
  swcMinify: true,
}

# 4. 禁用source map(生产环境)
# next.config.js
module.exports = {
  productionBrowserSourceMaps: false,
}
```

### 4. 如何分析打包大小?

**问题**: 需要分析和优化打包体积

**解决方案**:

```bash
# 1. 安装分析工具
npm install --save-dev @next/bundle-analyzer

# 2. 配置next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // 配置
})

# 3. 运行分析
ANALYZE=true next build
```

**分析结果解读**:

| 指标         | 说明       | 优化目标     |
| ------------ | ---------- | ------------ |
| Parsed Size  | 解析后大小 | 实际加载大小 |
| Gzipped Size | 压缩后大小 | 网络传输大小 |
| Stat Size    | 原始大小   | 源代码大小   |

### 5. 如何清除缓存?

**问题**: 缓存导致构建问题或显示旧内容

**解决方案**:

```bash
# 清除所有缓存
rm -rf .next node_modules/.cache

# 仅清除Next.js缓存
rm -rf .next

# 仅清除SWC缓存
rm -rf .next/cache

# 清除并重新构建
rm -rf .next && next build

# 清除node_modules并重新安装
rm -rf node_modules package-lock.json
npm install
```

**何时需要清除缓存**:

- 更新 Next.js 版本后
- 修改 next.config.js 后
- 出现奇怪的构建错误
- 页面显示旧内容

### 6. 如何调试构建错误?

**问题**: 构建失败但错误信息不清楚

**解决方案**:

```bash
# 1. 启用调试模式
next build --debug

# 2. 查看详细日志
DEBUG=* next build

# 3. 生成构建追踪
next build --experimental-debug

# 4. 检查TypeScript错误
next build --typescript

# 5. 使用Node.js调试器
NODE_OPTIONS='--inspect-brk' next build
```

**常见构建错误**:

| 错误类型         | 原因     | 解决方法             |
| ---------------- | -------- | -------------------- |
| Out of memory    | 内存不足 | 增加内存限制         |
| Module not found | 依赖缺失 | 检查 package.json    |
| Type error       | 类型错误 | 修复 TypeScript 错误 |
| Syntax error     | 语法错误 | 检查代码语法         |

### 7. 如何处理 TypeScript 类型检查?

**问题**: 类型检查影响构建速度

**解决方案对比**:

| 方法     | 优点         | 缺点           | 适用场景    |
| -------- | ------------ | -------------- | ----------- |
| 默认检查 | 发现类型错误 | 构建较慢       | 开发环境    |
| 跳过检查 | 构建快速     | 可能有类型错误 | CI 快速验证 |
| 单独检查 | 并行执行     | 需要额外步骤   | 生产构建    |

```bash
# 启用类型检查(默认)
next build

# 跳过类型检查
next build --no-typescript

# 单独运行类型检查
tsc --noEmit

# package.json配置
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "npm run type-check && next build"
  }
}
```

### 8. 如何配置局域网访问?

**问题**: 需要在手机或其他设备上测试

**解决方案**:

```bash
# 监听所有网络接口
next dev -H 0.0.0.0

# 指定端口
next dev -H 0.0.0.0 -p 3000

# 查看本机IP
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

**访问方式**:

```
# 本机访问
http://localhost:3000

# 局域网访问
http://192.168.1.100:3000

# 手机访问(确保在同一WiFi)
http://192.168.1.100:3000
```

### 9. 如何生成静态站点?

**问题**: 需要部署到静态托管服务

**解决方案**:

```bash
# 1. 配置next.config.js
module.exports = {
  output: 'export',
}

# 2. 构建
next build

# 3. 输出目录
# 静态文件在 out/ 目录
```

**限制**:

- 不支持动态路由(需要 generateStaticParams)
- 不支持 API Routes
- 不支持 Server Actions
- 不支持 ISR

### 10. 如何启用响应压缩?

**问题**: 减少网络传输大小

**解决方案**:

```bash
# Next.js自动启用gzip压缩
next start

# 自定义服务器启用压缩
npm install compression
```

```javascript
// server.js
const compression = require("compression");
const express = require("express");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // 启用压缩
  server.use(compression());

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000);
});
```

### 11. 如何查看系统环境信息?

**问题**: 需要诊断环境问题或报告 bug

**解决方案**:

```bash
# 查看Next.js环境信息
next info

# 输出示例:
# Operating System:
#   Platform: darwin
#   Arch: arm64
#   Version: Darwin Kernel Version 22.1.0
# Binaries:
#   Node: 18.12.0
#   npm: 8.19.2
#   Yarn: 1.22.19
#   pnpm: 7.14.0
# Relevant packages:
#   next: 16.0.0
#   react: 19.2.0
#   react-dom: 19.2.0

# 保存到文件
next info > environment.txt
```

### 12. 如何自动修复 ESLint 错误?

**问题**: 大量 ESLint 错误需要修复

**解决方案**:

```bash
# 自动修复所有可修复的错误
next lint --fix

# 修复特定目录
next lint --dir app --fix

# 修复特定文件
next lint --file app/page.tsx --fix

# 严格模式(警告也算错误)
next lint --max-warnings 0
```

**配置自动修复**:

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 13. 如何使用 Turbopack?

**问题**: 开发服务器启动和热更新太慢

**解决方案**:

```bash
# 启用Turbopack
next dev --turbo

# package.json配置
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

**Turbopack vs Webpack 对比**:

| 特性       | Turbopack  | Webpack |
| ---------- | ---------- | ------- |
| 启动速度   | 快 5-10 倍 | 基准    |
| 热更新     | 快 10 倍   | 基准    |
| 稳定性     | 实验性     | 稳定    |
| 功能完整性 | 部分功能   | 完整    |

### 14. 如何配置多进程?

**问题**: 充分利用多核 CPU

**解决方案**:

```bash
# 生产服务器使用多进程
next start --workers 4

# 自动检测CPU核心数
next start --workers max
```

**使用 PM2 集群模式**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
```

### 15. 如何生成性能分析报告?

**问题**: 需要优化构建性能

**解决方案**:

```bash
# 生成性能分析
next build --profile

# 查看分析结果
# 在 .next/trace 目录查看
```

**使用 Chrome DevTools 分析**:

1. 打开 chrome://tracing
2. 加载 .next/trace 文件
3. 分析构建性能瓶颈

### 16. 如何处理内存溢出?

**问题**: 构建时出现 "JavaScript heap out of memory"

**解决方案**:

```bash
# 增加内存限制到4GB
NODE_OPTIONS='--max-old-space-size=4096' next build

# 增加到8GB
NODE_OPTIONS='--max-old-space-size=8192' next build

# package.json配置
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### 17. 如何配置环境变量?

**问题**: 不同环境需要不同配置

**解决方案**:

```bash
# 使用.env文件
# .env.local (本地开发,不提交)
# .env.development (开发环境)
# .env.production (生产环境)

# 加载特定env文件
next dev --env-file .env.staging

# 命令行设置
NEXT_PUBLIC_API_URL=https://api.example.com next build
```

### 18. 如何调试生产构建?

**问题**: 生产环境出现问题

**解决方案**:

```bash
# 启用source maps
# next.config.js
module.exports = {
  productionBrowserSourceMaps: true,
}

# 本地运行生产构建
next build
next start

# 使用调试模式
NODE_ENV=production next start --inspect
```

## 总结

Next.js CLI 提供了完整的命令行工具集，用于开发、构建和部署 Next.js 应用。通过掌握 CLI 命令可以：

1. **开发服务器**：快速启动开发环境
2. **生产构建**：优化构建流程
3. **生产服务器**：部署生产应用
4. **代码分析**：分析打包结果
5. **问题排查**：调试和优化

关键要点：

- 使用 next dev 启动开发服务器
- 使用 next build 构建生产版本
- 使用 next start 启动生产服务器
- 使用 next lint 检查代码
- 使用 next info 查看环境
- 自定义端口和主机
- 启用 Turbopack 加速
- 分析打包大小
- 清除缓存
- 环境变量配置

记住：合理使用 CLI 命令可以大幅提高开发效率。根据项目需求选择合适的命令和参数，优化开发和构建流程。

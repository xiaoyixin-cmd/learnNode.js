**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# experimental.adapterPath 配置

## 概述

experimental.adapterPath 是 Next.js 16 中用于指定自定义构建适配器路径的实验性配置选项。通过自定义适配器，可以将 Next.js 应用部署到不同的平台和环境，实现更灵活的部署策略。

### adapterPath 的作用

1. **自定义部署**：适配不同的部署平台
2. **灵活构建**：控制构建输出格式
3. **平台集成**：与特定平台深度集成
4. **优化输出**：针对目标环境优化
5. **扩展能力**：扩展 Next.js 部署能力

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  experimental: {
    adapterPath: "./custom-adapter.js",
  },
};
```

### 适配器结构

```javascript
// custom-adapter.js
module.exports = function adapter(options) {
  return {
    name: "custom-adapter",
    async build() {
      // 构建逻辑
    },
    async deploy() {
      // 部署逻辑
    },
  };
};
```

### Vercel 适配器示例

```javascript
// next.config.js
module.exports = {
  experimental: {
    adapterPath: "@vercel/next-adapter",
  },
};
```

### Netlify 适配器示例

```javascript
// next.config.js
module.exports = {
  experimental: {
    adapterPath: "@netlify/next-adapter",
  },
};
```

## 高级配置

### 自定义适配器实现

```javascript
// adapters/custom-adapter.js
module.exports = function customAdapter(options = {}) {
  return {
    name: "custom-adapter",

    async build(buildOptions) {
      const { dir, outDir } = buildOptions;

      console.log("Building with custom adapter...");

      // 执行构建
      await this.buildPages(dir, outDir);
      await this.buildAssets(dir, outDir);

      console.log("Build complete!");
    },

    async buildPages(dir, outDir) {
      // 构建页面
    },

    async buildAssets(dir, outDir) {
      // 构建资源
    },
  };
};
```

### 配置适配器选项

```javascript
// next.config.js
module.exports = {
  experimental: {
    adapterPath: "./adapters/custom-adapter.js",
    adapterOptions: {
      platform: "cloudflare",
      region: "us-east-1",
      runtime: "edge",
    },
  },
};
```

### Docker 适配器

```javascript
// adapters/docker-adapter.js
const fs = require("fs");
const path = require("path");

module.exports = function dockerAdapter(options) {
  return {
    name: "docker-adapter",

    async build({ dir, outDir }) {
      // 生成Dockerfile
      const dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
      `;

      fs.writeFileSync(path.join(outDir, "Dockerfile"), dockerfile);

      // 生成docker-compose.yml
      const compose = `
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      `;

      fs.writeFileSync(path.join(outDir, "docker-compose.yml"), compose);
    },
  };
};
```

### Serverless 适配器

```javascript
// adapters/serverless-adapter.js
module.exports = function serverlessAdapter(options) {
  return {
    name: "serverless-adapter",

    async build({ dir, outDir }) {
      // 生成Lambda函数
      await this.generateLambdaFunctions(dir, outDir);

      // 生成API Gateway配置
      await this.generateApiGatewayConfig(outDir);

      // 生成CloudFormation模板
      await this.generateCloudFormation(outDir);
    },

    async generateLambdaFunctions(dir, outDir) {
      // 为每个页面生成Lambda函数
    },

    async generateApiGatewayConfig(outDir) {
      // 生成API Gateway配置
    },

    async generateCloudFormation(outDir) {
      // 生成CloudFormation模板
    },
  };
};
```

### Edge Runtime 适配器

```javascript
// adapters/edge-adapter.js
module.exports = function edgeAdapter(options) {
  return {
    name: "edge-adapter",

    async build({ dir, outDir }) {
      // 优化Edge Runtime
      await this.optimizeForEdge(dir, outDir);

      // 生成Edge配置
      await this.generateEdgeConfig(outDir);
    },

    async optimizeForEdge(dir, outDir) {
      // 移除Node.js特定代码
      // 优化bundle大小
      // 添加Edge Runtime polyfills
    },

    async generateEdgeConfig(outDir) {
      const config = {
        runtime: "edge",
        regions: ["all"],
      };

      fs.writeFileSync(
        path.join(outDir, "edge-config.json"),
        JSON.stringify(config, null, 2)
      );
    },
  };
};
```

### 静态导出适配器

```javascript
// adapters/static-adapter.js
module.exports = function staticAdapter(options) {
  return {
    name: "static-adapter",

    async build({ dir, outDir }) {
      // 生成静态HTML
      await this.generateStaticPages(dir, outDir);

      // 优化资源
      await this.optimizeAssets(outDir);

      // 生成部署配置
      await this.generateDeployConfig(outDir);
    },

    async generateStaticPages(dir, outDir) {
      // 预渲染所有页面
    },

    async optimizeAssets(outDir) {
      // 压缩图片、CSS、JS
    },

    async generateDeployConfig(outDir) {
      // 生成nginx配置或其他静态服务器配置
    },
  };
};
```

## 实战案例

### 案例 1：Cloudflare Workers 适配器

```javascript
// adapters/cloudflare-adapter.js
const fs = require("fs");
const path = require("path");

module.exports = function cloudflareAdapter(options = {}) {
  return {
    name: "cloudflare-adapter",

    async build({ dir, outDir }) {
      console.log("Building for Cloudflare Workers...");

      // 生成Worker脚本
      const workerScript = `
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // 路由处理
  if (url.pathname === '/') {
    return new Response('Hello from Cloudflare Workers!', {
      headers: { 'content-type': 'text/html' },
    })
  }

  return new Response('Not found', { status: 404 })
}
      `;

      fs.writeFileSync(path.join(outDir, "worker.js"), workerScript);

      // 生成wrangler.toml
      const wranglerConfig = `
name = "${options.name || "nextjs-app"}"
type = "javascript"
account_id = "${options.accountId || ""}"
workers_dev = true
route = ""
zone_id = ""

[site]
bucket = "./out"
entry-point = "workers-site"
      `;

      fs.writeFileSync(path.join(outDir, "wrangler.toml"), wranglerConfig);
    },
  };
};
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    adapterPath: "./adapters/cloudflare-adapter.js",
    adapterOptions: {
      name: "my-nextjs-app",
      accountId: "your-account-id",
    },
  },
};
```

### 案例 2：AWS Lambda 适配器

```javascript
// adapters/lambda-adapter.js
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

module.exports = function lambdaAdapter(options = {}) {
  return {
    name: "lambda-adapter",

    async build({ dir, outDir }) {
      console.log("Building for AWS Lambda...");

      // 生成Lambda处理函数
      const handlerCode = `
const { parse } = require('url')

exports.handler = async (event) => {
  const { path, httpMethod, headers, body } = event

  // 处理请求
  const response = await handleNextRequest({
    path,
    method: httpMethod,
    headers,
    body,
  })

  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: response.body,
  }
}

async function handleNextRequest(request) {
  // Next.js请求处理逻辑
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: '<h1>Hello from Lambda</h1>',
  }
}
      `;

      fs.writeFileSync(path.join(outDir, "index.js"), handlerCode);

      // 生成SAM模板
      const samTemplate = {
        AWSTemplateFormatVersion: "2010-09-09",
        Transform: "AWS::Serverless-2016-10-31",
        Resources: {
          NextJsFunction: {
            Type: "AWS::Serverless::Function",
            Properties: {
              Handler: "index.handler",
              Runtime: "nodejs18.x",
              MemorySize: options.memorySize || 1024,
              Timeout: options.timeout || 30,
              Events: {
                Api: {
                  Type: "Api",
                  Properties: {
                    Path: "/{proxy+}",
                    Method: "ANY",
                  },
                },
              },
            },
          },
        },
      };

      fs.writeFileSync(
        path.join(outDir, "template.yaml"),
        JSON.stringify(samTemplate, null, 2)
      );

      // 打包Lambda函数
      await this.packageLambda(outDir);
    },

    async packageLambda(outDir) {
      const output = fs.createWriteStream(path.join(outDir, "lambda.zip"));
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);
      archive.directory(outDir, false);
      await archive.finalize();
    },
  };
};
```

### 案例 3：Kubernetes 适配器

```javascript
// adapters/k8s-adapter.js
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

module.exports = function k8sAdapter(options = {}) {
  return {
    name: "k8s-adapter",

    async build({ dir, outDir }) {
      console.log("Building for Kubernetes...");

      // 生成Deployment配置
      const deployment = {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          name: options.appName || "nextjs-app",
        },
        spec: {
          replicas: options.replicas || 3,
          selector: {
            matchLabels: {
              app: options.appName || "nextjs-app",
            },
          },
          template: {
            metadata: {
              labels: {
                app: options.appName || "nextjs-app",
              },
            },
            spec: {
              containers: [
                {
                  name: "nextjs",
                  image: options.image || "nextjs-app:latest",
                  ports: [{ containerPort: 3000 }],
                  env: [{ name: "NODE_ENV", value: "production" }],
                  resources: {
                    requests: {
                      memory: "256Mi",
                      cpu: "250m",
                    },
                    limits: {
                      memory: "512Mi",
                      cpu: "500m",
                    },
                  },
                },
              ],
            },
          },
        },
      };

      fs.writeFileSync(
        path.join(outDir, "deployment.yaml"),
        yaml.dump(deployment)
      );

      // 生成Service配置
      const service = {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          name: options.appName || "nextjs-app",
        },
        spec: {
          type: "LoadBalancer",
          ports: [
            {
              port: 80,
              targetPort: 3000,
            },
          ],
          selector: {
            app: options.appName || "nextjs-app",
          },
        },
      };

      fs.writeFileSync(path.join(outDir, "service.yaml"), yaml.dump(service));
    },
  };
};
```

### 案例 4：Azure Functions 适配器

```javascript
// adapters/azure-adapter.js
const fs = require("fs");
const path = require("path");

module.exports = function azureAdapter(options = {}) {
  return {
    name: "azure-adapter",

    async build({ dir, outDir }) {
      console.log("Building for Azure Functions...");

      // 生成function.json
      const functionConfig = {
        bindings: [
          {
            authLevel: "anonymous",
            type: "httpTrigger",
            direction: "in",
            name: "req",
            methods: ["get", "post"],
            route: "{*segments}",
          },
          {
            type: "http",
            direction: "out",
            name: "res",
          },
        ],
      };

      fs.writeFileSync(
        path.join(outDir, "function.json"),
        JSON.stringify(functionConfig, null, 2)
      );

      // 生成index.js
      const indexCode = `
module.exports = async function (context, req) {
  const path = req.params.segments || '/'

  // 处理Next.js请求
  const response = await handleNextRequest(path, req)

  context.res = {
    status: response.statusCode,
    headers: response.headers,
    body: response.body,
  }
}

async function handleNextRequest(path, req) {
  // Next.js请求处理
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: '<h1>Hello from Azure Functions</h1>',
  }
}
      `;

      fs.writeFileSync(path.join(outDir, "index.js"), indexCode);
    },
  };
};
```

## 适用场景

| 平台       | 适配器类型         | 适用场景   |
| ---------- | ------------------ | ---------- |
| Vercel     | vercel-adapter     | 快速部署   |
| AWS Lambda | lambda-adapter     | Serverless |
| Cloudflare | cloudflare-adapter | Edge 计算  |
| Kubernetes | k8s-adapter        | 容器编排   |
| Docker     | docker-adapter     | 容器化     |
| Azure      | azure-adapter      | 微软云     |
| 静态托管   | static-adapter     | 纯静态站点 |

## 注意事项

### 1. 适配器兼容性

```javascript
// 确保适配器与Next.js版本兼容
module.exports = {
  experimental: {
    adapterPath: "./adapters/custom-adapter.js",
  },
};
```

### 2. 构建输出验证

```javascript
// adapters/custom-adapter.js
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 构建
      await this.buildApp(dir, outDir);

      // 验证输出
      await this.validateOutput(outDir);
    },

    async validateOutput(outDir) {
      const required = ["index.html", "manifest.json"];

      for (const file of required) {
        if (!fs.existsSync(path.join(outDir, file))) {
          throw new Error(`Missing required file: ${file}`);
        }
      }
    },
  };
};
```

### 3. 环境变量处理

```javascript
// 适配器需要正确处理环境变量
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 注入环境变量
      const env = {
        NODE_ENV: "production",
        ...options.env,
      };

      // 构建时使用
    },
  };
};
```

### 4. 错误处理

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      try {
        await this.buildApp(dir, outDir);
      } catch (error) {
        console.error("Build failed:", error);
        throw error;
      }
    },
  };
};
```

### 5. 性能优化

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 并行构建
      await Promise.all([
        this.buildPages(dir, outDir),
        this.buildAssets(dir, outDir),
        this.buildApi(dir, outDir),
      ]);
    },
  };
};
```

## 常见问题

### 1. 适配器不工作？

**问题**：配置后构建失败

**解决方案**：

```javascript
// 检查适配器路径是否正确
module.exports = {
  experimental: {
    adapterPath: "./adapters/custom-adapter.js", // 确保路径正确
  },
};
```

### 2. 如何调试适配器？

**问题**：需要查看适配器执行过程

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      console.log("Building with options:", options);
      console.log("Input dir:", dir);
      console.log("Output dir:", outDir);

      // 构建逻辑
    },
  };
};
```

### 3. 如何传递配置选项？

**问题**：需要向适配器传递参数

**解决方案**：

```javascript
// next.config.js
module.exports = {
  experimental: {
    adapterPath: "./adapters/custom-adapter.js",
    adapterOptions: {
      platform: "aws",
      region: "us-east-1",
    },
  },
};
```

### 4. 如何处理多环境？

**问题**：不同环境使用不同适配器

**解决方案**：

```javascript
const adapter =
  process.env.DEPLOY_TARGET === "aws"
    ? "./adapters/lambda-adapter.js"
    : "./adapters/vercel-adapter.js";

module.exports = {
  experimental: {
    adapterPath: adapter,
  },
};
```

### 5. 如何验证构建输出？

**问题**：需要确保构建产物正确

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      await this.buildApp(dir, outDir);

      // 验证
      const files = fs.readdirSync(outDir);
      console.log("Generated files:", files);
    },
  };
};
```

### 6. 如何处理大型应用？

**问题**：构建时间过长

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 并行处理
      await Promise.all([
        this.buildPages(dir, outDir),
        this.buildAssets(dir, outDir),
      ]);
    },
  };
};
```

### 7. 如何集成 CI/CD？

**问题**：需要在 CI/CD 中使用

**解决方案**：

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

### 8. 如何处理环境变量？

**问题**：适配器需要访问环境变量

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      const apiKey = process.env.API_KEY;

      // 使用环境变量
    },
  };
};
```

### 9. 如何生成部署文档？

**问题**：需要自动生成部署说明

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      await this.buildApp(dir, outDir);

      // 生成README
      const readme = `
# Deployment Instructions

1. Upload files to server
2. Run: npm start
3. Access: http://localhost:3000
      `;

      fs.writeFileSync(path.join(outDir, "DEPLOY.md"), readme);
    },
  };
};
```

### 10. 如何处理静态资源？

**问题**：静态资源需要特殊处理

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 复制静态资源
      const publicDir = path.join(dir, "public");
      const targetDir = path.join(outDir, "static");

      fs.cpSync(publicDir, targetDir, { recursive: true });
    },
  };
};
```

### 11. 如何优化 bundle 大小？

**问题**：输出文件过大

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 启用压缩
      // 移除未使用代码
      // Tree shaking
    },
  };
};
```

### 12. 如何支持多区域部署？

**问题**：需要部署到多个区域

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      const regions = options.regions || ["us-east-1"];

      for (const region of regions) {
        await this.deployToRegion(region, outDir);
      }
    },
  };
};
```

### 13. 如何回滚部署？

**问题**：需要回滚到之前版本

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      // 保存版本信息
      const version = {
        timestamp: Date.now(),
        commit: process.env.GIT_COMMIT,
      };

      fs.writeFileSync(
        path.join(outDir, "version.json"),
        JSON.stringify(version)
      );
    },
  };
};
```

### 14. 如何监控部署状态？

**问题**：需要了解部署进度

**解决方案**：

```javascript
module.exports = function customAdapter(options) {
  return {
    name: "custom-adapter",

    async build({ dir, outDir }) {
      console.log("Starting build...");

      await this.buildPages(dir, outDir);
      console.log("Pages built");

      await this.buildAssets(dir, outDir);
      console.log("Assets built");

      console.log("Build complete!");
    },
  };
};
```

### 15. 如何测试适配器？

**问题**：需要测试适配器功能

**解决方案**：

```javascript
// __tests__/adapter.test.js
const customAdapter = require("../adapters/custom-adapter");

describe("customAdapter", () => {
  it("should build successfully", async () => {
    const adapter = customAdapter({});

    await adapter.build({
      dir: "./test-app",
      outDir: "./test-output",
    });

    // 验证输出
  });
});
```

## 总结

experimental.adapterPath 配置为 Next.js 提供了灵活的部署能力。通过自定义适配器可以：

1. **适配多平台**：支持各种部署环境
2. **优化输出**：针对目标平台优化
3. **自动化部署**：简化部署流程
4. **灵活配置**：满足特殊需求
5. **扩展能力**：增强 Next.js 功能

关键要点：

- 理解适配器结构
- 正确实现 build 方法
- 处理环境变量
- 验证构建输出
- 优化构建性能
- 支持多环境
- 集成 CI/CD
- 错误处理
- 文档生成
- 测试适配器

记住：适配器是实验性功能，API 可能会变化。在生产环境使用前，需要充分测试。对于常见平台，优先使用官方适配器。

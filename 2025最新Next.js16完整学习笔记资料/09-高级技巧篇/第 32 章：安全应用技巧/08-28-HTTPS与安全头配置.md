**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# HTTPS 与安全头配置

## 1. HTTPS 基础配置

### 1.1 什么是 HTTPS

HTTPS(HyperText Transfer Protocol Secure)是 HTTP 的安全版本,通过 SSL/TLS 协议对数据进行加密传输。在现代 Web 应用中,HTTPS 已经成为标准配置。

**HTTPS 的核心价值**:

1. **数据加密**: 防止中间人攻击,保护用户隐私
2. **身份验证**: 确认服务器身份,防止钓鱼网站
3. **数据完整性**: 防止数据在传输过程中被篡改
4. **SEO 优势**: 搜索引擎优先收录 HTTPS 网站
5. **浏览器信任**: 现代浏览器对 HTTP 网站显示不安全警告

### 1.2 Next.js 中的 HTTPS 配置

**开发环境配置**:

```javascript
// next.config.js
module.exports = {
  // 开发环境使用 HTTPS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};
```

**本地开发 HTTPS 服务器**:

```bash
# 安装 mkcert
npm install -g mkcert

# 创建本地 CA
mkcert -install

# 生成证书
mkcert localhost 127.0.0.1 ::1

# 启动 HTTPS 开发服务器
next dev --experimental-https
```

**使用自定义服务器**:

```javascript
// server.js
const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./certificates/localhost-key.pem"),
  cert: fs.readFileSync("./certificates/localhost.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on https://localhost:3000");
  });
});
```

### 1.3 生产环境 HTTPS 配置

**使用 Vercel 部署**:

Vercel 自动为所有项目提供免费的 SSL 证书,无需额外配置。

**使用 Nginx 反向代理**:

```nginx
# /etc/nginx/sites-available/your-app
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**使用 Let's Encrypt 免费证书**:

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 2. 安全头配置

### 2.1 核心安全头详解

**Strict-Transport-Security (HSTS)**:

强制浏览器使用 HTTPS 访问网站。

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};
```

参数说明:

- `max-age`: HSTS 策略的有效期(秒)
- `includeSubDomains`: 包含所有子域名
- `preload`: 允许加入 HSTS 预加载列表

**X-Frame-Options**:

防止点击劫持攻击。

```javascript
{
  key: 'X-Frame-Options',
  value: 'DENY' // 或 'SAMEORIGIN'
}
```

选项说明:

- `DENY`: 完全禁止在 iframe 中显示
- `SAMEORIGIN`: 只允许同源页面嵌入
- `ALLOW-FROM uri`: 允许指定来源嵌入(已废弃)

**X-Content-Type-Options**:

防止 MIME 类型嗅探攻击。

```javascript
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
}
```

**X-XSS-Protection**:

启用浏览器的 XSS 过滤器。

```javascript
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
}
```

**Referrer-Policy**:

控制 Referer 头的发送策略。

```javascript
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
}
```

策略选项:

- `no-referrer`: 不发送 Referer
- `no-referrer-when-downgrade`: HTTPS 到 HTTP 不发送
- `origin`: 只发送源信息
- `origin-when-cross-origin`: 跨域只发送源
- `same-origin`: 同源才发送
- `strict-origin`: 只发送源,HTTPS 到 HTTP 不发送
- `strict-origin-when-cross-origin`: 推荐设置
- `unsafe-url`: 总是发送完整 URL

**Permissions-Policy**:

控制浏览器功能的访问权限。

```javascript
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()'
}
```

### 2.2 Content-Security-Policy (CSP)

CSP 是最重要的安全头之一,可以防止 XSS、数据注入等攻击。

**基础 CSP 配置**:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.example.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

**CSP 指令说明**:

| 指令            | 说明                | 示例                             |
| --------------- | ------------------- | -------------------------------- |
| default-src     | 默认策略            | `'self'`                         |
| script-src      | JavaScript 来源     | `'self' 'unsafe-inline'`         |
| style-src       | CSS 来源            | `'self' 'unsafe-inline'`         |
| img-src         | 图片来源            | `'self' data: https:`            |
| font-src        | 字体来源            | `'self' data:`                   |
| connect-src     | AJAX/WebSocket 来源 | `'self' https://api.example.com` |
| media-src       | 音视频来源          | `'self'`                         |
| object-src      | 插件来源            | `'none'`                         |
| frame-src       | iframe 来源         | `'self'`                         |
| frame-ancestors | 可嵌入的父页面      | `'none'`                         |
| base-uri        | base 标签限制       | `'self'`                         |
| form-action     | 表单提交目标        | `'self'`                         |

**Next.js 中的 CSP 配置**:

```javascript
// lib/csp.js
export function generateCSP() {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.example.com wss://ws.example.com",
    "media-src 'self' https://media.example.com",
    "object-src 'none'",
    "frame-src 'self' https://trusted.example.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  return { csp, nonce };
}

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateCSP } from "./lib/csp";

export function middleware(request: NextRequest) {
  const { csp, nonce } = generateCSP();

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-CSP-Nonce", nonce);

  return response;
}
```

**在组件中使用 nonce**:

```typescript
// app/layout.tsx
import { headers } from "next/headers";

export default function RootLayout({ children }) {
  const nonce = headers().get("X-CSP-Nonce");

  return (
    <html>
      <head>
        <script nonce={nonce} src="/scripts/analytics.js" />
        <style nonce={nonce}>{`
          body { margin: 0; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2.3 完整的安全头配置

**生产环境推荐配置**:

```javascript
// next.config.js
const securityHeaders = [
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
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com wss://ws.example.com",
      "media-src 'self' https://media.example.com",
      "object-src 'none'",
      "frame-src 'self' https://www.youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

## 3. 安全头测试与验证

### 3.1 在线测试工具

**Security Headers**:

访问 https://securityheaders.com 测试你的网站安全头配置。

**Mozilla Observatory**:

访问 https://observatory.mozilla.org 进行全面的安全扫描。

**SSL Labs**:

访问 https://www.ssllabs.com/ssltest/ 测试 SSL/TLS 配置。

### 3.2 本地测试

**使用 curl 测试**:

```bash
# 查看所有响应头
curl -I https://yourdomain.com

# 查看特定安全头
curl -I https://yourdomain.com | grep -i "strict-transport-security"
curl -I https://yourdomain.com | grep -i "content-security-policy"
curl -I https://yourdomain.com | grep -i "x-frame-options"
```

**使用浏览器开发者工具**:

1. 打开开发者工具(F12)
2. 切换到 Network 标签
3. 刷新页面
4. 点击第一个请求
5. 查看 Response Headers

### 3.3 自动化测试

**使用 Jest 测试安全头**:

```typescript
// __tests__/security-headers.test.ts
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("Security Headers", () => {
  it("should set HSTS header", async () => {
    const request = new NextRequest("https://example.com");
    const response = await middleware(request);

    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
  });

  it("should set CSP header", async () => {
    const request = new NextRequest("https://example.com");
    const response = await middleware(request);

    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("should set X-Frame-Options", async () => {
    const request = new NextRequest("https://example.com");
    const response = await middleware(request);

    expect(response.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });
});
```

## 4. 常见问题与解决方案

### 4.1 CSP 阻止内联脚本

**问题**: CSP 阻止了内联脚本和样式。

**解决方案**:

```javascript
// 方案 1: 使用 nonce
<script nonce={nonce}>console.log('This is allowed');</script>;

// 方案 2: 使用 hash
// 计算脚本的 SHA-256 hash
const scriptHash = "sha256-xxx...";

// 在 CSP 中添加
("script-src 'self' 'sha256-xxx...'");

// 方案 3: 将内联脚本移到外部文件
// 不推荐使用 'unsafe-inline'
```

### 4.2 第三方脚本加载失败

**问题**: Google Analytics、Facebook Pixel 等第三方脚本被 CSP 阻止。

**解决方案**:

```javascript
// next.config.js
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
    "https://www.googletagmanager.com " +
    "https://www.google-analytics.com " +
    "https://connect.facebook.net",
  "connect-src 'self' " +
    "https://www.google-analytics.com " +
    "https://analytics.google.com " +
    "https://www.facebook.com",
  "img-src 'self' data: https: " +
    "https://www.google-analytics.com " +
    "https://www.facebook.com",
].join("; ");
```

### 4.3 HTTPS 重定向循环

**问题**: HTTP 到 HTTPS 重定向出现循环。

**解决方案**:

```nginx
# Nginx 配置
server {
    listen 80;
    server_name yourdomain.com;

    # 检查是否已经是 HTTPS
    if ($http_x_forwarded_proto != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

### 4.4 混合内容警告

**问题**: HTTPS 页面加载 HTTP 资源导致警告。

**解决方案**:

```javascript
// 1. 在 CSP 中添加 upgrade-insecure-requests
"upgrade-insecure-requests"

// 2. 使用协议相对 URL
<img src="//example.com/image.jpg" />

// 3. 强制使用 HTTPS
<img src="https://example.com/image.jpg" />

// 4. 在 next.config.js 中配置
module.exports = {
  images: {
    domains: ['example.com'],
    loader: 'custom',
    loaderFile: './my-loader.ts'
  }
};

// my-loader.ts
export default function myLoader({ src, width, quality }) {
  return `https://example.com${src}?w=${width}&q=${quality || 75}`;
}
```

### 4.5 开发环境 HTTPS 证书问题

**问题**: 本地开发时浏览器不信任自签名证书。

**解决方案**:

```bash
# 使用 mkcert 创建本地信任的证书
npm install -g mkcert

# 安装本地 CA
mkcert -install

# 生成证书
mkcert localhost 127.0.0.1 ::1

# 在 Next.js 中使用
# package.json
{
  "scripts": {
    "dev": "node server.js"
  }
}

# server.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem')
};

const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(3000);
});
```

## 5. 高级安全配置

### 5.1 子资源完整性(SRI)

SRI 确保从 CDN 加载的资源未被篡改。

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.example.com/styles.css"
          integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
          crossOrigin="anonymous"
        />
        <script
          src="https://cdn.example.com/script.js"
          integrity="sha384-xxx..."
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**生成 SRI hash**:

```bash
# 使用 openssl
cat file.js | openssl dgst -sha384 -binary | openssl base64 -A

# 使用在线工具
# https://www.srihash.org/
```

### 5.2 CORS 配置

跨域资源共享配置。

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://trusted-domain.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};
```

**动态 CORS 配置**:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = ["https://app.example.com", "https://admin.example.com"];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

### 5.3 速率限制

防止 DDoS 攻击和滥用。

```typescript
// lib/rate-limit.ts
import { LRUCache } from "lru-cache";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import rateLimit from "./lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";

  try {
    await limiter.check(10, ip); // 10 requests per minute
    return NextResponse.next();
  } catch {
    return new NextResponse("Too Many Requests", { status: 429 });
  }
}
```

### 5.4 安全 Cookie 配置

```typescript
// app/api/auth/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });

  response.cookies.set("session", "token", {
    httpOnly: true, // 防止 JavaScript 访问
    secure: true, // 只在 HTTPS 下发送
    sameSite: "strict", // 防止 CSRF
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
```

## 适用场景

### 1. 电商网站

电商网站处理敏感的用户信息和支付数据,必须使用 HTTPS 和严格的安全头配置。

```javascript
// next.config.js - 电商网站配置
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' https://js.stripe.com",
      "frame-src 'self' https://js.stripe.com",
      "connect-src 'self' https://api.stripe.com",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
    ].join("; "),
  },
];
```

### 2. 金融应用

金融应用需要最高级别的安全配置。

```javascript
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'none'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];
```

### 3. 内容网站

内容网站需要平衡安全性和第三方集成。

```javascript
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
      "connect-src 'self' https://www.google-analytics.com",
    ].join("; "),
  },
];
```

### 4. SaaS 应用

SaaS 应用需要支持多租户和 API 访问。

```javascript
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' wss: https:",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];
```

## 注意事项

### 1. CSP 配置注意事项

1. **避免使用 unsafe-inline 和 unsafe-eval**

   - 这些指令会大大降低 CSP 的安全性
   - 尽量使用 nonce 或 hash 替代

2. **逐步实施 CSP**

   - 先使用 Content-Security-Policy-Report-Only 头
   - 收集违规报告并修复问题
   - 最后切换到强制模式

3. **测试第三方集成**
   - 确保所有第三方脚本都在 CSP 白名单中
   - 测试 Google Analytics、广告、社交媒体插件等

### 2. HTTPS 配置注意事项

1. **证书管理**

   - 设置证书过期提醒
   - 使用自动续期(Let's Encrypt)
   - 保护私钥安全

2. **性能影响**

   - HTTPS 会增加一些延迟
   - 使用 HTTP/2 或 HTTP/3 优化性能
   - 启用 OCSP Stapling

3. **混合内容**
   - 确保所有资源都使用 HTTPS
   - 使用 upgrade-insecure-requests 指令
   - 检查第三方资源

### 3. 安全头配置注意事项

1. **浏览器兼容性**

   - 某些安全头在旧浏览器中不支持
   - 提供降级方案
   - 测试主流浏览器

2. **性能监控**

   - 监控安全头对性能的影响
   - 使用 CDN 加速 HTTPS
   - 优化 TLS 握手

3. **定期审计**
   - 定期检查安全头配置
   - 使用在线工具测试
   - 跟踪安全最佳实践更新

### 4. 开发环境注意事项

1. **本地 HTTPS**

   - 使用 mkcert 创建本地证书
   - 不要在生产环境使用自签名证书
   - 配置开发工具信任本地证书

2. **环境差异**
   - 开发和生产环境配置可能不同
   - 使用环境变量管理配置
   - 测试生产环境配置

## 总结

HTTPS 和安全头配置是现代 Web 应用的基础安全措施。本文介绍了:

1. **HTTPS 配置**: 包括开发环境和生产环境的完整配置方案
2. **安全头详解**: 详细说明了各种安全头的作用和配置方法
3. **CSP 配置**: 重点讲解了 Content-Security-Policy 的配置和使用
4. **测试验证**: 提供了多种测试和验证安全配置的方法
5. **常见问题**: 列举了实际应用中的常见问题和解决方案
6. **高级配置**: 包括 SRI、CORS、速率限制等高级安全特性
7. **适用场景**: 针对不同类型应用提供了具体的配置建议

关键要点:

- HTTPS 是必须的,不是可选的
- 使用完整的安全头配置保护应用
- CSP 是防御 XSS 攻击的重要手段
- 定期测试和更新安全配置
- 平衡安全性和功能性
- 关注性能影响
- 保持配置的可维护性

通过正确配置 HTTPS 和安全头,可以显著提升 Next.js 应用的安全性,保护用户数据和隐私。

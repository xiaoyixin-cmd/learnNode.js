**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# manifest.json 配置详解

## 1. 概述

Web App Manifest 是一个 JSON 文件,用于定义 PWA(渐进式 Web 应用)的外观和行为。Next.js 16 提供了简单的方式来配置 manifest。

### 1.1 核心功能

- **应用信息**: 名称、描述、图标
- **显示模式**: 全屏、独立、最小 UI
- **主题颜色**: 状态栏和工具栏颜色
- **启动画面**: 应用启动时的显示
- **方向锁定**: 横屏或竖屏

### 1.2 PWA 优势

| 特性     | 说明                | 用户体验       |
| -------- | ------------------- | -------------- |
| 可安装   | 添加到主屏幕        | 类似原生应用   |
| 离线访问 | Service Worker 缓存 | 无网络也能使用 |
| 推送通知 | 主动触达用户        | 提升用户粘性   |
| 快速加载 | 预缓存资源          | 秒开体验       |

### 1.3 浏览器支持

| 浏览器  | 支持程度 | 备注          |
| ------- | -------- | ------------- |
| Chrome  | 完全支持 | 最佳体验      |
| Edge    | 完全支持 | 基于 Chromium |
| Firefox | 部分支持 | 不支持安装    |
| Safari  | 部分支持 | iOS 11.3+     |

---

## 2. 基础配置

### 2.1 静态 manifest

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用完整名称",
    short_name: "应用简称",
    description: "应用描述",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0070f3",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

### 2.2 动态 manifest

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getAppConfig();

  return {
    name: config.appName,
    short_name: config.shortName,
    description: config.description,
    start_url: "/",
    display: "standalone",
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    icons: config.icons,
  };
}
```

### 2.3 完整配置示例

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "我的PWA应用",
    short_name: "PWA",
    description: "这是一个使用Next.js 16构建的PWA应用",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0070f3",
    orientation: "portrait",
    scope: "/",
    lang: "zh-CN",
    dir: "ltr",
    icons: [
      {
        src: "/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["productivity", "utilities"],
    screenshots: [
      {
        src: "/screenshot1.png",
        sizes: "1280x720",
        type: "image/png",
      },
      {
        src: "/screenshot2.png",
        sizes: "1280x720",
        type: "image/png",
      },
    ],
  };
}
```

---

## 3. 显示模式

### 3.1 display 选项

| 模式       | 说明       | 适用场景       |
| ---------- | ---------- | -------------- |
| fullscreen | 全屏显示   | 游戏、视频应用 |
| standalone | 独立应用   | 大多数 PWA     |
| minimal-ui | 最小 UI    | 阅读类应用     |
| browser    | 浏览器模式 | 普通网站       |

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    display: "standalone", // 推荐使用
    // ...其他配置
  };
}
```

### 3.2 orientation 选项

控制应用的屏幕方向:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    orientation: "portrait", // 竖屏
    // orientation: 'landscape', // 横屏
    // orientation: 'any', // 任意方向
  };
}
```

| 值                | 说明     | 适用场景       |
| ----------------- | -------- | -------------- |
| portrait          | 竖屏     | 社交、新闻应用 |
| landscape         | 横屏     | 游戏、视频应用 |
| any               | 任意方向 | 大多数应用     |
| portrait-primary  | 主竖屏   | 特定方向       |
| landscape-primary | 主横屏   | 特定方向       |

### 3.3 scope 和 start_url

定义应用的作用域和启动 URL:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    start_url: "/", // 启动URL
    scope: "/", // 作用域
  };
}
```

**scope**: 定义应用的导航范围,超出范围会在浏览器中打开
**start_url**: 用户从主屏幕启动应用时打开的 URL

### 3.4 categories

定义应用类别,帮助应用商店分类:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    categories: ["business", "productivity", "utilities"],
  };
}
```

常见类别:

- business(商务)
- education(教育)
- entertainment(娱乐)
- finance(金融)
- games(游戏)
- health(健康)
- lifestyle(生活方式)
- news(新闻)
- productivity(生产力)
- shopping(购物)
- social(社交)
- sports(体育)
- travel(旅行)
- utilities(工具)

### 3.5 screenshots

提供应用截图,用于应用商店展示:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1280x720",
        type: "image/png",
        label: "首页截图",
      },
      {
        src: "/screenshots/profile.png",
        sizes: "1280x720",
        type: "image/png",
        label: "个人资料页",
      },
    ],
  };
}
```

### 3.6 shortcuts

定义应用快捷方式:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    shortcuts: [
      {
        name: "新建文档",
        short_name: "新建",
        description: "创建新文档",
        url: "/new",
        icons: [{ src: "/icons/new.png", sizes: "96x96" }],
      },
      {
        name: "搜索",
        short_name: "搜索",
        description: "搜索内容",
        url: "/search",
        icons: [{ src: "/icons/search.png", sizes: "96x96" }],
      },
    ],
  };
}
```

### 3.7 related_applications

指定相关的原生应用:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    related_applications: [
      {
        platform: "play",
        url: "https://play.google.com/store/apps/details?id=com.example.app",
        id: "com.example.app",
      },
      {
        platform: "itunes",
        url: "https://apps.apple.com/app/example/id123456789",
      },
    ],
    prefer_related_applications: false, // 是否优先推荐原生应用
  };
}
```

### 3.8 protocol_handlers

注册自定义协议处理:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    protocol_handlers: [
      {
        protocol: "web+music",
        url: "/music?track=%s",
      },
      {
        protocol: "mailto",
        url: "/compose?to=%s",
      },
    ],
  };
}
```

---

## 4. 动态配置

### 4.1 根据环境配置

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === "production";

  return {
    name: isProd ? "生产环境应用" : "开发环境应用",
    short_name: isProd ? "Prod App" : "Dev App",
    description: "应用描述",
    start_url: "/",
    display: "standalone",
    background_color: isProd ? "#ffffff" : "#f0f0f0",
    theme_color: isProd ? "#0070f3" : "#ff6b6b",
    icons: [
      {
        src: isProd ? "/icon-prod.png" : "/icon-dev.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
```

### 4.2 多语言支持

```tsx
// app/[lang]/manifest.ts
import { MetadataRoute } from "next";

export default function manifest({
  params,
}: {
  params: { lang: string };
}): MetadataRoute.Manifest {
  const translations = {
    zh: {
      name: "我的应用",
      short_name: "应用",
      description: "这是一个很棒的应用",
    },
    en: {
      name: "My App",
      short_name: "App",
      description: "This is an awesome app",
    },
  };

  const t = translations[params.lang as keyof typeof translations];

  return {
    name: t.name,
    short_name: t.short_name,
    description: t.description,
    start_url: `/${params.lang}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0070f3",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
```

### 4.3 从数据库获取配置

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";
import { getAppConfig } from "@/lib/db";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getAppConfig();

  return {
    name: config.appName,
    short_name: config.shortName,
    description: config.description,
    start_url: "/",
    display: "standalone",
    background_color: config.brandColors.background,
    theme_color: config.brandColors.primary,
    icons: config.icons.map((icon) => ({
      src: icon.url,
      sizes: icon.sizes,
      type: icon.type,
    })),
  };
}
```

### 4.4 多租户配置

```tsx
// app/[tenant]/manifest.ts
import { MetadataRoute } from "next";
import { getTenantConfig } from "@/lib/tenants";

export default async function manifest({
  params,
}: {
  params: { tenant: string };
}): Promise<MetadataRoute.Manifest> {
  const tenant = await getTenantConfig(params.tenant);

  return {
    name: tenant.name,
    short_name: tenant.shortName,
    description: tenant.description,
    start_url: `/${params.tenant}`,
    scope: `/${params.tenant}/`,
    display: "standalone",
    background_color: tenant.brandColor,
    theme_color: tenant.themeColor,
    icons: [
      {
        src: tenant.iconUrl,
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
```

---

## 5. 实战案例

### 5.1 博客应用

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "我的博客",
    short_name: "博客",
    description: "分享技术文章和生活感悟",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1a1a",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["news", "lifestyle"],
    shortcuts: [
      {
        name: "写文章",
        short_name: "写作",
        description: "创建新文章",
        url: "/write",
        icons: [{ src: "/icons/write.png", sizes: "96x96" }],
      },
      {
        name: "草稿箱",
        short_name: "草稿",
        description: "查看草稿",
        url: "/drafts",
        icons: [{ src: "/icons/draft.png", sizes: "96x96" }],
      },
    ],
  };
}
```

### 5.2 电商应用

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "在线商城",
    short_name: "商城",
    description: "购买优质商品",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#ff6b6b",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["shopping"],
    shortcuts: [
      {
        name: "购物车",
        short_name: "购物车",
        description: "查看购物车",
        url: "/cart",
        icons: [{ src: "/icons/cart.png", sizes: "96x96" }],
      },
      {
        name: "订单",
        short_name: "订单",
        description: "我的订单",
        url: "/orders",
        icons: [{ src: "/icons/order.png", sizes: "96x96" }],
      },
      {
        name: "收藏",
        short_name: "收藏",
        description: "我的收藏",
        url: "/favorites",
        icons: [{ src: "/icons/favorite.png", sizes: "96x96" }],
      },
    ],
  };
}
```

### 5.3 社交应用

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "社交网络",
    short_name: "社交",
    description: "连接朋友,分享生活",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4267B2",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["social"],
    shortcuts: [
      {
        name: "发布动态",
        short_name: "发布",
        description: "分享新动态",
        url: "/post",
        icons: [{ src: "/icons/post.png", sizes: "96x96" }],
      },
      {
        name: "消息",
        short_name: "消息",
        description: "查看消息",
        url: "/messages",
        icons: [{ src: "/icons/message.png", sizes: "96x96" }],
      },
      {
        name: "通知",
        short_name: "通知",
        description: "查看通知",
        url: "/notifications",
        icons: [{ src: "/icons/notification.png", sizes: "96x96" }],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/feed.png",
        sizes: "1280x720",
        type: "image/png",
        label: "动态流",
      },
      {
        src: "/screenshots/profile.png",
        sizes: "1280x720",
        type: "image/png",
        label: "个人主页",
      },
    ],
  };
}
```

### 5.4 生产力工具

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "任务管理器",
    short_name: "任务",
    description: "高效管理你的任务和项目",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#667eea",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["productivity", "business"],
    shortcuts: [
      {
        name: "新建任务",
        short_name: "新任务",
        description: "快速创建任务",
        url: "/tasks/new",
        icons: [{ src: "/icons/new-task.png", sizes: "96x96" }],
      },
      {
        name: "今日任务",
        short_name: "今日",
        description: "查看今日任务",
        url: "/tasks/today",
        icons: [{ src: "/icons/today.png", sizes: "96x96" }],
      },
      {
        name: "项目",
        short_name: "项目",
        description: "管理项目",
        url: "/projects",
        icons: [{ src: "/icons/project.png", sizes: "96x96" }],
      },
    ],
  };
}
```

### 5.5 游戏应用

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "休闲小游戏",
    short_name: "游戏",
    description: "轻松有趣的休闲游戏",
    start_url: "/",
    display: "fullscreen", // 全屏模式
    background_color: "#000000",
    theme_color: "#ff6b6b",
    orientation: "landscape", // 横屏
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["games", "entertainment"],
    screenshots: [
      {
        src: "/screenshots/gameplay.png",
        sizes: "1920x1080",
        type: "image/png",
        label: "游戏画面",
      },
    ],
  };
}
```

---

## 6. 适用场景

### 6.1 PWA 应用

**需求**: 创建可安装的 Web 应用

**配置要点**:

- 提供完整的图标集(192x192, 512x512)
- 设置 display 为 standalone
- 配置 theme_color 和 background_color
- 添加 shortcuts 提升用户体验

### 6.2 移动优先应用

**需求**: 主要面向移动设备用户

**配置要点**:

- 设置 orientation 为 portrait
- 优化图标为 maskable
- 添加启动画面
- 配置合适的 theme_color

### 6.3 多语言应用

**需求**: 支持多种语言

**配置要点**:

- 使用动态 manifest
- 根据语言参数返回不同配置
- 设置正确的 start_url 和 scope

### 6.4 多租户应用

**需求**: 不同租户使用不同品牌

**配置要点**:

- 动态生成 manifest
- 从数据库获取租户配置
- 设置租户特定的图标和颜色

### 6.5 离线优先应用

**需求**: 支持离线使用

**配置要点**:

- 配置 Service Worker
- 设置合适的 scope
- 添加离线页面
- 配置缓存策略

---

## 7. 注意事项

### 7.1 图标要求

**必需尺寸**: 192x192 和 512x512

**推荐格式**: PNG,支持透明背景

**Maskable 图标**: 确保重要内容在安全区域内(中心 80%)

```tsx
icons: [
  {
    src: "/icon-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any maskable", // 同时支持普通和maskable
  },
];
```

### 7.2 名称长度

**name**: 最多 45 个字符,超出会被截断

**short_name**: 最多 12 个字符,用于主屏幕图标下方

**description**: 最多 132 个字符

```tsx
{
  name: '我的应用 - 完整名称', // 45字符以内
  short_name: '应用', // 12字符以内
  description: '简短的应用描述,不要太长', // 132字符以内
}
```

### 7.3 颜色配置

**theme_color**: 影响浏览器 UI 颜色(地址栏、状态栏)

**background_color**: 启动画面背景色

```tsx
{
  theme_color: '#0070f3', // 使用十六进制颜色
  background_color: '#ffffff',
}
```

### 7.4 display 模式选择

| 模式       | 何时使用   | 何时不用       |
| ---------- | ---------- | -------------- |
| fullscreen | 游戏、视频 | 需要导航的应用 |
| standalone | 大多数 PWA | 需要浏览器功能 |
| minimal-ui | 阅读应用   | 需要完整 UI    |
| browser    | 普通网站   | PWA 应用       |

### 7.5 scope 限制

scope 定义了应用的导航范围,超出范围会在浏览器中打开:

```tsx
{
  start_url: '/app',
  scope: '/app/', // 只有/app/*路径在应用内打开
}
```

### 7.6 缓存策略

manifest 文件会被浏览器缓存,更新后可能不会立即生效:

```tsx
// 在layout.tsx中设置缓存头
export const metadata = {
  manifest: "/manifest.json",
};

// 或在next.config.js中配置
module.exports = {
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};
```

---

## 8. 常见问题

### 8.1 manifest 不生效?

**问题**: 配置了 manifest 但应用无法安装。

**原因**:

1. 文件名不正确
2. 缺少必需字段
3. 图标尺寸不符合要求
4. 没有 HTTPS

**解决方案**:

```tsx
// 1. 确保文件名正确
app / manifest.ts; // ✓ 正确
app / manifest.json; // ✗ 错误(Next.js使用.ts)

// 2. 检查必需字段
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称", // 必需
    short_name: "应用", // 推荐
    start_url: "/", // 必需
    display: "standalone", // 必需
    icons: [
      // 必需
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}

// 3. 确保使用HTTPS(本地开发除外)
```

### 8.2 如何测试 PWA 安装?

**问题**: 不知道 PWA 是否可以安装。

**解决方案**:

```bash
# 1. 使用Chrome DevTools
# 打开DevTools > Application > Manifest
# 检查是否有错误提示

# 2. 使用Lighthouse
npx lighthouse https://example.com --view
# 查看PWA评分和建议

# 3. 手动测试
# Chrome: 地址栏右侧应显示安装图标
# 移动设备: 浏览器菜单中应有"添加到主屏幕"选项
```

### 8.3 图标不显示?

**问题**: 安装后图标显示不正确。

**原因**:

1. 图标路径错误
2. 图标尺寸不符合要求
3. 图标格式不支持

**解决方案**:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    icons: [
      {
        src: "/icon-192x192.png", // 确保文件存在于public目录
        sizes: "192x192", // 必须是192x192或512x512
        type: "image/png", // 推荐使用PNG
        purpose: "any maskable", // 同时支持普通和maskable
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
```

### 8.4 如何动态生成 manifest?

**问题**: 需要根据用户或环境动态生成 manifest。

**解决方案**:

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";
import { cookies } from "next/headers";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // 从cookie获取用户偏好
  const cookieStore = cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  // 从数据库获取配置
  const config = await getAppConfig();

  return {
    name: config.name,
    theme_color: theme === "dark" ? "#1a1a1a" : "#ffffff",
    background_color: theme === "dark" ? "#000000" : "#ffffff",
    // ...其他配置
  };
}
```

### 8.5 shortcuts 不显示?

**问题**: 配置了 shortcuts 但长按图标不显示。

**原因**:

1. 浏览器不支持
2. shortcuts 配置错误
3. 图标路径错误

**解决方案**:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    shortcuts: [
      {
        name: "快捷方式名称", // 必需
        short_name: "简称", // 可选
        description: "描述", // 推荐
        url: "/path", // 必需,必须在scope内
        icons: [
          // 推荐
          {
            src: "/icons/shortcut.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
```

**注意**: shortcuts 目前主要在 Android Chrome 上支持。

### 8.6 如何支持多语言 manifest?

**问题**: 不同语言用户看到不同的应用名称。

**解决方案**:

```tsx
// app/[lang]/manifest.ts
import { MetadataRoute } from "next";

const translations = {
  zh: {
    name: "我的应用",
    description: "应用描述",
  },
  en: {
    name: "My App",
    description: "App description",
  },
};

export default function manifest({
  params,
}: {
  params: { lang: string };
}): MetadataRoute.Manifest {
  const t = translations[params.lang as keyof typeof translations];

  return {
    name: t.name,
    description: t.description,
    start_url: `/${params.lang}`,
    // ...其他配置
  };
}
```

### 8.7 如何处理 manifest 缓存?

**问题**: 更新 manifest 后浏览器仍使用旧版本。

**解决方案**:

```tsx
// 1. 在next.config.js中设置缓存头
module.exports = {
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

// 2. 或在manifest中添加版本号
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    version: "1.0.1", // 更新版本号
    // ...其他配置
  };
}

// 3. 清除浏览器缓存
// Chrome: chrome://settings/clearBrowserData
```

### 8.8 如何测试不同 display 模式?

**问题**: 想测试不同 display 模式的效果。

**解决方案**:

```tsx
// 1. 在manifest中设置display
export default function manifest(): MetadataRoute.Manifest {
  return {
    display: "standalone", // 或fullscreen, minimal-ui, browser
  };
}

// 2. 使用Chrome DevTools模拟
// DevTools > Application > Manifest > 点击"Add to homescreen"

// 3. 在真实设备上测试
// 安装PWA后从主屏幕启动
```

### 8.9 如何配置启动画面?

**问题**: 想自定义 PWA 启动时的画面。

**解决方案**:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "应用名称",
    background_color: "#ffffff", // 启动画面背景色
    theme_color: "#0070f3", // 状态栏颜色
    icons: [
      {
        src: "/icon-512x512.png", // 启动画面会显示这个图标
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

**注意**: 启动画面由浏览器自动生成,包含应用图标、名称和背景色。

### 8.10 如何关联原生应用?

**问题**: 想在 PWA 中推荐用户下载原生应用。

**解决方案**:

```tsx
export default function manifest(): MetadataRoute.Manifest {
  return {
    related_applications: [
      {
        platform: "play",
        url: "https://play.google.com/store/apps/details?id=com.example.app",
        id: "com.example.app",
      },
      {
        platform: "itunes",
        url: "https://apps.apple.com/app/example/id123456789",
      },
    ],
    prefer_related_applications: true, // 优先推荐原生应用
  };
}
```

---

## 9. 总结

### 9.1 核心要点

1. **必需字段**: name, start_url, display, icons
2. **图标要求**: 192x192 和 512x512 两种尺寸
3. **动态配置**: 支持根据环境、语言、用户动态生成
4. **PWA 标准**: 遵循 W3C Web App Manifest 规范
5. **浏览器支持**: Chrome 和 Edge 完全支持,Safari 部分支持

### 9.2 最佳实践

| 实践                 | 说明               | 优先级 |
| -------------------- | ------------------ | ------ |
| 提供完整图标集       | 192x192 和 512x512 | 高     |
| 使用 standalone 模式 | 提供类原生体验     | 高     |
| 配置 theme_color     | 统一品牌色         | 高     |
| 添加 shortcuts       | 提升用户体验       | 中     |
| 提供 screenshots     | 应用商店展示       | 中     |
| 配置 categories      | 帮助分类           | 低     |
| 关联原生应用         | 引导下载           | 低     |

### 9.3 完整配置模板

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // 基础信息
    name: "应用完整名称",
    short_name: "应用简称",
    description: "应用描述",

    // 启动配置
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",

    // 颜色配置
    theme_color: "#0070f3",
    background_color: "#ffffff",

    // 图标配置
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],

    // 分类
    categories: ["productivity", "business"],

    // 快捷方式
    shortcuts: [
      {
        name: "新建",
        url: "/new",
        icons: [{ src: "/icons/new.png", sizes: "96x96" }],
      },
    ],

    // 截图
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1280x720",
        type: "image/png",
      },
    ],
  };
}
```

### 9.4 下一步

学习完 manifest 配置后,建议继续学习:

1. **Service Worker**: 实现离线功能和缓存策略
2. **Push Notifications**: 推送通知
3. **Background Sync**: 后台同步
4. **Web Share API**: 原生分享功能

通过正确配置 manifest.json,你可以将 Next.js 应用转变为功能完整的 PWA,为用户提供接近原生应用的体验。

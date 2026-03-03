**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# generateSitemaps 函数详解

## 1. 概述

`generateSitemaps`是 Next.js 16 中用于生成多个站点地图的函数。当你的网站有大量页面(超过 50,000 个 URL)时,需要将站点地图拆分成多个文件,这个函数就派上用场了。

### 1.1 核心特性

- **多站点地图支持**: 自动拆分大型站点地图
- **动态生成**: 根据数据动态生成站点地图
- **类型安全**: 完整的 TypeScript 支持
- **SEO 优化**: 符合搜索引擎标准
- **自动索引**: 生成 sitemap-index.xml

### 1.2 与 sitemap.xml 的关系

| 特性     | sitemap.xml         | generateSitemaps    |
| -------- | ------------------- | ------------------- |
| 适用场景 | 小型网站(<50k URLs) | 大型网站(>50k URLs) |
| 文件数量 | 单个文件            | 多个文件            |
| 动态生成 | 支持                | 支持                |
| 索引文件 | 不需要              | 自动生成            |

### 1.3 适用场景

- 大型电商网站(数万个产品)
- 新闻网站(大量文章)
- 内容聚合平台
- 多语言网站
- 文档网站(大量页面)

---

## 2. 基础用法

### 2.1 简单示例

```tsx
// app/sitemap.ts
import { MetadataRoute } from "next";

export async function generateSitemaps() {
  // 获取总页数
  const totalProducts = await getTotalProducts();
  const productsPerSitemap = 50000;
  const numberOfSitemaps = Math.ceil(totalProducts / productsPerSitemap);

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({
    id: i,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const start = id * 50000;
  const end = start + 50000;
  const products = await getProducts(start, end);

  return products.map((product) => ({
    url: `https://example.com/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}
```

### 2.2 类型定义

```tsx
type Sitemap = Array<{
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}>;

type GenerateSitemapsReturn = Array<{ id: number | string }>;

function generateSitemaps():
  | Promise<GenerateSitemapsReturn>
  | GenerateSitemapsReturn;
```

### 2.3 生成的文件结构

```
/sitemap/0.xml
/sitemap/1.xml
/sitemap/2.xml
/sitemap-index.xml (自动生成)
```

---

## 3. 高级用法

### 3.1 按类别拆分

```tsx
// app/sitemap.ts
export async function generateSitemaps() {
  const categories = await getCategories();

  return categories.map((category) => ({
    id: category.slug,
  }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsByCategory(id);

  return products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));
}
```

### 3.2 多语言站点地图

```tsx
// app/sitemap.ts
const locales = ["en", "zh", "ja", "ko"];

export async function generateSitemaps() {
  return locales.map((locale) => ({
    id: locale,
  }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const posts = await getLocalizedPosts(id);

  return posts.map((post) => ({
    url: `https://example.com/${id}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: locales.reduce((acc, locale) => {
        acc[locale] = `https://example.com/${locale}/blog/${post.slug}`;
        return acc;
      }, {} as Record<string, string>),
    },
  }));
}
```

### 3.3 分页站点地图

```tsx
// app/sitemap.ts
const ITEMS_PER_SITEMAP = 10000;

export async function generateSitemaps() {
  const totalItems = await getTotalItems();
  const numberOfSitemaps = Math.ceil(totalItems / ITEMS_PER_SITEMAP);

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({
    id: i,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * ITEMS_PER_SITEMAP;
  const items = await getItems(offset, ITEMS_PER_SITEMAP);

  return items.map((item) => ({
    url: `https://example.com/items/${item.id}`,
    lastModified: item.updatedAt,
  }));
}
```

---

## 4. 实战案例

### 4.1 电商网站

```tsx
// app/sitemap.ts
import { MetadataRoute } from "next";

const PRODUCTS_PER_SITEMAP = 50000;

export async function generateSitemaps() {
  const totalProducts = await db.product.count();
  const numberOfSitemaps = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({
    id: i,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * PRODUCTS_PER_SITEMAP;

  const products = await db.product.findMany({
    skip: offset,
    take: PRODUCTS_PER_SITEMAP,
    select: {
      slug: true,
      updatedAt: true,
      category: true,
    },
  });

  return products.map((product) => ({
    url: `https://shop.example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily" as const,
    priority: product.category === "featured" ? 1.0 : 0.8,
  }));
}
```

### 4.2 新闻网站

```tsx
// app/sitemap.ts
export async function generateSitemaps() {
  const years = await getPublishedYears();

  return years.map((year) => ({
    id: year.toString(),
  }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const year = parseInt(id);
  const articles = await getArticlesByYear(year);

  return articles.map((article) => ({
    url: `https://news.example.com/article/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: "never" as const,
    priority: article.featured ? 1.0 : 0.6,
  }));
}
```

### 4.3 博客平台

```tsx
// app/sitemap.ts
export async function generateSitemaps() {
  const authors = await getAuthors();

  return authors.map((author) => ({
    id: author.username,
  }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostsByAuthor(id);

  return posts.map((post) => ({
    url: `https://blog.example.com/@${id}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}
```

### 4.4 文档网站

```tsx
// app/sitemap.ts
export async function generateSitemaps() {
  const versions = await getDocVersions();

  return versions.map((version) => ({
    id: version,
  }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const docs = await getDocsByVersion(id);

  return docs.map((doc) => ({
    url: `https://docs.example.com/${id}/${doc.path}`,
    lastModified: doc.updatedAt,
    changeFrequency: "monthly" as const,
    priority: doc.path === "index" ? 1.0 : 0.8,
  }));
}
```

### 4.5 多语言内容网站

```tsx
// app/sitemap.ts
const locales = ["en", "zh", "ja", "ko", "es", "fr"];

export async function generateSitemaps() {
  const totalPages = await getTotalPages();
  const pagesPerSitemap = 10000;
  const numberOfSitemaps = Math.ceil(totalPages / pagesPerSitemap);

  const sitemaps = [];
  for (const locale of locales) {
    for (let i = 0; i < numberOfSitemaps; i++) {
      sitemaps.push({
        id: `${locale}-${i}`,
      });
    }
  }

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const [locale, pageNum] = id.split("-");
  const offset = parseInt(pageNum) * 10000;

  const pages = await getLocalizedPages(locale, offset, 10000);

  return pages.map((page) => ({
    url: `https://example.com/${locale}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: {
      languages: locales.reduce((acc, loc) => {
        acc[loc] = `https://example.com/${loc}/${page.slug}`;
        return acc;
      }, {} as Record<string, string>),
    },
  }));
}
```

---

## 5. 性能优化

### 5.1 数据库查询优化

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;

  // 只查询必要的字段
  const products = await db.product.findMany({
    skip: offset,
    take: 50000,
    select: {
      slug: true,
      updatedAt: true,
    },
    // 添加索引
    orderBy: {
      id: "asc",
    },
  });

  return products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

### 5.2 缓存策略

```tsx
// app/sitemap.ts
export const revalidate = 3600; // 缓存1小时

export async function generateSitemaps() {
  // 缓存站点地图列表
  const sitemaps = await getCachedSitemaps();
  return sitemaps;
}

async function getCachedSitemaps() {
  const cached = await redis.get("sitemaps:list");
  if (cached) {
    return JSON.parse(cached);
  }

  const totalProducts = await getTotalProducts();
  const numberOfSitemaps = Math.ceil(totalProducts / 50000);
  const sitemaps = Array.from({ length: numberOfSitemaps }, (_, i) => ({
    id: i,
  }));

  await redis.set("sitemaps:list", JSON.stringify(sitemaps), "EX", 3600);
  return sitemaps;
}
```

### 5.3 并发控制

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const limit = 50000;

  // 分批查询,避免一次性加载过多数据
  const batchSize = 10000;
  const batches = Math.ceil(limit / batchSize);

  const results = [];
  for (let i = 0; i < batches; i++) {
    const batchOffset = offset + i * batchSize;
    const products = await getProducts(batchOffset, batchSize);
    results.push(...products);
  }

  return results.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

---

## 6. 类型安全

### 6.1 完整类型定义

```tsx
import { MetadataRoute } from "next";

type SitemapId = number | string;

type GenerateSitemapsReturn = Array<{
  id: SitemapId;
}>;

type SitemapFunction = (props: {
  id: SitemapId;
}) => Promise<MetadataRoute.Sitemap> | MetadataRoute.Sitemap;

export async function generateSitemaps(): Promise<GenerateSitemapsReturn> {
  return [{ id: 0 }];
}

export default async function sitemap({
  id,
}: {
  id: SitemapId;
}): Promise<MetadataRoute.Sitemap> {
  return [];
}
```

### 6.2 Zod 验证

```tsx
import { z } from "zod";

const SitemapEntrySchema = z.object({
  url: z.string().url(),
  lastModified: z.union([z.string(), z.date()]).optional(),
  changeFrequency: z
    .enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
    .optional(),
  priority: z.number().min(0).max(1).optional(),
  alternates: z
    .object({
      languages: z.record(z.string(), z.string().url()).optional(),
    })
    .optional(),
});

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts(id * 50000, 50000);

  const entries = products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // 验证每个条目
  entries.forEach((entry) => {
    SitemapEntrySchema.parse(entry);
  });

  return entries;
}
```

---

## 7. 适用场景

### 7.1 大型电商平台

**场景**: 数十万个产品页面

**策略**: 按类别或数量拆分

```tsx
export async function generateSitemaps() {
  const totalProducts = await getTotalProducts();
  const numberOfSitemaps = Math.ceil(totalProducts / 50000);
  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}
```

### 7.2 新闻聚合网站

**场景**: 大量新闻文章

**策略**: 按时间拆分

```tsx
export async function generateSitemaps() {
  const years = await getPublishedYears();
  return years.map((year) => ({ id: year.toString() }));
}
```

### 7.3 多语言内容平台

**场景**: 多语言版本的大量内容

**策略**: 按语言和分页拆分

```tsx
export async function generateSitemaps() {
  const locales = ["en", "zh", "ja"];
  const sitemaps = [];
  for (const locale of locales) {
    const pages = Math.ceil((await getTotalPages(locale)) / 10000);
    for (let i = 0; i < pages; i++) {
      sitemaps.push({ id: `${locale}-${i}` });
    }
  }
  return sitemaps;
}
```

### 7.4 文档网站

**场景**: 大量文档页面

**策略**: 按版本拆分

```tsx
export async function generateSitemaps() {
  const versions = await getDocVersions();
  return versions.map((version) => ({ id: version }));
}
```

### 7.5 用户生成内容平台

**场景**: 大量用户内容

**策略**: 按用户或内容类型拆分

```tsx
export async function generateSitemaps() {
  const contentTypes = ["posts", "videos", "images"];
  return contentTypes.map((type) => ({ id: type }));
}
```

---

## 8. 注意事项

### 8.1 URL 限制

每个站点地图最多 50,000 个 URL:

```tsx
const MAX_URLS_PER_SITEMAP = 50000;

export async function generateSitemaps() {
  const totalUrls = await getTotalUrls();
  const numberOfSitemaps = Math.ceil(totalUrls / MAX_URLS_PER_SITEMAP);

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}
```

### 8.2 文件大小

每个站点地图文件不应超过 50MB:

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;

  // 只包含必要的字段,减小文件大小
  const products = await getProducts(offset, 50000);

  return products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    // 省略可选字段以减小文件大小
  }));
}
```

### 8.3 性能考虑

避免一次性加载过多数据:

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const limit = 50000;
  const batchSize = 10000;

  const results = [];
  for (let i = 0; i < limit; i += batchSize) {
    const batch = await getProducts(offset + i, batchSize);
    results.push(...batch);
  }

  return results.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

### 8.4 缓存配置

合理配置缓存时间:

```tsx
// app/sitemap.ts
export const revalidate = 86400; // 24小时

export async function generateSitemaps() {
  // 站点地图列表通常不经常变化
  return await getCachedSitemapList();
}
```

### 8.5 错误处理

处理数据获取失败:

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  try {
    const offset = id * 50000;
    const products = await getProducts(offset, 50000);

    return products.map((product) => ({
      url: `https://example.com/product/${product.slug}`,
      lastModified: product.updatedAt,
    }));
  } catch (error) {
    console.error(`Failed to generate sitemap ${id}:`, error);
    // 返回空数组或默认值
    return [];
  }
}
```

### 8.6 URL 格式

确保 URL 格式正确:

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts(id * 50000, 50000);

  return products.map((product) => ({
    // 确保URL是完整的绝对URL
    url: `https://example.com/product/${encodeURIComponent(product.slug)}`,
    lastModified: product.updatedAt,
  }));
}
```

---

## 9. 常见问题

### 9.1 如何测试站点地图?

**方法**: 访问站点地图 URL

```bash
# 访问站点地图索引
https://example.com/sitemap-index.xml

# 访问具体的站点地图
https://example.com/sitemap/0.xml
https://example.com/sitemap/1.xml
```

**使用工具**:

- Google Search Console
- Bing Webmaster Tools
- 在线站点地图验证器

### 9.2 站点地图不生成?

**问题**: 站点地图文件没有生成。

**原因**:

1. 函数名拼写错误
2. 返回值格式不正确
3. 数据获取失败

**解决方案**:

```tsx
// ✅ 正确
export async function generateSitemaps() {
  return [{ id: 0 }];
}

// ❌ 错误 - 函数名错误
export async function generateSitemap() {
  return [{ id: 0 }];
}

// ❌ 错误 - 返回值格式错误
export async function generateSitemaps() {
  return [0, 1, 2]; // 应该返回对象数组
}
```

### 9.3 如何处理大量数据?

**问题**: 数据量太大导致性能问题。

**解决方案**: 分批处理

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const batchSize = 10000;
  const results = [];

  for (let i = 0; i < 50000; i += batchSize) {
    const batch = await getProducts(offset + i, batchSize);
    results.push(...batch);
  }

  return results.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

### 9.4 如何添加多语言支持?

**问题**: 需要为多语言网站生成站点地图。

**解决方案**: 使用 alternates 字段

```tsx
export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return posts.map((post) => ({
    url: `https://example.com/en/blog/${post.slug}`,
    lastModified: post.updatedAt,
    alternates: {
      languages: {
        en: `https://example.com/en/blog/${post.slug}`,
        zh: `https://example.com/zh/blog/${post.slug}`,
        ja: `https://example.com/ja/blog/${post.slug}`,
      },
    },
  }));
}
```

### 9.5 如何设置优先级?

**问题**: 不同页面的重要性不同。

**解决方案**: 根据页面类型设置 priority

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const pages = await getPages(id * 50000, 50000);

  return pages.map((page) => {
    let priority = 0.5;

    if (page.type === "homepage") priority = 1.0;
    else if (page.type === "category") priority = 0.8;
    else if (page.type === "product") priority = 0.7;
    else if (page.type === "blog") priority = 0.6;

    return {
      url: `https://example.com/${page.slug}`,
      lastModified: page.updatedAt,
      priority,
    };
  });
}
```

### 9.6 如何调试站点地图?

**方法**: 添加日志

```tsx
export async function generateSitemaps() {
  const totalProducts = await getTotalProducts();
  const numberOfSitemaps = Math.ceil(totalProducts / 50000);

  console.log(
    `Generating ${numberOfSitemaps} sitemaps for ${totalProducts} products`
  );

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  console.log(`Generating sitemap ${id}`);

  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  console.log(`Sitemap ${id} contains ${products.length} URLs`);

  return products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

### 9.7 如何提交到搜索引擎?

**方法**: 使用 robots.txt

```txt
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

**或者**: 在 Google Search Console 中手动提交

```bash
https://search.google.com/search-console
```

### 9.8 如何处理动态路由?

**问题**: 动态路由参数需要从数据库获取。

**解决方案**:

```tsx
export async function generateSitemaps() {
  const categories = await getCategories();
  return categories.map((cat) => ({ id: cat.slug }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsByCategory(id);

  return products.map((product) => ({
    url: `https://example.com/category/${id}/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

### 9.9 如何处理 changeFrequency?

**问题**: 不同类型的页面更新频率不同。

**解决方案**:

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const pages = await getPages(id * 50000, 50000);

  return pages.map((page) => {
    let changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never" = "weekly";

    if (page.type === "news") changeFrequency = "hourly";
    else if (page.type === "blog") changeFrequency = "weekly";
    else if (page.type === "product") changeFrequency = "daily";
    else if (page.type === "static") changeFrequency = "monthly";

    return {
      url: `https://example.com/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency,
    };
  });
}
```

### 9.10 如何验证站点地图?

**工具**:

- [XML Sitemaps Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- Google Search Console
- Bing Webmaster Tools

**手动检查**:

```bash
# 访问站点地图
curl https://example.com/sitemap-index.xml

# 检查格式
curl https://example.com/sitemap/0.xml | xmllint --format -
```

---

## 10. 总结

### 10.1 核心要点

1. **多站点地图**: `generateSitemaps`用于生成多个站点地图文件
2. **URL 限制**: 每个站点地图最多 50,000 个 URL
3. **自动索引**: Next.js 自动生成 sitemap-index.xml
4. **类型安全**: 完整的 TypeScript 支持
5. **性能优化**: 使用分批查询和缓存

### 10.2 最佳实践

| 实践     | 说明                   | 示例                  |
| -------- | ---------------------- | --------------------- |
| 合理拆分 | 按类别或数量拆分       | 每个站点地图 50k URLs |
| 缓存配置 | 配置合理的缓存时间     | revalidate: 86400     |
| 分批查询 | 避免一次性加载过多数据 | 每批 10k 条记录       |
| 错误处理 | 处理数据获取失败       | try-catch + 空数组    |
| URL 编码 | 确保 URL 格式正确      | encodeURIComponent    |

### 10.3 配置模板

**标准电商**:

```tsx
export async function generateSitemaps() {
  const totalProducts = await getTotalProducts();
  const numberOfSitemaps = Math.ceil(totalProducts / 50000);
  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  return products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
```

**多语言网站**:

```tsx
export async function generateSitemaps() {
  const locales = ["en", "zh", "ja"];
  return locales.map((locale) => ({ id: locale }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const posts = await getLocalizedPosts(id);

  return posts.map((post) => ({
    url: `https://example.com/${id}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    alternates: {
      languages: {
        en: `https://example.com/en/blog/${post.slug}`,
        zh: `https://example.com/zh/blog/${post.slug}`,
        ja: `https://example.com/ja/blog/${post.slug}`,
      },
    },
  }));
}
```

### 10.4 Next.js 16 的改进

🆕 **Next.js 16 新增**:

- 更好的站点地图生成性能
- 改进的错误提示
- 更清晰的 API

⚡ **Next.js 16 增强**:

- 更快的构建速度
- 更好的缓存机制
- 改进的 TypeScript 支持

### 10.5 常见错误

| 错误           | 原因                  | 解决方案              |
| -------------- | --------------------- | --------------------- |
| 站点地图不生成 | 函数名错误            | 使用 generateSitemaps |
| URL 超限       | 单个文件超过 50k URLs | 增加站点地图数量      |
| 性能问题       | 一次性加载过多数据    | 分批查询              |
| 格式错误       | 返回值格式不正确      | 返回对象数组          |

### 10.6 进阶学习

想要深入学习`generateSitemaps`,建议:

1. 了解站点地图协议
2. 学习 SEO 最佳实践
3. 掌握数据库查询优化
4. 了解搜索引擎爬虫机制
5. 学习性能优化技巧

### 10.7 相关资源

- [Next.js 官方文档 - generateSitemaps](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps)
- [Sitemaps.org 协议](https://www.sitemaps.org/protocol.html)
- [Google 搜索中心 - 站点地图](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)

`generateSitemaps`是 Next.js 16 中处理大型网站站点地图的核心函数。正确使用它可以显著提升网站的 SEO 表现,帮助搜索引擎更好地索引你的网站。记住,站点地图是 SEO 的基础,但不是全部,还需要配合其他 SEO 优化措施。

---

## 11. 高级技巧

### 11.1 动态站点地图索引

```tsx
// app/sitemap.ts
export async function generateSitemaps() {
  const categories = await getCategories();
  const years = await getYears();

  const sitemaps = [
    ...categories.map((cat) => ({ id: `category-${cat.slug}` })),
    ...years.map((year) => ({ id: `year-${year}` })),
  ];

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  if (id.startsWith("category-")) {
    const categorySlug = id.replace("category-", "");
    const products = await getProductsByCategory(categorySlug);

    return products.map((product) => ({
      url: `https://example.com/category/${categorySlug}/${product.slug}`,
      lastModified: product.updatedAt,
    }));
  }

  if (id.startsWith("year-")) {
    const year = parseInt(id.replace("year-", ""));
    const articles = await getArticlesByYear(year);

    return articles.map((article) => ({
      url: `https://example.com/article/${article.slug}`,
      lastModified: article.publishedAt,
    }));
  }

  return [];
}
```

### 11.2 增量更新

```tsx
// app/sitemap.ts
export const revalidate = 3600; // 1小时

export async function generateSitemaps() {
  const lastUpdate = await getLastUpdateTime();
  const numberOfSitemaps = await calculateSitemapCount();

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({
    id: i,
    lastModified: lastUpdate,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  return products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));
}
```

### 11.3 条件生成

```tsx
// app/sitemap.ts
export async function generateSitemaps() {
  const env = process.env.NODE_ENV;

  if (env === "development") {
    // 开发环境只生成一个站点地图
    return [{ id: 0 }];
  }

  // 生产环境生成所有站点地图
  const totalProducts = await getTotalProducts();
  const numberOfSitemaps = Math.ceil(totalProducts / 50000);

  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}
```

### 11.4 自定义排序

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  // 按优先级排序
  const sortedProducts = products.sort((a, b) => {
    const priorityA = a.featured ? 1.0 : 0.8;
    const priorityB = b.featured ? 1.0 : 0.8;
    return priorityB - priorityA;
  });

  return sortedProducts.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
    priority: product.featured ? 1.0 : 0.8,
  }));
}
```

### 11.5 过滤无效 URL

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  // 过滤掉已删除或未发布的产品
  const validProducts = products.filter(
    (product) => product.status === "published" && !product.deleted
  );

  return validProducts.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));
}
```

---

## 12. 性能监控

### 12.1 生成时间监控

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const startTime = Date.now();

  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  const sitemap = products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));

  const endTime = Date.now();
  console.log(`Sitemap ${id} generated in ${endTime - startTime}ms`);

  return sitemap;
}
```

### 12.2 内存使用监控

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;

  const offset = id * 50000;
  const products = await getProducts(offset, 50000);

  const sitemap = products.map((product) => ({
    url: `https://example.com/product/${product.slug}`,
    lastModified: product.updatedAt,
  }));

  const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `Sitemap ${id} memory used: ${(memAfter - memBefore).toFixed(2)} MB`
  );

  return sitemap;
}
```

### 12.3 错误追踪

```tsx
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  try {
    const offset = id * 50000;
    const products = await getProducts(offset, 50000);

    return products.map((product) => ({
      url: `https://example.com/product/${product.slug}`,
      lastModified: product.updatedAt,
    }));
  } catch (error) {
    console.error(`Error generating sitemap ${id}:`, error);

    // 发送到错误追踪服务
    // await sendToSentry(error);

    return [];
  }
}
```

通过掌握这些高级技巧和最佳实践,你可以充分发挥`generateSitemaps`的威力,为大型网站构建高效的站点地图系统。记住,站点地图的质量直接影响搜索引擎的爬取效率,进而影响网站的 SEO 表现。

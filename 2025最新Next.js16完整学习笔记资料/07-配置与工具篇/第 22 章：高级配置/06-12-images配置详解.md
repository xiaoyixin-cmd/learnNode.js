**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# images 配置详解

## 概述

images 配置是 Next.js 中用于优化图片加载和处理的核心配置项。通过合理配置图片选项，可以实现自动图片优化、响应式图片、懒加载等功能，显著提升应用性能和用户体验。

### images 配置的作用

1. **自动优化**：自动转换图片格式（WebP、AVIF）
2. **响应式图片**：根据设备尺寸提供合适的图片
3. **懒加载**：延迟加载屏幕外的图片
4. **CDN 支持**：配置自定义图片加载器
5. **性能提升**：减少图片大小，加快加载速度

## 基础用法

### 基本配置

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ["example.com", "cdn.example.com"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
  },
};
```

### 配置选项详解

| 选项                    | 类型     | 说明               | 默认值                                        |
| ----------------------- | -------- | ------------------ | --------------------------------------------- |
| `domains`               | string[] | 允许的外部图片域名 | []                                            |
| `remotePatterns`        | object[] | 远程图片 URL 模式  | []                                            |
| `deviceSizes`           | number[] | 设备尺寸断点       | [640, 750, 828, 1080, 1200, 1920, 2048, 3840] |
| `imageSizes`            | number[] | 图片尺寸           | [16, 32, 48, 64, 96, 128, 256, 384]           |
| `formats`               | string[] | 支持的图片格式     | ['image/webp']                                |
| `minimumCacheTTL`       | number   | 最小缓存时间（秒） | 60                                            |
| `dangerouslyAllowSVG`   | boolean  | 是否允许 SVG       | false                                         |
| `contentSecurityPolicy` | string   | SVG 的 CSP 策略    | -                                             |
| `loader`                | string   | 图片加载器         | 'default'                                     |
| `loaderFile`            | string   | 自定义加载器文件   | -                                             |

### 允许外部域名

```javascript
// next.config.js
module.exports = {
  images: {
    domains: [
      "images.unsplash.com",
      "cdn.example.com",
      "avatars.githubusercontent.com",
    ],
  },
};
```

### 使用 remotePatterns

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/**",
      },
    ],
  },
};
```

### 图片格式配置

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};
```

### 设备尺寸配置

```javascript
// next.config.js
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

## 高级配置

### 自定义图片加载器

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.js",
  },
};
```

```javascript
// lib/image-loader.js
export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  const paramsString = params.join(",");
  return `https://example.com/cdn-cgi/image/${paramsString}/${src}`;
}
```

### Cloudflare Images 配置

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudflare-loader.js",
  },
};
```

```javascript
// lib/cloudflare-loader.js
export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`, `format=auto`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  return `https://imagedelivery.net/account-hash/${src}/${params.join(",")}`;
}
```

### Imgix 配置

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "imgix",
    path: "https://example.imgix.net",
  },
};
```

### Cloudinary 配置

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "cloudinary",
    path: "https://res.cloudinary.com/demo/image/upload/",
  },
};
```

### 缓存配置

```javascript
// next.config.js
module.exports = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7天
  },
};
```

### SVG 支持

```javascript
// next.config.js
module.exports = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```

### 响应式图片配置

```javascript
// next.config.js
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

```tsx
// 使用Image组件
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### 图片质量配置

```tsx
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      quality={75} // 默认75
    />
  );
}
```

### 图片优先级

```tsx
import Image from "next/image";

export default function Page() {
  return (
    <>
      {/* 首屏图片，高优先级 */}
      <Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />

      {/* 非首屏图片，懒加载 */}
      <Image src="/content.jpg" alt="Content" width={800} height={600} />
    </>
  );
}
```

### 占位符配置

```tsx
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    />
  );
}
```

### 静态导入图片

```tsx
import Image from "next/image";
import heroImage from "../public/hero.jpg";

export default function Page() {
  return (
    <Image
      src={heroImage}
      alt="Hero"
      placeholder="blur" // 自动生成模糊占位符
    />
  );
}
```

## 实战案例

### 案例 1：电商产品图片优化

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ["cdn.shop.com"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天
  },
};
```

```tsx
// components/ProductImage.tsx
import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  priority,
}: ProductImageProps) {
  return (
    <div className="relative aspect-square">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
```

### 案例 2：博客文章图片

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.blog.com",
        pathname: "/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};
```

```tsx
// components/ArticleImage.tsx
import Image from "next/image";

interface ArticleImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export default function ArticleImage({ src, alt, caption }: ArticleImageProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="rounded-lg"
      />
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

### 案例 3：用户头像优化

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ["avatars.githubusercontent.com", "cdn.example.com"],
    imageSizes: [32, 48, 64, 96, 128],
  },
};
```

```tsx
// components/Avatar.tsx
import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: 32 | 48 | 64 | 96 | 128;
}

export default function Avatar({ src, alt, size = 48 }: AvatarProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image src={src} alt={alt} fill className="rounded-full object-cover" />
    </div>
  );
}
```

### 案例 4：画廊组件

```tsx
// components/Gallery.tsx
import Image from "next/image";
import { useState } from "react";

interface GalleryProps {
  images: Array<{ src: string; alt: string }>;
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video">
        <Image
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative aspect-square ${
              index === selectedIndex ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 适用场景

| 场景     | 配置建议               | 原因         |
| -------- | ---------------------- | ------------ |
| 电商网站 | 启用 AVIF/WebP，长缓存 | 大量产品图片 |
| 博客网站 | 配置外部域名，中等缓存 | 文章配图     |
| 社交应用 | 小尺寸优化，短缓存     | 用户头像     |
| 摄影网站 | 高质量，多尺寸         | 高清图片展示 |
| 新闻网站 | 快速加载，响应式       | 新闻配图     |
| 企业官网 | 优化首屏，懒加载       | 营销图片     |

## 注意事项

### 1. 图片尺寸规划

```tsx
// 明确指定图片尺寸
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
/>

// 或使用fill布局
<div className="relative h-64">
  <Image
    src="/photo.jpg"
    alt="Photo"
    fill
    className="object-cover"
  />
</div>
```

### 2. 外部图片安全

```javascript
// 使用remotePatterns而不是domains
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
        pathname: "/images/**",
      },
    ],
  },
};
```

### 3. 性能监控

```tsx
// 监控图片加载性能
import Image from "next/image";

export default function Page() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      onLoadingComplete={(result) => {
        console.log(
          "Image loaded:",
          result.naturalWidth,
          "x",
          result.naturalHeight
        );
      }}
    />
  );
}
```

### 4. 图片格式选择

```javascript
// 优先使用现代格式
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};
```

### 5. 缓存策略

```javascript
// 根据内容更新频率设置缓存
module.exports = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7天
  },
};
```

## 常见问题

### 1. 图片无法加载？

**问题**：外部图片显示 403 或无法加载

**解决方案**：

```javascript
// 添加域名到配置
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};
```

### 2. 图片模糊？

**问题**：图片显示模糊

**解决方案**：

```tsx
// 提高图片质量
<Image src="/photo.jpg" alt="Photo" width={800} height={600} quality={90} />
```

### 3. 图片尺寸错误？

**问题**：图片变形或尺寸不对

**解决方案**：

```tsx
// 使用object-fit控制
<Image src="/photo.jpg" alt="Photo" fill className="object-cover" />
```

### 4. 如何优化首屏图片？

**问题**：首屏图片加载慢

**解决方案**：

```tsx
// 使用priority属性
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

### 5. 如何处理动态图片？

**问题**：图片 URL 是动态的

**解决方案**：

```tsx
// 使用remotePatterns
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.example.com",
        pathname: "/**",
      },
    ],
  },
};
```

### 6. SVG 图片如何处理？

**问题**：SVG 图片无法显示

**解决方案**：

```javascript
module.exports = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```

### 7. 如何实现图片懒加载？

**问题**：所有图片同时加载

**解决方案**：

```tsx
// 默认就是懒加载，除非设置priority
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  // 不设置priority即为懒加载
/>
```

### 8. 如何自定义加载器？

**问题**：需要使用自定义 CDN

**解决方案**：

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.js",
  },
};
```

```javascript
// lib/image-loader.js
export default function myLoader({ src, width, quality }) {
  return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`;
}
```

### 9. 如何处理图片错误？

**问题**：图片加载失败

**解决方案**：

```tsx
import Image from "next/image";
import { useState } from "react";

export default function SafeImage({ src, alt, ...props }) {
  const [error, setError] = useState(false);

  if (error) {
    return <div className="bg-gray-200">Image failed to load</div>;
  }

  return (
    <Image src={src} alt={alt} onError={() => setError(true)} {...props} />
  );
}
```

### 10. 如何优化大量图片？

**问题**：页面有大量图片

**解决方案**：

```tsx
// 使用虚拟滚动
import { useVirtualizer } from "@tanstack/react-virtual";

export default function ImageList({ images }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <div key={virtualItem.index}>
          <Image
            src={images[virtualItem.index].src}
            alt={images[virtualItem.index].alt}
            width={200}
            height={200}
          />
        </div>
      ))}
    </div>
  );
}
```

### 11. 如何实现图片预加载？

**问题**：需要预加载图片

**解决方案**：

```tsx
import Image from "next/image";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // 预加载图片
    const img = new window.Image();
    img.src = "/next-image.jpg";
  }, []);

  return <Image src="/next-image.jpg" alt="Image" width={800} height={600} />;
}
```

### 12. 如何处理响应式图片？

**问题**：不同屏幕显示不同尺寸

**解决方案**：

```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  width={1200}
  height={800}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### 13. 如何实现图片占位符？

**问题**：图片加载时显示占位符

**解决方案**：

```tsx
import Image from "next/image";
import placeholder from "../public/placeholder.jpg";

export default function Page() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL={placeholder.blurDataURL}
    />
  );
}
```

### 14. 如何优化图片缓存？

**问题**：图片缓存时间太短

**解决方案**：

```javascript
module.exports = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1年
  },
};
```

### 15. 如何处理图片格式？

**问题**：浏览器不支持 WebP

**解决方案**：

```javascript
// Next.js会自动降级到支持的格式
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};
```

## 总结

images 配置是 Next.js 中图片优化的核心。合理配置可以：

1. **自动优化**：自动转换为现代图片格式
2. **响应式**：根据设备提供合适尺寸
3. **懒加载**：提升页面加载速度
4. **CDN 支持**：灵活配置图片源
5. **性能提升**：显著改善用户体验

## 补充图片优化技巧

### 1. 图片懒加载策略

```tsx
// components/LazyImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export function LazyImage({ src, alt, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`image-container ${isLoaded ? "loaded" : "loading"}`}>
      <Image
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
```

### 2. 图片占位符策略

```tsx
// components/BlurImage.tsx
import Image from "next/image";

export function BlurImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      width={800}
      height={600}
    />
  );
}
```

### 3. 响应式图片策略

```tsx
// components/ResponsiveImage.tsx
import Image from "next/image";

export function ResponsiveImage({ src, alt }) {
  return (
    <picture>
      <source
        media="(min-width: 1024px)"
        srcSet={`${src}?w=1200 1x, ${src}?w=2400 2x`}
      />
      <source
        media="(min-width: 768px)"
        srcSet={`${src}?w=800 1x, ${src}?w=1600 2x`}
      />
      <Image src={`${src}?w=400`} alt={alt} width={400} height={300} />
    </picture>
  );
}
```

### 4. 图片预加载策略

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero.jpg"
          imageSrcSet="/hero-400.jpg 400w, /hero-800.jpg 800w"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 5. 图片性能监控

```typescript
// lib/image-performance.ts
export function monitorImagePerformance() {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "resource" && entry.name.includes("/image")) {
        console.log({
          url: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        });
      }
    }
  });

  observer.observe({ entryTypes: ["resource"] });
}
```

### 6. 图片错误处理

```tsx
// components/SafeImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export function SafeImage({ src, alt, fallback = "/placeholder.jpg" }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      width={800}
      height={600}
    />
  );
}
```

### 7. 图片格式检测

```typescript
// lib/image-format.ts
export function supportsWebP() {
  if (typeof window === "undefined") return false;

  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

export function supportsAVIF() {
  if (typeof window === "undefined") return false;

  const avif = new Image();
  avif.src =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQ==";
  return avif.height === 1;
}
```

### 8. 图片批量优化

```bash
# scripts/optimize-images.sh
#!/bin/bash

for img in public/images/*.{jpg,png}; do
  # 转换为 WebP
  cwebp -q 80 "$img" -o "${img%.*}.webp"

  # 转换为 AVIF
  avifenc -s 0 "$img" "${img%.*}.avif"
done
```

### 9. 图片 CDN 配置

```javascript
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};
```

```typescript
// lib/image-loader.ts
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ["f_auto", "c_limit", `w_${width}`, `q_${quality || "auto"}`];
  return `https://res.cloudinary.com/demo/image/upload/${params.join(
    ","
  )}${src}`;
}
```

### 10. 图片压缩配置

```javascript
// next.config.js
module.exports = {
  images: {
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
```

关键要点：

- 使用 remotePatterns 配置外部图片
- 启用 AVIF 和 WebP 格式
- 合理设置 deviceSizes 和 imageSizes
- 首屏图片使用 priority
- 配置合适的缓存时间
- 使用 fill 布局处理响应式图片
- 监控图片加载性能
- 自定义加载器对接 CDN
- 实现图片懒加载
- 使用占位符提升体验
- 配置响应式图片
- 预加载关键图片
- 监控图片性能
- 处理图片错误
- 批量优化图片

记住：图片优化是提升网站性能的重要手段，Next.js 的 Image 组件提供了开箱即用的优化方案，但需要根据实际场景合理配置。

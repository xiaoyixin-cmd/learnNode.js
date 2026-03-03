**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# next/image 组件详解

## 1. 概述 (Overview)

next/image 是 Next.js 提供的图像优化组件,它在原生 HTML `<img>`标签的基础上增加了自动优化功能。这个组件可以自动处理图像的尺寸调整、格式转换、懒加载等,大幅提升网站性能。

### 1.1 为什么需要 next/image

**性能问题**: 图像通常是网页中最大的资源,未优化的图像会严重影响加载速度。

**用户体验**: 慢速加载的图像会导致布局偏移(CLS),影响用户体验。

**带宽成本**: 未优化的图像会消耗更多带宽,增加服务器成本。

### 1.2 next/image 的优势

**自动优化**: 自动将图像转换为现代格式(如 WebP、AVIF)。

**响应式**: 根据设备尺寸提供合适的图像大小。

**懒加载**: 默认启用懒加载,只在图像进入视口时加载。

**防止布局偏移**: 自动保留图像空间,避免 CLS。

### 1.3 Next.js 16 的改进

🆕 **Next.js 16 新增**: 改进的图像缓存策略,更快的图像加载。

⚡ **Next.js 16 增强**: 更好的 AVIF 格式支持,更小的文件体积。

🆕 **Next.js 16 新增**: 自动检测图像格式,智能选择最优格式。

---

## 2. 基础用法 (Basic Usage)

### 2.1 本地图像

```tsx
// app/page.tsx
import Image from "next/image";
import profilePic from "./profile.jpg";

export default function Page() {
  return (
    <div>
      <h1>我的个人资料</h1>
      <Image
        src={profilePic}
        alt="个人照片"
        // 本地图像会自动获取宽高
      />
    </div>
  );
}
```

### 2.2 远程图像

```tsx
// app/page.tsx
import Image from "next/image";

export default function Page() {
  return (
    <div>
      <Image
        src="https://example.com/photo.jpg"
        alt="远程图片"
        width={800}
        height={600}
        // 远程图像必须指定宽高
      />
    </div>
  );
}
```

### 2.3 配置远程图像域名

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
    ],
  },
};
```

---

## 3. 核心属性 (Core Props)

### 3.1 必需属性

#### 3.1.1 src

```tsx
// 本地图像
import logo from './logo.png';
<Image src={logo} alt="Logo" />

// 远程图像
<Image src="https://example.com/image.jpg" alt="Image" width={800} height={600} />

// 相对路径
<Image src="/images/hero.jpg" alt="Hero" width={1200} height={800} />
```

#### 3.1.2 alt

```tsx
// 好的alt文本
<Image src="/product.jpg" alt="红色运动鞋,尺码42" width={400} height={300} />

// 装饰性图像可以使用空alt
<Image src="/decoration.jpg" alt="" width={100} height={100} />
```

#### 3.1.3 width 和 height

```tsx
// 固定尺寸
<Image src="/photo.jpg" alt="照片" width={800} height={600} />;

// 本地图像可以省略
import photo from "./photo.jpg";
<Image src={photo} alt="照片" />;
```

### 3.2 可选属性

#### 3.2.1 fill

```tsx
// 填充父容器
<div className="relative w-full h-96">
  <Image src="/hero.jpg" alt="Hero" fill className="object-cover" />
</div>
```

#### 3.2.2 sizes

```tsx
<Image
  src="/responsive.jpg"
  alt="响应式图像"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### 3.2.3 quality

```tsx
// 默认质量75
<Image src="/photo.jpg" alt="照片" width={800} height={600} quality={90} />

// 低质量用于缩略图
<Image src="/thumb.jpg" alt="缩略图" width={100} height={100} quality={50} />
```

#### 3.2.4 priority

```tsx
// 首屏图像应该设置priority
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} priority />
```

#### 3.2.5 placeholder

```tsx
// 模糊占位符
<Image
  src="/photo.jpg"
  alt="照片"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>;

// 本地图像自动生成模糊占位符
import photo from "./photo.jpg";
<Image src={photo} alt="照片" placeholder="blur" />;
```

---

## 4. 响应式图像 (Responsive Images)

### 4.1 使用 fill 和 sizes

```tsx
// app/components/ResponsiveHero.tsx
import Image from "next/image";

export default function ResponsiveHero() {
  return (
    <div className="relative w-full h-[400px] md:h-[600px]">
      <Image
        src="/hero.jpg"
        alt="Hero"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
    </div>
  );
}
```

### 4.2 多尺寸图像

```tsx
// app/components/ProductImage.tsx
import Image from "next/image";

export default function ProductImage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 移动端全宽,桌面端一半宽 */}
      <div className="relative aspect-square">
        <Image
          src="/product-1.jpg"
          alt="产品1"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover rounded-lg"
        />
      </div>
      <div className="relative aspect-square">
        <Image
          src="/product-2.jpg"
          alt="产品2"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover rounded-lg"
        />
      </div>
    </div>
  );
}
```

### 4.3 艺术指导(Art Direction)

```tsx
// app/components/ArtDirection.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function ArtDirection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative w-full h-96">
      <Image
        src={isMobile ? "/hero-mobile.jpg" : "/hero-desktop.jpg"}
        alt="Hero"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
```

---

## 5. 图像加载策略 (Loading Strategies)

### 5.1 懒加载(默认)

```tsx
// 默认行为,图像进入视口时才加载
<Image src="/lazy.jpg" alt="懒加载图像" width={800} height={600} />
```

### 5.2 优先加载

```tsx
// 首屏关键图像
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} priority />
```

### 5.3 预加载

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero.jpg"
          imageSrcSet="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1200.jpg 1200w"
          imageSizes="100vw"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 6. 占位符策略 (Placeholder Strategies)

### 6.1 模糊占位符

```tsx
// 使用base64编码的模糊图像
<Image
  src="/photo.jpg"
  alt="照片"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

### 6.2 生成模糊占位符

```tsx
// app/utils/getBlurDataURL.ts
import { getPlaiceholder } from "plaiceholder";

export async function getBlurDataURL(src: string) {
  const buffer = await fetch(src).then(async (res) =>
    Buffer.from(await res.arrayBuffer())
  );

  const { base64 } = await getPlaiceholder(buffer);
  return base64;
}

// 使用
import { getBlurDataURL } from "./utils/getBlurDataURL";

export default async function Page() {
  const blurDataURL = await getBlurDataURL("https://example.com/image.jpg");

  return (
    <Image
      src="https://example.com/image.jpg"
      alt="图像"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL={blurDataURL}
    />
  );
}
```

### 6.3 空占位符

```tsx
// 不使用占位符
<Image
  src="/photo.jpg"
  alt="照片"
  width={800}
  height={600}
  placeholder="empty"
/>
```

---

## 7. 图像格式 (Image Formats)

### 7.1 自动格式选择

Next.js 会自动选择最优格式:

| 浏览器支持 | 格式选择 |
| ---------- | -------- |
| 支持 AVIF  | AVIF     |
| 支持 WebP  | WebP     |
| 其他       | 原格式   |

### 7.2 配置图像格式

```js
// next.config.js
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};
```

### 7.3 禁用格式转换

```js
// next.config.js
module.exports = {
  images: {
    formats: [], // 禁用格式转换
  },
};
```

---

## 8. 图像尺寸 (Image Sizes)

### 8.1 设备尺寸

```js
// next.config.js
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};
```

### 8.2 图像尺寸

```js
// next.config.js
module.exports = {
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### 8.3 sizes 属性详解

```tsx
// 复杂的sizes示例
<Image
  src="/responsive.jpg"
  alt="响应式图像"
  fill
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 768px) 80vw,
    (max-width: 1024px) 60vw,
    (max-width: 1280px) 50vw,
    40vw
  "
/>
```

---

## 9. 样式和布局 (Styling and Layout)

### 9.1 使用 className

```tsx
<Image
  src="/photo.jpg"
  alt="照片"
  width={800}
  height={600}
  className="rounded-lg shadow-lg hover:scale-105 transition-transform"
/>
```

### 9.2 使用 style

```tsx
<Image
  src="/photo.jpg"
  alt="照片"
  width={800}
  height={600}
  style={{
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  }}
/>
```

### 9.3 对象适配

```tsx
// 覆盖容器
<div className="relative w-full h-96">
  <Image
    src="/cover.jpg"
    alt="封面"
    fill
    className="object-cover"
  />
</div>

// 包含在容器内
<div className="relative w-full h-96">
  <Image
    src="/contain.jpg"
    alt="包含"
    fill
    className="object-contain"
  />
</div>

// 填充容器(可能变形)
<div className="relative w-full h-96">
  <Image
    src="/fill.jpg"
    alt="填充"
    fill
    className="object-fill"
  />
</div>
```

---

## 10. 加载器 (Loaders)

### 10.1 自定义加载器

```tsx
// app/components/CustomLoader.tsx
import Image from "next/image";

const customLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`;
};

export default function CustomLoaderImage() {
  return (
    <Image
      loader={customLoader}
      src="photo.jpg"
      alt="照片"
      width={800}
      height={600}
    />
  );
}
```

### 10.2 全局加载器

```js
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./app/utils/imageLoader.ts",
  },
};
```

```ts
// app/utils/imageLoader.ts
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`;
}
```

### 10.3 第三方加载器

```js
// next.config.js - 使用Cloudinary
module.exports = {
  images: {
    loader: "cloudinary",
    path: "https://res.cloudinary.com/demo/image/upload/",
  },
};

// 使用Imgix
module.exports = {
  images: {
    loader: "imgix",
    path: "https://example.imgix.net/",
  },
};
```

---

## 11. 性能优化 (Performance Optimization)

### 11.1 优先级设置

```tsx
// 首屏图像
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} priority />

// 非首屏图像(默认懒加载)
<Image src="/content.jpg" alt="内容" width={800} height={600} />
```

### 11.2 质量调整

```tsx
// 高质量(用于重要图像)
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} quality={90} />

// 中等质量(默认)
<Image src="/photo.jpg" alt="照片" width={800} height={600} quality={75} />

// 低质量(用于缩略图)
<Image src="/thumb.jpg" alt="缩略图" width={100} height={100} quality={50} />
```

### 11.3 尺寸优化

```tsx
// 精确指定sizes以生成合适的srcset
<Image
  src="/responsive.jpg"
  alt="响应式"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## 12. 高级用法 (Advanced Usage)

### 12.1 动态图像

```tsx
// app/components/DynamicImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

const images = ["/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg"];

export default function DynamicImage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div>
      <div className="relative w-full h-96">
        <Image
          key={currentIndex}
          src={images[currentIndex]}
          alt={`图片 ${currentIndex + 1}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`px-4 py-2 rounded ${
              index === currentIndex ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 12.2 图像画廊

```tsx
// app/components/ImageGallery.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const images: GalleryImage[] = [
  { src: "/gallery/1.jpg", alt: "图片1", width: 800, height: 600 },
  { src: "/gallery/2.jpg", alt: "图片2", width: 800, height: 600 },
  { src: "/gallery/3.jpg", alt: "图片3", width: 800, height: 600 },
  { src: "/gallery/4.jpg", alt: "图片4", width: 800, height: 600 },
];

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={selectedImage.width}
              height={selectedImage.height}
              className="max-w-full max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### 12.3 背景图像

```tsx
// app/components/BackgroundImage.tsx
import Image from "next/image";

export default function BackgroundImage() {
  return (
    <div className="relative min-h-screen">
      <Image
        src="/background.jpg"
        alt="背景"
        fill
        className="object-cover -z-10"
        quality={90}
        priority
      />
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-white">内容在这里</h1>
      </div>
    </div>
  );
}
```

### 12.4 图像比较

```tsx
// app/components/ImageComparison.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full h-96">
      {/* 前图 */}
      <div className="absolute inset-0">
        <Image src="/before.jpg" alt="之前" fill className="object-cover" />
      </div>

      {/* 后图 */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image src="/after.jpg" alt="之后" fill className="object-cover" />
      </div>

      {/* 滑块 */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute top-1/2 left-0 w-full -translate-y-1/2 z-10"
      />
    </div>
  );
}
```

---

## 13. 错误处理 (Error Handling)

### 13.1 加载失败处理

```tsx
// app/components/ImageWithFallback.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageWithFallback() {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? "/fallback.jpg" : "/photo.jpg"}
      alt="照片"
      width={800}
      height={600}
      onError={() => setError(true)}
    />
  );
}
```

### 13.2 加载状态

```tsx
// app/components/ImageWithLoading.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageWithLoading() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      <Image
        src="/photo.jpg"
        alt="照片"
        width={800}
        height={600}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
```

---

## 14. 适用场景 (Applicable Scenarios)

### 14.1 电商网站

**产品图像**: 使用高质量图像展示产品细节。

```tsx
<Image
  src="/product.jpg"
  alt="产品名称"
  width={800}
  height={800}
  quality={90}
  placeholder="blur"
/>
```

**缩略图**: 使用低质量图像节省带宽。

```tsx
<Image
  src="/thumbnail.jpg"
  alt="缩略图"
  width={100}
  height={100}
  quality={50}
/>
```

### 14.2 博客网站

**文章封面**: 使用响应式图像适配不同设备。

```tsx
<div className="relative w-full h-96">
  <Image
    src="/cover.jpg"
    alt="文章封面"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
  />
</div>
```

**内容图像**: 使用懒加载优化性能。

```tsx
<Image src="/content.jpg" alt="内容图像" width={800} height={600} />
```

### 14.3 作品集网站

**作品展示**: 使用高质量图像展示作品。

```tsx
<Image
  src="/portfolio.jpg"
  alt="作品"
  width={1200}
  height={800}
  quality={95}
  priority
/>
```

---

## 15. 注意事项 (Precautions)

### 15.1 远程图像配置

必须在 next.config.js 中配置远程图像域名:

```js
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

### 15.2 尺寸要求

远程图像必须指定 width 和 height,或使用 fill:

```tsx
// 正确
<Image src="https://example.com/photo.jpg" alt="照片" width={800} height={600} />

// 正确
<div className="relative w-full h-96">
  <Image src="https://example.com/photo.jpg" alt="照片" fill />
</div>

// 错误
<Image src="https://example.com/photo.jpg" alt="照片" />
```

### 15.3 性能考虑

**优先级**: 只对首屏图像使用 priority。

**质量**: 根据用途选择合适的质量。

**尺寸**: 精确指定 sizes 以生成合适的 srcset。

### 15.4 布局偏移

使用 width 和 height 或 fill 避免布局偏移:

```tsx
// 好的做法
<Image src="/photo.jpg" alt="照片" width={800} height={600} />

// 或
<div className="relative w-full h-96">
  <Image src="/photo.jpg" alt="照片" fill />
</div>
```

---

## 16. 常见问题 (FAQ)

### 16.1 如何优化大量图像?

**问题**: 页面有大量图像,如何优化?

**解决方案**:

1. 使用懒加载(默认行为)
2. 使用低质量缩略图
3. 使用虚拟化(如 react-window)
4. 分页加载

```tsx
// 虚拟化示例
import { FixedSizeGrid } from "react-window";

function ImageGrid() {
  const Cell = ({ columnIndex, rowIndex, style }: any) => (
    <div style={style}>
      <Image
        src={`/images/${rowIndex * 4 + columnIndex}.jpg`}
        alt="图像"
        width={200}
        height={200}
      />
    </div>
  );

  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={200}
      height={600}
      rowCount={100}
      rowHeight={200}
      width={800}
    >
      {Cell}
    </FixedSizeGrid>
  );
}
```

### 16.2 如何处理不同宽高比的图像?

**问题**: 图像宽高比不一致,如何统一显示?

**解决方案**: 使用 fill 和 object-fit。

```tsx
// 统一显示为正方形
<div className="relative aspect-square">
  <Image
    src="/photo.jpg"
    alt="照片"
    fill
    className="object-cover" // 裁剪填充
  />
</div>

// 完整显示,可能有空白
<div className="relative aspect-square">
  <Image
    src="/photo.jpg"
    alt="照片"
    fill
    className="object-contain" // 完整显示
  />
</div>
```

### 16.3 如何实现图像懒加载?

**问题**: 如何实现图像懒加载?

**解决方案**: next/image 默认启用懒加载,无需额外配置。

```tsx
// 默认懒加载
<Image src="/photo.jpg" alt="照片" width={800} height={600} />

// 禁用懒加载(首屏图像)
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} priority />
```

### 16.4 如何使用 CDN?

**问题**: 如何使用 CDN 加速图像加载?

**解决方案**: 配置自定义加载器。

```js
// next.config.js
module.exports = {
  images: {
    loader: "custom",
    loaderFile: "./app/utils/cdnLoader.ts",
  },
};
```

```ts
// app/utils/cdnLoader.ts
export default function cdnLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `https://cdn.example.com/${src}?w=${width}&q=${quality || 75}`;
}
```

### 16.5 如何处理 SVG 图像?

**问题**: 如何使用 next/image 处理 SVG?

**解决方案**: SVG 可以直接使用,但不会被优化。

```tsx
// 方式1: 使用next/image
<Image src="/logo.svg" alt="Logo" width={100} height={100} />

// 方式2: 直接使用img标签
<img src="/logo.svg" alt="Logo" width={100} height={100} />

// 方式3: 内联SVG
import Logo from './logo.svg';
<Logo />
```

### 16.6 如何实现渐进式图像加载?

**问题**: 如何实现渐进式图像加载?

**解决方案**: 使用 placeholder="blur"。

```tsx
// 本地图像自动生成模糊占位符
import photo from './photo.jpg';
<Image src={photo} alt="照片" placeholder="blur" />

// 远程图像需要手动提供blurDataURL
<Image
  src="https://example.com/photo.jpg"
  alt="照片"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## 17. 总结 (Summary)

### 17.1 核心要点

next/image 是 Next.js 提供的强大图像优化组件,它能自动处理图像的格式转换、尺寸调整、懒加载等,大幅提升网站性能。

**自动优化**: 自动将图像转换为现代格式(WebP、AVIF)。

**响应式**: 根据设备尺寸提供合适的图像大小。

**性能**: 默认启用懒加载,优化加载性能。

**用户体验**: 防止布局偏移,提升用户体验。

### 17.2 最佳实践

| 场景     | 建议                |
| -------- | ------------------- |
| 首屏图像 | 使用 priority       |
| 大量图像 | 使用懒加载          |
| 产品图像 | 使用高质量(90+)     |
| 缩略图   | 使用低质量(50)      |
| 响应式   | 精确指定 sizes      |
| 远程图像 | 配置 remotePatterns |
| 占位符   | 使用 blur 占位符    |
| 背景图像 | 使用 fill           |

### 17.3 性能优化检查清单

- [ ] 首屏图像使用 priority
- [ ] 非首屏图像使用懒加载
- [ ] 精确指定 sizes 属性
- [ ] 根据用途选择合适的 quality
- [ ] 使用 blur 占位符
- [ ] 配置远程图像域名
- [ ] 使用现代图像格式(WebP、AVIF)
- [ ] 避免布局偏移
- [ ] 使用 CDN 加速
- [ ] 监控图像性能

### 17.4 常见错误

**错误 1**: 远程图像未配置域名

```tsx
// 错误
<Image
  src="https://example.com/photo.jpg"
  alt="照片"
  width={800}
  height={600}
/>;

// 正确: 先在next.config.js中配置
module.exports = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  },
};
```

**错误 2**: 远程图像未指定尺寸

```tsx
// 错误
<Image src="https://example.com/photo.jpg" alt="照片" />

// 正确
<Image src="https://example.com/photo.jpg" alt="照片" width={800} height={600} />
```

**错误 3**: 所有图像都使用 priority

```tsx
// 错误: 所有图像都使用priority
<Image src="/photo1.jpg" alt="照片1" width={800} height={600} priority />
<Image src="/photo2.jpg" alt="照片2" width={800} height={600} priority />
<Image src="/photo3.jpg" alt="照片3" width={800} height={600} priority />

// 正确: 只对首屏关键图像使用priority
<Image src="/hero.jpg" alt="Hero" width={1200} height={800} priority />
<Image src="/photo1.jpg" alt="照片1" width={800} height={600} />
<Image src="/photo2.jpg" alt="照片2" width={800} height={600} />
```

### 17.5 属性对照表

| 属性        | 类型     | 必需 | 默认值 | 说明            |
| ----------- | -------- | ---- | ------ | --------------- |
| src         | string   | 是   | -      | 图像源          |
| alt         | string   | 是   | -      | 替代文本        |
| width       | number   | 条件 | -      | 图像宽度        |
| height      | number   | 条件 | -      | 图像高度        |
| fill        | boolean  | 否   | false  | 填充父容器      |
| sizes       | string   | 否   | 100vw  | 响应式尺寸      |
| quality     | number   | 否   | 75     | 图像质量(1-100) |
| priority    | boolean  | 否   | false  | 优先加载        |
| placeholder | string   | 否   | empty  | 占位符类型      |
| blurDataURL | string   | 否   | -      | 模糊占位符数据  |
| loader      | function | 否   | -      | 自定义加载器    |
| onLoad      | function | 否   | -      | 加载完成回调    |
| onError     | function | 否   | -      | 加载失败回调    |

### 17.6 格式对照表

| 格式 | 优点            | 缺点               | 适用场景       |
| ---- | --------------- | ------------------ | -------------- |
| AVIF | 体积最小,质量高 | 浏览器支持有限     | 现代浏览器     |
| WebP | 体积小,质量好   | 部分旧浏览器不支持 | 大部分场景     |
| JPEG | 兼容性好        | 体积较大           | 照片           |
| PNG  | 支持透明        | 体积大             | 图标、透明图像 |
| SVG  | 矢量,无损缩放   | 不适合复杂图像     | 图标、Logo     |

next/image 是 Next.js 中处理图像的首选方案。通过合理使用其提供的各种特性,我们可以大幅提升网站的性能和用户体验。记住,图像优化不是一次性的工作,需要根据实际情况持续调整和优化。始终以用户体验为中心,用数据驱动优化决策,才能打造真正高性能的网站。

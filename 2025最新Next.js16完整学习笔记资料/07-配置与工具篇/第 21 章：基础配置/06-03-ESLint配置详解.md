**文档声明**
本资料由「高品质IT资源 / xy769003723321/小苏IT资源铺」独家提供，禁止盗版、转售。

# ESLint 配置详解

## 概述

ESLint 是 JavaScript 和 TypeScript 项目中最流行的代码检查工具。Next.js 16 内置了 ESLint 支持，提供了开箱即用的配置，帮助你在开发过程中发现和修复代码问题。

Next.js 的 ESLint 配置包含了针对 React、React Hooks 和 Next.js 特定功能的规则，可以帮助你避免常见错误，保持代码风格一致。

### ESLint 在 Next.js 中的作用

1. **代码质量**：发现潜在的 bug 和问题
2. **代码风格**：统一团队的代码风格
3. **最佳实践**：强制使用 React 和 Next.js 的最佳实践
4. **自动修复**：自动修复部分问题
5. **IDE 集成**：实时显示错误和警告

## 基础配置

### 初始化 ESLint

创建新项目时，Next.js 会自动配置 ESLint：

```bash
npx create-next-app@latest my-app
```

在现有项目中添加 ESLint：

```bash
# 安装依赖
npm install --save-dev eslint eslint-config-next

# 创建配置文件
npx next lint
```

### Next.js 默认的 ESLint 配置

Next.js 会生成 `.eslintrc.json` 文件：

```json
{
  "extends": "next/core-web-vitals"
}
```

这个配置包含了：

- `eslint:recommended`：ESLint 推荐规则
- `plugin:react/recommended`：React 推荐规则
- `plugin:react-hooks/recommended`：React Hooks 规则
- `plugin:@next/next/recommended`：Next.js 特定规则
- `plugin:@next/next/core-web-vitals`：Core Web Vitals 规则

### 配置文件格式

ESLint 支持多种配置文件格式：

```javascript
// .eslintrc.js (推荐)
module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // 自定义规则
  },
}

// .eslintrc.json
{
  "extends": "next/core-web-vitals",
  "rules": {}
}

// .eslintrc.yml
extends: next/core-web-vitals
rules: {}

// package.json
{
  "eslintConfig": {
    "extends": "next/core-web-vitals"
  }
}
```

推荐使用 `.eslintrc.js`，因为它支持注释和动态配置。

### 核心配置选项

#### extends

继承其他配置：

```javascript
module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
};
```

可用的 Next.js 配置：

- `next`：基础配置
- `next/core-web-vitals`：包含 Core Web Vitals 规则（推荐）
- `next/typescript`：TypeScript 项目配置

#### rules

自定义规则：

```javascript
module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // 关闭规则
    "react/no-unescaped-entities": "off",

    // 警告
    "no-console": "warn",

    // 错误
    "no-unused-vars": "error",

    // 带选项的规则
    quotes: ["error", "single"],
    indent: ["error", 2],
  },
};
```

规则级别：

- `'off'` 或 `0`：关闭规则
- `'warn'` 或 `1`：警告（不会导致构建失败）
- `'error'` 或 `2`：错误（会导致构建失败）

#### env

指定代码运行环境：

```javascript
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
};
```

#### globals

定义全局变量：

```javascript
module.exports = {
  globals: {
    React: "readonly",
    JSX: "readonly",
  },
};
```

#### parser 和 parserOptions

配置解析器：

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
};
```

#### plugins

添加插件：

```javascript
module.exports = {
  plugins: ["@typescript-eslint", "react", "react-hooks"],
};
```

#### settings

配置插件设置：

```javascript
module.exports = {
  settings: {
    react: {
      version: "detect",
    },
  },
};
```

## 高级配置

### TypeScript 项目配置

完整的 TypeScript + Next.js ESLint 配置：

```javascript
module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
  },
};
```

### 严格模式配置

适合追求高质量代码的项目：

```javascript
module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
  ],
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",

    // React
    "react/jsx-no-target-blank": "error",
    "react/no-array-index-key": "warn",
    "react/no-danger": "warn",
    "react/self-closing-comp": "error",

    // React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // 通用
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-alert": "error",
    "prefer-const": "error",
    "no-var": "error",
  },
};
```

### 多环境配置

针对不同文件使用不同规则：

```javascript
module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    "no-console": "warn",
  },
  overrides: [
    // TypeScript 文件
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/no-unused-vars": "error",
      },
    },
    // 测试文件
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      env: {
        jest: true,
      },
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    // 配置文件
    {
      files: ["*.config.js", "*.config.ts"],
      env: {
        node: true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    // API 路由
    {
      files: ["app/api/**/*.ts", "pages/api/**/*.ts"],
      rules: {
        "no-console": "off",
      },
    },
  ],
};
```

### 忽略文件配置

创建 `.eslintignore` 文件：

```
# 依赖
node_modules/
.pnp/
.pnp.js

# 构建输出
.next/
out/
build/
dist/

# 测试
coverage/

# 其他
.env*.local
.vercel
*.log
```

也可以在配置文件中忽略：

```javascript
module.exports = {
  extends: "next/core-web-vitals",
  ignorePatterns: ["node_modules/", ".next/", "out/", "public/", "*.config.js"],
};
```

### 自定义规则集

创建可复用的规则集：

```javascript
// eslint-rules/react-rules.js
module.exports = {
  rules: {
    "react/jsx-no-target-blank": "error",
    "react/no-array-index-key": "warn",
    "react/self-closing-comp": "error",
    "react/jsx-curly-brace-presence": [
      "error",
      { props: "never", children: "never" },
    ],
  },
};

// .eslintrc.js
module.exports = {
  extends: ["next/core-web-vitals", "./eslint-rules/react-rules.js"],
};
```

## 实战案例

### 案例 1：企业级配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "import"],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],

    // Import
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-duplicates": "error",
    "import/no-unresolved": "error",

    // React
    "react/jsx-no-target-blank": "error",
    "react/self-closing-comp": "error",

    // 通用
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "error",
  },
};
```

### 案例 2：Monorepo 配置

根目录 `.eslintrc.js`：

```javascript
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  ignorePatterns: ["apps/**", "packages/**"],
};
```

应用 `apps/web/.eslintrc.js`：

```javascript
module.exports = {
  extends: ["../../.eslintrc.js", "next/core-web-vitals"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
```

共享包 `packages/ui/.eslintrc.js`：

```javascript
module.exports = {
  extends: ["../../.eslintrc.js"],
  env: {
    browser: true,
  },
};
```

## 适用场景

| 配置类型             | 适用场景   | 严格程度 |
| -------------------- | ---------- | -------- |
| next/core-web-vitals | 所有项目   | 中等     |
| 严格模式             | 企业级项目 | 高       |
| 宽松模式             | 快速原型   | 低       |
| TypeScript 严格      | TS 项目    | 高       |

## 注意事项

### 性能优化

1. 使用 `.eslintignore` 忽略不需要检查的文件
2. 在 CI/CD 中使用缓存
3. 只检查变更的文件

### 与 Prettier 集成

```bash
npm install --save-dev eslint-config-prettier
```

```javascript
module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
};
```

## 常见问题

### 1. 如何禁用特定规则？

```javascript
// 文件级别
/* eslint-disable no-console */
console.log("test");

// 行级别
console.log("test"); // eslint-disable-line no-console

// 下一行
// eslint-disable-next-line no-console
console.log("test");
```

### 2. 如何自动修复问题？

```bash
npm run lint -- --fix
```

### 3. 如何在构建时忽略 ESLint 错误？

```javascript
// next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};
```

### 4. 如何配置 import 排序？

```javascript
module.exports = {
  plugins: ["import"],
  rules: {
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
  },
};
```

### 5. 如何处理未使用的变量？

```javascript
module.exports = {
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
};
```

### 6. 如何配置 React Hooks 规则？

```javascript
module.exports = {
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};
```

### 7. 如何在 VSCode 中集成 ESLint？

安装 ESLint 扩展，然后在 `.vscode/settings.json` 中配置：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### 8. 如何配置 Next.js 特定规则？

```javascript
module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-img-element": "error",
    "@next/next/no-sync-scripts": "error",
  },
};
```

### 9. 如何处理动态导入？

```javascript
module.exports = {
  rules: {
    "import/no-dynamic-require": "off",
  },
};
```

### 10. 如何配置多个项目？

使用 `overrides`：

```javascript
module.exports = {
  overrides: [
    {
      files: ["apps/web/**"],
      extends: ["next/core-web-vitals"],
    },
    {
      files: ["packages/**"],
      extends: ["eslint:recommended"],
    },
  ],
};
```

## 总结

ESLint 是保证代码质量的重要工具。合理配置 ESLint 可以：

1. 提前发现潜在问题
2. 统一团队代码风格
3. 强制最佳实践
4. 提高代码可维护性

关键要点：

- 使用 Next.js 推荐配置作为基础
- 根据项目需求调整规则
- 与 TypeScript 和 Prettier 集成
- 在 CI/CD 中集成检查
- 使用 IDE 集成实时反馈

记住：ESLint 配置应该服务于团队，而不是束缚开发。找到适合自己团队的平衡点，逐步完善配置。

### 11. 如何配置 accessibility 规则？

```javascript
module.exports = {
  extends: ["next/core-web-vitals", "plugin:jsx-a11y/recommended"],
  plugins: ["jsx-a11y"],
  rules: {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
  },
};
```

### 12. 如何配置性能相关规则？

```javascript
module.exports = {
  rules: {
    "react/jsx-no-bind": "warn",
    "react/no-array-index-key": "warn",
    "react/jsx-no-constructed-context-values": "warn",
  },
};
```

### 13. 如何处理 console.log？

```javascript
module.exports = {
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
  },
};
```

### 14. 如何配置命名规范？

```javascript
module.exports = {
  rules: {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
      },
      {
        selector: "function",
        format: ["camelCase", "PascalCase"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
    ],
  },
};
```

### 15. 如何配置文件命名规则？

```javascript
module.exports = {
  plugins: ["filename-rules"],
  rules: {
    "filename-rules/match": [
      "error",
      {
        ".tsx": "PascalCase",
        ".ts": "camelCase",
      },
    ],
  },
};
```

### 16. 如何配置注释规则？

```javascript
module.exports = {
  rules: {
    "spaced-comment": ["error", "always"],
    "multiline-comment-style": ["error", "starred-block"],
  },
};
```

### 17. 如何配置代码复杂度？

```javascript
module.exports = {
  rules: {
    complexity: ["warn", 10],
    "max-depth": ["warn", 4],
    "max-lines": ["warn", 300],
    "max-lines-per-function": ["warn", 50],
  },
};
```

### 18. 如何配置安全规则？

```javascript
module.exports = {
  plugins: ["security"],
  extends: ["plugin:security/recommended"],
  rules: {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
  },
};
```

### 19. 如何配置测试文件规则？

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: {
        "jest/expect-expect": "error",
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
      },
    },
  ],
};
```

### 20. 如何配置 Git hooks？

安装 husky 和 lint-staged：

```bash
npm install --save-dev husky lint-staged
npx husky install
```

配置 `.husky/pre-commit`：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

配置 `package.json`：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 21. 如何配置 CI/CD 检查？

GitHub Actions 配置：

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run lint
```

### 22. 如何处理第三方库的类型错误？

```javascript
module.exports = {
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-ignore": "allow-with-description",
      },
    ],
  },
};
```

### 23. 如何配置代码格式化？

```javascript
module.exports = {
  rules: {
    indent: ["error", 2],
    quotes: ["error", "single"],
    semi: ["error", "never"],
    "comma-dangle": ["error", "always-multiline"],
  },
};
```

### 24. 如何配置导入路径？

```javascript
module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["../*"],
        paths: [
          {
            name: "react",
            importNames: ["default"],
            message: "Import React is not needed in Next.js",
          },
        ],
      },
    ],
  },
};
```

### 25. 如何配置 JSX 规则？

```javascript
module.exports = {
  rules: {
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/jsx-boolean-value": ["error", "never"],
    "react/jsx-fragments": ["error", "syntax"],
    "react/jsx-no-useless-fragment": "error",
  },
};
```

### 26. 如何配置 Props 验证？

```javascript
module.exports = {
  rules: {
    "react/prop-types": "off", // TypeScript项目不需要
    "react/require-default-props": "off",
  },
};
```

### 27. 如何配置状态更新规则？

```javascript
module.exports = {
  rules: {
    "react/no-direct-mutation-state": "error",
    "react/no-access-state-in-setstate": "error",
  },
};
```

### 28. 如何配置异步规则？

```javascript
module.exports = {
  rules: {
    "no-async-promise-executor": "error",
    "require-await": "warn",
    "no-return-await": "error",
  },
};
```

### 29. 如何配置错误处理？

```javascript
module.exports = {
  rules: {
    "no-throw-literal": "error",
    "prefer-promise-reject-errors": "error",
  },
};
```

### 30. 如何配置代码风格一致性？

```javascript
module.exports = {
  rules: {
    "arrow-body-style": ["error", "as-needed"],
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "object-shorthand": "error",
  },
};
```

### 31. 如何配置 Monorepo 中的共享规则？

```javascript
// packages/eslint-config/index.js
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "no-console": "warn",
  },
};

// apps/web/.eslintrc.js
module.exports = {
  extends: ["@company/eslint-config"],
};
```

### 32. 如何配置自定义插件？

```javascript
// eslint-plugin-custom/index.js
module.exports = {
  rules: {
    "no-foo": {
      create(context) {
        return {
          Identifier(node) {
            if (node.name === "foo") {
              context.report({
                node,
                message: 'Unexpected identifier "foo"',
              });
            }
          },
        };
      },
    },
  },
};

// .eslintrc.js
module.exports = {
  plugins: ["custom"],
  rules: {
    "custom/no-foo": "error",
  },
};
```

### 33. 如何配置代码审查规则？

```javascript
module.exports = {
  rules: {
    "no-warning-comments": [
      "warn",
      {
        terms: ["TODO", "FIXME", "HACK"],
        location: "start",
      },
    ],
  },
};
```

### 34. 如何配置文档注释？

```javascript
module.exports = {
  plugins: ["jsdoc"],
  extends: ["plugin:jsdoc/recommended"],
  rules: {
    "jsdoc/require-description": "warn",
    "jsdoc/require-param-description": "warn",
    "jsdoc/require-returns-description": "warn",
  },
};
```

### 35. 如何配置代码度量？

```javascript
module.exports = {
  rules: {
    "max-params": ["warn", 3],
    "max-statements": ["warn", 10],
    "max-nested-callbacks": ["warn", 3],
  },
};
```

### 36. 如何配置依赖检查？

```javascript
module.exports = {
  plugins: ["import"],
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.test.ts", "**/*.config.ts"],
      },
    ],
    "import/no-cycle": "error",
  },
};
```

### 37. 如何配置 React 18 特性？

```javascript
module.exports = {
  rules: {
    "react/no-unstable-nested-components": "error",
    "react/jsx-no-leaked-render": "warn",
  },
};
```

### 38. 如何配置 Server Components 规则？

```javascript
module.exports = {
  overrides: [
    {
      files: ["app/**/*.tsx"],
      rules: {
        "react-hooks/rules-of-hooks": "off", // Server Components不使用hooks
      },
    },
  ],
};
```

### 39. 如何配置环境变量检查？

```javascript
module.exports = {
  rules: {
    "no-process-env": "error", // 强制使用配置文件
  },
};
```

### 40. 如何配置代码分割规则？

```javascript
module.exports = {
  rules: {
    "import/dynamic-import-chunkname": [
      "error",
      {
        webpackChunknameFormat: "[a-zA-Z0-9-]+",
      },
    ],
  },
};
```

### 41. 如何配置国际化规则？

```javascript
module.exports = {
  plugins: ["i18n"],
  rules: {
    "i18n/no-chinese-character": "warn",
  },
};
```

### 42. 如何配置 SEO 相关规则？

```javascript
module.exports = {
  rules: {
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-img-element": "error",
    "@next/next/no-head-element": "error",
  },
};
```

### 43. 如何配置性能预算？

```javascript
module.exports = {
  rules: {
    "max-lines": ["warn", { max: 300, skipBlankLines: true }],
    "max-lines-per-function": ["warn", { max: 50 }],
  },
};
```

### 44. 如何配置代码覆盖率规则？

```javascript
module.exports = {
  overrides: [
    {
      files: ["**/*.test.ts"],
      rules: {
        "jest/expect-expect": "error",
        "jest/no-conditional-expect": "error",
      },
    },
  ],
};
```

### 45. 如何配置代码重复检查？

```javascript
module.exports = {
  plugins: ["sonarjs"],
  extends: ["plugin:sonarjs/recommended"],
  rules: {
    "sonarjs/no-duplicate-string": "warn",
    "sonarjs/cognitive-complexity": ["warn", 15],
  },
};
```

### 46. 如何配置代码可读性？

```javascript
module.exports = {
  rules: {
    "max-len": ["warn", { code: 100, ignoreUrls: true }],
    "no-nested-ternary": "warn",
    "no-unneeded-ternary": "error",
  },
};
```

### 47. 如何配置 TypeScript 严格检查？

```javascript
module.exports = {
  rules: {
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/prefer-readonly": "error",
  },
};
```

### 48. 如何配置 React 性能优化？

```javascript
module.exports = {
  rules: {
    "react/jsx-no-bind": ["warn", { allowArrowFunctions: true }],
    "react/jsx-no-constructed-context-values": "warn",
    "react/no-unstable-nested-components": "error",
  },
};
```

### 49. 如何配置代码审计？

```javascript
module.exports = {
  plugins: ["security", "no-secrets"],
  extends: ["plugin:security/recommended"],
  rules: {
    "no-secrets/no-secrets": "error",
    "security/detect-unsafe-regex": "error",
  },
};
```

### 50. 如何配置团队协作规则？

```javascript
module.exports = {
  rules: {
    "no-warning-comments": ["warn", { terms: ["TODO", "FIXME"] }],
    "spaced-comment": ["error", "always", { markers: ["/"] }],
  },
};
```

## 完整企业级配置示例

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "import", "jsx-a11y", "security", "sonarjs"],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",

    // Import
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-duplicates": "error",
    "import/no-cycle": "error",

    // React
    "react/jsx-no-target-blank": "error",
    "react/self-closing-comp": "error",
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/no-array-index-key": "warn",

    // React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Next.js
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-img-element": "error",

    // 通用
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",

    // 代码质量
    complexity: ["warn", 10],
    "max-depth": ["warn", 4],
    "max-lines-per-function": ["warn", 50],
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      env: {
        jest: true,
      },
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
```

## 最佳实践总结

1. **从推荐配置开始**：使用 `next/core-web-vitals` 作为基础
2. **逐步加严**：不要一开始就使用最严格的配置
3. **团队共识**：规则应该得到团队认可
4. **自动化**：集成到 Git hooks 和 CI/CD
5. **持续优化**：根据实际情况调整规则
6. **文档化**：记录自定义规则的原因
7. **性能考虑**：避免过度检查影响开发体验
8. **工具集成**：配置 IDE 实时反馈

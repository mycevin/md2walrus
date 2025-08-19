# Walrus 客户端初始化问题修复

## 问题描述

Walrus 客户端初始化失败，出现以下错误：
```
TypeError: Cannot read properties of undefined (reading 'scope')
```

错误发生在 `walrusClient.ts` 的第20行和第107行。

## 根本原因

问题的根本原因是版本不匹配：

1. **`@mysten/walrus@0.6.3`** 依赖 **`@mysten/sui@1.37.3`**
2. **项目代码** 使用的是 **`@mysten/sui.js@0.54.1`**

`@mysten/walrus` 期望 SuiClient 有 `cache` 属性和 `scope` 方法，但 `@mysten/sui.js@0.54.1` 的 SuiClient 没有这些属性。

## 解决方案

### 1. 安装正确的依赖

添加 `@mysten/sui@1.37.3` 作为直接依赖：

```bash
pnpm add @mysten/sui@1.37.3
```

### 2. 更新导入语句

将 `walrusClient.ts` 中的导入从：
```typescript
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
```

改为：
```typescript
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
```

### 3. 更新 Vite 配置

在 `vite.config.ts` 中添加 WASM 支持：

```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@mysten/walrus", "@mysten/walrus-wasm"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          walrus: ["@mysten/walrus"],
          sui: ["@mysten/sui.js"],
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  assetsInclude: ["**/*.wasm"],
});
```

### 4. 修复 WASM 文件加载问题

添加了 `getWasmUrl` 函数来正确指定 WASM 文件的 URL：

```typescript
// 获取 WASM 文件的正确 URL
const getWasmUrl = () => {
  // 在开发环境中，使用相对路径
  if (import.meta.env.DEV) {
    return "/node_modules/.pnpm/@mysten+walrus-wasm@0.1.1/node_modules/@mysten/walrus-wasm/web/walrus_wasm_bg.wasm";
  }
  // 在生产环境中，使用 CDN 或打包后的路径
  return "https://unpkg.com/@mysten/walrus-wasm@0.1.1/web/walrus_wasm_bg.wasm";
};
```

并在 WalrusClient 初始化时使用：

```typescript
return new WalrusClient({
  network,
  suiClient: suiClient as never,
  wasmUrl: getWasmUrl(),
});
```

### 5. 改进错误处理

在 `walrusClient.ts` 中添加了更好的错误处理和 WASM 初始化检查：

- 添加了 WASM 支持检查
- 添加了重试机制
- 添加了更详细的错误信息
- 添加了测试函数

## 验证修复

1. **自动测试**：应用加载时会自动测试 Walrus 客户端初始化
2. **手动测试**：点击"测试 Walrus 客户端"按钮
3. **控制台日志**：查看浏览器控制台的详细日志
4. **WASM 文件访问**：确认 WASM 文件能够正确加载

## 注意事项

- `@mysten/sui.js` 已被重命名为 `@mysten/sui`，建议逐步迁移
- 确保 WASM 模块能够正确加载
- 注意浏览器对 SharedArrayBuffer 的支持
- 移除了 `base: "/md2walrus/"` 配置以避免 WASM 文件路径问题

## 相关文件

- `src/utils/walrusClient.ts` - 主要的修复文件
- `vite.config.ts` - Vite 配置更新
- `package.json` - 依赖更新
- `src/App.tsx` - 添加了测试功能

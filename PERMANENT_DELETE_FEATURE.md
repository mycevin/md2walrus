# 链上永久删除功能

## 功能概述

为 md2walrus 应用添加了 markdown blob 对象的链上永久删除功能。用户可以通过直观的界面安全地从区块链上永久删除不需要的文档。

## 主要特性

### 1. 真正的链上删除
- 使用 Walrus SDK 的 `deleteBlob` 方法
- 通过区块链交易永久删除 blob 对象
- 需要用户钱包签名确认
- 支付少量 gas 费用

### 2. 自定义删除确认对话框
- 替换了原生的 `window.confirm()` 对话框
- 提供更友好的用户界面和更详细的信息展示
- 包含警告提示，明确告知用户操作不可撤销
- 显示删除进度和错误信息

### 3. 详细的文档信息展示
删除确认对话框显示：
- 文件名
- 文件大小
- 创建时间
- 所有者地址
- 明确的警告信息

### 4. 视觉设计优化
- 删除按钮使用红色主题，更加醒目
- 悬停效果增强用户体验
- 响应式设计，支持移动端
- 删除过程中的加载动画

### 5. 安全的删除流程
- 双重确认机制
- 检查 blob 是否可删除
- 从链上和本地存储同时删除
- 操作日志记录和交易哈希显示

## 技术实现

### 组件结构
```
src/components/
├── BlobList.tsx              # 主列表组件
├── DeleteConfirmation.tsx    # 删除确认对话框
├── DeleteConfirmation.css    # 删除确认样式
└── BlobList.css             # 列表样式（已更新）
```

### 状态管理
```typescript
const [deleteConfirmation, setDeleteConfirmation] = useState<{
  isOpen: boolean;
  blob: BlobItem | null;
}>({
  isOpen: false,
  blob: null,
});
```

### 主要函数
- `showDeleteConfirmation(blob: BlobItem)` - 显示删除确认对话框
- `hideDeleteConfirmation()` - 隐藏删除确认对话框
- `confirmDelete()` - 执行链上删除操作
- `deleteBlobFromChain()` - 调用 Walrus SDK 删除 blob
- `checkBlobDeletable()` - 检查 blob 是否可删除

### 钱包集成
- 使用 `@mysten/dapp-kit` 的 `useSignAndExecuteTransaction` hook
- 自动获取当前连接的钱包账户
- 通过 `signAndExecuteTransaction` 执行删除交易

### 存储配置
- 使用 `config.ts` 中的 `defaultSaveEpoch` 作为默认存储时间
- 当前默认存储时间为 1 个 epoch
- 存储时间影响 WAL 租金和删除后的数据保留时间

## 使用方法

1. 在文档列表中，点击任意文档的删除按钮（红色垃圾桶图标）
2. 系统会显示删除确认对话框，展示文档详细信息
3. 仔细阅读警告信息，确认要删除的文档
4. 点击"永久删除"按钮，钱包会弹出签名确认
5. 确认签名后，系统会执行链上删除交易
6. 删除成功后，文档将从列表中消失

## 安全考虑

- 删除操作不可撤销，用户需要明确确认
- 提供详细的文档信息，避免误删
- 使用醒目的视觉设计提醒用户操作的危险性
- 在控制台记录删除操作和交易哈希，便于调试
- 检查 blob 的可删除性，确保用户有删除权限
- 需要钱包签名确认，防止误操作

## 未来改进

- 可以考虑添加批量删除功能
- 实现删除操作的撤销机制（需要额外的存储空间）
- 添加删除操作的网络同步（如果支持链上删除）
- 增加删除操作的统计和报告功能
- 支持删除操作的 gas 费用估算
- 添加删除操作的进度显示

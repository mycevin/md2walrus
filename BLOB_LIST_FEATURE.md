# Blob 列表功能文档

## 🌊 功能概述

MD2Walrus 现在支持查看和管理已保存的文档列表。这个功能允许用户查看所有已保存到 Walrus 网络的文档，并提供便捷的访问和管理功能。

## ✨ 主要特性

### 📋 文档列表管理
- **本地存储**: 自动保存已上传文档的元数据到本地存储
- **实时更新**: 保存新文档后自动更新列表
- **持久化**: 文档信息在浏览器中持久保存

### 🔍 文档信息显示
- **文件名**: 显示文档的原始文件名
- **Blob ID**: 显示完整的 Blob ID（可复制）
- **文件大小**: 显示文档的字节大小
- **创建时间**: 显示文档的创建时间
- **所有者**: 显示文档的所有者地址

### 🛠️ 操作功能
- **复制 Blob ID**: 一键复制 Blob ID 到剪贴板
- **在 Walruscan 中查看**: 直接跳转到 Walruscan 浏览器查看详情
- **下载文档**: 下载原始 Markdown 文件
- **文档预览**: 在列表中直接预览文档内容
- **删除文档**: 从本地列表中删除文档记录

## 🎯 使用方法

### 1. 打开文档列表
- 点击顶部导航栏中的文件夹图标 📁
- 或使用快捷键（如果配置了的话）

### 2. 查看文档
- 列表按创建时间倒序排列
- 点击"显示预览"可以查看文档内容
- 点击"隐藏预览"可以收起预览

### 3. 管理文档
- **复制 ID**: 点击复制图标复制 Blob ID
- **查看详情**: 点击外部链接图标在 Walruscan 中查看
- **下载**: 点击下载图标下载文档
- **删除**: 点击删除图标从列表中删除（仅删除本地记录）

## 🛠️ 技术实现

### 核心组件

#### 1. BlobList 组件 (`src/components/BlobList.tsx`)
```typescript
interface BlobListProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount?: string;
}
```

#### 2. 本地存储服务 (`src/utils/blobStorage.ts`)
```typescript
export interface BlobStorageService {
  saveBlob: (blob: BlobItem) => void;
  getBlobs: () => BlobItem[];
  getBlobById: (blobId: string) => BlobItem | null;
  deleteBlob: (blobId: string) => void;
  clearAll: () => void;
}
```

#### 3. 数据模型
```typescript
export interface BlobItem {
  blobId: string;
  filename: string;
  size: number;
  createdAt: string;
  owner: string;
  content?: string;
}
```

### 存储机制

#### 本地存储
- 使用 `localStorage` 存储文档元数据
- 键名: `md2walrus_blobs`
- 数据格式: JSON 数组

#### 自动保存
- 保存到 Walrus 成功后自动保存到本地
- 包含完整的文档内容和元数据
- 支持更新现有记录

### 集成点

#### 1. 导航栏集成
- 在 Navbar 组件中添加文件夹图标按钮
- 点击打开 BlobList 模态框

#### 2. 保存流程集成
- 在 `useWalrusSave` hook 中集成本地存储
- 保存成功后自动创建 BlobItem 并存储

#### 3. 应用集成
- 在 App.tsx 中管理 BlobList 的显示状态
- 传递当前账户信息用于过滤

## 🎨 用户界面

### 模态框设计
- **响应式布局**: 适配不同屏幕尺寸
- **现代化设计**: 使用渐变背景和阴影效果
- **加载状态**: 显示加载动画和进度
- **错误处理**: 友好的错误提示和重试机制

### 文档卡片
- **清晰的信息层次**: 标题、详情、操作按钮分层显示
- **悬停效果**: 鼠标悬停时的视觉反馈
- **操作按钮**: 图标化的操作按钮，带有工具提示

### 预览功能
- **可折叠预览**: 点击展开/收起文档内容
- **代码高亮**: 使用等宽字体显示 Markdown 内容
- **滚动支持**: 长文档支持滚动查看

## 🔗 外部链接

### Walruscan 集成
- **主网浏览器**: https://walruscan.com/mainnet
- **文档详情页**: https://walruscan.com/mainnet/blob/{blobId}
- **测试网浏览器**: https://walruscan.com/testnet

### 链接格式
```typescript
const getWalruscanUrl = (blobId: string, network: 'mainnet' | 'testnet' = 'mainnet'): string => {
  return `https://walruscan.com/${network}/blob/${blobId}`;
};
```

## 🚀 未来扩展

### 计划功能
- **搜索和过滤**: 按文件名、创建时间等条件搜索
- **批量操作**: 批量下载、删除等操作
- **同步功能**: 与 Walrus 网络同步文档状态
- **导入功能**: 从其他来源导入文档记录

### 技术改进
- **离线支持**: 改进离线状态下的功能
- **性能优化**: 大量文档时的性能优化
- **数据迁移**: 版本升级时的数据迁移支持

## 📝 使用示例

### 保存文档后查看列表
1. 编辑 Markdown 文档
2. 点击保存按钮或使用 Ctrl+S
3. 等待保存完成
4. 点击顶部导航栏中的文件夹图标
5. 在列表中查看刚保存的文档

### 管理现有文档
1. 打开文档列表
2. 找到要管理的文档
3. 使用相应的操作按钮：
   - 复制 Blob ID 用于分享
   - 在 Walruscan 中查看详细信息
   - 下载文档到本地
   - 删除本地记录（不影响链上数据）

## 🔧 配置选项

### 存储配置
- **存储键名**: 可通过修改 `STORAGE_KEY` 常量自定义
- **数据格式**: 支持自定义 BlobItem 结构
- **清理策略**: 可配置自动清理过期数据

### 显示配置
- **排序方式**: 支持按时间、大小、名称排序
- **分页设置**: 可配置每页显示的文档数量
- **预览设置**: 可配置预览的最大高度和样式

这个功能为用户提供了完整的文档管理体验，让用户可以方便地查看、管理和访问已保存到 Walrus 网络的文档。

# 链上 Blob 查询功能

## 🌊 功能概述

MD2Walrus 现在支持直接从 Sui 区块链上查询用户拥有的 Blob 对象，类型为 `0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77::blob::Blob`。

## ✨ 主要特性

### 🔗 链上数据查询
- **实时查询**: 直接从 Sui 主网查询用户的 Blob 对象
- **类型过滤**: 专门查询 Walrus Blob 类型的对象
- **完整信息**: 获取对象的完整内容和元数据

### 📊 数据合并策略
- **链上优先**: 优先显示链上的真实数据
- **本地缓存**: 将链上数据缓存到本地存储
- **去重处理**: 自动去除重复的 Blob 记录
- **时间排序**: 按创建时间倒序排列

### 🔄 刷新机制
- **手动刷新**: 点击刷新按钮重新查询链上数据
- **加载状态**: 显示查询进度和状态
- **错误处理**: 链上查询失败时回退到本地数据

## 🛠️ 技术实现

### 核心函数

#### 1. 查询用户 Blob 对象
```typescript
export const queryUserBlobs = async (
  ownerAddress: string,
  network: "testnet" | "mainnet" = "mainnet"
): Promise<any[]> => {
  const suiClient = createSuiClient(network);
  
  const objects = await suiClient.getOwnedObjects({
    owner: ownerAddress,
    filter: {
      StructType: "0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77::blob::Blob",
    },
    options: {
      showContent: true,
      showDisplay: true,
      showOwner: true,
    },
  });

  return objects.data || [];
};
```

#### 2. 提取 Blob 信息
```typescript
export const extractBlobInfo = (blobObject: any) => {
  const content = blobObject.data?.content;
  const fields = content.fields || {};
  const display = blobObject.data?.display || {};
  
  return {
    blobId: blobObject.data?.objectId,
    filename: fields.filename || display.name || "unknown.md",
    size: parseInt(fields.size || fields.length || 0),
    createdAt: fields.created_at || fields.createdAt || new Date().toISOString(),
    owner: blobObject.data?.owner?.AddressOwner || "unknown",
    content: fields.content || fields.data || fields.text || "",
    epochs: fields.epochs,
    deletable: fields.deletable,
  };
};
```

### 数据流程

1. **用户打开文档列表**
   - 检查钱包连接状态
   - 显示加载状态

2. **查询链上数据**
   - 调用 `queryUserBlobs` 查询用户的 Blob 对象
   - 使用 `extractBlobInfo` 提取对象信息

3. **数据合并处理**
   - 合并链上数据和本地存储数据
   - 去重处理（基于 blobId）
   - 按时间排序

4. **缓存到本地**
   - 将链上数据保存到 localStorage
   - 用于离线访问和快速加载

5. **错误处理**
   - 链上查询失败时回退到本地数据
   - 显示友好的错误信息

## 🎯 使用方法

### 1. 连接钱包
- 确保钱包已连接到 Sui 主网
- 钱包地址将用于查询 Blob 对象

### 2. 打开文档列表
- 点击顶部导航栏的列表图标
- 系统会自动查询链上数据

### 3. 查看结果
- 显示所有找到的 Blob 对象
- 包含文件名、大小、创建时间等信息
- 支持预览文档内容

### 4. 刷新数据
- 点击刷新按钮重新查询链上数据
- 刷新时会显示加载动画

## 🔍 调试信息

### 控制台日志
系统会在控制台输出详细的调试信息：

```javascript
// 查询开始
console.log("Loading blobs for address:", currentAccount);

// 找到的对象
console.log("Found blob objects:", objects);

// 处理每个对象
console.log("Processing blob object:", blobObject);

// 提取的信息
console.log("Extracted blob info:", result);
```

### 错误处理
- 网络错误：显示"加载 Blob 列表失败，请检查网络连接"
- 钱包未连接：显示"请先连接钱包"
- 无数据：显示空状态页面

## 📊 数据结构

### Blob 对象结构
```typescript
interface BlobItem {
  blobId: string;           // 对象的唯一标识符
  filename: string;         // 文件名
  size: number;            // 文件大小（字节）
  createdAt: string;       // 创建时间
  owner: string;           // 所有者地址
  content?: string;        // 文档内容
  epochs?: number;         // 存储周期
  deletable?: boolean;     // 是否可删除
  rawFields?: any;         // 原始字段数据（调试用）
  rawDisplay?: any;        // 原始显示数据（调试用）
}
```

### 查询参数
```typescript
interface QueryOptions {
  owner: string;           // 所有者地址
  filter: {
    StructType: string;    // 对象类型过滤
  };
  options: {
    showContent: boolean;  // 显示内容
    showDisplay: boolean;  // 显示元数据
    showOwner: boolean;    // 显示所有者信息
  };
}
```

## 🚀 性能优化

### 缓存策略
- **本地缓存**: 链上数据自动缓存到 localStorage
- **增量更新**: 只更新新增或修改的数据
- **快速加载**: 优先显示本地缓存数据

### 查询优化
- **类型过滤**: 只查询 Blob 类型的对象
- **分页支持**: 支持大量数据的分页查询
- **错误重试**: 网络错误时自动重试

## 🔧 配置选项

### 网络配置
- **主网**: `mainnet` - 生产环境
- **测试网**: `testnet` - 开发测试

### 查询配置
- **对象类型**: `0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77::blob::Blob`
- **内容显示**: 启用 `showContent` 获取完整内容
- **元数据显示**: 启用 `showDisplay` 获取显示信息

## 🎨 用户界面

### 加载状态
- **加载动画**: 旋转的刷新图标
- **进度提示**: "正在加载文档列表..."
- **状态反馈**: 实时显示查询状态

### 错误状态
- **错误图标**: 显示错误状态
- **错误信息**: 友好的错误提示
- **重试按钮**: 允许用户重试

### 空状态
- **空图标**: 文件图标
- **提示信息**: "还没有保存的文档"
- **引导文本**: "保存第一个文档后，它将出现在这里"

## 🔮 未来扩展

### 计划功能
- **实时同步**: 监听链上事件，实时更新列表
- **批量操作**: 支持批量下载、删除等操作
- **搜索过滤**: 按文件名、时间等条件搜索
- **分页加载**: 支持大量数据的分页显示

### 技术改进
- **索引优化**: 使用索引提高查询性能
- **缓存策略**: 更智能的缓存更新策略
- **离线支持**: 改进离线状态下的功能

这个功能让用户可以实时查看和管理存储在 Walrus 网络上的所有文档，提供了完整的链上数据访问体验。

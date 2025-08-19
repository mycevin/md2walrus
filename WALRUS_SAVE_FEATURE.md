# Walrus 保存功能文档

## 🌊 功能概述

MD2Walrus 现在支持将 Markdown 文档永久保存到 Walrus 分布式存储网络。这个功能允许用户将文档存储在去中心化的存储系统中，获得唯一的 Blob ID 用于永久访问。

## ✨ 主要特性

### 🔐 钱包集成
- **Sui 钱包连接**: 使用 Sui dApp Kit 进行钱包连接
- **自动网络检测**: 自动检测钱包连接的网络（Testnet/Mainnet）
- **交易签名**: 安全的浏览器钱包签名流程

### 💾 保存流程
- **一键保存**: 点击保存按钮或使用 Ctrl+S 快捷键
- **多阶段处理**: 编码 → 注册 → 上传 → 认证
- **实时状态**: 显示保存进度和当前阶段
- **错误处理**: 完整的错误捕获和用户反馈

### 📊 状态反馈
- **进度条**: 显示保存进度（0-100%）
- **状态图标**: 加载、成功、错误状态的视觉反馈
- **详细信息**: 显示 Blob ID 和相关操作链接
- **自动关闭**: 可手动关闭状态通知

## 🛠️ 技术实现

### 依赖包
```json
{
  "@mysten/walrus": "^0.6.3",
  "@mysten/sui.js": "^0.54.1",
  "@mysten/dapp-kit": "^0.17.4"
}
```

### 核心组件

#### 1. WalrusClient 配置 (`src/utils/walrusClient.ts`)
```typescript
export const createWalrusClient = (network: 'testnet' | 'mainnet' = 'testnet') => {
  const suiClient = new SuiClient({
    url: getFullnodeUrl(network),
  });
  
  return new WalrusClient({
    network,
    suiClient: suiClient as any,
    storageNodeClientOptions: {
      timeout: 60_000,
      onError: (error) => {
        console.warn('Walrus storage node error:', error);
      },
    },
  });
};
```

#### 2. 保存 Hook (`src/hooks/useWalrusSave.ts`)
```typescript
export const useWalrusSave = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const saveToWalrus = useCallback(async (
    content: string,
    filename = 'document.md'
  ): Promise<SaveResult> => {
    // 创建文件流程
    const flow = walrusClient.writeFilesFlow({
      files: [createWalrusFileFromMarkdown(content, filename)],
    });

    // 多阶段保存流程
    await flow.encode();
    await signAndExecuteTransaction({ transaction: flow.register(...) });
    await flow.upload({ digest });
    await signAndExecuteTransaction({ transaction: flow.certify() });
    
    return { success: true, blobId: files[0]?.blobId };
  }, [currentAccount, signAndExecuteTransaction]);
};
```

#### 3. 保存按钮 (`src/components/Toolbar.tsx`)
```typescript
const renderSaveButtonGroup = () => (
  <div className="toolbar-group">
    <button
      className={`toolbar-btn save-btn ${isSaving ? "saving" : ""}`}
      onClick={() => onSave?.()}
      disabled={isSaving || !onSave}
    >
      <Save size={16} className={isSaving ? "saving-icon" : ""} />
      {isSaving && <span className="save-text">Saving...</span>}
    </button>
  </div>
);
```

#### 4. 状态显示 (`src/components/SaveStatus.tsx`)
```typescript
const SaveStatus = ({ saveState, onClose }: SaveStatusProps) => {
  return (
    <div className={`save-status ${getStatusClass()}`}>
      <div className="save-status-content">
        {getIcon()}
        <div className="save-status-text">
          <div className="save-status-message">{getMessage()}</div>
          {/* 进度条 */}
        </div>
        <button onClick={onClose}>×</button>
      </div>
      {/* Blob ID 详情 */}
    </div>
  );
};
```

## 🎯 用户使用流程

### 步骤 1: 连接钱包
1. 点击导航栏的"Connect Sui Wallet"按钮
2. 选择并连接 Sui 钱包（如 Sui Wallet）
3. 确认连接并授权应用访问

### 步骤 2: 编写文档
1. 在编辑器中编写 Markdown 内容
2. 使用实时预览功能查看渲染效果
3. 确保文档内容完整

### 步骤 3: 保存到 Walrus
1. **方法 1**: 点击工具栏的绿色保存按钮
2. **方法 2**: 使用键盘快捷键 `Ctrl+S` (或 `Cmd+S`)
3. 等待钱包弹出交易确认

### 步骤 4: 确认交易
1. **注册交易**: 在钱包中确认注册 blob 的交易
2. **认证交易**: 在钱包中确认认证 blob 的交易
3. 等待交易完成和网络确认

### 步骤 5: 获取结果
1. 查看保存状态通知
2. 复制 Blob ID 用于后续访问
3. 点击"查看详情"在 Walruscan 中查看

## 📋 保存状态说明

### 状态阶段
- **🔄 编码中**: 正在将 Markdown 内容编码为 Walrus 格式
- **📝 注册中**: 正在将 blob 注册到 Sui 链上
- **⬆️ 上传中**: 正在将数据上传到 Walrus 存储节点
- **✅ 认证中**: 正在认证 blob 的可用性
- **🎉 完成**: 保存成功，获得 Blob ID

### 视觉反馈
- **进度条**: 显示当前阶段的完成百分比
- **状态图标**: 旋转加载器、成功勾号、错误感叹号
- **颜色编码**: 蓝色(进行中)、绿色(成功)、红色(错误)

## 💰 费用说明

### Sui Testnet
- **存储期限**: 5 个 epoch（约 30 天）
- **Gas 费用**: 注册和认证交易的 gas 费用
- **存储费用**: 基于文件大小的 SUI token 费用
- **测试环境**: 使用测试网 SUI token，无实际价值

### 费用估算
- **小文件** (< 1KB): 约 0.01 SUI
- **中等文件** (1-10KB): 约 0.05-0.1 SUI  
- **大文件** (10-100KB): 约 0.1-0.5 SUI

## 🔗 相关链接

### 文档和工具
- **Walrus 文档**: https://docs.walrus.space/
- **Walruscan**: https://walruscan.com/testnet/
- **Sui 文档**: https://docs.sui.io/

### 代码实现
- **Walrus SDK**: https://sdk.mystenlabs.com/walrus
- **Sui dApp Kit**: https://sdk.mystenlabs.com/dapp-kit

## 🐛 故障排除

### 常见问题

#### 1. 钱包连接失败
- 确保安装了 Sui 钱包扩展
- 检查钱包是否已解锁
- 尝试刷新页面重新连接

#### 2. 交易失败
- 检查钱包中是否有足够的 SUI token
- 确认网络连接稳定
- 检查钱包是否在正确的网络（Testnet）

#### 3. 上传超时
- 检查网络连接
- 尝试减小文档大小
- 等待网络状况改善后重试

#### 4. Blob ID 无法访问
- 等待几分钟让网络同步
- 检查 Blob ID 是否正确
- 在 Walruscan 中验证状态

### 错误代码
- **Error 1001**: 钱包未连接
- **Error 1002**: 余额不足
- **Error 1003**: 网络超时
- **Error 1004**: 交易被拒绝

## 🔮 未来计划

### 即将推出的功能
- **读取功能**: 通过 Blob ID 读取和显示已保存的文档
- **版本管理**: 支持文档版本历史和回滚
- **批量操作**: 一次保存多个文档
- **自定义存储期限**: 用户可选择存储时长

### 性能优化
- **压缩算法**: 减小文档大小以降低费用
- **缓存机制**: 本地缓存减少重复上传
- **批量上传**: 优化多文件上传流程

这个功能为 MD2Walrus 带来了真正的去中心化存储能力，让用户的 Markdown 文档能够永久保存在区块链网络中！

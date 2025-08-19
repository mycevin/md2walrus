# 网络状态检测调试指南

## 🔍 问题描述

网络状态总是显示 "Sui Devnet"，需要调试和修复网络检测逻辑。

## 🛠️ 修复内容

### 1. 重新排序检测优先级
- **方法1**: 钱包 chains 属性（最可靠）
- **方法2**: 钱包 features 属性（备用）
- **方法3**: SuiClient RPC URL（最后备用）

### 2. 增强调试信息
添加了详细的调试日志来帮助诊断问题：

```javascript
// 钱包基本信息
console.log("Current wallet info:", {
  name: currentWallet.name,
  chains: currentWallet.chains,
  features: Object.keys(currentWallet.features || {}),
  accounts: currentWallet.accounts?.length || 0,
});

// 详细 chains 信息
console.log("Wallet chains details:", currentWallet.chains);
currentWallet.chains.forEach((chain, index) => {
  console.log(`Chain ${index}:`, chain);
});

// 详细 features 信息
console.log("Wallet features details:", currentWallet.features);
Object.entries(currentWallet.features).forEach(([key, value]) => {
  console.log(`Feature ${key}:`, value);
});
```

## 🧪 测试步骤

### 步骤 1: 连接钱包
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 连接你的 Sui 钱包

### 步骤 2: 查看调试信息
在控制台中查找以下日志：

#### 钱包基本信息
```
Current wallet info: {
  name: "Sui Wallet",
  chains: ["sui:testnet"],
  features: ["standard:connect", "standard:network"],
  accounts: 1
}
```

#### 详细 Chains 信息
```
Wallet chains details: ["sui:testnet"]
Chain 0: sui:testnet
```

#### 详细 Features 信息
```
Wallet features details: {
  "standard:connect": {...},
  "standard:network": {...}
}
Feature standard:connect: {...}
Feature standard:network: {...}
```

### 步骤 3: 切换网络测试
1. **切换到 Testnet**:
   - 在钱包中切换到 Testnet
   - 查看控制台日志
   - 确认显示 "Sui Testnet"

2. **切换到 Mainnet**:
   - 在钱包中切换到 Mainnet
   - 查看控制台日志
   - 确认显示 "Sui Mainnet"

3. **切换到 Devnet**:
   - 在钱包中切换到 Devnet
   - 查看控制台日志
   - 确认显示 "Sui Devnet"

## 📊 预期结果

### Testnet 连接
```
Detected wallet chain: sui:testnet
Final detected network: Sui Testnet
```

### Mainnet 连接
```
Detected wallet chain: sui:mainnet
Final detected network: Sui Mainnet
```

### Devnet 连接
```
Detected wallet chain: sui:devnet
Final detected network: Sui Devnet
```

## 🔧 故障排除

### 问题 1: 仍然显示 Devnet
**可能原因**: 
- 钱包实际连接的是 Devnet
- 检测逻辑仍有问题

**解决方法**:
1. 检查钱包设置，确认当前网络
2. 查看控制台日志，确认钱包返回的 chains 信息
3. 如果钱包确实在 Devnet，这是正确的显示

### 问题 2: 显示 "Sui Network"
**可能原因**:
- 钱包没有返回有效的 chains 信息
- 检测逻辑无法识别网络类型

**解决方法**:
1. 查看控制台日志中的 chains 信息
2. 检查钱包是否支持网络检测
3. 尝试重新连接钱包

### 问题 3: 网络不更新
**可能原因**:
- 事件监听器没有正确触发
- 钱包切换网络后没有通知应用

**解决方法**:
1. 手动刷新页面
2. 断开并重新连接钱包
3. 检查钱包是否支持网络切换事件

## 📋 调试检查清单

- [ ] 钱包已连接
- [ ] 控制台显示钱包基本信息
- [ ] 控制台显示详细的 chains 信息
- [ ] 控制台显示详细的 features 信息
- [ ] 网络状态显示正确
- [ ] 切换网络后状态更新
- [ ] 没有 JavaScript 错误

## 🎯 下一步

1. **测试应用**: 连接钱包并查看控制台日志
2. **分享日志**: 如果问题仍然存在，请分享控制台的调试信息
3. **确认钱包网络**: 确认钱包实际连接的网络
4. **报告结果**: 告诉我测试结果和任何发现的问题

通过这个调试指南，我们可以准确定位网络检测的问题并修复它！

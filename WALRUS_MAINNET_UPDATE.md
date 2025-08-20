# Walrus 主网配置更新

## 更新说明
将整个应用从 Testnet 网络迁移到 Mainnet 网络，确保所有组件都连接到正确的网络。

## 修改的文件

### 1. `src/main.tsx`
- 简化 `getDefaultNetwork()` 函数，始终返回 "mainnet"
- 应用级别网络配置统一为 mainnet

### 2. `src/components/NetworkStatus.tsx`
- 简化网络状态显示，始终显示 "Sui Mainnet"
- 移除复杂的网络切换和同步检测逻辑

### 3. `src/utils/walrusClient.ts`
- 将所有 Walrus 客户端默认网络从 "testnet" 改为 "mainnet"
- 修改函数默认参数：
  - `createSuiClient()` 默认使用 "mainnet"
  - `createWalrusClient()` 默认使用 "mainnet"
  - `getWalrusClient()` 默认使用 "mainnet"
  - `testWalrusClient()` 使用 "mainnet"

### 4. `src/hooks/useWalrusSave.ts`
- 明确指定所有 `getWalrusClient()` 调用使用 "mainnet"
- 确保保存流程连接到主网

### 5. `src/components/SaveStatus.tsx`
- 更新 Walruscan 链接从 testnet 改为 mainnet
- 更新 WAL 代币获取提示，移除测试网水龙头链接
- 改为显示主网相关信息

## 网络配置总结

### 应用网络
- **SuiClient**: 连接到 Sui Mainnet
- **Walrus Client**: 连接到 Walrus Mainnet
- **网络显示**: 始终显示 "Sui Mainnet"

### 用户界面
- **网络状态**: 简化显示，只显示 Mainnet
- **保存状态**: Walruscan 链接指向主网
- **错误提示**: 更新为主网相关信息

### 代币要求
- **WAL 代币**: 需要在 Sui 主网上拥有 WAL 代币
- **测试代币**: 不再需要测试网代币

## 注意事项

1. **代币获取**: 用户需要在 Sui 主网上获取真实的 WAL 代币才能使用存储功能
2. **网络一致性**: 所有组件都配置为使用 mainnet，避免网络不匹配问题
3. **链接更新**: 所有外部链接（Walruscan）都指向主网

## 测试建议

1. 确认 Walrus 客户端正确连接到主网
2. 验证保存功能使用主网 WAL 代币
3. 检查 Walruscan 链接是否正确跳转到主网
4. 确认网络状态显示为 "Sui Mainnet"

## 回滚方案

如果需要回滚到测试网：
1. 将所有默认网络参数改回 "testnet"
2. 更新 Walruscan 链接回 testnet
3. 恢复测试网水龙头链接

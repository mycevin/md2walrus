# 测试钱包集成修复

这个文档用于测试修复后的钱包集成问题。

## 修复内容

1. **钱包获取方式修复**：
   - 之前：使用 `(window as any).suiWallet`
   - 现在：使用 `@mysten/dapp-kit` 的 `useSignAndExecuteTransaction`

2. **删除函数参数修复**：
   - 添加了必需的 `owner` 参数
   - 使用正确的钱包签名方法

## 测试步骤

1. 确保钱包已连接
2. 保存这个文档到 Walrus 网络
3. 在文档列表中查看这个文档
4. 点击删除按钮
5. 确认删除操作
6. 验证钱包签名弹窗正常显示
7. 确认删除交易成功执行

## 预期结果

- ✅ 不再出现"请先连接钱包"错误
- ✅ 钱包签名确认正常弹出
- ✅ 删除交易成功执行
- ✅ 文档从列表中正确移除
- ✅ 控制台显示交易哈希

## 技术细节

- 使用 `useSignAndExecuteTransaction` hook 获取签名函数
- 使用 `useCurrentAccount` hook 获取当前账户
- 通过 `signAndExecuteTransaction` 执行删除交易
- 传递正确的 `owner` 参数给 Walrus SDK
- 使用 `config.ts` 中的 `defaultSaveEpoch` (1 epoch) 作为默认存储时间

这个文档将在测试完成后被删除。

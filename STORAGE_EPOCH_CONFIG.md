# 存储时间配置

## 配置说明

项目使用 `src/utils/config.ts` 中的 `defaultSaveEpoch` 作为默认存储时间。

## 当前配置

```typescript
// src/utils/config.ts
export const defaultSaveEpoch = 1;
```

## 影响范围

### 1. 保存操作
- 所有新保存的文档都使用 1 个 epoch 的存储时间
- 减少 WAL 租金成本
- 适合短期存储需求

### 2. 删除操作
- 删除后数据保留 1 个 epoch
- 更快的资源回收
- 降低存储成本

### 3. 成本估算
- 成本估算会考虑存储时间
- 更准确的费用预测

## 修改历史

- **之前**：硬编码 5 个 epoch
- **现在**：使用配置中的 1 个 epoch
- **优势**：更灵活、成本更低

## 如何调整

如需修改存储时间，只需编辑 `src/utils/config.ts`：

```typescript
// 修改为其他值，如 3 个 epoch
export const defaultSaveEpoch = 3;
```

## 注意事项

1. **成本影响**：存储时间越长，WAL 租金越高
2. **数据保留**：删除后数据保留时间与存储时间一致
3. **用户体验**：短期存储更适合测试和临时文档

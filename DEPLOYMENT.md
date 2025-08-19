# 部署说明

## GitHub Pages 自动部署

本项目配置了GitHub Actions workflow，当创建新的tag时会自动构建并部署到GitHub Pages。

### 触发条件

- 推送以 `v` 开头的tag（例如：`v1.0.0`, `v2.1.3`）

### 部署流程

1. **构建阶段**：
   - 检出代码
   - 设置Node.js环境
   - 设置pnpm包管理器
   - 安装依赖 (`pnpm install --frozen-lockfile`)
   - 构建项目 (`pnpm run build`)
   - 上传构建产物到GitHub Pages

2. **部署阶段**：
   - 将构建产物部署到gh-pages分支
   - 自动发布到GitHub Pages

### 权限设置

workflow使用了以下权限：
- `contents: read` - 读取仓库内容
- `pages: write` - 写入GitHub Pages
- `id-token: write` - 用于身份验证

### 使用方法

1. 确保GitHub仓库已启用GitHub Pages功能
2. 创建并推送tag：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. 查看Actions页面确认部署状态
4. 访问GitHub Pages URL查看部署结果

### 注意事项

- 确保仓库设置中已启用GitHub Pages
- 首次部署可能需要几分钟时间
- 部署URL格式：`https://<username>.github.io/<repository-name>/`

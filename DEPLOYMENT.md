# MD2Walrus 部署说明

## 构建配置

本项目已配置为在 `/md2walrus` 路径下运行。

### 构建步骤

1. 安装依赖：
```bash
pnpm install
```

2. 构建项目：
```bash
pnpm build
```

3. 构建完成后，`dist` 目录中的文件可以部署到任何静态文件服务器。

### 部署要求

由于应用配置了 `base: '/md2walrus/'`，需要确保：

1. **服务器配置**：将构建文件部署到服务器的 `/md2walrus/` 路径下
2. **路由处理**：配置服务器将所有 `/md2walrus/*` 请求都指向 `index.html`（用于支持客户端路由）

### 常见服务器配置

#### Nginx
```nginx
location /md2walrus/ {
    alias /path/to/your/dist/;
    try_files $uri $uri/ /md2walrus/index.html;
}
```

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteBase /md2walrus/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /md2walrus/index.html [L]
```

#### GitHub Pages
- 仓库名称：`md2walrus`
- 或者使用自定义域名并配置 base 路径

### 本地预览

构建后可以使用以下命令预览：
```bash
pnpm preview
```

访问 `http://localhost:4173/md2walrus/` 查看效果。

### 注意事项

- 所有静态资源路径都会自动添加 `/md2walrus/` 前缀
- 确保服务器正确处理 SPA 路由
- 如果部署到根路径，需要修改 `vite.config.ts` 中的 `base` 配置

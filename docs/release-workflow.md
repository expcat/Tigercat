# 发布工作流说明

本文档说明发布相关的 GitHub Actions 工作流配置、手动触发参数、以及自动生成 tag 的机制。

## 相关工作流

- 发布（tag 触发）：.github/workflows/publish-on-tag.yml
- 生成版本与 tag（手动触发）：.github/workflows/create-release-tags.yml

## 手动触发：生成版本与 tag

工作流：Create Release Tags

触发方式：GitHub Actions 页面手动运行（workflow_dispatch）

当前无必填参数。

### 需要的权限/密钥

- `contents: write`（workflow 内已配置）
- 无额外 secrets 要求

### 执行逻辑

1. 仅当最近一个 tag 之后存在 `packages/` 目录变更时才继续
2. 计算最近 tag 后的提交数并生成新 tag：`v{major}.{minor}.{patch+commitCount}`
3. 推送 tag

### packages 变更判断规则

- 取最近一个 tag（若不存在，则以 HEAD 为范围）
- 仅当 `git diff --name-only <range>` 命中 `packages/` 路径才生成版本与 tag

## tag 触发：发布到 npm

工作流：Publish Packages

触发方式：推送 tag（格式：`v*`）

### 需要的 secrets

- `NPM_TOKEN`：用于 npm 发布认证

### 执行逻辑

1. 安装依赖并构建：`pnpm build`
2. 发布到 npm：`pnpm -r --filter "./packages/**" publish --access public --no-git-checks --tag latest`

## 常见配置项

### GitHub 仓库 Secrets

在仓库 Settings → Secrets and variables → Actions 中配置：

- `NPM_TOKEN`：npm 发布令牌

## 使用建议

- 日常合并到 main 后，需要发布时手动触发 Create Release Tags
- 若本次变更不涉及 `packages/`，工作流将直接跳过版本与 tag 生成
- tag 生成后会触发 Publish Packages 自动发布

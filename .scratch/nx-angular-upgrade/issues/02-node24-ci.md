# 02：Node 24 开发与 CI 环境

Status: resolved

Type: task  
Labels: ready-for-agent  
Blocked by: None

## What to build

所有 CI 工作流和发布环境统一使用 Node 24，并向贡献者声明受支持的运行时范围。

## Acceptance criteria

- [x] 所有设置 Node 的 CI 工作流统一为 Node 24。
- [x] 根包 engines 为 >=24.15.0 <25，发布环境检查和说明同步更新。
- [x] 保留 npm 发布策略、pnpm 版本和三个 workspace 包版本。
- [x] 现有发布、dist-tag 和部署工作流回归检查通过。

## Comments

- 实施依据：[需求设计](../spec.md)。

## Answer

- 全部 8 处 Node 设置统一为 `24`，包含仍处于禁用状态的 GitHub Release 工作流。
- 根包声明 Node `>=24.15.0 <25`；发布最低版本检查改为 `24.15.0`，同步运行时与 npm 说明。
- 保留 npm `11.5.1` 的固定安装及 OIDC 发布方式、pnpm `10.34.5` 和三个 workspace 包的 `22.0.1` 版本。
- `node --test scripts/deploy-workflow.spec.mjs scripts/npm-dist-tag.spec.mjs`：15 项通过。
- 直接执行发布工作流的版本检查函数：Node `22.14.0`、`24.14.9` 被拒绝，`24.15.0`、`24.21.0` 通过。
- 修改文件通过 Prettier 检查；集成分支继续执行全套工作区验证。

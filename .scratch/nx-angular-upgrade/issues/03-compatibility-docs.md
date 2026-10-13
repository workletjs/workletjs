# 03：Angular 22.2 兼容文档

Status: resolved

Type: task  
Labels: ready-for-agent  
Blocked by: None

## What to build

组件库使用者和贡献者能从 README、安装指南和兼容矩阵准确了解升级后当前源码的 Angular 22.2.x 要求。

## Acceptance criteria

- [x] README 和安装指南中的 Angular Core/CDK 要求统一为 ~22.2.0。
- [x] 兼容矩阵明确区分当前源码要求与已发布历史版本，不虚构新的库版本。
- [x] 贡献者文档说明 Node >=24.15.0 <25 与现有 pnpm 版本要求。
- [x] 文档格式检查通过。

## Comments

- 实施依据：[需求设计](../spec.md)；库版本仍为 22.0.1。

## Answer

- 根 README、库 README 与入门指南说明当前源码要求 Angular Core/CDK `~22.2.0`。
- 兼容矩阵新增当前源码行，标明包版本仍为 `22.0.1`、Angular
  22.2 升级尚未发布；保留历史发布行及其原有兼容范围。
- 安装说明区分源码构建与注册表发布包，指导使用者查询所选版本的 peerDependencies。
- 根 README 说明贡献开发环境需要 Node.js `>=24.15.0 <25`、pnpm `10.34.5`，并使用 frozen
  lockfile 安装。
- 使用根工作区已安装 Prettier 对四份文档与本工单执行格式检查，通过；文档改动的 `git diff --check`
  与版本一致性检索通过。
- 本工单仅修改文档，未改依赖、NgDoc 版本或组件行为；未安装依赖或增加复述版本声明的测试。

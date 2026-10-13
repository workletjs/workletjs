# Nx / Angular 升级实施图

## Notes

- 需求：[spec.md](spec.md)。集成分支：`codex/nx-angular-upgrade`。
- 工单状态使用 `open`、`claimed`、`resolved`，均以本文和单独工单记录结果。
- 01、02、03 可并行实施；04 依赖三项完成并合并到集成分支。
- 所有 worktree 均位于项目 `.worktrees/` 中。

## Decisions-so-far

- Nx 精确 23.3.0；Angular 和 ng-packagr 使用 ~22.2.0；Analog 精确 2.8.0。
- NgDoc 五个直接依赖保留 22.0.0-beta.2；CI 使用 Node 24；库版本保留 22.0.1。
- 优先现有测试、产物和页面验收，不新增只验证版本声明的测试。
- [01：工具链升级及增量迁移](issues/01-toolchain-upgrade.md)
  已完成：依赖和锁文件升级、四项增量迁移、冻结安装、库及文档测试、库构建和 lint 均通过；NgDoc 保留
  `22.0.0-beta.2`，正式/preview 文档构建和浏览器验收仍由 04 执行。
- [02：Node 24 开发与 CI 环境](issues/02-node24-ci.md) 已完成：8 处 Node 设置统一为
  `24`，根包 engines 为 `>=24.15.0 <25`，发布最低版本为
  `24.15.0`；15 项发布及部署回归与版本边界检查通过，保留原 npm、pnpm 和包版本策略。
- [03：Angular 22.2 兼容文档](issues/03-compatibility-docs.md)
  已完成：README、安装指南和兼容矩阵统一当前源码的 Angular Core/CDK `~22.2.0`
  要求及贡献环境说明，格式检查通过；明确包版本仍为 `22.0.1` 且升级尚未发布，保留历史发布兼容范围。

- [04：集成验收及需求关闭](issues/04-integration-validation.md)
  已 resolved：冻结安装、全部测试、lint、格式、库/docs/preview 构建、92 个入口及 tarball
  peers、OSM 页面交互全部通过；审查问题已修复，实施子 worktree 已清理。完整结果见[验收记录](validation.md)。

## Fog

- 无待决实施问题。保留 NgDoc
  beta 的正式与 preview 构建已通过；本地首页 MapTiler 授权限制见[验收记录](validation.md)。

## Tickets

- [01：工具链升级及增量迁移](issues/01-toolchain-upgrade.md)
- [02：Node 24 开发与 CI 环境](issues/02-node24-ci.md)
- [03：Angular 22.2 兼容文档](issues/03-compatibility-docs.md)
- [04：集成验收及需求关闭](issues/04-integration-validation.md)

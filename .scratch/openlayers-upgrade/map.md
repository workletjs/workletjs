# OpenLayers 升级实施图

## Notes

- 需求：[spec.md](spec.md)。集成分支：`codex/openlayers-upgrade`。
- 固定基线：`b96207ddddbd39bb36e2fdf918142f3da91cbdd2`。
- 实现者 worktree 全部位于当前项目 `.worktrees/`。
- 01、02 可并行；03 依赖 01、02。各实现分支完成后合入集成分支，再执行两轴审查。
- 工单使用独立文件及 `Status: open`、`claimed`、`resolved`；关闭时附 Answer 和本图摘要。

## Decisions-so-far

- 开发、docs 与库 peer 统一为 `ol ~10.11.0`，保留 catalog、现有工具链与包版本。
- Raster 保留实例并同步原生 DataTile 采样状态，通过真实公开读取验证。
- 从全部组件文档元数据移除 NEW，保留 EXPERIMENTAL；安装与迁移说明同步。
- 不执行包发布或站点部署。
- [02：文档版本与 NEW 标签](issues/02-docs-and-statuses.md)已完成并快进合入：`6c98d72`
  同步 OpenLayers 10.11 版本与迁移说明，`4441165`
  移除 82 个组件 NEW 声明并保留 3 个 EXPERIMENTAL；docs 测试、lint 和受影响文件格式检查通过。

## Fog

- 独立 `tdd` 技能未安装；实现者沿用现有测试，以失败回归、最小修复和通过验证执行行为变更。
- 无未决需求；实施中的事实与外部服务限制记录在工单和验收记录中。

## Tickets

- [01：依赖升级与 Raster 兼容](issues/01-dependencies-and-raster.md)
- [02：文档版本与 NEW 标签](issues/02-docs-and-statuses.md)
- [03：集成验收](issues/03-integration-validation.md)

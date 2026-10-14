# OpenLayers 升级实施图

## Notes

- 需求：[spec.md](spec.md)。集成分支：`codex/openlayers-upgrade`。
- 固定基线：`b96207ddddbd39bb36e2fdf918142f3da91cbdd2`。
- 实现者 worktree 全部位于当前项目 `.worktrees/`。
- 01、02 可并行；03 依赖 01、02。各实现分支完成后合入集成分支，再执行两轴审查。
- 工单使用独立文件及 `Status: open`、`claimed`、`resolved`；关闭时附 Answer 和本图摘要。
- 独立 `tdd` 技能未安装；实现沿现有测试完成失败回归、最小修复和通过验证。

## Decisions-so-far

- 开发、docs 与库 peer 统一为 `ol ~10.11.0`，保留 catalog、现有工具链与包版本。
- Raster 保留实例并同步原生 DataTile 采样状态，通过真实公开读取验证。
- 从全部组件文档元数据移除 NEW，保留 EXPERIMENTAL；安装与迁移说明同步。
- 不执行包发布或站点部署。
- [02：文档版本与 NEW 标签](issues/02-docs-and-statuses.md)已完成并快进合入：`6c98d72`
  同步 OpenLayers 10.11 版本与迁移说明，`4441165`
  移除 82 个组件 NEW 声明并保留 3 个 EXPERIMENTAL；docs 测试、lint 和受影响文件格式检查通过。
- [01：依赖升级与 Raster 兼容](issues/01-dependencies-and-raster.md)已完成并快进合入：`690e678`
  升级依赖，`d18f771` 修复动态 Raster 原生浮点采样，`cd9aff5`
  适配上游测试行为；真实失败回归已确认，修复后 29 项 Raster 测试和全库 2311 项测试通过。完成记录为
  `52bd57a`。
- [03：集成验收](issues/03-integration-validation.md)已 resolved，独立验收交付 `c83b3f5` 已合入；
  [验收记录](validation.md)包含 2377 项通过测试、三种构建、实际 tarball、导航元数据和浏览器截图。两项 GeoTIFF 示例受原有外部数据服务限制，未记为通过。
- 固定范围 `b96207d...5488711` 的 Standards / Spec 两轴审查均为 0
  findings。三个实现者 worktree 和已合入临时分支均已清理，规格与全部工单关闭；保留集成分支
  `codex/openlayers-upgrade` 及完整提交历史。

## Fog

- 无未决实施问题。两项 GeoTIFF 示例受原有远端数据服务限制，证据和额外测试类型检查诊断见[验收记录](validation.md)。

## Tickets

- [01：依赖升级与 Raster 兼容](issues/01-dependencies-and-raster.md)
- [02：文档版本与 NEW 标签](issues/02-docs-and-statuses.md)
- [03：集成验收](issues/03-integration-validation.md)

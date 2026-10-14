# 03：集成验收

Status: open

Type: task

Labels: ready-for-agent

Blocked by: 01, 02

## What to build

对集成后的[完整需求](../spec.md)执行可复现检查、真实产物及浏览器验收，保存命令、结果和截图。

## Acceptance criteria

- [ ] 冻结安装、完整测试、lint、格式、库构建以及正式与 preview 文档构建通过。
- [ ] 实际 tarball 的 ol peer 为 `~10.11.0`，catalog 展开且全部 secondary entry
      point 和导出目标完整。
- [ ] 正式与 preview 导航元数据不含 NEW，保留全部 EXPERIMENTAL 和原有页面结构。
- [ ] 浏览器检查 OSM 交互、向量图层旋转、矢量瓦片及 GeoTIFF/WebGL，保存截图与控制台检查结果。
- [ ] 浏览器中组件导航和页面不展示 NEW，EXPERIMENTAL 仍显示；外部服务限制如实记录。
- [ ] 保存验收记录并关闭工单；集成分支完成 Standards / Spec 两轴审查、解决发现后关闭规格。
- [ ] 清理实现者 worktree，保留集成分支和清晰提交记录，不发布或部署。

## Comments

- 2026-10-14：依赖 01、02 合入；本地 Nx 检查可使用 `NX_DAEMON=false NX_ISOLATE_PLUGINS=false`。
- 审查固定基线为 `b96207ddddbd39bb36e2fdf918142f3da91cbdd2`。

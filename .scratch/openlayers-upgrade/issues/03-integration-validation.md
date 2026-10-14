# 03：集成验收

Status: claimed

Type: task

Labels: ready-for-agent

Blocked by: 01, 02

## What to build

对集成后的[完整需求](../spec.md)执行可复现检查、真实产物及浏览器验收，保存命令、结果和截图。

## Acceptance criteria

- [x] 冻结安装、完整测试、lint、格式、库构建以及正式与 preview 文档构建通过。
- [x] 实际 tarball 的 ol peer 为 `~10.11.0`，catalog 展开且全部 secondary entry
      point 和导出目标完整。
- [x] 正式与 preview 导航元数据不含 NEW，保留全部 EXPERIMENTAL 和原有页面结构。
- [x] 浏览器检查 OSM 交互、向量图层旋转、矢量瓦片及 GeoTIFF/WebGL，保存截图与控制台检查结果。
- [x] 浏览器中组件导航和页面不展示 NEW，EXPERIMENTAL 仍显示；外部服务限制如实记录。
- [ ] 保存验收记录并关闭工单；集成分支完成 Standards / Spec 两轴审查、解决发现后关闭规格。
- [ ] 清理实现者 worktree，保留集成分支和清晰提交记录，不发布或部署。

## Comments

- 2026-10-14：依赖 01、02 合入；本地 Nx 检查可使用 `NX_DAEMON=false NX_ISOLATE_PLUGINS=false`。
- 审查固定基线为 `b96207ddddbd39bb36e2fdf918142f3da91cbdd2`。
- 2026-10-14：01、02 均已 resolved 并合入集成分支，开始完整检查、产物和浏览器验收及两轴审查。
- 2026-10-14：独立验收完成；两轴审查、规格关闭及实现者工作区清理由父集成流程在合入后继续完成，末两项在实际完成时勾选。

## Answer

- 完整冻结安装、测试、lint、格式和三种构建均成功；本次真实运行的脚本 30 项、库 2311 项及文档 36 项测试全部通过，Nx 缓存明确跳过。已有 2 项 lint 警告及非阻断构建诊断如实记录。
- 使用项目 pnpm 10.34.5 对实际库构建输出打包，tarball 的 `ol` peer 为
  `~10.11.0`，无 catalog 残留；92 个 secondary entry point 与全部 94 项导出目标完整。
- 正式与 preview 文档均为 95 个导航实体、87 页、8 分类、0 NEW、3
  EXPERIMENTAL；除 NEW 清理外，导航与升级前基线深度比较完全一致，base 分别为 `/` 与 `/preview/`。
- 浏览器验证 OSM 渲染和缩放、VectorImage 渲染及真实旋转与复位、矢量瓦片渲染与要素点击、preview 深链刷新、安装与迁移说明。GeoTIFF 的 Reprojection、CloudOptimized、Blob 三项通过；WithOverviews 和 COGMathMultiSource 因原有外部 URL 的 HTTP
  403 或重定向为 HTML 而未通过，记录 2 条请求错误及获准联网的 HEAD /
  Range 请求证据，没有修改 URL 或授权配置。
- 截图、命令、真实统计、产物检查及限制详见[验收记录](../validation.md)。临时旋转 fixture 仅使用现有公开输入，构建后已还原，不进入提交；未发布或部署。

# 02：文档版本与 NEW 标签

Status: claimed

Type: task

Labels: ready-for-agent

## What to build

按[需求设计](../spec.md)同步当前源码版本要求、上游迁移说明和 Snap
API 链接，移除全部组件文档的 NEW 状态。

## Acceptance criteria

- [ ] 根目录及库 README、Getting Started 和当前源码兼容矩阵要求 `ol ~10.11.0`。
- [ ] 历史发布兼容信息、历史验收记录和版本样例保留。
- [ ] 明确宿主负责 Intl.Segmenter polyfill，并说明上游 GeoJSON、Canvas、WMTS 和 BingMaps 变化。
- [ ] Snap 固定版本 API 链接更新到 10.11.0。
- [ ] 从页面元数据移除全部 NEW 状态，保留三个 EXPERIMENTAL 及通用标签渲染能力。
- [ ] 格式及受影响 docs 检查通过；生成内容与浏览器实际展示由 03 集成验收。
- [ ] 版本及迁移说明、NEW 标签清理使用清晰的独立提交；关闭时附 Answer。

## Comments

- 2026-10-14：与 01 并行；开始前改为 claimed，完成前合入集成分支最新 tip。
- 基线盘点为 82 个 NEW 和 3 个 EXPERIMENTAL；移除来源声明，不使用过滤或 CSS 隐藏。

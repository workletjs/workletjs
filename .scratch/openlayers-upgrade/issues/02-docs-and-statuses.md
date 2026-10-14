# 02：文档版本与 NEW 标签

Status: resolved

Type: task

Labels: ready-for-agent

## What to build

按[需求设计](../spec.md)同步当前源码版本要求、上游迁移说明和 Snap
API 链接，移除全部组件文档的 NEW 状态。

## Acceptance criteria

- [x] 根目录及库 README、Getting Started 和当前源码兼容矩阵要求 `ol ~10.11.0`。
- [x] 历史发布兼容信息、历史验收记录和版本样例保留。
- [x] 明确宿主负责 Intl.Segmenter polyfill，并说明上游 GeoJSON、Canvas、WMTS 和 BingMaps 变化。
- [x] Snap 固定版本 API 链接更新到 10.11.0。
- [x] 从页面元数据移除全部 NEW 状态，保留三个 EXPERIMENTAL 及通用标签渲染能力。
- [x] 格式及受影响 docs 检查通过；生成内容与浏览器实际展示由 03 集成验收。
- [x] 版本及迁移说明、NEW 标签清理使用清晰的独立提交；关闭时附 Answer。

## Comments

- 2026-10-14：与 01 并行；开始前改为 claimed，完成前合入集成分支最新 tip。
- 基线盘点为 82 个 NEW 和 3 个 EXPERIMENTAL；移除来源声明，不使用过滤或 CSS 隐藏。

## Answer

- 当前源码安装要求、两份 README 与兼容矩阵已同步到 `ol ~10.11.0`；保留历史发布版本 `~10.9.0`
  及历史验收记录。Snap 的两个固定 API 链接均指向 10.11.0。
- Getting Started 记录宿主提供 `Intl.Segmenter` polyfill、GeoJSON 空坐标、Canvas
  sRGB 插值，以及 WMTS
  extent、wrapX、TileMatrixSetLimits 变化；BingMaps 文档保留组件并说明上游弃用。
- 从 82 个组件页面的来源声明移除 NEW，保留 3 个 EXPERIMENTAL。没有修改侧栏或通用标签渲染。
- 版本与迁移说明提交：`6c98d72`；NEW 标签清理单独提交。
- 独立 worktree 的 `pnpm install --frozen-lockfile --ignore-scripts` 成功。
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm test:docs`
  通过：8 个文件、36 个测试，包含现有侧栏空状态和其他状态映射用例。
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm exec nx lint docs --output-style=static`
  通过；相关 Markdown 和全部组件页面的 Prettier 检查、`git diff --check` 均通过。
- 正式与 preview 生成元数据、浏览器展示及截图交由 [03 集成验收](03-integration-validation.md)。

# 04：BingMaps 弃用标签与 Alert Callout

Status: resolved

Type: task

Blocked by: 02, 03

## What to build

按用户对 PR #52 的补充要求，为 BingMaps Source 文档添加 `Deprecated` 状态标签，并使用 NgDoc Alert
Callout 标注现有弃用说明。

## Acceptance criteria

- [x] BingMaps 页面通过 NgDoc 来源元数据声明 `Deprecated` 标签。
- [x] 现有上游弃用原因、保留组件 API 和迁移指引使用原生 Alert Callout 展示。
- [x] 正式与 preview 构建正确生成标签和 Alert；其余状态仍为 0 个 NEW、3 个 EXPERIMENTAL。
- [x] 相关检查通过，提供实际页面截图并以独立 Conventional Commit 更新 PR #52。

## Comments

- 2026-10-14：用户指定参考
  [NgDoc Markdown and callouts](https://ng-doc.com/docs/write-content/markdown-and-callouts/)。
- 使用 `@status:alert Deprecated` 和 `> **Alert**`，保持现有状态渲染与组件接口。
- 2026-10-14：用户要求 Callout 标题改为 `Deprecated`。使用 NgDoc 原生
  `<ng-doc-blockquote type="alert" label="Deprecated">`，保留 Alert 样式和原有说明。

## Answer

- BingMaps 页面新增 alert 颜色的 `Deprecated` 状态，现有弃用段落改为 NgDoc 原生 Alert Callout。
- Callout 使用 `label="Deprecated"` 自定义标题，保留 `type="alert"`；正式与 preview 均验证通过。
- docs 测试、docs lint、正式及 preview 构建、相关文件 Prettier 和 `git diff --check` 均通过。
- 两种实际页面均显示标签和 Alert；导航保留 0 个 NEW、3 个 EXPERIMENTAL，新增 1 个 Deprecated。
- 只读审阅通过，无发现。截图及补充验收见[验收记录](../validation.md#bingmaps-弃用展示补充验收)。

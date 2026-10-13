# 02：文档 UI 与导航兼容

Status: claimed

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

保留文档自定义首页、侧栏、状态徽标及 URL，使它们兼容 NgDoc 新默认 UI 和响应式行为。

## Acceptance criteria

- [ ] 检查官方 22.0 与 22.1 增量说明，实际受影响的 signal/API/CSS 使用已适配。
- [ ] 保留分类、状态、默认跳转、锚点、现有路由及图标；断点与新引擎 UI 一致。
- [ ] 接受官方新版 UI，清理失效的旧内部样式，必要行为变化有 colocated 回归测试。
- [ ] 受影响 docs 单元测试及样式格式检查通过；真实新版浏览器验收交由 04。

## Comments

- 实施依据：[需求设计](../spec.md)。可先在当前测试环境验证项目逻辑，与 01 的构建配置改动隔离。
- 2026-10-13：`codex/ng-doc-ui` 领取，基于集成分支 `codex/ng-doc-upgrade` 的
  `f410a76`。先以既有 UI 测试验证断点行为，再检查目标版本接口与样式。

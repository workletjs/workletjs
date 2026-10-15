# 04：集成验收及两轴审查

Status: open

Type: task

Labels: ready-for-agent

Blocked by: 01, 02, 03

## What to build

按[需求设计](../spec.md)完成全量检查、库入口产物、正式及 preview 文档、真实浏览器演示和 Standards /
Spec 两轴审查，记录验收结果。

## Acceptance criteria

- [ ] pnpm test、lint、format:check、build、build:docs、build:docs-preview 通过。
- [ ] 库构建产物入口与组件、模块导出完整。
- [ ] 真实场景、Custom URL、重试、错误提示、交互、导航及标签有浏览器记录及截图。
- [ ] 外部服务或工具限制如实记录，受限验证不标为通过。
- [ ] 两轴审查发现已修复，各工单与需求状态关闭，保留清晰提交记录。

## Comments

- 集成分支保留，完成后归档实现 worktree；不发版或部署。

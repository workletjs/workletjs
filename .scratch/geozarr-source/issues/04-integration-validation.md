# 04：集成验收及两轴审查

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 01, 02, 03

## What to build

按[需求设计](../spec.md)完成全量检查、库入口产物、正式及 preview 文档、真实浏览器演示和 Standards /
Spec 两轴审查，记录验收结果。

## Acceptance criteria

- [x] pnpm test、lint、format:check、build、build:docs、build:docs-preview 通过。
- [x] 库构建产物入口与组件、模块导出完整。
- [x] 真实场景、Custom URL、重试、错误提示、交互、导航及标签有浏览器记录及截图。
- [x] 外部服务或工具限制如实记录，受限验证不标为通过。
- [x] 两轴审查发现已修复，各工单与需求状态关闭，保留清晰提交记录。

## Comments

- 集成分支保留，完成后归档实现 worktree；不发版或部署。

## Answer

- 全量测试、lint、格式、组件库构建及正式/preview 文档构建均通过；测试合计 2407 项，真实构建的新入口完整导出组件与 NgModule。
- 两个固定 Sentinel-2 预设真实读取与 RGB WebGL 渲染、首次加载、草稿编辑、平移缩放、Custom
  URL、空白 URL 禁止加载、同 URL 重试、初始化失败与恢复均通过生产文档浏览器验收；preview 深链接打开及刷新通过。
- 真实元数据 HTTP 200、影像请求 HTTP 503 的本地 fixture 验证了 Dataset
  ready 与独立瓦片失败提示并存；控制台 warn/error 记录为空。HTTP
  404 的 sparse 数据尝试未误记为失败验收。
- Standards 原有 1 项 P3 已在 `878c296` 修复并复核为 0；Spec 审查 0 项。原始报告与复核结果均保留。
- 完整结果、环境限制、清晰提交记录与持久截图见
  [集成验收记录](../validation.md)。需求与各工单均已关闭，依赖、锁文件及包版本保持原状。

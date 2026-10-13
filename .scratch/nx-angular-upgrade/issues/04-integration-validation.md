# 04：集成验收及需求关闭

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 01, 02, 03

## What to build

集成分支完整满足需求，保留 NgDoc beta 时文档应用仍可构建和运行，并具备可审查的验证和提交记录。

## Acceptance criteria

- [x] 冻结安装、脚本/库/docs 测试、lint、格式检查、库/docs/preview 构建全部通过。
- [x] 产物 Angular peer 范围、secondary entry point、NgDoc 单实例和依赖链检查通过。
- [x] 文档页面、静态资源、OSM 地图展示和基本交互冒烟检查通过。
- [x] Standards 与 Spec 两轴代码审查完成，发现的问题已修复。
- [x] 工单与需求按本地 issue tracker 约定记录验证结果并关闭。
- [x] 分支提交记录清晰，实施子 worktree 已清理。

## Comments

- 实施依据：[需求设计](../spec.md)。

## Answer

- 2026-10-13：集成分支完整验收通过，详见[验收记录](../validation.md)，其中包含检查结果、两轴审查报告、提交摘要和截图。
- NgDoc 五个直接依赖保留 `22.0.0-beta.2`；三个 workspace 包版本仍为 `22.0.1`。
- 首次 Standards 审查的一项 P3 已修复并复核通过；Spec 零发现。
- OSM 地图的显示、缩放和 preview 深层路由刷新通过。首页 MapTiler 在本地返回 `Invalid key`
  瓦片，已记录为本次范围外的外部服务配置限制。
- 四个实施子 worktree 和临时分支已清理，保留 `codex/nx-angular-upgrade`
  集成分支及其 worktree；未发布包或部署站点。

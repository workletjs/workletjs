# 04：集成验收及需求关闭

Status: claimed  
Type: task  
Labels: ready-for-agent  
Blocked by: 01, 02, 03

## What to build

集成分支完整满足需求，保留 NgDoc beta 时文档应用仍可构建和运行，并具备可审查的验证和提交记录。

## Acceptance criteria

- [ ] 冻结安装、脚本/库/docs 测试、lint、格式检查、库/docs/preview 构建全部通过。
- [ ] 产物 Angular peer 范围、secondary entry point、NgDoc 单实例和依赖链检查通过。
- [ ] 文档页面、静态资源、地图展示和基本交互冒烟检查通过。
- [ ] Standards 与 Spec 两轴代码审查完成，发现的问题已修复。
- [ ] 工单与需求按本地 issue tracker 约定记录验证结果并关闭。
- [ ] 分支提交记录清晰，实施子 worktree 已清理。

## Comments

- 实施依据：[需求设计](../spec.md)。

# 04：集成验收及审查

Status: open

Type: task

Labels: ready-for-agent

Blocked by: 01, 02, 03

## What to build

完整集成分支满足需求，具备可复现验证、真实站点截图、回退演练及两轴审查记录。

## Acceptance criteria

- [ ] 冻结安装、全部测试、lint、格式、库构建及根站/preview/版本路径构建通过。
- [ ] 文档页面、分类、示例及 API 内容完整，搜索、状态、主题、移动端及地图交互正常。
- [ ] 开发更新、冷暖构建及新旧引擎交替运行通过；临时副本执行官方回退并成功旧引擎构建。
- [ ] Standards 与 Spec 两轴审查完成，发现均由单一修复实现者处理并复核。
- [ ] 保存验收及提交记录，关闭工单和规格，清理实现者 worktree，保留集成分支及 worktree。

## Comments

- 实施依据：[需求设计](../spec.md)。审查固定基线为 `5cd2d4e`，不发布包或部署站点。

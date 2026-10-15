# 02：GeoZarr 完整交互示例及竞态测试

Status: open

Type: task

Labels: ready-for-agent

Blocked by: 01

## What to build

按[需求设计](../spec.md)以新组件复现官方两个预设场景、Custom
URL、Load、OSM、RGB 样式和 View 配置，处理失败、同 URL 重试和过期结果。

## Acceptance criteria

- [ ] 单项 keyed @for 按加载 ID 重建整个地图，控件遵循现有 Material 风格。
- [ ] 仅在 ready 后解析视图，使用具体 View，旧尝试与销毁后的回调无效。
- [ ] 用户操作、初始化失败、瓦片失败、视图失败和异步竞态有回归测试。
- [ ] 先运行失败测试，再实现并使相关测试、ESLint、格式检查通过。

## Comments

- 基于已合并 01 的集成分支实施；提交使用 geozarr-source scope，完成前合并集成分支 tip。

# GeoZarr Source 实施图

## Notes

- 需求：[spec.md](spec.md)；集成分支：`codex/geozarr-source`。
- 固定基线：`bbf83cef2c36c4ddd629fe2e6a701ae53ed8e771`。
- 集成 worktree：`/Users/chao/.codex/worktrees/geozarr-source/workletjs`；实现者使用各自 worktree。
- 全部提交 scope 为 `geozarr-source`。01、03 可并行；02 依赖 01；04 依赖 01、02、03。
- 工单以 Status 和 Answer 关闭；不创建 PR、不发版或部署。
- 独立 `tdd` 技能未安装，实施按仓库既有做法完成失败回归、实现及通过验证。

## Decisions-so-far

- 完整 10.11 薄封装、初始化构造输入、原生事件、实例方法更新维度、完整官方交互示例及验收边界均已确认。
- 共享领域术语已随需求记录，不新增 ADR。

- [03：NgDoc 页面与使用说明](issues/03-ngdoc-documentation.md) 已完成；实现提交
  `d5dea9a`，新增 GeoZarr 页面、接口与生命周期说明；格式、库 lint 和集成文档构建通过。
- [01：组件及行为测试](issues/01-source-component.md) 已完成；实现提交 `e77c9f5`、验证记录
  `f46c1f7`，新增完整 GeoZarr 入口及 18 个公开行为测试；库测试 2329/2329、库 lint 和新增文件格式检查通过。
- [02：交互示例及竞态测试](issues/02-interactive-example.md) 已完成；实现提交
  `42d6b0f`，新增完整交互示例及 12 个公开行为测试；库测试 2341/2341、库 lint 和受影响示例格式检查通过，真实浏览器渲染及交互已由 04 验收。

- [04：集成验收及两轴审查](issues/04-integration-validation.md)
  已完成；全量 2407 项测试、lint、格式、库和正式/preview 文档构建通过，产物入口与导出完整；真实预设、Custom、重试、错误恢复、独立瓦片失败、平移缩放和 preview 深链接刷新均有持久浏览器证据。
- Standards 原 P3 在 `878c296` 修复后复核为 0，Spec 审查 0 项；[完整验收记录](validation.md)
  保留原始报告、截图与环境说明。[需求](spec.md) 和全部四个工单均已 resolved。

- [03 文档后续精简](issues/03-ngdoc-documentation.md)：按用户反馈将四节合并为 Usage
  notes，移除与自动 API 重复的清单和基础示例；受影响 Markdown 格式、preview 文档构建及真实浏览器页面复核通过，保留[页面截图](evidence/docs-usage-notes.jpg)。

## Fog

- 无未决验收项。

## Tickets

- [01：组件及行为测试](issues/01-source-component.md)
- [02：交互示例及竞态测试](issues/02-interactive-example.md)
- [03：NgDoc 页面与使用说明](issues/03-ngdoc-documentation.md)
- [04：集成验收及两轴审查](issues/04-integration-validation.md)

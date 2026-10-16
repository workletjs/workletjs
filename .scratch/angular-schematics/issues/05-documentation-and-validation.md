# 05：文档与集成验收

Status: claimed

Type: task

Labels: ready-for-agent

Blocked by: 01, 02, 03, 04

## What to build

同步使用文档并验证公开命令、真实发布产物及生成应用，确认完整功能满足需求后记录验收证据。

## Acceptance criteria

- [ ] 根 README、发布包 README 和 NgDoc 入门指南包含两条公开命令、参数、交互默认值、自定义示例、兼容范围、限制与失败处理。
- [ ] 文档明确首版支持 Angular CLI
      22.2.x 标准 workspace、NgModule 仅基础接入，以及当前源码与历史发布版本 peerDependencies 的区别。
- [ ] 术语表使用“地图应用模板”“地图示例”的领域定义，具体实现规则继续保存在需求和工单中。
- [ ] 独立 Node
      Vitest 套件通过编译后的公开 collection 验证行为，并已进入现有库测试入口；测试不绑定私有辅助实现。
- [ ] 完成受影响测试、现有全部测试、lint、格式检查、主库 production/development 构建及文档构建，记录命令和结果。
- [ ] 实际 pnpm
      tarball 包含 collection、schema、模板、factory、声明和 CommonJS 包边界；版本要求已解析，运行依赖可用且未泄漏私有包依赖。
- [ ] 从实际 tarball 验证 CommonJS factory 加载，不以源码加载通过代替发布产物检查。
- [ ] 临时 Angular CLI workspace 使用 tarball 运行真实
      `ng add`：验证基础接入、开启示例及指定项目场景，生成应用测试和生产构建通过。
- [ ] 临时 workspace 使用 tarball 执行 application 生成命令，验证默认及自定义地图路径，运行生成项目的测试和生产构建。
- [ ] 浏览器确认地图显示、缩放、键盘聚焦、懒加载页面和首页重定向可用；保存必要截图及可复核记录。
- [ ] 验收记录区分自动化结果、人工或浏览器结果及仍存在的限制；实施完成后按 tracker 约定更新规格、工单和实施图状态。

## Comments

- 实施依据：[需求设计](../spec.md)。当前工单为待执行验收，不代表任一检查已经通过。
- 本工单不包含发版、部署、分支或 worktree 管理动作；仅创建和验证本地交付产物与文档。

- 2026-10-16：在独立 codex/schematics-05
  worktree 领取；文档和仓库回归由本工单实施，最终实际包、CLI 和浏览器证据由集成验收汇总。

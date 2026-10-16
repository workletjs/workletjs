# 05：文档与集成验收

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 01, 02, 03, 04

## What to build

同步使用文档并验证公开命令、真实发布产物及生成应用，确认完整功能满足需求后记录验收证据。

## Acceptance criteria

- [x] 根 README、发布包 README 和 NgDoc 入门指南包含两条公开命令、参数、交互默认值、自定义示例、兼容范围、限制与失败处理。
- [x] 文档明确首版支持 Angular CLI
      22.2.x 标准 workspace、NgModule 仅基础接入，以及当前源码与历史发布版本 peerDependencies 的区别。
- [x] 术语表使用“地图应用模板”“地图示例”的领域定义，具体实现规则继续保存在需求和工单中。
- [x] 独立 Node
      Vitest 套件通过编译后的公开 collection 验证行为，并已进入现有库测试入口；测试不绑定私有辅助实现。
- [x] 完成受影响测试、现有全部测试、lint、格式检查、主库 production/development 构建及文档构建，记录命令和结果。
- [x] 实际 pnpm
      tarball 包含 collection、schema、模板、factory、声明和 CommonJS 包边界；版本要求已解析，运行依赖可用且未泄漏私有包依赖。
- [x] 从实际 tarball 验证 CommonJS factory 加载，不以源码加载通过代替发布产物检查。
- [x] 临时 Angular CLI workspace 使用 tarball 运行真实
      `ng add`：验证基础接入、开启示例及指定项目场景，生成应用测试和生产构建通过。
- [x] 临时 workspace 使用 tarball 执行 application 生成命令，验证默认及自定义地图路径，运行生成项目的测试和生产构建。
- [x] 浏览器确认地图显示、缩放、键盘聚焦、懒加载页面和首页重定向可用；保存必要截图及可复核记录。
- [x] 验收记录区分自动化结果、人工或浏览器结果及仍存在的限制；实施完成后按 tracker 约定更新规格、工单和实施图状态。

## Comments

- 实施依据：[需求设计](../spec.md)。当前工单为待执行验收，不代表任一检查已经通过。
- 本工单不包含发版、部署、分支或 worktree 管理动作；仅创建和验证本地交付产物与文档。

- 2026-10-16：在独立 codex/schematics-05
  worktree 领取；文档和仓库回归由本工单实施，最终实际包、CLI 和浏览器证据由集成验收汇总。

## Answer

三份用户文档已同步两条公开命令、所有参数、原生交互默认否、示例定制、应用固定配置、兼容范围、冲突处理及重复执行行为。根 README 开发命令包含内部 Schematics；术语表只新增地图应用模板、地图示例的领域定义。

完整仓库检查通过：pnpm test（脚本 30、库 2366、Schematics 134、文档 36 个测试）、pnpm lint、pnpm
format:check、pnpm build、主库 development 构建及 pnpm
build:docs。缓存恢复后集合 35 个文件逐项哈希相同，两条 factory 可加载；仅内部 schema 的临时注释变化触发主库全部构建任务重新执行，还原后恢复原缓存和产物，未留下源码改动。

功能集成提交 3053d19 的实际 pnpm
tarball 已检查、安装并加载两条 factory；默认及自定义地图应用的真实生成、测试和 production 构建通过。已有应用的实际交互默认否、非交互、多应用当前项目推断、自定义示例、冲突前后 SHA 不变均有证据。浏览器确认真实瓦片、控件、聚焦、缩放及默认/自定义首页跳转。详细覆盖、历史证据区别、截图及日志见[验收记录](../validation.md)。

工单已完成；规格保持 open，等待最终 code-review。文档合入后的最终重包及与已验证 runtime 子树对比、真实安装/factory/CLI 确认仍由集成负责人追加，不以本次功能包验收冒称最终 HEAD 产物已测。

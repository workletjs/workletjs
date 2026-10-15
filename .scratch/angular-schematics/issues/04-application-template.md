# 04：地图应用模板

Status: claimed

Type: task

Labels: ready-for-agent

Blocked by: 03

## What to build

通过 `ng generate @workletjs/ngx-openlayers:application <name>` 在已有 Angular CLI
workspace 创建可运行、测试和构建的地图应用。

## Acceptance criteria

- [ ] 接受必填应用名称及
      `projectRoot`、`exampleName`、`route`、`skipInstall`，示例默认值和校验规则与安装命令一致。
- [ ] 委托官方 `@schematics/angular:application`
      创建基础设施，固定 standalone、zoneless、CSS、Router、Vitest，不启用 SSR。
- [ ] 在已有 workspace 中创建新应用，并支持指定项目根目录；不提供 `ng new --collection`
      或新 workspace 能力。
- [ ] 复用基础依赖、样式接入和地图示例规则，不维护另一套同功能地图模板或安装逻辑。
- [ ] 空路径使用完整匹配重定向至指定地图路径，默认启动后显示地图；自定义路径时重定向保持一致。
- [ ] 保留官方生成项目的正常单元测试和生产构建能力，清理或调整默认欢迎页相关测试，避免与最终地图模板不符。
- [ ] 统一安排一次后续依赖安装，尊重 `skipInstall`，避免外层和官方生成器重复安装。
- [ ] 通过公开 collection 测试默认配置、自定义应用名称和根目录、示例名称、地图路径、重定向及安装任务。

## Comments

- 实施依据：[需求设计](../spec.md)。首版模板不暴露 SSR、样式框架、Router 或 zoneless 的变体选项。
- 真实 tarball 下的新应用测试、生产构建和浏览器验收由 05 执行。

- 2026-10-16：在独立 worktree `codex/schematics-04` 领取，基于集成分支 `97f9016`，复用 02、03 的接入与地图示例规则，按公开 collection 边界红绿实现。

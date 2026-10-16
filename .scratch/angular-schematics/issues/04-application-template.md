# 04：地图应用模板

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 03

## What to build

通过 `ng generate @workletjs/ngx-openlayers:application <name>` 在已有 Angular CLI
workspace 创建可运行、测试和构建的地图应用。

## Acceptance criteria

- [x] 接受必填应用名称及
      `projectRoot`、`exampleName`、`route`、`skipInstall`，示例默认值和校验规则与安装命令一致。
- [x] 委托官方 `@schematics/angular:application`
      创建基础设施，固定 standalone、zoneless、CSS、Router、Vitest，不启用 SSR。
- [x] 在已有 workspace 中创建新应用，并支持指定项目根目录；不提供 `ng new --collection`
      或新 workspace 能力。
- [x] 复用基础依赖、样式接入和地图示例规则，不维护另一套同功能地图模板或安装逻辑。
- [x] 空路径使用完整匹配重定向至指定地图路径，默认启动后显示地图；自定义路径时重定向保持一致。
- [x] 保留官方生成项目的正常单元测试和生产构建能力，清理或调整默认欢迎页相关测试，避免与最终地图模板不符。
- [x] 统一安排一次后续依赖安装，尊重 `skipInstall`，避免外层和官方生成器重复安装。
- [x] 通过公开 collection 测试默认配置、自定义应用名称和根目录、示例名称、地图路径、重定向及安装任务。

## Comments

- 实施依据：[需求设计](../spec.md)。首版模板不暴露 SSR、样式框架、Router 或 zoneless 的变体选项。
- 真实 tarball 下的新应用测试、生产构建和浏览器验收由 05 执行。

- 2026-10-16：在独立 worktree `codex/schematics-04` 领取，基于集成分支
  `97f9016`，复用 02、03 的接入与地图示例规则，按公开 collection 边界红绿实现。

## Answer

- 2026-10-16：完成 `application` collection 入口；以 `bd018fc` 先记录领取，`dbb187d`
  实现应用模板，所有提交 scope 均为 `schematics`。
- 基础设施委托官方 application
  schematic，显式固定 standalone、zoneless、CSS、Router、Vitest、非 SSR 和完整测试配置，内层
  `skipInstall: true`；外层只安排一次后续安装，尊重调用者的 `skipInstall`。
- 复用共享依赖/样式接入与地图示例规则；通过实际 bootstrap 和组件元数据定位生成的根文件，再应用根组件、主出口及根测试模板，移除欢迎页及其过时断言。根测试保留真实模板和 RouterOutlet，提供空 Router，不加载地图页面。
- 地图懒加载路由仍为根数组首位，空路径通过 `pathMatch: 'full'`
  重定向至默认或自定义地图地址。保留官方项目名称原值，包括大写和 scoped 名称；目录位置委托官方生成器，支持 workspace 默认根目录和显式
  `projectRoot`。
- 整体使用分支 Tree，所有规则成功后才合并；依赖不兼容、无效参数、重复项目、地图文件冲突和已有资源覆盖均不留下应用、配置或依赖的部分修改。保护已存在的业务文件及二进制静态资源。
- 新增 25 个公开 application 行为测试，初次运行确认尚未实现入口导致 19 项失败，再逐项实现转绿；测试覆盖固定输出、欢迎页与测试替换、首页重定向、自定义参数、名称和目录约定、安装任务及失败回滚。
- 按集成验收反馈补充共享地图测试模板的外部模块显式 mock；保留真实地图模板和组件替身行为断言，避免发布库被测试运行时加载 OpenLayers。新增公开 collection 回归先失败后通过，提交为
  `724a525`。实际独立 Angular CLI 22.2 / Vitest 5.0.4 workspace 执行
  `NG_CLI_ANALYTICS=false pnpm exec ng test schematics-host --watch=false`，2 个文件、3 个测试通过。
- 已通过 `6d908c0` 合入集成分支 `65030b0` 的样式与可变别名安全修复，无冲突保留双方测试。
- 最终验证通过：`NX_DAEMON=false NX_ISOLATE_PLUGINS=false NX_SKIP_NX_CACHE=true pnpm nx run-many -t test,lint,build -p schematics --parallel=1 --output-style=static`（4 个文件、134 个测试）；`pnpm nx format:check --projects=schematics`、改动 TypeScript 的显式 Prettier 检查及
  `git diff --check` 均通过。
- 新应用实际 tarball、消费者生产构建及浏览器验收仍按工单 05 执行；本工单没有将这些后续项目标记为已验证。

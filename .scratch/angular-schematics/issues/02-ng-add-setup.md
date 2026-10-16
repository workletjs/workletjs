# 02：ng add 基础接入

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 01

## What to build

通过 `ng add @workletjs/ngx-openlayers`
选择目标应用、检查依赖并配置 OpenLayers 全局样式，提供默认关闭的地图示例选项。

## Acceptance criteria

- [x] 支持 `project`、`example`、`exampleName`、`route`、`skipInstall`；`example` 使用原生
      `x-prompt`，默认 false，显式值不重复询问，非交互运行默认 false。
- [x] 优先使用显式项目，其次使用 CLI 当前目录项目或唯一应用；歧义时列出候选并报错，不任意选择；非应用或不存在项目明确失败。
- [x] 从本次安装发布包已解析的 peerDependencies 读取版本要求，保留兼容依赖声明及所在依赖区段，仅补齐缺少的 CDK 和 OpenLayers。
- [x] 普通 semver 范围与库要求相容，存在已安装版本时同步检查；非 semver 声明仅在已安装版本可验证时接受，否则提供修复说明。
- [x] 不兼容 Angular、CDK 或 OpenLayers 明确报错，不自动升级、降级或替换现有依赖来源。
- [x] 基础构建样式及显式覆盖样式的 configuration 均接入
      `ol.css`，兼容字符串和对象形式，保留用户样式顺序并去重。
- [x] 现代 unit-test target 通过构建配置继承样式，不写入其不支持的选项。
- [x] 不生成示例时无需 Router 或主路由出口；NgModule 应用可以使用基础安装能力。
- [x] 后续依赖安装只安排一次，`skipInstall` 可跳过该任务；不将 CLI 安装组件库本身误描述为可跳过。
- [x] 在公开 collection 边界测试默认值与显式参数、项目选择、依赖保留与冲突、样式去重和重复执行行为。

## Comments

- 实施依据：[需求设计](../spec.md)。地图示例的文件、路由分析和冲突检查由 03 实现并接入本命令。
- 集成后的命令必须在写入前完成所选行为的必要检查，失败不应留下局部接入结果。

- 2026-10-15：在独立 worktree 和分支 `codex/schematics-02` 领取本工单；基于已完成的 01 提交
  `586fc60`，先保存 claimed，再按公开 collection 边界执行红绿测试。

## Answer

- `ng-add`
  已实现应用选择、发布包 peerDependencies 读取、声明与已安装版本前置检查、缺少依赖补齐、全局样式及 configuration 去重，并保留已有依赖来源与用户样式顺序。
- 原生 schema 提示保持默认 false；测试验证 CLI 当前项目 smart
  default、显式 false 不重复提示及非交互默认值。基础接入不要求 Router 或 standalone。
- 共享接入接口将只读的 `prepareSetup` 与写入的 `applySetup`
  分离，03 可以在任意 Tree 写入前完成地图示例路由和文件检查。安装由外层统一调度，存在新增依赖声明时只创建一次任务，`skipInstall`
  可跳过。
- `example: true`
  在本工单中明确报错而不被忽略，地图示例生成及其前置检查按依赖图交由 03 完成；当前提交不是单独发布节点。
- 新增 30 个公开 collection/schema 行为测试，先观察到占位 factory 的失败，再实现通过；原有 3 个 collection 测试保持通过。新增测试覆盖发布包版本读取、普通和非 semver 声明、已安装版本、冲突前置检查、项目选择、样式对象去重、configuration、幂等和安装任务。
- 验证通过：`NX_DAEMON=false NX_ISOLATE_PLUGINS=false NX_SKIP_NX_CACHE=true pnpm nx run-many -t test,lint,build -p schematics --parallel=1 --output-style=static`（33 个测试通过，lint 无新增 warning）；受改动文件的
  `pnpm exec prettier --check` 与 `git diff --check` 均通过。
- 实现提交：`486a300 feat(schematics): configure ng add dependencies and styles`。
- 独立依赖安装尝试因离线 store 缺少 tarball 失败，随后使用 APFS
  clone 复制集成 worktree 的已安装依赖到本 worktree；未改写主工作区或集成 worktree 的依赖。

- 2026-10-16 后续边界修复：只存在 `inject: false`
  的 OpenLayers 样式对象不再被误认为接入完成。保留非注入对象及其 bundle 选项，同时补齐实际注入的样式；省略
  `inject` 或显式为 true 的既有入口仍参与去重，重复执行保持不变。对名为 `styles`
  的非注入 bundle，使用未占用的独立注入 bundle，避免 Angular 拒绝混合注入标志。
- 新增 7 个公开 collection 样式回归，先观察最初 5 个用例失败，再实现并通过；覆盖默认/自定义非注入 bundle、混合对象和字符串、configuration、幂等及注入 bundle 名称冲突。与别名安全修复合并验证后共 108 个测试通过，`pnpm nx run-many -t test,lint,build -p schematics --parallel=1 --output-style=static`、改动文件 Prettier 和
  `git diff --check` 通过。未改动04或执行消费端与浏览器验收。

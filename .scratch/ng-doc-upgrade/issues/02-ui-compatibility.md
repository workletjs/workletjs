# 02：文档 UI 与导航兼容

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

保留文档自定义首页、侧栏、状态徽标及 URL，使它们兼容 NgDoc 新默认 UI 和响应式行为。

## Acceptance criteria

- [x] 检查官方 22.0 与 22.1 增量说明，实际受影响的 signal/API/CSS 使用已适配。
- [x] 保留分类、状态、默认跳转、锚点、现有路由及图标；断点与新引擎 UI 一致。
- [x] 接受官方新版 UI，清理失效的旧内部样式，必要行为变化有 colocated 回归测试。
- [x] 受影响 docs 单元测试及样式格式检查通过；真实新版浏览器验收交由 04。

## Comments

- 实施依据：[需求设计](../spec.md)。可先在当前测试环境验证项目逻辑，与 01 的构建配置改动隔离。
- 2026-10-13：`codex/ng-doc-ui` 领取，基于集成分支 `codex/ng-doc-upgrade` 的
  `f410a76`。先以既有 UI 测试验证断点行为，再检查目标版本接口与样式。

## Answer

### 官方兼容性审查

- 读取
  [22.1.0 发布源码中的升级说明](https://github.com/ng-doc/ng-doc/blob/d5c7f52549ea6246d433634be3800513b34b06f1/apps/ng-doc/docs/upgrade/upgrade-to-22/index.md)，覆盖 signal 输入/输出、移除 API、自定义 CSS，以及第 8 节的 22.0
  → 22.1 三项变化；与目标 `@ng-doc/app` 发布包的类型声明、样式和 sidebar/navbar 源码交叉核对。
- 项目只通过 Angular 模板绑定 NgDoc 组件，没有 TypeScript 输入赋值、输出 RxJS 管道、查询读取、NgDoc 子类、自定义 type
  controls 或 skeleton；图标的显式尺寸均为支持的 `24`。没有使用移除的 let/pure、zone operator、theme
  token 或 search dialog API。
- 自定义 sidebar 的 `NG_DOC_CONTEXT.navigation`、`NgDocNavigation.children` 与
  `metadata.tags.status`
  契约继续存在；`NG_DOC_ROUTING.title/children`、默认组件跳转、页面定义、锚点及图标无需更改。项目自行渲染 dot/tag 的样式继续作用于自有模板，不按官方默认 sidebar 的内部结构重写。
- 现有公共 CSS 变量继续有效，包括官方保留回退支持的
  `--ng-doc-sidebar-vetical-padding`。项目没有针对 Shiki
  token 内联字体样式的覆盖，没有为示例源码补写双反斜线，也没有 playground
  enum 控件，22.1 增量无需额外改动。

### 改动与验证

- 自定义首页的响应式观察从 `1024px` 改为官方 sidebar overlay 的 `900px` 边界，避免 `901–1024px`
  仍被当作移动端而显示桌面首页侧栏。
- 去掉首页 navbar 的旧 `.has-shadow` 判断及相关滚动过渡，直接通过公共 `--ng-doc-navbar-background`
  变量保留透明首页导航；接受官方新版 navbar hairline 和主题行为。
- 既有 AppComponent 测试新增对 CDK 断点观察契约的回归检查。修改前：12 项中 1 项失败，指出仍使用
  `1024px`；修改后：docs 全部 8 个测试文件、36 项测试通过。
- 命令：`pnpm install --frozen-lockfile`、`NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm exec vitest run --config apps/docs/vite.config.mts`、`NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm nx lint docs`、受影响文件的
  `pnpm exec prettier --check` 与 `git diff --check`。
- 此次单元测试在分支的原 beta 依赖环境执行，验证项目自有逻辑；新版本实际模板编译、搜索/主题/示例及 900px 浏览器边界由 04 在合并 01 后集成验收，不以 mock 单元测试替代。
- 实现提交：`ae60c1c`（`fix(docs): align custom layout with ng-doc 22 sidebar`）。记录完成前已合并集成分支最新提交
  `f410a76`。

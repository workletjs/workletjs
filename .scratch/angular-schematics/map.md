# Angular Schematics 实施图

## Notes

- 需求：[spec.md](spec.md)。集成分支：`codex/schematics`；基线：`499a1d36db25b05ed3382e226fcc960102355834`。
- 本图及工单记录实施顺序，不表示功能已经实现或验收通过。
- 全部实施提交的 scope 为 `schematics`，在独立 worktree 中完成。
- 所有工单初始为 `Status: open`、`Type: task`、`Labels: ready-for-agent`。
- 依赖顺序为 01 → 02 → 03 → 04；05 在前四项完成后执行文档和集成验收。
- 领取最低编号的未阻塞开放工单，开始前改为 `claimed`；完成后填写 Answer 并在本图记录结果。

## Decisions-so-far

- 使用官方 Angular Schematics collection、schema、Rule/Tree、模板及独立编译打包流程。
- 内部 Nx 项目名为 `schematics`，私有包名为
  `@workletjs/schematics`，源码位于仓库 packages 下；不单独发布。
- Schematics 随 `@workletjs/ngx-openlayers` 发布，公开 `ng-add` 和 `application` 两个入口。
- 首版面向 Angular CLI 22.2.x 标准 workspace，不增加 Nx 宿主适配。
- `ng add` 默认只接入依赖与样式，原生确认是否生成地图示例，默认否；非交互行为相同。
- 地图示例默认名为 `map-example`，路由为 `map`，均允许单段小写 kebab-case 自定义。
- 自动示例只接入已有 Router 和主路由出口的 standalone 应用，使用静态分析检查；不能安全处理时明确失败，不覆盖文件。
- 地图应用模板委托官方 application
  schematic，固定 standalone、zoneless、CSS、Router、Vitest，不启用 SSR。
- 自动化测试优先使用公开 collection 到输出 Tree 的行为边界；实际 tarball、生成应用构建和浏览器检查负责交付验收。
- 此处记录的是已确认的设计选择；各项实施结果由对应工单完成后补充。

- [01：内部项目与打包](issues/01-internal-project-and-packaging.md) 已完成：独立 CommonJS
  collection 构建、主库合并打包与缓存依赖、私有发布排除、Node
  collection 测试和根级检查入口已建立；两种主库构建及内部 build/test/lint 验证通过。

- [02：ng add 基础接入](issues/02-ng-add-setup.md)
  已完成：项目选择、发布包版本前置检查、依赖来源保留、样式去重和单次安装任务已实现；共享只读接入计划允许 03 在写入前检查路由与文件。公开 collection/schema 的 33 个测试及内部 build/lint/格式检查通过；显式地图示例由 03 接续实现。

- [03：可路由地图示例](issues/03-routed-map-example.md)
  已完成：可选地图组件、静态路由/根出口前置检查、首位懒加载接入、冲突保护及重复执行保留已实现；共享规则供 04 复用。92 个公开 collection 测试及内部 build/lint/格式检查通过，真实 tarball 与浏览器验收仍由 05 执行。

- [04：地图应用模板](issues/04-application-template.md)
  已完成：委托官方应用生成器并固定现代配置，复用地图与依赖/样式规则，替换欢迎页和测试，加入完整匹配的首页跳转；分支 Tree 保证失败不留部分修改，支持自定义名称、目录和路径。合入共享安全修复后的 134 个 collection 测试及 build/lint/格式检查通过。共享地图测试已在真实 Angular
  CLI 22.2 / Vitest 5 workspace 验证通过，应用 tarball 和浏览器验收由 05 接续。

- [05：文档与集成验收](issues/05-documentation-and-validation.md)
  已完成：三份使用文档和领域词条已同步；仓库全部测试、lint、格式、两种库构建、文档构建及缓存恢复/失效检查通过。3053d19 功能包的实际 CLI 和浏览器证据、截图与日志已汇总至[验收记录](validation.md)。规格仍 open，最终文档合入后的重包及 code-review 由集成负责人继续确认。

## Fog

- 无待用户决定的产品选项。功能包、CLI、浏览器及仓库检查已按验收记录验证；最终文档合入后的重包确认与集成分支 code-review 尚待完成，规格仍保持 open。

## Tickets

- [01：内部项目与打包](issues/01-internal-project-and-packaging.md)，无依赖。
- [02：ng add 基础接入](issues/02-ng-add-setup.md)，依赖 01。
- [03：可路由地图示例](issues/03-routed-map-example.md)，依赖 02。
- [04：地图应用模板](issues/04-application-template.md)，依赖 03。
- [05：文档与集成验收](issues/05-documentation-and-validation.md)，依赖 01、02、03、04。

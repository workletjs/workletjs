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

## Fog

- 无待用户决定的产品选项。运行依赖兼容性、发布包加载和生成应用行为仍需实施期间按工单验证，当前不宣称通过。

## Tickets

- [01：内部项目与打包](issues/01-internal-project-and-packaging.md)，无依赖。
- [02：ng add 基础接入](issues/02-ng-add-setup.md)，依赖 01。
- [03：可路由地图示例](issues/03-routed-map-example.md)，依赖 02。
- [04：地图应用模板](issues/04-application-template.md)，依赖 03。
- [05：文档与集成验收](issues/05-documentation-and-validation.md)，依赖 01、02、03、04。

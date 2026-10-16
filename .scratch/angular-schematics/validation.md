# Angular Schematics 验收记录

本记录区分仓库自动化检查、实际安装包/CLI 和浏览器结果，不把测试夹具中的成功等同于真实发布包成功。

## 检查基线

- 功能集成基线：`3053d19`；文档检查基线：`049a0eb`，分支 `codex/schematics-05`。
- 日期：2026-10-16（Asia/Shanghai）。环境为 Node.js 24.21.0、pnpm 10.34.5。
- 独立 worktree 运行；`NX_DAEMON=false NX_ISOLATE_PLUGINS=false`，回归测试和非缓存验收额外使用
  `NX_SKIP_NX_CACHE=true`。
- 本次没有执行实际 npm 发布、部署或扩大 Angular/OpenLayers
  peer 兼容范围。规格状态由最终 code-review 后统一关闭。

## 仓库自动化检查

| 命令                                                       | 结果                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm test`                                                | 通过：脚本 30 个；组件库 94 文件 / 2366 个；Schematics 4 文件 / 134 个；文档 8 文件 / 36 个测试。 |
| `pnpm lint`                                                | 三个项目均通过；组件库已有两条非空断言 warning，未新增错误。                                      |
| `pnpm format:check`                                        | 通过；根入口包含库、文档、Schematics 三个项目。                                                   |
| `pnpm build`                                               | production 通过；执行内部集合构建、Angular package 及集合合并三个任务。                           |
| `pnpm nx build ngx-openlayers --configuration=development` | 通过；Angular package 明确使用 development/full compilation，集合仍进入主库。                     |
| `pnpm build:docs`                                          | 通过；NgDoc production 构建耗时约 32.4 秒。                                                       |
| `git diff --check`                                         | 通过。                                                                                            |

Schematics 测试从临时发布布局加载编译后的公开 collection，使用解析后的 peer 元数据 fixture，覆盖两条命令的可观察输出、错误及重复执行行为；测试不依赖先构建主库。

### Nx 缓存及发布边界

1. 首次 production 构建为 `0/3` 命中，记录集合全部 35 个文件的 SHA-256。
2. 删除主库及内部集合的两个 dist 输出目录后重跑 `pnpm build`，`3/3`
   命中；35 个文件恢复后逐项字节哈希相同，两条 CommonJS factory 均可加载。
3. development 构建后重跑 production，`3/3` 命中；production 集合哈希恢复为原值。
4. 仅向内部 schema 源文件临时加入无行为注释后构建，`0/3`
   命中，证明内部源码变动使主库重建；随后将源文件逐字节恢复。再次构建为 `3/3`
   命中，集合全部哈希回到原值，源文件没有保留修改。
5. `pnpm nx show projects --affected --files=packages/schematics/ng-add/index.ts --with-target=build`
   返回 `schematics`、`ngx-openlayers`、`docs`。
6. Nx Release 项目集合为 `["*", "!schematics"]`；内部包
   `private: true`，最终主库不依赖私有包。实际 tarball 的依赖和范围另见下节，不以源码清单代替。

仓库检查日志位于
`/private/tmp/schematics-05-{test,lint,format,production,development,docs}.log`。定向缓存日志为
`cache-restore`、`production-after-development`、`cache-invalidation`、`cache-probe-restored`
同名前缀文件；这些是本机临时证据，以上表格保留可复核结论。

## 最终实际安装包与 CLI

实际运行基于功能集成提交 `3053d19` 的 pnpm tarball，非源码 fixture。包路径为本机临时目录中的
`artifacts/04/workletjs-ngx-openlayers-22.0.1.tgz`，SHA-256 为
`8cfdd315558d6cfe0ce64acd14ffdde81522f7288788f1b0207a62132205d89a`。

- [实际包检查报告](evidence/tarball-3053d19.json)：319 个文件，仅公开 ng-add/application，含 JS
  factory、声明、schema、四个地图模板及应用模板、最小 CommonJS 包边界；peer/runtime 范围均已解析，无 catalog 残留或私有包运行依赖。
- 在真实消费者安装该 tarball 后，直接 require 两条 factory 均返回函数。
- 临时消费者使用 Angular CLI/build 22.2.2、Angular runtime/compiler-cli 22.2.3、TypeScript
  6.0.3、Vitest 5.0.4、jsdom 30.1.2。消费者测试未复用仓库 Vitest 4。

| 实际 CLI 场景            | 结果与证据                                                                                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 默认地图应用             | `ng generate @workletjs/ngx-openlayers:application map-app` 成功，统一执行一次安装；完整匹配的首页重定向至 map，地图懒路由在首位。[生成日志](evidence/generate-default.log)                                                     |
| 自定义地图应用           | `ng generate @workletjs/ngx-openlayers:application custom-map --project-root apps/custom-map --example-name world-map --route world --skip-install` 成功，无安装任务。[生成日志](evidence/generate-custom.log)                  |
| 生成应用单元测试         | map-app 和 custom-map 各 2 文件 / 3 个测试通过。[默认应用](evidence/map-app-tests.log)、[自定义应用](evidence/custom-map-tests.log)                                                                                             |
| 生成应用 production 构建 | 两者均通过，各包含独立 369.70 kB 地图懒加载块。[默认应用](evidence/map-app-build.log)、[自定义应用](evidence/custom-map-build.log)                                                                                              |
| 交互默认值               | 另建官方 plain-host 应用，在真实 PTY 省略 example，显示 `Generate a map example? (y/N)`；回车选择否，仅更新样式，无示例目录且 routes 仍为空。                                                                                   |
| 非交互默认值             | 省略 example，完成且无提示或示例目录。[日志](evidence/ngadd-noninteractive.log)                                                                                                                                                 |
| 多应用当前目录选择       | 从 plain-host 目录省略 project、显式 no-example，仅恢复该项目被移除的 OpenLayers 样式；整个 angular.json 与移除前快照语义相同，其他项目保持原样。[日志](evidence/ngadd-current-project.log)                                     |
| 已有应用自定义示例       | plain-host 使用 example、example-name city-map、route city 成功；其测试 2 文件 / 3 个通过，production 构建通过。[生成](evidence/ngadd-custom.log)、[测试](evidence/plain-host-tests.log)、[构建](evidence/plain-host-build.log) |
| 冲突保护                 | 同组件名改用 other 路由，明确报 component-file-conflict；angular.json、package.json、根模板和全部组件文件 SHA 比较未变。[日志](evidence/ngadd-conflict.log)                                                                     |
| 已有默认示例测试         | schematics-host 在浅渲染测试修复后为 2 文件 / 3 个通过。[日志](evidence/host-tests-04.log)                                                                                                                                      |

基础 no-example 的实际依赖补齐、Angular 声明保留、样式去重及重复执行，已在工单 02 的实际包验收通过；默认示例实际重复运行和文件 SHA 不变、已有宿主 production 构建已在工单 03 验证。最终 3053d19 包重新验证了非交互、当前项目、默认/自定义应用、自定义已有示例及失败保护。上表按实际覆盖说明，不把旧产物的步骤冒称为最终 HEAD 重测。

## 最终浏览器验收

浏览器由集成验收通过实际消费者 dev server 检查；非 jsdom 浅渲染结果。

- 默认新应用：访问 `http://127.0.0.1:4208/` 自动进入
  `/map`；OSM 真实瓦片、归属和缩放控件可见。Tab 聚焦 WOL-MAP，DOM 高度 400px、tabindex 为 0；键盘 + 后地图比例和标签变化。[默认地图截图](evidence/default-map-app.jpg)、[键盘缩放后截图](evidence/map-keyboard-zoom.jpg)。
- 自定义新应用：访问 `http://127.0.0.1:4209/` 自动进入 `/world`，刷新 `/world`
  后地图与控件仍可见；截图在瓦片淡入完成后采集。[自定义应用截图](evidence/custom-map-app.jpg)。
- 已有宿主：此前工单 03 在 `/map` 看到真实瓦片、按钮及键盘缩放，原欢迎页保留；`/` 无地图而 `/map`
  有一个地图，结合生产懒加载块证明按路由加载。[已有宿主截图](evidence/existing-host-map.jpg)
  是该阶段采集；最终阶段重新跑过宿主测试，未将此历史截图冒称为重新采集。
- 最终新应用检查未观察到错误。切换浏览器标签时 dev 日志曾出现来自上一 4208
  URL 的零尺寸 warning；实际测量地图 400px 高且可见，无残留渲染问题。

截图已复制到仓库 evidence 目录。OSM 瓦片来自外部服务，本次验收观察到真实地图，并非只出现 canvas 即视为通过。

## 已知边界

- 首版支持 Angular CLI
  22.2.x 标准 workspace；Nx 宿主、NgModule 自动地图示例及复杂动态配置不在支持范围。
- 生成的单元测试采用公开入口的浅渲染隔离，浏览器地图集成由真实生产构建和浏览器检查验证。
- Angular CLI 执行 schematic 前完成的库安装不因后续 Tree 验证失败自动回滚。
- 当前源码仍使用 22.0.1 包版本，新增能力和 peer 升级尚未因此执行发版；历史包依旧遵循自身 peerDependencies。

## 完成状态与后续确认

工单 05 的文档、领域词条、仓库回归及上述功能包/真实 CLI/浏览器证据已齐全。规格暂保留 open，等待集成分支最终 code-review 及其可能修复。

本文档提交后仍需由集成负责人合入文档、重新打包最终产物，并比较已验证 3053d19 的 schematics
runtime 子树，执行实际安装、factory 加载及 CLI 确认。该文档合入后的重包尚未在本记录中宣称通过；最终结果由负责人追加。

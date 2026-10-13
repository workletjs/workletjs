# NgDoc 22.1 升级验收

验收日期：2026-10-13 至 2026-10-14。集成分支：`codex/ng-doc-upgrade`；实现审查范围：
`5cd2d4e...c0cba7e`。需求及实施工单见 [spec](spec.md) 和 [map](map.md)。

## 依赖与官方迁移

- 五个 NgDoc catalog 声明均为 `~22.1.0`，锁文件实际解析均为 `22.1.0`。
- docs 的直接 Vite 声明为 `^8.3.0`，实际使用 `8.3.0`；共享 Angular 测试插件和 Vitest 使用独立的 Vite
  7 上下文。Vitest 4.0.9、Analog 2.8.0 及其他工具约束保持。
- Nx 版本迁移显式指定 `--from=@ng-doc/builder@22.0.0-beta.2`，收集并执行唯一迁移
  `vite-engine-note-v22`。官方引擎 schematic 先 dry-run，再迁移 docs，跳过自动安装。
- 原样 schematic 结果保存在 `f0b5ea5`，后续手动调整另有提交。
  [迁移报告](../../.ng-doc-migration/docs/report.md)、`state.json`
  和备份均保留；state 与 backup 未改写。新旧引擎使用隔离生成目录。
- 新扫描范围为指南与组件库两个根，避免扫描依赖、临时目录和其他 worktree。

## 工作区检查

除冻结安装外，Nx 命令统一使用
`NX_DAEMON=false NX_ISOLATE_PLUGINS=false`。这些环境变量避开受限环境中的进程/socket 问题，不改变项目构建配置。

| 命令                                       | 结果                                                      |
| ------------------------------------------ | --------------------------------------------------------- |
| `pnpm install --frozen-lockfile`           | 成功；各实现 worktree 及回退副本也通过冻结安装            |
| `pnpm test`                                | 脚本 30/30，失败和跳过均为 0；库与 docs 的 Nx test 均成功 |
| `pnpm lint`                                | 库与 docs 均成功                                          |
| `pnpm format:check`                        | 使用上述 Nx 环境变量重试后退出码 0                        |
| `pnpm build`                               | 组件库生产构建成功，公开 API 和版本未修改                 |
| `pnpm build:docs`                          | 新引擎根路径生产构建成功                                  |
| `pnpm build:docs-preview`                  | 新引擎 preview 生产构建成功                               |
| `DOCS_BASE_HREF=/v22.0.1/ pnpm build:docs` | 新引擎版本子路径生产构建成功                              |
| `pnpm nx run docs:build-legacy`            | 旧引擎生产构建成功                                        |
| Commitlint、`git diff --check`             | 实现提交及集成改动通过                                    |

依赖上下文回归先出现 2 项失败，修复后 4 项全绿；部署回归先出现 4 项失败，修复后 10 项全绿并纳入根脚本测试。响应式行为更新了 colocated 单元测试。

测试汇总日志采用 Nx
terse 输出，不能据此推导库与 docs 的 Vitest 用例总数。首次格式检查日志只有 socket 错误及 fallback；格式成功依据带 Nx 环境变量的后续命令退出码。

## 文档与部署产物

- 导航与 beta 基线逐项比较：87 页、8 分类；标题、路由、顺序和状态一致，包括 82 个 NEW 和 3 个 EXPERIMENTAL。95 个页级实体包含这 8 个分类。
- 105 个注册示例与 83 处 API 渲染保留；代表性页面实际渲染结合下述浏览器检查。
- Map
  API 在 beta、新版 legacy 和新版 Vite 中均为同一组 29 个公开属性，保留 InputSignal、OutputEmitterRef、ModelSignal、类型及注释，未新增内部成员。
- `wolTargetChange`、`wolViewChange`
  是 Angular 为 model 生成的隐式输出，原站点也没有独立 TypeScript 属性行。构建出的 Angular 元数据仍包含两个输出映射，不能把没有单独 API 行误判为输出丢失。
- 根、preview、版本产物的 base 分别为
  `/`、`/preview/`、`/v22.0.1/`，逐一检查 16 个本地 JS/CSS 引用的路径和磁盘文件。搜索及源码资源随对应 base 加载。
- PR Checks 在组件库之后构建 docs；preview 与版本部署使用
  `DOCS_BASE_HREF`。docs 的 Nx 构建缓存保持关闭，Pages SPA fallback 保留。

## 浏览器验收

使用真实生产产物、本地 SPA fallback 服务及 Codex 内置浏览器，验证以下行为：

- 首页与 Get Started 跳转正常；自定义侧栏分类折叠、当前路由及 NEW / EXPERIMENTAL 徽标保留。
- 根路径 Map 页面及 `/preview/components/general/map`、 `/v22.0.1/components/general/map`
  均能实际渲染；子路径直接打开及刷新后仍能显示 Map。
- 搜索 Map 返回 3 个指南结果，Draw 返回 5 个结果，Getting
  Started 返回 5 个结果；搜索结果跳转正常。指南的 npm/yarn/pnpm 分组可切换，文件名、Angular 图标、高亮代码和 diff 保留。
- Light → Dark → Auto → Light 主题切换正常；dark 的 DOM 主题属性已确认。
- 901px 首页不显示移动导航按钮，900px 和 899px 显示；899px 可打开侧栏，选择指南后自动收起。临时 viewport
  override 已复位。
- OSM Map 可渲染及缩放，示例 Preview / TypeScript 面板可切换，新版示例工具栏正常。
- Draw 的 Material 下拉框由 Point 切换到 Polygon 后展示正确选中值，OSM 地图正常渲染。
- WebGLTileLayer 示例初始化 4 个非零尺寸 canvas，首个地图可渲染及缩放。
- 上述代表性页面和开发更新过程中未捕获到 JavaScript
  error。既有外部地图服务的 key 限制不作为本次升级回归，OSM 与 WebGL 代表性渲染有截图证据。

复制相关验收有明确边界：Map 示例提供给复制组件的解码源码与原 TS 的 `trimEnd()` 一致，Simple Map
765 字符、Accessible Map 1828 字符。浏览器可触发 Copy
code，未出现 JS 错误；内置浏览器的 clipboard 读取仍为空，无法证明系统剪贴板写入成功。没有为此修改第三方复制实现。现有示例没有反斜线源码，因此在 HMR 验证中临时加入
`/\s+/`；高亮解码源码与临时 TS 完全一致（802 字符），随后恢复原文件，最终没有增加示例属性。

截图：

- [Map 地图与工具栏](screenshots/map-demo-root.jpg)
- [Draw Material 表单](screenshots/draw-material.jpg)
- [WebGLTileLayer 与状态徽标](screenshots/webgl-tile.jpg)
- [899px 移动导航](screenshots/mobile-navigation.jpg)

## 开发更新、缓存与回退

- 新默认服务：`pnpm nx serve docs --port=4193 --host=127.0.0.1 --output-style=static`。驻留 Getting
  Started 页面，临时追加 Markdown 标记，无需手动刷新即可显示；还原后标记消失。驻留 Map 页面，修改示例模板标记，无需手动刷新即可显示新值；还原后消失。源文件最终与测试前副本一致。
- 独立回退副本在 `c0cba7e` 冻结安装；新引擎冷构建成功，暖构建 0
  rebuilt、1049 文件 unchanged。冷暖站点内容可用。bundle chunk
  hash 可以变化，没有声称字节一致或建立性能门槛。
- 新引擎 → 旧引擎构建/服务 → 新引擎构建均成功，生成目录没有输出所有权冲突。
- 临时副本执行已安装官方 collection 的 `migrate-to-vite --project docs --revert --skip-install`
  成功：恢复原 build/serve，移除 legacy 目标名，恢复 extract-i18n 指向；手改 Vite 配置按官方规则保留，旧目标不加载它。
- 回退后的 `pnpm build:docs` 使用旧引擎成功；旧服务首页及合法指南深链返回含 app-root 的 HTML。HTTP
  200 单独不证明 Angular 页面渲染，生产深链的实际渲染见浏览器验收。
- 旧引擎仍执行原 budgets：初始 bundle
  2.09MB 超过 2MB 警告，未达到 10MB 错误阈值。新引擎不执行 Angular budgets 是规格接受的差异。
- 官方回退只恢复引擎；完整升级需通过 Git 回退。README 与报告已记录这一边界。

## Standards 审查

独立审查 `5cd2d4e...c0cba7e`，核对 AGENTS、issue-tracker、domain 规范与提交记录： **0
findings**。原始回退状态、聚焦提交、测试转导出接口及工单记录符合仓库约定。

## Spec 审查

独立审查同一固定范围，核对本规格、工单、目标版本官方说明及已安装接口： **0
findings**。未发现需求缺漏、范围扩展或错误实现；最终浏览器验证由本记录补齐。

## 提交记录

| 提交                 | 内容                                       |
| -------------------- | ------------------------------------------ |
| `f410a76`            | 需求、任务图与实施工单                     |
| `ae60c1c`、`f1221dd` | 新版 sidebar / navbar 兼容、测试及 UI 审计 |
| `c665ffd`            | NgDoc 依赖升级、构建与测试 Vite 隔离       |
| `f0b5ea5`            | 官方 Vite 引擎迁移原始结果与回退快照       |
| `87a74c9`            | 新引擎扫描范围、legacy 兼容及引擎工单结论  |
| `bb5b2d6`            | 子路径、CI 及部署回归                      |
| `c0cba7e`            | 部署、引擎回退操作说明                     |

最终验收及工单关闭记录独立提交。保留集成 worktree；实现者与回退演练 worktree 清理。未发布 npm 包或部署站点。

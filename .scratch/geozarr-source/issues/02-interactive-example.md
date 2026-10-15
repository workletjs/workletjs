# 02：GeoZarr 完整交互示例及竞态测试

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 01

## What to build

按[需求设计](../spec.md)以新组件复现官方两个预设场景、Custom
URL、Load、OSM、RGB 样式和 View 配置，处理失败、同 URL 重试和过期结果。

## Acceptance criteria

- [x] 单项 keyed @for 按加载 ID 重建整个地图，控件遵循现有 Material 风格。
- [x] 仅在 ready 后解析视图，使用具体 View，旧尝试与销毁后的回调无效。
- [x] 用户操作、初始化失败、瓦片失败、视图失败和异步竞态有回归测试。
- [x] 先运行失败测试，再实现并使相关测试、ESLint、格式检查通过。

## Comments

- 基于已合并 01 的集成分支实施；提交使用 geozarr-source scope，完成前合并集成分支 tip。

## Answer

- 新增 WolGeoZarrSourceExampleComponent 与 examples 导出，使用 Material Scene 选择、Custom
  URL 输入和 Load；首次自动加载 Krasnokuts'k 预设，选择与输入保留草稿，空白 URL 禁止加载，应用 URL 时去除首尾空白。
- 每次 Load 按递增 ID 重建整个地图及两个 WebGLTile 图层，支持同 URL 重试并重置视图、元数据状态和瓦片失败提示；使用 OSM、b04/b03/b02、0..0.5
  → 0..255 RGB 拉伸及 gamma 1.5。
- wolChange/getState 跟踪初始化，仅在 ready 后启动一次官方 View 变换链，并将具体 View 传给地图；加载 ID、当前组件、实例身份、销毁状态与 source
  state 共同阻止旧回调生效。
- 元数据、视图解析和瓦片失败分别反馈，不依赖 wolError、私有字段或测试专用公开 API。
- 已先写 12 项公开组件/控件行为测试，并运行失败基线（示例尚未实现，导入解析失败），再实现；测试覆盖场景和 Custom 草稿、空地址、重试、视图变换、三个失败阶段、旧成功/失败及销毁回调。
- 验证通过：NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm nx test
  ngx-openlayers（94 个文件、2341 个测试，包括 12 个新增示例测试）、同环境的 pnpm nx lint
  ngx-openlayers、受影响示例文件的 Prettier 检查和 git diff --check。
- 测试中仅替换远端 GeoZarr 初始化/视图解析，使用真实地图、Source 组件与事件。Material 场景选项通过可见 role=option 点击；jsdom 对 CDK
  @layer 样式输出非致命解析警告，完整测试通过。Lint 保留现有 vector-tile 测试的两个警告，无新增警告。
- 正式/preview 文档构建与真实浏览器交互、WebGL 渲染由 04 在集成后验收。

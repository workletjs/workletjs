# 03：NgDoc 页面与使用说明

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

按[需求设计](../spec.md)新增 Sources 分类中的 GeoZarr 页面、API 与演示注册，说明公开接口、初始化语义、维度更新和原生错误边界。

## Acceptance criteria

- [x] 页面注册一个 WolGeoZarrSourceExampleComponent，路由 geozarr。
- [x] 使用 EXPERIMENTAL、不使用 NEW，并说明上游实验接口。
- [x] 导入、输入输出、宿主、重新挂载、维度更新及初始化错误说明齐全。
- [x] 格式检查通过，正式与 preview 构建由 04 集中验收。

## Comments

- 可与 01 并行编写，演示实现由 02 提供；提交使用 geozarr-source scope，完成前合并集成分支 tip。

- 2026-10-15：按用户后续反馈，将 Imports and hosts、Inputs、Instance access and non-spatial
  dimensions、Events and initialization state 合并为 Usage
  notes，删除重复的手写 API 表格及基础导入/模板示例，与其它 Source 页保持短说明、示例、自动 API 的组织方式。

## Answer

- 新增 Sources/GeoZarr 的 NgDoc 页面，路由为 geozarr，注册 WolGeoZarrSourceExampleComponent，并使用 EXPERIMENTAL 状态，不添加 NEW。
- 使用说明涵盖独立入口与模块、必填及可选构造输入、可更新的归属和属性、四种宿主、getInstance、显式重新挂载、非空间维度整数索引更新及六个原生事件。
- 明确区分初始化失败和瓦片失败，说明 change/getState、getView
  pending 边界、视图设置责任及旧异步结果处理；演示描述与已确认的官方场景、RGB 样式和 Load 行为一致。
- 验证通过：受影响文件的 Prettier 检查、git diff --check，以及 NX_DAEMON=false
  NX_ISOLATE_PLUGINS=false pnpm nx lint ngx-openlayers。
- 该工单只改文档注册与说明，无运行时行为变化，不新增镜像测试。完整 API/演示解析及正式和 preview 文档构建由 04 在 01、02、03 集成后集中验收。

- 后续文档精简复核：正文从 158 行缩为 67 行，保留初始化输入、维度更新及异步错误语义；接口明细由 NgDoc
  API 展示。受影响 Markdown 的 Prettier 检查、git diff --check 和 pnpm
  build:docs-preview 通过；真实浏览器确认新目录、示例及自动 API 正常，控制台 warn/error 为空。此轮没有运行时行为改动，未重复组件测试。截图见[优化后的页面](../evidence/docs-usage-notes.jpg)。

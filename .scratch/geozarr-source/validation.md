# GeoZarr Source 集成验收记录

验收日期：2026-10-15（Asia/Shanghai）。需求：[spec.md](spec.md)。

验收对象为集成提交 `75f3d2e58b85830b5ee9a87f3abad9aa50859068`。自动检查与产物快照在独立分支
`codex/geozarr-source-validation`、managed worktree
`/Users/chao/.codex/worktrees/geozarr-source-validation/workletjs` 中完成。集成分支为
`codex/geozarr-source`。使用已安装的 Node 24.21.0、pnpm 10.34.5 与 OpenLayers
10.11.0；通过忽略的 node_modules 符号链接复用原工作区依赖，没有更新依赖清单、锁文件、版本或源代码。

自动检查完成后，提交 `878c296`
仅修正工单关闭摘要位置并保留原始审查报告；运行时与验收对象相同。以下分别记录自动检查、真实数据读取、浏览器操作和两轴审查，避免将其中一类证据替代另一类。全部验收与两轴审查均已完成，工单与需求按本地 issue
tracker 约定关闭。

## 自动检查

以下六条要求的命令均实际执行，退出码为 0。所有 Nx 测试、lint 和构建输出均记录
`Cache: Skipped (--skip-nx-cache)`。

```sh
export NX_DAEMON=false
export NX_ISOLATE_PLUGINS=false
export NX_SKIP_NX_CACHE=true

pnpm test
pnpm lint
pnpm format:check
pnpm build
pnpm build:docs
pnpm build:docs-preview
```

| 检查             | 实测结果                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| 脚本测试         | 30 项通过，0 失败                                                       |
| 组件库测试       | 94 套、2341 项通过，包含 18 项 GeoZarr 组件测试与 12 项示例测试         |
| 文档应用测试     | 8 套、36 项通过                                                         |
| 全量 lint        | 库及文档应用均通过；库保留既有 VectorTile source 测试的两条非空断言警告 |
| 格式检查         | 通过，退出码 0                                                          |
| 组件库构建       | 通过，11.4 秒                                                           |
| 正式文档构建     | 通过，35.0 秒                                                           |
| preview 文档构建 | 通过，14.3 秒                                                           |

测试数量取自本次实际执行的输出，合计 2407 项。命令日志位于
`/private/tmp/geozarr-source-{test,lint,format-check,build-validation,build-docs,build-docs-preview}.log`。Nx 默认精简输出之外的实际任务输出另存为
`/private/tmp/geozarr-source-{test-library-output,test-docs-output,lint-library-output,build-library-output,build-docs-output,build-docs-preview-output}.log`。

非阻断提示：既有库测试输出包含 jsdom 外部请求失败的诊断，所有断言仍通过；正式和 preview 文档构建提示部分压缩 chunk 超过 500
kB。没有据此将网络请求或浏览器渲染计为通过。

组件实施阶段额外尝试的独立 tsc
spec 检查仍报告既有控制器、image、interaction 等测试类型错误，GeoZarr 文件无类型诊断；正式库构建与既有 Vitest 入口已通过。本次没有扩大为既有测试的整体类型清理。

## 库入口与生成文档

真实库构建产物保留版本 `22.0.1`，包含 95 项 exports。新增 `./source/geozarr`
的 runtime 和 types 目标文件均存在，两者均导出 `WolGeoZarrSourceComponent` 和
`WolGeoZarrSourceModule`。

| 导出    | 真实构建目标                                           |
| ------- | ------------------------------------------------------ |
| types   | `types/workletjs-ngx-openlayers-source-geozarr.d.ts`   |
| default | `fesm2022/workletjs-ngx-openlayers-source-geozarr.mjs` |

结构化验证结果：`/private/tmp/geozarr-source-library-validation.json`。本次检查的是组件库构建产物，不执行发布或部署。

每次文档构建成功后，立即将浏览器产物、当次 context 和 GeoZarr 生成内容分别保存，避免下一次构建覆盖证据。

| 产物    | 浏览器快照                               | HTML base   | GeoZarr 页面                          |
| ------- | ---------------------------------------- | ----------- | ------------------------------------- |
| 正式    | `/private/tmp/geozarr-source-production` | `/`         | `/components/sources/geozarr`         |
| preview | `/private/tmp/geozarr-source-preview`    | `/preview/` | `/preview/components/sources/geozarr` |

Context 保存在
`/private/tmp/geozarr-source-{production,preview}-context.ts`，GeoZarr 正文、API 与演示生成内容保存在
`/private/tmp/geozarr-source-{production,preview}-generated`。

两份真实生成导航均有 96 个实体、88 个页面、0 个 NEW、4 个 EXPERIMENTAL。GeoZarr 位于 Sources，路由为
`/components/sources/geozarr`、非隐藏，状态仅为
`:warning EXPERIMENTAL`。两份生成正文包含公开接口、必填 URL、非空间维度、瓦片失败输出和
`WolGeoZarrSourceExampleComponent`；演示资源已注册。

导航扁平化记录位于
`/private/tmp/geozarr-source-{production,preview}-navigation.json`，对应导航、状态、base、正文与演示注册断言位于
`/private/tmp/geozarr-source-navigation-validation.json`。

## 真实数据读取

独立网络检查针对需求中固定的两个 Sentinel-2
L2A 预设地址执行，未改变 URL 或添加替代数据。初次 sandbox 请求因无法访问本机代理失败；获准联网后，两个
`/zarr.json` 均返回 HTTP
200，允许跨域且支持 Range 请求。这是本地网络边界，不是远端数据不存在的证据。

使用真实 OpenLayers
10.11.0 的公开 API，两份源均从 loading 进入 ready，getView 经官方 helper 链解析成功。Krasnokuts'k 采用 EPSG:32636，中心
`[654900, 5545140]`；Hvolsvöllur 采用 EPSG:32627，中心 `[554880, 7045140]`；均按需求以 zoom 2 配置。

两份源的公开 coarse tile 读取均进入 LOADED：尺寸
`[152, 152]`，Float32Array 共 92416 项，全部有限，RGB 波段和上游 alpha 一并成功解码；分片请求返回 HTTP
206 和有效 Content-Range，没有数据源初始化或瓦片解码失败。

原始元数据保存在
`/private/tmp/geozarr-{krasnokutsk,hvolsvollur}-zarr.json`；完整公开方法与 HTTP 检查记录为
[真实数据验证原始记录](evidence/dataset-verification.md)。原始记录保留数据检查结束时的待办说明；后续浏览器结果见下节。这些 HTTP 与公开 API 结果证明真实数据读取，不单独替代浏览器 WebGL 验收。

## 浏览器与两轴审查

生产文档产物以本地静态服务运行，在真实浏览器通过 Sources 导航打开 GeoZarr，页面具有 EXPERIMENTAL 状态且没有 NEW 标签。根代理已目视确认两个预设的实际 RGB 影像、平移缩放和下列操作；截图已从临时目录复制到本 feature 的 evidence 目录，随提交保留。

| 操作          | 观察结果                                                           | 截图                                              |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| 首次打开      | 自动加载 Krasnokuts'k，显示真实影像与底图                          | [首个预设](evidence/production-first.jpg)         |
| 编辑草稿      | 更换待加载选项后，当前已加载影像仍保留，等待 Load                  | [待加载选项](evidence/production-draft.jpg)       |
| 平移和缩放    | 地图交互正常，影像随视图更新                                       | [交互后的视图](evidence/production-pan-zoom.jpg)  |
| 第二预设      | Load 后显示 Hvolsvöllur 的真实影像                                 | [第二预设](evidence/production-second.jpg)        |
| Custom 与重试 | 自定义有效预设 URL 可加载，空白 URL 禁止 Load，相同 URL 可再次加载 | [Custom 加载](evidence/production-custom.jpg)     |
| 初始化失败    | 本地 malformed metadata 返回后显示数据集失败提示                   | [初始化失败](evidence/production-error.jpg)       |
| 失败后恢复    | 再次 Load 有效数据恢复影像与状态                                   | [恢复后的影像](evidence/production-recovered.jpg) |

上述场景根代理检查的控制台未出现 error。

preview 使用新浏览器标签直接打开 `http://127.0.0.1:4318/preview/components/sources/geozarr`
并刷新同一深链接，确认 HTML base 为 `/preview/`、GeoZarr 导航 href 为
`/preview/components/sources/geozarr`；显示首个预设的真实 RGB 影像与 Dataset
ready。该检查控制台 warn/error 均为空，截图为 [preview 深链接刷新](evidence/preview-reload.jpg)。

瓦片失败使用独立 localhost fixture 服务 `http://127.0.0.1:4319`：所有 `/zarr.json`
请求返回真实 Krasnokuts'k 元数据 HTTP 200，其余 GET 与全部 HEAD 返回 HTTP
503。preview 示例通过 Custom URL `http://127.0.0.1:4319/store.zarr/measurements/reflectance`
加载后，同时显示 “Dataset ready.” 和 “Some image tiles could not be loaded. Try Load
again.”，OSM 底图仍保留，证明初始化成功与瓦片失败可以分别反馈。服务 HTTP 日志进一步确认元数据 GET 返回 200，r360m 的 b04、b03、b02 分片 HEAD 均返回 503。截图为
[瓦片独立失败提示](evidence/preview-tile-error.jpg)。验收完成后，演示已切回真实 Hvolsvöllur 数据。

[浏览器控制台记录](evidence/browser-console.json)
中，成功场景和本次瓦片失败场景的 warn/error 记录均为空。先前使用空 chunk HTTP
404 的尝试符合上游 sparse 数据行为，不能作为瓦片失败证据；本次正式验收以 HTTP
503 触发的独立提示为准。

检查中途工具会话停止曾导致本地静态服务断开，产生 ERR_CONNECTION_REFUSED；重启相同的仅 localhost 服务后完成检查，没有修改仓库或使用替代页面。所有浏览器检查均已完成，没有因工具或外部服务限制而跳过的验收项。

静态审查范围为固定基线 `bbf83cef2c36c4ddd629fe2e6a701ae53ed8e771` 至集成提交
`75f3d2e58b85830b5ee9a87f3abad9aa50859068`。

- Standards 原审查有 1 项 P3：工单关闭摘要在 Completed work 而非要求的 Decisions-so-far。提交
  `878c296`
  已移动 01、02、03 的摘要与链接，并移除旧章节；不涉及运行时改动。原审查者已复核该提交，确认 P3 解决，剩余 Standards 发现为 0。
- Spec 静态审查 0 项；该报告形成时浏览器验证尚待完成，后续浏览器结果独立记录于本节。
- 原始审查报告按原文保存在 [Standards](reviews/standards-original.txt) 与
  [Spec](reviews/spec-original.txt)，未覆盖或修改原始结果；[Standards 复核](reviews/standards-recheck.txt)
  单独保留。

## 提交记录与收尾

所有集成提交均使用 `geozarr-source` scope。基线至验收对象的依赖清单、锁文件与包版本 diff 为空。

| 提交                            | 内容                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `3e6e931`                       | 需求设计、实施图与工单依赖图                              |
| `d5dea9a`                       | GeoZarr 页面与接口、生命周期用法说明                      |
| `e77c9f5`                       | 完整 GeoZarr 组件、入口、NgModule 与 18 个公开行为测试    |
| `f46c1f7`                       | 组件工单关闭与 red/green 验证记录                         |
| `42d6b0f`                       | 完整交互示例与 12 项用户操作、异步竞态测试                |
| `d848290`、`f459016`、`75f3d2e` | 各实施分支整合和工单图更新                                |
| `878c296`                       | 工单关闭摘要归入 Decisions-so-far，并保留两轴原始审查报告 |

01、02、03、04 及需求均已 resolved；本记录和持久截图随最终验收文档提交交付。验收 worktree 的清理由根代理在成果合入后执行。集成分支保留，不发版、不部署、不创建 PR。

# GeoZarr Source 组件需求设计

Status: resolved

Type: task

Labels: ready-for-agent

## Problem Statement

组件库使用者希望以现有 Angular 地图组件的组合方式接入 GeoZarr 数据源，显示遥感影像或其他地理栅格数据，而无需自行完成 OpenLayers 数据源创建、宿主绑定、事件转发和组件销毁清理。

OpenLayers 10.9 已提供 GeoZarr，但组件库尚未提供对应的 Source 组件。仓库当前已使用 OpenLayers
`~10.11.0`，该版本进一步提供请求配置、非空间维度选择和单变量数据立方体等能力。因此，新组件应覆盖当前依赖支持的完整构造接口，而不是只封装最初的 10.9 接口。

GeoZarr 数据源包含异步元数据加载，且构造配置和运行时更新的能力不同。如果 Angular 输入暗示了上游不支持的更新能力，或者示例只监听原生 error 事件，使用者可能遇到输入变化不生效、初始化失败没有提示、旧加载结果覆盖新场景等问题。

使用者还需要一个参考 OpenLayers 官方 GeoZarr 示例的可运行演示，理解真实数据地址、RGB 波段组合、显示样式、视图配置以及切换数据集的正确方式。

## Solution

新增与现有 Source 组件一致的完整薄封装，覆盖 OpenLayers 10.11
GeoZarr 构造选项，提供标准事件、公开实例访问和现有 DataTile 宿主绑定。数据解析、校验和未指定选项的默认值由 OpenLayers 处理。

明确区分初始化输入和可更新输入：attributions 与 properties 随输入变化更新；GeoZarr 构造输入仅在实例创建时读取。需要切换数据源时，由宿主显式重新挂载组件；非空间维度的动态索引选择通过公开实例的上游方法完成。

交付一个 NgDoc
API 页面和一个完整交互示例。示例采用官方的两个预设场景、自定义 URL、Load 按钮、OSM 底图、RGB 样式和视图配置，并正确处理重试、加载失败及异步结果过期。通过组件公开行为测试、示例交互测试、构建产物检查和真实浏览器验收，验证组件与文档可用。

## User Stories

1. 作为组件库使用者，我希望以 Angular Source 组件接入 GeoZarr 数据源，以便沿用现有地图组合方式。
2. 作为组件库使用者，我希望从独立的 GeoZarr 入口导入组件，以便按功能使用组件库。
3. 作为组件库使用者，我希望既能直接导入组件，也能使用对应 NgModule，以便适配现有应用的组织方式。
4. 作为组件库使用者，我希望组件 selector、输入、输出和模板引用遵循现有命名约定，以便保持模板一致。
5. 作为组件库使用者，我希望新组件覆盖 OpenLayers 10.11 的构造接口，以便使用仓库当前支持的能力。
6. 作为组件库使用者，我希望 URL 是明确的必填输入，以便在编写模板时发现缺失的数据源地址。
7. 作为组件库使用者，我希望能按波段名称选择数据，以便组合所需的栅格测量值。
8. 作为组件库使用者，我希望能指定来自不同 group 的波段，以便使用上游支持的多 group 数据布局。
9. 作为组件库使用者，我希望能选择单个多维变量，以便使用将多个波段存放在同一数组中的数据立方体。
10. 作为组件库使用者，我希望能用索引、标签及上游支持的数组配置非空间维度，以便确定初始化时的数据选择。
11. 作为组件库使用者，我希望能提供请求 headers 和 credentials 配置，以便访问需要相应请求配置的数据存储。
12. 作为组件库使用者，我希望能指定源投影，以便处理需要显式投影配置的数据。
13. 作为组件库使用者，我希望未指定投影时由上游读取元数据，以便减少不必要的配置。
14. 作为组件库使用者，我希望能设置 opacity transition 和 wrapX，以便控制栅格显示行为。
15. 作为组件库使用者，我希望能选择 resample 方法，以便使用上游支持的分辨率重采样方式。
16. 作为组件库使用者，我希望能提供 extent 和 flipY 回退配置，以便读取缺少相应元数据的数据存储。
17. 作为组件库使用者，我希望未指定的可选输入保留上游默认语义，以便组件和直接使用 OpenLayers 的行为一致。
18. 作为组件库使用者，我希望能配置和更新 attributions，以便显示正确的数据归属信息。
19. 作为组件库使用者，我希望能配置和更新 properties，以便附加应用需要的属性。
20. 作为组件库使用者，我希望构造输入变化不会自动替换已有实例，以便保持已获取实例的身份稳定。
21. 作为组件库使用者，我希望文档明确初始化输入的更新限制，以便选择正确的数据源切换方式。
22. 作为组件库使用者，我希望重新挂载组件能采用新的构造配置，以便显式切换数据源。
23. 作为组件库使用者，我希望能取得底层 GeoZarr 实例，以便调用上游公开方法。
24. 作为组件库使用者，我希望能读取非空间维度和坐标值，以便在应用中建立时间等维度的选择界面。
25. 作为组件库使用者，我希望能通过实例方法更新非空间维度的整数索引，以便在保持同一实例时切换数据切片。
26. 作为组件库使用者，我希望构造维度配置与运行时索引更新的类型差异得到说明，以便避免误传标签或数组。
27. 作为组件库使用者，我希望能接收 change、error 和 propertychange 原生事件，以便跟踪数据源变化。
28. 作为组件库使用者，我希望能接收瓦片加载开始、结束和失败事件，以便显示加载反馈。
29. 作为组件库使用者，我希望输出保留原始 OpenLayers 事件载荷，以便使用熟悉的事件接口。
30. 作为组件库使用者，我希望文档说明初始化失败通过 change 和 state 表达，以便不会只等待原生 error 事件。
31. 作为组件库使用者，我希望能在 WebGLTile、Tile、Flow 和 Raster 宿主中注册数据源，以便沿用已有 DataTile 组合方式。
32. 作为组件库使用者，我希望缺少兼容宿主时得到明确错误，以便及时修正组件组合。
33. 作为组件库使用者，我希望组件销毁时移除宿主绑定和事件监听，以便后续操作不再引用已移除的组件。
34. 作为组件库使用者，我希望组件在延迟挂载前被销毁也不会重新绑定，以便安全地使用 Angular 控制流。
35. 作为组件库使用者，我希望初始化前和销毁后实例访问返回 undefined，以便识别组件生命周期边界。
36. 作为文档读者，我希望查看一个可运行的真实 GeoZarr 示例，以便理解组件的完整用法。
37. 作为文档读者，我希望示例首次打开时自动加载第一个预设场景，以便直接看到影像。
38. 作为文档读者，我希望能在两个官方预设场景之间选择，以便体验不同数据集。
39. 作为文档读者，我希望选择 Custom 后能填写自己的 URL，以便尝试兼容的数据存储。
40. 作为文档读者，我希望编辑选项后点击 Load 才加载，以便在准备地址时避免反复重建地图。
41. 作为文档读者，我希望空白 URL 不能触发加载，以便避免无效操作。
42. 作为文档读者，我希望每次 Load 都重建地图并复位视图，以便与官方示例的场景切换行为一致。
43. 作为文档读者，我希望相同 URL 也能再次 Load，以便重试失败的请求。
44. 作为文档读者，我希望示例显示 OSM 底图和正确的真彩色影像，以便理解数据源和显示样式的组合。
45. 作为文档读者，我希望示例采用官方 RGB 拉伸和 gamma 配置，以便得到可比较的影像效果。
46. 作为文档读者，我希望视图根据数据源元数据配置，以便定位和缩放到所选场景。
47. 作为文档读者，我希望看到元数据加载状态和初始化失败提示，以便判断当前加载是否完成或需要重试。
48. 作为文档读者，我希望瓦片加载失败得到独立提示，以便区分元数据初始化与影像读取阶段。
49. 作为文档读者，我希望快速切换场景时旧请求不会覆盖新视图和状态，以便始终看到当前选择的结果。
50. 作为文档读者，我希望离开示例后异步回调不再更新已销毁的界面，以便正常浏览其他页面。
51. 作为文档读者，我希望页面标示 EXPERIMENTAL，以便知道 GeoZarr 上游接口尚未属于稳定 API。
52. 作为文档维护者，我希望新页面不添加 NEW 标签，以便遵循已确认的组件文档状态约定。
53. 作为文档读者，我希望页面包含导入方式、API、初始化限制及维度更新用法，以便正确集成组件。
54. 作为贡献者，我希望共享术语明确区分数据源、波段、颜色通道和非空间维度，以便讨论与文档保持一致。
55. 作为测试维护者，我希望通过公开接口和用户操作验证行为，以便避免测试绑定不必要的实现细节。
56. 作为测试维护者，我希望复用现有 Source 测试边界并隔离真实网络，以便获得稳定、可复现的单元测试。
57. 作为审查者，我希望真实浏览器验证远端数据和 WebGL 渲染，以便补足 jsdom 测试的覆盖边界。
58. 作为贡献者，我希望库及正式和 preview 文档构建通过，以便新增入口与示例能够交付。
59. 作为审查者，我希望检查构建产物的入口、导出和验证记录，以便判断功能是否满足需求。
60. 作为审查者，我希望外部服务限制如实记录，以便区分未完成的验证和已通过的检查。
61. 作为维护者，我希望保持现有依赖、包版本和其他组件行为，以便控制本次功能范围。
62. 作为后续实施者，我希望已确认的设计以 ready-for-agent 需求保存，以便直接实施而无需重复采访。

## Implementation Decisions

- 目标为当前 OpenLayers
  10.11 的完整 GeoZarr 构造接口。10.9 链接是功能已经存在的依据，不是本次封装范围或兼容版本承诺。保持现有
  `ol` 范围、锁文件、工具链和 workspace 包版本。
- 新增独立 secondary entry point `@workletjs/ngx-openlayers/source/geozarr`，公开导出
  `WolGeoZarrSourceComponent` 和
  `WolGeoZarrSourceModule`，保持现有入口组织和打包约定。组件可直接导入，也可通过模块使用。
- selector 为 `wol-geozarr-source`，exportAs 为 `wolGeoZarrSource`；输入和输出使用 `wol`
  前缀，采用现有 Angular signal API、OnPush 和内容投影约定，不添加冗余的 standalone 声明。
- `wolUrl` 为必填输入。可选构造输入为 `wolBands`、`wolStoreOptions`、`wolProjection`、
  `wolTransition`、`wolWrapX`、`wolResample`、`wolDimensions`、`wolVariable`、`wolExtent` 和
  `wolFlipY`；复用上游导出类型或 Options 对应成员类型，未指定的值交给 OpenLayers 处理。
- `wolBands` 支持字符串波段名称和包含 name、group 的 Band 对象；`wolVariable`
  选择单个多维数据数组。文档说明上游的 bands 与 variable 互斥语义，组件不新增数据布局判断或配置校验策略。
- `wolDimensions`
  保留构造选项的完整类型，包括整数索引、字符串坐标标签及上游支持的数组选择。它仅在初始化读取，不在输入变化时自动调用 updateDimensions。
- 所有 GeoZarr 构造输入均为初始化输入。变化不会自动重建、改写底层配置或替换 getInstance 返回的对象；宿主需要显式销毁并重新挂载组件来采用新的构造配置。
- 附加 `wolAttributions` 和
  `wolProperties`。GeoZarr 构造 Options 不包含 attributions，初始化和变化时使用公开 setAttributions；properties 沿用现有 Source 的 setProperties 方式，初始化时静默设置。两者后续更新不替换数据源实例。
- `getInstance()`
  返回底层 GeoZarr 实例，初始化前和销毁后返回 undefined。getDimensions、getValue、updateDimensions 和 getView 等上游方法通过此实例使用；不新增方法代理、ready 输出或索引更新输入。
- 动态非空间维度更新使用上游 updateDimensions，只接受整数索引的部分更新并合并到当前选择。坐标标签在初始化时解析；用于组成多个显示波段的维度不能通过该方法切换。此限制写入用法说明，不通过组件另造更新规则。
- 输出为 `wolChange`、`wolError`、`wolPropertyChange`、`wolTileLoadStart`、`wolTileLoadEnd` 和
  `wolTileLoadError`，分别转发对应原生事件和原始载荷，不合成额外的状态或错误事件。
- 初始化状态通过 change 事件及公开 getState 识别 loading、ready、error。初始化失败不会触发原生 error，且 getView 的 promise 可能保持 pending；不能将 wolError 描述为覆盖全部初始化失败。
- 复用现有 useDataTileSourceHostRef，支持 RasterSource、WebGLTileLayer、TileLayer 和 FlowLayer 宿主。保持现有缺少宿主时的明确错误和各宿主的注册、移除语义，不改造共享宿主绑定逻辑。
- 沿用渲染后创建实例、订阅原生事件并在延迟 microtask 中挂载的生命周期。挂载前检查组件是否已经销毁；销毁时解绑宿主、注销监听、清空组件实例。该清理不构成取消上游初始化网络请求的承诺。
- 地图 View 由调用者配置，GeoZarr
  Source 组件不自动修改地图视图。真实数值栅格示例使用 WebGLTile 和显式显示样式，不增加跨宿主的自动数据或颜色转换。
- NgDoc 新增 Sources 分类下的 GeoZarr 页面和一个演示，采用现有 API 文档、示例注册及路由约定。页面使用
  `EXPERIMENTAL` 状态，不添加 `NEW` 状态；说明上游 GeoZarr 尚不属于稳定 API。
- 演示使用现有 Angular
  Material 的 outlined 表单控件、下拉框、条件显示的 URL 输入框和 Load 按钮，沿用当前文档应用的样式与表单方式。
- 演示使用本次核对的官方 10.11 示例中的 Krasnokuts'k 与 Hvolsvöllur 两个 Sentinel-2
  L2A 场景以及 Custom 选项。首次挂载自动加载第一个预设；改变下拉框或输入框只更新待加载值，点击 Load 才应用。自定义 URL 去除首尾空白后为空时禁止加载。
- 每次 Load 快照本次 URL、递增加载 ID，并通过按 ID 跟踪的单项 keyed
  @for 重建整个地图和数据源，包括相同 URL 的重试；同时重置 View 和加载状态。切换场景不保留旧地图的缩放或平移状态。
- 演示使用 OSM 底图、按红绿蓝顺序排列的 b04、b03、b02 波段，将每个波段的反射率 0 到 0.5 拉伸到颜色通道值 0 到 255，gamma 为 1.5；复现官方示例的 WebGL 样式。
- 演示通过 wolChange 和 getState 跟踪元数据初始化，每个数据源仅启动一次视图解析。仅在 ready 后调用官方 getView 组合：withLowerResolutions(1)、withHigherResolutions(2)、withExtentCenter 和 withZoom(2)。解析完成后构造具体 View，再设置到地图。
- 异步视图解析结果和失败处理必须核对加载 ID、当前组件与实例身份及销毁状态，忽略过期尝试。避免将可能拒绝或属于旧场景的视图 promise 直接交给地图更新流程。
- 初始化期间显示元数据加载提示；进入 error 后显示通用的数据集加载失败信息，提示检查 URL、访问权限及浏览器网络请求，并允许再次 Load。通过 tileloaderror 提示瓦片失败，保持这两种失败阶段的区别；不读取上游私有错误字段或推断具体失败原因。
- 文档包括独立入口和模块的导入方式、必填与可选输入、六个输出、公开实例访问、宿主要求、初始化输入限制、重新挂载切换数据源、整数索引更新及上游错误语义。
- 共享术语记录 GeoZarr 数据源、波段和非空间维度的领域定义，区分数据源与图层、波段与颜色通道。术语表不存放组件实现规则；本次沿用既有架构，无需新增 ADR。

## Testing Decisions

- 好的测试验证使用者可以观察到的接口、事件载荷、实例身份、宿主绑定、显示状态和操作结果。不得用只检查不抛错、私有字段或 keyed
  @for 的内部结构代替行为断言。
- 复用已确认的三个测试边界：Source 组件在 Angular 测试宿主中的公开行为、文档示例的用户交互和异步结果、生产文档中的真实数据与 WebGL 渲染。无需新增测试专用公开 API。
- Source 单元测试参考现有 GeoTIFF 与 DataTile 的 colocated Vitest、Analog
  Angular 集成和 jsdom 测试；使用保留 OpenLayers 事件能力的轻量 GeoZarr 替身，隔离网络初始化，而不重复测试上游的数据解码或维度算法。
- 验证必填 URL 和所有可选构造输入传递，包含字符串及多 group 波段、variable、完整 dimensions 类型、显式 false 与 0，以及未指定选项由上游决定的行为。验证 attributions 和 properties 的初始设置与后续更新。
- 验证改变构造输入后底层实例和宿主绑定保持原对象；重新挂载后创建新实例并读取新配置。验证 wolDimensions 变化不会被错误传入仅接受整数索引的运行时方法。
- 在现有宿主组件边界验证四类兼容宿主的注册和移除，包括 Raster 的添加、移除及 layer 的 source 绑定。覆盖缺少兼容宿主时的错误，不依赖真实渲染器完成这些单元检查。
- 对六个原生事件逐项验证原始载荷转发。销毁后继续由已捕获的数据源发送事件不得再触发组件输出；初始化前和销毁后的 getInstance 返回 undefined。
- 覆盖延迟挂载前立即销毁的场景，确认不会重新挂载到宿主。覆盖正常销毁时的解绑和监听清理，避免只测试常规等待稳定后的生命周期。
- 示例测试通过控件操作验证首次预设加载、仅编辑草稿不加载、Custom 输入可见性、空 URL 禁止加载、不同 URL 切换、相同 URL 重试、新实例与视图重置；不以内部加载 ID 的具体实现作为断言。
- 用可控状态和延迟结果验证元数据 loading、ready、error，保证 ready 前不启动视图解析、初始化失败不依赖原生 error、视图解析失败有反馈，以及瓦片失败单独提示。
- 覆盖连续 Load 后旧请求最后返回、旧请求失败、示例销毁后请求返回等情形，确保当前视图和状态不被过期结果修改。
- 运行 `pnpm test`、`pnpm lint`、`pnpm format:check`、`pnpm build`、`pnpm build:docs` 和
  `pnpm build:docs-preview`；检查库构建产物中的新 secondary entry point 及组件、模块导出完整。
- 使用生产文档产物进行真实浏览器检查，验证首个场景、另一预设场景、Custom
  URL 加载、同 URL 重试、失败提示、平移缩放和影像渲染。记录截图、相关网络结果及控制台错误；单元测试中的替身不能证明真实远端读取和 WebGL 渲染正常。
- 检查正式与 preview 文档中的 Sources 导航、API 与演示注册，确认 GeoZarr 显示 EXPERIMENTAL 且没有 NEW 标签。需要区分外部服务不可用、访问权限或网络限制与组件缺陷；受限检查不能记为通过。

## Out of Scope

- 升级或降级 OpenLayers，扩大 peer 兼容范围，修改其他工具链、锁文件或 workspace 包版本。
- 自动重建数据源、自动更新 GeoZarr 构造输入，或者新增可动态接收标签和数组的维度更新输入。
- 新增 ready、初始化失败或统一状态输出，额外的方法代理，或者重新定义上游默认值、校验与错误契约。
- 组件库自建 GeoZarr 解析、解码、数据布局校验、跨宿主数值转换或网络取消机制。
- 改造共享宿主辅助函数、现有 GeoTIFF/DataTile 组件或地图的通用异步 View 更新接口。
- 多个 GeoZarr 演示、时间滑块、多 group 云掩膜、稀疏分辨率或数据立方体专门交互示例；组件仍传递相应上游构造能力，并说明实例方法的使用。
- 为自定义 URL 自动发现波段或适配任意数据集。本示例要求数据能够提供 b04、b03、b02，并满足上游 GeoZarr 读取条件。
- 切换场景时保留旧地图视图，或编辑 URL 时自动加载。
- 为本次沿用既有架构的新增组件建立 ADR，或将实现细节写入领域术语表。
- 执行 npm 发版、部署文档网站或修改外部数据服务。

## Further Notes

- 本文依据已完成的八项设计确认整理。完整 10.11 薄封装、单个完整交互示例、初始化输入、实例方法更新维度、原生事件、实验状态和验收边界均已确认；后续实施无需重复采访。
- 当前工作区 OpenLayers 版本要求为
  `~10.11.0`。新增组件的完整接口以仓库所用版本为准；历史 10.9 链接只用于说明 GeoZarr 的引入时间。
- 原始功能依据：[OpenLayers 10.9 GeoZarr 源码](https://github.com/openlayers/openlayers/blob/v10.9.0/src/ol/source/GeoZarr.js)。
- 当前接口与初始化行为依据：[OpenLayers 10.11 GeoZarr 源码](https://github.com/openlayers/openlayers/blob/v10.11.0/src/ol/source/GeoZarr.js)。
- 交互与渲染参考：[OpenLayers 官方 GeoZarr 示例](https://openlayers.org/en/latest/examples/geozarr.html)。本次讨论核对的页面使用 10.11.0；实施应保留本文已确定的交互和样式，不因 latest 页面后续变化扩大范围。
- 本次核对的两个预设数据地址为
  [Krasnokuts'k 场景](https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2C_MSIL2A_20260120T084301_N0511_R064_T36UXA_20260120T122910.zarr/measurements/reflectance)
  和
  [Hvolsvöllur 场景](https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance)。讨论阶段确认了官方页面及用法；本次实施已完成两个预设的真实读取与浏览器渲染验收，结果见集成验收记录。
- 实施验收结果见 [集成验收记录](validation.md)；需求已按本地 issue
  tracker 约定关闭。ready-for-agent 标签保留需求的分流记录，完成状态以 Status 为准。

## Comments

- 2026-10-15：用户要求新增 GeoZarr Source，并通过 grill-with-docs 讨论设计。
- 2026-10-15：用户确认采用完整薄封装，添加一个参考 OpenLayers 官方 GeoZarr 页面、复现完整交互的示例。
- 2026-10-15：用户确认覆盖仓库当前 10.11 接口，构造输入仅在初始化读取，切换数据源由宿主重新挂载组件。
- 2026-10-15：用户确认 wolDimensions 保持初始化语义，动态切片通过公开实例的整数索引更新方法完成。
- 2026-10-15：用户确认只转发六个原生事件，通过 wolChange 和 getState 识别初始化状态，不新增额外状态输出。
- 2026-10-15：用户确认 EXPERIMENTAL、无 NEW、共享术语定义、组件与示例测试、正式/preview 构建及真实浏览器验收，并保持依赖和包版本。
- 2026-10-15：用户通过 to-spec 要求将上述讨论编写成需求设计文档；按本地 issue
  tracker 约定发布为 open，并标记 ready-for-agent。

- 2026-10-15：用户要求在独立 worktree 实施，使用集成分支 codex/geozarr-source，所有提交 scope 为 geozarr-source。

- 2026-10-15：已在独立 managed worktree 完成实施及验收，全部提交使用 geozarr-source
  scope；组件、交互示例、NgDoc 页面和集成验收工单均 resolved。

## Answer

- 完整交付 OpenLayers 10.11 GeoZarr
  Source 薄封装、独立入口及 NgModule、六个原生输出、四类 DataTile 宿主绑定与生命周期清理；构造输入保持初始化语义，归属与属性支持更新。
- 交付单个完整交互示例及 EXPERIMENTAL-only NgDoc 页面，涵盖官方两个场景、Custom
  URL、显式 Load 与同 URL 重试、RGB/gamma 样式、视图复位、初始化/瓦片失败及过期异步结果处理。
- 组件 18 项、示例 12 项公开行为测试已集成，全量 2407 项测试、lint、格式、库与正式/preview 文档构建通过；两个预设的真实影像、交互、错误恢复、preview 深链接刷新和独立瓦片失败提示均完成浏览器验收。
- Standards 的 1 项 P3 已修复并复核为 0；Spec 审查 0 项。完整检查、已处理的环境限制、截图和原始审查报告见
  [集成验收记录](validation.md)，工单图见 [实施图](map.md)。
- 集成分支为 `codex/geozarr-source`，所有提交 scope 为
  `geozarr-source`；保持依赖、锁文件、包版本，不执行发版、部署或创建 PR。

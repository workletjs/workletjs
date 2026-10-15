# 01：GeoZarr Source 组件及行为测试

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

按[需求设计](../spec.md)新增完整 10.11 薄封装、独立入口、NgModule、六个输出和公开实例访问。复用 DataTile 宿主绑定，保持构造输入初始化语义，并处理延迟挂载前销毁。

## Acceptance criteria

- [x] 全部构造输入、attributions/properties、类型及导出符合 spec。
- [x] 四种宿主、缺少宿主、原生事件、实例身份和销毁边界有公开行为测试。
- [x] 先运行失败测试，再实现并使相关 Vitest 测试通过。
- [x] 受影响文件格式与 ESLint 检查通过；不修改共享宿主或其他组件。

## Comments

- 在独立实现 worktree 基于集成分支实施；提交使用 geozarr-source scope，完成前合并集成分支 tip。

## Answer

- 新增 GeoZarr 独立入口、组件及 NgModule，覆盖 OpenLayers
  10.11 的全部构造选项，保留初始化输入语义；attributions/properties 更新同一实例。
- 复用 DataTile 宿主，转发六个原生事件，公开 getInstance；通过 DestroyRef.destroyed 防止组件销毁后的延迟挂载。
- 18 个公开行为测试覆盖输入、默认值、实例身份、重新挂载、六个原始事件、四类宿主、缺少宿主、必填输入及销毁边界；替身继承真实 DataTileSource 并隔离远端元数据。
- TDD：先运行新增测试，因组件尚不存在而失败；首次实现后销毁前挂载测试再次失败（源被重新绑定）；加入销毁检查后全部通过。tdd 独立技能未安装，采用现有测试边界的 red/green 流程。
- 验证通过：GeoZarr 单套 Vitest（18/18）、Nx 库测试（93 套、2329/2329）、Nx 库 lint（只有既有 vector-tile 两条警告）、新增文件 Prettier 检查与 ESLint。执行 Nx 时使用 NX_DAEMON=false、NX_ISOLATE_PLUGINS=false、NX_SKIP_NX_CACHE=true。
- 可选 tsc
  spec 检查仍报告仓库既有控制器、image、interaction 等测试类型错误，GeoZarr 文件无类型错误；完整构建和浏览器验收交由集成验收工单处理。

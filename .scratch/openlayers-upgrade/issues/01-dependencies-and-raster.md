# 01：依赖升级与 Raster 兼容

Status: resolved

Type: task

Labels: ready-for-agent

## What to build

按[需求设计](../spec.md)统一升级 catalog 与锁文件，并修复 Raster 动态 source 的 10.11 采样兼容。保持现有公开 API、实例身份与生命周期；必要的上游升级适配也在本工单记录。

## Acceptance criteria

- [x] `ol` 声明为 `~10.11.0`，三个使用点保留 catalog 引用，锁文件只包含必要依赖变化。
- [x] Raster 使用同一批 layer 同步内部 layer 与 frame state，按上游规则同步采样模式。
- [x] 真实浮点 DataTile 回归覆盖动态增删、顺序、嵌套组件清理与实例身份；证明回归先失败后通过。
- [x] ImageTile 与 Layer 输入仍使用渲染采样；既有测试及必要兼容修复通过。
- [x] 冻结安装、受影响测试、lint 与格式检查通过；保留工具链和包版本。
- [x] 清晰提交依赖变化、行为修复及回归；关闭时记录命令、结果、提交和必要范围说明。

## Comments

- 2026-10-14：独立实现 worktree 基于集成分支创建；开始前改为 claimed，完成前合入集成分支最新 tip。
- 公开采样入口优先使用 Raster `getImage()` / `getData()`，不以私有字段断言代替数值验证。

## Answer

- 已确认实现 worktree 初始 HEAD 为集成分支的 `800eb6e`，在 `codex/openlayers-dependencies`
  实施，完成前合入集成 tip `1dbb75b`。
- catalog 已升级到 `~10.11.0`，三个消费点仍使用 `catalog:`；锁定 `ol 10.11.0`，仅随其要求更新
  `geotiff 3.1.0-beta.0` 和 `pbf 5.1.2`，未改工具链与 workspace 版本。
- Raster 在原实例上按 source 顺序同步原生数组采样标志，并复用同一批 layer 更新内部 layer 与 frame
  state。
- 新增 5 项行为回归：真实浮点 DataTile 动态注册、输入顺序及移除首项、嵌套组件销毁移除，以及 ImageTile
  / Layer 的渲染读取路径；强化宿主解绑与事件监听销毁验证。ImageTile /
  Layer 用例仅替代 jsdom 缺少的渲染像素边界，真实 DataTile loader、tile cache 与数值读取未 mock。
- 全库测试发现并适配两项上游差异：Feature 清除样式后 `getStyle()` 返回 `null`，同时保持无 style
  function；Flow 测试改用等价 hex 颜色，避开 jsdom 缺少 canvas 的命名色解析。

### 失败回归与验证

- 在仅升级依赖、尚未修复 Raster 时执行
  `pnpm exec vitest run --project=ngx-openlayers packages/ngx-openlayers/source/raster/raster-source.component.spec.ts`：
  **26 passed / 3 failed**。三个真实 DataTile 回归均误入 `getImageData` / canvas 渲染路径，并在
  `getImage()` 抛出 `Cannot read properties of null (reading 'canvas')`；修复后同一文件 **29/29
  passed**，包含 `42.5` 与 `7.25` 的真实数值断言。原始日志暂存 `/tmp/openlayers-raster-red.log`。
- `pnpm install --frozen-lockfile`：通过，独立 worktree 安装 `ol 10.11.0`。
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm test:lib --output-style=static`：**92 文件、2311 测试全部通过**。日志暂存
  `/tmp/openlayers-lib-green.log`。
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm nx lint ngx-openlayers --output-style=static`：通过；仅保留既有 VectorTile 测试的两条非空断言 warning，新回归无 warning。
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm format:check`、修改文件的 Prettier 检查与
  `git diff --check`：通过。
- 沙箱首次阻止 registry 访问和 Nx Unix
  socket；依赖安装以已授权提权完成，Nx 通过关闭插件隔离完成检查。
- 额外尝试的 `tsc --project packages/ngx-openlayers/tsconfig.spec.json --noEmit`
  未通过。与原始 10.9 安装对照，既有 21 项测试类型诊断；10.11 的可空声明又暴露现有控制/几何测试 29 项诊断。新增 Raster 回归未引入类型诊断。该独立测试类型检查不是原有测试入口，按升级范围未开展既有测试的整体类型清理；正式库构建及完整集成验收由 03 工单执行。

### 提交

- `690e678`：`chore(deps): upgrade OpenLayers to 10.11.0`
- `d18f771`：`fix(source): preserve native Raster sampling for dynamic inputs`
- `cd9aff5`：`test: align fixtures with OpenLayers 10.11 behavior`
- 完成前以独立 merge commit 同步集成分支；工单关闭与验收记录另行提交。

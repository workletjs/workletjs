# 01：依赖升级与 Raster 兼容

Status: open

Type: task

Labels: ready-for-agent

## What to build

按[需求设计](../spec.md)统一升级 catalog 与锁文件，并修复 Raster 动态 source 的 10.11 采样兼容。保持现有公开 API、实例身份与生命周期；必要的上游升级适配也在本工单记录。

## Acceptance criteria

- [ ] `ol` 声明为 `~10.11.0`，三个使用点保留 catalog 引用，锁文件只包含必要依赖变化。
- [ ] Raster 使用同一批 layer 同步内部 layer 与 frame state，按上游规则同步采样模式。
- [ ] 真实浮点 DataTile 回归覆盖动态增删、顺序、嵌套组件清理与实例身份；证明回归先失败后通过。
- [ ] ImageTile 与 Layer 输入仍使用渲染采样；既有测试及必要兼容修复通过。
- [ ] 冻结安装、受影响测试、lint 与格式检查通过；保留工具链和包版本。
- [ ] 清晰提交依赖变化、行为修复及回归；关闭时记录命令、结果、提交和必要范围说明。

## Comments

- 2026-10-14：独立实现 worktree 基于集成分支创建；开始前改为 claimed，完成前合入集成分支最新 tip。
- 公开采样入口优先使用 Raster `getImage()` / `getData()`，不以私有字段断言代替数值验证。

# 01：新引擎及测试隔离

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

文档默认构建与服务运行在 NgDoc 22.1 新引擎，原有测试在兼容的 Vite
7 上执行，且旧引擎可独立运行与回退。

## Acceptance criteria

- [x] 五包声明统一 `~22.1.0`，版本、锁文件及冻结安装符合规格，其他工具及库版本保持。
- [x] 从 beta.2 收集及运行官方版本迁移；dry-run 后执行官方引擎 schematic，保存原始回退状态与报告。
- [x] docs 使用 Vite 8.3+，共享 Angular 测试插件及 Vitest 内部使用 Vite 7，现有库与 docs 测试通过。
- [x] 新引擎独立配置只扫描指南及组件库；legacy 保留字符串配置及隔离生成目录。
- [x] 默认 docs 生产构建通过，legacy 配套配置及官方回退命令具备可用性。

## Comments

- 实施依据：[需求设计](../spec.md)。部署子路径由 03 完成，完整浏览器及回退演练由 04 验收。
- 2026-10-13：已在 `codex/ng-doc-engine` 领取；基于集成分支
  `f410a76`，执行官方迁移、依赖解析回归及真实构建验收。

## Answer

- 2026-10-13：依赖提交 c665ffd、原样官方引擎迁移提交 f0b5ea5；已同步集成分支的 UI 提交。
- 实际运行 Nx 版本迁移，显式基线 22.0.0-beta.2、目标 22.1.0；队列仅为 vite-engine-note-v22，执行后按官方说明保留旧 builder，再单独运行引擎 schematic。
- 官方 schematic 先 dry-run，再以 docs 项目及独立 Vite 配置路径运行，跳过安装；保存原始 state 和备份，报告追加实际依赖上下文及手动调整，未修改回退哈希。
- 五包统一解析 22.1.0，docs builder Vite 8.3.0；Angular build/compiler
  22.2.2，根共享测试插件及 Vitest 内部仍为 Vite 7。依赖解析回归先红 2 项、修复后 4 项全绿。
- 新引擎独立配置采用两个扫描根，legacy 与回退仍使用原字符串配置。新产物导航与原基线完全一致：87 页、8 分类，标题、URL、顺序和状态逐项无差异。
- 冻结离线安装、完整 pnpm
  test 通过（20 项脚本及库/docs 套件）；新旧引擎生产构建通过；完整 lint 和受影响文件格式检查通过。沙箱无法读取 Angular 官方 API 索引，故 legacy 验收使用允许网络环境。
- preview/版本环境变量、CI 与贡献说明由 03 完成；开发服务、真实浏览器、冷暖构建及临时副本回退由 04 完整验收。

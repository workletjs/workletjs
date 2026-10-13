# 01：新引擎及测试隔离

Status: claimed

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

文档默认构建与服务运行在 NgDoc 22.1 新引擎，原有测试在兼容的 Vite
7 上执行，且旧引擎可独立运行与回退。

## Acceptance criteria

- [ ] 五包声明统一 `~22.1.0`，版本、锁文件及冻结安装符合规格，其他工具及库版本保持。
- [ ] 从 beta.2 收集及运行官方版本迁移；dry-run 后执行官方引擎 schematic，保存原始回退状态与报告。
- [ ] docs 使用 Vite 8.3+，共享 Angular 测试插件及 Vitest 内部使用 Vite 7，现有库与 docs 测试通过。
- [ ] 新引擎独立配置只扫描指南及组件库；legacy 保留字符串配置及隔离生成目录。
- [ ] 默认 docs 生产构建通过，legacy 配套配置及官方回退命令具备可用性。

## Comments

- 实施依据：[需求设计](../spec.md)。部署子路径由 03 完成，完整浏览器及回退演练由 04 验收。
- 2026-10-13：已在 `codex/ng-doc-engine` 领取；基于集成分支
  `f410a76`，执行官方迁移、依赖解析回归及真实构建验收。

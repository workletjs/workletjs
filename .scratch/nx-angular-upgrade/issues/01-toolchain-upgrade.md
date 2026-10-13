# 01：工具链升级及增量迁移

Status: open  
Type: task  
Labels: ready-for-agent  
Blocked by: None

## What to build

工作区在 Nx 23.3.0 和 Angular 22.2.x 上可复现安装并运行现有库、测试和文档工具链。

## Acceptance criteria

- [ ] Nx、Angular、ng-packagr、Analog 的版本声明符合需求，保留 catalog 引用。
- [ ] NgDoc 五个直接依赖保持精确 22.0.0-beta.2；其余工具版本按需求保留。
- [ ] 明确以 Nx 23.1.0 为基线生成并执行新增迁移，保留审查所需的迁移记录。
- [ ] 锁文件同步更新，冻结安装通过，实际依赖链没有不兼容的 Angular 21 构建工具。
- [ ] 库和文档测试通过，库构建可生成全部 secondary entry point。

## Comments

- 实施依据：[需求设计](../spec.md)；完整集成验收由工单 04 执行。

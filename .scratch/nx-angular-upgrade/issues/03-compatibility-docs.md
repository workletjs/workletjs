# 03：Angular 22.2 兼容文档

Status: open  
Type: task  
Labels: ready-for-agent  
Blocked by: None

## What to build

组件库使用者和贡献者能从 README、安装指南和兼容矩阵准确了解升级后当前源码的 Angular 22.2.x 要求。

## Acceptance criteria

- [ ] README 和安装指南中的 Angular Core/CDK 要求统一为 ~22.2.0。
- [ ] 兼容矩阵明确区分当前源码要求与已发布历史版本，不虚构新的库版本。
- [ ] 贡献者文档说明 Node >=24.15.0 <25 与现有 pnpm 版本要求。
- [ ] 文档格式检查通过。

## Comments

- 实施依据：[需求设计](../spec.md)；库版本仍为 22.0.1。

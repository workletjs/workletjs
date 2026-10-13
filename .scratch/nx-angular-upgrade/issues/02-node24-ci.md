# 02：Node 24 开发与 CI 环境

Status: open  
Type: task  
Labels: ready-for-agent  
Blocked by: None

## What to build

所有 CI 工作流和发布环境统一使用 Node 24，并向贡献者声明受支持的运行时范围。

## Acceptance criteria

- [ ] 所有设置 Node 的 CI 工作流统一为 Node 24。
- [ ] 根包 engines 为 >=24.15.0 <25，发布环境检查和说明同步更新。
- [ ] 保留 npm 发布策略、pnpm 版本和三个 workspace 包版本。
- [ ] 现有发布、dist-tag 和部署工作流回归检查通过。

## Comments

- 实施依据：[需求设计](../spec.md)。

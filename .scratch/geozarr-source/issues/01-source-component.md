# 01：GeoZarr Source 组件及行为测试

Status: open

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

按[需求设计](../spec.md)新增完整 10.11 薄封装、独立入口、NgModule、六个输出和公开实例访问。复用 DataTile 宿主绑定，保持构造输入初始化语义，并处理延迟挂载前销毁。

## Acceptance criteria

- [ ] 全部构造输入、attributions/properties、类型及导出符合 spec。
- [ ] 四种宿主、缺少宿主、原生事件、实例身份和销毁边界有公开行为测试。
- [ ] 先运行失败测试，再实现并使相关 Vitest 测试通过。
- [ ] 受影响文件格式与 ESLint 检查通过；不修改共享宿主或其他组件。

## Comments

- 在独立实现 worktree 基于集成分支实施；提交使用 geozarr-source scope，完成前合并集成分支 tip。

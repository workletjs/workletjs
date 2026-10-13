# 03：部署子路径与 CI

Status: open

Type: task

Labels: ready-for-agent

Blocked by: 01

## What to build

新引擎通过统一环境变量支持根站、preview 和版本子路径，PR 阶段验证文档构建。

## Acceptance criteria

- [ ] Vite base 使用 `DOCS_BASE_HREF`，默认根路径；保留 preview 快捷命令及现有输出、SPA fallback。
- [ ] 部署工作流改用环境变量，PR Checks 增加文档生产构建。
- [ ] 部署回归测试覆盖 preview 与版本接口并纳入 `pnpm test`，相关脚本测试通过。
- [ ] 保持 docs Nx 构建缓存关闭，贡献说明记录新部署接口与回退方式。
- [ ] 正式及 preview 构建通过，环境变量改变实际输出 base；完整多路径浏览器验收交由 04。

## Comments

- 实施依据：[需求设计](../spec.md)。基于 01 合入后的官方 Vite 配置实施。

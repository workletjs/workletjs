# 03：部署子路径与 CI

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: 01

## What to build

新引擎通过统一环境变量支持根站、preview 和版本子路径，PR 阶段验证文档构建。

## Acceptance criteria

- [x] Vite base 使用 `DOCS_BASE_HREF`，默认根路径；保留 preview 快捷命令及现有输出、SPA fallback。
- [x] 部署工作流改用环境变量，PR Checks 增加文档生产构建。
- [x] 部署回归测试覆盖 preview 与版本接口并纳入 `pnpm test`，相关脚本测试通过。
- [x] 保持 docs Nx 构建缓存关闭，贡献说明记录新部署接口与回退方式。
- [x] 正式及 preview 构建通过，环境变量改变实际输出 base；完整多路径浏览器验收交由 04。

## Comments

- 实施依据：[需求设计](../spec.md)。基于 01 合入后的官方 Vite 配置实施。
- 2026-10-13：`codex/ng-doc-deployment` 基于集成提交 `87a74c9`
  领取，复用现有部署回归测试执行红绿验证。

## Answer

- Vite 配置读取 `DOCS_BASE_HREF`，未提供时为 `/`；preview 快捷命令提供
  `/preview/`。版本部署通过构建步骤的环境变量提供已解析 tag 子路径，并运行工作区的
  `build:docs`，移除新 builder 不支持的参数与临时下载 Nx。保留 browser 输出和各部署步骤的 Pages SPA
  fallback。
- PR Checks 在原有 library build 后执行 docs 默认 production build，继续使用现有 Node
  24、pnpm 与冻结安装。docs 的 `cache: false` 保持，新旧部署路径不会复用 Nx 产物。
- 复用部署工作流测试，新增 preview、PR docs
  build 和根测试入口检查，更新版本路径契约。红绿：原状态 10 项中 4 项失败；实现后
  `pnpm test:scripts`
  全部 30 项通过，其中部署测试 10 项。测试断言构建和部署的外部命令契约，站点实际路径另由真实构建验证。
- `pnpm install --frozen-lockfile`
  成功，没有修改依赖或锁文件。`NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm nx lint docs`、受影响文件的 Prettier 检查及
  `git diff --check` 通过。
- 正式构建 `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm build:docs` 通过（39.3s）；产物
  `<base href="/" />`、主脚本根路径及生成的搜索 indexes/keywords 检查通过。
- preview 构建 `NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm build:docs-preview` 通过（9.0s）；产物
  `<base href="/preview/" />`、主脚本和样式的 `/preview/` 前缀及对应磁盘文件检查通过。两次均为 Nx
  `0/1` cache hit，第二次使用 NgDoc 内容缓存；版本子路径及浏览器深链接由 04 完整验收。
- README 记录环境变量用法、legacy 构建/服务、官方 schematic
  dry-run/revert 和完整 Git 回退边界；迁移报告追加部署调整。依据
  [22.1.0 发布源码中的引擎回退说明](https://github.com/ng-doc/ng-doc/blob/d5c7f52549ea6246d433634be3800513b34b06f1/apps/ng-doc/docs/upgrade/migrate-to-the-new-engine/index.md)及已安装 revert 实现：恢复目标会替换 Vite 目标的后续修改，编辑过的新文件可能保留，依赖和本次部署接口不会被引擎回退撤销。恢复 legacy 后需显式
  `--base-href` 或通过 Git 回退部署改动。
- 官方 `state.json` 和 backup 未改写。实现提交
  `bb5b2d6`（`build(docs): use deployment base environment and validate in CI`）；交付前已合并集成分支
  `87a74c9`。

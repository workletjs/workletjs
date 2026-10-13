# NgDoc 升级实施图

## Notes

- 需求：[spec.md](spec.md)。集成分支：`codex/ng-doc-upgrade`。
- 固定基线：`5cd2d4e`；所有 worktree 位于项目 `.worktrees/`。
- 01、02 可并行；03 依赖 01；04 依赖 01、02、03。
- 工单以 `Status: open`、`claimed`、`resolved` 和独立 Answer 记录交付。

## Decisions-so-far

- 五个 NgDoc 包统一 `~22.1.0`，默认构建迁至官方 Vite 新引擎，保留 legacy 与回退快照。
- docs 构建使用 Vite 8.3+，库及文档测试保留 Vite 7、Vitest 4.0.9、Analog 2.8.0。
- 部署子路径使用 `DOCS_BASE_HREF`；PR CI 增加文档构建；接受官方 UI 与 budgets 差异。
- 官方 `--revert` 恢复引擎；完整升级通过 Git 回退。
- [03：部署子路径与 CI](issues/03-deployment-ci.md) 已完成：Vite 读取
  `DOCS_BASE_HREF`，preview 与版本部署传入子路径，PR 构建 docs；部署回归并入根测试入口，30 项脚本测试和正式/preview 实际产物检查通过。README/迁移报告记录部署接口与引擎回退边界，保留原始 snapshot
  state/backup。
- [02：文档 UI 与导航兼容](issues/02-ui-compatibility.md)
  已完成：按官方 22.0/22.1 说明审查应用契约；首页响应式侧栏同步 900px，清理旧 navbar
  shadow 选择器，保留自定义导航、状态与公共 CSS。原依赖环境 docs
  36 项测试、lint、格式检查通过，真实新版浏览器验收由 04 完成。

- [01：新引擎及测试隔离](issues/01-engine-and-tests.md)
  已 resolved：五包 22.1、官方迁移与回退快照、Vite 依赖隔离、冻结安装、全测试及新旧生产构建通过；导航 87 页 /
  8 分类与基线一致。

- [04：集成验收及审查](issues/04-integration-validation.md)
  已 resolved：完整检查、多路径深链刷新、移动端、地图、文档及示例自动更新、冷暖构建和官方回退通过；Standards
  / Spec 均为 0 findings。 [验收记录](validation.md)
  保存截图、命令、提交及剪贴板工具限制；保留集成 worktree，清理实现副本。

## Fog

- 无未决实现问题。复制源码数据验收通过，系统剪贴板写入受内置浏览器工具限制，详见验收记录。
- `implement-spec` 引用的独立 `tdd` 技能未安装；实施已沿现有测试执行失败回归、修复及通过验证。

## Tickets

- [01：新引擎及测试隔离](issues/01-engine-and-tests.md)
- [02：文档 UI 与导航兼容](issues/02-ui-compatibility.md)
- [03：部署子路径与 CI](issues/03-deployment-ci.md)
- [04：集成验收及审查](issues/04-integration-validation.md)

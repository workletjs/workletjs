# 01：工具链升级及增量迁移

Status: resolved

Type: task  
Labels: ready-for-agent  
Blocked by: None

## What to build

工作区在 Nx 23.3.0 和 Angular 22.2.x 上可复现安装并运行现有库、测试和文档工具链。

## Acceptance criteria

- [x] Nx、Angular、ng-packagr、Analog 的版本声明符合需求，保留 catalog 引用。
- [x] NgDoc 五个直接依赖保持精确 22.0.0-beta.2；其余工具版本按需求保留。
- [x] 明确以 Nx 23.1.0 为基线生成并执行新增迁移，保留审查所需的迁移记录。
- [x] 锁文件同步更新，冻结安装通过，实际依赖链没有不兼容的 Angular 21 构建工具。
- [x] 库和文档测试通过，库构建可生成全部 secondary entry point。

## Comments

- 实施依据：[需求设计](../spec.md)；完整集成验收由工单 04 执行。

## Answer

- 2026-10-13：已合入集成分支 `e572d22`，在独立工作树安装并验证依赖。工具链提交为
  `d432838`；三个包的版本仍为 `22.0.1`。
- catalog 中全部 Nx 包精确为 `23.3.0`，Angular 开发依赖及公开 peer、ng-packagr 为
  `~22.2.0`，Analog 为 `2.8.0`，五个 NgDoc 直接依赖仍为 `22.0.0-beta.2`。
- 使用 Nx 23.3 CLI，以全部九个直接 Nx 包的 `23.1.0` 版本作为显式 `--from` 基线，配合
  `--include=required` 生成新的 `migrations.json`；没有使用
  `--exclude-applied-migrations`。四项新增迁移全部执行成功，只有两份 Vite 配置的
  `import.meta.dirname` 迁移产生源码改动，其余三项无须修改当前配置。
- 执行迁移的命令：
  `NX_DAEMON=false NX_ISOLATE_PLUGINS=false NX_MIGRATE_USE_LOCAL=true pnpm exec nx migrate --run-migrations=migrations.json --skip-install`。
- 首轮真实检查发现 Angular 22.2 编译器使用 `encodeRangeMappings`，但旧锁文件复用的
  `@jridgewell/sourcemap-codec@1.5.5` 不提供该导出。仅刷新该传递依赖至
  `1.6.0`，未增加新的直接依赖声明。此后库生产构建通过。
- Google 源测试原本向真实服务发送测试 API
  key，导致 56 个未处理的网络拒绝。测试现在通过 OpenLayers 的公开 `fetchSessionToken`
  网络边界返回确定的 HTTP 403 响应，保留所有原有断言，并验证 API 错误暴露及 `wolKey`
  请求参数。修复后未处理拒绝清零。
- 验证通过：冻结离线安装；17 项脚本测试（含 NgDoc 单实例）；库测试 92 个文件、2306 项断言；文档测试 8 个文件、35 项断言；库生产构建；修改文件的 Prettier 检查。
- 核对 92 个 secondary entry point 全部生成且导出引用的文件均存在。使用 pnpm
  10.34.5 打包后的真实 tarball 中，Angular Core/CDK 的 peer 均为 `~22.2.0`，OpenLayers 为
  `~10.9.0`。锁文件已移除 Angular 21 构建工具。
- 库和文档 lint 均已通过。Nx 23.3 将根目录的 NgDoc generated
  alias 归属为应用，因而误判文档的三个合法导入。修复仅在文档 ESLint 配置中允许 `@ng-doc/generated`
  及其子路径，完整继承共享配置的 allow、enforceBuildableLibDependency、depConstraints；库配置不变。已检查该例外不匹配相似别名或其他应用导入。
- 文档正式/preview 构建和浏览器冒烟检查由工单 04 继续验收。

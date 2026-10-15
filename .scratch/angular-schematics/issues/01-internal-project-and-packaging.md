# 01：内部项目与打包

Status: resolved

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

建立独立内部 Schematics 项目，并将可执行 collection 纳入组件库现有构建与发布产物。

## Acceptance criteria

- [x] 内部 Nx 项目名称为 `schematics`，私有 package 名称为
      `@workletjs/schematics`；与组件库同属仓库 packages，不单独发布。
- [x] 按官方流程建立 collection、schema、TypeScript 选项接口、factory 和模板组织，公开入口为
      `ng-add`、`application`。
- [x] 项目独立编译至 `dist/packages/schematics/`，主库打包与编译完成后再合并至主库发布目录的
      `schematics/`。
- [x] 使用 CommonJS 编译及最小局部包边界，确保 collection 能从主库 ESM 发布包加载；内部项目完整私有清单不进入集合目录。
- [x] 主库声明集合入口、适当的 ng-add 安装保存类型及实际执行期依赖；不将私有包作为用户环境依赖。
- [x] Devkit、官方 Angular
      schematics、模板解析器、TypeScript、semver 等实际直接执行期依赖被正确声明，ng-packagr 白名单与之匹配。
- [x] 主库通过 Nx 依赖关系等待内部构建，并使 Schematics 变更影响主库缓存；内部项目不导入主库实现或反向依赖主库构建。
- [x] Nx Release 项目集合显式排除 `schematics`；现有主库版本和发布入口继续使用。
- [x] 公共构建保留 production/development 配置，输出清理与缓存恢复不会覆盖已合并集合；独立 Nx 构建及根构建命令均包含集合。
- [x] 提供独立 Node Vitest 配置及编译后 collection 的 `SchematicTestRunner`
      测试入口，并接入现有库测试命令。
- [x] 根级 lint、格式化及格式检查命令包含内部 `schematics` 项目，不能因现有入口只枚举旧项目而漏检。

## Comments

- 实施依据：[需求设计](../spec.md)。本工单建立编译、加载和测试基础，命令业务行为由 02—04 实现。
- 最终发布 tarball 和真实 workspace 集成验证由 05 统一执行；本工单须先验证独立构建和 CommonJS
  collection 加载。

- 2026-10-15：在集成分支 codex/schematics 领取；通过独立实现 worktree 完成，所有提交使用 schematics
  scope。

## Answer

已建立独立的 schematics
Nx 项目和 @workletjs/schematics 私有包。collection、两条命令的 schema 与 TypeScript 接口、CommonJS
factory 编译及声明输出均已纳入公共主库构建。命令 factory 目前明确抛出未实现错误，具体行为由后续工单实现。

公共构建依赖内部集合和 Angular
package 目标，再合并发布输出；内部输出独立，包含最小 CommonJS 清单。主库声明 collection、ng-add
dependencies 保存类型及直接执行期依赖，Release 显式排除内部项目。构建脚本变更同时进入内部和主库缓存输入，affected 分析确认主库受集合源码影响。

新增独立 Node
Vitest 环境，以临时发布布局执行编译后的公开 collection；测试不依赖预先构建的主库发布产物。根级库测试、lint、格式化入口均包含 schematics。

验证结果：

- Red：先运行公开集合测试，因 collection fixture/build helper 尚不存在而失败。
- Green：schematics 的 3 个 collection 测试通过，验证公开命令、ESM 库内 CommonJS
  factory/声明加载、schema 原生提示与默认值。
- 内部 Nx build、test、lint 通过；根级 pnpm test:lib 同时运行现有组件测试和集合测试并通过。
- 主库 production 和 development 直接 Nx 构建通过，均包含合并的集合；development 依赖正确使用对应 Angular
  package 配置。
- 主库 lint 通过，仅保留已有的两条非空断言 warning；格式检查及 git diff --check 通过。
- 锁文件保留原有传递依赖解析，仅新增实际 catalog/importer 声明；frozen-lockfile 安装验证通过。

后续工单继续填充 ng-add、地图示例、application 行为；实际 tarball 与完整生成应用验收由 05 统一执行。

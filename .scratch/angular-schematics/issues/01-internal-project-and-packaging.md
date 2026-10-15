# 01：内部项目与打包

Status: claimed

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

建立独立内部 Schematics 项目，并将可执行 collection 纳入组件库现有构建与发布产物。

## Acceptance criteria

- [ ] 内部 Nx 项目名称为 `schematics`，私有 package 名称为
      `@workletjs/schematics`；与组件库同属仓库 packages，不单独发布。
- [ ] 按官方流程建立 collection、schema、TypeScript 选项接口、factory 和模板组织，公开入口为
      `ng-add`、`application`。
- [ ] 项目独立编译至 `dist/packages/schematics/`，主库打包与编译完成后再合并至主库发布目录的
      `schematics/`。
- [ ] 使用 CommonJS 编译及最小局部包边界，确保 collection 能从主库 ESM 发布包加载；内部项目完整私有清单不进入集合目录。
- [ ] 主库声明集合入口、适当的 ng-add 安装保存类型及实际执行期依赖；不将私有包作为用户环境依赖。
- [ ] Devkit、官方 Angular
      schematics、模板解析器、TypeScript、semver 等实际直接执行期依赖被正确声明，ng-packagr 白名单与之匹配。
- [ ] 主库通过 Nx 依赖关系等待内部构建，并使 Schematics 变更影响主库缓存；内部项目不导入主库实现或反向依赖主库构建。
- [ ] Nx Release 项目集合显式排除 `schematics`；现有主库版本和发布入口继续使用。
- [ ] 公共构建保留 production/development 配置，输出清理与缓存恢复不会覆盖已合并集合；独立 Nx 构建及根构建命令均包含集合。
- [ ] 提供独立 Node Vitest 配置及编译后 collection 的 `SchematicTestRunner`
      测试入口，并接入现有库测试命令。
- [ ] 根级 lint、格式化及格式检查命令包含内部 `schematics` 项目，不能因现有入口只枚举旧项目而漏检。

## Comments

- 实施依据：[需求设计](../spec.md)。本工单建立编译、加载和测试基础，命令业务行为由 02—04 实现。
- 最终发布 tarball 和真实 workspace 集成验证由 05 统一执行；本工单须先验证独立构建和 CommonJS
  collection 加载。

- 2026-10-15：在集成分支 codex/schematics 领取；通过独立实现 worktree 完成，所有提交使用 schematics scope。

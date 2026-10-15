# 02：ng add 基础接入

Status: open

Type: task

Labels: ready-for-agent

Blocked by: 01

## What to build

通过 `ng add @workletjs/ngx-openlayers`
选择目标应用、检查依赖并配置 OpenLayers 全局样式，提供默认关闭的地图示例选项。

## Acceptance criteria

- [ ] 支持 `project`、`example`、`exampleName`、`route`、`skipInstall`；`example` 使用原生
      `x-prompt`，默认 false，显式值不重复询问，非交互运行默认 false。
- [ ] 优先使用显式项目，其次使用 CLI 当前目录项目或唯一应用；歧义时列出候选并报错，不任意选择；非应用或不存在项目明确失败。
- [ ] 从本次安装发布包已解析的 peerDependencies 读取版本要求，保留兼容依赖声明及所在依赖区段，仅补齐缺少的 CDK 和 OpenLayers。
- [ ] 普通 semver 范围与库要求相容，存在已安装版本时同步检查；非 semver 声明仅在已安装版本可验证时接受，否则提供修复说明。
- [ ] 不兼容 Angular、CDK 或 OpenLayers 明确报错，不自动升级、降级或替换现有依赖来源。
- [ ] 基础构建样式及显式覆盖样式的 configuration 均接入
      `ol.css`，兼容字符串和对象形式，保留用户样式顺序并去重。
- [ ] 现代 unit-test target 通过构建配置继承样式，不写入其不支持的选项。
- [ ] 不生成示例时无需 Router 或主路由出口；NgModule 应用可以使用基础安装能力。
- [ ] 后续依赖安装只安排一次，`skipInstall` 可跳过该任务；不将 CLI 安装组件库本身误描述为可跳过。
- [ ] 在公开 collection 边界测试默认值与显式参数、项目选择、依赖保留与冲突、样式去重和重复执行行为。

## Comments

- 实施依据：[需求设计](../spec.md)。地图示例的文件、路由分析和冲突检查由 03 实现并接入本命令。
- 集成后的命令必须在写入前完成所选行为的必要检查，失败不应留下局部接入结果。

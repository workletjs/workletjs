# Angular Schematics 双轴代码评审

比较基线：`499a1d36db25b05ed3382e226fcc960102355834`。初审目标 `c0f0a40`；修复代码复核至
`43ecf0f`，验收记录合入 `e0b2868`。两个评审者独立工作，全部发现由同一独立 worktree 中的实现者修复。

## Standards

审查范围：`499a1d36db25b05ed3382e226fcc960102355834...c0f0a40`，完整文本 diff、16 条提交及仓库标准文件已检查。未发现违反 AGENTS.md、GLOSSARY.md 或 docs/agents/{domain,issue-tracker}.md 的硬性问题；格式、lint 和其他工具强制项未重复报告。

1. **[P3] possible Duplicated Code（判断项）** — `packages/schematics/application/index.ts:92–108`
   与 `packages/schematics/utility/map-example.ts:172–186` 重复执行同一套根组件装饰器/元数据定位：
   `ts.getDecorators(root)?.find(... importedName(..., '@angular/core') === 'Component')`，随后分别检查调用参数并调用
   `source.object(...)`。两个入口都已依赖
   `StaticSource`，但这套 Angular 元数据识别规则仍有两份；将来支持的静态形式改变时容易只更新一处。建议把根组件及其 Component 元数据解析提取至共享静态分析辅助方法，两个调用点各自保留宿主条件和模板输出检查。依据：code-review 的 Fowler
   **Duplicated Code** 基线；这属于可维护性判断，并非仓库文档标准违例。

Standards：0 项硬性违例，1 项 P3 判断项。未评估 Spec 轴。

## 独立修复复核（2026-10-16）

只读审查 `c0f0a40..43ecf0f` 的全部四个文件差异。`c231fcf`
将唯一的装饰器识别、参数检查和元数据解析放入
`StaticSource.componentMetadata`；两个调用端均已使用该方法，原 P3 重复代码判断项已解决。调用端仍分别保留命名根类检查、既有错误文案，以及新应用的外部模板要求或已有宿主的 standalone/Router/主出口条件。共享方法的返回与错误语义和原逻辑一致。

`43ecf0f`
的 ngNonBindable 子树检查及四个公开 collection 回归未引入新的 Standards 问题。本次未重复运行测试，测试证据由实现者提供；未替代 Spec 轴对功能正确性的复核。

最终未解决：0 项硬性违例、0 项判断项。

## Spec

审查基线：`499a1d36db25b05ed3382e226fcc960102355834...c0f0a40`。已核对需求、01—05 工单、变更及验收证据；未发现未请求的范围扩张。

- **[P2] 排除 ngNonBindable 容器内的假出口。** 规格 `spec.md:140` 要求已有根组件主出口，`:143`
  要求“确认根组件实际存在主路由出口”，`:146`
  禁止静默生成未接入的组件。`packages/schematics/utility/map-example.ts:222—235` 对所有
  `TmplAstElement.children` 递归，未识别 `ngNonBindable`。根模板只有
  `<div ngNonBindable><router-outlet /></div>` 时，实际包的公开 `ng-add --example`
  成功写入组件、路由及基础配置，但 Angular 不会在该子树实例化 RouterOutlet，访问地图路径没有承载页面的真实出口。应跳过禁止绑定的子树，在没有其他有效主出口时于写入前报错，并补公开 collection 回归。

复现：`node /private/tmp/workletjs-schematics-review-probe.cjs`
使用已验证的 3053d19 实际 tarball（runtime 与 c0f0a40 相同），输出
`accepted:true,mapFile:true`；对照 ng-template 正确失败。`node /private/tmp/workletjs-schematics-outlet-runtime.cjs`
使用本地 Angular 22.2
TestBed，前述模板 DOM 出口数为 1、真实 RouterOutlet 指令数为 0；普通出口对照为 1。

合计 1 项，最高 P2；其他需求未发现缺失或错误实现。未将最终文档合入后重包等待列为缺陷。

### 修复复核（2026-10-16，43ecf0f）

已只读审查 `c0f0a40..43ecf0f`。`43ecf0f` 在检查当前 outlet 后、进入 children 前识别
`ngNonBindable`，正确区分“宿主自身指令”与“禁用绑定的后代”。四个公开 collection 回归覆盖两种禁用子树的失败及完整 Tree 不变、另有真实出口和出口自身带该属性的成功；修复没有改变关闭示例时的基础接入行为。`c231fcf`
的 Component 元数据抽取保留两个调用方的既有校验与错误处理，未发现需求行为变化。

独立重新编译该 HEAD 到 `/private/tmp/workletjs-schematics-fixed-review/`
后执行公开 collection 探针：普通和嵌套 ngNonBindable 假出口均被拒绝；含另一个真实出口和
`<router-outlet ngNonBindable />` 均正常生成。探针
`/private/tmp/workletjs-schematics-fixed-review-probe.cjs`。Angular TestBed 对照探针
`/private/tmp/workletjs-schematics-fixed-outlet-runtime.cjs` 确认宿主自身 RouterOutlet 仍会实例化。

原 P2 已解决；本次修复未发现新的 Spec 问题。**未解决：0 项。**

Standards 初审 1 项、最高 P3，已解决；Spec 初审 1 项、最高 P2，已解决。最终两轴未解决问题均为 0。

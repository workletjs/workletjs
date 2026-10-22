---
target: Landing 页面：apps/docs/src/app/pages/landing
total_score: 30
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: 'file:/Users/chao/Documents/Coding/workletjs/apps/docs/src/app/pages/landing/landing.component.html'
target_fingerprint: 'sha256:6c01b6e0aeff3b1b77598c69fa64a142a8441b28938dcce099fb64402fde0e2c'
target_path: /Users/chao/Documents/Coding/workletjs/apps/docs/src/app/pages/landing/landing.component.html
timestamp: 2026-10-22T06-34-26Z
slug: landing-component-html
---

Method: dual-agent（A: /root/critique_a · B: /root/critique_b）

# Landing 设计评审

目标：apps/docs/src/app/pages/landing/landing.component.html，范围包含 Landing 子组件、样式和交互。成功标准：快速上手、真实地图演示与 First
Map；保留既定 ng-doc 参考方向。Header/Footer 在范围外，本轮未修改源码。

## 总体判断与设计辨识度

**30/40，良好。没有发现 P0/P1 问题。**
页面结构清楚，核心操作可用。最值得改进的是让实时模板更容易阅读，并把安装到第一张可见地图的前置条件讲得更严谨。

真实地图与 wol-map、wol-view 模板联动，具有明确的 Angular/OpenLayers 产品特征。双栏首屏、蓝色强调和三步引导符合既定 ng-doc 方向，无须为新奇而推翻。主要机会在教学表达与交互细节。

## 设计健康评分

启发式评分，各项满分4分。文档入口、复制和交互教学使全部10项均适用，没有n/a。

| #        | 维度           | 得分      | 主要依据                                      |
| -------- | -------------- | --------- | --------------------------------------------- |
| 1        | 系统状态可见性 | 3         | 复制反馈清楚，预设状态仍可更准确              |
| 2        | 与用户语言匹配 | 3         | 术语适合Angular开发者，必要高度被放在定制步骤 |
| 3        | 用户控制与自由 | 3         | 地图、键盘、地点跳转均可操作                  |
| 4        | 一致性与标准   | 3         | 视觉统一，地图状态与预设选中略有脱节          |
| 5        | 错误预防       | 3         | 提供兼容性提示，但复制后入口消失              |
| 6        | 识别胜于回忆   | 3         | 文档入口明确，关键代码偏小                    |
| 7        | 灵活性与效率   | 3         | 命令复制、First Map、组件入口直接可达         |
| 8        | 美学与简约     | 3         | 层级克制，局部辅助文字过小                    |
| 9        | 错误恢复       | 3         | 源码有清晰恢复指引，断网恢复未实测            |
| 10       | 帮助与文档     | 3         | First Map跳转及完整示例已验证                 |
| **总计** |                | **30/40** | **Good / 良好，75%**                          |

## 值得保留

- 真实交互证明产品价值：地点切换和键盘平移都更新地图与模板数值。
- 安装、First Map、组件文档直接可达，没有强制引导或额外门槛。
- 三项能力、三步上手、结尾CTA分组清楚。1440桌面、390手机、320窄屏、暗色检查没有整页横向溢出。

## 优先问题

### [P2] 核心演示代码只有11px，削弱产品证明

位置：components/hero-banner/hero-banner.component.css:120；landing.component.html:65。

地图容易被看到，用户却不容易读清模板和center/zoom变化。手机还需要局部横向滚动。A独立视觉判断和B实际字号/尺寸测量一致。建议提高到13–14px，调整长坐标换行，并明确提示移动地图会同步更新下面的Angular数值。属于阅读舒适度问题，不能仅凭11px判定WCAG失败。

建议命令：$impeccable typeset，必要时接 $impeccable clarify。

### [P2] 必需地图高度被包装成可选定制

位置：landing.component.html:139、148、150。

第二步Compose your map仅展示标签，第三步Make it
yours才要求高度。新手容易把第二步理解成最小完成态，而高度实际是显示地图的必要条件。First
Map文档实测明确说明高度确保容器可见。建议将高度并入第二步，第3步再介绍控件和扩展；或将第3步改成Show
your first map。

建议命令：$impeccable onboard。

### [P2] 复制成功后兼容性入口消失

位置：landing.component.html:40；landing.component.ts:38。

A实测复制后compatibility链接被成功提示替换，源码中copied状态不会自动恢复。用户正准备安装时反而失去前置检查入口。建议保留静态兼容性链接，另设aria-live区域显示复制结果。

建议命令：$impeccable harden。

### [P2] 手机演示控件偏小

位置：components/hero-banner/hero-banner.component.css（地点控件）；landing.component.scss（复制按钮）；OpenLayers默认zoom控件。

B实测复制按钮36×36px、地点按钮高36px、缩放按钮22×22px，而主要CTA高46px。演示需要较精准点按。建议移动端将操作区扩大至约44px，缩放按钮增加间隔。此为触屏体验建议，未核验所有spacing例外，不作正式合规判定。

建议命令：$impeccable adapt。

### [P3] 自由平移后地点预设仍保持选中

位置：components/hero-banner/hero-banner.component.html:8、19；hero-banner.component.ts:30、45。

A实测选Alps后键盘平移，中心值改变但Alps仍aria-pressed=true。建议离开预设视图后取消选中，或改为Jump
to地点的普通动作而非持续pressed状态。

建议命令：$impeccable polish。

## 认知负荷和情绪旅程

8项检查中：单一焦点、分块、分组、视觉层级、一次一个决定、最少选择、渐进披露通过；Working
memory未通过，因为复制后需要重新寻找兼容性入口。**1/8失败，整体负荷低。**
单次路径选择2项、地点选择3项，未发现一个决策点超过4项；不将独立分组的badge与地图按钮机械相加。

情绪高点是地图和模板真实联动。小低谷是代码偏小、同步说明含蓄、复制后入口消失以及必要高度的排序。结尾First
Map CTA保持任务导向并稳定收口。

## Persona红旗

- Jordan（首次接入者）：容易把高度当成可选配置，复制后找不到版本检查入口。
- Sam（低视力/触屏/辅助操作）：关键代码偏小，缩放按钮需要精准操作；现有地图键盘焦点、具名区域和复制播报应保留。离散地点操作可提供简短状态摘要，不要频繁播报所有连续平移数值。
- Riley（细查状态）：可以复现地图实际视图与地点pressed状态不同步。

## 次要观察

- 320×740时演示top约784px，超出第一屏；390×844时top约623px，可看到部分地图。可压缩窄屏首屏间距，使实物证明更早出现，不夸大为手机没有演示。
- Your data/Your layers文案覆盖tiles/vector/WebGL，当前链接准确指向WebGL
  tile；若进一步服务返回用户，可评估更广的Layers/Source入口。
- DESIGN.md机器可读字号token未完全列出13px utility、30px
  closing、移动端clamp，正文已有记录。这是元数据完善项，不是视觉失控。

## 确定性扫描与浏览器证据

CLI仅运行一次，返回20项：19 advisory、1 warning。design-system-color 13项：hero
CSS:10,12,22,42,53,58,59,65,72,88；hero HTML未解析行；landing HTML未解析行；landing
SCSS:122。design-system-font-size 6项：hero CSS:27；landing SCSS:181,245,317,339,368。broken-image
1项：landing HTML未解析行。detector line0不是有效源码行。

13项颜色提示来自已记录的变量fallback或静态模板环境，未发现实际色彩漂移。1项图片是Angular[src]静态解析误报，三个badge实测complete且naturalWidth为88、60、78。6项字号主要是frontmatter元数据未单列，不判为实际视觉缺陷。

1440、390、320的scrollWidth分别等于viewport宽度，模板是局部横滚。暗色正确继承。取样文字对比度均>=4.5:1（如明色CTA5.49，代码caption7.36），但不是完整可访问性审计。A实测复制和First
Map；A/B均实测地图交互。未主动阻断网络，不声称已验证断网恢复。只读evaluate不支持脚本注入，没有用户可见overlay；以CLI、DOM和原生截图补充。

证据：.scratch/landing-critique/assessment-a.md、assessment-b.md、b-detector-findings.json、b-desktop.png、b-mobile390.png、b-narrow320.png、b-dark1440.png。

## 针对性问题

1. 下一步优先方向：上手路径（高度+兼容性），还是演示体验（代码+触屏控件）？
2. 修订范围：仅前三项P2、全部四项P2，还是全部五项（含预设状态P3）？

## 后续 Polish 处理记录

本快照的五项优先问题已在后续 polish 中处理：实时模板改为 13px 并软换行；地图高度并入 Compose your
map；兼容性链接与复制状态分开；手机复制、地点和缩放操作区至少 44px；地点选中状态从实际 center/zoom 派生，平移或缩放后取消，重新选择可恢复。

验证：文档项目 70 项测试通过，docs
lint 与生产构建通过。浏览器实测 390px 和 320px 页面均无横向溢出，模板也不需横滚；320px 的地图演示提前至约 659px。已实测复制后兼容性入口仍可见，以及地图键盘平移后 pressed 清除和重新选点恢复。设计文档已同步。

此记录保留原评审分数与时间，不构成一次新的 critique 评分。快照从本地 Landing 归档直接读取；存储助手的 latest 未找到该归档，因此没有伪造助手返回的 snapshot_file 或调用 close。

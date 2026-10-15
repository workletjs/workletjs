# 03：NgDoc 页面与使用说明

Status: open

Type: task

Labels: ready-for-agent

Blocked by: None

## What to build

按[需求设计](../spec.md)新增 Sources 分类中的 GeoZarr 页面、API 与演示注册，说明公开接口、初始化语义、维度更新和原生错误边界。

## Acceptance criteria

- [ ] 页面注册一个 WolGeoZarrSourceExampleComponent，路由 geozarr。
- [ ] 使用 EXPERIMENTAL、不使用 NEW，并说明上游实验接口。
- [ ] 导入、输入输出、宿主、重新挂载、维度更新及初始化错误说明齐全。
- [ ] 格式检查通过，正式与 preview 构建由 04 集中验收。

## Comments

- 可与 01 并行编写，演示实现由 02 提供；提交使用 geozarr-source scope，完成前合并集成分支 tip。

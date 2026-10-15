# ngx-openlayers

本术语表记录地图组件库中共享的领域用语。

## Language

**GeoZarr 数据源（GeoZarr Source）**：为地图图层提供遵循 GeoZarr 约定的地理栅格数据的数据来源。
_Avoid_：GeoZarr 图层、GeoZarr 数据集（指数据源时）

**波段（Band）**：栅格中每个位置的一类测量值，例如红光反射率。波段是数据的一部分，与用于显示数据的颜色通道不同。
_Avoid_：颜色通道（指波段时）

**非空间维度（Non-spatial
Dimension）**：栅格数据中空间坐标以外的变化轴，例如时间。选择该维度上的一个位置可以确定相应的数据切片。
_Avoid_：空间轴（指非空间维度时）

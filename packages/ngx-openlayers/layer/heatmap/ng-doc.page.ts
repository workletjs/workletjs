import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import {
  WolHeatmapEarthquakesExampleComponent,
  WolHeatmapTrajectoriesExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const HeatmapLayerPage: NgDocPage = {
  title: 'HeatmapLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'heatmap-layer',
  demos: {
    WolHeatmapEarthquakesExampleComponent,
    WolHeatmapTrajectoriesExampleComponent,
  },
};

export default HeatmapLayerPage;

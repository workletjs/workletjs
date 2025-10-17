import ImageLayer from 'ol/layer/Image';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import ImageSource from 'ol/source/Image';
import TileSource from 'ol/source/Tile';
import Source from 'ol/source/Source';

export function createLayers(sources: (Source | Layer)[]): Layer[] {
  const layers: Layer[] = [];

  for (const source of sources) {
    if (source instanceof Layer) {
      layers.push(source);
    }

    if (source instanceof TileSource) {
      layers.push(new TileLayer({ source }));
    }

    if (source instanceof ImageSource) {
      layers.push(new ImageLayer({ source }));
    }
  }

  return layers;
}
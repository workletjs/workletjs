import { transformExtent } from 'ol/proj';
import { WolTransformExtentPipe } from './transform-extent.pipe';

describe('WolTransformExtentPipe', () => {
  let pipe: WolTransformExtentPipe;

  beforeEach(() => {
    pipe = new WolTransformExtentPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform extent from source projection to destination projection', () => {
    const extent = [0, 0, 10, 10];
    const sourceProjection = 'EPSG:4326';
    const destinationProjection = 'EPSG:3857';
    const result = pipe.transform(extent, sourceProjection, destinationProjection);
    const expected = transformExtent(extent, sourceProjection, destinationProjection);
    expect(result).toBeDefined();
    expect(result.length).toBe(4);
    expect(result).toEqual(expected);
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null, 'EPSG:4326', 'EPSG:3857')).toBeNull();
    expect(pipe.transform(undefined, 'EPSG:4326', 'EPSG:3857')).toBeNull();
  });
});

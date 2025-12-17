import { transform } from 'ol/proj';
import { WolTransformPipe } from './transform.pipe';

describe('WolTransformPipe', () => {
  let pipe: WolTransformPipe;

  beforeEach(() => {
    pipe = new WolTransformPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform coordinate from source projection to destination projection', () => {
    const coord = [0, 0];
    const sourceProjection = 'EPSG:4326';
    const destinationProjection = 'EPSG:3857';
    const result = pipe.transform(coord, sourceProjection, destinationProjection);
    const expected = transform(coord, sourceProjection, destinationProjection);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    // The transformed coordinate of [0, 0] from EPSG:4326 to EPSG:3857 should be [0, 0]
    expect(result).toEqual(expected);
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null, 'EPSG:4326', 'EPSG:3857')).toBeNull();
    expect(pipe.transform(undefined, 'EPSG:4326', 'EPSG:3857')).toBeNull();
  });
});

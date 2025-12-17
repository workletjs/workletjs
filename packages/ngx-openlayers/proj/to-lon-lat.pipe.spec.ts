import { toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { WolToLonLatPipe } from './to-lon-lat.pipe';

describe('WolToLonLatPipe', () => {
  let pipe: WolToLonLatPipe;

  beforeEach(() => {
    proj4.defs(
      'EPSG:21781',
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
        '+x_0=600000 +y_0=200000 +ellps=bessel ' +
        '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs',
    );
    register(proj4);
    pipe = new WolToLonLatPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform coordinate to lon-lat', () => {
    const coord = [1000000, 2000000];
    const result = pipe.transform(coord);
    const expected = toLonLat(coord);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    // Since the actual transformation depends on the projection, we just check if the output is different from input
    expect(result).toEqual(expected);
  });

  it('should transform coordinate to lon-lat with specified projection', () => {
    const coord = [485869.5728, 76443.1884];
    const projection = 'EPSG:21781';
    const result = pipe.transform(coord, projection);
    const expected = toLonLat(coord, projection);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result).toEqual(expected);
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });
});

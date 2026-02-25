import proj4 from 'proj4';

import { fromLonLat } from 'ol/proj';
import { register } from 'ol/proj/proj4';

import { WolFromLonLatPipe } from './from-lon-lat.pipe';

describe('WolFromLonLatPipe', () => {
  let pipe: WolFromLonLatPipe;

  beforeEach(() => {
    proj4.defs(
      'EPSG:21781',
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
        '+x_0=600000 +y_0=200000 +ellps=bessel ' +
        '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs',
    );
    register(proj4);
    pipe = new WolFromLonLatPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform lon-lat to coordinate', () => {
    const lonLat: [number, number] = [10, 20];
    const result = pipe.transform(lonLat);
    const expected = fromLonLat(lonLat); // Expected output may vary based on the default projection
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result).toEqual(expected);
  });

  it('should transform lon-lat to coordinate with specified projection', () => {
    const lonLat: [number, number] = [10, 20];
    const projection = 'EPSG:21781';
    const result = pipe.transform(lonLat, projection);
    const expected = fromLonLat(lonLat, projection);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result).toEqual(expected);
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });
});

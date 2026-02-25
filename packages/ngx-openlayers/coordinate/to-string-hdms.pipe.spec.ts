import { Coordinate } from 'ol/coordinate';

import { WolToStringHDMSPipe } from './to-string-hdms.pipe';

describe('WolToStringHDMSPipe', () => {
  let pipe: WolToStringHDMSPipe;

  beforeEach(() => {
    pipe = new WolToStringHDMSPipe();
  });

  it('should convert coordinate to HDMS string', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const result = pipe.transform(coordinate);
    expect(result).toBe('7° 17′ 41″ N 80° 38′ 20″ E');
  });

  it('should convert coordinate to HDMS string with custom precision', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const result = pipe.transform(coordinate, 2);
    expect(result).toBe('7° 17′ 41.47″ N 80° 38′ 19.55″ E');
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });
});

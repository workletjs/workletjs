import { Coordinate } from 'ol/coordinate';
import { WolToStringXYPipe } from './to-string-xy.pipe';

describe('WolToStringXYPipe', () => {
  let pipe: WolToStringXYPipe;

  beforeEach(() => {
    pipe = new WolToStringXYPipe();
  });

  it('should be able to convert coordinate to string', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const result = pipe.transform(coordinate);
    expect(result).toBeDefined();
    expect(result).toBe('81, 7');
  });

  it('should be able to convert coordinate to string with custom precision', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const result = pipe.transform(coordinate, 1);
    expect(result).toBeDefined();
    expect(result).toBe('80.6, 7.3');
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });
});

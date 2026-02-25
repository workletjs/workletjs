import { Coordinate } from 'ol/coordinate';

import { WolFormatPipe } from './format.pipe';

describe('WolFormatPipe', () => {
  let pipe: WolFormatPipe;

  beforeEach(() => {
    pipe = new WolFormatPipe();
  });

  it('should be able to format coordinate to string', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const result = pipe.transform(coordinate, 'Coordinate is ({x}|{y}).');
    expect(result).toBeDefined();
    expect(result).toBe('Coordinate is (81|7).');
  });

  it('should be able to format coordinate with custom precision', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const result = pipe.transform(coordinate, 'Coordinate is ({x}|{y}).', 3);
    expect(result).toBeDefined();
    expect(result).toBe('Coordinate is (80.639|7.295).');
  });

  it('should return null for null or undefined input', () => {
    expect(pipe.transform(null, '')).toBeNull();
    expect(pipe.transform(undefined, '')).toBeNull();
  });
});

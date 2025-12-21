import { Coordinate } from 'ol/coordinate';
import { WolAddPipe } from './add.pipe';

describe('WolAddPipe', () => {
  let pipe: WolAddPipe;

  beforeEach(() => {
    pipe = new WolAddPipe();
  });

  it('should be able to add delta to coordinate', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const delta: Coordinate = [-2, 4];
    const result = pipe.transform(coordinate, delta);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result).toEqual([78.638765, 11.294854]);
  });

  it('should return null for null or undefined input', () => {
    const delta: Coordinate = [-2, 4];
    expect(pipe.transform(null, delta)).toBeNull();
    expect(pipe.transform(undefined, delta)).toBeNull();
  });
});

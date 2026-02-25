import { Coordinate } from 'ol/coordinate';

import { WolRotatePipe } from './rotate.pipe';

describe('WolRotatePipe', () => {
  let pipe: WolRotatePipe;

  beforeEach(() => {
    pipe = new WolRotatePipe();
  });

  it('should be able to rotate coordinate by angle', () => {
    const coordinate: Coordinate = [80.638765, 7.294854];
    const rotateRadians = Math.PI / 2; // 90 degrees
    const result = pipe.transform(coordinate, rotateRadians);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]).toBeCloseTo(-7.294854);
    expect(result[1]).toBeCloseTo(80.638765);
  });

  it('should return null for null or undefined input', () => {
    const rotateRadians = Math.PI / 2;
    expect(pipe.transform(null, rotateRadians)).toBeNull();
    expect(pipe.transform(undefined, rotateRadians)).toBeNull();
  });
});

// src/lib/imageCompression.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTargetDimensions } from './imageCompression';

describe('Image Compression Utilities', () => {
  it('keeps dimensions unchanged if smaller than max bounds', () => {
    const { width, height } = calculateTargetDimensions(800, 600, 1280, 1280);
    expect(width).toBe(800);
    expect(height).toBe(600);
  });

  it('scales down landscape dimensions proportionally when exceeding maxWidth', () => {
    const { width, height } = calculateTargetDimensions(4000, 3000, 1280, 1280);
    expect(width).toBe(1280);
    expect(height).toBe(960); // 3000 * (1280 / 4000) = 960
  });

  it('scales down portrait dimensions proportionally when exceeding maxHeight', () => {
    const { width, height } = calculateTargetDimensions(3000, 4000, 1280, 1280);
    expect(width).toBe(960);
    expect(height).toBe(1280);
  });

  it('handles square images properly', () => {
    const { width, height } = calculateTargetDimensions(2000, 2000, 1000, 1000);
    expect(width).toBe(1000);
    expect(height).toBe(1000);
  });
});

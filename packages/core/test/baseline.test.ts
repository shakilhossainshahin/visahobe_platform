import { describe, it, expect } from 'vitest';
import { CORE_PACKAGE_NAME, getAppMetadata } from '../src/index.js';

describe('Core Package Baseline Test', () => {
  it('should return correct package metadata', () => {
    const meta = getAppMetadata('test');
    expect(meta.name).toBe(CORE_PACKAGE_NAME);
    expect(meta.version).toBe('0.1.0');
    expect(meta.environment).toBe('test');
  });

  it('should verify core package name invariant', () => {
    expect(CORE_PACKAGE_NAME).toBe('@visahobe/core');
  });
});

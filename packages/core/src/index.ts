/**
 * @visahobe/core — Core domain types and utilities
 */

export const CORE_PACKAGE_NAME = '@visahobe/core';
export const CORE_VERSION = '0.1.0';

export interface AppMetadata {
  name: string;
  version: string;
  environment: string;
}

export function getAppMetadata(env = 'development'): AppMetadata {
  return {
    name: CORE_PACKAGE_NAME,
    version: CORE_VERSION,
    environment: env,
  };
}

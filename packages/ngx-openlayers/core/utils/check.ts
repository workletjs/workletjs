import { WolSafeAny } from '@workletjs/ngx-openlayers/core/types';

/**
 * Checks if a value is null or undefined.
 *
 * @param value The value to check.
 * @returns True if the value is null or undefined, false otherwise.
 */
export function isNil(value: WolSafeAny): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks if a value is not null or undefined.
 *
 * @param value The value to check.
 * @returns True if the value is not null or undefined, false otherwise.
 */
export function isNotNil<T>(value: T | null | undefined): value is T {
  return !isNil(value);
}

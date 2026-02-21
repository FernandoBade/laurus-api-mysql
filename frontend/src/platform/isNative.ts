/**
 * @summary Indicates whether the app is running in a native runtime bridge.
 * @returns Always false in web foundation/runtime mode.
 */

export function isNative(): boolean {
  return false;
}

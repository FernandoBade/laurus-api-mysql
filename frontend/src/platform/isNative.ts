/**
 * @summary Indicates whether the app is currently running in a native runtime.
 * @returns Always false in web foundation/runtime mode.
 */
export function isNative(): boolean {
  return false;
}

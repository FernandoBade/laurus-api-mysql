import { createMemoryStorageDriver } from "@/platform/storage/drivers/memoryStorage.driver";
import { createWebLocalStorageDriver } from "@/platform/storage/drivers/webLocalStorage.driver";
import type { KeyValueStorage } from "@/platform/storage/storage.types";

function hasWebLocalStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const testKey = "__storage_probe__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const defaultStorageDriver: KeyValueStorage = hasWebLocalStorage()
  ? createWebLocalStorageDriver()
  : createMemoryStorageDriver();

export const storage: KeyValueStorage = defaultStorageDriver;

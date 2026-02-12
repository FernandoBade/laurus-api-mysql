import { StorageKey } from "@shared/enums/storage.enums";
import type { KeyValueStorage } from "@/platform/storage/storage.types";

function parseStoredValue<T>(value: string | null): T | null {
  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

class WebLocalStorageDriver implements KeyValueStorage {
  get<T>(key: StorageKey): T | null {
    if (typeof window === "undefined") {
      return null;
    }

    return parseStoredValue<T>(window.localStorage.getItem(key));
  }

  set<T>(key: StorageKey, value: T): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: StorageKey): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  }
}

/**
 * @summary Builds a web localStorage-based key-value storage driver.
 * @returns Storage driver backed by browser localStorage.
 */
export function createWebLocalStorageDriver(): KeyValueStorage {
  return new WebLocalStorageDriver();
}

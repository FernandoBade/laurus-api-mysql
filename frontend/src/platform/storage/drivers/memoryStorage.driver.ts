import { StorageKey } from "@shared/enums/storage.enums";
import type { KeyValueStorage } from "@/platform/storage/storage.types";

function parseMemoryValue<T>(value: string | undefined): T | null {
    if (value === undefined) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

class MemoryStorageDriver implements KeyValueStorage {
    private readonly data = new Map<StorageKey, string>();

    get<T>(key: StorageKey): T | null {
        return parseMemoryValue<T>(this.data.get(key));
    }

    set<T>(key: StorageKey, value: T): void {
        this.data.set(key, JSON.stringify(value));
    }

    remove(key: StorageKey): void {
        this.data.delete(key);
    }
}

/**
 * @summary Builds an in-memory key-value storage driver.
 * @returns Storage driver backed by an in-memory map.
 */
export function createMemoryStorageDriver(): KeyValueStorage {
    return new MemoryStorageDriver();
}

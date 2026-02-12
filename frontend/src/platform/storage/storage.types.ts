import { StorageKey } from "@shared/enums/storage.enums";

export interface KeyValueStorage {
  get<T>(key: StorageKey): T | null;
  set<T>(key: StorageKey, value: T): void;
  remove(key: StorageKey): void;
}

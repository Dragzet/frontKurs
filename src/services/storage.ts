/**
 * Interface for persistent storage access
 */
export interface IStorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T): void;
  remove(key: string): void;
}

/**
 * LocalStorage implementation of IStorageService
 */
export class LocalStorageService implements IStorageService {
  get<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  set<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

// Create a singleton instance
export const storageService = new LocalStorageService();

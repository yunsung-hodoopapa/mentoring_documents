/**
 * 범용 localStorage 유틸리티
 * 어떤 타입의 데이터든 저장/로드 가능한 제네릭 함수들
 */

export interface StorageOptions<T> {
  /** 데이터 파싱 함수 (JSON.parse 후 추가 변환이 필요한 경우) */
  parser?: (item: unknown) => T;
  /** 데이터 직렬화 함수 (JSON.stringify 전 변환이 필요한 경우) */
  serializer?: (item: T) => unknown;
}

/**
 * localStorage에서 배열 데이터를 불러옵니다
 */
export const loadArrayFromStorage = <T>(key: string, options: StorageOptions<T> = {}): T[] => {
  try {
    const savedData = localStorage.getItem(key);
    if (!savedData) return [];

    const parsedData = JSON.parse(savedData);

    if (options.parser) {
      return parsedData.map(options.parser);
    }

    return parsedData;
  } catch (error) {
    console.error(`Failed to load data from localStorage (key: ${key}):`, error);
    return [];
  }
};

/**
 * localStorage에 배열 데이터를 저장합니다
 */
export const saveArrayToStorage = <T>(
  key: string,
  data: T[],
  options: StorageOptions<T> = {},
): void => {
  try {
    if (data.length === 0) return;

    let dataToSave: unknown = data;
    if (options.serializer) {
      dataToSave = data.map(options.serializer);
    }

    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error(`Failed to save data to localStorage (key: ${key}):`, error);
  }
};

/**
 * localStorage에서 단일 객체를 불러옵니다
 */
export const loadFromStorage = <T>(key: string, options: StorageOptions<T> = {}): T | null => {
  try {
    const savedData = localStorage.getItem(key);
    if (!savedData) return null;

    const parsedData = JSON.parse(savedData);

    if (options.parser) {
      return options.parser(parsedData);
    }

    return parsedData;
  } catch (error) {
    console.error(`Failed to load data from localStorage (key: ${key}):`, error);
    return null;
  }
};

/**
 * localStorage에 단일 객체를 저장합니다
 */
export const saveToStorage = <T>(key: string, data: T, options: StorageOptions<T> = {}): void => {
  try {
    let dataToSave: unknown = data;
    if (options.serializer) {
      dataToSave = options.serializer(data);
    }

    localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error(`Failed to save data to localStorage (key: ${key}):`, error);
  }
};

/**
 * localStorage에서 데이터를 삭제합니다
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove data from localStorage (key: ${key}):`, error);
  }
};

/**
 * localStorage 사용 가능 여부를 확인합니다
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

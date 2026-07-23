import { useEffect, useState } from 'react';
import { loadArrayFromStorage, saveArrayToStorage, StorageOptions } from '../lib/storage';

interface UseLocalStorageOptions<T> extends StorageOptions<T> {
  /** 초기 로딩 지연 시간 (ms) */
  loadingDelay?: number;
}

/**
 * 범용 localStorage 훅
 * 어떤 타입의 배열 데이터든 localStorage와 동기화 가능
 */
export const useLocalStorage = <T>(
  key: string,
  data: T[],
  setData: (data: T[]) => void,
  options: UseLocalStorageOptions<T> = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { loadingDelay = 1000, ...storageOptions } = options;

  // 초기 로딩
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const savedData = loadArrayFromStorage<T>(key, storageOptions);
      setData(savedData);
      setIsLoading(false);
    }, loadingDelay);
  }, [key, setData, loadingDelay, storageOptions]);

  // 자동 저장
  useEffect(() => {
    saveArrayToStorage(key, data, storageOptions);
  }, [key, data, storageOptions]);

  return { isLoading };
};

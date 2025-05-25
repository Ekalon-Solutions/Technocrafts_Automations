import { useState } from "react";

export interface UseLocalStorageReturnType<T> {
  storedValue: T;
  setValue: (newValue: T) => void;
  clearLocalStorage: () => void;
}

export const useLocalStorage = <T,>(keyName: string, defaultValue: T): UseLocalStorageReturnType<T> => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const value = window.localStorage.getItem(keyName);
      return value ? JSON.parse(value) as T : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  });

  const setValue = (newValue: T) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {
    }
    setStoredValue(newValue);
  };

  const clearLocalStorage = () => {
    window.localStorage.removeItem(keyName);
  };

  return { storedValue, setValue, clearLocalStorage };
};
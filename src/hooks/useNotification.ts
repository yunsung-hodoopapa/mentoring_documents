import { useState, useEffect } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState(false);

  // 알림 자동 제거
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 에러 자동 제거
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const showError = (message: string) => {
    setError(message);
    setInputError(true);
    setTimeout(() => setInputError(false), 2000);
  };

  const clearError = () => {
    setError('');
    setInputError(false);
  };

  return {
    notification,
    error,
    inputError,
    showNotification,
    showError,
    clearError,
  };
};

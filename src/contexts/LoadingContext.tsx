import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Spin } from 'antd';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const withLoading = async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
    if (isLoading) {
      throw new Error('Another operation is in progress');
    }
    
    setLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
      {children}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <Spin size="large" />
            <div style={{
              marginTop: '16px',
              color: 'var(--color-text)',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Processing...
            </div>
            <div style={{
              marginTop: '8px',
              color: 'var(--color-muted)',
              fontSize: '14px'
            }}>
              Please wait while we complete your request
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

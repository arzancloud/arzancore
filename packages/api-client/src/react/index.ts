/**
 * React hooks для API клиента
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { ApiClient, createApiClient, type ApiClientConfig } from '../client';
import type { User, Portal, AuthResponse } from '../types';
import { ApiError } from '../errors';

// ===== Context =====

interface ApiContextValue {
  client: ApiClient;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  currentPortal: Portal | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, name?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setCurrentPortal: (portal: Portal | null) => void;
  refreshUser: () => Promise<User | null>;
}

const ApiContext = createContext<ApiContextValue | null>(null);

// ===== Provider =====

interface ApiProviderProps {
  config: Omit<ApiClientConfig, 'onTokenRefresh' | 'onAuthError'>;
  children: React.ReactNode;
  /** Storage key for tokens */
  storageKey?: string;
  /** Custom storage (default: localStorage) */
  storage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
}

export function ApiProvider({
  config,
  children,
  storageKey = 'arzan_auth',
  storage = typeof window !== 'undefined' ? localStorage : undefined,
}: ApiProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentPortal, setCurrentPortalState] = useState<Portal | null>(null);

  // Load tokens from storage
  const loadTokens = useCallback(() => {
    if (!storage) return { accessToken: undefined, refreshToken: undefined, portalId: undefined };
    try {
      const data = storage.getItem(storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load tokens from storage:', e);
    }
    return { accessToken: undefined, refreshToken: undefined, portalId: undefined };
  }, [storage, storageKey]);

  // Save tokens to storage
  const saveTokens = useCallback(
    (tokens: { accessToken?: string; refreshToken?: string; portalId?: string }) => {
      if (!storage) return;
      try {
        storage.setItem(storageKey, JSON.stringify(tokens));
      } catch (e) {
        console.error('Failed to save tokens to storage:', e);
      }
    },
    [storage, storageKey]
  );

  // Clear tokens from storage
  const clearTokens = useCallback(() => {
    if (!storage) return;
    try {
      storage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to clear tokens from storage:', e);
    }
  }, [storage, storageKey]);

  // Initialize client with tokens from storage
  const storedTokens = loadTokens();

  const client = useMemo(() => {
    return createApiClient({
      ...config,
      accessToken: storedTokens.accessToken,
      refreshToken: storedTokens.refreshToken,
      portalId: storedTokens.portalId,
      onTokenRefresh: (tokens) => {
        saveTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          portalId: client.getPortalId(),
        });
      },
      onAuthError: () => {
        setUser(null);
        clearTokens();
      },
    });
  }, [config.baseUrl]);

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      if (storedTokens.accessToken) {
        try {
          const userData = await client.getCurrentUser();
          setUser(userData);
        } catch (e) {
          console.error('Failed to load user:', e);
          clearTokens();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Auth methods
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      const response = await client.login({ email, password });
      setUser(response.user);
      saveTokens({
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      });
      return response;
    },
    [client, saveTokens]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<AuthResponse> => {
      const response = await client.register({ email, password, name });
      setUser(response.user);
      saveTokens({
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      });
      return response;
    },
    [client, saveTokens]
  );

  const logout = useCallback(async () => {
    try {
      await client.logout();
    } catch (e) {
      // Ignore errors during logout
    }
    setUser(null);
    setCurrentPortalState(null);
    clearTokens();
  }, [client, clearTokens]);

  const setCurrentPortal = useCallback(
    (portal: Portal | null) => {
      setCurrentPortalState(portal);
      client.setPortalId(portal?.id || '');
      saveTokens({
        ...loadTokens(),
        portalId: portal?.id,
      });
    },
    [client, saveTokens, loadTokens]
  );

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await client.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (e) {
      return null;
    }
  }, [client]);

  const value: ApiContextValue = {
    client,
    isAuthenticated: !!user,
    isLoading,
    user,
    currentPortal,
    login,
    register,
    logout,
    setCurrentPortal,
    refreshUser,
  };

  return React.createElement(ApiContext.Provider, { value }, children);
}

// ===== Hooks =====

/**
 * Получение API клиента и контекста авторизации
 */
export function useApi(): ApiContextValue {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

/**
 * Получение только API клиента
 */
export function useApiClient(): ApiClient {
  const { client } = useApi();
  return client;
}

/**
 * Получение информации о текущем пользователе
 */
export function useUser() {
  const { user, isLoading, refreshUser } = useApi();
  return { user, isLoading, refreshUser };
}

/**
 * Получение информации о текущем портале
 */
export function usePortal() {
  const { currentPortal, setCurrentPortal, client } = useApi();

  const loadPortals = useCallback(async () => {
    return client.getPortals();
  }, [client]);

  return { currentPortal, setCurrentPortal, loadPortals };
}

/**
 * Хук для выполнения API запросов
 */
export function useApiQuery<T>(
  queryFn: (client: ApiClient) => Promise<T>,
  deps: any[] = []
) {
  const { client } = useApi();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn(client);
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(String(e), 0, 'UNKNOWN'));
    } finally {
      setIsLoading(false);
    }
  }, [client, ...deps]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, isLoading, refetch };
}

/**
 * Хук для выполнения мутаций
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (client: ApiClient, variables: TVariables) => Promise<TData>
) {
  const { client } = useApi();
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(client, variables);
        setData(result);
        return result;
      } catch (e) {
        const apiError = e instanceof ApiError ? e : new ApiError(String(e), 0, 'UNKNOWN');
        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [client, mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, error, isLoading, reset };
}

// Re-export types
export type { ApiContextValue, ApiProviderProps };

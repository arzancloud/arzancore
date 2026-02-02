import * as React from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  avatar?: string;
  locale?: string;
}

export interface Portal {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  role: string;
}

export interface AuthContextValue {
  user: User | null;
  portal: Portal | null;
  portals: Portal[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectPortal: (portalId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
}

export function AuthProvider({ children, apiUrl = '/api' }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [portal, setPortal] = React.useState<Portal | null>(null);
  const [portals, setPortals] = React.useState<Portal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const isAuthenticated = !!user;

  // Загрузка текущего пользователя при монтировании
  React.useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPortal(data.currentPortal || null);
        setPortals(data.portals || []);
      } else {
        setUser(null);
        setPortal(null);
        setPortals([]);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка входа');
    }

    await refreshUser();
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setPortal(null);
      setPortals([]);
    }
  };

  const selectPortal = async (portalId: string) => {
    const response = await fetch(`${apiUrl}/auth/select-portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ portalId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка выбора портала');
    }

    const selected = portals.find((p) => p.id === portalId);
    if (selected) {
      setPortal(selected);
    }
  };

  const value: AuthContextValue = {
    user,
    portal,
    portals,
    isAuthenticated,
    isLoading,
    login,
    logout,
    selectPortal,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };

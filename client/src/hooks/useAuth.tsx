import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: 'client' | 'partner') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Server returned invalid JSON');
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiCall('/api/me');
      
      if (response.success) {
        setUser(response.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error occurred' };
    }
  };

  const register = async (email: string, password: string, name: string, role: 'client' | 'partner'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Register error response:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Network error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
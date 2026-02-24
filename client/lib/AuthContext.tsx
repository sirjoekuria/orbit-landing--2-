import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from './api';

interface User {
    id: string;
    name?: string;
    fullName?: string;
    full_name?: string;
    email: string;
    phone?: string;
    userType: 'customer' | 'rider' | 'admin';
    user_type?: 'customer' | 'rider' | 'admin';
    isActive?: boolean;
    is_active?: boolean;
    isAuthenticated?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });

            if (response.ok) {
                const data = await response.json();
                const userData = data.user;

                // Normalize fields
                const normalizedUser = {
                    ...userData,
                    fullName: userData.fullName || userData.full_name,
                    name: userData.fullName || userData.full_name || userData.name,
                    userType: userData.userType || userData.user_type,
                    isActive: userData.isActive !== undefined ? userData.isActive : userData.is_active,
                    isAuthenticated: true,
                };

                setUser(normalizedUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            } else if (response.status === 401) {
                // Server explicitly says not authenticated — clear session
                setUser(null);
                localStorage.removeItem('user');
            } else {
                // Some other server error — fall back to localStorage to avoid spurious logouts
                const stored = localStorage.getItem('user');
                if (stored) {
                    try {
                        setUser(JSON.parse(stored));
                    } catch {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            }
        } catch (error) {
            // Network error (server not reachable, fetch failed) — preserve existing session
            console.warn('Session check network error, preserving localStorage session:', error);
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = (userData: any) => {
        // Normalize fields
        const normalizedUser = {
            ...userData,
            fullName: userData.fullName || userData.full_name,
            name: userData.fullName || userData.full_name || userData.name,
            userType: userData.userType || userData.user_type,
            isActive: userData.isActive !== undefined ? userData.isActive : userData.is_active
        };
        const userWithAuth = { ...normalizedUser, isAuthenticated: true };
        setUser(userWithAuth);
        localStorage.setItem('user', JSON.stringify(userWithAuth));
    };

    const logout = async () => {
        try {
            const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
            const { token } = await csrfRes.json();
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { 'x-csrf-token': token }
            }); // We should implement this
        } catch (e) {
            console.error('Logout request failed:', e);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('rider');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

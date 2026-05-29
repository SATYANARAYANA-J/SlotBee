import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('is_admin') === 'true';
        const name = localStorage.getItem('user_name');
        if (token) {
            setUser({ token, isAdmin, name });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, is_admin, name } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('is_admin', is_admin);
            localStorage.setItem('user_name', name || email.split('@')[0]);

            setUser({ token: access_token, isAdmin: is_admin, name: name || email.split('@')[0] });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (name, email, password, isAdmin = false) => {
        try {
            await api.post('/auth/register', { name, email, password, is_admin: isAdmin });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('is_admin');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

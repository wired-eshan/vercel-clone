import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";

type AuthContextType = {
    user: any;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<{ success: boolean } | void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.withCredentials = true; // Enable sending cookies with requests

export const AuthProvider: React.FC<{ children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        console.log("Checking authentication status...");
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('http://localhost:9000/v1/auth/authenticate');
            console.log("Auth status response:", response.data);
            if (response.data.authenticated) {
                setUser(response.data.user);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:9000/v1/auth/login', { email, password });

            console.log("Login response in auth context:", response.data);
            if (response.data.status == "success" ) {
                setUser(response.data.user);
                setIsLoggedIn(true);
                return { success: true };
            } else {
                return { success: false, message: "Login failed" };
            }
        } catch (error) {
            return { success: false, message: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post('http://localhost:9000/v1/auth/logout');
            
            if (response.data.success) {
                setIsLoggedIn(false);
                setUser(null);
                return { success: true };
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        user,
        isLoggedIn,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () : AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

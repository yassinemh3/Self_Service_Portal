"use client";
import { createContext, useContext, useState } from "react";

interface AuthContextProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
    undefined,
);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            "useAuthContext must be used within an AuthContextProvider",
        );
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthContextProvider({ children }: AuthProviderProps) {
    const [activeTab, setActiveTab] = useState<string>("sign-in");

    return (
        <AuthContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </AuthContext.Provider>
    );
}

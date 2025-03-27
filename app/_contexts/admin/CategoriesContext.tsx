"use client";
import { createContext, useContext, useState } from "react";

interface CategoriesContextProps {
    editCategoryDialogOpen: boolean;
    setEditCategoryDialogOpen: (editCategoryDialogOpen: boolean) => void;
}

export const CategoriesContext = createContext<
    CategoriesContextProps | undefined
>(undefined);

export const useCategoriesContext = () => {
    const context = useContext(CategoriesContext);
    if (!context) {
        throw new Error(
            "useCategoriesContext must be used within an CategoriesContextProvider",
        );
    }
    return context;
};

interface CategoriesProviderProps {
    children: React.ReactNode;
}

export default function CategoriesContextProvider({
    children,
}: CategoriesProviderProps) {
    const [editCategoryDialogOpen, setEditCategoryDialogOpen] =
        useState<boolean>(false);

    return (
        <CategoriesContext.Provider
            value={{ editCategoryDialogOpen, setEditCategoryDialogOpen }}
        >
            {children}
        </CategoriesContext.Provider>
    );
}

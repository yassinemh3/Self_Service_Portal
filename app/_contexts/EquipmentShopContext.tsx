"use client";

import { createContext, useContext, useState } from "react";
import { ShopItemInCart } from "@lib/data/entities";

interface EquipmentShopContextProps {
    articlesInShoppingCart: ShopItemInCart[];
    setArticlesInShoppingCart: (article: ShopItemInCart[]) => void;
}

export const EquipmentShopContext = createContext<
    EquipmentShopContextProps | undefined
>(undefined);

export const useEquipmentShopContext = () => {
    const context = useContext(EquipmentShopContext);
    if (!context) {
        throw new Error(
            "useEquipmentShopContext must be used within an EquipmentShopContextProvider",
        );
    }
    return context;
};

interface EquipmentShopContextProviderProps {
    children: React.ReactNode;
}

export default function EquipmentShopContextProvider({
    children,
}: EquipmentShopContextProviderProps) {
    const [articlesInShoppingCart, setArticlesInShoppingCart] = useState<
        ShopItemInCart[]
    >([]);

    return (
        <EquipmentShopContext.Provider
            value={{ articlesInShoppingCart, setArticlesInShoppingCart }}
        >
            {children}
        </EquipmentShopContext.Provider>
    );
}

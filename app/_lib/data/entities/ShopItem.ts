export interface ShopItem {
    id: number;
    name: string;
    url?: string | null;
    description?: string | null;
    categoryId?: number | null;
    stock: number;
    organizationId: string;
}

export interface CreatedShopItem
    extends Omit<Partial<ShopItem>, "name" | "stock" | "organizationId"> {
    name: string;
    stock: number;
    organizationId: string;
}

export interface UpdatedShopItem extends Partial<Omit<ShopItem, "id">> {
    id: number;
}

export interface ShopItemInCart extends ShopItem {
    quantity: number;
}

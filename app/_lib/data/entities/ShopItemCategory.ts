export interface ShopItemCategory {
    id: number;
    organizationId: string;
    name: string;
}

export interface CreatedShopItemCategory
    extends Omit<Partial<ShopItemCategory>, "id"> {
    organizationId: string;
    name: string;
}

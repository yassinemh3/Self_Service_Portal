import {
    ShopItem,
    CreatedShopItem,
    UpdatedShopItem,
    ShopItemCategory,
} from "@lib/data/entities";

export interface IShopItemRepository {
    createShopItem(shopItem: CreatedShopItem): Promise<ShopItem>;
    getShopItemById(id: number): Promise<ShopItem>;
    getAllShopItemsInOrganization(organizationId: string): Promise<ShopItem[]>;
    getShopItemCategoryByShopItemId(id: number): Promise<ShopItemCategory>;
    updateShopItem(shopItem: UpdatedShopItem): Promise<ShopItem>;
    deleteShopItem(id: number): Promise<void>;
}

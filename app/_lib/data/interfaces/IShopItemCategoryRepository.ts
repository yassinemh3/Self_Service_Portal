import { CreatedShopItemCategory, ShopItemCategory } from "@lib/data/entities";

export interface IShopItemCategoryRepository {
    createShopItemCategory(
        newShopItemCategory: CreatedShopItemCategory,
    ): Promise<ShopItemCategory>;
    getShopItemCategoryById(id: number): Promise<ShopItemCategory>;
    getAllShopItemCategories(): Promise<ShopItemCategory[]>;
    updateShopItemCategory(
        shopItemCategory: ShopItemCategory,
    ): Promise<ShopItemCategory>;
    deleteShopItemCategory(id: number): Promise<void>;
    getAllShopItemCategoriesInOrganization(
        organizationId: string,
    ): Promise<ShopItemCategory[]>;
}

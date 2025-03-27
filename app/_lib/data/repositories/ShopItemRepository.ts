import { IShopItemRepository } from "@lib/data/interfaces";
import {
    CreatedShopItem,
    ShopItem,
    ShopItemCategory,
    UpdatedShopItem,
} from "@lib/data/entities";
import {
    CreatedShopItemSchema,
    UpdatedShopItemSchema,
} from "@lib/data/repoZodSchemas";
import { db, shopItem, shopItemCategory } from "../../../../db";
import { eq } from "drizzle-orm";
import { z } from "zod";

export class ShopItemRepository implements IShopItemRepository {
    async createShopItem(shopItemData: CreatedShopItem): Promise<ShopItem> {
        const parsedShopItemData =
            CreatedShopItemSchema.safeParse(shopItemData);
        if (!parsedShopItemData.success) {
            throw new Error(parsedShopItemData.error.errors[0].message);
        }

        const [createdShopItem] = await db
            .insert(shopItem)
            .values(parsedShopItemData.data)
            .returning();
        return createdShopItem;
    }

    async getShopItemById(id: number): Promise<ShopItem> {
        const validId = z.number().int().nonnegative().parse(id);
        if (!validId) {
            throw new Error("Invalid ID");
        }
        const foundShopItem = await db
            .select()
            .from(shopItem)
            .where(eq(shopItem.id, validId));

        if (foundShopItem.length === 0) {
            throw new Error("Shop item not found");
        }
        return foundShopItem[0];
    }

    async updateShopItem(shopItemData: UpdatedShopItem): Promise<ShopItem> {
        const parsedShopItemData =
            UpdatedShopItemSchema.safeParse(shopItemData);
        if (!parsedShopItemData.success) {
            throw new Error(parsedShopItemData.error.errors[0].message);
        }

        const updatedShopItem = await db
            .update(shopItem)
            .set(parsedShopItemData.data)
            .where(eq(shopItem.id, parsedShopItemData.data.id))
            .returning();

        if (updatedShopItem.length === 0) {
            throw new Error("Shop item not found for update");
        }
        return updatedShopItem[0];
    }

    async getAllShopItemsInOrganization(
        organizationId: string,
    ): Promise<ShopItem[]> {
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(organizationId);
        if (!validOrgId) {
            throw new Error("Invalid organization ID");
        }
        const foundShopItems = await db
            .select()
            .from(shopItem)
            .where(eq(shopItem.organizationId, validOrgId));
        return foundShopItems;
    }

    async getShopItemCategoryByShopItemId(
        id: number,
    ): Promise<ShopItemCategory> {
        const foundShopItem = await this.getShopItemById(id);

        if (foundShopItem.categoryId == null) {
            throw new Error("Shop item does not have a valid category ID");
        }

        const foundShopItemCategory = await db
            .select()
            .from(shopItemCategory)
            .where(eq(shopItemCategory.id, foundShopItem.categoryId));

        if (foundShopItemCategory.length === 0) {
            throw new Error("Shop item category not found");
        }

        return foundShopItemCategory[0];
    }

    async deleteShopItem(id: number): Promise<void> {
        const validId = z.number().int().parse(id);
        try {
            await db.delete(shopItem).where(eq(shopItem.id, validId));
        } catch {
            throw new Error("Failed to delete shop item");
        }
    }
}

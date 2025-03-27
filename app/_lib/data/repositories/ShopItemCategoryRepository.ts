import { IShopItemCategoryRepository } from "@lib/data/interfaces";
import { CreatedShopItemCategory, ShopItemCategory } from "@lib/data/entities";
import {
    CreatedShopItemCategorySchema,
    ShopItemCategorySchema,
} from "@lib/data/repoZodSchemas";
import { db, shopItemCategory } from "../../../../db";
import { z } from "zod";
import { eq } from "drizzle-orm";

export class ShopItemCategoryRepository implements IShopItemCategoryRepository {
    async createShopItemCategory(
        newShopItemCategory: CreatedShopItemCategory,
    ): Promise<ShopItemCategory> {
        const parsedShopItemCategoryData =
            CreatedShopItemCategorySchema.safeParse(newShopItemCategory);
        if (!parsedShopItemCategoryData.success) {
            throw new Error(parsedShopItemCategoryData.error.errors[0].message);
        }

        const [createdShopItemCategory] = await db
            .insert(shopItemCategory)
            .values(parsedShopItemCategoryData.data)
            .returning();
        return createdShopItemCategory;
    }

    async getShopItemCategoryById(id: number): Promise<ShopItemCategory> {
        const parsedShopItemCategoryId = z
            .number()
            .int()
            .nonnegative()
            .parse(id);
        const foundShopItemCategory = await db
            .select()
            .from(shopItemCategory)
            .where(eq(shopItemCategory.id, parsedShopItemCategoryId));

        if (foundShopItemCategory.length === 0) {
            throw new Error("Shop item category not found");
        }
        return foundShopItemCategory[0];
    }

    async getAllShopItemCategories(): Promise<ShopItemCategory[]> {
        const foundShopItemCategories = await db
            .select()
            .from(shopItemCategory);
        return foundShopItemCategories as ShopItemCategory[];
    }

    async updateShopItemCategory(
        updatedShopItemCategory: ShopItemCategory,
    ): Promise<ShopItemCategory> {
        const parsedShopItemCategoryData = ShopItemCategorySchema.safeParse(
            updatedShopItemCategory,
        );
        if (!parsedShopItemCategoryData.success) {
            throw new Error(parsedShopItemCategoryData.error.errors[0].message);
        }

        const result = await db
            .update(shopItemCategory)
            .set(parsedShopItemCategoryData.data)
            .where(eq(shopItemCategory.id, parsedShopItemCategoryData.data.id))
            .returning();
        return result[0] as ShopItemCategory;
    }

    async getAllShopItemCategoriesInOrganization(
        organizationId: string,
    ): Promise<ShopItemCategory[]> {
        const parsedOrganizationId = z
            .string()
            .length(31, {
                message: "Organization ID must be 31 characters long",
            })
            .startsWith("org_", {
                message: "Organization ID must start with 'org_'",
            })
            .parse(organizationId);

        const foundShopItemCategories = await db
            .select()
            .from(shopItemCategory)
            .where(eq(shopItemCategory.organizationId, parsedOrganizationId));

        return foundShopItemCategories as ShopItemCategory[];
    }

    async deleteShopItemCategory(id: number): Promise<void> {
        const parsedShopItemCategoryId = z
            .number()
            .int()
            .nonnegative()
            .parse(id);
        try {
            await db
                .delete(shopItemCategory)
                .where(eq(shopItemCategory.id, parsedShopItemCategoryId));
        } catch {
            throw new Error("Failed to delete shop item category");
        }
    }
}

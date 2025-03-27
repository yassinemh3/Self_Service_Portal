import { IItemInRequestListRepository } from "../interfaces";
import {
    CreatedItemInRequestList,
    ItemInRequestList,
    UpdatedItemInRequestList,
} from "@lib/data/entities";
import {
    CreatedItemInRequestListSchema,
    UpdatedItemInRequestListSchema,
} from "@lib/data/repoZodSchemas";
import { db, itemInRequestList } from "../../../../db";
import { eq } from "drizzle-orm";
import { z } from "zod";

export class ItemInRequestListRepository
    implements IItemInRequestListRepository
{
    async createItemInRequestList(
        itemData: CreatedItemInRequestList,
    ): Promise<ItemInRequestList> {
        const parsedItemData =
            CreatedItemInRequestListSchema.safeParse(itemData);
        if (!parsedItemData.success) {
            throw new Error(parsedItemData.error.errors[0].message);
        }

        const [createdItem] = await db
            .insert(itemInRequestList)
            .values(parsedItemData.data)
            .returning();
        return createdItem as ItemInRequestList;
    }

    async getItemInRequestListById(id: number): Promise<ItemInRequestList> {
        const validId = z.number().int().nonnegative().parse(id);
        const foundItem = await db
            .select()
            .from(itemInRequestList)
            .where(eq(itemInRequestList.id, validId));

        if (foundItem.length === 0) {
            throw new Error("Item in request list not found");
        }
        return foundItem[0] as ItemInRequestList;
    }

    async getItemsInRequestList(
        requestId: number,
    ): Promise<ItemInRequestList[]> {
        const validRequestId = z.number().int().nonnegative().parse(requestId);
        const foundItems = await db
            .select()
            .from(itemInRequestList)
            .where(eq(itemInRequestList.requestId, validRequestId));
        return foundItems as ItemInRequestList[];
    }

    async updateItemInRequestList(
        itemData: UpdatedItemInRequestList,
    ): Promise<ItemInRequestList> {
        const parsedItemData =
            UpdatedItemInRequestListSchema.safeParse(itemData);
        if (!parsedItemData.success) {
            throw new Error(parsedItemData.error.errors[0].message);
        }

        const updatedItem = await db
            .update(itemInRequestList)
            .set(parsedItemData.data)
            .where(eq(itemInRequestList.id, parsedItemData.data.id))
            .returning();

        if (updatedItem.length === 0) {
            throw new Error("Item in request list not found for update");
        }

        return updatedItem[0] as ItemInRequestList;
    }

    async deleteItemInRequestList(id: number): Promise<void> {
        const validId = z.number().int().nonnegative().parse(id);
        try {
            await db
                .delete(itemInRequestList)
                .where(eq(itemInRequestList.id, validId));
        } catch {
            throw new Error("Failed to delete item in request list");
        }
    }

    async getAllRequestsForOrganization(
        organizationId: string,
    ): Promise<ItemInRequestList[]> {
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(organizationId);
        const foundItems = await db
            .select()
            .from(itemInRequestList)
            .where(eq(itemInRequestList.organizationId, validOrgId));
        return foundItems as ItemInRequestList[];
    }

    async deleteAllItemsInRequestList(requestId: number): Promise<void> {
        const validRequestId = z.number().int().nonnegative().parse(requestId);
        try {
            await db
                .delete(itemInRequestList)
                .where(eq(itemInRequestList.requestId, validRequestId));
        } catch {
            throw new Error("Failed to delete all items in request list");
        }
    }
}

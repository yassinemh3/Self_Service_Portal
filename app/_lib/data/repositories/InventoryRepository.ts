import { IInventoryRepository } from "@lib/data/interfaces";
import {
    CreatedInventory,
    Inventory,
    UpdatedInventory,
} from "@lib/data/entities";
import { db, inventory } from "../../../../db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
    CreatedInventorySchema,
    UpdatedInventorySchema,
} from "@lib/data/repoZodSchemas";

export class InventoryRepository implements IInventoryRepository {
    async getAllInventories(): Promise<Inventory[]> {
        const allInventory = await db.select().from(inventory);
        return allInventory as Inventory[];
    }

    async createInventory(inventoryData: CreatedInventory): Promise<Inventory> {
        const parsedInventoryData =
            CreatedInventorySchema.safeParse(inventoryData);
        if (!parsedInventoryData.success) {
            throw new Error(parsedInventoryData.error.errors[0].message);
        }

        const [createdInventory] = await db
            .insert(inventory)
            .values(parsedInventoryData.data)
            .returning();
        return createdInventory as Inventory;
    }

    async getInventoryById(id: number): Promise<Inventory> {
        const validId = z.number().int().parse(id);
        const foundInventory = await db
            .select()
            .from(inventory)
            .where(eq(inventory.id, validId));

        if (foundInventory.length === 0) {
            throw new Error("Inventory not found");
        }
        return foundInventory[0] as Inventory;
    }

    async getInventoryByOwnerId(ownerId: string): Promise<Inventory[]> {
        const validOwnerId = z
            .string()
            .length(32)
            .startsWith("user_")
            .parse(ownerId);
        const foundInventory = await db
            .select()
            .from(inventory)
            .where(eq(inventory.ownerId, validOwnerId));

        return foundInventory as Inventory[];
    }

    async updateInventory(inventoryData: UpdatedInventory): Promise<Inventory> {
        const parsedInventoryData =
            UpdatedInventorySchema.safeParse(inventoryData);
        if (!parsedInventoryData.success) {
            throw new Error(parsedInventoryData.error.errors[0].message);
        }

        const updatedInventory = await db
            .update(inventory)
            .set(parsedInventoryData.data)
            .where(eq(inventory.id, parsedInventoryData.data.id))
            .returning();

        if (updatedInventory.length === 0) {
            throw new Error("Inventory not found for update");
        }
        return updatedInventory[0] as Inventory;
    }

    async deleteInventory(id: number): Promise<void> {
        const validId = z.number().int().parse(id);
        try {
            await db.delete(inventory).where(eq(inventory.id, validId));
        } catch {
            throw new Error("Failed to delete inventory");
        }
    }
}

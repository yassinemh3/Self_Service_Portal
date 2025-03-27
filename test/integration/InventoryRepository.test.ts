import { InventoryRepository } from "@lib/data/repositories/InventoryRepository";
import {db, itemInRequestList, request, shopItem, shopItemCategory} from "../../db";
import { inventory } from "../../db";
import { eq } from "drizzle-orm";
import { ItemInRequestStatusEnum, RequestStatusEnum} from "@lib/data/entities";


const request1 = {
    id: 10,
    userId: "user_123456789012345678901234561",
    status: RequestStatusEnum.Processing,
    creationDate: new Date(),
    organizationId: "org_123456789012345678901234567",
    updateDate: null,
};
const item1 = {
    id: 1,
    requestId: request1.id,
    itemId: 101,
    quantity: 2,
    organizationId: "org_123456789012345678901234567",
    status: ItemInRequestStatusEnum.Accepted,
};
const item2 = {
    id: 2,
    requestId: request1.id,
    itemId: 102,
    quantity: 2,
    organizationId: "org_123456789012345678901234567",
    status: ItemInRequestStatusEnum.Accepted,
}

const ShopItem =  [ {
        id: 101,
        name: "Item 101",
        description: "Description for Item 101",
        url: "https://example.com/item101",
        categoryId: 1, // Use the valid categoryId
        stock: 10,
        organizationId: "org_123456789012345678901234567",
    },
    {
        id: 102,
        name: "Item 102",
        description: "Description for Item 102",
        url: "https://example.com/item102",
        categoryId: 1, // Use the valid categoryId
        stock: 5,
        organizationId: "org_123456789012345678901234567",
    }];
const testInventory = {
    ownerId: "user_123456789012345678901234568",
    itemId: item1.itemId,
    purchaseDate: new Date(),
    status: "active",
};
const testInventory2 = {
    ownerId: "user_123456789012345678901234568",
    itemId: item2.itemId,
    purchaseDate: new Date(),
    status: "inactive",
};
const ItemCategory = {
    id: 1, // Provide a valid categoryId
    name: "Test Category",
    organizationId: "org_123456789012345678901234567",
}

describe("InventoryRepository Integration Tests", () => {
    let repository: InventoryRepository;

    beforeAll(async () => {
        // Initialize the repository
        repository = new InventoryRepository();

        // Ensure the database is clean before running tests
        await db.delete(inventory);
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await db.delete(inventory);
    });

    describe("getAllInventories", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(inventory);
            await db.delete(request);
            await db.delete(itemInRequestList);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);

        });

        it("should return all inventories from the database", async () => {
            // Insert a category into shopItemCategory
            await db.insert(shopItemCategory).values(ItemCategory);

            // Insert test data into the shop_item table
            await db.insert(shopItem).values(ShopItem);


            await db.insert(request).values(request1);

            await db.insert(itemInRequestList).values([item1, item2]);

            await db.insert(inventory).values([testInventory, testInventory2]);

            // Call the repository method
            const result = await repository.getAllInventories();

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].ownerId).toEqual(testInventory.ownerId);
            expect(result[1].ownerId).toEqual(testInventory2.ownerId);
        });

    });

    describe("createInventory", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(inventory);
            await db.delete(request);
            await db.delete(itemInRequestList);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });

        it("should create a new inventory entry in the database", async () => {

                await db.insert(shopItemCategory).values(ItemCategory);

                await db.insert(shopItem).values(ShopItem);

                await db.insert(request).values(request1);

                await db.insert(itemInRequestList).values([item1, item2]);

            // Call the repository method
            const result = await repository.createInventory(testInventory);

            // Assert the result
            expect(result).toHaveProperty("id");
            expect(result.ownerId).toEqual(testInventory.ownerId);
            expect(result.itemId).toEqual(testInventory.itemId);

            // Verify the data was inserted into the database
            const [insertedInventory] = await db
                .select()
                .from(inventory)
                .where(eq(inventory.id, result.id));
            expect(insertedInventory).toEqual(result);
        });
    });

    describe("getInventoryById", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(inventory);
            await db.delete(request);
            await db.delete(itemInRequestList);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });
        it("should retrieve an inventory by id from the database", async () => {
            await db.insert(shopItemCategory).values(ItemCategory);

            await db.insert(shopItem).values(ShopItem);

            await db.insert(request).values(request1);

            await db.insert(itemInRequestList).values([item1, item2]);

            const [insertedInventory] = await db
                .insert(inventory)
                .values(testInventory)
                .returning();

            // Call the repository method
            const result = await repository.getInventoryById(insertedInventory.id);

            // Assert the result
            expect(result).toEqual(insertedInventory);
        });

        it("should throw an error if the inventory is not found", async () => {
            await expect(repository.getInventoryById(999)).rejects.toThrow(
                "Inventory not found",
            );
        });
    });

    describe("getInventoryByOwnerId", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(inventory);
            await db.delete(itemInRequestList);
            await db.delete(request);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });
        it("should retrieve inventories for a given owner ID", async () => {

            await db.insert(shopItemCategory).values(ItemCategory);

            await db.insert(shopItem).values(ShopItem);

            await db.insert(request).values(request1);

            await db.insert(itemInRequestList).values([item1, item2]);
            const ownerId = "user_123456789012345678901234568";

            await db.insert(inventory).values([testInventory, testInventory2]);

            // Call the repository method
            const result = await repository.getInventoryByOwnerId(ownerId);

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].ownerId).toEqual(ownerId);
            expect(result[1].ownerId).toEqual(ownerId);
        });

        it("should return an empty array if no inventories are found for the owner", async () => {
            const ownerId = "user_123456789012345678901234567";

            // Ensure no data exists for this owner
            await db.delete(inventory).where(eq(inventory.ownerId, ownerId));

            // Call the repository method
            const result = await repository.getInventoryByOwnerId(ownerId);

            // Assert the result
            expect(result).toEqual([]);
        });
    });

    describe("updateInventory", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(inventory);
            await db.delete(itemInRequestList);
            await db.delete(request);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });
        it("should update an inventory in the database", async () => {

            await db.insert(shopItemCategory).values(ItemCategory);

            await db.insert(shopItem).values(ShopItem);

            await db.insert(request).values(request1);

            await db.insert(itemInRequestList).values([item1, item2]);

            const [insertedInventory] = await db
                .insert(inventory)
                .values(testInventory)
                .returning();

            // Update the inventory
            const updateData = {
                id: insertedInventory.id,
                status: "inactive",
            };
            const result = await repository.updateInventory(updateData);

            // Assert the result
            expect(result.status).toEqual("inactive");

            // Verify the update in the database
            const [updatedInventory] = await db
                .select()
                .from(inventory)
                .where(eq(inventory.id, insertedInventory.id));
            expect(updatedInventory.status).toEqual("inactive");
        });

        it("should throw an error if the inventory is not found for update", async () => {
            const updateData = {
                id: 999,
                status: "inactive",
            };

            await expect(repository.updateInventory(updateData)).rejects.toThrow(
                "Inventory not found for update",
            );
        });
    });

    describe("deleteInventory", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(inventory);
            await db.delete(itemInRequestList);
            await db.delete(request);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });

        it("should delete an inventory from the database", async () => {

            await db.insert(shopItemCategory).values(ItemCategory);

            await db.insert(shopItem).values(ShopItem);

            await db.insert(request).values(request1);

            await db.insert(itemInRequestList).values([item1, item2]);

            const [insertedInventory] = await db
                .insert(inventory)
                .values(testInventory)
                .returning();

            // Call the repository method
            await repository.deleteInventory(insertedInventory.id);

            // Verify the deletion
            const [deletedInventory] = await db
                .select()
                .from(inventory)
                .where(eq(inventory.id, insertedInventory.id));
            expect(deletedInventory).toBeUndefined();
        });
    });
});
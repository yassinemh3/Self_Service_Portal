import { ShopItemRepository } from "@lib/data/repositories/ShopItemRepository";
import { db } from "../../db";
import { shopItem, shopItemCategory } from "../../db";
import { eq } from "drizzle-orm";
import {
    UpdatedShopItem,
} from "@lib/data/entities";

describe("ShopItemRepository Integration Tests", () => {
    let repository: ShopItemRepository;

    beforeAll(async () => {
        // Initialize the repository
        repository = new ShopItemRepository();

        // Ensure the database is clean before running tests
        await db.delete(shopItem);
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await db.delete(shopItem);
    });
    const testCategory = {
        id: 1,
        name: "Test Category",
        organizationId: "org_123456789012345678901234567",
    };
    const testShopItem = {
        name: "Test Item",
        description: "Test Description",
        url: "https://test.com",
        categoryId: testCategory.id, // Use the inserted category's ID
        stock: 10,
        organizationId: "org_123456789012345678901234567",
    };

    describe("createShopItem", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });

        it("should create a new shop item in the database", async () => {

            await db.insert(shopItemCategory).values(testCategory);

            // Call the repository method
            const createdItem = await repository.createShopItem(testShopItem);

            // Assert the result
            expect(createdItem).toHaveProperty("id");
            expect(createdItem.name).toEqual(testShopItem.name);
            expect(createdItem.description).toEqual(testShopItem.description);

            // Verify the data was inserted into the database
            const [insertedItem] = await db
                .select()
                .from(shopItem)
                .where(eq(shopItem.id, createdItem.id));
            expect(insertedItem).toEqual(createdItem);
        });
    });

    describe("getShopItemById", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });

        it("should retrieve a shop item by its ID from the database", async () => {
            await db.insert(shopItemCategory).values(testCategory);

            const [insertedItem] = await db
                .insert(shopItem)
                .values(testShopItem)
                .returning();

            // Call the repository method
            const result = await repository.getShopItemById(insertedItem.id);

            // Assert the result
            expect(result).toEqual(insertedItem);
        });

        it("should throw an error if the shop item is not found", async () => {
            await expect(repository.getShopItemById(999)).rejects.toThrow(
                "Shop item not found",
            );
        });
    });
    describe("updateShopItem", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });
        it("should update an existing shop item in the database", async () => {

            await db.insert(shopItemCategory).values(testCategory);

            const [insertedItem] = await db
                .insert(shopItem)
                .values(testShopItem)
                .returning();

            // Update the shop item
            const updatedData: UpdatedShopItem = {
                id: insertedItem.id,
                name: "Updated Item",
                stock: 20,
            };
            const result = await repository.updateShopItem(updatedData);

            // Assert the result
            expect(result.name).toEqual("Updated Item");
            expect(result.stock).toEqual(20);

            // Verify the update in the database
            const [updatedItem] = await db
                .select()
                .from(shopItem)
                .where(eq(shopItem.id, insertedItem.id));
            expect(updatedItem.name).toEqual("Updated Item");
            expect(updatedItem.stock).toEqual(20);
        });

        it("should throw an error if the shop item is not found for update", async () => {
            const updatedData: UpdatedShopItem = {
                id: 999,
                name: "Updated Item",
                stock: 20,
            };

            await expect(repository.updateShopItem(updatedData)).rejects.toThrow(
                "Shop item not found for update",
            );
        });
    });

    describe("getAllShopItemsInOrganization", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });
        it("should retrieve all shop items for a given organization", async () => {
            const orgId = "org_123456789012345678901234567";

            await db.insert(shopItemCategory).values(testCategory);

            const testShopItem2 = {
                name: "Test Item 2",
                description: "Test Description 2",
                url: "https://test.com/2",
                categoryId: testCategory.id, // Use the inserted category's ID
                stock: 20,
                organizationId: orgId,
            };
            await db.insert(shopItem).values([testShopItem, testShopItem2]);

            // Call the repository method
            const result = await repository.getAllShopItemsInOrganization(orgId);

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].organizationId).toEqual(orgId);
            expect(result[1].organizationId).toEqual(orgId);
        });

        it("should return an empty array if no shop items exist for the organization", async () => {
            const orgId = "org_123456789012345678901234567";

            // Ensure no data exists for this organization
            await db.delete(shopItem).where(eq(shopItem.organizationId, orgId));

            // Call the repository method
            const result = await repository.getAllShopItemsInOrganization(orgId);

            // Assert the result
            expect(result).toEqual([]);
        });
    });

    describe("getShopItemCategoryByShopItemId", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);

        });
        it("should retrieve the category of a shop item", async () => {

            await db.insert(shopItemCategory).values(testCategory);

            const [insertedItem] = await db
                .insert(shopItem)
                .values(testShopItem)
                .returning();

            // Call the repository method
            const result = await repository.getShopItemCategoryByShopItemId(
                insertedItem.id,
            );

            // Assert the result
            expect(result).toEqual(testCategory);
        });

    });

    describe("deleteShopItem", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);

        });
        it("should delete a shop item from the database", async () => {

            await db.insert(shopItemCategory).values(testCategory);

            const [insertedItem] = await db
                .insert(shopItem)
                .values(testShopItem)
                .returning();

            // Call the repository method
            await repository.deleteShopItem(insertedItem.id);

            // Verify the deletion
            const [deletedItem] = await db
                .select()
                .from(shopItem)
                .where(eq(shopItem.id, insertedItem.id));
            expect(deletedItem).toBeUndefined();
        });
});
});
import { ItemInRequestListRepository } from "@lib/data/repositories/ItemInRequestListRepository";
import {db, itemInRequestList, request, shopItem, shopItemCategory} from "../../db";
import {ItemInRequestStatusEnum, RequestStatusEnum} from "@lib/data/entities";
import { eq } from "drizzle-orm";

describe("ItemInRequestListRepository Integration Tests", () => {
 let repository: ItemInRequestListRepository;

    beforeAll(async () => {
        repository = new ItemInRequestListRepository();
        
        // Clear all tables in the correct order to respect foreign key constraints
        await db.delete(itemInRequestList);
        await db.delete(request);
        await db.delete(shopItem);
        await db.delete(shopItemCategory);

        // Insert base test data that will be referenced
        await db.insert(shopItemCategory).values({
            id: 1,
            name: "Test Category",
            organizationId: "org_123456789012345678901234567",
        });

        await db.insert(shopItem).values([
            {
                id: 20,
                name: "Item 20",
                description: "Description for Item 20",
                url: "https://example.com/item20",
                categoryId: 1,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            },
            {
                id: 21,
                name: "Item 21",
                description: "Description for Item 21",
                url: "https://example.com/item21",
                categoryId: 1,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            }
        ]);

        // Insert a base request that will be referenced
        await db.insert(request).values({
            id: 10,
            userId: "user_123456789012345678901234561",
            status: RequestStatusEnum.Processing,
            creationDate: new Date(),
            organizationId: "org_123456789012345678901234567",
            updateDate: null,
        });
    });

    afterAll(async () => {
        // Clean up in reverse order of dependencies
        await db.delete(itemInRequestList);
        await db.delete(request);
        await db.delete(shopItem);
        await db.delete(shopItemCategory);
    });
    describe("createItemInRequestList", () => {
        it("should create an item in request list", async () => {
            const insertData = {
                requestId: 10,  // Using the request created in beforeAll
                itemId: 20,    // Using the shop item created in beforeAll
                quantity: 5,
                organizationId: "org_123456789012345678901234567",
            };

            const result = await repository.createItemInRequestList(insertData);

            expect(result).toHaveProperty("id");
            expect(result.requestId).toEqual(insertData.requestId);
            expect(result.itemId).toEqual(insertData.itemId);
            expect(result.quantity).toEqual(insertData.quantity);
            expect(result.organizationId).toEqual(insertData.organizationId);
        });
    });
    describe("getItemInRequestListById", () => {
        it("should return an item if found", async () => {
            // Insert test data
            const testItem = {
                requestId: 10,
                itemId: 20,
                quantity: 5,
                organizationId: "org_123456789012345678901234567",
                status: ItemInRequestStatusEnum.Processing,
            };
            const [insertedItem] = await db
                .insert(itemInRequestList)
                .values(testItem)
                .returning();

            // Call the repository method
            const result = await repository.getItemInRequestListById(
                insertedItem.id,
            );

            // Assert the result
            expect(result).toEqual(insertedItem);
        });

        it("should throw an error if not found", async () => {
            await expect(
                repository.getItemInRequestListById(999),
            ).rejects.toThrow("Item in request list not found");
        });
    });

    describe("updateItemInRequestList", () => {
        it("should update an item in request list", async () => {
            // Insert test data
            const testItem = {
                requestId: 10,
                itemId: 20,
                quantity: 5,
                organizationId: "org_123456789012345678901234567",
                status: ItemInRequestStatusEnum.Processing,
            };
            const [insertedItem] = await db
                .insert(itemInRequestList)
                .values(testItem)
                .returning();

            // Update the item
            const updateData = {
                id: insertedItem.id,
                quantity: 10,
                status: ItemInRequestStatusEnum.Accepted,
            };
            const result = await repository.updateItemInRequestList(updateData);

            // Assert the result
            expect(result.quantity).toEqual(updateData.quantity);
            expect(result.status).toEqual(updateData.status);

            // Verify the update in the database
            const [updatedItem] = await db
                .select()
                .from(itemInRequestList)
                .where(eq(itemInRequestList.id, insertedItem.id));
            expect(updatedItem.quantity).toEqual(updateData.quantity);
            expect(updatedItem.status).toEqual(updateData.status);
        });

        it("should throw an error if the item is not found", async () => {
            const updateData = {
                id: 999,
                quantity: 10,
                status: ItemInRequestStatusEnum.Accepted,
            };

            await expect(
                repository.updateItemInRequestList(updateData),
            ).rejects.toThrow("Item in request list not found for update");
        });
    });

    describe("getItemsInRequestList", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(itemInRequestList);
            await db.delete(request);
            await db.delete(shopItem); // Clean up shop_item
            await db.delete(shopItemCategory); // Clean up shopItemCategory
        });
        it("should return items for a given request ID", async () => {
            await db.insert(shopItemCategory).values({
                id: 1, // Provide a valid categoryId
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            });

            // Insert test data into the shop_item table
            await db.insert(shopItem).values([
                {
                    id: 20,
                    name: "Item 20",
                    description: "Description for Item 20",
                    url: "https://example.com/item20",
                    categoryId: 1, // Use the valid categoryId
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    id: 21,
                    name: "Item 21",
                    description: "Description for Item 21",
                    url: "https://example.com/item21",
                    categoryId: 1, // Use the valid categoryId
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                }
            ]);

            // Insert test data into the request table
            const request1 = {
                id: 10,
                userId: "user_123456789012345678901234561",
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: "org_123456789012345678901234567",
                updateDate: null,
            };
            await db.insert(request).values(request1);

            // Insert test data
            const testItems = [
                {
                    requestId: 10,
                    itemId: 20,
                    quantity: 5,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
                {
                    requestId: 10,
                    itemId: 21,
                    quantity: 3,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
            ];
            await db.insert(itemInRequestList).values(testItems);

            // Call the repository method
            const result = await repository.getItemsInRequestList(10);

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].requestId).toEqual(10);
            expect(result[1].requestId).toEqual(10);
        });

        it("should return an empty array if no items are found", async () => {
            const result = await repository.getItemsInRequestList(999);
            expect(result).toEqual([]);
        });
    });

    describe("getAllRequestsForOrganization", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(itemInRequestList);
            await db.delete(request);
            await db.delete(shopItem); // Clean up shop_item
            await db.delete(shopItemCategory); // Clean up shopItemCategory
        });
        it("should return items for a given organization ID", async () => {
            await db.insert(shopItemCategory).values({
                id: 1, // Provide a valid categoryId
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            });

            // Insert test data into the shop_item table
            await db.insert(shopItem).values([
                {
                    id: 20,
                    name: "Item 20",
                    description: "Description for Item 20",
                    url: "https://example.com/item20",
                    categoryId: 1, // Use the valid categoryId
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    id: 21,
                    name: "Item 21",
                    description: "Description for Item 21",
                    url: "https://example.com/item21",
                    categoryId: 1, // Use the valid categoryId
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                }
            ]);

            // Insert test data into the request table
            const request1 = {
                id: 10,
                userId: "user_123456789012345678901234561",
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: "org_123456789012345678901234567",
                updateDate: null,
            };
            const request2 = {
                id: 11,
                userId: "user_123456789012345678901234562",
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: "org_123456789012345678901234567",
                updateDate: null,
            };
            await db.insert(request).values([request1,request2]);
            // Insert test data
            const testItems = [
                {
                    requestId: 10,
                    itemId: 20,
                    quantity: 5,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
                {
                    requestId: 11,
                    itemId: 21,
                    quantity: 3,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Accepted,
                },
            ];
            await db.insert(itemInRequestList).values(testItems);

            // Call the repository method
            const result = await repository.getAllRequestsForOrganization(
                "org_123456789012345678901234567",
            );

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].organizationId).toEqual(
                "org_123456789012345678901234567",
            );
            expect(result[1].organizationId).toEqual(
                "org_123456789012345678901234567",
            );
        });
    });

    describe("deleteAllItemsInRequestList", () => {
        beforeEach(async () => {
            // Clean up all relevant tables before each test
            await db.delete(itemInRequestList);
            await db.delete(request);
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });
        it("should delete all items for a given request ID", async () => {
            await db.insert(shopItemCategory).values({
                id: 1,
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            });

            // Insert test data into the shop_item table
            await db.insert(shopItem).values([
                {
                    id: 20,
                    name: "Item 20",
                    description: "Description for Item 20",
                    url: "https://example.com/item20",
                    categoryId: 1,
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    id: 21,
                    name: "Item 21",
                    description: "Description for Item 21",
                    url: "https://example.com/item21",
                    categoryId: 1, // Use the valid categoryId
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                }
            ]);

            // Insert test data into the request table
            const request1 = {
                id: 10,
                userId: "user_123456789012345678901234561",
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: "org_123456789012345678901234567",
                updateDate: null,
            };
            const request2 = {
                id: 11,
                userId: "user_123456789012345678901234562",
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: "org_123456789012345678901234567",
                updateDate: null,
            };
            await db.insert(request).values([request1,request2]);
            // Insert test data
            const testItems = [
                {
                    requestId: 10,
                    itemId: 20,
                    quantity: 5,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
                {
                    requestId: 10,
                    itemId: 21,
                    quantity: 3,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
            ];
            await db.insert(itemInRequestList).values(testItems);

            // Call the repository method
            await repository.deleteAllItemsInRequestList(10);

            // Verify the deletion
            const result = await db
                .select()
                .from(itemInRequestList)
                .where(eq(itemInRequestList.requestId, 10));
            expect(result.length).toBe(0);
        });
    });
});

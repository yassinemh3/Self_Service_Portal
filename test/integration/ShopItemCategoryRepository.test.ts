import { ShopItemCategoryRepository } from "@lib/data/repositories/ShopItemCategoryRepository";
import {db, shopItem, shopItemCategory} from "../../db";
import { eq } from "drizzle-orm";

describe("ShopItemCategoryRepository Integration Tests", () => {
    let repository: ShopItemCategoryRepository;

    beforeAll(async () => {
        // Initialize the repository
        repository = new ShopItemCategoryRepository();

        // Ensure the database is clean before running tests
        await db.delete(shopItem);
        await db.delete(shopItemCategory);
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await db.delete(shopItem);
        await db.delete(shopItemCategory);

    });

    describe("createShopItemCategory", () => {
        it("should create a shop item category successfully", async () => {
            const categoryData = {
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };

            const result = await repository.createShopItemCategory(categoryData);

            expect(result).toHaveProperty("id");
            expect(result.name).toEqual(categoryData.name);
            expect(result.organizationId).toEqual(categoryData.organizationId);

            // Verify the data was inserted into the database
            const [insertedCategory] = await db
                .select()
                .from(shopItemCategory)
                .where(eq(shopItemCategory.id, result.id));
            expect(insertedCategory).toEqual(result);
        });

        it("should throw an error if validation fails", async () => {
            const invalidCategoryData = {
                name: "", // Invalid name (empty string)
                organizationId: "invalid_org_id", // Invalid organization ID
            };

            await expect(
                repository.createShopItemCategory(invalidCategoryData as never),
            ).rejects.toThrow("Organization ID must be 31 characters long");
        });
    });

    describe("getShopItemCategoryById", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
        });
        it("should retrieve a shop item category by id", async () => {
            // Insert test data
            const testCategory = {
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };
            const [insertedCategory] = await db
                .insert(shopItemCategory)
                .values(testCategory)
                .returning();

            // Call the repository method
            const result = await repository.getShopItemCategoryById(
                insertedCategory.id,
            );

            // Assert the result
            expect(result).toEqual(insertedCategory);
        });

        it("should throw an error if the category is not found", async () => {
            await expect(
                repository.getShopItemCategoryById(999),
            ).rejects.toThrow("Shop item category not found");
        });

        it("should throw an error if the id is invalid", async () => {
            await expect(
                repository.getShopItemCategoryById(-1),
            ).rejects.toThrow("Number must be greater than or equal to 0");
        });
    });

    describe("getAllShopItemCategories", () => {
        beforeEach(async () => {
            await db.delete(shopItemCategory);
            await db.delete(shopItem);
        });

        it("should retrieve all shop item categories", async () => {
            // Insert test data
            const testCategories = [
                {
                    name: "Category 1",
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    name: "Category 2",
                    organizationId: "org_123456789012345678901234568",
                },
            ];
            await db.insert(shopItemCategory).values(testCategories);

            // Call the repository method
            const result = await repository.getAllShopItemCategories();

            // Assert the result
            expect(result.length).toBe(2);
            expect(result[0].name).toEqual(testCategories[0].name);
            expect(result[1].name).toEqual(testCategories[1].name);
        });
    });

    describe("updateShopItemCategory", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
        });
        it("should update a shop item category successfully", async () => {
            // Insert test data
            const testCategory = {
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };
            const [insertedCategory] = await db
                .insert(shopItemCategory)
                .values(testCategory)
                .returning();

            // Update the category
            const updateData = {
                id: insertedCategory.id,
                name: "Updated Category",
                organizationId: "org_123456789012345678901234568",
            };
            const result = await repository.updateShopItemCategory(updateData);

            // Assert the result
            expect(result.name).toEqual(updateData.name);
            expect(result.organizationId).toEqual(updateData.organizationId);

            // Verify the update in the database
            const [updatedCategory] = await db
                .select()
                .from(shopItemCategory)
                .where(eq(shopItemCategory.id, insertedCategory.id));
            expect(updatedCategory.name).toEqual(updateData.name);
            expect(updatedCategory.organizationId).toEqual(
                updateData.organizationId,
            );
        });

        it("should throw an error if validation fails", async () => {
            const invalidCategoryData = {
                id: 1,
                name: "", // Invalid name (empty string)
                organizationId: "invalid_org_id", // Invalid organization ID
            };

            await expect(
                repository.updateShopItemCategory(invalidCategoryData as never),
            ).rejects.toThrow("Organization ID must be 31 characters long");
        });
    });

    describe("getAllShopItemCategoriesInOrganization", () => {

        beforeEach(async () => {
            await db.delete(shopItem);
            await db.delete(shopItemCategory);
        });

        it("should retrieve all shop item categories for a given organization", async () => {
            // Insert test data
            const testCategories = [
                {
                    name: "Category 1",
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    name: "Category 2",
                    organizationId: "org_123456789012345678901234567",
                },
            ];
            await db.insert(shopItemCategory).values(testCategories);

            // Call the repository method
            const result =
                await repository.getAllShopItemCategoriesInOrganization(
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

        it("should throw an error if the organization ID is invalid", async () => {
            await expect(
                repository.getAllShopItemCategoriesInOrganization(
                    "invalid_org_id",
                ),
            ).rejects.toThrow("Organization ID must be 31 characters long");
        });
    });

    describe("deleteShopItemCategory", () => {
        beforeEach(async () => {
            await db.delete(shopItem);
        });

        it("should delete a shop item category successfully", async () => {
            // Insert test data
            const testCategory = {
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };
            const [insertedCategory] = await db
                .insert(shopItemCategory)
                .values(testCategory)
                .returning();

            // Call the repository method
            await repository.deleteShopItemCategory(insertedCategory.id);

            // Verify the deletion
            const [deletedCategory] = await db
                .select()
                .from(shopItemCategory)
                .where(eq(shopItemCategory.id, insertedCategory.id));
            expect(deletedCategory).toBeUndefined();
        });
    });
});

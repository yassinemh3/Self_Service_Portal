import { db } from "../../db";
import { ShopItemRepository } from "@lib/data/repositories/ShopItemRepository";
import { shopItem, shopItemCategory } from "../../db";
import { eq } from "drizzle-orm";
import {
    CreatedShopItem,
    UpdatedShopItem,
    ShopItem,
    ShopItemCategory,
} from "@lib/data/entities";

jest.mock("../../db", () => ({
    db: {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
    },
    shopItem: {
        id: { primaryKey: true },
        name: {},
        description: {},
        url: {},
        categoryId: {},
        stock: {},
        organizationId: {},
    },
    shopItemCategory: {
        id: { primaryKey: true },
        name: {},
    },
}));

describe("ShopItemRepository", () => {
    let repository: ShopItemRepository;

    beforeAll(() => {
        repository = new ShopItemRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createShopItem", () => {
        it("should create a new shop item", async () => {
            const newShopItem: CreatedShopItem = {
                name: "Test Item",
                description: "Test Description",
                url: "https://test.com",
                categoryId: 1,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            };

            const mockCreatedItem: ShopItem = {
                id: 1,
                ...newShopItem,
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockCreatedItem]),
                }),
            });

            const createdItem = await repository.createShopItem(newShopItem);
            expect(createdItem).toEqual(mockCreatedItem);
            expect(db.insert).toHaveBeenCalledWith(shopItem);
            expect(db.insert(shopItem).values).toHaveBeenCalledWith(
                newShopItem,
            );
        });
    });

    describe("getShopItemById", () => {
        it("should retrieve a shop item by its ID", async () => {
            const mockShopItem: ShopItem = {
                id: 1,
                name: "Test Item",
                description: "Test Description",
                url: "https://test.com",
                categoryId: 1,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            };

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockShopItem]),
                }),
            });

            const foundItem = await repository.getShopItemById(1);
            expect(foundItem).toEqual(mockShopItem);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(shopItem);
            expect(db.select().from(shopItem).where).toHaveBeenCalledWith(
                eq(shopItem.id, 1),
            );
        });

        it("should throw an error if the shop item is not found", async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce([]),
                }),
            });

            await expect(repository.getShopItemById(999)).rejects.toThrow(
                "Shop item not found",
            );
        });
    });

    describe("updateShopItem", () => {
        it("should update an existing shop item", async () => {
            const updatedData: UpdatedShopItem = {
                id: 1,
                name: "Updated Item",
                stock: 20,
            };

            const mockUpdatedItem: ShopItem = {
                id: 1,
                name: "Updated Item",
                description: "Test Description",
                url: "https://test.com",
                categoryId: 1,
                stock: 20,
                organizationId: "org_123456789012345678901234567",
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest
                            .fn()
                            .mockResolvedValue([mockUpdatedItem]),
                    }),
                }),
            });

            const updatedItem = await repository.updateShopItem(updatedData);
            expect(updatedItem).toEqual(mockUpdatedItem);
            expect(db.update).toHaveBeenCalledWith(shopItem);
            expect(db.update(shopItem).set).toHaveBeenCalledWith(updatedData);
            expect(
                db.update(shopItem).set(mockUpdatedItem).where,
            ).toHaveBeenCalledWith(eq(shopItem.id, updatedData.id));
        });

        it("should throw an error if the shop item is not found", async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([]),
                    }),
                }),
            });

            const updatedData: UpdatedShopItem = {
                id: 999,
                name: "Updated Item",
                stock: 20,
            };

            await expect(
                repository.updateShopItem(updatedData),
            ).rejects.toThrow("Shop item not found for update");
        });
    });
    describe("getAllShopItemsInOrganization", () => {
        it("should retrieve all shop items for a given organization", async () => {
            const mockShopItems: ShopItem[] = [
                {
                    id: 1,
                    name: "Test Item 1",
                    description: "Test Description 1",
                    url: "https://test.com/1",
                    categoryId: 1,
                    stock: 10,
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    id: 2,
                    name: "Test Item 2",
                    description: "Test Description 2",
                    url: "https://test.com/2",
                    categoryId: 2,
                    stock: 20,
                    organizationId: "org_123456789012345678901234567",
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockShopItems),
                }),
            });

            const result = await repository.getAllShopItemsInOrganization(
                "org_123456789012345678901234567",
            );

            expect(result).toEqual(mockShopItems);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(shopItem);
            expect(db.select().from(shopItem).where).toHaveBeenCalledWith(
                eq(shopItem.organizationId, "org_123456789012345678901234567"),
            );
        });

        it("should throw an error if the organization ID is invalid", async () => {
            const invalidOrgId = "invalid_org_id";

            await expect(
                repository.getAllShopItemsInOrganization(invalidOrgId),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });

    describe("getShopItemCategoryByShopItemId", () => {
        it("should retrieve the category of a shop item", async () => {
            const mockShopItem: ShopItem = {
                id: 1,
                name: "Test Item",
                description: "Test Description",
                url: "https://test.com",
                categoryId: 1,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            };

            const mockCategory: ShopItemCategory = {
                id: 1,
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };

            jest.spyOn(repository, "getShopItemById").mockResolvedValueOnce(
                mockShopItem,
            );

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockCategory]),
                }),
            });

            const result = await repository.getShopItemCategoryByShopItemId(1);
            expect(result).toEqual(mockCategory);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(shopItemCategory);
            expect(
                db.select().from(shopItemCategory).where,
            ).toHaveBeenCalledWith(
                eq(shopItemCategory.id, mockShopItem.categoryId!),
            );
        });

        it("should throw an error if the shop item does not have a category", async () => {
            const mockShopItem: ShopItem = {
                id: 1,
                name: "Test Item",
                description: "Test Description",
                url: "https://test.com",
                categoryId: null,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            };

            jest.spyOn(repository, "getShopItemById").mockResolvedValueOnce(
                mockShopItem,
            );

            await expect(
                repository.getShopItemCategoryByShopItemId(1),
            ).rejects.toThrow("Shop item does not have a valid category ID");
        });

        it("should throw an error if the category is not found", async () => {
            const mockShopItem: ShopItem = {
                id: 1,
                name: "Test Item",
                description: "Test Description",
                url: "https://test.com",
                categoryId: 1,
                stock: 10,
                organizationId: "org_123456789012345678901234567",
            };

            jest.spyOn(repository, "getShopItemById").mockResolvedValueOnce(
                mockShopItem,
            );

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            await expect(
                repository.getShopItemCategoryByShopItemId(1),
            ).rejects.toThrow("Shop item category not found");
        });
    });

    describe("deleteShopItem", () => {
        it("should delete a shop item", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            await repository.deleteShopItem(1);
            expect(db.delete).toHaveBeenCalledWith(shopItem);
            expect(db.delete(shopItem).where).toHaveBeenCalledWith(
                eq(shopItem.id, 1),
            );
        });

        it("should throw an error if the shop item does not exist", async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest
                    .fn()
                    .mockRejectedValueOnce(
                        new Error("Failed to delete shop item"),
                    ),
            });

            await expect(repository.deleteShopItem(999)).rejects.toThrow(
                "Failed to delete shop item",
            );
        });
    });
});

import { ShopItemCategoryRepository } from "@lib/data/repositories/ShopItemCategoryRepository";
import { db, shopItemCategory } from "../../db";
import { CreatedShopItemCategory, ShopItemCategory } from "@lib/data/entities";
import { eq } from "drizzle-orm";

jest.mock("../../db", () => ({
    db: {
        insert: jest.fn(),
        select: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    shopItemCategory: {
        id: { primaryKey: true },
        name: {},
        organizationId: {},
    },
}));

describe("ShopItemCategoryRepository", () => {
    let repository: ShopItemCategoryRepository;

    beforeEach(() => {
        repository = new ShopItemCategoryRepository();
        jest.clearAllMocks();
    });

    describe("createShopItemCategory", () => {
        it("should create a shop item category successfully", async () => {
            const mockCategoryData: CreatedShopItemCategory = {
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };
            const mockCreatedCategory: ShopItemCategory = {
                id: 1,
                ...mockCategoryData,
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest
                        .fn()
                        .mockResolvedValue([mockCreatedCategory]),
                }),
            });

            const result =
                await repository.createShopItemCategory(mockCategoryData);
            expect(result).toEqual(mockCreatedCategory);
            expect(db.insert).toHaveBeenCalledWith(shopItemCategory);
            expect(db.insert(shopItemCategory).values).toHaveBeenCalledWith(
                mockCategoryData,
            );
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
        it("should retrieve a shop item category by id", async () => {
            const mockCategory: ShopItemCategory = {
                id: 1,
                name: "Test Category",
                organizationId: "org_123456789012345678901234567",
            };

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockCategory]),
                }),
            });

            const result = await repository.getShopItemCategoryById(1);
            expect(result).toEqual(mockCategory);
            expect(
                db.select().from(shopItemCategory).where,
            ).toHaveBeenCalledWith(eq(shopItemCategory.id, 1));
        });

        it("should throw an error if the category is not found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValueOnce([]),
                }),
            });

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
        it("should retrieve all shop item categories", async () => {
            const mockCategories: ShopItemCategory[] = [
                {
                    id: 1,
                    name: "Category 1",
                    organizationId: "org_123456789012345678901234567",
                },
                {
                    id: 2,
                    name: "Category 2",
                    organizationId: "org_123456789012345678901234568",
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue(mockCategories),
            });

            const result = await repository.getAllShopItemCategories();

            expect(result).toEqual(mockCategories);
            expect(db.select().from).toHaveBeenCalledWith(shopItemCategory);
        });
    });

    describe("updateShopItemCategory", () => {
        it("should update a shop item category successfully", async () => {
            const mockUpdatedCategory: ShopItemCategory = {
                id: 1,
                name: "Updated Category",
                organizationId: "org_123456789012345678901234568",
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest
                            .fn()
                            .mockResolvedValue([mockUpdatedCategory]),
                    }),
                }),
            });

            const result =
                await repository.updateShopItemCategory(mockUpdatedCategory);
            expect(result).toEqual(mockUpdatedCategory);
            expect(db.update).toHaveBeenCalledWith(shopItemCategory);
            expect(
                db.update(shopItemCategory).set(mockUpdatedCategory).where,
            ).toHaveBeenCalledWith(
                eq(shopItemCategory.id, mockUpdatedCategory.id),
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
        it("should retrieve all shop item categories for a given organization", async () => {
            const mockCategories: ShopItemCategory[] = [
                {
                    id: 1,
                    name: "Category 1",
                    organizationId: "org_123456789012345678901234568",
                },
                {
                    id: 2,
                    name: "Category 2",
                    organizationId: "org_123456789012345678901234565",
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockCategories),
                }),
            });

            const result =
                await repository.getAllShopItemCategoriesInOrganization(
                    "org_123456789012345678901234568",
                );
            expect(result).toEqual(mockCategories);
            expect(
                db.select().from(shopItemCategory).where,
            ).toHaveBeenCalledWith(
                eq(
                    shopItemCategory.organizationId,
                    "org_123456789012345678901234568",
                ),
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
        it("should delete a shop item category successfully", async () => {
            const mockDelete = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    execute: jest.fn().mockResolvedValue({}),
                }),
            });
            (db.delete as jest.Mock) = mockDelete;

            await expect(
                repository.deleteShopItemCategory(1),
            ).resolves.not.toThrow();
            expect(db.delete).toHaveBeenCalledWith(shopItemCategory);
            expect(mockDelete().where).toHaveBeenCalledWith(
                eq(shopItemCategory.id, 1),
            );
        });
    });
});

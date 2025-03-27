import { InventoryRepository } from "@lib/data/repositories/InventoryRepository";
import { db, inventory } from "../../db";
import { eq } from "drizzle-orm";
// import { Inventory } from "@lib/data/entities";

jest.mock("../../db", () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{}]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
    },
    inventory: {
        id: "id",
        ownerId: "ownerId",
        itemId: "itemId",
        purchaseDate: "purchaseDate",
        updateDate: "updateDate",
        status: "status",
    },
}));

describe("InventoryRepository", () => {
    let repository: InventoryRepository;

    beforeEach(() => {
        repository = new InventoryRepository();
        jest.clearAllMocks();
    });

    describe("getAllInventories", () => {
        it("should return all inventories", async () => {
            const mockInventories = [
                {
                    id: 1,
                    ownerId: "user_123456789012345678901234567",
                    itemId: 101,
                    purchaseDate: new Date(),
                    status: "active",
                },
                {
                    id: 2,
                    ownerId: "user_123456789012345678901234565",
                    itemId: 102,
                    purchaseDate: new Date(),
                    status: "inactive",
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockResolvedValue(mockInventories),
            });

            const result = await repository.getAllInventories();
            expect(result).toEqual(mockInventories);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(inventory);
        });
    });

    describe("createInventory", () => {
        it("should create a new inventory entry", async () => {
            const mockInventory = {
                ownerId: "user_123456789012345678901234567",
                itemId: 101,
                purchaseDate: new Date(),
                status: "active",
            };
            const mockCreatedInventory = {
                ownerId: mockInventory.ownerId,
                itemId: mockInventory.itemId,
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockInventory]),
                }),
            });

            const result = await repository.createInventory(mockInventory);
            expect(result).toEqual(mockInventory);
            expect(db.insert).toHaveBeenCalledWith(inventory);
            expect(db.insert(inventory).values).toHaveBeenCalledWith(
                mockCreatedInventory,
            );
        });
    });

    describe("getInventoryById", () => {
        it("should return an inventory if found", async () => {
            const mockInventory = {
                id: 1,
                ownerId: "user_123",
                itemId: 101,
                purchaseDate: new Date(),
                status: "active",
            };

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockInventory]),
                }),
            });

            const result = await repository.getInventoryById(1);
            expect(result).toEqual(mockInventory);
        });

        it("should throw an error if not found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            await expect(repository.getInventoryById(1)).rejects.toThrow(
                "Inventory not found",
            );
        });
    });

    describe("getInventoryByOwnerId", () => {
        it("should return inventories for a given owner ID", async () => {
            const mockInventories = [
                {
                    id: 1,
                    ownerId: "user_123456789012345678901234567",
                    itemId: 101,
                    purchaseDate: new Date(),
                    status: "active",
                },
                {
                    id: 2,
                    ownerId: "user_123456789012345678901234568",
                    itemId: 102,
                    purchaseDate: new Date(),
                    status: "inactive",
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockInventories),
                }),
            });

            const result = await repository.getInventoryByOwnerId(
                "user_123456789012345678901234567",
            );
            expect(result).toEqual(mockInventories);
        });

        it("should return an empty array if no inventories are found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            const result = await repository.getInventoryByOwnerId(
                "user_123455789012345078901034067",
            );
            expect(result).toEqual([]);
        });
    });

    describe("updateInventory", () => {
        it("should update an inventory", async () => {
            const mockUpdatedInventory = {
                id: 1,
                ownerId: "user_123456789012345678901234567",
                itemId: 101,
                purchaseDate: new Date(),
                status: "updated",
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest
                            .fn()
                            .mockResolvedValue([mockUpdatedInventory]),
                    }),
                }),
            });

            const result =
                await repository.updateInventory(mockUpdatedInventory);
            expect(result).toEqual(mockUpdatedInventory);
            expect(db.update).toHaveBeenCalledWith(inventory);
            expect(db.update(inventory).set).toHaveBeenCalledWith(
                mockUpdatedInventory,
            );
            expect(
                db.update(inventory).set(mockUpdatedInventory).where,
            ).toHaveBeenCalledWith(eq(inventory.id, mockUpdatedInventory.id));
        });

        it("should throw an error if the inventory is not found", async () => {
            const updateData = {
                id: 999,
                status: "inactive",
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(
                repository.updateInventory(updateData),
            ).rejects.toThrow("Inventory not found for update");
        });
    });

    describe("deleteInventory", () => {
        it("should delete an inventory", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            await repository.deleteInventory(1);
            expect(db.delete).toHaveBeenCalledWith(inventory);
            expect(db.delete(inventory).where).toHaveBeenCalledWith(
                eq(inventory.id, 1),
            );
        });

        it("should throw an error if deletion fails", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest
                    .fn()
                    .mockRejectedValue(new Error("Failed to delete inventory")),
            });

            await expect(repository.deleteInventory(999)).rejects.toThrow(
                "Failed to delete inventory",
            );
        });
    });
});

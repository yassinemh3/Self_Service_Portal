import { ItemInRequestListRepository } from "@lib/data/repositories/ItemInRequestListRepository";
import { db, itemInRequestList } from "../../db";
import { ItemInRequestStatusEnum } from "@lib/data/entities";
import { eq } from "drizzle-orm";

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
    itemInRequestList: {
        id: "id",
        requestId: "requestId",
        itemId: "itemId",
        quantity: "quantity",
        organizationId: "organizationId",
        status: "status",
    },
}));

describe("ItemInRequestListRepository", () => {
    let repository: ItemInRequestListRepository;

    beforeEach(() => {
        repository = new ItemInRequestListRepository();
        jest.clearAllMocks();
    });

    describe("createItemInRequestList", () => {
        it("should create an item in request list", async () => {
            const mockItem = {
                id: 1,
                requestId: 10,
                itemId: 20,
                quantity: 5,
                organizationId: "org_123456789012345678901234567",
                status: ItemInRequestStatusEnum.Processing,
            };
            const insertData = {
                requestId: mockItem.requestId,
                itemId: mockItem.itemId,
                quantity: mockItem.quantity,
                organizationId: mockItem.organizationId,
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockItem]),
                }),
            });

            const result = await repository.createItemInRequestList(insertData);
            expect(result).toEqual(mockItem);
            expect(db.insert).toHaveBeenCalledWith(itemInRequestList);
            expect(db.insert(itemInRequestList).values).toHaveBeenCalledWith(
                insertData,
            );
        });
    });

    describe("getItemInRequestListById", () => {
        it("should return an item if found", async () => {
            const mockItem = {
                id: 1,
                requestId: 10,
                itemId: 20,
                quantity: 5,
                organizationId: "org_123",
                status: ItemInRequestStatusEnum.Processing,
            };
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockItem]),
                }),
            });

            const result = await repository.getItemInRequestListById(1);
            expect(result).toEqual(mockItem);
        });

        it("should throw an error if not found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            await expect(
                repository.getItemInRequestListById(1),
            ).rejects.toThrow("Item in request list not found");
        });
    });

    describe("updateItemInRequestList", () => {
        it("should update an item in request list", async () => {
            const mockUpdatedItem = {
                id: 1,
                requestId: 10,
                itemId: 20,
                quantity: 10,
                organizationId: "org_123456789012345678901234567",
                status: ItemInRequestStatusEnum.Accepted,
            };

            const updateData = {
                id: mockUpdatedItem.id,
                quantity: mockUpdatedItem.quantity,
                status: mockUpdatedItem.status,
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

            const result = await repository.updateItemInRequestList(updateData);
            expect(result).toEqual(mockUpdatedItem);
            expect(db.update).toHaveBeenCalledWith(itemInRequestList);
            expect(db.update(itemInRequestList).set).toHaveBeenCalledWith(
                updateData,
            );
            expect(
                db.update(itemInRequestList).set(updateData).where,
            ).toHaveBeenCalledWith(eq(itemInRequestList.id, updateData.id));
        });

        it("should throw an error if the item is not found", async () => {
            const updateData = {
                id: 999,
                quantity: 10,
                status: ItemInRequestStatusEnum.Accepted,
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(
                repository.updateItemInRequestList(updateData),
            ).rejects.toThrow("Item in request list not found for update");
        });
    });

    describe("getItemsInRequestList", () => {
        it("should return items for a given request ID", async () => {
            const mockItems = [
                {
                    id: 1,
                    requestId: 10,
                    itemId: 20,
                    quantity: 5,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
                {
                    id: 2,
                    requestId: 10,
                    itemId: 21,
                    quantity: 3,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockItems),
                }),
            });

            const result = await repository.getItemsInRequestList(10);
            expect(result).toEqual(mockItems);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(itemInRequestList);
            expect(
                db.select().from(itemInRequestList).where,
            ).toHaveBeenCalledWith(eq(itemInRequestList.requestId, 10));
        });

        it("should return an empty array if no items are found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            const result = await repository.getItemsInRequestList(999);
            expect(result).toEqual([]);
        });
    });

    describe("getAllRequestsForOrganization", () => {
        it("should return items for a given organization ID", async () => {
            const mockItems = [
                {
                    id: 1,
                    requestId: 10,
                    itemId: 20,
                    quantity: 5,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Processing,
                },
                {
                    id: 2,
                    requestId: 11,
                    itemId: 21,
                    quantity: 3,
                    organizationId: "org_123456789012345678901234567",
                    status: ItemInRequestStatusEnum.Accepted,
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockItems),
                }),
            });

            const result = await repository.getAllRequestsForOrganization(
                "org_123456789012345678901234567",
            );
            expect(result).toEqual(mockItems);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(itemInRequestList);
            expect(
                db.select().from(itemInRequestList).where,
            ).toHaveBeenCalledWith(
                eq(
                    itemInRequestList.organizationId,
                    "org_123456789012345678901234567",
                ),
            );
        });
    });

    describe("deleteAllItemsInRequestList", () => {
        it("should delete all items for a given request ID", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            await repository.deleteAllItemsInRequestList(10);
            expect(db.delete).toHaveBeenCalledWith(itemInRequestList);
            expect(db.delete(itemInRequestList).where).toHaveBeenCalledWith(
                eq(itemInRequestList.requestId, 10),
            );
        });

        it("should throw an error if deletion fails", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest
                    .fn()
                    .mockRejectedValue(
                        new Error("Failed to delete all items in request list"),
                    ),
            });

            await expect(
                repository.deleteAllItemsInRequestList(999),
            ).rejects.toThrow("Failed to delete all items in request list");
        });
    });
});

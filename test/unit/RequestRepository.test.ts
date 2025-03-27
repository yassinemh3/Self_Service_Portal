import { RequestRepository } from "@lib/data/repositories/RequestRepository";
import { db, request } from "../../db";
import { RequestStatusEnum } from "@lib/data/entities";

jest.mock("../../db", () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{}]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
    },
    request: {
        id: "id",
        userId: "userId",
        status: "status",
        creationDate: "creationDate",
        organizationId: "organizationId",
        updateDate: "updateDate",
    },
}));

describe("RequestRepository", () => {
    let requestRepository: RequestRepository;

    beforeEach(() => {
        requestRepository = new RequestRepository();
        jest.clearAllMocks();
    });

    describe("createRequest", () => {
        it("should create a request with valid userId and orgId", async () => {
            const userId = "user_123456789012345678901234567";
            const orgId = "org_123456789012345678901234567";

            const mockRequest = {
                id: 1,
                userId: userId,
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: orgId,
                updateDate: null,
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockRequest]),
                }),
            });

            const result = await requestRepository.createRequest(userId, orgId);
            expect(result).toEqual(mockRequest);
            expect(db.insert).toHaveBeenCalledWith(request);
            expect(db.insert(request).values).toHaveBeenCalledWith({
                userId: userId,
                organizationId: orgId,
            });
        });

        it("should throw an error if userId is invalid", async () => {
            const invalidUserId = "invalid_user_id";
            const orgId = "org_123456789012345678901234567";

            await expect(
                requestRepository.createRequest(invalidUserId, orgId),
            ).rejects.toThrow("String must contain exactly 32 character(s)");
        });

        it("should throw an error if orgId is invalid", async () => {
            const userId = "user_123456789012345678901234567";
            const invalidOrgId = "invalid_org_id";

            await expect(
                requestRepository.createRequest(userId, invalidOrgId),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });
    describe("getRequestById", () => {
        it("should return a request if found", async () => {
            const mockRequest = {
                id: 1,
                userId: "user_12345678901234567890123456789012",
                status: RequestStatusEnum.Processing,
                creationDate: new Date(),
                organizationId: "org_1234567890123456789012345678901",
                updateDate: null,
            };

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue([mockRequest]),
            });

            const result = await requestRepository.getRequestById(1);
            expect(result).toEqual(mockRequest);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(request);
            expect(db.select().from(request).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.arrayContaining([expect.any(String)]),
                }),
            );
        });

        it("should throw an error if request not found", async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            await expect(requestRepository.getRequestById(1)).rejects.toThrow(
                "Request not found",
            );
        });

        it("should throw an error if id is invalid", async () => {
            await expect(
                requestRepository.getRequestById(-1),
            ).rejects.toThrow();
        });
    });
    describe("getAllRequestsInOrganization", () => {
        it("should return all requests in an organization", async () => {
            const mockRequests = [
                {
                    id: 1,
                    userId: "user_123456789012345678901234567",
                    status: RequestStatusEnum.Processing,
                    creationDate: new Date(),
                    organizationId: "org_123456789012345678901234567",
                    updateDate: new Date(),
                },
                {
                    id: 2,
                    userId: "user_123456789012345678901234568",
                    status: RequestStatusEnum.Processing,
                    creationDate: new Date(),
                    organizationId: "org_123456789012345678901234568",
                    updateDate: new Date(),
                },
            ];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockRequests),
                }),
            });

            const result = await requestRepository.getAllRequestsInOrganization(
                "org_123456789012345678901234562",
            );
            expect(result).toEqual(mockRequests);
            expect(db.select).toHaveBeenCalled();
            expect(db.select().from).toHaveBeenCalledWith(request);
            expect(db.select().from(request).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });

        it("should throw an error if orgId is invalid", async () => {
            await expect(
                requestRepository.getAllRequestsInOrganization(
                    "invalid_org_id",
                ),
            ).rejects.toThrow("String must contain exactly 31 character(s)");
        });
    });
    describe("updateRequest", () => {
        it("should update a request", async () => {
            const requestData = {
                id: 1,
                status: RequestStatusEnum.Accepted,
            };

            const mockUpdatedRequest = {
                id: 1,
                userId: "user_12345678901234567890123456789012",
                status: RequestStatusEnum.Accepted,
                creationDate: new Date(),
                organizationId: "org_1234567890123456789012345678901",
                updateDate: new Date(),
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest
                            .fn()
                            .mockResolvedValue([mockUpdatedRequest]),
                    }),
                }),
            });

            const result = await requestRepository.updateRequest(requestData);
            expect(result).toEqual(mockUpdatedRequest);
            expect(db.update).toHaveBeenCalledWith(request);
            expect(db.update(request).set).toHaveBeenCalledWith(requestData);
            expect(
                db.update(request).set(requestData).where,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });

        it("should throw an error if validation fails", async () => {
            const invalidRequestData = {
                id: 1,
                status: "invalid_status",
            };

            await expect(
                requestRepository.updateRequest(invalidRequestData as never),
            ).rejects.toThrow();
        });

        it("should throw an error if request not found for update", async () => {
            const requestData = {
                id: 1,
                status: RequestStatusEnum.Accepted,
            };

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(
                requestRepository.updateRequest(requestData),
            ).rejects.toThrow("Request not found for update");
        });
    });
    describe("deleteRequest", () => {
        it("should delete a request", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockResolvedValue({}),
            });

            await requestRepository.deleteRequest(1);
            expect(db.delete).toHaveBeenCalledWith(request);
            expect(db.delete(request).where).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryChunks: expect.any(Array),
                }),
            );
        });

        it("should throw an error if deletion fails", async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest
                    .fn()
                    .mockRejectedValue(new Error("Failed to delete request")),
            });

            await expect(requestRepository.deleteRequest(1)).rejects.toThrow(
                "Failed to delete request",
            );
        });
    });
});

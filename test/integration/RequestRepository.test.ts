import { RequestRepository } from "@lib/data/repositories/RequestRepository";
import { db } from "../../db";
import { RequestStatusEnum } from "@lib/data/entities";
import { request } from "../../db";
import { eq } from "drizzle-orm";

describe("RequestRepository Integration Tests", () => {
    let requestRepository: RequestRepository;

    beforeAll(async () => {
        // Initialize the repository
        requestRepository = new RequestRepository();
        await db.delete(request);
    });

    afterAll(async () => {
        // Clean up the database after tests
        await db.delete(request);
    });

    describe("createRequest", () => {
        it("should create a request in the database", async () => {
            const userId = "user_123456789012345678901234567";
            const orgId = "org_123456789012345678901234567";

            const result = await requestRepository.createRequest(userId, orgId);

            expect(result).toHaveProperty("id");
            expect(result.userId).toEqual(userId);
            expect(result.organizationId).toEqual(orgId);
            expect(result.status).toEqual(RequestStatusEnum.Processing);

            // Verify the request was actually inserted into the database
            const [insertedRequest] = await db
                .select()
                .from(request)
                .where(eq(request.id, result.id));

            expect(insertedRequest).toEqual(result);
        });
    });

    describe("getRequestById", () => {
        it("should retrieve a request by id", async () => {
            const userId = "user_123456789012345678901234567";
            const orgId = "org_123456789012345678901234567";

            const createdRequest = await requestRepository.createRequest(userId, orgId);

            const result = await requestRepository.getRequestById(createdRequest.id);

            expect(result).toEqual(createdRequest);
        });

        it("should throw an error if the request is not found", async () => {
            await expect(requestRepository.getRequestById(999)).rejects.toThrow("Request not found");
        });
    });

    describe("getAllRequestsByUserId", () => {
        beforeEach(async () => {
            await db.delete(request);
        });
        it("should retrieve all requests for a user in an organization", async () => {
            const userId = "user_123456789012345678901234567";
            const orgId = "org_123456789012345678901234567";

            await requestRepository.createRequest(userId, orgId);

            const result = await requestRepository.getAllRequestsByUserId(userId, orgId);

            expect(result.length).toBe(1);
            expect(result[0].userId).toEqual(userId);
            expect(result[0].organizationId).toEqual(orgId);
        });
    });

    describe("getAllRequestsInOrganization", () => {
        beforeEach(async () => {
            await db.delete(request);
        });
        it("should retrieve all requests in an organization", async () => {
            const orgId = "org_123456789012345678901234567";
            const userId1 = "user_123456789012345678901234567";
            const userId2 = "user_123456789012345678901234568";

            await requestRepository.createRequest(userId1, orgId);
            await requestRepository.createRequest(userId2, orgId);

            const result = await requestRepository.getAllRequestsInOrganization(orgId);

            expect(result.length).toBe(2);
            expect(result[0].organizationId).toEqual(orgId);
            expect(result[1].organizationId).toEqual(orgId);
        });
    });

    describe("updateRequest", () => {
        it("should update a request", async () => {
            const userId = "user_123456789012345678901234567";
            const orgId = "org_123456789012345678901234567";

            const createdRequest = await requestRepository.createRequest(userId, orgId);

            const updatedRequest = await requestRepository.updateRequest({
                id: createdRequest.id,
                status: RequestStatusEnum.Accepted,
            });

            expect(updatedRequest.status).toEqual(RequestStatusEnum.Accepted);

            // Verify the request was actually updated in the database
            const [dbRequest] = await db
                .select()
                .from(request)
                .where(eq(request.id, createdRequest.id));

            expect(dbRequest.status).toEqual(RequestStatusEnum.Accepted);
        });
    });

    describe("deleteRequest", () => {
        it("should delete a request", async () => {
            const userId = "user_123456789012345678901234567";
            const orgId = "org_123456789012345678901234567";

            const createdRequest = await requestRepository.createRequest(userId, orgId);

            await requestRepository.deleteRequest(createdRequest.id);

            // Verify the request was actually deleted from the database
            const [deletedRequest] = await db
                .select()
                .from(request)
                .where(eq(request.id, createdRequest.id));

            expect(deletedRequest).toBeUndefined();
        });
    });
});
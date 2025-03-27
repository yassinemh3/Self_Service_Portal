import { IRequestRepository } from "../interfaces";
import { Request, UpdatedRequest } from "@lib/data/entities";
import {
    CreatedRequestSchema,
    UpdatedRequestSchema,
} from "@lib/data/repoZodSchemas";
import { db, request } from "../../../../db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export class RequestRepository implements IRequestRepository {
    async createRequest(userId: string, orgId: string): Promise<Request> {
        const validUserId = z
            .string()
            .length(32)
            .startsWith("user_")
            .parse(userId);
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(orgId);

        const requestData = {
            userId: validUserId,
            organizationId: validOrgId,
        };

        const parsedRequestData = CreatedRequestSchema.safeParse(requestData);
        if (!parsedRequestData.success) {
            throw new Error(parsedRequestData.error.errors[0].message);
        }

        const [createdRequest] = await db
            .insert(request)
            .values(parsedRequestData.data)
            .returning();
        return createdRequest as Request;
    }

    async getRequestById(id: number): Promise<Request> {
        const validId = z.number().int().nonnegative().parse(id);
        const foundRequest = await db
            .select()
            .from(request)
            .where(eq(request.id, validId));

        if (foundRequest.length === 0) {
            throw new Error("Request not found");
        }
        return foundRequest[0] as Request;
    }

    async getAllRequestsByUserId(
        userId: string,
        orgId: string,
    ): Promise<Request[]> {
        const validUserId = z
            .string()
            .length(32)
            .startsWith("user_")
            .parse(userId);
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(orgId);

        const foundRequests = await db
            .select()
            .from(request)
            .where(
                and(
                    eq(request.userId, validUserId),
                    eq(request.organizationId, validOrgId),
                ),
            )
            .orderBy(desc(request.creationDate));
        return foundRequests as Request[];
    }

    async getAllRequestsInOrganization(orgId: string): Promise<Request[]> {
        const validOrgId = z
            .string()
            .length(31)
            .startsWith("org_")
            .parse(orgId);

        const foundRequests = await db
            .select()
            .from(request)
            .where(eq(request.organizationId, validOrgId));
        return foundRequests as Request[];
    }

    async updateRequest(requestData: UpdatedRequest): Promise<Request> {
        const parsedRequestData = UpdatedRequestSchema.safeParse(requestData);
        if (!parsedRequestData.success) {
            throw new Error(parsedRequestData.error.errors[0].message);
        }

        const updatedRequest = await db
            .update(request)
            .set(parsedRequestData.data)
            .where(eq(request.id, parsedRequestData.data.id))
            .returning();

        if (updatedRequest.length === 0) {
            throw new Error("Request not found for update");
        }
        return updatedRequest[0] as Request;
    }

    async deleteRequest(id: number): Promise<void> {
        const validId = z.number().int().nonnegative().parse(id);
        try {
            await db.delete(request).where(eq(request.id, validId));
        } catch {
            throw new Error("Failed to delete request");
        }
    }
}

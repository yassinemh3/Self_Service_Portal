import { Request, UpdatedRequest } from "@lib/data/entities";

export interface IRequestRepository {
    createRequest(userId: string, orgId: string): Promise<Request>;
    getRequestById(id: number): Promise<Request>;
    getAllRequestsByUserId(userId: string, orgId: string): Promise<Request[]>;
    getAllRequestsInOrganization(orgId: string): Promise<Request[]>;
    updateRequest(request: UpdatedRequest): Promise<Request>;
    deleteRequest(id: number): Promise<void>;
}

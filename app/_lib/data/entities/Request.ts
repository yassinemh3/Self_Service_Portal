import { RequestStatusEnum } from "@lib/data/entities/RequestStatusEnum";

export interface Request {
    id: number;
    userId: string;
    status: RequestStatusEnum;
    creationDate: Date;
    organizationId: string;
    updateDate?: Date;
}

export interface UpdatedRequest extends Partial<Omit<Request, "id">> {
    id: number;
}

import { TicketStatusEnum } from "@lib/data/entities/TicketStatusEnum";

export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: TicketStatusEnum;
    ownerId: string;
    creationDate: Date;
    organizationId: string;
    supportId?: string;
    updateDate?: Date;
}

export interface CreatedTicket
    extends Omit<
        Partial<Ticket>,
        "title" | "description" | "ownerId" | "organizationId" | "status"
    > {
    title: string;
    description: string;
    ownerId: string;
    organizationId: string;
}

export interface UpdatedTicket extends Partial<Omit<Ticket, "id">> {
    id: number;
}

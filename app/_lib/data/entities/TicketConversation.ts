export interface TicketConversation {
    id: number;
    ticketId: number;
    userId: string;
    content: string;
    creationDate: Date;
}

export interface CreatedTicketConversation
    extends Omit<TicketConversation, "id" | "creationDate"> {
    ticketId: number;
    userId: string;
    content: string;
}

export interface UpdatedTicketConversation
    extends Partial<Omit<TicketConversation, "id">> {
    id: number;
}

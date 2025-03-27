export interface TicketScreenshot {
    id: number;
    ticketId: number;
    url: string;
}

export interface UpdatedTicketScreenshot
    extends Partial<Omit<TicketScreenshot, "id">> {
    id: number;
}

export interface CreatedTicketScreenshot extends Omit<TicketScreenshot, "id"> {
    ticketId: number;
    url: string;
}

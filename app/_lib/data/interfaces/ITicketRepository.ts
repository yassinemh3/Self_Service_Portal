import { CreatedTicket, Ticket, UpdatedTicket } from "../entities/Ticket";

export interface ITicketRepository {
    createTicket(ticket: CreatedTicket): Promise<Ticket>;
    getTicketById(id: number): Promise<Ticket>;
    getTicketsByUserId(userId: string, orgId: string): Promise<Ticket[]>;
    getTicketsByOrganizationId(orgId: string): Promise<Ticket[]>;
    updateTicket(ticket: UpdatedTicket): Promise<Ticket>;
    deleteTicket(id: number): Promise<void>;
}

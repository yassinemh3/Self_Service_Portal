import {
    TicketConversation,
    CreatedTicketConversation,
} from "@lib/data/entities";
import { UpdatedTicketConversation } from "@lib/data/entities/TicketConversation";

export interface ITicketConversationRepository {
    createTicketConversation(
        newTicketConversation: CreatedTicketConversation,
    ): Promise<TicketConversation>;
    getTicketConversationById(id: number): Promise<TicketConversation>;
    getTicketConversationsByTicketId(
        ticketId: number,
    ): Promise<TicketConversation[]>;
    updateTicketConversation(
        ticketConversation: UpdatedTicketConversation,
    ): Promise<TicketConversation>;
    deleteTicketConversation(id: number): Promise<void>;
    getAllTicketConversationsInTicket(
        ticketId: number,
    ): Promise<TicketConversation[]>;
}

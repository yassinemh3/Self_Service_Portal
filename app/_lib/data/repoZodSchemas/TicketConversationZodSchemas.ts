import { z } from "zod";

export const TicketConversationSchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    ticketId: z
        .number()
        .int()
        .nonnegative({ message: "Ticket ID must be a non-negative integer" }),
    userId: z
        .string()
        .length(32, { message: "Owner ID must be 32 characters long" }),
    content: z.string().min(1, { message: "Content is required" }),
    creationDate: z.date(),
});

export const CreatedTicketConversationSchema = TicketConversationSchema.omit({
    id: true,
    creationDate: true,
}).extend({
    ticketId: z
        .number()
        .int()
        .nonnegative({ message: "Ticket ID must be a non-negative integer" }),
    userId: z
        .string()
        .length(32, { message: "Owner ID must be 32 characters long" }),
    content: z.string().min(1, { message: "Content is required" }),
});

export const UpdatedTicketConversationSchema =
    TicketConversationSchema.partial().extend({
        id: z
            .number()
            .int()
            .nonnegative({ message: "ID must be a non-negative integer" }),
    });

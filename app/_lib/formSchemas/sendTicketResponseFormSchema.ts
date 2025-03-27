import * as z from "zod";

export const sendTicketResponseFormSchema = z.object({
    content: z
        .string()
        .min(1, { message: "Content is required" })
        .max(500, { message: "Content must be at most 500 characters long" }),
    ticketId: z
        .number()
        .int()
        .nonnegative({ message: "Ticket ID must be a non-negative integer" }),
});

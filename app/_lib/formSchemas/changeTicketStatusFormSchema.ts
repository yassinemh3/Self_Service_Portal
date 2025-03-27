import { z } from "zod";
import { TicketStatusEnum } from "@lib/data/entities";

export const changeTicketStatusFormSchema = z.object({
    status: z.nativeEnum(TicketStatusEnum, { message: "Invalid status" }),
    ticketId: z
        .number()
        .int()
        .nonnegative({ message: "Ticket ID must be a non-negative integer" }),
});

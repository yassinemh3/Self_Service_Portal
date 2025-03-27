import { z } from "zod";

export const TicketScreenshotSchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    ticketId: z
        .number()
        .int()
        .nonnegative({ message: "Ticket ID must be a non-negative integer" }),
    url: z
        .string()
        .url({ message: "Invalid URL format" })
        .max(255, { message: "URL must not exceed 255 characters" }),
});

export const CreatedTicketScreenshotSchema = TicketScreenshotSchema.omit({
    id: true,
}).extend({
    ticketId: z
        .number()
        .int()
        .nonnegative({ message: "Ticket ID must be a non-negative integer" }),
    url: z
        .string()
        .url({ message: "Invalid URL format" })
        .max(255, { message: "URL must not exceed 255 characters" }),
});

export const UpdatedTicketScreenshotSchema =
    TicketScreenshotSchema.partial().extend({
        id: z
            .number()
            .int()
            .nonnegative({ message: "ID must be a non-negative integer" }),
    });

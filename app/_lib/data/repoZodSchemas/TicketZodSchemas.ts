import { z } from "zod";
import { TicketStatusEnum } from "@lib/data/entities/TicketStatusEnum";

export const TicketSchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    status: z.nativeEnum(TicketStatusEnum, { message: "Invalid status" }),
    ownerId: z
        .string()
        .length(32, { message: "Owner ID must be 32 characters long" })
        .startsWith("user_", { message: "Owner ID must start with 'user_'" }),
    creationDate: z.date({ message: "Invalid creation date" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
    supportId: z
        .string()
        .length(32, { message: "Support ID must be 32 characters long" })
        .startsWith("user_", { message: "Support ID must start with 'user_'" })
        .optional(),
    updateDate: z.date({ message: "Invalid update date" }).optional(),
});

export const CreatedTicketSchema = TicketSchema.omit({
    id: true,
    creationDate: true,
    updateDate: true,
    supportId: true,
    status: true,
}).extend({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    ownerId: z
        .string()
        .length(32, { message: "Owner ID must be 32 characters long" })
        .startsWith("user_", { message: "Owner ID must start with 'user_'" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
});

export const UpdatedTicketSchema = TicketSchema.partial().extend({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
});

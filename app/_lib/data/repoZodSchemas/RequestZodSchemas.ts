import { z } from "zod";
import { RequestStatusEnum } from "@lib/data/entities/RequestStatusEnum";

export const RequestSchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    userId: z
        .string()
        .length(32, { message: "User ID must be 32 characters long" })
        .startsWith("user_", { message: "User ID must start with 'user_'" }),
    status: z.nativeEnum(RequestStatusEnum, { message: "Invalid status" }),
    creationDate: z.date({ message: "Invalid creation date" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
    updateDate: z.date({ message: "Invalid update date" }).optional(),
});

export const CreatedRequestSchema = RequestSchema.omit({
    id: true,
    creationDate: true,
    updateDate: true,
    status: true,
}).extend({
    userId: z
        .string()
        .length(32, { message: "User ID must be 32 characters long" })
        .startsWith("user_", { message: "User ID must start with 'user_'" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
});

export const UpdatedRequestSchema = RequestSchema.partial().extend({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
});

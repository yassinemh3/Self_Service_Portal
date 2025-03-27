import { z } from "zod";
import { ItemInRequestStatusEnum } from "@lib/data/entities";

export const ItemInRequestListSchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    requestId: z
        .number()
        .int()
        .nonnegative({ message: "Request ID must be a non-negative integer" }),
    itemId: z
        .number()
        .int()
        .nonnegative({ message: "Item ID must be a non-negative integer" }),
    quantity: z
        .number()
        .int()
        .nonnegative({ message: "Quantity must be a non-negative integer" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
    status: z.nativeEnum(ItemInRequestStatusEnum, {
        message: "Invalid status",
    }),
});

export const CreatedItemInRequestListSchema = ItemInRequestListSchema.omit({
    id: true,
    status: true,
}).extend({
    requestId: z
        .number()
        .int()
        .nonnegative({ message: "Request ID must be a non-negative integer" }),
    itemId: z
        .number()
        .int()
        .nonnegative({ message: "Item ID must be a non-negative integer" }),
    quantity: z
        .number()
        .int()
        .nonnegative({ message: "Quantity must be a non-negative integer" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
});

export const UpdatedItemInRequestListSchema =
    ItemInRequestListSchema.partial().extend({
        id: z
            .number()
            .int()
            .nonnegative({ message: "ID must be a non-negative integer" }),
    });

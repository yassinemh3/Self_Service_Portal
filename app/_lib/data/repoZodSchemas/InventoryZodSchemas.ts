import { z } from "zod";

export const InventorySchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    ownerId: z
        .string()
        .length(32, { message: "Owner ID must be 32 characters long" })
        .startsWith("user_", { message: "Owner ID must start with 'user_'" }),
    itemId: z
        .number()
        .int()
        .nonnegative({ message: "Item ID must be a non-negative integer" }),
    purchaseDate: z.date({ message: "Invalid creation date" }),
    updateDate: z.date({ message: "Invalid update date" }).optional(),
    status: z.string().optional(),
});

export const CreatedInventorySchema = InventorySchema.omit({
    id: true,
    purchaseDate: true,
    updateDate: true,
    status: true,
}).extend({
    ownerId: z
        .string()
        .length(32, { message: "Owner ID must be 32 characters long" })
        .startsWith("user_", { message: "Owner ID must start with 'user_'" }),
    itemId: z
        .number()
        .int()
        .nonnegative({ message: "Item ID must be a non-negative integer" }),
});

export const UpdatedInventorySchema = InventorySchema.partial().extend({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
});

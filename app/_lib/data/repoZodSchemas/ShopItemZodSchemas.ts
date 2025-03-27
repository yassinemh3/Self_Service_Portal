import { z } from "zod";

export const ShopItemSchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    name: z.string().min(1, { message: "Name is required" }),
    url: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.number().optional(),
    stock: z
        .number()
        .int()
        .nonnegative({ message: "Stock must be a non-negative integer" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
});

export const CreatedShopItemSchema = ShopItemSchema.omit({
    id: true,
}).extend({
    name: z.string().min(1, { message: "Name is required" }),
    stock: z
        .number()
        .int()
        .nonnegative({ message: "Stock must be a non-negative integer" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
});

export const UpdatedShopItemSchema = ShopItemSchema.partial().extend({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
});

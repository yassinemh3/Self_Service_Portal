import { z } from "zod";

export const ShopItemCategorySchema = z.object({
    id: z
        .number()
        .int()
        .nonnegative({ message: "ID must be a non-negative integer" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
    name: z
        .string()
        .min(1, { message: "Name must be at least 1 character long" })
        .max(32, { message: "Name must be at most 32 characters long" }),
});

export const CreatedShopItemCategorySchema = ShopItemCategorySchema.omit({
    id: true,
}).extend({
    name: z
        .string()
        .min(1, { message: "Name must be at least 1 character long" })
        .max(32, { message: "Name must be at most 32 characters long" }),
    organizationId: z
        .string()
        .length(31, { message: "Organization ID must be 31 characters long" })
        .startsWith("org_", {
            message: "Organization ID must start with 'org_'",
        }),
});

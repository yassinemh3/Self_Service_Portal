import * as z from "zod";

export const updateInventoryStatusFormSchema = z.object({
    inventoryId: z.number().int().nonnegative(),
    status: z
        .string()
        .min(1, "Status is required")
        .max(32, "Status is too long"),
});

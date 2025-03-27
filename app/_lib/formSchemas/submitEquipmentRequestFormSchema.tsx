import * as z from "zod";

export const shopItemInCartSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    quantity: z.number().min(1),
});

export const articlesInShoppingCartSchema = z.array(shopItemInCartSchema);

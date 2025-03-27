"use client";

import { ShopItem, ShopItemInCart } from "@lib/data/entities";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/Card";
import Image from "next/image";
import { Skeleton } from "@components/ui/Skeleton";
import { Badge } from "@components/ui/Badge";
import { useEquipmentShopContext } from "@contexts/EquipmentShopContext";
import { toast } from "sonner";

interface ShopItemCardProps {
    shopItem: ShopItem;
}

export default function ShopItemCard({ shopItem }: ShopItemCardProps) {
    const { setArticlesInShoppingCart, articlesInShoppingCart } =
        useEquipmentShopContext();

    const handleClick = () => {
        const existingItem = articlesInShoppingCart.find(
            (item) => item.id === shopItem.id,
        );
        if (existingItem) {
            setArticlesInShoppingCart(
                articlesInShoppingCart.map((item: ShopItemInCart) =>
                    item.id === shopItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            );
        } else {
            setArticlesInShoppingCart([
                ...articlesInShoppingCart,
                { ...shopItem, quantity: 1 },
            ]);
        }
        toast.info(`${shopItem.name} added to the shopping cart`);
    };

    return (
        <Card
            key={shopItem.id}
            className={"cursor-pointer"}
            onClick={handleClick}
        >
            <CardHeader
                className={"h-48 w-full rounded-t-lg bg-background p-0"}
            >
                {shopItem.url ? (
                    <Image
                        src={shopItem.url}
                        alt={shopItem.name}
                        height={256}
                        width={256}
                        className={"h-full w-full rounded-t-lg object-cover"}
                    />
                ) : (
                    <Skeleton className="h-full w-full content-center rounded-b-none rounded-t-lg bg-background text-center">
                        <div>No Image</div>
                    </Skeleton>
                )}
            </CardHeader>
            <CardContent
                className={
                    "flex flex-row items-start justify-between border-t-2 p-3"
                }
            >
                <div>
                    <CardTitle>{shopItem.name}</CardTitle>
                    <CardDescription
                        className={"line-clamp-1 overflow-ellipsis"}
                    >
                        {shopItem.description}
                    </CardDescription>
                </div>
                <Badge className={"h-fit p-1"} variant={"secondary"}>
                    Stock: {shopItem.stock}
                </Badge>
            </CardContent>
        </Card>
    );
}

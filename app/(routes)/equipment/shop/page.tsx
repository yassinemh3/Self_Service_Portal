"use server";

import { auth } from "@clerk/nextjs/server";
import {
    shopItemCategoryRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs";
import { Input } from "@components/ui/Input";
import ShopItemCard from "@components/equipment/shop/ShopItemCard";
import EquipmentShopContextProvider from "@contexts/EquipmentShopContext";

import ShoppingCartContent from "@components/equipment/shop/ShoppingCartContent";

export default async function EquipmentShopPage() {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    const shopItemCategories =
        await shopItemCategoryRepository.getAllShopItemCategoriesInOrganization(
            orgId,
        );
    const shopItems =
        await shopItemRepository.getAllShopItemsInOrganization(orgId);

    const defaultCategory =
        shopItemCategories.length > 0 ? shopItemCategories[0].name : "default";

    return (
        <section>
            <h1 className={"text-center text-3xl font-semibold"}>
                Equipment Shop
            </h1>
            <EquipmentShopContextProvider>
                <Tabs
                    defaultValue={defaultCategory}
                    className="container mx-auto my-10"
                >
                    <div className={"flex justify-between"}>
                        <TabsList className={"mb-4 bg-card"}>
                            {shopItemCategories.length > 0 ? (
                                shopItemCategories.map((shopItemCategory) => (
                                    <TabsTrigger
                                        key={shopItemCategory.id}
                                        value={shopItemCategory.name}
                                    >
                                        {shopItemCategory.name}
                                    </TabsTrigger>
                                ))
                            ) : (
                                <TabsTrigger
                                    value="default"
                                    className={"text-black"}
                                >
                                    No Categories
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <div className={"flex items-center"}>
                            <Input
                                placeholder="Search for items..."
                                type="text"
                                className={"mr-4 w-96"}
                            />
                            <ShoppingCartContent />
                        </div>
                    </div>
                    {shopItemCategories.length > 0 ? (
                        shopItemCategories.map((shopItemCategory) =>
                            shopItems.length > 0 ? (
                                <TabsContent
                                    key={shopItemCategory.id}
                                    value={shopItemCategory.name}
                                    className={"grid grid-cols-6 gap-2"}
                                >
                                    {shopItems.map((shopItem) =>
                                        shopItem.categoryId ===
                                        shopItemCategory.id ? (
                                            <ShopItemCard
                                                key={shopItem.id}
                                                shopItem={shopItem}
                                            />
                                        ) : null,
                                    )}
                                </TabsContent>
                            ) : (
                                <TabsContent
                                    key={shopItemCategory.id}
                                    value={shopItemCategory.name}
                                    className={
                                        "h-96 w-full content-center text-center"
                                    }
                                >
                                    <span
                                        className={
                                            "text-xl text-muted-foreground"
                                        }
                                    >
                                        No Items Found
                                    </span>
                                </TabsContent>
                            ),
                        )
                    ) : shopItems.length > 0 ? (
                        <TabsContent
                            value={"default"}
                            className={"grid grid-cols-6"}
                        >
                            {shopItems.map((shopItem) => (
                                <ShopItemCard
                                    key={shopItem.id}
                                    shopItem={shopItem}
                                />
                            ))}
                        </TabsContent>
                    ) : (
                        <TabsContent
                            value={"default"}
                            className={"h-96 w-full content-center text-center"}
                        >
                            <span className={"text-xl text-muted-foreground"}>
                                No Items Found
                            </span>
                        </TabsContent>
                    )}
                </Tabs>
            </EquipmentShopContextProvider>
        </section>
    );
}

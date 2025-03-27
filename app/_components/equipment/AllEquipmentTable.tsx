"use server";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/Table";
import { Inventory, ShopItem } from "@lib/data/entities";
import { Skeleton } from "@components/ui/Skeleton";
import { fetchUserData, formatDate } from "@lib/utils";
import Image from "next/image";
import UpdateInventoryStatusForm from "@components/admin/UpdateInventoryStatusForm";

export default async function AllEquipmentTable({
    inventories,
    shopItems,
}: {
    inventories: Inventory[];
    shopItems: ShopItem[];
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className={"w-1/12"}></TableHead>
                    <TableHead className={"w-2/12"}>Item Name</TableHead>
                    <TableHead className={"w-2/12"}>Name</TableHead>
                    <TableHead className={"w-2/12"}>Purchase Date</TableHead>
                    <TableHead className={"w-2/12"}>Update Date</TableHead>
                    <TableHead className={"w-1/12"}>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inventories.map(async (inventory) => {
                    const shopItem = shopItems.find(
                        (shopItem) => shopItem.id === inventory.itemId,
                    );
                    const userData = await fetchUserData(inventory.ownerId);
                    return (
                        <TableRow key={inventory.id}>
                            <TableCell className={"w-1/12"}>
                                {shopItem?.url ? (
                                    <Image
                                        src={shopItem.url}
                                        alt={shopItem.name}
                                        className={
                                            "h-16 w-16 content-center rounded-lg bg-background text-center"
                                        }
                                        width={64}
                                        height={64}
                                    />
                                ) : (
                                    <Skeleton className="h-16 w-16 content-center rounded-lg bg-background text-center">
                                        <div>No Image</div>
                                    </Skeleton>
                                )}
                            </TableCell>
                            <TableCell className={"w-1/12"}>
                                {shopItem?.name}
                            </TableCell>
                            <TableCell className={"w-2/12"}>
                                <div className="flex items-center">
                                    <Image
                                        src={userData.image_url}
                                        alt={
                                            userData.first_name +
                                            " " +
                                            userData.last_name +
                                            " image"
                                        }
                                        className={
                                            "mr-2 h-12 w-12 content-center rounded-lg bg-background text-center"
                                        }
                                        width={48}
                                        height={48}
                                    />
                                    {userData.first_name} {userData.last_name}
                                </div>
                            </TableCell>
                            <TableCell className={"w-2/12"}>
                                {formatDate(inventory.purchaseDate)}
                            </TableCell>
                            <TableCell className={"w-1/12"}>
                                {inventory.updateDate
                                    ? formatDate(inventory.updateDate)
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <UpdateInventoryStatusForm
                                    inventoryId={inventory.id}
                                    currentStatus={inventory.status}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

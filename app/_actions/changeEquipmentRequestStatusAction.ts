"use server";

import { auth } from "@clerk/nextjs/server";
import { changeEquipmentRequestStatusFormSchema } from "@lib/formSchemas/changeEquipmentRequestStatusFormSchema";
import {
    inventoryRepository,
    itemInRequestRepository,
    requestRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import {
    RequestStatusEnum,
    ItemInRequestStatusEnum,
    ItemInRequestList,
} from "@lib/data/entities";
import { SafeParseSuccess } from "zod";
import { revalidatePath } from "next/cache";

async function adjustStock(itemInRequest: ItemInRequestList, quantity: number) {
    const shopItem = await shopItemRepository.getShopItemById(
        itemInRequest.itemId,
    );
    const newStock = shopItem.stock + quantity;
    await shopItemRepository.updateShopItem({
        id: shopItem.id,
        stock: newStock,
    });
}

async function transitionToAccepted(itemInRequest: ItemInRequestList) {
    const shopItem = await shopItemRepository.getShopItemById(
        itemInRequest.itemId,
    );
    if (shopItem.stock < itemInRequest.quantity) {
        return false;
    }
    await adjustStock(itemInRequest, -itemInRequest.quantity);

    const request = await requestRepository.getRequestById(
        itemInRequest.requestId,
    );
    await inventoryRepository.createInventory({
        ownerId: request.userId,
        itemId: itemInRequest.itemId,
        purchaseDate: new Date(),
    });

    // Check if the whole request should be set to Accepted
    const itemsInRequest = await itemInRequestRepository.getItemsInRequestList(
        itemInRequest.requestId,
    );
    const anyAccepted = itemsInRequest.some(
        (item) => item.status === ItemInRequestStatusEnum.Accepted,
    );

    if (anyAccepted) {
        await requestRepository.updateRequest({
            status: RequestStatusEnum.Accepted,
            updateDate: new Date(),
            id: itemInRequest.requestId,
        });
    }

    return true;
}

async function transitionFromAccepted(
    itemInRequest: ItemInRequestList,
    parsedData: SafeParseSuccess<{
        requestId: number;
        status: ItemInRequestStatusEnum | RequestStatusEnum;
        itemInRequestId?: number | undefined;
    }>,
) {
    await adjustStock(itemInRequest, itemInRequest.quantity);

    const request = await requestRepository.getRequestById(
        itemInRequest.requestId,
    );
    const inventories = await inventoryRepository.getInventoryByOwnerId(
        request.userId,
    );
    const inventoryItem = inventories.find(
        (inv) => inv.itemId === itemInRequest.itemId,
    );
    if (inventoryItem) {
        await inventoryRepository.deleteInventory(inventoryItem.id);
    }
    if (parsedData.data.itemInRequestId) {
        await itemInRequestRepository.updateItemInRequestList({
            status: parsedData.data.status as ItemInRequestStatusEnum,
            id: parsedData.data.itemInRequestId,
        });
    }

    if (parsedData.data.status === ItemInRequestStatusEnum.Declined) {
        const updatedItemsInRequest =
            await itemInRequestRepository.getItemsInRequestList(
                parsedData.data.requestId,
            );
        const allDeclined = updatedItemsInRequest.every(
            (item) => item.status === ItemInRequestStatusEnum.Declined,
        );

        if (allDeclined) {
            await requestRepository.updateRequest({
                status: RequestStatusEnum.Declined,
                updateDate: new Date(),
                id: parsedData.data.requestId,
            });
        }
    } else if (parsedData.data.status === ItemInRequestStatusEnum.Processing) {
        const updatedItemsInRequest =
            await itemInRequestRepository.getItemsInRequestList(
                parsedData.data.requestId,
            );
        const allProcessing = updatedItemsInRequest.every(
            (item) => item.status === ItemInRequestStatusEnum.Processing,
        );

        if (allProcessing) {
            await requestRepository.updateRequest({
                status: RequestStatusEnum.Processing,
                updateDate: new Date(),
                id: parsedData.data.requestId,
            });
        }
    }
    return true;
}

export default async function changeEquipmentRequestStatusAction(
    prevState: {
        message: string;
        success?: boolean;
        info?: boolean;
        error?: boolean;
    },
    formData: FormData,
) {
    try {
        const { userId, orgId } = await auth();

        if (!userId || !orgId) {
            return {
                message: "User not authenticated",
                error: true,
            };
        }

        const parsedData = changeEquipmentRequestStatusFormSchema.safeParse({
            status: formData.get("status"),
            requestId: Number(formData.get("requestId")),
            itemInRequestId: Number(formData.get("itemInRequestId")),
        });

        if (!parsedData.success) {
            const errorMessages = parsedData.error.errors.map(
                (error) => error.message,
            );
            return {
                message: errorMessages.join(", "),
                error: true,
            };
        }

        const itemsInRequest =
            await itemInRequestRepository.getItemsInRequestList(
                Number(parsedData.data.requestId),
            );

        if (parsedData.data.itemInRequestId) {
            const itemInRequest = itemsInRequest.find(
                (item) => item.id === Number(parsedData.data.itemInRequestId),
            );

            if (!itemInRequest) {
                return {
                    message: "Item in request not found",
                    error: true,
                };
            }

            if (itemInRequest.status === parsedData.data.status) {
                return {
                    message: "Status is already set to the desired value",
                    info: true,
                };
            }

            if (itemInRequest.status === ItemInRequestStatusEnum.Accepted) {
                await transitionFromAccepted(itemInRequest, parsedData);
            }

            if (parsedData.data.status === ItemInRequestStatusEnum.Accepted) {
                if (!(await transitionToAccepted(itemInRequest))) {
                    return {
                        message: "Not enough stock",
                        error: true,
                    };
                }
            }

            await itemInRequestRepository.updateItemInRequestList({
                status: parsedData.data.status as ItemInRequestStatusEnum,
                id: parsedData.data.itemInRequestId,
            });

            const updatedItemsInRequest =
                await itemInRequestRepository.getItemsInRequestList(
                    parsedData.data.requestId,
                );

            const allDeclined = updatedItemsInRequest.every(
                (item) => item.status === ItemInRequestStatusEnum.Declined,
            );

            if (allDeclined) {
                await requestRepository.updateRequest({
                    status: RequestStatusEnum.Declined,
                    updateDate: new Date(),
                    id: parsedData.data.requestId,
                });
            } else {
                const allProcessing = updatedItemsInRequest.every(
                    (item) =>
                        item.status === ItemInRequestStatusEnum.Processing,
                );

                if (allProcessing) {
                    await requestRepository.updateRequest({
                        status: RequestStatusEnum.Processing,
                        updateDate: new Date(),
                        id: parsedData.data.requestId,
                    });
                } else {
                    const anyAccepted = updatedItemsInRequest.some(
                        (item) =>
                            item.status === ItemInRequestStatusEnum.Accepted,
                    );

                    if (anyAccepted) {
                        await requestRepository.updateRequest({
                            status: RequestStatusEnum.Accepted,
                            updateDate: new Date(),
                            id: parsedData.data.requestId,
                        });
                    } else {
                        await requestRepository.updateRequest({
                            status: RequestStatusEnum.Processing,
                            updateDate: new Date(),
                            id: parsedData.data.requestId,
                        });
                    }
                }
            }
        } else {
            if (parsedData.data.status === RequestStatusEnum.Accepted) {
                for (const itemInRequest of itemsInRequest) {
                    if (!(await transitionToAccepted(itemInRequest))) {
                        return {
                            message:
                                "Not enough stock for item " +
                                itemInRequest.itemId,
                            error: true,
                        };
                    }
                }
            } else {
                for (const itemInRequest of itemsInRequest) {
                    if (
                        itemInRequest.status ===
                        ItemInRequestStatusEnum.Accepted
                    ) {
                        await transitionFromAccepted(itemInRequest, parsedData);
                    }
                }
            }

            await requestRepository.updateRequest({
                status: parsedData.data.status as RequestStatusEnum,
                updateDate: new Date(),
                id: parsedData.data.requestId,
            });

            for (const itemInRequest of itemsInRequest) {
                await itemInRequestRepository.updateItemInRequestList({
                    status: parsedData.data.status as ItemInRequestStatusEnum,
                    id: itemInRequest.id,
                });
            }

            const allDeclined = itemsInRequest.every(
                (item) => item.status === ItemInRequestStatusEnum.Declined,
            );

            if (allDeclined) {
                await requestRepository.updateRequest({
                    status: RequestStatusEnum.Declined,
                    updateDate: new Date(),
                    id: parsedData.data.requestId,
                });
            }
        }

        revalidatePath(
            `/equipment/request/${String(parsedData.data.requestId)}`,
        );
        revalidatePath(`/equipment/shop`);
        revalidatePath(`/equipment/all-requests`);
        revalidatePath(`/equipment/my-requests`);

        return {
            message: "Equipment Request (Item) Status Changed",
            success: true,
        };
    } catch (error) {
        console.error(error);
        return {
            message:
                "An error has occurred while Changing Equipment Request Status",
            error: true,
        };
    }
}

/*
### Transition to Accepted

**Function: `transitionToAccepted`**

**Purpose:**
- This function handles the transition of an item in the request to the `Accepted` status.

**Steps:**
1. Retrieve the shop item associated with the `itemInRequest`.
2. Check if the shop item has enough stock to fulfill the request.
3. If there is enough stock, adjust the stock by subtracting the quantity of the item in the request.
4. Return `true` if the transition is successful, otherwise return `false`.

**Side Effects:**
- The stock of the shop item is decreased by the quantity of the item in the request.

### Transition from Accepted

**Function: `transitionFromAccepted`**

**Purpose:**
- This function handles the transition of an item in the request from the `Accepted` status to another status.

**Steps:**
1. Adjust the stock by adding back the quantity of the item in the request.
2. If a specific item in the request is being updated, update its status.
3. If the new status is `Declined`, check if all items in the request are declined and update the request status accordingly.
4. If the new status is `Processing`, check if all items in the request are processing and update the request status accordingly.

**Side Effects:**
- The stock of the shop item is increased by the quantity of the item in the request.
- The status of the item in the request is updated.
- The status of the entire request may be updated based on the statuses of all items in the request.

### Adjust Stock

**Function: `adjustStock`**

**Purpose:**
- This function adjusts the stock of a shop item by a specified quantity.

**Steps:**
1. Retrieve the shop item associated with the `itemInRequest`.
2. Calculate the new stock by adding the specified quantity to the current stock.
3. Update the shop item with the new stock.

**Side Effects:**
- The stock of the shop item is updated.
*/

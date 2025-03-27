import { ItemInRequestStatusEnum } from "@lib/data/entities/ItemInRequestStatusEnum";

export interface ItemInRequestList {
    id: number;
    requestId: number;
    itemId: number;
    quantity: number;
    organizationId: string;
    status: ItemInRequestStatusEnum;
}

export interface CreatedItemInRequestList
    extends Omit<
        Partial<ItemInRequestList>,
        "requestId" | "itemId" | "quantity" | "organizationId"
    > {
    requestId: number;
    itemId: number;
    quantity: number;
    organizationId: string;
}

export interface UpdatedItemInRequestList
    extends Partial<Omit<ItemInRequestList, "id">> {
    id: number;
}

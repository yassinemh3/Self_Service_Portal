import {
    ItemInRequestList,
    CreatedItemInRequestList,
    UpdatedItemInRequestList,
} from "@lib/data/entities";

export interface IItemInRequestListRepository {
    createItemInRequestList(
        newItemInRequest: CreatedItemInRequestList,
    ): Promise<ItemInRequestList>;
    getItemInRequestListById(id: number): Promise<ItemInRequestList>;
    getItemsInRequestList(requestId: number): Promise<ItemInRequestList[]>;
    updateItemInRequestList(
        updatedItemInRequest: UpdatedItemInRequestList,
    ): Promise<ItemInRequestList>;
    deleteItemInRequestList(id: number): Promise<void>;
    getAllRequestsForOrganization(
        organizationId: string,
    ): Promise<ItemInRequestList[]>;
    deleteAllItemsInRequestList(requestId: number): Promise<void>;
}

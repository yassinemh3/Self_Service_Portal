import {
    Inventory,
    CreatedInventory,
    UpdatedInventory,
} from "@lib/data/entities";

export interface IInventoryRepository {
    createInventory(inventory: CreatedInventory): Promise<Inventory>;
    getAllInventories(): Promise<Inventory[]>;
    getInventoryById(id: number): Promise<Inventory>;
    getInventoryByOwnerId(ownerId: string): Promise<Inventory[]>;
    updateInventory(inventory: UpdatedInventory): Promise<Inventory>;
    deleteInventory(id: number): Promise<void>;
}

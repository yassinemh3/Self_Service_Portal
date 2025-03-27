import { TicketRepository } from "./TicketRepository";
import { ShopItemRepository } from "./ShopItemRepository";
import { ShopItemCategoryRepository } from "@lib/data/repositories/ShopItemCategoryRepository";
import { RequestRepository } from "./RequestRepository";
import { ItemInRequestListRepository } from "./ItemInRequestListRepository";
import { TicketScreenshotRepository } from "./TicketScreenshotRepository";
import { TicketConversationRepository } from "@lib/data/repositories/TicketConversationRepository";
import { InventoryRepository } from "@lib/data/repositories/InventoryRepository";

export const ticketRepository = new TicketRepository();
export const shopItemRepository = new ShopItemRepository();
export const shopItemCategoryRepository = new ShopItemCategoryRepository();
export const requestRepository = new RequestRepository();
export const itemInRequestRepository = new ItemInRequestListRepository();
export const ticketScreenshotRepository = new TicketScreenshotRepository();
export const ticketConversationRepository = new TicketConversationRepository();
export const inventoryRepository = new InventoryRepository();

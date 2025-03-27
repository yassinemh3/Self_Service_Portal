import { auth } from "@clerk/nextjs/server";
import changeEquipmentRequestStatusAction from "../../app/_actions/changeEquipmentRequestStatusAction";
import {
    inventoryRepository,
    itemInRequestRepository,
    requestRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import { RequestStatusEnum, ItemInRequestStatusEnum } from "@lib/data/entities";
import { revalidatePath } from "next/cache";

// Mock all dependencies
jest.mock("@clerk/nextjs/server");
jest.mock("@lib/data/repositories");
jest.mock("next/cache");

describe("changeEquipmentRequestStatusAction", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it("should return an error if the user is not authenticated", async () => {
        // Mock the auth function to return no userId or orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        const formData = new FormData();
        formData.append("status", RequestStatusEnum.Accepted);
        formData.append("requestId", "1");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "User not authenticated",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        const formData = new FormData();
        formData.append("status", "InvalidStatus");
        formData.append("requestId", "not-a-number");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: expect.stringContaining(
                "Expected number, received nan, Invalid input",
            ),
            error: true,
        });
    });

    it("should return an error if the item in request is not found", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the itemInRequestRepository to return an empty list
        (
            itemInRequestRepository.getItemsInRequestList as jest.Mock
        ).mockResolvedValue([]);

        const formData = new FormData();
        formData.append("status", ItemInRequestStatusEnum.Accepted);
        formData.append("requestId", "1");
        formData.append("itemInRequestId", "999");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Item in request not found",
            error: true,
        });
    });

    it("should return an info message if the status is already set to the desired value", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the itemInRequestRepository to return a specific item
        const mockItemInRequest = {
            id: 1,
            status: ItemInRequestStatusEnum.Accepted,
            itemId: 2,
            requestId: 1,
            quantity: 5,
        };
        (
            itemInRequestRepository.getItemsInRequestList as jest.Mock
        ).mockResolvedValue([mockItemInRequest]);

        const formData = new FormData();
        formData.append("status", ItemInRequestStatusEnum.Accepted);
        formData.append("requestId", "1");
        formData.append("itemInRequestId", "1");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Status is already set to the desired value",
            info: true,
        });
    });

    it("should return an error if there is not enough stock to transition to Accepted", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the itemInRequestRepository to return a specific item
        const mockItemInRequest = {
            id: 1,
            status: ItemInRequestStatusEnum.Processing,
            itemId: 2,
            requestId: 1,
            quantity: 5,
        };
        (
            itemInRequestRepository.getItemsInRequestList as jest.Mock
        ).mockResolvedValue([mockItemInRequest]);

        // Mock the shopItemRepository to return insufficient stock
        (shopItemRepository.getShopItemById as jest.Mock).mockResolvedValue({
            id: 2,
            stock: 3,
        });

        const formData = new FormData();
        formData.append("status", ItemInRequestStatusEnum.Accepted);
        formData.append("requestId", "1");
        formData.append("itemInRequestId", "1");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Not enough stock",
            error: true,
        });
    });

    it("should successfully transition to Accepted if there is enough stock", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the itemInRequestRepository to return a specific item
        const mockItemInRequest = {
            id: 1,
            status: ItemInRequestStatusEnum.Processing,
            itemId: 2,
            requestId: 1,
            quantity: 5,
        };
        (
            itemInRequestRepository.getItemsInRequestList as jest.Mock
        ).mockResolvedValue([mockItemInRequest]);

        // Mock the shopItemRepository to return sufficient stock
        (shopItemRepository.getShopItemById as jest.Mock).mockResolvedValue({
            id: 2,
            stock: 10,
        });

        // Mock the requestRepository to return a valid request
        (requestRepository.getRequestById as jest.Mock).mockResolvedValue({
            id: 1,
            userId: "user_123456789012345678901234567",
            status: RequestStatusEnum.Processing,
        });

        // Mock the update methods
        (shopItemRepository.updateShopItem as jest.Mock).mockResolvedValue(
            true,
        );
        (inventoryRepository.createInventory as jest.Mock).mockResolvedValue(
            true,
        );
        (
            itemInRequestRepository.updateItemInRequestList as jest.Mock
        ).mockResolvedValue(true);
        (requestRepository.updateRequest as jest.Mock).mockResolvedValue(true);

        const formData = new FormData();
        formData.append("status", ItemInRequestStatusEnum.Accepted);
        formData.append("requestId", "1");
        formData.append("itemInRequestId", "1");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Equipment Request (Item) Status Changed",
            success: true,
        });

        // Ensure revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/request/1");
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/shop");
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/all-requests");
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/my-requests");
    });

    it("should handle exceptions and return an error message", async () => {
        // Mock the auth function to throw an error
        (auth as unknown as jest.Mock).mockRejectedValue(
            new Error("Auth error"),
        );

        const formData = new FormData();
        formData.append("status", ItemInRequestStatusEnum.Accepted);
        formData.append("requestId", "1");

        const result = await changeEquipmentRequestStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message:
                "An error has occurred while Changing Equipment Request Status",
            error: true,
        });
    });
});

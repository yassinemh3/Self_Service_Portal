import { auth } from "@clerk/nextjs/server";
import updateInventoryStatusAction from "../../app/_actions/updateInventoryStatusAction";
import { inventoryRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock all dependencies
jest.mock("@clerk/nextjs/server");
jest.mock("@lib/data/repositories");
jest.mock("next/cache");

describe("updateInventoryStatusAction", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it("should return an error if the user is not authenticated or not in an organization", async () => {
        // Mock the auth function to return no userId or orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        const formData = new FormData();
        formData.append("inventoryId", "1");
        formData.append("status", "Active");

        const result = await updateInventoryStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "User not authenticated or not in an organization",
            error: true,
        });
    });

    it("should return an error if the user does not have permission to manage inventory", async () => {
        // Mock the auth function to return a userId and orgId but no admin role
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn().mockReturnValue(false), // No admin role
        });

        const formData = new FormData();
        formData.append("inventoryId", "1");
        formData.append("status", "Active");

        const result = await updateInventoryStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "You do not have permission to manage inventory",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock the auth function to return a userId, orgId, and admin role
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn().mockReturnValue(true), // Admin role
        });

        const formData = new FormData();
        formData.append("inventoryId", "not-a-number"); // Invalid inventoryId
        formData.append("status", ""); // Missing status

        const result = await updateInventoryStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: expect.stringContaining(
                "Expected number, received nan, Status is required",
            ),
            error: true,
        });
    });

    it("should successfully update the inventory status if all conditions are met", async () => {
        // Mock the auth function to return a userId, orgId, and admin role
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn().mockReturnValue(true), // Admin role
        });

        // Mock the repository method
        (inventoryRepository.updateInventory as jest.Mock).mockResolvedValue(
            true,
        );

        const formData = new FormData();
        formData.append("inventoryId", "1");
        formData.append("status", "Active");

        const result = await updateInventoryStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Inventory status updated successfully",
            success: true,
        });

        // Ensure revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/all-equipment");
    });

    it("should return an error if an exception occurs", async () => {
        // Mock the auth function to return a userId, orgId, and admin role
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn().mockReturnValue(true), // Admin role
        });

        // Mock the repository method to throw an error
        (inventoryRepository.updateInventory as jest.Mock).mockRejectedValue(
            new Error("Database error"),
        );

        const formData = new FormData();
        formData.append("inventoryId", "1");
        formData.append("status", "Active");

        const result = await updateInventoryStatusAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message:
                "An error has occurred while updating the inventory status",
            error: true,
        });
    });
});

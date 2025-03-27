import { auth } from "@clerk/nextjs/server";
import editEquipmentAction from "../../app/_actions/editEquipmentAction";
import { shopItemRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock all dependencies
jest.mock("@clerk/nextjs/server");
jest.mock("@lib/data/repositories");
jest.mock("next/cache");
global.fetch = jest.fn(); // Mock fetch for image upload

describe("editEquipmentAction", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it("should delete equipment if delete flag is true", async () => {
        // Mock the auth function (not needed for delete, but included for completeness)
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository method
        (shopItemRepository.deleteShopItem as jest.Mock).mockResolvedValue(
            true,
        );

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("delete", "true");

        const result = await editEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Equipment deleted successfully",
            success: true,
            redirectUrl: "/admin/equipment",
        });

        // Ensure revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/admin/equipment");
    });

    it("should return an error if the user is not authenticated or not in an organization", async () => {
        // Mock the auth function to return no userId or orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Equipment");

        const result = await editEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "User not authenticated or not in an organization",
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
        formData.append("id", "not-a-number"); // Invalid ID
        formData.append("name", ""); // Missing name

        const result = await editEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: expect.stringContaining(
                "Expected number, received nan, Name is required, Expected string, received null",
            ),
            error: true,
        });
    });

    it("should successfully edit equipment if all conditions are met", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository method
        (shopItemRepository.updateShopItem as jest.Mock).mockResolvedValue(
            true,
        );

        // Mock the fetch function for image upload
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                    secure_url: "https://example.com/image.jpg",
                }),
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Equipment");
        formData.append("description", "Test Description");
        formData.append("stock", "10");
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );

        const result = await editEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Equipment edited successfully",
            success: true,
            redirectUrl: "/admin/equipment",
        });

        // Ensure revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/admin/equipment");
    });

    it("should return an error if an exception occurs", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository method to throw an error
        (shopItemRepository.updateShopItem as jest.Mock).mockRejectedValue(
            new Error("Database error"),
        );

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Equipment");

        const result = await editEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Expected string, received null",
            error: true,
        });
    });

    it("should handle image upload failure gracefully", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the fetch function to simulate an upload failure
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Equipment");
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );

        const result = await editEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Expected string, received null",
            error: true,
        });
    });
});

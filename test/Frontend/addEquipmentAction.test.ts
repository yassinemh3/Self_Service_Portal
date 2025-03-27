import { auth } from "@clerk/nextjs/server";
import addEquipmentAction from "../../app/_actions/addEquipmentAction";
import { shopItemRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock all dependencies
jest.mock("@clerk/nextjs/server");
jest.mock("@lib/data/repositories");
jest.mock("next/cache");
global.fetch = jest.fn(); // Mock fetch for image upload

describe("addEquipmentAction", () => {
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
        formData.append("name", "Test Equipment");
        formData.append("description", "Test Description");
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );
        formData.append("stock", "10");

        const result = await addEquipmentAction(
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
        formData.append("name", ""); // Missing name
        formData.append("description", ""); // Missing description
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );
        formData.append("stock", "0"); // Invalid stock

        const result = await addEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: expect.stringContaining("Name is required"),
            error: true,
        });
    });

    it("should successfully add equipment if all conditions are met", async () => {
        // Mock the auth function to return a userId and orgId
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository method
        (shopItemRepository.createShopItem as jest.Mock).mockResolvedValue(
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
        formData.append("name", "Test Equipment");
        formData.append("description", "Test Description");
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );
        formData.append("stock", "10");

        const result = await addEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "Equipment created successfully",
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
        (shopItemRepository.createShopItem as jest.Mock).mockRejectedValue(
            new Error("Database error"),
        );

        const formData = new FormData();
        formData.append("name", "Test Equipment");
        formData.append("description", "Test Description");
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );
        formData.append("stock", "10");

        const result = await addEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "An error has occurred while adding the equipment",
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
        formData.append("name", "Test Equipment");
        formData.append("description", "Test Description");
        formData.append(
            "image",
            new File([""], "test.jpg", { type: "image/jpeg" }),
        );
        formData.append("stock", "10");

        const result = await addEquipmentAction(
            { message: "", success: false, error: false },
            formData,
        );

        expect(result).toEqual({
            message: "An error has occurred while adding the equipment",
            error: true,
        });
    });
});

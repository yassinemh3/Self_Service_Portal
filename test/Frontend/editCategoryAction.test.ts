import editCategoryAction from "../../app/_actions/editCategoryAction"; // Adjust the import path
import { auth } from "@clerk/nextjs/server";
import { shopItemCategoryRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock the dependencies
jest.mock("@clerk/nextjs/server", () => ({
    auth: jest.fn(),
}));
jest.mock("@lib/data/repositories", () => ({
    shopItemCategoryRepository: {
        deleteShopItemCategory: jest.fn(),
        updateShopItemCategory: jest.fn(),
    },
}));
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe("editCategoryAction", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return an error if the user is not authenticated", async () => {
        // Mock auth to return no user
        (auth as unknown as jest.Mock).mockReturnValueOnce({
            userId: null,
            orgId: null,
            has: jest.fn(() => false),
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Category");

        const result = await editCategoryAction({ message: "" }, formData);

        expect(result).toEqual({
            message: "User not authenticated or not in an organization",
            error: true,
        });
    });

    it("should return an error if the user does not have admin permissions", async () => {
        // Mock auth to return a user without admin permissions
        (auth as unknown as jest.Mock).mockReturnValueOnce({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn(() => false),
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Category");

        const result = await editCategoryAction({ message: "" }, formData);

        expect(result).toEqual({
            message: "User does not have permission to edit categories",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock auth to return a valid user
        (auth as unknown as jest.Mock).mockReturnValueOnce({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn(() => true),
        });

        const formData = new FormData();
        formData.append("id", "invalid-id"); // Invalid ID
        formData.append("name", ""); // Empty name

        const result = await editCategoryAction({ message: "" }, formData);

        expect(result.error).toBe(true);
        expect(result.message).toContain(
            "Expected number, received nan, Category name is required",
        );
        expect(result.message).toContain("Category name is required");
    });

    it("should delete the category if delete flag is true", async () => {
        // Mock auth to return a valid user
        (auth as unknown as jest.Mock).mockReturnValueOnce({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn(() => true),
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Category");
        formData.append("delete", "true");

        const result = await editCategoryAction({ message: "" }, formData);

        expect(
            shopItemCategoryRepository.deleteShopItemCategory,
        ).toHaveBeenCalledWith(1);
        expect(revalidatePath).toHaveBeenCalledWith("/admin/categories");
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/shop");
        expect(result).toEqual({
            message: "Category deleted successfully",
            success: true,
            redirectUrl: "/admin/categories",
        });
    });

    it("should update the category if delete flag is false", async () => {
        // Mock auth to return a valid user
        (auth as unknown as jest.Mock).mockReturnValueOnce({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn(() => true),
        });

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Updated Category");

        const result = await editCategoryAction({ message: "" }, formData);

        expect(
            shopItemCategoryRepository.updateShopItemCategory,
        ).toHaveBeenCalledWith({
            id: 1,
            name: "Updated Category",
            organizationId: "org_123456789012345678901234567",
        });
        expect(revalidatePath).toHaveBeenCalledWith("/admin/categories");
        expect(result).toEqual({
            message: "Category created successfully",
            success: true,
            redirectUrl: "/admin/categories",
        });
    });

    it("should return an error if an exception occurs", async () => {
        // Mock auth to return a valid user
        (auth as unknown as jest.Mock).mockReturnValueOnce({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
            has: jest.fn(() => true),
        });

        // Mock the repository to throw an error
        (
            shopItemCategoryRepository.updateShopItemCategory as jest.Mock
        ).mockRejectedValueOnce(new Error("Database error"));

        const formData = new FormData();
        formData.append("id", "1");
        formData.append("name", "Test Category");

        const result = await editCategoryAction({ message: "" }, formData);

        expect(result).toEqual({
            message: "An error has occurred while editing the category",
            error: true,
        });
    });
});

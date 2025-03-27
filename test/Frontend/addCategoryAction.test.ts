import addCategoryAction from "../../app/_actions/addCategoryAction";
import { auth } from "@clerk/nextjs/server";
import { shopItemCategoryRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => ({
    auth: jest.fn(),
}));
jest.mock("@lib/data/repositories", () => ({
    shopItemCategoryRepository: {
        createShopItemCategory: jest.fn(),
    },
}));
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe("addCategoryAction", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully create a category", async () => {
        // Mock auth
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock repository method
        (
            shopItemCategoryRepository.createShopItemCategory as jest.Mock
        ).mockResolvedValue({});

        const formData = new FormData();
        formData.append("name", "Test Category");

        const response = await addCategoryAction({ message: "" }, formData);

        expect(
            shopItemCategoryRepository.createShopItemCategory,
        ).toHaveBeenCalledWith({
            name: "Test Category",
            organizationId: "org_123456789012345678901234567",
        });

        expect(revalidatePath).toHaveBeenCalledWith(`/admin/categories`);
        expect(response).toEqual({
            message: "Category created successfully",
            success: true,
            redirectUrl: `/admin/categories`,
        });
    });

    it("should return an error if the user is not authenticated", async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        const formData = new FormData();
        formData.append("name", "Test Category");

        const response = await addCategoryAction({ message: "" }, formData);

        expect(response).toEqual({
            message: "User not authenticated or not in an organization",
            error: true,
        });
    });

    it("should return an error if category name is empty", async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        const formData = new FormData();
        formData.append("name", ""); // Empty name

        const response = await addCategoryAction({ message: "" }, formData);

        expect(response).toEqual({
            message: "Category name is required",
            error: true,
        });
    });

    it("should return an error if repository call fails", async () => {
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        (
            shopItemCategoryRepository.createShopItemCategory as jest.Mock
        ).mockRejectedValue(new Error("Database error"));

        const formData = new FormData();
        formData.append("name", "Test Category");

        const response = await addCategoryAction({ message: "" }, formData);

        expect(response).toEqual({
            message: "An error has occurred while adding the category",
            error: true,
        });
    });
});

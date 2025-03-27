// submitEquipmentRequestAction.test.ts
import submitEquipmentRequestAction from "../../app/_actions/submitEquipmentRequestAction";
import { auth } from "@clerk/nextjs/server";
import { itemInRequestRepository } from "@lib/data/repositories";
import { requestRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

jest.mock("@clerk/nextjs/server", () => ({
    auth: jest.fn(),
}));
jest.mock("@lib/data/repositories", () => ({
    requestRepository: {
        createRequest: jest.fn(),
    },
    itemInRequestRepository: {
        createItemInRequestList: jest.fn(),
    },
}));
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe("submitEquipmentRequestAction", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should submit an equipment request successfully", async () => {
        // Mock auth to return a valid user and organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository methods
        (requestRepository.createRequest as jest.Mock).mockResolvedValue({
            id: 1,
            userId: "user_123456789012345678901234567",
            organizationId: "org_123456789012345678901234567",
        });

        (
            itemInRequestRepository.createItemInRequestList as jest.Mock
        ).mockResolvedValue({
            id: 1,
            requestId: 1,
            itemId: 101,
            quantity: 2,
            organizationId: "org_123456789012345678901234567",
        });

        // Mock revalidatePath
        (revalidatePath as jest.Mock).mockImplementation(() => {});

        // Create a mock FormData object
        const formData = new FormData();
        formData.append(
            "articlesInShoppingCart",
            JSON.stringify([
                {
                    id: 101,
                    name: "Item 101",
                    description: "Test description",
                    url: "https://fakeimage.com/101.png",
                    quantity: 2,
                },
                {
                    id: 102,
                    name: "Item 102",
                    description: "Another description",
                    url: "https://fakeimage.com/102.png",
                    quantity: 1,
                },
            ]),
        );

        // Call the action
        const result = await submitEquipmentRequestAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "Equipment request submitted successfully",
            success: true,
            redirectUrl: "/equipment/request/1",
        });

        // Verify that the repository methods were called
        expect(requestRepository.createRequest).toHaveBeenCalledWith(
            "user_123456789012345678901234567",
            "org_123456789012345678901234567",
        );

        expect(
            itemInRequestRepository.createItemInRequestList,
        ).toHaveBeenCalledWith({
            requestId: 1,
            itemId: 101,
            quantity: 2,
            organizationId: "org_123456789012345678901234567",
        });

        expect(
            itemInRequestRepository.createItemInRequestList,
        ).toHaveBeenCalledWith({
            requestId: 1,
            itemId: 102,
            quantity: 1,
            organizationId: "org_123456789012345678901234567",
        });

        // Verify that revalidatePath was called
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/my-requests");
        expect(revalidatePath).toHaveBeenCalledWith("/equipment/all-requests");
    });

    it("should return an error if the user is not authenticated", async () => {
        // Mock auth to return no user or organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: null,
            orgId: null,
        });

        // Call the action
        const formData = new FormData();
        formData.append(
            "articlesInShoppingCart",
            JSON.stringify([
                {
                    id: 101,
                    name: "Item 101",
                    description: "Test description",
                    url: "https://fakeimage.com/101.png",
                    quantity: 2,
                },
            ]),
        );

        const result = await submitEquipmentRequestAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "User not authenticated or not in an organization",
            error: true,
        });
    });

    it("should return an error if the form data is invalid", async () => {
        // Mock auth to return a valid user and organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Call the action with invalid form data (missing quantity)
        const formData = new FormData();
        formData.append(
            "articlesInShoppingCart",
            JSON.stringify([
                {
                    id: 101,
                    name: "Item 101",
                    description: "Test description",
                    url: "https://fakeimage.com/101.png",
                },
            ]), // Missing quantity
        );

        const result = await submitEquipmentRequestAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message: "Required",
            error: true,
        });
    });

    it("should return an error if the repository throws an error", async () => {
        // Mock auth to return a valid user and organization ID
        (auth as unknown as jest.Mock).mockResolvedValue({
            userId: "user_123456789012345678901234567",
            orgId: "org_123456789012345678901234567",
        });

        // Mock the repository's createRequest method to throw an error
        (requestRepository.createRequest as jest.Mock).mockRejectedValue(
            new Error("Database error"),
        );

        // Call the action with valid form data
        const formData = new FormData();
        formData.append(
            "articlesInShoppingCart",
            JSON.stringify([
                {
                    id: 101,
                    name: "Item 101",
                    description: "Test description",
                    url: "https://fakeimage.com/101.png",
                    quantity: 2,
                },
            ]),
        );

        const result = await submitEquipmentRequestAction(
            { message: "", success: false, error: false },
            formData,
        );

        // Assert the result
        expect(result).toEqual({
            message:
                "An error has occurred while submitting the equipment request",
            error: true,
        });
    });
});

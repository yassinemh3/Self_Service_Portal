"use client";

import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    Sheet,
} from "@components/ui/Sheet";
import Image from "next/image";
import { useEquipmentShopContext } from "@contexts/EquipmentShopContext";
import { ShopItemInCart } from "@lib/data/entities";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import submitEquipmentRequestAction from "@actions/submitEquipmentRequestAction";

export default function ShoppingCartContent() {
    const { setArticlesInShoppingCart, articlesInShoppingCart } =
        useEquipmentShopContext();

    useEffect(() => {
        const savedCart = sessionStorage.getItem("articlesInShoppingCart");
        if (savedCart) {
            setArticlesInShoppingCart(JSON.parse(savedCart));
        }
    }, [setArticlesInShoppingCart]);

    useEffect(() => {
        sessionStorage.setItem(
            "articlesInShoppingCart",
            JSON.stringify(articlesInShoppingCart),
        );
    }, [articlesInShoppingCart]);

    const handleRemove = (id: number) => {
        setArticlesInShoppingCart(
            articlesInShoppingCart.filter(
                (article: ShopItemInCart) => article.id !== id,
            ),
        );
    };

    const handleQuantityChange = (id: number, quantity: number) => {
        setArticlesInShoppingCart(
            articlesInShoppingCart
                .map((article: ShopItemInCart) =>
                    article.id === id ? { ...article, quantity } : article,
                )
                .filter((article: ShopItemInCart) => article.quantity > 0),
        );
    };

    const initialState: {
        message: string;
        success?: boolean;
        error?: boolean;
        redirectUrl?: string;
    } = {
        message: "",
    };

    const [state, formAction, isPending] = useActionState(
        submitEquipmentRequestAction,
        initialState,
    );

    const router = useRouter();

    useEffect(() => {
        if (state && "error" in state && state.message !== "") {
            toast.error(state.message);
        } else if (state && "success" in state && state.message !== "") {
            toast.success(state.message);
            setArticlesInShoppingCart([]);
            if (state.redirectUrl) {
                router.push(state.redirectUrl);
            }
        }
    }, [state, router, setArticlesInShoppingCart]);

    const totalQuantity = articlesInShoppingCart.reduce(
        (acc, article) => acc + article.quantity,
        0,
    );

    return (
        <Sheet>
            <div className="relative">
                <SheetTrigger
                    className={
                        "inline-flex h-10 w-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0"
                    }
                >
                    <ShoppingCart />
                    {totalQuantity > 0 && (
                        <span className="absolute -right-2 -top-2 flex size-4 rounded-full border border-accent shadow-2xl">
                            <span className="absolute inline-flex size-full h-full w-full animate-ping rounded-full bg-primary p-1 opacity-75"></span>
                            <span className="relative inline-flex size-full items-center justify-center rounded-full bg-card text-xs font-medium text-card-foreground">
                                {totalQuantity}
                            </span>
                        </span>
                    )}
                </SheetTrigger>
            </div>
            <SheetContent>
                <SheetHeader className={"mb-6"}>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                        View and manage your shopping cart
                    </SheetDescription>
                </SheetHeader>
                {articlesInShoppingCart.length === 0 ? (
                    <div>Your shopping cart is empty</div>
                ) : (
                    articlesInShoppingCart.map((article: ShopItemInCart) => (
                        <div
                            className={
                                "flex w-full items-start justify-between border-y p-4"
                            }
                            key={article.id}
                        >
                            <Image
                                src={String(article.url)}
                                alt={article.name}
                                width={50}
                                height={50}
                            />
                            <span>
                                <p className={"text-xl font-medium"}>
                                    {article.name}
                                </p>
                                <p className={"text-sm text-muted-foreground"}>
                                    {article.description}
                                </p>
                            </span>

                            <div className={"flex flex-col space-y-2"}>
                                <Input
                                    type={"number"}
                                    value={article.quantity || 0}
                                    onChange={(e) =>
                                        handleQuantityChange(
                                            article.id,
                                            Number(e.target.value),
                                        )
                                    }
                                    size={2}
                                    className={"w-fit"}
                                />
                                <Button
                                    variant={"ghost"}
                                    onClick={() => handleRemove(article.id)}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        </div>
                    ))
                )}

                {articlesInShoppingCart.length > 0 && (
                    <div className={"mt-4 flex items-center justify-evenly"}>
                        <form action={formAction}>
                            <LoadingButton
                                loading={isPending}
                                type={"submit"}
                                name="articlesInShoppingCart"
                                value={JSON.stringify(articlesInShoppingCart)}
                            >
                                Submit Request
                            </LoadingButton>
                        </form>
                        <Button
                            variant={"destructive"}
                            onClick={() => setArticlesInShoppingCart([])}
                        >
                            Clear Cart
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

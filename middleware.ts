import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/public(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSupportRoute = createRouteMatcher(["/support/all-tickets(.*)"]);
const isManagerRoute = createRouteMatcher([
    "/equipment/all-requests(.*)",
    "/equipment/all-equipment(.*)",
]);

const isUserRoute = createRouteMatcher([
    "/support/my-tickets(.*)",
    "/support/submit-ticket(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    if (isAdminRoute(request)) {
        await auth.protect((has) => {
            return has({ role: "org:admin" });
        });
    }

    if (isSupportRoute(request)) {
        await auth.protect((has) => {
            return (
                has({ permission: "org:tickets:manage_all" }) ||
                has({ permission: "org:tickets:view_all" })
            );
        });
    }

    if (isManagerRoute(request)) {
        await auth.protect((has) => {
            return (
                has({ permission: "org:requests:manage_all" }) ||
                has({ permission: "org:requests:view_all" })
            );
        });
    }

    if (isUserRoute(request)) {
        await auth.protect((has) => {
            return (
                has({ permission: "org:requests:manage" }) ||
                has({ permission: "org:requests:submit" }) ||
                has({ permission: "org:requests:view" }) ||
                has({ permission: "org:tickets:submit" }) ||
                has({ permission: "org:tickets:view" })
            );
        });
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.css";
import { cn } from "@lib/cn";
import { ClerkProvider } from "@clerk/nextjs";
import { SyncActiveOrganization } from "@components/clerk/SyncActiveOrganization";
import { Toaster } from "@components/ui/Sonner";
import ThemeProvider from "@components/theming/ThemeProvider";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Self Serivce",
    description: "Corporate Self Service Portal",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <SyncActiveOrganization />
            <html lang="en" suppressHydrationWarning>
                <body
                    className={cn(inter.className, "antialiased")}
                    suppressHydrationWarning
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                        <Toaster
                            position={"top-center"}
                            expand={true}
                            richColors
                        />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

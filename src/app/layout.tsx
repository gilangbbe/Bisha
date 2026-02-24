import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Bisha — Banking Concept Trainer",
    description:
        "Differentiation-first learning tool for banking trainees. Compare, contrast, and conquer your exams.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#0a0a0f",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} antialiased`}>
                <main
                    style={{
                        minHeight: "100dvh",
                        paddingBottom: "80px",
                        maxWidth: "640px",
                        margin: "0 auto",
                        padding: "0 16px 88px",
                    }}
                >
                    {children}
                </main>
                <BottomNav />
            </body>
        </html>
    );
}

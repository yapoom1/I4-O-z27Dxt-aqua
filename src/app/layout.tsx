import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartSidebar from "@/components/CartSidebar";
import LoginModal from "@/components/LoginModal";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const fellix = localFont({
  src: [
    {
      path: "../../public/font/Fellix-TRIAL-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/font/Fellix-TRIAL-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-fellix",
});

export const metadata: Metadata = {
  title: "AquaCare Hi-Tech",
  description: "Premium Domestic RO Water Purifiers and Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fellix.variable}>
      <body>
        <CartProvider>
          <WishlistProvider>
            <ThemeProvider />
            {children}
            <WhatsAppButton />
            <CartSidebar />
            <LoginModal />
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

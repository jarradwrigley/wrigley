import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import AuthProvider from "@/providers/AuthProvider";
import CartSyncProvider from "@/providers/CartProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jarrad Wrigley | Country Artist",
  description: "The Official Website of Country Music Artist - Jarrad Wrigley",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add this to your main layout or app component, run once on app initialization

  const migrateOldCartData = () => {
    if (typeof window === "undefined") return;

    const MIGRATION_KEY = "cart-migration-v2-completed";

    // Check if migration already completed
    if (localStorage.getItem(MIGRATION_KEY)) {
      return;
    }

    try {
      // Get the current stored data
      const storedData = localStorage.getItem("letsgetwrigley");

      if (storedData) {
        const parsedData = JSON.parse(storedData);

        // Check if cart has old format items
        if (parsedData.state?.cart) {
          const hasOldFormatItems = parsedData.state.cart.some(
            (item: any) => item.id || item.name || !item.productId || !item.key
          );

          if (hasOldFormatItems) {
            console.log("🧹 Migrating old cart format...");

            // Clear the old cart data
            parsedData.state.cart = [];
            parsedData.state.total = 0;
            parsedData.state.cartSynced = false;

            // Save the cleaned data
            localStorage.setItem("letsgetwrigley", JSON.stringify(parsedData));

            console.log("✅ Cart migration completed");
          }
        }
      }

      // Mark migration as completed
      localStorage.setItem(MIGRATION_KEY, "true");
    } catch (error) {
      console.error("❌ Cart migration failed:", error);

      // If migration fails, clear everything to start fresh
      localStorage.removeItem("letsgetwrigley");
      localStorage.setItem(MIGRATION_KEY, "true");
    }
  };

  // Call this in your app initialization
  if (typeof window !== "undefined") {
    migrateOldCartData();
  }
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./icons/logo.svg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {/* <Navbar /> */}
          {/* <main className="flex justify-center items-start p-6 min-h-screen"> */}
          <CartSyncProvider>{children}</CartSyncProvider>
          {/* </main> */}
        </AuthProvider>
      </body>
    </html>
  );
}

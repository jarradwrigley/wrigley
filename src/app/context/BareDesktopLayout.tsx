"use client";

import { useStore } from "../../../store/store";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function BareDesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCartOpen, setIsCartOpen } = useStore();

  return (
    <div
      className="bare-desktop-layout desktop-only"
      // className="min-h-screen bg-black text-white"
    >
      {/* <Header /> */}
      {children}

      {/* <Footer /> */}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

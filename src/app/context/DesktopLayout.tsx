"use client";

import { useStore } from "../../../store/store";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingScreen from "../components/LoadingScreen";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isCartOpen, setIsCartOpen } = useStore();

  return (
    <div
      className="desktop-layout desktop-only"
      // className="min-h-screen bg-black text-white"
    >
      <Header />
      {children}

      <Footer />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
    </div>
  );
}

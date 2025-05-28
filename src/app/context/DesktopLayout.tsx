import Footer from "../components/Footer";
import Header from "../components/Header";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

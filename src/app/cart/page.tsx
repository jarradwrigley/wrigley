import DesktopCheckoutPage from "../components/(desktop)/Checkout";
import DesktopLayout from "../context/DesktopLayout";

export default async function Checkout() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopCheckoutPage />
        {/* <div>Checkout</div> */}
      </DesktopLayout>
    </>
  );
}

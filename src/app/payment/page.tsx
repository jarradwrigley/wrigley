import DesktopPaymentPage from "../components/(desktop)/Payment";
import BareDesktopLayout from "../context/BareDesktopLayout";

export default async function Payment() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <BareDesktopLayout>
        <DesktopPaymentPage />
        {/* <div>Payment</div> */}
      </BareDesktopLayout>
    </>
  );
}

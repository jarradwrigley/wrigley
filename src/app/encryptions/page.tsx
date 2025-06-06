
// import SubscriptionsPage from "../components/(desktop)/SubscriptionPage";
import EncryptionsPage from "../components/(desktop)/Encryption";
import DesktopLayout from "../context/DesktopLayout";

export default async function SubscriptionPage() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <EncryptionsPage />
        {/* <SubscriptionsPage /> */}
        {/* <div>Shop</div> */}
      </DesktopLayout>
    </>
  );
}

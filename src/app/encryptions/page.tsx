import SubscriptionsPage from "../components/(desktop)/Subscription";
// import SubscriptionsPage from "../components/(desktop)/SubscriptionPage";
import DesktopLayout from "../context/DesktopLayout";

export default async function SubscriptionPage() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <SubscriptionsPage />
        {/* <SubscriptionsPage /> */}
        {/* <div>Shop</div> */}
      </DesktopLayout>
    </>
  );
}



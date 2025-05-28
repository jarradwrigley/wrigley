import DesktopShopPage from "../components/(desktop)/Shop";
import DesktopLayout from "../context/DesktopLayout";

export default async function Shop() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopShopPage />
        {/* <div>Shop</div> */}
      </DesktopLayout>
    </>
  );
}

import DesktopProfilePage from "../components/(desktop)/Profile";
import DesktopLayout from "../context/DesktopLayout";

export default async function ProfilePage() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopProfilePage />
        {/* <div>Shop</div> */}
      </DesktopLayout>
    </>
  );
}

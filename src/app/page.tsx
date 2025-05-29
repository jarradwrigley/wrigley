import DesktopHomePage from "./components/(desktop)/Home";
import DesktopLayout from "./context/DesktopLayout";
import MobileLayout from "./context/MobileLayout";

export default async function Home() {
  return (
    <>
      <MobileLayout>
        {/* <MobileHomePage /> */}
        <div>Mobile Home</div>
      </MobileLayout>

      <DesktopLayout>
        <DesktopHomePage />
        {/* <div>Desktop</div> */}
      </DesktopLayout>
    </>
  );
}



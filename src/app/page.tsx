import DesktopHomePage from "./components/(desktop)/Home";
import DesktopLayout from "./context/DesktopLayout";

export default async function Home() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopHomePage />
        {/* <div>Desktop</div> */}
      </DesktopLayout>
    </>
  );
}



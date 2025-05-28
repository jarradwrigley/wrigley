import DesktopAboutPage from "../components/(desktop)/About";
import DesktopLayout from "../context/DesktopLayout";

export default async function About() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopAboutPage />
        {/* <div>About</div> */}
      </DesktopLayout>
    </>
  );
}

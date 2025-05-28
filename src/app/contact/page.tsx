import DesktopContactPage from "../components/(desktop)/Contact";
import DesktopLayout from "../context/DesktopLayout";

export default async function Contact() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopContactPage />
        {/* <div>Contact</div> */}
      </DesktopLayout>
    </>
  );
}

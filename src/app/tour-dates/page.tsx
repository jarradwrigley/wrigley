import DesktopTourDatesPage from "../components/(desktop)/TourDates";
import DesktopLayout from "../context/DesktopLayout";

export default async function TourDates() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopTourDatesPage />
        {/* <div>TourDates</div> */}
      </DesktopLayout>
    </>
  );
}



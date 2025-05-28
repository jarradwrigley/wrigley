import DesktopBlogPage from "../components/(desktop)/Blog";
import DesktopLayout from "../context/DesktopLayout";

export default async function Blog() {
  return (
    <>
      {/* <MobileLayout>
        <MobileHomePage />
      </MobileLayout> */}

      <DesktopLayout>
        <DesktopBlogPage />
        {/* <div>Blog</div> */}
      </DesktopLayout>
    </>
  );
}

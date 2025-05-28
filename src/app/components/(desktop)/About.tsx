import Image from "next/image";
import Link from "next/link";

export default function DesktopAboutPage() {
  return (
    <>
      <div className="flex flex-col items-center gap-[2rem] justify-center my-[3rem]">
        <img src="/images/dividesm.avif" alt="logo" className=" h-[1rem]" />

        <span
          className="text-5xl font-[400] text-center w-[20rem] leading-[4rem] "
          style={{ fontFamily: "Oswald" }}
        >
          ABOUT
        </span>
      </div>

      <div
        className="relative h-full flex flex-col w-full px-2 py-6"
        style={{
          backgroundImage: "url('/images/guitar.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Content */}
        <div className="relative z-10 w-full flex items-center px-[10rem]">
          <div className="w-full h-full flex gap-[5rem] items-start">
            <div className=" flex flex-col gap-[5rem] justify-between text-white">
              <div className="flex flex-col gap-[2rem]">
                <span
                  className=""
                  style={{
                    fontFamily: "museo",
                    fontStyle: "italic",
                    letterSpacing: "2px",
                    // lineHeight: '28px',
                    fontSize: "18px",
                  }}
                >
                  Jarrad Wrigley is a Queensland boy bound to take Australia by
                  storm. With his sunny state charm and a burning love for the
                  land, you're bound to be moved by the stories he tells. Don't
                  miss the chance to experience the raw energy of Jarrad's shows
                  as he rips up the stage - it's a new breed of untamed talent.
                </span>

                <span className="text-[13px]" style={{ fontFamily: "museo" }}>
                  Jarrad Wrigley is an Australian Country musician currently
                  making his way in the industry. Born and raised a Queensland
                  boy, Jarrad grew up with a deep admiration of the land and
                  developed a love for the stories and sounds of Country music.
                  <br />
                  <br />
                  Spending most of his time on stage throughout 2022 and 2023,
                  Jarrad’s music has taken him all over Australia, and has earnt
                  him multiple endorsements and sponsorships with well-known
                  companies such as Thomas Cook Clothing, Wrangler Western,
                  Fenech Guitars etc.
                  <br />
                  <br />
                  2024 offered Jarrad and his band The Wrebels an impressive
                  festival lineup, including shows at Tamworth country music
                  festival, Night In Nashville festival, Toowoomba Farm Fest,
                  Emerald Aggrow, Boon Lane country music festival, Gympie
                  Muster and the Wild As festival.
                  <br />
                  <br />
                  With tours on the road performing next to Australian icons
                  James Blundell and Sammy White, Jarrad is constantly proving
                  his worth as one of the most promising acts in Australia.
                  <br />
                  <br />
                  When you come to see Jarrad Wrigley play live, you can expect
                  to be in for a show packed full of toe tappin’ tunes, knee
                  slappin’ fun, and a country experience that will leave you
                  hollerin’ for more!
                </span>
              </div>
            </div>

            <Image
              src="/images/potrait.avif"
              alt="coming"
              width={450}
              height={600}
            />
          </div>
        </div>
      </div>
    </>
  );
}

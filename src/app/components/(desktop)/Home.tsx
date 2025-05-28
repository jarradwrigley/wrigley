import Image from "next/image";
import Link from "next/link";

export default function DesktopHomePage() {
  return (
    <>
      <div
        style={{
          background: "var(--bg-gradient)",
        }}
        className="w-full px-[5rem] py-[2rem] "
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "2.5rem",
            }}
          >
            FEATURED MERCH
          </span>

          <a
            href="/shop"
            className="border border-white flex hover:bg-gray-500 items-center justify-center px-[2rem] py-[0.5rem] rounded-[5px] bg-[rgba(47, 46, 46, 0.69)]  "
          >
            <span className="font-[300] text-[14px]">Shop All</span>
          </a>
        </div>

        {/* <div className="flex w-full  items-center justify-between mt-[2rem]"> */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 justify-items-center mt-[2rem] ">
          <div className="flex flex-col gap-3 w-[201px] h-full justify-between  ">
            <div className="relative">
              <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                <span className="text-gray-600 text-[12px]">New Arrival!</span>
              </div>
              <Image
                src="/images/product1.avif"
                alt="Merch 1"
                width={201}
                height={201}
                // className="w-full h-auto rounded-t-lg"
              />
            </div>

            <div className="flex flex-col">
              <span>JW CATTLE BRAND CAP</span>
              <span className="font-[300] text-gray-400">$45.00</span>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors">
              <span>Add to Cart</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 w-[201px] h-full justify-between ">
            <div className="relative">
              <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                <span className="text-gray-600 text-[12px]">
                  Back In Stock!
                </span>
              </div>
              <Image
                src="/images/product2.avif"
                alt="Merch 1"
                width={201}
                height={201}
                // className="w-full h-auto rounded-t-lg"
              />
            </div>

            <div className="flex flex-col">
              <span>Let's Get Wrigley Trucker Cap - Hot Pink</span>
              <span className="font-[300] text-gray-400">$45.00</span>
            </div>

            <button className="w-full hover:text-white cursor-pointer flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors">
              <span>Add to Cart</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 w-[201px] h-full justify-between ">
            <div className="relative">
              <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                <span className="text-gray-600 text-[12px]">
                  Taking Orders!
                </span>
              </div>
              <Image
                src="/images/product3.avif"
                alt="Merch 1"
                width={201}
                height={201}
                // className="w-full h-auto rounded-t-lg"
              />
            </div>

            <div className="flex flex-col">
              <span>Let's Get Wrigley Jacket</span>
              <span className="font-[300] text-gray-400">$185.00</span>
            </div>

            <button className="w-full hover:text-white cursor-pointer flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors">
              <span>Add to Cart</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 w-[201px] h-full justify-between ">
            <div className="relative">
              {/* <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                  <span className="text-black text-[12px]">New Arrival!</span>
                </div> */}
              <Image
                src="/images/product4.avif"
                alt="Merch 1"
                width={201}
                height={201}
                // className="w-full h-auto rounded-t-lg"
              />
            </div>

            <div className="flex flex-col">
              <span>Let's Get Wrigley Tee</span>
              <span className="font-[300] text-gray-400">$50.00</span>
            </div>

            <button className="w-full hover:text-white cursor-pointer flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors">
              <span>Add to Cart</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 w-[201px] h-full justify-between ">
            <a className="cursor-pointer">
              <div className="relative">
                {/* <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white z-10">
                <span className="text-black text-[12px]">New Arrival!</span>
              </div> */}
                <video
                  src="/images/product4.mp4"
                  width={201}
                  height={201}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                />
              </div>
            </a>

            {/* <div className="flex flex-col">
              <span>JW CATTLE BRAND CAR</span>
              <span className="font-[300] text-gray-400">$45.00</span>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors">
              <span>Add to Cart</span>
            </button> */}
          </div>
        </div>
        {/* </div> */}
      </div>

      <div
        className="h-full flex flex-col w-full px-2 py-6"
        style={{ backgroundImage: "url('/images/guitar.avif')" }}
      >
        <div className="w-full mb-4 flex items-center justify-center">
          <Image
            src="/images/logo_red.avif"
            alt="logo"
            width={150}
            height={150}
          />
        </div>

        <img src="/images/divide.avif" alt="logo" className="w-full h-auto" />

        <div className="w-full flex items-center justify-center my-[3rem]">
          <span
            className="text-3xl font-[600]"
            style={{
              textShadow: "var(--shadowy)",
            }}
          >
            BRAND NEW MUSIC ON THE WAY!
          </span>
        </div>

        <div className="w-full flex items-center px-[10rem] ">
          <div className="w-full  h-full flex gap-[5rem] items-start">
            <Image
              src="/images/coming.avif"
              alt="coming"
              width={450}
              height={500}
            />

            <div className="h-[640px] flex flex-col gap-[5rem] justify-between">
              <div className="flex flex-col gap-[2rem]">
                <span className="text-4xl font-[800]">
                  It's been a while - but HE'S BACK!
                </span>

                <span className="text-2xl font-[200] leading-[3rem] ">
                  The new EP from Jarrad Wrigley is finally on the way. With fan
                  favorites, and brand new heartfelt stories, the Jarrad Wrigley
                  EP is set to resonate with country music lovers everywhere -
                  wherever they hail from.
                </span>
              </div>

              <span
                style={{
                  textShadow: "var(--shadowy)",
                  // fontSize: "1.5rem",
                  fontStyle: "italic",
                }}
                className="text-white/90 text-xl font-[200] leading-[1.5rem] "
              >
                Sneak peaks, album artwork and more to come...
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="h-full flex flex-col w-full px-2 py-[3rem]"
        style={{
          backgroundImage: "url('/images/graybg.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(1)", // Correct spelling!
        }}
      >
        {/* Any child content goes here */}
        {/* <div className="h-[380px] w-full" /> */}
        <img
          src="/images/divide.avif"
          alt="logo"
          className="w-full h-auto mb-[3rem]"
        />

        <span
          style={{
            textShadow: "var(--shadowy)",
            fontSize: "1.2rem",
            color: "white",
            textAlign: "center",
          }}
          className="px-[25rem]"
        >
          Join the WREBELLION to keep up to date with upcoming shows, learn all
          the news, and receive merchandise promotions
        </span>

        <div className="w-full flex items-center justify-center mt-[2rem]">
          <form className="flex flex-col ">
            <label
              style={{
                fontFamily: "Raleway, sans-serif",
              }}
              className="mb-2 text-sm"
            >
              Enter your email
            </label>

            <input
              placeholder="Enter your email here*"
              style={{
                fontFamily: "Raleway, sans-serif",
                // fontSize: "1rem",
              }}
              className="w-[30rem] bg-black/50 placeholder-white  h-[2rem] p-2 text-white border border-white "
            />

            <button className="my-5 cursor-pointer hover:bg-gray-300 w-full border border-black flex items-center justify-center py-1 bg-white text-black">
              <span>JOIN THE WREBELLION</span>
            </button>
          </form>
        </div>
      </div>

      <div className="h-full flex flex-col w-full py-[2rem]">
        <div className="w-full mb-4 flex items-center justify-center">
          <Image
            src="/images/logo_red.avif"
            alt="logo"
            width={200}
            height={200}
          />
        </div>
      </div>

      {/* <div className="flex flex-col items-center gap-[2rem] justify-center pb-3">
        <img src="/images/dividesm.avif" alt="logo" className=" h-[1rem]" />

        <div className="flex flex-col gap-2 items-center">
          <span className="text-lg font-[100] " style={{ fontFamily: "museo" }}>
            Follow Jarrad on:
          </span>

          <div className="flex items-center gap-[18px]">
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/icons/spotify.svg"
                alt="Spotify"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/icons/apple-music.svg"
                alt="Apple Music"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/icons/youtube.svg"
                alt="YouTube"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/icons/tiktok.svg"
                alt="TikTok"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </Link>
          </div>
        </div>
      </div> */}
    </>
  );
}

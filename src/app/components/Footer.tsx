"use client"

import Image from "next/image";
import Link from "next/link";


const Footer = () => {
    return (
      <div className="flex flex-col items-center gap-[2rem] justify-center pb-3">
        <img src="/images/dividesm.avif" alt="logo" className="mt-[3rem] h-[1rem]" />

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
      </div>
    );
}

export default Footer;

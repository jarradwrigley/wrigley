// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import VideoMaskedText from "./VideoMaskedText";
import VideoMaskedLogo from "./MaskedLogo";
import ShoppingBadge from "./ShoppingBadge";
import { signOut, useSession } from "next-auth/react";
import DropdownMenu from "./MenuDropdown";

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    return `hover:opacity-80 transition-opacity ${
      isActive(path) ? "text-white" : "text-gray-400"
    }`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Main Header with Logo and Text */}
      <div className="flex items-center justify-between w-full gap-8 relative">
        {/* Left: JARRAD */}
        <div className="flex-1 h-[120px] z-10">
          <div className="h-[150px]">
            <VideoMaskedText text="JARRAD" height="100%" />
          </div>
        </div>

        {/* Center: Logo - Absolutely positioned */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] z-20">
          <VideoMaskedLogo />
        </div>

        {/* Right: WRIGLEY */}
        <div className="flex-1 h-[120px] z-10">
          <div className="h-[150px]">
            <VideoMaskedText text="WRIGLEY" height="100%" />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center justify-between px-24">
          {/* Navigation Links */}
          <div className="flex items-center gap-8 font-['nimbus'] text-[17px]">
            <Link href="/" className={linkClass("/")}>
              HOME
            </Link>
            <Link href="/tour-dates" className={linkClass("/tour-dates")}>
              TOUR DATES
            </Link>
            <Link href="/about" className={linkClass("/about")}>
              ABOUT
            </Link>
            {/* <Link href="/epk" className={linkClass("/epk")}>
              EPK
            </Link> */}
            <Link href="/contact" className={linkClass("/contact")}>
              CONTACT
            </Link>
            <Link href="/shop" className={linkClass("/shop")}>
              SHOP
            </Link>
            <Link href="/blog" className={linkClass("/blog")}>
              BLOG
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-[18px]  py-2">
            <Link
              href="https://open.spotify.com/artist/4raNm4nBXeOJ1TDJumWcFv?si=4nemvyhAQH61XN5nutU_kQ"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/icons/spotify.svg"
                alt="Spotify"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://music.apple.com/au/artist/jarrad-wrigley/1608127131"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/icons/apple-music.svg"
                alt="Apple Music"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://www.youtube.com/user/Wix"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/icons/youtube.svg"
                alt="YouTube"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://www.tiktok.com/@wix"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/icons/tiktok.svg"
                alt="TikTok"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://www.tiktok.com/@wix"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4 h-full text-white">
            {status === "authenticated" ? (
              // <button
              //   onClick={() => signOut()}
              //   className="hover:opacity-80 transition-opacity cursor-pointer"
              // >
              //   <span>Log Out</span>
              // </button>
              <DropdownMenu />
            ) : (
              <Link
                href="/api/auth/signin"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                Log In
              </Link>
            )}

            <Link href="/cart" className=" h-full transition-opacity">
              <ShoppingBadge />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

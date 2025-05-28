import Image from "next/image";
import Link from "next/link";

export default function DesktopContactPage() {
  return (
    <>
      <div className="flex flex-col items-center gap-[2rem] justify-center my-[3rem]">
        <img src="/images/dividesm.avif" alt="logo" className=" h-[1rem]" />

        <span
          className="text-5xl font-[400] text-center w-[20rem] leading-[4rem] "
          style={{ fontFamily: "Oswald" }}
        >
          CONTACT
        </span>
      </div>

      <div className="w-full flex flex-col items-center pt-[1rem] ">
        <span
          style={{
            fontFamily: "museo",
          }}
          className="text-2xl mb-5 font-[600]"
        >
          GET IN TOUCH WITH JARRAD
        </span>

        <form
          style={{
            fontFamily: "museo",
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xl ">First Name</label>
            <input
              className="h-[2rem] px-2 hover:border-white bg-gray-700 w-[30rem] border border-gray-400 "
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xl ">Last Name</label>
            <input
              className="h-[2rem] px-2 hover:border-white bg-gray-700 w-[30rem] border border-gray-400 "
              type="text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xl ">Email</label>
            <input
              className="h-[2rem] px-2 hover:border-white bg-gray-700 w-[30rem] border border-gray-400 "
              type="text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xl ">Phone</label>
            <input
              className="h-[2rem] px-2 hover:border-white bg-gray-700 w-[30rem] border border-gray-400 "
              type="text"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xl ">Leave him a message...</label>
            <textarea className="min-h-[7rem] p-2 text-md hover:border-white bg-gray-700 w-[30rem] border border-gray-400 " />
          </div>

          <div className="w-full flex justify-end">
            <button className="bg-white cursor-pointer hover:bg-gray-400 text-black py-1 px-6">
              <span className="font-[600]">Send</span>
            </button>
          </div>
        </form>

        <div className="w-full py-[2rem] flex flex-col gap-[1rem] justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xl">MANAGEMENT</span>
            <span>management@meetwrigley.com.au</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl">BOOKING</span>
            <span>booking@ashandchooka.com</span>
          </div>
        </div>
      </div>
    </>
  );
}

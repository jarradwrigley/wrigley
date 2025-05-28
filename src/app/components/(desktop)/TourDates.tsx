import clientPromise from "@/app/lib/mongodb";
import Image from "next/image";
import Link from "next/link";

async function getTours() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const toursCollection = db.collection("tours");

    const tours = await toursCollection.find({}).toArray();

    // Convert MongoDB ObjectId to string
    return tours.map((tour: any) => ({
      ...tour,
      _id: tour._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching tours:", error);
    return [];
  }
}

export default async function DesktopTourDatesPage() {
  const tours = await getTours();

  return (
    <>
      <div className="flex flex-col items-center gap-[2rem] justify-center my-[3rem]">
        <img src="/images/dividesm.avif" alt="logo" className=" h-[1rem]" />

        <span
          className="text-5xl font-[400] text-center w-[20rem] leading-[4rem] "
          style={{ fontFamily: "Oswald" }}
        >
          JARRAD WRIGLEY ON TOUR
        </span>
      </div>

      <div
        className="h-full flex flex-col w-full px-2 pt-[3rem]"
        style={{
          backgroundImage: "url('/images/handg.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          //   filter: "grayscale(1)",
        }}
      >
        <div className="px-[7rem] mb-[2rem] flex flex-col gap-3 ">
          <span style={{ fontFamily: "museo" }} className="text-2xl">
            Tour Dates
          </span>

          <img
            src="/images/dividesm.avif"
            alt="logo"
            className="w-[5rem] h-[1rem]"
          />
        </div>

        <div className="px-[7rem] ">
          <div className="bg-white/10 backdrop-blur-md border border-white/20  shadow-lg ">
            <div className="w-full p-6 border-[0.5px] border-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  style={{
                    fontFamily: "museo",
                  }}
                  className="cursor-pointer hover:scale-102"
                >
                  Past Dates
                </button>
                <div className="w-[1px] h-[1rem] bg-gray-400 " />
                <button
                  style={{
                    fontFamily: "museo",
                  }}
                  className="cursor-pointer hover:scale-102"
                >
                  Upcoming Dates
                </button>
              </div>

              <button className="bg-black hover:text-black cursor-pointer hover:bg-white/40 hover:backdrop-blur-md text-white py-1 px-[1rem] border-[0.2px] border-gray-100 ">
                <span>Track Artist</span>
              </button>
            </div>

            <div className="flex flex-col overflow-y-auto max-h-[24rem] no-scrollbar ">
              {tours.map((tour: any, index: any) => (
                <div
                  key={index}
                  className="w-full p-6 border-t border-b border-white flex gap-[4rem] items-center justify-between "
                >
                  <div
                    style={{
                      fontFamily: "museo",
                    }}
                    className="w-[10%] flex items-baseline gap-[.5rem]"
                  >
                    <span className="text-[3rem]">{tour.date}</span>
                    <span className="text-[1.5rem]">{tour.mon}</span>
                  </div>

                  <div
                    className="w-full flex flex-col gap-[1rem]"
                    style={{
                      fontFamily: "museo",
                    }}
                  >
                    <div className="flex text-[1.1rem] items-center gap-[2rem]">
                      <span className="font-[600]">{tour.title}</span>
                      <span>{tour.location}</span>
                    </div>

                    <span className="font-[500]">{tour.desc}</span>
                  </div>

                  <button className="border cursor-pointer hover:bg-white/40 hover:backdrop-blur-md border-white h-fit py-[.5rem] px-[3rem] ">
                    <span className="whitespace-nowrap">Notify Me</span>
                  </button>
                </div>
              ))}

              {/* <div className="w-full p-6 border-t border-b border-white flex gap-[4rem] items-center justify-between ">
                <div
                  style={{
                    fontFamily: "museo",
                  }}
                  className="w-[10%] flex items-baseline gap-[.5rem]"
                >
                  <span className="text-[3rem]">11</span>
                  <span className="text-[1.5rem]">Jul</span>
                </div>

                <div
                  className="w-full flex flex-col gap-[1rem]"
                  style={{
                    fontFamily: "museo",
                  }}
                >
                  <div className="flex text-[1.1rem] items-center gap-[2rem]">
                    <span className="font-[600]">Jarrad Wrigley Live</span>
                    <span>Sydney, Australia</span>
                  </div>

                  <span className="font-[500]">
                    The Wrebels are back in business! Join Jarrad Wrigley and
                    the Wrebels for one hell of a night as they showcase a brand
                    new show, packed full of energy, heartfelt stories and raw
                    talent.
                  </span>
                </div>

                <button className="border border-white h-fit py-[.5rem] px-[3rem] ">
                  <span className="whitespace-nowrap">Notify Me</span>
                </button>
              </div>

              <div className="w-full p-6 border-t border-b border-white flex gap-[4rem] items-center justify-between ">
                <div
                  style={{
                    fontFamily: "museo",
                  }}
                  className="w-[10%] flex items-baseline gap-[.5rem]"
                >
                  <span className="text-[3rem]">11</span>
                  <span className="text-[1.5rem]">Jul</span>
                </div>

                <div
                  className="w-full flex flex-col gap-[1rem]"
                  style={{
                    fontFamily: "museo",
                  }}
                >
                  <div className="flex text-[1.1rem] items-center gap-[2rem]">
                    <span className="font-[600]">Jarrad Wrigley Live</span>
                    <span>Sydney, Australia</span>
                  </div>

                  <span className="font-[500]">
                    The Wrebels are back in business! Join Jarrad Wrigley and
                    the Wrebels for one hell of a night as they showcase a brand
                    new show, packed full of energy, heartfelt stories and raw
                    talent.
                  </span>
                </div>

                <button className="border border-white h-fit py-[.5rem] px-[3rem] ">
                  <span className="whitespace-nowrap">Notify Me</span>
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

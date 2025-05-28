import clientPromise from "@/app/lib/mongodb";
import Image from "next/image";
import Link from "next/link";

async function getProducts() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection("products");

    const products = await productsCollection.find({}).toArray();

    // Convert MongoDB ObjectId to string
    return products.map((product: any) => ({
      ...product,
      _id: product._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function DesktopShopPage() {
    const products = await getProducts();

  return (
    <>
      <div className="px-[7rem]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 justify-items-center mt-[2rem] ">
          {products.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 w-[201px] h-full justify-between  "
            >
              <div className="relative">
                {item.promo && (
                  <div className="flex items-center justify-center absolute px-2 py-0.5 top-0 left-0 bg-white">
                    <span className="text-gray-600 text-[12px]">
                      {item.promo}
                    </span>
                  </div>
                )}
                <Image
                  src={item.image}
                  alt="Merch 1"
                  width={201}
                  height={201}
                  // className="w-full h-auto rounded-t-lg"
                />
              </div>

              <div className="flex flex-col">
                <span>{item.title}</span>
                <span className="font-[300] text-gray-400">{item.amount}</span>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-800 hover:text-white cursor-pointer transition-colors">
                <span>Add to Cart</span>
              </button>
            </div>
          ))}

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
      </div>
    </>
  );
}

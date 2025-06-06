// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.tour.createMany({
    // data: [
    //   {
    //     // _id: "product_001",
    //     key: "jw-cap-001", // Unique product identifier
    //     title: "JW CATTLE BRAND CAP",
    //     amount: 45.0,
    //     image: "/images/product1.avif",
    //     images: [
    //       "/images/product1.avif",
    //       "/images/product1-alt1.avif", // Additional angles
    //       "/images/product1-alt2.avif",
    //     ],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"], // Available sizes
    //     requiresSize: true, // This product needs size selection
    //     promo: "New Arrival!",
    //     featured: true,
    //     type: "cap",
    //     stock: 100,
    //   },
    //   {
    //     // _id: "product_002",
    //     key: "lgw-trucker-pink",
    //     title: "Let's Get Wrigley Trucker Cap - Hot Pink",
    //     amount: 45.0,
    //     image: "/images/product2.avif",
    //     images: ["/images/product2.avif"],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"], // Single size option
    //     requiresSize: false, // Can be added directly to cart
    //     promo: "Back In Stock!",
    //     featured: true,
    //     type: "cap",
    //     stock: 100,
    //   },
    //   {
    //     // _id: "product_003",
    //     key: "lgwj1", // Special key for pre-order jacket
    //     title: "Let's Get Wrigley Jacket",
    //     amount: 185.0,
    //     image: "/images/product3.avif",
    //     images: [
    //       "/images/product3.avif",
    //       "/images/product3-back.avif",
    //       "/images/product3-detail.avif",
    //     ],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    //     requiresSize: true,
    //     promo: "Taking Orders!",
    //     featured: true,
    //     type: "jacket-pre", // Special type for pre-orders
    //     stock: 100,
    //   },
    //   {
    //     // _id: "product_004",
    //     key: "lgw-tee-001",
    //     title: "Let's Get Wrigley Tee",
    //     amount: 50.0,
    //     image: "/images/product4.avif",
    //     images: ["/images/product4.avif"],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    //     requiresSize: true,
    //     promo: "",
    //     featured: true,
    //     type: "tee",
    //     stock: 100,
    //   },
    //   {
    //     // _id: "product_005",
    //     key: "footy-shorts-001",
    //     title: "Footy Shorts",
    //     amount: 50.0,
    //     image: "/images/shorts.avif",
    //     images: ["/images/shorts.avif"],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"], // No sizes needed
    //     requiresSize: false, // Can be added directly
    //     promo: "",
    //     featured: false,
    //     type: "shorts",
    //     stock: 100,
    //   },
    //   {
    //     // _id: "product_005",
    //     key: "lgwtcm-001",
    //     title: "Let's Get Wrigley Trucker Cap - Maroon",
    //     amount: 45.0,
    //     image: "/images/product6.avif",
    //     images: ["/images/product6.avif"],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"], // No sizes needed
    //     requiresSize: false, // Can be added directly
    //     promo: "",
    //     featured: false,
    //     type: "cap",
    //     stock: 0,
    //   },
    //   {
    //     // _id: "product_005",
    //     key: "wlgwt-001",
    //     title: "Women Let's Get Wrigley T-Shirt",
    //     amount: 50.0,
    //     image: "/images/product7.avif",
    //     images: ["/images/product7.avif"],
    //     sizes: ["XS", "S", "M", "L", "XL", "XXL"], // No sizes needed
    //     requiresSize: false, // Can be added directly
    //     promo: "",
    //     featured: false,
    //     type: "cap",
    //     stock: 0,
    //   },
    //   {
    //     // _id: "product_005",
    //     key: "sticker-pack-001",
    //     title: "JW Sticker Pack",
    //     amount: 10.0,
    //     image: "/images/stickers.avif",
    //     images: ["/images/stickers.avif"],
    //     sizes: [], // No sizes needed
    //     requiresSize: false, // Can be added directly
    //     promo: "Limited Edition!",
    //     featured: true,
    //     type: "accessories",
    //     stock: 100,
    //   },
    // ],
    data: [
      {
        date: 11,
        mon: "Jul",
        title: "Jarrad Wrigley Live",
        location: "Sydney, Australia",
        description: "The Wrebels are back in business! Join Jarrad Wrigley and the Wrebels for one hell of a night as they showcase a brand new show, packed full of energy, heartfelt stories and raw talent.",
        link: "https://google.com",
      },
      {
        date: 12,
        mon: "Jul",
        title: "Jarrad Wrigley Live",
        location: "Tamworth, Australia",
        description: "The Wrebels are back in business! Join Jarrad Wrigley and the Wrebels for one hell of a night as they showcase a brand new show, packed full of energy, heartfelt stories and raw talent.",
        link: "https://google.com",
      },
      {
        date: 13,
        mon: "Jul",
        title: "Jarrad Wrigley Live",
        location: "Townsville City Center, Australia",
        description: "The Wrebels are back in business! Join Jarrad Wrigley and the Wrebels for one hell of a night as they showcase a brand new show, packed full of energy, heartfelt stories and raw talent.",
        link: "https://google.com",
      },
    ],
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

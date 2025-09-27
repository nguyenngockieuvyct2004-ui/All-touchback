import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/touchback";
  await mongoose.connect(uri);
  console.log("> Connected to MongoDB");

  const demo = [
    {
      name: "TouchBack Basic Tag",
      code: "TB-BASIC-001",
      category: "basic",
      variant: "White",
      description:
        "Thẻ NFC cơ bản giúp chia sẻ trang memory của bạn nhanh chóng. Chống nước nhẹ.",
      price: 59000,
      images: [
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1520975922284-096f3f2d17f6?w=1200&auto=format&fit=crop&q=80",
      ],
      isFeatured: true,
    },
    {
      name: "TouchBack Plus Card",
      code: "TB-PLUS-001",
      category: "plus",
      variant: "Matte Black",
      description:
        "Phiên bản Plus với vật liệu bền hơn, in tuỳ chỉnh tên / logo và bảo vệ chống trầy.",
      price: 129000,
      images: [
        "https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=1200&auto=format&fit=crop&q=80",
      ],
      isFeatured: true,
    },
    {
      name: "TouchBack Premium Metal",
      code: "TB-PREM-001",
      category: "premium",
      variant: "Brushed Steel",
      description:
        "Bản cao cấp bằng kim loại, cảm giác cao cấp, độ bền vượt trội, hỗ trợ khắc laser.",
      price: 249000,
      images: [
        "https://images.unsplash.com/photo-1569180880575-4c1f1a0a1f8b?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200&auto=format&fit=crop&q=80",
      ],
      isFeatured: true,
    },
    {
      name: "TouchBack Sticker Pack (5)",
      code: "TB-STICK-5",
      category: "basic",
      variant: "Assorted",
      description:
        "Bộ 5 sticker NFC dán lên điện thoại, laptop… tiện lợi và giá tiết kiệm.",
      price: 99000,
      images: [
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1565373676598-3dc0c36b3580?w=1200&auto=format&fit=crop&q=80",
      ],
      isFeatured: false,
    },
    {
      name: "TouchBack Gift Bundle",
      code: "TB-BUNDLE-01",
      category: "plus",
      variant: "Mix",
      description:
        "Combo quà tặng gồm 1 Plus Card + 2 Basic Tag + 3 Sticker, hộp đóng gói sang trọng.",
      price: 329000,
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
      ],
      isFeatured: false,
    },
  ];

  for (const p of demo) {
    const exists = await Product.findOne({ code: p.code });
    if (exists) {
      // Update images if missing or using placeholders
      const shouldUpdate =
        !exists.images?.length ||
        exists.images.some((u) => /placeholder\.com/.test(u));
      if (shouldUpdate) {
        await Product.updateOne(
          { _id: exists._id },
          { $set: { images: p.images } }
        );
        console.log("~ Updated images:", p.code);
      } else {
        console.log("= Skip (exists):", p.code);
      }
    } else {
      await Product.create(p);
      console.log("+ Inserted:", p.code);
    }
  }

  await mongoose.disconnect();
  console.log("> Done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

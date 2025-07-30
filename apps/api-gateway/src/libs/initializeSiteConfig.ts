import prisma from "@packages/libs/prisma";

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.siteConfig.findFirst();
    if (!existingConfig) {
      await prisma.siteConfig.create({
        data: {
          categories: [
            "Electronics",
            "Apparel & Fashion",
            "Clothing & Bedding",
            "Home & Kitchen",
            "Sports & Fitness",
            "Books & Stationery",
            "Beauty & Personal Care",
            "Toys & Baby Products",
            "Automotive",
            "Groceries",
            "Pet Supplies",
          ],
          subCategories: {
            "Electronics": [
              "Mobiles",
              "Laptops",
              "Accessories",
              "Gaming",
              "Televisions",
              "Cameras",
            ],
            "Apparel & Fashion": [
              "Men",
              "Women",
              "Kids",
              "Footwear",
              "Watches",
              "Jewelry",
              "Bags & Luggage",
            ],
            "Clothing & Bedding": [
              "Bed Sheets",
              "Blankets & Quilts",
              "Pillows & Cushions",
              "Mattress Covers",
              "Curtains",
              "Towels",
              "Comforters",
            ],
            "Home & Kitchen": [
              "Furniture",
              "Appliances",
              "Decor",
              "Bedding",
              "Storage",
              "Lighting",
            ],
            "Sports & Fitness": [
              "Gym Equipment",
              "Outdoor Sports",
              "Wearables",
              "Bicycles",
              "Yoga",
            ],
            "Books & Stationery": [
              "Fiction",
              "Non-Fiction",
              "Educational",
              "Comics",
              "Office Supplies",
              "Notebooks",
            ],
            "Beauty & Personal Care": [
              "Makeup",
              "Skincare",
              "Haircare",
              "Fragrances",
              "Men's Grooming",
              "Bath & Body",
            ],
            "Toys & Baby Products": [
              "Toys",
              "Baby Gear",
              "Diapers",
              "Feeding",
              "Educational Toys",
            ],
            "Automotive": [
              "Car Accessories",
              "Bike Accessories",
              "Spare Parts",
              "Oils & Lubricants",
              "Tools & Equipment",
            ],
            "Groceries": [
              "Snacks",
              "Beverages",
              "Staples",
              "Fruits & Vegetables",
              "Dairy",
              "Bakery",
            ],
            "Pet Supplies": [
              "Dog Supplies",
              "Cat Supplies",
              "Aquarium",
              "Pet Food",
              "Grooming",
            ],
          },
          logo: "https://ik.imagekit.io/aalam855/bazario/assets/Screenshot%202025-07-24%20at%2010.42.23%E2%80%AFAM.png?updatedAt=1753334329909",
          banner:
            "https://ik.imagekit.io/aalam855/bazario/assets/hero-bg.avif?updatedAt=1751187560434",
        },
      });
    }
  } catch (error) {
    console.log("Error while initializing the site config", error);
  }
};

export default initializeConfig;

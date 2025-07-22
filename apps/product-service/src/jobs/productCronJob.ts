import prisma from "@packages/libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * * ", async () => {
  try {
    const now = new Date();
    await prisma.product.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });
  } catch (error) {
    console.log("error in delete product cron job", error);
  }
});

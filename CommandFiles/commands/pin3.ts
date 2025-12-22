// @ts-check

/**
 * @type {CommandMeta}
 */
export const meta = {
  name: "pin3",
  description: "Search images on Pinterest.",
  author: "Christus dev AI",
  version: "1.0.0",
  usage: "{prefix}{name} <query> -<number of images>",
  category: "Image",
  permissions: [0],
  noPrefix: false,
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["pinterest3"],
  icon: "📌",
  noLevelUI: true,
  noWeb: true,
};

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { defineEntry } from "@cass/define";

const CACHE_DIR = path.join(process.cwd(), "cache", "pinterest");
const PIN_API = "http://65.109.80.126:20511/api/api/pinterest";

export const entry = defineEntry(async ({ input, output, args }) => {
  const searchArg = args.join(" ");
  if (!searchArg.includes("-")) {
    return output.reply("Invalid format. Example: pin cats -5");
  }

  const [query, numImagesStr] = searchArg.split("-").map((s) => s.trim());
  const numberOfImages = parseInt(numImagesStr, 10);
  if (isNaN(numberOfImages) || numberOfImages <= 0 || numberOfImages > 25) {
    return output.reply("Please specify a number between 1 and 25.");
  }

  await output.reply("🔍 Searching Pinterest...");

  try {
    const { data } = await axios.get<any>(
      `${PIN_API}?search=${encodeURIComponent(query)}`
    );

    const allImageUrls: string[] = data?.data || [];
    if (!allImageUrls.length) {
      return output.reply(`No images found for "${query}".`);
    }

    const imgData: fs.ReadStream[] = [];

    await fs.ensureDir(CACHE_DIR);

    for (let i = 0; i < Math.min(numberOfImages, allImageUrls.length); i++) {
      const imageUrl = allImageUrls[i];
      try {
        const imgResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imgPath = path.join(CACHE_DIR, `${Date.now()}_${i}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      } catch (err) {
        console.error(`Error downloading image ${i + 1}:`, err);
      }
    }

    if (!imgData.length) {
      return output.reply("Failed to fetch any images.");
    }

    await output.reply({
      body: `📌 Here are ${imgData.length} image(s) for "${query}"`,
      attachment: imgData,
    });
  } catch (err) {
    console.error("Pinterest search error:", err);
    return output.reply("❌ An error occurred while fetching images.");
  }
});

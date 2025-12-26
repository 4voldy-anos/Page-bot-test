import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "mg",
  aliases: ["magic3", "magicgen3"],
  author: "Denish • Converted by Christus Dev AI",
  version: "1.0.0",
  description: "Generate AI images using Magic Generator API",
  category: "AI",
  usage: "{prefix}{name} <prompt>",
  role: 0,
  waitingTime: 0,
  icon: "✨",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "✨ Christus • Magic Generator",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noPrompt: "⚠️ | Please provide a prompt.",
    generateFail: "⚠️ | Failed to generate image.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "https://dens-magic-img.vercel.app/api/generate";
const CACHE_DIR = path.join(__dirname, "tmp");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ args, output, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) {
      return output.reply(t("noPrompt"));
    }

    const prompt = args.join(" ").trim();
    const imageUrl = `${API_URL}?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 120000,
      });

      if (!response.data) {
        throw new Error("No image returned");
      }

      const filePath = path.join(
        CACHE_DIR,
        `magic_${Date.now()}.png`
      );

      fs.writeFileSync(filePath, response.data);

      await output.reply({
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);
    } catch (err: any) {
      console.error("Magic Generator Error:", err.message || err);
      output.reply(t("generateFail"));
    }
  }
);

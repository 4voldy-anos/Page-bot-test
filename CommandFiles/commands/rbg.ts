import axios from "axios";
import fs from "fs";
import path from "path";
import stream from "stream";
import { promisify } from "util";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

const pipeline = promisify(stream.pipeline);

const API_ENDPOINT = "https://free-goat-api.onrender.com/rbg";
const CACHE_DIR = path.join(__dirname, "cache");

export const meta: CommandMeta = {
  name: "rbg",
  otherNames: ["nobg", "bgremove"],
  author: "NeoKEX • adapted by Christus",
  version: "2.1.0",
  description: "Remove image background using AI",
  category: "Image",
  usage: "{prefix}{name} <image_url> OR reply to an image",
  role: 0,
  waitingTime: 10,
  icon: "🖼️",
  noLevelUI: true,
};

export const style: CommandStyle = {
  title: "Christus • Background Remover ✂️",
  titleFont: "bold",
  contentFont: "fancy",
};

export const langs = {
  en: {
    noImage: "❌ Provide an image URL or reply to an image.",
    processing: "⏳ Removing background, please wait...",
    success: "✅ Background removed successfully!",
    apiFail: "❌ Failed to remove background.",
    timeout: "❌ API timeout. Try again later.",
    httpError: "❌ API unavailable (HTTP {code}).",
  },
};

/* ───────────── Helpers ───────────── */

function extractImageURL(args: string[], input: any): string | null {
  const directUrl = args.find((a) => a.startsWith("http"));
  if (directUrl) return directUrl;

  const reply = input.messageReply;
  if (reply?.attachments?.length) {
    const img = reply.attachments.find(
      (a: any) => a.type === "photo" || a.type === "image"
    );
    if (img?.url) return img.url;
  }

  return null;
}

/* ───────────── Entry ───────────── */

export const entry = defineEntry(
  async ({ input, output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    const imageUrl = extractImageURL(args, input);
    if (!imageUrl) return output.reply(t("noImage"));

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const waitMsg = await output.reply(t("processing"));
    const filePath = path.join(CACHE_DIR, `rbg_${Date.now()}.png`);

    try {
      const res = await axios.get(
        `${API_ENDPOINT}?url=${encodeURIComponent(imageUrl)}`,
        {
          responseType: "stream",
          timeout: 60_000,
        }
      );

      await pipeline(res.data, fs.createWriteStream(filePath));

      await output.unsend(waitMsg.messageID);

      await output.reply({
        body: t("success"),
        attachment: fs.createReadStream(filePath),
      });
    } catch (err: any) {
      await output.unsend(waitMsg.messageID);

      if (err.code === "ECONNABORTED") {
        return output.reply(t("timeout"));
      }

      if (err.response?.status) {
        return output.reply(
          t("httpError").replace("{code}", err.response.status)
        );
      }

      console.error("RBG Error:", err);
      output.reply(t("apiFail"));
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
);

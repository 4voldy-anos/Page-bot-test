import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "kanda",
  author: "Christus dev AI | Redwan API",
  version: "1.0.0",
  description: "Download a random Kanda video using Redwan API",
  category: "Media",
  usage: "{prefix}{name}",
  role: 2,
  waitingTime: 5,
  icon: "🎞️",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎞️ Kanda Video",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    fetching: "⏳ Fetching Kanda video...",
    fail: "❌ Failed to retrieve video.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "http://65.109.80.126:20511/api/kanda";
const CACHE_DIR = path.join(__dirname, "cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ output, langParser }) => {
    const t = langParser.createGetLang(langs);

    const waitMsg = await output.reply(t("fetching"));

    try {
      const { data } = await axios.get(API_URL, { timeout: 60000 });

      if (!data?.status || !data?.video_url) {
        throw new Error("Invalid API response");
      }

      const videoPath = path.join(
        CACHE_DIR,
        `kanda_${Date.now()}.mp4`
      );

      const videoStream = await axios({
        url: data.video_url,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(videoPath);
      videoStream.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await output.unsend(waitMsg.messageID);

      await output.reply({
        body: "✅ Here is your Kanda video 🎬",
        attachment: fs.createReadStream(videoPath),
      });

      fs.unlinkSync(videoPath);
    } catch (err: any) {
      console.error("KANDA Error:", err.message || err);
      await output.unsend(waitMsg.messageID);
      output.reply(t("fail"));
    }
  }
);

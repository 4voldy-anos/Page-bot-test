import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "imagen3",
  aliases: [],
  author: "Christus dev AI",
  version: "1.0.0",
  description: "Generate AI images using Imagen3",
  category: "AI",
  usage: "{prefix}{name} <prompt>",
  role: 0,
  waitingTime: 8,
  icon: "🎨",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎨 Christus • Imagen3",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  fr: {
    noPrompt:
      "⚠️ Veuillez fournir un prompt pour générer une image.\nExemple : /imagen3 dragon futuriste dans l’espace",
    generating: "🎨 Génération de l’image Imagen3 en cours... ⏳",
    fail: "❌ Impossible de générer l’image. Veuillez réessayer plus tard.",
  },
};

/* ================= CONSTANT ================= */

const API_URL = "https://dev.oculux.xyz/api/imagen3";

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) return output.reply(t("noPrompt"));

    const prompt = args.join(" ");

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `imagen3_${Date.now()}.png`);

    try {
      const loadingMsg = await output.reply(t("generating"));

      const { data } = await axios.get(API_URL, {
        params: { prompt },
        responseType: "arraybuffer",
        timeout: 180000,
      });

      fs.writeFileSync(filePath, Buffer.from(data));

      await output.reply({
        body:
          `${UNISpectra.charm} **Imagen3 générée avec succès**\n` +
          `📝 Prompt : ${prompt}`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);

      if (loadingMsg?.messageID) {
        output.unsend(loadingMsg.messageID);
      }
    } catch (err) {
      console.error("IMAGEN3 ERROR:", err);
      output.reply(t("fail"));
    }
  }
);

import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "edit",
  aliases: ["imgedit", "fluxedit"],
  author: "Christus | API Renz",
  version: "1.0.0",
  description: "Edit an image using FluxKontext AI",
  category: "AI",
  usage: "{prefix}{name} <prompt> (reply to image)",
  role: 0,
  waitingTime: 8,
  icon: "🖌️",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🖌️ Christus • Image Edit",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  fr: {
    noImage:
      "⚠️ Veuillez répondre à une image **et** fournir un prompt.\nExemple : /edit Style cartoon",
    noPrompt:
      "⚠️ Veuillez fournir un prompt pour modifier l'image.\nExemple : /edit Style anime",
    processing: "🖌️ Modification de l'image en cours... ⏳",
    fail: "❌ Impossible de modifier l'image. Veuillez réessayer plus tard.",
  },
};

/* ================= CONSTANT ================= */

const API_URL = "https://dev.oculux.xyz/api/fluxkontext";

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ output, args, event, langParser }) => {
    const t = langParser.createGetLang(langs);

    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!repliedImage || repliedImage.type !== "photo") {
      return output.reply(t("noImage"));
    }

    if (!prompt) {
      return output.reply(t("noPrompt"));
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `edit_${Date.now()}.jpg`);

    try {
      const loadingMsg = await output.reply(t("processing"));

      const apiRequestUrl =
        `${API_URL}?prompt=${encodeURIComponent(prompt)}` +
        `&ref=${encodeURIComponent(repliedImage.url)}`;

      const { data } = await axios.get(apiRequestUrl, {
        responseType: "arraybuffer",
        timeout: 180000,
      });

      fs.writeFileSync(filePath, Buffer.from(data));

      await output.reply({
        body:
          `${UNISpectra.charm} **Image modifiée avec succès**\n` +
          `📝 Prompt : ${prompt}`,
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);

      if (loadingMsg?.messageID) {
        output.unsend(loadingMsg.messageID);
      }
    } catch (err) {
      console.error("EDIT ERROR:", err);
      output.reply(t("fail"));
    }
  }
);

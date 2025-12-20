import axios from "axios";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "edit",
  aliases: ["imgedit"],
  author: "Christus | API RIFAT",
  version: "2.4.0",
  description: "Edit an existing image using Seedream V4 AI",
  category: "AI",
  usage: "{prefix}{name} <prompt> (reply to an image)",
  role: 0,
  waitingTime: 15,
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
    noReply: "🖼️ Veuillez répondre à une image à modifier.",
    noPrompt: "✍️ Veuillez fournir un prompt pour modifier l’image.",
    editing: "🖌️ Modification de l’image en cours... ⏳",
    fail: "❌ Impossible de modifier l’image. Veuillez réessayer plus tard.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "https://fluxcdibai-1.onrender.com/generate";
const MODEL = "seedream v4 edit";

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ output, args, langParser, event }) => {
    const t = langParser.createGetLang(langs);

    const replied = event.messageReply?.attachments?.[0];
    if (!replied || replied.type !== "photo") {
      return output.reply(t("noReply"));
    }

    const prompt = args.join(" ").trim();
    if (!prompt) return output.reply(t("noPrompt"));

    const loadingMsg = await output.reply(t("editing"));

    try {
      const { data } = await axios.get(API_URL, {
        params: {
          prompt,
          model: MODEL,
          imageUrl: replied.url,
        },
        timeout: 120000,
      });

      const resultUrl: string | undefined =
        data?.data?.imageResponseVo?.url;

      if (!resultUrl) throw new Error("No image URL returned");

      await output.reply({
        body:
          `${UNISpectra.charm} **Image modifiée avec succès**\n` +
          `📝 Prompt : ${prompt}`,
        attachment: await global.utils.getStreamFromURL(resultUrl),
      });

      if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
    } catch (err) {
      console.error("EDIT ERROR:", err);
      if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
      output.reply(t("fail"));
    }
  }
);

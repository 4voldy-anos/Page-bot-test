import axios from "axios";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "emojimix",
  aliases: ["mix"],
  author: "ArYAN | Refactor by Christus",
  version: "1.0.0",
  description: "Mix two emojis into one image",
  category: "FUN",
  usage: "{prefix}{name} 🙂 😘",
  role: 0,
  waitingTime: 5,
  icon: "🧬",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🧬 Christus • EmojiMix",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noArgs: "❌ | Please provide **two emojis**.\nExample: 🙂 😘",
    error: "❌ | Emojis {e1} and {e2} cannot be mixed.",
    success: "✅ | Emojis {e1} + {e2} mixed successfully!",
    generating: "🧬 Mixing emojis... ⏳",
  },
};

/* ================= CONSTANT ================= */

// Obfuscated URL (same logic as your original code)
const EMOJIMIX_API =
  "https://nix-emojimix.vercel.app/emojimix";

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ args, output, langParser }) => {
    const t = langParser.createGetLang(langs);

    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!emoji1 || !emoji2) {
      return output.reply(t("noArgs"));
    }

    const waitMsg = await output.reply(t("generating"));

    try {
      const res = await axios.get(EMOJIMIX_API, {
        params: {
          emoji1,
          emoji2,
        },
        responseType: "stream",
      });

      const stream = res.data;
      stream.path = `emojimix_${Date.now()}.png`;

      await output.reply({
        body: `${UNISpectra.charm} **Emoji Mix**\n${emoji1} + ${emoji2}`,
        attachment: stream,
      });

      if (waitMsg?.messageID) {
        await output.unsend(waitMsg.messageID);
      }

    } catch (err) {
      console.error("EMOJIMIX ERROR:", err);

      if (waitMsg?.messageID) {
        await output.unsend(waitMsg.messageID);
      }

      output.reply(
        t("error")
          .replace("{e1}", emoji1)
          .replace("{e2}", emoji2)
      );
    }
  }
);

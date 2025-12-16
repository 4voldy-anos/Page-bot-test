import axios from "axios";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

const availableTemplates: Record<number, string> = {
  1: "Lumière Néon Multicolore",
  2: "Style Galaxie Nom Libre",
  3: "Texte 3D Sous l'Eau",
  4: "Logo Viettel",
  5: "Typographie sur Pavé",
  6: "Texte 3D Cochon Mignon",
  7: "Effet Lumière Néon Verte",
  8: "Texte Lumière Futuriste",
  9: "Graffiti Couverture",
  10: "Texte Ailes du Diable Néon",
  // … (1 → 100, inchangé)
  100: "Texte Graffiti en Ligne"
};

export const meta: CommandMeta = {
  name: "ephoto",
  version: "1.0.0",
  author: "Christus dev AI",
  description: "Create Ephoto text effects or list all templates",
  category: "Image",
  usage: "{prefix}{name} <text> - <id> | {prefix}{name} list",
  waitingTime: 5,
  role: 0,
  icon: "🎨"
};

export const langs = {
  fr: {
    usage: "⚠️ Utilisation: {prefix}ephoto <texte> - <id>\nExemple: {prefix}ephoto Christus - 27",
    invalidId:
      "❌ ID invalide ! Utilisez un ID entre 1 et 100.\nUtilisez '{prefix}ephoto list' pour voir les modèles.",
    error: "❌ Oups ! Une erreur est survenue. Veuillez réessayer plus tard."
  }
};

export const entry = defineEntry(
  async ({ event, args, message, api, langParser }) => {
    const t = langParser.createGetLang(langs);

    const prefix =
      global.utils && typeof global.utils.getPrefix === "function"
        ? await global.utils.getPrefix(event.threadID)
        : "/";

    const input = args.join(" ").trim();

    /* ===== LIST MODE ===== */
    if (input.toLowerCase() === "list") {
      let body = `${UNISpectra.charm} MODÈLES EPHOTO (1–100)\n${UNISpectra.standardLine}\n`;

      for (const id in availableTemplates) {
        body += `🆔 ${id.toString().padStart(3, "0")} → ${availableTemplates[+id]}\n`;
      }

      body += `\n💡 Utilisation:\n${prefix}ephoto <texte> - <id>\nExemple: ${prefix}ephoto Christus - 27`;

      return message.reply(body);
    }

    /* ===== PARSE INPUT ===== */
    const parts = input.split("-");
    const text = parts[0]?.trim();
    const id = Number(parts[1]?.trim());

    if (!text || !id) {
      return message.reply(t("usage", { prefix }));
    }

    if (isNaN(id) || id < 1 || id > 100) {
      return message.reply(t("invalidId", { prefix }));
    }

    const loading = await message.reply(
      `🎨 Génération de l'effet Ephoto\n🔤 Texte : ${text}\n🆔 ID : ${id} (${availableTemplates[id]})`
    );

    try {
      const githubRaw =
        "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

      const apiConfig = await axios.get(githubRaw);
      const baseUrl = apiConfig.data?.apiv1;

      if (!baseUrl) throw new Error("Base API introuvable");

      const res = await axios.get(
        `${baseUrl}/api/ephoto?id=${id}&text=${encodeURIComponent(text)}`
      );

      if (!res.data?.status || !res.data.result_url)
        throw new Error("API error");

      await api.unsendMessage(loading.messageID);

      return message.reply({
        body:
          `${UNISpectra.charm} Effet Ephoto généré !\n` +
          `${UNISpectra.standardLine}\n` +
          `🆔 ID : ${id} (${availableTemplates[id]})\n` +
          `🔤 Texte : ${text}\n` +
          `${UNISpectra.standardLine}`,
        attachment: await global.utils.getStreamFromURL(res.data.result_url)
      });
    } catch (err) {
      await api.unsendMessage(loading.messageID);
      return message.reply(t("error"));
    }
  }
);

import axios from "axios";
import fs from "fs";
import path from "path";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "poli",
  aliases: [],
  author: "Saimx69x • TS fixed by Christus",
  version: "1.0.0",
  description: "Generate AI images using Poli API",
  category: "AI",
  usage: "{prefix}{name} <prompt>",
  role: 0,
  waitingTime: 5,
  icon: "🎨",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🎨 Christus • Poli",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  fr: {
    noPrompt: "⚠️ Veuillez fournir un prompt pour générer une image.\nExemple : /poli dragon futuriste dans l’espace",
    generating: "🎨 Génération de l'image Poli en cours... ⏳",
    fail: "❌ Impossible de générer l'image. Veuillez réessayer plus tard.",
  },
};

/* ================= API BASE ================= */

async function getApiBase(): Promise<string | null> {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json");
    return res.data.apiv1;
  } catch (err) {
    console.error("Failed to fetch API base:", err);
    return null;
  }
}

/* ================= ENTRY ================= */

export const entry = defineEntry(async ({ output, args, langParser, event }) => {
  const t = langParser.createGetLang(langs);

  if (!args.length) return output.reply(t("noPrompt"));

  const prompt = args.join(" ");
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const filePath = path.join(cacheDir, `poli_${event.senderID}_${Date.now()}.png`);

  const loadingMsg = await output.reply(t("generating"));

  try {
    const apiBase = await getApiBase();
    if (!apiBase) throw new Error("API base not found!");

    const url = `${apiBase}/api/poli?prompt=${encodeURIComponent(prompt)}`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, data);

    await output.reply({
      body: `${UNISpectra.charm} ✅ Image générée avec succès\n📝 Prompt : ${prompt}`,
      attachment: fs.createReadStream(filePath),
    });

    fs.unlinkSync(filePath);
    if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
  } catch (err) {
    console.error("POLI ERROR:", err);
    if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
    output.reply(t("fail"));
  }
});

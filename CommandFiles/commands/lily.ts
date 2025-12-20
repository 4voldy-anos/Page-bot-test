import axios from "axios";
import fs from "fs";
import path from "path";
import gTTS from "gtts";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "lily",
  author: "Christus",
  version: "2.0.0",
  description: "Lily AI — Réponses vocales en français (TTS garanti)",
  category: "AI",
  usage: "{prefix}{name} <message>",
  role: 0,
  waitingTime: 5,
  icon: "🌸",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🌸 Christus • Lily",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  fr: {
    noText: "✍️ Écris un message pour Lily.",
    thinking: "⏳ Lily réfléchit...",
    fail: "❌ Lily n’est pas disponible pour le moment.",
  },
};

/* ================= CONSTANTS ================= */

const API_URL = "http://65.109.80.126:20409/aryan/lily";
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

/* ================= UTILS ================= */

async function generateTTS(text: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tts = new gTTS(text, "fr");
    tts.save(filePath, err => (err ? reject(err) : resolve()));
  });
}

/* ================= ENTRY ================= */

export const entry = defineEntry(async ({ output, args, langParser, event }) => {
  const t = langParser.createGetLang(langs);

  const userInput = args.join(" ").trim();
  if (!userInput) return output.reply(t("noText"));

  const loadingMsg = await output.reply(t("thinking"));

  try {
    const prompt = "Réponds UNIQUEMENT en français, de manière naturelle et claire :\n" + userInput;

    const { data } = await axios.get(API_URL, {
      params: { query: prompt },
      timeout: 20000,
    });

    if (!data?.answer) throw new Error("Invalid API response");

    const answer: string = data.answer;
    const filePath = path.join(cacheDir, `lily_${event.senderID}_${Date.now()}.mp3`);

    await generateTTS(answer, filePath);

    await output.reply({
      body: `${UNISpectra.charm} 🇫🇷 **Lily** :\n\n${answer}`,
      attachment: fs.createReadStream(filePath),
    });

    fs.unlinkSync(filePath);
    if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
  } catch (err) {
    console.error("LILY ERROR:", err);
    if (loadingMsg?.messageID) output.unsend(loadingMsg.messageID);
    output.reply(t("fail"));
  }
});

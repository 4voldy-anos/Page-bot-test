import fs from "fs";
import path from "path";
import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

/* ================= META ================= */

export const meta: CommandMeta = {
  name: "nijiv5",
  aliases: ["niji"],
  author: "Vincenzo | Christus Dev",
  version: "2.0.0",
  description: "Generate Niji v5 anime-style images",
  category: "AI",
  usage: "{prefix}{name} <prompt> [--ar <ratio>] [--1]",
  role: 2,
  waitingTime: 20,
  icon: "🌸",
  noLevelUI: true,
};

/* ================= STYLE ================= */

export const style: CommandStyle = {
  title: "🌸 Christus • NIJI v5",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ================= LANGS ================= */

export const langs = {
  en: {
    noPrompt: "❌ | Please provide a prompt.",
    generating: "🎨 Generating images, please wait...",
    failed: "❌ | Image generation failed.",
    choose: "🔢 Reply with **1, 2, 3 or 4** to select an image.",
    invalid: "❌ | Invalid choice. Use 1–4 only.",
  },
};

/* ================= CONSTANTS ================= */

const TMP_DIR = path.join(__dirname, "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

/* ================= ENTRY ================= */

export const entry = defineEntry(
  async ({ input, output, args, langParser }) => {
    const t = langParser.createGetLang(langs);

    if (!args.length) return output.reply(t("noPrompt"));

    let prompt = "";
    let ratio = "1:1";
    let single = false;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--ar" && args[i + 1]) {
        ratio = args[++i];
      } else if (args[i] === "--1") {
        single = true;
      } else {
        prompt += args[i] + " ";
      }
    }

    prompt = prompt.trim();
    if (!prompt) return output.reply(t("noPrompt"));

    const wait = await output.reply(t("generating"));

    try {
      /* ===== TOKEN ===== */
      const apiCfg = await axios.get(
        "https://raw.githubusercontent.com/Savage-Army/extras/refs/heads/main/api.json"
      );
      const tokenUrl = apiCfg.data.token;
      const tokenRes = await axios.get(tokenUrl);
      const token = tokenRes.data.bearer;

      const params = { prompt, ratio, token };

      /* ===== GENERATE 4 IMAGES ===== */
      const calls = single ? 1 : 4;
      const results = await Promise.all(
        Array.from({ length: calls }).map(() =>
          axios.get(
            "https://vincenzojin-hub-1.onrender.com/nijiv5/gen",
            { params }
          )
        )
      );

      const imageUrls = results.flatMap(r => r.data.imageUrls);
      if (!imageUrls.length) throw new Error("No images");

      /* ===== DOWNLOAD ===== */
      const paths: string[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const p = path.join(TMP_DIR, `niji_${Date.now()}_${i}.jpg`);
        const res = await axios.get(imageUrls[i], { responseType: "stream" });
        await new Promise((ok, err) => {
          const w = fs.createWriteStream(p);
          res.data.pipe(w);
          w.on("finish", ok);
          w.on("error", err);
        });
        paths.push(p);
      }

      await output.unsend(wait.messageID);

      /* ===== SINGLE IMAGE ===== */
      if (single) {
        return output.reply({
          body: `${UNISpectra.charm} **Image generated**`,
          attachment: fs.createReadStream(paths[0]),
        });
      }

      /* ===== COMBINE 4 ===== */
      const imgs = await Promise.all(paths.map(p => loadImage(p)));
      const w = imgs[0].width;
      const h = imgs[0].height;

      const canvas = createCanvas(w * 2, h * 2);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(imgs[0], 0, 0, w, h);
      ctx.drawImage(imgs[1], w, 0, w, h);
      ctx.drawImage(imgs[2], 0, h, w, h);
      ctx.drawImage(imgs[3], w, h, w, h);

      const combined = path.join(TMP_DIR, `niji_grid_${Date.now()}.jpg`);
      fs.writeFileSync(combined, canvas.toBuffer("image/jpeg"));

      const sent = await output.reply({
        body:
          `${UNISpectra.standardLine}\n` +
          `🧠 Prompt: ${prompt}\n` +
          `①   ②\n③   ④\n` +
          t("choose") +
          `\n${UNISpectra.standardLine}`,
        attachment: fs.createReadStream(combined),
      });

      input.setReply(sent.messageID, {
        key: "nijiv5",
        images: paths,
        author: input.senderID,
      });
    } catch (e) {
      console.error("NIJI ERROR:", e);
      await output.unsend(wait.messageID);
      output.reply(t("failed"));
    }
  }
);

/* ================= REPLY ================= */

export async function reply({
  input,
  output,
  repObj,
  langParser,
}: CommandContext & {
  repObj: {
    images: string[];
    author: string;
  };
}) {
  const t = langParser.createGetLang(langs);
  if (input.senderID !== repObj.author) return;

  const index = parseInt(input.body);
  if (isNaN(index) || index < 1 || index > 4)
    return output.reply(t("invalid"));

  await output.reply({
    attachment: fs.createReadStream(repObj.images[index - 1]),
  });
}

/*
@XaviaCMD
@Christus
*/

import axios from "axios";

/* ================= CONFIG ================= */

const config = {
  name: "ai",
  aliases: ["ask"],
  version: "3.0.0",
  permissions: [0],
  noPrefix: "both",
  credits: "Christus",
  description: "Assistant IA intelligent basé sur Gemini",
  category: "Artificial Intelligence",
  usages: "[question]",
  cooldown: 3
};

/* ================= STYLE ================= */

const style = {
  header: "🤖 𝗖𝗛𝗥𝗜𝗦𝗧𝗨𝗦 𝗔𝗜",
  footer: "✨ ***Powered by Gemini • Made with ❤️ by Christus***"
};

/* ================= MAIN ================= */

async function onCall({ message, args }) {
  const question = args.join(" ").trim();

  if (!question) {
    return message.reply(
      "❓ **Pose-moi une question.**\n\nExemple :\n`ai Explique moi l'intelligence artificielle`"
    );
  }

  try {
    const apiUrl = `https://arychauhann.onrender.com/api/gemini-proxy2?prompt=${encodeURIComponent(question)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result) {
      return message.reply("⚠️ L’IA n’a pas répondu. Réessaie dans quelques secondes.");
    }

    const answer = data.result.trim();
    const time = new Date().toLocaleString("fr-FR");

    const finalMessage = `
${style.header}

🧠 **Question :**
${question}

💬 **Réponse :**
${answer}

🕒 _${time}_

${style.footer}
`;

    await message.reply(finalMessage);

  } catch (error) {
    message.reply(
      "❌ **Erreur lors de la connexion à l’IA.**\n" +
      "Merci de réessayer plus tard."
    );
  }
}

/* ================= EXPORT ================= */

export default {
  config,
  onCall,
  style
};

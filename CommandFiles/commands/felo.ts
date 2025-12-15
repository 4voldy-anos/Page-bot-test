import axios, { AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const API_URL = "https://haji-mix-api.gleeze.com/api/felo";

const cmd = easyCMD({
  name: "felo",
  meta: {
    otherNames: ["feloai"],
    author: "Christus dev AI",
    description: "Felo AI assistant",
    icon: "🧠",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Felo AI 🧠",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  run(ctx) {
    return main(ctx);
  },
});

interface FeloResponse {
  user_ask: string;
  answer: {
    llm_response: string;
    sources: any[];
    images: any[];
    relatedQuestions: any[];
  };
}

async function main({
  output,
  args,
  input,
  cancelCooldown,
}: CommandContext & { uid?: string }) {
  const prompt = args.join(" ").trim();
  await output.reaction("⏳");

  if (!prompt) {
    cancelCooldown();
    await output.reaction("❌");
    return output.reply(
      "❓ Please provide a prompt.\n\nExample: felo Hello!"
    );
  }

  try {
    const params = {
      ask: prompt,
      stream: false,
    };

    const res: AxiosResponse<FeloResponse> = await axios.get(API_URL, {
      params,
      timeout: 25_000,
    });

    const answerText =
      res.data?.answer?.llm_response ||
      "No response received from Felo AI.";

    const form: StrictOutputForm = {
      body:
        `🧠 **Felo AI**\n\n` +
        `${answerText}\n\n` +
        `***Reply to continue the conversation.***`,
    };

    await output.reaction("✅");
    const info = await output.reply(form);

    // 🔁 Conversation continue
    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({
        ...rep,
        args: rep.input.words,
      });
    });
  } catch (err: any) {
    console.error("Felo API Error:", err?.message || err);
    await output.reaction("❌");
    cancelCooldown();
    return output.reply(
      `❌ Failed to connect to Felo AI.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;

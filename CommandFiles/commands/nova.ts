import axios, { AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const API_URL = "https://redwans-apis.gleeze.com/api/Nova-Pro-1-0";

const cmd = easyCMD({
  name: "nova_pro",
  meta: {
    otherNames: ["novapro", "nova", "pro1"],
    author: "Christus dev AI",
    description: "Nova Pro 1.0 – Advanced conversational AI",
    icon: "🚀",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Nova Pro 1.0 🚀",
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

interface NovaProResponse {
  status: string;
  reply?: string;
}

async function main({
  output,
  args,
  input,
  cancelCooldown,
}: CommandContext & { uid?: string }) {
  const prompt = args.join(" ").trim();
  await output.reaction("⏳"); // début

  if (!prompt) {
    cancelCooldown();
    await output.reaction("❌");
    return output.reply(
      "❓ Please provide a prompt for Nova Pro.\n\nExample: nova Hello!"
    );
  }

  try {
    const params = {
      uid: input.sid,
      msg: prompt,
    };

    const res: AxiosResponse<NovaProResponse> = await axios.get(API_URL, {
      params,
      timeout: 25_000,
    });

    if (!res.data || res.data.status !== "success" || !res.data.reply) {
      throw new Error("Invalid API response");
    }

    const form: StrictOutputForm = {
      body:
        `🚀 **Nova Pro 1.0**\n\n` +
        `${res.data.reply}\n\n` +
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
    console.error("Nova Pro API Error:", err?.message || err);
    await output.reaction("❌");
    cancelCooldown();
    return output.reply(
      `❌ Failed to connect to Nova Pro AI.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;

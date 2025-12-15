import axios, { AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const META_API = "https://estapis.onrender.com/api/ai/meta";

const cmd = easyCMD({
  name: "meta",
  meta: {
    otherNames: ["metaai", "facebookai"],
    author: "Christus",
    description: "Meta AI – Friendly conversational assistant",
    icon: "🟦",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Meta AI 🟦🤖",
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

interface MetaResponse {
  result: string;
  conversationId?: string;
}

async function main({
  output,
  args,
  input,
  cancelCooldown,
}: CommandContext & { conversationId?: string }) {
  const prompt = args.join(" ").trim();
  await output.reaction("🟡");

  if (!prompt) {
    cancelCooldown();
    await output.reaction("🔴");
    return output.reply(
      "❓ Please provide a message for Meta AI.\n\nExample:\nmeta Who are you?"
    );
  }

  try {
    const params: Record<string, string> = {
      prompt,
    };

    // 🔁 reuse conversationId if exists
    if ((main as any).conversationId) {
      params.conversationId = (main as any).conversationId;
    }

    const res: AxiosResponse<MetaResponse> = await axios.get(META_API, {
      params,
      timeout: 20_000,
    });

    const answer =
      res.data?.result || "⚠️ No response from Meta AI.";

    // 🧠 store conversation id
    if (res.data?.conversationId) {
      (main as any).conversationId = res.data.conversationId;
    }

    const form: StrictOutputForm = {
      body:
        `🟦 **Meta AI**\n\n` +
        `${answer}\n\n` +
        `***Reply to continue the conversation.***`,
    };

    await output.reaction("🟢");
    const info = await output.reply(form);

    // 🔁 conversation continue
    info.atReply((rep) => {
      rep.output.setStyle(cmd.style);
      main({
        ...rep,
        args: rep.input.words,
      });
    });
  } catch (err: any) {
    console.error("Meta AI API Error:", err?.message || err);
    await output.reaction("🔴");
    cancelCooldown();
    return output.reply(
      `❌ Failed to connect to Meta AI.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;

import axios, { AxiosResponse } from "axios";
import { StrictOutputForm } from "output-cassidy";

const API_URL =
  "https://wildan-suldyir-apis.vercel.app/api/efcore-ai";

const cmd = easyCMD({
  name: "efcore",
  meta: {
    otherNames: ["efcore-ai", "entityframework-ai"],
    author: "Christus dev AI",
    description: "EF Core AI – Entity Framework Core assistant",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "EF Core AI 🤖",
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

interface EFCoreResponse {
  response: string;
}

async function main({
  output,
  args,
  cancelCooldown,
}: CommandContext) {
  const prompt = args.join(" ").trim();
  await output.reaction("⏳"); // début

  if (!prompt) {
    cancelCooldown();
    await output.reaction("❌");
    return output.reply(
      "❓ Please provide a prompt.\n\nExample: efcore Create EF Core example"
    );
  }

  try {
    const params = {
      prompt,
    };

    const res: AxiosResponse<EFCoreResponse> = await axios.get(API_URL, {
      params,
      timeout: 25_000,
    });

    const form: StrictOutputForm = {
      body:
        `🤖 **EF Core AI**\n\n` +
        `${res.data.response}\n\n` +
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
    console.error("EFCore AI API Error:", err?.message || err);
    await output.reaction("❌");
    cancelCooldown();
    return output.reply(
      `❌ Failed to connect to EF Core AI.\n\nMessage: ${
        err?.message || "Unknown error"
      }`
    );
  }
}

export default cmd;

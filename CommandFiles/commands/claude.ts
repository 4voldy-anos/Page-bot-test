import axios from "axios";

const API_URL = "https://haji-mix-api.gleeze.com/api/puter";

const cmd = easyCMD({
  name: "claude",
  meta: {
    otherNames: ["claude3", "claude3.7", "anthropic"],
    author: "Christus dev AI",
    description: "Anthropic Claude 3.7 Sonnet AI",
    icon: "🤖",
    version: "1.0.0",
    noPrefix: "both",
  },
  title: {
    content: "Claude 3.7 🤖",
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

interface ClaudeResponse {
  user_query: string;
  model_used: string;
  answer: string;
}

async function main({ output, args, input, cancelCooldown }: CommandContext & { uid?: string }) {
  const prompt = args.join(" ").trim();
  await output.reaction("⏳"); // début

  if (!prompt) {
    cancelCooldown();
    await output.reaction("❌");
    return output.reply("❓ Please provide a prompt.\n\nExample: claude Hello!");
  }

  try {
    const params = {
      ask: prompt,
      model: "anthropic/claude-3.7-sonnet",
      uid: input.sid || "",
      roleplay: "",
      stream: false,
    };

    const res = await axios.get<ClaudeResponse>(API_URL, { params, timeout: 25_000 });
    const answerText = res.data?.answer || "No response from Claude.";

    await output.reaction("✅");
    return output.reply(`🤖 **Claude 3.7**\n\n${answerText}`);
  } catch (err: any) {
    console.error("Claude API Error:", err?.message || err);
    await output.reaction("❌");
    cancelCooldown();
    return output.reply(`❌ Failed to connect to Claude AI.\n\nMessage: ${err?.message || "Unknown error"}`);
  }
}

export default cmd;

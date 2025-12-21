import axios from "axios";
import fs from "fs";
import path from "path";

interface SupportedDomain {
  domain: string;
  cookieFile: string | null;
}

const supportedDomains: SupportedDomain[] = [
  { domain: "facebook.com", cookieFile: null },
  { domain: "instagram.com", cookieFile: "insta.txt" },
  { domain: "youtube.com", cookieFile: "yt.txt" },
  { domain: "youtu.be", cookieFile: "yt.txt" },
  { domain: "pinterest.com", cookieFile: null },
  { domain: "tiktok.com", cookieFile: null },
];

interface DownloadParams {
  filesize?: number;
  format?: "video" | "audio";
  cookies?: string;
}

export const meta: CommandMeta = {
  name: "dl",
  description:
    "Download videos or audios from supported platforms with optional parameters (size, format, cookies).",
  version: "2.3.0",
  author: "Christus dev AI",
  category: "Media",
  icon: "⬇️",
  role: 0,
  noWeb: true,
};

export const style: CommandStyle = {
  title: "⬇️ Media Downloader",
  titleFont: "bold",
  contentFont: "fancy",
};

/* ---------------- HELPERS ---------------- */

function getMainDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    if (hostname === "youtu.be") return "youtube.com";
    const parts = hostname.split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  } catch {
    return null;
  }
}

function getDefaultCookie(domain: string | null): string | null {
  if (!domain) return null;
  return supportedDomains.find((d) => d.domain === domain)?.cookieFile ?? null;
}

function parseArgs(args: string[]): DownloadParams {
  const params: DownloadParams = {};

  args.forEach((arg, i) => {
    if (!arg.startsWith("--")) return;

    const key = arg.slice(2).toLowerCase();
    const value = args[i + 1];

    switch (key) {
      case "maxsize":
      case "fs":
      case "ms":
        if (!isNaN(Number(value))) params.filesize = Number(value);
        break;

      case "type":
      case "format":
      case "media":
      case "f":
        if (value && ["video", "audio"].includes(value.toLowerCase())) {
          params.format = value.toLowerCase() as "video" | "audio";
        }
        break;

      case "cookie":
      case "cookies":
      case "c":
        if (!value) break;
        const cookiePath = path.join(process.cwd(), value);
        if (fs.existsSync(cookiePath)) {
          params.cookies = fs.readFileSync(cookiePath, "utf-8");
        }
        break;
    }
  });

  return params;
}

async function downloadMedia(
  url: string,
  params: DownloadParams,
  output: CommandContext["output"],
  input: CommandContext["input"]
) {
  const domain = getMainDomain(url);

  if (!params.cookies) {
    const defaultCookie = getDefaultCookie(domain);
    if (defaultCookie) {
      const cookiePath = path.join(process.cwd(), defaultCookie);
      if (fs.existsSync(cookiePath)) {
        params.cookies = fs.readFileSync(cookiePath, "utf-8");
      }
    }
  }

  params.filesize ??= 25;

  const apiUrl = (
    await axios.get(
      "https://raw.githubusercontent.com/Tanvir0999/stuffs/refs/heads/main/raw/addresses.json"
    )
  ).data.megadl;

  const response = await axios.post(apiUrl, {
    url,
    ...(params.format && { format: params.format }),
    ...(params.filesize && { filesize: params.filesize }),
    ...(params.cookies && { cookies: params.cookies }),
  });

  const data = response.data;

  await output.replyStyled(
    {
      body: `• ${
        data.title.length > 50
          ? data.title.slice(0, 50) + "..."
          : data.title
      }
• Duration: ${data.duration}
• Upload Date: ${data.upload_date || "--"}
• Source: ${data.source}

• Stream: ${data.url}`,
      attachment: await global.utils.getStreamFromURL(data.url),
    },
    style
  );

  output.reaction("✅");
}

/* ---------------- ENTRY ---------------- */

export async function entry({
  output,
  input,
  args,
  threadsDB,
}: CommandContext) {
  if (
    (args[0] === "on" ||
      args[0] === "off" ||
      (args[0] === "chat" && ["on", "off"].includes(args[1]))) &&
    !input.isAdmin
  ) {
    return output.reply("You do not have permission to change this setting.");
  }

  if (args[0] === "on" || args[0] === "off" || args[1] === "on" || args[1] === "off") {
    const choice = args[0] === "on" || args[1] === "on";
    const cache = await threadsDB.getCache(input.threadID);

    await threadsDB.setItem(input.threadID, {
      autoDownload: choice,
      ...cache,
    });

    return output.reply(
      `Auto-download has been turned ${choice ? "on ✅" : "off ❌"}`
    );
  }

  const url = args.find((a) => /^https?:\/\//.test(a));
  if (!url) return output.reply("Please provide a valid URL.");

  const domain = getMainDomain(url);
  if (!supportedDomains.some((d) => d.domain === domain)) {
    return output.reply("This platform is not supported.");
  }

  const params = parseArgs(args.filter((a) => a !== url));
  output.react("⏳");

  await downloadMedia(url, params, output, input);
}

/* ---------------- EVENT ---------------- */

export async function event({
  output,
  input,
  threadsDB,
}: CommandContext) {
  const cache = await threadsDB.getCache(input.threadID);
  if (cache.autoDownload === false) return;
  if (input.senderID === global.botID) return;

  const text = String(input);
  const match = text.match(/https:\/\/[^\s]+/);
  if (!match) return;

  const url = match[0];
  const domain = getMainDomain(url);

  if (!supportedDomains.some((d) => d.domain === domain)) return;

  output.react("⏳");
  await downloadMedia(url, {}, output, input);
}

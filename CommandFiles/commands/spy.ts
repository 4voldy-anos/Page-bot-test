import { defineCommand } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";

export default defineCommand({
  meta: {
    name: "spy",
    otherNames: ["userinfo", "stalk", "info"],
    author: "Christus Dev AI",
    version: "1.1.0",
    description: "Spy on a user and reveal profile information",
    usage: "{prefix}spy [@user | reply]",
    category: "Utility",
    role: 0,
    waitingTime: 15,
  },

  style: {
    title: "🕵️ SPY",
    titleFont: "bold",
    contentFont: "fancy",
  },

  async entry({ input, output, usersDB }) {
    /* ================= TARGET ================= */
    const targetID =
      input.mentions?.[0] ||
      input.messageReply?.senderID ||
      input.senderID;

    await usersDB.ensureUserInfo(targetID);
    const user = await usersDB.getItem(targetID);

    if (!user) {
      return output.reply("❌ Unable to fetch user information.");
    }

    /* ================= BASIC DATA ================= */
    const meta = user.userMeta || {};
    const rawFullName = meta.name || user.name || "Unknown";

    // Nettoyage du nom stylé pour extraire prénom / nom
    const cleanedName = rawFullName
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .trim();

    const nameParts = cleanedName.split(/\s+/);

    const fullName = rawFullName;
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ");

    const gender = meta.gender || "Not available";
    const username = meta.username || "Not available";
    const birthday = meta.birthday || "Not available";
    const profileURL = meta.profileUrl || "Not available";
    const avatar = meta.image;

    /* ================= BOT DATA ================= */
    const joinedAt =
      user.joinedAt || user.createdAt
        ? new Date(user.joinedAt || user.createdAt).toLocaleDateString()
        : "Unknown";

    const updatedAt = user.updatedAt
      ? new Date(user.updatedAt).toLocaleDateString()
      : "Unknown";

    const balance = user.money ?? 0;
    const exp = user.exp ?? 0;
    const level = user.level ?? 1;
    const nextLevel = user.nextLevelExp ?? "Unknown";

    /* ================= GROUP DATA ================= */
    const groupName = input.threadName || "Unknown";
    const nickname = input.nicknames?.[targetID] || "None";
    const isAdmin = input.adminIDs?.includes(targetID)
      ? "👑 Admin"
      : "❌ Member";

    const msgCount = user.messageCount ?? 0;

    /* ================= STATS ================= */
    const profileScore = Math.min(10, Math.floor(exp / 100));
    const userRank = exp >= 1000 ? "🥈 Intermediate" : "🥉 Newbie";

    /* ================= TIME (CÔTE D’IVOIRE) ================= */
    const reportTime = new Date().toLocaleString("en-GB", {
      timeZone: "Africa/Abidjan",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    /* ================= MESSAGE ================= */
    const body = `
🕵️ 𝐒𝐏𝐘
━━━━━━━━━━━━

👤 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
📝 𝖥𝗎𝗅𝗅 𝖭𝖺𝗆𝖾: ${fullName}
👤 𝖥𝗂𝗋𝗌𝗍 𝖭𝖺𝗆𝖾: ${firstName}
👥 𝖫𝖺𝗌𝗍 𝖭𝖺𝗆𝖾: ${lastName || "—"}
🆔 𝖴𝗌𝖾𝗋 𝖨𝖣: ${targetID}
⚧️ 𝖦𝖾𝗇𝖽𝖾𝗋: ${gender}
🔗 𝖴𝗌𝖾𝗋𝗇𝖺𝗆𝖾: ${username}
🎂 𝖡𝗂𝗋𝗍𝗁𝖽𝖺𝗒: ${birthday}
🌐 𝖯𝗋𝗈𝖿𝗂𝗅𝖾 𝖴𝖱𝖫: ${profileURL}

📱 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐒𝐓𝐀𝐓𝐔𝐒
🏷️ 𝖠𝖼𝖼𝗈𝗎𝗇𝗍 𝖳𝗒𝗉𝖾: User
🚫 𝖡𝖺𝗇𝗇𝖾𝖽: ❌ No

🤖 𝐁𝐎𝐓 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄
📅 𝖥𝗂𝗋𝗌𝗍 𝖩𝗈𝗂𝗇𝖾𝖽: ${joinedAt}
🔄 𝖫𝖺𝗌𝗍 𝖴𝗉𝖽𝖺𝗍𝖾: ${updatedAt}
💰 𝖡𝖺𝗅𝖺𝗇𝖼𝖾: ${balance}$
⭐ 𝖤𝗑𝗉𝖾𝗋𝗂𝖾𝗇𝖼𝖾: ${exp} XP
🎯 𝖫𝖾𝗏𝖾𝗅: ${level}
📈 𝖭𝖾𝗑𝗍 𝖫𝖾𝗏𝖾𝗅: ${nextLevel} XP needed

💬 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
🏷️ 𝖭𝗂𝖼𝗄𝗇𝖺𝗆𝖾: ${nickname}
👑 𝖠𝖽𝗆𝗂𝗇 𝖲𝗍𝖺𝗍𝗎𝗌: ${isAdmin}
💬 𝖬𝖾𝗌𝗌𝖺𝗀𝖾𝗌 𝖲𝖾𝗇𝗍: ${msgCount}
📍 𝖦𝗋𝗈𝗎𝗉 𝖭𝖺𝗆𝖾: ${groupName}

📊 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐒
🌟 𝖯𝗋𝗈𝖿𝗂𝗅𝖾 𝖲𝖼𝗈𝗋𝖾: ${profileScore}/10
🏆 𝖴𝗌𝖾𝗋 𝖱𝖺𝗇𝗄: ${userRank}

🕐 𝑅𝑒𝑝𝑜𝑟𝑡 𝐺𝑒𝑛𝑒𝑟𝑎𝑡𝑒𝑑: ${reportTime}
━━━━━━━━━━━━
`;

    /* ================= SEND ================= */
    return output.reply({
      body,
      ...(input.isWeb || !avatar
        ? {}
        : { attachment: [await global.utils.getStreamFromURL(avatar)] }),
    });
  },
});

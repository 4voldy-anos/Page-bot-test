// CommandFiles/commands/help2.ts

// @ts-check
import {
 extractCommandRole,
 toTitleCase,
 UNISpectra,
} from "@cassidy/unispectra";
import { ShopClass } from "@cass-plugins/shopV2";

export const meta: CommandMeta = {
 name: "menu",
 author: "Christus dev AI",
 description: "Affiche la liste dynamique des commandes du bot.",
 version: "3.2.1",
 usage: "{prefix}{name} [all | commandName]",
 category: "System",
 role: 0,
 waitingTime: 0.1,
 requirement: "3.0.0",
 icon: "📚",
 otherNames: ["help", "start"],
};

export const style: CommandStyle = {
 title: "📚 CHRISTUS BOT COMMANDS",
 titleFont: "bold",
 contentFont: "fancy",
};

export async function entry({
 input,
 output,
 prefix,
 commandName,
 multiCommands,
}: CommandContext) {
 // Récupération de toutes les commandes uniques chargées dans le bot
 const commands = multiCommands.toUnique((i) => i.meta?.name);
 const args = input.arguments;

 // --- MENU GÉNÉRAL ---
 if (!args[0] || args[0].toLowerCase() === "all") {
 
 const categorizedCommands: Record<string, string[]> = {};

 // Groupement des commandes par catégorie
 commands.values().forEach((command) => {
 const category = command.meta.category || "Autres";
 if (!categorizedCommands[category]) categorizedCommands[category] = [];
 categorizedCommands[category].push(command.meta.name);
 });

 // Tri alphabétique des catégories
 const sortedCategories = Object.keys(categorizedCommands).sort();

 let result = `📚 **CASSIDY BOT COMMANDS**\n\n`;

 for (const category of sortedCategories) {
 result += `🍓 **${category}**\n`;
 
 // Liste des commandes (police normale)
 const cmdList = categorizedCommands[category]
 .sort()
 .map(name => `• ${name}`)
 .join(" ");
 
 result += `${cmdList}\n\n`;
 }

 // Pied de page
 result += `📊 **Total Commands**: ${commands.size}\n`;
 result += `🔧 **Command Info**: ${prefix}${commandName} <command>\n`;
 result += `🔍 **Search**: ${prefix}${commandName} search <keyword>\n`;
 result += `🤖 **AI Suggest**: ${prefix}${commandName} -ai <command>`;

 return output.reply(result);
 }

 // --- DÉTAILS D'UNE COMMANDE (HELP) ---
 const specificCmd = multiCommands.getOne(args[0].toLowerCase());
 if (specificCmd) {
 const { 
 name, 
 description, 
 usage, 
 category, 
 waitingTime, 
 author = "Inconnu" 
 } = specificCmd.meta;

 let detail = `╭─── 📄 **${toTitleCase(name)}** ───\n`;
 detail += `│ 📜 **Nom**: ${name}\n`;
 detail += `│ 👤 **Auteur**: ${author}\n`;
 detail += `│ 💬 **Description**: ${description}\n`;
 detail += `│ 🛠️ **Usage**: ${usage.replace("{prefix}", prefix).replace("{name}", name)}\n`;
 detail += `│ 📁 **Catégorie**: ${category}\n`;
 detail += `│ ⏳ **Cooldown**: ${waitingTime}s\n`;
 detail += `╰────────────────`;
 
 return output.reply(detail);
 }

 return output.reply(`❌ La commande **${args[0]}** n'existe pas.`);
}

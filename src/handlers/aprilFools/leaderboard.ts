import { Colors, type APIEmbed, type Client } from "discord.js";
import config from "../../config";
import getGlobal from "../../database/global";
import { Love } from "../../database/love";

export default function handleLeaderboard(client: Client<true>): void {
  setInterval(() => {
    void getGlobal().then(async ({ welcomeChannelId, welcomeMessageId }) => {
      if (!(welcomeChannelId && welcomeMessageId)) return;

      const channel = client.channels.resolve(welcomeChannelId);
      if (!channel?.isTextBased()) return;

      const message = await channel.messages.fetch(welcomeMessageId).catch(() => null);
      if (!message) return;

      void message.edit({ embeds: await createLeaderboard() });
    });
  }, 60_000);
}

export async function createLeaderboard(): Promise<APIEmbed[]> {
  const allLove = await Love.find();
  const sorted = allLove.sort((a, b) => b.points - a.points);
  const allHate = allLove.filter(love => love.points < 0);
  const hateSorted = allHate.sort((a, b) => a.points - b.points);

  return [
    {
      title: "Love Leaderboard 💙",
      description: sorted.slice(0, 10)
        .map((love, index) => `**${index + 1}.** <@${love.userId}> - ${love.points} points, ${love.messages} messages`)
        .join("\n") || "*Leaderboard is empty - waiting for love!*",
      color: config.themeColor,
    },
    {
      title: "HATE Leaderboard 😡",
      description: hateSorted.slice(0, 10)
        .map((love, index) => `**${index + 1}.** <@${love.userId}> - ${love.points} points, ${love.messages} messages`)
        .join("\n") || "*Leaderboard is empty - there's only love ❤️*",
      color: Colors.Red,
    },
  ];
}

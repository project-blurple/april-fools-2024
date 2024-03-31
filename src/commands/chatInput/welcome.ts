import dedent from "dedent";
import { ApplicationCommandOptionType } from "discord.js";
import getGlobal from "../../database/global";
import { createLeaderboard } from "../../handlers/aprilFools/leaderboard";
import type { FirstLevelChatInputCommand } from ".";

export default {
  name: "welcome",
  description: "Send a welcome message in a channel",
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "The channel to send the welcome message in",
      required: true,
    },
  ],
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel", true);
    if (!channel.isTextBased()) return void interaction.reply({ content: "❌ The channel must be a text channel.", ephemeral: true });
    if (!channel.permissionsFor(interaction.guild.members.me!).has("SendMessages")) return void interaction.reply({ content: "❌ I don't have permission to send messages in that channel.", ephemeral: true });

    const welcomeMessage = await channel.send({
      content: dedent`
        # Blurple Love
        We're trying out a new experiment, starting **right now**... excited? 🎉

        We're tracking how much love you spread in the server the next 48 hours (roughly). Every message you send in the server will be analyzed and you'll get points based on the sentiment of your message. The more positive, the more points you get. The more negative, the more points you lose. So, please... show some love, kiss your homies goodnight, and spread some positivity! 💙

        Want it to be shown on your profile? Click Project Blurple on the top left of your screen, and then click Linked Roles. You'll see a new role called "Love" - click it to link it to your profile. You'll see your rank, love points, and messages sent during this event. Good luck! 🍀
      `,
      embeds: [await createLeaderboard()],
    });

    await getGlobal().then(glob => {
      glob.welcomeChannelId = welcomeMessage.channel.id;
      glob.welcomeMessageId = welcomeMessage.id;
      return glob.save();
    });

    return void interaction.reply({ content: "✅ Welcome message sent.", ephemeral: true });
  },
} satisfies FirstLevelChatInputCommand;

import { type ApplicationRoleConnectionMetadataEditOptions, Routes, type Client, ApplicationRoleConnectionMetadataType } from "discord.js";
import config from "../../config";
import handleExpress from "./express";
import handleLeaderboard from "./leaderboard";
import handleLinkedRoles from "./linkedRoles";
import messageListener from "./messageListener";

export default function handleAprilFools(client: Client<true>): void {
  void client.rest.put(Routes.applicationRoleConnectionMetadata(client.user.id), {
    headers: {
      "Authorization": `Bot ${config.client.token}`,
      "Content-Type": "application/json",
    },
    body: [
      {
        type: ApplicationRoleConnectionMetadataType.IntegerEqual,
        key: "rank",
        name: "Rank",
        description: "The user's rank on the server",
      },
      {
        type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
        key: "love",
        name: "Love Points",
        description: "The amount of love points the user has",
      },
      {
        type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
        key: "messages",
        name: "Messages sent",
        description: "The amount of messages sent during April Fools",
      },
    ] satisfies ApplicationRoleConnectionMetadataEditOptions[],
  });

  client.on("messageCreate", message => {
    if (config.guildId === message.guildId) void messageListener(message);
  });

  handleExpress(client);
  handleLeaderboard(client);
  handleLinkedRoles(client);
}

import { type RESTPutAPICurrentUserApplicationRoleConnectionJSONBody, Routes, type Client, RouteBases } from "discord.js";
import type { LoveDocument } from "../../database/love";
import { Love } from "../../database/love";
import oauth from "../../utils/oauth";

export default function handleLinkedRoles(client: Client<true>): void {
  setInterval(() => {
    void (async () => {
      const allLove = await Love.find();
      const sortedLove = allLove.sort((a, b) => b.points - a.points);
      const oauthLove = allLove.filter(love => love.oauth);

      for (const love of oauthLove) {
        const tokenResponse = await oauth.tokenRequest({
          refreshToken: love.oauth!.refreshToken,
          grantType: "refresh_token",
          scope: ["identify", "role_connections.write"],
        });

        love.oauth = {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
        };
        love.safeSave();

        await updateLinkedRoles(client, love, sortedLove);
      }
    })();
  }, 300_000);
}

export async function updateLinkedRoles(client: Client<true>, love: LoveDocument, sortedLove?: LoveDocument[]): Promise<void> {
  await fetch(RouteBases.api + Routes.userApplicationRoleConnection(client.user.id), {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${love.oauth!.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      /* eslint-disable camelcase */
      platform_name: "April Fools 2024",
      platform_username: "Blurple Love Experiment",
      metadata: {
        ...sortedLove && { rank: sortedLove.findIndex(comparedLove => comparedLove.userId === love.userId) + 1 },
        love: love.points,
        messages: love.messages,
      },
      /* eslint-enable camelcase */
    } as RESTPutAPICurrentUserApplicationRoleConnectionJSONBody),
  });
}

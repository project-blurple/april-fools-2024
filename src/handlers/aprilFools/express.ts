import type { Client } from "discord.js";
import express from "express";
import config from "../../config";
import getLove from "../../database/love";
import oauth, { oauthRedirectUrl } from "../../utils/oauth";
import { updateLinkedRoles } from "./linkedRoles";

export default function handleExpress(client: Client<true>): void {
  const app = express();

  app.get("/", (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect(oauthRedirectUrl);

    void oauth.tokenRequest({
      code: String(code),
      scope: ["identify", "role_connections.write"],
      grantType: "authorization_code",
      redirectUri: config.url,
    }).then(async ({ access_token: accessToken, refresh_token: refreshToken }) => {
      const { id: userId } = await oauth.getUser(accessToken);

      const love = await getLove(userId);
      love.oauth = { accessToken, refreshToken };
      love.safeSave();

      await updateLinkedRoles(client, love);

      return res.redirect("https://projectblurple.com");
    })
      .catch(() => res.redirect(oauthRedirectUrl));
  });

  app.listen(config.port);
}

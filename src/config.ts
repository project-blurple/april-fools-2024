import { config } from "dotenv";

config();

export default {
  client: {
    id: String(process.env["CLIENT_ID"]),
    secret: String(process.env["CLIENT_SECRET"]),
    token: String(process.env["CLIENT_TOKEN"]),
  },

  databaseUri: String(process.env["DATABASE_URI"]),

  ownerId: String(process.env["OWNER_ID"]),
  guildId: String(process.env["GUILD_ID"]),

  themeColor: parseInt(process.env["THEME_COLOR"] ?? "0", 16) || 0x5865F2,

  port: parseInt(process.env["PORT"] ?? "3000", 10),
  url: process.env["URL"] ?? `http://localhost:${process.env["PORT"]}/`,
} as const;

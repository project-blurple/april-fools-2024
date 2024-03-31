import type { DocumentType } from "@typegoose/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import type { Snowflake } from "discord.js";

export class GlobalSchema {
  @prop({ type: String, default: null }) welcomeChannelId!: Snowflake | null;
  @prop({ type: String, default: null }) welcomeMessageId!: Snowflake | null;
}

export type GlobalDocument = DocumentType<GlobalSchema>;

export const Global = getModelForClass(GlobalSchema);

export default async function getGlobal(): Promise<GlobalDocument> {
  return await Global.findOne() ?? new Global();
}

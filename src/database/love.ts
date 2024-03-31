/* eslint-disable max-classes-per-file */
import type { DocumentType } from "@typegoose/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import type { Snowflake } from "discord.js";

const saveQueue = new Map<Snowflake, 1 | 2>();

export class OAuthSchema {
  @prop({ type: String, required: true }) accessToken!: string;
  @prop({ type: String, required: true }) refreshToken!: string;
}

export class LoveSchema {
  @prop({ type: String, unique: true, required: true }) userId!: Snowflake;
  @prop({ type: Number, default: 0 }) positivePoints!: number;
  @prop({ type: Number, default: 0 }) negativePoints!: number;
  @prop({ type: Number, default: 0 }) messages!: number;
  @prop({ type: OAuthSchema, default: null }) oauth!: OAuthSchema | null;
  get points(): number {
    // this.negativePoints is a negative number so we add them together instead of subtracting
    return this.positivePoints + this.negativePoints;
  }

  // we can't save in parallell, and although we can await the guild.save(), that would not work across files.
  safeSave(this: LoveDocument): void {
    if (saveQueue.has(this.userId)) return void saveQueue.set(this.userId, 2);

    saveQueue.set(this.userId, 1);
    return void this.save().then(() => {
      if (saveQueue.get(this.userId) === 2) {
        saveQueue.delete(this.userId);
        this.safeSave();
      } else saveQueue.delete(this.userId);
    });
  }
}

export type LoveDocument = DocumentType<LoveSchema>;

export const Love = getModelForClass(LoveSchema);

const loveCache = new Map<Snowflake, LoveDocument>();
const loveCacheQueue = new Map<Snowflake, Promise<LoveDocument>>();

export default function getLove(userId: Snowflake): Promise<LoveDocument> {
  const loveFromCache = loveCache.get(userId);
  if (loveFromCache) return Promise.resolve(loveFromCache);

  const queued = loveCacheQueue.get(userId);
  if (queued) return queued;

  const promise = Love.findOne({ userId }).then(loveInDb => {
    const love = loveInDb ?? new Love({ userId });

    loveCache.set(userId, love);
    loveCacheQueue.delete(userId);
    return love;
  });

  loveCacheQueue.set(userId, promise);
  return promise;
}

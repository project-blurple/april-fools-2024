import type { Message } from "discord.js";
import Sentiment from "sentiment";
import getLove from "../../database/love";

const sentiment = new Sentiment();

export default async function messageListener(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (message.content.toLowerCase().includes("april fools")) void message.react("🤡");

  const result = sentiment.analyze(message.content);

  const love = await getLove(message.author.id);
  love.messages += 1;
  result.calculation.forEach(calculation => {
    const word = Object.keys(calculation)[0]!;
    const score = calculation[word]!;
    if (score > 0) love.positivePoints += score;
    else if (score < 0) love.negativePoints += score;
  });
  love.safeSave();
}

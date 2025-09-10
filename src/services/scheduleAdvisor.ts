import Tweet from "../models/Tweet";

export const recommendTimes = async (userId: string, count = 3): Promise<Date[]> => {
  // Simple heuristic: avoid conflicts and suggest next quarter hours in the next hours
  const base = new Date();
  const candidates: Date[] = [];
  let cursor = new Date(base.getTime() + 5 * 60000); // start 5 minutes from now
  while (candidates.length < count) {
    cursor.setSeconds(0, 0);
    const minute = cursor.getMinutes();
    if (minute % 15 !== 0) {
      const delta = 15 - (minute % 15);
      cursor = new Date(cursor.getTime() + delta * 60000);
    }
    const exists = await Tweet.exists({ user: userId, status: "scheduled", scheduledAt: cursor });
    if (!exists) {
      candidates.push(new Date(cursor));
    }
    cursor = new Date(cursor.getTime() + 15 * 60000);
  }
  return candidates;
};

export default recommendTimes;


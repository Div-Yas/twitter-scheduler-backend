import { ITweet } from "../models/Tweet";

export type PerformanceBucket = "viral" | "performing" | "underperforming";

export interface TweetMetrics {
  score: number;
  bucket: PerformanceBucket;
  engagementRate: number;
  reach: number;
  viralityScore: number;
}

export interface AnalyticsSummary {
  counts: {
    total: number;
    viral: number;
    performing: number;
    underperforming: number;
  };
  scored: Array<{
    id: string;
    name: string;
    score: number;
    bucket: PerformanceBucket;
    engagementRate: number;
    reach: number;
    viralityScore: number;
    content: string;
    scheduledAt: string;
    status: string;
  }>;
  trends: {
    totalImpressions: number;
    totalLikes: number;
    totalRetweets: number;
    averageEngagementRate: number;
    bestPerformingTweet: string;
    worstPerformingTweet: string;
    engagementTrend: 'up' | 'down' | 'stable';
    postingFrequency: number;
  };
  insights: {
    optimalPostingTimes: string[];
    topHashtags: Array<{ tag: string; count: number }>;
    contentTypes: {
      withMedia: number;
      textOnly: number;
      averageLength: number;
    };
    performanceByDay: Array<{ day: string; score: number }>;
  };
}

export const scoreTweet = (tweet: ITweet): TweetMetrics => {
  const impressions = tweet.impressions || 0;
  const likes = tweet.likes || 0;
  const retweets = tweet.retweets || 0;
  
  // For non-posted tweets, return default metrics
  if (tweet.status !== 'posted') {
    return {
      score: 0,
      bucket: 'underperforming',
      engagementRate: 0,
      reach: 0,
      viralityScore: 0
    };
  }
  
  // Enhanced scoring algorithm for posted tweets
  const engagementScore = likes * 2 + retweets * 3;
  const reachScore = impressions * 0.1;
  const viralityScore = retweets > 0 ? (retweets / Math.max(impressions, 1)) * 1000 : 0;
  
  const totalScore = engagementScore + reachScore + viralityScore;
  const engagementRate = impressions > 0 ? ((likes + retweets) / impressions) * 100 : 0;
  
  let bucket: PerformanceBucket = "underperforming";
  if (totalScore >= 1000 || viralityScore >= 50) {
    bucket = "viral";
  } else if (totalScore >= 200 || engagementRate >= 5) {
    bucket = "performing";
  }
  
  return { 
    score: Math.round(totalScore), 
    bucket, 
    engagementRate: Math.round(engagementRate * 100) / 100,
    reach: impressions,
    viralityScore: Math.round(viralityScore * 100) / 100
  };
};

export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#\w+/g;
  return content.match(hashtagRegex) || [];
};

export const getOptimalPostingTimes = (tweets: ITweet[]): string[] => {
  const postedTweets = tweets.filter(t => t.status === 'posted' && t.impressions);
  if (postedTweets.length === 0) return [];
  
  // Group by hour and calculate average performance
  const hourlyPerformance: { [hour: string]: number[] } = {};
  
  postedTweets.forEach(tweet => {
    const hour = new Date(tweet.scheduledAt).getHours();
    const score = (tweet.likes || 0) + (tweet.retweets || 0) * 2;
    if (!hourlyPerformance[hour]) hourlyPerformance[hour] = [];
    hourlyPerformance[hour].push(score);
  });
  
  // Calculate average performance per hour
  const avgPerformance = Object.entries(hourlyPerformance).map(([hour, scores]) => ({
    hour: parseInt(hour),
    avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length
  }));
  
  // Sort by performance and return top 3 hours
  return avgPerformance
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map(item => `${item.hour}:00`);
};

export const analyzeContentTypes = (tweets: ITweet[]) => {
  const withMedia = tweets.filter(t => t.media && t.media.length > 0).length;
  const textOnly = tweets.length - withMedia;
  const totalLength = tweets.reduce((sum, t) => sum + t.content.length, 0);
  const averageLength = tweets.length > 0 ? Math.round(totalLength / tweets.length) : 0;
  
  return { withMedia, textOnly, averageLength };
};

export const getPerformanceByDay = (tweets: ITweet[]) => {
  const dayPerformance: { [day: string]: number[] } = {};
  
  tweets.forEach(tweet => {
    if (tweet.status === 'posted') {
      const day = new Date(tweet.scheduledAt).toLocaleDateString('en-US', { weekday: 'long' });
      const score = (tweet.likes || 0) + (tweet.retweets || 0) * 2;
      if (!dayPerformance[day]) dayPerformance[day] = [];
      dayPerformance[day].push(score);
    }
  });
  
  return Object.entries(dayPerformance).map(([day, scores]) => ({
    day,
    score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }));
};

export const summarize = (tweets: ITweet[]): AnalyticsSummary => {
  const scored = tweets.map(t => ({ 
    id: t._id.toString(),
    name: t.get('user.name') || 'Unknown',
    content: t.content,
    scheduledAt: t.scheduledAt.toISOString(),
    status: t.status,
    ...scoreTweet(t) 
  }));
  
  // Only count performance buckets for posted tweets
  const postedTweets = tweets.filter(t => t.status === 'posted');
  const postedScored = postedTweets.map(t => scoreTweet(t));
  
  const counts = {
    total: tweets.length,
    viral: postedScored.filter(t => t.bucket === 'viral').length,
    performing: postedScored.filter(t => t.bucket === 'performing').length,
    underperforming: postedScored.filter(t => t.bucket === 'underperforming').length
  };
  const totalImpressions = postedTweets.reduce((sum, t) => sum + (t.impressions || 0), 0);
  const totalLikes = postedTweets.reduce((sum, t) => sum + (t.likes || 0), 0);
  const totalRetweets = postedTweets.reduce((sum, t) => sum + (t.retweets || 0), 0);
  const averageEngagementRate = postedTweets.length > 0 
    ? postedTweets.reduce((sum, t) => {
        const rate = (t.impressions || 0) > 0 ? ((t.likes || 0) + (t.retweets || 0)) / (t.impressions || 1) * 100 : 0;
        return sum + rate;
      }, 0) / postedTweets.length
    : 0;
  
  const bestTweet = scored.reduce((best, current) => 
    current.score > best.score ? current : best, scored[0] || { content: 'No tweets yet' });
  const worstTweet = scored.reduce((worst, current) => 
    current.score < worst.score ? current : worst, scored[0] || { content: 'No tweets yet' });
  
  // Calculate engagement trend (simplified)
  const recentTweets = postedTweets.slice(-5);
  const olderTweets = postedTweets.slice(-10, -5);
  const recentAvg = recentTweets.length > 0 
    ? recentTweets.reduce((sum, t) => sum + (t.likes || 0) + (t.retweets || 0), 0) / recentTweets.length 
    : 0;
  const olderAvg = olderTweets.length > 0 
    ? olderTweets.reduce((sum, t) => sum + (t.likes || 0) + (t.retweets || 0), 0) / olderTweets.length 
    : 0;
  
  let engagementTrend: 'up' | 'down' | 'stable' = 'stable';
  if (recentAvg > olderAvg * 1.1) engagementTrend = 'up';
  else if (recentAvg < olderAvg * 0.9) engagementTrend = 'down';
  
  // Extract hashtags
  const allHashtags = tweets.flatMap(t => extractHashtags(t.content));
  const hashtagCounts: { [tag: string]: number } = {};
  allHashtags.forEach(tag => {
    hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
  });
  
  const topHashtags = Object.entries(hashtagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
  
  return {
    counts,
    scored: scored.sort((a, b) => b.score - a.score),
    trends: {
      totalImpressions,
      totalLikes,
      totalRetweets,
      averageEngagementRate: Math.round(averageEngagementRate * 100) / 100,
      bestPerformingTweet: bestTweet.content,
      worstPerformingTweet: worstTweet.content,
      engagementTrend,
      postingFrequency: postedTweets.length
    },
    insights: {
      optimalPostingTimes: getOptimalPostingTimes(tweets),
      topHashtags,
      contentTypes: analyzeContentTypes(tweets),
      performanceByDay: getPerformanceByDay(tweets)
    }
  };
};

export default scoreTweet;


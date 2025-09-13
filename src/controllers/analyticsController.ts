import { Request, Response } from "express";
import Tweet from "../models/Tweet";
import { summarize, AnalyticsSummary } from "../services/analyticsService";

export const getAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const [total, scheduled, posted, drafts] = await Promise.all([
      Tweet.countDocuments({ user: userId }),
      Tweet.countDocuments({ user: userId, status: "scheduled" }),
      Tweet.countDocuments({ user: userId, status: "posted" }),
      Tweet.countDocuments({ user: userId, status: "draft" })
    ]);

    const recent = await Tweet.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(100)
      .populate("user", "name"); 
    
    const performance = summarize(recent);

    const analyticsData = {
      total,
      scheduled,
      posted,
      drafts,
      performance
    };

    return res.json({ 
      success: true, 
      data: analyticsData, 
      message: "Analytics fetched successfully" 
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ 
      success: false, 
      data: null, 
      message: "Server error while fetching analytics" 
    });
  }
};

export const getTrendingTopics = async (req: any, res: Response) => {
  try {
    // Mock trending topics - in a real app, this would integrate with Twitter API
    const trendingTopics = [
      { name: "AI Technology", volume: 125000, category: "Technology" },
      { name: "Remote Work", volume: 89000, category: "Business" },
      { name: "Sustainability", volume: 76000, category: "Environment" },
      { name: "Digital Marketing", volume: 65000, category: "Marketing" },
      { name: "Mental Health", volume: 54000, category: "Health" },
      { name: "Cryptocurrency", volume: 48000, category: "Finance" },
      { name: "Climate Change", volume: 42000, category: "Environment" },
      { name: "Startup Life", volume: 38000, category: "Business" }
    ];

    return res.json({
      success: true,
      data: { topics: trendingTopics },
      message: "Trending topics fetched"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error while fetching trending topics"
    });
  }
};

export const getHashtagSuggestions = async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Content is required"
      });
    }

    // Extract keywords from content
    const keywords = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    // Generate hashtag suggestions based on keywords
    const generatedHashtags = keywords.map(keyword => `#${keyword}`);
    
    // Add some trending hashtags (mock data)
    const trendingHashtags = [
      '#productivity', '#motivation', '#success', '#inspiration', 
      '#leadership', '#innovation', '#technology', '#business',
      '#startup', '#entrepreneur', '#growth', '#mindset'
    ];
    
    const allSuggestions = [...generatedHashtags, ...trendingHashtags]
      .filter((hashtag, index, arr) => arr.indexOf(hashtag) === index)
      .slice(0, 10);

    return res.json({
      success: true,
      data: { hashtags: allSuggestions },
      message: "Hashtag suggestions generated"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error while generating hashtag suggestions"
    });
  }
};

export default getAnalytics;


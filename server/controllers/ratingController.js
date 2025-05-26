import Rating from '../models/Rating.js';
import User from '../models/User.js';

// GET /api/ratings/distribution
export const getCSATDistribution = async (req, res) => {
  try {
    const allRatings = await Rating.find({});

    const scoreCounts = [0, 0, 0, 0, 0];
    allRatings.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        scoreCounts[r.rating - 1]++;
      }
    });

    const total = scoreCounts.reduce((a, b) => a + b, 0);
    const weightedSum = scoreCounts.reduce((sum, count, i) => sum + count * (i + 1), 0);
    const average = total > 0 ? (weightedSum / total).toFixed(1) : 0;

    const distribution = [5, 4, 3, 2, 1].map(score => ({
      score,
      count: scoreCounts[score - 1],
    }));

    res.status(200).json({
      success: true,
      average,
      totalResponses: total,
      distribution
    });
  } catch (err) {
    console.error('CSAT fetch error:', err);
    res.status(500).json({ error: 'Failed to load rating data' });
  }
};

// GET /api/ratings/recent
export const getRecentFeedback = async (req, res) => {
  try {
    const feedback = await Rating.find({ feedback: { $ne: "" } })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(3);

    const formatted = feedback.map(entry => ({
      name: entry.user?.name || "Anonymous",
      time: entry.createdAt,
      satisfaction:
        entry.rating >= 5 ? "Very Satisfied" :
        entry.rating >= 3 ? "Satisfied" :
        "Unsatisfied",
      message: entry.feedback
    }));

    res.status(200).json({
      success: true,
      feedback: formatted
    });
  } catch (error) {
    console.error("Feedback fetch error:", error);
    res.status(500).json({ error: "Failed to load feedback" });
  }
};
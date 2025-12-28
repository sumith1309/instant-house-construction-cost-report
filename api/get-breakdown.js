const { verifyToken } = require('../lib/jwt');
const { getBreakdown, getTimeline } = require('../lib/constants');

// Vercel Serverless Function
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.verified) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Extract data from verified token
    const { area, minCost, maxCost } = decoded;

    // Generate breakdown (server-side only)
    const breakdown = getBreakdown(minCost, maxCost);
    const timeline = getTimeline(area);

    return res.status(200).json({
      success: true,
      data: {
        breakdown,
        timeline,
        minCost,
        maxCost,
        area
      }
    });

  } catch (error) {
    console.error('Breakdown fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch breakdown' });
  }
};

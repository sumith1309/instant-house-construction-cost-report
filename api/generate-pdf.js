const { verifyToken } = require('../lib/jwt');
const { getBreakdown, getTimeline } = require('../lib/constants');

// Note: For production, consider using a server-side PDF library like PDFKit or Puppeteer
// This endpoint returns data for client-side PDF generation with jsPDF
// In a more secure setup, generate PDF server-side and return binary

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
    const { area, specification, location, floors, minCost, maxCost } = decoded;

    // Generate breakdown and timeline
    const breakdown = getBreakdown(minCost, maxCost);
    const timeline = getTimeline(area);

    // Return all data needed for PDF generation
    return res.status(200).json({
      success: true,
      pdfData: {
        area,
        specification,
        location,
        floors,
        minCost,
        maxCost,
        breakdown,
        timeline,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF data' });
  }
};

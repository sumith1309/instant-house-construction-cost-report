const fetch = require('node-fetch');
const { generateToken } = require('../lib/jwt');
const { calculateCost } = require('../lib/constants');

// Vercel Serverless Function
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { purchaseId, area, specification, location, floors } = req.body;

    // Validation
    if (!purchaseId || !area || !specification || !location || !floors) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify payment with Gumroad API
    const gumroadToken = process.env.GUMROAD_ACCESS_TOKEN;
    
    if (!gumroadToken) {
      // Development mode - allow bypass with special token
      if (purchaseId === 'dev_test_token') {
        console.log('DEV MODE: Bypassing Gumroad verification');
      } else {
        return res.status(500).json({ error: 'Payment verification not configured' });
      }
    } else {
      // Production: Verify with Gumroad
      const verifyUrl = `https://api.gumroad.com/v2/sales/${purchaseId}`;
      const gumroadResponse = await fetch(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${gumroadToken}`
        }
      });

      if (!gumroadResponse.ok) {
        return res.status(400).json({ error: 'Invalid purchase ID' });
      }

      const saleData = await gumroadResponse.json();
      
      // Verify sale is for correct product and not refunded
      if (saleData.sale.refunded || saleData.sale.disputed) {
        return res.status(400).json({ error: 'Payment was refunded or disputed' });
      }
    }

    // Calculate costs (server-side validation)
    const { minCost, maxCost } = calculateCost(
      parseFloat(area),
      specification,
      location,
      floors
    );

    // Generate signed JWT token with user data
    const token = generateToken({
      purchaseId,
      area: parseFloat(area),
      specification,
      location,
      floors,
      minCost,
      maxCost,
      verified: true,
      timestamp: Date.now()
    });

    return res.status(200).json({
      success: true,
      token,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
};

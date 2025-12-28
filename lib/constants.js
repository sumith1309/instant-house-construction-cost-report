// SERVER-SIDE ONLY - Never expose to frontend
// This file contains the actual cost calculation logic

const COST_CONFIG = {
  basic: { min: 1600, max: 1900 },
  standard: { min: 2000, max: 2400 },
  premium: { min: 2600, max: 3200 }
};

const LOCATION_FACTORS = {
  low: 0.95,
  medium: 1.00,
  high: 1.10
};

const FLOOR_FACTORS = {
  g0: 1.00,
  g1: 1.08,
  g2: 1.15
};

const BREAKDOWN_PERCENTAGES = [
  { component: 'Foundation & Structure', percentage: 35 },
  { component: 'Masonry & Plastering', percentage: 20 },
  { component: 'Flooring & Finishing', percentage: 20 },
  { component: 'Electrical', percentage: 10 },
  { component: 'Plumbing', percentage: 8 },
  { component: 'Miscellaneous', percentage: 7 }
];

function calculateCost(area, specification, location, floors) {
  // Validation
  if (!area || area < 100 || area > 100000) {
    throw new Error('Invalid area');
  }
  if (!COST_CONFIG[specification]) {
    throw new Error('Invalid specification');
  }
  if (!LOCATION_FACTORS[location]) {
    throw new Error('Invalid location');
  }
  if (!FLOOR_FACTORS[floors]) {
    throw new Error('Invalid floors');
  }

  const baseCost = COST_CONFIG[specification];
  const locationFactor = LOCATION_FACTORS[location];
  const floorFactor = FLOOR_FACTORS[floors];

  const minCost = Math.round(area * baseCost.min * locationFactor * floorFactor);
  const maxCost = Math.round(area * baseCost.max * locationFactor * floorFactor);

  return { minCost, maxCost };
}

function getBreakdown(minCost, maxCost) {
  return BREAKDOWN_PERCENTAGES.map(item => {
    const minAmount = Math.round(minCost * item.percentage / 100);
    const maxAmount = Math.round(maxCost * item.percentage / 100);
    return {
      component: item.component,
      percentage: item.percentage,
      minAmount,
      maxAmount
    };
  });
}

function getTimeline(area) {
  return area <= 1500 ? '6-8 months' : '8-12 months';
}

module.exports = {
  calculateCost,
  getBreakdown,
  getTimeline,
  COST_CONFIG,
  LOCATION_FACTORS,
  FLOOR_FACTORS
};

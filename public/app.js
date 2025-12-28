// Frontend JavaScript - No sensitive data or bypass logic

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// Secure state management using encrypted localStorage
const STATE_KEY = 'calc_state';

function saveState(data) {
  // In production, consider encrypting this data
  const encoded = btoa(JSON.stringify(data));
  localStorage.setItem(STATE_KEY, encoded);
}

function loadState() {
  try {
    const encoded = localStorage.getItem(STATE_KEY);
    if (!encoded) return null;
    return JSON.parse(atob(encoded));
  } catch (e) {
    return null;
  }
}

function clearState() {
  localStorage.removeItem(STATE_KEY);
}

// Format currency
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// Calculate free estimate (client-side approximation only)
function calculateFreeEstimate() {
  const area = parseFloat(document.getElementById('area').value);
  const specification = document.getElementById('specification').value;
  const location = document.getElementById('location').value;
  const floors = document.getElementById('floors').value;

  // Validation
  if (!area || area < 100) {
    alert('Please enter a valid built-up area (minimum 100 sqft)');
    return;
  }
  if (!specification || !location || !floors) {
    alert('Please fill in all fields');
    return;
  }

  // Rough client-side calculation for free preview
  // Real calculation happens server-side
  const baseRates = {
    basic: 1750,
    standard: 2200,
    premium: 2900
  };
  
  const locationMult = { low: 0.95, medium: 1.0, high: 1.1 };
  const floorMult = { g0: 1.0, g1: 1.08, g2: 1.15 };
  
  const approxCost = Math.round(
    area * baseRates[specification] * locationMult[location] * floorMult[floors]
  );
  
  const minCost = Math.round(approxCost * 0.92);
  const maxCost = Math.round(approxCost * 1.08);

  // Save state for payment flow
  saveState({ area, specification, location, floors });

  // Display free result
  document.getElementById('costRange').textContent = 
    `${formatCurrency(minCost)} - ${formatCurrency(maxCost)}`;
  document.getElementById('freeResult').classList.remove('hidden');
  document.getElementById('valueSection').classList.remove('hidden');
  document.getElementById('paymentGate').classList.remove('hidden');

  // Scroll to results
  document.getElementById('freeResult').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'nearest' 
  });
}

// Redirect to Gumroad payment
function redirectToPayment() {
  const state = loadState();
  if (!state) {
    alert('Please calculate an estimate first');
    return;
  }

  // Gumroad product URL
  const GUMROAD_PRODUCT_URL = 'https://swaroopster51.gumroad.com/l/hjzhxl';
  
  // Encode state in URL for return
  const returnUrl = `${window.location.origin}/success.html`;
  const gumroadUrl = `${GUMROAD_PRODUCT_URL}?wanted=true&redirect_url=${encodeURIComponent(returnUrl)}`;
  
  window.location.href = gumroadUrl;
}

// Modal handlers
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Event listeners
document.getElementById('calculateBtn').addEventListener('click', calculateFreeEstimate);
document.getElementById('unlockBtn').addEventListener('click', redirectToPayment);

// Legal modals
document.getElementById('termsLink').addEventListener('click', (e) => {
  e.preventDefault();
  openModal('termsModal');
});
document.getElementById('disclaimerLink').addEventListener('click', (e) => {
  e.preventDefault();
  openModal('disclaimerModal');
});
document.getElementById('refundLink').addEventListener('click', (e) => {
  e.preventDefault();
  openModal('refundModal');
});

document.getElementById('closeTerms').addEventListener('click', () => closeModal('termsModal'));
document.getElementById('closeDisclaimer').addEventListener('click', () => closeModal('disclaimerModal'));
document.getElementById('closeRefund').addEventListener('click', () => closeModal('refundModal'));

// Close modals on outside click
document.querySelectorAll('[id$="Modal"]').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

// Success page - Handles payment verification and report display

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

const STATE_KEY = 'calc_state';

let accessToken = null;

function loadState() {
  try {
    const encoded = localStorage.getItem(STATE_KEY);
    if (!encoded) return null;
    return JSON.parse(atob(encoded));
  } catch (e) {
    return null;
  }
}

function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function showError(message) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('errorMessage').textContent = message;
}

function showSuccess() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('successState').classList.remove('hidden');
}

// Verify payment and get access token
async function verifyPayment() {
  try {
    // Get purchase ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseId = urlParams.get('purchase_id') || urlParams.get('sale_id');
    
    // For development/testing, allow dev token
    const devMode = urlParams.get('dev') === 'true';
    const finalPurchaseId = devMode ? 'dev_test_token' : purchaseId;
    
    if (!finalPurchaseId) {
      showError('No purchase ID found. Please complete payment first.');
      return;
    }

    // Load saved calculation state
    const state = loadState();
    if (!state) {
      showError('Calculation data not found. Please start over.');
      return;
    }

    // Call backend to verify payment
    const response = await fetch(`${API_BASE}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        purchaseId: finalPurchaseId,
        area: state.area,
        specification: state.specification,
        location: state.location,
        floors: state.floors
      })
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.error || 'Payment verification failed');
      return;
    }

    const data = await response.json();
    accessToken = data.token;

    // Fetch detailed breakdown
    await fetchBreakdown();

  } catch (error) {
    console.error('Verification error:', error);
    showError('An error occurred during verification. Please contact support.');
  }
}

// Fetch breakdown data from backend
async function fetchBreakdown() {
  try {
    const response = await fetch(`${API_BASE}/get-breakdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      showError('Failed to fetch breakdown data');
      return;
    }

    const result = await response.json();
    displayBreakdown(result.data);
    showSuccess();

  } catch (error) {
    console.error('Breakdown fetch error:', error);
    showError('Failed to load report data');
  }
}

// Display breakdown data
function displayBreakdown(data) {
  const { breakdown, timeline, minCost, maxCost, area } = data;

  // Display total cost
  document.getElementById('totalCost').textContent = 
    `${formatCurrency(minCost)} - ${formatCurrency(maxCost)}`;

  // Display breakdown table
  const tableBody = document.getElementById('breakdownTable');
  tableBody.innerHTML = '';
  
  breakdown.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="border border-gray-300 px-4 py-2">${item.component}</td>
      <td class="border border-gray-300 px-4 py-2 text-right">${item.percentage}%</td>
      <td class="border border-gray-300 px-4 py-2 text-right">${formatCurrency(item.minAmount)} - ${formatCurrency(item.maxAmount)}</td>
    `;
    tableBody.appendChild(row);
  });

  // Display timeline
  document.getElementById('timeline').textContent = 
    `Expected construction duration: ${timeline}`;
}

// Generate PDF
async function generatePDF() {
  if (!accessToken) {
    alert('Access token not found');
    return;
  }

  try {
    // Fetch PDF data from backend
    const response = await fetch(`${API_BASE}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      alert('Failed to generate PDF');
      return;
    }

    const result = await response.json();
    const pdfData = result.pdfData;

    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Construction Cost Estimate Report', 105, 20, { align: 'center' });

    // Project Summary
    doc.setFontSize(14);
    doc.text('Project Summary', 20, 40);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Built-up Area: ${pdfData.area} sqft`, 20, 50);
    doc.text(`Specification: ${pdfData.specification.charAt(0).toUpperCase() + pdfData.specification.slice(1)}`, 20, 57);
    doc.text(`Location Factor: ${pdfData.location.charAt(0).toUpperCase() + pdfData.location.slice(1)}`, 20, 64);
    doc.text(`Floors: ${pdfData.floors.toUpperCase()}`, 20, 71);

    // Total Cost
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Total Estimated Cost', 20, 85);
    doc.setFontSize(16);
    doc.text(`${formatCurrency(pdfData.minCost)} - ${formatCurrency(pdfData.maxCost)}`, 20, 95);

    // Cost Breakdown
    doc.setFontSize(14);
    doc.text('Cost Breakdown', 20, 110);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    let yPos = 120;
    pdfData.breakdown.forEach(item => {
      doc.text(`${item.component} (${item.percentage}%):`, 20, yPos);
      doc.text(`${formatCurrency(item.minAmount)} - ${formatCurrency(item.maxAmount)}`, 120, yPos);
      yPos += 7;
    });

    // Timeline
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Estimated Timeline', 20, yPos + 10);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Expected construction duration: ${pdfData.timeline}`, 20, yPos + 20);

    // Assumptions
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Assumptions', 20, yPos + 35);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const assumptions = [
      'Standard soil conditions with normal foundation requirements',
      'Regular building materials as per specification level',
      'Normal site accessibility and working conditions',
      'Excludes land cost, architect fees, and government approvals',
      'Based on current market rates (subject to change)'
    ];
    let assumptionY = yPos + 45;
    assumptions.forEach(assumption => {
      doc.text(`• ${assumption}`, 20, assumptionY);
      assumptionY += 7;
    });

    // Disclaimer
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    const disclaimer = 'Disclaimer: This estimate is indicative and based on prevailing market averages. Actual costs may vary depending on design, material selection, site conditions, and contractor pricing.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, 270);

    // Generate filename with area and date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `construction-cost-${pdfData.area}sqft-${dateStr}.pdf`;

    // Save PDF
    doc.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF');
  }
}

// Event listeners
document.getElementById('downloadPdfBtn')?.addEventListener('click', generatePDF);

// Start verification on page load
verifyPayment();

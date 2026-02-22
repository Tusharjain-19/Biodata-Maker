// ── SUPPORT PAGE LOGIC ──
// Handles UPI QR code generation and amount selection

const UPI_VPA   = 'buychaifortushar@ibl';
const UPI_NAME  = 'Tushar Jain';

let currentAmount = 21;     // default
let customDebounce = null;  // debounce timer for custom input

// ── Generate & display QR for given amount ──
function updateQR(amount) {
  currentAmount = amount;

  const qrImg     = document.getElementById('upiQR');
  const spinner   = document.getElementById('qrSpinner');
  const amountTxt = document.getElementById('amountText');

  // Update displayed amount
  if (amountTxt) amountTxt.textContent = `₹${amount}`;

  // Show loading state
  qrImg.classList.add('loading');
  spinner.classList.add('visible');

  // Build UPI deep-link
  const upiUrl = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`;
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  // Preload then swap
  const tempImg = new Image();
  tempImg.onload = () => {
    qrImg.src = qrUrl;
    qrImg.classList.remove('loading');
    spinner.classList.remove('visible');
  };
  tempImg.onerror = () => {
    // fallback: just show QR directly (service might have CORS issues with preload)
    qrImg.src = qrUrl;
    qrImg.classList.remove('loading');
    spinner.classList.remove('visible');
  };
  tempImg.src = qrUrl;
}

// ── Select a preset chai button ──
function selectChai(amount, clickedBtn) {
  // Clear custom input when a preset is clicked
  const customInput = document.getElementById('customAmountInput');
  if (customInput) customInput.value = '';

  // Remove active from all preset buttons
  document.querySelectorAll('.chai-btn').forEach(b => b.classList.remove('active'));

  // Activate clicked button
  if (clickedBtn) clickedBtn.classList.add('active');

  updateQR(amount);
}

// ── Handle live custom amount input ──
function handleCustomAmount(value) {
  const amount = parseInt(value);

  // Remove active states from preset buttons when user types
  document.querySelectorAll('.chai-btn').forEach(b => b.classList.remove('active'));

  // Debounce QR regeneration for 600ms after typing stops
  clearTimeout(customDebounce);
  if (amount && amount > 0) {
    customDebounce = setTimeout(() => updateQR(amount), 600);
  }
}

// ── Initialise page ──
function init() {
  // Check if there's an amount in the URL (?amount=X) passed from editor
  const params = new URLSearchParams(window.location.search);
  const urlAmount = parseInt(params.get('amount'));
  const startAmount = (urlAmount && urlAmount > 0) ? urlAmount : 21;

  // Activate the matching preset button (if any)
  const presetBtn = document.getElementById(`btn-${startAmount}`);
  if (presetBtn) {
    document.querySelectorAll('.chai-btn').forEach(b => b.classList.remove('active'));
    presetBtn.classList.add('active');
  }

  updateQR(startAmount);
}

// Run on load
init();

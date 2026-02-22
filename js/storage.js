// ════════════════════════════════════════════
// STORAGE.JS — All save/load/clear logic
// ════════════════════════════════════════════

const STORAGE_KEY = 'biodatamaker_v3';

// ── DEFAULT STATE ──
const DEFAULT_STATE = {
  formData: {
    community: '',
    fullName: '', dob: '', timeOfBirth: '', placeOfBirth: '',
    height: '', complexion: '', bloodGroup: '',
    maritalStatus: 'Never Married',
    differentlyAbled: 'No', differentlyAbledDesc: '',
    manglik: '', diet: '', smokingDrinking: 'No',
    qualification: '', additionalDegrees: '',
    profession: '', employer: '', annualIncome: '', workingCity: '',
    assets: [],
    fatherName: '', fatherOccupation: '',
    motherName: '', motherOccupation: '',
    nativePlace: '', gotra: '', subCaste: '',
    brothers: '', sisters: '',
    familyType: 'Nuclear', familyValues: 'Moderate',
    familyStatus: '', maternalUncle: '',
    rashi: '', nakshatra: '', gan: '', nadi: '', charan: '',
    partnerAgeMin: '24', partnerAgeMax: '30',
    partnerQualification: '', partnerProfession: '',
    locationPreference: '', otherExpectations: '',
    contactPerson: '', contactNumber: '', contactEmail: '', whatsappNumber: '',
    familyConsent: true,
    communityGreeting: true,
    customGreeting: '',
    customTitle: '',
  },
  profilePhoto: null,
  familyPhoto: null,
  showFamilyPhoto: false,
  selectedTemplate: 'balanced',
  selectedTheme: 'royalMaroon',
  customTheme: null,
  sectionOrder: ['header','personal','education','family','horoscope','expectations','contact','familyPhoto'],
  hiddenSections: [],
  hiddenFields: [],
  lastSaved: null,
};

// ── SAVE ──
let saveTimer = null;
function scheduleSave(state, delay = 1000) {
  clearTimeout(saveTimer);
  showSavingBadge();
  saveTimer = setTimeout(() => saveNow(state), delay);
}

function saveNow(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastSaved: new Date().toISOString()
    }));
    showSaveBadge();
  } catch(e) {
    console.warn('Save failed (storage full?):', e);
  }
}

// ── LOAD ──
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) {
    return null;
  }
}

// ── CLEAR ──
function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── ENCODE/DECODE for shareable URL ──
function encodeStateToURL(state) {
  const minimal = {
    f: state.formData,
    t: state.selectedTemplate,
    th: state.selectedTheme,
    so: state.sectionOrder,
    hs: state.hiddenSections,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(minimal))));
}

function decodeStateFromURL(hash) {
  try {
    const encoded = hash.replace('#data=', '');
    const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    return {
      formData: decoded.f || DEFAULT_STATE.formData,
      selectedTemplate: decoded.t || 'balanced',
      selectedTheme: decoded.th || 'royalMaroon',
      sectionOrder: decoded.so || DEFAULT_STATE.sectionOrder,
      hiddenSections: decoded.hs || [],
    };
  } catch(e) {
    return null;
  }
}

// ── UI HELPERS ──
function showSavingBadge() {
  const badge = document.querySelector('.save-badge');
  if (!badge) return;
  badge.textContent = 'Saving...';
  badge.classList.add('show');
  badge.style.opacity = '0.7';
}

function showSaveBadge() {
  const badge = document.querySelector('.save-badge');
  if (!badge) return;
  badge.textContent = '✓ Saved';
  badge.classList.add('show');
  badge.style.opacity = '1';
  setTimeout(() => badge.classList.remove('show'), 2000);
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── TIME AGO ──
function timeAgo(isoString) {
  if (!isoString) return 'never';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs>1?'s':''} ago`;
  return new Date(isoString).toLocaleDateString('en-IN');
}

// ── CALCULATE AGE ──
function calculateAge(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d)) return '';
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  if (today.getMonth() < d.getMonth() || 
      (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
  return age;
}

// ── THEMES OBJECT ──
const THEMES = {
  royalMaroon:  { name:'Royal Maroon',   primary:'#7B1C1C', accent:'#C9962C', background:'#FDF8F0', text:'#1A1A1A', border:'#C9962C', headerBg:'#7B1C1C', headerText:'#FFFFFF' },
  saffronGold:  { name:'Saffron & Gold', primary:'#C84B00', accent:'#F5A623', background:'#FFFBF0', text:'#1C1C1C', border:'#E07B00', headerBg:'#C84B00', headerText:'#FFFFFF' },
  deepNavy:     { name:'Deep Navy',      primary:'#1B2A4A', accent:'#4A90D9', background:'#F8FAFF', text:'#0D1B2A', border:'#4A90D9', headerBg:'#1B2A4A', headerText:'#FFFFFF' },
  emeraldGold:  { name:'Emerald & Gold', primary:'#1B5E20', accent:'#C9962C', background:'#F5FBF5', text:'#1A1A1A', border:'#C9962C', headerBg:'#1B5E20', headerText:'#FFFFFF' },
  rosePetal:    { name:'Rose Petal',     primary:'#8B1A4A', accent:'#D4547A', background:'#FFF5F8', text:'#1A1A1A', border:'#D4547A', headerBg:'#8B1A4A', headerText:'#FFFFFF' },
  peacockBlue:  { name:'Peacock Blue',   primary:'#005F56', accent:'#00B4A0', background:'#F0FFFE', text:'#0D1B18', border:'#00B4A0', headerBg:'#005F56', headerText:'#FFFFFF' },
  blackGold:    { name:'Black & Gold',   primary:'#0D0D0D', accent:'#B8860B', background:'#FFFFF0', text:'#0D0D0D', border:'#B8860B', headerBg:'#0D0D0D', headerText:'#C9962C' },
  lavender:     { name:'Lavender Mist',  primary:'#4A3570', accent:'#9B72CF', background:'#FAF7FF', text:'#1A1A1A', border:'#9B72CF', headerBg:'#4A3570', headerText:'#FFFFFF' },
  ivoryRust:    { name:'Ivory & Rust',   primary:'#8B3A2A', accent:'#D4956A', background:'#FFF9F5', text:'#2C1810', border:'#D4956A', headerBg:'#8B3A2A', headerText:'#FFFFFF' },
  pureClassic:  { name:'Pure Classic',   primary:'#000000', accent:'#333333', background:'#FFFFFF', text:'#000000', border:'#000000', headerBg:'#000000', headerText:'#FFFFFF' },
};

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula',
  'Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

const RASHIS = [
  'Mesh (Aries)','Vrishabha (Taurus)','Mithuna (Gemini)','Karka (Cancer)',
  'Simha (Leo)','Kanya (Virgo)','Tula (Libra)','Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)','Makara (Capricorn)','Kumbha (Aquarius)','Meena (Pisces)'
];

const COMMUNITY_GREETINGS = {
  hindu:  '|| Shree Ganeshay Namah ||',
  jain:   '|| Jai Jinendra ||',
  muslim: 'Bismillah ir-Rahman ir-Rahim',
  sikh:   'ੴ Waheguru Mehar Kare',
  christian: '✝ Praise The Lord',
  other:  '',
};

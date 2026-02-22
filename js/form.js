// ════════════════════════════════════════════
// FORM.JS — All form step logic
// ════════════════════════════════════════════

const TOTAL_STEPS = 7;
let currentStep = 1;
let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));

// On load: check for URL hash data
if (window.location.hash.startsWith('#data=')) {
  const urlState = decodeStateFromURL(window.location.hash);
  if (urlState) { Object.assign(state, urlState); }
}

// ── STEP DEFINITIONS ──
const STEPS = [
  { num: 1, label: 'Community' },
  { num: 2, label: 'Personal' },
  { num: 3, label: 'Career' },
  { num: 4, label: 'Family' },
  { num: 5, label: 'Horoscope' },
  { num: 6, label: 'Photos' },
  { num: 7, label: 'Contact' },
];

// ── RENDER PROGRESS ──
function renderProgress() {
  const pb = document.getElementById('progressBar');
  if (!pb) return;
  pb.innerHTML = STEPS.map((s, i) => `
    <div class="progress-step">
      <div class="step-dot ${currentStep > s.num ? 'done' : currentStep === s.num ? 'active' : ''}">
        ${currentStep > s.num ? '' : s.num}
      </div>
      <div class="step-label ${currentStep === s.num ? 'active' : ''}">${s.label}</div>
    </div>
    ${i < STEPS.length - 1 ? `<div class="step-line ${currentStep > s.num ? 'done' : ''}"></div>` : ''}
  `).join('');
}

// ── HEIGHT OPTIONS ──
const heights = [];
for (let ft = 4; ft <= 6; ft++) {
  for (let inch = 0; inch < 12; inch++) {
    if (ft === 6 && inch > 4) break;
    heights.push(`${ft}'${inch}"`);
  }
}

// ── RENDER STEP ──
function renderStep() {
  renderProgress();
  const container = document.getElementById('stepContainer');
  if (!container) return;
  const fd = state.formData;

  let html = '';

  if (currentStep === 1) {
    html = `
      <div class="form-card">
        <h2>Which community?</h2>
        <p class="step-subtitle">This helps us show the right fields. You can change this later.</p>
        <div class="community-grid">
          ${[
            { val:'hindu',     img:'assets/images/hindu.png',       name:'Hindu' },
            { val:'jain',      img:'assets/images/jainism.png',     name:'Jain' },
            { val:'muslim',    img:'assets/images/muslim.png',      name:'Muslim' },
            { val:'sikh',      img:'assets/images/sikh-symbol.png', name:'Sikh' },
            { val:'christian', img:'assets/images/cross.png',       name:'Christian' },
            { val:'other',     icon:'🌟', name:'Other' },
          ].map(c => `
            <input type="radio" name="community" value="${c.val}" id="comm_${c.val}" class="community-option"
              ${fd.community === c.val ? 'checked' : ''}>
            <label for="comm_${c.val}" class="community-card">
              <div class="card-icon">
                ${c.img ? `<img src="${c.img}" alt="${c.name}" style="height:40px; width:auto; margin:0 auto;">` : c.icon}
              </div>
              <div class="card-name">${c.name}</div>
            </label>
          `).join('')}
        </div>
        <p style="font-size:13px;color:var(--app-text-muted);margin-top:8px;">
          ℹ️ Fields like Gotra and Manglik show only when relevant to your community.
        </p>
        ${formFooter(false)}
      </div>`;
  }

  else if (currentStep === 2) {
    html = `
      <div class="form-card">
        <h2>Personal Details</h2>
        <p class="step-subtitle">About the candidate. All fields except Full Name are optional.</p>
        ${floatingInput('fullName', 'Full Name *', 'e.g. Priya Sharma', 'text', true)}
        <div class="field-grid-2">
          ${floatingInput('dob', 'Date of Birth', '', 'date')}
          ${floatingInput('placeOfBirth', 'Place of Birth', 'e.g. Pune, Maharashtra', 'text')}
        </div>
        <div class="field-grid-2">
          ${floatingSelect('height', 'Height', heights)}
          ${floatingSelect('complexion', 'Complexion', ['Fair','Wheatish','Wheatish Brown','Dark'])}
        </div>
        <div class="field-grid-2">
          ${floatingSelect('bloodGroup', 'Blood Group', ['A+','A-','B+','B-','O+','O-','AB+','AB-'])}
          ${floatingSelect('maritalStatus', 'Marital Status', ['Never Married','Divorced','Widowed'])}
        </div>
        <div class="pill-group-label">Diet</div>
        ${pillRadio('diet', ['Vegetarian','Non-Vegetarian','Eggetarian','Vegan','Jain Vegetarian'])}
        <div class="pill-group-label">Smoking / Drinking</div>
        ${pillRadio('smokingDrinking', ['No','Occasionally','Yes'])}
        ${(fd.community === 'hindu' || fd.community === 'jain') ? `
          <div class="pill-group-label">Manglik Status</div>
          ${pillRadio('manglik', ['No','Yes','Partial Manglik','Don\'t Know'])}
          ${floatingInput('timeOfBirth', 'Time of Birth (for kundali)', 'e.g. 6:30 AM', 'text')}
        ` : ''}
        <div class="pill-group-label">Differently Abled?</div>
        ${pillRadio('differentlyAbled', ['No','Yes'])}
        ${fd.differentlyAbled === 'Yes' ? floatingInput('differentlyAbledDesc', 'Please describe briefly', '', 'text') : ''}
        ${formFooter(true)}
      </div>`;
  }

  else if (currentStep === 3) {
    html = `
      <div class="form-card">
        <h2>Education & Career</h2>
        <p class="step-subtitle">Professional background of the candidate.</p>
        ${floatingInput('qualification', 'Highest Qualification', 'e.g. B.Tech in CS, IIT Delhi', 'text')}
        ${floatingInput('additionalDegrees', 'Additional Degrees (optional)', 'e.g. MBA from IIM', 'text')}
        ${floatingInput('profession', 'Profession / Job Title', 'e.g. Software Engineer', 'text')}
        <div class="field-grid-2">
          ${floatingInput('employer', 'Employer / Company', 'e.g. Infosys, Bangalore', 'text')}
          ${floatingInput('workingCity', 'Working City', 'e.g. Bangalore', 'text')}
        </div>
        ${floatingSelect('annualIncome', 'Annual Income (approx)', [
          'Prefer not to say','Below ₹3 LPA','₹3–5 LPA','₹5–8 LPA',
          '₹8–12 LPA','₹12–18 LPA','₹18–25 LPA','₹25–40 LPA','₹40 LPA+'
        ])}
        <div class="pill-group-label">Assets Owned</div>
        <div class="asset-grid">
          ${['Own House','Car','Two-Wheeler'].map(a => `
            <input type="checkbox" id="asset_${a}" class="asset-check" value="${a}"
              ${(fd.assets||[]).includes(a) ? 'checked' : ''}>
            <label for="asset_${a}" class="asset-label">${a}</label>
          `).join('')}
        </div>
        ${formFooter(true)}
      </div>`;
  }

  else if (currentStep === 4) {
    html = `
      <div class="form-card">
        <h2>Family Details</h2>
        <p class="step-subtitle">Family background. These details matter most to elders.</p>
        <div class="field-grid-2">
          ${floatingInput('fatherName', "Father's Name", 'e.g. Ramesh Kumar Sharma', 'text')}
          ${floatingInput('fatherOccupation', "Father's Occupation", 'e.g. Retired Govt. Officer', 'text')}
        </div>
        <div class="field-grid-2">
          ${floatingInput('motherName', "Mother's Name", 'e.g. Sunita Sharma', 'text')}
          ${floatingInput('motherOccupation', "Mother's Occupation", 'e.g. Homemaker', 'text')}
        </div>
        ${floatingInput('nativePlace', 'Native Place / Hometown', 'e.g. Kanpur, Uttar Pradesh', 'text')}
        <div class="field-grid-2">
          ${floatingInput('brothers', 'Brother(s)', 'e.g. 1 Married, 1 Unmarried', 'text')}
          ${floatingInput('sisters', 'Sister(s)', 'e.g. 1 Married', 'text')}
        </div>
        ${(fd.community === 'hindu' || fd.community === 'jain') ? `
          <div class="field-grid-2">
            ${floatingInput('gotra', 'Gotra', 'e.g. Bharadwaj', 'text')}
            ${floatingInput('subCaste', 'Sub-caste / Sect', 'e.g. Agarwal / Iyengar', 'text')}
          </div>
        ` : floatingInput('subCaste', 'Sub-caste / Sect (optional)', '', 'text')}
        ${floatingSelect('familyStatus', 'Family Status', [
          'Middle Class','Upper Middle Class','Affluent','Business Family','Service Family'
        ])}
        <div class="pill-group-label">Family Type</div>
        ${pillRadio('familyType', ['Nuclear','Joint'])}
        <div class="pill-group-label">Family Values</div>
        ${pillRadio('familyValues', ['Traditional','Moderate','Liberal'])}
        ${floatingInput('maternalUncle', "Mama Ji Details (optional)", 'e.g. Anil Gupta, Advocate, Delhi', 'text')}
        ${formFooter(true)}
      </div>`;
  }

  else if (currentStep === 5) {
    const skip = fd.community === 'muslim' || fd.community === 'sikh';
    if (skip) { currentStep++; renderStep(); return; }
    html = `
      <div class="form-card">
        <h2>Horoscope Details</h2>
        <p class="step-subtitle">For kundali matching. Leave blank if not applicable.</p>
        <div class="field-grid-2">
          ${floatingSelect('rashi', 'Rashi (Zodiac)', RASHIS)}
          ${floatingSelect('nakshatra', 'Nakshatra', NAKSHATRAS)}
        </div>
        <div class="pill-group-label">Gan</div>
        ${pillRadio('gan', ['Dev','Manav','Rakshasa'])}
        <div class="pill-group-label">Nadi</div>
        ${pillRadio('nadi', ['Aadi','Madhya','Antya'])}
        ${floatingInput('charan', 'Charan (optional)', 'e.g. Kasyap', 'text')}
        <p style="margin-top:16px;font-size:13px;color:var(--app-text-muted);">
          💡 Tip: These details help families do kundali matching. You can skip this entire step.
        </p>
        ${formFooter(true)}
      </div>`;
  }

  else if (currentStep === 6) {
    html = `
      <div class="form-card">
        <h2>Add Photos</h2>
        <p class="step-subtitle">Add a profile photo. Family photo is optional.</p>
        <label class="photo-zone ${state.profilePhoto ? 'has-photo' : ''}" id="profilePhotoZone">
          ${state.profilePhoto ? `
            <img src="${state.profilePhoto}" class="photo-preview-circle" id="profilePreview">
            <div style="color:#22C55E;font-weight:600;font-size:14px;">✓ Profile photo added</div>
            <button class="photo-remove-btn" onclick="removePhoto('profile', event)">Remove</button>
          ` : `
            <div class="photo-zone-icon"><img src="assets/images/icon-camera.png" alt="Upload" style="height:50px;"></div>
            <div class="photo-zone-title">Upload Profile Photo</div>
            <div class="photo-zone-sub">Clear face photo works best · JPG, PNG · Max 5MB</div>
          `}
          <input type="file" id="profilePhotoInput" accept="image/jpeg,image/png,image/webp">
        </label>
        <label class="photo-zone ${state.familyPhoto ? 'has-photo' : ''}" id="familyPhotoZone" style="margin-top:0">
          ${state.familyPhoto ? `
            <img src="${state.familyPhoto}" class="photo-preview-rect" id="familyPreview">
            <div style="color:#22C55E;font-weight:600;font-size:14px;">✓ Family photo added</div>
            <button class="photo-remove-btn" onclick="removePhoto('family', event)">Remove</button>
          ` : `
            <div class="photo-zone-icon"><img src="assets/images/icon-camera.png" alt="Upload" style="height:50px;"></div>
            <div class="photo-zone-title">Add Family Photo (Optional)</div>
            <div class="photo-zone-sub">Shown at the bottom of your biodata · Max 5MB</div>
          `}
          <input type="file" id="familyPhotoInput" accept="image/jpeg,image/png,image/webp">
        </label>
        ${formFooter(true)}
      </div>`;
  }

  else if (currentStep === 7) {
    html = `
      <div class="form-card">
        <h2>Expectations & Contact</h2>
        <p class="step-subtitle">Partner preferences and how to reach your family.</p>
        <p style="font-size:13px;font-weight:600;color:var(--app-text-muted);margin-bottom:16px;text-transform:uppercase;letter-spacing:1px;">Partner Expectations</p>
        <div class="field-grid-2">
          ${floatingInput('partnerAgeMin', 'Min Age', 'e.g. 24', 'number')}
          ${floatingInput('partnerAgeMax', 'Max Age', 'e.g. 30', 'number')}
        </div>
        ${floatingInput('partnerQualification', 'Qualification Expected', 'e.g. Graduate or above', 'text')}
        ${floatingInput('partnerProfession', 'Profession (optional)', 'e.g. Open to all', 'text')}
        ${floatingInput('locationPreference', 'Location Preference', 'e.g. Same city preferred, open to relocation', 'text')}
        <div class="field-group">
          <textarea id="field_otherExpectations" maxlength="200" placeholder=" "
            style="padding-top:20px">${fd.otherExpectations || ''}</textarea>
          <label for="field_otherExpectations">Other Expectations (optional)</label>
        </div>
        <div class="char-counter" id="expCounter">${(fd.otherExpectations||'').length}/200</div>
        <p style="font-size:13px;font-weight:600;color:var(--app-text-muted);margin:24px 0 16px;text-transform:uppercase;letter-spacing:1px;">Contact Information</p>
        ${floatingInput('contactPerson', 'Contact Person Name', 'e.g. Ramesh Sharma (Father)', 'text')}
        <div class="field-grid-2">
          ${floatingInput('contactNumber', 'Phone Number', 'e.g. +91 98765 43210', 'tel')}
          ${floatingInput('whatsappNumber', 'WhatsApp Number', 'Same as above or different', 'tel')}
        </div>
        ${floatingInput('contactEmail', 'Email (optional)', 'e.g. family@gmail.com', 'email')}
        <div style="margin-top:24px;display:flex;flex-direction:column;gap:12px;">
          <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-size:14px;">
            <input type="checkbox" id="field_familyConsent" ${fd.familyConsent ? 'checked' : ''}
              style="width:18px;height:18px;accent-color:var(--app-accent)">
            <span>Add "Profile shared with family consent." to biodata</span>
          </label>
          <label style="display:flex;align-items:center;gap:12px;cursor:pointer;font-size:14px;">
            <input type="checkbox" id="field_communityGreeting" ${fd.communityGreeting ? 'checked' : ''}
              style="width:18px;height:18px;accent-color:var(--app-accent)">
            <span>Add community greeting at top (e.g. "Shree Ganeshay Namah")</span>
          </label>
        </div>
        <div class="form-footer" style="margin-top:32px;border-top:1px solid #1E1E1E;padding-top:24px;">
          <button class="btn btn-outline" onclick="goBack()">← Back</button>
          <button class="btn btn-primary" onclick="finishForm()">
            Choose Template →
          </button>
        </div>
      </div>`;
  }

  container.innerHTML = html;
  attachStepListeners();
}

function floatingInput(field, label, placeholder, type = 'text', required = false) {
  const val = state.formData[field] || '';
  return `
    <div class="field-group">
      <input type="${type}" id="field_${field}" value="${val}" placeholder=" "
        ${required ? 'required' : ''}>
      <label for="field_${field}">${label}</label>
    </div>`;
}

function floatingSelect(field, label, options) {
  const val = state.formData[field] || '';
  return `
    <div class="field-group">
      <select id="field_${field}">
        <option value="" disabled ${!val ? 'selected' : ''}>Select...</option>
        ${options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
      <label for="field_${field}" style="top:-8px;left:10px;font-size:11px;color:var(--app-accent)">${label}</label>
    </div>`;
}

function pillRadio(field, options) {
  const val = state.formData[field] || '';
  return `<div class="pill-group">
    ${options.map(o => `
      <input type="radio" name="${field}" id="pill_${field}_${o.replace(/[^a-z0-9]/gi,'_')}"
        value="${o}" class="pill-option" ${val === o ? 'checked' : ''}>
      <label for="pill_${field}_${o.replace(/[^a-z0-9]/gi,'_')}" class="pill-label">${o}</label>
    `).join('')}
  </div>`;
}

function formFooter(showBack) {
  return `
    <div class="form-footer">
      ${showBack ? `<button class="btn btn-outline" onclick="goBack()">← Back</button>` : `<span></span>`}
      <div style="display:flex;align-items:center;gap:16px">
        <span class="step-counter">Step ${currentStep} of ${TOTAL_STEPS}</span>
        <button class="btn btn-primary" onclick="goNext()">
          ${currentStep === TOTAL_STEPS ? 'Finish →' : 'Next →'}
        </button>
      </div>
    </div>`;
}

function attachStepListeners() {
  document.querySelectorAll('input[id^="field_"], select[id^="field_"], textarea[id^="field_"]').forEach(el => {
    el.addEventListener('input', () => {
      const key = el.id.replace('field_', '');
      if (el.type === 'checkbox') state.formData[key] = el.checked;
      else state.formData[key] = el.value;
      if (key === 'otherExpectations') {
        const counter = document.getElementById('expCounter');
        if (counter) counter.textContent = el.value.length + '/200';
      }
      scheduleSave(state);
    });
    el.addEventListener('change', () => {
      const key = el.id.replace('field_', '');
      state.formData[key] = el.type === 'checkbox' ? el.checked : el.value;
      scheduleSave(state);
    });
  });

  document.querySelectorAll('input[type="radio"]').forEach(el => {
    el.addEventListener('change', () => {
      state.formData[el.name] = el.value;
      scheduleSave(state);
      if (el.name === 'community' || el.name === 'differentlyAbled') {
        renderStep();
      }
    });
  });

  document.querySelectorAll('.asset-check').forEach(el => {
    el.addEventListener('change', () => {
      const assets = Array.from(document.querySelectorAll('.asset-check:checked')).map(c => c.value);
      state.formData.assets = assets;
      scheduleSave(state);
    });
  });

  const profileInput = document.getElementById('profilePhotoInput');
  const familyInput = document.getElementById('familyPhotoInput');
  if (profileInput) profileInput.addEventListener('change', e => handlePhotoUpload(e, 'profile'));
  if (familyInput) familyInput.addEventListener('change', e => handlePhotoUpload(e, 'family'));
}

function handlePhotoUpload(event, type) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Photo must be under 5MB', 'error'); return; }
  
  const maxWidth = type === 'profile' ? 600 : 1000;
  compressImage(file, maxWidth, 0.85, (base64) => {
    if (type === 'profile') state.profilePhoto = base64;
    else { state.familyPhoto = base64; state.showFamilyPhoto = true; }
    saveNow(state);
    renderStep();
  });
}

function compressImage(file, maxWidth, quality, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto(type, event) {
  event.preventDefault(); event.stopPropagation();
  if (type === 'profile') state.profilePhoto = null;
  else { state.familyPhoto = null; state.showFamilyPhoto = false; }
  saveNow(state);
  renderStep();
}

function goNext() {
  if (currentStep === 2) {
    const nameEl = document.getElementById('field_fullName');
    if (!nameEl || !nameEl.value.trim()) {
      nameEl.classList.add('error');
      showToast('Please enter the full name', 'error');
      return;
    }
    nameEl.classList.remove('error');
  }
  collectCurrentStepData();
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderStep();
  } else {
    finishForm();
  }
}

function goBack() {
  collectCurrentStepData();
  if (currentStep > 1) {
    currentStep--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderStep();
  }
}

function collectCurrentStepData() {
  document.querySelectorAll('input[id^="field_"], select[id^="field_"], textarea[id^="field_"]').forEach(el => {
    const key = el.id.replace('field_', '');
    if (el.type === 'checkbox') state.formData[key] = el.checked;
    else state.formData[key] = el.value;
  });
  document.querySelectorAll('input[type="radio"]:checked').forEach(el => {
    state.formData[el.name] = el.value;
  });
  const assets = Array.from(document.querySelectorAll('.asset-check:checked')).map(c => c.value);
  if (assets.length > 0) state.formData.assets = assets;
  scheduleSave(state);
}

function finishForm() {
  collectCurrentStepData();
  saveNow(state);
  window.location.href = 'templates.html';
}

renderStep();

const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  const parsed = JSON.parse(saved);
  if (parsed.lastSaved && parsed.formData && parsed.formData.fullName) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#1C1C1C;border:1px solid #2A2A2A;color:#F0EDE8;
      padding:16px 24px;border-radius:14px;z-index:999;font-size:14px;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);display:flex;gap:16px;align-items:center;
    `;
    banner.innerHTML = `
      <span>✓ Draft restored from <strong>${timeAgo(parsed.lastSaved)}</strong></span>
      <button onclick="this.parentElement.remove()" style="background:var(--app-accent);color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;">Continue</button>
      <button onclick="clearState();location.reload();" style="background:none;color:#888;border:none;cursor:pointer;font-size:13px;">Start Fresh</button>
    `;
    document.body.appendChild(banner);
  }
}

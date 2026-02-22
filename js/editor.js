// ════════════════════════════════════════════
// EDITOR.JS — Canva-style logic
// ════════════════════════════════════════════

let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));
let zoomScale = 1.0;

const SECTION_LABELS = {
  header: 'Spiritual Greeting & Title',
  personal: 'Personal Information',
  education: 'Education & Career',
  family: 'Family Background',
  horoscope: 'Horoscope / Kundali',
  expectations: 'Partner Expectations',
  contact: 'Contact Details',
  familyPhoto: 'Family Photo Block'
};

const SECTION_FIELDS = {
  personal: [
    { key: 'fullName', label: 'Full Name' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'timeOfBirth', label: 'Time of Birth' },
    { key: 'placeOfBirth', label: 'Place of Birth' },
    { key: 'height', label: 'Height' },
    { key: 'complexion', label: 'Complexion' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'maritalStatus', label: 'Marital Status' },
    { key: 'differentlyAbled', label: 'Differently Abled' },
    { key: 'differentlyAbledDesc', label: 'Disability Details' },
    { key: 'diet', label: 'Diet (Veg/Non-Veg)' },
    { key: 'smokingDrinking', label: 'Smoke/Drink' },
    { key: 'manglik', label: 'Manglik Status' }
  ],
  education: [
    { key: 'qualification', label: 'Qualification' },
    { key: 'additionalDegrees', label: 'Additional Degrees' },
    { key: 'profession', label: 'Profession' },
    { key: 'employer', label: 'Employer' },
    { key: 'annualIncome', label: 'Annual Income' },
    { key: 'workingCity', label: 'Working City' },
    { key: 'assets', label: 'Assets' }
  ],
  family: [
    { key: 'fatherName', label: "Father's Name" },
    { key: 'fatherOccupation', label: "Father's Occupation" },
    { key: 'motherName', label: "Mother's Name" },
    { key: 'motherOccupation', label: "Mother's Occupation" },
    { key: 'nativePlace', label: 'Native Place' },
    { key: 'brothers', label: 'Brothers' },
    { key: 'sisters', label: 'Sisters' },
    { key: 'gotra', label: 'Gotra' },
    { key: 'subCaste', label: 'Sub-caste' },
    { key: 'familyType', label: 'Family Type' },
    { key: 'familyValues', label: 'Family Values' },
    { key: 'familyStatus', label: 'Family Status' },
    { key: 'maternalUncle', label: 'Maternal Uncle' }
  ],
  horoscope: [
    { key: 'rashi', label: 'Rashi' },
    { key: 'nakshatra', label: 'Nakshatra' },
    { key: 'gan', label: 'Gan' },
    { key: 'nadi', label: 'Nadi' },
    { key: 'charan', label: 'Charan' }
  ],
  expectations: [
    { key: 'partnerAgeMin', label: 'Min Age' },
    { key: 'partnerAgeMax', label: 'Max Age' },
    { key: 'partnerQualification', label: 'Qualification' },
    { key: 'partnerProfession', label: 'Profession' },
    { key: 'locationPreference', label: 'Location Preference' },
    { key: 'otherExpectations', label: 'Other Expectations' }
  ],
  contact: [
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'contactNumber', label: 'Phone Number' },
    { key: 'whatsappNumber', label: 'WhatsApp Number' },
    { key: 'contactEmail', label: 'Email' }
  ]
};

// ── RENDER EDITOR UI ──
function initEditorUI() {
  renderSectionList();
  renderThemeList();
  updateCustomColors();
  updateZoom();
  renderBiodata();
}

function renderSectionList() {
  const list = document.getElementById('dragList');
  if (!list) return;

  list.innerHTML = state.sectionOrder.map(id => {
    const isHidden = state.hiddenSections.includes(id);
    const fields = SECTION_FIELDS[id] || [];
    
    return `
      <div class="section-item-wrapper">
        <div class="section-item ${isHidden ? 'is-hidden' : ''}" data-id="${id}">
          <div class="section-info">
            <span class="drag-handle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </span>
            <span class="section-name" style="${isHidden ? 'text-decoration:line-through; color:var(--app-text-muted);' : ''}">
              ${SECTION_LABELS[id]}
            </span>
          </div>
          <div class="section-actions">
            ${fields.length > 0 ? `
              <button class="expand-btn" onclick="toggleSectionExpand('${id}')" title="Fields Visibility">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            ` : ''}
            <button class="visibility-btn ${isHidden ? 'is-hidden' : ''}" 
                    onclick="toggleVisibility('${id}')" 
                    title="${isHidden ? 'Restore Section' : 'Delete Section'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                ${isHidden ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>' : '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'}
              </svg>
            </button>
          </div>
        </div>
        
        <div class="field-list" id="fields-${id}" style="display:none;">
          ${id === 'personal' ? `
            <div class="field-toggle-item">
              <span class="field-label" style="color:var(--app-accent); font-weight:700;">Profile Photo</span>
              <button class="btn btn-primary btn-sm" style="padding:4px 8px; font-size:10px;" onclick="changeProfilePhoto()">Update</button>
            </div>
          ` : ''}
          ${id === 'familyPhoto' ? `
            <div class="field-toggle-item">
              <span class="field-label" style="color:var(--app-accent); font-weight:700;">Family Photo</span>
              <button class="btn btn-primary btn-sm" style="padding:4px 8px; font-size:10px;" onclick="changeFamilyPhoto()">Update</button>
            </div>
          ` : ''}
          ${fields.map(f => {
            const fHidden = (state.hiddenFields || []).includes(`${id}.${f.key}`);
            return `
              <div class="field-toggle-item ${fHidden ? 'is-hidden' : ''}">
                <span class="field-label" style="${fHidden ? 'text-decoration:line-through; opacity:0.6' : ''}">${f.label}</span>
                <button class="f-visibility-btn" onclick="toggleFieldVisibility('${id}', '${f.key}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${fHidden ? '#B91C1C' : '#15803D'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    ${fHidden ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>' : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'}
                  </svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  new Sortable(list, {
    handle: '.drag-handle',
    animation: 200,
    ghostClass: 'sortable-ghost',
    onEnd: (evt) => {
      const newOrder = Array.from(list.querySelectorAll('.section-item')).map(el => el.getAttribute('data-id'));
      state.sectionOrder = newOrder;
      saveNow(state);
      renderBiodata();
    }
  });
}

function toggleSectionExpand(id) {
  const el = document.getElementById(`fields-${id}`);
  if (el.style.display === 'none') {
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

function toggleFieldVisibility(sectionId, fieldKey) {
  const fullKey = `${sectionId}.${fieldKey}`;
  if (!state.hiddenFields) state.hiddenFields = [];
  
  if (state.hiddenFields.includes(fullKey)) {
    state.hiddenFields = state.hiddenFields.filter(x => x !== fullKey);
  } else {
    state.hiddenFields.push(fullKey);
  }
  saveNow(state);
  renderSectionList();
  // Keep the list expanded
  const el = document.getElementById(`fields-${sectionId}`);
  if (el) el.style.display = 'block';
  renderBiodata();
}

function renderThemeList() {
  const list = document.getElementById('themeList');
  if (!list) return;
  list.innerHTML = Object.entries(THEMES).map(([id, theme]) => `
    <div class="theme-pill ${state.selectedTheme === id ? 'active' : ''}" 
         style="padding:8px;font-size:11px" onclick="selectTheme('${id}')">
      <div class="theme-swatch" style="background:${theme.primary};width:12px;height:12px"></div>
      <span>${theme.name.split(' ')[0]}</span>
    </div>
  `).join('');
}

function updateCustomColors() {
  const theme = state.customTheme || THEMES[state.selectedTheme];
  document.getElementById('primaryColor').value = theme.primary;
  document.getElementById('accentColor').value = theme.accent;
  document.getElementById('headerTextColor').value = theme.headerText;
  document.getElementById('bgColor').value = theme.background;
}

// ── ACTIONS ──
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.toolbar-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';
}

function toggleVisibility(id) {
  if (state.hiddenSections.includes(id)) {
    state.hiddenSections = state.hiddenSections.filter(x => x !== id);
  } else {
    state.hiddenSections.push(id);
  }
  saveNow(state);
  renderSectionList();
  renderBiodata();
}

function selectTheme(id) {
  state.selectedTheme = id;
  state.customTheme = null;
  saveNow(state);
  renderThemeList();
  updateCustomColors();
  renderBiodata();
}

function zoom(delta) {
  zoomScale = Math.max(0.4, Math.min(1.5, zoomScale + delta));
  updateZoom();
}

function updateZoom() {
  const paper = document.getElementById('biodata-paper');
  const level = document.getElementById('zoomLevel');
  paper.style.transform = `scale(${zoomScale})`;
  level.textContent = Math.round(zoomScale * 100) + '%';
}

// ── HELPERS ──
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}-${m}-${y}`;
}

// ── TEMPLATE ENGINE ──
function renderBiodata() {
  const container = document.getElementById('paperContent');
  const paper = document.getElementById('biodata-paper');
  const theme = state.customTheme || THEMES[state.selectedTheme];
  const fd = state.formData;

  // Apply Theme to DOM
  paper.style.backgroundColor = theme.background;
  paper.style.color = theme.text;
  paper.style.setProperty('--primary', theme.primary);
  paper.style.setProperty('--accent', theme.accent);
  paper.style.setProperty('--border', theme.border);

  const sections = state.sectionOrder.filter(id => !state.hiddenSections.includes(id));

  let html = '';

  // Template wrapping based on selectedTemplate
  if (state.selectedTemplate === 'modern_minimal') {
    html = renderModernMinimal(fd, sections, theme);
  } else if (state.selectedTemplate === 'corporate_pro') {
    html = renderCorporate(fd, sections, theme);
  } else {
    // Default / Balanced / Royal / Others
    html = renderStandard(fd, sections, theme);
  }

  container.innerHTML = html;
}

function renderStandard(fd, sections, theme) {
  const greeting = fd.communityGreeting ? (COMMUNITY_GREETINGS[fd.community] || '') : '';
  
  return `
    <div class="std-layout" style="font-family:var(--font-body); padding:20mm; position:relative; min-height:257mm; border:15px double ${theme.border}; margin:5mm;">
      
      ${sections.map(sid => {
        if (sid === 'header') return `
          <header style="text-align:center; margin-bottom:30px;">
            <div class="editable-text" 
                 style="font-family:var(--font-hindi); color:${theme.primary}; font-size:20px; font-weight:700; margin-bottom:10px; outline:none;"
                 contenteditable="true"
                 oninput="updateFieldInline('customGreeting', this.innerText)"
                 title="Click to Edit Greeting">
              ${fd.customGreeting || greeting}
            </div>
            <h1 class="editable-text" 
                style="font-family:var(--font-display); font-size:36px; color:${theme.primary}; text-transform:uppercase; letter-spacing:2px; margin:0; outline:none;"
                contenteditable="true"
                oninput="updateFieldInline('customTitle', this.innerText)"
                title="Click to Edit Title">
              ${fd.customTitle || 'Biodata'}
            </h1>
            <div style="width:60px; height:3px; background:${theme.accent}; margin:10px auto;"></div>
          </header>
        `;
        
        if (sid === 'personal') return `
          <section style="margin-bottom:25px;">
            <div style="display:flex; gap:30px; align-items:flex-start;">
              <div style="flex:1;">
                <h2 style="font-family:var(--font-display); font-size:22px; color:${theme.primary}; border-bottom:1px solid ${theme.accent}; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase;">Personal Information</h2>
                ${renderFieldGroup('personal', [
                  ['Full Name', fd.fullName, true, 'fullName'],
                  ['Date of Birth', `${formatDisplayDate(fd.dob)} ${calculateAge(fd.dob) ? `(${calculateAge(fd.dob)} Yrs)` : ''}`, false, 'dob'],
                  ['Time of Birth', fd.timeOfBirth, false, 'timeOfBirth'],
                  ['Place of Birth', fd.placeOfBirth, false, 'placeOfBirth'],
                  ['Height', fd.height, false, 'height'],
                  ['Complexion', fd.complexion, false, 'complexion'],
                  ['Blood Group', fd.bloodGroup, false, 'bloodGroup'],
                  ['Marital Status', fd.maritalStatus, false, 'maritalStatus'],
                  ['Differently Abled', fd.differentlyAbled === 'Yes' ? `Yes ${fd.differentlyAbledDesc ? `(${fd.differentlyAbledDesc})` : ''}` : 'No', false, 'differentlyAbled'],
                  ['Diet', fd.diet, false, 'diet'],
                  ['Smoke/Drink', fd.smokingDrinking, false, 'smokingDrinking'],
                  ['Manglik', fd.manglik, false, 'manglik']
                ], theme)}
              </div>
              <div style="position:relative; cursor:pointer;" onclick="changeProfilePhoto()" title="Click to Change Photo">
                ${state.profilePhoto ? `
                  <img src="${state.profilePhoto}" style="width:40mm; height:50mm; object-fit:cover; border:4px solid ${theme.border}; border-radius:4px;">
                ` : ''}
              </div>
            </div>
          </section>
        `;

        if (sid === 'education') return `
          <section style="margin-bottom:25px;">
            <h2 style="font-family:var(--font-display); font-size:22px; color:${theme.primary}; border-bottom:1px solid ${theme.accent}; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase;">Education & Career</h2>
            ${renderFieldGroup('education', [
              ['Qualification', fd.qualification, false, 'qualification'],
              ['Additional Degrees', fd.additionalDegrees, false, 'additionalDegrees'],
              ['Profession', fd.profession, false, 'profession'],
              ['Employer', fd.employer, false, 'employer'],
              ['Annual Income', fd.annualIncome, false, 'annualIncome'],
              ['Working City', fd.workingCity, false, 'workingCity'],
              ['Assets', (fd.assets||[]).join(', '), false, 'assets']
            ], theme)}
          </section>
        `;

        if (sid === 'family') return `
          <section style="margin-bottom:25px;">
            <h2 style="font-family:var(--font-display); font-size:22px; color:${theme.primary}; border-bottom:1px solid ${theme.accent}; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase;">Family Background</h2>
            ${renderFieldGroup('family', [
              ["Father's Name", fd.fatherName, false, 'fatherName'],
              ["Father's Occ.", fd.fatherOccupation, false, 'fatherOccupation'],
              ["Mother's Name", fd.motherName, false, 'motherName'],
              ["Mother's Occ.", fd.motherOccupation, false, 'motherOccupation'],
              ['Native Place', fd.nativePlace, false, 'nativePlace'],
              ['Brothers', fd.brothers, false, 'brothers'],
              ['Sisters', fd.sisters, false, 'sisters'],
              ['Gotra / Sub-caste', fd.gotra ? (fd.subCaste ? `${fd.gotra} / ${fd.subCaste}` : fd.gotra) : fd.subCaste, false, 'gotra'],
              ['Family Type', fd.familyType ? (fd.familyValues ? `${fd.familyType} (${fd.familyValues})` : fd.familyType) : fd.familyValues, false, 'familyType'],
              ['Family Status', fd.familyStatus, false, 'familyStatus'],
              ['Maternal Uncle', fd.maternalUncle, false, 'maternalUncle']
            ], theme)}
          </section>
        `;

        if (sid === 'horoscope') return `
          <section style="margin-bottom:25px;">
            <h2 style="font-family:var(--font-display); font-size:22px; color:${theme.primary}; border-bottom:1px solid ${theme.accent}; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase;">Horoscope Details</h2>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              ${renderFieldGroup('horoscope', [
                ['Rashi', fd.rashi, false, 'rashi'],
                ['Nakshatra', fd.nakshatra, false, 'nakshatra'],
                ['Gan', fd.gan, false, 'gan'],
                ['Nadi', fd.nadi, false, 'nadi'],
                ['Charan', fd.charan, false, 'charan']
              ], theme)}
            </div>
          </section>
        `;

        if (sid === 'expectations') return `
          <section style="margin-bottom:25px;">
            <h2 style="font-family:var(--font-display); font-size:22px; color:${theme.primary}; border-bottom:1px solid ${theme.accent}; padding-bottom:5px; margin-bottom:15px; text-transform:uppercase;">Partner Expectations</h2>
            ${renderFieldGroup('expectations', [
              ['Age Range', `${fd.partnerAgeMin} to ${fd.partnerAgeMax} Years`, false, 'partnerAgeMin'],
              ['Qualification', fd.partnerQualification, false, 'partnerQualification'],
              ['Profession', fd.partnerProfession, false, 'partnerProfession'],
              ['Location', fd.locationPreference, false, 'locationPreference'],
              ['Other', fd.otherExpectations, false, 'otherExpectations']
            ], theme)}
          </section>
        `;

        if (sid === 'contact') return `
          <section style="margin-bottom:25px; background:${theme.primary}10; padding:15px; border-radius:8px;">
            <h2 style="font-family:var(--font-display); font-size:22px; color:${theme.primary}; margin-bottom:10px; text-transform:uppercase;">Contact Information</h2>
            ${renderFieldGroup('contact', [
              ['Point of Contact', fd.contactPerson, false, 'contactPerson'],
              ['Phone Number', fd.contactNumber, false, 'contactNumber'],
              ['WhatsApp', fd.whatsappNumber, false, 'whatsappNumber'],
              ['Email Address', fd.contactEmail, false, 'contactEmail']
            ], theme)}
            ${fd.familyConsent ? `<div style="margin-top:10px; font-size:12px; color:${theme.text}99; font-style:italic;">* Profile shared with family consent.</div>` : ''}
          </section>
        `;

        if (sid === 'familyPhoto' && state.familyPhoto && state.showFamilyPhoto) return `
          <section style="text-align:center; cursor:pointer;" onclick="changeFamilyPhoto()" title="Click to Change Photo">
             <img src="${state.familyPhoto}" style="width:100px; height:100px; object-fit:cover; border-radius:8px; border:2px solid ${theme.border}">
          </section>
        `;

        return '';
      }).join('')}

      <footer style="position:absolute; bottom:15mm; left:20mm; right:20mm; text-align:center; font-size:10px; color:${theme.text}66; border-top:1px solid ${theme.accent}33; padding-top:10px;">
        Created via Bio Data Maker
      </footer>
    </div>
  `;
}

// Variation template logic can be added here (renderModernMinimal, etc)
// For now, I'll redirect them to the standard one or a slightly modified version
function renderModernMinimal(fd, sections, theme) {
  return renderStandard(fd, sections, theme).replace('double', 'solid').replace('15px', '2px');
}
function renderCorporate(fd, sections, theme) {
  return renderStandard(fd, sections, theme).replace('double', 'none');
}

function renderFieldGroup(sectionId, fields, theme) {
  return fields.filter(f => {
    const val = f[1];
    const key = f[3];
    const isHidden = (state.hiddenFields || []).includes(`${sectionId}.${key}`);
    return val && !isHidden;
  }).map(f => `
    <div style="display:flex; margin-bottom:6px; font-size:14px; line-height:1.4;">
      <div style="width:130px; font-weight:700; color:${theme.text}BB;">${f[0]}</div>
      <div style="width:20px; color:${theme.accent};">:</div>
      <div class="editable-text" 
           style="flex:1; color:${theme.text}; min-height:1em; outline:none; border-radius:4px; padding:0 4px; ${f[2] ? `font-weight:700; color:${theme.primary}; font-size:16px;` : ''}" 
           contenteditable="true"
           oninput="updateFieldInline('${f[3]}', this.innerText)"
           onblur="renderBiodata()"
           title="Click to Edit">
        ${f[1]}
      </div>
    </div>
  `).join('');
}

function updateFieldInline(key, value) {
  state.formData[key] = value;
  scheduleSave(state);
}

// ── EXPORT ──
function exportPDF() {
  const element = document.getElementById('biodata-paper');
  const opt = {
    margin:       0,
    filename:     `Biodata_${state.formData.fullName.replace(/\s+/g, '_') || 'Personal'}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  showToast('Generating PDF...');
  html2pdf().set(opt).from(element).save().then(() => {
    showToast('✅ PDF Downloaded!');
    // Redirect to the dedicated support page after download
    setTimeout(() => {
      window.location.href = 'support.html?from=download';
    }, 1800);
  });
}

function shareWhatsApp() {
  const fd = state.formData;
  const url = window.location.origin + window.location.pathname + '#data=' + encodeStateToURL(state);
  const text = `Hi, I have created a biodata for ${fd.fullName || 'the candidate'} using Bio Data Maker. You can view it here: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

// ── PHOTO CHANGE LOGIC ──
let activePhotoRole = null; // 'profile' or 'family'

function changeProfilePhoto() {
  activePhotoRole = 'profile';
  document.getElementById('photoInput').click();
}

function changeFamilyPhoto() {
  activePhotoRole = 'family';
  document.getElementById('photoInput').click();
}

// ── INIT ──
document.getElementById('primaryColor').addEventListener('input', e => {
  if (!state.customTheme) state.customTheme = JSON.parse(JSON.stringify(THEMES[state.selectedTheme]));
  state.customTheme.primary = e.target.value;
  saveNow(state); renderBiodata();
});
document.getElementById('accentColor').addEventListener('input', e => {
  if (!state.customTheme) state.customTheme = JSON.parse(JSON.stringify(THEMES[state.selectedTheme]));
  state.customTheme.accent = e.target.value;
  saveNow(state); renderBiodata();
});
document.getElementById('headerTextColor').addEventListener('input', e => {
  if (!state.customTheme) state.customTheme = JSON.parse(JSON.stringify(THEMES[state.selectedTheme]));
  state.customTheme.headerText = e.target.value;
  saveNow(state); renderBiodata();
});
document.getElementById('bgColor').addEventListener('input', e => {
  if (!state.customTheme) state.customTheme = JSON.parse(JSON.stringify(THEMES[state.selectedTheme]));
  state.customTheme.background = e.target.value;
  saveNow(state); renderBiodata();
});

// ── TEXT EDIT LOGIC ──
function updateFieldInline(key, value) {
  let finalVal = value.trim();
  
  // If it's the DOB field and user typed DD MM YYYY or similar
  if (key === 'dob') {
    const parts = finalVal.split(/[- /\.]/);
    if (parts.length === 3) {
      // If user typed DD MM YYYY, convert to YYYY-MM-DD for storage compatibility
      if (parts[2].length === 4 && parts[0].length <= 2) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        finalVal = `${y}-${m}-${d}`;
      }
    }
  }

  state.formData[key] = finalVal;
  scheduleSave(state);
}
document.getElementById('photoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    if (activePhotoRole === 'profile') {
      state.profilePhoto = event.target.result;
    } else {
      state.familyPhoto = event.target.result;
    }
    saveNow(state);
    renderBiodata();
    showToast(`${activePhotoRole === 'profile' ? 'Profile' : 'Family'} photo updated!`);
  };
  reader.readAsDataURL(file);
});

initEditorUI();

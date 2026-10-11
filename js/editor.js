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
    { key: 'gotraDada', label: "Dada Gotra (Self)" },
    { key: 'gotraNana', label: "Nana Gotra (Nanihal)" },
    { key: 'gotraDadi', label: "Dadi Gotra" },
    { key: 'gotraNani', label: "Nani Gotra" },
    { key: 'gotraExtra', label: "Additional Gotra" },
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

// ── SECTION TITLES & CUSTOM SECTIONS ──
function getSectionTitle(id) {
  if (state.customSectionTitles && state.customSectionTitles[id]) {
    return state.customSectionTitles[id];
  }
  if (SECTION_LABELS[id]) {
    return SECTION_LABELS[id];
  }
  const cs = (state.customSections || []).find(s => s.id === id);
  if (cs) return cs.title;
  return id;
}

function updateSectionTitleInline(id, newTitle) {
  if (!id) return;
  const trimmed = newTitle.trim();
  if (!state.customSectionTitles) state.customSectionTitles = {};
  state.customSectionTitles[id] = trimmed;
  const cs = (state.customSections || []).find(s => s.id === id);
  if (cs) cs.title = trimmed;
  scheduleSave(state);
  const sidebarName = document.querySelector(`.section-item[data-id="${id}"] .section-name`);
  if (sidebarName) sidebarName.innerHTML = `${trimmed} <span style="font-size:10px; opacity:0.45; cursor:pointer;" title="Rename">✏️</span>`;
}

// ── IN-APP CUSTOM PROMPT & CONFIRM MODALS (Replaces browser popups) ──
let customPromptCallback = null;
function showCustomPrompt({ title = 'Edit', subtitle = '', defaultValue = '', placeholder = '', confirmText = 'Save', onConfirm }) {
  const modal = document.getElementById('customPromptModal');
  if (!modal) return;
  customPromptCallback = onConfirm;
  const titleEl = document.getElementById('customPromptTitle');
  const subEl = document.getElementById('customPromptSubtitle');
  const inputEl = document.getElementById('customPromptInput');
  const confirmBtn = document.getElementById('customPromptConfirmBtn');

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (confirmBtn) confirmBtn.textContent = confirmText;
  if (inputEl) {
    inputEl.value = defaultValue || '';
    inputEl.placeholder = placeholder || '';
  }

  modal.classList.add('show', 'open');
  modal.style.display = 'flex';
  modal.style.pointerEvents = 'auto';
  setTimeout(() => {
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }, 60);
}

function closeCustomPrompt(confirmed) {
  const modal = document.getElementById('customPromptModal');
  const inputEl = document.getElementById('customPromptInput');
  const val = inputEl ? inputEl.value : '';
  
  if (modal) {
    modal.classList.remove('show', 'open');
    modal.style.display = 'none';
  }

  if (confirmed && typeof customPromptCallback === 'function') {
    customPromptCallback(val);
  }
  customPromptCallback = null;
}

let customConfirmCallback = null;
function showCustomConfirm({ title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Confirm', isDanger = true, onConfirm }) {
  const modal = document.getElementById('customConfirmModal');
  if (!modal) return;
  customConfirmCallback = onConfirm;
  const titleEl = document.getElementById('customConfirmTitle');
  const msgEl = document.getElementById('customConfirmMessage');
  const btnEl = document.getElementById('customConfirmBtn');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (btnEl) {
    btnEl.textContent = confirmText;
    btnEl.style.background = isDanger ? '#B91C1C' : 'var(--app-accent)';
    btnEl.style.borderColor = isDanger ? '#B91C1C' : 'var(--app-accent)';
  }

  modal.classList.add('show', 'open');
  modal.style.display = 'flex';
  modal.style.pointerEvents = 'auto';
}

function closeCustomConfirm(confirmed) {
  const modal = document.getElementById('customConfirmModal');
  if (modal) {
    modal.classList.remove('show', 'open');
    modal.style.display = 'none';
  }
  if (confirmed && typeof customConfirmCallback === 'function') {
    customConfirmCallback();
  }
  customConfirmCallback = null;
}

// Native browser message override — ensures all messages use our royal UI!
window.alert = function(msg) {
  if (typeof showToast === 'function') {
    showToast(String(msg), 'info');
  } else {
    console.log('[Alert]', msg);
  }
};

function renameSectionPrompt(id) {
  const current = getSectionTitle(id);
  showCustomPrompt({
    title: 'Rename Section',
    subtitle: `Enter a new display title for "${current}":`,
    defaultValue: current,
    placeholder: 'e.g. Relatives & Family, Work & Background',
    confirmText: 'Rename',
    onConfirm: (next) => {
      if (next && next.trim() && next.trim() !== current) {
        updateSectionTitleInline(id, next.trim());
        renderSectionList();
        renderBiodata();
        showToast(`Section renamed to "${next.trim()}"`);
      }
    }
  });
}

// ── ADD MORE DETAILS PRESETS & CONTROLLER ──
const SECTION_DETAIL_PRESETS = {
  contact: [
    { label: 'WhatsApp', value: '+91 ' },
    { label: 'Alternate Mobile', value: '+91 ' },
    { label: 'Landline', value: '' },
    { label: 'Instagram', value: '@' },
    { label: 'LinkedIn', value: '' },
    { label: 'Residential Address', value: '' },
    { label: 'Calling Time', value: '10 AM - 8 PM' }
  ],
  personal: [
    { label: 'Weight', value: '65 kg' },
    { label: 'Mother Tongue', value: 'Hindi' },
    { label: 'Languages Known', value: 'Hindi, English' },
    { label: 'Hobbies', value: 'Music, Traveling' },
    { label: 'Zodiac / Sun Sign', value: '' },
    { label: 'Physical Status', value: 'Normal' }
  ],
  education: [
    { label: 'School / College', value: '' },
    { label: 'University', value: '' },
    { label: 'Current Designation', value: '' },
    { label: 'Office Location', value: '' },
    { label: 'Future Plans', value: '' },
    { label: 'Certifications', value: '' }
  ],
  family: [
    { label: 'Village / Native', value: '' },
    { label: 'Family Business', value: '' },
    { label: 'Paternal Uncle (Chacha)', value: '' },
    { label: 'Maternal Uncle (Mama)', value: '' },
    { label: 'Bua & Fufa Ji', value: '' },
    { label: 'Elder Brother', value: '' },
    { label: 'Elder Sister', value: '' },
    { label: 'Ancestral Origin', value: '' }
  ],
  horoscope: [
    { label: 'Kundali Matching', value: 'Must / Necessary' },
    { label: 'Manglik Dosh', value: 'No' },
    { label: 'Gotra Devata', value: '' },
    { label: 'Birth Time Accuracy', value: 'Accurate' },
    { label: 'Sun Sign', value: '' }
  ],
  expectations: [
    { label: 'Working Preference', value: 'Working / Non-Working' },
    { label: 'Height Preference', value: '5 ft 2 in+' },
    { label: 'City / State', value: '' },
    { label: 'Dietary Preference', value: 'Vegetarian' },
    { label: 'Family Values', value: 'Traditional / Modern' }
  ],
  default: [
    { label: 'Detail Name', value: 'Click to edit' },
    { label: 'Important Note', value: '' },
    { label: 'Additional Info', value: '' }
  ]
};

let activeAddDetailSectionId = null;

function openAddDetailModal(sectionId) {
  activeAddDetailSectionId = sectionId;
  const modal = document.getElementById('addDetailModal');
  if (!modal) return;

  const sectionTitle = getSectionTitle(sectionId);
  const titleEl = document.getElementById('addDetailModalTitle');
  const subEl = document.getElementById('addDetailModalSubtitle');
  const presetsEl = document.getElementById('addDetailPresets');
  const presetsContainer = document.getElementById('addDetailPresetsContainer');
  const labelInput = document.getElementById('detailLabelInput');
  const valueInput = document.getElementById('detailValueInput');

  if (titleEl) titleEl.textContent = 'Add Detail';
  if (subEl) subEl.textContent = `Add a new detail or field to "${sectionTitle}"`;
  if (labelInput) labelInput.value = '';
  if (valueInput) valueInput.value = '';

  let presets = SECTION_DETAIL_PRESETS[sectionId];
  if (!presets && sectionId.startsWith('custom_')) {
    const cs = (state.customSections || []).find(s => s.id === sectionId);
    const cTitle = (cs?.title || '').toLowerCase();
    if (cTitle.includes('grandparent') || cTitle.includes('dada') || cTitle.includes('nana')) {
      presets = [
        { label: 'Dada Ji', value: 'Late Shri ...' },
        { label: 'Dadi Ji', value: 'Smt. ...' },
        { label: 'Nana Ji', value: 'Shri ...' },
        { label: 'Nani Ji', value: 'Smt. ...' }
      ];
    } else if (cTitle.includes('mama') || cTitle.includes('nanihal')) {
      presets = [
        { label: 'Mama Ji', value: 'Shri ...' },
        { label: 'Mami Ji', value: 'Smt. ...' },
        { label: 'Nanihal Native Place', value: 'City, State' }
      ];
    } else if (cTitle.includes('asset') || cTitle.includes('property')) {
      presets = [
        { label: 'Own House', value: '3 BHK in City Center' },
        { label: 'Agricultural Land', value: '10 Acres' },
        { label: 'Commercial Property', value: 'Shop / Office' },
        { label: 'Family Business', value: 'Wholesale & Retail' }
      ];
    } else if (cTitle.includes('hobby') || cTitle.includes('interest')) {
      presets = [
        { label: 'Hobbies', value: 'Photography, Traveling' },
        { label: 'Music Preference', value: 'Classical, Instrumental' },
        { label: 'Sports', value: 'Cricket, Badminton' },
        { label: 'Reading', value: 'Self-help, History' }
      ];
    } else {
      presets = SECTION_DETAIL_PRESETS.default;
    }
  } else if (!presets) {
    presets = SECTION_DETAIL_PRESETS.default;
  }

  if (presets && presets.length > 0 && presetsEl) {
    if (presetsContainer) presetsContainer.style.display = 'block';
    presetsEl.innerHTML = presets.map(p => `
      <button type="button" class="preset-pill" onclick="applyDetailPreset('${p.label.replace(/'/g, "\\'")}', '${p.value.replace(/'/g, "\\'")}')">
        + ${p.label}
      </button>
    `).join('');
  } else if (presetsContainer) {
    presetsContainer.style.display = 'none';
  }

  modal.classList.add('show', 'open');
  modal.style.display = 'flex';
  modal.style.pointerEvents = 'auto';
  setTimeout(() => {
    if (labelInput) labelInput.focus();
  }, 70);
}

function closeAddDetailModal() {
  const modal = document.getElementById('addDetailModal');
  if (modal) {
    modal.classList.remove('show', 'open');
    modal.style.display = 'none';
  }
  activeAddDetailSectionId = null;
}

function applyDetailPreset(label, val) {
  const labelInput = document.getElementById('detailLabelInput');
  const valueInput = document.getElementById('detailValueInput');
  if (labelInput) labelInput.value = label;
  if (valueInput) {
    valueInput.value = val;
    valueInput.focus();
    if (val) valueInput.select();
  }
}

function submitAddDetail() {
  if (!activeAddDetailSectionId) return;
  const labelInput = document.getElementById('detailLabelInput');
  const valueInput = document.getElementById('detailValueInput');
  const label = labelInput ? labelInput.value.trim() : '';
  const value = (valueInput ? valueInput.value.trim() : '') || 'Click to edit';

  if (!label) {
    if (labelInput) {
      labelInput.style.borderColor = '#B91C1C';
      labelInput.focus();
      setTimeout(() => { labelInput.style.borderColor = 'var(--app-border)'; }, 1500);
    }
    showToast('Please enter a detail name/label', 'warning');
    return;
  }

  const targetId = activeAddDetailSectionId;

  if (targetId.startsWith('custom_')) {
    const cs = (state.customSections || []).find(s => s.id === targetId);
    if (cs) {
      if (!cs.fields) cs.fields = [];
      cs.fields.push({
        key: 'f_' + Date.now(),
        label: label,
        value: value
      });
    }
  } else {
    if (!state.extraFields) state.extraFields = {};
    if (!state.extraFields[targetId]) state.extraFields[targetId] = [];
    state.extraFields[targetId].push({
      id: 'ef_' + Date.now(),
      label: label,
      value: value
    });
  }

  saveNow(state);
  renderSectionList();
  renderBiodata();
  const el = document.getElementById(`fields-${targetId}`);
  if (el) el.style.display = 'block';
  closeAddDetailModal();
  showToast(`Added "${label}" to ${getSectionTitle(targetId)}`);
}

function deleteExtraField(sectionId, index) {
  if (sectionId.startsWith('custom_')) {
    deleteFieldFromCustomSection(sectionId, index);
    return;
  }
  if (!state.extraFields || !state.extraFields[sectionId]) return;
  const item = state.extraFields[sectionId][index];
  const name = item ? item.label : 'Detail';
  state.extraFields[sectionId].splice(index, 1);
  saveNow(state);
  renderSectionList();
  const el = document.getElementById(`fields-${sectionId}`);
  if (el) el.style.display = 'block';
  renderBiodata();
  showToast(`Removed "${name}"`, 'info');
}

function updateExtraFieldLabel(sectionId, index, newLabel) {
  if (!state.extraFields || !state.extraFields[sectionId] || !state.extraFields[sectionId][index]) return;
  state.extraFields[sectionId][index].label = newLabel.trim();
  scheduleSave(state);
}

function updateExtraFieldValue(sectionId, index, newValue) {
  if (!state.extraFields || !state.extraFields[sectionId] || !state.extraFields[sectionId][index]) return;
  state.extraFields[sectionId][index].value = newValue.trim();
  scheduleSave(state);
}

function renderExtraFieldItem(f, idx, sectionId, theme) {
  const typo = getTypographyStyles();
  return `
    <div style="display:flex; align-items:baseline; font-size:${typo.valueSize}; line-height:1.35; min-width:0;">
      <div class="editable-text"
           style="width:${(105 * typo.scale).toFixed(0)}px; min-width:${(105 * typo.scale).toFixed(0)}px; font-weight:${typo.labelWeight}; color:${theme.primary}; font-size:${typo.labelSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; outline:none; border-radius:3px; padding:0 2px;"
           contenteditable="true"
           spellcheck="false"
           oninput="updateExtraFieldLabel('${sectionId}', ${idx}, this.innerText)"
           title="Click to Edit Label">${f.label}</div>
      <div style="width:12px; text-align:center; color:${theme.accent}; font-weight:800; font-size:${typo.colonSize};">:</div>
      <div class="editable-text" 
           style="flex:1; color:${theme.text}; font-weight:${typo.valueWeight}; font-style:${typo.valueStyle}; font-size:${typo.valueSize}; min-height:1.15em; outline:none; border-radius:3px; padding:0 2px; word-break:break-word;"
           contenteditable="true"
           spellcheck="false"
           oninput="updateExtraFieldValue('${sectionId}', ${idx}, this.innerText)"
           title="Click to Edit Value">
        ${f.value}
      </div>
    </div>
  `;
}

// ── CUSTOM SECTION MODAL & ACTIONS ──
function openAddSectionModal() {
  const modal = document.getElementById('addSectionModal');
  if (modal) {
    modal.classList.add('show', 'open');
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
    const inp = document.getElementById('customSectionInput');
    if (inp) { 
      inp.value = ''; 
      setTimeout(() => inp.focus(), 60); 
    }
  }
}

function closeAddSectionModal() {
  const modal = document.getElementById('addSectionModal');
  if (modal) {
    modal.classList.remove('show', 'open');
    modal.style.display = 'none';
  }
}

function addPresetSection(title) {
  closeAddSectionModal();
  addCustomSection(title);
}

function submitCustomSection() {
  const input = document.getElementById('customSectionInput');
  if (!input || !input.value.trim()) return;
  const title = input.value.trim();
  closeAddSectionModal();
  addCustomSection(title);
}

function addCustomSection(title) {
  if (!title || !title.trim()) return;
  const id = 'custom_' + Date.now();
  if (!state.customSections) state.customSections = [];
  if (!state.sectionOrder) {
    state.sectionOrder = ['header','personal','education','family','horoscope','expectations','contact','familyPhoto'];
  }
  if (!state.hiddenSections) state.hiddenSections = [];
  
  let defaultFields = [
    { key: 'f_' + Date.now() + '_1', label: 'Detail 1', value: 'Click to edit' },
    { key: 'f_' + Date.now() + '_2', label: 'Detail 2', value: 'Click to edit' }
  ];
  const tLow = title.toLowerCase();
  if (tLow.includes('hobby') || tLow.includes('interest')) {
    defaultFields = [
      { key: 'hobbies', label: 'Hobbies', value: 'Traveling, Reading' },
      { key: 'interests', label: 'Interests', value: 'Music, Cooking' }
    ];
  } else if (tLow.includes('about')) {
    defaultFields = [
      { key: 'nature', label: 'Nature', value: 'Friendly, Caring, Ambitious' },
      { key: 'lifestyle', label: 'Lifestyle', value: 'Moderate, Family-oriented' }
    ];
  } else if (tLow.includes('property') || tLow.includes('asset')) {
    defaultFields = [
      { key: 'house', label: 'Own House', value: 'Independent House / Apartment' },
      { key: 'business', label: 'Family Business', value: 'Trading & Services' }
    ];
  } else if (tLow.includes('grandparent')) {
    defaultFields = [
      { key: 'dada', label: 'Dada Ji', value: 'Late Shri ...' },
      { key: 'dadi', label: 'Dadi Ji', value: 'Smt. ...' },
      { key: 'nana', label: 'Nana Ji', value: 'Shri ...' },
      { key: 'nani', label: 'Nani Ji', value: 'Smt. ...' }
    ];
  } else if (tLow.includes('mama') || tLow.includes('nanihal')) {
    defaultFields = [
      { key: 'mama', label: 'Mama Ji', value: 'Shri ...' },
      { key: 'nanihalCity', label: 'Nanihal', value: 'City, State' }
    ];
  }

  const newSection = {
    id,
    title: title.trim(),
    fields: defaultFields
  };

  state.customSections.push(newSection);
  state.sectionOrder.push(id);
  saveNow(state);
  renderSectionList();
  renderBiodata();
  if (typeof showToast === 'function') {
    showToast(`Section "${title.trim()}" added!`);
  }
}

// Global window exposure for HTML onclick handlers
window.openAddSectionModal = openAddSectionModal;
window.closeAddSectionModal = closeAddSectionModal;
window.addPresetSection = addPresetSection;
window.submitCustomSection = submitCustomSection;
window.addCustomSection = addCustomSection;

function deleteCustomSection(id) {
  const cs = (state.customSections || []).find(s => s.id === id);
  const title = cs ? cs.title : 'this section';
  showCustomConfirm({
    title: 'Delete Section?',
    message: `Are you sure you want to delete "${title}"? All details inside it will be permanently removed.`,
    confirmText: 'Delete Section',
    isDanger: true,
    onConfirm: () => {
      state.customSections = (state.customSections || []).filter(s => s.id !== id);
      state.sectionOrder = state.sectionOrder.filter(sid => sid !== id);
      if (state.customSectionTitles) delete state.customSectionTitles[id];
      saveNow(state);
      renderSectionList();
      renderBiodata();
      showToast('Section deleted', 'info');
    }
  });
}

function addFieldToCustomSection(sectionId) {
  openAddDetailModal(sectionId);
}

function deleteFieldFromCustomSection(sectionId, fieldIndex) {
  const cs = (state.customSections || []).find(s => s.id === sectionId);
  if (!cs || !cs.fields) return;
  const removedLabel = cs.fields[fieldIndex]?.label || 'Field';
  cs.fields.splice(fieldIndex, 1);
  saveNow(state);
  renderSectionList();
  const el = document.getElementById(`fields-${sectionId}`);
  if (el) el.style.display = 'block';
  renderBiodata();
  showToast(`Removed "${removedLabel}"`, 'info');
}

function updateCustomFieldLabel(sectionId, fieldIndex, newLabel) {
  const cs = (state.customSections || []).find(s => s.id === sectionId);
  if (!cs || !cs.fields || !cs.fields[fieldIndex]) return;
  cs.fields[fieldIndex].label = newLabel.trim();
  scheduleSave(state);
}

function updateCustomFieldValue(sectionId, fieldIndex, newValue) {
  const cs = (state.customSections || []).find(s => s.id === sectionId);
  if (!cs || !cs.fields || !cs.fields[fieldIndex]) return;
  cs.fields[fieldIndex].value = newValue.trim();
  scheduleSave(state);
}

window.deleteCustomSection = deleteCustomSection;
window.addFieldToCustomSection = addFieldToCustomSection;
window.deleteFieldFromCustomSection = deleteFieldFromCustomSection;
window.updateCustomFieldLabel = updateCustomFieldLabel;
window.updateCustomFieldValue = updateCustomFieldValue;
window.openAddDetailModal = openAddDetailModal;
window.closeAddDetailModal = closeAddDetailModal;
window.applyDetailPreset = applyDetailPreset;
window.submitAddDetail = submitAddDetail;
window.deleteExtraField = deleteExtraField;
window.updateExtraFieldLabel = updateExtraFieldLabel;
window.updateExtraFieldValue = updateExtraFieldValue;
window.showCustomPrompt = showCustomPrompt;
window.closeCustomPrompt = closeCustomPrompt;
window.showCustomConfirm = showCustomConfirm;
window.closeCustomConfirm = closeCustomConfirm;
window.renameSectionPrompt = renameSectionPrompt;

// ── RENDER EDITOR UI ──
function initEditorUI() {
  renderSectionList();
  renderThemeList();
  updateCustomColors();
  updateDesignButtons();
  updateZoom();
  renderBiodata();

  const modal = document.getElementById('addSectionModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAddSectionModal();
    });
  }
  const customInp = document.getElementById('customSectionInput');
  if (customInp) {
    customInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitCustomSection();
      }
    });
  }

  // Keyboard shortcut: close all modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAddSectionModal();
      closeAddDetailModal();
      closeCustomPrompt(false);
      closeCustomConfirm(false);
    }
  });

  initPhotoDragAndDrop();
}

window.zoom = zoom;
window.exportPDF = exportPDF;
window.printVectorPDF = printVectorPDF;

function renderSectionList() {
  const list = document.getElementById('dragList');
  if (!list) return;

  list.innerHTML = state.sectionOrder.map((id, orderIdx) => {
    const isHidden = state.hiddenSections.includes(id);
    const isCustom = id.startsWith('custom_');
    const title = getSectionTitle(id);
    const customSection = isCustom ? (state.customSections || []).find(s => s.id === id) : null;
    const fields = isCustom ? (customSection?.fields || []) : (SECTION_FIELDS[id] || []);
    const extraList = (!isCustom && state.extraFields) ? (state.extraFields[id] || []) : [];
    const hasExpandableContent = fields.length > 0 || isCustom || extraList.length > 0 || (id !== 'header' && id !== 'familyPhoto');
    
    return `
      <div class="section-item-wrapper">
        <div class="section-item ${isHidden ? 'is-hidden' : ''}" data-id="${id}">
          <div class="section-info">
            <span class="drag-handle" title="Drag to reorder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </span>
            <span class="section-name" style="${isHidden ? 'text-decoration:line-through; color:var(--app-text-muted);' : ''}" onclick="renameSectionPrompt('${id}')" title="Click to rename">
              ${title} <span style="font-size:10px; opacity:0.45; cursor:pointer;" title="Rename">✏️</span>
            </span>
          </div>
          <div class="section-actions">
            <button type="button" class="order-btn" onclick="moveSectionUp('${id}', event)" title="Move Up" ${orderIdx === 0 ? 'disabled' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button type="button" class="order-btn" onclick="moveSectionDown('${id}', event)" title="Move Down" ${orderIdx === state.sectionOrder.length - 1 ? 'disabled' : ''}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            ${hasExpandableContent ? `
              <button class="expand-btn" onclick="toggleSectionExpand('${id}')" title="Fields & Details">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            ` : ''}
            ${isCustom ? `
              <button class="visibility-btn" style="background:#FEE2E2; color:#B91C1C; border-color:#FECACA;" onclick="deleteCustomSection('${id}')" title="Delete Custom Section">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ` : `
              <button class="visibility-btn ${isHidden ? 'is-hidden' : ''}" 
                      onclick="toggleVisibility('${id}')" 
                      title="${isHidden ? 'Restore Section' : 'Hide Section'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  ${isHidden ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>' : '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'}
                </svg>
              </button>
            `}
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
          ${isCustom ? `
            ${(customSection?.fields || []).map((f, fIdx) => `
              <div class="field-toggle-item" style="background:#FFF9F6; border-left:2.5px solid var(--app-accent); padding-left:8px;">
                <span class="field-label" style="font-size:11.5px;"><strong>${f.label}</strong>: ${f.value}</span>
                <button class="f-visibility-btn" onclick="deleteFieldFromCustomSection('${id}', ${fIdx})" title="Delete field" style="color:#B91C1C;">✕</button>
              </div>
            `).join('')}
            <button type="button" class="btn btn-outline btn-sm btn-full" style="margin-top:10px; font-size:11.5px; padding:6px 10px; border-style:dashed; border-color:var(--app-accent); color:var(--app-accent); font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;" onclick="openAddDetailModal('${id}')">
              <span>+</span> Add More Details
            </button>
          ` : `
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
            ${extraList.map((ef, efIdx) => `
              <div class="field-toggle-item" style="background:#FFF9F6; border-left:2.5px solid var(--app-accent); padding-left:8px;">
                <span class="field-label" style="font-size:11.5px;"><strong>${ef.label}</strong>: ${ef.value}</span>
                <button class="f-visibility-btn" onclick="deleteExtraField('${id}', ${efIdx})" title="Delete detail" style="color:#B91C1C;">✕</button>
              </div>
            `).join('')}
            ${id !== 'header' && id !== 'familyPhoto' ? `
              <button type="button" class="btn btn-outline btn-sm btn-full" style="margin-top:10px; font-size:11.5px; padding:6px 10px; border-style:dashed; border-color:var(--app-accent); color:var(--app-accent); font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;" onclick="openAddDetailModal('${id}')">
                <span>+</span> Add More Details
              </button>
            ` : ''}
          `}
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
  const cardColorEl = document.getElementById('cardBgColor');
  if (cardColorEl) {
    cardColorEl.value = (state.designSettings && state.designSettings.customCardBg) || theme.cardBg || '#FAF3E6';
  }
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

function moveSectionUp(id, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const idx = state.sectionOrder.indexOf(id);
  if (idx <= 0) return;
  const temp = state.sectionOrder[idx - 1];
  state.sectionOrder[idx - 1] = id;
  state.sectionOrder[idx] = temp;
  saveNow(state);
  renderSectionList();
  renderBiodata();
  showToast('Moved section up');
}

function moveSectionDown(id, e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const idx = state.sectionOrder.indexOf(id);
  if (idx === -1 || idx >= state.sectionOrder.length - 1) return;
  const temp = state.sectionOrder[idx + 1];
  state.sectionOrder[idx + 1] = id;
  state.sectionOrder[idx] = temp;
  saveNow(state);
  renderSectionList();
  renderBiodata();
  showToast('Moved section down');
}

function selectTheme(id) {
  state.selectedTheme = id;
  state.customTheme = null;
  if (state.designSettings) {
    state.designSettings.customCardBg = null;
  }
  saveNow(state);
  renderThemeList();
  updateCustomColors();
  updateDesignButtons();
  renderBiodata();
  showToast(`Applied ${THEMES[id].name} theme!`);
}

function setBannerStyle(style) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.bannerStyle = style;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
}

function setBorderStyle(style) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.borderStyle = style;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
}

function setPhotoFrame(frame) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.photoFrame = frame;
  state.designSettings.photoShape = frame;
  state.photoShape = frame;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
  showToast(`Applied ${formatFrameName(frame)} frame!`);
}

function setPhotoShape(shape) {
  setPhotoFrame(shape);
}

function setPhotoSize(size) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.photoSize = size;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
  showToast(`Photo size: ${size.toUpperCase()}`);
}

function setPhotoPosition(pos) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.photoPosition = pos;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
  showToast(`Face alignment updated`);
}

function removeProfilePhoto() {
  showCustomConfirm({
    title: 'Remove Photo?',
    message: 'Are you sure you want to remove your profile photo from the bio data?',
    confirmText: 'Remove Photo',
    isDanger: true,
    onConfirm: () => {
      state.profilePhoto = null;
      saveNow(state);
      renderBiodata();
      renderSectionList();
      showToast('Profile photo removed', 'info');
    }
  });
}

function formatFrameName(frame) {
  const map = {
    royalArch: 'Royal Arch',
    jharokha: 'Palace Jharokha',
    royalOval: 'Royal Oval',
    goldRect: 'Imperial Gold Rect',
    kundanCircle: 'Kundan Circle',
    modernRoyal: 'Modern Royal',
    arch: 'Arch',
    rounded: 'Round',
    rectangle: 'Clean Rect'
  };
  return map[frame] || frame;
}

function setTextSize(size) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.fontSize = size;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
}

function stepTextSize(delta) {
  const sizes = ['compact', 'normal', 'large', 'xlarge'];
  const cur = (state.designSettings && state.designSettings.fontSize) || 'normal';
  let idx = sizes.indexOf(cur);
  if (idx === -1) idx = 1;
  const nextIdx = Math.max(0, Math.min(sizes.length - 1, idx + delta));
  setTextSize(sizes[nextIdx]);
  showToast(`Text size: ${sizes[nextIdx].toUpperCase()}`);
}

function toggleBoldValues() {
  if (!state.designSettings) state.designSettings = {};
  const cur = state.designSettings.valueWeight;
  state.designSettings.valueWeight = (cur === '700' || cur === '800') ? '500' : '700';
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
  showToast(`Bold text: ${state.designSettings.valueWeight === '700' ? 'ON' : 'OFF'}`);
}

function toggleItalicValues() {
  if (!state.designSettings) state.designSettings = {};
  const cur = state.designSettings.valueStyle;
  state.designSettings.valueStyle = (cur === 'italic') ? 'normal' : 'italic';
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
  showToast(`Italic text: ${state.designSettings.valueStyle === 'italic' ? 'ON' : 'OFF'}`);
}

function setCardTint(tint) {
  if (!state.designSettings) state.designSettings = {};
  state.designSettings.cardTint = tint;
  state.designSettings.customCardBg = null;
  saveNow(state);
  updateDesignButtons();
  renderBiodata();
}

window.moveSectionUp = moveSectionUp;
window.moveSectionDown = moveSectionDown;
window.stepTextSize = stepTextSize;
window.setTextSize = setTextSize;
window.toggleBoldValues = toggleBoldValues;
window.toggleItalicValues = toggleItalicValues;
window.setCardTint = setCardTint;
window.setPhotoShape = setPhotoShape;
window.setPhotoFrame = setPhotoFrame;
window.setPhotoSize = setPhotoSize;
window.setPhotoPosition = setPhotoPosition;
window.removeProfilePhoto = removeProfilePhoto;
window.setBannerStyle = setBannerStyle;
window.setBorderStyle = setBorderStyle;

function getTypographyStyles() {
  const ds = state.designSettings || {};
  const fs = ds.fontSize || 'normal';
  const isItalic = ds.valueStyle === 'italic';
  const isBold = ds.valueWeight === '700' || ds.valueWeight === '800';

  let scale = 1.0;
  let rowGap = '3.5px';
  let cardPadding = '5px 8px 4px';
  let sectionMargin = '6px';

  if (fs === 'compact') {
    scale = 0.9;
    rowGap = '2.5px';
    cardPadding = '4px 7px 3px';
    sectionMargin = '4.5px';
  } else if (fs === 'normal') {
    scale = 1.0;
    rowGap = '3.5px';
    cardPadding = '5px 8px 4px';
    sectionMargin = '6px';
  } else if (fs === 'large') {
    scale = 1.15;
    rowGap = '5px';
    cardPadding = '7px 10px 6px';
    sectionMargin = '8px';
  } else if (fs === 'xlarge') {
    scale = 1.28;
    rowGap = '6.5px';
    cardPadding = '9px 12px 7px';
    sectionMargin = '10px';
  }

  return {
    scale,
    rowGap,
    cardPadding,
    sectionMargin,
    headerSize: (12 * scale).toFixed(1) + 'px',
    labelSize: (11 * scale).toFixed(1) + 'px',
    colonSize: (11.5 * scale).toFixed(1) + 'px',
    valueSize: (11.5 * scale).toFixed(1) + 'px',
    highlightSize: (12.8 * scale).toFixed(1) + 'px',
    titleSize: (24 * Math.min(scale, 1.2)).toFixed(1) + 'px',
    valueWeight: isBold ? '700' : (ds.valueWeight || '600'),
    valueStyle: isItalic ? 'italic' : 'normal',
    labelWeight: ds.labelWeight || '700'
  };
}

function getCardBackground(theme) {
  const ds = state.designSettings || {};
  if (ds.customCardBg) return ds.customCardBg;
  const tint = ds.cardTint || 'theme';
  if (tint === 'transparent') return 'transparent';
  if (tint === 'gold') return `linear-gradient(135deg, ${theme.accent}14 0%, ${theme.accent}24 100%)`;
  if (tint === 'soft') return `linear-gradient(135deg, #FFFDF8 0%, ${theme.accent}12 100%)`;
  // Default: 'theme' tinted - lovely soft gradient of theme primary + accent tint!
  return `linear-gradient(135deg, ${theme.primary}0D 0%, ${theme.accent}18 100%)`;
}

function updateDesignButtons() {
  const bs = (state.designSettings && state.designSettings.bannerStyle) || 'royal';
  const os = (state.designSettings && state.designSettings.borderStyle) || 'ornate';
  const pf = (state.designSettings && state.designSettings.photoFrame) || (state.designSettings && state.designSettings.photoShape) || state.photoShape || 'royalArch';
  const psize = (state.designSettings && state.designSettings.photoSize) || 'normal';
  const ppos = (state.designSettings && state.designSettings.photoPosition) || 'center top';
  const fs = (state.designSettings && state.designSettings.fontSize) || 'normal';
  const ct = (state.designSettings && state.designSettings.cardTint) || 'theme';
  const isBold = (state.designSettings && (state.designSettings.valueWeight === '700' || state.designSettings.valueWeight === '800'));
  const isItalic = (state.designSettings && state.designSettings.valueStyle === 'italic');

  document.querySelectorAll('#bannerStylePicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${bs}'`));
  });
  document.querySelectorAll('#borderStylePicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${os}'`));
  });
  document.querySelectorAll('#photoFramePicker .style-btn, #photoShapePicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${pf}'`));
  });
  document.querySelectorAll('#photoSizePicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${psize}'`));
  });
  document.querySelectorAll('#photoPosPicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${ppos}'`));
  });
  document.querySelectorAll('#textSizePicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${fs}'`));
  });
  document.querySelectorAll('#cardTintPicker .style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${ct}'`));
  });

  const bBtn = document.getElementById('btnBoldToggle');
  if (bBtn) bBtn.classList.toggle('active', !!isBold);
  const iBtn = document.getElementById('btnItalicToggle');
  if (iBtn) iBtn.classList.toggle('active', !!isItalic);
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

// ── CORNER ORNAMENTS ──
function renderCornerOrnaments(accentColor) {
  return `
    <svg width="34" height="34" viewBox="0 0 36 36" style="position:absolute; top:2px; left:2px; color:${accentColor}; pointer-events:none;">
      <path d="M 4 28 C 4 12, 12 4, 28 4 L 28 7 C 15 7, 7 15, 7 28 Z" fill="currentColor"/>
      <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
    <svg width="34" height="34" viewBox="0 0 36 36" style="position:absolute; top:2px; right:2px; transform:scaleX(-1); color:${accentColor}; pointer-events:none;">
      <path d="M 4 28 C 4 12, 12 4, 28 4 L 28 7 C 15 7, 7 15, 7 28 Z" fill="currentColor"/>
      <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
    <svg width="34" height="34" viewBox="0 0 36 36" style="position:absolute; bottom:2px; left:2px; transform:scaleY(-1); color:${accentColor}; pointer-events:none;">
      <path d="M 4 28 C 4 12, 12 4, 28 4 L 28 7 C 15 7, 7 15, 7 28 Z" fill="currentColor"/>
      <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
    <svg width="34" height="34" viewBox="0 0 36 36" style="position:absolute; bottom:2px; right:2px; transform:scale(-1, -1); color:${accentColor}; pointer-events:none;">
      <path d="M 4 28 C 4 12, 12 4, 28 4 L 28 7 C 15 7, 7 15, 7 28 Z" fill="currentColor"/>
      <circle cx="16" cy="16" r="2.5" fill="currentColor"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
  `;
}

// ── SECTION HEADER ──
function renderSectionHeader(defaultTitle, theme, icon = '❖', bannerStyle = 'royal', sectionId = '') {
  const title = sectionId ? getSectionTitle(sectionId) : defaultTitle;
  const editAttr = sectionId ? `class="editable-text" contenteditable="true" spellcheck="false" title="Click to Rename Section" oninput="updateSectionTitleInline('${sectionId}', this.innerText)"` : '';
  const typo = getTypographyStyles();

  const moverControls = sectionId ? `
    <div class="canvas-order-controls" style="display:inline-flex; align-items:center; gap:2px; margin-right:4px;">
      <button type="button" onclick="moveSectionUp('${sectionId}', event)" style="background:rgba(255,255,255,0.22); border:none; color:inherit; cursor:pointer; font-size:9px; padding:1px 4px; border-radius:2px; line-height:1;" title="Move Up">▲</button>
      <button type="button" onclick="moveSectionDown('${sectionId}', event)" style="background:rgba(255,255,255,0.22); border:none; color:inherit; cursor:pointer; font-size:9px; padding:1px 4px; border-radius:2px; line-height:1;" title="Move Down">▼</button>
    </div>
  ` : '';

  if (bannerStyle === 'minimal') {
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; border-bottom:1.5px solid ${theme.accent}; padding-bottom:2px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-block; width:4px; height:13px; background:${theme.primary}; border-radius:2px;"></span>
          <span ${editAttr} style="font-family:var(--font-display); font-size:${typo.headerSize}; font-weight:700; color:${theme.primary}; text-transform:uppercase; letter-spacing:1px; outline:none; border-radius:3px; padding:0 2px;">
            ${title}
          </span>
        </div>
        <div style="display:flex; align-items:center;">
          ${moverControls}
        </div>
      </div>
    `;
  }
  if (bannerStyle === 'ribbon') {
    return `
      <div style="
        background: ${theme.primary}15;
        border: 1px solid ${theme.accent};
        color: ${theme.primary};
        padding: 3.5px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      ">
        <span ${editAttr} style="font-family:var(--font-display); font-size:${typo.headerSize}; font-weight:700; letter-spacing:1px; text-transform:uppercase; outline:none; border-radius:3px; padding:0 2px;">
          ${title}
        </span>
        <div style="display:flex; align-items:center; gap:5px;">
          ${moverControls}
          <span style="color:${theme.accent}; font-size:10px;">${icon}</span>
        </div>
      </div>
    `;
  }
  // Default: Royal Gradient Banner
  return `
    <div class="bio-section-header" style="
      background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.headerBg || theme.primary} 70%, ${theme.primary}E6 100%);
      color: ${theme.headerText || '#FFFFFF'};
      padding: 3.5px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
      border-left: 3.5px solid ${theme.accent};
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    ">
      <span ${editAttr} style="font-family:var(--font-display); font-size:${typo.headerSize}; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; outline:none; border-radius:3px; padding:0 2px;">
        ${title}
      </span>
      <div style="display:flex; align-items:center; gap:5px;">
        ${moverControls}
        <span style="color:${theme.accent}; font-size:10px;">${icon}</span>
      </div>
    </div>
  `;
}

// ── FIELD ITEM (2-COLUMN GRID CELL) ──
function renderFieldItem(label, val, key, sectionId, theme, span2 = false, isHighlight = false) {
  if (!val || String(val).trim() === '') return '';
  const isHidden = (state.hiddenFields || []).includes(`${sectionId}.${key}`);
  if (isHidden) return '';

  const fullKey = `${sectionId}.${key}`;
  const displayLabel = (state.customFieldLabels && state.customFieldLabels[fullKey]) || label;
  const typo = getTypographyStyles();

  return `
    <div style="display:flex; align-items:baseline; font-size:${typo.valueSize}; line-height:1.35; min-width:0; ${span2 ? 'grid-column: span 2;' : ''}">
      <div class="editable-text"
           style="width:${(105 * typo.scale).toFixed(0)}px; min-width:${(105 * typo.scale).toFixed(0)}px; font-weight:${typo.labelWeight}; color:${theme.primary}; font-size:${typo.labelSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; outline:none; border-radius:3px; padding:0 2px;"
           contenteditable="true"
           spellcheck="false"
           oninput="updateFieldLabelInline('${fullKey}', this.innerText)"
           title="Click to Edit Label">${displayLabel}</div>
      <div style="width:12px; text-align:center; color:${theme.accent}; font-weight:800; font-size:${typo.colonSize};">:</div>
      <div class="editable-text" 
           style="flex:1; color:${theme.text}; font-weight:${isHighlight ? '700' : typo.valueWeight}; font-style:${typo.valueStyle}; font-size:${isHighlight ? typo.highlightSize : typo.valueSize}; min-height:1.15em; outline:none; border-radius:3px; padding:0 2px; word-break:break-word; ${isHighlight ? `color:${theme.primary};` : ''}"
           contenteditable="true"
           spellcheck="false"
           oninput="updateFieldInline('${key}', this.innerText)"
           onblur="renderBiodata()"
           title="Click to Edit Value">
        ${val}
      </div>
    </div>
  `;
}

function updateFieldLabelInline(fullKey, newLabel) {
  if (!state.customFieldLabels) state.customFieldLabels = {};
  state.customFieldLabels[fullKey] = newLabel.trim();
  scheduleSave(state);
}

// ── SECTION CARD ──
function renderSectionCard(contentHtml, theme, isTwoColumn = true) {
  if (!contentHtml || contentHtml.trim() === '') return '';
  const typo = getTypographyStyles();
  const cardBg = getCardBackground(theme);

  return `
    <div class="bio-section-body" style="
      background: ${cardBg};
      border: 1.2px solid ${theme.accent}45;
      border-radius: 4px;
      padding: ${typo.cardPadding};
      margin-bottom: ${typo.sectionMargin};
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    ">
      <div style="${isTwoColumn ? `display:grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: ${typo.rowGap};` : `display:flex; flex-direction:column; gap:${typo.rowGap};`}">
        ${contentHtml}
      </div>
    </div>
  `;
}

// ── HEADER ──
function renderHeader(fd, greeting, theme) {
  const customGreetingText = fd.customGreeting || greeting || '|| श्री गणेशाय नमः ||';
  const customTitleText = fd.customTitle || 'BIODATA';
  const typo = getTypographyStyles();

  return `
    <header style="text-align:center; margin-bottom:6px; position:relative;">
      ${customGreetingText ? `
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:2px;">
          <div style="height:1px; flex:1; max-width:70px; background:linear-gradient(to right, transparent, ${theme.accent});"></div>
          <div class="editable-text" 
               style="font-family:var(--font-hindi); color:${theme.primary}; font-size:14px; font-weight:700; outline:none; letter-spacing:0.5px; padding:0 4px;"
               contenteditable="true"
               oninput="updateFieldInline('customGreeting', this.innerText)"
               title="Click to Edit Greeting">
            ${customGreetingText}
          </div>
          <div style="height:1px; flex:1; max-width:70px; background:linear-gradient(to left, transparent, ${theme.accent});"></div>
        </div>
      ` : ''}

      <h1 class="editable-text" 
          style="font-family:var(--font-display); font-size:${typo.titleSize}; color:${theme.primary}; text-transform:uppercase; letter-spacing:2.5px; margin:0; outline:none; line-height:1.15; padding:0 4px;"
          contenteditable="true"
          oninput="updateFieldInline('customTitle', this.innerText)"
          title="Click to Edit Title">
        ${customTitleText}
      </h1>

      <div style="display:flex; align-items:center; justify-content:center; gap:5px; margin-top:2px;">
        <div style="width:24px; height:1.5px; background:${theme.accent};"></div>
        <span style="color:${theme.accent}; font-size:8px;">❖</span>
        <div style="width:24px; height:1.5px; background:${theme.accent};"></div>
      </div>
    </header>
  `;
}

// ── PERSONAL SECTION ──
function renderPersonalSection(fd, theme, bannerStyle) {
  const isHidden = state.hiddenSections.includes('personal');
  if (isHidden) return '';
  const typo = getTypographyStyles();
  const cardBg = getCardBackground(theme);

  const allFields = [
    { label: 'Full Name', val: fd.fullName, key: 'fullName', isHighlight: true },
    { label: 'Marital Status', val: fd.maritalStatus, key: 'maritalStatus' },
    { label: 'Date of Birth', val: fd.dob ? `${formatDisplayDate(fd.dob)}${calculateAge(fd.dob) ? ` (${calculateAge(fd.dob)} Yrs)` : ''}` : '', key: 'dob' },
    { label: 'Time of Birth', val: fd.timeOfBirth, key: 'timeOfBirth' },
    { label: 'Place of Birth', val: fd.placeOfBirth, key: 'placeOfBirth' },
    { label: 'Height', val: fd.height, key: 'height' },
    { label: 'Complexion', val: fd.complexion, key: 'complexion' },
    { label: 'Blood Group', val: fd.bloodGroup, key: 'bloodGroup' },
    { label: 'Diet', val: fd.diet, key: 'diet' },
    { label: 'Smoke/Drink', val: fd.smokingDrinking, key: 'smokingDrinking' },
    { label: 'Manglik', val: fd.manglik, key: 'manglik' },
    { label: 'Differently Abled', val: fd.differentlyAbled === 'Yes' ? `Yes ${fd.differentlyAbledDesc ? `(${fd.differentlyAbledDesc})` : ''}` : (fd.differentlyAbled === 'No' ? 'No' : ''), key: 'differentlyAbled' }
  ];

  const renderedItems = allFields.map(f => renderFieldItem(f.label, f.val, f.key, 'personal', theme, false, f.isHighlight)).filter(Boolean);
  const extraItems = (state.extraFields?.personal || []).map((f, idx) => renderExtraFieldItem(f, idx, 'personal', theme));
  const combinedItems = [...renderedItems, ...extraItems];

  if (combinedItems.length === 0 && !state.profilePhoto) return '';

  const headerHtml = renderSectionHeader('Personal Information', theme, '👤', bannerStyle, 'personal');

  if (state.profilePhoto) {
    const ds = state.designSettings || {};
    const photoFrame = ds.photoFrame || ds.photoShape || state.photoShape || 'royalArch';
    const photoSize = ds.photoSize || 'normal';
    const photoPos = ds.photoPosition || 'center top';

    const isRound = (photoFrame === 'royalOval' || photoFrame === 'oval' || photoFrame === 'kundanCircle');
    
    let photoWidth = '35mm';
    let photoHeight = '46mm';
    let besideCount = 5;

    if (photoSize === 'compact') {
      photoWidth = isRound ? '34mm' : '30mm';
      photoHeight = isRound ? '34mm' : '39mm';
      besideCount = 4;
    } else if (photoSize === 'normal') {
      photoWidth = isRound ? '40mm' : '35mm';
      photoHeight = isRound ? '40mm' : '46mm';
      besideCount = 5;
    } else if (photoSize === 'large') {
      photoWidth = isRound ? '46mm' : '41mm';
      photoHeight = isRound ? '46mm' : '54mm';
      besideCount = 6;
    } else if (photoSize === 'grand') {
      photoWidth = isRound ? '52mm' : '47mm';
      photoHeight = isRound ? '52mm' : '62mm';
      besideCount = 7;
    }

    const besideItems = combinedItems.slice(0, besideCount);
    const belowItems = combinedItems.slice(besideCount);

    const cornerDecorations = photoFrame === 'goldRect' ? `
      <div style="position:absolute; top:2px; left:2px; color:#C9962C; font-size:9px; line-height:1; pointer-events:none; z-index:3;">⚜</div>
      <div style="position:absolute; top:2px; right:2px; color:#C9962C; font-size:9px; line-height:1; pointer-events:none; z-index:3;">⚜</div>
      <div style="position:absolute; bottom:2px; left:2px; color:#C9962C; font-size:9px; line-height:1; pointer-events:none; z-index:3;">⚜</div>
      <div style="position:absolute; bottom:2px; right:2px; color:#C9962C; font-size:9px; line-height:1; pointer-events:none; z-index:3;">⚜</div>
    ` : '';

    return `
      <section style="margin-bottom:${typo.sectionMargin};">
        ${headerHtml}
        <div style="
          background: ${cardBg};
          border: 1.2px solid ${theme.accent}45;
          border-radius: 4px;
          padding: ${typo.cardPadding};
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        ">
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div style="flex:1; display:flex; flex-direction:column; gap:${typo.rowGap}; min-width:0;">
              ${besideItems.join('')}
            </div>
            <div class="royal-frame-wrapper" 
                 onclick="changeProfilePhoto()" 
                 ondragover="event.preventDefault();"
                 ondrop="handlePhotoDrop(event)"
                 title="Click or Drag & Drop photo here (Ultra-HD)"
                 style="flex-shrink:0;">
              <div class="royal-frame frame-${photoFrame}" style="width:${photoWidth}; height:${photoHeight};">
                <img src="${state.profilePhoto}" 
                     class="royal-photo-img" 
                     style="object-position:${photoPos};" 
                     alt="${state.formData.fullName || 'Candidate'}"
                     draggable="false">
                ${cornerDecorations}
              </div>
              <div class="photo-hover-badge">Change Photo</div>
            </div>
          </div>
          ${belowItems.length > 0 ? `
            <div style="display:grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: ${typo.rowGap}; margin-top:5px; padding-top:5px; border-top:1px dashed ${theme.border}40;">
              ${belowItems.join('')}
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }

  // Without Photo: 2 columns across full width!
  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${headerHtml}
      ${renderSectionCard(combinedItems.join(''), theme, true)}
    </section>
  `;
}

// ── EDUCATION SECTION ──
function renderEducationSection(fd, theme, bannerStyle) {
  const isHidden = state.hiddenSections.includes('education');
  if (isHidden) return '';
  const typo = getTypographyStyles();

  const eduFields = [
    { label: 'Qualification', val: fd.qualification, key: 'qualification' },
    { label: 'Profession', val: fd.profession, key: 'profession' },
    { label: 'Employer', val: fd.employer, key: 'employer' },
    { label: 'Annual Income', val: fd.annualIncome, key: 'annualIncome' },
    { label: 'Working City', val: fd.workingCity, key: 'workingCity' },
    { label: 'Additional Degrees', val: fd.additionalDegrees, key: 'additionalDegrees' },
    { label: 'Assets', val: (fd.assets || []).join(', '), key: 'assets', span2: true }
  ];

  const renderedItems = eduFields.map(f => renderFieldItem(f.label, f.val, f.key, 'education', theme, f.span2)).filter(Boolean);
  const extraItems = (state.extraFields?.education || []).map((f, idx) => renderExtraFieldItem(f, idx, 'education', theme));
  const combinedItems = [...renderedItems, ...extraItems];
  if (combinedItems.length === 0) return '';

  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${renderSectionHeader('Education & Career', theme, '🎓', bannerStyle, 'education')}
      ${renderSectionCard(combinedItems.join(''), theme, true)}
    </section>
  `;
}

// ── FAMILY SECTION ──
function renderFamilySection(fd, theme, bannerStyle) {
  const isHidden = state.hiddenSections.includes('family');
  if (isHidden) return '';
  const typo = getTypographyStyles();

  const familyFields = [
    { label: "Father's Name", val: fd.fatherName, key: 'fatherName' },
    { label: "Father's Occ.", val: fd.fatherOccupation, key: 'fatherOccupation' },
    { label: "Mother's Name", val: fd.motherName, key: 'motherName' },
    { label: "Mother's Occ.", val: fd.motherOccupation, key: 'motherOccupation' },
    { label: 'Brothers', val: fd.brothers, key: 'brothers' },
    { label: 'Sisters', val: fd.sisters, key: 'sisters' },
    { label: 'Dada Gotra (Self)', val: fd.gotraDada || fd.gotra, key: 'gotraDada' },
    { label: 'Nana Gotra (Nanihal)', val: fd.gotraNana, key: 'gotraNana' },
    { label: 'Dadi Gotra', val: fd.gotraDadi, key: 'gotraDadi' },
    { label: 'Nani Gotra', val: fd.gotraNani, key: 'gotraNani' },
    { label: 'Additional Gotra', val: fd.gotraExtra, key: 'gotraExtra' },
    { label: 'Sub-caste', val: fd.subCaste, key: 'subCaste' },
    { label: 'Family Status', val: fd.familyStatus, key: 'familyStatus' },
    { label: 'Family Type', val: fd.familyType ? (fd.familyValues ? `${fd.familyType} (${fd.familyValues})` : fd.familyType) : fd.familyValues, key: 'familyType' },
    { label: 'Native Place', val: fd.nativePlace, key: 'nativePlace' },
    { label: 'Maternal Uncle', val: fd.maternalUncle, key: 'maternalUncle' }
  ];

  const renderedItems = familyFields.map(f => renderFieldItem(f.label, f.val, f.key, 'family', theme, false)).filter(Boolean);
  const extraItems = (state.extraFields?.family || []).map((f, idx) => renderExtraFieldItem(f, idx, 'family', theme));
  const combinedItems = [...renderedItems, ...extraItems];
  if (combinedItems.length === 0) return '';

  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${renderSectionHeader('Family Background', theme, '🏡', bannerStyle, 'family')}
      ${renderSectionCard(combinedItems.join(''), theme, true)}
    </section>
  `;
}

// ── HOROSCOPE SECTION ──
function renderHoroscopeSection(fd, theme, bannerStyle) {
  const isHidden = state.hiddenSections.includes('horoscope');
  if (isHidden) return '';
  const typo = getTypographyStyles();

  const horoscopeFields = [
    { label: 'Rashi', val: fd.rashi, key: 'rashi' },
    { label: 'Nakshatra', val: fd.nakshatra, key: 'nakshatra' },
    { label: 'Gan', val: fd.gan, key: 'gan' },
    { label: 'Nadi', val: fd.nadi, key: 'nadi' },
    { label: 'Charan', val: fd.charan, key: 'charan' }
  ];

  const renderedItems = horoscopeFields.map(f => renderFieldItem(f.label, f.val, f.key, 'horoscope', theme, false)).filter(Boolean);
  const extraItems = (state.extraFields?.horoscope || []).map((f, idx) => renderExtraFieldItem(f, idx, 'horoscope', theme));
  const combinedItems = [...renderedItems, ...extraItems];
  if (combinedItems.length === 0) return '';

  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${renderSectionHeader('Horoscope Details', theme, '🪐', bannerStyle, 'horoscope')}
      ${renderSectionCard(combinedItems.join(''), theme, true)}
    </section>
  `;
}

// ── EXPECTATIONS SECTION ──
function renderExpectationsSection(fd, theme, bannerStyle) {
  const isHidden = state.hiddenSections.includes('expectations');
  if (isHidden) return '';
  const typo = getTypographyStyles();

  const expFields = [
    { label: 'Age Range', val: (fd.partnerAgeMin && fd.partnerAgeMax) ? `${fd.partnerAgeMin} to ${fd.partnerAgeMax} Years` : (fd.partnerAgeMin || fd.partnerAgeMax || ''), key: 'partnerAgeMin' },
    { label: 'Qualification', val: fd.partnerQualification, key: 'partnerQualification' },
    { label: 'Profession', val: fd.partnerProfession, key: 'partnerProfession' },
    { label: 'Location', val: fd.locationPreference, key: 'locationPreference' },
    { label: 'Other', val: fd.otherExpectations, key: 'otherExpectations', span2: true }
  ];

  const renderedItems = expFields.map(f => renderFieldItem(f.label, f.val, f.key, 'expectations', theme, f.span2)).filter(Boolean);
  const extraItems = (state.extraFields?.expectations || []).map((f, idx) => renderExtraFieldItem(f, idx, 'expectations', theme));
  const combinedItems = [...renderedItems, ...extraItems];
  if (combinedItems.length === 0) return '';

  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${renderSectionHeader('Partner Expectations', theme, '✨', bannerStyle, 'expectations')}
      ${renderSectionCard(combinedItems.join(''), theme, true)}
    </section>
  `;
}

// ── CONTACT SECTION ──
function renderContactSection(fd, theme, bannerStyle) {
  const isHidden = state.hiddenSections.includes('contact');
  if (isHidden) return '';
  const typo = getTypographyStyles();
  const cardBg = getCardBackground(theme);

  const contactFields = [
    { label: 'Point of Contact', val: fd.contactPerson, key: 'contactPerson' },
    { label: 'Phone Number', val: fd.contactNumber, key: 'contactNumber' },
    { label: 'WhatsApp', val: fd.whatsappNumber, key: 'whatsappNumber' },
    { label: 'Email Address', val: fd.contactEmail, key: 'contactEmail' }
  ];

  const renderedItems = contactFields.map(f => renderFieldItem(f.label, f.val, f.key, 'contact', theme, false)).filter(Boolean);
  const extraItems = (state.extraFields?.contact || []).map((f, idx) => renderExtraFieldItem(f, idx, 'contact', theme));
  const combinedItems = [...renderedItems, ...extraItems];
  if (combinedItems.length === 0) return '';

  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${renderSectionHeader('Contact Details', theme, '📞', bannerStyle, 'contact')}
      <div style="
        background: ${cardBg};
        border: 1.5px solid ${theme.accent};
        border-radius: 4px;
        padding: ${typo.cardPadding};
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      ">
        <div style="display:grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: ${typo.rowGap};">
          ${combinedItems.join('')}
        </div>
        ${fd.familyConsent ? `
          <div style="margin-top:4px; padding-top:2px; border-top:1px dashed ${theme.accent}55; font-size:${typo.labelSize}; color:${theme.text}99; font-style:italic; text-align:center;">
            * Profile shared with family consent.
          </div>
        ` : ''}
      </div>
    </section>
  `;
}

// ── CUSTOM SECTION RENDERER ──
function renderCustomSection(cs, theme, bannerStyle) {
  if (!cs || state.hiddenSections.includes(cs.id)) return '';
  const fields = cs.fields || [];
  if (fields.length === 0) return '';
  const typo = getTypographyStyles();

  const renderedItems = fields.map((f, idx) => `
    <div style="display:flex; align-items:baseline; font-size:${typo.valueSize}; line-height:1.35; min-width:0;">
      <div class="editable-text" 
           style="width:${(105 * typo.scale).toFixed(0)}px; min-width:${(105 * typo.scale).toFixed(0)}px; font-weight:${typo.labelWeight}; color:${theme.primary}; font-size:${typo.labelSize}; outline:none; border-radius:3px; padding:0 2px;"
           contenteditable="true"
           oninput="updateCustomFieldLabel('${cs.id}', ${idx}, this.innerText)"
           title="Click to Edit Label">${f.label}</div>
      <div style="width:12px; text-align:center; color:${theme.accent}; font-weight:800; font-size:${typo.colonSize};">:</div>
      <div class="editable-text" 
           style="flex:1; color:${theme.text}; font-weight:${typo.valueWeight}; font-style:${typo.valueStyle}; font-size:${typo.valueSize}; min-height:1.15em; outline:none; border-radius:3px; padding:0 2px; word-break:break-word;"
           contenteditable="true"
           oninput="updateCustomFieldValue('${cs.id}', ${idx}, this.innerText)"
           title="Click to Edit Value">${f.value || ''}</div>
    </div>
  `).join('');

  return `
    <section style="margin-bottom:${typo.sectionMargin};">
      ${renderSectionHeader(cs.title, theme, '✦', bannerStyle, cs.id)}
      ${renderSectionCard(renderedItems, theme, true)}
    </section>
  `;
}

// ── FAMILY PHOTO SECTION ──
function renderFamilyPhotoSection(theme) {
  if (!state.familyPhoto || !state.showFamilyPhoto) return '';
  return `
    <section style="text-align:center; margin-bottom:6px; cursor:pointer;" onclick="changeFamilyPhoto()" title="Click to Change Photo">
      <img src="${state.familyPhoto}" style="max-height:30mm; width:auto; max-width:70%; object-fit:cover; border-radius:4px; border:1.5px solid ${theme.border}; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
    </section>
  `;
}

// ── FOOTER ──
function renderFooter(theme) {
  return `
    <footer style="text-align:center; font-size:9.5px; color:${theme.text}88; border-top:1px solid ${theme.accent}44; padding-top:4px; margin-top:auto;">
      Created via Bio Data Maker
    </footer>
  `;
}

// ── STANDARD TEMPLATE (BALANCED CLASSIC) ──
function renderStandard(fd, sections, theme) {
  const greeting = fd.communityGreeting ? (COMMUNITY_GREETINGS[fd.community] || '') : '';
  const designSettings = state.designSettings || { bannerStyle: 'royal', borderStyle: 'ornate' };
  const bannerStyle = designSettings.bannerStyle || 'royal';
  const borderStyle = designSettings.borderStyle || 'ornate';

  const sectionMap = {
    header: () => renderHeader(fd, greeting, theme),
    personal: () => renderPersonalSection(fd, theme, bannerStyle),
    education: () => renderEducationSection(fd, theme, bannerStyle),
    family: () => renderFamilySection(fd, theme, bannerStyle),
    horoscope: () => renderHoroscopeSection(fd, theme, bannerStyle),
    expectations: () => renderExpectationsSection(fd, theme, bannerStyle),
    contact: () => renderContactSection(fd, theme, bannerStyle),
    familyPhoto: () => renderFamilyPhotoSection(theme)
  };

  const borderStyles = {
    ornate: `border: 3.5px double ${theme.accent}; outline: 1px solid ${theme.border}88; outline-offset: -5px;`,
    classic: `border: 2px solid ${theme.accent}; outline: 1px solid ${theme.border}66; outline-offset: -4px;`,
    minimal: `border: 1.5px solid ${theme.accent};`
  };

  return `
    <div class="std-layout" style="
      font-family:var(--font-body);
      padding: 8mm 11mm 5mm 11mm;
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      ${borderStyles[borderStyle] || borderStyles.ornate}
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${theme.background};
    ">
      ${borderStyle === 'ornate' ? renderCornerOrnaments(theme.accent) : ''}
      
      <div class="std-content" style="display:flex; flex-direction:column; flex:1; min-height:0; justify-content:flex-start;">
        ${sections.map(sid => {
          if (sectionMap[sid]) return sectionMap[sid]();
          if (sid.startsWith('custom_')) {
            const cs = (state.customSections || []).find(s => s.id === sid);
            if (cs) return renderCustomSection(cs, theme, bannerStyle);
          }
          return '';
        }).join('')}
      </div>

      ${renderFooter(theme)}
    </div>
  `;
}

function renderModernMinimal(fd, sections, theme) {
  const origSettings = state.designSettings || {};
  state.designSettings = { ...origSettings, bannerStyle: 'minimal', borderStyle: 'minimal' };
  const html = renderStandard(fd, sections, theme);
  state.designSettings = origSettings;
  return html;
}

function renderCorporate(fd, sections, theme) {
  const origSettings = state.designSettings || {};
  state.designSettings = { ...origSettings, bannerStyle: 'ribbon', borderStyle: 'classic' };
  const html = renderStandard(fd, sections, theme);
  state.designSettings = origSettings;
  return html;
}

function renderFieldGroup(sectionId, fields, theme) {
  return fields.filter(f => {
    const val = f[1];
    const key = f[3];
    const isHidden = (state.hiddenFields || []).includes(`${sectionId}.${key}`);
    return val && !isHidden;
  }).map(f => `
    <div style="display:flex; margin-bottom:4px; font-size:12px; line-height:1.35;">
      <div style="width:110px; font-weight:700; color:${theme.primary};">${f[0]}</div>
      <div style="width:14px; text-align:center; color:${theme.accent}; font-weight:800;">:</div>
      <div class="editable-text" 
           style="flex:1; color:${theme.text}; min-height:1em; outline:none; border-radius:3px; padding:0 3px; ${f[2] ? `font-weight:700; color:${theme.primary}; font-size:13px;` : ''}" 
           contenteditable="true"
           oninput="updateFieldInline('${f[3]}', this.innerText)"
           onblur="renderBiodata()"
           title="Click to Edit">
        ${f[1]}
      </div>
    </div>
  `).join('');
}


// ── EXPORT PDF & PRINT (FULL BIO DATA, ZERO CLIPPING, ULTRA-HD) ──
async function exportPDF() {
  const paper = document.getElementById('biodata-paper');
  if (!paper) return;

  const prevTransform = paper.style.transform;
  const prevOverflow = paper.style.overflow;
  const prevMaxHeight = paper.style.maxHeight;
  const prevHeight = paper.style.height;
  const prevBoxShadow = paper.style.boxShadow;
  
  const canvasArea = document.querySelector('.canvas-area');
  const prevScrollTop = canvasArea ? canvasArea.scrollTop : 0;
  if (canvasArea) canvasArea.scrollTop = 0;
  window.scrollTo(0, 0);

  // Allow paper to expand fully so no section at the bottom is cut off!
  paper.style.transform = 'none';
  paper.style.boxShadow = 'none';
  paper.style.overflow = 'visible';
  paper.style.maxHeight = 'none';

  // Check height
  const scrollH = paper.scrollHeight;
  const a4PixelsAt96Dpi = 1122.5; // 297mm in CSS px
  
  // If slightly taller than 1 page (up to ~18% over), auto-fit to 1 page so it never splits or clips!
  if (scrollH > a4PixelsAt96Dpi && scrollH < a4PixelsAt96Dpi * 1.25) {
    const autoFitScale = (a4PixelsAt96Dpi / scrollH) * 0.985;
    paper.style.transform = `scale(${autoFitScale})`;
    paper.style.transformOrigin = 'top center';
    paper.style.height = `${a4PixelsAt96Dpi}px`;
  } else if (scrollH <= a4PixelsAt96Dpi) {
    paper.style.height = '297mm';
  } else {
    // Multi-page: full height
    paper.style.height = 'auto';
  }

  showToast('Generating Ultra-HD PDF...');

  const fullName = (state.formData && state.formData.fullName) ? state.formData.fullName.trim() : 'Personal';
  const cleanFilename = `Biodata_${fullName.replace(/\s+/g, '_')}.pdf`;

  const opt = {
    margin: [0, 0, 0, 0],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.99 },
    html2canvas: {
      scale: 3.2, // 300+ DPI photographic print resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794 // Exact A4 width at 96 DPI
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(paper).save();
    showToast('✅ Whole Biodata PDF Downloaded!');
  } catch (err) {
    console.error('PDF generation error:', err);
    showToast('Download error. Opening Print dialog...', 'error');
    window.print();
  } finally {
    paper.style.transform = prevTransform;
    paper.style.overflow = prevOverflow;
    paper.style.maxHeight = prevMaxHeight;
    paper.style.height = prevHeight;
    paper.style.boxShadow = prevBoxShadow;
    if (canvasArea) canvasArea.scrollTop = prevScrollTop;
  }
}

function printVectorPDF() {
  showToast('Opening 100% Crisp Vector Print...');
  setTimeout(() => {
    window.print();
  }, 200);
}

window.exportPDF = exportPDF;
window.printVectorPDF = printVectorPDF;

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
const cardBgInput = document.getElementById('cardBgColor');
if (cardBgInput) {
  cardBgInput.addEventListener('input', e => {
    if (!state.designSettings) state.designSettings = {};
    state.designSettings.customCardBg = e.target.value;
    state.designSettings.cardTint = 'custom';
    saveNow(state);
    updateDesignButtons();
    renderBiodata();
  });
}

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
  handleHighResPhotoUpload(file, activePhotoRole || 'profile');
});

// ── ULTRA-HD PHOTO PROCESSING & DRAG AND DROP ──
function handleHighResPhotoUpload(file, role = 'profile') {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image (JPG, PNG, WebP)', 'error');
    return;
  }
  showToast('Processing Ultra-HD photo...');

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxDim = 2400; // Crisp photographic resolution for print
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        applyPhotoToState(canvas.toDataURL('image/jpeg', 0.96), role);
      } else {
        // Full uncompressed data URL
        applyPhotoToState(e.target.result, role);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function applyPhotoToState(dataUrl, role = 'profile') {
  if (role === 'profile') {
    state.profilePhoto = dataUrl;
  } else {
    state.familyPhoto = dataUrl;
    state.showFamilyPhoto = true;
  }
  saveNow(state);
  renderBiodata();
  renderSectionList();
  showToast(`✨ ${role === 'profile' ? 'Profile' : 'Family'} photo updated in Ultra-HD!`);
}

function handlePhotoDrop(e, role = 'profile') {
  e.preventDefault();
  e.stopPropagation();
  const dt = e.dataTransfer;
  if (dt && dt.files && dt.files.length > 0) {
    handleHighResPhotoUpload(dt.files[0], role);
  }
}

function initPhotoDragAndDrop() {
  const paper = document.getElementById('biodata-paper');
  const dropzone = document.getElementById('photoDropZone');

  [paper, dropzone].filter(Boolean).forEach(el => {
    ['dragenter', 'dragover'].forEach(name => {
      el.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add(el === paper ? 'photo-drag-over' : 'drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(name => {
      el.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove(el === paper ? 'photo-drag-over' : 'drag-active');
      }, false);
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove(el === paper ? 'photo-drag-over' : 'drag-active');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleHighResPhotoUpload(dt.files[0], 'profile');
      }
    });
  });
}

window.handlePhotoDrop = handlePhotoDrop;
window.handleHighResPhotoUpload = handleHighResPhotoUpload;
window.changeProfilePhoto = changeProfilePhoto;
window.changeFamilyPhoto = changeFamilyPhoto;

initEditorUI();

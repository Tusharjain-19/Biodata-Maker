// TEMPLATES PAGE LOGIC
let state = loadState() || JSON.parse(JSON.stringify(DEFAULT_STATE));

function renderThemes() {
  const grid = document.getElementById('themeGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(THEMES).map(([id, theme]) => `
    <div class="theme-pill ${state.selectedTheme === id ? 'active' : ''}" onclick="selectTheme('${id}')">
      <div class="theme-swatch" style="background:${theme.primary}"></div>
      <span class="theme-name">${theme.name}</span>
    </div>
  `).join('');
  updateBottomBar();
}

function renderTemplates() {
  const grid = document.getElementById('templateGrid');
  if (!grid) return;
  grid.innerHTML = TEMPLATES_CONFIG.map(t => `
    <div class="theme-pill ${state.selectedTemplate === t.id ? 'active' : ''}" style="padding: 14px 24px;" onclick="selectTemplate('${t.id}')">
      <span class="theme-name" style="font-size:15px;">${t.name}</span>
    </div>
  `).join('');
  updateBottomBar();
}

function selectTheme(id) {
  state.selectedTheme = id;
  saveNow(state);
  renderThemes();
}

function selectTemplate(id) {
  state.selectedTemplate = id;
  saveNow(state);
  renderTemplates();
}

function updateBottomBar() {
  const bar = document.getElementById('bottomBar');
  const preview = document.getElementById('selPreviewColor');
  const text = document.getElementById('selText');
  
  if (state.selectedTemplate && state.selectedTheme) {
    const theme = THEMES[state.selectedTheme];
    const template = TEMPLATES_CONFIG.find(t => t.id === state.selectedTemplate);
    bar.classList.add('show');
    preview.style.background = theme.primary;
    text.innerHTML = `Selected: <strong>${template.name}</strong> with <strong>${theme.name}</strong> palette`;
  }
}

function proceedToEditor() {
  saveNow(state);
  window.location.href = 'editor.html';
}

// Initial render
renderThemes();
renderTemplates();

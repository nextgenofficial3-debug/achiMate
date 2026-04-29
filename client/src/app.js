const state = {
  queue: read('achimate_queue', []),
  library: read('achimate_lib', []),
  recent: read('achimate_recent', []),
  settings: read('achimate_settings', { autoQueue: true, proxyPreview: true }),
  activeResult: null,
  installPrompt: null
};

const els = {
  form: document.getElementById('analyze-form'),
  url: document.getElementById('url-input'),
  type: document.getElementById('type-select'),
  quality: document.getElementById('quality-select'),
  status: document.getElementById('status'),
  analyze: document.getElementById('analyze-btn'),
  preview: document.getElementById('preview-body'),
  previewSubtitle: document.getElementById('preview-subtitle'),
  recent: document.getElementById('recent-list'),
  queue: document.getElementById('queue-list'),
  library: document.getElementById('library-list'),
  queueCount: document.getElementById('queue-count'),
  install: document.getElementById('install-btn')
};

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function persist() {
  localStorage.setItem('achimate_queue', JSON.stringify(state.queue));
  localStorage.setItem('achimate_lib', JSON.stringify(state.library));
  localStorage.setItem('achimate_recent', JSON.stringify(state.recent));
  localStorage.setItem('achimate_settings', JSON.stringify(state.settings));
  render();
}

function apiDownload(url) {
  return `/api/media/download?url=${encodeURIComponent(url)}`;
}

function apiStream(url) {
  return `/api/media/stream?url=${encodeURIComponent(url)}`;
}

function toast(message) {
  const el = document.createElement('div');
  el.textContent = message;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function setStatus(message, error = false) {
  els.status.textContent = message;
  els.status.className = `status show ${error ? 'error' : ''}`;
}

function clearStatus() {
  els.status.className = 'status';
  els.status.textContent = '';
}

async function analyze(event) {
  event.preventDefault();
  const url = els.url.value.trim();
  if (!url) return;
  els.analyze.disabled = true;
  els.analyze.textContent = 'Analyzing...';
  setStatus('Analyzing URL and preparing media options...');
  try {
    const res = await fetch('/api/media/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, preferredType: els.type.value, quality: els.quality.value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Unable to analyze this link.');
    const options = data.options.map(option => ({
      ...option,
      sourceUrl: data.sourceUrl,
      sourceTitle: data.title,
      status: 'ready',
      progress: 100,
      queuedAt: Date.now()
    }));
    state.activeResult = { ...data, options };
    state.recent = [{ ...data, options }, ...state.recent.filter(item => item.sourceUrl !== data.sourceUrl)].slice(0, 10);
    if (state.settings.autoQueue) addManyToQueue(options);
    els.url.value = '';
    clearStatus();
    renderPreview(state.activeResult);
    persist();
    showPage('home');
    toast(`${options.length} media option${options.length === 1 ? '' : 's'} ready.`);
  } catch (error) {
    setStatus(error.message, true);
    toast(error.message);
  } finally {
    els.analyze.disabled = false;
    els.analyze.textContent = 'Analyze & Prepare';
  }
}

function addManyToQueue(items) {
  const seen = new Set(state.queue.map(item => item.url));
  state.queue = [...items.filter(item => !seen.has(item.url)), ...state.queue].slice(0, 80);
}

function addLibrary(item) {
  if (!state.library.some(existing => existing.url === item.url)) {
    state.library = [{ ...item, savedAt: Date.now() }, ...state.library].slice(0, 120);
    persist();
  }
}

function renderPreview(result) {
  const item = result?.options?.[0];
  if (!item) {
    els.preview.innerHTML = '<div class="empty">No media selected yet.</div>';
    return;
  }
  const src = state.settings.proxyPreview ? apiStream(item.url) : item.url;
  const media = item.type === 'video'
    ? `<video class="preview-media" src="${src}" controls playsinline></video>`
    : item.type === 'audio'
      ? `<audio class="preview-media" src="${src}" controls></audio>`
      : `<img class="preview-media" src="${src}" alt="${esc(item.title || item.filename)}">`;
  els.previewSubtitle.textContent = result.title || 'Prepared media';
  els.preview.innerHTML = `
    <div class="preview-panel">
      ${media}
      <div class="preview-meta">
        <strong>${esc(item.title || item.filename)}</strong>
        <div class="chips"><span class="chip active">${esc(item.type)}</span><span class="chip">${esc(item.format || 'source')}</span><span class="chip">${esc(item.quality || 'source')}</span></div>
        <div class="item-actions">
          <a class="btn primary" data-download="${esc(item.url)}" href="${apiDownload(item.url)}">⇩ Download</a>
          <button class="btn" data-save="${esc(item.url)}">Save to Library</button>
        </div>
      </div>
    </div>`;
}

function itemHtml(item) {
  return `<div class="item" data-url="${esc(item.url)}">
    <div class="thumb ${esc(item.type)}">${item.type === 'audio' ? '♪' : item.type === 'image' ? '▧' : '▶'}</div>
    <div>
      <h4>${esc(item.title || item.filename || 'Media')}</h4>
      <p>${esc(item.type)} · ${esc(item.format || 'source')} · ${esc(item.quality || 'source')}</p>
      <div class="bar"><span style="width:${item.progress || 100}%"></span></div>
    </div>
    <div class="item-actions">
      <button class="btn icon-only" data-preview="${esc(item.url)}" title="Preview">▶</button>
      <a class="btn icon-only" data-download="${esc(item.url)}" href="${apiDownload(item.url)}" title="Download">⇩</a>
      <button class="btn icon-only" data-save="${esc(item.url)}" title="Save">＋</button>
    </div>
  </div>`;
}

function bindActions(root) {
  root.querySelectorAll('[data-preview]').forEach(button => {
    button.addEventListener('click', () => {
      const item = findItem(button.dataset.preview);
      if (item) {
        renderPreview({ title: item.sourceTitle || item.title, options: [item] });
        showPage('home');
      }
    });
  });
  root.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => {
    const item = findItem(button.dataset.save);
    if (item) {
      addLibrary(item);
      toast('Saved to library.');
    }
  }));
  root.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', () => {
    const item = findItem(link.dataset.download);
    if (item) addLibrary(item);
  }));
}

function findItem(url) {
  return [...state.queue, ...state.library, ...state.recent.flatMap(result => result.options || [])].find(item => item.url === url);
}

function render() {
  els.queueCount.textContent = `${state.queue.length} queued`;
  els.queue.innerHTML = state.queue.length ? state.queue.map(itemHtml).join('') : '<div class="empty">No downloads prepared yet.</div>';
  els.library.innerHTML = state.library.length ? state.library.map(itemHtml).join('') : '<div class="empty">Library is empty.</div>';
  const recent = state.recent.flatMap(result => result.options || []).slice(0, 5);
  els.recent.innerHTML = recent.length ? recent.map(itemHtml).join('') : '<div class="empty">Paste a URL to get started.</div>';
  document.querySelectorAll('[data-setting]').forEach(button => button.classList.toggle('on', Boolean(state.settings[button.dataset.setting])));
  [els.queue, els.library, els.recent, els.preview].forEach(bindActions);
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(section => section.classList.toggle('active', section.id === page));
  document.querySelectorAll('.nav').forEach(button => button.classList.toggle('active', button.dataset.page === page));
}

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

els.form.addEventListener('submit', analyze);
document.getElementById('paste-btn').addEventListener('click', async () => {
  try { els.url.value = await navigator.clipboard.readText(); }
  catch { toast('Clipboard permission was not available.'); }
});
document.querySelectorAll('.quick').forEach(button => button.addEventListener('click', () => {
  els.type.value = button.dataset.type;
  els.url.focus();
}));
document.querySelectorAll('.nav').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
document.getElementById('clear-queue').addEventListener('click', () => { state.queue = []; persist(); });
document.getElementById('clear-library').addEventListener('click', () => { state.library = []; persist(); });
document.getElementById('export-library').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state.library, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'achimate-library.json';
  link.click();
});
document.querySelectorAll('[data-setting]').forEach(button => button.addEventListener('click', () => {
  state.settings[button.dataset.setting] = !state.settings[button.dataset.setting];
  persist();
}));

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  state.installPrompt = event;
  els.install.disabled = false;
  els.install.textContent = 'Install AchiMate App';
});
window.addEventListener('appinstalled', () => {
  state.installPrompt = null;
  els.install.disabled = true;
  els.install.textContent = 'AchiMate is Installed';
});
els.install.addEventListener('click', async () => {
  if (!state.installPrompt) return;
  await state.installPrompt.prompt();
  state.installPrompt = null;
  els.install.disabled = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

render();

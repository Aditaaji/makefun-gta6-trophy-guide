// Leonida Trophy Guide: checklist saved in localStorage, with export/import,
// filters by grade/kind/status, a missable-only filter, and a spoiler setting
// that hides story trophies until they are earned. No network use at run time:
// the only fetch is the guide's own data file, data/trophies.json.
const STORAGE_KEY = 'leonida-trophy-guide-v1';
const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const statusEl = document.getElementById('status');
const missableEl = document.getElementById('missableOnly');
const spoilerEl = document.getElementById('spoilerToggle');
const resultLine = document.getElementById('resultLine');
const emptyNote = document.getElementById('emptyNote');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceLinks = doc.sources || {};

let saved = loadSaved();
let earned = new Set(saved.earned || []);
let spoilersHidden = saved.spoilersHidden !== false;

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...earned].sort(),
    spoilersHidden,
    savedAt: new Date().toISOString(),
  }));
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    platinum: 'Platinum', story: 'Story', side: 'Side quest', activity: 'Activity',
    collectible: 'Collectible', crime: 'Crime', exploration: 'Exploration',
    money: 'Money', misc: 'One-off',
  };
  return labels[kind] || kind;
}

function isSpoilerHidden(trophy) {
  return spoilersHidden && trophy.spoiler && !earned.has(trophy.name);
}

function trophyMatches(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${kindLabel(trophy.kind)}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (kindEl.value === 'online') return false;
  if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) return false;
  if (missableEl.checked && !trophy.missable) return false;
  const isEarned = earned.has(trophy.name);
  if (statusEl.value === 'earned' && !isEarned) return false;
  if (statusEl.value === 'remaining' && isEarned) return false;
  return true;
}

function renderSourceLinks() {
  const footer = document.getElementById('sourceLinks');
  footer.replaceChildren();
  for (const [name, url] of Object.entries(sourceLinks)) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = name;
    footer.append(a);
  }
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressLine').textContent = `${done} of ${total} earned · ${pct}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.name)) byGrade[t.grade].done += 1;
  }
  document.getElementById('gradeCounts').textContent =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => `${gradeLabel(g)} ${byGrade[g].done}/${byGrade[g].total}`)
      .join(' · ');
  for (let stage = 1; stage <= 5; stage += 1) {
    const inStage = trophies.filter((t) => t.stage === stage);
    const doneStage = inStage.filter((t) => earned.has(t.name)).length;
    const el = document.getElementById(`stageCount${stage}`);
    if (el) el.textContent = `${doneStage}/${inStage.length} earned`;
  }
}

function renderTrophy(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy';
  li.id = `trophy-${trophy.id}`;
  if (earned.has(trophy.name)) li.classList.add('earned');
  if (trophy.missable) li.classList.add('missable-flag');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveProgress();
    renderAll();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'trophy-title';
  const h3 = document.createElement('h3');
  if (isSpoilerHidden(trophy)) {
    h3.textContent = 'Hidden story trophy';
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = ` #${trophy.id} · hidden on PlayStation until earned`;
    h3.append(num);
  } else {
    h3.textContent = trophy.name;
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = ` #${trophy.id}`;
    h3.append(num);
  }
  title.append(h3);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isSpoilerHidden(trophy)
    ? 'Name and description hidden: turn off “Hide story spoilers” or earn this trophy to reveal it.'
    : `“${trophy.description}”`;
  title.append(desc);
  head.append(title);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = gradeLabel(trophy.grade);
  head.append(badge);
  li.append(head);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const tagKind = document.createElement('span');
  tagKind.className = 'tag';
  tagKind.textContent = kindLabel(trophy.kind);
  tags.append(tagKind);
  if (trophy.hidden) {
    const tagHidden = document.createElement('span');
    tagHidden.className = 'tag hidden-tag';
    tagHidden.textContent = 'Hidden on PS5';
    tags.append(tagHidden);
  }
  if (trophy.missable) {
    const tagMiss = document.createElement('span');
    tagMiss.className = 'tag missable';
    tagMiss.textContent = '⚠ Possibly missable';
    tags.append(tagMiss);
  }
  if (trophy.guide.startsWith('UNCONFIRMED:')) {
    const tagUnc = document.createElement('span');
    tagUnc.className = 'tag unconfirmed';
    tagUnc.textContent = 'Trigger unconfirmed';
    tags.append(tagUnc);
  }
  const tagStage = document.createElement('span');
  tagStage.className = 'tag';
  tagStage.textContent = `Roadmap stage ${trophy.stage}`;
  tags.append(tagStage);
  if (trophy.count) {
    const tagCount = document.createElement('span');
    tagCount.className = 'tag';
    tagCount.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
    tags.append(tagCount);
  }
  li.append(tags);

  if (isSpoilerHidden(trophy)) {
    const note = document.createElement('p');
    note.className = 'spoiler-hidden';
    note.textContent = 'Guide hidden with the spoiler setting. Tick the box once you have earned it to reveal the guide.';
    li.append(note);
  } else {
    const guide = document.createElement('p');
    guide.className = 'guide';
    if (trophy.guide.startsWith('UNCONFIRMED:')) {
      const lede = document.createElement('b');
      lede.className = 'unconfirmed-lede';
      lede.textContent = 'UNCONFIRMED: ';
      guide.append(lede);
      guide.append(trophy.guide.slice('UNCONFIRMED:'.length).trim());
    } else {
      guide.textContent = trophy.guide;
    }
    li.append(guide);

    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.append('Sources: ');
    (trophy.sources || []).forEach((name, i) => {
      if (i > 0) sources.append(' · ');
      const url = sourceLinks[name];
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = name;
        sources.append(a);
      } else {
        sources.append(name);
      }
    });
    li.append(sources);
  }
  return li;
}

function renderAll() {
  renderProgress();
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren(...shown.map(renderTrophy));
  emptyNote.hidden = shown.length > 0;
  const missableShown = shown.filter((t) => t.missable).length;
  resultLine.textContent = kindEl.value === 'online'
    ? 'Online trophies: none. All 55 GTA VI trophies are single-player.'
    : `Showing ${shown.length} of ${trophies.length} trophies` +
      (missableShown ? ` · ${missableShown} possibly missable` : '') +
      (spoilersHidden ? ' · story spoilers hidden until earned' : ' · story spoilers shown');
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const data = JSON.parse(await file.text());
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('No earned list found in that file.');
  const known = new Set(trophies.map((t) => t.name));
  earned = new Set(names.filter((n) => known.has(n)));
  saveProgress();
  renderAll();
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await importProgress(file);
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderAll();
});
for (const el of [searchEl, gradeEl, kindEl, statusEl, missableEl, spoilerEl]) {
  el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', renderAll);
}
spoilerEl.addEventListener('change', () => {
  spoilersHidden = spoilerEl.checked;
  saveProgress();
  renderAll();
});
spoilerEl.checked = spoilersHidden;

renderSourceLinks();
renderAll();

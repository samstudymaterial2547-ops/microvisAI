// ── Bacteria Data (mirrored from backend for UI rendering) ─────────────────────
const BACTERIA = [
  {
    name: "Staphylococcus aureus", family: "Staphylococcaceae",
    gram: "positive", color: "#4ade80",
    tags: ["gram +", "cocci", "aerobic"],
    clinical: "A leading cause of hospital-acquired infections. MRSA strains resist most beta-lactam antibiotics."
  },
  {
    name: "Escherichia coli", family: "Enterobacteriaceae",
    gram: "negative", color: "#f87171",
    tags: ["gram –", "rod", "facultative"],
    clinical: "Normally harmless in the gut; pathogenic strains cause food poisoning and UTIs globally."
  },
  {
    name: "Bacillus anthracis", family: "Bacillaceae",
    gram: "positive", color: "#fbbf24",
    tags: ["gram +", "rod", "spore-forming"],
    clinical: "Causative agent of anthrax. Forms endospores that can survive in soil for decades."
  },
  {
    name: "Mycobacterium tuberculosis", family: "Mycobacteriaceae",
    gram: "acid-fast", color: "#93c5fd",
    tags: ["acid-fast", "rod", "aerobic"],
    clinical: "Responsible for tuberculosis. Unique waxy cell wall makes it resistant to standard gram staining."
  },
  {
    name: "Streptococcus pyogenes", family: "Streptococcaceae",
    gram: "positive", color: "#c4b5fd",
    tags: ["gram +", "cocci", "beta-hemolytic"],
    clinical: "Group A Strep causing pharyngitis to necrotizing fasciitis. Complications include rheumatic fever."
  },
  {
    name: "Salmonella typhi", family: "Enterobacteriaceae",
    gram: "negative", color: "#f97316",
    tags: ["gram –", "rod", "motile"],
    clinical: "Causes typhoid fever. Transmitted via fecal-oral route through contaminated food and water."
  },
  {
    name: "Klebsiella pneumoniae", family: "Enterobacteriaceae",
    gram: "negative", color: "#34d399",
    tags: ["gram –", "rod", "encapsulated"],
    clinical: "Opportunistic pathogen with mucoid capsule. A major cause of nosocomial pneumonia."
  },
  {
    name: "Clostridium tetani", family: "Clostridiaceae",
    gram: "positive", color: "#e879f9",
    tags: ["gram +", "rod", "anaerobic"],
    clinical: "Produces tetanospasmin, blocking inhibitory neurotransmitters and causing spastic paralysis."
  },
];

// ── Render bacteria grid ───────────────────────────────────────────────────────
function renderBacteriaGrid() {
  const grid = document.getElementById('bacGrid');
  BACTERIA.forEach(b => {
    const isPos = b.gram === 'positive';
    const isNeg = b.gram === 'negative';
    const tagStyle = isPos
      ? 'color:#86efac;border-color:rgba(134,239,172,0.3);background:rgba(134,239,172,0.07)'
      : isNeg
        ? 'color:#f87171;border-color:rgba(248,113,113,0.3);background:rgba(248,113,113,0.07)'
        : 'color:#93c5fd;border-color:rgba(147,197,253,0.3);background:rgba(147,197,253,0.07)';

    const card = document.createElement('div');
    card.className = 'bac-card';
    card.innerHTML = `
      <div class="bac-dot" style="background:${b.color}"></div>
      <div class="bac-name">${b.name}</div>
      <div class="bac-latin">${b.family}</div>
      <div class="bac-clinical">${b.clinical}</div>
      <div class="bac-tags">
        ${b.tags.map(t => `<span class="bac-tag" style="${tagStyle}">${t}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── Drag and drop ─────────────────────────────────────────────────────────────
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleFile(file);
});
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// ── Handle file upload ────────────────────────────────────────────────────────
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('previewName').textContent = file.name;
    document.getElementById('previewSize').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    document.getElementById('dropZone').style.display = 'none';
    document.getElementById('previewArea').style.display = 'block';
    document.getElementById('resultLoading').style.display = 'none';
    document.getElementById('resultPanel').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'block';
  };
  reader.readAsDataURL(file);
  window._currentFile = file;
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetUpload() {
  document.getElementById('dropZone').style.display = 'block';
  document.getElementById('previewArea').style.display = 'none';
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultPanel').style.display = 'none';
  document.getElementById('resetBtn').style.display = 'none';
  fileInput.value = '';
  window._currentFile = null;
}

// ── Loading animation ─────────────────────────────────────────────────────────
let _stepInterval = null;
function startLoadingAnimation() {
  const steps = document.querySelectorAll('.lstep');
  let idx = 0;
  steps.forEach(s => s.classList.remove('active'));
  steps[0].classList.add('active');
  _stepInterval = setInterval(() => {
    steps[idx].classList.remove('active');
    idx = Math.min(idx + 1, steps.length - 1);
    steps[idx].classList.add('active');
    if (idx === steps.length - 1) clearInterval(_stepInterval);
  }, 550);
}

// ── Run Analysis ──────────────────────────────────────────────────────────────
async function runAnalysis() {
  if (!window._currentFile) return;

  document.getElementById('analyzeBtn').style.display = 'none';
  document.getElementById('resultLoading').style.display = 'block';
  document.getElementById('resultPanel').style.display = 'none';
  startLoadingAnimation();

  const formData = new FormData();
  formData.append('image', window._currentFile);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (_stepInterval) clearInterval(_stepInterval);

    if (data.success) {
      setTimeout(() => showResult(data.result), 400);
    } else {
      showError(data.error || 'Analysis failed');
    }
  } catch (err) {
    if (_stepInterval) clearInterval(_stepInterval);
    showError('Network error — please try again');
  }
}

// ── Show Result ───────────────────────────────────────────────────────────────
function showResult(result) {
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultPanel').style.display = 'block';

  // Primary info
  document.getElementById('rName').textContent = result.name;
  document.getElementById('rFamily').textContent = 'Family: ' + result.family;
  document.getElementById('rClinical').textContent = result.clinical;
  document.getElementById('rHabitat').textContent = result.habitat;
  document.getElementById('rTreatment').textContent = result.treatment;

  // Confidence circle
  const conf = result.confidence;
  const circumference = 2 * Math.PI * 18; // r=18
  const offset = circumference - (conf / 100) * circumference;
  const path = document.getElementById('confCirclePath');
  path.style.strokeDasharray = circumference;
  path.style.strokeDashoffset = circumference;
  document.getElementById('rConfPct').textContent = conf.toFixed(1) + '%';
  setTimeout(() => { path.style.strokeDashoffset = offset; }, 100);

  // Tags
  const tagsEl = document.getElementById('rTags');
  tagsEl.innerHTML = '';
  (result.tags || []).forEach(t => {
    const span = document.createElement('span');
    const cls = t.includes('+') ? 'gp' : t.includes('–') ? 'gn' : 'info';
    span.className = `rtag ${cls}`;
    span.textContent = t;
    tagsEl.appendChild(span);
  });

  // Diseases
  const disEl = document.getElementById('rDiseases');
  disEl.innerHTML = '';
  (result.diseases || []).forEach(d => {
    const span = document.createElement('span');
    span.className = 'dtag';
    span.textContent = d;
    disEl.appendChild(span);
  });

  // Alt predictions
  const altEl = document.getElementById('altPredictions');
  altEl.innerHTML = '';
  const alts = (result.top_predictions || []).slice(1);
  if (alts.length > 0) {
    altEl.innerHTML = '<div class="alt-label">other possibilities</div>';
    alts.forEach(a => {
      const div = document.createElement('div');
      div.className = 'alt-item';
      div.innerHTML = `
        <div class="alt-name">${a.name}</div>
        <div class="alt-bar-wrap"><div class="alt-bar" style="width:${Math.min(a.confidence * 2, 100)}%"></div></div>
        <div class="alt-pct">${a.confidence.toFixed(1)}%</div>
      `;
      altEl.appendChild(div);
    });
  }
}

// ── Show Error ────────────────────────────────────────────────────────────────
function showError(msg) {
  document.getElementById('resultLoading').style.display = 'none';
  document.getElementById('resultPanel').style.display = 'block';
  document.getElementById('resultPanel').innerHTML = `
    <div style="text-align:center;padding:2rem 1rem">
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--danger);margin-bottom:0.5rem">analysis failed</div>
      <div style="font-size:13px;color:var(--text3)">${msg}</div>
      <button onclick="resetUpload()" style="margin-top:1.5rem;font-family:var(--font-mono);font-size:11px;color:var(--text3);background:none;border:0.5px solid var(--border2);border-radius:20px;padding:6px 16px;cursor:pointer">try again</button>
    </div>
  `;
}

// ── Scroll animations ─────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.step, .bac-card, .tech-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderBacteriaGrid();

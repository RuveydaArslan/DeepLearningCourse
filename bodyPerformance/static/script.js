/* ═══════════════════════════════════════
   Body Performance AI — Frontend Script
   ═══════════════════════════════════════ */

// ──────────────────────────────────────
// Arka Plan Partikül Sistemi
// ──────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: 60 }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.5 + 0.3,
      dx:   (Math.random() - 0.5) * 0.3,
      dy:   (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.05,
      hue:  Math.random() > 0.5 ? 260 : 190,   // purple or cyan
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();
  window.addEventListener('resize', () => { resize(); makeParticles(); });
})();

// ──────────────────────────────────────
// Sınıf Renk & Notları
// ──────────────────────────────────────
const CLASS_META = {
  A: {
    color: '#00f5a0',
    bg:    '#00f5a0',
    grad:  'linear-gradient(135deg, #00f5a0, #00d2a0)',
    note:  '🏆 Mükemmel fiziksel uygunluk! Performans değerleriniz üst dilimde. Bu seviyeyi korumak için düzenli antrenman programınızı sürdürün.',
  },
  B: {
    color: '#00d2ff',
    bg:    '#00d2ff',
    grad:  'linear-gradient(135deg, #00d2ff, #0090d4)',
    note:  '💪 İyi bir fiziksel uygunluk seviyesindesiniz. Belirli alanlarda küçük iyileştirmelerle A sınıfına yükselebilirsiniz.',
  },
  C: {
    color: '#f7971e',
    bg:    '#f7971e',
    grad:  'linear-gradient(135deg, #f7971e, #ffd200)',
    note:  '📊 Orta düzey fiziksel uygunluk. Kardiyo ve kuvvet antrenmanlarını artırarak performansınızı geliştirebilirsiniz.',
  },
  D: {
    color: '#ef4444',
    bg:    '#ef4444',
    grad:  'linear-gradient(135deg, #ef4444, #b91c1c)',
    note:  '⚠️ Fiziksel uygunluk düzeyiniz gelişim gerektiriyor. Bir uzman eşliğinde düzenli egzersiz ve beslenme programı oluşturmanızı öneririz.',
  },
};

const CLASS_LABEL = { A: 'Çok İyi', B: 'İyi', C: 'Orta', D: 'Zayıf' };

// ──────────────────────────────────────
// DOM Refs
// ──────────────────────────────────────
const form        = document.getElementById('predForm');
const submitBtn   = document.getElementById('submitBtn');
const btnText     = submitBtn.querySelector('.btn-text');
const btnSpinner  = submitBtn.querySelector('.btn-spinner');
const btnArrow    = submitBtn.querySelector('.btn-arrow');

const resultEmpty = document.getElementById('resultEmpty');
const resultCard  = document.getElementById('resultCard');

const classBadge  = document.getElementById('classBadge');
const classEmoji  = document.getElementById('classEmoji');
const classLetter = document.getElementById('classLetter');
const classNameEl = document.getElementById('className');
const classDescEl = document.getElementById('classDesc');
const probBarsEl  = document.getElementById('probBars');
const resultNote  = document.getElementById('resultNote');
const resetBtn    = document.getElementById('resetBtn');

// ──────────────────────────────────────
// Form Submit
// ──────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoading(true);

  const fd     = new FormData(form);
  const cinsiyet = document.querySelector('input[name="cinsiyet"]:checked').value;

  const payload = {
    yas:            fd.get('yas'),
    cinsiyet:       cinsiyet,
    boy:            fd.get('boy'),
    kilo:           fd.get('kilo'),
    vucut_yag:      fd.get('vucut_yag'),
    kucuk_tansiyon: fd.get('kucuk_tansiyon'),
    buyuk_tansiyon: fd.get('buyuk_tansiyon'),
    kavrama:        fd.get('kavrama'),
    esneklik:       fd.get('esneklik'),
    mekik:          fd.get('mekik'),
    atlama:         fd.get('atlama'),
  };

  try {
    const res  = await fetch('/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error || 'Bilinmeyen hata');
    showResult(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

// ──────────────────────────────────────
// UI helpers
// ──────────────────────────────────────
function setLoading(on) {
  submitBtn.disabled = on;
  btnText.textContent = on ? 'Analiz Ediliyor…' : 'Analiz Et';
  btnSpinner.hidden   = !on;
  btnArrow.hidden     = on;
}

function showResult(data) {
  const cls  = data.class;
  const meta = CLASS_META[cls];

  // hide empty, show card
  resultEmpty.hidden = true;
  resultCard.hidden  = false;

  // Set CSS variable for class color
  resultCard.style.setProperty('--class-color', meta.color);
  classBadge.style.background = meta.grad;
  classBadge.style.boxShadow  = `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${meta.color}40`;

  classEmoji.textContent  = data.info.emoji;
  classLetter.textContent = cls;

  classNameEl.textContent = data.info.label;
  classNameEl.style.color = meta.color;
  classDescEl.textContent = `Fiziksel Uygunluk Sınıfı ${cls}`;

  // Note
  resultNote.textContent = meta.note;
  resultNote.style.borderLeftColor = meta.color;

  // Probability bars
  buildProbBars(data.probabilities, cls);

  // Scroll to result on mobile
  if (window.innerWidth < 900) {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function buildProbBars(probs, activeCls) {
  const order   = ['A', 'B', 'C', 'D'];
  const labels  = { A: 'Çok İyi', B: 'İyi', C: 'Orta', D: 'Zayıf' };
  const emojis  = { A: '🏆', B: '💪', C: '📊', D: '⚠️' };

  probBarsEl.innerHTML = '';

  order.forEach((cls, i) => {
    const pct  = probs[cls] || 0;
    const meta = CLASS_META[cls];
    const isActive = cls === activeCls;

    const item = document.createElement('div');
    item.className = 'prob-bar-item';
    item.innerHTML = `
      <div class="prob-bar-header">
        <span class="prob-bar-label">
          <span class="prob-letter" style="background:${meta.grad}">${emojis[cls]}</span>
          <span style="${isActive ? `color:${meta.color};font-weight:600` : ''}">${cls} — ${labels[cls]}</span>
        </span>
        <span class="prob-pct" id="pct-${cls}">0%</span>
      </div>
      <div class="prob-track">
        <div class="prob-fill" id="fill-${cls}"
             style="background:${meta.grad}; opacity:${isActive ? 1 : 0.45}"></div>
      </div>
    `;
    probBarsEl.appendChild(item);

    // Animate after tiny delay
    setTimeout(() => {
      document.getElementById(`fill-${cls}`).style.width = pct + '%';
      animateCounter(document.getElementById(`pct-${cls}`), pct);
    }, 50 + i * 100);
  });
}

function animateCounter(el, target) {
  const duration = 800;
  const start    = performance.now();
  function step(now) {
    const t   = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * ease).toFixed(1) + '%';
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(1) + '%';
  }
  requestAnimationFrame(step);
}

function showError(msg) {
  resultEmpty.hidden = false;
  resultCard.hidden  = true;
  const icon  = resultEmpty.querySelector('.empty-icon');
  const title = resultEmpty.querySelector('.empty-title');
  const sub   = resultEmpty.querySelector('.empty-sub');
  icon.textContent  = '❌';
  title.textContent = 'Bir Hata Oluştu';
  sub.textContent   = msg;
  setTimeout(() => {
    icon.textContent  = '🤖';
    title.textContent = 'Tahmin Bekleniyor';
    sub.innerHTML     = 'Ölçüm verilerini girin ve<br />analizi başlatın.';
  }, 4000);
}

// ──────────────────────────────────────
// Reset
// ──────────────────────────────────────
resetBtn.addEventListener('click', () => {
  resultCard.hidden  = true;
  resultEmpty.hidden = false;
  form.reset();
  // Re-select default radio
  document.getElementById('erkek').checked = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ──────────────────────────────────────
// Input micro-animations
// ──────────────────────────────────────
document.querySelectorAll('.input-wrap input').forEach(input => {
  input.addEventListener('focus', () => {
    input.closest('.input-wrap').style.transform = 'scale(1.01)';
  });
  input.addEventListener('blur', () => {
    input.closest('.input-wrap').style.transform = '';
  });
});

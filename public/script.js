const navLinks = document.querySelectorAll('header nav a');
const logoLink = document.querySelector('.logo');
const sections = document.querySelectorAll('section');
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('header nav');

menuIcon.addEventListener('click', () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
});

function animateTransition() {
  const header = document.querySelector('header');
  const barsBox = document.querySelector('.bars-box');

  header.classList.remove('active');
  setTimeout(() => header.classList.add('active'), 1100);

  barsBox.classList.remove('active');
  setTimeout(() => barsBox.classList.add('active'), 1100);

  sections.forEach(s => s.classList.remove('active'));
  menuIcon?.classList.remove('bx-x');
  navbar.classList.remove('active');
}

function showSection(section) {
  sections.forEach(s => s.classList.remove('active'));
  section.classList.add('active');
  navLinks.forEach(a => a.classList.remove('active'));
  const index = Array.from(sections).indexOf(section);
  if (index >= 0) {
    navLinks[index]?.classList.add('active');
  }
}

// cliques do menu
navLinks.forEach((link, index) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    let id = link.dataset.target || link.getAttribute('href')?.replace('#','');

    let targetSection = null;
    if (id) {
      targetSection = document.getElementById(id);
    }
    // Se não tiver id, pega pela ordem do link
    if (!targetSection) {
      targetSection = sections[index] || null;
    }
    if (!targetSection || link.classList.contains('active')) return;

    animateTransition();
    setTimeout(() => showSection(targetSection), 1100);
  });
});

// clique no logo -> home
logoLink?.addEventListener('click', (e) => {
  e.preventDefault();
  if (!sections.length) return;
  if (document.querySelector('header nav a.active') === navLinks[0]) return;
  animateTransition();
  setTimeout(() => showSection(sections[0]), 1100);
});

/* ----------------------------
   TABS: Experience / Education / Skills / About
   (sem data-target, só pela ORDEM dos botões)
----------------------------- */
const tabButtons = document.querySelectorAll(
  '.resume-container .resume-box:first-child .resume-btn'
);
const tabPanels = document.querySelectorAll(
  '.resume-container .resume-box:nth-child(2) .resume-detail'
);

function activateTabByIndex(i) {
  tabButtons.forEach(b => b.classList.remove('active'));
  tabPanels.forEach(p => p.classList.remove('active'));
  if (tabButtons[i]) tabButtons[i].classList.add('active');
  if (tabPanels[i]) tabPanels[i].classList.add('active');
}

// liga os cliques
tabButtons.forEach((btn, i) => {
  btn.addEventListener('click', () => activateTabByIndex(i));
});

// garante que, se por algum motivo nada estiver ativo, ativa a 1ª tab
if (
  tabButtons.length &&
  tabPanels.length &&
  !document.querySelector('.resume-btn.active') &&
  !document.querySelector('.resume-detail.active')
) {
  activateTabByIndex(0);
}

// === PORTFÓLIO: sincronizar imagens e detalhes ===
const arrowRight = document.querySelector('.portfolio-box .navigation .arrow-right');
const arrowLeft  = document.querySelector('.portfolio-box .navigation .arrow-left');

const imgSlide   = document.querySelector('.portfolio-mediamatiker .img-curriculum');
const slides     = imgSlide ? imgSlide.querySelectorAll('.img-item') : [];
const details    = document.querySelectorAll('.portfolio-container .portfolio-box:first-child .portfolio-detail');

const total = Math.min(slides.length, details.length);

let index = 0;

function updateDetails() {
  details.forEach(d => d.classList.remove('active'));
  if (details[index]) details[index].classList.add('active');
}

function updateNavState() {
  // desativa botão quando chega ao limite
  arrowLeft?.classList.toggle('disabled', index === 0);
  arrowRight?.classList.toggle('disabled', index === total - 1);
}

function activePortfolio() {
  if (imgSlide) {
    imgSlide.style.transform = `translateX(calc(${index * -100}% - ${index * 2}rem))`;
  }
  updateDetails();
  updateNavState();
}

// direita → próximo
arrowRight?.addEventListener('click', () => {
  if (index < total - 1) {
    index++;
    activePortfolio();
  }
});

// esquerda → anterior
arrowLeft?.addEventListener('click', () => {
  if (index > 0) {
    index--;
    activePortfolio();
  }
});

// inicializa
activePortfolio();

function animateSkills() {
  const skillsSection = document.querySelector('.resume-detail.skills');
  if (!skillsSection) return;

// Barras
  skillsSection.querySelectorAll('.progress').forEach(bar => {
    const val = parseInt(bar.getAttribute('data-value') || '0', 10);
    bar.style.width = '0%';                     // reset
    bar.setAttribute('data-label', val + '%');  // <<< texto do rótulo
    void bar.offsetWidth;                       // reflow p/ transição
    bar.style.width = val + '%';                // anima
  });
  

  // Círculos (anima variável --value 0->alvo)
  skillsSection.querySelectorAll('.circle').forEach(c => {
    const target = parseInt(c.getAttribute('data-value') || '0', 10);
    c.style.setProperty('--value', 0);
    const duration = 1200; // ms
    const start = performance.now();

    function tick(now){
      const t = Math.min((now - start)/duration, 1);
      const current = Math.round(target * t);
      c.style.setProperty('--value', current);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// dispara quando clicar na aba "Skills"
document.querySelectorAll('.resume-btn').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const panels = document.querySelectorAll('.resume-detail');
    const panel = panels[i];
    if (panel && panel.classList.contains('skills')) {
      // pequeno atraso p/ permitir o toggle de classes/visibilidade
      setTimeout(animateSkills, 50);
    }
  });
});

// se ao recarregar a página a aba Skills já estiver ativa, anima
window.addEventListener('load', () => {
  const skillsActive = document.querySelector('.resume-detail.skills.active');
  if (skillsActive) animateSkills();
});

/* ===========================
   CONTACT FORM: AJAX + TOAST
=========================== */

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const toastRoot = document.getElementById('toast-root');

  function showToast({ title = 'Info', message = '', type = 'success', timeout = 4500 } = {}) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div class="content">
        <div class="title">${title}</div>
        <div class="msg">${message}</div>
      </div>
      <button class="close" aria-label="Fechar">&times;</button>
    `;
    toastRoot.appendChild(el);

    const close = () => {
      el.style.transition = 'opacity .15s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 180);
    };
    el.querySelector('.close').addEventListener('click', close);
    if (timeout) setTimeout(close, timeout);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // evita múltiplos submits
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'A enviar…';

    try {
      // envia como application/x-www-form-urlencoded (compatível com express.urlencoded)
      const fd = new FormData(form);
      const body = new URLSearchParams(fd);

      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (res.ok && data.ok) {
        showToast({
          title: 'Mensagem enviada!',
          message: 'Obrigado. Vou responder em breve.',
          type: 'success'
        });
        form.reset();
      } else if (res.status === 429) {
        showToast({
          title: 'Muitas tentativas',
          message: 'Tente novamente daqui a alguns minutos.',
          type: 'error'
        });
      } else {
        showToast({
          title: 'Falha no envio',
          message: data?.error || 'Não foi possível enviar a mensagem.',
          type: 'error'
        });
      }
    } catch (err) {
      showToast({
        title: 'Erro de rede',
        message: 'Verifique sua ligação à internet.',
        type: 'error'
      });
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();
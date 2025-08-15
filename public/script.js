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
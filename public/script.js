const navLinks = document.querySelectorAll('header nav a');
const logoLink = document.querySelector('.logo');
const sections = document.querySelectorAll('section');
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('header nav');

menuIcon.addEventListener('click', () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
});

const activePage = () => {
  const header = document.querySelector('header');
  const barsBox = document.querySelector('.bars-box');

  header.classList.remove('active');
  setTimeout(() => header.classList.add('active'), 1100);

  navLinks.forEach(link => link.classList.remove('active'));

  barsBox.classList.remove('active');
  setTimeout(() => barsBox.classList.add('active'), 1100);

  sections.forEach(s => s.classList.remove('active'));

  menuIcon.classList.remove('bx-x');
  navbar.classList.remove('active');
};

// nova função: ativa pela id da secção
function showSectionById(id) {
  const target = document.getElementById(id);
  if (!target) return;
  sections.forEach(s => s.classList.remove('active'));
  target.classList.add('active');
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
}

// cliques do menu usando data-target (não índice)
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.dataset.target; // "home", "resume", ...
    if (!id || link.classList.contains('active')) return;

    activePage();
    setTimeout(() => showSectionById(id), 1100);
  });
});

// clique no logo → home
logoLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (!navLinks[0].classList.contains('active')) {
    activePage();
    setTimeout(() => showSectionById('home'), 1100);
  }
});
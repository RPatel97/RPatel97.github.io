// Select DOM Items
const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.mobile-menu');
const menuNav = document.querySelector('.mobile-menu-nav');
const navItems = document.querySelectorAll('.nav-item');
const socialIcons = document.querySelector('.icons');
const footer = document.querySelector('.footer');

// Set Initial State Of Menu
let showMenu = false;

menuBtn.addEventListener('click', toggleMenu);

function toggleMenu() {
  if (!showMenu) {
    menuBtn.classList.add('close');
    menu.classList.add('show');
    menuNav.classList.add('show');
    navItems.forEach(item => item.classList.add('show'));
    socialIcons.style.display = "none";
    footer.style.display = "none";

    // Set Menu State
    showMenu = true;
  } else {
    menuBtn.classList.remove('close');
    menu.classList.remove('show');
    menuNav.classList.remove('show');
    navItems.forEach(item => item.classList.remove('show'));
    socialIcons.style.display = "block";
    footer.style.display = "block";

    // Set Menu State
    showMenu = false;
  }
}
import { closeMobileNav, closeSearchModal, renderShell } from './components/layout.js';
import { mountHomePage, renderHomePage } from './pages/home.js';
import { mountMenuPage, renderMenuPage } from './pages/menu.js';
import { mountProductPage, renderNotFoundPage, renderProductPage } from './pages/product.js';
import { mountStoryPage, renderStoryPage } from './pages/story.js';
import { mountAboutPage, renderAboutPage } from './pages/about.js';
import { mountCartPage, renderCartPage } from './pages/cart.js';
import { mountCheckoutPage, renderCheckoutPage } from './pages/checkout.js';
import { renderContactPage } from './pages/contact.js';
import { closeProductModal, mountAdminPage, renderAdminPage } from './pages/admin.js';
import { renderIcons } from './utils/icons.js';

export function parseRoute(hashString = location.hash) {
  const raw = (hashString || '#/home').replace(/^#/, '');
  const split = raw.split('?');
  const path = split[0] || '/home';
  const parts = path.split('/').filter(Boolean);
  return {
    path: parts[0] || 'home',
    id: parts[1] ? decodeURIComponent(parts[1]) : null,
    params: new URLSearchParams(split[1] || ''),
  };
}

let lastRouteKey = '';

export function renderRoute() {
  const r = parseRoute();
  const app = document.getElementById('app');
  if (!app) return;

  const key = `${r.path}/${r.id || ''}?${r.params.toString()}`;

  renderShell(r.path);

  switch (r.path) {
    case 'home':
      app.innerHTML = renderHomePage();
      mountHomePage();
      break;
    case 'menu':
      app.innerHTML = renderMenuPage();
      mountMenuPage();
      break;
    case 'product':
      app.innerHTML = renderProductPage(r.id);
      mountProductPage();
      break;
    case 'story':
      app.innerHTML = renderStoryPage();
      mountStoryPage(r.params);
      break;
    case 'about':
      app.innerHTML = renderAboutPage();
      mountAboutPage();
      break;
    case 'cart':
      app.innerHTML = renderCartPage();
      mountCartPage(renderRoute);
      break;
    case 'checkout':
      app.innerHTML = renderCheckoutPage();
      mountCheckoutPage(renderRoute);
      break;
    case 'contact':
      app.innerHTML = renderContactPage();
      break;
    case 'admin':
      app.innerHTML = renderAdminPage();
      mountAdminPage(renderRoute);
      break;
    default:
      app.innerHTML = renderNotFoundPage();
      break;
  }

  renderIcons();

  if (key !== lastRouteKey) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    lastRouteKey = key;
  }

  closeMobileNav();
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSearchModal();
      closeProductModal();
      closeMobileNav();
    }
  });

  if (!location.hash) {
    history.replaceState(null, '', '#/home');
  }

  renderRoute();
}

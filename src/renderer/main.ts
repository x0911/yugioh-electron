import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './assets/styles/main.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Global Guard: Prevent Backspace and mouse back/forward buttons from triggering browser history navigation
if (typeof window !== 'undefined') {
  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        const target = event.target as HTMLElement | null;
        const isEditable =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable);
        if (!isEditable) {
          event.preventDefault();
        }
      }
    },
    true, // Capturing phase to intercept before any default browser action
  );

  const blockMouseNav = (event: MouseEvent) => {
    // Mouse button 3 = Browser Back, button 4 = Browser Forward
    if (event.button === 3 || event.button === 4) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  window.addEventListener('mouseup', blockMouseNav, true);
  window.addEventListener('auxclick', blockMouseNav, true);
}

app.mount('#app');

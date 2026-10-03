export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ca-theme';

/** Light unless the visitor chose dark. Anything unreadable or unrecognised means light. */
export function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode, site data cleared): the choice lasts for this page only.
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

/** Runs in <head> before first paint so the page never flashes the wrong theme. Mirrors readStoredTheme. */
export const THEME_INIT_SCRIPT = `(function(){var t='light';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')t='dark';}catch(e){}document.documentElement.dataset.theme=t;})();`;

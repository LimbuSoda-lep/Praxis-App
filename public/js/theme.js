// Theme management
const THEME_KEY = 'praxis_theme';

// Get current theme
function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

// Set theme
function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
}

// Apply theme to document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// Toggle theme
function toggleTheme() {
    const current = getTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}

// Initialize theme on page load
function initTheme() {
    const theme = getTheme();
    applyTheme(theme);

    // Update toggle button if it exists
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            toggleTheme();
        });
    }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

window.theme = { getTheme, setTheme, toggleTheme, initTheme };

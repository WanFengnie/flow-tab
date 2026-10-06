// 主题定制与偏好设置管理
const ThemeManager = {
  currentAccent: 'orange',
  currentMode: 'light',
  defaultEngine: 'google',

  async init() {
    this.currentAccent = await StorageService.get('theme_accent', 'orange');
    this.currentMode = await StorageService.get('theme_mode', 'light');
    this.defaultEngine = await StorageService.get('default_engine', 'google');

    this.applyAccent(this.currentAccent);
    this.applyMode(this.currentMode);
  },

  applyAccent(accent) {
    this.currentAccent = accent;
    if (accent === 'orange') {
      document.documentElement.removeAttribute('data-accent');
    } else {
      document.documentElement.setAttribute('data-accent', accent);
    }
    StorageService.set('theme_accent', accent);
    this.updateActiveColorDot(accent);
  },

  applyMode(mode) {
    this.currentMode = mode;
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme-mode');
    }
    StorageService.set('theme_mode', mode);
  },


  updateActiveColorDot(accent) {
    document.querySelectorAll('.color-dot').forEach(dot => {
      if (dot.getAttribute('data-color') === accent) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
};

window.ThemeManager = ThemeManager;

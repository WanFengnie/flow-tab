// 主题定制与偏好设置管理
const ThemeManager = {
  currentAccent: 'orange',
  currentMode: 'light',
  showBottomPill: true,
  defaultEngine: 'google',

  async init() {
    this.currentAccent = await StorageService.get('theme_accent', 'orange');
    this.currentMode = await StorageService.get('theme_mode', 'light');
    this.showBottomPill = await StorageService.get('show_bottom_pill', true);
    this.defaultEngine = await StorageService.get('default_engine', 'google');

    this.applyAccent(this.currentAccent);
    this.applyMode(this.currentMode);
    this.applyBottomPill(this.showBottomPill);
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

  applyBottomPill(show) {
    this.showBottomPill = show;
    const pill = document.getElementById('bottomPill');
    if (pill) {
      if (show) {
        pill.classList.remove('hidden');
      } else {
        pill.classList.add('hidden');
      }
    }
    StorageService.set('show_bottom_pill', show);
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

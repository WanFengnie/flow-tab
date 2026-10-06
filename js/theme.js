// 主题定制与偏好设置管理
const PRESET_MAP = {
  orange: '#ff6e26',
  purple: '#8b5cf6',
  emerald: '#10b981',
  blue: '#3b82f6',
  rose: '#f43f5e'
};

function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function adjustHex(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  let newR, newG, newB;
  if (percent > 0) {
    newR = Math.round(r + (255 - r) * factor);
    newG = Math.round(g + (255 - g) * factor);
    newB = Math.round(b + (255 - b) * factor);
  } else {
    newR = Math.round(r * (1 + factor));
    newG = Math.round(g * (1 + factor));
    newB = Math.round(b * (1 + factor));
  }
  newR = Math.min(255, Math.max(0, newR));
  newG = Math.min(255, Math.max(0, newG));
  newB = Math.min(255, Math.max(0, newB));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

const ThemeManager = {
  currentAccent: '#ff6e26',
  currentMode: 'light',
  defaultEngine: 'google',

  async init() {
    let savedAccent = await StorageService.get('theme_accent', '#ff6e26');
    if (PRESET_MAP[savedAccent]) {
      savedAccent = PRESET_MAP[savedAccent];
    }
    this.currentAccent = savedAccent || '#ff6e26';
    this.currentMode = await StorageService.get('theme_mode', 'light');
    this.defaultEngine = await StorageService.get('default_engine', 'google');

    this.applyMode(this.currentMode);
    this.applyAccent(this.currentAccent, false);
  },

  applyAccent(colorValue, persist = true) {
    let hex = colorValue;
    if (PRESET_MAP[hex]) {
      hex = PRESET_MAP[hex];
    }
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    this.currentAccent = hex;

    const rgb = hexToRgb(hex);
    const isDark = this.currentMode === 'dark';
    const hoverColor = adjustHex(hex, -12);
    const stop1 = adjustHex(hex, 26);
    const stop2 = hex;
    const stop3 = adjustHex(hex, -18);

    const root = document.documentElement;
    root.style.setProperty('--accent-color', hex);
    root.style.setProperty('--accent-hover', hoverColor);

    // 动态模式透明度：深色模式使用深邃微光半透明，彻底杜绝浅白块
    const lightAlpha = isDark ? 0.18 : 0.09;
    const glowAlpha = isDark ? 0.30 : 0.22;
    const glowOuterAlpha = isDark ? 0.06 : 0.08;
    const focusAlpha = isDark ? 0.50 : 0.40;

    root.style.setProperty('--accent-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${lightAlpha})`);
    root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowAlpha})`);
    root.style.setProperty('--accent-glow-outer', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowOuterAlpha})`);
    root.style.setProperty('--border-focus', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${focusAlpha})`);

    root.style.setProperty('--flower-stop-1', stop1);
    root.style.setProperty('--flower-stop-2', stop2);
    root.style.setProperty('--flower-stop-3', stop3);

    // 同步更新 SVG 花瓣内部节点
    const s1a = document.getElementById('flowerStop1a');
    const s1b = document.getElementById('flowerStop1b');
    const s1c = document.getElementById('flowerStop1c');
    const s2a = document.getElementById('flowerStop2a');
    const s2b = document.getElementById('flowerStop2b');
    const fShadow = document.getElementById('flowerDropShadow');

    if (s1a) s1a.setAttribute('stop-color', stop1);
    if (s1b) s1b.setAttribute('stop-color', stop2);
    if (s1c) s1c.setAttribute('stop-color', stop3);
    if (s2a) s2a.setAttribute('stop-color', stop1);
    if (s2b) s2b.setAttribute('stop-color', stop3);
    if (fShadow) fShadow.setAttribute('flood-color', hex);

    // 同步更新调色板 UI 控件
    const customInput = document.getElementById('customColorInput');
    const customThumb = document.getElementById('customColorThumb');
    const customHexTag = document.getElementById('customColorHexTag');

    if (customInput && customInput.value.toLowerCase() !== hex.toLowerCase()) {
      customInput.value = hex;
    }
    if (customThumb) {
      customThumb.style.background = hex;
    }
    if (customHexTag) {
      customHexTag.textContent = hex.toUpperCase();
    }

    this.updateActiveColorDot(hex);

    if (persist) {
      StorageService.set('theme_accent', hex);
    }
  },

  applyMode(mode) {
    this.currentMode = mode;
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme-mode');
    }
    StorageService.set('theme_mode', mode);

    // 模式切换时自动根据深浅对比度重算当前主题色的微光与透明度变量
    if (this.currentAccent) {
      this.applyAccent(this.currentAccent, false);
    }
  },

  updateActiveColorDot(hex) {
    const lowerHex = hex.toLowerCase();
    document.querySelectorAll('.color-dot').forEach(dot => {
      const dotColor = (dot.getAttribute('data-color') || '').toLowerCase();
      if (dotColor === lowerHex || PRESET_MAP[dotColor] === lowerHex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
};

window.ThemeManager = ThemeManager;

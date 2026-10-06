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

// HSV 与 RGB 互转
function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, v };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// 专属大圆角无极调色器交互对象
const InteractiveColorPicker = {
  h: 20,
  s: 0.85,
  v: 1.0,
  isDraggingSv: false,
  isDraggingHue: false,

  init() {
    this.svBox = document.getElementById('pickerSvBox');
    this.svCursor = document.getElementById('pickerSvCursor');
    this.hueSlider = document.getElementById('pickerHueSlider');
    this.hueThumb = document.getElementById('pickerHueThumb');
    this.colorPreview = document.getElementById('pickerColorPreview');
    this.hexTag = document.getElementById('customColorHexTag');
    this.hexInput = document.getElementById('customHexInput');
    this.eyedropperBtn = document.getElementById('pickerEyedropperBtn');

    if (!this.svBox || !this.hueSlider) return;

    // 绑定 2D SV 饱和度/明度拾色板拖拽
    this.svBox.addEventListener('mousedown', (e) => {
      this.isDraggingSv = true;
      this.handleSvMove(e, false);
    });

    // 绑定 1D 色相胶囊滑条拖拽
    this.hueSlider.addEventListener('mousedown', (e) => {
      this.isDraggingHue = true;
      this.handleHueMove(e, false);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingSv) {
        this.handleSvMove(e, false);
      } else if (this.isDraggingHue) {
        this.handleHueMove(e, false);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isDraggingSv) {
        this.handleSvMove(e, true);
        this.isDraggingSv = false;
      } else if (this.isDraggingHue) {
        this.handleHueMove(e, true);
        this.isDraggingHue = false;
      }
    });

    // 屏幕拾色吸管
    if (this.eyedropperBtn) {
      if (window.EyeDropper) {
        this.eyedropperBtn.addEventListener('click', async () => {
          try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            if (result && result.sRGBHex) {
              ThemeManager.applyAccent(result.sRGBHex, true, true);
            }
          } catch (err) {
            // 用户取消拾色
          }
        });
      } else {
        this.eyedropperBtn.style.display = 'none';
      }
    }

    // HEX 输入框交互
    if (this.hexInput) {
      this.hexInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.applyManualHex();
          this.hexInput.blur();
        }
      });
      this.hexInput.addEventListener('blur', () => {
        this.applyManualHex();
      });
    }
  },

  handleSvMove(e, isFinal) {
    const rect = this.svBox.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    this.s = x / rect.width;
    this.v = 1 - (y / rect.height);

    this.updateSvCursorPos();
    this.emitColorChange(isFinal);
  },

  handleHueMove(e, isFinal) {
    const rect = this.hueSlider.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));

    this.h = (x / rect.width) * 360;
    if (this.h >= 360) this.h = 359.9;

    this.updateHueSliderPos();
    this.updateSvBoxBackground();
    this.emitColorChange(isFinal);
  },

  updateSvCursorPos() {
    if (this.svCursor) {
      this.svCursor.style.left = `${this.s * 100}%`;
      this.svCursor.style.top = `${(1 - this.v) * 100}%`;
    }
  },

  updateHueSliderPos() {
    if (this.hueThumb) {
      this.hueThumb.style.left = `${(this.h / 360) * 100}%`;
    }
  },

  updateSvBoxBackground() {
    if (this.svBox) {
      this.svBox.style.backgroundColor = `hsl(${Math.round(this.h)}, 100%, 50%)`;
    }
  },

  emitColorChange(isFinal) {
    const rgb = hsvToRgb(this.h, this.s, this.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    if (this.colorPreview) this.colorPreview.style.background = hex;
    if (this.hexTag) this.hexTag.textContent = hex;
    if (this.hexInput && document.activeElement !== this.hexInput) {
      this.hexInput.value = hex;
    }

    ThemeManager.applyAccent(hex, isFinal, false);
  },

  applyManualHex() {
    let val = this.hexInput.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      ThemeManager.applyAccent(val, true, true);
    } else {
      this.hexInput.value = ThemeManager.currentAccent.toUpperCase();
    }
  },

  syncFromHex(hex) {
    const rgb = hexToRgb(hex);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.h = hsv.h;
    this.s = hsv.s;
    this.v = hsv.v;

    this.updateSvBoxBackground();
    this.updateSvCursorPos();
    this.updateHueSliderPos();

    const upperHex = hex.toUpperCase();
    if (this.colorPreview) this.colorPreview.style.background = hex;
    if (this.hexTag) this.hexTag.textContent = upperHex;
    if (this.hexInput && document.activeElement !== this.hexInput) {
      this.hexInput.value = upperHex;
    }
  }
};

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

    InteractiveColorPicker.init();
    this.applyMode(this.currentMode);
    this.applyAccent(this.currentAccent, false, true);
  },

  applyAccent(colorValue, persist = true, syncPicker = true) {
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

    if (syncPicker) {
      InteractiveColorPicker.syncFromHex(hex);
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
      this.applyAccent(this.currentAccent, false, false);
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

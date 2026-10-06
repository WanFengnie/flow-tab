// 本地与扩展数据持久化层封装
const StorageService = {
  // 检查是否在 Chrome 扩展环境下
  isExtension: typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local,

  async get(key, defaultValue = null) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.warn('Storage error:', chrome.runtime.lastError);
            resolve(defaultValue);
          } else {
            resolve(result[key] !== undefined ? result[key] : defaultValue);
          }
        });
      });
    } else {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      } catch (e) {
        console.warn('localStorage parse error:', e);
        return defaultValue;
      }
    }
  },

  async set(key, value) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('localStorage write error:', e);
      }
    }
  }
};

window.StorageService = StorageService;

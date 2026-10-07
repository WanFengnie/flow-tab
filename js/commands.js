// 快捷指令库与执行逻辑

// 辅助函数：安全打开 Chrome 原生系统页面或目标网页
function openChromeUrl(url) {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, '_blank');
  }
}

const COMMANDS = [
  {
    cmd: '/bili',
    name: '哔哩哔哩',
    desc: '',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="4"/><path d="m8 2 3 4M16 2l-3 4"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="16" cy="13" r="1" fill="currentColor"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://search.bilibili.com/all?keyword=${q}` : 'https://www.bilibili.com';
    }
  },
  {
    cmd: '/yt',
    name: 'YouTube',
    desc: '',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://www.youtube.com/results?search_query=${q}` : 'https://www.youtube.com';
    }
  },
  {
    cmd: '/trans',
    name: 'Google 翻译',
    desc: '中英双向与多语言即时互译',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://translate.google.com/?sl=auto&tl=zh-CN&text=${q}&op=translate` : 'https://translate.google.com';
    }
  },
  {
    cmd: '/bm',
    name: '书签管理器',
    desc: '一键打开 Chrome 原生书签管理页',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    action: () => {
      openChromeUrl('chrome://bookmarks');
    }
  },
  {
    cmd: '/hist',
    name: '历史记录',
    desc: '一键打开 Chrome 原生浏览历史中心',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    action: () => {
      openChromeUrl('chrome://history');
    }
  },
  {
    cmd: '/ext',
    name: '扩展管理',
    desc: '一键打开 Chrome 扩展程序管理页',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c0-1.571-.85-2.85-1.9-2.85s-1.9 1.279-1.9 2.85V9H13V6.361c0-1.571-.85-2.85-1.9-2.85s-1.9 1.279-1.9 2.85V9H6.461C4.89 9 3.61 9.85 3.61 10.9s1.28 1.9 2.851 1.9H8v2.739c0 1.571.85 2.85 1.9 2.85s1.9-1.279 1.9-2.85V13h2.639c1.571 0 2.85-.85 2.85-1.9s-1.279-1.9-2.85-1.9H13V7.85z"/></svg>`,
    action: () => {
      openChromeUrl('chrome://extensions');
    }
  },
  {
    cmd: '/dl',
    name: '下载内容',
    desc: '一键打开 Chrome 文件下载管理器',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    action: () => {
      openChromeUrl('chrome://downloads');
    }
  }
];

window.COMMANDS = COMMANDS;

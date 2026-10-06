// 斜杠妙招指令库与执行逻辑
const COMMANDS = [
  {
    cmd: '/google',
    name: 'Google 搜索',
    desc: '全球主流网页精准搜索',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://www.google.com/search?q=${q}` : 'https://www.google.com';
    }
  },
  {
    cmd: '/baidu',
    name: '百度搜索',
    desc: '中文互联网海量信息搜索',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#2932E1"><path d="M9.154 0C7.71 0 6.54 1.658 6.54 3.707c0 2.051 1.171 3.71 2.615 3.71 1.446 0 2.614-1.659 2.614-3.71C11.768 1.658 10.6 0 9.154 0zm7.025.594C14.86.58 13.347 2.589 13.2 3.927c-.187 1.745.25 3.487 2.179 3.735 1.933.25 3.175-1.806 3.422-3.364.252-1.555-.995-3.364-2.362-3.674a1.218 1.218 0 0 0-.261-.03zM3.582 5.535a2.811 2.811 0 0 0-.156.008c-2.118.19-2.428 3.24-2.428 3.24-.287 1.41.686 4.425 3.297 3.864 2.617-.561 2.262-3.68 2.183-4.362-.125-1.018-1.292-2.773-2.896-2.75zm16.534 1.753c-2.308 0-2.617 2.119-2.617 3.616 0 1.43.121 3.425 2.988 3.362 2.867-.063 2.553-3.238 2.553-3.988 0-.745-.62-2.99-2.924-2.99zm-8.264 2.478c-1.424.014-2.708.925-3.323 1.947-1.118 1.868-2.863 3.05-3.112 3.363-.25.309-3.61 2.116-2.864 5.42.746 3.301 3.365 3.237 3.365 3.237s1.93.19 4.171-.31c2.24-.495 4.17.123 4.17.123s5.233 1.748 6.665-1.616c1.43-3.364-.808-5.109-.808-5.109s-2.99-2.306-4.736-4.798c-1.072-1.665-2.348-2.268-3.528-2.257zm-2.234 3.84l1.542.024v8.197H7.758c-1.47-.291-2.055-1.292-2.13-1.462-.072-.173-.488-.976-.268-2.343.635-2.049 2.447-2.196 2.447-2.196h1.81zm3.964 2.39v3.881c.096.413.612.488.612.488h1.614v-4.343h1.689v5.782h-3.915c-1.517-.39-1.59-1.465-1.59-1.465v-4.317zm-5.458 1.147c-.66.197-.978.708-1.05.928-.076.22-.247.78-.1 1.269.294 1.095 1.248 1.144 1.248 1.144h1.37v-3.34z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://www.baidu.com/s?wd=${q}` : 'https://www.baidu.com';
    }
  },
  {
    cmd: '/bing',
    name: '微软必应',
    desc: '微软必应智能搜索',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#00839B" d="M5 3v16.5l5 2.5 8-4.5v-5l-6.5 2.3V7.2L5 3z"/><path fill="#00B4D8" d="M11.5 7.2l6.5 3.6-3.2 1.9-3.3-1.7V7.2z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://cn.bing.com/search?q=${q}` : 'https://cn.bing.com';
    }
  },
  {
    cmd: '/github',
    name: 'GitHub 仓库',
    desc: '搜索全球开源代码与项目',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://github.com/search?q=${q}&type=repositories` : 'https://github.com';
    }
  },
  {
    cmd: '/bilibili',
    name: '哔哩哔哩',
    desc: '搜索弹幕视频与番剧',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="14" rx="4"/><path d="m8 2 3 4M16 2l-3 4"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://search.bilibili.com/all?keyword=${q}` : 'https://www.bilibili.com';
    }
  },
  {
    cmd: '/bm',
    name: '书签检索',
    desc: '在左侧抽屉中快速检索已存书签',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    action: (query) => {
      window.dispatchEvent(new CustomEvent('open-drawer', { detail: { tab: 'bookmarks', filter: query } }));
    }
  },
  {
    cmd: '/hist',
    name: '历史记录',
    desc: '在左侧抽屉检索浏览历史',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    action: (query) => {
      window.dispatchEvent(new CustomEvent('open-drawer', { detail: { tab: 'history', filter: query } }));
    }
  },
  {
    cmd: '/trans',
    name: '快捷翻译',
    desc: '多语言划词中英互译',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = `https://translate.google.com/?sl=auto&tl=zh-CN&text=${q}&op=translate`;
    }
  },
  {
    cmd: '/calc',
    name: '即时计算',
    desc: '计算数学表达式（如 45 * 1.25）',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/></svg>`,
    action: (query) => {
      try {
        // 安全纯算术求值
        const sanitized = query.replace(/[^0-9+\-*/().%^ ]/g, '');
        if (sanitized) {
          const res = Function(`"use strict"; return (${sanitized})`)();
          alert(`计算结果：\n${sanitized} = ${res}`);
        }
      } catch (err) {
        alert('无法解析表达式，请输入合法数学算式');
      }
    }
  },
  {
    cmd: '/note',
    name: '随手便签',
    desc: '快速记录灵感或待办备忘',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    action: (query) => {
      window.dispatchEvent(new CustomEvent('open-drawer', { detail: { tab: 'memo', noteText: query } }));
    }
  },
  {
    cmd: '/theme',
    name: '个性化外观',
    desc: '切换暖橙、紫霓、翡翠主题色彩',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"/></svg>`,
    action: () => {
      window.dispatchEvent(new CustomEvent('toggle-theme-modal'));
    }
  }
];

window.COMMANDS = COMMANDS;

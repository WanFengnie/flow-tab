// 斜杠妙招指令库与执行逻辑
const COMMANDS = [
  {
    cmd: '/google',
    name: 'Google 搜索',
    desc: '全球主流网页精准搜索',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://www.google.com/search?q=${q}` : 'https://www.google.com';
    }
  },
  {
    cmd: '/baidu',
    name: '百度搜索',
    desc: '中文互联网海量信息搜索',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7 7 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7 7 0 0 1 11 3.07V3a1 1 0 0 1 2 0v.07A7 7 0 0 1 18.93 9H19a1 1 0 0 1 0 2h-.07A7 7 0 0 1 13 16.93z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://www.baidu.com/s?wd=${q}` : 'https://www.baidu.com';
    }
  },
  {
    cmd: '/bing',
    name: '微软必应',
    desc: '微软必应智能搜索',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v18l5.5-2.5L14 21l5-3V9l-8.5-3z"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://cn.bing.com/search?q=${q}` : 'https://cn.bing.com';
    }
  },
  {
    cmd: '/deepseek',
    name: 'DeepSeek 智能问答',
    desc: '深度思考与 AI 智能对话',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://chat.deepseek.com/?q=${q}` : 'https://chat.deepseek.com/';
    }
  },
  {
    cmd: '/chatgpt',
    name: 'ChatGPT 对话',
    desc: 'OpenAI 语言大模型助手',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v8m-4-4h8"/></svg>`,
    action: (query) => {
      const q = encodeURIComponent(query.trim());
      window.location.href = q ? `https://chatgpt.com/?q=${q}` : 'https://chatgpt.com';
    }
  },
  {
    cmd: '/github',
    name: 'GitHub 仓库',
    desc: '搜索全球开源代码与项目',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
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

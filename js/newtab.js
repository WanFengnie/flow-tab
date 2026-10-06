// Flow Tab 主逻辑控制器
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 初始化主题与偏好设置
  await ThemeManager.init();

  // 2. DOM 元素缓存
  const mainInput = document.getElementById('mainInput');
  const sendBtn = document.getElementById('sendActionBtn');
  const slashPalette = document.getElementById('slashPalette');
  const paletteList = document.getElementById('paletteList');
  const engineSelectorChip = document.getElementById('engineSelectorChip');
  const engineChipName = document.getElementById('engineChipName');
  const engineMenu = document.getElementById('engineMenu');
  const atMentionBtn = document.getElementById('atMentionBtn');
  const bentoBtn = document.getElementById('bentoBtn');
  const bentoMenu = document.getElementById('bentoMenu');
  
  // 侧边栏抽屉相关
  const drawerToggleBtn = document.getElementById('drawerToggleBtn');
  const sidebarDrawer = document.getElementById('sidebarDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerBookmarksList = document.getElementById('drawerBookmarksList');
  const drawerHistoryList = document.getElementById('drawerHistoryList');
  const memoTextarea = document.getElementById('memoTextarea');

  // 主题设置相关
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeSettings = document.getElementById('themeSettings');
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  const pillSwitch = document.getElementById('pillSwitch');
  const defaultEngineSelect = document.getElementById('defaultEngineSelect');

  let selectedPaletteIndex = 0;
  let filteredCommands = [...COMMANDS];
  let currentActiveEngine = ThemeManager.defaultEngine || 'google';

  // 3. 引擎元数据与映射
  const ENGINES = {
    google: { name: 'Google', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
    baidu: { name: '百度', url: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
    bing: { name: '必应', url: (q) => `https://cn.bing.com/search?q=${encodeURIComponent(q)}` },
    deepseek: { name: 'DeepSeek', url: (q) => `https://chat.deepseek.com/?q=${encodeURIComponent(q)}` },
    chatgpt: { name: 'ChatGPT', url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
    github: { name: 'GitHub', url: (q) => `https://github.com/search?q=${encodeURIComponent(q)}` }
  };

  function updateEngineDisplay(engineKey) {
    currentActiveEngine = engineKey;
    if (ENGINES[engineKey]) {
      engineChipName.textContent = ENGINES[engineKey].name;
    } else {
      engineChipName.textContent = 'Default';
    }
    // 同步下拉单选激活态
    document.querySelectorAll('.engine-option').forEach(opt => {
      if (opt.getAttribute('data-engine') === engineKey) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  updateEngineDisplay(currentActiveEngine);

  // 4. 输入框状态检测与交互
  function handleInputChange() {
    const value = mainInput.value;
    // 发送按钮激活态
    if (value.trim().length > 0) {
      sendBtn.classList.add('active');
    } else {
      sendBtn.classList.remove('active');
    }

    // 检测是否唤起妙招面板（以 / 开头，或者包含 /）
    if (value.startsWith('/')) {
      const keyword = value.slice(1).toLowerCase().trim();
      filteredCommands = COMMANDS.filter(c => 
        c.cmd.toLowerCase().includes(keyword) || 
        c.name.toLowerCase().includes(keyword) ||
        c.desc.toLowerCase().includes(keyword)
      );
      renderPaletteList();
      showPalette();
    } else {
      hidePalette();
    }
  }

  mainInput.addEventListener('input', handleInputChange);

  // 聚焦时若以 / 开头则展示
  mainInput.addEventListener('focus', () => {
    if (mainInput.value.startsWith('/')) {
      showPalette();
    }
  });

  // 5. 斜杠妙招面板渲染
  function renderPaletteList() {
    paletteList.innerHTML = '';
    if (filteredCommands.length === 0) {
      paletteList.innerHTML = `<li style="padding: 16px; text-align: center; color: var(--text-tertiary); font-size: 13px;">未找到匹配妙招指令</li>`;
      return;
    }

    filteredCommands.forEach((cmdItem, index) => {
      const li = document.createElement('li');
      li.className = `palette-item ${index === selectedPaletteIndex ? 'selected' : ''}`;
      li.innerHTML = `
        <div class="palette-item-left">
          <div class="palette-icon">${cmdItem.icon}</div>
          <div class="palette-info">
            <div class="palette-title">
              ${cmdItem.name}
              <span class="palette-cmd-tag">${cmdItem.cmd}</span>
            </div>
            <div class="palette-desc">${cmdItem.desc}</div>
          </div>
        </div>
        <div class="palette-shortcut-badge">↵ 回车</div>
      `;
      li.addEventListener('click', () => {
        executeCommandItem(cmdItem);
      });
      paletteList.appendChild(li);
    });
  }

  function showPalette() {
    selectedPaletteIndex = 0;
    renderPaletteList();
    slashPalette.classList.remove('hidden');
  }

  function hidePalette() {
    slashPalette.classList.add('hidden');
  }

  function executeCommandItem(cmdItem) {
    const rawVal = mainInput.value.trim();
    const parts = rawVal.split(/\s+/);
    let query = '';
    if (parts.length > 1) {
      query = parts.slice(1).join(' ');
    }
    hidePalette();
    cmdItem.action(query);
  }

  // 6. 搜索执行逻辑
  function executeSearchOrAction() {
    const text = mainInput.value.trim();
    if (!text) {
      mainInput.focus();
      return;
    }

    // 优先：如果正打开且有妙招命令选中
    if (!slashPalette.classList.contains('hidden') && filteredCommands[selectedPaletteIndex]) {
      executeCommandItem(filteredCommands[selectedPaletteIndex]);
      return;
    }

    // 如果是直接以 / 开头的命令，如 "/bilibili 柯南"
    if (text.startsWith('/')) {
      const parts = text.split(/\s+/);
      const cmdStr = parts[0].toLowerCase();
      const matched = COMMANDS.find(c => c.cmd.toLowerCase() === cmdStr);
      if (matched) {
        const query = parts.slice(1).join(' ');
        matched.action(query);
        return;
      }
    }

    // 如果用户输入的是合法网址（包含协议或常见域名后缀）
    const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(text);
    if (isUrl) {
      const targetUrl = text.startsWith('http://') || text.startsWith('https://') ? text : `https://${text}`;
      window.location.href = targetUrl;
      return;
    }

    // 默认使用当前选中的引擎进行常规搜索
    const engine = ENGINES[currentActiveEngine] || ENGINES.google;
    window.location.href = engine.url(text);
  }

  // 键盘快捷控制
  mainInput.addEventListener('keydown', (e) => {
    // 妙招面板展开时的上下方向键与回车切换
    if (!slashPalette.classList.contains('hidden') && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex + 1) % filteredCommands.length;
        renderPaletteList();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderPaletteList();
        return;
      }
      if (e.key === 'Escape') {
        hidePalette();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearchOrAction();
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearchOrAction();
    }
  });

  sendBtn.addEventListener('click', executeSearchOrAction);

  // 全局快捷键：随时按 "/" 聚焦输入框并触发妙招
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== mainInput && document.activeElement !== memoTextarea) {
      e.preventDefault();
      mainInput.focus();
      mainInput.value = '/';
      handleInputChange();
    }
  });

  // 7. @ 按钮与引擎切换下拉菜单
  atMentionBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
    bentoMenu.classList.add('hidden');
    themeSettings.classList.add('hidden');
  });

  engineSelectorChip.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
    bentoMenu.classList.add('hidden');
    themeSettings.classList.add('hidden');
  });

  document.querySelectorAll('.engine-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const engineKey = opt.getAttribute('data-engine');
      updateEngineDisplay(engineKey);
      engineMenu.classList.add('hidden');
      mainInput.focus();
    });
  });

  // 8. Bento 常用应用快捷网格
  bentoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    bentoMenu.classList.toggle('hidden');
    engineMenu.classList.add('hidden');
    themeSettings.classList.add('hidden');
  });

  // 9. 左侧抽屉控制 (Drawer)
  function openDrawer(tabName = 'bookmarks', filter = '') {
    sidebarDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    switchDrawerTab(tabName);
    if (tabName === 'bookmarks') loadBookmarks(filter);
    if (tabName === 'history') loadHistory(filter);
  }

  function closeDrawer() {
    sidebarDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
  }

  drawerToggleBtn.addEventListener('click', () => openDrawer('bookmarks'));
  drawerCloseBtn.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  window.addEventListener('open-drawer', (e) => {
    const { tab, filter, noteText } = e.detail;
    openDrawer(tab || 'bookmarks', filter);
    if (noteText && memoTextarea) {
      memoTextarea.value += (memoTextarea.value ? '\n' : '') + noteText;
      StorageService.set('user_memo', memoTextarea.value);
    }
  });

  // 抽屉 Tab 切换
  function switchDrawerTab(tabName) {
    document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.drawer-tab-pane').forEach(pane => {
      if (pane.id === `tabPane-${tabName}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });
  }

  document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchDrawerTab(tab);
      if (tab === 'bookmarks') loadBookmarks();
      if (tab === 'history') loadHistory();
    });
  });

  // 书签加载
  function loadBookmarks(filter = '') {
    drawerBookmarksList.innerHTML = '';
    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
      chrome.bookmarks.getTree((treeNodes) => {
        const bookmarks = [];
        function traverse(nodes) {
          for (const node of nodes) {
            if (node.url) {
              bookmarks.push(node);
            }
            if (node.children) {
              traverse(node.children);
            }
          }
        }
        traverse(treeNodes);

        const list = filter 
          ? bookmarks.filter(b => b.title.toLowerCase().includes(filter.toLowerCase()) || b.url.toLowerCase().includes(filter.toLowerCase()))
          : bookmarks.slice(0, 30);

        if (list.length === 0) {
          drawerBookmarksList.innerHTML = `<div style="text-align:center; color:var(--text-tertiary); padding:20px;">未找到匹配书签</div>`;
          return;
        }

        list.forEach(bm => {
          const a = document.createElement('a');
          a.className = 'drawer-list-item';
          a.href = bm.url;
          a.target = '_blank';
          a.innerHTML = `
            <span style="opacity:0.7;">★</span>
            <span class="drawer-item-title">${bm.title || bm.url}</span>
          `;
          drawerBookmarksList.appendChild(a);
        });
      });
    } else {
      // 演示模拟常用书签
      const mockBookmarks = [
        { title: 'GitHub - 开源宝库', url: 'https://github.com' },
        { title: '哔哩哔哩 - 弹幕视频网', url: 'https://www.bilibili.com' },
        { title: '掘金 - 开发者社区', url: 'https://juejin.cn' },
        { title: 'V2EX - 创意工作者', url: 'https://v2ex.com' },
        { title: '知乎 - 有问题就会有答案', url: 'https://www.zhihu.com' },
        { title: 'YouTube - 全球视频', url: 'https://www.youtube.com' }
      ];
      mockBookmarks.forEach(bm => {
        const a = document.createElement('a');
        a.className = 'drawer-list-item';
        a.href = bm.url;
        a.innerHTML = `<span>★</span><span class="drawer-item-title">${bm.title}</span>`;
        drawerBookmarksList.appendChild(a);
      });
    }
  }

  // 历史记录加载
  function loadHistory(filter = '') {
    drawerHistoryList.innerHTML = '';
    if (typeof chrome !== 'undefined' && chrome.history && chrome.history.search) {
      chrome.history.search({ text: filter, maxResults: 30 }, (items) => {
        if (!items || items.length === 0) {
          drawerHistoryList.innerHTML = `<div style="text-align:center; color:var(--text-tertiary); padding:20px;">暂无历史记录</div>`;
          return;
        }
        items.forEach(h => {
          const a = document.createElement('a');
          a.className = 'drawer-list-item';
          a.href = h.url;
          a.target = '_blank';
          a.innerHTML = `
            <span style="opacity:0.6;">⏱</span>
            <span class="drawer-item-title">${h.title || h.url}</span>
          `;
          drawerHistoryList.appendChild(a);
        });
      });
    } else {
      drawerHistoryList.innerHTML = `<div style="text-align:center; color:var(--text-tertiary); padding:20px;">安装到 Chrome 浏览器后自动展示最近访问历史</div>`;
    }
  }

  // 便签保存
  if (memoTextarea) {
    StorageService.get('user_memo', '').then(memo => {
      memoTextarea.value = memo || '';
    });

    memoTextarea.addEventListener('input', () => {
      StorageService.set('user_memo', memoTextarea.value);
    });
  }

  // 10. 右下角个性化与主题面板
  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeSettings.classList.toggle('hidden');
    engineMenu.classList.add('hidden');
    bentoMenu.classList.add('hidden');
  });

  window.addEventListener('toggle-theme-modal', () => {
    themeSettings.classList.toggle('hidden');
  });

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      ThemeManager.applyAccent(color);
    });
  });

  if (darkModeSwitch) {
    darkModeSwitch.checked = ThemeManager.currentMode === 'dark';
    darkModeSwitch.addEventListener('change', () => {
      ThemeManager.applyMode(darkModeSwitch.checked ? 'dark' : 'light');
    });
  }

  if (pillSwitch) {
    pillSwitch.checked = ThemeManager.showBottomPill;
    pillSwitch.addEventListener('change', () => {
      ThemeManager.applyBottomPill(pillSwitch.checked);
    });
  }

  if (defaultEngineSelect) {
    defaultEngineSelect.value = ThemeManager.defaultEngine;
    defaultEngineSelect.addEventListener('change', () => {
      ThemeManager.defaultEngine = defaultEngineSelect.value;
      StorageService.set('default_engine', defaultEngineSelect.value);
      updateEngineDisplay(defaultEngineSelect.value);
    });
  }

  // 11. 底部胶囊点击事件：复制快捷指令提示
  const bottomPill = document.getElementById('bottomPill');
  if (bottomPill) {
    bottomPill.addEventListener('click', (e) => {
      e.preventDefault();
      mainInput.focus();
      mainInput.value = '/';
      handleInputChange();
    });
  }

  // 12. 全局点击外部区域自动收起弹出层 (Light Dismiss)
  document.addEventListener('click', (e) => {
    if (!slashPalette.contains(e.target) && e.target !== mainInput) {
      hidePalette();
    }
    if (!engineMenu.contains(e.target) && !engineSelectorChip.contains(e.target) && !atMentionBtn.contains(e.target)) {
      engineMenu.classList.add('hidden');
    }
    if (!bentoMenu.contains(e.target) && !bentoBtn.contains(e.target)) {
      bentoMenu.classList.add('hidden');
    }
    if (!themeSettings.contains(e.target) && !themeToggleBtn.contains(e.target)) {
      themeSettings.classList.add('hidden');
    }
  });
});

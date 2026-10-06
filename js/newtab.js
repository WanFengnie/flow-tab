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
  const bentoBtn = document.getElementById('bentoBtn');
  const bentoMenu = document.getElementById('bentoMenu');
  const bentoGrid = document.getElementById('bentoGrid');
  const bentoAddToggleBtn = document.getElementById('bentoAddToggleBtn');
  const bentoAddForm = document.getElementById('bentoAddForm');
  const shortcutNameInput = document.getElementById('shortcutNameInput');
  const shortcutUrlInput = document.getElementById('shortcutUrlInput');
  const bentoSaveBtn = document.getElementById('bentoSaveBtn');
  const bentoCancelBtn = document.getElementById('bentoCancelBtn');
  
  // 侧边栏抽屉相关
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
    if (defaultEngineSelect && defaultEngineSelect.value !== engineKey) {
      defaultEngineSelect.value = engineKey;
    }
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

  // 7. 引擎切换下拉菜单
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
      ThemeManager.defaultEngine = engineKey;
      StorageService.set('default_engine', engineKey);
      engineMenu.classList.add('hidden');
      mainInput.focus();
    });
  });

  // 8. Bento 自定义常用快捷站点管理（默认为空）
  let customShortcuts = await StorageService.get('custom_shortcuts', []);

  function renderBentoShortcuts() {
    if (!bentoGrid) return;
    bentoGrid.innerHTML = '';
    if (customShortcuts.length === 0) {
      bentoGrid.classList.add('is-empty');
      bentoGrid.innerHTML = `
        <div class="bento-empty-state">
          <span>暂无自定义快捷站点</span>
          <button type="button" class="bento-empty-add-btn" id="bentoEmptyAddBtn">+ 点击添加站点</button>
        </div>
      `;
      const emptyAddBtn = document.getElementById('bentoEmptyAddBtn');
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', () => {
          showBentoForm();
        });
      }
      return;
    }

    bentoGrid.classList.remove('is-empty');
    customShortcuts.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'bento-app-item';
      el.dataset.id = item.id;

      let domain = '';
      try {
        domain = new URL(item.url).hostname;
      } catch (e) {
        domain = item.url.replace(/https?:\/\//, '').split('/')[0];
      }
      const firstChar = (item.name || domain || '?').charAt(0).toUpperCase();

      el.innerHTML = `
        <button type="button" class="bento-item-delete" title="删除" aria-label="删除">✕</button>
        <a href="${item.url}" target="_blank" class="bento-app-link">
          <div class="bento-app-icon">
            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="${item.name}" />
            <span class="bento-fallback-icon" style="display:none;">${firstChar}</span>
          </div>
          <span class="bento-app-name" title="${item.name}">${item.name}</span>
        </a>
      `;

      const img = el.querySelector('img');
      const fallback = el.querySelector('.bento-fallback-icon');
      img.addEventListener('error', () => {
        img.style.display = 'none';
        fallback.style.display = 'flex';
      });

      const delBtn = el.querySelector('.bento-item-delete');
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeShortcut(item.id);
      });

      bentoGrid.appendChild(el);
    });
  }

  function showBentoForm() {
    bentoAddForm.classList.remove('hidden');
    shortcutNameInput.focus();
  }

  function hideBentoForm() {
    bentoAddForm.classList.add('hidden');
    shortcutNameInput.value = '';
    shortcutUrlInput.value = '';
  }

  async function saveShortcut() {
    let rawUrl = shortcutUrlInput.value.trim();
    if (!rawUrl) {
      shortcutUrlInput.focus();
      return;
    }
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = 'https://' + rawUrl;
    }

    let name = shortcutNameInput.value.trim();
    if (!name) {
      try {
        name = new URL(rawUrl).hostname.replace(/^www\./, '');
      } catch (e) {
        name = rawUrl;
      }
    }

    const newShortcut = {
      id: 'sc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name,
      url: rawUrl
    };

    customShortcuts.push(newShortcut);
    await StorageService.set('custom_shortcuts', customShortcuts);
    renderBentoShortcuts();
    hideBentoForm();
  }

  async function removeShortcut(id) {
    customShortcuts = customShortcuts.filter(s => s.id !== id);
    await StorageService.set('custom_shortcuts', customShortcuts);
    renderBentoShortcuts();
  }

  if (bentoAddToggleBtn) {
    bentoAddToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bentoAddForm.classList.contains('hidden')) {
        showBentoForm();
      } else {
        hideBentoForm();
      }
    });
  }

  if (bentoCancelBtn) {
    bentoCancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideBentoForm();
    });
  }

  if (bentoSaveBtn) {
    bentoSaveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveShortcut();
    });
  }

  if (shortcutUrlInput) {
    shortcutUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveShortcut();
      }
    });
  }
  if (shortcutNameInput) {
    shortcutNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        shortcutUrlInput.focus();
      }
    });
  }

  renderBentoShortcuts();

  // 点击展开/收起 Bento 面板
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

  if (defaultEngineSelect) {
    defaultEngineSelect.value = ThemeManager.defaultEngine;
    defaultEngineSelect.addEventListener('change', () => {
      ThemeManager.defaultEngine = defaultEngineSelect.value;
      StorageService.set('default_engine', defaultEngineSelect.value);
      updateEngineDisplay(defaultEngineSelect.value);
    });
  }

  // 11. 全局点击外部区域自动收起弹出层 (Light Dismiss)
  document.addEventListener('click', (e) => {
    if (!slashPalette.contains(e.target) && e.target !== mainInput) {
      hidePalette();
    }
    if (!engineMenu.contains(e.target) && !engineSelectorChip.contains(e.target)) {
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

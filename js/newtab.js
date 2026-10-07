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

  // 自定义搜索引擎 DOM 缓存与状态
  const customEnginesList = document.getElementById('customEnginesList');
  const customEngineAddBtn = document.getElementById('customEngineAddBtn');
  const customEngineForm = document.getElementById('customEngineForm');
  const customEngineFormTitle = document.getElementById('customEngineFormTitle');
  const customEngineNameInput = document.getElementById('customEngineNameInput');
  const customEngineUrlInput = document.getElementById('customEngineUrlInput');
  const customEngineSaveBtn = document.getElementById('customEngineSaveBtn');
  const customEngineCancelBtn = document.getElementById('customEngineCancelBtn');

  let editingEngineId = null;

  // 自定义搜索引擎列表持久化数据与平滑迁移
  let customEngines = await StorageService.get('custom_engines', []);
  if (!Array.isArray(customEngines) || customEngines.length === 0) {
    const legacyUrl = await StorageService.get('custom_engine_url', '');
    const legacyName = await StorageService.get('custom_engine_name', '自定义');
    if (legacyUrl) {
      customEngines = [{
        id: 'ce_' + Date.now(),
        name: legacyName || '自定义',
        url: legacyUrl
      }];
      await StorageService.set('custom_engines', customEngines);
    } else {
      customEngines = [];
    }
  }

  // 辅助函数：根据模板动态拼接自定义搜索地址
  function formatCustomSearchUrl(template, query) {
    const q = encodeURIComponent(query.trim());
    const t = (template || '').trim();
    if (!t) {
      return `https://duckduckgo.com/?q=${q}`;
    }
    if (t.includes('%s')) {
      return t.replace(/%s/g, q);
    }
    if (t.includes('{q}')) {
      return t.replace(/\{q\}/g, q);
    }
    if (t.endsWith('=') || t.endsWith('?') || t.endsWith('/')) {
      return t + q;
    }
    return t.includes('?') ? `${t}&q=${q}` : `${t}?q=${q}`;
  }

  // 主题设置相关
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeSettings = document.getElementById('themeSettings');
  const darkModeSwitch = document.getElementById('darkModeSwitch');

  let selectedPaletteIndex = 0;
  let filteredCommands = [...COMMANDS];
  let currentActiveEngine = ThemeManager.defaultEngine || 'google';

  // 3. 基础预设引擎元数据
  const ENGINES = {
    google: { name: 'Google', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
    baidu: { name: '百度', url: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
    bing: { name: '必应', url: (q) => `https://cn.bing.com/search?q=${encodeURIComponent(q)}` },
    github: { name: 'GitHub', url: (q) => `https://github.com/search?q=${encodeURIComponent(q)}` }
  };

  function getActiveEngineExecutor() {
    if (ENGINES[currentActiveEngine]) {
      return ENGINES[currentActiveEngine];
    }
    const customItem = customEngines.find(c => c.id === currentActiveEngine);
    if (customItem) {
      return {
        name: customItem.name,
        url: (q) => formatCustomSearchUrl(customItem.url, q)
      };
    }
    return ENGINES.google;
  }

  function updateEngineDisplay(engineKey) {
    currentActiveEngine = engineKey;
    const customItem = customEngines.find(c => c.id === engineKey);
    if (customItem) {
      engineChipName.textContent = customItem.name;
    } else if (ENGINES[engineKey]) {
      engineChipName.textContent = ENGINES[engineKey].name;
    } else {
      engineChipName.textContent = 'Google';
      currentActiveEngine = 'google';
    }

    // 同步基础 4 选项激活态
    document.querySelectorAll('#engineMenu .engine-option:not(.custom-engine-item)').forEach(opt => {
      if (opt.getAttribute('data-engine') === currentActiveEngine) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    // 同步自定义选项激活态
    document.querySelectorAll('.custom-engine-item').forEach(opt => {
      if (opt.getAttribute('data-engine') === currentActiveEngine) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  function renderCustomEngines() {
    if (!customEnginesList) return;
    customEnginesList.innerHTML = '';
    if (customEngines.length === 0) {
      customEnginesList.innerHTML = `<div class="custom-engines-empty">暂无自定义，点击上方“+ 添加”</div>`;
      return;
    }

    let draggedEngineId = null;

    customEngines.forEach(item => {
      const div = document.createElement('div');
      div.className = `engine-option custom-engine-item ${item.id === currentActiveEngine ? 'active' : ''}`;
      div.setAttribute('data-engine', item.id);
      div.setAttribute('draggable', 'true');

      div.innerHTML = `
        <div class="engine-option-left">
          <span class="engine-option-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </span>
          <span class="custom-engine-name-text" title="${item.name}">${item.name}</span>
        </div>
        <div class="custom-engine-actions-right">
          <button type="button" class="custom-engine-edit-btn" title="编辑" aria-label="编辑">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
          <button type="button" class="custom-engine-del-btn" title="删除" aria-label="删除">✕</button>
        </div>
      `;

      div.addEventListener('click', () => {
        selectEngine(item.id);
      });

      // 拖拽排序事件监听
      div.addEventListener('dragstart', (e) => {
        if (e.target.closest('.custom-engine-edit-btn') || e.target.closest('.custom-engine-del-btn')) {
          e.preventDefault();
          return;
        }
        draggedEngineId = item.id;
        div.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
      });

      div.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedEngineId && draggedEngineId !== item.id) {
          div.classList.add('drag-over');
        }
      });

      div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
      });

      div.addEventListener('drop', async (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');
        if (!draggedEngineId || draggedEngineId === item.id) return;

        const fromIndex = customEngines.findIndex(c => c.id === draggedEngineId);
        const toIndex = customEngines.findIndex(c => c.id === item.id);
        if (fromIndex !== -1 && toIndex !== -1) {
          const [moved] = customEngines.splice(fromIndex, 1);
          customEngines.splice(toIndex, 0, moved);
          await StorageService.set('custom_engines', customEngines);
          renderCustomEngines();
        }
      });

      div.addEventListener('dragend', () => {
        draggedEngineId = null;
        document.querySelectorAll('.custom-engine-item').forEach(el => {
          el.classList.remove('is-dragging', 'drag-over');
        });
      });

      const editBtn = div.querySelector('.custom-engine-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCustomEngineForm(item);
        });
      }

      const delBtn = div.querySelector('.custom-engine-del-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomEngine(item.id);
        });
      }

      customEnginesList.appendChild(div);
    });
  }

  renderCustomEngines();
  updateEngineDisplay(currentActiveEngine);

  // --- 搜索联想与历史记录管理 ---
  const searchSuggestionsPopover = document.getElementById('searchSuggestionsPopover');
  const suggestionsList = document.getElementById('suggestionsList');
  const suggestionsHeaderTitle = document.getElementById('suggestionsHeaderTitle');
  const searchSuggestionsSwitch = document.getElementById('searchSuggestionsSwitch');

  let searchHistory = [];
  let enableSearchSuggestions = true;
  let currentSuggestions = [];
  let selectedSuggestionIndex = -1;
  let suggestDebounceTimer = null;

  StorageService.get('search_history', []).then(h => {
    searchHistory = Array.isArray(h) ? h : [];
  });
  StorageService.get('enable_search_suggestions', true).then(enabled => {
    enableSearchSuggestions = enabled !== false;
    if (searchSuggestionsSwitch) {
      searchSuggestionsSwitch.checked = enableSearchSuggestions;
    }
  });

  if (searchSuggestionsSwitch) {
    searchSuggestionsSwitch.addEventListener('change', () => {
      enableSearchSuggestions = searchSuggestionsSwitch.checked;
      StorageService.set('enable_search_suggestions', enableSearchSuggestions);
      if (!enableSearchSuggestions) {
        hideSuggestions();
      }
    });
  }

  function addSearchHistoryItem(text) {
    if (!enableSearchSuggestions) return;
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('/')) return;
    searchHistory = searchHistory.filter(item => item !== trimmed);
    searchHistory.unshift(trimmed);
    if (searchHistory.length > 20) {
      searchHistory = searchHistory.slice(0, 20);
    }
    StorageService.set('search_history', searchHistory);
  }

  function deleteSearchHistoryItem(itemToDelete, e) {
    if (e) e.stopPropagation();
    searchHistory = searchHistory.filter(item => item !== itemToDelete);
    StorageService.set('search_history', searchHistory);
    updateSuggestionsView();
  }

  async function fetchEngineSuggestions(query, engineKey) {
    const q = encodeURIComponent(query.trim());
    if (!q) return [];
    let url = '';
    if (engineKey === 'baidu') {
      url = `https://suggestion.baidu.com/su?wd=${q}&action=opensearch&ie=utf-8`;
    } else if (engineKey === 'bing' || engineKey === 'custom') {
      url = `https://api.bing.com/osjson.aspx?query=${q}`;
    } else {
      url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${q}`;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 8);
      }
      return [];
    } catch (err) {
      return [];
    }
  }

  function hideSuggestions() {
    if (searchSuggestionsPopover) {
      searchSuggestionsPopover.classList.add('hidden');
    }
    selectedSuggestionIndex = -1;
    currentSuggestions = [];
  }

  function showSuggestions() {
    if (!searchSuggestionsPopover || currentSuggestions.length === 0 || !enableSearchSuggestions) {
      hideSuggestions();
      return;
    }
    searchSuggestionsPopover.classList.remove('hidden');
  }

  function updateSuggestionsView() {
    if (!enableSearchSuggestions) {
      hideSuggestions();
      return;
    }
    const val = mainInput.value.trim();
    if (val.startsWith('/')) {
      hideSuggestions();
      return;
    }

    // 输入框为空时，若有历史记录则展示
    if (val === '') {
      clearTimeout(suggestDebounceTimer);
      if (searchHistory.length === 0) {
        hideSuggestions();
        return;
      }
      currentSuggestions = searchHistory.slice(0, 8).map(text => ({ type: 'history', text }));
      selectedSuggestionIndex = -1;
      if (suggestionsHeaderTitle) suggestionsHeaderTitle.textContent = '历史搜索记录';
      renderSuggestionsList();
      showSuggestions();
      return;
    }

    // 输入框有文字时：本地历史过滤 + 防抖网络联想
    const matchedHistory = searchHistory.filter(h => h.toLowerCase().includes(val.toLowerCase())).slice(0, 3);
    clearTimeout(suggestDebounceTimer);
    suggestDebounceTimer = setTimeout(async () => {
      if (!mainInput.value.trim() || mainInput.value.trim().startsWith('/')) return;
      const remoteKeywords = await fetchEngineSuggestions(val, currentActiveEngine);
      const filteredRemote = remoteKeywords.filter(r => !matchedHistory.includes(r)).slice(0, 6);

      currentSuggestions = [
        ...matchedHistory.map(text => ({ type: 'history', text })),
        ...filteredRemote.map(text => ({ type: 'suggest', text }))
      ];

      selectedSuggestionIndex = -1;
      if (suggestionsHeaderTitle) {
        suggestionsHeaderTitle.textContent = matchedHistory.length > 0 ? '历史与搜索建议' : '搜索引擎联想';
      }

      if (currentSuggestions.length > 0) {
        renderSuggestionsList();
        showSuggestions();
      } else {
        hideSuggestions();
      }
    }, 50);
  }

  function renderSuggestionsList() {
    suggestionsList.innerHTML = '';
    currentSuggestions.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = `suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''} ${item.type === 'history' ? 'is-history' : ''}`;
      
      const isHistory = item.type === 'history';
      const iconSvg = isHistory
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

      li.innerHTML = `
        <div class="suggestion-item-left">
          <div class="suggestion-icon">${iconSvg}</div>
          <span class="suggestion-text">${item.text}</span>
        </div>
        <div class="suggestion-item-right">
          ${isHistory ? `<button class="suggestion-delete-btn" title="删除此条记录" aria-label="删除记录">✕</button>` : `<span class="suggestion-type-badge">联想</span>`}
        </div>
      `;

      if (isHistory) {
        const delBtn = li.querySelector('.suggestion-delete-btn');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            deleteSearchHistoryItem(item.text, e);
          });
        }
      }

      li.addEventListener('click', () => {
        mainInput.value = item.text;
        hideSuggestions();
        executeSearchOrAction();
      });

      suggestionsList.appendChild(li);
    });
  }

  // 4. 输入框状态检测与交互
  function handleInputChange() {
    const value = mainInput.value;
    if (value.trim().length > 0) {
      sendBtn.classList.add('active');
    } else {
      sendBtn.classList.remove('active');
    }

    if (value.startsWith('/')) {
      hideSuggestions();
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
      updateSuggestionsView();
    }
  }

  mainInput.addEventListener('input', handleInputChange);

  mainInput.addEventListener('focus', () => {
    if (mainInput.value.startsWith('/')) {
      showPalette();
    } else {
      updateSuggestionsView();
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
      query = parts.slice(1).join(' ').trim();
    }

    // 针对系统工具类直达页面（无需参数，直接打开 Chrome 原生系统页）
    const isDirectSystemCmd = ['/bm', '/hist', '/ext', '/dl'].includes(cmdItem.cmd);
    if (isDirectSystemCmd) {
      hidePalette();
      cmdItem.action('');
      return;
    }

    // 针对搜索/翻译类指令（如 /bili, /yt, /trans 等）：
    // 若已有搜索词，直接执行搜索；
    // 若尚无搜索词（用户刚点击指令或按回车选择），将指令填入输入框并聚焦末尾，等待用户输入搜索词，避免空跳转
    if (query) {
      hidePalette();
      cmdItem.action(query);
    } else {
      mainInput.value = `${cmdItem.cmd} `;
      hidePalette();
      mainInput.focus();
      const len = mainInput.value.length;
      mainInput.setSelectionRange(len, len);
      handleInputChange();
    }
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

    // 如果是以 / 开头的命令，如 "/bili 柯南" 或仅有 "/bili"
    if (text.startsWith('/')) {
      const parts = text.split(/\s+/);
      const cmdStr = parts[0].toLowerCase();
      const matched = COMMANDS.find(c => c.cmd.toLowerCase() === cmdStr);
      if (matched) {
        const query = parts.slice(1).join(' ').trim();
        const isDirectSystemCmd = ['/bm', '/hist', '/ext', '/dl'].includes(matched.cmd);
        if (isDirectSystemCmd || query) {
          matched.action(query);
          return;
        } else {
          // 仅有指令名无搜索词时，补全空格并聚焦，提示用户继续输入
          mainInput.value = `${matched.cmd} `;
          mainInput.focus();
          const len = mainInput.value.length;
          mainInput.setSelectionRange(len, len);
          handleInputChange();
          return;
        }
      }
    }

    // 记录到历史并收起浮层
    addSearchHistoryItem(text);
    hideSuggestions();

    // 如果用户输入的是合法网址（包含协议或常见域名后缀）
    const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(text);
    if (isUrl) {
      const targetUrl = text.startsWith('http://') || text.startsWith('https://') ? text : `https://${text}`;
      window.location.href = targetUrl;
      return;
    }

    // 默认使用当前选中的引擎进行常规搜索
    const engine = getActiveEngineExecutor();
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

    // 搜索建议与历史浮层展开时的上下方向键与回车切换
    if (!searchSuggestionsPopover.classList.contains('hidden') && currentSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % currentSuggestions.length;
        mainInput.value = currentSuggestions[selectedSuggestionIndex].text;
        renderSuggestionsList();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
        mainInput.value = currentSuggestions[selectedSuggestionIndex].text;
        renderSuggestionsList();
        return;
      }
      if (e.key === 'Escape') {
        hideSuggestions();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
          mainInput.value = currentSuggestions[selectedSuggestionIndex].text;
        }
        hideSuggestions();
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

  // 全局快捷键：随时按 "/" 聚焦输入框并触发妙招；按 "Escape" 快捷收起开启的弹窗
  document.addEventListener('keydown', (e) => {
    const isEditing = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    if (e.key === '/' && !isEditing) {
      e.preventDefault();
      mainInput.focus();
      mainInput.value = '/';
      handleInputChange();
      return;
    }

    if (e.key === 'Escape') {
      hidePalette();
      hideSuggestions();
      if (engineMenu) {
        engineMenu.classList.add('hidden');
        hideCustomEngineForm();
      }
      if (bentoMenu) bentoMenu.classList.add('hidden');
      if (themeSettings) themeSettings.classList.add('hidden');
    }
  });

  // 7. 引擎切换下拉菜单与多自定义引擎管理
  function selectEngine(engineKey) {
    updateEngineDisplay(engineKey);
    ThemeManager.defaultEngine = engineKey;
    StorageService.set('default_engine', engineKey);
    engineMenu.classList.add('hidden');
    hideCustomEngineForm();
    mainInput.focus();
  }

  engineSelectorChip.addEventListener('click', (e) => {
    e.stopPropagation();
    hideCustomEngineForm();
    engineMenu.classList.toggle('hidden');
    bentoMenu.classList.add('hidden');
    themeSettings.classList.add('hidden');
  });

  // 绑定系统预设基础 4 个引擎项
  document.querySelectorAll('#engineMenu .engine-option:not(.custom-engine-item)').forEach(opt => {
    opt.addEventListener('click', () => {
      const engineKey = opt.getAttribute('data-engine');
      selectEngine(engineKey);
    });
  });

  function showCustomEngineForm(itemToEdit = null) {
    if (!customEngineForm) return;
    customEngineForm.classList.remove('hidden');
    if (itemToEdit) {
      editingEngineId = itemToEdit.id;
      if (customEngineFormTitle) customEngineFormTitle.textContent = '编辑自定义搜索引擎';
      if (customEngineNameInput) customEngineNameInput.value = itemToEdit.name;
      if (customEngineUrlInput) customEngineUrlInput.value = itemToEdit.url;
    } else {
      editingEngineId = null;
      if (customEngineFormTitle) customEngineFormTitle.textContent = '添加自定义搜索引擎';
      if (customEngineNameInput) customEngineNameInput.value = '';
      if (customEngineUrlInput) customEngineUrlInput.value = '';
    }
    setTimeout(() => {
      if (customEngineNameInput && !itemToEdit) {
        customEngineNameInput.focus();
      } else if (customEngineUrlInput) {
        customEngineUrlInput.focus();
      }
    }, 50);
  }

  function hideCustomEngineForm() {
    if (customEngineForm) {
      customEngineForm.classList.add('hidden');
      editingEngineId = null;
    }
  }

  async function saveCustomEngine() {
    let url = customEngineUrlInput ? customEngineUrlInput.value.trim() : '';
    if (!url) {
      if (customEngineUrlInput) customEngineUrlInput.focus();
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    let name = customEngineNameInput ? customEngineNameInput.value.trim() : '';
    if (!name) {
      try {
        name = new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        name = '自定义';
      }
    }

    let targetEngineId = '';
    if (editingEngineId) {
      const idx = customEngines.findIndex(c => c.id === editingEngineId);
      if (idx !== -1) {
        customEngines[idx].name = name;
        customEngines[idx].url = url;
        targetEngineId = editingEngineId;
      }
    } else {
      targetEngineId = 'ce_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      customEngines.push({
        id: targetEngineId,
        name: name,
        url: url
      });
    }

    await StorageService.set('custom_engines', customEngines);
    renderCustomEngines();
    selectEngine(targetEngineId);
  }

  async function deleteCustomEngine(id) {
    customEngines = customEngines.filter(c => c.id !== id);
    await StorageService.set('custom_engines', customEngines);
    if (currentActiveEngine === id) {
      selectEngine('google');
    }
    renderCustomEngines();
  }

  if (customEngineAddBtn) {
    customEngineAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showCustomEngineForm();
    });
  }

  if (customEngineCancelBtn) {
    customEngineCancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideCustomEngineForm();
    });
  }

  if (customEngineSaveBtn) {
    customEngineSaveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveCustomEngine();
    });
  }

  if (customEngineUrlInput) {
    customEngineUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCustomEngine();
      }
    });
  }

  if (customEngineNameInput) {
    customEngineNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (customEngineUrlInput) customEngineUrlInput.focus();
      }
    });
  }

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

    function getFaviconUrl(targetUrl) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        try {
          const url = new URL(chrome.runtime.getURL('/_favicon/'));
          url.searchParams.set('pageUrl', targetUrl);
          url.searchParams.set('size', '64');
          return url.toString();
        } catch (e) {}
      }
      try {
        const domain = new URL(targetUrl).hostname;
        return `https://${domain}/favicon.ico`;
      } catch (e) {
        return '';
      }
    }

    let draggedShortcutId = null;

    customShortcuts.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'bento-app-item';
      el.dataset.id = item.id;
      el.setAttribute('draggable', 'true');

      let domain = '';
      try {
        domain = new URL(item.url).hostname;
      } catch (e) {
        domain = item.url.replace(/https?:\/\//, '').split('/')[0];
      }
      const firstChar = (item.name || domain || '?').charAt(0).toUpperCase();
      const faviconSrc = getFaviconUrl(item.url);

      el.innerHTML = `
        <button type="button" class="bento-item-delete" title="删除" aria-label="删除">✕</button>
        <a href="${item.url}" target="_blank" class="bento-app-link" draggable="false">
          <div class="bento-app-icon">
            <img src="${faviconSrc}" alt="${item.name}" draggable="false" />
            <span class="bento-fallback-icon" style="display:none;">${firstChar}</span>
          </div>
          <span class="bento-app-name" title="${item.name}">${item.name}</span>
        </a>
      `;

      // 拖拽排序事件监听
      el.addEventListener('dragstart', (e) => {
        if (e.target.closest('.bento-item-delete')) {
          e.preventDefault();
          return;
        }
        draggedShortcutId = item.id;
        el.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedShortcutId && draggedShortcutId !== item.id) {
          el.classList.add('drag-over');
        }
      });

      el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over');
      });

      el.addEventListener('drop', async (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        if (!draggedShortcutId || draggedShortcutId === item.id) return;

        const fromIndex = customShortcuts.findIndex(s => s.id === draggedShortcutId);
        const toIndex = customShortcuts.findIndex(s => s.id === item.id);
        if (fromIndex !== -1 && toIndex !== -1) {
          const [moved] = customShortcuts.splice(fromIndex, 1);
          customShortcuts.splice(toIndex, 0, moved);
          await StorageService.set('custom_shortcuts', customShortcuts);
          renderBentoShortcuts();
        }
      });

      el.addEventListener('dragend', () => {
        draggedShortcutId = null;
        document.querySelectorAll('.bento-app-item').forEach(itemEl => {
          itemEl.classList.remove('is-dragging', 'drag-over');
        });
      });

      const img = el.querySelector('img');
      const fallback = el.querySelector('.bento-fallback-icon');
      img.addEventListener('error', () => {
        if (domain && !img.dataset.triedDomainIco) {
          img.dataset.triedDomainIco = 'true';
          img.src = `https://${domain}/favicon.ico`;
          return;
        }
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
      ThemeManager.applyAccent(color, true);
    });
  });



  if (darkModeSwitch) {
    darkModeSwitch.checked = ThemeManager.currentMode === 'dark';
    darkModeSwitch.addEventListener('change', () => {
      ThemeManager.applyMode(darkModeSwitch.checked ? 'dark' : 'light');
    });
  }


  // 11. 全局点击外部区域自动收起弹出层 (Light Dismiss)
  document.addEventListener('click', (e) => {
    if (!slashPalette.contains(e.target) && e.target !== mainInput) {
      hidePalette();
    }
    if (searchSuggestionsPopover && !searchSuggestionsPopover.contains(e.target) && e.target !== mainInput) {
      hideSuggestions();
    }
    if (!engineMenu.contains(e.target) && !engineSelectorChip.contains(e.target)) {
      engineMenu.classList.add('hidden');
      hideCustomEngineForm();
    }
    if (!bentoMenu.contains(e.target) && !bentoBtn.contains(e.target)) {
      bentoMenu.classList.add('hidden');
    }
    if (!themeSettings.contains(e.target) && !themeToggleBtn.contains(e.target)) {
      themeSettings.classList.add('hidden');
    }
  });
});

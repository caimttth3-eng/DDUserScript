// ==UserScript==
// @name         1000qm 屏蔽助手
// @namespace    https://github.com/caimttth3-eng/DDUserScript
// @version      1.4
// @description  在阡陌居(1000qm.vip)所有版块按分类/作者屏蔽帖子；首页自动签到+领每日威望红包。
// @author       caimttth3-eng
// @match        https://www.1000qm.vip/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const KEY_CAT = 'qm_block_categories_v1';
  const KEY_USER = 'qm_block_users_v1';

  /* ---------- 存储：优先 GM_*，回退 localStorage ---------- */
  const store = {
    get(key, def) {
      try {
        if (typeof GM_getValue !== 'undefined') return GM_getValue(key, def);
      } catch (e) {}
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : def;
      } catch (e) { return def; }
    },
    set(key, val) {
      try {
        if (typeof GM_setValue !== 'undefined') { GM_setValue(key, val); return; }
      } catch (e) {}
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    }
  };

  let blockedCats = new Set(store.get(KEY_CAT, []));
  let blockedUsers = new Set(store.get(KEY_USER, []));
  let revealAll = false;

  /* ---------- DOM 读取 ---------- */
  function threadRows() {
    return Array.from(document.querySelectorAll('#threadlisttableid tr'))
      .filter(tr => tr.querySelector('th em a[href*="typeid"]'));
  }
  function getCat(tr) {
    const a = tr.querySelector('th em a[href*="typeid"]');
    return a ? a.textContent.trim() : '';
  }
  function getAuthor(tr) {
    const a = tr.querySelector('td.by cite a[href*="home.php?mod=space"]');
    return a ? a.textContent.trim() : '';
  }

  /* ---------- 过滤 ---------- */
  function applyFilter() {
    let hidden = 0;
    threadRows().forEach(tr => {
      const cat = getCat(tr);
      const author = getAuthor(tr);
      const blocked = !revealAll && (blockedCats.has(cat) || blockedUsers.has(author));
      tr.style.display = blocked ? 'none' : '';
      if (blocked) hidden++;
    });
    const st = document.getElementById('qm-status');
    if (st) st.textContent = revealAll
      ? `临时显示全部（已屏蔽 ${blockedCats.size} 分类 / ${blockedUsers.size} 用户）`
      : `已隐藏 ${hidden} 帖（屏蔽 ${blockedCats.size} 分类 / ${blockedUsers.size} 用户）`;
  }

  /* ---------- 顶部全部分类 ---------- */
  function allCategories() {
    const s = new Set();
    document.querySelectorAll('a[href*="filter=typeid"]').forEach(a => {
      const t = a.textContent.trim();
      const m = t.match(/^[一-龥·A-Za-z]+/);   // 去掉尾部计数数字
      if (m && m[0]) s.add(m[0]);
    });
    threadRows().forEach(tr => { const c = getCat(tr); if (c) s.add(c); });
    return Array.from(s).sort();
  }

  function pageAuthors() {
    const s = new Set();
    threadRows().forEach(tr => { const a = getAuthor(tr); if (a) s.add(a); });
    return Array.from(s);
  }

  /* ---------- 每个作者名旁加屏蔽小按钮 ---------- */
  function injectAuthorButtons() {
    threadRows().forEach(tr => {
      const cite = tr.querySelector('td.by cite');
      if (!cite || cite.querySelector('.qm-user-btn')) return;
      const author = getAuthor(tr);
      const b = document.createElement('span');
      b.className = 'qm-user-btn';
      b.textContent = ' 🚫';
      b.title = '屏蔽用户：' + author;
      b.style.cssText = 'cursor:pointer;margin-left:4px;color:#bbb;font-size:12px;';
      b.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        blockedUsers.add(author);
        store.set(KEY_USER, Array.from(blockedUsers));
        applyFilter(); refreshPanel();
      };
      cite.appendChild(b);
    });
  }

  /* ---------- 面板 ---------- */
  function buildPanel() {
    // 样式
    const css = document.createElement('style');
    css.textContent = `
      #qm-fab{position:fixed;right:18px;bottom:18px;z-index:99999;width:44px;height:44px;border-radius:50%;
        background:#333;color:#fff;font-size:20px;line-height:44px;text-align:center;cursor:pointer;
        box-shadow:0 2px 8px rgba(0,0,0,.3);user-select:none;}
      #qm-panel{position:fixed;right:18px;bottom:72px;z-index:99999;width:320px;max-height:70vh;
        background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.2);
        display:none;flex-direction:column;font-size:13px;color:#333;}
      #qm-panel.open{display:flex;}
      #qm-panel .qm-head{padding:10px 12px;background:#333;color:#fff;border-radius:8px 8px 0 0;
        display:flex;justify-content:space-between;align-items:center;}
      #qm-panel .qm-head b{font-size:14px;}
      #qm-panel .qm-close{cursor:pointer;font-size:16px;}
      #qm-panel .qm-body{overflow:auto;padding:10px 12px;}
      #qm-panel .qm-sec{margin-bottom:10px;}
      #qm-panel .qm-sec h4{margin:6px 0 4px;font-size:12px;color:#888;border-bottom:1px solid #eee;padding-bottom:3px;}
      #qm-panel label{display:block;padding:2px 0;cursor:pointer;}
      #qm-panel label:hover{background:#f5f5f5;}
      #qm-panel .qm-chips span{display:inline-block;background:#f0f0f0;border-radius:10px;padding:1px 8px;
        margin:2px 4px 2px 0;cursor:pointer;font-size:12px;}
      #qm-panel .qm-chips span:hover{background:#ffd6d6;}
      #qm-panel .qm-status{padding:6px 12px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#666;}
      #qm-panel .qm-toggle{cursor:pointer;float:right;color:#06c;}
    `;
    document.head.appendChild(css);

    // 悬浮按钮
    const fab = document.createElement('div');
    fab.id = 'qm-fab'; fab.textContent = '🚫'; fab.title = '板块屏蔽设置';
    document.body.appendChild(fab);

    // 面板
    const panel = document.createElement('div');
    panel.id = 'qm-panel';
    panel.innerHTML = `
      <div class="qm-head"><b>板块屏蔽助手</b><span class="qm-close">×</span></div>
      <div class="qm-body">
        <div class="qm-sec">
          <h4>屏蔽分类（勾选即隐藏）</h4>
          <div id="qm-cat-list"></div>
        </div>
        <div class="qm-sec">
          <h4>当前页作者（点击拉黑）</h4>
          <div class="qm-chips" id="qm-author-list"></div>
        </div>
        <div class="qm-sec">
          <h4>已屏蔽用户（点击解除）</h4>
          <div class="qm-chips" id="qm-blocked-list"></div>
        </div>
      </div>
      <div class="qm-status"><span id="qm-status"></span><span class="qm-toggle" id="qm-reveal">临时显示全部</span></div>
    `;
    document.body.appendChild(panel);

    fab.onclick = () => panel.classList.toggle('open');
    panel.querySelector('.qm-close').onclick = () => panel.classList.remove('open');
    panel.querySelector('#qm-reveal').onclick = (e) => {
      revealAll = !revealAll;
      e.target.textContent = revealAll ? '恢复屏蔽' : '临时显示全部';
      applyFilter();
    };

    refreshPanel();
  }

  function refreshPanel() {
    // 分类复选框
    const catBox = document.getElementById('qm-cat-list');
    if (!catBox) return;
    catBox.innerHTML = '';
    allCategories().forEach(c => {
      const lbl = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = blockedCats.has(c);
      cb.onchange = () => {
        if (cb.checked) blockedCats.add(c); else blockedCats.delete(c);
        store.set(KEY_CAT, Array.from(blockedCats));
        applyFilter();
      };
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(' ' + c));
      catBox.appendChild(lbl);
    });

    // 当前页作者 chips
    const auBox = document.getElementById('qm-author-list');
    auBox.innerHTML = '';
    pageAuthors().forEach(a => {
      const s = document.createElement('span');
      s.textContent = a;
      s.title = '拉黑 ' + a;
      s.onclick = () => {
        blockedUsers.add(a);
        store.set(KEY_USER, Array.from(blockedUsers));
        applyFilter(); refreshPanel();
      };
      auBox.appendChild(s);
    });

    // 已屏蔽用户 chips
    const blBox = document.getElementById('qm-blocked-list');
    blBox.innerHTML = '';
    if (blockedUsers.size === 0) {
      blBox.innerHTML = '<span style="color:#aaa;cursor:default">（无）</span>';
    } else {
      Array.from(blockedUsers).sort().forEach(a => {
        const s = document.createElement('span');
        s.textContent = a + ' ✕';
        s.title = '解除对 ' + a + ' 的屏蔽';
        s.onclick = () => {
          blockedUsers.delete(a);
          store.set(KEY_USER, Array.from(blockedUsers));
          applyFilter(); refreshPanel();
        };
        blBox.appendChild(s);
      });
    }

    applyFilter();
  }

  /* ---------- 自动签到 + 每日威望红包 ---------- */
  const KEY_SIGN = 'qm_auto_sign_date_v1';
  const MOODS = ['kx', 'ng', 'ym', 'wl', 'nu', 'ch', 'fd', 'yl', 'shuai'];
  // 24 个时段的签到文字
  const DAILY_WORDS = [
    '夜深了，早点休息吧。',           // 0
    '凌晨好，别熬太晚。',             // 1
    '两点了，该睡了。',               // 2
    '凌晨三点，还在忙什么？',         // 3
    '天快亮了，早安。',               // 4
    '清晨好，新的一天开始了。',       // 5
    '早上好，新的一天加油！',         // 6
    '早，又是元气满满的一天。',       // 7
    '上午好，工作顺利。',             // 8
    '上午愉快，喝杯水。',             // 9
    '中午好，记得吃饭。',             // 10
    '午间休息一下吧。',               // 11
    '中午好，午安。',                 // 12
    '下午好，继续加油。',             // 13
    '下午茶时间到了。',               // 14
    '下午愉快，快下班了。',           // 15
    '傍晚好，准备回家了吗？',         // 16
    '晚上好，吃晚饭了吗？',           // 17
    '晚上愉快，放松一下。',           // 18
    '晚上好，今天过得怎么样？',       // 19
    '夜间好，早点休息。',             // 20
    '晚上好，别熬太晚。',             // 21
    '夜深了，该睡了。',               // 22
    '午夜好，晚安。'                  // 23
  ];

  async function autoSign() {
    const today = new Date().toDateString();
    const lastSign = store.get(KEY_SIGN, '');
    if (lastSign === today) return; // 今天已签过

    try {
      // 1. 获取签到页面和 formhash
      const signPage = await fetch('https://www.1000qm.vip/plugin.php?id=dsu_paulsign:sign', { credentials: 'include' });
      const html = await signPage.text();
      const m = html.match(/name="formhash"\s+value="([a-f0-9]+)"/);
      if (!m) { console.warn('[1000qm] 未找到 formhash'); return; }
      const formhash = m[1];

      // 2. 随机选表情 + 按时段选文字
      const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
      const hour = new Date().getHours();
      const words = DAILY_WORDS[hour];

      // 3. 提交签到
      const body = new URLSearchParams({
        formhash: formhash,
        qdxq: mood,
        todaysay: words,
        qdmode: '1',
        fastreply: '0'
      });
      const resp = await fetch('https://www.1000qm.vip/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const text = await resp.text();
      if (text.includes('签到成功') || text.includes('恭喜') || text.includes('已签到')) {
        store.set(KEY_SIGN, today);
        console.log('[1000qm] 签到成功:', words);
      } else {
        console.warn('[1000qm] 签到响应:', text.slice(0, 200));
      }
    } catch (e) {
      console.error('[1000qm] 签到失败:', e);
    }

    // 4. 领每日威望红包（不管签到成功与否，都试一下）
    try {
      await fetch('https://www.1000qm.vip/home.php?mod=task&do=apply&id=1', { credentials: 'include' });
      console.log('[1000qm] 每日威望红包已领');
    } catch (e) {
      console.warn('[1000qm] 领红包失败:', e);
    }
  }

  /* ---------- 启动 ---------- */
  function boot() {
    // 首页自动签到 + 领红包
    if (location.pathname === '/forum.php' || location.pathname === '/') {
      autoSign();
    }

    // 仅在版块列表页（有 #threadlisttableid）激活；主页/帖子详情/个人中心等静默
    if (!document.querySelector('#threadlisttableid')) return;

    buildPanel();
    injectAuthorButtons();
    applyFilter();
    // Discuz forumdisplay 翻页为整页刷新，脚本会重新执行；
    // 仅对列表容器做轻量监听（带防抖），应对局部刷新。
    let timer = null;
    const list = document.querySelector('#threadlisttableid');
    if (list) {
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => { injectAuthorButtons(); applyFilter(); }, 150);
      }).observe(list, { childList: true, subtree: false });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

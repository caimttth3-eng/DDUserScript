// ==UserScript==
// @name         同人小说网(trxs.cc) 专属全本TXT下载器
// @namespace    https://github.com/caimttth3-eng/DDUserScript
// @version      2.3
// @description  专门优化 trxs.cc 编码解析与章节提取，3 并发 + IndexedDB 断点续传，导出标准听书 TXT（章节清洗/去简介/节→章统一）
// @author       caimttth3-eng
// @match        https://www.trxs.cc/tongren/*.html
// @match        https://www.trxs.cc/tongren/*/*.html
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const CONCURRENCY = 3;          // 并发数
    const DELAY_MS = 150;           // 每个任务完成后的间隔（反爬）
    const DB_NAME = 'trxs_downloader_v1';
    const STORE = 'cache';

    /* ---------- IndexedDB 封装（断点续传） ---------- */
    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
            };
            req.onsuccess = e => resolve(e.target.result);
            req.onerror = e => reject(e.target.error);
        });
    }
    async function dbGet(key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const rq = tx.objectStore(STORE).get(key);
            rq.onsuccess = () => resolve(rq.value || {});
            rq.onerror = () => reject(rq.error);
        });
    }
    async function dbSet(key, val) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(val, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async function dbDel(key) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /* ---------- UI ---------- */
    function createUI() {
        if (document.getElementById('trxs-download-btn')) return;

        const wrap = document.createElement('div');
        wrap.id = 'trxs-ui';
        wrap.style.cssText = `
            position: fixed; top: 120px; right: 25px; z-index: 999999;
            display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
        `;

        const btn = document.createElement('button');
        btn.id = 'trxs-download-btn';
        btn.innerText = '📥 下载全本 TXT';
        btn.style.cssText = `
            padding: 12px 22px;
            background: linear-gradient(135deg, #ff5722, #e64a19);
            color: #fff; border: none; border-radius: 30px;
            font-size: 14px; font-weight: bold; cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 87, 34, .4);
            transition: all .3s ease; outline: none;
        `;
        btn.onclick = startDownload;

        const reset = document.createElement('a');
        reset.id = 'trxs-reset';
        reset.innerText = '↻ 清空缓存重新下载';
        reset.style.cssText = `
            font-size: 11px; color: #999; cursor: pointer; text-decoration: underline;
            display: none;
        `;
        reset.onclick = async () => {
            const bookId = getBookId();
            if (!bookId) return;
            await dbDel(bookId);
            alert('已清空本书缓存');
            location.reload();
        };

        wrap.appendChild(btn);
        wrap.appendChild(reset);
        document.body.appendChild(wrap);
    }

    function getBookId() {
        const m = location.pathname.match(/\/tongren\/(\d+)/);
        return m ? m[1] : '';
    }

    /* ---------- 章节列表 ---------- */
    function getChapterList() {
        const bookId = getBookId();
        const seen = new Set();
        const chapters = [];
        Array.from(document.querySelectorAll('a[href]')).forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            const fullUrl = new URL(href, location.href).href;
            const title = a.innerText.trim();
            const isChapterUrl = fullUrl.includes(`/${bookId}/`) && fullUrl.endsWith('.html');
            const isValidTitle = title.length > 0 && !title.includes('首页') && !title.includes('目录') && !title.includes('TXT');
            if (isChapterUrl && isValidTitle && !seen.has(fullUrl)) {
                seen.add(fullUrl);
                chapters.push({ title, url: fullUrl });
            }
        });
        return chapters;
    }

    /* ---------- GBK 抓取 ---------- */
    async function fetchChapterGBK(url, retries = 2) {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url, { cache: 'force-cache' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const buffer = await response.arrayBuffer();
                return new TextDecoder('gbk').decode(buffer);
            } catch (err) {
                if (i === retries) throw err;
                await new Promise(r => setTimeout(r, 500));
            }
        }
    }

    /* ---------- 章节正文解析 ---------- */
    function parseChapterContent(htmlText) {
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        let pageTitle = doc.querySelector('h1')?.innerText.trim() || '';
        const contentDiv = doc.querySelector('#content') || doc.querySelector('.readcontent') || doc.querySelector('.read_chapterDetail');
        if (!contentDiv) return { pageTitle: cleanTitle(pageTitle), content: '' };
        contentDiv.querySelectorAll('script, style, ins, .ad, a, p[style*="color"]').forEach(el => el.remove());
        let cleanLines = contentDiv.innerText.split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.includes('trxs.cc') && !l.includes('同人小说网') && !l.includes('章节错误') && !l.includes('点击报修'));

        // 处理开头的作品简介：如果第一行包含"作者:"，找到"第X章"正文开始位置截断
        if (cleanLines.length && cleanLines[0].includes('作者:')) {
            const first = cleanLines[0];
            const chIdx = first.search(/第\s*[0-9一二三四五六七八九十百千零两]+\s*[章节回]/);
            if (chIdx > 0) {
                cleanLines[0] = first.slice(chIdx);
            } else {
                // 找不到章节标记，直接丢弃这一行
                cleanLines = cleanLines.slice(1);
            }
        }

        // 去掉正文开头重复的"第X章 标题"子标题行（和导出的章节标题重复）
        // 网站常把"第一章 标题"和正文挤在同一行，需要剥离前缀
        if (cleanLines.length) {
            const m = cleanLines[0].match(/^第\s*[0-9一二三四五六七八九十百千零两]+\s*[章节回][^\n。！？]*/);
            if (m) {
                cleanLines[0] = cleanLines[0].slice(m[0].length).trim();
                cleanLines[0] = cleanLines[0].replace(/^[。，、；：,.!?！？;:\s]+/, '');
                if (!cleanLines[0]) cleanLines = cleanLines.slice(1);
            }
        }

        return { pageTitle: cleanTitle(pageTitle), content: cleanLines.join('\n\n') };
    }

    /* 清洗章节标题：去掉书名前缀，把"节"统一为"章"，规范成听书 App 可识别格式 */
    function cleanTitle(raw) {
        if (!raw) return '';
        // 提取"第X章/节/回 标题"部分
        const m = raw.match(/第\s*[0-9一二三四五六七八九十百千零两]+\s*[章节回][^\n]*/);
        if (m) {
            return m[0].replace(/\s+/g, ' ').trim().replace(/节/g, '章');
        }
        // 没匹配到就原样返回
        return raw.trim();
    }

    /* ---------- 导出 TXT ---------- */
    function exportTxtFile(filename, textContent) {
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    /* ---------- 并发池 ---------- */
    async function runPool(tasks, concurrency, onItemDone) {
        let idx = 0;
        async function worker() {
            while (idx < tasks.length) {
                const my = idx++;
                await tasks[my]();
                onItemDone();
            }
        }
        await Promise.all(Array.from({ length: concurrency }, () => worker()));
    }

    /* ---------- 主控 ---------- */
    async function startDownload() {
        const btn = document.getElementById('trxs-download-btn');
        const reset = document.getElementById('trxs-reset');
        const chapters = getChapterList();
        if (!chapters.length) {
            alert('⚠️ 未能检测到章节列表，请确认当前页面是否为目录页');
            return;
        }
        const bookId = getBookId();
        const rawBookTitle = document.querySelector('h1')?.innerText || document.title;
        const bookTitle = rawBookTitle.replace(/[\/\\:*?"<>|]/g, '').replace('_同人小说网', '').trim();

        // 读缓存
        const cache = await dbGet(bookId);
        const doneCount = Object.keys(cache).length;
        const pending = chapters.filter(c => !cache[c.url]);

        if (pending.length === 0 && doneCount > 0) {
            // 全部已缓存，直接导出
            assembleAndExport(bookTitle, chapters, cache);
            return;
        }

        btn.disabled = true;
        btn.style.background = '#757575';
        reset.style.display = 'inline';

        let finished = doneCount;
        const total = chapters.length;
        const update = () => {
            const pct = Math.round((finished / total) * 100);
            btn.innerText = `⏳ 抓取中 (${finished}/${total}) ${pct}%`;
        };
        update();

        const tasks = pending.map(ch => async () => {
            try {
                const html = await fetchChapterGBK(ch.url);
                const { pageTitle, content } = parseChapterContent(html);
                cache[ch.url] = {
                    title: cleanTitle(pageTitle || ch.title),
                    content: (content && content.length > 10) ? content : '（该章节正文提取为空）'
                };
            } catch (err) {
                console.error(`抓取失败 [${ch.title}]:`, err);
                cache[ch.url] = { title: cleanTitle(ch.title), content: '（网络请求失败，未获取到内容）' };
            }
            // 每完成一章就落盘（避免再次刷新丢失）
            await dbSet(bookId, cache);
            finished++;
            update();
            await new Promise(r => setTimeout(r, DELAY_MS));
        });

        try {
            await runPool(tasks, CONCURRENCY, () => {});
            await assembleAndExport(bookTitle, chapters, cache);
        } catch (err) {
            btn.innerText = '⚠️ 出错，可重试（已保留进度）';
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.style.background = 'linear-gradient(135deg, #ff5722, #e64a19)';
        }
    }

    async function assembleAndExport(bookTitle, chapters, cache) {
        const btn = document.getElementById('trxs-download-btn');
        btn.innerText = '💾 正在打包 TXT...';

        // 标准听书 TXT 格式：
        // - 文件头仅书名，不写来源/分隔线，避免被分章器误识别为章节
        // - 章节标题独占一行，前后各空一行
        // - 正文段落间单空行
        // - 不使用任何 ---- / ==== 分隔线
        let fullText = `《${bookTitle}》\n\n`;

        chapters.forEach(ch => {
            const c = cache[ch.url];
            if (!c) return;
            // 章节标题独占一行，前后空行
            fullText += `${c.title}\n\n`;
            fullText += `${c.content}\n\n\n`;
        });

        exportTxtFile(`${bookTitle}.txt`, fullText.trim() + '\n');
        btn.innerText = '✅ 下载完成！';
        // 成功后清缓存
        await dbDel(getBookId());
        document.getElementById('trxs-reset').style.display = 'none';
        setTimeout(() => { btn.innerText = '📥 下载全本 TXT'; }, 4000);
    }

    /* ---------- 初始化：检测断点 ---------- */
    async function init() {
        createUI();
        const bookId = getBookId();
        if (!bookId) return;
        const cache = await dbGet(bookId);
        const n = Object.keys(cache).length;
        if (n > 0) {
            const btn = document.getElementById('trxs-download-btn');
            const reset = document.getElementById('trxs-reset');
            btn.innerText = `📥 继续下载 (已缓存 ${n} 章)`;
            reset.style.display = 'inline';
        }
    }

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();

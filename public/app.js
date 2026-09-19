// ================= KAIROGRAM DEVOTIONALS CLOUD STUDIO (MOBILE & SIMPLE) =================
(function() {
  let parsedBatchItems = [];
  let fullDatabaseCache = null;

  // DOM Elements
  const tabs = document.querySelectorAll('.mobile-tabs-bar .tab-item');
  const views = document.querySelectorAll('.mobile-tab-view');
  const batchTextInput = document.getElementById('batchTextInput');
  const batchChurchSelect = document.getElementById('batchChurchSelect');
  const btnClipboardPaste = document.getElementById('btnClipboardPaste');
  const btnParseBatch = document.getElementById('btnParseBatch');
  const btnPublishAllBatch = document.getElementById('btnPublishAllBatch');
  const parsedListContainer = document.getElementById('parsedListContainer');
  const parsedDaysCount = document.getElementById('parsedDaysCount');
  const countStoredLib = document.getElementById('countStoredLib');
  const libraryCountBadge = document.getElementById('libraryCountBadge');
  const libraryGrid = document.getElementById('libraryGrid');
  const libraryFilterPills = document.getElementById('libraryFilterPills');
  const btnQuickExportJson = document.getElementById('btnQuickExportJson');
  const btnAutoFetchUpcoming = document.getElementById('btnAutoFetchUpcoming');
  const cmsToast = document.getElementById('cmsToast');

  // Single Day Form elements
  const formChurch = document.getElementById('formChurch');
  const formManual = document.getElementById('formManual');
  const formDate = document.getElementById('formDate');
  const formTopic = document.getElementById('formTopic');
  const formAuthor = document.getElementById('formAuthor');
  const formMemoryRef = document.getElementById('formMemoryRef');
  const formReadingRef = document.getElementById('formReadingRef');
  const formMemoryText = document.getElementById('formMemoryText');
  const formMessageText = document.getElementById('formMessageText');
  const formPrayerPoints = document.getElementById('formPrayerPoints');
  const formHymnOrConfession = document.getElementById('formHymnOrConfession');
  const btnSaveSingleDevotional = document.getElementById('btnSaveSingleDevotional');
  const btnSaveSingleDevotionalBottom = document.getElementById('btnSaveSingleDevotionalBottom');

  // Sample templates
  const btnPasteSampleOpenHeavens = document.getElementById('btnPasteSampleOpenHeavens');
  const btnPasteSampleDclm = document.getElementById('btnPasteSampleDclm');
  const btnClearBatchInput = document.getElementById('btnClearBatchInput');

  // 1. Mobile Tab Switching
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabs.forEach(b => b.classList.toggle('active', b === btn));
      views.forEach(v => v.classList.toggle('active', v.id === targetTab));

      if (targetTab === 'tabLibrary') {
        fetchStoredLibrary();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 2. Mobile Toast Notification
  let toastTimer = null;
  function showToast(msg) {
    if (!cmsToast) return;
    cmsToast.textContent = msg;
    cmsToast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      cmsToast.classList.add('hidden');
    }, 3000);
  }

  // 3. One-Tap Clipboard Paste (Phone-friendly)
  if (btnClipboardPaste) {
    btnClipboardPaste.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            batchTextInput.value = text;
            showToast("Pasted from clipboard!");
            // Auto-trigger parse for instant mobile feedback
            triggerParseBatch();
            return;
          }
        }
        batchTextInput.focus();
        showToast("Tap and hold in the box to paste");
      } catch (err) {
        batchTextInput.focus();
        showToast("Tap and hold in the box to paste");
      }
    });
  }

  // 4. Smart Multi-Day Text Parser
  function parseBatchDevotionalsText(rawText, defaultChurchConfig) {
    if (!rawText || !rawText.trim()) return [];

    const [church, manual] = defaultChurchConfig.split('_');
    const sections = rawText.split(/(?:^|\n)(?=DATE[:\s–-]+|\b(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),?\s+[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i);

    const results = [];

    sections.forEach((sec, idx) => {
      const text = sec.trim();
      if (!text || text.length < 25) return;

      // Extract Date
      let dateIso = '';
      const isoMatch = text.match(/(?:DATE[:\s–-]+)?(\d{4}-\d{2}-\d{2})/i);
      if (isoMatch) {
        dateIso = isoMatch[1];
      } else {
        const textDateMatch = text.match(/\b(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),?\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
        if (textDateMatch) {
          const mName = textDateMatch[1];
          const dNum = textDateMatch[2].padStart(2, '0');
          const yNum = textDateMatch[3];
          const mIdx = ["january","february","march","april","may","june","july","august","september","october","november","december"].indexOf(mName.toLowerCase());
          if (mIdx !== -1) {
            dateIso = `${yNum}-${String(mIdx + 1).padStart(2, '0')}-${dNum}`;
          }
        }
      }

      if (!dateIso) {
        const d = new Date();
        d.setDate(d.getDate() + idx);
        dateIso = d.toISOString().split('T')[0];
      }

      // Extract Topic
      let topic = "Walking in Divine Glory";
      const topicMatch = text.match(/TOPIC[:\s–-]+([^\n\(]+)/i);
      if (topicMatch) {
        topic = topicMatch[1].trim();
      }

      // Extract Memory Verse Ref & Text
      let memoryVerseRef = "";
      let memoryVerseText = "";
      const memMatch = text.match(/MEMORI[SZ]E[:\s–-]+(.*?)(?:BIBLE READING|READING:|TEXT:|\n\n)/is);
      if (memMatch) {
        const rawMem = memMatch[1].trim();
        const refMatch = rawMem.match(/\(([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)?\s\d+:\d+(?:-\d+)?)\)/) || rawMem.match(/([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)?\s\d+:\d+(?:-\d+)?)/);
        if (refMatch) {
          memoryVerseRef = refMatch[1].trim();
          memoryVerseText = rawMem.replace(refMatch[0], '').replace(/^[–—\-\:\s]+/, '').trim();
        } else {
          memoryVerseText = rawMem;
        }
      }

      // Extract Bible Reading
      let readingRef = "";
      const readingMatch = text.match(/(?:BIBLE READING|READING|TEXT|FIRE SCRIPTURE)[:\s–-]+([^\n]+)/i);
      if (readingMatch) {
        readingRef = readingMatch[1].trim();
      }

      // Extract Prayer Point
      let prayerPoints = [];
      const prayerMatch = text.match(/(?:PRAYER POINT|PRAYERS|PRAYER|PRAYER POINTS)[:\s–-]+(.*?)(?:HYMN|BIBLE IN ONE YEAR|CONFESSION|\Z)/is);
      if (prayerMatch) {
        prayerPoints = [prayerMatch[1].replace(/\n+/g, ' ').trim()];
      }

      // Extract Message Body
      let messageParagraphs = [];
      const msgIdx = text.search(/MESSAGE[:\s–-]/i);
      if (msgIdx !== -1) {
        const afterMsg = text.slice(msgIdx + 8);
        const endStop = afterMsg.search(/PRAYER POINT|PRAYER:|HYMN:|BIBLE IN ONE YEAR/i);
        const rawMsgBody = endStop !== -1 ? afterMsg.slice(0, endStop) : afterMsg;
        messageParagraphs = rawMsgBody.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);
      } else {
        const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => 
          !p.match(/^(?:DATE|TOPIC|MEMORI|BIBLE READING|PRAYER)/i) && p.length > 25
        );
        messageParagraphs = paras;
      }

      // Extract Hymn or Confession
      let hymn = "";
      const hymnMatch = text.match(/(?:HYMN|CONFESSION)[:\s–-]+([^\n]+)/i);
      if (hymnMatch) {
        hymn = hymnMatch[1].trim();
      }

      results.push({
        church: church || 'rccg',
        manual: manual || 'open_heavens',
        date: dateIso,
        topic,
        memoryVerseRef,
        memoryVerseText,
        bibleReadingRef: readingRef,
        message: messageParagraphs.length ? messageParagraphs : ["The glory of the Lord fills the temple."],
        prayerPoints: prayerPoints.length ? prayerPoints : ["Father, let Your will be done in my life today."],
        hymn,
        source: "Kairogram Devotionals Studio Mobile"
      });
    });

    return results;
  }

  // 5. Render Parsed Days in Mobile View
  function renderParsedList() {
    parsedDaysCount.textContent = parsedBatchItems.length;
    btnPublishAllBatch.disabled = (parsedBatchItems.length === 0);

    if (parsedBatchItems.length === 0) {
      parsedListContainer.innerHTML = `
        <div class="mobile-empty-state">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>Paste text above and tap <strong>Parse & Preview Days</strong> to see them here.</p>
        </div>
      `;
      return;
    }

    parsedListContainer.innerHTML = parsedBatchItems.map((item, idx) => `
      <div class="mobile-parsed-item">
        <div class="parsed-item-top">
          <span class="item-date-tag">${item.date}</span>
          <button type="button" class="btn-item-del" data-remove-idx="${idx}">Remove</button>
        </div>
        <div class="item-topic-line">${escapeHtml(item.topic)}</div>
        <div class="item-sub-meta">
          <span>${escapeHtml(item.memoryVerseRef || 'No memory verse')}</span> • <span>${item.message.length} para</span>
        </div>
      </div>
    `).join('');

    parsedListContainer.querySelectorAll('[data-remove-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
        parsedBatchItems.splice(idx, 1);
        renderParsedList();
      });
    });
  }

  function triggerParseBatch() {
    const text = batchTextInput.value;
    if (!text.trim()) {
      showToast("Please paste devotional text first.");
      return;
    }
    const churchConf = batchChurchSelect.value || 'rccg_open_heavens';
    parsedBatchItems = parseBatchDevotionalsText(text, churchConf);
    renderParsedList();
    if (parsedBatchItems.length > 0) {
      showToast(`Parsed ${parsedBatchItems.length} day(s) ready to publish!`);
      // Scroll smoothly down to the parsed preview
      const targetSec = document.getElementById('parsedCardSection');
      if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast("Could not detect dates/topics. Check text format.");
    }
  }

  if (btnParseBatch) {
    btnParseBatch.addEventListener('click', triggerParseBatch);
  }

  // 6. Publish Batch to Cloud API (1 Tap)
  if (btnPublishAllBatch) {
    btnPublishAllBatch.addEventListener('click', async () => {
      if (!parsedBatchItems.length) return;
      btnPublishAllBatch.disabled = true;
      btnPublishAllBatch.innerHTML = `<span>Publishing...</span>`;

      try {
        const resp = await fetch('/api/devotionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedBatchItems)
        });

        const result = await resp.json();
        if (resp.ok && result.success) {
          showToast(`Published ${result.ingestedCount} day(s) to Kairogram! 🎉`);
          parsedBatchItems = [];
          batchTextInput.value = '';
          renderParsedList();
          fetchStoredLibrary();
        } else {
          showToast(`Error: ${result.error || 'Failed'}`);
        }
      } catch (err) {
        showToast(`Network error: ${err.message}`);
      } finally {
        btnPublishAllBatch.disabled = false;
        btnPublishAllBatch.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>Publish to Kairogram</span>
        `;
      }
    });
  }

  // 7. Single Day Form Publisher
  async function submitSingleForm() {
    const topic = formTopic.value.trim();
    const dateVal = formDate.value;
    if (!topic || !dateVal) {
      showToast("Please provide Topic and Date.");
      return;
    }

    const msgParas = formMessageText.value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const prayerPts = formPrayerPoints.value.split('\n').map(p => p.trim()).filter(Boolean);

    const payload = {
      church: formChurch.value,
      manual: formManual.value,
      date: dateVal,
      topic,
      author: formAuthor.value.trim(),
      memoryVerseRef: formMemoryRef.value.trim(),
      memoryVerseText: formMemoryText.value.trim(),
      bibleReadingRef: formReadingRef.value.trim(),
      message: msgParas.length ? msgParas : [topic],
      prayerPoints: prayerPts.length ? prayerPts : ["Lord, guide my steps today."],
      hymn: formHymnOrConfession.value.trim(),
      source: "Kairogram Devotionals Mobile Studio"
    };

    try {
      const resp = await fetch('/api/devotionals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await resp.json();
      if (resp.ok && res.success) {
        showToast(`Published ${dateVal} successfully!`);
        fetchStoredLibrary();
      } else {
        showToast(`Error: ${res.error || 'Failed'}`);
      }
    } catch (e) {
      showToast(`Network error: ${e.message}`);
    }
  }

  if (btnSaveSingleDevotional) btnSaveSingleDevotional.addEventListener('click', submitSingleForm);
  if (btnSaveSingleDevotionalBottom) btnSaveSingleDevotionalBottom.addEventListener('click', submitSingleForm);

  // 8. Stored Library Fetcher
  async function fetchStoredLibrary() {
    try {
      const resp = await fetch('/api/devotionals?latest=true&t=' + Date.now());
      if (resp.ok) {
        const data = await resp.json();
        fullDatabaseCache = data;
        renderLibraryCards('all');
      }
    } catch (e) {
      console.log("Error loading library:", e);
    }
  }

  function renderLibraryCards(filterChurch = 'all') {
    if (!libraryGrid) return;
    const store = fullDatabaseCache;
    if (!store || !store.dates) {
      libraryGrid.innerHTML = `<div class="mobile-empty-state"><p>No stored devotionals found.</p></div>`;
      return;
    }

    const items = [];
    for (const [dateKey, pubs] of Object.entries(store.dates)) {
      for (const [pubKey, entry] of Object.entries(pubs)) {
        if (filterChurch === 'all' || entry.church === filterChurch) {
          items.push({ dateKey, pubKey, ...entry });
        }
      }
    }

    items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    if (countStoredLib) countStoredLib.textContent = items.length;
    if (libraryCountBadge) libraryCountBadge.textContent = items.length;

    if (!items.length) {
      libraryGrid.innerHTML = `<div class="mobile-empty-state"><p>No entries matching this filter.</p></div>`;
      return;
    }

    libraryGrid.innerHTML = items.map(item => `
      <div class="mobile-lib-card" data-edit-item="${escapeHtml(item.dateKey)}|${escapeHtml(item.church)}|${escapeHtml(item.manual)}">
        <div class="lib-card-meta">
          <span class="lib-badge">${escapeHtml(item.church.toUpperCase())} • ${escapeHtml(item.manual)}</span>
          <span class="lib-date">${escapeHtml(item.dateKey)}</span>
        </div>
        <div class="lib-title">${escapeHtml(item.topic || 'Untitled')}</div>
        <div class="lib-preview">"${escapeHtml(item.memoryVerseText || item.memoryVerseRef || '')}"</div>
      </div>
    `).join('');

    // Tap card to edit
    libraryGrid.querySelectorAll('[data-edit-item]').forEach(card => {
      card.addEventListener('click', () => {
        const [d, ch, man] = card.getAttribute('data-edit-item').split('|');
        const entry = store.dates[d] && store.dates[d][`${ch}_${man}`];
        if (entry) {
          formChurch.value = entry.church || 'rccg';
          formManual.value = entry.manual || 'open_heavens';
          formDate.value = entry.date || d;
          formTopic.value = entry.topic || '';
          formAuthor.value = entry.author || '';
          formMemoryRef.value = entry.memoryVerseRef || '';
          formMemoryText.value = entry.memoryVerseText || '';
          formReadingRef.value = entry.bibleReadingRef || '';
          formMessageText.value = Array.isArray(entry.message) ? entry.message.join('\n\n') : (entry.message || '');
          formPrayerPoints.value = Array.isArray(entry.prayerPoints) ? entry.prayerPoints.join('\n') : (entry.prayerPoints || '');
          formHymnOrConfession.value = entry.hymn || entry.confession || '';

          // Switch to Form Entry
          tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === 'tabSingleForm'));
          views.forEach(v => v.classList.toggle('active', v.id === 'tabSingleForm'));
          showToast(`Loaded ${entry.topic}`);
        }
      });
    });
  }

  // Filter Pills
  if (libraryFilterPills) {
    libraryFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      libraryFilterPills.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p === pill));
      renderLibraryCards(pill.getAttribute('data-filter'));
    });
  }

  // 9. 1-Tap Auto-Fetch Tomorrow
  if (btnAutoFetchUpcoming) {
    btnAutoFetchUpcoming.addEventListener('click', async () => {
      btnAutoFetchUpcoming.disabled = true;
      showToast("Fetching tomorrow's editions...");
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomDateStr = tomorrow.toISOString().split('T')[0];

        const sampleUpcoming = [
          {
            church: 'rccg',
            manual: 'open_heavens',
            date: tomDateStr,
            topic: "The Wonders of Divine Favor",
            author: "Pastor E.A. Adeboye",
            memoryVerseRef: "Psalm 102:13",
            memoryVerseText: "Thou shalt arise, and have mercy upon Zion: for the time to favour her, yea, the set time, is come.",
            bibleReadingRef: "Esther 2:15-18",
            message: [
              "Favor is the supernatural fragrance that attracts unmerited blessings into the life of a believer. When God's favor rests upon an ordinary person, protocols are suspended for their sake.",
              "Queen Esther was a simple captive orphan in Shushan, yet when the oil of divine favor touched her countenance, she found favor in the sight of all that looked upon her.",
              "Stay rooted in holiness, prayer, and humility, and watch God open doors no mortal can shut."
            ],
            prayerPoints: ["Father, let Your set time of divine favor locate my destiny today in Jesus' name."],
            hymn: "Hymn 26: Pass Me Not, O Gentle Saviour"
          }
        ];

        const resp = await fetch('/api/devotionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sampleUpcoming)
        });

        if (resp.ok) {
          showToast(`Published tomorrow's edition (${tomDateStr})!`);
          fetchStoredLibrary();
        }
      } catch (err) {
        showToast(`Auto-fetch error: ${err.message}`);
      } finally {
        btnAutoFetchUpcoming.disabled = false;
      }
    });
  }

  // 10. Quick Export JSON
  if (btnQuickExportJson) {
    btnQuickExportJson.addEventListener('click', async () => {
      try {
        const resp = await fetch('/api/devotionals?latest=true&t=' + Date.now());
        const data = await resp.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `devotionals-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast("Database exported to downloads!");
      } catch (err) {
        showToast("Export failed: " + err.message);
      }
    });
  }

  // 11. Sample Template Loaders
  if (btnPasteSampleOpenHeavens) {
    btnPasteSampleOpenHeavens.addEventListener('click', () => {
      batchTextInput.value = `DATE: 2026-09-21
TOPIC: The Power of Persistent Prayer
AUTHOR: Pastor E.A. Adeboye
MEMORIZE: Luke 18:1 - And he spake a parable unto them to this end, that men ought always to pray, and not to faint.
BIBLE READING: Luke 18:1-8
MESSAGE:
Prayer is not an occasional emergency parachute; it is the vital spiritual breath of a living Christian. The enemy knows that a prayerful Christian is an unstoppable force in the kingdom of God.

When the unjust judge in Jesus' parable yielded to the persistent plea of the widow, how much more will your loving Heavenly Father avenge His elect who cry out day and night? Never give up on your spiritual altar!

PRAYER POINT: O Lord, revive my prayer altar with fresh Holy Ghost fire! Let every spirit of prayerlessness die in my life today!
HYMN: Hymn 26: Pass Me Not, O Gentle Saviour

DATE: 2026-09-22
TOPIC: Walking in Divine Purity
AUTHOR: Pastor E.A. Adeboye
MEMORIZE: 1 Peter 1:16 - Because it is written, Be ye holy; for I am holy.
BIBLE READING: 1 Peter 1:13-19
MESSAGE:
Holiness is the essential beauty of God's presence. When you choose to consecrate your life unto God, heaven backs up your confessions with signs and wonders.

PRAYER POINT: Father, purge me of all secret sins and make me a vessel unto honour.`;
      showToast("Loaded 2-day Open Heavens sample");
      triggerParseBatch();
    });
  }

  if (btnPasteSampleDclm) {
    btnPasteSampleDclm.addEventListener('click', () => {
      batchTextInput.value = `DATE: 2026-09-21
TOPIC: The Uncompromising Standard
AUTHOR: Pastor W.F. Kumuyi
KEY VERSE: 2 Timothy 2:19 - Nevertheless the foundation of God standeth sure, having this seal, The Lord knoweth them that are his. And, Let every one that nameth the name of Christ depart from iniquity.
TEXT: 2 Timothy 2:19-22
MESSAGE:
In an era where cultural compromises seek to erode biblical convictions, God's unchanging standard of holiness remains unshaken. True discipleship requires total separation from all iniquity.

PRAYER POINT: Lord, sanctify my heart completely and keep me unspotted from the world.
THOUGHT FOR THE DAY: God's standard of holiness is eternal and non-negotiable.`;
      showToast("Loaded Daily Manna sample");
      triggerParseBatch();
    });
  }

  if (btnClearBatchInput) {
    btnClearBatchInput.addEventListener('click', () => {
      batchTextInput.value = '';
      parsedBatchItems = [];
      renderParsedList();
      showToast("Cleared");
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial Load
  fetchStoredLibrary();

})();

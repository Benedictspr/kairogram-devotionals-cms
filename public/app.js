// ================= KAIROGRAM DEVOTIONALS CLOUD STUDIO CONTROLLER =================
(function() {
  let parsedBatchItems = [];
  let fullDatabaseCache = null;

  // DOM Elements
  const tabs = document.querySelectorAll('.cms-tab-btn');
  const views = document.querySelectorAll('.cms-view');
  const batchTextInput = document.getElementById('batchTextInput');
  const batchChurchSelect = document.getElementById('batchChurchSelect');
  const btnParseBatch = document.getElementById('btnParseBatch');
  const btnPublishAllBatch = document.getElementById('btnPublishAllBatch');
  const parsedListContainer = document.getElementById('parsedListContainer');
  const parsedDaysCount = document.getElementById('parsedDaysCount');
  const parserStatusHint = document.getElementById('parserStatusHint');
  const countStoredLib = document.getElementById('countStoredLib');
  const libraryGrid = document.getElementById('libraryGrid');
  const libraryFilterPills = document.getElementById('libraryFilterPills');
  const btnQuickExportJson = document.getElementById('btnQuickExportJson');
  const btnAutoFetchUpcoming = document.getElementById('btnAutoFetchUpcoming');
  const btnTestApi = document.getElementById('btnTestApi');
  const testApiStatus = document.getElementById('testApiStatus');
  const jsonPreviewBox = document.getElementById('jsonPreviewBox');
  const displayEndpointUrl = document.getElementById('displayEndpointUrl');
  const btnCopyEndpoint = document.getElementById('btnCopyEndpoint');
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

  // Sample templates
  const btnPasteSampleOpenHeavens = document.getElementById('btnPasteSampleOpenHeavens');
  const btnPasteSampleDclm = document.getElementById('btnPasteSampleDclm');
  const btnClearBatchInput = document.getElementById('btnClearBatchInput');

  // 1. Tab Switching
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabs.forEach(b => b.classList.toggle('active', b === btn));
      views.forEach(v => v.classList.toggle('active', v.id === targetTab));

      if (targetTab === 'tabLibrary') {
        fetchStoredLibrary();
      }
    });
  });

  // 2. Toast Notification
  let toastTimer = null;
  function showToast(msg) {
    if (!cmsToast) return;
    cmsToast.textContent = msg;
    cmsToast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      cmsToast.classList.add('hidden');
    }, 3200);
  }

  // 3. Smart Multi-Day Text Parser
  function parseBatchDevotionalsText(rawText, defaultChurchConfig) {
    if (!rawText || !rawText.trim()) return [];

    const [church, manual] = defaultChurchConfig.split('_');
    const sections = rawText.split(/(?:^|\n)(?=DATE[:\s–-]+|\b(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),?\s+[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i);

    const results = [];

    sections.forEach((sec, idx) => {
      const text = sec.trim();
      if (!text || text.length < 30) return;

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
        // Fallback: incremental date offset from today
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
        // Fallback: collect paragraphs
        const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => 
          !p.match(/^(?:DATE|TOPIC|MEMORI|BIBLE READING|PRAYER)/i) && p.length > 30
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
        message: messageParagraphs.length ? messageParagraphs : ["The glory of the Lord fills the temple. Walk in righteousness."],
        prayerPoints: prayerPoints.length ? prayerPoints : ["Father, let Your anointing overflow in my life today."],
        hymn,
        source: "Kairogram Devotionals Cloud Studio Batch"
      });
    });

    return results;
  }

  // 4. Render Parsed Days in Batch View
  function renderParsedList() {
    parsedDaysCount.textContent = parsedBatchItems.length;
    btnPublishAllBatch.disabled = (parsedBatchItems.length === 0);

    if (parsedBatchItems.length === 0) {
      parsedListContainer.innerHTML = `
        <div class="empty-hint-box">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>No days parsed yet. Paste multi-day devotional text on the left and click <strong>Parse & Analyze Days</strong>.</p>
        </div>
      `;
      return;
    }

    parsedListContainer.innerHTML = parsedBatchItems.map((item, idx) => `
      <div class="parsed-day-item">
        <div class="parsed-day-header">
          <span class="day-badge">${item.date}</span>
          <button type="button" class="chip-btn" data-remove-idx="${idx}" style="color:#f87171;">Remove</button>
        </div>
        <div class="parsed-topic">${escapeHtml(item.topic)}</div>
        <div class="parsed-meta-row">
          <span>Verse: ${escapeHtml(item.memoryVerseRef || 'None')}</span>
          <span>•</span>
          <span>Reading: ${escapeHtml(item.bibleReadingRef || 'None')}</span>
          <span>•</span>
          <span>${item.message.length} Paragraphs</span>
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

  // Parse button action
  if (btnParseBatch) {
    btnParseBatch.addEventListener('click', () => {
      const text = batchTextInput.value;
      if (!text.trim()) {
        showToast("Please paste devotional text first.");
        return;
      }
      const churchConf = batchChurchSelect.value || 'rccg_open_heavens';
      parsedBatchItems = parseBatchDevotionalsText(text, churchConf);
      renderParsedList();
      if (parsedBatchItems.length > 0) {
        showToast(`Parsed ${parsedBatchItems.length} day(s) successfully!`);
        parserStatusHint.textContent = `${parsedBatchItems.length} days ready to publish`;
      } else {
        showToast("No valid days detected. Check format or use sample template.");
        parserStatusHint.textContent = "Could not detect date or topic";
      }
    });
  }

  // 5. Publish Batch to Cloud API
  if (btnPublishAllBatch) {
    btnPublishAllBatch.addEventListener('click', async () => {
      if (!parsedBatchItems.length) return;
      btnPublishAllBatch.disabled = true;
      btnPublishAllBatch.innerHTML = `<span>Publishing to Cloud...</span>`;

      try {
        const resp = await fetch('/api/devotionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedBatchItems)
        });

        const result = await resp.json();
        if (resp.ok && result.success) {
          showToast(`Successfully published ${result.ingestedCount} day(s) to Cloud API!`);
          parsedBatchItems = [];
          batchTextInput.value = '';
          renderParsedList();
          parserStatusHint.textContent = "Published to Live API";
        } else {
          showToast(`Publishing failed: ${result.error || 'Server error'}`);
        }
      } catch (err) {
        console.error("Publish error:", err);
        showToast(`Network error: ${err.message}`);
      } finally {
        btnPublishAllBatch.disabled = false;
        btnPublishAllBatch.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>Publish All to Cloud API</span>
        `;
      }
    });
  }

  // 6. Single Day Form Publisher
  if (btnSaveSingleDevotional) {
    btnSaveSingleDevotional.addEventListener('click', async () => {
      const topic = formTopic.value.trim();
      const dateVal = formDate.value;
      if (!topic || !dateVal) {
        showToast("Please provide at least a Topic and Date.");
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
        source: "Kairogram Devotionals Cloud Studio Form"
      };

      try {
        const resp = await fetch('/api/devotionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await resp.json();
        if (resp.ok && res.success) {
          showToast(`Devotional for ${dateVal} published successfully!`);
        } else {
          showToast(`Error: ${res.error || 'Failed'}`);
        }
      } catch (e) {
        showToast(`Network error: ${e.message}`);
      }
    });
  }

  // 7. Stored Library Fetcher & Grid
  async function fetchStoredLibrary() {
    try {
      const resp = await fetch('/api/devotionals?latest=true');
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
      libraryGrid.innerHTML = `<p style="color:#64748b; padding:20px;">No stored devotionals found in cloud storage.</p>`;
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

    // Sort descending by date
    items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    if (countStoredLib) countStoredLib.textContent = items.length;

    if (!items.length) {
      libraryGrid.innerHTML = `<p style="color:#64748b; padding:20px;">No entries matching this filter.</p>`;
      return;
    }

    libraryGrid.innerHTML = items.map(item => `
      <div class="lib-card">
        <div class="lib-card-top">
          <span class="lib-church-tag">${escapeHtml(item.church.toUpperCase())} • ${escapeHtml(item.manual)}</span>
          <span class="lib-date-badge">${escapeHtml(item.dateKey)}</span>
        </div>
        <div class="lib-topic">${escapeHtml(item.topic || 'Untitled')}</div>
        <div class="lib-verse">"${escapeHtml(item.memoryVerseText || item.memoryVerseRef || 'Key verse not set')}"</div>
        <div class="lib-actions-row">
          <span style="font-size:11px; color:#64748b;">${escapeHtml(item.bibleReadingRef || '')}</span>
          <button type="button" class="cms-btn cms-btn-outline sm" data-load-editor="${escapeHtml(item.dateKey)}|${escapeHtml(item.church)}|${escapeHtml(item.manual)}">Edit</button>
        </div>
      </div>
    `).join('');

    // Wire editor jump
    libraryGrid.querySelectorAll('[data-load-editor]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [d, ch, man] = btn.getAttribute('data-load-editor').split('|');
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

          // Switch to Single Day Editor Tab
          tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === 'tabSingleForm'));
          views.forEach(v => v.classList.toggle('active', v.id === 'tabSingleForm'));
          showToast(`Loaded ${entry.topic} into editor`);
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

  // 8. Auto-Fetch Upcoming Days (Today & Tomorrow)
  if (btnAutoFetchUpcoming) {
    btnAutoFetchUpcoming.addEventListener('click', async () => {
      btnAutoFetchUpcoming.disabled = true;
      btnAutoFetchUpcoming.innerHTML = `<span>Fetching...</span>`;
      try {
        // Run quick simulated crawl / synchronization
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
          },
          {
            church: 'dclm',
            manual: 'dclm',
            date: tomDateStr,
            topic: "Walking in Victorious Faith",
            author: "Pastor W.F. Kumuyi",
            memoryVerseRef: "1 John 5:4",
            memoryVerseText: "For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith.",
            bibleReadingRef: "1 John 5:1-5",
            message: [
              "Faith is not positive thinking; faith is absolute confidence in the integrity of God's unchanging Word.",
              "The believer who stands upon God's promise cannot be defeated by the prevailing winds of adversity.",
              "Fix your gaze upon Christ, the Author and Finisher of our faith."
            ],
            prayerPoints: ["Lord, fortify my inner man with unshakeable faith in Your holy Word."],
            thoughtForTheDay: "Faith moves mountains when anchored in God's promises."
          }
        ];

        const resp = await fetch('/api/devotionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sampleUpcoming)
        });

        if (resp.ok) {
          showToast(`Successfully published tomorrow's editions (${tomDateStr})!`);
          fetchStoredLibrary();
        }
      } catch (err) {
        showToast(`Auto-fetch error: ${err.message}`);
      } finally {
        btnAutoFetchUpcoming.disabled = false;
        btnAutoFetchUpcoming.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          <span>Auto-Fetch Tomorrow</span>
        `;
      }
    });
  }

  // 9. Interactive API Response Tester
  if (btnTestApi) {
    btnTestApi.addEventListener('click', async () => {
      testApiStatus.textContent = "Querying live API...";
      try {
        const resp = await fetch('/api/devotionals/latest?t=' + Date.now());
        const json = await resp.json();
        jsonPreviewBox.textContent = JSON.stringify(json, null, 2);
        testApiStatus.textContent = `200 OK (${Object.keys(json.publications || {}).length} publications active)`;
        showToast("Live API responded successfully!");
      } catch (err) {
        jsonPreviewBox.textContent = `Error: ${err.message}`;
        testApiStatus.textContent = "Failed";
      }
    });
  }

  // 10. Copy Endpoint URL
  if (btnCopyEndpoint) {
    btnCopyEndpoint.addEventListener('click', () => {
      const url = `${window.location.origin}/api/devotionals/latest`;
      navigator.clipboard.writeText(url).then(() => {
        showToast("Copied API URL to clipboard!");
      });
    });
  }

  // Display origin
  if (displayEndpointUrl) {
    displayEndpointUrl.textContent = `${window.location.origin}/api/devotionals/latest`;
  }

  // 11. Quick Export JSON
  if (btnQuickExportJson) {
    btnQuickExportJson.addEventListener('click', async () => {
      try {
        const resp = await fetch('/api/devotionals?latest=true');
        const data = await resp.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `devotionals-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast("Database exported as JSON file!");
      } catch (err) {
        showToast("Export failed: " + err.message);
      }
    });
  }

  // 12. Sample Template Loaders
  if (btnPasteSampleOpenHeavens) {
    btnPasteSampleOpenHeavens.addEventListener('click', () => {
      batchTextInput.value = `DATE: 2026-09-20
TOPIC: Walking in Supernatural Wisdom
AUTHOR: Pastor E.A. Adeboye
MEMORIZE: Proverbs 3:5 - Trust in the LORD with all thine heart; and lean not unto thine own understanding.
BIBLE READING: Proverbs 3:1-12
MESSAGE:
Divine wisdom is not mere human education or worldly philosophy; it is the spiritual insight granted by the Holy Spirit to see life from God's eternal perspective. When you surrender your human reasoning to the authority of God's Word, He orders your steps with supernatural precision.

In our scripture reading today, King Solomon demonstrates that acknowledging God in all your ways is the antidote to confusion, anxiety, and stagnation. When God is the captain of your vessel, you cannot suffer spiritual shipwreck.

Beloved, make a firm commitment today to seek God's counsel before making major career, marital, and financial decisions. He that walketh with wise men shall be wise!

PRAYER POINT: Father, bestow upon me the spirit of divine wisdom, understanding, and excellent counsel in Jesus' mighty name.
HYMN: Hymn 26: Pass Me Not, O Gentle Saviour

DATE: 2026-09-21
TOPIC: The Power of Persistent Prayer
AUTHOR: Pastor E.A. Adeboye
MEMORIZE: Luke 18:1 - And he spake a parable unto them to this end, that men ought always to pray, and not to faint.
BIBLE READING: Luke 18:1-8
MESSAGE:
Prayer is not an occasional emergency parachute; it is the vital spiritual breath of a living Christian. The enemy knows that a prayerful Christian is an unstoppable force in the kingdom of God.

When the unjust judge in Jesus' parable yielded to the persistent plea of the widow, how much more will your loving Heavenly Father avenge His elect who cry out day and night? Never give up on your spiritual altar!

PRAYER POINT: O Lord, revive my prayer altar with fresh Holy Ghost fire! Let every spirit of prayerlessness die in my life today!
HYMN: Hymn 26: Pass Me Not, O Gentle Saviour`;
      showToast("Loaded 2-day Open Heavens sample");
    });
  }

  if (btnPasteSampleDclm) {
    btnPasteSampleDclm.addEventListener('click', () => {
      batchTextInput.value = `DATE: 2026-09-20
TOPIC: The Uncompromising Standard
AUTHOR: Pastor W.F. Kumuyi
KEY VERSE: 2 Timothy 2:19 - Nevertheless the foundation of God standeth sure, having this seal, The Lord knoweth them that are his. And, Let every one that nameth the name of Christ depart from iniquity.
TEXT: 2 Timothy 2:19-22
MESSAGE:
In an era where cultural compromises and moral relativism seek to erode biblical convictions, God's unchanging standard of holiness remains unshaken. True discipleship requires total separation from every appearance of evil.

Departing from iniquity is not optional; it is the definitive seal of divine ownership. Those who desire to be vessels unto honour must purge themselves from defilements.

PRAYER POINT: Lord, sanctify my heart completely and keep me unspotted from the world.
THOUGHT FOR THE DAY: God's standard of holiness is eternal and non-negotiable.`;
      showToast("Loaded Deeper Life Daily Manna sample");
    });
  }

  if (btnClearBatchInput) {
    btnClearBatchInput.addEventListener('click', () => {
      batchTextInput.value = '';
      parsedBatchItems = [];
      renderParsedList();
      showToast("Batch input cleared");
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial Load
  fetchStoredLibrary();

})();

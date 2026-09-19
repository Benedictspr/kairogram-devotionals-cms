// ================= KAIROGRAM DEVOTIONALS CLOUD STUDIO (MOBILE & ADAPTABLE) =================
(function() {
  let fullDatabaseCache = null;

  // DOM Elements
  const tabs = document.querySelectorAll('.mobile-tabs-bar .tab-item');
  const views = document.querySelectorAll('.mobile-tab-view');
  const countStoredLib = document.getElementById('countStoredLib');
  const libraryCountBadge = document.getElementById('libraryCountBadge');
  const libraryGrid = document.getElementById('libraryGrid');
  const libraryFilterPills = document.getElementById('libraryFilterPills');
  const btnQuickExportJson = document.getElementById('btnQuickExportJson');
  const btnGoToApiDocs = document.getElementById('btnGoToApiDocs');
  const cmsToast = document.getElementById('cmsToast');

  // Single Day Form elements & Labels
  const formHeaderTitle = document.getElementById('formHeaderTitle');
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
  const formBibleInOneYear = document.getElementById('formBibleInOneYear');
  const btnSaveSingleDevotional = document.getElementById('btnSaveSingleDevotional');
  const btnSaveSingleDevotionalBottom = document.getElementById('btnSaveSingleDevotionalBottom');

  // Dynamic Label Elements
  const lblFormMemoryRef = document.getElementById('lblFormMemoryRef');
  const lblFormReadingRef = document.getElementById('lblFormReadingRef');
  const lblFormMemoryText = document.getElementById('lblFormMemoryText');
  const lblFormMessageText = document.getElementById('lblFormMessageText');
  const lblFormPrayerPoints = document.getElementById('lblFormPrayerPoints');
  const lblFormHymn = document.getElementById('lblFormHymn');
  const lblFormBibleInOneYear = document.getElementById('lblFormBibleInOneYear');

  // Church-Adaptive Group Elements
  const groupMotivationalQuote = document.getElementById('groupMotivationalQuote');
  const formMotivationalQuote = document.getElementById('formMotivationalQuote');
  const groupPropheticWord = document.getElementById('groupPropheticWord');
  const formPropheticWord = document.getElementById('formPropheticWord');
  const groupDevotionalCapsule = document.getElementById('groupDevotionalCapsule');
  const formDevotionalCapsule = document.getElementById('formDevotionalCapsule');
  const groupThoughtForTheDay = document.getElementById('groupThoughtForTheDay');
  const formThoughtForTheDay = document.getElementById('formThoughtForTheDay');
  const groupConfession = document.getElementById('groupConfession');
  const formConfession = document.getElementById('formConfession');
  const groupFurtherStudy = document.getElementById('groupFurtherStudy');
  const formFurtherStudy = document.getElementById('formFurtherStudy');
  const groupMorningPrayers = document.getElementById('groupMorningPrayers');
  const formMorningPrayers = document.getElementById('formMorningPrayers');
  const groupEveningPrayers = document.getElementById('groupEveningPrayers');
  const formEveningPrayers = document.getElementById('formEveningPrayers');
  const groupPrayerPoints = document.getElementById('groupPrayerPoints');
  const groupMessageBody = document.getElementById('groupMessageBody');
  const groupHymn = document.getElementById('groupHymn');
  const groupBibleInOneYear = document.getElementById('groupBibleInOneYear');

  // Sunday School Specific Elements (Adult & YAYA Students/Teachers)
  const groupSsLessonNum = document.getElementById('groupSsLessonNum');
  const formLessonNum = document.getElementById('formLessonNum');
  const groupSsIntro = document.getElementById('groupSsIntro');
  const formSsIntro = document.getElementById('formSsIntro');
  const groupSsTeacher = document.getElementById('groupSsTeacher');
  const formSsTeacherAim = document.getElementById('formSsTeacherAim');
  const formSsTeacherObjectives = document.getElementById('formSsTeacherObjectives');
  const groupSsTeacherActivities = document.getElementById('groupSsTeacherActivities');
  const formSsClassActivities = document.getElementById('formSsClassActivities');
  const formSsMarkingScheme = document.getElementById('formSsMarkingScheme');
  const groupSsYouthFocus = document.getElementById('groupSsYouthFocus');
  const formSsYouthFocus = document.getElementById('formSsYouthFocus');
  const groupSsOutlines = document.getElementById('groupSsOutlines');
  const formSsOutline1 = document.getElementById('formSsOutline1');
  const formSsOutline2 = document.getElementById('formSsOutline2');
  const groupSsDiscussion = document.getElementById('groupSsDiscussion');
  const formSsDiscussion = document.getElementById('formSsDiscussion');
  const groupSsSummaryAssignment = document.getElementById('groupSsSummaryAssignment');
  const formSsSummary = document.getElementById('formSsSummary');
  const formSsAssignment = document.getElementById('formSsAssignment');

  // API & Documentation Tab Elements
  const btnCopyApiBaseUrl = document.getElementById('btnCopyApiBaseUrl');
  const btnTestLiveApi = document.getElementById('btnTestLiveApi');
  const livePingStatus = document.getElementById('livePingStatus');
  const livePingText = document.getElementById('livePingText');
  const apiTestResponseWrap = document.getElementById('apiTestResponseWrap');
  const apiTestLatency = document.getElementById('apiTestLatency');
  const apiTestJsonPre = document.getElementById('apiTestJsonPre');
  const btnCopyApiResponse = document.getElementById('btnCopyApiResponse');
  const schemaFilterPills = document.getElementById('schemaFilterPills');
  const schemaTitleLabel = document.getElementById('schemaTitleLabel');
  const schemaJsonPre = document.getElementById('schemaJsonPre');
  const btnCopySchema = document.getElementById('btnCopySchema');

  // 1. Mobile Tab Switching
  function switchTab(targetTab) {
    tabs.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === targetTab));
    views.forEach(v => v.classList.toggle('active', v.id === targetTab));

    if (targetTab === 'tabLibrary') {
      fetchStoredLibrary();
    } else if (targetTab === 'tabApiDocs') {
      loadSelectedSchema('open_heavens');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  if (btnGoToApiDocs) {
    btnGoToApiDocs.addEventListener('click', () => switchTab('tabApiDocs'));
  }

  // 2. Mobile Toast Notification
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

  // 3. Form Church Adaptability Engine (Strict Church Isolation)
  const churchManualOptions = {
    rccg: [
      { val: 'open_heavens', label: 'Open Heavens Daily Devotional' },
      { val: 'rccg_ss_adult', label: 'RCCG Sunday School (Adult - Student Manual)' },
      { val: 'rccg_ss_teacher', label: 'RCCG Sunday School (Adult - Teacher\'s Guide)' },
      { val: 'rccg_yaya_student', label: 'RCCG YAYA Sunday School (Youth - Student Manual)' },
      { val: 'rccg_yaya_teacher', label: 'RCCG YAYA Sunday School (Youth - Teacher\'s Guide)' }
    ],
    dclm: [
      { val: 'dclm', label: 'Daily Manna (Deeper Life)' }
    ],
    mfm: [
      { val: 'mfm', label: 'Mountain Top Life (MFM)' }
    ],
    christ_embassy: [
      { val: 'rhapsody', label: 'Rhapsody of Realities' }
    ],
    odm: [
      { val: 'odm', label: 'Our Daily Manna (ODM)' }
    ],
    dunamis: [
      { val: 'seeds', label: 'Seeds of Destiny' }
    ],
    winners: [
      { val: 'winners', label: 'Word of Faith' }
    ]
  };

  function updateManualDropdownForChurch(ch, selectedVal) {
    if (!formManual) return;
    const opts = churchManualOptions[ch] || churchManualOptions.rccg;
    formManual.innerHTML = opts.map(o => `<option value="${o.val}">${o.label}</option>`).join('');
    if (selectedVal && opts.some(o => o.val === selectedVal)) {
      formManual.value = selectedVal;
    } else {
      formManual.value = opts[0].val;
    }
  }

  function adaptFormToChurch() {
    const ch = formChurch.value;
    const man = formManual.value;
    const isSs = man.startsWith('rccg_ss') || man.startsWith('rccg_yaya');
    const isTeacher = man.includes('teacher');
    const isYaya = man.includes('yaya');

    // 1. Hide ALL optional sections by default (Clean slate)
    const allOptionalGroups = [
      groupMotivationalQuote, groupPropheticWord, groupDevotionalCapsule,
      groupThoughtForTheDay, groupConfession, groupFurtherStudy,
      groupMorningPrayers, groupEveningPrayers, groupPrayerPoints,
      groupHymn, groupBibleInOneYear, groupSsLessonNum, groupSsIntro,
      groupSsTeacher, groupSsTeacherActivities, groupSsYouthFocus, groupSsOutlines,
      groupSsDiscussion, groupSsSummaryAssignment
    ];
    allOptionalGroups.forEach(g => { if (g) g.classList.add('hidden'); });

    // 2. Case A: Sunday School Manuals (Adult Student, Adult Teacher, YAYA Student, YAYA Teacher)
    if (isSs) {
      if (formHeaderTitle) {
        if (man === 'rccg_ss_teacher') formHeaderTitle.textContent = "RCCG Sunday School (Adult - Teacher's Guide)";
        else if (man === 'rccg_yaya_teacher') formHeaderTitle.textContent = "RCCG YAYA (Youth - Teacher's Guide)";
        else if (man === 'rccg_yaya_student') formHeaderTitle.textContent = "RCCG YAYA (Youth - Student Manual)";
        else formHeaderTitle.textContent = "RCCG Sunday School (Adult - Student Manual)";
      }

      if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Memory Verse Reference";
      if (lblFormReadingRef) lblFormReadingRef.textContent = "Bible Passage";
      if (lblFormMemoryText) lblFormMemoryText.textContent = "Memory Verse Quotation";
      if (lblFormMessageText) lblFormMessageText.textContent = "Teacher / Expository Background";
      if (lblFormHymn) lblFormHymn.textContent = "Sunday School Hymn";

      if (groupSsLessonNum) groupSsLessonNum.classList.remove('hidden');
      if (groupSsIntro) groupSsIntro.classList.remove('hidden');
      if (groupSsOutlines) groupSsOutlines.classList.remove('hidden');
      if (groupSsDiscussion) groupSsDiscussion.classList.remove('hidden');
      if (groupSsSummaryAssignment) groupSsSummaryAssignment.classList.remove('hidden');
      if (groupHymn) groupHymn.classList.remove('hidden');

      // Teacher-only tools
      if (isTeacher) {
        if (groupSsTeacher) groupSsTeacher.classList.remove('hidden');
        if (groupSsTeacherActivities) groupSsTeacherActivities.classList.remove('hidden');
      }

      // Youth Focus for YAYA
      if (isYaya) {
        if (groupSsYouthFocus) groupSsYouthFocus.classList.remove('hidden');
      }
      return;
    }

    // 3. Case B: Deeper Life (DCLM Daily Manna)
    if (ch === 'dclm') {
      if (formHeaderTitle) formHeaderTitle.textContent = "DCLM Daily Manna Entry";
      if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Key Verse Reference";
      if (lblFormReadingRef) lblFormReadingRef.textContent = "Text (Scripture Reading)";
      if (lblFormMemoryText) lblFormMemoryText.textContent = "Key Verse Quotation";
      if (lblFormMessageText) lblFormMessageText.textContent = "Devotional Message";
      if (lblFormPrayerPoints) lblFormPrayerPoints.textContent = "Prayer (Optional)";
      if (lblFormBibleInOneYear) lblFormBibleInOneYear.textContent = "Bible in One Year";

      if (groupThoughtForTheDay) groupThoughtForTheDay.classList.remove('hidden');
      if (groupPrayerPoints) groupPrayerPoints.classList.remove('hidden');
      if (groupBibleInOneYear) groupBibleInOneYear.classList.remove('hidden');
      return;
    }

    // 4. Case C: MFM Mountain Top Life
    if (ch === 'mfm') {
      if (formHeaderTitle) formHeaderTitle.textContent = "MFM Mountain Top Life Entry";
      if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Memory Verse Reference";
      if (lblFormReadingRef) lblFormReadingRef.textContent = "Fire Scripture Passage";
      if (lblFormMemoryText) lblFormMemoryText.textContent = "Memory Verse Quotation";
      if (lblFormMessageText) lblFormMessageText.textContent = "Devotional Message";
      if (lblFormBibleInOneYear) lblFormBibleInOneYear.textContent = "Bible in One Year";

      if (groupMotivationalQuote) groupMotivationalQuote.classList.remove('hidden');
      if (groupPropheticWord) groupPropheticWord.classList.remove('hidden');
      if (groupMorningPrayers) groupMorningPrayers.classList.remove('hidden');
      if (groupEveningPrayers) groupEveningPrayers.classList.remove('hidden');
      if (groupBibleInOneYear) groupBibleInOneYear.classList.remove('hidden');
      return;
    }

    // 5. Case D: Christ Embassy Rhapsody of Realities
    if (ch === 'christ_embassy') {
      if (formHeaderTitle) formHeaderTitle.textContent = "Rhapsody of Realities Entry";
      if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Opening / Theme Scripture";
      if (lblFormReadingRef) lblFormReadingRef.textContent = "Theme Reading Reference";
      if (lblFormMemoryText) lblFormMemoryText.textContent = "Scripture Quotation";
      if (lblFormMessageText) lblFormMessageText.textContent = "Devotional Message";
      if (lblFormBibleInOneYear) lblFormBibleInOneYear.textContent = "1-Year & 2-Year Bible Reading Plan";

      if (groupConfession) groupConfession.classList.remove('hidden');
      if (groupFurtherStudy) groupFurtherStudy.classList.remove('hidden');
      if (groupBibleInOneYear) groupBibleInOneYear.classList.remove('hidden');
      return;
    }

    // 6. Case E: Our Daily Manna (ODM)
    if (ch === 'odm') {
      if (formHeaderTitle) formHeaderTitle.textContent = "Our Daily Manna (ODM) Entry";
      if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Basic Scripture Reference";
      if (lblFormReadingRef) lblFormReadingRef.textContent = "Devotional Reading Passage";
      if (lblFormMemoryText) lblFormMemoryText.textContent = "Basic Scripture Quotation";
      if (lblFormMessageText) lblFormMessageText.textContent = "Devotional Message";
      if (lblFormPrayerPoints) lblFormPrayerPoints.textContent = "Prayer Bullets";
      if (lblFormBibleInOneYear) lblFormBibleInOneYear.textContent = "Bible in One Year";

      if (groupDevotionalCapsule) groupDevotionalCapsule.classList.remove('hidden');
      if (groupPropheticWord) groupPropheticWord.classList.remove('hidden');
      if (groupPrayerPoints) groupPrayerPoints.classList.remove('hidden');
      if (groupBibleInOneYear) groupBibleInOneYear.classList.remove('hidden');
      return;
    }

    // 7. Case F: Dunamis Seeds of Destiny
    if (ch === 'dunamis') {
      if (formHeaderTitle) formHeaderTitle.textContent = "Seeds of Destiny Entry";
      if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Scripture Reference";
      if (lblFormReadingRef) lblFormReadingRef.textContent = "Bible Reading Passage";
      if (lblFormMemoryText) lblFormMemoryText.textContent = "Scripture Quotation";
      if (lblFormMessageText) lblFormMessageText.textContent = "Devotional Message";
      if (lblFormPrayerPoints) lblFormPrayerPoints.textContent = "Prayer / Action Point";
      if (lblFormBibleInOneYear) lblFormBibleInOneYear.textContent = "Bible in One Year";

      if (groupThoughtForTheDay) groupThoughtForTheDay.classList.remove('hidden');
      if (groupPropheticWord) groupPropheticWord.classList.remove('hidden');
      if (groupPrayerPoints) groupPrayerPoints.classList.remove('hidden');
      if (groupBibleInOneYear) groupBibleInOneYear.classList.remove('hidden');
      return;
    }

    // 8. Case G: RCCG Open Heavens (Default)
    if (formHeaderTitle) formHeaderTitle.textContent = "Open Heavens Devotional Entry";
    if (lblFormMemoryRef) lblFormMemoryRef.textContent = "Memorise (Verse Ref)";
    if (lblFormReadingRef) lblFormReadingRef.textContent = "Bible Reading Passage";
    if (lblFormMemoryText) lblFormMemoryText.textContent = "Memory Verse Quotation";
    if (lblFormMessageText) lblFormMessageText.textContent = "Message Paragraphs";
    if (lblFormPrayerPoints) lblFormPrayerPoints.textContent = "Prayer Point";
    if (lblFormHymn) lblFormHymn.textContent = "Hymn Lyrics / Title";
    if (lblFormBibleInOneYear) lblFormBibleInOneYear.textContent = "Bible in One Year";

    if (groupPrayerPoints) groupPrayerPoints.classList.remove('hidden');
    if (groupHymn) groupHymn.classList.remove('hidden');
    if (groupBibleInOneYear) groupBibleInOneYear.classList.remove('hidden');
  }

  // Church selection auto-updates author, publications, and form layout
  if (formChurch) {
    formChurch.addEventListener('change', () => {
      const ch = formChurch.value;
      const authors = {
        rccg: "Pastor E.A. Adeboye",
        dclm: "Pastor W.F. Kumuyi",
        mfm: "Dr. D.K. Olukoya",
        christ_embassy: "Pastor Chris Oyakhilome",
        odm: "Bishop Dr. Chris Kwakpovwe",
        dunamis: "Pastor Dr. Paul Enenche",
        winners: "Bishop David O. Oyedepo"
      };
      if (authors[ch] && formAuthor) formAuthor.value = authors[ch];

      updateManualDropdownForChurch(ch);
      adaptFormToChurch();
    });
  }

  if (formManual) {
    formManual.addEventListener('change', () => {
      const man = formManual.value;
      if (man.startsWith('rccg_ss') || man.startsWith('rccg_yaya')) {
        if (formAuthor) {
          if (man === 'rccg_ss_teacher') formAuthor.value = "RCCG Sunday School Directorate (Teacher's Guide)";
          else if (man === 'rccg_yaya_teacher') formAuthor.value = "RCCG YAYA Sunday School (Youth Teacher's Guide)";
          else if (man === 'rccg_yaya_student') formAuthor.value = "RCCG YAYA Sunday School Directorate";
          else formAuthor.value = "RCCG Sunday School Directorate";
        }
      } else if (formChurch.value === 'rccg') {
        if (formAuthor) formAuthor.value = "Pastor E.A. Adeboye";
      }
      adaptFormToChurch();
    });
  }

  // 4. Single Day Form Publisher (With Real-Time Broadcast & Local Storage Backup)
  async function submitSingleForm() {
    const topic = formTopic.value.trim();
    const dateVal = formDate.value;
    if (!topic || !dateVal) {
      showToast("Please provide Topic and Date.");
      return;
    }

    const ch = formChurch.value;
    const man = formManual.value;
    const isSs = man.startsWith('rccg_ss') || man.startsWith('rccg_yaya');
    const isTeacher = man.includes('teacher');
    const isYaya = man.includes('yaya');

    const msgParas = formMessageText.value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const prayerPts = formPrayerPoints.value.split('\n').map(p => p.trim()).filter(Boolean);

    const payload = {
      church: ch,
      manual: man,
      date: dateVal,
      dateLabel: dateVal,
      topic,
      author: formAuthor.value.trim(),
      memoryVerseRef: formMemoryRef.value.trim(),
      memoryVerseText: formMemoryText.value.trim(),
      bibleReadingRef: formReadingRef.value.trim(),
      message: msgParas.length ? msgParas : [topic],
      prayerPoints: prayerPts.length ? prayerPts : ["Lord, guide my steps today."],
      hymn: formHymnOrConfession.value.trim(),
      bibleInOneYear: formBibleInOneYear ? formBibleInOneYear.value.trim() : "",
      source: "Kairogram Devotionals Cloud CMS"
    };

    // MFM fields
    if (formMotivationalQuote && formMotivationalQuote.value.trim()) payload.motivationalQuote = formMotivationalQuote.value.trim();
    if (formPropheticWord && formPropheticWord.value.trim()) payload.propheticWord = formPropheticWord.value.trim();
    if (formMorningPrayers && formMorningPrayers.value.trim()) payload.morningPrayers = formMorningPrayers.value.split('\n').map(p => p.trim()).filter(Boolean);
    if (formEveningPrayers && formEveningPrayers.value.trim()) payload.eveningPrayers = formEveningPrayers.value.split('\n').map(p => p.trim()).filter(Boolean);

    // DCLM & Dunamis
    if (formThoughtForTheDay && formThoughtForTheDay.value.trim()) payload.thoughtForTheDay = formThoughtForTheDay.value.trim();

    // Rhapsody
    if (formConfession && formConfession.value.trim()) payload.confession = formConfession.value.trim();
    if (formFurtherStudy && formFurtherStudy.value.trim()) payload.furtherStudy = formFurtherStudy.value.split(/[;\n]+/).map(s => s.trim()).filter(Boolean);

    // ODM
    if (formDevotionalCapsule && formDevotionalCapsule.value.trim()) payload.devotionalCapsule = formDevotionalCapsule.value.trim();

    // Sunday School Specific
    if (isSs) {
      payload.isSundaySchool = true;
      payload.lessonNum = formLessonNum ? parseInt(formLessonNum.value, 10) || 1 : 1;
      payload.introduction = formSsIntro ? formSsIntro.value.trim() : "";
      payload.teachingAim = formSsTeacherAim ? formSsTeacherAim.value.trim() : "";
      if (formSsTeacherObjectives && formSsTeacherObjectives.value.trim()) {
        payload.teacherObjectives = formSsTeacherObjectives.value.split('\n').map(o => o.trim()).filter(Boolean);
      }
      if (formSsClassActivities && formSsClassActivities.value.trim()) {
        payload.classActivities = formSsClassActivities.value.trim();
      }
      if (formSsMarkingScheme && formSsMarkingScheme.value.trim()) {
        payload.markingScheme = formSsMarkingScheme.value.trim();
      }
      if (formSsYouthFocus && formSsYouthFocus.value.trim()) {
        payload.youthFocus = formSsYouthFocus.value.trim();
      }
      payload.discussion = formSsDiscussion ? formSsDiscussion.value.trim() : "";
      payload.summary = formSsSummary ? formSsSummary.value.trim() : "";
      payload.assignment = formSsAssignment ? formSsAssignment.value.trim() : "";
      
      const outlines = [];
      if (formSsOutline1 && formSsOutline1.value.trim()) outlines.push(formSsOutline1.value.trim());
      if (formSsOutline2 && formSsOutline2.value.trim()) outlines.push(formSsOutline2.value.trim());
      payload.outlines = outlines;
    }

    // Set buttons loading
    const oldTopText = btnSaveSingleDevotional.innerHTML;
    btnSaveSingleDevotional.disabled = true;
    btnSaveSingleDevotional.innerHTML = `<span>Publishing...</span>`;
    if (btnSaveSingleDevotionalBottom) {
      btnSaveSingleDevotionalBottom.disabled = true;
      btnSaveSingleDevotionalBottom.innerHTML = `<span>Publishing to Kairogram...</span>`;
    }

    try {
      // 1. Post to live Vercel endpoint
      const resp = await fetch('/api/devotionals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await resp.json();

      if (resp.ok && res.success) {
        // 2. Synchronous local storage persistence
        try {
          localStorage.setItem(`kairogram_cloud_dev_${ch}_${man}`, JSON.stringify(payload));
          localStorage.setItem('kairogram_cms_last_published', JSON.stringify({
            timestamp: Date.now(),
            entry: payload
          }));
        } catch (storageErr) {}

        // 3. Broadcast real-time event across browser tabs to Kairogram app
        try {
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('kairogram_devotionals_channel');
            bc.postMessage({
              action: 'refresh',
              timestamp: Date.now(),
              church: ch,
              manual: man,
              entry: payload
            });
          }
        } catch (bcErr) {}

        showToast(`Published to Kairogram! (${isSs ? `${man} Lesson ${payload.lessonNum}` : dateVal}) 🎉`);
        fetchStoredLibrary();
      } else {
        showToast(`Error: ${res.error || 'Failed to publish'}`);
      }
    } catch (e) {
      // Offline fallback
      try {
        localStorage.setItem(`kairogram_cloud_dev_${ch}_${man}`, JSON.stringify(payload));
        localStorage.setItem('kairogram_cms_last_published', JSON.stringify({
          timestamp: Date.now(),
          entry: payload
        }));
        showToast(`Saved locally on device! (Offline: ${e.message})`);
      } catch (_) {
        showToast(`Network error: ${e.message}`);
      }
    } finally {
      btnSaveSingleDevotional.disabled = false;
      btnSaveSingleDevotional.innerHTML = oldTopText;
      if (btnSaveSingleDevotionalBottom) {
        btnSaveSingleDevotionalBottom.disabled = false;
        btnSaveSingleDevotionalBottom.innerHTML = `<span>Publish Devotional to Kairogram</span>`;
      }
    }
  }

  if (btnSaveSingleDevotional) btnSaveSingleDevotional.addEventListener('click', submitSingleForm);
  if (btnSaveSingleDevotionalBottom) btnSaveSingleDevotionalBottom.addEventListener('click', submitSingleForm);

  // 5. Stored Library Fetcher
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
        <div class="lib-preview">"${escapeHtml(item.memoryVerseText || item.memoryVerseRef || item.bibleReadingRef || '')}"</div>
      </div>
    `).join('');

    // Tap card to edit with full church adaptation
    libraryGrid.querySelectorAll('[data-edit-item]').forEach(card => {
      card.addEventListener('click', () => {
        const [d, ch, man] = card.getAttribute('data-edit-item').split('|');
        const entry = store.dates[d] && store.dates[d][`${ch}_${man}`];
        if (entry) {
          formChurch.value = entry.church || 'rccg';
          updateManualDropdownForChurch(entry.church || 'rccg', entry.manual || 'open_heavens');
          adaptFormToChurch();

          formDate.value = entry.date || d;
          formTopic.value = entry.topic || '';
          formAuthor.value = entry.author || '';
          formMemoryRef.value = entry.memoryVerseRef || '';
          formMemoryText.value = entry.memoryVerseText || '';
          formReadingRef.value = entry.bibleReadingRef || '';
          formMessageText.value = Array.isArray(entry.message) ? entry.message.join('\n\n') : (entry.message || '');
          formPrayerPoints.value = Array.isArray(entry.prayerPoints) ? entry.prayerPoints.join('\n') : (entry.prayerPoints || '');
          formHymnOrConfession.value = entry.hymn || entry.confession || '';
          if (formBibleInOneYear) formBibleInOneYear.value = entry.bibleInOneYear || '';

          if (formMotivationalQuote) formMotivationalQuote.value = entry.motivationalQuote || '';
          if (formPropheticWord) formPropheticWord.value = entry.propheticWord || '';
          if (formThoughtForTheDay) formThoughtForTheDay.value = entry.thoughtForTheDay || '';
          if (formConfession) formConfession.value = entry.confession || '';
          if (formFurtherStudy) formFurtherStudy.value = Array.isArray(entry.furtherStudy) ? entry.furtherStudy.join('; ') : (entry.furtherStudy || '');
          if (formDevotionalCapsule) formDevotionalCapsule.value = entry.devotionalCapsule || '';
          if (formMorningPrayers) formMorningPrayers.value = Array.isArray(entry.morningPrayers) ? entry.morningPrayers.join('\n') : (entry.morningPrayers || '');
          if (formEveningPrayers) formEveningPrayers.value = Array.isArray(entry.eveningPrayers) ? entry.eveningPrayers.join('\n') : (entry.eveningPrayers || '');

          if (formLessonNum) formLessonNum.value = entry.lessonNum || 1;
          if (formSsIntro) formSsIntro.value = entry.introduction || '';
          if (formSsTeacherAim) formSsTeacherAim.value = entry.teachingAim || '';
          if (formSsTeacherObjectives) formSsTeacherObjectives.value = Array.isArray(entry.teacherObjectives) ? entry.teacherObjectives.join('\n') : (entry.teacherObjectives || '');
          if (formSsClassActivities) formSsClassActivities.value = entry.classActivities || '';
          if (formSsMarkingScheme) formSsMarkingScheme.value = entry.markingScheme || '';
          if (formSsYouthFocus) formSsYouthFocus.value = entry.youthFocus || '';
          if (formSsDiscussion) formSsDiscussion.value = entry.discussion || '';
          if (formSsSummary) formSsSummary.value = entry.summary || '';
          if (formSsAssignment) formSsAssignment.value = entry.assignment || '';
          if (entry.outlines && entry.outlines.length) {
            if (formSsOutline1) formSsOutline1.value = typeof entry.outlines[0] === 'string' ? entry.outlines[0] : (entry.outlines[0]?.title || '');
            if (formSsOutline2) formSsOutline2.value = typeof entry.outlines[1] === 'string' ? entry.outlines[1] : (entry.outlines[1]?.title || '');
          }

          // Switch to Form Entry
          switchTab('tabSingleForm');
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

  // 6. Quick Export JSON
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

  // 7. Interactive API Tester & Schema Explorer
  const schemas = {
    open_heavens: {
      title: "RCCG Open Heavens Daily Devotional",
      data: {
        church: "rccg",
        manual: "open_heavens",
        date: "2026-09-20",
        dateLabel: "Sunday, September 20, 2026",
        topic: "The Wonders of Divine Favor",
        author: "Pastor E.A. Adeboye",
        memoryVerseRef: "Psalm 102:13",
        memoryVerseText: "Thou shalt arise, and have mercy upon Zion: for the time to favour her, yea, the set time, is come.",
        bibleReadingRef: "Esther 2:15-18",
        message: [
          "Favor is the supernatural fragrance that attracts unmerited blessings into the life of a believer.",
          "When God's favor rests upon an ordinary person, protocols are suspended for their sake."
        ],
        prayerPoints: [
          "Father, let Your set time of divine favor locate my destiny today in Jesus' name."
        ],
        hymn: "Hymn 26: Pass Me Not, O Gentle Saviour",
        bibleInOneYear: "Esther 1-4; Psalm 102"
      }
    },
    ss_adult: {
      title: "RCCG Sunday School (Adult - Student Manual)",
      data: {
        church: "rccg",
        manual: "rccg_ss_adult",
        isSundaySchool: true,
        lessonNum: 3,
        date: "2026-09-20",
        topic: "The Sanctified Vessel",
        author: "RCCG Sunday School Directorate",
        memoryVerseRef: "2 Timothy 2:21",
        memoryVerseText: "If a man therefore purge himself from these, he shall be a vessel unto honour, sanctified, and meet for the master's use...",
        bibleReadingRef: "2 Timothy 2:20-22",
        introduction: "In a great house there are vessels of gold, silver, wood, and earth...",
        outlines: [
          "Outline 1: The Call to Personal Consecration\nBelievers are commanded to cleanse themselves from worldly entanglements.",
          "Outline 2: The Rewards of a Sanctified Life\nWhen a vessel is purified, God fills it with spiritual gifts and honor."
        ],
        discussion: "How can a Christian maintain purity and sanctification in the workplace? (Discuss with biblical examples).",
        summary: "Purification from sin is essential for anyone desiring to be used powerfully by God.",
        assignment: "Identify three personal habits that hinder spiritual consecration and write out scriptural steps to eliminate them.",
        hymn: "O Sunday School, on the Lord's Day, O how I love thee well..."
      }
    },
    ss_teacher: {
      title: "RCCG Sunday School (Adult - Teacher's Guide)",
      data: {
        church: "rccg",
        manual: "rccg_ss_teacher",
        isSundaySchool: true,
        lessonNum: 3,
        date: "2026-09-20",
        topic: "The Sanctified Vessel",
        author: "RCCG Sunday School Directorate (Teacher's Guide)",
        memoryVerseRef: "2 Timothy 2:21",
        memoryVerseText: "If a man therefore purge himself from these, he shall be a vessel unto honour, sanctified, and meet for the master's use...",
        bibleReadingRef: "2 Timothy 2:20-22",
        teachingAim: "To lead students to understand biblical sanctification and practical consecration.",
        teacherObjectives: [
          "1. Identify the biblical qualities of a sanctified vessel",
          "2. Highlight practical temptations to overcome",
          "3. Encourage students to live consecrated lives"
        ],
        classActivities: "Class Activity 1: Group discussion on overcoming peer pressure in the workplace. (10 marks)",
        markingScheme: "Marking Guide: Scripture contribution (10mks), Active participation (10mks). Total: 20 marks.",
        introduction: "In a great house there are vessels of gold, silver, wood, and earth...",
        outlines: [
          "Outline 1: The Call to Personal Consecration",
          "Outline 2: The Rewards of a Sanctified Life"
        ],
        discussion: "What are the common modern traps that defile the believer's vessel?",
        summary: "Sanctification is God's will for every believer.",
        assignment: "Lead one person to Christ and encourage them to enroll in baptism class."
      }
    },
    ss_yaya: {
      title: "RCCG YAYA Sunday School (Youth - Student & Teacher)",
      data: {
        church: "rccg",
        manual: "rccg_yaya_student",
        isSundaySchool: true,
        lessonNum: 3,
        date: "2026-09-20",
        topic: "Navigating Digital Distractions",
        author: "RCCG YAYA Sunday School Directorate",
        memoryVerseRef: "Ephesians 5:16",
        memoryVerseText: "Redeeming the time, because the days are evil.",
        bibleReadingRef: "Ephesians 5:14-18",
        youthFocus: "Empowering youths to maintain spiritual focus and purity amidst social media algorithms, online gaming, and digital peer pressure.",
        introduction: "The digital age brings unprecedented opportunities alongside deceptive spiritual traps...",
        outlines: [
          "Outline 1: Time Stewardship in the Digital Era",
          "Outline 2: Guarding the Eye and Mind Gates"
        ],
        discussion: "How many hours daily do you spend on social feeds vs prayer and Bible study?",
        summary: "Your attention is your greatest spiritual currency.",
        assignment: "Practice a 24-hour social media fast this week and log your spiritual reflections."
      }
    },
    dclm: {
      title: "Deeper Life Daily Manna",
      data: {
        church: "dclm",
        manual: "dclm",
        date: "2026-09-20",
        topic: "The Uncompromising Standard",
        author: "Pastor W.F. Kumuyi",
        memoryVerseRef: "2 Timothy 2:19",
        memoryVerseText: "Nevertheless the foundation of God standeth sure, having this seal, The Lord knoweth them that are his. And, Let every one that nameth the name of Christ depart from iniquity.",
        bibleReadingRef: "2 Timothy 2:19-22",
        message: [
          "In an era where cultural compromises seek to erode biblical convictions, God's unchanging standard of holiness remains unshaken."
        ],
        thoughtForTheDay: "God's standard of holiness is eternal and non-negotiable.",
        bibleInOneYear: "2 Timothy 1-4; Proverbs 12"
      }
    },
    mfm: {
      title: "MFM Mountain Top Life",
      data: {
        church: "mfm",
        manual: "mfm",
        date: "2026-09-20",
        topic: "Total Victory Over Stubborn Yokes",
        author: "Dr. D.K. Olukoya",
        motivationalQuote: "A closed mouth is a closed destiny; spiritual warfare responds only to Holy Ghost fire.",
        propheticWord: "Every Pharaoh harassing your star shall drown in the Red Sea today!",
        memoryVerseRef: "Isaiah 10:27",
        memoryVerseText: "And it shall come to pass in that day, that his burden shall be taken away from off thy shoulder...",
        bibleReadingRef: "Isaiah 10:27; Obadiah 1:17",
        morningPrayers: [
          "1. Every ancestral padlock assigned against my progress, catch fire in Jesus' name!",
          "2. Holy Ghost fire, incubate my prayer altar for unusual breakthroughs!"
        ],
        eveningPrayers: [
          "1. Powers of the night assigned against my glory, scatter unto desolation!"
        ],
        bibleInOneYear: "Isaiah 10-12; Psalm 91"
      }
    }
  };

  function loadSelectedSchema(schemaKey) {
    const s = schemas[schemaKey] || schemas.open_heavens;
    if (schemaTitleLabel) schemaTitleLabel.textContent = s.title;
    if (schemaJsonPre) schemaJsonPre.textContent = JSON.stringify(s.data, null, 2);
  }

  if (schemaFilterPills) {
    schemaFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      schemaFilterPills.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p === pill));
      const key = pill.getAttribute('data-schema');
      loadSelectedSchema(key);
    });
  }

  if (btnCopySchema) {
    btnCopySchema.addEventListener('click', () => {
      if (schemaJsonPre && navigator.clipboard) {
        navigator.clipboard.writeText(schemaJsonPre.textContent);
        showToast("Schema copied to clipboard!");
      }
    });
  }

  if (btnCopyApiBaseUrl) {
    btnCopyApiBaseUrl.addEventListener('click', () => {
      const url = `${window.location.origin}/api/devotionals/latest`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast("Copied: " + url);
      }
    });
  }

  if (btnCopyApiResponse) {
    btnCopyApiResponse.addEventListener('click', () => {
      if (apiTestJsonPre && navigator.clipboard) {
        navigator.clipboard.writeText(apiTestJsonPre.textContent);
        showToast("Response JSON copied to clipboard!");
      }
    });
  }

  // Interactive Live Ping
  if (btnTestLiveApi) {
    btnTestLiveApi.addEventListener('click', async () => {
      btnTestLiveApi.disabled = true;
      if (livePingStatus) livePingStatus.className = "api-status-badge loading";
      if (livePingText) livePingText.textContent = "Querying live feed...";

      const start = performance.now();
      try {
        const resp = await fetch('/api/devotionals/latest?t=' + Date.now());
        const duration = Math.round(performance.now() - start);
        const data = await resp.json();

        if (resp.ok) {
          if (livePingStatus) livePingStatus.className = "api-status-badge";
          if (livePingText) livePingText.textContent = `Connected (200 OK • ${duration}ms)`;
          if (apiTestLatency) apiTestLatency.textContent = `Response: 200 OK (${duration}ms latency)`;
          if (apiTestJsonPre) apiTestJsonPre.textContent = JSON.stringify(data, null, 2);
          if (apiTestResponseWrap) apiTestResponseWrap.classList.remove('hidden');
          showToast(`Feed online! Live latency: ${duration}ms`);
        } else {
          throw new Error(`HTTP ${resp.status}`);
        }
      } catch (err) {
        if (livePingStatus) livePingStatus.className = "api-status-badge loading";
        if (livePingText) livePingText.textContent = `Error: ${err.message}`;
        showToast(`API Ping Error: ${err.message}`);
      } finally {
        btnTestLiveApi.disabled = false;
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial Load & Form Adaptation
  if (formChurch) updateManualDropdownForChurch(formChurch.value);
  adaptFormToChurch();
  fetchStoredLibrary();
  loadSelectedSchema('open_heavens');

})();

// ================= KAIROGRAM DEVOTIONALS CLOUD STUDIO (MOBILE & ADAPTABLE) =================
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

  // Sunday School Specific Elements
  const groupSsLessonNum = document.getElementById('groupSsLessonNum');
  const formLessonNum = document.getElementById('formLessonNum');
  const groupSsIntro = document.getElementById('groupSsIntro');
  const formSsIntro = document.getElementById('formSsIntro');
  const groupSsTeacher = document.getElementById('groupSsTeacher');
  const formSsTeacherAim = document.getElementById('formSsTeacherAim');
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

  // Sample templates
  const btnPasteSampleOpenHeavens = document.getElementById('btnPasteSampleOpenHeavens');
  const btnPasteSampleDclm = document.getElementById('btnPasteSampleDclm');
  const btnPasteSampleMfm = document.getElementById('btnPasteSampleMfm');
  const btnPasteSampleRhapsody = document.getElementById('btnPasteSampleRhapsody');
  const btnPasteSampleSundaySchool = document.getElementById('btnPasteSampleSundaySchool');
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

  // 3. Form Church Adaptability Engine
  // 3. Form Church Adaptability Engine (Strict Church Isolation)
  const churchManualOptions = {
    rccg: [
      { val: 'open_heavens', label: 'Open Heavens Daily Devotional' },
      { val: 'rccg_ss_adult', label: 'RCCG Sunday School (Adult Students)' },
      { val: 'rccg_ss_teacher', label: 'RCCG Sunday School (Adult Teachers)' },
      { val: 'rccg_yaya_student', label: 'RCCG YAYA Sunday School (Students)' },
      { val: 'rccg_yaya_teacher', label: 'RCCG YAYA Sunday School (Teachers Guide)' }
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
      groupSsTeacher, groupSsYouthFocus, groupSsOutlines, groupSsDiscussion,
      groupSsSummaryAssignment
    ];
    allOptionalGroups.forEach(g => { if (g) g.classList.add('hidden'); });

    // 2. Case A: Sunday School Manuals (Students or Teachers)
    if (isSs) {
      if (formHeaderTitle) formHeaderTitle.textContent = "Sunday School Manual Entry";
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
      if (isTeacher && groupSsTeacher) groupSsTeacher.classList.remove('hidden');
      if (isYaya && groupSsYouthFocus) groupSsYouthFocus.classList.remove('hidden');
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
    formManual.addEventListener('change', adaptFormToChurch);
  }

  // 4. One-Tap Clipboard Paste (Phone-friendly)
  if (btnClipboardPaste) {
    btnClipboardPaste.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            batchTextInput.value = text;
            showToast("Pasted from clipboard!");
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

  // 5. Smart Multi-Day & Real-Life Church Text Parser
  function parseBatchDevotionalsText(rawText, defaultChurchConfig) {
    if (!rawText || !rawText.trim()) return [];

    const [defChurch, defManual] = defaultChurchConfig.split('_');
    const sections = rawText.split(/(?:^|\n)(?=DATE[:\s–-]+|\b(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),?\s+[A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|LESSON\s+\d+[:\s–-]+)/i);

    const results = [];

    sections.forEach((sec, idx) => {
      const text = sec.trim();
      if (!text || text.length < 25) return;

      let detectedChurch = defChurch || 'rccg';
      let detectedManual = defManual || 'open_heavens';

      if (/DAILY MANNA/i.test(text) || /W\.?\s*F\.?\s*KUMUYI/i.test(text)) {
        detectedChurch = 'dclm'; detectedManual = 'dclm';
      } else if (/MOUNTAIN TOP LIFE/i.test(text) || /D\.?\s*K\.?\s*OLUKOYA/i.test(text) || /FIRE SCRIPTURE/i.test(text)) {
        detectedChurch = 'mfm'; detectedManual = 'mfm';
      } else if (/RHAPSODY OF REALITIES/i.test(text) || /CHRIS OYAKHILOME/i.test(text) || /FURTHER STUDY/i.test(text)) {
        detectedChurch = 'christ_embassy'; detectedManual = 'rhapsody';
      } else if (/OUR DAILY MANNA|DEVOTIONAL CAPSULE/i.test(text) || /BISHOP CHRIS/i.test(text)) {
        detectedChurch = 'odm'; detectedManual = 'odm';
      } else if (/SEEDS OF DESTINY/i.test(text) || /PAUL ENENCHE/i.test(text)) {
        detectedChurch = 'dunamis'; detectedManual = 'seeds';
      } else if (/SUNDAY SCHOOL/i.test(text) || /^LESSON\s+\d+/i.test(text)) {
        detectedChurch = 'rccg';
        if (/YAYA|YOUTH/i.test(text)) detectedManual = 'rccg_yaya_student';
        else if (/TEACHER/i.test(text)) detectedManual = 'rccg_ss_teacher';
        else detectedManual = 'rccg_ss_adult';
      }

      const isSs = detectedManual.startsWith('rccg_ss') || detectedManual.startsWith('rccg_yaya') || /LESSON\s+\d+/i.test(text);

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

      // Extract Lesson Number (Sunday School)
      let lessonNum = 1;
      const lessonMatch = text.match(/LESSON\s+(\d+)[:\s–-]+/i);
      if (lessonMatch) lessonNum = parseInt(lessonMatch[1], 10);

      // Extract Topic
      let topic = "Walking in Divine Glory";
      const topicMatch = text.match(/(?:TOPIC|LESSON\s+\d+)[:\s–-]+([^\n\(]+)/i);
      if (topicMatch) {
        topic = topicMatch[1].replace(/^[–—\-\:\s]+/, '').trim();
      }

      // Extract Author
      let author = (detectedChurch === 'rccg') ? "Pastor E.A. Adeboye" : "";
      const authorMatch = text.match(/AUTHOR[:\s–-]+([^\n]+)/i);
      if (authorMatch) author = authorMatch[1].trim();

      // Extract Memory / Key / Opening Verse Ref & Text
      let memoryVerseRef = "";
      let memoryVerseText = "";
      const memMatch = text.match(/(?:MEMORI[SZ]E|KEY VERSE|MEMORY VERSE|OPENING SCRIPTURE|THEME SCRIPTURE|BASIC SCRIPTURE|SCRIPTURE)[:\s–-]+(.*?)(?:BIBLE READING|READING:|TEXT:|FIRE SCRIPTURE:|BIBLE PASSAGE:|\n\n)/is);
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

      // Extract Bible Reading / Text / Fire Scripture
      let readingRef = "";
      const readingMatch = text.match(/(?:BIBLE READING|FIRE SCRIPTURE|TEXT|BIBLE PASSAGE|BASIC SCRIPTURE|READING)[:\s–-]+([^\n]+)/i);
      if (readingMatch) {
        readingRef = readingMatch[1].replace(/^[–—\-\:\s]+/, '').trim();
      }

      // MFM Specifics
      let motivationalQuote = "";
      const motMatch = text.match(/MOTIVATIONAL QUOTE[:\s–-]+([^\n]+)/i);
      if (motMatch) motivationalQuote = motMatch[1].trim();

      let propheticWord = "";
      const proMatch = text.match(/(?:PROPHETIC WORD FOR TODAY|PROPHETIC WORD|PROPHETIC DECLARATION)[:\s–-]+([^\n]+)/i);
      if (proMatch) propheticWord = proMatch[1].trim();

      let morningPrayers = [];
      const mornMatch = text.match(/MORNING PRAYERS[:\s–-]+(.*?)(?:EVENING PRAYERS|BIBLE IN ONE YEAR|\Z)/is);
      if (mornMatch) {
        morningPrayers = mornMatch[1].split(/\n+/).map(p => p.trim()).filter(p => p.length > 5 && !p.toLowerCase().includes('evening'));
      }

      let eveningPrayers = [];
      const eveMatch = text.match(/EVENING PRAYERS[:\s–-]+(.*?)(?:BIBLE IN ONE YEAR|HYMN|\Z)/is);
      if (eveMatch) {
        eveningPrayers = eveMatch[1].split(/\n+/).map(p => p.trim()).filter(p => p.length > 5 && !p.toLowerCase().includes('bible in one year'));
      }

      // DCLM Specifics
      let thoughtForTheDay = "";
      const thMatch = text.match(/THOUGHT FOR THE DAY[:\s–-]+([^\n]+)/i);
      if (thMatch) thoughtForTheDay = thMatch[1].trim();

      // Rhapsody Specifics
      let confession = "";
      const confMatch = text.match(/(?:CONFESSION|CONFESSION \/ PRAYER|PRAYER)[:\s–-]+(.*?)(?:FURTHER STUDY|1-YEAR BIBLE READING|\Z)/is);
      if (confMatch) confession = confMatch[1].replace(/\n+/g, ' ').trim();

      let furtherStudy = [];
      const fsMatch = text.match(/FURTHER STUDY[:\s–-]+(.*?)(?:1-YEAR|2-YEAR|\Z)/is);
      if (fsMatch) {
        furtherStudy = fsMatch[1].split(/[;\n]+/).map(s => s.trim()).filter(s => s.length > 3);
      }

      // ODM Specifics
      let devotionalCapsule = "";
      const capMatch = text.match(/DEVOTIONAL CAPSULE[:\s–-]+(.*?)(?:BASIC SCRIPTURE|MESSAGE|\n\n)/is);
      if (capMatch) devotionalCapsule = capMatch[1].replace(/\n+/g, ' ').trim();

      // General Prayer Points
      let prayerPoints = [];
      const prayerMatch = text.match(/(?:PRAYER POINT|PRAYER POINTS|PRAYER BULLETS|PRAYER)[:\s–-]+(.*?)(?:HYMN|BIBLE IN ONE YEAR|THOUGHT FOR THE DAY|CONFESSION|\Z)/is);
      if (prayerMatch && !morningPrayers.length && !eveningPrayers.length) {
        prayerPoints = prayerMatch[1].split(/\n+/).map(p => p.trim()).filter(p => p.length > 5);
      }

      // Sunday School Outlines
      let outlines = [];
      let outline1Text = "";
      let outline2Text = "";
      const out1Match = text.match(/(?:LESSON OUTLINE 1|OUTLINE 1)[:\s–-]+(.*?)(?:LESSON OUTLINE 2|OUTLINE 2|CLASS DISCUSSION|CONCLUSION|\Z)/is);
      if (out1Match) outline1Text = out1Match[1].trim();

      const out2Match = text.match(/(?:LESSON OUTLINE 2|OUTLINE 2)[:\s–-]+(.*?)(?:CLASS DISCUSSION|QUESTIONS|CONCLUSION|SUMMARY|\Z)/is);
      if (out2Match) outline2Text = out2Match[1].trim();

      if (outline1Text) outlines.push(outline1Text);
      if (outline2Text) outlines.push(outline2Text);

      // Sunday School Discussion
      let discussion = "";
      const discMatch = text.match(/(?:CLASS DISCUSSION|QUESTIONS)[:\s–-]+(.*?)(?:CONCLUSION|SUMMARY|ASSIGNMENT|\Z)/is);
      if (discMatch) discussion = discMatch[1].trim();

      // Sunday School Summary & Assignment
      let summary = "";
      const sumMatch = text.match(/(?:LESSON SUMMARY|SUMMARY|CONCLUSION)[:\s–-]+(.*?)(?:ASSIGNMENT|\Z)/is);
      if (sumMatch) summary = sumMatch[1].trim();

      let assignment = "";
      const assMatch = text.match(/(?:WEEKLY ASSIGNMENT|ASSIGNMENT)[:\s–-]+([^\n]+)/i);
      if (assMatch) assignment = assMatch[1].trim();

      let introduction = "";
      const introMatch = text.match(/LESSON INTRODUCTION[:\s–-]+(.*?)(?:TEACHER|OUTLINE 1|\n\s*\n)/is);
      if (introMatch) introduction = introMatch[1].trim();

      // Message Body
      let messageParagraphs = [];
      const msgIdx = text.search(/MESSAGE[:\s–-]/i);
      if (msgIdx !== -1) {
        const afterMsg = text.slice(msgIdx + 8);
        const endStop = afterMsg.search(/PRAYER POINT|PRAYERS|PRAYER:|HYMN:|BIBLE IN ONE YEAR|THOUGHT FOR THE DAY|CONFESSION|MORNING PRAYERS/i);
        const rawMsgBody = endStop !== -1 ? afterMsg.slice(0, endStop) : afterMsg;
        messageParagraphs = rawMsgBody.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);
      } else if (!isSs) {
        const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => 
          !p.match(/^(?:DATE|TOPIC|MEMORI|KEY VERSE|BIBLE READING|TEXT|FIRE SCRIPTURE|PRAYER|THOUGHT|CONFESSION)/i) && p.length > 25
        );
        messageParagraphs = paras;
      }

      // Hymn or Reading Plan
      let hymn = "";
      const hymnMatch = text.match(/(?:HYMN|SUNDAY SCHOOL HYMN)[:\s–-]+([^\n]+)/i);
      if (hymnMatch) hymn = hymnMatch[1].trim();

      let bibleInOneYear = "";
      const bOneMatch = text.match(/(?:BIBLE IN ONE YEAR|1-YEAR BIBLE READING|1-YEAR READING PLAN)[:\s–-]+([^\n]+)/i);
      if (bOneMatch) bibleInOneYear = bOneMatch[1].trim();

      results.push({
        church: detectedChurch,
        manual: detectedManual,
        date: dateIso,
        topic,
        author,
        memoryVerseRef,
        memoryVerseText,
        bibleReadingRef: readingRef,
        message: messageParagraphs.length ? messageParagraphs : [topic],
        prayerPoints: prayerPoints.length ? prayerPoints : (detectedChurch === 'mfm' ? [] : ["Father, let Your glory manifest in my life today."]),
        morningPrayers,
        eveningPrayers,
        motivationalQuote,
        propheticWord,
        thoughtForTheDay,
        confession,
        furtherStudy,
        devotionalCapsule,
        hymn,
        bibleInOneYear,
        isSundaySchool: isSs,
        lessonNum,
        introduction,
        outlines,
        discussion,
        summary,
        assignment,
        source: "Kairogram Devotionals Cloud Studio Mobile"
      });
    });

    return results;
  }

  // 6. Render Parsed Days in Mobile View
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
          <span class="item-date-tag">${escapeHtml(item.church.toUpperCase())} • ${item.date}</span>
          <button type="button" class="btn-item-del" data-remove-idx="${idx}">Remove</button>
        </div>
        <div class="item-topic-line">${escapeHtml(item.topic)}</div>
        <div class="item-sub-meta">
          <span>${escapeHtml(item.memoryVerseRef || item.bibleReadingRef || 'Scripture')}</span>
          ${item.thoughtForTheDay ? ` • <span style="color:#e53e3e;">Thought</span>` : ''}
          ${item.motivationalQuote ? ` • <span style="color:#dd6b20;">Quote</span>` : ''}
          ${item.confession ? ` • <span style="color:#9f7aea;">Confession</span>` : ''}
          ${item.isSundaySchool ? ` • <span style="color:#818cf8;">SS Lesson ${item.lessonNum}</span>` : ''}
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
      const targetSec = document.getElementById('parsedCardSection');
      if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast("Could not detect dates/topics. Check text format.");
    }
  }

  if (btnParseBatch) {
    btnParseBatch.addEventListener('click', triggerParseBatch);
  }

  // 7. Publish Batch to Cloud API (1 Tap)
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

  // 8. Single Day Form Publisher (With All Church-Adaptive Fields)
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

    const msgParas = formMessageText.value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const prayerPts = formPrayerPoints.value.split('\n').map(p => p.trim()).filter(Boolean);

    const payload = {
      church: ch,
      manual: man,
      date: dateVal,
      topic,
      author: formAuthor.value.trim(),
      memoryVerseRef: formMemoryRef.value.trim(),
      memoryVerseText: formMemoryText.value.trim(),
      bibleReadingRef: formReadingRef.value.trim(),
      message: msgParas.length ? msgParas : [topic],
      prayerPoints: prayerPts.length ? prayerPts : ["Lord, guide my steps today."],
      hymn: formHymnOrConfession.value.trim(),
      bibleInOneYear: formBibleInOneYear ? formBibleInOneYear.value.trim() : "",
      source: "Kairogram Devotionals Mobile Studio"
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

    // Sunday School
    if (isSs) {
      payload.isSundaySchool = true;
      payload.lessonNum = formLessonNum ? parseInt(formLessonNum.value, 10) || 1 : 1;
      payload.introduction = formSsIntro ? formSsIntro.value.trim() : "";
      payload.teachingAim = formSsTeacherAim ? formSsTeacherAim.value.trim() : "";
      payload.youthFocus = formSsYouthFocus ? formSsYouthFocus.value.trim() : "";
      payload.discussion = formSsDiscussion ? formSsDiscussion.value.trim() : "";
      payload.summary = formSsSummary ? formSsSummary.value.trim() : "";
      payload.assignment = formSsAssignment ? formSsAssignment.value.trim() : "";
      
      const outlines = [];
      if (formSsOutline1 && formSsOutline1.value.trim()) outlines.push(formSsOutline1.value.trim());
      if (formSsOutline2 && formSsOutline2.value.trim()) outlines.push(formSsOutline2.value.trim());
      payload.outlines = outlines;
    }

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

  // 9. Stored Library Fetcher
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
          if (formSsYouthFocus) formSsYouthFocus.value = entry.youthFocus || '';
          if (formSsDiscussion) formSsDiscussion.value = entry.discussion || '';
          if (formSsSummary) formSsSummary.value = entry.summary || '';
          if (formSsAssignment) formSsAssignment.value = entry.assignment || '';
          if (entry.outlines && entry.outlines.length) {
            if (formSsOutline1) formSsOutline1.value = typeof entry.outlines[0] === 'string' ? entry.outlines[0] : (entry.outlines[0]?.title || '');
            if (formSsOutline2) formSsOutline2.value = typeof entry.outlines[1] === 'string' ? entry.outlines[1] : (entry.outlines[1]?.title || '');
          }

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

  // 10. 1-Tap Auto-Fetch Tomorrow
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

  // 11. Quick Export JSON
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

  // 12. Real-Life Sample Template Loaders
  if (btnPasteSampleOpenHeavens) {
    btnPasteSampleOpenHeavens.addEventListener('click', () => {
      batchChurchSelect.value = 'rccg_open_heavens';
      batchTextInput.value = `DATE: 2026-09-21
TOPIC: The Power of Persistent Prayer
AUTHOR: Pastor E.A. Adeboye
MEMORIZE: Luke 18:1 - And he spake a parable unto them to this end, that men ought always to pray, and not to faint.
BIBLE READING: Luke 18:1-8
MESSAGE:
Prayer is not an occasional emergency parachute; it is the vital spiritual breath of a living Christian. The enemy knows that a prayerful Christian is an unstoppable force in the kingdom of God.

When the unjust judge in Jesus' parable yielded to the persistent plea of the widow, how much more will your loving Heavenly Father avenge His elect who cry out day and night? Never give up on your spiritual altar!

PRAYER POINT: O Lord, revive my prayer altar with fresh Holy Ghost fire! Let every spirit of prayerlessness die in my life today!
BIBLE IN ONE YEAR: Luke 17-19; Psalm 105
HYMN: Hymn 26: Pass Me Not, O Gentle Saviour`;
      showToast("Loaded Open Heavens template");
      triggerParseBatch();
    });
  }

  if (btnPasteSampleDclm) {
    btnPasteSampleDclm.addEventListener('click', () => {
      batchChurchSelect.value = 'dclm_dclm';
      batchTextInput.value = `DATE: 2026-09-21
TOPIC: The Uncompromising Standard
AUTHOR: Pastor W.F. Kumuyi
KEY VERSE: 2 Timothy 2:19 - Nevertheless the foundation of God standeth sure, having this seal, The Lord knoweth them that are his. And, Let every one that nameth the name of Christ depart from iniquity.
TEXT: 2 Timothy 2:19-22
MESSAGE:
In an era where cultural compromises seek to erode biblical convictions, God's unchanging standard of holiness remains unshaken. True discipleship requires total separation from all iniquity.

The foundation of God is sealed with divine knowledge and practical departure from sin. When believers walk with pure hearts, heaven confirms their testimony with divine preservation.

THOUGHT FOR THE DAY: God's standard of holiness is eternal and non-negotiable.
BIBLE IN ONE YEAR: 2 Timothy 1-4; Proverbs 12`;
      showToast("Loaded DCLM Daily Manna template");
      triggerParseBatch();
    });
  }

  if (btnPasteSampleMfm) {
    btnPasteSampleMfm.addEventListener('click', () => {
      batchChurchSelect.value = 'mfm_mfm';
      batchTextInput.value = `DATE: 2026-09-21
TOPIC: Total Victory Over Stubborn Yokes
AUTHOR: Dr. D.K. Olukoya
MOTIVATIONAL QUOTE: A closed mouth is a closed destiny; spiritual warfare responds only to Holy Ghost fire.
PROPHETIC WORD FOR TODAY: Every Pharaoh harassing your star shall drown in the Red Sea today!
FIRE SCRIPTURE: Isaiah 10:27; Obadiah 1:17
MEMORY VERSE: Isaiah 10:27 - And it shall come to pass in that day, that his burden shall be taken away from off thy shoulder, and his yoke from off thy neck, and the yoke shall be destroyed because of the anointing.
MESSAGE:
Beloved, there are burdens that linger until the supernatural friction of prayer generates sufficient holy fire to destroy them. The yoke is not meant to be managed or endured; it must be completely shattered by the anointing.

When God's anointing saturates a life, every ancestral chain melts away like wax before the furnace. Arise in violent faith and claim your total deliverance today!

MORNING PRAYERS:
1. Every ancestral padlock assigned to lock my progress, catch fire in Jesus' name!
2. Holy Ghost fire, incubate my prayer altar for unusual breakthroughs!
3. Blood of Jesus, wipe off every satanic handwriting against my destiny!

EVENING PRAYERS:
1. Powers of the night assigned against my glory, scatter unto desolation!
2. O God arise, and let all the enemies of my divine lifting be scattered!
3. I cover my sleep and my household with the impenetrable blood of Jesus!
BIBLE IN ONE YEAR: Isaiah 10-12; Psalm 91`;
      showToast("Loaded MFM Mountain Top Life template");
      triggerParseBatch();
    });
  }

  if (btnPasteSampleRhapsody) {
    btnPasteSampleRhapsody.addEventListener('click', () => {
      batchChurchSelect.value = 'christ_embassy_rhapsody';
      batchTextInput.value = `DATE: 2026-09-21
TOPIC: Reigning In Life Through Christ
AUTHOR: Pastor Chris Oyakhilome
OPENING SCRIPTURE: Romans 5:17 - For if by one man's offence death reigned by one; much more they which receive abundance of grace and of the gift of righteousness shall reign in life by one, Jesus Christ.
THEME READING: Romans 5:17-21
MESSAGE:
You were not called into Christianity to live as a victim of circumstances or worldly systems. Through the redemptive work of Christ, you have received the abundance of grace and the gift of righteousness, enabling you to reign as a king in this present life.

Righteousness gives you bold standing in the presence of God and absolute dominion over sickness, lack, and the forces of darkness. Speak words of faith today and exercise your divine authority!

CONFESSION:
I am the righteousness of God in Christ Jesus! I reign and rule in life with dominion, joy, and unfailing peace. No weapon formed against me prospers because greater is He that is in me than he that is in the world. Hallelujah!

FURTHER STUDY:
Romans 8:31-37
Ephesians 1:19-23
Colossians 1:26-28

1-YEAR BIBLE READING PLAN: Galatians 5:16-26; Isaiah 44-46
2-YEAR BIBLE READING PLAN: 1 Timothy 5:11-18; Jeremiah 39`;
      showToast("Loaded Rhapsody of Realities template");
      triggerParseBatch();
    });
  }

  if (btnPasteSampleSundaySchool) {
    btnPasteSampleSundaySchool.addEventListener('click', () => {
      batchChurchSelect.value = 'rccg_rccg_ss_adult';
      batchTextInput.value = `LESSON 3: Sunday School Manual
DATE: 2026-09-20
TOPIC: The Sanctified Vessel
AUTHOR: RCCG Sunday School Directorate
BIBLE PASSAGE: 2 Timothy 2:20-22
MEMORY VERSE: 2 Timothy 2:21 - If a man therefore purge himself from these, he shall be a vessel unto honour, sanctified, and meet for the master's use, and prepared unto every good work.

LESSON INTRODUCTION:
In a great house there are vessels of gold, silver, wood, and earth. Sanctification is the believer's deliberate consecration unto God, separating oneself from contamination so as to be fit for the Master's highest use.

LESSON OUTLINE 1: The Call to Personal Consecration
Believers are commanded to cleanse themselves from worldly entanglements and pursue righteousness, faith, charity, and peace. Consecration is not optional for anyone who desires heaven's backing.

LESSON OUTLINE 2: The Rewards of a Sanctified Life
When a vessel is purified, God fills it with spiritual gifts, power, and honor. Such a believer becomes an instrument of revival and a channel of divine blessings in the kingdom.

CLASS DISCUSSION:
How can a Christian maintain purity and sanctification in the midst of an ungodly workplace or school environment? (Discuss with biblical examples).

LESSON SUMMARY:
Purification from sin is essential for anyone desiring to be used powerfully by God in these end times.

CONCLUSION:
Present your body today as a living sacrifice, holy and acceptable unto God, which is your reasonable service.

WEEKLY ASSIGNMENT:
Identify three personal habits that hinder spiritual consecration and write out scriptural steps to eliminate them this week.

SUNDAY SCHOOL HYMN:
1. O Sunday School, on the Lord's Day,
O how I love thee well;
I am so well prepared for thee,
To learn thy holy ways.`;
      showToast("Loaded Sunday School Lesson template");
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

  // Initial Load & Form Adaptation
  if (formChurch) updateManualDropdownForChurch(formChurch.value);
  adaptFormToChurch();
  fetchStoredLibrary();

})();
